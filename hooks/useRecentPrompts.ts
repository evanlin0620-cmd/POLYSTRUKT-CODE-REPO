import { useState, useCallback, useEffect } from 'react';

const MAX_RECENT_PROMPTS = 5;

export const useRecentPrompts = () => {
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedPrompts = localStorage.getItem('recentPrompts');
      if (storedPrompts) {
        setRecentPrompts(JSON.parse(storedPrompts));
      }
    } catch (error) {
      console.error('Failed to load recent prompts from local storage', error);
    }
  }, []);

  const addRecentPrompt = useCallback((prompt: string) => {
    if (!prompt.trim()) return;

    setRecentPrompts(prevPrompts => {
      const updatedPrompts = [prompt, ...prevPrompts.filter(p => p !== prompt)];
      const newPrompts = updatedPrompts.slice(0, MAX_RECENT_PROMPTS);

      try {
        localStorage.setItem('recentPrompts', JSON.stringify(newPrompts));
      } catch (error) {
        console.error('Failed to save recent prompts to local storage', error);
      }

      return newPrompts;
    });
  }, []);

  return { recentPrompts, addRecentPrompt };
};