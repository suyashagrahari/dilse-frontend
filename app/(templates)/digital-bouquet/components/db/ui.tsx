"use client";

// Small shared pieces: the scene heading, the drifting petals behind
// everything, a "do this" hint chip, and the sticker frame.

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import type { DbPaletteDef } from "../../../_valentine/days/digital-bouquet";
import { DB_HAND, DB_SANS } from "./fonts";
import { PETAL_FILES, media } from "./assets";

export function paletteVars(p: DbPaletteDef): CSSProperties {
  return {
    ["--db-blush" as string]: p.blush,
    ["--db-deep" as string]: p.deep,
    ["--db-sky1" as string]: p.sky[0],
    ["--db-sky2" as string]: p.sky[1],
    ["--db-sky3" as string]: p.sky[2],
    ["--db-hand" as string]: DB_HAND,
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="db-head">
      {kicker && <p className="db-kick">{kicker}</p>}
      <h2 className="db-title">{title}</h2>
      {sub && <p className="db-sub">{sub}</p>}
    </header>
  );
}

export function Hint({ children, hand = "👆" }: { children: ReactNode; hand?: string }) {
  return (
    <p className="db-hint">
      <span aria-hidden>{hand}</span> {children}
    </p>
  );
}

/** Soft light, a few bokeh and petals drifting down. More of them once she reacts. */
/** Petal art per palette: which of the pack's petals drift (pink · red · white · cherry · peach). */
const PETAL_OFFSET: Record<string, number> = { blushGarden: 0, peachSorbet: 4, lilacDream: 2, sageMorning: 3 };

export function Atmosphere({ petals, warm, palette = "blushGarden" }: { petals: readonly string[]; warm: boolean; palette?: string }) {
  const offset = PETAL_OFFSET[palette] ?? 0;
  const reduced = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: 14 }, (_, k) => ({
        left: (k * 61 + 7) % 100,
        delay: -((k * 1.7) % 15),
        dur: 13 + (k % 5) * 2.4,
        size: 11 + ((k * 7) % 12),
        color: petals[k % petals.length],
        sway: k % 2 ? 1 : -1,
      })),
    [petals],
  );
  return (
    <div className={`db-atmo${warm ? " is-warm" : ""}`} aria-hidden>
      <span className="db-glow db-glow-a" />
      <span className="db-glow db-glow-b" />
      {!reduced &&
        bits.map((b, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={k}
            className="db-petal"
            src={media(`${PETAL_FILES[(k + offset) % PETAL_FILES.length]}.webp`)}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ left: `${b.left}%`, width: b.size * 1.3, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, ["--sx" as string]: `${b.sway * 40}px` }}
          />
        ))}
    </div>
  );
}

export const DB_UI_CSS = `
.db-hint { margin: 0; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 99px; font: 600 clamp(13px, 1.9dvh, 15px)/1.2 ${DB_SANS}; color: var(--vw-accent-deep);
  background: color-mix(in srgb, var(--vw-paper) 82%, transparent); box-shadow: inset 0 0 0 1px var(--vw-edge); }
.db-hint > span { display: inline-block; animation: db-tap 1.4s ease-in-out infinite; }
@keyframes db-tap { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px) scale(1.08); } }
.db-ghost { min-height: 44px; padding: 0 18px; border: 1.5px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 80%, transparent); color: var(--vw-ink); font: 600 15px ${DB_SANS}; cursor: pointer; touch-action: manipulation; }
.db-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.db-stk { display: inline-grid; place-items: center; padding: 5px; border-radius: 20px; background: #FFFFFF; transform: rotate(-4deg); box-shadow: 0 0 0 1.5px var(--vw-edge), 0 14px 26px -14px color-mix(in srgb, var(--db-deep) 60%, transparent); }
.db-stk img { border-radius: 15px; display: block; }
.db-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.db-glow { position: absolute; border-radius: 50%; filter: blur(40px); opacity: .7; }
.db-glow-a { width: 70vmax; height: 70vmax; left: -25vmax; top: -30vmax; background: radial-gradient(circle, #FFFFFF, transparent 65%); }
.db-glow-b { width: 60vmax; height: 60vmax; right: -25vmax; bottom: -30vmax; background: radial-gradient(circle, color-mix(in srgb, var(--vw-accent) 22%, transparent), transparent 65%); }
.db-petal { position: absolute; top: -40px; height: auto; opacity: 0; animation: db-fall linear infinite; will-change: transform, opacity; pointer-events: none; }
@keyframes db-fall { 0% { transform: translate(0, 0) rotate(0); opacity: 0; } 10% { opacity: .7; } 50% { transform: translate(var(--sx), 52vh) rotate(160deg); } 90% { opacity: .55; } 100% { transform: translate(0, 108vh) rotate(320deg); opacity: 0; } }
.db-atmo.is-warm .db-petal { animation-duration: 7s !important; }
@media (prefers-reduced-motion: reduce) { .db-hint > span { animation: none; } }
`;
