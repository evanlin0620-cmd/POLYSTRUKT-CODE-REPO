import React from 'react';
import { motion } from 'framer-motion';
import { ThreeScene } from './ThreeScene';

export const Hero: React.FC = () => {
  const handleOpenWorkspace = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'workspace' } }));
  };

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden" aria-label="Hero Section">
      <div role="img" aria-label="3D Engineering Visualization" className="absolute inset-0">
         <ThreeScene />
      </div>

      {/* Hero Content */}
      <div className="z-10 text-center space-y-8 pointer-events-none relative px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-block border border-zinc-200 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full mb-8 shadow-sm">
             <span className="text-xs font-mono tracking-widest text-zinc-600 uppercase font-medium">GenCAD V.1.0 Online</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 via-zinc-500 to-zinc-900 pb-2 leading-[0.9] drop-shadow-sm select-none">
            Thoughts <br /> To Form.
          </h1>
          
          <p className="mt-8 text-lg md:text-xl font-medium tracking-wide max-w-lg mx-auto text-transparent bg-clip-text bg-gradient-to-br from-zinc-800 via-zinc-500 to-zinc-800">
            Describe your mechanics. We build the design.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pointer-events-auto pt-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleOpenWorkspace}
              className="px-8 py-3.5 bg-zinc-900 text-white rounded-full font-medium transition-transform hover:scale-105 shadow-xl shadow-zinc-900/20 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
            >
              Generate Model
            </button>
            <button className="px-8 py-3.5 bg-white/80 backdrop-blur-md border border-zinc-200 text-zinc-900 rounded-full font-medium transition-colors hover:bg-white hover:border-zinc-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2">
              How it Works
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 mix-blend-darken"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-widest text-zinc-800 font-medium">Input</span>
        <div className="w-px h-12 bg-zinc-800" />
      </motion.div>
    </section>
  );
};