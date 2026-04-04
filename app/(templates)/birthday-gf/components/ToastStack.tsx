"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Toast } from "./types";

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  onCopy?: (url?: string) => void;
}

const BROWN = "#5D3F31";
const WARM = "rgb(108, 74, 46)";
const TERRACOTTA = "#AD684A";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

function getToastEmoji(type?: Toast["type"]): string {
  switch (type) {
    case "success": return "🎉";
    case "error":   return "❌";
    case "publish": return "🎂";
    case "info":    return "ℹ️";
    default:        return "🎂";
  }
}

function getToastStyle(type?: Toast["type"]) {
  switch (type) {
    case "success":
      return {
        bg: "rgba(250,245,237,0.97)",
        border: "rgba(173,104,74,0.25)",
        titleColor: WARM,
        msgColor: "rgba(108,74,46,0.65)",
        iconBg: "rgba(173,104,74,0.12)",
      };
    case "error":
      return {
        bg: "rgba(254,243,242,0.97)",
        border: "rgba(220,80,70,0.22)",
        titleColor: "rgb(180,55,45)",
        msgColor: "rgba(180,55,45,0.65)",
        iconBg: "rgba(220,80,70,0.10)",
      };
    default:
      return {
        bg: "rgba(250,245,237,0.97)",
        border: "rgba(173,104,74,0.20)",
        titleColor: WARM,
        msgColor: "rgba(108,74,46,0.65)",
        iconBg: "rgba(173,104,74,0.10)",
      };
  }
}

export default function ToastStack({ toasts, onDismiss, onCopy }: Props) {
  return (
    <div style={{
      position: "fixed",
      top: 16,
      left: 0, right: 0,
      zIndex: 300,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      pointerEvents: "none",
      padding: "0 16px",
    }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyle(toast.type);
          const emoji = getToastEmoji(toast.type);

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ pointerEvents: "auto", width: "100%", maxWidth: 380 }}>
              <div style={{
                background: styles.bg,
                border: `1px solid ${styles.border}`,
                borderRadius: 18,
                boxShadow: "0 8px 32px rgba(93,63,49,0.16), 0 2px 8px rgba(93,63,49,0.08)",
                backdropFilter: "blur(12px)",
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  {/* Icon */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: styles.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1, fontSize: 16,
                  }}>
                    {emoji}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: CURSIVE, fontSize: 15, fontWeight: 700,
                      color: styles.titleColor, margin: 0, lineHeight: 1.3,
                    }}>
                      {toast.title || toast.message}
                    </p>
                    {toast.message && toast.title && (
                      <p style={{
                        fontFamily: CURSIVE, fontSize: 12,
                        color: styles.msgColor, margin: "3px 0 0", lineHeight: 1.4,
                      }}>
                        {toast.message}
                      </p>
                    )}
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => onDismiss(toast.id)}
                    style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "rgba(108,74,46,0.08)", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0, color: "rgba(108,74,46,0.45)",
                    }}>
                    <X size={12} />
                  </button>
                </div>

                {/* Auto-dismiss progress bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 3.5, ease: "linear" }}
                  style={{
                    height: 3,
                    background: `linear-gradient(90deg, ${TERRACOTTA}, ${BROWN})`,
                    transformOrigin: "left",
                    opacity: 0.6,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
