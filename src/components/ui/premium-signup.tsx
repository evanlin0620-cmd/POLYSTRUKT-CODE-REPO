import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Cpu, Terminal, ArrowLeft, Lock, Globe, Database } from 'lucide-react';

interface PremiumSignUpProps {
  planName: string;
  onSignUp: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div 
      animate={{ 
        x: [0, 100, 0], 
        y: [0, -50, 0],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full"
    />
    <motion.div 
      animate={{ 
        x: [0, -100, 0], 
        y: [0, 50, 0],
        scale: [1, 1.3, 1]
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-blue-500/20 blur-[150px] rounded-full"
    />
  </div>
);

export const PremiumSignUp: React.FC<PremiumSignUpProps> = ({
  planName,
  onSignUp,
  onGoogleSignUp,
  onBack,
  isLoading = false,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col lg:flex-row font-sans selection:bg-purple-500 selection:text-white relative">
      <BackgroundOrbs />
      {/* Technical Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #3f3f46 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-blue-500/10" />
      </div>

      {/* Left Column: Plan Summary & Technical Visuals */}
      <section className="lg:w-2/5 p-12 flex flex-col justify-between relative z-10 border-r border-zinc-800/50 bg-zinc-900/40 backdrop-blur-3xl">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-12 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-[0.2em]"
            >
              <Zap size={10} className="fill-purple-400" />
              Creating Account
            </motion.div>

            <h1 className="text-5xl font-black tracking-tighter uppercase font-unique leading-[0.9]">
              Start Your <span className="text-purple-500">{planName}</span> <br />
              <span className="text-zinc-600">Plan</span>
            </h1>

            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
              You are signing up for a {planName} account. Enter your details below to get started.
            </p>

            <div className="space-y-4 pt-8">
              <FeatureItem icon={<Cpu size={14} />} text="All Features" />
              <FeatureItem icon={<Database size={14} />} text="Fast Generation" />
              <FeatureItem icon={<Shield size={14} />} text="Private Storage" />
            </div>
          </div>
        </div>

        <div className="pt-12">
          <div className="p-6 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Terminal size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</p>
                <p className="text-xs font-bold text-white">Ready to Start</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '65%' }}
                   className="h-full bg-purple-500"
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                <span>System Load</span>
                <span>Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Premium Sign-Up Form */}
      <section className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-3xl rounded-full -mr-12 -mt-12" />
            
            <div className="relative z-10 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black uppercase tracking-tight font-unique mb-2">Sign Up</h2>
                <p className="text-zinc-500 text-xs font-medium mb-6">Enter your details to create your account.</p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 mb-6 text-left"
                  >
                    <div className="mt-0.5 text-red-500">
                      <Lock size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Sign Up Error</p>
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              <form onSubmit={onSignUp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <input 
                      name="email"
                      type="email"
                      required
                      placeholder="name@email.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-700 font-mono font-medium"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <input 
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-700 font-mono font-medium"
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    >
                      {showPassword ? <Lock size={16} /> : <Terminal size={16} />}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                  <input type="checkbox" required className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-purple-600 focus:ring-purple-500" />
                  <p className="text-[10px] text-zinc-500 font-medium leading-tight">
                    I agree to the <span className="text-zinc-300 underline cursor-pointer">Terms of Service</span> and <span className="text-zinc-300 underline cursor-pointer">Privacy Policy</span>.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 font-unique flex items-center justify-center gap-3 group disabled:opacity-50 border border-indigo-400/20"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      Finish Sign Up
                      <Zap size={14} className="group-hover:fill-current" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center justify-center">
                <span className="w-full border-t border-zinc-800"></span>
                <span className="px-4 text-[8px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-900 absolute">Or continue with</span>
              </div>

              <button 
                onClick={onGoogleSignUp}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 border border-zinc-800 rounded-2xl py-4 hover:bg-zinc-800 transition-all font-bold text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
                  </svg>
                )}
                Google
              </button>

              <div className="text-center space-y-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  Secure Connection
                </p>
                <button 
                  onClick={() => {
                    // This will be handled by the parent to switch mode
                    window.dispatchEvent(new CustomEvent('switch-auth-mode', { detail: 'signin' }));
                  }}
                  className="text-[10px] font-black text-purple-500 hover:text-purple-400 uppercase tracking-widest transition-colors"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-3 text-zinc-400 group">
    <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-purple-400 transition-colors">
      {icon}
    </div>
    <span className="text-[11px] font-bold uppercase tracking-wider">{text}</span>
  </div>
);
