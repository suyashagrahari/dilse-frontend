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
              className={`relative rounded-2xl shadow-2xl border backdrop-blur-xl overflow-hidden ${
                toast.type === "publish"
                  ? "bg-gradient-to-r from-emerald-500/95 to-green-500/95 border-emerald-400/30 text-white"
                  : toast.type === "success"
                  ? "bg-white/95 dark:bg-slate-900/95 border-emerald-200/50 dark:border-emerald-800/30"
                  : "bg-white/95 dark:bg-slate-900/95 border-border/50"
              }`}
            >
              <div className="px-4 py-3 flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    toast.type === "publish"
                      ? "bg-white/20"
                      : toast.type === "success"
                      ? "bg-emerald-500/10"
                      : "bg-blue-500/10"
                  }`}
                >
                  {toast.type === "publish" ? (
                    <Send size={14} className="text-white" />
                  ) : toast.type === "success" ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Sparkles size={14} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${toast.type === "publish" ? "text-white" : ""}`}>
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className={`text-xs mt-0.5 ${toast.type === "publish" ? "text-white/80" : "text-muted-foreground"}`}>
                      {toast.message}
                    </p>
                  )}
                  {toast.shareUrl && (
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={() => { onCopy(toast.shareUrl); onDismiss(toast.id); }}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Copy size={12} /> Copy Link
                      </button>
                      <button
                        onClick={() => { window.open(toast.shareUrl, "_blank"); onDismiss(toast.id); }}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink size={12} /> Open
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className={`p-0.5 rounded-full shrink-0 ${
                    toast.type === "publish"
                      ? "text-white/60 hover:text-white"
                      : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                >
                  <X size={14} />
                </button>
              </div>
              {toast.type !== "publish" && (
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 3.5, ease: "linear" }}
                  className="h-0.5 bg-emerald-500/30 origin-left"
                />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
