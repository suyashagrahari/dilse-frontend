"use client";

// Shared pieces for the booth's scenes: the scene shell (a full-height,
// self-scrolling stage that keeps the editor's top-right corner clear), the
// tracked mono eyebrow, the display headline, and the chrome "slot" the
// strip and the receipt come out of.

import type { CSSProperties, ReactNode } from "react";
import { DISPLAY, MONO } from "./fonts";

export function Scene({ children, label, className, style }: { children: ReactNode; label: string; className?: string; style?: CSSProperties }) {
  return (
    <section className={`pb-scene${className ? ` ${className}` : ""}`} aria-label={label} style={style}>
      <div className="pb-in">{children}</div>
    </section>
  );
}
export const Eyebrow = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <p className="pb-eyebrow" style={style}>
    {children}
  </p>
);
/** PremiumCTA in the booth's own type: the machine's mono, tracked caps. */
export const CTA_STYLE: CSSProperties = { fontFamily: MONO, fontWeight: 700, fontSize: 12.5, letterSpacing: ".22em", textTransform: "uppercase", minHeight: 54, paddingInline: 30 };
export const Slot = ({ style }: { style?: CSSProperties }) => <div className="pb-slot" style={style} aria-hidden />;

export const UI_CSS = `
.pb-root { --pb-lacquer: #C1121F; --pb-cream: #F4EDE1; --pb-chrome: #C9CED6; --pb-black: #111111; --pb-lip: #E5677D;
  --pb-display: ${DISPLAY}; --pb-mono: ${MONO}; --pb-ease: cubic-bezier(.22,1,.36,1); }
/* fixed: the viewer's page can scroll (focus, scrollIntoView); the booth never moves with it. */
.pb-stage { position: fixed; inset: 0; z-index: 2; }
.pb-scene { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: none; }
.pb-scene::-webkit-scrollbar { display: none; }
.pb-in { position: relative; min-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: calc(max(var(--vw-top-space, 0px), 12px) + 58px) 24px calc(28px + env(safe-area-inset-bottom, 0px)); width: 100%; max-width: 1180px; margin: 0 auto; color: var(--pb-cream); }
.pb-eyebrow { margin: 0; font: 700 11px/1.3 var(--pb-mono); letter-spacing: .32em; text-transform: uppercase; color: rgba(244,237,225,.62); }
.pb-h { margin: 0; font: 400 clamp(38px, 11vw, 76px)/.98 var(--pb-display); letter-spacing: -.02em; color: var(--pb-cream); text-wrap: balance; }
.pb-h em { font-style: normal; color: var(--pb-shade-hi); }
.pb-sub { margin: 0; font: 400 13px/1.55 var(--pb-mono); letter-spacing: .04em; color: rgba(244,237,225,.7); max-width: 34ch; text-wrap: pretty; }
.pb-foot { margin-top: auto; padding-top: 22px; display: grid; justify-items: center; gap: 12px; }
.pb-slot { width: min(320px, 78vw); height: 14px; border-radius: 8px; position: relative; z-index: 3;
  background: linear-gradient(180deg, #3a3d42, #e7ebf0 22%, #9aa0a8 48%, #f4f6f9 70%, #6b7078);
  box-shadow: 0 6px 14px -4px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.8); }
.pb-slot::after { content: ""; position: absolute; left: 7%; right: 7%; top: 5px; height: 4px; border-radius: 3px; background: #050304; box-shadow: inset 0 2px 3px rgba(0,0,0,.9); }
.pb-quiet { all: unset; cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; padding: 0 14px; font: 700 11px/1 var(--pb-mono); letter-spacing: .24em;
  text-transform: uppercase; color: rgba(244,237,225,.7); border-radius: 99px; -webkit-tap-highlight-color: transparent; }
.pb-quiet:hover { color: var(--pb-cream); }
.pb-quiet:focus-visible { outline: 2px solid var(--pb-shade-hi); outline-offset: 2px; }
@keyframes pb-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.pb-rise { animation: pb-up .9s var(--pb-ease) both; }
@media (prefers-reduced-motion: reduce) { .pb-rise { animation: pb-fade .3s ease both; } }
@keyframes pb-fade { from { opacity: 0; } to { opacity: 1; } }
`;
