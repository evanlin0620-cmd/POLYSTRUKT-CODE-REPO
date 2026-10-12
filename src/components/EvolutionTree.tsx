import React from 'react';
import { useDesignHistory } from '../lib/useHistoryStore';
import { motion } from 'motion/react';
import { GitBranch, Clock, ChevronRight, History } from 'lucide-react';

export const EvolutionTree: React.FC = () => {
  const { nodes, currentNodeId, jumpToNode } = useDesignHistory();

  return (
    <div className="p-4 bg-zinc-950/50 backdrop-blur-xl rounded-2xl border border-white/5 max-h-[400px] overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-bold text-zinc-300 font-syne uppercase tracking-wider">Evolution Trace</h3>
      </div>

      <div className="relative space-y-4">
        {/* Connection Line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-purple-500/50 via-zinc-800 to-transparent" />

        {nodes.length === 0 && (
          <div className="text-zinc-600 text-xs font-mono py-8 px-4 text-center">
            No design evolutions recorded.
          </div>
        )}

        {nodes.map((node, index) => (
          <motion.div 
            key={node.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative pl-10 group cursor-pointer ${currentNodeId === node.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
            onClick={() => jumpToNode(node.id)}
          >
            {/* Node Dot */}
            <div className={`absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full z-10 
              ${currentNodeId === node.id ? 'bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-zinc-700'}`} 
            />

            <div className={`p-3 rounded-xl border transition-all ${
              currentNodeId === node.id 
                ? 'bg-purple-500/10 border-purple-500/30' 
                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <Clock size={10} />
                  {node.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <ChevronRight className={`w-3 h-3 ${currentNodeId === node.id ? 'text-purple-400' : 'text-zinc-600'}`} />
              </div>
              <p className="text-xs text-zinc-300 line-clamp-1 leading-relaxed">
                {node.prompt}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between px-2">
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-purple-500" />
          <div className="w-1 h-1 rounded-full bg-purple-500/50" />
          <div className="w-1 h-1 rounded-full bg-purple-500/20" />
        </div>
        <p className="text-[10px] font-mono text-zinc-600 flex items-center gap-1">
          <History size={10} />
          {nodes.length} GENERATIONS
        </p>
      </div>
    </div>
  );
};
