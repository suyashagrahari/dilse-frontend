"use client";

// Small shared pieces: the scene heading, the sky that walks from morning to
// the next sunrise behind every scene, the themed scroll panel and helpers.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { MissPremPaletteDef, SkyHour } from "../../../_valentine/days/miss-you-premium";
import { MP_DISPLAY } from "./fonts";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: MissPremPaletteDef): CSSProperties {
  return {
    ["--mp-blush" as string]: p.blush,
    ["--mp-deep" as string]: p.deep,
    ["--mp-pop" as string]: p.pop,
    ["--mp-cheek" as string]: `color-mix(in srgb, ${p.theme.accent} 40%, #FFFFFF)`,
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mp-head">
      {kicker && <p className="mp-kick">{kicker}</p>}
      <h2 className="mp-title">{title}</h2>
      {sub && <p className="mp-sub">{sub}</p>}
    </header>
  );
}

const HOURS: readonly SkyHour[] = ["morning", "noon", "afternoon", "golden", "sunset", "dusk", "sunrise"];

/** Where the sun (or, at dusk, the moon) hangs for each hour: left %, top %, size vmin. */
const SUN: Record<SkyHour, { x: number; y: number; s: number; glow: number }> = {
  morning: { x: 16, y: 22, s: 16, glow: 0.7 },
  noon: { x: 50, y: 7, s: 13, glow: 0.55 },
  afternoon: { x: 78, y: 14, s: 14, glow: 0.6 },
  golden: { x: 84, y: 40, s: 19, glow: 0.9 },
  sunset: { x: 62, y: 66, s: 24, glow: 1 },
  dusk: { x: 80, y: 12, s: 11, glow: 0.45 },
  sunrise: { x: 50, y: 58, s: 28, glow: 1 },
};

/**
 * The day's sky, fixed behind the scenes. Each hour is its own gradient layer
 * and they cross-fade, so the page drifts from morning light to a lilac dusk
 * and on to sunrise without a hard cut. Even dusk stays pastel.
 */
export function Sky({ palette, hour, warm }: { palette: MissPremPaletteDef; hour: SkyHour; warm: boolean }) {
  const reduced = useReducedMotion();
  const sun = SUN[hour];
  const starry = hour === "dusk" || hour === "sunset";
  const bits = useMemo(
    () =>
      Array.from({ length: 12 }, (_, k) => ({
        left: (k * 67 + 11) % 100,
        delay: -((k * 2.3) % 16),
        dur: 14 + (k % 4) * 3,
        size: 13 + ((k * 7) % 12),
        char: palette.floats[k % palette.floats.length],
      })),
    [palette.floats],
  );
  const stars = useMemo(() => Array.from({ length: 26 }, (_, k) => ({ x: (k * 37 + 5) % 100, y: (k * 53 + 7) % 58, s: 2 + (k % 3), d: (k % 7) * 0.4 })), []);
  return (
    <div className={`mp-sky${warm ? " is-warm" : ""}`} aria-hidden data-mp-hour={hour}>
      {HOURS.map((h) => (
        <span key={h} className="mp-sky-layer" style={{ background: `linear-gradient(180deg, ${palette.skies[h][0]} 0%, ${palette.skies[h][1]} 78%)`, opacity: h === hour ? 1 : 0 }} />
      ))}
      <span className={`mp-stars${starry ? " is-on" : ""}`}>
        {stars.map((s, k) => (
          <i key={k} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
        ))}
      </span>
      <span
        className={`mp-sun${hour === "dusk" ? " is-moon" : ""}`}
        style={{ left: `${sun.x}%`, top: `${sun.y}%`, width: `${sun.s}vmin`, height: `${sun.s}vmin`, ["--glow" as string]: String(sun.glow) }}
      />
      <span className="mp-cloud mp-cloud-a" />
      <span className="mp-cloud mp-cloud-b" />
      <span className="mp-cloud mp-cloud-c" />
      {!reduced &&
        bits.map((b, k) => (
          <span key={k} className="mp-float" style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
            {b.char}
          </span>
        ))}
    </div>
  );
}

/**
 * A scroll panel with its own always-visible, palette-coloured rail (phones
 * hide native bars until touched, so long lists looked like they ended).
 */
export function MpScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
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
    <div className={`mp-scroll${fade} ${className}`}>
      <div ref={ref} className="mp-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="mp-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="mp-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="mp-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="mp-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

/** A tiny "do this" chip with a pointing hand that bobs — every scene shows one until it's done. */
export function Hint({ children, show = true }: { children: ReactNode; show?: boolean }) {
  if (!show) return <p className="mp-hint is-gone" aria-hidden />;
  return (
    <p className="mp-hint" role="status">
      <span className="mp-hint-ico" aria-hidden>
        👆
      </span>
      {children}
    </p>
  );
}

export const MP_UI_CSS = `
.mp-head { flex: none; display: grid; gap: 4px; justify-items: center; max-width: 460px; }
.mp-kick { margin: 0; display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 99px; font: 700 clamp(11px, 1.6dvh, 12.5px)/1.2 ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase;
  color: var(--vw-accent-deep); background: color-mix(in srgb, var(--vw-paper) 78%, transparent); box-shadow: 0 0 0 1.5px var(--vw-edge); }
.mp-title { margin: 0; font: 800 clamp(27px, min(8.4vw, 4.8dvh), 42px)/1.08 ${MP_DISPLAY}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere;
  text-shadow: 0 2px 0 color-mix(in srgb, var(--vw-paper) 85%, transparent); }
.mp-sub { margin: 0; font: 500 clamp(14px, 2.05dvh, 16.5px)/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); text-wrap: balance; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .mp-title { font-size: clamp(38px, 5dvh, 52px); } .mp-sub { font-size: 17px; } }
.mp-hint { flex: none; margin: 0; min-height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 5px 13px 5px 9px; border-radius: 99px;
  font: 700 clamp(13px, 1.9dvh, 15px)/1.2 ${FONTS.ui}; color: var(--vw-ink); background: color-mix(in srgb, var(--vw-paper) 86%, transparent);
  box-shadow: 0 0 0 1.5px var(--vw-edge), 0 8px 16px -10px color-mix(in srgb, var(--mp-deep) 50%, transparent); box-sizing: border-box; max-width: 100%; }
.mp-hint.is-gone { visibility: hidden; }
.mp-hint-ico { display: inline-block; animation: mp-tap 1.1s ease-in-out infinite; }
@keyframes mp-tap { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }

.mp-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.mp-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none; --mp-ft: 0px; --mp-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--mp-ft), #000 calc(100% - var(--mp-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--mp-ft), #000 calc(100% - var(--mp-fe)), transparent 100%); }
.mp-scroll-view::-webkit-scrollbar { display: none; }
.mp-scroll.fade-top .mp-scroll-view { --mp-ft: 22px; }
.mp-scroll.fade-end .mp-scroll-view { --mp-fe: 34px; }
.mp-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.mp-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 16%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 22%, transparent); }
.mp-scroll-rail::before { content: ""; position: absolute; inset: -6px -10px; }
.mp-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--mp-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--mp-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.mp-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent-deep); color: #FFFFFF; font: 700 12px ${FONTS.ui}; letter-spacing: .02em; animation: mp-hint-bob 1.3s ease-in-out infinite; }
@keyframes mp-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
[data-mp-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-mp-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-mp-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-mp-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }

.mp-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 80%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; touch-action: manipulation; }
.mp-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.mp-stk { display: inline-grid; place-items: center; padding: 5px; border-radius: 18px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 22px -12px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-stk img { border-radius: 13px; display: block; }

/* The sky */
.mp-sky { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.mp-sky-layer { position: absolute; inset: 0; transition: opacity 1.4s ease; }
.mp-sun { position: absolute; transform: translate(-50%, -50%); border-radius: 50%; transition: left 1.6s cubic-bezier(.4,0,.2,1), top 1.6s cubic-bezier(.4,0,.2,1), width 1.6s ease, height 1.6s ease, background 1.2s ease;
  background: radial-gradient(circle at 42% 40%, #FFFDF2 0 30%, #FFE7A8 62%, #FFD18A 100%);
  box-shadow: 0 0 calc(10vmin * var(--glow)) calc(4vmin * var(--glow)) rgba(255, 232, 170, calc(.55 * var(--glow))), 0 0 calc(26vmin * var(--glow)) calc(10vmin * var(--glow)) rgba(255, 214, 200, calc(.35 * var(--glow))); }
.mp-sun.is-moon { background: radial-gradient(circle at 38% 36%, #FFFFFF 0 40%, #F3EEFF 70%, #E3DAFA 100%); box-shadow: 0 0 6vmin 2vmin rgba(255,255,255,.6); }
.mp-stars { position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s ease; }
.mp-stars.is-on { opacity: 1; }
.mp-stars i { position: absolute; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 6px 1px rgba(255,255,255,.9); animation: mp-twinkle 2.8s ease-in-out infinite; }
@keyframes mp-twinkle { 0%, 100% { opacity: .35; transform: scale(.8) } 50% { opacity: 1; transform: scale(1.2) } }
.mp-cloud { position: absolute; border-radius: 999px; background: rgba(255,255,255,.82); filter: blur(1.5px); }
.mp-cloud::before, .mp-cloud::after { content: ""; position: absolute; border-radius: 50%; background: inherit; }
.mp-cloud-a { width: 44vmin; height: 11vmin; left: -10vmin; bottom: 8vh; animation: mp-drift 28s ease-in-out infinite alternate; }
.mp-cloud-a::before { width: 19vmin; height: 19vmin; left: 7vmin; top: -10vmin; }
.mp-cloud-a::after { width: 13vmin; height: 13vmin; left: 22vmin; top: -6vmin; }
.mp-cloud-b { width: 36vmin; height: 9vmin; right: -8vmin; bottom: 24vh; opacity: .7; animation: mp-drift 34s ease-in-out -8s infinite alternate-reverse; }
.mp-cloud-b::before { width: 15vmin; height: 15vmin; left: 6vmin; top: -8vmin; }
.mp-cloud-b::after { width: 11vmin; height: 11vmin; left: 17vmin; top: -5vmin; }
.mp-cloud-c { width: 28vmin; height: 7vmin; left: 28vw; top: 15vh; opacity: .55; animation: mp-drift 42s ease-in-out -4s infinite alternate; }
.mp-cloud-c::before { width: 11vmin; height: 11vmin; left: 5vmin; top: -6vmin; }
@keyframes mp-drift { from { transform: translateX(-4vmin) } to { transform: translateX(6vmin) } }
.mp-float { position: absolute; bottom: -40px; line-height: 1; opacity: 0; animation: mp-rise linear infinite; will-change: transform, opacity; }
@keyframes mp-rise { 0% { transform: translate(0, 0) rotate(-8deg); opacity: 0 } 10% { opacity: .5 } 50% { transform: translate(16px, -52vh) rotate(8deg) } 90% { opacity: .4 } 100% { transform: translate(-10px, -110vh) rotate(-6deg); opacity: 0 } }
.mp-sky.is-warm .mp-float { animation-duration: 7s !important; }
@media (prefers-reduced-motion: reduce) {
  .mp-cloud, .mp-stars i, .mp-hint-ico, .mp-scroll-hint { animation: none !important; }
  .mp-sky-layer, .mp-sun, .mp-stars { transition-duration: .01s !important; }
}
`;
