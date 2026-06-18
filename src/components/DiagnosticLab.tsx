import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  FlaskConical, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Activity, 
  Database,
  ChevronRight,
  Loader2,
  TrendingUp,
  History,
  X as CloseIcon,
  MessageSquare,
  Cpu,
  Layers,
  ShieldCheck,
  CreditCard,
  Mail,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface TestCase {
  id: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  rating?: 'success' | 'fail';
  feedback?: string;
  engine?: string;
}

const INITIAL_TESTS: TestCase[] = [
  { id: '1', prompt: 'Modular drone chassis with integrated battery bay and arm mounts', status: 'pending', engine: 'Gemini 3.5 Flash' },
  { id: '2', prompt: 'Lightweight titanium bracket for automotive suspension', status: 'pending', engine: 'Gemini 3.5 Flash' },
  { id: '3', prompt: 'Minimalist aerodynamic bicycle stem with cable integration', status: 'pending', engine: 'Gemini 3.5 Flash' },
  { id: '4', prompt: 'Bio-inspired heat sink for high-performance processors', status: 'pending', engine: 'Nano Banana 2.0' },
  { id: '5', prompt: 'Industrial robotic gripper head with variable pressure channels', status: 'pending', engine: 'Nano Banana 2.0' },
];

export const DiagnosticLab = ({ onClose }: { onClose: () => void }) => {
  const token = useAuth(state => state.token);
  const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TESTS);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMcp, setIsLoadingMcp] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'history' | 'mcp'>('tests');
  const [statusNotification, setStatusNotification] = useState<{ message: string; type: 'success' | 'err' } | null>(null);
  
  // Custom calibration input fields
  const [newPrompt, setNewPrompt] = useState('');
  const [newEngine, setNewEngine] = useState('Nano Banana 2.0');
  const [isAdding, setIsAdding] = useState(false);

  const showNotification = (message: string, type: 'success' | 'err' = 'success') => {
    setStatusNotification({ message, type });
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/evaluations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load evaluation history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchMcpTools = async () => {
    setIsLoadingMcp(true);
    try {
      const res = await fetch('/api/mcp/tools', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMcpTools(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load MCP registry");
    } finally {
      setIsLoadingMcp(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchMcpTools();
  }, [token]);

  const runTest = async (testId: string, customEngine?: string) => {
    const test = testCases.find(t => t.id === testId);
    if (!test) return;

    const chosenEngine = customEngine || test.engine || 'Gemini 3.5 Flash';

    setTestCases(prev => prev.map(t => t.id === testId ? { ...t, status: 'running', engine: chosenEngine } : t));
    setActiveTest(testId);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          prompt: test.prompt,
          engine: chosenEngine
        })
      });

      const { jobId } = await res.json();
      
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/generate/status/${jobId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const statusData = await statusRes.json();
          
          if (statusData.state === 'completed') {
            clearInterval(poll);
            setTestCases(prev => prev.map(t => t.id === testId ? { 
              ...t, 
              status: 'completed', 
              engine: chosenEngine,
              result: { ...statusData.result, jobId } 
            } : t));
          } else if (statusData.state === 'failed') {
            clearInterval(poll);
            setTestCases(prev => prev.map(t => t.id === testId ? { ...t, status: 'failed', engine: chosenEngine } : t));
          }
        } catch (e) {
          clearInterval(poll);
          setTestCases(prev => prev.map(t => t.id === testId ? { ...t, status: 'failed', engine: chosenEngine } : t));
        }
      }, 3000);

    } catch (e) {
      setTestCases(prev => prev.map(t => t.id === testId ? { ...t, status: 'failed' } : t));
    }
  };

  const submitEvaluation = async (testId: string, rating: 'success' | 'fail', feedback: string) => {
    const test = testCases.find(t => t.id === testId);
    if (!test || !test.result) return;

    const engineToSubmit = test.engine || test.result.engine || 'Gemini 3.5 Flash';

    try {
      await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: test.result.jobId,
          rating,
          feedback,
          prompt: test.prompt,
          result: { ...test.result, engine: engineToSubmit }
        })
      });

      setTestCases(prev => prev.map(t => t.id === testId ? { ...t, rating, feedback } : t));
      fetchHistory(); // Refresh history
      showNotification(`Synthesis categorized as ${rating.toUpperCase()}. Nano Calibration synchronized.`, 'success');
    } catch (e) {
      showNotification("Failed to submit evaluation", 'err');
    }
  };

  const currentSuccessRate = evaluations.length > 0 
    ? Math.round((evaluations.filter(e => e.rating === 'success').length / evaluations.length) * 100) 
    : 88;

  const handleCreateCustomTest = () => {
    if (!newPrompt.trim()) return;
    const testId = Math.random().toString(36).substring(7);
    const customCase: TestCase = {
      id: testId,
      prompt: newPrompt,
      status: 'pending',
      engine: newEngine
    };
    setTestCases(prev => [customCase, ...prev]);
    setNewPrompt('');
    setIsAdding(false);
    showNotification("Custom calibration prompt saved. Ready to run.", "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent)] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative z-10 bg-zinc-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
            <FlaskConical className="text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black font-unique tracking-tighter uppercase">Synthesis Diagnostic Lab</h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Accuracy Training & Quality Control Framework</p>
          </div>
        </div>

        {statusNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-4 py-2.5 rounded-2xl border text-[10px] font-mono uppercase tracking-widest hidden md:block ${
              statusNotification.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {statusNotification.message}
          </motion.div>
        )}
        
        <button 
          onClick={onClose}
          className="p-3 hover:bg-white/5 rounded-full transition-colors"
        >
          <CloseIcon size={24} className="text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar Tabs */}
        <div className="w-24 border-r border-white/5 flex flex-col items-center py-8 gap-8">
            <button 
              onClick={() => setActiveTab('tests')}
              className={`p-4 rounded-2xl transition-all ${activeTab === 'tests' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Activity size={24} />
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`p-4 rounded-2xl transition-all ${activeTab === 'history' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <History size={24} />
            </button>
            <button 
              onClick={() => setActiveTab('mcp')}
              className={`p-4 rounded-2xl transition-all ${activeTab === 'mcp' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Cpu size={24} />
            </button>
            <div className="mt-auto p-4 text-zinc-800">
               <Database size={24} />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'tests' ? (
              <motion.div 
                key="tab-tests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-6 text-zinc-100"
              >
                {/* Calibration Dashboard Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">MODEL DEEP LEARNING ACCURACY</span>
                      <h4 className="text-3xl font-black text-white font-mono mt-1">{currentSuccessRate}%</h4>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono mt-4 uppercase">CALCULATED FROM ACTIVE CALIBRATION SETS</p>
                  </div>

                  <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">CALIBRATION TRIALS RECORDED</span>
                      <h4 className="text-3xl font-black text-purple-400 font-mono mt-1">{evaluations.length}</h4>
                    </div>
                    <div className="flex gap-2.5 mt-4">
                      <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                        {evaluations.filter(e => e.rating === 'success').length} OK
                      </span>
                      <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                        {evaluations.filter(e => e.rating === 'fail').length} KO
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-900 border border-white/5 rounded-3xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">NANO BANANA 2.0 CALIBRATION</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <h4 className="text-lg font-black text-white font-mono uppercase">ONLINE & ACTIVE</h4>
                      </div>
                    </div>
                    <p className="text-[9px] text-cyan-400/80 font-mono mt-4 leading-relaxed uppercase">
                      Experimenal TPMS/trabecular micro-structuring engine calibrated on {evaluations.filter(e => e.engine === 'Nano Banana 2.0').length} trials
                    </p>
                  </div>
                </div>

                {/* Enqueue Custom Diagnostic Test Form */}
                <div className="p-6 bg-zinc-900 border border-white/10 rounded-[2.5rem] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100">Optimizing Deep Learning Calibration</h3>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">Submit precise 3D engineering prompts to calibrate synthesis thresholds</p>
                    </div>
                    <button
                      onClick={() => setIsAdding(!isAdding)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isAdding ? 'bg-zinc-800 text-zinc-400' : 'bg-purple-600/30 text-purple-400 border border-purple-500/20 hover:bg-purple-600/50'}`}
                    >
                      {isAdding ? 'Cancel Calibration' : '+ Feed Custom Data'}
                    </button>
                  </div>

                  {isAdding && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-2 border-t border-white/5"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">Target Objective Prompt (3D Geometry & Material Specs & Constraints)</label>
                        <textarea
                          value={newPrompt}
                          onChange={(e) => setNewPrompt(e.target.value)}
                          placeholder="e.g., Ultra-light titanium bracket using gyroid lattices with an offset connection tab for load directions..."
                          className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none min-h-[90px]"
                        />
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-500">Selected Engine Core:</span>
                          <div className="flex gap-2">
                            {['Gemini 3.5 Flash', 'Nano Banana 2.0'].map((eng) => (
                              <button
                                key={eng}
                                type="button"
                                onClick={() => setNewEngine(eng)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${newEngine === eng ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/30' : 'bg-transparent text-zinc-500 border-white/5 hover:text-white'}`}
                              >
                                {eng}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleCreateCustomTest}
                          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-950/25"
                        >
                          Enqueue Calibration Prompt
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {testCases.map((test) => (
                    <TestItem 
                      key={test.id} 
                      test={test} 
                      onRun={(engine) => runTest(test.id, engine)} 
                      onEvaluate={(r, f) => submitEvaluation(test.id, r, f)}
                    />
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'history' ? (
              <motion.div 
                key="tab-history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-unique font-black uppercase tracking-tight">Reinforcement History</h2>
                   <div className="flex gap-4">
                      <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[10px] font-black uppercase tracking-widest">
                        {evaluations.filter(e => e.rating === 'success').length} SUCCESSES
                      </div>
                      <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest">
                        {evaluations.filter(e => e.rating === 'fail').length} FAILURES
                      </div>
                   </div>
                </div>

                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-20">
                     <Loader2 className="animate-spin text-purple-500" size={32} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evaluations.slice().reverse().map((evalItem, idx) => (
                      <HistoryItem key={idx} item={evalItem} />
                    ))}
                    {evaluations.length === 0 && (
                      <div className="py-20 text-center border border-white/5 bg-white/2 rounded-3xl">
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">No diagnostic records yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="tab-mcp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-xl font-unique font-black uppercase tracking-tight">MCP Neural Ops Servers</h2>
                     <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Model Context Protocol Integration Mesh</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        CORE_OPS_ACTIVE
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <ShieldCheck size={18} className="text-blue-400" />
                         </div>
                         <h3 className="text-sm font-black uppercase tracking-widest">AuthMCP Server</h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-mono uppercase">Handles identity verification & credential lifecycle management within the synthesis environment.</p>
                   </div>
                   <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                            <CreditCard size={18} className="text-green-400" />
                         </div>
                         <h3 className="text-sm font-black uppercase tracking-widest">PaymentMCP Server</h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-mono uppercase">Processes neural compute allocations and financial transactions for the Polystrukt cloud.</p>
                   </div>
                   <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <Mail size={18} className="text-amber-400" />
                         </div>
                         <h3 className="text-sm font-black uppercase tracking-widest">EmailMCP Server</h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-mono uppercase">Transmits technical synthesis reports and CAD documentation via encrypted mesh network.</p>
                   </div>
                   <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <Users size={18} className="text-purple-400" />
                         </div>
                         <h3 className="text-sm font-black uppercase tracking-widest">UserMCP Server</h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-mono uppercase">Manages engineering profiles and specialized record metadata across the distributed cluster.</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 px-2">Registered Protocol Tools ({mcpTools.length})</h3>
                   {isLoadingMcp ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="animate-spin text-purple-500" size={24} />
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {mcpTools.map((tool, idx) => (
                           <div key={idx} className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="p-2 bg-white/5 rounded-lg">
                                    <Terminal size={14} className="text-zinc-400" />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-bold text-white font-mono">{tool.name}</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{tool.description}</p>
                                 </div>
                              </div>
                              <ChevronRight size={16} className="text-zinc-700 group-hover:text-purple-500 transition-colors" />
                           </div>
                        ))}
                      </div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const TestItem = ({ test, onRun, onEvaluate }: { test: TestCase, onRun: (engine: string) => void, onEvaluate: (r: 'success' | 'fail', f: string) => void }) => {
  const [feedback, setFeedback] = useState('');
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState(test.engine || 'Nano Banana 2.0');

  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${test.status === 'completed' ? 'bg-zinc-900 border-white/10' : 'bg-transparent border-white/5'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
             <span className="text-[10px] font-mono text-zinc-600">PROMT CASE #{test.id}</span>
             <StatusBadge status={test.status} />
             {test.engine && (
               <span className={`px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-wider ${test.engine === 'Nano Banana 2.0' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/10' : 'bg-zinc-800 text-zinc-400 border border-white/5'}`}>
                 {test.engine}
               </span>
             )}
          </div>
          <h3 className="text-base font-medium text-white">{test.prompt}</h3>
        </div>

        {test.status === 'pending' && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-white/5">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider pl-1.5">ENGINE:</span>
              {['Gemini 3.5 Flash', 'Nano Banana 2.0'].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setSelectedEngine(e)}
                  className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${selectedEngine === e ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-transparent text-zinc-600'}`}
                >
                  {e.includes('Banana') ? '⚠️ Banana 2.0' : 'Flash'}
                </button>
              ))}
            </div>

            <button 
              onClick={() => onRun(selectedEngine)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md"
            >
              <Play size={12} fill="currentColor" />
              Initiate
            </button>
          </div>
        )}

        {test.status === 'running' && (
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 text-zinc-400 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/5">
            <Loader2 size={14} className="animate-spin text-purple-400" />
            Synthesizing
          </div>
        )}

        {test.status === 'completed' && !test.rating && (
          <div className="flex gap-2">
             <button 
               onClick={() => setShowEvalForm(true)}
               className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border border-white/5"
             >
               Evaluate Result
             </button>
          </div>
        )}

        {test.rating && (
          <div className={`px-6 py-3 rounded-xl border flex items-center gap-2 ${test.rating === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {test.rating === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span className="font-black uppercase text-[10px] tracking-widest">{test.rating === 'success' ? 'SUCCESS' : 'FAILURE'}</span>
          </div>
        )}
      </div>

      {showEvalForm && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-white/5 space-y-4"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Categorization & Feedback</label>
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Why is this a success or fail? (e.g. Inaccurate ribbing, excellent boolean nesting...)"
              className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 text-sm focus:border-purple-500 focus:outline-none min-h-[100px]"
            />
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => { onEvaluate('success', feedback); setShowEvalForm(false); }}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
            >
              <CheckCircle2 size={16} /> Record Success
            </button>
            <button 
              onClick={() => { onEvaluate('fail', feedback); setShowEvalForm(false); }}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
            >
              <AlertCircle size={16} /> Record Fail
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const HistoryItem = ({ item }: { item: any }) => {
  return (
    <div className="p-6 bg-zinc-900 border border-white/5 rounded-[2rem] space-y-4 text-zinc-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${item.rating === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">{new Date(item.timestamp).toLocaleString()}</span>
          {item.engine && (
            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-wider ${item.engine === 'Nano Banana 2.0' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-zinc-850 text-zinc-400'}`}>
              {item.engine}
            </span>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${item.rating === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {item.rating?.toUpperCase() || 'Calibration Completed'}
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">Target Objective</h4>
        <p className="text-white text-sm">{item.prompt}</p>
      </div>
      {item.feedback && (
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl">
          <div className="flex gap-3">
            <MessageSquare size={14} className="text-zinc-600 mt-0.5" />
            <p className="text-zinc-400 text-xs italic">"{item.feedback}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const configs: any = {
    pending: { color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20', label: 'Queued' },
    running: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Processing' },
    completed: { color: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Analyzed' },
    failed: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Error' },
  };
  const config = configs[status] || configs.pending;

  return (
    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${config.color}`}>
      {config.label}
    </span>
  );
};
