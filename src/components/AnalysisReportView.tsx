import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Activity, Shield, Cpu, CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { AnalysisReport, DFMAnalysisReport } from '../types';

interface AnalysisReportViewProps {
  report: AnalysisReport;
  dfmReport?: DFMAnalysisReport;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({ report, dfmReport }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'functional' | 'structural' | 'dfm'>(dfmReport ? 'dfm' : 'visual');
  
  const tabs = [
    ...(dfmReport ? [{ id: 'dfm', label: 'DFM Audit', icon: Cpu, color: 'text-cyan-400' }] : []),
    { id: 'visual', label: 'Visual', icon: ImageIcon, color: 'text-purple-400' },
    { id: 'functional', label: 'Functional', icon: Activity, color: 'text-blue-400' },
    { id: 'structural', label: 'Structural', icon: Shield, color: 'text-emerald-400' },
  ] as const;

  return (
    <div className="mt-4 bg-zinc-950/70 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="flex border-b border-white/5 bg-zinc-900/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 flex flex-col items-center gap-1.5 transition-all relative ${
              activeTab === tab.id ? 'bg-white/5 text-white' : 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300'
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
          {activeTab === 'dfm' && dfmReport ? (
            <motion.div
              key="dfm-panel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              {/* DFM Score and Status Header */}
              <div className="flex items-center justify-between bg-zinc-900/70 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-black text-sm">
                    {dfmReport.overallScore}
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">Manufacturability Score</span>
                    <h5 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                      {dfmReport.machinabilityIndex} Feasibility
                      <span className={`w-2 h-2 rounded-full ${
                        dfmReport.machinabilityIndex === 'Optimal' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' :
                        dfmReport.machinabilityIndex === 'Caution' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' :
                        'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'
                      }`} />
                    </h5>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                    dfmReport.watertightManifold ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'
                  }`}>
                    {dfmReport.watertightManifold ? '✓ 2-Manifold Watertight' : '⚠️ Non-Manifold Mesh'}
                  </span>
                </div>
              </div>

              {/* Physical Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-zinc-900/40 rounded-xl border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-0.5">Min Wall Thickness</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">{dfmReport.minWallThicknessMm.toFixed(1)} mm</span>
                </div>
                <div className="p-2.5 bg-zinc-900/40 rounded-xl border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-0.5">Max Overhang</span>
                  <span className="text-xs font-mono font-bold text-amber-300">{dfmReport.maxOverhangDeg.toFixed(0)}°</span>
                </div>
                <div className="p-2.5 bg-zinc-900/40 rounded-xl border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-0.5">Tool Clearance</span>
                  <span className="text-xs font-mono font-bold text-purple-300">{dfmReport.toolClearanceMm.toFixed(1)} mm</span>
                </div>
                <div className="p-2.5 bg-zinc-900/40 rounded-xl border border-white/5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-0.5">Est. Mass</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">{(dfmReport.estimatedMassKg * 1000).toFixed(1)} g</span>
                </div>
              </div>

              {/* AI Engineering Synthesis Insight */}
              {dfmReport.aiSynthesisInsight && (
                <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-[10px] text-cyan-200/90 leading-relaxed font-mono flex items-start gap-2">
                  <Sparkles size={12} className="text-cyan-400 mt-0.5 shrink-0" />
                  <span>{dfmReport.aiSynthesisInsight}</span>
                </div>
              )}

              {/* Issues / Recommendations List */}
              {dfmReport.issues && dfmReport.issues.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">DFM Rule Findings ({dfmReport.issues.length})</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {dfmReport.issues.map((issue) => (
                      <div key={issue.id} className="p-2 bg-zinc-900/60 border border-white/5 rounded-lg text-left flex items-start gap-2">
                        {issue.severity === 'error' ? (
                          <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                        ) : issue.severity === 'warning' ? (
                          <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                        ) : (
                          <Info size={12} className="text-blue-400 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-zinc-200 truncate">{issue.title}</span>
                            <span className={`text-[7px] font-mono uppercase px-1 py-0.2 rounded font-bold ${
                              issue.severity === 'error' ? 'bg-red-500/20 text-red-300' :
                              issue.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>{issue.severity}</span>
                          </div>
                          <p className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{issue.detail}</p>
                          {issue.recommendation && (
                            <p className="text-[8px] text-cyan-400/90 font-mono mt-1">→ Rec: {issue.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
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
                {report[activeTab as 'visual' | 'functional' | 'structural']}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
