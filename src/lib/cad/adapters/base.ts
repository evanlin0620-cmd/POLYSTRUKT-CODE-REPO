import {
  ParametricCADDocument,
  CADPlatformId,
  CADPlatformCapabilities,
  ValidationReport,
  ExportOptions,
  ExportResult,
} from '../types';

export interface CADExporter {
  platformId: CADPlatformId;
  name: string;
  capabilities: CADPlatformCapabilities;
  validate(doc: ParametricCADDocument): ValidationReport;
  export(doc: ParametricCADDocument, options?: ExportOptions): Promise<ExportResult>;
  generateOpenInPayload?(
    doc: ParametricCADDocument,
    options?: ExportOptions
  ): Promise<{
    openInUrl?: string;
    instructions: string;
    payload?: any;
    scriptContent?: string;
  }>;
}
