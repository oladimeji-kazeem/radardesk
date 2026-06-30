import React, { useState } from 'react';
import {
  Users, UserPlus, ShieldAlert, Check, RefreshCw, Trash2,
  ShieldCheck, CheckSquare, Settings, Mail, Lock, Key,
  Clock, Globe, Sliders, Plus, History, BookOpen, Server,
  MessageSquare, Layout, Activity, Image as ImageIcon, Star,
  Database, AlertTriangle, Grid
} from 'lucide-react';
import { User, UserRole, SystemConfig, SectorStat, PortalDeal, PortalContent } from '../types';

interface AdminPanelProps {
  users: User[];
  onUpdateUserRole: (userId: string, role: UserRole) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onApproveUser: (userId: string) => Promise<void>;
  config: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => Promise<void>;
  topicHistoryLogs: any[];
  publishedArticles: any[];
  currentUser: User;
  onAddToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  // CMS additions
  portalContent: PortalContent[];
  portalDeals: PortalDeal[];
  sectorStats: SectorStat[];
  onUpdatePortalContent: (id: string | null, data: any, isDelete?: boolean) => Promise<void>;
  onUpdatePortalDeal: (id: string | null, data: any, isDelete?: boolean) => Promise<void>;
  onUpdateSectorStat: (id: string | null, data: any, isDelete?: boolean) => Promise<void>;
}

const ALL_ROLES: UserRole[] = ['Writer', 'Editor', 'Quality Checker', 'Senior Editor', 'Admin'];

const ALL_SYSTEM_PRIVILEGES = [
  { id: 'write_draft', label: 'Create News Drafts', desc: 'Allows drafting and proposing news clusters.' },
  { id: 'edit_content', label: 'Editorial Review', desc: 'Can refine and verify draft accuracy.' },
  { id: 'approve_qa', label: 'Quality Assurance Flags', desc: 'Can approve or reject based on AI gates.' },
  { id: 'publish_live', label: 'Publish To Portal', desc: 'Senior clearance to push content to public feeds.' },
  { id: 'manage_users', label: 'Operator Management', desc: 'Can register and elevate other personnel.' },
  { id: 'manage_system', label: 'System Configurations', desc: 'Bypass level access for API and SMTP logic.' }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  onUpdateUserRole,
  onDeleteUser,
  onApproveUser,
  config,
  onUpdateConfig,
  topicHistoryLogs,
  publishedArticles,
  currentUser,
  onAddToast,
  portalContent,
  portalDeals,
  sectorStats,
  onUpdatePortalContent,
  onUpdatePortalDeal,
  onUpdateSectorStat
}) => {
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Writer');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [elevatingUserId, setElevatingUserId] = useState<string | null>(null);

  // Email/Auth Settings local state
  const [smtpHost, setSmtpHost] = useState(config.smtpSettings?.host || '');
  const [smtpPort, setSmtpPort] = useState(config.smtpSettings?.port || 587);
  const [smtpUser, setSmtpUser] = useState(config.smtpSettings?.user || '');
  const [enforceMfa, setEnforceMfa] = useState(config.authEnforcement?.requireMfa || false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(config.authEnforcement?.sessionTimeoutMinutes || 60);
  const [allowedDomainsStr, setAllowedDomainsStr] = useState((config.authEnforcement?.allowedDomains || []).join(', '));
  const [authMethod, setAuthMethod] = useState(config.authEnforcement?.authMethod || 'password');
  const [clientId, setClientId] = useState(config.authEnforcement?.oauthConfig?.clientId || '');
  const [clientSecret, setClientSecret] = useState(config.authEnforcement?.oauthConfig?.clientSecret || '');

  // Rules local state
  const [newCategory, setNewCategory] = useState('');
  const [newRejection, setNewRejection] = useState('');
  const [gateLimit, setGateLimit] = useState(config.qualityGates?.aiScoreThreshold || 75);
  const [maxCycles, setMaxCycles] = useState(config.qualityGates?.maxRejectionCycles || 3);
  const [claimMinutes, setClaimMinutes] = useState(config.qualityGates?.claimTimeoutMinutes || 30);

  // Role Privileges local state
  const [rolePrivileges, setRolePrivileges] = useState(config.rolePrivileges);

  // CMS state additions
  const [websiteSubTab, setWebsiteSubTab] = useState<'content' | 'stats' | 'deals'>('content');
  const [isCmsSubmitting, setIsCmsSubmitting] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // CMS Local Form States
  const [contentSlug, setContentSlug] = useState('hero-main');
  const [contentHeadline, setContentHeadline] = useState('');
  const [contentSubhead, setContentSubhead] = useState('');
  const [contentHeroUrl, setContentHeroUrl] = useState('');
  const [contentThumbUrl, setContentThumbUrl] = useState('');
  const [contentArticleUrl, setContentArticleUrl] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentActive, setContentActive] = useState(true);

  const [statSector, setStatSector] = useState('Travel');
  const [statMetric, setStatMetric] = useState('');
  const [statValue, setStatValue] = useState('');
  const [statUnit, setStatUnit] = useState('');
  const [statTrend, setStatTrend] = useState<'up' | 'down' | 'stable'>('up');
  const [statPulse, setStatPulse] = useState<'Nominal' | 'Active' | 'Steady' | 'Strategic' | 'Critical'>('Nominal');

  const [dealTitle, setDealTitle] = useState('');
  const [dealRoute, setDealRoute] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [dealSubtitle, setDealSubtitle] = useState('');
  const [dealImage, setDealImage] = useState('');
  const [dealCta, setDealCta] = useState('');
  const [dealExpiry, setDealExpiry] = useState('');

  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    setIsSubmittingUser(true);
    try {
      // In a real app, this would generate an invitation link
      onAddToast(`Personnel initialization successful for ${newUserName}.`, 'success');
      setNewUserName('');
      setNewUserEmail('');
      setShowAddUserForm(false);
    } catch (err) {
      onAddToast('Registration failure.', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleUpdateRoleSelected = async (userId: string, role: UserRole) => {
    try {
      await onUpdateUserRole(userId, role);
      setElevatingUserId(null);
      onAddToast('Access scope revised.', 'success');
    } catch (err) {
      onAddToast('Revision failed.', 'error');
    }
  };

  const handleDeleteUserClick = async (userId: string, name: string) => {
    if (userId === currentUser.id) return onAddToast('Self-deletion protocol blocked.', 'error');
    if (window.confirm(`Permanently drop ${name} from operational registry?`)) {
      try {
        await onDeleteUser(userId);
        onAddToast('Operator file purged.', 'success');
      } catch (err) {
        onAddToast('Purge failed.', 'error');
      }
    }
  };

  const handleTogglePrivilege = (role: UserRole, privId: string) => {
    if (role === 'Admin') return;
    const updated = rolePrivileges.map(rp => {
      if (rp.role === role) {
        const has = rp.allowedActions.includes(privId);
        return {
          ...rp,
          allowedActions: has
            ? rp.allowedActions.filter(a => a !== privId)
            : [...rp.allowedActions, privId]
        };
      }
      return rp;
    });
    setRolePrivileges(updated);
  };

  const handleSaveEmailAndAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: SystemConfig = {
      ...config,
      smtpSettings: {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: config.smtpSettings?.pass || ''
      },
      authEnforcement: {
        requireMfa: enforceMfa,
        sessionTimeoutMinutes,
        allowedDomains: allowedDomainsStr.split(',').map(s => s.trim()).filter(Boolean),
        authMethod,
        oauthConfig: {
          clientId,
          clientSecret
        }
      }
    };
    await onUpdateConfig(updatedConfig);
    onAddToast('Integration parameters synchronized.', 'success');
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    const updated: SystemConfig = {
      ...config,
      categories: [...config.categories, newCategory]
    };
    await onUpdateConfig(updated);
    setNewCategory('');
    onAddToast('Taxonomy tag added.', 'success');
  };

  const handleRemoveCategory = async (cat: string) => {
    const updated: SystemConfig = {
      ...config,
      categories: config.categories.filter(c => c !== cat)
    };
    await onUpdateConfig(updated);
    onAddToast('Taxonomy tag detached.', 'success');
  };

  const handleAddRejection = async () => {
    if (!newRejection) return;
    const reasons = config.rejectionReasons || [];
    const updated: SystemConfig = {
      ...config,
      rejectionReasons: [...reasons, newRejection]
    };
    await onUpdateConfig(updated);
    setNewRejection('');
    onAddToast('Rejection reason code registered.', 'success');
  };

  const handleRemoveRejection = async (reason: string) => {
    const updated: SystemConfig = {
      ...config,
      rejectionReasons: (config.rejectionReasons || []).filter(r => r !== reason)
    };
    await onUpdateConfig(updated);
    onAddToast('Reason code detached.', 'success');
  };

  const handleApplyRules = async () => {
    const updated: SystemConfig = {
      ...config,
      qualityGates: {
        aiScoreThreshold: gateLimit,
        maxRejectionCycles: maxCycles,
        claimTimeoutMinutes: claimMinutes
      },
      rolePrivileges: rolePrivileges
    };
    await onUpdateConfig(updated);
    onAddToast('Operational rules override applied.', 'success');
  };

  const handleTriggerDatabasePurge = async () => {
    if (resetConfirmText !== 'FLUSH') return;
    setIsResetting(true);
    // Simulate purge
    await new Promise(r => setTimeout(r, 2000));
    setIsResetting(false);
    setResetConfirmText('');
    onAddToast('System template restoration complete.', 'success');
  };

  return (
    <div className="space-y-6 text-slate-800 text-left" id="admin-management-module">

      {/* Intro Header */}
      <div className="bg-gradient-to-br from-[#1c2229] to-[#363636] rounded-2xl p-6 text-white relative overflow-hidden border border-slate-700 shadow-md">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-500/45 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">Admin Operations Space</span>
            <h2 className="text-2xl font-black font-display text-white">RadarDesk Control Hub</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Supervise platform activities, customize dynamic user permissions matrix, edit SMTP notification server configurations, adjust workspace auth filters, and control active taxonomies.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl font-mono text-[10px] space-y-1 cursor-default shrink-0">
            <p className="text-slate-400">Authenticated user: <span className="text-emerald-400 font-bold">{currentUser.name}</span></p>
            <p className="text-slate-400">Role level: <span className="text-blue-400 font-bold">{currentUser.role}</span></p>
          </div>
        </div>
      </div>

      {/* Primary Subtab selector */}
      <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-xl gap-1 border border-slate-200" id="admin-subtabs">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          id="subtab-users"
        >
          <Users className="w-4 h-4 text-slate-500" />
          <span>Operators ({users.filter(u => u.role !== 'Visitor').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('privileges')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'privileges' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          id="subtab-privileges"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Rights Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          id="subtab-settings"
        >
          <Settings className="w-4 h-4 text-blue-500" />
          <span>Integrations</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'rules' ? 'bg-white text-[#e86420] shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          id="subtab-rules"
        >
          <Sliders className="w-4 h-4 text-[#e86420]" />
          <span>Editorial Rules</span>
        </button>

        <button
          onClick={() => setActiveSubTab('topicsHistory')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'topicsHistory' ? 'bg-white text-[#363636] shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          id="subtab-history"
        >
          <History className="w-4 h-4 text-purple-500" />
          <span>Action Audit Trails</span>
        </button>

        <button
          onClick={() => setActiveSubTab('publishedHistory')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'publishedHistory' ? 'bg-white text-[#363636] shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          id="subtab-published-history"
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Published History</span>
        </button>

        <button
          onClick={() => setActiveSubTab('integrity')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'integrity' ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/50'
            }`}
          id="subtab-integrity"
        >
          <Server className="w-4 h-4 text-rose-500" />
          <span>System Integrity</span>
        </button>

        <button
          onClick={() => setActiveSubTab('visitors')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'visitors' ? 'bg-sky-50 text-sky-700 shadow-sm border border-sky-200' : 'text-sky-600 hover:text-sky-700 hover:bg-sky-50/50'
            }`}
          id="subtab-visitors"
        >
          <Globe className="w-4 h-4 text-sky-500" />
          <span>Community Visitors ({users.filter(u => u.role === 'Visitor').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('website')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${activeSubTab === 'website' ? 'bg-[#202020] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          id="subtab-website"
        >
          <Layout className="w-4 h-4 text-emerald-500" />
          <span>Website Management</span>
        </button>
      </div>

      {/* Tab content 1: USER REGISTRY */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-users-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-500" />
                <span>Personnel Directory & Access Scopes</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage operator roles, credentials, and track workspace clearance parameters.</p>
            </div>
            <button
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="px-3 py-1.5 bg-[#363636] hover:bg-[#202020] text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
              id="add-operator-btn"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddUserForm ? 'Collapse Form' : 'Register Operator'}</span>
            </button>
          </div>

          {showAddUserForm && (
            <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <UserPlus className="w-4 h-4 text-slate-500" />
                <span>Input New Operational Personnel Details</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">Full Name</label>
                  <input
                    type="text" required placeholder="e.g. Alisha Vance"
                    value={newUserName} onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase font-sans">Email Address</label>
                  <input
                    type="email" required placeholder="e.g. alisha.v@travelradar.aero"
                    value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">Access Assignment Role</label>
                  <select
                    value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono font-bold"
                  >
                    {ALL_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSubmittingUser} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5">
                  {isSubmittingUser ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Initialize Operator File</span>
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.filter(u => u.role !== 'Visitor').map(u => {
              const privsCount = rolePrivileges.find(rp => rp.role === u.role)?.allowedActions.length || 0;
              return (
                <div key={u.id} className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4 flex justify-between items-start hover:shadow-md transition-all">
                  <div className="space-y-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 border text-[#363636] text-[10px] font-black rounded-full uppercase flex items-center justify-center shrink-0">
                        {u.name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-800 truncate">{u.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-[9px] bg-sky-50 text-sky-800 border border-sky-100 font-mono font-extrabold uppercase px-1.5 py-0.5 rounded">{u.role}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteUserClick(u.id, u.name)} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: VISITOR COMMUNITY DIRECTORY */}
      {activeSubTab === 'visitors' && (() => {
        const visitors = users.filter(u => u.role === 'Visitor');
        const parsePrefs = (u: User) => {
          try { return JSON.parse(u.password || '{}'); } catch { return {}; }
        };
        return (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-visitors-section">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-500" />
                <span>Public Community Visitor Directory</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Community subscribers who joined via the public "Join Travel Radar" registration, along with their opted-in preferences.</p>
            </div>
            {visitors.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-bold">No community visitors yet</p>
                <p className="text-xs">Visitors who join via the public registration will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-xs text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200">
                      <th className="p-4">Visitor</th>
                      <th className="p-4 text-center">📧 Newsletter</th>
                      <th className="p-4 text-center">💬 WhatsApp</th>
                      <th className="p-4 text-center">👥 Groups</th>
                      <th className="p-4 text-center">Visibility</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visitors.map(v => {
                      const prefs = parsePrefs(v);
                      const visibilityColor: Record<string, string> = { Public: 'text-emerald-600 bg-emerald-50 border-emerald-100', Private: 'text-amber-600 bg-amber-50 border-amber-100', Anonymous: 'text-slate-500 bg-slate-100 border-slate-200' };
                      return (
                        <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-sky-100 text-sky-700 text-[10px] font-black rounded-full uppercase flex items-center justify-center shrink-0">
                                {v.name.substring(0, 2)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-800">{v.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{v.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {prefs.newsletter ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg leading-none">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            {prefs.whatsapp ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg leading-none">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            {prefs.groups ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 text-lg leading-none">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border font-mono ${visibilityColor[prefs.visibility] || 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                              {prefs.visibility || 'Public'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleDeleteUserClick(v.id, v.name)} className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-lg cursor-pointer transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Tab content 2: RIGHTS MATRIX */}
      {activeSubTab === 'privileges' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-privileges-section">
          <div className="border-b border-slate-150 pb-4">
            <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Role-Based Rights & Privileges Matrix</span>
            </h3>
          </div>
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-4 w-1/4">System Operational Action</th>
                  {ALL_ROLES.map(role => <th key={role} className="p-4 text-center font-mono font-bold text-[10px] uppercase">{role}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_SYSTEM_PRIVILEGES.map(privilege => (
                  <tr key={privilege.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-left">
                      <div className="font-bold text-slate-850">{privilege.label}</div>
                    </td>
                    {ALL_ROLES.map(role => {
                      const roleEntry = rolePrivileges.find(p => p.role === role);
                      const isUnlocked = roleEntry ? roleEntry.allowedActions.includes(privilege.id) : false;
                      return (
                        <td key={`${role}-${privilege.id}`} className="p-4 text-center">
                          <label className={`inline-flex items-center justify-center p-1.5 rounded-lg cursor-pointer ${isUnlocked ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-300'}`}>
                            <input type="checkbox" checked={isUnlocked} disabled={role === 'Admin'} onChange={() => handleTogglePrivilege(role, privilege.id)} className="sr-only" />
                            {isUnlocked ? <CheckSquare className="w-5 h-5 shrink-0" /> : <div className="w-5 h-5 border-2 border-slate-200 rounded shrink-0" />}
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab content 3: INTEGRATIONS */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveEmailAndAuth} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-settings-section">
          <div className="flex justify-between items-center border-b border-slate-150 pb-4">
            <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-blue-500" />
              <span>Mail Servers and Dynamic Authentication Settings</span>
            </h3>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer">Save Integration Setups</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-slate-150 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-extrabold flex items-center gap-2 border-b pb-2"><Mail className="w-4.5 h-4.5 text-blue-500" /> SMTP Integration</h4>
              <div className="space-y-4">
                <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="Host" className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono" />
                <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} placeholder="Port" className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono" />
                <input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="Username" className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono" />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab content 8: WEBSITE MANAGEMENT */}
      {activeSubTab === 'website' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-website-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#20a6eb]" />
                <span>RadarDesk Portal Content & Intelligence Management</span>
              </h3>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setWebsiteSubTab('content')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${websiteSubTab === 'content' ? 'bg-[#202020] text-white' : 'text-slate-500 hover:text-slate-800'}`}>Hero & Assets</button>
              <button onClick={() => setWebsiteSubTab('stats')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${websiteSubTab === 'stats' ? 'bg-[#202020] text-white' : 'text-slate-500 hover:text-slate-800'}`}>Intelligence Widgets</button>
              <button onClick={() => setWebsiteSubTab('deals')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${websiteSubTab === 'deals' ? 'bg-[#202020] text-white' : 'text-slate-500 hover:text-slate-800'}`}>Travel Deals</button>
            </div>
          </div>

          {websiteSubTab === 'content' && (
            <div className="space-y-6 animate-fadeIn">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsCmsSubmitting(true);
                  try {
                    const payload = {
                      slug: contentSlug,
                      headline: contentHeadline,
                      subheadline: contentSubhead,
                      hero_image_url: contentHeroUrl,
                      thumbnail_url: contentThumbUrl,
                      resource_url: contentArticleUrl,
                      description: contentDescription,
                      is_active: contentActive,
                      updated_at: new Date().toISOString()
                    };
                    await onUpdatePortalContent(editingItemId, payload);
                    setEditingItemId(null);
                    setContentHeadline(''); setContentSubhead('');
                    setContentHeroUrl(''); setContentThumbUrl('');
                    setContentArticleUrl(''); setContentDescription('');
                  } finally {
                    setIsCmsSubmitting(false);
                  }
                }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Content Key (Slug)</label>
                    <select value={contentSlug} onChange={(e) => setContentSlug(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none">
                      <option value="hero-main">Homepage Hero Main</option>
                      <option value="travel-hero">Travel Portal Hero</option>
                      <option value="aviation-hero">Aviation Portal Hero</option>
                      <option value="radar-hero">Radar Intelligence Hero</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Headline / Title Text</label>
                    <input type="text" value={contentHeadline} onChange={(e) => setContentHeadline(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Hero Image URL</label>
                    <input type="url" value={contentHeroUrl} onChange={(e) => setContentHeroUrl(e.target.value)} placeholder="https://..." className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-1"><BookOpen className="w-3 h-3 text-[#20a6eb]" /> Article URL (for Read Full Story)</label>
                    <input type="text" value={contentArticleUrl} onChange={(e) => setContentArticleUrl(e.target.value)} placeholder="/article/article-id or /travel etc." className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#20a6eb] font-mono" />
                    <p className="text-[9px] text-slate-400">When set, clicking the hero image or 'Read Full Story' navigates here.</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-black uppercase">Short Description / Excerpt</label>
                  <textarea value={contentDescription} onChange={(e) => setContentDescription(e.target.value)} rows={2} placeholder="Brief description shown on the hero card..." className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none resize-none" />
                </div>
                <div className="flex justify-end shadow-xs">
                  <button type="submit" disabled={isCmsSubmitting} className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl">Save Hero Content</button>
                </div>
              </form>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {portalContent.map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4">
                    <div className="w-24 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                      <img src={item.thumbnail_url || item.hero_image_url || item.thumbnailUrl || item.resourceUrl} alt="Fragment" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-black text-slate-800 truncate">{item.headline || item.title}</h5>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{item.slug || item.contentType}</p>
                      {(item.resource_url || item.resourceUrl) && (
                        <a href={item.resource_url || item.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#20a6eb] font-mono truncate block hover:underline mt-0.5">
                          🔗 {item.resource_url || item.resourceUrl}
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => onUpdatePortalContent(item.id, null, true)}
                      className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-lg cursor-pointer transition-all shrink-0 self-start"
                      title="Delete hero item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {websiteSubTab === 'stats' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" value={statMetric} onChange={(e) => setStatMetric(e.target.value)} placeholder="Metric Name" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs" />
                  <input type="text" value={statValue} onChange={(e) => setStatValue(e.target.value)} placeholder="Value" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs" />
                  <button onClick={() => onUpdateSectorStat(null, { sector: statSector, metric_name: statMetric, metric_value: statValue, trend: statTrend, pulse_status: statPulse })} className="bg-emerald-600 text-white rounded-xl text-xs font-black">Add Widget Stat</button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sectorStats.map(stat => (
                  <div key={stat.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <h5 className="text-xs font-black">{stat.metric_name}</h5>
                      <p className="text-lg font-black text-rose-500">{stat.metric_value} {stat.metric_unit}</p>
                    </div>
                    <button onClick={() => onUpdateSectorStat(stat.id, null, true)} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {websiteSubTab === 'deals' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {portalDeals.map(deal => (
                  <div key={deal.id} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4">
                    <img src={deal.image_url} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h5 className="text-xs font-black">{deal.title}</h5>
                      <p className="text-emerald-600 font-black">{deal.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab content 9: SYSTEM INTEGRITY */}
      {activeSubTab === 'integrity' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-integrity-section">
          <div className="border-b border-[#faf9f0] pb-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-rose-500" />
              <span>Interactive System Integrity & Reset Console</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 mb-2">
                <Grid className="w-4 h-4 text-[#20a6eb]" />
                <span>System Health Monitor</span>
              </h4>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] flex justify-between">
                <span>Database Connectivity</span>
                <span className="text-emerald-600 font-bold">ONLINE</span>
              </div>
            </div>
            <div className="border border-red-200 bg-red-50/20 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-rose-800 mb-2">Reset All Database States</h4>
              <input
                type="text" placeholder="Type FLUSH..." value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                className="w-full border border-red-200 bg-white rounded-lg p-2 text-xs outline-none"
              />
              <button onClick={handleTriggerDatabasePurge} disabled={resetConfirmText !== 'FLUSH' || isResetting} className={`w-full py-2 rounded-xl text-xs font-bold text-white ${resetConfirmText === 'FLUSH' ? 'bg-rose-600' : 'bg-slate-350 opacity-40'}`}>
                Wipe All Databases
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
