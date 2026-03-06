import { useState, useCallback } from 'react';
import { defaultPrompts } from '../constants/prompts';

export interface SavedPrompt {
  id: string;
  text: string;
}

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