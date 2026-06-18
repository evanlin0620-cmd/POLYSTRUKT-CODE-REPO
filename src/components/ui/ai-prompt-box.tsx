import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, Terminal, FileUp, Mic } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PromptInputBoxProps {
  onSend: (text: string, files?: File[]) => void;
  className?: string;
  isLoading?: boolean;
  placeholder?: string;
}

export const PromptInputBox: React.FC<PromptInputBoxProps> = ({ onSend, className, isLoading, placeholder }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "relative rounded-3xl border transition-all duration-500 overflow-hidden",
        isFocused ? "bg-zinc-900 border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.15)] scale-[1.02]" : "bg-white/5 border-white/10",
        className
      )}
    >
      <div className="flex items-center gap-4 px-6 py-4">
        <div className={cn("transition-colors", isFocused ? "text-indigo-500" : "text-zinc-600")}>
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Terminal size={18} />
            </motion.div>
          ) : (
            <Sparkles size={18} />
          )}
        </div>
        
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || "Refine design or request simulation..."}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-white placeholder:text-zinc-700 py-2"
          disabled={isLoading}
          data-testid="workspace-prompt-input"
        />

        <div className="flex items-center gap-2">
           <button 
             type="button"
             onClick={() => (window as any).toggleVoiceHUD?.()}
             className="p-2 text-zinc-600 hover:text-white transition-colors"
           >
              <Mic size={18} />
           </button>
           <button 
             type="button"
             className="p-2 text-zinc-600 hover:text-white transition-colors"
           >
              <FileUp size={18} />
           </button>
           <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!text.trim() || isLoading}
            className={cn(
              "p-2.5 rounded-xl transition-all",
              text.trim() && !isLoading ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-zinc-700"
            )}
            data-testid="workspace-generate-btn"
           >
             <Send size={16} />
           </motion.button>
        </div>
      </div>
      
      {/* HUD line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent origin-center"
      />
    </form>
  );
};
