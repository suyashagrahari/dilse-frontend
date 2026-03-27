"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Send, Copy, ExternalLink } from "lucide-react";
import type { Toast } from "./types";

const ROSE = "rgb(201, 144, 106)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  onCopy: (url?: string) => void;
}

export default memo(function ToastStack({ toasts, onDismiss, onCopy }: Props) {
  return (
    <div style={{
      position: "fixed", top: 16, left: 0, right: 0, zIndex: 60,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      pointerEvents: "none", padding: "0 16px",
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ pointerEvents: "auto", width: "100%", maxWidth: 380 }}
          >
            <div style={{
              position: "relative", borderRadius: 16,
              boxShadow: "0 8px 30px rgba(0,0,0,0.50)",
              border: toast.type === "publish"
                ? "1px solid rgba(55,200,100,0.30)"
                : "1px solid rgba(201,144,106,0.20)",
              background: toast.type === "publish"
                ? "linear-gradient(135deg, rgba(40,160,80,0.95), rgba(30,130,65,0.95))"
                : "rgba(14, 7, 24, 0.97)",
              backdropFilter: "blur(16px)",
              overflow: "hidden",
            }}>
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: toast.type === "publish"
                    ? "rgba(255,255,255,0.15)"
                    : toast.type === "success"
                      ? "rgba(55,200,100,0.12)"
                      : "rgba(201,144,106,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                }}>
                  {toast.type === "publish" ? (
                    <Send size={14} style={{ color: "#fff" }} />
                  ) : toast.type === "success" ? (
                    <Check size={14} style={{ color: "rgb(55,200,100)" }} />
                  ) : (
                    <Sparkles size={14} style={{ color: ROSE }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, margin: 0,
                    color: toast.type === "publish" ? "#fff" : ROSE,
                  }}>
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p style={{
                      fontFamily: CURSIVE, fontSize: 12, margin: "2px 0 0",
                      color: toast.type === "publish" ? "rgba(255,255,255,0.80)" : "rgba(201,144,106,0.55)",
                    }}>
                      {toast.message}
                    </p>
                  )}
                  {toast.shareUrl && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button
                        onClick={() => { onCopy(toast.shareUrl); onDismiss(toast.id); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          fontSize: 12, fontFamily: CURSIVE, fontWeight: 600,
                          background: "rgba(255,255,255,0.18)", color: "#fff",
                          border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                        }}
                      >
                        <Copy size={12} /> Copy Link
                      </button>
                      <button
                        onClick={() => { window.open(toast.shareUrl, "_blank"); onDismiss(toast.id); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          fontSize: 12, fontFamily: CURSIVE, fontWeight: 600,
                          background: "rgba(255,255,255,0.18)", color: "#fff",
                          border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                        }}
                      >
                        <ExternalLink size={12} /> Open
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  style={{
                    padding: 2, borderRadius: "50%", border: "none", background: "transparent",
                    cursor: "pointer", flexShrink: 0,
                    color: toast.type === "publish" ? "rgba(255,255,255,0.55)" : "rgba(201,144,106,0.40)",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              {toast.type !== "publish" && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 3.5, ease: "linear" }}
                  style={{ height: 2, background: "rgba(201,144,106,0.35)", transformOrigin: "left" }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
