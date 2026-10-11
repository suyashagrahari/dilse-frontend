"use client";

// Photos stitched into a patchwork memory quilt: each patch has its own
// fabric border (gingham, polka, knit, stripes) and a running stitch round
// the photo. Patches are jelly buttons: press → squish, and the squish
// ripples outward through the quilt (delay by distance). Tap opens the
// lightbox. No photos → embroidered fabric patches instead.

import { useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { CroppedPhoto, haptic, PhotoLightbox, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { Btn, H, Hint, Title, sfx } from "./ui";

const FABRICS = [
  `repeating-linear-gradient(0deg, rgba(255,111,145,.35) 0 6px, transparent 6px 12px), repeating-linear-gradient(90deg, rgba(255,111,145,.35) 0 6px, #FFF1F4 6px 12px)`,
  `radial-gradient(circle at 25% 25%, #fff 0 2.2px, transparent 2.6px) 0 0/12px 12px, radial-gradient(circle at 75% 75%, #fff 0 2.2px, transparent 2.6px) 0 0/12px 12px, ${H.lavender}`,
  `repeating-linear-gradient(45deg, #FFD98A 0 7px, #FFE9B8 7px 14px)`,
  `repeating-linear-gradient(90deg, ${H.mint} 0 8px, #E4F6EC 8px 16px)`,
  `radial-gradient(circle at 50% 50%, ${H.cheek} 0 2px, transparent 2.5px) 0 0/10px 10px, #FFD3DE`,
  `repeating-linear-gradient(-45deg, ${H.peach} 0 5px, #FFD4C2 5px 10px)`,
];

function Patch({ photo, k, cols, ripple, onTap, reduced, label }: { photo?: LovePhoto; k: number; cols: number; ripple: { at: number; n: number } | null; onTap: () => void; reduced: boolean; label: string }) {
  const r = Math.floor(k / cols);
  const c = k % cols;
  const delay = ripple ? Math.hypot(r - Math.floor(ripple.at / cols), c - (ripple.at % cols)) * 0.08 : 0;
  const s = useMotionValue(1);
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onTap}
      onPointerDown={() => {
        if (!reduced) animate(s, 0.9, { duration: 0.12 });
      }}
      onPointerUp={() => {
        if (!reduced) animate(s, 1, { type: "spring", stiffness: 500, damping: 9 });
      }}
      onPointerLeave={() => s.get() !== 1 && animate(s, 1, { type: "spring", stiffness: 500, damping: 12 })}
      style={{ scale: s, position: "relative", padding: 7, border: 0, borderRadius: 8, background: FABRICS[k % FABRICS.length], cursor: "pointer", boxShadow: "inset 0 0 0 1.5px rgba(107,66,50,.2)" }}
    >
      <motion.span
        key={ripple ? `${ripple.n}` : "still"}
        initial={false}
        animate={ripple && !reduced ? { scale: [1, 0.94, 1.03, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, delay }}
        style={{ display: "block", position: "relative", aspectRatio: "1 / 1", borderRadius: 4, overflow: "hidden", background: "#FFF6EC", outline: "2px dashed rgba(255,255,255,.95)", outlineOffset: -5 }}
      >
        {photo ? (
          <CroppedPhoto photo={photo} eager />
        ) : (
          <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden style={{ display: "block" }}>
            <path d="M30 46 C14 36 12 24 19 21 C24 19 28 22 30 26 C32 22 36 19 41 21 C48 24 46 36 30 46 Z" fill="none" stroke={[H.cheek, "#7E5BC2", H.cocoa][k % 3]} strokeWidth="2.4" strokeDasharray="3 2.4" />
          </svg>
        )}
      </motion.span>
    </motion.button>
  );
}

export default function Quilt({ photos, onNext }: { photos: LovePhoto[]; onNext: () => void }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const [ripple, setRipple] = useState<{ at: number; n: number } | null>(null);
  const n = photos.length || 6;
  const cols = n <= 4 ? 2 : 3;

  const tap = (k: number) => {
    haptic(10);
    sfx.pop(0.8 + (k % 3) * 0.1);
    setRipple((r) => ({ at: k, n: (r?.n ?? 0) + 1 }));
    if (photos.length) window.setTimeout(() => setOpen(k), reduced ? 0 : 260);
  };

  return (
    <>
      <Title>Our memory quilt</Title>
      <p style={{ margin: "-6px 0 0", maxWidth: 320, font: `400 15px/1.45 ${FONTS.ui}`, color: VW.inkSoft }}>
        {photos.length ? "Every patch is a hug we already had. Tap one 🧶" : "Patches waiting for our next photos. Squish them anyway 🧶"}
      </p>
      <div style={{ position: "relative", width: "min(100%, calc(420px * var(--vw-s, 1)))", padding: 12, borderRadius: 20, background: "#FFF6EC", boxShadow: "0 0 0 3px #F2DDCF, 0 26px 50px -28px rgba(74,44,32,.6)" }}>
        {/* the quilt's outer running stitch */}
        <div aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 16, border: `2px dashed ${H.peach}`, pointerEvents: "none" }} />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 6 }}>
          {Array.from({ length: n }, (_, k) => (
            <Patch
              key={k}
              k={k}
              cols={cols}
              photo={photos[k]}
              ripple={ripple}
              reduced={reduced}
              onTap={() => tap(k)}
              label={photos[k] ? (photos[k].caption ? `Open photo: ${photos[k].caption}` : `Open photo ${k + 1}`) : `Quilt patch ${k + 1}`}
            />
          ))}
        </div>
      </div>
      {photos.some((p) => p.caption) && (
        <p style={{ margin: 0, maxWidth: 360, font: `500 18px/1.4 ${FONTS.script}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>
          {photos
            .map((p) => p.caption)
            .filter(Boolean)
            .slice(0, 4)
            .join(" · ")}
        </p>
      )}
      <Hint>{photos.length ? "Tap a patch — it squishes, then opens" : "Tap a patch to squish it"}</Hint>
      <Btn onClick={onNext}>Hug coupons, for later →</Btn>
      {photos.length > 0 && <PhotoLightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
