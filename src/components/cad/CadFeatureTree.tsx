import React, { useState } from 'react';
import {
  Box,
  Layers,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Circle,
  Sparkles,
  Maximize2,
  Trash2,
  Folder,
  FolderOpen
} from 'lucide-react';

interface CadFeatureTreeProps {
  isOpen: boolean;
  onToggle: () => void;
  // Plane toggles
  showOrigin: boolean;
  setShowOrigin: React.Dispatch<React.SetStateAction<boolean>>;
  showTop: boolean;
  setShowTop: React.Dispatch<React.SetStateAction<boolean>>;
  showFront: boolean;
  setShowFront: React.Dispatch<React.SetStateAction<boolean>>;
  showRight: boolean;
  setShowRight: React.Dispatch<React.SetStateAction<boolean>>;
  // Parts & spec
  proceduralSpec?: any;
  parts?: any[];
  selectedPart?: string | null;
  onSelectPart?: (name: string | null) => void;
  onIsolatePart?: (name: string | null) => void;
  onSynthesizePreset?: (prompt: string) => void;
  currentDesign?: any;
}

export const CadFeatureTree: React.FC<CadFeatureTreeProps> = ({
  isOpen,
  onToggle,
  showOrigin,
  setShowOrigin,
  showTop,
  setShowTop,
  showFront,
  setShowFront,
  showRight,
  setShowRight,
  proceduralSpec,
  parts = [],
  selectedPart,
  onSelectPart,
  onIsolatePart,
  onSynthesizePreset,
  currentDesign,
}) => {
  const [defaultGeoOpen, setDefaultGeoOpen] = useState(true);
  const [partsListOpen, setPartsListOpen] = useState(true);

  const shapes = proceduralSpec?.shapes || [];
  const hasFeatures = shapes.length > 0 || parts.length > 0;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title="Open Model Browser & Feature Tree"
        className="absolute top-2 left-2 z-30 p-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/80 rounded shadow-md cursor-pointer transition-colors"
      >
        <ChevronRight size={14} />
      </button>
    );
  }

  return (
    <aside className="w-64 bg-zinc-900/95 border-r border-zinc-800 flex flex-col h-full select-none text-xs text-zinc-300 z-30 shrink-0">
      {/* Header bar */}
      <div className="h-8 px-2.5 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-200">
          <Layers size={13} className="text-sky-400" />
          <span className="text-[11px] font-semibold tracking-wide">Features & Parts</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          title="Collapse Feature Tree"
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
        >
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-2">
        {/* Section 1: Default Geometry (Origin & Reference Planes) */}
        <div>
          <button
            type="button"
            onClick={() => setDefaultGeoOpen(!defaultGeoOpen)}
            className="w-full flex items-center justify-between px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-1">
              {defaultGeoOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              <span>Default Geometry</span>
            </div>
            <span className="text-[9px] text-zinc-600 font-mono">4 items</span>
          </button>

          {defaultGeoOpen && (
            <div className="ml-2 pl-1.5 border-l border-zinc-800 mt-0.5 space-y-0.5">
              {/* Origin */}
              <div className="group flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800/70 text-[11px] text-zinc-300 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border border-zinc-500 flex items-center justify-center">
                    <div className="w-1 h-1 bg-zinc-400 rounded-full" />
                  </div>
                  <span>Origin</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrigin((prev) => !prev)}
                  title={showOrigin ? "Hide Origin" : "Show Origin"}
                  className="opacity-40 group-hover:opacity-100 hover:text-sky-400 transition-opacity p-0.5"
                >
                  {showOrigin ? <Eye size={12} /> : <EyeOff size={12} className="text-zinc-600" />}
                </button>
              </div>

              {/* Top Plane */}
              <div className="group flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800/70 text-[11px] text-zinc-300 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 border border-zinc-500 rounded-sm bg-zinc-700/30" />
                  <span>Top Plane</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTop((prev) => !prev)}
                  title={showTop ? "Hide Top Plane" : "Show Top Plane"}
                  className="opacity-40 group-hover:opacity-100 hover:text-sky-400 transition-opacity p-0.5"
                >
                  {showTop ? <Eye size={12} /> : <EyeOff size={12} className="text-zinc-600" />}
                </button>
              </div>

              {/* Front Plane */}
              <div className="group flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800/70 text-[11px] text-zinc-300 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 border border-zinc-500 rounded-sm bg-zinc-700/30" />
                  <span>Front Plane</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFront((prev) => !prev)}
                  title={showFront ? "Hide Front Plane" : "Show Front Plane"}
                  className="opacity-40 group-hover:opacity-100 hover:text-sky-400 transition-opacity p-0.5"
                >
                  {showFront ? <Eye size={12} /> : <EyeOff size={12} className="text-zinc-600" />}
                </button>
              </div>

              {/* Right Plane */}
              <div className="group flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-800/70 text-[11px] text-zinc-300 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 border border-zinc-500 rounded-sm bg-zinc-700/30" />
                  <span>Right Plane</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRight((prev) => !prev)}
                  title={showRight ? "Hide Right Plane" : "Show Right Plane"}
                  className="opacity-40 group-hover:opacity-100 hover:text-sky-400 transition-opacity p-0.5"
                >
                  {showRight ? <Eye size={12} /> : <EyeOff size={12} className="text-zinc-600" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Solid Features & Parts */}
        <div>
          <button
            type="button"
            onClick={() => setPartsListOpen(!partsListOpen)}
            className="w-full flex items-center justify-between px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-1">
              {partsListOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              <span>Solid Features & Parts</span>
            </div>
            <span className="text-[9px] text-zinc-600 font-mono">
              {hasFeatures ? `${shapes.length || parts.length} items` : 'Empty'}
            </span>
          </button>

          {partsListOpen && (
            <div className="ml-2 pl-1.5 border-l border-zinc-800 mt-0.5 space-y-0.5">
              {!hasFeatures ? (
                <div className="p-2.5 bg-zinc-950/40 rounded border border-zinc-800/60 text-center space-y-2 mt-1">
                  <div className="w-7 h-7 mx-auto rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-500">
                    <Box size={14} />
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">Empty Part Studio</p>
                  <p className="text-[9px] text-zinc-500 leading-tight">
                    No features in studio yet. Use the prompt below or select a quick starter to synthesize 3D geometry:
                  </p>
                  {onSynthesizePreset && (
                    <div className="space-y-1 pt-1">
                      {[
                        { label: 'Planetary Gearbox', prompt: 'Design an aerospace planetary gearbox carrier with 8-bolt flange, cooling fins, and dual internal bearing bores.' },
                        { label: 'Robotic Clevis Link', prompt: 'Design an articulated robotic arm link with dual clevis knuckles, NEMA servo mount, and pocketing.' },
                        { label: 'Mounting Flange', prompt: 'Design a heavy-duty industrial pipe mounting flange with 6-bolt perimeter pattern and O-ring groove.' },
                        { label: 'Centrifugal Impeller', prompt: 'Design a high-efficiency centrifugal pump impeller volute housing with curved vanes and suction bore.' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onSynthesizePreset(preset.prompt)}
                          className="w-full text-left px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-sky-500/50 rounded text-[10px] text-zinc-300 hover:text-white transition-colors flex items-center justify-between"
                        >
                          <span className="truncate">{preset.label}</span>
                          <Sparkles size={10} className="text-sky-400 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5 max-h-[340px] overflow-y-auto custom-scrollbar">
                  {shapes.map((s: any, idx: number) => {
                    const isSelected = selectedPart === (s.name || `feature_${idx}`);
                    return (
                      <div
                        key={idx}
                        onClick={() => onSelectPart?.(s.name || `feature_${idx}`)}
                        className={`group flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-950/70 border border-sky-500/40 text-white'
                            : 'hover:bg-zinc-800/70 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: s.color || '#94a3b8' }}
                          />
                          <span className="truncate font-mono text-[10px]">
                            {s.name || `${s.type}_${idx + 1}`}
                          </span>
                        </div>
                        {onIsolatePart && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onIsolatePart(s.name || `feature_${idx}`);
                            }}
                            title="Isolate Component"
                            className="opacity-0 group-hover:opacity-100 hover:text-sky-400 p-0.5 transition-opacity"
                          >
                            <Maximize2 size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info / Part Count */}
      <div className="p-2 border-t border-zinc-800 bg-zinc-950/40 text-[10px] text-zinc-500 flex items-center justify-between">
        <span>Units: Millimeters (mm)</span>
        <span className="font-mono text-zinc-400">1:1 Scale</span>
      </div>
    </aside>
  );
};
