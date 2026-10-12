import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, X, Box, Zap, Sparkles } from 'lucide-react';

export const ThemeCustomizer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#6366f1'); // indigo-500
  
  const colors = [
    { name: 'Indigo Core', value: '#6366f1' },
    { name: 'Emerald Flux', value: '#10b981' },
    { name: 'Amber Surge', value: '#f59e0b' },
    { name: 'Ruby Thermal', value: '#ef4444' },
    { name: 'Cyan Cryo', value: '#06b6d4' },
  ];

  const updateColor = (color: string) => {
    setPrimaryColor(color);
    document.documentElement.style.setProperty('--primary', color);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[150]">
      <motion.button
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl group transition-all hover:border-indigo-500/50"
      >
        <Palette size={20} className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20, y: 20 }}
            className="absolute bottom-16 left-0 w-64 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest font-unique">Kernel Aesthetic</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X size={16} /></button>
            </div>

            <div className="space-y-4">
              <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Neural Aura Palette</p>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateColor(c.value)}
                    className="aspect-square rounded-lg border border-white/10 transition-transform hover:scale-110 active:scale-95"
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-indigo-400">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white uppercase tracking-tight">Adaptive UI</p>
                    <p className="text-[8px] text-zinc-500">Interface responds to load</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
