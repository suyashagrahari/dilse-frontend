"use client";

// Small shared pieces: the scene heading, the drifting background (soft clouds,
// hearts and bubbles in the page's palette) and text helpers.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
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

/**
 * A scroll panel with its own scrollbar: phones hide native bars until you
 * touch them (and iOS never paints a styled one), so a list that runs past the
 * fold looked like it simply ended. This draws a palette-coloured rail that is
 * always visible while there is more to read, fades the clipped edges, and
 * nudges "scroll" until she does.
 */
export function SrScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
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
    <div className={`sr-scroll${fade} ${className}`}>
      <div ref={ref} className="sr-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="sr-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="sr-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="sr-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="sr-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

export const SR_UI_CSS = `
.sr-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.sr-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none;
  --sr-ft: 0px; --sr-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--sr-ft), #000 calc(100% - var(--sr-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--sr-ft), #000 calc(100% - var(--sr-fe)), transparent 100%); }
.sr-scroll-view::-webkit-scrollbar { display: none; }
.sr-scroll.fade-top .sr-scroll-view { --sr-ft: 22px; }
.sr-scroll.fade-end .sr-scroll-view { --sr-fe: 34px; }
.sr-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.sr-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 16%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 22%, transparent); }
.sr-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.sr-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--sr-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--sr-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.sr-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent); color: #FFFFFF; font: 700 12px ${FONTS.ui}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--sr-deep) 70%, transparent); animation: sr-hint-bob 1.3s ease-in-out infinite; }
@keyframes sr-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
/* Every other scroll box in the template wears the palette, not the site's maroon bar. */
[data-sr-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-sr-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-sr-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-sr-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .sr-scroll-hint { animation: none; } .sr-scroll-thumb { transition: none; } }
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
