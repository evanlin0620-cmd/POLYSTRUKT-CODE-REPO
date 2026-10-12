import { create } from 'zustand';
import { DesignHistoryNode, ProceduralSpec } from '../types';

interface HistoryState {
  nodes: DesignHistoryNode[];
  currentNodeId: string | null;
  addNode: (prompt: string, spec: ProceduralSpec, meta?: Partial<DesignHistoryNode>) => string;
  jumpToNode: (id: string) => void;
  deleteNode: (id: string) => void;
  clearHistory: () => void;
}

export const useDesignHistory = create<HistoryState>((set, get) => ({
  nodes: [],
  currentNodeId: null,
  addNode: (prompt, spec, meta = {}) => {
    const state = get();
    const nextVersion = state.nodes.length + 1;
    const newNode: DesignHistoryNode = {
      id: `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      parentId: state.currentNodeId,
      timestamp: new Date(),
      prompt,
      spec,
      versionNumber: nextVersion,
      ...meta,
    };
    set({
      nodes: [...state.nodes, newNode],
      currentNodeId: newNode.id,
    });
    return newNode.id;
  },
  jumpToNode: (id) => set({ currentNodeId: id }),
  deleteNode: (id) =>
    set((state) => {
      const filtered = state.nodes.filter((n) => n.id !== id);
      const newCurrent =
        state.currentNodeId === id
          ? filtered.length > 0
            ? filtered[filtered.length - 1].id
            : null
          : state.currentNodeId;
      return {
        nodes: filtered,
        currentNodeId: newCurrent,
      };
    }),
  clearHistory: () => set({ nodes: [], currentNodeId: null }),
}));

