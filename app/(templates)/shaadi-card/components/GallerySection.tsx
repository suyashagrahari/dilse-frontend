"use client";

import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, Camera, X, Maximize2 } from "lucide-react";
import type { ShaadiData } from "./types";

const C_ACCENT = "#AB1C3E";
const C_MED = "#CB6B82";
const C_DARK = "#6D2B3B";
const C_BG = "#FDFBF7";
const F_CINZEL = "var(--font-cinzel), ui-serif, Georgia, serif";
const F_LORA = "var(--font-lora), Georgia, serif";
const F_DANCING = "var(--font-dancing), cursive";

interface Props {
  data: ShaadiData;
}

function HomeMatchBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 min-h-full" style={{ background: C_BG }}>
        <Image
          src="/shaadi-card/image10.webp"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "rgba(255,255,255,0.38)", mixBlendMode: "soft-light" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
        style={{ height: "55%", background: "linear-gradient(to top, rgba(253,244,248,0.42) 0%, transparent 100%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[32%] max-h-[280px]"
        style={{ background: "linear-gradient(to bottom, rgba(255,251,248,0.45) 0%, transparent 100%)" }}
        aria-hidden
      />
    </>
  );
}

function InvitationStyleCorners() {
  return (
    <>
      {/* Top left */}
      <div
        className="pointer-events-none absolute left-[-20px] top-0 z-[3] mix-blend-multiply"
        style={{ width: "clamp(120px, 40vw, 240px)", height: "clamp(110px, 22vh, 260px)", opacity: 0.88 }}
        aria-hidden
      >
        <div className="relative h-full w-full scale-x-[-1]">
          <Image
            src="/shaadi-card/image5.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
            style={{ objectPosition: "left top" }}
          />
        </div>
      </div>

      {/* Top right */}
      <div
        className="pointer-events-none absolute right-[-20px] top-0 z-[3] mix-blend-multiply"
        style={{ width: "clamp(120px, 40vw, 240px)", height: "clamp(110px, 22vh, 260px)", opacity: 0.88 }}
        aria-hidden
      >
        <div className="relative h-full w-full">
          <Image
            src="/shaadi-card/image4.webp"
            alt=""
            fill
            sizes="240px"
            className="object-contain"
            style={{ objectPosition: "right top" }}
          />
        </div>
      </div>

      {/* Bottom left */}
      <div
        className="pointer-events-none absolute bottom-[-20px] left-[-30px] z-[3] mix-blend-multiply"
        style={{ width: "clamp(180px, 50vw, 380px)", height: "clamp(140px, 28vh, 300px)", opacity: 0.95 }}
        aria-hidden
      >
        <div className="relative h-full w-full scale-x-[-1]">
          <Image
            src="/shaadi-card/image7.webp"
            alt=""
            fill
            sizes="380px"
            className="object-contain"
            style={{ objectPosition: "left bottom" }}
          />
        </div>
      </div>

      {/* Bottom right */}
      <div
        className="pointer-events-none absolute bottom-[-20px] right-[-30px] z-[3] mix-blend-multiply"
        style={{ width: "clamp(180px, 50vw, 380px)", height: "clamp(140px, 28vh, 300px)", opacity: 0.95 }}
        aria-hidden
      >
        <div className="relative h-full w-full">
          <Image
            src="/shaadi-card/image6.webp"
            alt=""
            fill
            sizes="380px"
            className="object-contain"
            style={{ objectPosition: "right bottom" }}
          />
        </div>
      </div>
    </>
  );
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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const images = data.galleryImages;
  const total = images.length;

  const gridKey = useMemo(() => images.map((g) => g.src).join("|"), [images]);

  return (
    <section
      className="relative isolate flex min-h-[100dvh] w-full flex-col overflow-hidden"
      style={{ background: C_BG }}
    >
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="relative h-full w-full">
          <HomeMatchBackground />
          <InvitationStyleCorners />
        </div>
      </div>

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
            <Heart size={22} className="text-rose-400 fill-rose-200" />
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
              boxShadow: `0 8px 32px rgba(109,43,59,0.07)`,
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
                className={`relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 focus-visible:ring-offset-2 ${cellClass(i, total)}`}
                style={{
                  borderRadius: 20,
                  border: `1.5px solid rgba(255,255,255,0.60)`,
                  boxShadow: `0 10px 36px rgba(109,43,59,0.10), 0 2px 8px rgba(171,28,62,0.07)`,
                }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * Math.min(i, 8), duration: 0.45 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLightbox({ src: img.src, alt: img.alt || `Photo ${i + 1}` })}
              >
                <Image
                  src={img.src}
                  alt={img.alt || `Photo ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  sizes="(max-width:640px) 50vw, 33vw"
                />

                {/* Rose tinted hover overlay with heart + "View" */}
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(160deg, rgba(171,28,62,0.42) 0%, rgba(203,107,130,0.52) 100%)`,
                    backdropFilter: "blur(1px)",
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      background: "rgba(255,255,255,0.92)",
                      boxShadow: `0 4px 14px rgba(171,28,62,0.25)`,
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

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
            style={{ background: "rgba(20,8,16,0.92)" }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="relative w-full max-w-3xl max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                border: `2px solid ${C_MED}40`,
                boxShadow: `0 0 0 1px ${C_ACCENT}20, 0 24px 60px rgba(20,8,16,0.60), 0 0 40px rgba(171,28,62,0.18)`,
              }}
            >
              {/* Close button top-right of image */}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
                style={{ background: "rgba(20,8,16,0.70)", color: "rgba(255,255,255,0.90)", backdropFilter: "blur(4px)" }}
                aria-label="Close"
              >
                <X size={17} />
              </button>

              {/* Image */}
              <div
                className="relative w-full bg-black/50"
                style={{ minHeight: "200px", maxHeight: "min(78vh, 820px)" }}
              >
                <Image
                  src={lightbox.src}
                  alt={lightbox.alt}
                  width={1200}
                  height={1400}
                  className="w-full h-full object-contain max-h-[78vh]"
                  style={{ maxHeight: "min(78vh, 820px)" }}
                />
              </div>

              {/* Caption bar with gradient bg */}
              <div
                className="px-5 py-3 flex items-center justify-between gap-2"
                style={{
                  background: `linear-gradient(135deg, rgba(20,8,16,0.95) 0%, rgba(109,43,59,0.92) 100%)`,
                  borderTop: `1px solid ${C_MED}25`,
                }}
              >
                <p
                  className="text-sm font-medium truncate"
                  style={{ fontFamily: F_LORA, color: "rgba(255,240,245,0.90)" }}
                >
                  {lightbox.alt}
                </p>
                <Heart
                  size={14}
                  className="shrink-0"
                  style={{ color: C_MED, fill: `${C_MED}50` }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});
