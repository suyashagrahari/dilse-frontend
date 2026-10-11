"use client";

// ─── <PremiumCTA> + <HoldToReveal> — the one button a scene is about ─────────
//
//   <PremiumCTA onClick={next}>Open your gift</PremiumCTA>                 // gold
//   <PremiumCTA tone="rose" cue="chime" onClick={open}>Read the letter</PremiumCTA>
//   <HoldToReveal label="Hold to light the candle" onComplete={light} tone="ember" />
//
// PremiumCTA: metallic gradient, inner top highlight, a shimmer sweep every
// few seconds, magnetic pull toward the cursor (fine pointers only), a real
// press (sinks 2px, shadow tightens), haptic tick and an optional sfx cue.
// HoldToReveal: a round button wrapped in a glowing progress ring driven by
// useHoldProgress (taps / Space / Enter also complete it). Both are ≥ 48px
// touch targets. Reduced motion: no shimmer, no magnet, instant states.

import { motion, useSpring } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../useReducedMotion";
import { haptic } from "../../haptic";
import { useHoldProgress } from "../../useHoldProgress";
import { sfx, type CueId } from "../sfx";
import { CinemaStyles } from "./Overlays";

export type CtaTone = "gold" | "rose" | "ember" | "pearl";

const TONES: Record<CtaTone, { bg: string; ink: string; glow: string; ring: string }> = {
  gold: { bg: "linear-gradient(180deg,#f7e1a6 0%,#e2b65c 38%,#b9832f 100%)", ink: "#3a2408", glow: "rgba(240,190,90,.55)", ring: "#f3cf7a" },
  rose: { bg: "linear-gradient(180deg,#ffd0d9 0%,#f0849c 40%,#b8395a 100%)", ink: "#3d0a18", glow: "rgba(255,120,150,.55)", ring: "#ff9db2" },
  ember: { bg: "linear-gradient(180deg,#ffd29a 0%,#ff8a3d 42%,#a8360e 100%)", ink: "#2a0d02", glow: "rgba(255,140,60,.6)", ring: "#ffb067" },
  pearl: { bg: "linear-gradient(180deg,#ffffff 0%,#f1ece6 45%,#cfc6bd 100%)", ink: "#2a2420", glow: "rgba(255,255,255,.45)", ring: "#fff6ea" },
};

const CSS = `
@keyframes cin-shimmer{0%,62%{transform:translateX(-130%) skewX(-20deg)}100%{transform:translateX(230%) skewX(-20deg)}}
@keyframes cin-breathe{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.9;transform:scale(1.06)}}
`;

export interface PremiumCTAProps {
  children: ReactNode;
  onClick?: () => void;
  tone?: CtaTone;
  /** sfx cue on press (default "tick"; null = silent). Respects the page mute. */
  cue?: CueId | null;
  /** Magnetic radius in px on fine pointers (default 70; 0 = off). */
  magnet?: number;
  disabled?: boolean;
  /** Stretch to the container width (max 360px). */
  block?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
  style?: CSSProperties;
  className?: string;
}

export function PremiumCTA({ children, onClick, tone = "gold", cue = "tick", magnet = 70, disabled, block, type = "button", ariaLabel, style, className }: PremiumCTAProps) {
  const reduce = useReducedMotion();
  const t = TONES[tone];
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 16 });
  const y = useSpring(0, { stiffness: 220, damping: 16 });
  const fine = () => typeof window !== "undefined" && !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !magnet || e.pointerType !== "mouse" || !fine()) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.38);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    // The padded wrapper is the magnet's catchment area.
    <span onPointerMove={onMove} onPointerLeave={reset} style={{ display: block ? "block" : "inline-block", padding: magnet ? 14 : 0, margin: magnet ? -14 : 0 }}>
      <CinemaStyles />
      <style href="cinema-cta" precedence="default">{CSS}</style>
      <motion.button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={disabled}
        className={className}
        onClick={() => {
          haptic(12);
          if (cue) sfx(cue, { detune: (Math.random() - 0.5) * 80 });
          onClick?.();
        }}
        whileTap={reduce ? undefined : { y: 2, scale: 0.975 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        style={{
          x, y, position: "relative", overflow: "hidden", isolation: "isolate", cursor: disabled ? "default" : "pointer",
          display: block ? "flex" : "inline-flex", width: block ? "100%" : undefined, maxWidth: block ? 360 : undefined, margin: block ? "0 auto" : undefined,
          alignItems: "center", justifyContent: "center", gap: 10, minHeight: 56, padding: "0 30px", borderRadius: 999, border: 0,
          background: t.bg, color: t.ink, opacity: disabled ? 0.5 : 1,
          font: "600 16px/1 var(--font-vw-ui, 'DM Sans'), system-ui, sans-serif", letterSpacing: ".02em",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.75), inset 0 -2px 6px rgba(0,0,0,.18), 0 1px 0 rgba(0,0,0,.25), 0 10px 30px -8px ${t.glow}, 0 18px 40px -18px rgba(0,0,0,.6)`,
          WebkitTapHighlightColor: "transparent", ...style,
        }}
      >
        {/* top sheen */}
        <span aria-hidden style={{ position: "absolute", inset: "1px 10% 52% 10%", borderRadius: 999, background: "linear-gradient(rgba(255,255,255,.55), rgba(255,255,255,0))", zIndex: -1 }} />
        {!reduce && !disabled && (
          <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "40%", zIndex: -1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent)", animation: "cin-shimmer 4.2s cubic-bezier(.6,0,.2,1) 1.2s infinite" }} />
        )}
        {children}
      </motion.button>
    </span>
  );
}

/** Kept as an alias: the button IS the magnetic one. */
export const MagneticButton = PremiumCTA;

export interface HoldToRevealProps {
  label: string;
  onComplete: () => void;
  /** ms to fill (default 2200). */
  duration?: number;
  tone?: CtaTone;
  /** Diameter in px (default 112). */
  size?: number;
  /** Content inside the ring (an icon / Fluent3D); defaults to a soft dot. */
  children?: ReactNode;
  /** sfx on complete (default "chime"; null = silent). */
  cue?: CueId | null;
  style?: CSSProperties;
}

export function HoldToReveal({ label, onComplete, duration = 2200, tone = "gold", size = 112, children, cue = "chime", style }: HoldToRevealProps) {
  const reduce = useReducedMotion();
  const t = TONES[tone];
  const hold = useHoldProgress({
    duration,
    onComplete: () => {
      if (cue) sfx(cue);
      onComplete();
    },
  });
  const r = size / 2 - 5;
  const C = 2 * Math.PI * r;
  const p = hold.progress;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 14, ...style }}>
      <style href="cinema-cta" precedence="default">{CSS}</style>
      <button
        type="button"
        aria-label={label}
        {...hold.bind}
        style={{
          ...hold.bind.style, position: "relative", width: size, height: size, borderRadius: "50%", border: 0, padding: 0, cursor: "pointer",
          background: "radial-gradient(circle at 50% 35%, rgba(255,255,255,.16), rgba(255,255,255,.04) 60%, rgba(0,0,0,.15))",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 0 ${18 + p * 40}px ${p * 6}px ${t.glow}`,
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          transform: hold.holding && !reduce ? `scale(${0.96 + p * 0.06})` : "scale(1)", transition: "transform .25s cubic-bezier(.22,1,.36,1)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {!reduce && !hold.done && (
          <span aria-hidden style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1px solid ${t.ring}`, animation: "cin-breathe 2.4s ease-in-out infinite", opacity: 0.6 }} />
        )}
        <svg aria-hidden viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)", overflow: "visible" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={2} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.ring} strokeWidth={3} strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - p)}
            style={{ filter: `drop-shadow(0 0 ${4 + p * 6}px ${t.ring})` }}
          />
        </svg>
        <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          {children ?? <span style={{ width: 14, height: 14, borderRadius: "50%", background: t.ring, boxShadow: `0 0 16px 4px ${t.glow}` }} />}
        </span>
      </button>
      <span aria-hidden style={{ font: "500 12px/1 var(--font-vw-ui, 'DM Sans'), system-ui, sans-serif", letterSpacing: ".22em", textTransform: "uppercase", opacity: 0.75 }}>
        {label}
      </span>
    </div>
  );
}
