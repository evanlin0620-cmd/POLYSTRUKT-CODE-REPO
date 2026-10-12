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
import { OTPPage } from './components/ui/otp-page';
import { InactivityWarning } from './components/ui/inactivity-warning';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, Check, X, ArrowRight } from 'lucide-react';

import { SimulationTest } from './components/SimulationTest';
import { ThemeCustomizer } from './components/ui/theme-customizer';
import { PageTransition } from './components/ui/page-transition';
import { LegalModal, LegalTab } from './components/LegalModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Shield, ShieldAlert, Scale, Lock, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

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
  const verifyOtp = useAuth(state => state.verifyOtp);
  const resendOtp = useAuth(state => state.resendOtp);
  const register = useAuth(state => state.register);
  const logout = useAuth(state => state.logout);
  const [prompt, setPrompt] = useState('');
  const [showSignIn, setShowSignIn] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPricing, setShowPricing] = useState(false);
  const [isMfaActive, setIsMfaActive] = useState(false);
  const [mfaEmail, setMfaEmail] = useState('');
  const [mfaDebugOtp, setMfaDebugOtp] = useState('');
  const [mfaRememberMe, setMfaRememberMe] = useState(false);
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

  // Statutory Compliance & Legal Architecture State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('terms');

  useEffect(() => {
    const handleOpenLegal = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: LegalTab }>;
      if (customEvent.detail?.tab) {
        setLegalModalTab(customEvent.detail.tab);
      }
      setLegalModalOpen(true);
    };
    window.addEventListener('open-legal', handleOpenLegal);
    return () => window.removeEventListener('open-legal', handleOpenLegal);
  }, []);

  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [inactivitySecondsLeft, setInactivitySecondsLeft] = useState(300);
  const lastActivityRef = useRef<number>(Date.now());

  // Track user activity to prevent idle logout (30 minutes logout, 25 minutes warning)
  useEffect(() => {
    if (!token) {
      setShowInactivityWarning(false);
      return;
    }

    lastActivityRef.current = Date.now();

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const keepAlive = () => {
      lastActivityRef.current = Date.now();
    };

    // Register active event listeners on window
    activityEvents.forEach(event => {
      window.addEventListener(event, keepAlive, { passive: true });
    });

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - lastActivityRef.current;
      const elapsedMinutes = elapsedMs / (1000 * 60);

      if (elapsedMinutes >= 30) {
        // Log out immediately after 30 minutes of real inactivity
        clearInterval(interval);
        logout();
        setShowInactivityWarning(false);
        showAppNotification("Identity Session Expired due to Inactivity.", {
          label: "Re-authenticate",
          onClick: () => {
            navigateWithTransition(() => {
              setAuthMode('signin');
              setShowSignIn(true);
            });
          }
        });
      } else if (elapsedMinutes >= 25) {
        // Show warning modal at 25 minutes of inactivity
        setShowInactivityWarning(true);
        const remainingSeconds = Math.max(0, Math.floor((30 * 60 * 1000 - elapsedMs) / 1000));
        setInactivitySecondsLeft(remainingSeconds);
      } else {
        setShowInactivityWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, keepAlive);
      });
      clearInterval(interval);
    };
  }, [token, logout]);

  const handleExtendSession = () => {
    lastActivityRef.current = Date.now();
    setShowInactivityWarning(false);
    showAppNotification("Session extended. Continuing workspace operations.");
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
  const [appNotification, setAppNotification] = useState<string | { message: string; action?: { label: string; onClick: () => void } } | null>(null);

  const showAppNotification = (
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    setAppNotification(action ? { message, action } : message);
    setTimeout(() => {
      setAppNotification((prev) => {
        if (!prev) return null;
        const prevMessage = typeof prev === 'string' ? prev : prev.message;
        if (prevMessage === message) {
          return null;
        }
        return prev;
      });
    }, action ? 20000 : 4000);
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
        const checked = formData.get('rememberMe') === 'true' || formData.get('rememberMe') === 'on' || localStorage.getItem('persistent_session') !== 'false';
        setMfaRememberMe(checked);
        const result = await login(email, password, checked);
        if (result && (result as any).mfaRequired) {
          setMfaEmail((result as any).email);
          setMfaDebugOtp((result as any)._debugOtp || '');
          setIsMfaActive(true);
          return;
        }
      } else {
        await register(email, password, username, role, skills, certifications);
      }
      
      const currentToken = useAuth.getState().token;
      console.log(`[Auth] Success. Token present: ${!!currentToken}`);
      
      if (currentToken) {
        setAuthSuccess(true);
        setAuthError(null);
        // Seamlessly dismiss auth/pricing overlays so 3D CAD workspace mounts immediately
        setShowSignIn(false);
        setShowPricing(false);
        setSelectedPlan(null);
        setAuthSuccess(false);
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

  const handleOTPVerification = async (otpCode: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      console.log(`[Auth] Attempting MFA verification for ${mfaEmail}...`);
      await verifyOtp(mfaEmail, otpCode, mfaRememberMe);
      const currentToken = useAuth.getState().token;
      if (currentToken) {
        setAuthSuccess(true);
        setAuthError(null);
        setTimeout(() => {
          setShowSignIn(false);
          setShowPricing(false);
          setSelectedPlan(null);
          setAuthSuccess(false);
          setIsMfaActive(false);
        }, 800);
      }
    } catch (err: any) {
      console.error('[Auth] MFA Error:', err);
      setAuthError(err.message || 'MFA code verification failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      console.log(`[Auth] Requesting fresh OTP dispatch for ${mfaEmail}...`);
      const result = await resendOtp(mfaEmail);
      if (result && result._debugOtp) {
        setMfaDebugOtp(result._debugOtp);
      }
      return result;
    } catch (err: any) {
      console.error('[Auth] Resend OTP Error:', err);
      throw err;
    }
  };

  const loginWithGoogle = useAuth(state => state.loginWithGoogle);
  const loginWithAuth0 = useAuth(state => state.loginWithAuth0);

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

  const handleAuth0SignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      console.log(`[Auth] Attempting Auth0 Sign In in ${authMode} mode...`);
      await loginWithAuth0({
        email: 'engineer@auth0.polystrukt.io',
        name: 'Auth0 Verified Engineer',
        sub: `auth0|${Date.now()}`
      }, authMode);
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
      console.error(`[Auth] Auth0 Error:`, err);
      if (err.message === 'ACCOUNT_NOT_FOUND' || err.message.includes('register first')) {
        setAuthMode('signup');
        setAuthError("No account found for this Auth0 identity. We've switched you to registration mode. Please try signing in with Auth0 again to create your account.");
      } else {
        setAuthError(err.message || "Auth0 Authentication failed.");
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
                {isMfaActive ? (
                  <OTPPage 
                    email={mfaEmail}
                    debugOtp={mfaDebugOtp}
                    onVerify={handleOTPVerification}
                    onResend={handleResendOTP}
                    onCancel={() => {
                      setIsMfaActive(false);
                      setAuthError(null);
                    }}
                    isLoading={isAuthLoading}
                    error={authError}
                  />
                ) : selectedPlan && authMode === 'signup' ? (
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
                    onAuth0SignUp={handleAuth0SignIn}
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
                    onAuth0SignIn={handleAuth0SignIn}
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
              <footer className="py-16 dark:bg-zinc-950/90 bg-zinc-100/90 backdrop-blur-3xl relative border-t dark:border-white/5 border-black/5 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-8 space-y-10">
                   {/* Statutory Engineering Liability Callout Banner */}
                   <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="flex items-start gap-3.5">
                       <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shrink-0 mt-0.5">
                         <ShieldAlert size={18} />
                       </div>
                       <div className="space-y-1">
                         <p className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                           Engineering Liability Safe Harbor Notice
                         </p>
                         <p className="text-xs text-zinc-400 dark:text-zinc-400 max-w-3xl leading-relaxed">
                           Polystrukt algorithmically synthesizes 3D geometries and parametric blueprints for conceptual research and prototyping. Outputs are <strong>not certified</strong> by a licensed Professional Engineer (PE) and must not be used for life-critical, automotive, aerospace, or structural load-bearing applications without independent verification.
                         </p>
                       </div>
                     </div>
                     <button
                       onClick={() => {
                         setLegalModalTab('safety');
                         setLegalModalOpen(true);
                       }}
                       className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-mono text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0"
                     >
                       Read Safety Policy
                     </button>
                   </div>

                   {/* Footer Columns & Legal Trust Navigation */}
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 border-t dark:border-white/5 border-black/5">
                     <div className="space-y-3 md:col-span-1">
                       <div className="text-2xl font-black font-unique tracking-tighter uppercase text-foreground">Polystrukt</div>
                       <p className="text-[10px] text-zinc-500 font-technical uppercase tracking-[0.25em] leading-relaxed">
                         © {new Date().getFullYear()} Polystrukt Engineering Core.<br />
                         Sequential Phase Active // Kernel v.2.4.8
                       </p>
                       <div className="flex items-center gap-2 pt-1 text-[10px] text-emerald-400 font-mono">
                         <CheckCircle2 size={12} />
                         <span>GDPR & CCPA Compliant</span>
                       </div>
                     </div>

                     <div className="space-y-2.5">
                       <p className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-zinc-300">Trust & Legal</p>
                       <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                         <li>
                           <button
                             onClick={() => {
                               setLegalModalTab('terms');
                               setLegalModalOpen(true);
                             }}
                             className="hover:text-indigo-400 transition-colors text-left cursor-pointer"
                           >
                             Terms of Service & Arbitration
                           </button>
                         </li>
                         <li>
                           <button
                             onClick={() => {
                               setLegalModalTab('safety');
                               setLegalModalOpen(true);
                             }}
                             className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                           >
                             Engineering Liability Waiver
                           </button>
                         </li>
                         <li>
                           <button
                             onClick={() => {
                               setLegalModalTab('privacy');
                               setLegalModalOpen(true);
                             }}
                             className="hover:text-indigo-400 transition-colors text-left cursor-pointer"
                           >
                             Acceptable Use Policy (AUP)
                           </button>
                         </li>
                       </ul>
                     </div>

                     <div className="space-y-2.5">
                       <p className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-zinc-300">Privacy & Compliance</p>
                       <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                         <li>
                           <button
                             onClick={() => {
                               setLegalModalTab('privacy');
                               setLegalModalOpen(true);
                             }}
                             className="hover:text-indigo-400 transition-colors text-left cursor-pointer"
                           >
                             Privacy Policy (GDPR / CCPA)
                           </button>
                         </li>
                         <li>
                           <button
                             onClick={() => {
                               setLegalModalTab('cookies');
                               setLegalModalOpen(true);
                             }}
                             className="hover:text-indigo-400 transition-colors text-left cursor-pointer"
                           >
                             Cookie & Storage Audit
                           </button>
                         </li>
                         <li>
                           <button
                             onClick={() => {
                               setLegalModalTab('datarights');
                               setLegalModalOpen(true);
                             }}
                             className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                           >
                             Your Data Rights (Erasure & Export)
                           </button>
                         </li>
                       </ul>
                     </div>

                     <div className="space-y-2.5">
                       <p className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-zinc-300">System & Specs</p>
                       <ul className="space-y-2 text-xs text-zinc-400 font-sans">
                         <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation & API</a></li>
                         <li><a href="#" className="hover:text-indigo-400 transition-colors">ASME Y14.5 Drafting Engine</a></li>
                         <li>
                           <button
                             onClick={() => {
                               setLegalModalTab('cookies');
                               setLegalModalOpen(true);
                             }}
                             className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors cursor-pointer"
                           >
                             Manage Cookie Preferences
                           </button>
                         </li>
                       </ul>
                     </div>
                   </div>

                   {/* Bottom of Page Privacy Policy & Legal Bar */}
                   <div className="mt-12 pt-8 border-t dark:border-white/10 border-black/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-zinc-400 font-mono text-[11px]">
                       <button
                         onClick={() => {
                           setLegalModalTab('privacy');
                           setLegalModalOpen(true);
                         }}
                         className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-bold cursor-pointer underline decoration-emerald-500/40 underline-offset-4"
                       >
                         <ShieldCheck size={14} className="text-emerald-400" />
                         <span>Privacy Policy (GDPR / CCPA)</span>
                       </button>
                       <span className="text-zinc-700 hidden sm:inline">•</span>
                       <button
                         onClick={() => {
                           setLegalModalTab('terms');
                           setLegalModalOpen(true);
                         }}
                         className="hover:text-zinc-200 transition-colors cursor-pointer"
                       >
                         Terms of Service
                       </button>
                       <span className="text-zinc-700 hidden sm:inline">•</span>
                       <button
                         onClick={() => {
                           setLegalModalTab('safety');
                           setLegalModalOpen(true);
                         }}
                         className="hover:text-amber-400 transition-colors cursor-pointer"
                       >
                         Engineering Liability
                       </button>
                       <span className="text-zinc-700 hidden sm:inline">•</span>
                       <button
                         onClick={() => {
                           setLegalModalTab('cookies');
                           setLegalModalOpen(true);
                         }}
                         className="hover:text-zinc-200 transition-colors cursor-pointer"
                       >
                         Cookie Policy
                       </button>
                       <span className="text-zinc-700 hidden sm:inline">•</span>
                       <button
                         onClick={() => {
                           setLegalModalTab('datarights');
                           setLegalModalOpen(true);
                         }}
                         className="hover:text-emerald-400 transition-colors cursor-pointer"
                       >
                         Your Privacy Rights
                       </button>
                     </div>

                     <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                       <span>ZERO-TRACKING ENCLAVE • AES-256 SESSION SECURITY</span>
                     </div>
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
              initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" }}
              className="fixed bottom-6 right-6 z-[250] p-5 bg-zinc-950 border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-3.5 backdrop-blur-xl text-white max-w-sm min-w-[280px]"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-t-full" />
              
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 select-none">
                  <span className="text-[9px] font-black font-mono">i</span>
                </div>
                <div className="flex-1 text-[10px] font-mono uppercase tracking-widest leading-relaxed text-zinc-300">
                  {typeof appNotification === 'string' ? appNotification : appNotification.message}
                </div>
                <button 
                  onClick={() => setAppNotification(null)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  type="button"
                >
                  <X size={12} />
                </button>
              </div>

              {typeof appNotification !== 'string' && appNotification.action && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      if (appNotification && typeof appNotification !== 'string' && appNotification.action) {
                        appNotification.action.onClick();
                      }
                      setAppNotification(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-zinc-200 cursor-pointer active:scale-95"
                    type="button"
                  >
                    <span>{appNotification.action.label}</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Inactivity Warning Protocol */}
        <AnimatePresence>
          {showInactivityWarning && (
            <InactivityWarning 
              secondsLeft={inactivitySecondsLeft}
              onExtend={handleExtendSession}
              onLogout={() => {
                logout();
                setShowInactivityWarning(false);
              }}
            />
          )}
        </AnimatePresence>

        <ScrollToTop />
        <ChatWidget />

        {/* Legal & Regulatory Compliance Modals & Banners */}
        <LegalModal
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          initialTab={legalModalTab}
        />
        <CookieConsentBanner
          onOpenLegal={(tab) => {
            setLegalModalTab(tab);
            setLegalModalOpen(true);
          }}
        />
      </div>
    </ReactLenis>
  );
};

export default App;
