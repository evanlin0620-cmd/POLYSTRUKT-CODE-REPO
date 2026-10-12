import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  X, 
  Layers, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Box, 
  Scissors, 
  PlusCircle, 
  FolderTree, 
  FileCode, 
  Activity, 
  RefreshCw, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Info,
  Scale,
  Maximize2
} from 'lucide-react';
import { ProceduralSpec } from '../types';
import { 
  csgDocumentationService, 
  CSGGeometryDocumentation, 
  DocumentedPrimitive, 
  DocumentedBooleanOp, 
  CSGTreeNode 
} from '../services/csgDocumentationService';

interface DocumentationPanelProps {
  proceduralSpec?: ProceduralSpec | null;
  currentDesign?: any;
  selectedMaterial?: any;
  dimensions?: { length: number; width: number; height: number };
  onClose: () => void;
  onSelectPrimitive?: (primitiveId: string) => void;
}

type DocTab = 'tree' | 'primitives' | 'booleans' | 'narrative' | 'review';
type ReviewStatus = 'draft' | 'under_review' | 'approved' | 'changes_requested';

export const DocumentationPanel: React.FC<DocumentationPanelProps> = ({
  proceduralSpec,
  currentDesign,
  selectedMaterial,
  dimensions = { length: 150, width: 100, height: 50 },
  onClose,
  onSelectPrimitive
}) => {
  const [activeTab, setActiveTab] = useState<DocTab>('tree');
  const [copied, setCopied] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('draft');
  const [reviewerName, setReviewerName] = useState('Lead Mechanical Reviewer');
  const [reviewerNotes, setReviewerNotes] = useState('Geometry inspected against ASME Y14.41 standard. All primitive envelopes within permissible envelope bounds.');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Compute model title
  const modelTitle = useMemo(() => {
    if (currentDesign?.specs) {
      const match = currentDesign.specs.split('\n')[0]?.replace(/(TITLE:|TYPE:)/i, '').trim();
      if (match) return match;
    }
    return 'Generative CSG Mechanical Component';
  }, [currentDesign]);

  // Material density
  const density = useMemo(() => {
    if (selectedMaterial?.id === 'titanium_grade_5' || selectedMaterial?.id === 'titanium') return 4.43;
    if (selectedMaterial?.id === 'steel_304') return 8.00;
    if (selectedMaterial?.id === 'carbon_fiber') return 1.60;
    if (selectedMaterial?.id === 'abs_plastic') return 1.04;
    return 2.70; // Aluminum 6061 default
  }, [selectedMaterial]);

  // Automatically re-analyze geometry whenever proceduralSpec or design changes
  const doc: CSGGeometryDocumentation = useMemo(() => {
    const activeSpec = proceduralSpec || currentDesign?.proceduralSpec || null;
    return csgDocumentationService.analyzeGeometry(activeSpec, {
      modelTitle,
      materialDensity: density,
      customDimensions: dimensions,
      specsPrompt: currentDesign?.specs
    });
  }, [proceduralSpec, currentDesign, modelTitle, density, dimensions]);

  // Copy Markdown Dossier to clipboard
  const handleCopyMarkdown = () => {
    const md = csgDocumentationService.generateMarkdownDossier(doc, {
      author: reviewerName,
      project: 'PolyStrukt CAD Workspace'
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    const md = csgDocumentationService.generateMarkdownDossier(doc, {
      author: reviewerName,
      project: 'PolyStrukt CAD Workspace'
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelTitle.replace(/\s+/g, '_')}_Technical_Documentation.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download JSON Schema
  const handleDownloadJson = () => {
    const data = JSON.stringify(doc, null, 2);
    const blob = new Blob([data], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelTitle.replace(/\s+/g, '_')}_CSG_Spec.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print formatted Technical Review PDF
  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to generate the printable Technical Review PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Technical Documentation - ${doc.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #111; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 3px solid #111; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
          .meta { font-size: 11px; color: #555; font-family: monospace; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; text-transform: uppercase; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .stat-box { border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background: #f8fafc; }
          .stat-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .stat-val { font-size: 15px; font-weight: bold; font-family: monospace; color: #0f172a; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          .narrative { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 15px 0; font-size: 12px; }
          .checklist-item { margin: 8px 0; padding: 6px 10px; border-radius: 4px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .signoff { margin-top: 40px; border-top: 2px dashed #94a3b8; padding-top: 20px; display: flex; justify-content: space-between; }
          .signoff-box { width: 45%; border-top: 1px solid #111; margin-top: 50px; padding-top: 6px; font-size: 11px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Technical Geometry Documentation</h1>
            <div class="meta">REF: ${doc.title} | REV: ${doc.specHash} | ${new Date().toLocaleString()}</div>
          </div>
          <div>
            <span class="badge">STATUS: ${reviewStatus.toUpperCase().replace('_', ' ')}</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box"><div class="stat-title">Primitives Count</div><div class="stat-val">${doc.stats.totalPrimitives} Shapes</div></div>
          <div class="stat-box"><div class="stat-title">Boolean Operations</div><div class="stat-val">${doc.stats.totalBooleanOps} Operations</div></div>
          <div class="stat-box"><div class="stat-title">Net Solid Volume</div><div class="stat-val">${(doc.stats.netVolumeMm3 / 1000).toFixed(2)} cm³</div></div>
          <div class="stat-box"><div class="stat-title">Theoretical Mass</div><div class="stat-val">${doc.stats.estimatedMassGrams} g</div></div>
        </div>

        <h3>1. Design Intent Narrative</h3>
        <div class="narrative">${doc.designIntentNarrative}</div>

        <h3>2. Solid Primitives Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Primitive Type</th>
              <th>Design Role</th>
              <th>Dimensions (mm)</th>
              <th>Position [X,Y,Z]</th>
              <th>Volume (mm³)</th>
            </tr>
          </thead>
          <tbody>
            ${doc.primitives.map(p => `
              <tr>
                <td>${p.index}</td>
                <td><strong>${p.type.toUpperCase()}</strong></td>
                <td>${p.role}</td>
                <td><code>${p.dimensionsSummary}</code></td>
                <td><code>[${p.position.join(', ')}]</code></td>
                <td>${p.volumeMm3.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>3. Boolean CSG Operations Audit</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Operation</th>
              <th>Engineering Intent</th>
              <th>Target Operand (A)</th>
              <th>Tool Operand (B)</th>
            </tr>
          </thead>
          <tbody>
            ${doc.booleanOperations.map(b => `
              <tr>
                <td>${b.index}</td>
                <td><strong>${b.op.toUpperCase()}</strong></td>
                <td>${b.engineeringIntent}</td>
                <td>${b.targetDescription}</td>
                <td>${b.toolDescription}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>4. Technical Review Sign-Off</h3>
        <div><strong>Reviewer:</strong> ${reviewerName}</div>
        <div style="margin-top: 6px;"><strong>Review Notes:</strong> ${reviewerNotes}</div>

        <div class="signoff">
          <div class="signoff-box">Lead Mechanical Engineer Sign-Off / Stamp</div>
          <div class="signoff-box">Tooling & Manufacturing Approval</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const toggleNodeCollapse = (id: string) => {
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Render recursive CSG Tree Nodes
  const renderTreeNode = (node: CSGTreeNode, index: number = 0) => {
    const isCollapsed = !!collapsedNodes[node.id];
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    let icon = <Box size={14} className="text-indigo-400" />;
    let badgeBg = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

    if (node.nodeType === 'operation') {
      if (node.op === 'subtract') {
        icon = <Scissors size={14} className="text-rose-400" />;
        badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      } else if (node.op === 'union') {
        icon = <PlusCircle size={14} className="text-emerald-400" />;
        badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      } else {
        icon = <Sliders size={14} className="text-amber-400" />;
        badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      }
    } else if (node.nodeType === 'group') {
      icon = <FolderTree size={14} className="text-sky-400" />;
      badgeBg = "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }

    return (
      <div key={node.id} className="space-y-1">
        <div
          onClick={() => {
            setSelectedNodeId(node.id);
            if (node.nodeType === 'primitive' && onSelectPrimitive) {
              onSelectPrimitive(node.id);
            }
          }}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
            isSelected
              ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
              : 'bg-zinc-900/60 border-white/5 hover:bg-zinc-800/80 hover:border-white/10'
          }`}
          style={{ marginLeft: `${node.depth * 18}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeCollapse(node.id);
              }}
              className="p-1 text-zinc-500 hover:text-white rounded"
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </button>
          ) : (
            <div className="w-5 text-center text-zinc-600 font-mono text-[10px]">•</div>
          )}

          <div className={`p-1.5 rounded-lg border ${badgeBg}`}>
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-200 truncate font-mono">
                {node.label}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-white/5 text-zinc-400">
                Lvl {node.depth}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono truncate">
              {node.details}
            </p>
          </div>

          {node.dimensions && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-md shrink-0">
              {node.dimensions}
            </span>
          )}
        </div>

        {hasChildren && !isCollapsed && (
          <div className="space-y-1">
            {node.children!.map((child, cIdx) => renderTreeNode(child, cIdx))}
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved for Production', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'under_review':
        return { label: 'Under Technical Review', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'changes_requested':
        return { label: 'Change Order Requested', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'draft':
      default:
        return { label: 'Draft / Working Model', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
  };

  const statusBadge = getStatusBadge(reviewStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-5xl h-[92vh] max-h-[920px] bg-zinc-950/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans"
      >
        {/* Top Header */}
        <div className="p-5 sm:px-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shadow-sm">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-unique text-white">
                  CAD Documentation & CSG Technical Review
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                <span>REF: <strong className="text-zinc-200">{modelTitle}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-Updating with Scene Geometry
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-unique"
              title="Copy formatted Markdown technical review dossier to clipboard"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Dossier'}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-unique"
              title="Download Markdown Documentation File (.md)"
            >
              <Download size={13} />
              Export .MD
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-unique shadow-sm"
              title="Generate printable ASME Y14.41 / ISO 10303 Technical Review PDF"
            >
              <Printer size={13} />
              Print / PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* High-Level CSG Geometry KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-4 bg-zinc-900/30 border-b border-white/5 text-xs">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="block text-[10px] font-mono uppercase text-zinc-400">Total Primitives</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-black font-mono text-white">{doc.stats.totalPrimitives}</span>
              <span className="text-[10px] font-mono text-zinc-500">shapes</span>
            </div>
            <span className="text-[9px] text-zinc-500 truncate block mt-0.5">
              {doc.primitives.map(p => p.type).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'None'}
            </span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="block text-[10px] font-mono uppercase text-zinc-400">Boolean Cuts/Unions</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-black font-mono text-cyan-400">{doc.stats.totalBooleanOps}</span>
              <span className="text-[10px] font-mono text-zinc-500">ops</span>
            </div>
            <span className="text-[9px] text-zinc-500 truncate block mt-0.5">
              {doc.stats.subtractCount} cuts, {doc.stats.unionCount} unions
            </span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="block text-[10px] font-mono uppercase text-zinc-400">Net Solid Volume</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-black font-mono text-emerald-400">{(doc.stats.netVolumeMm3 / 1000).toFixed(1)}</span>
              <span className="text-[10px] font-mono text-zinc-500">cm³</span>
            </div>
            <span className="text-[9px] text-zinc-500 truncate block mt-0.5">
              ~{doc.stats.netVolumeMm3.toLocaleString()} mm³
            </span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="block text-[10px] font-mono uppercase text-zinc-400">Theoretical Mass</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-lg font-black font-mono text-amber-400">
                {doc.stats.estimatedMassGrams >= 1000 ? (doc.stats.estimatedMassGrams / 1000).toFixed(2) : doc.stats.estimatedMassGrams}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{doc.stats.estimatedMassGrams >= 1000 ? 'kg' : 'g'}</span>
            </div>
            <span className="text-[9px] text-zinc-500 truncate block mt-0.5">
              {selectedMaterial?.name || 'Aluminum 6061'}
            </span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="block text-[10px] font-mono uppercase text-zinc-400">Bounding Envelope</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-sm font-bold font-mono text-white">
                {doc.stats.boundingBox.length}×{doc.stats.boundingBox.width}×{doc.stats.boundingBox.height}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">mm</span>
            </div>
            <span className="text-[9px] text-zinc-500 truncate block mt-0.5">
              L × W × H Envelope
            </span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="block text-[10px] font-mono uppercase text-zinc-400">CSG Manifold State</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-base font-black font-mono text-indigo-400">{doc.stats.csgIntegrityScore}/100</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-mono truncate block mt-0.5">
              {doc.stats.manifoldState}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-white/10 bg-zinc-900/20 text-xs font-bold">
          {[
            { id: 'tree' as DocTab, label: 'CSG Tree & Hierarchy', icon: <FolderTree size={14} />, count: doc.stats.totalPrimitives + doc.stats.totalBooleanOps },
            { id: 'primitives' as DocTab, label: 'Primitives Breakdown', icon: <Box size={14} />, count: doc.stats.totalPrimitives },
            { id: 'booleans' as DocTab, label: 'Boolean Operations', icon: <Scissors size={14} />, count: doc.stats.totalBooleanOps },
            { id: 'narrative' as DocTab, label: 'Design Intent Narrative', icon: <FileText size={14} /> },
            { id: 'review' as DocTab, label: 'Technical Review & Sign-Off', icon: <ShieldCheck size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-3.5 border-b-2 font-unique tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-white bg-white/5 font-black'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                  activeTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-white/10 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-zinc-950/50 space-y-6">
          {/* TAB 1: CSG TREE & HIERARCHY */}
          {activeTab === 'tree' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-unique flex items-center gap-2">
                    <FolderTree size={16} className="text-indigo-400" />
                    Constructive Solid Geometry (CSG) Evaluation Graph
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Hierarchical representation of operand dependency, parent-child Boolean nesting, and coordinate offsets.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setCollapsedNodes({})}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-300 text-[11px]"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-indigo-300 text-[11px] flex items-center gap-1.5"
                  >
                    <FileCode size={12} /> Export CSG JSON
                  </button>
                </div>
              </div>

              {doc.primitives.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl space-y-2">
                  <Box size={32} className="mx-auto text-zinc-600" />
                  <h4 className="text-sm font-bold text-zinc-400">No CSG Geometry in Scene</h4>
                  <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                    Generate or import a 3D procedural specification in the workspace to preview the CSG structure.
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-2">
                  {renderTreeNode(doc.treeRoot)}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRIMITIVES BREAKDOWN */}
          {activeTab === 'primitives' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-unique flex items-center gap-2">
                    <Box size={16} className="text-cyan-400" />
                    Primitives Inventory & Parameter Matrix
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Detailed inventory of all standard geometric entities synthesized in this part specification.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {doc.primitives.length} Total Primitive(s)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doc.primitives.map((p) => (
                  <div
                    key={p.id}
                    className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: p.color || '#6366f1' }}
                        />
                        <div>
                          <h4 className="text-xs font-bold font-mono text-white">
                            #{p.index} • {p.type.toUpperCase()}
                          </h4>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            {p.role}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono text-zinc-300">
                        {p.operandSide ? p.operandSide.replace('_', ' ') : 'Primary'}
                      </span>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-zinc-400">
                        <span>Dimensions:</span>
                        <span className="text-cyan-300 font-bold">{p.dimensionsSummary}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Position [X, Y, Z]:</span>
                        <span className="text-zinc-200">[{p.position.join(', ')}] mm</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Rotation [Rx, Ry, Rz]:</span>
                        <span className="text-zinc-200">[{p.rotation.join('°, ')}°]</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Scale Factor:</span>
                        <span className="text-zinc-200">[{p.scale.join(', ')}]</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="block text-[9px] font-mono text-zinc-500 uppercase">Volume</span>
                        <span className="font-mono font-bold text-zinc-200">{p.volumeMm3.toLocaleString()} mm³</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="block text-[9px] font-mono text-zinc-500 uppercase">Surface Area</span>
                        <span className="font-mono font-bold text-zinc-200">{p.surfaceAreaMm2.toLocaleString()} mm²</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BOOLEAN OPERATIONS AUDIT */}
          {activeTab === 'booleans' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white font-unique flex items-center gap-2">
                  <Scissors size={16} className="text-rose-400" />
                  Boolean Operations & Material Removal Audit Trail
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ordered chronological list of Boolean CSG actions applied to generate internal cavities, bosses, and feature intersections.
                </p>
              </div>

              {doc.booleanOperations.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/30 border border-white/5 rounded-2xl space-y-1">
                  <p className="text-xs font-bold text-zinc-300">Single Uncut Solid</p>
                  <p className="text-[11px] text-zinc-500">
                    This model is comprised of a single primitive solid with no subtractive or additive Boolean joins.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doc.booleanOperations.map((b) => (
                    <div
                      key={b.id}
                      className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                            b.op === 'subtract'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : b.op === 'union'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          }`}>
                            {b.op}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-white font-mono">{b.name}</h4>
                            <p className="text-[11px] text-zinc-400">{b.engineeringIntent}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded">
                          Hierarchy Depth: {b.depth}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-black/30 p-3 rounded-xl border border-white/5">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Target Operand [A]</span>
                          <span className="text-zinc-200 font-medium">{b.targetDescription}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Tool / Cutter Operand [B]</span>
                          <span className="text-rose-300 font-medium">{b.toolDescription}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DESIGN INTENT NARRATIVE */}
          {activeTab === 'narrative' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white font-unique flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" />
                  Engineering Design Intent & Topological Narrative
                </h3>
                <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs text-zinc-200 leading-relaxed font-sans">
                  {doc.designIntentNarrative}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Manufacturing & Tooling Observations
                </h4>
                <div className="space-y-2">
                  {doc.manufacturingReviewNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Generative Target Specifications (Active Metadata)
                </h4>
                <pre className="p-3 bg-black/40 border border-white/5 rounded-xl text-[11px] font-mono text-zinc-400 whitespace-pre-wrap overflow-x-auto">
                  {currentDesign?.specs || 'No specific metadata prompts attached to current design.'}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: TECHNICAL REVIEW & SIGN-OFF */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              {/* Compliance Checklist */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-unique flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    DFM & Technical Quality Verification Checklist
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Standard: ASME Y14.41 / ISO 10303
                  </span>
                </div>

                <div className="space-y-2.5">
                  {doc.technicalReviewChecklist.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-4 p-3 bg-white/5 border border-white/5 rounded-xl"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-200">{c.item}</span>
                        <p className="text-[11px] text-zinc-400">{c.detail}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                        c.status === 'pass'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : c.status === 'warning'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Sign-Off Form */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Formal Technical Review Sign-Off
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400 font-mono uppercase block">Reviewer Identity</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400 font-mono uppercase block">Disposition Status</label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as ReviewStatus)}
                      className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="draft">Draft / Working Model</option>
                      <option value="under_review">Under Technical Review</option>
                      <option value="approved">Approved for Tooling & Production</option>
                      <option value="changes_requested">Change Order Requested (Revision)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 font-mono uppercase block">Engineering Audit Notes</label>
                  <textarea
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-indigo-500 focus:outline-none resize-none"
                    placeholder="Enter technical audit comments, tolerances, draft angle verification, or machining caveats..."
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Timestamp: {new Date().toUTCString()}
                  </span>

                  <button
                    onClick={handlePrintPdf}
                    className="px-4 py-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 font-unique cursor-pointer"
                  >
                    <Printer size={13} /> Print Signed Dossier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">
              Document Hash: <strong className="text-zinc-300">{doc.specHash}</strong>
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="hidden sm:inline font-mono text-[11px]">
              {doc.stats.totalPrimitives} Primitives • {doc.stats.totalBooleanOps} Operations
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors font-unique cursor-pointer"
            >
              Close Panel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
