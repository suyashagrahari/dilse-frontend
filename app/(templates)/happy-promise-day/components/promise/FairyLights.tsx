"use client";

// Photos as polaroids pegged to strings of fairy lights. Two per string, each
// one a pendulum: drag it sideways and let go — it swings back on an
// under-damped spring. A tap (no real drag) opens the lightbox. With no
// photos, the strings carry illustrated "promise cards" instead.

import { useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { CroppedPhoto, haptic, PhotoLightbox, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { Btn, Hint, P, Title, clamp } from "./ui";

const BULBS = ["#FFD98A", "#F7B6C8", "#FFF3C4", "#CDEBDD", "#FFC4A8"];

type Card = { photo?: LovePhoto; caption: string; doodle?: number };

function Polaroid({ card, index, onOpen, reduced }: { card: Card; index: number; onOpen: () => void; reduced: boolean }) {
  const angle = useMotionValue(0);
  const start = useRef<{ id: number; x: number; moved: boolean } | null>(null);
  const tilt = index % 2 ? 3 : -3;

  const down = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    start.current = { id: e.pointerId, x: e.clientX, moved: false };
    angle.stop();
  };
  const move = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 6) s.moved = true;
    if (s.moved) angle.set(clamp(-dx * 0.32, -38, 38));
  };
  const up = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    start.current = null;
    if (!s.moved) {
      onOpen();
      return;
    }
    haptic(8);
    animate(angle, 0, reduced ? { duration: 0.2 } : { type: "spring", stiffness: 90, damping: 4, mass: 1.1 });
  };

  return (
    <motion.div style={{ rotate: angle, originX: 0.5, originY: 0, touchAction: "pan-y" }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className={reduced ? undefined : "pd-sway"} style={{ transformOrigin: "50% 0", animationDelay: `${-index * 0.7}s` }}>
        {/* wooden peg */}
        <div aria-hidden style={{ width: 12, height: 26, margin: "0 auto -12px", borderRadius: 3, background: "linear-gradient(90deg, #C99A5B, #E2BC85 50%, #B98949)", boxShadow: "0 2px 3px rgba(0,0,0,.2)", position: "relative", zIndex: 2 }} />
        <button
          type="button"
          aria-label={card.caption ? `Open photo: ${card.caption}` : `Open photo ${index + 1}`}
          onClick={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen();
            }
          }}
          style={{ display: "block", width: "100%", padding: "8px 8px 0", border: 0, borderRadius: 3, background: "#fff", boxShadow: "0 16px 26px -14px rgba(94,20,51,.55)", cursor: "grab", transform: `rotate(${tilt}deg)` }}
        >
          <span style={{ display: "block", aspectRatio: "4 / 5", borderRadius: 2, overflow: "hidden", background: P.blush }}>
            {card.photo ? <CroppedPhoto photo={card.photo} /> : <Doodle n={card.doodle ?? 0} />}
          </span>
          <span style={{ minHeight: 37, maxHeight: 37, boxSizing: "content-box", padding: "6px 2px 8px", font: `600 16px/1.15 ${FONTS.script}`, color: "#4a2a36", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflowWrap: "anywhere" } as React.CSSProperties}>
            {card.caption}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

/** Hand-drawn little scenes for the no-photo fallback. */
function Doodle({ n }: { n: number }) {
  const bg = [P.petal, P.mint, P.butter, P.lilac][n % 4];
  return (
    <svg viewBox="0 0 100 125" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ display: "block", background: `linear-gradient(180deg, #fff, ${bg})` }}>
      {n % 4 === 0 && (
        <g fill="none" stroke={P.berry} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 60 C18 50 22 36 32 38 C38 39 40 45 40 48 C40 45 42 39 48 38 C58 36 62 50 50 60 L40 70 Z" fill={P.rose} />
          <path d="M52 66 C42 58 46 46 54 48 C59 49 60 54 60 56 C60 54 62 49 66 48 C74 46 78 58 68 66 L60 74 Z" fill="#fff" />
        </g>
      )}
      {n % 4 === 1 && (
        <g stroke={P.berry} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 52 h36 v22 q0 14 -18 14 q-18 0 -18 -14 z" fill="#fff" />
          <path d="M64 58 q12 0 10 10 q-2 8 -10 6" fill="none" />
          <path d="M38 44 q-4 -8 2 -14 M48 44 q-4 -8 2 -14" fill="none" opacity=".6" />
          <path d="M40 66 C36 62 37 57 40 58 C41.5 58.4 42 60 42 60.5 C42 60 42.5 58.4 44 58 C47 57 48 62 44 66 L42 68 Z" fill={P.rose} strokeWidth="1.4" />
        </g>
      )}
      {n % 4 === 2 && (
        <g stroke={P.berry} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 30 a22 22 0 1 0 14 38 a18 18 0 1 1 -14 -38 z" fill="#FFF3C4" />
          <path d="M24 40 l2 5 l5 1 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -1 z M36 76 l1.5 3.5 l3.5 1 l-3.5 1.5 l-1.5 3.5 l-1.5 -3.5 l-3.5 -1.5 l3.5 -1 z" fill="#fff" strokeWidth="1.4" />
        </g>
      )}
      {n % 4 === 3 && (
        <g fill="none" stroke={P.berry} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="38" cy="46" r="9" fill="#fff" />
          <circle cx="62" cy="46" r="9" fill="#fff" />
          <path d="M38 55 v22 M62 55 v22 M38 64 L50 70 L62 64 M38 77 l-6 12 M38 77 l6 12 M62 77 l-6 12 M62 77 l6 12" />
          <path d="M50 34 C46 30 46 26 48.5 26 C49.5 26 50 27 50 27.5 C50 27 50.5 26 51.5 26 C54 26 54 30 50 34 Z" fill={P.rose} strokeWidth="1.4" />
        </g>
      )}
    </svg>
  );
}

function LightString({ width = 360, sag = 46, seed = 0, reduced }: { width?: number; sag?: number; seed?: number; reduced: boolean }) {
  const pts = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (let k = 1; k < 12; k++) {
      const t = k / 12;
      out.push({ x: t * width, y: 14 + 4 * sag * t * (1 - t) });
    }
    return out;
  }, [width, sag]);
  return (
    <svg viewBox={`0 0 ${width} ${sag + 40}`} width="100%" height={sag + 40} preserveAspectRatio="none" aria-hidden style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={`M-10 10 Q${width / 2} ${14 + 2 * sag} ${width + 10} 10`} fill="none" stroke="#7A5A48" strokeWidth="1.6" />
      {pts.map((p, k) => (
        <g key={k} transform={`translate(${p.x} ${p.y})`}>
          <rect x="-2.5" y="-2" width="5" height="5" rx="1" fill="#6b5a4a" />
          <circle cx="0" cy="9" r="9" fill={BULBS[(k + seed) % BULBS.length]} opacity=".35" className={reduced ? undefined : "pd-twinkle"} style={{ animationDelay: `${((k * 7 + seed * 3) % 10) * 0.23}s` }} />
          <ellipse cx="0" cy="8" rx="3.6" ry="5.2" fill={BULBS[(k + seed) % BULBS.length]} stroke="rgba(0,0,0,.08)" />
          <ellipse cx="-1" cy="6.4" rx="1" ry="1.8" fill="#fff" opacity=".8" />
        </g>
      ))}
    </svg>
  );
}

export default function FairyLights({ photos, fallbackCaptions, nextLabel, onNext }: { photos: LovePhoto[]; fallbackCaptions: string[]; nextLabel: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const cards: Card[] = photos.length
    ? photos.map((p, i) => ({ photo: p, caption: p.caption || `vaada #${i + 1} ✓` }))
    : fallbackCaptions.slice(0, 4).map((c, i) => ({ caption: c, doodle: i }));
  const rows: Card[][] = [];
  for (let k = 0; k < cards.length; k += 2) rows.push(cards.slice(k, k + 2));

  return (
    <>
      <style>{`
        @keyframes pd-sway { 0%,100% { transform: rotate(-1.6deg) } 50% { transform: rotate(1.6deg) } }
        @keyframes pd-twinkle { 0%,100% { opacity: .2; transform: scale(.8) } 50% { opacity: .75; transform: scale(1.25) } }
        .pd-sway { animation: pd-sway 3.4s ease-in-out infinite }
        .pd-twinkle { animation: pd-twinkle 2.3s ease-in-out infinite; transform-box: fill-box; transform-origin: center }
        @media (prefers-reduced-motion: reduce) { .pd-sway, .pd-twinkle { animation: none } }
      `}</style>
      <Title>Promises we&apos;ve kept</Title>
      <p style={{ margin: "-6px 0 0", maxWidth: 320, font: `400 15px/1.45 ${FONTS.ui}`, color: VW.inkSoft }}>
        {photos.length ? "Proof that the vaade are already real ✨" : "Our photos are still being made. Till then, these ✨"}
      </p>

      <div style={{ width: "min(100%, calc(440px * var(--vw-s, 1)))", display: "grid", gap: 10, marginTop: 4 }}>
        {rows.map((row, r) => (
          <div key={r} style={{ position: "relative", paddingTop: 20, height: "auto" }}>
            <LightString seed={r} reduced={reduced} />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, padding: "0 16px" }}>
              {row.map((card, c) => {
                const idx = r * 2 + c;
                // sit each peg on the curve (t ≈ .3 / .7 of the sag)
                const drop = 28 + (row.length === 1 ? 46 : 32);
                return (
                  <div key={idx} style={{ marginTop: drop - 30, gridColumn: row.length === 1 ? "1 / span 2" : undefined, width: row.length === 1 ? "50%" : "100%", justifySelf: "center" }}>
                    <Polaroid card={card} index={idx} reduced={reduced} onOpen={() => (card.photo ? setOpen(photos.indexOf(card.photo)) : undefined)} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Hint style={{ marginTop: 8 }}>{photos.length ? "Swing a polaroid · tap to open it" : "Give them a swing 🎐"}</Hint>
      <Btn onClick={onNext}>{nextLabel}</Btn>
      {photos.length > 0 && <PhotoLightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
