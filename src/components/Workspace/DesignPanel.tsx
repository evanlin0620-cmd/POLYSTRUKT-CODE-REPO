import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, X, AlertCircle, Search, Check, Link as LinkIcon, Activity, RefreshCw, Copy, Wrench } from 'lucide-react';
import { TechnicalAIResponse } from '../../services/geminiService';

interface DesignPanelProps {
  currentDesign: TechnicalAIResponse | null;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

const parseSpecs = (specs: string) => {
  return specs.split('\n').map(line => {
    const [key, ...valueParts] = line.split(':');
    return {
      key: key.trim(),
      value: valueParts.join(':').trim()
    };
  }).filter(item => item.key && item.value);
};

const LoadingIndicator = () => (
  <div className="flex items-center justify-center py-8">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="w-6 h-6 border-2 border-purple-200 border-t-purple-500 rounded-full"
    />
  </div>
);

export const DesignPanel: React.FC<DesignPanelProps> = ({ currentDesign, isGenerating, onClose, onGenerate }) => {
  const [copied, setCopied] = useState(false);

  const isError = currentDesign?.statusCode && currentDesign.statusCode >= 400;
  const specs = parseSpecs(currentDesign?.specs || '');

  const handleCopy = () => {
    if (currentDesign?.optimizationLogic) {
      navigator.clipboard.writeText(currentDesign.optimizationLogic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      data-testid="workspace-design-panel"
      drag
      dragMomentum={false}
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="absolute top-[200px] right-6 w-80 z-30 pointer-events-auto cursor-grab active:cursor-grabbing"
    >
      <div className={`bg-white/95 backdrop-blur-xl border ${isError ? 'border-red-200 shadow-red-500/10' : 'border-zinc-200'} rounded-2xl p-5 shadow-2xl space-y-4`}>
        <div className="flex items-center justify-between pointer-events-none">
          <div className={`flex items-center gap-2 text-[10px] font-bold ${isError ? 'text-red-600' : 'text-purple-600'} uppercase tracking-widest font-unique`}>
            {isError ? <AlertCircle size={12} /> : <Terminal size={12} />}
            {isError ? `System Alert (${currentDesign?.statusCode})` : 'Design Protocol'}
          </div>
          <button onClick={onClose} className="pointer-events-auto text-zinc-400 hover:text-zinc-600 p-1"><X size={14} /></button>
        </div>

        <div className="h-px bg-zinc-100 pointer-events-none" />

        <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-4 cursor-default" onPointerDown={(e) => e.stopPropagation()}>
          {isGenerating ? <LoadingIndicator /> : (
            <>
              {currentDesign?.error && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex flex-col gap-2">
                  <p className="text-[11px] text-red-700 font-bold leading-relaxed">{currentDesign.error}</p>
                  {currentDesign.statusCode === 429 && (
                    <button onClick={onGenerate} className="flex items-center gap-2 text-[10px] text-red-600 hover:text-red-800 font-black uppercase tracking-widest">
                      <RefreshCw size={10} /> Retry Now
                    </button>
                  )}
                </div>
              )}

              {currentDesign?.isolatedComponent && (
                <div data-testid="workspace-component-isolation-indicator" className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3">
                  <div className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm"><Check size={14} /></div>
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Component Isolated</span>
                    <p className="text-[10px] font-bold text-zinc-900">{currentDesign.isolatedComponent}</p>
                  </div>
                </div>
              )}

              {!currentDesign?.error && (
                <>
                  <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-black text-purple-600 uppercase tracking-widest">
                      <Search size={10} /> Research & Standards
                    </div>
                    <p className="text-[10px] text-zinc-700 leading-relaxed italic">{currentDesign?.researchSummary}</p>
                  </div>

                  <div className="space-y-1">
                     <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Optimization Logic</span>
                       <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 hover:text-purple-600">
                         {copied ? <Check size={12} /> : <Copy size={12} />}
                         {copied ? 'Copied!' : 'Copy'}
                       </button>
                     </div>
                    <p className="text-[11px] text-zinc-800 leading-relaxed font-medium bg-zinc-50/50 p-2 rounded-lg border border-zinc-100">{currentDesign?.optimizationLogic}</p>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Analysis</span>
                <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">{currentDesign?.analysis}</p>
              </div>

              {(currentDesign?.sources || []).length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Grounding Sources</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentDesign?.sources?.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[8px] text-zinc-400 hover:text-purple-600 hover:border-purple-200 transition-all font-mono truncate max-w-full">
                        <LinkIcon size={8} />
                        {s.title || "Reference"}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  <Wrench size={12} />
                  Target Specs
                </div>
                <div className="bg-zinc-50/50 p-2 rounded-lg border border-zinc-100 text-[10px] font-mono">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex justify-between items-center py-0.5">
                      <span className="font-bold text-zinc-500">{spec.key}</span>
                      <span className="text-zinc-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-3 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Activity size={14} /></div>
            <div className="flex-1">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase font-unique">Geometric Fidelity</span>
              <div className="w-full h-1 bg-zinc-100 rounded-full mt-1"><div className={`h-full rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)] ${isError ? 'bg-red-400 w-[20%]' : 'bg-purple-500 w-[98%]'}`} /></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1 pointer-events-auto cursor-default" onPointerDown={(e) => e.stopPropagation()}>
            {(currentDesign?.suggestedMaterials || []).map(mat => (
              <span key={mat} className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-tighter">{mat}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};