"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Eye, Loader2, Pencil } from "lucide-react";

const WARM_GRADIENT = "linear-gradient(135deg, rgb(158,126,97) 0%, rgb(120,85,55) 100%)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

interface Props {
  visible: boolean;
  publishing: boolean;
  onEdit: () => void;
  onPublish: () => void;
}

export default memo(function PreviewBar({ visible, publishing, onEdit, onPublish }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 150,
            paddingTop: "max(env(safe-area-inset-top, 0px), 0px)",
            pointerEvents: "none",
          }}
        >
          <div style={{ margin: "12px 16px 0", maxWidth: 480, marginLeft: "auto", marginRight: "auto", pointerEvents: "auto" }}>
            <div style={{
              background: "rgba(250, 246, 240, 0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 20,
              boxShadow: "0 8px 40px rgba(108,74,46,0.22), 0 2px 8px rgba(108,74,46,0.10)",
              border: "1px solid rgba(158,126,97,0.22)",
              overflow: "hidden",
            }}>
              {/* Warm top accent line */}
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent, rgba(158,126,97,0.5), transparent)" }} />
              <div style={{ padding: "14px 18px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "rgba(158,126,97,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Eye size={13} style={{ color: "rgb(108,74,46)" }} />
                  </div>
                  <span style={{ fontFamily: CURSIVE, fontSize: 13, fontWeight: 700, color: "rgb(108,74,46)", letterSpacing: "0.04em" }}>
                    Preview Mode ♡
                  </span>
                </div>
                <p style={{ fontFamily: CURSIVE, fontSize: 12, color: "rgba(108,74,46,0.60)", marginBottom: 14, lineHeight: 1.5 }}>
                  Browse all tabs to see how it looks. Edit anything you want, then publish when ready.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  {/* Edit button */}
                  <button
                    onClick={onEdit}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 50,
                      border: "1.5px solid rgba(158,126,97,0.40)",
                      background: "rgba(158,126,97,0.06)",
                      fontFamily: CURSIVE, fontSize: 14, fontWeight: 700,
                      color: "rgb(108,74,46)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "background 0.15s",
                    }}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  {/* Publish button */}
                  <button
                    onClick={onPublish}
                    disabled={publishing}
                    style={{
                      flex: 1.6, padding: "11px 0", borderRadius: 50,
                      border: "none",
                      background: publishing ? "rgba(158,126,97,0.35)" : WARM_GRADIENT,
                      fontFamily: CURSIVE, fontSize: 14, fontWeight: 700,
                      color: "#fff", cursor: publishing ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      boxShadow: publishing ? "none" : "0 4px 16px rgba(108,74,46,0.30)",
                      transition: "all 0.15s",
                    }}
                  >
                    {publishing
                      ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Publishing...</>
                      : <><Send size={13} /> Publish ♡</>
                    }
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
