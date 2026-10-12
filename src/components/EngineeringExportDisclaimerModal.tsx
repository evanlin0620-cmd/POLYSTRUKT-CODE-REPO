import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldAlert, Download, X, Check, ExternalLink } from 'lucide-react';

interface EngineeringExportDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: () => void;
  exportFormatName: string;
  onOpenLegal?: (tab: 'safety' | 'terms') => void;
}

export const EngineeringExportDisclaimerModal: React.FC<EngineeringExportDisclaimerModalProps> = ({
  isOpen,
  onClose,
  onConfirmExport,
  exportFormatName,
  onOpenLegal
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (dontShowAgain) {
      sessionStorage.setItem('polystrukt_export_disclaimer_ack', 'true');
    }
    onConfirmExport();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[320] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-zinc-200 font-sans overflow-hidden"
        >
          {/* Top amber caution stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono text-white">
                  Engineering Safety Gate & Export Notice
                </h3>
                <p className="text-[10px] text-amber-400/90 font-mono">
                  Artifact: {exportFormatName} // Liability Precaution
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
              aria-label="Close export disclaimer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs leading-relaxed space-y-2 text-zinc-300">
            <p className="font-bold text-amber-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <AlertTriangle size={14} />
              Prototype Geometry — Not PE Certified
            </p>
            <p>
              This geometry is algorithmically synthesized via artificial intelligence for conceptual evaluation and research. It does <strong>not</strong> carry a Professional Engineer (PE) certification or ASME/ISO manufacturing warranty.
            </p>
            <p className="text-[11px] text-zinc-400">
              Any physical fabrication (additive 3D printing, CNC machining, investment casting) or load-bearing integration requires independent structural validation. The user assumes all legal liability and risk for manufactured parts.
            </p>
          </div>

          {/* Acknowledgement checkbox */}
          <div className="mt-5 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasAcknowledged}
                onChange={(e) => setHasAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-300 group-hover:text-white transition-colors font-medium">
                I understand this is an uncertified conceptual model and accept full responsibility for any physical fabrication or structural usage.
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group pl-7">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-zinc-500 focus:ring-zinc-400 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors font-mono">
                Do not warn again during this active session
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {onOpenLegal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegal('safety');
                }}
                className="text-[10px] font-mono text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <span>Read Full Policy</span>
                <ExternalLink size={10} />
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!hasAcknowledged}
                onClick={handleProceed}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
              >
                <Download size={14} />
                <span>Acknowledge & Export</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
