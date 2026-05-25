import React, { useState } from 'react';
import { Article, User, WorkflowConfig } from '../types';
import { 
  Inbox, 
  MessageSquare, 
  AlertOctagon, 
  CheckCircle, 
  RefreshCw, 
  Flame, 
  UserCheck, 
  Trash2,
  FileText,
  BadgeAlert,
  Send,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface EditorDashboardProps {
  currentUser: User;
  articles: Article[];
  config: WorkflowConfig;
  onPostComment: (articleId: string, text: string) => Promise<void>;
  onSubmitDecision: (params: {
    articleId: string;
    action: string;
    comments: string;
    reasons?: string[];
  }) => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  onRefresh?: () => void;
}

export default function EditorDashboard({
  currentUser,
  articles,
  config,
  onPostComment,
  onSubmitDecision,
  onAddToast,
  onRefresh,
}: EditorDashboardProps) {
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  
  // Reviewer form states
  const [comments, setComments] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [postCommentText, setPostCommentText] = useState('');
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  // AI Quality check rating/checking states
  const [ratingScore, setRatingScore] = useState<number>(0);
  const [ratingComments, setRatingComments] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const selectedArticle = articles.find(a => a.id === activeArticleId);

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleDecision = async (action: string) => {
    if (!selectedArticle) return;
    
    // Validations: Rejections require a structured reason item
    if (action === 'Reject' && selectedReasons.length === 0) {
      onAddToast('Mandatory Feedback Rule: You must supply at least one multi-select reason for rejecting drafts back to writers.', 'error');
      return;
    }

    if (!comments.trim()) {
      onAddToast('Please fill out the explanatory comments justifying this decision.', 'error');
      return;
    }

    setSubmittingAction(action);
    try {
      await onSubmitDecision({
        articleId: selectedArticle.id,
        action,
        comments,
        reasons: selectedReasons
      });
      onAddToast(`Workflow decision locked with status: ${action}`, 'success');
      setActiveArticleId(null);
      setComments('');
      setSelectedReasons([]);
    } catch (err: any) {
      onAddToast(err.message || 'Error recording workflow decision.', 'error');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleRateAI = async (scoreToRate: number) => {
    if (!selectedArticle) return;
    setIsSubmittingRating(true);
    try {
      const res = await fetch(`/api/articles/${selectedArticle.id}/rate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: scoreToRate,
          comments: ratingComments,
          ratedByName: currentUser.name
        })
      });
      const data = await res.json();
      if (res.ok) {
        onAddToast(`AI Precheck validation rated successfully as ${scoreToRate}/5 stars!`, 'success');
        setRatingScore(0);
        setRatingComments('');
        if (onRefresh) onRefresh();
      } else {
        onAddToast(data.error || 'Failed to submit rating feedback.', 'error');
      }
    } catch {
      onAddToast('Network error during AI quality rating.', 'error');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleExpressApprove = async () => {
    if (!selectedArticle) return;
    setSubmittingAction('ExpressApprove');
    try {
      await onSubmitDecision({
        articleId: selectedArticle.id,
        action: 'Approve',
        comments: `⚡ Express Approved: Automated AI quality assessment validated and verified as highly trustworthy (${selectedArticle.aiValidation?.editorRating?.score || 5}/5 stars by Editor ${selectedArticle.aiValidation?.editorRating?.ratedByName || currentUser.name}). Total approval processing time reduced by 90%.`,
        reasons: []
      });
      onAddToast('Express Decision Approved & Published instantly!', 'success');
      setActiveArticleId(null);
      setComments('');
      setSelectedReasons([]);
    } catch (err: any) {
      onAddToast(err.message || 'Error executing express approval.', 'error');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handlePostComment = async () => {
    if (!activeArticleId || !postCommentText.trim()) return;
    try {
      await onPostComment(activeArticleId, postCommentText);
      setPostCommentText('');
      onAddToast('Comment recorded inline on article successfully.', 'success');
    } catch {
      onAddToast('Error logging comments.', 'error');
    }
  };

  // Filter queues: Editors can review "Submitted", "Escalated", "Minor Revision" or "Under Review" statuses.
  // We can filter articles according to priorities or those already claimed by current editor user.
  const isSeniorEditor = currentUser.role === 'Senior Editor';
  const filteredQueue = articles.filter(art => {
    if (isSeniorEditor) {
      // Senior Editor queue handles Escalations as priority
      return ['Submitted', 'Escalated', 'Under Review'].includes(art.status);
    } else {
      // Duty editor handles standard Queue
      return ['Submitted', 'Under Review', 'Minor Revision', 'Rejected'].includes(art.status);
    }
  });

  return (
    <div className="space-y-6" id="editor-dashboard-module">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left column list queues */}
        <div className="xl:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-indigo-500" />
              <span>Duty Editorial Pools Queue</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
              {filteredQueue.length} Pending
            </span>
          </div>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {filteredQueue.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 text-xs">
                Excellent! The editorial queue is currently empty. No submissions pending review.
              </div>
            ) : (
              filteredQueue.map(art => {
                const isClaimedByMe = art.editorId === currentUser.id;
                const isClaimedByOther = art.editorId && art.editorId !== currentUser.id;
                
                return (
                  <button
                    key={art.id}
                    onClick={() => {
                      setActiveArticleId(art.id);
                      setComments('');
                      setSelectedReasons([]);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all relative flex flex-col gap-2.5 cursor-pointer ${
                      art.id === activeArticleId 
                        ? 'bg-indigo-50/50 border-indigo-400 shadow-md ring-1 ring-indigo-200' 
                        : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                    }`}
                    id={`art-queue-item-${art.id}`}
                  >
                    {/* Urgency indicator strip */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                        art.status === 'Escalated' ? 'bg-purple-100 text-purple-700 animate-pulse' :
                        art.status === 'Submitted' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {art.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Score: {art.score}/100</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug line-clamp-2">{art.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Author: {art.writerName}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-50 text-slate-400">
                      <span>Cycles: <strong>{art.reviewCycles} rejections</strong></span>
                      {isClaimedByMe ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Claimed by you
                        </span>
                      ) : isClaimedByOther ? (
                        <span className="text-slate-400 italic">Reviewer: {art.editorName}</span>
                      ) : (
                        <span className="text-indigo-600 font-semibold">• Direct Lock Ready</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column detailed preview & audit panels */}
        <div className="xl:col-span-8">
          {selectedArticle ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="editor-active-review-panel">
              
              {/* Top active bar detailing claimed status */}
              <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Active Review Task</h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">Author ID: {selectedArticle.writerId} | Status: {selectedArticle.status}</p>
                </div>
                
                {selectedArticle.editorId && selectedArticle.editorId !== currentUser.id ? (
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-800 text-xs px-2.5 py-1 rounded-lg">
                    🔒 Locked by Editor: {selectedArticle.editorName}
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-1 rounded-lg">
                    ✓ Available for lock
                  </span>
                )}
              </div>

              {/* View / Read body section */}
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Score: <strong>{selectedArticle.score}/100</strong></span>
                    <span>Rejections count: <strong>{selectedArticle.reviewCycles}</strong></span>
                    <span>Last updated: {new Date(selectedArticle.updatedAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* AI quality indicator flags and rating systems */}
                {selectedArticle.aiValidation && (
                  <div className="space-y-4">
                    {/* Basic specs layout */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-600">
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Grammar Quality</span>
                        </p>
                        <p className="text-slate-450 text-[11px] mt-1 leading-snug">{selectedArticle.aiValidation.grammar}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Readability Index</p>
                        <p className="text-slate-450 text-[11px] mt-1 leading-snug">{selectedArticle.aiValidation.readability}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Source Verifier</p>
                        <p className="text-slate-450 text-[11px] mt-1 leading-snug">
                          {selectedArticle.aiValidation.sourcesFound ? 'Verified: Citation URLs present' : 'Action needed: Lacking sources'}
                        </p>
                      </div>
                    </div>

                    {/* AI improvement suggestions shared with Writer */}
                    {selectedArticle.aiValidation.improvementSuggestions && selectedArticle.aiValidation.improvementSuggestions.length > 0 && (
                      <div className="bg-indigo-55/40 p-4 rounded-xl border border-indigo-100/80 space-y-2">
                        <p className="font-extrabold text-[10px] text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                          <span>AI Automated Suggestions Shared with Writer ({selectedArticle.aiValidation.improvementSuggestions.length})</span>
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 pl-1 list-none font-mono">
                          {selectedArticle.aiValidation.improvementSuggestions.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 bg-white p-2.5 rounded-lg border border-slate-100 shadow-3xs">
                              <span className="text-indigo-500 font-bold">↳</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* INTERACTIVE CHECK & RATING FOR EDITORS */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 text-xs">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-150 pb-2.5">
                        <div>
                          <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span>Audit & Rate AI Precheck Quality</span>
                          </p>
                          <p className="text-slate-400 text-[10px] mt-0.5">Rate whether the AI assessment was precise, helpful, and reduced your manual editing load.</p>
                        </div>
                        {selectedArticle.aiValidation.editorRating && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                            ✓ Rated {selectedArticle.aiValidation.editorRating.score}/5 Stars
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Rating Stars selector */}
                        <div className="md:col-span-4 space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Assign Rating Score</label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isLit = star <= (hoveredStar ?? ratingScore ?? selectedArticle.aiValidation?.editorRating?.score ?? 0);
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => {
                                    setRatingScore(star);
                                  }}
                                  onMouseEnter={() => setHoveredStar(star)}
                                  onMouseLeave={() => setHoveredStar(null)}
                                  className="text-lg p-0.5 transition-transform hover:scale-120 cursor-pointer focus:outline-none"
                                >
                                  {isLit ? (
                                    <span className="text-amber-500 font-bold">★</span>
                                  ) : (
                                    <span className="text-slate-350">☆</span>
                                  )}
                                </button>
                              );
                            })}
                            <span className="text-[11px] font-bold text-slate-700 ml-1.5 font-mono">
                              {(ratingScore || selectedArticle.aiValidation?.editorRating?.score || 0)}/5
                            </span>
                          </div>
                        </div>

                        {/* Rating comments */}
                        <div className="md:col-span-8 flex flex-col md:flex-row gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder={
                                selectedArticle.aiValidation.editorRating 
                                ? `Override score / Add rating feedback...`
                                : `Write check notes... (e.g. Grammar check accurate, saved editing time)`
                              }
                              value={ratingComments}
                              onChange={(e) => setRatingComments(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white shadow-3xs"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={isSubmittingRating || (!ratingScore && !selectedArticle.aiValidation?.editorRating)}
                            onClick={() => handleRateAI(ratingScore || selectedArticle.aiValidation?.editorRating?.score || 5)}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                          >
                            {isSubmittingRating ? 'Rating...' : 'Submit Rating'}
                          </button>
                        </div>
                      </div>

                      {/* Display previous rating if rated */}
                      {selectedArticle.aiValidation.editorRating && (
                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                            <span>Rated by: <strong>{selectedArticle.aiValidation.editorRating.ratedByName}</strong></span>
                            <span>{new Date(selectedArticle.aiValidation.editorRating.ratedAt || '').toLocaleString()}</span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed italic bg-white/65 p-2 rounded border border-slate-100">
                            "{selectedArticle.aiValidation.editorRating.comments || 'No written quality comments uploaded.'}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* EXPRESS Mode Trust Banner to reduce editor work */}
                    {selectedArticle.aiValidation?.editorRating && selectedArticle.aiValidation.editorRating.score >= 4 && (
                      <div className="bg-emerald-600 text-white p-4.5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all border border-emerald-750">
                        <div className="space-y-1 max-w-xl">
                          <p className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span>Express Mode Enabled (AI Check Trusted)</span>
                          </p>
                          <p className="text-emerald-100 text-xs leading-snug">
                            This AI automated quality check has been rated highly (<strong>{selectedArticle.aiValidation.editorRating.score}/5★</strong>) for accuracy by our experts. Take express action to instantly publish this submission and save workflow hours!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleExpressApprove}
                          disabled={submittingAction !== null}
                          className="bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs px-4 py-2.5 rounded-lg shadow-sm border border-emerald-100 cursor-pointer flex items-center gap-1.5 transition-all w-full md:w-auto shrink-0 whitespace-nowrap active:scale-95 disabled:opacity-50"
                        >
                          ⚡ Express Approve & Publish
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Main draft content renders styled */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                  {selectedArticle.content}
                </div>

                {/* Comments inline and discussion center */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Inline Editorial Feedback Discussion ({selectedArticle.comments.length})</span>
                  </h4>

                  <div className="space-y-3">
                    {selectedArticle.comments.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">No commentary logs yet. Share guidelines below.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                        {selectedArticle.comments.map(c => (
                          <div key={c.id} className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1 border border-slate-100">
                            <div className="flex justify-between font-mono text-[10px] text-slate-400">
                              <span><strong>{c.authorName}</strong> ({c.authorRole})</span>
                              <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-mono">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Add quick inline reference or comment..."
                        value={postCommentText}
                        onChange={(e) => setPostCommentText(e.target.value)}
                        className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400"
                      />
                      <button
                        onClick={handlePostComment}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-3.5 py-1.5 cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* DECISION ACTION CONSOLE */}
                <div className="border-t border-slate-150 pt-5 space-y-4">
                  <h4 className="font-black text-slate-850 text-sm uppercase tracking-wide">
                    Workflow Gate Decisions
                  </h4>

                  {/* Warning in case of active checkout by another editor */}
                  {selectedArticle.editorId && selectedArticle.editorId !== currentUser.id ? (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                      <AlertOctagon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Article review lock-in active!</p>
                        <p className="mt-0.5">This manuscript is claimed by Editor <strong>{selectedArticle.editorName}</strong> under strict safety rules to avoid joint interference. As you are of another ID, you cannot make actions until they release it.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Selection Reason panel if user decides to Reject draft */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500">Structured Quality Faults (Multi-select on Rejection)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {config.rejectionReasons.map(r => {
                            const isSel = selectedReasons.includes(r);
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => toggleReason(r)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                                  isSel ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Comments for feedback */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Editor Explanatory Comments (Mandatory)</label>
                        <textarea
                          placeholder="State required revisions, fact checks, or reasons for approval..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          rows={3.5}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 font-mono"
                        />
                      </div>

                      {/* Trigger Buttons split by roles */}
                      <div className="flex items-center gap-2.5 flex-wrap pt-2">
                        {!isSeniorEditor ? (
                          <>
                            <button
                              onClick={() => handleDecision('Approve')}
                              disabled={submittingAction !== null}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve & Publish</span>
                            </button>
                            <button
                              onClick={() => handleDecision('Minor Revision')}
                              disabled={submittingAction !== null}
                              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw className="w-4 h-4 text-slate-500" />
                              <span>Request Minor Revision</span>
                            </button>
                            <button
                              onClick={() => handleDecision('Reject')}
                              disabled={submittingAction !== null}
                              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                              title="Returns back to the same writer. Auto escalates to Senior Editors after max cycles."
                            >
                              <AlertOctagon className="w-4 h-4" />
                              <span>Reject Draft back</span>
                            </button>
                            <button
                              onClick={() => handleDecision('Escalate')}
                              disabled={submittingAction !== null}
                              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer ml-auto disabled:opacity-50"
                            >
                              <Flame className="w-4 h-4 text-purple-200 animate-pulse" />
                              <span>Escalate to Senior</span>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Senior overrides dashboard */}
                            <div className="bg-purple-50 p-4.5 rounded-xl border border-purple-200 text-xs w-full mb-3 space-y-1">
                              <p className="font-extrabold text-purple-900 flex items-center gap-1">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span>Senior Override Core Console Active</span>
                              </p>
                              <p className="text-purple-700 font-medium">As a Senior Editor, you have permanent override capabilities and decision-making on dispute or escalation loops. These bypass cycles checks.</p>
                            </div>
                            <button
                              onClick={() => handleDecision('Override Approve')}
                              disabled={submittingAction !== null}
                              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Permanent Override Approve</span>
                            </button>
                            <button
                              onClick={() => handleDecision('Override Reject')}
                              disabled={submittingAction !== null}
                              className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <AlertOctagon className="w-4 h-4" />
                              <span>Permanent Dismiss/Reject</span>
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          ) : (
            <div className="bg-slate-50/50 p-12 text-center rounded-2xl border border-slate-100 flex flex-col justify-center items-center h-full">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-700 mb-1">Select Manuscript to Audit</h4>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Choose an article submission from the pending operational queue array on the left column to run AI quality validation assays, discuss inline metrics, and lock feedback.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
