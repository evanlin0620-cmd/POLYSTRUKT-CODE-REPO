import { useState, useCallback } from 'react';

export interface SavedPrompt {
  id: string;
  text: string;
}

const defaultPrompts: SavedPrompt[] = [
  { id: 'prompt-1', text: 'A lightweight, ergonomic handle for a power drill, optimized for injection molding.' },
  { id: 'prompt-2', text: 'A heat-dissipating enclosure for a small-scale server, using generative design principles.' },
  { id: 'prompt-3', text: 'A streamlined bicycle frame, designed for aerodynamic efficiency and carbon fiber construction.' },
  { id: 'prompt-4', text: 'An adaptive prosthetic foot, capable of adjusting to different terrains and user gaits.' },
];

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>(defaultPrompts);
  const [newPromptText, setNewPromptText] = useState('');

  const addPrompt = useCallback(() => {
    if (newPromptText.trim()) {
      const newPrompt: SavedPrompt = {
        id: `prompt-${Date.now()}`,
        text: newPromptText.trim(),
      };
      setPrompts(prevPrompts => [...prevPrompts, newPrompt]);
      setNewPromptText('');
    }
  }, [newPromptText]);

  const deletePrompt = useCallback((id: string) => {
    setPrompts(prevPrompts => prevPrompts.filter(p => p.id !== id));
  }, []);

  return {
    prompts,
    newPromptText,
    setNewPromptText,
    addPrompt,
    deletePrompt,
  };
};