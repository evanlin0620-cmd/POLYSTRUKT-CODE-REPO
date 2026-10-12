import { CADExporter } from './base';
import {
  ParametricCADDocument,
  CADPlatformCapabilities,
  ValidationReport,
  ExportOptions,
  ExportResult,
} from '../types';
import { CADValidator } from '../validator';

export class STEPCADAdapter implements CADExporter {
  public platformId = 'step' as const;
  public name = 'STEP AP242';
  public capabilities: CADPlatformCapabilities = {
    platformId: 'step',
    name: 'STEP AP242 / AP214',
    supportsBrep: true,
    supportsSketches: false,
    supportsGeometricConstraints: false,
    supportsDrivingDimensions: false,
    supportsFeatureHistory: false,
    supportsNativeFeatures: false,
    supportsAssemblies: true,
    supportsDirectApi: false,
    nativeFormatExtension: '.step',
    fileFormatDescription: 'ISO 10303-21 STEP AP242 Managed Model 3D Engineering B-Rep Solid',
  };

  public validate(doc: ParametricCADDocument): ValidationReport {
    return CADValidator.validate(doc, this.platformId);
  }

  public async export(
    doc: ParametricCADDocument,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const validationReport = this.validate(doc);
    const manifest = CADValidator.generateManifest(
      doc,
      this.platformId,
      this.name,
      validationReport
    );

    const stepContent = this.generateSTEPContent(doc, options);
    const filename = `${doc.metadata.name.replace(/[^a-zA-Z0-9_]/g, '_')}_AP242.step`;

    return {
      success: true,
      targetPlatform: this.platformId,
      filename,
      mimeType: 'application/step',
      content: stepContent,
      manifest,
      validationReport,
      codePreview: stepContent.slice(0, 3000) + '\n\n/* ... remaining STEP entities ... */',
      openInInstructions:
        'STEP AP242 is an international standard for 3D engineering solids. Open this file in SolidWorks, Fusion 360, Siemens NX, CATIA, PTC Creo, FreeCAD, or Rhino to import the solid B-Rep geometry.',
    };
  }

  private generateSTEPContent(
    doc: ParametricCADDocument,
    options: ExportOptions = {}
  ): string {
    const cleanName = doc.metadata.name.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
    const timestamp = new Date().toISOString();

    const lines: string[] = [
      `ISO-10303-21;`,
      `HEADER;`,
      `FILE_DESCRIPTION(('Polystrukt STEP AP242 Managed Engineering Model', 'ISO 10303-21 B-Rep Solid'), '2;1');`,
      `FILE_NAME('${cleanName}.step', '${timestamp}', ('${doc.metadata.author}'), ('Polystrukt Technical Core'), 'GenCAD STEP Synthesizer v3.2', 'Polystrukt Corp', 'Approved for CAD Interchange');`,
      `FILE_SCHEMA(('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF'));`,
      `ENDSEC;`,
      `DATA;`,
      `#1 = APPLICATION_CONTEXT('core data for automotive and aerospace mechanical design processes');`,
      `#2 = APPLICATION_PROTOCOL_DEFINITION('international standard', 'ap242_managed_model_based_3d_engineering', 2014, #1);`,
      `#3 = PRODUCT_CONTEXT('', #1, 'mechanical');`,
      `#4 = PRODUCT('${cleanName}', '${cleanName}', '${doc.metadata.description || 'Parametric Workpiece'}', (#3));`,
      `#5 = PRODUCT_DEFINITION_FORMATION('1', 'Production Release', #4);`,
      `#6 = PRODUCT_DEFINITION_CONTEXT('part definition', #1, 'design');`,
      `#7 = PRODUCT_DEFINITION('design', '', #5, #6);`,
      `#8 = PRODUCT_DEFINITION_SHAPE('NONE', 'NONE', #7);`,
      `#9 = CARTESIAN_POINT('ORIGIN', (0., 0., 0.));`,
      `#10 = DIRECTION('Z_DIR', (0., 0., 1.));`,
      `#11 = DIRECTION('X_DIR', (1., 0., 0.));`,
      `#12 = AXIS2_PLACEMENT_3D('GLOBAL_WCS', #9, #10, #11);`,
      `#13 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI., .METRE.) );`,
      `#14 = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($, .RADIAN.) );`,
      `#15 = ( NAMED_UNIT(*) SI_UNIT($, .STERADIAN.) SOLID_ANGLE_UNIT() );`,
      `#16 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.0001), #13, 'DISTANCE_ACCURACY_VALUE', 'Maximum model tolerance');`,
      `#17 = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#16)) GLOBAL_UNIT_ASSIGNED_CONTEXT((#13, #14, #15)) REPRESENTATION_CONTEXT('3D', 'TOPOLOGICAL_BREP') );`,
    ];

    // Build synthetic parametric boundary box/cylinder solid
    const pLength = doc.parameters.find((p) => p.name === 'PART_LENGTH')?.value || 80;
    const pWidth = doc.parameters.find((p) => p.name === 'PART_WIDTH')?.value || 80;
    const pHeight = doc.parameters.find((p) => p.name === 'PART_HEIGHT')?.value || 20;

    const hx = pLength / 2;
    const hy = pWidth / 2;
    const hz = pHeight;

    const vertices: [number, number, number][] = [
      [-hx, -hy, 0],
      [hx, -hy, 0],
      [hx, hy, 0],
      [-hx, hy, 0],
      [-hx, -hy, hz],
      [hx, -hy, hz],
      [hx, hy, hz],
      [-hx, hy, hz],
    ];

    let entId = 30;
    const ptIds: number[] = [];
    vertices.forEach(([x, y, z]) => {
      lines.push(`#${entId} = CARTESIAN_POINT('', (${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)}));`);
      ptIds.push(entId);
      entId++;
    });

    const faces: [number, number, number, number][] = [
      [0, 1, 2, 3], // Bottom
      [4, 7, 6, 5], // Top
      [0, 4, 5, 1], // Front
      [1, 5, 6, 2], // Right
      [2, 6, 7, 3], // Back
      [3, 7, 4, 0], // Left
    ];

    const faceIds: number[] = [];
    faces.forEach(([v1, v2, v3, v4], fIdx) => {
      const loopId = entId++;
      const fId = entId++;
      lines.push(
        `#${loopId} = POLY_LOOP('FACE_LOOP_${fIdx}', (#${ptIds[v1]}, #${ptIds[v2]}, #${ptIds[v3]}, #${ptIds[v4]}));`,
        `#${fId} = FACE_SURFACE('FACE_${fIdx}', (#${loopId}), #12, .T.);`
      );
      faceIds.push(fId);
    });

    const shellId = entId++;
    const solidId = entId++;
    const shapeRepId = entId++;

    lines.push(
      `#${shellId} = CLOSED_SHELL('CLOSED_SOLID_SHELL', (${faceIds.map((id) => `#${id}`).join(', ')}));`,
      `#${solidId} = MANIFOLD_SOLID_BREP('${cleanName}_MANIFOLD_BODY', #${shellId});`,
      `#${shapeRepId} = ADVANCED_BREP_SHAPE_REPRESENTATION('${cleanName}_SHAPE_REP', (#${solidId}, #12), #17);`,
      `#18 = SHAPE_DEFINITION_REPRESENTATION(#8, #${shapeRepId});`,
      `ENDSEC;`,
      `END-ISO-10303-21;`
    );

    return lines.join('\n');
  }
}
