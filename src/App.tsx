import React, { useState, useEffect } from 'react';
import { User, Topic, Article, WorkflowConfig, UserRole } from './types';
import RoleSwitcher from './components/RoleSwitcher';
import TopicPool from './components/TopicPool';
import WriterPortal from './components/WriterPortal';
import EditorDashboard from './components/EditorDashboard';
import QualityCheckerDesk from './components/QualityCheckerDesk';
import PublisherDesk from './components/PublisherDesk';
import AdminPanel from './components/AdminPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CustomNotification from './components/CustomNotification';
import OverviewHub from './components/OverviewHub';
import DocsAndManual from './components/DocsAndManual';
import PersonalDashboard from './components/PersonalDashboard';
import { User as UserIcon, BookOpen } from 'lucide-react';
import { 
  Compass, 
  FileEdit, 
  Inbox, 
  Activity, 
  Wrench, 
  Compass as LogoIcon, 
  Bell, 
  FileText, 
  HelpCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Moon,
  Home,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [topicHistoryLogs, setTopicHistoryLogs] = useState<any[]>([]);

  // Navigation and active workflow tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'topics' | 'writer' | 'editor' | 'quality-check' | 'publisher' | 'analytics' | 'admin' | 'docs'>('dashboard');
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [activeTopicFromPool, setActiveTopicFromPool] = useState<Topic | null>(null);
  const [activeArticleForEditing, setActiveArticleForEditing] = useState<Article | null>(null);

  // Notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  const addToast = (message: string, type: 'success' | 'warning' | 'info' | 'error') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 5.5 secs unless warning
    if (type !== 'warning') {
      setTimeout(() => {
        removeToast(id);
      }, 5500);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Main data sync engine
  const syncData = async (silent = false) => {
    try {
      const [resUsers, resTopics, resArticles, resConfig, resAnalytics, resTopicLogs] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/topics').then(r => r.json()),
        fetch('/api/articles').then(r => r.json()),
        fetch('/api/config').then(r => r.json()),
        fetch('/api/analytics').then(r => r.json()),
        fetch('/api/topics/moderation-history').then(r => r.json()),
      ]);

      setUsers(resUsers);
      setTopics(resTopics);
      setArticles(resArticles);
      setConfig(resConfig);
      setAnalytics(resAnalytics);
      setTopicHistoryLogs(resTopicLogs);

      // Default first user if empty
      if (!currentUser && resUsers.length > 0) {
        // Alisha Vance is the standard default writer
        const defaultUser = resUsers.find((u: User) => u.name.includes('Alisha')) || resUsers[0];
        setCurrentUser(defaultUser);
      }
    } catch (err) {
      console.error('Error synchronizing dashboard datasets:', err);
      if (!silent) {
        addToast('Warning: Unable to synchronize with backend server API endpoints. Using local states fallback.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial syncing on mount
  useEffect(() => {
    syncData();
    
    // Send background analytical tick
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pageView' }),
    }).catch(o => {});

    // Sync metrics repeatedly to ensure timer expirations are loaded smoothly on screen
    const interval = setInterval(() => {
      syncData(true);
    }, 4500);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle switched participant view
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    addToast(`Perspectives Switched: Simulating dashboard as ${user.name} (${user.role})`, 'info');
    
    // Trigger tick log in DB analytics
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activeUser' }),
    }).catch(() => {});
  };

  // Modify user roles dynamically (satisfies role elevation request)
  const handleUpdateRole = async (userId: string, targetRole: UserRole) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        // If current user is modified, update locally as well
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, role: targetRole } : null);
        }
        await syncData(true);
      } else {
        addToast(data.error || 'Elevation refused.', 'error');
      }
    } catch {
      addToast('Error setting participant operational role.', 'error');
    }
  };

  // TOPICS ENGINE
  const handleProposeTopic = async (title: string, desc: string, cat: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/topics/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: desc,
          category: cat,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role
        })
      });
      if (res.ok) {
        addToast('Travel Concept Proposed! Sent for editorial moderation.', 'success');
        await syncData(true);
      } else {
        const d = await res.json();
        addToast(d.error || 'Proposal error', 'error');
      }
    } catch {
      addToast('Could not register proposal concept.', 'error');
    }
  };

  const handleEditTopic = async (topicId: string, title: string, desc: string, cat: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: desc,
          category: cat
        })
      });
      if (res.ok) {
        addToast('Travel Concept Updated successfully!', 'success');
        await syncData(true);
      } else {
        const d = await res.json();
        addToast(d.error || 'Update error', 'error');
      }
    } catch {
      addToast('Could not save concept updates.', 'error');
    }
  };

  const handleModerateTopic = async (topicId: string, action: 'Approved' | 'Rejected', comments: string, reasons?: string[]) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/topics/${topicId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          comments,
          reasons
        })
      });
      if (res.ok) {
        addToast(`Topic proposal successfully moderated as ${action}!`, 'success');
        await syncData(true);
      } else {
        const d = await res.json();
        addToast(d.error || 'Moderation issue', 'error');
      }
    } catch {
      addToast('Error registering moderation choice.', 'error');
    }
  };

  const handleClaimTopic = async (topicId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/topics/${topicId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name
        })
      });
      if (res.ok) {
        const target = topics.find(t => t.id === topicId);
        addToast(`Concept claimed! Countdown of ${target?.durationMinutes || config?.claimDurationMinutes} minutes initiated. Finish before release timeout!`, 'success');
        await syncData(true);
      } else {
        const d = await res.json();
        addToast(d.error || 'Claiming conflict', 'error');
      }
    } catch {
      addToast('Error locking claim reservation.', 'error');
    }
  };

  const handleReleaseTopic = async (topicId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/topics/${topicId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorName: currentUser.name,
          actorRole: currentUser.role
        })
      });
      if (res.ok) {
        addToast('Reservation released. The topic returned back into active write catalog.', 'info');
        await syncData(true);
      } else {
        addToast('Unable to release claim.', 'error');
      }
    } catch {
      addToast('Could not release claim.', 'error');
    }
  };

  // ARTICLES ENGINE
  const handleSaveDraft = async (id: string | null, title: string, content: string, topicId: string | null) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          content,
          writerId: currentUser.id,
          writerName: currentUser.name,
          topicId
        })
      });
      if (res.ok) {
        const updatedArt = await res.json();
        await syncData(true);
        return updatedArt;
      }
    } catch {
      addToast('Unable to persist draft manuscript.', 'error');
    }
  };

  const handleSubmitArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}/submit`, { method: 'POST' });
      const data = await res.json();
      await syncData(true);
      return data;
    } catch {
      addToast('Fatal: AI verification channels unresponsive.', 'error');
      return { success: false, message: 'Server gateway failed.', article: null as any };
    }
  };

  const handlePostComment = async (articleId: string, text: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/articles/${articleId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          authorName: currentUser.name,
          authorRole: currentUser.role
        })
      });
      if (res.ok) {
        await syncData(true);
      }
    } catch {
      addToast('Unable to post comment feedback.', 'error');
    }
  };

  const handleSubmitDecision = async (params: {
    articleId: string;
    action: string;
    comments: string;
    reasons?: string[];
  }) => {
    if (!currentUser) return;
    const res = await fetch(`/api/articles/${params.articleId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorRole: currentUser.role
      })
    });
    if (res.ok) {
      await syncData(true);
    } else {
      const d = await res.json();
      throw new Error(d.error || 'Decision error');
    }
  };

  // CONFIGS ENGINE
  const handleUpdateConfig = async (newConfig: Partial<WorkflowConfig>) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        await syncData(true);
      }
    } catch {
      addToast('Failed to write changes to platform config.', 'error');
    }
  };

  // Helper trigger for writing claimed topics
  const handleSelectTopicForArticle = (topic: Topic) => {
    setActiveTopicFromPool(topic);
    setActiveTab('writer');
    addToast(`Initialized article draft based on claimed concept: "${topic.title}"`, 'success');
  };

  if (isLoading || !currentUser || !config) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border border-indigo-200 border-t-indigo-600 animate-spin" />
        <h3 className="text-sm font-bold text-slate-700 tracking-tight">Launching RadarDesk Operations Workspace...</h3>
        <p className="text-xs text-slate-400">Loading RBAC identities and operational parameters.</p>
      </div>
    );
  }

  if (viewMode === 'landing') {
    return (
      <OverviewHub
        topics={topics}
        articles={articles}
        config={config}
        onGetStarted={() => setViewMode('app')}
        onSignIn={() => {
          setViewMode('app');
          addToast("RadarDesk Session Initiated: Active profile assigned.", "success");
        }}
      />
    );
  }

  // Active unclaimed topics count alerts count check for writers
  const activeUnclaimedCount = topics.filter(t => t.status === 'Active' && !t.claimedById).length;

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col lg:flex-row font-sans text-[#363636] overflow-hidden" id="editorial-workspace-frame">
      
      {/* LEFT SIDEBAR - Desktop view only */}
      <aside className="hidden lg:flex w-64 sidebar-bg flex-col shrink-0 text-white min-h-screen relative shadow-lg">
        {/* Sky-lighting accent bar inside sidebar header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20a6eb] to-[#e86420]" />
        
        <div 
          onClick={() => setViewMode('landing')}
          className="p-6 flex items-center space-x-3 text-white border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all group"
          title="Return to Welcome Hub"
        >
          <div className="w-8 h-8 rounded bg-[#e86420] flex items-center justify-center font-bold text-[#fafafa] font-display text-xs shadow-inner group-hover:scale-105 transition-transform">RD</div>
          <span className="text-lg font-bold tracking-tight font-display transition-colors group-hover:text-[#20a6eb]">RadarDesk<span className="text-[#20a6eb] font-black">.OS</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
              activeTab === 'dashboard' 
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
            title="Personal Role Action Center"
          >
            <Home className="w-4 h-4 opacity-80 text-[#20a6eb]" />
            <span className="flex-1 text-left font-semibold">Personal Dashboard</span>
          </button>

          <button
            onClick={() => setViewMode('landing')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs text-white/70 hover:bg-white/5 hover:text-white"
            title="Return to Welcome Hub Landing Page"
          >
            <BookOpen className="w-4 h-4 opacity-85 text-[#e86420]" />
            <span className="flex-1 text-left">Marketing Landing</span>
          </button>

          <button
            onClick={() => setActiveTab('topics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
              activeTab === 'topics' 
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 opacity-80" />
            <span className="flex-1 text-left">Concepts Pool</span>
            {activeUnclaimedCount > 0 && (
              <span className="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded text-[9px] animate-bounce">
                {activeUnclaimedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('writer')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
              activeTab === 'writer' 
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FileEdit className="w-4 h-4 opacity-80" />
            <span className="flex-1 text-left">Drafting Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
              activeTab === 'editor' 
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4 opacity-80" />
            <span className="flex-1 text-left">Queue Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
              activeTab === 'analytics' 
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 opacity-80" />
            <span className="flex-1 text-left">Analytics Dashboard</span>
          </button>

          {['Quality Checker', 'Editor', 'Senior Editor', 'Admin'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('quality-check')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                activeTab === 'quality-check' 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 opacity-80" />
              <span className="flex-1 text-left">Quality Desk</span>
              {articles.filter(a => a.status === 'Approved').length > 0 && (
                <span className="bg-[#e86420] text-slate-950 font-black px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                  {articles.filter(a => a.status === 'Approved').length}
                </span>
              )}
            </button>
          )}

          {['Publisher', 'Senior Editor', 'Admin'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('publisher')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                activeTab === 'publisher' 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 opacity-80" />
              <span className="flex-1 text-left">Publishing Desk</span>
            </button>
          )}

          {['Admin'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
                activeTab === 'admin' 
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4 opacity-80" />
              <span className="flex-1 text-left">Admin Settings</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('docs')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${
              activeTab === 'docs' 
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4 opacity-80" />
            <span className="flex-1 text-left">Help & Manual</span>
          </button>
        </nav>

        {/* Sidebar bottom portion with active user details + Switch User */}
        <div className="p-6 border-t border-white/10 bg-black/10">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold uppercase font-display text-xs shadow-inner">
                {currentUser?.name?.substring(0, 2).toUpperCase() || 'TR'}
              </div>
              <div className="text-xs text-white">
                <p className="font-bold uppercase tracking-tight text-[10px] text-sky-300">Active Profile</p>
                <p className="font-semibold text-slate-100 truncate max-w-[130px]">{currentUser?.name}</p>
                <span className="text-[9px] text-slate-300 bg-white/10 px-1 py-0.2 rounded mt-0.5 inline-block uppercase font-mono">{currentUser?.role}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <RoleSwitcher
                currentUser={currentUser}
                users={users}
                onSwitchUser={handleSwitchUser}
                onUpdateRole={handleUpdateRole}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE PANELS */}
      <div className="flex-1 flex flex-col min-w-0 radial-blur-bg h-screen overflow-y-auto relative">
        
        {/* Glow horizontal indicator on desktop / mobile banner */}
        <div className="w-full h-1 bg-gradient-to-r from-[#20a6eb] to-[#e86420]" />

        {/* Header containing status and contextual controls */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0 shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            {/* Minimal Logo shown for Mobile only */}
            <div className="lg:hidden p-2 rounded bg-[#363636] text-white flex items-center justify-center">
              <span className="font-bold text-xs text-[#20a6eb] font-display">RD</span>
            </div>
            
            <h1 className="text-sm font-bold text-[#363636] font-display uppercase tracking-wide hidden lg:block">
              {activeTab === 'topics' ? 'Concepts Pool Catalog' : 
               activeTab === 'writer' ? 'Composition Desk' :
               activeTab === 'editor' ? 'Editorial reviews pools' :
               activeTab === 'quality-check' ? 'Quality Assurance Desk' :
               activeTab === 'publisher' ? 'Publishing & Release Desk' :
               activeTab === 'analytics' ? 'System Metrics & Throughput' : 
               activeTab === 'docs' ? 'Database Spec & User Manual' : 'System Operations Console'}
            </h1>

            <span className="status-chip bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
              AI ENGINE: ONLINE
            </span>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Quick switcher active trigger for mobile layout */}
            <div className="lg:hidden">
              <RoleSwitcher
                currentUser={currentUser}
                users={users}
                onSwitchUser={handleSwitchUser}
                onUpdateRole={handleUpdateRole}
              />
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-[#363636] font-bold uppercase tracking-widest leading-none">System Uptime</p>
              <p className="text-xs font-mono font-bold text-[#363636]">99.982%</p>
            </div>

            <button 
              onClick={() => syncData(false)}
              className="px-4 py-2 firebase-gradient text-white rounded-lg text-xs font-bold shadow-md hover:scale-102 hover:shadow-orange-100 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sync Engines</span>
            </button>
          </div>
        </header>

        {/* Mobile Horizontal Navigation Tabs (Visible on screens < lg) */}
        <div className="lg:hidden bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-around text-xs font-semibold text-slate-500 overflow-x-auto gap-3 shrink-0 scrollbar-hide">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1 font-bold cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#363636] text-white shadow-sm' : 'bg-slate-100 text-slate-700'}`}
          >
            <Home className="w-3 h-3 text-[#20a6eb]" /> Cockpit
          </button>
          <button
            onClick={() => setViewMode('landing')}
            className="px-3 py-1.5 rounded-lg transition-all shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-[#e86420]" /> Front
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'topics' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
          >
            Pool ({activeUnclaimedCount})
          </button>
          <button
            onClick={() => setActiveTab('writer')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'writer' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
          >
            Drafting
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'editor' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
          >
            Editor Queue
          </button>
          {['Quality Checker', 'Editor', 'Senior Editor', 'Admin'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('quality-check')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'quality-check' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
            >
              Quality Check
            </button>
          )}
          {['Publisher', 'Senior Editor', 'Admin'].includes(currentUser.role) && (
            <button
              onClick={() => setActiveTab('publisher')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'publisher' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
            >
              Publishing
            </button>
          )}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'analytics' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
          >
            Analytics
          </button>
          {currentUser.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'admin' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
            >
              Admin
            </button>
          )}
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'docs' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
          >
            Manual & Spec
          </button>
        </div>

        {/* Content canvas context container */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          
          <div className="glass-card rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm">
            {activeTab === 'dashboard' && currentUser && (
              <PersonalDashboard
                currentUser={currentUser}
                topics={topics}
                articles={articles}
                config={config}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setViewMode('app');
                }}
                onSelectTopic={(topic) => {
                  setActiveTopicFromPool(topic);
                  setActiveTab('writer');
                }}
                onLoadArticle={(art) => {
                  setActiveArticleForEditing(art);
                }}
                onAddToast={addToast}
                syncMainData={async () => { await syncData(true); }}
              />
            )}

            {activeTab === 'topics' && (
              <TopicPool
                currentUser={currentUser}
                topics={topics}
                config={config}
                onProposeTopic={handleProposeTopic}
                onEditTopic={handleEditTopic}
                onModerateTopic={handleModerateTopic}
                onClaimTopic={handleClaimTopic}
                onReleaseTopic={handleReleaseTopic}
                onAddToast={addToast}
                onSelectTopicForArticle={handleSelectTopicForArticle}
              />
            )}

            {activeTab === 'writer' && (
              <WriterPortal
                currentUser={currentUser}
                articles={articles}
                claimedTopics={topics.filter(t => t.claimedById === currentUser.id)}
                activeTopic={activeTopicFromPool}
                activeArticleForEditing={activeArticleForEditing}
                onClearActiveArticleForEditing={() => setActiveArticleForEditing(null)}
                config={config}
                onClearActiveTopic={() => setActiveTopicFromPool(null)}
                onSaveDraft={handleSaveDraft}
                onSubmitArticle={handleSubmitArticle}
                onAddToast={addToast}
              />
            )}

            {activeTab === 'editor' && (
              <EditorDashboard
                currentUser={currentUser}
                articles={articles}
                config={config}
                onPostComment={handlePostComment}
                onSubmitDecision={handleSubmitDecision}
                onAddToast={addToast}
              />
            )}

            {activeTab === 'quality-check' && (
              <QualityCheckerDesk
                currentUser={currentUser}
                articles={articles}
                topics={topics}
                config={config}
                onPostComment={handlePostComment}
                onSubmitDecision={handleSubmitDecision}
                onAddToast={addToast}
              />
            )}

            {activeTab === 'publisher' && (
              <PublisherDesk
                currentUser={currentUser}
                articles={articles}
                topics={topics}
                config={config}
                onSubmitDecision={handleSubmitDecision}
                onAddToast={addToast}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard
                analyticsData={analytics}
                onRefresh={() => {
                  syncData();
                  addToast('Operations analytical registers updated.', 'success');
                }}
              />
            )}

            {activeTab === 'admin' && currentUser.role === 'Admin' && (
              <AdminPanel
                currentUser={currentUser}
                users={users}
                config={config}
                topicHistoryLogs={topicHistoryLogs}
                onUpdateRole={handleUpdateRole}
                onUpdateConfig={handleUpdateConfig}
                onAddToast={addToast}
              />
            )}

            {activeTab === 'docs' && (
              <DocsAndManual
                topics={topics}
                articles={articles}
                config={config}
                onAddToast={addToast}
                syncMainData={async () => { await syncData(true); }}
              />
            )}
          </div>

        </div>

        {/* Footer Section */}
        <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-400 mt-auto px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium text-slate-400">
              © {new Date().getFullYear()} RadarDesk Systems. Professional Polish Enterprise Theme.
            </p>
            <div className="flex items-center gap-3.5 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#e86420] inline-block" /> Ingress Gateway OK</span>
              <span>API SLA: &lt;112ms</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Real-time Toast notification rendering */}
      <div className="fixed top-6 right-6 z-50 pointer-events-none space-y-2">
        {toasts.map(toast => (
          <CustomNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

    </div>
  );
}
