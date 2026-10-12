import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sliders, X, Download, Info } from "lucide-react";

interface DimensionSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export const DimensionSlider: React.FC<DimensionSliderProps> = ({
  label,
  value,
  min,
  max,
  onChange,
}) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-[10px] font-mono text-cyan-400 font-bold">
        {value}mm
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

interface ParametricPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  setDimensions: React.Dispatch<
    React.SetStateAction<{
      length: number;
      width: number;
      height: number;
    }>
  >;
  onSyncScale: () => void;
  onSyncMesh: () => void;
  onExportSessionParametersJson: () => void;
  onOpenCadExport?: () => void;
}

export const ParametricPanel: React.FC<ParametricPanelProps> = ({
  isOpen,
  onClose,
  dimensions,
  setDimensions,
  onSyncScale,
  onSyncMesh,
  onExportSessionParametersJson,
  onOpenCadExport,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -400 }}
          animate={{ x: 0 }}
          exit={{ x: -400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute top-0 left-0 bottom-0 w-80 bg-zinc-950/85 backdrop-blur-2xl border-r border-white/5 z-[45] shadow-2xl p-6 pt-24 space-y-8 pointer-events-auto overflow-y-auto custom-scrollbar"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-white">
                  Parametric Envelope
                </h2>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  Live Geometry Constraints
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white transition-colors"
              title="Close panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-6">
              <DimensionSlider
                label="Length (X)"
                value={dimensions.length}
                min={10}
                max={1000}
                onChange={(v) =>
                  setDimensions((d) => ({ ...d, length: v }))
                }
              />
              <DimensionSlider
                label="Width (Y)"
                value={dimensions.width}
                min={10}
                max={1000}
                onChange={(v) =>
                  setDimensions((d) => ({ ...d, width: v }))
                }
              />
              <DimensionSlider
                label="Height (Z)"
                value={dimensions.height}
                min={10}
                max={1000}
                onChange={(v) =>
                  setDimensions((d) => ({ ...d, height: v }))
                }
              />

              <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                <p className="text-[9px] font-mono text-zinc-500 uppercase">
                  Interactive Adjustments
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onSyncScale}
                    className="flex-1 py-2 bg-indigo-500/10 text-indigo-400 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all cursor-pointer"
                  >
                    Sync Scale
                  </button>
                  <button
                    onClick={onSyncMesh}
                    className="flex-1 py-2 bg-cyan-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
                  >
                    Sync Mesh
                  </button>
                </div>
                {onOpenCadExport && (
                  <button
                    onClick={onOpenCadExport}
                    className="w-full mt-2 py-2.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Sliders size={13} className="text-indigo-400" /> Open In External CAD (Onshape / SolidWorks / Fusion)
                  </button>
                )}
                <button
                  onClick={onExportSessionParametersJson}
                  className="w-full mt-2 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download size={13} /> Export Parameters (JSON)
                </button>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
              <Info size={16} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                Adjusting dimensions affects the structural load-bearing
                capacity. Use <strong>Sync Mesh</strong> to invoke the AI
                for a structurally sound refinement.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
