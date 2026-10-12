import { useState, useRef } from "react";
import { TechnicalAIResponse, SimulationType, ChatMessage, FEAResult, MaterialOption } from "../types";
import { MATERIALS } from "../data/materials";
import { useAuth } from "./useAuth";
import { cloudWorkspaceService } from "../services/cloudWorkspaceService";
import { exportEngineeringDrawingPDF } from "../lib/drawingExporter";
import { exportSessionParametersJSON } from "../services/exportService";
import { parseCodeToProceduralSpec } from "../lib/cadCodeConverter";

export interface UseWorkspaceActionsProps {
  currentDesign: TechnicalAIResponse | null;
  setCurrentDesign: (design: TechnicalAIResponse | null) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  isBiomorphic: boolean;
  setIsBiomorphic: (b: boolean) => void;
  simulationMode: SimulationType;
  setSimulationMode: (s: SimulationType) => void;
  selectedMaterial: MaterialOption;
  setSelectedMaterial: (m: MaterialOption) => void;
  dimensions: { length: number; width: number; height: number };
  setDimensions: (d: { length: number; width: number; height: number }) => void;
  hasModel: boolean;
  setHasModel: (has: boolean) => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  feaResult: FEAResult | null;
  nodes: any[];
  autoSave: { markAsSynced: () => void };
  fetchProjects: () => void;
  setActiveAnalysisTool: (tool: any) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function useWorkspaceActions({
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
  feaResult,
  nodes,
  autoSave,
  fetchProjects,
  setActiveAnalysisTool,
  showToast,
}: UseWorkspaceActionsProps) {
  const user = useAuth((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [qaState, setQaState] = useState<{
    show: boolean;
    rating: "success" | "fail";
    jobId: string;
  } | null>(null);
  const [qaFeedback, setQaFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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

      fetchProjects();
      autoSave.markAsSynced();
    } catch (err: any) {
      console.error(err.message);
      showToast(err.message || "Failed to save project", "error");
    }
  };

  const handleExport = () => {
    if (!currentDesign?.modelUrl) return;

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

  const handleExportSessionParametersJson = () => {
    const sessionData = {
      schemaVersion: "2.0.0",
      appName: "Polystrukt GenCAD Studio",
      exportedAt: new Date().toISOString(),
      session: {
        prompt: prompt || "",
        isBiomorphic,
        simulationMode,
        author: user?.email || user?.name || "Anonymous Operator",
      },
      sceneConfiguration: {
        activeMaterial: {
          id: selectedMaterial.id,
          name: selectedMaterial.name,
          color: selectedMaterial.color,
          density: (selectedMaterial as any).density || "N/A",
          yieldStrength: (selectedMaterial as any).yieldStrength || "N/A",
          thermalExpansion: (selectedMaterial as any).thermalExpansion || "N/A",
          machinability: (selectedMaterial as any).machinability || "N/A",
        },
        dimensions: {
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
          unit: "mm",
        },
        hasLoadedModel: hasModel,
      },
      cadDesign: currentDesign
        ? {
            specs: currentDesign.specs,
            analysis: currentDesign.analysis,
            researchSummary: currentDesign.researchSummary,
            optimizationLogic: currentDesign.optimizationLogic,
            proceduralSpec: currentDesign.proceduralSpec,
            suggestedMaterials: currentDesign.suggestedMaterials,
            modelUrl: currentDesign.modelUrl,
            action: currentDesign.action,
            statusCode: currentDesign.statusCode,
          }
        : null,
      simulationAndFEA: {
        activeMode: simulationMode,
        analysisResult: feaResult || null,
      },
      parametricSpec: currentDesign?.proceduralSpec || null,
      historyNodes: nodes || [],
      chatHistory: chatHistory.map((msg) => ({
        role: msg.role,
        text: msg.text,
        timestamp: msg.timestamp,
      })),
    };

    const sanitizedPrompt = prompt
      ? prompt
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .replace(/_+/g, "_")
          .slice(0, 24)
      : "cad_scene";

    const filenamePrefix = `polystrukt_cad_scene_${sanitizedPrompt}`;
    const filename = exportSessionParametersJSON(sessionData, filenamePrefix);
    showToast(`CAD scene configuration exported as ${filename}`, "success");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.name.endsWith(".scad") ||
      file.name.endsWith(".ts") ||
      file.name.endsWith(".js") ||
      file.name.endsWith(".py")
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const ext = file.name.split(".").pop() || "scad";
          const langMap: Record<string, "openscad" | "javascript" | "python" | "json"> = {
            scad: "openscad",
            ts: "javascript",
            js: "javascript",
            py: "python",
          };
          const compiledSpec = parseCodeToProceduralSpec(content, langMap[ext] || "openscad");

          const codeResponse: TechnicalAIResponse = {
            analysis: `Compiled from imported CAD code script (${file.name}). CSG model generated successfully.`,
            specs: `FILE_NAME: ${file.name}\nFORMAT: ${ext.toUpperCase()} Code Script\nSIZE: ${file.size} bytes`,
            action: "INSPECT",
            modelUrl: "",
            simulationType: "none",
            suggestedMaterials: ["Aluminum 6061", "Titanium Grade 5"],
            researchSummary: "Code-driven CSG model generated via file import.",
            optimizationLogic: "Code compiled geometry.",
            statusCode: 200,
            proceduralSpec: compiledSpec,
          };

          setCurrentDesign(codeResponse);
          setHasModel(true);
          showToast(`Compiled 3D model from CAD code script (${file.name})`, "success");
        } catch (err) {
          console.error("Failed to parse CAD code script", err);
          showToast("Failed to compile CAD code script", "error");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
      return;
    }

    if (file.name.endsWith(".json") || file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.session) {
            if (data.session.prompt) setPrompt(data.session.prompt);
            if (data.session.dimensions) setDimensions(data.session.dimensions);
            if (data.session.isBiomorphic !== undefined) setIsBiomorphic(data.session.isBiomorphic);
            if (data.session.simulationMode) setSimulationMode(data.session.simulationMode);
            if (data.session.material?.id) {
              const matchedMat = MATERIALS.find((m) => m.id === data.session.material.id);
              if (matchedMat) setSelectedMaterial(matchedMat);
            }
          }
          if (data.cadDesign) {
            setCurrentDesign(data.cadDesign);
            setHasModel(true);
          } else if (data.design) {
            setCurrentDesign(data.design);
            setHasModel(true);
          }
          if (data.chatHistory && Array.isArray(data.chatHistory)) {
            setChatHistory(data.chatHistory);
          }
          showToast(`Restored CAD session parameters from ${file.name}`, "success");
        } catch (err) {
          console.error("Failed to parse JSON session file", err);
          showToast("Failed to import session parameters JSON: Invalid structure", "error");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
      return;
    }

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
    e.target.value = "";
  };

  const handleFeedbackSubmit = async () => {
    if (!qaState) return;
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
        "success"
      );
      setQaState(null);
      setQaFeedback("");
    } catch (err) {
      console.error(err);
      showToast("Failed to record evaluation record.", "error");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return {
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
  };
}
