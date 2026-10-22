// ─── Royal Wedding Invitation — the page's own CSS (on top of the kit's) ────
// Every looping or long motion is transform / opacity (individual `translate`
// / `rotate` / `scale` properties where an entrance and a loop share one
// element); the door swing is a 3D rotateY under one perspective; the only
// exceptions are one-shot: the farmaan's clip-path wipe. Themes come from
// --wk-*; the per-theme art is chosen in ./art.ts.

import { art, art2x } from "./art";

const iset = (id: Parameters<typeof art>[0]) => `image-set(url("${art(id).src}") 1x, url("${art2x(id)}") 2x)`;
const VINES = iset("museum/scrolling-floral-vines");
const BORDER = iset("museum/shah-jahan-floral-border");
const PAPER = `url("${art("plate/ivory-paper").src}")`;

// The door leaf's arched silhouette (the pack's gate-door path, as a polygon).
const CLIP_L = "polygon(0% 100%, 0% 37.5%, 1.2% 33.4%, 4.6% 29.5%, 10.3% 25.7%, 17.9% 22.1%, 27.5% 18.7%, 38.9% 15.5%, 51.9% 12.5%, 66.6% 9.7%, 82.6% 7.2%, 100% 5%, 100% 100%)";
const CLIP_R = "polygon(100% 100%, 100% 37.5%, 98.8% 33.4%, 95.4% 29.5%, 89.7% 25.7%, 82.1% 22.1%, 72.5% 18.7%, 61.1% 15.5%, 48.1% 12.5%, 33.4% 9.7%, 17.4% 7.2%, 0% 5%, 0% 100%)";

export const FW_CSS = `
.fw-root { --fw-ease: cubic-bezier(.22,1,.36,1); --fw-soft: cubic-bezier(.22,.61,.36,1); --fw-silk: cubic-bezier(.65,.05,.36,1); --fw-expo: cubic-bezier(.16,1,.3,1); --fw-press: cubic-bezier(.34,1.56,.64,1);
  --fw-door: #4a1020; --fw-light: #fff3d6; --fw-ruby: #8e1b2e; overflow-x: clip; }
.fw-root[data-wk-theme=noir] { --fw-door: #1b150d; }
.fw-root[data-wk-theme=emerald] { --fw-door: #0e3325; }
.fw-root[data-wk-theme=blush] { --fw-door: #6a2639; }
.fw-root[data-wk-theme=champagne] { --fw-door: #5e3d16; }
.fw-root[data-wk-theme=powder] { --fw-door: #213e64; }

/* The kit's foil sheen animates background-position (a repaint every frame);
   Royal keeps the foil static and sweeps light with a transform instead. */
.fw-root .wk-shimmer { animation: none !important; }
.fw-sweep { position: absolute; inset: 0; overflow: hidden; pointer-events: none; opacity: 1 !important; transform: none !important; }
.fw-sweep::before { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 34%; background: linear-gradient(105deg, transparent, rgba(255,246,214,.42) 50%, transparent); translate: -120% 0; animation: fw-sweep 7.5s var(--fw-soft) 3s infinite; }
@keyframes fw-sweep { 0% { translate: -120% 0; } 22%, 100% { translate: 320% 0; } }

/* The theme's royal plate behind every section (one static layer). */
.fw-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
.fw-backdrop img { width: 100%; height: 100%; object-fit: cover; opacity: .3; }
.fw-root:not([data-wk-dark]) .fw-backdrop img { opacity: .42; }
.fw-root[data-wk-theme=champagne] .fw-backdrop img { opacity: .2; }
.fw-backdrop::after { content: ""; position: absolute; inset: 0; background: radial-gradient(120% 70% at 50% 50%, transparent, color-mix(in srgb, var(--wk-bg) 60%, transparent)); }

/* ── Toran: gold mango-leaf band + marigold strings ──────── */
.fw-toran { position: absolute; left: -2%; right: -2%; top: 0; height: 150px; z-index: 6; pointer-events: none; transform-origin: 50% 0; animation: fw-toran 5s ease-in-out infinite alternate; }
.fw-toran-band { position: absolute; left: 0; right: 0; top: 0; height: clamp(46px, 11vw, 74px); background-image: var(--wk-foil); background-size: 220% 100%;
  -webkit-mask: url(/wedding/ornaments/toran-strip.svg) repeat-x 0 0 / auto 100%; mask: url(/wedding/ornaments/toran-strip.svg) repeat-x 0 0 / auto 100%; filter: drop-shadow(0 3px 4px rgba(0,0,0,.35)); }
.fw-toran-strands { position: absolute; inset: 0; }
.fw-strand { position: absolute; top: clamp(10px, 2.4vw, 16px); width: 13px; margin-left: -6.5px; border-radius: 7px; background-color: #e2851d; background-size: 340px auto; background-repeat: repeat-y;
  -webkit-mask-image: linear-gradient(#000 78%, transparent); mask-image: linear-gradient(#000 78%, transparent); }
@keyframes fw-toran { from { transform: rotate(-.8deg); } to { transform: rotate(.8deg); } }

/* ── The gates ─────────────────────────────────────────── */
.fw-gate { position: fixed; inset: 0; z-index: 60; overflow: hidden; background: var(--wk-bg); transition: opacity .7s var(--fw-soft) 1.1s; }
.fw-gate.is-push { opacity: 0; pointer-events: none; }
.fw-gate.is-reduced.is-push { transition: opacity .4s linear; }
.fw-gate-world { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(8px, 2vh, 22px);
  padding: calc(clamp(46px, 11vw, 74px) + 40px) 16px max(18px, env(safe-area-inset-bottom)); transform-origin: 50% 40%; }
.fw-gate.is-push:not(.is-reduced) .fw-gate-world { transform: scale(1.9) translateY(6%); transition: transform 1.8s var(--fw-expo); }
.fw-gate-plate { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fw-gate-vignette { position: absolute; inset: 0; background: radial-gradient(90% 60% at 50% 42%, transparent 30%, color-mix(in srgb, var(--wk-bg) 70%, #000 10%) 100%); }
.fw-root:not([data-wk-dark]) .fw-gate-vignette { background: radial-gradient(90% 60% at 50% 42%, transparent 35%, color-mix(in srgb, var(--wk-bg) 75%, transparent) 100%); }
.fw-embers { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.fw-embers i { position: absolute; bottom: -8px; width: 4px; height: 4px; border-radius: 50%; background: radial-gradient(circle, #fff3c0, #f0b94a 55%, transparent 72%); animation: fw-ember linear infinite; opacity: 0; }
@keyframes fw-ember { 0% { transform: translate3d(0,0,0); opacity: 0; } 15% { opacity: .9; } 85% { opacity: .5; } 100% { transform: translate3d(var(--dx), -92vh, 0); opacity: 0; } }

.fw-gate-stage { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; margin-bottom: 18px; }
.fw-arch { position: relative; width: min(70vw, 360px, 44dvh); aspect-ratio: 3 / 4; perspective: 1200px; }
.fw-arch-frame { position: absolute; inset: -9% -10% -2%; width: auto !important; height: auto !important; aspect-ratio: auto !important; z-index: 3; filter: drop-shadow(0 6px 14px rgba(0,0,0,.4)); pointer-events: none; }
.fw-finial { position: absolute; left: 50%; top: -15%; z-index: 4; translate: -50% 0; filter: drop-shadow(0 3px 5px rgba(0,0,0,.35)); }
.fw-doors { position: absolute; inset: 7% 9% 0; display: flex; transform-style: preserve-3d; z-index: 2; }
.fw-door { position: relative; flex: 1 1 50%; height: 100%; transform-style: preserve-3d; transition: transform 2s var(--fw-silk); }
.fw-door-left { transform-origin: 0% 50%; }
.fw-door-right { transform-origin: 100% 50%; }
.fw-door-leaf { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; filter: drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
.fw-door-left .fw-door-leaf > * { clip-path: ${CLIP_L}; }
.fw-door-right .fw-door-leaf > * { clip-path: ${CLIP_R}; }
.fw-door-wood, .fw-door-face, .fw-door-studs { position: absolute; inset: 0; }
.fw-door-wood { background:
  repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 6px),
  linear-gradient(180deg, color-mix(in srgb, var(--fw-door) 86%, #fff 14%), var(--fw-door) 45%, color-mix(in srgb, var(--fw-door) 72%, #000)); }
.fw-door-left .fw-door-wood { box-shadow: inset -14px 0 18px -10px rgba(0,0,0,.6), inset 10px 0 14px -10px rgba(255,230,170,.18); }
.fw-door-right .fw-door-wood { box-shadow: inset 14px 0 18px -10px rgba(0,0,0,.6), inset -10px 0 14px -10px rgba(255,230,170,.18); }
.fw-door-jali { position: absolute; top: 31%; height: 25%; width: 52%; overflow: hidden; border-radius: 50% 50% 3px 3px / 26% 26% 3px 3px; background: #2a1c10; box-shadow: inset 0 0 0 2px var(--wk-gold), inset 0 0 12px rgba(0,0,0,.6); clip-path: none !important; }
.fw-door-left .fw-door-jali { left: 17%; }
.fw-door-right .fw-door-jali { right: 17%; }
.fw-door-jali img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%; transform: scale(1.5); opacity: .8; filter: sepia(1) saturate(1.7) brightness(.82) contrast(1.15); }
.fw-door-studs { background:
  radial-gradient(circle at 50% 50%, #fbe7ad 0 1.4px, #a87b2a 2px, rgba(0,0,0,.35) 2.6px, transparent 3.2px) left 9% top 38% / 12px 15px repeat-y,
  radial-gradient(circle at 50% 50%, #fbe7ad 0 1.4px, #a87b2a 2px, rgba(0,0,0,.35) 2.6px, transparent 3.2px) right 9% top 38% / 12px 15px repeat-y; }
.fw-door-face { color: var(--wk-gold); --w-door: transparent; }
.fw-door-face svg { display: block; width: 100%; height: 100%; }
.fw-door-ring { position: absolute; top: 74%; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #d9b45a; box-shadow: 0 2px 3px rgba(0,0,0,.55), inset 0 1px 1px rgba(255,255,255,.4); clip-path: none !important; }
.fw-door-ring::before { content: ""; position: absolute; left: 50%; top: -9px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #fff1c2, #c99a3c 60%, #6d4a10); }
.fw-door-left .fw-door-ring { right: 12%; }
.fw-door-right .fw-door-ring { left: 12%; }
.fw-gate.is-open .fw-door-left, .fw-gate.is-push .fw-door-left { transform: rotateY(-80deg); }
.fw-gate.is-open .fw-door-right, .fw-gate.is-push .fw-door-right { transform: rotateY(80deg); }

.fw-light { position: absolute; inset: 7% 9% 0; border-radius: 50% 50% 0 0 / 34% 34% 0 0; background: radial-gradient(60% 55% at 50% 60%, #fff, var(--fw-light) 35%, rgba(255,214,140,.6) 60%, rgba(255,190,110,0) 80%);
  opacity: .1; transform: scale(.9); transition: opacity 1.2s var(--fw-soft) .2s, transform 1.6s var(--fw-soft) .2s; z-index: 1; }
.fw-gate.is-open .fw-light, .fw-gate.is-push .fw-light { opacity: 1; transform: scale(1.9); }
.fw-rays { position: absolute; left: 50%; top: 52%; width: 220%; aspect-ratio: 1; margin: -110% 0 0 -110%; z-index: 1; border-radius: 50%; pointer-events: none; opacity: 0; transform: scale(1.2);
  background: repeating-conic-gradient(from 0deg, rgba(255,236,180,.42) 0 4deg, rgba(255,236,180,0) 4deg 15deg); -webkit-mask-image: radial-gradient(closest-side, #000 20%, transparent); mask-image: radial-gradient(closest-side, #000 20%, transparent);
  transition: opacity 1.6s var(--fw-soft) .2s, transform 1.6s var(--fw-soft) .2s; }
.fw-gate.is-open .fw-rays, .fw-gate.is-push .fw-rays { opacity: 1; transform: scale(1.6); }

/* The invocation: Ganesha (or the crest) glows in on the closed doors. */
.fw-invoke { position: absolute; left: 50%; top: 15%; width: 48%; z-index: 4; translate: -50% 0; display: flex; flex-direction: column; align-items: center; pointer-events: none; }
.fw-invoke-glow { position: absolute; left: 50%; top: 38%; width: 240%; aspect-ratio: 1; margin: -120% 0 0 -120%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,222,140,.62), rgba(255,200,100,.22) 45%, rgba(255,190,90,0)); opacity: 0; transform: scale(.7); }
.fw-ganesha { position: relative; width: 100%; height: auto; opacity: 0; transform: scale(.94); filter: drop-shadow(0 0 6px rgba(255,215,130,.55)); }
.fw-crest { position: relative; opacity: 0; transform: scale(.94); }
.fw-mantra { position: relative; margin: 8px 0 0; white-space: nowrap; font: 600 clamp(13px, 3.8vw, 17px)/1.3 var(--wk-font-deva); color: #fbe5a6; text-shadow: 0 1px 6px rgba(0,0,0,.7); opacity: 0; transform: translateY(10px); }
.fw-gate.is-invoke .fw-invoke-glow { opacity: .95; transform: none; transition: opacity 1.4s var(--fw-soft) .2s, transform 1.4s var(--fw-soft) .2s; }
.fw-gate.is-invoke .fw-ganesha, .fw-gate.is-invoke .fw-crest { opacity: 1; transform: none; transition: opacity 1.4s var(--fw-soft) .4s, transform 1.4s var(--fw-soft) .4s; }
.fw-gate.is-invoke .fw-mantra { opacity: 1; transform: none; transition: opacity .8s var(--fw-soft) 1.3s, transform .8s var(--fw-soft) 1.3s; }
.fw-gate.is-open .fw-invoke, .fw-gate.is-push .fw-invoke { opacity: 0; transition: opacity .6s var(--fw-soft); }
.fw-gate.is-open .fw-ganesha, .fw-gate.is-open .fw-crest, .fw-gate.is-open .fw-invoke-glow, .fw-gate.is-open .fw-mantra { opacity: 1; transform: none; }

/* The medallion on the seam: tap to enter. */
.fw-medal { position: absolute; left: 50%; top: 57%; width: clamp(86px, 25vw, 112px); aspect-ratio: 1; translate: -50% -50%; z-index: 5; border: 0; padding: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
  animation: fw-breathe 2.5s ease-in-out infinite; transition: opacity .5s var(--fw-soft) .25s; }
.fw-medal::before { content: ""; position: absolute; inset: 24%; border-radius: 50%; background: radial-gradient(circle at 36% 30%, #d9475a, var(--fw-ruby) 58%, #4e0b17); box-shadow: inset 0 0 0 2px rgba(255,220,150,.7), 0 4px 10px rgba(0,0,0,.5); }
.fw-medal-ring { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 4px 8px rgba(0,0,0,.45)); }
.fw-medal-ini { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; gap: 1px; font: 600 clamp(17px, 5vw, 22px)/1 var(--wk-font-caps); color: #f8e2a4; text-shadow: 0 1px 0 rgba(0,0,0,.4); }
.fw-medal-ini i { font: italic 400 .62em var(--wk-font-display); opacity: .9; }
.fw-medal:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 6px; border-radius: 50%; }
.fw-gate:not(.is-closed) .fw-medal { animation: fw-press .26s var(--fw-press) both; opacity: 0; pointer-events: none; }
@keyframes fw-breathe { 0%,100% { scale: 1; } 50% { scale: 1.035; } }
@keyframes fw-press { from { scale: .96; } to { scale: 1; } }

/* Diyas: the clay bowl (the art's baked glow cropped off) + a CSS flame. */
.fw-diyas { position: absolute; left: 50%; bottom: -6px; translate: -50% 0; width: min(96vw, 440px); display: flex; justify-content: space-between; align-items: flex-end; z-index: 5; pointer-events: none; }
.fw-diya { position: relative; display: block; align-self: flex-end; width: 62px; height: auto; margin-top: -48%; }
.fw-diya img { display: block; width: 100%; height: auto; clip-path: inset(63% 0 0 0); }
.fw-flame { position: absolute; left: 50%; top: 0; margin-top: 44%; width: 26%; aspect-ratio: 5 / 8; margin-left: -13%; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(50% 60% at 50% 72%, #fffbe6, #ffd76e 42%, #ff8a1f 78%, rgba(255,120,20,0)); transform-origin: 50% 92%; animation: fw-flicker 1.3s ease-in-out infinite alternate; }
.fw-flame::after { content: ""; position: absolute; left: 50%; top: 45%; width: 520%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,190,90,.34), rgba(255,170,60,0)); }
@keyframes fw-flicker { 0% { transform: scale(1, 1) rotate(-2deg); opacity: .9; } 45% { transform: scale(.93, 1.07) rotate(2deg); opacity: 1; } 100% { transform: scale(1.04, .94) rotate(-1deg); opacity: .95; } }

.fw-gate-copy { position: relative; z-index: 5; text-align: center; transition: opacity .5s; }
.fw-gate-copy::before { content: ""; position: absolute; inset: -30px -40px; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--wk-bg) 88%, transparent), color-mix(in srgb, var(--wk-bg) 55%, transparent) 65%, transparent); }
.fw-gate:not(.is-closed) .fw-gate-copy { opacity: 0; }
.fw-gate-names { margin: 0; font: 400 clamp(38px, 11vw, 64px)/1.1 var(--wk-font-script); padding: 0 .1em; filter: drop-shadow(0 2px 6px rgba(0,0,0,.35)); }
.fw-root:not([data-wk-dark]) .fw-gate-names, .fw-root:not([data-wk-dark]) .fw-court-n { filter: drop-shadow(0 1px 0 rgba(80,45,15,.35)); }
.fw-root:not([data-wk-dark]) .fw-court-in::before { background: radial-gradient(closest-side, color-mix(in srgb, var(--wk-surface-solid) 94%, transparent), color-mix(in srgb, var(--wk-surface-solid) 70%, transparent) 72%, transparent); }
.fw-root:not([data-wk-dark]) .fw-court-k { color: var(--wk-gold-ink); }
.fw-root:not([data-wk-dark]) .fw-court-wash { background:
  radial-gradient(70% 42% at 50% 40%, color-mix(in srgb, var(--wk-bg) 18%, transparent), color-mix(in srgb, var(--wk-bg) 55%, transparent) 100%),
  linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 50%, transparent), transparent 22%, transparent 62%, var(--wk-bg) 100%); }
.fw-gate-names span { font-size: .6em; }
.fw-gate-date { margin: 4px 0 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .34em; color: var(--wk-ink); }
.fw-gate-cta { position: relative; margin-top: 14px; min-height: 48px; padding: 0 24px; border-radius: 999px; border: 1px solid var(--wk-gold); background: var(--wk-surface-solid); color: var(--wk-gold-ink); font: 600 14px/1 var(--wk-font-sans); letter-spacing: .04em; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,.25); }
.fw-gate-cta::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; border: 1px solid var(--wk-gold); animation: fw-ring 2.4s var(--fw-soft) infinite; pointer-events: none; }
@keyframes fw-ring { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(1.18, 1.5); opacity: 0; } }
.fw-gate-petals { position: absolute; inset: 0; z-index: 8; pointer-events: none; }
.fw-gate-petals .wk-burst { position: absolute; left: 0; right: 0; top: 0; height: 80%; }
@media (max-height: 560px) {
  .fw-gate-world { flex-direction: row; gap: 28px; padding-top: 60px; }
  .fw-arch { width: min(34vw, 44dvh); }
  .fw-diyas { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 130%; }
}

/* Devanagari breaks under letter-spacing: Hindi mode sets it to zero on the spaced-caps lines. */
.fw-root.is-hi .wk-eyebrow, .fw-root.is-hi .fw-cartouche, .fw-root.is-hi .wk-ev-date, .fw-root.is-hi .wk-ev-k, .fw-root.is-hi .fw-count-line, .fw-root.is-hi .wk-cd-label, .fw-root.is-hi .fw-f-k, .fw-root.is-hi .fw-scroll-cue b { letter-spacing: 0 !important; }

/* ── Language toggle ───────────────────────────────────── */
.fw-lang { position: fixed; z-index: 55; top: max(10px, env(safe-area-inset-top)); left: 12px; display: flex; padding: 3px; border-radius: 999px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
.fw-lang button { min-width: 44px; min-height: 38px; padding: 0 10px; border: 0; border-radius: 999px; background: none; color: var(--wk-muted); font: 600 13px/1 var(--wk-font-sans); cursor: pointer; }
.fw-lang button[aria-pressed=true] { background: var(--wk-accent); color: var(--wk-accent-ink); }

/* ── The courtyard (hero) ──────────────────────────────── */
.fw-court { --fw-hy: 0px; position: relative; min-height: 100svh; overflow: hidden; isolation: isolate; display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(64px, 10vh, 96px) 16px 150px; }
.fw-court-back { position: absolute; inset: 0; z-index: -1; overflow: hidden; translate: 0 calc(var(--fw-hy) * .75); }
.fw-court-scene { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.25); transition: transform 2.2s var(--fw-expo); }
.fw-court.is-open .fw-court-scene { transform: scale(1.04); }
.fw-court-wash { position: absolute; inset: 0; background:
  radial-gradient(70% 42% at 50% 40%, color-mix(in srgb, var(--wk-bg) 30%, transparent), color-mix(in srgb, var(--wk-bg) 72%, transparent) 100%),
  linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 60%, transparent), transparent 22%, transparent 62%, var(--wk-bg) 100%); }
.fw-court-mandala { position: absolute; left: 50%; top: 40%; width: min(150vw, 980px); aspect-ratio: 1; translate: -50% -50%; opacity: .16; animation: fw-spin 150s linear infinite; }
.fw-root:not([data-wk-dark]) .fw-court-mandala { opacity: .12; }
.fw-court-mandala img { width: 100%; height: 100%; object-fit: contain; }
@keyframes fw-spin { to { rotate: 360deg; } }

.fw-court-arch { position: relative; z-index: 2; width: min(124vw, 600px, 66svh); aspect-ratio: 1; flex: none; margin-top: -1vh; translate: 0 calc(var(--fw-hy) * .45); }
.fw-court-frame { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 8px 18px rgba(0,0,0,.35)); opacity: 0; transform: translateY(40px); transition: opacity 1.4s var(--fw-soft) .2s, transform 1.4s var(--fw-soft) .2s; }
.fw-court-in { position: absolute; left: 22%; right: 22%; top: 26%; bottom: 14%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.fw-court-in::before { content: ""; position: absolute; inset: -6% -14%; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--wk-bg) 82%, transparent), color-mix(in srgb, var(--wk-bg) 50%, transparent) 70%, transparent); opacity: 0; transition: opacity 1.4s var(--fw-soft) .4s; }
.fw-court-crest { min-height: 72px; display: grid; place-items: center; }
.fw-portrait { display: block; width: clamp(64px, 17vw, 96px); aspect-ratio: 1; border-radius: 50%; padding: 3px; background: var(--wk-foil); box-shadow: 0 6px 18px rgba(0,0,0,.35); }
.fw-portrait img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.fw-court-k { margin: 8px 0 0; }
.fw-court-names { position: relative; margin: 2px 0 0; display: flex; flex-direction: column; align-items: center; font: 400 clamp(38px, min(11.5vw, 8svh), 76px)/1.04 var(--wk-font-script); }
.fw-court-n { padding: 0 .14em; max-width: 100%; overflow-wrap: anywhere; }
.fw-amp { font: italic 400 clamp(17px, 4.4vw, 26px)/1.3 var(--wk-font-display); color: var(--wk-gold-ink); }
.fw-court-in > * { opacity: 0; transform: translateY(14px); transition: opacity 1s var(--fw-soft), transform 1s var(--fw-soft); }
.fw-court-names > * { opacity: 0; transform: translateY(14px) scale(.98); transition: opacity 1s var(--fw-soft), transform 1s var(--fw-soft); }

.fw-jhoomar { position: absolute; top: 0; z-index: 3; width: clamp(58px, 17vw, 110px); display: flex; flex-direction: column; align-items: center; transform-origin: 50% 0; translate: 0 -40px; opacity: 0;
  transition: translate 1.2s var(--fw-soft) 1.1s, opacity 1s var(--fw-soft) 1.1s; animation: fw-sway 6s ease-in-out infinite alternate; }
.fw-jhoomar i { display: block; width: 2px; height: clamp(70px, 14vh, 130px); background: linear-gradient(var(--wk-gold), color-mix(in srgb, var(--wk-gold) 60%, #000)); }
.fw-jhoomar img { display: block; width: 100%; height: auto; margin-top: -2px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.35)); }
.fw-jhoomar-l { left: 3%; }
.fw-jhoomar-r { right: 3%; animation-delay: -2.4s; animation-duration: 7s; }
@keyframes fw-sway { from { rotate: -1.4deg; } to { rotate: 1.4deg; } }

.fw-peacock { position: absolute; z-index: 3; top: min(38svh, 46%); width: clamp(104px, 31vw, 190px); opacity: 0; translate: 0 10px; transition: opacity 1s var(--fw-soft) 1s, translate 1s var(--fw-soft) 1s; }
.fw-peacock img { display: block; width: 100%; height: auto; filter: drop-shadow(0 6px 10px rgba(0,0,0,.3)); }
.fw-peacock-l { left: -6%; }
.fw-peacock-r { right: -6%; scale: -1 1; }

.fw-court-meta { position: relative; z-index: 4; margin-top: -3%; display: flex; flex-direction: column; align-items: center; gap: 6px; translate: 0 calc(var(--fw-hy) * .3); }
.fw-court-meta > * { opacity: 0; transform: translateY(12px) scaleX(.96); transition: opacity .8s var(--fw-soft) 2.2s, transform .8s var(--fw-soft) 2.2s; }
.fw-cartouche { margin: 0; display: inline-flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 26px 11px; border-radius: 999px; background: var(--wk-surface-solid);
  box-shadow: 0 0 0 1px var(--wk-gold), 0 0 0 4px var(--wk-surface-solid), 0 0 0 5px color-mix(in srgb, var(--wk-gold) 70%, transparent), 0 10px 24px rgba(0,0,0,.28); }
.fw-cartouche span { font: 600 clamp(11.5px, 3.1vw, 14px)/1.4 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-cartouche small { font: italic 500 15px/1.2 var(--wk-font-display); color: var(--wk-ink); }
.fw-court-muhurat, .fw-court-venue { margin: 0; max-width: 32ch; font: 500 14.5px/1.45 var(--wk-font-sans); color: var(--wk-ink); text-shadow: 0 1px 8px var(--wk-bg); }
.fw-court-muhurat { font: italic 500 17px/1.4 var(--wk-font-display); color: var(--wk-gold-ink); margin-top: 4px; }

.fw-eleph { position: absolute; z-index: 4; bottom: 34px; width: clamp(150px, 43vw, 320px); opacity: 0; transition: translate 1.8s var(--fw-silk) .4s, opacity 1.2s var(--fw-soft) .4s; translate: 0 calc(var(--fw-hy) * .2); }
.fw-eleph img { display: block; width: 100%; height: auto; transform-origin: 50% 100%; animation: fw-idle 4.5s ease-in-out infinite alternate; filter: drop-shadow(0 8px 10px rgba(0,0,0,.35)); }
.fw-eleph-l { left: -13%; scale: -1 1; translate: -60% 0; }
.fw-eleph-r { right: -13%; translate: 60% 0; }
.fw-eleph-r img { animation-duration: 3.2s; animation-delay: -1.1s; }
@keyframes fw-idle { from { transform: translateY(0) rotate(-.5deg); } to { transform: translateY(-2px) rotate(.5deg); } }

.fw-parapet { position: absolute; left: 0; right: 0; bottom: 0; z-index: 5; height: 54px; display: flex; justify-content: space-evenly; align-items: flex-start; padding: 0 6%;
  background: radial-gradient(circle at 50% 100%, transparent 8px, color-mix(in srgb, var(--wk-gold) 80%, transparent) 8.5px 9.5px, transparent 10px) 0 10px / 22px 14px repeat-x,
    linear-gradient(180deg, color-mix(in srgb, var(--wk-gold) 85%, #000) 0 2px, color-mix(in srgb, var(--wk-bg2) 92%, #000) 2px, var(--wk-bg) 100%);
  box-shadow: 0 -8px 20px rgba(0,0,0,.25); translate: 0 30px; opacity: 0; transition: translate 1.2s var(--fw-soft) .7s, opacity 1s var(--fw-soft) .7s; }
.fw-diya-sm { width: 46px; margin-top: -30px; }
.fw-diya-sm .fw-flame { opacity: 0; scale: 1 .4; transition: opacity .4s var(--fw-soft), scale .4s var(--fw-soft); transition-delay: calc(1.3s + var(--i) * .1s); }

.fw-dust { position: absolute; inset: 0; z-index: 6; pointer-events: none; }
.fw-dust i { position: absolute; border-radius: 50%; background: radial-gradient(circle, #fff7d6, #e8c46a 50%, transparent 72%); opacity: 0; animation: fw-dust linear infinite; }
@keyframes fw-dust { 0% { transform: translate3d(0,0,0); opacity: 0; } 20% { opacity: .9; } 80% { opacity: .6; } 100% { transform: translate3d(var(--dx), -160px, 0); opacity: 0; } }

.fw-scroll-cue { position: absolute; z-index: 6; left: 50%; bottom: 66px; translate: -50% 0; display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: 0; transition: opacity 1s var(--fw-soft) 2.8s; pointer-events: none; }
.fw-scroll-cue b { font: 600 10.5px/1 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; color: var(--wk-gold-ink); text-shadow: 0 1px 6px var(--wk-bg); }
.fw-bell { display: block; width: 16px; height: 18px; border-radius: 50% 50% 18% 18% / 70% 70% 20% 20%; background: linear-gradient(90deg, #8a6420, #f6dc9a 45%, #b8892f); transform-origin: 50% -6px; animation: fw-bell 2s ease-in-out infinite alternate; position: relative; }
.fw-bell::before { content: ""; position: absolute; left: 50%; top: -8px; width: 1px; height: 8px; background: var(--wk-gold); }
@keyframes fw-bell { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }

/* The entrance (when the gates have opened). */
.fw-court.is-open .fw-court-frame, .fw-court.is-open .fw-court-in > *, .fw-court.is-open .fw-court-names > *, .fw-court.is-open .fw-court-meta > * { opacity: 1; transform: none; }
.fw-court.is-open .fw-court-in::before { opacity: 1; }
.fw-court.is-open .fw-court-in > :nth-child(1) { transition-delay: 1s; }
.fw-court.is-open .fw-court-in > :nth-child(2) { transition-delay: 1.3s; }
.fw-court.is-open .fw-court-in > :nth-child(3) { transition-delay: 1.5s; }
.fw-court.is-open .fw-court-names > :nth-child(1) { transition-delay: 1.5s; }
.fw-court.is-open .fw-court-names > :nth-child(2) { transition-delay: 1.9s; }
.fw-court.is-open .fw-court-names > :nth-child(3) { transition-delay: 2.1s; }
.fw-court.is-open .fw-jhoomar, .fw-court.is-open .fw-peacock, .fw-court.is-open .fw-parapet { opacity: 1; translate: 0 0; }
.fw-court.is-open .fw-eleph { opacity: 1; translate: 0 calc(var(--fw-hy) * .2); }
.fw-court.is-open .fw-eleph-l { translate: 0 calc(var(--fw-hy) * .2); }
.fw-court.is-open .fw-parapet { translate: 0 calc(var(--fw-hy) * -.2); }
.fw-court.is-open .fw-diya-sm .fw-flame { opacity: 1; scale: 1 1; }
.fw-court.is-open .fw-scroll-cue { opacity: 1; }
.fw-court.is-idle *, .fw-court.is-idle *::after, .fw-court.is-idle *::before,
.fw-court:not(.is-open) *, .fw-court:not(.is-open) *::after, .fw-court:not(.is-open) *::before { animation-play-state: paused !important; }
@media (min-width: 900px) {
  .fw-court-arch { width: min(600px, 64svh); }
  .fw-eleph { bottom: 30px; }
  .fw-eleph-l { left: 2%; } .fw-eleph-r { right: 2%; }
  .fw-peacock-l { left: 12%; } .fw-peacock-r { right: 12%; }
  .fw-peacock { top: 38%; }
  .fw-jhoomar-l { left: 18%; } .fw-jhoomar-r { right: 18%; }
}
@media (max-height: 560px) { .fw-court-arch { width: min(80vw, 88svh); } .fw-peacock, .fw-scroll-cue { display: none; } }

/* ── Invitation ─────────────────────────────────────────── */
.fw-invite { padding: clamp(28px, 6vw, 56px) clamp(18px, 5vw, 56px); }

/* ── Families inside a Mughal manuscript border (hashiya) ── */
.fw-hashiya { position: relative; max-width: 760px; margin: 0 auto; }
.fw-hashiya-frame { position: relative; border-style: solid; border-width: 40px 38px 34px 26px; border-image-source: ${BORDER}; border-image-slice: 196 211 161 84; border-image-repeat: round;
  border-radius: 4px; box-shadow: 0 18px 40px rgba(0,0,0,.28); clip-path: inset(5px 5px 5px 8px round 4px); margin: -5px -5px -5px -8px; }
.fw-hashiya-in { background: var(--wk-surface-solid); padding: clamp(22px, 5vw, 40px) clamp(12px, 3.6vw, 36px); box-shadow: inset 0 0 0 1px var(--wk-gold), inset 0 0 0 5px var(--wk-surface-solid), inset 0 0 0 6px color-mix(in srgb, var(--wk-gold) 60%, transparent); }
@media (min-width: 640px) { .fw-hashiya-frame { border-width: 58px 56px 48px 38px; clip-path: inset(7px 7px 7px 12px round 4px); margin: -7px -7px -7px -12px; } }
.fw-band { display: block; height: 58px; margin: 0 -2px; background-image: ${VINES}; background-size: 122% auto; background-position: 50% 50%; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 80%, transparent), 0 6px 16px rgba(0,0,0,.2); border-radius: 3px; }
.fw-band-top { margin-bottom: 14px; }
.fw-band-bottom { margin-top: 14px; background-position: 50% 30%; }
@supports (animation-timeline: view()) {
  .fw-band-top { animation: fw-band-l linear both; animation-timeline: view(); animation-range: entry 0% entry 70%; }
  .fw-band-bottom { animation: fw-band-r linear both; animation-timeline: view(); animation-range: entry 0% entry 70%; }
}
@keyframes fw-band-l { from { transform: translateX(-100%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes fw-band-r { from { transform: translateX(100%); opacity: 0; } to { transform: none; opacity: 1; } }
.fw-blessings-of { text-align: center; margin: 0 auto 22px; max-width: 560px; }
.fw-blessings-names { margin: 0; font: italic 400 clamp(19px, 4.4vw, 24px)/1.45 var(--wk-font-display); }

/* ── The farmaan ───────────────────────────────────────── */
.fw-farmaan { position: relative; max-width: 400px; margin: 0 auto; padding: 0 14px; }
.fw-rod { position: relative; z-index: 3; display: block; height: 24px; margin: 0 -14px; border-radius: 12px; background: linear-gradient(180deg, #6d4a10, #f9e6a8 32%, #c9962e 58%, #5d3d0b); box-shadow: 0 6px 12px rgba(0,0,0,.35); }
.fw-rod::before, .fw-rod::after { content: ""; position: absolute; top: 50%; width: 30px; height: 30px; margin-top: -15px; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #fff1c2, #d9a640 55%, #6d4a10); box-shadow: 0 3px 6px rgba(0,0,0,.4); }
.fw-rod::before { left: -16px; } .fw-rod::after { right: -16px; }
.fw-scroll-body { position: relative; margin: -8px 0 0; }
.fw-scroll-paper { position: relative; padding: 38px 24px 128px; text-align: center; color: #4a2c12; background: linear-gradient(180deg, rgba(222,178,98,.34), rgba(205,150,70,.26) 50%, rgba(190,130,55,.38)), ${PAPER} center / cover, #f3e6c4;
  box-shadow: inset 0 0 0 1px rgba(150,105,35,.35), inset 0 0 0 7px rgba(255,248,230,.0), inset 0 0 0 8px rgba(150,105,35,.45), inset 0 0 50px rgba(140,90,20,.28);
  clip-path: inset(0 0 100% 0); transition: clip-path 1.5s var(--fw-silk); }
.fw-farmaan.is-open .fw-scroll-paper, .fw-farmaan.is-sealed .fw-scroll-paper { clip-path: inset(0 0 0 0); }
.fw-rod-track { position: absolute; left: 0; right: 0; top: 0; height: 100%; transform: translateY(-100%); transition: transform 1.5s var(--fw-silk); pointer-events: none; z-index: 3; }
.fw-rod-bottom { position: absolute; left: 0; right: 0; bottom: -12px; }
.fw-farmaan.is-open .fw-rod-track, .fw-farmaan.is-sealed .fw-rod-track { transform: none; }
.fw-f-k { margin: 0 auto; max-width: 26ch; font: 500 11px/1.6 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: #8a5a1c; }
.fw-f-weekday { margin: 18px 0 0; font: italic 500 22px/1.2 var(--wk-font-display); }
.fw-f-day { margin: 2px 0 0; font: 600 clamp(84px, 26vw, 120px)/1 var(--wk-font-caps); background-image: linear-gradient(180deg, #d9a640, #8a5a12 60%, #5d3d0b); -webkit-text-fill-color: transparent; }
.fw-f-month { margin: 4px 0 0; font: 600 18px/1.3 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; }
.fw-f-month span { color: #8a5a1c; }
.fw-f-time { margin: 16px 0 0; font: 500 16px/1.4 var(--wk-font-sans); }
.fw-f-muhurat { margin: 4px 0 0; font: italic 500 19px/1.4 var(--wk-font-display); color: #7a2a1a; }
.fw-f-venue { margin: 14px auto 0; max-width: 28ch; padding-top: 14px; border-top: 1px solid rgba(150,105,35,.4); font: 500 16px/1.45 var(--wk-font-display); }
.fw-mohar { position: absolute; left: 50%; bottom: 18px; width: 92px; margin-left: -46px; aspect-ratio: 1; opacity: 0; transform: scale(1.6) rotate(-20deg); transition: opacity .3s, transform .5s var(--fw-press); }
.fw-mohar img { position: absolute; inset: 0; width: 100%; height: 100%; }
.fw-mohar b { position: absolute; inset: 24%; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: radial-gradient(circle at 36% 30%, #d9475a, var(--fw-ruby) 58%, #4e0b17); color: #f8e2a4; font: 600 15px/1 var(--wk-font-caps); box-shadow: inset 0 0 0 1.5px rgba(255,220,150,.7); }
.fw-mohar b i { font: italic 400 .7em var(--wk-font-display); }
.fw-farmaan.is-sealed .fw-mohar { opacity: 1; transform: rotate(-8deg); }

/* ── Story ─────────────────────────────────────────────── */
.fw-story { --fw-p: 0; position: relative; padding: 8px 0; }
.fw-story-rail { position: absolute; top: 0; bottom: 0; left: 22px; width: 2px; background: var(--wk-border); }
.fw-story-rail i { position: absolute; inset: 0; background: var(--wk-foil); transform-origin: top; transform: scaleY(var(--fw-p)); }
.fw-drift { position: absolute; pointer-events: none; opacity: .14; z-index: 0; }
.fw-drift-a { right: -30px; top: 6%; transform: translate3d(0, calc(var(--fw-p) * -160px), 0); }
.fw-drift-b { left: -20px; bottom: 8%; transform: translate3d(0, calc(var(--fw-p) * 120px), 0) rotate(-12deg); }
.fw-chapters { list-style: none; margin: 0; padding: 0; position: relative; z-index: 1; display: grid; gap: clamp(36px, 7vw, 72px); }
.fw-ch { position: relative; padding-left: 58px; display: grid; gap: 16px; }
.fw-ch-dot { position: absolute; left: 9px; top: 2px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: var(--wk-surface-solid); box-shadow: 0 0 0 4px var(--wk-bg); }
.fw-ch-photo { width: min(100%, 360px); aspect-ratio: 4 / 5; border-radius: 999px 999px 18px 18px / 320px 320px 18px 18px; overflow: hidden; padding: 3px; background: var(--wk-foil); box-shadow: var(--wk-shadow); }
.fw-ch-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block; }
.fw-ch-when { margin: 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .3em; color: var(--wk-gold-ink); }
.fw-ch-title { margin: 6px 0 0; font: 500 clamp(26px, 5.6vw, 36px)/1.15 var(--wk-font-display); }
.fw-ch-line { margin: 10px 0 0; font: 400 clamp(18px, 4vw, 21px)/1.6 var(--wk-font-display); color: var(--wk-muted); max-width: 46ch; }
@media (min-width: 860px) {
  .fw-story-rail { left: 50%; margin-left: -1px; }
  .fw-ch { padding-left: 0; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .fw-ch-dot { left: 50%; margin-left: -14px; top: 50%; margin-top: -14px; }
  .fw-ch-photo { justify-self: end; }
  .fw-ch.is-alt .fw-ch-photo { order: 2; justify-self: start; }
  .fw-ch.is-alt .fw-ch-text { text-align: right; justify-self: end; }
  .fw-ch.is-alt .fw-ch-line { margin-left: auto; }
  .fw-ch.no-photo .fw-ch-text { grid-column: 2; }
  .fw-ch.no-photo.is-alt .fw-ch-text { grid-column: 1; }
}

/* ── Functions: illustrated panels ─────────────────────── */
.fw-ev-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 26px; grid-template-columns: 1fr; }
@media (min-width: 760px) { .fw-ev-list { grid-template-columns: 1fr 1fr; gap: 30px; } }
.fw-ev-card { position: relative; height: 100%; padding: 10px 10px 22px; border-radius: 999px 999px 20px 20px / 190px 190px 20px 20px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); text-align: center; }
.fw-ev-art { position: relative; height: clamp(170px, 46vw, 220px); border-radius: inherit; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 3px; background: var(--wk-foil); }
.fw-ev-art::after { content: ""; position: absolute; inset: 3px; border-radius: inherit; box-shadow: inset 0 -30px 40px -20px rgba(0,0,0,.35); pointer-events: none; }
.fw-ev-win { display: block; width: 100%; height: 100%; overflow: hidden; border-radius: 999px 999px 10px 10px / 186px 186px 10px 10px; }
.fw-ev-img { display: block; width: 100%; height: 100%; }
.fw-ev-art.is-paint .fw-ev-img { object-fit: cover; object-position: 50% 40%; }
.fw-ev-art.is-line .fw-ev-img { object-fit: contain; padding: 26px 22px 14px; background: radial-gradient(70% 70% at 50% 60%, color-mix(in srgb, var(--wk-accent) 26%, var(--wk-surface-solid)), var(--wk-surface-solid)); }
.fw-ev-gif { position: absolute; left: 50%; bottom: 6px; width: 62%; max-width: 170px; height: auto; translate: -50% 0; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,246,222,.94), rgba(255,246,222,.75) 70%, rgba(255,246,222,0)); }
.fw-ev-no { position: absolute; left: 50%; top: calc(clamp(170px, 46vw, 220px) - 8px); translate: -50% 0; z-index: 2; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; background: var(--wk-foil); color: #3a2208; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .06em; box-shadow: 0 0 0 4px var(--wk-surface-solid), 0 6px 12px rgba(0,0,0,.3); }
.fw-ev-body { padding: 36px 12px 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.fw-ev-body .wk-ev-date { margin: 0; }
.fw-ev-title { margin: 0; font: 600 clamp(24px, 6vw, 30px)/1.15 var(--wk-font-caps); letter-spacing: .04em; color: var(--wk-gold-ink); }
.fw-ev-line { margin: 0; display: flex; align-items: flex-start; justify-content: center; gap: 8px; font: 400 15.5px/1.5 var(--wk-font-sans); color: var(--wk-ink); text-align: left; }
.fw-ev-line svg { flex: none; margin-top: 3px; color: var(--wk-gold-ink); }
.fw-ev-line b { display: block; font-weight: 600; }
.fw-ev-addr { display: block; color: var(--wk-muted); font-size: 14px; }
.fw-ev-dress { align-items: center; }
.fw-ev-swatch { flex: none; width: 18px; height: 18px; border-radius: 50%; box-shadow: 0 0 0 2px var(--wk-surface-solid), 0 0 0 3px var(--wk-gold); }
.fw-ev-note { margin: 2px 0 0; font: italic 400 17px/1.5 var(--wk-font-display); color: var(--wk-muted); max-width: 34ch; }
.fw-ev-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 8px; }
.fw-ev-all { display: flex; justify-content: center; margin-top: 30px; }

/* ── Venue ─────────────────────────────────────────────── */
.fw-venue { display: grid; gap: 22px; justify-items: center; text-align: center; }
.fw-venue-arch { position: relative; width: min(100%, 520px); aspect-ratio: 4 / 3.6; padding: 4px; border-radius: 999px 999px 18px 18px / 58% 58% 18px 18px; background: var(--wk-foil); box-shadow: var(--wk-shadow); }
.fw-venue-img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
.fw-venue-tw { position: absolute; inset: 4px; z-index: 1; width: calc(100% - 8px); height: calc(100% - 8px); pointer-events: none; }
.fw-venue-tw circle { fill: #ffd98a; opacity: .15; animation: fw-twinkle 2s ease-in-out infinite alternate; animation-play-state: paused; }
.fw-venue.is-on .fw-venue-tw circle { animation-play-state: running; }
@keyframes fw-twinkle { from { opacity: .1; } to { opacity: .95; } }
.fw-venue-glow { position: absolute; inset: 4px; border-radius: 999px 999px 14px 14px / 58% 58% 14px 14px; background: linear-gradient(180deg, transparent 55%, rgba(30,10,0,.35)); pointer-events: none; }
.fw-root[data-wk-dark] .fw-venue-glow { background: linear-gradient(180deg, rgba(38,16,64,.55), rgba(120,52,24,.28) 50%, rgba(24,8,0,.5)); }
.fw-root:not([data-wk-dark]) .fw-venue-tw { display: none; }
.fw-venue-text { display: grid; gap: 8px; justify-items: center; }
.fw-venue-name { margin: 0; font: 600 clamp(26px, 6.4vw, 38px)/1.15 var(--wk-font-caps); letter-spacing: .03em; padding: 0 .1em; }
.fw-venue-addr { margin: 0 0 8px; max-width: 34ch; font: 400 16px/1.55 var(--wk-font-sans); color: var(--wk-muted); }

/* ── Countdown in a gold medallion ─────────────────────── */
.fw-count { text-align: center; overflow: hidden; }
.fw-medallion { position: relative; width: min(96vw, 460px); aspect-ratio: 1; margin: 0 auto; display: grid; place-items: center; }
.fw-medallion-ring { position: absolute; inset: 0; animation: fw-spin 120s linear infinite; }
.fw-medallion-ring img { display: block; width: 100%; height: 100%; filter: drop-shadow(0 10px 20px rgba(0,0,0,.35)); }
.fw-medallion-disc { position: absolute; inset: 19%; border-radius: 50%; background: radial-gradient(circle at 50% 40%, var(--wk-surface-solid), color-mix(in srgb, var(--wk-bg) 80%, #000 6%)); box-shadow: inset 0 0 0 1px var(--wk-gold), inset 0 0 30px rgba(0,0,0,.3); }
.fw-medallion-in { position: relative; z-index: 1; }
.fw-medallion .wk-countdown { gap: 4px !important; }
.fw-medallion .wk-flip, .fw-medallion .wk-roll { min-width: clamp(40px, 11vw, 58px); height: clamp(50px, 13vw, 68px); font-size: clamp(25px, 6.6vw, 36px); border-radius: 10px; }
.fw-medallion .wk-flip-up { border-radius: 10px 10px 0 0; } .fw-medallion .wk-flip-down { border-radius: 0 0 10px 10px; }
.fw-medallion .wk-cd-sep { padding-top: clamp(10px, 3vw, 16px); font-size: clamp(18px, 4.6vw, 24px); }
.fw-medallion .wk-cd-label { font-size: 8.5px; letter-spacing: .18em; }
.fw-medallion .wk-cd-unit { gap: 6px; }
.fw-count-line { margin: 18px 0 0; font: italic 400 20px/1.4 var(--wk-font-display); color: var(--wk-gold-ink); }

/* ── Film ──────────────────────────────────────────────── */
.fw-film { position: relative; aspect-ratio: 16 / 9; border-radius: 18px; overflow: hidden; background: #000; box-shadow: var(--wk-shadow); }
.fw-film iframe, .fw-film-poster { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.fw-film-poster { padding: 0; cursor: pointer; background: #000; }
.fw-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .82; }
.fw-film-play { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; margin: -36px 0 0 -36px; display: grid; place-items: center; border-radius: 50%; background: var(--wk-foil); color: #3a0913; box-shadow: 0 10px 30px rgba(0,0,0,.5); transition: transform .3s var(--fw-ease); }
.fw-film-poster:hover .fw-film-play { transform: scale(1.08); }
.fw-film-label { position: absolute; left: 0; right: 0; bottom: 14px; color: #fff; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; text-shadow: 0 1px 6px rgba(0,0,0,.6); }

/* ── Good to know ─────────────────────────────────────── */
.fw-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: 1fr; }
@media (min-width: 640px) { .fw-know { grid-template-columns: 1fr 1fr; } .fw-know-wide { grid-column: 1 / -1; } }
.fw-know-i { padding: 20px 22px; }
.fw-know-h { margin: 0 0 6px; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-know-t { margin: 0; font: 400 17px/1.6 var(--wk-font-sans); color: var(--wk-ink); }

/* ── RSVP ─────────────────────────────────────────────── */
.fw-upasthiti { margin: -6px auto 20px; text-align: center; font: italic 500 clamp(19px, 4.6vw, 23px)/1.4 var(--wk-font-display); color: var(--wk-gold-ink); }
.fw-reply-by { text-align: center; margin: -10px 0 18px; font: 500 12px/1.5 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.fw-rsvp { padding: clamp(22px, 5vw, 40px); }

/* ── Finale: the gates close on "Shubh Vivah" ─────────── */
.fw-finale { position: relative; overflow: hidden; isolation: isolate; text-align: center; padding: clamp(70px, 12vw, 120px) 16px 0; background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--wk-bg) 40%, #000) 100%); }
.fw-root:not([data-wk-dark]) .fw-finale { background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--wk-bg2) 85%, var(--wk-accent)) 100%); }
.fw-finale-in { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 4px; padding-bottom: 20px; }
.fw-close { position: relative; margin: 30px 0 40px; }
.fw-arch-sm { width: min(58vw, 250px); }
.fw-close .fw-door { transition: transform 1.4s var(--fw-silk); }
.fw-close .fw-door-left { transform: rotateY(-80deg); }
.fw-close .fw-door-right { transform: rotateY(80deg); }
.fw-close.is-closed .fw-door { transform: none; }
.fw-close .fw-light { opacity: 1; transform: scale(1.2); transition: opacity 1.4s var(--fw-soft), transform 1.4s var(--fw-soft); }
.fw-close.is-closed .fw-light { opacity: .12; transform: scale(.9); }
.fw-close-seal { position: absolute; left: 50%; top: 56%; z-index: 4; margin: 0; translate: -50% -50%; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 14px; border-radius: 50%; aspect-ratio: 1; justify-content: center;
  background: radial-gradient(circle at 36% 30%, #d9475a, var(--fw-ruby) 58%, #4e0b17); box-shadow: 0 0 0 3px #d9b45a, 0 0 0 6px rgba(0,0,0,.25), 0 10px 24px rgba(0,0,0,.45); color: #f8e2a4;
  opacity: 0; scale: 1.4; transition: opacity .5s var(--fw-soft) 1.2s, scale .5s var(--fw-press) 1.2s; }
.fw-close.is-closed .fw-close-seal { opacity: 1; scale: 1; }
.fw-close-seal b { font: 600 19px/1.1 var(--wk-font-deva); white-space: nowrap; }
.fw-close-seal small { font: 600 8.5px/1.3 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; white-space: nowrap; }
.fw-close-petals { position: absolute; left: -40%; right: -40%; top: -20%; bottom: 0; pointer-events: none; z-index: 6; }
.fw-close-petals .wk-burst { position: absolute; inset: 0; }
.fw-finale-names { margin: 0; font: 400 clamp(46px, 12vw, 88px)/1.1 var(--wk-font-script); padding: 0 .1em; }
.fw-finale-names span { font-size: .55em; }
.fw-finale-line { margin: 10px auto 0; max-width: 520px; font: italic 400 clamp(18px, 4vw, 22px)/1.5 var(--wk-font-display); color: var(--wk-ink); }
.fw-hashtag { margin: 8px 0 0; font: 600 14px/1.4 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-gold-ink); }
.fw-wa { margin-top: 22px; }
.fw-palace { position: relative; z-index: 1; display: flex; justify-content: center; margin-top: 26px; opacity: .9; padding-bottom: max(14px, env(safe-area-inset-bottom)); }
.fw-lanterns { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.fw-lantern { position: absolute; bottom: -60px; display: block; border-radius: 40% 40% 22% 22% / 50% 50% 18% 18%;
  background: radial-gradient(60% 55% at 50% 62%, #fff4cc, #ffc861 45%, #f08a2a 85%); box-shadow: 0 0 18px 6px rgba(255,170,70,.4); opacity: 0;
  animation-name: fw-rise, fw-lsway; animation-timing-function: linear, ease-in-out; animation-iteration-count: infinite, infinite; animation-direction: normal, alternate; animation-play-state: paused, paused; }
.fw-finale.is-on .fw-lantern { animation-play-state: running, running; }
@keyframes fw-rise { 0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; } 8% { opacity: .75; } 80% { opacity: .65; } 100% { transform: translate3d(0, -115vh, 0) scale(.55); opacity: 0; } }
@keyframes fw-lsway { from { translate: calc(var(--sway) * -1) 0; } to { translate: var(--sway) 0; } }

/* Low-end phones: no particles, no parallax, fewer loops. */
.fw-root.is-lite .fw-embers, .fw-root.is-lite .fw-dust, .fw-root.is-lite .fw-sweep { display: none; }
.fw-root.is-lite .fw-court-mandala, .fw-root.is-lite .fw-medallion-ring, .fw-root.is-lite .fw-toran { animation: none; }
.fw-root.is-lite .fw-court { --fw-hy: 0px !important; }

@media (prefers-reduced-motion: reduce) {
  .fw-toran, .fw-medal, .fw-gate-cta::after, .fw-flame, .fw-embers i, .fw-court-mandala, .fw-medallion-ring, .fw-jhoomar, .fw-eleph img, .fw-dust i, .fw-bell, .fw-venue-tw circle, .fw-band-top, .fw-band-bottom { animation: none !important; }
  .fw-embers, .fw-dust, .fw-sweep { display: none; }
  .fw-door, .fw-light, .fw-rays, .fw-court *, .fw-court-scene, .fw-scroll-paper, .fw-rod-track, .fw-mohar, .fw-close-seal { transition: none !important; }
  .fw-court-scene { transform: none; }
  .fw-lantern { animation: none !important; opacity: .85; }
  .fw-lantern:nth-child(odd) { bottom: 40%; } .fw-lantern:nth-child(3n) { bottom: 62%; } .fw-lantern:nth-child(even) { bottom: 22%; }
  .fw-drift { transform: none !important; }
}
`;
