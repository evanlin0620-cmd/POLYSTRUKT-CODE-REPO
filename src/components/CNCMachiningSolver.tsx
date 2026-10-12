import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Cpu,
  Settings,
  Compass,
  DollarSign,
  Activity,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Download,
  Gauge,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { proceduralSpecToGCode } from '../lib/cadCodeConverter';

interface CNCMachiningSolverProps {
  onClose: () => void;
  selectedMaterial: any;
  dimensions: { length: number; width: number; height: number };
  proceduralSpec?: any;
}

// Preset optimum ranges per material for realistic calculations
const MATERIAL_CNC_PRESETS: Record<
  string,
  { cuttingSpeed: number; feedPerTooth: number; densityKgM3: number; specificForceKc: number }
> = {
  titanium_grade_5: { cuttingSpeed: 60, feedPerTooth: 0.05, densityKgM3: 4430, specificForceKc: 2800 },
  steel_304: { cuttingSpeed: 90, feedPerTooth: 0.08, densityKgM3: 8000, specificForceKc: 2100 },
  carbon_fiber: { cuttingSpeed: 180, feedPerTooth: 0.12, densityKgM3: 1600, specificForceKc: 1100 },
  aluminum_6061: { cuttingSpeed: 300, feedPerTooth: 0.15, densityKgM3: 2700, specificForceKc: 800 },
  abs_plastic: { cuttingSpeed: 450, feedPerTooth: 0.25, densityKgM3: 1040, specificForceKc: 450 },
};

export const CNCMachiningSolver: React.FC<CNCMachiningSolverProps> = ({
  onClose,
  selectedMaterial,
  dimensions,
  proceduralSpec,
}) => {
  const materialKey = selectedMaterial?.id || 'aluminum_6061';
  const preset = MATERIAL_CNC_PRESETS[materialKey] || MATERIAL_CNC_PRESETS.aluminum_6061;

  // View tabs
  const [activeTab, setActiveTab] = useState<'parameters' | 'simulation'>('parameters');

  // Parameters State
  const [cutterDiameter, setCutterDiameter] = useState<number>(10); // mm
  const [flutes, setFlutes] = useState<number>(4);
  const [cuttingSpeed, setCuttingSpeed] = useState<number>(preset.cuttingSpeed); // Vc (m/min)
  const [feedPerTooth, setFeedPerTooth] = useState<number>(preset.feedPerTooth); // fz (mm/tooth)
  const [axialDepth, setAxialDepth] = useState<number>(3); // ap (mm)
  const [radialWidth, setRadialWidth] = useState<number>(5); // ae (mm)
  const [shopRate, setShopRate] = useState<number>(85); // $/hour

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);

  // Automatically update presets when selectedMaterial changes
  useEffect(() => {
    setCuttingSpeed(preset.cuttingSpeed);
    setFeedPerTooth(preset.feedPerTooth);
  }, [selectedMaterial]);

  // Calculations
  // Spindle Speed (N) in RPM: N = (Vc * 1000) / (pi * Dc)
  const spindleSpeed = Math.round((cuttingSpeed * 1000) / (Math.PI * cutterDiameter));

  // Feed Rate (Ff) in mm/min: Ff = N * z * fz
  const feedRate = Math.round(spindleSpeed * flutes * feedPerTooth);

  // Material Removal Rate (MRR) in cm³/min: MRR = (ap * ae * Ff) / 1000
  const mrr = parseFloat(((axialDepth * radialWidth * feedRate) / 1000).toFixed(2));

  // Cutting Power (kW) = (MRR * kc) / (60 * 10^3 * efficiency)
  const cuttingPowerKw = parseFloat(((mrr * preset.specificForceKc) / (60 * 1000 * 0.85)).toFixed(2));
  // Cutting Torque (Nm) = (Power in W * 60) / (2 * pi * N)
  const cuttingTorqueNm = spindleSpeed > 0 ? parseFloat(((cuttingPowerKw * 1000 * 60) / (2 * Math.PI * spindleSpeed)).toFixed(2)) : 0;

  // Envelope Volume (cm³): length * width * height / 1000
  const totalVolumeCm3 = (dimensions.length * dimensions.width * dimensions.height) / 1000;
  // Assume we are machining away 45% of the initial block to create the CAD shape
  const volumesMachinedCm3 = totalVolumeCm3 * 0.45;

  // Estimated Machining time (minutes) = Vol removed / MRR
  const machiningTimeMins = mrr > 0 ? parseFloat((volumesMachinedCm3 / mrr).toFixed(2)) : 0;

  // Machining Cost: Time * Shop Rate + flat setup and tooling wear cost
  const rawCost = machiningTimeMins * (shopRate / 60);
  const toolingWearCost = 15.0;
  const setupFlatCost = 45.0;
  const totalCost = parseFloat((rawCost + toolingWearCost + setupFlatCost).toFixed(2));

  // Generate G-Code program
  const gcodeText = proceduralSpecToGCode(proceduralSpec, {
    materialName: selectedMaterial?.name || 'Aluminum 6061-T6',
    spindleRpm: spindleSpeed,
    feedRate: feedRate,
    toolDiameter: cutterDiameter,
  });

  const gcodeLines = gcodeText.split('\n');

  // Simulation loop
  useEffect(() => {
    let timer: any;
    if (isSimulating) {
      timer = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            return 100;
          }
          const next = prev + 0.5 * simSpeedMultiplier;
          const lineIdx = Math.floor((next / 100) * (gcodeLines.length - 1));
          setCurrentLineIndex(lineIdx);
          return next;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isSimulating, simSpeedMultiplier, gcodeLines.length]);

  // Derived Spindle Coordinates for 2D/3D visual canvas
  const simAngle = (simProgress * 0.1) * Math.PI * 4;
  const currentX = (Math.cos(simAngle) * (dimensions.length * 0.35)).toFixed(2);
  const currentY = (Math.sin(simAngle * 1.5) * (dimensions.width * 0.35)).toFixed(2);
  const currentZ = (-(simProgress / 100) * dimensions.height * 0.8).toFixed(2);

  const handleDownloadGCode = () => {
    const blob = new Blob([gcodeText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `polystrukt_${materialKey}_program.nc`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 font-sans"
    >
      <div className="bg-zinc-950 border border-cyan-500/30 w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col rounded-2xl shadow-3xl shadow-cyan-500/10">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="p-1 px-2.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-cyan-500/30">
              <Compass size={10} className="animate-spin" /> CNC CONTROLLER
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wider uppercase font-unique flex items-center gap-2">
                CNC Machining & Toolpath Simulation Engine
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">
                Material: {selectedMaterial?.name || 'Aluminum 6061'} • Tool: Ø{cutterDiameter}mm {flutes}F Endmill
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switch */}
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('parameters')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                  activeTab === 'parameters'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Parameters & Rates
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'simulation'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap size={10} className="text-cyan-400" /> Toolpath Simulation
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm uppercase font-mono tracking-widest cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'parameters' ? (
            /* PARAMETERS & COST VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: SLIDERS & PARAMETERS */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl space-y-4">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block font-unique border-b border-white/5 pb-2">
                    Tool & Cutter Settings
                  </span>

                  {/* Cutter Diameter slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Cutter Diameter (mm)</span>
                      <span className="font-mono font-bold text-white">{cutterDiameter} mm</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={cutterDiameter}
                      onChange={(e) => setCutterDiameter(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Cutter Flutes Choice */}
                  <div className="space-y-2">
                    <span className="text-xs text-zinc-400 block">Flute Count (z)</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFlutes(f)}
                          className={`py-2 rounded-lg font-mono text-xs border transition-all ${
                            flutes === f
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold'
                              : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                          }`}
                        >
                          {f} Flutes
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl space-y-4">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block font-unique border-b border-white/5 pb-2">
                    Speed, Feed & Cutting Envelope
                  </span>

                  {/* Cutting Speed slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Surface Cutting Speed Vc (m/min)</span>
                      <span className="font-mono font-bold text-white">{cuttingSpeed} m/min</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={600}
                      value={cuttingSpeed}
                      onChange={(e) => setCuttingSpeed(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-[9px] text-zinc-500 block">
                      Typical range for {selectedMaterial?.name}: {preset.cuttingSpeed} m/min
                    </span>
                  </div>

                  {/* Feed per Tooth slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Feed per Tooth fz (mm/tooth)</span>
                      <span className="font-mono font-bold text-white">{feedPerTooth.toFixed(2)} mm</span>
                    </div>
                    <input
                      type="range"
                      min={0.01}
                      max={0.5}
                      step={0.01}
                      value={feedPerTooth}
                      onChange={(e) => setFeedPerTooth(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Axial & Radial Depth */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Axial ap (mm)</span>
                        <span className="font-mono text-white text-[11px] font-bold">{axialDepth} mm</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={12}
                        step={0.5}
                        value={axialDepth}
                        onChange={(e) => setAxialDepth(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Radial ae (mm)</span>
                        <span className="font-mono text-white text-[11px] font-bold">{radialWidth} mm</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={30}
                        step={0.5}
                        value={radialWidth}
                        onChange={(e) => setRadialWidth(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block font-unique">
                      Shop Labor Rate
                    </span>
                    <span className="font-mono text-xs text-white">${shopRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={250}
                    value={shopRate}
                    onChange={(e) => setShopRate(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              {/* RIGHT: COMPUTATIONAL READOUT */}
              <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-5">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block font-unique border-b border-white/5 pb-2">
                    Live Controller Readout & Spindle Dynamics
                  </span>

                  {/* RPM & FEED */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Spindle Speed</span>
                      <div className="text-lg font-bold font-mono text-white mt-1">
                        {spindleSpeed.toLocaleString()}
                      </div>
                      <span className="text-[8px] text-cyan-500 block">RPM</span>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Table Feed-Rate</span>
                      <div className="text-lg font-bold font-mono text-white mt-1">
                        {feedRate.toLocaleString()}
                      </div>
                      <span className="text-[8px] text-cyan-500 block">mm/min</span>
                    </div>
                  </div>

                  {/* POWER & TORQUE */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Cutting Power</span>
                      <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                        {cuttingPowerKw} kW
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Spindle Torque</span>
                      <div className="text-base font-bold font-mono text-purple-300 mt-0.5">
                        {cuttingTorqueNm} N·m
                      </div>
                    </div>
                  </div>

                  {/* PHYS & MATERIAL REMOVAL */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-zinc-400">Removal Rate (MRR)</span>
                      <span className="font-mono font-bold text-white">{mrr} cm³/min</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-zinc-400">Total Material Removed</span>
                      <span className="font-mono font-bold text-white">{volumesMachinedCm3.toFixed(1)} cm³</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-zinc-400">Estimated Duration</span>
                      <span className="font-mono font-bold text-emerald-400">{machiningTimeMins} mins</span>
                    </div>
                  </div>

                  {/* TOTAL ESTIMATED JOB COST */}
                  <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl space-y-1.5">
                    <span className="text-[9px] text-cyan-400 uppercase font-black block tracking-widest font-unique">
                      Manufacturing Cost Estimate
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-zinc-400 text-xs">Total Job Cost:</span>
                      <span className="text-2xl font-black font-mono text-cyan-400">${totalCost.toFixed(2)}</span>
                    </div>
                    <div className="text-[8px] text-zinc-500 leading-relaxed font-mono">
                      Setup: $45.00 | Wear: $15.00 | Labor: ${(machiningTimeMins * (shopRate / 60)).toFixed(2)} (${shopRate}/hr)
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('simulation');
                        setIsSimulating(true);
                      }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={13} className="fill-current" /> Run Toolpath Simulation
                    </button>
                    <button
                      onClick={handleDownloadGCode}
                      className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-white/10 rounded-xl text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer"
                      title="Download ISO G-Code (.nc)"
                    >
                      <Download size={13} /> G-Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TOOLPATH SIMULATION VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT: 2D/3D TOOLPATH CANVAS & DIGITAL READOUT */}
              <div className="lg:col-span-7 space-y-4">
                {/* Visual CNC Bed & Spindle Simulator */}
                <div className="relative aspect-[16/10] bg-zinc-950 border border-cyan-500/30 rounded-2xl overflow-hidden flex items-center justify-center p-4">
                  {/* Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Workpiece outline */}
                  <div
                    className="relative border-2 border-cyan-500/40 bg-cyan-950/20 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all"
                    style={{
                      width: `${Math.min(260, dimensions.length * 4)}px`,
                      height: `${Math.min(180, dimensions.width * 4)}px`,
                    }}
                  >
                    <span className="absolute top-2 left-2 text-[8px] font-mono text-cyan-400/80 uppercase">
                      Stock: {dimensions.length}×{dimensions.width}×{dimensions.height}mm
                    </span>

                    {/* Simulated Toolpath Contours */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 180">
                      <rect x="20" y="20" width="220" height="140" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                      <circle cx="130" cy="90" r="45" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.6" />
                      <path
                        d="M 30,30 L 230,30 L 230,150 L 30,150 Z"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        opacity="0.7"
                      />
                    </svg>

                    {/* Moving Spindle / Toolhead Pointer */}
                    <motion.div
                      className="absolute w-7 h-7 rounded-full border-2 border-cyan-300 bg-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.8)] z-10"
                      animate={{
                        x: parseFloat(currentX) * 2.2,
                        y: parseFloat(currentY) * 2.2,
                        rotate: isSimulating ? 360 : 0,
                      }}
                      transition={{
                        rotate: { repeat: Infinity, duration: 0.4, ease: 'linear' },
                        x: { duration: 0.1 },
                        y: { duration: 0.1 },
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                    </motion.div>
                  </div>

                  {/* Overlay DRO HUD */}
                  <div className="absolute top-3 left-3 bg-zinc-900/90 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md font-mono text-xs space-y-1">
                    <span className="text-[8px] text-zinc-500 uppercase block font-bold">WCS Coordinates (G54)</span>
                    <div className="flex gap-3 text-cyan-300 font-bold text-[11px]">
                      <span>X: {currentX}</span>
                      <span>Y: {currentY}</span>
                      <span>Z: {currentZ}</span>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 bg-zinc-900/90 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md font-mono text-right space-y-1">
                    <span className="text-[8px] text-zinc-500 uppercase block font-bold">Spindle Status</span>
                    <div className="text-[11px] font-bold text-emerald-400">
                      {isSimulating ? `${spindleSpeed} RPM (CW)` : 'SPINDLE STOPPED'}
                    </div>
                  </div>
                </div>

                {/* Simulation Control Bar */}
                <div className="p-4 bg-zinc-900/70 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsSimulating(!isSimulating)}
                        className={`p-2.5 rounded-xl text-white flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isSimulating
                            ? 'bg-amber-600 hover:bg-amber-500'
                            : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'
                        }`}
                      >
                        {isSimulating ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                        <span>{isSimulating ? 'Pause' : 'Start Simulation'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsSimulating(false);
                          setSimProgress(0);
                          setCurrentLineIndex(0);
                        }}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer"
                        title="Reset Simulation"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-950 p-1 border border-white/10 rounded-lg">
                      <span className="text-[9px] text-zinc-500 uppercase font-mono px-1.5">Speed:</span>
                      {[1, 2, 5, 10].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSimSpeedMultiplier(s)}
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                            simSpeedMultiplier === s
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Cycle Progress</span>
                      <span className="text-cyan-400 font-bold">{simProgress.toFixed(1)}% Completed</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={0.1}
                      value={simProgress}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSimProgress(val);
                        setCurrentLineIndex(Math.floor((val / 100) * (gcodeLines.length - 1)));
                      }}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: LIVE G-CODE STREAM & EXECUTION TRACE */}
              <div className="lg:col-span-5 space-y-4 flex flex-col">
                <div className="flex-1 bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Cpu size={12} /> Live G-Code Execution Stream
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        Line {currentLineIndex + 1} / {gcodeLines.length}
                      </span>
                    </div>

                    {/* Code Stream window */}
                    <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-3 font-mono text-xs max-h-60 overflow-y-auto space-y-1 select-text">
                      {gcodeLines.slice(Math.max(0, currentLineIndex - 4), currentLineIndex + 6).map((line, idx) => {
                        const actualIdx = Math.max(0, currentLineIndex - 4) + idx;
                        const isCurrent = actualIdx === currentLineIndex;
                        return (
                          <div
                            key={actualIdx}
                            className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-2 ${
                              isCurrent
                                ? 'bg-cyan-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400'
                                : 'text-zinc-500'
                            }`}
                          >
                            <span className="text-[9px] opacity-40 select-none w-6">N{actualIdx + 1}</span>
                            <span>{line}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2 bg-zinc-950 rounded-lg border border-white/5">
                        <span className="text-zinc-500 uppercase block text-[8px]">Feed Setting</span>
                        <span className="text-white font-bold">{feedRate} mm/min</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded-lg border border-white/5">
                        <span className="text-zinc-500 uppercase block text-[8px]">Chip Load / Tooth</span>
                        <span className="text-emerald-400 font-bold">{feedPerTooth} mm</span>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadGCode}
                      className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-white/10 rounded-xl text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Download size={13} /> Export G-Code Program (.nc)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

