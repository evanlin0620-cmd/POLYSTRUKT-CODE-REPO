import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, FileText, X, Check } from 'lucide-react';
import { LegalTab } from './LegalModal';

interface CookieConsentBannerProps {
  onOpenLegal: (tab: LegalTab) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenLegal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('polystrukt_cookie_consent');
    if (!consent) {
      // Smooth appearance shortly after page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('polystrukt_cookie_consent', 'accepted_all');
    localStorage.setItem('polystrukt_cookie_consent_time', new Date().toISOString());
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('polystrukt_cookie_consent', 'essential_only');
    localStorage.setItem('polystrukt_cookie_consent_time', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-[220] rounded-xl bg-[#080c14]/95 border border-zinc-800 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(16,185,129,0.08)] backdrop-blur-xl text-white font-sans overflow-hidden ring-1 ring-white/10"
        role="region"
        aria-label="Privacy & Cookie Notice"
      >
        {/* Subtle top indicator bar */}
        <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800/80 bg-zinc-900/50 text-[8.5px] font-mono text-zinc-400 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="font-bold text-zinc-300">PRIVACY & STORAGE NOTICE</span>
          </div>
          <span className="text-emerald-400 font-medium">ZERO AD TRACKERS</span>
        </div>

        <div className="p-3.5 flex items-start gap-3">
          {/* Compact Shield Icon */}
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner mt-0.5">
            <ShieldCheck size={16} />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[11px] font-bold font-mono text-zinc-100 flex items-center gap-1.5">
                <span>Privacy & Data Choices</span>
              </h4>
              <button
                onClick={handleEssentialOnly}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors hover:bg-zinc-800 shrink-0"
                aria-label="Dismiss notice"
              >
                <X size={13} />
              </button>
            </div>

            {/* Simple, non-complex explanation */}
            <p className="text-[10.5px] text-zinc-300/90 leading-normal font-sans">
              We only use essential local storage to keep you signed in and save your 3D models. We never sell your data, use ad trackers, or train AI on your private CAD work.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleAcceptAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-mono text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95"
              >
                <Check size={12} strokeWidth={3} />
                <span>Accept</span>
              </button>

              <button
                onClick={handleEssentialOnly}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[10px] font-medium uppercase tracking-wider border border-zinc-700/70 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Lock size={11} className="text-zinc-400" />
                <span>Essential Only</span>
              </button>

              <button
                onClick={() => onOpenLegal('privacy')}
                className="flex items-center gap-1 px-2 py-1.5 text-zinc-400 hover:text-emerald-400 font-mono text-[9.5px] uppercase tracking-wider transition-colors ml-auto underline decoration-zinc-700 underline-offset-2 hover:decoration-emerald-400"
              >
                <FileText size={11} />
                <span>Privacy Policy</span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
