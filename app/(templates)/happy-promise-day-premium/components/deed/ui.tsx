"use client";

// Shared pieces for the deed's scenes: the scene shell (a full-height,
// self-scrolling stage that keeps the editor's top-right corner clear), the
// typed eyebrow, the CTA style, and the materials every scene reuses: ivory
// paper lit by the desk lamp, the heavy envelope, the letterhead.

import type { CSSProperties, ReactNode } from "react";
import { ART_CSS } from "./art";
import { SERIF, TYPE } from "./fonts";

export function Scene({ children, label, className, style }: { children: ReactNode; label: string; className?: string; style?: CSSProperties }) {
  return (
    <section className={`sp-scene${className ? ` ${className}` : ""}`} aria-label={label} style={style}>
      <div className="sp-in">{children}</div>
    </section>
  );
}
export const Eyebrow = ({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) => (
  <p className={`sp-eyebrow${className ? ` ${className}` : ""}`} style={style}>
    {children}
  </p>
);
/** PremiumCTA in the deed's own type: the typewriter, tracked caps. */
export const CTA_STYLE: CSSProperties = { fontFamily: TYPE, fontWeight: 700, fontSize: 13, letterSpacing: ".2em", textTransform: "uppercase", minHeight: 54, paddingInline: 30 };

/** The deed's letterhead: No. · DEED OF PROMISE · between the two of them. */
export function Letterhead({ sender, recipient, compact }: { sender: string; recipient: string; compact?: boolean }) {
  return (
    <header className={`sp-lh${compact ? " is-compact" : ""}`}>
      <p className="sp-lhNo">No. 0211 · ✦ · By hand</p>
      <h2 className="sp-lhTitle">Deed of Promise</h2>
      <div className="sp-rule" aria-hidden />
      {!compact && (
        <p className="sp-lhBetween">
          between <b>{sender}</b>, the Promisor, and <b>{recipient}</b>, the Promisee
        </p>
      )}
    </header>
  );
}

// Paper: two noises (fibre + mottling) over ivory, lit by the lamp from the top-left.
const FIBRE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .32 0 0 0 0 .22 0 0 0 0 .1 0 0 0 .11 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const MOTTLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .45 0 0 0 0 .32 0 0 0 0 .15 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E\")";
export const PAPER_BG = `radial-gradient(130% 90% at 18% 0%, rgba(255,251,240,.95) 0%, rgba(255,251,240,0) 55%), ${FIBRE}, ${MOTTLE}, linear-gradient(180deg, #F7F1E4 0%, #EFE6D2 100%)`;

export const UI_CSS = `
.sp-root { --sp-ivory: #F5EFE2; --sp-navy: #1C2541; --sp-ox: #6E1423; --sp-gold: #B8964B; --sp-graphite: #3A3A3A; --sp-notary: #A3283C;
  --sp-serif: ${SERIF}; --sp-type: ${TYPE}; --sp-ease: cubic-bezier(.22,1,.36,1);
  --font-vw-ui: ${TYPE}; }
.sp-root figcaption { font-family: var(--sp-serif) !important; }
/* fixed: the viewer's page can scroll (focus, scrollIntoView); the desk never moves with it. */
.sp-stage { position: fixed; inset: 0; z-index: 2; }
.sp-scene { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: none; }
.sp-scene::-webkit-scrollbar { display: none; }
.sp-in { position: relative; min-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: calc(max(var(--vw-top-space, 0px), 12px) + 60px) 20px calc(26px + env(safe-area-inset-bottom, 0px)); width: 100%; max-width: 1180px; margin: 0 auto; color: var(--sp-ivory); }
.sp-eyebrow { margin: 0; font: 700 11px/1.3 var(--sp-type); letter-spacing: .3em; text-transform: uppercase; color: rgba(245,239,226,.62); }
.sp-h { margin: 0; font: 400 clamp(36px, 10.4vw, 72px)/1 var(--sp-serif); letter-spacing: -.015em; color: var(--sp-ivory); text-wrap: balance; }
.sp-h em { font-style: italic; color: #E9D7A8; }
.sp-foot { margin-top: auto; padding-top: 24px; display: grid; justify-items: center; gap: 10px; }
.sp-quiet { all: unset; cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; padding: 0 14px; font: 700 11px/1 var(--sp-type); letter-spacing: .22em;
  text-transform: uppercase; color: rgba(245,239,226,.7); border-radius: 99px; -webkit-tap-highlight-color: transparent; }
.sp-quiet:hover { color: var(--sp-ivory); }
.sp-quiet:focus-visible { outline: 2px solid var(--sp-gold); outline-offset: 2px; }

/* Paper */
.sp-paper { position: relative; background: ${PAPER_BG}; color: var(--sp-navy); border-radius: 2px;
  box-shadow: 0 50px 90px -40px rgba(0,0,0,.95), 0 18px 34px -18px rgba(0,0,0,.7), inset 0 0 0 1px rgba(120,90,50,.12), inset 0 -40px 60px -50px rgba(110,80,40,.35); }
.sp-paper::after { content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  background: linear-gradient(105deg, rgba(0,0,0,0) 60%, rgba(60,35,15,.08) 100%); }
.sp-lh { display: grid; justify-items: center; gap: 6px; }
.sp-lhNo { margin: 0; font: 700 9.5px/1 var(--sp-type); letter-spacing: .32em; text-transform: uppercase; color: rgba(28,37,65,.55); }
.sp-lhTitle { margin: 0; font: 500 clamp(22px, 6.4vw, 30px)/1 var(--sp-serif); font-variant: small-caps; letter-spacing: .16em; color: var(--sp-navy);
  text-shadow: 0 1px 0 rgba(255,255,255,.6), 0 -1px 0 rgba(28,37,65,.12); }
.sp-lh.is-compact .sp-lhTitle { font-size: 18px; }
.sp-rule { width: 64%; height: 5px; border-top: 1px solid var(--sp-gold); border-bottom: 1px solid var(--sp-gold); opacity: .85; }
.sp-lhBetween { margin: 4px 0 0; font: italic 400 15px/1.4 var(--sp-serif); color: rgba(28,37,65,.78); max-width: 30ch; text-wrap: balance; }
.sp-lhBetween b { font-style: normal; font-weight: 600; color: var(--sp-navy); }
.sp-typed { font-family: var(--sp-type); color: var(--sp-navy); text-shadow: 0 0 .5px rgba(28,37,65,.55), .4px .2px 0 rgba(28,37,65,.18); }

/* The heavy envelope (back: flap + side folds) */
.sp-env { display: block; position: relative; width: 100%; aspect-ratio: 3 / 2; border-radius: 3px; background: ${PAPER_BG}; overflow: visible;
  box-shadow: 0 40px 70px -30px rgba(0,0,0,.95), 0 10px 22px -12px rgba(0,0,0,.7), inset 0 0 0 1px rgba(120,90,50,.16); }
.sp-env::before { content: ""; position: absolute; inset: 0; border-radius: 3px; pointer-events: none;
  background: linear-gradient(32deg, transparent 49.6%, rgba(110,80,40,.16) 50%, transparent 50.8%), linear-gradient(-32deg, transparent 49.6%, rgba(110,80,40,.16) 50%, transparent 50.8%),
    linear-gradient(0deg, rgba(110,80,40,.1), transparent 40%); }
.sp-envFlap { position: absolute; left: 0; right: 0; top: 0; height: 64%; clip-path: polygon(0 0, 100% 0, 50% 100%); background: ${PAPER_BG};
  filter: drop-shadow(0 6px 6px rgba(70,45,20,.35)); transform-origin: 50% 0; }
.sp-envFlap::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,.25), rgba(110,80,40,.12)); }
.sp-envSeal { position: absolute; left: 50%; top: 64%; transform: translate(-50%, -50%); width: 34%; aspect-ratio: 1; filter: drop-shadow(0 6px 8px rgba(40,10,10,.45)); }
.sp-envSeal > svg { width: 100%; height: 100%; display: block; }
.sp-envTag { position: absolute; left: 7%; bottom: 9%; font: 700 9px/1.4 var(--sp-type); letter-spacing: .26em; text-transform: uppercase; color: rgba(28,37,65,.6); text-align: left; }

.sp-caret { display: inline-block; width: .55em; height: 2px; margin-left: 1px; vertical-align: -2px; background: var(--sp-ox); animation: sp-blink 1s steps(2, jump-none) infinite; }
@keyframes sp-blink { 50% { opacity: 0; } }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes sp-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.sp-rise { animation: sp-up .9s var(--sp-ease) both; }
@keyframes sp-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .sp-rise { animation: sp-fade .3s ease both; } .sp-caret { animation: none; } }
${ART_CSS}
`;
