import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';

interface SavedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const SavedPrompts: React.FC<SavedPromptsProps> = ({ onSelectPrompt }) => {
  const { prompts, newPromptText, setNewPromptText, addPrompt, deletePrompt } = usePrompts();

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto">
      <h3 className="text-center text-sm font-bold text-zinc-400 uppercase tracking-widest font-unique">Or use a saved prompt</h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt, index) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white border border-zinc-200 rounded-lg p-4 flex justify-between items-start hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectPrompt(prompt.text)}
          >
            <p className="text-sm font-medium text-zinc-700">{prompt.text}</p>
            <button
              onClick={(e) => { e.stopPropagation(); deletePrompt(prompt.id); }}
              className="text-zinc-400 hover:text-red-500 transition-colors ml-2"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={newPromptText}
          onChange={(e) => setNewPromptText(e.target.value)}
          placeholder="Add a new prompt..."
          className="flex-grow px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button
          onClick={addPrompt}
          className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-zinc-300"
          disabled={!newPromptText.trim()}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};