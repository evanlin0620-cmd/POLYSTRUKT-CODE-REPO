import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, LogOut, Activity, Flame } from 'lucide-react';

interface InactivityWarningProps {
  secondsLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const InactivityWarning: React.FC<InactivityWarningProps> = ({
  secondsLeft,
  onExtend,
  onLogout,
}) => {
  // Format remaining seconds into MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Calculate progress circle stroke-dashoffset
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = secondsLeft / 300; // 5 min max
  const strokeOffset = circumference - progress * circumference;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md selection:bg-rose-500/30">
      {/* Background aesthetic details */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden p-8 shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_50px_rgba(244,63,94,0.08)] relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600" />

        {/* Content Header */}
        <div className="flex flex-col items-center text-center mt-4">
          <div className="h-16 w-16 mb-6 flex items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 relative">
            <ShieldAlert size={28} className="animate-pulse" />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-wider text-rose-500 font-unique leading-tight">
            Security Idle Protocol
          </h2>
          <p className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-[0.25em] mt-1.5">
            Auto-Disconnect Suspense
          </p>
        </div>

        {/* Beautifulmonospaced countdown visualizers */}
        <div className="my-8 flex justify-center items-center gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-white/5">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Countdown circular track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="4"
                fill="transparent"
              />
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-rose-500"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame size={18} className="text-rose-500/60 animate-bounce" />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-3xl font-black font-mono text-white tracking-widest tabular-nums animate-pulse">
              {formattedTime}
            </span>
            <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest mt-1">
              Time Remaining
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 text-center leading-relaxed font-semibold uppercase mb-8 max-w-[90%] mx-auto">
          You have been inactive for over <span className="text-white">25 minutes</span>. To secure your session, you will be automatically logged out of your workspaces unless active protocol is refreshed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onExtend}
            className="w-full rounded-2xl bg-white text-black font-black p-5 text-[10px] uppercase tracking-[0.25em] transition-all hover:bg-zinc-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <Activity size={12} className="text-black" />
            <span>Extend Session</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full rounded-2xl bg-zinc-900/50 hover:bg-rose-950/20 text-zinc-400 hover:text-rose-400 font-bold p-4 text-[10px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/5 hover:border-rose-500/20 active:scale-95"
          >
            <LogOut size={11} />
            <span>Disconnect Now</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
