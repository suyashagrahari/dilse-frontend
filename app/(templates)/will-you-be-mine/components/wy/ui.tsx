"use client";

// Small shared pieces: the scene heading, the drifting background (soft clouds
// — or a night sky on the dark look — twinkles, hearts and bubbles in the
// page's palette), the themed scroll panel and text helpers.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { WybmPaletteDef } from "../../../_valentine/days/will-you-be-mine";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: WybmPaletteDef): CSSProperties {
  return {
    ["--wy-blush" as string]: p.blush,
    ["--wy-deep" as string]: p.deep,
    ["--wy-velvet" as string]: p.velvet,
    ["--wy-sky-a" as string]: p.sky[0],
    ["--wy-sky-b" as string]: p.sky[1],
    // Cards on the page: white-ish on the light looks, the paper itself on the night sky.
    ["--wy-card" as string]: p.theme.dark ? p.theme.paper : "#FFFFFF",
  };
}

/** Deterministic little shuffle (same order on every render / replay). */
export function seeded<T>(list: readonly T[], seed: number): T[] {
  const out = [...list];
  let h = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 9301 + 49297) % 233280;
    const j = Math.floor((h / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="wy-head">
      {kicker && <p className="wy-kick">{kicker}</p>}
      <h2 className="wy-title">{title}</h2>
      {sub && <p className="wy-sub">{sub}</p>}
    </header>
  );
}

/** Soft clouds (or a night sky), twinkles, and hearts + bubbles drifting up. Warms (more hearts) after YES. */
export function Atmosphere({ hearts, warm, dark }: { hearts: readonly string[]; warm: boolean; dark: boolean }) {
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
    <div className={`wy-atmo${warm ? " is-warm" : ""}${dark ? " is-dark" : ""}`} aria-hidden>
      {!dark && <span className="wy-cloud wy-cloud-a" />}
      {!dark && <span className="wy-cloud wy-cloud-b" />}
      {!dark && <span className="wy-cloud wy-cloud-c" />}
      {TWINKLES.map(([x, y, s, d], k) => (
        <i key={`t${k}`} className="wy-twinkle" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${-d}s` }} />
      ))}
      {!reduced &&
        bits.map((b, k) =>
          b.bubble ? (
            <span key={k} className="wy-float wy-bub" style={{ left: `${b.left}%`, width: b.size + 6, height: b.size + 6, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }} />
          ) : (
            <span key={k} className="wy-float" style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
              {b.char}
            </span>
          ),
        )}
    </div>
  );
}

/** Where the background twinkles sit: [left %, top %, size px, delay s]. */
const TWINKLES: readonly [number, number, number, number][] = [
  [6, 12, 4, 0.2], [18, 30, 3, 1.4], [31, 8, 5, 2.1], [44, 22, 3, 0.7], [58, 6, 4, 1.9], [69, 27, 3, 0.4], [82, 11, 5, 2.6], [93, 34, 3, 1.1],
  [9, 52, 3, 2.3], [24, 70, 4, 0.9], [88, 58, 4, 1.6], [76, 78, 3, 0.1], [12, 88, 4, 2.8], [52, 92, 3, 1.3], [63, 45, 3, 2.0], [38, 48, 2, 0.5],
];

/**
 * A scroll panel with its own scrollbar: phones hide native bars until you
 * touch them (and iOS never paints a styled one), so a list that runs past the
 * fold looked like it simply ended. This draws a palette-coloured rail that is
 * always visible while there is more to read, fades the clipped edges, and
 * nudges "scroll" until she does.
 */
export function WyScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
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
  // Drag the thumb (or tap the rail) to jump, like a desktop scrollbar.
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
    const up = () => { rail.removeEventListener("pointermove", move); rail.removeEventListener("pointerup", up); rail.removeEventListener("pointercancel", up); };
    rail.addEventListener("pointermove", move);
    rail.addEventListener("pointerup", up);
    rail.addEventListener("pointercancel", up);
  };
  const fade = `${m.over && !m.atTop ? " fade-top" : ""}${m.over && !m.atEnd ? " fade-end" : ""}`;
  return (
    <div className={`wy-scroll${fade} ${className}`}>
      <div ref={ref} className="wy-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="wy-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="wy-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="wy-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="wy-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

export const WY_UI_CSS = `
.wy-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.wy-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none;
  --wy-ft: 0px; --wy-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--wy-ft), #000 calc(100% - var(--wy-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--wy-ft), #000 calc(100% - var(--wy-fe)), transparent 100%); }
.wy-scroll-view::-webkit-scrollbar { display: none; }
.wy-scroll.fade-top .wy-scroll-view { --wy-ft: 22px; }
.wy-scroll.fade-end .wy-scroll-view { --wy-fe: 34px; }
.wy-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.wy-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 16%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 22%, transparent); }
.wy-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.wy-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--wy-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--wy-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.wy-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent); color: #FFFFFF; font: 700 12px ${FONTS.ui}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--wy-deep) 70%, transparent); animation: wy-hint-bob 1.3s ease-in-out infinite; }
@keyframes wy-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
/* Every other scroll box in the template wears the palette, not the site's maroon bar. */
[data-wy-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-wy-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-wy-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-wy-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .wy-scroll-hint { animation: none; } .wy-scroll-thumb { transition: none; } }
.wy-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 70%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; }
.wy-stk { display: inline-grid; place-items: center; padding: 6px; border-radius: 20px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 22px -12px color-mix(in srgb, var(--wy-deep) 60%, transparent); }
.wy-stk img { border-radius: 14px; display: block; }
.wy-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.wy-cloud { position: absolute; border-radius: 999px; background: color-mix(in srgb, var(--vw-paper) 80%, transparent); filter: blur(2px); opacity: .75; }
.wy-cloud::before, .wy-cloud::after { content: ""; position: absolute; border-radius: 50%; background: inherit; }
.wy-cloud-a { width: 46vmin; height: 12vmin; left: -8vmin; bottom: 9vh; animation: wy-drift 26s ease-in-out infinite alternate; }
.wy-cloud-a::before { width: 20vmin; height: 20vmin; left: 7vmin; top: -10vmin; }
.wy-cloud-a::after { width: 14vmin; height: 14vmin; left: 22vmin; top: -6vmin; }
.wy-cloud-b { width: 38vmin; height: 10vmin; right: -6vmin; bottom: 22vh; opacity: .55; animation: wy-drift 32s ease-in-out -8s infinite alternate-reverse; }
.wy-cloud-b::before { width: 16vmin; height: 16vmin; left: 6vmin; top: -8vmin; }
.wy-cloud-b::after { width: 12vmin; height: 12vmin; left: 18vmin; top: -5vmin; }
.wy-cloud-c { width: 30vmin; height: 8vmin; left: 30vw; top: 14vh; opacity: .45; animation: wy-drift 40s ease-in-out -4s infinite alternate; }
.wy-cloud-c::before { width: 12vmin; height: 12vmin; left: 5vmin; top: -6vmin; }
@keyframes wy-drift { from { transform: translateX(-3vmin) } to { transform: translateX(5vmin) } }
.wy-float { position: absolute; bottom: -40px; line-height: 1; opacity: 0; animation: wy-rise linear infinite; will-change: transform, opacity; }
.wy-bub { border-radius: 50%; background: radial-gradient(circle at 32% 30%, rgba(255,255,255,.95) 0 18%, rgba(255,255,255,.25) 36%, color-mix(in srgb, var(--vw-accent) 18%, transparent) 70%, color-mix(in srgb, var(--vw-paper) 60%, transparent) 100%);
  box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.7); }
@keyframes wy-rise { 0% { transform: translate(0, 0) rotate(-8deg); opacity: 0 } 10% { opacity: .55 } 50% { transform: translate(18px, -52vh) rotate(8deg) } 90% { opacity: .45 } 100% { transform: translate(-10px, -110vh) rotate(-6deg); opacity: 0 } }
.wy-atmo.is-dark .wy-bub { background: radial-gradient(circle at 32% 30%, rgba(255,255,255,.75) 0 12%, rgba(255,255,255,.1) 38%, rgba(255,255,255,.03) 100%); box-shadow: inset 0 0 0 1px rgba(255,255,255,.3); }
.wy-atmo.is-warm .wy-float { animation-duration: 7s !important; }
/* Twinkles: tiny four-point glints in the palette's gold (bright stars on the night look). */
.wy-twinkle { position: absolute; display: block; border-radius: 50%; background: var(--vw-gold); opacity: .35; box-shadow: 0 0 6px 1px color-mix(in srgb, var(--vw-gold) 70%, transparent); animation: wy-tw 3.2s ease-in-out infinite; }
.wy-atmo.is-dark .wy-twinkle { background: #FFFFFF; opacity: .7; box-shadow: 0 0 8px 2px color-mix(in srgb, var(--vw-gold) 60%, transparent); }
@keyframes wy-tw { 0%, 100% { transform: scale(.6); opacity: .25 } 50% { transform: scale(1.2); opacity: .9 } }
@media (prefers-reduced-motion: reduce) { .wy-cloud, .wy-twinkle { animation: none; } }
`;
