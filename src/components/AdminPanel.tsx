import React, { useState } from 'react';
import { User, WorkflowConfig, UserRole, EmailSettings, AuthSettings, RolePrivilege, Article } from '../types';
import { 
  Settings, 
  Users, 
  Sliders, 
  ShieldCheck, 
  History, 
  Plus, 
  Trash2, 
  Check,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  RefreshCw,
  UserPlus,
  Database,
  Grid,
  ShieldAlert,
  Server,
  Mail,
  Key,
  Lock,
  Clock,
  Globe,
  CheckSquare
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  config: WorkflowConfig;
  topicHistoryLogs: any[];
  articles: Article[];
  onUpdateRole: (userId: string, targetRole: UserRole) => Promise<void>;
  onUpdateConfig: (newConfig: Partial<WorkflowConfig>) => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  onAddUser: (name: string, email: string, role: UserRole) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onResetDatabase: () => Promise<void>;
  onRefresh?: () => void;
}

const ALL_SYSTEM_PRIVILEGES = [
  { id: 'propose_topic', label: 'Propose Travel Briefs', desc: 'Capable of creating and offering proposed subjects into the central ideation pool.' },
  { id: 'claim_topic', label: 'Claim Assignments', desc: 'Allows claiming open briefs from the active workspace queues.' },
  { id: 'submit_article', label: 'Submit Drafts', desc: 'Can assemble, edit, and forward drafts to editor review boards.' },
  { id: 'review_article', label: 'Approve & Reject Drafts', desc: 'Grants authority to inspect pending drafts, issue revisions, or reject.' },
  { id: 'quality_audit', label: 'Perform Quality Checklists', desc: 'Inspects AI safety checks and validates factual accuracy thresholds.' },
  { id: 'publish_live', label: 'Publish to Feed', desc: 'Provides final deployment clearance onto the live RadarDesk release board.' },
  { id: 'manage_system', label: 'Configure System Settings', desc: 'Has complete clearance to touch SMTP servers, adjust Auth constraints, and customize dictionaries.' }
];

const ALL_ROLES: UserRole[] = ['Writer', 'Editor', 'Senior Editor', 'Quality Checker', 'Publisher', 'Admin'];

export default function AdminPanel({
  currentUser,
  users,
  config,
  topicHistoryLogs,
  articles,
  onUpdateRole,
  onUpdateConfig,
  onAddToast,
  onAddUser,
  onDeleteUser,
  onResetDatabase,
  onRefresh
}: AdminPanelProps) {
  // Tabs: users | privileges | settings | rules | topicsHistory | publishedHistory | danger
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'privileges' | 'settings' | 'rules' | 'topicsHistory' | 'publishedHistory' | 'danger'>('users');
  const [elevatingUserId, setElevatingUserId] = useState<string | null>(null);
  
  const publishedArticles = articles ? articles.filter(art => art.status === 'Published') : [];
  
  // Rule edit form states
  const [gateLimit, setGateLimit] = useState(config.aiScoreThreshold);
  const [maxCycles, setMaxCycles] = useState(config.maxReviewCycles);
  const [claimMinutes, setClaimMinutes] = useState(config.claimDurationMinutes);

  // User additions form states
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Writer');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Custom Category & Rejection Reason states
  const [newCategory, setNewCategory] = useState('');
  const [newRejection, setNewRejection] = useState('');

  // Reset database state verification
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // User registration approvals state
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);

  const handleApproveUser = async (userId: string) => {
    setApprovingUserId(userId);
    try {
      const res = await fetch(`/api/users/${userId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onAddToast(data.message || 'Access granted: approved user registration successfully!', 'success');
        if (onRefresh) onRefresh();
      } else {
        onAddToast(data.error || 'Failed to approve registration.', 'error');
      }
    } catch {
      onAddToast('Network error while executing user approval.', 'error');
    } finally {
      setApprovingUserId(null);
    }
  };

  // Email Notification Settings Form states
  const [smtpHost, setSmtpHost] = useState(config.emailSettings?.smtpHost || 'smtp.radardesk.com');
  const [smtpPort, setSmtpPort] = useState(config.emailSettings?.smtpPort || 587);
  const [smtpUser, setSmtpUser] = useState(config.emailSettings?.smtpUser || 'operations@radardesk.com');
  const [smtpSecure, setSmtpSecure] = useState(config.emailSettings?.smtpSecure ?? true);
  const [senderName, setSenderName] = useState(config.emailSettings?.senderName || 'RadarDesk Ops Office');
  const [senderEmail, setSenderEmail] = useState(config.emailSettings?.senderEmail || 'operations@radardesk.com');
  const [digestEnabled, setDigestEnabled] = useState(config.emailSettings?.digestEnabled ?? true);
  const [digestFrequency, setDigestFrequency] = useState(config.emailSettings?.digestFrequency || 'daily');

  // Authentication & Security Settings fields
  const [authType, setAuthType] = useState<AuthSettings['authType']>(config.authSettings?.authType || 'password');
  const [clientId, setClientId] = useState(config.authSettings?.clientId || 'rd-oauth-client-id-123');
  const [clientSecret, setClientSecret] = useState(config.authSettings?.clientSecret || '••••••••••••••••••••');
  const [enforceMfa, setEnforceMfa] = useState(config.authSettings?.enforceMfa ?? false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(config.authSettings?.sessionTimeoutMinutes || 60);
  const [allowedDomainsStr, setAllowedDomainsStr] = useState((config.authSettings?.allowedDomains || ['travelradar.com', 'radardesk.com']).join(', '));

  // Role Privileges state
  const rolePrivileges: RolePrivilege[] = config.rolePrivileges || [
    { role: 'Writer', allowedActions: ['propose_topic', 'claim_topic', 'submit_article'] },
    { role: 'Editor', allowedActions: ['propose_topic', 'claim_topic', 'review_article'] },
    { role: 'Senior Editor', allowedActions: ['propose_topic', 'claim_topic', 'review_article', 'publish_live'] },
    { role: 'Quality Checker', allowedActions: ['quality_audit'] },
    { role: 'Publisher', allowedActions: ['publish_live'] },
    { role: 'Admin', allowedActions: ['propose_topic', 'claim_topic', 'submit_article', 'review_article', 'quality_audit', 'publish_live', 'manage_system'] }
  ];

  const handleApplyRules = async () => {
    try {
      await onUpdateConfig({
        aiScoreThreshold: Number(gateLimit),
        maxReviewCycles: Number(maxCycles),
        claimDurationMinutes: Number(claimMinutes),
      });
      onAddToast('Workflow configuration limits compiled and updated successfully!', 'success');
    } catch {
      onAddToast('Error modifying configuration specs.', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = newUserEmail.trim().toLowerCase();
    
    if (!newUserName.trim() || !emailLower) {
      onAddToast('Please fill out all operator profile fields.', 'warning');
      return;
    }

    if (!emailLower.endsWith('@travelradar.com')) {
      onAddToast('Operational Gating Policy: Only official organization email accounts (@travelradar.com) are permitted in RadarDesk Operations.', 'error');
      return;
    }
    
    setIsSubmittingUser(true);
    try {
      await onAddUser(newUserName, emailLower, newUserRole);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('Writer');
      setShowAddUserForm(false);
    } catch {
      onAddToast('Fatal: Failed to register user profile on active server.', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUserClick = async (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      onAddToast('Operational block: You are currently authenticated as this profile and cannot self-terminate.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently drop "${userName}" from the active workspace? This acts as an irreversible termination.`)) {
      try {
        await onDeleteUser(userId);
      } catch {
        onAddToast('Failed to drop participant profile.', 'error');
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (config.categories.includes(newCategory)) {
      onAddToast('Category already exists.', 'warning');
      return;
    }
    const updatedCats = [...config.categories, newCategory];
    try {
      await onUpdateConfig({ categories: updatedCats });
      setNewCategory('');
      onAddToast(`Channel category "${newCategory}" successfully created in topic dictionary.`, 'success');
    } catch {
      onAddToast('Could not register category.', 'error');
    }
  };

  const handleRemoveCategory = async (cat: string) => {
    const updatedCats = config.categories.filter(c => c !== cat);
    try {
      await onUpdateConfig({ categories: updatedCats });
      onAddToast(`Channel category "${cat}" dropped successfully.`, 'info');
    } catch {
      onAddToast('Could not drop category.', 'error');
    }
  };

  const handleAddRejection = async () => {
    if (!newRejection.trim()) return;
    const currentList = config.rejectionReasons || [];
    if (currentList.includes(newRejection)) {
      onAddToast('This rejection code exists in active dictionaries.', 'warning');
      return;
    }
    const updatedRejections = [...currentList, newRejection];
    try {
      await onUpdateConfig({ rejectionReasons: updatedRejections });
      setNewRejection('');
      onAddToast(`Rejection condition "${newRejection}" mapped into workflow rulebook.`, 'success');
    } catch {
      onAddToast('Could not register rejection reason.', 'error');
    }
  };

  const handleRemoveRejection = async (reason: string) => {
    const currentList = config.rejectionReasons || [];
    const updatedRejections = currentList.filter(r => r !== reason);
    try {
      await onUpdateConfig({ rejectionReasons: updatedRejections });
      onAddToast(`Rejection mapped condition "${reason}" successfully pruned.`, 'info');
    } catch {
      onAddToast('Could not drop rejection category.', 'error');
    }
  };

  const handleUpdateRoleSelected = async (userId: string, newRole: UserRole) => {
    try {
      await onUpdateRole(userId, newRole);
      setElevatingUserId(null);
    } catch {
      onAddToast('SLA Lock: Could not re-assign workspace permissions of selected profile.', 'error');
    }
  };

  const handleTriggerDatabasePurge = async () => {
    if (resetConfirmText !== 'FLUSH') return;
    setIsResetting(true);
    try {
      await onResetDatabase();
      setResetConfirmText('');
      onAddToast('System database states successfully flashed to default templates.', 'success');
    } catch {
      onAddToast('Could not run system schema flash utility.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Toggle user privileges
  const handleTogglePrivilege = async (role: UserRole, action: string) => {
    const updatedPrivileges = rolePrivileges.map(priv => {
      if (priv.role === role) {
        const hasIt = priv.allowedActions.includes(action);
        const nextActions = hasIt 
          ? priv.allowedActions.filter(a => a !== action) 
          : [...priv.allowedActions, action];
        return { ...priv, allowedActions: nextActions };
      }
      return priv;
    });

    try {
      await onUpdateConfig({ rolePrivileges: updatedPrivileges });
      onAddToast(`Allowed actions adjusted for role "${role}" in system policies!`, 'success');
    } catch {
      onAddToast('Error modifying privileges map.', 'error');
    }
  };

  // Save SMTP Email Notification and Active Authentication Settings
  const handleSaveEmailAndAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse domains safely
    const domains = allowedDomainsStr
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0);

    const emailSettings: EmailSettings = {
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      smtpSecure,
      senderName,
      senderEmail,
      digestEnabled,
      digestFrequency: digestFrequency as EmailSettings['digestFrequency']
    };

    const authSettings: AuthSettings = {
      authType,
      clientId,
      clientSecret,
      enforceMfa,
      sessionTimeoutMinutes: Number(sessionTimeoutMinutes),
      allowedDomains: domains
    };

    try {
      await onUpdateConfig({
        emailSettings,
        authSettings
      });
      onAddToast('Application Email Integration & Related Authentication settings saved successfully!', 'success');
    } catch {
      onAddToast('Failed to apply secure configuration overrides.', 'error');
    }
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
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
            activeSubTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="subtab-users"
        >
          <Users className="w-4 h-4 text-slate-500" />
          <span>Operators ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('privileges')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
            activeSubTab === 'privileges' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="subtab-privileges"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Rights & Privileges Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
            activeSubTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="subtab-settings"
        >
          <Settings className="w-4 h-4 text-blue-500" />
          <span>Email & Authentication Config</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
            activeSubTab === 'rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="subtab-rules"
        >
          <Sliders className="w-4 h-4 text-[#e86420]" />
          <span>Workflow Rules & Taxonomies</span>
        </button>

        <button
          onClick={() => setActiveSubTab('topicsHistory')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
            activeSubTab === 'topicsHistory' ? 'bg-white text-[#363636] shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="subtab-history"
        >
          <History className="w-4 h-4 text-purple-500" />
          <span>Action Audit Trails</span>
        </button>

        <button
          onClick={() => setActiveSubTab('publishedHistory')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
            activeSubTab === 'publishedHistory' ? 'bg-white text-[#363636] shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="subtab-published-history"
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Published History</span>
        </button>

        <button
          onClick={() => setActiveSubTab('danger')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
            activeSubTab === 'danger' ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/50'
          }`}
          id="subtab-danger"
        >
          <Server className="w-4 h-4 text-rose-500" />
          <span>System Diagnostics</span>
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

          {/* ADD USER COLLAPSIBLE */}
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
                    type="text"
                    required
                    placeholder="e.g. Alisha Vance"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                    id="new-user-fullname"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase font-sans">Email Address (TravelRadar Address)</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alisha.v@travelradar.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                    id="new-user-email"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">Access Assignment Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono font-bold"
                    id="new-user-role"
                  >
                    {ALL_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                  id="submit-new-user-btn"
                >
                  {isSubmittingUser ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Initialize Operator File</span>
                </button>
              </div>
            </form>
          )}

          {/* Pending Registrations Room */}
          {users.some(u => u.approved === false) && (
            <div className="bg-amber-55/40 border border-amber-200/80 rounded-2xl p-5 space-y-3.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-extrabold text-amber-800">Pending Registration Approval Requests ({users.filter(u => u.approved === false).length})</h4>
                  <p className="text-[10px] text-amber-600">These operators signed up on the portal. Review and approve license rights to unlock account access.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {users.filter(u => u.approved === false).map(u => (
                  <div key={u.id} className="bg-white border border-amber-150 rounded-xl p-4 flex justify-between items-center shadow-3xs hover:border-amber-300 transition-all">
                    <div className="space-y-1 text-left">
                      <p className="font-extrabold text-slate-800 text-xs">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{u.email}</p>
                      <span className="inline-block text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                        Requested Role: {u.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApproveUser(u.id)}
                      disabled={approvingUserId === u.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {approvingUserId === u.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Approve Access</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directory Listings */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-left">Authorized Operational License Directory ({users.filter(u => u.approved !== false).length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.filter(u => u.approved !== false).map(u => {
                const uPrivsEntry = rolePrivileges.find(p => p.role === u.role);
                const privsCount = uPrivsEntry ? uPrivsEntry.allowedActions.length : 0;
                return (
                  <div 
                    key={u.id}
                    className="flex border border-slate-150 rounded-2xl p-4 justify-between items-center bg-white hover:border-slate-200 hover:shadow-xs transition-colors animate-fadeIn"
                    id={`operator-node-${u.id}`}
                  >
                    <div className="space-y-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 border text-[#363636] text-[10px] font-black rounded-full uppercase flex items-center justify-center shrink-0 font-display">
                          {u.name.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-800 truncate">{u.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1.5">
                        <span className="text-[9px] bg-sky-50 text-sky-800 border border-sky-100 font-mono font-extrabold uppercase px-1.5 py-0.5 rounded">
                          {u.role}
                        </span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-mono px-1.5 py-0.5 rounded" title="Allowed privileges assigned">
                          {privsCount} active privileges
                        </span>
                      </div>
                    </div>

                    {/* Operational Elevate/Drop Controls */}
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {elevatingUserId === u.id ? (
                        <select
                          onChange={(e) => handleUpdateRoleSelected(u.id, e.target.value as UserRole)}
                          defaultValue={u.role}
                          className="bg-white border text-xs font-mono font-bold p-1 rounded-lg"
                          id={`reassign-role-select-${u.id}`}
                        >
                          {ALL_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setElevatingUserId(u.id)}
                          className="text-[10px] hover:underline text-[#20a6eb] font-bold font-mono cursor-pointer"
                          id={`reassign-trigger-${u.id}`}
                        >
                          Change Role
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteUserClick(u.id, u.name)}
                        className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer transition-all border border-transparent hover:border-rose-200"
                        title="Drop operator from file directories"
                        id={`operator-delete-${u.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab content 2: RIGHTS & PRIVILEGES MATRIX */}
      {activeSubTab === 'privileges' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-privileges-section">
          
          <div className="border-b border-slate-150 pb-4">
            <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Role-Based Rights & Privileges Matrix</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Define which functional actions are allowed for each specific operator role. Admin roles bypass all system restriction modules.</p>
          </div>

          {/* Interactive Checkbox Grid/Matrix */}
          <div className="overflow-x-auto border border-slate-150 rounded-2xl" id="privilege-interactive-matrix">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-4 w-1/4">System Operational Action</th>
                  {ALL_ROLES.map(role => (
                    <th key={role} className="p-4 text-center font-mono font-bold text-[10px] uppercase">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_SYSTEM_PRIVILEGES.map(privilege => (
                  <tr key={privilege.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-left">
                      <div className="font-bold text-slate-850">{privilege.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 whitespace-normal max-w-sm">{privilege.desc}</div>
                    </td>
                    
                    {ALL_ROLES.map(role => {
                      const roleEntry = rolePrivileges.find(p => p.role === role);
                      const isUnlocked = roleEntry ? roleEntry.allowedActions.includes(privilege.id) : false;
                      const isAdmin = role === 'Admin';
                      const isControlDisabled = isAdmin; // Admin cannot have their privileges removed to avoid lockouts

                      return (
                        <td key={`${role}-${privilege.id}`} className="p-4 text-center">
                          <label className={`inline-flex items-center justify-center p-1.5 rounded-lg cursor-pointer transition-all ${
                            isUnlocked 
                              ? 'text-emerald-600 hover:bg-emerald-50 bg-emerald-50/30' 
                              : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                          }`}>
                            <input
                              type="checkbox"
                              checked={isUnlocked}
                              disabled={isControlDisabled}
                              onChange={() => handleTogglePrivilege(role, privilege.id)}
                              className="sr-only"
                            />
                            {isUnlocked ? (
                              <CheckSquare className="w-5 h-5 shrink-0" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-slate-200 rounded hover:border-slate-400 shrink-0" />
                            )}
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-sky-50 border border-sky-150 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-sky-800 leading-relaxed">
              <strong>SLA Configuration Note:</strong> Changes to roles and privileges are compiled dynamically in memory on the backend directory server and stored inside <code className="bg-sky-100/80 px-1 py-0.5 rounded font-mono text-[10px]">db.json</code>. Changing these configurations will immediately enable/disable corresponding interactive buttons on the front-end workflows for writers, editors, quality checkers, and publication desks.
            </div>
          </div>

        </div>
      )}

      {/* Tab content 3: SMTP Settings & Authentication Settings */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveEmailAndAuth} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-settings-section">
          
          <div className="flex justify-between items-center border-b border-slate-150 pb-4">
            <div>
              <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-blue-500" />
                <span>Mail Servers and Dynamic Authentication Settings</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Control global application integrations. Touch email notification relays and safety authentication keys with full validation.</p>
            </div>
            
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm shrink-0 flex items-center gap-1.5"
              id="save-settings-submit"
            >
              <Check className="w-4 h-4" />
              <span>Save Integration Setups</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* SMTP Settings Panel */}
            <div className="border border-slate-150 rounded-2xl p-5 space-y-4 text-left">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Mail className="w-4.5 h-4.5 text-blue-500" />
                <span>SMTP Mail Delivery Server Integration</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">SMTP Relay Server Host</label>
                  <input
                    type="text"
                    required
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="e.g. smtp.radardesk.com"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono"
                    id="smtp-host"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">Port Number</label>
                  <input
                    type="number"
                    required
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    placeholder="e.g. 587"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono"
                    id="smtp-port"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase">SMTP Authenticated Username</label>
                <input
                  type="text"
                  required
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="e.g. operations@radardesk.com"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono"
                  id="smtp-user"
                />
              </div>

              <div className="flex items-center space-x-2 bg-slate-50/70 p-3 rounded-xl border border-slate-150">
                <input
                  type="checkbox"
                  id="smtpSecure"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="smtpSecure" className="text-xs text-slate-600 select-none cursor-pointer font-medium">
                  Enforce Secure Connection Standard (TLS/SSL Handshake protocols)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">Sender Name Mask</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="RadarDesk Office"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400"
                    id="sender-name-mask"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-extrabold uppercase">Sender Email Address</label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="ops@radardesk.com"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono"
                    id="sender-email"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-600 font-bold select-none cursor-pointer flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={digestEnabled}
                      onChange={(e) => setDigestEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Deploy Weekly/Daily Digests Feed</span>
                  </label>
                </div>
                {digestEnabled && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide block font-extrabold">Dispatch Frequency:</span>
                    <select
                      value={digestFrequency}
                      onChange={(e) => setDigestFrequency(e.target.value)}
                      className="bg-white border rounded-xl p-2 text-xs w-full text-slate-700 font-sans font-bold"
                      id="digest-frequency-select"
                    >
                      <option value="instantly">Post instantly per single draft revision</option>
                      <option value="daily">Trigger daily operations digest summary</option>
                      <option value="weekly">Draft weekly performance SLA aggregates</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Authentication and Security Settings Panel */}
            <div className="border border-slate-150 rounded-2xl p-5 space-y-4 text-left">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Lock className="w-4.5 h-4.5 text-emerald-500" />
                <span>Security Authentication Strategy Panel</span>
              </h4>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase mb-1 block">Active Authentication Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['password', 'oauth2', 'sso'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAuthType(mode)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold font-mono transition-all uppercase cursor-pointer ${
                        authType === mode 
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-2 ring-emerald-100/80' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                      id={`auth-btn-${mode}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {authType !== 'password' && (
                <div className="space-y-3.5 bg-slate-50/40 border border-slate-150 p-4 rounded-2xl animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>Security Client Client ID:</span>
                    </span>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono"
                      placeholder="OAuth client identifier code"
                      id="auth-client-id"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-300" />
                      <span>Security Client Client Secret:</span>
                    </span>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono"
                      placeholder="OAuth client secret hash pass"
                      id="auth-client-secret"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-1">
                
                <div className="flex items-center space-x-2 bg-slate-50/70 p-3 rounded-xl border border-slate-150">
                  <input
                    type="checkbox"
                    id="enforceMfa"
                    checked={enforceMfa}
                    onChange={(e) => setEnforceMfa(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="enforceMfa" className="text-xs text-slate-600 select-none cursor-pointer font-medium flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    <span>Enforce Multi-Factor Authentication (MFA Login prompts)</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Session Idle Timeout Constraint (Minutes)</span>
                  </span>
                  <input
                    type="number"
                    value={sessionTimeoutMinutes}
                    onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono font-bold"
                    id="auth-timeout"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Authorized Workspace Domains (Comma Separated)</span>
                  </span>
                  <input
                    type="text"
                    value={allowedDomainsStr}
                    onChange={(e) => setAllowedDomainsStr(e.target.value)}
                    placeholder="e.g. travelradar.com, radardesk.com"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-slate-400 font-mono"
                    id="auth-allowed-domains"
                  />
                  <p className="text-[10px] text-slate-400">Only emails matching those host extensions are allowed back-end token registrations.</p>
                </div>

              </div>

            </div>

          </div>

          <div className="bg-[#fffbfa] border border-[#f3ebde] p-4 rounded-xl text-[11px] text-slate-500 leading-relaxed flex items-center gap-3">
            <Server className="w-5 h-5 text-[#e86420] shrink-0" />
            <span>These parameters are securely persistent and loaded onto the server memory scope during every platform boot.</span>
          </div>

        </form>
      )}

      {/* Tab content 4: RULES CONFIGURATION */}
      {activeSubTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-rules-section">
          
          <div className="border-b border-slate-150 pb-4">
            <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#e86420]" />
              <span>Editorial Rules & Taxonomies Configuration</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Adjust quality thresholds and configure valid categories.</p>
          </div>

          {/* SLA rule numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="rules-input-row">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-extrabold text-[#363636] uppercase tracking-wide">Target AI Safe Gate Score (0-100)</label>
              <input
                type="number"
                min="30"
                max="95"
                value={gateLimit}
                onChange={(e) => setGateLimit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none font-bold"
                id="rules-ai-score-gate"
              />
              <p className="text-[10px] text-slate-400 mt-1">Under-performance score blocks publication.</p>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-extrabold text-[#363636] uppercase tracking-wide">Max Review Reject Chains</label>
              <input
                type="number"
                min="1"
                max="5"
                value={maxCycles}
                onChange={(e) => setMaxCycles(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none font-bold"
                id="rules-review-cycles"
              />
              <p className="text-[10px] text-slate-400 mt-1">Escalates automatically on expiration.</p>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-extrabold text-[#363636] uppercase tracking-wide">Claim Duration Limits (Minutes)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={claimMinutes}
                onChange={(e) => setClaimMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none font-bold"
                id="rules-claim-timeout"
              />
              <p className="text-[10px] text-slate-400 mt-1">Briefs autocheck back to open pools.</p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-b border-slate-100 pb-5">
            <button
              onClick={handleApplyRules}
              className="px-5 py-2.5 bg-[#e86420] hover:bg-[#d05315] text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1"
              id="save-rules-btn"
            >
              <Check className="w-4 h-4" />
              <span>Apply Operational Rules Override</span>
            </button>
          </div>

          {/* Mapped Categories & Rejections lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="taxonomy-columns-row">
            
            {/* Travel category tags */}
            <div className="space-y-3.5 text-left bg-slate-50 p-5 rounded-2xl border border-slate-150">
              <h4 className="text-xs font-black text-slate-800 flex items-center justify-between">
                <span>Active Travel Channel Categories</span>
                <span className="text-[9px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded font-mono">
                  {config.categories.length} Tags
                </span>
              </h4>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Insert category e.g. Adventure Travel, Cruise Ops"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none"
                  id="category-add-input"
                />
                <button
                  onClick={handleAddCategory}
                  className="p-2 bg-[#363636] hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer flex items-center text-xs"
                  id="category-add-btn"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1" id="category-tags-pool">
                {config.categories.map(cat => (
                  <span 
                    key={cat} 
                    className="inline-flex items-center space-x-1.5 bg-white border border-slate-205 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg shadow-2xs"
                    id={`cat-badge-${cat}`}
                  >
                    <span>{cat}</span>
                    <button 
                      onClick={() => handleRemoveCategory(cat)} 
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded p-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Custom Rejection Reasons */}
            <div className="space-y-3.5 text-left bg-slate-50 p-5 rounded-2xl border border-slate-150">
              <h4 className="text-xs font-black text-slate-800 flex items-center justify-between">
                <span>Active QA Flag Rejection Reasons</span>
                <span className="text-[9px] bg-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded font-mono">
                  {(config.rejectionReasons || []).length} Codes
                </span>
              </h4>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Insert rule condition e.g. Copyright concern"
                  value={newRejection}
                  onChange={(e) => setNewRejection(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none"
                  id="rejection-add-input"
                />
                <button
                  onClick={handleAddRejection}
                  className="p-2 bg-[#363636] hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer flex items-center text-xs"
                  id="rejection-add-btn"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1" id="rejection-reasons-pool">
                {(config.rejectionReasons || []).map(reason => (
                  <span 
                    key={reason} 
                    className="inline-flex items-center space-x-1.5 bg-white border border-red-100 text-rose-800 text-[10px] font-mono px-2 py-1 rounded-lg"
                    id={`reason-badge-${reason}`}
                  >
                    <span>{reason}</span>
                    <button 
                      onClick={() => handleRemoveRejection(reason)} 
                      className="text-rose-600 hover:text-rose-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab content 5: SYSTEM MODERATION AND AUDIT TRAIL LOGS */}
      {activeSubTab === 'topicsHistory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-history-section">
          
          <div className="border-b border-[#faf9f0] pb-4">
            <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
              <History className="w-4 h-4 text-purple-500" />
              <span>Ideation & Concept Verification History logs</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Full audit logs trace proposal origins, approval, or dynamic workflow revisions.</p>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-2 border rounded-2xl border-slate-100" id="histories-scroll-wrapper">
            {topicHistoryLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No topic moderation steps recorded inside operational channels yet.
              </div>
            ) : (
              topicHistoryLogs.map((log, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors text-xs text-left space-y-2 font-sans" id={`hist-log-${i}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <strong className="text-[#363636] font-extrabold text-xs block sm:inline mr-2">Topic: "{log.topicTitle}"</strong>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide uppercase ${
                        log.action === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        log.action === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        log.action === 'Released' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.action}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    <span className="font-semibold block sm:inline text-slate-705">Actor:</span> {log.reviewer} ({log.reviewerRole}) 
                    {log.comments && (
                      <p className="mt-1.5 italic bg-[#fafaf8] p-2 rounded border border-slate-100 text-slate-600">
                        "{log.comments}"
                      </p>
                    )}
                    {log.reasons && log.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {log.reasons.map((r: string) => (
                          <span key={r} className="bg-red-50 text-red-700 text-[9px] px-1.5 rounded border border-red-100">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* Tab content 7: PUBLISHED HISTORY */}
      {activeSubTab === 'publishedHistory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-published-history-section">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-[#363636] text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Published Articles Archive & Logs</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Chronological record of officially published articles, tracking original author delivery and senior editor credentials.</p>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-bold">Article Title</th>
                    <th className="p-4 font-bold">Author</th>
                    <th className="p-4 font-bold">Published Date</th>
                    <th className="p-4 font-bold">Senior Editor Approval Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {publishedArticles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 text-xs italic">
                        No articles have been officially published on RadarDesk yet.
                      </td>
                    </tr>
                  ) : (
                    publishedArticles.map(art => {
                      // Find publication timestamp
                      const pubEvent = art.history?.find(h => h.action === 'Published');
                      const pubDateStr = pubEvent ? new Date(pubEvent.timestamp).toLocaleDateString() + ' ' + new Date(pubEvent.timestamp).toLocaleTimeString() : new Date(art.updatedAt).toLocaleDateString();
                      
                      // Find senior editor approval event
                      const seApprovalEvent = art.history?.find(h => h.action === 'Approved' && h.actorRole === 'Senior Editor');
                      const seApprovalTimeStr = seApprovalEvent 
                        ? `${new Date(seApprovalEvent.timestamp).toLocaleDateString()} ${new Date(seApprovalEvent.timestamp).toLocaleTimeString()} (by ${seApprovalEvent.actorName})`
                        : (art.history?.find(h => h.action === 'Approved') 
                            ? `${new Date(art.history.find(h => h.action === 'Approved')!.timestamp).toLocaleDateString()} ${new Date(art.history.find(h => h.action === 'Approved')!.timestamp).toLocaleTimeString()} (approved by standard ${art.history.find(h => h.action === 'Approved')!.actorRole})`
                            : 'Pending / Autopromoted');

                      return (
                        <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium text-slate-800">
                            <span className="text-[10px] font-mono text-slate-400 block">ID: {art.id}</span>
                            <span>{art.title}</span>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {art.writerName}
                          </td>
                          <td className="p-4 text-slate-500 font-mono">
                            {pubDateStr}
                          </td>
                          <td className="p-4 font-mono text-slate-500">
                            {seApprovalEvent ? (
                              <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {seApprovalTimeStr}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">
                                {seApprovalTimeStr}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab content 6: SYSTEM DESTRUCTIVE COMMANDS & DIAGNOSTICS */}
      {activeSubTab === 'danger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="panel-danger-section">
          
          <div className="border-b border-[#faf9f0] pb-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-rose-500" />
              <span>Interactive System Integrity & Reset Console</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Inspect physical node indicators or execute absolute system resets immediately to restore system templates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* System Diagnostic checks */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Grid className="w-4 h-4 text-[#20a6eb]" />
                  <span>Interactive System Health Log Check</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">Checking internal communication channels and JSON database connectivity status.</p>
                
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-mono text-slate-500">Database Engine Host:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono text-[9px]">ONLINE (RAM + FSC)</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-mono text-slate-500">Node JS Process Scope:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono text-[9px]">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-mono text-slate-500">Persistent Storage Location:</span>
                    <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[150px]">/db.json</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] bg-sky-50 text-sky-850 p-3 rounded-xl border border-sky-150 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Diagnostics checked dynamically at local timestamp {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* DB Flush tool */}
            <div className="border border-red-200 bg-red-50/20 p-5 rounded-2xl flex flex-col justify-between gap-4">
              <div>
                <span className="text-[9px] bg-red-100 text-red-700 hover:bg-red-200 px-2 py-0.5 rounded uppercase font-black tracking-widest inline-block mb-1.5">Irreversible Action</span>
                <h4 className="text-xs font-extrabold text-slate-800 mb-2">Reset All Database States</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Drops all user modifications, written drafts, submitted travel articles, custom categories pools, and logs. Restores original default workspace templates.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-rose-800 font-bold block">Type <span className="font-mono bg-red-100 px-1 rounded">FLUSH</span> exactly to enable button:</label>
                  <input
                    type="text"
                    placeholder="Type FLUSH..."
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    className="w-full border border-red-200 bg-white rounded-lg p-2 text-xs outline-none focus:border-red-400 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTriggerDatabasePurge}
                  disabled={resetConfirmText !== 'FLUSH' || isResetting}
                  className={`w-full py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 ${
                    resetConfirmText === 'FLUSH' 
                      ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer shadow border border-rose-700' 
                      : 'bg-slate-350 border-slate-400 opacity-40 cursor-not-allowed'
                  }`}
                >
                  {isResetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-100" />}
                  <span>Wipe All Databases & Restore Defaults</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
