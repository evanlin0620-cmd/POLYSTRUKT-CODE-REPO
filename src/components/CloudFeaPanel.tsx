import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Cpu, Activity, Play, Check, Flame, AlertCircle, RefreshCw, 
  Settings, Layers, Terminal, Server, BarChart2, ShieldAlert, Zap 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface CloudFeaPanelProps {
  onClose: () => void;
  selectedMaterial: any;
  dimensions: { length: number; width: number; height: number };
  currentDesign: any;
}

interface LogLine {
  text: string;
  type: 'info' | 'success' | 'warn' | 'system';
  timestamp: string;
}

export const CloudFeaPanel: React.FC<CloudFeaPanelProps> = ({ 
  onClose, 
  selectedMaterial,
  dimensions,
  currentDesign
}) => {
  const [meshSize, setMeshSize] = useState(1.5); // mm
  const [meshType, setMeshType] = useState('tetrahedral'); // tetrahedral vs hexahedral
  const [simType, setSimType] = useState('static_structural'); // dynamic types
  const [forceX, setForceX] = useState(0);
  const [forceY, setForceY] = useState(-5000); // 5kN down default
  const [forceZ, setForceZ] = useState(0);
  const [fixedVertices, setFixedVertices] = useState('Mounting Hubs & Base plate');
  
  const [computationActive, setComputationActive] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [solverLogs, setSolverLogs] = useState<LogLine[]>([]);
  const [feaResult, setFeaResult] = useState<any | null>(null);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const token = useAuth(state => state.token);

  // Scroll terminal logs automatically
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [solverLogs]);

  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'system' = 'info') => {
    const timeStr = new Date().toLocaleTimeString();
    setSolverLogs(prev => [...prev, { text, type, timestamp: timeStr }]);
  };

  const handleRunPhysicsSimulation = async () => {
    if (computationActive) return;
    
    setComputationActive(true);
    setCurrentProgress(0);
    setSolverLogs([]);
    setFeaResult(null);

    addLog('Polystrukt Cloud Compute handshake initiated.', 'system');
    addLog(`Sending CAD envelope specs: Dimensions=[${dimensions.length}x${dimensions.width}x${dimensions.height}] mm`, 'info');
    addLog(`Loading Material boundary equations for: ${selectedMaterial?.name || 'Aluminum 6061-T6'}`, 'info');
    
    try {
      // Send active POST payload to server-side FEA compute solver microservice!
      const response = await fetch('/api/compute-fea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dimensions,
          material: selectedMaterial,
          meshSize,
          meshType,
          simType,
          boundaryForces: { x: forceX, y: forceY, z: forceZ },
          fixedMounting: fixedVertices,
          geometrySpec: currentDesign?.proceduralSpec
        })
      });

      if (!response.ok) {
        throw new Error(`Microservice responded with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback standard JSON if streaming reader is unsupported
        const data = await response.json();
        setFeaResult(data.payload);
        setComputationActive(false);
        return;
      }

      // Stream logs chunk by chunk for realistic terminal output
      const decoder = new TextDecoder("utf-8");
      let finished = false;
      let buffer = '';

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split('\n');
          // Save last incomplete line back to buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.log) {
                  addLog(parsed.log, parsed.type || 'info');
                }
                if (parsed.progress !== undefined) {
                  setCurrentProgress(parsed.progress);
                }
                if (parsed.result) {
                  setFeaResult(parsed.result);
                }
              } catch (e) {
                // If it's plain text logs instead
                addLog(line, 'info');
              }
            }
          }
        }
      }

    } catch (err: any) {
      addLog(`CRITICAL SOLVER OVERFLOW: ${err.message || 'Remote socket connection failure'}`, 'warn');
    } finally {
      setComputationActive(false);
    }
  };

  // Safe yield stress check derived dynamically based on material selection
  const yieldStrengthMPa = selectedMaterial?.id === 'titanium_grade_5' ? 880 :
                           selectedMaterial?.id === 'steel_304' ? 290 :
                           selectedMaterial?.id === 'carbon_fiber' ? 600 :
                           selectedMaterial?.id === 'aluminum_6061' ? 276 : 35;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-zinc-950/95 border-l border-white/10 backdrop-blur-md shadow-2xl flex flex-col font-sans text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-100 font-sans">Remote FEA Microservice</h2>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">High-Performance Physics Compute Suite & FEM Boundary Solver</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/5 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Simulation Type configurator */}
        <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 space-y-3">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Simulation Physics Model</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSimType('static_structural')}
              className={`p-3 rounded-2xl border text-[10px] text-left font-mono font-bold uppercase transition-all cursor-pointer ${
                simType === 'static_structural' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                  : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Static Structural (Stress/Deformation)
            </button>
            <button
              onClick={() => setSimType('steady_state_thermal')}
              className={`p-3 rounded-2xl border text-[10px] text-left font-mono font-bold uppercase transition-all cursor-pointer ${
                simType === 'steady_state_thermal' 
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' 
                  : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Steady-State Thermal (Flux)
            </button>
          </div>
        </div>

        {/* Finite Element Discretization Configuration */}
        <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Fine-Element Mesh (discretization parameter)</span>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[9px] text-zinc-450 uppercase font-black">
                <span>Mesh Size Factor</span>
                <span className="text-rose-400">{meshSize} mm</span>
              </div>
              <input 
                type="range"
                min="0.5"
                max="4.0"
                step="0.5"
                value={meshSize}
                onChange={(e) => setMeshSize(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Solids Element type</label>
              <select
                value={meshType}
                onChange={(e) => setMeshType(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono focus:outline-none focus:border-rose-500 cursor-pointer text-zinc-300"
              >
                <option value="tetrahedral">Tetrahedral Solid (Fluid/Organic)</option>
                <option value="hexahedral">Hexahedral Quadratic (Prismatic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Boundary loads settings */}
        <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Boundary Constraints & Applied Loads</span>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Fixed boundary support area</label>
              <input 
                type="text"
                value={fixedVertices}
                onChange={(e) => setFixedVertices(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[9.5px] font-mono focus:outline-none text-left focus:border-rose-500 text-zinc-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Force F_x (N)</label>
              <input 
                type="number"
                value={forceX}
                onChange={(e) => setForceX(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono focus:outline-none text-left focus:border-rose-500 text-zinc-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Force F_y (N)</label>
              <input 
                type="number"
                value={forceY}
                onChange={(e) => setForceY(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono focus:outline-none text-left focus:border-rose-500 text-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Force F_z (N)</label>
              <input 
                type="number"
                value={forceZ}
                onChange={(e) => setForceZ(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono focus:outline-none text-left focus:border-rose-500 text-zinc-300"
              />
            </div>
          </div>
        </div>

        {/* Microservice Terminal logger displaying remote progress */}
        <div className="p-4 rounded-3xl bg-black border border-white/10 space-y-3 shadow-inner relative">
          <div className="flex justify-between items-center bg-zinc-950 px-2 py-1.5 rounded-lg border border-white/5 font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-rose-500"><Terminal size={11} /> REMOTE CONSOLE BUFFER</span>
            <span>Microservice Node</span>
          </div>

          <div className="h-[140px] overflow-y-auto font-mono text-[8.5px] p-2 space-y-1.5 select-text text-left">
            {solverLogs.length === 0 ? (
              <span className="text-zinc-650 italic">[Solver terminal output idle. Click "RUN REMOTE PHYSICS SOLVE" above to start compute cycle.]</span>
            ) : (
              solverLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2.5 leading-normal items-start">
                  <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                  <span className={`break-all ${
                    log.type === 'system' ? 'text-purple-400 font-bold' : 
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'warn' ? 'text-amber-400' : 'text-zinc-300'
                  }`}>
                    {log.text}
                  </span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>

          {computationActive && (
            <div className="absolute inset-x-0 bottom-0 top-[35px] bg-black/75 flex flex-col items-center justify-center p-4">
              <div className="text-center space-y-3 w-full max-w-[280px]">
                <RefreshCw size={24} className="text-rose-500 animate-spin mx-auto" />
                <div className="space-y-1">
                  <span className="text-[8.5px] font-mono font-bold tracking-widest block uppercase text-zinc-400">REMOTE MATHEMATICS IN PROGRESS</span>
                  <span className="text-[7.5px] font-mono text-zinc-500 block">ASSEMBLING STIFFNESS COORDINATE VECTORS</span>
                </div>
                
                {/* Progress load */}
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                  <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${currentProgress}%` }} />
                </div>
                <span className="font-mono text-[10px] text-rose-400 font-black">{currentProgress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Telemetry output block (FEA result outputs) */}
        <AnimatePresence>
          {feaResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-zinc-900 border border-white/5 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-450 uppercase tracking-widest font-bold">Calculated FEM Multi-Physics Telemetry</span>
                <span className="text-[8px] font-mono bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/25 uppercase font-bold">Solved</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Max Stress</span>
                  <span className="text-sm font-black text-red-400 font-mono block mt-1">{feaResult.maxStressMPa} MPa</span>
                  <span className="text-[7px] font-mono text-zinc-600 uppercase block mt-1">Tensile limit {yieldStrengthMPa}MPa</span>
                </div>
                
                <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Safety Factor</span>
                  <span className={`text-sm font-black font-mono block mt-1 ${
                    feaResult.safetyFactor < 1.25 ? 'text-amber-400' : 'text-green-400'
                  }`}>{feaResult.safetyFactor.toFixed(2)}</span>
                  <span className="text-[7px] font-mono text-zinc-650 uppercase block mt-1">Target limit 1.2</span>
                </div>

                <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Displacement</span>
                  <span className="text-sm font-black text-sky-400 font-mono block mt-1">{feaResult.displacementMm.toFixed(4)} mm</span>
                  <span className="text-[7px] font-mono text-zinc-650 block mt-1">MAX DEFLECTION</span>
                </div>

                <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Mesh Elements</span>
                  <span className="text-sm font-black text-purple-400 font-mono block mt-1">{feaResult.elementCount}</span>
                  <span className="text-[7px] font-mono text-zinc-650 block mt-1">DEGREES OF FREEDOM</span>
                </div>
              </div>

              {feaResult.safetyFactor < 1.25 && (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-300 font-mono text-[9px] leading-relaxed select-none">
                  <ShieldAlert size={16} className="text-amber-405 shrink-0" />
                  <div>
                    <strong className="text-zinc-200 block">WARNING: LOW COMPONENT MARGINS DETECTED</strong>
                    The estimated safety factor factor has fallen below the standard safety ratio. High risks of visual deformation or structural tensile fracture. Recommendation: Increase section thickness.
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="p-6 border-t border-white/5 bg-black/60 flex justify-between items-center">
        <div className="flex items-center gap-2 font-mono text-[8px] text-zinc-500">
          <Server size={12} className="text-zinc-650 shrink-0" />
          <span className="uppercase tracking-widest">REMOTE CLOUDFEA MICROSERVICE INSTANCE: ONLINE</span>
        </div>

        <button
          onClick={handleRunPhysicsSimulation}
          disabled={computationActive}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.45)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2 font-sans font-black"
        >
          {computationActive ? (
            <>
              <RefreshCw size={13} className="animate-spin" /> SOLVING REMOTE SYSTEM...
            </>
          ) : (
            <>
              <Play size={12} /> RUN REMOTE PHYSICS SOLVE
            </>
          )}
        </button>
      </div>
    </div>
  );
};
