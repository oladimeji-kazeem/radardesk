import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Clock,
    User,
    MessageSquare,
    Send,
    Eye,
    Share2,
    Calendar,
    Layers,
    Award,
    Twitter,
    Facebook,
    Linkedin,
    Smartphone
} from 'lucide-react';
import { Article } from '../types';

interface ArticleReaderProps {
    article: Article;
    articles: Article[];
    onBack: () => void;
    onNavigate: (cat: string) => void;
    onPostComment: (articleId: string, commentText: string) => Promise<void>;
    currentUser?: any;
}

export default function ArticleReader({
    article,
    articles,
    onBack,
    onNavigate,
    onPostComment,
    currentUser
}: ArticleReaderProps) {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Split content by paragraphs
    const paragraphs = article.content
        ? article.content.split('\n').filter((p) => p.trim() !== '')
        : ['No text written for this intelligence node.'];

    // Find related articles (same category, excluding current one)
    const relatedArticles = articles
        .filter((a) => a.status === 'Published' && a.id !== article.id && a.category === article.category)
        .slice(0, 3);

    // If not enough related in same category, grab any published ones
    if (relatedArticles.length < 3) {
        const extra = articles
            .filter((a) => a.status === 'Published' && a.id !== article.id && !relatedArticles.some((r) => r.id === a.id))
            .slice(0, 3 - relatedArticles.length);
        relatedArticles.push(...extra);
    }

    // Accent color mapping based on Category
    const getCategoryTheme = (category?: string) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('aviation') || cat.includes('aircraft')) {
            return {
                bg: 'bg-sky-500/10',
                text: 'text-sky-600 border-sky-400/20',
                accent: '#0369a1',
                iconColor: 'text-sky-500'
            };
        }
        if (cat.includes('travel') || cat.includes('deal') || cat.includes('tour')) {
            return {
                bg: 'bg-amber-500/10',
                text: 'text-amber-600 border-amber-400/20',
                accent: '#b45309',
                iconColor: 'text-amber-500'
            };
        }
        if (cat.includes('breaking') || cat.includes('incident') || cat.includes('rule')) {
            return {
                bg: 'bg-rose-500/10',
                text: 'text-rose-600 border-rose-400/20',
                accent: '#be123c',
                iconColor: 'text-rose-500'
            };
        }
        return {
            bg: 'bg-indigo-500/10',
            text: 'text-indigo-600 border-indigo-400/20',
            accent: '#4338ca',
            iconColor: 'text-indigo-500'
        };
    };

    const theme = getCategoryTheme(article.category);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            setIsSubmitting(true);
            await onPostComment(article.id, commentText);
            setCommentText('');
        } catch (err) {
            console.error('Failed to post comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt || article.title,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Article link copied to clipboard!');
        }
    };

    const handleSocialShare = (platform: string) => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(article.title);
        switch (platform) {
            case 'twitter': window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400'); break;
            case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400'); break;
            case 'linkedin': window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400'); break;
            case 'whatsapp': window.open(`https://api.whatsapp.com/send?text=${text} ${url}`, '_blank'); break;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] text-[#1a1a1a] font-sans selection:bg-[#20a6eb]/20 pb-24">
            {/* Article Navigation Bar */}
            <div className="bg-white border-b border-black/5 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-[10px] font-black tracking-widest text-[#1a1a1a]/40 hover:text-[#20a6eb] transition-all group border-0 bg-transparent cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        RETURN TO SHELL
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-xl border border-black/5 hover:bg-black/5 transition-all text-[#1a1a1a]/60 flex items-center gap-1.5 text-[9px] font-black tracking-widest cursor-pointer bg-transparent"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            SHARE INTEL
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 pt-12">
                <article className="space-y-10 bg-white border border-black/5 rounded-[3rem] p-6 md:p-12 shadow-sm relative overflow-hidden">
                    {/* Top category indicator & meta */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border tracking-widest uppercase ${theme.text} ${theme.bg}`}>
                                {article.category || 'MARKET'}
                            </span>
                            <span className="text-[10px] font-black text-black/20 tracking-wider font-mono">
                                RD-NODE // {article.id.toUpperCase()}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a] leading-tight tracking-tighter italic">
                            {article.title}
                        </h1>

                        {/* Author and verification panel */}
                        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-black/5 text-[10px] font-bold text-black/45 tracking-wider">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-black/5">
                                    <User className="w-3.5 h-3.5 text-black/40" />
                                </div>
                                <span>By <strong className="text-[#1a1a1a]">{article.writerName || 'Intelligence Dept'}</strong></span>
                            </div>
                            <span className="text-black/10">•</span>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-black/20" />
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className="text-black/10">•</span>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-black/20" />
                                <span>Estimate 4m read</span>
                            </div>
                            <span className="text-black/10">•</span>
                            <div className="flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-black/20" />
                                <span>Live verified</span>
                            </div>
                        </div>

                        {/* Social Sharing Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                            <span className="text-[10px] font-black text-black/30 tracking-wider mr-2">SHARE STORY</span>
                            <button onClick={() => handleSocialShare('twitter')} className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 flex items-center justify-center transition-colors border-0 cursor-pointer text-[#1DA1F2]">
                                <Twitter className="w-4 h-4 fill-current" />
                            </button>
                            <button onClick={() => handleSocialShare('facebook')} className="w-8 h-8 rounded-full bg-[#4267B2]/10 hover:bg-[#4267B2]/20 flex items-center justify-center transition-colors border-0 cursor-pointer text-[#4267B2]">
                                <Facebook className="w-4 h-4 fill-current" />
                            </button>
                            <button onClick={() => handleSocialShare('linkedin')} className="w-8 h-8 rounded-full bg-[#0077B5]/10 hover:bg-[#0077B5]/20 flex items-center justify-center transition-colors border-0 cursor-pointer text-[#0077B5]">
                                <Linkedin className="w-4 h-4 fill-current" />
                            </button>
                            <button onClick={() => handleSocialShare('whatsapp')} className="w-8 h-8 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center transition-colors border-0 cursor-pointer text-[#25D366]">
                                <Smartphone className="w-4 h-4 fill-current" />
                            </button>
                        </div>
                    </div>

                    {/* Header Image with caption overlay */}
                    {article.headerImage && (
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl skew-x-[-1deg] border border-black/5 group aspect-video md:aspect-[21/10]">
                            <img
                                src={article.headerImage}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                                alt={article.title}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=1200&q=80';
                                }}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white text-[10px] font-medium italic">
                                Source: RadarDesk Global Intelligence Stream. Document ID: {article.id}.
                            </div>
                        </div>
                    )}

                    {/* Excerpt panel */}
                    {article.excerpt && (
                        <div className="border-l-8 border-[#20a6eb] bg-slate-50 p-6 md:p-8 rounded-[2rem] text-sm md:text-base font-medium italic text-[#1a1a1a]/70 leading-relaxed shadow-inner">
                            {article.excerpt}
                        </div>
                    )}

                    {/* Main article text body */}
                    <div className="space-y-6 text-[#1a1a1a]/80 text-sm md:text-base leading-relaxed tracking-wide font-normal font-sans">
                        {paragraphs.map((p, idx) => (
                            <p key={idx} className={`${idx === 0 && !article.excerpt ? 'first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:text-[#20a6eb] first-letter:leading-none' : ''}`}>
                                {p}
                            </p>
                        ))}
                    </div>

                    {/* Verification stamp */}
                    <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">
                                AUTOMATED CHECKLIST COMPLETE (SCORE: {article.score || 80}/100)
                            </span>
                        </div>
                        <span className="text-[8px] font-black text-black/20 tracking-wider uppercase font-mono">
                            RD-GATEKEEPER-SIG-OK
                        </span>
                    </div>
                </article>

                {/* Dynamic Related News Section */}
                <section className="mt-16 space-y-6">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#20a6eb]" />
                        <h3 className="text-xs font-black tracking-widest uppercase">Related Intelligence</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedArticles.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => onNavigate(`/article/${item.id}`)}
                                className="group cursor-pointer bg-white p-4 rounded-[2rem] border border-black/5 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="aspect-[16/10] rounded-[1.5rem] overflow-hidden mb-4 relative shadow-sm border border-black/5">
                                    <img
                                        src={item.headerImage || 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=400&q=80'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={item.title}
                                    />

                                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white tracking-widest uppercase">
                                        {item.category || 'INTEL'}
                                    </div>
                                </div>
                                <h4 className="text-xs font-black leading-snug text-[#1a1a1a] group-hover:text-[#20a6eb] transition-colors line-clamp-2 italic">
                                    {item.title}
                                </h4>
                                <p className="text-[9px] text-black/40 mt-1 lines-clamp-1 italic font-medium">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Comments / Reader Feedback Section */}
                <section className="mt-16 bg-white border border-black/5 rounded-[3rem] p-6 md:p-10 shadow-sm space-y-8">
                    <div className="flex items-center justify-between border-b border-black/5 pb-4">
                        <h3 className="text-sm font-extrabold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            <span>Reader Feedback ({article.comments?.length || 0})</span>
                        </h3>
                        <span className="text-[9px] font-black text-black/35 tracking-widest">
                            RD-FEEDBACK-UPLINK
                        </span>
                    </div>

                    {/* Post Comment Form */}
                    <form onSubmit={handleSubmitComment} className="space-y-4">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Submit feedback/intel verification check to this record..."
                            className="w-full text-xs p-4 rounded-2xl border border-black/10 bg-slate-50 focus:bg-white transition-all outline-none resize-none h-24 placeholder:text-black/30 font-medium"
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-black/30">
                                {currentUser ? `Submitting as: ${currentUser.name} (${currentUser.role})` : 'Submitting anonymously'}
                            </span>
                            <button
                                type="submit"
                                disabled={isSubmitting || !commentText.trim()}
                                className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#20a6eb] text-white rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 border-0 cursor-pointer transition-all disabled:opacity-30"
                            >
                                {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT'}
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>

                    {/* List of comments */}
                    <div className="space-y-4 pt-4">
                        {article.comments && article.comments.length > 0 ? (
                            [...article.comments]
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((comm) => (
                                    <div key={comm.id} className="bg-slate-50/70 p-4 rounded-2xl border border-black/5 text-xs text-left">
                                        <div className="flex justify-between text-[9px] font-black tracking-wider text-black/30 font-mono pb-2 mb-2 border-b border-black/[0.03]">
                                            <span>{comm.authorName.toUpperCase()} // role: {comm.authorRole.toUpperCase()}</span>
                                            <span>{new Date(comm.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-[#1a1a1a]/80 leading-relaxed font-semibold italic">{comm.text}</p>
                                    </div>
                                ))
                        ) : (
                            <p className="text-xs text-black/30 italic text-center py-6">No audience feedback verification comments recorded for this node.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
