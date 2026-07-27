"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import type { Memory } from "./types";
import { safeImageUrl } from "./types";

// Alternating photo/caption timeline down a rose spine. Each memory is CLICKABLE →
// it opens a lightbox with the photo (or a soft placeholder) + its caption as the
// title, with prev/next to walk the whole lane. Image boxes reserve their aspect so
// lazy photos never shift layout (zero CLS).
export default function MemoryLane({ memories }: { memories: Memory[] }) {
  const list = memories
    .map((m) => ({ img: safeImageUrl(m.image), caption: (m.caption || "").trim() }))
    .filter((m) => m.img || m.caption);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (list.length === 0) return null;

  const close = () => setOpenIdx(null);
  const go = (dir: number) => setOpenIdx((i) => (i === null ? i : (i + dir + list.length) % list.length));
  const current = openIdx !== null ? list[openIdx] : null;

  return (
    <div className="relative mx-auto max-w-3xl">
      <div
        className="absolute bottom-2 left-5 top-2 w-px sm:left-1/2 sm:-translate-x-px"
        style={{ background: "linear-gradient(180deg,transparent,var(--mu-rose),transparent)" }}
      />
      <ul className="space-y-6 sm:space-y-8">
        {list.map((m, i) => (
          <li key={i} className={`relative flex items-center gap-4 sm:gap-8 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
            {/* numbered node */}
            <span
              className="absolute left-5 top-1/2 z-[1] grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[11px] font-bold text-white sm:left-1/2"
              style={{ background: "var(--mu-rose-deep)", boxShadow: "0 0 0 4px var(--mu-bg)" }}
            >
              {i + 1}
            </span>
            <div className="hidden sm:block sm:w-1/2" />
            <motion.button
              onClick={() => setOpenIdx(i)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              className="mu-paper ml-11 flex min-w-0 flex-1 items-center gap-3 p-3 text-left sm:ml-0 sm:w-1/2 sm:flex-none"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ background: "var(--mu-blush)", border: "1px solid var(--mu-paper-edge)" }}>
                {m.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.img} alt={m.caption || "a memory"} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={18} className="mu-rose" />
                )}
              </span>
              <span className="mu-script min-w-0 flex-1 truncate text-xl mu-rose-deep sm:text-2xl">{m.caption || "a moment i keep"}</span>
              <span className="mu-sans shrink-0 text-[10px] uppercase tracking-widest mu-muted">view</span>
            </motion.button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "rgba(58,44,39,.55)", backdropFilter: "blur(5px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="mu-paper relative w-full max-w-lg overflow-hidden p-4 sm:p-5"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={close} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full" style={{ background: "rgba(255,253,250,.9)", color: "var(--mu-rose-deep)", border: "1px solid var(--mu-paper-edge)" }}>
                <X size={16} />
              </button>

              <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "4 / 3", background: "linear-gradient(135deg,var(--mu-blush),var(--mu-paper-2))" }}>
                {current.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.img} alt={current.caption || "a memory of us"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
                    <span className="text-4xl">🤍</span>
                    <span className="mu-sans text-xs uppercase tracking-widest mu-muted">no photo — just the feeling</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button onClick={() => go(-1)} aria-label="Previous memory" className="mu-btn-ghost grid h-10 w-10 place-items-center" style={{ borderRadius: 999 }} disabled={list.length < 2}>
                  <ChevronLeft size={18} />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <p className="mu-script truncate text-2xl mu-rose-deep sm:text-3xl">{current.caption || "a moment i keep"}</p>
                  <p className="mu-sans mt-0.5 text-[11px] uppercase tracking-widest mu-muted">memory {openIdx! + 1} of {list.length}</p>
                </div>
                <button onClick={() => go(1)} aria-label="Next memory" className="mu-btn-ghost grid h-10 w-10 place-items-center" style={{ borderRadius: 999 }} disabled={list.length < 2}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
