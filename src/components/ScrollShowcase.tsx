"use client";
import React from "react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { motion } from "motion/react";

export function ScrollShowcase() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-xs font-black text-indigo-500 uppercase tracking-[0.5em] mb-4 font-mono"
            >
              Structural Intelligence Layer
            </motion.span>
            <h1 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tightest leading-none font-unique text-center">
              Accelerate the <br />
              <span className="bg-gradient-to-r dark:from-white from-indigo-900 dark:via-indigo-200 via-indigo-500 dark:to-white to-indigo-900 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-mask font-black">
                Engineering Cycle
              </span>
            </h1>
          </div>
        }
      >
        <div className="relative w-full h-full group bg-zinc-900 rounded-2xl overflow-hidden cursor-crosshair">
          <img
            src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000"
            alt="Polystrukt Generative Engine"
            className="mx-auto rounded-2xl object-cover h-full w-full object-center transition-all duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0 brightness-75 group-hover:brightness-100"
            draggable={false}
          />
          
          {/* Digital Scanning Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-[200%] -top-full animate-[pulse_4s_infinite] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
          
          {/* CAD Grid lines */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-30" 
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Dynamic Technical Labels */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
            <div className="px-3 py-1 bg-zinc-950/90 backdrop-blur-md rounded-lg border border-white/10 text-[9px] font-mono text-white/70 uppercase flex items-center gap-2 shadow-2xl">
              <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
              POLY_SYNTHESIS: VERIFIED
            </div>
            <div className="px-3 py-1 bg-zinc-950/90 backdrop-blur-md rounded-lg border border-white/10 text-[9px] font-mono text-white/70 uppercase shadow-2xl">
              VOXEL_PRECISION: 0.001A
            </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-mono uppercase tracking-tighter">
              Stress Core: 12.4GPA
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-mono uppercase tracking-tighter">
              Safety Factor: 2.4x
            </div>
          </div>
          
          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 z-20">
            <div className="text-[9px] font-mono text-indigo-400 uppercase tracking-[0.3em] font-black">KERNEL_EXPANSION</div>
            <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
               <motion.div 
                 initial={{ width: "0%" }}
                 whileInView={{ width: "94%" }}
                 transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
                 className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,1)]"
               />
            </div>
          </div>

          {/* Corner Decals */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-white/20 m-4 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-white/20 m-4 pointer-events-none" />
          
          {/* Axis Indicators */}
          <div className="absolute bottom-6 left-6 font-mono text-[8px] text-zinc-600 flex gap-4 pointer-events-none">
             <div><span className="text-red-500/50 mr-1">X</span> 0.000</div>
             <div><span className="text-emerald-500/50 mr-1">Y</span> 0.000</div>
             <div><span className="text-indigo-500/50 mr-1">Z</span> 0.000</div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
