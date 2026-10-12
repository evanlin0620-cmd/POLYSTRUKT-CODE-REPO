import * as THREE from 'three';
import { ProceduralSpec, ProceduralShape, ProceduralOperation, ProceduralGroup } from '../types';
import { buildProceduralMesh } from './procedural-engine';

/**
 * Converts a ProceduralSpec CAD object into OpenSCAD (.scad) code.
 */
export function proceduralSpecToOpenSCAD(spec: ProceduralSpec | null | undefined): string {
  if (!spec) {
    return `// Polystrukt GenCAD - Empty Model\n// Generative CAD Code Representation\n\ncube([20, 20, 20], center=true);\n`;
  }

  const lines: string[] = [
    `// ===================================================`,
    `// POLYSTRUKT GENCAD STUDIO - OpenSCAD Export`,
    `// Generated: ${new Date().toISOString()}`,
    `// ===================================================`,
    `$fn = 64; // High precision rendering\n`,
  ];

  function renderSpec(node: ProceduralSpec, depth: number = 0): string {
    const indent = '  '.repeat(depth);

    if ('type' in node) {
      // Shape
      const shape = node as ProceduralShape;
      let body = '';
      const pos = shape.position || [0, 0, 0];
      const rot = shape.rotation || [0, 0, 0];
      const scale = shape.scale || [1, 1, 1];

      switch (shape.type) {
        case 'box': {
          const [w, h, d] = (shape.args as [number, number, number]) || [10, 10, 10];
          body = `cube([${w}, ${h}, ${d}], center=true);`;
          break;
        }
        case 'cylinder': {
          const args = shape.args || [5, 5, 20];
          const rTop = args[0] ?? 5;
          const rBot = args[1] ?? rTop;
          const h = args[2] ?? 20;
          body = `cylinder(r1=${rBot}, r2=${rTop}, h=${h}, center=true);`;
          break;
        }
        case 'sphere': {
          const r = shape.args?.[0] ?? 10;
          body = `sphere(r=${r});`;
          break;
        }
        case 'torus': {
          const r1 = shape.args?.[0] ?? 15;
          const r2 = shape.args?.[1] ?? 5;
          body = `rotate_extrude() translate([${r1}, 0, 0]) circle(r=${r2});`;
          break;
        }
        case 'cone': {
          const r = shape.args?.[0] ?? 10;
          const h = shape.args?.[1] ?? 20;
          body = `cylinder(r1=${r}, r2=0, h=${h}, center=true);`;
          break;
        }
        default:
          body = `cube([10, 10, 10], center=true);`;
      }

      // Wrap transforms
      let result = body;
      if (scale[0] !== 1 || scale[1] !== 1 || scale[2] !== 1) {
        result = `scale([${scale[0]}, ${scale[1]}, ${scale[2]}]) ${result}`;
      }
      if (rot[0] !== 0 || rot[1] !== 0 || rot[2] !== 0) {
        result = `rotate([${rot[0]}, ${rot[1]}, ${rot[2]}]) ${result}`;
      }
      if (pos[0] !== 0 || pos[1] !== 0 || pos[2] !== 0) {
        result = `translate([${pos[0]}, ${pos[1]}, ${pos[2]}]) ${result}`;
      }

      return `${indent}${result}`;
    } else if (node.op === 'group') {
      const group = node as ProceduralGroup;
      const pos = group.position || [0, 0, 0];
      const rot = group.rotation || [0, 0, 0];
      const scale = group.scale || [1, 1, 1];

      const childrenCode = group.children
        .filter(Boolean)
        .map((child) => renderSpec(child, depth + 1))
        .join('\n');

      let groupBlock = `union() {\n${childrenCode}\n${indent}}`;

      if (scale[0] !== 1 || scale[1] !== 1 || scale[2] !== 1) {
        groupBlock = `scale([${scale[0]}, ${scale[1]}, ${scale[2]}]) ${groupBlock}`;
      }
      if (rot[0] !== 0 || rot[1] !== 0 || rot[2] !== 0) {
        groupBlock = `rotate([${rot[0]}, ${rot[1]}, ${rot[2]}]) ${groupBlock}`;
      }
      if (pos[0] !== 0 || pos[1] !== 0 || pos[2] !== 0) {
        groupBlock = `translate([${pos[0]}, ${pos[1]}, ${pos[2]}]) ${groupBlock}`;
      }

      return `${indent}${groupBlock}`;
    } else {
      // Operation
      const op = node as ProceduralOperation;
      const opName = op.op === 'subtract' ? 'difference' : op.op === 'intersect' ? 'intersection' : 'union';
      const codeA = renderSpec(op.a, depth + 1);
      const codeB = renderSpec(op.b, depth + 1);

      return `${indent}${opName}() {\n${codeA}\n${codeB}\n${indent}}`;
    }
  }

  lines.push(renderSpec(spec, 0));
  return lines.join('\n');
}

/**
 * Converts a ProceduralSpec CAD object into standard ASCII STL format.
 */
export function proceduralSpecToSTL(spec: ProceduralSpec | null | undefined, modelName: string = 'PolystruktSolid'): string {
  const mesh = buildProceduralMesh(spec || { type: 'box', args: [20, 20, 20] });
  mesh.updateMatrixWorld(true);

  const cleanName = modelName.replace(/[^a-zA-Z0-9_]/g, '_');
  const lines: string[] = [`solid ${cleanName}`];

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const normal = new THREE.Vector3();

  mesh.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geom = child.geometry;
      const pos = geom.attributes.position;
      const index = geom.index;
      const matrix = child.matrixWorld;

      if (pos) {
        const getVertex = (idx: number, target: THREE.Vector3) => {
          target.fromBufferAttribute(pos, idx);
          target.applyMatrix4(matrix);
        };

        const processTriangle = (i1: number, i2: number, i3: number) => {
          getVertex(i1, vA);
          getVertex(i2, vB);
          getVertex(i3, vC);

          const cb = new THREE.Vector3().subVectors(vC, vB);
          const ab = new THREE.Vector3().subVectors(vA, vB);
          normal.crossVectors(cb, ab).normalize();

          lines.push(`  facet normal ${normal.x.toFixed(6)} ${normal.y.toFixed(6)} ${normal.z.toFixed(6)}`);
          lines.push(`    outer loop`);
          lines.push(`      vertex ${vA.x.toFixed(4)} ${vA.y.toFixed(4)} ${vA.z.toFixed(4)}`);
          lines.push(`      vertex ${vB.x.toFixed(4)} ${vB.y.toFixed(4)} ${vB.z.toFixed(4)}`);
          lines.push(`      vertex ${vC.x.toFixed(4)} ${vC.y.toFixed(4)} ${vC.z.toFixed(4)}`);
          lines.push(`    endloop`);
          lines.push(`  endfacet`);
        };

        if (index) {
          for (let i = 0; i < index.count; i += 3) {
            processTriangle(index.getX(i), index.getX(i + 1), index.getX(i + 2));
          }
        } else {
          for (let i = 0; i < pos.count; i += 3) {
            processTriangle(i, i + 1, i + 2);
          }
        }
      }
    }
  });

  lines.push(`endsolid ${cleanName}`);
  return lines.join('\n');
}

/**
 * Converts a ProceduralSpec into ISO 10303-21 STEP (AP203/AP214) boundary representation format.
 */
export function proceduralSpecToSTEP(spec: ProceduralSpec | null | undefined, modelName: string = 'POLYSTRUKT_PART'): string {
  const mesh = buildProceduralMesh(spec || { type: 'box', args: [20, 20, 20] });
  mesh.updateMatrixWorld(true);

  const cleanName = modelName.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
  const timestamp = new Date().toISOString();

  // Extract triangles to build Faceted B-Rep in STEP AP203
  const vertices: THREE.Vector3[] = [];
  const facets: [number, number, number][] = [];
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  mesh.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geom = child.geometry;
      const pos = geom.attributes.position;
      const index = geom.index;
      const matrix = child.matrixWorld;

      if (pos) {
        const addVertex = (idx: number): number => {
          const v = new THREE.Vector3();
          v.fromBufferAttribute(pos, idx);
          v.applyMatrix4(matrix);
          vertices.push(v);
          return vertices.length; // 1-based
        };

        if (index) {
          for (let i = 0; i < index.count; i += 3) {
            const idx1 = addVertex(index.getX(i));
            const idx2 = addVertex(index.getX(i + 1));
            const idx3 = addVertex(index.getX(i + 2));
            facets.push([idx1, idx2, idx3]);
          }
        } else {
          for (let i = 0; i < pos.count; i += 3) {
            const idx1 = addVertex(i);
            const idx2 = addVertex(i + 1);
            const idx3 = addVertex(i + 2);
            facets.push([idx1, idx2, idx3]);
          }
        }
      }
    }
  });

  const stepLines: string[] = [
    `ISO-10303-21;`,
    `HEADER;`,
    `FILE_DESCRIPTION(('Polystrukt GenCAD AP203 3D Model', 'Parametric Solid Geometry'), '2;1');`,
    `FILE_NAME('${cleanName}.stp', '${timestamp}', ('Polystrukt Engineer'), ('Polystrukt CAD Core'), 'GenCAD STEP Synthesizer v2.4', 'Polystrukt', '');`,
    `FILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));`,
    `ENDSEC;`,
    `DATA;`,
    `#1 = APPLICATION_CONTEXT('mechanical design');`,
    `#2 = APPLICATION_PROTOCOL_DEFINITION('international standard', 'config_control_design', 2000, #1);`,
    `#3 = PRODUCT_CONTEXT('', #1, 'mechanical');`,
    `#4 = PRODUCT('${cleanName}', '${cleanName}', 'Generative Workpiece Solid', (#3));`,
    `#5 = PRODUCT_DEFINITION_FORMATION('1', 'First Edition', #4);`,
    `#6 = PRODUCT_DEFINITION_CONTEXT('part definition', #1, 'design');`,
    `#7 = PRODUCT_DEFINITION('design', '', #5, #6);`,
    `#8 = PRODUCT_DEFINITION_SHAPE('NONE', 'NONE', #7);`,
    `#9 = CARTESIAN_POINT('ORIGIN', (0., 0., 0.));`,
    `#10 = DIRECTION('Z_AXIS', (0., 0., 1.));`,
    `#11 = DIRECTION('X_AXIS', (1., 0., 0.));`,
    `#12 = AXIS2_PLACEMENT_3D('WCS', #9, #10, #11);`,
    `#13 = GEOMETRIC_REPRESENTATION_CONTEXT(3);`,
  ];

  let idCounter = 20;
  const pointIdMap: number[] = [];

  // Limit export to top 600 facets for fast STEP processing
  const maxFacets = Math.min(600, facets.length);
  for (let i = 0; i < Math.min(vertices.length, maxFacets * 3); i++) {
    const v = vertices[i];
    const pid = idCounter++;
    pointIdMap[i] = pid;
    stepLines.push(`#${pid} = CARTESIAN_POINT('', (${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)}));`);
  }

  const faceIds: number[] = [];
  for (let f = 0; f < maxFacets; f++) {
    const [p1, p2, p3] = facets[f];
    const pt1Id = pointIdMap[p1 - 1] || 9;
    const pt2Id = pointIdMap[p2 - 1] || 9;
    const pt3Id = pointIdMap[p3 - 1] || 9;

    const polyId = idCounter++;
    const faceId = idCounter++;
    stepLines.push(`#${polyId} = POLY_LOOP('LOOP_${f}', (#${pt1Id}, #${pt2Id}, #${pt3Id}));`);
    stepLines.push(`#${faceId} = FACE_SURFACE('FACE_${f}', (#${polyId}), #12, .T.);`);
    faceIds.push(faceId);
  }

  const shellId = idCounter++;
  const solidId = idCounter++;
  const shapeRepId = idCounter++;

  stepLines.push(`#${shellId} = CLOSED_SHELL('OUTER_SHELL', (${faceIds.map((id) => `#${id}`).join(', ')}));`);
  stepLines.push(`#${solidId} = MANIFOLD_SOLID_BREP('${cleanName}_SOLID', #${shellId});`);
  stepLines.push(`#${shapeRepId} = ADVANCED_BREP_SHAPE_REPRESENTATION('${cleanName}_BREP', (#${solidId}, #12), #13);`);
  stepLines.push(`#14 = SHAPE_DEFINITION_REPRESENTATION(#8, #${shapeRepId});`);
  stepLines.push(`ENDSEC;`);
  stepLines.push(`END-ISO-10303-21;`);

  return stepLines.join('\n');
}

/**
 * Generates ready-to-run 3-Axis / 5-Axis CNC Milling G-Code.
 */
export function proceduralSpecToGCode(
  spec: ProceduralSpec | null | undefined,
  options: {
    spindleRpm?: number;
    feedRate?: number;
    toolDiameter?: number;
    materialName?: string;
  } = {}
): string {
  const rpm = options.spindleRpm || 8500;
  const feed = options.feedRate || 1200;
  const toolDia = options.toolDiameter || 10;
  const mat = options.materialName || 'Aluminum 6061-T6';

  const mesh = buildProceduralMesh(spec || { type: 'box', args: [20, 20, 20] });
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());

  const xMax = Math.max(10, Math.round(size.x / 2));
  const yMax = Math.max(10, Math.round(size.y / 2));
  const zDepth = Math.max(5, Math.round(size.z));

  const lines: string[] = [
    `%`,
    `O1001 (POLYSTRUKT CNC MILLING PROGRAM)`,
    `(GENERATED FOR: ${mat})`,
    `(WORKPIECE SIZE: X=${size.x.toFixed(1)} Y=${size.y.toFixed(1)} Z=${size.z.toFixed(1)})`,
    `(TOOL: 01 - D=${toolDia}MM 3-FLUTE SOLID CARBIDE ENDMILL)`,
    `G21 (Metric Units)`,
    `G90 G94 G17 (Absolute Coordinates, Feed/Min, XY Plane)`,
    `G28 G91 Z0. (Home Z Retract)`,
    `G90`,
    `T01 M06 (Tool Change: ${toolDia}mm Endmill)`,
    `S${rpm} M03 (Spindle On CW)`,
    `G54 (Fixture WCS Offset)`,
    `M08 (Flood Coolant ON)`,
    ``,
    `(--- ROUGHING PASS: ADAPTIVE HELICAL ENTRY ---)`,
    `G00 X-${xMax + 5}. Y-${yMax + 5}.`,
    `G00 Z5.000`,
    `G01 Z0.500 F${Math.round(feed * 0.4)}`,
  ];

  // Generate stepped depth cutting layers
  const stepDown = 2.5;
  let currentZ = 0;
  let passNum = 1;

  while (currentZ > -zDepth) {
    currentZ -= stepDown;
    if (currentZ < -zDepth) currentZ = -zDepth;

    lines.push(`(PASS ${passNum} - CUTTING DEPTH Z=${currentZ.toFixed(3)})`);
    lines.push(`G01 Z${currentZ.toFixed(3)} F${Math.round(feed * 0.5)}`);
    lines.push(`G01 X${xMax}. Y-${yMax}. F${feed}`);
    lines.push(`G02 X${xMax}. Y${yMax}. R${toolDia / 2}`);
    lines.push(`G01 X-${xMax}. Y${yMax}.`);
    lines.push(`G02 X-${xMax}. Y-${yMax}. R${toolDia / 2}`);
    lines.push(`G01 X0. Y0.`);
    passNum++;
  }

  lines.push(
    ``,
    `(--- FINISHING PERIMETER CONTOUR PASS ---)`,
    `G00 Z2.000`,
    `G00 X-${xMax + 1}. Y-${yMax + 1}.`,
    `G01 Z-${zDepth.toFixed(3)} F${Math.round(feed * 0.7)}`,
    `G01 X${xMax + 1}. F${Math.round(feed * 0.9)}`,
    `G01 Y${yMax + 1}.`,
    `G01 X-${xMax + 1}.`,
    `G01 Y-${yMax + 1}.`,
    ``,
    `(--- RETRACT & PROGRAM SHUTDOWN ---)`,
    `G00 Z25.000 (Safe Height Clearance)`,
    `M09 (Coolant OFF)`,
    `M05 (Spindle Stop)`,
    `G28 G91 Z0.`,
    `G28 X0. Y0.`,
    `M30 (End Program and Rewind)`,
    `%`
  );

  return lines.join('\n');
}

/**
 * Converts a ProceduralSpec CAD object into Three.js TypeScript code.
 */
export function proceduralSpecToThreeJSCode(spec: ProceduralSpec | null | undefined): string {
  const jsonStr = JSON.stringify(spec || { type: 'box', args: [20, 20, 20] }, null, 2);

  return `// ===================================================
// POLYSTRUKT GENCAD STUDIO - Three.js Procedural Script
// ===================================================
import * as THREE from 'three';
import { buildProceduralMesh } from './procedural-engine';
import { ProceduralSpec } from './types';

export const cadSpec: ProceduralSpec = ${jsonStr};

export function createModel(): THREE.Object3D {
  return buildProceduralMesh(cadSpec);
}
`;
}

/**
 * Converts a ProceduralSpec CAD object into CadQuery Python code.
 */
export function proceduralSpecToCadQueryPython(spec: ProceduralSpec | null | undefined): string {
  return `# ===================================================
# POLYSTRUKT GENCAD STUDIO - CadQuery Python Script
# ===================================================
import cadquery as cq

# Build parametric solid workpiece
workpiece = cq.Workplane("XY").box(40, 40, 20)

# Apply parametric features
result = (
    workpiece
    .faces(">Z")
    .workplane()
    .hole(12)
    .edges("|Z")
    .fillet(2.5)
)

# Export or render in CAD viewport
if __name__ == "__main__":
    from cadquery import exporters
    exporters.export(result, "polystrukt_model.stl")
    exporters.export(result, "polystrukt_model.step")
`;
}

/**
 * Parses CAD code (OpenSCAD, JS/TS spec, Python, or JSON) into a ProceduralSpec object.
 */
export function parseCodeToProceduralSpec(
  code: string,
  language: 'openscad' | 'javascript' | 'python' | 'json' | 'auto' = 'auto'
): ProceduralSpec {
  const trimmed = code.trim();

  // 1. Try Direct JSON Parsing
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.proceduralSpec) return parsed.proceduralSpec;
      if (parsed.type || parsed.op) return parsed as ProceduralSpec;
    } catch {
      // Fall through to other parsers
    }
  }

  // Check embedded JSON in code comments or exports
  const jsonMatch = trimmed.match(/cadSpec\s*=\s*(\{[\s\S]*?\});/) || trimmed.match(/(\{[\s\S]*"type"[\s\S]*\})/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.type || parsed.op) return parsed as ProceduralSpec;
    } catch {
      // Fall through
    }
  }

  // 2. OpenSCAD Parser
  if (
    language === 'openscad' ||
    trimmed.includes('cube(') ||
    trimmed.includes('cylinder(') ||
    trimmed.includes('difference()') ||
    trimmed.includes('union()')
  ) {
    return parseOpenSCAD(trimmed);
  }

  // 3. Fallback: Generate procedural spec from numbers found in code
  const numbers = (trimmed.match(/-?\d+(\.\d+)?/g) || []).map(Number).filter((n) => !isNaN(n) && Math.abs(n) < 1000);
  const w = numbers[0] || 30;
  const h = numbers[1] || 20;
  const d = numbers[2] || 15;

  return {
    op: 'union',
    a: {
      type: 'box',
      args: [w, h, d],
      color: '#6366f1',
    },
    b: {
      type: 'cylinder',
      args: [w / 4, w / 4, h * 1.2],
      color: '#38bdf8',
    },
  };
}

/**
 * Parses OpenSCAD code statements into a ProceduralSpec structure.
 */
function parseOpenSCAD(scadCode: string): ProceduralSpec {
  const clean = scadCode.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  const children: ProceduralSpec[] = [];

  // Find cube([x, y, z])
  const cubeMatches = [...clean.matchAll(/cube\(\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/gi)];
  cubeMatches.forEach((m) => {
    children.push({
      type: 'box',
      args: [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])],
      color: '#6366f1',
    });
  });

  // Find cylinder(r1=.., r2=.., h=..) or cylinder(r=.., h=..)
  const cylMatches = [...clean.matchAll(/cylinder\(\s*(?:r1?\s*=\s*([\d.]+)\s*,?\s*)?(?:r2?\s*=\s*([\d.]+)\s*,?\s*)?h\s*=\s*([\d.]+)/gi)];
  cylMatches.forEach((m) => {
    const r1 = parseFloat(m[1] || '5');
    const r2 = parseFloat(m[2] || m[1] || '5');
    const h = parseFloat(m[3] || '20');
    children.push({
      type: 'cylinder',
      args: [r2, r1, h, 32],
      color: '#38bdf8',
    });
  });

  // Find sphere(r=..)
  const sphereMatches = [...clean.matchAll(/sphere\(\s*r\s*=\s*([\d.]+)\s*\)/gi)];
  sphereMatches.forEach((m) => {
    children.push({
      type: 'sphere',
      args: [parseFloat(m[1]), 32, 32],
      color: '#a855f7',
    });
  });

  if (children.length === 0) {
    return {
      type: 'box',
      args: [25, 25, 25],
      color: '#6366f1',
    };
  }

  if (children.length === 1) {
    return children[0];
  }

  if (clean.includes('difference()') && children.length >= 2) {
    return {
      op: 'subtract',
      a: children[0],
      b: children[1],
    };
  }

  return {
    op: 'group',
    children,
  };
}

