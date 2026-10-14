"use client";

// Small shared pieces: the scene heading, the sky behind everything (twinkling
// stars, a moon, soft clouds and drifting hearts in the page's palette), the
// themed scroll panel and text helpers.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { MissYouPaletteDef } from "../../../_valentine/days/miss-you";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: MissYouPaletteDef): CSSProperties {
  const dark = p.theme.dark;
  return {
    ["--mu-blush" as string]: p.blush,
    ["--mu-deep" as string]: p.deep,
    ["--mu-map" as string]: p.map,
    ["--mu-stars" as string]: String(p.stars),
    // Kickers and small accents: the deep accent on the day looks, the star gold at night.
    ["--mu-kick" as string]: dark ? p.theme.gold : p.theme.accentDeep,
    // Card ink on the white sticker/polaroid frames stays dark on every look.
    ["--mu-card-ink" as string]: dark ? "#2B2350" : p.theme.ink,
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mu-head">
      {kicker && <p className="mu-kick">{kicker}</p>}
      <h2 className="mu-title">{title}</h2>
      {sub && <p className="mu-sub">{sub}</p>}
    </header>
  );
}

/** The sky: twinkling stars, a crescent moon, soft clouds low down and hearts drifting up. Warms once they say yes. */
export function Atmosphere({ floats, warm }: { floats: readonly string[]; warm: boolean }) {
  const reduced = useReducedMotion();
  const stars = useMemo(
    () =>
      Array.from({ length: 34 }, (_, k) => ({
        left: (k * 37 + 11) % 100,
        top: (k * 53 + 7) % 72,
        size: 1.5 + ((k * 7) % 5) * 0.6,
        delay: -((k * 0.73) % 4),
        dur: 2.4 + (k % 4) * 0.7,
      })),
    [],
  );
  const bits = useMemo(
    () =>
      Array.from({ length: 12 }, (_, k) => ({
        left: (k * 61 + 7) % 100,
        delay: -((k * 1.9) % 16),
        dur: 14 + (k % 5) * 2.6,
        size: 14 + ((k * 7) % 14),
        char: floats[k % floats.length],
      })),
    [floats],
  );
  return (
    <div className={`mu-atmo${warm ? " is-warm" : ""}`} aria-hidden>
      {stars.map((s, k) => (
        <span key={`s${k}`} className="mu-star" style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
      ))}
      <span className="mu-moon" />
      <span className="mu-cloud mu-cloud-a" />
      <span className="mu-cloud mu-cloud-b" />
      {!reduced &&
        bits.map((b, k) => (
          <span key={k} className="mu-float" style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
            {b.char}
          </span>
        ))}
    </div>
  );
}

/**
 * A scroll panel with its own always-visible, palette-coloured rail (phones
 * hide native bars until touched and iOS never paints a styled one), faded
 * clipped edges and a "scroll" nudge until she does. Same as Sorry's SrScroll.
 */
export function MuScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
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
    <div className={`mu-scroll${fade}${m.over ? " is-over" : ""} ${className}`}>
      <div ref={ref} className="mu-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="mu-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="mu-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="mu-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="mu-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

export const MU_UI_CSS = `
.mu-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.mu-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; outline: none;
  --mu-ft: 0px; --mu-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--mu-ft), #000 calc(100% - var(--mu-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--mu-ft), #000 calc(100% - var(--mu-fe)), transparent 100%); }
.mu-scroll.is-over .mu-scroll-view { padding-right: 16px; }
.mu-scroll-view::-webkit-scrollbar { display: none; }
.mu-scroll.fade-top .mu-scroll-view { --mu-ft: 22px; }
.mu-scroll.fade-end .mu-scroll-view { --mu-fe: 34px; }
.mu-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.mu-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 18%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 24%, transparent); }
.mu-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.mu-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--vw-accent-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--mu-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.mu-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent); color: #FFFFFF; font: 700 12px ${FONTS.ui}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--mu-deep) 70%, transparent); animation: mu-hint-bob 1.3s ease-in-out infinite; }
@keyframes mu-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
[data-mu-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-mu-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-mu-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-mu-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .mu-scroll-hint { animation: none; } .mu-scroll-thumb { transition: none; } }
.mu-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 70%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; }
.mu-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
/* GIF stickers: a white rounded frame with a tilt, so the GIF's own white ground reads as intended. */
.mu-stk { display: inline-grid; place-items: center; padding: 6px; border-radius: 20px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 22px -12px color-mix(in srgb, var(--mu-deep) 60%, transparent); }
.mu-stk img { border-radius: 14px; display: block; }
.mu-card { background: var(--vw-paper); color: var(--vw-ink); border-radius: 22px; box-shadow: 0 0 0 2px var(--vw-edge), 0 16px 30px -18px color-mix(in srgb, var(--mu-deep) 70%, transparent); }

/* The sky. */
.mu-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.mu-star { position: absolute; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 6px 1px rgba(255,255,255,.8); opacity: calc(var(--mu-stars) * .8); animation: mu-twinkle 3s ease-in-out infinite; }
@keyframes mu-twinkle { 0%, 100% { opacity: calc(var(--mu-stars) * .25); transform: scale(.7) } 50% { opacity: calc(var(--mu-stars) * .95); transform: scale(1.15) } }
.mu-moon { position: absolute; right: 5vw; top: 36vh; width: 13vmin; height: 13vmin; max-width: 84px; max-height: 84px; border-radius: 50%;
  box-shadow: inset -2.4vmin 1.2vmin 0 0 var(--vw-gold); opacity: calc(.35 + var(--mu-stars) * .55); transform: rotate(-18deg); filter: drop-shadow(0 0 18px color-mix(in srgb, var(--vw-gold) 55%, transparent)); }
@media (min-width: 768px) { .mu-moon { right: 7vw; top: 30vh; } }
.mu-cloud { position: absolute; border-radius: 999px; background: color-mix(in srgb, var(--vw-paper) 72%, transparent); filter: blur(2px); opacity: calc(.75 - var(--mu-stars) * .45); }
.mu-cloud::before, .mu-cloud::after { content: ""; position: absolute; border-radius: 50%; background: inherit; }
.mu-cloud-a { width: 46vmin; height: 12vmin; left: -8vmin; bottom: 9vh; animation: mu-drift 26s ease-in-out infinite alternate; }
.mu-cloud-a::before { width: 20vmin; height: 20vmin; left: 7vmin; top: -10vmin; }
.mu-cloud-a::after { width: 14vmin; height: 14vmin; left: 22vmin; top: -6vmin; }
.mu-cloud-b { width: 38vmin; height: 10vmin; right: -6vmin; bottom: 24vh; animation: mu-drift 32s ease-in-out -8s infinite alternate-reverse; }
.mu-cloud-b::before { width: 16vmin; height: 16vmin; left: 6vmin; top: -8vmin; }
.mu-cloud-b::after { width: 12vmin; height: 12vmin; left: 18vmin; top: -5vmin; }
@keyframes mu-drift { from { transform: translateX(-3vmin) } to { transform: translateX(5vmin) } }
.mu-float { position: absolute; bottom: -40px; line-height: 1; opacity: 0; animation: mu-rise linear infinite; will-change: transform, opacity; }
@keyframes mu-rise { 0% { transform: translate(0, 0) rotate(-8deg); opacity: 0 } 10% { opacity: .5 } 50% { transform: translate(18px, -52vh) rotate(8deg) } 90% { opacity: .4 } 100% { transform: translate(-10px, -110vh) rotate(-6deg); opacity: 0 } }
.mu-atmo.is-warm .mu-float { animation-duration: 7s !important; }
@media (prefers-reduced-motion: reduce) { .mu-cloud, .mu-star { animation: none; } }
`;
