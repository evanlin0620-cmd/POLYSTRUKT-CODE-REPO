import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FlaskConical } from "lucide-react";

export interface WorkspaceQAModalProps {
  qaState: {
    show: boolean;
    rating: "success" | "fail";
    jobId: string;
  } | null;
  qaFeedback: string;
  setQaFeedback: (feedback: string) => void;
  isSubmittingFeedback: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const WorkspaceQAModal: React.FC<WorkspaceQAModalProps> = ({
  qaState,
  qaFeedback,
  setQaFeedback,
  isSubmittingFeedback,
  onClose,
  onSubmit,
}) => {
  return (
    <AnimatePresence>
      {qaState && qaState.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-black font-unique uppercase tracking-tight flex items-center gap-3">
                <FlaskConical
                  className={
                    qaState.rating === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                  size={20}
                />
                {qaState.rating === "success"
                  ? "Record Success"
                  : "Report Failure"}
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                Your feedback will be reinforced into the AI model's
                generation guidelines.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                Feedback Explanation
              </label>
              <textarea
                value={qaFeedback}
                onChange={(e) => setQaFeedback(e.target.value)}
                placeholder={
                  qaState.rating === "success"
                    ? "What makes this design highly accurate? (e.g., proper wall thickness, rib orientation)"
                    : "What went wrong with this model? (e.g., failed subtraction, blocky geometry)"
                }
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none min-h-[120px] resize-none text-left"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all font-unique"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingFeedback || !qaFeedback.trim()}
                onClick={onSubmit}
                className={`flex-1 py-3 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all font-unique ${
                  qaState.rating === "success"
                    ? "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20"
                    : "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20"
                } disabled:opacity-50`}
              >
                {isSubmittingFeedback ? "Submitting..." : "Submit Assessment"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
