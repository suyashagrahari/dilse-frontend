// ─── Animated Shaadi Card: the guest page's stylesheet ──────────────────────
// Light only: ivory, haldi yellow, marigold, rani pink and leaf green over the
// wedding kit's --wk-* tokens (the theme sets them). Every animation is
// transform/opacity; everything is still under prefers-reduced-motion. Every
// photo frame and card is a rounded rectangle with four equal corners.
// Mobile first: 360 → 390 → 430 → 768 → 1024 → 1440 → 1920.

import { ART } from "../assets";

export const SC_CSS = `
.sc-root { --sc-r: clamp(16px, calc(12px + .6vw), 22px); --sc-r-sm: 14px; --sc-ease: cubic-bezier(.22,.7,.2,1);
  --sc-shadow: 0 24px 50px -30px rgba(120, 60, 10, .45), 0 2px 10px -6px rgba(120, 60, 10, .18);
  overflow-x: clip; color: var(--wk-ink); font-family: var(--wk-font-sans); background: var(--wk-bg); }
.sc-root img { -webkit-user-drag: none; user-select: none; }
.sc-root section[id] { scroll-margin-top: 72px; }

/* ── Shared bits ──────────────────────────────────────────────────────── */
.sc-eyebrow { margin: 0; font: 600 12.5px/1.4 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-accent); }
.sc-root .is-hi .sc-eyebrow, .sc-eyebrow:lang(hi) { letter-spacing: .04em; font-family: var(--wk-font-deva); font-size: 14px; text-transform: none; }
.sc-h2 { margin: 6px 0 0; font: 400 clamp(36px, 9.4vw, 56px)/1.12 var(--wk-font-script); color: var(--wk-ink); text-wrap: balance; }
.sc-h2:lang(hi) { font: 600 clamp(26px, 7vw, 38px)/1.3 var(--wk-font-deva); }
.sc-h3 { margin: 0; font: 600 21px/1.3 var(--wk-font-display); color: var(--wk-ink); }
.sc-h3:lang(hi) { font-family: var(--wk-font-deva); }
.sc-muted { margin: 6px 0 0; font-size: 15px; line-height: 1.55; color: var(--wk-muted); }
.sc-sub { margin: -6px auto 22px; max-width: 46ch; text-align: center; font-size: 15.5px; line-height: 1.6; color: var(--wk-muted); }
.sc-label { display: block; margin: 0 0 6px; font: 600 13px/1.3 var(--wk-font-sans); letter-spacing: .02em; color: var(--wk-muted); }
.sc-card { position: relative; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); border-radius: var(--sc-r); box-shadow: var(--sc-shadow); }
.sc-pill { -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px; padding: 0 16px; border-radius: 999px;
  border: 1px solid var(--wk-border); background: var(--wk-surface-solid); color: var(--wk-ink); font: 600 14px/1.1 var(--wk-font-sans); text-decoration: none; cursor: pointer;
  transition: transform .2s var(--sc-ease), background-color .2s, border-color .2s; white-space: nowrap; }
.sc-pill:hover { border-color: var(--wk-gold); background: var(--wk-surface-2); }
.sc-pill:active { transform: scale(.97); }
.sc-pill:disabled, .sc-pill.is-off { opacity: .62; cursor: default; }
.sc-pill svg { flex: none; color: var(--wk-accent); }
.sc-pill-solid { background: var(--wk-accent); border-color: transparent; color: var(--wk-accent-ink); box-shadow: 0 12px 24px -14px var(--wk-accent); }
.sc-pill-solid:hover { background: var(--wk-accent); filter: brightness(1.06); }
.sc-pill-solid svg { color: currentColor; }
.sc-pill-wa svg { color: #128c4b; }
.sc-pill-g { font-weight: 700; }
.sc-pill-live { border-color: #e11d48; color: #be123c; }
.sc-pill-live svg { color: #e11d48; }
.sc-pill.is-rec { border-color: #e11d48; color: #be123c; background: #fff1f2; }
.sc-btn { -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 52px; padding: 0 24px; border-radius: 999px; border: 0;
  background: linear-gradient(135deg, var(--wk-accent), color-mix(in srgb, var(--wk-accent) 72%, #f29d12)); color: var(--wk-accent-ink); font: 700 15.5px/1.1 var(--wk-font-sans); letter-spacing: .01em;
  text-decoration: none; cursor: pointer; box-shadow: 0 16px 30px -16px var(--wk-accent); transition: transform .2s var(--sc-ease), filter .2s; }
.sc-btn:hover { filter: brightness(1.05); }
.sc-btn:active { transform: scale(.98); }
.sc-btn:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; }
.sc-btn-wa { background: linear-gradient(135deg, #1faa59, #128c4b); color: #fff; box-shadow: 0 16px 30px -16px #128c4b; }
.sc-link { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 6px; border: 0; background: none; color: var(--wk-accent); font: 600 14px/1.2 var(--wk-font-sans); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.sc-input { display: block; width: 100%; min-height: 48px; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--wk-border); background: #fff; color: var(--wk-ink); font: 400 16px/1.4 var(--wk-font-sans); outline: none; transition: border-color .2s, box-shadow .2s; }
.sc-input:focus { border-color: var(--wk-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--wk-accent) 18%, transparent); }
.sc-area { resize: vertical; min-height: 96px; }
.sc-field { margin-bottom: 14px; }
.sc-note { margin: 12px 0 0; font-size: 14px; line-height: 1.5; color: #b42318; }
.sc-note.is-ok { color: var(--sc-leaf); }
.sc-swatch { display: inline-block; flex: none; width: 18px; height: 18px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,.14), 0 0 0 2px #fff; }

/* Sections: even rhythm, a soft wash between them. */
.sc-sec { position: relative; padding: clamp(52px, 7vw, 84px) 16px; isolation: isolate; }
.sc-sec > * { position: relative; }
.sc-head { text-align: center; margin: 0 auto clamp(24px, 4vw, 40px); max-width: 640px; }
.sc-head-rule { display: block; width: min(220px, 60%); height: auto; margin: 12px auto 0; opacity: .85; }

/* ── Language toggle (always reachable, above the window) ─────────────── */
.sc-lang { position: fixed; z-index: 95; top: calc(env(safe-area-inset-top, 0px) + 12px); left: 12px; display: flex; padding: 3px; border-radius: 999px;
  background: rgba(255, 252, 244, .9); border: 1px solid var(--wk-border); box-shadow: 0 10px 26px -16px rgba(120, 60, 10, .5); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.sc-lang button { min-width: 44px; min-height: 40px; padding: 0 10px; border: 0; border-radius: 999px; background: none; color: var(--wk-muted); font: 600 13px/1 var(--wk-font-sans); cursor: pointer; }
.sc-lang button[aria-pressed=true] { background: var(--wk-accent); color: var(--wk-accent-ink); }

/* The shell's music icon: a 44px control, top right (under the brand mark on the live page). */
body:has(.sc-root) .vm-icon { top: calc(env(safe-area-inset-top, 0px) + 12px) !important; right: 12px !important; left: auto !important; bottom: auto !important; z-index: 96 !important;
  width: 44px !important; height: 44px !important; box-shadow: 0 10px 22px -12px rgba(120, 60, 10, .6), 0 0 0 1px rgba(226, 154, 27, .6) !important; }
body:has(.sc-root.is-live) .vm-icon { top: calc(env(safe-area-inset-top, 0px) + 70px) !important; }
body:has(.sc-root) .vm-icon-btn { color: #b3155a !important; background: radial-gradient(circle at 50% 38%, #fffdf6, #ffe9b8 72%) !important; }
body:has(.sc-root) .vm-icon-eq i { background: #b3155a !important; }
body:has(.sc-root) .vm-icon-btn:focus-visible { outline-color: #b3155a !important; }

/* ── The khidki (opening) ─────────────────────────────────────────────── */
.sc-gate { position: fixed; inset: 0; z-index: 90; overflow: hidden; display: flex; justify-content: center;
  --gate-chrome: 292px; --stage-h: min(calc(100svh - var(--gate-chrome)), calc((100vw - 28px) * 1.2615), 680px); --stage-w: calc(var(--stage-h) / 1.2615); }
.sc-root.is-preview .sc-gate { --gate-chrome: 360px; }
.sc-root.is-preview .sc-gate-col { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 84px); }
.sc-gate-wall { position: absolute; inset: 0; background: radial-gradient(130% 85% at 50% 42%, #fffaf0 0%, #f9ecd2 52%, #f1dcb6 100%); }
.sc-gate-wall::before { content: ""; position: absolute; inset: 0; opacity: .5;
  background-image: radial-gradient(circle at 12px 12px, rgba(226, 154, 27, .28) 2px, transparent 2.5px), radial-gradient(circle at 36px 36px, rgba(179, 21, 90, .14) 2px, transparent 2.5px);
  background-size: 48px 48px; }
.sc-gate-wall::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 22px; opacity: .55;
  background: linear-gradient(45deg, transparent 42%, rgba(179, 21, 90, .4) 43% 57%, transparent 58%) 0 0 / 22px 22px, linear-gradient(-45deg, transparent 42%, rgba(226, 154, 27, .5) 43% 57%, transparent 58%) 0 0 / 22px 22px; }
.sc-gate-col { position: relative; z-index: 2; width: 100%; max-width: 1100px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: safe center;
  gap: clamp(8px, 1.6svh, 16px); padding: calc(env(safe-area-inset-top, 0px) + 14px) 14px calc(env(safe-area-inset-bottom, 0px) + 16px); }
.sc-gate-top { display: grid; justify-items: center; gap: 6px; max-width: calc(100% - 132px); text-align: center; transition: opacity .5s var(--sc-ease), transform .6s var(--sc-ease); }
.sc-gate-ganesh { display: block; width: clamp(128px, 36vw, 190px); height: auto; }
.sc-gate-k { margin: 0; font: 600 11.5px/1.45 var(--wk-font-caps); letter-spacing: .18em; text-transform: uppercase; color: #8c5300; }
.sc-gate-k:lang(hi) { font: 600 14px/1.4 var(--wk-font-deva); letter-spacing: .02em; text-transform: none; }
.sc-gate-dear { margin: 0; font: 400 16px/1.4 var(--wk-font-display); font-style: italic; color: #5a2a14; }
.sc-gate-dear b { font-style: normal; font-weight: 700; color: #b3155a; }
.sc-stage { position: relative; flex: none; height: var(--stage-h); width: var(--stage-w); perspective: 1400px; perspective-origin: 50% 45%; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.sc-stage-in { position: absolute; inset: 0; transform-style: preserve-3d; transform-origin: 50% 52%; }
.sc-stage-in > * { position: absolute; }
.sc-aperture { left: 13.077%; top: 18.293%; width: 73.846%; height: 68.293%; overflow: hidden; z-index: 1; background: #fff1c2; }
.sc-ap-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 46%; transform: scale(1.04); }
.sc-ap-bloom { position: absolute; inset: -25%; background: radial-gradient(circle at 50% 45%, rgba(255, 246, 196, .98) 0%, rgba(255, 229, 138, .7) 32%, rgba(255, 229, 138, 0) 66%); opacity: 0; }
.sc-ap-rays { position: absolute; left: 50%; top: -12%; width: 125%; height: auto; translate: -50% 0; mix-blend-mode: screen; opacity: 0; transform: scale(.9); }
.sc-frame { left: 0; top: 0; width: 100%; height: 100%; z-index: 4; }
.sc-leaf { top: 18.293%; height: 68.293%; width: 37.692%; z-index: 5; backface-visibility: visible; will-change: auto; }
.sc-leaf img { display: block; width: 100%; height: 100%; }
.sc-leaf-l { left: 13.077%; transform-origin: 0% 50%; }
.sc-leaf-r { left: 49.231%; transform-origin: 100% 50%; z-index: 6; }
.sc-leaf-shade { position: absolute; inset: 0; opacity: 0; }
.sc-leaf-l .sc-leaf-shade { background: linear-gradient(to left, rgba(40, 18, 6, 0), rgba(40, 18, 6, .42)); }
.sc-leaf-r .sc-leaf-shade { background: linear-gradient(to right, rgba(40, 18, 6, 0), rgba(40, 18, 6, .42)); }
.sc-floor-shadow { left: 18%; width: 64%; bottom: 8.5%; height: 4%; z-index: 3; border-radius: 50%; background: radial-gradient(rgba(60, 25, 5, .28), transparent 70%); }
.sc-diya { z-index: 9; width: 9%; height: 7%; top: 81.6%; pointer-events: none; }
.sc-diya-l { left: 14%; }
.sc-diya-r { left: 77%; }
.sc-diya i { position: absolute; left: 50%; top: 18%; width: 46%; height: 78%; translate: -50% 0; border-radius: 50%;
  background: radial-gradient(ellipse at 50% 70%, rgba(255, 240, 180, .95) 0%, rgba(255, 196, 70, .55) 40%, rgba(255, 150, 40, 0) 72%); transform-origin: 50% 85%; animation: sc-flicker 1.6s ease-in-out infinite alternate; }
.sc-diya-r i { animation-delay: -.7s; animation-duration: 1.9s; }
.sc-toran { left: -3.846%; top: 3.5%; width: 107.692%; height: 34%; z-index: 7; pointer-events: none; }
.sc-toran-part { position: absolute; inset: 0; }
.sc-toran-part img { display: block; width: 100%; height: 100%; }
.sc-toran-0 { clip-path: inset(0 66.6% 0 0); transform-origin: 16.7% 8%; }
.sc-toran-1 { clip-path: inset(0 33.3% 0 33.3%); transform-origin: 50% 8%; }
.sc-toran-2 { clip-path: inset(0 0 0 66.6%); transform-origin: 83.3% 8%; }
.sc-gate.is-ready .sc-toran-part { animation: sc-idle-sway 5.5s ease-in-out infinite alternate; }
.sc-gate.is-ready .sc-toran-1 { animation-delay: -1.8s; animation-duration: 6.2s; }
.sc-gate.is-ready .sc-toran-2 { animation-delay: -3.4s; }
.sc-strand { top: 13%; width: 7.4%; z-index: 8; opacity: 0; transform: translateY(-115%); transform-origin: 50% 0; pointer-events: none; }
.sc-strand img { display: block; width: 100%; height: auto; }
.sc-strand-l { left: 5.4%; }
.sc-strand-r { left: 87.2%; }
.sc-gate-side, .sc-gate-pot { display: none; position: absolute; z-index: 1; pointer-events: none; }
.sc-gate-guard, .sc-gate-pot img { display: block; width: 100%; height: auto; }
.sc-gate-foot { display: grid; justify-items: center; gap: 4px; text-align: center; transition: opacity .5s var(--sc-ease), transform .6s var(--sc-ease); }
.sc-gate-names { margin: 0; display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; column-gap: .3em; font: 400 clamp(34px, 9.6vw, 56px)/1.08 var(--wk-font-script); color: #3d1a0f; }
.sc-gate-names span { white-space: nowrap; }
.sc-gate-names i { font-style: normal; color: #e08a00; font-size: .8em; }
.sc-gate-date { margin: 0; font: 600 12.5px/1.4 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: #b3155a; }
.sc-gate-cta { position: relative; margin-top: 6px; display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 24px; border-radius: 999px; border: 0; cursor: pointer;
  background: linear-gradient(135deg, #c2185b, #e0457b 55%, #f29d12); color: #fff; font: 700 15.5px/1 var(--wk-font-sans); letter-spacing: .01em;
  box-shadow: 0 18px 34px -16px rgba(194, 24, 91, .75), inset 0 1px 0 rgba(255, 255, 255, .35); -webkit-tap-highlight-color: transparent; }
.sc-gate-cta:lang(hi) { font-family: var(--wk-font-deva); font-size: 16px; }
.sc-gate-cta:disabled { opacity: .72; cursor: progress; }
.sc-gate-cta:focus-visible { outline: 3px solid #f29d12; outline-offset: 3px; }
.sc-gate-cta-ring { position: absolute; inset: -6px; border-radius: inherit; border: 2px solid rgba(242, 157, 18, .7); opacity: 0; pointer-events: none; }
.sc-gate.is-ready.is-closed .sc-gate-cta-ring { animation: sc-ring 2.2s ease-out infinite; }
.sc-petal { position: fixed; z-index: 92; pointer-events: none; will-change: transform, opacity; }
/* entrance of the closed window (it paints at once; only the CTA waits for the art to decode) */
.sc-gate-col { animation: sc-gate-in .8s var(--sc-ease) both; }
@keyframes sc-gate-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
/* opening */
.sc-gate.is-opening .sc-gate-top { opacity: 0; transform: translateY(-14px); }
.sc-gate.is-opening .sc-gate-foot { opacity: 0; transform: translateY(18px); }
.sc-gate.is-opening .sc-leaf { will-change: transform; }
.sc-gate.is-opening .sc-leaf-l { animation: sc-open-l 1.3s cubic-bezier(.5, 0, .2, 1) forwards; }
.sc-gate.is-opening .sc-leaf-r { animation: sc-open-r 1.3s cubic-bezier(.5, 0, .2, 1) .06s forwards; }
.sc-gate.is-opening .sc-leaf-shade { animation: sc-fade-to 1.1s ease .1s forwards; --to: .6; }
.sc-gate.is-opening .sc-ap-bloom { animation: sc-bloom 1.2s ease .12s forwards; }
.sc-gate.is-opening .sc-ap-rays { animation: sc-rays 1.6s ease .15s forwards; }
.sc-gate.is-opening .sc-toran-part { animation: sc-swing 1.8s cubic-bezier(.3, .6, .4, 1) forwards; }
.sc-gate.is-opening .sc-toran-1 { animation-delay: .08s; }
.sc-gate.is-opening .sc-toran-2 { animation-delay: .16s; }
.sc-gate.is-opening .sc-strand { animation: sc-strand-in 1.3s cubic-bezier(.3, 1.3, .5, 1) .45s forwards; }
.sc-gate.is-opening .sc-strand-r { animation-delay: .55s; }
.sc-gate.is-opening .sc-floor-shadow { animation: sc-shadow .9s ease forwards; }
.sc-gate.is-opening .sc-stage-in { animation: sc-dolly 1s cubic-bezier(.62, 0, .3, 1) .95s forwards; }
.sc-gate.is-opening .sc-gate-side, .sc-gate.is-opening .sc-gate-pot { transition: opacity .6s ease .9s, transform 1s var(--sc-ease) .9s; opacity: 0; }
.sc-gate.is-opening { animation: sc-gate-out .6s ease 1.55s forwards; pointer-events: none; }
.sc-gate.is-reduced.is-opening { animation: sc-gate-out .4s ease forwards; }
.sc-gate.is-reduced.is-opening .sc-leaf, .sc-gate.is-reduced.is-opening .sc-stage-in, .sc-gate.is-reduced.is-opening .sc-toran-part, .sc-gate.is-reduced.is-opening .sc-strand { animation: none; }
@keyframes sc-open-l { 0% { transform: rotateY(0) } 6% { transform: rotateY(-3deg) } 80% { transform: rotateY(-116deg) } 100% { transform: rotateY(-110deg) } }
@keyframes sc-open-r { 0% { transform: rotateY(0) } 6% { transform: rotateY(3deg) } 80% { transform: rotateY(116deg) } 100% { transform: rotateY(110deg) } }
@keyframes sc-fade-to { to { opacity: var(--to, 1); } }
@keyframes sc-bloom { 0% { opacity: 0; transform: scale(.7) } 45% { opacity: 1; transform: scale(1.05) } 100% { opacity: .85; transform: scale(1.12) } }
@keyframes sc-rays { 0% { opacity: 0; transform: scale(.9) } 50% { opacity: .9 } 100% { opacity: .75; transform: scale(1.1) } }
@keyframes sc-swing { 0% { transform: rotate(0) } 18% { transform: rotate(3deg) } 40% { transform: rotate(-2.2deg) } 62% { transform: rotate(1.2deg) } 82% { transform: rotate(-.5deg) } 100% { transform: rotate(0) } }
@keyframes sc-idle-sway { from { transform: rotate(-.6deg) } to { transform: rotate(.6deg) } }
@keyframes sc-strand-in { 0% { opacity: 0; transform: translateY(-115%) rotate(0) } 35% { opacity: 1 } 60% { transform: translateY(0) rotate(5deg) } 80% { transform: translateY(0) rotate(-3deg) } 100% { opacity: 1; transform: translateY(0) rotate(0) } }
@keyframes sc-shadow { to { transform: scaleX(1.6); opacity: .4; } }
@keyframes sc-dolly { from { transform: scale(1) } to { transform: scale(2.3) translateY(3%) } }
@keyframes sc-gate-out { to { opacity: 0; visibility: hidden; } }
@keyframes sc-flicker { 0% { transform: scale(.94, .9); opacity: .82 } 50% { transform: scale(1.04, 1.06); opacity: 1 } 100% { transform: scale(.97, 1.02); opacity: .9 } }
@keyframes sc-ring { 0% { opacity: .9; transform: scale(.96) } 100% { opacity: 0; transform: scale(1.22) } }
@media (min-width: 700px) {
  .sc-gate-side { display: block; bottom: 7%; width: 24%; }
  .sc-gate-side-l { right: calc(50% + var(--stage-w) / 2 - 3%); }
  .sc-gate-side-r { left: calc(50% + var(--stage-w) / 2 - 3%); }
  .sc-gate-side-r .sc-gate-guard { transform: scaleX(-1); }
  .sc-gate-side { width: calc(var(--stage-w) * .27); bottom: auto; top: calc(50% + var(--stage-h) * .02); }
}
@media (min-width: 1180px) {
  .sc-gate-pot { display: block; width: calc(var(--stage-w) * .2); top: calc(50% + var(--stage-h) * .05); }
  .sc-gate-pot-l { right: calc(50% + var(--stage-w) / 2 + var(--stage-w) * .22); }
  .sc-gate-pot-r { left: calc(50% + var(--stage-w) / 2 + var(--stage-w) * .22); }
}
@media (max-height: 700px) { .sc-gate-ganesh { width: 120px; } .sc-gate-names { font-size: 34px; } .sc-gate-cta { min-height: 48px; } }

/* ── Hero: the haldi mandap ───────────────────────────────────────────── */
.sc-hero { position: relative; min-height: 100svh; overflow: hidden; isolation: isolate; display: flex; flex-direction: column; justify-content: center;
  padding: calc(env(safe-area-inset-top, 0px) + 64px) 16px 40px; }
.sc-hero-sky { position: absolute; inset: 0; z-index: -2; overflow: hidden; background: radial-gradient(120% 75% at 50% 28%, var(--sc-sky1) 0%, var(--sc-sky2) 68%, color-mix(in srgb, var(--sc-sky2) 70%, #f5b83d) 100%); }
.sc-hero-sky::before { content: ""; position: absolute; left: 50%; top: 32%; width: 260vmax; height: 260vmax; margin: -130vmax 0 0 -130vmax;
  background: repeating-conic-gradient(from 0deg, rgba(255, 255, 255, .34) 0deg 4deg, rgba(255, 255, 255, 0) 4deg 11deg); animation: sc-spin 120s linear infinite; }
.sc-hero-toran { display: none; }
.sc-hero-garland { position: absolute; left: 0; right: 0; top: 0; height: clamp(26px, 4.2vw, 44px); z-index: 3; background: url("${ART.garlandBorder.src}") repeat-x 50% 0 / auto 100%; pointer-events: none; }
.sc-hero-strand { position: absolute; top: 0; z-index: 3; width: clamp(18px, 3.2vw, 34px); pointer-events: none; transform-origin: 50% 0; }
.sc-hero-strand img { display: block; width: 100%; height: auto; }
.sc-hero-strand-l { left: clamp(6px, 2vw, 28px); }
.sc-hero-strand-r { right: clamp(6px, 2vw, 28px); }
.sc-root.is-open .sc-hero-strand { animation: sc-hang 6s ease-in-out infinite alternate; }
.sc-root.is-open .sc-hero-strand-r { animation-delay: -2.5s; }
.sc-hero-grid { width: 100%; max-width: 1180px; margin: 0 auto; display: grid; gap: 20px; align-items: center; }
.sc-hero-copy { text-align: center; display: grid; justify-items: center; gap: 8px; }
.sc-hero-ganesh { display: block; width: clamp(140px, 40vw, 210px); height: auto; }
.sc-hero-dear { margin: 0; max-width: 32ch; font: italic 400 17px/1.45 var(--wk-font-display); color: var(--wk-muted); }
.sc-hero-dear b { font-style: normal; color: var(--wk-accent); }
.sc-hero-names { margin: 2px 0 0; display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; column-gap: .28em; row-gap: 0;
  font: 400 clamp(46px, 13vw, 66px)/1.06 var(--wk-font-script); color: var(--wk-ink); text-wrap: balance; text-shadow: 0 2px 18px rgba(255, 255, 255, .7); }
.sc-hero-n { white-space: nowrap; }
.sc-hero-amp { color: var(--sc-marigold); font-size: .78em; }
.sc-hero-when { display: grid; justify-items: center; gap: 3px; }
.sc-hero-rule { width: 120px; height: 10px; margin: 2px 0 6px; background: radial-gradient(circle, var(--sc-rani) 0 2.5px, transparent 3px) 50% 50% / 14px 10px repeat-x; opacity: .7; }
.sc-hero-date { margin: 0; font: 600 13.5px/1.4 var(--wk-font-caps); letter-spacing: .16em; text-transform: uppercase; color: var(--wk-accent); }
.sc-root.is-hi .sc-hero-date { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 16px; }
.sc-hero-time { margin: 0; font: 600 17px/1.4 var(--wk-font-display); color: var(--wk-ink); }
.sc-hero-venue { margin: 0; font: italic 400 17px/1.4 var(--wk-font-display); color: var(--wk-muted); }
.sc-hero-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 8px; }
.sc-share-hero { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.sc-hero-scene { position: relative; width: min(calc(100% - 48px), 420px); margin: 6px auto 0; }
.sc-mandap { position: relative; aspect-ratio: 1080 / 1400; border-radius: var(--sc-r); overflow: hidden; background: #ffe7a0; box-shadow: 0 34px 60px -34px rgba(140, 70, 0, .6), 0 0 0 4px rgba(255, 250, 235, .9), 0 0 0 5px rgba(226, 154, 27, .5); }
.sc-mandap-bg, .sc-mandap-havan { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 82%; }
.sc-mandap-havan { z-index: 3; clip-path: inset(64% 38% 19% 38%); }
.sc-mandap-glow { display: none; }
.sc-mandap-couple { position: absolute; z-index: 2; left: 50%; bottom: 23%; width: 37%; height: auto; translate: -50% 0; filter: drop-shadow(0 10px 14px rgba(120, 50, 0, .28)); }
.sc-mandap-photo { position: absolute; z-index: 2; left: 50%; bottom: 25%; width: 46%; aspect-ratio: 3 / 4; translate: -50% 0; border-radius: var(--sc-r-sm); overflow: hidden; box-shadow: 0 0 0 4px #fff8e1, 0 18px 30px -16px rgba(120, 50, 0, .55); }
.sc-mandap-flame { position: absolute; z-index: 4; left: 50%; top: 63%; width: 16%; height: 12%; translate: -50% 0; border-radius: 50%; background: radial-gradient(ellipse at 50% 70%, rgba(255, 240, 170, .9), rgba(255, 170, 40, .4) 45%, rgba(255, 140, 0, 0) 72%); transform-origin: 50% 90%; animation: sc-flicker 1.4s ease-in-out infinite alternate; pointer-events: none; }
.sc-hero-guard { position: absolute; z-index: 3; bottom: -2%; width: 30%; pointer-events: none; }
.sc-hero-guard img { display: block; width: 100%; height: auto; }
.sc-hero-guard-l { left: -17%; }
.sc-hero-guard-r { right: -17%; }
.sc-hero-guard-r img { transform: scaleX(-1); }
.sc-hero-pot { display: none; position: absolute; z-index: 2; bottom: -3%; width: 26%; pointer-events: none; }
.sc-hero-pot img { display: block; width: 100%; height: auto; }
.sc-hero-scroll { align-self: center; display: grid; place-items: center; width: 44px; height: 44px; margin-top: 18px; border-radius: 50%; border: 1px solid var(--wk-border); background: rgba(255, 253, 246, .8); }
.sc-hero-scroll span { width: 10px; height: 10px; border-right: 2px solid var(--wk-accent); border-bottom: 2px solid var(--wk-accent); transform: translateY(-2px) rotate(45deg); }
.sc-root.is-open .sc-hero-scroll span { animation: sc-nudge 2s ease-in-out infinite; }
/* entrance after the window opens */
.sc-rise { opacity: 0; transform: translateY(22px); }
.sc-root.is-open .sc-rise { opacity: 1; transform: none; transition: opacity .9s var(--sc-ease) var(--d, 0ms), transform 1.1s var(--sc-ease) var(--d, 0ms); }
.sc-root.is-open .sc-hero-scene.sc-rise { transform: none; }
.sc-root:not(.is-open) .sc-hero-scene.sc-rise { transform: scale(1.08); }
@keyframes sc-spin { to { transform: rotate(360deg); } }
@keyframes sc-hang { from { transform: rotate(-2.2deg) } to { transform: rotate(2.2deg) } }
@keyframes sc-nudge { 0%, 100% { translate: 0 0 } 50% { translate: 0 5px } }
@media (min-width: 600px) {
  .sc-hero-scene { width: min(calc(100% - 200px), 440px); }
  .sc-hero-guard { width: 34%; }
  .sc-hero-guard-l { left: -30%; }
  .sc-hero-guard-r { right: -30%; }
}
@media (min-width: 1024px) {
  .sc-hero { padding: 84px 40px 48px; }
  .sc-hero-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: clamp(40px, 5vw, 88px); }
  .sc-hero-copy { gap: 10px; }
  .sc-hero-names { font-size: clamp(66px, 6.6vw, 104px); flex-direction: column; align-items: center; }
  .sc-hero-amp { font-size: .6em; line-height: .9; }
  .sc-hero-date { font-size: 15px; }
  .sc-hero-time, .sc-hero-venue { font-size: 19px; }
  .sc-hero-scene { width: min(100%, calc((100svh - 150px) * 1080 / 1400), 470px); margin: 0 auto; }
  .sc-hero-guard { width: 28%; }
  .sc-hero-guard-l { left: -13%; }
  .sc-hero-guard-r { right: -18%; }
  .sc-hero-pot-r { display: block; right: -34%; width: 22%; }
  .sc-hero-pot-r img { transform: scaleX(-1); }
  .sc-hero-actions { max-width: 460px; }
}

/* ── Invitation ───────────────────────────────────────────────────────── */
.sc-sec-invite { padding-top: clamp(64px, 10vw, 112px); background: linear-gradient(180deg, color-mix(in srgb, var(--sc-sky2) 40%, var(--wk-bg)) 0%, var(--wk-bg) 32%); }
.sc-lamp { position: absolute; top: 0; z-index: 0; width: clamp(38px, 7vw, 64px); pointer-events: none; transform-origin: 50% 0; }
.sc-lamp img { display: block; width: 100%; height: auto; }
.sc-lamp-l { left: clamp(8px, 6vw, 120px); }
.sc-lamp-r { right: clamp(8px, 6vw, 120px); }
.sc-root.is-open .sc-lamp { animation: sc-hang 5s ease-in-out infinite alternate; }
.sc-root.is-open .sc-lamp-r { animation-delay: -2s; }
.sc-invite { max-width: 760px; margin: 0 auto; padding: 44px clamp(20px, 6vw, 56px) 34px; text-align: center; overflow: hidden;
  background: radial-gradient(120% 60% at 50% 0%, #fffaf0 0%, var(--wk-surface-solid) 60%); }
.sc-invite::after { content: ""; position: absolute; inset: 10px; border-radius: calc(var(--sc-r) - 6px); border: 1px solid color-mix(in srgb, var(--sc-marigold) 45%, transparent); pointer-events: none; }
.sc-invite-border { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
.sc-invite-ganesha { display: block; width: 46px; height: auto; margin: 4px auto 10px; opacity: .9; }
.sc-invite-om { margin: 6px 0 0; font: 500 18px/1.4 var(--wk-font-deva); color: var(--sc-marigold); }
.sc-invite-cols { display: grid; gap: 18px; margin-top: 18px; }
.sc-invite-en p, .sc-invite-hi p { margin: 0 0 12px; font: 400 clamp(18px, 4.6vw, 21px)/1.65 var(--wk-font-display); color: var(--wk-ink); text-wrap: pretty; }
.sc-invite-hi p { font: 400 clamp(17px, 4.4vw, 20px)/1.85 var(--wk-font-deva); }
.sc-invite-cols.has-hi .sc-invite-hi { padding-top: 18px; border-top: 1px dashed color-mix(in srgb, var(--sc-marigold) 55%, transparent); }
.sc-invite-cols.is-hi-first .sc-invite-hi { order: -1; padding-top: 0; border-top: 0; }
.sc-invite-cols.is-hi-first .sc-invite-en { padding-top: 18px; border-top: 1px dashed color-mix(in srgb, var(--sc-marigold) 55%, transparent); }
.sc-invite-sign { margin: 10px 0 0; font: 400 30px/1.2 var(--wk-font-script); color: var(--wk-accent); }
@media (min-width: 860px) {
  .sc-invite-cols.has-hi { grid-template-columns: 1fr 1fr; gap: 36px; text-align: left; }
  .sc-invite-cols.has-hi .sc-invite-hi, .sc-invite-cols.is-hi-first .sc-invite-en { padding-top: 0; border-top: 0; }
  .sc-invite-cols.has-hi > :last-child { padding-left: 36px; border-left: 1px dashed color-mix(in srgb, var(--sc-marigold) 55%, transparent); }
  .sc-invite-cols.is-hi-first .sc-invite-hi { order: 0; }
}

/* ── Families ─────────────────────────────────────────────────────────── */
.sc-sec-fam { overflow: hidden; }
.sc-fam-leaf { position: absolute; bottom: 0; z-index: 0; width: clamp(120px, 22vw, 260px); opacity: .9; pointer-events: none; }
.sc-fam-leaf img { display: block; width: 100%; height: auto; }
.sc-fam-leaf-l { left: -6%; transform: rotate(8deg); }
.sc-fam-leaf-r { right: -6%; }
.sc-fam-leaf-r img { transform: scaleX(-1) rotate(8deg); }
.sc-fam-bless { max-width: 520px; margin: -8px auto 22px; text-align: center; }
.sc-fam-bless p { margin: 0; font: italic 500 19px/1.5 var(--wk-font-display); color: var(--wk-ink); }
.sc-fam-grid { display: grid; gap: 16px; max-width: 880px; margin: 0 auto; }
.sc-fam-card { padding: 24px 22px; text-align: center; }
.sc-fam-parents { margin: 10px 0 0; font: 600 clamp(20px, 5vw, 24px)/1.35 var(--wk-font-display); color: var(--wk-ink); text-wrap: balance; }
.sc-fam-grand { margin: 8px 0 0; font-size: 15px; line-height: 1.5; color: var(--wk-muted); }
.sc-fam-of { margin: 12px 0 0; font: italic 400 16px/1.4 var(--wk-font-display); color: var(--wk-muted); }
.sc-fam-of b { font-style: normal; color: var(--wk-accent); }
@media (min-width: 720px) { .sc-fam-grid { grid-template-columns: 1fr 1fr; } }

/* ── The couple ───────────────────────────────────────────────────────── */
.sc-sec-couple { background: linear-gradient(180deg, var(--wk-bg) 0%, color-mix(in srgb, var(--sc-haldi) 14%, var(--wk-bg)) 100%); }
.sc-couple-grid { display: grid; gap: 18px; max-width: 1100px; margin: 0 auto; align-items: center; }
.sc-person { padding: 22px; text-align: center; overflow: hidden; }
.sc-person.has-photo { padding: 0 0 22px; }
.sc-person-photo { display: block; aspect-ratio: 4 / 5; overflow: hidden; border-radius: var(--sc-r) var(--sc-r) 0 0; }
.sc-person.has-photo .sc-person-photo { margin: 12px 12px 0; border-radius: var(--sc-r-sm); }
.sc-person-tx { padding: 16px 18px 0; }
.sc-person-name { margin: 4px 0 0; font: 400 clamp(36px, 9vw, 46px)/1.1 var(--wk-font-script); color: var(--wk-ink); }
.sc-person-d { margin: 8px auto 0; max-width: 36ch; font-size: 16px; line-height: 1.6; color: var(--wk-muted); }
.sc-tags { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 14px 0 0; padding: 0; }
.sc-tags li { display: inline-flex; align-items: center; gap: 6px; min-height: 34px; padding: 0 12px; border-radius: 999px; background: var(--wk-surface-2); font-size: 14px; color: var(--wk-ink); }
.sc-couple-art { position: relative; width: min(78%, 320px); margin: 0 auto; }
.sc-couple-gazebo { display: block; width: 100%; height: auto; }
.sc-couple-ill { position: absolute; left: 50%; bottom: 7%; width: 46%; height: auto; translate: -50% 0; }
@media (min-width: 900px) {
  .sc-couple-grid { grid-template-columns: 1fr minmax(240px, .8fr) 1fr; }
  .sc-couple-grid.has-photos { grid-template-columns: 1fr 1fr; max-width: 900px; }
  .sc-couple-art { width: 100%; }
}

/* ── Save the date ────────────────────────────────────────────────────── */
.sc-sec-date { overflow: hidden; }
.sc-date-grid { display: grid; gap: 10px; max-width: 1100px; margin: 0 auto; align-items: center; }
.sc-date-art { width: min(58%, 240px); margin: 0 auto -6px; }
.sc-swing { display: block; width: 100%; height: auto; transform-origin: 50% 0; }
.sc-root.is-open .sc-swing { animation: sc-jhoola 4.5s ease-in-out infinite alternate; }
@keyframes sc-jhoola { from { transform: rotate(-2.4deg) } to { transform: rotate(2.4deg) } }
.sc-date-card { max-width: 560px; margin: 0 auto; padding: 26px clamp(16px, 5vw, 32px) 28px; text-align: center; }
.sc-date-wd { margin: 0; font: 600 13px/1.4 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-accent); }
.sc-date-wd:lang(hi) { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 16px; text-transform: none; }
.sc-date-big { display: flex; align-items: center; justify-content: center; gap: clamp(10px, 3vw, 22px); margin: 10px 0 4px; }
.sc-date-m, .sc-date-y { font: 600 clamp(15px, 4vw, 19px)/1 var(--wk-font-caps); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-ink); padding: 10px 0; border-block: 1px solid color-mix(in srgb, var(--sc-marigold) 60%, transparent); min-width: 0; }
.sc-root.is-hi .sc-date-m, .sc-root.is-hi .sc-date-y { font-family: var(--wk-font-deva); letter-spacing: .02em; }
.sc-date-d { font: 500 clamp(64px, 17vw, 96px)/.95 var(--wk-font-display); color: var(--sc-marigold); }
.sc-date-t { margin: 8px 0 0; font: 600 18px/1.4 var(--wk-font-display); color: var(--wk-ink); }
.sc-date-v { margin: 2px 0 0; font: italic 400 17px/1.4 var(--wk-font-display); color: var(--wk-muted); }
.sc-countdown { margin-top: 18px; }
@media (min-width: 900px) {
  .sc-date-grid { grid-template-columns: minmax(0, .7fr) minmax(0, 1fr); gap: 40px; }
  .sc-date-art { width: min(100%, 340px); margin: 0 auto; }
}

/* ── Story ────────────────────────────────────────────────────────────── */
.sc-sec-story { background: linear-gradient(180deg, color-mix(in srgb, var(--sc-haldi) 10%, var(--wk-bg)), var(--wk-bg)); overflow: hidden; }
.sc-story-vine { position: absolute; top: 0; left: max(-20px, calc(50% - 560px)); width: clamp(90px, 16vw, 170px); opacity: .9; pointer-events: none; }
.sc-story-vine img { display: block; width: 100%; height: auto; }
.sc-story { list-style: none; margin: 0 auto; padding: 0 0 0 26px; max-width: 760px; position: relative; display: grid; gap: 24px; }
.sc-story::before { content: ""; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: repeating-linear-gradient(180deg, var(--sc-marigold) 0 6px, transparent 6px 12px); opacity: .8; }
.sc-chapter { position: relative; display: grid; gap: 12px; }
.sc-chapter-dot { position: absolute; left: -26px; top: 18px; width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle, #fff 0 3px, var(--sc-marigold) 3.5px); box-shadow: 0 0 0 4px color-mix(in srgb, var(--sc-marigold) 22%, transparent); }
.sc-chapter-photo { display: block; aspect-ratio: 4 / 3; border-radius: var(--sc-r); overflow: hidden; box-shadow: var(--sc-shadow); }
.sc-chapter-tx { padding: 18px 20px; }
.sc-chapter-when { display: inline-block; margin: 0 0 6px; padding: 4px 12px; border-radius: 999px; background: color-mix(in srgb, var(--sc-haldi) 40%, #fff); font: 600 13px/1.3 var(--wk-font-caps); letter-spacing: .12em; color: #8c5300; }
.sc-chapter-h { margin: 0; font: 600 clamp(21px, 5.4vw, 25px)/1.3 var(--wk-font-display); color: var(--wk-ink); }
.sc-chapter-p { margin: 6px 0 0; font-size: 16px; line-height: 1.65; color: var(--wk-muted); }
@media (min-width: 760px) {
  .sc-story { padding: 0; gap: 34px; }
  .sc-story::before { left: 50%; translate: -1px 0; }
  .sc-chapter { grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
  .sc-chapter-dot { left: calc(50% - 8px); top: 50%; translate: 0 -50%; }
  .sc-chapter:not(.has-photo) .sc-chapter-tx { grid-column: 1; }
  .sc-chapter.is-alt .sc-chapter-photo { order: 2; }
  .sc-chapter.is-alt:not(.has-photo) .sc-chapter-tx { grid-column: 2; }
}

/* ── Functions ────────────────────────────────────────────────────────── */
.sc-sec-events { background: radial-gradient(90% 50% at 50% 0%, color-mix(in srgb, var(--sc-haldi) 22%, transparent), transparent 70%), var(--wk-bg); overflow: hidden; }
.sc-umb { position: absolute; top: -4px; z-index: 0; width: clamp(70px, 14vw, 150px); pointer-events: none; transform-origin: 50% 0; }
.sc-umb img { display: block; width: 100%; height: auto; }
.sc-umb-l { left: clamp(-10px, 3vw, 80px); }
.sc-umb-r { right: clamp(-10px, 3vw, 80px); }
.sc-root.is-open .sc-umb { animation: sc-hang 6.5s ease-in-out infinite alternate; }
.sc-root.is-open .sc-umb-r { animation-delay: -3s; }
.sc-sec-events .sc-head { padding-top: clamp(40px, 8vw, 60px); }
.sc-fns { list-style: none; margin: 0 auto; padding: 0; max-width: 1180px; display: grid; gap: 18px; }
.sc-fn { padding: 0 0 18px; overflow: hidden; display: flex; flex-direction: column; border-top: 0; }
.sc-fn::before { content: ""; display: block; height: 6px; background: linear-gradient(90deg, var(--fn), color-mix(in srgb, var(--fn) 55%, #fff)); }
.sc-fn.is-main { box-shadow: 0 0 0 2px color-mix(in srgb, var(--sc-marigold) 70%, transparent), var(--sc-shadow); }
.sc-fn-top { position: relative; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; min-height: 148px; padding: 18px 18px 0;
  background: radial-gradient(120% 90% at 85% 100%, color-mix(in srgb, var(--fn) 22%, #fff) 0%, transparent 70%); }
.sc-fn-title { min-width: 0; padding-bottom: 14px; }
.sc-fn-icon { margin: 0; font-size: 22px; line-height: 1; }
.sc-fn-name { margin: 6px 0 0; font: 400 clamp(36px, 9vw, 44px)/1.05 var(--wk-font-script); color: var(--wk-ink); overflow-wrap: anywhere; }
.sc-fn-hi { margin: 2px 0 0; font: 600 16px/1.4 var(--wk-font-deva); color: var(--wk-accent); }
.sc-fn-art { flex: none; width: auto; height: 140px; max-width: 46%; object-fit: contain; object-position: 100% 100%; filter: drop-shadow(0 8px 10px rgba(120, 50, 0, .18)); }
.sc-fn-dl { margin: 6px 18px 0; display: grid; gap: 10px; }
.sc-fn-dl > div { display: grid; grid-template-columns: 22px 1fr; gap: 10px; align-items: start; }
.sc-fn-dl dt { margin: 2px 0 0; color: var(--wk-accent); }
.sc-fn-dl dd { margin: 0; font-size: 15.5px; line-height: 1.5; color: var(--wk-ink); min-width: 0; }
.sc-fn-dl dd b { display: block; font-weight: 600; }
.sc-fn-addr { display: block; color: var(--wk-muted); font-size: 14.5px; }
.sc-fn-dress { display: flex; align-items: center; gap: 10px; }
.sc-fn-k { color: var(--wk-muted); }
.sc-fn-note { margin: 12px 18px 0; padding: 10px 12px; border-radius: 12px; background: var(--wk-surface-2); font: italic 400 16px/1.5 var(--wk-font-display); color: var(--wk-ink); }
.sc-fn-btns { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 18px 0; margin-top: auto; padding-top: 14px; }
.sc-fn-btns .sc-pill { flex: 1 1 auto; min-height: 42px; padding: 0 13px; font-size: 13.5px; }
.sc-fns-all { text-align: center; margin-top: 26px; }
@media (min-width: 680px) { .sc-fns { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1100px) { .sc-fns { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

/* ── Venue ────────────────────────────────────────────────────────────── */
.sc-venue { max-width: 980px; margin: 0 auto; padding: 22px; display: grid; gap: 16px; align-items: center; overflow: hidden; background: radial-gradient(110% 80% at 0% 100%, color-mix(in srgb, var(--sc-haldi) 24%, #fff), var(--wk-surface-solid) 60%); }
.sc-venue-art { display: block; width: min(76%, 320px); height: auto; margin: 0 auto; }
.sc-venue-tx { text-align: center; display: grid; justify-items: center; gap: 8px; }
.sc-venue-name { margin: 4px 0 0; font: 600 clamp(26px, 6.6vw, 34px)/1.2 var(--wk-font-display); color: var(--wk-ink); text-wrap: balance; }
.sc-venue-addr { margin: 0 0 6px; font-size: 16px; color: var(--wk-muted); }
.sc-venue-get { margin-top: 10px; max-width: 46ch; text-align: left; padding: 14px 16px; border-radius: 14px; background: var(--wk-surface-2); }
.sc-venue-get p:not(.sc-label) { margin: 0; font-size: 15.5px; line-height: 1.6; color: var(--wk-ink); }
@media (min-width: 820px) { .sc-venue { grid-template-columns: .9fr 1.1fr; padding: 34px; } .sc-venue-tx { text-align: left; justify-items: start; } }

/* ── Film ─────────────────────────────────────────────────────────────── */
.sc-film { max-width: 860px; margin: 0 auto; aspect-ratio: 16 / 9; border-radius: var(--sc-r); overflow: hidden; background: #2a1606; box-shadow: var(--sc-shadow); }
.sc-film iframe { width: 100%; height: 100%; border: 0; display: block; }
.sc-film-poster { position: relative; display: block; width: 100%; height: 100%; padding: 0; border: 0; cursor: pointer; background: #2a1606; }
.sc-film-poster img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: .85; }
.sc-film-play { position: absolute; left: 50%; top: 50%; translate: -50% -50%; display: grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; background: rgba(255, 253, 246, .92); color: var(--wk-accent); box-shadow: 0 12px 30px -10px rgba(0, 0, 0, .5); }
.sc-film-label { position: absolute; left: 50%; bottom: 14px; translate: -50% 0; padding: 6px 14px; border-radius: 999px; background: rgba(0, 0, 0, .45); color: #fff; font: 600 14px/1.2 var(--wk-font-sans); white-space: nowrap; }

/* ── Gallery ──────────────────────────────────────────────────────────── */
.sc-sec-gallery { overflow: hidden; }
.sc-gal-feather { position: absolute; right: max(-30px, calc(50% - 640px)); top: 10px; width: clamp(90px, 14vw, 170px); opacity: .9; pointer-events: none; }
.sc-gal-feather img { display: block; width: 100%; height: auto; }
.sc-gallery { max-width: 1180px; margin: 0 auto; }

/* ── Good to know · contacts · shagun ─────────────────────────────────── */
.sc-know { list-style: none; margin: 0 auto 18px; padding: 0; max-width: 980px; display: grid; gap: 14px; }
.sc-know-i { padding: 18px 20px; }
.sc-know-h { margin: 0 0 4px; font: 600 13px/1.3 var(--wk-font-caps); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-accent); }
.sc-know-t { margin: 0; font-size: 16px; line-height: 1.6; color: var(--wk-ink); }
@media (min-width: 720px) { .sc-know { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.sc-contacts, .sc-shagun { max-width: 760px; margin: 0 auto 18px; padding: 22px; }
.sc-contact-list { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 12px; }
.sc-contact { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 10px 12px; align-items: center; padding: 12px; border-radius: 14px; background: var(--wk-surface-2); }
.sc-contact-ini { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--sc-marigold), var(--sc-rani)); color: #fff; font: 700 18px/1 var(--wk-font-display); }
.sc-contact-who { display: grid; min-width: 0; }
.sc-contact-who b { font-size: 16px; overflow-wrap: anywhere; }
.sc-contact-who small { font-size: 14px; color: var(--wk-muted); }
.sc-contact-btns { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; }
.sc-contact-btns .sc-pill { flex: 1 1 120px; }
@media (min-width: 620px) { .sc-contact { grid-template-columns: 44px minmax(0, 1fr) auto; } .sc-contact-btns { grid-column: auto; } .sc-contact-btns .sc-pill { flex: none; } }
.sc-shagun { text-align: center; background: radial-gradient(100% 80% at 50% 0%, color-mix(in srgb, var(--sc-haldi) 26%, #fff), var(--wk-surface-solid) 70%); }
.sc-shagun-id { margin: 12px 0 0; display: grid; gap: 2px; }
.sc-shagun-id b { font-size: 17px; overflow-wrap: anywhere; }
.sc-shagun-id small { color: var(--wk-muted); }
.sc-shagun-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 14px; }

/* ── RSVP ─────────────────────────────────────────────────────────────── */
.sc-sec-rsvp { overflow: hidden; background: linear-gradient(180deg, var(--wk-bg), color-mix(in srgb, var(--sc-haldi) 16%, var(--wk-bg))); }
.sc-rsvp-pot { position: absolute; bottom: 0; width: clamp(80px, 13vw, 170px); pointer-events: none; display: none; }
.sc-rsvp-pot img { display: block; width: 100%; height: auto; }
.sc-rsvp-pot-l { left: max(0px, calc(50% - 620px)); }
.sc-rsvp-pot-r { right: max(0px, calc(50% - 620px)); }
.sc-rsvp-pot-r img { transform: scaleX(-1); }
@media (min-width: 980px) { .sc-rsvp-pot { display: block; } }
.sc-rsvp { max-width: 640px; margin: 0 auto; padding: 26px 0 0; overflow: visible; background: none; border: 0; box-shadow: none; }
.sc-rsvp-border { position: absolute; left: 4%; top: 0; width: 92%; height: auto; z-index: 2; }

/* ── Blessings ────────────────────────────────────────────────────────── */
.sc-bless { max-width: 1100px; margin: 0 auto; display: grid; gap: 22px; }
.sc-bless-form { width: 100%; max-width: 620px; margin: 0 auto; padding: 22px clamp(16px, 4.5vw, 28px); }
.sc-bless-voice { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px; }
.sc-bless-voice .sc-pill { flex: 1 1 160px; }
.sc-bless-chip { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0 0 12px; padding: 6px 6px 6px 12px; border-radius: 12px; background: var(--wk-surface-2); font-size: 14px; }
.sc-bless-form .sc-btn { width: 100%; }
.sc-bless-wall { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.sc-bless-i { padding: 18px 20px; }
.sc-bless-i::before { content: "“"; position: absolute; right: 14px; top: -6px; font: 400 64px/1 var(--wk-font-display); color: color-mix(in srgb, var(--sc-marigold) 50%, transparent); }
.sc-bless-msg { margin: 0; font: italic 400 18px/1.55 var(--wk-font-display); color: var(--wk-ink); overflow-wrap: anywhere; }
.sc-bless-audio { display: block; width: 100%; height: 40px; margin-top: 10px; }
.sc-bless-from { margin: 10px 0 0; font: 600 14px/1.3 var(--wk-font-sans); color: var(--wk-accent); }
@media (min-width: 720px) { .sc-bless-wall { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1100px) { .sc-bless-wall { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

/* ── Finale ───────────────────────────────────────────────────────────── */
.sc-finale { text-align: center; padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)); overflow: hidden;
  background: radial-gradient(90% 60% at 50% 30%, color-mix(in srgb, var(--sc-haldi) 34%, var(--wk-bg)), var(--wk-bg) 70%); }
.sc-root.is-preview .sc-finale { padding-bottom: calc(150px + env(safe-area-inset-bottom, 0px)); }
.sc-finale-peacock { position: absolute; z-index: 0; right: max(-40px, calc(50% - 620px)); top: clamp(10px, 4vw, 60px); width: clamp(110px, 20vw, 260px); pointer-events: none; }
.sc-finale-peacock img { transform: scaleX(-1); }
.sc-finale > :not(.sc-finale-peacock) { z-index: 1; }
.sc-finale-peacock img { display: block; width: 100%; height: auto; }
.sc-seal { position: relative; display: grid; place-items: center; width: 148px; height: 148px; margin: 0 auto 18px; }
.sc-seal-ring { position: absolute; inset: 0; border-radius: 50%; background: repeating-conic-gradient(from 0deg, var(--sc-marigold) 0deg 10deg, #ffb52e 10deg 20deg); -webkit-mask: radial-gradient(circle, transparent 0 58%, #000 59% 70%, transparent 71%), radial-gradient(circle, transparent 0 73%, #000 74% 100%); mask: radial-gradient(circle, transparent 0 58%, #000 59% 70%, transparent 71%), radial-gradient(circle, transparent 0 73%, #000 74% 100%); }
.sc-root.is-open .sc-seal-ring { animation: sc-spin 40s linear infinite; }
.sc-seal-in { position: relative; display: grid; place-items: center; width: 98px; height: 98px; border-radius: 50%; background: radial-gradient(circle at 40% 30%, #e0457b, var(--sc-rani) 70%); color: #fff7e6; box-shadow: 0 14px 30px -12px var(--sc-rani); }
.sc-seal-hi { position: absolute; top: 16px; font: 600 12px/1 var(--wk-font-deva); letter-spacing: .04em; opacity: .9; }
.sc-seal-ini { margin-top: 10px; font: 400 34px/1 var(--wk-font-script); }
.sc-seal-ini i { font-style: normal; font-size: .6em; margin: 0 .1em; color: #ffd27a; }
.sc-finale-line { margin: 0 auto; max-width: 30ch; font: 400 clamp(34px, 8.6vw, 52px)/1.15 var(--wk-font-script); color: var(--wk-ink); text-wrap: balance; }
.sc-finale-line span:lang(hi) { font: 600 clamp(24px, 6.4vw, 34px)/1.4 var(--wk-font-deva); }
.sc-finale-sign { margin: 12px 0 0; font: italic 500 19px/1.4 var(--wk-font-display); color: var(--wk-muted); }
.sc-finale-tag { margin: 8px 0 0; font: 600 15px/1.3 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-accent); }
.sc-finale-share { margin-top: 26px; }
.sc-share-finale { display: grid; justify-items: center; gap: 14px; max-width: 640px; margin: 0 auto; }
.sc-share-finale .sc-btn-wa { width: min(100%, 360px); }
.sc-share-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.sc-finale-foot { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; margin-top: 26px; }

/* ── QR dialog ────────────────────────────────────────────────────────── */
.sc-qr-scrim { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(40, 18, 6, .55); }
.sc-qr { display: grid; justify-items: center; gap: 12px; padding: 22px; border-radius: 22px; background: #fffdf6; box-shadow: 0 30px 60px -20px rgba(0, 0, 0, .5); text-align: center; max-width: 320px; }
.sc-qr svg { width: min(240px, 70vw); height: auto; }
.sc-qr p { margin: 0; color: #3d1a0f; font: 600 15px/1.4 DM Sans, system-ui, sans-serif; }

/* ── Reduced motion ───────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .sc-root *, .sc-root *::before, .sc-root *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; }
  .sc-root .sc-rise { opacity: 1; transform: none; }
  .sc-hero-sky::before { animation: none; }
}
`;
