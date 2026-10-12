import React from "react";
import { AnimatePresence } from "motion/react";
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
import { CadCodeStudioPanel } from "./CadCodeStudioPanel";
import { DocumentationPanel } from "./DocumentationPanel";
import { MATERIALS } from "../data/materials";
import { TechnicalAIResponse, MaterialOption } from "../types";

export type AnalysisToolType =
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
  | "cadcode"
  | "docs";

export interface WorkspaceAnalysisHostProps {
  activeAnalysisTool: AnalysisToolType;
  setActiveAnalysisTool: (tool: AnalysisToolType) => void;
  dimensions: { length: number; width: number; height: number };
  setDimensions: React.Dispatch<
    React.SetStateAction<{ length: number; width: number; height: number }>
  >;
  selectedMaterial: MaterialOption;
  setSelectedMaterial: (m: MaterialOption) => void;
  currentDesign: TechnicalAIResponse | null;
  setCurrentDesign: React.Dispatch<React.SetStateAction<TechnicalAIResponse | null>>;
  setHasModel: (has: boolean) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export const WorkspaceAnalysisHost: React.FC<WorkspaceAnalysisHostProps> = ({
  activeAnalysisTool,
  setActiveAnalysisTool,
  dimensions,
  setDimensions,
  selectedMaterial,
  setSelectedMaterial,
  currentDesign,
  setCurrentDesign,
  setHasModel,
  showToast,
}) => {
  return (
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
          proceduralSpec={currentDesign?.proceduralSpec}
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
            showToast(
              `${message} successfully restored to active viewport!`,
              "success"
            );
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
      {activeAnalysisTool === "cadcode" && (
        <CadCodeStudioPanel
          proceduralSpec={currentDesign?.proceduralSpec}
          modelName={
            currentDesign?.specs
              ?.split("\n")[0]
              ?.replace("TITLE:", "")
              .trim() || "Generative_CAD_Model"
          }
          onClose={() => setActiveAnalysisTool("none")}
          onCompileCode={(compiledSpec, codeType) => {
            const newDesign: TechnicalAIResponse = {
              ...(currentDesign || {
                analysis: "Compiled from parametric CAD code script.",
                specs: `CAD_CODE_TYPE: ${codeType}`,
                action: "INSPECT",
                modelUrl: "",
                simulationType: "none",
                suggestedMaterials: ["Aluminum 6061"],
                researchSummary:
                  "Code-driven CSG model generated via Code Studio.",
                optimizationLogic: "Code compiled geometry.",
                statusCode: 200,
              }),
              proceduralSpec: compiledSpec,
            };
            setCurrentDesign(newDesign);
            setHasModel(true);
            showToast(
              `Successfully compiled ${codeType} CAD code into 3D Model!`,
              "success"
            );
            setActiveAnalysisTool("none");
          }}
        />
      )}
      {activeAnalysisTool === "docs" && (
        <DocumentationPanel
          proceduralSpec={currentDesign?.proceduralSpec}
          currentDesign={currentDesign}
          selectedMaterial={selectedMaterial}
          dimensions={dimensions}
          onClose={() => setActiveAnalysisTool("none")}
        />
      )}
    </AnimatePresence>
  );
};
