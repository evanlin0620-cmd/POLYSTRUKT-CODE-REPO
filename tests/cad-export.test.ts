import { describe, it, expect } from 'vitest';
import { CADUnitSystem } from '../src/lib/cad/units';
import { CADConstraintTranslator } from '../src/lib/cad/constraints';
import { CADDependencyGraph } from '../src/lib/cad/dependencyGraph';
import { buildParametricDocumentFromSpec } from '../src/lib/cad/documentBuilder';
import { CADValidator } from '../src/lib/cad/validator';
import { cadExportManager } from '../src/services/cadExportManager';
import { CADSketchConstraint, CADSketch, CADFeature } from '../src/lib/cad/types';

describe('CADUnitSystem Strict Unit Conversion', () => {
  it('converts exact lengths between metric and imperial units', () => {
    // 1 inch = exactly 25.4 mm
    expect(CADUnitSystem.convertLength(1, 'in', 'mm')).toBe(25.4);
    expect(CADUnitSystem.convertLength(25.4, 'mm', 'in')).toBe(1);

    // 100 cm = 1 m = 1000 mm
    expect(CADUnitSystem.convertLength(100, 'cm', 'm')).toBe(1);
    expect(CADUnitSystem.convertLength(1, 'm', 'mm')).toBe(1000);

    // 1 foot = 12 inches = 304.8 mm
    expect(CADUnitSystem.convertLength(1, 'ft', 'in')).toBe(12);
  });

  it('converts angles between degrees and radians', () => {
    expect(CADUnitSystem.convertAngle(180, 'deg', 'rad')).toBeCloseTo(Math.PI, 6);
    expect(CADUnitSystem.convertAngle(Math.PI / 2, 'rad', 'deg')).toBeCloseTo(90, 6);
  });

  it('parses dimension strings with embedded units', () => {
    expect(CADUnitSystem.parseDimension('50 mm')).toEqual({ value: 50, unit: 'mm' });
    expect(CADUnitSystem.parseDimension('2.5 in')).toEqual({ value: 2.5, unit: 'in' });
    expect(CADUnitSystem.parseDimension('100')).toEqual({ value: 100, unit: 'mm' });
  });
});

describe('CADConstraintTranslator Multi-Platform Translation', () => {
  const sampleConstraint: CADSketchConstraint = {
    id: 'c1',
    type: 'concentric',
    entityIds: ['circ_1', 'circ_2'],
  };

  it('translates concentric constraint to Onshape FeatureScript', () => {
    const res = CADConstraintTranslator.translateGeometricConstraint(sampleConstraint, 'onshape');
    expect(res.isSupported).toBe(true);
    expect(res.syntaxSnippet).toContain('ConstraintType.CONCENTRIC');
  });

  it('translates concentric constraint to SolidWorks COM API', () => {
    const res = CADConstraintTranslator.translateGeometricConstraint(sampleConstraint, 'solidworks');
    expect(res.isSupported).toBe(true);
    expect(res.syntaxSnippet).toContain('sgCONCENTRIC');
  });

  it('translates concentric constraint to Autodesk Fusion 360 Python API', () => {
    const res = CADConstraintTranslator.translateGeometricConstraint(sampleConstraint, 'fusion');
    expect(res.isSupported).toBe(true);
    expect(res.syntaxSnippet).toContain('sketch.geometricConstraints.addConcentric');
  });

  it('handles unsupported platforms gracefully with fallback warnings', () => {
    const res = CADConstraintTranslator.translateGeometricConstraint(sampleConstraint, 'stl');
    expect(res.isSupported).toBe(false);
    expect(res.fallbackStrategy).toBe('fix_coordinates');
    expect(res.warningMessage).toContain('does not support native parametric constraint solver');
  });
});

describe('CADDependencyGraph Topological Sorting', () => {
  it('correctly orders parent sketches before child extrusion features', () => {
    const graph = new CADDependencyGraph();

    const sk1: CADSketch = {
      id: 'sk_base',
      name: 'Base Sketch',
      planeId: 'plane_XY',
      entities: [],
      constraints: [],
      dimensions: [],
    };

    const feat1: CADFeature = {
      id: 'feat_extrude',
      name: 'Base Extrude',
      type: 'extrude',
      sketchId: 'sk_base',
      parameters: { depth: 20 },
      dependencies: ['sk_base'],
      suppressed: false,
    };

    const feat2: CADFeature = {
      id: 'feat_fillet',
      name: 'Edge Fillet',
      type: 'fillet',
      parameters: { filletRadius: 3 },
      dependencies: ['feat_extrude'],
      suppressed: false,
    };

    graph.addSketch(sk1);
    graph.addFeature(feat2);
    graph.addFeature(feat1); // Out of order insert

    const order = graph.buildOrder();
    expect(order.hasCycle).toBe(false);

    const orderedIds = order.sortedNodes.map((n) => n.id);
    expect(orderedIds.indexOf('sk_base')).toBeLessThan(orderedIds.indexOf('feat_extrude'));
    expect(orderedIds.indexOf('feat_extrude')).toBeLessThan(orderedIds.indexOf('feat_fillet'));
  });

  it('detects circular dependencies', () => {
    const graph = new CADDependencyGraph();

    const featA: CADFeature = {
      id: 'featA',
      name: 'Feature A',
      type: 'extrude',
      parameters: {},
      dependencies: ['featB'],
      suppressed: false,
    };

    const featB: CADFeature = {
      id: 'featB',
      name: 'Feature B',
      type: 'extrude',
      parameters: {},
      dependencies: ['featA'], // Cycle A <-> B
      suppressed: false,
    };

    graph.addFeature(featA);
    graph.addFeature(featB);

    const result = graph.buildOrder();
    expect(result.hasCycle).toBe(true);
  });
});

describe('Parametric Document Synthesis & Validation', () => {
  it('deconstructs procedural CSG spec into parametric sketches, constraints, and features', () => {
    const doc = buildParametricDocumentFromSpec(
      {
        op: 'subtract',
        a: { type: 'box', args: [80, 20, 80], position: [0, 0, 0] },
        b: { type: 'cylinder', args: [15, 15, 40], position: [0, 0, 0] },
      },
      {
        projectName: 'Flanged_Hub',
        author: 'Polystrukt Test Engineer',
        dimensions: { length: 80, width: 80, height: 20 },
      }
    );

    expect(doc.metadata.name).toBe('Flanged_Hub');
    expect(doc.parameters.length).toBeGreaterThanOrEqual(3);
    expect(doc.sketches.length).toBeGreaterThanOrEqual(2);
    expect(doc.features.length).toBeGreaterThanOrEqual(2);

    // Verify driving parameters exist
    const paramNames = doc.parameters.map((p) => p.name);
    expect(paramNames).toContain('PART_LENGTH');
    expect(paramNames).toContain('PART_WIDTH');
    expect(paramNames).toContain('PART_HEIGHT');

    // Run validator
    const validation = CADValidator.validate(doc, 'onshape');
    expect(validation.isValid).toBe(true);
    expect(validation.scorePercentage).toBeGreaterThanOrEqual(85);

    // Check manifest
    const manifest = CADValidator.generateManifest(doc, 'onshape', 'Onshape', validation);
    expect(manifest.fidelityLevel).toBe('Level 1 - Native Parametric');
    expect(manifest.recreatedFeatures).toBe(doc.features.length);
  });
});

describe('CAD Platform Adapters Execution', () => {
  it('synthesizes valid Onshape FeatureScript with variables, sketches, and extrude ops', async () => {
    const doc = buildParametricDocumentFromSpec({
      op: 'subtract',
      a: { type: 'box', args: [60, 15, 60], position: [0, 0, 0] },
      b: { type: 'cylinder', args: [10, 10, 30], position: [0, 0, 0] },
    });

    const result = await cadExportManager.executeExportJob('onshape', doc as any, {});
    expect(result.success).toBe(true);
    expect(result.filename).toContain('_onshape.fs');
    expect(typeof result.content).toBe('string');

    const code = result.content as string;
    expect(code).toContain('FeatureScript 2450;');
    expect(code).toContain('newSketchOnPlane');
    expect(code).toContain('opExtrude');
    expect(result.openInUrl).toContain('cad.onshape.com');
  });

  it('synthesizes valid SolidWorks Macro with COM API automation', async () => {
    const doc = buildParametricDocumentFromSpec({
      type: 'box',
      args: [100, 25, 50],
      position: [0, 0, 0],
    });

    const result = await cadExportManager.executeExportJob('solidworks', doc as any, {});
    expect(result.success).toBe(true);
    expect(result.filename).toContain('SolidWorksMacro');

    const code = result.content as string;
    expect(code).toContain('Application.SldWorks');
    expect(code).toContain('Part.SketchManager.InsertSketch');
    expect(code).toContain('Part.FeatureManager.FeatureExtrusion3');
  });

  it('synthesizes valid Autodesk Fusion 360 Python timeline script', async () => {
    const doc = buildParametricDocumentFromSpec({
      type: 'box',
      args: [70, 20, 70],
      position: [0, 0, 0],
    });

    const result = await cadExportManager.executeExportJob('fusion', doc as any, {});
    expect(result.success).toBe(true);
    expect(result.filename).toContain('Fusion360');

    const code = result.content as string;
    expect(code).toContain('import adsk.core, adsk.fusion');
    expect(code).toContain('design.userParameters.add');
    expect(code).toContain('rootComp.sketches.add');
  });

  it('synthesizes valid ISO 10303-21 STEP AP242 B-Rep solid', async () => {
    const doc = buildParametricDocumentFromSpec({
      type: 'box',
      args: [50, 10, 50],
    });

    const result = await cadExportManager.executeExportJob('step', doc as any, {});
    expect(result.success).toBe(true);
    expect(result.filename).toContain('_AP242.step');

    const code = result.content as string;
    expect(code).toContain('ISO-10303-21;');
    expect(code).toContain('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF');
    expect(code).toContain('MANIFOLD_SOLID_BREP');
  });
});
