"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Send, Copy, ExternalLink } from "lucide-react";
import type { Toast } from "./types";

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
  onCopy: (url?: string) => void;
}

export default memo(function ToastStack({ toasts, onDismiss, onCopy }: Props) {
  return (
    <div className="fixed top-4 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto w-full max-w-sm"
          >
            <div
              className="relative rounded-2xl shadow-2xl overflow-hidden"
              style={{
                background: toast.type === "publish"
                  ? "linear-gradient(135deg, rgba(201,168,76,0.95), rgba(166,134,54,0.95))"
                  : "rgba(8,8,8,0.95)",
                backdropFilter: "blur(20px)",
                border: `1px solid ${
                  toast.type === "publish"
                    ? "rgba(232,213,163,0.3)"
                    : toast.type === "success"
                    ? "rgba(16,185,129,0.3)"
                    : "rgba(201,168,76,0.15)"
                }`,
              }}
            >
              <div className="px-4 py-3 flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: toast.type === "publish"
                      ? "rgba(255,255,255,0.2)"
                      : toast.type === "success"
                      ? "rgba(16,185,129,0.1)"
                      : "rgba(201,168,76,0.1)",
                  }}
                >
                  {toast.type === "publish" ? (
                    <Send size={14} style={{ color: "#080808" }} />
                  ) : toast.type === "success" ? (
                    <Check size={14} style={{ color: "#10b981" }} />
                  ) : (
                    <Sparkles size={14} style={{ color: "#C9A84C" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: toast.type === "publish" ? "#080808" : "#F5F5F0" }}>
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="text-xs mt-0.5" style={{ color: toast.type === "publish" ? "rgba(8,8,8,0.7)" : "hsl(0 0% 50%)" }}>
                      {toast.message}
                    </p>
                  )}
                  {toast.shareUrl && (
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={() => { onCopy(toast.shareUrl); onDismiss(toast.id); }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "rgba(255,255,255,0.2)", color: "#080808" }}
                      >
                        <Copy size={12} /> Copy Link
                      </button>
                      <button
                        onClick={() => { window.open(toast.shareUrl, "_blank"); onDismiss(toast.id); }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: "rgba(255,255,255,0.2)", color: "#080808" }}
                      >
                        <ExternalLink size={12} /> Open
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-0.5 rounded-full shrink-0"
                  style={{ color: toast.type === "publish" ? "rgba(8,8,8,0.5)" : "hsl(0 0% 40%)" }}
                >
                  <X size={14} />
                </button>
              </div>
              {toast.type !== "publish" && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 3.5, ease: "linear" }}
                  className="h-0.5 origin-left"
                  style={{ background: "rgba(201,168,76,0.3)" }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
