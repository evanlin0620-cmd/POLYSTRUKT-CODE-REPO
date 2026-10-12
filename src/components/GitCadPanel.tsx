import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, GitBranch, GitCommit, GitMerge, FileCode, Check, 
  RotateCcw, Sparkles, ChevronRight, AlertTriangle, ArrowRight,
  Database, RefreshCw, Layers, Plus, Info, Terminal
} from 'lucide-react';
import { ProceduralSpec } from '../types';

interface GitCadPanelProps {
  onClose: () => void;
  currentDesign: any;
  onApplySpec: (spec: ProceduralSpec, changeLog: string) => void;
}

interface Commit {
  hash: string;
  branch: string;
  message: string;
  author: string;
  timestamp: string;
  spec: ProceduralSpec;
}

interface Branch {
  name: string;
  baseCommit: string;
}

export const GitCadPanel: React.FC<GitCadPanelProps> = ({ 
  onClose, 
  currentDesign,
  onApplySpec
}) => {
  const currentSpec = currentDesign?.proceduralSpec;
  
  // Hardcoded high-fidelity CAD branch database representing evolution
  const [branches, setBranches] = useState<Branch[]>([
    { name: 'main', baseCommit: 'commit-root' },
    { name: 'feature/honeycomb-voids', baseCommit: 'commit-2' },
    { name: 'optimize/mass-reduction', baseCommit: 'commit-3' }
  ]);
  const [activeBranch, setActiveBranch] = useState<string>('main');
  const [newBranchName, setNewBranchName] = useState('');
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [diffBase, setDiffBase] = useState<string>('commit-2');
  const [diffTarget, setDiffTarget] = useState<string>('commit-current');

  // Realistic mock specs for different commits
  const mockRootSpec: ProceduralSpec = {
    op: "subtract" as const,
    a: {
      type: "cylinder" as const,
      args: [40, 40, 30, 32] as [number, number, number, number],
      color: "#818cf8"
    },
    b: {
      type: "cylinder" as const,
      args: [30, 30, 40, 32] as [number, number, number, number]
    }
  };

  const mockHoneycombSpec: ProceduralSpec = {
    op: "subtract" as const,
    a: {
      type: "cylinder" as const,
      args: [40, 40, 30, 64] as [number, number, number, number], // smoothed segments
      color: "#818cf8"
    },
    b: {
      op: "group" as const,
      children: [
        { type: "cylinder" as const, args: [30, 30, 40, 32] as [number, number, number, number], position: [0, 0, 0] as [number, number, number] },
        { type: "cylinder" as const, args: [4, 4, 50, 16] as [number, number, number, number], position: [15, 15, 0] as [number, number, number] },
        { type: "cylinder" as const, args: [4, 4, 50, 16] as [number, number, number, number], position: [-15, 15, 0] as [number, number, number] },
        { type: "cylinder" as const, args: [4, 4, 50, 16] as [number, number, number, number], position: [15, -15, 0] as [number, number, number] },
        { type: "cylinder" as const, args: [4, 4, 50, 16] as [number, number, number, number], position: [-15, -15, 0] as [number, number, number] }
      ]
    }
  };

  const mockOptimizedSpec: ProceduralSpec = {
    op: "subtract" as const,
    a: {
      type: "cylinder" as const,
      args: [36, 36, 25, 32] as [number, number, number, number], // lightened wall/thickness envelope
      color: "#34d399"
    },
    b: {
      type: "cylinder" as const,
      args: [28, 28, 35, 32] as [number, number, number, number]
    }
  };

  // Commit history logs tracking evolution
  const [commits, setCommits] = useState<Commit[]>([
    {
      hash: "commit-root",
      branch: "main",
      message: "Initialize primary volume envelope spec (baseline dimensions)",
      author: "Lead Structural Engineer",
      timestamp: "2026-06-12 10:24:11",
      spec: mockRootSpec
    },
    {
      hash: "commit-2",
      branch: "main",
      message: "Extend circular hole subtraction specs for axle bearing tolerance",
      author: "Lead Structural Engineer",
      timestamp: "2026-06-13 14:15:32",
      spec: mockRootSpec
    },
    {
      hash: "commit-3",
      branch: "feature/honeycomb-voids",
      message: "Topology study: introduce auxiliary weight alleviation voids",
      author: "Generative AI Optimizer",
      timestamp: "2026-06-14 09:30:15",
      spec: mockHoneycombSpec
    },
    {
      hash: "commit-4",
      branch: "optimize/mass-reduction",
      message: "Refine shell wall boundaries to minimize raw billet tooling steps",
      author: "Automation Pipeline Agent",
      timestamp: "2026-06-15 11:45:00",
      spec: mockOptimizedSpec
    }
  ]);

  // Combine default with current design spec as an unsaved or dynamic commit
  const allCommits = useMemo(() => {
    const defaultCommits = [...commits];
    if (currentSpec) {
      defaultCommits.unshift({
        hash: "commit-current",
        branch: activeBranch,
        message: "STAGED CURRENT SPEC: " + (currentDesign?.name || "Active Geometry Workspace"),
        author: "You (Active session designer)",
        timestamp: "Active workspace buffer",
        spec: currentSpec
      });
    }
    return defaultCommits;
  }, [commits, currentSpec, activeBranch, currentDesign]);

  const handleCreateBranch = () => {
    if (!newBranchName) return;
    const sanitizedName = newBranchName.trim().replace(/\s+/g, '-').toLowerCase();
    const newB: Branch = {
      name: sanitizedName,
      baseCommit: allCommits[0]?.hash || 'commit-root'
    };
    setBranches([...branches, newB]);
    setActiveBranch(sanitizedName);
    setNewBranchName('');
    setShowCreateBranch(false);
  };

  const handleCommit = () => {
    if (!commitMessage || !currentSpec) return;
    const newC: Commit = {
      hash: `commit-${Math.random().toString(36).substring(7)}`,
      branch: activeBranch,
      message: commitMessage.trim(),
      author: "You (Active Workspace)",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      spec: currentSpec
    };
    setCommits([newC, ...commits]);
    setCommitMessage('');
  };

  // Automated Diff calculation engine checking differences in dimensions & shapes
  const diffExplanation = useMemo(() => {
    const baseC = allCommits.find(c => c.hash === diffBase);
    const targetC = allCommits.find(c => c.hash === diffTarget);

    if (!baseC || !targetC) return { changes: [], stats: { added: 0, removed: 0 } };

    const baseSpec = baseC.spec;
    const targetSpec = targetC.spec;

    const changes: Array<{ label: string; from: string; to: string; status: 'modified' | 'added' | 'removed' | 'equal' }> = [];
    let addedCount = 0;
    let removedCount = 0;

    // Recursive spec walker to fetch dimensions
    const getPrimitiveProperties = (spec: any, path: string) => {
      if (!spec) return;
      if (spec.type && spec.args) {
        changes.push({
          label: `${path} Sub-Part Geometric Profile`,
          from: spec.type.toUpperCase(),
          to: spec.type.toUpperCase(),
          status: 'equal'
        });
        changes.push({
          label: `${path} Boundary Dimensions (args)`,
          from: `[${spec.args.join(', ')}] mm`,
          to: `[${spec.args.join(', ')}] mm`,
          status: 'modified'
        });
      } else if (spec.op) {
        changes.push({
          label: `${path} CSG Boolean Operation`,
          from: spec.op.toUpperCase(),
          to: spec.op.toUpperCase(),
          status: 'equal'
        });
        getPrimitiveProperties(spec.a, `${path} -> Block A`);
        getPrimitiveProperties(spec.b, `${path} -> Block B`);
      }
    };

    // Quick structural diff analysis
    if (JSON.stringify(baseSpec) === JSON.stringify(targetSpec)) {
      changes.push({
        label: "Topology Tree Comparison",
        from: "Full Spec Match",
        to: "Full Spec Match",
        status: 'equal'
      });
    } else {
      // Direct property level check of the outer elements
      const baseA = (baseSpec as any).a;
      const targetA = (targetSpec as any).a;
      if (baseA && targetA) {
        if (JSON.stringify(baseA.args) !== JSON.stringify(targetA.args)) {
          changes.push({
            label: "Outer Envelope Dimensions (Radius/Depth)",
            from: baseA.args ? `[${baseA.args.join(', ')}]` : "N/A",
            to: targetA.args ? `[${targetA.args.join(', ')}]` : "N/A",
            status: 'modified'
          });
          addedCount++;
        }
        if (baseA.color !== targetA.color) {
          changes.push({
            label: "Outer Material Albedo Color Profile",
            from: baseA.color || "Default Gray",
            to: targetA.color || "Default Gray",
            status: 'modified'
          });
        }
      }

      const baseB = (baseSpec as any).b;
      const targetB = (targetSpec as any).b;
      if (baseB && targetB) {
        if (baseB.op === 'group' && targetB.op !== 'group') {
          changes.push({
            label: "Subtracted Geometry Cluster",
            from: `${baseB.children?.length || 0} subtracting voids`,
            to: "Single shape void",
            status: 'removed'
          });
          removedCount += baseB.children?.length || 1;
        } else if (baseB.op !== 'group' && targetB.op === 'group') {
          changes.push({
            label: "Topology Voids Matrix Group",
            from: "Single void cutout",
            to: `${targetB.children?.length || 0} discrete alleviations`,
            status: 'added'
          });
          addedCount += targetB.children?.length || 1;
        } else if (baseB.op === 'group' && targetB.op === 'group') {
          const delta = (targetB.children?.length || 0) - (baseB.children?.length || 0);
          if (delta !== 0) {
            changes.push({
              label: "Alleviation Cutout Count Variance",
              from: `${baseB.children?.length || 0} holes`,
              to: `${targetB.children?.length || 0} holes`,
              status: delta > 0 ? 'added' : 'removed'
            });
            if (delta > 0) addedCount += delta;
            else removedCount += Math.abs(delta);
          } else {
            changes.push({
              label: "Void array density coordinates",
              from: "Baseline grid positions",
              to: "Aligned coordinate grid updates",
              status: 'modified'
            });
          }
        }
      }
    }

    return { changes, stats: { added: addedCount, removed: removedCount } };
  }, [allCommits, diffBase, diffTarget]);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-zinc-950/95 border-l border-white/10 backdrop-blur-md shadow-2xl flex flex-col font-sans text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <GitBranch size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-100">Git-for-CAD Repository Hub</h2>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Procedural Spec Versioning & High-Fidelity Branch Diffing</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/5 border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Column */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Branch Switcher */}
        <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Branch:</span>
              <div className="flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                <GitBranch size={11} /> {activeBranch}
              </div>
            </div>
            
            <button 
              onClick={() => setShowCreateBranch(!showCreateBranch)}
              className="flex items-center gap-1 text-[9px] font-mono text-indigo-400 hover:text-white uppercase tracking-widest cursor-pointer transition-all"
            >
              <Plus size={12} /> New Branch
            </button>
          </div>

          <AnimatePresence>
            {showCreateBranch && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden bg-black/30 p-3 rounded-2xl border border-white/5"
              >
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="e.g. refactor/internal-ribs"
                    className="flex-1 text-[9.5px] font-mono text-white placeholder:text-zinc-650 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-left focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleCreateBranch}
                    className="p-2 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Branch list capsule clicks */}
          <div className="flex flex-wrap gap-2 pt-1.5">
            {branches.map(b => (
              <button
                key={b.name}
                onClick={() => setActiveBranch(b.name)}
                className={`px-3 py-1.5 rounded-xl border font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                  activeBranch === b.name 
                    ? 'bg-zinc-800 text-white border-white/15 shadow-md' 
                    : 'bg-zinc-950/60 text-zinc-500 border-white/5 hover:text-zinc-300 hover:border-white/10'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Commit message input block */}
        {currentSpec && (
          <div className="p-4 rounded-3xl bg-zinc-900 border border-white/5 space-y-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Commit Active Geometry Spec CHANGES</span>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Enter technical commit message (e.g., Optimize thermal flow volume)"
                className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-[9.5px] font-mono placeholder:text-zinc-600 focus:outline-none text-left focus:border-indigo-500"
              />
              <button
                onClick={handleCommit}
                disabled={!commitMessage.trim()}
                className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)] text-white text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:hover:shadow-none"
              >
                <GitCommit size={13} /> Commit
              </button>
            </div>
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
              Staging: current workspace model parameters will be locked into the <strong className="text-zinc-400">{activeBranch}</strong> timeline.
            </p>
          </div>
        )}

        {/* Diff Tool Section */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Parametric Branch Diff tool</span>
              <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase">ASME/Git Aligned</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-mono text-green-400">+{diffExplanation.stats.added} modifications</span>
              <span className="text-zinc-650 font-mono text-[8px] mx-1">/</span>
              <span className="text-[8px] font-mono text-red-400">-{diffExplanation.stats.removed} reductions</span>
            </div>
          </div>

          {/* Select commits to compare */}
          <div className="grid grid-cols-2 gap-3 bg-black/45 p-3 rounded-2xl border border-white/5 font-mono text-[9px]">
            <div className="space-y-1">
              <label className="text-zinc-500 uppercase font-bold tracking-widest text-[8px] block">Baseline Spec (Parent)</label>
              <select
                value={diffBase}
                onChange={(e) => setDiffBase(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-zinc-300"
              >
                {allCommits.map(c => (
                  <option key={c.hash} value={c.hash}>{c.hash.substring(0,8)} - {c.message.substring(0,25)}...</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-zinc-500 uppercase font-bold tracking-widest text-[8px] block">Compare Target (Active)</label>
              <select
                value={diffTarget}
                onChange={(e) => setDiffTarget(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer text-zinc-300"
              >
                {allCommits.map(c => (
                  <option key={c.hash} value={c.hash}>{c.hash.substring(0,8)} - {c.message.substring(0,25)}...</option>
                ))}
              </select>
            </div>
          </div>

          {/* Structural Diff Table */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {diffExplanation.changes.map((change, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-xl border text-[9px] font-mono flex flex-col gap-1 ${
                  change.status === 'modified' 
                    ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-300' 
                    : change.status === 'added' 
                    ? 'bg-green-500/5 border-green-500/20 text-green-300' 
                    : change.status === 'removed' 
                    ? 'bg-red-500/5 border-red-500/20 text-red-300'
                    : 'bg-zinc-950/40 border-white/5 text-zinc-400'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="uppercase tracking-wider">{change.label}</span>
                  <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-black ${
                    change.status === 'modified' ? 'bg-yellow-400/10' : change.status === 'added' ? 'bg-green-500/15' : change.status === 'removed' ? 'bg-red-500/15' : 'bg-white/5'
                  }`}>
                    {change.status}
                  </span>
                </div>
                
                {change.status !== 'equal' && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-zinc-500 max-w-[150px] truncate">{change.from}</span>
                    <ArrowRight size={10} className="text-zinc-650 shrink-0" />
                    <span className="font-semibold text-zinc-200">{change.to}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Apply comparison target block */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => {
                const targetC = allCommits.find(c => c.hash === diffTarget);
                if (targetC && targetC.spec) {
                  onApplySpec(targetC.spec, `Restored Version: ${targetC.message}`);
                }
              }}
              className="px-4 py-2 hover:bg-indigo-600 border border-indigo-500/40 rounded-xl text-indigo-400 hover:text-white font-mono text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={12} /> Apply Chosen Target parameters
            </button>
          </div>
        </div>

        {/* Repository Timeline Log Graph */}
        <div className="space-y-3">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Repository Evolution Timeline</span>
          
          <div className="space-y-4 relative border-l border-white/5 ml-3 pl-5 py-1">
            {allCommits.map((cmt, idx) => (
              <div key={cmt.hash} className="relative group transition-all">
                {/* Visual Branch Dot */}
                <div className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 shadow-md ${
                  cmt.hash === 'commit-current' 
                    ? 'bg-blue-400 border-zinc-950 animate-pulse ring-2 ring-blue-500/25' 
                    : cmt.branch === 'main' 
                    ? 'bg-zinc-900 border-indigo-450' 
                    : 'bg-zinc-900 border-purple-500'
                }`}>
                  <div className="w-1 h-1 rounded-full bg-white/70" />
                </div>

                {/* Commit content card */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  cmt.hash === 'commit-current' 
                    ? 'bg-blue-500/5 border-blue-500/20 shadow-[0_4px_25px_rgba(59,130,246,0.06)]' 
                    : 'bg-zinc-900 border-white/5 hover:border-white/10 hover:bg-zinc-800/40'
                }`}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-zinc-500 font-bold tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/5">
                          {cmt.hash.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                          on sub-branch: {cmt.branch}
                        </span>
                      </div>
                      <h4 className="text-[10px] font-bold text-zinc-100 leading-normal">{cmt.message}</h4>
                    </div>

                    <span className="text-[8px] font-mono text-zinc-500 whitespace-nowrap uppercase tracking-wider">
                      {cmt.timestamp.split(' ')[1] || cmt.timestamp}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.03] font-mono text-[8px] text-zinc-500 uppercase tracking-wider">
                    <span>MD5 SIG: {cmt.author}</span>
                    <button
                      onClick={() => onApplySpec(cmt.spec, `Restored Commit: ${cmt.message}`)}
                      className="text-indigo-400 hover:text-white uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center gap-1"
                    >
                      Restore Parameters <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer console */}
      <div className="p-4 border-t border-white/5 bg-black/60 flex items-center gap-3 font-mono text-[8px] text-zinc-500">
        <Terminal size={12} className="text-zinc-600 shrink-0" />
        <span className="uppercase tracking-wider">SECURE GIT-CAD SUBSYSTEM ONLINE // PARALLAX CLOUDSYNC STABLE</span>
      </div>
    </div>
  );
};
