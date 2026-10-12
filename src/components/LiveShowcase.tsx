import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InspectableModel } from './InspectableModel';
import { 
  X, Terminal, Cpu, Activity, Box, Database, Loader2, 
  Sparkles, ChevronRight, Check, Info, Command, ArrowRight,
  Layers, ShieldCheck, Zap, Flame, Compass, Play
} from 'lucide-react';
import { synthesizeModel, AISynthesisResult } from '../services/aiService';

interface LiveShowcaseProps {
  onClose: () => void;
  onExplore: () => void;
}

const SHOWCASE_EXAMPLES = [
  {
    id: 'aerospace',
    label: 'Aerospace Bracket',
    category: 'AEROSPACE // STRUCTURE',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
    description: 'High-load mounting solution with integrated weight-reduction trellis and reinforced central hub.',
    metric: '30% Weight Reduction',
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
    category: 'PROPULSION // THERMAL',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
    description: 'Internal combustion component designed for high thermal resistance and cylinder pressure stress.',
    metric: 'High-Temp Alloy (800°C)',
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
    category: 'FLUID DYNAMICS // FLOW',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white',
    description: 'Aerodynamic scroll housing for uniform velocity distribution and exhaust gas compression.',
    metric: 'AR 0.82 Curvature Flow',
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
    category: 'FRAME // MODULAR',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
    description: 'High-strength structural node with 6-way modular cross-axial ports for aerospace frames.',
    metric: '6-Axis Multi-Port Node',
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

const SUGGESTED_CHIPS = [
  "Radial Turbine Volute",
  "Titanium Lattice Bracket",
  "Forged High-Boost Piston",
  "Modular Drone Core"
];

const DEMO_STEPS = [
  { title: "INITIALIZING", subtitle: "Connecting to Kernel Procedural Interface...", icon: Database, duration: 1200 },
  { title: "AI SYNTHESIS", subtitle: "Computing topological CSG tree with Gemini Engine...", icon: Sparkles, duration: 1800 },
  { title: "GEOMETRY COMPILE", subtitle: "Evaluating boolean operations & mesh normals...", icon: Box, duration: 2500 },
  { title: "FEA VALIDATION", subtitle: "Verifying load points and wall manifold integrity...", icon: Activity, duration: 1500 },
  { title: "READY", subtitle: "Deploying interactive 3D blueprint...", icon: Check, duration: 800 }
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
        timeout = setTimeout(() => runStep(index), 800);
        return;
      }

      const step = DEMO_STEPS[index];
      setCurrentStep(index);
      addLog(`[SYSTEM] ${step.title}: ${step.subtitle}`);
      
      let stepProgress = 0;
      if (stepInterval) clearInterval(stepInterval);
      
      stepInterval = setInterval(() => {
        stepProgress += 3;
        setProgress((index / DEMO_STEPS.length * 100) + (stepProgress / 100 * (100 / DEMO_STEPS.length)));
        if (stepProgress >= 100) clearInterval(stepInterval);
      }, step.duration / 40);

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
    <div className="fixed inset-0 z-[150] bg-[#07090e] flex flex-col overflow-hidden text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}} />
      
      {/* Immersive Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] left-[5%] w-[50%] h-[50%] bg-indigo-600/15 blur-[140px]" />
        <div className="absolute bottom-[5%] right-[5%] w-[45%] h-[45%] bg-cyan-600/15 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>
      
      {/* High-Contrast Top HUD Header */}
      <header className="absolute top-0 inset-x-0 z-50 px-6 py-4 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-zinc-800/80 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30">
            <Cpu size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black uppercase tracking-tight text-white font-mono">
                Neural <span className="text-indigo-400">Lab</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                OS v4.2.1
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${isBuilding ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'} shadow-[0_0_8px_currentColor]`} />
              <span className="text-[10px] font-bold font-mono text-zinc-300 uppercase tracking-wider">
                {isBuilding ? 'SYNTHESIZING PROCEDURAL MESH' : 'LIVE PROCEDURAL ENVIRONMENT'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-right font-mono shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">DRIFT</span>
            <span className="text-xs font-black text-indigo-300">00:00:24:12</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer"
            title="Close Simulation"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main ref={viewportRef} className="flex-1 relative flex overflow-hidden pt-20">
        
        {/* Landing Selection Screen */}
        <AnimatePresence>
          {!activePrompt && !isBuilding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(20px)" }}
              className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col justify-between p-6 sm:p-8 lg:p-12 z-40"
            >
              <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start my-auto py-4">
                
                {/* Left Column: Heading & Manual Vector Synthesis */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-black uppercase tracking-wider font-mono">
                      <Sparkles size={13} className="text-indigo-400" />
                      AWAITING OPERATOR INSTRUCTION
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight uppercase">
                      DESIGN <br />
                      <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
                        THE FUTURE
                      </span>
                    </h2>
                    
                    <p className="text-zinc-300 text-sm md:text-base font-normal leading-relaxed">
                      Transform natural language specifications into interactive parametric 3D geometry with physics validation and CSG boolean modeling.
                    </p>
                  </div>

                  {/* Manual Prompt Input Box */}
                  <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-5 shadow-2xl space-y-3.5 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Terminal size={14} className="text-indigo-400" />
                        <span className="text-[11px] font-black uppercase tracking-wider font-mono">
                          Vector Prompt Input
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Gemini 3.5 Turbo
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Ex: Radial turbine volute with heat-sink fins and dual mounting bosses..."
                        className="w-full h-28 bg-[#0b0e14] border border-zinc-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl p-3.5 text-sm font-medium text-zinc-100 placeholder:text-zinc-500 outline-none transition-all resize-none font-mono leading-relaxed"
                      />
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SUGGESTED_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setCustomPrompt(chip)}
                          className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[10px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={!customPrompt.trim()}
                      onClick={() => runSynthesis(customPrompt)}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mono active:scale-[0.99]"
                    >
                      <Zap size={15} />
                      Execute Synthesis Vector
                    </button>
                  </div>
                </div>

                {/* Right Column: 2x2 Blueprint Archive Grid */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between pb-1 px-1">
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-2">
                      <Layers size={13} className="text-indigo-400" />
                      Curated Engineering Archive
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      4 PRE-COMPILED BLUEPRINTS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SHOWCASE_EXAMPLES.map((ex, i) => {
                      const IconComp = ex.icon;
                      return (
                        <motion.button
                          key={ex.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 * i }}
                          onClick={() => runSynthesis(ex.prompt, ex.curatedResult as AISynthesisResult)}
                          className="group relative p-5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/60 rounded-2xl text-left transition-all duration-300 shadow-xl flex flex-col justify-between gap-4 cursor-pointer overflow-hidden backdrop-blur-md"
                        >
                          {/* Card Header with Category Tag & Icon */}
                          <div className="flex items-start justify-between gap-2">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold font-mono tracking-wider border ${ex.badgeColor}`}>
                              {ex.category}
                            </span>
                            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${ex.iconBg}`}>
                              <IconComp size={18} />
                            </div>
                          </div>

                          {/* Card Content */}
                          <div>
                            <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors tracking-tight">
                              {ex.label}
                            </h3>
                            <p className="text-xs text-zinc-300 leading-relaxed mt-1 line-clamp-2">
                              {ex.description}
                            </p>
                          </div>

                          {/* Card Footer: Metric & Action */}
                          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-zinc-400 font-medium">
                              {ex.metric}
                            </span>
                            <span className="text-indigo-400 group-hover:text-white font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                              Load Model <ChevronRight size={13} />
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Technical Spec Badges */}
              <div className="max-w-7xl mx-auto w-full pt-6 pb-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-4 text-zinc-400 font-mono text-[10px]">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold">
                    AES-01 ACCELERATION
                  </span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold">
                    NVIDIA H100 COMPUTE
                  </span>
                  <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold">
                    CSG KERNEL V4
                  </span>
                </div>
                <div className="text-zinc-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  REAL-TIME WEBGL / THREE.JS RENDERER ACTIVE
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Viewport & Inspection Stage */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {/* Active Synthesis In-Progress View */}
            {isBuilding && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e]/95 backdrop-blur-2xl p-6"
              >
                <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-700/80 rounded-3xl p-8 shadow-2xl text-center space-y-6">
                  {/* Rotating Circular Indicator */}
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center shadow-lg">
                      <Loader2 size={36} className="text-indigo-400 animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                      Synthesis In Progress
                    </h3>
                    <p className="text-xs text-indigo-300 font-mono">
                      {DEMO_STEPS[currentStep]?.subtitle || "Processing parametric geometry..."}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                      <motion.div 
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 transition-all duration-200"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 px-1">
                      <span>{DEMO_STEPS[currentStep]?.title || "EXECUTING"}</span>
                      <span className="text-indigo-300 font-bold">{Math.round(progress)}%</span>
                    </div>
                  </div>

                  {/* Terminal Log Stream */}
                  <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-3.5 text-left font-mono text-[10px] text-emerald-400/90 h-24 overflow-hidden flex flex-col-reverse gap-1.5">
                    {logs.slice(0, 3).map((log, i) => (
                      <div key={i} className="truncate">
                        {`> ${log}`}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Model Inspection View */}
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
                <div className="absolute inset-6 pointer-events-none z-10 flex flex-col justify-between">
                  
                  {/* Top Row: Left Spec Card & Right Verification Card */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 pointer-events-auto">
                    
                    {/* Left Panel: Active Spec & Telemetry */}
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full md:w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 p-5 rounded-2xl shadow-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          ACTIVE SPECIFICATION
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          3D CSG
                        </span>
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                          {aiResult?.modelName || "PROCEDURAL_CAD_NODE"}
                        </h2>
                        <p className="text-xs text-zinc-300 font-medium mt-1 leading-relaxed line-clamp-2">
                          "{activePrompt}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700/60">
                          <span className="text-zinc-400 block mb-0.5">TYPE</span>
                          <span className="font-bold text-white truncate block">{aiResult?.modelType || "Component"}</span>
                        </div>
                        <div className="bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700/60">
                          <span className="text-zinc-400 block mb-0.5">COMPLEXITY</span>
                          <span className="font-bold text-indigo-300 block">Level 4 Solid</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Right Panel: Verification Breakdown */}
                    {aiResult && (
                      <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-full md:w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 p-5 rounded-2xl shadow-2xl space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <Check size={13} />
                            INTEGRITY AUDIT
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300 font-bold">
                            PASS 100%
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                          {aiResult.expectedComponents?.map((component, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/50">
                              <span className="text-zinc-200 font-medium truncate">{component}</span>
                              <Check size={12} className="text-emerald-400 shrink-0 ml-2" />
                            </div>
                          ))}
                        </div>

                        {aiResult.inspectionHighlights?.[0] && (
                          <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-300 leading-relaxed font-mono">
                            <span className="text-indigo-400 font-bold block mb-0.5">NOTE:</span>
                            {aiResult.inspectionHighlights[0]}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Bottom Action Dock */}
                  <div className="w-full max-w-xl mx-auto pointer-events-auto pb-2">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 p-2.5 rounded-2xl shadow-2xl flex items-center gap-3"
                    >
                      <button 
                        onClick={() => {
                          setActivePrompt("");
                          setAiResult(null);
                        }}
                        className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all font-mono cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button 
                        onClick={onExplore}
                        className="flex-1 py-3 px-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group font-mono cursor-pointer"
                      >
                        <Sparkles size={14} className="text-indigo-200" />
                        <span>Open In Full CAD Studio</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
