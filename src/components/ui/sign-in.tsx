import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Zap, Lock, Mail, ArrowRight, Sparkles, Check, AlertCircle, KeyRound, X, Github, Copy, Clock, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

const MicrosoftIcon = () => (
    <div className="grid grid-cols-2 gap-[2px] w-4 h-4 bg-transparent shrink-0">
        <div className="bg-[#f25022] w-[7px] h-[7px]" />
        <div className="bg-[#7fba00] w-[7px] h-[7px]" />
        <div className="bg-[#00a4ef] w-[7px] h-[7px]" />
        <div className="bg-[#ffb900] w-[7px] h-[7px]" />
    </div>
);

const Auth0Icon = () => (
  <svg viewBox="0 0 512 512" className="w-4 h-4 text-[#EB5424] fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M368.5 128.8L256 46.4 143.5 128.8l-37 172.9 149.5 163.9 149.5-163.9-37-172.9zm-112.5 281L143 283.4l24.6-114.9 88.4 64.6 88.4-64.6 24.6 114.9-112.5 126.4z"/>
  </svg>
);

// --- TYPE DEFINITIONS ---

interface SignInPageProps {
  mode?: 'signin' | 'signup';
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onAuth0SignIn?: () => void;
  onResetPassword?: () => void;
  onToggleMode?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// --- SUB-COMPONENTS ---

const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-background">
    <motion.div 
      animate={{ 
        x: [0, 50, 0], 
        y: [0, -30, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 -left-20 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full opacity-50"
    />
    <motion.div 
      animate={{ 
        x: [0, -50, 0], 
        y: [0, 30, 0],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-0 -right-20 w-[700px] h-[700px] bg-indigo-500/10 blur-[150px] rounded-full opacity-50"
    />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--foreground)_0.01px,transparent_0.01px),linear-gradient(to_bottom,var(--foreground)_0.01px,transparent_0.01px)] bg-[size:50px_50px] opacity-10" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)] opacity-80" />
  </div>
);

const GlassInputWrapper = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors">
      <Icon size={18} />
    </div>
    <div className="rounded-2xl border border-border bg-accent/40 backdrop-blur-3xl transition-all duration-300 focus-within:border-indigo-500/30 focus-within:ring-4 focus-within:ring-indigo-500/5 shadow-2xl">
      {children}
    </div>
  </div>
);

const ProtocolCard = ({ title, desc, delay, icon: Icon }: { title: string, desc: string, delay: number, icon: any }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    className="flex items-start gap-5 rounded-3xl bg-background/40 backdrop-blur-3xl border border-border p-6 w-[24rem] shadow-2xl group hover:bg-background/60 hover:border-border transition-all duration-500 ring-1 ring-border/5"
  >
    <div className="relative">
      <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-accent border border-border/50 text-indigo-500 shadow-xl group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-700">
        <Icon size={24} />
      </div>
    </div>
    <div className="text-sm flex-1">
      <div className="flex items-center gap-2 mb-1">
        <p className="font-black text-foreground uppercase tracking-tight">{title}</p>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <p className="text-muted-foreground font-medium text-[11px] leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{desc}</p>
    </div>
  </motion.div>
);

// --- FORGOT PASSWORD MODAL ---

// --- FORGOT PASSWORD MODAL ---

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onPasswordResetComplete?: (email: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ 
  isOpen, 
  onClose,
  initialEmail = '',
  onPasswordResetComplete
}) => {
  const [step, setStep] = useState<'request' | 'token_sent' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Password reset fields
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setStep('request');
      setStatus('idle');
      setErrorMessage('');
      setRecoveryToken('');
      setExpiresAt('');
      setCopiedToken(false);
      setTokenInput('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialEmail]);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your registered email address.');
      setStatus('error');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Invalid syntax format. Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(data?.error || `Account verification check failed: No registered account found with email "${cleanEmail}".`);
        }
        throw new Error(data?.error || 'Password recovery dispatch failed.');
      }

      setRecoveryToken(data.recoveryToken || '');
      setTokenInput(data.recoveryToken || '');
      setExpiresAt(data.expiresAt || '');
      setStep('token_sent');
      setStatus('idle');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed connecting to Polystrukt security framework.');
      setStatus('error');
    }
  };

  const handleCopyToken = () => {
    if (!recoveryToken) return;
    navigator.clipboard.writeText(recoveryToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMessage('Please provide the recovery token.');
      setStatus('error');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters in length.');
      setStatus('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter identical credentials.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: tokenInput.trim(),
          newPassword
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to reset password. Please check your token or request a new one.');
      }

      setStep('success');
      setStatus('idle');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password update failed.');
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[200] flex items-center justify-center p-4 selection:bg-indigo-500/30 font-sans">
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-lg bg-zinc-950/95 border border-white/10 rounded-[2rem] overflow-hidden relative shadow-[0_30px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(99,102,241,0.08)] flex flex-col p-8 z-10"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                  <Shield size={10} className="text-indigo-400" />
                  Access Recovery Protocol
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                  {step === 'request' && 'Forgot Password Recovery'}
                  {step === 'token_sent' && 'Recovery Envelope Issued'}
                  {step === 'reset' && 'Set New Password'}
                  {step === 'success' && 'Restoration Complete'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={onClose}
                className="p-1 px-2 bg-white/5 border border-white/5 text-zinc-400 hover:text-white rounded-lg transition-all text-[9px] uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: Email Input & Account Existence Verification */}
              {step === 'request' && (
                <motion.form 
                  key="step-request"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleRequestToken}
                  className="space-y-5"
                >
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Enter your registered account email. The security matrix will verify account existence in the database and dispatch a cryptographically secure 256-bit recovery token envelope.
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Test Shortcut</span>
                    <button
                      type="button"
                      onClick={() => setEmail('demo@polystrukt.com')}
                      className="text-[8.5px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      Fill Demo: demo@polystrukt.com
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] ml-1">Registered Email Address</label>
                    <GlassInputWrapper icon={Mail}>
                      <input 
                        type="email" 
                        required 
                        placeholder="identity@polystrukt.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value.replace(/[\s<>"'`\\/\[\](){}]/g, ''))}
                        className="w-full bg-transparent text-sm p-4 pl-14 pr-10 rounded-2xl focus:outline-none font-mono font-medium text-foreground placeholder:text-muted-foreground disabled:opacity-50 tracking-[0.05em]" 
                        disabled={status === 'loading'} 
                      />
                    </GlassInputWrapper>
                  </div>

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3"
                    >
                      <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-0.5 font-mono">ACCOUNT_VERIFICATION_FAILED</p>
                        <p className="text-[10px] text-zinc-300 leading-normal">{errorMessage}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 p-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all text-zinc-400 hover:text-white cursor-pointer"
                      disabled={status === 'loading'}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="flex-2 rounded-2xl bg-white text-black font-black p-4 text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg font-bold"
                    >
                      {status === 'loading' ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                          <span>Verifying Account...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound size={13} />
                          <span>Verify & Send Token</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 2: Token Sent Envelope Display */}
              {step === 'token_sent' && (
                <motion.div
                  key="step-token"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">ACCOUNT VERIFIED</p>
                        <p className="text-xs text-zinc-200 font-mono font-bold truncate max-w-[220px]">{email}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
                  </div>

                  <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <Shield size={10} className="text-indigo-400" />
                        SECURE RECOVERY TOKEN (256-BIT)
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-1 rounded-md transition-all cursor-pointer"
                      >
                        {copiedToken ? (
                          <>
                            <Check size={11} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Token</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-[11px] text-zinc-300 break-all select-all leading-relaxed">
                      {recoveryToken}
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 font-mono">
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Clock size={11} className="text-amber-400" />
                        Valid for 60 minutes
                      </span>
                      <span>Dispatched to Relay</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    A secure recovery envelope has been dispatched to your email relay and logged to the server terminal. You can proceed directly to update your credentials.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 p-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Done / Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('reset');
                        setErrorMessage('');
                      }}
                      className="flex-2 rounded-2xl bg-white text-black font-black p-4 text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-zinc-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg font-bold"
                    >
                      <span>Proceed to Reset Password</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Reset Password Form */}
              {step === 'reset' && (
                <motion.form
                  key="step-reset"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => setStep('token_sent')}
                      className="text-[9px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={11} />
                      Back to Token
                    </button>
                    <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[200px]">{email}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1">Recovery Token</label>
                    <GlassInputWrapper icon={KeyRound}>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter 64-character token" 
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value.trim())}
                        className="w-full bg-transparent text-xs p-3.5 pl-14 pr-4 rounded-2xl focus:outline-none font-mono text-foreground placeholder:text-muted-foreground tracking-[0.05em]" 
                        disabled={status === 'loading'} 
                      />
                    </GlassInputWrapper>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1">New Password (Min 8 Characters)</label>
                    <GlassInputWrapper icon={Lock}>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? 'text' : 'password'} 
                          required 
                          placeholder="Create strong password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-transparent text-xs p-3.5 pl-14 pr-12 rounded-2xl focus:outline-none font-mono text-foreground placeholder:text-muted-foreground tracking-[0.2em]" 
                          disabled={status === 'loading'} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                        >
                          {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </GlassInputWrapper>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-1">Confirm New Password</label>
                    <GlassInputWrapper icon={Lock}>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          required 
                          placeholder="Re-enter new password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent text-xs p-3.5 pl-14 pr-12 rounded-2xl focus:outline-none font-mono text-foreground placeholder:text-muted-foreground tracking-[0.2em]" 
                          disabled={status === 'loading'} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </GlassInputWrapper>
                  </div>

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3"
                    >
                      <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-0.5 font-mono">UPDATE_FAILED</p>
                        <p className="text-[10px] text-zinc-300 leading-normal">{errorMessage}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 p-4 font-black text-[10px] uppercase tracking-[0.3em] transition-all text-zinc-400 hover:text-white cursor-pointer"
                      disabled={status === 'loading'}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="flex-2 rounded-2xl bg-white text-black font-black p-4 text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg font-bold"
                    >
                      {status === 'loading' ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Check size={13} />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 4: Success State */}
              {step === 'success' && (
                <motion.div 
                  key="step-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 py-4 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <CheckCircle2 size={28} className="animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">CREDENTIALS UPDATED</p>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Password Successfully Reset</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
                      Your security credentials have been updated in the Polystrukt authentication core. You can now sign in with your new password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onPasswordResetComplete?.(email);
                      onClose();
                    }}
                    className="w-full rounded-2xl bg-white text-black p-4.5 font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-zinc-200 cursor-pointer text-center block shadow-xl"
                  >
                    Sign In With New Password
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  mode = 'signin',
  title,
  description,
  heroImageSrc,
  onSignIn,
  onGoogleSignIn,
  onAuth0SignIn,
  onResetPassword,
  onToggleMode,
  onBack,
  isLoading = false,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [rememberSession, setRememberSession] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('persistent_session');
      return saved !== 'false';
    }
    return true;
  });

  const handleRememberSessionChange = (checked: boolean) => {
    setRememberSession(checked);
    localStorage.setItem('persistent_session', checked ? 'true' : 'false');
  };

  const handleEmailChange = (val: string) => {
    let processed = val.slice(0, 80);
    // Strict filter: strip spaces, backslashes, quote characters, braces, brackets, and angle brackets
    processed = processed.replace(/[\s<>"'`\\/\[\](){}]/g, '');
    setEmailValue(processed);
  };

  const handlePasswordChange = (val: string) => {
    let processed = val.slice(0, 128);
    // Strip opening/closing XML/HTML tag components to guard against direct frontend script injections
    processed = processed.replace(/[<>]/g, '');
    setPasswordValue(processed);
  };

  const displayTitle = title || (mode === 'signin' ? 
    <span className="font-black text-foreground tracking-tighter uppercase font-unique">Sign In</span> :
    <span className="font-black text-foreground tracking-tighter uppercase font-unique">Register</span>
  );

  const displayDescription = description || (mode === 'signin' ?
    "Sign in to access your secure design workspace." :
    "Create an account to start your engineering journey."
  );

  const protocols = [
    {
      title: "AI Design Engine",
      desc: "Create complex 3D geometry instantly using advanced procedural generation.",
      icon: Zap
    },
    {
      title: "Smart Optimization",
      desc: "Automatic stress reduction and material efficiency for all your models.",
      icon: Shield
    },
    {
      title: "Fast Generation",
      desc: "Go from structural concept to production-ready file in seconds.",
      icon: Sparkles
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background w-full relative selection:bg-indigo-500/30">
      <BackgroundOrbs />

      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8 pt-24 md:pt-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={mode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            {onBack && (
              <motion.button 
                whileHover={{ x: -10 }}
                onClick={onBack}
                className="absolute top-8 left-8 p-3 text-muted-foreground hover:text-foreground transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]"
              >
                <ArrowRight className="rotate-180" size={16} />
                Back
              </motion.button>
            )}
            
            <div className="flex flex-col gap-10">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-accent border border-border text-indigo-500 text-[9px] font-black uppercase tracking-[0.4em] shadow-inner"
                >
                  <Zap size={12} className="text-indigo-500" />
                  Secure Login
                </motion.div>
                
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 mb-2"
                    >
                      <div className="mt-0.5 text-red-500">
                        <Lock size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Login Error</p>
                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl md:text-8xl font-black leading-[0.8] tracking-tighter uppercase font-unique text-foreground"
                >
                  {displayTitle}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground font-bold text-sm tracking-tight leading-relaxed max-w-[90%] uppercase"
                >
                  {displayDescription}
                </motion.p>
              </div>

              <form className="space-y-8" onSubmit={onSignIn}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-1">Email or Username</label>
                    <button
                      type="button"
                      onClick={() => {
                        handleEmailChange('engineer@polystrukt.io');
                        handlePasswordChange('Password123!');
                      }}
                      className="text-[8.5px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition-all"
                    >
                      Fill Demo Credentials
                    </button>
                  </div>
                  <GlassInputWrapper icon={Mail}>
                    <div className="relative flex items-center w-full">
                      <input 
                        name="email" 
                        type="text" 
                        required 
                        placeholder="name@email.com or username" 
                        value={emailValue}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        maxLength={80}
                        className="w-full bg-transparent text-sm p-5 pl-14 pr-14 rounded-2xl focus:outline-none font-mono font-medium text-foreground placeholder:text-muted-foreground disabled:opacity-50 tracking-[0.1em]" 
                        disabled={isLoading} 
                      />
                      {emailValue.length > 0 && (
                        <div className="absolute right-4 flex items-center pointer-events-none">
                          {emailValue.length >= 3 ? (
                            <Check className="text-emerald-500 h-4 w-4 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          ) : (
                            <AlertCircle className="text-amber-500 h-4 w-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          )}
                        </div>
                      )}
                    </div>
                  </GlassInputWrapper>
                </motion.div>
 
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-1">Password</label>
                  <GlassInputWrapper icon={Lock}>
                    <div className="relative">
                      <input 
                        name="password" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        placeholder="Enter your password" 
                        value={passwordValue}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        maxLength={128}
                        className="w-full bg-transparent text-sm p-5 pl-14 pr-24 rounded-2xl focus:outline-none font-mono font-medium text-foreground placeholder:text-muted-foreground disabled:opacity-50 tracking-[0.5em]" 
                        disabled={isLoading} 
                      />
                      <div className="absolute inset-y-0 right-4 flex items-center gap-2">
                        {passwordValue.length > 0 && (
                          passwordValue.length >= 8 ? (
                            <Check className="text-emerald-500 h-4 w-4 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          ) : (
                            <AlertCircle className="text-amber-500 h-4 w-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          )
                        )}
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors p-1" disabled={isLoading}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </GlassInputWrapper>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em]"
                >
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                       <input 
                         type="checkbox" 
                         name="rememberMe" 
                         checked={rememberSession}
                         onChange={(e) => handleRememberSessionChange(e.target.checked)}
                         className="peer absolute opacity-0 w-5 h-5 cursor-pointer" 
                       />
                       <div className={`w-5 h-5 border border-border rounded-lg bg-accent transition-all shadow-sm flex items-center justify-center ${
                         rememberSession ? 'bg-indigo-600 border-indigo-500' : ''
                       }`}>
                         {rememberSession && <Check size={10} className="text-white font-bold" />}
                       </div>
                    </div>
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember Me</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPasswordOpen(true); onResetPassword?.(); }} className="text-indigo-500 hover:text-indigo-400 transition-colors">Forgot Password?</a>
                </motion.div>
 
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-foreground p-6 font-black text-background text-xs uppercase tracking-[0.4em] transition-all shadow-xl font-unique disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-4">
                    {isLoading ? <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <Sparkles size={18} className="text-purple-500" />}
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </span>
                </motion.button>
              </form>

              <div className="relative flex items-center justify-center py-6">
                <span className="w-full border-t border-border"></span>
                <span className="px-6 text-[8px] font-black text-muted-foreground uppercase tracking-[0.5em] bg-background absolute">Or continue with</span>
              </div>
 
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={!isLoading ? { scale: 1.02, backgroundColor: "var(--accent)" } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGoogleSignIn} 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 border border-border rounded-2xl py-3.5 bg-accent shadow-sm transition-all font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:text-foreground hover:border-indigo-500/30"
                  type="button"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" /> : <GoogleIcon />}
                  <span>Google</span>
                </motion.button>

                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.72 }}
                  whileHover={!isLoading ? { scale: 1.02, backgroundColor: "var(--accent)" } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAuth0SignIn || onGoogleSignIn} 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 border border-border rounded-2xl py-3.5 bg-accent shadow-sm transition-all font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:text-foreground hover:border-orange-500/30"
                  type="button"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" /> : <Auth0Icon />}
                  <span>Auth0</span>
                </motion.button>

                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  whileHover={!isLoading ? { scale: 1.02, backgroundColor: "var(--accent)" } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!isLoading && onGoogleSignIn) {
                      console.log("[AUTH] Triggered GitHub login process simulation.");
                      onGoogleSignIn();
                    }
                  }} 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 border border-border rounded-2xl py-3.5 bg-accent shadow-sm transition-all font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:text-foreground hover:border-purple-500/30"
                  type="button"
                >
                  <Github size={15} className="text-foreground" />
                  <span>GitHub</span>
                </motion.button>

                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={!isLoading ? { scale: 1.02, backgroundColor: "var(--accent)" } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!isLoading && onGoogleSignIn) {
                      console.log("[AUTH] Triggered Microsoft login process simulation.");
                      onGoogleSignIn();
                    }
                  }} 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 border border-border rounded-2xl py-3.5 bg-accent shadow-sm transition-all font-black text-[9px] uppercase tracking-[0.15em] text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:text-foreground hover:border-sky-500/30"
                  type="button"
                >
                  <MicrosoftIcon />
                  <span>Microsoft</span>
                </motion.button>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]"
              >
                {mode === 'signin' ? "No account?" : "Have an account?"} <a href="#" onClick={(e) => { e.preventDefault(); onToggleMode?.(); }} className="text-indigo-500 hover:text-indigo-400 transition-colors ml-2">Switch</a>
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="text-center text-[8px] text-zinc-500 leading-relaxed font-sans pt-2 border-t border-border/40"
              >
                By proceeding, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-legal', { detail: { tab: 'terms' } }))}
                  className="text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Terms of Service
                </button>
                ,{' '}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-legal', { detail: { tab: 'safety' } }))}
                  className="text-amber-400/90 hover:text-amber-300 underline cursor-pointer"
                >
                  Engineering Liability Waiver
                </button>
                , and{' '}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-legal', { detail: { tab: 'privacy' } }))}
                  className="text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Privacy Policy
                </button>
                .
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden lg:block flex-1 relative p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-12 rounded-[4rem] bg-cover bg-center shadow-2xl shadow-indigo-500/10 overflow-hidden group border border-border" 
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 transition-opacity duration-1000" />
            <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
            
            {/* Animated Scanning Line */}
            <motion.div 
              animate={{ top: ['-10%', '110%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent z-20 shadow-[0_0_15px_rgba(129,140,248,0.5)]"
            />
 
            <div className="absolute bottom-20 left-16 right-16">
              <div className="flex flex-col gap-12">
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-1 w-32 bg-indigo-500 rounded-full shadow-sm origin-left" 
                  />
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-5xl font-black text-foreground uppercase tracking-tighter font-unique leading-[0.8]"
                  >
                    Advanced <br />
                    <span className="text-muted-foreground opacity-50">Engineering</span>
                  </motion.h2>
                </div>

                <div className="flex flex-col gap-6">
                  {protocols.map((p, i) => (
                    <ProtocolCard key={i} title={p.title} desc={p.desc} icon={p.icon} delay={0.8 + (i * 0.2)} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Data HUD */}
            <div className="absolute top-16 right-16 text-right">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2">Core Status</p>
               <p className="text-xs font-black text-emerald-500 uppercase tracking-widest animate-pulse">Structural Integrity: 100%</p>
            </div>
          </motion.div>
        </section>
      )}
      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
        initialEmail={emailValue}
        onPasswordResetComplete={(resetEmail) => {
          setEmailValue(resetEmail);
          setPasswordValue('');
          setIsForgotPasswordOpen(false);
        }}
      />
    </div>
  );
};  
