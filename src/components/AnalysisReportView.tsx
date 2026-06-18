import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Activity, Shield } from 'lucide-react';
import { AnalysisReport } from '../types';

interface AnalysisReportViewProps {
  report: AnalysisReport;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'functional' | 'structural'>('visual');
  
  const tabs = [
    { id: 'visual', label: 'Visual', icon: ImageIcon, color: 'text-purple-400' },
    { id: 'functional', label: 'Functional', icon: Activity, color: 'text-blue-400' },
    { id: 'structural', label: 'Structural', icon: Shield, color: 'text-emerald-400' },
  ] as const;

  return (
    <div className="mt-4 bg-zinc-950/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 flex flex-col items-center gap-1.5 transition-all relative ${
              activeTab === tab.id ? 'bg-white/5' : 'hover:bg-white/5 opacity-50'
            }`}
          >
            <tab.icon size={14} className={tab.color} />
            <span className="text-[9px] font-black uppercase tracking-widest font-unique">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeAnalyticTab" 
                className="absolute bottom-0 inset-x-4 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              />
            )}
          </button>
        ))}
      </div>
      <div className="p-4 min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 mb-2">
               <div className={`w-1.5 h-1.5 rounded-full ${tabs.find(t => t.id === activeTab)?.color.replace('text-', 'bg-')}`} />
               <h5 className="text-[10px] font-bold text-white uppercase tracking-tight">{activeTab} Synthesis Analysis</h5>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              {report[activeTab]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
