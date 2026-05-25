import React from 'react';
import { Bell, Info, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  key?: any;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  onClose: () => void;
}

export default function CustomNotification({ message, type, onClose }: ToastProps) {
  const bgStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.15)] focus-glow-emerald',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.15)] focus-glow-amber',
    info: 'bg-cyan-50 text-cyan-800 border-cyan-200 shadow-[0_4px_20px_rgba(6,182,212,0.15)] focus-glow-cyan',
    error: 'bg-rose-50 text-rose-800 border-rose-200 shadow-[0_4px_20px_rgba(244,63,94,0.15)] focus-glow-rose',
  };

  const IconMap = {
    success: <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-600 shrink-0" />,
    error: <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed top-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl border max-w-sm md:max-w-md pointer-events-auto ${bgStyles[type]}`}
      id={`toast-${type}`}
    >
      <div className="pt-0.5">{IconMap[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        aria-label="Close"
        className="text-xs font-semibold px-2 py-1 rounded bg-black/5 hover:bg-black/10 transition-colors cursor-pointer shrink-0 ml-2"
      >
        Dismiss
      </button>
    </motion.div>
  );
}
