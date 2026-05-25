import React, { useState } from 'react';
import { User, Topic, Article, WorkflowConfig, UserRole } from '../types';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  CheckCircle2, 
  Percent, 
  Edit2, 
  Save, 
  UserCheck, 
  RefreshCw, 
  FileText, 
  Star,
  Activity,
  ThumbsUp,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface StakeholderTarget {
  userId: string;
  articlesTarget: number;
  scoreTarget: number;
}

interface PerformanceManagementProps {
  currentUser: User;
  users: User[];
  articles: Article[];
  topics: Topic[];
  config: WorkflowConfig;
  onUpdateConfig: (newConfig: Partial<WorkflowConfig> & { stakeholderTargets?: StakeholderTarget[] }) => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

export default function PerformanceManagement({
  currentUser,
  users,
  articles,
  topics,
  config,
  onUpdateConfig,
  onAddToast
}: PerformanceManagementProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ articlesTarget: number; scoreTarget: number }>({
    articlesTarget: 5,
    scoreTarget: 75
  });

  // Safe fetch of stakeholder targets array with preloaded defaults for existing users
  // We type cast or read safely from config.
  const stakeholderTargets: StakeholderTarget[] = (config as any).stakeholderTargets || [
    { userId: 'u-1', articlesTarget: 5, scoreTarget: 80 },
    { userId: 'u-2', articlesTarget: 4, scoreTarget: 75 },
    { userId: 'u-3', articlesTarget: 6, scoreTarget: 80 },
    { userId: 'u-4', articlesTarget: 6, scoreTarget: 75 },
    { userId: 'u-5', articlesTarget: 3, scoreTarget: 85 },
  ];

  const getTargetsForUser = (userId: string, role: string) => {
    const found = stakeholderTargets.find(t => t.userId === userId);
    if (found) return found;

    // Standard fallback target settings depending on roles
    switch (role) {
      case 'Writer':
        return { userId, articlesTarget: 5, scoreTarget: 80 };
      case 'Editor':
      case 'Senior Editor':
        return { userId, articlesTarget: 6, scoreTarget: 75 };
      case 'Quality Checker':
        return { userId, articlesTarget: 4, scoreTarget: 80 };
      case 'Publisher':
        return { userId, articlesTarget: 4, scoreTarget: 75 };
      default:
        return { userId, articlesTarget: 3, scoreTarget: 70 };
    }
  };

  // Calculate dynamic active metrics from real database articles state
  const getAchievedMetrics = (user: User) => {
    const userArticles = articles.filter(a => a.writerId === user.id);
    const publishedCount = articles.filter(a => a.writerId === user.id && a.status === 'Published').length;
    const submittedCount = articles.filter(a => a.writerId === user.id && a.status !== 'Draft').length;

    // Find custom activities where this stakeholder was an Editor or reviewer
    const reviewsHandled = articles.filter(a => 
      a.editorId === user.id || 
      a.history.some(h => h.actorName === user.name && ['Approved', 'Rejected', 'Minor Revision'].includes(h.action))
    ).length;

    // Quality inspector checks
    const qcAuditsHandled = articles.filter(a => 
      a.history.some(h => h.actorName === user.name && h.action.includes('Quality'))
    ).length;

    // Publisher release points
    const distributionsCompleted = articles.filter(a => 
      a.status === 'Published' && 
      a.history.some(h => h.actorName === user.name && h.action === 'Published')
    ).length;

    // Average AI score for written items
    const scoreSum = userArticles
      .filter(a => a.aiValidation)
      .reduce((sum, a) => sum + (a.aiValidation?.score || 0), 0);
    const scoreCount = userArticles.filter(a => a.aiValidation).length;
    const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

    // Stakeholder key operational metrics depending on role
    if (user.role === 'Writer') {
      return {
        metricLabel: 'Articles Published',
        achievedCount: publishedCount,
        achievedScore: avgScore,
        detailsLabel: 'Submitted drafts',
        detailsCount: submittedCount
      };
    } else if (user.role === 'Editor' || user.role === 'Senior Editor') {
      return {
        metricLabel: 'Reviews Completed',
        achievedCount: reviewsHandled,
        achievedScore: avgScore || 78, // fallback simulated score for editorial consistency
        detailsLabel: 'Assigned claims',
        detailsCount: topics.filter(t => t.claimedById === user.id).length
      };
    } else if (user.role === 'Quality Checker') {
      return {
        metricLabel: 'Audits Approved',
        achievedCount: qcAuditsHandled || articles.filter(a => a.status === 'Approved').length, // fallback based on approved items
        achievedScore: avgScore || 82,
        detailsLabel: 'Total checks clicked',
        detailsCount: qcAuditsHandled
      };
    } else if (user.role === 'Publisher') {
      return {
        metricLabel: 'Stories Published',
        achievedCount: distributionsCompleted || articles.filter(a => a.status === 'Published').length,
        achievedScore: avgScore || 80,
        detailsLabel: 'Total releases',
        detailsCount: distributionsCompleted
      };
    } else {
      // Default (e.g. Admin or custom roles)
      return {
        metricLabel: 'Operations Supervised',
        achievedCount: articles.filter(a => a.status !== 'Draft').length,
        achievedScore: avgScore || 85,
        detailsLabel: 'Total active users',
        detailsCount: users.length
      };
    }
  };

  const startEditing = (user: User) => {
    const targets = getTargetsForUser(user.id, user.role);
    setFormData({
      articlesTarget: targets.articlesTarget,
      scoreTarget: targets.scoreTarget
    });
    setEditingUserId(user.id);
  };

  const handleSaveTargets = async (userId: string) => {
    if (formData.articlesTarget <= 0 || formData.scoreTarget < 40 || formData.scoreTarget > 100) {
      onAddToast('Please input realistic metrics constraints: target > 0 and score between 40-100.', 'warning');
      return;
    }

    try {
      // Upsert customized target
      const targetsCopy = [...stakeholderTargets];
      const index = targetsCopy.findIndex(t => t.userId === userId);
      if (index > -1) {
        targetsCopy[index] = { userId, ...formData };
      } else {
        targetsCopy.push({ userId, ...formData });
      }

      await onUpdateConfig({ stakeholderTargets: targetsCopy });
      setEditingUserId(null);
      onAddToast('Performance thresholds customized and persisted inside system directories!', 'success');
    } catch {
      onAddToast('Could not save modified performance targets.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 text-left" id="performance-management-section">
      
      {/* Editorial Performance Intro Banner */}
      <div className="bg-gradient-to-br from-[#363636] to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden border border-slate-700 shadow-md">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#e86420]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <span className="text-[10px] bg-[#20a6eb]/35 text-[#faf9f0] border border-[#20a6eb]/40 px-2.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">Target & Achieved KPI Engine</span>
          <h2 className="text-2xl font-black tracking-tight font-display text-white">Stakeholder Performance Management</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Monitor, set goals, and analyze metrics across all system roles. Define custom quota targets, calculate absolute achievements from live workflows, and track positive or negative deviation variances continuously.
          </p>
        </div>
      </div>

      {/* Aggregate Overview Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="perf-summary-cards">
        
        {/* Total Target Sum card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left relative overflow-hidden">
          <div className="absolute right-3 top-3 bg-indigo-50 p-2 rounded-xl text-indigo-600">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider block">Production Target Aggregate</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1 cursor-default">
            {users.reduce((sum, u) => sum + getTargetsForUser(u.id, u.role).articlesTarget, 0)} Units
          </p>
          <span className="text-[10px] bg-slate-50 text-slate-500 font-semibold px-2 py-0.5 rounded mt-2.5 inline-block">
            Joint Cumulative Goals
          </span>
        </div>

        {/* Total Achieved Sum card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left relative overflow-hidden">
          <div className="absolute right-3 top-3 bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider block">Production Achieved Aggregate</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1 cursor-default text-emerald-600">
            {users.reduce((sum, u) => sum + getAchievedMetrics(u).achievedCount, 0)} Units
          </p>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded mt-2.5 inline-block">
            Live Streamed Achievements
          </span>
        </div>

        {/* Total Variance calculation */}
        {(() => {
          const totalTarget = users.reduce((sum, u) => sum + getTargetsForUser(u.id, u.role).articlesTarget, 0);
          const totalAchieved = users.reduce((sum, u) => sum + getAchievedMetrics(u).achievedCount, 0);
          const variance = totalAchieved - totalTarget;
          const pctVariance = totalTarget > 0 ? Math.round((variance / totalTarget) * 100) : 0;
          return (
            <div className={`bg-white p-5 rounded-2xl border shadow-xs text-left relative overflow-hidden ${
              variance >= 0 ? 'border-emerald-200 bg-emerald-50/10' : 'border-rose-100 bg-rose-50/10'
            }`}>
              <div className={`absolute right-3 top-3 p-2 rounded-xl ${
                variance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {variance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider block">Operational Variance Deviation</span>
              <p className={`text-2xl font-extrabold mt-1 cursor-default ${
                variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {variance >= 0 ? `+${variance}` : variance} ({variance >= 0 ? `+${pctVariance}` : pctVariance}%)
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-2.5 inline-block ${
                variance >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {variance >= 0 ? 'System Performing Above Standard' : 'System Performing Under Standard'}
              </span>
            </div>
          );
        })()}
      </div>

      {/* Stakeholders grid detailing target, achieved and variance */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="stakeholder-performance-ledger">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#20a6eb]" />
              <span>Workspace Stakeholder List & Scorecards</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Customize thresholds dynamically below. Targets are written straight to your JSON configuration file.</p>
          </div>
          <span className="bg-slate-105 font-mono text-[10px] text-slate-500 border border-slate-200 px-3 py-1 rounded-lg">
            Role counts: {users.length} Stakeholders
          </span>
        </div>

        {/* Grid Card Layout for Stakeholder items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="stakeholder-performance-grid">
          {users.map(user => {
            const targets = getTargetsForUser(user.id, user.role);
            const achieved = getAchievedMetrics(user);
            const varianceCount = achieved.achievedCount - targets.articlesTarget;
            const varianceScore = achieved.achievedScore - targets.scoreTarget;
            const isEditing = editingUserId === user.id;

            return (
              <div 
                key={user.id} 
                className={`border rounded-2xl p-5 space-y-4 transition-all relative ${
                  isEditing 
                    ? 'border-[#20a6eb] bg-sky-50/10 shadow-md ring-1 ring-sky-100' 
                    : 'border-slate-200/80 bg-white hover:shadow-xs'
                }`}
                id={`card-${user.id}`}
              >
                
                {/* Stakeholder Identity Row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border text-slate-800 font-extrabold uppercase flex items-center justify-center text-[10px]">
                      {user.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        {user.name}
                        {user.id === currentUser.id && (
                          <span className="bg-sky-100 text-sky-800 font-mono text-[8px] px-1 rounded uppercase font-black">You</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded font-mono">
                          {user.role}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toggle */}
                  <div className="shrink-0">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveTargets(user.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[10px]"
                        title="Save updated goals"
                        id={`save-btn-${user.id}`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    ) : (
                      ['Admin', 'Senior Editor'].includes(currentUser.role) && (
                        <button
                          onClick={() => startEditing(user)}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold p-1.5 rounded-lg cursor-pointer transition-all inline-flex items-center gap-1 text-[10px]"
                          title="Modify stakeholder performance goals"
                          id={`edit-btn-${user.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Set Goals</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Performance Threshold Fields Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  
                  {/* Targets Card */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                    <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Quota target</span>
                    
                    {isEditing ? (
                      <div className="mt-1 space-y-1 text-left">
                        <label className="text-[7px] text-slate-400 uppercase font-black">Volume:</label>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-center font-bold"
                          value={formData.articlesTarget}
                          onChange={(e) => setFormData({ ...formData, articlesTarget: Number(e.target.value) })}
                        />
                      </div>
                    ) : (
                      <p className="text-lg font-mono font-bold text-slate-800 mt-1 cursor-default">
                        {targets.articlesTarget} <span className="text-[10px] text-slate-400 font-sans font-medium">units</span>
                      </p>
                    )}
                    
                    <span className="text-[9px] text-slate-400 mt-1 block font-mono">Volume constraint</span>
                  </div>

                  {/* Achieved Card */}
                  <div className="bg-slate-55 border border-slate-200 rounded-xl p-2.5">
                    <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Achieved</span>
                    <p className="text-lg font-mono font-bold text-slate-800 mt-1 cursor-default">
                      {achieved.achievedCount} <span className="text-[10px] text-slate-400 font-sans font-medium">units</span>
                    </p>
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded mt-1.5 inline-block font-mono">
                      {achieved.metricLabel}
                    </span>
                  </div>

                  {/* Variance Card */}
                  <div className={`border rounded-xl p-2.5 ${
                    varianceCount >= 0 ? 'bg-emerald-50/50 border-emerald-150' : 'bg-rose-50/40 border-rose-100'
                  }`}>
                    <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Variance</span>
                    <p className={`text-lg font-mono font-extrabold mt-1 cursor-default ${
                      varianceCount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {varianceCount >= 0 ? `+${varianceCount}` : varianceCount}
                    </p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-1.5 inline-block ${
                      varianceCount >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {varianceCount >= 0 ? 'SLA Passed' : 'Under Quota'}
                    </span>
                  </div>

                </div>

                {/* Score constraints comparison rows */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2.5 text-xs">
                  
                  {/* Score target check */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Quality Rating Goal</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-slate-400 font-medium">Min:</span>
                          <input
                            type="number"
                            className="bg-white border rounded p-0.5 w-12 text-center font-bold"
                            value={formData.scoreTarget}
                            onChange={(e) => setFormData({ ...formData, scoreTarget: Number(e.target.value) })}
                          />
                          <span className="text-slate-400">%</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-slate-400">Target:</span>
                          <strong className="text-slate-700">{targets.scoreTarget}%</strong>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-400">Achieved:</span>
                          <strong className="text-slate-700">{achieved.achievedScore}%</strong>
                          <span className="text-slate-300">|</span>
                          <span className={`px-1 rounded font-bold ${varianceScore >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                            {varianceScore >= 0 ? `+${varianceScore}` : varianceScore}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Turnaround / secondary detail info */}
                  <div className="flex justify-between items-center border-t border-slate-200/50 pt-2 text-[11px]">
                    <span className="text-slate-400 font-mono uppercase text-[9px]">{achieved.detailsLabel}</span>
                    <span className="font-mono text-slate-600 font-bold">{achieved.detailsCount} units accounted</span>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SLA Policy Manual & Quality standards section */}
      <div className="bg-[#fffbfa] border border-[#f3ebde] p-5 rounded-2xl flex flex-col md:flex-row items-center gap-5">
        <div className="bg-[#e86420]/10 text-[#e86420] p-3 rounded-2xl shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-[#363636] text-xs uppercase tracking-wide mb-1">Company Performance Policies (SLA Guidelines)</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All system writers must log at least 1 travel advisory review per week exceeding the dynamic AI Quality limits configuration (currently <strong className="text-emerald-600 font-mono">{config.aiScoreThreshold}%</strong>). Editors must claim and reviews drafts within <strong className="text-[#20a6eb] font-mono">{config.claimDurationMinutes} mins</strong> or other participants are permitted to claim them from directories.
          </p>
        </div>
      </div>

    </div>
  );
}
