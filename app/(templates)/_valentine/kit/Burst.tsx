"use client";

// ─── Burst — confetti / hearts / petals, and ambient floating particles ──────
//
// `burst(opts)` is imperative and dependency-free: it drops a fixed,
// pointer-events:none layer on <body>, flings DOM particles with the Web
// Animations API (GPU transforms only) and removes the layer when they land.
// No canvas, no library. Reduced motion → one gentle emoji pop instead.
//
//   burst({ kind: "hearts", origin: { x: 0.5, y: 0.6 } });
//   <Burst fire={yesCount} kind="confetti" colors={theme.confetti} />   // fires whenever `fire` increments
//   <FloatingParticles emojis={theme.particles} />                     // slow ambient drift behind content

import { useEffect, useMemo, type CSSProperties } from "react";
import { prefersReducedMotion } from "./useReducedMotion";
import { ensureKitCss } from "./kitCss";

export type BurstKind = "confetti" | "hearts" | "petals" | "sparkles";

export interface BurstOptions {
  kind?: BurstKind;
  /** Viewport fractions. Default centre. */
  origin?: { x: number; y: number };
  /** Confetti colours. */
  colors?: readonly string[];
  /** Override the emoji set (hearts/petals/sparkles). */
  emojis?: readonly string[];
  /** Particle count. Default 36 (confetti 60). */
  count?: number;
  /** Spread radius as a fraction of the viewport's shorter side. Default 0.45. */
  spread?: number;
}

const EMOJI: Record<Exclude<BurstKind, "confetti">, string[]> = {
  hearts: ["💖", "💗", "💕", "❤️", "💘"],
  petals: ["🌸", "🌹", "🌷", "🌺"],
  sparkles: ["✨", "⭐", "💫"],
};
const DEFAULT_COLORS = ["#FF4F8B", "#FFC94D", "#7BDCB5", "#8ED1FC", "#F78DA7", "#FFFFFF"];

export function burst(opts: BurstOptions = {}): void {
  if (typeof document === "undefined") return;
  const kind = opts.kind ?? "confetti";
  const ox = (opts.origin?.x ?? 0.5) * window.innerWidth;
  const oy = (opts.origin?.y ?? 0.5) * window.innerHeight;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:400;overflow:hidden;contain:strict";
  document.body.appendChild(layer);

  const emojis = opts.emojis?.length ? opts.emojis : kind === "confetti" ? [] : EMOJI[kind];

  if (prefersReducedMotion()) {
    const el = document.createElement("span");
    el.textContent = emojis[0] ?? "💖";
    el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;font-size:56px;transform:translate(-50%,-50%)`;
    layer.appendChild(el);
    const a = el.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { duration: 900 });
    a.onfinish = () => layer.remove();
    return;
  }

  const n = opts.count ?? (kind === "confetti" ? 60 : 36);
  const R = Math.min(window.innerWidth, window.innerHeight) * (opts.spread ?? 0.45);
  const colors = opts.colors?.length ? opts.colors : DEFAULT_COLORS;
  let pending = n;

  for (let i = 0; i < n; i++) {
    const el = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const dist = R * (0.35 + Math.random() * 0.75);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - R * 0.25;
    const fall = R * (0.5 + Math.random() * 0.6);
    const rot = (Math.random() - 0.5) * 720;
    if (kind === "confetti") {
      const w = 6 + Math.random() * 6;
      el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;width:${w}px;height:${w * (0.4 + Math.random())}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.6 ? "50%" : "2px"};will-change:transform,opacity`;
    } else {
      el.textContent = emojis[i % emojis.length];
      el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;font-size:${16 + Math.random() * 18}px;line-height:1;will-change:transform,opacity`;
    }
    layer.appendChild(el);
    const dur = 1100 + Math.random() * 900;
    const anim = el.animate(
      [
        { transform: "translate(-50%,-50%) scale(.4) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + fall}px)) scale(.9) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
    );
    anim.onfinish = () => {
      pending--;
      if (pending <= 0) layer.remove();
    };
  }
  // Belt and braces: never leave a layer behind.
  window.setTimeout(() => layer.remove(), 3000);
}

/** Fires `burst` every time `fire` changes to a new truthy value. */
export default function Burst({ fire, ...opts }: BurstOptions & { fire: number | boolean | string | null | undefined }) {
  useEffect(() => {
    if (fire) burst(opts);
    // Only `fire` re-triggers; options are read at fire time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fire]);
  return null;
}

/**
 * Slow ambient particles drifting up behind the content. Purely decorative,
 * absolutely positioned inside the nearest positioned parent, off under
 * reduced motion. Deterministic layout (seeded by index) so SSR and client agree.
 */
export function FloatingParticles({ emojis, count = 12, opacity = 0.5, style }: { emojis: readonly string[]; count?: number; opacity?: number; style?: CSSProperties }) {
  useEffect(ensureKitCss, []);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => {
          const x = Math.sin((i + 1) * 9301 + k * 49297) * 233280;
          return x - Math.floor(x);
        };
        return {
          ch: emojis[i % Math.max(1, emojis.length)] ?? "✨",
          left: `${Math.round(r(1) * 100)}%`,
          size: 12 + Math.round(r(2) * 16),
          dur: 14 + r(3) * 14,
          delay: -r(4) * 28,
          dx: `${Math.round((r(5) - 0.5) * 80)}px`,
          rot: `${Math.round((r(6) - 0.5) * 360)}deg`,
        };
      }),
    [emojis, count],
  );
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", ...style }}>
      {items.map((p, i) => (
        <span
          key={i}
          className="vw-drift"
          style={{
            position: "absolute",
            left: p.left,
            bottom: -40,
            fontSize: p.size,
            opacity,
            animation: `vw-drift ${p.dur}s linear ${p.delay}s infinite`,
            ["--vw-dx" as string]: p.dx,
            ["--vw-rot" as string]: p.rot,
          }}
        >
          {p.ch}
        </span>
      ))}
    </div>
  );
}
