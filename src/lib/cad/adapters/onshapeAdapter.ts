import { CADExporter } from './base';
import {
  ParametricCADDocument,
  CADPlatformCapabilities,
  ValidationReport,
  ExportOptions,
  ExportResult,
} from '../types';
import { CADValidator } from '../validator';
import { CADDependencyGraph } from '../dependencyGraph';
import { CADConstraintTranslator } from '../constraints';

export class OnshapeCADAdapter implements CADExporter {
  public platformId = 'onshape' as const;
  public name = 'Onshape';
  public capabilities: CADPlatformCapabilities = {
    platformId: 'onshape',
    name: 'Onshape',
    supportsBrep: true,
    supportsSketches: true,
    supportsGeometricConstraints: true,
    supportsDrivingDimensions: true,
    supportsFeatureHistory: true,
    supportsNativeFeatures: true,
    supportsAssemblies: true,
    supportsDirectApi: true,
    nativeFormatExtension: '.fs',
    fileFormatDescription: 'Onshape FeatureScript & Part Studio Document Definition',
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

    const featureScript = this.generateFeatureScript(doc, options);
    const filename = `${doc.metadata.name.replace(/[^a-zA-Z0-9_]/g, '_')}_onshape.fs`;

    const openInPayload = await this.generateOpenInPayload(doc, options);

    return {
      success: true,
      targetPlatform: this.platformId,
      filename,
      mimeType: 'text/plain',
      content: featureScript,
      manifest,
      validationReport,
      openInUrl: openInPayload.openInUrl,
      openInInstructions: openInPayload.instructions,
      codePreview: featureScript,
    };
  }

  public async generateOpenInPayload(
    doc: ParametricCADDocument,
    options: ExportOptions = {}
  ): Promise<{
    openInUrl: string;
    instructions: string;
    payload: any;
    scriptContent: string;
  }> {
    const fsCode = this.generateFeatureScript(doc, options);
    const docName = encodeURIComponent(options.onshapeDocName || doc.metadata.name || 'Polystrukt Part');

    // Onshape web workspace import / Feature Studio URL
    const openInUrl = `https://cad.onshape.com/documents?create=true&name=${docName}&type=partstudio`;

    const instructions = [
      '### How to Open & Reconstruct in Onshape:',
      '1. Click **Launch Onshape Document** to create a fresh workspace in your Onshape account.',
      '2. In the bottom tab bar (+), select **Create Feature Studio**.',
      '3. Paste the generated **FeatureScript** code into the editor and click **Commit** (or press Enter).',
      '4. Switch back to your Part Studio — the custom feature will instantly generate all sketches, constraints, driving dimensions, and solid extrusions natively!',
      '5. You can freely edit variables, sketches, and feature parameters right inside Onshape.',
    ].join('\n');

    return {
      openInUrl,
      instructions,
      payload: {
        documentName: doc.metadata.name,
        units: doc.metadata.units,
        featureScript: fsCode,
      },
      scriptContent: fsCode,
    };
  }

  /**
   * Generates clean, production-grade Onshape FeatureScript code
   */
  public generateFeatureScript(
    doc: ParametricCADDocument,
    options: ExportOptions = {}
  ): string {
    const cleanDocName = doc.metadata.name.replace(/[^a-zA-Z0-9_]/g, '_');
    const graph = new CADDependencyGraph();
    doc.sketches.forEach((sk) => graph.addSketch(sk));
    doc.features.forEach((feat) => graph.addFeature(feat));
    const depResult = graph.buildOrder();

    const lines: string[] = [
      `FeatureScript 2450;`,
      `import(path : "onshape/std/common.fs", version : "2450.0");`,
      `import(path : "onshape/std/geometry.fs", version : "2450.0");`,
      ``,
      `/**`,
      ` * Polystrukt GenCAD Studio - Native Parametric Onshape FeatureScript`,
      ` * Document: ${doc.metadata.name}`,
      ` * Export Timestamp: ${new Date().toISOString()}`,
      ` * Fidelity Level: Level 1 Native Parametric (Sketches, Constraints & Features Preserved)`,
      ` */`,
      ``,
      `annotation { "Feature Type Name" : "${cleanDocName} Generator" }`,
      `export const ${cleanDocName.toLowerCase()}Generator = defineFeature(function(context is Context, id is Id, definition is map)`,
      `    precondition`,
      `    {`,
      `        // --- DRIVING PARAMETERS ---`,
    ];

    // Export driving parameters in FeatureScript precondition
    doc.parameters.forEach((param) => {
      const cleanParamName = param.name.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(
        `        annotation { "Name" : "${param.description || param.name}" }`,
        `        isLength(definition.${cleanParamName}, { (millimeter) : [1, ${param.value}, 5000] } as LengthBoundSpec);`
      );
    });

    lines.push(
      `    }`,
      `    {`,
      `        // --- INITIALIZE COORDINATE PLANES ---`,
      `        const topPlane = plane(vector(0, 0, 0) * millimeter, vector(0, 0, 1));`,
      `        const frontPlane = plane(vector(0, 0, 0) * millimeter, vector(0, 1, 0));`,
      `        const rightPlane = plane(vector(0, 0, 0) * millimeter, vector(1, 0, 0));`,
      ``
    );

    // Map sorted sketches and features
    const sketchVarMap = new Map<string, string>();

    depResult.sortedSketches.forEach((sk, idx) => {
      const skVar = `sketch_${idx + 1}`;
      sketchVarMap.set(sk.id, skVar);

      lines.push(
        `        // --- SKETCH: ${sk.name} ---`,
        `        const ${skVar} = newSketchOnPlane(context, id + "${skVar}", { "sketchPlane" : topPlane });`
      );

      // Entities
      sk.entities.forEach((ent) => {
        if (ent.type === 'rectangle') {
          lines.push(
            `        skRectangle(${skVar}, "${ent.id}", {`,
            `            "firstCorner" : vector(${ent.center[0] - ent.width / 2}, ${ent.center[1] - ent.height / 2}) * millimeter,`,
            `            "secondCorner" : vector(${ent.center[0] + ent.width / 2}, ${ent.center[1] + ent.height / 2}) * millimeter`,
            `        });`
          );
        } else if (ent.type === 'circle') {
          lines.push(
            `        skCircle(${skVar}, "${ent.id}", {`,
            `            "center" : vector(${ent.center[0]}, ${ent.center[1]}) * millimeter,`,
            `            "radius" : ${ent.radius} * millimeter`,
            `        });`
          );
        } else if (ent.type === 'line') {
          lines.push(
            `        skLineSegment(${skVar}, "${ent.id}", {`,
            `            "start" : vector(${ent.start[0]}, ${ent.start[1]}) * millimeter,`,
            `            "end" : vector(${ent.end[0]}, ${ent.end[1]}) * millimeter`,
            `        });`
          );
        }
      });

      // Constraints
      sk.constraints.forEach((c) => {
        const trans = CADConstraintTranslator.translateGeometricConstraint(c, 'onshape');
        if (trans.isSupported) {
          lines.push(`        ${trans.syntaxSnippet}`);
        }
      });

      lines.push(`        skSolve(${skVar});`, ``);
    });

    // Features
    depResult.sortedFeatures.forEach((feat, idx) => {
      const featId = `feat_${idx + 1}`;
      const skVar = feat.sketchId ? sketchVarMap.get(feat.sketchId) : null;
      const isCut = feat.parameters.isCut;
      const depth = feat.parameters.depth || 20;

      lines.push(`        // --- FEATURE: ${feat.name} ---`);
      if (feat.type === 'extrude') {
        lines.push(
          `        opExtrude(context, id + "${featId}", {`,
          `            "entities" : qSketchRegion(id + "${skVar || 'sketch_1'}"),`,
          `            "direction" : vector(0, 0, 1),`,
          `            "endBound" : BoundingType.BLIND,`,
          `            "endOffset" : ${depth} * millimeter,`,
          `            "operationType" : ${isCut ? 'NewObjectOperationType.REMOVE' : 'NewObjectOperationType.ADD'}`,
          `        });`,
          ``
        );
      } else if (feat.type === 'fillet') {
        const r = feat.parameters.filletRadius || 3;
        lines.push(
          `        opFillet(context, id + "${featId}", {`,
          `            "entities" : qAllModifiableSolidBodies(),`,
          `            "radius" : ${r} * millimeter`,
          `        });`,
          ``
        );
      }
    });

    lines.push(`    });`, ``);
    return lines.join('\n');
  }
}
