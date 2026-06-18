

export interface ProceduralShape {
  type: 'box' | 'cylinder' | 'sphere' | 'torus' | 'cone';
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