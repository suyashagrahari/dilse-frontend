// "La Boîte": one stylesheet for every scene. Palette (research §D.3): cacao #2A1712, ganache #4A2A1F, praline
// #9C6B4E, cream #F3E6D3, raspberry #B0324B, foil #C9A45C. The lid/ribbon/foil colours are CSS variables set on the
// root from the chosen colourway. Type: Fraunces (display, letter, tasting notes) + Manrope (UI).
// Easing: cubic-bezier(.22,1,.36,1) in, faster out. Transforms + opacity only for anything that loops. --sx/--sy
// (−1…1, the phone's tilt or the pointer) drive the foil, the gloss and the sheen.

import { HEART_MASK } from "./HeartScene";

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
/** Fine card grain for the matte lid and sleeve. */
const GRAIN = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 .9  0 0 0 0 .8  0 0 0 .16 0'/></filter><rect width='180' height='180' filter='url(#g)'/></svg>`,
);
/** Crumpled tissue: turbulence lit from the top-left. */
const CRUMPLE = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='.035' numOctaves='4' seed='11'/><feDiffuseLighting lighting-color='#fff' surfaceScale='2.2'><feDistantLight azimuth='225' elevation='58'/></feDiffuseLighting></filter><rect width='260' height='260' filter='url(#c)' opacity='.5'/></svg>`,
);
const FIBRE = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.9 .06' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .18  0 0 0 .08 0'/></filter><rect width='220' height='220' filter='url(#f)'/></svg>`,
);
const MOTTLE = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='.012' numOctaves='3' seed='3'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .3  0 0 0 .09 0'/></filter><rect width='300' height='300' filter='url(#m)'/></svg>`,
);
const PAPER = `${FIBRE}, ${MOTTLE}, linear-gradient(180deg, #F7EEDF, #EFE2CC)`;
const FOIL = "linear-gradient(115deg, var(--foil-d) 0%, var(--foil) 26%, var(--foil-l) 44%, #FFFBEA 50%, var(--foil-l) 56%, var(--foil) 72%, var(--foil-d) 100%)";
const SERIF = "var(--lb-serif), Georgia, serif";
const SANS = "var(--lb-sans), system-ui, sans-serif";
const EASE = "cubic-bezier(.22,1,.36,1)";

export const BOITE_CSS = `
.lb-root { position: relative; min-height: 100svh; color: #F3E6D3; font-family: ${SANS}; background: #0E0705; --sx: 0; --sy: 0; }
.lb-root figcaption { font-family: ${SERIF} !important; }
.lb-stage { position: relative; z-index: 2; height: 100svh; }
.lb-scene { position: absolute; inset: 0; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
  display: flex; flex-direction: column; align-items: center;
  padding: calc(var(--vw-top-space, 0px) + 66px) 24px calc(22px + env(safe-area-inset-bottom, 0px)); }
.lb-scene::-webkit-scrollbar { display: none; }

/* type */
.lb-head { flex-shrink: 0; position: relative; z-index: 3; display: grid; justify-items: center; gap: 14px; text-align: center; width: 100%; max-width: 640px; min-height: 128px; align-content: start; }
.lb-headTight { min-height: 0 !important; gap: 8px; margin-bottom: 18px; }
.lb-headIn { display: grid; justify-items: center; gap: 14px; }
.lb-eyebrow { margin: 0; font: 600 10.5px/1.2 ${SANS}; letter-spacing: .36em; text-transform: uppercase; color: #E3C27E; }
.lb-display { margin: 0; font: italic 300 clamp(33px, 9.2vw, 64px)/1.04 ${SERIF}; font-variation-settings: "opsz" 144, "SOFT" 100; letter-spacing: -.018em;
  color: #FBF2E4; text-wrap: balance; max-width: 12em; text-shadow: 0 2px 30px rgba(0,0,0,.45); }
.lb-hint { margin: 0; font: 600 10.5px/1.2 ${SANS}; letter-spacing: .32em; text-transform: uppercase; color: rgba(243,230,211,.72); }
.lb-fadeIn { animation: lb-fade 1.2s ${EASE} backwards; }
.lb-rise { animation: lb-rise 1.2s ${EASE} backwards; }
.lb-rise2 { animation-delay: 1.4s; }
@keyframes lb-fade { from { opacity: 0; } }
@keyframes lb-rise { from { opacity: 0; transform: translateY(14px); } }
.lb-foot { position: relative; z-index: 3; min-height: 150px; width: 100%; display: grid; place-items: center; align-content: end; gap: 12px; text-align: center; }
.lb-footFlow { min-height: 0; padding: 36px 0 18px; align-content: center; }
.lb-ctaRow { display: flex; align-items: center; justify-content: center; gap: 10px; }
.lb-count { margin: 0 0 4px; font: italic 300 22px/1 ${SERIF}; color: #FBF2E4; font-variant-numeric: tabular-nums; }
.lb-count span { opacity: .5; }
.lb-tasteFoot { display: grid; justify-items: center; gap: 10px; }
.lb-textBtn { all: unset; cursor: pointer; padding: 12px 16px; font: 600 10.5px/1 ${SANS}; letter-spacing: .3em; text-transform: uppercase; color: rgba(243,230,211,.6);
  opacity: 0; pointer-events: none; transition: opacity .8s ease; }
.lb-textBtn.is-on, .lb-textBtn:focus-visible { opacity: 1; pointer-events: auto; }
.lb-textBtn:focus-visible { outline: 2px solid #E3C27E; border-radius: 99px; }

/* ── the lid ───────────────────────────────────────────────────────────── */
.lb-lidFace { position: relative; width: 100%; height: 100%; border-radius: 5px; overflow: hidden; container-type: inline-size;
  background: radial-gradient(120% 90% at 28% 12%, var(--lid-hi), var(--lid) 56%, var(--lid-deep));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.1), inset 0 -2px 0 rgba(0,0,0,.35), inset 0 0 0 1px rgba(0,0,0,.25); }
.lb-lidGrain { position: absolute; inset: 0; background: ${GRAIN}; opacity: .55; pointer-events: none; }
.lb-lidLine, .lb-lidLine::after { position: absolute; inset: 6.5cqw; padding: 1px; border-radius: 2px; background: ${FOIL}; background-size: 220% 100%;
  background-position: calc(50% - var(--sx) * 40%) 50%; -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); opacity: .85; pointer-events: none; }
.lb-lidLine::after { content: ""; inset: 1.6cqw; padding: .6px; opacity: .7; }
.lb-lidMid { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; text-align: center; }
.lb-mono { margin: 0; display: flex; align-items: baseline; justify-content: center; gap: 1.6cqw; padding: 0 2cqw;
  font: italic 300 25cqw/1 ${SERIF}; font-variation-settings: "opsz" 144, "SOFT" 100; letter-spacing: -.02em;
  background: ${FOIL}; background-size: 260% 100%; background-position: calc(50% - var(--sx) * 45%) 50%; -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 1px 0 rgba(0,0,0,.5)) drop-shadow(0 -1px 0 rgba(255,255,255,.1)); }
.lb-mono em { font-size: .48em; font-weight: 300; }
.lb-house { margin: 5cqw 0 0; font: 600 3cqw/1 ${SANS}; letter-spacing: .44em; text-indent: .44em; text-transform: uppercase; color: var(--lid-ink); white-space: nowrap; max-width: 76cqw; overflow: hidden; text-overflow: ellipsis; }
.lb-est { margin: 2.6cqw 0 0; font: italic 400 4cqw/1 ${SERIF}; color: var(--lid-ink); }
.lb-ribbon { position: absolute; pointer-events: none; transition: transform 1.1s cubic-bezier(.65,0,.35,1), opacity .5s ease .7s; }
.lb-ribbonV { top: -2%; bottom: -2%; left: 74%; width: 8.5cqw;
  background: linear-gradient(90deg, var(--rib-deep), var(--rib) 22%, var(--rib-hi) 46%, var(--rib) 66%, var(--rib-deep));
  box-shadow: 0 0 8px rgba(0,0,0,.5), -2px 0 3px rgba(0,0,0,.25); }
.lb-ribbonH { left: -2%; right: -2%; top: 71%; height: 8.5cqw;
  background: linear-gradient(180deg, var(--rib-deep), var(--rib) 22%, var(--rib-hi) 46%, var(--rib) 66%, var(--rib-deep));
  box-shadow: 0 0 8px rgba(0,0,0,.5), 0 2px 3px rgba(0,0,0,.25); }
.lb-ribbonV::after, .lb-ribbonH::after { content: ""; position: absolute; inset: 0; opacity: .5;
  background: repeating-linear-gradient(var(--a, 180deg), transparent 0 18px, rgba(255,255,255,.12) 26px, transparent 34px); }
.lb-ribbonH::after { --a: 90deg; }
.lb-knot { position: absolute; left: calc(74% + 4.25cqw); top: calc(71% + 4.25cqw); width: 0; height: 0; transition: transform 1.1s cubic-bezier(.65,0,.35,1), opacity .5s ease .6s; }
.lb-knot::before, .lb-knot::after { content: ""; position: absolute; top: -6cqw; width: 15cqw; height: 12cqw; border-radius: 50% 50% 46% 46%;
  background: radial-gradient(60% 50% at 50% 50%, var(--rib-deep) 0 28%, transparent 30%), radial-gradient(120% 100% at 35% 25%, var(--rib-hi), var(--rib) 50%, var(--rib-deep));
  box-shadow: 0 3px 6px rgba(0,0,0,.55), inset 0 -2px 3px rgba(0,0,0,.3); }
.lb-knot::before { right: 1cqw; transform: rotate(-16deg); }
.lb-knot::after { left: 1cqw; transform: rotate(16deg); }
.lb-lidFace.is-pulled .lb-ribbonV { transform: translateY(115%); }
.lb-lidFace.is-pulled .lb-ribbonH { transform: translateX(115%); transition-delay: .12s; }
.lb-lidFace.is-pulled .lb-knot { transform: translate(40cqw, 30cqw) rotate(40deg); opacity: 0; }
.lb-root.is-lightLid .lb-mono { filter: drop-shadow(0 1px 0 rgba(255,255,255,.6)) drop-shadow(0 -1px 0 rgba(60,30,10,.25)); }

/* ── the box ───────────────────────────────────────────────────────────── */
.lb-boxScene { justify-content: space-between; overflow: hidden; }
.lb-stageBox { position: relative; flex: 1 1 auto; width: 100%; min-height: 0; display: grid; place-items: center; padding: 8px 0; }
.lb-boxWrap { position: relative; container-type: inline-size; perspective: 1500px; perspective-origin: 50% 20%;
  width: min(92vw, 430px, calc(48svh * var(--cols) / var(--rows))); aspect-ratio: var(--cols) / var(--rows); }
.lb-boxScene.is-open .lb-boxWrap { animation: lb-push 2.6s ${EASE} backwards; }
@keyframes lb-push { from { transform: scale(.9); } }
.lb-burst { position: absolute; left: 50%; top: 50%; width: 150vmax; height: 150vmax; margin: -75vmax 0 0 -75vmax; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,226,170,.55), rgba(255,180,100,.18) 35%, transparent 70%); opacity: 0; animation: lb-burst 2.4s ease-out; }
@keyframes lb-burst { 0% { opacity: 0; transform: scale(.3); } 12% { opacity: 1; } 100% { opacity: 0; transform: scale(1); } }
.lb-box3d { position: absolute; inset: 0; transform-style: preserve-3d; touch-action: none; -webkit-touch-callout: none; user-select: none; cursor: grab;
  transform: rotateX(calc(10deg + var(--sy) * -4deg)) rotateY(calc(var(--sx) * 5deg)); }
.lb-box3d.is-open { cursor: default; touch-action: auto; }
.lb-base { position: absolute; inset: 0; border-radius: 6px; padding: 4.2cqw;
  background: linear-gradient(160deg, var(--lid-hi), var(--lid) 42%, var(--lid-deep));
  box-shadow: 0 50px 70px -30px rgba(0,0,0,.92), 0 16px 26px -12px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.1), inset 0 0 0 1px rgba(0,0,0,.3); }
.lb-tray { position: relative; height: 100%; box-sizing: border-box; display: grid; align-content: center; gap: 2.6cqw; padding: 3.2cqw; border-radius: 3px;
  background: radial-gradient(120% 100% at 50% 0%, #2E1912, #160A06); box-shadow: inset 0 10px 18px rgba(0,0,0,.75), inset 0 0 0 1px rgba(201,164,92,.38), 0 0 0 1px rgba(0,0,0,.45); }
.lb-cell { all: unset; position: relative; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.lb-cell:disabled { cursor: inherit; }
.lb-cell:focus-visible { outline: 2px solid #E3C27E; outline-offset: 2px; }
.lb-cup { position: absolute; inset: 1%; border-radius: 50%;
  background: radial-gradient(circle closest-side, #0A0503 82%, rgba(10,5,3,.55) 90%, rgba(10,5,3,0) 97%), repeating-conic-gradient(from 2deg, rgba(120,80,56,.55) 0 2.5deg, rgba(40,22,14,.55) 2.5deg 5deg), radial-gradient(circle closest-side, #3A2216 70%, #24140C 100%);
  box-shadow: inset 0 2px 4px rgba(0,0,0,.7), 0 1px 0 rgba(255,220,180,.06); transition: box-shadow .6s ease; }
.lb-cell.is-tasted .lb-cup { box-shadow: inset 0 3px 5px rgba(0,0,0,.7), 0 0 0 1.5px rgba(227,194,126,.8), 0 0 14px rgba(227,194,126,.35); }
.lb-cell .lb-bb { width: 88%; transition: transform .5s ${EASE}, opacity .4s ease; }
@media (hover: hover) { .lb-box3d.is-open .lb-cell:hover .lb-bb { transform: translateY(-3%) scale(1.04); } }
.lb-cell.is-out .lb-bb { opacity: 0; transform: translateY(-24%) scale(.8); }

/* a bonbon */
.lb-bb { position: relative; display: block; width: 100%; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle at 34% 26%, #70442F 0%, #43251A 26%, #2A150D 55%, #160905 82%, #0C0402 100%);
  box-shadow: 0 7px 10px -3px rgba(0,0,0,.8), 0 1px 2px rgba(0,0,0,.6), inset 0 -4px 8px rgba(0,0,0,.6), inset 0 1.5px 2px rgba(255,214,170,.22); }
.lb-bbPhoto { position: absolute; inset: 9%; border-radius: 50%; overflow: hidden; filter: saturate(.94) contrast(1.06) sepia(.1);
  -webkit-mask: radial-gradient(circle closest-side, #000 84%, transparent 100%); mask: radial-gradient(circle closest-side, #000 84%, transparent 100%); }
.lb-bbPhoto::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle closest-side, transparent 66%, rgba(30,14,8,.42) 100%); }
.lb-bbDeco { position: absolute; inset: 18%; border-radius: 50%;
  background: repeating-linear-gradient(115deg, transparent 0 9%, rgba(201,164,92,.55) 9% 11%); opacity: .8; }
.lb-bbGloss { position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  background: radial-gradient(ellipse 17% 8% at calc(34% - var(--sx) * 8%) calc(19% - var(--sy) * 6%), rgba(255,255,255,.62), rgba(255,255,255,.08) 70%, transparent 82%),
    
    radial-gradient(circle closest-side, transparent 93%, rgba(255,232,200,.2) 95.5%, transparent 98%),
    radial-gradient(ellipse 50% 22% at 50% 96%, rgba(255,210,160,.14), transparent 70%); }
.lb-bbSheen { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; pointer-events: none; }
.lb-bbSheen i { position: absolute; inset: -100%; transform: translate(calc((var(--sx) * 1.6 - var(--cx, 0)) * 33.3%), calc((var(--sy) * 1.2 - var(--cy, 0)) * 20%)); }
.lb-bbSheen i::before { content: ""; position: absolute; inset: 0;
  background: linear-gradient(115deg, transparent 43%, rgba(255,232,180,.22) 47%, rgba(255,250,235,.42) 50%, rgba(255,232,180,.2) 53%, transparent 57%); }
.lb-box3d.is-open .lb-bbSheen i::before { animation: lb-sweep 1.8s ${EASE} calc(.25s + var(--i, 0) * .08s) backwards; }
@keyframes lb-sweep { from { transform: translateX(-60%); opacity: 1; } }

/* the tissue */
.lb-tissue { position: absolute; inset: 4.2cqw; perspective: 900px; pointer-events: none; }
.lb-tissueL, .lb-tissueR { position: absolute; top: -1.5%; bottom: -1.5%; width: 53%;
  background: ${CRUMPLE}, linear-gradient(180deg, rgba(246,232,210,.96), rgba(226,204,172,.95));
  box-shadow: 0 2px 10px rgba(0,0,0,.35); transition: transform 1.1s ${EASE}, opacity .55s ease .15s; }
.lb-tissueL { left: -1%; transform-origin: 0 50%; border-right: 1px solid rgba(160,130,100,.25); }
.lb-tissueR { right: -1%; transform-origin: 100% 50%; }
.lb-sticker { position: absolute; left: 50%; top: 50%; width: 15cqw; height: 15cqw; margin: -7.5cqw 0 0 -7.5cqw; border-radius: 50%; display: grid; place-items: center;
  font: italic 400 8cqw/1 ${SERIF}; color: #4A2A1F; background: radial-gradient(circle at 35% 30%, #FFF1C9, #D9B56A 45%, #8A6A2F);
  box-shadow: 0 2px 5px rgba(0,0,0,.4), inset 0 0 0 1.5px rgba(255,255,255,.35), inset 0 0 0 3px rgba(122,90,34,.35);
  transition: transform .9s ${EASE}, opacity .5s ease; }
.lb-box3d.is-open .lb-tissueL { transform: rotateY(-110deg); opacity: 0; }
.lb-box3d.is-open .lb-tissueR { transform: rotateY(110deg); opacity: 0; }
.lb-box3d.is-open .lb-sticker { transform: scale(.4) rotate(-40deg); opacity: 0; }

/* lid on the box */
.lb-glowGap { position: absolute; inset: -14% -10%; border-radius: 10px; pointer-events: none; opacity: calc(var(--lift) * .95);
  background: radial-gradient(closest-side, rgba(255,226,170,1) 55%, rgba(255,176,96,.6) 78%, transparent); filter: blur(14px); transform: translateZ(4px); }
.lb-tissue::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: calc(var(--lift, 0) * .9); transition: opacity .6s ease;
  background: radial-gradient(70% 70% at 50% 40%, rgba(255,214,140,.75), rgba(255,170,90,.2) 70%, transparent); }
.lb-box3d.is-open .lb-tissue::after { opacity: 0; }
.lb-box3d.is-open .lb-glowGap { opacity: 0; transition: opacity 1.6s ease .2s; }
.lb-lid { position: absolute; inset: 0; border-radius: 5px; transition: transform .4s ${EASE};
  transform: translate3d(0, calc(var(--lift) * -15%), calc(var(--lift) * 90px)) rotateX(calc(var(--lift) * -9deg));
  box-shadow: 0 calc(6px + var(--lift) * 50px) calc(14px + var(--lift) * 50px) -8px rgba(0,0,0,.85); }
.lb-box3d.is-rising .lb-lid { animation: lb-tremble 1.1s linear; }
@keyframes lb-tremble {
  0%, 100% { transform: translate3d(0, -15%, 90px) rotateX(-9deg); }
  20% { transform: translate3d(.4%, -16%, 96px) rotateX(-9.5deg); } 40% { transform: translate3d(-.5%, -16.5%, 100px) rotateX(-10deg); }
  60% { transform: translate3d(.6%, -17%, 104px) rotateX(-10.5deg); } 80% { transform: translate3d(-.6%, -17.5%, 108px) rotateX(-11deg); } }
.lb-box3d.is-open .lb-lid { animation: lb-lidAway 1.25s cubic-bezier(.55,0,.3,1) forwards; pointer-events: none; }
@keyframes lb-lidAway { 0% { transform: translate3d(0, -17%, 108px) rotateX(-11deg); opacity: 1; }
  100% { transform: translate3d(8%, -150%, 260px) rotateX(-38deg) rotateZ(-7deg); opacity: 0; } }
.lb-liftBtn { all: unset; cursor: pointer; display: grid; justify-items: center; gap: 12px; padding: 8px 18px; font: 600 10.5px/1 ${SANS}; letter-spacing: .32em;
  text-transform: uppercase; color: rgba(243,230,211,.85); animation: lb-rise 1.2s ${EASE} 1.4s backwards; }
.lb-liftBtn i { width: 11px; height: 11px; border-left: 1.5px solid #E3C27E; border-top: 1.5px solid #E3C27E; transform: rotate(45deg); animation: lb-nudge 1.8s ease-in-out infinite; }
.lb-liftBtn:focus-visible { outline: 2px solid #E3C27E; outline-offset: 4px; border-radius: 12px; }
@keyframes lb-nudge { 50% { transform: translateY(-6px) rotate(45deg); } }

/* ── the lifted piece ─────────────────────────────────────────────────── */
.lb-taste { position: fixed; inset: 0; z-index: 110; display: grid; place-items: center; align-content: center; gap: 10px; padding: 24px;
  background: rgba(12,6,4,.78); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); animation: lb-fade .45s ease; }
.lb-tasteIn { display: grid; justify-items: center; gap: 18px; perspective: 1100px; animation: lb-lift .75s ${EASE}; }
@keyframes lb-lift { from { opacity: 0; transform: scale(.6) translateY(40px); } }
.lb-coin { all: unset; position: relative; display: block; width: min(270px, 66vw, 40svh); aspect-ratio: 1; border-radius: 50%; cursor: pointer;
  transform-style: preserve-3d; transition: transform 1.05s ${EASE}; -webkit-tap-highlight-color: transparent; }
.lb-coin.is-reduced { transition-duration: .2s; }
.lb-coin.is-flipped { transform: rotateY(180deg); }
.lb-coin:focus-visible { outline: 2px solid #E3C27E; outline-offset: 6px; }
.lb-coinFace { position: absolute; inset: 0; display: block; border-radius: 50%; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.lb-coinFront .lb-bb { box-shadow: 0 30px 50px -18px rgba(0,0,0,.9), 0 6px 10px rgba(0,0,0,.5), inset 0 -10px 18px rgba(0,0,0,.6), inset 0 4px 6px rgba(255,214,170,.28); }
.lb-coinFront .lb-bbSheen { opacity: .45; }
.lb-coinFront .lb-bbPhoto { filter: saturate(1) contrast(1.05) sepia(.06); }
.lb-coinFront .lb-bbSheen i { transform: translate(calc(var(--sx) * 40%), calc(var(--sy) * 20%)); }
.lb-coinBack { transform: rotateY(180deg); display: grid; place-items: center;
  background: repeating-radial-gradient(circle, rgba(255,255,255,.025) 0 2px, transparent 2px 7px), radial-gradient(circle at 40% 30%, #5A3424, #2A1712 60%, #140906);
  box-shadow: inset 0 0 0 1px rgba(201,164,92,.4), inset 0 -10px 22px rgba(0,0,0,.65), 0 30px 50px -18px rgba(0,0,0,.9); }
.lb-coinBackIn { display: grid; justify-items: center; gap: 12px; padding: 16%; text-align: center; }
.lb-coinNo { font: 600 10.5px/1 ${SANS}; letter-spacing: .36em; text-transform: uppercase; color: rgba(227,194,126,.85); }
.lb-coinFlavour { font: italic 400 clamp(24px, 7.4vw, 31px)/1.08 ${SERIF}; font-variation-settings: "opsz" 72, "SOFT" 100; text-wrap: balance;
  background: ${FOIL}; background-size: 240% 100%; background-position: calc(50% + var(--sx) * 40%) 50%; -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 1px 0 rgba(0,0,0,.55)); }
.lb-coinRule { width: 34px; height: 1px; background: linear-gradient(90deg, transparent, #C9A45C, transparent); }
.lb-coinHouse { font: italic 400 14px/1 ${SERIF}; color: rgba(243,230,211,.5); }
.lb-note { min-height: 104px; max-width: 330px; display: grid; justify-items: center; align-content: start; gap: 8px; text-align: center; }
.lb-noteCap { margin: 0; font: italic 300 25px/1.18 ${SERIF}; font-variation-settings: "opsz" 72, "SOFT" 100; color: #FBF2E4; text-wrap: balance; animation: lb-rise .9s ${EASE} .45s backwards; }
.lb-noteText { margin: 0; font: 400 17px/1.45 ${SERIF}; color: rgba(243,230,211,.74); text-wrap: pretty; animation: lb-rise .9s ${EASE} .7s backwards; }
.lb-tasteClose { all: unset; cursor: pointer; padding: 14px 18px; font: 600 10.5px/1 ${SANS}; letter-spacing: .32em; text-transform: uppercase; color: rgba(243,230,211,.7); }
.lb-tasteClose:focus-visible { outline: 2px solid #E3C27E; outline-offset: 2px; }

/* ── III: the heart ───────────────────────────────────────────────────── */
.lb-heartScene { justify-content: space-between; overflow: hidden; }
.lb-heartStage { flex: 1 1 auto; width: 100%; min-height: 0; display: grid; place-items: center; padding: 6px 0; }
.lb-heartWrap { width: min(310px, 76vw, calc(42svh * 100 / 92)); filter: drop-shadow(0 28px 26px rgba(0,0,0,.72)) drop-shadow(0 6px 8px rgba(0,0,0,.5));
  transform: rotateX(calc(var(--sy) * -6deg)) rotateY(calc(var(--sx) * 8deg)); }
.lb-heart { position: relative; width: 100%; aspect-ratio: 100 / 92; -webkit-mask: var(--heart) center / 100% 100% no-repeat; mask: var(--heart) center / 100% 100% no-repeat; }
.lb-heartShell { position: absolute; inset: 0; background: radial-gradient(circle at 30% 22%, #D45A72 0%, #A42A44 26%, #6E1129 58%, #34040F 100%); }
.lb-heartPhoto { position: absolute; left: 12%; right: 12%; top: 10%; bottom: 14%; overflow: hidden; filter: saturate(.96) contrast(1.05) sepia(.06);
  -webkit-mask: var(--heart) center / 100% 100% no-repeat; mask: var(--heart) center / 100% 100% no-repeat; }
.lb-heartRecess { position: absolute; left: 10.5%; right: 10.5%; top: 8.5%; bottom: 12.5%; background: #3A0614; filter: blur(3px); opacity: .9;
  -webkit-mask: var(--heart) center / 100% 100% no-repeat; mask: var(--heart) center / 100% 100% no-repeat; }
.lb-heartRim { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(160deg, rgba(255,210,220,.22), transparent 40%, rgba(0,0,0,.28) 85%); }
.lb-heartPlain { display: grid; place-items: center; background: radial-gradient(circle at 40% 30%, #6A3A2A, #2A1712); }
.lb-heartPlain b { font: italic 300 clamp(36px, 12vw, 64px)/1 ${SERIF}; background: ${FOIL}; -webkit-background-clip: text; background-clip: text; color: transparent; }
.lb-heartShade { position: absolute; inset: 0; background: radial-gradient(circle at 50% 40%, transparent 50%, rgba(46,4,14,.55) 88%); pointer-events: none; }
.lb-heartGloss { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 15% 9% at calc(28% - var(--sx) * 6%) calc(17% - var(--sy) * 4%), rgba(255,255,255,.8), rgba(255,255,255,.1) 65%, transparent 80%),
    radial-gradient(ellipse 10% 6% at calc(72% - var(--sx) * 6%) calc(16% - var(--sy) * 4%), rgba(255,255,255,.5), transparent 75%),
    radial-gradient(ellipse 50% 22% at 50% 92%, rgba(255,190,200,.16), transparent 70%); }
.lb-heartSheen { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.lb-heartSheen i { position: absolute; inset: -60%; transform: translate(calc(var(--sx) * 30%), calc(var(--sy) * 14%)); }
.lb-heartSheen i::before { content: ""; position: absolute; inset: 0;
  background: linear-gradient(115deg, transparent 42%, rgba(255,232,190,.2) 47%, rgba(255,250,235,.4) 50%, rgba(255,232,190,.18) 53%, transparent 58%); opacity: 0; }
.lb-heartScene.is-clean .lb-heartSheen i::before { opacity: 1; animation: lb-sweep2 1.8s ${EASE} .25s backwards; }
@keyframes lb-sweep2 { from { transform: translateX(-45%); } }
.lb-dust { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: grab; transition: opacity 1s ease; }
.lb-heartScene.is-clean .lb-dust { opacity: 0; pointer-events: none; }
.lb-dustFoot { display: grid; justify-items: center; gap: 4px; }

/* ── IV: the menu card ────────────────────────────────────────────────── */
.lb-letterScene { justify-content: flex-start; }
.lb-letterScene:not(.is-out) { overflow: hidden; }
.lb-menuStage { position: relative; width: 100%; flex: 1 0 auto; display: grid; justify-items: center; align-content: start; }
.lb-menu { position: relative; z-index: 1; box-sizing: border-box; width: min(560px, 100%); min-height: 62svh; padding: 44px 30px 40px; border-radius: 2px;
  color: #2A1712; background: ${PAPER}; box-shadow: 0 50px 80px -40px rgba(0,0,0,.9), 0 18px 30px -18px rgba(0,0,0,.6);
  transform: translateY(calc(12svh - var(--pull) * 10svh)); transition: transform 1.3s ${EASE}; cursor: grab; touch-action: none; }
.lb-menu.is-out { transform: none; cursor: default; touch-action: auto; }
.lb-menu.is-reduced { transition-duration: .2s; }
.lb-menu:focus-visible { outline: 2px solid #E3C27E; outline-offset: 4px; }
.lb-menu::before, .lb-menu::after { content: ""; position: absolute; pointer-events: none; border: 1px solid rgba(156,120,60,.55); }
.lb-menu::before { inset: 10px; }
.lb-menu::after { inset: 14px; border-width: .5px; border-color: rgba(156,120,60,.4); }
.lb-menuHead { display: grid; justify-items: center; gap: 14px; text-align: center; padding-top: 6px; }
.lb-menuHouse { margin: 0; font: 600 10.5px/1 ${SANS}; letter-spacing: .44em; text-indent: .44em; text-transform: uppercase; color: #8A6A2F; }
.lb-menuRule { width: 46px; height: 1px; background: linear-gradient(90deg, transparent, #C9A45C, transparent); }
.lb-menuFor { margin: 0; font: italic 300 clamp(34px, 9.4vw, 52px)/1.05 ${SERIF}; font-variation-settings: "opsz" 144, "SOFT" 100; color: #2A1712; }
.lb-menuFor em { color: #9E2A43; }
.lb-menuBody { margin-top: 30px; }
.lb-menuP { margin: 0 0 1.05em; font: 360 19.5px/1.58 ${SERIF}; font-variation-settings: "opsz" 14, "SOFT" 50; font-feature-settings: "liga", "onum"; text-wrap: pretty; color: #2A1712; }
.lb-menuP.is-first { font-style: italic; font-size: 22px; }
.lb-menuP p { margin: 0; white-space: pre-line; }
.lb-signOff { margin: 1.3em 0 0; font: italic 400 25px/1.2 ${SERIF}; text-align: right; color: #2A1712; }
.lb-menuFoot { margin: 34px 0 0; text-align: center; font: 600 9.5px/1 ${SANS}; letter-spacing: .36em; text-transform: uppercase; color: #8A6A2F; }
.lb-sleeve { position: absolute; z-index: 2; left: 50%; top: calc(12svh + 172px); width: min(600px, calc(100% + 12px)); height: 66svh; transform: translateX(-50%);
  border-radius: 4px; overflow: hidden; display: grid; justify-items: center; align-content: start; padding-top: 64px; gap: 14px;
  background: radial-gradient(120% 80% at 30% 0%, var(--lid-hi), var(--lid) 50%, var(--lid-deep));
  box-shadow: 0 -20px 40px -18px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.12);
  -webkit-mask: radial-gradient(circle 30px at 50% 0, transparent 97%, #000 100%); mask: radial-gradient(circle 30px at 50% 0, transparent 97%, #000 100%);
  transition: transform 1.2s ${EASE}, opacity .9s ease .2s; pointer-events: none; }
.lb-sleeve.is-gone { transform: translate(-50%, 70svh); opacity: 0; }
.lb-sleeveMono { margin: 0; font: italic 300 64px/1 ${SERIF}; font-variation-settings: "opsz" 144, "SOFT" 100; display: flex; gap: 6px; align-items: baseline;
  background: ${FOIL}; background-size: 240% 100%; background-position: calc(50% - var(--sx) * 40%) 50%; -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 1px 0 rgba(0,0,0,.5)); }
.lb-sleeveMono em { font-size: .5em; }
.lb-sleeveHint { margin: 0; font: 600 10.5px/1 ${SANS}; letter-spacing: .32em; text-transform: uppercase; color: var(--lid-ink); animation: lb-dot 2.4s ease-in-out infinite; }
@keyframes lb-dot { 50% { opacity: .5; } }

/* ── V: voice ─────────────────────────────────────────────────────────── */
.lb-voice { justify-content: space-between; overflow: hidden; }
.lb-voiceBg { position: absolute; inset: 0; z-index: 0; }
.lb-voiceBg::after { content: ""; position: absolute; inset: 0; background: radial-gradient(90% 55% at 50% 50%, rgba(14,7,5,.62), rgba(14,7,5,.38) 100%), linear-gradient(180deg, rgba(14,7,5,.72), rgba(14,7,5,.2) 35%, rgba(14,7,5,.9)); }
.lb-voice > header, .lb-voice > footer, .lb-voiceMid { position: relative; z-index: 1; }
.lb-voiceMid { flex: 1; display: grid; place-content: center; justify-items: center; gap: 18px; width: min(440px, 100%); text-align: center; }
.lb-voiceFrom { margin: 0; font: italic 300 32px/1 ${SERIF}; color: #FBF2E4; }
.lb-voicePlayer { width: 100%; }
.lb-voiceCap { margin: 0; font: italic 300 20px/1.35 ${SERIF}; color: rgba(243,230,211,.88); text-wrap: balance; }
.lb-quote { margin: 0; display: grid; gap: 22px; justify-items: center; }
.lb-quoteText { margin: 0; font: italic 300 clamp(30px, 8.4vw, 50px)/1.12 ${SERIF}; font-variation-settings: "opsz" 144, "SOFT" 100; color: #FBF2E4; text-wrap: balance; text-shadow: 0 2px 24px rgba(0,0,0,.5); }
.lb-quote figcaption { font: 600 10.5px/1 ${SANS} !important; letter-spacing: .36em; text-transform: uppercase; color: #E3C27E; }
.lb-quote figcaption::before { content: "— "; }

/* ── the end ──────────────────────────────────────────────────────────── */
.lb-ending { justify-content: flex-start; }
.lb-displayEnd { font-size: clamp(34px, 9.2vw, 60px); }
.lb-cardWrap { position: relative; margin: 26px 0 26px; animation: lb-rise 1.4s ${EASE} .6s backwards; }
.lb-keep { aspect-ratio: 4 / 5; }
.lb-keep .lb-mono { font-size: 19cqw; }
.lb-keep .lb-lidMid { align-content: center; }
.lb-window { position: relative; display: block; width: 46cqw; aspect-ratio: 1; margin: 0 auto 6cqw; border-radius: 50%; overflow: hidden;
  box-shadow: 0 0 0 1.2px var(--foil), 0 0 0 4px rgba(0,0,0,.28), 0 0 0 5px rgba(201,164,92,.45); filter: saturate(.96) contrast(1.04) sepia(.08); }
.lb-window::after { content: ""; position: absolute; inset: 0; border-radius: 50%; box-shadow: inset 0 6px 14px rgba(0,0,0,.55); }
.lb-windowPlain { position: absolute; inset: 0; background: radial-gradient(circle at 36% 28%, #8A5A40, #3A1E14 55%, #120604); }
.lb-cardSticker { position: absolute; right: -16px; top: -20px; z-index: 2; }
.lb-endActions { display: grid; place-items: center; min-height: 60px; }
.lb-endMore { width: min(440px, 100%); display: grid; gap: 26px; padding-top: 48px; }
.lb-ps { display: grid; justify-items: center; gap: 14px; text-align: center; padding: 30px 22px 26px; border-radius: 3px;
  background: linear-gradient(180deg, rgba(243,230,211,.07), rgba(243,230,211,.03)); border: 1px solid rgba(243,230,211,.12); }
.lb-seal { all: unset; position: relative; width: 76px; height: 76px; cursor: pointer; display: grid; place-items: center; border-radius: 50%; -webkit-tap-highlight-color: transparent; }
.lb-seal:focus-visible { outline: 2px solid #E3C27E; outline-offset: 4px; }
.lb-sealL, .lb-sealR { position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #FFF1C9, #D9B56A 42%, #8A6A2F 100%);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.3), inset 0 0 0 5px rgba(122,90,34,.3), 0 6px 14px -4px rgba(0,0,0,.6);
  transition: transform 1s ${EASE}, opacity .8s ease .3s; }
.lb-sealL { clip-path: polygon(0 0, 54% 0, 44% 38%, 56% 62%, 46% 100%, 0 100%); }
.lb-sealR { clip-path: polygon(54% 0, 100% 0, 100% 100%, 46% 100%, 56% 62%, 44% 38%); }
.lb-seal b { position: relative; font: italic 500 20px/1 ${SERIF}; color: #4A2A1F; text-shadow: 0 1px 0 rgba(255,255,255,.4); transition: opacity .4s ease; }
.lb-ps.is-open .lb-sealL { transform: translate(-16px, 6px) rotate(-22deg); opacity: 0; }
.lb-ps.is-open .lb-sealR { transform: translate(16px, 8px) rotate(24deg); opacity: 0; }
.lb-ps.is-open .lb-seal b { opacity: 0; }
.lb-ps.is-open .lb-seal { height: 0; transition: height .8s ease .6s; }
.lb-psFirst { margin: 0; font: italic 300 22px/1.3 ${SERIF}; color: #FBF2E4; text-wrap: balance; }
.lb-psRest { margin: 0; font: 400 18px/1.55 ${SERIF}; white-space: pre-line; color: rgba(243,230,211,.88); animation: lb-rise 1.2s ${EASE} .3s backwards; }
.lb-reply .pm-replyH { font: italic 400 24px/1.15 ${SERIF} !important; color: #FBF2E4; }
.lb-reply textarea { font-family: ${SERIF} !important; font-size: 18px !important; background: rgba(243,230,211,.93) !important; border-radius: 3px !important; }
.lb-reply .pm-replyBtn, .lb-reply small, .lb-reply .pm-replyDone { font-family: ${SANS} !important; font-weight: 600 !important; letter-spacing: .04em; }
.lb-endKit a, .lb-endKit button { font-family: ${SANS} !important; font-weight: 600 !important; letter-spacing: .06em; box-shadow: none !important; border-radius: 99px !important; }
.lb-endKit p { font-family: ${SANS} !important; }
.lb-credit { margin: 6px 0 0; text-align: center; font: 600 9.5px/1 ${SANS}; letter-spacing: .3em; text-transform: uppercase; color: rgba(243,230,211,.42); }

/* ── the gate (the kit's PremiumGate, dressed) ────────────────────────── */
.lb-gate .pm-gateIn { gap: 12px; }
.lb-gate .pm-gateKick { font: 600 10.5px/1.2 ${SANS} !important; letter-spacing: .36em; color: #E3C27E; opacity: .95; }
.lb-gate .pm-gateName, .lb-gate .pm-gateName * { font-family: ${SERIF} !important; font-style: italic !important; font-weight: 300 !important; font-variation-settings: "opsz" 144, "SOFT" 100; }
.lb-gate .pm-gateName { font-size: clamp(54px, 15vw, 100px) !important; line-height: 1 !important; letter-spacing: -.02em; }
.lb-gate .pm-gateSub { font: italic 300 17px/1.3 ${SERIF} !important; opacity: .7; }
.lb-gate .pm-gateArt { width: min(250px, 60vw, 34vh); max-height: none; aspect-ratio: 1; margin: 8px 0 6px; animation: none; filter: drop-shadow(0 30px 30px rgba(0,0,0,.75)); }
.lb-gateLid { transform: rotate(-4deg); transition: transform 1.2s ${EASE}; }
.lb-gateLid.is-pulled { transform: rotate(0deg) scale(1.04); }
.lb-gate .pm-gateCta { font: 600 12.5px/1 ${SANS} !important; letter-spacing: .22em; text-transform: uppercase; min-height: 54px; padding: 14px 34px;
  background: linear-gradient(135deg, #FFF1C9, #E3C27E 45%, #9C7834); color: #2A1806; }
.lb-gate .pm-seal { background: rgba(243,230,211,.06); font-family: ${SANS}; font-weight: 600; letter-spacing: .04em; }
.lb-gate .pm-quiet { font-family: ${SANS}; font-weight: 600; opacity: .6; }
.lb-gate .pm-bar { background: #060302; }

@media (min-width: 768px) {
  .lb-scene { padding-left: 40px; padding-right: 40px; }
  .lb-head { min-height: 146px; }
  .lb-menu { padding: 64px 64px 56px; }
  .lb-menuP { font-size: 21px; }
  .lb-boxWrap { width: min(70vw, 480px, calc(50svh * var(--cols) / var(--rows))); }
}
/* Tablet: the stage is centred, so the music chip (bottom-right) would sit on the footer: keep clear of it. */
@media (min-width: 768px) and (max-width: 1099px) { .lb-scene { padding-bottom: calc(22px + var(--vw-dock-space, 0px) + env(safe-area-inset-bottom, 0px)); } }
/* Desktop: the box (and the heart) get the whole height on the right, the words sit on the left. */
@media (min-width: 1100px) {
  .lb-display { font-size: clamp(54px, 4.6vw, 78px); }
  .lb-boxScene, .lb-heartScene { display: grid; grid-template-columns: minmax(380px, .9fr) 1.25fr; grid-template-rows: 1fr auto; column-gap: 4vw; align-items: stretch;
    padding: calc(var(--vw-top-space, 0px) + 72px) 7vw 40px; }
  .lb-boxScene .lb-head, .lb-heartScene .lb-head { grid-column: 1; grid-row: 1; align-self: end; justify-items: start; text-align: left; min-height: 0; max-width: 540px; }
  .lb-boxScene .lb-headIn, .lb-heartScene .lb-headIn { justify-items: start; }
  .lb-boxScene .lb-display, .lb-heartScene .lb-display { text-align: left; }
  .lb-boxScene .lb-foot, .lb-heartScene .lb-foot { grid-column: 1; grid-row: 2; align-self: start; justify-items: start; text-align: left; align-content: start; min-height: 220px; padding-top: 34px; }
  .lb-boxScene .lb-tasteFoot, .lb-dustFoot { justify-items: start; }
  .lb-boxScene .lb-ctaRow { justify-content: flex-start; }
  .lb-liftBtn { justify-items: start; padding-left: 0; }
  .lb-stageBox, .lb-heartStage { grid-column: 2; grid-row: 1 / span 2; }
  .lb-boxWrap { width: min(42vw, 600px, calc(74svh * var(--cols) / var(--rows))); }
  .lb-heartWrap { width: min(36vw, 480px, calc(66svh * 100 / 92)); }
}
@media (max-height: 700px) {
  .lb-head { min-height: 100px; }
  .lb-display { font-size: clamp(29px, 8.4vw, 52px); }
  .lb-foot { min-height: 120px; }
}
@media (prefers-reduced-motion: reduce) {
  .lb-fadeIn, .lb-rise, .lb-liftBtn, .lb-cardWrap, .lb-psRest, .lb-taste, .lb-tasteIn, .lb-noteCap, .lb-noteText { animation: lb-fade .3s backwards !important; }
  .lb-liftBtn i, .lb-sleeveHint { animation: none; }
  .lb-box3d.is-rising .lb-lid { animation: none; }
  .lb-box3d.is-open .lb-lid { animation: lb-fade .3s reverse forwards; opacity: 0; }
  .lb-box3d.is-open .lb-bbSheen i::before, .lb-heartScene.is-clean .lb-heartSheen i::before { animation: none; }
}
.lb-heartWrap { --heart: ${HEART_MASK}; }
`;
