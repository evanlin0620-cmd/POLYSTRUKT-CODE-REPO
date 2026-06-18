import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

interface KernelShowcaseProps {
  onSimulationClick: () => void;
}

export const KernelShowcase: React.FC<KernelShowcaseProps> = ({ onSimulationClick }) => {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
   {/* Mathematical Backdrop */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden font-mono text-foreground select-none">
        <div className="absolute top-10 left-10 text-[4vw] font-bold leading-none">
          Minimize: C(x) = ∑ (x_e)^p * u_e^T * k_0 * u_e <br />
          Subject to: V(x) / V_0 - V* =&gt; 0
        </div>
        <div className="absolute bottom-20 right-10 text-[5vw] font-bold leading-none">
          ∂ϕ/∂t + V_n |∇ϕ| = 0
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/50 border border-border/50 backdrop-blur-md">
              <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground dark:text-zinc-100 font-unique">Quantum Logic Kernel</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-black tracking-tightest font-unique leading-[0.8] text-foreground uppercase">
              Built on <br/> <span className="text-indigo-500 text-glow">Pure Math.</span>
            </h2>
            
            <p className="text-base text-zinc-700 dark:text-white/90 max-w-lg leading-relaxed font-technical tracking-tight font-medium">
              Polystrukt's dual-solver system compiles complex CAD problems into high-velocity finite element analyses (FEA), resolving non-linear topology optimizations on a sparse GPU-accelerated grid. By solving the SIMP (Solid Isotropic Material with Penalization) compliance equation with a penalized density exponent of <span className="text-indigo-500 font-mono font-bold">p = 3.0</span> and incorporating a signed Ginzburg-Landau level-set boundary model, it synthesizes manufacturing-ready manifolds. With real-time Young's modulus updates and multi-grid preconditioned conjugate gradient (MGCG) solvers, the kernel guarantees kinematic stability in under <span className="text-indigo-500 font-mono font-bold">180ms</span> per iteration step.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-8 pt-4">
              <KernelFeature 
                icon={<Activity size={20} className="text-emerald-500" />} 
                title="SIMP Density Optimizer" 
                desc="Computes continuous density coordinates x_e ∈ [0, 1] penalized by exponent p=3.0, driving absolute void-solid separation under volume fraction limit V* ≤ 0.35." 
              />
              <KernelFeature 
                icon={<ShieldCheck size={20} className="text-blue-500" />} 
                title="Level-Set Boundary PDE" 
                desc="Tracks physical phase boundaries by solving Hamilton-Jacobi partial differential equations ∂ϕ/∂t + V_n |∇ϕ| = 0 on a 3D grid, guaranteeing pristine C² manifolds." 
              />
              <KernelFeature 
                icon={<Zap size={20} className="text-amber-500" />} 
                title="Biomorphic Stress Growth" 
                desc="Evaluates local Von Mises stress tensors σ_vm dynamically and adjusts material thickness proportionally to optimize stress concentrations." 
              />
              <KernelFeature 
                icon={<Cpu size={20} className="text-purple-500" />} 
                title="Sparse Direct Solver" 
                desc="Factorizes global stiffness matrices K·u = F with up to 8.2 million degrees of freedom using sparse Cholesky backends, converging with force residue norm ||r||_2 ≤ 10⁻⁶." 
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSimulationClick}
              className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 flex items-center gap-3 group border border-indigo-400/20"
            >
              <Zap size={18} className="text-indigo-600" />
              Test AI Engine Performance
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square lg:aspect-auto lg:h-[600px]"
          >
            {/* Abstract Tech Visualization */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[3rem] blur-3xl opacity-50" />
            <div className="relative w-full h-full bg-zinc-800/40 backdrop-blur-3xl rounded-[4rem] border border-white/5 flex items-center justify-center overflow-hidden shadow-2xl group">
               <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30">
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                      <pattern id="grid-thick" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-indigo-500/30"/>
                      </pattern>
                      <pattern id="grid-thin" width="5" height="5" patternUnits="userSpaceOnUse">
                        <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-indigo-500/10"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid-thin)" />
                    <rect width="100" height="100" fill="url(#grid-thick)" />
                  </svg>
               </div>
               
               {/* Scanning Line Animation */}
               <motion.div 
                 animate={{ top: ['0%', '100%', '0%'] }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent z-10 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
               />

               {/* Floating holographic elements */}
               <div className="relative w-full h-full flex items-center justify-center">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                   className="absolute w-80 h-80 border-[0.5px] border-indigo-500/10 rounded-full flex items-center justify-center"
                 >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                    <div className="w-64 h-64 border-[0.5px] border-purple-500/20 rounded-full border-dashed" />
                 </motion.div>
                 
                 <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                   className="absolute w-96 h-96 border-[0.5px] border-white/5 rounded-full"
                 >
                    <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-purple-500 rounded-full" />
                 </motion.div>

                 <div className="flex flex-col items-center gap-4 z-20">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="p-8 bg-background/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl relative"
                    >
                       <Cpu size={48} className="text-indigo-500" />
                       <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping" />
                    </motion.div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-black">Kernel v.2.4 Active</span>
                      <div className="text-4xl font-black text-foreground font-unique tracking-tighter">OPTIMIZED</div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div 
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
                            className="h-1 w-4 bg-emerald-500 rounded-full" 
                          />
                        ))}
                      </div>
                    </div>
                 </div>
               </div>

               {/* Random data points */}
               {[...Array(6)].map((_, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: [0, 0.5, 0], x: [0, (i%2?20:-20)], y: [0, (i%2?20:-20)] }}
                   transition={{ duration: 5 + i, repeat: Infinity, delay: i }}
                   className="absolute text-[8px] font-mono text-indigo-300 pointer-events-none"
                   style={{ 
                     top: `${20 + (i * 12)}%`, 
                     left: `${15 + (i * 10)}%` 
                   }}
                 >
                   0x{Math.random().toString(16).slice(2, 6).toUpperCase()}
                 </motion.div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const KernelFeature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex gap-4">
    <div className="mt-1">{icon}</div>
    <div>
      <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground dark:text-zinc-300 leading-relaxed font-light">{desc}</p>
    </div>
  </div>
);
