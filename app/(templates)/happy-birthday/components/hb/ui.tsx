"use client";

// Small shared pieces: the scene heading, the party background (soft clouds,
// little balloons drifting up and falling sprinkles in the page's flavour), the
// themed scroll panel and text helpers.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { HbPaletteDef } from "../../../_valentine/days/happy-birthday";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: HbPaletteDef): CSSProperties {
  const c = p.cake;
  return {
    ["--hb-blush" as string]: p.blush,
    ["--hb-deep" as string]: p.deep,
    ["--hb-cheek" as string]: `color-mix(in srgb, ${p.theme.accent} 45%, #FFFFFF)`,
    ["--hb-sponge" as string]: c.sponge,
    ["--hb-frost" as string]: c.frosting,
    ["--hb-cream" as string]: c.cream,
    ["--hb-drip" as string]: c.drip,
    ["--hb-plate" as string]: c.plate,
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="hb-head">
      {kicker && <p className="hb-kick">{kicker}</p>}
      <h2 className="hb-title">{title}</h2>
      {sub && <p className="hb-sub">{sub}</p>}
    </header>
  );
}

/** Soft clouds, little balloons drifting up and sprinkles falling. Livelier once they say yes. */
export function Atmosphere({ floats, balloons, sprinkles, warm }: { floats: readonly string[]; balloons: readonly string[]; sprinkles: readonly string[]; warm: boolean }) {
  const reduced = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: 14 }, (_, k) => ({
        left: (k * 61 + 7) % 100,
        delay: -((k * 1.9) % 15),
        dur: 13 + (k % 5) * 2.4,
        size: 14 + ((k * 7) % 14),
        balloon: k % 3 === 0,
        color: balloons[k % balloons.length],
        char: floats[k % floats.length],
      })),
    [floats, balloons],
  );
  const specks = useMemo(
    () =>
      Array.from({ length: 18 }, (_, k) => ({
        left: (k * 37 + 11) % 100,
        delay: -((k * 1.3) % 11),
        dur: 9 + (k % 4) * 2,
        color: sprinkles[k % sprinkles.length],
        rot: (k * 47) % 180,
      })),
    [sprinkles],
  );
  return (
    <div className={`hb-atmo${warm ? " is-warm" : ""}`} aria-hidden>
      <span className="hb-cloud hb-cloud-a" />
      <span className="hb-cloud hb-cloud-b" />
      <span className="hb-cloud hb-cloud-c" />
      {!reduced &&
        specks.map((s, k) => (
          <span key={`s${k}`} className="hb-speck" style={{ left: `${s.left}%`, background: s.color, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`, ["--r" as string]: `${s.rot}deg` }} />
        ))}
      {!reduced &&
        bits.map((b, k) =>
          b.balloon ? (
            <span key={k} className="hb-float hb-mini-b" style={{ left: `${b.left}%`, width: b.size + 4, height: (b.size + 4) * 1.2, ["--b" as string]: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }} />
          ) : (
            <span key={k} className="hb-float" style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
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
 * nudges "scroll" until they do.
 */
export function HbScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
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
    <div className={`hb-scroll${fade} ${className}`}>
      <div ref={ref} className="hb-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="hb-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="hb-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="hb-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="hb-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

export const HB_UI_CSS = `
.hb-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.hb-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none;
  --hb-ft: 0px; --hb-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--hb-ft), #000 calc(100% - var(--hb-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--hb-ft), #000 calc(100% - var(--hb-fe)), transparent 100%); }
.hb-scroll-view::-webkit-scrollbar { display: none; }
.hb-scroll.fade-top .hb-scroll-view { --hb-ft: 22px; }
.hb-scroll.fade-end .hb-scroll-view { --hb-fe: 34px; }
.hb-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.hb-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 16%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 22%, transparent); }
.hb-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.hb-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--hb-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--hb-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.hb-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent); color: #FFFFFF; font: 700 12px ${FONTS.ui}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--hb-deep) 70%, transparent); animation: hb-hint-bob 1.3s ease-in-out infinite; }
@keyframes hb-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
/* Every other scroll box in the template wears the palette, not the site's maroon bar. */
[data-hb-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-hb-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-hb-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-hb-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .hb-scroll-hint { animation: none; } .hb-scroll-thumb { transition: none; } }
.hb-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 70%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; touch-action: manipulation; }
.hb-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.hb-stk { display: inline-grid; place-items: center; padding: 6px; border-radius: 20px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 22px -12px color-mix(in srgb, var(--hb-deep) 60%, transparent); }
.hb-stk img { border-radius: 14px; display: block; }
.hb-card { box-sizing: border-box; border-radius: 22px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 14px 26px -16px color-mix(in srgb, var(--hb-deep) 60%, transparent); }
.hb-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.hb-cloud { position: absolute; border-radius: 999px; background: color-mix(in srgb, var(--vw-paper) 80%, transparent); filter: blur(2px); opacity: .75; }
.hb-cloud::before, .hb-cloud::after { content: ""; position: absolute; border-radius: 50%; background: inherit; }
.hb-cloud-a { width: 46vmin; height: 12vmin; left: -8vmin; bottom: 9vh; animation: hb-drift 26s ease-in-out infinite alternate; }
.hb-cloud-a::before { width: 20vmin; height: 20vmin; left: 7vmin; top: -10vmin; }
.hb-cloud-a::after { width: 14vmin; height: 14vmin; left: 22vmin; top: -6vmin; }
.hb-cloud-b { width: 38vmin; height: 10vmin; right: -6vmin; bottom: 22vh; opacity: .55; animation: hb-drift 32s ease-in-out -8s infinite alternate-reverse; }
.hb-cloud-b::before { width: 16vmin; height: 16vmin; left: 6vmin; top: -8vmin; }
.hb-cloud-b::after { width: 12vmin; height: 12vmin; left: 18vmin; top: -5vmin; }
.hb-cloud-c { width: 30vmin; height: 8vmin; left: 30vw; top: 14vh; opacity: .45; animation: hb-drift 40s ease-in-out -4s infinite alternate; }
.hb-cloud-c::before { width: 12vmin; height: 12vmin; left: 5vmin; top: -6vmin; }
@keyframes hb-drift { from { transform: translateX(-3vmin) } to { transform: translateX(5vmin) } }
.hb-float { position: absolute; bottom: -50px; line-height: 1; opacity: 0; animation: hb-rise linear infinite; will-change: transform, opacity; }
.hb-mini-b { border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%; background: radial-gradient(circle at 34% 28%, rgba(255,255,255,.85) 0 12%, var(--b) 46%, color-mix(in srgb, var(--b) 75%, #000) 100%); }
.hb-mini-b::after { content: ""; position: absolute; left: 50%; top: 100%; width: 1px; height: 26px; background: color-mix(in srgb, var(--vw-ink) 35%, transparent); }
@keyframes hb-rise { 0% { transform: translate(0, 0) rotate(-8deg); opacity: 0 } 10% { opacity: .55 } 50% { transform: translate(18px, -52vh) rotate(8deg) } 90% { opacity: .45 } 100% { transform: translate(-10px, -112vh) rotate(-6deg); opacity: 0 } }
.hb-speck { position: absolute; top: -12px; width: 4px; height: 10px; border-radius: 2px; opacity: 0; animation: hb-fall linear infinite; will-change: transform, opacity; }
@keyframes hb-fall { 0% { transform: translate(0, 0) rotate(var(--r)); opacity: 0 } 8% { opacity: .7 } 90% { opacity: .55 } 100% { transform: translate(14px, 105vh) rotate(calc(var(--r) + 540deg)); opacity: 0 } }
.hb-atmo.is-warm .hb-float { animation-duration: 7s !important; }
.hb-atmo.is-warm .hb-speck { animation-duration: 5s !important; }
@media (prefers-reduced-motion: reduce) { .hb-cloud { animation: none; } }
/* Desktop: the props grow into the wider stage (each scene's own CSS sets the phone sizes). */
@media (min-width: 1100px) {
  .hb-scene .hb-gift { width: min(74cqw, 72cqh, 330px); }
  .hb-scene .hb-gift.is-open .hb-gift-lid { transform: translate(5%, -190%) rotate(-9deg); }
  .hb-scene .hb-cakebox, .hb-scene .hb-cut { width: min(92cqw, 108cqh, 450px); }
  .hb-scene .hb-wish { width: min(100%, 440px); }
  .hb-scene .hb-balloons { width: min(100cqw, 118cqh, 540px); }
  .hb-scene .hb-reasons { width: min(100%, 470px); }
  .hb-scene .hb-gifts-wrap { width: min(100%, 540px); }
  .hb-scene .hb-gifts-gif { right: -104px; top: 6px; }
  .hb-scene .hb-paper { width: min(100%, 540px); }
  .hb-scene .hb-slice { width: min(80cqw, 50cqh, 320px); }
  .hb-scene .hb-served { width: min(100%, 440px); }
  .hb-scene .hb-cert { width: min(100%, 410px); }
}
`;
