import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Globe,
    ArrowLeft,
    Terminal,
    Database,
    Shield,
    Cpu,
    User,
    Plane,
    CreditCard,
    Key,
    Star,
    Wifi,
    MapPin,
    History,
    ChevronLeft,
    ChevronRight,
    Search,
    Clock,
    LayoutGrid,
    Tag,
    AlertTriangle,
    Activity,
    Bell,
    Settings,
    MoreHorizontal,
    ChevronDown,
    Share2
} from 'lucide-react';
import { Article } from '../types';

interface TravelPortalProps {
    articles: Article[];
    onBack: () => void;
    onNavigate?: (cat: string) => void;
    sectorStats?: any;
    portalDeals?: any;
    portalContent?: any;
}

type TravelSubPage = 'overview' | 'airports' | 'points-loyalty' | 'technology' | 'trip-reviews' | 'deals';

const ITEMS_PER_PAGE = 7;

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
                    </motion.div>
                </div>
            ))}
        </div>
    );
}

export default function TravelPortal({ articles, onBack, onNavigate }: TravelPortalProps) {
    const [activeSubPage, setActiveSubPage] = useState<TravelSubPage>('overview');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle URL change logic
    useEffect(() => {
        const handlePath = () => {
            const path = window.location.pathname;
            if (path === '/travel/airports') setActiveSubPage('airports');
            else if (path === '/travel/points-loyalty') setActiveSubPage('points-loyalty');
            else if (path === '/travel/technology') setActiveSubPage('technology');
            else if (path === '/travel/trip-reviews') setActiveSubPage('trip-reviews');
            else if (path === '/travel/deals') setActiveSubPage('deals');
            else setActiveSubPage('overview');
        };
        handlePath();
        window.addEventListener('popstate', handlePath);
        return () => window.removeEventListener('popstate', handlePath);
    }, []);

    const navigateToSubPage = (sub: TravelSubPage) => {
        const path = sub === 'overview' ? '/travel' : `/travel/${sub}`;
        window.history.pushState({}, '', path);
        setActiveSubPage(sub);
        setCurrentPage(1);
    };

    const publishedArticles = articles.filter(a => a.status === 'Published');

    // Expanded mock articles for Travel sub-pages
    const travelMockArticles: Article[] = [
        {
            id: 'tr1',
            title: 'Changi Airport T5 Groundbreaking: The Future of Biometric Transit',
            excerpt: 'Singapore’s mega-terminal project officially enters phase 2, promising a contactless passenger journey powered by advanced facial recognition and AI-driven logistics.',
            category: 'Airports',
            status: 'Published',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr2',
            title: 'LHR Slot Allocation: Impact on Transatlantic Competition in 2027',
            excerpt: 'New regulatory frameworks at Heathrow are set to shake up slot ownership, potentially opening doors for low-cost carriers to enter the high-yield London-New York corridor.',
            category: 'Airports',
            status: 'Published',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr3',
            title: 'JFK New Terminal One: A Deep Dive into Premium Lounge Strategic Design',
            excerpt: 'As JFK’s redevelopment continues, we analyze the blueprint for the largest airline-operated lounges in the world and their impact on passenger loyalty.',
            category: 'Airports',
            status: 'Published',
            createdAt: new Date(Date.now() - 10800000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr4',
            title: 'Chase Sapphire Lounge Expansion: New Global Hubs Revealed',
            excerpt: 'JPMorgan Chase accelerates its airport lounge strategy with four new locations announced for 2026, targeting high-spend premium cardholders.',
            category: 'Points & Loyalty',
            status: 'Published',
            createdAt: new Date(Date.now() - 14400000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr5',
            title: 'Status Match Guide 2026: The Easiest Ways to Fast-Track to Elite',
            excerpt: 'Our intelligence analysts breakdown the current status match landscape, identifying the most lucrative opportunities for frequent flyers to switch loyalty programs.',
            category: 'Points & Loyalty',
            status: 'Published',
            createdAt: new Date(Date.now() - 18000000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr6',
            title: 'Bilt Rewards Valuation: Impact of New Transfer Partner Additions',
            excerpt: 'With the addition of three new airline partners, we re-evaluate Bilt’s point valuation and why it remains the most versatile currency in the travel market.',
            category: 'Points & Loyalty',
            status: 'Published',
            createdAt: new Date(Date.now() - 21600000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr7',
            title: 'NDC Adoption in 2026: Why Corporate Travel is Finally Catching Up',
            excerpt: 'After years of friction, new distributional capability standards are finally achieving critical mass in the corporate sector, changing how businesses book travel.',
            category: 'Technology',
            status: 'Published',
            createdAt: new Date(Date.now() - 25200000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr8',
            title: 'AI in Hospitality: Personalizing the Guest Stay Through Predicting Needs',
            excerpt: 'Luxury hotel brands are deploying predictive AI models to anticipate guest preferences before they check in, leading to unprecedented satisfaction scores.',
            category: 'Technology',
            status: 'Published',
            createdAt: new Date(Date.now() - 28800000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr9',
            title: 'The Rise of Digital Identity Wallets: Moving Beyond Physical Passports',
            excerpt: 'The IATA digital identity standard is being tested across three major air corridors, signaling the beginning of the end for physical travel documents.',
            category: 'Technology',
            status: 'Published',
            createdAt: new Date(Date.now() - 32400000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr10',
            title: 'Review: Air France La Première - The Gold Standard of European Luxury',
            excerpt: 'A detailed look at why Air France continues to dominate the luxury first-class market with its refined service, ground experience, and culinary excellence.',
            category: 'Trip Reviews',
            status: 'Published',
            createdAt: new Date(Date.now() - 36000000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr11',
            title: 'St. Regis Red Sea Resort: A Review of the Sustainable Luxury Jewel',
            excerpt: 'Our trip analysts visit Saudi Arabia’s ambitious sustainable resort project, evaluating if the experience justifies the ultra-premium price tag.',
            category: 'Trip Reviews',
            status: 'Published',
            createdAt: new Date(Date.now() - 39600000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr12',
            title: 'Qatar Airways Qsuite 2.0: Does it Maintain the Best Business Class Title?',
            excerpt: 'The second generation of the world’s most famous business class seat is here. We test the ergonomics, privacy, and technology improvements.',
            category: 'Trip Reviews',
            status: 'Published',
            createdAt: new Date(Date.now() - 43200000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr13',
            title: 'Flash Sale: Business Class to Tokyo from $1,900 Round Trip',
            excerpt: 'Intelligence identifies a massive pricing anomaly for flights originating from major US West Coast hubs. Analysts recommend immediate booking as inventory is depleting rapidly.',
            category: 'Flight deal',
            status: 'Published',
            createdAt: new Date(Date.now() - 1200000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr14',
            title: 'Mistake Fare: London to Cape Town for £290 in Premium Economy',
            excerpt: 'A significant distributional error on a major carrier’s booking portal has briefly exposed premium economy seats at economy prices. Act now before the patch.',
            category: 'Flight deal',
            status: 'Published',
            createdAt: new Date(Date.now() - 2400000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        },
        {
            id: 'tr15',
            title: 'Early Bird Alert: Summer 2027 Mediterranean Routes Open',
            excerpt: 'Strategic analysis of schedule releases shows unprecedented reward seat availability for major European summer destinations. Top-tier loyalty members should capitalize today.',
            category: 'Flight deal',
            status: 'Published',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            content: '', writerId: '', writerName: '', editorId: null, editorName: null, topicId: null, score: 0, reviewCycles: 0, submittedAt: null, updatedAt: '', revisions: [], aiValidation: null, comments: [], history: []
        }
    ].map((a, i) => ({
        ...a,
        headerImage: `https://images.unsplash.com/photo-${[
            '1520607162513-77705c0f0d4a', // Airport
            '1473852172248-39c89461b36e', // Airplane
            '1542291026-7eec264c27ff', // Terminal
            '1563013544-824ae1d704d3', // Card/Points
            '1556740738-b6a63e27c4df', // Loyalty
            '1506784911019-79ad939225b7', // Calendar/Status
            '1518770660439-4636190af475', // Tech
            '1485827404703-89b55fcc595e', // AI/Hotel
            '1507146426996-ef05306b995a', // Digital
            '1507679799987-c7377f3230f0', // Luxury First
            '1540541338287-41700207dee6', // Resort
            '1570710891163-6d3b5c47248b'  // Business Class
        ][i]}?q=80&w=800`
    })) as any[];

    const allTravelArticles = [...publishedArticles, ...travelMockArticles];

    const filteredArticles = activeSubPage === 'overview'
        ? allTravelArticles.filter(a => ['Airports', 'Points & Loyalty', 'Technology', 'Trip Reviews', 'Travel'].includes(a.category || ''))
        : allTravelArticles.filter(a => {
            const cat = a.category?.toLowerCase() || '';
            const sub = activeSubPage.toLowerCase().replace('-', ' ');
            if (activeSubPage === 'points-loyalty') return cat.includes('points') || cat.includes('loyalty');
            if (activeSubPage === 'trip-reviews') return cat.includes('review');
            if (activeSubPage === 'deals') return cat.includes('deal') || cat.includes('offer');
            return cat.includes(sub);
        });

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const paginatedArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const renderSectorWidget = () => {
        switch (activeSubPage) {
            case 'airports':
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="text-[8px] font-black text-[#20a6eb] mb-4 tracking-wider">Congestion Index</div>
                            <Sparkline data={[65, 78, 62, 85, 90, 82, 75]} color="#20a6eb" />
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-[10px] text-[#1a1a1a]/60">JFK T4</span>
                                <span className="text-[10px] font-bold text-red-500">Critical</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="text-[8px] font-black text-emerald-600 mb-2 tracking-wider">Gate Efficiency</div>
                            <div className="text-xl font-black italic text-[#1a1a1a]">94.2% <span className="text-[10px] text-[#1a1a1a]/30 not-italic ml-2">Global Avg</span></div>
                        </div>
                    </div>
                );
            case 'points-loyalty':
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="text-[8px] font-black text-[#e86420] mb-4 tracking-wider">Yield Volatility</div>
                            <Sparkline data={[2.1, 2.4, 2.2, 2.8, 2.1, 2.3, 2.4]} color="#e86420" />
                            <div className="text-xl font-black italic text-[#1a1a1a] mt-4">2.4c <span className="text-[8px] text-[#1a1a1a]/30 ml-2">Per Point</span></div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-[7px] font-black text-[#1a1a1a]/30 tracking-wider">Active Status Matches</div>
                            {['United', 'Marriott', 'Delta'].map(m => (
                                <div key={m} className="flex justify-between items-center text-[10px] bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <span className="text-[#1a1a1a]/60 font-bold">{m}</span>
                                    <span className="font-bold text-emerald-600">Open</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'technology':
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="text-[8px] font-black text-[#20a6eb] mb-4 tracking-wider">GDS System Load</div>
                            <MiniBarChart data={[
                                { label: 'Sabre', value: 85 },
                                { label: 'Amadeus', value: 92 },
                                { label: 'Travelport', value: 78 }
                            ]} />
                            <div className="text-lg font-black italic text-[#1a1a1a] mt-4">99.998% <span className="text-[8px] text-[#1a1a1a]/30 ml-2">Uptime</span></div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="text-[8px] font-black text-emerald-600 mb-2 tracking-wider">Biometric Adoption</div>
                            <div className="text-xl font-black italic text-[#1a1a1a]">+42% <span className="text-[10px] text-[#1a1a1a]/30 not-italic ml-2">YoY</span></div>
                        </div>
                    </div>
                );
            case 'trip-reviews':
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-100/50 p-4 rounded-2xl border border-gray-100 text-center">
                            <div className="text-[8px] font-black text-amber-600 mb-2 tracking-wider">Avg Quality Score</div>
                            <div className="text-3xl font-black text-[#1a1a1a] italic">4.82</div>
                            <div className="flex justify-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-[#1a1a1a]/10'}`} />)}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="text-[7px] text-[#1a1a1a]/40 mb-2 tracking-wider">Trending Product</div>
                            <div className="text-[10px] font-bold text-[#20a6eb] tracking-tight">Japan Airlines A35K F</div>
                        </div>
                    </div>
                );
            case 'deals':
                return (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-[#20a6eb]/5 to-[#e86420]/5 p-4 rounded-2xl border border-[#20a6eb]/10">
                            <div className="text-[8px] font-black text-[#e86420] mb-2 tracking-wider">Hot Deal Alert</div>
                            <div className="text-sm font-black text-[#1a1a1a]">LHR → JFK Under $350</div>
                            <div className="text-[10px] text-[#1a1a1a]/40 mt-1 italic">Expiring in 2h 45m</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="text-[8px] font-black text-[#20a6eb] mb-2 tracking-wider">Average Deal Yield</div>
                            <div className="text-xl font-black italic text-[#1a1a1a]">-34% <span className="text-[10px] text-emerald-600 not-italic ml-2">Vs Market</span></div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="text-[7px] font-black text-[#1a1a1a]/30 tracking-wider">Traffic Indice</div>
                                <div className="text-4xl font-black italic text-[#1a1a1a] tracking-tighter">842</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-[#20a6eb] tracking-wider">Live Terminals</div>
                                <div className="flex items-center justify-end gap-1.5 mt-1 text-[8px] font-black text-emerald-600">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_8px_#10b981]" /> Global Active
                                </div>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#20a6eb] to-[#e86420] w-[85%]" />
                        </div>
                    </div>
                );
        }
    };

    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const categories = ['Breaking News', 'Aviation', 'Travel', 'Newsletters', 'Aircraft Sales'];


    return (
        <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans selection:bg-[#20a6eb]/20 overflow-x-hidden">

            <div className="min-h-screen bg-[#f8fafb] text-[#1a1a1a] font-sans selection:bg-[#20a6eb]/20 overflow-x-hidden pb-20">
                <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-12">

                    {/* Portal Header */}
                    <div className="mb-12 relative">
                        <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#20a6eb] opacity-5 blur-[100px]" />

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
                            <div className="space-y-4">
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 text-[10px] font-black tracking-wider text-[#1a1a1a]/40 hover:text-[#20a6eb] transition-all group border-0 bg-transparent cursor-pointer"
                                >
                                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence Desk
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                                        <Globe className="w-7 h-7 text-[#20a6eb]" />
                                    </div>
                                    <div>
                                        <h1 className="text-5xl font-black text-[#1a1a1a] italic tracking-tighter">
                                            Travel <span className="text-[#20a6eb]">Hub</span>
                                        </h1>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black tracking-wider text-[#1a1a1a]/30">Sector Operations Center</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                            <span className="text-[10px] font-bold text-[#20a6eb] tracking-wider">Global Live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-navigation */}
                            <div className="flex items-center gap-1 bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-sm backdrop-blur-xl">
                                {[
                                    { id: 'overview', label: 'Overview', icon: LayoutGrid },
                                    { id: 'airports', label: 'Airports', icon: MapPin },
                                    { id: 'points-loyalty', label: 'Points & Loyalty', icon: CreditCard },
                                    { id: 'technology', label: 'Technology', icon: Cpu },
                                    { id: 'trip-reviews', label: 'Trip Reviews', icon: Star },
                                    { id: 'deals', label: 'Flight Deals', icon: Tag }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => navigateToSubPage(tab.id as TravelSubPage)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black tracking-wider transition-all border-0 cursor-pointer ${activeSubPage === tab.id
                                            ? 'bg-[#20a6eb] text-white shadow-lg shadow-[#20a6eb]/20'
                                            : 'text-[#1a1a1a]/40 hover:text-[#1a1a1a] hover:bg-gray-50'
                                            }`}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* News Feed */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                                <h2 className="text-xl font-black text-[#1a1a1a] italic tracking-tight flex items-center gap-3">
                                    <Database className="w-5 h-5 text-[#20a6eb]" />
                                    {activeSubPage === 'overview' ? 'Latest Intelligence' : `${activeSubPage.replace('-', ' ')} Feed`}
                                </h2>
                                <div className="text-[10px] font-bold text-[#1a1a1a]/30 tracking-widest">
                                    Showing {paginatedArticles.length} of {filteredArticles.length} Reports
                                </div>
                            </div>

                            {/* Featured Highlight Card */}
                            {currentPage === 1 && activeSubPage === 'overview' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-br from-[#20a6eb] to-[#e86420] p-[1px] rounded-[2.5rem] overflow-hidden shadow-xl"
                                >
                                    <div className="bg-white rounded-[2.5rem] p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#20a6eb]/5 blur-[100px] -rotate-45" />
                                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                            <div className="w-full md:w-1/3 aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
                                                <img
                                                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600"
                                                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                                                    alt="Featured"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-4 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-3">
                                                    <span className="text-[8px] font-black px-2 py-1 bg-gray-100 text-[#1a1a1a]/60 rounded tracking-[0.2em]">Sector Priority</span>
                                                    <span className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                                                </div>
                                                <h3 className="text-3xl font-black text-[#1a1a1a] leading-none tracking-tighter italic">
                                                    Global Fleet Efficiency <br /> <span className="text-[#20a6eb]">Index Report 2026</span>
                                                </h3>
                                                <p className="text-sm text-[#1a1a1a]/50 font-medium leading-relaxed italic max-w-xl">
                                                    A comprehensive analysis of fuel consumption metrics and route optimization breakthroughs across major carriers.
                                                </p>
                                                <button className="bg-[#1a1a1a] text-white px-8 py-3 rounded-xl text-[10px] font-black tracking-widest hover:bg-[#20a6eb] transition-all shadow-xl border-0 cursor-pointer">
                                                    Download Executive Summary
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Two-column grid feed */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <AnimatePresence mode="wait">
                                    {paginatedArticles.map((article, idx) => (
                                        <motion.div
                                            key={article.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group bg-white hover:bg-gray-50 border border-gray-100 rounded-[2rem] transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl flex flex-col h-full"
                                        >
                                            <div className="relative h-64 overflow-hidden">
                                                <img
                                                    src={(article as any).headerImage || 'https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=800'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    alt={article.title}
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <span className="text-[8px] font-black px-2 py-0.5 bg-white text-[#1a1a1a] rounded shadow-xl tracking-widest border border-white/20">
                                                        {article.category || 'Travel'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-8 space-y-6 relative z-10 flex-1 flex flex-col justify-between">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-[#1a1a1a]/20 flex items-center gap-1">
                                                            <Clock className="w-2.5 h-2.5" /> {new Date(article.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-black text-[#1a1a1a] leading-tight tracking-tight group-hover:text-[#20a6eb] transition-colors line-clamp-2 italic">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-[10px] text-[#1a1a1a]/50 font-medium leading-relaxed italic line-clamp-3">
                                                        {(article as any).excerpt || 'No excerpt available for this intelligence node.'}
                                                    </p>
                                                </div>

                                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <User className="w-3 h-3 text-[#1a1a1a]/40" />
                                                        </div>
                                                        <span className="text-[9px] font-bold text-[#1a1a1a]/40">Intelligence Dept</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-[#1a1a1a]/20 group-hover:text-[#20a6eb] group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredArticles.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
                                    <Database className="w-12 h-12 text-[#1a1a1a]/10 mx-auto mb-4" />
                                    <p className="text-[#1a1a1a]/30 font-bold tracking-widest text-xs">No intelligence data for this sector</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 pt-10">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1a1a1a] hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm border-0 cursor-pointer"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border-0 cursor-pointer ${currentPage === i + 1
                                                    ? 'bg-[#20a6eb] text-white shadow-lg shadow-[#20a6eb]/20'
                                                    : 'bg-white text-[#1a1a1a]/40 hover:bg-gray-50 border border-gray-100'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1a1a1a] hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm border-0 cursor-pointer"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-10">
                            {/* Sector Snapshot */}
                            <div className="bg-white rounded-[2.5rem] p-8 text-[#1a1a1a] relative overflow-hidden shadow-xl border border-gray-100">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#20a6eb]/5 blur-[80px]" />
                                <div className="relative z-10 space-y-8">
                                    <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                                        <h3 className="text-[10px] font-black tracking-[0.2em] flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-[#20a6eb]" /> Sector Analytics
                                        </h3>
                                        <span className="text-[8px] font-black text-[#20a6eb] tracking-widest bg-[#20a6eb]/10 px-2 py-0.5 rounded border border-[#20a6eb]/20">Active</span>
                                    </div>

                                    <div className="relative z-10">
                                        {renderSectorWidget()}
                                    </div>

                                    {/* Widget: Predictive Intelligence (Neural Fare Trajectory) */}
                                    {activeSubPage === 'deals' && (
                                        <div className="bg-[#20a6eb]/5 border border-[#20a6eb]/10 rounded-[2.5rem] p-8 relative overflow-hidden group mt-8">
                                            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                                                <svg width="100%" height="100%" className="absolute inset-0">
                                                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#20a6eb" strokeWidth="0.5" />
                                                    </pattern>
                                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                                </svg>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-xl bg-[#20a6eb]/20 flex items-center justify-center">
                                                        <Activity className="w-5 h-5 text-[#20a6eb]" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-[#20a6eb] tracking-wider">Neural Trajectory</span>
                                                </div>
                                                <h3 className="text-xl font-black text-[#1a1a1a] mb-1 tracking-tighter">Predictive Yield</h3>
                                                <p className="text-[10px] text-[#1a1a1a]/40 font-bold tracking-wider mb-6">48H Confidence Forecast</p>

                                                <div className="h-32 w-full mb-6 relative">
                                                    <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none">
                                                        <defs>
                                                            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                <stop offset="0%" stopColor="#20a6eb" stopOpacity="0.2" />
                                                                <stop offset="50%" stopColor="#20a6eb" stopOpacity="1" />
                                                                <stop offset="100%" stopColor="#e86420" stopOpacity="0.8" />
                                                            </linearGradient>
                                                        </defs>
                                                        <motion.path
                                                            initial={{ pathLength: 0, opacity: 0 }}
                                                            animate={{ pathLength: 1, opacity: 1 }}
                                                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                                            d="M0,60 Q50,20 100,50 T200,10"
                                                            fill="none"
                                                            stroke="url(#neuralGradient)"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                        />
                                                        <motion.circle
                                                            animate={{ cx: [0, 200], cy: [60, 10] }}
                                                            transition={{ duration: 4, repeat: Infinity }}
                                                            r="4"
                                                            fill="#e86420"
                                                        />
                                                    </svg>
                                                    <div className="absolute bottom-0 left-0 text-[8px] font-black text-black/20">NOW</div>
                                                    <div className="absolute bottom-0 right-0 text-[8px] font-black text-black/20">+48H</div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white/50 backdrop-blur-sm border border-[#20a6eb]/10 rounded-2xl p-3">
                                                        <div className="text-[8px] font-black text-black/30 tracking-wider mb-1">Confidence</div>
                                                        <div className="text-lg font-black text-[#20a6eb]">92.4%</div>
                                                    </div>
                                                    <div className="bg-white/50 backdrop-blur-sm border border-[#20a6eb]/10 rounded-2xl p-3">
                                                        <div className="text-[8px] font-black text-black/30 tracking-wider mb-1">Market Heat</div>
                                                        <div className="text-lg font-black text-[#e86420]">SCORCHING</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl text-[9px] font-black tracking-widest hover:bg-[#20a6eb] transition-all border-0 cursor-pointer shadow-xl">
                                        Request Deep Dive Report
                                    </button>
                                </div>
                            </div>

                            {/* Intelligence Signals */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm backdrop-blur-3xl">
                                <h3 className="text-[10px] font-black tracking-[0.2em] mb-6 flex items-center gap-2 text-[#1a1a1a]">
                                    <Bell className="w-4 h-4 text-[#e86420]" /> Critical Signals
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { type: 'Alert', text: 'New Point Devaluation: Major US Carrier', color: 'text-red-500' },
                                        { type: 'Update', text: 'Singapore Changi Biometrics Live in T3', color: 'text-[#20a6eb]' },
                                        { type: 'Signal', text: 'System Outage: Global Booking GDS', color: 'text-amber-600' }
                                    ].map((sig, i) => (
                                        <div key={i} className="flex gap-4 group cursor-pointer">
                                            <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:border-[#20a6eb]/30 transition-all">
                                                <History className={`w-4 h-4 ${sig.color}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black ${sig.color}`}>{sig.type}</span>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                    <span className="text-[8px] font-bold text-[#1a1a1a]/30">2m ago</span>
                                                </div>
                                                <p className="text-[11px] font-bold text-[#1a1a1a]/60 leading-tight group-hover:text-[#1a1a1a] transition-colors">{sig.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
