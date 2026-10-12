import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Database,
  Ruler,
  Microscope,
  Activity,
  Layers,
  Terminal,
  Cpu,
  BarChart2,
  Sparkles,
  Compass,
  GitBranch,
  FileText,
  Code,
  Save,
  FileUp,
  Download,
  Info,
  ChevronDown,
  CheckCircle2,
  Zap,
  History,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { EngineeringExportDisclaimerModal } from "./EngineeringExportDisclaimerModal";
import { AutoSaveStatusBadge } from "./AutoSaveStatusBadge";
import { TeamPresence } from "./ui/team-presence";
import { TechnicalAIResponse, MaterialOption } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useDesignHistory } from "../lib/useHistoryStore";
import { cn } from "../lib/utils";

interface WorkspaceHeaderProps {
  onBack: () => void;
  hasModel: boolean;
  currentDesign: TechnicalAIResponse | null;
  showParametricPanel: boolean;
  setShowParametricPanel: React.Dispatch<React.SetStateAction<boolean>>;
  showIntelligenceSidebar: boolean;
  setShowIntelligenceSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showEngineering: boolean;
  setShowEngineering: React.Dispatch<React.SetStateAction<boolean>>;
  showHistory: boolean;
  setShowHistory: React.Dispatch<React.SetStateAction<boolean>>;
  showDesignPanel: boolean;
  setShowDesignPanel: React.Dispatch<React.SetStateAction<boolean>>;
  activeAnalysisTool: string;
  setActiveAnalysisTool: (tool: any) => void;
  handleSave: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleExportSessionParametersJson: () => void;
  handleExportDrawing: () => void;
  handleExport: () => void;
  handleOpenCadExport?: () => void;
  autoSave: any;
  showMaterialDock: boolean;
  setShowMaterialDock: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMaterial: MaterialOption;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  onBack,
  hasModel,
  currentDesign,
  showParametricPanel,
  setShowParametricPanel,
  showIntelligenceSidebar,
  setShowIntelligenceSidebar,
  showEngineering,
  setShowEngineering,
  showHistory,
  setShowHistory,
  showDesignPanel,
  setShowDesignPanel,
  activeAnalysisTool,
  setActiveAnalysisTool,
  handleSave,
  handleImport,
  fileInputRef,
  handleExportSessionParametersJson,
  handleExportDrawing,
  handleExport,
  handleOpenCadExport,
  autoSave,
  showMaterialDock,
  setShowMaterialDock,
  selectedMaterial,
}) => {
  const [openDropdown, setOpenDropdown] = useState<"physics" | "code" | "export" | null>(null);
  const [exportDisclaimerOpen, setExportDisclaimerOpen] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<{ name: string; action: () => void } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { nodes } = useDesignHistory();

  const triggerGuardedExport = (formatName: string, action: () => void) => {
    const isAcknowledged = sessionStorage.getItem('polystrukt_export_disclaimer_ack') === 'true';
    if (isAcknowledged) {
      action();
    } else {
      setPendingExportFormat({ name: formatName, action });
      setExportDisclaimerOpen(true);
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const modelTitle = currentDesign?.specs
    ?.split("\n")
    ?.find((l) => l.startsWith("TITLE:") || l.startsWith("NAME:"))
    ?.replace(/^(TITLE:|NAME:)/, "")
    ?.trim() || (hasModel ? "Active Solid Model" : "Parametric Studio");

  const isPhysicsActive = [
    "fem",
    "cloudfea",
    "waveform",
    "schematic",
    "cnc",
    "impact"
  ].includes(activeAnalysisTool);

  const isCodeActive = [
    "docs",
    "cadcode",
    "gitcad",
    "gdt",
    "bom",
    "console"
  ].includes(activeAnalysisTool);

  return (
    <header
      ref={dropdownRef}
      className="h-14 border-b border-white/10 bg-zinc-950/95 backdrop-blur-2xl px-3 sm:px-4 flex items-center justify-between z-40 relative select-none shadow-lg text-white font-sans"
    >
      {/* 1. LEFT CLUSTER: Navigation & Project Identity */}
      <div className="flex items-center gap-3">
        <motion.button
          data-testid="workspace-back-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="h-8 px-2.5 bg-zinc-900/90 border border-white/10 rounded-lg hover:bg-zinc-800 hover:border-white/20 transition-all flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white"
          title="Exit to Dashboard"
        >
          <ArrowLeft size={13} />
          <span className="text-xs font-medium">Exit</span>
        </motion.button>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Database size={13} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-white">
                PolyStrukt CAD
              </span>
              <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/10 px-1 py-0.2 rounded border border-indigo-500/20">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                hasModel ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
              )} />
              <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[110px] sm:max-w-[170px]">
                {modelTitle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CENTER CLUSTER: CAD Command Suite (ONLY VISIBLE WHEN A MODEL IS GENERATED) */}
      {hasModel ? (
        <div className="flex items-center gap-2">
          {/* Core Mode Switchers */}
          <div className="bg-zinc-900/80 p-1 border border-white/10 rounded-xl flex items-center gap-1 backdrop-blur-md">
            
            {/* 3D Viewport Reset / Mode */}
            <button
              onClick={() => setActiveAnalysisTool("none")}
              className={cn(
                "h-7 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer",
                activeAnalysisTool === "none"
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              )}
              title="Interactive 3D Solid Model Viewport"
            >
              <Compass size={13} className="text-indigo-400" />
              <span>3D Model</span>
            </button>

            {/* Physics & Simulation Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "physics" ? null : "physics")}
                className={cn(
                  "h-7 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer",
                  openDropdown === "physics" || isPhysicsActive
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                )}
                title="Physics, FEA, Stress & CNC Machining Analysis"
              >
                <Cpu size={13} className="text-rose-400" />
                <span className="hidden md:inline">Simulation</span>
                <ChevronDown size={11} className={cn("transition-transform opacity-70", openDropdown === "physics" && "rotate-180")} />
              </button>

              <AnimatePresence>
                {openDropdown === "physics" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-9 left-0 w-64 bg-zinc-950/98 backdrop-blur-2xl border border-white/15 rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5"
                  >
                    <div className="px-2.5 py-1 border-b border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Physics & Verification</span>
                      <span className="text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded">SimEngine</span>
                    </div>

                    {[
                      { id: "fem", icon: Cpu, title: "FEM Stress Simulator", desc: "Von Mises & boundary deflection", color: "text-rose-400" },
                      { id: "cloudfea", icon: Zap, title: "Cloud FEA Solver", desc: "Multi-core physics cloud compute", color: "text-rose-400" },
                      { id: "waveform", icon: Activity, title: "Waveform Dynamics", desc: "Stress frequency oscillations", color: "text-indigo-400" },
                      { id: "schematic", icon: Layers, title: "Orthographic Viewer", desc: "Multi-projection drafting", color: "text-sky-400" },
                      { id: "cnc", icon: Compass, title: "CNC Tooling & CAM", desc: "G-code & milling path solver", color: "text-cyan-400" },
                      { id: "impact", icon: BarChart2, title: "Engineering Impact", desc: "Carbon footprint, mass & cost", color: "text-amber-400" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveAnalysisTool(item.id);
                            setOpenDropdown(null);
                          }}
                          className={cn(
                            "w-full p-2 rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer text-xs",
                            activeAnalysisTool === item.id 
                              ? "bg-rose-500/20 text-rose-200 font-semibold" 
                              : "hover:bg-white/5 text-zinc-300 hover:text-white"
                          )}
                        >
                          <Icon size={14} className={item.color} />
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-[10px] text-zinc-500 font-normal">{item.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Code & Specs Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "code" ? null : "code")}
                className={cn(
                  "h-7 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer",
                  openDropdown === "code" || isCodeActive
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                )}
                title="CAD Code, CSG Tree, Git-for-CAD, GD&T, and Documentation"
              >
                <Code size={13} className="text-emerald-400" />
                <span className="hidden md:inline">Code & Specs</span>
                <ChevronDown size={11} className={cn("transition-transform opacity-70", openDropdown === "code" && "rotate-180")} />
              </button>

              <AnimatePresence>
                {openDropdown === "code" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-9 left-0 w-64 bg-zinc-950/98 backdrop-blur-2xl border border-white/15 rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5"
                  >
                    <div className="px-2.5 py-1 border-b border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Code, Git & Specs</span>
                      <span className="text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">ASME & CSG</span>
                    </div>

                    {[
                      { id: "docs", icon: FileText, title: "CSG Documentation", desc: "Primitives graph & review", color: "text-emerald-400" },
                      { id: "cadcode", icon: Code, title: "CAD Code Studio", desc: "OpenSCAD, Three.js & Python", color: "text-purple-400" },
                      { id: "gitcad", icon: GitBranch, title: "Git-for-CAD Versioning", desc: "Branching & commit history", color: "text-indigo-400" },
                      { id: "gdt", icon: Ruler, title: "GD&T ASME Y14.5", desc: "Feature control frames", color: "text-sky-400" },
                      { id: "bom", icon: Database, title: "Bill of Materials (BOM)", desc: "Parts & stock inventory", color: "text-orange-400" },
                      { id: "console", icon: Terminal, title: "Operator HUD CLI", desc: "Direct command terminal", color: "text-emerald-400" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveAnalysisTool(item.id);
                            setOpenDropdown(null);
                          }}
                          className={cn(
                            "w-full p-2 rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer text-xs",
                            activeAnalysisTool === item.id 
                              ? "bg-emerald-500/20 text-emerald-200 font-semibold" 
                              : "hover:bg-white/5 text-zinc-300 hover:text-white"
                          )}
                        >
                          <Icon size={14} className={item.color} />
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-[10px] text-zinc-500 font-normal">{item.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Copilot Toggle */}
            <button
              onClick={() => setActiveAnalysisTool(activeAnalysisTool === "assistant" ? "none" : "assistant")}
              className={cn(
                "h-7 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer",
                activeAnalysisTool === "assistant"
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-sm"
                  : "bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
              title="Gemini AI Engineering Assistant"
            >
              <Sparkles size={13} className="text-purple-400" />
              <span className="hidden lg:inline">AI Copilot</span>
            </button>
          </div>

          {/* Quick Inspector Docks */}
          <div className="bg-zinc-900/80 p-1 border border-white/10 rounded-xl flex items-center gap-0.5 backdrop-blur-md">
            {/* Direct Documentation Button */}
            <button
              data-testid="workspace-docs-btn"
              onClick={() => setActiveAnalysisTool(activeAnalysisTool === "docs" ? "none" : "docs")}
              className={cn(
                "h-7 px-2 rounded-lg border flex items-center gap-1 text-xs font-medium transition-all cursor-pointer hidden xl:flex",
                activeAnalysisTool === "docs"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
              title="Open CSG Documentation"
            >
              <FileText size={12} className="text-emerald-400" />
              <span>Docs</span>
            </button>

            {/* Parametrics Toggle */}
            <button
              onClick={() => setShowParametricPanel((prev) => !prev)}
              className={cn(
                "h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer",
                showParametricPanel
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              )}
              title="Toggle Parametric Dimension Sliders"
            >
              <Ruler size={13} />
            </button>

            {/* Intelligence Sidebar Toggle */}
            <button
              onClick={() => setShowIntelligenceSidebar((prev) => !prev)}
              className={cn(
                "h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer",
                showIntelligenceSidebar
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              )}
              title="Toggle Intelligence Core"
            >
              <Microscope size={13} />
            </button>

            {/* History Versions Toggle */}
            <button
              data-testid="workspace-history-btn"
              onClick={() => setShowHistory((prev) => !prev)}
              className={cn(
                "h-7 px-2 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer",
                showHistory
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-xs"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              )}
              title="Model Version History & Rollback"
            >
              <History size={13} className="text-purple-400" />
              <span className="hidden md:inline font-mono">History</span>
              {nodes.length > 0 && (
                <span className="px-1 py-0.2 bg-purple-500/25 border border-purple-500/40 rounded text-[9px] font-mono text-purple-300 font-bold">
                  {nodes.length}
                </span>
              )}
            </button>

            {/* Design Protocol / Specs Drawer Toggle */}
            <button
              data-testid="workspace-toggle-panel"
              onClick={() => setShowDesignPanel((prev) => !prev)}
              className={cn(
                "h-7 w-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer",
                showDesignPanel
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              )}
              title="Design Protocol Specifications"
            >
              <Info size={13} />
            </button>
          </div>
        </div>
      ) : (
        /* Minimalist status tag when no model exists */
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/5 text-xs text-zinc-400 font-mono">
          <Sparkles size={12} className="text-indigo-400" />
          <span>Synthesis Ready</span>
        </div>
      )}

      {/* 3. RIGHT CLUSTER: Material, Export, Save & Node Presence */}
      <div className="flex items-center gap-2">
        {hasModel && (
          <>
            {/* Material Selector Pill */}
            <button
              onClick={() => setShowMaterialDock((prev) => !prev)}
              className={cn(
                "h-8 px-2.5 rounded-lg border hidden lg:flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer",
                showMaterialDock
                  ? "bg-zinc-800 border-indigo-500/40 text-indigo-300"
                  : "bg-zinc-900/90 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800"
              )}
              title="Active Material Profile"
            >
              <Layers size={13} className={selectedMaterial.color} />
              <span className="truncate max-w-[85px]">{selectedMaterial.name.split(" ")[0]}</span>
            </button>

            {/* Direct JSON Parameter Export Trigger */}
            <button
              data-testid="workspace-export-params-direct-btn"
              onClick={() => triggerGuardedExport("Parameters (JSON)", handleExportSessionParametersJson)}
              className="h-8 px-2 bg-zinc-900/90 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg text-xs font-medium transition-all hidden xl:flex items-center gap-1 cursor-pointer"
              title="Export CAD scene configuration as JSON"
            >
              <Database size={12} className="text-emerald-400" />
              <span>JSON</span>
            </button>

            {/* Quick Open in External CAD Button */}
            {handleOpenCadExport && (
              <button
                data-testid="workspace-quick-open-cad-btn"
                onClick={handleOpenCadExport}
                className="h-8 px-2.5 bg-indigo-950/40 border border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-900/50 text-indigo-300 hover:text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Open or export to Onshape, SolidWorks, Fusion 360, STEP AP242"
              >
                <Zap size={13} className="text-indigo-400" />
                <span className="hidden sm:inline">Open In CAD</span>
              </button>
            )}

            {/* EXPORT HUB DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "export" ? null : "export")}
                className="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Export 3D Model, Technical Drawing, or Session JSON"
              >
                <Download size={13} />
                <span>Export</span>
                <ChevronDown size={11} className={cn("transition-transform opacity-75", openDropdown === "export" && "rotate-180")} />
              </button>

              <AnimatePresence>
                {openDropdown === "export" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-10 right-0 w-72 bg-zinc-950/98 backdrop-blur-2xl border border-white/15 rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5"
                  >
                    <div className="px-2.5 py-1 border-b border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Export Formats</span>
                      <span className="text-indigo-400">Production Hub</span>
                    </div>

                    {handleOpenCadExport && (
                      <button
                        data-testid="workspace-open-in-cad-menu-btn"
                        onClick={() => {
                          handleOpenCadExport();
                          setOpenDropdown(null);
                        }}
                        className="w-full p-2 rounded-lg text-left flex items-center gap-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-zinc-100 hover:text-white transition-colors cursor-pointer text-xs mb-1"
                      >
                        <Zap size={14} className="text-indigo-400 shrink-0" />
                        <div>
                          <div className="font-bold flex items-center gap-1.5 text-white">
                            <span>Open In External CAD</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500 text-white font-semibold">
                              Parametric
                            </span>
                          </div>
                          <div className="text-[10px] text-indigo-300/80">
                            Onshape, SolidWorks, Fusion, STEP AP242
                          </div>
                        </div>
                      </button>
                    )}

                    <button
                      data-testid="workspace-export-btn"
                      onClick={() => {
                        triggerGuardedExport("3D Solid Model (.GLB)", handleExport);
                        setOpenDropdown(null);
                      }}
                      className="w-full p-2 rounded-lg text-left flex items-center gap-2 hover:bg-white/5 text-zinc-200 hover:text-white transition-colors cursor-pointer text-xs"
                    >
                      <Download size={13} className="text-indigo-400" />
                      <div>
                        <div className="font-semibold">3D Solid Model (.GLB)</div>
                        <div className="text-[10px] text-zinc-500">Watertight polygon mesh</div>
                      </div>
                    </button>

                    <button
                      data-testid="workspace-export-drawing-btn"
                      onClick={() => {
                        triggerGuardedExport("Engineering Drawing (PDF)", handleExportDrawing);
                        setOpenDropdown(null);
                      }}
                      className="w-full p-2 rounded-lg text-left flex items-center gap-2 hover:bg-white/5 text-zinc-200 hover:text-white transition-colors cursor-pointer text-xs"
                    >
                      <FileText size={13} className="text-sky-400" />
                      <div>
                        <div className="font-semibold">Engineering Drawing (PDF)</div>
                        <div className="text-[10px] text-zinc-500">ASME Y14.5 blueprint</div>
                      </div>
                    </button>

                    <button
                      data-testid="workspace-export-params-btn"
                      onClick={() => {
                        triggerGuardedExport("Parameters (JSON)", handleExportSessionParametersJson);
                        setOpenDropdown(null);
                      }}
                      className="w-full p-2 rounded-lg text-left flex items-center gap-2 hover:bg-white/5 text-zinc-200 hover:text-white transition-colors cursor-pointer text-xs"
                    >
                      <Database size={13} className="text-emerald-400" />
                      <div>
                        <div className="font-semibold">Parameters (JSON)</div>
                        <div className="text-[10px] text-zinc-500">Procedural CAD specs</div>
                      </div>
                    </button>

                    {/* Liability and Stamp Precautionary Notice in Dropdown */}
                    <div className="pt-1.5 mt-1 border-t border-white/10 px-2 py-1 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1 text-amber-400/90">
                        <AlertTriangle size={10} />
                        <span>PE Stamp Required</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('open-legal', { detail: { tab: 'safety' } }));
                          setOpenDropdown(null);
                        }}
                        className="text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        Safety Policy
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Save and Import buttons (always available) */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            data-testid="workspace-save-btn"
            onClick={handleSave}
            className="h-8 px-2 bg-zinc-900/90 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1 cursor-pointer"
            title="Save Workspace Project"
          >
            <Save size={12} />
            <span className="hidden md:inline">Save</span>
          </button>

          <button
            data-testid="workspace-import-btn"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-2 bg-zinc-900/90 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all hidden md:flex items-center gap-1 cursor-pointer"
            title="Import CAD File (.glb, .json, .scad)"
          >
            <FileUp size={12} />
            <span>Import</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".glb,.gltf,.json,.scad,.ts,.js,.py"
          className="hidden"
        />

        {/* AutoSave Status Badge */}
        <AutoSaveStatusBadge
          status={autoSave.status}
          lastSavedText={autoSave.lastSavedText}
          lastSaved={autoSave.lastSaved}
          lastRevisionId={autoSave.lastRevisionId}
          versionNumber={autoSave.versionNumber}
          intervalSeconds={autoSave.intervalSeconds}
          onIntervalChange={autoSave.setIntervalSeconds}
          isEnabled={autoSave.isEnabled}
          onToggleEnabled={autoSave.setIsEnabled}
          isOnline={autoSave.isOnline}
          onSyncNow={autoSave.syncNow}
          hasRecoverableSession={autoSave.hasRecoverableSession}
          recoverableSnapshot={autoSave.recoverableSnapshot}
          recoverableSource={autoSave.recoverableSource}
          onRestoreSession={autoSave.restoreSession}
          onDismissRecovery={autoSave.dismissRecovery}
          token={useAuth.getState().token}
          onRestoreSnapshot={() => {}}
        />

        {/* Engineer Presence */}
        <TeamPresence />
      </div>

      {/* Engineering Safety Gate Modal */}
      <EngineeringExportDisclaimerModal
        isOpen={exportDisclaimerOpen}
        onClose={() => {
          setExportDisclaimerOpen(false);
          setPendingExportFormat(null);
        }}
        onConfirmExport={() => {
          if (pendingExportFormat) {
            pendingExportFormat.action();
            setPendingExportFormat(null);
          }
        }}
        exportFormatName={pendingExportFormat?.name || 'Asset'}
        onOpenLegal={(tab) => {
          window.dispatchEvent(new CustomEvent('open-legal', { detail: { tab } }));
        }}
      />
    </header>
  );
};
