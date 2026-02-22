import React from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';

interface RecentPromptsProps {
  recentPrompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export const RecentPrompts: React.FC<RecentPromptsProps> = ({ recentPrompts, onSelectPrompt }) => {
  if (recentPrompts.length === 0) return null;

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <h3 className="text-center text-sm font-bold text-zinc-400 uppercase tracking-widest font-unique flex items-center justify-center gap-2"><History size={14}/>Recent Prompts</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {recentPrompts.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => onSelectPrompt(prompt)}
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  );
};