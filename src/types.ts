

export interface ProceduralShape {
  type: 'box' | 'cylinder' | 'sphere' | 'torus' | 'cone' | 'tube' | 'hex_prism' | 'wedge' | 'gear' | 'flange' | 'pyramid';
  args: number[]; // [width, height, depth] or [radius, height, segments] etc.
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  opacity?: number;
  metalness?: number;
  roughness?: number;
}

export interface ProceduralOperation {
  op: 'union' | 'subtract' | 'intersect';
  a: ProceduralSpec;
  b: ProceduralSpec;
}

export interface ProceduralGroup {
  op: 'group';
  children: ProceduralSpec[];
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export type ProceduralSpec = ProceduralShape | ProceduralOperation | ProceduralGroup;

export interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  prompt?: string;
  proceduralSpec?: ProceduralSpec;
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 string
}

export type SimulationType = 'stress' | 'thermal' | 'flow' | 'blueprint' | 'stress_test' | 'none';

export type MaterialType = 'aluminum_6061' | 'titanium_grade_5' | 'carbon_fiber' | 'steel_304' | 'abs_plastic';

export interface MaterialProperties {
  name: string;
  density: number; // kg/m3
  elasticModulus: number; // GPa
  tensileStrength: number; // MPa
  thermalConductivity: number; // W/mK
  costPerKg: number;
}

export interface HardwareSuggestion {
  id: string;
  name: string;
  category: 'motor' | 'bearing' | 'fastener' | 'actuator';
  specMatch: string;
  dimensions: string;
  link: string;
  price?: string;
}

export interface DesignHistoryNode {
  id: string;
  parentId: string | null;
  timestamp: Date;
  prompt: string;
  spec: ProceduralSpec;
  thumbnail?: string;
  versionNumber?: number;
  specs?: string;
  analysis?: string;
  researchSummary?: string;
  optimizationLogic?: string;
  modelUrl?: string;
  suggestedMaterials?: string[];
  materialName?: string;
  dimensions?: { length: number; width: number; height: number };
  label?: string;
}

export interface FEAResult {
  maxStress: number; // MPa
  safetyFactor: number;
  displacement: number; // mm
  failurePoints: [number, number, number][];
}

export interface AnalysisReport {
  visual: string;
  functional: string;
  structural: string;
}

export interface DFMReportIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  detail: string;
  recommendation: string;
  coordinate?: [number, number, number];
}

export interface DFMAnalysisReport {
  overallScore: number; // 0 - 100
  machinabilityIndex: 'Optimal' | 'Caution' | 'High Risk';
  minWallThicknessMm: number;
  maxOverhangDeg: number;
  undercutDetected: boolean;
  toolClearanceMm: number;
  surfaceAreaMm2: number;
  volumeMm3: number;
  estimatedMassKg: number;
  watertightManifold: boolean;
  issues: DFMReportIssue[];
  aiSynthesisInsight: string;
  recommendedMaterial?: string;
  suggestedProcess?: '5-Axis CNC Milling' | '3-Axis CNC Milling' | 'Direct Metal Laser Sintering (DMLS)' | 'Selective Laser Sintering (SLS)' | 'FDM Additive' | 'Injection Molding';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  thoughtProcess?: string;
  timestamp: Date;
  attachment?: Attachment;
  simulationType?: SimulationType;
  has3DModel?: boolean;
  modelUrl?: string;
  focusPart?: string;
  proceduralSpec?: ProceduralSpec;
  hardwareSuggestions?: HardwareSuggestion[];
  material?: MaterialType;
  feaResult?: FEAResult;
  analysisReport?: AnalysisReport;
  dfmReport?: DFMAnalysisReport;
}

export interface SavedSession {
  id: number;
  name: string;
  date: string;
  messages: ChatMessage[];
}

export interface StatItem {
  label: string;
  value: string;
  desc: string;
}

export type AutoSaveStatus = 'synced' | 'saving' | 'dirty' | 'offline' | 'error';

export interface AutoSaveParameters {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  material: {
    id: string;
    name: string;
    color?: string;
  };
  simulationMode: SimulationType;
  isBiomorphic: boolean;
  prompt: string;
}

export interface AutoSaveSceneState {
  geometry: ProceduralSpec | null;
  parameters: AutoSaveParameters;
  design?: any;
  historyNodes?: any[];
  chatHistory?: ChatMessage[];
  timestamp: string;
  version?: number;
  sessionId?: string;
  revisionId?: string;
}

export interface TechnicalAIResponse {
  thought_process?: string;
  analysis: string;
  specs: string;
  action: string;
  modelUrl: string;
  proceduralSpec?: ProceduralSpec;
  hardwareSuggestions?: HardwareSuggestion[];
  feaResult?: FEAResult;
  dfmReport?: DFMAnalysisReport;
  analysisReport?: {
    visual: string;
    functional: string;
    structural: string;
  };
  simulationType: 'stress' | 'thermal' | 'flow' | 'none';
  suggestedMaterials: string[];
  researchSummary: string;
  optimizationLogic: string;
  isolatedComponent?: string;
  sources?: { uri: string; title: string }[];
  verificationStatus?: 'verified' | 'unverified_limit_reached';
  verificationAttempts?: number;
  jobId?: string;
  error?: string;
  statusCode: number;
}

export interface MaterialOption {
  id: string;
  name: string;
  icon?: any;
  color: string;
  density: string;
  yieldStrength: string;
  thermalExpansion: string;
  machinability: string;
}

export interface GalleryShortcut {
  id: string;
  title: string;
  tag: string;
  iconName?: string;
  prompt: string;
  proceduralSpec: ProceduralSpec;
  analysis: string;
  specs: string;
  researchSummary: string;
  optimizationLogic: string;
}
