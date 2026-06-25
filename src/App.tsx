import React, { useState, useEffect } from 'react';
import { User, Topic, Article, WorkflowConfig, UserRole } from './types';
import { Logo } from './components/Logo';
import RoleSwitcher from './components/RoleSwitcher';
import TopicPool from './components/TopicPool';
import WriterPortal from './components/WriterPortal';
import EditorDashboard from './components/EditorDashboard';
import QualityCheckerDesk from './components/QualityCheckerDesk';
import PublisherDesk from './components/PublisherDesk';
import AdminPanel from './components/AdminPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CustomNotification from './components/CustomNotification';
import PortalLanding from './components/PortalLanding';
import DocsAndManual from './components/DocsAndManual';
import PersonalDashboard from './components/PersonalDashboard';
import PerformanceManagement from './components/PerformanceManagement';
import AuthScreen from './components/AuthScreen';
import UATForm from './components/UATForm';
import BreakingNews from './components/BreakingNews';
import AviationPortal from './components/AviationPortal';
import TravelPortal from './components/TravelPortal';
import RadarPortal, { RadarSector } from './components/RadarPortal';
import { SharedLayout } from './components/SharedLayout';
import { User as UserIcon, BookOpen, LogOut } from 'lucide-react';
import { supabase, isStandalone } from './lib/supabase';
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
  Globe,
  Award,
  Search,
  X,
  FileQuestion,
  MessageSquare
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

const DEFAULT_CONFIG: WorkflowConfig = {
  aiScoreThreshold: 75,
  maxReviewCycles: 2,
  claimDurationMinutes: 10,
  categories: ['News', 'Feature', 'Opinion', 'Internal', 'Research'],
  rejectionReasons: ['Factual Inaccuracy', 'Grammar/Style', 'Off-topic', 'Sexist/Biased Content', 'Plagiarism'],
  rolePrivileges: [
    { role: 'Writer', allowedActions: ['propose_topic', 'claim_topic', 'submit_article'] },
    { role: 'Editor', allowedActions: ['propose_topic', 'claim_topic', 'submit_article', 'review_article'] },
    { role: 'Senior Editor', allowedActions: ['propose_topic', 'claim_topic', 'submit_article', 'review_article', 'manage_system'] },
    { role: 'Quality Checker', allowedActions: ['propose_topic', 'claim_topic', 'submit_article', 'quality_audit'] },
    { role: 'Publisher', allowedActions: ['propose_topic', 'claim_topic', 'submit_article', 'publish_live'] },
    { role: 'Admin', allowedActions: ['propose_topic', 'claim_topic', 'submit_article', 'review_article', 'quality_audit', 'publish_live', 'manage_system'] }
  ]
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [config, setConfig] = useState<WorkflowConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [topicHistoryLogs, setTopicHistoryLogs] = useState<any[]>([]);
  const [uatFeedback, setUatFeedback] = useState<any[]>([]);

  // Navigation and active workflow tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'topics' | 'writer' | 'editor' | 'quality-check' | 'publisher' | 'analytics' | 'performance' | 'admin' | 'docs' | 'uat'>('dashboard');
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [activeTopicFromPool, setActiveTopicFromPool] = useState<Topic | null>(null);
  const [activeArticleForEditing, setActiveArticleForEditing] = useState<Article | null>(null);
  const [showUATForm, setShowUATForm] = useState(false);
  const [activePortal, setActivePortal] = useState<'home' | 'breaking-news' | 'aviation' | 'travel' | 'radar'>('home');
  const [activeRadarSector, setActiveRadarSector] = useState<RadarSector>('Commercial Aviation');

  // Global search and details preview states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);

  // Handle URL routing for Breaking News and Aviation portals
  const handleUrlChange = () => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';

    if (path === '/breaking-news') {
      setActivePortal('breaking-news');
    } else if (path.startsWith('/radar')) {
      setActivePortal('radar');
      const sector = path.split('/')[2];
      if (sector === 'breaking-pulse') setActiveRadarSector('Breaking Pulse');
      else if (sector === 'commercial-aviation') setActiveRadarSector('Commercial Aviation');
      else if (sector === 'defense-space') setActiveRadarSector('Defense & Space');
      else if (sector === 'horizon') setActiveRadarSector('Horizon');
      else if (sector === 'active-incidents') setActiveRadarSector('Active Incidents');
      else if (sector === 'market-flashpoints') setActiveRadarSector('Market Flashpoints');
      else if (sector === 'live-vectors') setActiveRadarSector('Live Vectors');
      else if (sector === 'the-wire') setActiveRadarSector('The Wire');
      else if (!sector) setActiveRadarSector('Breaking Pulse');
    } else if (path === '/aviation') {
      setActivePortal('aviation');
    } else if (path === '/travel' || path.startsWith('/travel/')) {
      setActivePortal('travel');
    } else if (path === '/aircraft-sales') {
      setActivePortal('home');
    } else {
      setActivePortal('home');
    }
  };

  const handleNavigate = (target: string) => {
    if (target === 'Breaking News') {
      window.history.pushState({}, '', '/breaking-news');
    } else if (['Radar', 'Breaking Pulse', 'Commercial Aviation', 'Defense & Space', 'Horizon', 'Active Incidents', 'Market Flashpoints', 'Live Vectors', 'The Wire'].includes(target)) {
      const sector = (target === 'Radar' || target === 'Breaking Pulse') ? 'Breaking Pulse' : target;
      const sectorPath = sector.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
      window.history.pushState({}, '', `/radar/${sectorPath}`);
    } else if (target === 'Aviation') {
      window.history.pushState({}, '', '/aviation');
    } else if (target === 'Travel' || target.startsWith('travel/')) {
      const path = target === 'Travel' ? '/travel' : (target.startsWith('/') ? target : `/${target}`);
      window.history.pushState({}, '', path);
    } else if (target === 'Aircraft Sales') {
      window.history.pushState({}, '', '/aircraft-sales');
    } else {
      window.history.pushState({}, '', '/');
    }
    handleUrlChange();
  };

  useEffect(() => {
    // Initial check
    handleUrlChange();

    // Listen for back/forward buttons
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Keyboard shortcut listener to focus on '/' keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search articles"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          setSearchFocused(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);



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

  const hasPermission = (action: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true; // Administrator overrides all checks
    if (!config) return false;

    // Check in dynamic rolePrivileges configuration
    const privs = config.rolePrivileges;
    if (!privs) return false;

    const roleEntry = privs.find(p => p.role === currentUser.role);
    return roleEntry ? roleEntry.allowedActions.includes(action) : false;
  };

  // Main data sync engine
  const syncData = async (silent = false) => {
    const fetchJson = async (url: string, fallback: any) => {
      try {
        const r = await fetch(url);
        if (!r.ok) {
          console.warn(`Fetch to ${url} returned status ${r.status}`);
          return fallback;
        }
        const contentType = r.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return fallback;
        }
        return await r.json();
      } catch (err) {
        return fallback;
      }
    };

    try {
      let resUsers: User[];
      let resTopics: Topic[];
      let resArticles: Article[];
      let resConfig: WorkflowConfig;
      let resAnalytics: any;
      let resTopicLogs: any[];
      let resUat: any[];

      if (isStandalone()) {
        const [
          { data: usersData },
          { data: topicsData },
          { data: articlesData },
          { data: configData },
          { data: analyticsData },
          { data: logsData },
          { data: uatData }
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('topics').select('*'),
          supabase.from('articles').select('*').order('created_at', { ascending: false }),
          supabase.from('workflow_config').select('config').eq('id', 1).single(),
          supabase.from('web_analytics').select('*').eq('id', 1).single(),
          supabase.from('topics').select('id, moderation_history'),
          supabase.from('uat_feedback').select('*')
        ]);

        resUsers = (usersData || []).map(u => ({ ...u, approved: u.approved ?? true }));
        resTopics = (topicsData || []).map(t => ({
          ...t,
          submitterId: t.submitter_id,
          submitterName: t.submitter_name,
          claimedById: t.claimed_by_id,
          claimedByName: t.claimed_by_name,
          claimedAt: t.claimed_at,
          durationMinutes: t.duration_minutes,
          releasedCount: t.released_count,
          moderationHistory: t.moderation_history
        }));
        resArticles = (articlesData || []).map(a => ({
          ...a,
          writerId: a.writer_id,
          writerName: a.writer_name,
          editorId: a.editor_id,
          editorName: a.editor_name,
          topicId: a.topic_id,
          reviewCycles: a.review_cycles,
          createdAt: a.created_at,
          submittedAt: a.submitted_at,
          updatedAt: a.updated_at,
          aiValidation: a.ai_validation,
          headerImage: a.header_image,
          excerpt: a.excerpt
        }));
        resConfig = (configData as any)?.config || DEFAULT_CONFIG;
        resAnalytics = analyticsData || { pageViews: 0, submissionsCount: 0, approvals_count: 0, escalations_count: 0, avg_time_seconds: 0, active_users: 0 };
        resTopicLogs = (logsData || []).flatMap((t: any) => t.moderation_history || []);
        resUat = uatData || [];
      } else {
        [resUsers, resTopics, resArticles, resConfig, resAnalytics, resTopicLogs, resUat] = await Promise.all([
          fetchJson('/api/users', users || []),
          fetchJson('/api/topics', topics || []),
          fetchJson('/api/articles', articles || []),
          fetchJson('/api/workflow-config', DEFAULT_CONFIG),
          fetchJson('/api/analytics', { pageViews: 0 }),
          fetchJson('/api/topics/moderation-history', []),
          fetchJson('/api/uat/feedback', [])
        ]);
      }

      setUsers(resUsers);
      setTopics(resTopics);
      setArticles(resArticles || []); // Ensure it's never undefined
      setConfig(resConfig);
      setAnalytics(resAnalytics);
      setTopicHistoryLogs(resTopicLogs);
      setUatFeedback(resUat);

      // Load user session from localStorage
      const savedUserStr = localStorage.getItem('radar_logged_user');
      if (savedUserStr && resUsers) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          const freshUser = resUsers.find((u: User) => u.id === savedUser.id);
          if (freshUser && freshUser.approved !== false) {
            // Only update if reference or data changed (standard React check, but we ensure we don't loop)
            if (JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
              setCurrentUser(freshUser);
            }
          } else {
            localStorage.removeItem('radar_logged_user');
            setCurrentUser(null);
          }
        } catch {
          localStorage.removeItem('radar_logged_user');
          setCurrentUser(null);
        }
      } else if (!savedUserStr) {
        setCurrentUser(null);
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

    if (!isStandalone()) {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pageView' }),
      }).catch(() => { });
    }

    // Sync metrics repeatedly to ensure timer expirations are loaded smoothly on screen
    const interval = setInterval(() => {
      syncData(true);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('radar_logged_user', JSON.stringify(user));
    setCurrentUser(user);
    setShowAuthScreen(false);
    setViewMode('app');
  };

  const handleSignOut = () => {
    localStorage.removeItem('radar_logged_user');
    setCurrentUser(null);
    setShowAuthScreen(false);
    setViewMode('landing');
    addToast('Logged out of RadarDesk Operations successfully.', 'info');
  };

  // Handle switched participant view
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    addToast(`Perspectives Switched: Simulating dashboard as ${user.name} (${user.role})`, 'info');

    if (!isStandalone()) {
      // Trigger tick log in DB analytics
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activeUser' }),
      }).catch(() => { });
    }
  };

  // Modify user roles dynamically (satisfies role elevation request)
  const handleUpdateRole = async (userId: string, targetRole: UserRole) => {
    try {
      if (isStandalone()) {
        const { error } = await supabase.from('users').update({ role: targetRole }).eq('id', userId);
        if (error) throw error;
        addToast(`Operational role updated to ${targetRole}.`, 'success');
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, role: targetRole } : null);
        }
        await syncData(true);
      } else {
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
      }
    } catch (err: any) {
      addToast(err.message || 'Error setting participant operational role.', 'error');
    }
  };

  // Create user profile
  const handleAddUser = async (name: string, email: string, role: UserRole) => {
    try {
      if (isStandalone()) {
        addToast('Direct user creation from panel requires Admin API. Please use Register flow for new users.', 'warning');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, role }),
        });
        const data = await res.json();
        if (res.ok) {
          addToast(`Profile "${name}" initialized! Temporary password: ${data.temporaryPassword || 'Check directory.'}`, 'success');
          await syncData(true);
        } else {
          addToast(data.error || 'User creation refused.', 'error');
        }
      }
    } catch {
      addToast('Error registering new user profile.', 'error');
    }
  };

  // Remove user profile
  const handleDeleteUser = async (userId: string) => {
    try {
      if (isStandalone()) {
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) throw error;
        addToast('Workflow profile removed from registers.', 'info');
        await syncData(true);
      } else {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (res.ok) {
          addToast(data.message || 'Workflow profile removed from registers.', 'info');
          await syncData(true);
        } else {
          addToast(data.error || 'Failed to remove user.', 'error');
        }
      }
    } catch (err: any) {
      addToast(err.message || 'Error dropping participant from system.', 'error');
    }
  };

  // Reset database state to mock templates
  const handleResetDatabase = async () => {
    try {
      if (isStandalone()) {
        // Soft reset: clear topics and articles only (users and config are sensitive)
        const { error: tErr } = await supabase.from('topics').delete().neq('id', 'placeholder');
        const { error: aErr } = await supabase.from('articles').delete().neq('id', 'placeholder');

        if (tErr || aErr) throw new Error(tErr?.message || aErr?.message);

        addToast('System operational data cleared (Topics & Articles). User registry preserved.', 'success');
        await syncData(true);
      } else {
        const res = await fetch('/api/admin/reset', {
          method: 'POST',
        });
        const data = await res.json();
        if (res.ok) {
          addToast('System database states cleared and flashed to defaults!', 'success');
          await syncData(true);
          if (data.db && data.db.users && data.db.users.length > 0) {
            const firstAdmin = data.db.users.find((u: User) => u.role === 'Admin') || data.db.users[0];
            setCurrentUser(firstAdmin);
          }
        } else {
          addToast(data.error || 'DB Flash failed', 'error');
        }
      }
    } catch (err: any) {
      addToast(err.message || 'Error triggering system database purge.', 'error');
    }
  };

  // TOPICS ENGINE
  const handleProposeTopic = async (title: string, desc: string, cat: string) => {
    if (!currentUser) return;
    try {
      if (isStandalone()) {
        const { error } = await supabase.from('topics').insert({
          id: `t-${Date.now()}`,
          title,
          description: desc,
          category: cat,
          status: 'Proposed',
          submitter_id: currentUser.id,
          submitter_name: currentUser.name,
          moderation_history: [{
            action: 'Proposed',
            actorName: currentUser.name,
            actorRole: currentUser.role,
            timestamp: new Date().toISOString()
          }]
        });
        if (error) throw error;
        addToast('Travel Concept Proposed! Sent for editorial moderation.', 'success');
        await syncData(true);
      } else {
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
      }
    } catch (err: any) {
      addToast(err.message || 'Could not register proposal concept.', 'error');
    }
  };

  const handleEditTopic = async (topicId: string, title: string, desc: string, cat: string) => {
    if (!currentUser) return;
    try {
      if (isStandalone()) {
        const { error } = await supabase.from('topics').update({
          title,
          description: desc,
          category: cat
        }).eq('id', topicId);
        if (error) throw error;
        addToast('Travel Concept Updated successfully!', 'success');
        await syncData(true);
      } else {
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
      }
    } catch (err: any) {
      addToast(err.message || 'Could not save concept updates.', 'error');
    }
  };

  const handleModerateTopic = async (topicId: string, action: 'Approved' | 'Rejected', comments: string, reasons?: string[]) => {
    if (!currentUser) return;
    try {
      if (isStandalone()) {
        const topic = topics.find(t => t.id === topicId);
        if (!topic) throw new Error('Topic not found');

        const newHistory = [...(topic.moderationHistory || [])];
        newHistory.push({
          action,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          timestamp: new Date().toISOString(),
          comments,
          reasons
        });

        const { error } = await supabase.from('topics').update({
          status: action === 'Approved' ? 'Active' : 'Rejected',
          moderation_history: newHistory
        }).eq('id', topicId);
        if (error) throw error;

        addToast(`Topic proposal successfully moderated as ${action}!`, 'success');
        await syncData(true);
      } else {
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
      }
    } catch (err: any) {
      addToast(err.message || 'Error registering moderation choice.', 'error');
    }
  };

  const handleClaimTopic = async (topicId: string) => {
    if (!currentUser) return;
    try {
      if (isStandalone()) {
        const topic = topics.find(t => t.id === topicId);
        if (!topic) throw new Error('Topic not found');

        const newHistory = [...(topic.moderationHistory || [])];
        newHistory.push({
          action: 'Proposed', // keeping as part of hist
          actorName: currentUser.name,
          actorRole: 'Writer',
          timestamp: new Date().toISOString(),
          comments: `Claimed topic. Auto release started.`
        });

        const { error } = await supabase.from('topics').update({
          claimed_by_id: currentUser.id,
          claimed_by_name: currentUser.name,
          claimed_at: new Date().toISOString(),
          moderation_history: newHistory
        }).eq('id', topicId);
        if (error) throw error;

        addToast(`Concept claimed! Direct mode active.`, 'success');
        await syncData(true);
      } else {
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
      }
    } catch (err: any) {
      addToast(err.message || 'Error locking claim reservation.', 'error');
    }
  };

  const handleReleaseTopic = async (topicId: string) => {
    if (!currentUser) return;
    try {
      if (isStandalone()) {
        const topic = topics.find(t => t.id === topicId);
        if (!topic) throw new Error('Topic not found');

        const newHistory = [...(topic.moderationHistory || [])];
        newHistory.push({
          action: 'Proposed',
          actorName: currentUser.name,
          actorRole: currentUser.role,
          timestamp: new Date().toISOString(),
          comments: `Manual release of reservation.`
        });

        const { error } = await supabase.from('topics').update({
          claimed_by_id: null,
          claimed_by_name: null,
          claimed_at: null,
          moderation_history: newHistory
        }).eq('id', topicId);
        if (error) throw error;

        addToast('Reservation released.', 'info');
        await syncData(true);
      } else {
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
      }
    } catch (err: any) {
      addToast(err.message || 'Could not release claim.', 'error');
    }
  };

  // ARTICLES ENGINE
  const handleSaveDraft = async (id: string | null, title: string, content: string, topicId: string | null) => {
    if (!currentUser) return;
    try {
      if (isStandalone()) {
        const now = new Date().toISOString();
        let article: any;
        if (id) {
          const { data } = await supabase.from('articles').select('*').eq('id', id).single();
          article = data;
        }

        if (article) {
          const newRevisions = [...(article.revisions || [])];
          newRevisions.push({
            version: newRevisions.length + 1,
            title: article.title,
            content: article.content,
            updatedAt: now,
            score: article.score
          });

          const { data: updated, error } = await supabase.from('articles').update({
            title,
            content,
            updated_at: now,
            topic_id: topicId || article.topic_id,
            revisions: newRevisions
          }).eq('id', id).select().single();
          if (error) throw error;
          await syncData(true);
          return {
            ...updated,
            writerId: updated.writer_id, writerName: updated.writer_name,
            topicId: updated.topic_id, updatedAt: updated.updated_at
          };
        } else {
          const newArt = {
            id: `art-${Date.now()}`,
            title,
            content,
            status: 'Draft',
            writer_id: currentUser.id,
            writer_name: currentUser.name,
            topic_id: topicId,
            created_at: now,
            updated_at: now,
            history: [{
              id: `h-${Date.now()}`,
              action: 'Draft Created',
              actorName: currentUser.name,
              actorRole: 'Writer',
              timestamp: now,
              details: 'Draft initialized.'
            }]
          };
          const { data: created, error } = await supabase.from('articles').insert(newArt).select().single();
          if (error) throw error;
          await syncData(true);
          return {
            ...created,
            writerId: created.writer_id, writerName: created.writer_name,
            topicId: created.topic_id, createdAt: created.created_at, updatedAt: created.updated_at
          };
        }
      } else {
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
      }
    } catch (err: any) {
      addToast(err.message || 'Unable to persist draft manuscript.', 'error');
    }
  };

  const handleSubmitArticle = async (id: string) => {
    try {
      if (isStandalone()) {
        const { data: article } = await supabase.from('articles').select('*').eq('id', id).single();
        if (!article) throw new Error('Article not found');

        const now = new Date().toISOString();
        const newHistory = [...(article.history || [])];
        newHistory.push({
          id: `h-submit-${Date.now()}`,
          action: 'Submitted',
          actorName: article.writer_name,
          actorRole: 'Writer',
          timestamp: now,
          details: 'Article submitted directly (standalone mode).'
        });

        const { data: updated, error } = await supabase.from('articles').update({
          status: 'Submitted',
          submitted_at: now,
          history: newHistory
        }).eq('id', id).select().single();
        if (error) throw error;

        await syncData(true);
        return { success: true, message: 'Article submitted successfully!', article: updated };
      } else {
        const res = await fetch(`/api/articles/${id}/submit`, { method: 'POST' });
        const data = await res.json();
        await syncData(true);
        return data;
      }
    } catch (err: any) {
      addToast(err.message || 'Fatal: AI verification channels unresponsive.', 'error');
      return { success: false, message: 'Server gateway failed.', article: null as any };
    }
  };

  const handlePostComment = async (articleId: string, text: string) => {
    if (!currentUser) return;
    try {
      if (isStandalone()) {
        const article = articles.find(a => a.id === articleId);
        if (!article) throw new Error('Article not found');
        const newComments = [...(article.comments || [])];
        newComments.push({
          id: `c-${Date.now()}`,
          text,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          timestamp: new Date().toISOString()
        });
        const { error } = await supabase.from('articles').update({
          comments: newComments
        }).eq('id', articleId);
        if (error) throw error;
        await syncData(true);
      } else {
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
      }
    } catch (err: any) {
      addToast(err.message || 'Unable to post comment feedback.', 'error');
    }
  };

  const handleSubmitDecision = async (params: {
    articleId: string;
    action: string;
    comments: string;
    reasons?: string[];
  }) => {
    if (!currentUser) return;
    try {
      if (isStandalone()) {
        const { data: article } = await supabase.from('articles').select('*').eq('id', params.articleId).single();
        if (!article) throw new Error('Article not found');

        const now = new Date().toISOString();
        const newHistory = [...(article.history || [])];
        newHistory.push({
          id: `h-decision-${Date.now()}`,
          action: params.action === 'Approve' ? 'Approved' : 'Rejected',
          actorName: currentUser.name,
          actorRole: currentUser.role,
          timestamp: now,
          details: params.comments,
          reasons: params.reasons
        });

        // Determine next status
        let targetStatus = 'Draft';
        if (params.action === 'Approve') {
          if (currentUser.role === 'Editor') targetStatus = 'Approved';
          else if (currentUser.role === 'Quality Checker') targetStatus = 'Verified';
          else if (currentUser.role === 'Publisher') targetStatus = 'Live';
          else targetStatus = 'Approved';
        } else {
          targetStatus = 'Rejected';
        }

        const { error } = await supabase.from('articles').update({
          status: targetStatus,
          updated_at: now,
          history: newHistory,
          editor_id: currentUser.id,
          editor_name: currentUser.name
        }).eq('id', params.articleId);
        if (error) throw error;

        await syncData(true);
      } else {
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
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Decision error');
        }
        await syncData(true);
      }
    } catch (err: any) {
      addToast(err.message || 'Error registering decision.', 'error');
    }
  };

  // CONFIGS ENGINE
  const handleUpdateConfig = async (newConfig: Partial<WorkflowConfig>) => {
    try {
      if (isStandalone()) {
        const { error } = await supabase.from('workflow_config').update({
          config: { ...config, ...newConfig },
          updated_at: new Date().toISOString()
        }).eq('id', 1);
        if (error) throw error;
        await syncData(true);
      } else {
        const res = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        });
        if (res.ok) {
          await syncData(true);
        }
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to write changes to platform config.', 'error');
    }
  };

  // Helper trigger for writing claimed topics
  const handleSelectTopicForArticle = (topic: Topic) => {
    setActiveTopicFromPool(topic);
    setActiveTab('writer');
    addToast(`Initialized article draft based on claimed concept: "${topic.title}"`, 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border border-indigo-200 border-t-indigo-600 animate-spin" />
        <h3 className="text-sm font-bold text-slate-700 tracking-tight">Launching RadarDesk Operations Workspace...</h3>
        <p className="text-xs text-slate-400">Loading RBAC identities and operational parameters.</p>
      </div>
    );
  }

  // Gated Authentication view center
  if (!currentUser) {
    if (showAuthScreen) {
      return (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onAddToast={addToast}
          users={users}
          onBack={() => setShowAuthScreen(false)}
        />
      );
    }

    if (activePortal === 'travel') {
      return (
        <SharedLayout activeCategory="Travel" articles={articles} onNavigate={handleNavigate}>
          <TravelPortal
            articles={articles}
            onBack={() => {
              handleNavigate('/');
            }}
            onNavigate={handleNavigate}
          />
        </SharedLayout>
      );
    }

    if (activePortal === 'aviation') {
      return (
        <SharedLayout activeCategory="Aviation" articles={articles} onNavigate={handleNavigate}>
          <AviationPortal
            articles={articles}
            onBack={() => {
              window.history.pushState({}, '', '/');
              setActivePortal('home');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            onNavigate={handleNavigate}
          />
        </SharedLayout>
      );
    }

    if (activePortal === 'radar') {
      return (
        <SharedLayout activeCategory="Radar" articles={articles} onNavigate={handleNavigate}>
          <RadarPortal
            articles={articles}
            initialSector={activeRadarSector}
            onBack={() => {
              window.history.pushState({}, '', '/');
              setActivePortal('home');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            onNavigate={handleNavigate}
          />
        </SharedLayout>
      );
    }

    if (activePortal === 'breaking-news') {
      return (
        <SharedLayout activeCategory="Breaking News" articles={articles} onNavigate={handleNavigate}>
          <BreakingNews
            articles={articles}
            onNavigate={handleNavigate}
          />
        </SharedLayout>
      );
    }

    return (
      <SharedLayout
        activeCategory="Home"
        articles={articles}
        onNavigate={handleNavigate}
      >
        <PortalLanding
          topics={topics}
          articles={articles}
          config={config}
          onGetStarted={() => setShowAuthScreen(true)}
          onSignIn={() => setShowAuthScreen(true)}
          onNavigate={handleNavigate}
        />
      </SharedLayout>
    );
  }

  if (viewMode === 'landing') {
    if (activePortal === 'breaking-news') {
      return (
        <SharedLayout activeCategory="Breaking News" articles={articles} onNavigate={handleNavigate}>
          <BreakingNews
            articles={articles}
            onNavigate={handleNavigate}
          />
        </SharedLayout>
      );
    }

    if (activePortal === 'travel') {
      return (
        <SharedLayout activeCategory="Travel" articles={articles} onNavigate={handleNavigate}>
          <TravelPortal
            articles={articles}
            onBack={() => {
              window.history.pushState({}, '', '/');
              setActivePortal('home');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            onNavigate={handleNavigate}
          />
        </SharedLayout>
      );
    }

    if (activePortal === 'aviation') {
      return (
        <SharedLayout activeCategory="Aviation" articles={articles} onNavigate={handleNavigate}>
          <AviationPortal
            articles={articles}
            onBack={() => {
              window.history.pushState({}, '', '/');
              setActivePortal('home');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            onNavigate={handleNavigate}
          />
        </SharedLayout>
      );
    }

    if (activePortal === 'radar') {
      return (
        <SharedLayout activeCategory="Radar" articles={articles} onNavigate={handleNavigate}>
          <RadarPortal
            articles={articles}
            initialSector={activeRadarSector}
            onBack={() => {
              window.history.pushState({}, '', '/');
              setActivePortal('home');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            onNavigate={handleNavigate}
          />
        </SharedLayout>
      );
    }

    return (
      <PortalLanding
        topics={topics}
        articles={articles}
        config={config}
        onGetStarted={() => setViewMode('app')}
        onSignIn={() => {
          setViewMode('app');
          addToast("RadarDesk Session Initiated: Active profile assigned.", "success");
        }}
        onNavigate={(target) => {
          if (target === 'Breaking News') {
            window.history.pushState({}, '', '/breaking-news');
            setActivePortal('breaking-news');
          } else if (['Radar', 'Breaking Pulse', 'Commercial Aviation', 'Defense & Space', 'Horizon', 'Active Incidents', 'Market Flashpoints', 'Live Vectors', 'The Wire'].includes(target)) {
            const sector = (target === 'Radar' || target === 'Breaking Pulse') ? 'Breaking Pulse' : target;
            const sectorPath = sector.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
            window.history.pushState({}, '', `/radar/${sectorPath}`);
            setActivePortal('radar');
            setActiveRadarSector(sector as RadarSector);
            window.dispatchEvent(new PopStateEvent('popstate'));
          } else if (target === 'Aviation') {
            window.history.pushState({}, '', '/aviation');
            setActivePortal('aviation');
            window.dispatchEvent(new PopStateEvent('popstate'));
          } else if (target === 'Travel') {
            window.history.pushState({}, '', '/travel');
            setActivePortal('travel');
            window.dispatchEvent(new PopStateEvent('popstate'));
          } else if (target === 'Aircraft Sales') {
            window.history.pushState({}, '', '/aircraft-sales');
            // TODO: implement aircraft sales portal or redirect
          }
        }}
      />
    );
  }

  // Active unclaimed topics count alerts count check for writers
  const activeUnclaimedCount = topics.filter(t => t.status === 'Active' && !t.claimedById).length;

  // Filter list helper for search bar
  const query = searchQuery.trim().toLowerCase();
  const matchedArticles = query ? articles.filter(art => {
    return (
      art.title.toLowerCase().includes(query) ||
      art.status.toLowerCase().includes(query) ||
      art.writerName.toLowerCase().includes(query)
    );
  }) : [];

  const matchedTopics = query ? topics.filter(top => {
    return (
      top.title.toLowerCase().includes(query) ||
      top.status.toLowerCase().includes(query) ||
      top.submitterName.toLowerCase().includes(query) ||
      (top.claimedByName && top.claimedByName.toLowerCase().includes(query))
    );
  }) : [];

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
          <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <span className="text-lg font-bold tracking-tight font-display transition-colors group-hover:text-[#20a6eb]">RadarDesk</span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'dashboard'
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

          {(hasPermission('propose_topic') || hasPermission('claim_topic')) && (
            <button
              onClick={() => setActiveTab('topics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'topics'
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
          )}

          {(hasPermission('submit_article') || currentUser.role === 'Admin') && (
            <button
              onClick={() => setActiveTab('writer')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'writer'
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <FileEdit className="w-4 h-4 opacity-80" />
              <span className="flex-1 text-left">Drafting Desk</span>
            </button>
          )}

          {hasPermission('review_article') && (
            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'editor'
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Inbox className="w-4 h-4 opacity-80" />
              <span className="flex-1 text-left">Queue Reviews</span>
            </button>
          )}

          {(hasPermission('review_article') || hasPermission('quality_audit') || hasPermission('publish_live') || hasPermission('manage_system')) && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'analytics'
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Activity className="w-4 h-4 opacity-80" />
              <span className="flex-1 text-left">Analytics Dashboard</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('performance')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'performance'
              ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
          >
            <Award className="w-4 h-4 opacity-85 text-amber-400" />
            <span className="flex-1 text-left">Performance Desk</span>
          </button>

          {hasPermission('quality_audit') && (
            <button
              onClick={() => setActiveTab('quality-check')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'quality-check'
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

          {hasPermission('publish_live') && (
            <button
              onClick={() => setActiveTab('publisher')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'publisher'
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <Globe className="w-4 h-4 opacity-80" />
              <span className="flex-1 text-left">Publishing Desk</span>
            </button>
          )}

          {hasPermission('manage_system') && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'admin'
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'docs'
              ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
          >
            <HelpCircle className="w-4 h-4 opacity-80" />
            <span className="flex-1 text-left">Help & Manual</span>
          </button>

          <button
            onClick={() => setActiveTab('uat')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs ${activeTab === 'uat'
              ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
          >
            <MessageSquare className="w-4 h-4 opacity-80 text-blue-400" />
            <span className="flex-1 text-left">UAT Feedback</span>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </button>
        </nav>

        {/* Sidebar bottom portion with active user details + Switch User */}
        <div className="p-6 border-t border-white/10 bg-black/10">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold uppercase font-display text-xs shadow-inner">
                  {currentUser?.name?.substring(0, 2).toUpperCase() || 'TR'}
                </div>
                <div className="text-xs text-white">
                  <p className="font-bold uppercase tracking-tight text-[10px] text-sky-300">Active Profile</p>
                  <p className="font-semibold text-slate-100 truncate max-w-[110px] text-left">{currentUser?.name}</p>
                  <span className="text-[9px] text-slate-300 bg-white/10 px-1.5 py-0.5 rounded mt-0.5 inline-block uppercase font-mono">{currentUser?.role}</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1 text-rose-405 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                title="Log out of RadarDesk Hub"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
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
            <div className="lg:hidden flex items-center justify-center">
              <Logo className="w-7 h-7" />
            </div>

            <h1 className="text-sm font-bold text-[#363636] font-display uppercase tracking-wide hidden lg:block">
              {activeTab === 'topics' ? 'Concepts Pool Catalog' :
                activeTab === 'writer' ? 'Composition Desk' :
                  activeTab === 'editor' ? 'Editorial reviews pools' :
                    activeTab === 'quality-check' ? 'Quality Assurance Desk' :
                      activeTab === 'publisher' ? 'Publishing & Release Desk' :
                        activeTab === 'analytics' ? 'System Metrics & Throughput' :
                          activeTab === 'docs' ? 'Database Spec & User Manual' :
                            activeTab === 'uat' ? 'User Acceptance Testing & Debug Logs' : 'System Operations Console'}
            </h1>

            <span className="status-chip bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
              AI ENGINE: ONLINE
            </span>
          </div>

          {/* Universal Search Bar */}
          <div className="hidden md:block flex-1 max-w-sm mx-4 relative" id="header-search-container">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics by title, status, or author..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#20a6eb] focus:bg-white text-xs rounded-xl pl-9 pr-8 py-2 outline-none focus:ring-2 focus:ring-[#20a6eb]/10 transition-all font-medium text-[#363636]"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 cursor-pointer text-slate-405 hover:text-slate-700 bg-transparent border-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
                  <span className="text-[9px] font-bold font-mono text-slate-400 bg-slate-200/55 border border-slate-300 rounded px-1 flex items-center">/</span>
                </span>
              )}
            </div>

            {/* Dropdown Overlay Results */}
            {searchFocused && searchQuery.trim() && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setSearchFocused(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[380px] flex flex-col animate-slideIn">
                  <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono flex justify-between items-center shrink-0">
                    <span>Active Search Results</span>
                    <span className="text-slate-400 font-normal">
                      {(matchedArticles.length + matchedTopics.length)} records mapped
                    </span>
                  </div>

                  <div className="overflow-y-auto p-2 space-y-3 divide-y divide-slate-100">

                    {/* Articles Section */}
                    {matchedArticles.length > 0 && (
                      <div className="pt-1.5 first:pt-0 text-left">
                        <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-extrabold px-2 font-mono block mb-1">Articles</span>
                        <div className="space-y-1">
                          {matchedArticles.map(art => {
                            let badgeStyle = "bg-slate-100 text-slate-700";
                            if (art.status === 'Submitted') badgeStyle = "bg-sky-50 text-[#20a6eb] border-sky-100/50";
                            else if (art.status === 'Under Review') badgeStyle = "bg-indigo-50 text-indigo-600 border-indigo-100";
                            else if (art.status === 'Minor Revision') badgeStyle = "bg-amber-50 text-amber-700 border-amber-100";
                            else if (art.status === 'Rejected') badgeStyle = "bg-rose-50 text-rose-500 border-rose-100";
                            else if (art.status === 'Escalated') badgeStyle = "bg-purple-50 text-purple-700 border-purple-100";
                            else if (art.status === 'Approved') badgeStyle = "bg-[#20a6eb]/10 text-[#20a6eb] border-[#20a6eb]/20";
                            else if (art.status === 'Published') badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";

                            return (
                              <button
                                key={art.id}
                                type="button"
                                onClick={() => {
                                  setPreviewArticle(art);
                                  setSearchFocused(false);
                                }}
                                className="w-full text-left p-2 hover:bg-slate-50 rounded-lg transition-all flex items-start gap-2.5 group cursor-pointer border-0 bg-transparent"
                              >
                                <div className="p-1 rounded bg-sky-50 text-slate-400 group-hover:bg-sky-100 group-hover:text-[#20a6eb] transition-all">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-bold text-slate-800 truncate leading-snug group-hover:text-[#20a6eb] transition-all">{art.title}</h5>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-450 font-medium">
                                    <span>Author:</span>
                                    <span className="text-slate-600 truncate font-semibold">{art.writerName}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-semibold border ${badgeStyle}`}>{art.status}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Topics Section */}
                    {matchedTopics.length > 0 && (
                      <div className="pt-2 first:pt-0 text-left">
                        <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-extrabold px-2 font-mono block mb-1">Ideation Topics</span>
                        <div className="space-y-1">
                          {matchedTopics.map(top => {
                            let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
                            if (top.status === 'Active') badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";
                            else if (top.status === 'Completed') badgeStyle = "bg-indigo-50 text-indigo-750 border-indigo-100";
                            else if (top.status === 'Approved') badgeStyle = "bg-sky-50 text-[#20a6eb] border-sky-100";
                            else if (top.status === 'Released') badgeStyle = "bg-emerald-50 text-emerald-705 border-emerald-150";

                            return (
                              <button
                                key={top.id}
                                type="button"
                                onClick={() => {
                                  setPreviewTopic(top);
                                  setSearchFocused(false);
                                }}
                                className="w-full text-left p-2 hover:bg-slate-50 rounded-lg transition-all flex items-start gap-2.5 group cursor-pointer border-0 bg-transparent"
                              >
                                <div className="p-1 rounded bg-orange-50 text-slate-400 group-hover:bg-orange-100 group-hover:text-[#e86420] transition-all">
                                  <Compass className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-bold text-slate-800 truncate leading-snug group-hover:text-[#e86420] transition-all">{top.title}</h5>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-450 font-medium font-sans">
                                    <span>Proposed:</span>
                                    <span className="text-slate-600 truncate font-semibold">{top.submitterName}</span>
                                    {top.claimedByName && (
                                      <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-450 italic">Claim: {top.claimedByName}</span>
                                      </>
                                    )}
                                    <span className="text-slate-300">•</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-semibold border ${badgeStyle}`}>{top.status}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No matches */}
                    {matchedArticles.length === 0 && matchedTopics.length === 0 && (
                      <div className="p-6 text-center space-y-2">
                        <div className="flex justify-center animate-bounce duration-1000">
                          <FileQuestion className="w-8 h-8 text-slate-300" />
                        </div>
                        <h6 className="text-xs font-bold text-slate-700">No Matching Records Located</h6>
                        <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px] mx-auto">
                          Check spelling parameters or search with tags (e.g., "Draft", "Approved", "Venice")
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              </>
            )}
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
          {(hasPermission('quality_audit') || ['Quality Checker', 'Editor', 'Senior Editor', 'Admin'].includes(currentUser.role)) && (
            <button
              onClick={() => setActiveTab('quality-check')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'quality-check' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
            >
              Quality Check
            </button>
          )}
          {(hasPermission('publish_live') || ['Publisher', 'Senior Editor', 'Admin'].includes(currentUser.role)) && (
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
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'performance' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
          >
            Performance
          </button>
          {(hasPermission('manage_system') || ['Admin', 'Senior Editor'].includes(currentUser.role)) && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${activeTab === 'admin' ? 'bg-[#363636] text-white font-bold shadow-sm' : ''}`}
            >
              Admin
            </button>
          )}
          <button
            onClick={() => setActiveTab('uat')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 font-bold ${activeTab === 'uat' ? 'bg-[#363636] text-white shadow-sm' : 'bg-slate-100 text-slate-700'}`}
          >
            UAT
          </button>
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
                onRefresh={() => syncData(true)}
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

            {activeTab === 'performance' && config && (
              <PerformanceManagement
                currentUser={currentUser}
                users={users}
                articles={articles}
                topics={topics}
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onAddToast={addToast}
              />
            )}

            {activeTab === 'admin' && (hasPermission('manage_system') || ['Admin', 'Senior Editor'].includes(currentUser.role)) && (
              <AdminPanel
                currentUser={currentUser}
                users={users}
                config={config}
                topicHistoryLogs={topicHistoryLogs}
                articles={articles}
                onUpdateRole={handleUpdateRole}
                onUpdateConfig={handleUpdateConfig}
                onAddToast={addToast}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onResetDatabase={handleResetDatabase}
                onRefresh={() => syncData(true)}
                uatFeedback={uatFeedback}
              />
            )}

            {activeTab === 'uat' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
                <UATForm
                  currentUser={currentUser}
                  onClose={() => setActiveTab('dashboard')}
                  onAddToast={addToast}
                  isInline={true}
                />
              </div>
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

      {/* ARTICLE UNIVERSAL PREVIEW MODAL */}
      {previewArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn" id="search-article-preview-modal">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-indigo-100 flex justify-between items-start relative shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20a6eb] to-[#e86420]" />
              <div className="space-y-1.5 flex-1 pr-6 text-left">
                <span className="text-[9px] font-mono font-black uppercase text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">Universal Records • Article Specs</span>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display pr-3 leading-snug">{previewArticle.title}</h3>
                <div className="flex flex-wrap gap-2 text-[10.5px] text-slate-500 font-sans">
                  <span>Author: <strong className="text-slate-700 font-black">{previewArticle.writerName}</strong></span>
                  <span>•</span>
                  <span>Created: <strong className="text-slate-600">{new Date(previewArticle.createdAt).toLocaleDateString()}</strong></span>
                  <span>•</span>
                  <span>Rating: <strong className="text-sky-600">{previewArticle.score}/100</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer active:scale-95 transition-all bg-transparent border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 font-sans">

              {/* Status Indicator Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-left">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Status Badge</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded font-black border bg-[#20a6eb]/10 text-[#20a6eb] border-[#20a6eb]/10 uppercase text-[10px]">
                    {previewArticle.status}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Review Rounds</span>
                  <span className="font-bold text-slate-700 block mt-1">{previewArticle.reviewCycles} Cycle(s)</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Assigned Editor</span>
                  <span className="font-bold text-slate-700 block mt-1 truncate">{previewArticle.editorName || 'Not Assigned'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Topic ID Mapped</span>
                  <span className="font-mono text-slate-600 block mt-1 font-bold">{previewArticle.topicId || 'Free Flow'}</span>
                </div>
              </div>

              {/* Text Area Content Formatted */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Article Payload Preview</span>
                <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl max-h-[220px] overflow-y-auto border border-slate-800 text-[11.5px] leading-relaxed font-mono whitespace-pre-wrap select-all shadow-inner">
                  {previewArticle.content || 'No text written in this draft block.'}
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Feedback / Editorial Notes ({previewArticle.comments?.length || 0})</span>
                {previewArticle.comments?.length > 0 ? (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                    {previewArticle.comments.map((comm, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs">
                        <div className="flex justify-between text-[10px] pb-1 font-mono text-slate-400 font-bold">
                          <span>{comm.authorName} ({comm.authorRole})</span>
                          <span>{new Date(comm.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[#363636] leading-relaxed">{comm.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-450 italic">No feedback posts submitted.</p>
                )}
              </div>

            </div>

            {/* Footer containing quick link to portal desk */}
            <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-black">Ready to inspect?</span>
              <button
                type="button"
                onClick={() => {
                  let tabTarget: any = 'writer';
                  if (['Submitted', 'Under Review', 'Minor Revision', 'Rejected', 'Escalated'].includes(previewArticle.status)) {
                    tabTarget = 'editor';
                  } else if (previewArticle.status === 'Approved') {
                    tabTarget = 'quality-check';
                  } else if (previewArticle.status === 'Published') {
                    tabTarget = 'publisher';
                  }
                  setActiveTab(tabTarget);
                  setPreviewArticle(null);
                  addToast(`Switched active desk, locating requested article...`, 'info');
                }}
                className="px-4 py-2 bg-[#363636] hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border-0"
              >
                <span>Navigate to Panel</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TOPIC UNIVERSAL PREVIEW MODAL */}
      {previewTopic && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn" id="search-topic-preview-modal">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-indigo-100 flex justify-between items-start relative shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20a6eb] to-[#e86420]" />
              <div className="space-y-1.5 flex-1 pr-6 text-left">
                <span className="text-[9px] font-mono font-black uppercase text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">Universal Records • Concept Brief specs</span>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display pr-3 leading-snug">{previewTopic.title}</h3>
                <div className="flex flex-wrap gap-2 text-[10.5px] text-slate-500 font-sans">
                  <span>Proposed By: <strong className="text-slate-700 font-black">{previewTopic.submitterName}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-slate-650 bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-[10px] border border-slate-200">{previewTopic.category}</strong></span>
                  <span>•</span>
                  <span>Min Claim: <strong className="text-[#e86420]">{previewTopic.durationMinutes} mins</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTopic(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer active:scale-95 transition-all bg-transparent border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 font-sans">

              {/* Status Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-left">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Concept Status</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded font-black border bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px]">
                    {previewTopic.status}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Claimed Identity</span>
                  <span className="font-bold text-slate-700 block mt-1 truncate">{previewTopic.claimedByName || 'Open Assignment'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Released Counter</span>
                  <span className="font-bold text-slate-700 block mt-1">{previewTopic.releasedCount} release(s)</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Concept Identifier</span>
                  <span className="font-mono text-slate-600 block mt-1 font-bold">{previewTopic.id}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Concept Description Brief</span>
                <p className="text-xs text-slate-750 bg-slate-50 p-4 rounded-xl border border-slate-150 leading-relaxed font-sans">{previewTopic.description || 'No descriptive brief documented.'}</p>
              </div>

              {/* Moderation logs */}
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Moderation History Log</span>
                {previewTopic.moderationHistory?.length > 0 ? (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto font-mono text-[10px]">
                    {previewTopic.moderationHistory.map((item, index) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-150 font-sans text-xs">
                        <div className="flex justify-between text-[10px] pb-1 font-mono text-slate-400 font-bold">
                          <span>Action: {item.action} by {item.actorName} ({item.actorRole})</span>
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        {item.comments && (
                          <p className="text-slate-650 italic mt-0.5 bg-white p-1.5 rounded border border-slate-100">"{item.comments}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-450 italic">No historical moderation events recorded.</p>
                )}
              </div>

            </div>

            {/* Footer with action to navigate to Concepts Pool */}
            <div className="bg-slate-50 px-6 py-4.5 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-black">Interested in drafting this concept?</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('topics');
                  setPreviewTopic(null);
                  addToast(`Switched to Concept Pool to request or claim assignment...`, 'info');
                }}
                className="px-4 py-2 bg-[#363636] hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border-0"
              >
                <span>Navigate to Concepts Pool</span>
              </button>
            </div>

          </div>
        </div>
      )}

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
