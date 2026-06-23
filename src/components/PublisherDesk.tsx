import React, { useState } from 'react';
import { Article, User, WorkflowConfig, Topic } from '../types';
import {
  Send,
  Tv,
  Smartphone,
  Globe,
  Clock,
  CheckCircle,
  Flame,
  Archive,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';

interface PublisherDeskProps {
  currentUser: User;
  articles: Article[];
  topics: Topic[];
  config: WorkflowConfig;
  onSubmitDecision: (params: {
    articleId: string;
    action: string;
    comments: string;
  }) => Promise<void>;
  onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
}

export default function PublisherDesk({
  currentUser,
  articles,
  topics,
  config,
  onSubmitDecision,
  onAddToast,
}: PublisherDeskProps) {
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [publishedComments, setPublishedComments] = useState('');
  const [deploying, setDeploying] = useState(false);

  const selectedArticle = articles.find(a => a.id === activeArticleId);

  const handlePublishDeploy = async () => {
    if (!selectedArticle) return;
    setDeploying(true);
    try {
      await onSubmitDecision({
        articleId: selectedArticle.id,
        action: 'Publish',
        comments: publishedComments.trim() || 'Ready for RadarDesk live release.'
      });
      onAddToast(`Success! "${selectedArticle.title}" has been deployed live to the Radar desks!`, 'success');
      setActiveArticleId(null);
      setPublishedComments('');
    } catch (err: any) {
      onAddToast(err.message || 'Error occurred during publishing deploy.', 'error');
    } finally {
      setDeploying(false);
    }
  };

  // We show both Approved articles (Pending final release) and those already Published
  const approvedList = articles.filter(art => art.status === 'Approved');
  const publishedList = articles.filter(art => art.status === 'Published');

  return (
    <div className="space-y-6" id="publisher-desk-module">
      <div className="bg-[#363636] p-6 rounded-2xl text-white shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#e86420]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#20a6eb] text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Distribution Hub
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-2.5 py-1 rounded-full font-mono font-bold">
                Deploy Status: ONLINE
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-2.5">Publishing Desk & Release Control</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Preview finalized manuscripts inside visual phone / web mockups and lock final metadata injection before deploying.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-xs font-mono">
            <div className="text-center px-2">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">Approved Ready</span>
              <span className="text-lg font-bold text-[#e86420]">{approvedList.length}</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center px-2">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Live</span>
              <span className="text-lg font-bold text-emerald-400">{publishedList.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left Queues Column */}
        <div className="xl:col-span-4 space-y-6">

          {/* Pending publications */}
          <div className="space-y-3.5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Clock className="w-4 h-4 text-[#e86420]" />
              <span>Awaiting Final Live Release</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {approvedList.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white text-slate-400 text-xs">
                  No editorial-approved drafts awaiting publication.
                </div>
              ) : (
                approvedList.map(art => (
                  <button
                    key={art.id}
                    onClick={() => {
                      setActiveArticleId(art.id);
                      setPublishedComments('');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative flex flex-col gap-1 text-xs cursor-pointer ${art.id === activeArticleId
                        ? 'bg-orange-50/40 border-[#e86420] shadow-md ring-1 ring-orange-200'
                        : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-center w-full text-[10px] text-zinc-400">
                      <span>By: {art.writerName}</span>
                      <span className="font-semibold text-orange-600">QA Ready</span>
                    </div>
                    <h4 className="font-bold text-slate-800 tracking-tight leading-snug line-clamp-2">{art.title}</h4>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Published Catalog Feed */}
          <div className="space-y-3.5 pt-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Archive className="w-4 h-4 text-emerald-500" />
              <span>Released Live Archive</span>
            </h3>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {publishedList.length === 0 ? (
                <div className="p-6 text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs italic">
                  No articles have been deployed to the public directory yet.
                </div>
              ) : (
                publishedList.map(art => (
                  <div
                    key={art.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-emerald-50/20 shadow-sm space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-[#20a6eb]">{topics.find(t => t.id === art.topicId)?.category || 'Travel Guide'}</span>
                      <span className="font-extrabold text-emerald-600 bg-emerald-100/55 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> LIVE
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 tracking-tight leading-snug line-clamp-1">{art.title}</h4>
                    <p className="text-[10px] text-slate-400">Published by: {art.editorName || 'Admin Desk'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Live Simulator Viewport */}
        <div className="xl:col-span-8">
          {selectedArticle ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="publishing-simulator-panel">

              {/* Device Selector & Live preview heading */}
              <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-1 px-2 rounded bg-[#e86420] text-slate-950 text-[10px] font-black uppercase">
                    Preview Mode
                  </span>
                  <span className="text-xs font-semibold text-slate-300">Live Device Rendering</span>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${previewDevice === 'desktop' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>RadarDesk Web</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${previewDevice === 'mobile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile App Feed</span>
                  </button>
                </div>
              </div>

              {/* Rendering Container Frame */}
              <div className="p-6 bg-slate-100 flex justify-center border-b border-slate-200">
                {previewDevice === 'desktop' ? (
                  /* Web layout preview */
                  <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden font-sans">
                    <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>https://travelradar.aero/articles/preview-{selectedArticle.id}</span>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#e86420]">
                          {topics.find(t => t.id === selectedArticle.topicId)?.category || 'Travel Guide'}
                        </span>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                          {selectedArticle.title}
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-100">
                          <span className="font-bold text-slate-600">By {selectedArticle.writerName}</span>
                          <span>•</span>
                          <span>{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Cover Photo Simulator */}
                      <div className="w-full h-44 bg-gradient-to-r from-sky-400 via-[#20a6eb] to-indigo-600 rounded-xl relative flex items-center justify-center text-white overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative text-center space-y-1">
                          <Eye className="w-8 h-8 mx-auto opacity-75 animate-pulse" />
                          <span className="block text-[10px] uppercase tracking-wider font-extrabold font-mono opacity-80">
                            Custom Travel Cover Activated
                          </span>
                        </div>
                      </div>

                      <div className="text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-serif">
                        {selectedArticle.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mobile look simulator */
                  <div className="w-80 bg-slate-900 rounded-[36px] shadow-2xl p-3 border-4 border-slate-800 overflow-hidden relative">
                    {/* Phone speaker notch */}
                    <div className="w-32 h-6 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20 flex justify-center items-center">
                      <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
                    </div>

                    <div className="w-full h-[450px] bg-white rounded-[28px] overflow-y-auto text-slate-800 font-sans relative pt-6 text-xs">
                      <div className="p-4 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-[#20a6eb]">
                            {topics.find(t => t.id === selectedArticle.topicId)?.category || 'Travel Guide'}
                          </span>
                          <h1 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                            {selectedArticle.title}
                          </h1>
                          <p className="text-[9px] text-slate-400">By {selectedArticle.writerName}</p>
                        </div>

                        {/* Covered image */}
                        <div className="w-full h-28 bg-gradient-to-br from-indigo-500 to-sky-400 rounded-lg"></div>

                        <p className="text-[11px] text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
                          {selectedArticle.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Publisher deploy settings */}
              <div className="p-6 space-y-4">
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200/40 text-xs text-orange-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#e86420] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-orange-950">Confirm Publication Release Payload</p>
                    <p className="mt-0.5 text-orange-800">Deploying registers this article immediately onto the public web feeds directory. This freezes further edits by creators. Claim ownership of final payload release below.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Publisher Deployment Commentary (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Approved and signed-off by Director of Travel. Story is live."
                    value={publishedComments}
                    onChange={(e) => setPublishedComments(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#20a6eb] text-slate-700"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handlePublishDeploy}
                    disabled={deploying}
                    className="w-full md:w-auto px-6 py-3 bg-[#e86420] hover:bg-[#d05315] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish live to RadarDesk feed</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50/50 p-12 text-center rounded-2xl border border-slate-150 flex flex-col justify-center items-center h-full min-h-[400px]">
              <Globe className="w-16 h-16 text-slate-200 mb-4" />
              <h4 className="font-bold text-slate-700 mb-1">Select Manuscript to Preview</h4>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Choose a quality-verified draft from the sidebar queues to construct mock screen designs and perform final production release.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
