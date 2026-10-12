import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, Zap, Target, Shield, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PricingInteractionProps {
  starterMonth: number;
  starterAnnual: number;
  proMonth: number;
  proAnnual: number;
  onSelectPlan?: (plan: string) => void;
}

export const PricingInteraction: React.FC<PricingInteractionProps> = ({
  starterMonth,
  starterAnnual,
  proMonth,
  proAnnual,
  onSelectPlan
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      id: "starter",
      month: starterMonth,
      annual: starterAnnual,
      icon: Target,
      features: ["Standard Synthesis Engine", "10 Generations / Day", "4 TFLOPS Priority", "Basic STL Export"],
      color: "border-zinc-800"
    },
    {
      name: "Pro Core",
      id: "pro",
      month: proMonth,
      annual: proAnnual,
      icon: Cpu,
      features: ["Deep Neuro Synthesis", "Infinite Generations", "24 TFLOPS Priority", "Full STEP/GLB Export", "Team Collaboration"],
      color: "border-indigo-500",
      popular: true
    }
  ];

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Toggle */}
      <div className="flex items-center gap-6 p-2 bg-accent/40 border border-border rounded-2xl backdrop-blur-3xl shadow-xl">
        <button 
          onClick={() => setIsAnnual(false)}
          className={cn(
            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            !isAnnual ? "bg-indigo-600 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <button 
          onClick={() => setIsAnnual(true)}
          className={cn(
            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
            isAnnual ? "bg-indigo-600 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Annual
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] rounded-md font-mono">-20%</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className={cn(
              "relative w-full md:w-[320px] p-10 rounded-[3rem] bg-accent/30 border-2 backdrop-blur-3xl shadow-2xl overflow-hidden transition-all",
              plan.popular ? "border-indigo-500 ring-4 ring-indigo-500/5 bg-indigo-500/[0.03]" : "border-border"
            )}
          >
            {plan.popular && (
              <div className="absolute top-8 right-8">
                <div className="px-3 py-1 bg-indigo-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                  Recommended
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="space-y-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", plan.popular ? "bg-indigo-500 text-white border-indigo-400" : "bg-accent border-border text-muted-foreground")}>
                  <plan.icon size={20} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter font-unique text-foreground">{plan.name}</h3>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-foreground font-unique">$</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isAnnual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-7xl font-black tracking-tighter text-foreground font-unique"
                  >
                    {isAnnual ? Math.floor(plan.annual) : Math.floor(plan.month)}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm font-black text-muted-foreground uppercase opacity-50">/ mo</span>
              </div>

              <ul className="space-y-4 pt-4 border-t border-border/50">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                    <Check size={14} className="text-indigo-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onSelectPlan?.(plan.name)}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all font-unique flex items-center justify-center gap-3 group",
                  plan.popular ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500" : "bg-foreground text-background shadow-xl hover:bg-zinc-800"
                )}
              >
                Access Hub
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
