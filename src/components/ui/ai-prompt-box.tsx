import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Terminal, 
  FileUp, 
  Mic, 
  Zap, 
  Shield, 
  Cpu, 
  Compass, 
  Wrench, 
  ChevronUp, 
  ChevronDown,
  X,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { QuickStartTemplateLibrary } from '../QuickStartTemplateLibrary';
import { QUICK_START_TEMPLATES } from '../../data/quickStartTemplates';

interface PromptInputBoxProps {
  onSend: (text: string, files?: File[]) => void;
  className?: string;
  isLoading?: boolean;
  placeholder?: string;
}

export const PromptInputBox: React.FC<PromptInputBoxProps> = ({ onSend, className, isLoading, placeholder }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showTemplatesDrawer, setShowTemplatesDrawer] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
      setShowTemplatesDrawer(false);
    }
  };

  const handleAppendConstraint = (constraintText: string) => {
    setText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return constraintText;
      if (trimmed.toLowerCase().includes(constraintText.toLowerCase())) return trimmed;
      return `${trimmed}, ${constraintText}`;
    });
  };

  const handleSelectTemplate = (templatePrompt: string, autoSend = false) => {
    if (autoSend) {
      onSend(templatePrompt);
      setShowTemplatesDrawer(false);
    } else {
      setText(templatePrompt);
    }
  };

  return (
    <div className={cn("relative flex flex-col gap-2 font-sans", className)}>
      
      {/* Expandable Quick Start Drawer */}
      <AnimatePresence>
        {showTemplatesDrawer && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-h-[60vh] overflow-y-auto custom-scrollbar bg-zinc-950/95 border border-white/15 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl mb-1"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                  <Zap size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Quick Start Templates & Engineering Rules
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesDrawer(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <QuickStartTemplateLibrary
              onSelectTemplate={handleSelectTemplate}
              onAddConstraint={handleAppendConstraint}
              currentPromptText={text}
              onClose={() => setShowTemplatesDrawer(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Box */}
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "relative rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xl backdrop-blur-xl",
          isFocused ? "bg-zinc-900 border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.15)]" : "bg-zinc-950/85 border-white/15"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-3.5">
          <div className={cn("transition-colors shrink-0", isFocused ? "text-indigo-400" : "text-zinc-500")}>
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
            placeholder={placeholder || "Refine geometry, adjust load rating, or request FEA simulation..."}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-white placeholder:text-zinc-500 py-1"
            disabled={isLoading}
            data-testid="workspace-prompt-input"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Start Templates Toggle Button */}
            <button
              type="button"
              onClick={() => setShowTemplatesDrawer(prev => !prev)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                showTemplatesDrawer 
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
              )}
              title="Quick Start Template Library"
            >
              <Zap size={13} className="text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Templates</span>
              {showTemplatesDrawer ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>

            <button 
              type="button"
              onClick={() => (window as any).toggleVoiceHUD?.()}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              title="Voice Input"
            >
              <Mic size={16} />
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!text.trim() || isLoading}
              className={cn(
                "p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center",
                text.trim() && !isLoading ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg" : "bg-white/5 text-zinc-600 opacity-60"
              )}
              data-testid="workspace-generate-btn"
            >
              <Send size={15} />
            </motion.button>
          </div>
        </div>

        {/* Quick Shape Chips Bar */}
        <div className="px-4 pb-2.5 pt-1 border-t border-white/5 flex items-center justify-between gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <span className="text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Layers size={10} /> Quick Shapes:
            </span>
            {QUICK_START_TEMPLATES.slice(0, 4).map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelectTemplate(template.prompt, false)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 text-zinc-400 border border-white/5 transition-all shrink-0 cursor-pointer"
                title={template.name}
              >
                {template.shortName}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 text-zinc-500 shrink-0">
            <button
              type="button"
              onClick={() => handleAppendConstraint('Watertight CSG Solid')}
              className="hover:text-zinc-300 transition-colors"
            >
              +Watertight
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleAppendConstraint('5-Axis CNC Clearances')}
              className="hover:text-zinc-300 transition-colors"
            >
              +5-Axis CNC
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleAppendConstraint('ISO 2768-m')}
              className="hover:text-zinc-300 transition-colors"
            >
              +ISO 2768-m
            </button>
          </div>
        </div>
        
        {/* HUD Glow line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent origin-center"
        />
      </form>
    </div>
  );
};
