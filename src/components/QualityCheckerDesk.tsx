import React, { useState } from 'react';
import { Article, User, WorkflowConfig, Topic } from '../types';
import { 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  MessageSquare, 
  Send, 
  Award,
  BookOpen, 
  TrendingUp, 
  Eye, 
  Scale,
  Sparkles,
  FileText
} from 'lucide-react';

interface QualityCheckerDeskProps {
  currentUser: User;
  articles: Article[];
  topics: Topic[];
  config: WorkflowConfig;
  onPostComment: (articleId: string, text: string) => Promise<void>;
  onSubmitDecision: (params: {
    articleId: string;
    action: string;
    comments: string;
    reasons?: string[];
  }) => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

export default function QualityCheckerDesk({
  currentUser,
  articles,
  topics,
  config,
  onPostComment,
  onSubmitDecision,
  onAddToast,
}: QualityCheckerDeskProps) {
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  // Quality check parameters state
  const [accuracyScore, setAccuracyScore] = useState(90);
  const [grammarScore, setGrammarScore] = useState(90);
  const [seoScore, setSeoScore] = useState(85);
  const [formattingScore, setFormattingScore] = useState(95);
  const [ethicsScore, setEthicsScore] = useState(100);

  // Checklist of specific checks
  const [checks, setChecks] = useState({
    accuracyVerified: false,
    noTypos: false,
    seoKeywordsPlaced: false,
    layoutResponsive: false,
    copyrightClearance: false,
  });

  const [checkerNotes, setCheckerNotes] = useState('');
  const [postCommentText, setPostCommentText] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const selectedArticle = articles.find(a => a.id === activeArticleId);

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQualitySubmit = async () => {
    if (!selectedArticle) return;

    if (!checkerNotes.trim()) {
      onAddToast('Please fill out the Quality Assay explanatory notes before signing off.', 'error');
      return;
    }

    const allChecked = Object.values(checks).every(v => v);
    if (!allChecked) {
      onAddToast('Operational warning: Some items in the Quality standards checklist remain unticked.', 'warning');
    }

    setSubmittingAction(true);
    try {
      const avgCalculated = Math.round(
        (accuracyScore + grammarScore + seoScore + formattingScore + ethicsScore) / 5
      );

      // Record decision back to update comments / history
      await onSubmitDecision({
        articleId: selectedArticle.id,
        // Using "Minor Revision" if they decide to reject, or just update notes/logs
        action: 'QC Clearance',
        comments: `[Quality Certificate Scored: ${avgCalculated}/100]. Checklist results: Verified Accuracy (${checks.accuracyVerified ? 'YES':'NO'}), No Typos (${checks.noTypos ? 'YES':'NO'}), Keywords Placed (${checks.seoKeywordsPlaced ? 'YES':'NO'}), Ethics Compliant (${checks.copyrightClearance ? 'YES':'NO'}). Assessor remarks: ${checkerNotes}`,
      });

      onAddToast(`Quality Certificate for "${selectedArticle.title}" filed with a final score of ${avgCalculated}/100!`, 'success');
      setActiveArticleId(null);
      setCheckerNotes('');
      // Reset checklist
      setChecks({
        accuracyVerified: false,
        noTypos: false,
        seoKeywordsPlaced: false,
        layoutResponsive: false,
        copyrightClearance: false,
      });
    } catch (err: any) {
      onAddToast(err.message || 'Error recording quality checks.', 'error');
    } finally {
      setSubmittingAction(false);
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

  // Quality checkers focus on Approved reviews awaiting final deployment or audits
  const pendingArticles = articles.filter(art => art.status === 'Approved');

  return (
    <div className="space-y-6" id="quality-checker-module">
      <div className="bg-gradient-to-r from-slate-900 to-[#363636] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#20a6eb]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#e86420] text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Audits Dashboard
              </span>
              <span className="text-[10px] bg-sky-500/20 text-[#20a6eb] border border-sky-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                Standards: EN-9001
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-2.5">Quality Assurance Desk</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Conduct metric validations across Content Accuracy, Grammar, SEO keywords, Responsive Layout layouts, and Legal & Ethical compliance protocols.
            </p>
          </div>
          <div className="shrink-0 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center md:text-right font-mono text-xs">
            <span className="text-slate-400 block">Awaiting QA Audit</span>
            <span className="text-2xl font-bold text-[#20a6eb]">{pendingArticles.length} Drafts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Approved checklist queue sidebar */}
        <div className="xl:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#20a6eb]" />
              <span>Editorial Approved Queue</span>
            </h3>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-sky-100 text-[#20a6eb] font-mono">
              {pendingArticles.length} manuscripts
            </span>
          </div>

          <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            {pendingArticles.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 text-xs">
                All editorial approvals are fully inspected! Excellent work.
              </div>
            ) : (
              pendingArticles.map(art => (
                <button
                  key={art.id}
                  onClick={() => {
                    setActiveArticleId(art.id);
                    setCheckerNotes('');
                  }}
                  className={`w-full text-left p-4.5 rounded-xl border transition-all relative flex flex-col gap-2 cursor-pointer ${
                    art.id === activeArticleId 
                      ? 'bg-sky-50/50 border-[#20a6eb] shadow-md ring-1 ring-sky-200' 
                      : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                  }`}
                  id={`art-qa-item-${art.id}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-sky-50 border border-sky-100 text-[#20a6eb] font-mono">
                      APPROVED DRAFT
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">AI Rating: {art.score}/100</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug line-clamp-2">{art.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Author: {art.writerName} | Channel: <strong>{topics.find(t => t.id === art.topicId)?.category || 'Travel Guide'}</strong></p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Audit Details & Scoring panel */}
        <div className="xl:col-span-8">
          {selectedArticle ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="qa-active-review-pane">
              
              <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Active Quality Control Assay</h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Title: {selectedArticle.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-1 rounded">
                    Claims Locked: True
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Score slider panels */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#e86420]" />
                    <span>Compliance Quality Indexes (Percentage Scores)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="space-y-1.5Packed font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-600 flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5 text-sky-500" /> Content Accuracy</span>
                        <span className="font-bold text-slate-800">{accuracyScore}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={accuracyScore} 
                        onChange={(e) => setAccuracyScore(Number(e.target.value))}
                        className="w-full accent-[#20a6eb]"
                      />
                    </div>

                    <div className="space-y-1.5Packed font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-600 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-amber-500" /> Grammar & Readability</span>
                        <span className="font-bold text-slate-800">{grammarScore}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={grammarScore} 
                        onChange={(e) => setGrammarScore(Number(e.target.value))}
                        className="w-full accent-[#e86420]"
                      />
                    </div>

                    <div className="space-y-1.5Packed font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-600 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> SEO Optimization</span>
                        <span className="font-bold text-slate-800">{seoScore}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={seoScore} 
                        onChange={(e) => setSeoScore(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5Packed font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-600 flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-indigo-500" /> Visual Formatting</span>
                        <span className="font-bold text-slate-800">{formattingScore}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={formattingScore} 
                        onChange={(e) => setFormattingScore(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5Packed font-mono md:col-span-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600 flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-teal-500" /> Legal, Copyright & Ethics Compliance</span>
                        <span className="font-bold text-slate-800">{ethicsScore}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={ethicsScore} 
                        onChange={(e) => setEthicsScore(Number(e.target.value))}
                        className="w-full accent-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist Tickmarks */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Pre-Release Checklist Standards
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {Object.entries(checks).map(([key, checked]) => {
                      const labels: Record<string, string> = {
                        accuracyVerified: 'Facts, coordinates & spot recommendations are double-checked',
                        noTypos: 'Zero grammar, styling, or syntactic guide mistakes remain',
                        seoKeywordsPlaced: 'SEO optimization criteria met (headings, tags & links present)',
                        layoutResponsive: 'Typography structure & image markup layout matches guide',
                        copyrightClearance: 'No plagiarisms; reference URL sources fully credited',
                      };
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleCheck(key as keyof typeof checks)}
                          className="flex items-start text-left gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          {checked ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-5 h-5 rounded border border-slate-300 shrink-0 mt-0.5 bg-white"></div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800 capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{labels[key]}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Read Only Article Draft */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-550 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inspect Raw Draft Content ({selectedArticle.writerName})</span>
                  </label>
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto font-sans">
                    {selectedArticle.content}
                  </div>
                </div>

                {/* Comments discussion inline */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Editorial Board Commentary ({selectedArticle.comments.length})</span>
                  </h4>

                  <div className="space-y-3">
                    {selectedArticle.comments.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">No commentary logged.</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {selectedArticle.comments.map(c => (
                          <div key={c.id} className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-0.5 border border-slate-100 font-mono">
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span><strong>{c.authorName}</strong> ({c.authorRole})</span>
                              <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-700">{c.text}</p>
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
                        className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400 text-slate-700"
                      />
                      <button
                        onClick={handlePostComment}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg px-3.5 py-1.5 cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        <span>Discuss</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes and Sign-off */}
                <div className="border-t border-slate-150 pt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Assessor Official Remarks & Audit Summary (Mandatory)
                    </label>
                    <textarea
                      placeholder="e.g. Draft complies accurately with RadarDesk guides. Typography checks and keyword density verification complete. Approved for release."
                      value={checkerNotes}
                      onChange={(e) => setCheckerNotes(e.target.value)}
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-sky-300 font-mono text-slate-700"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleQualitySubmit}
                      disabled={submittingAction}
                      className="px-6 py-3 bg-[#e86420] hover:bg-[#d05315] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Issue Quality Assured Certificate</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-slate-50/50 p-12 text-center rounded-2xl border border-slate-150 flex flex-col justify-center items-center h-full min-h-[400px]">
              <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
              <h4 className="font-bold text-slate-700 mb-1">Select Manuscript to Inspect</h4>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Approved editorial articles are held here for final proofreading. Select an item from the sidebar queue to score performance indexes and sign off.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
