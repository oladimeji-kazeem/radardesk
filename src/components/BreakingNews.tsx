import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Activity,
    Bell,
    TrendingUp,
    Clock,
    Search,
    ChevronRight,
    ArrowLeft,
    Share2,
    Bookmark,
    Eye,
    Zap,
    ShieldAlert,
    Radio,
    Terminal
} from 'lucide-react';
import { Article } from '../types';

interface BreakingNewsProps {
    articles: Article[];
    onNavigate?: (cat: string) => void;
}

export default function BreakingNews({ articles, onNavigate }: BreakingNewsProps) {
    const [activeFilter, setActiveFilter] = useState<'All' | 'Aviation' | 'Market' | 'Travel' | 'Strategy'>('All');
    const [protocolStatus, setProtocolStatus] = useState('Stable');

    useEffect(() => {

        const timer = setInterval(() => {
            const statuses = ['Stable', 'Uplink Busy', 'Intercepting', 'Decoding'];
            setProtocolStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        }, 5000);

        // Auto-scroll Live Wire
        const scrollFreq = 50;
        const scrollStep = 1;
        let isPaused = false;

        const scrollContainer = document.getElementById('live-wire-container');
        const scrollInterval = setInterval(() => {
            if (scrollContainer && !isPaused) {
                scrollContainer.scrollTop += scrollStep;
                if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
                    scrollContainer.scrollTop = 0;
                }
            }
        }, scrollFreq);

        const handleMouseEnter = () => { isPaused = true; };
        const handleMouseLeave = () => { isPaused = false; };

        scrollContainer?.addEventListener('mouseenter', handleMouseEnter);
        scrollContainer?.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearInterval(timer);
            clearInterval(scrollInterval);
            scrollContainer?.removeEventListener('mouseenter', handleMouseEnter);
            scrollContainer?.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const categories = ['Breaking News', 'Radar', 'Aviation', 'Travel', 'Newsletters', 'Aircraft Sales'];

    const filteredArticles = activeFilter === 'All'
        ? articles.filter(a => a.status === 'Published')
        : articles.filter(a => a.status === 'Published' && a.category === activeFilter);

    // Sort by Date (newest first)
    const sortedArticles = [...filteredArticles].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const featuredStory = sortedArticles[0];
    const sideStories = sortedArticles.slice(1, 3);
    const gridStories = sortedArticles.slice(3, 7);
    const timelineStories = sortedArticles.slice(7);

    return (
        <div className="bg-[#fcfcfc] text-[#1a1a1a] font-sans selection:bg-[#20a6eb]/20">

            <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-12">
                {/* Live Protocol Header */}
                <header className="mb-20">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#1a1a1a] rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
                                    <Radio className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black italic tracking-tighter leading-none mb-1">
                                        Breaking <span className="text-[#20a6eb]">News</span>
                                    </h1>
                                    <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.3em] text-[#1a1a1a]/40">
                                        <span className="flex items-center gap-2 text-emerald-500">
                                            <Activity className="w-3 h-3 animate-ping" /> Live Feed Active
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-2">
                                            <Terminal className="w-3 h-3" /> Protocol: {protocolStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Control Center */}
                        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-black/5 shadow-2xl backdrop-blur-xl">
                            {['All', 'Aviation', 'Market', 'Travel', 'Strategy'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter as any)}
                                    className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black tracking-widest transition-all border-0 cursor-pointer ${activeFilter === filter
                                        ? 'bg-[#1a1a1a] text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] scale-105'
                                        : 'hover:bg-black/5 text-[#1a1a1a]/40 hover:text-[#1a1a1a]'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Intelligence Cluster */}
                    <div className="lg:col-span-9 space-y-8">
                        {/* Hero Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {featuredStory && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="xl:col-span-8 group cursor-pointer"
                                >
                                    <div className="relative aspect-[16/10] rounded-[3.5rem] overflow-hidden shadow-2xl mb-8">
                                        <img
                                            src={featuredStory.headerImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200'}
                                            className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                            alt={featuredStory.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />

                                        {/* Status Overlays */}
                                        <div className="absolute top-10 left-10 flex gap-3">
                                            <span className="bg-red-500 text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest shadow-2xl animate-pulse">
                                                Flash Intel
                                            </span>
                                            <span className="bg-white/10 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest border border-white/20">
                                                {featuredStory.category}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-12 left-12 right-12">
                                            <div className="flex items-center gap-3 text-[10px] font-black text-[#20a6eb] tracking-widest mb-4">
                                                <Clock className="w-4 h-4" /> {new Date(featuredStory.createdAt).toLocaleTimeString()} UTC
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-black text-white leading-[0.95] tracking-tighter italic mb-6">
                                                {featuredStory.title}
                                            </h2>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-[10px] text-white/50 font-black tracking-widest">
                                                    <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-amber-500" /> High Priority</span>
                                                    <span>•</span>
                                                    <span>By {featuredStory.writerName}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-[#20a6eb] transition-all border-0 cursor-pointer">
                                                        <Share2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-lg text-[#1a1a1a]/70 font-medium leading-relaxed italic border-l-8 border-[#20a6eb] pl-10 max-w-4xl">
                                        {featuredStory.excerpt}
                                    </p>
                                </motion.div>
                            )}

                            {/* Secondary Side Column */}
                            <div className="xl:col-span-4 space-y-8">
                                {sideStories.map((story, i) => (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * (i + 1) }}
                                        className="group cursor-pointer bg-white p-6 rounded-[2.5rem] border border-black/5 hover:shadow-2xl hover:border-[#20a6eb]/20 transition-all"
                                    >
                                        <div className="relative aspect-[16/9] rounded-[1.5rem] overflow-hidden mb-6">
                                            <img
                                                src={story.headerImage || `https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=800`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={story.title}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-[#20a6eb] tracking-widest">{story.category}</span>
                                                <span className="text-[9px] font-bold text-black/20 italic">{new Date(story.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                            <h3 className="text-lg font-black leading-tight text-[#1a1a1a] group-hover:text-[#20a6eb] transition-colors italic">
                                                {story.title}
                                            </h3>
                                            <p className="text-[11px] text-[#1a1a1a]/50 font-medium italic line-clamp-2">{story.excerpt}</p>
                                            <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                                                <span className="text-[8px] font-black text-emerald-500 flex items-center gap-1">
                                                    <Activity className="w-3 h-3" /> Verified Intel
                                                </span>
                                                <button className="text-[9px] font-black text-black/30 hover:text-[#20a6eb] transition-colors border-0 bg-transparent cursor-pointer">
                                                    Analyze intel →
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Cluster Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {gridStories.map((story, i) => (
                                <motion.div
                                    key={story.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    className="group cursor-pointer space-y-4"
                                >
                                    <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-lg border border-black/5">
                                        <img
                                            src={story.headerImage || `https://images.unsplash.com/photo-${1510000000000 + i}?q=80&w=600`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 grayscale-[0.4] group-hover:grayscale-0"
                                            alt={story.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute top-4 right-4 h-3 w-3 bg-[#20a6eb] rounded-full shadow-[0_0_10px_#20a6eb]" />
                                    </div>
                                    <div className="px-2">
                                        <div className="text-[9px] font-black text-black/30 tracking-widest mb-1">{story.category}</div>
                                        <h4 className="text-sm font-black leading-snug text-[#1a1a1a] group-hover:text-[#20a6eb] transition-colors line-clamp-2 italic">
                                            {story.title}
                                        </h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Timeline Sidebar */}
                    <div className="lg:col-span-3 space-y-10 h-full">
                        <div className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-8 text-[#1a1a1a] shadow-2xl border border-white/50 relative overflow-hidden h-full flex flex-col min-h-[800px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#20a6eb]/10 blur-[100px] rounded-full" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-6">
                                    <h3 className="text-base font-black tracking-tighter italic flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-red-500 animate-pulse" /> Live Wire
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const container = document.getElementById('live-wire-container');
                                                if (container) container.scrollBy({ top: -100, behavior: 'smooth' });
                                            }}
                                            className="p-2 rounded-full border border-black/5 hover:bg-black/5 transition-all cursor-pointer bg-transparent"
                                        >
                                            <ChevronRight className="w-3 h-3 -rotate-90" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const container = document.getElementById('live-wire-container');
                                                if (container) container.scrollBy({ top: 100, behavior: 'smooth' });
                                            }}
                                            className="p-2 rounded-full border border-black/5 hover:bg-black/5 transition-all cursor-pointer bg-transparent"
                                        >
                                            <ChevronRight className="w-3 h-3 rotate-90" />
                                        </button>
                                    </div>
                                </div>

                                <div
                                    id="live-wire-container"
                                    className="flex-1 overflow-y-auto pr-4 space-y-10 relative scroll-smooth no-scrollbar"
                                    style={{ maxHeight: 'calc(100vh - 400px)' }}
                                >
                                    <div className="absolute left-1.5 top-2 bottom-2 w-[1px] bg-black/5" />

                                    {timelineStories.length > 0 ? timelineStories.map((story, i) => (
                                        <motion.div
                                            key={story.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            className="relative pl-8 group cursor-pointer"
                                        >
                                            <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-black/5 group-hover:border-red-500 group-hover:scale-125 transition-all z-10 shadow-sm" />
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-red-500 tracking-widest">{new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                                                    <span className="text-[8px] font-black text-black/20 tracking-widest px-2 py-0.5 bg-black/5 rounded border border-black/5">RD-Source</span>
                                                </div>
                                                <h4 className="text-[14px] font-bold text-[#1a1a1a] group-hover:text-red-500 transition-all leading-tight italic tracking-tight">
                                                    {story.title}
                                                </h4>
                                                <div className="flex items-center flex-wrap gap-2 pt-1">
                                                    <span className="text-[8px] font-black text-black/40 bg-black/5 px-2 py-0.5 rounded">#{story.category}</span>
                                                    {i === 0 && <span className="text-[8px] font-black text-amber-500 animate-pulse">Priority</span>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        [1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
                                            <div key={i} className="relative pl-8 opacity-20">
                                                <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white/20" />
                                                <div className="space-y-2">
                                                    <div className="h-2 w-16 bg-white/10 rounded" />
                                                    <div className="h-4 w-full bg-white/10 rounded" />
                                                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-black/5">
                                <div className="bg-red-500/5 rounded-3xl p-6 border border-red-500/10 text-center group cursor-pointer hover:bg-red-500/10 transition-all">
                                    <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                    <h5 className="text-[10px] font-black text-red-500 tracking-widest mb-2">Emergency Protocols</h5>
                                    <p className="text-[9px] text-black/40 font-medium italic">Active crisis monitoring for high-altitude zones & conflict corridors.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
