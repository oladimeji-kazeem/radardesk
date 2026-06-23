import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
    MessageSquare,
    Star,
    Send,
    AlertCircle,
    CheckCircle2,
    Info,
    Bug,
    Layout,
    Zap,
    HelpCircle,
    X,
    Activity,
    RefreshCw
} from 'lucide-react';
import { supabase, isStandalone } from '../lib/supabase';

interface UATFormProps {
    currentUser: User | null;
    onClose: () => void;
    onAddToast: (msg: string, type: 'success' | 'warning' | 'info' | 'error') => void;
    isInline?: boolean;
}

export default function UATForm({ currentUser, onClose, onAddToast, isInline = false }: UATFormProps) {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [feedbackType, setFeedbackType] = useState<string>('Suggestion');
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            onAddToast('Please provide a star rating.', 'warning');
            return;
        }
        if (!comments.trim()) {
            onAddToast('Please provide some descriptive feedback.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const browserInfo = `${navigator.userAgent} (${navigator.language})`;

            if (isStandalone()) {
                const { error } = await supabase.from('uat_feedback').insert({
                    user_id: currentUser?.id || 'Anonymous',
                    user_name: currentUser?.name || 'Anonymous Tester',
                    user_role: currentUser?.role || 'Guest',
                    rating,
                    feedback_type: feedbackType,
                    comments,
                    browser_info: browserInfo
                });

                if (error) throw error;

                setSubmitted(true);
                onAddToast('UAT Feedback submitted successfully! [Standalone Mode]', 'success');
                setTimeout(() => onClose(), 3000);
            } else {
                const res = await fetch('/api/uat/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser?.id || 'Anonymous',
                        userName: currentUser?.name || 'Anonymous Tester',
                        userRole: currentUser?.role || 'Guest',
                        rating,
                        feedbackType,
                        comments,
                        browserInfo
                    })
                });

                if (res.ok) {
                    setSubmitted(true);
                    onAddToast('UAT Feedback submitted successfully! Thank you for your contribution.', 'success');
                    setTimeout(() => onClose(), 3000);
                } else {
                    const error = await res.json();
                    onAddToast(error.error || 'Failed to submit feedback.', 'error');
                }
            }
        } catch (err: any) {
            onAddToast(err.message || 'Network error while submitting feedback.', 'error');
        } finally {
            setIsSubmitting(true); // Keep spinner if submitted until close
            if (!submitted) setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className={isInline ? "" : "fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn"}>
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 border border-white/20 mx-auto">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 font-display">Feedback Received!</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Your technical feedback has been injected into the RadarDesk UAT logs. We appreciate your assistance in hardening the operational environment.
                    </p>
                    <div className="pt-4">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all active:scale-[0.98]"
                        >
                            Back to Workspace
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={isInline ? "" : "fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn"}>
            <div className={`bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden border border-white/20 mx-auto ${isInline ? 'min-h-[600px]' : ''}`}>

                {/* Sidebar Info */}
                <div className="md:w-1/3 bg-slate-900 p-8 text-white space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10">
                        <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-black font-display leading-tight">RadarDesk<br />UAT Feedback</h2>
                        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                            Help us refine the editorial workflow. Report performance lag, UI inconsistencies, or suggest logic improvements.
                        </p>

                        <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <div className="text-[10px]">
                                    <span className="block font-bold text-white uppercase tracking-wider">Fast Capture</span>
                                    <span className="text-slate-500">Submissions are logged in real-time.</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-sky-500/10 p-1.5 rounded-lg">
                                    <Layout className="w-3.5 h-3.5 text-sky-400" />
                                </div>
                                <div className="text-[10px]">
                                    <span className="block font-bold text-white uppercase tracking-wider">Environment logs</span>
                                    <span className="text-slate-500">Browser and device context included.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="flex-1 p-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div>
                            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Overall Experience</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-all transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${(hoverRating || rating) >= star
                                                ? 'fill-amber-400 text-amber-400 shadow-amber-200'
                                                : 'text-slate-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">Issue Category</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['Suggestion', 'Bug Report', 'UI/UX Issue', 'Performance'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFeedbackType(type)}
                                            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-2 ${feedbackType === type
                                                ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-200'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            {type === 'Bug Report' && <Bug className="w-3.5 h-3.5" />}
                                            {type === 'Suggestion' && <Zap className="w-3.5 h-3.5" />}
                                            {type === 'UI/UX Issue' && <Layout className="w-3.5 h-3.5" />}
                                            {type === 'Performance' && <Activity className="w-3.5 h-3.5" />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 flex flex-col h-full">
                                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">Detailed Feedback</label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Describe your testing observations, errors encountered, or requested improvements..."
                                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs outline-none focus:border-slate-400 focus:bg-white transition-all resize-none font-sans"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Info className="w-3.5 h-3.5" />
                                <span>Tester: {currentUser?.name || 'Guest'} ({currentUser?.role || 'Operator'})</span>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                )}
                                <span>Dispatch Feedback</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
