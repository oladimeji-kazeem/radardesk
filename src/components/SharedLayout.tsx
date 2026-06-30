import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Facebook,
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
    ArrowRight,
    Linkedin
} from 'lucide-react';
import { Logo } from './Logo';
import { Article, User as UserType } from '../types';

// Custom brand icons not provided by Lucide
export function XIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

export function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12.525.074a.074.074 0 0 0-.074.074V16.7c0 2.378-1.928 4.311-4.307 4.311A4.282 4.282 0 0 1 5.1 19.75a4.282 4.282 0 0 1-1.265-3.047c0-2.379 1.933-4.312 4.312-4.312a.074.074 0 0 0 .074-.074V9.654a.074.074 0 0 0-.074-.074A7.26 7.26 0 0 0 1 16.797a7.28 7.28 0 0 0 7.283 7.277c4.016 0 7.278-3.262 7.278-7.278V6.8a10.22 10.22 0 0 0 7.369 3.097.074.074 0 0 0 .074-.074V7.126a.074.074 0 0 0-.074-.074 7.23 7.23 0 0 1-4.708-2.355 7.18 7.18 0 0 1-2.327-4.549.074.074 0 0 0-.074-.074h-2.923" />
        </svg>
    );
}

interface TopUtilityBarProps {
    onSignIn: () => void;
    onGetStarted: () => void;
    onSearch?: () => void;
    currentUser?: UserType | null;
    onSignOut?: () => void;
}

export function TopUtilityBar({ onSignIn, onGetStarted, onSearch, currentUser, onSignOut }: TopUtilityBarProps) {
    return (
        <div className="hidden lg:block bg-[#363636] text-white py-2 px-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black tracking-[0.2em]">
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5" title="Facebook"><Facebook className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5" title="X (Twitter)"><XIcon className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5" title="LinkedIn"><Linkedin className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5" title="Instagram"><Instagram className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5" title="TikTok"><TikTokIcon className="w-4 h-4" /></a>
                    <a href="#" className="hover:text-[#20a6eb] transition-colors flex items-center gap-1.5" title="YouTube"><Youtube className="w-4 h-4" /></a>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search articles, topics..."
                            onClick={onSearch}
                            onFocus={onSearch}
                            readOnly
                            className="bg-white/10 border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-[10px] text-white/80 placeholder-white/40 font-semibold tracking-wide cursor-pointer hover:bg-white/20 transition-all outline-none w-52 md:w-72"
                        />
                    </div>
                    {currentUser ? (
                        <div className="flex items-center gap-4 text-[11px] font-bold">
                            <span className="text-white/60">OPERATOR: <strong className="text-[#20a6eb] font-bold">{currentUser.name}</strong></span>
                            <span className="text-white/25">|</span>
                            {['Admin', 'Writer', 'Editor', 'Senior Editor', 'Quality Checker', 'Publisher'].includes(currentUser.role) && (
                                <button
                                    onClick={() => {
                                        const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
                                        window.history.pushState({ view: 'app' }, '', `${BASE_URL}/`);
                                        window.dispatchEvent(new PopStateEvent('popstate'));
                                    }}
                                    className="hover:text-[#20a6eb] text-white/80 transition-colors bg-transparent border-0 cursor-pointer font-bold uppercase tracking-[0.1em]"
                                >
                                    Workspace
                                </button>
                            )}
                            <button onClick={onSignOut} className="text-red-400 hover:text-red-300 transition-colors bg-transparent border-0 cursor-pointer font-bold uppercase tracking-[0.1em]">Sign Out</button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={onSignIn} className="hover:text-[#20a6eb] transition-colors bg-transparent border-0 cursor-pointer text-[11px] font-bold text-white/80">Sign In</button>
                            <button onClick={onGetStarted} className="firebase-gradient px-4 py-1.5 rounded-full text-white hover:scale-105 transition-all bg-transparent border-0 cursor-pointer text-[11px] font-bold firebase-glow-blue">Join Travel Radar</button>
                        </div>
                    )}
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
                                    <span className="w-1.5 h-1.5 bg-[#20a6eb] rounded-full animate-pulse shadow-[0_0_8px_#20a6eb]" />
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
    onGetStarted,
    currentUser,
    onSignOut
}: {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    activeCategory: string;
    onNavigate: (cat: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
    currentUser?: UserType | null;
    onSignOut?: () => void;
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
                                {currentUser ? (
                                    <div className="space-y-2 px-4 shadow-inner-lg">
                                        <div className="w-full p-4 rounded-2xl flex items-center gap-4 bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 rounded-xl bg-[#20a6eb]/10 text-[#20a6eb] flex items-center justify-center font-bold">
                                                {currentUser.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-sm font-black text-slate-800">{currentUser.name}</span>
                                                <span className="text-[10px] text-[#20a6eb] font-mono tracking-wider uppercase font-extrabold">{currentUser.role}</span>
                                            </div>
                                        </div>
                                        {['Admin', 'Writer', 'Editor', 'Senior Editor', 'Quality Checker', 'Publisher'].includes(currentUser.role) && (
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
                                                    window.history.pushState({ view: 'app' }, '', `${BASE_URL}/`);
                                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                                }}
                                                className="w-full p-3 rounded-xl bg-[#20a6eb] text-white font-bold text-xs uppercase cursor-pointer hover:bg-sky-650 transition-all border-0 shadow-sm"
                                            >
                                                Workspace Desk
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { onSignOut?.(); onClose(); }}
                                            className="w-full p-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs uppercase cursor-pointer hover:bg-rose-100 transition-all border-0"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <>
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
                                                <span className="text-sm font-black">Join Travel Radar</span>
                                                <span className="text-[10px] text-white/60 font-bold">Standard Operations</span>
                                            </div>
                                        </button>
                                    </>
                                )}
                            </div>
                        </nav>

                        <div className="p-8 bg-gray-50 border-t border-gray-100">
                            <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] mb-4">SYSTEM STATUS: <span className="text-emerald-500">NOMINAL</span></p>
                            <div className="flex items-center gap-4 text-gray-400">
                                <Facebook className="w-4 h-4 cursor-pointer hover:text-[#20a6eb]" />
                                <XIcon className="w-4 h-4 cursor-pointer hover:text-[#20a6eb]" />
                                <Linkedin className="w-4 h-4 cursor-pointer hover:text-[#20a6eb]" />
                                <Instagram className="w-4 h-4 cursor-pointer hover:text-[#20a6eb]" />
                                <TikTokIcon className="w-4 h-4 cursor-pointer hover:text-[#20a6eb]" />
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
                    <span className="w-1.5 h-1.5 bg-[#20a6eb] rounded-full animate-pulse shadow-[0_0_8px_#20a6eb]" />
                    Live News
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
                                    <span className="text-[9px] font-black text-[#20a6eb] tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">[{art.categories?.[0] || (art as any).category || 'Radar'}]</span>
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
    currentUser?: UserType | null;
    onSignOut?: () => void;
}

export function SharedLayout({
    children,
    activeCategory,
    articles,
    onNavigate,
    onSignIn = () => { },
    onGetStarted = () => { },
    onSearch = () => { },
    showTicker = true,
    currentUser,
    onSignOut
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
            <TopUtilityBar onSignIn={onSignIn} onGetStarted={onGetStarted} onSearch={onSearch} currentUser={currentUser} onSignOut={onSignOut} />
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
                currentUser={currentUser}
                onSignOut={onSignOut}
            />
            {showTicker && <NewsTicker recentNews={articles} onNavigate={onNavigate} />}
            {children}
        </div>
    );
}
