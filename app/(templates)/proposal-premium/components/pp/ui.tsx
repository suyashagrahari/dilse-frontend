"use client";

// Small shared pieces: the scene heading, the golden-hour garden behind every
// scene (sky haze, a low sun, three rolling hills and a flower border that
// drift apart with the pointer / the phone's tilt), the themed scroll panel
// and text helpers.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import type { ProposalPaletteDef } from "../../../_valentine/days/proposal-premium";

export const clean = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Whole days from a YYYY-MM-DD date to today (null when empty, invalid or in the future). */
export function daysSince(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (!Number.isFinite(t)) return null;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const d = Math.round((today - t) / 86400000);
  return d >= 0 && d < 36500 ? d : null;
}

/** "14 February 2024" from a YYYY-MM-DD date ("" when it doesn't parse). */
export function prettyDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
}

/** "R & A" style initials for the engravings. */
export const initial = (name: string): string => (Array.from(name.trim())[0] ?? "♡").toUpperCase();

/** The palette's extra paints as CSS variables (the theme's own come from DayRoot). */
export function paletteVars(p: ProposalPaletteDef): CSSProperties {
  return {
    ["--pp-blush" as string]: p.blush,
    ["--pp-deep" as string]: p.deep,
    ["--pp-leaf" as string]: p.leaf,
    ["--pp-sun" as string]: p.sun,
    ["--pp-hill-a" as string]: p.hills[0],
    ["--pp-hill-b" as string]: p.hills[1],
    ["--pp-hill-c" as string]: p.hills[2],
  };
}

/** The longest word in a name, as a CSS variable: name lines shrink to fit "Anastasia-Marie" without breaking mid-word. */
export function nameFit(name: string): CSSProperties {
  const w = Math.max(5, ...name.split(/[\s\-\u2013]+/).map((p) => Array.from(p).length));
  return { ["--nw" as string]: w };
}

export function Head({ kicker, title, sub }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="pp-head">
      {kicker && <p className="pp-kick">{kicker}</p>}
      <h2 className="pp-title">{title}</h2>
      {sub && <p className="pp-sub">{sub}</p>}
    </header>
  );
}

/**
 * The garden behind every scene. The layers sit at different depths and drift
 * apart as the pointer moves (desktop) or the phone tilts, so the page feels
 * like a little diorama. `warm` brightens the sun and quickens the petals —
 * the string lights turn it on, and it stays on from then.
 */
export function Garden({ petals, warm }: { petals: readonly string[]; warm: boolean }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const set = (x: number, y: number) => {
      tx = Math.max(-1, Math.min(1, x));
      ty = Math.max(-1, Math.min(1, y));
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--px", tx.toFixed(3));
        el.style.setProperty("--py", ty.toFixed(3));
      });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      set(e.gamma / 30, (e.beta - 45) / 40);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const bits = useMemo(
    () =>
      Array.from({ length: 14 }, (_, k) => ({
        left: (k * 67 + 11) % 100,
        delay: -((k * 1.9) % 16),
        dur: 13 + (k % 5) * 2.6,
        size: 13 + ((k * 7) % 12),
        petal: k % 3 !== 0,
        char: petals[k % petals.length],
      })),
    [petals],
  );
  const flies = useMemo(() => Array.from({ length: 12 }, (_, k) => ({ left: (k * 37 + 5) % 96, top: 30 + ((k * 23) % 50), delay: -((k * 0.7) % 4), dur: 3 + (k % 4) })), []);

  return (
    <div ref={ref} className={`pp-garden${warm ? " is-warm" : ""}`} aria-hidden>
      <span className="pp-haze" />
      <span className="pp-layer pp-sun-l" style={{ ["--z" as string]: "6px" }}>
        <span className="pp-sun" />
      </span>
      <svg className="pp-layer pp-hill pp-hill-1" style={{ ["--z" as string]: "10px" }} viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d="M0 70 C60 30 120 40 180 62 C240 84 300 30 400 48 L400 120 L0 120 Z" fill="var(--pp-hill-a)" />
      </svg>
      <svg className="pp-layer pp-hill pp-hill-2" style={{ ["--z" as string]: "18px" }} viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d="M0 58 C70 86 140 40 210 52 C280 64 330 86 400 60 L400 120 L0 120 Z" fill="var(--pp-hill-b)" />
      </svg>
      <svg className="pp-layer pp-hill pp-hill-3" style={{ ["--z" as string]: "28px" }} viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d="M0 70 C80 44 150 74 230 66 C300 58 350 40 400 56 L400 120 L0 120 Z" fill="var(--pp-hill-c)" />
      </svg>
      <div className="pp-layer pp-border" style={{ ["--z" as string]: "40px" }}>
        {[0, 1, 2, 3, 4, 5, 6].map((t) => (
      <svg key={t} viewBox="0 0 400 60" preserveAspectRatio="xMidYMax meet">
        {Array.from({ length: 22 }, (_, k) => {
          const x = 6 + k * 18.4;
          const h = 22 + ((k * 13) % 18);
          return (
            <g key={k}>
              <path d={`M${x} 60 Q${x + (k % 2 ? 3 : -3)} ${60 - h / 2} ${x} ${60 - h}`} stroke="var(--pp-leaf)" strokeWidth="2.2" fill="none" />
              <ellipse cx={x + (k % 2 ? 4 : -4)} cy={60 - h / 2.2} rx="4" ry="2" fill="var(--pp-leaf)" transform={`rotate(${k % 2 ? -30 : 30} ${x} ${60 - h / 2.2})`} />
              {k % 3 === 0 ? (
                <path d={`M${x - 5} ${60 - h} Q${x - 5} ${52 - h} ${x - 2.5} ${55 - h} L${x} ${51 - h} L${x + 2.5} ${55 - h} Q${x + 5} ${52 - h} ${x + 5} ${60 - h} Q${x} ${65 - h} ${x - 5} ${60 - h} Z`} fill="var(--vw-accent)" opacity=".75" />
              ) : (
                <g opacity=".9">
                  {[0, 72, 144, 216, 288].map((a) => (
                    <circle key={a} cx={x} cy={60 - h - 3.2} r="2.6" fill={k % 3 === 1 ? "#FFFFFF" : "var(--vw-gold)"} transform={`rotate(${a} ${x} ${60 - h})`} />
                  ))}
                  <circle cx={x} cy={60 - h} r="1.9" fill="var(--pp-sun)" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
        ))}
      </div>
      {!reduced && (
        <>
          {flies.map((f, k) => (
            <span key={`f${k}`} className="pp-fly" style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }} />
          ))}
          {bits.map((b, k) =>
            b.petal ? (
              <span key={k} className="pp-drift pp-petal" style={{ left: `${b.left}%`, width: b.size * 0.7, height: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }} />
            ) : (
              <span key={k} className="pp-drift" style={{ left: `${b.left}%`, fontSize: b.size, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}>
                {b.char}
              </span>
            ),
          )}
        </>
      )}
    </div>
  );
}

/**
 * Fits a tall keepsake card into its scene: the card keeps its natural layout and is scaled down
 * (never up) until it fits the space it was given, so a short phone or an in-app browser never
 * clips the bottom rows or slides them under the Next pill. A no-op wherever the card already fits.
 */
export function FitBox({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  useEffect(() => {
    const b = box.current;
    const i = inner.current;
    if (!b || !i || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      const k = Math.min(1, b.clientHeight / Math.max(1, i.offsetHeight), b.clientWidth / Math.max(1, i.offsetWidth));
      setS(Math.max(0.5, Math.floor(k * 1000) / 1000));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="pp-fitbox">
      <div ref={inner} className="pp-fitbox-in" style={{ ["--pp-fit" as string]: s }}>
        {children}
      </div>
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
export function PpScroll({ children, className = "", label }: { children: ReactNode; className?: string; label?: string }) {
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
    const to = (y: number) => {
      const r = rail.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (y - r.top) / r.height - m.size / 2) / (1 - m.size));
      el.scrollTop = f * (el.scrollHeight - el.clientHeight);
    };
    to(e.clientY);
    const move = (ev: PointerEvent) => to(ev.clientY);
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
    <div className={`pp-scroll${fade} ${className}`}>
      <div ref={ref} className="pp-scroll-view" onScroll={measure} tabIndex={m.over ? 0 : -1} aria-label={label} role={label ? "region" : undefined}>
        <div className="pp-scroll-body">{children}</div>
      </div>
      {m.over && (
        <div className="pp-scroll-rail" onPointerDown={drag} aria-hidden>
          <span className="pp-scroll-thumb" style={{ top: `${m.top * 100}%`, height: `${m.size * 100}%` }} />
        </div>
      )}
      {m.over && !m.moved && !m.atEnd && (
        <span className="pp-scroll-hint" aria-hidden>
          scroll <b>↓</b>
        </span>
      )}
    </div>
  );
}

export const PP_UI_CSS = `
/* FitBox: fills its scene's flexible area; the card inside is centred and scaled down to fit. */
.pp-fitbox { position: relative; align-self: stretch; justify-self: stretch; width: 100%; height: 100%; min-height: 0; }
.pp-fitbox-in { position: absolute; left: 0; right: 0; top: 50%; display: grid; justify-items: center; transform: translateY(-50%) scale(var(--pp-fit, 1)); transform-origin: 50% 50%; }
.pp-scroll { position: relative; display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); min-height: 0; max-height: 100%; }
.pp-scroll-view { overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-right: 16px; outline: none;
  --pp-ft: 0px; --pp-fe: 0px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 var(--pp-ft), #000 calc(100% - var(--pp-fe)), transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0, #000 var(--pp-ft), #000 calc(100% - var(--pp-fe)), transparent 100%); }
.pp-scroll-view::-webkit-scrollbar { display: none; }
.pp-scroll.fade-top .pp-scroll-view { --pp-ft: 22px; }
.pp-scroll.fade-end .pp-scroll-view { --pp-fe: 34px; }
.pp-scroll-view:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; border-radius: 14px; }
.pp-scroll-rail { position: absolute; top: 6px; bottom: 6px; right: 0; width: 8px; border-radius: 99px; cursor: pointer; touch-action: none;
  background: color-mix(in srgb, var(--vw-accent) 16%, var(--vw-paper)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vw-accent) 22%, transparent); }
.pp-scroll-rail::before { content: ""; position: absolute; inset: -6px -8px; }
.pp-scroll-thumb { position: absolute; left: 0; right: 0; border-radius: 99px; min-height: 24px; transition: top .08s linear;
  background: linear-gradient(180deg, var(--vw-accent), var(--pp-deep)); box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--pp-deep) 60%, transparent), inset 0 1px 0 rgba(255,255,255,.55); }
.pp-scroll-hint { position: absolute; left: 50%; bottom: 4px; transform: translateX(-50%); pointer-events: none; padding: 4px 12px; border-radius: 99px;
  background: var(--vw-accent-deep); color: #FFFFFF; font: 700 12px ${FONTS.ui}; letter-spacing: .02em; box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--pp-deep) 70%, transparent); animation: pp-hint-bob 1.3s ease-in-out infinite; }
@keyframes pp-hint-bob { 0%, 100% { transform: translate(-50%, 0) } 50% { transform: translate(-50%, 4px) } }
[data-pp-scene] * { scrollbar-width: thin; scrollbar-color: var(--vw-accent) color-mix(in srgb, var(--vw-accent) 14%, transparent); }
[data-pp-scene] ::-webkit-scrollbar { width: 6px; height: 6px; }
[data-pp-scene] ::-webkit-scrollbar-track { background: color-mix(in srgb, var(--vw-accent) 14%, transparent); border-radius: 99px; }
[data-pp-scene] ::-webkit-scrollbar-thumb { background: var(--vw-accent); border-radius: 99px; }
@media (prefers-reduced-motion: reduce) { .pp-scroll-hint { animation: none; } .pp-scroll-thumb { transition: none; } }
.pp-ghost { min-height: 44px; padding: 0 18px; border: 2px solid var(--vw-edge); border-radius: 99px; background: color-mix(in srgb, var(--vw-paper) 75%, transparent); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; }
.pp-ghost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
/* A GIF in a scalloped little frame (the GIFs carry their own white ground). */
.pp-stk { display: inline-grid; place-items: center; padding: 6px; border-radius: 22px; background: #FFFFFF; transform: rotate(-4deg);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 0 0 6px color-mix(in srgb, #FFFFFF 70%, transparent), 0 14px 24px -12px color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-stk img { border-radius: 16px; display: block; }
/* The frame hugs the GIF, so a scene that shrinks the GIF on a small screen shrinks the whole sticker. */
.pp-stk > span { width: auto !important; height: auto !important; }

/* The garden. */
.pp-garden { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; --px: 0; --py: 0; }
.pp-haze { position: absolute; inset: 0; background: radial-gradient(90% 42% at 50% 74%, color-mix(in srgb, var(--pp-sun) 60%, transparent), transparent 72%); }
.pp-layer { position: absolute; left: -4%; width: 108%; transform: translate3d(calc(var(--px) * var(--z) * -1), calc(var(--py) * var(--z) * -.5), 0); transition: transform .5s cubic-bezier(.2,.7,.3,1); will-change: transform; }
.pp-sun-l { left: 0; width: 100%; top: 0; bottom: 0; }
.pp-sun { position: absolute; left: 50%; bottom: 17vh; width: 34vmin; height: 34vmin; margin-left: -17vmin; border-radius: 50%;
  background: radial-gradient(circle, #FFFFFF 0 18%, var(--pp-sun) 46%, color-mix(in srgb, var(--pp-sun) 0%, transparent) 70%); opacity: .85; animation: pp-sun-breathe 7s ease-in-out infinite alternate; transition: opacity 1.2s ease, transform 1.2s ease; }
.pp-garden.is-warm .pp-sun { opacity: 1; transform: scale(1.18); }
@keyframes pp-sun-breathe { from { filter: brightness(1) } to { filter: brightness(1.06) } }
.pp-hill { bottom: 0; height: 22vh; }
.pp-hill-1 { height: 28vh; opacity: .9; }
.pp-hill-2 { height: 22vh; }
.pp-hill-3 { height: 15vh; }
.pp-border { bottom: -2px; height: clamp(46px, 8vh, 64px); display: flex; justify-content: center; overflow: hidden; }
.pp-border svg { flex: none; height: 100%; width: auto; aspect-ratio: 400 / 60; }
@media (min-width: 900px) { .pp-hill-1 { height: 30vh; } .pp-hill-2 { height: 22vh; } .pp-hill-3 { height: 14vh; } }
.pp-fly { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 8px 3px color-mix(in srgb, var(--pp-sun) 90%, transparent); opacity: 0; animation: pp-fly ease-in-out infinite; }
@keyframes pp-fly { 0%, 100% { opacity: 0; transform: translate(0, 0) } 40% { opacity: .9 } 60% { opacity: .7; transform: translate(10px, -14px) } }
.pp-drift { position: absolute; top: -40px; line-height: 1; opacity: 0; animation: pp-drift linear infinite; will-change: transform, opacity; }
.pp-petal { border-radius: 80% 0 80% 0; background: linear-gradient(135deg, #FFFFFF, color-mix(in srgb, var(--vw-accent) 55%, #FFFFFF)); box-shadow: inset 0 0 0 1px rgba(255,255,255,.6); }
@keyframes pp-drift { 0% { transform: translate(0, 0) rotate(0deg); opacity: 0 } 8% { opacity: .7 } 50% { transform: translate(-30px, 52vh) rotate(160deg) } 92% { opacity: .55 } 100% { transform: translate(24px, 108vh) rotate(320deg); opacity: 0 } }
.pp-garden.is-warm .pp-drift { animation-duration: 8s !important; }
@media (prefers-reduced-motion: reduce) { .pp-sun { animation: none; } .pp-layer { transition: none; transform: none; } }
`;
