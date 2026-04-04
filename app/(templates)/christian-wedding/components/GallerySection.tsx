"use client";

import { memo, useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, Camera, X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import type { ShaadiData } from "./types";

const C_ACCENT = "#546B57";
const C_MED = "#7A9B7E";
const C_DARK = "#2D3E32";
const F_CINZEL = "var(--font-cinzel), ui-serif, Georgia, serif";
const F_LORA = "var(--font-lora), Georgia, serif";
const F_DANCING = "var(--font-great-vibes), cursive";

interface Props {
  data: ShaadiData;
}

/** Bento cell sizes by index for visual rhythm */
function cellClass(i: number, total: number): string {
  if (total <= 1) return "col-span-2 row-span-2 min-h-[220px]";
  if (total === 2) return "col-span-1 row-span-2 min-h-[200px]";
  if (i === 0) return "col-span-2 row-span-2 min-h-[240px] sm:min-h-[280px]";
  if (i === 3) return "col-span-2 row-span-1 min-h-[140px] sm:min-h-[160px]";
  return "col-span-1 row-span-1 min-h-[140px]";
}

export default memo(function GallerySection({ data }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const images = data.galleryImages;
  const total = images.length;
  const gridKey = useMemo(() => images.map((g) => g.src).join("|"), [images]);

  const openAt = useCallback((i: number) => setLightboxIdx(i), []);
  const close   = useCallback(() => setLightboxIdx(null), []);
  const prev    = useCallback(() => setLightboxIdx((i) => i === null ? null : (i - 1 + total) % total), [total]);
  const next    = useCallback(() => setLightboxIdx((i) => i === null ? null : (i + 1) % total), [total]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "Escape")     { e.preventDefault(); close(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, prev, next, close]);

  const currentImg = lightboxIdx !== null ? images[lightboxIdx] : null;

  return (
    <section
      className="relative isolate flex min-h-[100dvh] w-full flex-col"
    >
      <motion.div
        key={gridKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-[4] max-w-4xl mx-auto w-full px-4 sm:px-5 pt-16 pb-[calc(9.5rem+env(safe-area-inset-bottom,0px))] lg:pt-10 lg:pb-12"
      >
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{
              background: `linear-gradient(135deg, ${C_ACCENT}14, ${C_MED}10)`,
              border: `1px solid ${C_ACCENT}28`,
              boxShadow: `0 2px 12px ${C_ACCENT}10`,
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Camera size={13} style={{ color: C_ACCENT }} />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ fontFamily: F_CINZEL, color: C_ACCENT }}
            >
              Gallery
            </span>
          </motion.div>

          <h2
            className="text-[1.85rem] sm:text-3xl lg:text-4xl font-bold leading-tight mb-1 flex items-center justify-center gap-2"
            style={{ fontFamily: F_DANCING, color: C_DARK }}
          >
            <Heart size={22} style={{ color: C_MED, fill: `${C_MED}40` }} />
            Our Moments
          </h2>
          <p className="text-sm" style={{ fontFamily: F_LORA, color: C_MED }}>
            A scrapbook of joy — tap to immerse
          </p>
        </div>

        {/* Empty state */}
        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-[28px] p-16 flex flex-col items-center gap-4"
            style={{
              background: "rgba(255,252,250,0.82)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: `2px dashed ${C_MED}35`,
              boxShadow: `0 8px 32px rgba(45,62,50,0.07)`,
            }}
          >
            {/* Decorative floral ring */}
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 88,
                height: 88,
                background: `linear-gradient(145deg, ${C_MED}18, ${C_ACCENT}10)`,
                border: `2px dashed ${C_MED}40`,
                boxShadow: `0 0 0 8px ${C_ACCENT}06`,
              }}
            >
              <Camera size={36} style={{ color: `${C_MED}80` }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-0.5" style={{ fontFamily: F_LORA, color: C_MED }}>
                No photos yet
              </p>
              <p className="text-xs" style={{ fontFamily: F_LORA, color: `${C_MED}80` }}>
                Beautiful moments will appear here
              </p>
            </div>
          </motion.div>
        ) : (
          /* Bento grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 auto-rows-fr">
            {images.map((img, i) => (
              <motion.button
                key={`${img.src}-${i}`}
                type="button"
                className={`relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 ${cellClass(i, total)}`}
                style={{
                  borderRadius: 20,
                  border: `1.5px solid rgba(255,255,255,0.60)`,
                  boxShadow: `0 10px 36px rgba(45,62,50,0.10), 0 2px 8px rgba(84,107,87,0.07)`,
                }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * Math.min(i, 8), duration: 0.45 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openAt(i)}
              >
                <Image
                  src={img.src}
                  alt={img.alt || `Photo ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  sizes="(max-width:640px) 50vw, 33vw"
                />

                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(160deg, rgba(84,107,87,0.42) 0%, rgba(122,155,126,0.48) 100%)`,
                    backdropFilter: "blur(1px)",
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      background: "rgba(255,255,255,0.92)",
                      boxShadow: `0 4px 14px rgba(84,107,87,0.25)`,
                    }}
                  >
                    <Heart size={16} style={{ color: C_ACCENT }} fill={C_ACCENT} />
                  </div>
                  <span
                    className="text-[11px] font-bold text-white drop-shadow"
                    style={{ fontFamily: F_CINZEL }}
                  >
                    View
                  </span>
                </motion.div>

                {/* Maximize icon top-right on hover */}
                <div
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.88)", color: C_ACCENT }}
                >
                  <Maximize2 size={12} />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Lightbox with left/right arrows */}
      <AnimatePresence>
        {currentImg && lightboxIdx !== null && (
          <motion.div
            key="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
            style={{ background: "rgba(30,42,33,0.92)" }}
            onClick={close}
          >
            {/* Left arrow */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 sm:left-5 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-xl transition-transform active:scale-90"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", backdropFilter: "blur(8px)", border: `1px solid rgba(255,255,255,0.20)` }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Right arrow */}
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 sm:right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full shadow-xl transition-transform active:scale-90"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", backdropFilter: "blur(8px)", border: `1px solid rgba(255,255,255,0.20)` }}
                aria-label="Next photo"
              >
                <ChevronRight size={22} />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={lightboxIdx}
                initial={{ scale: 0.94, opacity: 0, x: 20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.94, opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="relative w-full max-w-3xl max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: `2px solid ${C_MED}40`,
                  boxShadow: `0 0 0 1px ${C_ACCENT}20, 0 24px 60px rgba(30,42,33,0.60), 0 0 40px rgba(84,107,87,0.18)`,
                }}
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={close}
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
                  style={{ background: "rgba(30,42,33,0.70)", color: "rgba(255,255,255,0.90)", backdropFilter: "blur(4px)" }}
                  aria-label="Close"
                >
                  <X size={17} />
                </button>

                {/* Counter pill */}
                {total > 1 && (
                  <div
                    className="absolute left-3 top-3 z-10 px-3 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: "rgba(30,42,33,0.65)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", fontFamily: F_CINZEL }}
                  >
                    {lightboxIdx + 1} / {total}
                  </div>
                )}

                {/* Image */}
                <div className="relative w-full bg-black/50" style={{ minHeight: "200px", maxHeight: "min(78vh, 820px)" }}>
                  <Image
                    src={currentImg.src}
                    alt={currentImg.alt || `Photo ${lightboxIdx + 1}`}
                    width={1200}
                    height={1400}
                    className="w-full h-full object-contain max-h-[78vh]"
                    style={{ maxHeight: "min(78vh, 820px)" }}
                  />
                </div>

                {/* Caption bar */}
                <div
                  className="px-5 py-3 flex items-center justify-between gap-2"
                  style={{ background: `linear-gradient(135deg, rgba(30,42,33,0.95) 0%, rgba(84,107,87,0.92) 100%)`, borderTop: `1px solid ${C_MED}25` }}
                >
                  <p className="text-sm font-medium truncate" style={{ fontFamily: F_LORA, color: "rgba(245,252,247,0.90)" }}>
                    {currentImg.alt || `Moment ${lightboxIdx + 1}`}
                  </p>
                  {total > 1 && (
                    <div className="flex items-center gap-1 shrink-0">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                          className="rounded-full transition-all"
                          style={{
                            width: i === lightboxIdx ? 16 : 6,
                            height: 6,
                            background: i === lightboxIdx ? C_ACCENT : `${C_MED}50`,
                          }}
                          aria-label={`Go to photo ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});
