"use client";

// ─── PhotoLightbox — full-screen photo viewer ────────────────────────────────
//
// Swipe (touch or mouse drag), arrow buttons, ←/→/Esc keys, caption + the
// little note under the photo. Controlled: pass `index` (null = closed).
// Portalled to <body> so it sits above any day's stacking contexts.
//
//   const [open, setOpen] = useState<number | null>(null);
//   <PhotoLightbox photos={data.photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { LovePhoto } from "../types";
import { FONTS } from "../theme";
import { useReducedMotion } from "./useReducedMotion";

export interface PhotoLightboxProps {
  photos: readonly LovePhoto[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}

export default function PhotoLightbox({ photos, index, onIndex, onClose }: PhotoLightboxProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const startX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setMounted(true), []);

  const open = index != null && index >= 0 && index < photos.length;
  const go = (d: number) => {
    if (!open) return;
    onIndex((index! + d + photos.length) % photos.length);
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  if (!mounted) return null;
  const p = open ? photos[index!] : null;

  const arrow: React.CSSProperties = {
    width: 48, height: 48, borderRadius: "50%", border: 0, background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 22, cursor: "pointer",
  };

  return createPortal(
    <AnimatePresence>
      {p && (
        <motion.div
          key="vw-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={p.caption || `Photo ${index! + 1} of ${photos.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,6,12,.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 16px 24px", gap: 14 }}
        >
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" style={{ ...arrow, position: "absolute", top: 12, right: 12, width: 44, height: 44, fontSize: 16 }}>
            ✕
          </button>
          <motion.div
            key={index}
            initial={reduced ? false : { scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => (startX.current = e.clientX)}
            onPointerUp={(e) => {
              if (startX.current == null) return;
              const dx = e.clientX - startX.current;
              startX.current = null;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            }}
            style={{ width: "min(92vw, 520px)", maxHeight: "70dvh", aspectRatio: "4 / 5", borderRadius: 18, overflow: "hidden", background: "#111", touchAction: "pan-y" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption || ""} draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none" }} />
          </motion.div>
          {(p.caption || p.note) && (
            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, textAlign: "center", color: "#fff" }}>
              {p.caption && <p style={{ margin: 0, font: `700 24px ${FONTS.script}` }}>{p.caption}</p>}
              {p.note && <p style={{ margin: "6px 0 0", font: `400 15px/1.5 ${FONTS.ui}`, opacity: 0.85 }}>{p.note}</p>}
            </div>
          )}
          {photos.length > 1 && (
            <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 16, color: "#fff", font: `600 14px ${FONTS.ui}` }}>
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" style={arrow}>‹</button>
              <span aria-live="polite">{index! + 1} / {photos.length}</span>
              <button type="button" onClick={() => go(1)} aria-label="Next photo" style={arrow}>›</button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
