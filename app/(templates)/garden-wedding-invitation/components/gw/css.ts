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

export const GW_CSS = `
.gw-root { --gw-ease: cubic-bezier(.22,1,.36,1); --gw-soft: cubic-bezier(.22,.61,.36,1); --gw-silk: cubic-bezier(.65,.05,.36,1); --gw-expo: cubic-bezier(.16,1,.3,1); --gw-press: cubic-bezier(.34,1.56,.64,1);
  --gw-door: #4a1020; --gw-light: #fff3d6; --gw-ruby: #8e1b2e; overflow-x: clip; }
.gw-root[data-wk-theme=noir] { --gw-door: #1b150d; }
.gw-root[data-wk-theme=emerald] { --gw-door: #0e3325; }
.gw-root[data-wk-theme=blush] { --gw-door: #6a2639; }
.gw-root[data-wk-theme=champagne] { --gw-door: #5e3d16; }
.gw-root[data-wk-theme=powder] { --gw-door: #213e64; }

/* The kit's foil sheen animates background-position (a repaint every frame);
   Royal keeps the foil static and sweeps light with a transform instead. */
.gw-root .wk-shimmer { animation: none !important; }
.gw-sweep { position: absolute; inset: 0; overflow: hidden; pointer-events: none; opacity: 1 !important; transform: none !important; }
.gw-sweep::before { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 34%; background: linear-gradient(105deg, transparent, rgba(255,246,214,.42) 50%, transparent); translate: -120% 0; animation: gw-sweep 7.5s var(--gw-soft) 3s infinite; }
@keyframes gw-sweep { 0% { translate: -120% 0; } 22%, 100% { translate: 320% 0; } }

/* The theme's royal plate behind every section (one static layer). */
.gw-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
.gw-backdrop img { width: 100%; height: 100%; object-fit: cover; opacity: .3; }
.gw-root:not([data-wk-dark]) .gw-backdrop img { opacity: .42; }
.gw-root[data-wk-theme=champagne] .gw-backdrop img { opacity: .2; }
.gw-backdrop::after { content: ""; position: absolute; inset: 0; background: radial-gradient(120% 70% at 50% 50%, transparent, color-mix(in srgb, var(--wk-bg) 60%, transparent)); }

/* ── Toran: gold mango-leaf band + marigold strings ──────── */
.gw-toran { position: absolute; left: -2%; right: -2%; top: 0; height: 150px; z-index: 6; pointer-events: none; transform-origin: 50% 0; animation: gw-toran 5s ease-in-out infinite alternate; }
.gw-toran-band { position: absolute; left: 0; right: 0; top: 0; height: clamp(46px, 11vw, 74px); background-image: var(--wk-foil); background-size: 220% 100%;
  -webkit-mask: url(/wedding/ornaments/toran-strip.svg) repeat-x 0 0 / auto 100%; mask: url(/wedding/ornaments/toran-strip.svg) repeat-x 0 0 / auto 100%; filter: drop-shadow(0 3px 4px rgba(0,0,0,.35)); }
.gw-toran-strands { position: absolute; inset: 0; }
.gw-strand { position: absolute; top: clamp(10px, 2.4vw, 16px); width: 13px; margin-left: -6.5px; border-radius: 7px; background-color: #e2851d; background-size: 340px auto; background-repeat: repeat-y;
  -webkit-mask-image: linear-gradient(#000 78%, transparent); mask-image: linear-gradient(#000 78%, transparent); }
@keyframes gw-toran { from { transform: rotate(-.8deg); } to { transform: rotate(.8deg); } }

/* ── The gates ─────────────────────────────────────────── */
.gw-gate { position: fixed; inset: 0; z-index: 60; overflow: hidden; background: var(--wk-bg); transition: opacity .7s var(--gw-soft) 1.1s; }
.gw-gate.is-push { opacity: 0; pointer-events: none; }
.gw-gate.is-reduced.is-push { transition: opacity .4s linear; }
.gw-gate-world { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(8px, 2vh, 22px);
  padding: calc(clamp(46px, 11vw, 74px) + 40px) 16px max(18px, env(safe-area-inset-bottom)); transform-origin: 50% 40%; }
.gw-gate.is-push:not(.is-reduced) .gw-gate-world { transform: scale(1.9) translateY(6%); transition: transform 1.8s var(--gw-expo); }
.gw-gate-plate { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.gw-gate-vignette { position: absolute; inset: 0; background: radial-gradient(90% 60% at 50% 42%, transparent 30%, color-mix(in srgb, var(--wk-bg) 70%, #000 10%) 100%); }
.gw-root:not([data-wk-dark]) .gw-gate-vignette { background: radial-gradient(90% 60% at 50% 42%, transparent 35%, color-mix(in srgb, var(--wk-bg) 75%, transparent) 100%); }
.gw-embers { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.gw-embers i { position: absolute; bottom: -8px; width: 4px; height: 4px; border-radius: 50%; background: radial-gradient(circle, #fff3c0, #f0b94a 55%, transparent 72%); animation: gw-ember linear infinite; opacity: 0; }
@keyframes gw-ember { 0% { transform: translate3d(0,0,0); opacity: 0; } 15% { opacity: .9; } 85% { opacity: .5; } 100% { transform: translate3d(var(--dx), -92vh, 0); opacity: 0; } }

.gw-gate-stage { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; margin-bottom: 18px; }
.gw-arch { position: relative; width: min(70vw, 360px, 44dvh); aspect-ratio: 3 / 4; perspective: 1200px; }
.gw-arch-frame { position: absolute; inset: -9% -10% -2%; width: auto !important; height: auto !important; aspect-ratio: auto !important; z-index: 3; filter: drop-shadow(0 6px 14px rgba(0,0,0,.4)); pointer-events: none; }
.gw-finial { position: absolute; left: 50%; top: -15%; z-index: 4; translate: -50% 0; filter: drop-shadow(0 3px 5px rgba(0,0,0,.35)); }
.gw-doors { position: absolute; inset: 7% 9% 0; display: flex; transform-style: preserve-3d; z-index: 2; }
.gw-door { position: relative; flex: 1 1 50%; height: 100%; transform-style: preserve-3d; transition: transform 2s var(--gw-silk); }
.gw-door-left { transform-origin: 0% 50%; }
.gw-door-right { transform-origin: 100% 50%; }
.gw-door-leaf { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; filter: drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
.gw-door-left .gw-door-leaf > * { clip-path: ${CLIP_L}; }
.gw-door-right .gw-door-leaf > * { clip-path: ${CLIP_R}; }
.gw-door-wood, .gw-door-face, .gw-door-studs { position: absolute; inset: 0; }
.gw-door-wood { background:
  repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 6px),
  linear-gradient(180deg, color-mix(in srgb, var(--gw-door) 86%, #fff 14%), var(--gw-door) 45%, color-mix(in srgb, var(--gw-door) 72%, #000)); }
.gw-door-left .gw-door-wood { box-shadow: inset -14px 0 18px -10px rgba(0,0,0,.6), inset 10px 0 14px -10px rgba(255,230,170,.18); }
.gw-door-right .gw-door-wood { box-shadow: inset 14px 0 18px -10px rgba(0,0,0,.6), inset -10px 0 14px -10px rgba(255,230,170,.18); }
.gw-door-jali { position: absolute; top: 31%; height: 25%; width: 52%; overflow: hidden; border-radius: 50% 50% 3px 3px / 26% 26% 3px 3px; background: #2a1c10; box-shadow: inset 0 0 0 2px var(--wk-gold), inset 0 0 12px rgba(0,0,0,.6); clip-path: none !important; }
.gw-door-left .gw-door-jali { left: 17%; }
.gw-door-right .gw-door-jali { right: 17%; }
.gw-door-jali img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%; transform: scale(1.5); opacity: .8; filter: sepia(1) saturate(1.7) brightness(.82) contrast(1.15); }
.gw-door-studs { background:
  radial-gradient(circle at 50% 50%, #fbe7ad 0 1.4px, #a87b2a 2px, rgba(0,0,0,.35) 2.6px, transparent 3.2px) left 9% top 38% / 12px 15px repeat-y,
  radial-gradient(circle at 50% 50%, #fbe7ad 0 1.4px, #a87b2a 2px, rgba(0,0,0,.35) 2.6px, transparent 3.2px) right 9% top 38% / 12px 15px repeat-y; }
.gw-door-face { color: var(--wk-gold); --w-door: transparent; }
.gw-door-face svg { display: block; width: 100%; height: 100%; }
.gw-door-ring { position: absolute; top: 74%; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #d9b45a; box-shadow: 0 2px 3px rgba(0,0,0,.55), inset 0 1px 1px rgba(255,255,255,.4); clip-path: none !important; }
.gw-door-ring::before { content: ""; position: absolute; left: 50%; top: -9px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #fff1c2, #c99a3c 60%, #6d4a10); }
.gw-door-left .gw-door-ring { right: 12%; }
.gw-door-right .gw-door-ring { left: 12%; }
.gw-gate.is-open .gw-door-left, .gw-gate.is-push .gw-door-left { transform: rotateY(-80deg); }
.gw-gate.is-open .gw-door-right, .gw-gate.is-push .gw-door-right { transform: rotateY(80deg); }

.gw-light { position: absolute; inset: 7% 9% 0; border-radius: 50% 50% 0 0 / 34% 34% 0 0; background: radial-gradient(60% 55% at 50% 60%, #fff, var(--gw-light) 35%, rgba(255,214,140,.6) 60%, rgba(255,190,110,0) 80%);
  opacity: .1; transform: scale(.9); transition: opacity 1.2s var(--gw-soft) .2s, transform 1.6s var(--gw-soft) .2s; z-index: 1; }
.gw-gate.is-open .gw-light, .gw-gate.is-push .gw-light { opacity: 1; transform: scale(1.9); }
.gw-rays { position: absolute; left: 50%; top: 52%; width: 220%; aspect-ratio: 1; margin: -110% 0 0 -110%; z-index: 1; border-radius: 50%; pointer-events: none; opacity: 0; transform: scale(1.2);
  background: repeating-conic-gradient(from 0deg, rgba(255,236,180,.42) 0 4deg, rgba(255,236,180,0) 4deg 15deg); -webkit-mask-image: radial-gradient(closest-side, #000 20%, transparent); mask-image: radial-gradient(closest-side, #000 20%, transparent);
  transition: opacity 1.6s var(--gw-soft) .2s, transform 1.6s var(--gw-soft) .2s; }
.gw-gate.is-open .gw-rays, .gw-gate.is-push .gw-rays { opacity: 1; transform: scale(1.6); }

/* The invocation: Ganesha (or the crest) glows in on the closed doors. */
.gw-invoke { position: absolute; left: 50%; top: 15%; width: 48%; z-index: 4; translate: -50% 0; display: flex; flex-direction: column; align-items: center; pointer-events: none; }
.gw-invoke-glow { position: absolute; left: 50%; top: 38%; width: 240%; aspect-ratio: 1; margin: -120% 0 0 -120%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,222,140,.62), rgba(255,200,100,.22) 45%, rgba(255,190,90,0)); opacity: 0; transform: scale(.7); }
.gw-ganesha { position: relative; width: 100%; height: auto; opacity: 0; transform: scale(.94); filter: drop-shadow(0 0 6px rgba(255,215,130,.55)); }
.gw-crest { position: relative; opacity: 0; transform: scale(.94); }
.gw-mantra { position: relative; margin: 8px 0 0; white-space: nowrap; font: 600 clamp(13px, 3.8vw, 17px)/1.3 var(--wk-font-deva); color: #fbe5a6; text-shadow: 0 1px 6px rgba(0,0,0,.7); opacity: 0; transform: translateY(10px); }
.gw-gate.is-invoke .gw-invoke-glow { opacity: .95; transform: none; transition: opacity 1.4s var(--gw-soft) .2s, transform 1.4s var(--gw-soft) .2s; }
.gw-gate.is-invoke .gw-ganesha, .gw-gate.is-invoke .gw-crest { opacity: 1; transform: none; transition: opacity 1.4s var(--gw-soft) .4s, transform 1.4s var(--gw-soft) .4s; }
.gw-gate.is-invoke .gw-mantra { opacity: 1; transform: none; transition: opacity .8s var(--gw-soft) 1.3s, transform .8s var(--gw-soft) 1.3s; }
.gw-gate.is-open .gw-invoke, .gw-gate.is-push .gw-invoke { opacity: 0; transition: opacity .6s var(--gw-soft); }
.gw-gate.is-open .gw-ganesha, .gw-gate.is-open .gw-crest, .gw-gate.is-open .gw-invoke-glow, .gw-gate.is-open .gw-mantra { opacity: 1; transform: none; }

/* The medallion on the seam: tap to enter. */
.gw-medal { position: absolute; left: 50%; top: 57%; width: clamp(86px, 25vw, 112px); aspect-ratio: 1; translate: -50% -50%; z-index: 5; border: 0; padding: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
  animation: gw-breathe 2.5s ease-in-out infinite; transition: opacity .5s var(--gw-soft) .25s; }
.gw-medal::before { content: ""; position: absolute; inset: 24%; border-radius: 50%; background: radial-gradient(circle at 36% 30%, #d9475a, var(--gw-ruby) 58%, #4e0b17); box-shadow: inset 0 0 0 2px rgba(255,220,150,.7), 0 4px 10px rgba(0,0,0,.5); }
.gw-medal-ring { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 4px 8px rgba(0,0,0,.45)); }
.gw-medal-ini { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; gap: 1px; font: 600 clamp(17px, 5vw, 22px)/1 var(--wk-font-caps); color: #f8e2a4; text-shadow: 0 1px 0 rgba(0,0,0,.4); }
.gw-medal-ini i { font: italic 400 .62em var(--wk-font-display); opacity: .9; }
.gw-medal:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 6px; border-radius: 50%; }
.gw-gate:not(.is-closed) .gw-medal { animation: gw-press .26s var(--gw-press) both; opacity: 0; pointer-events: none; }
@keyframes gw-breathe { 0%,100% { scale: 1; } 50% { scale: 1.035; } }
@keyframes gw-press { from { scale: .96; } to { scale: 1; } }

/* Diyas: the clay bowl (the art's baked glow cropped off) + a CSS flame. */
.gw-diyas { position: absolute; left: 50%; bottom: -6px; translate: -50% 0; width: min(96vw, 440px); display: flex; justify-content: space-between; align-items: flex-end; z-index: 5; pointer-events: none; }
.gw-diya { position: relative; display: block; align-self: flex-end; width: 62px; height: auto; margin-top: -48%; }
.gw-diya img { display: block; width: 100%; height: auto; clip-path: inset(63% 0 0 0); }
.gw-flame { position: absolute; left: 50%; top: 0; margin-top: 44%; width: 26%; aspect-ratio: 5 / 8; margin-left: -13%; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(50% 60% at 50% 72%, #fffbe6, #ffd76e 42%, #ff8a1f 78%, rgba(255,120,20,0)); transform-origin: 50% 92%; animation: gw-flicker 1.3s ease-in-out infinite alternate; }
.gw-flame::after { content: ""; position: absolute; left: 50%; top: 45%; width: 520%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,190,90,.34), rgba(255,170,60,0)); }
@keyframes gw-flicker { 0% { transform: scale(1, 1) rotate(-2deg); opacity: .9; } 45% { transform: scale(.93, 1.07) rotate(2deg); opacity: 1; } 100% { transform: scale(1.04, .94) rotate(-1deg); opacity: .95; } }

.gw-gate-copy { position: relative; z-index: 5; text-align: center; transition: opacity .5s; }
.gw-gate-copy::before { content: ""; position: absolute; inset: -30px -40px; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--wk-bg) 88%, transparent), color-mix(in srgb, var(--wk-bg) 55%, transparent) 65%, transparent); }
.gw-gate:not(.is-closed) .gw-gate-copy { opacity: 0; }
.gw-gate-names { margin: 0; font: 400 clamp(38px, 11vw, 64px)/1.1 var(--wk-font-script); padding: 0 .1em; filter: drop-shadow(0 2px 6px rgba(0,0,0,.35)); }
.gw-root:not([data-wk-dark]) .gw-gate-names, .gw-root:not([data-wk-dark]) .gw-court-n { filter: drop-shadow(0 1px 0 rgba(80,45,15,.35)); }
.gw-root:not([data-wk-dark]) .gw-court-in::before { background: radial-gradient(closest-side, color-mix(in srgb, var(--wk-surface-solid) 94%, transparent), color-mix(in srgb, var(--wk-surface-solid) 70%, transparent) 72%, transparent); }
.gw-root:not([data-wk-dark]) .gw-court-k { color: var(--wk-gold-ink); }
.gw-root:not([data-wk-dark]) .gw-court-wash { background:
  radial-gradient(70% 42% at 50% 40%, color-mix(in srgb, var(--wk-bg) 18%, transparent), color-mix(in srgb, var(--wk-bg) 55%, transparent) 100%),
  linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 50%, transparent), transparent 22%, transparent 62%, var(--wk-bg) 100%); }
.gw-gate-names span { font-size: .6em; }
.gw-gate-date { margin: 4px 0 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .34em; color: var(--wk-ink); }
.gw-gate-cta { position: relative; margin-top: 14px; min-height: 48px; padding: 0 24px; border-radius: 999px; border: 1px solid var(--wk-gold); background: var(--wk-surface-solid); color: var(--wk-gold-ink); font: 600 14px/1 var(--wk-font-sans); letter-spacing: .04em; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,.25); }
.gw-gate-cta::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; border: 1px solid var(--wk-gold); animation: gw-ring 2.4s var(--gw-soft) infinite; pointer-events: none; }
@keyframes gw-ring { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(1.18, 1.5); opacity: 0; } }
.gw-gate-petals { position: absolute; inset: 0; z-index: 8; pointer-events: none; }
.gw-gate-petals .wk-burst { position: absolute; left: 0; right: 0; top: 0; height: 80%; }
@media (max-height: 560px) {
  .gw-gate-world { flex-direction: row; gap: 28px; padding-top: 60px; }
  .gw-arch { width: min(34vw, 44dvh); }
  .gw-diyas { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 130%; }
}

/* Devanagari breaks under letter-spacing: Hindi mode sets it to zero on the spaced-caps lines. */
.gw-root.is-hi .wk-eyebrow, .gw-root.is-hi .gw-cartouche, .gw-root.is-hi .wk-ev-date, .gw-root.is-hi .wk-ev-k, .gw-root.is-hi .gw-count-line, .gw-root.is-hi .wk-cd-label, .gw-root.is-hi .gw-f-k, .gw-root.is-hi .gw-scroll-cue b { letter-spacing: 0 !important; }

/* ── Language toggle ───────────────────────────────────── */
.gw-lang { position: fixed; z-index: 55; top: max(10px, env(safe-area-inset-top)); left: 12px; display: flex; padding: 3px; border-radius: 999px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
.gw-lang button { min-width: 44px; min-height: 38px; padding: 0 10px; border: 0; border-radius: 999px; background: none; color: var(--wk-muted); font: 600 13px/1 var(--wk-font-sans); cursor: pointer; }
.gw-lang button[aria-pressed=true] { background: var(--wk-accent); color: var(--wk-accent-ink); }

/* ── The courtyard (hero) ──────────────────────────────── */
.gw-court { --gw-hy: 0px; position: relative; min-height: 100svh; overflow: hidden; isolation: isolate; display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(64px, 10vh, 96px) 16px 150px; }
.gw-court-back { position: absolute; inset: 0; z-index: -1; overflow: hidden; translate: 0 calc(var(--gw-hy) * .75); }
.gw-court-scene { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.25); transition: transform 2.2s var(--gw-expo); }
.gw-court.is-open .gw-court-scene { transform: scale(1.04); }
.gw-court-wash { position: absolute; inset: 0; background:
  radial-gradient(70% 42% at 50% 40%, color-mix(in srgb, var(--wk-bg) 30%, transparent), color-mix(in srgb, var(--wk-bg) 72%, transparent) 100%),
  linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 60%, transparent), transparent 22%, transparent 62%, var(--wk-bg) 100%); }
.gw-court-mandala { position: absolute; left: 50%; top: 40%; width: min(150vw, 980px); aspect-ratio: 1; translate: -50% -50%; opacity: .16; animation: gw-spin 150s linear infinite; }
.gw-root:not([data-wk-dark]) .gw-court-mandala { opacity: .12; }
.gw-court-mandala img { width: 100%; height: 100%; object-fit: contain; }
@keyframes gw-spin { to { rotate: 360deg; } }

.gw-court-arch { position: relative; z-index: 2; width: min(124vw, 600px, 66svh); aspect-ratio: 1; flex: none; margin-top: -1vh; translate: 0 calc(var(--gw-hy) * .45); }
.gw-court-frame { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 8px 18px rgba(0,0,0,.35)); opacity: 0; transform: translateY(40px); transition: opacity 1.4s var(--gw-soft) .2s, transform 1.4s var(--gw-soft) .2s; }
.gw-court-in { position: absolute; left: 22%; right: 22%; top: 26%; bottom: 14%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.gw-court-in::before { content: ""; position: absolute; inset: -6% -14%; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--wk-bg) 82%, transparent), color-mix(in srgb, var(--wk-bg) 50%, transparent) 70%, transparent); opacity: 0; transition: opacity 1.4s var(--gw-soft) .4s; }
.gw-court-crest { min-height: 72px; display: grid; place-items: center; }
.gw-portrait { display: block; width: clamp(64px, 17vw, 96px); aspect-ratio: 1; border-radius: 50%; padding: 3px; background: var(--wk-foil); box-shadow: 0 6px 18px rgba(0,0,0,.35); }
.gw-portrait img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.gw-court-k { margin: 8px 0 0; }
.gw-court-names { position: relative; margin: 2px 0 0; display: flex; flex-direction: column; align-items: center; font: 400 clamp(38px, min(11.5vw, 8svh), 76px)/1.04 var(--wk-font-script); }
.gw-court-n { padding: 0 .14em; max-width: 100%; overflow-wrap: anywhere; }
.gw-amp { font: italic 400 clamp(17px, 4.4vw, 26px)/1.3 var(--wk-font-display); color: var(--wk-gold-ink); }
.gw-court-in > * { opacity: 0; transform: translateY(14px); transition: opacity 1s var(--gw-soft), transform 1s var(--gw-soft); }
.gw-court-names > * { opacity: 0; transform: translateY(14px) scale(.98); transition: opacity 1s var(--gw-soft), transform 1s var(--gw-soft); }

.gw-jhoomar { position: absolute; top: 0; z-index: 3; width: clamp(58px, 17vw, 110px); display: flex; flex-direction: column; align-items: center; transform-origin: 50% 0; translate: 0 -40px; opacity: 0;
  transition: translate 1.2s var(--gw-soft) 1.1s, opacity 1s var(--gw-soft) 1.1s; animation: gw-sway 6s ease-in-out infinite alternate; }
.gw-jhoomar i { display: block; width: 2px; height: clamp(70px, 14vh, 130px); background: linear-gradient(var(--wk-gold), color-mix(in srgb, var(--wk-gold) 60%, #000)); }
.gw-jhoomar img { display: block; width: 100%; height: auto; margin-top: -2px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.35)); }
.gw-jhoomar-l { left: 3%; }
.gw-jhoomar-r { right: 3%; animation-delay: -2.4s; animation-duration: 7s; }
@keyframes gw-sway { from { rotate: -1.4deg; } to { rotate: 1.4deg; } }

.gw-peacock { position: absolute; z-index: 3; top: min(38svh, 46%); width: clamp(104px, 31vw, 190px); opacity: 0; translate: 0 10px; transition: opacity 1s var(--gw-soft) 1s, translate 1s var(--gw-soft) 1s; }
.gw-peacock img { display: block; width: 100%; height: auto; filter: drop-shadow(0 6px 10px rgba(0,0,0,.3)); }
.gw-peacock-l { left: -6%; }
.gw-peacock-r { right: -6%; scale: -1 1; }

.gw-court-meta { position: relative; z-index: 4; margin-top: -3%; display: flex; flex-direction: column; align-items: center; gap: 6px; translate: 0 calc(var(--gw-hy) * .3); }
.gw-court-meta > * { opacity: 0; transform: translateY(12px) scaleX(.96); transition: opacity .8s var(--gw-soft) 2.2s, transform .8s var(--gw-soft) 2.2s; }
.gw-cartouche { margin: 0; display: inline-flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 26px 11px; border-radius: 999px; background: var(--wk-surface-solid);
  box-shadow: 0 0 0 1px var(--wk-gold), 0 0 0 4px var(--wk-surface-solid), 0 0 0 5px color-mix(in srgb, var(--wk-gold) 70%, transparent), 0 10px 24px rgba(0,0,0,.28); }
.gw-cartouche span { font: 600 clamp(11.5px, 3.1vw, 14px)/1.4 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); }
.gw-cartouche small { font: italic 500 15px/1.2 var(--wk-font-display); color: var(--wk-ink); }
.gw-court-muhurat, .gw-court-venue { margin: 0; max-width: 32ch; font: 500 14.5px/1.45 var(--wk-font-sans); color: var(--wk-ink); text-shadow: 0 1px 8px var(--wk-bg); }
.gw-court-muhurat { font: italic 500 17px/1.4 var(--wk-font-display); color: var(--wk-gold-ink); margin-top: 4px; }

.gw-eleph { position: absolute; z-index: 4; bottom: 34px; width: clamp(150px, 43vw, 320px); opacity: 0; transition: translate 1.8s var(--gw-silk) .4s, opacity 1.2s var(--gw-soft) .4s; translate: 0 calc(var(--gw-hy) * .2); }
.gw-eleph img { display: block; width: 100%; height: auto; transform-origin: 50% 100%; animation: gw-idle 4.5s ease-in-out infinite alternate; filter: drop-shadow(0 8px 10px rgba(0,0,0,.35)); }
.gw-eleph-l { left: -13%; scale: -1 1; translate: -60% 0; }
.gw-eleph-r { right: -13%; translate: 60% 0; }
.gw-eleph-r img { animation-duration: 3.2s; animation-delay: -1.1s; }
@keyframes gw-idle { from { transform: translateY(0) rotate(-.5deg); } to { transform: translateY(-2px) rotate(.5deg); } }

.gw-parapet { position: absolute; left: 0; right: 0; bottom: 0; z-index: 5; height: 54px; display: flex; justify-content: space-evenly; align-items: flex-start; padding: 0 6%;
  background: radial-gradient(circle at 50% 100%, transparent 8px, color-mix(in srgb, var(--wk-gold) 80%, transparent) 8.5px 9.5px, transparent 10px) 0 10px / 22px 14px repeat-x,
    linear-gradient(180deg, color-mix(in srgb, var(--wk-gold) 85%, #000) 0 2px, color-mix(in srgb, var(--wk-bg2) 92%, #000) 2px, var(--wk-bg) 100%);
  box-shadow: 0 -8px 20px rgba(0,0,0,.25); translate: 0 30px; opacity: 0; transition: translate 1.2s var(--gw-soft) .7s, opacity 1s var(--gw-soft) .7s; }
.gw-diya-sm { width: 46px; margin-top: -30px; }
.gw-diya-sm .gw-flame { opacity: 0; scale: 1 .4; transition: opacity .4s var(--gw-soft), scale .4s var(--gw-soft); transition-delay: calc(1.3s + var(--i) * .1s); }

.gw-dust { position: absolute; inset: 0; z-index: 6; pointer-events: none; }
.gw-dust i { position: absolute; border-radius: 50%; background: radial-gradient(circle, #fff7d6, #e8c46a 50%, transparent 72%); opacity: 0; animation: gw-dust linear infinite; }
@keyframes gw-dust { 0% { transform: translate3d(0,0,0); opacity: 0; } 20% { opacity: .9; } 80% { opacity: .6; } 100% { transform: translate3d(var(--dx), -160px, 0); opacity: 0; } }

.gw-scroll-cue { position: absolute; z-index: 6; left: 50%; bottom: 66px; translate: -50% 0; display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: 0; transition: opacity 1s var(--gw-soft) 2.8s; pointer-events: none; }
.gw-scroll-cue b { font: 600 10.5px/1 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; color: var(--wk-gold-ink); text-shadow: 0 1px 6px var(--wk-bg); }
.gw-bell { display: block; width: 16px; height: 18px; border-radius: 50% 50% 18% 18% / 70% 70% 20% 20%; background: linear-gradient(90deg, #8a6420, #f6dc9a 45%, #b8892f); transform-origin: 50% -6px; animation: gw-bell 2s ease-in-out infinite alternate; position: relative; }
.gw-bell::before { content: ""; position: absolute; left: 50%; top: -8px; width: 1px; height: 8px; background: var(--wk-gold); }
@keyframes gw-bell { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }

/* The entrance (when the gates have opened). */
.gw-court.is-open .gw-court-frame, .gw-court.is-open .gw-court-in > *, .gw-court.is-open .gw-court-names > *, .gw-court.is-open .gw-court-meta > * { opacity: 1; transform: none; }
.gw-court.is-open .gw-court-in::before { opacity: 1; }
.gw-court.is-open .gw-court-in > :nth-child(1) { transition-delay: 1s; }
.gw-court.is-open .gw-court-in > :nth-child(2) { transition-delay: 1.3s; }
.gw-court.is-open .gw-court-in > :nth-child(3) { transition-delay: 1.5s; }
.gw-court.is-open .gw-court-names > :nth-child(1) { transition-delay: 1.5s; }
.gw-court.is-open .gw-court-names > :nth-child(2) { transition-delay: 1.9s; }
.gw-court.is-open .gw-court-names > :nth-child(3) { transition-delay: 2.1s; }
.gw-court.is-open .gw-jhoomar, .gw-court.is-open .gw-peacock, .gw-court.is-open .gw-parapet { opacity: 1; translate: 0 0; }
.gw-court.is-open .gw-eleph { opacity: 1; translate: 0 calc(var(--gw-hy) * .2); }
.gw-court.is-open .gw-eleph-l { translate: 0 calc(var(--gw-hy) * .2); }
.gw-court.is-open .gw-parapet { translate: 0 calc(var(--gw-hy) * -.2); }
.gw-court.is-open .gw-diya-sm .gw-flame { opacity: 1; scale: 1 1; }
.gw-court.is-open .gw-scroll-cue { opacity: 1; }
.gw-court.is-idle *, .gw-court.is-idle *::after, .gw-court.is-idle *::before,
.gw-court:not(.is-open) *, .gw-court:not(.is-open) *::after, .gw-court:not(.is-open) *::before { animation-play-state: paused !important; }
@media (min-width: 900px) {
  .gw-court-arch { width: min(600px, 64svh); }
  .gw-eleph { bottom: 30px; }
  .gw-eleph-l { left: 2%; } .gw-eleph-r { right: 2%; }
  .gw-peacock-l { left: 12%; } .gw-peacock-r { right: 12%; }
  .gw-peacock { top: 38%; }
  .gw-jhoomar-l { left: 18%; } .gw-jhoomar-r { right: 18%; }
}
@media (max-height: 560px) { .gw-court-arch { width: min(80vw, 88svh); } .gw-peacock, .gw-scroll-cue { display: none; } }

/* ── Invitation ─────────────────────────────────────────── */
.gw-invite { padding: clamp(28px, 6vw, 56px) clamp(18px, 5vw, 56px); }

/* ── Families inside a Mughal manuscript border (hashiya) ── */
.gw-hashiya { position: relative; max-width: 760px; margin: 0 auto; }
.gw-hashiya-frame { position: relative; border-style: solid; border-width: 40px 38px 34px 26px; border-image-source: ${BORDER}; border-image-slice: 196 211 161 84; border-image-repeat: round;
  border-radius: 4px; box-shadow: 0 18px 40px rgba(0,0,0,.28); clip-path: inset(5px 5px 5px 8px round 4px); margin: -5px -5px -5px -8px; }
.gw-hashiya-in { background: var(--wk-surface-solid); padding: clamp(22px, 5vw, 40px) clamp(12px, 3.6vw, 36px); box-shadow: inset 0 0 0 1px var(--wk-gold), inset 0 0 0 5px var(--wk-surface-solid), inset 0 0 0 6px color-mix(in srgb, var(--wk-gold) 60%, transparent); }
@media (min-width: 640px) { .gw-hashiya-frame { border-width: 58px 56px 48px 38px; clip-path: inset(7px 7px 7px 12px round 4px); margin: -7px -7px -7px -12px; } }
.gw-band { display: block; height: 58px; margin: 0 -2px; background-image: ${VINES}; background-size: 122% auto; background-position: 50% 50%; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 80%, transparent), 0 6px 16px rgba(0,0,0,.2); border-radius: 3px; }
.gw-band-top { margin-bottom: 14px; }
.gw-band-bottom { margin-top: 14px; background-position: 50% 30%; }
@supports (animation-timeline: view()) {
  .gw-band-top { animation: gw-band-l linear both; animation-timeline: view(); animation-range: entry 0% entry 70%; }
  .gw-band-bottom { animation: gw-band-r linear both; animation-timeline: view(); animation-range: entry 0% entry 70%; }
}
@keyframes gw-band-l { from { transform: translateX(-100%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes gw-band-r { from { transform: translateX(100%); opacity: 0; } to { transform: none; opacity: 1; } }
.gw-blessings-of { text-align: center; margin: 0 auto 22px; max-width: 560px; }
.gw-blessings-names { margin: 0; font: italic 400 clamp(19px, 4.4vw, 24px)/1.45 var(--wk-font-display); }

/* ── The farmaan ───────────────────────────────────────── */
.gw-farmaan { position: relative; max-width: 400px; margin: 0 auto; padding: 0 14px; }
.gw-rod { position: relative; z-index: 3; display: block; height: 24px; margin: 0 -14px; border-radius: 12px; background: linear-gradient(180deg, #6d4a10, #f9e6a8 32%, #c9962e 58%, #5d3d0b); box-shadow: 0 6px 12px rgba(0,0,0,.35); }
.gw-rod::before, .gw-rod::after { content: ""; position: absolute; top: 50%; width: 30px; height: 30px; margin-top: -15px; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #fff1c2, #d9a640 55%, #6d4a10); box-shadow: 0 3px 6px rgba(0,0,0,.4); }
.gw-rod::before { left: -16px; } .gw-rod::after { right: -16px; }
.gw-scroll-body { position: relative; margin: -8px 0 0; }
.gw-scroll-paper { position: relative; padding: 38px 24px 128px; text-align: center; color: #4a2c12; background: linear-gradient(180deg, rgba(222,178,98,.34), rgba(205,150,70,.26) 50%, rgba(190,130,55,.38)), ${PAPER} center / cover, #f3e6c4;
  box-shadow: inset 0 0 0 1px rgba(150,105,35,.35), inset 0 0 0 7px rgba(255,248,230,.0), inset 0 0 0 8px rgba(150,105,35,.45), inset 0 0 50px rgba(140,90,20,.28);
  clip-path: inset(0 0 100% 0); transition: clip-path 1.5s var(--gw-silk); }
.gw-farmaan.is-open .gw-scroll-paper, .gw-farmaan.is-sealed .gw-scroll-paper { clip-path: inset(0 0 0 0); }
.gw-rod-track { position: absolute; left: 0; right: 0; top: 0; height: 100%; transform: translateY(-100%); transition: transform 1.5s var(--gw-silk); pointer-events: none; z-index: 3; }
.gw-rod-bottom { position: absolute; left: 0; right: 0; bottom: -12px; }
.gw-farmaan.is-open .gw-rod-track, .gw-farmaan.is-sealed .gw-rod-track { transform: none; }
.gw-f-k { margin: 0 auto; max-width: 26ch; font: 500 11px/1.6 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: #8a5a1c; }
.gw-f-weekday { margin: 18px 0 0; font: italic 500 22px/1.2 var(--wk-font-display); }
.gw-f-day { margin: 2px 0 0; font: 600 clamp(84px, 26vw, 120px)/1 var(--wk-font-caps); background-image: linear-gradient(180deg, #d9a640, #8a5a12 60%, #5d3d0b); -webkit-text-fill-color: transparent; }
.gw-f-month { margin: 4px 0 0; font: 600 18px/1.3 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; }
.gw-f-month span { color: #8a5a1c; }
.gw-f-time { margin: 16px 0 0; font: 500 16px/1.4 var(--wk-font-sans); }
.gw-f-muhurat { margin: 4px 0 0; font: italic 500 19px/1.4 var(--wk-font-display); color: #7a2a1a; }
.gw-f-venue { margin: 14px auto 0; max-width: 28ch; padding-top: 14px; border-top: 1px solid rgba(150,105,35,.4); font: 500 16px/1.45 var(--wk-font-display); }
.gw-mohar { position: absolute; left: 50%; bottom: 18px; width: 92px; margin-left: -46px; aspect-ratio: 1; opacity: 0; transform: scale(1.6) rotate(-20deg); transition: opacity .3s, transform .5s var(--gw-press); }
.gw-mohar img { position: absolute; inset: 0; width: 100%; height: 100%; }
.gw-mohar b { position: absolute; inset: 24%; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: radial-gradient(circle at 36% 30%, #d9475a, var(--gw-ruby) 58%, #4e0b17); color: #f8e2a4; font: 600 15px/1 var(--wk-font-caps); box-shadow: inset 0 0 0 1.5px rgba(255,220,150,.7); }
.gw-mohar b i { font: italic 400 .7em var(--wk-font-display); }
.gw-farmaan.is-sealed .gw-mohar { opacity: 1; transform: rotate(-8deg); }

/* ── Story ─────────────────────────────────────────────── */
.gw-story { --gw-p: 0; position: relative; padding: 8px 0; }
.gw-story-rail { position: absolute; top: 0; bottom: 0; left: 22px; width: 2px; background: var(--wk-border); }
.gw-story-rail i { position: absolute; inset: 0; background: var(--wk-foil); transform-origin: top; transform: scaleY(var(--gw-p)); }
.gw-drift { position: absolute; pointer-events: none; opacity: .14; z-index: 0; }
.gw-drift-a { right: -30px; top: 6%; transform: translate3d(0, calc(var(--gw-p) * -160px), 0); }
.gw-drift-b { left: -20px; bottom: 8%; transform: translate3d(0, calc(var(--gw-p) * 120px), 0) rotate(-12deg); }
.gw-chapters { list-style: none; margin: 0; padding: 0; position: relative; z-index: 1; display: grid; gap: clamp(36px, 7vw, 72px); }
.gw-ch { position: relative; padding-left: 58px; display: grid; gap: 16px; }
.gw-ch-dot { position: absolute; left: 9px; top: 2px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: var(--wk-surface-solid); box-shadow: 0 0 0 4px var(--wk-bg); }
.gw-ch-photo { width: min(100%, 360px); aspect-ratio: 4 / 5; border-radius: 999px 999px 18px 18px / 320px 320px 18px 18px; overflow: hidden; padding: 3px; background: var(--wk-foil); box-shadow: var(--wk-shadow); }
.gw-ch-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block; }
.gw-ch-when { margin: 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .3em; color: var(--wk-gold-ink); }
.gw-ch-title { margin: 6px 0 0; font: 500 clamp(26px, 5.6vw, 36px)/1.15 var(--wk-font-display); }
.gw-ch-line { margin: 10px 0 0; font: 400 clamp(18px, 4vw, 21px)/1.6 var(--wk-font-display); color: var(--wk-muted); max-width: 46ch; }
@media (min-width: 860px) {
  .gw-story-rail { left: 50%; margin-left: -1px; }
  .gw-ch { padding-left: 0; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .gw-ch-dot { left: 50%; margin-left: -14px; top: 50%; margin-top: -14px; }
  .gw-ch-photo { justify-self: end; }
  .gw-ch.is-alt .gw-ch-photo { order: 2; justify-self: start; }
  .gw-ch.is-alt .gw-ch-text { text-align: right; justify-self: end; }
  .gw-ch.is-alt .gw-ch-line { margin-left: auto; }
  .gw-ch.no-photo .gw-ch-text { grid-column: 2; }
  .gw-ch.no-photo.is-alt .gw-ch-text { grid-column: 1; }
}

/* ── Functions: illustrated panels ─────────────────────── */
.gw-ev-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 26px; grid-template-columns: 1fr; }
@media (min-width: 760px) { .gw-ev-list { grid-template-columns: 1fr 1fr; gap: 30px; } }
.gw-ev-card { position: relative; height: 100%; padding: 10px 10px 22px; border-radius: 999px 999px 20px 20px / 190px 190px 20px 20px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); text-align: center; }
.gw-ev-art { position: relative; height: clamp(170px, 46vw, 220px); border-radius: inherit; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 3px; background: var(--wk-foil); }
.gw-ev-art::after { content: ""; position: absolute; inset: 3px; border-radius: inherit; box-shadow: inset 0 -30px 40px -20px rgba(0,0,0,.35); pointer-events: none; }
.gw-ev-win { display: block; width: 100%; height: 100%; overflow: hidden; border-radius: 999px 999px 10px 10px / 186px 186px 10px 10px; }
.gw-ev-img { display: block; width: 100%; height: 100%; }
.gw-ev-art.is-paint .gw-ev-img { object-fit: cover; object-position: 50% 40%; }
.gw-ev-art.is-line .gw-ev-img { object-fit: contain; padding: 26px 22px 14px; background: radial-gradient(70% 70% at 50% 60%, color-mix(in srgb, var(--wk-accent) 26%, var(--wk-surface-solid)), var(--wk-surface-solid)); }
.gw-ev-gif { position: absolute; left: 50%; bottom: 6px; width: 62%; max-width: 170px; height: auto; translate: -50% 0; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,246,222,.94), rgba(255,246,222,.75) 70%, rgba(255,246,222,0)); }
.gw-ev-no { position: absolute; left: 50%; top: calc(clamp(170px, 46vw, 220px) - 8px); translate: -50% 0; z-index: 2; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; background: var(--wk-foil); color: #3a2208; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .06em; box-shadow: 0 0 0 4px var(--wk-surface-solid), 0 6px 12px rgba(0,0,0,.3); }
.gw-ev-body { padding: 36px 12px 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.gw-ev-body .wk-ev-date { margin: 0; }
.gw-ev-title { margin: 0; font: 600 clamp(24px, 6vw, 30px)/1.15 var(--wk-font-caps); letter-spacing: .04em; color: var(--wk-gold-ink); }
.gw-ev-line { margin: 0; display: flex; align-items: flex-start; justify-content: center; gap: 8px; font: 400 15.5px/1.5 var(--wk-font-sans); color: var(--wk-ink); text-align: left; }
.gw-ev-line svg { flex: none; margin-top: 3px; color: var(--wk-gold-ink); }
.gw-ev-line b { display: block; font-weight: 600; }
.gw-ev-addr { display: block; color: var(--wk-muted); font-size: 14px; }
.gw-ev-dress { align-items: center; }
.gw-ev-swatch { flex: none; width: 18px; height: 18px; border-radius: 50%; box-shadow: 0 0 0 2px var(--wk-surface-solid), 0 0 0 3px var(--wk-gold); }
.gw-ev-note { margin: 2px 0 0; font: italic 400 17px/1.5 var(--wk-font-display); color: var(--wk-muted); max-width: 34ch; }
.gw-ev-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 8px; }
.gw-ev-all { display: flex; justify-content: center; margin-top: 30px; }

/* ── Venue ─────────────────────────────────────────────── */
.gw-venue { display: grid; gap: 22px; justify-items: center; text-align: center; }
.gw-venue-arch { position: relative; width: min(100%, 520px); aspect-ratio: 4 / 3.6; padding: 4px; border-radius: 999px 999px 18px 18px / 58% 58% 18px 18px; background: var(--wk-foil); box-shadow: var(--wk-shadow); }
.gw-venue-img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
.gw-venue-tw { position: absolute; inset: 4px; z-index: 1; width: calc(100% - 8px); height: calc(100% - 8px); pointer-events: none; }
.gw-venue-tw circle { fill: #ffd98a; opacity: .15; animation: gw-twinkle 2s ease-in-out infinite alternate; animation-play-state: paused; }
.gw-venue.is-on .gw-venue-tw circle { animation-play-state: running; }
@keyframes gw-twinkle { from { opacity: .1; } to { opacity: .95; } }
.gw-venue-glow { position: absolute; inset: 4px; border-radius: 999px 999px 14px 14px / 58% 58% 14px 14px; background: linear-gradient(180deg, transparent 55%, rgba(30,10,0,.35)); pointer-events: none; }
.gw-root[data-wk-dark] .gw-venue-glow { background: linear-gradient(180deg, rgba(38,16,64,.55), rgba(120,52,24,.28) 50%, rgba(24,8,0,.5)); }
.gw-root:not([data-wk-dark]) .gw-venue-tw { display: none; }
.gw-venue-text { display: grid; gap: 8px; justify-items: center; }
.gw-venue-name { margin: 0; font: 600 clamp(26px, 6.4vw, 38px)/1.15 var(--wk-font-caps); letter-spacing: .03em; padding: 0 .1em; }
.gw-venue-addr { margin: 0 0 8px; max-width: 34ch; font: 400 16px/1.55 var(--wk-font-sans); color: var(--wk-muted); }

/* ── Countdown in a gold medallion ─────────────────────── */
.gw-count { text-align: center; overflow: hidden; }
.gw-medallion { position: relative; width: min(96vw, 460px); aspect-ratio: 1; margin: 0 auto; display: grid; place-items: center; }
.gw-medallion-ring { position: absolute; inset: 0; animation: gw-spin 120s linear infinite; }
.gw-medallion-ring img { display: block; width: 100%; height: 100%; filter: drop-shadow(0 10px 20px rgba(0,0,0,.35)); }
.gw-medallion-disc { position: absolute; inset: 19%; border-radius: 50%; background: radial-gradient(circle at 50% 40%, var(--wk-surface-solid), color-mix(in srgb, var(--wk-bg) 80%, #000 6%)); box-shadow: inset 0 0 0 1px var(--wk-gold), inset 0 0 30px rgba(0,0,0,.3); }
.gw-medallion-in { position: relative; z-index: 1; }
.gw-medallion .wk-countdown { gap: 4px !important; }
.gw-medallion .wk-flip, .gw-medallion .wk-roll { min-width: clamp(40px, 11vw, 58px); height: clamp(50px, 13vw, 68px); font-size: clamp(25px, 6.6vw, 36px); border-radius: 10px; }
.gw-medallion .wk-flip-up { border-radius: 10px 10px 0 0; } .gw-medallion .wk-flip-down { border-radius: 0 0 10px 10px; }
.gw-medallion .wk-cd-sep { padding-top: clamp(10px, 3vw, 16px); font-size: clamp(18px, 4.6vw, 24px); }
.gw-medallion .wk-cd-label { font-size: 8.5px; letter-spacing: .18em; }
.gw-medallion .wk-cd-unit { gap: 6px; }
.gw-count-line { margin: 18px 0 0; font: italic 400 20px/1.4 var(--wk-font-display); color: var(--wk-gold-ink); }

/* ── Film ──────────────────────────────────────────────── */
.gw-film { position: relative; aspect-ratio: 16 / 9; border-radius: 18px; overflow: hidden; background: #000; box-shadow: var(--wk-shadow); }
.gw-film iframe, .gw-film-poster { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.gw-film-poster { padding: 0; cursor: pointer; background: #000; }
.gw-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .82; }
.gw-film-play { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; margin: -36px 0 0 -36px; display: grid; place-items: center; border-radius: 50%; background: var(--wk-foil); color: #3a0913; box-shadow: 0 10px 30px rgba(0,0,0,.5); transition: transform .3s var(--gw-ease); }
.gw-film-poster:hover .gw-film-play { transform: scale(1.08); }
.gw-film-label { position: absolute; left: 0; right: 0; bottom: 14px; color: #fff; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; text-shadow: 0 1px 6px rgba(0,0,0,.6); }

/* ── Good to know ─────────────────────────────────────── */
.gw-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: 1fr; }
@media (min-width: 640px) { .gw-know { grid-template-columns: 1fr 1fr; } .gw-know-wide { grid-column: 1 / -1; } }
.gw-know-i { padding: 20px 22px; }
.gw-know-h { margin: 0 0 6px; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--wk-gold-ink); }
.gw-know-t { margin: 0; font: 400 17px/1.6 var(--wk-font-sans); color: var(--wk-ink); }

/* ── RSVP ─────────────────────────────────────────────── */
.gw-upasthiti { margin: -6px auto 20px; text-align: center; font: italic 500 clamp(19px, 4.6vw, 23px)/1.4 var(--wk-font-display); color: var(--wk-gold-ink); }
.gw-reply-by { text-align: center; margin: -10px 0 18px; font: 500 12px/1.5 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.gw-rsvp { padding: clamp(22px, 5vw, 40px); }

/* ── Finale: the gates close on "Shubh Vivah" ─────────── */
.gw-finale { position: relative; overflow: hidden; isolation: isolate; text-align: center; padding: clamp(70px, 12vw, 120px) 16px 0; background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--wk-bg) 40%, #000) 100%); }
.gw-root:not([data-wk-dark]) .gw-finale { background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--wk-bg2) 85%, var(--wk-accent)) 100%); }
.gw-finale-in { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 4px; padding-bottom: 20px; }
.gw-close { position: relative; margin: 30px 0 40px; }
.gw-arch-sm { width: min(58vw, 250px); }
.gw-close .gw-door { transition: transform 1.4s var(--gw-silk); }
.gw-close .gw-door-left { transform: rotateY(-80deg); }
.gw-close .gw-door-right { transform: rotateY(80deg); }
.gw-close.is-closed .gw-door { transform: none; }
.gw-close .gw-light { opacity: 1; transform: scale(1.2); transition: opacity 1.4s var(--gw-soft), transform 1.4s var(--gw-soft); }
.gw-close.is-closed .gw-light { opacity: .12; transform: scale(.9); }
.gw-close-seal { position: absolute; left: 50%; top: 56%; z-index: 4; margin: 0; translate: -50% -50%; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 14px; border-radius: 50%; aspect-ratio: 1; justify-content: center;
  background: radial-gradient(circle at 36% 30%, #d9475a, var(--gw-ruby) 58%, #4e0b17); box-shadow: 0 0 0 3px #d9b45a, 0 0 0 6px rgba(0,0,0,.25), 0 10px 24px rgba(0,0,0,.45); color: #f8e2a4;
  opacity: 0; scale: 1.4; transition: opacity .5s var(--gw-soft) 1.2s, scale .5s var(--gw-press) 1.2s; }
.gw-close.is-closed .gw-close-seal { opacity: 1; scale: 1; }
.gw-close-seal b { font: 600 19px/1.1 var(--wk-font-deva); white-space: nowrap; }
.gw-close-seal small { font: 600 8.5px/1.3 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; white-space: nowrap; }
.gw-close-petals { position: absolute; left: -40%; right: -40%; top: -20%; bottom: 0; pointer-events: none; z-index: 6; }
.gw-close-petals .wk-burst { position: absolute; inset: 0; }
.gw-finale-names { margin: 0; font: 400 clamp(46px, 12vw, 88px)/1.1 var(--wk-font-script); padding: 0 .1em; }
.gw-finale-names span { font-size: .55em; }
.gw-finale-line { margin: 10px auto 0; max-width: 520px; font: italic 400 clamp(18px, 4vw, 22px)/1.5 var(--wk-font-display); color: var(--wk-ink); }
.gw-hashtag { margin: 8px 0 0; font: 600 14px/1.4 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-gold-ink); }
.gw-wa { margin-top: 22px; }
.gw-palace { position: relative; z-index: 1; display: flex; justify-content: center; margin-top: 26px; opacity: .9; padding-bottom: max(14px, env(safe-area-inset-bottom)); }
.gw-lanterns { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.gw-lantern { position: absolute; bottom: -60px; display: block; border-radius: 40% 40% 22% 22% / 50% 50% 18% 18%;
  background: radial-gradient(60% 55% at 50% 62%, #fff4cc, #ffc861 45%, #f08a2a 85%); box-shadow: 0 0 18px 6px rgba(255,170,70,.4); opacity: 0;
  animation-name: gw-rise, gw-lsway; animation-timing-function: linear, ease-in-out; animation-iteration-count: infinite, infinite; animation-direction: normal, alternate; animation-play-state: paused, paused; }
.gw-finale.is-on .gw-lantern { animation-play-state: running, running; }
@keyframes gw-rise { 0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; } 8% { opacity: .75; } 80% { opacity: .65; } 100% { transform: translate3d(0, -115vh, 0) scale(.55); opacity: 0; } }
@keyframes gw-lsway { from { translate: calc(var(--sway) * -1) 0; } to { translate: var(--sway) 0; } }

/* Low-end phones: no particles, no parallax, fewer loops. */
.gw-root.is-lite .gw-embers, .gw-root.is-lite .gw-dust, .gw-root.is-lite .gw-sweep { display: none; }
.gw-root.is-lite .gw-court-mandala, .gw-root.is-lite .gw-medallion-ring, .gw-root.is-lite .gw-toran { animation: none; }
.gw-root.is-lite .gw-court { --gw-hy: 0px !important; }

@media (prefers-reduced-motion: reduce) {
  .gw-toran, .gw-medal, .gw-gate-cta::after, .gw-flame, .gw-embers i, .gw-court-mandala, .gw-medallion-ring, .gw-jhoomar, .gw-eleph img, .gw-dust i, .gw-bell, .gw-venue-tw circle, .gw-band-top, .gw-band-bottom { animation: none !important; }
  .gw-embers, .gw-dust, .gw-sweep { display: none; }
  .gw-door, .gw-light, .gw-rays, .gw-court *, .gw-court-scene, .gw-scroll-paper, .gw-rod-track, .gw-mohar, .gw-close-seal { transition: none !important; }
  .gw-court-scene { transform: none; }
  .gw-lantern { animation: none !important; opacity: .85; }
  .gw-lantern:nth-child(odd) { bottom: 40%; } .gw-lantern:nth-child(3n) { bottom: 62%; } .gw-lantern:nth-child(even) { bottom: 22%; }
  .gw-drift { transform: none !important; }
}
`;
