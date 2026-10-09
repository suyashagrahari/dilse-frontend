"use client";

// Shared pieces of the manor: the chapter eyebrow, the gilt frame (CSS
// material, no drawn objects), the quiet text button and the page CSS.

import type { CSSProperties, ReactNode } from "react";
import { BODY, DISPLAY } from "./fonts";
import { GILT, NM } from "./model";

export function Eyebrow({ n, children, style }: { n?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <p className="nm-eyebrow" style={style}>
      {n && <span className="nm-eyebrowN">{n}</span>}
      {children}
    </p>
  );
}

export function Gilt({
  children, lit = true, lamp = false, plaque, className, style, torch,
}: { children: ReactNode; lit?: boolean; lamp?: boolean; plaque?: string; className?: string; style?: CSSProperties; torch?: number }) {
  return (
    <div className={`nm-gilt${lit ? " is-lit" : ""}${className ? ` ${className}` : ""}`} style={style} data-torch={torch}>
      {lamp && <span className="nm-lamp" aria-hidden />}
      <div className="nm-giltIn">{children}</div>
      {plaque && <span className="nm-plaque">{plaque}</span>}
    </div>
  );
}

export function Quiet({ children, onClick, style }: { children: ReactNode; onClick: () => void; style?: CSSProperties }) {
  return (
    <button type="button" className="nm-quiet" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export const UI_CSS = `
.nm-root { --vw-font-ui: ${BODY}; --font-vw-ui: var(--font-nm-body), Spectral; --vw-font-serif: ${DISPLAY}; font-family: ${BODY}; color: ${NM.bone}; }
.nm-stage { position: fixed; inset: 0; z-index: 2; }
.nm-scene { position: absolute; inset: 0; overflow: hidden; display: flex; flex-direction: column; align-items: center;
  padding: calc(var(--vw-top-space, 0px) + 66px) 22px calc(max(22px, env(safe-area-inset-bottom)) + var(--vw-dock-space, 0px)); box-sizing: border-box; }
@media (min-width: 600px) and (max-width: 1099px) {
  /* The music chip sits bottom-right here and is wide enough to reach a centred CTA. */
  .nm-scene { padding-bottom: calc(max(22px, env(safe-area-inset-bottom)) + var(--vw-dock-space, 0px) + 76px); }
}
.nm-scroll { overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
.nm-eyebrow { margin: 0; font: 400 13px/1.2 ${DISPLAY}; letter-spacing: .26em; text-transform: uppercase; color: ${NM.candle};
  display: inline-flex; align-items: center; gap: 12px; text-shadow: 0 1px 14px rgba(0,0,0,.6); }
.nm-eyebrowN { display: inline-grid; place-items: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 99px;
  border: 1px solid rgba(232,207,138,.45); font-size: 11px; letter-spacing: .08em; color: ${NM.gold}; }
.nm-h { margin: 0; font: 400 clamp(34px, 9.6vw, 60px)/1 ${DISPLAY}; letter-spacing: -.005em; color: ${NM.bone}; text-align: center;
  text-wrap: balance; text-shadow: 0 2px 30px rgba(0,0,0,.6); }
.nm-sub { margin: 0; max-width: 30ch; font: italic 300 19px/1.45 ${BODY}; color: rgba(232,223,204,.82); text-align: center; text-wrap: balance; }
.nm-foot { margin-top: auto; display: grid; justify-items: center; gap: 10px; width: 100%; padding-top: 14px; }
.nm-quiet { all: unset; cursor: pointer; min-height: 44px; padding: 0 14px; display: inline-flex; align-items: center; gap: 8px;
  font: italic 400 15px/1 ${BODY}; color: rgba(232,223,204,.72); text-decoration: underline; text-decoration-color: rgba(232,223,204,.3);
  text-underline-offset: 4px; -webkit-tap-highlight-color: transparent; }
.nm-quiet:focus-visible { outline: 2px solid ${NM.candle}; outline-offset: 2px; border-radius: 6px; }

/* Gilt frame: foil + bevel + a dark inner liner. The picture light comes on when found. */
.nm-gilt { position: relative; padding: 9px; border-radius: 2px; background: ${GILT}; background-size: 220% 220%; background-position: 30% 0;
  box-shadow: inset 0 0 0 1px rgba(255,244,207,.55), inset 0 0 0 4px rgba(84,56,18,.55), inset 0 0 0 5px rgba(255,236,190,.35),
  0 30px 50px -22px rgba(0,0,0,.95), 0 4px 12px rgba(0,0,0,.55); transition: filter 1.2s cubic-bezier(.22,1,.36,1); filter: brightness(.55) saturate(.7); }
.nm-gilt.is-lit { filter: none; animation: nm-sheen 9s ease-in-out infinite alternate; }
.nm-giltIn { position: relative; width: 100%; height: 100%; padding: 3px; box-sizing: border-box; background: #160a0e; box-shadow: inset 0 2px 10px rgba(0,0,0,.95); overflow: hidden; }
.nm-giltIn > * { width: 100%; height: 100%; }
.nm-lamp { position: absolute; z-index: 2; left: 50%; top: -15px; width: 44%; height: 7px; transform: translateX(-50%); border-radius: 6px;
  background: linear-gradient(180deg, #f6e2a6, #8a6a2f); box-shadow: 0 2px 4px rgba(0,0,0,.6); }
.nm-lamp::after { content: ""; position: absolute; left: -30%; right: -30%; top: 6px; height: 120px; pointer-events: none; opacity: 0;
  background: linear-gradient(180deg, rgba(255,226,168,.55), rgba(255,226,168,0)); clip-path: polygon(30% 0, 70% 0, 100% 100%, 0 100%);
  mix-blend-mode: screen; transition: opacity .9s ease .1s; }
.nm-gilt.is-lit .nm-lamp::after { opacity: .9; }
.nm-plaque { position: absolute; left: 50%; top: calc(100% + 10px); transform: translateX(-50%); white-space: nowrap; max-width: 150%;
  overflow: hidden; text-overflow: ellipsis; padding: 4px 10px; border-radius: 2px; font: 400 11px/1.2 ${DISPLAY}; letter-spacing: .14em;
  text-transform: uppercase; color: #2a1a06; background: linear-gradient(180deg, #f1d58e, #b98c3c); box-shadow: 0 2px 6px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.5);
  opacity: 0; transition: opacity .8s ease .5s; }
.nm-gilt.is-lit .nm-plaque { opacity: 1; }
@keyframes nm-sheen { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }
@keyframes nm-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.nm-fadeIn { animation: nm-in 1s cubic-bezier(.22,1,.36,1) backwards; }
@media (prefers-reduced-motion: reduce) {
  .nm-gilt.is-lit { animation: none; }
  .nm-fadeIn { animation: nm-fade .3s ease backwards; }
}
@keyframes nm-fade { from { opacity: 0; } to { opacity: 1; } }
`;
