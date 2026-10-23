// ─── The Lake Terrace — the page's own CSS (on top of the wedding kit) ───────
// Palette: powder blue sky, ivory paper, champagne gold, a flamingo-pink
// accent. Every looping or long motion is transform / opacity (individual
// `translate` / `rotate` / `scale` where an entrance and a loop share one
// element). Phones first; 700 / 960 / 1280px widen it into designed spreads.
// Photo frames and cards are rounded rectangles: all four corners equal.

import { A } from "./art";

const BALUSTRADE = `url("${A.balustrade.src}")`;

/** layout.json (openings/premium) as stage percentages. */
const AP = { left: 12.667, top: 18.723, width: 74.667, height: 76.596 };

export const WP_CSS = `
.wp-root {
  --wp-ease: cubic-bezier(.22,1,.36,1); --wp-soft: cubic-bezier(.22,.61,.36,1); --wp-expo: cubic-bezier(.16,1,.3,1); --wp-door: cubic-bezier(.65,0,.25,1);
  --wp-blue: #7FA8C6; --wp-blue-d: #3E6A8A; --wp-blue-ink: #1F3E57; --wp-blue-soft: #E6F0F7;
  --wp-names: #284D69; --wp-gold: #C9A24A; --wp-gold-d: #8F6A1F; --wp-pink: #E68FA7; --wp-pink-d: #A84E69;
  --wp-card: #FFFEFA; --wp-line: rgba(201,162,74,.42); --wp-bg1: #EEF5FB; --wp-bg2: #FBF8F0;
  --wk-accent: var(--wp-blue-d) !important; --wk-accent-ink: #FFFDF6 !important; --wk-surface-2: #F4F8FB !important; --wk-border: rgba(62,106,138,.24) !important;
  --wk-texture: none !important; --wk-paper: none !important;
  overflow-x: clip; color: var(--wk-ink); font-variant-numeric: lining-nums;
}
.wp-root, .wp-root * { font-variant-numeric: lining-nums !important; }
.wp-root[data-wk-theme=blush] { --wp-blue: #D99AAE; --wp-blue-d: #A84E69; --wp-blue-ink: #6E2840; --wp-blue-soft: #FBEAF0; --wp-names: #8C3550; --wp-bg1: #FCF1F4; --wp-bg2: #FBF7F0; --wk-accent: #A84E69 !important; --wk-surface-2: #FCF4F6 !important; }
.wp-root[data-wk-theme=champagne] { --wp-blue: #C8A866; --wp-blue-d: #8A6A2A; --wp-blue-ink: #4A3812; --wp-blue-soft: #F6EFDD; --wp-names: #5E4517; --wp-bg1: #FBF6EA; --wp-bg2: #FFFDF7; --wk-accent: #8A6A2A !important; --wk-surface-2: #FBF7EC !important; }
.wp-root .wk-shimmer { animation: none !important; }
.wp-root img { max-width: none; }

.wp-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(70% 40% at 100% 10%, rgba(255,255,255,.7), transparent 70%), radial-gradient(60% 40% at 0% 70%, color-mix(in srgb, var(--wp-blue) 14%, transparent), transparent 70%), linear-gradient(180deg, var(--wp-bg1), var(--wp-bg2) 45%, var(--wp-bg1)); }

/* ── Shared type + buttons ─────────────────────────────── */
.wp-eyebrow { margin: 0 0 10px; font: 600 12.5px/1.5 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; color: var(--wp-blue-d); }
.wp-root.is-hi .wp-eyebrow { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 15px; }
.wp-h2 { margin: 0; font: 500 clamp(34px, 6.4vw, 58px)/1.08 var(--wk-font-display); color: var(--wp-names); letter-spacing: -.005em; text-wrap: balance; overflow-wrap: anywhere; }
.wp-root.is-hi .wp-h2 { font-family: var(--wk-font-deva); font-size: clamp(30px, 5.6vw, 48px); line-height: 1.3; }
.wp-h3 { margin: 0 0 18px; font: 500 clamp(24px, 4.4vw, 34px)/1.2 var(--wk-font-display); color: var(--wp-names); text-align: center; }
.wp-head { text-align: center; margin: 0 auto clamp(26px, 4vw, 46px); max-width: 760px; }
.wp-rule { position: relative; display: block; width: min(220px, 60vw); height: 14px; margin: 16px auto 0; }
.wp-rule::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: linear-gradient(90deg, transparent, var(--wp-gold) 30%, var(--wp-gold) 70%, transparent); }
.wp-rule i { position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; margin: -5px; rotate: 45deg; background: var(--wp-card); border: 1.5px solid var(--wp-gold); }
.wp-sec { padding: clamp(44px, 6.4vw, 78px) 16px; }
@media (min-width: 700px) { .wp-sec { padding-left: 28px; padding-right: 28px; } }

.wp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 0 20px; border-radius: 999px; border: 0; cursor: pointer; text-decoration: none;
  font: 600 14.5px/1.1 var(--wk-font-sans); color: #FFFDF6; background: linear-gradient(135deg, color-mix(in srgb, var(--wp-blue) 55%, var(--wp-blue-d)) 0%, var(--wp-blue-d) 100%);
  box-shadow: 0 12px 24px -14px rgba(31,62,87,.7), inset 0 1px 0 rgba(255,255,255,.3); transition: transform .25s var(--wp-ease), box-shadow .25s; -webkit-tap-highlight-color: transparent; }
.wp-btn:hover { transform: translateY(-1px); }
.wp-btn:active { transform: scale(.97); }
.wp-btn:focus-visible, .wp-round:focus-visible, .wp-open-btn:focus-visible, .wp-replay:focus-visible, .wp-ev-wa:focus-visible, .wp-ev-g:focus-visible { outline: 3px solid var(--wp-gold); outline-offset: 3px; }
.wp-btn.is-ghost { color: var(--wp-blue-ink); background: rgba(255,254,250,.86); border: 1.5px solid color-mix(in srgb, var(--wp-blue) 55%, transparent); box-shadow: none; }
.wp-btn.is-sm { min-height: 40px; padding: 0 14px; font-size: 13px; }
.wp-btn.is-lg { min-height: 54px; padding: 0 28px; font-size: 16px; }
.wp-btn svg { flex: none; }
.wp-round { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--wp-line); background: var(--wp-card); color: var(--wp-blue-d); cursor: pointer; text-decoration: none; transition: transform .2s var(--wp-ease); }
.wp-round:active { transform: scale(.94); }
.wp-round.is-wa { background: #25D366; border-color: #25D366; color: #fff; }

/* ── Language toggle ───────────────────────────────────── */
.wp-lang { position: fixed; z-index: 55; top: max(10px, env(safe-area-inset-top)); left: 12px; display: flex; padding: 3px; border-radius: 999px; background: rgba(255,254,250,.94); border: 1px solid var(--wp-line); box-shadow: 0 8px 20px -12px rgba(31,62,87,.4); }
.wp-lang button { min-width: 44px; min-height: 40px; border: 0; border-radius: 999px; background: none; font: 700 13px/1 var(--wk-font-sans); color: var(--wp-blue-ink); cursor: pointer; }
.wp-lang button[aria-pressed=true] { background: var(--wp-blue-d); color: #fff; }

/* ══ The opening: French doors ═══════════════════════════ */
.wp-open { position: fixed; inset: 0; z-index: 60; overflow: hidden; background: linear-gradient(180deg, #E4EFF8 0%, #F6F9FB 45%, #FBF6EA 100%); }
.wp-open.is-push { opacity: 0; pointer-events: none; transition: opacity .7s var(--wp-soft); }
.wp-open.is-reduced.is-push { transition: opacity .4s linear; }
.wp-open-blur { position: absolute; inset: -40px; opacity: 0; transition: opacity 1.2s var(--wp-soft); }
.wp-open-blur img { width: 100%; height: 100%; object-fit: cover; filter: blur(18px) saturate(1.1); }
.wp-open.is-ready .wp-open-blur { opacity: .55; }
.wp-open-wash { position: absolute; inset: 0; background: radial-gradient(60% 45% at 50% 58%, rgba(255,253,246,.85), rgba(255,253,246,0) 70%), linear-gradient(180deg, rgba(228,239,248,.55), rgba(251,246,234,.35)); }
.wp-open-world { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; padding: max(64px, calc(env(safe-area-inset-top) + 56px)) 16px max(14px, env(safe-area-inset-bottom)); }
.wp-open-copy { position: relative; z-index: 3; flex: none; text-align: center; max-width: 640px; padding: 0 8px; transition: opacity .6s var(--wp-soft) .6s, translate .9s var(--wp-ease) .6s; }
.wp-open.is-opening:not(.is-reduced) .wp-open-copy { opacity: 0; translate: 0 -24px; }
.wp-open-copy > * { opacity: 0; translate: 0 12px; transition: opacity .9s var(--wp-soft), translate 1s var(--wp-ease); }
.wp-open.is-ready .wp-open-copy > * { opacity: 1; translate: 0 0; }
.wp-open.is-ready .wp-open-copy > :nth-child(2) { transition-delay: .12s; }
.wp-open.is-ready .wp-open-copy > :nth-child(3) { transition-delay: .24s; }
.wp-open.is-ready .wp-open-copy > :nth-child(4) { transition-delay: .36s; }
.wp-open-inv { margin: 0 0 2px; font: 500 15px/1.5 var(--wk-font-deva); color: var(--wp-gold-d); }
.wp-open-dear { margin: 0; font: italic 500 clamp(16px, 4.2vw, 21px)/1.35 var(--wk-font-display); color: var(--wp-pink-d); }
.wp-open-dear b { font-weight: 700; font-style: normal; }
.wp-open-names { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; gap: 0 .22em; margin: 0; font: 400 clamp(40px, 11.5vw, 84px)/1.12 var(--wk-font-script); color: var(--wp-names); text-wrap: balance; }
.wp-open-names span { white-space: nowrap; }
.wp-open-names i { font: italic 400 .5em var(--wk-font-display); color: var(--wp-gold-d); }
.wp-open-date { text-wrap: balance; margin: 2px 0 0; font: 600 12px/1.4 var(--wk-font-sans); letter-spacing: .26em; text-transform: uppercase; color: var(--wp-blue-d); }

.wp-stagewrap { position: relative; z-index: 2; flex: 1 1 auto; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; margin: 8px 0 6px; transform-origin: 50% 58%; }
.wp-open.is-opening:not(.is-reduced) .wp-stagewrap, .wp-open.is-push:not(.is-reduced) .wp-stagewrap { scale: 1.22; translate: 0 3%; transition: scale 1.3s var(--wp-expo) .95s, translate 1.3s var(--wp-expo) .95s; }
.wp-stage { position: relative; height: min(100%, calc(88vw * 1800 / 1149), 860px); aspect-ratio: 1149 / 1800; perspective: 1400px; perspective-origin: 50% 45%; cursor: pointer; opacity: 0; translate: 0 18px; transition: opacity 1s var(--wp-soft) .15s, translate 1.1s var(--wp-ease) .15s; filter: drop-shadow(0 30px 40px rgba(31,62,87,.22)); }
.wp-open.is-ready .wp-stage { opacity: 1; translate: 0 0; }
.wp-aperture { position: absolute; left: ${AP.left}%; top: ${AP.top}%; width: ${AP.width}%; height: ${AP.height}%; overflow: hidden; background: #F3E9D8; }
.wp-terrace { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 62%; scale: 1.06; transition: scale 2.4s var(--wp-expo) .3s; }
.wp-open.is-opening .wp-terrace, .wp-open.is-push .wp-terrace { scale: 1; }
.wp-sun { position: absolute; left: 50%; top: 40%; width: 140%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(circle, rgba(255,247,220,.95), rgba(255,236,190,.35) 40%, transparent 66%); opacity: 0; transition: opacity 1.2s var(--wp-soft) .45s; }
.wp-rays { position: absolute; left: -20%; top: -10%; width: 140%; height: 120%; object-fit: cover; mix-blend-mode: screen; opacity: 0; scale: .9; transition: opacity 1.1s var(--wp-soft) .45s, scale 1.6s var(--wp-ease) .45s; }
.wp-open.is-opening .wp-sun, .wp-open.is-push .wp-sun { opacity: 1; }
.wp-open.is-opening .wp-rays, .wp-open.is-push .wp-rays { opacity: .7; scale: 1.08; }
.wp-doors { position: absolute; inset: 0; z-index: 2; transform-style: preserve-3d; pointer-events: none; }
.wp-door { position: absolute; top: ${AP.top}%; width: 37.867%; height: ${AP.height}%; overflow: hidden; transition: transform 1.5s var(--wp-door) .3s; backface-visibility: visible; }
.wp-door > img { position: absolute; inset: 0; width: 100%; height: 100%; }
.wp-door-l { left: 12.667%; transform-origin: 0% 50%; }
.wp-door-r { left: 49.467%; transform-origin: 100% 50%; }
.wp-open.is-opening .wp-door, .wp-open.is-push .wp-door { will-change: transform; }
.wp-open.is-opening .wp-door-l, .wp-open.is-push .wp-door-l { transform: rotateY(100deg); }
.wp-open.is-opening .wp-door-r, .wp-open.is-push .wp-door-r { transform: rotateY(-100deg); }
.wp-glass { position: absolute; inset: 4% 9% 22%; background: linear-gradient(118deg, rgba(255,255,255,0) 28%, rgba(255,255,255,.22) 42%, rgba(255,255,255,0) 56%), linear-gradient(180deg, rgba(196,222,240,.18), rgba(255,255,255,0)); pointer-events: none; }
.wp-glare { position: absolute; inset: 0; overflow: hidden; pointer-events: none; mix-blend-mode: screen; }
.wp-glare img { position: absolute; top: 0; left: 0; width: 90%; height: 100%; opacity: .9; translate: -130% 0; }
.wp-open.is-ready .wp-glare img { animation: wp-glare-idle 6.5s var(--wp-soft) 1.4s infinite; }
.wp-open.is-opening .wp-glare img { animation: wp-glare 1s var(--wp-soft) both; }
.wp-door-r .wp-glare img { animation-delay: .08s !important; }
@keyframes wp-glare { from { translate: -130% 0; } to { translate: 160% 0; } }
@keyframes wp-glare-idle { 0% { translate: -130% 0; } 22% { translate: 160% 0; } 100% { translate: 160% 0; } }
.wp-shade { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s var(--wp-door) .35s; pointer-events: none; }
.wp-door-l .wp-shade { background: linear-gradient(to left, rgba(20,44,66,0), rgba(20,44,66,.5)); }
.wp-door-r .wp-shade { background: linear-gradient(to right, rgba(20,44,66,0), rgba(20,44,66,.5)); }
.wp-open.is-opening .wp-shade, .wp-open.is-push .wp-shade { opacity: .6; }
.wp-frame { position: absolute; inset: 0; z-index: 4; width: 100%; height: 100%; pointer-events: none; }
.wp-floor { position: absolute; z-index: 5; left: 6%; right: 6%; bottom: 1%; height: 12%; border-radius: 50%; background: radial-gradient(50% 50% at 50% 50%, rgba(255,240,200,.9), rgba(255,240,200,0) 70%); opacity: 0; scale: .6 1; transition: opacity 1s var(--wp-soft) .6s, scale 1.4s var(--wp-ease) .6s; pointer-events: none; }
.wp-open.is-opening .wp-floor, .wp-open.is-push .wp-floor { opacity: 1; scale: 1.5 1; }
.wp-open-pot { position: absolute; z-index: 6; bottom: -3%; width: 38%; height: auto; pointer-events: none; opacity: 0; translate: 0 16px; transition: opacity 1s var(--wp-soft) .5s, translate 1.2s var(--wp-ease) .5s; }
.wp-open.is-ready .wp-open-pot { opacity: 1; translate: 0 0; }
.wp-open-pot-l { left: -17%; }
.wp-open-pot-r { right: -17%; transform: scaleX(-1); }
.wp-fxbox { position: absolute; inset: 0; z-index: 7; pointer-events: none; }
.wp-fx { position: absolute; display: block; opacity: 0; will-change: transform, opacity; }

.wp-open-cta { position: relative; z-index: 3; flex: none; display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 4px; transition: opacity .4s; }
.wp-open.is-opening .wp-open-cta { opacity: 0; pointer-events: none; }
.wp-open-btn { position: relative; display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 26px; border-radius: 999px; border: 0; cursor: pointer;
  font: 700 15.5px/1 var(--wk-font-sans); color: #2A2410; background: linear-gradient(110deg, #C9A43F, #EBD38A 40%, #FFF4C8 55%, #D9B05C); box-shadow: 0 16px 30px -16px rgba(143,106,31,.8), inset 0 1px 0 rgba(255,255,255,.6); }
.wp-open-btn::after { content: ""; position: absolute; inset: -4px; border-radius: inherit; border: 1.5px solid rgba(201,162,74,.7); animation: wp-ping 2.2s ease-out infinite; pointer-events: none; }
.wp-open-btn:disabled { cursor: progress; opacity: .8; }
.wp-open-btn:disabled::after { animation: none; opacity: 0; }
.wp-root.is-hi .wp-open-btn { font-family: var(--wk-font-deva); }
@keyframes wp-ping { 0% { opacity: .8; scale: 1; } 100% { opacity: 0; scale: 1.12 1.45; } }
.wp-open-hint { margin: 0; font: 500 12.5px/1.4 var(--wk-font-sans); color: var(--wk-muted); text-align: center; }
@media (max-height: 640px) { .wp-open-hint { display: none; } .wp-open-world { padding-top: 58px; } }
@media (min-width: 960px) { .wp-open-pot { width: 44%; } .wp-open-pot-l { left: -30%; } .wp-open-pot-r { right: -30%; } }
@media (prefers-reduced-motion: reduce) { .wp-glare img { animation: none !important; } .wp-open-btn::after { animation: none; } }

/* ══ The hero ════════════════════════════════════════════ */
.wp-hero { position: relative; overflow: hidden; padding: clamp(118px, 34vw, 200px) 16px 0; --wp-sy: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--wp-blue) 26%, #fff) 0%, rgba(255,255,255,0) 62%); }
.wp-hero-sky { position: absolute; inset: 0 0 auto 0; height: 64%; pointer-events: none; -webkit-mask-image: linear-gradient(#000 55%, transparent); mask-image: linear-gradient(#000 55%, transparent); }
.wp-hero-sky img { width: 100%; height: 100%; object-fit: cover; opacity: .85; translate: 0 calc(var(--wp-sy) * .12px); }
.wp-root[data-wk-theme=blush] .wp-hero-sky img { opacity: .35; }
.wp-root[data-wk-theme=champagne] .wp-hero-sky img { opacity: .45; }
.wp-hero-flamingo { position: absolute; z-index: 1; top: 0; left: -3%; right: -3%; pointer-events: none; opacity: 0; translate: 0 -30px; transition: opacity 1.2s var(--wp-soft) .15s, translate 1.4s var(--wp-ease) .15s; }
.wp-hero-flamingo img { display: block; width: 100%; height: auto; }
.wp-hero.is-on .wp-hero-flamingo { opacity: 1; translate: 0 0; }
@media (min-width: 960px) { .wp-hero-flamingo { left: 50%; right: auto; width: min(780px, 56vw); margin-left: calc(min(780px, 56vw) / -2); } }
.wp-hero-grid { position: relative; z-index: 2; display: grid; justify-items: center; gap: 28px; max-width: 1200px; margin: 0 auto; }
.wp-hero-words { position: relative; text-align: center; max-width: 620px; }
.wp-hero-art { position: relative; width: min(100%, 440px); aspect-ratio: .86; }
@media (min-width: 960px) {
  .wp-hero { min-height: 100svh; padding: calc(min(780px, 56vw) * .372 + 24px) 40px 0; display: flex; flex-direction: column; }
  .wp-hero-grid { width: 100%; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: clamp(40px, 5vw, 90px); flex: 1; }
  .wp-hero-art { order: 1; justify-self: end; width: min(100%, 540px); }
  .wp-hero-photo { left: 15%; width: 70%; }
  .wp-hero-words { order: 2; justify-self: start; text-align: left; }
  .wp-hero-actions { justify-content: flex-start !important; }
  .wp-hero-words .wp-rule { margin-left: 0; }
  .wp-hero-words .wp-motif { margin-left: 0 !important; }
}
.wp-in { opacity: 0; translate: 0 18px; transition: opacity 1s var(--wp-soft), translate 1.1s var(--wp-ease); transition-delay: calc(var(--d, 0ms) + .2s); }
.wp-hero.is-on .wp-in { opacity: 1; translate: 0 0; }
.wp-motif { display: block; width: max-content; margin: 0 auto 8px; color: var(--wp-gold-d); }
.wp-motif-text { font: 500 16px/1.5 var(--wk-font-deva); }
.wp-motif-lotus { display: block; width: 64px; height: auto; }
.wp-hero-dear { margin: 0 0 6px; font: italic 500 clamp(18px, 3.6vw, 22px)/1.35 var(--wk-font-display); color: var(--wp-pink-d); }
.wp-hero-kicker { margin: 0; font: 600 12.5px/1.5 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wp-blue-d); }
.wp-root.is-hi .wp-hero-kicker { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 16px; }
.wp-hero-names { margin: 8px 0 6px; font: 400 clamp(56px, 15vw, 112px)/1 var(--wk-font-script); color: var(--wp-names); }
.wp-hero-names > span { display: block; white-space: nowrap; }
.wp-hero-names > i { display: block; margin: -.06em 0 0; font: italic 400 .36em/1.2 var(--wk-font-display); color: var(--wp-gold-d); }
.wp-hero-line { margin: 0 auto; max-width: 30ch; font: italic 400 clamp(18px, 3.4vw, 22px)/1.45 var(--wk-font-display); color: var(--wk-ink); }
@media (min-width: 960px) { .wp-hero-line { margin-left: 0; } }
.wp-root.is-hi .wp-hero-line { font-family: var(--wk-font-deva); font-style: normal; font-size: 18px; line-height: 1.8; }
.wp-hero .wp-rule { margin: 18px auto; }
.wp-hero-when { margin: 0; font: 600 clamp(19px, 3.6vw, 23px)/1.3 var(--wk-font-display); color: var(--wk-ink); }
.wp-hero-muhurat { margin: 4px 0 0; font: italic 500 17px/1.4 var(--wk-font-display); color: var(--wp-pink-d); }
.wp-hero-place { margin: 6px 0 0; font: 500 14.5px/1.5 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-muted); }
.wp-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 22px; }
.wp-hero-photo { position: absolute; z-index: 2; left: 19%; top: 2%; width: 62%; aspect-ratio: 4 / 5; margin: 0; overflow: hidden; border-radius: 22px; border: 7px solid #FFFEFA; background: var(--wk-placeholder); box-shadow: 0 0 0 1.5px var(--wp-gold), 0 30px 50px -26px rgba(31,62,87,.55); }
.wp-hero-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.wp-hero-couple { position: absolute; z-index: 2; left: 4%; bottom: 14%; width: 92%; height: auto; }
.wp-hero-banana { position: absolute; z-index: 1; left: -8%; bottom: 10%; width: 40%; height: auto; transform-origin: 50% 100%; opacity: 0; transition: opacity 1.2s var(--wp-soft) .5s; animation: wp-sway-l 7s ease-in-out infinite alternate; }
.wp-hero-peacock { position: absolute; z-index: 3; right: -6%; bottom: 2%; width: 38%; height: auto; opacity: 0; translate: 24px 0; transition: opacity 1.2s var(--wp-soft) .7s, translate 1.4s var(--wp-ease) .7s; }
.wp-hero-flora { position: absolute; z-index: 3; left: -6%; bottom: -2%; width: 36%; height: auto; opacity: 0; translate: -20px 10px; transition: opacity 1.2s var(--wp-soft) .8s, translate 1.4s var(--wp-ease) .8s; }
.wp-hero.is-on .wp-hero-banana, .wp-hero.is-on .wp-hero-peacock, .wp-hero.is-on .wp-hero-flora { opacity: 1; translate: 0 0; }
@keyframes wp-sway-l { from { rotate: -3deg; } to { rotate: 2deg; } }
.wp-hero-lake { position: relative; z-index: 1; margin: -6% -16px 0; pointer-events: none; }
@media (min-width: 700px) { .wp-hero-lake { margin-left: -28px; margin-right: -28px; } }
@media (min-width: 960px) { .wp-hero-lake { margin: 0 -40px; } }
.wp-lake { display: block; width: 100%; height: clamp(120px, 30vw, 300px); object-fit: cover; object-position: 50% 80%; -webkit-mask-image: linear-gradient(transparent, #000 30%); mask-image: linear-gradient(transparent, #000 30%); }
.wp-balustrade { position: absolute; left: 0; right: 0; bottom: 0; height: clamp(54px, 12vw, 120px); background: ${BALUSTRADE} repeat-x 0 100% / auto 100%; }
.wp-hero-scroll { position: absolute; z-index: 3; left: 50%; bottom: clamp(70px, 14vw, 140px); translate: -50% 0; display: flex; flex-direction: column; align-items: center; gap: 8px; min-height: 44px; padding: 4px 10px; font: 600 11px/1 var(--wk-font-sans); letter-spacing: .3em; text-transform: uppercase; color: var(--wp-blue-ink); text-decoration: none; opacity: 0; transition: opacity 1s 1.6s; }
.wp-hero.is-on .wp-hero-scroll { opacity: .85; }
.wp-hero-scroll i { width: 1.5px; height: 28px; background: linear-gradient(var(--wp-blue-d), transparent); transform-origin: 50% 0; animation: wp-scroll 2.2s ease-in-out infinite; }
@keyframes wp-scroll { 0% { scale: 1 0; opacity: 1; } 60% { scale: 1 1; opacity: 1; } 100% { scale: 1 1; opacity: 0; } }
@media (max-width: 959px) { .wp-hero-scroll { display: none; } }

/* ══ The invitation ══════════════════════════════════════ */
.wp-sec-invite { padding-top: clamp(40px, 6vw, 70px); }
.wp-invite { position: relative; max-width: 900px; margin: 0 auto; padding: clamp(60px, 9vw, 92px) clamp(20px, 6vw, 72px) clamp(36px, 6vw, 64px); text-align: center; background: var(--wp-card); border-radius: 28px; border: 1px solid var(--wp-line); box-shadow: 0 30px 60px -40px rgba(31,62,87,.5); }
.wp-invite::before { content: ""; position: absolute; inset: 10px; border-radius: 20px; border: 1px solid rgba(201,162,74,.3); pointer-events: none; }
.wp-invite-branch { position: absolute; z-index: 1; top: -34px; right: -14px; width: clamp(150px, 36vw, 280px); height: auto; pointer-events: none; transform-origin: 90% 10%; animation: wp-branch 7s ease-in-out infinite alternate; }
@keyframes wp-branch { from { rotate: -1.5deg; } to { rotate: 1.5deg; } }
.wp-invite-motif { position: relative; z-index: 2; }
.wp-invite .wk-msg-heading { color: var(--wp-names); }
.wp-invite .wk-msg-text p { color: var(--wk-ink); }

/* ══ Families ════════════════════════════════════════════ */
.wp-elders { text-align: center; margin: 0 auto 30px; max-width: 640px; }
.wp-elders-n { margin: 0; font: italic 500 clamp(19px, 3.6vw, 23px)/1.45 var(--wk-font-display); color: var(--wk-ink); }
.wp-fam-grid { position: relative; display: grid; gap: 22px; max-width: 880px; margin: 0 auto; }
@media (min-width: 700px) { .wp-fam-grid { grid-template-columns: 1fr 1fr; gap: 92px; } .wp-fam-grid.is-one { grid-template-columns: minmax(0, 420px); justify-content: center; } }
.wp-fam { position: relative; text-align: center; padding: clamp(24px, 4vw, 34px) clamp(18px, 3vw, 26px) clamp(22px, 3.6vw, 30px); background: var(--wp-card); border: 1px solid var(--wp-line); border-radius: 22px; box-shadow: 0 24px 50px -36px rgba(31,62,87,.5); }
.wp-fam-icon img { display: block; height: 96px; width: auto; margin: 0 auto 10px; }
.wp-fam-t { margin: 0 0 8px; font: 600 12px/1.4 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--wp-blue-d); }
.wp-root.is-hi .wp-fam-t { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 15px; }
.wp-fam-n { margin: 0; font: 500 clamp(21px, 3.8vw, 25px)/1.35 var(--wk-font-display); color: var(--wp-names); }
.wp-fam-note { margin: 6px 0 0; font: 500 14px/1.4 var(--wk-font-sans); color: var(--wk-muted); letter-spacing: .04em; }
.wp-fam-mid { display: none; }
@media (min-width: 700px) { .wp-fam-mid { display: block; position: absolute; left: 50%; top: 50%; width: 84px; translate: -50% -50%; z-index: 2; animation: wp-float 6s ease-in-out infinite alternate; } .wp-fam-mid img { display: block; width: 100%; height: auto; } }
@keyframes wp-float { from { translate: -50% -50%; } to { translate: -50% calc(-50% - 8px); } }

/* ══ Date + countdown ════════════════════════════════════ */
.wp-sec-date { position: relative; }
.wp-date-lanterns { position: absolute; inset: 0 0 auto 0; height: 0; pointer-events: none; }
.wp-date-lantern { position: absolute; top: -10px; width: clamp(64px, 13vw, 130px); height: auto; transform-origin: 50% 0; animation: wp-lantern 6s ease-in-out infinite alternate; }
.wp-date-lantern-l { left: clamp(-8px, 3vw, 80px); }
.wp-date-lantern-r { right: clamp(-8px, 3vw, 80px); animation-delay: -3s; transform: scaleX(-1); }
@media (max-width: 699px) { .wp-date-lantern { width: 58px; top: -24px; opacity: .9; } }
@keyframes wp-lantern { from { rotate: -2deg; } to { rotate: 2deg; } }
.wp-date { display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center; }
.wp-date-big { margin: 0; font: 500 clamp(22px, 4.4vw, 32px)/1.3 var(--wk-font-display); color: var(--wp-names); }
.wp-root.is-hi .wp-date-big { font-family: var(--wk-font-deva); }
.wp-date-line { margin: 0; font: italic 500 clamp(17px, 3.2vw, 20px)/1.4 var(--wk-font-display); color: var(--wp-pink-d); }
.wp-root.is-hi .wk-cd-label, .wp-root.is-hi .wk-rsvp-by { font-family: var(--wk-font-deva); letter-spacing: .02em; }

/* ══ Story ═══════════════════════════════════════════════ */
.wp-story { position: relative; display: grid; gap: 26px; --wp-p: 0; }
@media (min-width: 960px) { .wp-story { grid-template-columns: minmax(280px, .75fr) 1.25fr; gap: clamp(40px, 5vw, 80px); align-items: start; } }
.wp-story-art { position: relative; width: min(52%, 210px); margin: 0 auto; }
@media (min-width: 960px) { .wp-story-art { width: 100%; max-width: 360px; height: 100%; } .wp-story-pin { position: sticky; top: 14vh; } }
.wp-story-pin { position: relative; aspect-ratio: .82; }
.wp-story-lanterns { position: absolute; top: 0; left: 6%; width: 46%; height: auto; transform-origin: 50% 0; animation: wp-lantern 5.6s ease-in-out infinite alternate; }
.wp-story-blossom { position: absolute; top: 0; right: -10%; width: 70%; height: auto; rotate: 8deg; }
.wp-story-lotus { position: absolute; bottom: 0; right: 4%; width: 58%; height: auto; }
.wp-story-body { position: relative; padding-left: 46px; }
.wp-story-thread { position: absolute; left: 17px; top: 6px; bottom: 6px; width: 2px; border-radius: 2px; background: color-mix(in srgb, var(--wp-blue) 22%, transparent); }
.wp-story-thread i { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(var(--wp-gold), var(--wp-blue)); transform-origin: 50% 0; transform: scaleY(var(--wp-p)); }
.wp-chapters { list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(30px, 5vw, 48px); }
.wp-ch { position: relative; display: grid; gap: 14px; }
@media (min-width: 700px) { .wp-ch { grid-template-columns: minmax(150px, 220px) 1fr; gap: 26px; align-items: center; } .wp-ch.no-photo { grid-template-columns: 1fr; } }
.wp-ch-dot { position: absolute; left: -41px; top: 2px; display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: var(--wp-card); box-shadow: 0 0 0 1px var(--wp-line); }
.wp-ch-photo { position: relative; width: min(240px, 100%); aspect-ratio: 4 / 5; overflow: hidden; border-radius: 18px; border: 4px solid #fff; box-shadow: 0 0 0 1px var(--wp-line), 0 20px 36px -24px rgba(31,62,87,.5); background: var(--wk-placeholder); }
.wp-ch-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.wp-ch-when { margin: 0 0 4px; font: 600 12px/1.4 var(--wk-font-caps); letter-spacing: .26em; color: var(--wp-blue-d); }
.wp-ch-title { margin: 0 0 8px; font: 500 clamp(24px, 4.2vw, 30px)/1.2 var(--wk-font-display); color: var(--wp-names); }
.wp-ch-line { margin: 0; max-width: 52ch; font: 400 clamp(16px, 2.8vw, 18px)/1.65 var(--wk-font-display); color: var(--wk-ink); }

/* ══ Functions ═══════════════════════════════════════════ */
.wp-ev-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 26px; }
.wp-ev-list > * { flex: 0 0 100%; min-width: 0; }
@media (min-width: 700px) { .wp-ev-list > * { flex-basis: calc((100% - 26px) / 2); } }
@media (min-width: 1100px) { .wp-ev-list { gap: 30px; } .wp-ev-list > * { flex-basis: calc((100% - 60px) / 3); } }
.wp-ev { min-width: 0; }
.wp-ev-card { position: relative; height: 100%; display: flex; flex-direction: column; padding: 0 0 22px; background: var(--wp-card); border: 1px solid var(--wp-line); border-radius: 24px; box-shadow: 0 26px 50px -38px rgba(31,62,87,.55); transition: transform .45s var(--wp-ease), box-shadow .45s; }
@media (hover: hover) { .wp-ev-card:hover { transform: translateY(-4px); box-shadow: 0 34px 60px -36px rgba(31,62,87,.55); } }
.wp-ev-sprig { position: absolute; z-index: 2; top: -18px; right: -10px; width: 92px; height: auto; pointer-events: none; rotate: 10deg; }
.wp-ev-plate { position: relative; display: grid; grid-template-columns: auto auto; align-items: center; justify-content: center; column-gap: 16px; row-gap: 3px; min-height: 104px; margin: 14px 14px 0; padding: 16px 22px; border-radius: 18px; color: #FFF8E6;
  background: radial-gradient(90% 120% at 0% 0%, rgba(255,255,255,.28), transparent 60%), linear-gradient(150deg, var(--wp-blue), var(--wp-blue-d)); }
.wp-ev-plate::after { content: ""; position: absolute; inset: 6px; border-radius: 13px; border: 1px solid rgba(255,240,200,.45); pointer-events: none; }
.wp-ev.is-main .wp-ev-plate { background: radial-gradient(90% 120% at 0% 0%, rgba(255,255,255,.3), transparent 60%), linear-gradient(150deg, #E8B4C3, var(--wp-pink-d)); }
.wp-ev-plate > .wp-ev-day { grid-row: 1 / 3; padding-right: 16px; border-right: 1px solid rgba(255,240,200,.5); }
.wp-ev-plate > .wp-ev-mon { align-self: end; }
.wp-ev-plate > .wp-ev-wd { align-self: start; }
.wp-ev-plate > .wp-ev-mon:only-child { grid-column: 1 / -1; align-self: center; }
.wp-ev-day { font: 500 clamp(44px, 5vw, 52px)/1 var(--wk-font-display); color: #FFF3D2; }
.wp-ev-mon { font: 600 12.5px/1.2 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; }
.wp-root.is-hi .wp-ev-mon { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 14px; }
.wp-ev-wd { font: italic 500 14px/1.2 var(--wk-font-display); opacity: .95; }
.wp-ev-body { flex: 1; display: flex; flex-direction: column; padding: 18px 20px 0; }
.wp-ev-title { margin: 0 0 12px; font: 500 clamp(25px, 4vw, 29px)/1.15 var(--wk-font-display); color: var(--wp-names); }
.wp-ev-line { display: flex; align-items: flex-start; gap: 10px; margin: 0 0 9px; font: 400 14.5px/1.45 var(--wk-font-sans); color: var(--wk-ink); }
.wp-ev-line > svg { flex: none; margin-top: 2px; color: var(--wp-blue-d); }
.wp-ev-line b { font-weight: 600; }
.wp-ev-addr { display: block; color: var(--wk-muted); font-size: 13.5px; }
.wp-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--wp-gold); }
.wp-ev-k { font-weight: 700; color: var(--wp-blue-d); }
.wp-ev-note { margin: 12px 0 0; padding: 2px 0 2px 12px; border-left: 2px solid var(--wp-pink); font: italic 400 16px/1.55 var(--wk-font-display); color: var(--wk-muted); }
.wp-ev-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: auto; padding-top: 16px; }
.wp-ev-actions > * { justify-content: center; width: 100%; min-width: 0; white-space: nowrap; }
.wp-ev-actions > * > span { overflow: hidden; text-overflow: ellipsis; }
.wp-ev-wa { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 0; cursor: pointer; font: 700 14px/1 var(--wk-font-sans); color: #fff; background: #1FA855; }
.wp-ev-g { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1.5px solid color-mix(in srgb, var(--wp-blue) 55%, transparent); font: 700 14px/1 var(--wk-font-sans); color: var(--wp-blue-ink); text-decoration: none; background: rgba(255,254,250,.86); }
.wp-ev-all { display: flex; justify-content: center; margin-top: 32px; }

/* ══ Venue ═══════════════════════════════════════════════ */
.wp-venue { display: grid; gap: 28px; align-items: center; }
@media (min-width: 960px) { .wp-venue { grid-template-columns: 1fr 1fr; gap: 56px; } }
.wp-venue-art { position: relative; width: min(100%, 500px); aspect-ratio: 1.05; margin: 0 auto; }
.wp-venue-glow { position: absolute; left: 50%; top: 46%; width: 92%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.95), color-mix(in srgb, var(--wp-blue) 22%, transparent) 50%, transparent 70%); }
.wp-venue-fountain { position: absolute; left: 50%; bottom: 14%; width: 72%; height: auto; translate: -50% 0; }
.wp-venue-banana { position: absolute; bottom: 14%; width: 34%; height: auto; transform-origin: 50% 100%; }
.wp-venue-banana-l { left: -2%; rotate: -6deg; }
.wp-venue-banana-r { right: -2%; transform: scaleX(-1); rotate: 6deg; }
.wp-venue.is-on .wp-venue-banana-l { animation: wp-leaf-l 6s ease-in-out infinite alternate; }
.wp-venue.is-on .wp-venue-banana-r { animation: wp-leaf-r 7s ease-in-out infinite alternate; }
@keyframes wp-leaf-l { from { rotate: -7deg; } to { rotate: -3deg; } }
@keyframes wp-leaf-r { from { rotate: 7deg; } to { rotate: 3deg; } }
.wp-venue-sparks { position: absolute; left: 30%; right: 30%; top: 22%; height: 30%; pointer-events: none; }
.wp-venue-sparks i { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: radial-gradient(circle, #fff 0 30%, rgba(190,225,245,.7) 50%, transparent 70%); opacity: 0; }
.wp-venue.is-on .wp-venue-sparks i { animation: wp-spark 2.6s ease-in-out infinite; }
.wp-venue-sparks i:nth-child(1) { left: 10%; top: 60%; animation-delay: 0s !important; }
.wp-venue-sparks i:nth-child(2) { left: 46%; top: 10%; animation-delay: .5s !important; }
.wp-venue-sparks i:nth-child(3) { left: 80%; top: 55%; animation-delay: 1s !important; }
.wp-venue-sparks i:nth-child(4) { left: 30%; top: 80%; animation-delay: 1.5s !important; }
.wp-venue-sparks i:nth-child(5) { left: 66%; top: 30%; animation-delay: 2s !important; }
@keyframes wp-spark { 0%, 100% { opacity: 0; scale: .4; } 50% { opacity: 1; scale: 1.2; } }
.wp-venue-lotus { position: absolute; left: 50%; bottom: -6%; width: 46%; height: auto; translate: -50% 0; }
.wp-venue-card .wk-card { background: var(--wp-card); }

/* ══ Gallery ═════════════════════════════════════════════ */
.wp-sec-gallery .wk-masonry { max-width: 1080px; margin-left: auto; margin-right: auto; }

/* ══ Good to know, contacts, live, film, shagun, share ═══ */
.wp-know { list-style: none; margin: 0 auto; padding: 0; display: grid; gap: 14px; max-width: 900px; }
@media (min-width: 700px) { .wp-know { grid-template-columns: 1fr 1fr; } }
.wp-know-i { padding: 18px 20px; border-radius: 20px; background: var(--wp-card); border: 1px solid var(--wp-line); }
.wp-know-travel { max-width: 900px; margin: 14px auto 0; }
.wp-know-h { margin: 0 0 6px; font: 600 12px/1.4 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wp-blue-d); }
.wp-know-t { margin: 0; font: 400 16.5px/1.6 var(--wk-font-display); color: var(--wk-ink); }
.wp-contacts-wrap { margin: clamp(40px, 7vw, 64px) auto 0; max-width: 900px; text-align: center; }
.wp-contacts { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; text-align: left; }
@media (min-width: 700px) { .wp-contacts { grid-template-columns: 1fr 1fr; } }
.wp-contact { display: flex; align-items: center; gap: 14px; padding: 14px 14px 14px 16px; border-radius: 20px; background: var(--wp-card); border: 1px solid var(--wp-line); }
.wp-contact-ini { flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: var(--wp-blue-soft); color: var(--wp-blue-ink); font: 600 20px/1 var(--wk-font-display); }
.wp-contact-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.wp-contact-t b { font: 600 17px/1.25 var(--wk-font-display); color: var(--wk-ink); }
.wp-contact-t small { font: 500 13px/1.35 var(--wk-font-sans); color: var(--wk-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wp-contact-a { flex: none; display: flex; gap: 8px; }
.wp-live { display: flex; flex-direction: column; align-items: center; gap: 14px; max-width: 460px; margin: 0 auto; text-align: center; padding: 26px 20px; border-radius: 22px; background: var(--wk-surface, #FFFDF8); border: 1px solid color-mix(in srgb, var(--wk-gold, #C9A35B) 35%, transparent); box-shadow: 0 18px 40px -28px rgba(40,70,110,.45); }
.wp-live-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; font: 600 12px/1 var(--wk-font-body, inherit); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-muted); background: color-mix(in srgb, var(--wk-muted) 10%, transparent); }
.wp-live-dot { width: 9px; height: 9px; border-radius: 50%; background: currentColor; opacity: .6; }
.wp-live-badge.is-on { color: #C8323A; background: #FDECEC; }
.wp-live-badge.is-on .wp-live-dot { opacity: 1; animation: wp-spark 1.6s ease-in-out infinite; }
.wp-live-off { opacity: .55; cursor: default; pointer-events: none; }
.wp-live-soon { margin: 0; font: italic 400 17px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.wp-film { position: relative; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 22px; border: 1px solid var(--wp-line); box-shadow: 0 30px 60px -40px rgba(31,62,87,.6); background: #1d2630; }
.wp-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.wp-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: none; }
.wp-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .9; }
.wp-film-play { position: absolute; left: 50%; top: 50%; display: grid; place-items: center; width: 74px; height: 74px; margin: -37px 0 0 -37px; border-radius: 50%; background: rgba(255,254,250,.94); color: var(--wp-blue-d); box-shadow: 0 10px 30px rgba(0,0,0,.3); }
.wp-film-label { position: absolute; left: 0; right: 0; bottom: 16px; font: 600 14px/1 var(--wk-font-sans); letter-spacing: .1em; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.6); }
.wp-shagun { text-align: center; padding: 28px 22px; border-radius: 24px; background: var(--wp-card); border: 1px solid var(--wp-line); }
.wp-shagun-p { margin: 0 auto 16px; max-width: 46ch; font: italic 400 17px/1.6 var(--wk-font-display); color: var(--wk-ink); }
.wp-shagun-id { display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 0 0 18px; }
.wp-shagun-id b { font: 600 18px/1.3 var(--wk-font-display); }
.wp-shagun-id code { padding: 6px 14px; border-radius: 999px; background: var(--wp-blue-soft); color: var(--wp-blue-ink); font: 600 14.5px/1.3 ui-monospace, monospace; word-break: break-all; }
.wp-shagun-a, .wp-sharebar { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.wp-upasthiti { margin: -14px 0 24px; text-align: center; font: italic 500 clamp(19px, 3.6vw, 22px)/1.4 var(--wk-font-display); color: var(--wp-pink-d); }
.wp-rsvp .wk-card, .wp-root #blessings .wk-card { background: var(--wp-card); }

/* ══ Finale ══════════════════════════════════════════════ */
.wp-finale { position: relative; overflow: hidden; padding: clamp(140px, 30vw, 260px) 16px 0; text-align: center; background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--wp-pink) 14%, transparent) 50%, color-mix(in srgb, var(--wp-blue) 24%, transparent)); }
.wp-finale-foliage { position: absolute; top: 0; left: -3%; right: -3%; pointer-events: none; }
.wp-finale-foliage img { display: block; width: 100%; height: auto; }
@media (min-width: 960px) { .wp-finale-foliage { left: 50%; right: auto; width: min(1100px, 80vw); margin-left: calc(min(1100px, 80vw) / -2); } }
.wp-finale-lantern { position: absolute; top: clamp(70px, 18vw, 150px); width: clamp(60px, 12vw, 120px); height: auto; transform-origin: 50% 0; animation: wp-lantern 6s ease-in-out infinite alternate; filter: drop-shadow(0 0 16px rgba(255,210,120,.5)); }
.wp-finale-lantern-l { left: 3%; }
.wp-finale-lantern-r { right: 3%; animation-delay: -3s; transform: scaleX(-1); }
@media (max-width: 699px) { .wp-finale-lantern { width: 52px; top: 120px; } }
.wp-finale-in { position: relative; z-index: 2; max-width: 720px; margin: 0 auto; }
.wp-seal { display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 0 0 18px; }
.wp-seal b { font: 500 clamp(40px, 9vw, 64px)/1.2 var(--wk-font-deva); color: var(--wp-gold-d); }
.wp-seal small { font: 600 13px/1.4 var(--wk-font-caps); letter-spacing: .32em; text-transform: uppercase; color: var(--wp-blue-d); }
.wp-finale-names { margin: 0 0 10px; font: 400 clamp(46px, 12vw, 88px)/1.1 var(--wk-font-script); color: var(--wp-names); text-wrap: balance; }
.wp-finale-names span { font: italic 400 .45em var(--wk-font-display); color: var(--wp-gold-d); }
.wp-finale-line { margin: 0 auto 8px; max-width: 40ch; font: italic 400 clamp(18px, 3.4vw, 22px)/1.5 var(--wk-font-display); color: var(--wk-ink); }
.wp-hashtag { margin: 0 0 22px; font: 600 15px/1.4 var(--wk-font-sans); letter-spacing: .06em; color: var(--wp-blue-d); }
.wp-finale-actions { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 10px; }
.wp-replay { min-height: 44px; padding: 0 18px; border: 0; border-radius: 999px; background: none; cursor: pointer; font: 600 14px/1 var(--wk-font-sans); color: var(--wp-blue-ink); text-decoration: underline; text-underline-offset: 4px; }
.wp-finale-foot { position: relative; margin: clamp(10px, 4vw, 30px) -16px 0; pointer-events: none; }
.wp-finale-gazebo { position: relative; z-index: 1; display: block; width: clamp(130px, 26vw, 220px); height: auto; margin: 0 auto -16%; }
.wp-finale-foot .wp-lake { position: relative; z-index: 0; }
.wp-drift { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.wp-drift i { position: absolute; top: -20px; border-radius: 60% 0 60% 0; background: linear-gradient(135deg, #F7C7D4, #E68FA7); opacity: 0; }
.wp-finale.is-on .wp-drift i { animation: wp-drift linear infinite; }
@keyframes wp-drift { 0% { opacity: 0; transform: translate(0, 0) rotate(0); } 10% { opacity: .85; } 100% { opacity: 0; transform: translate(var(--dx), 110vh) rotate(320deg); } }
@media (prefers-reduced-motion: reduce) {
  .wp-root *, .wp-root *::before, .wp-root *::after { animation: none !important; }
  .wp-in, .wp-hero-flamingo, .wp-hero-banana, .wp-hero-peacock, .wp-hero-flora { transition-duration: .3s !important; transition-delay: 0s !important; }
}
.wp-root.is-lite .wp-drift, .wp-root.is-lite .wp-venue-sparks { display: none; }
`;
