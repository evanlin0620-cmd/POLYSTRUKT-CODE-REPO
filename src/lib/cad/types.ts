/**
 * Universal Parametric CAD Intermediate Representation Types
 * Neutral abstraction layer between internal CAD engine and external platforms (Onshape, SolidWorks, Fusion 360, STEP AP242, etc.)
 */

export type CADUnitLength = 'mm' | 'cm' | 'm' | 'in' | 'ft';
export type CADUnitAngle = 'deg' | 'rad';

export interface CADMetadata {
  id: string;
  name: string;
  author: string;
  units: CADUnitLength;
  angleUnits: CADUnitAngle;
  version: string;
  createdAt: string;
  modifiedAt: string;
  description?: string;
  sourceApplication: string;
}

export interface CADParameter {
  id: string;
  name: string; // e.g. "BASE_WIDTH", "HOLE_DIA"
  expression: string; // e.g. "50.0", "BASE_WIDTH * 0.5"
  value: number; // Evaluated numerical value in document units
  unit: CADUnitLength | CADUnitAngle | 'unitless';
  description?: string;
  isDriving: boolean;
}

export interface CADCoordinateSystem {
  id: string;
  name: string;
  origin: [number, number, number];
  xAxis: [number, number, number];
  yAxis: [number, number, number];
  zAxis: [number, number, number];
  isWorldOrigin?: boolean;
}

export type CADPlaneType = 'XY' | 'XZ' | 'YZ' | 'OFFSET' | 'ANGLED' | 'PLANAR_FACE';

export interface CADReferencePlane {
  id: string;
  name: string;
  type: CADPlaneType;
  origin: [number, number, number];
  normal: [number, number, number];
  offsetDistance?: number;
  referencePlaneId?: string;
}

// --- 2D SKETCH ENTITIES ---

export type CADSketchEntityType =
  | 'line'
  | 'circle'
  | 'arc'
  | 'rectangle'
  | 'point'
  | 'centerline'
  | 'polygon'
  | 'spline';

export interface BaseSketchEntity {
  id: string;
  name: string;
  type: CADSketchEntityType;
  isConstruction: boolean;
}

export interface SketchLine extends BaseSketchEntity {
  type: 'line' | 'centerline';
  start: [number, number]; // 2D sketch plane coordinates
  end: [number, number];
}

export interface SketchCircle extends BaseSketchEntity {
  type: 'circle';
  center: [number, number];
  radius: number;
}

export interface SketchArc extends BaseSketchEntity {
  type: 'arc';
  center: [number, number];
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
}

export interface SketchRectangle extends BaseSketchEntity {
  type: 'rectangle';
  center: [number, number];
  width: number;
  height: number;
  isCentered: boolean;
}

export interface SketchPoint extends BaseSketchEntity {
  type: 'point';
  position: [number, number];
}

export type CADSketchEntity =
  | SketchLine
  | SketchCircle
  | SketchArc
  | SketchRectangle
  | SketchPoint;

// --- GEOMETRIC CONSTRAINTS ---

export type CADGeometricConstraintType =
  | 'coincident'
  | 'horizontal'
  | 'vertical'
  | 'parallel'
  | 'perpendicular'
  | 'tangent'
  | 'concentric'
  | 'equal'
  | 'symmetric'
  | 'fix';

export interface CADSketchConstraint {
  id: string;
  type: CADGeometricConstraintType;
  entityIds: string[]; // Target entities constrained
  parameters?: Record<string, any>;
  comment?: string;
}

// --- DIMENSIONAL CONSTRAINTS ---

export type CADDimensionalConstraintType =
  | 'distance'
  | 'horizontal_distance'
  | 'vertical_distance'
  | 'angle'
  | 'radius'
  | 'diameter';

export interface CADSketchDimension {
  id: string;
  name: string; // e.g. "d1", "flange_dia"
  type: CADDimensionalConstraintType;
  entityIds: string[];
  parameterId?: string; // Reference to global variable
  value: number;
  expression: string;
  unit: CADUnitLength | CADUnitAngle;
  isDriving: boolean;
}

export interface CADSketch {
  id: string;
  name: string;
  planeId: string; // Reference to CADReferencePlane or 'XY' | 'XZ' | 'YZ'
  entities: CADSketchEntity[];
  constraints: CADSketchConstraint[];
  dimensions: CADSketchDimension[];
  description?: string;
}

// --- 3D FEATURES ---

export type CADFeatureType =
  | 'extrude'
  | 'revolve'
  | 'sweep'
  | 'loft'
  | 'fillet'
  | 'chamfer'
  | 'shell'
  | 'hole_pattern'
  | 'linear_pattern'
  | 'circular_pattern'
  | 'mirror'
  | 'boolean'
  | 'imported_brep';

export interface CADFeature {
  id: string;
  name: string;
  type: CADFeatureType;
  sketchId?: string;
  parameters: {
    depth?: number;
    depthExpression?: string;
    isCut?: boolean;
    symmetric?: boolean;
    throughAll?: boolean;
    draftAngle?: number;
    revolveAngle?: number;
    filletRadius?: number;
    chamferDistance?: number;
    shellThickness?: number;
    holeDiameter?: number;
    holeCount?: number;
    patternSpacing?: number;
    pitchRadius?: number;
    booleanOp?: 'union' | 'subtract' | 'intersect';
    targetBodyId?: string;
    toolBodyId?: string;
    direction?: [number, number, number];
    axis?: [number, number, number];
    center?: [number, number, number];
    [key: string]: any;
  };
  dependencies: string[]; // IDs of preceding features/sketches required
  suppressed: boolean;
  color?: string;
  targetBodyId?: string;
}

// --- BODIES, MATERIALS & ASSEMBLIES ---

export interface CADBody {
  id: string;
  name: string;
  materialId?: string;
  color?: string;
  featureIds: string[];
  isSolid: boolean;
  volumeMm3?: number;
  estimatedMassKg?: number;
}

export interface CADMaterial {
  id: string;
  name: string;
  densityKgM3: number;
  elasticModulusGPa: number;
  tensileStrengthMPa: number;
  color?: string;
}

export interface CADAssemblyComponent {
  id: string;
  name: string;
  bodyId: string;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number]; // Euler degrees
    scale: [number, number, number];
  };
  suppressed: boolean;
}

export type CADJointType = 'rigid' | 'revolute' | 'slider' | 'cylindrical' | 'planar';

export interface CADAssemblyJoint {
  id: string;
  name: string;
  type: CADJointType;
  component1Id: string;
  component2Id: string;
  origin: [number, number, number];
  axis?: [number, number, number];
}

export interface CADAssembly {
  id: string;
  name: string;
  components: CADAssemblyComponent[];
  joints: CADAssemblyJoint[];
}

// --- UNIVERSAL PARAMETRIC CAD DOCUMENT ---

export interface ParametricCADDocument {
  metadata: CADMetadata;
  parameters: CADParameter[];
  coordinateSystems: CADCoordinateSystem[];
  referencePlanes: CADReferencePlane[];
  sketches: CADSketch[];
  features: CADFeature[];
  bodies: CADBody[];
  materials: CADMaterial[];
  assembly?: CADAssembly;
}

// --- PLATFORM CAPABILITIES & REPORTS ---

export type CADPlatformId =
  | 'onshape'
  | 'solidworks'
  | 'fusion'
  | 'step'
  | 'parasolid'
  | 'iges'
  | 'openscad'
  | 'stl';

export interface CADPlatformCapabilities {
  platformId: CADPlatformId;
  name: string;
  supportsBrep: boolean;
  supportsSketches: boolean;
  supportsGeometricConstraints: boolean;
  supportsDrivingDimensions: boolean;
  supportsFeatureHistory: boolean;
  supportsNativeFeatures: boolean;
  supportsAssemblies: boolean;
  supportsDirectApi: boolean;
  nativeFormatExtension: string;
  fileFormatDescription: string;
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  entityId?: string;
  entityType?: 'sketch' | 'feature' | 'constraint' | 'dimension' | 'parameter' | 'body';
  recommendation?: string;
  fallbackAvailable?: boolean;
  fallbackStrategy?: 'fix_coordinates' | 'driving_dimension' | 'unsupported_warning' | string;
}

export interface ValidationReport {
  isValid: boolean;
  scorePercentage: number;
  issues: ValidationIssue[];
  stats: {
    sketchesCount: number;
    entitiesCount: number;
    constraintsCount: number;
    dimensionsCount: number;
    featuresCount: number;
    bodiesCount: number;
    parametersCount: number;
  };
}

export interface ExportManifest {
  exportId: string;
  timestamp: string;
  sourceApplication: string;
  targetPlatform: CADPlatformId;
  targetPlatformName: string;
  units: CADUnitLength;
  bodies: number;
  sketches: number;
  features: number;
  constraints: number;
  dimensions: number;
  parameters: number;
  recreatedFeatures: number;
  fallbackFeatures: number;
  recreatedConstraints: number;
  unsupportedConstraints: number;
  fidelityLevel: 'Level 1 - Native Parametric' | 'Level 2 - Parametric Interchange' | 'Level 3 - B-Rep Solid';
  compatibilityScore: number; // 0 - 100
  notes: string[];
}

export interface ExportOptions {
  preserveSketches?: boolean;
  preserveDimensions?: boolean;
  preserveConstraints?: boolean;
  preserveFeatureHistory?: boolean;
  preserveAssemblies?: boolean;
  preserveMaterials?: boolean;
  targetUnits?: CADUnitLength;
  onshapeDocName?: string;
  onshapeWorkspaceName?: string;
  solidworksMacroLanguage?: 'vba' | 'python';
}

export interface ExportResult {
  success: boolean;
  targetPlatform: CADPlatformId;
  filename: string;
  mimeType: string;
  content: string | Blob;
  manifest: ExportManifest;
  validationReport: ValidationReport;
  openInUrl?: string; // Direct launch link when available
  openInInstructions?: string;
  codePreview?: string;
}
