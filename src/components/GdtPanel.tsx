import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, FileText, Check, Layers, Sparkles, 
  Settings, AlertTriangle, Printer, Plus, Info, Shield, Scale, Ruler, RefreshCw
} from 'lucide-react';
import { ProceduralSpec } from '../types';

interface GdtPanelProps {
  onClose: () => void;
  currentDesign: any;
  selectedMaterial: any;
  dimensions: { length: number; width: number; height: number };
}

interface FeatureControlFrame {
  id: string;
  feature: string;
  symbol: string;
  tolerance: string;
  modifier: string; // 'M' | 'L' | 'none'
  datumA: string;
  datumB: string;
  datumC: string;
}

export const GdtPanel: React.FC<GdtPanelProps> = ({ 
  onClose, 
  currentDesign,
  selectedMaterial,
  dimensions
}) => {
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState('1:1');
  const [cageCode, setCageCode] = useState('8YTK4'); 
  const [docNumber, setDocNumber] = useState('PS-400A-90');
  const [selectedFaces, setSelectedFaces] = useState<string[]>(['Datum-A (Base)', 'Datum-B (Bearing Hole)']);
  
  // ASME Y14.5 Feature Control Frames list
  const [fcFrames, setFcFrames] = useState<FeatureControlFrame[]>([
    { id: 'f1', feature: 'Chassis Mounting Base (Flatness)', symbol: '▱', tolerance: '0.05', modifier: 'none', datumA: '', datumB: '', datumC: '' },
    { id: 'f2', feature: 'Core Shaft Cylindricity', symbol: '⌭', tolerance: '0.08', modifier: 'none', datumA: '', datumB: '', datumC: '' },
    { id: 'f3', feature: 'Bearing Alignment Hub (True Position)', symbol: '⌖', tolerance: '0.12', modifier: 'M', datumA: 'A', datumB: 'B', datumC: 'C' }
  ]);

  const [newFeature, setNewFeature] = useState('');
  const [newSymbol, setNewSymbol] = useState('⌖');
  const [newTol, setNewTol] = useState('0.10');
  const [newMod, setNewMod] = useState('M');
  const [newDatA, setNewDatA] = useState('A');
  const [newDatB, setNewDatB] = useState('B');
  const [newDatC, setNewDatC] = useState('');

  const symbolsList = [
    { name: 'Position', char: '⌖' },
    { name: 'Flatness', char: '▱' },
    { name: 'Circularity', char: '○' },
    { name: 'Concentricity', char: '◎' },
    { name: 'Cylindricity', char: '⌭' },
    { name: 'Profile of Surface', char: '⌒' },
    { name: 'Perpendicularity', char: '⟂' }
  ];

  const handleAddFrame = () => {
    if (!newFeature) return;
    const item: FeatureControlFrame = {
      id: `f-${Math.random().toString(36).substring(7)}`,
      feature: newFeature,
      symbol: newSymbol,
      tolerance: newTol,
      modifier: newMod,
      datumA: newDatA,
      datumB: newDatB,
      datumC: newDatC
    };
    setFcFrames([...fcFrames, item]);
    setNewFeature('');
  };

  const handleRemoveFrame = (id: string) => {
    setFcFrames(fcFrames.filter(item => item.id !== id));
  };

  // Automated layout rendering / triggering save of ASME GD&T PDF drawing
  const handleExportDrawing = () => {
    setExporting(true);
    
    // Create an elegant iframe-based printer or custom printable window styled perfectly to print PDF
    setTimeout(() => {
      setExporting(false);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Pop-up blocker is active. Please allow popups to open the Technical standard ASME Y14.5 Blueprints!");
        return;
      }

      const framesHtml = fcFrames.map(f => `
        <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 8px; border-radius: 6px; font-family: monospace; font-size: 11px; page-break-inside: avoid;">
          <div style="font-weight: bold; color: #555; margin-bottom: 4px; text-transform: uppercase;">Part Surface: ${f.feature}</div>
          <div style="display: inline-flex; align-items: stretch; border: 2px solid black; font-weight: bold; font-size: 14px; background: white;">
            <div style="border-right: 2px solid black; padding: 4px 10px; font-size: 16px;">${f.symbol}</div>
            <div style="border-right: 2px solid black; padding: 4px 10px;">Ø ${f.tolerance}${f.modifier !== 'none' ? `<span style="font-size: 11px; vertical-align: super;">${f.modifier}</span>` : ''}</div>
            ${f.datumA ? `<div style="border-right: 2px solid black; padding: 4px 10px;">${f.datumA}</div>` : ''}
            ${f.datumB ? `<div style="border-right: 2px solid black; padding: 4px 10px;">${f.datumB}</div>` : ''}
            ${f.datumC ? `<div style="padding: 4px 10px;">${f.datumC}</div>` : ''}
          </div>
        </div>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docNumber} - ASME Y14.5 GD&T Schema</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: white; color: black; margin: 30px; }
            .blueprint-canvas { width: 100%; border: 2px solid black; margin-bottom: 25px; min-height: 400px; position: relative; box-sizing: border-box; }
            .grid-bg { background-image: radial-gradient(#ddd 1px, transparent 1px); background-size: 20px 20px; }
            .title-block { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 9px; page-break-inside: avoid; }
            .title-block td { border: 1px solid black; padding: 8px; font-family: monospace; text-transform: uppercase; }
            .asme-text { font-family: monospace; font-size: 8px; color: #333; line-height: 1.5; }
            h1, h2 { font-weight: 800; text-transform: uppercase; margin: 0; }
            span.datum { display: inline-block; border: 2px solid black; padding: 3px 8px; font-weight: bold; font-family: monospace; margin-right: 6px; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body class="grid-bg">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
              <h1 style="font-size: 20px; font-weight: 950; letter-spacing: -0.5px;">POLYSTRUKT CO-SYNTHESIS</h1>
              <span class="asme-text" style="font-weight: bold;">ASME Y14.5-2018 / ISO 1101 STANDARD ENGINEERING BLOCK</span>
            </div>
            <button onclick="window.print()" style="padding: 8px 16px; background: black; color: white; border: none; font-weight: bold; font-size: 11px; cursor: pointer; text-transform: uppercase; border-radius: 4px;">Print / Export PDF</button>
          </div>

          <div class="blueprint-canvas" style="display: flex; align-items: center; justify-content: center; background: #fafafa; border: 3px double #000; overflow: hidden;">
            <!-- Simple SVG schematic rendering Front & side projections from sizes -->
            <svg width="600" height="350" viewBox="0 0 600 350" style="margin: auto;">
              <g stroke="black" stroke-width="1.5" fill="none">
                <!-- FRONT VIEW -->
                <rect x="80" y="80" width="${dimensions.length}" height="${dimensions.height}" stroke-dasharray="1 0" fill="#f0f3ff" />
                <circle cx="${80 + dimensions.length/2}" cy="${80 + dimensions.height/2}" r="15" fill="white" stroke-width="1" />
                
                <!-- Front Dimension lines -->
                <line x1="80" y1="210" x2="${80 + dimensions.length}" y2="210" stroke-width="0.75" />
                <line x1="80" y1="205" x2="80" y2="215" stroke-width="1" />
                <line x1="${80 + dimensions.length}" y1="205" x2="${80 + dimensions.length}" y2="215" stroke-width="1" />
                
                <!-- TOP VIEW -->
                <rect x="80" y="240" width="${dimensions.length}" height="${dimensions.width/2}" fill="#f0f3ff" />
                
                <!-- SIDE VIEW -->
                <rect x="340" y="80" width="${dimensions.width}" height="${dimensions.height}" fill="#f0f3ff" />
                <circle cx="${340 + dimensions.width/2}" cy="${85}" r="5" fill="black" />
                
                <!-- ASME Datum tags -->
                <g transform="translate(68, 120)">
                  <polygon points="0,0 8,-5 8,5" fill="black" />
                  <line x1="8" y1="0" x2="25" y2="0" />
                  <rect x="25" y="-8" width="16" height="16" fill="black" />
                  <text x="33" y="4" font-family="monospace" font-size="10" font-weight="bold" fill="white" text-anchor="middle">A</text>
                </g>
                <g transform="translate(${80 + dimensions.length/2}, 45)">
                  <polygon points="0,35 -5,27 5,27" fill="black" />
                  <line x1="0" y1="27" x2="0" y2="10" />
                  <rect x="-8" y="-6" width="16" height="16" fill="black" />
                  <text x="0" y="6" font-family="monospace" font-size="10" font-weight="bold" fill="white" text-anchor="middle">B</text>
                </g>
              </g>

              <!-- Standard Dimensions label annotations -->
              <g font-family="monospace" font-size="10" font-weight="bold" fill="black">
                <text x="${80 + dimensions.length/2}" y="200" text-anchor="middle">L= ${dimensions.length}.00 mm ±0.1</text>
                <text x="${120 + dimensions.length}" y="${80 + dimensions.height/2}">H= ${dimensions.height}.00 mm</text>
                <text x="${340 + dimensions.width/2}" y="220" text-anchor="middle">W= ${dimensions.width}.00 mm</text>
                <text x="80" y="65">FRONT PROJECTION (1)</text>
                <text x="340" y="65">SIDE PROJECTION (2)</text>
                <text x="80" y="325">TOP PLAN VIEW (3)</text>
              </g>
            </svg>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <h2 style="font-size: 13px; font-weight: 900; margin-bottom: 12px; border-bottom: 2px solid black; padding-bottom: 4px;">TOLERANCE SPECIFICATIONS (GD&T FEATURE CONTROL)</h2>
              ${framesHtml}
            </div>

            <div>
              <h2 style="font-size: 13px; font-weight: 900; margin-bottom: 12px; border-bottom: 2px solid black; padding-bottom: 4px;">ACTIVE MANUFACTURING DATUMS & CHECKS</h2>
              <div style="font-family: monospace; font-size: 11px;">
                <div style="margin-bottom: 10px;"><span class="datum">A</span> Primary Datum Reference plane: Base Face contacting standard bed index</div>
                <div style="margin-bottom: 10px;"><span class="datum">B</span> Secondary Datum alignment axis: Central borehole tolerance surface</div>
                <div style="margin-bottom: 10px;"><span class="datum">C</span> Tertiary rotation datum locator: Left bracket counter-bore center</div>
                
                <h2 style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 30px 0 8px 0;">Material Composition Specs</h2>
                <div style="background: #fafafa; border: 1px border black; padding: 12px; border-radius: 4px; border: 1px dashed #bbb;">
                  <strong>PROFILE:</strong> ${selectedMaterial?.name || 'Aluminum 6061-T6'}<br/>
                  <strong>PROCESS TYPE:</strong> Generative Dual-Zone CNC Tooling<br/>
                  <strong>STANDARD DENSITY:</strong> 2.70 g/cm³ (High Strength-to-Weight Envelope)<br/>
                  <strong>REGULATORY AUDIT:</strong> ASME Y14.5 Compliant Code
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Standard Title Block -->
          <table class="title-block">
            <tr>
              <td rowspan="2" style="width: 35%; font-size: 12px; font-weight: bold;">POLYSTRUKT MANUFACTURING CO</td>
              <td style="width: 25%;">DWG ID: <strong>${docNumber}</strong></td>
              <td style="width: 15%;">SCALE: <strong>${scale}</strong></td>
              <td style="width: 25%;">APPROVED BY: <strong>AI Auto-Compiler S6</strong></td>
            </tr>
            <tr>
              <td>TITLE: <strong>SYNTHESIZED ASSEMBLY PROFILE</strong></td>
              <td>REV: <strong>1.4.0 (GIT)</strong></td>
              <td>DATE: <strong>${new Date().toLocaleDateString()}</strong></td>
            </tr>
            <tr>
              <td colspan="2" class="asme-text">
                UNLESS OTHERWISE SPECIFIED: DIMENSIONS ARE IN MILLIMETERS.<br/>
                ANGULAR TOLERANCES: ±0.5°. INTERPRET DRAWINGS IN COMPLIANCE WITH ASME Y14.5-2018 RULES.
              </td>
              <td>CAGE CODE: <strong>${cageCode}</strong></td>
              <td>SHEET: <strong>PAGE 1 OF 1</strong></td>
            </tr>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
    }, 1200);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-zinc-950/95 border-l border-white/10 backdrop-blur-md shadow-2xl flex flex-col font-sans text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Ruler size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-100">ASME Y14.5 GD&T Board</h2>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Automated Blueprints & PDF technical Engineering Drawing Exporter</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/5 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Panel Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title block configurator */}
        <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">ASME Title Block configurations</span>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Drawing No.</label>
              <input 
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-sky-500 text-left text-zinc-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">CAGE CODE</label>
              <input 
                type="text"
                value={cageCode}
                onChange={(e) => setCageCode(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-sky-500 text-left text-zinc-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-sky-500 cursor-pointer text-zinc-300"
              >
                <option value="1:1">1:1 Standard</option>
                <option value="1:2">1:2 Half Scale</option>
                <option value="2:1">2:1 Expanded scale</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blueprint view projection visualization */}
        <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Blueprint View projections active</span>
            <span className="text-[8px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 font-bold uppercase">ASME Y14.5 Draft Block</span>
          </div>

          <div className="w-full overflow-hidden rounded-2xl bg-white border border-black/10 p-4 flex items-center justify-center relative">
            <svg width="100%" height="200" viewBox="0 0 500 200">
              <g stroke="black" stroke-width="1.2" fill="none">
                {/* Projected drawing outline */}
                <rect x="50" y="40" width="130" height="80" stroke-dasharray="1 0" fill="#f4f6ff" />
                <circle cx="115" cy="80" r="15" fill="white" stroke-width="1" />
                
                {/* Horizontal reference indicator dimension line */}
                <line x1="50" y1="140" x2="180" y2="140" stroke-width="0.75" />
                <line x1="50" y1="135" x2="50" y2="145" stroke-width="1" />
                <line x1="180" y1="135" x2="180" y2="145" stroke-width="1" />
                
                {/* Isometric projection outline */}
                <rect x="280" y="40" width="120" height="80" fill="#f4f6ff" />
                <line x1="280" y1="40" x2="310" y2="20" stroke-width="1.2" />
                <line x1="400" y1="40" x2="430" y2="20" stroke-width="1.2" />
                <line x1="310" y1="20" x2="430" y2="20" stroke-width="1.2" />
                <line x1="430" y1="20" x2="430" y2="100" stroke-dasharray="2 2" stroke-width="1" />
                <line x1="400" y1="120" x2="430" y2="100" stroke-dasharray="2 2" stroke-width="1" />
              </g>

              <g font-family="monospace" font-size="9" font-weight="bold" fill="black">
                <text x="115" y="132" text-anchor="middle">L= ${dimensions.length}mm ±0.1</text>
                <text x="50" y="30">FRONT PROJECTION</text>
                <text x="280" y="30">ISOMETRIC SHELL</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Interactive Feature Control Frame Builder */}
        <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Feature Control Frame Builder (ASME)</span>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Target Surface Face / Dimension Name</label>
              <input 
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="e.g. Counterbore Bore alignment surface"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[9.5px] font-mono focus:outline-none text-left focus:border-sky-500 text-zinc-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Geometric Symbol</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono focus:outline-none focus:border-sky-500 cursor-pointer text-zinc-300"
              >
                {symbolsList.map(s => (
                  <option key={s.char} value={s.char}>{s.char} - {s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Tolerance Bounds (mm)</label>
              <input 
                type="text"
                value={newTol}
                onChange={(e) => setNewTol(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono focus:outline-none focus:border-sky-500 text-left text-zinc-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Modifier MMC/LMC</label>
              <select
                value={newMod}
                onChange={(e) => setNewMod(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono focus:outline-none focus:border-sky-500 cursor-pointer text-zinc-300"
              >
                <option value="none">None (RFS)</option>
                <option value="M">Ⓜ Maximum Material Condition</option>
                <option value="L">Ⓛ Least Material Condition</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-1 space-y-1 col-span-1">
              <div className="col-span-3 text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Datums</div>
              <input type="text" value={newDatA} onChange={(e) => setNewDatA(e.target.value)} placeholder="A" className="bg-zinc-950 border border-white/10 rounded-lg p-1.5 text-center font-mono text-[9px] focus:outline-none focus:border-sky-500" />
              <input type="text" value={newDatB} onChange={(e) => setNewDatB(e.target.value)} placeholder="B" className="bg-zinc-950 border border-white/10 rounded-lg p-1.5 text-center font-mono text-[9px] focus:outline-none focus:border-sky-500" />
              <input type="text" value={newDatC} onChange={(e) => setNewDatC(e.target.value)} placeholder="C" className="bg-zinc-950 border border-white/10 rounded-lg p-1.5 text-center font-mono text-[9px] focus:outline-none focus:border-sky-500" />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleAddFrame}
              disabled={!newFeature}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={12} /> Add ASME Frame
            </button>
          </div>
        </div>

        {/* Standard Table mapping Feature Controls */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Active ASME Feature Control logs</span>
          
          <div className="space-y-2.5">
            {fcFrames.map(f => (
              <div 
                key={f.id}
                className="p-3.5 bg-zinc-900 border border-white/5 rounded-2xl flex justify-between items-center gap-4 hover:border-white/10 transition-all"
              >
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">FACE ELEMENT: {f.feature}</span>
                  
                  {/* Digital feature control frame */}
                  <div className="inline-flex items-stretch border border-sky-500 text-sky-450 bg-sky-500/5 font-mono text-[11px] font-bold uppercase rounded-md overflow-hidden">
                    <span className="border-r border-sky-500 px-2 py-1 select-none text-[12px]">{f.symbol}</span>
                    <span className="border-r border-sky-500 px-2 py-1 select-none">Ø {f.tolerance}{f.modifier !== 'none' ? ` (${f.modifier})` : ''}</span>
                    {f.datumA && <span className="border-r border-sky-500 px-2 py-1">{f.datumA}</span>}
                    {f.datumB && <span className="border-r border-sky-500 px-2 py-1">{f.datumB}</span>}
                    {f.datumC && <span className="px-2 py-1">{f.datumC}</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFrame(f.id)}
                  className="text-[8px] font-mono text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-500/10 hover:border-red-500/30 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Block with Print Trigger */}
      <div className="p-6 border-t border-white/5 bg-black/60 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[8.5px] text-zinc-500">
          <Layers size={13} className="text-zinc-650" />
          <span className="uppercase tracking-widest">ASME Y14.5 CORE GENERATED LOG</span>
        </div>

        <button
          onClick={handleExportDrawing}
          disabled={exporting}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 hover:shadow-[0_0_15px_rgba(14,165,233,0.45)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2 font-sans"
        >
          {exporting ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> EXPORTING BLUEPRINT...
            </>
          ) : (
            <>
              <Printer size={14} /> EXPORT ASME Y14.5 SPEC PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};
