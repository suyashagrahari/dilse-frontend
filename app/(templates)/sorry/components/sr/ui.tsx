"use client";

// Small shared pieces: the scene heading, the drifting background (soft clouds,
// hearts and bubbles in the page's palette) and text helpers.

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { SorryPaletteDef } from "../../../_valentine/days/sorry";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: SorryPaletteDef): CSSProperties {
  return {
    ["--sr-blush" as string]: p.blush,
    ["--sr-deep" as string]: p.deep,
    ["--sr-cheek" as string]: `color-mix(in srgb, ${p.theme.accent} 45%, #FFFFFF)`,
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="sr-head">
      {kicker && <p className="sr-kick">{kicker}</p>}
      <h2 className="sr-title">{title}</h2>
      {sub && <p className="sr-sub">{sub}</p>}
    </header>
  );
}

/** Soft clouds low on the screen, and hearts + bubbles drifting up. Warms (more hearts) once forgiven. */
export function Atmosphere({ hearts, warm }: { hearts: readonly string[]; warm: boolean }) {
  const reduced = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: 16 }, (_, k) => ({
        left: (k * 61 + 7) % 100,
        delay: -((k * 1.7) % 14),
        dur: 12 + (k % 5) * 2.4,
        size: 14 + ((k * 7) % 16),
        bubble: k % 3 === 0,
        char: hearts[k % hearts.length],
      })),
    [hearts],
  );
  return (
    <div className={`sr-atmo${warm ? " is-warm" : ""}`} aria-hidden>
      <span className="sr-cloud sr-cloud-a" />
      <span className="sr-cloud sr-cloud-b" />
      <span className="sr-cloud sr-cloud-c" />
      {!reduced &&
        bits.map((b, k) =>
          b.bubble ? (
            <span key={k} className="sr-float sr-bub" style={{ left: `${b.left}%`, width: b.size + 6, height: b.size + 6, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }} />
          ) : (
            <span key={k} className="sr-float" style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
              {b.char}
            </span>
          ),
        )}
    </div>
  );
}

export const SR_UI_CSS = `
.sr-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 70%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; }
.sr-stk { display: inline-grid; place-items: center; padding: 6px; border-radius: 20px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 22px -12px color-mix(in srgb, var(--sr-deep) 60%, transparent); }
.sr-stk img { border-radius: 14px; display: block; }
.sr-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.sr-cloud { position: absolute; border-radius: 999px; background: color-mix(in srgb, var(--vw-paper) 80%, transparent); filter: blur(2px); opacity: .75; }
.sr-cloud::before, .sr-cloud::after { content: ""; position: absolute; border-radius: 50%; background: inherit; }
.sr-cloud-a { width: 46vmin; height: 12vmin; left: -8vmin; bottom: 9vh; animation: sr-drift 26s ease-in-out infinite alternate; }
.sr-cloud-a::before { width: 20vmin; height: 20vmin; left: 7vmin; top: -10vmin; }
.sr-cloud-a::after { width: 14vmin; height: 14vmin; left: 22vmin; top: -6vmin; }
.sr-cloud-b { width: 38vmin; height: 10vmin; right: -6vmin; bottom: 22vh; opacity: .55; animation: sr-drift 32s ease-in-out -8s infinite alternate-reverse; }
.sr-cloud-b::before { width: 16vmin; height: 16vmin; left: 6vmin; top: -8vmin; }
.sr-cloud-b::after { width: 12vmin; height: 12vmin; left: 18vmin; top: -5vmin; }
.sr-cloud-c { width: 30vmin; height: 8vmin; left: 30vw; top: 14vh; opacity: .45; animation: sr-drift 40s ease-in-out -4s infinite alternate; }
.sr-cloud-c::before { width: 12vmin; height: 12vmin; left: 5vmin; top: -6vmin; }
@keyframes sr-drift { from { transform: translateX(-3vmin) } to { transform: translateX(5vmin) } }
.sr-float { position: absolute; bottom: -40px; line-height: 1; opacity: 0; animation: sr-rise linear infinite; will-change: transform, opacity; }
.sr-bub { border-radius: 50%; background: radial-gradient(circle at 32% 30%, rgba(255,255,255,.95) 0 18%, rgba(255,255,255,.25) 36%, color-mix(in srgb, var(--vw-accent) 18%, transparent) 70%, color-mix(in srgb, var(--vw-paper) 60%, transparent) 100%);
  box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.7); }
@keyframes sr-rise { 0% { transform: translate(0, 0) rotate(-8deg); opacity: 0 } 10% { opacity: .55 } 50% { transform: translate(18px, -52vh) rotate(8deg) } 90% { opacity: .45 } 100% { transform: translate(-10px, -110vh) rotate(-6deg); opacity: 0 } }
.sr-atmo.is-warm .sr-float { animation-duration: 7s !important; }
@media (prefers-reduced-motion: reduce) { .sr-cloud { animation: none; } }
`;
