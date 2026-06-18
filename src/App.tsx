import { useAuth } from './hooks/useAuth';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { CustomCursor } from './components/CustomCursor';
import { ChatWidget } from './components/ChatWidget';
import { DemoOne } from './components/DemoOne';
import { LiveShowcase } from './components/LiveShowcase';
import { DiagnosticLab } from './components/DiagnosticLab';
import { Stats } from './components/Stats';
import { Gallery } from './components/Gallery';
import { KernelShowcase } from './components/KernelShowcase';
import CommunityShowcase from './components/CommunityShowcase';
import { Workspace } from './components/Workspace';
import { Pricing } from './components/Pricing';
import { ScrollShowcase } from './components/ScrollShowcase';
import { SignInPage } from './components/ui/sign-in';
import { RegisterPage } from './components/ui/register-page';
import { PremiumSignUp } from './components/ui/premium-signup';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import { ArrowUp, Check } from 'lucide-react';

import { SimulationTest } from './components/SimulationTest';
import { ThemeCustomizer } from './components/ui/theme-customizer';
import { PageTransition } from './components/ui/page-transition';

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E`;

// Scroll To Top Component
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    lenis?.scrollTo(0, { duration: 1.5 });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-background border border-border text-foreground rounded-2xl shadow-2xl flex items-center justify-center group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <ArrowUp size={20} className="relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Polystrukt Engineering Platform
const App = () => {
  const token = useAuth(state => state.token);
  const login = useAuth(state => state.login);
  const register = useAuth(state => state.register);
  const logout = useAuth(state => state.logout);
  const [prompt, setPrompt] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPricing, setShowPricing] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showDiagnosticLab, setShowDiagnosticLab] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingState, setPendingState] = useState<(() => void) | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const navigateWithTransition = (action: () => void) => {
    setIsTransitioning(true);
    setPendingState(() => action);
    setTimeout(() => {
      action();
    }, 850);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1550);
  };

  useEffect(() => {
    const isPersistent = localStorage.getItem('persistent_session') !== 'false';
    if (!isPersistent) {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      setShowSignIn(false);
      setShowPricing(false);
      setSelectedPlan(null);
    }
  }, [token]);

  useEffect(() => {
    const handleNavigation = (e: any) => {
      const { view, prompt: navPrompt } = e.detail || {};
      
      if (view === 'workspace') {
        const currentToken = useAuth.getState().token;
        if (!currentToken) {
          if (navPrompt) setPrompt(navPrompt);
          navigateWithTransition(() => {
            setAuthMode('signin');
            setShowSignIn(true);
            setShowPricing(false);
            setShowDemo(false);
            setShowSimulation(false);
          });
          return;
        }
        
        navigateWithTransition(() => {
          if (navPrompt) {
            setPrompt(navPrompt);
          } else {
            setPrompt('');
          }
          setShowSignIn(false);
          setShowPricing(false);
          setShowDemo(false);
          setShowSimulation(false);
        });
      } else if (view === 'signin') {
        navigateWithTransition(() => {
          setShowSignIn(true);
          setAuthMode('signin');
        });
      } else if (view === 'signup') {
        navigateWithTransition(() => {
          setShowSignIn(true);
          setAuthMode('signup');
        });
      } else if (view === 'landing') {
        navigateWithTransition(() => {
          setShowSignIn(false);
          setShowPricing(false);
          setShowDemo(false);
          setShowSimulation(false);
          setShowDiagnosticLab(false);
          if (token) logout();
        });
      } else if (view === 'lab') {
        navigateWithTransition(() => {
          setShowDiagnosticLab(true);
        });
      }
    };
    window.addEventListener('navigate', handleNavigation);
    
    const handleSwitchAuth = (e: any) => {
      setAuthMode(e.detail);
      if (e.detail === 'signin') {
        setSelectedPlan(null);
      }
    };
    window.addEventListener('switch-auth-mode', handleSwitchAuth);

    return () => {
      window.removeEventListener('navigate', handleNavigation);
      window.removeEventListener('switch-auth-mode', handleSwitchAuth);
    };
  }, []);

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [appNotification, setAppNotification] = useState<string | null>(null);

  const showAppNotification = (message: string) => {
    setAppNotification(message);
    setTimeout(() => {
      setAppNotification(null);
    }, 4000);
  };

  const handleSimulationClick = () => {
    if (!token) {
      navigateWithTransition(() => {
        setAuthMode('signin');
        setShowSignIn(true);
      });
    } else {
      navigateWithTransition(() => {
        setShowSimulation(true);
      });
    }
  };

  const handleShowcaseClick = () => {
    navigateWithTransition(() => {
      setShowDemo(true);
    });
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const role = formData.get('role') as string;
    
    // Parse skills and certifications registration metadata from LinkedIn/customize profile
    const skillsRaw = formData.get('skills') as string;
    const certificationsRaw = formData.get('certifications') as string;
    let skills: string[] = [];
    let certifications: string[] = [];
    if (skillsRaw) {
      try {
        skills = JSON.parse(skillsRaw);
      } catch (e) {}
    }
    if (certificationsRaw) {
      try {
        certifications = JSON.parse(certificationsRaw);
      } catch (e) {}
    }
    
    if (!email || !password) {
      setAuthError("Please fill in all fields.");
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    try {
      console.log(`[Auth] Attempting ${authMode}...`);
      if (authMode === 'signin') {
        await login(email, password);
      } else {
        await register(email, password, username, role, skills, certifications);
      }
      
      const currentToken = useAuth.getState().token;
      console.log(`[Auth] Success. Token present: ${!!currentToken}`);
      
      if (currentToken) {
        setAuthSuccess(true);
        setAuthError(null);
        // Short delay for visual transition feedback
        setTimeout(() => {
          setShowSignIn(false);
          setShowPricing(false);
          setSelectedPlan(null);
          setAuthSuccess(false);
        }, 800);
      }
    } catch (err: any) {
      console.error(`[Auth] Error:`, err);
      if (err.message === 'ACCOUNT_NOT_FOUND' || err.message.includes('register')) {
        setAuthMode('signup');
        setAuthError("No account found with this identity. We've switched you to registration mode.");
      } else {
        setAuthError(err.message || "Authentication failed.");
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginWithGoogle = useAuth(state => state.loginWithGoogle);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      console.log(`[Auth] Attempting Google Sign In in ${authMode} mode...`);
      await loginWithGoogle(authMode);
      const currentToken = useAuth.getState().token;
      if (currentToken) {
        setAuthSuccess(true);
        setAuthError(null);
        setTimeout(() => {
          setShowSignIn(false);
          setShowPricing(false);
          setSelectedPlan(null);
          setAuthSuccess(false);
        }, 800);
      }
    } catch (err: any) {
      console.error(`[Auth] Google Error:`, err);
      // Handle the case where user tries to sign in but has no account
      if (err.message === 'ACCOUNT_NOT_FOUND' || err.message.includes('register first')) {
        setAuthMode('signup');
        setAuthError("No account found for this Google identity. We've switched you to registration mode. Please try signing in with Google again to create your account.");
      } else {
        setAuthError(err.message || "Google Authentication failed.");
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSelectPlan = (plan: string) => {
    if (!token) {
      setSelectedPlan(plan);
      setAuthMode('signup');
      setShowSignIn(true);
      setShowPricing(false);
    } else {
      showAppNotification(`Initiating ${plan} Protocol Upgrade. Redirecting to secure checkout...`);
    }
  };

  return (
    <ReactLenis root>
      <div className="relative min-h-screen bg-background text-foreground selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-300">
         {/* Global Background Layer */}
         <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-indigo-500/20 via-transparent to-transparent blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-1/2 h-full bg-gradient-to-t from-purple-500/20 via-transparent to-transparent blur-[120px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:64px_64px]" />
         </div>
        
        <CustomCursor />

        {/* Custom Scroll Progress Bar */}
        <div className="fixed top-0 right-0 w-1 pt-px h-screen z-[100] pointer-events-none hidden md:block">
          <div className="absolute inset-0 bg-zinc-900/40 w-full h-full" />
          <motion.div 
            className="w-full bg-gradient-to-b from-indigo-500 to-purple-500 origin-top relative"
            style={{ scaleY, height: '100%' }}
          />
        </div>
        
        <div 
          className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        />

        {token && <Navbar onLogout={logout} onPricingClick={() => setShowPricing(true)} onSimulationClick={handleSimulationClick} onShowcaseClick={handleShowcaseClick} />}
        {!token && !showSignIn && <Navbar onSignInClick={() => setShowSignIn(true)} onPricingClick={() => setShowPricing(true)} onSimulationClick={handleSimulationClick} onShowcaseClick={handleShowcaseClick} />}
        
        <AnimatePresence mode="wait">
          {showDemo ? (
            <motion.div
              key="demo-showcase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150]"
            >
              <LiveShowcase 
                onClose={() => setShowDemo(false)} 
                onExplore={() => {
                  setShowDemo(false);
                  setShowSignIn(true);
                  setAuthMode('signup');
                }}
              />
            </motion.div>
          ) : showDiagnosticLab ? (
            <motion.div
              key="diagnostic-lab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[170]"
            >
               <DiagnosticLab onClose={() => setShowDiagnosticLab(false)} />
            </motion.div>
          ) : showSimulation ? (
            <motion.div
              key="simulation-test"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[160]"
            >
              <SimulationTest onClose={() => setShowSimulation(false)} />
            </motion.div>
          ) : token ? (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1]
              }}
              className="fixed inset-0 z-[60] overflow-hidden bg-background"
            >
              <Workspace initialPrompt={prompt} onBack={logout} />
            </motion.div>
          ) : showPricing ? (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-50 min-h-screen bg-background"
            >
              <Pricing onClose={() => setShowPricing(false)} onSelectPlan={handleSelectPlan} />
            </motion.div>
          ) : showSignIn ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-50 bg-background min-h-screen"
            >
              <div className="w-full">
                {selectedPlan && authMode === 'signup' ? (
                  <PremiumSignUp 
                    planName={selectedPlan}
                    onSignUp={handleAuth}
                    onGoogleSignUp={handleGoogleSignIn}
                    onBack={() => {
                      setShowSignIn(false);
                      setAuthError(null);
                      setSelectedPlan(null);
                    }}
                    isLoading={isAuthLoading}
                    error={authError}
                  />
                ) : authMode === 'signup' ? (
                  <RegisterPage 
                    onSignUp={handleAuth}
                    onGoogleSignUp={handleGoogleSignIn}
                    onBack={() => {
                      setShowSignIn(false);
                      setAuthError(null);
                    }}
                    isLoading={isAuthLoading}
                    error={authError}
                  />
                ) : (
                  <SignInPage 
                    mode={authMode}
                    heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
                    onSignIn={handleAuth}
                    onGoogleSignIn={handleGoogleSignIn}
                    onBack={() => {
                      setShowSignIn(false);
                      setAuthError(null);
                    }}
                    error={authError}
                    onToggleMode={() => {
                      setAuthMode('signup');
                      setAuthError(null);
                    }}
                    onResetPassword={() => showAppNotification("Reset Password Protocol Initiated. Verification credentials loaded.")}
                    isLoading={isAuthLoading}
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ 
                opacity: 0, 
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative"
            >
                <main className="relative">
                  {/* Section Wrappers for Seamless Scrolling */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-5%" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-20"
                  >
                    <DemoOne 
                      onSignInClick={() => setShowSignIn(true)} 
                      onDemoClick={() => setShowDemo(true)}
                      onPromptChange={setPrompt}
                    />
                  </motion.div>

                  <motion.div
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: "-5%" }}
                     transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                     className="relative -mt-20 z-30"
                  >
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b dark:from-zinc-950 from-background to-transparent z-10 transition-colors duration-300" />
                    <ScrollShowcase />
                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t dark:from-zinc-950 from-background to-transparent z-10 transition-colors duration-300" />
                  </motion.div>

                  <motion.section
                     initial={{ opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: "-5%" }}
                     transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                     className="py-20 flex flex-col items-center justify-center min-h-[60vh] relative z-10"
                  >
                    <Stats />
                  </motion.section>

                  <motion.div
                     id="kernel"
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true, margin: "-5%" }}
                     transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                     className="relative py-20"
                  >
                    <KernelShowcase onSimulationClick={handleSimulationClick} />
                  </motion.div>

                  <motion.div
                     id="gallery"
                     initial={{ opacity: 0, x: -30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true, margin: "-5%" }}
                     transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                     className="py-20"
                  >
                    <Gallery />
                  </motion.div>

                  <motion.div
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: "-5%" }}
                     transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                     className="py-20 mb-20"
                  >
                    <CommunityShowcase />
                  </motion.div>
                </main>
              <footer className="py-20 dark:bg-zinc-950/80 bg-zinc-100/80 backdrop-blur-3xl relative border-t dark:border-white/5 border-black/5 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                   <div className="flex flex-col items-center md:items-start gap-4">
                      <div className="text-2xl font-black font-unique tracking-tighter uppercase">Polystrukt</div>
                      <p className="text-[10px] text-zinc-500 font-technical uppercase tracking-[0.4em] text-center md:text-left">
                        © {new Date().getFullYear()} Polystrukt Engineering Core. <br /> 
                        Sequential Phase Active // Kernel v.2.4.8
                      </p>
                   </div>
                   <div className="flex gap-12 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
                      <a href="#" className="hover:text-indigo-500 transition-colors">Documentation</a>
                      <a href="#" className="hover:text-indigo-500 transition-colors">Synthesis API</a>
                      <a href="#" className="hover:text-indigo-500 transition-colors">Neural Terminal</a>
                   </div>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlays (Separate AnimatePresence to avoid mode="wait" conflict with main router) */}
        <PageTransition isVisible={isTransitioning} />
        <ThemeCustomizer />
        <AnimatePresence>
          {authSuccess && (
            <motion.div
              key="auth-success-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-2xl"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-indigo-400/50">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <Check size={40} className="text-white" />
                  </motion.div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter font-unique text-foreground">Sign In Successful</h2>
                  <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.3em]">Connection Secured...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Global Toast Notifications */}
        <AnimatePresence>
          {appNotification && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-[250] p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl text-white max-w-sm"
            >
              <div className="flex-1 text-[11px] font-mono uppercase tracking-widest leading-relaxed">
                {appNotification}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ScrollToTop />
        <ChatWidget />
      </div>
    </ReactLenis>
  );
};

export default App;
