import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Activity, ShieldCheck, ChevronRight, Layers, CheckCircle2, FileCode, Sliders } from 'lucide-react';

interface KernelShowcaseProps {
  onSimulationClick: () => void;
}

export const KernelShowcase: React.FC<KernelShowcaseProps> = ({ onSimulationClick }) => {
  return (
    <section id="engine" className="py-24 bg-transparent relative overflow-hidden">
      {/* Subtle Engineering Grid Backdrop */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden font-mono text-foreground select-none">
        <div className="absolute top-10 left-10 text-[3.5vw] font-bold leading-none">
          F = m · a &nbsp;|&nbsp; σ = E · ε &nbsp;|&nbsp; ∇ · σ + f = 0
        </div>
        <div className="absolute bottom-20 right-10 text-[4vw] font-bold leading-none">
          STEP AP214 &nbsp;|&nbsp; ISO G-Code &nbsp;|&nbsp; FEA Ready
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: CLEAR, CONCISE & HIGH-VALUE EXPLANATION */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 font-mono">
                CAD Generation & Physics Engine
              </span>
            </div>
            
            {/* Main Headline */}
            <div className="space-y-3">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-foreground font-unique uppercase">
                Engineered for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  Real Manufacturing.
                </span>
              </h2>
              
              <p className="text-base sm:text-lg text-foreground/80 dark:text-zinc-200 max-w-xl leading-relaxed font-sans font-normal pt-1">
                Polystrukt transforms natural language and dimensional constraints into production-ready 3D CAD models. By combining real-time structural analysis with automated manufacturing checks, it removes excess weight, verifies strength, and generates precision STEP, STL, and CNC G-code files in seconds.
              </p>
            </div>
            
            {/* 4 Informative & High-Value Pillars */}
            <div className="grid sm:grid-cols-2 gap-5 pt-2">
              <KernelFeature 
                icon={<Activity size={18} className="text-emerald-400" />} 
                title="Smart Weight Reduction" 
                desc="Removes non-critical material along stress paths, cutting part weight by up to 60% without compromising mechanical integrity."
                tag="Up to 60% Lighter"
              />
              <KernelFeature 
                icon={<ShieldCheck size={18} className="text-blue-400" />} 
                title="Instant Stress Analysis" 
                desc="Calculates real-world load conditions and Von Mises stress distribution in real time to prevent mechanical fatigue."
                tag="< 200ms Physics Solve"
              />
              <KernelFeature 
                icon={<Zap size={18} className="text-amber-400" />} 
                title="Automated DFM Validation" 
                desc="Continuously inspects wall thickness, overhang angles, and tool clearances to guarantee 100% machinability."
                tag="Zero Fabrication Flaws"
              />
              <KernelFeature 
                icon={<FileCode size={18} className="text-purple-400" />} 
                title="Universal CAD & CNC Export" 
                desc="Outputs standard STEP (AP203/214), STL meshes, OpenSCAD code, and machine-ready G-Code directly to your CAM software."
                tag="STEP • STL • G-Code"
              />
            </div>

            {/* Action CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSimulationClick}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <Zap size={15} className="fill-current text-white" />
                Launch Interactive Engine Test
                <ChevronRight size={16} />
              </motion.button>

              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Compatible with SolidWorks, Fusion 360 & Blender
              </span>
            </div>
          </motion.div>
          
          {/* RIGHT: AESTHETIC & INFORMATIVE ENGINE HUD CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-cyan-500/20 rounded-3xl blur-2xl opacity-70 -z-10" />

            <div className="relative w-full bg-zinc-900/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl space-y-6 overflow-hidden">
              
              {/* Header Status Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-white font-mono">
                      Polystrukt Solver Core
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Version 2.4 • Active Standby</span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                  Operational
                </div>
              </div>

              {/* Central Visual Telemetry */}
              <div className="relative aspect-[16/10] bg-zinc-950/80 rounded-xl border border-white/5 p-4 flex flex-col justify-between overflow-hidden">
                {/* Visual Grid Lines */}
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Animated Scan Line */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-10 shadow-[0_0_12px_#22d3ee]"
                />

                <div className="flex items-center justify-between z-10 text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Sliders size={12} className="text-indigo-400" />
                    PARAMETRIC CONSTRAINTS
                  </span>
                  <span className="text-cyan-400 font-bold">FEA VERIFIED</span>
                </div>

                {/* Interactive Dynamic Metrics Graphic */}
                <div className="relative z-10 flex items-center justify-center my-auto py-2">
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-black font-mono text-white tracking-tight flex items-center justify-center gap-1">
                      <span className="text-indigo-400">0.001</span>
                      <span className="text-xs text-zinc-400 font-normal uppercase">mm precision</span>
                    </div>
                    <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                      B-Rep Solid Manifold Geometry
                    </div>
                  </div>
                </div>

                {/* Real-time Telemetry Bars */}
                <div className="space-y-1.5 z-10 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-zinc-400">Structural Safety Factor (FoS)</span>
                    <span className="text-emerald-400 font-bold">2.4x (Optimal)</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-cyan-400 rounded-full"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '88%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              {/* 3 Quick Telemetry Readout Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-xl text-center">
                  <span className="text-[9px] text-zinc-400 uppercase font-mono block">Solve Time</span>
                  <div className="text-sm font-bold font-mono text-indigo-300 mt-0.5">&lt; 250ms</div>
                </div>
                <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-xl text-center">
                  <span className="text-[9px] text-zinc-400 uppercase font-mono block">Mass Saved</span>
                  <div className="text-sm font-bold font-mono text-emerald-300 mt-0.5">-42% avg</div>
                </div>
                <div className="p-2.5 bg-zinc-950/60 border border-white/5 rounded-xl text-center">
                  <span className="text-[9px] text-zinc-400 uppercase font-mono block">Export Types</span>
                  <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">6 Formats</div>
                </div>
              </div>

              {/* Supported Materials Ribbon */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <Layers size={11} className="text-indigo-400" /> Validated Materials:
                </span>
                <span className="text-zinc-300 font-medium">
                  Al 6061 • Titanium Gr.5 • Steel 304 • Carbon Fiber
                </span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const KernelFeature = ({ 
  icon, 
  title, 
  desc, 
  tag 
}: { 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  tag?: string;
}) => (
  <div className="p-4 rounded-xl bg-zinc-900/40 dark:bg-zinc-900/60 border border-border/50 hover:border-indigo-500/40 transition-colors flex flex-col justify-between group">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-zinc-800/80 border border-white/5 text-foreground group-hover:scale-105 transition-transform">
          {icon}
        </div>
        {tag && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400/90 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            {tag}
          </span>
        )}
      </div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-unique pt-1">
        {title}
      </h4>
      <p className="text-xs text-foreground/70 dark:text-zinc-300 leading-relaxed font-normal">
        {desc}
      </p>
    </div>
  </div>
);
