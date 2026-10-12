import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Mic, 
  Layers, 
  Shield, 
  Flame, 
  Compass, 
  Box, 
  Zap, 
  Sliders, 
  ChevronRight, 
  Activity, 
  ArrowRight, 
  Code2, 
  Workflow, 
  Check, 
  SlidersHorizontal, 
  Wrench,
  Layers2,
  Anchor,
  CircleDot,
  Plus,
  Disc,
  X
} from 'lucide-react';
import { QuickStartTemplateLibrary } from '../QuickStartTemplateLibrary';
import { QUICK_START_TEMPLATES, ENGINEERING_CONSTRAINT_GROUPS, QuickStartTemplate } from '../../data/quickStartTemplates';
import { cn } from '../../lib/utils';

interface RuixenMoonChatProps {
  onSend: (text: string) => void;
  className?: string;
}

const TYPEWRITER_PROMPTS = [
  "Design an articulated mechanical robotic arm link (220mm reach) with dual-clevis knuckle joints...",
  "Model an inline dual-cylinder engine block with 68mm bore and perimeter water jacket...",
  "Synthesize a high-load triangular Warren spaceframe structural truss with 12mm clevis lugs...",
  "Design a heavy-duty 90° structural L-bracket (80x80x40mm) with stiffening gusset and M6 holes...",
  "Model a split gearbox housing for 3:1 planetary stage with 608RS bearing seats..."
];

const PROMPT_QUICK_SHAPES = [
  { label: 'Mechanical Arm', templateId: 'mechanical-arm', icon: Workflow },
  { label: 'Engine Block', templateId: 'engine-block', icon: Cpu },
  { label: 'Structural Truss', templateId: 'structural-truss', icon: Shield },
  { label: 'L-Bracket', templateId: 'l-bracket', icon: Box },
  { label: 'Gearbox Housing', templateId: 'gearbox-housing', icon: Disc },
  { label: 'Aerodynamic Foil', templateId: 'aero-foil', icon: Compass },
  { label: 'Flanged Fitting', templateId: 'flanged-pipe', icon: Anchor },
  { label: 'Shaft Coupler', templateId: 'shaft-coupler', icon: CircleDot },
  { label: 'PCB Enclosure', templateId: 'pcb-enclosure', icon: Layers }
];

const DEFAULT_ENGINEERING_CONSTRAINTS = [
  "Watertight CSG Solid",
  "ISO 2768-m",
  "5-Axis CNC Clearances",
  "Stress Fillets R2.5mm",
  "Wall Thickness ≥ 3.5mm",
  "Al-6061-T6 Billet",
  "Ti-6Al-4V Grade 5"
];

export default function RuixenMoonChat({ onSend, className }: RuixenMoonChatProps) {
  const [text, setText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<QuickStartTemplate | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [displayedPrompt, setDisplayedPrompt] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect for placeholder
  useEffect(() => {
    const currentTarget = TYPEWRITER_PROMPTS[promptIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedPrompt.length < currentTarget.length) {
        timer = setTimeout(() => {
          setDisplayedPrompt(currentTarget.slice(0, displayedPrompt.length + 1));
        }, 28);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2800);
      }
    } else {
      if (displayedPrompt.length > 0) {
        timer = setTimeout(() => {
          setDisplayedPrompt(currentTarget.slice(0, displayedPrompt.length - 1));
        }, 14);
      } else {
        setIsDeleting(false);
        setPromptIndex((prev) => (prev + 1) % TYPEWRITER_PROMPTS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedPrompt, isDeleting, promptIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      setSelectedTemplate(null);
    }
  };

  const handleAppendConstraint = (constraintText: string) => {
    setText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return constraintText;
      if (trimmed.toLowerCase().includes(constraintText.toLowerCase())) {
        // If already present, don't duplicate
        return trimmed;
      }
      return `${trimmed}, ${constraintText}`;
    });
  };

  const handleApplyAllTemplateConstraints = () => {
    if (!selectedTemplate) return;
    setText((prev) => {
      let current = prev.trim();
      selectedTemplate.recommendedConstraints.forEach((c) => {
        if (!current.toLowerCase().includes(c.toLowerCase())) {
          current = current ? `${current}, ${c}` : c;
        }
      });
      return current;
    });
  };

  const handleSelectTemplate = (templatePrompt: string, autoSend = false, template?: QuickStartTemplate) => {
    const matched = template || QUICK_START_TEMPLATES.find(t => t.prompt === templatePrompt);
    if (matched) {
      setSelectedTemplate(matched);
    }
    if (autoSend) {
      onSend(templatePrompt);
      setText('');
      setSelectedTemplate(null);
    } else {
      setText(templatePrompt);
    }
  };

  const handleQuickShapeClick = (templateId: string) => {
    const found = QUICK_START_TEMPLATES.find(t => t.id === templateId);
    if (found) {
      setSelectedTemplate(found);
      setText(found.prompt);
    }
  };

  // The active constraint suggestions are customized based on selected template
  const activeConstraintSuggestions = selectedTemplate 
    ? selectedTemplate.recommendedConstraints 
    : DEFAULT_ENGINEERING_CONSTRAINTS;

  return (
    <div className={cn("w-full max-w-5xl px-4 py-8 flex flex-col items-center gap-6 selection:bg-indigo-500/30 font-sans", className)}>
      
      {/* 1. Thoughts to Form - Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full flex flex-col items-center text-center space-y-2.5"
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/10 shadow-sm backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-300">
            THOUGHTS TO FORM
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">•</span>
          <span className="text-[10px] font-mono text-indigo-300">
            CSG & ISO 2768-m
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            Parametric <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">CAD Studio</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Synthesize solid 3D models with verified geometry. Choose from common mechanical archetypes like <strong>L-brackets</strong>, <strong>Gearbox housings</strong>, or <strong>Aerodynamic foils</strong>, or write custom parametric specs.
          </p>
        </div>
      </motion.div>

      {/* 2. Main Prompt Box Console */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="w-full"
      >
        <form 
          onSubmit={handleSubmit}
          className="relative bg-zinc-900/95 border border-white/15 rounded-2xl p-3.5 shadow-2xl backdrop-blur-2xl transition-all focus-within:border-indigo-500/60 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.15)] group"
        >
          {/* Quick Shape Presets Ribbon inside Prompt Box */}
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/5 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider shrink-0 flex items-center gap-1">
              <Zap size={11} /> Quick Shapes:
            </span>
            {PROMPT_QUICK_SHAPES.map((shape) => {
              const Icon = shape.icon;
              const isCurrent = selectedTemplate?.id === shape.templateId;
              return (
                <button
                  key={shape.templateId}
                  type="button"
                  onClick={() => handleQuickShapeClick(shape.templateId)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
                    isCurrent
                      ? "bg-indigo-600/30 border-indigo-500/60 text-white shadow-xs font-semibold"
                      : "bg-zinc-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/30 text-zinc-300 hover:text-white border-white/5"
                  )}
                  title={`Load verified ${shape.label} template & constraint rules`}
                >
                  <Icon size={12} className={isCurrent ? "text-indigo-300" : "text-indigo-400"} />
                  <span>{shape.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Template Context Bar (Shown when a CAD template is selected) */}
          {selectedTemplate && (
            <div className="mb-2.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
                  {selectedTemplate.shortName}
                </span>
                <span className="text-[11px] text-zinc-300 truncate hidden sm:inline">
                  {selectedTemplate.keyDimensions} • {selectedTemplate.material}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono hidden md:inline">
                  {selectedTemplate.loadRating}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyAllTemplateConstraints}
                  className="px-2 py-0.5 rounded bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-500/30 text-indigo-200 hover:text-white text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1"
                  title="Apply all recommended engineering constraints for this template"
                >
                  <Sparkles size={10} />
                  <span>Apply All Suggestions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title="Dismiss template binding"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Prompt Input Row */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="text-zinc-500 group-focus-within:text-indigo-400 transition-colors shrink-0">
              <Code2 size={22} />
            </div>
            
            <input 
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={displayedPrompt || "Describe component geometry, load paths, or mechanical constraints..."}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm sm:text-base font-medium text-white placeholder:text-zinc-500 py-2"
            />

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => (window as any).toggleVoiceHUD?.()}
                className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-white/5 transition-all cursor-pointer"
                title="Voice Dictation"
              >
                <Mic size={16} />
              </button>

              <button
                type="submit"
                disabled={!text.trim()}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <span>Synthesize</span>
                <Send size={13} />
              </button>
            </div>
          </div>

          {/* Engineering Constraints Selector Chips Bar */}
          <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2 px-1 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Wrench size={10} /> {selectedTemplate ? `${selectedTemplate.shortName} Constraints:` : "Constraints:"}
              </span>
              {activeConstraintSuggestions.map((constraint) => {
                const isActive = text.toLowerCase().includes(constraint.toLowerCase());
                return (
                  <button
                    key={constraint}
                    type="button"
                    onClick={() => handleAppendConstraint(constraint)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-mono transition-all shrink-0 cursor-pointer border flex items-center gap-1",
                      isActive
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold"
                        : "bg-white/5 text-zinc-400 border-white/5 hover:text-zinc-200 hover:bg-white/10"
                    )}
                    title={`Add constraint: ${constraint}`}
                  >
                    {isActive ? <Check size={10} className="text-indigo-400" /> : <Plus size={10} />}
                    <span>{constraint}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-zinc-500 shrink-0">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-white/10 rounded text-[9px] text-zinc-300">↵ Enter</kbd>
            </div>
          </div>
        </form>
      </motion.div>

      {/* 3. Quick Start Template Library & Engineering Suites */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="w-full"
      >
        <QuickStartTemplateLibrary 
          onSelectTemplate={handleSelectTemplate}
          onAddConstraint={handleAppendConstraint}
          currentPromptText={text}
        />
      </motion.div>

    </div>
  );
}
