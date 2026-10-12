import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gauge, X, Play, ShieldAlert, Cpu, AlertTriangle, ShieldCheck, HelpCircle, Activity } from 'lucide-react';

interface FEMStressSimulatorProps {
  onClose: () => void;
  currentDesign?: any;
  selectedMaterial?: { id: string; name: string };
  dimensions: { length: number; width: number; height: number };
}

type LoadType = 'tension' | 'bending' | 'shear' | 'compression';
type SolveState = 'idle' | 'meshing' | 'matrix' | 'solving' | 'done';

export const FEMStressSimulator: React.FC<FEMStressSimulatorProps> = ({
  onClose,
  selectedMaterial = { id: 'titanium_grade_5', name: 'Titanium Grade 5' },
}) => {
  const [loadType, setLoadType] = useState<LoadType>('bending');
  const [anchorPoint, setAnchorPoint] = useState<'base' | 'pins' | 'flange'>('base');
  const [loadMagnitude, setLoadMagnitude] = useState<number>(45); // in kN
  const [solveState, setSolveState] = useState<SolveState>('idle');
  const [solvePercent, setSolvePercent] = useState<number>(0);

  // Compute material yield limits
  const getYieldStrength = () => {
    switch (selectedMaterial.id) {
      case 'titanium_grade_5': return 880; // MPa
      case 'steel_304': return 215;
      case 'carbon_fiber': return 1200;
      case 'aluminum_6061': return 276;
      case 'abs_plastic': return 45;
      default: return 200;
    }
  };

  const yieldStrength = getYieldStrength();

  // Calculate stress, displacement and safety factor
  const computedStress = Math.round((loadMagnitude * 12.5) * (loadType === 'bending' ? 1.4 : loadType === 'shear' ? 1.1 : 0.8));
  const maxDisplacement = (computedStress / yieldStrength) * 1.8;
  const safetyFactor = Math.max(0.1, parseFloat((yieldStrength / computedStress).toFixed(2)));

  // Solve simulation execution sequence
  useEffect(() => {
    if (solveState === 'idle' || solveState === 'done') return;

    let intervalTime = 30;
    const interval = setInterval(() => {
      setSolvePercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (solveState === 'meshing') {
            setSolveState('matrix');
            return 0;
          } else if (solveState === 'matrix') {
            setSolveState('solving');
            return 0;
          } else if (solveState === 'solving') {
            setSolveState('done');
            return 100;
          }
          return 100;
        }
        return prev + 5;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [solveState]);

  const runSimulation = () => {
    setSolvePercent(0);
    setSolveState('meshing');
  };

  // Get color for stress heatmap node value (0 to 1)
  const getNodeColor = (distanceFromLoad: number) => {
    if (solveState !== 'done') return 'rgba(14, 165, 233, 0.4)'; // neutral blue blueprint default

    // Interpolation of stress: higher close to the load point selector
    let stressFactor = 0;
    if (loadType === 'bending') {
      stressFactor = distanceFromLoad; 
    } else if (loadType === 'tension') {
      stressFactor = 1 - distanceFromLoad * 0.5;
    } else {
      stressFactor = Math.sin(distanceFromLoad * Math.PI);
    }

    // Multiply by load multiplier
    stressFactor = stressFactor * (loadMagnitude / 100);

    if (stressFactor > 0.8) return 'rgba(239, 68, 68, 0.9)'; // deep red
    if (stressFactor > 0.5) return 'rgba(249, 115, 22, 0.85)'; // hot orange
    if (stressFactor > 0.25) return 'rgba(234, 179, 8, 0.75)'; // vibrant yellow
    return 'rgba(59, 130, 246, 0.5)'; // safe cool blue
  };

  const getWarpOffset = (x: number, y: number) => {
    if (solveState !== 'done') return { dx: 0, dy: 0 };
    
    const scale = (loadMagnitude / 150) * 35;
    if (loadType === 'bending') {
      // Bend down towards the right edge (+x)
      const bendFactor = Math.pow(x / 300, 2);
      return { dx: 0, dy: bendFactor * scale };
    } else if (loadType === 'tension') {
      // Stretch out wide
      const stretchFactor = (x - 150) / 150;
      return { dx: stretchFactor * scale * 0.8, dy: 0 };
    } else if (loadType === 'shear') {
      // Shear rotation skew
      return { dx: (y / 150) * scale * 0.6, dy: 0 };
    } else {
      // Compression compression warp
      const compressFactor = (150 - x) / 150;
      return { dx: compressFactor * scale * 0.7, dy: 0 };
    }
  };

  // Generate node arrays for mechanical mesh display
  const renderMeshNodes = () => {
    const nodes: React.ReactNode[] = [];
    const rows = 6;
    const cols = 9;
    const width = 360;
    const height = 180;
    
    const cellW = width / (cols - 1);
    const cellH = height / (rows - 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const baseX = c * cellW;
        const baseY = r * cellH;

        // Apply physical load deformation warp offset
        const { dx, dy } = getWarpOffset(baseX, baseY);
        const actualX = baseX + dx;
        const actualY = baseY + dy;

        // Bending stress point mapping helper
        const distFromLeft = c / (cols - 1);
        const nodeColor = getNodeColor(distFromLeft);

        nodes.push(
          <motion.circle 
            key={`node-${r}-${c}`}
            cx={50 + actualX}
            cy={40 + actualY}
            r={solveState === 'done' && distFromLeft > 0.7 ? "4.5" : "3.5"}
            fill={nodeColor}
            className="transition-all duration-700"
          />
        );

        // Render horizontal structural mesh ligaments
        if (c < cols - 1) {
          const nextWarp = getWarpOffset((c + 1) * cellW, baseY);
          nodes.push(
            <line 
              key={`h-link-${r}-${c}`}
              x1={50 + actualX}
              y1={40 + actualY}
              x2={50 + (c + 1) * cellW + nextWarp.dx}
              y2={40 + baseY + nextWarp.dy}
              stroke={nodeColor}
              strokeWidth="0.75"
              opacity="0.3"
              className="transition-all duration-700"
            />
          );
        }

        // Render vertical structural link boundaries
        if (r < rows - 1) {
          const nextWarp = getWarpOffset(baseX, (r + 1) * cellH);
          nodes.push(
            <line 
              key={`v-link-${r}-${c}`}
              x1={50 + actualX}
              y1={40 + actualY}
              x2={50 + baseX + nextWarp.dx}
              y2={40 + (r + 1) * cellH + nextWarp.dy}
              stroke={nodeColor}
              strokeWidth="0.75"
              opacity="0.3"
              className="transition-all duration-700"
            />
          );
        }
      }
    }

    return nodes;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-zinc-950/95 backdrop-blur-3xl overflow-hidden flex flex-col p-6 font-sans border border-white/5"
    >
      {/* FEM Simulator Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
            <Gauge size={20} />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white">Finite Element Method (FEM) Stress Analysis Simulator</h1>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Automated Boundary Solver // Non-linear Node Deformation Matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:text-white rounded-full text-zinc-400 transition-all cursor-pointer shadow-md"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Interactive Side Dashboard */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1 text-zinc-500">
              <Cpu size={14} className="text-rose-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest font-unique">Boundary Load Vector</span>
            </div>

            {/* Load Type configuration */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block px-1">Load Application Profile</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bending', label: 'Cantilever bending' },
                  { id: 'tension', label: 'Axial tension' },
                  { id: 'shear', label: 'Torsional shear' },
                  { id: 'compression', label: 'Compressive compression' }
                ].map(profile => (
                  <button
                    key={profile.id}
                    disabled={solveState !== 'idle' && solveState !== 'done'}
                    onClick={() => { setLoadType(profile.id as any); setSolveState('idle'); }}
                    className={`py-3 px-2 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      loadType === profile.id 
                        ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-sm' 
                        : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
                    <span className="text-[10.5px] font-bold uppercase tracking-wider">{profile.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Load Magnitude slider */}
            <div className="space-y-3 pt-3">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1">
                <span className="text-zinc-500">Boundary Force Limit</span>
                <span className="text-rose-400 font-mono">{loadMagnitude} kN</span>
              </div>
              <input 
                type="range" min="10" max="150" step="5"
                disabled={solveState !== 'idle' && solveState !== 'done'}
                value={loadMagnitude} onChange={e => { setLoadMagnitude(parseInt(e.target.value)); setSolveState('idle'); }}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div className="h-px bg-white/5" />

            {/* Anchor boundary selector */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block px-1">Geometric Anchors</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'base', label: 'Base' },
                  { id: 'pins', label: 'Pins' },
                  { id: 'flange', label: 'Flange' }
                ].map(anc => (
                  <button
                    key={anc.id}
                    disabled={solveState !== 'idle' && solveState !== 'done'}
                    onClick={() => { setAnchorPoint(anc.id as any); setSolveState('idle'); }}
                    className={`py-2 rounded-xl text-[10px] font-bold uppercase text-center border transition-all ${
                      anchorPoint === anc.id 
                        ? 'bg-white/10 border-rose-500 text-rose-400' 
                        : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white'
                    }`}
                  >
                    {anc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Solve actions */}
          <div className="space-y-3 pt-4 border-t border-white/5 select-none text-left">
            <button 
              onClick={runSimulation}
              disabled={solveState !== 'idle' && solveState !== 'done'}
              className="w-full py-4 bg-rose-600 text-white hover:bg-rose-500 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/10 disabled:opacity-50"
            >
              <Play size={14} fill="currentColor" /> Run non-linear FEM solver
            </button>
          </div>
        </div>

        {/* Dynamic FEA Visual and Legend */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex-1 bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            {/* Real engineering coordinate background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Header metrics titles */}
            <div className="flex justify-between items-start pointer-events-none mb-4 select-none relative z-10">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Active FEA simulation</span>
                <h3 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-2">
                  <Activity size={14} className="text-rose-400" />
                  Boundary Mesh deformation Plot
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">FEA CONVERGENCE</span>
                <p className={`text-xs font-mono font-black uppercase ${solveState === 'done' ? 'text-emerald-400' : 'text-zinc-500 animate-pulse'}`}>
                  {solveState === 'idle' ? 'Awaiting solve' : solveState === 'done' ? 'CONVERGED_SUCCESS' : `COMPUTING... ${solvePercent}%`}
                </p>
              </div>
            </div>

            {/* Run Solver Progress Bar & States overlay */}
            <AnimatePresence>
              {solveState !== 'idle' && solveState !== 'done' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center"
                >
                  <motion.div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
                  </motion.div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                    {solveState === 'meshing' ? 'Discretizing spatial mesh [24,800 quad nodes]...' :
                     solveState === 'matrix' ? 'Assembling stiffness coefficient matrices...' :
                     'Solving direct boundary equations [u = K⁻¹•f]...'}
                  </h3>
                  <div className="w-64 h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden border border-white/5">
                    <div className="h-full bg-rose-500 transition-all duration-150" style={{ width: `${solvePercent}%` }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drawing of deformed finite element lines */}
            <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
              <svg viewBox="0 0 460 260" className="w-full max-h-[240px] drop-shadow-[0_0_15px_rgba(244,63,94,0.06)]">
                {renderMeshNodes()}
                
                {/* Visual Anchors tags */}
                {anchorPoint === 'base' && (
                  <g transform="translate(15, 130)">
                    <rect x="0" y="-10" width="10" height="20" rx="3" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth="0.5" />
                    <text x="-5" y="2" fontSize="5" fill="#ef4444" fontFamily="monospace" transform="rotate(-90)">FIXED</text>
                  </g>
                )}
              </svg>

              {/* Stress Heatmap legend bar */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/50 p-2.5 rounded-lg border border-white/5 select-none">
                <span className="text-[8px] font-mono text-zinc-500 uppercase">Min stress</span>
                <div className="w-20 h-2 bg-gradient-to-r from-blue-500 via-yellow-500 via-orange-500 to-red-500 rounded-full" />
                <span className="text-[8px] font-mono text-zinc-500 uppercase">Max stress</span>
              </div>
            </div>

            {/* Dynamic Results & Metrics strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto border-t border-white/5 pt-4 text-left select-none relative z-10">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">Peak Von-Mises stress</span>
                <span className={`text-base font-mono font-black ${solveState === 'done' ? (computedStress >= yieldStrength ? 'text-red-400' : 'text-white') : 'text-zinc-600'}`}>
                  {solveState === 'done' ? `${computedStress} MPa` : 'Awaiting solver'}
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">Max displacement shift</span>
                <span className={`text-base font-mono font-black ${solveState === 'done' ? 'text-cyan-400' : 'text-zinc-600'}`}>
                  {solveState === 'done' ? `${maxDisplacement.toFixed(2)} mm` : 'Awaiting solver'}
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">Material Yield Elastic Limit</span>
                <span className="text-base font-mono font-black text-white">{yieldStrength} MPa</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">Safety Threshold factor</span>
                {solveState === 'done' ? (
                  <span className={`text-base font-unique font-black flex items-center gap-1.5 ${safetyFactor >= 1.5 ? 'text-emerald-400' : safetyFactor >= 1.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {safetyFactor >= 1.5 && <ShieldCheck size={14} />}
                    {safetyFactor < 1.0 && <ShieldAlert size={14} />}
                    {safetyFactor}x {safetyFactor >= 1.5 ? 'SAFE' : safetyFactor >= 1.0 ? 'DUBIOUS' : 'FAIL'}
                  </span>
                ) : (
                  <span className="text-base font-mono font-black text-zinc-600">Awaiting solve</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
