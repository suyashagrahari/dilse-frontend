// ─── Lotus Temple Wedding Invitation — the page's own CSS (on top of the kit) ─
// Palette: ivory, lotus-leaf sage, lotus pink, temple gold and a little
// marigold. Every looping or long motion is transform / opacity (individual
// `translate` / `rotate` / `scale` where an entrance and a loop share one
// element). Phones first; 700 / 960 / 1280px widen it into designed spreads.

import { A } from "./art";

const TILE = `url("${A.tile.src}")`;
const GARLAND = `url("${A.garland.src}")`;

export const LW_CSS = `
.lw-root {
  --lw-ease: cubic-bezier(.22,1,.36,1); --lw-soft: cubic-bezier(.22,.61,.36,1); --lw-expo: cubic-bezier(.16,1,.3,1); --lw-spring: cubic-bezier(.34,1.56,.64,1);
  --lw-sage: #6F8F7D; --lw-sage-d: #4E6E5D; --lw-sage-ink: #2F4A3E; --lw-sage-soft: #E3ECE6;
  --lw-pink: #E0779A; --lw-pink-d: #9C3A57; --lw-pink-ink: #7E2943; --lw-pink-soft: #FBE6EC;
  --lw-gold: #C9A24A; --lw-gold-d: #8F6A1F; --lw-marigold: #E8902A;
  --lw-card: #FFFDF8; --lw-line: rgba(201,162,74,.38);
  /* The kit's tokens arrive as inline styles on this element; !important lets the lotus palette win. */
  --wk-accent: var(--lw-sage-d) !important; --wk-accent-ink: #FFFDF6 !important; --wk-surface-2: #F7F4EC !important; --wk-border: rgba(111,143,125,.28) !important;
  /* The kit's linen + silk textures live on the CDN; this page's paper is the owner's in-repo geometric tile instead. */
  --wk-texture: none !important; --wk-paper: none !important;
  overflow-x: clip; color: var(--wk-ink); font-variant-numeric: lining-nums;
}
/* Cormorant's default figures are old-style ("11" reads "II"); every font shorthand resets the variant. */
.lw-root, .lw-root * { font-variant-numeric: lining-nums !important; }
.lw-root[data-wk-theme=blush] { --lw-card: #FFFBFA; --wk-accent: #9C3A57 !important; --wk-surface-2: #FCF3F4 !important; }
.lw-root[data-wk-theme=powder] { --wk-accent: #48707A !important; --wk-surface-2: #F2F6F8 !important; }
.lw-root[data-wk-theme=powder] { --lw-card: #FBFDFF; --lw-sage: #6B8E92; --lw-sage-d: #48707A; --lw-sage-ink: #24444C; --lw-sage-soft: #E2EDF0; }
.lw-root .wk-shimmer { animation: none !important; }
.lw-root img { max-width: none; }

/* One static backdrop: the cream geometric tile under soft lotus + leaf glows. */
.lw-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(60% 40% at 0% 20%, rgba(224,119,154,.08), transparent 70%), radial-gradient(50% 40% at 100% 70%, rgba(111,143,125,.10), transparent 70%), ${TILE} repeat 0 0 / 290px auto; opacity: .9; }

/* ── Shared type + buttons ─────────────────────────────── */
.lw-eyebrow { margin: 0 0 10px; font: 600 12.5px/1.5 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; color: var(--lw-sage-d); }
.lw-root.is-hi .lw-eyebrow { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 15px; }
.lw-h2 { margin: 0; font: 500 clamp(34px, 6.4vw, 58px)/1.08 var(--wk-font-display); color: var(--lw-pink-ink); letter-spacing: -.005em; text-wrap: balance; }
.lw-root.is-hi .lw-h2 { font-family: var(--wk-font-deva); font-size: clamp(30px, 5.6vw, 48px); line-height: 1.3; }
.lw-h3 { margin: 0 0 18px; font: 500 clamp(24px, 4.4vw, 34px)/1.2 var(--wk-font-display); color: var(--lw-pink-ink); text-align: center; }
.lw-head { text-align: center; margin: 0 auto clamp(28px, 5vw, 52px); max-width: 760px; }
.lw-head-div { display: block; width: min(220px, 60vw); height: auto; margin: 16px auto 0; opacity: .85; }
.lw-sec { padding: clamp(60px, 10vw, 120px) 16px; }
@media (min-width: 700px) { .lw-sec { padding-left: 28px; padding-right: 28px; } }

.lw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 0 20px; border-radius: 999px; border: 0; cursor: pointer; text-decoration: none;
  font: 600 14.5px/1.1 var(--wk-font-sans); color: #FFFDF6; background: linear-gradient(135deg, var(--lw-sage) 0%, var(--lw-sage-d) 100%);
  box-shadow: 0 12px 24px -14px rgba(47,74,62,.7), inset 0 1px 0 rgba(255,255,255,.25); transition: transform .25s var(--lw-ease), box-shadow .25s; -webkit-tap-highlight-color: transparent; }
.lw-root[data-wk-theme=blush] .lw-btn:not(.is-ghost) { background: linear-gradient(135deg, #C45F80, var(--lw-pink-d)); box-shadow: 0 12px 24px -14px rgba(126,41,67,.7); }
.lw-btn:hover { transform: translateY(-1px); }
.lw-btn:active { transform: scale(.97); }
.lw-btn:focus-visible, .lw-round:focus-visible, .lw-open-btn:focus-visible, .lw-open-lotus:focus-visible { outline: 3px solid var(--lw-gold); outline-offset: 3px; }
.lw-btn.is-ghost { color: var(--lw-sage-ink); background: rgba(255,253,246,.82); border: 1.5px solid color-mix(in srgb, var(--lw-sage) 45%, transparent); box-shadow: none; }
.lw-btn.is-sm { min-height: 40px; padding: 0 14px; font-size: 13px; }
.lw-btn.is-lg { min-height: 54px; padding: 0 28px; font-size: 16px; }
.lw-btn svg { flex: none; }
.lw-round { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--lw-line); background: var(--lw-card); color: var(--lw-sage-d); cursor: pointer; text-decoration: none; transition: transform .2s var(--lw-ease); }
.lw-round:active { transform: scale(.94); }
.lw-round.is-wa { background: #25D366; border-color: #25D366; color: #fff; }
.lw-round.is-sm { width: 40px; height: 40px; }

/* ── Language toggle ───────────────────────────────────── */
.lw-lang { position: fixed; z-index: 55; top: max(10px, env(safe-area-inset-top)); left: 12px; display: flex; padding: 3px; border-radius: 999px; background: rgba(255,253,246,.92); border: 1px solid var(--lw-line); box-shadow: 0 8px 20px -12px rgba(60,40,10,.35); }
.lw-lang button { min-width: 42px; min-height: 38px; border: 0; border-radius: 999px; background: none; font: 700 13px/1 var(--wk-font-sans); color: var(--lw-sage-ink); cursor: pointer; }
.lw-lang button[aria-pressed=true] { background: var(--lw-sage-d); color: #fff; }

/* ══ The opening ═════════════════════════════════════════ */
.lw-open { position: fixed; inset: 0; z-index: 60; overflow: hidden; background: #FBF6EA; }
.lw-open.is-push { opacity: 0; pointer-events: none; transition: opacity 1s var(--lw-soft) .3s; }
.lw-open.is-reduced.is-push { transition: opacity .4s linear; }
.lw-open-world { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: clamp(78px, 15vh, 150px) 16px max(16px, env(safe-area-inset-bottom)); transform-origin: 50% 66%; }
.lw-open.is-push:not(.is-reduced) .lw-open-world { transform: scale(1.7) translateY(4%); transition: transform 1.4s var(--lw-expo); }
.lw-open-tile { position: absolute; inset: 0; background: radial-gradient(70% 55% at 50% 62%, rgba(255,250,236,.95), rgba(255,250,236,0) 70%), ${TILE} repeat 50% 0 / 290px auto; opacity: .95; }
.lw-open-garland { position: absolute; z-index: 4; top: 0; left: 0; right: 0; height: clamp(26px, 4.6vw, 44px); background: ${GARLAND} repeat-x 0 0 / auto 100%; translate: 0 -110%; transition: translate 1s var(--lw-spring) .1s; }
.lw-open.is-ready .lw-open-garland { translate: 0 0; }
.lw-open-lights { position: absolute; z-index: 3; top: clamp(10px, 2.6vw, 26px); left: -2%; right: -2%; display: flex; opacity: 0; translate: 0 -24px; transition: opacity 1.2s var(--lw-soft) .25s, translate 1.4s var(--lw-ease) .25s; pointer-events: none; }
.lw-open.is-ready .lw-open-lights { opacity: 1; translate: 0 0; }
.lw-open-lights img { width: 100%; height: clamp(120px, 30vw, 300px); object-fit: cover; object-position: 50% 0; }
/* On wide screens the strands would hang through the names: shorter, and faded out at the ends. */
@media (min-width: 960px) { .lw-open-lights img { height: clamp(150px, 17vw, 240px); -webkit-mask-image: linear-gradient(#000 70%, transparent); mask-image: linear-gradient(#000 70%, transparent); } }

.lw-twinkle { position: absolute; width: 10px; height: 10px; margin: -5px; border-radius: 50%; background: radial-gradient(circle, #FFF6CF 0 22%, rgba(255,214,120,.65) 40%, rgba(255,214,120,0) 70%); opacity: .2; animation: lw-twinkle 3s ease-in-out infinite; }
@keyframes lw-twinkle { 0%, 100% { opacity: .15; scale: .7; } 50% { opacity: 1; scale: 1.25; } }

.lw-open-lamps { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.lw-lamp { position: absolute; top: 0; width: clamp(38px, 6.4vw, 62px); transform-origin: 50% 0; translate: 0 -105%; rotate: -2deg;
  transition: translate 1.4s var(--lw-ease) calc(.35s + var(--i) * .12s); animation: lw-lamp-sway 5.4s ease-in-out infinite alternate; animation-delay: calc(var(--i) * -1.3s); }
.lw-lamp img { display: block; width: 100%; height: auto; }
.lw-open.is-ready .lw-lamp { translate: 0 var(--lw-lamp-y, -18%); }
.lw-lamp-0 { left: 3%; --lw-lamp-y: -2%; }
.lw-lamp-1 { left: 15%; --lw-lamp-y: -46%; display: none; }
.lw-lamp-2 { right: 15%; --lw-lamp-y: -40%; display: none; }
.lw-lamp-3 { right: 3%; --lw-lamp-y: 4%; }
@media (min-width: 700px) { .lw-lamp-0 { --lw-lamp-y: -14%; } .lw-lamp-3 { --lw-lamp-y: -8%; } .lw-lamp-1 { --lw-lamp-y: -30%; } .lw-lamp-2 { --lw-lamp-y: -24%; } }
@media (min-width: 1280px) { .lw-lamp { width: clamp(62px, 4.6vw, 88px); } }
/* Keep the right-hand lamp clear of the brand mark / top-bar pill that sits in the top-right corner. */
@media (min-width: 700px) { .lw-lamp-3 { right: max(3%, 92px); } .lw-lamp-2 { right: max(15%, 200px); } }
@media (min-width: 700px) { .lw-lamp-1, .lw-lamp-2 { display: block; } }
@keyframes lw-lamp-sway { from { rotate: -2.2deg; } to { rotate: 2.2deg; } }
.lw-lamp-glow { position: absolute; left: 50%; bottom: 0; width: 320%; aspect-ratio: 1; translate: -50% 42%; border-radius: 50%; background: radial-gradient(circle, rgba(255,214,120,.62), rgba(255,190,90,.18) 40%, transparent 66%); opacity: 0; transition: opacity 1s var(--lw-soft) calc(var(--i) * .28s); }
.lw-lamp-flame { position: absolute; bottom: 9.6%; width: 13%; aspect-ratio: .55; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%; background: radial-gradient(ellipse at 50% 70%, #FFF7D6, #FFC24D 55%, #F08A1C); opacity: 0; scale: .2; transform-origin: 50% 100%; transition: opacity .5s calc(var(--i) * .28s), scale .6s var(--lw-spring) calc(var(--i) * .28s); }
.lw-lamp-flame-l { left: 4%; }
.lw-lamp-flame-r { right: 4%; }
.lw-lamp.is-lit .lw-lamp-glow { opacity: 1; }
.lw-lamp.is-lit .lw-lamp-flame { opacity: 1; scale: 1; animation: lw-flicker 1.6s ease-in-out infinite alternate; animation-delay: calc(var(--i) * .28s + .6s); }
@keyframes lw-flicker { 0% { scale: 1 1; } 40% { scale: .9 1.12; } 70% { scale: 1.06 .94; } 100% { scale: .95 1.06; } }

.lw-open-side { position: absolute; inset: auto 0 0 0; height: 0; z-index: 1; pointer-events: none; }
.lw-open-side img { position: absolute; bottom: 0; height: auto; opacity: 0; translate: 0 30px; transition: opacity 1.2s var(--lw-soft) .5s, translate 1.4s var(--lw-ease) .5s; }
.lw-open.is-ready .lw-open-side img { opacity: 1; translate: 0 0; }
.lw-open-cluster { left: -6%; width: clamp(130px, 34vw, 440px); }
.lw-open-pair { right: -6%; width: clamp(120px, 30vw, 420px); transform: scaleX(-1); }
@media (max-width: 699px) { .lw-open-side img { opacity: 0 !important; } .lw-open.is-ready .lw-open-side img { opacity: .55 !important; } }

.lw-open-copy { position: relative; z-index: 4; text-align: center; max-width: 640px; }
/* An ivory halo so the hanging string-light strands pass behind the names instead of through them. */
.lw-open-copy::before { content: ""; position: absolute; inset: -12% -22%; z-index: -1; pointer-events: none; background: radial-gradient(closest-side, rgba(251,246,234,.97) 62%, rgba(251,246,234,0)); }
.lw-open-copy > * { opacity: 0; translate: 0 14px; transition: opacity .9s var(--lw-soft), translate 1s var(--lw-ease); }
.lw-open.is-ready .lw-open-copy > * { opacity: 1; translate: 0 0; }
.lw-open.is-ready .lw-open-copy > :nth-child(2) { transition-delay: .55s; }
.lw-open.is-ready .lw-open-copy > :nth-child(3) { transition-delay: .7s; }
.lw-open.is-ready .lw-open-copy > :nth-child(4) { transition-delay: .85s; }
.lw-open.is-ready .lw-open-copy > :first-child { transition-delay: .4s; }
.lw-open-ganesh { display: block; width: clamp(150px, 38vw, 220px); height: auto; margin: 0 auto 6px; }
.lw-open-dear { margin: 0; font: italic 500 clamp(17px, 4.2vw, 21px)/1.4 var(--wk-font-display); color: var(--lw-pink-d); }
.lw-open-dear b { font-weight: 700; font-style: normal; }
.lw-open-names { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; gap: 0 .22em; margin: 4px 0 2px; font: 400 clamp(46px, 12.5vw, 92px)/1.12 var(--wk-font-script); color: var(--lw-pink-ink); }
.lw-open-names i { font: italic 400 .48em var(--wk-font-display); color: var(--lw-gold-d); }
.lw-open-date { margin: 0; font: 600 12.5px/1.4 var(--wk-font-sans); letter-spacing: .32em; text-transform: uppercase; color: var(--lw-sage-d); }

.lw-open-stage { position: relative; z-index: 3; width: min(94vw, 700px, 58vh); aspect-ratio: 1.3; margin: 8px 0; opacity: 0; translate: 0 30px; transition: opacity 1.2s var(--lw-soft) .6s, translate 1.4s var(--lw-ease) .6s; }
.lw-open.is-ready .lw-open-stage { opacity: 1; translate: 0 0; }
.lw-pond { position: absolute; left: -6%; right: -6%; bottom: 0; height: 44%; }
.lw-pond-water { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(50% 50% at 50% 46%, rgba(196,222,211,.95), rgba(176,208,196,.75) 55%, rgba(176,208,196,0) 72%); }
.lw-pond-water::after { content: ""; position: absolute; inset: 14% 18%; border-radius: 50%; background: repeating-radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.0) 0 9px, rgba(255,255,255,.35) 10px, rgba(255,255,255,0) 12px); opacity: .55; }
.lw-ripple { position: absolute; left: 50%; top: 46%; width: 56%; aspect-ratio: 3; margin: 0 0 0 -28%; translate: 0 -50%; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.95); opacity: 0; scale: .3; animation: lw-ripple 6.6s var(--lw-soft) infinite; }
.lw-ripple:nth-of-type(3) { animation-delay: 2.2s; }
.lw-ripple:nth-of-type(4) { animation-delay: 4.4s; }
.lw-ripple-burst { animation: none; }
@keyframes lw-ripple { 0% { opacity: 0; scale: .3; } 15% { opacity: .9; } 100% { opacity: 0; scale: 1.7; } }
.lw-open.is-bloom .lw-ripple-burst, .lw-open.is-push .lw-ripple-burst { animation: lw-ripple 1.8s var(--lw-soft) 1 both; border-width: 2.5px; }

.lw-stems { position: absolute; inset: 0; }
.lw-stem { position: absolute; bottom: 22%; width: auto; transform-origin: 50% 100%; -webkit-mask-image: linear-gradient(#000 82%, transparent); mask-image: linear-gradient(#000 82%, transparent); animation: lw-stem 7s ease-in-out infinite alternate; }
.lw-stem-leaf { left: 2%; height: 74%; animation-duration: 8s; }
.lw-stem-budb { left: 19%; height: 58%; animation-delay: -2s; }
.lw-stem-tilt { right: 0; height: 72%; animation-delay: -4s; }
.lw-stem-pod { right: 17%; height: 56%; animation-delay: -1s; }
.lw-stem-buda { right: 33%; height: 80%; bottom: 30%; animation-delay: -3s; opacity: .95; }
@keyframes lw-stem { from { rotate: -1.6deg; } to { rotate: 1.6deg; } }
.lw-pad { position: absolute; display: block; animation: lw-bob 5s ease-in-out infinite alternate; }
.lw-pad img { display: block; width: 100%; height: auto; scale: 1 .36; filter: drop-shadow(0 6px 6px rgba(47,74,62,.18)); }
.lw-pad-l { left: -2%; bottom: -6%; width: 34%; }
.lw-pad-r { right: 2%; bottom: 2%; width: 24%; animation-delay: -2.4s; }
.lw-pad-r img { transform: scaleX(-1) rotate(20deg); }
@keyframes lw-bob { from { translate: 0 0; } to { translate: 0 -4px; } }

.lw-open-lotus { position: absolute; left: 50%; bottom: 15%; width: 76%; margin-left: -38%; padding: 0; border: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; border-radius: 40%; }
.lw-open.is-closed .lw-open-lotus .lw-bloom { animation: lw-breathe 3.6s ease-in-out infinite alternate; }
@keyframes lw-breathe { from { scale: 1; } to { scale: 1.035; } }
.lw-bloom { display: block; width: 100%; height: auto; overflow: visible; transform-origin: 50% 85%; }
.lw-petal { transform-box: fill-box; transform-origin: 50% 100%; transform: rotate(calc(var(--a) * .2)) scale(.8, .82); transition: transform 1.7s var(--lw-expo) var(--d); }
.lw-bloom.is-open .lw-petal { transform: rotate(var(--a)) scale(1, 1); }
.lw-bloom-halo { opacity: 0; transition: opacity 1.6s var(--lw-soft) .3s; }
.lw-bloom.is-open .lw-bloom-halo { opacity: 1; }
.lw-bloom-pod { opacity: 0; transition: opacity .8s .5s; }
.lw-bloom.is-open .lw-bloom-pod { opacity: 1; }

.lw-motes { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
.lw-motes i { position: absolute; bottom: 42%; border-radius: 50% 50% 50% 50% / 64% 64% 36% 36%; background: linear-gradient(180deg, #F2A3BA, #FBE0E8); opacity: 0; animation: lw-mote 3s var(--lw-soft) both; }
@keyframes lw-mote { 0% { opacity: 0; transform: translate(0, 0) rotate(0); } 15% { opacity: .95; } 100% { opacity: 0; transform: translate(var(--dx), -58vh) rotate(var(--rot)); } }

.lw-open-cta { position: relative; z-index: 4; text-align: center; opacity: 0; translate: 0 12px; transition: opacity 1s var(--lw-soft) 1.1s, translate 1s var(--lw-ease) 1.1s; }
.lw-open.is-ready .lw-open-cta { opacity: 1; translate: 0 0; }
.lw-open.is-bloom .lw-open-cta, .lw-open.is-push .lw-open-cta { opacity: 0; transition-delay: 0s; }
.lw-open-btn { position: relative; display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 26px; border-radius: 999px; border: 0; cursor: pointer;
  font: 600 15.5px/1 var(--wk-font-sans); color: #FFFDF6; background: linear-gradient(135deg, var(--lw-sage), var(--lw-sage-d)); box-shadow: 0 16px 30px -16px rgba(47,74,62,.8); }
.lw-open-btn::after { content: ""; position: absolute; inset: -2px; border-radius: inherit; border: 2px solid var(--lw-sage); opacity: 0; animation: lw-ping 2.6s var(--lw-soft) 2.2s infinite; pointer-events: none; }
@keyframes lw-ping { 0% { opacity: .7; scale: 1; } 100% { opacity: 0; scale: 1.25 1.6; } }
.lw-open-hint { margin: 10px 0 0; font: 500 12.5px/1.4 var(--wk-font-sans); color: var(--wk-muted); }
@media (max-height: 640px) { .lw-open-ganesh { width: 130px; } .lw-open-names { font-size: clamp(38px, 10vw, 64px); } .lw-open-stage { width: min(90vw, 52vh * 1.3); } }

/* ══ The hero ════════════════════════════════════════════ */
.lw-hero { position: relative; overflow: hidden; padding: clamp(150px, 34vw, 230px) 16px 70px; --lw-sy: 0; }
.lw-hero-garland { position: absolute; z-index: 3; top: 0; left: 0; right: 0; height: clamp(26px, 4.4vw, 42px); background: ${GARLAND} repeat-x 0 0 / auto 100%; translate: 0 -110%; }
.lw-hero.is-on .lw-hero-garland { animation: lw-garland 1.6s var(--lw-ease) .15s both; }
@keyframes lw-garland { 0% { translate: 0 -110%; } 55% { translate: 0 14%; } 75% { translate: 0 -5%; } 100% { translate: 0 0; } }
.lw-hero-lights { position: absolute; z-index: 1; top: clamp(12px, 3vw, 28px); left: -2%; right: -2%; opacity: 0; translate: 0 -20px; transition: opacity 1.4s var(--lw-soft) .35s, translate 1.6s var(--lw-ease) .35s; pointer-events: none; }
.lw-hero-lights, .lw-finale-lights { display: flex; }
.lw-hero-lights img, .lw-finale-lights img { display: block; width: 100%; height: clamp(110px, 24vw, 230px); object-fit: cover; object-position: 50% 0; }
.lw-lights-b { display: none !important; }
@media (min-width: 960px) { .lw-hero-lights img, .lw-finale-lights img, .lw-open-lights img { width: 50%; } .lw-lights-b { display: block !important; transform: scaleX(-1); } }
.lw-hero.is-on .lw-hero-lights { opacity: 1; translate: 0 0; }
.lw-hero-grid { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 20px; max-width: 1260px; margin: 0 auto; }
.lw-hero-words { position: relative; order: 1; text-align: center; max-width: 620px; }
.lw-hero-art { order: 2; position: relative; width: min(100%, 480px); aspect-ratio: .92; }
@media (min-width: 960px) {
  .lw-hero { min-height: 100svh; padding: clamp(130px, 13vw, 190px) 40px 60px; display: flex; flex-direction: column; justify-content: center; }
  .lw-hero-grid { display: grid; grid-template-columns: 1.02fr 1fr; align-items: center; gap: clamp(28px, 4vw, 72px); width: 100%; }
  .lw-hero-art { order: 1; width: 100%; max-width: 620px; justify-self: end; }
  .lw-hero-words { order: 2; text-align: left; justify-self: start; padding-right: 150px; }
}
@media (min-width: 1280px) { .lw-hero-words { padding-right: 190px; } }
@media (min-width: 960px) { .lw-hero-art { z-index: 1; } .lw-hero-words { z-index: 2; } }
@media (min-width: 960px) and (max-width: 1279px) { .lw-hero-words { padding-right: 128px; } }
.lw-in { opacity: 0; translate: 0 18px; transition: opacity 1s var(--lw-soft), translate 1.1s var(--lw-ease); transition-delay: calc(var(--d, 0ms) + .25s); }
.lw-hero.is-on .lw-in { opacity: 1; translate: 0 0; }
.lw-hero-ganesha { display: block; width: 52px; height: auto; margin: 0 auto 14px; }
.lw-hero-dear { margin: 0 0 6px; font: italic 500 clamp(18px, 3.6vw, 22px)/1.35 var(--wk-font-display); color: var(--lw-pink-d); }
.lw-hero-kicker { margin: 0; font: 600 12.5px/1.5 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--lw-sage-d); }
.lw-root.is-hi .lw-hero-kicker { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 16px; }
.lw-hero-names { margin: 10px 0 6px; font: 400 clamp(58px, 15vw, 108px)/.98 var(--wk-font-script); color: var(--lw-pink-ink); }
.lw-hero-names > span { display: block; }
.lw-hero-names > i { display: block; margin: -.08em 0 -.02em; font: italic 400 .38em/1.2 var(--wk-font-display); color: var(--lw-gold-d); }
.lw-hero-line { margin: 0 auto; max-width: 30ch; font: italic 400 clamp(18px, 3.4vw, 22px)/1.45 var(--wk-font-display); color: var(--wk-ink); }
.lw-root.is-hi .lw-hero-line { font-family: var(--wk-font-deva); font-style: normal; font-size: 18px; line-height: 1.8; }
.lw-hero-div { display: block; width: 200px; height: auto; margin: 18px auto; }
.lw-hero-when { margin: 0; font: 600 clamp(19px, 3.6vw, 23px)/1.3 var(--wk-font-display); color: var(--wk-ink); }
.lw-hero-muhurat { margin: 4px 0 0; font: italic 500 17px/1.4 var(--wk-font-display); color: var(--lw-pink-d); }
.lw-hero-venue { margin: 6px 0 0; font: 500 14px/1.5 var(--wk-font-sans); letter-spacing: .06em; color: var(--wk-muted); }
.lw-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 24px; }
@media (min-width: 960px) { .lw-hero-ganesha, .lw-hero-line, .lw-hero-div { margin-left: 0; } .lw-hero-actions { justify-content: flex-start; } }

/* The date badge hangs on its cord from the string lights and swings in. */
.lw-hero-badge { position: relative; width: clamp(104px, 26vw, 128px); margin: 0 auto 18px; transform-origin: 50% -120px; opacity: 0; }
.lw-hero.is-on .lw-hero-badge { animation: lw-badge-in 2.6s var(--lw-soft) .5s both; }
@keyframes lw-badge-in { 0% { opacity: 0; translate: 0 -60px; rotate: -16deg; } 20% { opacity: 1; } 40% { rotate: 9deg; translate: 0 0; } 60% { rotate: -5deg; } 78% { rotate: 2.5deg; } 100% { opacity: 1; rotate: 0deg; translate: 0 0; } }
.lw-hero-cord { position: absolute; left: 50%; bottom: 99%; width: 1.5px; height: 160px; margin-left: -.75px; background: linear-gradient(to top, var(--lw-gold), rgba(201,162,74,0)); }
.lw-badge { display: block; width: 100%; height: auto; filter: drop-shadow(0 14px 16px rgba(47,74,62,.28)); }
@media (min-width: 960px) {
  .lw-hero-badge { position: absolute; top: -40px; right: 0; width: clamp(122px, 10vw, 150px); margin: 0; }
  .lw-hero-cord { height: 50vh; }
}
@media (max-width: 959px) { .lw-hero-cord { height: 120px; } }

.lw-hero-sun { position: absolute; left: 50%; top: 40%; width: 92%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(circle, rgba(255,240,205,.95), rgba(251,220,228,.5) 46%, rgba(251,220,228,0) 70%); opacity: 0; transition: opacity 1.6s var(--lw-soft) .2s; }
.lw-hero.is-on .lw-hero-sun { opacity: 1; }
.lw-hero-gopuram { position: absolute; left: 4%; top: 0; width: 78%; height: auto; opacity: 0; translate: 0 calc(var(--lw-sy) * .08px); transition: opacity 1.8s var(--lw-soft) .2s; }
.lw-hero.is-on .lw-hero-gopuram { opacity: .95; }
.lw-hero-couple { position: absolute; left: 10%; bottom: 7%; width: 80%; height: auto; opacity: 0; translate: 0 calc(30px + var(--lw-sy) * .03px); scale: .96; transform-origin: 50% 100%; transition: opacity 1.2s var(--lw-soft) .45s, translate 1.5s var(--lw-ease) .45s, scale 1.6s var(--lw-ease) .45s; }
.lw-hero.is-on .lw-hero-couple { opacity: 1; translate: 0 calc(var(--lw-sy) * .03px); scale: 1; }
.lw-hero-pond { position: absolute; bottom: -3%; height: auto; opacity: 0; translate: 0 50px; transition: opacity 1.2s var(--lw-soft), translate 1.6s var(--lw-ease); }
.lw-hero-pond-l { left: -12%; width: 46%; transition-delay: .75s; }
.lw-hero-pond-r { right: -12%; width: 46%; transform: scaleX(-1); transition-delay: .9s; }
/* Two columns: keep the right-hand lotus inside the art column, clear of the names and the date line. */
@media (min-width: 960px) { .lw-hero-pond-r { right: 4%; width: 34%; } }
.lw-hero.is-on .lw-hero-pond { opacity: 1; translate: 0 calc(var(--lw-sy) * -.04px); }
.lw-hero-water { position: absolute; left: -14%; right: -14%; bottom: -2%; height: 16%; border-radius: 50%; background: radial-gradient(50% 50% at 50% 50%, rgba(196,222,211,.85), rgba(196,222,211,0) 72%); }
.lw-hero-scroll { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px; width: max-content; margin: 34px auto 0; font: 600 11px/1 var(--wk-font-sans); letter-spacing: .3em; text-transform: uppercase; color: var(--lw-sage-d); text-decoration: none; opacity: 0; transition: opacity 1s 1.8s; }
.lw-hero.is-on .lw-hero-scroll { opacity: .85; }
.lw-hero-scroll i { width: 1.5px; height: 34px; background: linear-gradient(var(--lw-sage), transparent); transform-origin: 50% 0; animation: lw-scroll 2.2s ease-in-out infinite; }
@keyframes lw-scroll { 0% { scale: 1 0; opacity: 1; } 60% { scale: 1 1; opacity: 1; } 100% { scale: 1 1; opacity: 0; } }

/* ══ The invitation ══════════════════════════════════════ */
.lw-sec-invite { padding-top: clamp(40px, 6vw, 70px); }
.lw-hands { position: relative; z-index: 2; width: min(100%, 720px); margin: 0 auto -7%; }
.lw-hands img { display: block; width: 100%; height: auto; }
.lw-invite { position: relative; max-width: 940px; margin: 0 auto; padding: clamp(56px, 9vw, 92px) clamp(20px, 6vw, 72px) clamp(64px, 9vw, 96px); text-align: center; background: var(--lw-card); border-radius: 28px; border: 1px solid var(--lw-line); box-shadow: 0 30px 60px -40px rgba(98,72,20,.45); }
.lw-invite::before { content: ""; position: absolute; inset: 10px; border-radius: 20px; border: 1px solid rgba(201,162,74,.28); pointer-events: none; }
.lw-corner { position: absolute; bottom: 12px; width: clamp(78px, 15vw, 140px); height: auto; opacity: .95; pointer-events: none; }
.lw-corner-l { left: 12px; }
.lw-corner-r { right: 12px; }
.lw-invite .wk-msg-heading { color: var(--lw-pink-ink); }
.lw-invite .wk-msg-text p { color: var(--wk-ink); }

/* ══ Families ════════════════════════════════════════════ */
.lw-elders { text-align: center; margin: 0 auto 30px; max-width: 640px; }
.lw-elders-n { margin: 0; font: italic 500 clamp(19px, 3.6vw, 23px)/1.45 var(--wk-font-display); color: var(--wk-ink); }
.lw-fam-grid { position: relative; display: grid; gap: 22px; max-width: 860px; margin: 0 auto; }
@media (min-width: 700px) { .lw-fam-grid { grid-template-columns: 1fr 1fr; gap: 56px; } .lw-fam-grid.is-one { grid-template-columns: minmax(0, 420px); justify-content: center; } }
.lw-fam { position: relative; text-align: center; padding: 30px 22px 28px; background: var(--lw-card); border: 1px solid var(--lw-line); border-radius: 999px 999px 24px 24px / 200px 200px 24px 24px; box-shadow: 0 24px 50px -36px rgba(98,72,20,.5); }
.lw-fam-photo { position: relative; display: block; width: min(170px, 60%); aspect-ratio: 4 / 5; margin: 0 auto 16px; overflow: hidden; border-radius: 999px 999px 16px 16px; border: 3px solid #fff; box-shadow: 0 0 0 1px var(--lw-line), 0 14px 24px -16px rgba(0,0,0,.4); background: var(--wk-placeholder); }
.lw-fam-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lw-fam-icon img { display: block; height: 110px; width: auto; margin: 0 auto 10px; }
.lw-fam-t { margin: 0 0 8px; font: 600 12px/1.4 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--lw-sage-d); }
.lw-root.is-hi .lw-fam-t { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 15px; }
.lw-fam-n { margin: 0; font: 500 clamp(21px, 3.8vw, 25px)/1.35 var(--wk-font-display); color: var(--lw-pink-ink); }
.lw-fam-note { margin: 6px 0 0; font: 500 14px/1.4 var(--wk-font-sans); color: var(--wk-muted); letter-spacing: .04em; }
.lw-fam-mid { display: none; }
@media (min-width: 700px) { .lw-fam-mid { display: block; position: absolute; left: 50%; top: 50%; width: 120px; translate: -50% -50%; z-index: 2; animation: lw-float 6s ease-in-out infinite alternate; } .lw-fam-mid img { display: block; width: 100%; height: auto; } }
@keyframes lw-float { from { translate: -50% -50%; } to { translate: -50% calc(-50% - 8px); } }

/* ══ Date + countdown ════════════════════════════════════ */
.lw-sec-date { position: relative; }
.lw-date-lamps { position: absolute; inset: 0 0 auto 0; height: 0; pointer-events: none; }
.lw-date-lamp { position: absolute; top: -30px; width: clamp(34px, 6vw, 58px); height: auto; transform-origin: 50% 0; animation: lw-lamp-sway 6s ease-in-out infinite alternate; }
.lw-date-lamp-l { left: clamp(6px, 4vw, 60px); }
.lw-date-lamp-r { right: clamp(6px, 4vw, 60px); animation-delay: -3s; }
.lw-date { display: flex; flex-direction: column; align-items: center; gap: 26px; }
@media (min-width: 860px) { .lw-date { flex-direction: row; justify-content: center; gap: 64px; } }
.lw-date-badge { width: clamp(150px, 40vw, 210px); }
.lw-date-badge .lw-badge { transform-origin: 50% 0; animation: lw-badge-sway 5s ease-in-out infinite alternate; }
@keyframes lw-badge-sway { from { rotate: -1.6deg; } to { rotate: 1.6deg; } }
.lw-date-count { text-align: center; }
.lw-date-line { margin: 18px 0 0; font: 600 clamp(18px, 3.4vw, 22px)/1.4 var(--wk-font-display); color: var(--wk-ink); }
.lw-date-muh { margin: 4px 0 0; font: italic 500 17px/1.4 var(--wk-font-display); color: var(--lw-pink-d); }

/* ══ Story ═══════════════════════════════════════════════ */
.lw-story { position: relative; display: grid; gap: 26px; --lw-p: 0; }
@media (min-width: 960px) { .lw-story { grid-template-columns: minmax(300px, .8fr) 1.2fr; gap: clamp(40px, 5vw, 80px); align-items: start; } }
.lw-story-art { position: relative; width: min(58%, 240px); margin: 0 auto; }
@media (min-width: 960px) { .lw-story-art { width: 100%; max-width: 380px; height: 100%; } .lw-story-pin { position: sticky; top: 14vh; } }
.lw-story-pin { position: relative; padding-top: 24%; }
/* The branch sits BEHIND the swing: its low twigs used to cover the groom's face. */
.lw-story-branch { position: absolute; z-index: 0; top: 0; left: -18%; width: 136%; height: auto; pointer-events: none; }
.lw-story-swing { position: relative; z-index: 1; display: block; width: 92%; height: auto; margin: 0 auto; transform-origin: 50% 0; animation: lw-swing 4.8s ease-in-out infinite alternate; }
@keyframes lw-swing { from { rotate: -1.8deg; } to { rotate: 1.8deg; } }
.lw-story-feather { position: absolute; z-index: 3; bottom: 4%; right: -2%; width: 54px; height: auto; rotate: -24deg; }
.lw-story-body { position: relative; padding-left: 46px; }
.lw-story-stem { position: absolute; left: 17px; top: 6px; bottom: 6px; width: 2px; border-radius: 2px; background: rgba(111,143,125,.18); }
.lw-story-stem i { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(var(--lw-gold), var(--lw-sage)); transform-origin: 50% 0; transform: scaleY(var(--lw-p)); }
.lw-chapters { list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(30px, 5vw, 48px); }
.lw-ch { position: relative; display: grid; gap: 14px; }
@media (min-width: 700px) { .lw-ch { grid-template-columns: minmax(150px, 210px) 1fr; gap: 26px; align-items: center; } .lw-ch.no-photo { grid-template-columns: 1fr; } }
.lw-ch-dot { position: absolute; left: -41px; top: 2px; display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: var(--lw-card); box-shadow: 0 0 0 1px var(--lw-line); }
.lw-ch-photo { position: relative; width: min(240px, 100%); aspect-ratio: 4 / 5; overflow: hidden; border-radius: 999px 999px 18px 18px; border: 3px solid #fff; box-shadow: 0 0 0 1px var(--lw-line), 0 20px 36px -24px rgba(60,40,10,.5); background: var(--wk-placeholder); }
.lw-ch-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lw-ch-when { margin: 0 0 4px; font: 600 12px/1.4 var(--wk-font-caps); letter-spacing: .26em; color: var(--lw-sage-d); }
.lw-ch-title { margin: 0 0 8px; font: 500 clamp(24px, 4.2vw, 30px)/1.2 var(--wk-font-display); color: var(--lw-pink-ink); }
.lw-ch-line { margin: 0; max-width: 52ch; font: 400 clamp(16px, 2.8vw, 18px)/1.65 var(--wk-font-display); color: var(--wk-ink); }

/* ══ Functions ═══════════════════════════════════════════ */
.lw-sec-events { position: relative; }
.lw-umbrellas { position: absolute; inset: 0 0 auto 0; height: 0; pointer-events: none; z-index: 1; }
.lw-umbrella { position: absolute; top: -30px; width: clamp(70px, 14vw, 160px); height: auto; transform-origin: 50% 0; animation: lw-lamp-sway 5.6s ease-in-out infinite alternate; }
.lw-umbrella-l { left: clamp(-10px, 1vw, 30px); }
.lw-umbrella-r { right: clamp(-10px, 1vw, 30px); animation-delay: -2.8s; }
@media (max-width: 699px) { .lw-umbrella { top: -46px; width: 64px; opacity: .9; } }
/* Flex, not grid, so a last row with fewer cards (4 functions on 3 columns) sits centred instead of hanging left. */
.lw-ev-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 26px; }
.lw-ev-list > * { flex: 0 0 100%; min-width: 0; }
@media (min-width: 700px) { .lw-ev-list > * { flex-basis: calc((100% - 26px) / 2); } }
@media (min-width: 1100px) { .lw-ev-list { gap: 30px; } .lw-ev-list > * { flex-basis: calc((100% - 60px) / 3); } }
.lw-ev { min-width: 0; }
.lw-ev-card { position: relative; height: 100%; padding: 0 0 22px; background: var(--lw-card); border: 1px solid var(--lw-line); border-radius: 28px; box-shadow: 0 26px 50px -38px rgba(60,40,10,.55); transition: transform .45s var(--lw-ease), box-shadow .45s; }
@media (hover: hover) { .lw-ev-card:hover { transform: translateY(-4px); box-shadow: 0 34px 60px -36px rgba(60,40,10,.55); } }
.lw-ev-sprig { position: absolute; z-index: 2; top: -22px; right: 6px; height: 118px; width: auto; transform-origin: 50% 100%; rotate: 8deg; pointer-events: none; animation: lw-stem 6s ease-in-out infinite alternate; }
.lw-ev-arch { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; width: min(76%, 250px); height: 168px; margin: 16px auto 0; padding-top: 20px; border-radius: 999px 999px 18px 18px; box-shadow: inset 0 0 0 1px rgba(255,240,200,.35), inset 0 0 0 6px rgba(255,255,255,.06); color: #F6E7BC; background: radial-gradient(80% 70% at 50% 0%, rgba(255,255,255,.18), transparent 60%), linear-gradient(165deg, #8DAA98, #5A7A69); }
.lw-root[data-wk-theme=powder] .lw-ev-arch { background: radial-gradient(80% 70% at 50% 0%, rgba(255,255,255,.18), transparent 60%), linear-gradient(165deg, #8FB0B4, #4F767E); }
.lw-ev.is-main .lw-ev-arch { background: radial-gradient(80% 70% at 50% 0%, rgba(255,255,255,.22), transparent 60%), linear-gradient(165deg, #E39AB1, #A3405C); }
.lw-ev-day { font: 500 52px/1 var(--wk-font-display); background: linear-gradient(180deg, #FFF3C6, #E2BC63); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lw-ev-mon { font: 600 12.5px/1.2 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; }
/* Tracking pulls Devanagari's joined letters apart ("फ़ र ०"): in Hindi the month, the opening date and the seal sit untracked in the Devanagari face. */
.lw-root.is-hi .lw-ev-mon, .lw-root.is-hi .lw-open-date, .lw-root.is-hi .lw-seal small { font-family: var(--wk-font-deva); letter-spacing: .02em; }
.lw-root.is-hi .lw-ev-mon { font-size: 14px; }
.lw-root.is-hi .wk-cd-label, .lw-root.is-hi .wk-rsvp-by { font-family: var(--wk-font-deva); letter-spacing: .02em; }
.lw-ev-wd { font: italic 500 14px/1.2 var(--wk-font-display); opacity: .9; }
/* A column, so each card's actions sit on its bottom edge and line up across a row whatever the note length. */
.lw-ev-card { display: flex; flex-direction: column; }
.lw-ev-body { flex: 1; display: flex; flex-direction: column; padding: 18px 20px 0; }
.lw-ev-title { margin: 0 0 12px; font: 500 clamp(25px, 4vw, 29px)/1.15 var(--wk-font-display); color: var(--lw-pink-ink); }
.lw-ev-line { display: flex; align-items: flex-start; gap: 10px; margin: 0 0 9px; font: 400 14.5px/1.45 var(--wk-font-sans); color: var(--wk-ink); }
.lw-ev-line > svg { flex: none; margin-top: 2px; color: var(--lw-sage-d); }
.lw-ev-line b { font-weight: 600; }
.lw-ev-addr { display: block; color: var(--wk-muted); font-size: 13.5px; }
.lw-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--lw-gold); }
.lw-ev-k { font-weight: 700; color: var(--lw-sage-d); }
.lw-ev-note { margin: 12px 0 0; padding: 2px 0 2px 12px; border-left: 2px solid var(--lw-pink); font: italic 400 16px/1.55 var(--wk-font-display); color: var(--wk-muted); }
.lw-ev-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: auto; padding-top: 16px; }
.lw-ev-actions > * { justify-content: center; width: 100%; min-width: 0; white-space: nowrap; }
.lw-ev-actions > * > span { overflow: hidden; text-overflow: ellipsis; }
.lw-ev-wa { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 0; cursor: pointer; font: 700 14px/1 var(--wk-font-sans); color: #fff; background: #1FA855; box-shadow: 0 10px 20px -14px rgba(18,120,60,.9); }
.lw-ev-wa:focus-visible, .lw-ev-g:focus-visible { outline: 3px solid var(--lw-gold); outline-offset: 3px; }
.lw-ev-g { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1.5px solid color-mix(in srgb, var(--lw-sage) 45%, transparent); font: 700 14px/1 var(--wk-font-sans); color: var(--lw-sage-ink); text-decoration: none; background: rgba(255,253,246,.82); }
.lw-ev-all { display: flex; justify-content: center; margin-top: 32px; }

/* ══ Venue ═══════════════════════════════════════════════ */
.lw-venue { display: grid; gap: 28px; align-items: center; }
@media (min-width: 960px) { .lw-venue { grid-template-columns: 1fr 1fr; gap: 56px; } }
.lw-venue-art { position: relative; width: min(100%, 520px); aspect-ratio: .92; margin: 0 auto; }
.lw-venue-glow { position: absolute; left: 50%; top: 42%; width: 90%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(circle, rgba(255,240,205,.95), rgba(251,220,228,.45) 50%, transparent 70%); }
.lw-venue-gopuram { position: absolute; left: 50%; bottom: 14%; width: 62%; height: auto; translate: -50% 0; }
.lw-venue-banana { position: absolute; bottom: 10%; width: 42%; height: auto; transform-origin: 50% 100%; }
.lw-venue-banana-l { left: -4%; rotate: -6deg; }
.lw-venue-banana-r { right: -4%; transform: scaleX(-1); rotate: 6deg; }
.lw-venue.is-on .lw-venue-banana-l { animation: lw-leaf-l 6s ease-in-out infinite alternate; }
.lw-venue.is-on .lw-venue-banana-r { animation: lw-leaf-r 7s ease-in-out infinite alternate; }
@keyframes lw-leaf-l { from { rotate: -7deg; } to { rotate: -3deg; } }
@keyframes lw-leaf-r { from { rotate: 7deg; } to { rotate: 3deg; } }
.lw-venue-lotus { position: absolute; left: 50%; bottom: -4%; width: 62%; height: auto; translate: -50% 0; }
.lw-venue-card .wk-card { background: var(--lw-card); }

/* ══ Good to know, contacts, live, film, shagun, share ═══ */
.lw-know { list-style: none; margin: 0 auto; padding: 0; display: grid; gap: 14px; max-width: 900px; }
@media (min-width: 700px) { .lw-know { grid-template-columns: 1fr 1fr; } }
.lw-know-i { padding: 18px 20px; border-radius: 20px; background: var(--lw-card); border: 1px solid var(--lw-line); }
.lw-know-h { margin: 0 0 6px; font: 600 12px/1.4 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--lw-sage-d); }
.lw-know-t { margin: 0; font: 400 16.5px/1.6 var(--wk-font-display); color: var(--wk-ink); }
.lw-contacts-wrap { margin: clamp(40px, 7vw, 64px) auto 0; max-width: 900px; text-align: center; }
.lw-contacts { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; text-align: left; }
@media (min-width: 700px) { .lw-contacts { grid-template-columns: 1fr 1fr; } }
.lw-contact { display: flex; align-items: center; gap: 14px; padding: 14px 14px 14px 16px; border-radius: 20px; background: var(--lw-card); border: 1px solid var(--lw-line); }
.lw-contact-ini { flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: var(--lw-pink-soft); color: var(--lw-pink-ink); font: 600 20px/1 var(--wk-font-display); }
.lw-contact-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.lw-contact-t b { font: 600 17px/1.25 var(--wk-font-display); color: var(--wk-ink); }
.lw-contact-t small { font: 500 13px/1.35 var(--wk-font-sans); color: var(--wk-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lw-contact-no { letter-spacing: .03em; }
.lw-contact-a { flex: none; display: flex; gap: 8px; }
.lw-live { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.lw-live-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--wk-muted); opacity: .5; }
.lw-live-dot.is-on { background: #E5484D; opacity: 1; animation: lw-twinkle 1.6s ease-in-out infinite; }
.lw-live-soon { margin: 0; font: italic 400 17px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.lw-film { position: relative; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 22px; border: 1px solid var(--lw-line); box-shadow: 0 30px 60px -40px rgba(60,40,10,.6); background: #1d1a14; }
.lw-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.lw-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: none; }
.lw-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .9; }
.lw-film-play { position: absolute; left: 50%; top: 50%; display: grid; place-items: center; width: 74px; height: 74px; margin: -37px 0 0 -37px; border-radius: 50%; background: rgba(255,253,246,.94); color: var(--lw-pink-d); box-shadow: 0 10px 30px rgba(0,0,0,.3); transition: transform .3s var(--lw-ease); }
.lw-film-poster:hover .lw-film-play { transform: scale(1.06); }
.lw-film-label { position: absolute; left: 0; right: 0; bottom: 16px; font: 600 14px/1 var(--wk-font-sans); letter-spacing: .1em; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.6); }
.lw-shagun { text-align: center; padding: 28px 22px; border-radius: 24px; background: var(--lw-card); border: 1px solid var(--lw-line); }
.lw-shagun-p { margin: 0 auto 16px; max-width: 46ch; font: italic 400 17px/1.6 var(--wk-font-display); color: var(--wk-ink); }
.lw-shagun-id { display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 0 0 18px; }
.lw-shagun-id b { font: 600 18px/1.3 var(--wk-font-display); }
.lw-shagun-id code { padding: 6px 14px; border-radius: 999px; background: var(--lw-sage-soft); color: var(--lw-sage-ink); font: 600 14.5px/1.3 ui-monospace, monospace; word-break: break-all; }
.lw-shagun-a { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.lw-sharebar { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.lw-upasthiti { margin: -14px 0 24px; text-align: center; font: italic 500 clamp(19px, 3.6vw, 22px)/1.4 var(--wk-font-display); color: var(--lw-pink-d); }
.lw-rsvp .wk-card, .lw-root #blessings .wk-card { background: var(--lw-card); }

/* ══ Finale ══════════════════════════════════════════════ */
.lw-finale { position: relative; overflow: hidden; padding: clamp(150px, 24vw, 240px) 16px clamp(190px, 30vw, 330px); text-align: center; background: linear-gradient(to bottom, transparent, rgba(251,226,233,.55) 60%, rgba(227,236,230,.7)); }
.lw-finale-lights { position: absolute; top: 0; left: -2%; right: -2%; pointer-events: none; }
.lw-finale-lamps { position: absolute; inset: 0 0 auto 0; height: 0; pointer-events: none; }
.lw-finale-lamp { position: absolute; top: clamp(20px, 6vw, 70px); width: clamp(84px, 13vw, 150px); height: auto; transform-origin: 50% 0; animation: lw-lamp-sway 6s ease-in-out infinite alternate; filter: drop-shadow(0 0 18px rgba(255,200,100,.55)); }
.lw-finale-lamp-l { left: 2%; }
.lw-finale-lamp-r { right: 2%; animation-delay: -3s; transform: scaleX(-1); }
.lw-finale-in { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; }
.lw-finale-pond { position: relative; width: min(84vw, 560px); aspect-ratio: 1.5; margin: 0 auto 8px; }
.lw-finale-pond .lw-pond-water { inset: auto -8% 0 -8%; height: 46%; }
.lw-finale-pond .lw-ripple { top: auto; bottom: 23%; translate: 0 50%; }
.lw-finale-pond .lw-bloom { position: absolute; left: 10%; bottom: 14%; width: 80%; }
.lw-seal { display: flex; flex-direction: column; align-items: center; gap: 2px; margin: 0 0 18px; }
.lw-seal b { font: 400 clamp(40px, 9vw, 64px)/1.25 var(--wk-font-deva); color: var(--lw-pink-ink); }
.lw-seal small { font: 600 12.5px/1 var(--wk-font-caps); letter-spacing: .4em; text-transform: uppercase; color: var(--lw-gold-d); }
.lw-finale-names { margin: 0 0 10px; font: 400 clamp(46px, 11vw, 80px)/1.1 var(--wk-font-script); color: var(--lw-pink-ink); }
.lw-finale-names span { font: italic 400 .5em var(--wk-font-display); color: var(--lw-gold-d); }
.lw-finale-line { margin: 0 auto 8px; max-width: 40ch; font: italic 400 clamp(17px, 3.2vw, 20px)/1.5 var(--wk-font-display); color: var(--wk-ink); }
.lw-hashtag { margin: 0 0 22px; font: 700 14px/1 var(--wk-font-sans); letter-spacing: .14em; color: var(--lw-sage-d); }
.lw-finale-foot { position: absolute; inset: auto 0 0 0; height: 0; pointer-events: none; }
.lw-finale-foot img { position: absolute; bottom: -10px; height: auto; }
.lw-finale-l { left: -4%; width: clamp(150px, 30vw, 400px); }
.lw-finale-r { right: -4%; width: clamp(140px, 28vw, 380px); transform: scaleX(-1); }
.lw-drift { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.lw-drift i { position: absolute; bottom: -30px; border-radius: 50% 50% 50% 50% / 64% 64% 36% 36%; background: linear-gradient(180deg, #F2A3BA, #FBE0E8); opacity: 0; animation: lw-drift 14s linear infinite; animation-play-state: paused; }
.lw-finale.is-on .lw-drift i { animation-play-state: running; }
@keyframes lw-drift { 0% { opacity: 0; transform: translate(0, 0) rotate(0); } 10% { opacity: .8; } 85% { opacity: .6; } 100% { opacity: 0; transform: translate(var(--dx), -105vh) rotate(260deg); } }
.lw-root.is-lite .lw-drift, .lw-root.is-lite .lw-twinkle { display: none; }

/* ── Reduced motion: everything rests in its final place. ── */
@media (prefers-reduced-motion: reduce) {
  .lw-root *, .lw-root *::before, .lw-root *::after { animation: none !important; }
  .lw-in, .lw-open-copy > *, .lw-open-stage, .lw-open-cta, .lw-open-lights, .lw-open-side img, .lw-hero-lights, .lw-hero-gopuram, .lw-hero-couple, .lw-hero-pond, .lw-hero-sun, .lw-hero-badge, .lw-hero-scroll { transition: none !important; opacity: 1 !important; translate: none !important; scale: none !important; }
  .lw-hero-garland, .lw-open-garland { translate: none !important; }
  .lw-lamp { translate: 0 var(--lw-lamp-y, -18%) !important; transition: none !important; }
  .lw-petal { transition: none !important; }
}
`;
