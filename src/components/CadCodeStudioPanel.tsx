import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  Copy,
  Download,
  Upload,
  Check,
  Play,
  FileCode,
  Sparkles,
  X,
  Terminal,
  RefreshCw,
  Layers,
  FileText,
  Boxes,
} from 'lucide-react';
import { ProceduralSpec } from '../types';
import {
  proceduralSpecToOpenSCAD,
  proceduralSpecToThreeJSCode,
  proceduralSpecToCadQueryPython,
  proceduralSpecToSTL,
  proceduralSpecToSTEP,
  proceduralSpecToGCode,
  parseCodeToProceduralSpec,
} from '../lib/cadCodeConverter';
import { cadExportManager } from '../services/cadExportManager';
import { buildParametricDocumentFromSpec } from '../lib/cad/documentBuilder';

interface CadCodeStudioPanelProps {
  proceduralSpec?: ProceduralSpec | null;
  modelName?: string;
  onClose: () => void;
  onCompileCode: (newSpec: ProceduralSpec, codeType: string) => void;
}

type CodeLanguage = 'onshape' | 'solidworks' | 'fusion' | 'step' | 'stl' | 'gcode' | 'openscad' | 'python' | 'threejs' | 'json';

export const CadCodeStudioPanel: React.FC<CadCodeStudioPanelProps> = ({
  proceduralSpec,
  modelName = 'Generative_CAD_Model',
  onClose,
  onCompileCode,
}) => {
  const [language, setLanguage] = useState<CodeLanguage>('step');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [codeText, setCodeText] = useState<string>('');
  const [importInputCode, setImportInputCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState<string | null>(null);

  // Update generated code when spec or language changes
  useEffect(() => {
    let generated = '';
    switch (language) {
      case 'onshape': {
        const onshapeExporter = cadExportManager.getExporter('onshape');
        if (onshapeExporter) {
          const doc = buildParametricDocumentFromSpec(proceduralSpec, { projectName: modelName });
          generated = (onshapeExporter as any).generateFeatureScript(doc);
        }
        break;
      }
      case 'solidworks': {
        const swExporter = cadExportManager.getExporter('solidworks');
        if (swExporter) {
          const doc = buildParametricDocumentFromSpec(proceduralSpec, { projectName: modelName });
          generated = (swExporter as any).generateSolidWorksVBA(doc);
        }
        break;
      }
      case 'fusion': {
        const fusionExporter = cadExportManager.getExporter('fusion');
        if (fusionExporter) {
          const doc = buildParametricDocumentFromSpec(proceduralSpec, { projectName: modelName });
          generated = (fusionExporter as any).generateFusionPythonScript(doc);
        }
        break;
      }
      case 'step':
        generated = proceduralSpecToSTEP(proceduralSpec, modelName);
        break;
      case 'stl':
        generated = proceduralSpecToSTL(proceduralSpec, modelName);
        break;
      case 'gcode':
        generated = proceduralSpecToGCode(proceduralSpec, {
          materialName: 'Aluminum 6061-T6',
          spindleRpm: 8500,
          feedRate: 1200,
          toolDiameter: 10,
        });
        break;
      case 'openscad':
        generated = proceduralSpecToOpenSCAD(proceduralSpec);
        break;
      case 'threejs':
        generated = proceduralSpecToThreeJSCode(proceduralSpec);
        break;
      case 'python':
        generated = proceduralSpecToCadQueryPython(proceduralSpec);
        break;
      case 'json':
        generated = JSON.stringify(
          {
            format: 'Polystrukt ProceduralSpec v1.0',
            exportedAt: new Date().toISOString(),
            proceduralSpec: proceduralSpec || { type: 'box', args: [20, 20, 20] },
          },
          null,
          2
        );
        break;
    }
    setCodeText(generated);
    if (!importInputCode) {
      setImportInputCode(generated);
    }
  }, [proceduralSpec, language, modelName]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'export' ? codeText : importInputCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExtension = (lang: CodeLanguage) => {
    switch (lang) {
      case 'onshape':
        return 'fs';
      case 'solidworks':
        return 'swp.vbs';
      case 'fusion':
        return 'py';
      case 'step':
        return 'step';
      case 'stl':
        return 'stl';
      case 'gcode':
        return 'gcode';
      case 'openscad':
        return 'scad';
      case 'threejs':
        return 'ts';
      case 'python':
        return 'py';
      case 'json':
        return 'json';
    }
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'export' ? codeText : importInputCode;
    const ext = getExtension(language);
    const filename = `${modelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadAllFormats = () => {
    const formats: { ext: string; content: string }[] = [
      { ext: 'step', content: proceduralSpecToSTEP(proceduralSpec, modelName) },
      { ext: 'stl', content: proceduralSpecToSTL(proceduralSpec, modelName) },
      { ext: 'scad', content: proceduralSpecToOpenSCAD(proceduralSpec) },
      { ext: 'gcode', content: proceduralSpecToGCode(proceduralSpec) },
      { ext: 'py', content: proceduralSpecToCadQueryPython(proceduralSpec) },
      { ext: 'json', content: JSON.stringify(proceduralSpec || {}, null, 2) },
    ];

    formats.forEach(({ ext, content }, index) => {
      setTimeout(() => {
        const filename = `${modelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }, index * 180);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportInputCode(content);
      setActiveTab('import');
      setCompileStatus(`Loaded file ${file.name} (${Math.round(file.size / 1024)} KB)`);
    };
    reader.readAsText(file);
  };

  const handleCompile = () => {
    if (!importInputCode.trim()) return;

    setIsCompiling(true);
    setCompileStatus('Parsing code syntax & compiling CSG geometry...');

    setTimeout(() => {
      try {
        const mappedLang: 'auto' | 'json' | 'openscad' | 'python' | 'javascript' =
          language === 'threejs'
            ? 'javascript'
            : language === 'openscad' || language === 'python' || language === 'json'
            ? language
            : 'auto';
        const compiledSpec = parseCodeToProceduralSpec(importInputCode, mappedLang);
        onCompileCode(compiledSpec, language.toUpperCase());
        setIsCompiling(false);
        setCompileStatus('Compilation successful! Model injected into 3D Viewport.');
      } catch (err: any) {
        setIsCompiling(false);
        setCompileStatus(`Compilation Error: ${err.message || 'Invalid syntax'}`);
      }
    }, 600);
  };

  const loadSampleCode = (sampleType: 'bracket' | 'hollow' | 'heatsink') => {
    let sample = '';
    if (sampleType === 'bracket') {
      sample = `// Parametric OpenSCAD L-Bracket
$fn = 64;

difference() {
  union() {
    cube([40, 10, 40], center=true);
    cube([40, 40, 10], center=true);
  }
  cylinder(r=4, h=50, center=true);
}
`;
    } else if (sampleType === 'hollow') {
      sample = `// Parametric Cylinder Chamber
$fn = 64;

difference() {
  cylinder(r=15, h=30, center=true);
  cylinder(r=11, h=35, center=true);
}
`;
    } else {
      sample = `// Parametric Heat Sink Pin Array
$fn = 32;

union() {
  cube([50, 50, 4], center=true);
  cylinder(r=2.5, h=25, center=true);
}
`;
    }
    setImportInputCode(sample);
    setActiveTab('import');
    setLanguage('openscad');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <Code size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wider text-white uppercase font-unique">
                  CAD Code Engine & Script Studio
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-mono">
                  Code-as-CAD
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Export and import parametric 3D models directly as OpenSCAD, Three.js, Python, or JSON code scripts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar & Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-zinc-900/30">
          {/* Export vs Import Mode */}
          <div className="flex items-center p-1 bg-zinc-900 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode size={14} /> Export Code
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload size={14} /> Import & Compile Code
            </button>
          </div>

          {/* Language Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-zinc-900/80 p-1 border border-white/10 rounded-xl">
            {(
              [
                { id: 'onshape', label: 'Onshape (FS)', icon: Sparkles },
                { id: 'solidworks', label: 'SolidWorks (Macro)', icon: Terminal },
                { id: 'fusion', label: 'Fusion 360 (Py)', icon: Code },
                { id: 'step', label: 'STEP AP242', icon: Boxes },
                { id: 'stl', label: 'STL Mesh', icon: Boxes },
                { id: 'gcode', label: 'CNC G-Code', icon: Terminal },
                { id: 'openscad', label: 'OpenSCAD', icon: Boxes },
                { id: 'python', label: 'CadQuery', icon: Terminal },
                { id: 'threejs', label: 'Three.js', icon: Layers },
                { id: 'json', label: 'JSON Spec', icon: FileText },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setLanguage(item.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    language === item.id
                      ? 'bg-white/15 text-purple-300 border border-purple-400/40 shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={12} /> {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'export' ? (
            /* EXPORT VIEW */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                  <Sparkles size={12} className="text-purple-400" /> Generated Parametric {language.toUpperCase()} Representation
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-purple-500/40 text-purple-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    <Download size={13} /> Download .{getExtension(language)}
                  </button>
                  <button
                    onClick={handleDownloadAllFormats}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    title="Download STEP, STL, SCAD, G-Code & Python bundle"
                  >
                    <Download size={13} /> Export All Formats
                  </button>
                </div>
              </div>

              {/* Code Display Area */}
              <div className="relative rounded-xl border border-white/10 bg-zinc-900/90 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/80 border-b border-white/5 text-[9px] font-mono text-zinc-500">
                  <span>
                    FILE: {modelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.{getExtension(language)}
                  </span>
                  <span>LINES: {codeText.split('\n').length}</span>
                </div>
                <pre className="p-4 text-xs font-mono text-purple-200/90 overflow-x-auto max-h-[380px] leading-relaxed select-text">
                  <code>{codeText}</code>
                </pre>
              </div>
            </div>
          ) : (
            /* IMPORT VIEW */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                  <Terminal size={12} className="text-purple-400" /> Input or Upload CAD Code Script
                </span>

                {/* Preset Templates */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono">Sample Presets:</span>
                  <button
                    onClick={() => loadSampleCode('bracket')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded text-[9px] font-mono uppercase transition-colors"
                  >
                    L-Bracket
                  </button>
                  <button
                    onClick={() => loadSampleCode('hollow')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded text-[9px] font-mono uppercase transition-colors"
                  >
                    Hollow Chamber
                  </button>
                  <button
                    onClick={() => loadSampleCode('heatsink')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded text-[9px] font-mono uppercase transition-colors"
                  >
                    Heat Sink
                  </button>
                </div>
              </div>

              {/* Textarea Code Input */}
              <div className="relative rounded-xl border border-purple-500/30 bg-zinc-900/90 overflow-hidden shadow-inner focus-within:border-purple-400">
                <textarea
                  value={importInputCode}
                  onChange={(e) => setImportInputCode(e.target.value)}
                  placeholder={`// Paste your OpenSCAD, Three.js script, or JSON spec code here...\n\nexample:\ndifference() {\n  cube([30, 30, 20], center=true);\n  cylinder(r=8, h=30, center=true);\n}`}
                  className="w-full h-64 p-4 bg-transparent text-xs font-mono text-purple-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Upload File & Compile Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors">
                  <Upload size={14} className="text-purple-400" />
                  <span>Upload .scad / .ts / .json File</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".scad,.ts,.js,.py,.json"
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleCompile}
                    disabled={isCompiling || !importInputCode.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isCompiling ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Play size={14} className="fill-current" />
                    )}
                    <span>{isCompiling ? 'Compiling CSG...' : 'Compile Code to 3D Model'}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {compileStatus && (
                <div
                  className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-2 ${
                    compileStatus.includes('Error')
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <div className="shrink-0">
                    {compileStatus.includes('Error') ? '❌' : '⚡'}
                  </div>
                  <div>{compileStatus}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
