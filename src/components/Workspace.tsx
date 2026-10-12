import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Code,
} from "lucide-react";
import { LoadingBreadcrumb } from "./ui/animated-loading-svg-text-shimmer";
import {
  getTechnicalResponse,
  TechnicalAIResponse,
} from "../services/geminiService";
import { performDFMAnalysis } from "../services/analysisService";
import { SimulationType, ChatMessage, ProceduralSpec, DFMAnalysisReport } from "../types";
import RuixenMoonChat from "./ui/ruixen-moon-chat";
import { ShiningText } from "./ui/shining-text";
import { PromptInputBox } from "./ui/ai-prompt-box";
import { useAuth } from "../hooks/useAuth";
import { EngineeringPanel } from "./EngineeringPanel";
import { EvolutionTree } from "./EvolutionTree";
import { useDesignHistory } from "../lib/useHistoryStore";
import { TeamPresence } from "./ui/team-presence";
import { VoiceHUD } from "./ui/voice-hud";
import { CadExportModal } from "./CadExportModal";
import * as THREE from "three";

import { WorkspaceAnalysisHost, AnalysisToolType } from "./WorkspaceAnalysisHost";
import { WorkspaceQAModal } from "./WorkspaceQAModal";
import { cloudWorkspaceService } from "../services/cloudWorkspaceService";
import { useWorkspaceAutoSave } from "../hooks/useWorkspaceAutoSave";
import { useWorkspaceActions } from "../hooks/useWorkspaceActions";
import { AutoSaveStatusBadge } from "./AutoSaveStatusBadge";
import { AutoSaveSceneState } from "../types";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceMaterialDock } from "./WorkspaceMaterialDock";
import { CadWorkspaceToolbar } from "./cad/CadWorkspaceToolbar";

interface WorkspaceProps {
  onBack: () => void;
  initialPrompt?: string;
}

import { performStressAnalysis } from "../services/analysisService";
import { MATERIALS, DEFAULT_MATERIAL } from "../data/materials";
import { GALLERY_SHORTCUTS } from "../data/galleryShortcuts";
import { ParametricPanel } from "./ParametricPanel";
import { IntelligenceSidebar } from "./IntelligenceSidebar";
import { HistorySidebar } from "./HistorySidebar";

const DEFAULT_WORKSPACE_DESIGN: TechnicalAIResponse = {
  analysis: "High-precision articulated robotic arm link with dual clevis knuckles, NEMA-17 servo mount, and lightweight pockets.",
  specs: "TITLE: Precision Mechanical Robotic Clevis Link\nMATERIAL: Aluminum 6061-T6\nTOLERANCES: ISO 2768-mK\nMOUNTING: Dual Bearing Bores (16mm & 12mm ID)\nFINISH: Type II Anodized Blue",
  action: "INSPECT",
  modelUrl: "",
  proceduralSpec: GALLERY_SHORTCUTS[0].spec,
  simulationType: "none",
  suggestedMaterials: ["Aluminum 6061-T6", "Titanium Grade 5", "Carbon Fiber Composite"],
  researchSummary: "Optimized for high torsional stiffness and minimum rotational inertia in articulated robotics.",
  optimizationLogic: "Material removed from low-stress central neutral axis to reduce mass while maintaining knuckle rigidity.",
  statusCode: 200,
};

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
  const [hasModel, setHasModel] = useState(true);
  const [showDesignPanel, setShowDesignPanel] = useState(true);
  const [currentDesign, setCurrentDesign] =
    useState<TechnicalAIResponse | null>(DEFAULT_WORKSPACE_DESIGN);
  const [simulationMode, setSimulationMode] = useState<SimulationType>("none");
  const [isShaking, setIsShaking] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showIntelligenceSidebar, setShowIntelligenceSidebar] = useState(false);
  const [isBiomorphic, setIsBiomorphic] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]);
  const [showMaterialDock, setShowMaterialDock] = useState(false);
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
  const [showCadExportModal, setShowCadExportModal] = useState(false);

  // Standard CAD Platform Viewport & Tooling States
  const [showPlanes, setShowPlanes] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [measureMode, setMeasureMode] = useState(false);
  const [xrayMode, setXrayMode] = useState(false);
  const [isOrtho, setIsOrtho] = useState(false);
  const [sectionCut, setSectionCut] = useState<{ enabled: boolean; axis: 'x' | 'y' | 'z'; offset: number }>({
    enabled: false,
    axis: 'y',
    offset: 0,
  });
  const [explosionFactor, setExplosionFactor] = useState(0);
  const standardViewRef = useRef<((view: any) => void) | null>(null);

  const [activeAnalysisTool, setActiveAnalysisTool] =
    useState<AnalysisToolType>("none");
  const user = useAuth((state) => state.user);

  // Secure Toast & QA UI Overlays
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

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

  // Restoration handler for auto-save snapshots
  const handleRestoreAutoSave = useCallback((savedState: AutoSaveSceneState) => {
    if (!savedState) return;

    if (savedState.parameters) {
      if (savedState.parameters.dimensions) {
        setDimensions(savedState.parameters.dimensions);
      }
      if (savedState.parameters.prompt !== undefined) {
        setPrompt(savedState.parameters.prompt);
      }
      if (savedState.parameters.isBiomorphic !== undefined) {
        setIsBiomorphic(savedState.parameters.isBiomorphic);
      }
      if (savedState.parameters.simulationMode) {
        setSimulationMode(savedState.parameters.simulationMode);
      }
      if (savedState.parameters.material?.id) {
        const matchedMat = MATERIALS.find((m) => m.id === savedState.parameters.material.id);
        if (matchedMat) setSelectedMaterial(matchedMat);
      }
    }

    if (savedState.design) {
      setCurrentDesign(savedState.design);
      setHasModel(true);
      setShowDesignPanel(true);
    } else if (savedState.geometry) {
      setCurrentDesign({
        analysis: "Restored auto-saved CAD workspace geometry and parameters.",
        specs: `RESTORED_SESSION: ${new Date(savedState.timestamp).toLocaleString()}\nSTATE_VERSION: v${savedState.version || 1}`,
        action: "INSPECT",
        modelUrl: "",
        proceduralSpec: savedState.geometry,
        simulationType: (savedState.parameters?.simulationMode === "blueprint" ? "none" : (savedState.parameters?.simulationMode || "none")) as "none" | "flow" | "stress" | "thermal",
        suggestedMaterials: ["Optimal Alloy Profile"],
        researchSummary: "Auto-saved geometry session restored from background sync memory.",
        optimizationLogic: "Session state recovered from persistent memory.",
        statusCode: 200,
      });
      setHasModel(true);
      setShowDesignPanel(true);
    }

    if (savedState.chatHistory && Array.isArray(savedState.chatHistory) && savedState.chatHistory.length > 0) {
      setChatHistory(savedState.chatHistory);
    }

    showToast("CAD scene state restored from auto-save snapshot!", "success");
  }, []);

  const autoSave = useWorkspaceAutoSave({
    proceduralSpec: currentDesign?.proceduralSpec,
    currentDesign,
    dimensions,
    selectedMaterial,
    simulationMode,
    isBiomorphic,
    prompt,
    historyNodes: nodes,
    chatHistory,
    token: useAuth.getState().token,
    userEmail: user?.email,
    hasModel,
    intervalSeconds: 30,
    onRestoreState: handleRestoreAutoSave,
  });

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

  const {
    fileInputRef,
    qaState,
    setQaState,
    qaFeedback,
    setQaFeedback,
    isSubmittingFeedback,
    handleSave,
    handleExport,
    handleExportDrawing,
    handleExportSessionParametersJson,
    handleImport,
    handleFeedbackSubmit,
  } = useWorkspaceActions({
    currentDesign,
    setCurrentDesign,
    prompt,
    setPrompt,
    isBiomorphic,
    setIsBiomorphic,
    simulationMode,
    setSimulationMode,
    selectedMaterial,
    setSelectedMaterial,
    dimensions,
    setDimensions,
    hasModel,
    setHasModel,
    chatHistory,
    setChatHistory,
    feaResult: feaResult || null,
    nodes,
    autoSave,
    fetchProjects,
    setActiveAnalysisTool,
    showToast,
  });

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
        const dfmResult = response.proceduralSpec 
          ? performDFMAnalysis(response.proceduralSpec, selectedMaterial.name, '5-Axis CNC Milling')
          : undefined;

        setCurrentDesign({
          ...response,
          dfmReport: dfmResult
        });
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
            dfmReport: dfmResult,
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

      {/* Top Application Header Bar */}
      <WorkspaceHeader
        onBack={onBack}
        hasModel={hasModel}
        currentDesign={currentDesign}
        showParametricPanel={showParametricPanel}
        setShowParametricPanel={setShowParametricPanel}
        showIntelligenceSidebar={showIntelligenceSidebar}
        setShowIntelligenceSidebar={setShowIntelligenceSidebar}
        showEngineering={showEngineering}
        setShowEngineering={setShowEngineering}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        showDesignPanel={showDesignPanel}
        setShowDesignPanel={setShowDesignPanel}
        activeAnalysisTool={activeAnalysisTool}
        setActiveAnalysisTool={setActiveAnalysisTool}
        handleSave={handleSave}
        handleImport={handleImport}
        fileInputRef={fileInputRef}
        handleExportSessionParametersJson={handleExportSessionParametersJson}
        handleExportDrawing={handleExportDrawing}
        handleExport={handleExport}
        handleOpenCadExport={() => setShowCadExportModal(true)}
        autoSave={autoSave}
        showMaterialDock={showMaterialDock}
        setShowMaterialDock={setShowMaterialDock}
        selectedMaterial={selectedMaterial}
      />

      <div className="flex-1 relative">
        <AnimatePresence>
          <ParametricPanel
            isOpen={showParametricPanel}
            onClose={() => setShowParametricPanel(false)}
            dimensions={dimensions}
            setDimensions={setDimensions}
            onSyncScale={() => {
              if (sceneRef) {
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
            onSyncMesh={() =>
              handleGenerate(
                `Refine geometry to strictly adhere to new dimensions: L=${dimensions.length}mm, W=${dimensions.width}mm, H=${dimensions.height}mm. Maintain current design language.`,
              )
            }
            onExportSessionParametersJson={handleExportSessionParametersJson}
            onOpenCadExport={() => setShowCadExportModal(true)}
          />

          <IntelligenceSidebar
            isOpen={showIntelligenceSidebar}
            onClose={() => setShowIntelligenceSidebar(false)}
            isBiomorphic={isBiomorphic}
            setIsBiomorphic={setIsBiomorphic}
            projectsCount={projects.length}
            showHistory={showHistory}
            onOpenHistory={() => setShowHistory(true)}
            chatHistory={chatHistory}
            onSelectModelMessage={(msg) => {
              if (msg.modelUrl || msg.has3DModel) {
                // Future model switch hook
              }
            }}
          />

          <HistorySidebar
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            currentDesign={currentDesign}
            onRevertToVersion={(node) => {
              if (node.spec) {
                setCurrentDesign({
                  analysis: node.analysis || `Reverted to history revision ${node.versionNumber || ""}`,
                  specs: node.specs || "",
                  action: "REVERT",
                  modelUrl: node.modelUrl || "",
                  proceduralSpec: node.spec,
                  simulationType: "none",
                  suggestedMaterials: node.suggestedMaterials || ["Aluminum 6061-T6"],
                  researchSummary: node.researchSummary || "Restored historical parametric state from session tree.",
                  optimizationLogic: node.optimizationLogic || "Historical geometry revision recovered.",
                  statusCode: 200,
                });
                setHasModel(true);
              }
              if (node.prompt) setPrompt(node.prompt);
              if (node.dimensions) setDimensions(node.dimensions);
              showToast(`Restored design to version ${node.versionNumber || node.id.slice(0, 8)}`, "success");
            }}
            onBranchVersion={(node) => {
              showToast(`Created branch from revision ${node.versionNumber || node.id.slice(0, 8)}`, "info");
            }}
            savedProjects={projects}
            onLoadSavedProject={(p) => {
              if (p.design) {
                setCurrentDesign(p.design);
                setHasModel(true);
                setShowHistory(false);
                showToast(`Loaded project: ${p.name}`, "success");
              }
            }}
            onShowToast={showToast}
          />
        </AnimatePresence>

        {hasModel && (
          <WorkspaceMaterialDock
            isOpen={showMaterialDock}
            onToggle={() => setShowMaterialDock((prev) => !prev)}
            selectedMaterial={selectedMaterial}
            onSelectMaterial={setSelectedMaterial}
            materials={MATERIALS}
            estimatedMassKg={1.24}
          />
        )}

        {/* Modern CAD Platform Workspace Ribbon Toolbar */}
        <div className="absolute top-20 left-6 z-40 max-w-[calc(100vw-20rem)] pointer-events-auto">
          <CadWorkspaceToolbar
            showPlanes={showPlanes}
            setShowPlanes={setShowPlanes}
            showDimensions={showDimensions}
            setShowDimensions={setShowDimensions}
            measureMode={measureMode}
            setMeasureMode={setMeasureMode}
            xrayMode={xrayMode}
            setXrayMode={setXrayMode}
            isOrtho={isOrtho}
            setIsOrtho={setIsOrtho}
            onSelectView={(v) => standardViewRef.current?.(v)}
            onResetView={() => standardViewRef.current?.('iso')}
            sectionCut={sectionCut}
            setSectionCut={setSectionCut}
            explosionFactor={explosionFactor}
            setExplosionFactor={setExplosionFactor}
            activeAnalysisTool={activeAnalysisTool}
            setActiveAnalysisTool={setActiveAnalysisTool}
            onOpenExport={() => setShowCadExportModal(true)}
            onOpenMaterialDock={() => setShowMaterialDock((prev) => !prev)}
            onSynthesize={(p) => handleGenerate(p)}
            isSynthesizing={isGenerating}
          />
        </div>

        {/* Synthesis Status HUD in Workspace */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              data-testid="workspace-loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none"
            >
              <div className="relative mb-6">
                <Loader2 size={56} className="text-purple-500 animate-spin" />
                <motion.div
                  className="absolute inset-0 border-2 border-purple-500/20 rounded-full"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              </div>
              <div className="text-center space-y-3 flex flex-col items-center bg-zinc-950/90 p-6 rounded-3xl border border-white/10 shadow-2xl">
                <LoadingBreadcrumb
                  text={
                    generationStatus?.state === "verifying"
                      ? "Verifying Engineering Integrity"
                      : generationStatus?.state === "correcting"
                        ? "Applying Self-Correction"
                        : "Synthesizing CSG Solids in Workspace"
                  }
                />
                <div className="h-px w-24 bg-white/10" />
                <p className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.2em] animate-pulse">
                  {generationStatus?.state === "verifying"
                    ? `Verification Attempt ${generationStatus.attempt || 1}...`
                    : generationStatus?.state === "correcting"
                      ? `Fixing ${generationStatus.errors?.length || 0} Critical Errors...`
                      : "Running Procedural CAD Engine..."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D CAD Stage Viewport */}
        <div className="w-full h-full">
          {currentDesign ? (
            <InspectableModel
              isFullscreen={true}
              simulationMode={simulationMode as any}
              modelUrl={currentDesign.modelUrl}
              proceduralSpec={currentDesign.proceduralSpec}
              feaResult={feaResult}
              focusPart={currentDesign.isolatedComponent}
              showPlanes={showPlanes}
              setShowPlanes={setShowPlanes}
              showDimensions={showDimensions}
              setShowDimensions={setShowDimensions}
              measureMode={measureMode}
              setMeasureMode={setMeasureMode}
              xrayMode={xrayMode}
              setXrayMode={setXrayMode}
              isOrtho={isOrtho}
              setIsOrtho={setIsOrtho}
              sectionCut={sectionCut}
              setSectionCut={setSectionCut}
              explosionFactor={explosionFactor}
              setExplosionFactor={setExplosionFactor}
              selectedMaterial={selectedMaterial}
              onSelectStandardViewRef={standardViewRef}
              onOptimize={() =>
                handleGenerate(
                  `Apply deep topological optimization for ${selectedMaterial.name}. Minimize mass while maintaining primary load paths.`,
                )
              }
              onSceneReady={(scene) => setSceneRef(scene)}
              parentPrompt={prompt}
              parentSpecs={currentDesign.specs || ""}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-0">
              <RuixenMoonChat onSend={handleGenerate} />
            </div>
          )}
        </div>

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
                    <AnalysisReportView 
                      report={currentDesign.analysisReport} 
                      dfmReport={currentDesign.dfmReport}
                    />
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
      <WorkspaceQAModal
        qaState={qaState}
        qaFeedback={qaFeedback}
        setQaFeedback={setQaFeedback}
        isSubmittingFeedback={isSubmittingFeedback}
        onClose={() => setQaState(null)}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Engineering & Analysis Modals */}
      <WorkspaceAnalysisHost
        activeAnalysisTool={activeAnalysisTool}
        setActiveAnalysisTool={setActiveAnalysisTool}
        dimensions={dimensions}
        setDimensions={setDimensions}
        selectedMaterial={selectedMaterial}
        setSelectedMaterial={setSelectedMaterial}
        currentDesign={currentDesign}
        setCurrentDesign={setCurrentDesign}
        setHasModel={setHasModel}
        showToast={showToast}
      />

      {/* Professional Native CAD Export & Open In Platforms Modal */}
      <CadExportModal
        isOpen={showCadExportModal}
        onClose={() => setShowCadExportModal(false)}
        spec={currentDesign?.proceduralSpec}
        projectName={
          currentDesign?.specs
            ?.split('\n')
            ?.find((l) => l.startsWith('TITLE:') || l.startsWith('NAME:'))
            ?.replace(/^(TITLE:|NAME:)/, '')
            ?.trim() || 'Polystrukt_Workpiece'
        }
        dimensions={dimensions}
        materialName={selectedMaterial.name}
        prompt={prompt}
        specs={currentDesign?.specs}
      />

      <VoiceHUD
        isListening={isListening}
        onStop={() => setIsListening(false)}
      />
    </div>
  );
};
