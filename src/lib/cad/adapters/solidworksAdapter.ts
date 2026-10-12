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

export class SolidWorksCADAdapter implements CADExporter {
  public platformId = 'solidworks' as const;
  public name = 'SolidWorks';
  public capabilities: CADPlatformCapabilities = {
    platformId: 'solidworks',
    name: 'SolidWorks',
    supportsBrep: true,
    supportsSketches: true,
    supportsGeometricConstraints: true,
    supportsDrivingDimensions: true,
    supportsFeatureHistory: true,
    supportsNativeFeatures: true,
    supportsAssemblies: true,
    supportsDirectApi: true,
    nativeFormatExtension: '.swp',
    fileFormatDescription: 'SolidWorks Native Parametric Macro & Equation Model (VBA / COM API)',
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

    const macroCode = this.generateSolidWorksVBA(doc, options);
    const filename = `${doc.metadata.name.replace(/[^a-zA-Z0-9_]/g, '_')}_SolidWorksMacro.swp.vbs`;

    const openInPayload = await this.generateOpenInPayload(doc, options);

    return {
      success: true,
      targetPlatform: this.platformId,
      filename,
      mimeType: 'text/vbscript',
      content: macroCode,
      manifest,
      validationReport,
      openInUrl: openInPayload.openInUrl,
      openInInstructions: openInPayload.instructions,
      codePreview: macroCode,
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
    const macroCode = this.generateSolidWorksVBA(doc, options);

    const instructions = [
      '### How to Open & Reconstruct in SolidWorks:',
      '1. Download the generated **SolidWorks Parametric Macro** file.',
      '2. In SolidWorks, open a new part or existing assembly.',
      '3. From the top menu bar, select **Tools** > **Macro** > **Run...** (or press Play in the Macro Toolbar).',
      '4. Select the downloaded `.vbs` / `.swp` file and click **Open**.',
      '5. SolidWorks will programmatically construct all sketches, geometric relations, driving dimensions, and boss/cut extrusions natively in your FeatureManager Design Tree.',
    ].join('\n');

    return {
      instructions,
      payload: {
        macroCode,
        documentName: doc.metadata.name,
      },
      scriptContent: macroCode,
    };
  }

  /**
   * Generates SolidWorks COM API automation macro (VBA/VBScript compatible)
   */
  public generateSolidWorksVBA(
    doc: ParametricCADDocument,
    options: ExportOptions = {}
  ): string {
    const graph = new CADDependencyGraph();
    doc.sketches.forEach((sk) => graph.addSketch(sk));
    doc.features.forEach((feat) => graph.addFeature(feat));
    const depResult = graph.buildOrder();

    const lines: string[] = [
      `' ==============================================================================`,
      `' POLYSTRUKT GENCAD STUDIO - SOLIDWORKS NATIVE PARAMETRIC MACRO`,
      `' Document: ${doc.metadata.name}`,
      `' Generated: ${new Date().toISOString()}`,
      `' Target API: SolidWorks SldWorks.Application (COM Automation)`,
      `' Fidelity: Level 1 Native Parametric (Sketches, Relations, Dimensions, Features)`,
      `' ==============================================================================`,
      ``,
      `Option Explicit`,
      ``,
      `Dim swApp As Object`,
      `Dim Part As Object`,
      `Dim boolstatus As Boolean`,
      `Dim longstatus As Long, longwarnings As Long`,
      `Dim myFeature As Object`,
      `Dim myDimension As Object`,
      ``,
      `Sub main()`,
      `    Set swApp = Application.SldWorks`,
      `    `,
      `    ' Create new Part document`,
      `    Set Part = swApp.NewDocument("Part.prtdot", 0, 0, 0)`,
      `    If Part Is Nothing Then`,
      `        Set Part = swApp.ActiveDoc`,
      `    End If`,
      `    `,
      `    If Part Is Nothing Then`,
      `        MsgBox "Unable to create or access active SolidWorks Part document.", vbCritical, "Polystrukt Bridge"`,
      `        Exit Sub`,
      `    End If`,
      `    `,
      `    Part.ClearSelection2 True`,
      `    `,
      `    ' --- 1. GLOBAL VARIABLES & EQUATIONS ---`,
    ];

    // Export Global Equations / Driving Parameters
    doc.parameters.forEach((param, idx) => {
      const cleanParam = param.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const valMm = param.value;
      lines.push(
        `    ' Parameter: ${param.name}`,
        `    Part.AddEquation -1, """${cleanParam}"" = ${valMm}mm"`
      );
    });

    lines.push(``, `    ' --- 2. RECONSTRUCT NATIVE SKETCHES & FEATURES ---`);

    depResult.sortedSketches.forEach((sk, idx) => {
      const skIndex = idx + 1;
      lines.push(
        ``,
        `    ' [Sketch ${skIndex}: ${sk.name}]`,
        `    Part.Extension.SelectByID2 "Top Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0`,
        `    Part.SketchManager.InsertSketch True`,
        `    Part.ClearSelection2 True`
      );

      // Entities
      sk.entities.forEach((ent) => {
        if (ent.type === 'rectangle') {
          const x1 = (ent.center[0] - ent.width / 2) / 1000; // SolidWorks meters internal
          const y1 = (ent.center[1] - ent.height / 2) / 1000;
          const x2 = (ent.center[0] + ent.width / 2) / 1000;
          const y2 = (ent.center[1] + ent.height / 2) / 1000;
          lines.push(
            `    ' Rectangle: ${ent.width} x ${ent.height} mm`,
            `    Part.SketchManager.CreateCornerRectangle ${x1}, ${y1}, 0, ${x2}, ${y2}, 0`
          );
        } else if (ent.type === 'circle') {
          const xc = ent.center[0] / 1000;
          const yc = ent.center[1] / 1000;
          const rad = ent.radius / 1000;
          lines.push(
            `    ' Circle: Radius ${ent.radius} mm`,
            `    Part.SketchManager.CreateCircleByRadius ${xc}, ${yc}, 0, ${rad}`
          );
        }
      });

      // Constraints
      sk.constraints.forEach((c) => {
        const trans = CADConstraintTranslator.translateGeometricConstraint(c, 'solidworks');
        if (trans.isSupported) {
          lines.push(`    ${trans.syntaxSnippet}`);
        }
      });

      // Dimensions
      sk.dimensions.forEach((d) => {
        lines.push(
          `    ' Driving Dimension: ${d.name} (${d.value} mm)`,
          `    Set myDimension = Part.AddDimension2(0, 0, 0)`,
          `    If Not myDimension Is Nothing Then`,
          `        myDimension.SystemValue = ${d.value / 1000}`,
          `    End If`
        );
      });

      lines.push(`    Part.SketchManager.InsertSketch True ' Close Sketch`);

      // Find matching feature
      const feat = depResult.sortedFeatures.find((f) => f.sketchId === sk.id);
      if (feat && feat.type === 'extrude') {
        const depthMeters = (feat.parameters.depth || 20) / 1000;
        const isCut = feat.parameters.isCut;

        if (isCut) {
          lines.push(
            `    ' Cut Extrude Feature`,
            `    Set myFeature = Part.FeatureManager.FeatureCut4(True, False, False, 0, 0, ${depthMeters}, ${depthMeters}, False, False, False, False, 0, 0, False, False, False, False, False, True, True, True, True, False, 0, 0, False, False)`,
            `    Part.ClearSelection2 True`
          );
        } else {
          lines.push(
            `    ' Boss Extrude Feature`,
            `    Set myFeature = Part.FeatureManager.FeatureExtrusion3(True, False, False, 0, 0, ${depthMeters}, ${depthMeters}, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)`,
            `    Part.ClearSelection2 True`
          );
        }
      }
    });

    lines.push(
      ``,
      `    Part.ViewZoomtofit2`,
      `    MsgBox "Polystrukt parametric model successfully synthesized in SolidWorks.", vbInformation, "Polystrukt GenCAD Bridge"`,
      `End Sub`
    );

    return lines.join('\n');
  }
}
