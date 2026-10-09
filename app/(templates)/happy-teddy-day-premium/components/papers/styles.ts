// "Adoption Papers": one stylesheet for every scene. Palette (research §D.4): oat #EFE6D8, honey #C58B4B, cocoa
// #5A3B2E, powder blue #BFD3E0, stamp red #B23A3A, on a warm cocoa night. Type: DM Serif Display + Nunito Sans.
// Materials are CSS only: paper = two SVG noises over a gradient; satin = fine woven lines; gold foil = conic +
// radial gradients; the rubber stamp is ink with a speckled noise mask. Easing cubic-bezier(.22,1,.36,1) in.

import { fluentUrl } from "../../../_valentine/kit/premium";

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const FIBRE = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.9 .07' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 .36  0 0 0 0 .26  0 0 0 0 .18  0 0 0 .1 0'/></filter><rect width='220' height='220' filter='url(#f)'/></svg>`,
);
const MOTTLE = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='.011' numOctaves='3' seed='9'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .3  0 0 0 .12 0'/></filter><rect width='320' height='320' filter='url(#m)'/></svg>`,
);
const SPECKLE = svg(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' seed='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.15'/></filter><rect width='160' height='160' filter='url(#s)'/></svg>`,
);
const PAPER = `${FIBRE}, ${MOTTLE}, linear-gradient(170deg, #F8F2E7, #EFE5D4)`;
const MANILA = `${FIBRE}, ${MOTTLE}, linear-gradient(165deg, #E2C997, #CFAF78)`;
const SATIN_BLUE = `repeating-linear-gradient(90deg, rgba(255,255,255,.16) 0 1px, transparent 1px 3px), linear-gradient(160deg, #D3E2EC, #BFD3E0 45%, #A9C2D3)`;
const SATIN_OAT = `repeating-linear-gradient(90deg, rgba(255,255,255,.22) 0 1px, transparent 1px 3px), linear-gradient(160deg, #F7F0E4, #EFE6D8 50%, #E2D5C0)`;

// A serrated foil seal edge: 36 teeth.
const TEETH = (() => {
  const pts: string[] = [];
  const n = 72;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = i % 2 ? 46 : 50;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")})`;
})();

const HEART = fluentUrl("red-heart");

export const PAPERS_CSS = `
.ap-root { position: relative; min-height: 100svh; color: #F5EEE2; font-family: var(--ap-sans), system-ui, sans-serif; background: #140B07; }
.ap-root figcaption { font-family: var(--ap-sans), system-ui, sans-serif; }
.ap-stage { position: relative; z-index: 2; height: 100svh; }
.ap-scene { position: absolute; inset: 0; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
  display: flex; flex-direction: column; align-items: center;
  padding: calc(var(--vw-top-space, 0px) + 64px) 24px calc(22px + env(safe-area-inset-bottom, 0px)); }
.ap-scene::-webkit-scrollbar { display: none; }

/* type */
.ap-head { flex-shrink: 0; position: relative; z-index: 3; display: grid; justify-items: center; gap: 12px; text-align: center; width: 100%; max-width: 620px; }
.ap-headTight { gap: 8px; margin-bottom: 18px; }
.ap-eyebrow { margin: 0; font: 700 11px/1.2 var(--ap-sans), sans-serif; letter-spacing: .32em; text-transform: uppercase; color: #E9C08A; }
.ap-display { margin: 0; font: 400 clamp(40px, 11.5vw, 70px)/1.02 var(--ap-serif), Georgia, serif; letter-spacing: -.01em;
  color: #FBF5EA; text-wrap: balance; max-width: 11em; text-shadow: 0 2px 30px rgba(0,0,0,.45); }
.ap-displaySm { font-size: clamp(30px, 8.6vw, 52px); }
.ap-displayEnd { font-size: clamp(32px, 9vw, 58px); max-width: 12em; }
.ap-sub { margin: 0; font: italic 400 19px/1.35 var(--ap-serif), Georgia, serif; color: rgba(245,238,226,.8); text-wrap: balance; }
.ap-hint { margin: 0; font: 700 11px/1.3 var(--ap-sans), sans-serif; letter-spacing: .26em; text-transform: uppercase; color: rgba(245,238,226,.72); }
.ap-pulse { animation: ap-pulse 2.4s ease-in-out infinite; }
@keyframes ap-pulse { 50% { opacity: .45; } }
@keyframes ap-fade { from { opacity: 0; } }
@keyframes ap-rise { from { opacity: 0; transform: translateY(14px); } }
.ap-foot { position: relative; z-index: 3; min-height: 150px; width: 100%; display: grid; place-items: center; align-content: end; gap: 14px; text-align: center; flex-shrink: 0; }
.ap-footFlow { min-height: 0; padding: 26px 0 8px; }
.ap-textBtn { all: unset; cursor: pointer; min-height: 44px; padding: 0 14px; display: inline-flex; align-items: center;
  font: 700 11px/1 var(--ap-sans), sans-serif; letter-spacing: .24em; text-transform: uppercase; color: rgba(245,238,226,.7); }
.ap-textBtn:focus-visible { outline: 2px solid #E9C08A; outline-offset: 2px; border-radius: 8px; }
.ap-count { margin: 0; font: 400 22px/1 var(--ap-serif), serif; color: #FBF5EA; }
.ap-count span { opacity: .45; }
.ap-skip { all: unset; cursor: pointer; position: fixed; z-index: 95; top: calc(env(safe-area-inset-top, 0px) + 18px); left: 50%; transform: translateX(-50%);
  padding: 9px 16px; border-radius: 99px; background: rgba(20,11,7,.55); border: 1px solid rgba(233,192,138,.35);
  font: 700 10.5px/1 var(--ap-sans), sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #E9C08A;
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }

/* the rubber stamp (gate tag + certificate) */
.ap-stamp { display: inline-block; color: #B23A3A; border: 2.5px solid currentColor; border-radius: 6px; padding: 3px 12px 4px;
  font: 800 22px/1 var(--ap-sans), sans-serif; letter-spacing: .14em; text-transform: uppercase; mix-blend-mode: multiply;
  -webkit-mask-image: ${SPECKLE}; mask-image: ${SPECKLE}; -webkit-mask-size: 220px; mask-size: 220px; }
.ap-stamp em { font-style: normal; letter-spacing: 0; }

/* gate: the parcel tag */
.ap-gate .pm-gateIn { gap: 12px; }
.ap-gate .pm-gateKick { font: 700 11px/1.2 var(--ap-sans), sans-serif !important; letter-spacing: .3em; color: #E9C08A; opacity: .95; }
.ap-gate .pm-gateName, .ap-gate .pm-gateName * { font-family: var(--ap-serif), Georgia, serif !important; font-weight: 400 !important; }
.ap-gate .pm-gateName { font-size: clamp(54px, 15vw, 100px) !important; line-height: 1 !important; letter-spacing: -.01em; }
.ap-gate .pm-gateSub { font: italic 400 17px/1.3 var(--ap-serif), serif !important; opacity: .7; }
.ap-gate .pm-gateArt { width: min(228px, 58vw); aspect-ratio: 3 / 4.1; max-height: 38vh; animation: none; }
.ap-gate .pm-gateCta { font: 800 13px/1 var(--ap-sans), sans-serif !important; letter-spacing: .18em; text-transform: uppercase; min-height: 54px; padding: 14px 34px;
  background: linear-gradient(135deg, #FFE9C2, #E9C08A 45%, #A9733A); color: #2A1A12; }
.ap-gate .pm-seal { background: rgba(245,238,226,.06); font-family: var(--ap-sans), sans-serif; font-weight: 600; letter-spacing: .03em; }
.ap-gate .pm-quiet { font-family: var(--ap-sans), sans-serif; font-weight: 600; opacity: .6; }
.ap-gate .pm-bar { background: #0B0604; }
.ap-tagWrap { position: relative; width: 100%; height: 100%; transform-origin: 50% 0; animation: ap-sway 5.5s ease-in-out infinite; }
@keyframes ap-sway { 0%, 100% { transform: rotate(-3.5deg); } 50% { transform: rotate(2.5deg); } }
.ap-twine { position: absolute; left: 22%; right: 22%; top: -4%; height: 24%; overflow: visible; }
.ap-twine path { fill: none; stroke: #CDB48A; stroke-width: 2.2; stroke-linecap: round; vector-effect: non-scaling-stroke; filter: drop-shadow(0 1px 1px rgba(0,0,0,.5)); }
.ap-tag { position: absolute; left: 0; right: 0; top: 17%; bottom: 0; display: grid; justify-items: center; align-content: start; gap: 9px; padding: 34px 16px 14px;
  background: ${MANILA}; color: #4A2F22; text-align: center;
  clip-path: polygon(22% 0, 78% 0, 100% 14%, 100% 100%, 0 100%, 0 14%);
  filter: drop-shadow(0 22px 26px rgba(0,0,0,.55)); }
.ap-eyelet { position: absolute; top: 12px; left: 50%; width: 18px; height: 18px; margin-left: -9px; border-radius: 50%;
  background: radial-gradient(circle, #140B07 0 4px, #C9A15E 4.5px 6px, #8A6A33 6.5px 7.5px, transparent 8px); }
.ap-tagTo { margin: 4px 0 0; font: italic 400 21px/1.1 var(--ap-serif), serif; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ap-tagTo span { font: 800 9px/1 var(--ap-sans), sans-serif; letter-spacing: .24em; text-transform: uppercase; font-style: normal; opacity: .6; vertical-align: 3px; margin-right: 4px; }
.ap-stampTag { transform: rotate(-7deg); margin: 2px 0; }
.ap-tagLine { margin: 0; font: italic 400 16px/1.25 var(--ap-serif), serif; text-wrap: balance; }
.ap-tagCare { margin: auto 0 0; font: 800 7.5px/1.3 var(--ap-sans), sans-serif; letter-spacing: .2em; text-transform: uppercase; opacity: .55; }
.ap-tagNo { margin: 0; font: 700 8px/1 var(--ap-sans), sans-serif; letter-spacing: .2em; opacity: .45; }

/* I · Arrival */
.ap-meet { justify-content: space-between; overflow: hidden; }
.ap-bearStage { position: relative; flex: 1 1 auto; width: 100%; max-width: 520px; min-height: 290px; display: grid; place-items: center; }
.ap-pool { position: absolute; left: 50%; top: 50%; width: 380px; height: 380px; margin: -190px 0 0 -190px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(255,214,160,.30), rgba(233,160,90,.12) 40%, transparent 68%); }
.ap-pool::after { content: ""; position: absolute; left: 22%; right: 22%; top: 72%; height: 34px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0,0,0,.45), transparent); }
.ap-bear { all: unset; position: relative; cursor: pointer; display: grid; place-items: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  animation: ap-rise 1.4s cubic-bezier(.22,1,.36,1) .3s backwards; }
.ap-bear:focus-visible { outline: 2px solid #E9C08A; outline-offset: 8px; border-radius: 30px; }
.ap-bear > span:first-child { display: block; transform-origin: 50% 92%; }
.ap-squash { animation: ap-squash .7s cubic-bezier(.22,1,.36,1); }
@keyframes ap-squash { 0% { transform: scale(1); } 16% { transform: scale(1.12, .84); } 42% { transform: scale(.94, 1.07); } 68% { transform: scale(1.03, .98); } 100% { transform: scale(1); } }
.ap-hearts { position: absolute; left: 50%; top: 22%; width: 0; height: 0; pointer-events: none; }
.ap-hearts i { position: absolute; width: 30px; height: 30px; margin: -15px; background: url("${HEART}") center / contain no-repeat; opacity: 0;
  animation: ap-heart 1.4s cubic-bezier(.22,1,.36,1) forwards; }
.ap-hearts i:nth-child(1) { --x: -64px; --r: -18deg; }
.ap-hearts i:nth-child(2) { --x: 6px; --r: 6deg; animation-delay: .08s; width: 36px; height: 36px; margin: -18px; }
.ap-hearts i:nth-child(3) { --x: 70px; --r: 20deg; animation-delay: .16s; }
@keyframes ap-heart { 0% { opacity: 0; transform: translate(0, 20px) scale(.4); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--x), -110px) rotate(var(--r)) scale(1); } }
.ap-wovenTag { position: absolute; left: calc(50% + 56px); top: calc(50% + 24px); transform: rotate(9deg); z-index: 2;
  display: grid; justify-items: center; gap: 3px; padding: 8px 13px 9px; border-radius: 2px; color: #2C3E55;
  background: ${SATIN_BLUE}; box-shadow: 0 8px 14px -6px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.5);
  outline: 1px dashed rgba(44,62,85,.45); outline-offset: -4px; animation: ap-rise 1.2s cubic-bezier(.22,1,.36,1) 1s backwards; }
.ap-wovenTag::before { content: ""; position: absolute; left: -16px; top: 12px; width: 18px; height: 1.5px; background: rgba(233,220,200,.7); transform: rotate(-12deg); }
.ap-wovenTag b { font: 400 17px/1 var(--ap-serif), serif; letter-spacing: .02em; }
.ap-wovenTag span { font: 800 7.5px/1 var(--ap-sans), sans-serif; letter-spacing: .2em; text-transform: uppercase; white-space: nowrap; }
.ap-wovenTag em { font-style: normal; color: #B23A3A; }
.ap-bubble { position: absolute; left: 50%; top: calc(50% - 168px); transform: translateX(-50%); z-index: 3; width: max-content; max-width: min(270px, 78vw);
  margin: 0; padding: 12px 18px 13px; border-radius: 18px; background: #FBF5EA; color: #3A2418; text-align: center;
  font: italic 400 18px/1.3 var(--ap-serif), serif; box-shadow: 0 16px 30px -14px rgba(0,0,0,.7);
  animation: ap-bubble .7s cubic-bezier(.22,1,.36,1) backwards; }
.ap-bubble::after { content: ""; position: absolute; left: 50%; bottom: -7px; width: 14px; height: 14px; margin-left: -7px; background: #FBF5EA; transform: rotate(45deg); border-radius: 0 0 3px 0; }
@keyframes ap-bubble { from { opacity: 0; transform: translate(-50%, 12px) scale(.9); } }
.ap-meetSticker { position: absolute; left: calc(50% - 150px); top: calc(50% - 60px); }

/* II · Next of kin */
.ap-family { justify-content: space-between; overflow: hidden; }
.ap-stack { position: relative; flex-shrink: 0; width: min(296px, 74vw, calc((100svh - var(--vw-top-space, 0px) - 360px) * .7)); aspect-ratio: 296 / 424; margin: 22px auto 0; }
.ap-exhibit { position: absolute; inset: 0; margin: 0; padding: 12px 12px 0; display: flex; flex-direction: column; border-radius: 2px;
  background: ${PAPER}; color: #3A2418; touch-action: pan-y; cursor: grab; user-select: none;
  box-shadow: 0 34px 60px -28px rgba(0,0,0,.9), 0 10px 20px -12px rgba(0,0,0,.6); }
.ap-exhibit.is-top:active { cursor: grabbing; }
.ap-exhibitPhoto { position: relative; aspect-ratio: 4 / 5; overflow: hidden; box-shadow: 0 0 0 1px rgba(60,30,20,.12); }
.ap-exhibit figcaption { flex: 1; display: grid; align-content: center; justify-items: center; gap: 5px; padding: 8px 6px 10px; text-align: center; }
.ap-exLabel { font: 800 9px/1 var(--ap-sans), sans-serif; letter-spacing: .26em; text-transform: uppercase; color: #A9733A; }
.ap-exCap { font: italic 400 18px/1.15 var(--ap-serif), serif; text-wrap: balance; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ap-clip { position: absolute; z-index: 2; top: -14px; left: 26px; width: 14px; height: 44px; border: 2.5px solid #B9B4AC; border-radius: 8px; transform: rotate(-8deg);
  box-shadow: 1px 2px 2px rgba(0,0,0,.35); }
.ap-clip::after { content: ""; position: absolute; left: 2px; right: 2px; top: 6px; bottom: -6px; border: 2.5px solid #D2CEC6; border-top: 0; border-radius: 0 0 6px 6px; }

/* III · Care instructions */
.ap-care { justify-content: space-between; overflow: hidden; }
.ap-labels { position: relative; flex-shrink: 0; width: min(296px, 76vw); aspect-ratio: 296 / 370; margin: auto; perspective: 1200px; }
.ap-care .ap-foot { min-height: 96px; }
.ap-labelFibre { font: 700 8px/1.5 var(--ap-sans), sans-serif; letter-spacing: .22em; text-transform: uppercase; opacity: .55; max-width: 190px; }
.ap-label { all: unset; box-sizing: border-box; position: absolute; inset: 0; cursor: pointer; -webkit-tap-highlight-color: transparent;
  transform: translateY(calc(var(--d) * 13px)) scale(calc(1 - var(--d) * .05)) rotate(var(--tilt));
  transition: transform .7s cubic-bezier(.22,1,.36,1), opacity .5s ease; }
.ap-label.is-top { transform: rotate(var(--tilt)); animation: ap-fade .5s ease backwards; }
.ap-label.is-leaving { transform: translate(-115vw, 4vh) rotate(-22deg); transition: transform .52s cubic-bezier(.55,0,.75,.4); }
.ap-label:focus-visible .ap-labelFront, .ap-label:focus-visible .ap-labelBack { outline: 2px solid #E9C08A; outline-offset: 4px; }
.ap-labelInner { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform 1s cubic-bezier(.22,1,.36,1); }
.ap-label.is-flipped .ap-labelInner { transform: rotateY(180deg); }
.ap-labelFront, .ap-labelBack { position: absolute; inset: 0; box-sizing: border-box; display: grid; justify-items: center; align-content: center; gap: 18px; padding: 34px 26px 26px;
  border-radius: 4px; -webkit-backface-visibility: hidden; backface-visibility: hidden; text-align: center;
  box-shadow: 0 30px 50px -24px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.55); outline: 1.5px dashed rgba(44,62,85,.4); outline-offset: -9px; }
.ap-labelFront { background: ${SATIN_BLUE}; color: #2C3E55; }
.ap-labelFront::before, .ap-labelBack::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 18px; border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, rgba(0,0,0,.14), rgba(0,0,0,0)); }
.ap-labelBack { background: ${SATIN_OAT}; color: #3A2418; transform: rotateY(180deg); outline-color: rgba(169,115,58,.5); gap: 16px; }
.ap-labelHead { font: 800 10px/1 var(--ap-sans), sans-serif; letter-spacing: .34em; text-transform: uppercase; opacity: .7; }
.ap-labelNo { font: 400 20px/1 var(--ap-serif), serif; }
.ap-labelNo em { font-style: italic; opacity: .55; font-size: .8em; }
.ap-labelBack .ap-labelNo { font: 800 9px/1 var(--ap-sans), sans-serif; letter-spacing: .26em; opacity: .5; }
.ap-labelGlyph { color: #A9733A; }
.ap-labelLine { font: 400 clamp(23px, 6.6vw, 28px)/1.2 var(--ap-serif), serif; text-wrap: balance; }

/* IV · The letter */
.ap-folded { flex: 1; display: grid; place-items: center; align-content: center; gap: 26px; width: 100%; }
.ap-fold { all: unset; box-sizing: border-box; position: relative; cursor: pointer; width: min(300px, 76vw); aspect-ratio: 1.42; transform: rotate(-2.2deg);
  background: ${PAPER}; color: #3A2418; border-radius: 2px; display: grid; place-items: center;
  box-shadow: 0 36px 60px -26px rgba(0,0,0,.9), 0 10px 18px -10px rgba(0,0,0,.55); animation: ap-rise 1.2s cubic-bezier(.22,1,.36,1) .2s backwards; }
.ap-fold:focus-visible { outline: 2px solid #E9C08A; outline-offset: 6px; }
.ap-foldPanel { position: absolute; left: 0; right: 0; top: 0; height: 36%; background: linear-gradient(180deg, rgba(255,255,255,.35), rgba(120,80,40,.08));
  border-bottom: 1px solid rgba(90,59,46,.16); box-shadow: 0 6px 10px -8px rgba(60,30,10,.45); }
.ap-foldFace { position: relative; display: grid; justify-items: center; gap: 6px; padding-top: 14%; }
.ap-foldFor { font: 800 9.5px/1 var(--ap-sans), sans-serif; letter-spacing: .3em; text-transform: uppercase; color: #A9733A; }
.ap-foldName { font: italic 400 clamp(32px, 9vw, 40px)/1 var(--ap-serif), serif; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ap-foldSeal { position: absolute; top: -10%; left: 50%; width: 42px; height: 42px; margin-left: -21px; border-radius: 50%; display: grid; place-items: center;
  font: 400 19px/1 var(--ap-serif), serif; color: #F3C7B0; text-shadow: 0 1px 0 rgba(255,255,255,.25), 0 -1px 0 rgba(0,0,0,.4);
  background: radial-gradient(circle at 36% 30%, #D2584E, #9B2626 55%, #6A1515); box-shadow: 0 3px 6px rgba(0,0,0,.4), inset 0 -2px 3px rgba(0,0,0,.3); }
.ap-letter { position: relative; width: min(560px, 100%); box-sizing: border-box; padding: 34px 26px 30px; color: #3A2418; border-radius: 2px;
  background: ${PAPER}; box-shadow: 0 40px 70px -30px rgba(0,0,0,.85), 0 12px 22px -12px rgba(0,0,0,.55);
  transform-origin: 50% 0; animation: ap-unfold 1.3s cubic-bezier(.22,1,.36,1) backwards; }
.ap-letter.is-reduced { animation: ap-fade .3s backwards; }
@keyframes ap-unfold { 0% { opacity: 0; transform: perspective(1100px) rotateX(-78deg) scaleY(.5); } 40% { opacity: 1; } 100% { transform: none; } }
.ap-crease { position: absolute; left: 0; right: 0; height: 10px; pointer-events: none; background: linear-gradient(180deg, rgba(90,59,46,0), rgba(90,59,46,.08) 50%, rgba(255,255,255,.4) 52%, rgba(255,255,255,0)); }
.ap-creaseA { top: 33%; } .ap-creaseB { top: 66%; }
.ap-letterMast { display: flex; justify-content: space-between; margin: 0 0 22px; padding-bottom: 10px; border-bottom: 1px solid rgba(169,115,58,.35);
  font: 800 9px/1 var(--ap-sans), sans-serif; letter-spacing: .24em; text-transform: uppercase; color: #A9733A; }
.ap-letterP { margin: 0 0 1.1em; font: 400 19px/1.62 var(--ap-serif), Georgia, serif; color: #4A3326; text-wrap: pretty; }
.ap-letterP p { margin: 0; white-space: pre-line; }
.ap-letterP.is-first { font-style: italic; font-size: 23px; color: #3A2418; }
.ap-signOff { margin: 8px 0 0; text-align: right; font: italic 400 22px/1.2 var(--ap-serif), serif; color: #5A3B2E; }

/* V · In my voice */
.ap-voice { justify-content: space-between; }
.ap-voiceBg { position: absolute; inset: 0; z-index: 0; opacity: .6; }
.ap-voiceBg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,11,7,.75), rgba(20,11,7,.35) 40%, rgba(20,11,7,.85)); }
.ap-voiceMid { position: relative; z-index: 2; flex: 1; display: grid; place-items: center; align-content: center; gap: 18px; width: min(520px, 100%); text-align: center; }
.ap-voiceFrom { margin: 0; font: italic 400 30px/1.1 var(--ap-serif), serif; }
.ap-voicePlayer { width: 100%; }
.ap-voiceCap { margin: 0; font: italic 400 19px/1.4 var(--ap-serif), serif; color: rgba(245,238,226,.85); }
.ap-quote { margin: 0; display: grid; gap: 18px; justify-items: center; }
.ap-quoteText { margin: 0; font: italic 400 clamp(28px, 8vw, 46px)/1.15 var(--ap-serif), serif; color: #FBF5EA; text-wrap: balance; text-shadow: 0 2px 24px rgba(0,0,0,.6); }
.ap-quote figcaption { font: 700 11px/1 var(--ap-sans), sans-serif; letter-spacing: .3em; text-transform: uppercase; color: #E9C08A; }
.ap-quote figcaption::before { content: "— "; }

/* VI · The certificate */
.ap-adopt { justify-content: flex-start; }
.ap-certStage { width: min(372px, 100%); margin: 0 auto; flex-shrink: 0; transition: transform 1.1s cubic-bezier(.22,1,.36,1); }
.ap-certStage.is-rising { transform: translateY(-6px) scale(1.035); animation: ap-tremble .12s linear infinite; }
@keyframes ap-tremble { 50% { translate: .6px -.4px; } }
.ap-cert { container-type: inline-size; position: relative; width: 100%; box-sizing: border-box; padding: 3.2%; border-radius: 2px;
  background: ${PAPER}; color: #4A2F22;
  box-shadow: 0 46px 80px -34px rgba(0,0,0,.95), 0 14px 26px -14px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.4); }
.ap-certIn { position: relative; box-sizing: border-box; padding: 5.2cqw 5.4cqw 4.6cqw; text-align: center;
  border: .55cqw solid #B7884C; outline: 1px solid rgba(90,59,46,.28); outline-offset: -1.7cqw; }
.ap-orn { position: absolute; width: 4.2cqw; height: 4.2cqw; border: 0 solid #B7884C; }
.ap-ornTL { top: 2.4cqw; left: 2.4cqw; border-top-width: .5cqw; border-left-width: .5cqw; }
.ap-ornTR { top: 2.4cqw; right: 2.4cqw; border-top-width: .5cqw; border-right-width: .5cqw; }
.ap-ornBL { bottom: 2.4cqw; left: 2.4cqw; border-bottom-width: .5cqw; border-left-width: .5cqw; }
.ap-ornBR { bottom: 2.4cqw; right: 2.4cqw; border-bottom-width: .5cqw; border-right-width: .5cqw; }
.ap-certNo { display: flex; justify-content: space-between; margin: 0 1cqw; font: 800 2.2cqw/1 var(--ap-sans), sans-serif; letter-spacing: .18em; text-transform: uppercase; color: rgba(90,59,46,.55); }
.ap-certKicker { margin: 4.4cqw 0 0; font: 800 2.9cqw/1 var(--ap-sans), sans-serif; letter-spacing: .62em; text-indent: .62em; text-transform: uppercase; color: #A9733A; }
.ap-certTitle { margin: 1cqw 0 3.4cqw; font: 400 10.8cqw/1 var(--ap-serif), serif; color: #4A2F22;
  text-shadow: 0 .25cqw 0 rgba(255,255,255,.75), 0 -.15cqw 0 rgba(60,30,10,.25); }
.ap-certSmall { margin: 0; font: italic 400 3.5cqw/1.3 var(--ap-serif), serif; color: rgba(74,47,34,.75); }
.ap-certSmallIt { margin-top: .6cqw; }
.ap-certName { margin: 1cqw auto 1.8cqw; padding: 0 2cqw .8cqw; width: fit-content; max-width: 100%; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font: italic 400 11cqw/1.05 var(--ap-serif), serif; color: #3A2418; border-bottom: .3cqw solid rgba(183,136,76,.7); }
.ap-certBear { margin: 1.2cqw 0 0; font: 400 8.6cqw/1.05 var(--ap-serif), serif; color: #5A3B2E; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ap-facts { margin: 4.2cqw 0 0; display: grid; gap: 0; text-align: left; }
.ap-facts > div { display: grid; grid-template-columns: 29% 1fr; align-items: baseline; gap: 2cqw; padding: 1.3cqw 0; border-bottom: .25cqw dotted rgba(90,59,46,.35); }
.ap-facts dt { font: 800 2.15cqw/1.2 var(--ap-sans), sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #A9733A; }
.ap-facts dd { margin: 0; font: 400 3.7cqw/1.2 var(--ap-serif), serif; color: #3A2418; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ap-certFoot { display: grid; grid-template-columns: 1fr 23cqw; gap: 4.5cqw; align-items: end; margin-top: 4.6cqw; }
.ap-sigLine { text-align: left; min-width: 0; }
.ap-sigInk { position: relative; height: 16cqw; border-bottom: .3cqw solid rgba(74,47,34,.65); }
.ap-sigCanvas { position: absolute; left: -2cqw; right: -2cqw; top: -5cqw; bottom: 0; width: calc(100% + 4cqw); height: calc(100% + 5cqw); touch-action: none; cursor: crosshair; z-index: 2; }
.ap-cert.is-signing .ap-sigInk { background: linear-gradient(180deg, rgba(233,192,138,0), rgba(233,192,138,.28)); animation: ap-sigGlow 2.2s ease-in-out infinite; }
.ap-cert.is-signing .ap-sigInk::before { content: "✕"; position: absolute; left: .6cqw; bottom: 1cqw; font: 400 4cqw/1 var(--ap-serif), serif; color: rgba(74,47,34,.45); }
@keyframes ap-sigGlow { 50% { box-shadow: 0 .6cqw 0 -.2cqw rgba(183,136,76,.6); } }
.ap-sigLabel { display: block; margin-top: 1.4cqw; font: 800 1.9cqw/1.2 var(--ap-sans), sans-serif; letter-spacing: .16em; text-transform: uppercase; color: rgba(90,59,46,.6); }
.ap-sigImg { position: absolute; inset: -5cqw -2cqw 0; width: calc(100% + 4cqw); height: calc(100% + 5cqw); object-fit: contain; object-position: 50% 100%; }
.ap-sigTyped { position: absolute; left: 0; right: 0; bottom: 1cqw; font: italic 400 7cqw/1 var(--ap-serif), serif; color: #1F2F5C; }
.ap-sealSpot { position: relative; width: 23cqw; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%; }
.ap-sealEmpty { display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%; border: .35cqw dashed rgba(90,59,46,.35);
  font: 800 2.2cqw/1 var(--ap-sans), sans-serif; letter-spacing: .3em; text-indent: .3em; text-transform: uppercase; color: rgba(90,59,46,.45);
  box-shadow: 0 0 calc(var(--hp, 0) * 9cqw) calc(var(--hp, 0) * 2cqw) rgba(233,180,100, calc(var(--hp, 0) * .85)), inset 0 0 calc(var(--hp, 0) * 6cqw) rgba(233,180,100, calc(var(--hp, 0) * .7)); }
.ap-sealSpot.is-pressing .ap-sealEmpty { transform: scale(calc(1 - var(--hp, 0) * .06)); }
.ap-goldSeal { position: absolute; inset: -10%; display: grid; place-items: center; clip-path: ${TEETH};
  background: radial-gradient(circle at 34% 28%, rgba(255,250,225,.9), rgba(255,250,225,0) 34%),
    conic-gradient(from 200deg, #8A5E22, #E9C27A, #FFF0C4, #C9963F, #7E561E, #D9AE60, #FFEBB5, #A9762F, #8A5E22);
  filter: drop-shadow(0 .6cqw .6cqw rgba(60,30,5,.45)); animation: ap-emboss .9s cubic-bezier(.2,.9,.25,1) backwards; }
.ap-goldSeal svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.ap-sealRim { fill: none; stroke: rgba(110,72,20,.55); stroke-width: .9; }
.ap-sealRing { font: 800 7.4px var(--ap-sans), sans-serif; letter-spacing: 1.2px; fill: rgba(100,64,16,.72); }
.ap-goldSeal b { position: relative; font: 400 8.6cqw/1 var(--ap-serif), serif; color: #FFF3D6; text-shadow: 0 -.25cqw 0 rgba(110,70,15,.7), 0 .25cqw 0 rgba(255,255,255,.5); }
@keyframes ap-emboss { 0% { opacity: 0; transform: scale(1.9) rotate(-30deg); } 55% { opacity: 1; transform: scale(.92) rotate(0); } 78% { transform: scale(1.04); } 100% { transform: scale(1); } }
.ap-stampCert { position: absolute; z-index: 4; right: 7%; top: 50.5%; padding: 1.2cqw 3.4cqw 1.5cqw; border-width: .9cqw; border-radius: 1.8cqw; color: #A82A2A;
  font-size: 7.4cqw; opacity: 0; transform: rotate(-14deg); pointer-events: none; }
.ap-cert.is-stamped .ap-stampCert { animation: ap-stamp .55s cubic-bezier(.2,.9,.3,1.15) forwards; }
@keyframes ap-stamp { 0% { opacity: 0; transform: rotate(-4deg) scale(2.6); } 55% { opacity: 1; transform: rotate(-14deg) scale(.93); } 100% { opacity: 1; transform: rotate(-14deg) scale(1); } }
.ap-cert.is-stamped { animation: ap-thud .4s ease-out .22s; }
@keyframes ap-thud { 30% { translate: 0 3px; } }
.ap-footAdopt { min-height: 132px; align-content: center; padding-top: 14px; }
.ap-sigTools { min-height: 44px; display: flex; justify-content: center; }
.ap-press { all: unset; cursor: pointer; display: grid; justify-items: center; gap: 10px; padding: 6px 18px 4px; touch-action: none; -webkit-touch-callout: none;
  font: 700 11px/1 var(--ap-sans), sans-serif; letter-spacing: .26em; text-transform: uppercase; color: rgba(245,238,226,.85); animation: ap-rise 1s cubic-bezier(.22,1,.36,1) backwards; }
.ap-press svg { overflow: visible; transition: transform .3s cubic-bezier(.22,1,.36,1); }
.ap-press.is-holding svg { transform: scale(1.1); }
.ap-press:focus-visible { outline: 2px solid #E9C08A; outline-offset: 4px; border-radius: 12px; }
.ap-pressTrack { fill: none; stroke: rgba(245,238,226,.22); stroke-width: 1.2; }
.ap-pressFill { fill: none; stroke: #E9C08A; stroke-width: 2.4; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 32px 32px; filter: drop-shadow(0 0 5px rgba(233,192,138,.85)); }
.ap-pressDot { fill: #F3D79B; filter: drop-shadow(0 0 8px rgba(255,214,150,.9)); animation: ap-pulse 2.2s ease-in-out infinite; }
.ap-adopted { display: grid; justify-items: center; gap: 14px; animation: ap-rise 1.2s cubic-bezier(.22,1,.36,1) .9s backwards; }

/* the end */
.ap-ending { justify-content: flex-start; }
.ap-ending .ap-head { gap: 14px; }
.ap-cardWrap { position: relative; margin: 26px auto 26px; animation: ap-rise 1.3s cubic-bezier(.22,1,.36,1) .5s backwards; }
.ap-certMini .ap-stampCert { animation-delay: 1.4s !important; }
.ap-certMini .ap-goldSeal { animation-delay: 1.1s; }
.ap-cardSticker { position: absolute; top: -20px; right: -16px; z-index: 5; }
.ap-cardBear { position: absolute; left: -38px; top: -50px; z-index: 6; pointer-events: none; transform: rotate(-10deg); }
.ap-endActions { display: grid; justify-items: center; }
.ap-endMore { display: grid; gap: 30px; width: min(440px, 100%); margin-top: 34px; padding-bottom: 20px; }
.ap-ps { display: grid; justify-items: center; gap: 14px; text-align: center; }
.ap-wax { all: unset; cursor: pointer; position: relative; width: 74px; height: 74px; display: grid; place-items: center; transition: height .8s ease .6s; }
.ap-wax:focus-visible { outline: 2px solid #E9C08A; outline-offset: 4px; border-radius: 50%; }
.ap-waxL, .ap-waxR { position: absolute; inset: 0; border-radius: 50%; transition: transform .7s cubic-bezier(.22,1,.36,1), opacity .7s ease;
  background: radial-gradient(circle at 36% 30%, #D2584E, #9B2626 55%, #6A1515); box-shadow: 0 4px 10px rgba(0,0,0,.5), inset 0 -3px 5px rgba(0,0,0,.3); }
.ap-waxL { clip-path: polygon(0 0, 54% 0, 44% 38%, 56% 62%, 46% 100%, 0 100%); }
.ap-waxR { clip-path: polygon(54% 0, 100% 0, 100% 100%, 46% 100%, 56% 62%, 44% 38%); }
.ap-wax b { position: relative; font: italic 400 21px/1 var(--ap-serif), serif; color: #F3C7B0; text-shadow: 0 1px 0 rgba(255,255,255,.25), 0 -1px 0 rgba(0,0,0,.45); transition: opacity .4s ease; }
.ap-ps.is-open .ap-waxL { transform: translate(-16px, 6px) rotate(-22deg); opacity: 0; }
.ap-ps.is-open .ap-waxR { transform: translate(16px, 8px) rotate(24deg); opacity: 0; }
.ap-ps.is-open .ap-wax b { opacity: 0; }
.ap-ps.is-open .ap-wax { height: 0; }
.ap-psFirst { margin: 0; font: italic 400 21px/1.3 var(--ap-serif), serif; color: #FBF5EA; text-wrap: balance; }
.ap-psRest { margin: 0; font: 400 18px/1.55 var(--ap-serif), serif; white-space: pre-line; color: rgba(245,238,226,.88); animation: ap-rise 1.2s cubic-bezier(.22,1,.36,1) .3s backwards; }
.ap-reply .pm-replyH { font: 400 24px/1.15 var(--ap-serif), serif !important; color: #FBF5EA; }
.ap-reply textarea { font-family: var(--ap-serif), serif !important; font-size: 18px !important; background: rgba(245,238,226,.94) !important; color: #3A2418 !important; border-radius: 3px !important; }
.ap-reply .pm-replyBtn, .ap-reply small, .ap-reply .pm-replyDone { font-family: var(--ap-sans), sans-serif !important; font-weight: 700 !important; letter-spacing: .04em; }
.ap-endKit a, .ap-endKit button { font-family: var(--ap-sans), sans-serif !important; font-weight: 700 !important; letter-spacing: .05em; box-shadow: none !important; border-radius: 99px !important; }
.ap-endKit p { font-family: var(--ap-sans), sans-serif !important; }
.ap-credit { margin: 6px 0 0; text-align: center; font: 700 10px/1 var(--ap-sans), sans-serif; letter-spacing: .3em; text-transform: uppercase; color: rgba(245,238,226,.42); }

/* The kit's "tap to hear the song" chip sits bottom-centre from 768 up, on top of every CTA; on this page it moves
   to the free top-centre (top-left is the mute chip, top-right the editor bar). KIT-REQUESTS.md. */
@media (min-width: 768px) {
  .pm-blockedChip { bottom: auto !important; top: calc(env(safe-area-inset-top, 0px) + 14px); }
  .ap-scene { padding-left: 40px; padding-right: 40px; }
  .ap-letter { padding: 54px 60px 48px; }
  .ap-letterP { font-size: 20.5px; }
  .ap-certStage { width: min(420px, 100%, calc((100svh - var(--vw-top-space, 0px) - 300px) / 1.4)); }
}
@media (min-width: 1100px) {
  .ap-display { font-size: clamp(56px, 4.6vw, 80px); }
  .ap-displaySm { font-size: clamp(40px, 3.4vw, 56px); }
  .ap-pool { width: 520px; height: 520px; margin: -260px 0 0 -260px; }
  .ap-ending { --ap-cardW: 380px; }
  .ap-ending .ap-cardWrap { margin-top: 56px; }
}
@media (max-height: 720px) {
  .ap-display { font-size: clamp(32px, 9vw, 52px); }
  .ap-foot { min-height: 120px; }
}
@media (prefers-reduced-motion: reduce) {
  .ap-tagWrap, .ap-pulse, .ap-pressDot, .ap-cert.is-signing .ap-sigInk { animation: none !important; }
  .ap-bear, .ap-wovenTag, .ap-bubble, .ap-fold, .ap-cardWrap, .ap-adopted, .ap-psRest, .ap-press { animation: ap-fade .3s backwards !important; }
  .ap-labelInner { transition-duration: .01s; }
  .ap-goldSeal { animation: ap-fade .3s backwards !important; }
  .ap-cert.is-stamped .ap-stampCert { animation: none !important; opacity: .9; }
  .ap-cert.is-stamped, .ap-certStage.is-rising { animation: none !important; }
}
`;
