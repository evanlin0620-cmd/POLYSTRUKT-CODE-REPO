import { useState, useCallback, useEffect } from 'react';
import { TechnicalAIResponse, getTechnicalDesign } from '../services/geminiService';
import { defaultPrompts } from './usePrompts';
import { useRecentPrompts } from './useRecentPrompts';

export const useWorkspaceLogic = (initialPrompt = '') => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<TechnicalAIResponse | null>(null);
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { recentPrompts, addRecentPrompt } = useRecentPrompts();

  const hasModel = currentDesign !== null;
  const simulationMode = currentDesign?.simulationType && currentDesign.simulationType !== 'none' ? currentDesign.simulationType : 'stress';

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    setIsGenerating(true);
    addRecentPrompt(prompt);
    setCurrentDesign(null);
    try {
      const design = await getTechnicalDesign(prompt);
      setCurrentDesign(design);
      setShowDesignPanel(true);
    } catch (error) {
      console.error("Failed to generate design:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, addRecentPrompt]);

  const handleSurpriseMe = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * defaultPrompts.length);
    const randomPrompt = defaultPrompts[randomIndex].text;
    setPrompt(randomPrompt);
  }, []);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      handleGenerate();
    }
  }, [initialPrompt, handleGenerate, setPrompt]);

  return {
    prompt,
    setPrompt,
    isGenerating,
    hasModel,
    showDesignPanel,
    setShowDesignPanel,
    currentDesign,
    simulationMode,
    isShaking,
    handleGenerate,
    handleSurpriseMe,
    recentPrompts,
  };
};