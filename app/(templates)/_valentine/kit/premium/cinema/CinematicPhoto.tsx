"use client";

// ─── <CinematicPhoto> — a photo shot like a film still ───────────────────────
//
//   <CinematicPhoto photo={data.photos[0]} grade="warm" caption="Goa, 2023" />
//   <CinematicPhoto photo={p} frame="full" letterbox kenBurns="in" style={{ height: "100svh" }} />
//
// Honours the sender's crop (LovePhoto cropX/cropY/scale via <CroppedPhoto>).
// On entering view it focus-pulls (blur → sharp, 1.4 s, once) and then drifts
// (Ken Burns, a slow CSS transform on a wrapper — composited, zero JS).
// Grades are a CSS filter plus a blended tint layer; `letterbox` adds 2.39:1
// bars inside the frame. "framed" gives it a paper mat + caption line.
// Reduced motion: no drift, no blur — the still, graded, captioned.

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useReducedMotion } from "../../useReducedMotion";
import CroppedPhoto from "../../CroppedPhoto";
import type { LovePhoto } from "../../../types";
import { CinemaStyles } from "./Overlays";
import { EASE_OUT } from "./shared";

export type PhotoGrade = "none" | "warm" | "tealorange" | "noir" | "rose";

const GRADES: Record<PhotoGrade, { filter: string; tint: string; blend: CSSProperties["mixBlendMode"] }> = {
  none: { filter: "none", tint: "transparent", blend: "normal" },
  warm: { filter: "saturate(1.08) contrast(1.06) sepia(.14) brightness(1.02)", tint: "linear-gradient(180deg, rgba(255,190,120,.16), rgba(120,50,20,.18))", blend: "soft-light" },
  tealorange: { filter: "saturate(1.15) contrast(1.1)", tint: "linear-gradient(200deg, rgba(255,150,70,.22) 0%, transparent 45%, rgba(0,110,130,.32) 100%)", blend: "overlay" },
  noir: { filter: "grayscale(1) contrast(1.25) brightness(.95)", tint: "radial-gradient(80% 70% at 50% 40%, transparent, rgba(0,0,0,.35))", blend: "multiply" },
  rose: { filter: "saturate(1.05) contrast(1.04) brightness(1.03)", tint: "linear-gradient(160deg, rgba(255,150,180,.22), rgba(120,30,70,.2))", blend: "soft-light" },
};

const KB_CSS = `
@keyframes cin-kb-in{from{transform:scale(1.02) translate3d(0,0,0)}to{transform:scale(1.14) translate3d(-1.5%,-1%,0)}}
@keyframes cin-kb-out{from{transform:scale(1.15) translate3d(1.5%,1%,0)}to{transform:scale(1.03) translate3d(0,0,0)}}
@keyframes cin-kb-pan{from{transform:scale(1.12) translate3d(-3%,0,0)}to{transform:scale(1.12) translate3d(3%,0,0)}}
`;

export interface CinematicPhotoProps {
  photo: LovePhoto | string;
  grade?: PhotoGrade;
  /** Ken Burns drift direction, or false (default "in"). */
  kenBurns?: "in" | "out" | "pan" | false;
  /** Drift duration in seconds (default 18). */
  drift?: number;
  letterbox?: boolean;
  /** Blur → sharp on entering view (default true). */
  focusPull?: boolean;
  caption?: string;
  /** "framed" = paper mat + caption under it; "full" = bleed, caption over a scrim. */
  frame?: "framed" | "full";
  /** CSS aspect-ratio for the picture (default "4 / 5"; ignored when style sets a height on "full"). */
  aspect?: string;
  eager?: boolean;
  alt?: string;
  style?: CSSProperties;
  className?: string;
}

export default function CinematicPhoto({
  photo, grade = "warm", kenBurns = "in", drift = 18, letterbox = false, focusPull = true, caption, frame = "framed",
  aspect = "4 / 5", eager, alt, style, className,
}: CinematicPhotoProps) {
  const reduce = useReducedMotion();
  const p: LovePhoto = typeof photo === "string" ? { url: photo } : photo;
  const g = GRADES[grade];
  const cap = caption ?? p.caption;
  const full = frame === "full";
  const kb = !reduce && kenBurns ? `cin-kb-${kenBurns} ${drift}s cubic-bezier(.45,.05,.55,.95) infinite alternate` : undefined;

  const picture = (
    <div style={{ position: "relative", overflow: "hidden", aspectRatio: full ? undefined : aspect, height: full ? "100%" : undefined, background: "#111", borderRadius: full ? 0 : 3 }}>
      <motion.div
        initial={focusPull && !reduce ? { filter: "blur(14px)", scale: 1.06, opacity: 0.4 } : false}
        whileInView={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.4, ease: EASE_OUT }}
        style={{ position: "absolute", inset: 0 }}
      >
        <div style={{ position: "absolute", inset: 0, animation: kb, willChange: kb ? "transform" : undefined, filter: g.filter }}>
          <CroppedPhoto photo={p} alt={alt} eager={eager} style={{ background: "transparent" }} />
        </div>
      </motion.div>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: g.tint, mixBlendMode: g.blend, pointerEvents: "none" }} />
      {/* A whisper of inner vignette so every photo sits "in" the frame. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 80px rgba(0,0,0,.28)" }} />
      {letterbox && (
        <>
          <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: "11%", background: "#000" }} />
          <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "11%", background: "#000" }} />
        </>
      )}
      {full && cap && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: letterbox ? "11%" : 0, padding: "48px 24px 22px", background: "linear-gradient(transparent, rgba(0,0,0,.55))" }}>
          <Caption text={cap} light />
        </div>
      )}
    </div>
  );

  return (
    <figure className={className} style={{ margin: 0, ...(full ? { position: "relative", height: "100%" } : { padding: "10px 10px 0", background: "#f7f2ea", borderRadius: 4 }), ...style }}>
      <CinemaStyles />
      <style href="cinema-kenburns" precedence="default">{KB_CSS}</style>
      {picture}
      {!full && <div style={{ padding: cap ? "14px 6px 16px" : "0 0 10px" }}>{cap && <Caption text={cap} />}</div>}
    </figure>
  );
}

function Caption({ text, light }: { text: string; light?: boolean }) {
  return (
    <figcaption
      style={{
        font: "italic 400 19px/1.3 'Cormorant Garamond', var(--font-playfair, 'Playfair Display'), Georgia, serif",
        letterSpacing: ".01em", color: light ? "rgba(255,248,240,.95)" : "#3a2a24", textAlign: "center", textWrap: "balance",
        textShadow: light ? "0 1px 12px rgba(0,0,0,.4)" : undefined,
      }}
    >
      {text}
    </figcaption>
  );
}
