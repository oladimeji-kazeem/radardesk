import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    Menu,
    X,
    Facebook,
    Twitter,
    Youtube,
    Instagram,
    ArrowRight,
    Play,
    Clock,
    TrendingUp,
    ChevronRight,
    Plane,
    MapPin,
    Bell,
    Mail,
    PlayCircle
} from 'lucide-react';
import { Article, Topic, WorkflowConfig } from '../types';
import { Logo } from './Logo';

interface PortalLandingProps {
    topics: Topic[];
    articles: Article[];
    config: WorkflowConfig;
    onGetStarted: () => void;
    onSignIn: () => void;
}

export default function PortalLanding({ topics, articles, config, onGetStarted, onSignIn }: PortalLandingProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    // Sync scroll state for header effects
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filter published articles
    const publishedArticles = articles
        .filter(a => a.status === 'Published' || a.status === 'Approved')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Mock data for missing sections if articles are few
    const featuredArticle = publishedArticles[0] || {
        id: 'feat-1',
        title: 'Breaking: New Aviation Standards Set for 2026 Flight Operations',
        writerName: 'Editorial Team',
        createdAt: new Date().toISOString(),
        content: 'The aviation industry is bracing for standard changes...',
        category: 'Aviation News'
    };

    const secondaryArticles = publishedArticles.slice(1, 3);
    const trendingStories = publishedArticles.slice(3, 8);
    const recentNews = publishedArticles.slice(0, 10);

    const categories = ['Breaking News', 'Aviation', 'Travel', 'Newsletters', 'Aircraft for Sale'];

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans selection:bg-[#20a6eb]/20 overflow-x-hidden">



            {/* Top Utility Bar */}
            <div className="hidden lg:block bg-[#363636] text-white py-2 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5"><Facebook className="w-3 h-3" /></a>
                        <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5"><Twitter className="w-3 h-3" /></a>
                        <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5"><Youtube className="w-3 h-3" /></a>
                        <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5"><Instagram className="w-3 h-3" /></a>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1 rounded-full cursor-pointer hover:bg-white/20 transition-all text-white/80 hover:text-white">
                            <Search className="w-3 h-3" /> Search
                        </span>
                        <div className="flex gap-4">
                            <button onClick={onSignIn} className="hover:text-[#20a6eb] transition-colors bg-transparent border-0 cursor-pointer text-[11px] font-bold uppercase text-white/80">Sign In</button>
                            <button onClick={onGetStarted} className="firebase-gradient px-4 py-1.5 rounded-full text-white hover:scale-105 transition-all bg-transparent border-0 cursor-pointer text-[11px] font-bold uppercase firebase-glow-blue">Join Radar</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Sticky Header */}
            <header
                className={`sticky top-0 z-50 w-full transition-all duration-500 border-b ${scrolled ? 'bg-white/90 backdrop-blur-xl py-3 border-gray-100 shadow-xl' : 'bg-transparent py-8 border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Logo className="w-10 h-10 group-hover:rotate-[360deg] transition-all duration-700 p-1 rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter text-[#1a1a1a] leading-none">TRAVEL RADAR</span>
                            <span className="text-[9px] font-bold tracking-[0.2em] text-[#20a6eb] uppercase">Aviation News & Insight</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-10">
                        {categories.map((cat) => (
                            <a
                                key={cat}
                                href="#"
                                className={`text-[12px] font-bold uppercase tracking-widest hover:text-[#20a6eb] transition-all relative group ${activeCategory === cat ? 'text-[#20a6eb]' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
                                    }`}
                            >
                                {cat}
                                <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-[#20a6eb] transition-transform duration-300 ${activeCategory === cat ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                    }`} />
                            </a>
                        ))}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-[#1a1a1a] hover:bg-black/5 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>


                </div>
            </header>

            {/* Breaking News Ticker */}
            <div className="bg-white border-y border-black/5 py-3 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 flex items-center">
                    <div className="flex items-center gap-2 firebase-gradient text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 mr-6 firebase-glow-orange shadow-lg">
                        <span className="animate-pulse w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]" />
                        Latest News
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex animate-marquee whitespace-nowrap gap-12 text-[12px] font-bold text-[#1a1a1a]/40 tracking-wide uppercase">
                            {recentNews.length > 0 ? recentNews.map((art, i) => (
                                <span key={i} className="hover:text-[#20a6eb] cursor-pointer transition-all hover:translate-y-[-1px] inline-block">• {art.title}</span>
                            )) : (
                                <>
                                    <span className="hover:text-[#20a6eb] cursor-pointer transition-colors">• New Direct Routes Announced for Transatlantic Summer 2026 Operations</span>
                                    <span className="hover:text-[#20a6eb] cursor-pointer transition-colors">• Global Air Traffic Hits Record High as Travel Demand Surges</span>
                                    <span className="hover:text-[#20a6eb] cursor-pointer transition-colors">• Future of Electric Aircraft: Prototype Completes First Zero-Emission Flight</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

                {/* Hero Featured Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
                    <div className="lg:col-span-3 space-y-8">
                        {/* Large Featured Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-[16/9] md:aspect-[21/9] rounded-[3rem] overflow-hidden group cursor-pointer shadow-[0_30px_100px_rgba(0,0,0,0.15)] glowing-radar-border"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200"
                                alt="Featured News"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent opacity-80" />
                            <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:max-w-5xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="firebase-gradient text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        Aviation Spotlight
                                    </span>
                                    <span className="text-[#1a1a1a]/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-black/5 py-1.5 px-3 rounded-full backdrop-blur-md border border-black/5">
                                        <Clock className="w-3 h-3" /> {new Date(featuredArticle.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-7xl font-black text-[#1a1a1a] mb-6 leading-[0.95] tracking-tighter group-hover:text-[#20a6eb] transition-all drop-shadow-sm">
                                    {featuredArticle.title}
                                </h1>
                                <p className="text-[#1a1a1a]/60 text-base md:text-2xl line-clamp-2 max-w-4xl font-medium leading-relaxed">
                                    {featuredArticle.content.substring(0, 180)}...
                                </p>
                            </div>
                        </motion.div>

                        {/* Secondary Hero Grid */}
                        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                            {secondaryArticles.length > 0 ? secondaryArticles.map((art, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * (i + 1) }}
                                    className="w-[85vw] md:w-[calc(50%-0.75rem)] shrink-0 snap-center firebase-card-effect rounded-[2.5rem] overflow-hidden cursor-pointer group"
                                >
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=600&q=80`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-90 group-hover:opacity-100 grayscale-[0.3] group-hover:grayscale-0"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=640";
                                            }}
                                        />
                                    </div>
                                    <div className="p-10">
                                        <span className="text-[10px] font-black text-[#20a6eb] uppercase tracking-widest mb-4 block">Insights</span>
                                        <h3 className="text-xl font-black leading-tight group-hover:text-[#20a6eb] transition-colors line-clamp-2 text-[#1a1a1a]/80">
                                            {art.title}
                                        </h3>
                                        <div className="mt-8 flex items-center justify-between text-[10px] font-black text-black/20 uppercase tracking-widest border-t border-black/5 pt-4">
                                            <span>{art.writerName}</span>
                                            <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                [1, 2, 3].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-[85vw] md:w-[calc(50%-0.75rem)] shrink-0 snap-center firebase-card-effect p-6 rounded-[2.5rem] cursor-pointer group"
                                    >
                                        <div className="aspect-video overflow-hidden rounded-[2rem] shadow-lg mb-6">
                                            <img
                                                src={i === 0 ? "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80" : i === 1 ? "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=600&q=80" : "https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=600&q=80"}
                                                alt="News"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 grayscale-[0.3] group-hover:grayscale-0"
                                            />
                                        </div>
                                        <div className="px-2">
                                            <span className="text-[10px] font-black text-[#e86420] uppercase tracking-[0.2em] mb-3 block">Corporate Intelligence</span>
                                            <h3 className="text-xl font-black leading-snug group-hover:text-[#20a6eb] transition-colors line-clamp-2 text-[#1a1a1a]/80">
                                                {i === 0 ? 'Airline Revenue Systems Saw 12% Growth in Q1 Post-Pandemic Era' : i === 1 ? 'Why Fuel Efficiency is the #1 Priority for Emerging Carriers' : 'Global Logistics: The Role of Sustainable Aviation Fuel'}
                                            </h3>
                                            <div className="mt-6 flex items-center justify-between text-[10px] font-black text-black/20 uppercase tracking-[0.2em] border-t border-black/5 pt-4">
                                                <span>Analysis Team</span>
                                                <span>May 22, 2026</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Trending Stories Sidebar */}
                    <aside className="lg:col-span-1 space-y-10">
                        <div className="firebase-card-effect p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-black/5 bg-white/80 backdrop-blur-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#20a6eb] opacity-10 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#e86420] opacity-10 blur-3xl pointer-events-none" />

                            <h2 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-[#1a1a1a]">
                                <TrendingUp className="w-5 h-5 text-[#20a6eb]" /> Trending
                            </h2>
                            <div className="space-y-8">
                                {trendingStories.length > 0 ? trendingStories.map((art, i) => (
                                    <div key={i} className="flex gap-5 group cursor-pointer border-b border-black/5 pb-6 last:border-0 last:pb-0">
                                        <span className="text-4xl font-black text-black/5 group-hover:text-[#20a6eb]/40 transition-colors leading-none italic">{i + 1}</span>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-black leading-snug group-hover:text-[#20a6eb] transition-all line-clamp-2 text-[#1a1a1a]/80 group-hover:text-[#1a1a1a]">
                                                {art.title}
                                            </h4>
                                            <p className="text-[10px] text-black/30 font-black uppercase tracking-widest">{new Date(art.createdAt).toLocaleDateString()} • Aviation</p>
                                        </div>
                                    </div>
                                )) : (
                                    [1, 2, 3, 4, 5].map((_, i) => (
                                        <div key={i} className="flex gap-5 group cursor-pointer border-b border-black/5 pb-6 last:border-0 last:pb-0">
                                            <span className="text-4xl font-black text-black/5 group-hover:text-[#20a6eb]/40 transition-colors leading-none italic">{i + 1}</span>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-black leading-snug group-hover:text-[#20a6eb] transition-all line-clamp-2 text-[#1a1a1a]/80 group-hover:text-[#1a1a1a]">
                                                    {i === 0 ? 'The Most Luxurious First Class Cabins of 2026' :
                                                        i === 1 ? 'Top 10 Safe Havens for Long Haul Layovers' :
                                                            i === 2 ? 'Boeing vs Airbus: The Strategic Rivalry intensifies' :
                                                                i === 3 ? 'Budget Travel is Changing: New Low-Cost Entrants Explained' :
                                                                    'Aviation Sustainability: Beyond Carbon Offsetting'}
                                                </h4>
                                                <p className="text-[10px] text-black/20 font-black uppercase tracking-widest">Editor's Pick • Insight</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button
                                onClick={onGetStarted}
                                className="w-full mt-10 firebase-gradient text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] border-0 cursor-pointer firebase-glow-blue shadow-lg"
                            >
                                Access Radar Desk
                            </button>
                        </div>

                        <div className="bg-white/50 border border-black/5 p-8 rounded-3xl backdrop-blur-sm shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#1a1a1a] mb-6 border-b border-black/5 pb-3 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#e86420]" /> Newsletter
                            </h3>
                            <p className="text-[12px] text-black/40 mb-6 font-medium leading-relaxed italic">Direct aviation intelligence, curated for professionals.</p>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="bg-white border border-black/5 px-4 py-3.5 rounded-xl text-xs text-[#1a1a1a] outline-none focus:border-[#20a6eb] transition-all placeholder:text-black/10"
                                />
                                <button className="bg-[#1a1a1a] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#20a6eb] transition-all border-0 cursor-pointer shadow-xl">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </aside>
                </section>

                {/* Categories Sections */}
                <section className="space-y-16 py-8">

                    {/* Section: Travel & Trip Reviews */}
                    <div className="space-y-10">
                        <div className="flex items-center justify-between border-b border-black/5 pb-6">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1a1a1a] flex items-center gap-4">
                                <span className="w-2 h-10 firebase-gradient rounded-full" /> Travel & Trip Reviews
                            </h2>
                            <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-[#20a6eb] hover:translate-x-2 transition-all flex items-center gap-2 group">
                                Exploration Archive <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-8 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                            {[1, 2, 3, 4].map((_, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className="w-[85vw] md:w-[calc(33.33%-1.5rem)] shrink-0 snap-center group cursor-pointer firebase-card-effect p-4 rounded-[3rem]"
                                >
                                    <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl border border-black/5">
                                        <img
                                            src={i === 3 ? "https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=600&q=80" : `https://images.unsplash.com/photo-${1500000000500 + i}?auto=format&fit=crop&w=600&q=80`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-90 group-hover:opacity-100"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=640";
                                            }}
                                        />
                                        <div className="absolute top-5 left-5 firebase-gradient px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                                            Flight Review
                                        </div>
                                    </div>
                                    <div className="px-4 pb-6">
                                        <h3 className="text-xl font-black leading-tight group-hover:text-[#20a6eb] transition-colors line-clamp-2 italic text-[#1a1a1a]/80">
                                            {i === 0 ? 'Testing the New Dreamliner Suites: Is it worth the upgrade?' :
                                                i === 1 ? 'Exploring Singapore Changi: The Worlds Best Transit Hub?' :
                                                    i === 2 ? 'Economy Class Showdown: Best Value trans-atlantic flights ranked' : 'Inside the New Ultra-Long-Haul First Class Cabins'}
                                        </h3>
                                        <div className="mt-5 flex items-center gap-3 text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">
                                            <span className="bg-[#20a6eb]/10 text-[#20a6eb] px-2 py-0.5 rounded-full border border-[#20a6eb]/10">★ {8.5 + (i * 0.2)} Rating</span>
                                            <span>• May {21 + i}, 2026</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Section: Accidents & Incidents */}
                    <div className="bg-[#f8f9fa] rounded-[3rem] p-8 md:p-16 text-[#1a1a1a] relative overflow-hidden shadow-2xl border border-black/5">
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
                            <Plane className="absolute top-10 right-10 w-96 h-96 transform rotate-45 text-[#363636]" />
                        </div>
                        <div className="relative z-10 space-y-12">
                            <div className="flex items-center justify-between border-b border-black/5 pb-8">
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                                    <span className="w-2 h-8 bg-rose-500 rounded-full" /> Accidents & Incidents
                                </h2>
                                <a href="#" className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-all flex items-center gap-2 group">
                                    Full Archive <ChevronRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-16 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="w-[90vw] lg:w-[calc(50%-2rem)] shrink-0 snap-center flex flex-col md:flex-row gap-8 group cursor-pointer">
                                        <div className="w-full md:w-64 shrink-0 aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-2xl grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700">
                                            <img
                                                src={i === 0 ? "https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=600&q=80" : i === 1 ? "https://images.unsplash.com/photo-1520603711218-c29000a6e343?auto=format&fit=crop&w=600&q=80" : "https://images.unsplash.com/photo-1506012787146?auto=format&fit=crop&w=600&q=80"}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100"
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10">Incident Report</span>
                                            <h3 className="text-2xl font-black leading-tight group-hover:text-rose-500 transition-colors text-[#1a1a1a]/80">
                                                {i === 0 ? 'Emergency Landing at Heathrow After Engine Anomaly Detected' : i === 1 ? 'Safety Audit: Regional Carriers Face Stricter Oversight' : 'Global Safety Protocol Updated for Transatlantic Operations'}
                                            </h3>
                                            <p className="text-sm text-[#1a1a1a]/40 line-clamp-3 leading-relaxed font-medium">
                                                Investigation underway following standard protocol to ensure passenger safety and operational integrity...
                                            </p>
                                            <div className="pt-4 flex items-center gap-6 text-[10px] font-black text-[#1a1a1a]/20 uppercase tracking-widest border-t border-black/5">
                                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#20a6eb]" /> {i + 2} Hours Ago</span>
                                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" /> {i === 0 ? 'London, UK' : i === 1 ? 'Paris, FR' : 'New York, US'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section: Latest Videos */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between border-b border-black/5 pb-8">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1a1a1a] flex items-center gap-4">
                                <span className="w-2 h-10 bg-[#e86420] rounded-full" /> Latest Videos
                            </h2>
                            <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-[#e86420] hover:translate-x-2 transition-all flex items-center gap-4 group italic">
                                Radar Studio <PlayCircle className="w-5 h-5 group-hover:scale-125 transition-all text-[#e86420]" />
                            </a>
                        </div>
                        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-10 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                            {[
                                { title: "ELVIS' JETSTAR UP FOR AUCTION", thumb: "https://travelradar.aero/wp-content/uploads/2024/09/Elvis-Jetstar.png", id: "wXR07418Zf4" },
                                { title: "FAA ORDERS GROUND STOP", thumb: "https://travelradar.aero/wp-content/uploads/2024/09/FAA-Ground-Stop.jpg", id: "hX1vD--4xao" },
                                { title: "SOUTHWEST CANCELS 16,000 FLIGHTS", thumb: "https://travelradar.aero/wp-content/uploads/2024/09/Southwest-16000-Cancellations.png", id: "hg9eKlhODhI" },
                                { title: "BOEING 777X INTERIOR REVEALED", thumb: "https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=600&q=80", id: "777x-interior" }
                            ].map((video, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className="w-[85vw] md:w-[calc(33.33%-1.75rem)] shrink-0 snap-center group cursor-pointer relative rounded-[3rem] overflow-hidden shadow-2xl aspect-video firebase-card-effect border border-black/5"
                                >
                                    <img
                                        src={video.thumb}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${1500000000700 + i}?auto=format&fit=crop&w=600&q=80`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-[#20a6eb]/80 transition-all duration-700" />

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-125 group-hover:bg-[#e86420] transition-all duration-500 shadow-2xl">
                                            <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 p-8 w-full">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#20a6eb] bg-white px-3 py-1 rounded-full mb-4 inline-block shadow-lg">Radar Exclusive</span>
                                        <h3 className="text-lg md:text-xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-lg">
                                            {video.title}
                                        </h3>
                                    </div>

                                    <div className="absolute top-5 right-5 text-[10px] font-black text-white/60 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                                        {8 + i}:12
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="bg-white text-[#1a1a1a] pt-32 pb-12 relative overflow-hidden border-t border-black/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#20a6eb] via-[#e86420] to-[#363636]" />

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <Logo className="w-10 h-10 bg-white p-1 rounded-xl shadow-2xl border border-black/5" />
                            <div className="flex flex-col">
                                <span className="text-2xl font-black tracking-tighter">TRAVEL RADAR</span>
                                <span className="text-[10px] font-black tracking-[0.3em] text-[#e86420] uppercase">Network</span>
                            </div>
                        </div>
                        <p className="text-[13px] text-[#1a1a1a]/40 leading-relaxed max-w-xs font-medium italic">
                            "Redefining aviation journalism through high-fidelity insights and enterprise-grade reporting."
                        </p>
                        <div className="flex items-center gap-5 pt-4">
                            {[Facebook, Twitter, Youtube, Instagram].map((Icon, idx) => (
                                <a key={idx} href="#" className="p-3 bg-black/5 hover:bg-[#20a6eb] rounded-2xl transition-all hover:-translate-y-1 shadow-lg border border-black/5 group">
                                    <Icon className="w-5 h-5 group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-[#20a6eb] flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#20a6eb] rounded-full" /> Intelligence
                        </h4>
                        <ul className="space-y-5 text-[12px] font-black text-[#1a1a1a]/30 uppercase tracking-widest">
                            <li><a href="#" className="hover:text-[#20a6eb] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#20a6eb] group-hover:translate-x-1 transition-transform" /> Aviation News</a></li>
                            <li><a href="#" className="hover:text-[#20a6eb] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#20a6eb] group-hover:translate-x-1 transition-transform" /> Market Analysis</a></li>
                            <li><a href="#" className="hover:text-[#20a6eb] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#20a6eb] group-hover:translate-x-1 transition-transform" /> Trip Reports</a></li>
                            <li><a href="#" className="hover:text-[#20a6eb] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#20a6eb] group-hover:translate-x-1 transition-transform" /> Safety Audits</a></li>
                            <li><a href="#" className="hover:text-[#20a6eb] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#20a6eb] group-hover:translate-x-1 transition-transform" /> Aircraft Sales</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-[#e86420] flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#e86420] rounded-full" /> Operation
                        </h4>
                        <ul className="space-y-5 text-[12px] font-black text-[#1a1a1a]/30 uppercase tracking-widest">
                            <li><a href="#" className="hover:text-[#e86420] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#e86420] group-hover:translate-x-1 transition-transform" /> About Network</a></li>
                            <li><a href="#" className="hover:text-[#e86420] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#e86420] group-hover:translate-x-1 transition-transform" /> Editorial Desk</a></li>
                            <li><a href="#" className="hover:text-[#e86420] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#e86420] group-hover:translate-x-1 transition-transform" /> Career Portal</a></li>
                            <li><a href="#" className="hover:text-[#e86420] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#e86420] group-hover:translate-x-1 transition-transform" /> Data Privacy</a></li>
                            <li><a href="#" className="hover:text-[#e86420] transition-all flex items-center gap-2 group"><ChevronRight className="w-3 h-3 text-[#e86420] group-hover:translate-x-1 transition-transform" /> Global Support</a></li>
                        </ul>
                    </div>

                    <div className="firebase-card-effect p-10 rounded-[2.5rem] border-black/5 shadow-[0_30px_60px_rgba(0,0,0,0.05)] bg-white">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-[#20a6eb] animate-bounce" /> Weekly Pulse
                        </h4>
                        <p className="text-[12px] text-[#1a1a1a]/40 mb-8 leading-relaxed font-black">Join 150k+ professionals globally.</p>
                        <div className="flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="terminal@radar.aero"
                                className="bg-black/5 border border-black/5 px-5 py-4 rounded-2xl text-[11px] outline-none focus:border-[#20a6eb] transition-all text-[#1a1a1a] placeholder:text-black/10 font-black"
                            />
                            <button className="firebase-gradient text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] border-0 cursor-pointer shadow-lg firebase-glow-blue">
                                Subscribe Terminal
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-black text-[#1a1a1a]/20 uppercase tracking-[0.3em]">
                    <p>© {new Date().getFullYear()} TRAVEL RADAR ECOSYSTEM. SECURITY TUNNEL ACTIVE.</p>
                    <div className="flex items-center gap-10">
                        <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" /> Cloud Node: AMS-01</span>
                        <span className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#20a6eb] shadow-[0_0_10px_#20a6eb]" /> Latency: 14ms</span>
                    </div>
                </div>
            </footer>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-[60] bg-white flex flex-col p-8"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <Logo className="w-10 h-10 shadow-lg p-1 rounded-full bg-white" />
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg border-0 bg-transparent cursor-pointer"><X className="w-8 h-8" /></button>
                        </div>
                        <nav className="flex flex-col gap-8">
                            {categories.map((cat) => (
                                <a key={cat} href="#" className="text-3xl font-black uppercase tracking-tighter text-[#1a1a1a] hover:text-[#20a6eb] transition-colors">{cat}</a>
                            ))}
                        </nav>
                        <div className="mt-auto space-y-4 pt-12 border-t border-gray-100">
                            <button
                                onClick={() => { onSignIn(); setIsMenuOpen(false); }}
                                className="w-full py-4 bg-gray-100 text-[#1a1a1a] rounded-xl font-black uppercase tracking-widest border-0 cursor-pointer"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { onGetStarted(); setIsMenuOpen(false); }}
                                className="w-full py-4 bg-[#20a6eb] text-white rounded-xl font-black uppercase tracking-widest shadow-xl border-0 cursor-pointer"
                            >
                                Get Started
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        @keyframes shimmer {
          from { background-position: 0% 0%; }
          to { background-position: -200% 0%; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
        </div>
    );
}
