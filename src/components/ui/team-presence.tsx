import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Activity, Users, Radio, Shield, Share2, Copy, Check, Server, Cpu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface EngineerPeer {
  name: string;
  role: string;
  initials: string;
  status: 'active' | 'idle' | 'computing';
  color: string;
}

const PEERS: EngineerPeer[] = [
  { name: 'Dr. Sarah Chen', role: 'Topology FEA', initials: 'SC', status: 'computing', color: 'bg-emerald-500' },
  { name: 'Marcus Vane', role: 'Aerodynamics', initials: 'MV', status: 'active', color: 'bg-indigo-500' },
  { name: 'Elena Rossi', role: 'Materials Lab', initials: 'ER', status: 'idle', color: 'bg-cyan-500' },
];

export const TeamPresence: React.FC<{ className?: string }> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const user = useAuth(state => state.user);

  const userInitials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'EN';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={popoverRef} className={cn("relative flex items-center gap-2", className)}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2.5 bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-indigo-500/40 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
        title="Active CAD Cluster & Collaboration Node"
      >
        {/* Live Cluster Dot */}
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </div>

        {/* User Initials Badge */}
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-inner">
          {userInitials}
        </div>

        <div className="hidden 2xl:flex flex-col text-left leading-none">
          <span className="text-[10px] font-mono font-semibold text-zinc-200">
            Node-01
          </span>
          <span className="text-[8px] font-mono text-zinc-500">
            3 Active
          </span>
        </div>
      </motion.button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-10 right-0 w-72 bg-zinc-950/98 backdrop-blur-2xl border border-white/15 rounded-xl p-3 shadow-2xl z-50 space-y-3 font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <Radio size={13} className="text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-tight">CAD Compute Mesh</span>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                18ms Latency
              </span>
            </div>

            {/* Cluster Stats */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-500 flex items-center gap-1">
                  <Server size={10} />
                  <span>Host Cluster</span>
                </div>
                <div className="text-zinc-200 font-semibold truncate">US-East (CSG-v4)</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-500 flex items-center gap-1">
                  <Cpu size={10} />
                  <span>Mesh Solver</span>
                </div>
                <div className="text-emerald-300 font-semibold">Ready (SIMP 3.0)</div>
              </div>
            </div>

            {/* Active Connected Peers */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Active CAD Sessions (3)</span>
                <span className="text-[9px] text-zinc-500">Live Sync</span>
              </div>

              <div className="space-y-1">
                {PEERS.map((peer, idx) => (
                  <div 
                    key={idx} 
                    className="p-1.5 rounded-lg bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-zinc-800 border border-white/10 flex items-center justify-center font-mono text-[9px] font-bold text-zinc-300">
                        {peer.initials}
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-zinc-200 leading-tight">{peer.name}</div>
                        <div className="text-[9px] font-mono text-zinc-500 leading-tight">{peer.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] font-mono">
                      <span className={cn("w-1.5 h-1.5 rounded-full", peer.color)} />
                      <span className="text-zinc-400 capitalize">{peer.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Session Action */}
            <button
              onClick={handleCopyShareLink}
              className="w-full py-1.5 px-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg text-indigo-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-300">Workspace Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={12} />
                  <span>Share Live Workstation Link</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
