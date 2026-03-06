import React from 'react';
import { ArrowLeft, Database, Save, Download, MoreHorizontal, Info } from 'lucide-react';
import { TechnicalAIResponse } from '../../services/geminiService';
import { useProjectState } from '../../hooks/useProjectState';

interface HeaderProps {
  onBack: () => void;
  hasModel: boolean;
  currentDesign: TechnicalAIResponse | null;
  showDesignPanel: boolean;
  onToggleDesignPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBack, hasModel, currentDesign, showDesignPanel, onToggleDesignPanel }) => {
  const { saveProject, exportProject } = useProjectState();

  const handleSave = () => {
    if (currentDesign) {
      saveProject(currentDesign);
    }
  };

  const handleExport = () => {
    if (currentDesign) {
      exportProject(currentDesign);
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        <button
          data-testid="workspace-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all shadow-sm flex items-center gap-2 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider pr-1 font-unique">Exit Engine</span>
        </button>
        <div className="h-10 w-px bg-zinc-200 mx-2 hidden md:block" />
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight uppercase flex items-center gap-2 font-unique">
            <Database size={14} className="text-purple-600" />
            CAD Workspace V.2
          </h1>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest truncate max-w-[200px]">
            {hasModel ? `SYSTEM_LOADED: ${currentDesign?.modelUrl?.split('/').pop() || 'Asset'}` : 'AWAITING PARAMETERS'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 pointer-events-auto">
         {hasModel && (
           <>
             <button
               data-testid="workspace-toggle-panel"
               onClick={onToggleDesignPanel}
               className={`p-2.5 rounded-lg border transition-all ${showDesignPanel ? 'bg-purple-600 border-purple-700 text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm'}`}
               title="Design Protocol"
             >
               <Info size={18} />
             </button>
             <button data-testid="workspace-save-btn" onClick={handleSave} className="hidden sm:flex px-4 py-2 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 shadow-sm items-center gap-2 font-unique"><Save size={12} /> Save</button>
             <button data-testid="workspace-export-btn" onClick={handleExport} className="hidden sm:flex px-4 py-2 bg-zinc-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 shadow-lg items-center gap-2 font-unique"><Download size={12} /> Export</button>
           </>
         )}
         <button className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 shadow-sm transition-colors"><MoreHorizontal size={18} /></button>
      </div>
    </header>
  );
};