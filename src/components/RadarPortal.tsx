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

export type RadarSector =
    | 'Route'
    | 'Fleet'
    | 'Passenger'
    | 'Cargo'
    | 'Sustainability'
    | 'Finance'
    | 'Regulations'
    | 'Tourism & Demand';

interface RadarPortalProps {
    articles: Article[];
    onNavigate: (cat: string) => void;
    initialSector: RadarSector;
    onBack: () => void;
    sectorStats?: any[];
}


export default function RadarPortal({ articles, onNavigate, initialSector = 'Route', onBack, sectorStats = [] }: RadarPortalProps) {
    const [activeSector, setActiveSector] = useState<RadarSector>(initialSector);


    useEffect(() => {
        setActiveSector(initialSector);
    }, [initialSector]);

    const sectorConfig = {
        'Route': {
            icon: Globe,
            color: 'bg-[#20a6eb]',
            accent: 'text-[#20a6eb]',
            subtitle: 'Global Pathing & Capacity Surveillance',
            telemetry: [
                { title: 'Global Connectivity', value: '94.2', trend: 'up', label: 'Nodes Active', icon: Globe },
                { title: 'Path Efficiency', value: '0.88', trend: 'up', label: 'Fuel Delta', icon: Activity },
                { title: 'Direct Route %', value: '62%', trend: 'stable', label: 'Airspace Flow', icon: Radio }
            ]
        },
        'Fleet': {
            icon: Plane,
            color: 'bg-slate-800',
            accent: 'text-slate-800',
            subtitle: 'Asset Lifecycle & Deployment Intel',
            telemetry: [
                { title: 'Active Airframes', value: '28.4K', trend: 'up', label: 'Global Count', icon: Plane },
                { title: 'Retirement Rate', value: '4.2', trend: 'up', label: 'Monthly Delta', icon: Target },
                { title: 'Average Age', value: '12.4Y', trend: 'stable', label: 'Sector Mean', icon: Clock }
            ]
        },
        'Passenger': {
            icon: Target,
            color: 'bg-emerald-600',
            accent: 'text-emerald-600',
            subtitle: 'Mobility Trends & Demand Pulse',
            telemetry: [
                { title: 'Yield Index', value: '112.4', trend: 'up', label: 'Market Base', icon: TrendingUp },
                { title: 'Load Factors', value: '84%', trend: 'up', label: 'Global Avg', icon: Activity },
                { title: 'Ancillary Growth', value: '+14%', trend: 'up', label: 'Rev Delta', icon: Zap }
            ]
        },
        'Cargo': {
            icon: Box,
            color: 'bg-amber-600',
            accent: 'text-amber-600',
            subtitle: 'Logistics Yield & Supply Chain Vectors',
            telemetry: [
                { title: 'Freight Ton KMs', value: '4.2B', trend: 'down', label: 'Weekly Vol', icon: Activity },
                { title: 'Yield (per kg)', value: '$2.42', trend: 'up', label: 'Spot Price', icon: Zap },
                { title: 'Payload Utilization', value: '72%', trend: 'stable', label: 'Global Mean', icon: Layers }
            ]
        },
        'Sustainability': {
            icon: Zap,
            color: 'bg-emerald-500',
            accent: 'text-emerald-500',
            subtitle: 'Decarbonization & ESG Compliance',
            telemetry: [
                { title: 'SAF Blend Progress', value: '4.2%', trend: 'up', label: 'Global Avg', icon: Zap },
                { title: 'Fleet Emissions', value: '-2.4%', trend: 'down', label: 'YoY Delta', icon: Activity },
                { title: 'Net Zero Alignment', value: '0.64', trend: 'up', label: 'Protocol A', icon: Target }
            ]
        },
        'Finance': {
            icon: TrendingUp,
            color: 'bg-[#20a6eb]',
            accent: 'text-[#20a6eb]',
            subtitle: 'Capital Flows & Equity Performance',
            telemetry: [
                { title: 'Sector Market Cap', value: '$1.4T', trend: 'up', label: 'Total Value', icon: TrendingUp },
                { title: 'Operating Margin', value: '8.4%', trend: 'up', label: 'Global Avg', icon: Activity },
                { title: 'P/E (Sector Avg)', value: '14.2', trend: 'stable', label: 'Valuation', icon: Binary }
            ]
        },
        'Regulations': {
            icon: ShieldCheck,
            color: 'bg-slate-700',
            accent: 'text-slate-700',
            subtitle: 'Policy Shifts & Compliance Audits',
            telemetry: [
                { title: 'Open Directives', value: '124', trend: 'up', label: 'Global Count', icon: Bell },
                { title: 'Compliance Rate', value: '98.2%', trend: 'stable', label: 'Operator Mean', icon: ShieldCheck },
                { title: 'Policy Volatility', value: 'High', trend: 'up', label: 'Sector Pulse', icon: Radio }
            ]
        },
        'Tourism & Demand': {
            icon: Globe,
            color: 'bg-rose-500',
            accent: 'text-rose-500',
            subtitle: 'Destination Heatmaps & Leisure Flows',
            telemetry: [
                { title: 'Visitor Volume', value: '42M', trend: 'up', label: 'Weekly Trans', icon: Globe },
                { title: 'Booking Lead Time', value: '42D', trend: 'down', label: 'Market Intent', icon: Clock },
                { title: 'RevPar (Global)', value: '$142', trend: 'up', label: 'Weekly Delta', icon: TrendingUp }
            ]
        }
    };

    const getDynamicTelemetry = () => {
        const currentStats = (sectorStats || []).filter((s: any) => s.sector.toLowerCase() === activeSector.toLowerCase());
        if (currentStats.length > 0) {
            return currentStats.map((s: any, idx: number) => ({
                title: s.metricName,
                value: s.metricValue,
                trend: s.trend,
                label: s.pulseStatus || 'Operational',
                icon: idx % 3 === 0 ? Globe : idx % 3 === 1 ? Activity : Radio
            }));
        }
        return sectorConfig[activeSector].telemetry;
    };

    const activeTelemetry = getDynamicTelemetry();

    const subSectors = [
        { id: 'Route', label: 'Route', icon: Globe },
        { id: 'Fleet', label: 'Fleet', icon: Plane },
        { id: 'Passenger', label: 'Passenger', icon: Target },
        { id: 'Cargo', label: 'Cargo', icon: Box },
        { id: 'Sustainability', label: 'Sustainability', icon: Zap },
        { id: 'Finance', label: 'Finance', icon: TrendingUp },
        { id: 'Regulations', label: 'Regulations', icon: ShieldCheck },
        { id: 'Tourism & Demand', label: 'Tourism', icon: Globe },
    ];

    const config = sectorConfig[activeSector];
    const Icon = config.icon;

    // Filter articles for the active sector
    const sectorArticles = articles.filter(a =>
        (a.status === 'Published' || a.status === 'Approved') &&
        (a.categories?.includes(activeSector) || (a as any).category === activeSector)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Group into categories (using category field or just split)
    const streams = [
        {
            category: 'Intelligence Feed',
            items: sectorArticles.slice(0, 4).map(a => ({
                id: a.id,
                time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: a.title,
                image: a.headerImage,
                excerpt: a.excerpt,
                meta: (a as any).category
            }))
        },
        {
            category: 'Strategic Analysis',
            items: sectorArticles.slice(4, 8).map(a => ({
                id: a.id,
                time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: a.title,
                image: a.headerImage,
                excerpt: a.excerpt,
                meta: (a as any).category
            }))
        }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafb] text-[#1a1a1a] font-sans">

            {/* Radar Sector Sub-Nav */}
            <div className="bg-white border-b border-black/5 sticky top-0 z-40 backdrop-blur-md">
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
                                        <p className={`text-[10px] font-black tracking-wider ${config.accent} opacity-80`}>{config.subtitle}</p>
                                        <span className="w-1 h-1 bg-black/10 rounded-full" />
                                        <span className="text-[9px] font-black text-emerald-600 tracking-widest flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Stream Active
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
                                    <h3 className="text-[11px] font-black tracking-wider">{stream.category}</h3>
                                    <span className={`text-[9px] font-black tracking-wider ${config.accent}`}>Track: Σ-{sIdx + 1}</span>
                                </div>
                                <div className="space-y-4">
                                    {stream.items.map((item, iIdx) => (
                                        <motion.div
                                            key={item.id || item.title}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (iIdx * 0.1) }}
                                            onClick={() => onNavigate?.('/article/' + item.id)}
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
                                <Activity className="w-4 h-4" /> Sector Analytics
                                <span className={`text-[8px] font-black ${config.accent} tracking-wider bg-black/5 px-2 py-0.5 rounded`}>Real-Time</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6 relative z-10">
                                {activeTelemetry.map((t, idx) => (
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
                                                <span className="text-[8px] font-black tracking-wider uppercase">{t.title}</span>
                                            </div>
                                            {t.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <div className="text-3xl font-black text-[#1a1a1a] italic leading-none">{t.value}</div>
                                            <div className="text-[8px] font-bold text-black/20 tracking-tight italic uppercase">{t.label}</div>
                                        </div>
                                        <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${config.color} w-[65%] opacity-30`} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button className={`w-full py-4 ${config.color} text-white rounded-2xl text-[9px] font-black tracking-wider hover:scale-[1.02] transition-all border-0 cursor-pointer shadow-lg relative z-10`}>
                                Request Sector Deep-Dive
                            </button>
                        </div>

                        {/* Recent Alerts Module */}
                        <div className="bg-black/5 p-8 rounded-[2.5rem] border border-black/5 space-y-6">
                            <h3 className="text-[10px] font-black flex items-center gap-2 text-black/30 text-center justify-center">
                                <Bell className="w-4 h-4" /> Recent Dispatches
                            </h3>
                            <div className="space-y-4">
                                {sectorArticles.slice(0, 3).map((art, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => onNavigate?.('/article/' + art.id)}
                                        className="flex gap-4 group cursor-pointer border-b border-black/5 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="text-[8px] font-black text-black/20 font-mono mt-0.5">{new Date(art.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="space-y-1">
                                            <h5 className="text-[11px] font-bold text-black/60 group-hover:text-[#20a6eb] transition-colors leading-tight italic line-clamp-2">{art.title}</h5>
                                            <div className="text-[8px] font-black tracking-wider text-black/20">Sec: {art.categories?.[0] || 'Intelligence Feed'}</div>
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
