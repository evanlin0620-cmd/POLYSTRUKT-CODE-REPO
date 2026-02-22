import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InspectableModel } from '../InspectableModel';
import { Loader2, Box, Layers } from 'lucide-react';
import { TechnicalAIResponse } from '../../services/geminiService';

interface MainViewProps {
  isGenerating: boolean;
  hasModel: boolean;
  currentDesign: TechnicalAIResponse | null;
  simulationMode: 'stress' | 'thermal' | 'flow' | undefined;
}

export const MainView: React.FC<MainViewProps> = ({ isGenerating, hasModel, currentDesign, simulationMode }) => {
  return (
    <div className="flex-1 relative">
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            data-testid="workspace-loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center bg-zinc-100/50"
          >
            <div className="relative">
              <Loader2 size={64} className="text-purple-600 animate-spin" />
              <motion.div className="absolute inset-0 border-2 border-purple-200 rounded-full" animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1 }} />
            </div>
            <div className="mt-8 text-center space-y-2">
              <h2 className="text-xl font-black font-unique tracking-widest uppercase">Synthesizing Geometry</h2>
              <p className="text-[10px] font-mono text-zinc-400 mt-2 uppercase tracking-[0.2em] animate-pulse">Running Topology Optimization...</p>
            </div>
          </motion.div>
        ) : hasModel && currentDesign ? (
          <motion.div key="model" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            <InspectableModel
              isFullscreen={true}
              simulationMode={simulationMode}
              modelUrl={currentDesign.modelUrl}
              focusPart={currentDesign.isolatedComponent}
            />
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
            <div className="flex flex-col items-center gap-8 max-w-lg text-center opacity-30">
              <div className="relative">
                 <Box size={120} strokeWidth={0.5} className="text-zinc-400" />
                 <div className="absolute inset-0 flex items-center justify-center"><Layers size={40} className="animate-pulse" /></div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black tracking-tighter font-unique uppercase">Ready to Build.</h2>
                <p className="text-sm font-mono tracking-wide uppercase">Provide geometry, material, and load constraints below.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};