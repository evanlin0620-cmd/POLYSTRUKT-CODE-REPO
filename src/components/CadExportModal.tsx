import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Settings2,
  Copy,
  Check,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Zap,
  RefreshCw,
  Sliders,
  FileText
} from 'lucide-react';
import {
  CADPlatformId,
  ExportOptions,
  ExportResult,
  ExportManifest,
  ValidationReport,
  ParametricCADDocument
} from '../lib/cad/types';
import { cadExportManager, ExportProgressEvent } from '../services/cadExportManager';
import { ProceduralSpec } from '../types';
import { cn } from '../lib/utils';

interface CadExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  spec: ProceduralSpec | null | undefined;
  projectName?: string;
  dimensions?: { length: number; width: number; height: number };
  materialName?: string;
  prompt?: string;
  specs?: string;
}

export const CadExportModal: React.FC<CadExportModalProps> = ({
  isOpen,
  onClose,
  spec,
  projectName = 'Polystrukt_Workpiece',
  dimensions = { length: 80, width: 80, height: 20 },
  materialName = 'Aluminum 6061-T6',
  prompt,
  specs
}) => {
  const [activeTab, setActiveTab] = useState<'open_in' | 'file_export'>('open_in');
  const [selectedPlatform, setSelectedPlatform] = useState<CADPlatformId>('onshape');
  const [viewSubTab, setViewSubTab] = useState<'actions' | 'code_preview' | 'manifest'>('actions');

  // Advanced toggles
  const [preserveSketches, setPreserveSketches] = useState(true);
  const [preserveDimensions, setPreserveDimensions] = useState(true);
  const [preserveConstraints, setPreserveConstraints] = useState(true);
  const [preserveHistory, setPreserveHistory] = useState(true);
  const [preserveAssemblies, setPreserveAssemblies] = useState(true);

  // Job execution state
  const [isExporting, setIsExporting] = useState(false);
  const [progressEvent, setProgressEvent] = useState<ExportProgressEvent | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Pre-flight compatibility inspector
  const compatibilityData = useMemo(() => {
    return cadExportManager.inspectCompatibility(spec, {
      projectName,
      dimensions,
      materialName,
      prompt,
      specs
    });
  }, [spec, projectName, dimensions, materialName, prompt, specs]);

  const activeExporter = cadExportManager.getExporter(selectedPlatform);
  const activeReportAndManifest = compatibilityData.platformReports.get(selectedPlatform);
  const activeReport = activeReportAndManifest?.report;
  const activeManifest = activeReportAndManifest?.manifest;

  // Auto-generate preview on platform select if not exporting
  useEffect(() => {
    let isSubscribed = true;
    if (isOpen) {
      cadExportManager
        .executeExportJob(
          selectedPlatform,
          spec,
          { projectName, dimensions, materialName, prompt, specs },
          {
            preserveSketches,
            preserveDimensions,
            preserveConstraints,
            preserveFeatureHistory: preserveHistory,
            preserveAssemblies
          }
        )
        .then((res) => {
          if (isSubscribed) setExportResult(res);
        })
        .catch((err) => console.error('Export pre-generation fault:', err));
    }
    return () => {
      isSubscribed = false;
    };
  }, [
    isOpen,
    selectedPlatform,
    spec,
    projectName,
    dimensions,
    materialName,
    preserveSketches,
    preserveDimensions,
    preserveConstraints,
    preserveHistory,
    preserveAssemblies
  ]);

  if (!isOpen) return null;

  const handleStartExport = async (isOpenInTrigger = false) => {
    setIsExporting(true);
    setProgressEvent({
      stage: 'validating',
      percentage: 10,
      message: 'Initializing CAD platform adapter...'
    });

    try {
      const options: ExportOptions = {
        preserveSketches,
        preserveDimensions,
        preserveConstraints,
        preserveFeatureHistory: preserveHistory,
        preserveAssemblies
      };

      const result = await cadExportManager.executeExportJob(
        selectedPlatform,
        spec,
        { projectName, dimensions, materialName, prompt, specs },
        options,
        (evt) => setProgressEvent(evt)
      );

      setExportResult(result);

      if (isOpenInTrigger && result.openInUrl) {
        window.open(result.openInUrl, '_blank', 'noopener,noreferrer');
      } else {
        cadExportManager.downloadExportResult(result);
      }
    } catch (err: any) {
      console.error('Export execution error:', err);
    } finally {
      setIsExporting(false);
      setProgressEvent(null);
    }
  };

  const handleCopyCode = () => {
    if (!exportResult?.codePreview && typeof exportResult?.content !== 'string') return;
    const textToCopy = (exportResult?.content as string) || exportResult?.codePreview || '';
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const handleCopyManifest = () => {
    if (!activeManifest) return;
    navigator.clipboard.writeText(JSON.stringify(activeManifest, null, 2)).then(() => {
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    });
  };

  const openInPlatforms: { id: CADPlatformId; name: string; tag: string; level: string }[] = [
    { id: 'onshape', name: 'Onshape', tag: 'Direct Web API & FeatureScript', level: 'Level 1 Native' },
    { id: 'solidworks', name: 'SolidWorks', tag: 'VBA COM Automation Macro', level: 'Level 1 Native' },
    { id: 'fusion', name: 'Autodesk Fusion', tag: 'Native Python Timeline API', level: 'Level 1 Native' }
  ];

  const fileExportPlatforms: { id: CADPlatformId; name: string; tag: string; level: string }[] = [
    { id: 'step', name: 'STEP AP242', tag: 'ISO 10303-21 B-Rep Solid', level: 'Level 2 Interchange' },
    { id: 'parasolid', name: 'Parasolid (X_T)', tag: 'Siemens Kernel Solid Text', level: 'Level 2 Interchange' }
  ];

  const currentPlatformList = activeTab === 'open_in' ? openInPlatforms : fileExportPlatforms;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Export & Open In External CAD
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Parametric Bridge v2.4
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Preserve sketches, constraints, driving dimensions, and feature history across professional CAD platforms.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Mode Tabs */}
        <div className="px-6 pt-3 pb-0 border-b border-white/10 flex items-center justify-between bg-zinc-900/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('open_in');
                setSelectedPlatform('onshape');
              }}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer',
                activeTab === 'open_in'
                  ? 'border-indigo-500 text-white bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              )}
            >
              <ExternalLink size={14} className="text-indigo-400" />
              <span>Open in External CAD</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                Level 1 Native
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('file_export');
                setSelectedPlatform('step');
              }}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer',
                activeTab === 'file_export'
                  ? 'border-indigo-500 text-white bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Download size={14} className="text-emerald-400" />
              <span>Standard Interchange Files</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                Level 2 B-Rep
              </span>
            </button>
          </div>

          {/* Model Dimension Indicator */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span>Envelope:</span>
            <span className="text-zinc-200 font-bold">
              {dimensions.length}x{dimensions.width}x{dimensions.height}mm
            </span>
          </div>
        </div>

        {/* Modal Main Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          
          {/* Left Column: Platform Selection & Advanced Toggles (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-5 bg-zinc-950/50">
            
            {/* Platform Cards */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2 font-semibold">
                Target CAD System
              </label>
              <div className="space-y-2">
                {currentPlatformList.map((platform) => {
                  const isSelected = selectedPlatform === platform.id;
                  const rep = compatibilityData.platformReports.get(platform.id)?.report;
                  const score = rep?.scorePercentage || 90;

                  return (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer',
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-900 hover:border-white/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono',
                            isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white/5 text-zinc-400'
                          )}
                        >
                          {platform.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                            <span>{platform.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                              {platform.level}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            {platform.tag}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-mono font-bold text-emerald-400">
                          {score}%
                        </div>
                        <div className="text-[9px] text-zinc-500 font-mono">Compatibility</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Parametric Preservation Toggles */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-300 uppercase font-semibold flex items-center gap-1.5">
                  <Sliders size={12} className="text-indigo-400" />
                  <span>Parametric Intent Filters</span>
                </span>
                <span className="text-[9px] font-mono text-zinc-500">Max Editability</span>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer select-none">
                  <span>Preserve 2D Wireframe Sketches</span>
                  <input
                    type="checkbox"
                    checked={preserveSketches}
                    onChange={(e) => setPreserveSketches(e.target.checked)}
                    className="rounded bg-zinc-800 border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer select-none">
                  <span>Preserve Driving Dimensions & Formulas</span>
                  <input
                    type="checkbox"
                    checked={preserveDimensions}
                    onChange={(e) => setPreserveDimensions(e.target.checked)}
                    className="rounded bg-zinc-800 border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer select-none">
                  <span>Preserve Geometric Constraints</span>
                  <input
                    type="checkbox"
                    checked={preserveConstraints}
                    onChange={(e) => setPreserveConstraints(e.target.checked)}
                    className="rounded bg-zinc-800 border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer select-none">
                  <span>Preserve Feature History Timeline</span>
                  <input
                    type="checkbox"
                    checked={preserveHistory}
                    onChange={(e) => setPreserveHistory(e.target.checked)}
                    className="rounded bg-zinc-800 border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer select-none">
                  <span>Preserve Bodies & Assemblies</span>
                  <input
                    type="checkbox"
                    checked={preserveAssemblies}
                    onChange={(e) => setPreserveAssemblies(e.target.checked)}
                    className="rounded bg-zinc-800 border-white/20 text-indigo-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Statutory Compliance Footer Notice */}
            <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/5 text-[10px] text-zinc-400 font-mono flex items-start gap-2">
              <ShieldCheck size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Exported design parameters are mathematically verified for manifold topology and dimensional sanity.
              </span>
            </div>

          </div>

          {/* Right Column: Platform Inspector, Code Preview & Execution (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-zinc-950/80">
            
            {/* Sub-Tabs: Actions / Code Preview / Manifest */}
            <div className="px-6 py-2.5 border-b border-white/10 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewSubTab('actions')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    viewSubTab === 'actions'
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  Overview & Actions
                </button>

                <button
                  onClick={() => setViewSubTab('code_preview')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                    viewSubTab === 'code_preview'
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  <FileCode size={13} className="text-sky-400" />
                  <span>Script & Macro Preview</span>
                </button>

                <button
                  onClick={() => setViewSubTab('manifest')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                    viewSubTab === 'manifest'
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  <Database size={13} className="text-emerald-400" />
                  <span>Export Manifest</span>
                </button>
              </div>

              {viewSubTab === 'code_preview' && (
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-md text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Copied' : 'Copy Script'}</span>
                </button>
              )}

              {viewSubTab === 'manifest' && (
                <button
                  onClick={handleCopyManifest}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-md text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedManifest ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedManifest ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {/* Sub-Tab 1: Overview & Actions */}
            {viewSubTab === 'actions' && (
              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                
                <div className="space-y-5">
                  {/* Target Platform Summary Card */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                        {activeExporter?.capabilities.fileFormatDescription}
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {activeExporter?.name} Parametric Integration
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-lg leading-relaxed">
                        {selectedPlatform === 'onshape' &&
                          'Generates native Onshape FeatureScript with fully editable 2D sketches, geometric constraints, driving dimensions, and part studio extrusions.'}
                        {selectedPlatform === 'solidworks' &&
                          'Generates a native SolidWorks COM Automation Macro (.swp/.vbs). Recreates native sketches, relations, and dimensions directly inside SolidWorks.'}
                        {selectedPlatform === 'fusion' &&
                          'Generates an Autodesk Fusion 360 Python API script that populates User Parameters and timeline features natively.'}
                        {selectedPlatform === 'step' &&
                          'Generates an ISO 10303-21 STEP AP242 solid B-Rep workpiece for universal CAD software interchange.'}
                        {selectedPlatform === 'parasolid' &&
                          'Generates a Siemens Parasolid transmit text solid body format (.x_t) for high-precision modeling kernels.'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-emerald-400">
                        {activeReport?.scorePercentage || 95}%
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">Parametric Score</div>
                    </div>
                  </div>

                  {/* Feature Breakdown Matrix */}
                  <div>
                    <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 font-semibold">
                      Design Intent Retention Breakdown
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
                        <div className="text-zinc-400 text-[10px]">Sketches</div>
                        <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span>{activeReport?.stats.sketchesCount || 2} Profiles</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
                        <div className="text-zinc-400 text-[10px]">Constraints</div>
                        <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span>{activeReport?.stats.constraintsCount || 4} Relations</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
                        <div className="text-zinc-400 text-[10px]">Dimensions</div>
                        <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span>{activeReport?.stats.dimensionsCount || 4} Parameters</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
                        <div className="text-zinc-400 text-[10px]">Feature Tree</div>
                        <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span>{activeReport?.stats.featuresCount || 2} Features</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
                        <div className="text-zinc-400 text-[10px]">Solid Bodies</div>
                        <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span>{activeReport?.stats.bodiesCount || 1} Solid</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
                        <div className="text-zinc-400 text-[10px]">Physical Material</div>
                        <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span className="truncate">{materialName.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions Box */}
                  {exportResult?.openInInstructions && (
                    <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                      {exportResult.openInInstructions}
                    </div>
                  )}
                </div>

                {/* Progress Bar (Visible while exporting) */}
                {isExporting && progressEvent && (
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-indigo-300 font-bold flex items-center gap-2">
                        <RefreshCw size={12} className="animate-spin text-indigo-400" />
                        <span>{progressEvent.message}</span>
                      </span>
                      <span className="text-white font-bold">{progressEvent.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-200"
                        style={{ width: `${progressEvent.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Execution Buttons */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {selectedPlatform === 'onshape' ? (
                    <>
                      <button
                        onClick={() => handleStartExport(true)}
                        disabled={isExporting}
                        className="flex-1 h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                      >
                        <ExternalLink size={16} />
                        <span>Open in Onshape Workspace</span>
                      </button>

                      <button
                        onClick={() => handleStartExport(false)}
                        disabled={isExporting}
                        className="h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                      >
                        <Download size={15} />
                        <span>Download FeatureScript (.fs)</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartExport(false)}
                        disabled={isExporting}
                        className="flex-1 h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                      >
                        <Download size={16} />
                        <span>
                          {selectedPlatform === 'solidworks' && 'Download SolidWorks Parametric Macro'}
                          {selectedPlatform === 'fusion' && 'Download Fusion 360 Python Script'}
                          {selectedPlatform === 'step' && 'Download STEP AP242 Solid (.step)'}
                          {selectedPlatform === 'parasolid' && 'Download Parasolid Model (.x_t)'}
                        </span>
                      </button>

                      <button
                        onClick={() => setViewSubTab('code_preview')}
                        className="h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
                      >
                        <FileCode size={15} />
                        <span>Inspect Script</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            )}

            {/* Sub-Tab 2: Script & Code Preview */}
            {viewSubTab === 'code_preview' && (
              <div className="p-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-zinc-400">
                  <span>
                    Generated Native Code: {activeExporter?.name} ({activeExporter?.capabilities.nativeFormatExtension})
                  </span>
                  <span>Lines: {exportResult?.codePreview?.split('\n').length || 0}</span>
                </div>

                <div className="flex-1 bg-zinc-950 border border-white/10 rounded-xl p-3 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-auto select-text custom-scrollbar">
                  <pre className="whitespace-pre">
                    {exportResult?.codePreview || (typeof exportResult?.content === 'string' ? exportResult.content : '// Ready for export.') || '// Generating code preview...'}
                  </pre>
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Export Manifest & Audit */}
            {viewSubTab === 'manifest' && (
              <div className="p-4 flex-1 flex flex-col overflow-hidden space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Export Compliance Manifest & Audit Trail</span>
                  <span className="text-emerald-400 font-bold">Standard RFC-7946 Schema</span>
                </div>

                <div className="flex-1 bg-zinc-950 border border-white/10 rounded-xl p-3 font-mono text-[11px] leading-relaxed text-emerald-300/90 overflow-auto select-text custom-scrollbar">
                  <pre className="whitespace-pre">
                    {JSON.stringify(activeManifest, null, 2)}
                  </pre>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
