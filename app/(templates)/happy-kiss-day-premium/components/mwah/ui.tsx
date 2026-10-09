"use client";

// Shared pieces for the booth's scenes: the scene shell (a full-height
// column that keeps the editor's top-right corner clear), the kicker, the
// bubbly title, the puffy candy button, die-cut GIF stickers, washi tape and
// sparkle doodles (research §C3–C5).

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { DISPLAY, HAND, UI } from "./fonts";

export function Scene({ children, label, className, style }: { children: ReactNode; label: string; className?: string; style?: CSSProperties }) {
  return (
    <section className={`km-scene${className ? ` ${className}` : ""}`} aria-label={label} style={style}>
      {children}
    </section>
  );
}

export const Kicker = ({ children }: { children: ReactNode }) => <p className="km-kick">{children}</p>;

export function Title({ children, size, style }: { children: ReactNode; size?: string; style?: CSSProperties }) {
  return (
    <h2 className="km-title" style={{ ...(size ? { fontSize: size } : null), ...style }}>
      <Sparkle className="km-titleSpark is-l" />
      {children}
      <Sparkle className="km-titleSpark is-r" />
    </h2>
  );
}

export const Sub = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <p className="km-sub" style={style}>
    {children}
  </p>
);

/** The puffy candy pill (research §C3): a darker lip underneath, sinks on press. */
export function Puffy({ children, onClick, tone = "pink", disabled, style, className, ariaLabel }: { children: ReactNode; onClick?: () => void; tone?: "pink" | "white"; disabled?: boolean; style?: CSSProperties; className?: string; ariaLabel?: string }) {
  return (
    <motion.button
      type="button"
      className={`km-puffy is-${tone}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={style}
    >
      {children}
    </motion.button>
  );
}

export const Quiet = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <button type="button" className="km-quiet" onClick={onClick}>
    {children}
  </button>
);

/** A GIF sticker on a white die-cut bubble: sized box (no layout jump), lazy, tilted. */
export function Gif({ src, size = 96, tilt = 0, eager, className, style, float = true }: { src: string; size?: number; tilt?: number; eager?: boolean; className?: string; style?: CSSProperties; float?: boolean }) {
  if (!src) return null;
  return (
    <span className={`km-gif${float ? " is-float" : ""}${className ? ` ${className}` : ""}`} style={{ width: size, height: size, ["--tilt" as string]: `${tilt}deg`, ...style }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
    </span>
  );
}

export const Washi = ({ style, tone = "pink" }: { style?: CSSProperties; tone?: "pink" | "mint" | "yellow" }) => <span className={`km-washi is-${tone}`} style={style} aria-hidden />;

export function Sparkle({ className, style, color = "currentColor" }: { className?: string; style?: CSSProperties; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1 Z" fill={color} />
    </svg>
  );
}

/** A puffy heart (used for stickers, the meter and the canvas keepsake). 100×90 box. */
export const HEART_PATH = "M50 86 C20 66 4 48 4 28 C4 13 16 3 29 3 C39 3 46 9 50 17 C54 9 61 3 71 3 C84 3 96 13 96 28 C96 48 80 66 50 86 Z";
export function PuffyHeart({ size = 40, color = "#FF4F86", style, className }: { size?: number; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 100 90" width={size} height={size * 0.9} className={className} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <path d={HEART_PATH} fill={color} stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M24 22 C28 14 36 13 40 16" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".75" />
    </svg>
  );
}

/** Fades in + springs up children with a stagger (research §C5 scene transition). */
export const rise = (i = 0) => ({
  initial: { opacity: 0, y: 18, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring" as const, stiffness: 260, damping: 22, delay: 0.06 * i },
});
export const popIn = (i = 0) => ({
  initial: { opacity: 0, scale: 0.4, rotate: -10 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  transition: { type: "spring" as const, stiffness: 500, damping: 15, mass: 0.8, delay: 0.06 * i },
});

export const UI_CSS = `
.km-root { --km-bg: #FFF5F8; --km-bg2: #FFE3EC; --km-soft: #FFD1DF; --km-primary: #FF4F86; --km-deep: #D63F72; --km-ink: #5B2333; --km-ink2: #8A4A5E; --km-pop: #FFE27A; --km-mint: #9FE5C8;
  --km-display: ${DISPLAY}; --km-hand: ${HAND}; --km-ui: ${UI}; --km-spring: cubic-bezier(.34,1.56,.64,1); --km-ease: cubic-bezier(.22,1,.36,1); color: var(--km-ink); }
.km-scene { position: relative; min-height: 100svh; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px;
  padding: calc(max(var(--vw-top-space, 0px), 8px) + 58px) 18px calc(28px + env(safe-area-inset-bottom, 0px)); width: 100%; overflow-x: clip; }
.km-kick { margin: 0; font: 600 12px/1.3 var(--km-ui); letter-spacing: .22em; text-transform: uppercase; color: var(--km-deep); display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px; border-radius: 99px; background: rgba(255,255,255,.75); box-shadow: 0 4px 14px -6px rgba(214,63,114,.35); }
.km-title { position: relative; margin: 0; font: 400 clamp(34px, 10vw, 52px)/1.02 var(--km-display); color: var(--km-deep); letter-spacing: .005em; text-wrap: balance; max-width: 15ch;
  text-shadow: 0 3px 0 #fff, 0 6px 18px rgba(214,63,114,.18); }
.km-title em { font-style: normal; color: var(--km-primary); }
.km-titleSpark { position: absolute; width: 18px; height: 18px; color: var(--km-pop); filter: drop-shadow(0 1px 0 #e9b93a); animation: km-twinkle 2.4s ease-in-out infinite; }
.km-titleSpark.is-l { left: -22px; top: -6px; } .km-titleSpark.is-r { right: -20px; bottom: 2px; width: 13px; height: 13px; animation-delay: -1.1s; color: var(--km-primary); filter: none; }
.km-sub { margin: 0; font: 500 16px/1.45 var(--km-ui); color: var(--km-ink2); max-width: 30ch; text-wrap: pretty; }
.km-hand { font-family: var(--km-hand); }
.km-puffy { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 54px; padding: 0 28px; border-radius: 999px;
  font: 600 17px/1 var(--km-ui); letter-spacing: .01em; -webkit-tap-highlight-color: transparent; transition: box-shadow .15s, transform .15s, opacity .2s; }
.km-puffy.is-pink { color: #fff; background: linear-gradient(180deg, #FF7AA5 0%, var(--km-primary) 55%, #F23E78 100%);
  box-shadow: 0 5px 0 var(--km-deep), 0 12px 26px -8px rgba(214,63,114,.55), inset 0 2px 0 rgba(255,255,255,.45); text-shadow: 0 1px 0 rgba(160,30,80,.35); }
.km-puffy.is-pink:active { box-shadow: 0 2px 0 var(--km-deep), 0 6px 14px -6px rgba(214,63,114,.5), inset 0 2px 0 rgba(255,255,255,.4); transform: translateY(3px); }
.km-puffy.is-white { color: var(--km-deep); background: #fff; border: 2px solid var(--km-soft); box-shadow: 0 4px 0 var(--km-soft), 0 10px 22px -10px rgba(214,63,114,.4); }
.km-puffy:disabled { opacity: .5; cursor: default; }
.km-puffy:focus-visible, .km-quiet:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 4px; }
.km-quiet { all: unset; cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; gap: 6px; padding: 0 14px; border-radius: 99px; font: 600 14px/1 var(--km-ui); color: var(--km-ink2);
  text-decoration: underline; text-decoration-color: var(--km-soft); text-decoration-thickness: 2px; text-underline-offset: 4px; -webkit-tap-highlight-color: transparent; }
.km-gif { position: relative; display: inline-grid; place-items: center; flex: none; border-radius: 30%; background: #fff; box-sizing: border-box; padding: 6%;
  box-shadow: 0 0 0 4px #fff, 0 10px 24px -10px rgba(214,63,114,.45); transform: rotate(var(--tilt, 0deg)); }
.km-gif img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; user-select: none; }
.km-gif.is-float { animation: km-float 3.6s ease-in-out infinite; }
.km-washi { position: absolute; width: 74px; height: 22px; z-index: 3; opacity: .88; pointer-events: none;
  -webkit-mask: linear-gradient(90deg, transparent 0 3px, #000 3px calc(100% - 3px), transparent calc(100% - 3px)), radial-gradient(circle at 0 50%, transparent 3px, #000 3.5px);
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.55) 0 6px, transparent 6px 12px); }
.km-washi.is-pink { background-color: #FF9EBB; } .km-washi.is-mint { background-color: #9FE5C8; } .km-washi.is-yellow { background-color: #FFE27A; }
.km-polaroid { position: relative; background: #fff; padding: 12px 12px 0; border-radius: 6px; box-shadow: 0 2px 0 #f3d6df, 0 22px 40px -18px rgba(214,63,114,.55); }
.km-polCap { margin: 0; padding: 10px 6px 14px; font: 600 17px/1.2 var(--km-hand); color: var(--km-ink); max-width: 24ch; margin-inline: auto; }
.km-kpEmpty { display: grid; place-items: center; width: 100%; height: 100%; font: 400 96px/1 var(--km-display); color: var(--km-soft); }
.km-kpPrint { position: absolute; width: 84px; margin: -25px 0 0 -42px; pointer-events: none; transform: rotate(var(--r)); animation: km-stampIn .42s var(--km-spring) both; }
.km-kpPrint svg { filter: drop-shadow(0 2px 2px rgba(0,0,0,.12)); }
@keyframes km-stampIn { from { transform: rotate(var(--r)) scale(1.9); opacity: 0; } to { transform: rotate(var(--r)) scale(1); opacity: .94; } }
.km-foot { margin-top: auto; padding-top: 18px; display: grid; justify-items: center; gap: 6px; width: 100%; }
@keyframes km-float { 0%, 100% { transform: translateY(0) rotate(var(--tilt, 0deg)); } 50% { transform: translateY(-6px) rotate(calc(var(--tilt, 0deg) + 3deg)); } }
@keyframes km-twinkle { 0%, 100% { transform: scale(.7) rotate(0); opacity: .6; } 50% { transform: scale(1.15) rotate(20deg); opacity: 1; } }
@keyframes km-beat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.12); } 30% { transform: scale(1); } 45% { transform: scale(1.08); } }
@keyframes km-wiggle { 0%, 70%, 100% { transform: rotate(0); } 76% { transform: rotate(-6deg); } 82% { transform: rotate(6deg); } 88% { transform: rotate(-4deg); } 94% { transform: rotate(4deg); } }
@media (prefers-reduced-motion: reduce) { .km-gif.is-float, .km-titleSpark { animation: none; } }
`;
