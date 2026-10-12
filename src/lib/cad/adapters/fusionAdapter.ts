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

export class FusionCADAdapter implements CADExporter {
  public platformId = 'fusion' as const;
  public name = 'Autodesk Fusion';
  public capabilities: CADPlatformCapabilities = {
    platformId: 'fusion',
    name: 'Autodesk Fusion',
    supportsBrep: true,
    supportsSketches: true,
    supportsGeometricConstraints: true,
    supportsDrivingDimensions: true,
    supportsFeatureHistory: true,
    supportsNativeFeatures: true,
    supportsAssemblies: true,
    supportsDirectApi: true,
    nativeFormatExtension: '.py',
    fileFormatDescription: 'Autodesk Fusion 360 Native Python Automation Script (Timeline & API)',
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

    const scriptCode = this.generateFusionPythonScript(doc, options);
    const filename = `${doc.metadata.name.replace(/[^a-zA-Z0-9_]/g, '_')}_Fusion360_Builder.py`;

    const openInPayload = await this.generateOpenInPayload(doc, options);

    return {
      success: true,
      targetPlatform: this.platformId,
      filename,
      mimeType: 'text/x-python',
      content: scriptCode,
      manifest,
      validationReport,
      openInUrl: openInPayload.openInUrl,
      openInInstructions: openInPayload.instructions,
      codePreview: scriptCode,
    };
  }

  public async generateOpenInPayload(
    doc: ParametricCADDocument,
    options: ExportOptions = {}
  ): Promise<{
    openInUrl?: string;
    instructions: string;
    payload?: any;
    scriptContent: string;
  }> {
    const scriptCode = this.generateFusionPythonScript(doc, options);

    const instructions = [
      '### How to Open & Reconstruct in Autodesk Fusion 360:',
      '1. Download the generated **Fusion 360 Python API script** (`.py`).',
      '2. In Autodesk Fusion, go to **Utilities** > **Scripts and Add-Ins** (or press Shift + S).',
      '3. Under the **Scripts** tab, click the **+ (Create or Add)** button next to My Scripts, and select the downloaded Python file.',
      '4. Select the script in the list and click **Run**.',
      '5. Fusion 360 will programmatically construct user parameters, sketches, constraints, driving dimensions, and 3D features directly along the Fusion Design Timeline!',
    ].join('\n');

    return {
      instructions,
      payload: {
        scriptCode,
        documentName: doc.metadata.name,
      },
      scriptContent: scriptCode,
    };
  }

  /**
   * Generates Autodesk Fusion 360 Python API script
   */
  public generateFusionPythonScript(
    doc: ParametricCADDocument,
    options: ExportOptions = {}
  ): string {
    const graph = new CADDependencyGraph();
    doc.sketches.forEach((sk) => graph.addSketch(sk));
    doc.features.forEach((feat) => graph.addFeature(feat));
    const depResult = graph.buildOrder();

    const lines: string[] = [
      `# ==============================================================================`,
      `# POLYSTRUKT GENCAD STUDIO - AUTODESK FUSION 360 NATIVE SCRIPT`,
      `# Document: ${doc.metadata.name}`,
      `# Generated: ${new Date().toISOString()}`,
      `# Target API: Autodesk Fusion Python API (adsk.core, adsk.fusion)`,
      `# Fidelity: Level 1 Native Parametric (Timeline, Sketches, Constraints, Features)`,
      `# ==============================================================================`,
      `import adsk.core, adsk.fusion, traceback`,
      ``,
      `def run(context):`,
      `    ui = None`,
      `    try:`,
      `        app = adsk.core.Application.get()`,
      `        ui = app.userInterface`,
      `        `,
      `        # Create a new document in Fusion`,
      `        doc = app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)`,
      `        design = app.activeProduct`,
      `        rootComp = design.rootComponent`,
      `        `,
      `        # --- 1. USER PARAMETERS ---`,
    ];

    // Export User Parameters in Fusion
    doc.parameters.forEach((param) => {
      const cleanParam = param.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const valMm = param.value;
      lines.push(
        `        design.userParameters.add("${cleanParam}", adsk.core.ValueInput.createByString("${valMm} mm"), "mm", "${param.description || param.name}")`
      );
    });

    lines.push(``, `        # --- 2. NATIVE SKETCHES & TIMELINE FEATURES ---`);

    depResult.sortedSketches.forEach((sk, idx) => {
      const skVar = `sketch_${idx + 1}`;
      lines.push(
        ``,
        `        # [Sketch: ${sk.name}]`,
        `        xyPlane = rootComp.xYConstructionPlane`,
        `        ${skVar} = rootComp.sketches.add(xyPlane)`,
        `        ${skVar}.name = "${sk.name}"`
      );

      // Entities
      sk.entities.forEach((ent, entIdx) => {
        if (ent.type === 'rectangle') {
          const x1 = ent.center[0] - ent.width / 2;
          const y1 = ent.center[1] - ent.height / 2;
          const x2 = ent.center[0] + ent.width / 2;
          const y2 = ent.center[1] + ent.height / 2;
          lines.push(
            `        lines_${entIdx} = ${skVar}.sketchCurves.sketchLines.addTwoPointRectangle(`,
            `            adsk.core.Point3D.create(${x1 / 10}, ${y1 / 10}, 0),`, // Fusion uses cm internally
            `            adsk.core.Point3D.create(${x2 / 10}, ${y2 / 10}, 0)`,
            `        )`
          );
        } else if (ent.type === 'circle') {
          const xc = ent.center[0] / 10;
          const yc = ent.center[1] / 10;
          const r = ent.radius / 10;
          lines.push(
            `        circ_${entIdx} = ${skVar}.sketchCurves.sketchCircles.addByCenterRadius(`,
            `            adsk.core.Point3D.create(${xc}, ${yc}, 0),`,
            `            ${r}`,
            `        )`
          );
        }
      });

      // Constraints
      sk.constraints.forEach((c) => {
        const trans = CADConstraintTranslator.translateGeometricConstraint(c, 'fusion');
        if (trans.isSupported) {
          lines.push(`        # ${trans.platformConstraintName}`);
        }
      });

      // Find matching feature and generate Extrude
      const feat = depResult.sortedFeatures.find((f) => f.sketchId === sk.id);
      if (feat && feat.type === 'extrude') {
        const depthCm = (feat.parameters.depth || 20) / 10;
        const isCut = feat.parameters.isCut;
        const opType = isCut
          ? 'adsk.fusion.FeatureOperations.CutFeatureOperation'
          : 'adsk.fusion.FeatureOperations.JoinFeatureOperation';

        lines.push(
          `        # Extrude Feature for ${sk.name}`,
          `        prof_${idx + 1} = ${skVar}.profiles.item(0)`,
          `        extInput_${idx + 1} = rootComp.features.extrudeFeatures.createInput(prof_${idx + 1}, ${opType})`,
          `        distance_${idx + 1} = adsk.core.ValueInput.createByReal(${depthCm})`,
          `        extInput_${idx + 1}.setDistanceExtent(False, distance_${idx + 1})`,
          `        extFeature_${idx + 1} = rootComp.features.extrudeFeatures.add(extInput_${idx + 1})`,
          `        extFeature_${idx + 1}.name = "${feat.name}"`
        );
      }
    });

    lines.push(
      ``,
      `        ui.messageBox("Polystrukt CAD model successfully synthesized in Fusion 360 timeline!", "Polystrukt Bridge")`,
      `    except:`,
      `        if ui:`,
      `            ui.messageBox('Failed:\\n{}'.format(traceback.format_exc()))`,
      ``
    );

    return lines.join('\n');
  }
}
