import React, { useState } from 'react';
import { User, WorkflowConfig, UserRole } from '../types';
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
  AlertTriangle
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  config: WorkflowConfig;
  topicHistoryLogs: any[];
  onUpdateRole: (userId: string, targetRole: UserRole) => Promise<void>;
  onUpdateConfig: (newConfig: Partial<WorkflowConfig>) => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

export default function AdminPanel({
  currentUser,
  users,
  config,
  topicHistoryLogs,
  onUpdateRole,
  onUpdateConfig,
  onAddToast,
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'rules' | 'topicsHistory'>('users');
  const [elevatingUserId, setElevatingUserId] = useState<string | null>(null);
  
  // Rule edit form states
  const [gateLimit, setGateLimit] = useState(config.aiScoreThreshold);
  const [maxCycles, setMaxCycles] = useState(config.maxReviewCycles);
  const [claimMinutes, setClaimMinutes] = useState(config.claimDurationMinutes);

  // New category state
  const [newCategory, setNewCategory] = useState('');

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

  return (
    <div className="space-y-6" id="admin-panel-module">
      
      {/* Upper informational banner card */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sky-lighting gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl font-mono" />
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] bg-slate-900/45 px-2.5 py-0.5 rounded font-black tracking-widest uppercase">System Operations Console</span>
          <h2 className="text-2xl font-bold">Admin Management Center</h2>
          <p className="text-cyan-50 text-xs max-w-xl">
            Promote workflow participants instantly, configure gatekeeper threshold bounds, edit categories pool dictionaries, and review topic proposals audit logs.
          </p>
        </div>
      </div>

      {/* Tri tab console selection switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit text-xs font-semibold text-slate-600 gap-1 select-none">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'users' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5 inline mr-1" />
          <span>Participants Elevation</span>
        </button>
        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'rules' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 inline mr-1" />
          <span>Workflow Rules</span>
        </button>
        <button
          onClick={() => setActiveSubTab('topicsHistory')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'topicsHistory' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5 inline mr-1" />
          <span>Topic Moderation Logs</span>
        </button>
      </div>

      {/* Perspective sub views */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6" id="panel-users-elevation">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Role Elevation Console</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Simulate user upgrades instantly without accessing raw database files.</p>
            </div>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full font-bold">
              RBAC Dynamic Enforcement Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[9.5px] font-bold border-b border-slate-100">
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Indicator</th>
                  <th className="p-3">Current Applet Role</th>
                  <th className="p-4 text-right">Escalate Role Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-semibold">{u.name}</td>
                    <td className="p-3 font-mono">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase font-mono ${
                        u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'Senior Editor' ? 'bg-orange-100 text-orange-750' :
                        u.role === 'Editor' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {elevatingUserId === u.id ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <select
                            defaultValue={u.role}
                            onChange={async (e) => {
                              await onUpdateRole(u.id, e.target.value as UserRole);
                              setElevatingUserId(null);
                            }}
                            className="bg-white border rounded p-1 text-[11px] outline-none cursor-pointer text-slate-800"
                          >
                            <option value="Writer">Writer</option>
                            <option value="Editor">Editor</option>
                            <option value="Senior Editor">Senior Editor</option>
                            <option value="Admin">Admin</option>
                          </select>
                          <button
                            onClick={() => setElevatingUserId(null)}
                            className="text-slate-400 font-bold hover:text-slate-600 px-1 text-[11px] cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setElevatingUserId(u.id)}
                          className="bg-indigo-55 hover:bg-slate-100 border border-slate-250 text-slate-700 font-bold px-3 py-1.5 rounded-lg cursor-pointer text-[11px]"
                        >
                          Elevate / Demote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="panel-workflow-settings">
          
          {/* Rules settings forms */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span>Workflow Constraints Parameters</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-bold text-slate-600">AI Pre-validation Minimum Gate score</label>
                  <span className="font-bold text-cyan-600 font-mono">{gateLimit} / 100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={gateLimit}
                  onChange={(e) => setGateLimit(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-100 rounded-lg"
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">Submissions must hit or exceed this score or the gatekeeper blocks creation, protecting editors from drafts that violate quality criteria.</p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-bold text-slate-600">Max Rejection Cycles before Escalation</label>
                  <span className="font-bold text-cyan-600 font-mono">{maxCycles} reviews</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxCycles}
                  onChange={(e) => setMaxCycles(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">The cycle threshold defining limit of Writer-Editor interactions. On hit, engine auto-escalates manuscript to Senior Editors.</p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-bold text-slate-600">Claim Auto-release countdown</label>
                  <span className="font-bold text-cyan-600 font-mono">{claimMinutes} minutes</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={claimMinutes}
                  onChange={(e) => setClaimMinutes(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                onClick={handleApplyRules}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Apply Limits Configuration
              </button>
            </div>
          </div>

          {/* Categories Dictionary Modifier list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-teal-500" />
              <span>Editorial Channel Categories</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Insert new channel concept..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={handleAddCategory}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-lg text-xs cursor-pointer inline-flex items-center gap-0.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {config.categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 text-xs border border-slate-100 text-slate-700">
                  <span className="font-mono">{cat}</span>
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove category"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'topicsHistory' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6" id="panel-moderation-history">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Campaign Topics Audit trails</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tracking submission reviews, Claim intervals, Release events, and editorial rejects.</p>
          </div>

          <div className="overflow-x-auto">
            {topicHistoryLogs.length === 0 ? (
              <p className="text-slate-400 text-center py-8 italic text-xs">No entries recorded in audit trail ledger.</p>
            ) : (
              <table className="w-full text-left font-mono border-collapse text-[11px] text-slate-700">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[9px] font-bold border-b border-slate-100">
                    <th className="p-2.5">Topic Target</th>
                    <th className="p-2.5">Stage Event</th>
                    <th className="p-2.5">Presenter</th>
                    <th className="p-2.5">Reviewer Actor</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-3">Comments / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topicHistoryLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2.5 truncate max-w-[150px] font-semibold">{log.topicTitle}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.action === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          log.action === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          log.action === 'Released' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500">{log.submitter}</td>
                      <td className="p-2.5 text-slate-500">
                        {log.reviewer} <span className="text-[9px] text-slate-400">({log.reviewerRole})</span>
                      </td>
                      <td className="p-2.5 text-slate-400 text-[10px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2.5 italic text-slate-600 truncate max-w-[200px]" title={log.comments || 'No comment provided'}>
                        {log.comments || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
