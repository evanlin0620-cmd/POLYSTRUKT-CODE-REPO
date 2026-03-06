
import React from 'react';
import { Menu, Sparkles, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const handleStartGenerating = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'workspace' } }));
  };

  const buttonTransition = { type: "spring", stiffness: 500, damping: 30 } as const;

  const showcaseAnimation = {
    whileHover: { 
      scale: 1.05,
      backgroundColor: "rgba(0,0,0,0.05)",
      color: "#000000"
    },
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  } as const;

  const primaryAnimation = {
    whileHover: { 
      y: -2,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.2)"
    },
    whileTap: { 
      y: 1,
      scale: 0.96,
      boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 4px 8px rgba(0,0,0,0.4)",
      transition: { duration: 0.05 }
    }
  } as const;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-40" aria-label="Main Navigation">
      <div className="bg-white/80 backdrop-blur-3xl border border-white/60 shadow-2xl shadow-black/5 rounded-2xl px-8 py-4 flex items-center justify-between transition-all">
        <a href="#" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1 group" aria-label="Polystrukt Home">
          <div className="w-5 h-5 bg-zinc-900 rounded-sm rotate-45 flex items-center justify-center shadow-lg transition-transform group-hover:rotate-[135deg] duration-500">
             <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
          <span className="font-bold text-zinc-900 tracking-tighter text-xl font-unique">POLYSTRUKT</span>
        </a>
        
        <div className="hidden md:flex items-center gap-8" role="menubar">
          <motion.a 
            href="#work" 
            {...showcaseAnimation}
            transition={buttonTransition}
            className="font-unique text-[10px] font-bold text-zinc-700 tracking-[0.12em] px-6 py-2.5 rounded-xl border border-zinc-100 transition-all focus:outline-none hover:border-zinc-300 flex items-center gap-2 group" 
            role="menuitem"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-purple-500 transition-colors shadow-sm" />
            <span>Showcase</span>
          </motion.a>

          <motion.button 
            data-testid="nav-start-generating"
            onClick={handleStartGenerating}
            {...primaryAnimation}
            transition={buttonTransition}
            className="font-unique text-[10px] font-bold bg-zinc-900 text-white px-8 py-4 rounded-xl shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 relative group overflow-visible bevel-dark"
          >
            <div className="relative z-10 flex items-center gap-3">
              <Sparkles size={14} className="text-purple-400 group-hover:animate-pulse" />
              <span className="tracking-[0.08em]">Start Generating</span>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <motion.div 
              className="absolute inset-0 border-2 border-purple-400/50 rounded-xl opacity-0 pointer-events-none"
              initial={false}
              whileTap={{ 
                scale: 1.6, 
                opacity: [0, 0.8, 0],
                transition: { duration: 0.6, ease: "easeOut" }
              }}
            />

            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
              aria-hidden="true"
            />
          </motion.button>

          <motion.button 
            onClick={onLogout}
            {...showcaseAnimation}
            transition={buttonTransition}
            className="font-unique text-[10px] font-bold text-zinc-700 tracking-[0.12em] px-6 py-2.5 rounded-xl border border-zinc-100 transition-all focus:outline-none hover:border-zinc-300 flex items-center gap-2 group" 
          >
            <LogOut size={14} className="text-zinc-500 group-hover:text-purple-500" />
            <span>Logout</span>
          </motion.button>
        </div>

        <button 
          className="md:hidden p-2 hover:bg-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
          aria-label="Open Mobile Menu"
        >
          <Menu size={22} className="text-zinc-900" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
