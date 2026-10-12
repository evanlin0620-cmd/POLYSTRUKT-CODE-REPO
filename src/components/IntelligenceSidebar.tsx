import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Microscope, X, Sparkles, Activity, History, Box } from "lucide-react";
import { EvolutionTree } from "./EvolutionTree";
import { ChatMessage } from "../types";

interface IntelligenceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isBiomorphic: boolean;
  setIsBiomorphic: (val: boolean) => void;
  projectsCount: number;
  showHistory: boolean;
  onOpenHistory: () => void;
  chatHistory: ChatMessage[];
  onSelectModelMessage?: (msg: ChatMessage) => void;
}

export const IntelligenceSidebar: React.FC<IntelligenceSidebarProps> = ({
  isOpen,
  onClose,
  isBiomorphic,
  setIsBiomorphic,
  projectsCount,
  showHistory,
  onOpenHistory,
  chatHistory,
  onSelectModelMessage,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -400 }}
          animate={{ x: 0 }}
          exit={{ x: -400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute top-0 left-0 bottom-0 w-[22rem] bg-zinc-950/85 backdrop-blur-2xl border-r border-white/5 z-[45] shadow-2xl p-6 pt-24 space-y-8 pointer-events-auto overflow-y-auto custom-scrollbar"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Microscope size={20} />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-white">
                  Intelligence Core
                </h2>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  Real-time optimization
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                  Optimization Strategy
                </span>
                <Sparkles
                  size={14}
                  className="text-indigo-400 animate-pulse"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-900 border border-white/5 rounded-xl group transition-all hover:border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${isBiomorphic ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-zinc-600"}`}
                  >
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tight">
                      Biomorphic mode
                    </p>
                    <p className="text-[9px] text-zinc-500">
                      Enable organic topology
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBiomorphic(!isBiomorphic)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isBiomorphic ? "bg-emerald-500" : "bg-white/10"}`}
                >
                  <motion.div
                    animate={{ x: isBiomorphic ? 22 : 4 }}
                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              {projectsCount > 0 && !showHistory && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={onOpenHistory}
                  className="w-full flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group hover:bg-indigo-500/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <History size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      Recent Projects
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-indigo-500/20 rounded text-[9px] font-mono text-indigo-400">
                    {projectsCount}
                  </span>
                </motion.button>
              )}

              <EvolutionTree />
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">
                Synthesis Timeline
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {chatHistory
                  .filter((m) => m.role === "model")
                  .map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-0 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group overflow-hidden cursor-pointer"
                      onClick={() => onSelectModelMessage?.(msg)}
                    >
                      <div className="aspect-[2/1] bg-indigo-500/10 relative overflow-hidden">
                        <img
                          src={`https://images.unsplash.com/photo-1544383120-d4347715fbc3?auto=format&fit=crop&q=60&w=400&blur=${idx * 2}`}
                          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                          alt="Synthesis Preview"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                        <div className="absolute bottom-2 left-3 flex items-center gap-2">
                          <Box size={10} className="text-indigo-400" />
                          <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-tighter">
                            Render Complete
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                            Generation v.{chatHistory.length - idx}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ))}
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl gap-3">
                    <History size={24} className="text-zinc-800" />
                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                      Timeline empty
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                  System Health
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-500">
                    NOMINAL
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="block text-[8px] font-bold text-zinc-600 uppercase mb-1">
                    Compute Load
                  </span>
                  <span className="text-xs font-mono font-black text-white">
                    4.2 TFLOPS
                  </span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <span className="block text-[8px] font-bold text-zinc-600 uppercase mb-1">
                    Model Precision
                  </span>
                  <span className="text-xs font-mono font-black text-white">
                    HIGH_RES
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
