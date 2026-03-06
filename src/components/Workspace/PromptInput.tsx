import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Send, Terminal, Sparkles, Wand2 } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onSurpriseMe: () => void;
  isGenerating: boolean;
  isShaking: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, onPromptChange, onGenerate, onSurpriseMe, isGenerating, isShaking }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-40">
      <motion.div
        layout
        className="bg-white/95 backdrop-blur-2xl border border-zinc-200 rounded-3xl p-4 shadow-2xl flex flex-col gap-3"
        animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
        transition={{ type: 'spring', stiffness: 500, damping: 20, mass: 0.5 }}
      >
        <div className="flex items-end gap-4 px-2">
          <div className="p-2.5 bg-zinc-900 rounded-2xl text-white shadow-lg mb-1">
            <Cpu size={20} className={isGenerating ? "animate-spin" : ""} />
          </div>
          <div className="flex-1">
            <label htmlFor="workspace-input" className="sr-only">Generation Prompt</label>
            <textarea
              data-testid="workspace-prompt-input"
              ref={inputRef}
              id="workspace-input"
              rows={1}
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the mechanics you wish to synthesize..."
              className="w-full bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-400 text-lg font-bold font-unique resize-none overflow-hidden py-2"
            />
          </div>
          <button
            onClick={onSurpriseMe}
            className="p-4 rounded-2xl bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-all mb-1"
          >
            <Wand2 size={20} />
          </button>
          <button
            data-testid="workspace-generate-btn"
            onClick={onGenerate}
            disabled={isGenerating}
            className={`p-4 rounded-2xl transition-all mb-1 ${(!prompt.trim() || isGenerating) ? 'bg-zinc-100 text-zinc-300' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20 active:scale-95'}`}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="flex items-center justify-between px-2 pt-1 border-t border-zinc-50">
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-2 opacity-40"><Terminal size={12} /><span className="text-[10px] font-mono uppercase tracking-widest font-bold">Scientific Kernel v2</span></div>
             <div className="hidden sm:flex items-center gap-2 opacity-40"><Sparkles size={12} /><span className="text-[10px] font-mono uppercase tracking-widest font-bold">Auto-Topology</span></div>
          </div>
          <div className="text-[9px] font-mono text-zinc-400 font-bold flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />CORE_SYNC: 99.4%</div>
        </div>
      </motion.div>
    </div>
  );
};