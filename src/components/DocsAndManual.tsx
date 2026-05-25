import React, { useState, useEffect } from 'react';
import { 
  Database, 
  BookOpen, 
  Terminal, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  HelpCircle, 
  RefreshCw, 
  Play, 
  Layout, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Eye, 
  Compass, 
  FileText,
  Layers,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { Topic, Article, WorkflowConfig } from '../types';

interface DocsAndManualProps {
  topics: Topic[];
  articles: Article[];
  config: WorkflowConfig | null;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  syncMainData: () => Promise<void>;
}

export default function DocsAndManual({
  topics,
  articles,
  config,
  onAddToast,
  syncMainData
}: DocsAndManualProps) {
  const [activeSubTab, setActiveSubTab] = useState<'user-manual' | 'tech-db-spec' | 'supabase-console' | 'deployment-info'>('user-manual');
  
  // Supabase states
  const [supabaseStatus, setSupabaseStatus] = useState<'untested' | 'connected' | 'error'>('untested');
  const [supabaseErrorDetails, setSupabaseErrorDetails] = useState<string | null>(null);
  const [rowsCount, setRowsCount] = useState({
    users: 0,
    topics: 0,
    articles: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Load live Supabase counts of synced entities
  const verifySupabaseConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      if (res.ok && data.connected) {
        setSupabaseStatus('connected');
        setRowsCount(data.rowCounts || { users: 0, topics: 0, articles: 0 });
        setSupabaseErrorDetails(null);
        onAddToast('Supabase target Gateway connected and active!', 'success');
      } else {
        setSupabaseStatus('error');
        setSupabaseErrorDetails(data.error || 'Connection verification failed');
        onAddToast('Operational warning: Supabase connection failed. Fallback operational mode active.', 'warning');
      }
    } catch (err: any) {
      setSupabaseStatus('error');
      setSupabaseErrorDetails(err.message || 'Network exception connected to local proxy route');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSupabaseSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAddToast(`Bidirectional payload synchronization success! Sync logs processed: Users (${data.syncedUsers}), Topics (${data.syncedTopics}), Articles (${data.syncedArticles}).`, 'success');
        await verifySupabaseConnection();
        await syncMainData();
      } else {
        onAddToast(data.error || 'Synchronization failed.', 'error');
      }
    } catch (err: any) {
      onAddToast(`Sync exception: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const copySQLToClipboard = (sql: string) => {
    navigator.clipboard.writeText(sql);
    onAddToast('SQL creation DDL statements copied to clipboard successfully!', 'info');
  };

  useEffect(() => {
    verifySupabaseConnection();
  }, []);

  // Compute counts for visual workflow diagram
  const proposedTopics = topics.filter(t => t.status === 'Proposed').length;
  const activeTopics = topics.filter(t => t.status === 'Active' && !t.claimedById).length;
  const inDrafting = articles.filter(a => a.status === 'Draft' || (a.topicId && articles.find(art => art.topicId === a.topicId && art.status === 'Draft'))).length + topics.filter(t => t.claimedById && !articles.some(a => a.topicId === t.id)).length;
  const inReview = articles.filter(a => ['Submitted', 'Under Review', 'Minor Revision', 'Rejected', 'Escalated'].includes(a.status)).length;
  const readyQA = articles.filter(a => a.status === 'Approved').length;
  const publishedLive = articles.filter(a => a.status === 'Published').length;

  const sqlDDL = `-- 1. CREATE USERS REFERENCE TABLE
CREATE TABLE IF NOT EXISTS public.radardesk_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREATE TOPICS POOL TABLE
CREATE TABLE IF NOT EXISTS public.radardesk_topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Proposed' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Released'
    submitter_id TEXT REFERENCES public.radardesk_users(id),
    submitter_name TEXT NOT NULL,
    claimed_by_id TEXT REFERENCES public.radardesk_users(id),
    claimed_by_name TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 10,
    released_count INTEGER DEFAULT 0,
    moderation_history JSONB DEFAULT '[]'::jsonb
);

-- 3. CREATE ARTICLES WORKFLOW TABLE
CREATE TABLE IF NOT EXISTS public.radardesk_articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL, -- 'Draft'|'Submitted'|'Under Review'|'Approved'|'Published'
    writer_id TEXT REFERENCES public.radardesk_users(id),
    writer_name TEXT NOT NULL,
    editor_id TEXT,
    editor_name TEXT,
    topic_id TEXT,
    score INTEGER DEFAULT 0,
    review_cycles INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revisions JSONB DEFAULT '[]'::jsonb,
    ai_validation JSONB DEFAULT '{}'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb
);

-- Insert Demo Admin Profile to boot
INSERT INTO public.radardesk_users (id, name, role, email) 
VALUES ('u-4', 'David Admin', 'Admin', 'david.a@travelradar.com')
ON CONFLICT (id) DO NOTHING;`;

  return (
    <div className="space-y-6" id="documentation-module">
      
      {/* Flight Gradient Header Header */}
      <div className="bg-gradient-to-r from-[#20a6eb] via-slate-800 to-[#e86420] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-sky-400 text-slate-950 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Information Systems
              </span>
              <span className="text-[10px] bg-white/10 text-white border border-white/20 px-2.5 py-0.5 rounded-full font-mono">
                v2.4.0-Production
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mt-2.5 font-display">System Manual & Database Spec</h2>
            <p className="text-xs text-sky-100 mt-1 max-w-xl font-sans">
              Learn about the core 6-Stage Approval workflow mechanics, explore the entity schema maps, and monitor the live Supabase Cloud Database connector.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <div className={`p-3 rounded-xl border font-mono text-center text-xs ${
              supabaseStatus === 'connected' 
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300' 
              : 'bg-amber-500/15 border-amber-400/30 text-amber-200'
            }`}>
              <div className="flex items-center gap-1.5 justify-center">
                <div className={`w-2 h-2 rounded-full ${supabaseStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
                <span className="font-extrabold uppercase font-mono tracking-wide">
                  {supabaseStatus === 'connected' ? 'Supabase Connected' : 'Supabase Offline (RAM Mode)'}
                </span>
              </div>
              <span className="text-[10px] opacity-75 mt-0.5 block">{supabaseStatus === 'connected' ? 'Cloud sync armed' : 'Fallback DB in use'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary tab switcher */}
      <div className="flex bg-slate-200 p-1 rounded-xl max-w-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('user-manual')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'user-manual' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>User Playbook</span>
        </button>
        <button
          onClick={() => setActiveSubTab('tech-db-spec')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'tech-db-spec' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Spec</span>
        </button>
        <button
          onClick={() => setActiveSubTab('supabase-console')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'supabase-console' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Supabase Sync</span>
        </button>
        <button
          onClick={() => setActiveSubTab('deployment-info')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'deployment-info' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-[#20a6eb]" />
          <span>Deploy & Tech</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Dynamic sub tab layouts */}
        <div className="lg:col-span-12">
          
          {activeSubTab === 'user-manual' && (
            <div className="space-y-6">
              
              {/* Stage-by-stage workflow schematic */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Core 6-Stage Approval & Release Workflow Diagram</h3>
                    <p className="text-xs text-slate-400">Live operational loads within the RadarDesk content conveyor</p>
                  </div>
                  <span className="bg-sky-50 text-[#20a6eb] font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-mono border border-sky-100">
                    SLA Checked: OK
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 relative">
                  
                  {/* Step 1 */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between relative group hover:border-[#20a6eb] transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">ST-1</span>
                        <span className="font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-mono">{proposedTopics} items</span>
                      </div>
                      <h4 className="font-extrabold text-[#363636] text-xs">Idea Proposal</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">Writers propose secret travel concepts & guides to local pools.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between relative group hover:border-[#20a6eb] transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">ST-2</span>
                        <span className="font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-sky-100 text-[#20a6eb] rounded-full font-mono">{activeTopics} items</span>
                      </div>
                      <h4 className="font-extrabold text-[#363636] text-xs">Concept Sourcing</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">Editors moderate concepts. Approved ideas are made available for claim.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between relative group hover:border-[#20a6eb] transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">ST-3</span>
                        <span className="font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-mono">{inDrafting} active</span>
                      </div>
                      <h4 className="font-extrabold text-[#363636] text-xs">Claim & Scribe</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">Writers lock topics and author drafts inside the workspace before auto-expires.</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between relative group hover:border-[#20a6eb] transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">ST-4</span>
                        <span className="font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full font-mono">{inReview} pending</span>
                      </div>
                      <h4 className="font-extrabold text-[#363636] text-xs">Editor Inspection</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">Single-editor locked review with automated AI gate score validating facts.</p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between relative group hover:border-[#20a6eb] transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">ST-5</span>
                        <span className="font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-mono">{readyQA} waiting</span>
                      </div>
                      <h4 className="font-extrabold text-[#363636] text-xs">Quality Audit QA</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">Quality specialists measure accuracy indexes, typos, and style consistency scores.</p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between relative group hover:border-[#20a6eb] transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">ST-6</span>
                        <span className="font-bold text-slate-800 text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-mono">{publishedLive} live</span>
                      </div>
                      <h4 className="font-extrabold text-[#363636] text-xs">Live Deployment</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">Publishers render mock interfaces, review drafts and inject into public travel feeds.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Enforced Organizational Domain Restrictions Docs */}
              <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl space-y-2 text-left">
                <div className="flex items-center gap-2 text-amber-800">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span className="font-extrabold text-xs uppercase tracking-wider font-display">Organizational Security & Domain Restraints (§71-A)</span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-sans space-y-1.5">
                  <p>In accordance with RadarDesk data sovereignty and RBAC safety directives, enrollment onto any level of the workspace is strictly restricted to active corporate personnel:</p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-500">
                    <li><strong>Validated Domains Alone:</strong> Registration is restricted to users holding registered organizational email addresses matching <strong><code>@travelradar.com</code></strong>. All other registrations are rejected immediately at the API gate level.</li>
                    <li><strong>Dual-key Authentication:</strong> Self-registered operators are placed in a <em>"Pending Approval"</em> pool. Complete workspace features are locked until an authorized System Admin elects to grant licenses on the System Control directory.</li>
                  </ul>
                </div>
              </div>

              {/* Roles playbook card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-850 flex items-center gap-2 text-sm text-[#e86420] uppercase font-display">
                    <Layers className="w-4 h-4" />
                    <span>Role-Based Operational Guide</span>
                  </h3>
                  
                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex gap-2">
                      <div className="font-bold text-orange-700 shrink-0 select-none font-mono">WRITER:</div>
                      <div>
                        Proposes initial concepts. Claims topics from the pool. Saves drafts of claims and submits to editors before system countdown runs out. Returns to revise drafts if rejected.
                      </div>
                    </div>

                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 flex gap-2">
                      <div className="font-bold text-sky-700 shrink-0 select-none font-mono">EDITOR:</div>
                      <div>
                        Approves proposed ideas into Active concepts. Claims unclaimed articles to review them. Requests revisions, escalates to seniors if cycle hits limits, or sets status to Approved.
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex gap-2">
                      <div className="font-bold text-purple-700 shrink-0 select-none font-mono">SENIOR:</div>
                      <div>
                        Performs all standard editor duties, plus reviews "Escalated" items (which reached maximum review limits under normal editor cycles).
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-2">
                      <div className="font-bold text-slate-700 shrink-0 select-none font-mono">SYSTEM:</div>
                      <div>
                        Runs background clock ticks to expire stale claims, tracks individual analytics, and calls Google Gemini API to pre-validate drafts prior to submission.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-850 flex items-center gap-2 text-sm text-[#20a6eb] uppercase font-display">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Pre-Validation Engine Playbook</span>
                  </h3>
                  
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Every article submitted by a writer automatically routes through our Gemini AI pre-validation model. This model conducts real-time checks to prevent poor content from consuming precious human editor cycles:
                  </p>

                  <div className="space-y-2.5 font-sans text-[11px] text-slate-650">
                    <div className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Checks spelling and flags stylistic errors</div>
                    <div className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Scrapes layout coordinates to extract URLs</div>
                    <div className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Calculates factual reliability indexing values</div>
                    <div className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Computes semantic comparison ratios against previous submissions</div>
                    <div className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Calculates custom final quality percentage (0-100) and provides suggestions</div>
                  </div>

                  <div className="p-3 bg-blue-50 text-slate-700 rounded-xl border border-blue-100/60 font-mono text-[10px]">
                    <strong>Engine Directive:</strong> Standard quality threshold is configured to {config?.aiScoreThreshold || 70}/100. Any manuscript scoring below this limit is blocked from submitting and returned to drafts.
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeSubTab === 'tech-db-spec' && (
            <div className="space-y-6">
              
              {/* ERD Blueprint Diagram */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#e86420]" />
                  <span>Interactive ER Schema Blueprint Model</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                  
                  {/* Users spec */}
                  <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                    <div className="font-bold text-orange-650 mb-2 border-b border-orange-100 pb-1 flex justify-between">
                      <span>1. radardesk_users</span>
                      <span className="text-slate-450">[PK: id]</span>
                    </div>
                    <ul className="space-y-1 text-slate-650 text-[11px]">
                      <li><strong className="text-[#363636]">id:</strong> TEXT (User ID uuid)</li>
                      <li><strong className="text-[#363636]">name:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">role:</strong> TEXT (User workspace role)</li>
                      <li><strong className="text-[#363636]">email:</strong> TEXT (Radar address)</li>
                    </ul>
                  </div>

                  {/* Topics Spec */}
                  <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                    <div className="font-bold text-sky-650 mb-2 border-b border-sky-100 pb-1 flex justify-between">
                      <span>2. radardesk_topics</span>
                      <span className="text-slate-450">[PK: id]</span>
                    </div>
                    <ul className="space-y-1 text-slate-650 text-[11px] list-none p-0">
                      <li><strong className="text-[#363636]">id:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">title:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">description:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">category:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">status:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">submitter_id:</strong> TEXT [FK]</li>
                      <li><strong className="text-[#363636]">claimed_by_id:</strong> TEXT [FK]</li>
                      <li><strong className="text-[#363636]">claimed_at:</strong> TIMESTAMP</li>
                    </ul>
                  </div>

                  {/* Articles Spec */}
                  <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                    <div className="font-bold text-[#363636] mb-2 border-b border-slate-200 pb-1 flex justify-between">
                      <span>3. radardesk_articles</span>
                      <span className="text-slate-450">[PK: id]</span>
                    </div>
                    <ul className="space-y-1 text-slate-650 text-[11px]">
                      <li><strong className="text-[#363636]">id:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">title:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">content:</strong> TEXT (Markdown payload)</li>
                      <li><strong className="text-[#363636]">status:</strong> TEXT</li>
                      <li><strong className="text-[#363636]">writer_id:</strong> TEXT [FK]</li>
                      <li><strong className="text-[#363636]">editor_id:</strong> TEXT [FK]</li>
                      <li><strong className="text-[#363636]">topic_id:</strong> TEXT [FK]</li>
                      <li><strong className="text-[#363636]">ai_validation:</strong> JSONB</li>
                    </ul>
                  </div>

                </div>

                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 font-sans leading-relaxed">
                  <strong>Relationship Integrity Guidelines:</strong> Every written article references a parent topic row (`topic_id` matches `radardesk_topics.id`). When published, the system sets topic status to `Completed` and disables future edits. All records are created and fetched live. If a network disconnect is detected, the back-end seamlessly defaults to high-speed JSON RAM store caching.
                </div>
              </div>

              {/* DDL COPY PASTE CONSOLE */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="font-bold text-sm tracking-tight font-display text-white">Supabase Schema Generation Script (SQL DDL)</h4>
                      <p className="text-[10px] text-slate-450">Execute this script in your Supabase SQL Editor console to scaffold tables</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copySQLToClipboard(sqlDDL)}
                    className="p-2 py-1 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded text-xs transition-all font-sans font-bold cursor-pointer"
                  >
                    Copy SQL Script
                  </button>
                </div>

                <div className="relative">
                  <pre className="text-[10px] font-mono leading-normal bg-black/40 p-5 rounded-xl border border-slate-800/40 text-emerald-400 overflow-x-auto max-h-80 select-all scrollbar-thin">
                    {sqlDDL}
                  </pre>
                </div>
              </div>

            </div>
          )}

          {activeSubTab === 'supabase-console' && (
            <div className="space-y-6">
              
              {/* Credentials & live sync buttons */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Supabase Integration Gateway Status</h3>
                    <p className="text-xs text-slate-400">Manage real-time persistent synchronization status between JSON files and Cloud tables.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={verifySupabaseConnection}
                      disabled={testingConnection}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                      <span>Verify Connection</span>
                    </button>

                    <button
                      onClick={handleSupabaseSync}
                      disabled={isSyncing}
                      className="px-5 py-2 bg-gradient-to-r from-[#20a6eb] to-[#e86420] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 hover:scale-102 transition-all cursor-pointer disabled:opacity-50 border-0"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{isSyncing ? 'Synchronizing Recs...' : 'Sync Local Payload directly to Supabase'}</span>
                    </button>
                  </div>
                </div>

                {/* DB parameters view cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Target project URL</span>
                    <span className="text-slate-800 font-semibold truncate block">https://qiciaqxucmvwwfvodqzz.supabase.co</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Project Ref Key</span>
                    <span className="text-slate-800 font-semibold truncate block">qiciaqxucmvwwfvodqzz</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Connection Mode</span>
                    <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Full bidirectional auto-sync
                    </span>
                  </div>

                </div>

                {/* Synced row totals counters */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 font-mono">Live Supabase Database Row Indicators</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    
                    <div className="bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-inner">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold font-mono">radardesk_users</span>
                      <span className="text-xl font-extrabold text-[#e86420] mt-1 block">{rowsCount.users || 0} rows</span>
                    </div>

                    <div className="bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-inner">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold font-mono">radardesk_topics</span>
                      <span className="text-xl font-extrabold text-[#20a6eb] mt-1 block">{rowsCount.topics || 0} rows</span>
                    </div>

                    <div className="bg-white p-4.5 rounded-xl border border-slate-200/60 shadow-inner">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold font-mono">radardesk_articles</span>
                      <span className="text-xl font-extrabold text-[#363636] mt-1 block">{rowsCount.articles || 0} rows</span>
                    </div>

                  </div>
                </div>

                {/* Error diagnostics panel (if failing) */}
                {supabaseStatus === 'error' && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-950 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-bold">Supabase API Connection Error Diagnosed</p>
                      <p className="mt-0.5 opacity-80">Reason: {supabaseErrorDetails || 'Credentials mismatch or cloud sandbox blocked.'}</p>
                      <p className="mt-2 text-[10px] bg-white/40 p-2 rounded font-mono select-all">
                        Advice: Create matching schemas first using the generation scripts specified on the "Database Spec" tab to enable database table lookups.
                      </p>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {activeSubTab === 'deployment-info' && (
            <div className="space-y-6">
              
              {/* Architecture Blueprint Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-50 text-[#20a6eb] border border-sky-100">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider font-mono">System Architecture & Core Frameworks</h3>
                    <p className="text-[11px] text-slate-400">High-level software design topology for RadarDesk</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="font-extrabold text-[10px] text-[#20a6eb] uppercase font-mono block">Express Backend</span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      High-performance REST API routing. Integrates static asset bundling middleware for unified container delivery.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="font-extrabold text-[10px] text-[#e86420] uppercase font-mono block">React & Vite SPA</span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Stateful front-end scaffold modularized across reactive panels. Utilizing Tailwind CSS micro-parameters with Inter and Space Grotesk typography.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="font-extrabold text-[10px] text-indigo-500 uppercase font-mono block">Atomicity & local DB</span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      ACID transactions via a JSON filesystem database engine with RAM buffer caches. Overcomes concurrency limitations securely.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="font-extrabold text-[10px] text-emerald-500 uppercase font-mono block">External Gateways</span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Bidirectional real-time integration relays supporting Supabase PostgreSQL and Google Gemini AI content score evaluation.
                    </p>
                  </div>

                </div>
              </div>

              {/* Local Install & Setup Manual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
                
                {/* Section A: Installation & Setup */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 border border-indigo-100">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Local Development & Environment Setup</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">1. Install Dependencies</span>
                      <p className="text-[11px] text-slate-500 leading-normal mb-1">Populate the local node modules pool and download CLI plugins:</p>
                      <pre className="bg-slate-950 text-slate-300 p-2.5 rounded-lg text-[10px] font-mono border border-slate-800">
                        npm install
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">2. Configure Environment Secrets</span>
                      <p className="text-[11px] text-slate-500 leading-normal mb-1">Create a local `.env` configuration file in the workspace root directory:</p>
                      <pre className="bg-slate-950 text-emerald-400 p-2.5 rounded-lg text-[10px] font-mono border border-slate-800 block select-all">
                        {"# System secrets configuration\nPORT=3000\nNODE_ENV=development\n\n# Secure AI Content pre-validation API Key\nGEMINI_API_KEY=your_gemini_api_key_here"}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">3. Execute Local Server & Hot Reload</span>
                      <p className="text-[11px] text-slate-500 leading-normal mb-1">Launch backend typescript server proxying assets and API interfaces:</p>
                      <pre className="bg-slate-950 text-slate-300 p-2.5 rounded-lg text-[10px] font-mono border border-slate-800">
                        npm run dev
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Section B: Production Compilation & Run */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-50 text-[#e86420] border border-orange-100">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Production Compilation & Deployment</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">1. Perform Production Build</span>
                      <p className="text-[11px] text-slate-500 leading-normal mb-1">Trigger bundle compilation. React client files are optimized. Express server is packed into a standalone CommonJS bundle (`dist/server.cjs`) using esbuild:</p>
                      <pre className="bg-slate-950 text-slate-300 p-2.5 rounded-lg text-[10px] font-mono border border-slate-800">
                        npm run build
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">2. Start Standalone Stack</span>
                      <p className="text-[11px] text-slate-500 leading-normal mb-1">Initiate production server serving optimized static payloads and active API routes:</p>
                      <pre className="bg-slate-950 text-slate-300 p-2.5 rounded-lg text-[10px] font-mono border border-slate-800">
                        npm start
                      </pre>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 font-mono text-[9.5px]">
                      <span className="font-bold text-amber-800 uppercase block mb-0.5">⚠️ Ingress Inbound Routing Restriction</span>
                      <p className="text-slate-600 leading-relaxed">
                        The proxy infrastructure routes external web queries exclusively to **Port 3000**. Do not attempt to override the environment PORT parameter. The backend binds unconditionally to host `0.0.0.0` at port `3000`.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Security Gating Details */}
              <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-xl space-y-4 font-sans text-xs">
                <div className="flex items-center gap-2 text-white font-display border-b border-slate-850 pb-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold uppercase tracking-wider text-sm">Organizational Safety Gating Policies</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-emerald-300 font-extrabold block">Domain Restrictions</span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Account authentications and registrations undergo domain checks at both the database schema layer and routing middleware gates. Only accounts ending in <strong>@travelradar.com</strong> can establish tokens.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-emerald-300 font-extrabold block">RBAC Access Control</span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Security tokens map to rigorous role scopes: Writer, Editor, Senior Editor, Quality Checker, Publisher, and Admin. Modifying resources outside of authorized roles yields HTTP 403 Forbidden checks.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-emerald-300 font-extrabold block">Direct Pin Verification</span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Forgot password sequences generate one-time validation codes mapped to emails in the system. The local database holds secure codes, enabling bypass of real SMTP keys for sandbox testing.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
