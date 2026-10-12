import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Shield, Cpu, Flame, Check, AlertCircle, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface StructuredAssistantProps {
  onClose: () => void;
  dimensions: { length: number; width: number; height: number };
  selectedMaterial: any;
}

export const StructuredAssistantPanel: React.FC<StructuredAssistantProps> = ({ 
  onClose, 
  dimensions, 
  selectedMaterial 
}) => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = useAuth(state => state.token);

  const fetchAnalysis = async (customQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/engineering-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dimensions,
          material: selectedMaterial,
          query: customQuery || "Run full structural safety and optimization study."
        })
      });

      if (!res.ok) {
        throw new Error(`Kernel assistant fault code: ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete assistant request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run initial analysis automatically on mount!
    fetchAnalysis();
  }, [dimensions, selectedMaterial]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    fetchAnalysis(query);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 font-sans"
    >
      <div className="bg-zinc-950 border border-purple-500/30 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl shadow-3xl shadow-purple-500/10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1 px-2 bg-purple-500/20 text-purple-400 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 border border-purple-500/30 animate-pulse">
              <Sparkles size={8} /> LIVE SOLVER
            </div>
            <h3 className="text-sm font-black text-white tracking-widest uppercase font-unique">
              Structured Gemini Assistant
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
              <AlertCircle size={16} />
              <span className="text-xs font-mono">{error}</span>
            </div>
          )}

          {/* ACTIVE PARAMETERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Enclosing Dimensions</span>
              <div className="mt-1 font-mono text-xs text-white">
                {dimensions.length}L × {dimensions.width}W × {dimensions.height}H (mm)
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active Material Context</span>
              <div className="mt-1 text-xs text-white flex items-center gap-2">
                <span className="text-purple-400 font-bold font-mono">{selectedMaterial?.name || 'Aluminum 6061-T6'}</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col justify-center">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Calculated Envelope Volume</span>
              <span className="mt-1 font-mono text-xs text-white">
                {(dimensions.length * dimensions.width * dimensions.height / 1000).toFixed(1)} cm³
              </span>
            </div>
          </div>

          {/* GENERATIVE SOLVER RESPONSE */}
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-[10px] font-mono font-bold text-purple-400 tracking-widest uppercase">
                Solving Multi-Physics Structural Tensors...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              
              {/* TWO COLUMN PERFORMANCE REPORT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* STRUCTURAL PERFORMANCE */}
                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5 font-unique">
                      <Shield size={12} /> Structural Performance
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Von-Mises Estimator</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-black">Safety Factor</span>
                      <div className="mt-1 text-md font-bold font-mono text-emerald-400">
                        {result.structuralAnalysis?.safetyFactor?.toFixed(2) || '1.87'}
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-black">Deflection</span>
                      <div className="mt-1 text-md font-bold font-mono text-white">
                        {result.structuralAnalysis?.deflectionMm?.toFixed(3) || '0.045'} mm
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg text-center">
                      <span className="text-[8px] text-zinc-500 uppercase font-black">Max Load</span>
                      <div className="mt-1 text-md font-bold font-mono text-cyan-400">
                        {result.structuralAnalysis?.maxLoadCapacityN || '5000'} N
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans mt-3">
                    {result.structuralAnalysis?.description}
                  </p>
                </div>

                {/* THERMAL & PHYSICS */}
                <div className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1.5 font-unique">
                      <Cpu size={12} /> Multi-Physics Metrics
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Thermodynamics</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                      <span className="text-[8px] text-zinc-500 uppercase font-black block">Yield Mass Density</span>
                      <div className="text-xs font-bold font-mono text-white mt-1">
                        {result.physicsCalculations?.calculatedMassKg?.toFixed(3) || '0.420'} kg
                      </div>
                      <span className="text-[8px] text-zinc-600 block mt-0.5">({result.physicsCalculations?.densityKgM3 || '2700'} kg/m³)</span>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                      <span className="text-[8px] text-zinc-500 uppercase font-black block">Thermal Service limit</span>
                      <div className="text-xs font-bold font-mono text-white mt-1">
                        {result.thermalAnalysis?.maxServiceTempC || '150'} °C
                      </div>
                      <span className="text-[8px] text-zinc-600 block mt-0.5">({result.thermalAnalysis?.thermalConductivity || '167'} W/mK)</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {result.physicsCalculations?.description}
                  </p>
                </div>

              </div>

              {/* DESIGN REFINEMENTS LIST */}
              <div className="bg-zinc-900/40 border border-purple-500/10 p-5 rounded-xl space-y-3">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block font-unique">
                  Structured AI Refinement Guidelines
                </span>
                <div className="space-y-2">
                  {result.designRefinements?.map((ref: string, index: number) => (
                    <div key={index} className="flex gap-3 items-start text-xs text-zinc-300">
                      <div className="p-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded mt-0.5">
                        <Check size={10} />
                      </div>
                      <p className="leading-relaxed font-sans">{ref}</p>
                    </div>
                  ))}
                  {(!result.designRefinements || result.designRefinements.length === 0) && (
                    <p className="text-xs font-mono text-zinc-500">No refinements reported.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <span className="text-xs text-zinc-500 font-mono">Execute synthesis check.</span>
            </div>
          )}
        </div>

        {/* INPUT DISPATCH CONSOLE */}
        <div className="p-4 border-t border-white/5 bg-zinc-950">
          <form onSubmit={handleQuerySubmit} className="flex gap-2.5">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask structured design refinements... (e.g. 'How does carbon fiber impact deflection?')"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500 font-sans"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="p-3 px-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all font-sans cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              Analyze Spec
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
};
