"use client";

// Small shared pieces: the gallery wall behind every room (pastel wallpaper,
// a picture rail, the wainscot, a soft spotlight with dust motes in it, falling
// petals in the finale), the room heading, the themed scroll panel, and the
// time-together maths.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { HaPaletteDef } from "../../../_valentine/days/happy-anniversary";
import { HA_CAPS, HA_DISPLAY, HA_HAND } from "./fonts";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export interface Together {
  ok: boolean;
  years: number;
  months: number;
  days: number;
  hours: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  /** "14 February 2023" */
  since: string;
  startYear: number;
}

/** Years / months / days / hours since a yyyy-mm-dd date (ok=false when empty, invalid or in the future). */
export function together(iso: string, now = new Date()): Together {
  const none: Together = { ok: false, years: 0, months: 0, days: 0, hours: 0, totalDays: 0, totalHours: 0, totalMinutes: 0, since: "", startYear: now.getFullYear() };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return none;
  const y = +m[1];
  const mo = +m[2] - 1;
  const d = +m[3];
  const start = new Date(y, mo, d);
  if (Number.isNaN(start.getTime()) || start.getMonth() !== mo) return none;
  const ms = now.getTime() - start.getTime();
  if (ms < 0 || ms > 100 * 365.25 * 86400000) return none;
  let years = now.getFullYear() - y;
  let months = now.getMonth() - mo;
  let days = now.getDate() - d;
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalMinutes = Math.floor(ms / 60000);
  return {
    ok: true,
    years,
    months,
    days,
    hours: now.getHours(),
    totalDays: Math.floor(ms / 86400000),
    totalHours: Math.floor(ms / 3600000),
    totalMinutes,
    since: start.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    startYear: y,
  };
}

export function ordinal(n: number): string {
  const v = n % 100;
  const s = v >= 11 && v <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${s}`;
}

/** "3rd Anniversary" / "8-Month Anniversary" / "Anniversary". */
export function anniversaryLabel(t: Together): string {
  if (!t.ok) return "Anniversary";
  if (t.years >= 1) return `${ordinal(t.years)} Anniversary`;
  if (t.months >= 1) return `${t.months}-Month Anniversary`;
  return "Anniversary";
}

/** 1,204 · 14.6 million · 1.2 billion */
export function big(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(/\.0$/, "")} billion`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")} million`;
  return Math.round(n).toLocaleString("en-IN");
}

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: HaPaletteDef): CSSProperties {
  return {
    ["--ha-blush" as string]: p.blush,
    ["--ha-deep" as string]: p.deep,
    ["--ha-wall-a" as string]: p.wall[0],
    ["--ha-wall-b" as string]: p.wall[1],
    ["--ha-wains" as string]: p.wainscot,
    ["--ha-gilt-a" as string]: p.gilt[0],
    ["--ha-gilt-b" as string]: p.gilt[1],
  };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="ha-head">
      {kicker && <p className="ha-kick">{kicker}</p>}
      <h2 className="ha-title">{title}</h2>
      {sub && <p className="ha-sub">{sub}</p>}
    </header>
  );
}

const MOTES = 10;

/** The museum wall behind every room. */
export function Wall({ petals, chars }: { petals: boolean; chars: readonly string[] }) {
  const reduced = useReducedMotion();
  const motes = useMemo(
    () => Array.from({ length: MOTES }, (_, k) => ({ left: 38 + ((k * 37) % 24), top: 18 + ((k * 23) % 52), delay: -((k * 1.7) % 9), dur: 8 + (k % 4) * 2.5, size: 2 + (k % 3) })),
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
    <div className="ha-wall" aria-hidden>
      <span className="ha-wall-paper" />
      <span className="ha-rail" />
      <span className="ha-spot" />
      {!reduced && (
        <span className="ha-motes">
          {motes.map((m, k) => (
            <i key={k} style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, animationDelay: `${m.delay}s`, animationDuration: `${m.dur}s` }} />
          ))}
        </span>
      )}
      <span className="ha-wains" />
      {petals && !reduced && (
        <span className="ha-petals">
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

/**
 * A scroll panel with a palette-coloured rail that is always visible while
 * there is more to read (phones hide native bars; iOS never styles them).
 */
export function HaScroll({ children, className = "", label, follow = false }: { children: ReactNode; className?: string; label?: string; follow?: boolean }) {
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
    const ro = new ResizeObserver(() => {
      // While text is being written in, keep the newest line in view.
      if (follow) el.scrollTop = el.scrollHeight;
      measure();
    });
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [measure, follow]);
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
    <div className={`ha-scroll${fade} ${className}`}>
      <div ref={ref} className="ha-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="ha-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="ha-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="ha-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && !follow && (
        <span className="ha-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

export const HA_UI_CSS = `
.ha-wall { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.ha-wall-paper { position: absolute; inset: 0; background:
  radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ha-deep) 9%, transparent) 0 1.4px, transparent 1.8px) 0 0 / 46px 46px,
  repeating-linear-gradient(90deg, transparent 0 44px, color-mix(in srgb, var(--ha-deep) 4.5%, transparent) 44px 46px),
  linear-gradient(180deg, var(--ha-wall-a), var(--ha-wall-b)); }
.ha-rail { position: absolute; left: 0; right: 0; top: clamp(44px, 7.5vh, 64px); height: 7px; background: linear-gradient(180deg, #FFFFFF, var(--ha-gilt-a) 40%, var(--ha-gilt-b)); opacity: .75; box-shadow: 0 3px 6px -2px color-mix(in srgb, var(--ha-deep) 25%, transparent); }
.ha-spot { position: absolute; left: 50%; top: 0; width: min(120vw, 1100px); height: 92vh; translate: -50% 0; opacity: .7;
  background: radial-gradient(60% 70% at 50% 0%, rgba(255,255,255,.95), rgba(255,255,255,.35) 45%, rgba(255,255,255,0) 72%);
  clip-path: polygon(40% 0, 60% 0, 96% 100%, 4% 100%); filter: blur(2px); }
.ha-motes i { position: absolute; border-radius: 50%; background: color-mix(in srgb, var(--ha-gilt-a) 70%, #FFFFFF); box-shadow: 0 0 6px 1px rgba(255,255,255,.8); opacity: 0; animation: ha-mote linear infinite; }
@keyframes ha-mote { 0% { transform: translate(0, 0); opacity: 0 } 15% { opacity: .9 } 50% { transform: translate(18px, -26px) } 85% { opacity: .7 } 100% { transform: translate(-8px, -54px); opacity: 0 } }
.ha-wains { position: absolute; left: 0; right: 0; bottom: 0; height: clamp(64px, 13vh, 130px);
  background:
    repeating-linear-gradient(90deg, transparent 0 14px, color-mix(in srgb, #FFFFFF 60%, transparent) 14px 16px, transparent 16px 150px, color-mix(in srgb, var(--ha-deep) 12%, transparent) 150px 152px, transparent 152px 166px),
    var(--ha-wains);
  box-shadow: inset 0 5px 0 #FFFFFF, inset 0 9px 0 color-mix(in srgb, var(--ha-gilt-a) 85%, #FFFFFF), inset 0 -10px 0 color-mix(in srgb, var(--ha-deep) 10%, transparent); }
.ha-wains::before { content: ""; position: absolute; left: 0; right: 0; top: 22%; bottom: 22%; border-top: 2px solid color-mix(in srgb, #FFFFFF 60%, transparent); border-bottom: 2px solid color-mix(in srgb, var(--ha-deep) 12%, transparent); }
.ha-petals i { position: absolute; top: -40px; font-style: normal; line-height: 1; opacity: 0; animation: ha-petal linear infinite; will-change: transform, opacity; }
@keyframes ha-petal { 0% { transform: translate(0, 0) rotate(0); opacity: 0 } 8% { opacity: .85 } 50% { transform: translate(5vw, 55vh) rotate(160deg) } 92% { opacity: .7 } 100% { transform: translate(-3vw, 112vh) rotate(320deg); opacity: 0 } }
@media (prefers-reduced-motion: reduce) { .ha-wall * { animation: none !important; } }

.ha-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.ha-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none;
  --ha-ft: 0px; --ha-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--ha-ft), #000 calc(100% - var(--ha-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--ha-ft), #000 calc(100% - var(--ha-fe)), transparent 100%); }
.ha-scroll-view::-webkit-scrollbar { display: none; }
.ha-scroll.fade-top .ha-scroll-view { --ha-ft: 22px; }
.ha-scroll.fade-end .ha-scroll-view { --ha-fe: 30px; }
.ha-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 10px; }
.ha-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 16%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 22%, transparent); }
.ha-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.ha-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--ha-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--ha-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.ha-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent); color: #FFFFFF; font: 700 12px ${FONTS.ui}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--ha-deep) 70%, transparent); animation: ha-hint-bob 1.3s ease-in-out infinite; }
@keyframes ha-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
[data-ha-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-ha-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-ha-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-ha-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .ha-scroll-hint { animation: none; } .ha-scroll-thumb { transition: none; } }

.ha-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 80%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; touch-action: manipulation; }
.ha-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.ha-linkbtn { border: 0; background: none; padding: 10px 6px; min-height: 44px; font: 700 13.5px ${FONTS.ui}; color: var(--vw-accent-deep); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; touch-action: manipulation; }
.ha-linkbtn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 8px; }
.ha-stk { display: inline-grid; place-items: center; padding: 5px; border-radius: 18px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--ha-gilt-a), 0 0 0 4px color-mix(in srgb, var(--ha-gilt-b) 60%, transparent), 0 12px 24px -12px color-mix(in srgb, var(--ha-deep) 60%, transparent); }
.ha-stk img { border-radius: 14px; display: block; }

/* A gilt picture frame and a museum plaque — used all over the museum. */
.ha-frame { position: relative; box-sizing: border-box; padding: clamp(9px, 2.6cqmin, 18px); border-radius: 5px;
  background: linear-gradient(135deg, var(--ha-gilt-a) 0%, #FFF7DF 16%, var(--ha-gilt-b) 38%, var(--ha-gilt-a) 58%, #FFF3D0 78%, var(--ha-gilt-b) 100%);
  box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.7), inset 0 0 0 4px color-mix(in srgb, var(--ha-gilt-b) 55%, transparent), 0 24px 40px -20px color-mix(in srgb, var(--ha-deep) 60%, transparent), 0 4px 10px -4px rgba(70,40,10,.32); }
.ha-frame-in { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--vw-paper); box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--ha-gilt-b) 45%, #FFFFFF), inset 0 4px 10px rgba(40,20,0,.22); }
.ha-plaque { position: relative; box-sizing: border-box; padding: 9px 16px 8px; border-radius: 4px; text-align: center; color: #3B2A1B;
  background: linear-gradient(170deg, #FFFDF6, color-mix(in srgb, var(--ha-gilt-a) 38%, #FFFDF6)); box-shadow: 0 0 0 1.5px var(--ha-gilt-b), 0 8px 16px -10px color-mix(in srgb, var(--ha-deep) 60%, transparent); }
.ha-plaque::before, .ha-plaque::after { content: ""; position: absolute; top: 50%; width: 5px; height: 5px; margin-top: -2.5px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #FFF6D8, var(--ha-gilt-b)); }
.ha-plaque::before { left: 6px; } .ha-plaque::after { right: 6px; }
.ha-pl-t { margin: 0; font: 700 clamp(17px, 2.5dvh, 21px)/1.15 ${HA_DISPLAY}; overflow-wrap: anywhere; }
.ha-pl-m { margin: 2px 0 0; font: 700 10.5px/1.3 ${HA_CAPS}; letter-spacing: .12em; text-transform: uppercase; color: #6E5530; overflow-wrap: anywhere; }
.ha-pl-c { margin: 4px 0 0; font: 600 italic clamp(15px, 2.2dvh, 17.5px)/1.3 ${HA_DISPLAY}; color: #4A3826; overflow-wrap: anywhere; }
.ha-hand { font-family: ${HA_HAND}; font-weight: 600; }
.ha-say { margin: 0; padding: 10px 16px; border-radius: 16px; background: color-mix(in srgb, var(--vw-paper) 92%, transparent); box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 24px -16px color-mix(in srgb, var(--ha-deep) 55%, transparent);
  font: 600 clamp(19px, 2.8dvh, 24px)/1.25 ${HA_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
`;
