"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Eye, Loader2 } from "lucide-react";
import { GOLD_GRADIENT } from "./styles";

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
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div className="mx-4 mt-4 md:mx-auto md:max-w-sm lg:max-w-md pointer-events-auto">
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-amber-200/40 dark:border-amber-900/30 overflow-hidden">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Eye size={12} className="text-amber-500" />
                  </div>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Preview Mode</p>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">
                  Browse through tabs to see your invitation.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onDiscard}
                    className="flex-1 py-2.5 rounded-xl border border-border/60 text-sm font-semibold text-muted-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={14} /> Back & Edit
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-60"
                    style={{ background: GOLD_GRADIENT }}
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {saving ? "Saving..." : "Save"}
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
