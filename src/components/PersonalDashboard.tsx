import React from 'react';
import {
  Sparkles,
  User,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Send,
  Layers,
  Award,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FolderLock,
  RefreshCw,
  Database,
  Globe,
  Settings,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { Topic, Article, User as UserType, WorkflowConfig } from '../types';

interface PersonalDashboardProps {
  currentUser: UserType;
  topics: Topic[];
  articles: Article[];
  config: WorkflowConfig | null;
  onNavigateTab: (tab: 'topics' | 'writer' | 'editor' | 'quality-check' | 'publisher' | 'analytics' | 'admin' | 'docs') => void;
  onSelectTopic: (topic: Topic) => void;
  onLoadArticle: (article: Article) => void;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  syncMainData: () => Promise<void>;
}

export default function PersonalDashboard({
  currentUser,
  topics,
  articles,
  config,
  onNavigateTab,
  onSelectTopic,
  onLoadArticle,
  onAddToast,
  syncMainData
}: PersonalDashboardProps) {

  const handleQuickResumeDraft = (art: Article) => {
    onLoadArticle(art);
    onNavigateTab('writer');
    onAddToast(`Resumed draft: "${art.title}"`, 'info');
  };

  const currentRole = currentUser.role;

  // Let's compute relevant statistics based on role context
  const userArticles = articles.filter(a => a.writerId === currentUser.id);
  const userDraftsCount = userArticles.filter(a => ['Draft', 'Minor Revision', 'Rejected'].includes(a.status)).length;
  const userSubmissionsInReview = userArticles.filter(a => ['Submitted', 'Under Review'].includes(a.status)).length;
  const userApprovedCount = userArticles.filter(a => a.status === 'Approved').length;
  const userPublishedCount = userArticles.filter(a => a.status === 'Published').length;

  const claimCount = topics.filter(t => t.claimedById === currentUser.id).length;
  const availableToClaimCount = topics.filter(t => t.status === 'Active' && !t.claimedById).length;
  const totalConceptsPool = topics.length;

  // Editor queues
  const pendingEditorialReviews = articles.filter(a => a.status === 'Submitted' || a.status === 'Under Review');
  const articlesClaimedByEditor = articles.filter(a => a.editorId === currentUser.id && a.status === 'Under Review');

  // Senior Editor queues
  const escalatedReviews = articles.filter(a => a.status === 'Escalated');

  // QA Specialist / Quality Checker queues
  const approvedNeedsQA = articles.filter(a => a.status === 'Approved');
  const publishedCount = articles.filter(a => a.status === 'Published').length;

  // Render separate cockpit based on active user's workspace authorization
  return (
    <div className="space-y-6" id="role-dashboard-cockpit">

      {/* Personalized Welcome Header styled with beautiful flight gradients */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#20a6eb] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#20a6eb]/25 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 justify-start">
              <span className="text-[10px] bg-sky-500 text-slate-950 font-black uppercase tracking-wider px-2 py-0.5 rounded">
                Personal Cockpit
              </span>
              <span className="text-[10px] bg-white/10 text-sky-200 border border-white/15 font-mono px-2 py-0.5 rounded-full">
                SLA: 15-min Guarantee
              </span>
            </div>

            <h2 className="text-2xl font-black font-display tracking-tight text-white flex items-center gap-2 justify-start">
              <span>Greetings, {currentUser.name}</span>
              <span className="text-[#20a6eb] font-light">|</span>
              <span className="text-sky-400 font-bold uppercase text-xs tracking-wider">{currentUser.role} Dashboard</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-lg leading-relaxed font-sans">
              {currentRole === 'Writer' && "Draft, optimize, and push your hidden gem guides. You have direct access to AI pre-validation gates and available unclaimed topics!"}
              {currentRole === 'Editor' && "Inspect the submitted travel manuscripts assigned to you. Verify references and AP style before proceeding with approvals."}
              {currentRole === 'Senior Editor' && "Resolve escalated submission cycles and moderate high-priority travel content lines."}
              {currentRole === 'Quality Checker' && "Audit approved travel copy for accurate location listings, flight prices, and coordinate facts."}
              {currentRole === 'Publisher' && "Publish peer-reviewed guides direct to the live travel feed and synchronize payloads to the cloud."}
              {currentUser.role === 'Admin' && "Configure AI criteria scores, monitor database integrity logs, and assign workspace permissions."}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 font-sans">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <span className="text-[10px] block opacity-60 uppercase font-mono tracking-wider font-bold">My Status</span>
              <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Duty
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Role specific analytics & activities dashboard layouts */}

      {/* 1. WRITER DASHBOARD cockpit */}
      {currentRole === 'Writer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Quick Stats Grid */}
          <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">My Drafts</span>
              <span className="text-2xl font-extrabold text-[#20a6eb] block mt-1">{userDraftsCount}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Awaiting submission</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">In Peer-Review</span>
              <span className="text-2xl font-extrabold text-[#20a6eb] block mt-1">{userSubmissionsInReview}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">With editors queue</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">My Claims Lock</span>
              <span className="text-2xl font-extrabold text-indigo-600 block mt-1">{claimCount}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Active active slots</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Published Live</span>
              <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{userPublishedCount}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Travel articles feed</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Available Sourcing</span>
              <span className="text-2xl font-extrabold text-[#363636] block mt-1">{availableToClaimCount}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Concepts ready to claim</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase font-mono border-b pb-2 tracking-wider">Quick Actions Cabinet</h3>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigateTab('topics')}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <PlusCircle className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Propose New Concept</p>
                      <p className="text-[10px] text-slate-400">Suggest fresh local secrets</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab('topics')}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Claim Topics Pool</p>
                      <p className="text-[10px] text-slate-400">Lock high priority travel headers</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => onNavigateTab('writer')}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">Draft empty draft</p>
                      <p className="text-[10px] text-slate-400">Open pure scribe board workspace</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Custom workflow advice box */}
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-2">
              <span className="font-extrabold text-[10px] text-sky-900 uppercase font-mono tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-bounce" /> Scribe Tip: Keep scores safe
              </span>
              <p className="text-[11px] text-sky-850 leading-relaxed font-sans">
                Every article is verified prior to submission by Gemini. Make sure to structure with correct <strong>H2/H3 hashtags</strong> and list authority source links to score at least <strong>{config?.aiScoreThreshold || 70}/100</strong> and bypass automatic gate blockages!
              </p>
            </div>
          </div>

          {/* Active Work Panel */}
          <div className="lg:col-span-8 flex flex-col space-y-4 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex-1">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider">Save & Resume Drafting</h3>
                <span className="text-[10px] text-slate-400">Select to load into workspace</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {userArticles.filter(a => ['Draft', 'Minor Revision', 'Rejected'].includes(a.status)).length === 0 ? (
                  <div className="text-center py-10 space-y-2.5">
                    <p className="text-slate-400 text-xs font-sans italic">Your drafts cabinet is currently empty.</p>
                    <button
                      onClick={() => onNavigateTab('topics')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded-lg font-bold transition-all cursor-pointer"
                    >
                      Browse Claimable Topics Pool
                    </button>
                  </div>
                ) : (
                  userArticles.filter(a => ['Draft', 'Minor Revision', 'Rejected'].includes(a.status)).map(art => {
                    const progress = art.content ? Math.min(100, Math.round((art.content.length / 400) * 100)) : 0;
                    return (
                      <div
                        key={art.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-sky-300 transition-all group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-[#363636] text-xs group-hover:text-sky-600 transition-colors leading-tight">{art.title}</h4>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${art.status === 'Minor Revision' ? 'bg-amber-100 text-amber-800 border border-amber-250' :
                              art.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-250 animate-pulse' :
                                'bg-slate-200 text-slate-700'
                              }`}>
                              {art.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Created: {new Date(art.createdAt).toLocaleDateString()} | Words: {art.content?.split(/\s+/).filter(Boolean).length || 0}</p>

                          {/* Completion index bar */}
                          <div className="w-32 bg-slate-200 h-1 rounded-full overflow-hidden mt-1 text-[2px]">
                            <div className="bg-sky-400 h-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        <button
                          onClick={() => handleQuickResumeDraft(art)}
                          className="px-3 py-1.5 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 text-xs rounded-lg font-bold border border-slate-200 flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        >
                          <span>Scribe Draft</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. EDITOR DASHBOARD cockpit */}
      {currentRole === 'Editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Editorial Pending Reviews</span>
              <span className="text-2xl font-black text-rose-650 block mt-1">{pendingEditorialReviews.length}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Unassigned in general queue</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Assigned To Me</span>
              <span className="text-2xl font-black text-indigo-600 block mt-1">{articlesClaimedByEditor.length}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Manuscripts under revision locks</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">High QA Threshold</span>
              <span className="text-2xl font-black text-sky-650 block mt-1">{config?.aiScoreThreshold || 70}/100</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Enforced gatekeeper metric</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Available Slices</span>
              <span className="text-2xl font-black text-[#363636] mt-1 block">{totalConceptsPool} items</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Total database scope</span>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider border-b pb-1.5">Duty Directives</h3>

              <div className="space-y-2.5 font-sans text-xs text-slate-650">
                <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Editors own articles strictly once grabbed.</div>
                <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Minimum score of {config?.aiScoreThreshold || 70} is mandatory for passing.</div>
                <div className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Articles hitting over {config?.maxReviewCycles || 3} revisions auto-escalate to Senior editors.</div>
              </div>

              <button
                onClick={() => onNavigateTab('editor')}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:scale-102 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <span>Navigate to Editorial Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 text-left">
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider">Urgent Action Required</h3>
                <span className="text-[10px] bg-sky-50 text-[#20a6eb] px-2 py-0.5 rounded font-mono font-bold animate-pulse">{pendingEditorialReviews.length} Submissions</span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {pendingEditorialReviews.length === 0 ? (
                  <p className="py-12 italic text-slate-400 text-center font-sans">Excellent! No submissions pending editorial action.</p>
                ) : (
                  pendingEditorialReviews.map(art => (
                    <div key={art.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-[#363636] text-xs">{art.title}</h4>
                        <p className="text-[10px] text-slate-400">Writer: {art.writerName} | State: <span className="text-[#20a6eb] font-semibold">{art.status}</span></p>
                      </div>

                      <button
                        onClick={() => onNavigateTab('editor')}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow transition-all cursor-pointer"
                      >
                        Claim & Audit
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. SENIOR EDITOR DASHBOARD cockpit */}
      {currentRole === 'Senior Editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm border-l-4 border-l-rose-500">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block text-rose-600">Active Escalations</span>
              <span className="text-2xl font-black text-rose-650 mt-1 block">{escalatedReviews.length}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Exceeded review cycle limits</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Open Submissions</span>
              <span className="text-2xl font-black text-[#20a6eb] mt-1 block">{pendingEditorialReviews.length}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Editorial general queue load</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Pre-Valid Score Criteria</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">{config?.aiScoreThreshold || 70}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Automated block threshold</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Max Cycle Limit</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">{config?.maxReviewCycles || 3}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Configured re-try allowance</span>
            </div>
          </div>

          <div className="lg:col-span-4 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-rose-650 text-xs uppercase font-mono tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Senior Directive Panel</span>
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                You possess advanced override permission codes. You can bypass typical loop limits, review <strong>Escalated</strong> articles, override editor assignments, and execute direct publishes into the Travel Catalog.
              </p>

              <button
                onClick={() => onNavigateTab('editor')}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-1.5"
              >
                <span>Navigate to Editorial Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider">Escalated Queue Vault</h3>
                <span className="text-[9px] bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-mono font-extrabold animate-pulse">Critical SLA</span>
              </div>

              <div className="space-y-2.5">
                {escalatedReviews.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 italic font-sans text-xs">
                    Amazing! No articles are currently escalated in the queues. All standard editor processes are flowing cleanly.
                  </div>
                ) : (
                  escalatedReviews.map(art => (
                    <div key={art.id} className="p-3 bg-rose-50 border border-rose-100/80 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-rose-950 text-xs">{art.title}</h4>
                        <p className="text-[10px] text-rose-800 mt-0.5">Author ID: {art.writerName} | Retries: {art.reviewCycles} turns</p>
                      </div>

                      <button
                        onClick={() => onNavigateTab('editor')}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] shadow border-0 cursor-pointer"
                      >
                        Override Review
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. QUALITY SPECIALIST / CHECKER DASHBOARD cockpit */}
      {currentRole === 'Quality Checker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm border-l-4 border-l-amber-500">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block text-amber-500">Audits Waiting QA</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{approvedNeedsQA.length}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Pending geographic checking</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">My Audited guides</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">{publishedCount} records</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Released into travelers feed</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Geo Reliability Goal</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">99.9% ACCURACY</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Zero-tolerance fact standards</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Platform Config Code</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">QA-OS-v2.1</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Factual coordinate checking</span>
            </div>
          </div>

          <div className="lg:col-span-4 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-amber-600 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Geographic Precision SLA</span>
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                As a Quality Specialist, you own Stage 5: factual vetting. Spot check coordinate numbers, look up flight cost charts, and rate the travel guide's clarity index before allowing final release blocks.
              </p>

              <button
                onClick={() => onNavigateTab('quality-check')}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow cursor-pointer border-0 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Navigate to Quality Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 text-left">
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider">Manuscripts Requiring Fact Check</h3>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono font-bold">{approvedNeedsQA.length} open drafts</span>
              </div>

              <div className="space-y-2.5">
                {approvedNeedsQA.length === 0 ? (
                  <p className="py-12 text-slate-400 italic text-center font-sans text-xs">Excellent! No articles are currently waiting in QA queues.</p>
                ) : (
                  approvedNeedsQA.map(art => (
                    <div key={art.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-[#363636] text-xs">{art.title}</h4>
                        <p className="text-[10px] text-slate-400">Writer: {art.writerName} | Current AI Score: <strong className="text-slate-600">{art.score}/100</strong></p>
                      </div>

                      <button
                        onClick={() => onNavigateTab('quality-check')}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[10px] font-bold shadow border-0 cursor-pointer"
                      >
                        Launch Fact Audit
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 5. PUBLISHER DASHBOARD cockpit */}
      {currentRole === 'Publisher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm border-l-4 border-l-emerald-500">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block text-emerald-600">Pending Travel Feed Release</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{approvedNeedsQA.length}</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Direct queue awaiting deployment</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Live Travel Guides</span>
              <span className="text-2xl font-black text-sky-600 mt-1 block">{publishedCount} published</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Actively active travel catalog</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-left">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block text-sky-600">External Sync Mode</span>
              <span className="text-2xl font-black text-[#20a6eb] mt-1 block">CLOUD SYNC ENFORCED</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Supabase bidirectional pipeline</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Client Payload Gateway</span>
              <span className="text-2xl font-black text-[#363636] mt-1 block">GATEWAY-ONLINE</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Operational and active static maps</span>
            </div>
          </div>

          <div className="lg:col-span-4 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-emerald-600 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Globe className="w-5 h-5 text-emerald-500" />
                <span>Content Distribution Desk</span>
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                You control the final gateway layer: Stage 6 publishing. Finalize layouts, choose cover illustrations, and activate the traveler feed triggers. Sync datasets live to Supabase.
              </p>

              <button
                onClick={() => onNavigateTab('publisher')}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-650 text-white font-bold rounded-xl text-xs shadow hover:scale-102 cursor-pointer transition-all border-0 flex items-center justify-center gap-1.5"
              >
                <span>Navigate to Publisher Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 text-left">
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider">Awaiting Deployment Feeds</h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold animate-pulse">{approvedNeedsQA.length} ready guides</span>
              </div>

              <div className="space-y-2.5">
                {approvedNeedsQA.length === 0 ? (
                  <p className="py-12 text-slate-400 italic text-center font-sans text-xs">Awesome! No copy sheets are currently waiting for feed injection.</p>
                ) : (
                  approvedNeedsQA.map(art => (
                    <div key={art.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-[#363636] text-xs">{art.title}</h4>
                        <p className="text-[10px] text-slate-400">Writer: {art.writerName} | Status: <strong className="text-emerald-600">QA Approved</strong></p>
                      </div>

                      <button
                        onClick={() => onNavigateTab('publisher')}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-[10px] font-bold shadow border-0 cursor-pointer"
                      >
                        Publish Live Feed
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 6. ADMIN DASHBOARD cockpit */}
      {currentUser.role === 'Admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm border-l-4 border-l-purple-500 text-left">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block text-purple-600">Admin Control Central</span>
              <span className="text-2xl font-black text-purple-700 mt-1 block">OS Enabled</span>
              <span className="text-[10px] text-slate-400 mt-2 block">System settings authority</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-left">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Current Quality Limit</span>
              <span className="text-2xl font-black text-sky-600 mt-1 block">{config?.aiScoreThreshold || 70}/100</span>
              <span className="text-[10px] text-slate-400 mt-2 block">AI pre-validate minimum</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-left">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">SLA Timeout (Mins)</span>
              <span className="text-2xl font-black text-sky-600 mt-1 block">{config?.claimDurationMinutes || 10} minutes</span>
              <span className="text-[10px] text-slate-400 mt-2 block">Claim lock count expiry</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-left">
              <span className="text-slate-400 font-mono text-[9px] uppercase font-bold block">Enterprise Server Spec</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">Live Proxy active</span>
              <span className="text-[10px] text-slate-400 mt-2 block">99.9% uptime validation</span>
            </div>
          </div>

          <div className="lg:col-span-4 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-purple-700 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-purple-500" />
                <span>Global Workspace Settings</span>
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Tweak parameters dynamically, explore full operational history registries, audit system-wide actions, and elevate test roles directly inside the system sandbox.
              </p>

              <button
                onClick={() => onNavigateTab('admin')}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow hover:scale-102 cursor-pointer transition-all border-0 flex items-center justify-center gap-1.5"
              >
                <span>Open Operations Panel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 text-left">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider">Active Workspace Control shortcuts</h3>
                <span className="text-[10px] text-slate-400">Workspace parameters</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('admin')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-sans text-xs transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">Workflow parameters configurator</p>
                    <p className="text-[10px] text-slate-400">Modify threshold values & SLAs</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('analytics')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-sans text-xs transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">Operational Throughput Dashboard</p>
                    <p className="text-[10px] text-slate-400">Read charts & rejection reasons</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('docs')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-sans text-xs transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">Supabase Cloud Database Connector</p>
                    <p className="text-[10px] text-slate-400">Verify dynamic relational tables</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('topics')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-sans text-xs transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">Travel Concept pool Catalog</p>
                    <p className="text-[10px] text-slate-400">Propose & claim active tickets</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Broad Common Hub System Status Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-left">
        <h4 className="font-bold text-slate-800 text-xs uppercase font-mono tracking-wider border-b pb-2 mb-3">Enterprise System Integrity Monitors</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-sans">Active Server API</p>
              <p className="font-bold font-mono">ONLINE</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#20a6eb] shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-sans">Google Gemini Flash Engine</p>
              <p className="font-bold font-mono">ACTIVE</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-sans">Workflow Config SLA</p>
              <p className="font-bold font-mono">ENFORCED</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-sans">RBAC Level Gate</p>
              <p className="font-bold font-mono">STANDARD MODE</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
