import React from 'react';
import { Logo } from './Logo';
import { Sparkles, Users, FileText, CheckCircle, TrendingUp, Compass, ArrowRight, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Topic, Article, WorkflowConfig } from '../types';

interface OverviewHubProps {
  topics: Topic[];
  articles: Article[];
  config: WorkflowConfig;
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function OverviewHub({ topics, articles, config, onGetStarted, onSignIn }: OverviewHubProps) {
  // Compute some dynamic operational values to make the landing page live and reactive!
  const totalSubmissions = articles.filter(a => a.status !== 'Draft').length;
  const approvalsList = articles.filter(a => a.status === 'Approved' || a.status === 'Published');
  
  // Calculate default values or actual averages
  const avgScore = totalSubmissions > 0 
    ? Math.round(articles.reduce((acc, a) => acc + (a.score || 0), 0) / articles.length)
    : 84;

  const activeTopicsPool = topics.filter(t => t.status === 'Active' && !t.claimedById).length;

  return (
    <div className="min-h-screen radial-blur-bg text-[#363636] flex flex-col items-center overflow-x-hidden font-sans relative">
      
      {/* Dynamic top gradient line to give that premium radar neon glow */}
      <div className="w-full h-1 bg-gradient-to-r from-[#20a6eb] via-[#e86420] to-[#363636]" />

      {/* Floating decorative elements resembling the soft blurs and orange spheres in the screenshot */}
      <div className="absolute top-[20%] right-[10%] w-32 h-32 rounded-full bg-[#e86420] opacity-10 blur-2xl pointer-events-none" />
      <div className="absolute top-[50%] left-[-5%] w-60 h-60 rounded-full bg-[#20a6eb] opacity-[0.08] blur-3xl pointer-events-none" />

      {/* Primary Landing Page Header */}
      <header className="w-full max-w-7xl px-6 md:px-12 h-20 flex items-center justify-between z-10 sticky top-0 bg-white/40 backdrop-blur-md border-b border-slate-200/50">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={onGetStarted}>
          <Logo className="w-9 h-9 group-hover:scale-105 transition-all" />
          <span className="text-xl font-extrabold tracking-tight font-display text-[#363636]">
            RadarDesk
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <button 
            onClick={onSignIn}
            className="text-sm font-semibold text-[#363636]/80 hover:text-[#e86420] transition-colors cursor-pointer"
          >
            Sign in
          </button>
          
          <button 
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-gradient-to-r from-[#20a6eb] to-[#e86420] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer border-0"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="w-full max-w-7xl px-6 md:px-12 py-10 md:py-16 xl:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* Hero Left Content Column */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 md:space-y-8 max-w-2xl">
          
          {/* Badge indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#e86420] animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500">
              Powered by AI editorial pre-validation
            </span>
          </div>

          {/* Typography Pairings Headline */}
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-black font-display text-[#363636] leading-[1.1] tracking-tight">
            The editorial <br />
            workflow that <br />
            <span className="text-[#20a6eb]">eliminates </span> <br className="xs:hidden" />
            <span className="text-[#20a6eb]">redu</span>
            <span className="text-slate-400 font-bold">ndant</span>{' '}
            <span className="text-[#e86420]">reviews</span>.
          </h1>

          {/* Subtitle / pitch */}
          <p className="text-sm md:text-base text-slate-500 leading-relaxed font-normal max-w-lg">
            RadarDesk enforces editorial standards, assigns one editor per article, and uses AI to pre-validate quality before submission — so your team ships faster with consistent standards.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 bg-gradient-to-r from-[#20a6eb] to-[#e86420] text-white rounded-xl text-sm font-extrabold shadow-xl hover:shadow-orange-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer border-0"
            >
              Start writing
            </button>
            <button
              onClick={onSignIn}
              className="px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-extrabold text-[#363636] hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              Sign in
            </button>
          </div>

          {/* Display mini quick indicators */}
          <div className="flex items-center gap-6 pt-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span>{activeTopicsPool} active concepts waiting</span>
            </div>
            <span>•</span>
            <div>
              <span>SLA Target: &lt;15 mins</span>
            </div>
          </div>

        </div>

        {/* Hero Right Visual Column - Airplane Window View with Circular overlay */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          
          {/* Circular decorations mimicking the orange balloons behind */}
          <div className="absolute -top-6 right-4 w-16 h-16 rounded-full bg-[#e86420] opacity-80 shadow-lg pointer-events-none transform translate-x-4 -translate-y-2" />
          <div className="absolute top-1/4 right-0 w-8 h-8 rounded-full bg-[#e86420]/80 shadow-md pointer-events-none transform translate-x-12" />

          {/* Airplane wing image nested in an elegant double circular layer */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full p-2 bg-white/80 border border-slate-200/50 shadow-2xl relative overflow-hidden flex items-center justify-center">
            
            {/* Inner frame containing high res flight wing from Unsplash */}
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000" 
                alt="RadarDesk Flight Wing Window" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-110 hover:scale-105 transition-transform duration-1000"
              />
              {/* Soft visual overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#20a6eb]/20 via-transparent to-[#e86420]/10 mix-blend-multiply pointer-events-none" />
            </div>

            {/* Abstract clean visual glass overlay badge */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-100 shadow-lg text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-50 text-sky-500">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Dynamic Flight Catalog</h4>
                  <p className="text-[9px] text-slate-400 font-mono">Routing active coverage live</p>
                </div>
              </div>
            </div>

          </div>

          {/* Floating abstract glowing radar ring around the block */}
          <div className="absolute inset-0 border-2 border-dashed border-[#20a6eb]/20 rounded-full scale-105 animate-spin-slow pointer-events-none" />

        </div>

      </main>

      {/* THREE DETAIL CARDS GRID */}
      <section className="w-full max-w-7xl px-6 md:px-12 py-12 md:py-20 z-10 border-t border-slate-200/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: AI pre-validation */}
          <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200/85 hover:border-[#20a6eb]/40 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-11 h-11 rounded-xl bg-[#20a6eb]/10 flex items-center justify-center text-[#20a6eb] mb-5 group-hover:bg-[#20a6eb] group-hover:text-white transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#363636] font-display mb-3">AI pre-validation</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Every draft scored on grammar, readability, and source quality before reaching an editor's queue.
            </p>
          </div>

          {/* Card 2: One editor, no clashes */}
          <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200/85 hover:border-[#e86420]/40 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-11 h-11 rounded-xl bg-[#e86420]/10 flex items-center justify-center text-[#e86420] mb-5 group-hover:bg-[#e86420] group-hover:text-white transition-all">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#363636] font-display mb-3">One editor, no clashes</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Strict single-editor assignment with audit trail. No two editors review the same article simultaneously.
            </p>
          </div>

          {/* Card 3: Structured feedback */}
          <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200/85 hover:border-slate-300 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-5 group-hover:bg-[#363636] group-hover:text-white transition-all">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#363636] font-display mb-3">Structured feedback</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Mandatory rejection reasons. Rejected articles return to the same editor for at most two cycles.
            </p>
          </div>

        </div>
      </section>

      {/* METRICS PANEL: "Built for content teams of every size" */}
      <section className="w-full max-w-7xl px-6 md:px-12 pb-16 md:pb-24 z-10">
        
        {/* Rounded Banner Wrapper with nice background gradient from screenshot */}
        <div className="firebase-gradient p-0.5 rounded-3xl shadow-xl overflow-hidden">
          <div className="radial-blur-bg bg-white/95 px-6 py-10 md:p-12 rounded-[22px] flex flex-col space-y-8">
            
            {/* Header portion */}
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-black font-display text-[#363636]">
                Built for content <span className="text-[#20a6eb]">teams</span> of <span className="text-[#e86420]">every size</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md">Approved articles transition immediately to content flight operations.</p>
            </div>

            {/* 3 columns stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">

              {/* Stat 1 */}
              <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 rounded-xl bg-[#e86420]/15 text-[#e86420]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#363636] font-mono">
                    &le;{config?.maxReviewCycles || 2}
                  </div>
                  <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    Review cycles per article
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#363636] font-mono">
                    50%+
                  </div>
                  <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    Faster turnaround
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white/80 p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
                <div className="p-3.5 rounded-xl bg-[#20a6eb]/15 text-[#20a6eb]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#363636] font-mono">
                    {avgScore}&ndash;100
                  </div>
                  <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    AI quality score per draft
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* Footer layout */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-400 mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} RadarDesk Systems. Professional Polish Enterprise Theme.</p>
          <div className="flex items-center gap-3.5 text-[10px] font-mono">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Gateway OK</span>
            <span>API Time SLA: &lt;112ms</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
