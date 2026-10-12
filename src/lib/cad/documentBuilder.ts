import {
  ParametricCADDocument,
  CADParameter,
  CADReferencePlane,
  CADCoordinateSystem,
  CADSketch,
  CADFeature,
  CADBody,
  CADMaterial,
  SketchLine,
  SketchCircle,
  SketchRectangle,
  CADSketchConstraint,
  CADSketchDimension,
} from './types';
import { ProceduralSpec, ProceduralShape, ProceduralOperation, ProceduralGroup } from '../../types';

export interface DocumentBuildContext {
  projectName?: string;
  author?: string;
  units?: 'mm' | 'in';
  dimensions?: { length: number; width: number; height: number };
  materialName?: string;
  prompt?: string;
  specs?: string;
}

/**
 * Intelligent Parametric CAD Document Synthesizer.
 * Analyzes procedural CSG trees and parameter sets to reconstruct
 * high-level sketches, constraints, driving dimensions, and feature trees.
 */
export function buildParametricDocumentFromSpec(
  spec: ProceduralSpec | null | undefined,
  context: DocumentBuildContext = {}
): ParametricCADDocument {
  const units = context.units || 'mm';
  const projectName = context.projectName || 'Polystrukt_Workpiece';
  const author = context.author || 'Polystrukt CAD Studio';
  const timestamp = new Date().toISOString();

  const parameters: CADParameter[] = [];
  const referencePlanes: CADReferencePlane[] = [
    { id: 'plane_XY', name: 'Top Plane (XY)', type: 'XY', origin: [0, 0, 0], normal: [0, 0, 1] },
    { id: 'plane_XZ', name: 'Front Plane (XZ)', type: 'XZ', origin: [0, 0, 0], normal: [0, 1, 0] },
    { id: 'plane_YZ', name: 'Right Plane (YZ)', type: 'YZ', origin: [0, 0, 0], normal: [1, 0, 0] },
  ];

  const coordinateSystems: CADCoordinateSystem[] = [
    {
      id: 'wcs_origin',
      name: 'World Coordinate System (WCS)',
      origin: [0, 0, 0],
      xAxis: [1, 0, 0],
      yAxis: [0, 1, 0],
      zAxis: [0, 0, 1],
      isWorldOrigin: true,
    },
  ];

  const sketches: CADSketch[] = [];
  const features: CADFeature[] = [];
  const bodies: CADBody[] = [];

  // 1. Extract Global Named Parameters from Context & Dimensions
  const dims = context.dimensions || { length: 80, width: 80, height: 20 };
  const pLength: CADParameter = {
    id: 'param_length',
    name: 'PART_LENGTH',
    expression: `${dims.length}`,
    value: dims.length,
    unit: units,
    description: 'Overall workpiece envelope length',
    isDriving: true,
  };
  const pWidth: CADParameter = {
    id: 'param_width',
    name: 'PART_WIDTH',
    expression: `${dims.width}`,
    value: dims.width,
    unit: units,
    description: 'Overall workpiece envelope width',
    isDriving: true,
  };
  const pHeight: CADParameter = {
    id: 'param_height',
    name: 'PART_HEIGHT',
    expression: `${dims.height}`,
    value: dims.height,
    unit: units,
    description: 'Overall workpiece envelope height',
    isDriving: true,
  };

  parameters.push(pLength, pWidth, pHeight);

  // 2. Walk procedural nodes and reconstruct sketches + feature timeline
  let featureCounter = 1;
  let sketchCounter = 1;

  const mainBodyId = 'body_primary_solid';
  const bodyFeatureIds: string[] = [];

  function decomposeNode(
    node: ProceduralSpec | null | undefined,
    parentOp?: 'union' | 'subtract' | 'intersect'
  ) {
    if (!node) return;

    if ('type' in node) {
      // Primitive shape decomposition
      const shape = node as ProceduralShape;
      const isCut = parentOp === 'subtract';
      const featId = `feat_${shape.type}_${featureCounter++}`;
      const skId = `sketch_${sketchCounter++}`;
      const pos = shape.position || [0, 0, 0];
      const args = shape.args || [20, 20, 20];

      if (shape.type === 'box') {
        const [w, h, d] = args;
        const skWidthParamName = `SK_BOX_W_${featureCounter}`;
        const skHeightParamName = `SK_BOX_H_${featureCounter}`;

        parameters.push(
          {
            id: `param_${skWidthParamName}`,
            name: skWidthParamName,
            expression: `${w}`,
            value: w,
            unit: units,
            isDriving: true,
          },
          {
            id: `param_${skHeightParamName}`,
            name: skHeightParamName,
            expression: `${d}`,
            value: d,
            unit: units,
            isDriving: true,
          }
        );

        // Build 2D sketch rectangle
        const rectEntity: SketchRectangle = {
          id: `rect_${skId}`,
          name: 'Base Rectangle Profile',
          type: 'rectangle',
          center: [pos[0], pos[2]],
          width: w,
          height: d,
          isCentered: true,
          isConstruction: false,
        };

        const constraints: CADSketchConstraint[] = [
          {
            id: `c_horiz_${skId}`,
            type: 'horizontal',
            entityIds: [rectEntity.id],
            comment: 'Align rectangle horizontally with sketch X-axis',
          },
          {
            id: `c_vert_${skId}`,
            type: 'vertical',
            entityIds: [rectEntity.id],
            comment: 'Align rectangle vertically with sketch Y-axis',
          },
        ];

        const dimensions: CADSketchDimension[] = [
          {
            id: `dim_w_${skId}`,
            name: skWidthParamName,
            type: 'horizontal_distance',
            entityIds: [rectEntity.id],
            parameterId: `param_${skWidthParamName}`,
            value: w,
            expression: `${w}`,
            unit: units,
            isDriving: true,
          },
          {
            id: `dim_h_${skId}`,
            name: skHeightParamName,
            type: 'vertical_distance',
            entityIds: [rectEntity.id],
            parameterId: `param_${skHeightParamName}`,
            value: d,
            expression: `${d}`,
            unit: units,
            isDriving: true,
          },
        ];

        sketches.push({
          id: skId,
          name: isCut ? `Sketch Cut Profile (${w}x${d})` : `Base Profile Sketch (${w}x${d})`,
          planeId: 'plane_XY',
          entities: [rectEntity],
          constraints,
          dimensions,
        });

        features.push({
          id: featId,
          name: isCut ? `Extruded Cut [${w}x${d}]` : `Extrude Boss [${w}x${d}]`,
          type: 'extrude',
          sketchId: skId,
          parameters: {
            depth: h,
            depthExpression: `${h}`,
            isCut,
            symmetric: false,
            throughAll: isCut,
            direction: [0, 0, 1],
          },
          dependencies: [skId],
          suppressed: false,
          color: shape.color || (isCut ? '#ef4444' : '#6366f1'),
          targetBodyId: mainBodyId,
        });

        bodyFeatureIds.push(featId);
      } else if (shape.type === 'cylinder') {
        const [rTop, rBot, h] = args;
        const radius = rTop || rBot || 10;
        const diaParamName = isCut ? `HOLE_DIA_${featureCounter}` : `BOSS_DIA_${featureCounter}`;

        parameters.push({
          id: `param_${diaParamName}`,
          name: diaParamName,
          expression: `${radius * 2}`,
          value: radius * 2,
          unit: units,
          isDriving: true,
        });

        const circleEntity: SketchCircle = {
          id: `circ_${skId}`,
          name: isCut ? 'Bore Circle' : 'Boss Cylinder Circle',
          type: 'circle',
          center: [pos[0], pos[2]],
          radius: radius,
          isConstruction: false,
        };

        const constraints: CADSketchConstraint[] = [];
        if (Math.abs(pos[0]) < 0.001 && Math.abs(pos[2]) < 0.001) {
          constraints.push({
            id: `c_concentric_${skId}`,
            type: 'concentric',
            entityIds: [circleEntity.id, 'origin_pt'],
            comment: 'Concentric alignment with origin axis',
          });
        }

        const dimensions: CADSketchDimension[] = [
          {
            id: `dim_dia_${skId}`,
            name: diaParamName,
            type: 'diameter',
            entityIds: [circleEntity.id],
            parameterId: `param_${diaParamName}`,
            value: radius * 2,
            expression: `${radius * 2}`,
            unit: units,
            isDriving: true,
          },
        ];

        sketches.push({
          id: skId,
          name: isCut ? `Sketch Hole Bore (Dia ${radius * 2})` : `Sketch Boss (Dia ${radius * 2})`,
          planeId: 'plane_XY',
          entities: [circleEntity],
          constraints,
          dimensions,
        });

        features.push({
          id: featId,
          name: isCut ? `Extruded Cut Hole (Ø${radius * 2}mm)` : `Extrude Boss (Ø${radius * 2}mm)`,
          type: 'extrude',
          sketchId: skId,
          parameters: {
            depth: h,
            depthExpression: `${h}`,
            isCut,
            symmetric: false,
            throughAll: isCut,
            direction: [0, 0, 1],
          },
          dependencies: [skId],
          suppressed: false,
          color: shape.color || (isCut ? '#ef4444' : '#10b981'),
          targetBodyId: mainBodyId,
        });

        bodyFeatureIds.push(featId);
      } else {
        // Torus / Sphere / Cone -> Revolve or Fillet feature
        const featType = shape.type === 'torus' ? 'fillet' : shape.type === 'cone' ? 'revolve' : 'revolve';
        features.push({
          id: featId,
          name: `${shape.type.toUpperCase()} Feature`,
          type: featType,
          parameters: {
            isCut,
            radius: args[0] || 10,
            filletRadius: args[1] || 4,
            revolveAngle: 360,
            center: pos,
          },
          dependencies: [],
          suppressed: false,
          color: shape.color || '#f59e0b',
          targetBodyId: mainBodyId,
        });
        bodyFeatureIds.push(featId);
      }
    } else if (node.op === 'group') {
      const grp = node as ProceduralGroup;
      grp.children?.forEach((child) => decomposeNode(child, parentOp));
    } else if (['union', 'subtract', 'intersect'].includes(node.op)) {
      const op = node as ProceduralOperation;
      decomposeNode(op.a, parentOp);
      decomposeNode(op.b, op.op);
    }
  }

  // Decompose CSG spec
  if (spec) {
    decomposeNode(spec);
  } else {
    // Default baseline solid box + centered bore
    decomposeNode({
      op: 'subtract',
      a: { type: 'box', args: [dims.length, dims.height, dims.width], position: [0, 0, 0] },
      b: { type: 'cylinder', args: [12, 12, dims.height + 10], position: [0, 0, 0] },
    });
  }

  // 3. Assemble Bodies & Materials
  bodies.push({
    id: mainBodyId,
    name: `${projectName}_SolidBody`,
    materialId: 'mat_al6061',
    color: '#6366f1',
    featureIds: bodyFeatureIds,
    isSolid: true,
    volumeMm3: dims.length * dims.width * dims.height * 0.85,
    estimatedMassKg: (dims.length * dims.width * dims.height * 0.85 * 2.7) / 1e6, // Aluminum 2.7g/cm3
  });

  const materials: CADMaterial[] = [
    {
      id: 'mat_al6061',
      name: context.materialName || 'Aluminum 6061-T6',
      densityKgM3: 2700,
      elasticModulusGPa: 68.9,
      tensileStrengthMPa: 310,
      color: '#cbd5e1',
    },
  ];

  return {
    metadata: {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: projectName,
      author,
      units,
      angleUnits: 'deg',
      version: '1.0.0',
      createdAt: timestamp,
      modifiedAt: timestamp,
      description: context.specs || context.prompt || 'Synthesized Parametric Engineering Part',
      sourceApplication: 'Polystrukt GenCAD Studio',
    },
    parameters,
    coordinateSystems,
    referencePlanes,
    sketches,
    features,
    bodies,
    materials,
  };
}
