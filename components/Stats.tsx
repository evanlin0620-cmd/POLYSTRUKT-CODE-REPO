import React from 'react';
import { motion } from 'framer-motion';
import { StatItem } from '../types';

const stats: StatItem[] = [
  { label: "Generation Speed", value: "< 2.4s", desc: "Rapid concept-to-mesh rendering latency." },
  { label: "File Capability", value: "STEP/STL", desc: "Direct export to manufacturing formats." },
  { label: "Context Window", value: "1M+", desc: "Full assembly awareness in prompt." },
];

export const Stats: React.FC = () => {
  return (
    <section id="tech" className="py-32 px-6 max-w-7xl mx-auto bg-zinc-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: i * 0.2, duration: 0.8, ease: "easeOut" }}
            className="border-t border-zinc-200 pt-8 group cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-purple-600 transition-colors">{stat.label}</h3>
              <div className="w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-purple-600 transition-colors" />
            </div>
            <div className="text-6xl font-light tracking-tighter text-zinc-900 mb-4 font-space">{stat.value}</div>
            <p className="text-zinc-500 leading-relaxed max-w-[200px]">{stat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};