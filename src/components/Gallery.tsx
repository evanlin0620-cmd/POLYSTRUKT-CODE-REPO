
import React, { useState, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, FileText, Box, Grid, Activity, Sparkles, Command, Copy, Check, Zap } from 'lucide-react';
import { Project, ProceduralSpec } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ProceduralModel } from './ProceduralModel';

const projects: Project[] = [
  { 
    id: 1, 
    title: 'Turbine Housing', 
    category: 'CAD Wireframe Analysis', 
    prompt: 'Generate a radial inflow turbine housing with A/R ratio 0.82. Material: Ni-Resist D-5S. Optimize volute curvature for adiabatic efficiency.',
    image: 'https://images.unsplash.com/photo-1544383120-d4347715fbc3?auto=format&fit=crop&q=80&w=800',
    proceduralSpec: {
      op: "subtract",
      a: {
        type: "cylinder",
        args: [40, 45, 25, 32],
        color: "#818cf8"
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [32, 32, 35, 32], position: [0, 0, 0] },
          { type: "cylinder", args: [12, 12, 80, 16], position: [25, 0, 0], rotation: [0, 90, 0] }
        ]
      }
    }
  },
  { 
    id: 2, 
    title: 'Topological Bracket', 
    category: 'Topology Optimization', 
    prompt: 'Create a topology-optimized suspension bracket. Constraints: 5kN vertical load, 4x M8 mounting points. Structure: Gyroid lattice, Ti-6Al-4V.',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=800',
    proceduralSpec: {
      op: "subtract",
      a: {
        op: "union",
        a: {
          op: "group",
          children: [
            { type: "box", args: [60, 8, 40], position: [0, -15, 0], color: "#10b981" },
            { type: "box", args: [8, 60, 40], position: [-26, 11, 0], color: "#10b981" }
          ]
        },
        b: {
          type: "box",
          args: [35, 35, 8],
          position: [-9, 6, 0],
          rotation: [0, 0, 45],
          color: "#34d399"
        }
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [5, 5, 20, 16], position: [18, -15, 10], rotation: [90, 0, 0] },
          { type: "cylinder", args: [5, 5, 20, 16], position: [18, -15, -10], rotation: [90, 0, 0] },
          { type: "cylinder", args: [10, 10, 15, 16], position: [-10, 10, 0], rotation: [0, 90, 0] }
        ]
      }
    }
  },
  { 
    id: 3, 
    title: 'Forged Piston Assembly', 
    category: 'Technical Blueprint', 
    prompt: 'Design a forged piston for high-boost application. Bore: 86mm. Compression height: 30mm. Features: Valve reliefs, oil squirt clearance.',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=800',
    proceduralSpec: {
      op: "subtract",
      a: {
        type: "cylinder",
        args: [35, 35, 50, 32],
        color: "#f59e0b"
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [8, 8, 80, 16], position: [0, -5, 0], rotation: [0, 90, 0] },
          { type: "cylinder", args: [28, 28, 40, 32], position: [0, -10, 0] },
          { type: "torus", args: [35, 2, 8, 32], position: [0, 15, 0], rotation: [90, 0, 0] },
          { type: "torus", args: [35, 2, 8, 32], position: [0, 10, 0], rotation: [90, 0, 0] }
        ]
      }
    }
  },
  { 
    id: 4, 
    title: 'Heat Exchanger Core', 
    category: 'Thermal Array Specs', 
    prompt: 'Model a counter-flow heat exchanger core. Fluid A: Oil, Fluid B: Air. Matrix: Offset strip fin. Max pressure drop: 15kPa within 10x10x5cm volume.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    proceduralSpec: {
      op: "union",
      a: { type: "box", args: [60, 5, 60], position: [0, 0, 0], color: "#f43f5e" },
      b: {
        op: "group",
        children: [
          { type: "box", args: [2, 25, 50], position: [-18, 12.5, 0], color: "#fda4af" },
          { type: "box", args: [2, 25, 50], position: [-9, 12.5, 0], color: "#fda4af" },
          { type: "box", args: [2, 25, 50], position: [0, 12.5, 0], color: "#fda4af" },
          { type: "box", args: [2, 25, 50], position: [9, 12.5, 0], color: "#fda4af" },
          { type: "box", args: [2, 25, 50], position: [18, 12.5, 0], color: "#fda4af" }
        ]
      }
    }
  },
];

function AutoRotatingModel({ spec }: { spec: ProceduralSpec }) {
  const groupRef = useRef<any>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <ProceduralModel spec={spec} />
    </group>
  );
}

const GalleryModelPreview: React.FC<{ spec: ProceduralSpec }> = ({ spec }) => {
  const AmbientLight = 'ambientLight' as any;
  const DirectionalLight = 'directionalLight' as any;
  const PointLight = 'pointLight' as any;

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas 
        camera={{ position: [0, 0, 16], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <AmbientLight intensity={1.8} />
        <DirectionalLight position={[10, 10, 10]} intensity={1.6} />
        <PointLight position={[-15, -15, -10]} intensity={0.6} />
        <Suspense fallback={null}>
          <AutoRotatingModel spec={spec} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export const Gallery: React.FC = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { login } = useAuth();

  const handleCopy = (e: React.MouseEvent, id: number, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePromptAction = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'workspace', prompt } }));
  };

  return (
    <section id="work" className="py-24 bg-transparent relative overflow-hidden" aria-labelledby="gallery-heading">
      {/* Background Aurora Bloom */}
      
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden antialiased">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[50rem] w-[50rem] bg-indigo-500/5 blur-[140px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 text-indigo-400 font-unique text-[10px] font-black tracking-[0.4em] uppercase">
              <Zap size={14} className="animate-pulse" />
              <span>Blueprint Archive</span>
            </div>
            <h2 
              id="gallery-heading"
              className="text-7xl md:text-9xl font-black tracking-tightest font-unique leading-[0.8] text-foreground uppercase"
            >
              Recent <br /> <span className="bg-gradient-to-r from-zinc-500 to-zinc-800 bg-clip-text text-transparent">Synthesis</span>
            </h2>
          </motion.div>
          <div className="text-foreground/80 dark:text-zinc-300 font-technical text-[11px] max-w-xs text-left md:text-right leading-relaxed uppercase tracking-widest" aria-hidden="true">
            <span className="block text-indigo-400 font-black mb-2 tracking-[0.2em] drop-shadow-sm">VERIFIED NEURAL OUTPUTS</span>
            Sequential design logs extracted from the structural core archive.
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12" role="list">
          {projects.map((item) => (
            <motion.div 
              key={item.id}
              role="listitem"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group aspect-[16/10] bg-card border border-border rounded-[2.5rem] overflow-hidden relative shadow-2xl hover:shadow-indigo-500/10 hover:border-border transition-all duration-700 w-full p-px"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
               
               {/* Image or 3D Model Container */}
               <div className="absolute inset-0 w-full h-full transform transition-transform duration-1000">
                  {item.proceduralSpec ? (
                    <div className="w-full h-full relative z-10 bg-zinc-950/40">
                      <GalleryModelPreview spec={item.proceduralSpec} />
                    </div>
                  ) : (
                    <img 
                      src={item.image} 
                      alt={`Render of ${item.title}`}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544383120-d4347715fbc3?auto=format&fit=crop&q=80&w=800';
                      }}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-100"
                    />
                  )}
                  {/* Neural Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/30 to-transparent pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:200px_200px] pointer-events-none" />
               </div>

               {/* Interaction Logic Overlay */}
               <div className="absolute inset-0 flex items-center justify-center p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 pointer-events-none group-hover:pointer-events-auto">
                  <motion.div 
                    className="bg-background/95 backdrop-blur-xl border border-border p-8 rounded-3xl w-full max-w-md transform translate-y-10 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl relative overflow-hidden"
                  >
                      <div 
                        onClick={() => handlePromptAction(item.prompt || '')}
                        className="cursor-pointer group/prompt"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 shadow-sm">
                              <Command size={12} />
                              <span>INITIATE DECRYPTION</span>
                          </div>
                          
                          <motion.button 
                            whileHover={{ scale: 1.1, backgroundColor: 'var(--accent)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleCopy(e, item.id, item.prompt || '')}
                            className="p-3 rounded-2xl bg-accent border border-border text-muted-foreground hover:text-foreground transition-all focus:outline-none shadow-sm"
                          >
                            <AnimatePresence mode="wait">
                              {copiedId === item.id ? (
                                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={16} className="text-emerald-500" /></motion.div>
                              ) : (
                                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={16} /></motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
 
                        <p className="font-technical text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed tracking-tight group-hover/prompt:text-indigo-600 dark:group-hover/prompt:text-white transition-colors duration-300">
                          <span className="text-indigo-500 font-bold mr-3 select-none">λ</span>
                          {item.prompt}
                        </p>
 
                        <div className="mt-8 flex items-center justify-center gap-3 py-4 bg-accent rounded-2xl border border-border group-hover/prompt:bg-indigo-500/10 group-hover/prompt:border-indigo-500/20 transition-all shadow-sm text-foreground">
                           <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                           <span className="text-[9px] font-unique font-black tracking-[0.4em] text-muted-foreground group-hover/prompt:text-foreground uppercase">Load into Simulation</span>
                        </div>
                      </div>
                  </motion.div>
               </div>

               {/* Info Overlay */}
               <div className="absolute bottom-10 left-10 right-10 text-foreground z-10 flex justify-between items-end group-hover:opacity-0 group-hover:translate-y-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                 <div className="space-y-4">
                   <div className="flex items-center gap-4">
                     <div className="p-3 bg-background/80 rounded-2xl border border-border text-indigo-500 shadow-xl backdrop-blur-md">
                        {item.id === 1 && <Box size={20} />}
                        {item.id === 2 && <Grid size={20} />}
                        {item.id === 3 && <FileText size={20} />}
                        {item.id === 4 && <Activity size={20} />}
                     </div>
                     <div>
                        <p className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.3em] mb-1">{item.category}</p>
                        <h3 className="text-3xl font-black tracking-tighter font-unique text-foreground">{item.title}</h3>
                     </div>
                   </div>
                 </div>
                 
                 <div className="w-14 h-14 rounded-[1.25rem] bg-background/80 border border-border flex items-center justify-center transition-all shadow-2xl backdrop-blur-md group-hover:scale-90 opacity-80">
                   <ArrowUpRight size={24} className="text-muted-foreground" />
                 </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
