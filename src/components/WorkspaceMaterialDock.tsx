import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, ChevronDown, ChevronUp, Scale, Zap, Shield } from "lucide-react";
import { MaterialOption } from "../types";

interface WorkspaceMaterialDockProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedMaterial: MaterialOption;
  onSelectMaterial: (mat: MaterialOption) => void;
  materials: MaterialOption[];
  estimatedMassKg?: number;
}

export const WorkspaceMaterialDock: React.FC<WorkspaceMaterialDockProps> = ({
  isOpen,
  onToggle,
  selectedMaterial,
  onSelectMaterial,
  materials,
  estimatedMassKg = 1.24,
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Header Bar / Minimized Pill */}
        <div className="px-4 py-2 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={onToggle}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Layers size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Material & Spec
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <selectedMaterial.icon size={13} className={selectedMaterial.color} />
                {selectedMaterial.name}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-1 text-zinc-300">
              <Scale size={12} className="text-emerald-400" />
              <span>{estimatedMassKg.toFixed(2)} kg</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-zinc-400">
              <Zap size={12} className="text-amber-400" />
              <span>{selectedMaterial.yieldStrength}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors ml-1"
            title={isOpen ? "Collapse Material Dock" : "Expand Material Spectrometry"}
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expanded Material Selector Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/10 p-3 bg-zinc-900/60"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl">
                {materials.map((mat) => {
                  const isSelected = selectedMaterial.id === mat.id;
                  const Icon = mat.icon;
                  return (
                    <button
                      key={mat.id}
                      onClick={() => onSelectMaterial(mat)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-500/20 border-indigo-500/50 shadow-md"
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon size={14} className={mat.color} />
                        <span className="text-[9px] font-mono text-zinc-400">{mat.density}</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate">{mat.name}</div>
                        <div className="text-[9px] font-mono text-zinc-400 truncate">{mat.yieldStrength}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
