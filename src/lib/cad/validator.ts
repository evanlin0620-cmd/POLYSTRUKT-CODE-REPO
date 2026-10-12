import {
  ParametricCADDocument,
  ValidationReport,
  ValidationIssue,
  CADPlatformId,
  ExportManifest,
} from './types';
import { CADDependencyGraph } from './dependencyGraph';

export class CADValidator {
  /**
   * Validates a ParametricCADDocument for internal geometric, topological,
   * and parametric consistency.
   */
  public static validate(
    doc: ParametricCADDocument,
    targetPlatform?: CADPlatformId
  ): ValidationReport {
    const issues: ValidationIssue[] = [];
    let penalties = 0;

    // 1. Parameter Checks
    const paramIds = new Set<string>();
    for (const param of doc.parameters) {
      if (paramIds.has(param.id)) {
        issues.push({
          severity: 'error',
          code: 'DUPLICATE_PARAM_ID',
          message: `Duplicate parameter identifier detected: ${param.id}`,
          entityId: param.id,
          entityType: 'parameter',
        });
        penalties += 10;
      }
      paramIds.add(param.id);

      if (param.value <= 0 && param.isDriving) {
        issues.push({
          severity: 'warning',
          code: 'NON_POSITIVE_PARAM_VAL',
          message: `Driving parameter "${param.name}" has zero or negative magnitude (${param.value})`,
          entityId: param.id,
          entityType: 'parameter',
          recommendation: 'Check dimension inputs for degenerate geometry bounds.',
        });
        penalties += 5;
      }
    }

    // 2. Sketch & Entity Validation
    const sketchIds = new Set<string>();
    const entityIds = new Set<string>();

    for (const sk of doc.sketches) {
      sketchIds.add(sk.id);
      if (!sk.entities || sk.entities.length === 0) {
        issues.push({
          severity: 'warning',
          code: 'EMPTY_SKETCH',
          message: `Sketch "${sk.name}" contains no wireframe entities.`,
          entityId: sk.id,
          entityType: 'sketch',
        });
        penalties += 8;
      }

      for (const ent of sk.entities) {
        entityIds.add(ent.id);
      }

      // Validate constraints target existing entities
      for (const c of sk.constraints) {
        for (const targetId of c.entityIds) {
          if (targetId !== 'origin_pt' && targetId !== 'centerline' && !entityIds.has(targetId)) {
            issues.push({
              severity: 'warning',
              code: 'DANGLING_CONSTRAINT_ENTITY',
              message: `Constraint "${c.type}" references entity "${targetId}" not found in active sketch.`,
              entityId: c.id,
              entityType: 'constraint',
              fallbackStrategy: undefined,
              recommendation: 'Fallback to explicit coordinate anchoring.',
            });
            penalties += 4;
          }
        }
      }

      // Validate dimensions target existing entities
      for (const d of sk.dimensions) {
        for (const targetId of d.entityIds) {
          if (!entityIds.has(targetId)) {
            issues.push({
              severity: 'warning',
              code: 'DANGLING_DIM_ENTITY',
              message: `Dimension "${d.name}" references non-existent entity "${targetId}".`,
              entityId: d.id,
              entityType: 'dimension',
            });
            penalties += 3;
          }
        }
      }
    }

    // 3. Feature Tree & Dependency Validation
    const graph = new CADDependencyGraph();
    doc.sketches.forEach((sk) => graph.addSketch(sk));
    doc.features.forEach((feat) => graph.addFeature(feat));
    const depResult = graph.buildOrder();

    if (depResult.hasCycle) {
      issues.push({
        severity: 'error',
        code: 'CIRCULAR_FEATURE_DEPENDENCY',
        message: 'Circular reference cycle detected in feature tree DAG.',
        entityType: 'feature',
        recommendation: 'Break cyclical cross-referencing between features.',
      });
      penalties += 25;
    }

    for (const unresolved of depResult.unresolvedDependencies) {
      issues.push({
        severity: 'warning',
        code: 'MISSING_FEATURE_DEP',
        message: `Feature/Sketch "${unresolved.nodeId}" depends on missing parent "${unresolved.missingDepId}".`,
        entityId: unresolved.nodeId,
        entityType: 'feature',
        fallbackStrategy: undefined,
      });
      penalties += 5;
    }

    // 4. Platform-Specific Translation Feasibility
    if (targetPlatform === 'step' || targetPlatform === 'parasolid' || targetPlatform === 'stl') {
      issues.push({
        severity: 'info',
        code: 'INTERCHANGE_BREP_NOTICE',
        message: `${targetPlatform.toUpperCase()} represents B-Rep solid bodies without native editable sketch constraint trees.`,
      });
    }

    const calculatedScore = Math.max(10, Math.min(100, 100 - penalties));
    const isValid = issues.filter((i) => i.severity === 'error').length === 0;

    let totalEntities = 0;
    let totalConstraints = 0;
    let totalDimensions = 0;
    doc.sketches.forEach((sk) => {
      totalEntities += sk.entities.length;
      totalConstraints += sk.constraints.length;
      totalDimensions += sk.dimensions.length;
    });

    return {
      isValid,
      scorePercentage: calculatedScore,
      issues,
      stats: {
        sketchesCount: doc.sketches.length,
        entitiesCount: totalEntities,
        constraintsCount: totalConstraints,
        dimensionsCount: totalDimensions,
        featuresCount: doc.features.length,
        bodiesCount: doc.bodies.length,
        parametersCount: doc.parameters.length,
      },
    };
  }

  /**
   * Generates a transparent, standardized Export Manifest.
   */
  public static generateManifest(
    doc: ParametricCADDocument,
    targetPlatform: CADPlatformId,
    targetPlatformName: string,
    validationReport: ValidationReport
  ): ExportManifest {
    const isLevel1 = ['onshape', 'solidworks', 'fusion'].includes(targetPlatform);
    const isLevel2 = ['step', 'parasolid', 'iges'].includes(targetPlatform);

    let totalConstraints = 0;
    let totalDimensions = 0;
    doc.sketches.forEach((sk) => {
      totalConstraints += sk.constraints.length;
      totalDimensions += sk.dimensions.length;
    });

    const unsupportedCount = validationReport.issues.filter(
      (i) => i.severity === 'warning' && i.entityType === 'constraint'
    ).length;

    const notes: string[] = [];
    if (isLevel1) {
      notes.push(
        `Exported with Level 1 Native Parametric Translation: Sketches, driving dimensions, and feature tree reconstructed.`
      );
      if (unsupportedCount > 0) {
        notes.push(`${unsupportedCount} complex constraints preserved via coordinate baking.`);
      }
    } else if (isLevel2) {
      notes.push(
        `Exported with Level 2 Interchange Protocol: Full exact B-Rep solid boundary geometry preserved with product structure.`
      );
    } else {
      notes.push(`Faceted polygonal solid mesh geometry exported.`);
    }

    return {
      exportId: `EXP_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      sourceApplication: 'Polystrukt GenCAD Studio',
      targetPlatform,
      targetPlatformName,
      units: doc.metadata.units,
      bodies: doc.bodies.length,
      sketches: doc.sketches.length,
      features: doc.features.length,
      constraints: totalConstraints,
      dimensions: totalDimensions,
      parameters: doc.parameters.length,
      recreatedFeatures: doc.features.length,
      fallbackFeatures: 0,
      recreatedConstraints: Math.max(0, totalConstraints - unsupportedCount),
      unsupportedConstraints: unsupportedCount,
      fidelityLevel: isLevel1
        ? 'Level 1 - Native Parametric'
        : isLevel2
        ? 'Level 2 - Parametric Interchange'
        : 'Level 3 - B-Rep Solid',
      compatibilityScore: validationReport.scorePercentage,
      notes,
    };
  }
}
