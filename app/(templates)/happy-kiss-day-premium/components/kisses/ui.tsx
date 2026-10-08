"use client";

// Shared building blocks for the kiss rooms: the scene shell, the satin
// button, the quiet button, the italic room title and the soft hint.

import type { CSSProperties, ReactNode } from "react";
import { SERIF } from "./fonts";

export function Room({ children, className, label, top = 112 }: { children: ReactNode; className?: string; label: string; top?: number }) {
  return (
    <section className={`kd-room${className ? ` ${className}` : ""}`} aria-label={label} style={{ paddingTop: top }}>
      {children}
    </section>
  );
}
export const Kicker = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <p className="kd-kicker" style={style}>{children}</p>;
export const Title = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <h2 className="kd-title" style={style}>{children}</h2>;
export function Satin({ children, onClick, disabled, style, big }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties; big?: boolean }) {
  return (
    <button type="button" className={`kd-btn${big ? " is-big" : ""}`} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}
export function Quiet({ children, onClick, style }: { children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return (
    <button type="button" className="kd-quiet" onClick={onClick} style={style}>
      {children}
    </button>
  );
}
export const Hint = ({ children }: { children: ReactNode }) => <p className="kd-hint" aria-live="polite">{children}</p>;

export const UI_CSS = `
.kd-room { position: relative; z-index: 2; min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 14px; padding: 112px 16px 36px; text-align: center; width: 100%; max-width: calc(560px * var(--vw-s, 1)); margin: 0 auto; }
.kd-kicker { margin: 0; font: 700 11.5px/1.3 var(--vw-font-ui, system-ui), sans-serif; letter-spacing: .28em; text-transform: uppercase; color: var(--vw-accent); }
.kd-title { margin: 0; font: italic 600 clamp(30px, 8.4vw, 44px)/1.05 ${SERIF}; color: var(--vw-ink); text-wrap: balance; letter-spacing: -.01em; }
.kd-btn { min-height: 52px; padding: 0 28px; border-radius: 99px; border: 0; cursor: pointer; touch-action: manipulation; color: #FFF6EE;
  font: 700 16px/1 var(--vw-font-ui, system-ui), sans-serif; background: linear-gradient(135deg, #E2456B, #B3122E 55%, #6E0A1C);
  box-shadow: 0 14px 30px -12px rgba(122,15,46,.65), inset 0 1px 0 rgba(255,255,255,.35); }
.kd-btn.is-big { min-height: 58px; padding: 0 34px; font-size: 17px; }
.kd-btn:disabled { opacity: .45; cursor: default; }
.kd-btn:focus-visible, .kd-quiet:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 3px; }
.kd-quiet { min-height: 44px; padding: 0 18px; border-radius: 99px; cursor: pointer; touch-action: manipulation; border: 1px solid rgba(122,15,46,.25);
  background: rgba(255,255,255,.6); color: var(--vw-ink); font: 600 13.5px/1 var(--vw-font-ui, system-ui), sans-serif; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.kd-hint { margin: 0; font: italic 400 16px/1.4 ${SERIF}; color: var(--vw-ink-soft); animation: kd-hint 2.6s ease-in-out infinite; }
@keyframes kd-hint { 0%, 100% { opacity: .65; } 50% { opacity: 1; } }
@keyframes kd-in { from { opacity: 0; transform: translateY(10px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@media (prefers-reduced-motion: reduce) { .kd-hint { animation: none; } }
`;
