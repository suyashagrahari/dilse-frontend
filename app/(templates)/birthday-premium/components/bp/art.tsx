"use client";

// Hand-drawn SVG props, painted from the palette's CSS variables so every
// look re-skins them: the paper pop-up cake, the hot-air balloon, the claw,
// a capsule and the passport's rubber stamps.

import { useId } from "react";

/** The pop-up paper cake inside the storybook cover. */
export function PaperCake() {
  return (
    <svg viewBox="0 0 120 110" width="100%" aria-hidden>
      <rect x="57" y="6" width="6" height="18" rx="2" fill="#FFFFFF" stroke="var(--vw-accent-deep)" strokeWidth="1.5" />
      <path d="M60 -2 C64 4 65 8 60 11 C55 8 56 4 60 -2 Z" fill="#FFB23E" />
      <rect x="34" y="24" width="52" height="24" rx="6" fill="var(--bp-blush)" stroke="var(--vw-edge)" strokeWidth="1.5" />
      <path d="M34 30 Q40 38 46 30 Q52 38 58 30 Q64 38 70 30 Q76 38 82 30 L86 30 L86 26 Q86 24 84 24 L36 24 Q34 24 34 26 Z" fill="var(--vw-accent)" />
      <rect x="22" y="46" width="76" height="28" rx="7" fill="var(--bp-sponge)" stroke="var(--vw-edge)" strokeWidth="1.5" />
      <path d="M22 52 Q29 61 36 52 Q43 61 50 52 Q57 61 64 52 Q71 61 78 52 Q85 61 92 52 L98 52 L98 50 Q98 46 94 46 L26 46 Q22 46 22 50 Z" fill="#FFFFFF" />
      <rect x="10" y="72" width="100" height="30" rx="8" fill="var(--bp-blush)" stroke="var(--vw-edge)" strokeWidth="1.5" />
      <path d="M10 78 Q18 88 26 78 Q34 88 42 78 Q50 88 58 78 Q66 88 74 78 Q82 88 90 78 Q98 88 106 78 L110 78 L110 76 Q110 72 106 72 L14 72 Q10 72 10 76 Z" fill="var(--vw-gold)" />
      {[20, 38, 56, 74, 92].map((x, k) => (
        <circle key={x} cx={x + 4} cy={92} r="2.4" fill={k % 2 ? "var(--vw-accent)" : "#FFFFFF"} />
      ))}
      <ellipse cx="60" cy="104" rx="58" ry="5" fill="#FFFFFF" stroke="var(--vw-edge)" strokeWidth="1.5" />
    </svg>
  );
}

/** A striped hot-air balloon with a little heart flag on the basket. */
export function HotAirBalloon() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 170" width="100%" aria-hidden>
      <defs>
        <clipPath id={`bpbal${id}`}>
          <path d="M60 4 C92 4 114 28 114 58 C114 88 84 104 74 118 L46 118 C36 104 6 88 6 58 C6 28 28 4 60 4 Z" />
        </clipPath>
        <radialGradient id={`bpbalg${id}`} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".55" />
          <stop offset=".5" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#bpbal${id})`}>
        <rect x="0" y="0" width="120" height="120" fill="var(--vw-accent)" />
        <path d="M60 0 C40 30 34 80 46 120 L56 120 C48 80 50 30 60 0 Z" fill="var(--vw-paper)" />
        <path d="M60 0 C80 30 86 80 74 120 L64 120 C72 80 70 30 60 0 Z" fill="var(--vw-paper)" />
        <path d="M60 0 C20 20 6 60 22 120 L32 120 C20 64 30 24 60 0 Z" fill="var(--bp-second)" />
        <path d="M60 0 C100 20 114 60 98 120 L88 120 C100 64 90 24 60 0 Z" fill="var(--bp-second)" />
        <rect x="0" y="0" width="120" height="120" fill={`url(#bpbalg${id})`} />
      </g>
      <path d="M60 4 C92 4 114 28 114 58 C114 88 84 104 74 118 L46 118 C36 104 6 88 6 58 C6 28 28 4 60 4 Z" fill="none" stroke="var(--bp-deep)" strokeOpacity=".35" strokeWidth="2" />
      <path d="M48 118 L50 138 M72 118 L70 138" stroke="color-mix(in srgb, var(--vw-ink) 55%, transparent)" strokeWidth="1.6" />
      <path d="M44 138 L76 138 L72 160 Q60 164 48 160 Z" fill="#E7B98A" stroke="#B7865A" strokeWidth="1.6" />
      <path d="M46 146 L74 146 M47 153 L73 153" stroke="#B7865A" strokeWidth="1.2" />
      <path d="M74 128 L74 112" stroke="color-mix(in srgb, var(--vw-ink) 55%, transparent)" strokeWidth="1.2" />
      <path d="M74 112 C78 108 84 110 82 115 C81 118 76 120 74 122 Z" fill="var(--vw-accent-deep)" />
    </svg>
  );
}

/** The claw: two jaws that open and close with `closed`. */
export function Claw({ closed }: { closed: boolean }) {
  return (
    <svg viewBox="0 0 60 64" width="100%" aria-hidden>
      <rect x="22" y="0" width="16" height="16" rx="4" fill="var(--vw-accent-deep)" />
      <rect x="18" y="14" width="24" height="10" rx="4" fill="#C9CED8" stroke="#8A93A3" strokeWidth="1.2" />
      <g style={{ transformOrigin: "24px 22px", transform: `rotate(${closed ? 14 : -14}deg)`, transition: "transform .25s ease" }}>
        <path d="M24 22 C12 30 10 44 18 56 L22 54 C16 44 18 32 27 26 Z" fill="#C9CED8" stroke="#8A93A3" strokeWidth="1.2" />
      </g>
      <g style={{ transformOrigin: "36px 22px", transform: `rotate(${closed ? -14 : 14}deg)`, transition: "transform .25s ease" }}>
        <path d="M36 22 C48 30 50 44 42 56 L38 54 C44 44 42 32 33 26 Z" fill="#C9CED8" stroke="#8A93A3" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/** A two-tone gacha capsule. */
export function Capsule({ color, open = false }: { color: string; open?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" aria-hidden style={{ overflow: "visible" }}>
      <g style={{ transform: open ? "translate(-6px, -10px) rotate(-28deg)" : "none", transformOrigin: "8px 20px", transition: "transform .5s cubic-bezier(.3,1.6,.5,1)" }}>
        <path d="M2 20 A18 18 0 0 1 38 20 Z" fill={color} />
        <ellipse cx="13" cy="10" rx="5" ry="3" fill="#FFFFFF" opacity=".6" transform="rotate(-28 13 10)" />
      </g>
      <path d="M2 20 A18 18 0 0 0 38 20 Z" fill="#FFFFFF" stroke="color-mix(in srgb, var(--vw-ink) 15%, transparent)" strokeWidth="1" />
      <path d="M2 20 L38 20" stroke="color-mix(in srgb, var(--vw-ink) 25%, transparent)" strokeWidth="1.4" />
    </svg>
  );
}
