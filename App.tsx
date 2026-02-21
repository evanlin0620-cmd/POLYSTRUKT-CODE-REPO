import React, { useState, useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Gallery } from './components/Gallery';
import { CustomCursor } from './components/CustomCursor';
import { ChatWidget } from './components/ChatWidget';
import { Workspace } from './components/Workspace';
import { AnimatePresence, motion } from 'framer-motion';
import './src/index.css';

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E`;

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [initialPrompt, setInitialPrompt] = useState('');

  useEffect(() => {
    const handleNavigation = (e: CustomEvent<{ view: 'landing' | 'workspace'; prompt?: string }>) => {
      if (e.detail?.view) {
        setView(e.detail.view);
        if (e.detail.prompt) {
          setInitialPrompt(e.detail.prompt);
        } else {
          setInitialPrompt('');
        }
      }
    };
    window.addEventListener('navigate', handleNavigation as EventListener);
    return () => window.removeEventListener('navigate', handleNavigation as EventListener);
  }, []);

  return (
    <ReactLenis root>
      <div className="relative bg-zinc-50 min-h-screen text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
        <CustomCursor />
        
        <div 
          className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        />

        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Navbar />
              <main>
                <Hero />
                <Stats />
                <Gallery />
              </main>
              <footer className="py-8 text-center text-zinc-400 text-xs uppercase tracking-widest bg-zinc-100 font-unique">
                © {new Date().getFullYear()} Polystrukt Engineering. All Rights Reserved.
              </footer>
              <ChatWidget />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 overflow-hidden bg-white"
            >
              <Workspace onBack={() => setView('landing')} initialPrompt={initialPrompt} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ReactLenis>
  );
}