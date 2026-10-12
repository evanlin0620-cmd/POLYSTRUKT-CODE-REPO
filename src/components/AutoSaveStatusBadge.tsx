import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle, 
  Cloud, 
  CloudOff, 
  HardDrive, 
  Clock, 
  ChevronDown, 
  ShieldCheck,
  History,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import { AutoSaveStatus, AutoSaveSceneState } from '../types';
import { workspaceAutosaveService } from '../services/workspaceAutosaveService';

interface AutoSaveStatusBadgeProps {
  status: AutoSaveStatus;
  lastSavedText: string;
  lastSaved: Date | null;
  lastRevisionId: string | null;
  versionNumber: number;
  intervalSeconds: number;
  onIntervalChange: (sec: number) => void;
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  isOnline: boolean;
  onSyncNow: () => void;
  hasRecoverableSession: boolean;
  recoverableSnapshot: AutoSaveSceneState | null;
  recoverableSource: string;
  onRestoreSession: () => void;
  onDismissRecovery: () => void;
  token?: string | null;
  onRestoreSnapshot?: (snapshot: any) => void;
}

const formatTimestamp = (ts: any) => {
  if (!ts) return 'Recent auto-save';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return 'Recent auto-save';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const AutoSaveStatusBadge: React.FC<AutoSaveStatusBadgeProps> = ({
  status,
  lastSavedText,
  lastSaved,
  lastRevisionId,
  versionNumber,
  intervalSeconds,
  onIntervalChange,
  isEnabled,
  onToggleEnabled,
  isOnline,
  onSyncNow,
  hasRecoverableSession,
  recoverableSnapshot,
  recoverableSource,
  onRestoreSession,
  onDismissRecovery,
  token,
  onRestoreSnapshot
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingSnapshots(true);
      workspaceAutosaveService.fetchAutoSaveSnapshots(token).then((snaps) => {
        setSnapshots(snaps);
        setIsLoadingSnapshots(false);
      }).catch(() => {
        setIsLoadingSnapshots(false);
      });
    }
  }, [isOpen, token]);

  const getStatusBadgeContent = () => {
    if (!isEnabled) {
      return {
        icon: <CloudOff size={13} className="text-zinc-500" />,
        label: 'Auto-Save Paused',
        color: 'bg-zinc-800/80 border-zinc-700 text-zinc-400',
        dot: 'bg-zinc-500'
      };
    }

    switch (status) {
      case 'saving':
        return {
          icon: <RefreshCw size={13} className="text-cyan-400 animate-spin" />,
          label: 'Syncing...',
          color: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300',
          dot: 'bg-cyan-400 animate-ping'
        };
      case 'synced':
        return {
          icon: <CheckCircle2 size={13} className="text-emerald-400" />,
          label: lastSavedText && lastSavedText !== 'Not saved yet' ? `Saved ${lastSavedText}` : 'Auto-Saved',
          color: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
          dot: 'bg-emerald-400'
        };
      case 'dirty':
        return {
          icon: <Clock size={13} className="text-amber-400" />,
          label: 'Unsaved Changes',
          color: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400'
        };
      case 'offline':
        return {
          icon: <HardDrive size={13} className="text-sky-400" />,
          label: 'Saved Locally',
          color: 'bg-sky-950/40 border-sky-500/30 text-sky-300',
          dot: 'bg-sky-400'
        };
      case 'error':
      default:
        return {
          icon: <AlertTriangle size={13} className="text-rose-400" />,
          label: 'Sync Retrying',
          color: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
          dot: 'bg-rose-400'
        };
    }
  };

  const badge = getStatusBadgeContent();

  return (
    <div className="relative pointer-events-auto">
      {/* Primary Auto-Save Status Pill */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-full border text-[10px] font-mono font-medium flex items-center gap-2 backdrop-blur-md transition-all shadow-sm cursor-pointer ${badge.color}`}
        title="Click to view auto-save status and recovery snapshots"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.dot}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${badge.dot}`} />
        </span>
        {badge.icon}
        <span className="font-semibold tracking-tight">{badge.label}</span>
        <ChevronDown size={11} className={`opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Auto-Save & Disaster Recovery Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute right-0 mt-2 w-84 bg-zinc-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl z-50 text-white font-sans text-xs space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 text-xs">CAD Scene Persistence</h3>
                    <p className="text-[10px] text-zinc-400">Continuous background sync</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Status details */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-2 text-[11px]">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Backend Storage:</span>
                  <span className="text-zinc-200 font-mono flex items-center gap-1">
                    {isOnline ? (
                      <>
                        <Cloud size={12} className="text-emerald-400" />
                        Online Sync Active
                      </>
                    ) : (
                      <>
                        <HardDrive size={12} className="text-amber-400" />
                        Local Mirror Active
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Last Synchronized:</span>
                  <span className="text-zinc-200 font-mono">
                    {lastSaved ? lastSaved.toLocaleTimeString() : 'Pending'}
                  </span>
                </div>
                {lastRevisionId && (
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Snapshot Hash:</span>
                    <span className="text-zinc-400 font-mono text-[9px] truncate max-w-[120px]">
                      {lastRevisionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-zinc-400">
                  <span>State Version:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    v{versionNumber}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium text-[11px]">Auto-Save Frequency</span>
                  <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-lg p-0.5">
                    {[10, 20, 45, 60].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => onIntervalChange(sec)}
                        className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                          intervalSeconds === sec && isEnabled
                            ? 'bg-emerald-500 text-white font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium text-[11px]">Enable Auto-Sync</span>
                  <button
                    onClick={() => onToggleEnabled(!isEnabled)}
                    className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                      isEnabled ? 'bg-emerald-500 justify-end' : 'bg-zinc-700 justify-start'
                    }`}
                  >
                    <motion.div
                      layout
                      className="bg-white w-3.5 h-3.5 rounded-full shadow-md"
                    />
                  </button>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      onSyncNow();
                    }}
                    disabled={status === 'saving'}
                    className="flex-1 py-2 px-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={status === 'saving' ? 'animate-spin' : ''} />
                    Sync Scene Now
                  </button>
                </div>
              </div>

              {/* Historical Snapshots Section */}
              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                    <History size={13} className="text-indigo-400" />
                    Recovery Snapshots
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {snapshots.length} saved
                  </span>
                </div>

                {isLoadingSnapshots ? (
                  <div className="py-4 text-center text-zinc-500 text-[11px] flex items-center justify-center gap-2">
                    <RefreshCw size={12} className="animate-spin text-indigo-400" /> Loading recovery timeline...
                  </div>
                ) : snapshots.length === 0 ? (
                  <div className="py-2 text-center text-zinc-500 text-[10px]">
                    No historical rollback points yet.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {snapshots.slice(0, 5).map((snap, idx) => (
                      <div
                        key={snap.revisionId || idx}
                        className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-lg p-2 transition-colors text-[10px]"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono text-zinc-300">
                            {new Date(snap.savedAt).toLocaleTimeString()}
                          </span>
                          <span className="text-zinc-500 text-[9px] truncate max-w-[140px]">
                            {snap.parameters?.prompt || snap.revisionId}
                          </span>
                        </div>
                        {onRestoreSnapshot && (
                          <button
                            onClick={() => {
                              onRestoreSnapshot(snap);
                              setIsOpen(false);
                            }}
                            className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded border border-indigo-500/30 transition-all text-[9px] flex items-center gap-1"
                            title="Rollback to this snapshot"
                          >
                            <RotateCcw size={10} /> Rollback
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Unsaved Session Recovery Banner */}
      <AnimatePresence>
        {hasRecoverableSession && recoverableSnapshot && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-950/95 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl text-white max-w-md w-full mx-4 flex items-start gap-3.5"
          >
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-white flex items-center gap-1.5 font-unique">
                  Previous CAD Session Detected
                </h4>
                <button
                  onClick={onDismissRecovery}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Found auto-saved geometry and parameters from{' '}
                <span className="font-mono text-cyan-300 font-semibold">
                  {formatTimestamp(recoverableSnapshot.timestamp)}
                </span>
                {recoverableSnapshot.parameters?.prompt && (
                  <>: "{recoverableSnapshot.parameters.prompt.slice(0, 45)}..."</>
                )}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onRestoreSession}
                  className="px-3 py-1.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} /> Restore Session
                </button>
                <button
                  onClick={onDismissRecovery}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-medium rounded-lg text-xs transition-colors border border-white/5 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
