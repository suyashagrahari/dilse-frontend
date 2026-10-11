"use client";

// ─── <FilmGrain>, <Vignette>, <LightLeak> — the "shot on film" finish ────────
//
//   <FilmGrain />                         // 7% animated grain, overlay blend
//   <Vignette strength={0.55} />          // dark corners pull the eye in
//   <LightLeak color="#ff8a5c" />          // a warm leak drifting at one edge
//
// All three are pointer-events: none, position: fixed by default, and cost no
// JS per frame: grain is one SVG-turbulence tile moved by a stepped CSS
// transform (composited), the leak is two blurred gradients on a slow keyframe.
// Reduced motion: the grain and leak hold still. Stack them ABOVE the scene and
// BELOW the UI (z 70 by default; the dock and top bar sit higher).

import type { CSSProperties } from "react";

const GRAIN_TILE =
  "url(\"data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.4 -.2'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
  ) +
  "\")";

const CSS = `
@keyframes cin-grain{0%{transform:translate3d(0,0,0)}17%{transform:translate3d(-12%,8%,0)}33%{transform:translate3d(9%,-14%,0)}50%{transform:translate3d(-6%,17%,0)}67%{transform:translate3d(14%,4%,0)}83%{transform:translate3d(-17%,-9%,0)}100%{transform:translate3d(5%,12%,0)}}
@keyframes cin-leak{0%{transform:translate3d(-6%,-4%,0) scale(1);opacity:.75}50%{transform:translate3d(5%,6%,0) scale(1.15);opacity:1}100%{transform:translate3d(-6%,-4%,0) scale(1);opacity:.75}}
@media (prefers-reduced-motion: reduce){.cin-anim{animation:none!important}}
`;

/** Shared keyframes, hoisted and de-duplicated by React 19. */
export function CinemaStyles() {
  return (
    <style href="cinema-overlays" precedence="default">
      {CSS}
    </style>
  );
}

interface OverlayBase {
  /** fixed (default) or absolute inside a relative parent. */
  fixed?: boolean;
  z?: number;
  style?: CSSProperties;
}

const shell = (fixed: boolean, z: number): CSSProperties => ({
  position: fixed ? "fixed" : "absolute", inset: 0, pointerEvents: "none", zIndex: z, overflow: "hidden",
});

export function FilmGrain({ opacity = 0.07, fixed = true, z = 70, blend = "overlay", style }: OverlayBase & {
  /** 0.04–0.12. Above ~0.1 it reads as "dirty", not "film". */
  opacity?: number;
  blend?: CSSProperties["mixBlendMode"];
}) {
  return (
    <div aria-hidden style={{ ...shell(fixed, z), mixBlendMode: blend, opacity, ...style }}>
      <CinemaStyles />
      <div
        className="cin-anim"
        style={{ position: "absolute", inset: "-50%", backgroundImage: GRAIN_TILE, backgroundSize: "180px 180px", animation: "cin-grain .9s steps(1) infinite", willChange: "transform" }}
      />
    </div>
  );
}

export function Vignette({ strength = 0.5, color = "#000", shape = "ellipse", fixed = true, z = 69, style }: OverlayBase & {
  /** 0–1 darkness at the corners (default 0.5). */
  strength?: number;
  color?: string;
  shape?: "ellipse" | "circle";
}) {
  const a = Math.max(0, Math.min(1, strength));
  return (
    <div
      aria-hidden
      style={{
        ...shell(fixed, z),
        background: `radial-gradient(${shape} 75% 68% at 50% 46%, transparent 52%, color-mix(in srgb, ${color} ${Math.round(a * 55)}%, transparent) 78%, color-mix(in srgb, ${color} ${Math.round(a * 100)}%, transparent) 100%)`,
        ...style,
      }}
    />
  );
}

export function LightLeak({ color = "#ff8a5c", color2 = "#ffd27a", corner = "top-right", opacity = 0.55, fixed = true, z = 68, style }: OverlayBase & {
  color?: string;
  color2?: string;
  corner?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  opacity?: number;
}) {
  const [v, h] = corner.split("-") as ["top" | "bottom", "left" | "right"];
  const at = `${h === "left" ? "0%" : "100%"} ${v === "top" ? "0%" : "100%"}`;
  return (
    <div aria-hidden style={{ ...shell(fixed, z), mixBlendMode: "screen", opacity, ...style }}>
      <CinemaStyles />
      <div
        className="cin-anim"
        style={{
          position: "absolute", inset: "-20%",
          background: `radial-gradient(38% 30% at ${at}, ${color}, transparent 70%), radial-gradient(22% 46% at ${at}, ${color2}aa, transparent 70%)`,
          filter: "blur(18px)", animation: "cin-leak 11s ease-in-out infinite", willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
