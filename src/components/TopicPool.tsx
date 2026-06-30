import React, { useState, useEffect } from 'react';
import { Topic, User, WorkflowConfig } from '../types';
import {
  FolderPlus,
  MapPin,
  Timer,
  CheckCircle,
  XSquare,
  AlertTriangle,
  Compass,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Bell,
  Trash2
} from 'lucide-react';

interface TopicPoolProps {
  currentUser: User;
  topics: Topic[];
  config: WorkflowConfig;
  onProposeTopic: (title: string, desc: string, cat: string) => Promise<void>;
  onEditTopic: (topicId: string, title: string, desc: string, cat: string) => Promise<void>;
  onModerateTopic: (topicId: string, action: 'Approved' | 'Rejected', comments: string, reasons?: string[]) => Promise<void>;
  onClaimTopic: (topicId: string) => Promise<void>;
  onReleaseTopic: (topicId: string) => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  onSelectTopicForArticle: (topic: Topic) => void;
}

export default function TopicPool({
  currentUser,
  topics,
  config,
  onProposeTopic,
  onEditTopic,
  onModerateTopic,
  onClaimTopic,
  onReleaseTopic,
  onAddToast,
  onSelectTopicForArticle,
}: TopicPoolProps) {
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState(config?.categories?.[0] || 'Travel Guide');

  // Edit concepts states
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Moderation variables
  const [moderatingTopicId, setModeratingTopicId] = useState<string | null>(null);
  const [moderatorComment, setModeratorComment] = useState('');
  const [moderationAction, setModerationAction] = useState<'Approved' | 'Rejected'>('Approved');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  // Local tick for claimed items to show countdown in real-time
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      onAddToast('Please fill out the title and description for topic proposal.', 'error');
      return;
    }
    await onProposeTopic(newTitle, newDesc, newCategory);
    setNewTitle('');
    setNewDesc('');
    setShowProposeModal(false);
  };

  const handleStartEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setEditTitle(topic.title);
    setEditDesc(topic.description);
    setEditCategory(topic.category);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    if (!editTitle.trim() || !editDesc.trim()) {
      onAddToast('Please fill out the title and description for topic editing.', 'error');
      return;
    }
    await onEditTopic(editingTopic.id, editTitle, editDesc, editCategory);
    setEditingTopic(null);
  };

  const handleModerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatingTopicId) return;
    await onModerateTopic(moderatingTopicId, moderationAction, moderatorComment, selectedReasons);
    setModeratingTopicId(null);
    setModeratorComment('');
    setSelectedReasons([]);
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  return (
    <div className="space-y-6" id="topic-pool-module">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Sky gradient atmospheric background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#20a6eb]/10 rounded-full blur-xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#20a6eb] text-white font-bold text-xs font-mono">RADAR POOL</span>
            <span className="text-xs text-sky-300 tracking-wider uppercase font-semibold">Content Strategy</span>
          </div>
          <h2 className="text-2xl font-bold font-sans tracking-tight">Active Topic Hub</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Propose or claim editorial concepts. Claimed topics have strict timers; write your draft quickly or they automatically return to the general queue.
          </p>
        </div>

        {currentUser.role === 'Writer' && (
          <button
            onClick={() => setShowProposeModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#20a6eb] to-cyan-500 hover:from-[#20a6eb]/80 hover:to-cyan-600 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer z-10 self-start md:self-center border-0"
            id="btn-propose-topic"
          >
            <FolderPlus className="w-5 h-5 text-slate-950 font-black" />
            <span>Propose New Concept</span>
          </button>
        )}
      </div>

      {/* Propose Topic Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 bg-slate-950/70 py-10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#20a6eb]" />
                <span>Propose Campaign Concept</span>
              </h3>
              <button
                onClick={() => setShowProposeModal(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePropose} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Concept Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Hidden Coffee Crawl of Seattle: 4 Secret Roasters"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Target Editorial Guidelines / Outline</label>
                <textarea
                  placeholder="Mention target traveler segments, recommended spots to cover, and verification requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Channel Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-700 focus:outline-none"
                  >
                    {config.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Claim Lock Duration</label>
                  <div className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-500">
                    {config.claimDurationMinutes} Mins (Standard)
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  Propose Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {editingTopic && (
        <div className="fixed inset-0 bg-slate-950/70 py-10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#20a6eb]" />
                <span>Edit Your Proposed Concept Idea</span>
              </h3>
              <button
                onClick={() => setEditingTopic(null)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Concept Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Hidden Coffee Crawl of Seattle: 4 Secret Roasters"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Target Editorial Guidelines / Outline</label>
                <textarea
                  placeholder="Mention target traveler segments, recommended spots to cover, and verification requirements..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Channel Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    {config.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Claim Lock Duration</label>
                  <div className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-500 font-mono">
                    {config.claimDurationMinutes} Mins (Standard)
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#20a6eb] hover:bg-[#20a6eb]/80 text-white rounded-lg text-sm font-semibold shadow-md active:scale-95 cursor-pointer border-0"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Form Expansion */}
      {moderatingTopicId && (
        <div className="fixed inset-0 bg-slate-950/70 py-10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white">
              <h3 className="font-semibold text-base">Moderate Proposed Travel Concept</h3>
              <p className="text-xs text-slate-400 mt-1">Accepting allows writers to claim and write immediate articles on this idea.</p>
            </div>

            <form onSubmit={handleModerateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Decision</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModerationAction('Approved')}
                    className={`flex-1 p-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 ${moderationAction === 'Approved'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Approve & Deploy
                  </button>
                  <button
                    type="button"
                    onClick={() => setModerationAction('Rejected')}
                    className={`flex-1 p-2.5 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 ${moderationAction === 'Rejected'
                        ? 'bg-rose-50 border-rose-400 text-rose-800'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <XSquare className="w-4 h-4 text-rose-600" />
                    Reject Concept
                  </button>
                </div>
              </div>

              {moderationAction === 'Rejected' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Filing Reason</label>
                  <div className="space-y-1.5">
                    {['Lacks focus', 'Topic too narrow', 'Duplicate coverage', 'Not travel relevant'].map(reason => {
                      const isSel = selectedReasons.includes(reason);
                      return (
                        <button
                          type="button"
                          key={reason}
                          onClick={() => toggleReason(reason)}
                          className={`w-full text-left p-2 rounded border text-xs transition-colors ${isSel ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                        >
                          {reason}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Moderator Comments</label>
                <textarea
                  placeholder="Share editorial instructions, needed angles, or rejection motivations..."
                  value={moderatorComment}
                  onChange={(e) => setModeratorComment(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 text-xs pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModeratingTopicId(null)}
                  className="px-3 py-1.5 text-slate-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Lock Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Topics split by status: Proposed Reviews vs Active Pool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Proposed Queue Column (Moderate for editors, view for writers) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              <span>Pending Moderation</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {topics.filter(t => t.status === 'Proposed').length} Concepts
            </span>
          </div>

          <div className="space-y-3.5">
            {topics.filter(t => t.status === 'Proposed').length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs">
                No proposed concepts waiting for approval.
              </div>
            ) : (
              topics.filter(t => t.status === 'Proposed').map(topic => (
                <div key={topic.id} className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden" id={`proposed-topic-${topic.id}`}>
                  {/* Category Pill */}
                  <span className="absolute top-0 right-0 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    {topic.category}
                  </span>

                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight pr-14 leading-snug">{topic.title}</h4>
                    <p className="text-[11px] text-slate-400">Proposed by: <strong>{topic.submitterName}</strong></p>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                    {topic.description}
                  </p>

                  {/* Editors action panel */}
                  {['Editor', 'Senior Editor', 'Admin'].includes(currentUser.role) ? (
                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          setModeratingTopicId(topic.id);
                          setModerationAction('Approved');
                        }}
                        className="flex-1 text-center bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-semibold py-1.5 rounded-lg text-xs cursor-pointer"
                        id={`btn-moderate-approve-${topic.id}`}
                      >
                        Approve Topic
                      </button>
                      <button
                        onClick={() => {
                          setModeratingTopicId(topic.id);
                          setModerationAction('Rejected');
                        }}
                        className="text-center bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold p-1.5 rounded-lg text-xs cursor-pointer"
                        id={`btn-moderate-reject-${topic.id}`}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="inline-block text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 animate-pulse">
                        Under Editor Check
                      </span>
                      {topic.submitterId === currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(topic)}
                          className="w-full text-center font-bold text-[11px] text-[#20a6eb] hover:text-[#188cc8] border border-dashed border-sky-300 py-1 rounded-lg bg-sky-50/50 cursor-pointer block"
                        >
                          ✏️ Edit Own Concept Idea
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Pool Columns (The general writing assignment catalog) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <span>Available Assignments Catalog</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              {topics.filter(t => t.status === 'Active').length} Active Ideas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.filter(t => t.status === 'Active').length === 0 ? (
              <div className="md:col-span-2 p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 text-sm">
                No active concepts in the catalog. Ask Writers/Editors to propose concepts first.
              </div>
            ) : (
              topics.filter(t => t.status === 'Active').map(topic => {
                const isClaimedByMe = topic.claimedById === currentUser.id;
                const isClaimedByOther = topic.claimedById && topic.claimedById !== currentUser.id;

                // Live timer calculator
                let claimSecondsRemaining = 0;
                let warningBanner = false;
                let isExpired = false;

                if (topic.claimedById && topic.claimedAt) {
                  const limitMins = topic.durationMinutes || config.claimDurationMinutes;
                  const elapsedMs = now - new Date(topic.claimedAt).getTime();
                  const totSecs = limitMins * 60;
                  claimSecondsRemaining = Math.max(0, totSecs - Math.floor(elapsedMs / 1000));
                  warningBanner = claimSecondsRemaining < 300 && claimSecondsRemaining > 0; // < 5 mins warning
                  isExpired = claimSecondsRemaining === 0;
                }

                const min = Math.floor(claimSecondsRemaining / 60);
                const sec = claimSecondsRemaining % 60;

                return (
                  <div
                    key={topic.id}
                    className={`bg-white p-5 rounded-2xl border transition-all relative flex flex-col justify-between overflow-hidden shadow-sm ${isClaimedByMe
                        ? 'border-[#20a6eb]/40 bg-[#20a6eb]/5 shadow-[0_5px_22px_rgba(32,166,235,0.08)]'
                        : isClaimedByOther
                          ? 'border-slate-100 opacity-60 bg-slate-50/50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    id={`active-topic-${topic.id}`}
                  >
                    {/* Expiration Glow Overlay/Notice */}
                    {topic.releasedCount > 0 && !topic.claimedById && (
                      <div className="text-[9.5px] text-amber-700 bg-amber-50 rounded px-2 py-0.5 flex items-center gap-1 self-start mb-2.5 font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Released back to pool {topic.releasedCount}x
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-sky-50 text-sky-600 border border-sky-200/50">
                          {topic.category}
                        </span>

                        {topic.claimedById && (
                          <div className={`text-xs font-bold font-mono px-2 py-1 rounded flex items-center gap-1.5 ${warningBanner ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                            <Timer className="w-3.5 h-3.5" />
                            <span>{min}:{sec < 10 ? '0' + sec : sec}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug">{topic.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-2 font-mono">{topic.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100/60 mt-4 flex items-center justify-between gap-2.5">
                      {isClaimedByMe ? (
                        <div className="w-full space-y-2">
                          <div className="text-xs text-sky-700 leading-tight">
                            {warningBanner ? (
                              <p className="flex items-center gap-1 font-bold">
                                <AlertTriangle className="w-4 h-4 text-[#20a6eb] shrink-0" />
                                <span>RELEASING SOON: Start writing now!</span>
                              </p>
                            ) : (
                              <span className="flex items-center gap-1 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" /> Claimed by you
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => onSelectTopicForArticle(topic)}
                              className="flex-1 text-center bg-[#20a6eb] hover:bg-[#20a6eb]/80 text-white text-xs font-bold py-2 rounded-xl transition-all shadow cursor-pointer shadow-[#20a6eb]/10 border-0"
                            >
                              Initialize Draft
                            </button>
                            <button
                              onClick={() => onReleaseTopic(topic.id)}
                              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] cursor-pointer"
                              title="Release back to general pool"
                            >
                              Release
                            </button>
                          </div>
                        </div>
                      ) : isClaimedByOther ? (
                        <div className="text-[11px] text-slate-400 font-medium">
                          Claimed by writer: <strong>{topic.claimedByName}</strong>
                        </div>
                      ) : (
                        currentUser.role === 'Writer' ? (
                          <button
                            onClick={() => onClaimTopic(topic.id)}
                            className="w-full text-center bg-slate-900 text-white hover:bg-slate-800 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Claim Assignment
                          </button>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic font-medium">
                            Only writers can claim active topics
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Proposed Concepts and Feedback History for authors */}
      {currentUser.role === 'Writer' && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4" id="writer-concept-feedback-panel">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#20a6eb]" />
              <span>My Concept Submissions & Feedback Logs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Track the live approval and critique history of your campaign ideas.</p>
          </div>

          <div className="space-y-3.5">
            {topics.filter(t => t.submitterId === currentUser.id).length === 0 ? (
              <p className="text-slate-400 text-xs italic text-center py-4">You have not proposed any campaign concepts yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.filter(t => t.submitterId === currentUser.id).map(topic => {
                  const latestHistory = topic.moderationHistory[topic.moderationHistory.length - 1];
                  return (
                    <div key={topic.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/40 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 font-mono">
                            {topic.category}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm mt-1">{topic.title}</h4>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${topic.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            topic.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                          }`}>
                          {topic.status === 'Active' ? 'Approved & Ready' : topic.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-mono leading-relaxed line-clamp-2">{topic.description}</p>

                      {latestHistory && (latestHistory.action === 'Approved' || latestHistory.action === 'Rejected') && (
                        <div className="bg-white p-3 rounded-lg border border-slate-150 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span>Reviewer: <strong>{latestHistory.actorName} ({latestHistory.actorRole})</strong></span>
                            <span>{new Date(latestHistory.timestamp).toLocaleDateString()}</span>
                          </div>
                          {latestHistory.comments && (
                            <p className="text-slate-700 italic bg-amber-50/30 p-2 rounded border border-amber-100/40">
                              " {latestHistory.comments} "
                            </p>
                          )}
                          {latestHistory.reasons && latestHistory.reasons.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {latestHistory.reasons.map(r => (
                                <span key={r} className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded">
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
