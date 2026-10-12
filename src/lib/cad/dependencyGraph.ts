import { CADFeature, CADSketch } from './types';

export interface DependencyNode {
  id: string;
  name: string;
  type: 'sketch' | 'feature';
  dependencies: string[];
  data: CADSketch | CADFeature;
}

export interface DependencyGraphResult {
  hasCycle: boolean;
  sortedNodes: DependencyNode[];
  sortedFeatures: CADFeature[];
  sortedSketches: CADSketch[];
  unresolvedDependencies: { nodeId: string; missingDepId: string }[];
}

/**
 * Dependency Graph & Topological Sorter for Parametric CAD Feature Trees.
 * Guarantees that parent sketches and features are created strictly before child features.
 */
export class CADDependencyGraph {
  private nodes = new Map<string, DependencyNode>();

  public addSketch(sketch: CADSketch) {
    this.nodes.set(sketch.id, {
      id: sketch.id,
      name: sketch.name,
      type: 'sketch',
      dependencies: sketch.planeId && sketch.planeId.startsWith('plane_') ? [sketch.planeId] : [],
      data: sketch,
    });
  }

  public addFeature(feature: CADFeature) {
    const deps = [...feature.dependencies];
    if (feature.sketchId && !deps.includes(feature.sketchId)) {
      deps.push(feature.sketchId);
    }
    this.nodes.set(feature.id, {
      id: feature.id,
      name: feature.name,
      type: 'feature',
      dependencies: deps,
      data: feature,
    });
  }

  public buildOrder(): DependencyGraphResult {
    const sortedNodes: DependencyNode[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const unresolvedDependencies: { nodeId: string; missingDepId: string }[] = [];
    let hasCycle = false;

    // Check for unresolved dependencies
    for (const [id, node] of this.nodes.entries()) {
      for (const depId of node.dependencies) {
        if (!this.nodes.has(depId) && !['XY', 'XZ', 'YZ'].includes(depId)) {
          unresolvedDependencies.push({ nodeId: id, missingDepId: depId });
        }
      }
    }

    const visit = (id: string): void => {
      if (visiting.has(id)) {
        hasCycle = true;
        return;
      }
      if (visited.has(id)) return;

      visiting.add(id);
      const node = this.nodes.get(id);
      if (node) {
        for (const depId of node.dependencies) {
          if (this.nodes.has(depId)) {
            visit(depId);
          }
        }
      }

      visiting.delete(id);
      visited.add(id);
      if (node) sortedNodes.push(node);
    };

    for (const id of this.nodes.keys()) {
      if (!visited.has(id)) {
        visit(id);
      }
    }

    const sortedFeatures = sortedNodes
      .filter((n) => n.type === 'feature')
      .map((n) => n.data as CADFeature);

    const sortedSketches = sortedNodes
      .filter((n) => n.type === 'sketch')
      .map((n) => n.data as CADSketch);

    return {
      hasCycle,
      sortedNodes,
      sortedFeatures,
      sortedSketches,
      unresolvedDependencies,
    };
  }
}
