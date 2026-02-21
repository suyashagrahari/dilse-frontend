"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Eye, Loader2 } from "lucide-react";

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
            <div
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{
                background: "rgba(8,8,8,0.92)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(201,168,76,0.15)",
              }}
            >
              <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,165,116,0.3), transparent)" }} />
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(212,165,116,0.1)" }}>
                    <Eye size={12} style={{ color: "#D4A574" }} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#D4A574" }}>Preview Mode</p>
                </div>
                <p className="text-[11px] mb-3" style={{ color: "hsl(0 0% 50%)" }}>
                  Browse through tabs to see your invitation, then save or go back to edit.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onDiscard}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "hsl(0 0% 50%)" }}
                  >
                    <ChevronLeft size={14} /> Edit More
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, #D4A574, #E8CBAE, #D4A574)",
                      color: "#0B0F1A",
                    }}
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
