import React from 'react';
import { motion } from 'motion/react';
import { StatItem } from '../types';

const stats: StatItem[] = [
  { label: "Generation Speed", value: "< 1.2s", desc: "Rapid concept-to-mesh rendering latency." },
  { label: "Output Accuracy", value: "99.98%", desc: "Precise dimensional synthesis matching." },
  { label: "Context Window", value: "2M+", desc: "Full assembly awareness in prompt." },
];

export const Stats: React.FC = () => {
  return (
    <section id="tech" className="py-24 px-6 max-w-7xl mx-auto bg-transparent relative z-10 overflow-visible">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 lg:gap-32 relative z-10">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group cursor-default relative w-full"
          >
            <div className="absolute -inset-10 bg-accent/0 group-hover:bg-accent/50 rounded-[3rem] transition-all duration-700 -z-10" />
            <div className="border-t border-border/60 pt-10 h-full flex flex-col group-hover:border-indigo-500 transition-colors duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground dark:text-zinc-100 group-hover:text-indigo-400 transition-colors font-unique">{stat.label}</h3>
                <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 bg-muted rounded-full group-hover:bg-indigo-500/50 transition-all duration-300" />
                   <div className="w-1.5 h-1.5 bg-muted rounded-full group-hover:bg-indigo-500 transition-all duration-300" />
                </div>
              </div>
              <div className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tightest text-foreground dark:text-white mb-6 font-display group-hover:text-indigo-500 transition-all duration-500 group-hover:scale-105 origin-left">
                {stat.value}
              </div>
              <p className="text-foreground/80 dark:text-zinc-100 text-xs font-technical uppercase tracking-widest leading-relaxed max-w-[240px] opacity-100 transition-opacity">
                {stat.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
