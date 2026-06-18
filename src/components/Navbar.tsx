
import React, { useState } from 'react';
import { Menu, X, Sparkles, ChevronDown, User, LogOut, Settings, CreditCard, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLenis } from '@studio-freight/react-lenis';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

import { AnimatedShinyText } from './ui/animated-shiny-text';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface NavbarProps {
  onLogout?: () => void;
  onSignInClick?: () => void;
  onPricingClick?: () => void;
  onSimulationClick?: () => void;
  onShowcaseClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout, onSignInClick, onPricingClick, onSimulationClick, onShowcaseClick }) => {
  const token = useAuth(state => state.token);
  const user = useAuth(state => state.user);
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const lenis = useLenis();
  
  const handleScrollTo = (target: string) => {
    lenis?.scrollTo(target, { duration: 2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    setIsMobileMenuOpen(false);
  };

  const handleStartGenerating = () => {
    if (!token) {
      onSignInClick?.();
    }
  };

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onPricingClick?.();
    setIsMobileMenuOpen(false);
  };

  const buttonTransition = { type: "spring", stiffness: 500, damping: 30 } as const;

  const primaryAnimation = {
    whileHover: { 
      y: -2,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(79, 70, 229, 0.2), 0 0 20px rgba(79, 70, 229, 0.1)"
    },
    whileTap: { 
      y: 1,
      scale: 0.96,
      transition: { duration: 0.05 }
    }
  } as const;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 px-4" aria-label="Main Navigation">
      <div className="bg-background/80 backdrop-blur-xl border border-border shadow-xl rounded-2xl px-6 py-2.5 flex items-center justify-between transition-all ring-1 ring-border/5">
        {/* Logo */}
        <button 
          onClick={() => {
            if (lenis?.scroll > 0) {
              lenis?.scrollTo(0, { duration: 1 });
            }
            // Navigate to landing view
            window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'landing' } }));
          }} 
          className="flex items-center gap-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg p-1 group" 
          aria-label="Polystrukt Home"
        >
           <div className="relative">
              <div className="w-5 h-5 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-transform group-hover:rotate-[225deg] duration-700">
                 <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
           </div>
           <span className="font-bold text-foreground tracking-[-0.05em] text-xl font-unique uppercase">POLYSTRUKT</span>
        </button>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <NavLink label="Kernel" onClick={() => handleScrollTo('#kernel')} />
          <NavLink label="Engine" onClick={onSimulationClick} />
          <NavLink label="Gallery" onClick={() => handleScrollTo('#gallery')} />
          <motion.button 
            whileHover={{ scale: 1.05, textShadow: "0 0 10px rgba(79,70,229,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePricingClick}
            className="text-[10px] font-black text-indigo-600 hover:text-indigo-400 uppercase tracking-[0.25em] transition-all font-unique"
          >
            Upgrade
          </motion.button>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 10, backgroundColor: 'var(--accent)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              console.log('Theme toggle clicked, current:', theme);
              toggleTheme();
            }}
            className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 text-foreground transition-all border border-border shadow-md z-50 relative group"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={18} className="text-amber-500 group-hover:rotate-45 transition-transform" />
                <span className="sr-only">Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon size={18} className="text-indigo-400 group-hover:-rotate-12 transition-transform" />
                <span className="sr-only">Switch to Dark Theme</span>
              </>
            )}
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <div className="h-4 w-px bg-border mx-2" />
          {token ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 pr-4 rounded-xl bg-accent border border-border hover:border-border/80 transition-all group shadow-sm backdrop-blur-md"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 border border-border shadow-sm ring-1 ring-border/5">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                    <AvatarFallback className="bg-background text-foreground font-black text-[8px]">
                      {user?.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black text-foreground uppercase tracking-tight truncate max-w-[80px]">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[7px] font-black text-zinc-100 uppercase tracking-widest opacity-100">Phase Active</span>
                </div>
                <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-500 ease-out ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    className="absolute top-full right-0 mt-3 w-64 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-2 z-[60] ring-1 ring-border/5"
                  >
                    <div className="p-4 mb-2 border-b border-border">
                      <p className="text-[8px] font-black text-zinc-100 uppercase tracking-[0.3em] mb-2 leading-none">Access Console</p>
                      <p className="text-[11px] font-black text-foreground truncate font-mono">{user?.email}</p>
                    </div>
                    
                    <ProfileMenuItem icon={<User size={14} />} label="Structural Profile" />
                    <ProfileMenuItem 
                      icon={<Sparkles size={14} className="text-purple-400" />} 
                      label="Synthesis Lab" 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'lab' } }));
                        setIsProfileOpen(false);
                      }}
                    />
                    <ProfileMenuItem icon={<CreditCard size={14} />} label="Neural Allocation" onClick={onPricingClick} />
                    <ProfileMenuItem icon={<Settings size={14} />} label="Kernel Config" />
                    
                    <div className="h-px bg-white/5 my-2" />
                    
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group"
                    >
                      <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">End Session</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
              <motion.button 
                whileHover={{ scale: 1.05, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSignInClick}
                className="font-unique text-[10px] font-black dark:text-white text-zinc-900 hover:text-indigo-600 dark:hover:text-white transition-all uppercase px-4 py-2"
              >
              Sign In
            </motion.button>
          )}

          <motion.button 
            data-testid="nav-start-generating"
            onClick={handleStartGenerating}
            {...primaryAnimation}
            transition={buttonTransition}
            className="font-unique text-[10px] font-black bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] relative group overflow-hidden border border-indigo-400/20"
          >
            <div className="relative z-10 flex items-center gap-2">
              <Sparkles size={12} className="text-white" />
              <AnimatedShinyText className="tracking-[0.15em] text-indigo-100 mx-0 max-w-none via-white uppercase">
                Initiate
              </AnimatedShinyText>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 hover:bg-accent text-muted-foreground rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-4 right-4 bg-background/90 backdrop-blur-3xl border border-border rounded-2xl p-6 shadow-2xl md:hidden flex flex-col gap-3 ring-1 ring-border/5"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-border mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-100">Appearance</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-foreground transition-all"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span className="text-[10px] font-bold uppercase">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
            <MobileNavLink label="Kernel" onClick={() => handleScrollTo('#kernel')} />
            <MobileNavLink label="Engine v4.2" onClick={() => { onSimulationClick?.(); setIsMobileMenuOpen(false); }} />
            <MobileNavLink label="Showcase" onClick={() => handleScrollTo('#gallery')} />
            <button 
              onClick={handlePricingClick}
              className="px-4 py-4 text-left text-muted-foreground hover:text-foreground font-black text-[10px] uppercase tracking-[0.3em] transition-colors"
            >
              System Upgrade
            </button>
            <div className="h-px bg-white/5 my-2" />
            {token ? (
              <button onClick={onLogout} className="w-full text-left px-4 py-4 text-red-400 font-black text-[10px] uppercase tracking-[0.3em]">Terminate</button>
            ) : (
              <button onClick={() => { onSignInClick?.(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-4 text-white font-black text-[10px] uppercase tracking-[0.3em]">Access Portal</button>
            )}
            <button 
              onClick={() => { handleStartGenerating(); setIsMobileMenuOpen(false); }}
              className="w-full bg-indigo-600 text-white rounded-xl py-5 font-black text-[10px] uppercase tracking-[0.3em] mt-3 shadow-lg border border-indigo-400/20"
            >
              Start Synthesis
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ label, href = "#", onClick }: { label: string; href?: string; onClick?: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -1 }}
    className="text-[10px] font-black dark:text-white text-zinc-900 dark:hover:text-indigo-300 hover:text-indigo-600 uppercase tracking-[0.25em] transition-all font-unique flex items-center gap-1 cursor-pointer drop-shadow-sm"
  >
    {label}
  </motion.button>
);

const MobileNavLink = ({ label, href = "#", onClick }: { label: string; href?: string; onClick?: () => void }) => (
  <motion.button 
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    className="px-4 py-4 text-left text-muted-foreground hover:text-foreground font-black text-[10px] uppercase tracking-[0.3em] transition-colors">
    {label}
  </motion.button>
);

const ProfileMenuItem = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all group"
  >
    <div className="text-muted-foreground group-hover:text-indigo-500 transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{label}</span>
  </button>
);
