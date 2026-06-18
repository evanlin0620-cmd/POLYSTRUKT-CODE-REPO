import { MaterialType, MaterialProperties, FEAResult, ProceduralSpec, HardwareSuggestion } from '../types';

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

export const performStressAnalysis = (spec: ProceduralSpec, material: MaterialType): FEAResult => {
  const props = MATERIALS[material];
  
  // Logic to estimate stress based on procedural spec geometry
  // This is a "Pseudo-FEA" implementation
  let complexity = 1;
  const traverse = (node: ProceduralSpec) => {
    if ('op' in node) {
      if (node.op === 'subtract' || node.op === 'intersect') complexity += 2;
      if ('children' in node) node.children.forEach(traverse);
      if ('a' in node) { traverse(node.a); traverse(node.b); }
    }
  };
  traverse(spec);

  const baseStress = 50 * (1 / props.elasticModulus) * complexity;
  const safetyFactor = props.tensileStrength / (baseStress || 1);
  const displacement = (baseStress / props.elasticModulus) * 2;

  return {
    maxStress: Number(baseStress.toFixed(2)),
    safetyFactor: Number(safetyFactor.toFixed(2)),
    displacement: Number(displacement.toFixed(2)),
    failurePoints: [
      [0.5, 0.2, 0.1],
      [-0.3, 0.4, -0.2]
    ] // Simulated hot-spots
  };
};

export const suggestHardware = (spec: ProceduralSpec): HardwareSuggestion[] => {
  const suggestions: HardwareSuggestion[] = [];
  
  const checkDimensions = (node: ProceduralSpec) => {
    if ('type' in node && node.type === 'cylinder') {
      const radius = node.args[0];
      const height = node.args[1];
      
      // Radius ~8mm -> 608 Bearing
      if (Math.abs(radius - 8) < 2) {
        suggestions.push({
          id: `bearing-${Date.now()}`,
          name: '608ZZ Ball Bearing',
          category: 'bearing',
          specMatch: 'Internal bore matches generated cylinder radius',
          dimensions: '8x22x7mm',
          link: 'https://www.mcmaster.com/bearings',
          price: '$2.45'
        });
      }
      
      // Radius ~20mm -> NEMA 17 Motor shaft/mount
      if (Math.abs(radius - 20) < 5) {
        suggestions.push({
          id: `motor-${Date.now()}`,
          name: 'NEMA 17 Stepper Motor',
          category: 'motor',
          specMatch: 'Mounting diameter matches structural hub',
          dimensions: '42x42mm Frame',
          link: 'https://www.pololu.com/category/87/stepper-motors',
          price: '$14.95'
        });
      }
    }
  };
  
  const traverse = (node: ProceduralSpec) => {
    checkDimensions(node);
    if ('children' in node) node.children.forEach(traverse);
    if ('a' in node) { traverse(node.a); traverse(node.b); }
  };
  
  traverse(spec);
  return suggestions;
};
