"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Eye, Loader2 } from "lucide-react";

const ROSE = "#ff3d6b";
const ROSE_DIM = "rgba(255,61,107,0.55)";
const CURSIVE = "system-ui, sans-serif";

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
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
            pointerEvents: "none",
          }}
        >
          <div style={{ margin: "16px auto 0", maxWidth: 400, padding: "0 16px", pointerEvents: "auto" }}>
            <div style={{
              background: "rgba(14, 7, 24, 0.98)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: 16,
              boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,61,107,0.18)",
              overflow: "hidden",
            }}>
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,61,107,0.40), transparent)" }} />
              <div style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(255,61,107,0.10)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Eye size={12} style={{ color: ROSE }} />
                  </div>
                  <p style={{ fontFamily: CURSIVE, fontSize: 11, fontWeight: 700, color: ROSE, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                    Preview Mode
                  </p>
                </div>
                <p style={{ fontFamily: CURSIVE, fontSize: 11, color: ROSE_DIM, marginBottom: 12 }}>
                  Browse through the tabs to see how it looks, then save or go back to edit.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={onDiscard}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 10,
                      border: "1.5px solid rgba(255,61,107,0.25)", background: "transparent",
                      fontFamily: CURSIVE, fontSize: 13, fontWeight: 600, color: ROSE_DIM,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    <ChevronLeft size={14} /> Edit More
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={saving}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)",
                      fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "#fff",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      opacity: saving ? 0.6 : 1,
                      boxShadow: "0 4px 14px rgba(255,61,107,0.30)",
                    }}
                  >
                    {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
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
