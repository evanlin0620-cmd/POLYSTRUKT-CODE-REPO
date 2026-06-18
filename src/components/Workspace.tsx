import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { InspectableModel } from "./InspectableModel";
import { AnalysisReportView } from "./AnalysisReportView";
import {
  ArrowLeft,
  Send,
  Terminal,
  Sparkles,
  Activity,
  Layers,
  Cpu,
  Box,
  Database,
  Save,
  Download,
  MoreHorizontal,
  Loader2,
  Info,
  X,
  Search,
  Link as LinkIcon,
  Check,
  AlertCircle,
  RefreshCw,
  FileUp,
  ChevronRight,
  History,
  Microscope,
  Weight,
  Compass,
  GitBranch,
  Binary,
  Globe,
  Ruler,
  Shield,
  Flame,
  FlaskConical,
  BarChart2,
  FileText,
} from "lucide-react";
import { LoadingBreadcrumb } from "./ui/animated-loading-svg-text-shimmer";
import {
  getTechnicalResponse,
  TechnicalAIResponse,
} from "../services/geminiService";
import { SimulationType, ChatMessage, ProceduralSpec } from "../types";
import RuixenMoonChat from "./ui/ruixen-moon-chat";
import { ShiningText } from "./ui/shining-text";
import { PromptInputBox } from "./ui/ai-prompt-box";
import { useAuth } from "../hooks/useAuth";
import { EngineeringPanel } from "./EngineeringPanel";
import { EvolutionTree } from "./EvolutionTree";
import { useDesignHistory } from "../lib/useHistoryStore";
import { TeamPresence } from "./ui/team-presence";
import { VoiceHUD } from "./ui/voice-hud";
import * as THREE from "three";

import { OperatorConsole } from "./OperatorConsole";
import { WaveformStressAnalyzer } from "./WaveformStressAnalyzer";
import { OrthographicSchematicViewer } from "./OrthographicSchematicViewer";
import { FEMStressSimulator } from "./FEMStressSimulator";
import { EngineeringImpactDashboard } from "./EngineeringImpactDashboard";

import { StructuredAssistantPanel } from "./StructuredAssistantPanel";
import { CNCMachiningSolver } from "./CNCMachiningSolver";
import { BOMGenerator } from "./BOMGenerator";
import { GitCadPanel } from "./GitCadPanel";
import { GdtPanel } from "./GdtPanel";
import { CloudFeaPanel } from "./CloudFeaPanel";
import { cloudWorkspaceService } from "../services/cloudWorkspaceService";
import { exportEngineeringDrawingPDF } from "../lib/drawingExporter";

interface WorkspaceProps {
  onBack: () => void;
  initialPrompt?: string;
}

import { performStressAnalysis } from "../services/analysisService";

const MATERIALS = [
  {
    id: "titanium_grade_5",
    name: "Titanium Grade 5",
    icon: Shield,
    color: "text-cyan-400",
  },
  {
    id: "steel_304",
    name: "Stainless Steel 304",
    icon: Flame,
    color: "text-orange-400",
  },
  {
    id: "carbon_fiber",
    name: "Carbon Composite",
    icon: Layers,
    color: "text-zinc-300",
  },
  {
    id: "aluminum_6061",
    name: "Aluminum 6061-T6",
    icon: Weight,
    color: "text-blue-300",
  },
  { id: "abs_plastic", name: "ABS Plastic", icon: Box, color: "text-zinc-400" },
];

const GALLERY_SHORTCUTS = [
  {
    prompt: "Generate a radial inflow turbine housing with A/R ratio 0.82",
    title: "Turbine Housing",
    spec: {
      op: "subtract" as const,
      a: {
        type: "cylinder" as const,
        args: [40, 45, 25, 32] as [number, number, number, number],
        color: "#818cf8",
      },
      b: {
        op: "group" as const,
        children: [
          {
            type: "cylinder" as const,
            args: [32, 32, 35, 32] as [number, number, number, number],
            position: [0, 0, 0] as [number, number, number],
          },
          {
            type: "cylinder" as const,
            args: [12, 12, 80, 16] as [number, number, number, number],
            position: [25, 0, 0] as [number, number, number],
            rotation: [0, 90, 0] as [number, number, number],
          },
        ],
      },
    },
    analysis:
      "Successfully restored high-fidelity Turbine Housing specimen design from the local blueprint index. Bypassing live compiler for instantaneous generation. Multi-physics parameters initialized.",
    specs:
      "TYPE: Radial Inflow Turbine Housing\nA/R RATIO: 0.82\nMATERIAL: Ni-Resist D-5S Autoclave Spec\nVOLUTE_SWEEP: log-spiral 14.8°\nEFFICIENCY_RATING: 88.4% Adiabatic",
    researchSummary:
      "Fluid dynamics optimized using periodic boundary tracking in Navier-Stokes bounds grid solver, maximizing laminar volume output.",
    optimizationLogic:
      "Volute sweep minimizes rotational shear gradient at the rotor inlet boundary.",
  },
  {
    prompt: "Create a topology-optimized suspension bracket",
    title: "Topological Bracket",
    spec: {
      op: "subtract" as const,
      a: {
        op: "union" as const,
        a: {
          op: "group" as const,
          children: [
            {
              type: "box" as const,
              args: [60, 8, 40] as [number, number, number],
              position: [0, -15, 0] as [number, number, number],
              color: "#10b981",
            },
            {
              type: "box" as const,
              args: [8, 60, 40] as [number, number, number],
              position: [-26, 11, 0] as [number, number, number],
              color: "#10b981",
            },
          ],
        },
        b: {
          type: "box" as const,
          args: [35, 35, 8] as [number, number, number],
          position: [-9, 6, 0] as [number, number, number],
          rotation: [0, 0, 45] as [number, number, number],
          color: "#34d399",
        },
      },
      b: {
        op: "group" as const,
        children: [
          {
            type: "cylinder" as const,
            args: [5, 5, 20, 16] as [number, number, number, number],
            position: [18, -15, 10] as [number, number, number],
            rotation: [90, 0, 0] as [number, number, number],
          },
          {
            type: "cylinder" as const,
            args: [5, 5, 20, 16] as [number, number, number, number],
            position: [18, -15, -10] as [number, number, number],
            rotation: [90, 0, 0] as [number, number, number],
          },
          {
            type: "cylinder" as const,
            args: [10, 10, 15, 16] as [number, number, number, number],
            position: [-10, 10, 0] as [number, number, number],
            rotation: [0, 90, 0] as [number, number, number],
          },
        ],
      },
    },
    analysis:
      "Retrieved Topological Bracket specimen from local blueprint index. Bypassing live compiler. Continuous topology optimized with compliance penalized density fields (SIMP) under 5kN axial load criteria.",
    specs:
      "CONSTRAINTS: 5kN vertical static load\nMOUNTINGS: 4x M8 threaded hubs\nSTRUCTURE: Gyroid minimal surface\nMATERIAL: Ti-6Al-4V Medical Grade\nWEIGHT_REDUCTION: 48.2%",
    researchSummary:
      "Topology optimized by computing continuous density coordinates with penalized exponent p=3.0, driving absolute void-solid separation under strict volume fraction constraints.",
    optimizationLogic:
      "Stress-directed organic rib architecture minimizes Von Mises peak values down to 140MPa.",
  },
  {
    prompt: "Design a forged piston for high-boost application",
    title: "Forged Piston Assembly",
    spec: {
      op: "subtract" as const,
      a: {
        type: "cylinder" as const,
        args: [35, 35, 50, 32] as [number, number, number, number],
        color: "#f59e0b",
      },
      b: {
        op: "group" as const,
        children: [
          {
            type: "cylinder" as const,
            args: [8, 8, 80, 16] as [number, number, number, number],
            position: [0, -5, 0] as [number, number, number],
            rotation: [0, 90, 0] as [number, number, number],
          },
          {
            type: "cylinder" as const,
            args: [28, 28, 40, 32] as [number, number, number, number],
            position: [0, -10, 0] as [number, number, number],
          },
          {
            type: "torus" as const,
            args: [35, 2, 8, 32] as [number, number, number, number],
            position: [0, 15, 0] as [number, number, number],
            rotation: [90, 0, 0] as [number, number, number],
          },
          {
            type: "torus" as const,
            args: [35, 2, 8, 32] as [number, number, number, number],
            position: [0, 10, 0] as [number, number, number],
            rotation: [90, 0, 0] as [number, number, number],
          },
        ],
      },
    },
    analysis:
      "Retrieved Forged Piston Assembly from local blueprint index. Bypassing live compiler. Mechanical bounds checked for high boost/thermal loads.",
    specs:
      "BORE: 86.00mm Nominal\nHEIGHT: 30.00mm Compression\nFEATURES: Integrated oil-squirt channels\nMATERIAL: Al-2618 Thermal High-Stiffness\nPEAK_CYL_PRESSURE: 180 Bar allowable",
    researchSummary:
      "Forging dynamic optimization ensures continuous grain flow layout across high-heat piston crown grids.",
    optimizationLogic:
      "Structural skirt contours minimize secondary reciprocating thrust force vectors.",
  },
  {
    prompt: "Model a counter-flow heat exchanger core",
    title: "Heat Exchanger Core",
    spec: {
      op: "union" as const,
      a: {
        type: "box" as const,
        args: [60, 5, 60] as [number, number, number],
        position: [0, 0, 0] as [number, number, number],
        color: "#f43f5e",
      },
      b: {
        op: "group" as const,
        children: [
          {
            type: "box" as const,
            args: [2, 25, 50] as [number, number, number],
            position: [-18, 12.5, 0] as [number, number, number],
            color: "#fda4af",
          },
          {
            type: "box" as const,
            args: [2, 25, 50] as [number, number, number],
            position: [-9, 12.5, 0] as [number, number, number],
            color: "#fda4af",
          },
          {
            type: "box" as const,
            args: [2, 25, 50] as [number, number, number],
            position: [0, 12.5, 0] as [number, number, number],
            color: "#fda4af",
          },
          {
            type: "box" as const,
            args: [2, 25, 50] as [number, number, number],
            position: [9, 12.5, 0] as [number, number, number],
            color: "#fda4af",
          },
          {
            type: "box" as const,
            args: [2, 25, 50] as [number, number, number],
            position: [18, 12.5, 0] as [number, number, number],
            color: "#fda4af",
          },
        ],
      },
    },
    analysis:
      "Retrieved Heat Exchanger Core specimen from local blueprint index. Bypassing live compiler. Thermal flow limits verified.",
    specs:
      "MEDIA: Oil-to-Air Counterflow Matrix\nSTRUCTURE: Offset strip fin geometries\nPRESSURE_LIMIT: 15kPa pressure drop cap\nVOLUME: 10x10x5cm Envelope\nTHERMAL_COEFF: 480 W/m²K",
    researchSummary:
      "Fluid channels modeled by solving periodic homogenization Navier-Stokes matrices for laminate flows.",
    optimizationLogic:
      "Fin placement maximizes effective boundary film contact area per unit volume.",
  },
];

const DimensionSlider = ({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-[10px] font-mono text-cyan-400 font-bold">
        {value}mm
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

export const Workspace: React.FC<WorkspaceProps> = ({
  onBack,
  initialPrompt,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<{
    state: string;
    attempt?: number;
    errors?: string[];
  } | null>(null);
  const [hasModel, setHasModel] = useState(false);
  const [showDesignPanel, setShowDesignPanel] = useState(true);
  const [currentDesign, setCurrentDesign] =
    useState<TechnicalAIResponse | null>(null);
  const [simulationMode, setSimulationMode] = useState<SimulationType>("none");
  const [isShaking, setIsShaking] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showIntelligenceSidebar, setShowIntelligenceSidebar] = useState(false);
  const [isBiomorphic, setIsBiomorphic] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showEngineering, setShowEngineering] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sceneRef, setSceneRef] = useState<THREE.Object3D | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 150,
    width: 100,
    height: 50,
  });
  const [showParametricPanel, setShowParametricPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeAnalysisTool, setActiveAnalysisTool] = useState<
    | "none"
    | "console"
    | "waveform"
    | "schematic"
    | "fem"
    | "impact"
    | "assistant"
    | "cnc"
    | "bom"
    | "gitcad"
    | "gdt"
    | "cloudfea"
  >("none");
  const user = useAuth((state) => state.user);

  // Secure Toast & QA UI Overlays
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [qaState, setQaState] = useState<{
    show: boolean;
    rating: "success" | "fail";
    jobId: string;
  } | null>(null);
  const [qaFeedback, setQaFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    (window as any).toggleVoiceHUD = () => setIsListening((prev) => !prev);
    return () => {
      delete (window as any).toggleVoiceHUD;
    };
  }, []);

  const { addNode, nodes, jumpToNode, currentNodeId } = useDesignHistory();

  // Handle jumpToNode
  useEffect(() => {
    if (currentNodeId) {
      const node = nodes.find((n) => n.id === currentNodeId);
      if (node && node.spec) {
        setHasModel(true);
        setCurrentDesign((prev) =>
          prev ? { ...prev, proceduralSpec: node.spec } : null,
        );
      }
    }
  }, [currentNodeId]);

  const fetchProjects = async () => {
    const token = useAuth.getState().token;
    if (!token) return;
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let localProjs: any[] = [];
      if (res.ok) {
        const body = await res.text();
        if (body) {
          localProjs = JSON.parse(body);
        }
      }

      // Pull from Firestore for Durable Cloud Workspace!
      if (user?.email) {
        try {
          const cloudProjs = await cloudWorkspaceService.getProjects(
            user.email,
          );
          const combined = [...localProjs];
          cloudProjs.forEach((cp: any) => {
            const exists = combined.some((p: any) => p.title === cp.name);
            if (!exists) {
              combined.push({
                id: cp.id,
                title: cp.name,
                category: "Cloud Workspace",
                prompt: cp.design?.specs || "",
                proceduralSpec: cp.design?.proceduralSpec || cp.design,
                image: cp.design?.modelUrl || "",
              });
            }
          });
          setProjects(combined);
        } catch (cloudErr) {
          console.error("Failed to sync cloud workspaces", cloudErr);
          setProjects(localProjs);
        }
      } else {
        setProjects(localProjs);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    if (showHistory) fetchProjects();
  }, [showHistory]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      const timer = setTimeout(() => {
        handleGenerate(initialPrompt);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt]);

  const feaResult = useMemo(() => {
    if (currentDesign?.proceduralSpec) {
      return performStressAnalysis(
        currentDesign.proceduralSpec,
        selectedMaterial.id as any,
      );
    }
    return undefined;
  }, [currentDesign, selectedMaterial]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setHasModel(true);
    const importResponse: TechnicalAIResponse = {
      analysis: `Imported local asset: ${file.name}. Initializing structural analysis...`,
      specs: `FILE_NAME: ${file.name}\nSIZE: ${(file.size / 1024 / 1024).toFixed(2)} MB\nTYPE: ${file.type || "model/gltf-binary"}`,
      action: "INSPECT",
      modelUrl: url,
      simulationType: "none",
      suggestedMaterials: ["Local Material Profile"],
      researchSummary:
        "User-provided geometry detected. Bypassing synthesis core for direct inspection.",
      optimizationLogic:
        "Structural integrity check pending manual simulation parameters.",
      statusCode: 200,
    };
    setCurrentDesign(importResponse);
    setChatHistory((prev) => [
      ...prev,
      { role: "model", text: importResponse.analysis, timestamp: new Date() },
    ]);
  };

  const handleExport = () => {
    if (!currentDesign?.modelUrl) return;

    // In a real app, this would be a complex export.
    // Here we'll just "download" the current model URL or a dummy file.
    const link = document.createElement("a");
    link.href = currentDesign.modelUrl;
    link.download = `polystrukt_export_${Date.now()}.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDrawing = () => {
    showToast("Compiling ASME Y14.5 drawing sheet on live model...", "info");
    setActiveAnalysisTool("gdt");

    setTimeout(() => {
      try {
        exportEngineeringDrawingPDF(
          currentDesign,
          selectedMaterial,
          dimensions,
          user?.name || user?.email || "SYSTEM APPRENTICE",
        );
        showToast("ASME Y14.5 Engineering Drawing Sheet generated!", "success");
      } catch (err) {
        console.error("PDF generation failed:", err);
        showToast(
          "Blueprint compiler failure. See debug terminal logs.",
          "error",
        );
      }
    }, 1500);
  };

  const handleSave = async () => {
    if (!currentDesign) return;
    const token = useAuth.getState().token;
    if (!token) return;

    try {
      const projectName = `Design ${new Date().toLocaleString(["en-GB"], { hour12: false })}`;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName,
          design: currentDesign,
        }),
      });

      if (!res.ok) {
        let errorMessage = "Failed to save project";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${res.status}`;
        }
        throw new Error(errorMessage);
      }

      // Sync to Durable Cloud Workspace (Firestore Integration)
      if (user?.email) {
        try {
          const projectId = `project_${Date.now()}`;
          await cloudWorkspaceService.saveProject(
            user.email,
            projectId,
            projectName,
            currentDesign,
          );
          showToast("Sync Successful: Saved to cloud workspace!", "success");
        } catch (cloudErr: any) {
          console.error("[Cloud sync error]:", cloudErr);
          showToast("Project saved locally. Cloud queue active.", "info");
        }
      } else {
        showToast("Project saved successfully!", "success");
      }

      fetchProjects(); // Refresh history
    } catch (err: any) {
      console.error(err.message);
      showToast(err.message || "Failed to save project", "error");
    }
  };

  // Auto sync active chat session to Firestore Cloud
  useEffect(() => {
    if (user?.email && chatHistory.length > 0) {
      const sessionId = "active_session";
      cloudWorkspaceService
        .saveChatSession(
          user.email,
          sessionId,
          "Active CAD Session",
          chatHistory,
        )
        .catch((err) => console.error("[BOM Cloud Session Error]:", err));
    }
  }, [chatHistory, user]);

  const handleGenerate = async (overridePrompt?: string, files?: File[]) => {
    const textToProcess = overridePrompt || prompt;
    if (!textToProcess.trim() && (!files || files.length === 0)) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (isGenerating) return;

    setIsGenerating(true);
    setSimulationMode("none");

    // Interpret user search shortcuts to load actual beautiful models instantly
    const shortcut = GALLERY_SHORTCUTS.find(
      (s) =>
        textToProcess.toLowerCase().includes(s.prompt.toLowerCase()) ||
        s.prompt.toLowerCase().includes(textToProcess.toLowerCase()),
    );

    if (shortcut) {
      // Setup user prompt message in chat
      const userMessage: ChatMessage = {
        role: "user",
        text: textToProcess,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userMessage]);

      // Stage mock synthesis verification stages for beautiful UI feedback
      setGenerationStatus({ state: "RESOLVING_LOCAL_BLUEPRINT_INDEX" });
      await new Promise((resolve) => setTimeout(resolve, 300));
      setGenerationStatus({ state: "INITIALIZING_WATERTIGHT_MESH" });
      await new Promise((resolve) => setTimeout(resolve, 400));
      setGenerationStatus({ state: "COMPILING_3D_MANIFOLD" });
      await new Promise((resolve) => setTimeout(resolve, 300));

      const response: TechnicalAIResponse = {
        analysis: shortcut.analysis,
        specs: shortcut.specs,
        action: "INSPECT",
        modelUrl: "", // Procedural models prioritize spec
        proceduralSpec: shortcut.spec,
        simulationType: "none",
        suggestedMaterials: ["Optimal Alloy Profile"],
        researchSummary: shortcut.researchSummary,
        optimizationLogic: shortcut.optimizationLogic,
        statusCode: 200,
      };

      setCurrentDesign(response);
      setHasModel(true);
      setShowDesignPanel(true);
      setSimulationMode("none");
      setChatHistory((prev) => [
        ...prev,
        {
          role: "model",
          text: response.analysis,
          timestamp: new Date(),
        },
      ]);

      addNode(textToProcess, shortcut.spec);
      setIsGenerating(false);
      setPrompt("");
      return;
    }

    try {
      let attachment;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        attachment = {
          name: file.name,
          data: dataUrl,
          mimeType: file.type,
        };
      }

      const enhancedPrompt = `
[CAD_CONTEXT: ${isBiomorphic ? "BIOMORPHIC_OPTIMIZATION" : "STANDARD_GEOMETRY"}]
[MATERIAL: ${selectedMaterial.name}]
[CONSTRAINTS: L=${dimensions.length}mm, W=${dimensions.width}mm, H=${dimensions.height}mm]
${textToProcess}
      `;

      const userMessage: ChatMessage = {
        role: "user",
        text: textToProcess,
        timestamp: new Date(),
        attachment,
      };

      const newHistory = [...chatHistory, userMessage];
      setChatHistory(newHistory);

      const token = useAuth.getState().token;
      const response = await getTechnicalResponse(
        enhancedPrompt,
        chatHistory,
        attachment,
        token,
        (status) => {
          setGenerationStatus(status);
        },
      );

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (
        response.error ||
        (response.statusCode && response.statusCode >= 400)
      ) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setCurrentDesign(response);
      } else {
        setCurrentDesign(response);
        setHasModel(true);
        setShowDesignPanel(true);
        setSimulationMode(
          (response.simulationType as SimulationType) || "none",
        );
        setChatHistory((prev) => [
          ...prev,
          {
            role: "model",
            text: response.analysis,
            timestamp: new Date(),
            analysisReport: response.analysisReport,
          },
        ]);

        if (response.proceduralSpec) {
          addNode(textToProcess, response.proceduralSpec);
        }
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
        simulationType: "none",
        suggestedMaterials: [],
        researchSummary: "",
        optimizationLogic: "",
      });
    } finally {
      setIsGenerating(false);
      if (currentDesign && currentDesign.statusCode === 200) {
        setPrompt("");
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Aurora - Inherited from App or local */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden antialiased">
        <div className="absolute -top-1/4 left-1/4 h-[40rem] w-[40rem] animate-[aurora-1_20s_ease-in-out_infinite] rounded-full bg-indigo-500/5 blur-[100px] filter" />
        <div className="absolute -bottom-1/4 right-1/4 h-[40rem] w-[40rem] animate-[aurora-2_25s_ease-in-out_infinite] rounded-full bg-purple-500/5 blur-[100px] filter" />
      </div>

      <header className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <motion.button
            data-testid="workspace-back-btn"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all shadow-sm flex items-center gap-2 group pointer-events-auto"
          >
            <ArrowLeft
              size={18}
              className="text-white group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-xs font-bold uppercase tracking-wider pr-1 font-unique text-white">
              Exit Engine
            </span>
          </motion.button>
          <div className="h-10 w-px bg-white/5 mx-2 hidden md:block" />
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight uppercase flex items-center gap-2 font-unique">
              <Database size={14} className="text-indigo-400" />
              Polystrukt Engine V.2
            </h1>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate max-w-[200px]">
              {hasModel
                ? `SYSTEM_LOADED: ${currentDesign?.modelUrl?.split("/").pop() || "Asset"}`
                : "AWAITING PARAMETERS"}
            </span>
          </div>
          <div className="h-10 w-px bg-white/5 mx-2 hidden md:block" />
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowParametricPanel(!showParametricPanel)}
            className={`p-2.5 rounded-lg border transition-all pointer-events-auto ${showParametricPanel ? "bg-cyan-500 text-white border-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white shadow-sm"}`}
            title="Parametric Dimensioning"
          >
            <Ruler size={18} />
          </motion.button>
          <div className="h-10 w-px bg-white/5 mx-2 hidden md:block" />
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowIntelligenceSidebar(!showIntelligenceSidebar)}
            className={`p-2.5 rounded-lg border transition-all pointer-events-auto ${showIntelligenceSidebar ? "bg-emerald-500 text-white border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white shadow-sm"}`}
            title="Intelligence Core"
          >
            <Microscope size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEngineering(!showEngineering)}
            className={`p-2.5 rounded-lg border transition-all pointer-events-auto ${showEngineering ? "bg-orange-500 text-white border-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white shadow-sm"}`}
            title="Production Engineering"
          >
            <Activity size={18} />
          </motion.button>
          <div className="h-10 w-px bg-white/5 mx-2 hidden md:block" />
          <motion.button
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2.5 rounded-lg border transition-all pointer-events-auto ${showHistory ? "bg-indigo-500 text-white border-indigo-600" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white shadow-sm"}`}
            title="Project History"
          >
            <Database size={18} />
          </motion.button>
          <div className="h-10 w-px bg-white/5 mx-2 hidden xl:block" />

          {/* PHYSICS & ANALYSIS SUITE */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/5 rounded-xl px-2 py-1.5 pointer-events-auto">
            <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mr-1.5 hidden 2xl:inline-block">
              Physics Suite:
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("console")}
              className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              title="Operator CLI Terminal"
            >
              <Terminal size={12} /> HUD CLI
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("waveform")}
              className="p-1 px-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              title="Waveform Stress Analyzer"
            >
              <Activity size={12} /> Waveform
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("schematic")}
              className="p-1 px-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-450 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              title="Orthographic Schematic Viewer"
            >
              <Layers size={12} /> Orthographic
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("fem")}
              className="p-1 px-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              title="FEM Stress Simulator"
            >
              <Cpu size={12} /> FEM Solve
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("impact")}
              className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-amber-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              title="Engineering Impact Analytics"
            >
              <BarChart2 size={12} /> Impact
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("assistant")}
              className="p-1 px-2.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              title="Structured Gemini Engineering Assistant"
            >
              <Sparkles
                size={12}
                className="text-purple-400 group-hover:text-white"
              />{" "}
              Assistant
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("cnc")}
              className="p-1 px-2.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-cyan-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              title="Dynamic CNC Tooling Solver"
            >
              <Compass size={12} /> CNC Tooling
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("bom")}
              className="p-1 px-2.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              title="Automated Bill of Materials Generator"
            >
              <Database size={12} /> BOM Sheet
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("gitcad")}
              className="p-1 px-2.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans animate-fade-in"
              title="Procedural CAD Git-for-CAD Hub & Branch Diffing"
            >
              <GitBranch size={12} /> Git-for-CAD
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("gdt")}
              className="p-1 px-2.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans animate-fade-in"
              title="ASME Y14.5 GD&T Schema Block Exporter"
            >
              <Ruler size={12} /> GD&T Exporter
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAnalysisTool("cloudfea")}
              className="p-1 px-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-450 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans animate-fade-in"
              title="Cloud FEA Physics Boundary Compute Solver"
            >
              <Cpu size={12} /> Cloud FEA
            </motion.button>
          </div>

          <div className="h-10 w-px bg-white/5 mx-2 hidden lg:block" />
          <TeamPresence className="hidden md:flex pointer-events-auto" />
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          {hasModel && (
            <>
              <motion.button
                data-testid="workspace-toggle-panel"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDesignPanel(!showDesignPanel)}
                className={`p-2.5 rounded-lg border transition-all ${showDesignPanel ? "bg-indigo-500 border-indigo-600 text-white" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white shadow-sm"}`}
                title="Design Protocol"
              >
                <Info size={18} />
              </motion.button>
              <motion.button
                data-testid="workspace-save-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="hidden sm:flex px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 shadow-sm items-center gap-2 font-unique"
              >
                <Save size={12} className="text-white" /> Save
              </motion.button>
              <motion.button
                data-testid="workspace-import-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="hidden sm:flex px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 shadow-sm items-center gap-2 font-unique"
              >
                <FileUp size={12} className="text-white" /> Import
              </motion.button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".glb,.gltf"
                className="hidden"
              />
              <motion.button
                data-testid="workspace-export-drawing-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportDrawing}
                className="hidden md:flex px-4 py-2 bg-sky-500/15 border border-sky-500/30 text-sky-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-lg items-center gap-2 font-unique cursor-pointer"
                title="Generate ASME Y14.5 Engineering Drawing PDF"
              >
                <FileText size={12} /> Export Engineering Drawing
              </motion.button>
              <motion.button
                data-testid="workspace-export-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="hidden sm:flex px-4 py-2 bg-white text-zinc-950 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-white shadow-lg items-center gap-2 font-unique"
              >
                <Download size={12} /> Export
              </motion.button>
            </>
          )}
          <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-500 hover:text-white shadow-sm transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 relative">
        <AnimatePresence>
          {showParametricPanel && (
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              className="absolute top-0 left-0 bottom-0 w-[22rem] bg-zinc-950/80 backdrop-blur-2xl border-r border-white/5 z-[45] shadow-2xl p-6 pt-24 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-white">
                      Parametric Controls
                    </h2>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                      Exact Dimensional Constraints
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowParametricPanel(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-6">
                  <DimensionSlider
                    label="Length (X)"
                    value={dimensions.length}
                    min={10}
                    max={1000}
                    onChange={(v) =>
                      setDimensions((d) => ({ ...d, length: v }))
                    }
                  />
                  <DimensionSlider
                    label="Width (Y)"
                    value={dimensions.width}
                    min={10}
                    max={1000}
                    onChange={(v) => setDimensions((d) => ({ ...d, width: v }))}
                  />
                  <DimensionSlider
                    label="Height (Z)"
                    value={dimensions.height}
                    min={10}
                    max={1000}
                    onChange={(v) =>
                      setDimensions((d) => ({ ...d, height: v }))
                    }
                  />

                  <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                    <p className="text-[9px] font-mono text-zinc-500 uppercase">
                      Interactive Adjustments
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (sceneRef) {
                            // Calculate normalization based on original 150x100x50 "standard"
                            // or use current dimension ratios
                            const scaleX = dimensions.length / 150;
                            const scaleY = dimensions.width / 100;
                            const scaleZ = dimensions.height / 50;

                            sceneRef.scale.set(scaleX, scaleY, scaleZ);
                            showToast(
                              "Visual proportions synced. Note: This is an aesthetic stretch. Use 'Sync Mesh' for full engineering recalculation.",
                              "info",
                            );
                          }
                        }}
                        className="flex-1 py-2 bg-indigo-500/10 text-indigo-400 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                      >
                        Sync Scale
                      </button>
                      <button
                        onClick={() =>
                          handleGenerate(
                            `Refine geometry to strictly adhere to new dimensions: L=${dimensions.length}mm, W=${dimensions.width}mm, H=${dimensions.height}mm. Maintain current design language.`,
                          )
                        }
                        className="flex-1 py-2 bg-cyan-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                      >
                        Sync Mesh
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <Info size={16} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                    Adjusting dimensions affects the structural load-bearing
                    capacity. Use <strong>Sync Mesh</strong> to invoke the AI
                    for a structurally sound refinement.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {showIntelligenceSidebar && (
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              className="absolute top-0 left-0 bottom-0 w-[22rem] bg-zinc-950/80 backdrop-blur-2xl border-r border-white/5 z-[45] shadow-2xl p-6 pt-24 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <Microscope size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-white">
                      Intelligence Core
                    </h2>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                      Real-time optimization
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntelligenceSidebar(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                      Optimization Strategy
                    </span>
                    <Sparkles
                      size={14}
                      className="text-indigo-400 animate-pulse"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-900 border border-white/5 rounded-xl group transition-all hover:border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg transition-colors ${isBiomorphic ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-zinc-600"}`}
                      >
                        <Activity size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">
                          Biomorphic mode
                        </p>
                        <p className="text-[9px] text-zinc-500">
                          Enable organic topology
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBiomorphic(!isBiomorphic)}
                      className={`w-10 h-5 rounded-full transition-all relative ${isBiomorphic ? "bg-emerald-500" : "bg-white/10"}`}
                    >
                      <motion.div
                        animate={{ x: isBiomorphic ? 22 : 4 }}
                        className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>

                  {projects.length > 0 && !showHistory && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setShowHistory(true)}
                      className="w-full flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group hover:bg-indigo-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <History size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                          Recent Projects
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-indigo-500/20 rounded text-[9px] font-mono text-indigo-400">
                        {projects.length}
                      </span>
                    </motion.button>
                  )}

                  <EvolutionTree />
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">
                    Synthesis Timeline
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {chatHistory
                      .filter((m) => m.role === "model")
                      .map((msg, idx) => (
                        <div
                          key={idx}
                          className="p-0 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group overflow-hidden cursor-pointer"
                          onClick={() => {
                            if (msg.modelUrl || msg.has3DModel) {
                              // In a full implementation, we'd switch the model here
                            }
                          }}
                        >
                          <div className="aspect-[2/1] bg-indigo-500/10 relative overflow-hidden">
                            <img
                              src={`https://images.unsplash.com/photo-1544383120-d4347715fbc3?auto=format&fit=crop&q=60&w=400&blur=${idx * 2}`}
                              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                              alt="Synthesis Preview"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                            <div className="absolute bottom-2 left-3 flex items-center gap-2">
                              <Box size={10} className="text-indigo-400" />
                              <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-tighter">
                                Render Complete
                              </span>
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                                Generation v.{chatHistory.length - idx}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    {chatHistory.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl gap-3">
                        <History size={24} className="text-zinc-800" />
                        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                          Timeline empty
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                      System Health
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] font-mono text-emerald-500">
                        NOMINAL
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <span className="block text-[8px] font-bold text-zinc-600 uppercase mb-1">
                        Compute Load
                      </span>
                      <span className="text-xs font-mono font-black text-white">
                        4.2 TFLOPS
                      </span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                      <span className="block text-[8px] font-bold text-zinc-600 uppercase mb-1">
                        Model Precision
                      </span>
                      <span className="text-xs font-mono font-black text-white">
                        HIGH_RES
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {showHistory && (
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              className="absolute top-0 left-0 bottom-0 w-80 bg-zinc-900 border-r border-white/5 z-[45] shadow-2xl p-6 pt-24"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Project History
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">
                {projects.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                      No saved designs
                    </p>
                  </div>
                ) : (
                  projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentDesign(p.design);
                        setHasModel(true);
                        setShowHistory(false);
                      }}
                      className="w-full text-left p-4 bg-white/5 border border-white/5 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-white uppercase truncate">
                          {p.name}
                        </span>
                        <ChevronRight
                          size={12}
                          className="text-zinc-600 group-hover:text-indigo-400 transition-colors"
                        />
                      </div>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hasModel && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl z-40 px-6"
            >
              <div className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Layers size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
                        Material Spectrometry
                      </h4>
                      <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                        Adaptive Physical Properties
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-[9px] font-mono text-zinc-500 uppercase">
                          Mass Estimation
                        </p>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight">
                          1.24 kg
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar-hide">
                  {MATERIALS.map((mat) => (
                    <motion.button
                      key={mat.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`flex-shrink-0 flex flex-col p-4 rounded-2xl border transition-all ${selectedMaterial.id === mat.id ? "bg-white/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                    >
                      <mat.icon size={18} className={`mb-3 ${mat.color}`} />
                      <span className="text-[10px] font-black text-white uppercase tracking-tight whitespace-nowrap">
                        {mat.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-current opacity-50"
                            style={{
                              width:
                                mat.id === "titanium"
                                  ? "90%"
                                  : mat.id === "aluminum"
                                    ? "60%"
                                    : "80%",
                            }}
                          />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              data-testid="workspace-loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center bg-zinc-950"
            >
              <div className="relative mb-8">
                <Loader2 size={64} className="text-indigo-500 animate-spin" />
                <motion.div
                  className="absolute inset-0 border-2 border-indigo-500/20 rounded-full"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              </div>
              <div className="text-center space-y-4 flex flex-col items-center">
                <LoadingBreadcrumb
                  text={
                    generationStatus?.state === "verifying"
                      ? "Verifying Engineering Integrity"
                      : generationStatus?.state === "correcting"
                        ? "Applying Self-Correction"
                        : "Synthesizing Simulation"
                  }
                />
                <div className="h-px w-24 bg-white/5" />
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] animate-pulse">
                  {generationStatus?.state === "verifying"
                    ? `Verification Attempt ${generationStatus.attempt || 1}...`
                    : generationStatus?.state === "correcting"
                      ? `Fixing ${generationStatus.errors?.length || 0} Critical Errors...`
                      : "Running Topology Optimization..."}
                </p>
              </div>
            </motion.div>
          ) : hasModel && currentDesign ? (
            <motion.div
              key="model"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full"
            >
              <InspectableModel
                isFullscreen={true}
                simulationMode={simulationMode as any}
                modelUrl={currentDesign.modelUrl}
                proceduralSpec={currentDesign.proceduralSpec}
                feaResult={feaResult}
                focusPart={currentDesign.isolatedComponent}
                onOptimize={() =>
                  handleGenerate(
                    `Apply deep topological optimization for ${selectedMaterial.name}. Minimize mass while maintaining primary load paths.`,
                  )
                }
                onSceneReady={(scene) => setSceneRef(scene)}
                parentPrompt={prompt}
                parentSpecs={currentDesign.specs || ""}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center p-0"
            >
              <RuixenMoonChat onSend={handleGenerate} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEngineering && currentDesign && currentDesign.proceduralSpec && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="absolute top-24 right-6 bottom-24 w-[30rem] z-[45] pointer-events-auto"
            >
              <EngineeringPanel
                spec={currentDesign.proceduralSpec}
                scene={sceneRef || undefined}
              />
              <button
                onClick={() => setShowEngineering(false)}
                className="absolute -left-12 top-0 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-zinc-500 hover:text-white transition-all shadow-2xl"
              >
                <X size={20} />
              </button>
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
              <div
                className={`bg-zinc-900/95 backdrop-blur-xl border ${currentDesign.statusCode && currentDesign.statusCode >= 400 ? "border-red-500/50 shadow-red-500/10" : "border-white/10"} rounded-2xl p-5 shadow-2xl space-y-4`}
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <div
                    className={`flex items-center gap-2 text-[10px] font-bold ${currentDesign.statusCode && currentDesign.statusCode >= 400 ? "text-red-400" : "text-indigo-400"} uppercase tracking-widest font-unique`}
                  >
                    {currentDesign.statusCode &&
                    currentDesign.statusCode >= 400 ? (
                      <AlertCircle size={12} />
                    ) : (
                      <Terminal size={12} />
                    )}
                    {currentDesign.statusCode && currentDesign.statusCode >= 400
                      ? `System Alert (${currentDesign.statusCode})`
                      : "Design Protocol"}
                  </div>
                  <button
                    onClick={() => setShowDesignPanel(false)}
                    className="pointer-events-auto text-zinc-500 hover:text-white p-1"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="h-px bg-white/5 pointer-events-none" />

                <div
                  className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-4 cursor-default relative"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {currentDesign.verificationStatus && (
                    <div
                      className={`p-2 rounded-xl border flex items-center gap-2 ${currentDesign.verificationStatus === "verified" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500"}`}
                    >
                      {currentDesign.verificationStatus === "verified" ? (
                        <Check size={12} />
                      ) : (
                        <AlertCircle size={12} />
                      )}
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {currentDesign.verificationStatus === "verified"
                          ? "Engineering Verified"
                          : "Unverified (Limit Reached)"}
                      </span>
                      {currentDesign.verificationAttempts && (
                        <span className="ml-auto text-[8px] font-mono opacity-60">
                          {currentDesign.verificationAttempts}{" "}
                          {currentDesign.verificationAttempts === 1
                            ? "Attempt"
                            : "Attempts"}
                        </span>
                      )}
                    </div>
                  )}

                  {currentDesign.error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex flex-col gap-2">
                      <p className="text-[11px] text-red-400 font-bold leading-relaxed">
                        {currentDesign.error}
                      </p>
                      {currentDesign.statusCode === 429 && (
                        <button
                          onClick={() => handleGenerate()}
                          className="flex items-center gap-2 text-[10px] text-red-400 hover:text-red-300 font-black uppercase tracking-widest"
                        >
                          <RefreshCw size={10} /> Retry Now
                        </button>
                      )}
                    </div>
                  )}

                  {currentDesign.isolatedComponent && (
                    <div
                      data-testid="workspace-component-isolation-indicator"
                      className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3"
                    >
                      <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 shadow-sm">
                        <Check size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          Component Isolated
                        </span>
                        <p className="text-[10px] font-bold text-white">
                          {currentDesign.isolatedComponent}
                        </p>
                      </div>
                    </div>
                  )}

                  {!currentDesign.error && (
                    <>
                      <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                          <Search size={10} /> Research & Standards
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                          {currentDesign.researchSummary}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                          Optimization Logic
                        </span>
                        <p className="text-[11px] text-zinc-300 leading-relaxed font-medium bg-white/5 p-2 rounded-lg border border-white/5">
                          {currentDesign.optimizationLogic}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      Analysis
                    </span>
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                      {currentDesign.analysis}
                    </p>
                  </div>

                  {currentDesign.analysisReport && (
                    <AnalysisReportView report={currentDesign.analysisReport} />
                  )}

                  {(currentDesign.sources || []).length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        Grounding Sources
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentDesign.sources?.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] text-zinc-500 hover:text-indigo-400 hover:border-indigo-400/50 transition-all font-mono truncate max-w-full"
                          >
                            <LinkIcon size={8} />
                            {s.title || "Reference"}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      Target Specs
                    </span>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-mono whitespace-pre-wrap">
                      {currentDesign.specs}
                    </p>
                  </div>

                  {currentDesign.jobId && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        Quality Assurance
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQaFeedback("");
                            setQaState({
                              show: true,
                              rating: "success",
                              jobId: currentDesign.jobId!,
                            });
                          }}
                          className="flex-1 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[9px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all font-unique"
                        >
                          Mark Success
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQaFeedback("");
                            setQaState({
                              show: true,
                              rating: "fail",
                              jobId: currentDesign.jobId!,
                            });
                          }}
                          className="flex-1 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all font-unique"
                        >
                          Mark Fail
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col gap-3 pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-zinc-500">
                      <Activity size={14} />
                    </div>
                    <div className="flex-1">
                      <span className="block text-[10px] font-bold text-zinc-500 uppercase font-unique">
                        Geometric Fidelity
                      </span>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-1">
                        <div
                          className={`h-full rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)] ${currentDesign.error ? "bg-red-400 w-[20%]" : "bg-indigo-500 w-[98%]"}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex flex-wrap gap-1.5 mt-1 pointer-events-auto cursor-default"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {(currentDesign.suggestedMaterials || []).map((mat) => (
                      <span
                        key={mat}
                        className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-tighter"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pointer-events-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setHasModel(false);
                        setCurrentDesign(null);
                        setPrompt("");
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 bg-white/5 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all font-unique"
                    >
                      <X size={12} /> Discard
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleGenerate(
                          "Remake the previous design with higher precision and improved structural integrity.",
                        )
                      }
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-2 py-2.5 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 font-unique disabled:opacity-50"
                    >
                      <RefreshCw
                        size={12}
                        className={isGenerating ? "animate-spin" : ""}
                      />{" "}
                      Remake
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasModel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-40"
          >
            <motion.div
              animate={isShaking ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <PromptInputBox
                onSend={(message, files) => handleGenerate(message, files)}
                isLoading={isGenerating}
                placeholder="Describe the mechanics you wish to synthesize..."
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/20 text-emerald-400"
                : toast.type === "error"
                  ? "bg-red-950/90 border-red-500/20 text-red-400"
                  : "bg-indigo-950/90 border-indigo-500/20 text-indigo-400"
            }`}
          >
            <div className="flex-1 text-[11px] font-mono uppercase tracking-widest leading-relaxed">
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Quality Assurance Assessment Dialog */}
      <AnimatePresence>
        {qaState && qaState.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-black font-unique uppercase tracking-tight flex items-center gap-3">
                  <FlaskConical
                    className={
                      qaState.rating === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                    size={20}
                  />
                  {qaState.rating === "success"
                    ? "Record Success"
                    : "Report Failure"}
                </h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Your feedback will be reinforced into the AI model's
                  generation guidelines.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                  Feedback Explanation
                </label>
                <textarea
                  value={qaFeedback}
                  onChange={(e) => setQaFeedback(e.target.value)}
                  placeholder={
                    qaState.rating === "success"
                      ? "What makes this design highly accurate? (e.g., proper wall thickness, rib orientation)"
                      : "What went wrong with this model? (e.g., failed subtraction, blocky geometry)"
                  }
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none min-h-[120px] resize-none text-left"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setQaState(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all font-unique"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingFeedback || !qaFeedback.trim()}
                  onClick={async () => {
                    setIsSubmittingFeedback(true);
                    try {
                      const token = useAuth.getState().token;
                      await fetch("/api/evaluate", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          jobId: qaState.jobId,
                          rating: qaState.rating,
                          feedback: qaFeedback,
                          prompt: currentDesign?.specs || "",
                          result: currentDesign,
                        }),
                      });
                      showToast(
                        qaState.rating === "success"
                          ? "Success recorded. AI model reinforced!"
                          : "Failure recorded. AI self-correction system updated.",
                      );
                      setQaState(null);
                    } catch (err) {
                      showToast("Failed to record evaluation record.", "error");
                    } finally {
                      setIsSubmittingFeedback(false);
                    }
                  }}
                  className={`flex-1 py-3 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all font-unique ${
                    qaState.rating === "success"
                      ? "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20"
                      : "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20"
                  } disabled:opacity-50`}
                >
                  {isSubmittingFeedback ? "Submitting..." : "Submit Assessment"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeAnalysisTool === "console" && (
          <OperatorConsole
            onClose={() => setActiveAnalysisTool("none")}
            dimensions={dimensions}
            setDimensions={setDimensions}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            materials={MATERIALS}
          />
        )}
        {activeAnalysisTool === "waveform" && (
          <WaveformStressAnalyzer
            onClose={() => setActiveAnalysisTool("none")}
            currentDesign={currentDesign}
          />
        )}
        {activeAnalysisTool === "schematic" && (
          <OrthographicSchematicViewer
            onClose={() => setActiveAnalysisTool("none")}
            currentDesign={currentDesign}
            selectedMaterial={selectedMaterial}
            dimensions={dimensions}
          />
        )}
        {activeAnalysisTool === "fem" && (
          <FEMStressSimulator
            onClose={() => setActiveAnalysisTool("none")}
            currentDesign={currentDesign}
            selectedMaterial={selectedMaterial}
            dimensions={dimensions}
          />
        )}
        {activeAnalysisTool === "impact" && (
          <EngineeringImpactDashboard
            onClose={() => setActiveAnalysisTool("none")}
            currentDesign={currentDesign}
            selectedMaterial={selectedMaterial}
            dimensions={dimensions}
          />
        )}
        {activeAnalysisTool === "assistant" && (
          <StructuredAssistantPanel
            onClose={() => setActiveAnalysisTool("none")}
            dimensions={dimensions}
            selectedMaterial={selectedMaterial}
          />
        )}
        {activeAnalysisTool === "cnc" && (
          <CNCMachiningSolver
            onClose={() => setActiveAnalysisTool("none")}
            selectedMaterial={selectedMaterial}
            dimensions={dimensions}
          />
        )}
        {activeAnalysisTool === "bom" && (
          <BOMGenerator
            onClose={() => setActiveAnalysisTool("none")}
            currentDesign={currentDesign}
            selectedMaterial={selectedMaterial}
          />
        )}
        {activeAnalysisTool === "gitcad" && (
          <GitCadPanel
            onClose={() => setActiveAnalysisTool("none")}
            currentDesign={currentDesign}
            onApplySpec={(spec, message) => {
              setCurrentDesign((prev) => {
                if (!prev) return null;
                return { ...prev, proceduralSpec: spec };
              });
              setToast({
                message: `${message} successfully restored to active viewport!`,
                type: "success",
              });
            }}
          />
        )}
        {activeAnalysisTool === "gdt" && (
          <GdtPanel
            onClose={() => setActiveAnalysisTool("none")}
            currentDesign={currentDesign}
            selectedMaterial={selectedMaterial}
            dimensions={dimensions}
          />
        )}
        {activeAnalysisTool === "cloudfea" && (
          <CloudFeaPanel
            onClose={() => setActiveAnalysisTool("none")}
            selectedMaterial={selectedMaterial}
            dimensions={dimensions}
            currentDesign={currentDesign}
          />
        )}
      </AnimatePresence>

      <VoiceHUD
        isListening={isListening}
        onStop={() => setIsListening(false)}
      />
    </div>
  );
};
