import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, Terminal, Cpu, Mic } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RuixenMoonChatProps {
  onSend: (text: string) => void;
  className?: string;
}

export default function RuixenMoonChat({ onSend, className }: RuixenMoonChatProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  const suggestions = [
    "Design a light-weight drone frame with bionic structures.",
    "Generate a planetary gearbox housing for high torque.",
    "Optimize a heat sink for forced convection cooling.",
    "Create a suspension link for an electric ATV."
  ];

  return (
    <div className={cn("w-full max-w-4xl px-6 flex flex-col items-center gap-16", className)}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] font-unique shadow-sm">
          <Terminal size={14} />
          Terminal Session 0x7F
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tightest uppercase font-unique leading-[0.8] text-white">
          Thought <br/> <span className="text-zinc-600">To form.</span>
        </h1>
        <p className="max-w-xl mx-auto text-sm md:text-base text-zinc-500 font-medium font-technical uppercase tracking-tight leading-relaxed">
          Describe the geometric constraints and performance targets. <br/> 
          Our neural engine will synthesize the optimal topology.
        </p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="w-full relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity" />
        <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] p-2 flex items-center shadow-2xl">
          <div className="pl-6 pr-4 text-zinc-500">
            <Cpu size={24} />
          </div>
          <input 
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your design requirements..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium text-white placeholder:text-zinc-600 py-6"
          />
          <div className="flex items-center gap-2 mr-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => (window as any).toggleVoiceHUD?.()}
              className="p-4 bg-zinc-800 text-zinc-400 rounded-[1.5rem] hover:text-white hover:bg-zinc-700 transition-all shadow-xl"
            >
              <Mic size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="p-5 bg-white text-zinc-950 rounded-[2rem] hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
              disabled={!text.trim()}
            >
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block font-unique">Synthesize</span>
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </motion.form>

      <div className="flex flex-wrap justify-center gap-3">
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setText(s)}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all font-unique"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
