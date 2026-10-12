import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ruler,
  Layers,
  Activity,
  Flame,
  FileText,
  Cpu,
  BarChart2,
  Code,
  GitBranch,
  Terminal,
  Microscope,
  Compass,
  Eye,
  Box,
  Sliders,
  Scissors,
  Download,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Maximize2,
  Minimize2,
  Send,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Check,
  PlusCircle,
  EyeOff
} from 'lucide-react';
import { AnalysisToolType } from '../WorkspaceAnalysisHost';
import { CadStandardView } from './CadViewCube';

interface CadWorkspaceToolbarProps {
  // View & Geometry Toggles
  showPlanes: boolean;
  setShowPlanes: (v: boolean | ((prev: boolean) => boolean)) => void;
  showDimensions: boolean;
  setShowDimensions: (v: boolean | ((prev: boolean) => boolean)) => void;
  measureMode: boolean;
  setMeasureMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  xrayMode: boolean;
  setXrayMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  isOrtho: boolean;
  setIsOrtho: (v: boolean | ((prev: boolean) => boolean)) => void;
  onSelectView: (view: CadStandardView) => void;
  onResetView: () => void;
  
  // Section Slicer & Explode
  sectionCut: { enabled: boolean; axis: 'x' | 'y' | 'z'; offset: number };
  setSectionCut: React.Dispatch<React.SetStateAction<{ enabled: boolean; axis: 'x' | 'y' | 'z'; offset: number }>>;
  explosionFactor: number;
  setExplosionFactor: (v: number) => void;

  // Analysis Tools
  activeAnalysisTool: AnalysisToolType;
  setActiveAnalysisTool: (tool: AnalysisToolType) => void;
  onOpenExport: () => void;
  onOpenMaterialDock: () => void;

  // In-Workspace AI Synthesis
  onSynthesize: (prompt: string) => void;
  isSynthesizing: boolean;
  className?: string;
}

export const CadWorkspaceToolbar: React.FC<CadWorkspaceToolbarProps> = ({
  showPlanes,
  setShowPlanes,
  showDimensions,
  setShowDimensions,
  measureMode,
  setMeasureMode,
  xrayMode,
  setXrayMode,
  isOrtho,
  setIsOrtho,
  onSelectView,
  onResetView,
  sectionCut,
  setSectionCut,
  explosionFactor,
  setExplosionFactor,
  activeAnalysisTool,
  setActiveAnalysisTool,
  onOpenExport,
  onOpenMaterialDock,
  onSynthesize,
  isSynthesizing,
  className = ''
}) => {
  const [showAnalysisMenu, setShowAnalysisMenu] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showExplodeMenu, setShowExplodeMenu] = useState(false);
  const [showSynthesizeMenu, setShowSynthesizeMenu] = useState(false);
  const [promptText, setPromptText] = useState('');

  const engineeringPresets = [
    { title: "Planetary Flange Bearing Carrier", prompt: "Design an aerospace-grade high-load planetary bearing carrier with 8-bolt circular flange, stiffener ribs, circumferential cooling fins, and dual internal stepped bearing bores." },
    { title: "Articulated Robotic Arm Link", prompt: "Design an articulated robotic arm link with dual clevis knuckles, NEMA servo mount, cable channel, and weight-relief pockets." },
    { title: "Centrifugal Impeller Volute", prompt: "Design a high-efficiency centrifugal pump impeller volute housing with spiral expansion chamber, central suction bore, and tangential discharge port." },
    { title: "Vented Disc Brake Rotor", prompt: "Design a high-performance vented brake rotor with 5-lug bolt pattern, directional internal cooling vanes, cross-drilled rotor surface, and center hub." },
    { title: "Hydraulic Manifold Block", prompt: "Design a multi-port hydraulic manifold block with cross-drilled fluid galleries, O-ring groove counterbores, and high-pressure valve mounting cavities." },
    { title: "Aerospace Stiffener Bracket", prompt: "Design an aerospace 90-degree angle bracket with triangular stiffener gussets, lightweight pocketing, and 4x countersunk fastener holes." }
  ];

  const handlePresetSelect = (presetPrompt: string) => {
    setPromptText(presetPrompt);
    onSynthesize(presetPrompt);
    setShowSynthesizeMenu(false);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onSynthesize(promptText.trim());
    setShowSynthesizeMenu(false);
  };

  return (
    <div className={`w-full bg-zinc-900 border-b border-zinc-800 text-xs select-none ${className}`}>
      {/* Onshape / Inventor Docked Horizontal Tool Ribbon */}
      <div className="flex items-center justify-between px-3 py-1.5 gap-2 overflow-x-auto custom-scrollbar">
        {/* Left Section: Create / Synthesize Feature */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSynthesizeMenu(!showSynthesizeMenu);
                setShowAnalysisMenu(false);
                setShowSectionMenu(false);
                setShowExplodeMenu(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                showSynthesizeMenu || isSynthesizing
                  ? "bg-zinc-800 text-sky-400 border-sky-500/40"
                  : "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border-zinc-700/60"
              }`}
              title="Create new 3D feature or synthesize CAD assembly"
            >
              {isSynthesizing ? (
                <Loader2 size={13} className="animate-spin text-sky-400" />
              ) : (
                <PlusCircle size={13} className="text-sky-400" />
              )}
              <span>Synthesize Feature</span>
              <ChevronDown size={11} className="text-zinc-400" />
            </button>

            {/* Synthesize / Generative Command Dropdown */}
            <AnimatePresence>
              {showSynthesizeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  className="absolute left-0 top-full mt-1.5 w-96 bg-zinc-900 border border-zinc-700 rounded-md p-3 shadow-2xl z-50 space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-200">
                      Create CAD Feature
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSynthesizeMenu(false)}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  {/* Prompt Form */}
                  <form onSubmit={handlePromptSubmit} className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. Planetary gearbox, mounting bracket, flanged valve..."
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-sky-500 font-mono"
                      disabled={isSynthesizing}
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="submit"
                        disabled={isSynthesizing || !promptText.trim()}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {isSynthesizing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        <span>Synthesize</span>
                      </button>
                    </div>
                  </form>

                  {/* Presets List */}
                  <div className="pt-1.5 border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block mb-1">
                      Quick Engineering Presets
                    </span>
                    <div className="space-y-0.5 max-h-36 overflow-y-auto custom-scrollbar">
                      {engineeringPresets.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePresetSelect(p.prompt)}
                          className="w-full text-left px-2 py-1 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition-colors truncate"
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-750 mx-1 shrink-0" />

        {/* Center Section: CAD View & Inspection Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Datum Planes Toggle */}
          <button
            type="button"
            onClick={() => setShowPlanes((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              showPlanes
                ? "bg-zinc-800 text-sky-400 border-zinc-700"
                : "bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/50"
            }`}
            title="Toggle Datum Reference Planes (Top, Front, Right)"
          >
            <Box size={13} />
            <span>Planes</span>
          </button>

          {/* Dimensions Toggle */}
          <button
            type="button"
            onClick={() => setShowDimensions((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              showDimensions
                ? "bg-zinc-800 text-sky-400 border-zinc-700"
                : "bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/50"
            }`}
            title="Toggle 3D Dimensions & Caliper Bounding Box"
          >
            <Ruler size={13} />
            <span>Dimensions</span>
          </button>

          {/* Measure Tool */}
          <button
            type="button"
            onClick={() => setMeasureMode((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              measureMode
                ? "bg-zinc-800 text-amber-400 border-zinc-700"
                : "bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/50"
            }`}
            title="Point-to-Point Caliper Measurement Tool"
          >
            <Sliders size={13} />
            <span>Measure</span>
          </button>

          {/* Section Slicer Tool */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSectionMenu(!showSectionMenu);
                setShowExplodeMenu(false);
                setShowAnalysisMenu(false);
                setShowSynthesizeMenu(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                sectionCut.enabled
                  ? "bg-zinc-800 text-rose-400 border-zinc-700"
                  : "bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/50"
              }`}
              title="Section Analysis / Slicer"
            >
              <Scissors size={13} />
              <span>Section View</span>
              <ChevronDown size={10} />
            </button>

            {/* Section View Popover */}
            <AnimatePresence>
              {showSectionMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  className="absolute left-0 top-full mt-1.5 w-60 bg-zinc-900 border border-zinc-700 rounded-md p-3 shadow-xl z-50 space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-200">Section Plane</span>
                    <button
                      type="button"
                      onClick={() => setSectionCut((prev) => ({ ...prev, enabled: !prev.enabled }))}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        sectionCut.enabled ? "bg-rose-600 text-white" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {sectionCut.enabled ? "Active" : "Off"}
                    </button>
                  </div>

                  <div className="flex gap-1">
                    {(['x', 'y', 'z'] as const).map((axis) => (
                      <button
                        key={axis}
                        type="button"
                        onClick={() => setSectionCut((prev) => ({ ...prev, axis, enabled: true }))}
                        className={`flex-1 py-1 rounded border text-[10px] uppercase font-mono ${
                          sectionCut.axis === axis
                            ? "bg-zinc-800 border-rose-500 text-rose-300"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        {axis.toUpperCase()} Cut
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Offset</span>
                      <span>{sectionCut.offset} mm</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={sectionCut.offset}
                      onChange={(e) => setSectionCut((prev) => ({ ...prev, offset: Number(e.target.value), enabled: true }))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Exploded View Tool */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowExplodeMenu(!showExplodeMenu);
                setShowSectionMenu(false);
                setShowAnalysisMenu(false);
                setShowSynthesizeMenu(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                explosionFactor > 0
                  ? "bg-zinc-800 text-amber-400 border-zinc-700"
                  : "bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/50"
              }`}
              title="Exploded Assembly View"
            >
              <span>Explode</span>
              <span className="text-[9px] text-zinc-500">{(explosionFactor * 100).toFixed(0)}%</span>
            </button>

            {/* Explode Popover */}
            <AnimatePresence>
              {showExplodeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  className="absolute left-0 top-full mt-1.5 w-52 bg-zinc-900 border border-zinc-700 rounded-md p-3 shadow-xl z-50 space-y-2"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-200">Explode Factor</span>
                    <button
                      type="button"
                      onClick={() => setExplosionFactor(0)}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      Collapse
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={explosionFactor}
                    onChange={(e) => setExplosionFactor(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* X-Ray Translucent Mode */}
          <button
            type="button"
            onClick={() => setXrayMode((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              xrayMode
                ? "bg-zinc-800 text-indigo-400 border-zinc-700"
                : "bg-transparent text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-800/50"
            }`}
            title="Translucent X-Ray Inspection"
          >
            <Eye size={13} />
            <span>X-Ray</span>
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-750 mx-1 shrink-0" />

        {/* Right Section: Analysis Hub, Material, Export */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Master Analysis Tools Hub */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAnalysisMenu(!showAnalysisMenu);
                setShowSectionMenu(false);
                setShowExplodeMenu(false);
                setShowSynthesizeMenu(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                activeAnalysisTool !== "none"
                  ? "bg-zinc-800 text-sky-400 border-sky-500/50"
                  : "bg-transparent text-zinc-300 hover:text-white border-transparent hover:bg-zinc-800/50"
              }`}
              title="Engineering Analysis Tools"
            >
              <Activity size={13} className="text-sky-400" />
              <span>Analysis Tools</span>
              <ChevronDown size={11} className={`text-zinc-400 transition-transform ${showAnalysisMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Analysis Tools Dropdown */}
            <AnimatePresence>
              {showAnalysisMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  className="absolute right-0 top-full mt-1.5 w-72 bg-zinc-900 border border-zinc-700 rounded-md p-2.5 shadow-2xl z-50 space-y-1.5 max-h-[460px] overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-200">Analysis Suite</span>
                    {activeAnalysisTool !== "none" && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveAnalysisTool("none");
                          setShowAnalysisMenu(false);
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300"
                      >
                        Close Active
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'fem' as AnalysisToolType, label: 'FEA Stress Sim', desc: 'Finite element mesh', icon: Microscope },
                      { id: 'waveform' as AnalysisToolType, label: 'Waveform Stress', desc: 'Cyclic fatigue', icon: Activity },
                      { id: 'schematic' as AnalysisToolType, label: '2D Blueprint', desc: 'Orthographic drawing', icon: Layers },
                      { id: 'cnc' as AnalysisToolType, label: 'CNC Toolpaths', desc: 'Machining solver', icon: Cpu },
                      { id: 'bom' as AnalysisToolType, label: 'BOM Generator', desc: 'Bill of materials', icon: FileText },
                      { id: 'gdt' as AnalysisToolType, label: 'GD&T Tolerancing', desc: 'Geometric datums', icon: Ruler },
                      { id: 'cloudfea' as AnalysisToolType, label: 'Cloud FEA', desc: 'High-density solver', icon: BarChart2 },
                      { id: 'cadcode' as AnalysisToolType, label: 'CAD Code', desc: 'OpenSCAD & Python', icon: Code },
                      { id: 'impact' as AnalysisToolType, label: 'Eco Impact', desc: 'Embodied carbon', icon: ShieldCheck },
                      { id: 'console' as AnalysisToolType, label: 'Console', desc: 'Parameters & feed', icon: Terminal },
                      { id: 'assistant' as AnalysisToolType, label: 'CAD Assistant', desc: 'Design inspection', icon: Sparkles },
                      { id: 'docs' as AnalysisToolType, label: 'Specifications', desc: 'Verification report', icon: HelpCircle }
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          setActiveAnalysisTool(tool.id);
                          setShowAnalysisMenu(false);
                        }}
                        className={`p-1.5 rounded text-left transition-colors flex flex-col gap-0.5 cursor-pointer border ${
                          activeAnalysisTool === tool.id
                            ? "bg-zinc-800 border-sky-500 text-white"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-medium">
                          <tool.icon size={12} className="text-sky-400" />
                          <span className="truncate">{tool.label}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 truncate">{tool.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Material Switcher */}
          <button
            type="button"
            onClick={onOpenMaterialDock}
            className="px-2.5 py-1 rounded text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
            title="Select Material Alloy"
          >
            Material
          </button>

          {/* Standard CAD Platform Export */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1 px-3 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-medium transition-colors cursor-pointer shadow-sm"
            title="Export to STEP, STL, DXF, OBJ"
          >
            <Download size={12} />
            <span>Export CAD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
