
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { CustomCursor } from './components/CustomCursor';
import { ChatWidget } from './components/ChatWidget';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Gallery } from './components/Gallery';
import CommunityShowcase from './components/CommunityShowcase';
import { Workspace } from './components/Workspace';
import { ReactLenis } from '@studio-freight/react-lenis';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HeroScrollDemo } from './components/HeroScrollDemo';

const App = () => {
  const { token, logout } = useAuth();
  const [prompt, setPrompt] = useState('');

  const handleSelectPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  useEffect(() => {
    if (token) {
      // User is logged in, you can add any specific logic here
    }
  }, [token]);

  return (
    <ReactLenis root>
      <div className="bg-gray-900 text-white">
        <CustomCursor />
        <Navbar onLogout={logout} />
        <AnimatePresence mode="wait">
          {token ? (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Workspace initialPrompt={prompt} onBack={logout} />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onSelectPrompt={handleSelectPrompt} />
              <Stats />
              <HeroScrollDemo />
              <Gallery />
              <CommunityShowcase />
            </motion.div>
          )}
        </AnimatePresence>
        <ChatWidget />
      </div>
    </ReactLenis>
  );
};

export default App;
