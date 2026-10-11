"use client";

// The Teddy House's little UI kit: puffy candy buttons, die-cut GIF stickers, the room header (paw-print progress
// + room sign + Grandstander title), cream cards and speech bubbles, the house backdrop (polka-dot wallpaper,
// bunting, a wooden floor and a round rug; night for bedtime, a pink glow for the YES), and the shared CSS.
// Research §C3 shapes, §C5 motion values.

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { ValentineDayData } from "../../../_valentine/types";
import { Paw } from "./art";
import { BODY, DISPLAY, HAND } from "./fonts";
import { SLOT_DEFAULT } from "./gifs";
import { TH } from "./model";

export const POP = { type: "spring", stiffness: 500, damping: 15, mass: 0.8 } as const;
export const JELLY = { type: "spring", stiffness: 300, damping: 10, mass: 0.8 } as const;
export const WOBBLY = { type: "spring", stiffness: 180, damping: 12, mass: 1 } as const;

// ── Buttons ──────────────────────────────────────────────────────────────────
type Tone = "pink" | "honey" | "cream" | "mint" | "sky";
const TONES: Record<Tone, { bg: string; lip: string; ink: string }> = {
  pink: { bg: "linear-gradient(180deg,#FF9DBA,#FF7FA3)", lip: TH.pinkDeep, ink: "#FFFFFF" },
  honey: { bg: "linear-gradient(180deg,#FFCB8A,#F2B36B)", lip: TH.honeyDeep, ink: "#4A2C1E" },
  cream: { bg: "linear-gradient(180deg,#FFFFFF,#FFF6E5)", lip: "#EBCFB0", ink: TH.ink },
  mint: { bg: "linear-gradient(180deg,#D3F5E5,#BDEBD6)", lip: TH.mintDeep, ink: "#1F4A38" },
  sky: { bg: "linear-gradient(180deg,#E2F1FF,#CFE8FF)", lip: "#8DB9E6", ink: "#23405E" },
};

export function Puffy({
  children, onClick, tone = "pink", small, disabled, style, className, ariaLabel, type = "button",
}: { children: ReactNode; onClick?: () => void; tone?: Tone; small?: boolean; disabled?: boolean; style?: CSSProperties; className?: string; ariaLabel?: string; type?: "button" | "submit" }) {
  const t = TONES[tone];
  return (
    <motion.button
      type={type}
      className={`th-puffy${small ? " is-small" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: 0.93, y: 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ background: t.bg, color: t.ink, ["--lip" as string]: t.lip, ...style }}
    >
      {children}
    </motion.button>
  );
}

export function TextLink({ children, onClick, style }: { children: ReactNode; onClick: () => void; style?: CSSProperties }) {
  return (
    <button type="button" className="th-link" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

// ── GIF stickers ─────────────────────────────────────────────────────────────
/** A die-cut GIF sticker: white outline, soft shadow, a little tilt, a fixed box (no layout jump). */
export function Gif({
  src, size = 96, tilt = 0, float = true, eager, className, style, alt = "",
}: { src: string | null; size?: number; tilt?: number; float?: boolean; eager?: boolean; className?: string; style?: CSSProperties; alt?: string }) {
  if (!src) return null;
  return (
    <span
      className={`th-gif${float ? " is-float" : ""}${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, animationDelay: `${(Math.abs(tilt) % 5) * -0.7}s`, ...style }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </span>
  );
}

/** A sender-swappable slot: their link, our default, or nothing ("none"). */
export function slotSrc(data: ValentineDayData, id: string): string | null {
  const v = (data.gifs?.[id] ?? "").trim();
  if (v === "none") return null;
  if (/^https:\/\//i.test(v)) return v;
  return SLOT_DEFAULT[id] ?? null;
}

// ── Room header ──────────────────────────────────────────────────────────────
export function Dots({ step, total }: { step: number; total: number }) {
  return (
    <div className="th-dots" aria-label={`Room ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`th-dot${i < step ? " is-done" : ""}${i === step - 1 ? " is-now" : ""}`}>
          <Paw size={i === step - 1 ? 16 : 12} color={i < step ? TH.pinkDeep : "#E9CDB6"} />
        </span>
      ))}
    </div>
  );
}

export function Header({ step, total, room, title, sub }: { step?: number; total?: number; room?: ReactNode; title: ReactNode; sub?: ReactNode }) {
  return (
    <header className="th-head">
      {step !== undefined && total !== undefined && <Dots step={step} total={total} />}
      {room && <p className="th-room">{room}</p>}
      <motion.h2 className="th-title" initial={{ scale: 0.6, rotate: -4, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ ...POP, delay: 0.1 }}>
        {title}
      </motion.h2>
      {sub && <p className="th-sub">{sub}</p>}
    </header>
  );
}

/** A cream note card that pops in. */
export function Note({ children, tilt = -1.5, className, style }: { children: ReactNode; tilt?: number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={`th-note${className ? ` ${className}` : ""}`}
      initial={{ scale: 0.5, rotate: tilt - 8, opacity: 0, y: 14 }}
      animate={{ scale: 1, rotate: tilt, opacity: 1, y: 0 }}
      transition={POP}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** His speech bubble (tail at the bottom, pointing at him). */
export function Bubble({ children, k, className, style }: { children: ReactNode; k?: string | number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      key={k}
      className={`th-bubble${className ? ` ${className}` : ""}`}
      initial={{ scale: 0.4, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: -10, transition: { duration: 0.18 } }}
      transition={POP}
      style={style}
      aria-live="polite"
    >
      {children}
    </motion.div>
  );
}

export function Hint({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p className="th-hint" style={style}>
      {children}
    </p>
  );
}

/** Shows children after `ms` (a "do it for me" fallback). */
export function Later({ ms, children }: { ms: number; children: ReactNode }) {
  const [on, setOn] = useState(ms <= 0);
  useEffect(() => {
    if (ms <= 0) return;
    const t = window.setTimeout(() => setOn(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return on ? <>{children}</> : null;
}

// ── The house backdrop ───────────────────────────────────────────────────────
// A fixed scatter (the R2 low-discrepancy sequence), so SSR and client agree.
const STARS = Array.from({ length: 18 }, (_, i) => ({
  x: Math.round(((0.5 + i * 0.7548777) % 1) * 94 + 3),
  y: Math.round(((0.5 + i * 0.5698403) % 1) * 56 + 4),
  s: 8 + ((i * 7) % 9),
  d: Number(((i * 0.37) % 3).toFixed(2)),
}));
const FLAGS = ["#FF9DBA", "#FFE27A", "#BDEBD6", "#CFE8FF", "#F2B36B", "#E3D4FF"];

export function Backdrop({ mode }: { mode: "day" | "night" | "peak" }) {
  return (
    <div className={`th-house is-${mode}`} aria-hidden>
      <span className="th-wall" />
      <span className="th-blob th-blob1" />
      <span className="th-blob th-blob2" />
      <svg className="th-bunting" viewBox="0 0 400 60" preserveAspectRatio="none">
        <path d="M0 8 Q100 34 200 12 Q300 -6 400 14" stroke="#E8C9A8" strokeWidth={2} fill="none" />
        {Array.from({ length: 13 }, (_, i) => {
          const x = 8 + i * 30.5;
          const y = 8 + Math.sin((i / 12) * Math.PI * 2.1 + 0.4) * 9 + 6;
          return <path key={i} d={`M${x} ${y} L${x + 22} ${y} L${x + 11} ${y + 22} Z`} fill={FLAGS[i % FLAGS.length]} stroke="#fff" strokeWidth={1.4} />;
        })}
      </svg>
      <span className="th-night" />
      {STARS.map((st, i) => (
        <svg key={i} className="th-star" viewBox="0 0 20 20" width={st.s} height={st.s} style={{ left: `${st.x}%`, top: `${st.y}%`, animationDelay: `${st.d}s` }}>
          <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z" fill={i % 3 === 0 ? "#FFD9E4" : "#FFF3C9"} />
        </svg>
      ))}
      <span className="th-floor" />
      <span className="th-rug" />
      <span className="th-peak" />
    </div>
  );
}

// ── CSS ──────────────────────────────────────────────────────────────────────
export const HOUSE_CSS = `
.th-root { position: relative; min-height: 100dvh; font-family: ${BODY}; color: ${TH.ink}; isolation: isolate; }
.th-root *, .th-root *::before, .th-root *::after { box-sizing: border-box; }
.th-stage { position: relative; z-index: 2; min-height: 100dvh; }

/* the house */
.th-house { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.th-wall { position: absolute; inset: 0; background:
  radial-gradient(circle at 12px 12px, rgba(255,143,171,.16) 3px, transparent 3.5px) 0 0 / 34px 34px,
  radial-gradient(circle at 29px 29px, rgba(242,179,107,.16) 3px, transparent 3.5px) 0 0 / 34px 34px,
  linear-gradient(170deg, ${TH.cream} 0%, #FFEFE6 52%, ${TH.blush} 100%); }
.th-blob { position: absolute; border-radius: 50%; }
.th-blob1 { width: 70vmax; height: 70vmax; left: -34vmax; top: -30vmax; background: radial-gradient(circle, rgba(255,217,228,.9) 0%, transparent 62%); }
.th-blob2 { width: 60vmax; height: 60vmax; right: -30vmax; top: 34vh; background: radial-gradient(circle, rgba(255,226,122,.35) 0%, transparent 62%); }
.th-bunting { position: absolute; left: 0; top: 0; width: 100%; height: 54px; opacity: .95; }
.th-floor { position: absolute; left: 0; right: 0; bottom: 0; height: 9vh; min-height: 56px;
  background: repeating-linear-gradient(90deg, #EBC9A4 0 74px, #E3BD96 74px 76px), #EBC9A4; box-shadow: 0 -6px 0 #F5DCC2 inset, 0 -3px 0 #fff; transition: filter 1.4s ease; }
.th-rug { position: absolute; left: 50%; bottom: 1.6vh; width: min(70vw, 460px); height: 4.6vh; min-height: 28px; translate: -50% 0; border-radius: 50%; opacity: .75;
  background: radial-gradient(ellipse, #FFE4EC 0 58%, #FFC6D6 59% 66%, #FFE4EC 67% 100%); transition: filter 1.4s ease; }
.th-night { position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s ease; background: linear-gradient(175deg, #3F3670 0%, #5B4B92 55%, #7F64A8 100%); }
.th-house.is-night .th-night { opacity: .92; }
.th-house.is-night .th-floor, .th-house.is-night .th-rug { filter: brightness(.55) saturate(.8); }
.th-star { position: absolute; opacity: 0; transition: opacity 1.4s ease; }
.th-house.is-night .th-star { opacity: 1; animation: th-twinkle 3s ease-in-out infinite; }
@keyframes th-twinkle { 0%,100% { transform: scale(.7); opacity: .45 } 50% { transform: scale(1.1); opacity: 1 } }
.th-peak { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease; background: radial-gradient(ellipse at 50% 42%, rgba(255,143,171,.55), rgba(255,217,228,.25) 45%, transparent 75%); }
.th-house.is-peak .th-peak { opacity: 1; }

/* room shell */
.th-scene { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; min-height: calc(100dvh / var(--th-z, 1)); width: 100%; zoom: var(--th-z, 1);
  padding: max(64px, calc(env(safe-area-inset-top, 0px) + 58px)) 18px calc(var(--vw-dock-space, 0px) + max(26px, env(safe-area-inset-bottom, 0px))); text-align: center; }
.th-head { display: grid; justify-items: center; gap: 6px; max-width: 30ch; position: relative; z-index: 3; }
.th-dots { display: flex; gap: 5px; align-items: center; padding: 5px 10px; border-radius: 99px; background: rgba(255,255,255,.75); box-shadow: 0 0 0 2px #fff inset, 0 4px 12px rgba(201,138,75,.18); margin-bottom: 2px; }
.th-dot { display: grid; place-items: center; width: 16px; height: 16px; transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
.th-dot.is-now { transform: scale(1.18) rotate(-12deg); }
.th-room { margin: 0; display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 10px; background: ${TH.card}; color: ${TH.honeyDeep};
  font: 800 12px/1.2 ${BODY}; letter-spacing: .14em; text-transform: uppercase; box-shadow: 0 0 0 2px #F5DCC2 inset, 0 3px 0 #EBCFB0; transform: rotate(-1.5deg); }
.th-title { margin: 0; font: 800 clamp(29px, 8.4vw, 42px)/1.04 ${DISPLAY}; color: ${TH.ink}; text-wrap: balance; letter-spacing: -.005em; text-shadow: 0 3px 0 #fff; }
.th-title em { font-style: normal; color: ${TH.pinkDeep}; }
.th-sub { margin: 0; font: 700 16px/1.4 ${BODY}; color: ${TH.inkSoft}; text-wrap: balance; }
.th-hand { font-family: ${HAND}; }

/* tall tablets and big desktops: the phone-sized room grows with the screen */
@media (min-width: 700px) { .th-scene { padding-bottom: calc(var(--vw-dock-space, 0px) + 84px); } }
@media (min-width: 700px) and (min-height: 940px) { .th-root { --th-z: 1.2; } }
@media (min-width: 1300px) and (min-height: 1000px) { .th-root { --th-z: 1.16; } }
@media (min-width: 1700px) and (min-height: 1050px) { .th-root { --th-z: 1.24; } }

/* puffy buttons (research §C3) */
.th-puffy { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 54px; padding: 0 28px; border-radius: 999px;
  font: 800 18px/1 ${BODY}; letter-spacing: .01em; box-shadow: 0 5px 0 var(--lip), 0 12px 24px rgba(201,138,75,.28); -webkit-tap-highlight-color: transparent; text-align: center; }
.th-puffy.is-small { min-height: 44px; padding: 0 18px; font-size: 15px; box-shadow: 0 4px 0 var(--lip), 0 8px 16px rgba(201,138,75,.24); }
.th-puffy:active { box-shadow: 0 2px 0 var(--lip), 0 6px 12px rgba(201,138,75,.24); }
.th-puffy:focus-visible { outline: 3px solid ${TH.pinkDeep}; outline-offset: 4px; }
.th-puffy[disabled] { opacity: .55; cursor: default; }
.th-link { all: unset; cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; padding: 0 10px; font: 800 14px/1 ${BODY}; color: ${TH.inkSoft}; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(138,98,72,.4); }
.th-link:focus-visible { outline: 2px solid ${TH.pinkDeep}; outline-offset: 2px; border-radius: 8px; }

/* die-cut GIF stickers */
:where(.th-gif) { position: relative; }
.th-gif { display: inline-grid; place-items: center; flex: none; transform: rotate(var(--tilt, 0deg)); pointer-events: none; }
.th-gif img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff) drop-shadow(0 5px 8px rgba(160,100,60,.28)); }
.th-gif.is-float { animation: th-float 3.6s ease-in-out infinite; }
@keyframes th-float { 0%,100% { transform: translateY(0) rotate(var(--tilt, 0deg)) } 50% { transform: translateY(-6px) rotate(calc(var(--tilt, 0deg) + 3deg)) } }

/* cards + bubbles */
.th-note { position: relative; background: ${TH.card}; color: ${TH.ink}; border-radius: 24px; padding: 14px 18px; box-shadow: 0 0 0 3px #fff inset, 0 0 0 5px #F5DCC2, 0 14px 28px rgba(201,138,75,.22);
  font: 700 17px/1.4 ${BODY}; max-width: 340px; text-wrap: pretty; }
.th-bubble { position: relative; background: #fff; color: ${TH.ink}; border-radius: 26px; padding: 14px 18px; box-shadow: 0 0 0 3px ${TH.pinkSoft}, 0 12px 26px rgba(224,96,126,.2);
  font: 400 21px/1.32 ${HAND}; max-width: 330px; text-wrap: pretty; text-align: left; }
.th-bubble::after { content: ""; position: absolute; bottom: -13px; left: 50%; margin-left: -12px; border: 13px solid transparent; border-bottom: 0; border-top-color: #fff; filter: drop-shadow(0 3px 0 ${TH.pinkSoft}); }
.th-hint { margin: 0; font: 800 14px/1.3 ${BODY}; color: ${TH.inkSoft}; animation: th-breath 2.4s ease-in-out infinite; }
@keyframes th-breath { 0%,100% { opacity: .6 } 50% { opacity: 1 } }
.th-foot { display: grid; justify-items: center; gap: 8px; margin-top: auto; padding-top: 8px; position: relative; z-index: 3; }
.th-tag { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 12px; background: #fff; color: ${TH.ink}; font: 400 22px/1 ${HAND};
  box-shadow: 0 0 0 2px #fff inset, 0 0 0 4px ${TH.pinkSoft}; outline: 2px dashed ${TH.pink}; outline-offset: -6px; }

/* the teddy's little lives */
.th-zzz { position: absolute; right: 2px; top: 6px; display: flex; gap: 2px; font: 800 20px/1 ${DISPLAY}; color: ${TH.honeyDeep}; }
.th-zzz i { font-style: normal; animation: th-zzz 2.2s ease-in-out infinite; opacity: 0; }
.th-zzz i:nth-child(2) { animation-delay: .5s; font-size: 24px; }
.th-zzz i:nth-child(3) { animation-delay: 1s; font-size: 30px; }
@keyframes th-zzz { 0% { transform: translate(0, 8px); opacity: 0 } 30% { opacity: 1 } 100% { transform: translate(8px, -22px); opacity: 0 } }
.th-blink { animation: th-blink 4.2s infinite; transform-box: fill-box; transform-origin: center; }
@keyframes th-blink { 0%, 92%, 100% { transform: scaleY(1) } 95% { transform: scaleY(.08) } }
.th-wave { animation: th-wave .9s ease-in-out infinite alternate; }
@keyframes th-wave { from { transform: rotate(-12deg) } to { transform: rotate(14deg) } }
.th-cheerL { animation: th-cheerL .5s ease-in-out infinite alternate; }
.th-cheerR { animation: th-cheerR .5s ease-in-out infinite alternate; }
@keyframes th-cheerL { from { transform: rotate(-8deg) } to { transform: rotate(10deg) } }
@keyframes th-cheerR { from { transform: rotate(8deg) } to { transform: rotate(-10deg) } }
.th-heartGlow { animation: th-glow 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes th-glow { 0%,100% { opacity: .55; transform: scale(.9) } 50% { opacity: 1; transform: scale(1.15) } }
.th-heartBeat { animation: th-beat 1.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes th-beat { 0%, 40%, 100% { transform: scale(1) } 15% { transform: scale(1.14) } 28% { transform: scale(1.06) } }
.th-breathe { animation: th-breathe 3.4s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes th-breathe { 0%,100% { transform: scale(1, 1) } 50% { transform: scale(1.015, .985) } }
.th-wiggle { animation: th-wiggle 2.8s ease-in-out infinite; }
@keyframes th-wiggle { 0%, 76%, 100% { transform: rotate(0) } 80% { transform: rotate(-7deg) } 85% { transform: rotate(7deg) } 90% { transform: rotate(-4deg) } 95% { transform: rotate(3deg) } }

@media (prefers-reduced-motion: reduce) {
  .th-star, .th-gif.is-float, .th-hint, .th-wiggle, .th-blink, .th-wave, .th-cheerL, .th-cheerR, .th-heartGlow, .th-heartBeat, .th-breathe, .th-zzz i { animation: none !important; }
  .th-zzz i { opacity: 1; }
}
`;
