"use client";

// Shared pieces for the hug's scenes: the scene shell (a full-height, self-scrolling stage that keeps the editor's
// top-right corner clear), the tracked eyebrow, and the CTA style in the page's own sans.

import type { CSSProperties, ReactNode } from "react";
import { SANS, SERIF } from "./fonts";

export function Scene({ children, label, className, style }: { children: ReactNode; label: string; className?: string; style?: CSSProperties }) {
  return (
    <section className={`hh-scene${className ? ` ${className}` : ""}`} aria-label={label} style={style}>
      <div className="hh-in">{children}</div>
    </section>
  );
}
export const Eyebrow = ({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
  <p className={`hh-eyebrow${className ? ` ${className}` : ""}`} style={style}>
    {children}
  </p>
);
/** PremiumCTA in the page's own sans: small tracked caps, generous height. */
export const CTA_STYLE: CSSProperties = { fontFamily: SANS, fontWeight: 700, fontSize: 12.5, letterSpacing: ".2em", textTransform: "uppercase", minHeight: 54, paddingInline: 30 };

export const UI_CSS = `
.hh-root { --hh-sand: #EADBC8; --hh-apricot: #F2A477; --hh-apricot-deep: #C9774A; --hh-cocoa: #4B3426; --hh-cloud: #FAF7F2; --hh-grey: #8C8279;
  --hh-night: #120C09; --hh-dusk: #1E1510;
  --hh-display: ${SERIF}; --hh-ui: ${SANS}; --hh-ease: cubic-bezier(.22,1,.36,1); --hh-ease-io: cubic-bezier(.65,0,.35,1); }
.hh-root figcaption { font-family: var(--hh-display) !important; font-style: italic; }
/* fixed: the viewer's page can scroll (focus, scrollIntoView); the stage never moves with it. */
.hh-stage { position: fixed; inset: 0; z-index: 2; }
.hh-scene { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: none; }
.hh-scene::-webkit-scrollbar { display: none; }
.hh-in { position: relative; min-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: calc(max(var(--vw-top-space, 0px), 12px) + 64px) 24px calc(28px + env(safe-area-inset-bottom, 0px)); width: 100%; max-width: 1180px; margin: 0 auto; color: var(--hh-cloud); }
.hh-eyebrow { margin: 0; font: 700 11px/1.3 var(--hh-ui); letter-spacing: .32em; text-transform: uppercase; color: rgba(250,247,242,.6); }
.hh-h { margin: 0; font: 400 clamp(44px, 13vw, 96px)/.95 var(--hh-display); letter-spacing: -.02em; color: var(--hh-cloud); text-wrap: balance; }
.hh-h em { font-style: italic; color: var(--hh-apricot); }
.hh-sub { margin: 0; font: 400 15px/1.5 var(--hh-ui); color: rgba(250,247,242,.72); max-width: 32ch; text-wrap: pretty; }
.hh-foot { margin-top: auto; padding-top: 22px; display: grid; justify-items: center; gap: 10px; }
.hh-quiet { all: unset; cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 0 14px; font: 700 11px/1 var(--hh-ui); letter-spacing: .22em;
  text-transform: uppercase; color: rgba(250,247,242,.66); border-radius: 99px; -webkit-tap-highlight-color: transparent; }
.hh-quiet:hover { color: var(--hh-cloud); }
.hh-quiet:focus-visible { outline: 2px solid var(--hh-apricot); outline-offset: 2px; }
/* The warm, in-colour half of the page (after the hug): sand paper, cocoa ink. */
.hh-light .hh-in { color: var(--hh-cocoa); }
.hh-light .hh-eyebrow { color: rgba(75,52,38,.62); }
.hh-light .hh-h { color: var(--hh-cocoa); }
.hh-light .hh-h em { color: var(--hh-apricot-deep); }
.hh-light .hh-sub { color: rgba(75,52,38,.75); }
.hh-light .hh-quiet { color: rgba(75,52,38,.7); }
.hh-light .hh-quiet:hover { color: var(--hh-cocoa); }
@keyframes hh-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes hh-fade { from { opacity: 0; } to { opacity: 1; } }
.hh-rise { animation: hh-up 1s var(--hh-ease) both; }
@media (prefers-reduced-motion: reduce) { .hh-rise { animation: hh-fade .3s ease both; } }
`;
