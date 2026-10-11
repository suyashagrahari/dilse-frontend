"use client";

// ─── <Fluent3D> — real 3D-rendered objects instead of flat hand-drawn SVG ────
//
//   <Fluent3D name="rose" size={160} />                      // floats, soft contact shadow
//   <Fluent3D name="jack-o-lantern" size={200} glow="#ff8a3d" />
//   <Fluent3D name="ring" size={120} float={false} />
//
// Art: Microsoft Fluent UI Emoji, "3D" style — https://github.com/microsoft/fluentui-emoji
// Copyright (c) Microsoft Corporation. Licensed under the MIT License. The PNGs
// were resized to 256 px WebP (≈ 5 KB each) and live on the media CDN at
//   templates/_premium/fluent/<key>.webp   (source copies: media-src/templates/_premium/fluent)
// To add a key: add it to FLUENT_KEYS, then run the downloader + upload as in
// cinema/README.md ("Fluent3D assets").
//
// 256 px art: keep `size` ≤ 200 CSS px for crispness at DPR 2 (it's soft above).
// The bob is a CSS keyframe (composited); the shadow breathes in sync.
// Reduced motion: still.

import type { CSSProperties } from "react";
import { templateMedia } from "@/lib/templateMedia";
import { CinemaStyles } from "./Overlays";

export const FLUENT_KEYS = [
  // love
  "rose", "wilted-flower", "bouquet", "tulip", "cherry-blossom", "ring", "gem", "love-letter", "envelope",
  "heart-ribbon", "sparkling-heart", "red-heart", "two-hearts", "heart-arrow", "heart-fire", "growing-heart",
  "kiss-mark", "face-blowing-kiss", "smiling-hearts", "people-hugging", "teddy-bear",
  // treats + gifts
  "chocolate", "candy", "lollipop", "gift", "ribbon", "clinking-glasses", "balloon",
  // night + light
  "candle", "crescent-moon", "full-moon", "star", "sparkles", "glowing-star", "milky-way", "fireworks", "sparkler",
  // halloween
  "jack-o-lantern", "ghost", "bat", "spider", "spider-web", "skull", "crystal-ball", "magic-wand", "black-cat", "coffin", "broom",
  // keepsakes
  "lock", "key", "hourglass", "camera-flash", "musical-notes", "film-frames", "projector", "video-camera",
] as const;

export type FluentKey = (typeof FLUENT_KEYS)[number];

/** CDN URL of a Fluent 3D object. */
export const fluentUrl = (key: FluentKey): string => templateMedia("_premium/fluent", `${key}.webp`);

const CSS = `
@keyframes cin-bob{0%,100%{transform:translate3d(0,0,0) rotate(-2deg)}50%{transform:translate3d(0,-7%,0) rotate(2deg)}}
@keyframes cin-bobshadow{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(.78);opacity:.28}}
`;

export interface Fluent3DProps {
  name: FluentKey;
  /** Rendered size in CSS px (default 140). */
  size?: number;
  /** Idle float/bob (default true). */
  float?: boolean;
  /** Bob period in seconds (default 5.5). Vary it between neighbours. */
  period?: number;
  /** Phase offset in seconds so a group doesn't bob in lockstep. */
  phase?: number;
  /** Contact shadow under the object (default true). */
  shadow?: boolean;
  /** A coloured halo behind it (hex), or false. */
  glow?: string | false;
  alt?: string;
  eager?: boolean;
  style?: CSSProperties;
  className?: string;
}

export default function Fluent3D({ name, size = 140, float = true, period = 5.5, phase = 0, shadow = true, glow = false, alt = "", eager, style, className }: Fluent3DProps) {
  const anim = (k: string) => (float ? `${k} ${period}s cubic-bezier(.45,.05,.55,.95) ${-phase}s infinite` : undefined);
  return (
    <span className={className} style={{ position: "relative", display: "inline-block", width: size, height: size * 1.12, ...style }}>
      <CinemaStyles />
      <style href="cinema-fluent" precedence="default">{CSS}</style>
      {glow && (
        <span aria-hidden style={{ position: "absolute", left: "-25%", right: "-25%", top: "-25%", height: "125%", borderRadius: "50%", background: `radial-gradient(closest-side, ${glow}66, ${glow}22 55%, transparent)`, pointerEvents: "none" }} />
      )}
      {shadow && (
        <span
          aria-hidden
          className="cin-anim"
          style={{ position: "absolute", left: "22%", right: "22%", bottom: 0, height: "9%", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.55), transparent)", animation: anim("cin-bobshadow"), opacity: 0.5 }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fluentUrl(name)}
        alt={alt}
        width={size}
        height={size}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="cin-anim"
        style={{ position: "absolute", left: 0, top: 0, width: size, height: size, animation: anim("cin-bob"), filter: "drop-shadow(0 10px 14px rgba(0,0,0,.28))", userSelect: "none", willChange: float ? "transform" : undefined }}
      />
    </span>
  );
}
