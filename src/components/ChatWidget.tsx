import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, X, Send, Bot, Sparkles, Terminal, ArrowRight, AlertCircle, 
  RefreshCcw, Save, FolderOpen, Paperclip, Trash2, FileText, 
  Image as ImageIcon, ChevronDown, Activity, Play, Upload, 
  Check, Cloud, BarChart3, TrendingUp, Wind, Maximize, 
  Minimize, Grid3X3, BarChart2, Zap, Settings, Shield, File, Search, Eye,
  FileSearch, Info, FilePlus, History, Database, Loader2, Link as LinkIcon,
  Box as BoxIcon
} from 'lucide-react';
import { getTechnicalResponse, TechnicalAIResponse } from '../services/geminiService';
import { ChatMessage, SavedSession, Attachment } from '../types';
import { SimulationPreview } from './SimulationPreview';
import { InspectableModel } from './InspectableModel';

const STORAGE_KEY = 'polystrukt_saved_sessions';

const TypewriterLabel = ({ text, delay = 0, speed = 35, className = "" }: { text: string, delay?: number, speed?: number, className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    setDisplayedText(''); setStarted(false); setCompleted(false);
    const startTimeout = setTimeout(() => {
      setStarted(true);
      let i = 0;
      const interval = setInterval(() => {
        if (i <= text.length) { setDisplayedText(text.slice(0, i)); i++; }
        else { clearInterval(interval); setCompleted(true); }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [text, delay, speed]);
  
  return (
    <span className={`inline-flex items-center min-h-[1.25rem] ${className}`}>
      <span className="font-mono text-[11px] font-bold tracking-tight uppercase leading-none">{displayedText}</span>
      {(!completed && started) && <span className="w-1.5 h-3 bg-current ml-1 animate-pulse" />}
    </span>
  );
};

const SUGGESTION_POOL = [
  "Generate helical gear assembly", "Analyze structural stress", "Optimize for 3D printing", "Export design to STEP", "Calculate thermal expansion", "Design hydraulic piston", "Simulate aerodynamic flow", "Create voronoi lattice structure"
];

const extractMetrics = (text: string) => {
  if (!text) return [];
  const regex = /(\d+(?:\.\d+)?)\s*(mm|cm|m|km|in|ft|kg|g|lbs|N|kN|Pa|MPa|GPa|°C|°F|%|rpm|Hz|V|A|W)/gi;
  const matches = [...text.matchAll(regex)];
  const unique = new Map();
  matches.forEach(m => { if (!unique.has(m[0])) unique.set(m[0], { value: m[1], unit: m[2], full: m[0] }); });
  return Array.from(unique.values());
};

const shuffleArray = <T,>(array: T[]): T[] => {
  if (!array) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const HeatmapView = ({ type, baseValue, unit }: { type: 'stress' | 'thermal' | 'flow', baseValue: number, unit: string }) => {
   const cells = useMemo(() => Array.from({ length: 32 }).map((_, i) => ({ id: i, intensity: Math.random(), value: baseValue * Math.random() })), [baseValue]);
   const getColors = (intensity: number) => {
       if (type === 'stress') return `rgba(239, 68, 68, ${0.4 + intensity * 0.6})`;
       if (type === 'thermal') return `rgba(249, 115, 22, ${0.2 + intensity * 0.8})`;
       return `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`; 
   };
   return (
       <div className="grid grid-cols-8 grid-rows-4 gap-1 w-full h-24 mt-2">
           {cells.map(cell => <div key={cell.id} className="rounded-[2px] border border-white/10" style={{ backgroundColor: getColors(cell.intensity) }} />)}
       </div>
   );
};

const SimulationMetricsChart = ({ type, text }: { type: 'stress' | 'thermal' | 'flow' | 'none' | undefined, text: string }) => {
  const metrics = useMemo(() => extractMetrics(text), [text]);
  if (!metrics || metrics.length === 0) return null;
  const primaryMetric = metrics[0] || { value: '100', unit: type === 'stress' ? 'MPa' : '°C' };
  const baseValue = parseFloat(primaryMetric.value);
  const unit = primaryMetric.unit;
  
  if (!type || type === 'none') return null;

  const styles = type === 'stress' ? { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: Activity, label: 'Stress' } : type === 'thermal' ? { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', icon: TrendingUp, label: 'Thermal' } : { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: Wind, label: 'Flow' };
  const Icon = styles.icon;
  
  return (
    <div className={`mt-4 p-4 rounded-xl border ${styles.border} ${styles.bg}`}>
      <div className="flex items-center gap-2 mb-4">
         <Icon size={14} className={styles.text} /><span className={`text-xs font-bold uppercase ${styles.text}`}>{styles.label}</span>
      </div>
      <HeatmapView type={type as 'stress' | 'thermal' | 'flow'} baseValue={baseValue} unit={unit} />
    </div>
  );
};

const FormattedMessage = ({ text }: { text: string }) => {
  if (!text) return null;
  const metrics = extractMetrics(text);
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        return <p key={i} className="text-zinc-600 leading-relaxed text-sm">{parts.map((p, idx) => p.startsWith('**') ? <strong key={idx} className="text-zinc-900">{p.slice(2,-2)}</strong> : p)}</p>;
      })}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {metrics.slice(0, 4).map((m, i) => (
          <div key={i} className="bg-zinc-50 border border-zinc-200 m-2 rounded-lg flex flex-col items-center">
            <span className="text-lg font-bold font-mono">{m.value}</span>
            <span className="text-[10px] text-zinc-400 uppercase">{m.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ModelContainer = ({ simulationType, modelUrl, autoLoad = false, focusPart }: { simulationType?: 'stress' | 'thermal' | 'flow' | 'none', modelUrl?: string, autoLoad?: boolean, focusPart?: string }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(autoLoad);
    const [isInView, setIsInView] = useState(true);
    const [forceResume, setForceResume] = useState(false); 
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    setForceResume(false); 
                } else {
                    setIsInView(false);
                }
            },
            { threshold: 0.05 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isFullscreen]);

    const handleResumeClick = () => {
        if (!isLoaded) {
            setIsLoaded(true);
        } else {
            setForceResume(true); 
        }
    };

    const active = isLoaded && (isInView || forceResume);

    const content = (
        <motion.div 
            ref={containerRef}
            layout 
            className={`${isFullscreen ? 'fixed inset-0 z-[100] bg-zinc-100' : 'w-full h-[320px] rounded-2xl overflow-hidden border border-zinc-200 relative bg-zinc-50 shadow-inner'}`}
        >
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  <button 
                      data-testid="inspect-fullscreen-toggle"
                      onClick={() => setIsFullscreen(!isFullscreen)} 
                      className={`absolute z-30 flex items-center gap-2 transition-all group ${
                          isFullscreen 
                          ? 'top-8 right-8 bg-zinc-900 text-white pl-4 pr-5 py-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-zinc-800' 
                          : 'top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm'
                      }`}
                  >
                      {isFullscreen ? (
                          <>
                              <Minimize size={18} className="group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-black font-unique tracking-widest uppercase">Exit Inspector</span>
                          </>
                      ) : (
                          <Maximize size={16} className="group-hover:scale-110 transition-transform" />
                      )}
                  </button>
                  <InspectableModel isFullscreen={isFullscreen} simulationMode={simulationType} modelUrl={modelUrl} focusPart={focusPart} />
                  
                  {isFullscreen && (
                      <div className="absolute bottom-8 left-8 z-30 pointer-events-none">
                          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest bg-white/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/60">Press ESC to Exit</span>
                      </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
                >
                  <div className="relative mb-6">
                    <BoxIcon size={64} className="text-zinc-200" />
                    <motion.div 
                      className="absolute inset-x-0 h-px bg-purple-500/30"
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <div className="text-center space-y-4 max-w-[200px]">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 font-unique">
                        {!isInView && isLoaded ? 'Hibernating' : 'Inspector Ready'}
                    </h4>
                    <p className="text-[9px] text-zinc-400 font-mono leading-relaxed">
                        {!isInView && isLoaded
                            ? 'Canvas context released to save GPU memory.' 
                            : 'Initialize WebGL for structural inspection.'}
                    </p>
                    <button 
                      data-testid="inspect-resume-btn"
                      onClick={handleResumeClick}
                      className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 font-unique"
                    >
                      <Zap size={10} />
                      {isLoaded ? 'Resume Viewing' : 'Launch Inspector'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>
    );
    return isFullscreen ? createPortal(content, document.body) : content;
};

const MessageBubble: React.FC<{ msg: ChatMessage, index: number, onRetry: () => void, isLast: boolean }> = ({ msg, index, onRetry, isLast }) => {
  return (
    <motion.div 
      data-testid={`chat-message-${msg.role}`}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
    >
      <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-zinc-900 text-white rounded-tr-sm' : 'bg-white border border-zinc-100 text-zinc-800 rounded-tl-sm'}`}>
        {msg.role === 'model' && <div className="mb-2 text-[10px] text-purple-600 font-mono uppercase border-b border-zinc-50 pb-2 flex items-center gap-1"><Bot size={10} /> Technical Synthesis</div>}
        
        {msg.attachment && (
            <div data-testid="chat-attachment-preview" className="mb-3 p-2 bg-zinc-100/50 rounded-lg flex items-center gap-3 border border-zinc-200/50">
                <div className="bg-white p-2 rounded-md shadow-sm text-zinc-500">
                    {msg.attachment.mimeType.includes('image') ? <ImageIcon size={14} /> : <FileText size={14} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono truncate max-w-[120px]">{msg.attachment.name}</span>
                  <span className="text-[8px] text-zinc-400 uppercase tracking-tighter">Constraint Ref</span>
                </div>
            </div>
        )}

        {msg.role === 'model' ? <FormattedMessage text={msg.text} /> : <div className="whitespace-pre-wrap">{msg.text}</div>}
        
        {msg.role === 'model' && (msg as any).sources?.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-50 flex flex-wrap gap-2">
            {(msg as any).sources.map((s: any, idx: number) => (
              <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[9px] text-zinc-500 hover:bg-zinc-100 transition-colors truncate max-w-[150px]">
                <LinkIcon size={10} />
                {s.title || "Research Source"}
              </a>
            ))}
          </div>
        )}

        {msg.simulationType && msg.simulationType !== 'none' && <SimulationMetricsChart type={msg.simulationType} text={msg.text} />}
        {msg.has3DModel && <div className="mt-3"><ModelContainer simulationType={msg.simulationType} modelUrl={msg.modelUrl} autoLoad={isLast} focusPart={msg.focusPart} /></div>}
        <div className="mt-2 text-[10px] font-mono opacity-40">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </motion.div>
  );
};

const SuggestionButton: React.FC<{ text: string, onClick: (s: string) => void | Promise<void>, index: number }> = ({ text, onClick, index }) => {
  const themes = [
    { bg: "bg-blue-50/50", border: "border-blue-200/50", text: "text-blue-700", icon: <BarChart2 size={14} />, hover: "hover:bg-blue-100 hover:border-blue-300" },
    { bg: "bg-amber-50/50", border: "border-amber-200/50", text: "text-amber-700", icon: <Settings size={14} />, hover: "hover:bg-amber-100 hover:border-amber-300" },
    { bg: "bg-emerald-50/50", border: "border-emerald-200/50", text: "text-emerald-700", icon: <Shield size={14} />, hover: "hover:bg-emerald-100 hover:border-emerald-300" },
    { bg: "bg-purple-50/50", border: "border-purple-200/50", text: "text-purple-700", icon: <Grid3X3 size={14} />, hover: "hover:bg-purple-100 hover:border-purple-300" }
  ];
  const theme = themes[index % themes.length];
  
  return (
    <motion.button 
      data-testid={`suggestion-btn-${index}`}
      onClick={() => onClick(text)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      whileHover={{ x: 5 }}
      className={`w-full group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${theme.bg} ${theme.border} ${theme.hover} shadow-sm backdrop-blur-sm`}
    >
      <div className={`p-2 rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${theme.text}`}>
        {theme.icon}
      </div>
      <div className="flex-1">
        <TypewriterLabel 
          text={text} 
          delay={800 + index * 150} 
          speed={65} 
          className={theme.text}
        />
        <div className="h-px w-0 group-hover:w-full bg-current opacity-20 transition-all duration-500 mt-1" />
      </div>
      <ArrowRight size={14} className={`opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 ${theme.text}`} />
    </motion.button>
  );
};

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'history' | 'import'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'Polystrukt GenCAD online. Awaiting input parameters.', timestamp: new Date() }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved sessions", e);
      }
    }
  }, []);

  useEffect(() => { if (isOpen) setSuggestions(shuffleArray(SUGGESTION_POOL).slice(0, 4)); }, [isOpen]);
  useEffect(() => { 
    if (view === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping, view]);

  const saveCurrentSession = () => {
    if (messages.length <= 1) return;
    const firstUserMsg = messages.find(m => m.role === 'user')?.text || 'Untitled Design';
    const newSession: SavedSession = {
      id: Date.now(),
      name: firstUserMsg.length > 30 ? firstUserMsg.slice(0, 30) + '...' : firstUserMsg,
      date: new Date().toLocaleDateString(),
      messages: messages
    };
    const updated = [newSession, ...savedSessions];
    setSavedSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    alert("Session saved successfully.");
  };

  const loadSession = (session: SavedSession) => {
    setMessages(session.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})));
    setView('chat');
  };

  const deleteSession = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = savedSessions.filter(s => s.id !== id);
    setSavedSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const processFile = (file: File) => {
    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setTimeout(() => {
        setPendingAttachment({
          name: file.name,
          mimeType: file.type,
          data: base64
        });
        setIsScanning(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.includes('image') || file.type === 'application/pdf')) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const confirmAttachment = () => {
    if (pendingAttachment) {
      setAttachment(pendingAttachment);
      setPendingAttachment(null);
      setView('chat');
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300);
    }
  };

  const cancelAttachment = () => {
    setPendingAttachment(null);
  };

  const processMessage = async (text: string) => {
    if (!text.trim() && !attachment) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    const userMsg: ChatMessage = { role: 'user', text, timestamp: new Date(), attachment: attachment || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setAttachment(null); setIsTyping(true);
    try {
      const technicalRes = await getTechnicalResponse(userMsg.text, messages, attachment || undefined);
      
      if (technicalRes.error) {
        setMessages(prev => [...prev, {
            role: 'model',
            text: `ENGINE_ERR [${technicalRes.statusCode || 500}]: ${technicalRes.error}`,
            timestamp: new Date()
        }]);
      } else {
        const botMsg: ChatMessage = { 
            role: 'model', 
            text: `${technicalRes.analysis}\n\n**Optimization Logic:**\n${technicalRes.optimizationLogic}\n\n**Specs:**\n${technicalRes.specs}`, 
            timestamp: new Date(), 
            simulationType: technicalRes.simulationType as any, 
            has3DModel: true, 
            modelUrl: technicalRes.modelUrl,
            focusPart: technicalRes.isolatedComponent,
            // @ts-ignore
            sources: technicalRes.sources
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (e) { 
        console.error(e); 
        setMessages(prev => [...prev, {
            role: 'model',
            text: "FATAL: Connection with engineering kernel lost.",
            timestamp: new Date()
        }]);
    } finally { setIsTyping(false); }
  };

  return (
    <>
      <div className={`fixed bottom-8 right-8 z-40 ${isOpen ? 'hidden' : 'block'}`}>
        <motion.div
          data-testid="chat-trigger"
          className="relative group"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute -inset-4 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'conic-gradient(from 0deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6)',
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.15, 1],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 4, ease: "linear" },
              scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }
            }}
          />
          
          <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md group-hover:bg-purple-500/50 transition-colors" />

          <button 
            onClick={() => setIsOpen(true)} 
            className="relative bg-zinc-900 text-white p-5 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 group-active:translate-y-0.5 transition-transform"
          >
            <div className="relative">
              <Cpu size={24} className="group-hover:text-purple-400 transition-colors" />
              <motion.div 
                className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <span className="font-unique text-xs font-black tracking-widest pr-2 uppercase">Start Designing</span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            data-testid="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="fixed bottom-8 right-8 z-50 w-[420px] h-[600px] bg-white/95 backdrop-blur-3xl border border-zinc-200 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
          >
            
            <AnimatePresence>
              {pendingAttachment && (
                <motion.div 
                  data-testid="attachment-confirm-overlay"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[60] flex items-center justify-center p-6"
                >
                  <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={cancelAttachment} />
                  <motion.div 
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 30 }}
                    className="relative w-full max-sm bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-zinc-200"
                  >
                    <div className="bg-zinc-900 p-5 flex justify-between items-center text-white">
                      <div className="flex items-center gap-2">
                        <FilePlus size={16} className="text-purple-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest font-unique">File Export</h4>
                      </div>
                      <button onClick={cancelAttachment} className="hover:bg-white/10 p-1.5 rounded-xl transition-colors">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-7">
                      <div className="aspect-video w-full bg-zinc-50 rounded-[1.5rem] border border-zinc-100 overflow-hidden flex items-center justify-center mb-6 shadow-inner relative group">
                        {pendingAttachment.mimeType.includes('image') ? (
                          <img src={pendingAttachment.data} alt="File Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-zinc-50">
                               <FileSearch size={32} className="text-zinc-300" />
                             </div>
                             <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Document Analysis Active</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-zinc-900/80 text-white text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur">PRE_SCAN_VIEW</div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                           <div className="p-2 bg-white rounded-xl text-zinc-400 shadow-sm"><Info size={14} /></div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-900 truncate">{pendingAttachment.name}</p>
                              <p className="text-[10px] text-zinc-400 font-mono uppercase mt-0.5 tracking-tight">Mime: {pendingAttachment.mimeType}</p>
                           </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                           <p className="text-[9px] text-purple-600 font-bold uppercase tracking-widest leading-relaxed text-center">Incorporate this file into the current design session?</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          data-testid="attachment-discard-btn"
                          onClick={cancelAttachment}
                          className="py-4 rounded-2xl border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all font-unique"
                        >
                          Discard
                        </button>
                        <button 
                          data-testid="attachment-confirm-btn"
                          onClick={confirmAttachment}
                          className="py-4 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/10 font-unique"
                        >
                          <Check size={14} />
                          Confirm
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  data-testid="chat-scanning-overlay"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[70] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
                >
                  <div className="relative">
                    <Loader2 size={48} className="text-purple-600 animate-spin" />
                    <motion.div 
                      className="absolute inset-0 border-4 border-purple-200 rounded-full"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-black uppercase tracking-widest font-unique text-zinc-900">Scanning File</h3>
                    <p className="text-[10px] font-mono text-zinc-400 mt-2 uppercase">Extracting physical constraints...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-5 border-b flex justify-between items-center bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">GenCAD Engine</h3>
                  <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Active State</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  data-testid="chat-view-import"
                  onClick={() => setView('import')} 
                  className={`p-2 rounded-xl transition-all ${view === 'import' ? 'bg-purple-100 text-purple-600' : 'hover:bg-zinc-200 text-zinc-500'}`}
                  title="Dedicated File Export"
                >
                  <Upload size={18} />
                </button>
                <button 
                  data-testid="chat-view-history"
                  onClick={() => setView(view === 'history' ? 'chat' : 'history')} 
                  className={`p-2 rounded-xl transition-all ${view === 'history' ? 'bg-purple-100 text-purple-600' : 'hover:bg-zinc-200 text-zinc-500'}`}
                  title="Design History"
                >
                  <History size={18} />
                </button>
                {view === 'chat' && messages.length > 1 && (
                  <button 
                    data-testid="chat-save-session"
                    onClick={saveCurrentSession}
                    className="p-2 hover:bg-zinc-200 rounded-xl transition-all text-zinc-500"
                    title="Save Design State"
                  >
                    <Save size={18} />
                  </button>
                )}
                <button 
                  data-testid="chat-close"
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-zinc-200 rounded-xl transition-all text-zinc-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="application/pdf,image/png,image/jpeg" 
              className="hidden" 
            />

            <div 
                data-testid="chat-content-area"
                ref={scrollRef} 
                className="flex-1 overflow-y-auto p-5 custom-scrollbar relative"
                onDragOver={view === 'import' ? handleDragOver : undefined}
                onDragLeave={view === 'import' ? handleDragLeave : undefined}
                onDrop={view === 'import' ? handleDrop : undefined}
            >
              {view === 'chat' ? (
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <MessageBubble 
                      key={idx} 
                      index={idx} 
                      msg={msg} 
                      onRetry={() => processMessage(messages[idx-1]?.text || "")} 
                      isLast={idx === messages.length - 1 && msg.role === 'model'}
                    />
                  ))}
                  
                  {messages.length === 1 && (
                    <div className="space-y-3 pt-2">
                       <div className="flex items-center gap-2 mb-2 px-1">
                          <Zap size={14} className="text-purple-500" />
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recommended Actions</span>
                       </div>
                       {suggestions.map((s, idx) => (
                         <SuggestionButton key={s} text={s} onClick={processMessage} index={idx} />
                       ))}
                    </div>
                  )}
                  
                  {isTyping && (
                    <div data-testid="bot-typing-indicator" className="flex items-center gap-2 px-1">
                       <span className="text-[10px] font-mono text-purple-600 font-black uppercase tracking-widest animate-pulse">Calculating Geometry...</span>
                       <motion.div 
                         animate={{ rotate: 360 }} 
                         transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                         className="w-3 h-3 border-b-2 border-purple-600 rounded-full"
                       />
                    </div>
                  )}
                </div>
              ) : view === 'history' ? (
                <div data-testid="chat-history-list" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <History size={14} className="text-purple-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-unique">Saved Designs</span>
                  </div>
                  {savedSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-300 gap-4">
                      <Search size={48} strokeWidth={1} />
                      <p className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold">Archive Empty</p>
                    </div>
                  ) : (
                    savedSessions.map(session => (
                      <motion.div 
                        key={session.id}
                        data-testid={`history-item-${session.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group bg-white border border-zinc-200 p-5 rounded-[1.5rem] hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/5 transition-all cursor-pointer flex justify-between items-center"
                        onClick={() => loadSession(session)}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-zinc-900 truncate">{session.name}</h4>
                          <span className="text-[9px] text-zinc-400 font-mono uppercase mt-1 block tracking-wider">{session.date} • {session.messages.length} Units</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            data-testid={`delete-session-${session.id}`}
                            onClick={(e) => deleteSession(e, session.id)}
                            className="p-2.5 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="p-2.5 bg-zinc-900 text-white rounded-xl shadow-lg">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                <div 
                    data-testid="chat-import-dropzone"
                    className={`h-full flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in zoom-in-95 transition-all duration-300 ${isDraggingOver ? 'bg-purple-50/50 scale-[0.98]' : ''}`}
                >
                    <div 
                        data-testid="file-upload-trigger"
                        className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-2 border-dashed transition-all duration-300 ${isDraggingOver ? 'bg-purple-100 border-purple-400 scale-110 shadow-2xl shadow-purple-200' : 'bg-purple-50 border-purple-200 shadow-inner'} group cursor-pointer hover:bg-purple-100`} 
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isDraggingOver ? (
                            <Upload size={32} className="text-purple-600 animate-bounce" />
                        ) : (
                            <Database size={32} className="text-purple-400 group-hover:scale-110 transition-transform" />
                        )}
                    </div>
                    <div className="text-center space-y-3">
                        <h4 className={`text-lg font-bold font-unique tracking-tighter transition-colors ${isDraggingOver ? 'text-purple-700' : 'text-zinc-900'}`}>
                            {isDraggingOver ? 'Release to Scan' : 'File Export'}
                        </h4>
                        <p className="text-xs text-zinc-500 leading-relaxed max-w-[240px] mx-auto">
                            Drag & drop or click to upload technical drawings (JPG/PDF) to extract constraints.
                        </p>
                    </div>
                    <button 
                        data-testid="manual-file-select-btn"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] font-unique hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/10 font-unique"
                    >
                        <FilePlus size={14} />
                        Select File
                    </button>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center space-y-1">
                            <span className="block text-[8px] font-bold text-zinc-400 uppercase">Formats</span>
                            <span className="block text-[10px] font-mono font-bold">PDF, JPG, PNG</span>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-center space-y-1">
                            <span className="block text-[8px] font-bold text-zinc-400 uppercase">Limit</span>
                            <span className="block text-[10px] font-mono font-bold">20MB / Scan</span>
                        </div>
                    </div>
                    <button 
                        data-testid="import-cancel-btn"
                        onClick={() => setView('chat')}
                        className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                        Cancel and Return to Chat
                    </button>
                </div>
              )}
            </div>

            {view === 'chat' && (
              <div className="px-5 py-4 border-t bg-white/80 backdrop-blur-md space-y-4">
                <AnimatePresence>
                  {attachment && (
                    <motion.div 
                      data-testid="active-attachment-chip"
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-3 p-3 bg-zinc-900 text-white rounded-2xl border border-zinc-800 shadow-xl group"
                    >
                      <div className="bg-white/10 p-2.5 rounded-xl text-purple-400 shadow-sm">
                        {attachment.mimeType.includes('image') ? <ImageIcon size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold truncate tracking-tight">{attachment.name}</p>
                        <p className="text-[8px] text-zinc-400 font-mono uppercase tracking-tighter">Constraint Ref Active</p>
                      </div>
                      <button data-testid="remove-attachment-btn" onClick={() => setAttachment(null)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div 
                  className="flex items-center gap-2"
                  animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0], borderColor: ['rgba(0,0,0,0.1)', 'rgba(239,68,68,0.5)', 'rgba(0,0,0,0.1)'] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <button 
                    data-testid="chat-attach-btn"
                    onClick={() => setView('import')}
                    className={`p-3.5 rounded-2xl transition-all border flex items-center justify-center shadow-sm ${attachment ? 'bg-purple-600 border-purple-700 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200 hover:text-purple-600'}`}
                    title="Quick Import"
                  >
                    <Upload size={18} />
                  </button>
                  <div className="flex-1 relative">
                    <input 
                      data-testid="chat-input-field"
                      ref={chatInputRef}
                      type="text" 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && processMessage(input)} 
                      placeholder="Input design params..." 
                      className={`w-full bg-zinc-50 p-3.5 rounded-2xl border transition-all focus:outline-none text-sm font-mono ${isShaking ? 'border-red-400 ring-1 ring-red-400/20' : 'border-zinc-100 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20'}`} 
                    />
                  </div>
                  <button 
                    data-testid="chat-send-btn"
                    onClick={() => processMessage(input)} 
                    className={`bg-zinc-900 text-white p-3.5 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-900/10 flex items-center justify-center ${(!input.trim() && !attachment) ? 'opacity-80' : ''}`}
                  >
                    <Send size={18} />
                  </button>
                </motion.div>
              </div>
            )}
            
            {view !== 'chat' && (
                <div className="p-4 border-t bg-zinc-50 text-center">
                    <button 
                        data-testid="return-to-chat-footer-btn"
                        onClick={() => setView('chat')}
                        className="text-[10px] font-black uppercase tracking-widest font-unique text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                        Return to Design Console
                    </button>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
