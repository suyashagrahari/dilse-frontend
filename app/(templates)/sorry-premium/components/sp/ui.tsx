"use client";

// Small shared pieces: the scene heading, the living sky (drizzle that clears
// scene by scene, the sun, the rainbow, falling petals), the themed scroll
// panel and text helpers.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { SpPaletteDef } from "../../../_valentine/days/sorry-premium";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Whole days since a yyyy-mm-dd date (0 when empty, invalid or in the future). */
export function daysSince(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return 0;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const d = Math.floor((today - t) / 86400000);
  return Number.isFinite(d) && d > 0 && d < 36500 ? d : 0;
}

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: SpPaletteDef): CSSProperties {
  return {
    ["--sp-blush" as string]: p.blush,
    ["--sp-deep" as string]: p.deep,
    ["--sp-rain-a" as string]: p.rain[0],
    ["--sp-rain-b" as string]: p.rain[1],
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="sp-head">
      {kicker && <p className="sp-kick">{kicker}</p>}
      <h2 className="sp-title">{title}</h2>
      {sub && <p className="sp-sub">{sub}</p>}
    </header>
  );
}

const DROPS = 34;

/**
 * The sky behind every scene. `sun` 0 → 1: the grey-pastel drizzle wash fades,
 * fewer drops fall, the clouds drift apart and thin, the sun rises. `rainbow`
 * draws the bow; `petals` lets the palette's petals fall.
 */
export function Sky({ sun, rainbow, petals, chars }: { sun: number; rainbow: boolean; petals: boolean; chars: readonly string[] }) {
  const reduced = useReducedMotion();
  const s = Math.max(0, Math.min(1, sun));
  const drops = useMemo(
    () =>
      Array.from({ length: DROPS }, (_, k) => ({
        left: (k * 37 + 11) % 100,
        delay: -((k * 0.43) % 1.6),
        dur: 0.9 + ((k * 7) % 5) * 0.12,
        len: 14 + ((k * 13) % 14),
        // Drops leave in this order as the sky clears.
        rank: ((k * 23) % DROPS) / DROPS,
      })),
    [],
  );
  const bits = useMemo(
    () =>
      Array.from({ length: 18 }, (_, k) => ({
        left: (k * 53 + 5) % 100,
        delay: -((k * 1.3) % 11),
        dur: 9 + (k % 5) * 1.8,
        size: 16 + ((k * 7) % 14),
        char: chars[k % chars.length],
      })),
    [chars],
  );
  return (
    <div className="sp-sky" aria-hidden style={{ ["--sun" as string]: String(s) }}>
      <span className="sp-sky-rain" />
      <span className="sp-sun">
        <svg viewBox="0 0 120 120" width="100%" height="100%">
          <defs>
            <radialGradient id="spSunG" cx="45%" cy="40%" r="60%">
              <stop offset="0" stopColor="#FFF6C9" />
              <stop offset=".6" stopColor="#FFDD6E" />
              <stop offset="1" stopColor="#FFC94A" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="56" fill="#FFE9A0" opacity=".35" />
          <circle cx="60" cy="60" r="34" fill="url(#spSunG)" />
          <circle cx="48" cy="58" r="3.2" fill="#8A5A2B" />
          <circle cx="72" cy="58" r="3.2" fill="#8A5A2B" />
          <path d="M51 68 q9 8 18 0" fill="none" stroke="#8A5A2B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="67" r="4.5" fill="#FF9DB2" opacity=".6" />
          <circle cx="78" cy="67" r="4.5" fill="#FF9DB2" opacity=".6" />
        </svg>
      </span>
      {rainbow && (
        <svg className="sp-rainbow" viewBox="0 0 400 210" preserveAspectRatio="xMidYMax meet">
          {["#FFB3C1", "#FFD0A1", "#FFF0A6", "#C6EFC0", "#B8DEFF", "#D4C4FF"].map((c, k) => (
            <path key={c} d={`M${20 + k * 14} 210 A${180 - k * 14} ${180 - k * 14} 0 0 1 ${380 - k * 14} 210`} fill="none" stroke={c} strokeWidth="15" strokeLinecap="round" pathLength={1} style={{ animationDelay: `${k * 90}ms` }} />
          ))}
        </svg>
      )}
      <Cloud className="sp-cl sp-cl-a" />
      <Cloud className="sp-cl sp-cl-b" />
      <Cloud className="sp-cl sp-cl-c" />
      {!reduced && (
        <span className="sp-drops">
          {drops.map((d, k) => (
            <i key={k} style={{ left: `${d.left}%`, height: d.len, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s`, opacity: d.rank < 1 - s ? 0.55 : 0 }} />
          ))}
        </span>
      )}
      {petals && !reduced && (
        <span className="sp-petals">
          {bits.map((b, k) => (
            <i key={k} style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
              {b.char}
            </i>
          ))}
        </span>
      )}
    </div>
  );
}

function Cloud({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 200 100" aria-hidden>
      <path d="M40 86 C14 86 8 60 28 52 C24 30 52 18 70 32 C78 10 118 6 128 32 C146 20 176 30 172 54 C194 58 192 86 166 86 Z" fill="var(--vw-paper, #FFF)" />
      <path d="M44 80 C70 84 140 84 162 80" stroke="color-mix(in srgb, var(--vw-gold) 40%, transparent)" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * A scroll panel with a palette-coloured rail that is always visible while
 * there is more to read (phones hide native bars; iOS never styles them).
 */
export function SpScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ over: false, top: 0, size: 1, atTop: true, atEnd: true, moved: false });
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const over = scrollHeight - clientHeight > 2;
    const size = over ? Math.max(0.14, clientHeight / scrollHeight) : 1;
    const top = over ? (scrollTop / (scrollHeight - clientHeight)) * (1 - size) : 0;
    setM((o) => ({ over, top, size, atTop: scrollTop < 2, atEnd: scrollTop + clientHeight >= scrollHeight - 2, moved: o.moved || scrollTop > 6 }));
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [measure]);
  const drag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    const rail = e.currentTarget;
    if (!el) return;
    rail.setPointerCapture(e.pointerId);
    const go = (y: number) => {
      const r = rail.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (y - r.top) / r.height - m.size / 2) / (1 - m.size));
      el.scrollTop = f * (el.scrollHeight - el.clientHeight);
    };
    go(e.clientY);
    const move = (ev: PointerEvent) => go(ev.clientY);
    const up = () => {
      rail.removeEventListener("pointermove", move);
      rail.removeEventListener("pointerup", up);
      rail.removeEventListener("pointercancel", up);
    };
    rail.addEventListener("pointermove", move);
    rail.addEventListener("pointerup", up);
    rail.addEventListener("pointercancel", up);
  };
  const fade = `${m.over && !m.atTop ? " fade-top" : ""}${m.over && !m.atEnd ? " fade-end" : ""}`;
  return (
    <div className={`sp-scroll${fade} ${className}`}>
      <div ref={ref} className="sp-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="sp-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="sp-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="sp-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="sp-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

export const SP_UI_CSS = `
.sp-sky { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.sp-sky-rain { position: absolute; inset: 0; background: linear-gradient(180deg, var(--sp-rain-a) 0%, var(--sp-rain-b) 62%, transparent 100%); opacity: calc((1 - var(--sun)) * .92); transition: opacity 1.6s ease; }
.sp-sun { position: absolute; right: -22px; top: 21vh; width: 88px; aspect-ratio: 1; opacity: var(--sun);
  transform: translateY(calc((1 - var(--sun)) * 60px)) scale(calc(.7 + var(--sun) * .3)); transition: opacity 1.6s ease, transform 1.6s cubic-bezier(.3,1.3,.5,1); }
/* Phones: the sun hangs off the right edge mid-screen, clear of the titles and subtitles. */
@media (max-width: 899px) { .sp-sun { top: 44%; top: 44dvh; width: clamp(64px, 18vw, 88px); right: -26px; } }
@media (min-width: 900px) { .sp-sun { right: max(5vw, 24px); top: 12vh; width: clamp(110px, 14vmin, 160px); } }
.sp-sun svg { animation: sp-sun-spin 18s linear infinite; }
@keyframes sp-sun-spin { from { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } to { transform: rotate(-6deg) } }
.sp-cl { position: absolute; height: auto; filter: drop-shadow(0 8px 14px color-mix(in srgb, var(--sp-deep) 14%, transparent)); transition: transform 2s cubic-bezier(.3,.9,.3,1), opacity 2s ease; }
.sp-cl-a { width: clamp(150px, 34vmin, 300px); left: -4vw; top: 7vh; opacity: calc(.95 - var(--sun) * .35); transform: translateX(calc(var(--sun) * -18vw)); }
.sp-cl-b { width: clamp(120px, 26vmin, 240px); right: 2vw; top: 18vh; opacity: calc(.85 - var(--sun) * .45); transform: translateX(calc(var(--sun) * 22vw)); }
.sp-cl-c { width: clamp(110px, 22vmin, 210px); left: 34vw; top: 2vh; opacity: calc(.8 - var(--sun) * .5); transform: translateY(calc(var(--sun) * -6vh)); }
.sp-cl-a, .sp-cl-b, .sp-cl-c { animation: sp-cl-bob 9s ease-in-out infinite alternate; }
.sp-cl-b { animation-duration: 12s; } .sp-cl-c { animation-duration: 15s; }
@keyframes sp-cl-bob { from { translate: -1.5vmin 0 } to { translate: 2vmin 0 } }
.sp-drops { position: absolute; inset: -40px 0 0 0; }
.sp-drops i { position: absolute; top: -40px; width: 2.5px; border-radius: 2px; transition: opacity 1.4s ease;
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--vw-accent-deep) 48%, #9AB4D6)); transform: rotate(12deg); animation: sp-fall linear infinite; }
@keyframes sp-fall { from { translate: 0 -5vh } to { translate: -12vh 112vh } }
.sp-rainbow { position: absolute; left: 50%; bottom: 0; width: min(150vw, 1400px); height: auto; transform: translateX(-50%); opacity: .88; }
.sp-rainbow path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: sp-bow 1.8s cubic-bezier(.4,.1,.2,1) forwards; }
@keyframes sp-bow { to { stroke-dashoffset: 0 } }
.sp-petals i { position: absolute; top: -40px; font-style: normal; line-height: 1; opacity: 0; animation: sp-petal linear infinite; will-change: transform, opacity; }
@keyframes sp-petal { 0% { transform: translate(0, 0) rotate(0); opacity: 0 } 8% { opacity: .85 } 50% { transform: translate(5vw, 55vh) rotate(160deg) } 92% { opacity: .7 } 100% { transform: translate(-3vw, 112vh) rotate(320deg); opacity: 0 } }
@media (prefers-reduced-motion: reduce) { .sp-sky * { animation: none !important; transition: none !important; } .sp-rainbow path { stroke-dashoffset: 0; } }

.sp-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.sp-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none;
  --sp-ft: 0px; --sp-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--sp-ft), #000 calc(100% - var(--sp-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--sp-ft), #000 calc(100% - var(--sp-fe)), transparent 100%); }
.sp-scroll-view::-webkit-scrollbar { display: none; }
.sp-scroll.fade-top .sp-scroll-view { --sp-ft: 22px; }
.sp-scroll.fade-end .sp-scroll-view { --sp-fe: 34px; }
.sp-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.sp-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 16%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 22%, transparent); }
.sp-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.sp-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--sp-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--sp-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.sp-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent); color: #FFFFFF; font: 700 13.5px ${FONTS.ui}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--sp-deep) 70%, transparent); animation: sp-hint-bob 1.3s ease-in-out infinite; }
@keyframes sp-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
[data-sp-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-sp-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-sp-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-sp-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .sp-scroll-hint { animation: none; } .sp-scroll-thumb { transition: none; } }
.sp-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 74%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; }
.sp-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.sp-stk { display: inline-grid; place-items: center; padding: 6px; border-radius: 22px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 24px -12px color-mix(in srgb, var(--sp-deep) 60%, transparent); }
.sp-stk img { border-radius: 16px; display: block; }
.sp-card { box-sizing: border-box; border-radius: 22px; background: var(--vw-paper); color: var(--vw-ink);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 16px 30px -18px color-mix(in srgb, var(--sp-deep) 65%, transparent); }
.sp-say { flex: none; width: 100%; max-width: 420px; min-height: clamp(76px, 12dvh, 108px); display: grid; place-items: center; }
.sp-say-card { margin: 0; box-sizing: border-box; width: 100%; padding: 12px 16px; border-radius: 20px; background: var(--vw-paper); color: var(--vw-ink);
  font: 400 clamp(17px, 2.6dvh, 21px)/1.35 var(--font-sp-hand), cursive; box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 24px -14px color-mix(in srgb, var(--sp-deep) 55%, transparent); overflow-wrap: anywhere; }
.sp-say[hidden] { display: none; }
.sp-handline { margin: 0; font: 400 clamp(17px, 2.6dvh, 21px)/1.38 var(--font-sp-hand), cursive; color: var(--vw-ink); overflow-wrap: anywhere; }
`;
