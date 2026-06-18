import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Zap, 
  ChevronRight,
  ChevronDown,
  Briefcase,
  Database,
  Cpu,
  Globe,
  Check,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Loader2,
  QrCode,
  Camera,
  Laptop,
  Smartphone,
  RefreshCw,
  Download,
  Copy,
  Share2,
  Linkedin,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import { useAuth } from '../../hooks/useAuth';

interface RegisterPageProps {
  onSignUp: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

const TechnicalBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
    {/* Grid Layer */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1e1e_1px,transparent_1px),linear-gradient(to_bottom,#1e1e1e_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    
    {/* Scanning Line */}
    <motion.div 
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent z-10"
    />

    {/* Data Stream Bubbles */}
    <div className="absolute top-0 left-0 w-full h-full opacity-20">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
           key={i}
           initial={{ opacity: 0, y: Math.random() * 1000 }}
           animate={{ 
             opacity: [0, 1, 0],
             y: [1000, -100]
           }}
           transition={{ 
             duration: 10 + Math.random() * 20, 
             repeat: Infinity, 
             delay: Math.random() * 10 
           }}
           className="absolute text-[8px] font-mono text-purple-400 whitespace-nowrap"
           style={{ left: `${Math.random() * 100}%` }}
        >
          {`STRUCT_SYNTH_PARALLEL_CORE_${Math.random().toString(16).substring(2, 6).toUpperCase()}`}
        </motion.div>
      ))}
    </div>
  </div>
);

const TerminalStatus = ({ label, value, color = "text-purple-500" }: { label: string, value: string, color?: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
    <span className={`text-[10px] font-mono font-bold uppercase ${color}`}>{value}</span>
  </div>
);

interface MobileSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileImport?: (data: { username: string; email: string; role: string }) => void;
}

const MobileSyncModal: React.FC<MobileSyncModalProps> = ({ isOpen, onClose, onProfileImport }) => {
  const setSession = useAuth(state => state.setSession);
  const [activeTab, setActiveTab] = useState<'camera' | 'demo'>('camera');
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  // High fidelity haptic vibration feedback & actively processed spec decoding states
  const [isProcessingQR, setIsProcessingQR] = useState(false);
  const [qrProgress, setQrProgress] = useState(0);
  const [vibrateTrigger, setVibrateTrigger] = useState(false);
  const [autoRetryStatus, setAutoRetryStatus] = useState<string | null>(null);
  
  const isProcessingRef = React.useRef(false);
  const lastScanProgressRef = React.useRef<number>(Date.now());
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset processing state machines
    isProcessingRef.current = false;
    setIsProcessingQR(false);
    setQrProgress(0);
    setVibrateTrigger(false);
    setAutoRetryStatus(null);
    lastScanProgressRef.current = Date.now();

    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (err) {
        console.error("Enumerate devices error in MobileSyncModal:", err);
        // Fallback: always allow switching camera for robust support
        setHasMultipleCameras(true);
      }
    };
    checkCameras();

    navigator.mediaDevices.addEventListener?.('devicechange', checkCameras);
    return () => {
      navigator.mediaDevices.removeEventListener?.('devicechange', checkCameras);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') return;
    
    let activeStream: MediaStream | null = null;
    let animId: number;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } })
      .then(stream => {
        activeStream = stream;
        setHasCameraAccess(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.error("Play error:", err));
        }

        // Setup canvas decoding loop
        const scan = () => {
          if (!isProcessingRef.current) {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              const canvas = canvasRef.current || document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const video = videoRef.current;
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imgData.data, imgData.width, imgData.height, {
                  inversionAttempts: "dontInvert",
                });

                if (code && !isProcessingRef.current) {
                  lastScanProgressRef.current = Date.now();
                  isProcessingRef.current = true;
                  setIsProcessingQR(true);
                  setVibrateTrigger(true);

                  // Simulate device vibration if API available
                  try {
                    if (navigator.vibrate) {
                      navigator.vibrate([150, 50, 150]);
                    }
                  } catch (vErr) {
                    console.warn("Haptic API block:", vErr);
                  }

                  setTimeout(() => {
                    setVibrateTrigger(false);
                  }, 400);

                  let progress = 0;
                  const interval = setInterval(() => {
                    progress += 5;
                    setQrProgress(Math.min(progress, 150)); // let's stay within bounds

                    if (progress === 50) {
                      try { navigator.vibrate?.(40); } catch (e) {}
                    }

                    if (progress >= 100) {
                      clearInterval(interval);
                      try { navigator.vibrate?.(80); } catch (e) {}

                      try {
                        const payload = JSON.parse(code.data);
                        if (payload.type === 'polystrukt-sync' && payload.token) {
                          handleSyncSuccess(payload.token, payload.user);
                        } else if (payload.type === 'polystrukt-profile-import') {
                          handleProfileImportSuccess(payload);
                        } else {
                          if (code.data.length > 20) {
                            handleSyncSuccess(code.data, {
                              email: 'synced_engineer@polystrukt.sh',
                              username: 'synced_engineer',
                              role: 'Structural Designer'
                            });
                          }
                        }
                      } catch (e) {
                        if (code.data.length > 20) {
                          handleSyncSuccess(code.data, {
                            email: 'synced_engineer@polystrukt.sh',
                            username: 'synced_engineer',
                            role: 'Structural Designer'
                          });
                        }
                      }
                    }
                  }, 40);
                } else {
                  // No code detected in this frame, check for 5s timeout to trigger auto-retry/re-calibration
                  if (Date.now() - lastScanProgressRef.current >= 5000) {
                    isProcessingRef.current = false;
                    setIsProcessingQR(false);
                    setQrProgress(0);
                    setVibrateTrigger(false);
                    
                    setAutoRetryStatus("SCANNER AUTO-RETRY CALIBRATION TRIGGERED");
                    setTimeout(() => setAutoRetryStatus(null), 1500);

                    try {
                      if (navigator.vibrate) {
                        navigator.vibrate([50]);
                      }
                    } catch (e) {}

                    lastScanProgressRef.current = Date.now();
                  }
                }
              }
            }
          } else {
            // If processing is active but has been stuck without resolving for 5+ seconds, force a safe reset
            if (Date.now() - lastScanProgressRef.current >= 5000) {
              isProcessingRef.current = false;
              setIsProcessingQR(false);
              setQrProgress(0);
              setVibrateTrigger(false);
              
              setAutoRetryStatus("SCANNER AUTO-RETRY CALIBRATION TRIGGERED");
              setTimeout(() => setAutoRetryStatus(null), 1500);

              try {
                if (navigator.vibrate) {
                  navigator.vibrate([50]);
                }
              } catch (e) {}

              lastScanProgressRef.current = Date.now();
            }
          }
          animId = requestAnimationFrame(scan);
        };

        animId = requestAnimationFrame(scan);
      })
      .catch(err => {
        console.error("Camera access blocked or error:", err);
        setHasCameraAccess(false);
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [isOpen, activeTab, facingMode]);

  const handleSyncSuccess = async (token: string, user: any) => {
    setIsSyncing(true);
    setSyncStatus("ACQUIRING ENCRYPTION KEYS...");
    await new Promise(resolve => setTimeout(resolve, 600));
    setSyncStatus("DECRYPTING MOBILE CONSOLE PACKET...");
    await new Promise(resolve => setTimeout(resolve, 600));
    setSyncStatus("AUTHENTICATING LINK PROTOCOL...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Perform session creation
    setSession(token, user);
    setIsSyncing(false);
    onClose();
  };

  const handleProfileImportSuccess = async (payload: any) => {
    setIsSyncing(true);
    setSyncStatus("EXTRACTING PROFILE PARAMETERS...");
    await new Promise(resolve => setTimeout(resolve, 600));
    setSyncStatus("SYNCHRONIZING SECURE DATABASE...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onProfileImport) {
      onProfileImport({
        username: payload.username || '',
        email: payload.email || '',
        role: payload.role || 'Mechanical Engineer'
      });
    }
    setIsSyncing(false);
    onClose();
  };

  const handleSimulateSync = () => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsProcessingQR(true);
    setVibrateTrigger(true);
    setQrProgress(0);

    try {
      if (navigator.vibrate) {
        navigator.vibrate([150, 50, 150]);
      }
    } catch (e) {}

    setTimeout(() => {
      setVibrateTrigger(false);
    }, 400);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setQrProgress(Math.min(progress, 100));

      if (progress === 50) {
        try { navigator.vibrate?.(40); } catch (e) {}
      }

      if (progress >= 100) {
        clearInterval(interval);
        try { navigator.vibrate?.(80); } catch (e) {}

        const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2QiLCJlbWFpbCI6Im1vYmlsZS5zeW5jQHBvbHlzdHJ1a3Quc2giLCJpYXQiOjE2MjQwMDAwMDB9.xyz-mock-signature";
        const mockUser = {
          email: 'mobile.sync@polystrukt.sh',
          username: 'mobile_sync_unit',
          role: 'Additive Manufacturing Lead'
        };
        handleSyncSuccess(mockToken, mockUser);
      }
    }, 40);
  };

  const handleSimulateProfileImport = () => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessingQR(true);
    setVibrateTrigger(true);
    setQrProgress(0);

    try {
      if (navigator.vibrate) {
        navigator.vibrate([150, 50, 150]);
      }
    } catch (e) {}

    setTimeout(() => {
      setVibrateTrigger(false);
    }, 400);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setQrProgress(Math.min(progress, 100));

      if (progress === 50) {
        try { navigator.vibrate?.(40); } catch (e) {}
      }

      if (progress >= 100) {
        clearInterval(interval);
        try { navigator.vibrate?.(80); } catch (e) {}

        const mockPayload = {
          type: 'polystrukt-profile-import',
          username: 'quantum_architect',
          email: 'quantum.architect@polystrukt.sh',
          role: 'Aerospace Systems Architect'
        };
        handleProfileImportSuccess(mockPayload);
      }
    }, 40);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden relative shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.15)] flex flex-col"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <QrCode className="text-purple-500 animate-pulse" size={20} />
            <h2 className="text-xs font-black font-mono text-white tracking-[0.2em] uppercase">MOBILE SYNC PROTOCOL</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-650 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
          <p className="text-[10px] font-mono leading-relaxed text-zinc-500 uppercase tracking-wider text-center">
            Link session instantly with your active mobile unit or point your camera on a shared CAD engineering profile QR to import parameters.
          </p>

          {/* Tab Options */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-white/5 font-mono text-[9px] uppercase tracking-widest font-black">
            <button
              onClick={() => setActiveTab('camera')}
              className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Camera size={12} />
              Cam Scanner
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'demo'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <QrCode size={12} />
              Demo QR Code
            </button>
          </div>

          {isSyncing ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-xs font-mono font-bold text-white tracking-[0.2em] uppercase">{syncStatus}</p>
                <p className="text-[9px] font-mono text-zinc-500 tracking-wider">ESTABLISHING CRYPTOGRAPHIC SHAKE...</p>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <motion.div
                animate={vibrateTrigger ? {
                  x: [0, -6, 6, -6, 6, -3, 3, 0],
                  y: [0, 3, -3, 3, -3, 1.5, -1.5, 0]
                } : {}}
                transition={{ duration: 0.4 }}
                className="relative w-full aspect-video rounded-2xl bg-black border border-white/5 overflow-hidden flex items-center justify-center transition-all duration-300"
              >
                {hasCameraAccess === null ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-zinc-650 animate-spin" />
                    <p className="text-[9px] font-mono text-zinc-500 tracking-wider">REQUESTING DEVICE ENUMERATION...</p>
                  </div>
                ) : hasCameraAccess === false ? (
                  <div className="p-6 text-center space-y-4">
                    <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">CAMERA CAPTURE BLOCKED / UNAVAILABLE</p>
                    <p className="text-[9px] font-mono text-zinc-600 max-w-xs mx-auto leading-relaxed uppercase">
                      Ensure camera permissions are updated. Try scanning using simulator tools below for immediate session bypass.
                    </p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {hasMultipleCameras && (
                      <button
                        type="button"
                        onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                        className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/80 hover:bg-black border border-white/10 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 text-[8px] font-bold font-mono uppercase tracking-widest transition-all cursor-pointer backdrop-blur-md shadow-lg select-none group active:scale-95"
                        title="Switch active camera feed (Front / Rear)"
                      >
                        <RefreshCw size={10} className="text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Switch Camera ({facingMode === 'environment' ? 'REAR' : 'FRONT'})</span>
                      </button>
                    )}

                    {autoRetryStatus && (
                      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-950/90 border border-purple-500/30 text-purple-300 text-[8px] font-bold font-mono uppercase tracking-widest animate-pulse backdrop-blur-md shadow-lg select-none">
                        <RefreshCw size={10} className="text-purple-400 animate-spin" />
                        <span>{autoRetryStatus}</span>
                      </div>
                    )}

                    {/* Cyber reticle scanning overlay with high-fidelity Scanning Lens effects */}
                    <div className="scanning-lens-active">
                      {/* Grid background mask */}
                      <div className="scanning-lens-grid" />

                      {/* Rotating lens rings and radar wave feedback */}
                      <div className="scanning-lens-ring-1" />
                      <div className="scanning-lens-ring-2" />
                      <div className="scanning-lens-radar-wave" />
                      <div className="scanning-lens-crosshair" />

                      {/* Corner focus brackets */}
                      <div className="absolute inset-0 m-6 flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        
                        {/* Scanning visual laser sweep line */}
                        <motion.div
                          animate={{ top: ['0%', '100%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-0.5 bg-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,1)] z-10"
                        />
                      </div>
                    </div>

                    {/* Active Processing & Haptic Feedback Simulation Overlay */}
                    {isProcessingQR && (
                      <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] z-40 flex flex-col items-center justify-center p-4">
                        <div className="text-center space-y-4 w-full max-w-[280px]">
                          <motion.div 
                            animate={{ 
                              scale: vibrateTrigger ? [1, 1.15, 0.9, 1] : 1,
                              rotate: vibrateTrigger ? [0, 4, -4, 0] : 0
                            }}
                            className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400"
                          >
                            <Zap className="w-5 h-5 animate-pulse" />
                          </motion.div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-white tracking-[0.2em] uppercase block">
                              QR CODE DETECTED
                            </span>
                            <span className="text-[8px] font-mono text-zinc-400 tracking-wider uppercase block">
                              DECODING VIA jsQR PROTOCOL
                            </span>
                          </div>
                          
                          {/* Progress bar container */}
                          <div className="space-y-1.5">
                            <div className="h-1.5 w-full bg-zinc-900 border border-white/5 rounded-full overflow-hidden relative">
                              <div 
                                className="h-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)] transition-all duration-75 ease"
                                style={{ width: `${qrProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                              <span>PROCESSING SPECS</span>
                              <span className="font-bold text-purple-400">{qrProgress}%</span>
                            </div>
                          </div>

                          <span className="text-[7.5px] font-mono text-purple-500/85 tracking-wider uppercase block animate-pulse">
                            {vibrateTrigger ? "⚡ [Haptic Impulse Triggered] ⚡" : "CALIBRATING LINK KEY"}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>

              {/* Direct Bypass trigger */}
              <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSimulateSync}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-purple-950/20 hover:bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 font-mono text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-98"
                >
                  <Sparkles size={11} />
                  Simulate Device Link
                </button>
                <button
                  type="button"
                  onClick={handleSimulateProfileImport}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 font-mono text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-98"
                >
                  <User size={11} />
                  Simulate Profile Scan
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 bg-zinc-900/10 border border-white/5 rounded-2xl gap-5">
              <div className="p-4 bg-white rounded-2xl relative shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: "polystrukt-sync",
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2QiLCJlbWFpbCI6Im1vYmlsZS5zeW5jQHBvbHlzdHJ1a3Quc2giLCJpYXQiOjE2MjQwMDAwMDB9.xyz-mock-signature",
                    user: {
                      email: 'mobile.sync@polystrukt.sh',
                      username: 'mobile_sync_unit',
                      role: 'Mechanical Engineer'
                    }
                  })}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] font-mono text-zinc-300 font-bold uppercase tracking-widest">ACTIVE SESSION SIGNATURE</p>
                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest max-w-[280px] mx-auto leading-normal">
                  In a production system, this QR is displayed on your active session dashboard, and you scan it using your mobile phone camera!
                </p>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleSimulateSync}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-98 shadow-[0_5px_15px_rgba(168,85,247,0.3)]"
                >
                  <Sparkles size={11} />
                  Link Unit
                </button>
                <button
                  type="button"
                  onClick={handleSimulateProfileImport}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-98 shadow-[0_5px_15px_rgba(16,185,129,0.3)]"
                >
                  <User size={11} />
                  Import Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- NEW PERSONAL ID BADGE / PROFILE QR GENERATION MODAL ---
interface ProfileQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    username: string;
    email: string;
    role: string;
  };
}

const ProfileQRModal: React.FC<ProfileQRModalProps> = ({ isOpen, onClose, profile }) => {
  const [copied, setCopied] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<'purple' | 'emerald' | 'amber' | 'white'>('purple');
  const [qrSize, setQrSize] = useState<512 | 1024 | 2048>(1024);

  const themeColors = {
    purple: { primary: '#a855f7', stroke: 'border-purple-500/20', bg: 'bg-purple-950/10', glow: 'shadow-purple-500/20', fillHex: '#a855f7', text: 'text-purple-400', button: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30' },
    emerald: { primary: '#10b981', stroke: 'border-emerald-500/20', bg: 'bg-emerald-950/10', glow: 'shadow-emerald-500/20', fillHex: '#10b981', text: 'text-emerald-400', button: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30' },
    amber: { primary: '#f59e0b', stroke: 'border-amber-500/20', bg: 'bg-amber-950/10', glow: 'shadow-amber-500/20', fillHex: '#f59e0b', text: 'text-amber-400', button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30' },
    white: { primary: '#ffffff', stroke: 'border-white/20', bg: 'bg-zinc-900/60', glow: 'shadow-white/20', fillHex: '#ffffff', text: 'text-white', button: 'bg-zinc-100 hover:bg-white text-black shadow-white/30' }
  };

  if (!isOpen) return null;

  const currentTheme = themeColors[badgeTheme];

  // Structured payload for instant import and quick entry
  const qrPayload = JSON.stringify({
    type: 'polystrukt-profile-import',
    username: profile.username || 'ANONYMOUS_UNIT',
    email: profile.email || 'OFFLINE_UNIT',
    role: profile.role || 'Mechanical Engineer'
  });

  const handleCopySignature = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('profile-qr-element');
    if (!svgElement) return;

    // Clone & set actual pixels for high-res output files
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.setAttribute('width', qrSize.toString());
    svgClone.setAttribute('height', qrSize.toString());
    
    // Add simple inline styles to SVG elements for complete self-containment
    svgClone.setAttribute('style', `background-color: transparent;`);

    const svgString = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `polystrukt_profile_${profile.username || 'cad_operator'}_${badgeTheme}_${qrSize}px.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isProfileEmpty = !profile.username && !profile.email;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 selection:bg-purple-500/30 font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden relative shadow-[0_30px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(168,85,247,0.1)] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/40 text-[10px]">
          <div className="flex items-center gap-3">
             <Sparkles className={`animate-pulse ${currentTheme.text}`} size={20} />
             <h2 className="text-xs font-black text-white tracking-[0.2em] uppercase">OPERATOR ID BADGE GENERATOR</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-all p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 md:p-8 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
          {isProfileEmpty && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[10px] text-amber-300 uppercase tracking-wide leading-relaxed">
              ⚠️ Warning: You haven't filled in your username or email yet! The generated QR contains default placeholder data. We recommend completing the form steps first to encode your authentic registration credentials dynamically.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left side: The Digital Engineering Badge */}
            <div className="space-y-4">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">PERSONAL HARDWARE SIGNATURE</span>
              
              <div className={`relative rounded-2xl border ${currentTheme.stroke} ${currentTheme.bg} p-6 shadow-2xl transition-all duration-300 overflow-hidden flex flex-col gap-5 ${currentTheme.glow} shadow-inner`}>
                
                {/* Visual grid lines decor */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                {/* Badge title banner */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest text-white uppercase">POLYSTRUKT // NET</h4>
                    <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider">GEN_CAD OPERATOR CREDENTIAL</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px] text-zinc-400">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>SECURE</span>
                  </div>
                </div>

                {/* QR code centered block */}
                <div className="flex justify-center relative py-2">
                  <div className="p-4 bg-white rounded-xl relative shadow-xl hover:scale-[1.02] transition-transform duration-300 border border-white/10">
                    <QRCodeSVG
                      id="profile-qr-element"
                      value={qrPayload}
                      size={150}
                      bgColor="#ffffff"
                      fgColor={currentTheme.fillHex}
                      level="H"
                    />
                  </div>
                  
                  {/* Outer corner marks decor */}
                  <div className="absolute top-0 left-6 w-3 h-3 border-t border-l border-zinc-700" />
                  <div className="absolute top-0 right-6 w-3 h-3 border-t border-r border-zinc-700" />
                  <div className="absolute bottom-0 left-6 w-3 h-3 border-b border-l border-zinc-700" />
                  <div className="absolute bottom-0 right-6 w-3 h-3 border-b border-r border-zinc-700" />
                </div>

                {/* Badging operational parameters */}
                <div className="space-y-2.5 text-left pt-2 border-t border-white/5 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[6.5px] font-black text-zinc-650 uppercase tracking-wider block">OPERATOR UNIT (ID)</span>
                      <span className={`text-[10px] font-bold uppercase truncate block text-white`}>
                        {profile.username || 'ANONYMOUS_UNIT'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[6.5px] font-black text-zinc-650 uppercase tracking-wider block">ROLE STATUS</span>
                      <span className={`text-[10px] font-bold uppercase truncate block ${currentTheme.text}`}>
                        {profile.role || 'Mechanical Engineer'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[6.5px] font-black text-zinc-650 uppercase tracking-wider block">ENCODED DOMAIN</span>
                    <span className="text-[8.5px] font-bold uppercase tracking-wider truncate block text-zinc-300">
                      {profile.email || 'DISCONNECTED_MODE'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[7px] text-zinc-605 pt-1">
                    <span>POL_PROTO_X_4802</span>
                    <span>GENERATION TIMESTAMP: 2026-Q2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Options and Exports */}
            <div className="space-y-6 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-3">PERSONALIZATION PALETTE</span>
                  <div className="grid grid-cols-2 gap-2 text-[9px] uppercase tracking-widest font-bold">
                    <button
                      type="button"
                      onClick={() => setBadgeTheme('purple')}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        badgeTheme === 'purple' ? 'border-purple-500 bg-purple-950/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]' : 'border-white/5 bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                      Purple Core
                    </button>
                    <button
                      type="button"
                      onClick={() => setBadgeTheme('emerald')}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        badgeTheme === 'emerald' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]' : 'border-white/5 bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Grid Emerald
                    </button>
                    <button
                      type="button"
                      onClick={() => setBadgeTheme('amber')}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        badgeTheme === 'amber' ? 'border-amber-500 bg-amber-950/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : 'border-white/5 bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      Solar Amber
                    </button>
                    <button
                      type="button"
                      onClick={() => setBadgeTheme('white')}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        badgeTheme === 'white' ? 'border-white bg-white/5 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]' : 'border-white/5 bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-white inline-block border border-white/20" />
                      Monolith
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-3">VECTOR OUTPUT DENSITY</span>
                  <div className="grid grid-cols-3 gap-2 text-[9px] uppercase tracking-widest font-bold">
                    {[512, 1024, 2048].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setQrSize(size as any)}
                        className={`py-3 rounded-xl border transition-all cursor-pointer text-center ${
                          qrSize === size ? 'border-purple-500 bg-purple-950/20 text-purple-300' : 'border-white/5 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {size}px
                        <span className="block text-[6.5px] text-zinc-650 mt-1 uppercase">
                          {size === 2048 ? 'Print Quality' : size === 1024 ? 'High-Res' : 'Standard Web'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons list */}
              <div className="space-y-3 pt-6 md:pt-0">
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl text-white text-[9.5px] font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-98 ${currentTheme.button}`}
                >
                  <Download size={13} />
                  Download High-Res Vector SVG
                </button>

                <button
                  type="button"
                  onClick={handleCopySignature}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-white/15 text-zinc-300 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-98"
                >
                  {copied ? (
                    <>
                      <Check className="text-emerald-400 animate-bounce" size={13} />
                      <span className="text-emerald-400">Signature Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy Encoded JSON Packet
                    </>
                  )}
                </button>

                <p className="text-[8px] leading-relaxed text-zinc-600 uppercase tracking-wider text-center max-w-xs mx-auto">
                  Generates an uncompressed high-fidelity vector source. Other local units can scan this code to load your details instantly.
                </p>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- NEW LINKEDIN IMPORT MODAL ---
interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileImport: (data: { 
    username: string; 
    role: string; 
    email: string;
    skills: string[];
    certifications: string[];
  }) => void;
}

const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({ isOpen, onClose, onProfileImport }) => {
  const [connectStep, setConnectStep] = useState<'idle' | 'authorizing' | 'resolved' | 'expired'>('idle');
  const [statusText, setStatusText] = useState('Awaiting Secure Handshake Initialization...');
  const [authProgress, setAuthProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (connectStep !== 'resolved') return;

    setTimeLeft(120);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setConnectStep('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [connectStep]);

  const mockProfiles = [
    {
      id: 'elena_rostova',
      username: 'elena_top_opt',
      name: 'Elena Rostova',
      role: 'Topology Optimization Specialist',
      email: 'elena.rostova@generative-cad.org',
      connections: '1,240 contacts',
      avatarLetters: 'ER',
      headline: 'Structural Analyst & Topology Specialist @ Polystrukt Lab | Post-grad CFD Systems',
      skills: ['Topology Optimization', 'Generative Design', 'FEA (Finite Element Analysis)', 'CFD', 'Additive Manufacturing'],
      certifications: ['Certified Professional Reverse Engineer', 'Advanced Siemens NX Design', 'Autodesk Generative Design Accreditation']
    },
    {
      id: 'marcus_vance',
      username: 'marcus_vance',
      name: 'Marcus Vance',
      role: 'Additive Manufacturing Lead',
      email: 'marcus.vance@linkedin-engineering.com',
      connections: '512 contacts',
      avatarLetters: 'MV',
      headline: 'Additive Manufacturing Lead @ SpaceTech | Topology Design & 3D Materials Integration',
      skills: ['Additive Manufacturing', '3D Printing Integration', 'Material Science', 'DFAM (Design for Additive Manufacturing)'],
      certifications: ['SME Additive Manufacturing Master Class', 'ASTM F42 Metallic Powder Bed Fusion Certified']
    },
    {
      id: 'sarah_sterling',
      username: 'sterling_aero',
      name: 'Sarah Sterling',
      role: 'Aerospace Systems Architect',
      email: 's.sterling@space-vanguard.net',
      connections: '3,800 contacts',
      avatarLetters: 'SS',
      headline: 'Aerospace Systems Architect | Hypersonic Volute Design & Finite Element Modeling',
      skills: ['Aerospace Systems', 'System Architecture', 'Hypersonic Design', 'Finite Element Modeling', 'OpenFOAM'],
      certifications: ['EASA Part-21 Design Organization Approval', 'NASA Systems Engineering Certification']
    }
  ];

  const [selectedProfileId, setSelectedProfileId] = useState('elena_rostova');
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  const selectedProfile = mockProfiles.find(p => p.id === selectedProfileId) || mockProfiles[0];

  const triggerAuthSimulation = async () => {
    setConnectStep('authorizing');
    setAuthProgress(10);
    setStatusText('INITIATING TLS HANDSHAKE & SECURING SECRETS...');
    await new Promise(resolve => setTimeout(resolve, 600));

    setAuthProgress(40);
    setStatusText('RESOLVING OAUTH2 CLIENT [urn:li:developer:polystrukt]...');
    await new Promise(resolve => setTimeout(resolve, 550));

    setAuthProgress(70);
    setStatusText('ACQUIRING PROFILE SCOPES [r_liteprofile, r_emailaddress, r_profile_skills, r_profile_certifications]...');
    await new Promise(resolve => setTimeout(resolve, 600));

    setAuthProgress(95);
    setStatusText('STREAMING RESOURCE DATAFRAMES INTO CAD PIPELINE...');
    await new Promise(resolve => setTimeout(resolve, 450));

    setAuthProgress(100);
    setConnectStep('resolved');
  };

  const currentPayloadJSON = JSON.stringify({
    "urn:li:person": selectedProfile.id,
    "firstName": selectedProfile.name.split(' ')[0],
    "lastName": selectedProfile.name.split(' ')[1],
    "vanityName": selectedProfile.username,
    "role_assignment": selectedProfile.role,
    "email": selectedProfile.email,
    "headline": selectedProfile.headline,
    "skills": selectedProfile.skills,
    "certifications": selectedProfile.certifications,
    "scope": ["r_liteprofile", "r_emailaddress", "r_profile_skills", "r_profile_certifications"],
    "status": "synchronized_oauth2_stream",
    "verification_token": "token_li_" + Math.random().toString(36).substring(2, 10)
  }, null, 2);

  const handleConfirmImport = () => {
    onProfileImport({
      username: selectedProfile.username,
      role: selectedProfile.role,
      email: selectedProfile.email,
      skills: selectedProfile.skills,
      certifications: selectedProfile.certifications
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 selection:bg-blue-500/30 font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden relative shadow-[0_30px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(14,165,233,0.1)] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/40 text-[10px]">
          <div className="flex items-center gap-3">
             <Linkedin className="text-blue-500 animate-pulse" size={20} />
             <h2 className="text-xs font-black text-white tracking-[0.2em] uppercase">LINKEDIN PROFESSIONAL IMPORT ROUTER</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-all p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
          {connectStep === 'idle' && (
            <div className="text-center py-8 space-y-6 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center relative shadow-[0_0_25px_rgba(59,130,246,0.15)]">
                <Linkedin size={40} className="text-blue-400" />
                <div className="absolute inset-0 border border-blue-450 rounded-3xl animate-ping opacity-25" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Connect to LinkedIn API</h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider">
                  Polystrukt parses role definitions and username attributes straight from your verified professional profile to coordinate CAD design experience.
                </p>
              </div>

              <div className="w-full max-w-sm bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-[9px] text-zinc-400 text-left space-y-1">
                <span className="font-bold text-zinc-350 block border-b border-white/5 pb-1">REQUESTED OAUTH SCOPES:</span>
                <span className="block text-blue-400">• r_liteprofile (Username, Headline)</span>
                <span className="block text-blue-400">• r_emailaddress (Verified Email ID)</span>
                <span className="block text-blue-400">• r_profile_skills (Endorsed Skills Metadata)</span>
                <span className="block text-blue-400">• r_profile_certifications (Accredited Professional Certifications)</span>
              </div>

              <button
                onClick={triggerAuthSimulation}
                className="w-full max-w-xs py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(59,130,246,0.25)] flex items-center justify-center gap-3 cursor-pointer"
              >
                <Linkedin size={14} />
                Connect & Synchronize
              </button>
            </div>
          )}

          {connectStep === 'authorizing' && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
                <Linkedin size={18} className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                <p className="text-xs font-black text-white tracking-[0.2em] uppercase">{statusText}</p>
                <p className="text-[9px] text-zinc-500 tracking-wider">SECURE SHAKE ON CLOUD TUNNEL PORT: 443...</p>
              </div>
              <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${authProgress}%` }} />
              </div>
            </div>
          )}

          {connectStep === 'resolved' && (
            <div className="space-y-6">
              {/* Informative Alert Banner with Countdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-[9.5px]">
                <div className="flex items-center gap-3 text-emerald-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>OAUTH MUTUAL HANDSHAKE RESOLVED // INTEGRITY STABLE</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-[9px] bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto shrink-0 tracking-widest">
                  <Clock size={11} className={`${timeLeft <= 20 ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`} />
                  <span className="text-zinc-500">EXPIRES IN:</span>
                  <span className={`font-black font-mono select-all ${timeLeft <= 20 ? 'text-red-400 animate-pulse font-extrabold' : 'text-blue-400'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Flex columns for profile cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profiles Selector Pane */}
                <div className="space-y-3">
                  <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block">IDENTIFIED PROFILE TARGETS</span>
                  <div className="space-y-2.5">
                    {mockProfiles.map((p) => {
                      const isSelected = p.id === selectedProfileId;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProfileId(p.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-950/15 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-blue-300 font-bold' 
                              : 'border-white/5 bg-zinc-950 text-zinc-450 hover:text-white hover:border-white/10'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-xs ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {p.avatarLetters}
                          </div>
                          <div className="truncate space-y-1">
                            <span className="block text-[11px] font-black text-white uppercase tracking-wider">{p.name}</span>
                            <span className="block text-[9px] text-zinc-500 uppercase leading-none truncate">{p.role}</span>
                            <span className="block text-[8px] font-mono text-zinc-650 tracking-wider truncate mt-1">{p.email}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Verification card with Dynamic Visuals */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest">METADATA INSPECTION</span>
                    
                    {/* View mode toggle */}
                    <div className="flex gap-1.5 p-1 bg-zinc-900 border border-white/5 rounded-lg select-none text-[8px] font-bold">
                      <button 
                        onClick={() => setViewMode('visual')}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${viewMode === 'visual' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                      >
                        PREVIEW
                      </button>
                      <button 
                        onClick={() => setViewMode('json')}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${viewMode === 'json' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                      >
                        JSON
                      </button>
                    </div>
                  </div>

                  <div className="min-h-[220px] bg-zinc-900/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                    {/* Grid overlay décor */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563eb10_0%,transparent_70%)] pointer-events-none" />
                    
                    <AnimatePresence mode="wait">
                      {viewMode === 'visual' ? (
                        <motion.div
                          key="visual-card"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="space-y-4 relative z-10 text-left h-full flex flex-col justify-between text-zinc-400"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-[7.5px] font-black text-blue-400 tracking-wider">LINKEDIN INC // VERIFIED PROFILE</span>
                              <span className="text-[8px] font-mono text-zinc-650 uppercase">{selectedProfile.connections}</span>
                            </div>
                            
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">{selectedProfile.name}</h4>
                            <p className="text-[9.5px] text-zinc-400 leading-relaxed uppercase">{selectedProfile.headline}</p>
                          </div>

                          <div className="space-y-2 bg-black/40 border border-white/5 p-3 rounded-xl font-mono text-[8.5px]">
                            <div><span className="text-zinc-600 select-none">BND_USERNAME:</span> <span className="text-zinc-200 font-bold">@{selectedProfile.username}</span></div>
                            <div><span className="text-zinc-600 select-none">BND_ROLE:    </span> <span className="text-zinc-200 font-bold">{selectedProfile.role}</span></div>
                            
                            <div className="border-t border-white/5 my-1.5 pt-1.5">
                              <span className="text-blue-400 text-[8px] font-black tracking-wider block uppercase mb-1">IM_METADATA_SKILLS</span>
                              <div className="flex flex-wrap gap-1">
                                {selectedProfile.skills.map((skill, index) => (
                                  <span key={index} className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[7.5px] text-blue-405 font-mono">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-white/5 pt-1.5">
                              <span className="text-purple-400 text-[8px] font-black tracking-wider block uppercase mb-1">IM_METADATA_CERTIFICATIONS</span>
                              <ul className="list-disc pl-3 text-zinc-400 text-[7.5px] space-y-0.5 leading-relaxed">
                                {selectedProfile.certifications.map((cert, index) => (
                                  <li key={index}>{cert}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="json-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full relative z-10 text-left"
                        >
                          <textarea
                            readOnly
                            value={currentPayloadJSON}
                            className="w-full h-44 bg-transparent text-emerald-400 font-mono text-[7.5px] leading-relaxed select-all resize-none focus:outline-none custom-scrollbar uppercase"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* Confirm / Commit parameters to CAD page */}
              <div className="space-y-3 pt-4 border-t border-white/5 flex gap-4 select-none">
                <button
                  type="button"
                  onClick={() => setConnectStep('idle')}
                  className="px-6 py-4 rounded-xl bg-zinc-900 border border-white/5 text-zinc-550 hover:text-white hover:border-white/10 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Change Profile API Feed
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-[0_4px_24px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Check size={13} strokeWidth={2.5} /> Bind LinkedIn Profile Parameters
                </button>
              </div>
            </div>
          )}

          {connectStep === 'expired' && (
            <div className="text-center py-8 space-y-6 flex flex-col items-center animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center relative shadow-[0_0_25px_rgba(239,68,68,0.15)] animate-bounce" style={{ animationDuration: '3s' }}>
                <AlertTriangle size={40} className="text-red-400" />
                <div className="absolute inset-0 border border-red-500/30 rounded-3xl animate-ping opacity-25" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-sm font-black text-white uppercase tracking-widest text-red-500">OAUTH2 Session Expired</h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider">
                  Your secure professional OAUTH2 handshake credentials have expired. For security and privacy compliance, LinkedIn synchronization tokens remain valid for exactly 120 seconds.
                </p>
              </div>

              <div className="w-full flex justify-center gap-4 max-w-sm">
                <button
                  type="button"
                  onClick={() => setConnectStep('idle')}
                  className="flex-1 py-4 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Back to Hub
                </button>
                <button
                  onClick={triggerAuthSimulation}
                  className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(59,130,246,0.25)] flex items-center justify-center gap-3 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  Re-Sync
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSignUp,
  onGoogleSignUp,
  onBack,
  isLoading,
  error
}) => {
  const [step, setStep] = useState(0);
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState(false);
  const [isProfileQROpen, setIsProfileQROpen] = useState(false);
  const [isLinkedInImportOpen, setIsLinkedInImportOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Mechanical Engineer',
    skills: [] as string[],
    certifications: [] as string[]
  });
  const [persistentSession, setPersistentSession] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('persistent_session');
      return saved !== 'false';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('persistent_session', persistentSession ? 'true' : 'false');
  }, [persistentSession]);

  const nextStep = () => setStep(s => Math.min(s + 1, 2));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleChange = (field: string, value: string) => {
    let sanitized = value;
    if (field === 'username') {
      // Max 30 chars, allow only clean alphanumeric characters & underscores (no spaces/quotes/scripts)
      sanitized = sanitized.slice(0, 30);
      sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
    } else if (field === 'email') {
      // Max 80 chars, remove spaces, HTML brackets, quotes, backslashes, braces, and arrays/brackets
      sanitized = sanitized.slice(0, 80);
      sanitized = sanitized.replace(/[\s<>"'`\\/\[\](){}]/g, '');
    } else if (field === 'password') {
      // Max 128 chars, strip HTML tags/XSS opening/closing hooks
      sanitized = sanitized.slice(0, 128);
      sanitized = sanitized.replace(/[<>]/g, '');
    } else if (field === 'role') {
      sanitized = sanitized.slice(0, 100);
    }
    setFormData(prev => ({ ...prev, [field]: sanitized }));
  };

  const getPasswordStrengthDetails = (password: string) => {
    const checks = {
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
      casing: /[a-z]/.test(password) && /[A-Z]/.test(password),
    };

    const metCount = Object.values(checks).filter(Boolean).length;
    
    let strengthLabel = 'UNSTABLE';
    let strengthColor = 'text-red-500';
    let progressColor = 'bg-red-500';
    let barCount = 1;

    if (password.length === 0) {
      strengthLabel = 'EMPTY';
      strengthColor = 'text-zinc-600';
      progressColor = 'bg-zinc-800';
      barCount = 0;
    } else if (metCount <= 1) {
      strengthLabel = 'WEAK ENCRYPTION';
      strengthColor = 'text-red-400';
      progressColor = 'bg-red-500';
      barCount = 1;
    } else if (metCount <= 3) {
      strengthLabel = 'MODERATE STRENGTH';
      strengthColor = 'text-amber-400';
      progressColor = 'bg-amber-500';
      barCount = 2;
    } else {
      strengthLabel = 'SECURE CIPHER';
      strengthColor = 'text-emerald-400';
      progressColor = 'bg-emerald-500';
      barCount = 3;
    }

    return { checks, metCount, strengthLabel, strengthColor, progressColor, barCount };
  };

  const strengthDetails = getPasswordStrengthDetails(formData.password);

  const getUsernameValidation = (username: string) => {
    if (username.length === 0) return { isValid: true, message: '' };
    if (username.length < 3) return { isValid: false, message: 'Minimum 3 characters required' };
    if (/\s/.test(username)) return { isValid: false, message: 'Spaces are not allowed' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { isValid: false, message: 'Only letters, numbers, and underscores allowed' };
    return { isValid: true, message: '' };
  };

  const getEmailValidation = (email: string) => {
    if (email.length === 0) return { isValid: true, message: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (/\s/.test(email)) return { isValid: false, message: 'Spaces are not allowed in email' };
    if (!email.includes('@')) return { isValid: false, message: 'Missing "@" symbol' };
    if (!emailRegex.test(email)) return { isValid: false, message: 'Enter a valid email format (e.g. name@domain.com)' };
    return { isValid: true, message: '' };
  };

  const getPasswordValidation = (password: string) => {
    if (password.length === 0) return { isValid: true, message: '' };
    if (password.length < 8) return { isValid: false, message: 'Minimum 8 characters required' };
    return { isValid: true, message: '' };
  };

  const usernameVal = getUsernameValidation(formData.username);
  const emailVal = getEmailValidation(formData.email);
  const passwordVal = getPasswordValidation(formData.password);

  const isStepValid = () => {
    if (step === 0) return formData.username.length >= 3 && usernameVal.isValid;
    if (step === 1) return emailVal.isValid && formData.email.length > 0;
    if (step === 2) return passwordVal.isValid && formData.password.length > 0;
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid()) {
      if (step < 2) {
        nextStep();
      } else {
        const form = e.currentTarget as HTMLFormElement;
        onSignUp({
          preventDefault: () => {},
          currentTarget: form
        } as any);
      }
    } else {
      window.dispatchEvent(new CustomEvent('validation-failed'));
    }
  };

  return (
    <div className="RegisterPage min-h-screen relative flex items-center justify-center p-6 bg-black overflow-hidden selection:bg-purple-500/30">
      <TechnicalBackground />
      
      {/* Structural Accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-l border-t border-white/5 m-8 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-r border-b border-white/5 m-8 pointer-events-none" />

      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-4 text-zinc-500 hover:text-white transition-all group z-20"
      >
        <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-500/5 bg-zinc-950 transition-all">
          <ArrowRight className="rotate-180" size={18} />
        </div>
        <div className="flex flex-col items-start text-xs font-black uppercase tracking-widest">
           <span>Go Back</span>
        </div>
      </motion.button>

      <div className="w-full max-w-xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-zinc-950 border border-white/10 rounded-[2.5rem] p-12 md:p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
          
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20 font-mono">
            <button
              type="button"
              onClick={() => setIsProfileQROpen(true)}
              className="flex items-center gap-2 px-3 py-2 md:px-3.5 md:py-2.5 rounded-xl bg-zinc-900 border border-white/5 hover:border-purple-500/20 text-zinc-550 hover:text-purple-400 text-[8px] md:text-[8.5px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md select-none group"
              title="Showcase, customize and export high-resolution QR profile badge"
            >
              <QrCode size={11} className="text-zinc-600 group-hover:text-purple-400 group-hover:rotate-12 transition-all" />
              <span>Generate Profile QR</span>
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-8 mb-16">
             <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full" />
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-purple-500/30 flex items-center justify-center relative shadow-inner">
                   <Sparkles className="text-purple-400" size={32} />
                </div>
             </div>
             <div className="text-center space-y-2">
                <h1 className="text-4xl font-black font-unique uppercase tracking-tighter text-white">Create Account</h1>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Join the generative design community</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <input type="hidden" name="skills" value={JSON.stringify(formData.skills || [])} />
            <input type="hidden" name="certifications" value={JSON.stringify(formData.certifications || [])} />
            <div className="relative min-h-[140px]">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <TerminalInput 
                      label="Choose Username" 
                      name="username" 
                      placeholder="Username" 
                      value={formData.username}
                      icon={<User size={18} />}
                      onChange={(v) => handleChange('username', v)}
                      subText="At least 3 characters"
                      isValid={usernameVal.isValid && formData.username.length >= 3}
                      errorMessage={usernameVal.message}
                      maxLength={30}
                      autoComplete="username"
                    />

                    <EngineeringRoleSelector 
                      value={formData.role}
                      onChange={(v) => handleChange('role', v)}
                    />

                    {formData.skills && formData.skills.length > 0 && (
                      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3 font-mono">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-[8.5px] font-black text-blue-400 tracking-wider uppercase">Imported Profile Skills</span>
                          <span className="text-[7.5px] text-zinc-500 font-mono uppercase">{formData.skills.length} skills mapped</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.skills.map((skill, index) => (
                            <div key={index} className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] text-blue-400 font-mono">
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  skills: prev.skills ? prev.skills.filter((_, i) => i !== index) : []
                                }))}
                                className="text-blue-500 hover:text-white transition-colors p-0.5 rounded hover:bg-white/5 cursor-pointer font-bold leading-none text-[10px]"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.certifications && formData.certifications.length > 0 && (
                      <div className="p-5 bg-zinc-900/40 border border-white/5 rounded-2xl space-y-3 font-mono">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-[8.5px] font-black text-purple-400 tracking-wider uppercase">Imported Certifications</span>
                          <span className="text-[7.5px] text-zinc-500 font-mono uppercase">{formData.certifications.length} verified</span>
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {formData.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center justify-between gap-3 px-2.5 py-1.5 bg-purple-500/5 border border-purple-500/15 rounded-lg text-[9px] text-purple-350 font-mono leading-relaxed">
                              <span className="truncate">{cert}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  certifications: prev.certifications ? prev.certifications.filter((_, i) => i !== index) : []
                                }))}
                                className="text-purple-400 hover:text-white transition-colors px-1 rounded hover:bg-white/5 cursor-pointer shrink-0 font-bold"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <TerminalInput 
                      label="Email Address" 
                      name="email" 
                      type="email"
                      placeholder="you@example.com" 
                      value={formData.email}
                      icon={<Mail size={18} />}
                      onChange={(v) => handleChange('email', v)}
                      subText="We'll send your designs here"
                      isValid={emailVal.isValid && formData.email.length > 0}
                      errorMessage={emailVal.message}
                      maxLength={80}
                      autoComplete="email"
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <TerminalInput 
                      label="Set Password" 
                      name="password" 
                      type="password"
                      placeholder="••••••••" 
                      value={formData.password}
                      icon={<Lock size={18} />}
                      onChange={(v) => handleChange('password', v)}
                      subText="Must be 8+ characters"
                      isValid={passwordVal.isValid && formData.password.length > 0}
                      errorMessage={passwordVal.message}
                      maxLength={128}
                      autoComplete="new-password"
                    />

                    {/* Persistent Session Option */}
                    <div className="flex items-center justify-between p-5 bg-zinc-950 border border-white/5 rounded-2xl font-mono relative transition-all hover:border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          Persistent Session
                        </span>
                        {/* Security Disclaimer Info Icon */}
                        <div className="relative group/disclaimer-tooltip flex items-center justify-center">
                          <Shield size={12} className="text-purple-400 hover:text-purple-300 transition-colors cursor-help shrink-0" />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-3 pointer-events-none opacity-0 invisible group-hover/disclaimer-tooltip:opacity-100 group-hover/disclaimer-tooltip:visible transition-all duration-200 translate-y-1 group-hover/disclaimer-tooltip:translate-y-0 bg-zinc-950/98 border border-purple-500/30 text-purple-300 font-mono text-[8px] tracking-wider p-3 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.8)] w-56 z-50 uppercase leading-relaxed">
                            <span className="font-bold text-white block mb-1">SECURITY DISCLAIMER</span>
                            ENABLING PERSISTENCE STORES ENCRYPTED AUTH TOKENS DIRECTLY IN YOUR LOCAL STORAGE. DO NOT USE ON PUBLIC OR SHARED DEVICES.
                          </div>
                        </div>
                      </div>

                      {/* Cyber Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => setPersistentSession(!persistentSession)}
                        className="relative flex items-center h-6 w-11 cursor-pointer rounded-full bg-zinc-900 border border-white/10 transition-all duration-300 overflow-hidden focus:outline-none"
                      >
                        {/* Toggle track gradient/accent */}
                        <motion.div
                          className="absolute inset-0 bg-purple-500/20"
                          initial={false}
                          animate={{ opacity: persistentSession ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                        />
                        {/* Toggle handle */}
                        <motion.div
                          className="relative h-4 w-4 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                          style={{
                            transform: persistentSession ? "translateX(22px)" : "translateX(4px)",
                            backgroundColor: persistentSession ? "var(--color-purple-400, #c084fc)" : "var(--color-zinc-650, #4b5563)"
                          }}
                        />
                      </button>
                    </div>

                    {/* Cyber-Industrial Entropy Testing Panel */}
                    <div className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-4 font-mono transition-all duration-300">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 font-bold uppercase tracking-wider">ENTROPY REAL-TIME DIAGNOSTICS</span>
                        <span className={`font-black uppercase tracking-widest ${strengthDetails.strengthColor}`}>
                          {strengthDetails.strengthLabel}
                        </span>
                      </div>

                      {/* Segmented Strength Bar */}
                      <div className="grid grid-cols-3 gap-1.5 h-1">
                        {[1, 2, 3].map((bar) => (
                          <div 
                            key={bar} 
                            className={`h-full rounded-full transition-all duration-300 ${
                              bar <= strengthDetails.barCount 
                                ? strengthDetails.progressColor 
                                : 'bg-zinc-900/50'
                            }`} 
                          />
                        ))}
                      </div>

                      {/* Complexity Target Parameters */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${strengthDetails.checks.length ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                          <span className={`text-[9px] uppercase tracking-wider font-semibold transition-all duration-300 ${strengthDetails.checks.length ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            Length &gt;= 8 chars
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${strengthDetails.checks.number ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                          <span className={`text-[9px] uppercase tracking-wider font-semibold transition-all duration-300 ${strengthDetails.checks.number ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            Numeric Domain (0-9)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${strengthDetails.checks.symbol ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                          <span className={`text-[9px] uppercase tracking-wider font-semibold transition-all duration-300 ${strengthDetails.checks.symbol ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            Non-Alphanum Symbology
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${strengthDetails.checks.casing ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                          <span className={`text-[9px] uppercase tracking-wider font-semibold transition-all duration-300 ${strengthDetails.checks.casing ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            Mixed casing variant
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {step > 0 && (
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-5 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white hover:border-white/20 transition-all font-bold text-xs uppercase"
                  >
                    Back
                  </button>
                )}
                
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-2xl bg-purple-600 hover:bg-purple-500 p-5 text-white font-black uppercase text-[10px] tracking-[0.4em] transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-4 group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{step === 2 ? 'Finish Registration' : 'Continue'}</span>
                      <ChevronRight className="group-hover:translate-x-2 transition-transform" size={18} />
                    </>
                  )}
                </button>
              </div>

              {/* Progress Section */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                 <TerminalStatus label="Progress" value={`Step ${step + 1} of 3`} />
                 <TerminalStatus label="Connection" value={isLoading ? "Processing..." : "Ready"} color={isLoading ? "text-amber-500" : "text-green-500"} />
              </div>
            </div>
          </form>

          {/* Social / Switch */}
          <div className="mt-16 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Or join with</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                type="button"
                onClick={onGoogleSignUp}
                className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:border-white/10 transition-all text-[9.5px] font-black uppercase tracking-[0.18em]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
                </svg>
                Google SSO
              </button>

              <button 
                type="button"
                onClick={() => setIsMobileSyncOpen(true)}
                className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-zinc-950 border border-white/5 text-zinc-550 hover:text-white hover:border-purple-500/30 transition-all text-[9.5px] font-black uppercase tracking-[0.18em]"
              >
                <QrCode size={16} className="shrink-0 text-purple-500" />
                Mobile Sync
              </button>

              <button 
                type="button"
                onClick={() => setIsLinkedInImportOpen(true)}
                className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-zinc-950 border border-white/5 text-zinc-550 hover:text-white hover:border-blue-500/30 transition-all text-[9.5px] font-black uppercase tracking-[0.18em]"
              >
                <Linkedin size={16} className="shrink-0 text-blue-500" />
                LinkedIn
              </button>
            </div>

            <MobileSyncModal 
              isOpen={isMobileSyncOpen} 
              onClose={() => setIsMobileSyncOpen(false)} 
              onProfileImport={(importedProfile) => {
                setFormData(prev => ({
                  ...prev,
                  username: importedProfile.username,
                  email: importedProfile.email,
                  role: importedProfile.role
                }));
              }}
            />

            <ProfileQRModal 
              isOpen={isProfileQROpen}
              onClose={() => setIsProfileQROpen(false)}
              profile={formData}
            />

            <LinkedInImportModal 
              isOpen={isLinkedInImportOpen}
              onClose={() => setIsLinkedInImportOpen(false)}
              onProfileImport={(importedProfile) => {
                setFormData(prev => ({
                  ...prev,
                  username: importedProfile.username,
                  role: importedProfile.role,
                  email: importedProfile.email || prev.email,
                  skills: importedProfile.skills || [],
                  certifications: importedProfile.certifications || []
                }));
                // Reset step back to Step 0 where username/role can be viewed
                setStep(0);
              }}
            />

            <p className="text-center text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-relaxed">
              By registering, you agree to our <a href="#" onClick={(e) => e.preventDefault()} className="text-purple-500 hover:text-purple-400 transition-colors font-bold underline decoration-purple-500/30 underline-offset-4">Terms of Service</a>
            </p>

            <p className="text-center text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
              Already have an account? <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('switch-auth-mode', { detail: 'signin' }))} className="text-purple-500 hover:text-purple-400 transition-colors ml-1 underline decoration-purple-500/30 underline-offset-4">Sign In</button>
            </p>
          </div>
        </motion.div>

        {/* Floating System Annotations */}
        <div className="absolute -left-32 top-1/4 hidden lg:block space-y-4 opacity-40">
           <div className="flex gap-2 items-center text-[10px] font-mono text-zinc-500">
              <div className="w-1 h-1 bg-purple-500 rounded-full" />
              <span>CORE_ALLOC_STABLE</span>
           </div>
           <div className="h-px w-24 bg-white/5" />
           <p className="text-[8px] font-mono text-zinc-700 leading-relaxed max-w-[100px]">NEURAL_SIGNATURE_GENERATION_PENDING</p>
        </div>
      </div>
    </div>
  );
};

const EngineeringRoleSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const roles = [
    'Mechanical Engineer',
    'Structural Designer',
    'Additive Manufacturing Lead',
    'Topology Optimization Specialist',
    'Aerospace Systems Architect'
  ];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="space-y-4" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Engineering Role</h3>
        <span className="text-[8px] font-mono text-zinc-800 uppercase">Personalizes your experience</span>
      </div>

      <div className="relative">
        {/* Hidden field for standard HTML form serialization */}
        <input type="hidden" name="role" value={value} />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-black border border-white/5 hover:border-white/10 rounded-2xl p-6 pl-16 pr-12 text-white font-mono placeholder:text-zinc-800 focus:outline-none focus:border-purple-500/50 focus:bg-zinc-950/50 transition-all uppercase text-sm tracking-widest relative z-10 flex items-center justify-between cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold">{value}</span>
          </div>
          <ChevronDown
            size={18}
            className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-500' : ''}`}
          />
        </button>

        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-650 z-25 pointer-events-none">
          <Briefcase size={18} />
        </div>

        {/* Subtle glowing ring matching TerminalInput style */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-305 z-0 ${isOpen ? 'ring-1 ring-purple-500/30 bg-zinc-950/50' : 'bg-transparent'}`} />

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 mt-3 bg-zinc-950 border border-purple-500/30 rounded-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.15)] overflow-hidden z-50 divide-y divide-white/[0.03]"
            >
              <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                {roles.map((role) => {
                  const isSelected = role === value;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        onChange(role);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-5 text-left font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-950/40 text-purple-300 font-bold' 
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                      }`}
                    >
                      <span>{role}</span>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TerminalInput = ({ label, name, type = "text", placeholder, value, icon, onChange, subText, isValid, errorMessage, maxLength, autoComplete }: { 
  label: string, 
  name: string, 
  type?: string, 
  placeholder: string, 
  value: string, 
  icon: any, 
  onChange: (v: string) => void,
  subText: string,
  isValid?: boolean,
  errorMessage?: string,
  maxLength?: number,
  autoComplete?: string
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasteToast, setShowPasteToast] = useState(false);
  const [isGeneratedSuccess, setIsGeneratedSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [entropyProgress, setEntropyProgress] = useState(0);
  const pasteToastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const genSuccessTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const genProgressTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const entropyIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const isPassword = name === 'password';
  const checks = isPassword ? {
    length: value.length >= 8,
    number: /\d/.test(value),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value),
    casing: /[a-z]/.test(value) && /[A-Z]/.test(value),
  } : null;

  useEffect(() => {
    const handleValidationFailed = () => {
      if (!isValid) {
        setShakeTrigger(prev => prev + 1);
      }
    };
    window.addEventListener('validation-failed', handleValidationFailed);
    return () => window.removeEventListener('validation-failed', handleValidationFailed);
  }, [isValid]);

  useEffect(() => {
    // Bring focus to the input element once mounted. Since elements are wrapped inside AnimatePresence waiting mode,
    // a small delay ensures focus is applied correctly once the entry animation plays.
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Position cursor at the end of pre-existing text
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      if (pasteToastTimeoutRef.current) {
        clearTimeout(pasteToastTimeoutRef.current);
      }
      if (genSuccessTimeoutRef.current) {
        clearTimeout(genSuccessTimeoutRef.current);
      }
      if (genProgressTimeoutRef.current) {
        clearTimeout(genProgressTimeoutRef.current);
      }
      if (entropyIntervalRef.current) {
        clearInterval(entropyIntervalRef.current);
      }
    };
  }, []);

  const showStatus = value.length > 0 && isValid !== undefined;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const rawValue = e.target.value;
    let sanitized = rawValue;
    // Strip dangerous script tags and content within them
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    // Strip all XML/HTML tag constructs completely
    sanitized = sanitized.replace(/<[^>]+>/g, "");
    // Strip javascript: schemas
    sanitized = sanitized.replace(/javascript\s*:/gi, "");
    // Strip potentially dangerous HTML entities representing tags/scripts/XSS
    sanitized = sanitized.replace(/&lt;script.*?&gt;/gi, "");
    sanitized = sanitized.replace(/&lt;\/script&gt;/gi, "");
    sanitized = sanitized.replace(/&#x3c;script.*?&#x3e;/gi, "");
    
    if (sanitized !== rawValue) {
      onChange(sanitized);
    }

    if (!isValid && rawValue.length > 0) {
      setShakeTrigger(prev => prev + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text') || '';
    
    let sanitized = pastedText;
    
    // Respect maxLength if specified
    if (maxLength) {
      sanitized = sanitized.slice(0, maxLength);
    }
    
    // Strict pattern filtering matching registration specifications
    if (name === 'username') {
      sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
    } else if (name === 'email') {
      sanitized = sanitized.replace(/[\s<>"'`\\/\[\](){}]/g, '');
    } else if (name === 'password') {
      sanitized = sanitized.replace(/[<>]/g, '');
    }
    
    // Strip dangerous script tags, html structures, schemas and entity variants
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    sanitized = sanitized.replace(/<[^>]+>/g, "");
    sanitized = sanitized.replace(/javascript\s*:/gi, "");
    sanitized = sanitized.replace(/&lt;script.*?&gt;/gi, "");
    sanitized = sanitized.replace(/&lt;\/script&gt;/gi, "");
    sanitized = sanitized.replace(/&#x3c;script.*?&#x3e;/gi, "");
    
    const start = inputRef.current?.selectionStart || 0;
    const end = inputRef.current?.selectionEnd || 0;
    const currentVal = value;
    const updatedVal = currentVal.substring(0, start) + sanitized + currentVal.substring(end);
    
    let finalVal = updatedVal;
    if (maxLength) {
      finalVal = finalVal.slice(0, maxLength);
    }
    
    // Propagate the new sanitized value immediately to trigger validation cycle
    onChange(finalVal);
    
    // Toggle temporary 'Paste Detected' overlay with sanitization status
    if (pasteToastTimeoutRef.current) {
      clearTimeout(pasteToastTimeoutRef.current);
    }
    setShowPasteToast(true);
    pasteToastTimeoutRef.current = setTimeout(() => {
      setShowPasteToast(false);
    }, 2500);

    // Trigger immediate validation shake if final value is invalid after pasting
    setTimeout(() => {
      if (!isValid && finalVal.length > 0) {
        setShakeTrigger(prev => prev + 1);
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleGeneratePassword = () => {
    if (isGenerating) return;

    if (genProgressTimeoutRef.current) {
      clearTimeout(genProgressTimeoutRef.current);
    }
    if (entropyIntervalRef.current) {
      clearInterval(entropyIntervalRef.current);
    }
    
    setEntropyProgress(0);
    setIsGenerating(true);

    let currentProgress = 0;
    entropyIntervalRef.current = setInterval(() => {
      currentProgress += 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        if (entropyIntervalRef.current) {
          clearInterval(entropyIntervalRef.current);
        }
      }
      setEntropyProgress(currentProgress);
    }, 20);

    genProgressTimeoutRef.current = setTimeout(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let generated = '';
      const cryptoObj = typeof window !== 'undefined' ? (window.crypto || (window as any).msCrypto) : null;
      if (cryptoObj && cryptoObj.getRandomValues) {
        const array = new Uint32Array(16);
        cryptoObj.getRandomValues(array);
        for (let i = 0; i < 16; i++) {
          generated += chars[array[i] % chars.length];
        }
      } else {
        for (let i = 0; i < 16; i++) {
          generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      onChange(generated);
      // Bring focus back to the input element
      if (inputRef.current) {
        inputRef.current.focus();
      }

      setIsGenerating(false);

      if (genSuccessTimeoutRef.current) {
        clearTimeout(genSuccessTimeoutRef.current);
      }
      setIsGeneratedSuccess(true);
      genSuccessTimeoutRef.current = setTimeout(() => {
        setIsGeneratedSuccess(false);
      }, 1000);
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</h3>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-mono text-zinc-800 uppercase">{subText}</span>
          {name === 'password' && (
            <div className="relative group/gen-tooltip">
              <button
                id="btn-gen-pass"
                type="button"
                disabled={isGenerating}
                onClick={handleGeneratePassword}
                style={{
                  boxShadow: isGenerating
                    ? `0 0 ${12 + (entropyProgress / 100) * 16}px rgba(168, 85, 247, ${0.15 + (entropyProgress / 100) * 0.35})`
                    : undefined
                }}
                className={`text-[9px] font-mono font-black uppercase tracking-[0.15em] flex items-center gap-2 bg-purple-950/30 px-2.5 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(139,92,246,0.1)] ${
                  isGenerating
                    ? 'text-purple-400 bg-purple-950/15 border border-purple-500/30 cursor-not-allowed'
                    : isGeneratedSuccess 
                      ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/40 shadow-[0_0_18px_rgba(16,185,129,0.3)] cursor-pointer' 
                      : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/50 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_18px_rgba(139,92,246,0.2)] cursor-pointer'
                }`}
              >
                {/* Radial Progress Ring enclosing the status representation */}
                <div className="relative w-4.5 h-4.5 flex items-center justify-center shrink-0">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      className="stroke-purple-950/50"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <motion.circle
                      cx="10"
                      cy="10"
                      r="8"
                      className={isGeneratedSuccess ? "stroke-emerald-400" : "stroke-purple-500"}
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 8}
                      animate={{ strokeDashoffset: 2 * Math.PI * 8 * (1 - entropyProgress / 100) }}
                      transition={{ ease: "linear", duration: 0.1 }}
                    />
                  </svg>
                  <div className="relative z-10 flex items-center justify-center">
                    {isGenerating ? (
                      <span className="text-[6px] font-bold text-purple-300 font-mono tracking-tighter leading-none">
                        {Math.round(entropyProgress)}
                      </span>
                    ) : isGeneratedSuccess ? (
                      <Check size={8} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Sparkles size={8} className="text-purple-400 animate-pulse shrink-0" />
                    )}
                  </div>
                </div>

                <span>
                  {isGenerating 
                    ? 'Generating...' 
                    : isGeneratedSuccess 
                      ? 'Password Generated' 
                      : 'Generate Secure Password'}
                </span>
              </button>

              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 invisible group-hover/gen-tooltip:opacity-100 group-hover/gen-tooltip:visible transition-all duration-200 translate-y-1 group-hover/gen-tooltip:translate-y-0 bg-zinc-950/95 border border-purple-500/30 text-purple-300 font-mono text-[8px] tracking-wider px-2.5 py-1.5 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.5)] whitespace-nowrap z-50 uppercase">
                Generates a 16-character alphanumeric key
              </div>
            </div>
          )}
        </div>
      </div>
      <motion.div 
        animate={shakeTrigger ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        onAnimationComplete={() => setShakeTrigger(0)}
        className="relative group"
      >
        <AnimatePresence>
          {name === 'password' && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-full max-w-[340px] bg-zinc-950/98 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.15)] z-30"
            >
              {/* Triangle pointer */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] w-2.5 h-2.5 rotate-45 bg-[#09090b] border-r border-b border-purple-500/30" />
              
              <div className="space-y-4 font-mono">
                <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">COMPLEXITY PROTOCOL</span>
                  <span className={`font-black uppercase tracking-widest ${
                    value.length === 0 ? 'text-zinc-600' :
                    (Object.values(checks || {}).filter(Boolean).length <= 1 ? 'text-red-400' :
                     Object.values(checks || {}).filter(Boolean).length <= 3 ? 'text-amber-400' : 'text-emerald-400')
                  }`}>
                    {value.length === 0 ? 'EMPTY' : 
                     (Object.values(checks || {}).filter(Boolean).length <= 1 ? 'WEAK' :
                      Object.values(checks || {}).filter(Boolean).length <= 3 ? 'MODERATE' : 'SECURE')}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Length */}
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-[9px] uppercase tracking-wider font-semibold transition-colors ${checks?.length ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      Length &gt;= 8 characters
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      checks?.length ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-transparent text-zinc-800 border border-zinc-800'
                    }`}>
                      {checks?.length ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                    </span>
                  </div>

                  {/* Number */}
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-[9px] uppercase tracking-wider font-semibold transition-colors ${checks?.number ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      Numeric Domain (0-9)
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      checks?.number ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-transparent text-zinc-800 border border-zinc-800'
                    }`}>
                      {checks?.number ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                    </span>
                  </div>

                  {/* Symbol */}
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-[9px] uppercase tracking-wider font-semibold transition-colors ${checks?.symbol ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      Non-alphanum symbol
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      checks?.symbol ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-transparent text-zinc-800 border border-zinc-800'
                    }`}>
                      {checks?.symbol ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                    </span>
                  </div>

                  {/* Mixed Case */}
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-[9px] uppercase tracking-wider font-semibold transition-colors ${checks?.casing ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      Mixed casing variant
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      checks?.casing ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-transparent text-zinc-800 border border-zinc-800'
                    }`}>
                      {checks?.casing ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showPasteToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, y: "-50%" }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-16 top-1/2 -translate-y-1/2 bg-purple-950/95 border border-purple-500/40 backdrop-blur-md text-purple-300 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg z-20 flex items-center gap-2 pointer-events-none shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <Shield size={10} className="text-purple-400 shrink-0" />
              <span>PASTE SANITIZED & SECURED</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors">
          {icon}
        </div>
         <input 
          ref={inputRef}
          name={name}
          type={name === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className="w-full bg-black border border-white/5 hover:border-white/10 rounded-2xl p-6 pl-16 pr-28 text-white font-mono placeholder:text-zinc-800 focus:outline-none focus:border-purple-500/50 focus:bg-zinc-950/50 transition-all uppercase text-sm tracking-widest relative z-10"
        />
        {/* Subtle glowing purple ring animation that expands slightly from the border */}
        <motion.div
          initial={false}
          animate={isFocused ? {
            opacity: 1,
            scale: 1.015,
            borderColor: "rgba(168, 85, 247, 0.4)",
            boxShadow: "0 0 20px rgba(168, 85, 247, 0.35)",
          } : {
            opacity: 0,
            scale: 1.0,
            borderColor: "rgba(168, 85, 247, 0)",
            boxShadow: "0 0 0px rgba(168, 85, 247, 0)",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 border rounded-2xl pointer-events-none z-0"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
          {name === 'password' && (() => {
            const passedChecks = checks ? Object.values(checks).filter(Boolean).length : 0;
            const percentage = value.length > 0 ? (passedChecks / 4) * 100 : 0;
            return (
              <>
                {/* Radial Password Strength Meter */}
                <div className="relative group/strength-tooltip flex items-center justify-center shrink-0 w-6 h-6 z-10">
                  <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      className="stroke-zinc-800"
                      strokeWidth="2"
                      fill="none"
                    />
                    <motion.circle
                      cx="10"
                      cy="10"
                      r="7"
                      className={
                        value.length === 0 ? "stroke-zinc-850" :
                        passedChecks === 1 ? "stroke-red-500" :
                        passedChecks <= 3 ? "stroke-amber-500" : "stroke-emerald-400"
                      }
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 7}
                      animate={{ strokeDashoffset: 2 * Math.PI * 7 * (1 - percentage / 100) }}
                      transition={{ ease: "easeInOut", duration: 0.3 }}
                    />
                  </svg>
                  {/* Glowing core representing dynamic complexity intensity */}
                  {value.length > 0 && (
                    <div className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      passedChecks === 1 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" :
                      passedChecks <= 3 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    }`} />
                  )}
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full right-0 mb-2.5 pointer-events-none opacity-0 invisible group-hover/strength-tooltip:opacity-100 group-hover/strength-tooltip:visible transition-all duration-200 translate-y-1 group-hover/strength-tooltip:translate-y-0 bg-zinc-950/98 border border-purple-500/30 text-purple-300 font-mono text-[8px] tracking-wider p-3 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.8)] z-50 uppercase leading-relaxed w-52">
                    <span className="font-bold text-white block mb-1">STRENGTH PROTOCOL</span>
                    COMPLEXITY: <span className={
                      value.length === 0 ? "text-zinc-500" :
                      passedChecks === 1 ? "text-red-400" :
                      passedChecks <= 3 ? "text-amber-400" : "text-emerald-400 font-bold font-black"
                    }>
                      {value.length === 0 ? "EMPTY" :
                       passedChecks === 1 ? "WEAK" :
                       passedChecks <= 3 ? "MODERATE" : "SECURE"}
                    </span>
                    <span className="text-zinc-500 block mt-1">({passedChecks} OF 4 PROTOCOLS MET)</span>
                  </div>
                </div>

                <button
                  id="btn-toggle-password-visibility"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-600 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 cursor-pointer flex items-center justify-center border border-transparent hover:border-white/5 active:scale-95 transition-all text-zinc-400"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} className="shrink-0" /> : <Eye size={16} className="shrink-0" />}
                </button>
              </>
            );
          })()}
          <AnimatePresence>
            {value.length > 0 && (
              <motion.button
                id={`btn-clear-${name}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                type="button"
                onClick={() => {
                  onChange('');
                  inputRef.current?.focus();
                }}
                className="text-zinc-600 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 cursor-pointer flex items-center justify-center border border-transparent hover:border-white/5"
                title="Clear input"
              >
                <X size={12} className="shrink-0" />
              </motion.button>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showStatus && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center pointer-events-none shrink-0"
              >
                {isValid ? (
                  <Check className="text-emerald-500 h-5 w-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                ) : (
                  <AlertCircle className="text-red-500 h-5 w-5 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <AnimatePresence>
        {value.length > 0 && !isValid && errorMessage && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            className="text-[9px] font-mono text-red-500 uppercase font-black tracking-widest flex items-center gap-1.5 mt-2"
          >
            <AlertCircle size={12} className="shrink-0" />
            <span>{errorMessage}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

