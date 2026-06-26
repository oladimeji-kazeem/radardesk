import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Facebook,
    Twitter,
    Youtube,
    Instagram,
    Search,
    Menu,
    X,
    Clock,
    ChevronRight,
    Bell,
    Plane,
    TrendingUp,
    Activity,
    LogOut,
    User,
    ArrowRight
} from 'lucide-react';
import { Logo } from './Logo';
import { Article } from '../types';

interface TopUtilityBarProps {
    onSignIn: () => void;
    onGetStarted: () => void;
    onSearch?: () => void;
}

export function TopUtilityBar({ onSignIn, onGetStarted, onSearch }: TopUtilityBarProps) {
    return (
        <div className="hidden lg:block bg-[#363636] text-white py-2 px-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black tracking-[0.2em]">
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5"><Facebook className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5"><Twitter className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5"><Youtube className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5"><Instagram className="w-4 h-4" /></a>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={onSearch}
                        className="flex items-center gap-1.5 bg-white/10 border border-white/0 px-3 py-1 rounded-full cursor-pointer hover:bg-white/20 transition-all text-white/80 hover:text-white text-[10px] font-black tracking-[0.2em]"
                    >
                        <Search className="w-3 h-3" /> Search
                    </button>
                    <div className="flex gap-4">
                        <button onClick={onSignIn} className="hover:text-[#20a6eb] transition-colors bg-transparent border-0 cursor-pointer text-[11px] font-bold text-white/80">Sign In</button>
                        <button onClick={onGetStarted} className="firebase-gradient px-4 py-1.5 rounded-full text-white hover:scale-105 transition-all bg-transparent border-0 cursor-pointer text-[11px] font-bold firebase-glow-blue">Join Radar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MainHeaderProps {
    scrolled: boolean;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    categories: string[];
    activeCategory: string;
    onNavigate: (cat: string) => void;
}

export function MainHeader({
    scrolled,
    isMenuOpen,
    setIsMenuOpen,
    categories,
    activeCategory,
    onNavigate
}: MainHeaderProps) {

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-500 border-b ${scrolled ? 'bg-white/90 backdrop-blur-xl py-3 border-gray-100 shadow-xl' : 'bg-transparent py-8 border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => {
                        const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
                        window.history.pushState({}, '', `${BASE_URL}/`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                >
                    <Logo className="w-10 h-10 group-hover:rotate-[360deg] transition-all duration-700 p-1 rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)]" />
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-[#1a1a1a] leading-none">Travel Radar</span>
                        <span className="text-[9px] font-bold tracking-[0.2em] text-[#20a6eb]">Aviation News & Insight</span>
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-10">
                    {categories.map((cat) => (
                        <div key={cat} className="relative group">
                            {cat === 'Breaking News' ? (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(cat);
                                    }}
                                    className={`text-[12px] font-bold tracking-widest transition-all relative border-0 bg-transparent cursor-pointer flex items-center gap-1 ${activeCategory === cat ? 'text-[#20a6eb]' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
                                        }`}
                                >
                                    {cat}
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                                    <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-[#20a6eb] transition-transform duration-300 ${activeCategory === cat ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        }`} />
                                </a>
                            ) : (
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(cat);
                                    }}
                                    className={`text-[12px] font-bold tracking-widest hover:text-[#20a6eb] transition-all relative border-0 bg-transparent cursor-pointer ${activeCategory === cat ? 'text-[#20a6eb]' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'
                                        }`}
                                >
                                    {cat}
                                    <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-[#20a6eb] transition-transform duration-300 ${activeCategory === cat ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        }`} />
                                </a>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-[#1a1a1a] hover:bg-black/5 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div >
        </header >
    );
}

export function MobileMenuDrawer({
    isOpen,
    onClose,
    categories,
    activeCategory,
    onNavigate,
    onSignIn,
    onGetStarted
}: {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    activeCategory: string;
    onNavigate: (cat: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        <div className="p-8 flex justify-between items-center border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Logo className="w-8 h-8 rounded-lg bg-white shadow-md p-1" />
                                <span className="text-xl font-black tracking-tighter">RADAR</span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors border-0 bg-transparent cursor-pointer">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-8 space-y-2">
                            {categories.map((cat) => (
                                <motion.button
                                    key={cat}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { onNavigate(cat); onClose(); }}
                                    className={`w-full text-left p-4 rounded-2xl flex items-center justify-between group transition-all border-0 bg-transparent cursor-pointer ${activeCategory === cat ? 'bg-[#20a6eb]/10 text-[#20a6eb]' : 'hover:bg-gray-50 text-[#1a1a1a]/70 hover:text-[#1a1a1a]'
                                        }`}
                                >
                                    <span className="text-lg font-black tracking-tight">{cat}</span>
                                    <ChevronRight className={`w-5 h-5 transition-transform ${activeCategory === cat ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                </motion.button>
                            ))}

                            <div className="pt-8 mt-8 border-t border-gray-100 space-y-4">
                                <div className="text-[10px] font-black text-gray-400 tracking-wider px-4">Terminal Access</div>
                                <button
                                    onClick={() => { onSignIn(); onClose(); }}
                                    className="w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-gray-50 transition-all border-0 bg-transparent cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-black">Sign In</span>
                                        <span className="text-[10px] text-gray-400">Access your dashboard</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => { onGetStarted(); onClose(); }}
                                    className="w-full p-4 rounded-2xl flex items-center gap-4 firebase-gradient text-white shadow-xl hover:scale-[1.02] transition-all border-0 cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-black">Join Radar Desk</span>
                                        <span className="text-[10px] text-white/60 font-bold">Standard Operations</span>
                                    </div>
                                </button>
                            </div>
                        </nav>

                        <div className="p-8 bg-gray-50 border-t border-gray-100">
                            <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] mb-4">SYSTEM STATUS: <span className="text-emerald-500">NOMINAL</span></p>
                            <div className="flex items-center gap-4 text-gray-400">
                                <Facebook className="w-4 h-4 cursor-pointer hover:text-[#20a6eb]" />
                                <Twitter className="w-4 h-4 cursor-pointer hover:text-[#20a6eb]" />
                                <Youtube className="w-4 h-4 cursor-pointer hover:text-[#20a6eb]" />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface NewsTickerProps {
    recentNews: Article[];
    onNavigate: (cat: string) => void;
}

export function NewsTicker({ recentNews, onNavigate }: NewsTickerProps) {
    const displayNews = recentNews.slice(0, 15).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="bg-white border-y border-black/5 py-2.5 overflow-hidden relative z-30">
            <div className="max-w-7xl mx-auto px-6 flex items-center">
                <div className="flex items-center gap-2 bg-[#1a1a1a] text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-widest shrink-0 mr-8 shadow-lg border border-white/10">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                    Live Terminal
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex animate-marquee whitespace-nowrap gap-16 text-[11px] font-bold text-[#1a1a1a]/60 tracking-tight items-center">
                        {displayNews.length > 0 ? displayNews.map((art, i) => (
                            <span
                                key={i}
                                onClick={() => onNavigate('Breaking News')}
                                className="group cursor-pointer transition-all hover:text-[#20a6eb] flex items-center gap-4"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-[#20a6eb] tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">[{art.category || 'Radar'}]</span>
                                    <span className="text-[9px] font-mono text-black/20">{new Date(art.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </span>
                                <span className="italic">{art.title}</span>
                            </span>
                        )) : (
                            <span className="opacity-20 italic">Initializing data stream...</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SharedLayoutProps {
    children: React.ReactNode;
    activeCategory: string;
    articles: Article[];
    onNavigate: (cat: string) => void;
    onSignIn?: () => void;
    onGetStarted?: () => void;
    onSearch?: () => void;
    showTicker?: boolean;
}

export function SharedLayout({
    children,
    activeCategory,
    articles,
    onNavigate,
    onSignIn = () => { },
    onGetStarted = () => { },
    onSearch = () => { },
    showTicker = true
}: SharedLayoutProps) {
    const [scrolled, setScrolled] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const categories = ['Breaking News', 'Radar', 'Aviation', 'Travel', 'Air Intelligence', 'Aircraft Sales'];

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans selection:bg-[#20a6eb]/20 overflow-x-hidden">
            <TopUtilityBar onSignIn={onSignIn} onGetStarted={onGetStarted} onSearch={onSearch} />
            <MainHeader
                scrolled={scrolled}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                categories={categories}
                activeCategory={activeCategory}
                onNavigate={onNavigate}
            />
            <MobileMenuDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                categories={categories}
                activeCategory={activeCategory}
                onNavigate={onNavigate}
                onSignIn={onSignIn}
                onGetStarted={onGetStarted}
            />
            {showTicker && <NewsTicker recentNews={articles} onNavigate={onNavigate} />}
            {children}
        </div>
    );
}
