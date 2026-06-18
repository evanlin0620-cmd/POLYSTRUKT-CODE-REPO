import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Cpu, Settings, Compass, DollarSign, Activity, AlertCircle, RefreshCw } from 'lucide-react';

interface CNCMachiningSolverProps {
  onClose: () => void;
  selectedMaterial: any;
  dimensions: { length: number; width: number; height: number };
}

// Preset optimum ranges per material for realistic calculations
const MATERIAL_CNC_PRESETS: Record<string, { cuttingSpeed: number; feedPerTooth: number; densityKgM3: number }> = {
  titanium_grade_5: { cuttingSpeed: 60, feedPerTooth: 0.05, densityKgM3: 4430 },
  steel_304: { cuttingSpeed: 90, feedPerTooth: 0.08, densityKgM3: 8000 },
  carbon_fiber: { cuttingSpeed: 180, feedPerTooth: 0.12, densityKgM3: 1600 },
  aluminum_6061: { cuttingSpeed: 300, feedPerTooth: 0.15, densityKgM3: 2700 },
  abs_plastic: { cuttingSpeed: 450, feedPerTooth: 0.25, densityKgM3: 1040 },
};

export const CNCMachiningSolver: React.FC<CNCMachiningSolverProps> = ({ 
  onClose, 
  selectedMaterial, 
  dimensions 
}) => {
  const materialKey = selectedMaterial?.id || 'aluminum_6061';
  const preset = MATERIAL_CNC_PRESETS[materialKey] || MATERIAL_CNC_PRESETS.aluminum_6061;

  // Parameters State
  const [cutterDiameter, setCutterDiameter] = useState<number>(10); // mm
  const [flutes, setFlutes] = useState<number>(4);
  const [cuttingSpeed, setCuttingSpeed] = useState<number>(preset.cuttingSpeed); // Vc (m/min)
  const [feedPerTooth, setFeedPerTooth] = useState<number>(preset.feedPerTooth); // fz (mm/tooth)
  const [axialDepth, setAxialDepth] = useState<number>(3); // ap (mm)
  const [radialWidth, setRadialWidth] = useState<number>(5); // ae (mm)
  const [shopRate, setShopRate] = useState<number>(85); // $/hour

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

  // Envelope Volume (cm³): length * width * height / 1000
  const totalVolumeCm3 = (dimensions.length * dimensions.width * dimensions.height) / 1000;
  // Assume we are machining away 45% of the initial block to create the CAD shape
  const volumesMachinedCm3 = totalVolumeCm3 * 0.45;

  // Estimated Machining time (minutes) = Vol removed / MRR
  const machiningTimeMins = mrr > 0 ? parseFloat((volumesMachinedCm3 / mrr).toFixed(2)) : 0;

  // Machining Cost: Time * Shop Rate + flat setup and tooling wear cost
  const rawCost = (machiningTimeMins * (shopRate / 60));
  const toolingWearCost = 15.0; // tool depreciation factor
  const setupFlatCost = 45.0; 
  const totalCost = parseFloat((rawCost + toolingWearCost + setupFlatCost).toFixed(2));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 font-sans"
    >
      <div className="bg-zinc-950 border border-cyan-500/30 w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl shadow-3xl shadow-cyan-500/10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-cyan-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1 px-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 border border-cyan-500/30 animate-pulse">
              <Compass size={8} /> CNC SOLVER
            </div>
            <h3 className="text-sm font-black text-white tracking-widest uppercase font-unique">
              Dynamic CNC Feed-Rate & Machining Cost Solver
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm uppercase font-mono tracking-widest cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
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
                      {f} F
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl space-y-4">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block font-unique border-b border-white/5 pb-2">
                Speed, Feed & Feed Depth
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
                <span className="text-[9px] text-zinc-500 block">Typical range for {selectedMaterial?.name}: {preset.cuttingSpeed} m/min context</span>
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

              {/* Axial Depth slide */}
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
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 space-y-6">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block font-unique border-b border-white/5 pb-3">
                Live Controller Readout
              </span>

              {/* RPM & FEED */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                  <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Spindle Speed</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {spindleSpeed.toLocaleString()}
                  </div>
                  <span className="text-[8px] text-cyan-500 block">RPM</span>
                </div>

                <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                  <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Table Feed-Rate</span>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {feedRate.toLocaleString()}
                  </div>
                  <span className="text-[8px] text-cyan-500 block">mm/min</span>
                </div>
              </div>

              {/* PHYS & MATERIAL REMOVAL */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-zinc-400">Material Removal Rate (MRR)</span>
                  <span className="font-mono font-bold text-white">{mrr} cm³/min</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-zinc-400">Total Material Removed</span>
                  <span className="font-mono font-bold text-white">{volumesMachinedCm3.toFixed(1)} cm³</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-zinc-400">Estimated Tool-path Duration</span>
                  <span className="font-mono font-bold text-emerald-400">{machiningTimeMins} mins</span>
                </div>
              </div>

              {/* TOTAL ESTIMATED JOB COST */}
              <div className="bg-cyan-500/5 border border-cyan-500/20 p-5 rounded-xl space-y-2">
                <span className="text-[9px] text-cyan-400 uppercase font-black block tracking-widest font-unique">
                  Tooling & Machining Cost Estimate
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-zinc-400 text-xs">Total Manufacturing Cost:</span>
                  <span className="text-2xl font-black font-mono text-cyan-400">${totalCost.toFixed(2)}</span>
                </div>
                <div className="text-[8px] text-zinc-500 leading-relaxed font-mono">
                  Setup: $45.00 | Wear: $15.00 | Labor: ${(machiningTimeMins * (shopRate / 60)).toFixed(2)} (${shopRate}/hr)
                </div>
              </div>
            </div>

            {/* FORMULA CHEATSHEET */}
            <div className="bg-zinc-950 border border-white/5 p-4 rounded-xl space-y-2">
              <span className="text-[8px] text-zinc-500 uppercase font-black block tracking-wider font-mono">Governing Mechanical Formulas</span>
              <div className="text-[9px] text-zinc-400 space-y-1.5 font-mono">
                <div>Spindle RPM (N) = <span className="text-white">(V_c * 1000) / (π * D_c)</span></div>
                <div>Feed (F_f) = <span className="text-white">N * z * f_z</span></div>
                <div>MRR = <span className="text-white">(a_p * a_e * F_f) / 1000</span> (cm³/min)</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};
