"use client";

// Small building blocks the manor's rooms share: the scene shell, the gilded
// button, the quiet button, the room heading and the pulsing hint.

import type { CSSProperties, ReactNode } from "react";
import { BOOK, ENGRAVED } from "./fonts";

export function Room({ children, className, label, top = 112 }: { children: ReactNode; className?: string; label: string; top?: number }) {
  return (
    <section className={`mm-room${className ? ` ${className}` : ""}`} aria-label={label} style={{ paddingTop: top }}>
      {children}
    </section>
  );
}

export function Kicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p className="mm-kicker" style={style}>
      {children}
    </p>
  );
}

export function RoomTitle({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2 className="mm-title" style={style}>
      {children}
    </h2>
  );
}

export function Gilded({ children, onClick, disabled, style, ariaLabel, big }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties; ariaLabel?: string; big?: boolean }) {
  return (
    <button type="button" className={`mm-btn${big ? " is-big" : ""}`} onClick={onClick} disabled={disabled} aria-label={ariaLabel} style={style}>
      {children}
    </button>
  );
}

export function Quiet({ children, onClick, style, ariaLabel }: { children: ReactNode; onClick?: () => void; style?: CSSProperties; ariaLabel?: string }) {
  return (
    <button type="button" className="mm-quiet" onClick={onClick} style={style} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mm-hint" aria-live="polite">
      {children}
    </p>
  );
}

export const UI_CSS = `
.mm-room { position: relative; z-index: 2; min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  padding: 112px 16px 36px; text-align: center; width: 100%; max-width: calc(560px * var(--vw-s, 1)); margin: 0 auto; }
.mm-kicker { margin: 0; font: 600 11.5px/1.3 ${ENGRAVED}; letter-spacing: .26em; text-transform: uppercase; color: var(--vw-gold); opacity: .92; }
.mm-title { margin: 0; font: 700 clamp(26px, 7.4vw, 38px)/1.08 ${ENGRAVED}; letter-spacing: .02em; color: var(--vw-ink); text-wrap: balance;
  text-shadow: 0 2px 22px rgba(255,200,107,.22); }
.mm-btn { position: relative; min-height: 52px; padding: 0 26px; border-radius: 99px; border: 0; cursor: pointer; touch-action: manipulation;
  color: #2b1a03; font: 700 16px/1 var(--vw-font-ui, system-ui), sans-serif; letter-spacing: .01em;
  background: linear-gradient(135deg, #fff1bf, #e9b95a 45%, #9a6a1f); box-shadow: 0 12px 30px -12px rgba(233,185,90,.7), inset 0 1px 0 rgba(255,255,255,.7); }
.mm-btn.is-big { min-height: 58px; padding: 0 32px; font-size: 17px; }
.mm-btn:disabled { opacity: .45; cursor: default; }
.mm-btn:focus-visible, .mm-quiet:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 3px; }
.mm-quiet { min-height: 44px; padding: 0 16px; border-radius: 99px; cursor: pointer; touch-action: manipulation;
  border: 1px solid rgba(220,227,242,.28); background: rgba(11,10,20,.42); color: var(--vw-ink); font: 600 13.5px/1 var(--vw-font-ui, system-ui), sans-serif;
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mm-hint { margin: 0; font: italic 400 16px/1.4 ${BOOK}; color: var(--vw-ink-soft); animation: mm-hintPulse 2.6s ease-in-out infinite; }
@keyframes mm-hintPulse { 0%, 100% { opacity: .65; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .mm-hint { animation: none; } }
`;
