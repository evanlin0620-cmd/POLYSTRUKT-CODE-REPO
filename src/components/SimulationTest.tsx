import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Activity, Cpu, Database, RefreshCw, X, 
  Terminal, ShieldCheck, AlertCircle, Gauge, 
  Layers, Box, LayoutGrid, ChevronRight, Play, Pause
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
          <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border transition-colors ${
            taskState === 'SYNTHESIS' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' :
            taskState === 'ANALYSIS' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
            taskState === 'OPTIMIZING' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
            'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}>
            {taskState}
          </div>
          {speed > 0 && (
            <div className="text-[6px] text-zinc-600 font-mono">
              ADDR: 0x{index.toString(16).padStart(4, '0')}...
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
            opacity={0.8}
            emissive={color}
            emissiveIntensity={taskState === 'ANALYSIS' ? 1.5 : 0.2}
          />
        </mesh>
        
        {/* Wireframe overlay for analysis state */}
        {taskState === 'ANALYSIS' && (
          <mesh rotation={meshRef.current?.rotation}>
             <torusKnotGeometry args={[0.62, 0.21, 64, 8]} />
             <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
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
        "ALERT: High thermal output detected in core 7"
      ];
      addLog(diagnosticMsgs[Math.floor(Math.random() * diagnosticMsgs.length)]);
    }, 800);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 text-white flex flex-col font-mono overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,1)_1px,transparent_0)] bg-[size:32px_32px]" />
      </div>

      {/* Top Benchmark Header */}
      <header className="p-6 border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isRunning ? 'bg-orange-500 animate-pulse' : 'bg-zinc-800'} transition-colors`}>
            <Gauge size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] font-unique">AI Kernel Stress Test</h1>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Scientific Version 2.4.0-stable // Hardware-Acceleration Active</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isRunning ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/20'}`}
          >
            {isRunning ? <><Pause size={14} /> Stop Benchmark</> : <><Play size={14} /> Run Stress Test</>}
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Diagnostic Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Metrics & Iterations */}
        <aside className="w-80 border-r border-white/10 p-8 flex flex-col gap-10 bg-zinc-900/20">
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Compute Load</h2>
            <div className="space-y-4">
              <MetricBar label="AI Core Load" value={stats.cpu} color="bg-orange-500" />
              <MetricBar label="Neural Memory" value={stats.memory} color="bg-purple-500" />
              <MetricBar label="Physics Pipeline" value={stats.gpu} color="bg-blue-500" />
            </div>
          </div>

          <div className="space-y-2">
             <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Synthesis Cycles</h2>
             <div className="text-5xl font-black tabular-nums tracking-tighter text-white">
               {iterations.toLocaleString()}
             </div>
             <div className="flex items-center gap-2 text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
               <Activity size={10} /> Stable Performance
             </div>
          </div>

          <div className="mt-auto space-y-4">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Diagnostics</h2>
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[9px] text-emerald-400/60 h-48 overflow-hidden flex flex-col-reverse gap-2">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>

        {/* Center: Stress Visualization */}
        <section className="flex-1 relative bg-black">
           {!isRunning && (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center space-y-4 max-w-sm px-8">
                   <Zap size={48} className="text-zinc-700 mx-auto mb-4" />
                   <h3 className="text-xl font-black uppercase tracking-tighter">Ready for Injection</h3>
                   <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-widest">
                     The scientific kernel is optimized for high-speed geometry synthesis. Click 'Run' to begin the AI engine stress test.
                   </p>
                </div>
             </div>
           )}
           
           <div className="absolute top-8 left-8 z-10 flex gap-4">
              <div className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg backdrop-blur-md">
                 <span className="text-[9px] text-zinc-500 block uppercase mb-1">Latency</span>
                 <span className="text-xs font-black text-white">{stats.latency}</span>
              </div>
              <div className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg backdrop-blur-md">
                 <span className="text-[9px] text-zinc-500 block uppercase mb-1">Stability</span>
                 <span className="text-xs font-black text-emerald-400">99.9%</span>
              </div>
           </div>

           <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
              <color attach="background" args={['#050505']} />
              <ambientLight intensity={0.2} />
              <spotLight position={[10, 10, 10]} intensity={1.5} />
              <Environment preset="night" />
              
              {/* Technical Testing Grid */}
              <gridHelper args={[20, 20, 0x333333, 0x111111]} position={[0, -5, 0]} />
              
              <AnimatePresence>
                {isRunning && (
                  <group>
                    {/* A grid of "stress objects" */}
                    {[-4, 0, 4].map((x, xi) => (
                      [-3, 0, 3].map((y, yi) => (
                        <group key={`${x}-${y}`}>
                          <TestObject 
                            color={y > 0 ? '#8b5cf6' : x === 0 ? '#f97316' : '#3b82f6'} 
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

           <div className="absolute bottom-8 right-8 z-10 text-[9px] text-zinc-700 uppercase tracking-[0.5em] vertical-text">
             SYSTEM_STRESS_PREVIEW_MODE
           </div>
        </section>

        {/* Right: Validation Specs */}
        <aside className="w-80 border-l border-white/10 p-8 flex flex-col gap-8 bg-zinc-900/20 overflow-y-auto">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Validation Specs</h2>
          
          <SpecItem label="Thermal Threshold" value="84.2°C" icon={<ShieldCheck className="text-emerald-500" size={14} />} />
          <SpecItem label="Vertex Capacity" value="2.4M / sec" icon={<Layers className="text-blue-500" size={14} />} />
          <SpecItem label="Kernel Stability" value="Validated" icon={<Cpu className="text-purple-500" size={14} />} />
          
          <div className="h-px bg-white/5 my-2" />
          
          <div className="space-y-4">
            <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Active Benchmarks</h3>
            {[
               { name: "Fluid Mesh Real-time", value: "PASSED" },
               { name: "CSG Topology Reduction", value: "ACTIVE" },
               { name: "Neural Geometry Warp", value: "PENDING" },
               { name: "Tensor Core Alignment", value: "PASSED" }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase tracking-widest">{item.name}</span>
                <span className={`font-black ${item.value === 'PASSED' ? 'text-emerald-400' : item.value === 'ACTIVE' ? 'text-orange-400' : 'text-zinc-600'}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex gap-3">
             <AlertCircle className="text-orange-500 flex-shrink-0" size={16} />
             <p className="text-[9px] text-zinc-400 leading-relaxed italic uppercase">
               Simulation result: The AI kernel demonstrates optimal multi-threaded performance under extreme stress conditions.
             </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-400 tracking-widest">
      <span>{label}</span>
      <span>{value.toFixed(1)}%</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

const SpecItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
    <div className="bg-zinc-800 p-2 rounded-lg transition-transform group-hover:scale-110">
      {icon}
    </div>
    <div>
      <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className="block text-xs font-black text-white uppercase">{value}</span>
    </div>
  </div>
);
