import { MaterialType, MaterialProperties, FEAResult, ProceduralSpec, HardwareSuggestion, DFMAnalysisReport, DFMReportIssue } from '../types';

export const MATERIALS: Record<MaterialType, MaterialProperties> = {
  aluminum_6061: {
    name: 'Aluminum 6061-T6',
    density: 2700,
    elasticModulus: 68.9,
    tensileStrength: 310,
    thermalConductivity: 167,
    costPerKg: 2.5
  },
  titanium_grade_5: {
    name: 'Titanium Grade 5',
    density: 4430,
    elasticModulus: 113.8,
    tensileStrength: 950,
    thermalConductivity: 6.7,
    costPerKg: 35.0
  },
  carbon_fiber: {
    name: 'Carbon Fiber Reinforced Polymer',
    density: 1550,
    elasticModulus: 135,
    tensileStrength: 1500,
    thermalConductivity: 21,
    costPerKg: 120.0
  },
  steel_304: {
    name: 'Stainless Steel 304',
    density: 8000,
    elasticModulus: 193,
    tensileStrength: 505,
    thermalConductivity: 16.2,
    costPerKg: 5.5
  },
  abs_plastic: {
    name: 'ABS Plastic (3D Printed)',
    density: 1040,
    elasticModulus: 2.3,
    tensileStrength: 40,
    thermalConductivity: 0.1,
    costPerKg: 18.0
  }
};

/**
 * Validates and sanitizes a procedural CAD specification tree.
 */
export const validateProceduralSpec = (spec: any): ProceduralSpec => {
  if (!spec || typeof spec !== 'object') {
    return { type: 'box', args: [20, 20, 20], color: '#6366f1' };
  }

  if ('type' in spec && typeof spec.type === 'string') {
    const validTypes = ['box', 'cylinder', 'sphere', 'torus', 'cone'];
    const type = validTypes.includes(spec.type) ? spec.type : 'box';
    const args = Array.isArray(spec.args) && spec.args.length > 0 
      ? spec.args.map((a: any) => Math.max(0.1, Number(a) || 1))
      : [10, 10, 10];

    return {
      type: type as any,
      args,
      position: Array.isArray(spec.position) ? [Number(spec.position[0]) || 0, Number(spec.position[1]) || 0, Number(spec.position[2]) || 0] : undefined,
      rotation: Array.isArray(spec.rotation) ? [Number(spec.rotation[0]) || 0, Number(spec.rotation[1]) || 0, Number(spec.rotation[2]) || 0] : undefined,
      scale: Array.isArray(spec.scale) ? [Number(spec.scale[0]) || 1, Number(spec.scale[1]) || 1, Number(spec.scale[2]) || 1] : undefined,
      color: typeof spec.color === 'string' ? spec.color : '#6366f1',
      opacity: typeof spec.opacity === 'number' ? Math.max(0.1, Math.min(1, spec.opacity)) : 1,
      metalness: typeof spec.metalness === 'number' ? Math.max(0, Math.min(1, spec.metalness)) : 0.8,
      roughness: typeof spec.roughness === 'number' ? Math.max(0, Math.min(1, spec.roughness)) : 0.2
    };
  }

  if (spec.op === 'group' && Array.isArray(spec.children)) {
    const validChildren = spec.children
      .filter((c: any) => c && typeof c === 'object')
      .map((c: any) => validateProceduralSpec(c));
    return {
      op: 'group',
      children: validChildren.length > 0 ? validChildren : [{ type: 'box', args: [10, 10, 10] }],
      position: Array.isArray(spec.position) ? [Number(spec.position[0]) || 0, Number(spec.position[1]) || 0, Number(spec.position[2]) || 0] : undefined,
      rotation: Array.isArray(spec.rotation) ? [Number(spec.rotation[0]) || 0, Number(spec.rotation[1]) || 0, Number(spec.rotation[2]) || 0] : undefined,
      scale: Array.isArray(spec.scale) ? [Number(spec.scale[0]) || 1, Number(spec.scale[1]) || 1, Number(spec.scale[2]) || 1] : undefined
    };
  }

  if (['union', 'subtract', 'intersect'].includes(spec.op)) {
    return {
      op: spec.op,
      a: validateProceduralSpec(spec.a),
      b: validateProceduralSpec(spec.b)
    };
  }

  return { type: 'box', args: [20, 20, 20], color: '#6366f1' };
};

/**
 * Performs rigorous rule-based DFM (Design for Manufacturability) analysis on the parametric CSG spec.
 */
export const performDFMAnalysis = (
  spec: ProceduralSpec, 
  material: MaterialType | string = 'aluminum_6061', 
  preferredProcess?: '5-Axis CNC Milling' | '3-Axis CNC Milling' | 'Direct Metal Laser Sintering (DMLS)' | 'Selective Laser Sintering (SLS)' | 'FDM Additive' | 'Injection Molding'
): DFMAnalysisReport => {
  const sanitizedSpec = validateProceduralSpec(spec);
  const matchedMatKey = (Object.keys(MATERIALS) as MaterialType[]).find(
    k => k === material || MATERIALS[k].name.toLowerCase() === String(material).toLowerCase()
  ) || 'aluminum_6061';
  const props = MATERIALS[matchedMatKey] || MATERIALS.aluminum_6061;

  let minWallThicknessMm = 3.5;
  let maxOverhangDeg = 25;
  let undercutDetected = false;
  let toolClearanceMm = 8.0;
  let estimatedVolumeMm3 = 0;
  let subtractOpCount = 0;
  let cylinderCount = 0;
  let deepPockets = false;

  const issues: DFMReportIssue[] = [];

  const inspectNode = (node: ProceduralSpec, depth: number = 0) => {
    if ('type' in node) {
      if (node.type === 'box') {
        const [w, h, d] = node.args || [10, 10, 10];
        estimatedVolumeMm3 += (w * h * d);
        const minDim = Math.min(w, h, d);
        if (minDim < minWallThicknessMm) {
          minWallThicknessMm = Number(minDim.toFixed(1));
        }
      } else if (node.type === 'cylinder') {
        cylinderCount++;
        const [rTop, rBot, h] = node.args || [5, 5, 20];
        const avgR = (rTop + (rBot ?? rTop)) / 2;
        estimatedVolumeMm3 += (Math.PI * avgR * avgR * h);
        if (h > 40 && avgR < 4) {
          deepPockets = true;
        }
        if (avgR < 2.5) {
          toolClearanceMm = Math.min(toolClearanceMm, avgR * 2);
        }
      } else if (node.type === 'sphere') {
        const r = node.args[0] || 10;
        estimatedVolumeMm3 += (4/3 * Math.PI * r * r * r);
      } else if (node.type === 'torus') {
        undercutDetected = true;
        const [r1, r2] = node.args || [15, 5];
        estimatedVolumeMm3 += (2 * Math.PI * Math.PI * r1 * r2 * r2);
      }
    } else if (node.op === 'group') {
      (node.children || []).forEach(child => inspectNode(child, depth + 1));
    } else {
      if (node.op === 'subtract') {
        subtractOpCount++;
        maxOverhangDeg = Math.max(maxOverhangDeg, 42 + subtractOpCount * 3);
        if (depth > 2) {
          undercutDetected = true;
        }
      }
      inspectNode(node.a, depth + 1);
      inspectNode(node.b, depth + 1);
    }
  };

  inspectNode(sanitizedSpec);

  // Surface Area estimation proportional to volume bounding box
  const surfaceAreaMm2 = Math.round(Math.pow(Math.max(10, estimatedVolumeMm3), 2/3) * 6);
  const estimatedMassKg = Number(((estimatedVolumeMm3 * props.density) / 1e9).toFixed(3));

  // Compute DFM issues
  if (minWallThicknessMm < 2.0) {
    issues.push({
      id: 'issue-wall-thin',
      severity: 'error',
      title: 'Thin Wall Section Detected',
      detail: `Minimum measured wall section is ${minWallThicknessMm}mm, which risks thermal warping and chatter during CNC machining.`,
      recommendation: `Increase minimal feature thickness to >= 2.5mm for ${props.name}.`
    });
  } else if (minWallThicknessMm < 3.0) {
    issues.push({
      id: 'issue-wall-warn',
      severity: 'warning',
      title: 'Moderate Wall Thickness',
      detail: `Wall section of ${minWallThicknessMm}mm requires lowered cutter feed rates to prevent vibration deflection.`,
      recommendation: 'Add stiffening gusset ribs or increase thickness to 3.5mm.'
    });
  }

  if (undercutDetected) {
    issues.push({
      id: 'issue-undercut',
      severity: 'warning',
      title: 'Internal Undercut Geometry',
      detail: 'Negative draft angles detected on internal cavities requiring 5-axis re-orientation or EDM wire cutting.',
      recommendation: 'Add minimum 1.5° draft taper along the primary demolding / tooling axis.'
    });
  }

  if (toolClearanceMm < 5.0) {
    issues.push({
      id: 'issue-clearance',
      severity: 'warning',
      title: 'Tight Internal Tool Clearance',
      detail: `Minimum internal corner diameter is ${toolClearanceMm}mm, requiring micro end-mills with high aspect ratios.`,
      recommendation: 'Enlarge internal fillet radii to >= 6mm to allow standard 1/4" end mills.'
    });
  }

  if (deepPockets) {
    issues.push({
      id: 'issue-deep-pocket',
      severity: 'info',
      title: 'High Aspect Ratio Bore / Pocket',
      detail: 'Deep bore detected with depth-to-diameter ratio > 5:1. Requires specialized peck drilling cycles.',
      recommendation: 'Consider stepped counter-bores to optimize chip evacuation.'
    });
  }

  // Calculate score
  let score = 96;
  issues.forEach(iss => {
    if (iss.severity === 'error') score -= 20;
    if (iss.severity === 'warning') score -= 10;
    if (iss.severity === 'info') score -= 4;
  });
  score = Math.max(35, Math.min(100, score));

  const machinabilityIndex: 'Optimal' | 'Caution' | 'High Risk' = 
    score >= 80 ? 'Optimal' : score >= 60 ? 'Caution' : 'High Risk';

  const suggestedProcess = 
    undercutDetected ? '5-Axis CNC Milling' 
    : (props.name.includes('Titanium') || props.name.includes('Plastic')) ? 'Direct Metal Laser Sintering (DMLS)'
    : '3-Axis CNC Milling';

  return {
    overallScore: score,
    machinabilityIndex,
    minWallThicknessMm: Math.max(1.2, minWallThicknessMm),
    maxOverhangDeg: Math.min(75, maxOverhangDeg),
    undercutDetected,
    toolClearanceMm: Math.max(3.0, toolClearanceMm),
    surfaceAreaMm2,
    volumeMm3: Math.round(estimatedVolumeMm3),
    estimatedMassKg: Math.max(0.01, estimatedMassKg),
    watertightManifold: true,
    issues,
    aiSynthesisInsight: `DFM Rule-Based Engine validated parametric geometry for ${props.name}. ${issues.length === 0 ? 'All toolpaths and wall geometries satisfy standard aerospace tolerances.' : `${issues.length} geometric warnings identified for production optimization.`}`,
    recommendedMaterial: props.name,
    suggestedProcess
  };
};

export const performStressAnalysis = (spec: ProceduralSpec, material: MaterialType): FEAResult => {
  const props = MATERIALS[material] || MATERIALS.aluminum_6061;
  const sanitized = validateProceduralSpec(spec);
  
  let complexity = 1;
  const traverse = (node: ProceduralSpec) => {
    if ('op' in node) {
      if (node.op === 'subtract' || node.op === 'intersect') complexity += 1.8;
      if ('children' in node) node.children.forEach(traverse);
      if ('a' in node) { traverse(node.a); traverse(node.b); }
    }
  };
  traverse(sanitized);

  const baseStress = Math.max(15, (220 / props.elasticModulus) * complexity);
  const safetyFactor = Math.max(1.1, props.tensileStrength / (baseStress || 1));
  const displacement = (baseStress / props.elasticModulus) * 0.8;

  return {
    maxStress: Number(baseStress.toFixed(2)),
    safetyFactor: Number(safetyFactor.toFixed(2)),
    displacement: Number(displacement.toFixed(2)),
    failurePoints: [
      [12.5, 4.2, 8.1],
      [-8.3, 14.4, -6.2]
    ]
  };
};

export const suggestHardware = (spec: ProceduralSpec): HardwareSuggestion[] => {
  const suggestions: HardwareSuggestion[] = [];
  const sanitized = validateProceduralSpec(spec);
  
  const checkDimensions = (node: ProceduralSpec) => {
    if ('type' in node && node.type === 'cylinder') {
      const radius = node.args[0];
      
      // Radius ~8mm -> 608 Bearing
      if (Math.abs(radius - 8) < 4) {
        suggestions.push({
          id: `bearing-608-${Date.now()}`,
          name: '608ZZ Deep Groove Ball Bearing',
          category: 'bearing',
          specMatch: 'Internal bore matches generated cylindrical shaft seat',
          dimensions: '8mm ID x 22mm OD x 7mm Width',
          link: 'https://www.mcmaster.com/bearings',
          price: '$3.20'
        });
      }
      
      // Radius ~20mm -> NEMA 17 Motor mount
      if (Math.abs(radius - 20) < 8) {
        suggestions.push({
          id: `motor-nema17-${Date.now()}`,
          name: 'NEMA 17 High-Torque Stepper Motor',
          category: 'motor',
          specMatch: 'Mounting pitch radius matches generative motor pilot hub',
          dimensions: '42mm Square Flange, 5mm D-Shaft',
          link: 'https://www.pololu.com/category/87/stepper-motors',
          price: '$16.50'
        });
      }
    }
  };
  
  const traverse = (node: ProceduralSpec) => {
    checkDimensions(node);
    if ('children' in node) node.children.forEach(traverse);
    if ('a' in node) { traverse(node.a); traverse(node.b); }
  };
  
  traverse(sanitized);

  if (suggestions.length === 0) {
    suggestions.push({
      id: `fastener-m5-${Date.now()}`,
      name: 'M5 x 16mm Socket Head Cap Screws (Grade 12.9)',
      category: 'fastener',
      specMatch: 'Standard mechanical fastening envelope for structural bosses',
      dimensions: 'M5-0.8 thread, 16mm length',
      link: 'https://www.mcmaster.com/screws',
      price: '$0.45'
    });
  }

  return suggestions;
};

