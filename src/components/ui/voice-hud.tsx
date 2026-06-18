import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Waves, Volume2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VoiceHUDProps {
  isListening: boolean;
  onStop: () => void;
  className?: string;
}

export const VoiceHUD: React.FC<VoiceHUDProps> = ({ isListening, onStop, className }) => {
  const [amplitude, setAmplitude] = useState<number[]>(new Array(20).fill(0));

  useEffect(() => {
    if (!isListening) return;

    const interval = setInterval(() => {
      setAmplitude(new Array(20).fill(0).map(() => Math.random() * 100));
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={cn(
            "fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-8 py-6 rounded-[2.5rem] bg-indigo-600 shadow-[0_0_50px_rgba(79,70,229,0.5)] border border-indigo-400/50 flex flex-col items-center gap-6",
            className
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Mic size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest font-unique">Neural Audio Protocol</h3>
              <p className="text-[10px] text-indigo-100 font-mono uppercase tracking-[0.2em] opacity-70">Awaiting Engineering Command...</p>
            </div>
          </div>

          <div className="flex items-end gap-1 h-12 w-64 px-4">
            {amplitude.map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: `${20 + h * 0.8}%` }}
                className="flex-1 bg-white/40 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            ))}
          </div>

          <button 
            onClick={onStop}
            className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-50 transition-colors shadow-xl"
          >
            End Command Session
          </button>

          {/* HUD Background Decorations */}
          <div className="absolute inset-0 -z-10 bg-indigo-500 blur-3xl opacity-20 pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
