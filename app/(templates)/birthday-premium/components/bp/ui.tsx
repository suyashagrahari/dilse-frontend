"use client";

// Small shared pieces: the scene heading, the storybook background (soft
// paper clouds, drifting balloons and falling paper confetti in the page's
// look), the themed scroll panel, the GIF sticker frame and text helpers.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { BpPaletteDef } from "../../../_valentine/days/birthday-premium";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: BpPaletteDef): CSSProperties {
  return {
    ["--bp-blush" as string]: p.blush,
    ["--bp-deep" as string]: p.deep,
    ["--bp-second" as string]: p.second,
    ["--bp-sponge" as string]: p.sponge,
    ["--bp-cheek" as string]: `color-mix(in srgb, ${p.theme.accent} 40%, #FFFFFF)`,
    ["--bp-pop0" as string]: p.pops[0],
    ["--bp-pop1" as string]: p.pops[1],
    ["--bp-pop2" as string]: p.pops[2],
    ["--bp-pop3" as string]: p.pops[3],
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="bp-head">
      {kicker && <p className="bp-kick">{kicker}</p>}
      <h2 className="bp-title">{title}</h2>
      {sub && <p className="bp-sub">{sub}</p>}
    </header>
  );
}

/** Soft paper clouds, little balloons drifting up and paper confetti falling. Livelier once they say yes. */
export function Atmosphere({ floats, pops, warm }: { floats: readonly string[]; pops: readonly string[]; warm: boolean }) {
  const reduced = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: 12 }, (_, k) => ({
        left: (k * 61 + 7) % 100,
        delay: -((k * 1.9) % 15),
        dur: 14 + (k % 5) * 2.4,
        size: 14 + ((k * 7) % 12),
        balloon: k % 3 === 0,
        color: pops[k % pops.length],
        char: floats[k % floats.length],
      })),
    [floats, pops],
  );
  const specks = useMemo(
    () =>
      Array.from({ length: 16 }, (_, k) => ({
        left: (k * 37 + 11) % 100,
        delay: -((k * 1.3) % 11),
        dur: 10 + (k % 4) * 2,
        color: pops[(k + 2) % pops.length],
        rot: (k * 47) % 180,
        round: k % 3 === 0,
      })),
    [pops],
  );
  return (
    <div className={`bp-atmo${warm ? " is-warm" : ""}`} aria-hidden>
      <span className="bp-dots" />
      <span className="bp-cloud bp-cloud-a" />
      <span className="bp-cloud bp-cloud-b" />
      <span className="bp-cloud bp-cloud-c" />
      {!reduced &&
        specks.map((s, k) => (
          <span key={`s${k}`} className={`bp-speck${s.round ? " is-round" : ""}`} style={{ left: `${s.left}%`, background: s.color, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`, ["--r" as string]: `${s.rot}deg` }} />
        ))}
      {!reduced &&
        bits.map((b, k) =>
          b.balloon ? (
            <span key={k} className="bp-float bp-mini-b" style={{ left: `${b.left}%`, width: b.size + 4, height: (b.size + 4) * 1.2, ["--b" as string]: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }} />
          ) : (
            <span key={k} className="bp-float" style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
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
export function BpScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
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
    <div className={`bp-scroll${fade} ${className}`}>
      <div ref={ref} className="bp-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="bp-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="bp-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="bp-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="bp-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

export const BP_UI_CSS = `
.bp-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.bp-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none;
  --bp-ft: 0px; --bp-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--bp-ft), #000 calc(100% - var(--bp-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--bp-ft), #000 calc(100% - var(--bp-fe)), transparent 100%); }
.bp-scroll-view::-webkit-scrollbar { display: none; }
.bp-scroll.fade-top .bp-scroll-view { --bp-ft: 22px; }
.bp-scroll.fade-end .bp-scroll-view { --bp-fe: 34px; }
.bp-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.bp-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 16%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 22%, transparent); }
.bp-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.bp-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--bp-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--bp-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.bp-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent); color: #FFFFFF; font: 700 12px ${FONTS.ui}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--bp-deep) 70%, transparent); animation: bp-hint-bob 1.3s ease-in-out infinite; }
@keyframes bp-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
/* Every other scroll box in the template wears the palette, not the site's maroon bar. */
[data-bp-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-bp-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-bp-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-bp-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .bp-scroll-hint { animation: none; } .bp-scroll-thumb { transition: none; } }
.bp-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 75%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; touch-action: manipulation; }
.bp-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.bp-btn { min-height: 48px; padding: 0 22px; border: 0; border-radius: 99px; cursor: pointer; touch-action: manipulation; color: #FFFFFF; font: 800 17px var(--font-bp-display), ${FONTS.ui};
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); box-shadow: 0 4px 0 var(--bp-deep), 0 12px 22px -12px color-mix(in srgb, var(--bp-deep) 70%, transparent);
  -webkit-tap-highlight-color: transparent; transition: transform .12s ease; }
.bp-btn:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 var(--bp-deep); }
.bp-btn:disabled { opacity: .5; cursor: default; }
.bp-btn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.bp-stk { display: inline-grid; place-items: center; padding: 6px; border-radius: 20px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 0 0 5px color-mix(in srgb, var(--vw-gold) 45%, transparent), 0 12px 22px -12px color-mix(in srgb, var(--bp-deep) 60%, transparent); }
.bp-stk img { border-radius: 14px; display: block; }
.bp-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.bp-dots { position: absolute; inset: 0; opacity: .35; background: radial-gradient(circle, color-mix(in srgb, var(--vw-gold) 65%, transparent) 0 1.6px, transparent 2.2px) 0 0 / 30px 30px; -webkit-mask-image: linear-gradient(180deg, #000, transparent 70%); mask-image: linear-gradient(180deg, #000, transparent 70%); }
.bp-cloud { position: absolute; border-radius: 999px; background: color-mix(in srgb, var(--vw-paper) 85%, transparent); box-shadow: 0 6px 0 color-mix(in srgb, var(--vw-edge) 40%, transparent); opacity: .8; }
.bp-cloud::before, .bp-cloud::after { content: ""; position: absolute; border-radius: 50%; background: inherit; }
.bp-cloud-a { width: 44vmin; height: 11vmin; left: -8vmin; bottom: 10vh; animation: bp-drift 26s ease-in-out infinite alternate; }
.bp-cloud-a::before { width: 19vmin; height: 19vmin; left: 7vmin; top: -10vmin; }
.bp-cloud-a::after { width: 13vmin; height: 13vmin; left: 22vmin; top: -6vmin; }
.bp-cloud-b { width: 36vmin; height: 9vmin; right: -6vmin; bottom: 24vh; opacity: .6; animation: bp-drift 32s ease-in-out -8s infinite alternate-reverse; }
.bp-cloud-b::before { width: 15vmin; height: 15vmin; left: 6vmin; top: -8vmin; }
.bp-cloud-b::after { width: 11vmin; height: 11vmin; left: 18vmin; top: -5vmin; }
.bp-cloud-c { width: 28vmin; height: 7vmin; left: 32vw; top: 13vh; opacity: .5; animation: bp-drift 40s ease-in-out -4s infinite alternate; }
.bp-cloud-c::before { width: 11vmin; height: 11vmin; left: 5vmin; top: -6vmin; }
@keyframes bp-drift { from { transform: translateX(-3vmin) } to { transform: translateX(5vmin) } }
.bp-float { position: absolute; bottom: -50px; line-height: 1; opacity: 0; animation: bp-rise linear infinite; will-change: transform, opacity; }
.bp-mini-b { border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%; background: radial-gradient(circle at 34% 28%, rgba(255,255,255,.85) 0 12%, var(--b) 46%, color-mix(in srgb, var(--b) 78%, #000) 100%); }
.bp-mini-b::after { content: ""; position: absolute; left: 50%; top: 100%; width: 1px; height: 26px; background: color-mix(in srgb, var(--vw-ink) 35%, transparent); }
@keyframes bp-rise { 0% { transform: translate(0, 0) rotate(-8deg); opacity: 0 } 10% { opacity: .5 } 50% { transform: translate(18px, -52vh) rotate(8deg) } 90% { opacity: .4 } 100% { transform: translate(-10px, -112vh) rotate(-6deg); opacity: 0 } }
.bp-speck { position: absolute; top: -12px; width: 7px; height: 10px; border-radius: 2px; opacity: 0; animation: bp-fall linear infinite; will-change: transform, opacity; }
.bp-speck.is-round { width: 8px; height: 8px; border-radius: 50%; }
@keyframes bp-fall { 0% { transform: translate(0, 0) rotate(var(--r)); opacity: 0 } 8% { opacity: .65 } 90% { opacity: .5 } 100% { transform: translate(16px, 105vh) rotate(calc(var(--r) + 540deg)); opacity: 0 } }
.bp-atmo.is-warm .bp-float { animation-duration: 7s !important; }
.bp-atmo.is-warm .bp-speck { animation-duration: 5s !important; }
@media (prefers-reduced-motion: reduce) { .bp-cloud { animation: none; } }
`;
