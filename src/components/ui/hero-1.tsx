import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  onDemoClick?: () => void;
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  eyebrow,
  ctaLabel,
  ctaHref,
  onCtaClick,
  onDemoClick,
  className
}) => {
  const [index, setIndex] = useState(0);
  const phrases = ["THINK", "BUILD"];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={cn("relative min-h-screen pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center", className)}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
        
        {/* Animated Aurora Blobs */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0], 
            y: [0, -50, 0],
            scale: [1.2, 1, 1.2] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-600/10 blur-[150px]"
        />

        {/* Mesh Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto relative z-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          {eyebrow && (
            <div className="px-6 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] font-unique shadow-[0_0_20px_rgba(79,70,229,0.2)]">
              {eyebrow}
            </div>
          )}

          <h1 className="text-6xl md:text-9xl lg:text-[11rem] font-black leading-[0.85] tracking-tightest uppercase font-unique text-foreground max-w-7xl">
            <div className="relative h-[2.5em] overflow-hidden flex flex-col items-center justify-center -my-16 px-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phrases[index]}
                  initial={{ y: "100%", opacity: 0, rotateX: -90, filter: "blur(10px)" }}
                  animate={{ 
                    y: "0%", 
                    opacity: 1, 
                    rotateX: 0, 
                    filter: "blur(0px)",
                    backgroundPosition: ["0% 50%", "200% 50%"]
                  }}
                  exit={{ y: "-100%", opacity: 0, rotateX: 90, filter: "blur(10px)" }}
                  transition={{ 
                    duration: 1, 
                    ease: [0.76, 0, 0.24, 1],
                    backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" }
                  }}
                  className="flex items-center justify-center gap-10 py-12 overflow-visible"
                >
                  <span className="inline-block select-none bg-gradient-to-r dark:from-white dark:via-indigo-100 dark:to-white from-zinc-900 via-indigo-600 to-zinc-900 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-mask dark:drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] drop-shadow-sm">
                    {phrases[index]}
                  </span>
                  <span className="relative inline-block group bg-gradient-to-r dark:from-white dark:via-indigo-100 dark:to-white from-zinc-900 via-indigo-600 to-zinc-900 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-mask dark:drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] drop-shadow-sm">
                    IT.
                    <motion.span
                      animate={{ 
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -inset-x-8 -inset-y-4 bg-indigo-500/20 blur-3xl rounded-full -z-10 pointer-events-none"
                    />
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </h1>

        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-base md:text-xl dark:text-white/90 text-zinc-800 font-bold uppercase tracking-tight font-technical leading-relaxed dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] drop-shadow-none"
          >
            {subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-10"
          >
            <motion.button
              initial={{ backgroundColor: "#6366f1", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(99,102,241,0.6)", backgroundColor: "#4f46e5" }}
              whileTap={{ scale: 0.98 }}
              onClick={onCtaClick}
              className="group px-10 py-5 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.15em] font-technical flex items-center justify-center gap-4 transition-all relative z-50 border border-indigo-400/20 active:outline-none"
            >
              <Sparkles size={16} className="text-indigo-200 group-hover:rotate-12 transition-transform" />
              {ctaLabel || "Get Started"}
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-indigo-200" />
            </motion.button>
            <motion.button
              initial={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.25)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onDemoClick}
              className="px-10 py-5 border dark:text-neutral-200 dark:border-white/10 border-neutral-300 text-neutral-800 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] font-technical backdrop-blur-md transition-all relative z-50 active:outline-none"
            >
              Live Simulation
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Bottom Transition Bleed - Fixed to support dynamic backgrounds and reduced height to prevent blocking */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t dark:from-zinc-950 dark:via-zinc-950/80 from-background via-background/80 to-transparent z-10 pointer-events-none transition-colors duration-300" />
      </div>

      {/* Decorative scanning lines */}
      <motion.div 
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent z-0"
      />
      <motion.div 
        animate={{ bottom: ['0%', '100%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent z-0"
      />

      {/* Floating Background Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            x: [0, (Math.random() - 0.5) * 50, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-1 h-1 bg-indigo-500 rounded-full blur-[2px] z-0"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </section>
  );
};
