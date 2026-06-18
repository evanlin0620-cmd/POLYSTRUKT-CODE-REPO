import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal as TerminalIcon, X, Send, Cpu, Database, Gauge, 
  RefreshCw, Check, AlertTriangle, ShieldCheck, Play, ArrowRight 
} from 'lucide-react';

interface OperatorConsoleProps {
  onClose: () => void;
  dimensions: { length: number; width: number; height: number };
  setDimensions: React.Dispatch<React.SetStateAction<{ length: number; width: number; height: number }>>;
  selectedMaterial: { id: string; name: string };
  setSelectedMaterial: (mat: any) => void;
  materials: Array<{ id: string; name: string; color: string }>;
}

export const OperatorConsole: React.FC<OperatorConsoleProps> = ({
  onClose,
  dimensions,
  setDimensions,
  selectedMaterial,
  setSelectedMaterial,
  materials,
}) => {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ text: string; type: 'cmd' | 'resp' | 'err' | 'system' }>>([
    { text: 'POLYSTRUKT COCKPIT HUD OPERATOR CONSOLE [v2.4.8]', type: 'system' },
    { text: 'SECURE CORE SHELL INITIALIZED. READY...', type: 'system' },
    { text: 'Type "help" to view high-priority supervisor commands.', type: 'resp' }
  ]);
  const [telemetry, setTelemetry] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Generate real-time telemetry stream
  useEffect(() => {
    const generator = setInterval(() => {
      const activeOps = [
        `SYS_SECURE: Heartbeat check successful (latency 1.4ms)`,
        `CORE_TEMP: 38.6°C - Ambient limits normal`,
        `MESH_ENG: Auto-caching quad segments for high-res preview`,
        `AI_CORE: Floating point capacity optimized at 4.2 TFLOPS`,
        `MEM_ALLOC: 0x7FFF982A -> DMA block allocated`,
        `FEA_GRID: Dynamic relaxation boundaries converge in 0.08s`
      ];
      const randomOp = activeOps[Math.floor(Math.random() * activeOps.length)];
      setTelemetry(prev => [randomOp, ...prev].slice(0, 5));
    }, 1500);

    return () => clearInterval(generator);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const input = terminalInput.trim();
    const commandWords = input.toLowerCase().split(/\s+/);
    const cmd = commandWords[0];
    const args = commandWords.slice(1);

    const newHistory = [...terminalHistory, { text: `operator@polystrukt:~$ ${input}`, type: 'cmd' as const }];

    switch (cmd) {
      case 'help':
        newHistory.push(
          { text: 'SYS // EXECUTABLE OPERATOR PROTOCOLS:', type: 'system' },
          { text: '  status                       Dump critical system and material specs.', type: 'resp' },
          { text: '  material [id]                Interactively alter CAD specimen material.', type: 'resp' },
          { text: '         IDs: titanium_grade_5 | steel_304 | carbon_fiber | aluminum_6061 | abs_plastic', type: 'resp' },
          { text: '  dimensions [L] [W] [H]       Command CAD dimensions directly (e.g. dimensions 200 150 80).', type: 'resp' },
          { text: '  logs                         Fetch latest detailed kernel logs.', type: 'resp' },
          { text: '  diagnostics                  Perform an automated system self-diagnostic.', type: 'resp' },
          { text: '  clear                        Flush console scroll memory.', type: 'resp' },
          { text: '  exit                         Halt console overlay session.', type: 'resp' }
        );
        break;

      case 'status':
        newHistory.push(
          { text: '--- POLYSTRUKT CORE STATUS REPORT ---', type: 'system' },
          { text: `  Active Specimen Material : ${selectedMaterial.name}`, type: 'resp' },
          { text: `  Length (X)               : ${dimensions.length} mm`, type: 'resp' },
          { text: `  Width (Y)                : ${dimensions.width} mm`, type: 'resp' },
          { text: `  Height (Z)               : ${dimensions.height} mm`, type: 'resp' },
          { text: '  Operating Precision      : HIGH_RES (Non-linear FEA ready)', type: 'resp' },
          { text: '  Integrity Metric         : Nominal (98% verification)', type: 'resp' }
        );
        break;

      case 'material':
        if (args.length === 0) {
          newHistory.push({ text: 'Error: Specify a material ID. Available IDs: ' + materials.map(m => m.id).join(', '), type: 'err' });
        } else {
          const targetMat = materials.find(m => m.id === args[0]);
          if (targetMat) {
            setSelectedMaterial(targetMat);
            newHistory.push({ text: `Protocol successful. Specimen material optimized to: ${targetMat.name}`, type: 'resp' });
          } else {
            newHistory.push({ text: `CRITICAL: Material profile "${args[0]}" not found in database index.`, type: 'err' });
          }
        }
        break;

      case 'dimensions':
        if (args.length < 3) {
          newHistory.push({ text: 'Error: Provide Length, Width, and Height (e.g., dimensions 180 120 60)', type: 'err' });
        } else {
          const L = parseInt(args[0]);
          const W = parseInt(args[1]);
          const H = parseInt(args[2]);

          if (isNaN(L) || isNaN(W) || isNaN(H) || L <= 0 || W <= 0 || H <= 0) {
            newHistory.push({ text: 'Error: All inputs must be positive integers.', type: 'err' });
          } else {
            setDimensions({ length: L, width: W, height: H });
            newHistory.push({ text: `System adjusted. Constraints written to CAD core: L=${L}mm, W=${W}mm, H=${H}mm`, type: 'resp' });
          }
        }
        break;

      case 'logs':
        newHistory.push(
          { text: '[04:52:12.441] INIT: Core process started on run.app environment.', type: 'resp' },
          { text: '[04:52:13.012] BOOT: ThreeJS CAD canvas successfully hooked to GL context.', type: 'resp' },
          { text: '[04:52:13.298] SYNC: Local storage user profiles loaded (persistent_session: true)', type: 'resp' },
          { text: `[04:52:14.502] CAD: Synced spatial mesh bounding volume: ${dimensions.length} x ${dimensions.width} x ${dimensions.height} mm`, type: 'resp' }
        );
        break;

      case 'diagnostics':
        newHistory.push(
          { text: 'Initiating self-diagnostic program...', type: 'system' },
          { text: '  - Scanning CAD bounding boxes... [PASSED]', type: 'resp' },
          { text: '  - Reading material spectral densities... [PASSED]', type: 'resp' },
          { text: '  - Validating local shader compliance... [PASSED]', type: 'resp' },
          { text: '  - Testing neural API pipeline key response... [OK]', type: 'resp' },
          { text: 'Diagnostic complete: STATUS GREEN (0 anomalies identified).', type: 'system' }
        );
        break;

      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;

      case 'exit':
        onClose();
        return;

      default:
        newHistory.push({ text: `Unknown operator command "${cmd}". Type "help" to list protocols.`, type: 'err' });
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-zinc-950/95 backdrop-blur-3xl overflow-hidden flex flex-col p-6 font-mono border border-indigo-500/10 text-emerald-400"
    >
      {/* Sci-Fi HUD Corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-emerald-500/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-emerald-500/40 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-emerald-500/40 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-500/40 pointer-events-none" />

      {/* Operator Header Bar */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-4 select-none relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <TerminalIcon size={18} />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white">Head-Up Operator Console</h1>
            <p className="text-[9px] text-emerald-500/60 uppercase tracking-widest mt-0.5">CLI Command Terminal // Spatial Sync</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick HUD Metrics */}
          <div className="hidden lg:flex items-center gap-6 text-[10px] text-emerald-500/60 font-black uppercase tracking-widest border border-emerald-500/10 bg-emerald-500/5 px-4 py-2 rounded-xl">
            <span className="flex items-center gap-1.5 shadow-sm">
              <Cpu size={12} className="text-emerald-400 animate-spin" />
              CPU: NOMINAL
            </span>
            <span className="flex items-center gap-1.5">
              <Database size={12} className="text-indigo-400" />
              MEM: 12.8GB/16GB
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge size={12} className="text-orange-400" />
              LATENCY: 1.4ms
            </span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:text-white rounded-full text-zinc-400 transition-all cursor-pointer shadow-md"
            title="Close Terminal Overlay"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      {/* Main Terminal and Side HUD Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Terminal output console */}
        <div className="lg:col-span-3 flex flex-col bg-black/60 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
          {/* Ambient matrix scanlines */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

          {/* Scrolling output container */}
          <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-2 select-text custom-scrollbar">
            {terminalHistory.map((item, idx) => (
              <div 
                key={idx} 
                className={`text-xs leading-relaxed ${
                  item.type === 'cmd' ? 'text-white font-bold' :
                  item.type === 'err' ? 'text-red-400 border-l-2 border-red-500 pl-2 bg-red-950/20 py-1' :
                  item.type === 'system' ? 'text-cyan-400 border-l-2 border-cyan-500 pl-2 bg-cyan-950/20 py-1' :
                  'text-emerald-400'
                }`}
              >
                {item.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* TextInput Command Form */}
          <form onSubmit={handleCommandSubmit} className="flex gap-3 border-t border-emerald-500/20 pt-4">
            <span className="text-emerald-400 font-bold text-sm py-2">operator@polystrukt:~$</span>
            <input 
              type="text" 
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder='Type a command... (e.g. "help", "status", "material steel_304")'
              className="flex-1 bg-transparent text-white border-none focus:outline-none focus:ring-0 text-sm select-text"
              autoFocus
            />
            <button 
              type="submit" 
              className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 text-emerald-400 transition-all flex items-center justify-center cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Side Cockpit HUD Widgets */}
        <div className="space-y-4 flex flex-col">
          {/* Live Telemetry Ticker */}
          <div className="bg-black/45 border border-emerald-500/10 rounded-2xl p-4 flex-1 flex flex-col min-h-0">
            <span className="text-[10px] font-black uppercase text-emerald-500/50 tracking-[0.2em] mb-3 block">High-Frequency Telemetry</span>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar text-[10px] leading-relaxed text-zinc-500">
              {telemetry.map((t, idx) => (
                <div key={idx} className="flex gap-2 items-start opacity-80 border-b border-white/5 pb-2">
                  <ArrowRight size={10} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-mono text-[9px] text-emerald-400/80">{t}</span>
                </div>
              ))}
              {telemetry.length === 0 && (
                <div className="text-zinc-700 italic select-none">Idle data streams...</div>
              )}
            </div>
          </div>

          {/* Hardware Stats Widget */}
          <div className="bg-black/45 border border-indigo-500/10 rounded-2xl p-4 space-y-4">
            <span className="text-[10px] font-black uppercase text-indigo-400/80 tracking-[0.2em] block">Active Physical Specs</span>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500 uppercase">Load Material</span>
                <span className="text-white font-bold">{selectedMaterial.name}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500 uppercase">Volumetric bounding</span>
                <span className="text-cyan-400 font-bold">{dimensions.length}x{dimensions.width}x{dimensions.height}mm</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500 uppercase">Compiler Thread</span>
                <span className="text-emerald-400 font-bold font-mono">OK/ONLINE</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[9px] text-indigo-300 leading-relaxed">
              * Operators can write straight shell parameters to update dimensions without modifying the CAD design tree directly!
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
