import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Activity,
    Bell,
    TrendingUp,
    Wind,
    ChevronRight,
    Clock,
    Zap,
    Radio,
    ShieldCheck,
    Plane,
    Target,
    Satellite,
    Globe,
    Cpu,
    ArrowUpRight,
    ArrowDownRight,
    Box,
    Layers,
    Binary
} from 'lucide-react';
import { Article } from '../types';
import { TopUtilityBar, MainHeader, NewsTicker } from './SharedLayout';

export type RadarSector =
    | 'Commercial Aviation'
    | 'Defense & Space'
    | 'Horizon'
    | 'Breaking Pulse'
    | 'Active Incidents'
    | 'Market Flashpoints'
    | 'Live Vectors'
    | 'The Wire';

interface RadarPortalProps {
    articles: Article[];
    onNavigate: (cat: string) => void;
    initialSector: RadarSector;
    onBack: () => void;
}

const CATEGORIES = ['Breaking News', 'Radar', 'Aviation', 'Travel', 'Newsletters', 'Aircraft Sales'];

export default function RadarPortal({ articles, onNavigate, initialSector, onBack }: RadarPortalProps) {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSector, setActiveSector] = useState<RadarSector>(initialSector);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setActiveSector(initialSector);
    }, [initialSector]);

    const sectorConfig = {
        'Commercial Aviation': {
            icon: Plane,
            color: 'bg-[#20a6eb]',
            accent: 'text-[#20a6eb]',
            subtitle: 'Airline Operations & Global Fleet Intel',
            telemetry: [
                { title: 'Global Capacity Index', value: '104.2', trend: 'up', label: 'YoY Growth', icon: Activity },
                { title: 'Fleet Orders (MTD)', value: '184', trend: 'up', label: 'Net Delta', icon: Box },
                { title: 'Route Expansion Score', value: '0.82', trend: 'stable', label: 'Market Sentiment', icon: Layers }
            ]
        },
        'Defense & Space': {
            icon: ShieldCheck,
            color: 'bg-slate-800',
            accent: 'text-slate-800',
            subtitle: 'Strategic Aerospace & Tactical Systems',
            telemetry: [
                { title: 'Orbital Launch Cadence', value: '12.4', trend: 'up', label: 'Global Weekly', icon: Satellite },
                { title: 'Defense Contract Delta', value: '+$4.2B', trend: 'up', label: 'Sector Spread', icon: Target },
                { title: 'LEO Grid Density', value: '0.94', trend: 'up', label: 'Traffic Alert', icon: Binary }
            ]
        },
        'Horizon': {
            icon: Wind,
            color: 'bg-emerald-600',
            accent: 'text-emerald-600',
            subtitle: 'Sustainable Aviation & Future Tech',
            telemetry: [
                { title: 'SAF Blend Progress', value: '4.8%', trend: 'up', label: 'Global Avg', icon: Zap },
                { title: 'eVTOL Cert Milestone', value: 'Stage 4', trend: 'up', label: 'FAA Audit', icon: Target },
                { title: 'Carbon Offset Index', value: '0.76', trend: 'up', label: 'Protocol A', icon: Globe }
            ]
        },
        'Breaking Pulse': {
            icon: Bell,
            color: 'bg-red-500',
            accent: 'text-red-500',
            subtitle: 'Live Operational Intelligence Loop',
            telemetry: [
                { title: 'Feed Uplink Status', value: 'STABLE', trend: 'stable', label: 'Latency 24ms', icon: Radio },
                { title: 'Active Incidents', value: '14', trend: 'up', label: 'Global Count', icon: Activity },
                { title: 'Wire Frequency', value: '8.4', trend: 'up', label: 'Items / Min', icon: Zap }
            ]
        },
        'Active Incidents': {
            icon: Bell,
            color: 'bg-red-600',
            accent: 'text-red-600',
            subtitle: 'Critical Alerts & Emergency Ops',
            telemetry: [
                { title: 'Squawk 7700 Count', value: '3', trend: 'up', label: 'Active Now', icon: Activity },
                { title: 'Airspace Closures', value: '8', trend: 'up', label: 'Global Regions', icon: Target },
                { title: 'Alert Response', value: '99%', trend: 'stable', label: 'System Ready', icon: ShieldCheck }
            ]
        },
        'Market Flashpoints': {
            icon: TrendingUp,
            color: 'bg-amber-500',
            accent: 'text-amber-500',
            subtitle: 'Financial Volatility & Strategic Shifts',
            telemetry: [
                { title: 'Market Volatility', value: '4.2', trend: 'up', label: 'Aviation Index', icon: Activity },
                { title: 'M&A Activity', value: '$12.4B', trend: 'up', label: 'Pending Deals', icon: Box },
                { title: 'Sentiment Score', value: '0.64', trend: 'down', label: 'Bearish Bias', icon: Layers }
            ]
        },
        'Live Vectors': {
            icon: Activity,
            color: 'bg-[#20a6eb]',
            accent: 'text-[#20a6eb]',
            subtitle: 'Real-time Supply Chain & Fuel Telemetry',
            telemetry: [
                { title: 'Jet A1 Spot Price', value: '$92.4', trend: 'down', label: 'bbl / USG', icon: Zap },
                { title: 'Supply Chain Latency', value: '14 days', trend: 'up', label: 'Global Median', icon: Box },
                { title: 'Refinery Output', value: '92%', trend: 'stable', label: 'Capacity Util', icon: Globe }
            ]
        },
        'The Wire': {
            icon: Wind,
            color: 'bg-emerald-500',
            accent: 'text-emerald-500',
            subtitle: 'Raw Intelligence & Unedited Dispatches',
            telemetry: [
                { title: 'Wire Throughput', value: '240', trend: 'up', label: 'Messages / Hour', icon: Radio },
                { title: 'Source Reliability', value: '0.88', trend: 'up', label: 'Verification Index', icon: Target },
                { title: 'Global Coverage', value: '100%', trend: 'stable', label: 'Full Spectrum', icon: Globe }
            ]
        }
    };

    const subSectors = [
        { id: 'Breaking Pulse', label: 'Pulse', icon: Bell },
        { id: 'Commercial Aviation', label: 'Commercial', icon: Plane },
        { id: 'Defense & Space', label: 'Defense', icon: ShieldCheck },
        { id: 'Horizon', label: 'Horizon', icon: Wind },
        { id: 'Active Incidents', label: 'Incidents', icon: Bell },
        { id: 'Market Flashpoints', label: 'Flashpoints', icon: TrendingUp },
        { id: 'Live Vectors', label: 'Vectors', icon: Activity },
        { id: 'The Wire', label: 'The Wire', icon: Radio },
    ];

    const config = sectorConfig[activeSector];
    const Icon = config.icon;

    // Filter articles for the active sector
    const sectorArticles = articles.filter(a => a.status === 'Published' && (
        a.category === activeSector ||
        (activeSector === 'Breaking Pulse' && ['Active Incidents', 'Market Flashpoints', 'Live Vectors', 'The Wire'].includes(a.category || ''))
    )).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Group into categories (using category field or just split)
    const streams = [
        {
            category: 'Intelligence Feed',
            items: sectorArticles.slice(0, 4).map(a => ({
                time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: a.title,
                image: a.headerImage,
                excerpt: a.excerpt,
                meta: a.category
            }))
        },
        {
            category: 'Strategic Analysis',
            items: sectorArticles.slice(4, 8).map(a => ({
                time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: a.title,
                image: a.headerImage,
                excerpt: a.excerpt,
                meta: a.category
            }))
        }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafb] text-[#1a1a1a] font-sans">

            {/* Radar Sector Sub-Nav */}
            <div className="bg-white border-b border-black/5 sticky top-[73px] z-40 backdrop-blur-md">
                <div className="max-w-[1500px] mx-auto px-6 overflow-x-auto scrollbar-hide py-3">
                    <div className="flex items-center gap-2">
                        {subSectors.map(sector => (
                            <button
                                key={sector.id}
                                onClick={() => {
                                    const path = sector.id.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                                    window.history.pushState({}, '', `/radar/${path}`);
                                    setActiveSector(sector.id as RadarSector);
                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                }}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black tracking-widest transition-all border-0 cursor-pointer whitespace-nowrap ${activeSector === sector.id
                                    ? 'bg-[#20a6eb] text-white shadow-lg shadow-[#20a6eb]/20'
                                    : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a] hover:bg-black/5'
                                    }`}
                            >
                                <sector.icon className="w-3.5 h-3.5" />
                                {sector.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-[1500px] mx-auto px-6 py-12">
                {/* Sector Header */}
                <div className="mb-12 space-y-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-[10px] font-black tracking-widest text-[#1a1a1a]/40 hover:text-[#20a6eb] transition-all group border-0 bg-transparent cursor-pointer"
                    >
                        <ChevronRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" /> BACK TO INTELLIGENCE DESK
                    </button>
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                        <motion.div
                            key={activeSector}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 ${config.color} rounded-2xl flex items-center justify-center text-white shadow-2xl skew-x-[-10deg]`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black tracking-tighter leading-none italic">{activeSector}</h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className={`text-[10px] font-black tracking-[0.3em] ${config.accent} opacity-80 uppercase`}>{config.subtitle}</p>
                                        <span className="w-1 h-1 bg-black/10 rounded-full" />
                                        <span className="text-[9px] font-black text-emerald-600 tracking-widest flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE STREAM ACTIVE
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Intelligence Feed Grid */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {streams.map((stream, sIdx) => (
                            <div key={stream.category} className="space-y-6">
                                <div className="flex items-center justify-between border-b-2 border-black/5 pb-4">
                                    <h3 className="text-[11px] font-black tracking-[0.2em] uppercase">{stream.category}</h3>
                                    <span className={`text-[9px] font-black tracking-widest ${config.accent}`}>TRACK: Σ-{sIdx + 1}</span>
                                </div>
                                <div className="space-y-4">
                                    {stream.items.map((item, iIdx) => (
                                        <motion.div
                                            key={item.title}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (iIdx * 0.1) }}
                                            className="group bg-white p-4 rounded-[1.5rem] border border-black/5 hover:border-[#20a6eb]/20 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex flex-col items-center gap-2 mt-1">
                                                    <div className="text-[10px] font-black text-black/20 font-mono">{item.time}</div>
                                                    <div className="w-0.5 h-full bg-black/5 rounded-full min-h-[40px]" />
                                                </div>

                                                {item.image && (
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-black/5 shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}

                                                <div className="flex-1 space-y-1.5">
                                                    <h4 className="text-[12px] font-bold text-[#1a1a1a] group-hover:text-[#20a6eb] transition-colors leading-tight line-clamp-2 italic">{item.title}</h4>
                                                    {item.excerpt && (
                                                        <p className="text-[10px] font-medium text-[#1a1a1a]/50 leading-relaxed line-clamp-2 italic">
                                                            {item.excerpt}
                                                        </p>
                                                    )}
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-black/10 group-hover:text-[#20a6eb] group-hover:translate-x-1 transition-all mt-1" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Analytics Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-xl space-y-8 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${config.accent} opacity-5 blur-[60px]`} />

                            <div className="flex items-center justify-between border-b border-black/5 pb-4 relative z-10">
                                <h3 className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2 text-black/40">
                                    <Activity className="w-4 h-4" /> SECTOR ANALYTICS
                                </h3>
                                <span className={`text-[8px] font-black ${config.accent} tracking-widest bg-black/5 px-2 py-0.5 rounded uppercase`}>Real-Time</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6 relative z-10">
                                {config.telemetry.map((t, idx) => (
                                    <motion.div
                                        key={t.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-center justify-between text-black/20">
                                            <div className="flex items-center gap-2">
                                                <t.icon className="w-3.5 h-3.5" />
                                                <span className="text-[8px] font-black tracking-widest uppercase">{t.title}</span>
                                            </div>
                                            {t.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <div className="text-3xl font-black text-[#1a1a1a] italic leading-none">{t.value}</div>
                                            <div className="text-[8px] font-bold text-black/20 uppercase tracking-tight italic">{t.label}</div>
                                        </div>
                                        <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${config.color} w-[65%] opacity-30`} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button className={`w-full py-4 ${config.color} text-white rounded-2xl text-[9px] font-black tracking-[0.2em] hover:scale-[1.02] transition-all border-0 cursor-pointer shadow-lg uppercase relative z-10`}>
                                REQUEST SECTOR DEEP-DIVE
                            </button>
                        </div>

                        {/* Recent Alerts Module */}
                        <div className="bg-black/5 p-8 rounded-[2.5rem] border border-black/5 space-y-6">
                            <h3 className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2 text-black/30 text-center justify-center">
                                <Bell className="w-4 h-4" /> RECENT DISPATCHES
                            </h3>
                            <div className="space-y-4">
                                {sectorArticles.slice(0, 3).map((art, idx) => (
                                    <div key={idx} className="flex gap-4 group cursor-pointer border-b border-black/5 pb-4 last:border-0 last:pb-0">
                                        <div className="text-[8px] font-black text-black/20 font-mono mt-0.5">{new Date(art.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="space-y-1">
                                            <h5 className="text-[11px] font-bold text-black/60 group-hover:text-[#20a6eb] transition-colors leading-tight italic line-clamp-2">{art.title}</h5>
                                            <div className="text-[8px] font-black tracking-widest text-black/20 uppercase">SEC: {art.category}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Tactical Footer */}
            <div className={`fixed bottom-0 left-0 w-full ${config.color} text-white/80 px-6 py-2.5 text-[9px] font-black tracking-[0.2em] flex items-center justify-between z-50 backdrop-blur-md bg-opacity-90`}>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2"><Radio className="w-3 h-3 animate-pulse" /> SATELLITE UPLINK: SES-14 ACTIVE</span>
                    <span className="hidden md:inline">SYSTEM: RADAR-CORE v4.2.0</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> T-SYNC: {new Date().toISOString().split('T')[1].split('.')[0]}</span>
                    <span>ZONE: GMT+1</span>
                </div>
            </div>
        </div>
    );
}
