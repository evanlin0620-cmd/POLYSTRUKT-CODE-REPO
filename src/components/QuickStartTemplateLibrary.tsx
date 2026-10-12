import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Cpu,
  Compass,
  Box,
  Layers,
  Workflow,
  Disc,
  Radio,
  Zap,
  Wrench,
  Anchor,
  CircleDot,
  Sparkles,
  Sliders,
  Check,
  ArrowRight,
  Info,
  X,
  Copy,
  Layers2,
  CheckCircle2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  QUICK_START_TEMPLATES, 
  ENGINEERING_CONSTRAINT_GROUPS, 
  QuickStartTemplate 
} from '../data/quickStartTemplates';
import { cn } from '../lib/utils';

interface QuickStartTemplateLibraryProps {
  onSelectTemplate: (prompt: string, autoSend?: boolean, template?: QuickStartTemplate) => void;
  onAddConstraint: (constraint: string) => void;
  currentPromptText?: string;
  className?: string;
  mode?: 'embedded' | 'modal' | 'dropdown';
  onClose?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Cpu,
  Compass,
  Anchor,
  CircleDot,
  Box,
  Workflow,
  Zap,
  Layers
};

export const QuickStartTemplateLibrary: React.FC<QuickStartTemplateLibraryProps> = ({
  onSelectTemplate,
  onAddConstraint,
  currentPromptText = '',
  className,
  mode = 'embedded',
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'templates' | 'constraints'>('templates');
  const [previewTemplate, setPreviewTemplate] = useState<QuickStartTemplate | null>(null);
  const [customParams, setCustomParams] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Structural', 'Powertrain', 'Aerospace', 'Robotics', 'Fluidics', 'Electronics'];

  const filteredTemplates = selectedCategory === 'All'
    ? QUICK_START_TEMPLATES
    : QUICK_START_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleTemplateClick = (template: QuickStartTemplate, autoSend = false) => {
    onSelectTemplate(template.prompt, autoSend, template);
    if (onClose) onClose();
  };

  const handleCustomizedSend = (template: QuickStartTemplate, autoSend = false) => {
    let finalPrompt = template.prompt;
    if (customParams[template.id]) {
      finalPrompt = `${template.prompt} Custom specifications: ${customParams[template.id]}`;
    }
    onSelectTemplate(finalPrompt, autoSend, template);
    setPreviewTemplate(null);
    if (onClose) onClose();
  };

  const isConstraintActive = (tagValue: string) => {
    return currentPromptText.toLowerCase().includes(tagValue.toLowerCase());
  };

  return (
    <div className={cn("w-full flex flex-col font-sans select-none", className)}>
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <Zap size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Template Explorer
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Verified CAD Archetypes
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Select pre-configured mechanical templates or apply precision engineering constraint rules
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'templates'
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Layers size={12} />
            <span>Common Shapes ({QUICK_START_TEMPLATES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('constraints')}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'constraints'
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Wrench size={12} />
            <span>Constraints & Rules</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white rounded-lg ml-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: COMMON MECHANICAL SHAPES & TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4 pt-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer border",
                  selectedCategory === cat
                    ? "bg-white/10 text-white border-indigo-500/50 shadow-sm font-semibold"
                    : "bg-zinc-900/60 text-zinc-400 border-white/5 hover:text-zinc-200 hover:bg-zinc-800"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map((template) => {
              const Icon = ICON_MAP[template.iconName] || Shield;
              const isCurrentlyPreviewed = previewTemplate?.id === template.id;

              return (
                <motion.div
                  key={template.id}
                  layout
                  whileHover={{ y: -2 }}
                  className={cn(
                    "p-3.5 rounded-xl bg-zinc-900/80 border transition-all text-left flex flex-col justify-between shadow-sm relative group",
                    isCurrentlyPreviewed ? "border-indigo-500 bg-zinc-900 ring-1 ring-indigo-500/50" : "border-white/10 hover:border-white/20 hover:bg-zinc-900"
                  )}
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg border", template.color)}>
                          <Icon size={14} />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          {template.category}
                        </span>
                      </div>

                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
                        {template.badge}
                      </span>
                    </div>

                    {/* Title and description */}
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    {/* Engineering Specs Pill Grid */}
                    <div className="bg-black/30 p-2 rounded-lg border border-white/5 space-y-1 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Geometry:</span>
                        <span className="text-zinc-200">{template.keyDimensions}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Material:</span>
                        <span className="text-indigo-300">{template.material}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Load/Proof:</span>
                        <span className="text-emerald-400">{template.loadRating}</span>
                      </div>
                    </div>

                    {/* Recommended Constraint Badges */}
                    <div className="flex flex-wrap gap-1">
                      {template.recommendedConstraints.slice(0, 3).map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddConstraint(c);
                          }}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 text-zinc-400 border border-white/5 transition-all cursor-pointer"
                          title="Click to add constraint to prompt"
                        >
                          +{c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs gap-2">
                    <button
                      type="button"
                      onClick={() => handleTemplateClick(template, false)}
                      className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
                      title="Load prompt into editor to customize"
                    >
                      <Sliders size={12} />
                      <span>Use Prompt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateClick(template, true)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all flex items-center gap-1 text-xs cursor-pointer shadow-sm"
                      title="Synthesize 3D CAD model directly"
                    >
                      <span>Generate</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ENGINEERING CONSTRAINTS & RULES PALETTE */}
      {activeTab === 'constraints' && (
        <div className="space-y-4 pt-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-2.5 text-xs text-indigo-200">
            <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Click any constraint chip below to append engineering guardrails to your active prompt. Explicit constraints help our procedural geometric kernel generate <strong>watertight, manufacturable solid CSG models</strong> without self-intersections.
            </p>
          </div>

          <div className="space-y-4">
            {ENGINEERING_CONSTRAINT_GROUPS.map((group, idx) => (
              <div key={idx} className="space-y-2 bg-zinc-900/60 p-3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
                    {group.category}
                  </h3>
                  <span className="text-[9px] font-mono text-zinc-500">
                    {group.tags.length} presets
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {group.tags.map((tag, tagIdx) => {
                    const active = isConstraintActive(tag.label) || isConstraintActive(tag.value);
                    return (
                      <button
                        key={tagIdx}
                        type="button"
                        onClick={() => onAddConstraint(tag.value)}
                        className={cn(
                          "p-2 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer group",
                          active
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
                            : "bg-zinc-900/90 border-white/10 hover:border-white/20 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                        )}
                        title={tag.description}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold flex items-center gap-1.5">
                            {active ? (
                              <Check size={12} className="text-indigo-400 shrink-0" />
                            ) : (
                              <Plus size={12} className="text-zinc-500 group-hover:text-white shrink-0" />
                            )}
                            {tag.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                          {tag.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
