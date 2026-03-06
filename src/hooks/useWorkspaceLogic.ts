import { useState, useCallback, useEffect } from 'react';
import { TechnicalAIResponse, getTechnicalResponse } from '../services/geminiService';
import { defaultPrompts } from '../constants/prompts';
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

  const generate = useCallback(async (promptToGenerate: string) => {
    if (!promptToGenerate.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    setIsGenerating(true);
    addRecentPrompt(promptToGenerate);
    setCurrentDesign(null);
    try {
      const design = await getTechnicalResponse(promptToGenerate);
      setCurrentDesign(design);
      setShowDesignPanel(true);
    } catch (error) {
      console.error("Failed to generate design:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [addRecentPrompt]);

  const handleGenerate = useCallback(async () => {
    await generate(prompt);
  }, [generate, prompt]);

  const handleSurpriseMe = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * defaultPrompts.length);
    const randomPrompt = defaultPrompts[randomIndex].text;
    setPrompt(randomPrompt);
  }, []);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      generate(initialPrompt);
    }
  }, [initialPrompt, generate]);

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