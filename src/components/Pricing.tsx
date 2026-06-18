import React from 'react';
import { PricingInteraction } from './ui/pricing-interaction';
import { motion } from 'motion/react';
import { Shield, Zap, Users, Globe, Cpu, Database, X } from 'lucide-react';
import { AuroraHero } from './ui/aurora-hero-bg';
import { ShineBorder } from './ui/shine-border';

export const Pricing = ({ onClose, onSelectPlan }: { onClose?: () => void; onSelectPlan?: (plan: string) => void }) => {
  return (
    <AuroraHero className="py-20 relative bg-background overflow-hidden min-h-screen">
      <ShineBorder 
        className="relative w-full min-h-screen bg-transparent p-0 flex flex-col items-center"
        color={["#4f46e5", "#818cf8", "#4f46e5"]}
        borderWidth={1}
        duration={14}
        borderRadius={0}
      >
        <div id="pricing" className="relative w-full max-w-7xl px-6 md:px-12 py-10">
          {/* Close Button */}
          {onClose && (
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="fixed top-8 right-8 z-[110] p-4 bg-accent/80 backdrop-blur-3xl border border-border rounded-full shadow-2xl hover:bg-accent transition-all group"
            >
              <X size={24} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.button>
          )}

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
              <div className="flex-1 max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-accent border border-border text-indigo-500 text-[9px] font-black uppercase tracking-[0.4em] mb-10 font-unique shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)] animate-pulse" />
                  Neural Allocation Plan
                </motion.div>
  
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-7xl md:text-9xl font-black tracking-tightest uppercase font-unique mb-10 leading-[0.8] text-foreground drop-shadow-sm"
                >
                  Scale Your <br/><span className="text-muted-foreground opacity-50">Vision</span>
                </motion.h2>
  
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground text-sm md:text-base font-medium mb-16 leading-relaxed max-w-xl font-technical tracking-tight"
                >
                  <span className="text-indigo-500 font-black mr-2 tracking-widest">SYSTEM_OPTIMIZATION:</span>
                  Unlock higher resolution synthesis and priority neural processing for complex multi-body assemblies.
                </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <FeatureCard 
                  icon={<Cpu size={20} />}
                  title="Neuro Engine" 
                  description="High-frequency GPU clusters for sub-second meshing." 
                />
                <FeatureCard 
                  icon={<Database size={20} />}
                  title="Global Archive" 
                  description="Infinite sync and versioning for all structural assets." 
                />
                <FeatureCard 
                  icon={<Users size={20} />}
                  title="Multi-Node" 
                  description="Real-time collaborative synthesis sessions." 
                />
                <FeatureCard 
                  icon={<Shield size={20} />}
                  title="Encrypted Hub" 
                  description="Military-grade protection for industrial IP." 
                />
              </div>
            </div>

            {/* Right Content: Pricing Interaction */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="relative"
              >
                {/* Floating technical readouts */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-12 -right-6 bg-accent/95 backdrop-blur-xl border border-border p-5 rounded-2xl shadow-2xl z-20 hidden md:block ring-1 ring-border/5"
                >
                  <div className="flex items-center gap-2 text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2 leading-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                    NODE_RESPONSE
                  </div>
                  <div className="text-lg font-black font-technical tracking-tighter text-foreground">0.0012ms</div>
                </motion.div>

                <PricingInteraction
                  starterMonth={19.99}
                  starterAnnual={15.99}
                  proMonth={74.99}
                  proAnnual={59.99}
                  onSelectPlan={onSelectPlan}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="container mx-auto px-6 mt-40 relative z-10">
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.5em] mb-12 font-unique">Industrial Partners</p>
            <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-1000">
              <Logo name="AeroSync" />
              <Logo name="VertexCAD" />
              <Logo name="IsoMech" />
              <Logo name="FluidFlow" />
              <Logo name="OptiGrid" />
            </div>

            {onClose && (
              <motion.button 
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-32 font-technical text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-[0.4em] transition-all flex items-center gap-4 group"
              >
                <div className="w-8 h-px bg-border group-hover:bg-indigo-600 group-hover:w-16 transition-all" />
                Return to Simulation Hub
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </ShineBorder>
  </AuroraHero>
  );
};

const Logo = ({ name }: { name: string }) => (
    <div className="flex items-center gap-3">
    <div className="w-4 h-4 bg-indigo-500 rounded-sm rotate-45 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
    <span className="font-black text-foreground tracking-widest text-[10px] font-unique uppercase">{name}</span>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02, borderColor: "var(--border)", backgroundColor: "var(--accent)" }}
    className="p-8 bg-accent/40 border border-border rounded-3xl transition-all group shadow-2xl backdrop-blur-sm"
  >
    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-muted-foreground group-hover:text-indigo-500 group-hover:bg-indigo-500/10 transition-all mb-6 shadow-sm ring-1 ring-border/5">
      {icon}
    </div>
    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-3 font-unique text-foreground">{title}</h3>
    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium transition-colors uppercase tracking-tight">{description}</p>
  </motion.div>
);
