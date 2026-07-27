"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { OpenWhenNote } from "./types";

// Labelled "open when you…" cards in a single vertical stack. Each is a little
// sealed envelope; tapping opens its note in a modal. Content is fully sender-authored.
export default function OpenWhenVault({ notes }: { notes: OpenWhenNote[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const list = notes.filter((n) => n.label?.trim() || n.text?.trim());
  const current = openIdx !== null ? list[openIdx] : null;

  if (list.length === 0) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col gap-4">
        {list.map((l, i) => (
          <motion.button
            key={i}
            onClick={() => setOpenIdx(i)}
            className="mu-paper group flex items-center gap-4 p-5 text-left"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
          >
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
              style={{ background: "var(--mu-blush)", border: "1px solid var(--mu-paper-edge)" }}
            >
              ✉️
            </span>
            <span className="min-w-0 flex-1">
              <span className="mu-serif block text-lg italic mu-ink sm:text-xl">{l.label || "open when…"}</span>
              <span className="mu-sans mt-0.5 block text-xs uppercase tracking-[0.2em] mu-muted">tap to open</span>
            </span>
            <span className="mu-rose-deep shrink-0 text-xl transition-transform group-hover:translate-x-1">→</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(58,44,39,.42)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIdx(null)}
          >
            <motion.div
              className="mu-paper w-full max-w-lg p-8 sm:p-10"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mu-script text-xl mu-sepia">{current.label}</p>
              <p className="mu-serif mt-4 text-lg leading-relaxed sm:text-xl">{current.text}</p>
              <p className="mu-script mt-6 text-right text-2xl mu-rose-deep">— yours, always</p>
              <button onClick={() => setOpenIdx(null)} className="mu-serif mt-6 text-sm mu-muted">close letter</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
