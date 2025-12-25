import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InspectableModel } from './InspectableModel';
import { ArrowLeft, Send, Terminal, Sparkles, Activity, Layers, Cpu, Box, Database, Save, Download, MoreHorizontal, Loader2, Info, X, Search, Link as LinkIcon, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { getTechnicalResponse, TechnicalAIResponse } from '../services/geminiService';

interface WorkspaceProps {
  onBack: () => void;
  initialPrompt?: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ onBack, initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasModel, setHasModel] = useState(false);
  const [showDesignPanel, setShowDesignPanel] = useState(true);
  const [currentDesign, setCurrentDesign] = useState<TechnicalAIResponse | null>(null);
  const [simulationMode, setSimulationMode] = useState<'stress' | 'thermal' | 'flow' | undefined>(undefined);
  const [isShaking, setIsShaking] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      const timer = setTimeout(() => { handleGenerate(initialPrompt); }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt]);

  const handleGenerate = async (overridePrompt?: string) => {
    const textToProcess = overridePrompt || prompt;
    if (!textToProcess.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    
    if (isGenerating) return;
    
    setIsGenerating(true);
    setSimulationMode(undefined);

    try {
      const history = currentDesign && currentDesign.statusCode === 200 ? [{ role: 'model', text: currentDesign.analysis } as any] : [];
      const response = await getTechnicalResponse(textToProcess, history);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      if (response.error || (response.statusCode && response.statusCode >= 400)) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
          setCurrentDesign(response);
      } else {
          setCurrentDesign(response);
          setHasModel(true);
          setShowDesignPanel(true);
          setSimulationMode(response.simulationType === 'none' ? undefined : response.simulationType as any);
      }
    } catch (err) {
      console.error(err);
      setCurrentDesign({
          analysis: "A critical exception occurred in the workspace environment.",
          error: "Fatal connection error.",
          statusCode: 500,
          specs: "ERR_UNCAUGHT_EXC",
          action: "HALT",
          modelUrl: "",
          simulationType: 'none',
          suggestedMaterials: [],
          researchSummary: "",
          optimizationLogic: ""
      });
    } finally {
      setIsGenerating(false);
      if (currentDesign && currentDesign.statusCode === 200) {
        setPrompt('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-50 text-zinc-900 relative">
      <header className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            data-testid="workspace-back-btn"
            onClick={onBack} 
            className="p-2.5 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all shadow-sm flex items-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider pr-1 font-unique">Exit Engine</span>
          </button>
          <div className="h-10 w-px bg-zinc-200 mx-2 hidden md:block" />
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight uppercase flex items-center gap-2 font-unique">
              <Database size={14} className="text-purple-600" />
              CAD Workspace V.2
            </h1>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest truncate max-w-[200px]">
              {hasModel ? `SYSTEM_LOADED: ${currentDesign?.modelUrl?.split('/').pop() || 'Asset'}` : 'AWAITING PARAMETERS'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
           {hasModel && (
             <>
               <button 
                 data-testid="workspace-toggle-panel"
                 onClick={() => setShowDesignPanel(!showDesignPanel)}
                 className={`p-2.5 rounded-lg border transition-all ${showDesignPanel ? 'bg-purple-600 border-purple-700 text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm'}`}
                 title="Design Protocol"
               >
                 <Info size={18} />
               </button>
               <button data-testid="workspace-save-btn" className="hidden sm:flex px-4 py-2 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 shadow-sm items-center gap-2 font-unique"><Save size={12} /> Save</button>
               <button data-testid="workspace-export-btn" className="hidden sm:flex px-4 py-2 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 shadow-lg items-center gap-2 font-unique"><Download size={12} /> Export</button>
             </>
           )}
           <button className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 shadow-sm transition-colors"><MoreHorizontal size={18} /></button>
        </div>
      </header>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="generating" 
              data-testid="workspace-loading-state"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="w-full h-full flex flex-col items-center justify-center bg-zinc-100/50"
            >
                <div className="relative">
                    <Loader2 size={64} className="text-purple-600 animate-spin" />
                    <motion.div className="absolute inset-0 border-2 border-purple-200 rounded-full" animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1 }} />
                </div>
                <div className="mt-8 text-center space-y-2">
                    <h2 className="text-xl font-black font-unique tracking-widest uppercase">Synthesizing Geometry</h2>
                    <p className="text-[10px] font-mono text-zinc-400 mt-2 uppercase tracking-[0.2em] animate-pulse">Running Topology Optimization...</p>
                </div>
            </motion.div>
          ) : hasModel && currentDesign ? (
            <motion.div key="model" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
              <InspectableModel 
                isFullscreen={true} 
                simulationMode={simulationMode as any} 
                modelUrl={currentDesign.modelUrl} 
                focusPart={currentDesign.isolatedComponent}
              />
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
              <div className="flex flex-col items-center gap-8 max-w-lg text-center opacity-30">
                <div className="relative">
                   <Box size={120} strokeWidth={0.5} className="text-zinc-400" />
                   <div className="absolute inset-0 flex items-center justify-center"><Layers size={40} className="animate-pulse" /></div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black tracking-tighter font-unique uppercase">Ready to Build.</h2>
                  <p className="text-sm font-mono tracking-wide uppercase">Provide geometry, material, and load constraints below.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentDesign && !isGenerating && showDesignPanel && (
             <motion.div 
               data-testid="workspace-design-panel"
               drag
               dragMomentum={false}
               initial={{ opacity: 0, x: 50, scale: 0.95 }} 
               animate={{ opacity: 1, x: 0, scale: 1 }} 
               exit={{ opacity: 0, x: 50, scale: 0.95 }}
               className="absolute top-[200px] right-6 w-80 z-30 pointer-events-auto cursor-grab active:cursor-grabbing"
             >
                <div className={`bg-white/95 backdrop-blur-xl border ${currentDesign.statusCode && currentDesign.statusCode >= 400 ? 'border-red-200 shadow-red-500/10' : 'border-zinc-200'} rounded-2xl p-5 shadow-2xl space-y-4`}>
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className={`flex items-center gap-2 text-[10px] font-bold ${currentDesign.statusCode && currentDesign.statusCode >= 400 ? 'text-red-600' : 'text-purple-600'} uppercase tracking-widest font-unique`}>
                        {currentDesign.statusCode && currentDesign.statusCode >= 400 ? <AlertCircle size={12} /> : <Terminal size={12} />} 
                        {currentDesign.statusCode && currentDesign.statusCode >= 400 ? `System Alert (${currentDesign.statusCode})` : 'Design Protocol'}
                    </div>
                    <button onClick={() => setShowDesignPanel(false)} className="pointer-events-auto text-zinc-400 hover:text-zinc-600 p-1"><X size={14} /></button>
                  </div>
                  
                  <div className="h-px bg-zinc-100 pointer-events-none" />
                  
                  <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-4 cursor-default" onPointerDown={(e) => e.stopPropagation()}>
                    {currentDesign.error && (
                      <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex flex-col gap-2">
                          <p className="text-[11px] text-red-700 font-bold leading-relaxed">{currentDesign.error}</p>
                          {currentDesign.statusCode === 429 && (
                              <button onClick={() => handleGenerate()} className="flex items-center gap-2 text-[10px] text-red-600 hover:text-red-800 font-black uppercase tracking-widest">
                                  <RefreshCw size={10} /> Retry Now
                              </button>
                          )}
                      </div>
                    )}
                    
                    {currentDesign.isolatedComponent && (
                      <div data-testid="workspace-component-isolation-indicator" className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3">
                         <div className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm"><Check size={14} /></div>
                         <div>
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Component Isolated</span>
                            <p className="text-[10px] font-bold text-zinc-900">{currentDesign.isolatedComponent}</p>
                         </div>
                      </div>
                    )}

                    {!currentDesign.error && (
                        <>
                            <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-[9px] font-black text-purple-600 uppercase tracking-widest">
                                    <Search size={10} /> Research & Standards
                                </div>
                                <p className="text-[10px] text-zinc-700 leading-relaxed italic">{currentDesign.researchSummary}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Optimization Logic</span>
                                <p className="text-[11px] text-zinc-800 leading-relaxed font-medium bg-zinc-50/50 p-2 rounded-lg border border-zinc-100">{currentDesign.optimizationLogic}</p>
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Analysis</span>
                        <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">{currentDesign.analysis}</p>
                    </div>

                    {(currentDesign.sources || []).length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Grounding Sources</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentDesign.sources?.map((s, idx) => (
                            <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[8px] text-zinc-400 hover:text-purple-600 hover:border-purple-200 transition-all font-mono truncate max-w-full">
                              <LinkIcon size={8} />
                              {s.title || "Reference"}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Target Specs</span>
                        <p className="text-[11px] text-zinc-600 leading-relaxed font-mono whitespace-pre-wrap">{currentDesign.specs}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex flex-col gap-3 pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Activity size={14} /></div>
                      <div className="flex-1">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase font-unique">Geometric Fidelity</span>
                        <div className="w-full h-1 bg-zinc-100 rounded-full mt-1"><div className={`h-full rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)] ${currentDesign.error ? 'bg-red-400 w-[20%]' : 'bg-purple-500 w-[98%]'}`} /></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1 pointer-events-auto cursor-default" onPointerDown={(e) => e.stopPropagation()}>
                        {(currentDesign.suggestedMaterials || []).map(mat => (
                            <span key={mat} className="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-tighter">{mat}</span>
                        ))}
                    </div>
                  </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-40">
        <motion.div 
          layout 
          className="bg-white/95 backdrop-blur-2xl border border-zinc-200 rounded-3xl p-4 shadow-2xl flex flex-col gap-3"
          animate={isShaking ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-end gap-4 px-2">
            <div className="p-2.5 bg-zinc-900 rounded-2xl text-white shadow-lg mb-1">
              <Cpu size={20} className={isGenerating ? "animate-spin" : ""} />
            </div>
            <div className="flex-1">
              <label htmlFor="workspace-input" className="sr-only">Generation Prompt</label>
              <textarea 
                data-testid="workspace-prompt-input"
                ref={inputRef} id="workspace-input" rows={1} value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe the mechanics you wish to synthesize..." 
                className="w-full bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-400 text-lg font-bold font-unique resize-none overflow-hidden py-2"
              />
            </div>
            <button 
              data-testid="workspace-generate-btn"
              onClick={() => handleGenerate()} 
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
    </div>
  );
};
