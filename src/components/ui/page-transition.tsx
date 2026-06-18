import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon, Layers, Box } from 'lucide-react';

interface PageTransitionProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ isVisible, onComplete }) => {
  const letters = Array.from("POLYSTRUKT");

  const [statusText, setStatusText] = React.useState("Initializing Core");
  const [percent, setPercent] = React.useState(0);

  React.useEffect(() => {
    if (!isVisible) return;
    setPercent(0);
    const textSequence = [
      "Accessing Machine Grid...",
      "Resolving SIMP Compliance...",
      "Compiling Procedural B-Rep...",
      "Verifying Mesh G-Code...",
      "Optimizing Finite Matrices...",
      "Securing Multi-Grid Clusters...",
      "Kernels Aligned & Ready"
    ];
    let textIdx = 0;
    setStatusText(textSequence[0]);

    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % textSequence.length;
      setStatusText(textSequence[textIdx]);
    }, 220);

    const percentInterval = setInterval(() => {
      setPercent(p => {
        if (p >= 100) return 100;
        const inc = Math.floor(Math.random() * 9) + 6;
        return Math.min(100, p + inc);
      });
    }, 90);

    return () => {
      clearInterval(textInterval);
      clearInterval(percentInterval);
    };
  }, [isVisible]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 14,
      }
    }
  };

  const originY = isVisible ? 0 : 1;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <>
          {/* Parallax Backing Glass Curtain */}
          <motion.div
             initial={{ scaleY: 0 }}
             animate={{ scaleY: 1 }}
             exit={{ scaleY: 0 }}
             transition={{ 
               duration: 0.65, 
               ease: [0.76, 0, 0.24, 1] 
             }}
             style={{ originY }}
             className="fixed inset-0 z-[990] bg-indigo-950/40 backdrop-blur-md pointer-events-none"
          />

          {/* Main Transition Canvas */}
          <motion.div
             initial={{ scaleY: 0 }}
             animate={{ scaleY: 1 }}
             exit={{ scaleY: 0 }}
             transition={{ 
               duration: 0.7, 
               ease: [0.76, 0, 0.24, 1] 
             }}
             style={{ originY }}
             className="fixed inset-0 z-[1000] bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-955 flex flex-col items-center justify-center pointer-events-auto overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.6)]"
          >
            {/* Fine Tech Lattice Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-80" />
            
            {/* Dynamic Depth Ambient Glowing Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[7000ms]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[5000ms]" />

            {/* Dissolution container on exit */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -25 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center"
            >
              
              {/* Dynamic Interactive Double-Nested CAD Logo Core in standard target grid */}
              <div className="relative flex items-center justify-center w-36 h-36 mb-8">
                
                {/* HUD Sector Brackets */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.35, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Top-Left Bracket */}
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-indigo-500/60 rounded-tl-sm" />
                  <span className="absolute top-1 left-7 text-[8px] font-mono text-indigo-500/50 font-black tracking-widest">[SEC_A]</span>
                  
                  {/* Top-Right Bracket */}
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-indigo-500/60 rounded-tr-sm" />
                  
                  {/* Bottom-Left Bracket */}
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-indigo-500/60 rounded-bl-sm" />
                  
                  {/* Bottom-Right Bracket */}
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-indigo-500/60 rounded-br-sm" />
                  <span className="absolute bottom-1 right-7 text-[8px] font-mono text-purple-500/50 font-black tracking-widest">[GRID_42]</span>
                </motion.div>

                {/* Vertical & Horizontal Crosshairs */}
                <div className="absolute w-[140%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                <div className="absolute h-[140%] w-[1px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent" />

                {/* Outermost Hex Ring (Rotating) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                  className="absolute inset-3 text-white/5"
                >
                  <Hexagon className="w-full h-full stroke-[1px]" />
                </motion.div>

                {/* Outer Rotator Accent (Rotates opposite) */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="absolute inset-7 text-indigo-500/20"
                >
                  <Hexagon className="w-full h-full stroke-[1.5px]" />
                </motion.div>

                {/* Inner Layer Plate (Slightly Pulsing) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
                  className="absolute inset-10 text-purple-400/40"
                >
                  <Layers className="w-full h-full stroke-[1.5px]" />
                </motion.div>

                {/* Pristine Glass Core Emblem */}
                <motion.div
                  animate={{ 
                    scale: [0.94, 1.06, 0.94],
                    boxShadow: [
                      "0 0 25px rgba(99,102,241,0.2)",
                      "0 0 50px rgba(168,85,247,0.45)",
                      "0 0 25px rgba(99,102,241,0.2)"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="absolute inset-14 flex items-center justify-center text-white bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_0_35px_rgba(99,102,241,0.3)]"
                >
                  <Box className="w-7 h-7 text-indigo-300 stroke-[2px] drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] animate-pulse" />
                </motion.div>

                {/* Expanding Kinetic shockwave ripples */}
                <motion.div
                  animate={{ scale: [1, 2.3], opacity: [0.35, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-indigo-500/25 pointer-events-none"
                />
                <motion.div
                  animate={{ scale: [1, 2.3], opacity: [0.2, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 1.1, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-purple-500/20 pointer-events-none"
                />
              </div>

              {/* Sophisticated Type Pairing */}
              <div className="text-center space-y-5">
                <motion.h1 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-4xl sm:text-5xl font-black text-white uppercase tracking-[0.55em] font-unique select-none flex justify-center pl-[0.55em]"
                  style={{ textShadow: "0 0 20px rgba(99,102,241,0.15)" }}
                >
                  {letters.map((char, index) => (
                    <motion.span 
                      key={index}
                      variants={letterVariants}
                      className="inline-block transition-colors duration-300 cursor-default"
                      whileHover={{ 
                        scale: 1.18, 
                        color: "#818cf8",
                        textShadow: "0 0 20px rgba(129,140,248,0.95)" 
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.h1>

                {/* Subtext and High-End Smooth Loading Progress Suite */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.55 }}
                  className="space-y-4 flex flex-col items-center"
                >
                  {/* Live Status String */}
                  <div className="h-4 flex items-center justify-center">
                    <motion.p 
                      key={statusText}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.4em] font-bold"
                    >
                      {statusText}
                    </motion.p>
                  </div>
                  
                  {/* Solid Gradient Progress Trough */}
                  <div className="relative h-[5px] w-72 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                     <motion.div
                       animate={{ width: `${percent}%` }}
                       transition={{ ease: "easeOut", duration: 0.15 }}
                       className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.9)]"
                     />
                  </div>

                  {/* High Tech Metrics */}
                  <div className="flex justify-between items-center w-72 text-[9px] font-mono font-medium tracking-widest text-zinc-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      SECURE_LINK // {percent}%
                    </span>
                    <span className="text-zinc-600">SYS_V2.4.8</span>
                  </div>
                </motion.div>
                
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
