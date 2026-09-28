"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";

const ROSE = "#ff3d6b";
const GRAD = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";

interface Props {
  open: boolean;
  clearing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** "Start over" confirmation — wipes the unpublished draft held in this browser. */
export default memo(function ClearDataSheet({ open, clearing, onCancel, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="clear-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={clearing ? undefined : onCancel}
            style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(4,2,10,0.62)" }}
          />
          <motion.div
            key="clear-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="darling-clear-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 121,
              maxWidth: 480, margin: "0 auto",
              background: "rgba(14, 7, 24, 0.98)",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -12px 60px rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,61,107,0.18)",
              borderBottom: "none",
              padding: "12px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", paddingBottom: 14 }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,61,107,0.25)" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: "rgba(255,61,107,0.10)",
                border: "1px solid rgba(255,61,107,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Trash2 size={19} style={{ color: ROSE }} />
              </div>
              <h3 id="darling-clear-title" style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>
                Clear your draft?
              </h3>
            </div>

            <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.55, color: "rgba(255,255,255,0.62)" }}>
              Names, messages, photos and the page password you added here will be removed
              from this browser, and the page goes back to the sample. This can&apos;t be undone.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onCancel}
                disabled={clearing}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: clearing ? "default" : "pointer",
                }}
              >
                Keep it
              </button>
              <button
                onClick={onConfirm}
                disabled={clearing}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 14, border: "none",
                  background: GRAD, color: "#fff", fontSize: 14, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  cursor: clearing ? "default" : "pointer",
                  boxShadow: "0 6px 20px rgba(255,61,107,0.3)",
                }}
              >
                {clearing ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {clearing ? "Clearing…" : "Yes, clear it"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
