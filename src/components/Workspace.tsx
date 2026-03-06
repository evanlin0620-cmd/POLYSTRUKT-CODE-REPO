import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './Workspace/Header';
import { MainView } from './Workspace/MainView';
import { DesignPanel } from './Workspace/DesignPanel';
import { PromptInput } from './Workspace/PromptInput';
import { useWorkspaceLogic } from '../hooks/useWorkspaceLogic';

interface WorkspaceProps {
  onBack: () => void;
  initialPrompt?: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ onBack, initialPrompt }) => {
  const {
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
  } = useWorkspaceLogic(initialPrompt);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-50 text-zinc-900 relative">
      <Header
        onBack={onBack}
        hasModel={hasModel}
        currentDesign={currentDesign}
        showDesignPanel={showDesignPanel}
        onToggleDesignPanel={() => setShowDesignPanel(!showDesignPanel)}
      />

      <MainView
        isGenerating={isGenerating}
        hasModel={hasModel}
        currentDesign={currentDesign}
        simulationMode={simulationMode}
      />

      <AnimatePresence>
        {showDesignPanel && (
          <DesignPanel
            isGenerating={isGenerating}
            currentDesign={currentDesign}
            onClose={() => setShowDesignPanel(false)}
            onGenerate={handleGenerate}
          />
        )}
      </AnimatePresence>

      <PromptInput
        prompt={prompt}
        onPromptChange={setPrompt}
        onGenerate={handleGenerate}
        onSurpriseMe={handleSurpriseMe}
        isGenerating={isGenerating}
        isShaking={isShaking}
      />
    </div>
  );
};