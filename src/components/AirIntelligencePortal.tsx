import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Activity,
    Globe,
    Search,
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    Shield,
    Database,
    Cpu,
    ArrowRight,
    Plane,
    MapPin,
    Clock,
    BarChart3,
    AlertCircle,
    Zap
} from 'lucide-react';
import { Article } from '../types';

interface AirIntelligencePortalProps {
    articles: Article[];
    onBack: () => void;
    onNavigate?: (cat: string) => void;
}

type IntelligencePage = 'airlines' | 'airports' | 'routes' | 'overview';

export default function AirIntelligencePortal({ articles, onBack, onNavigate }: AirIntelligencePortalProps) {
    const [activePage, setActivePage] = useState<IntelligencePage>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [routePair, setRoutePair] = useState({ from: '', to: '' });

    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('/air-intelligence/airlines')) setActivePage('airlines');
        else if (path.includes('/air-intelligence/airports')) setActivePage('airports');
        else if (path.includes('/air-intelligence/routes')) setActivePage('routes');
        else setActivePage('overview');
    }, [window.location.pathname]);

    const handlePageChange = (page: IntelligencePage) => {
        const path = page === 'overview' ? '/air-intelligence' : `/air-intelligence/${page}`;
        window.history.pushState({}, '', path);
        setActivePage(page);
    };

    const modules = [
        { id: 'airlines', label: 'Airline Intelligence', icon: Plane, desc: 'Dedicated profiles for 150+ global carriers.' },
        { id: 'airports', label: 'Airport Intelligence', icon: MapPin, desc: 'Connectivity indices and infrastructure logs.' },
        { id: 'routes', label: 'Route Intelligence', icon: Globe, desc: 'City-pair frequency and capacity audit.' }
    ];

    const renderOverview = () => (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {modules.map(mod => {
                    const Icon = mod.icon;
                    return (
                        <motion.div
                            key={mod.id}
                            whileHover={{ y: -5 }}
                            onClick={() => handlePageChange(mod.id as IntelligencePage)}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm cursor-pointer group hover:border-[#20a6eb]/30 transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-[#20a6eb]/10 transition-colors">
                                <Icon className="w-7 h-7 text-[#20a6eb]" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight mb-2">{mod.label}</h3>
                            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6 italic">{mod.desc}</p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-[#20a6eb] tracking-wider">
                                Access Module <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="bg-[#1a1a1a] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#20a6eb] opacity-20 blur-[100px]" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20a6eb]/20 border border-[#20a6eb]/20 text-[10px] font-black tracking-wider text-[#20a6eb]">
                            <Zap className="w-3 h-3 fill-current" /> Live Pulse
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter leading-none italic">
                            Global Connectivity <span className="text-[#20a6eb]">Index</span>
                        </h2>
                        <p className="text-sm text-white/50 font-medium italic border-l-2 border-white/10 pl-6">
                            Aggregated intelligence from 4,200 nodes. Real-time yield monitoring and route capacity verification in progress.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                            <div className="text-4xl font-black italic">+8.4%</div>
                            <div className="text-[10px] text-white/40 font-black tracking-wider mt-2">Yield Trend</div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                            <div className="text-4xl font-black italic">420ms</div>
                            <div className="text-[10px] text-white/40 font-black tracking-wider mt-2">Latency</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAirlines = () => (
        <div className="space-y-10">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between mb-8">
                <div className="flex-1 flex items-center gap-4">
                    <Search className="w-5 h-5 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search airline database (e.g., Emirates, Delta, Lufthansa)..."
                        className="w-full bg-transparent border-0 outline-none text-sm font-bold placeholder:text-gray-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-xl text-[10px] font-black tracking-wider border-0 cursor-pointer shadow-lg hover:bg-[#20a6eb] transition-all">
                    Execute Query
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Emirates', code: 'EK', score: 98, fleet: 262, routes: 152 },
                    { name: 'Delta Air Lines', code: 'DL', score: 94, fleet: 960, routes: 325 },
                    { name: 'Qatar Airways', code: 'QR', score: 97, fleet: 253, routes: 160 },
                    { name: 'Lufthansa', code: 'LH', score: 89, fleet: 278, routes: 210 },
                    { name: 'Singapore Airlines', code: 'SQ', score: 99, fleet: 154, routes: 78 }
                ].filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).map(airline => (
                    <motion.div
                        key={airline.code}
                        className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="text-2xl font-black tracking-tighter">{airline.name}</h4>
                                    <div className="text-[10px] font-black text-[#e86420] tracking-wider mb-2">Capacity Rank</div>
                                    <div className="text-[10px] font-black text-[#20a6eb] tracking-wider italic">{airline.code} • Global Operator</div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl font-black text-[#20a6eb] shadow-inner group-hover:bg-[#20a6eb] group-hover:text-white transition-all">
                                    {airline.score}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <div className="text-[8px] font-black text-gray-400 tracking-wider mb-1">Fleet Total</div>
                                    <div className="text-lg font-black italic">{airline.fleet} <span className="text-[8px] not-italic text-gray-400">Fixed</span></div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <div className="text-[8px] font-black text-gray-400 tracking-wider mb-1">Active Routes</div>
                                    <div className="text-lg font-black italic">{airline.routes} <span className="text-[8px] not-italic text-gray-400">Zones</span></div>
                                </div>
                            </div>

                            <button className="w-full py-4 rounded-xl border border-dashed border-gray-200 text-[9px] font-black tracking-wider text-gray-400 group-hover:border-[#20a6eb] group-hover:text-[#20a6eb] transition-all">
                                View Intelligence Profile
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderAirports = () => (
        <div className="space-y-10">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-[#e86420]/5 pointer-events-none" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#e86420] tracking-wider">
                            <MapPin className="w-3 h-3" /> HUB CONNECTIVITY INDEX
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter leading-none italic">
                            Singapore <span className="text-[#e86420]">Changi</span> (SIN)
                        </h2>
                        <p className="text-sm font-medium text-gray-400 italic">
                            Retaining S-Rank status in Q3 2026. Biometric processing times averaged 42s across all terminals.
                        </p>
                        <div className="flex gap-6">
                            <div className="space-y-1">
                                <div className="text-2xl font-black italic">#1</div>
                                <div className="text-[9px] font-black text-gray-300 tracking-wider">Global Rank</div>
                            </div>
                            <div className="w-[1px] bg-gray-100" />
                            <div className="space-y-1">
                                <div className="text-2xl font-black italic">104M</div>
                                <div className="text-[9px] font-black text-white/40 tracking-wider mb-1">Capacity</div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4 bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100 text-center space-y-4">
                        <div className="text-[9px] font-black tracking-wider text-[#e86420]">Infrastructure Stats</div>
                        <div className="space-y-2">
                            {['Terminals: 5', 'Runways: 3', 'GDS Gates: 242'].map(s => (
                                <div key={s} className="text-xs font-bold text-gray-600 border-b border-gray-200 pb-2 last:border-0">{s}</div>
                            ))}
                        </div>
                        <button className="w-full py-3 bg-[#e86420] text-white rounded-xl text-[10px] font-black tracking-wider border-0 cursor-pointer shadow-lg shadow-[#e86420]/20">
                            Access Infrastructure Logs
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { name: 'London Heathrow', code: 'LHR', city: 'UK', load: 88 },
                    { name: 'Dubai International', code: 'DXB', city: 'UAE', load: 94 },
                    { name: 'Tokyo Haneda', code: 'HND', city: 'JP', load: 91 },
                    { name: 'Hartsfield-Jackson', code: 'ATL', city: 'USA', load: 96 }
                ].map(apt => (
                    <div key={apt.code} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group hover:border-[#20a6eb]/30 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center font-black text-[#20a6eb] group-hover:bg-[#20a6eb] group-hover:text-white transition-all">
                                {apt.code}
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-300 tracking-wider">{apt.city}</span>
                            </div>
                        </div>
                        <h4 className="text-sm font-black tracking-tight mb-4">{apt.name}</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                <span>Signal Load</span>
                                <span>{apt.load}%</span>
                            </div>
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#20a6eb]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${apt.load}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRoutes = () => (
        <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
                    <div className="flex-1 flex items-center gap-4 bg-gray-50 px-8 py-6 rounded-[2rem] border border-gray-100 w-full">
                        <MapPin className="w-6 h-6 text-[#20a6eb]" />
                        <input
                            type="text"
                            placeholder="Origin City (e.g., London)"
                            className="bg-transparent border-0 outline-none font-black text-xl placeholder:text-gray-300 w-full"
                            value={routePair.from}
                            onChange={(e) => setRoutePair({ ...routePair, from: e.target.value })}
                        />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-xl">
                        <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 flex items-center gap-4 bg-gray-50 px-8 py-6 rounded-[2rem] border border-gray-100 w-full">
                        <MapPin className="w-6 h-6 text-[#e86420]" />
                        <input
                            type="text"
                            placeholder="Destination (e.g., Toronto)"
                            className="bg-transparent border-0 outline-none font-black text-xl placeholder:text-gray-300 w-full"
                            value={routePair.to}
                            onChange={(e) => setRoutePair({ ...routePair, to: e.target.value })}
                        />
                    </div>
                </div>

                {routePair.from && routePair.to ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#fafafa] rounded-[2rem] p-8 border border-gray-200"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-gray-400 tracking-wider">Operating Analysts</h5>
                                <div className="space-y-3">
                                    {['British Airways', 'Air Canada', 'WestJet'].map(airline => (
                                        <div key={airline} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-[#20a6eb]/50 transition-all">
                                            <span className="text-sm font-black tracking-tight">{airline}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#20a6eb]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-gray-400 tracking-wider">Weekly Frequency</h5>
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center space-y-2">
                                    <div className="text-5xl font-black italic">42x</div>
                                    <div className="text-[10px] font-bold text-emerald-400">+4% Vs Previous Cycle</div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-gray-400 tracking-wider">Future Outlook</h5>
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black tracking-wider">Demand</span>
                                        <span className="text-xs font-black text-[#e86420]">BULLISH</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#20a6eb] to-[#e86420] w-[85%]" />
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-medium italic">Predicted +12% capacity expansion for Winter 2026 cycle.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                        <Globe className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h5 className="text-sm font-black text-gray-400 tracking-wider">Awaiting Route Intersection Data</h5>
                        <p className="text-[10px] text-gray-300 font-medium italic mt-2">Enter any city pair to start frequency analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-[#fcfcfc] text-[#1a1a1a] font-sans selection:bg-[#20a6eb]/20">
            {/* Intel Sub-Nav */}
            <div className="bg-white border-b border-black/5 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto scrollbar-hide py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange('overview')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all border-0 cursor-pointer whitespace-nowrap ${activePage === 'overview'
                                ? 'bg-[#1a1a1a] text-white shadow-lg'
                                : 'bg-black/5 text-[#1a1a1a]/40 hover:bg-black/10 hover:text-[#1a1a1a]'
                                }`}
                        >
                            <Cpu className="w-3.5 h-3.5" /> OVERVIEW
                        </button>
                        {modules.map(mod => {
                            const Icon = mod.icon;
                            const isActive = activePage === mod.id;
                            return (
                                <button
                                    key={mod.id}
                                    onClick={() => handlePageChange(mod.id as IntelligencePage)}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all border-0 cursor-pointer whitespace-nowrap ${isActive
                                        ? 'bg-[#20a6eb] text-white shadow-lg shadow-[#20a6eb]/20'
                                        : 'bg-black/5 text-[#1a1a1a]/40 hover:bg-black/10 hover:text-[#1a1a1a]'
                                        }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#20a6eb]'}`} />
                                    {mod.label.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-16">
                <header className="mb-16 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-gradient-to-b from-[#20a6eb] to-[#e86420] rounded-full" />
                                <h1 className="text-5xl font-black tracking-tighter text-[#1a1a1a] leading-none">
                                    Air <span className="text-[#20a6eb]">Intelligence</span>
                                </h1>
                            </div>
                            <p className="text-[#1a1a1a]/60 text-base font-medium max-w-2xl italic pl-4">
                                Global aviation surveillance and strategic asset profiling. Deep-dive analytics for the high-altitude industrial sector.
                            </p>
                        </div>
                        <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm shrink-0">
                            <div className="px-6 py-2 border-r border-gray-100 text-center">
                                <div className="text-[9px] font-black text-white/40 tracking-wider mb-1">Rank</div>
                                <div className="text-xl font-black italic">4,202</div>
                            </div>
                            <div className="px-6 py-2 text-center">
                                <div className="text-[9px] font-black text-gray-300 tracking-wider mb-1">Uptime</div>
                                <div className="text-xl font-black italic text-emerald-500">99.98%</div>
                            </div>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {activePage === 'overview' && renderOverview()}
                        {activePage === 'airlines' && renderAirlines()}
                        {activePage === 'airports' && renderAirports()}
                        {activePage === 'routes' && renderRoutes()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
