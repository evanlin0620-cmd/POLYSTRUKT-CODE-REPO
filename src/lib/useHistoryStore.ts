import { create } from 'zustand';
import { DesignHistoryNode, ProceduralSpec } from '../types';

interface HistoryState {
  nodes: DesignHistoryNode[];
  currentNodeId: string | null;
  addNode: (prompt: string, spec: ProceduralSpec) => void;
  jumpToNode: (id: string) => void;
  clearHistory: () => void;
}

export const useDesignHistory = create<HistoryState>((set) => ({
  nodes: [],
  currentNodeId: null,
  addNode: (prompt, spec) => set((state) => {
    const newNode: DesignHistoryNode = {
      id: Math.random().toString(36).substr(2, 9),
      parentId: state.currentNodeId,
      timestamp: new Date(),
      prompt,
      spec
    };
    return {
      nodes: [...state.nodes, newNode],
      currentNodeId: newNode.id
    };
  }),
  jumpToNode: (id) => set({ currentNodeId: id }),
  clearHistory: () => set({ nodes: [], currentNodeId: null })
}));
