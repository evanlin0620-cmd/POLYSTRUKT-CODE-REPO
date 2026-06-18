import React from 'react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '../../lib/utils';
import { Activity } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'Sarah Chen', role: 'Topology Eng', color: 'bg-emerald-500', seed: 'Sarah' },
  { name: 'Marcus Vane', role: 'Simulation Lead', color: 'bg-blue-500', seed: 'Marcus' },
  { name: 'Elena Rossi', role: 'Materials Sci', color: 'bg-purple-500', seed: 'Elena' },
];

export const TeamPresence: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="flex -space-x-3">
        {TEAM_MEMBERS.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative group"
          >
            <Avatar className="h-9 w-9 border-2 border-zinc-950 ring-1 ring-white/10 shadow-xl cursor-help">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}`} />
              <AvatarFallback className="text-[10px] bg-zinc-800 text-white font-black">{member.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-950 shadow-sm", member.color)} />
            
            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
              <div className="bg-zinc-900 border border-white/10 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl whitespace-nowrap">
                <p className="text-[10px] font-black text-white uppercase tracking-tight">{member.name}</p>
                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{member.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="h-10 w-px bg-white/5 hidden md:block" />
      
      <div className="hidden lg:flex flex-col">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest font-unique">Shared Link Active</span>
        </div>
        <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">3 Nodes Connected</p>
      </div>
    </div>
  );
};
