import React, { useState, useRef, useEffect } from 'react';
import { Shield, ArrowLeft, Check, AlertCircle, KeyRound, Mail, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OTPPageProps {
  email: string;
  debugOtp?: string;
  onVerify: (otp: string) => Promise<void>;
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
  onCancel,
  isLoading,
  error,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Auto focus the first field
    inputRefs[0].current?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const newVal = val.slice(-1).replace(/[^0-9]/g, ''); // Numbers only
    const updatedDigits = [...digits];
    updatedDigits[index] = newVal;
    setDigits(updatedDigits);
    setOtpError(null);

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
      
      const targetFocusIndex = Math.min(pastedData.length, 5);
      inputRefs[targetFocusIndex].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = digits.join('');
    if (otpCode.length < 6) {
      setOtpError('Please fill in the complete 6-digit verification sequence.');
      return;
    }
    await onVerify(otpCode);
  };

  const handleFillDebug = () => {
    if (debugOtp && debugOtp.length === 6) {
      const parts = debugOtp.split('');
      setDigits(parts);
      inputRefs[5].current?.focus();
    }
  };

  const isFormComplete = digits.every(d => d !== '');

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
          className="absolute top-8 left-8 p-3 text-muted-foreground hover:text-foreground transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] group"
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
          <div className="flex justify-between gap-2.5 mx-auto max-w-[290px]">
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
                  className="w-full h-full bg-zinc-900/50 border border-white/10 rounded-xl text-center text-xl font-black font-mono text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  disabled={isLoading}
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

          <button
            type="submit"
            disabled={isLoading || !isFormComplete}
            className="w-full rounded-2xl bg-white text-black font-black p-5 text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg font-bold"
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

        {/* Development Helper Widget (Simulated Email Dispatcher) */}
        {debugOtp && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3 rounded-2xl bg-zinc-900/30 p-4 border border-indigo-500/10"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-400" />
              <span className="text-[9px] font-black font-mono text-indigo-400 uppercase tracking-wider">
                Sandbox Console
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 leading-relaxed font-semibold uppercase">
              To preview the flow locally, you can auto-fill this challenge or type: <span className="font-mono text-white select-all bg-white/5 py-0.5 px-1.5 rounded">{debugOtp}</span>
            </div>
            <button
              onClick={handleFillDebug}
              type="button"
              className="text-left text-[9px] font-black text-indigo-400 hover:text-indigo-200 transition-colors uppercase tracking-[0.15em] self-start"
            >
              ⚡ Auto-Fill Security Code
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
