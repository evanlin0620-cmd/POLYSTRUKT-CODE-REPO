import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, X, Grid3X3, SlidersHorizontal, ToggleLeft, ToggleRight, LayoutGrid, Ruler } from 'lucide-react';

interface OrthographicSchematicViewerProps {
  onClose: () => void;
  currentDesign?: any;
  selectedMaterial?: { id: string; name: string };
  dimensions: { length: number; width: number; height: number };
}

export const OrthographicSchematicViewer: React.FC<OrthographicSchematicViewerProps> = ({
  onClose,
  currentDesign,
  dimensions,
}) => {
  const [layers, setLayers] = useState({
    dimensions: true,
    mesh: true,
    stress: false,
    conduits: true,
  });

  const [clippingPlane, setClippingPlane] = useState<number>(0); // 0 to 100%
  const [zoomFactor, setZoomFactor] = useState<number>(1); // 0.5 to 1.5

  // Identify current specimen profile to render customized aesthetic schematics
  const designTitle = currentDesign?.specs?.includes("Turbine Housing") ? "TURBINE_HOUSING" :
                      currentDesign?.specs?.includes("Bracket") ? "SUSPENSION_BRACKET" :
                      currentDesign?.specs?.includes("Piston") ? "FORGED_PISTON" :
                      currentDesign?.specs?.includes("Exchanger") ? "HEAT_EXCHANGER" : "STRUCTURAL_SPECIMEN";

  // Schematic rendering helpers based on currentDesign spec
  const renderSpecimenSVG = (view: 'top' | 'front' | 'side' | 'isometric') => {
    const scale = zoomFactor * 0.9;
    const baseColor = "rgba(14, 165, 233, 0.75)"; // cyano draftsman
    const meshColor = "rgba(16, 185, 129, 0.4)"; // emerald
    const conduitColor = "rgba(244, 63, 94, 0.7)"; // rose
    
    // Set clipping mask logic based on interactive clippingPlane slider
    const clipAmount = clippingPlane * 2.4; 

    // Render Turbine Housing Projections
    if (designTitle === "TURBINE_HOUSING") {
      if (view === 'top') {
        return (
          <g transform={`scale(${scale}) translate(120, 120)`}>
            {/* Outline */}
            <circle cx="0" cy="0" r="80" fill="none" stroke={baseColor} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="50" fill="none" stroke={baseColor} strokeWidth="1" strokeDasharray="3,3" />
            {/* Center crosshair */}
            <line x1="-95" y1="0" x2="95" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="8,4" />
            <line x1="0" y1="-95" x2="0" y2="95" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="8,4" />

            {/* FE Mesh Layer */}
            {layers.mesh && (
              <g stroke={meshColor} strokeWidth="0.5" fill="none">
                <line x1="-80" y1="0" x2="80" y2="0" />
                <line x1="0" y1="-80" x2="0" y2="80" />
                <polygon points="-56,-56 56,-56 56,56 -56,56" />
                <polygon points="0,-80 56,-56 80,0 56,56 0,80 -56,56 -80,0 -56,-56" />
              </g>
            )}

            {/* Internal Conduits Volute */}
            {layers.conduits && (
              <path d="M 0 0 C 40 10, 60 40, 50 65" fill="none" stroke={conduitColor} strokeWidth="2.5" strokeDasharray="4,4" />
            )}

            {/* Dimension Callouts */}
            {layers.dimensions && (
              <g fontSize="8" fill="rgba(255,255,255,0.4)" stroke="none" fontFamily="monospace">
                <line x1="-80" y1="-90" x2="80" y2="-90" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <line x1="-80" y1="-85" x2="-80" y2="-95" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <line x1="80" y1="-85" x2="80" y2="-95" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <text x="-35" y="-95">Ø 160.00 mm (Bore)</text>
              </g>
            )}

            {/* Dynamic Clip Mask overlay */}
            {clipAmount > 0 && (
              <rect x="-100" y="-100" width={clipAmount} height="200" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeDasharray="2,2" />
            )}
          </g>
        );
      } else if (view === 'front') {
        return (
          <g transform={`scale(${scale}) translate(120, 120)`}>
            <rect x="-60" y="-40" width="120" height="80" rx="4" fill="none" stroke={baseColor} strokeWidth="1.5" />
            <line x1="-60" y1="0" x2="60" y2="0" stroke={baseColor} strokeWidth="1" strokeDasharray="3,3" />

            {layers.mesh && (
              <g stroke={meshColor} strokeWidth="0.5" fill="none">
                <line x1="-60" y1="-20" x2="60" y2="-20" />
                <line x1="-60" y1="20" x2="60" y2="20" />
                <line x1="-30" y1="-40" x2="-30" y2="40" />
                <line x1="30" y1="-40" x2="30" y2="40" />
              </g>
            )}

            {layers.conduits && (
              <rect x="-40" y="-10" width="80" height="20" fill="none" stroke={conduitColor} strokeWidth="2" strokeDasharray="3,3" />
            )}

            {layers.dimensions && (
              <g fontSize="8" fill="rgba(255,255,255,0.4)" stroke="none" fontFamily="monospace">
                <text x="65" y="5">H: 80.00 mm</text>
              </g>
            )}
          </g>
        );
      } else if (view === 'side') {
        return (
          <g transform={`scale(${scale}) translate(120, 120)`}>
            <polygon points="-40,-40 40,-40 25,40 -25,40" fill="none" stroke={baseColor} strokeWidth="1.5" />

            {layers.mesh && (
              <g stroke={meshColor} strokeWidth="0.5" fill="none">
                <line x1="-15" y1="-40" x2="15" y2="40" />
                <line x1="15" y1="-40" x2="-15" y2="40" />
              </g>
            )}

            {layers.dimensions && (
              <g fontSize="8" fill="rgba(255,255,255,0.4)" stroke="none" fontFamily="monospace">
                <text x="-35" y="55">W: 80.00 mm</text>
              </g>
            )}
          </g>
        );
      } else {
        // Isometric wireframe representation
        return (
          <g transform={`scale(${scale}) translate(120, 120)`}>
            <polygon points="0,-45 55,-20 0,15 -55,-20" fill="none" stroke={baseColor} strokeWidth="1.2" />
            <polygon points="0,15 55,40 0,75 -55,40" fill="none" stroke={baseColor} strokeWidth="1.2" />
            <line x1="-55" y1="-20" x2="-55" y2="40" stroke={baseColor} strokeWidth="1.2" />
            <line x1="55" y1="-20" x2="55" y2="40" stroke={baseColor} strokeWidth="1.2" />
            <line x1="0" y1="-45" x2="0" y2="15" stroke={baseColor} strokeWidth="1.2" />

            {layers.conduits && (
              <ellipse cx="0" cy="15" rx="20" ry="10" fill="none" stroke={conduitColor} strokeWidth="1.5" strokeDasharray="2,2" />
            )}
          </g>
        );
      }
    }

    // Default High-Fidelity Draftsman Block (fits any customized engineering mesh)
    return (
      <g transform={`scale(${scale}) translate(120, 120)`}>
        <rect x="-55" y="-55" width="110" height="110" fill="none" stroke={baseColor} strokeWidth="1.5" rx="8" />
        <circle cx="0" cy="0" r="35" fill="none" stroke={baseColor} strokeWidth="1" />
        {/* Dynamic design guides */}
        <line x1="-70" y1="0" x2="70" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="6,3" />
        <line x1="0" y1="-70" x2="0" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="6,3" />

        {layers.mesh && (
          <g stroke={meshColor} strokeWidth="0.5" fill="none">
            <line x1="-55" y1="-55" x2="55" y2="55" />
            <line x1="-55" y1="55" x2="55" y2="-55" />
            <circle cx="0" cy="0" r="48" strokeDasharray="2,2" />
          </g>
        )}

        {layers.conduits && (
          <path d="M -25 -25 L 25 -25 L 25 25 L -25 25 Z" fill="none" stroke={conduitColor} strokeWidth="1.5" strokeDasharray="4,2" />
        )}

        {layers.dimensions && (
          <g fontSize="8" fill="rgba(255,255,255,0.35)" stroke="none" fontFamily="monospace">
            <text x="-48" y="-62">L: {dimensions.length}.00 mm</text>
            <text x="35" y="72">Z: {dimensions.height} mm</text>
          </g>
        )}
      </g>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-zinc-950/95 backdrop-blur-3xl overflow-hidden flex flex-col p-6 font-sans border border-white/5"
    >
      {/* Schematic Viewer Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white">Multi-Layered Orthographic Schematic Viewer</h1>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Automated Technical Projections // Multi-Layer Draftsman Deck</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 bg-white/5 border border-white/10 hover:bg-sky-500/20 hover:text-white rounded-full text-zinc-400 transition-all cursor-pointer shadow-md"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side Schematic Settings Card */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Layers Configuration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1 text-zinc-400">
                <Layers size={14} className="text-sky-400" />
                <span className="text-[10px] font-black uppercase tracking-widest font-unique">Drafting Blueprint Layers</span>
              </div>
              <p className="text-[9px] font-mono text-zinc-500 uppercase px-1 leading-relaxed">Toggle vector blueprint graphics in real-time</p>
              
              <div className="space-y-2">
                {[
                  { id: 'dimensions', label: 'Millimeter Annotations', color: 'text-sky-400 border-sky-400/20 bg-sky-400/5' },
                  { id: 'mesh', label: 'Finite Element Triangulation', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' },
                  { id: 'conduits', label: 'Internal Conduit Routings', color: 'text-rose-400 border-rose-400/20 bg-rose-400/5' },
                ].map(layerSpec => (
                  <button
                    key={layerSpec.id}
                    onClick={() => setLayers(prev => ({ ...prev, [layerSpec.id]: !prev[layerSpec.id as keyof typeof prev] }))}
                    className={`w-full flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                      layers[layerSpec.id as keyof typeof layers] 
                        ? layerSpec.color
                        : 'border-white/5 hover:border-white/10 text-zinc-500'
                    }`}
                  >
                    <span className="text-[10.5px] font-bold uppercase tracking-wide">{layerSpec.label}</span>
                    <span className="text-[10px] font-mono leading-none">{layers[layerSpec.id as keyof typeof layers] ? 'ACTIVE' : 'MUTED'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Slider controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1 text-zinc-400">
                <Ruler size={14} className="text-sky-400" />
                <span className="text-[10px] font-black uppercase tracking-widest font-unique">Cross-Section clipping</span>
              </div>

              {/* Zoom slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-zinc-500">Drafting Scale</span>
                  <span className="text-sky-400 font-mono">{(zoomFactor * 100).toFixed(0)} %</span>
                </div>
                <input 
                  type="range" min="0.5" max="1.5" step="0.1"
                  value={zoomFactor} onChange={e => setZoomFactor(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              {/* Section plane dynamic clipping */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-zinc-500">Cross-Section depth</span>
                  <span className="text-rose-400 font-mono">{clippingPlane}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={clippingPlane} onChange={e => setClippingPlane(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-xl text-[10px] text-zinc-400 leading-relaxed italic">
            This viewport renders normalized orthographic elevations (Top, Front, Side) derived directly from the loaded CAD coordinate system buffers.
          </div>
        </div>

        {/* 2x2 Orthographic Draftsman Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'top', title: 'Plan Location View (X-Y Plane / TOP)' },
            { id: 'front', title: 'Front Elevation View (X-Z Plane / FRONT)' },
            { id: 'side', title: 'Left Elevation View (Y-Z Plane / SIDE)' },
            { id: 'isometric', title: 'Auxiliary Perspective (Wireframe / ISO)' },
          ].map(viewSpec => (
            <div 
              key={viewSpec.id}
              className="bg-black/60 border border-sky-500/10 rounded-2xl p-4 flex flex-col relative overflow-hidden h-[260px] group transition-all hover:border-sky-500/20"
            >
              {/* Draftsman Blueprint Grids background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e908_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e908_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* View title label */}
              <div className="flex justify-between items-center select-none relative z-10 mb-2">
                <span className="text-[10px] font-black uppercase text-sky-400/80 tracking-widest font-mono">{viewSpec.title}</span>
                <span className="text-[8px] font-mono text-zinc-600">UNIT: MM</span>
              </div>

              {/* Projection Canvas render container */}
              <div className="flex-1 flex items-center justify-center relative pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 240 240" fill="none" stroke="currentColor">
                  {renderSpecimenSVG(viewSpec.id as any)}
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
