
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, FileText, Box, Grid, Activity, Sparkles, Command, Copy, Check, Zap } from 'lucide-react';
import { Project } from '../types';

const projects: Project[] = [
  { 
    id: 1, 
    title: 'Turbine Housing', 
    category: 'CAD Wireframe Analysis', 
    prompt: 'Generate a radial inflow turbine housing with A/R ratio 0.82. Material: Ni-Resist D-5S. Optimize volute curvature for adiabatic efficiency.',
    image: 'https://images.unsplash.com/photo-159742324403d-11250f86237c?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    id: 2, 
    title: 'Lattice Bracket', 
    category: 'Topology Optimization', 
    prompt: 'Create a topology-optimized suspension bracket. Constraints: 5kN vertical load, 4x M8 mounting points. Structure: Gyroid lattice, Ti-6Al-4V.',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    id: 3, 
    title: 'Piston Assembly', 
    category: 'Technical Blueprint', 
    prompt: 'Design a forged piston for high-boost application. Bore: 86mm. Compression height: 30mm. Features: Valve reliefs, oil squirt clearance.',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800' 
  },
  { 
    id: 4, 
    title: 'Heat Exchanger', 
    category: 'Thermal Array Specs', 
    prompt: 'Model a counter-flow heat exchanger core. Fluid A: Oil, Fluid B: Air. Matrix: Offset strip fin. Max pressure drop: 15kPa within 10x10x5cm volume.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800' 
  },
];

export const Gallery: React.FC = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

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
    <section id="work" className="py-32 bg-zinc-50 relative overflow-hidden" aria-labelledby="gallery-heading">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-purple-600 font-unique text-xs font-black tracking-widest">
              <Zap size={14} />
              <span>FORM LIBRARY</span>
            </div>
            <h2 
              id="gallery-heading"
              className="text-6xl md:text-8xl font-black tracking-tighter font-unique leading-none bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-600"
            >
              Generative <br /> Archive
            </h2>
          </motion.div>
          <div className="text-zinc-400 font-technical text-xs max-w-xs text-left md:text-right leading-relaxed" aria-hidden="true">
            <span className="block text-zinc-900 font-bold mb-1">PROMPT VERIFICATION ENGINE</span>
            Explore the neural history of high-fidelity mechanical assemblies and generative blueprints.
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10" role="list">
          {projects.map((item) => (
            <motion.div 
              key={item.id}
              role="listitem"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group aspect-[16/10] bg-zinc-950 rounded-3xl overflow-hidden relative shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(139,92,246,0.3)] transition-all duration-700 w-full"
            >
               {/* Image Container */}
               <div className="absolute inset-0 w-full h-full transform transition-transform duration-1000 group-hover:scale-110">
                  <img 
                    src={item.image} 
                    alt={`Render of ${item.title}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700"
                  />
                  {/* Digital Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               </div>

               {/* Hover Scan Line */}
               <motion.div 
                  className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent z-10 opacity-0 group-hover:opacity-100"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               />

               {/* Prompt Reveal Overlay */}
               <div className="absolute inset-0 flex items-center justify-center p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 pointer-events-none group-hover:pointer-events-auto">
                  <motion.div 
                    className="bg-zinc-950/90 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl w-full max-w-md transform translate-y-10 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden"
                  >
                      {/* Interaction Area */}
                      <div 
                        onClick={() => handlePromptAction(item.prompt || '')}
                        className="cursor-pointer group/prompt"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3 text-[10px] font-technical uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                              <Command size={12} />
                              <span>INITIATE_SEQUENCE</span>
                          </div>
                          
                          <button 
                            onClick={(e) => handleCopy(e, item.id, item.prompt || '')}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all focus:outline-none"
                            title="Copy Prompt"
                          >
                            <AnimatePresence mode="wait">
                              {copiedId === item.id ? (
                                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={16} className="text-emerald-400" /></motion.div>
                              ) : (
                                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={16} /></motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>

                        <p className="font-technical text-sm md:text-base text-zinc-200 leading-relaxed tracking-tight group-hover/prompt:text-white transition-colors duration-300">
                          <span className="text-purple-500 font-bold mr-3 select-none text-lg">›</span>
                          {item.prompt}
                          <span className="inline-block w-2 h-4 bg-purple-500/60 ml-2 animate-pulse align-middle" />
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl border border-white/5 group-hover/prompt:bg-white/10 group-hover/prompt:border-purple-500/30 transition-all">
                           <Sparkles size={14} className="text-purple-400" />
                           <span className="text-[10px] font-unique font-black tracking-widest text-zinc-400 group-hover/prompt:text-white">CLICK TO LOAD INTO ENGINE</span>
                        </div>
                      </div>
                  </motion.div>
               </div>

               {/* Static Content Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 pointer-events-none" />
               
               <div className="absolute bottom-8 left-8 right-8 text-white z-10 flex justify-between items-end group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-500 ease-in-out">
                 <div>
                   <h3 className="text-3xl font-black mb-2 tracking-tighter font-unique">{item.title}</h3>
                   <div className="flex items-center gap-3">
                     <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/20 text-purple-400">
                       {item.id === 1 && <Box size={14} />}
                       {item.id === 2 && <Grid size={14} />}
                       {item.id === 3 && <FileText size={14} />}
                       {item.id === 4 && <Activity size={14} />}
                     </div>
                     <p className="text-zinc-400 font-technical text-[10px] uppercase tracking-widest font-bold">{item.category}</p>
                   </div>
                 </div>
                 
                 <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all">
                   <ArrowUpRight size={20} className="text-zinc-300" />
                 </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
