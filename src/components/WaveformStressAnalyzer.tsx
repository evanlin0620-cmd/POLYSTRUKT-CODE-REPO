import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Info, Settings, ShieldCheck, Play, Pause, AlertOctagon, Sliders, AudioLines } from 'lucide-react';

interface WaveformStressAnalyzerProps {
  onClose: () => void;
  currentDesign?: any;
}

type WaveType = 'sine' | 'sawtooth' | 'square' | 'pulse';

export const WaveformStressAnalyzer: React.FC<WaveformStressAnalyzerProps> = ({ onClose, currentDesign }) => {
  const [waveType, setWaveType] = useState<WaveType>('sine');
  const [frequency, setFrequency] = useState<number>(1.5);
  const [amplitude, setAmplitude] = useState<number>(60);
  const [noiseLevel, setNoiseLevel] = useState<number>(15);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [harmonicsFilter, setHarmonicsFilter] = useState<boolean>(true);
  const [selectedChannel, setSelectedChannel] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const [phase, setPhase] = useState<number>(0);
  const requestRef = useRef<number | null>(null);

  // Animated wave update loop
  useEffect(() => {
    if (!isPlaying) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const animate = () => {
      setPhase(p => (p + (frequency * 0.05)) % (Math.PI * 2));
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, frequency]);

  // Generate SVG path for the wave
  const getWavePath = () => {
    const width = 800;
    const height = 300;
    const midY = height / 2;
    const points: string[] = [];

    for (let x = 0; x <= width; x += 3) {
      const step = (x / width) * Math.PI * 4; // 2 complete periods
      let val = 0;

      // Base Wave Calculations
      if (waveType === 'sine') {
        val = Math.sin(step - phase);
        if (harmonicsFilter) {
          // Add secondary harmonic
          val += 0.25 * Math.sin((step * 2) - (phase * 2));
        }
      } else if (waveType === 'sawtooth') {
        val = (((step - phase) % Math.PI) / Math.PI) * 2 - 1;
      } else if (waveType === 'square') {
        val = Math.sin(step - phase) >= 0 ? 1 : -1;
      } else if (waveType === 'pulse') {
        val = Math.sin(step - phase) >= 0.4 ? 1 : -1;
      }

      // Filter Adjustment (Smooth or raw clip)
      if (!harmonicsFilter && waveType === 'square') {
        // Raw jagged transition
        val = val * 0.95;
      }

      // Amplitude Scale
      let y = midY - (val * amplitude);

      // Noise Injection
      if (noiseLevel > 0) {
        y += (Math.random() - 0.5) * noiseLevel;
      }

      if (x === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        points.push(`L ${x} ${y}`);
      }
    }

    return points.join(' ');
  };

  const channelLabels = {
    A: { title: 'Frequency Response', unit: 'Hz', color: 'text-cyan-400', stroke: '#22d3ee' },
    B: { title: 'Dynamic Micro-Impedance', unit: 'Ω', color: 'text-indigo-400', stroke: '#818cf8' },
    C: { title: 'Acoustic Structural Emission', unit: 'dB', color: 'text-emerald-400', stroke: '#34d399' },
    D: { title: 'Fatigue Cycle Stress Amplitude', unit: 'MPa', color: 'text-orange-400', stroke: '#fb923c' },
  };

  const activeChannel = channelLabels[selectedChannel];
  const isDanger = amplitude >= 75 || (amplitude >= 60 && noiseLevel >= 30);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-zinc-950/95 backdrop-blur-3xl overflow-hidden flex flex-col p-6 font-sans border border-white/5"
    >
      {/* Wave Analyzer Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Activity size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white">Waveform & Material Stress Analyzer</h1>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Real-time Oscilloscope // Multi-channel Structural Feedback</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-white rounded-full text-zinc-400 transition-all cursor-pointer shadow-md"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Interactive Control Station */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header Title */}
            <div className="flex items-center gap-2 px-1">
              <Sliders size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Signal Synthesizer</span>
            </div>

            {/* Channels selectors */}
            <div className="grid grid-cols-2 gap-2">
              {(['A', 'B', 'C', 'D'] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`p-3 rounded-2xl border text-left transition-all ${selectedChannel === ch ? 'bg-white/10 border-indigo-500 shadow-md' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${selectedChannel === ch ? channelLabels[ch].color : 'text-zinc-600'}`}>CH {ch}</span>
                  <span className="text-[10px] font-medium text-white truncate block">{channelLabels[ch].title}</span>
                </button>
              ))}
            </div>

            <div className="h-px bg-white/5" />

            {/* Waveform Generator Selection */}
            <div className="space-y-3">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest px-1 block">Waveform Profiler</span>
              <div className="grid grid-cols-2 gap-2">
                {(['sine', 'sawtooth', 'square', 'pulse'] as WaveType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setWaveType(type)}
                    className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest text-center transition-all ${waveType === type ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Parameter Adjustment Sliders */}
            <div className="space-y-4">
              {/* Frequency */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-zinc-500">Signal Frequency</span>
                  <span className="text-cyan-400 font-mono">{frequency.toFixed(2)} Hz</span>
                </div>
                <input 
                  type="range" min="0.1" max="4.0" step="0.1"
                  value={frequency} onChange={e => setFrequency(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Stress Amplitude */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-zinc-500">Stress Load Amplitude</span>
                  <span className="text-indigo-400 font-mono">{amplitude} %</span>
                </div>
                <input 
                  type="range" min="10" max="120" step="5"
                  value={amplitude} onChange={e => setAmplitude(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Noise perturbation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-zinc-500">Noise Perturbation</span>
                  <span className="text-emerald-400 font-mono">{noiseLevel} %</span>
                </div>
                <input 
                  type="range" min="0" max="50" step="5"
                  value={noiseLevel} onChange={e => setNoiseLevel(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Toggle play, filters */}
          <div className="space-y-3 pt-4 border-t border-white/5 select-none text-left">
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Lowpass Harmonics Filter</span>
              <button 
                onClick={() => setHarmonicsFilter(!harmonicsFilter)}
                className={`w-10 h-5 rounded-full transition-all relative ${harmonicsFilter ? 'bg-indigo-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${harmonicsFilter ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 py-3 bg-white text-zinc-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isPlaying ? <><Pause size={12} /> Freeze Sweep</> : <><Play size={12} /> Play Sweep</>}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sweep Viewport */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex-1 bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            {/* Analyzer coordinate grid */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/10 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 pointer-events-none" />
            
            {/* Wave Alert Trigger Overlay */}
            <AnimatePresence>
              {isDanger && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-500/5 border border-red-500/20 rounded-2xl pointer-events-none flex flex-col p-4 z-10"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">
                    <AlertOctagon size={14} /> Peak Yield Threshold Warning
                  </div>
                  <span className="text-[8px] font-mono text-red-500/60 mt-1">ERR_STR_THR_EXCEEDED (von Mises limit breach)</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sweep details tags */}
            <div className="flex justify-between items-start pointer-events-none mb-4 select-none">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Selected Channel Target</span>
                <h3 className={`text-sm font-black uppercase tracking-tight flex items-center gap-2 ${activeChannel.color}`}>
                  <AudioLines size={14} />
                  {activeChannel.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Active Voltage Range</span>
                <p className="text-xs font-mono font-black text-white">± {(amplitude * 4).toFixed(0)} {activeChannel.unit}</p>
              </div>
            </div>

            {/* Render Sweep Vector Curve with SVG */}
            <div className="flex-1 flex items-center justify-center">
              <svg 
                viewBox="0 0 800 300" 
                className="w-full max-h-[300px] overflow-visible"
              >
                {/* Horizontal guide lines */}
                <line x1="0" y1="75" x2="800" y2="75" stroke="rgba(255,255,255,0.02)" strokeDasharray="5,5" />
                <line x1="0" y1="225" x2="800" y2="225" stroke="rgba(255,255,255,0.02)" strokeDasharray="5,5" />
                
                <motion.path 
                  d={getWavePath()} 
                  fill="none" 
                  stroke={activeChannel.stroke} 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                />
              </svg>
            </div>

            {/* Bottom monitor diagnostic bar */}
            <div className="border-t border-white/5 pt-4 mt-auto flex justify-between items-center text-[10px] font-mono text-zinc-500 select-none">
              <div className="flex gap-4">
                <span>SWEEP_RATE: {(frequency * 1.5).toFixed(1)} Khz</span>
                <span>HARMONICS: {harmonicsFilter ? 'ON' : 'BYPASS'}</span>
                <span>STABILITY: {(98.4 - (noiseLevel * 0.4)).toFixed(1)}%</span>
              </div>
              <span>PROT: SPEC_WAVE_ANALYSIS_A</span>
            </div>
          </div>

          {/* Quick Informational card */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-start gap-4">
            <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase text-white tracking-widest mb-1 leading-relaxed">Dynamic Frequency Analysis</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                By injecting controlled resonance parameters into structural paths, the wave analyzer maps mechanical boundaries. This allows real-time isolation of displacement curves prior to structural manufacturing specs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
