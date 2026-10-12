import {
  CADGeometricConstraintType,
  CADDimensionalConstraintType,
  CADPlatformId,
  CADSketchConstraint,
  CADSketchDimension,
} from './types';

export interface TranslatedConstraintResult {
  isSupported: boolean;
  platformConstraintName: string;
  syntaxSnippet: string;
  fallbackStrategy?: 'fix_coordinates' | 'driving_dimension' | 'unsupported_warning';
  warningMessage?: string;
}

/**
 * Professional CAD Constraint Translation Engine.
 * Translates neutral parametric constraints to target CAD platform APIs without silent degradation.
 */
export class CADConstraintTranslator {
  /**
   * Translates a geometric 2D sketch constraint to the target platform.
   */
  public static translateGeometricConstraint(
    constraint: CADSketchConstraint,
    platform: CADPlatformId
  ): TranslatedConstraintResult {
    const { type, entityIds } = constraint;

    switch (platform) {
      case 'onshape':
        return this.translateToOnshape(type, entityIds);
      case 'solidworks':
        return this.translateToSolidWorks(type, entityIds);
      case 'fusion':
        return this.translateToFusion(type, entityIds);
      default:
        return {
          isSupported: false,
          platformConstraintName: type,
          syntaxSnippet: `// [Interchange: ${type} constraint on entities ${entityIds.join(', ')}]`,
          fallbackStrategy: 'fix_coordinates',
          warningMessage: `${platform.toUpperCase()} standard export does not support native parametric constraint solver tree. Geometry preserved at evaluated coordinates.`,
        };
    }
  }

  /**
   * Onshape FeatureScript Constraint Mapping
   */
  private static translateToOnshape(
    type: CADGeometricConstraintType,
    entities: string[]
  ): TranslatedConstraintResult {
    switch (type) {
      case 'coincident':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "coincident")',
          syntaxSnippet: `skConstraint(sketch, "coincident_${entities.join('_')}", { "constraintType" : ConstraintType.COINCIDENT, "localFirst" : "${entities[0]}", "localSecond" : "${entities[1]}" });`,
        };
      case 'horizontal':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "horizontal")',
          syntaxSnippet: `skConstraint(sketch, "horiz_${entities[0]}", { "constraintType" : ConstraintType.HORIZONTAL, "localFirst" : "${entities[0]}" });`,
        };
      case 'vertical':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "vertical")',
          syntaxSnippet: `skConstraint(sketch, "vert_${entities[0]}", { "constraintType" : ConstraintType.VERTICAL, "localFirst" : "${entities[0]}" });`,
        };
      case 'parallel':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "parallel")',
          syntaxSnippet: `skConstraint(sketch, "parallel_${entities.join('_')}", { "constraintType" : ConstraintType.PARALLEL, "localFirst" : "${entities[0]}", "localSecond" : "${entities[1]}" });`,
        };
      case 'perpendicular':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "perpendicular")',
          syntaxSnippet: `skConstraint(sketch, "perp_${entities.join('_')}", { "constraintType" : ConstraintType.PERPENDICULAR, "localFirst" : "${entities[0]}", "localSecond" : "${entities[1]}" });`,
        };
      case 'tangent':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "tangent")',
          syntaxSnippet: `skConstraint(sketch, "tangent_${entities.join('_')}", { "constraintType" : ConstraintType.TANGENT, "localFirst" : "${entities[0]}", "localSecond" : "${entities[1]}" });`,
        };
      case 'concentric':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "concentric")',
          syntaxSnippet: `skConstraint(sketch, "concentric_${entities.join('_')}", { "constraintType" : ConstraintType.CONCENTRIC, "localFirst" : "${entities[0]}", "localSecond" : "${entities[1]}" });`,
        };
      case 'equal':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "equal")',
          syntaxSnippet: `skConstraint(sketch, "equal_${entities.join('_')}", { "constraintType" : ConstraintType.EQUAL, "localFirst" : "${entities[0]}", "localSecond" : "${entities[1]}" });`,
        };
      case 'symmetric':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "symmetric")',
          syntaxSnippet: `skConstraint(sketch, "symm_${entities.join('_')}", { "constraintType" : ConstraintType.SYMMETRIC, "localFirst" : "${entities[0]}", "localSecond" : "${entities[1]}", "localThird" : "${entities[2] || 'centerline'}" });`,
        };
      case 'fix':
        return {
          isSupported: true,
          platformConstraintName: 'skConstraint(sk, "fix")',
          syntaxSnippet: `skConstraint(sketch, "fix_${entities[0]}", { "constraintType" : ConstraintType.FIX, "localFirst" : "${entities[0]}" });`,
        };
      default:
        return {
          isSupported: false,
          platformConstraintName: type,
          syntaxSnippet: `// Unsupported Onshape constraint: ${type}`,
          fallbackStrategy: 'fix_coordinates',
          warningMessage: `Onshape does not natively support constraint type "${type}". Geometry maintained at fixed coordinates.`,
        };
    }
  }

  /**
   * SolidWorks COM/VBA Macro Constraint Mapping (swConstraintType_e)
   */
  private static translateToSolidWorks(
    type: CADGeometricConstraintType,
    entities: string[]
  ): TranslatedConstraintResult {
    switch (type) {
      case 'coincident':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_COINCIDENT (1)',
          syntaxSnippet: `Part.SketchAddConstraints "sgCOINCIDENT"`,
        };
      case 'horizontal':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_HORIZONTAL (2)',
          syntaxSnippet: `Part.SketchAddConstraints "sgHORIZONTAL2D"`,
        };
      case 'vertical':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_VERTICAL (3)',
          syntaxSnippet: `Part.SketchAddConstraints "sgVERTICAL2D"`,
        };
      case 'parallel':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_PARALLEL (4)',
          syntaxSnippet: `Part.SketchAddConstraints "sgPARALLEL"`,
        };
      case 'perpendicular':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_PERPENDICULAR (5)',
          syntaxSnippet: `Part.SketchAddConstraints "sgPERPENDICULAR"`,
        };
      case 'tangent':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_TANGENT (6)',
          syntaxSnippet: `Part.SketchAddConstraints "sgTANGENT"`,
        };
      case 'concentric':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_CONCENTRIC (7)',
          syntaxSnippet: `Part.SketchAddConstraints "sgCONCENTRIC"`,
        };
      case 'equal':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_SAMELENGTH / RADIUS (10)',
          syntaxSnippet: `Part.SketchAddConstraints "sgSAMELENGTH"`,
        };
      case 'symmetric':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_SYMMETRIC (15)',
          syntaxSnippet: `Part.SketchAddConstraints "sgSYMMETRIC"`,
        };
      case 'fix':
        return {
          isSupported: true,
          platformConstraintName: 'swConstraintType_FIXED (16)',
          syntaxSnippet: `Part.SketchAddConstraints "sgFIXED"`,
        };
      default:
        return {
          isSupported: false,
          platformConstraintName: type,
          syntaxSnippet: `' Unsupported SolidWorks constraint: ${type}`,
          fallbackStrategy: 'fix_coordinates',
          warningMessage: `SolidWorks constraint mapping for "${type}" requires fallback to explicit dimensioning.`,
        };
    }
  }

  /**
   * Autodesk Fusion 360 Python API (adsk.fusion.GeometricConstraints)
   */
  private static translateToFusion(
    type: CADGeometricConstraintType,
    entities: string[]
  ): TranslatedConstraintResult {
    switch (type) {
      case 'coincident':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addCoincident',
          syntaxSnippet: `sketch.geometricConstraints.addCoincident(${entities[0]}, ${entities[1]})`,
        };
      case 'horizontal':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addHorizontal',
          syntaxSnippet: `sketch.geometricConstraints.addHorizontal(${entities[0]})`,
        };
      case 'vertical':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addVertical',
          syntaxSnippet: `sketch.geometricConstraints.addVertical(${entities[0]})`,
        };
      case 'parallel':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addParallel',
          syntaxSnippet: `sketch.geometricConstraints.addParallel(${entities[0]}, ${entities[1]})`,
        };
      case 'perpendicular':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addPerpendicular',
          syntaxSnippet: `sketch.geometricConstraints.addPerpendicular(${entities[0]}, ${entities[1]})`,
        };
      case 'tangent':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addTangent',
          syntaxSnippet: `sketch.geometricConstraints.addTangent(${entities[0]}, ${entities[1]})`,
        };
      case 'concentric':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addConcentric',
          syntaxSnippet: `sketch.geometricConstraints.addConcentric(${entities[0]}, ${entities[1]})`,
        };
      case 'equal':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addEqual',
          syntaxSnippet: `sketch.geometricConstraints.addEqual(${entities[0]}, ${entities[1]})`,
        };
      case 'symmetric':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addSymmetry',
          syntaxSnippet: `sketch.geometricConstraints.addSymmetry(${entities[0]}, ${entities[1]}, ${entities[2] || 'centerLine'})`,
        };
      case 'fix':
        return {
          isSupported: true,
          platformConstraintName: 'sketch.geometricConstraints.addFix',
          syntaxSnippet: `sketch.geometricConstraints.addFix(${entities[0]})`,
        };
      default:
        return {
          isSupported: false,
          platformConstraintName: type,
          syntaxSnippet: `# Unsupported Fusion 360 constraint: ${type}`,
          fallbackStrategy: 'fix_coordinates',
          warningMessage: `Fusion 360 geometric constraint "${type}" unsupported; coordinates baked.`,
        };
    }
  }

  /**
   * Translates a dimensional constraint to target platform expression.
   */
  public static translateDimension(
    dimension: CADSketchDimension,
    platform: CADPlatformId
  ): { platformCode: string; drivingName: string; expression: string } {
    const drivingName = dimension.name || 'dim_' + dimension.id.slice(0, 6);
    const expr = dimension.expression || `${dimension.value}`;

    switch (platform) {
      case 'onshape':
        return {
          platformCode: `// Onshape driving dimension\n#${drivingName} = ${expr} * millimeter;`,
          drivingName,
          expression: `${expr} * millimeter`,
        };
      case 'solidworks':
        return {
          platformCode: `Part.AddEquation -1, """${drivingName}"" = ${dimension.value}mm"`,
          drivingName,
          expression: `${dimension.value}mm`,
        };
      case 'fusion':
        return {
          platformCode: `design.userParameters.add("${drivingName}", adsk.core.ValueInput.createByString("${expr} mm"), "mm", "${dimension.name}")`,
          drivingName,
          expression: `${expr} mm`,
        };
      default:
        return {
          platformCode: `// Dimension ${drivingName} = ${dimension.value} ${dimension.unit}`,
          drivingName,
          expression: `${dimension.value}`,
        };
    }
  }
}
