import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  ArrowLeft, 
  AlertCircle, 
  KeyRound, 
  Mail, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OTPPageProps {
  email: string;
  debugOtp?: string;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<{ success?: boolean; message?: string; _debugOtp?: string } | void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

const TechnicalBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-background pointer-events-none">
    {/* Grid Layer */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1e1e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e1e_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
    
    <motion.div 
      animate={{ 
        x: [0, 40, 0], 
        y: [0, -20, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 -left-20 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full opacity-60"
    />
    <motion.div 
      animate={{ 
        x: [0, -40, 0], 
        y: [0, 20, 0],
        scale: [1, 1.15, 1]
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full opacity-60"
    />
  </div>
);

export const OTPPage: React.FC<OTPPageProps> = ({
  email,
  debugOtp,
  onVerify,
  onResend,
  onCancel,
  isLoading,
  error,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);
  const [activeDebugOtp, setActiveDebugOtp] = useState<string | undefined>(debugOtp);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    setActiveDebugOtp(debugOtp);
  }, [debugOtp]);

  useEffect(() => {
    // Auto focus the first field
    inputRefs[0].current?.focus();
  }, []);

  // 60-second visual resend timer countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (error || otpError) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 550);
      return () => clearTimeout(timer);
    }
  }, [error, otpError]);

  const handleDigitChange = (index: number, val: string) => {
    const newVal = val.slice(-1).replace(/[^0-9]/g, ''); // Numbers only
    const updatedDigits = [...digits];
    updatedDigits[index] = newVal;
    setDigits(updatedDigits);
    setOtpError(null);
    setResendSuccessMessage(null);

    // If a digit was entered, auto focus the next ref
    if (newVal !== '' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        // Clear previous field and set focus
        const updatedDigits = [...digits];
        updatedDigits[index - 1] = '';
        setDigits(updatedDigits);
        inputRefs[index - 1].current?.focus();
        setOtpError(null);
      } else {
        // Clear current field
        const updatedDigits = [...digits];
        updatedDigits[index] = '';
        setDigits(updatedDigits);
        setOtpError(null);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
    
    if (pastedData.length > 0) {
      const updatedDigits = [...digits];
      for (let i = 0; i < pastedData.length; i++) {
        updatedDigits[i] = pastedData[i];
      }
      setDigits(updatedDigits);
      setOtpError(null);
      setResendSuccessMessage(null);
      
      const targetFocusIndex = Math.min(pastedData.length, 5);
      inputRefs[targetFocusIndex].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = digits.join('');
    if (otpCode.length < 6) {
      setOtpError('Please fill in the complete 6-digit verification sequence.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 550);
      return;
    }
    try {
      await onVerify(otpCode);
    } catch {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 550);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isResending || isLoading) return;

    setIsResending(true);
    setOtpError(null);
    setResendSuccessMessage(null);

    try {
      let freshDebugOtp: string | undefined;

      if (onResend) {
        const result = await onResend();
        if (result && typeof result === 'object' && result._debugOtp) {
          freshDebugOtp = result._debugOtp;
        }
      } else {
        const res = await fetch('/api/auth/resend-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to dispatch new verification code.');
        }
        if (data._debugOtp) {
          freshDebugOtp = data._debugOtp;
        }
      }

      if (freshDebugOtp) {
        setActiveDebugOtp(freshDebugOtp);
      }

      // Reset digits & re-focus initial input
      setDigits(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();

      // Reset 60-second cooldown timer
      setCountdown(60);
      setResendSuccessMessage('A fresh 6-digit security sequence was dispatched to your email.');

      setTimeout(() => {
        setResendSuccessMessage(null);
      }, 7000);
    } catch (err: any) {
      setOtpError(err.message || 'Unable to re-dispatch verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleFillDebug = () => {
    if (activeDebugOtp && activeDebugOtp.length === 6) {
      const parts = activeDebugOtp.split('');
      setDigits(parts);
      inputRefs[5].current?.focus();
    }
  };

  const isFormComplete = digits.every(d => d !== '');
  const circleCircumference = 87.96; // 2 * Math.PI * 14
  const strokeOffset = circleCircumference * (1 - countdown / 60);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 selection:bg-indigo-500/30">
      <TechnicalBackground />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-full max-w-md bg-zinc-950/90 border border-white/10 rounded-[2.5rem] overflow-hidden relative shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_60px_rgba(99,102,241,0.06)] flex flex-col p-8 z-10"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

        <button 
          onClick={onCancel}
          className="absolute top-8 left-8 p-3 text-muted-foreground hover:text-foreground transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Cancel
        </button>

        <div className="mt-14 flex flex-col items-center text-center">
          <div className="h-16 w-16 mb-6 flex items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-xl relative group">
            <Shield size={28} className="text-indigo-400 animate-pulse" />
          </div>

          <h1 className="text-3xl font-black uppercase tracking-widest text-foreground font-unique mb-2">
            Verification Required
          </h1>
          <p className="text-[11px] font-mono font-bold text-indigo-400/80 uppercase tracking-widest mb-6">
            Two-Factor Protection Protocol
          </p>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl mb-8">
            <Mail size={12} className="text-zinc-500" />
            <p className="text-[11px] font-medium text-zinc-300 font-mono">
              {email}
            </p>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-[85%] font-medium uppercase text-center mb-8">
            An authentication challenge containing a 6-digit sequence has been dispatched to your email address of record.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Input Container with glitch shake animation on invalid PIN */}
          <div 
            className={`flex justify-between gap-2.5 mx-auto max-w-[290px] p-2 rounded-2xl transition-all ${
              isShaking 
                ? 'animate-industrial-glitch bg-red-950/30 border border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.4)]' 
                : (error || otpError)
                  ? 'bg-red-950/15 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'border border-transparent'
            }`}
          >
            {digits.map((digit, index) => (
              <div key={index} className="relative w-11 h-14">
                <input
                  ref={inputRefs[index]}
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-full h-full bg-zinc-900/50 border rounded-xl text-center text-xl font-black font-mono text-white focus:outline-none transition-all ${
                    (error || otpError)
                      ? 'border-red-500/80 bg-red-950/30 text-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/40'
                      : 'border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  }`}
                  disabled={isLoading || isResending}
                />
              </div>
            ))}
          </div>

          <AnimatePresence>
            {(error || otpError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4"
              >
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5 font-mono">CHALLENGE_FAILED</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium leading-relaxed">{error || otpError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button with glitch shake animation on invalid PIN */}
          <button
            type="submit"
            disabled={isLoading || isResending || !isFormComplete}
            className={`w-full rounded-2xl font-black p-5 text-[10px] uppercase tracking-[0.3em] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg font-bold ${
              isShaking
                ? 'animate-industrial-glitch bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.6)] border border-red-400'
                : (error || otpError)
                  ? 'bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Key...</span>
              </>
            ) : (
              <>
                <KeyRound size={12} />
                <span>Verify Sequence</span>
              </>
            )}
          </button>
        </form>

        {/* Visual Resend Code Timer Section */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center">
          {countdown > 0 ? (
            <div className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                {/* Circular SVG Countdown Progress */}
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      className="stroke-white/10"
                      strokeWidth="2.5"
                    />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      className="stroke-indigo-400"
                      strokeWidth="2.5"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      transition={{ duration: 0.3, ease: "linear" }}
                    />
                  </svg>
                  <span className="absolute text-[9px] font-mono font-black text-indigo-300">
                    {countdown}
                  </span>
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <Lock size={10} className="text-zinc-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                      Rate Limit Active
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Resend available in 00:{countdown < 10 ? `0${countdown}` : countdown}
                  </p>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={10} className="animate-spin" style={{ animationDuration: '6s' }} />
                <span>60s Lock</span>
              </div>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-3.5 flex items-center justify-center gap-2.5 text-indigo-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group cursor-pointer shadow-lg shadow-indigo-500/5"
            >
              {isResending ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-indigo-400" />
                  <span>Dispatching New Sequence...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={13} className="text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Resend Verification Sequence</span>
                </>
              )}
            </motion.button>
          )}

          <AnimatePresence>
            {resendSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="w-full mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 text-emerald-400"
              >
                <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                <p className="font-mono text-[10px] font-medium leading-relaxed uppercase tracking-wider">
                  {resendSuccessMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Development Helper Widget (Simulated Email Dispatcher) */}
        {activeDebugOtp && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-5 border-t border-white/5 flex flex-col gap-3 rounded-2xl bg-zinc-900/30 p-4 border border-indigo-500/10"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-400" />
              <span className="text-[9px] font-black font-mono text-indigo-400 uppercase tracking-wider">
                Sandbox Console
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 leading-relaxed font-semibold uppercase">
              To preview the flow locally, you can auto-fill this challenge or type: <span className="font-mono text-white select-all bg-white/5 py-0.5 px-1.5 rounded">{activeDebugOtp}</span>
            </div>
            <button
              onClick={handleFillDebug}
              type="button"
              className="text-left text-[9px] font-black text-indigo-400 hover:text-indigo-200 transition-colors uppercase tracking-[0.15em] self-start cursor-pointer"
            >
              ⚡ Auto-Fill Security Code
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
