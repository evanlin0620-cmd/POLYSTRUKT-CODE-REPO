import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  RotateCcw,
  GitBranch,
  GitFork,
  Trash2,
  Download,
  X,
  Sparkles,
  Layers,
  Ruler,
  CheckCircle2,
  ChevronRight,
  Clock,
  Box,
  FileCode,
  ArrowRightLeft,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Database,
  Cloud,
  Check,
} from "lucide-react";
import { useDesignHistory } from "../lib/useHistoryStore";
import { DesignHistoryNode, ProceduralSpec, TechnicalAIResponse } from "../types";
import { cn } from "../lib/utils";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentDesign: TechnicalAIResponse | null;
  onRevertToVersion: (node: DesignHistoryNode) => void;
  onBranchVersion: (node: DesignHistoryNode) => void;
  savedProjects?: any[];
  onLoadSavedProject?: (project: any) => void;
  onShowToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  currentDesign,
  onRevertToVersion,
  onBranchVersion,
  savedProjects = [],
  onLoadSavedProject,
  onShowToast,
}) => {
  const { nodes, currentNodeId, jumpToNode, deleteNode, clearHistory } = useDesignHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"generations" | "saved">("generations");
  const [diffNode, setDiffNode] = useState<DesignHistoryNode | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Helper to count primitives in CSG spec
  const countPrimitives = (spec?: ProceduralSpec): { primitives: number; operations: number; typeSummary: string } => {
    if (!spec) return { primitives: 0, operations: 0, typeSummary: "Empty" };

    let primitives = 0;
    let operations = 0;
    const types = new Set<string>();

    const traverse = (item: ProceduralSpec) => {
      if (!item) return;
      if ("op" in item && (item.op === "union" || item.op === "subtract" || item.op === "intersect")) {
        operations++;
        traverse(item.a);
        traverse(item.b);
      } else if ("op" in item && item.op === "group") {
        if (Array.isArray(item.children)) {
          item.children.forEach(traverse);
        }
      } else if ("type" in item) {
        primitives++;
        types.add(item.type);
      }
    };

    traverse(spec);
    const typeSummary = types.size > 0 ? Array.from(types).join(", ") : "CSG Solid";
    return { primitives, operations, typeSummary };
  };

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.toLowerCase();
    return nodes.filter(
      (n) =>
        n.prompt.toLowerCase().includes(q) ||
        (n.label && n.label.toLowerCase().includes(q)) ||
        (n.specs && n.specs.toLowerCase().includes(q)) ||
        `v${n.versionNumber}`.includes(q)
    );
  }, [nodes, searchQuery]);

  // Current active node
  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === currentNodeId) || (nodes.length > 0 ? nodes[nodes.length - 1] : null);
  }, [nodes, currentNodeId]);

  // Previous node for 1-click rollback
  const previousNode = useMemo(() => {
    if (!currentNodeId || nodes.length < 2) return null;
    const currentIndex = nodes.findIndex((n) => n.id === currentNodeId);
    if (currentIndex > 0) return nodes[currentIndex - 1];
    return null;
  }, [nodes, currentNodeId]);

  const handleExportSpecJson = (node: DesignHistoryNode) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(node, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `polystrukt_v${node.versionNumber || 1}_${node.prompt.slice(0, 16).replace(/[^a-z0-9]/gi, "_")}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(`Exported v${node.versionNumber || 1} specification JSON`, "success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[44] lg:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            initial={{ x: -420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -420, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="absolute top-0 left-0 bottom-0 w-full sm:w-96 md:w-[26rem] bg-zinc-950/95 backdrop-blur-2xl border-r border-white/10 z-[45] shadow-2xl flex flex-col pt-16 overflow-hidden"
          >
            {/* 1. Header */}
            <div className="p-5 border-b border-white/10 shrink-0 bg-zinc-900/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                    <History size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-black uppercase tracking-wider text-white">
                        Version History
                      </h2>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[10px] font-mono font-bold">
                        {nodes.length} {nodes.length === 1 ? "Version" : "Versions"}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400">
                      Revert, branch, & diff CAD iterations
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Close History Sidebar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Undo / Revert to Previous Bar */}
              {previousNode && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <RotateCcw size={13} className="text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-indigo-300 block truncate">
                        Revert to v{previousNode.versionNumber || 1}
                      </span>
                      <span className="text-[9px] text-zinc-400 truncate block">
                        {previousNode.prompt}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      jumpToNode(previousNode.id);
                      onRevertToVersion(previousNode);
                      onShowToast(`Reverted to v${previousNode.versionNumber || 1}!`, "success");
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-sm"
                  >
                    Undo
                  </button>
                </motion.div>
              )}

              {/* Tabs: Generations vs Saved Projects */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-white/5 rounded-xl">
                <button
                  onClick={() => setActiveTab("generations")}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    activeTab === "generations"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <GitBranch size={13} />
                  <span>Generations ({nodes.length})</span>
                </button>
                {savedProjects.length > 0 && (
                  <button
                    onClick={() => setActiveTab("saved")}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                      activeTab === "saved"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Cloud size={13} />
                    <span>Saved ({savedProjects.length})</span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              {activeTab === "generations" && nodes.length > 2 && (
                <div className="relative mt-3">
                  <Search size={13} className="absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter version prompts..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/90 border border-white/10 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-purple-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {activeTab === "generations" ? (
                <>
                  {filteredNodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-2xl">
                      <div className="p-3 bg-zinc-900 rounded-full text-zinc-600 mb-3">
                        <History size={24} />
                      </div>
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        No History Iterations
                      </h3>
                      <p className="text-[11px] text-zinc-500 max-w-[240px] leading-relaxed">
                        Every generative prompt and parametric modification automatically logs a version checkpoint here.
                      </p>
                    </div>
                  ) : (
                    filteredNodes
                      .slice()
                      .reverse()
                      .map((node, index) => {
                        const isActive = node.id === (currentNodeId || activeNode?.id);
                        const stats = countPrimitives(node.spec);
                        const formattedTime = new Date(node.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });

                        return (
                          <motion.div
                            key={node.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                              "p-3.5 rounded-2xl border transition-all relative group",
                              isActive
                                ? "bg-purple-950/25 border-purple-500/50 shadow-lg shadow-purple-950/20"
                                : "bg-zinc-900/60 border-white/5 hover:border-white/20 hover:bg-zinc-900/90"
                            )}
                          >
                            {/* Card Header: Version Badge & Timestamp */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider",
                                    isActive
                                      ? "bg-purple-500 text-white shadow-sm"
                                      : "bg-white/10 text-zinc-400"
                                  )}
                                >
                                  v{node.versionNumber || filteredNodes.length - index}
                                </span>
                                {isActive && (
                                  <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Active Viewport
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                                <Clock size={10} />
                                {formattedTime}
                              </span>
                            </div>

                            {/* Prompt text */}
                            <p className="text-xs text-zinc-200 font-medium leading-relaxed mb-2.5 line-clamp-2 group-hover:line-clamp-none transition-all">
                              {node.prompt}
                            </p>

                            {/* CSG & Spec Meta Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <span className="px-2 py-0.5 bg-zinc-800/80 border border-white/5 rounded text-[9px] font-mono text-zinc-300 flex items-center gap-1">
                                <Box size={10} className="text-indigo-400" />
                                {stats.primitives} {stats.primitives === 1 ? "Primitive" : "Primitives"}
                              </span>
                              {node.dimensions && (
                                <span className="px-2 py-0.5 bg-zinc-800/80 border border-white/5 rounded text-[9px] font-mono text-zinc-300 flex items-center gap-1">
                                  <Ruler size={10} className="text-cyan-400" />
                                  {node.dimensions.length}×{node.dimensions.width}×{node.dimensions.height}mm
                                </span>
                              )}
                              {node.materialName && (
                                <span className="px-2 py-0.5 bg-zinc-800/80 border border-white/5 rounded text-[9px] font-mono text-zinc-300 flex items-center gap-1">
                                  <Layers size={10} className="text-amber-400" />
                                  {node.materialName}
                                </span>
                              )}
                            </div>

                            {/* Action Toolbar */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-white/5 gap-1.5">
                              {/* Revert / Load Button */}
                              <button
                                onClick={() => {
                                  jumpToNode(node.id);
                                  onRevertToVersion(node);
                                  onShowToast(
                                    `Model reverted to Version v${node.versionNumber || 1}!`,
                                    "success"
                                  );
                                }}
                                disabled={isActive}
                                className={cn(
                                  "flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                                  isActive
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-default"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                                )}
                              >
                                {isActive ? (
                                  <>
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                    <span>Current</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw size={12} />
                                    <span>Revert to this</span>
                                  </>
                                )}
                              </button>

                              {/* Diff Specs Button */}
                              <button
                                onClick={() => setDiffNode(node)}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                                title="Compare with Active Version"
                              >
                                <ArrowRightLeft size={13} />
                              </button>

                              {/* Branch Button */}
                              <button
                                onClick={() => {
                                  onBranchVersion(node);
                                  onShowToast(
                                    `Branching from v${node.versionNumber || 1} in prompt bar`,
                                    "info"
                                  );
                                }}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                                title="Branch from this Version"
                              >
                                <GitFork size={13} />
                              </button>

                              {/* Export Spec JSON */}
                              <button
                                onClick={() => handleExportSpecJson(node)}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                                title="Export Version JSON"
                              >
                                <Download size={13} />
                              </button>

                              {/* Delete Node */}
                              {nodes.length > 1 && (
                                <button
                                  onClick={() => {
                                    deleteNode(node.id);
                                    onShowToast(
                                      `Deleted v${node.versionNumber || 1} from history`,
                                      "info"
                                    );
                                  }}
                                  className="p-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg text-xs transition-colors cursor-pointer"
                                  title="Delete Version from History"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                  )}
                </>
              ) : (
                /* Saved Projects tab */
                <div className="space-y-3">
                  {savedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3.5 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-indigo-500/30 hover:bg-zinc-900/90 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[200px]">
                          {project.name || project.title || "Untitled CAD Model"}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Saved"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3">
                        {project.prompt || project.design?.specs || "Full solid CSG session configuration."}
                      </p>
                      <button
                        onClick={() => {
                          if (onLoadSavedProject) {
                            onLoadSavedProject(project);
                            onShowToast(`Loaded ${project.name || "project"}!`, "success");
                          }
                        }}
                        className="w-full py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Load Project into Viewport</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Footer */}
            <div className="p-4 border-t border-white/10 shrink-0 bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] font-mono text-zinc-400">
                  {nodes.length} generation {nodes.length === 1 ? "step" : "steps"}
                </span>
              </div>

              {nodes.length > 0 && (
                <div>
                  {confirmClear ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          clearHistory();
                          setConfirmClear(false);
                          onShowToast("History purged", "info");
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                      >
                        Confirm Clear
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="text-zinc-400 hover:text-white text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="text-[10px] font-mono text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Version Diff Modal */}
            <AnimatePresence>
              {diffNode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-4 bg-zinc-950 border border-purple-500/40 rounded-2xl p-5 shadow-2xl z-50 flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={16} className="text-purple-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Version Comparison Diff
                      </h3>
                    </div>
                    <button
                      onClick={() => setDiffNode(null)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs font-mono custom-scrollbar">
                    {/* Prompt comparison */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Target Prompt (v{diffNode.versionNumber || 1})</span>
                      <p className="p-2.5 bg-white/5 rounded-lg text-purple-200 text-[11px] leading-relaxed">
                        {diffNode.prompt}
                      </p>
                    </div>

                    {/* Active Prompt comparison */}
                    {activeNode && activeNode.id !== diffNode.id && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Active Viewport Prompt (v{activeNode.versionNumber || 1})</span>
                        <p className="p-2.5 bg-white/5 rounded-lg text-emerald-200 text-[11px] leading-relaxed">
                          {activeNode.prompt}
                        </p>
                      </div>
                    )}

                    {/* Geometry Diff */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-3 bg-white/5 rounded-xl">
                        <span className="block text-[9px] text-zinc-500 uppercase mb-1">Target Version (v{diffNode.versionNumber || 1})</span>
                        <span className="text-sm font-bold text-purple-400">
                          {countPrimitives(diffNode.spec).primitives} Primitives
                        </span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl">
                        <span className="block text-[9px] text-zinc-500 uppercase mb-1">Active Model</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {countPrimitives(activeNode?.spec).primitives} Primitives
                        </span>
                      </div>
                    </div>

                    {diffNode.specs && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Engineering Specs</span>
                        <pre className="p-2.5 bg-black/50 border border-white/5 rounded-lg text-[10px] text-zinc-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {diffNode.specs}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex gap-2">
                    <button
                      onClick={() => {
                        jumpToNode(diffNode.id);
                        onRevertToVersion(diffNode);
                        setDiffNode(null);
                        onShowToast(`Reverted to Version v${diffNode.versionNumber || 1}!`, "success");
                      }}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Revert to v{diffNode.versionNumber || 1}</span>
                    </button>
                    <button
                      onClick={() => setDiffNode(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
