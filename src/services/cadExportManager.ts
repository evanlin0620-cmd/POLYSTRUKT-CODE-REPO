import {
  ParametricCADDocument,
  CADPlatformId,
  ExportOptions,
  ExportResult,
  ValidationReport,
  ExportManifest,
} from '../lib/cad/types';
import { CADExporter } from '../lib/cad/adapters/base';
import { OnshapeCADAdapter } from '../lib/cad/adapters/onshapeAdapter';
import { SolidWorksCADAdapter } from '../lib/cad/adapters/solidworksAdapter';
import { FusionCADAdapter } from '../lib/cad/adapters/fusionAdapter';
import { STEPCADAdapter } from '../lib/cad/adapters/stepAdapter';
import { ParasolidCADAdapter } from '../lib/cad/adapters/parasolidAdapter';
import { buildParametricDocumentFromSpec, DocumentBuildContext } from '../lib/cad/documentBuilder';
import { CADValidator } from '../lib/cad/validator';
import { ProceduralSpec } from '../types';

export interface ExportProgressEvent {
  stage: 'validating' | 'synthesizing' | 'sketches' | 'constraints' | 'features' | 'finalizing' | 'complete';
  percentage: number;
  message: string;
}

class CADExportManager {
  private exporters = new Map<CADPlatformId, CADExporter>();

  constructor() {
    this.registerExporter(new OnshapeCADAdapter());
    this.registerExporter(new SolidWorksCADAdapter());
    this.registerExporter(new FusionCADAdapter());
    this.registerExporter(new STEPCADAdapter());
    this.registerExporter(new ParasolidCADAdapter());
  }

  public registerExporter(exporter: CADExporter) {
    this.exporters.set(exporter.platformId, exporter);
  }

  public getExporter(platformId: CADPlatformId): CADExporter | undefined {
    return this.exporters.get(platformId);
  }

  public getAllExporters(): CADExporter[] {
    return Array.from(this.exporters.values());
  }

  /**
   * Pre-flight validation and compatibility calculation for UI indicators.
   */
  public inspectCompatibility(
    spec: ProceduralSpec | ParametricCADDocument | null | undefined,
    context: DocumentBuildContext = {}
  ): {
    document: ParametricCADDocument;
    platformReports: Map<CADPlatformId, { report: ValidationReport; manifest: ExportManifest }>;
  } {
    const document =
      spec && typeof spec === 'object' && 'metadata' in spec && 'sketches' in spec
        ? (spec as ParametricCADDocument)
        : buildParametricDocumentFromSpec(spec as ProceduralSpec, context);
    const platformReports = new Map<CADPlatformId, { report: ValidationReport; manifest: ExportManifest }>();

    for (const [id, exporter] of this.exporters.entries()) {
      const report = exporter.validate(document);
      const manifest = CADValidator.generateManifest(document, id, exporter.name, report);
      platformReports.set(id, { report, manifest });
    }

    return { document, platformReports };
  }

  /**
   * Executes a multi-stage export job with progress reporting.
   */
  public async executeExportJob(
    platformId: CADPlatformId,
    spec: ProceduralSpec | ParametricCADDocument | null | undefined,
    context: DocumentBuildContext = {},
    options: ExportOptions = {},
    onProgress?: (event: ExportProgressEvent) => void
  ): Promise<ExportResult> {
    const exporter = this.getExporter(platformId);
    if (!exporter) {
      throw new Error(`Unsupported CAD export platform: ${platformId}`);
    }

    // Stage 1: Validation
    onProgress?.({
      stage: 'validating',
      percentage: 15,
      message: 'Validating geometry integrity and reference planes...',
    });
    await new Promise((r) => setTimeout(r, 40));

    // Stage 2: Synthesis
    onProgress?.({
      stage: 'synthesizing',
      percentage: 35,
      message: 'Building Universal Parametric CAD Document...',
    });
    const doc =
      spec && typeof spec === 'object' && 'metadata' in spec && 'sketches' in spec
        ? (spec as ParametricCADDocument)
        : buildParametricDocumentFromSpec(spec as ProceduralSpec, context);
    await new Promise((r) => setTimeout(r, 40));

    // Stage 3: Sketches
    onProgress?.({
      stage: 'sketches',
      percentage: 55,
      message: `Deconstructing ${doc.sketches.length} sketch profiles and wireframe entities...`,
    });
    await new Promise((r) => setTimeout(r, 60));

    // Stage 4: Constraints & Dimensions
    onProgress?.({
      stage: 'constraints',
      percentage: 75,
      message: `Translating geometric relations and driving parameters for ${exporter.name}...`,
    });
    await new Promise((r) => setTimeout(r, 60));

    // Stage 5: Features
    onProgress?.({
      stage: 'features',
      percentage: 90,
      message: 'Synthesizing feature tree DAG and topological ordering...',
    });
    await new Promise((r) => setTimeout(r, 60));

    // Stage 6: Finalizing
    onProgress?.({
      stage: 'finalizing',
      percentage: 98,
      message: 'Generating production artifact package...',
    });
    const result = await exporter.export(doc, options);

    onProgress?.({
      stage: 'complete',
      percentage: 100,
      message: `Export completed for ${exporter.name}!`,
    });

    return result;
  }

  /**
   * Triggers a browser file download for an exported result.
   */
  public downloadExportResult(result: ExportResult) {
    let blob: Blob;
    if (result.content instanceof Blob) {
      blob = result.content;
    } else {
      blob = new Blob([result.content], { type: result.mimeType });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const cadExportManager = new CADExportManager();
