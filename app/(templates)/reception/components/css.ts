// ─── Reception Night — the page's own CSS (on top of the wedding kit) ────────
// Palette: ivory, champagne, antique gold and blush (Blush Ballroom and Pearl
// & Gold re-tint it). Every looping or long motion is transform / opacity.
// Phones first; 600 / 760 / 960 / 1200px widen it into designed spreads.

import { cdn } from "../../_wedding/media";
import { A } from "./art";

const TILE = `url("${cdn(A.tile.src)}")`;

export const RC_CSS = `
html:has(.rc-root) { scroll-padding-top: 72px; scroll-padding-bottom: 96px; }
.rc-root {
  --rc-ease: cubic-bezier(.22,1,.36,1); --rc-soft: cubic-bezier(.22,.61,.36,1); --rc-expo: cubic-bezier(.16,1,.3,1); --rc-door: cubic-bezier(.65,0,.25,1); --rc-spring: cubic-bezier(.34,1.56,.64,1);
  --rc-bg1: #FBF4E8; --rc-bg2: #F3E3C8; --rc-paper: #FFFDF8; --rc-ink: #3A2A1C; --rc-muted: #7A6650;
  --rc-gold: #B8892E; --rc-gold-l: #E6C878; --rc-gold-d: #84601C; --rc-names: #6E3F2C;
  --rc-blush: #F4D9D4; --rc-rose: #B5727A; --rc-rose-d: #8A3B4A;
  --rc-line: rgba(184,137,46,.32); --rc-shadow: 0 26px 50px -30px rgba(96,64,20,.42), 0 2px 8px -4px rgba(96,64,20,.12);
  --rc-foil: linear-gradient(135deg, #8A6420 0%, #D9B45E 30%, #F6E2A6 48%, #C9993F 64%, #8A6420 100%);
  /* The kit's tokens arrive inline; !important lets the ballroom palette win. */
  --wk-accent: var(--rc-gold-d) !important; --wk-accent-ink: #FFFDF6 !important; --wk-surface-2: #F8EFE0 !important; --wk-border: var(--rc-line) !important;
  --wk-ink: var(--rc-ink) !important; --wk-muted: var(--rc-muted) !important; --wk-gold: var(--rc-gold) !important; --wk-gold-ink: var(--rc-gold-d) !important;
  --wk-texture: none !important; --wk-paper: none !important; --wk-bg: var(--rc-bg1) !important; --wk-bg2: var(--rc-bg2) !important;
  overflow-x: clip; color: var(--rc-ink); font-family: var(--wk-font-sans); background: var(--rc-bg1);
}
.rc-root, .rc-root * { font-variant-numeric: lining-nums; }
.rc-root.t-blush {
  --rc-bg1: #FCF1EF; --rc-bg2: #F5DCD8; --rc-ink: #3D2328; --rc-muted: #8B5F63; --rc-gold: #B5787F; --rc-gold-l: #E9C2B8; --rc-gold-d: #8A4652; --rc-names: #7E2F42;
  --rc-blush: #F7D9DA; --rc-rose: #C46F82; --rc-rose-d: #8A3B4A; --rc-line: rgba(181,120,127,.34);
  --rc-foil: linear-gradient(135deg, #8A4652 0%, #D99AA0 30%, #F7D7CF 48%, #C07C84 64%, #8A4652 100%);
  --wk-surface-2: #FBEDEB !important;
}
.rc-root.t-pearl {
  --rc-bg1: #FBFAF6; --rc-bg2: #E9EDE5; --rc-ink: #2F3A33; --rc-muted: #66746A; --rc-gold: #A88A45; --rc-gold-l: #DCC88E; --rc-gold-d: #6E5A24; --rc-names: #4A4630;
  --rc-blush: #E3EADF; --rc-rose: #7E9483; --rc-rose-d: #4E6A58; --rc-line: rgba(168,138,69,.32);
  --wk-surface-2: #F2F4EE !important;
}
.rc-root .wk-shimmer { animation: none !important; }
.rc-root img { max-width: none; }
.rc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* One static backdrop: the cream geometric tile under soft champagne and blush glows. */
.rc-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(60% 40% at 0% 18%, color-mix(in srgb, var(--rc-blush) 55%, transparent), transparent 70%), radial-gradient(50% 40% at 100% 72%, rgba(230,200,120,.16), transparent 70%), ${TILE} repeat 0 0 / 290px auto, var(--rc-bg1); }

/* ── Type + buttons ─────────────────────────────────────── */
.rc-eyebrow { margin: 0 0 10px; font: 600 12.5px/1.6 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--rc-gold-d); text-wrap: balance; }
.rc-root.is-hi .rc-eyebrow { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 15px; text-transform: none; }
.rc-h2 { margin: 0; font: 500 clamp(34px, 7vw, 58px)/1.1 var(--wk-font-display); color: var(--rc-names); letter-spacing: -.005em; text-wrap: balance; }
.rc-root.is-hi .rc-h2 { font-family: var(--wk-font-deva); font-size: clamp(30px, 6vw, 48px); line-height: 1.35; }
.rc-h3 { margin: 0 0 18px; font: 500 clamp(26px, 5vw, 34px)/1.2 var(--wk-font-display); color: var(--rc-names); text-align: center; }
.rc-head { text-align: center; margin: 0 auto clamp(28px, 4.4vw, 50px); max-width: 760px; }
.rc-divider { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; }
.rc-divider i { display: block; width: clamp(48px, 12vw, 90px); height: 1px; background: linear-gradient(90deg, transparent, var(--rc-gold)); }
.rc-divider i:last-child { transform: scaleX(-1); }
.rc-divider img { width: 56px; height: auto; }
.rc-sec { padding: clamp(48px, 7vw, 92px) 16px; position: relative; }
@container rcflow (min-width: 700px) { .rc-sec { padding-left: 28px; padding-right: 28px; } }

.rc-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 0 20px; border-radius: 999px; border: 0; cursor: pointer; text-decoration: none;
  font: 600 15px/1.1 var(--wk-font-sans); color: #FFFDF6; background: linear-gradient(135deg, var(--rc-gold) 0%, var(--rc-gold-d) 100%);
  box-shadow: 0 12px 24px -14px rgba(96,64,20,.75), inset 0 1px 0 rgba(255,255,255,.3); transition: transform .25s var(--rc-ease), box-shadow .25s; -webkit-tap-highlight-color: transparent; white-space: nowrap; }
.rc-btn:hover { transform: translateY(-1px); }
.rc-btn:active { transform: scale(.97); }
.rc-btn:disabled { opacity: .55; cursor: default; transform: none; }
.rc-btn:focus-visible, .rc-round:focus-visible, .rc-open-btn:focus-visible, .rc-pill:focus-visible, .rc-link:focus-visible, .rc-lang button:focus-visible { outline: 3px solid var(--rc-gold); outline-offset: 3px; }
.rc-btn.is-ghost { color: var(--rc-gold-d); background: rgba(255,253,248,.86); border: 1.5px solid color-mix(in srgb, var(--rc-gold) 55%, transparent); box-shadow: none; }
.rc-btn.is-wa { background: linear-gradient(135deg, #2BD46B, #1DA851); }
.rc-btn.is-sm { min-height: 42px; padding: 0 14px; font-size: 14px; }
.rc-btn-gold { background: var(--rc-foil); color: #3A2608; text-shadow: 0 1px 0 rgba(255,255,255,.35); }
.rc-btn svg { flex: none; }
.rc-round { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid var(--rc-line); background: var(--rc-paper); color: var(--rc-gold-d); cursor: pointer; text-decoration: none; transition: transform .2s var(--rc-ease); }
.rc-round:active { transform: scale(.94); }
.rc-round.is-wa { background: #25D366; border-color: #25D366; color: #fff; }
.rc-link { min-height: 44px; padding: 0 12px; border: 0; background: none; font: 600 14px var(--wk-font-sans); color: var(--rc-gold-d); text-decoration: underline; text-underline-offset: 4px; cursor: pointer; }
.rc-chip { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 14px; border-radius: 999px; background: rgba(255,253,248,.8); border: 1px solid var(--rc-line); font: 600 15px/1.2 var(--wk-font-sans); color: var(--rc-ink); }
.rc-chip svg { color: var(--rc-gold-d); }

/* ── Floating chrome ────────────────────────────────────── */
.rc-lang { position: fixed; z-index: 55; top: calc(var(--rc-top, 0px) + max(10px, env(safe-area-inset-top))); left: calc(var(--rc-left, 0px) + 12px); display: flex; padding: 3px; border-radius: 999px; background: rgba(255,253,248,.94); border: 1px solid var(--rc-line); box-shadow: 0 8px 20px -12px rgba(60,40,10,.35); transition: opacity .3s; }
.rc-lang button { min-width: 44px; min-height: 40px; border: 0; border-radius: 999px; background: none; font: 700 13px/1 var(--wk-font-sans); color: var(--rc-ink); cursor: pointer; }
.rc-lang button[aria-pressed=true] { background: var(--rc-gold-d); color: #fff; }
.rc-lang.is-hidden, .rc-pill-wrap.is-hidden, .rc-rail.is-hidden { opacity: 0; pointer-events: none; visibility: hidden; }
.rc-pill-wrap { position: fixed; z-index: 50; left: calc(var(--rc-left, 0px) + (100vw - var(--rc-left, 0px)) / 2); bottom: calc(14px + env(safe-area-inset-bottom)); transform: translateX(-50%); transition: opacity .3s; }
.rc-pill { display: inline-flex; align-items: center; gap: 8px; min-height: 46px; max-width: 70vw; padding: 0 18px; border-radius: 999px; border: 1px solid var(--rc-line); background: rgba(255,253,248,.95); box-shadow: 0 14px 30px -14px rgba(60,40,10,.45); font: 600 14px/1 var(--wk-font-sans); color: var(--rc-ink); cursor: pointer; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.rc-pill span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rc-pill svg { color: var(--rc-gold-d); flex: none; }
.rc-pill-menu { position: absolute; left: 50%; bottom: calc(100% + 10px); transform: translateX(-50%); width: min(300px, 86vw); max-height: 62vh; overflow: auto; padding: 8px; border-radius: 20px; background: var(--rc-paper); border: 1px solid var(--rc-line); box-shadow: 0 24px 50px -20px rgba(60,40,10,.5); animation: rc-pop .25s var(--rc-ease); }
.rc-pill-menu ul { list-style: none; margin: 0; padding: 0; }
.rc-pill-menu button { display: block; width: 100%; min-height: 44px; padding: 0 14px; border: 0; border-radius: 12px; background: none; text-align: left; font: 500 15.5px var(--wk-font-sans); color: var(--rc-ink); cursor: pointer; }
.rc-pill-menu button[aria-current=true] { background: color-mix(in srgb, var(--rc-gold-l) 35%, transparent); color: var(--rc-gold-d); font-weight: 700; }
@keyframes rc-pop { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
.rc-rail { display: none; }
@media (min-width: 1200px) {
  .rc-pill-wrap { display: none; }
  .rc-rail { display: block; position: fixed; z-index: 50; right: 10px; top: 50%; transform: translateY(-50%); transition: opacity .3s; }
  .rc-rail ul { list-style: none; margin: 0; padding: 6px 4px; display: flex; flex-direction: column; border-radius: 999px; background: rgba(255,253,248,.7); border: 1px solid var(--rc-line); }
  .rc-rail button { position: relative; display: grid; place-items: center; width: 40px; height: 40px; border: 0; background: none; cursor: pointer; }
  .rc-rail i { display: block; width: 8px; height: 8px; border-radius: 50%; background: color-mix(in srgb, var(--rc-gold) 45%, transparent); transition: transform .3s var(--rc-ease), background .3s; }
  .rc-rail button[aria-current=true] i { background: var(--rc-gold-d); transform: scale(1.5); }
  .rc-rail-l { position: absolute; right: 46px; top: 50%; transform: translate(6px, -50%); white-space: nowrap; padding: 6px 12px; border-radius: 999px; background: var(--rc-paper); border: 1px solid var(--rc-line); font: 600 13px var(--wk-font-sans); color: var(--rc-ink); opacity: 0; pointer-events: none; transition: opacity .2s, transform .2s var(--rc-ease); box-shadow: 0 10px 20px -12px rgba(60,40,10,.4); }
  .rc-rail button:hover .rc-rail-l, .rc-rail button:focus-visible .rc-rail-l { opacity: 1; transform: translate(0, -50%); }
}
/* The page's music button (DayMusic's compact icon): a champagne pill, top-right. */
.rc-music-host .vm-icon { top: calc(var(--rc-top, 0px) + max(10px, env(safe-area-inset-top, 0px))) !important; bottom: auto !important; left: auto !important; right: calc(12px + var(--rc-music-right, 0px)) !important;
  width: 44px !important; height: 44px !important; z-index: 56 !important; box-shadow: 0 8px 20px -10px rgba(60,40,10,.45), 0 0 0 1px rgba(184,137,46,.45) !important; transform: none !important; }
.rc-music-host .vm-icon-btn { color: #84601C !important; background: radial-gradient(circle at 50% 35%, #FFFDF6, #F3E2C2 75%) !important; }
.rc-music-host .vm-icon-btn:focus-visible { outline-color: #B8892E !important; }
.rc-music-host .vm-icon-eq i { background: #84601C !important; }
.rc-music-host .vm-icon-ring { background: conic-gradient(from 0deg, #B8892E, transparent 30%, #E6C878 52%, transparent 78%, #B8892E) !important; -webkit-mask: radial-gradient(circle, transparent 0 17px, #000 17.5px 20px, transparent 20.5px) !important; mask: radial-gradient(circle, transparent 0 17px, #000 17.5px 20px, transparent 20.5px) !important; }
.rc-music-host.is-covered .vm-icon { visibility: hidden !important; }

/* ══ The opening: ballroom doors ═══════════════════════════ */
.rc-open { position: fixed; inset: 0; left: var(--rc-left, 0px); z-index: 80; overflow: hidden; background: linear-gradient(180deg, #FCF6EC 0%, #F6E9D3 60%, #F1DFC2 100%); color: #3A2A1C; }
.rc-root.t-blush .rc-open { background: linear-gradient(180deg, #FDF4F2 0%, #F8E3DF 60%, #F2D2CC 100%); }
.rc-root.t-pearl .rc-open { background: linear-gradient(180deg, #FCFBF8 0%, #F1F2EC 60%, #E6EAE1 100%); }
.rc-open.is-through { opacity: 0; pointer-events: none; transition: opacity .75s var(--rc-soft) .5s; }
.rc-open.is-reduced.is-through { transition: opacity .4s linear; }
.rc-open-blur { position: absolute; inset: -40px; opacity: .5; pointer-events: none; }
.rc-open-blur img { width: 100%; height: 100%; object-fit: cover; filter: blur(18px) saturate(1.1); transform: scale(1.08); }
@media (max-width: 760px) { .rc-open-blur { opacity: .32; } }
.rc-open-tile { position: absolute; inset: 0; background: radial-gradient(70% 55% at 50% 56%, rgba(255,250,238,.9), rgba(255,250,238,0) 72%), ${TILE} repeat 50% 0 / 290px auto; opacity: .7; pointer-events: none; }
.rc-open-bloom { position: absolute; left: 50%; top: 56%; width: 150vmax; aspect-ratio: 1; margin-left: -75vmax; margin-top: -75vmax; border-radius: 50%; z-index: 7; pointer-events: none;
  background: radial-gradient(circle, rgba(255,249,234,.9) 0%, rgba(255,246,222,.6) 12%, rgba(255,240,205,.22) 30%, rgba(255,240,205,0) 50%); opacity: 0; transform: scale(.35); }
.rc-open.is-opening .rc-open-bloom { opacity: .32; transform: scale(1); transition: opacity 1.2s var(--rc-soft) .35s, transform 1.8s var(--rc-expo) .3s; }
.rc-open.is-through .rc-open-bloom { opacity: 1; transform: scale(1.1); transition: opacity .6s var(--rc-soft), transform 1.2s var(--rc-expo); }
.rc-open.is-reduced .rc-open-bloom { display: none; }

.rc-open-lights { position: absolute; z-index: 3; top: 0; left: -2%; right: -2%; display: flex; opacity: 0; transform: translateY(-24px); transition: opacity 1.2s var(--rc-soft) .2s, transform 1.4s var(--rc-ease) .2s; pointer-events: none; }
.rc-open.is-ready .rc-open-lights { opacity: 1; transform: none; }
.rc-open-lights img { width: 50%; height: clamp(96px, 22vw, 240px); object-fit: cover; object-position: 50% 0; }
.rc-open-lights-b { transform: scaleX(-1); }
@media (min-width: 960px) { .rc-open-lights img { height: clamp(140px, 15vw, 220px); -webkit-mask-image: linear-gradient(#000 65%, transparent); mask-image: linear-gradient(#000 65%, transparent); } }
.rc-twinkle { position: absolute; width: 10px; height: 10px; margin: -5px; border-radius: 50%; background: radial-gradient(circle, #FFF6CF 0 22%, rgba(255,214,120,.65) 40%, rgba(255,214,120,0) 70%); opacity: .2; animation: rc-twinkle 3s ease-in-out infinite; }
@keyframes rc-twinkle { 0%, 100% { opacity: .15; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.25); } }

.rc-open-roses { position: absolute; inset: auto 0 0 0; height: 0; z-index: 2; pointer-events: none; }
.rc-open-rose { position: absolute; bottom: -2vh; height: auto; width: clamp(150px, 30vw, 420px); opacity: 0; transform: translateY(30px); transition: opacity 1.2s var(--rc-soft) .45s, transform 1.4s var(--rc-ease) .45s; }
.rc-open-rose-l { left: -8%; }
.rc-open-rose-r { right: -8%; transform: translateY(30px) scaleX(-1); }
.rc-open.is-ready .rc-open-rose-l { opacity: 1; transform: none; }
.rc-open.is-ready .rc-open-rose-r { opacity: 1; transform: scaleX(-1); }
@media (max-width: 599px) { .rc-open-rose { width: 42vw; bottom: 64px; } .rc-open.is-ready .rc-open-rose-l, .rc-open.is-ready .rc-open-rose-r { opacity: .55; } }

.rc-open-col { position: relative; z-index: 4; height: 100%; display: flex; flex-direction: column; align-items: center; padding: calc(var(--rc-top, 0px) + max(12px, env(safe-area-inset-top)) + clamp(30px, 6svh, 70px)) 16px max(14px, env(safe-area-inset-bottom)); gap: clamp(6px, 1.6svh, 16px); }
.rc-open-copy { position: relative; text-align: center; max-width: 640px; flex: none; }
.rc-open-copy::before { content: ""; position: absolute; inset: -14% -18%; z-index: -1; pointer-events: none; background: radial-gradient(closest-side, rgba(252,246,236,.96) 60%, rgba(252,246,236,0)); }
.rc-open-copy > * { opacity: 0; transform: translateY(14px); transition: opacity .9s var(--rc-soft), transform 1s var(--rc-ease); }
.rc-open.is-ready .rc-open-copy > * { opacity: 1; transform: none; }
.rc-open.is-ready .rc-open-copy > :nth-child(1) { transition-delay: .3s; }
.rc-open.is-ready .rc-open-copy > :nth-child(2) { transition-delay: .45s; }
.rc-open.is-ready .rc-open-copy > :nth-child(3) { transition-delay: .6s; }
.rc-open.is-ready .rc-open-copy > :nth-child(4) { transition-delay: .75s; }
.rc-open-dear { margin: 0; font: italic 500 clamp(17px, 4.4vw, 22px)/1.35 var(--wk-font-display); color: #8A3B4A; }
.rc-open-dear b { font-weight: 700; font-style: normal; }
.rc-open-of { margin: 2px 0 0; font: 600 12px/1.5 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: #84601C; }
.rc-open-of:lang(hi) { font-family: var(--wk-font-deva); letter-spacing: .02em; font-size: 15px; text-transform: none; }
.rc-open-names { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center; gap: 0 .2em; margin: 0; font: 400 clamp(38px, min(11.5vw, 7.4svh), 84px)/1.15 var(--wk-font-script); color: #6E3F2C; }
.rc-root.t-blush .rc-open-names { color: #7E2F42; }
.rc-open-names i { font: italic 400 .5em var(--wk-font-display); color: #A9792C; }
.rc-open-date { margin: 0; font: 600 12.5px/1.4 var(--wk-font-sans); letter-spacing: .28em; text-transform: uppercase; color: #6B5A42; }

.rc-open-stagewrap { position: relative; flex: 1 1 auto; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; }
.rc-open-stage { position: relative; height: 100%; max-height: 66svh; aspect-ratio: 979 / 1800; max-width: 88vw; cursor: pointer; perspective: 640px; perspective-origin: 50% 46%;
  opacity: 0; transform: translateY(18px) scale(.97); transition: opacity 1.1s var(--rc-soft) .35s, transform 1.3s var(--rc-ease) .35s; -webkit-tap-highlight-color: transparent; }
.rc-open.is-ready .rc-open-stage { opacity: 1; transform: none; }
.rc-open-dolly { position: absolute; inset: 0; transform-style: preserve-3d; transform-origin: 50% 56%; }
.rc-open.is-through:not(.is-reduced) .rc-open-dolly { transform: scale(2.5); transition: transform 1.3s cubic-bezier(.55,0,.2,1); }
.rc-open-room { position: absolute; left: 9.7%; top: 5.39%; width: 81%; height: 94.61%; overflow: hidden; z-index: 0; background: #F7E9D4; }
.rc-open-room-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 22%; }
.rc-open-chand { position: absolute; left: 50%; top: 20%; width: 150%; aspect-ratio: 1; margin-left: -75%; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle, rgba(255,250,230,.98) 0%, rgba(255,232,170,.55) 22%, rgba(255,226,160,0) 52%); opacity: .3; }
.rc-open.is-opening .rc-open-chand, .rc-open.is-through .rc-open-chand { animation: rc-chand 1.1s steps(1, end) .15s forwards; }
@keyframes rc-chand { 0% { opacity: .3; } 18% { opacity: .95; } 26% { opacity: .45; } 34% { opacity: 1; } 44% { opacity: .6; } 56%, 100% { opacity: 1; } }
.rc-bulb { position: absolute; width: 7px; height: 7px; margin: -3.5px; border-radius: 50%; background: radial-gradient(circle, #FFFBE6 0 30%, rgba(255,214,120,.8) 45%, rgba(255,214,120,0) 72%); animation: rc-twinkle 2.4s ease-in-out infinite; }
.rc-open-rays { position: absolute; left: 50%; top: -12%; width: 170%; height: auto; margin-left: -85%; mix-blend-mode: screen; opacity: 0; transform: scale(.9); transform-origin: 50% 0; }
.rc-open.is-opening .rc-open-rays, .rc-open.is-through .rc-open-rays { opacity: .6; transform: scale(1.08); transition: opacity .9s var(--rc-soft) .12s, transform 1.6s var(--rc-expo) .12s; }
.rc-open-floor { position: absolute; left: -10%; right: -10%; bottom: -6%; height: 26%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,240,200,.95), rgba(255,240,200,0)); }
.rc-open-gap { position: absolute; z-index: 7; left: 30%; right: 30%; bottom: 0; height: 2.6%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,236,180,.95), rgba(255,236,180,0)); mix-blend-mode: screen; pointer-events: none; animation: rc-breathe 3.2s ease-in-out infinite; }
@keyframes rc-breathe { 0%, 100% { opacity: .55; transform: scaleX(.9); } 50% { opacity: 1; transform: scaleX(1.05); } }
.rc-open.is-opening .rc-open-gap, .rc-open.is-through .rc-open-gap { opacity: 0; animation: none; transition: opacity .3s; }

.rc-leaves { position: absolute; inset: 0; z-index: 5; transform-style: preserve-3d; }
.rc-leaf { position: absolute; top: 5.39%; height: 94.522%; overflow: hidden; backface-visibility: visible; transition: transform 1.6s var(--rc-door); }
.rc-leaf img { display: block; width: 100%; height: 100%; }
.rc-leaf-l { left: 9.7%; width: 41.318%; transform-origin: 0% 50%; z-index: 5; }
.rc-leaf-r { left: 50.161%; width: 40.514%; transform-origin: 100% 50%; z-index: 6; transition-delay: .06s; }
.rc-open.is-opening .rc-leaf, .rc-open.is-through .rc-leaf { will-change: transform; }
.rc-open.is-opening:not(.is-reduced) .rc-leaf-l, .rc-open.is-through:not(.is-reduced) .rc-leaf-l { transform: rotateY(-105deg); }
.rc-open.is-opening:not(.is-reduced) .rc-leaf-r, .rc-open.is-through:not(.is-reduced) .rc-leaf-r { transform: rotateY(105deg); }
.rc-leaf-shade { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s var(--rc-door); pointer-events: none; }
.rc-leaf-l .rc-leaf-shade { background: linear-gradient(to left, rgba(60,40,20,0), rgba(60,40,20,.45)); }
.rc-leaf-r .rc-leaf-shade { background: linear-gradient(to right, rgba(60,40,20,0), rgba(60,40,20,.45)); }
.rc-open.is-opening .rc-leaf-shade, .rc-open.is-through .rc-leaf-shade { opacity: .6; }
.rc-leaf-glint { position: absolute; inset: -10% -60%; pointer-events: none; background: linear-gradient(105deg, transparent 38%, rgba(255,250,232,.55) 48%, rgba(255,236,190,.25) 54%, transparent 62%); transform: translateX(-70%); animation: rc-glint 5.5s var(--rc-soft) 1.4s infinite; }
.rc-leaf-r .rc-leaf-glint { animation-delay: 1.75s; }
@keyframes rc-glint { 0% { transform: translateX(-70%); } 28%, 100% { transform: translateX(70%); } }
.rc-open.is-opening .rc-leaf-glint, .rc-open.is-through .rc-leaf-glint { animation: none; opacity: 0; }
.rc-open-frame { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 4; pointer-events: none; filter: drop-shadow(0 20px 26px rgba(80,55,20,.28)); }
.rc-open-shadow { position: absolute; left: 4%; right: 4%; bottom: -3%; height: 6%; z-index: 1; border-radius: 50%; background: radial-gradient(closest-side, rgba(70,48,18,.32), rgba(70,48,18,0)); transition: transform 1.6s var(--rc-door); }
.rc-open.is-opening .rc-open-shadow { transform: scaleX(1.6); }
.rc-sparks { position: absolute; inset: 0; z-index: 9; pointer-events: none; }
.rc-spark { position: absolute; bottom: 18%; opacity: 0; }

.rc-open-cta { flex: none; display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 4px; }
.rc-open-btn { position: relative; display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 28px; border-radius: 999px; border: 0; cursor: pointer;
  font: 700 16px/1 var(--wk-font-sans); letter-spacing: .02em; color: #3A2608; background: linear-gradient(135deg, #8A6420 0%, #D9B45E 30%, #F6E2A6 50%, #C9993F 70%, #8A6420 100%); box-shadow: 0 16px 30px -14px rgba(110,70,10,.7), inset 0 1px 0 rgba(255,255,255,.5); -webkit-tap-highlight-color: transparent; }
.rc-open-btn::after { content: ""; position: absolute; inset: -6px; border-radius: inherit; border: 2px solid rgba(201,153,63,.6); opacity: 0; animation: rc-ring 2.4s var(--rc-soft) infinite; pointer-events: none; }
@keyframes rc-ring { 0% { opacity: .9; transform: scale(.94); } 70%, 100% { opacity: 0; transform: scale(1.18); } }
.rc-open-btn:disabled { cursor: progress; opacity: .8; }
.rc-open-btn:disabled::after { animation: none; }
.rc-open-btn:lang(hi) { font-family: var(--wk-font-deva); font-size: 17px; }
.rc-open-hint { margin: 0; font: 500 13px/1.4 var(--wk-font-sans); color: #6B5A42; text-align: center; }
.rc-open.is-opening .rc-open-cta, .rc-open.is-through .rc-open-cta, .rc-open.is-opening .rc-open-copy, .rc-open.is-through .rc-open-copy { opacity: 0; transform: translateY(10px); transition: opacity .5s, transform .6s var(--rc-ease); }
@media (max-height: 560px) { .rc-open-hint, .rc-open-of { display: none; } .rc-open-col { padding-top: 14px; } }

/* ══ The hero ═══════════════════════════════════════════════ */
/* Everything in the flow sizes to its own column (the editor's preview is narrower than the screen). */
.rc-flow { container: rcflow / inline-size; }
.rc-hero { position: relative; padding: calc(var(--rc-top, 0px) + clamp(88px, 15vw, 150px)) 16px clamp(48px, 7vw, 90px); overflow: hidden; }
.rc-hero-lights { position: absolute; z-index: 0; top: 0; left: -2%; right: -2%; display: flex; pointer-events: none; }
.rc-hero-lights img { width: 50%; height: clamp(110px, 26vw, 280px); object-fit: cover; object-position: 50% 0; }
.rc-hero-lights-b { transform: scaleX(-1); }
@container rcflow (min-width: 960px) { .rc-hero-lights img { height: clamp(150px, 16vw, 240px); -webkit-mask-image: linear-gradient(#000 60%, transparent); mask-image: linear-gradient(#000 60%, transparent); } }
.rc-hero-inner { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; display: grid; gap: clamp(30px, 5vw, 64px); align-items: center; }
@container rcflow (min-width: 960px) { .rc-hero-inner { grid-template-columns: 1.05fr .95fr; } }
.rc-hero-copy { position: relative; text-align: center; }
.rc-hero-copy::before { content: ""; position: absolute; inset: -8% -10%; z-index: -1; pointer-events: none; background: radial-gradient(closest-side, color-mix(in srgb, var(--rc-bg1) 92%, transparent) 55%, transparent); }
@container rcflow (min-width: 960px) { .rc-hero-copy { text-align: left; } }
.rc-hero-dear { margin: 0 0 6px; font: italic 500 clamp(18px, 4.4vw, 22px)/1.35 var(--wk-font-display); color: var(--rc-rose-d); }
.rc-hero-dear b { font-style: normal; font-weight: 700; }
.rc-names { margin: 0 0 4px; display: flex; flex-direction: column; align-items: center; font: 400 clamp(52px, min(15vw, calc(150vw / var(--rc-len, 6))), 116px)/1.32 var(--wk-font-script); color: var(--rc-names); }
@container rcflow (min-width: 960px) { .rc-names { align-items: flex-start; font-size: clamp(76px, min(8vw, calc(64vw / var(--rc-len, 6))), 124px); } }
.rc-name { display: block; max-width: 100%; text-wrap: balance; overflow-wrap: normal; }
.rc-amp { display: block; font: italic 400 .4em/1.3 var(--wk-font-display); color: var(--rc-gold); }
@container rcflow (min-width: 960px) { .rc-amp { padding-left: .9em; } }
.rc-hero-tag { margin: 8px auto 18px; max-width: 30ch; font: italic 500 clamp(19px, 4.6vw, 24px)/1.45 var(--wk-font-display); color: var(--rc-muted); text-wrap: balance; }
@container rcflow (min-width: 960px) { .rc-hero-tag { margin-left: 0; } }
.rc-hero-when { margin: 0 0 10px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
@container rcflow (min-width: 960px) { .rc-hero-when { justify-content: flex-start; } }
.rc-hero-venue { margin: 0 auto 22px; max-width: 34ch; font: 500 16px/1.5 var(--wk-font-sans); color: var(--rc-ink); text-wrap: balance; }
.rc-hero-venue svg { display: inline-block; vertical-align: -2px; margin-right: 6px; color: var(--rc-gold-d); }
@container rcflow (min-width: 960px) { .rc-hero-venue { margin-left: 0; } }
.rc-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
@container rcflow (min-width: 960px) { .rc-hero-actions { justify-content: flex-start; } }
.rc-hero-stage { position: relative; width: min(100%, 440px); margin: 0 auto; padding: 0 7%; }
@container rcflow (min-width: 960px) { .rc-hero-stage { width: min(100%, 500px); } }
.rc-hero-window { position: relative; aspect-ratio: 4 / 5; border-radius: 28px; overflow: hidden; background: #F6E7D2; border: 1.5px solid var(--rc-line);
  box-shadow: 0 34px 60px -32px rgba(96,64,20,.5), 0 0 0 8px rgba(255,253,248,.65), 0 0 0 9.5px var(--rc-line); isolation: isolate; }
.rc-hero-room { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 16%; }
.rc-root.t-pearl .rc-hero-room { filter: saturate(.55) hue-rotate(-12deg); }
.rc-hero-chand { position: absolute; left: 50%; top: 12%; width: 130%; aspect-ratio: 1; margin-left: -65%; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle, rgba(255,250,232,.95), rgba(255,226,160,.38) 30%, rgba(255,226,160,0) 58%); animation: rc-glow 4.5s ease-in-out infinite alternate; }
@keyframes rc-glow { from { opacity: .7; } to { opacity: 1; } }
.rc-hero-spot { position: absolute; left: 50%; bottom: 3%; width: 90%; height: 16%; margin-left: -45%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,246,222,.95), rgba(255,246,222,0)); }
.rc-hero-couple { position: absolute; left: 50%; bottom: 3%; height: 80%; width: auto; transform: translateX(-50%); filter: drop-shadow(0 16px 18px rgba(70,40,20,.22)); }
.rc-hero-photo { position: absolute; inset: 9% 9% 8%; border-radius: 20px; overflow: hidden; border: 4px solid rgba(255,253,248,.95); box-shadow: 0 20px 40px -20px rgba(70,40,20,.5); background: var(--rc-bg2); }
.rc-mote { position: absolute; border-radius: 50%; background: radial-gradient(circle, #FFF8DC 0 25%, rgba(255,214,120,.7) 45%, rgba(255,214,120,0) 70%); animation: rc-mote 6s ease-in-out infinite; opacity: 0; }
@keyframes rc-mote { 0% { opacity: 0; transform: translateY(14px) scale(.6); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-46px) scale(1.1); } }
.rc-hero-swirl { position: absolute; z-index: 2; top: -5%; width: 44%; height: auto; opacity: .92; pointer-events: none; }
.rc-hero-swirl-l { left: -4%; transform: rotate(-14deg); }
.rc-hero-swirl-r { right: -4%; transform: scaleX(-1) rotate(-14deg); }
.rc-hero-roses { position: absolute; z-index: 3; bottom: -7%; width: 46%; height: auto; pointer-events: none; filter: drop-shadow(0 10px 14px rgba(120,60,60,.18)); }
.rc-hero-roses-l { left: -6%; }
.rc-hero-roses-r { right: -6%; transform: scaleX(-1); }
.rc-hero-scroll { display: none; }
@container rcflow (min-width: 960px) { .rc-hero-scroll { display: grid; place-items: center; width: 44px; height: 44px; margin: 36px auto 0; border-radius: 50%; border: 1.5px solid var(--rc-line); position: relative; z-index: 1; }
  .rc-hero-scroll span { width: 10px; height: 10px; border-right: 2px solid var(--rc-gold-d); border-bottom: 2px solid var(--rc-gold-d); transform: rotate(45deg) translate(-2px,-2px); animation: rc-bob 2s ease-in-out infinite; } }
@keyframes rc-bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 4px; } }
/* Entrance once the doors have opened. */
.rc-hero-copy > *, .rc-hero-stage { opacity: 0; transform: translateY(24px); transition: opacity 1s var(--rc-soft), transform 1.1s var(--rc-ease); }
.rc-hero-stage { transform: translateY(24px) scale(.96); }
.rc-root.is-open .rc-hero-copy > *, .rc-root.is-open .rc-hero-stage { opacity: 1; transform: none; }
.rc-root.is-open .rc-hero-copy > :nth-child(2) { transition-delay: .09s; }
.rc-root.is-open .rc-hero-copy > :nth-child(3) { transition-delay: .18s; }
.rc-root.is-open .rc-hero-copy > :nth-child(4) { transition-delay: .27s; }
.rc-root.is-open .rc-hero-copy > :nth-child(5) { transition-delay: .36s; }
.rc-root.is-open .rc-hero-copy > :nth-child(6) { transition-delay: .45s; }
.rc-root.is-open .rc-hero-copy > :nth-child(7) { transition-delay: .54s; }
.rc-root.is-open .rc-hero-stage { transition-delay: .25s; }

/* Sized to the column, not the screen, where container units exist (older browsers keep the vw sizes above). */
.rc-flow .rc-names { font-size: clamp(52px, min(15cqi, calc(150cqi / var(--rc-len, 6))), 116px); }
@container rcflow (min-width: 960px) { .rc-flow .rc-names { font-size: clamp(76px, min(8cqi, calc(64cqi / var(--rc-len, 6))), 124px); } }
.rc-flow .rc-h2 { font-size: clamp(34px, 7cqi, 58px); }
.rc-flow .rc-hero-lights img { height: clamp(110px, 26cqi, 280px); }

/* ══ Sections ═══════════════════════════════════════════════ */
.rc-sec-couple, .rc-sec-evening, .rc-sec-rsvp { background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--rc-paper) 72%, transparent) 14%, color-mix(in srgb, var(--rc-paper) 72%, transparent) 86%, transparent); }

/* The invitation card */
.rc-invite { position: relative; max-width: 780px; margin: 0 auto; text-align: center; background: var(--rc-paper); border-radius: 28px; border: 1px solid var(--rc-line); box-shadow: var(--rc-shadow);
  padding: clamp(40px, 8vw, 66px) clamp(22px, 6vw, 64px) clamp(70px, 11vw, 96px); }
.rc-invite::before { content: ""; position: absolute; inset: 10px; border-radius: 20px; border: 1px solid var(--rc-line); pointer-events: none; }
.rc-invite > * { position: relative; z-index: 1; }
.rc-invite-swirl { position: absolute !important; z-index: 0 !important; top: -22px; width: clamp(96px, 24vw, 190px); height: auto; opacity: .75; pointer-events: none; }
.rc-invite-swirl-l { left: -26px; transform: rotate(-10deg); }
.rc-invite-swirl-r { right: -26px; transform: scaleX(-1) rotate(-10deg); }
.rc-invite .rc-eyebrow { max-width: 22ch; margin-left: auto; margin-right: auto; }
.rc-invite-cols { display: grid; gap: 24px; margin-top: 12px; }
@container rcflow (min-width: 860px) { .rc-invite-cols.has-hi { grid-template-columns: 1.15fr 1px .85fr; align-items: center; } .rc-invite-cols.has-hi::after { content: none; } }
.rc-invite-en p { margin: 0 0 16px; font: 400 clamp(18px, 4.3vw, 21px)/1.65 var(--wk-font-display); color: var(--rc-ink); }
.rc-invite-en .rc-invite-lead { font: 500 clamp(21px, 5vw, 26px)/1.5 var(--wk-font-display); color: var(--rc-names); }
.rc-invite-hi { padding-top: 18px; border-top: 1px solid var(--rc-line); }
.rc-invite-hi p { margin: 0 0 12px; font: 400 clamp(18px, 4.3vw, 20px)/1.95 var(--wk-font-deva); color: var(--rc-ink); }
@container rcflow (min-width: 860px) { .rc-invite-cols.has-hi .rc-invite-hi { grid-column: 3; padding: 0 0 0 4px; border-top: 0; } .rc-invite-cols.has-hi::before { content: ""; grid-column: 2; grid-row: 1; align-self: stretch; background: var(--rc-line); } .rc-invite-cols.has-hi .rc-invite-en { grid-column: 1; grid-row: 1; } .rc-invite-cols.has-hi .rc-invite-hi { grid-row: 1; } }
.rc-invite-cols.hi-first .rc-invite-hi { order: -1; border-top: 0; border-bottom: 1px solid var(--rc-line); padding: 0 0 14px; }
@container rcflow (min-width: 860px) { .rc-invite-cols.hi-first .rc-invite-hi { border-bottom: 0; padding: 0; } }
.rc-invite-bless { margin: 10px auto 0; max-width: 36ch; display: flex; flex-direction: column; gap: 4px; font: 500 15.5px/1.5 var(--wk-font-sans); color: var(--rc-muted); }
.rc-invite-bless span { font: 600 11.5px/1.5 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--rc-gold-d); }
.rc-invite-bless span:lang(hi) { font-family: var(--wk-font-deva); font-size: 14px; letter-spacing: 0; text-transform: none; }
.rc-invite-bless b { font: 500 18px/1.4 var(--wk-font-display); color: var(--rc-ink); }
.rc-invite-sign { margin: 18px 0 0; font: 400 clamp(30px, 7.4vw, 40px)/1.2 var(--wk-font-script); color: var(--rc-names); }
.rc-invite-roses { position: absolute !important; z-index: 0 !important; right: -22px; bottom: -34px; width: clamp(110px, 28vw, 200px); height: auto; pointer-events: none; }

/* The couple */
.rc-couple { display: grid; gap: 20px; max-width: 1040px; margin: 0 auto; }
@container rcflow (min-width: 760px) { .rc-couple { grid-template-columns: 1fr auto 1fr; align-items: start; gap: 18px; } }
.rc-person { background: var(--rc-paper); border-radius: 26px; border: 1px solid var(--rc-line); box-shadow: var(--rc-shadow); overflow: hidden; text-align: center; }
.rc-person-frame { position: relative; margin: 12px 12px 0; aspect-ratio: 4 / 5; border-radius: 20px; overflow: hidden; background: linear-gradient(160deg, var(--rc-bg2), var(--rc-blush)); }
@container rcflow (max-width: 759px) { .rc-person-frame { aspect-ratio: 1 / 1; } }
.rc-person-ini { position: absolute; inset: 0; display: grid; place-items: center; font: 400 96px/1 var(--wk-font-script); color: var(--rc-gold-d); }
.rc-person-body { padding: 18px 20px 24px; }
.rc-person-role { margin: 0; font: 600 12px/1.5 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--rc-gold-d); }
.rc-person-role:lang(hi) { font-family: var(--wk-font-deva); letter-spacing: 0; font-size: 15px; }
.rc-person-name { margin: 4px 0 6px; font: 500 clamp(28px, 6vw, 34px)/1.15 var(--wk-font-display); color: var(--rc-names); text-wrap: balance; }
.rc-person-fam { margin: 0 0 10px; font: italic 500 16px/1.45 var(--wk-font-display); color: var(--rc-muted); }
.rc-person-desc { margin: 0 auto 12px; max-width: 36ch; font: 400 16px/1.6 var(--wk-font-sans); color: var(--rc-ink); }
.rc-tags { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.rc-tags li { display: inline-flex; align-items: center; gap: 5px; min-height: 32px; padding: 0 12px; border-radius: 999px; background: color-mix(in srgb, var(--rc-blush) 55%, transparent); font: 600 13.5px/1 var(--wk-font-sans); color: var(--rc-ink); }
.rc-monogram { display: grid; place-items: center; justify-self: center; align-self: center; }
.rc-monogram span { display: grid; place-items: center; width: 88px; height: 88px; border-radius: 50%; font: 400 34px/1 var(--wk-font-script); color: var(--rc-gold-d); background: var(--rc-paper); border: 1.5px solid var(--rc-gold); box-shadow: 0 0 0 6px var(--rc-paper), 0 0 0 7px var(--rc-line), var(--rc-shadow); }

/* Date + countdown */
.rc-date { display: grid; gap: 26px; justify-items: center; max-width: 900px; margin: 0 auto; }
@container rcflow (min-width: 760px) { .rc-date { grid-template-columns: auto 1fr; align-items: center; gap: 40px; } }
.rc-date-card { width: 210px; padding: 22px 16px 20px; border-radius: 26px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: linear-gradient(165deg, var(--rc-paper), color-mix(in srgb, var(--rc-bg2) 80%, var(--rc-paper))); border: 1.5px solid var(--rc-line); box-shadow: var(--rc-shadow), inset 0 0 0 6px rgba(255,253,248,.6); }
.rc-date-wk { font: 600 12.5px/1.6 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--rc-gold-d); }
.rc-date-wk:lang(hi) { font-family: var(--wk-font-deva); letter-spacing: 0; font-size: 15px; }
.rc-date-d { font: 600 68px/1.3 var(--wk-font-caps); color: var(--rc-names); margin: 0; }
.rc-date-m { font: italic 500 26px/1.35 var(--wk-font-display); color: var(--rc-ink); }
.rc-date-m:lang(hi) { font-style: normal; font-family: var(--wk-font-deva); }
.rc-date-y { font: 600 15px/1.4 var(--wk-font-sans); letter-spacing: .3em; color: var(--rc-muted); }
.rc-date-t { margin-top: 10px; min-height: 34px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: 999px; background: var(--rc-foil); color: #3A2608; font: 700 14px/1 var(--wk-font-sans); }
.rc-date-count { width: 100%; display: flex; justify-content: center; }

/* Our story */
.rc-story { list-style: none; margin: 0 auto; padding: 0; max-width: 1000px; display: grid; gap: clamp(22px, 4vw, 40px); }
.rc-chapter { position: relative; display: grid; background: var(--rc-paper); border-radius: 26px; border: 1px solid var(--rc-line); box-shadow: var(--rc-shadow); overflow: hidden; }
.rc-chapter-ph { margin: 12px 12px 0; aspect-ratio: 16 / 10; border-radius: 20px; overflow: hidden; background: var(--rc-bg2); }
.rc-chapter-ph img { width: 100%; height: 100%; object-fit: cover; display: block; }
.rc-chapter-t { position: relative; padding: 18px 22px 24px; }
.rc-chapter-top { display: flex; align-items: center; gap: 10px; margin: 0 0 6px; }
.rc-chapter-n { flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: var(--rc-foil); color: #3A2608; font: 600 14px/1 var(--wk-font-caps); }
.rc-chapter-when { margin: 0; font: 600 12.5px/1.5 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--rc-gold-d); }
.rc-chapter-title { margin: 0 0 8px; font: 500 clamp(26px, 5.6vw, 32px)/1.2 var(--wk-font-display); color: var(--rc-names); text-wrap: balance; }
.rc-chapter-line { margin: 0; font: 400 16.5px/1.65 var(--wk-font-sans); color: var(--rc-ink); }
@container rcflow (min-width: 760px) {
  .rc-chapter.has-photo { grid-template-columns: 1fr 1fr; align-items: center; }
  .rc-chapter.has-photo .rc-chapter-ph { margin: 14px; aspect-ratio: 4 / 3; }
  .rc-chapter.has-photo.is-alt .rc-chapter-ph { order: 2; }
  .rc-chapter-t { padding: 28px 34px; }
}

/* The evening */
.rc-events { list-style: none; margin: 0 auto; padding: 0; max-width: 1140px; display: grid; gap: 18px; }
@container rcflow (min-width: 760px) { .rc-events { grid-template-columns: repeat(2, 1fr); } .rc-events.n-1 { grid-template-columns: minmax(0, 560px); justify-content: center; } }
@container rcflow (min-width: 1080px) { .rc-events.n-3 { grid-template-columns: repeat(3, 1fr); } }
.rc-event { display: flex; flex-direction: column; background: var(--rc-paper); border-radius: 26px; border: 1px solid var(--rc-line); box-shadow: var(--rc-shadow); overflow: hidden; }
.rc-event-time { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; padding: 18px 22px 14px; background: linear-gradient(135deg, color-mix(in srgb, var(--rc-bg2) 85%, var(--rc-paper)), var(--rc-paper)); border-bottom: 1px solid var(--rc-line); }
.rc-event-clock { font: 600 27px/1.1 var(--wk-font-caps); color: var(--rc-gold-d); }
.rc-event-end { font: 600 15px/1 var(--wk-font-sans); color: var(--rc-muted); }
.rc-event-body { display: flex; flex-direction: column; gap: 8px; padding: 16px 22px 22px; flex: 1; }
.rc-event-title { margin: 0 0 2px; font: 500 clamp(26px, 5.4vw, 30px)/1.2 var(--wk-font-display); color: var(--rc-names); text-wrap: balance; }
.rc-event-meta { margin: 0; display: grid; grid-template-columns: 18px 1fr; gap: 9px; align-items: start; font: 400 15.5px/1.5 var(--wk-font-sans); color: var(--rc-ink); }
.rc-event-meta svg { margin-top: 3px; color: var(--rc-gold-d); }
.rc-event-meta b { font-weight: 600; }
.rc-event-dress { margin: 2px 0 0; display: flex; align-items: center; gap: 10px; font: 500 15.5px/1.4 var(--wk-font-sans); color: var(--rc-ink); }
.rc-event-dress small { display: block; font: 600 11.5px/1.4 var(--wk-font-caps); letter-spacing: .18em; text-transform: uppercase; color: var(--rc-gold-d); }
.rc-swatch { flex: none; width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--rc-paper); box-shadow: 0 0 0 1.5px var(--rc-line); }
.rc-event-note { margin: 2px 0 0; font: italic 500 16.5px/1.5 var(--wk-font-display); color: var(--rc-muted); }
.rc-event-a { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 10px; }

/* The venue */
.rc-venue { max-width: 1060px; margin: 0 auto; display: grid; background: var(--rc-paper); border-radius: 28px; border: 1px solid var(--rc-line); box-shadow: var(--rc-shadow); overflow: hidden; }
@container rcflow (min-width: 860px) { .rc-venue { grid-template-columns: 1.1fr 1fr; align-items: stretch; } }
.rc-venue-map { position: relative; aspect-ratio: 16 / 11; background: var(--rc-bg2); margin: 12px 12px 0; border-radius: 20px; overflow: hidden; }
@container rcflow (min-width: 860px) { .rc-venue-map { aspect-ratio: auto; min-height: 340px; margin: 12px; } }
.rc-venue-map iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.rc-venue-poster { position: absolute; inset: 0; width: 100%; padding: 0; border: 0; cursor: pointer; display: grid; place-items: center; background: none; }
.rc-venue-poster img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; filter: saturate(.85); }
.rc-venue-poster::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,250,240,.2), rgba(70,50,20,.25)); }
.rc-venue-pin { position: relative; z-index: 1; display: grid; place-items: center; width: 60px; height: 60px; border-radius: 50%; background: var(--rc-paper); color: var(--rc-gold-d); box-shadow: 0 14px 30px -12px rgba(60,40,10,.6); animation: rc-bob 2.4s ease-in-out infinite; }
.rc-venue-cta { position: absolute; z-index: 1; bottom: 16px; left: 50%; transform: translateX(-50%); min-height: 40px; display: inline-flex; align-items: center; padding: 0 16px; border-radius: 999px; background: rgba(255,253,248,.95); font: 600 14px var(--wk-font-sans); color: var(--rc-ink); white-space: nowrap; }
.rc-venue-t { padding: 22px 24px 26px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
@container rcflow (min-width: 860px) { .rc-venue-t { padding: 36px 34px; justify-content: center; } }
.rc-venue-name { margin: 0; font: 500 clamp(26px, 5.4vw, 34px)/1.2 var(--wk-font-display); color: var(--rc-names); text-wrap: balance; }
.rc-venue-addr { margin: 0; font: 400 16px/1.55 var(--wk-font-sans); color: var(--rc-ink); }
.rc-venue-note { margin: 4px 0 6px; padding: 14px 16px; border-radius: 16px; background: color-mix(in srgb, var(--rc-bg2) 50%, transparent); }
.rc-venue-note p { margin: 0; font: 400 15.5px/1.55 var(--wk-font-sans); color: var(--rc-ink); }
.rc-venue-note .rc-venue-note-h { margin-bottom: 4px; font: 600 11.5px/1.4 var(--wk-font-caps); letter-spacing: .18em; text-transform: uppercase; color: var(--rc-gold-d); }

/* Film, live */
.rc-film { position: relative; max-width: 860px; margin: 0 auto; aspect-ratio: 16 / 9; border-radius: 24px; overflow: hidden; background: #2A1E12; box-shadow: var(--rc-shadow); }
.rc-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.rc-film-poster { position: absolute; inset: 0; width: 100%; border: 0; padding: 0; cursor: pointer; display: grid; place-items: center; background: none; }
.rc-film-poster img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.rc-film-play { position: relative; display: grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; background: var(--rc-foil); color: #3A2608; box-shadow: 0 16px 30px -10px rgba(0,0,0,.5); }
.rc-film-label { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); padding: 8px 14px; border-radius: 999px; background: rgba(255,253,248,.92); font: 600 14px var(--wk-font-sans); color: var(--rc-ink); white-space: nowrap; }
.rc-live { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.rc-live-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--rc-muted); }
.rc-live-dot.is-on { background: #E5484D; animation: rc-twinkle 1.6s ease-in-out infinite; }
.rc-live-soon { margin: 0; font: 400 16px/1.5 var(--wk-font-sans); color: var(--rc-muted); }

/* Gallery: the kit masonry, framed */
.rc-sec-gallery .wk-masonry, .rc-sec-gallery > div > div:last-child { max-width: 1120px; margin-left: auto; margin-right: auto; }

/* Good to know + contacts */
.rc-know { list-style: none; margin: 0 auto; padding: 0; max-width: 860px; display: grid; gap: 12px; }
@container rcflow (min-width: 700px) { .rc-know { grid-template-columns: repeat(2, 1fr); } }
.rc-know-i { padding: 16px 18px; border-radius: 20px; background: var(--rc-paper); border: 1px solid var(--rc-line); }
.rc-know-h { margin: 0 0 4px; font: 600 12px/1.4 var(--wk-font-caps); letter-spacing: .18em; text-transform: uppercase; color: var(--rc-gold-d); }
.rc-know-t { margin: 0; font: 400 16px/1.55 var(--wk-font-sans); color: var(--rc-ink); }
.rc-contacts-wrap { max-width: 860px; margin: 40px auto 0; text-align: center; }
.rc-contacts { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; text-align: left; }
@container rcflow (min-width: 700px) { .rc-contacts { grid-template-columns: repeat(2, 1fr); } }
.rc-contact { display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 14px; border-radius: 20px; background: var(--rc-paper); border: 1px solid var(--rc-line); }
.rc-contact-ini { flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: var(--rc-foil); color: #3A2608; font: 600 20px var(--wk-font-display); }
.rc-contact-t { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.rc-contact-t b { font: 600 16px/1.3 var(--wk-font-sans); color: var(--rc-ink); overflow-wrap: anywhere; }
.rc-contact-t small { font: 400 14px/1.4 var(--wk-font-sans); color: var(--rc-muted); }
.rc-contact-a { flex: none; display: flex; gap: 8px; }

/* RSVP */
.rc-rsvp { background: var(--rc-paper); border-radius: 28px; border: 1px solid var(--rc-line); box-shadow: var(--rc-shadow); padding: clamp(18px, 5vw, 34px); }
.rc-rsvp .wk-btn { min-height: 48px; }
.rc-rsvp input, .rc-rsvp textarea, .rc-rsvp select { font-size: 16px !important; }

/* Blessings */
.rc-bless { display: grid; gap: 22px; max-width: 1060px; margin: 0 auto; }
@container rcflow (min-width: 900px) { .rc-bless { grid-template-columns: 380px 1fr; align-items: start; } }
.rc-bless-form { display: flex; flex-direction: column; gap: 14px; padding: 22px; border-radius: 26px; background: var(--rc-paper); border: 1px solid var(--rc-line); box-shadow: var(--rc-shadow); }
@container rcflow (min-width: 900px) { .rc-bless-form { position: sticky; top: 80px; } }
.rc-bless-intro { margin: 0; font: italic 500 17px/1.5 var(--wk-font-display); color: var(--rc-muted); }
.rc-field { position: relative; display: flex; flex-direction: column; gap: 6px; }
.rc-field > span { font: 600 14px/1.3 var(--wk-font-sans); color: var(--rc-ink); }
.rc-field input, .rc-field textarea { width: 100%; min-height: 48px; padding: 12px 14px; border-radius: 14px; border: 1.5px solid var(--rc-line); background: #FFFEFB; font: 400 16px/1.45 var(--wk-font-sans); color: var(--rc-ink); outline: none; resize: vertical; box-sizing: border-box; }
.rc-field input:focus, .rc-field textarea:focus { border-color: var(--rc-gold); box-shadow: 0 0 0 4px color-mix(in srgb, var(--rc-gold-l) 40%, transparent); }
.rc-count-chars { align-self: flex-end; font: 500 12.5px var(--wk-font-sans); color: var(--rc-muted); }
.rc-bless-status { margin: 0; min-height: 1.4em; font: 500 14.5px/1.4 var(--wk-font-sans); color: var(--rc-gold-d); }
.rc-bless-wall { list-style: none; margin: 0; padding: 0; columns: 1; column-gap: 14px; }
@container rcflow (min-width: 600px) { .rc-bless-wall { columns: 2; } }
.rc-bless-card { break-inside: avoid; margin: 0 0 14px; padding: 18px 20px; border-radius: 22px; background: var(--rc-paper); border: 1px solid var(--rc-line); box-shadow: 0 14px 30px -24px rgba(96,64,20,.4); }
.rc-bless-card:nth-child(3n+2) { background: color-mix(in srgb, var(--rc-blush) 38%, var(--rc-paper)); }
.rc-bless-msg { margin: 0 0 8px; font: italic 500 19px/1.5 var(--wk-font-display); color: var(--rc-ink); overflow-wrap: anywhere; }
.rc-bless-from { margin: 0; font: 600 13px/1.4 var(--wk-font-sans); letter-spacing: .04em; color: var(--rc-gold-d); }

/* Shagun + share */
.rc-shagun { text-align: center; padding: 24px; border-radius: 26px; background: var(--rc-paper); border: 1px solid var(--rc-line); box-shadow: var(--rc-shadow); }
.rc-shagun-p { margin: 0 0 14px; font: italic 500 18px/1.5 var(--wk-font-display); color: var(--rc-muted); }
.rc-shagun-id { margin: 0 0 16px; display: flex; flex-direction: column; gap: 4px; font: 600 16px var(--wk-font-sans); }
.rc-shagun-id code { font: 600 15px var(--wk-font-sans); color: var(--rc-gold-d); overflow-wrap: anywhere; }
.rc-shagun-a { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.rc-upi-pay { display: none; }
@media (hover: none) and (pointer: coarse) { .rc-upi-pay { display: inline-flex; } }
.rc-sharebar { text-align: center; }
.rc-sharebar-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.rc-qr { margin: 18px auto 0; display: inline-flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px; border-radius: 22px; background: var(--rc-paper); border: 1px solid var(--rc-line); }
.rc-qr img { width: 180px; height: 180px; border-radius: 10px; }
.rc-qr p { margin: 0; font: 500 13.5px var(--wk-font-sans); color: var(--rc-muted); }

/* Finale */
.rc-finale { position: relative; overflow: hidden; text-align: center; padding: clamp(120px, 18vw, 190px) 16px calc(120px + env(safe-area-inset-bottom)); background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--rc-bg2) 85%, transparent)); }
.rc-finale-lights { position: absolute; top: 0; left: -2%; right: -2%; pointer-events: none; }
.rc-finale-lights img { width: 100%; height: clamp(110px, 20vw, 220px); object-fit: cover; object-position: 50% 0; }
.rc-finale-couple img { display: block; width: clamp(150px, 36vw, 240px); height: auto; margin: 0 auto; filter: drop-shadow(0 18px 20px rgba(70,40,20,.2)); }
.rc-finale-t { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.rc-finale-close { margin: 16px 0 0; font: 400 clamp(38px, 9vw, 58px)/1.15 var(--wk-font-script); color: var(--rc-names); text-wrap: balance; }
.rc-finale-close:lang(hi) { font-family: var(--wk-font-deva); font-size: clamp(26px, 6vw, 38px); line-height: 1.4; }
.rc-finale-names { margin: 0; font: 500 clamp(24px, 5vw, 30px)/1.3 var(--wk-font-display); color: var(--rc-ink); }
.rc-finale-names i { color: var(--rc-gold); }
.rc-finale-line { margin: 0; font: italic 500 18px/1.5 var(--wk-font-display); color: var(--rc-muted); }
.rc-finale-tag { margin: 6px 0 4px; font: 600 15px var(--wk-font-sans); letter-spacing: .06em; color: var(--rc-gold-d); }
.rc-create { margin-top: 14px; }

/* Low-end phones and reduced motion */
@media (prefers-reduced-motion: reduce) {
  .rc-twinkle, .rc-bulb, .rc-mote, .rc-hero-chand, .rc-open-gap, .rc-leaf-glint, .rc-open-btn::after, .rc-venue-pin, .rc-hero-scroll span { animation: none !important; }
  .rc-hero-copy > *, .rc-hero-stage { transition-duration: .3s !important; transform: none !important; }
}
`;
