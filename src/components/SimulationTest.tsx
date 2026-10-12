import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Activity, Cpu, Database, RefreshCw, X, 
  Terminal, ShieldCheck, AlertCircle, Gauge, 
  Layers, Box, LayoutGrid, ChevronRight, Play, Pause, Flame
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';

// A "Stress Test" model component that represents active engineering tasks
const TestObject = ({ 
  color, 
  speed = 1, 
  position,
  index 
}: { 
  color: string; 
  speed?: number; 
  position: [number, number, number];
  index: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [taskState, setTaskState] = useState<'IDLE' | 'SYNTHESIS' | 'ANALYSIS' | 'OPTIMIZING'>('IDLE');
  
  // Cycle through states to simulate active compute
  useEffect(() => {
    if (speed === 0) {
      setTaskState('IDLE');
      return;
    }
    const states: ('SYNTHESIS' | 'ANALYSIS' | 'OPTIMIZING')[] = ['SYNTHESIS', 'ANALYSIS', 'OPTIMIZING'];
    const interval = setInterval(() => {
      setTaskState(states[Math.floor(Math.random() * states.length)]);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [speed]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2 + index;
      meshRef.current.rotation.y = t * 0.3;
      
      // Visual feedback based on state
      if (taskState === 'OPTIMIZING') {
        const s = 1 + Math.sin(t * 15) * 0.02;
        meshRef.current.scale.set(s, s, s);
      } else {
        meshRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group position={position}>
      {/* Floating Data Tag */}
      <Html position={[0, 1.5, 0]} center>
        <div className="pointer-events-none flex flex-col items-center gap-1">
          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-colors ${
            taskState === 'SYNTHESIS' ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300' :
            taskState === 'ANALYSIS' ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300' :
            taskState === 'OPTIMIZING' ? 'bg-amber-500/20 border-amber-500/60 text-amber-300' :
            'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}>
            {taskState}
          </div>
          {speed > 0 && (
            <div className="text-[7px] text-zinc-400 font-mono">
              ADDR: 0x{index.toString(16).padStart(4, '0')}
            </div>
          )}
        </div>
      </Html>

      <Float speed={2 * speed} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          {index % 3 === 0 ? (
            <torusKnotGeometry args={[0.6, 0.2, 128, 16]} />
          ) : index % 3 === 1 ? (
            <octahedronGeometry args={[0.8, 4]} />
          ) : (
            <dodecahedronGeometry args={[0.8]} />
          )}
          <MeshDistortMaterial 
            color={color} 
            speed={2 * speed} 
            distort={taskState === 'OPTIMIZING' ? 0.3 : 0.05} 
            wireframe={taskState === 'SYNTHESIS'}
            transparent
            opacity={0.85}
            emissive={color}
            emissiveIntensity={taskState === 'ANALYSIS' ? 1.5 : 0.2}
          />
        </mesh>
        
        {/* Wireframe overlay for analysis state */}
        {taskState === 'ANALYSIS' && (
          <mesh rotation={meshRef.current?.rotation}>
             <torusKnotGeometry args={[0.62, 0.21, 64, 8]} />
             <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
          </mesh>
        )}
      </Float>
    </group>
  );
};

interface SimulationTestProps {
  onClose: () => void;
}

export const SimulationTest: React.FC<SimulationTestProps> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    gpu: 0,
    latency: '0ms'
  });

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setIterations(prev => prev + Math.floor(Math.random() * 50) + 10);
      setStats({
        cpu: 40 + Math.random() * 50,
        memory: 60 + Math.random() * 20,
        gpu: 30 + Math.random() * 60,
        latency: Math.floor(Math.random() * 15) + 'ms'
      });

      const diagnosticMsgs = [
        "KERNEL_STRESS_TEST: Calculating Reynolds Number...",
        "AI_ENGINE: Optimizing topology for 42k vertices",
        "SYNC_NODE: Validating mesh manifold integrity",
        "BENCHMARK: Vectorizing synthesis protocols",
        "ALERT: Thermal envelope within acceptable bounds"
      ];
      addLog(diagnosticMsgs[Math.floor(Math.random() * diagnosticMsgs.length)]);
    }, 800);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#07090e] text-zinc-100 flex flex-col font-mono overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Tech Elements */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,1)_1px,transparent_0)] bg-[size:32px_32px]" />
      </div>

      {/* Top Benchmark Header */}
      <header className="p-5 border-b border-zinc-800/80 bg-[#0a0d14]/90 backdrop-blur-xl flex justify-between items-center relative z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${isRunning ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-zinc-800 border border-zinc-700'} text-white transition-all`}>
            <Gauge size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black uppercase tracking-tight text-white font-mono">
                AI Kernel <span className="text-indigo-400">Stress Test</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                v2.4.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">
              Scientific CSG Engine // Hardware-Acceleration Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`px-5 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              isRunning 
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 hover:bg-rose-500/30' 
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? <><Pause size={14} /> Stop Benchmark</> : <><Play size={14} /> Run Stress Test</>}
          </button>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Diagnostic Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Metrics & Iterations */}
        <aside className="w-80 border-r border-zinc-800/80 p-6 flex flex-col gap-6 bg-[#0a0d14]/70 backdrop-blur-md overflow-y-auto">
          <div className="space-y-4">
            <h2 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Activity size={13} className="text-indigo-400" />
              Compute Load
            </h2>
            <div className="space-y-3.5 bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
              <MetricBar label="AI Core Load" value={stats.cpu} color="bg-indigo-500" />
              <MetricBar label="Neural Memory" value={stats.memory} color="bg-cyan-500" />
              <MetricBar label="Physics Pipeline" value={stats.gpu} color="bg-emerald-500" />
            </div>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1">
             <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Synthesis Cycles</h2>
             <div className="text-4xl font-black tabular-nums tracking-tight text-white py-1">
               {iterations.toLocaleString()}
             </div>
             <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
               <Activity size={11} /> {isRunning ? "Active Processing" : "Standby Mode"}
             </div>
          </div>

          <div className="mt-auto space-y-2">
            <h2 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Terminal size={13} className="text-indigo-400" />
              Live Diagnostics
            </h2>
            <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-3 font-mono text-[10px] text-emerald-400/90 h-44 overflow-hidden flex flex-col-reverse gap-1.5 shadow-inner">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="truncate"
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Center: Stress Visualization */}
        <section className="flex-1 relative bg-[#06080d]">
           {!isRunning && (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07090e]/80 backdrop-blur-md">
                <div className="text-center space-y-4 max-w-sm px-6 bg-zinc-900/90 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                     <Zap size={28} />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tight text-white">Engine Ready</h3>
                   <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                     The scientific kernel is primed for high-throughput parametric geometry synthesis. Click 'Run Stress Test' to begin benchmarking.
                   </p>
                </div>
             </div>
           )}
           
           <div className="absolute top-6 left-6 z-10 flex gap-3">
              <div className="px-3.5 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl backdrop-blur-md shadow-md">
                 <span className="text-[9px] text-zinc-400 block uppercase font-bold">Latency</span>
                 <span className="text-xs font-black text-white">{stats.latency}</span>
              </div>
              <div className="px-3.5 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl backdrop-blur-md shadow-md">
                 <span className="text-[9px] text-zinc-400 block uppercase font-bold">Kernel Stability</span>
                 <span className="text-xs font-black text-emerald-400">99.98%</span>
              </div>
           </div>

           <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
              <color attach="background" args={['#06080d']} />
              <ambientLight intensity={0.3} />
              <spotLight position={[10, 10, 10]} intensity={1.8} />
              <Environment preset="night" />
              
              {/* Technical Testing Grid */}
              <gridHelper args={[20, 20, 0x4f46e5, 0x1e293b]} position={[0, -5, 0]} />
              
              <AnimatePresence>
                {isRunning && (
                  <group>
                    {/* A grid of "stress objects" */}
                    {[-4, 0, 4].map((x, xi) => (
                      [-3, 0, 3].map((y, yi) => (
                        <group key={`${x}-${y}`}>
                          <TestObject 
                            color={y > 0 ? '#6366f1' : x === 0 ? '#06b6d4' : '#10b981'} 
                            speed={isRunning ? 1 : 0} 
                            position={[x, y, 0]}
                            index={xi * 5 + yi}
                          />
                        </group>
                      ))
                    ))}
                  </group>
                )}
              </AnimatePresence>
              
              <OrbitControls enableZoom={false} enablePan={false} />
           </Canvas>

           <div className="absolute bottom-6 right-6 z-10 text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
             SYSTEM_STRESS_PREVIEW_MODE
           </div>
        </section>

        {/* Right: Validation Specs */}
        <aside className="w-80 border-l border-zinc-800/80 p-6 flex flex-col gap-5 bg-[#0a0d14]/70 backdrop-blur-md overflow-y-auto">
          <h2 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={13} className="text-emerald-400" />
            Validation Specs
          </h2>
          
          <div className="space-y-2.5">
            <SpecItem label="Thermal Threshold" value="84.2°C" icon={<Flame className="text-rose-400" size={15} />} />
            <SpecItem label="Vertex Capacity" value="2.4M / sec" icon={<Layers className="text-indigo-400" size={15} />} />
            <SpecItem label="Kernel Stability" value="Validated" icon={<Cpu className="text-cyan-400" size={15} />} />
          </div>
          
          <div className="h-px bg-zinc-800 my-1" />
          
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Active Benchmarks</h3>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-2">
              {[
                 { name: "Fluid Mesh Real-time", value: "PASSED" },
                 { name: "CSG Topology Reduction", value: "ACTIVE" },
                 { name: "Neural Geometry Warp", value: "PENDING" },
                 { name: "Tensor Core Alignment", value: "PASSED" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-300 uppercase tracking-wider">{item.name}</span>
                  <span className={`font-bold ${item.value === 'PASSED' ? 'text-emerald-400' : item.value === 'ACTIVE' ? 'text-amber-400' : 'text-zinc-500'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex gap-2.5">
             <AlertCircle className="text-indigo-400 flex-shrink-0 mt-0.5" size={15} />
             <p className="text-[10px] text-zinc-300 leading-relaxed font-sans">
               The AI kernel demonstrates multi-threaded performance with low thermal drift.
             </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-300 tracking-wider">
      <span>{label}</span>
      <span className="text-white font-mono">{value.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/60">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${color} transition-all duration-300`}
      />
    </div>
  </div>
);

const SpecItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors">
    <div className="bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/60 flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
      <span className="block text-xs font-black text-white uppercase truncate">{value}</span>
    </div>
  </div>
);
