import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InspectableModel } from './InspectableModel';
import { X, Terminal, Cpu, Activity, Box, Database, Loader2, Sparkles, ChevronRight, Check, Info, Command } from 'lucide-react';
import { synthesizeModel, AISynthesisResult } from '../services/aiService';

interface LiveShowcaseProps {
  onClose: () => void;
  onExplore: () => void;
}

const DEFAULT_PROMPT = "High-performance aerospace bracket with weight reduction cutouts and central reinforced hub";

const SHOWCASE_EXAMPLES = [
  {
    id: 'aerospace',
    label: 'Aerospace Bracket',
    description: 'High-load mounting solution with integrated weight-reduction trellis.',
    prompt: "High-performance aerospace bracket with weight reduction cutouts and central reinforced hub",
    icon: Box,
    curatedResult: {
      modelName: "AERO-X1 Structural Bracket",
      modelType: "Load-Bearing Component",
      analysisReport: "Optimized for vertical load paths. Stress distribution is concentrated along the central hub with 30% material reduction via trellis subtractions.",
      explodeStrategy: "Radial separation of mounting flanges from the core stabilization cylinder.",
      inspectionHighlights: ["Check hub/wall junction", "Verify mounting hole alignment", "Monitor lattice thickness"],
      expectedComponents: ["Reinforced Hub", "Load-Bearing Base", "Trellis Weight Reduction", "Mounting Interfaces"],
      visibleComponents: ["Cylinder-core hub", "Chamfered base-plate", "Radial slot subtractions", "4x bore-hole array"],
      spec: {
        "op": "subtract",
        "a": {
          "op": "union",
          "a": { "type": "box", "args": [80, 80, 15], "color": "#27272a", "position": [0, 0, -10] },
          "b": { "type": "cylinder", "args": [20, 25, 45], "color": "#1e1e21", "position": [0, 0, 5] }
        },
        "b": {
          "op": "group",
          "children": [
            { "type": "cylinder", "args": [12, 12, 60] },
            { "type": "box", "args": [15, 60, 30], "position": [30, 0, -10], "rotation": [0, 0, 0] },
            { "type": "box", "args": [15, 60, 30], "position": [-30, 0, -10], "rotation": [0, 0, 0] },
            { "type": "box", "args": [60, 15, 30], "position": [0, 30, -10], "rotation": [0, 0, 0] },
            { "type": "box", "args": [60, 15, 30], "position": [0, -30, -10], "rotation": [0, 0, 0] },
            { "type": "cylinder", "args": [6, 6, 40], "position": [32, 32, -10] },
            { "type": "cylinder", "args": [6, 6, 40], "position": [-32, 32, -10] },
            { "type": "cylinder", "args": [6, 6, 40], "position": [32, -32, -10] },
            { "type": "cylinder", "args": [6, 6, 40], "position": [-32, -32, -10] }
          ]
        }
      }
    }
  },
  {
    id: 'piston',
    label: 'High-Boost Piston',
    description: 'Internal combustion component designed for high thermal and pressure stress.',
    prompt: "Forged automotive piston with crown oil galleries, reinforced pin boss, and dual wrist-pin cutouts",
    icon: Activity,
    curatedResult: {
      modelName: "FORGE-86 Performance Piston",
      modelType: "Reciprocating Component",
      analysisReport: "Thermal expansion controlled via crown profile. Pin boss reinforced with 5mm fillet to prevent fatigue cracking under high boost.",
      explodeStrategy: "Linear Z-axis separation of the piston crown from the skirt and pin-boss structure.",
      inspectionHighlights: ["Profile crown curvature", "Verify oil gallery clearance", "Check pin boss finish"],
      expectedComponents: ["Convex Crown", "Oil Ring Grooves", "Pin Boss", "Skirt Relief"],
      visibleComponents: ["Hemispherical-top cap", "Torus-ring subtractions", "Horizontal pin-bore", "Large-block side-reliefs"],
      spec: {
        "op": "subtract",
        "a": {
          "op": "union",
          "a": { "type": "cylinder", "args": [40, 40, 70], "color": "#3f3f46" },
          "b": { "type": "sphere", "args": [40], "position": [0, 0, 35], "color": "#52525b" }
        },
        "b": {
          "op": "group",
          "children": [
            { "type": "cylinder", "args": [15, 15, 100], "rotation": [1.57, 0, 0], "position": [0, 0, -10] },
            { "type": "box", "args": [100, 50, 40], "position": [0, 0, -35] },
            { "type": "torus", "args": [38.5, 1.5], "position": [0, 0, 25] },
            { "type": "torus", "args": [38.5, 1.5], "position": [0, 0, 18] },
            { "type": "torus", "args": [38.5, 1.5], "position": [0, 0, 11] },
            { "type": "cylinder", "args": [34, 34, 60], "position": [0, 0, -25] }
          ]
        }
      }
    }
  },
  {
    id: 'turbine',
    label: 'Turbine Volute',
    description: 'Fluid dynamics housing for high-velocity exhaust gas compression.',
    prompt: "Aero-dynamic turbine housing with internal spiral volute geometry and circular outlet flange",
    icon: Cpu,
    curatedResult: {
      modelName: "VORTEX-G12 Turbo Volute",
      modelType: "Fluid Flow Assembly",
      analysisReport: "Internal volute curvature follows AR 0.82 ratio. Outlet flange reinforced for high-temp expansion. Wall thickness stabilized at 8mm.",
      explodeStrategy: "Sextant cut-view to reveal the internal spiral scroll and fluid passage uniformity.",
      inspectionHighlights: ["Scroll surface smoothness", "Verify outlet flange sealing", "Check bypass port integration"],
      expectedComponents: ["Hollow Spiral Volute", "Inlet Passage", "Outlet Flange Interface"],
      visibleComponents: ["Nested-torus scroll", "Tangential cylinder-entry", "Reinforced box-flange"],
      spec: {
        "op": "union",
        "a": {
          "op": "subtract",
          "a": { "type": "torus", "args": [40, 18], "color": "#111827" },
          "b": { "type": "torus", "args": [40, 14], "color": "#1f2937" }
        },
        "b": {
           "op": "group",
           "children": [
             {
               "op": "subtract",
               "a": { "type": "cylinder", "args": [20, 20, 60], "position": [40, 0, 20], "rotation": [1.57, 0, 0], "color": "#111827" },
               "b": { "type": "cylinder", "args": [16, 16, 70], "position": [40, 0, 20], "rotation": [1.57, 0, 0] }
             },
             { "type": "box", "args": [50, 50, 8], "position": [40, 30, 20], "rotation": [1.57, 0, 0], "color": "#374151" }
           ]
        }
      }
    }
  },
  {
    id: 'chassis',
    label: 'Architecture Node',
    description: 'High-strength structural node for modular aerospace frame construction.',
    prompt: "Complex architectural nodal connector with cross-axial mounting ports and circular weight reduction vents",
    icon: Database,
    curatedResult: {
      modelName: "GEN-9 ARCHITECTURAL NODE",
      modelType: "Modular Structural Core",
      analysisReport: "Cross-axial porting allows for 6-way modular attachment. Integral fillets distribute loads radially from the central spherical core.",
      explodeStrategy: "Exploded view along all three Cartesian axes to exhibit mounting interfaces.",
      inspectionHighlights: ["Internal port wall thickness", "Fillet radius verification", "Surface finish of interfaces"],
      expectedComponents: ["Central Anchor Core", "Structural Frame Ports", "Lightweight Vents"],
      visibleComponents: ["Hollowed center-sphere", "Tri-axial port-cylinders", "Surface perforation-array"],
      spec: {
        "op": "subtract",
        "a": {
          "op": "union",
          "a": { "type": "sphere", "args": [45], "color": "#0f172a" },
          "b": {
            "op": "group",
            "children": [
              { "type": "cylinder", "args": [18, 18, 120], "rotation": [1.57, 0, 0], "color": "#1e293b" },
              { "type": "cylinder", "args": [18, 18, 120], "rotation": [0, 1.57, 0], "color": "#1e293b" },
              { "type": "cylinder", "args": [18, 18, 120], "color": "#1e293b" }
            ]
          }
        },
        "b": {
          "op": "group",
          "children": [
            { "type": "cylinder", "args": [14, 14, 130], "rotation": [1.57, 0, 0] },
            { "type": "cylinder", "args": [14, 14, 130], "rotation": [0, 1.57, 0] },
            { "type": "cylinder", "args": [14, 14, 130] },
            { "type": "sphere", "args": [38] },
            { "type": "cylinder", "args": [4, 4, 100], "position": [25, 25, 0] },
            { "type": "cylinder", "args": [4, 4, 100], "position": [-25, 25, 0] },
            { "type": "cylinder", "args": [4, 4, 100], "position": [25, -25, 0] },
            { "type": "cylinder", "args": [4, 4, 100], "position": [-25, -25, 0] }
          ]
        }
      }
    }
  }
];

const DEMO_STEPS = [
  { title: "INITIALIZING", subtitle: "Connecting to Synthesis Interface...", icon: Database, duration: 1500 },
  { title: "AI MAPPING", subtitle: "Analyzing requirements via Gemini Engine...", icon: Sparkles, duration: 2000 },
  { title: "GEOMETRY SYNTHESIS", subtitle: "Generating procedural CSG logic...", icon: Box, duration: 4000 },
  { title: "VERIFICATION", subtitle: "Evaluating structural integrity...", icon: Activity, duration: 2000 },
  { title: "COMPLETE", subtitle: "Deploying to environment.", icon: Check, duration: 1000 }
];

export const LiveShowcase: React.FC<LiveShowcaseProps> = ({ onClose, onExplore }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [activePrompt, setActivePrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<AISynthesisResult | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  }, []);

  const runSynthesis = useCallback(async (promptInput: string, curatedData?: AISynthesisResult) => {
    setIsBuilding(true);
    setProgress(0);
    setCurrentStep(0);
    setAiResult(null);
    setActivePrompt(promptInput);
    
    addLog(`[USER] Initiating Synthesis for: ${promptInput}`);

    if (curatedData) {
      addLog(`[SYSTEM] Retrieving Blueprint from Engineering Archive...`);
      setTimeout(() => {
        setAiResult(curatedData);
      }, 3500);
      return;
    }

    async function startSynthesis() {
      try {
        const result = await synthesizeModel(promptInput);
        setAiResult(result);
      } catch (err) {
        console.error("AI Synthesis failed:", err);
      }
    }

    startSynthesis();
  }, [addLog]);

  useEffect(() => {
    addLog(`[SYSTEM] Neural Synthesis Core initialized.`);
    addLog(`[SYSTEM] Standby mode active. Awaiting operator selection.`);
  }, [addLog]);

  useEffect(() => {
    if (!isBuilding) return;

    let timeout: NodeJS.Timeout;
    let stepInterval: NodeJS.Timeout;
    
    const runStep = (index: number) => {
      if (index >= DEMO_STEPS.length) {
        if (aiResult || index > 4) {
           setIsBuilding(false);
           return;
        }
        timeout = setTimeout(() => runStep(index), 1000);
        return;
      }

      const step = DEMO_STEPS[index];
      setCurrentStep(index);
      addLog(`[SYSTEM] ${step.title}: ${step.subtitle}`);
      
      let stepProgress = 0;
      if (stepInterval) clearInterval(stepInterval);
      
      stepInterval = setInterval(() => {
        stepProgress += 2;
        setProgress((index / DEMO_STEPS.length * 100) + (stepProgress / 100 * (100 / DEMO_STEPS.length)));
        if (stepProgress >= 100) clearInterval(stepInterval);
      }, step.duration / 50);

      timeout = setTimeout(() => {
        runStep(index + 1);
      }, step.duration);
    };

    runStep(0);
    return () => {
      clearTimeout(timeout);
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [isBuilding, aiResult, addLog]);

  return (
    <div className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col overflow-hidden text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        @keyframes float-panel {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.01); }
        }
        .animate-float { animation: float-panel 8s ease-in-out infinite; }
      `}} />
      
      {/* Immersive Background Blur Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[160px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
      </div>
      
      {/* HUD Header */}
      <header className="absolute top-8 inset-x-8 z-50 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-6 p-4 bg-zinc-900/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-2xl ring-1 ring-white/5">
             <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-zinc-950 shadow-xl">
                <Cpu size={24} />
             </div>
             <div className="pr-6">
                <h1 className="text-xl font-black uppercase tracking-tighter font-unique mb-1">Neural <span className="text-indigo-500">Lab</span></h1>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isBuilding ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} shadow-[0_0_10px_currentColor]`} />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                        {isBuilding ? 'Synthesizing...' : 'Live Environment'}
                      </span>
                   </div>
                   <div className="w-px h-3 bg-white/10" />
                   <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none">OS v4.2.1</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <div className="flex flex-col items-end gap-2 px-6 py-4 bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] text-right font-technical shadow-sm">
             <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">Temporal Drift</p>
             <p className="text-sm font-black text-white lining-nums">00:00:24:12</p>
          </div>
          <button 
             onClick={onClose}
             className="w-14 h-14 bg-zinc-950/80 backdrop-blur-3xl border border-white/10 text-zinc-500 hover:text-white rounded-[1.5rem] flex items-center justify-center transition-all active:scale-95 group shadow-xl"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main ref={viewportRef} className="flex-1 relative flex overflow-hidden">
        
        {/* Immersive Landing Selection (Only if no active prompt) */}
        <AnimatePresence>
          {!activePrompt && !isBuilding && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(40px)" }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center p-12 bg-zinc-950/60 backdrop-blur-md"
            >
              <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                <div className="lg:col-span-5 space-y-12">
                   <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] font-unique"
                      >
                        <Sparkles size={14} className="animate-pulse" />
                        Awaiting Instruction
                      </motion.div>
                      <h2 className="text-7xl md:text-[7rem] font-black text-white leading-[0.8] tracking-tighter uppercase font-unique">
                        Design <br /><span className="text-zinc-900">The Future</span>
                      </h2>
                      <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-md font-technical">
                        Our neural core transforms architectural intent into structural reality. Select an archive or initialize a new vector.
                      </p>
                   </div>

                   <div className="space-y-4">
                      <div className="relative group">
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="EX: Radial turbine volute with heat-sink fins..."
                          className="w-full h-40 bg-white/5 backdrop-blur-3xl border-2 border-white/5 rounded-[2rem] p-8 text-xl font-bold text-white placeholder:text-zinc-800 focus:outline-none focus:border-indigo-500/30 transition-all shadow-xl resize-none uppercase tracking-tight"
                        />
                        <div className="absolute top-6 right-8 text-[10px] font-black text-zinc-700 uppercase tracking-widest">Manual Input</div>
                      </div>
                      <button
                        disabled={!customPrompt.trim()}
                        onClick={() => runSynthesis(customPrompt)}
                        className="w-full py-8 bg-white text-zinc-950 text-xs font-black uppercase tracking-[0.5em] rounded-[2rem] shadow-xl hover:bg-indigo-500 hover:text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 font-unique"
                      >
                        <Terminal size={20} />
                        Execute Synthesis Vector
                      </button>
                   </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SHOWCASE_EXAMPLES.map((ex, i) => (
                      <motion.button
                        key={ex.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        onClick={() => runSynthesis(ex.prompt, ex.curatedResult as AISynthesisResult)}
                        className="group relative p-10 bg-white/5 border border-white/5 rounded-[2.5rem] text-left hover:bg-white/[0.08] hover:border-indigo-500/40 transition-all duration-500 shadow-xl overflow-hidden"
                      >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-[80px] group-hover:bg-indigo-500/10 transition-all" />
                        <div className="relative z-10 space-y-6">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                             <ex.icon size={28} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-unique mb-2 group-hover:text-indigo-400 transition-colors">{ex.label}</h3>
                            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors uppercase tracking-tight">{ex.description}</p>
                          </div>
                          <div className="pt-4 flex items-center gap-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                             Load Blueprint <ChevronRight size={14} className="text-indigo-500" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-12 flex items-center gap-12 py-8 px-12 bg-white/5 border border-white/5 rounded-full grayscale opacity-50">
                 {['AES-O1', 'NVIDIA_H100', 'POLY_STRUCT_V4', 'CAD_CORE_GEN'].map(t => (
                   <span key={t} className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">{t}</span>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Viewport Container */}
        <div className="flex-1 relative">
           <AnimatePresence mode="wait">
             {isBuilding && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-3xl"
                >
                  <div className="space-y-12 text-center max-w-xl">
                     <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-[2.5rem] border-4 border-indigo-500/20 flex items-center justify-center relative bg-white/5">
                           <Loader2 size={48} className="text-indigo-500 animate-spin" />
                        </div>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-[-20px] border-2 border-dashed border-white/5 rounded-full"
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter font-unique mb-2">Synthesis In Progress</h3>
                        <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden shadow-sm">
                           <motion.div 
                             animate={{ width: `${progress}%` }}
                             className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[size:200%_auto] animate-[shimmer_2s_linear_infinite]"
                             style={{
                                backgroundImage: "linear-gradient(90deg, #4f46e5 0%, #9333ea 50%, #4f46e5 100%)"
                             }}
                           />
                        </div>
                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] flex justify-between px-2">
                           <span>Allocating Buffers</span>
                           <span>{Math.round(progress)}%</span>
                        </div>
                     </div>
                  </div>
                </motion.div>
             )}

             {activePrompt && !isBuilding && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="w-full h-full relative"
                >
                  <InspectableModel 
                    proceduralSpec={aiResult?.spec} 
                    aiAnalysis={{
                      explodeStrategy: aiResult?.explodeStrategy,
                      highlights: aiResult?.inspectionHighlights
                    }}
                    isFullscreen={true} 
                  />

                  {/* Floating HUD Elements */}
                  <div className="absolute inset-8 pointer-events-none z-10">
                     
                    {/* Left Panel: Controls & Info */}
                    <div className="absolute top-24 left-0 w-80 space-y-6 pointer-events-auto">
                       <motion.div 
                         initial={{ x: -40, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         transition={{ delay: 0.5 }}
                         className="bg-zinc-900/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl animate-float"
                       >
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm" />
                             <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">Active Specification</span>
                          </div>
                          <h2 className="text-3xl font-black text-white uppercase tracking-tighter font-unique mb-4 leading-none">{aiResult?.modelName || "SYN_OUTPUT_ERROR"}</h2>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] mb-8 leading-relaxed opacity-80 italic">"{activePrompt}"</p>
                          
                          <div className="space-y-3">
                             <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Class</span>
                                <span className="text-[10px] font-black text-white uppercase">{aiResult?.modelType || "Unknown"}</span>
                             </div>
                             <div className="flex items-center justify-between py-3">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Complexity</span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase">Level 4 Node</span>
                             </div>
                          </div>
                       </motion.div>

                       <motion.div 
                         initial={{ x: -40, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         transition={{ delay: 0.7 }}
                         className="bg-white/5 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] shadow-sm"
                       >
                          <div className="flex items-center gap-3 mb-4">
                             <Activity size={14} className="text-zinc-600" />
                             <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Telemetry Stream</span>
                          </div>
                          <div className="space-y-1.5 opacity-60">
                             {logs.slice(0, 4).map((log, i) => (
                               <div key={i} className="text-[8px] font-mono text-zinc-500 truncate lowercase">{`> `}{log}</div>
                             ))}
                          </div>
                       </motion.div>
                    </div>

                    {/* Right Panel: Accuracy & Highlights */}
                    <div className="absolute top-24 right-0 w-80 space-y-6 pointer-events-auto">
                       {aiResult && (
                          <motion.div 
                            initial={{ x: 40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-zinc-900/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl ring-1 ring-white/5"
                          >
                             <div className="flex items-center gap-3 mb-8">
                                <Check size={16} className="text-emerald-500" />
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">Accuracy Verification</span>
                             </div>

                             <div className="space-y-8">
                                <div className="space-y-4">
                                   <div className="flex justify-between items-center text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">
                                      <span>Requirement Mapping</span>
                                      <span>Visible In Model</span>
                                   </div>
                                   <div className="space-y-2">
                                      {aiResult.expectedComponents?.map((component, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group">
                                           <div className="flex-1 text-[10px] font-bold text-zinc-400 bg-white/5 p-3 rounded-xl border border-white/5 truncate group-hover:border-white/10 transition-colors uppercase tracking-tight">
                                              {component}
                                           </div>
                                           <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                              <Check size={12} className="text-indigo-400" />
                                           </div>
                                        </div>
                                      ))}
                                   </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 space-y-4">
                                   <div className="flex items-center gap-3">
                                      <Terminal size={14} className="text-indigo-400" />
                                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Inspection Log</span>
                                   </div>
                                   <div className="space-y-3">
                                      {aiResult.inspectionHighlights.slice(0, 2).map((h, i) => (
                                        <div key={i} className="text-[10px] text-zinc-400 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                                           {h}
                                        </div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                       )}
                    </div>

                    {/* Bottom Floating Action Panel */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-auto">
                       <motion.div 
                         initial={{ y: 40, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         transition={{ delay: 0.8 }}
                         className="bg-zinc-900/80 backdrop-blur-3xl border border-white/5 p-4 rounded-[2.5rem] shadow-2xl flex items-center gap-4 ring-1 ring-white/5"
                       >
                          <button 
                             onClick={() => {
                                setActivePrompt("");
                                setAiResult(null);
                             }}
                             className="px-10 py-5 bg-white/5 border border-white/5 text-zinc-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:bg-white/10 font-unique"
                          >
                             Terminal Exit
                          </button>
                          <button 
                             onClick={onExplore}
                             className="flex-1 py-5 bg-white text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:bg-indigo-500 hover:text-white shadow-2xl flex items-center justify-center gap-4 group font-unique"
                          >
                             <Sparkles size={16} className="text-indigo-600 group-hover:text-white transition-colors" />
                             Access Full Synthesis Engine
                             <ChevronRight size={16} />
                          </button>
                       </motion.div>
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
