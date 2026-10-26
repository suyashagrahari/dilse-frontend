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
.wp-lang { position: fixed; z-index: 55; top: max(10px, env(safe-area-inset-top)); left: 12px; display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border-radius: 999px; background: rgba(255,254,250,.92); border: 1px solid var(--wp-line); box-shadow: 0 8px 22px -12px rgba(31,62,87,.5); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.wp-lang-pill { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: linear-gradient(135deg, color-mix(in srgb, var(--wp-blue) 55%, var(--wp-blue-d)), var(--wp-blue-d)); box-shadow: 0 6px 14px -8px rgba(31,62,87,.8), inset 0 1px 0 rgba(255,255,255,.3); transition: transform .45s cubic-bezier(.34,1.4,.64,1); }
.wp-lang.is-hi .wp-lang-pill { transform: translateX(100%); }
.wp-lang button { position: relative; z-index: 1; min-width: 52px; min-height: 40px; padding: 0 10px; border: 0; border-radius: 999px; background: none; font: 700 13px/1 var(--wk-font-sans); letter-spacing: .04em; color: var(--wp-blue-ink); cursor: pointer; transition: color .3s ease; -webkit-tap-highlight-color: transparent; }
.wp-lang button[lang=hi] { font: 600 14.5px/1 var(--wk-font-deva); letter-spacing: 0; }
.wp-lang button[aria-pressed=true] { color: #fff; }
.wp-lang button:focus-visible { outline: 2px solid var(--wp-gold); outline-offset: 2px; }

/* ══ The opening: French doors ═══════════════════════════ */
.wp-open { position: fixed; inset: 0; z-index: 60; overflow: hidden; background: linear-gradient(180deg, #E4EFF8 0%, #F6F9FB 45%, #FBF6EA 100%); }
.wp-open.is-push { opacity: 0; pointer-events: none; transition: opacity .55s ease .62s; }
.wp-open-flash { position: fixed; left: 50%; top: 52%; z-index: 9; width: 170vmax; height: 170vmax; margin: -85vmax 0 0 -85vmax; display: grid; place-items: center; border-radius: 50%; pointer-events: none; opacity: 0; transform: scale(.06); background: radial-gradient(closest-side, #FFFDF4 0%, #FFF8E8 20%, #F6F6F0 38%, #EEF4F8 60%, #E8F1F8 100%); transition: opacity .35s ease, transform .9s cubic-bezier(.35,0,.2,1); }
.wp-open-flash img { width: min(62vmin, 520px); height: auto; opacity: 0; transform: scale(.4) rotate(-40deg); transition: opacity .5s ease .12s, transform 1.2s cubic-bezier(.2,.8,.2,1); }
.wp-open.is-push:not(.is-reduced) .wp-open-flash { opacity: 1; transform: scale(1); }
.wp-open.is-push:not(.is-reduced) .wp-open-flash img { opacity: .38; transform: scale(1.1) rotate(30deg); }
.wp-open.is-reduced .wp-open-flash { display: none; }
.wp-open.is-reduced.is-push { transition: opacity .4s linear; }
.wp-open-lake { --lv-water: 24%; --lv-hills: 16%; }
.wp-open-lake .wp-lv-lotus { display: none; }
.wp-open-wash { position: absolute; inset: 0; background: radial-gradient(46% 52% at 50% 54%, rgba(255,253,247,.92), rgba(255,253,247,.55) 55%, rgba(255,253,247,.25) 80%), linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 35%, rgba(255,253,247,.4)); }
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
.wp-open.is-opening .wp-sun, .wp-open.is-push .wp-sun { opacity: 1; }
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
.wp-open.is-opening .wp-glare img { animation: wp-glare 1s var(--wp-soft) both; }
.wp-door-r .wp-glare img { animation-delay: .08s !important; }
@keyframes wp-glare { from { translate: -130% 0; } to { translate: 160% 0; } }
.wp-shade { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s var(--wp-door) .35s; pointer-events: none; }
.wp-door-l .wp-shade { background: linear-gradient(to left, rgba(20,44,66,0), rgba(20,44,66,.5)); }
.wp-door-r .wp-shade { background: linear-gradient(to right, rgba(20,44,66,0), rgba(20,44,66,.5)); }
.wp-open.is-opening .wp-shade, .wp-open.is-push .wp-shade { opacity: .22; }
.wp-frame { position: absolute; inset: 0; z-index: 4; width: 100%; height: 100%; pointer-events: none; }
.wp-floor { position: absolute; z-index: 5; left: 6%; right: 6%; bottom: 1%; height: 12%; border-radius: 50%; background: radial-gradient(50% 50% at 50% 50%, rgba(255,240,200,.9), rgba(255,240,200,0) 70%); opacity: 0; scale: .6 1; transition: opacity 1s var(--wp-soft) .6s, scale 1.4s var(--wp-ease) .6s; pointer-events: none; }
.wp-open.is-opening .wp-floor, .wp-open.is-push .wp-floor { opacity: 1; scale: 1.5 1; }
/* Only the crown of template15's floral arch: a light spray over the doorway, every cut edge dissolved. */
.wp-arch { position: absolute; z-index: 5; left: -12%; top: 4%; width: 124%; height: auto; pointer-events: none; opacity: 0; scale: .94; transform-origin: 50% 0; transition: opacity 1.4s var(--wp-soft) .3s, scale 1.8s var(--wp-ease) .3s; -webkit-mask-image: linear-gradient(90deg, transparent 2%, #000 22%, #000 78%, transparent 98%), linear-gradient(180deg, transparent 0%, #000 8%, #000 22%, transparent 42%); -webkit-mask-composite: source-in; mask-image: linear-gradient(90deg, transparent 2%, #000 22%, #000 78%, transparent 98%), linear-gradient(180deg, transparent 0%, #000 8%, #000 22%, transparent 42%); mask-composite: intersect; }
.wp-open.is-ready .wp-arch { opacity: .92; scale: 1; }
.wp-open.is-opening .wp-arch { scale: 1.03; transition-duration: 2s; }
.wp-open.is-push .wp-arch { opacity: 0 !important; transition: opacity .45s ease; }
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
@media (prefers-reduced-motion: reduce) { .wp-glare img { animation: none !important; } .wp-open-btn::after { animation: none; } }

/* ══ The watercolour lake (opening + hero) — still ═══════ */
.wp-lakeview { position: absolute; inset: 0; overflow: hidden; pointer-events: none; --lv-water: 30%; --lv-hills: 24%; }
.wp-lv-sky { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.wp-lv-hills { position: absolute; left: -2%; width: 104%; bottom: calc(var(--lv-water) - 2px); height: var(--lv-hills); }
.wp-lv-water { position: absolute; left: 0; right: 0; bottom: 0; height: var(--lv-water); overflow: hidden; background: linear-gradient(180deg, #D6EAEF 0%, #BEDDE6 35%, #A9D2DE 75%, #A2CEDA 100%); }
.wp-lv-water::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 26%; background: linear-gradient(180deg, rgba(255,255,255,.5), transparent); }
.wp-lv-lotus { position: absolute; height: auto; filter: drop-shadow(0 6px 6px rgba(31,62,87,.18)); }

/* ══ The hero: template6's card, kept quiet ══════════════ */
/* Every measure comes from one unit (--u) so the scene keeps its proportions on any screen. */
.wp-hero { position: relative; isolation: isolate; overflow: hidden; min-height: 100svh; display: flex; flex-direction: column; align-items: center; padding: 92px 18px calc(var(--u) * 46); --u: min(1vw, .62svh); }
.wp-hero-lake { z-index: -2; --lv-water: calc(var(--u) * 24); --lv-hills: calc(var(--u) * 15); }
.wp-hero-lake::after { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 62%; background: radial-gradient(60% 70% at 50% 40%, rgba(255,255,255,.62), rgba(255,255,255,0) 72%); }
.wp-scene { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.wp-sc { position: absolute; display: block; height: auto; opacity: 0; transition: opacity 1.2s var(--wp-soft); transition-delay: var(--sd, .3s); }
.wp-hero.is-on .wp-sc { opacity: 1; }
/* back to front; none of it moves — each piece only fades in once */
.wp-sc-palm { right: calc(var(--gz-r) + var(--gz-h) * .629 * .62); bottom: calc(var(--u) * 7); height: calc(var(--gz-h) * .95); width: auto; --sd: .2s; }
/* the gazebo is placed by three numbers; its peacock is perched from them (feet on the cornice, ~58% up) */
.wp-hero { --gz-r: calc(var(--u) * -4); --gz-b: calc(var(--u) * 5); --gz-h: calc(var(--u) * 62); --pk-h: calc(var(--gz-h) * .42); }
.wp-sc-gazebo { right: var(--gz-r); bottom: var(--gz-b); height: var(--gz-h); width: auto; --sd: .35s; filter: drop-shadow(0 18px 22px rgba(31,62,87,.16)); }
.wp-sc-peacock-r { right: calc(var(--gz-r) + var(--gz-h) * .629 * .56); bottom: calc(var(--gz-b) + var(--gz-h) * .6 - var(--pk-h) * .76); height: var(--pk-h); width: auto; --sd: .9s; }
.wp-sc-banana { left: calc(var(--u) * -10); bottom: calc(var(--u) * 6); height: calc(var(--u) * 74); width: auto; --sd: .25s; }
.wp-sc-peacock-l { left: calc(var(--u) * 2); bottom: calc(var(--u) * 38); height: calc(var(--u) * 26); width: auto; --sd: 1s; }
.wp-sc-couple { left: calc(var(--u) * -2); bottom: 0; width: calc(var(--u) * 78); --sd: .6s; filter: drop-shadow(0 16px 18px rgba(31,62,87,.22)); }
.wp-sc-shrub { right: calc(var(--u) * -6); bottom: calc(var(--u) * -3); width: calc(var(--u) * 30); --sd: .7s; }
.wp-sc-flora { left: calc(var(--u) * -6); bottom: calc(var(--u) * -3); width: calc(var(--u) * 18); --sd: .8s; }
/* the top border: one garland strip across the top; on wide screens a mirrored second strip completes it */
.wp-garland { position: absolute; z-index: 0; top: 0; left: 0; right: 0; display: flex; justify-content: center; pointer-events: none; opacity: 0; transition: opacity 1.2s var(--wp-soft) .15s; }
.wp-hero.is-on .wp-garland { opacity: 1; }
.wp-garland picture { display: block; flex: 0 0 auto; }
.wp-garland img { display: block; height: auto; }
/* the strip is cut flat along its top, so it sits flush against the screen's top edge (no margin) */
.wp-garland-a { width: 112vw; margin: 0 -6vw; }
.wp-garland .wp-garland-b { display: none; }
.wp-scene-top { z-index: 1; }
.wp-sc-lantern { top: calc(var(--u) * 4); width: calc(var(--u) * 11); --sd: .5s; filter: drop-shadow(0 10px 14px rgba(31,62,87,.16)); }
.wp-sc-lantern.is-l { left: calc(var(--u) * 24); }
.wp-sc-lantern.is-r { right: calc(var(--u) * 24); scale: -1 1; }
.wp-sc-rail { position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--u) * 9); background: ${BALUSTRADE} repeat-x 0 100% / auto 100%; opacity: 0; transition: opacity 1.2s var(--wp-soft) .45s; filter: drop-shadow(0 -4px 10px rgba(31,62,87,.1)); }
.wp-hero.is-on .wp-sc-rail { opacity: 1; }
/* the words, in the sky */
.wp-hero-words { position: relative; z-index: 2; text-align: center; max-width: 680px; }
.wp-in { opacity: 0; transition: opacity 1.1s var(--wp-soft); transition-delay: calc(var(--d, 0ms) + .2s); }
.wp-hero.is-on .wp-in { opacity: 1; }
.wp-motif { display: block; width: max-content; margin: 0 auto 8px; color: var(--wp-gold-d); }
.wp-motif-text { font: 500 16px/1.5 var(--wk-font-deva); }
.wp-motif-lotus { display: block; width: 64px; height: auto; }
.wp-hero-dear { margin: 0 0 6px; font: italic 500 clamp(18px, 3.6vw, 22px)/1.35 var(--wk-font-display); color: var(--wp-pink-d); }
.wp-hero-kicker { margin: 0; font: 600 12.5px/1.5 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wp-blue-ink); }
.wp-root.is-hi .wp-hero-kicker { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 16px; }
.wp-hero-names { margin: 6px 0 4px; font: 400 clamp(50px, 14vw, 64px)/1 var(--wk-font-script); color: #B4385A; }
.wp-hero-names > span { display: block; white-space: nowrap; padding: .1em .4em .14em; margin: -.1em -.4em -.14em; }
.wp-hero-names > i { display: block; margin: -.04em 0 0; font: italic 400 .36em/1.2 var(--wk-font-display); color: var(--wp-gold-d); }
.wp-hero-line { margin: 0 auto; max-width: 34ch; font: italic 500 clamp(17px, 3.4vw, 21px)/1.45 var(--wk-font-display); color: var(--wp-blue-ink); }
.wp-root.is-hi .wp-hero-line { font-family: var(--wk-font-deva); font-style: normal; font-size: 17px; line-height: 1.8; }
.wp-hero .wp-rule { margin: 12px auto; }
.wp-hero-when { margin: 0; font: 600 clamp(18px, 3.6vw, 22px)/1.3 var(--wk-font-display); color: var(--wp-blue-ink); }
.wp-hero-muhurat { margin: 4px 0 0; font: italic 600 16.5px/1.4 var(--wk-font-display); color: var(--wp-pink-d); }
.wp-hero-place { margin: 5px 0 0; font: 500 14px/1.5 var(--wk-font-sans); letter-spacing: .03em; color: var(--wp-blue-ink); }
.wp-hero-actions { display: flex; flex-wrap: nowrap; gap: 8px; justify-content: center; margin-top: 16px; }
.wp-hero-actions .wp-btn { min-height: 44px; padding: 0 16px; font-size: 13.5px; }
.wp-hero-scroll { display: none; }
/* phones: a taller scene unit so the terrace reads at full width */
@media (max-width: 559px) {
  .wp-hero { --u: 1vw; padding: 84px 14px 62vw; }
  .wp-hero-lake { --lv-water: 30vw; --lv-hills: 20vw; }
  .wp-sc-couple { left: -3vw; width: 72vw; }
  .wp-hero { --gz-r: -6vw; --gz-b: 6vw; --gz-h: 66vw; }
  .wp-sc-palm, .wp-sc-lantern { display: none; }
  .wp-hero { padding-top: 26vw; }
  .wp-sc-banana { left: -14vw; height: 66vw; }
  .wp-sc-peacock-l { left: -2vw; bottom: 34vw; height: 24vw; }
  .wp-sc-flora { width: 20vw; }
  .wp-sc-shrub { width: 28vw; }
  .wp-sc-rail { height: 11vw; }
}
@media (min-width: 560px) and (max-width: 959px) {
  .wp-hero { --u: min(1.2vw, .6svh); }
  .wp-sc-couple { left: calc(var(--u) * 2); width: calc(var(--u) * 60); }
  .wp-hero { --gz-r: calc(var(--u) * 2); --gz-h: calc(var(--u) * 62); }
  .wp-garland-a { width: 104vw; margin: 0 -2vw; }
  .wp-hero { padding-top: max(150px, 26vw); }
  .wp-sc-lantern { top: 12vw; width: 7vw; }
  .wp-sc-lantern.is-l { left: 10vw; }
  .wp-sc-lantern.is-r { right: 10vw; }
}
/* laptops and desktops: the names on one line, the scene framing them from below */
@media (min-width: 960px) {
  /* the words sit in the middle of the open sky between the garland and the scene, not pinned to the top */
  .wp-hero { justify-content: center; padding: clamp(70px, 10svh, 110px) 40px calc(var(--u) * 30); --u: min(.95vw, .78svh); }
  .wp-hero-names { display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 0 .18em; font-size: clamp(60px, min(6.2vw, 10.5svh), 116px); }
  .wp-hero-names > i { margin: 0; font-size: .4em; }
  .wp-hero-line { max-width: 46ch; }
  .wp-hero-actions .wp-btn { min-height: 46px; padding: 0 20px; font-size: 14.5px; }
  .wp-sc-couple { left: calc(var(--u) * 4); width: calc(var(--u) * 60); }
  .wp-hero { --gz-r: calc(var(--u) * 5); --gz-h: calc(var(--u) * 70); }
  /* two mirrored strips, each kept to its side of the screen and faded where they meet over the names */
  .wp-garland { justify-content: space-between; }
  .wp-garland .wp-garland-a, .wp-garland .wp-garland-b { display: block; width: min(44vw, calc(var(--u) * 78)); margin-top: 0; }
  .wp-garland picture { margin-left: -2vw; }
  .wp-garland-b { margin-right: -2vw; scale: -1 1; }
  .wp-garland-a, .wp-garland-b { -webkit-mask-image: linear-gradient(90deg, #000 62%, transparent 98%); mask-image: linear-gradient(90deg, #000 62%, transparent 98%); }
  .wp-sc-lantern { top: calc(min(44vw, calc(var(--u) * 78)) * .1); width: calc(var(--u) * 8.5); }
  .wp-sc-lantern.is-l { left: calc(min(44vw, calc(var(--u) * 78)) * .3); }
  .wp-sc-lantern.is-r { right: calc(min(44vw, calc(var(--u) * 78)) * .3); }
  .wp-hero-lake { --lv-water: calc(var(--u) * 26); --lv-hills: calc(var(--u) * 18); }
}
@media (min-width: 960px) and (max-height: 820px) {
  .wp-hero .wp-rule { margin: 8px auto; }
  .wp-hero-actions { margin-top: 12px; }
}

/* ══ The invitation ══════════════════════════════════════ */
.wp-sec-invite { padding-top: clamp(40px, 6vw, 70px); }
.wp-invite { position: relative; max-width: 900px; margin: 0 auto; padding: clamp(60px, 9vw, 92px) clamp(20px, 6vw, 72px) clamp(36px, 6vw, 64px); text-align: center; background: var(--wp-card); border-radius: 28px; border: 1px solid var(--wp-line); box-shadow: 0 30px 60px -40px rgba(31,62,87,.5); }
.wp-invite::before { content: ""; position: absolute; inset: 10px; border-radius: 20px; border: 1px solid rgba(201,162,74,.3); pointer-events: none; }
.wp-invite-branch { position: absolute; z-index: 1; top: -34px; right: -14px; width: clamp(150px, 36vw, 280px); height: auto; pointer-events: none; transform-origin: 90% 10%; animation: wp-branch 7s ease-in-out infinite alternate; }
@keyframes wp-branch { from { rotate: -1.5deg; } to { rotate: 1.5deg; } }
.wp-invite-motif { position: relative; z-index: 2; }
.wp-invite-portrait { position: relative; z-index: 2; width: min(62%, 260px); aspect-ratio: 4 / 5; margin: 0 auto 22px; overflow: hidden; border-radius: 999px 999px 22px 22px; border: 6px solid #FFFEFA; background: var(--wk-placeholder); box-shadow: 0 0 0 1.5px var(--wp-gold), 0 26px 44px -26px rgba(31,62,87,.55); }
.wp-invite-portrait img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
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

/* ══ Functions: a terrace stage per celebration, each with its couple ═══ */
.wp-ev-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 26px; }
.wp-ev-list > * { flex: 0 0 100%; min-width: 0; }
@media (max-width: 699px) {
  .wp-ev-list.is-rail { flex-wrap: nowrap; gap: 14px; margin-inline: calc(50% - 50vw); padding: 22px 9vw 14px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: 9vw; overscroll-behavior-x: contain; scrollbar-width: none; }
  .wp-ev-list.is-rail::-webkit-scrollbar { display: none; }
  .wp-ev-list.is-rail > * { flex: 0 0 82vw; scroll-snap-align: center; }
}
@media (min-width: 700px) { .wp-ev-list > * { flex-basis: calc((100% - 26px) / 2); } .wp-ev-dots { display: none !important; } }
@media (min-width: 1100px) { .wp-ev-list { gap: 30px; } .wp-ev-list > * { flex-basis: calc((100% - 60px) / 3); } }
.wp-ev { min-width: 0; display: flex; }
.wp-ev-card { position: relative; flex: 1; display: flex; flex-direction: column; padding: 0 0 22px; background: var(--wp-card); border: 1px solid var(--wp-line); border-radius: 26px; box-shadow: 0 26px 50px -38px rgba(31,62,87,.55); transition: transform .45s var(--wp-ease), box-shadow .45s; }
@media (hover: hover) { .wp-ev-card:hover { transform: translateY(-6px); box-shadow: 0 40px 64px -38px rgba(31,62,87,.6); } }
.wp-ev-stage { position: relative; height: clamp(250px, 64vw, 290px); margin: 7px 7px 0; border-radius: 20px 20px 0 0; overflow: hidden; isolation: isolate;
  background: radial-gradient(70% 70% at 50% 72%, color-mix(in srgb, var(--fn) 34%, transparent), transparent 75%), linear-gradient(180deg, color-mix(in srgb, var(--wp-blue) 22%, #fff) 0%, color-mix(in srgb, var(--fn) 12%, #fff) 70%, #fff); }
.wp-ev-stage::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 26%; z-index: -1; background: linear-gradient(180deg, color-mix(in srgb, var(--wp-blue) 30%, #fff), color-mix(in srgb, var(--wp-blue) 12%, #fff)); opacity: .7; }
.wp-ev-window { position: absolute; left: 50%; bottom: 0; width: min(62%, 220px); height: 86%; translate: -50% 0; border-radius: 999px 999px 0 0; background: radial-gradient(80% 55% at 50% 38%, #fff 0%, color-mix(in srgb, var(--fn) 22%, #fff) 55%, color-mix(in srgb, var(--fn) 40%, #fff) 100%); box-shadow: inset 0 0 0 1.5px var(--wp-gold), inset 0 0 0 7px rgba(255,255,255,.6), inset 0 0 0 8px rgba(201,162,74,.4), 0 0 40px 6px color-mix(in srgb, var(--fn) 30%, transparent); }
.wp-ev-couple { position: absolute; left: 50%; bottom: 6px; height: 90%; width: auto; max-width: 92%; object-fit: contain; object-position: 50% 100%; translate: -50% 18px; scale: .94; transform-origin: 50% 100%; opacity: 0; filter: drop-shadow(0 12px 12px rgba(31,62,87,.22)); transition: translate 1.1s cubic-bezier(.34,1.4,.64,1) .25s, scale 1.1s cubic-bezier(.34,1.4,.64,1) .25s, opacity .8s ease .25s; }
.wp-ev.is-in .wp-ev-couple { opacity: 1; translate: -50% 0; scale: 1; }
@media (hover: hover) { .wp-ev.is-in .wp-ev-card:hover .wp-ev-couple { translate: -50% -6px; scale: 1.04; transition-delay: 0s; transition-duration: .5s; } }
.wp-ev-couple.is-sangeet { height: 86%; }
.wp-ev.is-in .wp-ev-couple.is-sangeet { animation: wp-dance 2.8s ease-in-out 1.4s infinite; }
@keyframes wp-dance { 0%, 100% { rotate: -1.5deg; } 50% { rotate: 1.5deg; } }
.wp-ev-floor { position: absolute; left: 22%; right: 22%; bottom: 0; height: 22px; border-radius: 50%; background: radial-gradient(closest-side, rgba(31,62,87,.22), transparent); z-index: -1; }
.wp-ev-sprig { position: absolute; z-index: 2; top: -10px; right: -12px; width: 104px; height: auto; pointer-events: none; rotate: 10deg; }
.wp-ev-plate { position: absolute; z-index: 3; left: 18px; top: 18px; display: grid; justify-items: center; align-content: center; gap: 2px; min-width: 62px; padding: 9px 10px 8px; border-radius: 16px; color: #FFF8E6;
  background: radial-gradient(90% 120% at 0% 0%, rgba(255,255,255,.28), transparent 60%), linear-gradient(150deg, var(--wp-blue), var(--wp-blue-d)); box-shadow: 0 10px 18px -10px rgba(31,62,87,.7); }
.wp-ev-plate::after { content: ""; position: absolute; inset: 4px; border-radius: 12px; border: 1px solid rgba(255,240,200,.45); pointer-events: none; }
.wp-ev.is-main .wp-ev-plate { background: radial-gradient(90% 120% at 0% 0%, rgba(255,255,255,.3), transparent 60%), linear-gradient(150deg, #E8B4C3, var(--wp-pink-d)); }
.wp-ev-day { font: 500 30px/1 var(--wk-font-display); color: #FFF3D2; }
.wp-ev-mon { font: 700 10.5px/1.2 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; }
.wp-root.is-hi .wp-ev-mon { font-family: var(--wk-font-deva); letter-spacing: 0; font-size: 12px; }
.wp-ev-wd { display: none; }
.wp-ev-body { position: relative; flex: 1; display: flex; flex-direction: column; padding: 16px 20px 0; margin: 0 7px; border-top: 1px solid var(--wp-line); }
.wp-ev-body::before { content: ""; position: absolute; left: 50%; top: -5px; width: 9px; height: 9px; translate: -50% 0; rotate: 45deg; background: var(--wp-card); border: 1px solid var(--wp-gold); }
.wp-ev-title { margin: 0 0 12px; text-align: center; font: 500 clamp(26px, 4vw, 30px)/1.15 var(--wk-font-display); color: var(--wp-names); }
.wp-ev-title[lang=hi] { font: 600 clamp(23px, 6vw, 27px)/1.35 var(--wk-font-deva); }
.wp-ev-line { display: flex; align-items: flex-start; gap: 10px; margin: 0 0 9px; font: 400 14.5px/1.45 var(--wk-font-sans); color: var(--wk-ink); }
.wp-ev-line > svg { flex: none; margin-top: 2px; color: var(--wp-blue-d); }
.wp-ev-line b { font-weight: 600; }
.wp-ev-addr { display: block; color: var(--wk-muted); font-size: 13.5px; }
.wp-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1.5px var(--wp-gold); }
.wp-ev-k { font-weight: 700; color: var(--wp-blue-d); }
.wp-ev-note { margin: 8px 0 0; padding: 10px 14px; border-radius: 14px; font: italic 400 16px/1.5 var(--wk-font-display); color: var(--wk-muted); background: color-mix(in srgb, var(--fn) 10%, transparent); }
.wp-ev-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: auto; padding-top: 16px; }
.wp-ev-actions > * { justify-content: center; width: 100%; min-width: 0; white-space: nowrap; }
.wp-ev-actions > * > span { overflow: hidden; text-overflow: ellipsis; }
.wp-ev-wa { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 0; cursor: pointer; font: 700 14px/1 var(--wk-font-sans); color: #fff; background: #1FA855; }
.wp-ev-g { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 12px; border-radius: 999px; border: 1.5px solid color-mix(in srgb, var(--wp-blue) 55%, transparent); font: 700 14px/1 var(--wk-font-sans); color: var(--wp-blue-ink); text-decoration: none; background: rgba(255,254,250,.86); }
.wp-ev-dots { display: flex; justify-content: center; margin-top: 4px; }
.wp-ev-dots button { display: grid; place-items: center; min-width: 24px; height: 28px; padding: 0 2px; border: 0; background: none; cursor: pointer; }
.wp-ev-dots button::after { content: ""; width: 8px; height: 8px; border-radius: 999px; background: color-mix(in srgb, var(--wp-blue-d) 28%, transparent); transition: width .3s var(--wp-ease), background-color .3s ease; }
.wp-ev-dots button.is-on::after { width: 24px; background: var(--wp-blue-d); }
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
.wp-rsvp .wk-card, .wp-root #blessings .wk-card { background: var(--wp-card); }
.wp-rsvp-wrap { display: grid; gap: 20px; max-width: 680px; margin: 0 auto; }
.wp-rsvp-art { position: relative; display: grid; justify-items: center; text-align: center; gap: 4px; }
.wp-rsvp-arch { position: relative; display: block; width: min(84%, 330px); aspect-ratio: 4 / 4.2; border-radius: 999px 999px 26px 26px; overflow: hidden; background: linear-gradient(180deg, color-mix(in srgb, var(--wp-blue) 35%, #fff), #fff); box-shadow: inset 0 0 0 1.5px var(--wp-gold), inset 0 0 0 8px rgba(255,255,255,.6), inset 0 0 0 9px rgba(201,162,74,.4), 0 30px 60px -36px rgba(31,62,87,.6); }
.wp-rsvp-sky { position: absolute; inset: 0; width: 100%; height: 70%; object-fit: cover; opacity: .9; }
.wp-rsvp-lake { position: absolute; left: -10%; width: 120%; bottom: 18%; height: auto; opacity: .9; -webkit-mask-image: linear-gradient(transparent, #000 40%); mask-image: linear-gradient(transparent, #000 40%); }
.wp-rsvp-couple { position: absolute; left: 50%; bottom: 4%; width: 92%; height: auto; translate: -50% 0; filter: drop-shadow(0 12px 14px rgba(31,62,87,.25)); }
.wp-rsvp-art.is-in .wp-rsvp-couple { animation: wp-float-c 6s ease-in-out 1s infinite alternate; }
@keyframes wp-float-c { from { translate: -50% 0; } to { translate: -50% -4px; } }
.wp-rsvp-lantern { position: absolute; top: -6px; right: calc(50% - min(42%, 165px) - 26px); width: clamp(64px, 16vw, 104px); height: auto; transform-origin: 50% 0; animation: wp-lantern 6s ease-in-out infinite alternate; pointer-events: none; }
.wp-rsvp-flora { position: absolute; left: calc(50% - min(42%, 165px) - 40px); bottom: 70px; width: clamp(96px, 24vw, 150px); height: auto; pointer-events: none; }
.wp-upasthiti { margin: 14px 0 0; text-align: center; font: italic 500 clamp(22px, 4.6vw, 28px)/1.35 var(--wk-font-display); color: var(--wp-pink-d); text-wrap: balance; }
.wp-root.is-hi .wp-upasthiti { font: 500 22px/1.5 var(--wk-font-deva); }
.wp-rsvp-couple-names { margin: 0; font: 600 12.5px/1.4 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wp-blue-d); }
.wp-rsvp-form { min-width: 0; }
@media (min-width: 1024px) {
  .wp-rsvp-wrap { max-width: 1160px; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: center; gap: clamp(36px, 5vw, 72px); }
  .wp-rsvp-arch { width: min(100%, 430px); }
  .wp-rsvp-lantern { right: 0; width: 110px; }
  .wp-rsvp-flora { left: -20px; width: 170px; bottom: 90px; }
  .wp-root .wp-rsvp-form .wk-rsvp { padding: clamp(30px, 3vw, 44px) clamp(28px, 3.4vw, 52px); }
  .wp-root .wp-sec-bless .wk-bless { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); align-items: start; gap: clamp(30px, 4vw, 60px); }
  .wp-root .wp-sec-bless .wk-bless-form { max-width: none; position: sticky; top: 90px; }
}
.wp-root.is-hi .wk-rsvp .wk-field-l, .wp-root.is-hi .wk-bless .wk-field-l { letter-spacing: .01em; font-family: var(--wk-font-deva), var(--wk-font-sans); }

/* ══ Finale ══════════════════════════════════════════════ */
.wp-finale { position: relative; overflow: hidden; padding: clamp(140px, 30vw, 260px) 16px 0; text-align: center; background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--wp-pink) 14%, transparent) 50%, color-mix(in srgb, var(--wp-blue) 24%, transparent)); }
.wp-finale-foliage { position: absolute; top: 0; left: -3%; right: -3%; pointer-events: none; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); -webkit-mask-composite: source-in; mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); mask-composite: intersect; }
.wp-lake { display: block; width: 100%; height: clamp(120px, 30vw, 300px); object-fit: cover; object-position: 50% 80%; -webkit-mask-image: linear-gradient(transparent, #000 30%); mask-image: linear-gradient(transparent, #000 30%); }
.wp-balustrade { position: absolute; left: 0; right: 0; bottom: 0; height: clamp(54px, 12vw, 120px); background: ${BALUSTRADE} repeat-x 0 100% / auto 100%; }
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
  .wp-in, .wp-sc, .wp-sc-rail { transition-duration: .3s !important; transition-delay: 0s !important; }
}
.wp-root.is-lite .wp-drift, .wp-root.is-lite .wp-venue-sparks { display: none; }
`;
