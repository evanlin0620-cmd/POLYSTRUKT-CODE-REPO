import { useState, useCallback } from 'react';
import { TechnicalAIResponse } from '../services/geminiService';

export interface SavedProject {
  id: string;
  name: string;
  design: TechnicalAIResponse;
  createdAt: Date;
}

export const useProjectState = () => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const saveProject = useCallback((design: TechnicalAIResponse) => {
    setIsLoading(true);
    const projectName = prompt("Please enter a name for your project:");
    if (projectName) {
      const newProject: SavedProject = {
        id: `proj-${Date.now()}`,
        name: projectName,
        design: design,
        createdAt: new Date(),
      };
      setProjects(prevProjects => [...prevProjects, newProject]);
      // Here you would typically save to a backend or local storage
      console.log("Project saved:", newProject);
    }
    setIsLoading(false);
  }, []);

  const exportProject = useCallback((design: TechnicalAIResponse) => {
    if (!design.modelUrl) {
      alert("No model to export.");
      return;
    }
    const link = document.createElement('a');
    link.href = design.modelUrl;
    // Extract filename from URL
    const filename = design.modelUrl.split('/').pop() || 'model.glb';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("Exporting project");
  }, []);

  return {
    projects,
    saveProject,
    exportProject,
    isLoading,
  };
};