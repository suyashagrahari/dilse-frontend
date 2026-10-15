"use client";

// Small shared pieces: the scene heading, the drifting background (soft bokeh,
// a few petals), the themed scroll panel, and the date maths (time together,
// the anniversary number).

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import type { AnniPaletteDef } from "../../../_valentine/days/anniversary-premium";
import { AP_HAND, AP_SANS, AP_SERIF } from "./fonts";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: AnniPaletteDef): CSSProperties {
  return {
    ["--ap-blush" as string]: p.blush,
    ["--ap-deep" as string]: p.deep,
    ["--ap-foil" as string]: p.foil,
    ["--ap-rose" as string]: p.rose,
    ["--ap-sky1" as string]: p.sky[0],
    ["--ap-sky2" as string]: p.sky[1],
    ["--ap-sky3" as string]: p.sky[2],
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="ap-head">
      {kicker && <p className="ap-kick">{kicker}</p>}
      <h2 className="ap-title">{title}</h2>
      <span className="ap-rule" aria-hidden />
      {sub && <p className="ap-sub">{sub}</p>}
    </header>
  );
}

// ─── Dates ───────────────────────────────────────────────────────────────────

/** "YYYY-MM-DD" → a local Date at midnight, or null. */
export function parseDay(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isFinite(d.getTime()) && d.getMonth() === Number(m[2]) - 1 ? d : null;
}

export function prettyDay(d: Date | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }): string {
  return d ? d.toLocaleDateString("en-IN", opts) : "";
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export interface Together {
  start: Date;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  hours: number;
  /** The anniversary this page celebrates (the nearest one, at least 1). */
  nth: number;
}

/** Calendar difference from `start` to now (years, months, days) plus totals. */
export function togetherSince(start: Date | null, now = new Date()): Together | null {
  if (!start || start.getTime() > now.getTime()) return null;
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const ms = now.getTime() - start.getTime();
  const totalDays = Math.floor(ms / 86400000);
  const hours = Math.floor(ms / 3600000);
  const nth = Math.max(1, Math.round(totalDays / 365.25));
  return { start, years, months, days, totalDays, hours, nth };
}

export const fmt = (n: number) => n.toLocaleString("en-IN");

/** 152,000,000 → "15.2 crore"-free, readable: "152 million". */
export function bigWords(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(/\.0$/, "")} billion`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")} million`;
  return fmt(n);
}

// ─── Atmosphere ──────────────────────────────────────────────────────────────

/** Soft out-of-focus bokeh and a few drifting petals/hearts. Warms (more of them) after yes. */
export function Atmosphere({ hearts, warm }: { hearts: readonly string[]; warm: boolean }) {
  const reduced = useReducedMotion();
  const bokeh = useMemo(
    () =>
      Array.from({ length: 9 }, (_, k) => ({
        left: (k * 37 + 11) % 100,
        top: (k * 53 + 7) % 92,
        size: 70 + ((k * 41) % 110),
        dur: 16 + (k % 4) * 5,
        delay: -((k * 2.3) % 12),
      })),
    [],
  );
  const bits = useMemo(
    () =>
      Array.from({ length: 12 }, (_, k) => ({
        left: (k * 61 + 13) % 100,
        delay: -((k * 1.9) % 16),
        dur: 14 + (k % 5) * 2.6,
        size: 13 + ((k * 7) % 12),
        petal: k % 2 === 0,
        char: hearts[k % hearts.length],
      })),
    [hearts],
  );
  return (
    <div className={`ap-atmo${warm ? " is-warm" : ""}`} aria-hidden>
      <span className="ap-glow ap-glow-a" />
      <span className="ap-glow ap-glow-b" />
      {bokeh.map((b, k) => (
        <span key={`b${k}`} className="ap-bokeh" style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
      ))}
      {!reduced &&
        bits.map((b, k) =>
          b.petal ? (
            <span key={k} className="ap-float ap-petal" style={{ left: `${b.left}%`, width: b.size * 0.8, height: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }} />
          ) : (
            <span key={k} className="ap-float" style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
              {b.char}
            </span>
          ),
        )}
    </div>
  );
}

/**
 * A scroll panel with its own scrollbar: phones hide native bars until you
 * touch them (and iOS never paints a styled one). This draws a palette rail
 * that is always visible while there is more to read, fades the clipped
 * edges, and nudges "scroll" until she does.
 */
export function ApScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
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
    <div className={`ap-scroll${fade} ${className}`}>
      <div ref={ref} className="ap-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="ap-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="ap-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="ap-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="ap-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

/** A small "do this" hint chip with a pulsing hand. */
export function Hint({ children, hand = "👆" }: { children: ReactNode; hand?: string }) {
  return (
    <p className="ap-hint">
      <span aria-hidden>{hand}</span> {children}
    </p>
  );
}

export const AP_UI_CSS = `
.ap-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.ap-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none;
  --ap-ft: 0px; --ap-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--ap-ft), #000 calc(100% - var(--ap-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--ap-ft), #000 calc(100% - var(--ap-fe)), transparent 100%); }
.ap-scroll-view::-webkit-scrollbar { display: none; }
.ap-scroll.fade-top .ap-scroll-view { --ap-ft: 22px; }
.ap-scroll.fade-end .ap-scroll-view { --ap-fe: 34px; }
.ap-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.ap-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 7px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--ap-foil) 22%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ap-foil) 30%, transparent); }
.ap-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.ap-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--ap-foil), var(--vw-accent-deep)); box-shadow: inset 0 1px 0 rgba(255,255,255,.55); }
.ap-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent); color: #FFFFFF; font: 700 12px ${AP_SANS}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--ap-deep) 70%, transparent); animation: ap-hint-bob 1.3s ease-in-out infinite; }
@keyframes ap-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
/* Every other scroll box in the template wears the palette, not the site's maroon bar. */
[data-ap-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-ap-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-ap-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-ap-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .ap-scroll-hint { animation: none; } .ap-scroll-thumb { transition: none; } }

.ap-hint { margin: 0; display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 99px; font: 600 clamp(13px, 1.9dvh, 15px)/1.2 ${AP_SANS}; color: var(--vw-accent-deep);
  background: color-mix(in srgb, var(--vw-paper) 80%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ap-foil) 55%, transparent); }
.ap-hint > span { display: inline-block; animation: ap-tap 1.4s ease-in-out infinite; }
@keyframes ap-tap { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-3px) scale(1.08) } }
.ap-ghost { min-height: 44px; padding: 0 18px; border: 1.5px solid color-mix(in srgb, var(--ap-foil) 70%, var(--vw-edge)); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 74%, transparent); color: var(--vw-ink); font: 600 15px ${AP_SANS}; cursor: pointer; touch-action: manipulation; }
.ap-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.ap-hand { font-family: ${AP_HAND}; }
/* Round ‹ › arrows (time machine, book): shared, so the book never shows them unstyled. */
.ap-tm-arrow { width: 44px; height: 44px; border-radius: 50%; border: 0; cursor: pointer; font: 600 26px/1 ${AP_SERIF}; color: var(--vw-accent-deep); background: var(--vw-paper); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 60%, transparent), 0 6px 12px -8px var(--ap-deep); touch-action: manipulation; }
.ap-tm-arrow:disabled { opacity: .35; cursor: default; }
.ap-tm-arrow:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.ap-stk { display: inline-grid; place-items: center; padding: 6px; border-radius: 22px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 70%, transparent), 0 14px 26px -14px color-mix(in srgb, var(--ap-deep) 60%, transparent); }
.ap-stk img { border-radius: 16px; display: block; }

.ap-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.ap-glow { position: absolute; border-radius: 50%; filter: blur(40px); opacity: .7; }
.ap-glow-a { width: 70vmax; height: 70vmax; left: -25vmax; top: -30vmax; background: radial-gradient(circle, #FFFFFF, transparent 65%); }
.ap-glow-b { width: 60vmax; height: 60vmax; right: -25vmax; bottom: -30vmax; background: radial-gradient(circle, color-mix(in srgb, var(--ap-rose) 30%, transparent), transparent 65%); }
.ap-bokeh { position: absolute; border-radius: 50%; transform: translate(-50%, -50%);
  background: radial-gradient(circle at 50% 50%, color-mix(in srgb, #FFFFFF 70%, transparent) 0%, color-mix(in srgb, var(--ap-foil) 26%, transparent) 55%, transparent 72%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, #FFFFFF 50%, transparent); opacity: .5; animation: ap-breathe ease-in-out infinite alternate; }
@keyframes ap-breathe { from { transform: translate(-50%, -50%) scale(.9); opacity: .32 } to { transform: translate(-50%, -54%) scale(1.08); opacity: .6 } }
.ap-float { position: absolute; bottom: -40px; line-height: 1; opacity: 0; animation: ap-rise linear infinite; will-change: transform, opacity; }
.ap-petal { border-radius: 80% 0 80% 0; background: linear-gradient(135deg, #FFFFFF, var(--ap-rose)); box-shadow: inset 0 0 0 1px rgba(255,255,255,.5); }
@keyframes ap-rise { 0% { transform: translate(0, 0) rotate(-20deg); opacity: 0 } 10% { opacity: .55 } 50% { transform: translate(24px, -52vh) rotate(120deg) } 90% { opacity: .4 } 100% { transform: translate(-12px, -110vh) rotate(260deg); opacity: 0 } }
.ap-atmo.is-warm .ap-float { animation-duration: 7s !important; }
@media (prefers-reduced-motion: reduce) { .ap-bokeh, .ap-hint > span { animation: none; } }
`;
