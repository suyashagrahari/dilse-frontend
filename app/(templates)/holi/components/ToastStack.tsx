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

const ICONS: Record<Toast["type"], typeof Check> = { success: Check, info: Sparkles, publish: Send };
const COLORS: Record<Toast["type"], string> = {
  success: "var(--holi-green)",
  info: "var(--holi-pink)",
  publish: "var(--holi-orange)",
};

export default memo(function ToastStack({ toasts, onDismiss, onCopy }: Props) {
  return (
    <div className="fixed top-4 right-4 z-[80] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          const color = COLORS[t.type];
          return (
            <motion.div
              key={t.id}
              className="pointer-events-auto rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "hsl(var(--holi-card))", border: "1px solid hsl(var(--holi-border))", boxShadow: "var(--holi-glass-shadow)" }}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--holi-fg))" }}>{t.title}</p>
                {t.message && <p className="text-xs mt-0.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>{t.message}</p>}
                {t.shareUrl && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => onCopy(t.shareUrl)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md" style={{ background: `${color}10`, color }}>
                      <Copy size={10} />Copy
                    </button>
                    <a href={t.shareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md" style={{ background: "var(--holi-green)10", color: "var(--holi-green)" }}>
                      <ExternalLink size={10} />Open
                    </a>
                  </div>
                )}
              </div>
              <button onClick={() => onDismiss(t.id)} style={{ color: "hsl(var(--holi-muted-fg))" }}><X size={14} /></button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});
