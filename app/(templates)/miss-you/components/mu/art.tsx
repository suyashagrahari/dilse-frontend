"use client";

// Original art for Miss You, all SVG in the page's palette (CSS vars):
//   • RouteMap — a soft little map: two pins (my city, your city), a dotted
//     route that draws itself, a traveller (a paper plane or a heart) flying
//     along it, and a "fold" that brings the two pins together.
//   • Jar — a glass jar of glowing paper stars (one per note left).
//   • PhoneHeart — a ringing phone with a heart on its screen.
//   • Star — a small five-point star.

import { useId, type CSSProperties, type ReactNode } from "react";
import { MU_DISPLAY } from "./fonts";
import { PlaneGlyph } from "./stage";

const W = 320;
const H = 220;
const A0 = { x: 62, y: 164 };
const B0 = { x: 258, y: 62 };
const MID = { x: 160, y: 112 };

type P = { x: number; y: number };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lp = (a: P, b: P, t: number): P => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/** The route (a quadratic arc) for a given fold 0–1. */
function route(fold: number) {
  const a = lp(A0, { x: MID.x - 14, y: MID.y + 6 }, fold);
  const b = lp(B0, { x: MID.x + 14, y: MID.y - 6 }, fold);
  const c = lp({ x: 118, y: 28 }, { x: MID.x, y: MID.y - 30 }, fold);
  return { a, b, c, d: `M${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}` };
}

function at(r: { a: P; b: P; c: P }, t: number): { x: number; y: number; deg: number } {
  const u = 1 - t;
  const x = u * u * r.a.x + 2 * u * t * r.c.x + t * t * r.b.x;
  const y = u * u * r.a.y + 2 * u * t * r.c.y + t * t * r.b.y;
  const dx = 2 * u * (r.c.x - r.a.x) + 2 * t * (r.b.x - r.c.x);
  const dy = 2 * u * (r.c.y - r.a.y) + 2 * t * (r.b.y - r.c.y);
  return { x, y, deg: (Math.atan2(dy, dx) * 180) / Math.PI };
}

export function RouteMap({
  from,
  to,
  draw = 1,
  fold = 0,
  traveller = null,
  t = 0,
  meet = null,
  arrived = null,
  className = "",
}: {
  /** The sender's city (start of the route). */
  from: string;
  /** The recipient's city (the end). */
  to: string;
  /** 0–1: how much of the dotted route is drawn. */
  draw?: number;
  /** 0–1: the map folds and the two pins meet. */
  fold?: number;
  traveller?: "plane" | "heart" | null;
  /** 0–1 along the route. */
  t?: number;
  /** 0–1: two hearts fly from both pins and meet in the middle (the hug). */
  meet?: number | null;
  /** Something to pop up where the hearts met (a GIF sticker). */
  arrived?: ReactNode;
  className?: string;
}) {
  const id = useId().replace(/[:]/g, "");
  const r = route(fold);
  const p = at(r, Math.max(0, Math.min(1, t)));
  const pct = (q: P): CSSProperties => ({ left: `${(q.x / W) * 100}%`, top: `${(q.y / H) * 100}%` });
  const met = fold > 0.96;
  return (
    <div className={`mu-map ${className}`} style={{ ["--fold" as string]: String(fold) }}>
      <svg className="mu-map-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <pattern id={`g${id}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="var(--vw-ink)" opacity=".12" />
          </pattern>
          <mask id={`m${id}`}>
            <path d={r.d} fill="none" stroke="#FFF" strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          </mask>
          <radialGradient id={`pin${id}`} cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="color-mix(in srgb, var(--vw-accent) 50%, #FFF)" />
            <stop offset="1" stopColor="var(--vw-accent-deep)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={W} height={H} rx="22" fill="var(--mu-map)" />
        <rect x="0" y="0" width={W} height={H} rx="22" fill={`url(#g${id})`} />
        {/* Soft, made-up land so it reads as a map without being any real one. */}
        <g fill="var(--mu-blush)" opacity=".85">
          <path d="M18 120 C 30 92, 70 86, 96 100 C 120 112, 128 140, 116 168 C 104 196, 60 204, 36 190 C 14 176, 8 146, 18 120 Z" />
          <path d="M186 22 C 214 10, 262 14, 290 30 C 310 44, 306 78, 284 96 C 258 116, 222 108, 204 90 C 186 72, 166 34, 186 22 Z" />
          <path d="M150 150 C 166 140, 196 144, 206 160 C 214 176, 196 196, 176 196 C 156 196, 138 166, 150 150 Z" />
          <path d="M112 40 C 122 34, 140 36, 144 46 C 148 58, 132 66, 120 62 C 108 58, 104 46, 112 40 Z" />
        </g>
        {/* The crease, as the map folds. */}
        <line x1={W / 2} y1="10" x2={W / 2} y2={H - 10} stroke="var(--vw-ink)" strokeOpacity={0.14 * Math.min(1, fold * 3)} strokeWidth="2" strokeDasharray="3 5" />
        {/* The route: dots, revealed by the mask as it draws. */}
        <g mask={`url(#m${id})`}>
          <path d={r.d} fill="none" stroke="var(--vw-accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 11" />
        </g>
        {/* Pins */}
        {[r.a, r.b].map((q, k) => (
          <g key={k} transform={`translate(${q.x} ${q.y})`}>
            <ellipse cx="0" cy="2" rx="9" ry="3.5" fill="var(--vw-ink)" opacity=".16" />
            <path d="M0 0 C -9 -11, -12 -16, -12 -22 A 12 12 0 1 1 12 -22 C 12 -16, 9 -11, 0 0 Z" fill={`url(#pin${id})`} stroke="var(--mu-deep)" strokeWidth="1.6" />
            <circle cx="0" cy="-22" r="5" fill="var(--vw-paper)" />
            {k === 1 && <path d="M0 -19.5 C -4 -22, -5 -24.5, -3 -26 C -1.6 -27, 0 -26, 0 -24.8 C 0 -26, 1.6 -27, 3 -26 C 5 -24.5, 4 -22, 0 -19.5 Z" fill="var(--vw-accent)" />}
          </g>
        ))}
        {met && (
          <g transform={`translate(${MID.x} ${MID.y - 44})`} className="mu-map-met">
            <path d="M0 18 C -16 6, -22 -2, -20 -10 C -18 -18, -6 -20, 0 -10 C 6 -20, 18 -18, 20 -10 C 22 -2, 16 6, 0 18 Z" fill="var(--vw-accent)" stroke="var(--mu-deep)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {met && (
        <span className="mu-map-label is-us" style={pct({ x: MID.x, y: MID.y + 22 })}>
          you + me
        </span>
      )}
      <span className="mu-map-label" style={{ ...pct({ x: r.a.x, y: r.a.y + 14 }), opacity: Math.max(0, 1 - fold * 2.2) }} data-end="a">
        {from}
      </span>
      <span className="mu-map-label is-to" style={{ ...pct({ x: r.b.x, y: r.b.y - 46 }), opacity: Math.max(0, 1 - fold * 2.2) }} data-end="b">
        {to}
      </span>
      {traveller && (
        <span className={`mu-map-trav is-${traveller}`} style={{ ...pct(p), ["--deg" as string]: `${traveller === "plane" ? p.deg + 33 : 0}deg` }} aria-hidden>
          {traveller === "plane" ? <PlaneGlyph size="100%" /> : <span className="mu-map-heart">💗</span>}
        </span>
      )}
      {meet !== null && meet < 1 && (
        <>
          <span className="mu-map-trav is-heart" style={pct(at(r, Math.max(0, meet) / 2))} aria-hidden>
            <span className="mu-map-heart">💗</span>
          </span>
          <span className="mu-map-trav is-heart" style={pct(at(r, 1 - Math.max(0, meet) / 2))} aria-hidden>
            <span className="mu-map-heart">💗</span>
          </span>
        </>
      )}
      {arrived && (
        <span className="mu-map-arrived" style={pct(at(r, 0.5))}>
          {arrived}
        </span>
      )}
    </div>
  );
}

export const MU_MAP_CSS = `
.mu-map { position: relative; width: 100%; aspect-ratio: ${W} / ${H}; border-radius: 22px; box-shadow: 0 0 0 2px var(--vw-edge), 0 22px 40px -22px color-mix(in srgb, var(--mu-deep) 70%, transparent);
  transform: scaleX(calc(1 - var(--fold) * .1)); transition: transform .2s ease; }
.mu-map-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.mu-map-label { position: absolute; transform: translate(-50%, 0); max-width: 44%; box-sizing: border-box; padding: 3px 10px; border-radius: 99px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font: 800 clamp(12px, 4cqw, 15px)/1.3 ${MU_DISPLAY}; color: var(--vw-ink); background: var(--vw-paper); box-shadow: 0 0 0 1.5px var(--vw-edge), 0 4px 10px -6px color-mix(in srgb, var(--mu-deep) 60%, transparent);
  transition: left .2s ease, top .2s ease, opacity .3s ease; }
.mu-map-label.is-us { background: var(--vw-accent); color: #FFF; animation: mu-pop-in2 .5s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes mu-pop-in2 { from { transform: translate(-50%, 0) scale(.3); opacity: 0 } to { transform: translate(-50%, 0) scale(1); opacity: 1 } }
.mu-map-label.is-to { background: var(--vw-accent); color: #FFF; box-shadow: 0 4px 10px -6px color-mix(in srgb, var(--mu-deep) 70%, transparent); }
.mu-map-trav { --deg: 0deg; position: absolute; width: 13%; transform: translate(-50%, -50%) rotate(var(--deg)); pointer-events: none; filter: drop-shadow(0 6px 6px color-mix(in srgb, var(--mu-deep) 40%, transparent)); }
.mu-map-trav.is-heart { width: auto; }
.mu-map-heart { display: block; font-size: clamp(22px, 8cqw, 34px); line-height: 1; animation: mu-heart-beat .7s ease-in-out infinite; }
@keyframes mu-heart-beat { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.18) } }
.mu-map-arrived { position: absolute; transform: translate(-50%, -50%); z-index: 3; animation: mu-pop-in .5s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes mu-pop-in { from { transform: translate(-50%, -50%) scale(.2); opacity: 0 } to { transform: translate(-50%, -50%) scale(1); opacity: 1 } }
.mu-map-met { animation: mu-met .6s cubic-bezier(.3,1.6,.5,1) both; transform-box: fill-box; transform-origin: center; }
@keyframes mu-met { from { opacity: 0; scale: .3 } to { opacity: 1; scale: 1 } }
@media (prefers-reduced-motion: reduce) { .mu-map-heart, .mu-map-arrived, .mu-map-met { animation: none; } }
`;

/** A five-point star. */
export function Star({ size = 16, color = "var(--vw-gold)", style, className }: { size?: number | string; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} className={className} aria-hidden>
      <path d="M12 2.5 L14.6 8.6 L21.2 9.2 L16.2 13.6 L17.7 20.1 L12 16.7 L6.3 20.1 L7.8 13.6 L2.8 9.2 L9.4 8.6 Z" fill={color} stroke="color-mix(in srgb, var(--mu-deep) 55%, transparent)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** Where the paper stars sit inside the jar (% of the jar box), the top ones leave first. */
const JAR_SPOTS: readonly [number, number, number][] = [
  [36, 78, -12], [58, 80, 18], [46, 66, 6], [66, 66, -20], [30, 62, 24], [52, 52, -8],
  [40, 48, 14], [64, 50, 30], [28, 80, 0], [72, 80, -6],
];

/** A glass jar of glowing paper stars: `left` of them still inside. */
export function Jar({ left, total, shake }: { left: number; total: number; shake: number }) {
  const id = useId().replace(/[:]/g, "");
  const extra = 4; // a few decorative stars stay at the bottom so the jar never looks empty
  const shown = Math.min(JAR_SPOTS.length, left + extra);
  return (
    <div className={`mu-jar${shake % 2 ? " is-shake-a" : shake ? " is-shake-b" : ""}`} aria-hidden data-left={left} data-total={total}>
      <svg viewBox="0 0 200 240" className="mu-jar-svg">
        <defs>
          <linearGradient id={`glass${id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity=".55" />
            <stop offset=".25" stopColor="#FFFFFF" stopOpacity=".12" />
            <stop offset=".8" stopColor="#FFFFFF" stopOpacity=".06" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity=".4" />
          </linearGradient>
          <radialGradient id={`glow${id}`} cx="50%" cy="65%" r="55%">
            <stop offset="0" stopColor="var(--vw-gold)" stopOpacity=".55" />
            <stop offset="1" stopColor="var(--vw-gold)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* body */}
        <path d="M54 52 L146 52 C 150 66, 172 74, 176 100 L 176 206 C 176 222, 164 232, 148 232 L 52 232 C 36 232, 24 222, 24 206 L 24 100 C 28 74, 50 66, 54 52 Z" fill="var(--mu-map)" opacity=".55" />
        <ellipse cx="100" cy="160" rx="80" ry="70" fill={`url(#glow${id})`} className="mu-jar-glow" />
        <path d="M54 52 L146 52 C 150 66, 172 74, 176 100 L 176 206 C 176 222, 164 232, 148 232 L 52 232 C 36 232, 24 222, 24 206 L 24 100 C 28 74, 50 66, 54 52 Z" fill={`url(#glass${id})`} stroke="var(--vw-edge)" strokeWidth="4" />
        <path d="M40 104 C 40 92, 46 84, 54 80" fill="none" stroke="#FFFFFF" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round" />
        <path d="M40 120 L40 190" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="5" strokeLinecap="round" />
        {/* lid */}
        <rect x="48" y="26" width="104" height="30" rx="8" fill="var(--vw-gold)" stroke="var(--mu-deep)" strokeWidth="3" />
        <path d="M56 34 L144 34 M56 42 L144 42 M56 50 L144 50" stroke="var(--mu-deep)" strokeOpacity=".22" strokeWidth="2" />
        {/* ribbon tag */}
        <path d="M150 50 C 166 56, 176 70, 172 86" fill="none" stroke="var(--vw-accent)" strokeWidth="3" />
        <g transform="translate(172 96) rotate(12)">
          <rect x="-16" y="-10" width="32" height="22" rx="5" fill="var(--vw-paper)" stroke="var(--vw-accent)" strokeWidth="2.5" />
          <path d="M0 6 C -6 1, -8 -2, -6 -5 C -4 -7, -1 -6, 0 -4 C 1 -6, 4 -7, 6 -5 C 8 -2, 6 1, 0 6 Z" fill="var(--vw-accent)" />
        </g>
      </svg>
      {JAR_SPOTS.slice(0, shown).map(([x, y, rot], k) => (
        <span key={k} className="mu-jar-star" style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${rot}deg)`, animationDelay: `${-k * 0.37}s` }}>
          <Star size="100%" color={k % 3 === 1 ? "var(--vw-accent)" : "var(--vw-gold)"} />
        </span>
      ))}
    </div>
  );
}

export const MU_JAR_CSS = `
.mu-jar { position: relative; width: 100%; aspect-ratio: 200 / 240; }
.mu-jar-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 18px 24px color-mix(in srgb, var(--mu-deep) 35%, transparent)); }
.mu-jar-glow { animation: mu-glow 2.6s ease-in-out infinite alternate; }
@keyframes mu-glow { from { opacity: .55 } to { opacity: 1 } }
.mu-jar-star { position: absolute; width: 15%; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--vw-gold) 90%, transparent)); animation: mu-jar-tw 2.2s ease-in-out infinite alternate; }
@keyframes mu-jar-tw { from { opacity: .75 } to { opacity: 1 } }
.mu-jar.is-shake-a { animation: mu-shake-a .42s ease-in-out; }
.mu-jar.is-shake-b { animation: mu-shake-b .42s ease-in-out; }
@keyframes mu-shake-a { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-6deg) } 60% { transform: rotate(5deg) } }
@keyframes mu-shake-b { 0%,100% { transform: rotate(0) } 25% { transform: rotate(6deg) } 60% { transform: rotate(-5deg) } }
@media (prefers-reduced-motion: reduce) { .mu-jar-glow, .mu-jar-star, .mu-jar { animation: none !important; } }
`;

/** A ringing phone with a heart on its screen. */
export function PhoneHeart({ size = 120 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden className="mu-phone-art">
      <g className="mu-phone-waves" fill="none" stroke="var(--vw-accent)" strokeWidth="5" strokeLinecap="round">
        <path d="M22 50 C 12 66, 12 94, 22 110" opacity=".55" />
        <path d="M36 60 C 30 72, 30 88, 36 100" />
        <path d="M138 50 C 148 66, 148 94, 138 110" opacity=".55" />
        <path d="M124 60 C 130 72, 130 88, 124 100" />
      </g>
      <g className="mu-phone-body">
        <rect x="50" y="18" width="60" height="124" rx="14" fill="var(--vw-paper)" stroke="var(--mu-deep)" strokeWidth="4" />
        <rect x="57" y="32" width="46" height="92" rx="7" fill="var(--vw-accent)" />
        <rect x="70" y="24" width="20" height="4" rx="2" fill="var(--mu-deep)" opacity=".5" />
        <path d="M80 94 C 66 84, 60 76, 62 68 C 64 60, 75 58, 80 66 C 85 58, 96 60, 98 68 C 100 76, 94 84, 80 94 Z" fill="#FFFFFF" />
        <circle cx="80" cy="132" r="4" fill="var(--mu-deep)" opacity=".45" />
      </g>
    </svg>
  );
}

export const MU_ART_CSS = MU_MAP_CSS + MU_JAR_CSS + `
.mu-phone-body { transform-box: fill-box; transform-origin: 50% 50%; animation: mu-ring-shake 1.6s ease-in-out infinite; }
@keyframes mu-ring-shake { 0%, 50%, 100% { transform: rotate(0) } 5%, 15%, 25% { transform: rotate(-7deg) } 10%, 20%, 30% { transform: rotate(7deg) } }
.mu-phone-waves path { animation: mu-wave 1.6s ease-out infinite; }
@keyframes mu-wave { 0% { opacity: 0 } 20% { opacity: 1 } 60%, 100% { opacity: 0 } }
@media (prefers-reduced-motion: reduce) { .mu-phone-body, .mu-phone-waves path { animation: none; } }
`;
