import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plane,
    Globe,
    Calendar,
    Briefcase,
    Factory,
    ArrowLeft,
    Clock,
    Search,
    ChevronRight,
    TrendingUp,
    ChevronLeft,
    Activity,
    Shield,
    Terminal
} from 'lucide-react';
import { Article } from '../types';
import { Logo } from './Logo';
import { TopUtilityBar, MainHeader, NewsTicker } from './SharedLayout';

interface AviationPortalProps {
    articles: Article[];
    onBack: () => void;
    initialSubPage?: string;
    onNavigate?: (cat: string) => void;
}

export default function AviationPortal({ articles, onBack, initialSubPage = 'overview', onNavigate }: AviationPortalProps) {
    const [activeSubPage, setActiveSubPage] = useState(initialSubPage);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const subPages = [
        { id: 'overview', label: 'Overview', icon: Globe },
        { id: 'aircrafts', label: 'Aircrafts', icon: Plane },
        { id: 'airlines', label: 'Airlines', icon: Globe },
        { id: 'airshow-events', label: 'Airshow & Events', icon: Calendar },
        { id: 'career', label: 'Career', icon: Briefcase },
        { id: 'manufacturing', label: 'Manufacturing', icon: Factory },
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync sub-page from URL if path changes externally
    useEffect(() => {
        const path = window.location.pathname;
        const sub = path.split('/')[2] || 'overview';
        setActiveSubPage(sub);
        setCurrentPage(1);
    }, [window.location.pathname]);

    const handleSubNavClick = (id: string) => {
        const path = id === 'overview' ? '/aviation' : `/aviation/${id}`;
        window.history.pushState({}, '', path);
        setActiveSubPage(id);
        setCurrentPage(1);
    };

    const publishedArticles = articles.filter(a => a.status === 'Published');

    // Expanded mock articles for Aviation sub-pages
    const aviationMockArticles: Article[] = [
        { id: 'av1', title: 'Airbus A350-1000 Performance Analysis: Ultra Long-Haul Efficiency', category: 'Aircrafts', status: 'Published', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'av2', title: 'Boeing 777X Certification Milestone: Folding Wing Tip Test Success', category: 'Aircrafts', status: 'Published', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 'av3', title: 'Next-Gen Narrowbody: The Race Between Clean Sheet and Re-Engine', category: 'Aircrafts', status: 'Published', createdAt: new Date(Date.now() - 10800000).toISOString() },
        { id: 'av4', title: 'Delta Airlines Fleet Renewal: Major Airbus Order Confirmed', category: 'Airlines', status: 'Published', createdAt: new Date(Date.now() - 14400000).toISOString() },
        { id: 'av5', title: 'Qantas Project Sunrise: London to Sydney Non-stop Prep Enters Final Phase', category: 'Airlines', status: 'Published', createdAt: new Date(Date.now() - 18000000).toISOString() },
        { id: 'av6', title: 'Lufthansa Group Revenue Growth: Cargo Operations Lead Recovery', category: 'Airlines', status: 'Published', createdAt: new Date(Date.now() - 21600000).toISOString() },
        { id: 'av7', title: 'Paris Air Show 2026: Sustainable Aviation Fuel (SAF) Dominates Day 1', category: 'Airshow & Events', status: 'Published', createdAt: new Date(Date.now() - 25200000).toISOString() },
        { id: 'av8', title: 'Dubai Airshow Preview: Middle East Carriers Expected to Place Record Orders', category: 'Airshow & Events', status: 'Published', createdAt: new Date(Date.now() - 28800000).toISOString() },
        { id: 'av9', title: 'Farnborough 2026: Military Drone Tech Takes Center Stage', category: 'Airshow & Events', status: 'Published', createdAt: new Date(Date.now() - 32400000).toISOString() },
        { id: 'av10', title: 'Pilot Recruitment Index: 15% Surge in Captain Demand Globally', category: 'Career', status: 'Published', createdAt: new Date(Date.now() - 36000000).toISOString() },
        { id: 'av11', title: 'Avionics Engineering: Leading Skills for the 2026 Job Market', category: 'Career', status: 'Published', createdAt: new Date(Date.now() - 39600000).toISOString() },
        { id: 'av12', title: 'Aviation Management Degrees: New Curriculum Focuses on Sustainability', category: 'Career', status: 'Published', createdAt: new Date(Date.now() - 43200000).toISOString() },
        { id: 'av13', title: 'OEM Supply Chain Health: Titanium Sourcing Stabilizes', category: 'Manufacturing', status: 'Published', createdAt: new Date(Date.now() - 46800000).toISOString() },
        { id: 'av14', title: 'GE Aerospace Engine Production Scale-up: Meeting A320neo Demand', category: 'Manufacturing', status: 'Published', createdAt: new Date(Date.now() - 50400000).toISOString() },
        { id: 'av15', title: 'Spirit AeroSystems Restructuring: Impact on 737 MAX Assembly Line', category: 'Manufacturing', status: 'Published', createdAt: new Date(Date.now() - 54000000).toISOString() }
    ] as any[];

    const allAviationArticles = [...publishedArticles, ...aviationMockArticles];

    // Filter articles based on sub-page
    const filteredArticles = activeSubPage === 'overview'
        ? allAviationArticles.filter(a => ['Aircrafts', 'Airlines', 'Airshow & Events', 'Career', 'Manufacturing', 'Aviation'].includes(a.category || ''))
        : allAviationArticles.filter(a => {
            const cat = a.category?.toLowerCase() || '';
            const sub = activeSubPage.toLowerCase().replace('-', ' ');
            if (activeSubPage === 'aircrafts') return cat.includes('aircraft') || cat.includes('fleet');
            if (activeSubPage === 'airlines') return cat.includes('airline') || cat.includes('carrier');
            if (activeSubPage === 'manufacturing') return cat.includes('manufacturing') || cat.includes('oem');
            return cat.includes(sub) || (sub === 'airshow events' && (cat.includes('airshow') || cat.includes('event')));
        });

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const paginatedArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Sector Specific Widget Content
    const renderSectorWidget = () => {
        switch (activeSubPage) {
            case 'aircrafts':
                return (
                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="text-[8px] font-black text-[#20a6eb] mb-2 tracking-widest">Fleet Modernization</div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-white/60">New Gen Assets</span>
                                <span className="text-[10px] font-bold text-emerald-400">72%</span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[72%]" />
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="text-[8px] font-black text-[#e86420] mb-2 tracking-widest">OEM Backlog Status</div>
                            <div className="text-xl font-black italic">12,402 <span className="text-[10px] text-white/30 not-italic ml-2">Units</span></div>
                        </div>
                    </div>
                );
            case 'airlines':
                return (
                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="text-[8px] font-black text-[#20a6eb] mb-2 tracking-widest">Global Route Expansion</div>
                            <div className="text-2xl font-black italic">+14% <span className="text-[8px] text-emerald-400 ml-2">Growth</span></div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-[7px] font-black text-white/30 tracking-[0.2em]">Top Carrier Indices</div>
                            {['Delta', 'Qantas', 'Emirates'].map((c, i) => (
                                <div key={c} className="flex justify-between items-center text-[10px]">
                                    <span className="text-white/60">{i + 1}. {c}</span>
                                    <span className="font-bold text-[#20a6eb]">S-Rank</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'airshow-events':
                return (
                    <div className="space-y-4">
                        <div className="text-[8px] font-black text-[#e86420] mb-2 tracking-widest">Upcoming Signals</div>
                        <div className="space-y-3">
                            {[
                                { name: 'Paris Air Show', date: 'June 2026', status: 'Primary' },
                                { name: 'Dubai HeliShow', date: 'Oct 2026', status: 'Secondary' }
                            ].map(e => (
                                <div key={e.name} className="bg-white/5 p-3 rounded-xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all">
                                    <div className="text-[10px] font-bold">{e.name}</div>
                                    <div className="text-[8px] text-white/40">{e.date} • {e.status} Target</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'career':
                return (
                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                            <div className="text-[8px] font-black text-[#20a6eb] mb-2 tracking-widest">Talent Demand Index</div>
                            <div className="text-3xl font-black text-white italic">HIGH</div>
                            <div className="text-[7px] text-emerald-400 mt-1">+12.5% Month Over Month</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <div className="text-[7px] text-white/40 mb-1">Open Roles</div>
                                <div className="text-xs font-bold text-[#20a6eb]">4.2K+</div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                <div className="text-[7px] text-white/40 mb-1">Avg Salary</div>
                                <div className="text-xs font-bold text-[#e86420]">$120K</div>
                            </div>
                        </div>
                    </div>
                );
            case 'manufacturing':
                return (
                    <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="text-[8px] font-black text-emerald-400 mb-2 tracking-widest">Supply Chain Health</div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
                                    <div key={lvl} className={`h-4 flex-1 rounded-sm ${lvl < 6 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                ))}
                            </div>
                            <div className="text-[7px] text-white/30 mt-2 tracking-tight">Optimal Capacity Reached</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="text-[8px] font-black text-white/40 mb-2 tracking-widest">Backlog Delivery Forecast</div>
                            <div className="text-sm font-bold text-[#20a6eb]">Estimated: Q4 2028 Recovery</div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="text-[7px] font-black text-white/30 tracking-[0.3em]">Volume Indice</div>
                                <div className="text-4xl font-black italic text-white tracking-tighter">256</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-[#20a6eb] tracking-widest">Intel Nodes</div>
                                <div className="flex items-center justify-end gap-1.5 mt-1 text-[8px] font-black text-emerald-400">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Stable
                                </div>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#20a6eb] to-[#e86420] w-[70%]" />
                        </div>
                    </div>
                );
        }
    };

    const subPageStats = {
        aircrafts: { metric: '42', unit: 'Models Logged', pulse: 'Steady' },
        airlines: { metric: '128', unit: 'Route Updates', pulse: 'High' },
        'airshow-events': { metric: '15', unit: 'Active Reports', pulse: 'Live' },
        career: { metric: '1.2K', unit: 'Open Positions', pulse: 'Growth' },
        manufacturing: { metric: '3', unit: 'Critical Milestones', pulse: 'Strategic' },
        overview: { metric: '256', unit: 'Intel Nodes', pulse: 'Stable' }
    }[activeSubPage] || { metric: '0', unit: 'N/A', pulse: 'N/A' };

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans selection:bg-[#20a6eb]/20 overflow-x-hidden">

            {/* Aviation Sector Sub-Nav */}
            <div className="bg-white border-b border-black/5 sticky top-[73px] z-40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto scrollbar-hide py-3">
                    <div className="flex items-center gap-2">
                        {subPages.map(page => {
                            const Icon = page.icon;
                            const isActive = activeSubPage === page.id;
                            return (
                                <button
                                    key={page.id}
                                    onClick={() => handleSubNavClick(page.id)}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border-0 cursor-pointer whitespace-nowrap ${isActive
                                        ? 'bg-[#20a6eb] text-white shadow-lg shadow-[#20a6eb]/20'
                                        : 'bg-black/5 text-[#1a1a1a]/40 hover:bg-black/10 hover:text-[#1a1a1a]'
                                        }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#20a6eb]'}`} />
                                    {page.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        <header className="mb-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-[#20a6eb] rounded-full" />
                                <h2 className="text-3xl font-black tracking-tighter text-[#1a1a1a]">
                                    {subPages.find(p => p.id === activeSubPage)?.label || 'Aviation Hub'}
                                </h2>
                            </div>
                            <p className="text-[#1a1a1a]/60 text-sm font-medium leading-relaxed max-w-2xl italic">
                                Strategic intelligence and operational analysis for the {activeSubPage.replace('-', ' ')} sector.
                            </p>
                        </header>

                        {/* Intelligence Feed */}
                        <div className="space-y-4 min-h-[600px]">
                            {paginatedArticles.length > 0 ? paginatedArticles.map((article, i) => (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group bg-white border border-black/5 rounded-[2rem] p-4 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 cursor-pointer border-l-4 border-l-[#20a6eb]"
                                >
                                    <div className="flex gap-6">
                                        <div className="w-40 h-32 shrink-0 rounded-2xl overflow-hidden shadow-sm">
                                            <img
                                                src={`https://images.unsplash.com/photo-${1500000000000 + i + (currentPage * 10)}?auto=format&fit=crop&w=400&q=80`}
                                                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                                alt="Aviation News"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="flex items-center gap-4 text-[8px] font-black text-[#20a6eb] tracking-[0.2em]">
                                                <span className="bg-[#20a6eb]/5 px-2 py-0.5 rounded border border-[#20a6eb]/10">{article.category}</span>
                                                <span className="text-black/20 italic"><Clock className="w-3 h-3 inline mr-1" /> {new Date(article.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-base font-black tracking-tight leading-tight text-[#1a1a1a] group-hover:text-[#20a6eb] transition-colors line-clamp-1">
                                                {article.title}
                                            </h3>
                                            <p className="text-[10px] font-medium text-[#1a1a1a]/40 line-clamp-2 leading-relaxed italic">
                                                {article.excerpt || `In-depth analysis of the latest shifts in ${activeSubPage} strategy and market performance markers...`}
                                            </p>
                                            <div className="pt-3 flex items-center justify-between border-t border-black/5 mt-4">
                                                <span className="text-[8px] font-black text-black/30 tracking-widest flex items-center gap-2">
                                                    <Activity className="w-3 h-3 text-emerald-500" /> Active Verification
                                                </span>
                                                <button className="text-[9px] font-black text-[#20a6eb] tracking-widest flex items-center gap-1 group/btn border-0 bg-transparent cursor-pointer">
                                                    Analyze <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            )) : (
                                <div className="h-[400px] flex flex-col items-center justify-center text-[#1a1a1a]/20 bg-black/5 rounded-[3rem] border border-dashed border-black/10">
                                    <Shield className="w-16 h-16 mb-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Intelligence Nodes Detected</p>
                                    <span className="text-[9px] font-medium mt-2 italic">Refining signal search parameters...</span>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-12 bg-white p-4 rounded-[1.5rem] border border-black/5 shadow-sm">
                                <button
                                    onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage === 1}
                                    className="px-6 py-2 rounded-xl hover:bg-black/5 disabled:opacity-20 transition-all border-0 bg-transparent cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Prev
                                </button>
                                <div className="text-[10px] font-black tracking-widest text-black/30">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button
                                    onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-2 rounded-xl hover:bg-black/5 disabled:opacity-20 transition-all border-0 bg-transparent cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Intelligence Panel */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Sector Snapshot */}
                        <div className="bg-[#1a1a1a] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#20a6eb] opacity-30 blur-[80px]" />
                            <div className="relative z-10 space-y-8">
                                <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                                    <h3 className="text-[10px] font-black tracking-[0.2em] flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-[#20a6eb]" /> Sector Analytics
                                    </h3>
                                    <span className="text-[8px] font-black text-[#20a6eb] tracking-widest bg-[#20a6eb]/10 px-2 py-0.5 rounded border border-[#20a6eb]/20">Active</span>
                                </div>

                                <div className="relative z-10">
                                    {renderSectorWidget()}
                                </div>

                                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black tracking-widest hover:bg-[#20a6eb] transition-all border-0 cursor-pointer text-white shadow-xl">
                                    Request Deep Dive Report
                                </button>
                            </div>
                        </div>

                        {/* Related Tags */}
                        <div className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-black/20 mb-8 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#e86420]" /> Industry Markers
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {['Airbus', 'Boeing', 'Safety', 'Sustainability', 'SAF', 'Avionics', 'MRO', 'Global Logistics'].map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-black/5 hover:bg-[#20a6eb]/10 hover:text-[#20a6eb] text-[#1a1a1a]/60 text-[9px] font-black tracking-widest rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#20a6eb]/20">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Intelligence Briefing */}
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#e86420] flex items-center justify-center shadow-[0_10px_30px_rgba(232,100,32,0.3)]">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black tracking-tighter leading-none italic text-[#e86420]">Analyst Portal</h3>
                                    <p className="text-[10px] font-medium text-white/50 leading-relaxed italic border-l-2 border-white/10 pl-4">
                                        Submit your operational data for verification by our global intelligence community.
                                    </p>
                                </div>
                                <button className="w-full bg-white text-[#1a1a1a] py-4 rounded-xl text-[10px] font-black tracking-widest hover:bg-[#e86420] hover:text-white transition-all border-0 cursor-pointer shadow-2xl group flex items-center justify-center gap-2">
                                    ACCESS PORTAL <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-black/5 pt-20 pb-10 mt-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10 text-[9px] font-black text-[#1a1a1a]/20 tracking-[0.3em]">
                    <div className="flex items-center gap-3">
                        <Logo className="w-6 h-6 grayscale opacity-20" />
                        <p>© 2026 TRAVEL RADAR OPERATIONS HUB.</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="#" className="hover:text-[#20a6eb] transition-all">Protocol</a>
                        <a href="#" className="hover:text-[#20a6eb] transition-all">Telemetry</a>
                        <a href="#" className="hover:text-[#20a6eb] transition-all">Archive</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
