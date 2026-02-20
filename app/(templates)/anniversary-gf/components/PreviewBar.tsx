"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Eye, Loader2 } from "lucide-react";
import { ROSE_GRADIENT } from "./styles";

interface Props {
  visible: boolean;
  saving: boolean;
  onDiscard: () => void;
  onConfirm: () => void;
}

export default memo(function PreviewBar({ visible, saving, onDiscard, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-50 safe-top pointer-events-none"
        >
          <div className="mx-4 mt-4 md:mx-auto md:max-w-sm lg:max-w-md pointer-events-auto">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-rose-200/40 dark:border-rose-900/30 overflow-hidden">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <Eye size={12} className="text-rose-500" />
                  </div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Preview Mode</p>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Browse through the tabs to see how it looks, then save or go back to edit.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onDiscard}
                    className="flex-1 py-2.5 rounded-xl border border-border/60 text-sm font-semibold text-muted-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={14} /> Edit More
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-60"
                    style={{ background: ROSE_GRADIENT }}
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {saving ? "Saving..." : "Save & Continue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
