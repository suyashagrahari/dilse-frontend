"use client";

/**
 * "Little moments of us" — the photo gallery under the letter.
 *
 * Each photo is a polaroid. Tapping one opens it big, with the little letter
 * the sender wrote for that photo beside it (under it on a phone). The main
 * letter stays the main letter; these are the footnotes that make it personal.
 *
 * It comes AFTER the letter on purpose: the photographs are the warmest thing
 * on the page, so they are the reward, not the teaser.
 */

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { HMH, LOVE, cropStyle, memoryCrop, type Memory } from "./types";
import SectionTitle from "./SectionTitle";

/** A gentle alternating tilt, so the grid reads as photographs on a table. */
const TILT = [-3, 2.4, -1.6, 2.8, -2.2, 1.6];

export default function MemoryCards({ memories, reduced }: { memories: Memory[] | undefined; reduced: boolean }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const list = memories ?? [];
  const count = list.length;

  const close = useCallback(() => setOpenIdx(null), []);
  const step = useCallback(
    (d: number) => setOpenIdx((i) => (i === null ? i : (i + d + count) % count)),
    [count],
  );

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openIdx, close, step]);

  // Tolerates `undefined`: AI fill and restored drafts can both hand in a
  // payload written before this field existed.
  if (!count) return null;

  const open = openIdx === null ? null : list[openIdx];

  return (
    <section className="w-full mt-16" aria-label="Photographs and letters">
      <SectionTitle>little moments of us</SectionTitle>
      <p className="mt-1 mb-8 text-center" style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>
        tap a photo — each one has a little letter inside
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9 px-1">
        {list.map((m, i) => (
          <motion.button
            type="button"
            key={`${m.imageUrl}-${i}`}
            onClick={() => setOpenIdx(i)}
            initial={reduced ? false : { opacity: 0, y: 26, rotate: 0 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0, rotate: TILT[i % TILT.length] }}
            whileHover={reduced ? undefined : { rotate: 0, scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: Math.min(i * 0.07, 0.35) }}
            className="relative text-left"
            style={{
              background: "#fff",
              padding: "8px 8px 0",
              borderRadius: 6,
              boxShadow: "0 22px 40px -18px rgba(0,0,0,.8)",
              rotate: reduced ? `${TILT[i % TILT.length]}deg` : undefined,
            }}
            aria-label={`Open photo ${i + 1}${m.note.trim() ? " and its letter" : ""}`}
          >
            {/* washi tape */}
            <span
              aria-hidden
              className="absolute left-1/2 -top-2.5 h-5 w-14 -translate-x-1/2"
              style={{ background: "rgba(255,209,224,.75)", transform: `translateX(-50%) rotate(${-TILT[i % TILT.length]}deg)`, borderRadius: 2 }}
            />
            <div className="overflow-hidden" style={{ aspectRatio: "4 / 5", background: "#F2EBE3", borderRadius: 3 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                style={cropStyle(memoryCrop(m))}
              />
            </div>
            <div className="flex items-center justify-center gap-1 py-2.5 sm:py-3" style={{ fontFamily: HMH.script, fontSize: 17, color: LOVE.roseDeep }}>
              {m.note.trim() ? "open me 💌" : "us 🤍"}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && openIdx !== null && (
          <motion.div
            key="viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
            style={{ background: "rgba(20,6,17,.82)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo and letter"
          >
            <motion.div
              key={openIdx}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[420px] md:max-w-[860px] max-h-[88dvh] overflow-y-auto md:overflow-hidden rounded-[22px] flex flex-col md:flex-row"
              style={{ background: LOVE.paper, boxShadow: "0 40px 90px -30px rgba(0,0,0,.9)" }}
            >
              <div className="md:w-1/2 shrink-0 bg-black/5">
                <div className="w-full h-full overflow-hidden" style={{ aspectRatio: "4 / 5", maxHeight: "60dvh" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={open.imageUrl} alt="" style={cropStyle(memoryCrop(open))} />
                </div>
              </div>
              <div
                className="md:w-1/2 p-6 sm:p-8 flex flex-col md:overflow-y-auto"
                style={{ background: `repeating-linear-gradient(180deg, transparent 0 31px, rgba(184,35,90,.07) 31px 32px), ${LOVE.paper}` }}
              >
                <span style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: LOVE.inkSoft, fontFamily: HMH.display }}>
                  moment {openIdx + 1} of {count}
                </span>
                {open.note.trim() ? (
                  <p className="mt-4" style={{ fontFamily: HMH.script, fontSize: 23, lineHeight: 1.5, color: LOVE.ink, whiteSpace: "pre-wrap" }}>
                    {open.note}
                  </p>
                ) : (
                  <p className="mt-4" style={{ fontFamily: HMH.script, fontSize: 23, color: LOVE.inkSoft }}>
                    no words needed for this one 🤍
                  </p>
                )}
                <div className="flex-1" />
                {count > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <NavBtn onClick={() => step(-1)} label="Previous photo"><ChevronLeft size={18} /></NavBtn>
                    <div className="flex gap-1.5">
                      {list.map((_, i) => (
                        <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === openIdx ? 18 : 6, background: i === openIdx ? LOVE.rose : "rgba(59,35,48,.2)" }} />
                      ))}
                    </div>
                    <NavBtn onClick={() => step(1)} label="Next photo"><ChevronRight size={18} /></NavBtn>
                  </div>
                )}
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center"
                style={{ background: "rgba(0,0,0,.55)", color: "#fff" }}
              >
                <X size={17} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function NavBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full grid place-items-center transition-transform active:scale-90"
      style={{ background: "#fff", color: LOVE.roseDeep, boxShadow: "0 6px 16px -6px rgba(59,35,48,.35)" }}
    >
      {children}
    </button>
  );
}
