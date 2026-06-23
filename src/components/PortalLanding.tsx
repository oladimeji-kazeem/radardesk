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
    PlayCircle,
    ChevronLeft,
    User,
    Activity,
    Wind,
    Package,
    BarChart3
} from 'lucide-react';
import { useRef } from 'react';
import { Article, Topic, WorkflowConfig } from '../types';
import { Logo } from './Logo';

interface ScrollContainerProps {
    title?: string;
    children: React.ReactNode;
    subtitle?: string;
    showArrows?: boolean;
    autoScroll?: boolean;
    interval?: number;
}

function ScrollContainer({ title, children, subtitle, showArrows = true, autoScroll = false, interval = 8000 }: ScrollContainerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!autoScroll) return;
        const timer = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 50;
                const scrollTo = isAtEnd ? 0 : scrollLeft + (clientWidth / 2);
                scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
            }
        }, interval);
        return () => clearInterval(timer);
    }, [autoScroll, interval]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="group/scroll relative">
            {title && (
                <div className="flex items-center justify-between border-b border-black/5 pb-6 mb-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1a1a1a] flex items-center gap-4">
                        <span className="w-2 h-10 firebase-gradient rounded-full" /> {title}
                    </h2>
                    {subtitle && (
                        <a href="#" className="text-xs font-black uppercase tracking-[0.2em] text-[#20a6eb] hover:translate-x-2 transition-all flex items-center gap-2 group">
                            {subtitle} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    )}
                </div>
            )}

            <div className="relative">
                {showArrows && (
                    <>
                        <button
                            onClick={() => scroll('left')}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white shadow-xl rounded-full border border-black/5 text-[#1a1a1a] hover:bg-[#20a6eb] hover:text-white transition-all opacity-0 group-hover/scroll:opacity-100 disabled:opacity-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white shadow-xl rounded-full border border-black/5 text-[#1a1a1a] hover:bg-[#20a6eb] hover:text-white transition-all opacity-0 group-hover/scroll:opacity-100 disabled:opacity-0"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-8 pb-4 -mx-4 px-4 md:mx-0 md:px-0"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

function VerticalScrollContainer({ children, autoScroll = false }: { children: React.ReactNode, autoScroll?: boolean }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!autoScroll) return;
        const timer = setInterval(() => {
            if (scrollRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 30; // 30px buffer
                const scrollTo = isAtBottom ? 0 : scrollTop + (clientHeight / 2);
                scrollRef.current.scrollTo({ top: scrollTo, behavior: 'smooth' });
            }
        }, 8000); // Scroll every 8 seconds
        return () => clearInterval(timer);
    }, [autoScroll]);

    const scroll = (direction: 'up' | 'down') => {
        if (scrollRef.current) {
            const { scrollTop, clientHeight } = scrollRef.current;
            const scrollTo = direction === 'up' ? scrollTop - clientHeight : scrollTop + clientHeight;
            scrollRef.current.scrollTo({ top: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="group/vscroll relative h-[480px]">
            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-center gap-4 z-20">
                <button
                    onClick={() => scroll('up')}
                    className="p-3 bg-white shadow-xl rounded-full border border-black/5 text-[#1a1a1a] hover:bg-[#20a6eb] hover:text-white transition-all opacity-0 group-hover/vscroll:opacity-100"
                >
                    <ChevronLeft className="w-5 h-5 rotate-90" />
                </button>
                <button
                    onClick={() => scroll('down')}
                    className="p-3 bg-white shadow-xl rounded-full border border-black/5 text-[#1a1a1a] hover:bg-[#20a6eb] hover:text-white transition-all opacity-0 group-hover/vscroll:opacity-100"
                >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                </button>
            </div>
            <div
                ref={scrollRef}
                className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory space-y-6 px-1"
            >
                {children}
            </div>
        </div>
    );
}

function Sparkline({ data, height = 60, color = "#20a6eb" }: { data: number[], height?: number, color?: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const width = 200;
    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((val - min) / range) * height
    }));

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <motion.path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />
            {data.map((val, i) => (
                val === max && (
                    <motion.circle
                        key={i}
                        cx={points[i].x}
                        cy={points[i].y}
                        r="4"
                        fill="#e86420"
                        className="firebase-glow-orange"
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    />
                )
            ))}
        </svg>
    );
}

function MiniBarChart({ data }: { data: { label: string, value: number, color?: string }[] }) {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div className="flex items-end gap-1.5 h-16 w-full">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                    <motion.div
                        className="w-full rounded-t-sm relative transition-all"
                        style={{ backgroundColor: d.color || 'rgba(32, 166, 235, 0.2)' }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.value / max) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 1 }}
                    >
                        <div
                            className="absolute top-0 left-0 w-full h-0.5"
                            style={{ backgroundColor: d.color || '#20a6eb' }}
                        />
                        {d.value === max && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#e86420] rounded-full shadow-[0_0_8px_#e86420]" />
                        )}
                    </motion.div>
                </div>
            ))}
        </div>
    );
}

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
    const [trendingOffset, setTrendingOffset] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);

    const heroContents = [
        {
            title: 'Breaking: New Aviation Standards Set for 2026 Flight Operations',
            category: 'Aviation Spotlight',
            image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200',
            content: 'The aviation industry is bracing for standard changes that will redefine safety and efficiency across all continental flight paths...'
        },
        {
            title: 'The Future of Sustainable Flight: Biofuel and Beyond',
            category: 'Innovation Watch',
            image: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?q=80&w=1200',
            content: 'Exploring how next-generation propulsion systems are paving the way for a carbon-neutral sky within the next decade...'
        },
        {
            title: 'Global Logistics Hubs: The Rising Power of Transit Cities',
            category: 'Global Trade',
            image: 'https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1200',
            content: 'Strategic transit hubs are seeing unprecedented growth as maritime and air freight corridors merge in the new logistics era...'
        }
    ];

    // Hero auto-scroll logic
    useEffect(() => {
        const timer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroContents.length);
        }, 10000);
        return () => clearInterval(timer);
    }, [heroContents.length]);

    // Trending auto-scroll logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTrendingOffset(prev => (prev + 1) % 5);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

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
                        {/* Large Featured Card Slider */}
                        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[3rem] overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.15)] glowing-radar-border bg-black">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={heroIndex}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                    className="absolute inset-0 cursor-pointer"
                                    onClick={onGetStarted}
                                >
                                    <img
                                        src={heroContents[heroIndex].image}
                                        alt={heroContents[heroIndex].title}
                                        className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent opacity-90" />
                                    <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:max-w-5xl z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="firebase-gradient text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                {heroContents[heroIndex].category}
                                            </span>
                                            <span className="text-[#1a1a1a]/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-black/5 py-1.5 px-3 rounded-full backdrop-blur-md border border-black/5">
                                                <Clock className="w-3 h-3 text-[#20a6eb]" /> Featured Story
                                            </span>
                                        </div>
                                        <h1 className="text-2xl md:text-5xl font-black text-[#1a1a1a] mb-6 leading-[0.95] tracking-tighter drop-shadow-sm">
                                            {heroContents[heroIndex].title}
                                        </h1>
                                        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 pl-1 border-l-4 border-[#20a6eb]">
                                            <p className="text-[#1a1a1a]/60 text-base md:text-xl line-clamp-2 max-w-4xl font-medium leading-relaxed">
                                                {heroContents[heroIndex].content}
                                            </p>
                                            <button className="shrink-0 bg-[#1a1a1a] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#20a6eb] transition-all hover:scale-105 shadow-2xl border-0 cursor-pointer">
                                                READ FULL STORY <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Slider Navigation Dots */}
                            <div className="absolute bottom-8 right-8 z-20 flex gap-3">
                                {heroContents.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setHeroIndex(i);
                                        }}
                                        className={`w-3 h-3 rounded-full transition-all duration-500 border-0 cursor-pointer ${i === heroIndex ? 'w-10 bg-[#20a6eb] shadow-[0_0_15px_rgba(32,166,235,0.5)]' : 'bg-black/20 hover:bg-black/40'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Secondary Hero Section: Strictly Vertical Scrollable List */}
                        <div className="lg:pr-8">
                            <VerticalScrollContainer autoScroll={true}>
                                {secondaryArticles.length > 0 ? secondaryArticles.map((art, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * (i + 1) }}
                                        className="w-full snap-start flex gap-6 p-5 firebase-card-effect rounded-[2.5rem] cursor-pointer group mb-3 h-[155px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-black/5 bg-white/80 backdrop-blur-md"
                                    >
                                        <div className="w-32 md:w-44 shrink-0 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-black/5">
                                            <img
                                                src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=600&q=80`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-90 group-hover:opacity-100 grayscale-[0.1] group-hover:grayscale-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=640";
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center py-1 flex-1 min-w-0">
                                            <span className="text-[9px] font-black text-[#20a6eb] uppercase tracking-[0.2em] mb-1.5 block opacity-80">Aviation Intelligence</span>
                                            <h3 className="text-sm md:text-base font-extrabold leading-tight group-hover:text-[#20a6eb] transition-colors line-clamp-2 text-[#1a1a1a] mb-1.5 tracking-tight">
                                                {art.title}
                                            </h3>
                                            <p className="text-[11px] text-[#1a1a1a]/60 line-clamp-2 mb-3 font-medium leading-relaxed italic">
                                                {art.content.substring(0, 110)}...
                                            </p>
                                            <div className="mt-auto flex items-center gap-4 text-[8px] font-bold text-black/30 uppercase tracking-[0.15em] border-t border-black/5 pt-2.5">
                                                <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-[#20a6eb]" /> {art.writerName}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#e86420]" /> {new Date(art.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    [1, 2, 3, 4, 5, 6].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="w-full snap-start flex gap-8 p-6 firebase-card-effect rounded-[2.5rem] cursor-pointer group mb-3 h-[155px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-black/5 bg-white/80 backdrop-blur-md"
                                        >
                                            <div className="w-36 md:w-48 shrink-0 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-black/5">
                                                <img
                                                    src={i % 2 === 0 ? "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80" : "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=600&q=80"}
                                                    alt="News"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center py-1 flex-1 min-w-0">
                                                <span className="text-[9px] font-black text-[#e86420] uppercase tracking-[0.2em] mb-1.5 block opacity-80">Corporate Analysis</span>
                                                <h3 className="text-sm md:text-base font-extrabold leading-tight group-hover:text-[#20a6eb] transition-colors line-clamp-1 text-[#1a1a1a] mb-1.5 tracking-tight">
                                                    {i === 0 ? 'Airline Revenue Systems Saw 12% Growth in Q1' :
                                                        i === 1 ? 'Why Fuel Efficiency is the #1 Priority for Emerging Carriers' :
                                                            i === 2 ? 'Global Logistics: The Role of Sustainable SAF' :
                                                                i === 3 ? 'Future Flight: The Rise of eVTOL in Urban Mobility' :
                                                                    i === 4 ? 'Strategic Alliances: Reshaping the Transatlantic Market' :
                                                                        'Next-Gen Propulsion Engine Design'}
                                                </h3>
                                                <p className="text-[11px] text-[#1a1a1a]/60 line-clamp-2 mb-3 font-medium leading-relaxed italic">
                                                    Exploring the latest shifts in global aviation strategy, market performance markers, and technical breakthroughs...
                                                </p>
                                                <div className="mt-auto flex items-center gap-4 text-[8px] font-bold text-black/30 uppercase tracking-[0.15em] border-t border-black/5 pt-2.5">
                                                    <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-[#20a6eb]" /> Analysis Team</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#e86420]" /> May 2026</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </VerticalScrollContainer>
                        </div>
                    </div>

                    {/* Trending Stories Sidebar */}
                    <aside className="lg:col-span-1 space-y-10">
                        <div className="firebase-card-effect p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-black/5 bg-white/80 backdrop-blur-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#20a6eb] opacity-10 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#e86420] opacity-10 blur-3xl pointer-events-none" />

                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-[#1a1a1a]">
                                    <TrendingUp className="w-5 h-5 text-[#20a6eb]" /> Trending
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTrendingOffset(prev => (prev - 1 + 5) % 5)}
                                        className="p-2 bg-black/5 hover:bg-[#20a6eb] hover:text-white rounded-full transition-all border-0 cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setTrendingOffset(prev => (prev + 1) % 5)}
                                        className="p-2 bg-black/5 hover:bg-[#20a6eb] hover:text-white rounded-full transition-all border-0 cursor-pointer"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative overflow-hidden h-[300px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={trendingOffset}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        {(trendingStories.length > 0 ? trendingStories : [1, 2, 3, 4, 5])
                                            .slice(trendingOffset, trendingOffset + 3)
                                            .map((art, idx) => {
                                                const originalIdx = (trendingOffset + idx) % 5;
                                                const title = typeof art === 'object' ? art.title :
                                                    originalIdx === 0 ? 'The Most Luxurious First Class Cabins of 2026' :
                                                        originalIdx === 1 ? 'Top 10 Safe Havens for Long Haul Layovers' :
                                                            originalIdx === 2 ? 'Boeing vs Airbus: The Strategic Rivalry intensifies' :
                                                                originalIdx === 3 ? 'Budget Travel is Changing: New Low-Cost Entrants Explained' :
                                                                    'Aviation Sustainability: Beyond Carbon Offsetting';

                                                const date = typeof art === 'object' ? new Date(art.createdAt).toLocaleDateString() : 'May 22, 2026';

                                                return (
                                                    <div key={originalIdx} className="flex gap-5 group cursor-pointer border-b border-black/5 pb-6 last:border-0 last:pb-0">
                                                        <span className="text-4xl font-black text-black/5 group-hover:text-[#20a6eb]/40 transition-colors leading-none italic">{originalIdx + 1}</span>
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-black leading-snug group-hover:text-[#20a6eb] transition-all line-clamp-2 text-[#1a1a1a]/80 group-hover:text-[#1a1a1a]">
                                                                {title}
                                                            </h4>
                                                            <p className="text-[10px] text-black/30 font-black uppercase tracking-widest">{date} • Aviation</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </motion.div>
                                </AnimatePresence>
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
                    {/* Section: Radar Intelligence */}
                    <div className="bg-gradient-to-br from-white via-[#f0f9ff] to-white rounded-[3.5rem] p-8 md:p-14 text-[#1a1a1a] relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.05)] border border-black/5 glowing-radar-border mb-16">
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#20a6eb]/10 blur-[120px] rounded-full" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#e86420]/5 blur-[100px] rounded-full" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-black/5 pb-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#20a6eb]/5 border border-[#20a6eb]/10 flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-[#20a6eb]" />
                                        </div>
                                        <span className="text-[10px] font-black text-[#20a6eb] uppercase tracking-[0.3em]">Operational Intelligence</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Radar Intelligence</h2>
                                    <p className="text-[#1a1a1a]/50 text-sm font-medium tracking-wide max-w-xl italic">Real-time global aviation analytics, tracking fleet efficiency, carbon metrics, and market volatility.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-white border border-black/5 px-6 py-3 rounded-2xl shadow-sm">
                                        <div className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em] mb-1">Global Flights (24h)</div>
                                        <div className="text-xl font-black text-[#20a6eb]">104,284 <span className="text-[10px] text-emerald-500 font-bold ml-1">↑ 4.2%</span></div>
                                    </div>
                                    <div className="bg-white border border-black/5 px-6 py-3 rounded-2xl shadow-sm">
                                        <div className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em] mb-1">Active Airframes</div>
                                        <div className="text-xl font-black text-[#e86420]">22,109 <span className="text-[10px] text-black/20 font-bold ml-1">LIVE</span></div>
                                    </div>
                                </div>
                            </div>

                            <ScrollContainer showArrows={true} autoScroll={true} interval={9000}>
                                {/* Chart card 1: Emissions */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="w-[85vw] md:w-[380px] shrink-0 snap-center bg-white border border-black/5 p-8 rounded-[2.5rem] relative group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-black/20 uppercase tracking-widest">CO2 Emissions</div>
                                            <div className="text-lg font-black text-[#1a1a1a]">Carbon Intensity</div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-[#20a6eb]/5 border border-[#20a6eb]/10 flex items-center justify-center">
                                            <Wind className="w-6 h-6 text-[#20a6eb]" />
                                        </div>
                                    </div>
                                    <div className="mt-4 mb-6">
                                        <Sparkline data={[45, 52, 49, 60, 58, 65, 70, 62, 68, 75, 72, 80]} color="#20a6eb" />
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-black/5">
                                        <div className="text-[9px] font-black text-black/10 uppercase tracking-widest">Metric: tCO2/RPK</div>
                                        <div className="text-[10px] font-black text-[#e86420] flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[#e86420] rounded-full animate-pulse shadow-[0_0_8px_#e86420]" /> PEAK: 0.082
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Chart card 2: Fleet Distribution */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="w-[85vw] md:w-[380px] shrink-0 snap-center bg-white border border-black/5 p-8 rounded-[2.5rem] relative group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-black/20 uppercase tracking-widest">Global Fleet</div>
                                            <div className="text-lg font-black text-[#1a1a1a]">Platform Usage</div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-[#20a6eb]/5 border border-[#20a6eb]/10 flex items-center justify-center">
                                            <Package className="w-6 h-6 text-[#20a6eb]" />
                                        </div>
                                    </div>
                                    <div className="mt-4 mb-6">
                                        <MiniBarChart data={[
                                            { label: 'A320', value: 85 },
                                            { label: 'B737', value: 78 },
                                            { label: 'A350', value: 45 },
                                            { label: 'B787', value: 52 },
                                            { label: 'C919', value: 12, color: 'rgba(232, 100, 32, 0.1)' },
                                            { label: 'E190', value: 30 }
                                        ]} />
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-black/5">
                                        <div className="text-[9px] font-black text-black/10 uppercase tracking-widest">Top airframe: Airbus A320</div>
                                        <div className="text-[10px] font-black text-[#20a6eb]">Active growth</div>
                                    </div>
                                </motion.div>

                                {/* Chart card 3: Market Share */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="w-[85vw] md:w-[380px] shrink-0 snap-center bg-white border border-black/5 p-8 rounded-[2.5rem] relative group overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-black/20 uppercase tracking-widest">Market Volatility</div>
                                            <div className="text-lg font-black text-[#1a1a1a]">Route Yields</div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-[#20a6eb]/5 border border-[#20a6eb]/10 flex items-center justify-center">
                                            <BarChart3 className="w-6 h-6 text-[#20a6eb]" />
                                        </div>
                                    </div>
                                    <div className="mt-4 mb-6 relative">
                                        <Sparkline data={[80, 75, 82, 88, 84, 90, 85, 78, 80, 82, 85, 88]} color="#20a6eb" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#20a6eb]/5 to-transparent opacity-50" />
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-black/5">
                                        <div className="text-[9px] font-black text-black/10 uppercase tracking-widest">Metric: Yield Index</div>
                                        <div className="text-[10px] font-black text-emerald-500">Stable index</div>
                                    </div>
                                </motion.div>
                            </ScrollContainer>
                        </div>
                    </div>

                    {/* Section: Travel & Trip Reviews */}
                    <ScrollContainer
                        title="Travel & Trip Reviews"
                        subtitle="Exploration Archive"
                        autoScroll={true}
                    >
                        {[1, 2, 3, 4, 5, 6].map((_, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="w-[85vw] md:w-[380px] shrink-0 snap-center group cursor-pointer firebase-card-effect p-4 rounded-[3rem]"
                            >
                                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl border border-black/5">
                                    <img
                                        src={`https://images.unsplash.com/photo-${1500000000500 + i}?auto=format&fit=crop&w=600&q=80`}
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
                                    <h3 className="text-base md:text-lg font-extrabold leading-tight group-hover:text-[#20a6eb] transition-colors line-clamp-2 italic text-[#1a1a1a]/80 mb-2">
                                        {i === 0 ? 'Testing the New Dreamliner Suites: Is it worth the upgrade?' :
                                            i === 1 ? 'Exploring Singapore Changi: The Worlds Best Transit Hub?' :
                                                i === 2 ? 'Economy Class Showdown: Best Value trans-atlantic flights ranked' :
                                                    i === 3 ? 'Inside the New Ultra-Long-Haul First Class Cabins' :
                                                        i === 4 ? 'Luxury in the Sky: Emirates First Class Experience' :
                                                            'The Future of Sustainable Travel: A Journey on Biofuel'}
                                    </h3>
                                    <p className="text-[12px] text-[#1a1a1a]/50 line-clamp-2 leading-relaxed font-medium italic mb-4">
                                        Dive into our comprehensive review of the latest aviation experiences, from long-haul luxury to regional transit gems...
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">
                                        <span className="bg-[#20a6eb]/10 text-[#20a6eb] px-2 py-0.5 rounded-full border border-[#20a6eb]/10">★ {8.5 + (i * 0.1)} Rating</span>
                                        <span>• May {21 + i}, 2026</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </ScrollContainer>

                    {/* Section: Accidents & Incidents */}
                    <div className="bg-[#f8f9fa]/80 backdrop-blur-sm rounded-[3rem] p-6 md:p-10 text-[#1a1a1a] relative overflow-hidden shadow-xl border border-black/5">
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none overflow-hidden">
                            <Plane className="absolute top-5 right-5 w-72 h-72 transform rotate-45 text-[#363636]" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between border-b border-black/5 pb-6">
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <span className="w-1.5 h-6 bg-rose-500 rounded-full" /> Accidents & Incidents
                                </h2>
                                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-all flex items-center gap-2 group">
                                    Archive <ChevronRight className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                            <ScrollContainer showArrows={true} autoScroll={true} interval={6000}>
                                {[
                                    { title: 'Emergency Landing at Heathrow After Engine Anomaly Detected', img: 'https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=600&q=80', loc: 'London' },
                                    { title: 'Safety Audit: Regional Carriers Face Stricter Oversight', img: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80', loc: 'Paris' },
                                    { title: 'Global Safety Protocol Updated for Transatlantic Operations', img: 'https://images.unsplash.com/photo-1464037862646-647f3ca0abc3?auto=format&fit=crop&w=600&q=80', loc: 'New York' },
                                    { title: 'Technical Failure Leads to Diversion in Mid-Altitude Flight', img: 'https://images.unsplash.com/photo-1517030330234-94c4fa9fc8ca?auto=format&fit=crop&w=600&q=80', loc: 'Munich' },
                                    { title: 'New Safety Standards Proposed for Lightweight Aircraft', img: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=600&q=80', loc: 'Tokyo' }
                                ].map((item, i) => (
                                    <div key={i} className="w-[85vw] md:w-[480px] shrink-0 snap-center flex flex-col md:flex-row gap-6 group cursor-pointer bg-white/80 p-5 rounded-[2.5rem] border border-black/5 hover:shadow-2xl transition-all duration-500">
                                        <div className="w-full md:w-40 shrink-0 aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-lg grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700">
                                            <img
                                                src={item.img}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100"
                                                alt="Incident"
                                            />
                                        </div>
                                        <div className="space-y-3 flex-1 min-w-0">
                                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-2.5 py-1 rounded-full border border-rose-500/10">Incident Report</span>
                                            <h3 className="text-base md:text-lg font-extrabold leading-tight group-hover:text-rose-500 transition-colors text-[#1a1a1a]/80 line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-[11px] text-[#1a1a1a]/40 line-clamp-2 leading-relaxed font-medium italic">
                                                Investigation underway following standard protocol to ensure passenger safety and operational integrity...
                                            </p>
                                            <div className="pt-3 flex items-center gap-5 text-[8px] font-black text-[#1a1a1a]/20 uppercase tracking-widest border-t border-black/5">
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#20a6eb]" /> {i + 2}h Ago</span>
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {item.loc}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </ScrollContainer>
                        </div>
                    </div>

                    {/* Section: Latest Videos */}
                    <ScrollContainer
                        title="Latest Videos"
                        subtitle="Radar Studio"
                    >
                        {[
                            { title: "ELVIS' JETSTAR UP FOR AUCTION", thumb: "https://travelradar.aero/wp-content/uploads/2024/09/Elvis-Jetstar.png", id: "wXR07418Zf4" },
                            { title: "FAA ORDERS GROUND STOP", thumb: "https://travelradar.aero/wp-content/uploads/2024/09/FAA-Ground-Stop.jpg", id: "hX1vD--4xao" },
                            { title: "SOUTHWEST CANCELS 16,000 FLIGHTS", thumb: "https://travelradar.aero/wp-content/uploads/2024/09/Southwest-16000-Cancellations.png", id: "hg9eKlhODhI" },
                            { title: "BOEING 777X INTERIOR REVEALED", thumb: "https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=600&q=80", id: "777x-interior" },
                            { title: "AIRBUS A380 RETIREMENT PLANS", thumb: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=600&q=80", id: "a380-retirement" }
                        ].map((video, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="w-[85vw] md:w-[450px] shrink-0 snap-center group cursor-pointer relative rounded-[3rem] overflow-hidden shadow-2xl aspect-video firebase-card-effect border border-black/5"
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
                    </ScrollContainer>

                    {/* Section: Aircraft for Sale */}
                    <div className="bg-[#f8f9fa]/80 backdrop-blur-sm rounded-[3rem] p-6 md:p-10 text-[#1a1a1a] relative overflow-hidden shadow-xl border border-black/5 mb-16">
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none overflow-hidden">
                            <Plane className="absolute top-5 right-5 w-72 h-72 transform rotate-45 text-[#363636]" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 pb-8">
                                <div className="space-y-3">
                                    <span className="text-[#20a6eb] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Plane className="w-4 h-4" /> Global Marketplace
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
                                        Aircraft <span className="text-[#20a6eb]">For Sale</span>
                                    </h2>
                                </div>
                                <button className="bg-[#1a1a1a] text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#20a6eb] transition-all shadow-lg group flex items-center gap-3 border-0 cursor-pointer">
                                    View Inventory <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>

                            <ScrollContainer showArrows={true} autoScroll={true} interval={7000}>
                                {[
                                    { model: "Gulfstream G700", price: "$75.0M", year: "2024", img: "https://images.unsplash.com/photo-1540962351504-03099e0a75c3?auto=format&fit=crop&w=600&q=80" },
                                    { model: "Bombardier Global 7500", price: "$72.5M", year: "2023", img: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=600&q=80" },
                                    { model: "Cessna Citation Longitude", price: "$29.9M", year: "2025", img: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=600&q=80" },
                                    { model: "Boeing BBJ 737-8", price: "$105.0M", year: "2025", img: "https://images.unsplash.com/photo-1544015759-000000000000?auto=format&fit=crop&w=600&q=80", fallback: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=640" }
                                ].map((ac, i) => (
                                    <div key={i} className="w-[85vw] md:w-[320px] shrink-0 snap-center group cursor-pointer bg-white p-4 rounded-[2.5rem] border border-black/5 hover:shadow-2xl transition-all duration-500 shadow-sm relative overflow-hidden">
                                        <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 relative shadow-md">
                                            <img
                                                src={ac.img}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
                                                alt={ac.model}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = ac.fallback || "https://images.unsplash.com/photo-1540962351504-03099e0a75c3?q=80&w=640";
                                                }}
                                            />
                                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 text-white">
                                                Featured
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-2 pb-2">
                                            <div className="space-y-1">
                                                <h4 className="text-base font-black uppercase tracking-tight text-[#1a1a1a] group-hover:text-[#20a6eb] transition-colors">{ac.model}</h4>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[#20a6eb] text-[9px] font-black uppercase tracking-widest">Year {ac.year}</span>
                                                    <span className="text-[#1a1a1a] font-black text-xs">{ac.price}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-black/30 pt-3 border-t border-black/5">
                                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#20a6eb]" /> 0 HRS</span>
                                                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-rose-500" /> Paris, FR</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </ScrollContainer>
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
