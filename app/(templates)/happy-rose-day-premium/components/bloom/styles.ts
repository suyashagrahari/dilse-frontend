// "The Bloom of Us": one stylesheet for every scene. Palette (research §D.1): garnet #7A1E2C, rose #C8475B,
// blush #F2D4D2, vellum #F6F0E6, gold line #C9A45C. Type: Cormorant Garamond (display, letter) + Jost (UI).
// Easing: cubic-bezier(.22,1,.36,1) in, faster out. Transforms + opacity only for anything that loops.

import { GOLD_ROSE_CSS } from "./GoldRose";
import { PETAL_MASK, ROSE_CSS } from "./PhotoRose";

const FIBRE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.9 .06' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .18  0 0 0 .09 0'/></filter><rect width='220' height='220' filter='url(#f)'/></svg>`,
)}")`;
const MOTTLE = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='.012' numOctaves='3' seed='3'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .3  0 0 0 .1 0'/></filter><rect width='300' height='300' filter='url(#m)'/></svg>`,
)}")`;
const PAPER = `${FIBRE}, ${MOTTLE}, linear-gradient(180deg, #F8F2E8, #F1E8DA)`;

export const BLOOM_CSS = `
${ROSE_CSS}
${GOLD_ROSE_CSS}
.rb-root { position: relative; min-height: 100svh; color: #F6F0E6; font-family: var(--rb-sans), system-ui, sans-serif; background: #0C0406; }
.rb-root figcaption { font-family: var(--rb-serif), Georgia, serif !important; }
.rb-stage { position: relative; z-index: 2; height: 100svh; }
.rb-scene { position: absolute; inset: 0; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
  display: flex; flex-direction: column; align-items: center;
  padding: calc(var(--vw-top-space, 0px) + 66px) 24px calc(22px + env(safe-area-inset-bottom, 0px)); }
.rb-scene::-webkit-scrollbar { display: none; }

/* type */
.rb-head { flex-shrink: 0; position: relative; z-index: 3; display: grid; justify-items: center; gap: 14px; text-align: center; width: 100%; max-width: 620px; min-height: 132px; align-content: start; }
.rb-headTight { min-height: 0 !important; gap: 8px; margin-bottom: 18px; }
.rb-headIn { display: grid; justify-items: center; gap: 14px; }
.rb-eyebrow { margin: 0; font: 500 11px/1.2 var(--rb-sans), sans-serif; letter-spacing: .34em; text-transform: uppercase; color: #E3C27E; }
.rb-display { margin: 0; font: italic 400 clamp(36px, 10vw, 66px)/1.02 var(--rb-serif), Georgia, serif; letter-spacing: -.012em;
  color: #FBF4EA; text-wrap: balance; max-width: 11.5em; text-shadow: 0 2px 30px rgba(0,0,0,.4); }
.rb-hint { margin: 0; font: 500 11px/1 var(--rb-sans), sans-serif; letter-spacing: .3em; text-transform: uppercase; color: rgba(246,240,230,.7); }
.rb-fadeIn { animation: rb-fade 1.2s cubic-bezier(.22,1,.36,1) backwards; }
@keyframes rb-fade { from { opacity: 0; } }
@keyframes rb-rise { from { opacity: 0; transform: translateY(14px); } }

/* I + II: the rose */
.rb-bloom { justify-content: space-between; overflow: hidden; padding-bottom: calc(52px + env(safe-area-inset-bottom, 0px)); }
@media (min-width: 768px) { .rb-bloom { padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px)); } }
.rb-roseBox { position: relative; flex: 1 1 auto; width: 100%; min-height: 300px; touch-action: none; -webkit-touch-callout: none; cursor: grab; }
.rb-bloom.is-open .rb-roseBox { cursor: default; }
.rb-roseBox > .rb-rose { position: absolute; inset: 0; }
.rb-beat { position: absolute; left: 50%; top: 58%; width: 300px; height: 300px; margin: -150px 0 0 -150px; border-radius: 50%; pointer-events: none; opacity: 0;
  background: radial-gradient(circle, rgba(var(--glow), .5), rgba(var(--glow), 0) 62%); }
.rb-beat.is-on { animation: rb-beat .7s cubic-bezier(.22,1,.36,1); }
@keyframes rb-beat { 0% { opacity: 0; transform: scale(.7); } 25% { opacity: 1; } 100% { opacity: 0; transform: scale(1.35); } }
.rb-foot { position: relative; z-index: 3; min-height: 168px; width: 100%; display: grid; place-items: center; align-content: end; gap: 12px; text-align: center; }
.rb-hold { all: unset; cursor: pointer; display: grid; justify-items: center; gap: 10px; padding: 6px 18px 4px; touch-action: none; -webkit-touch-callout: none;
  font: 500 11px/1 var(--rb-sans), sans-serif; letter-spacing: .3em; text-transform: uppercase; color: rgba(246,240,230,.82); animation: rb-rise 1.2s cubic-bezier(.22,1,.36,1) 1.4s backwards; }
.rb-hold svg { overflow: visible; transition: transform .3s cubic-bezier(.22,1,.36,1); }
.rb-hold.is-holding svg { transform: scale(1.1); }
.rb-hold:focus-visible { outline: 2px solid #E3C27E; outline-offset: 4px; border-radius: 12px; }
.rb-holdTrack { fill: none; stroke: rgba(246,240,230,.2); stroke-width: 1.2; }
.rb-holdFill { fill: none; stroke: #E3C27E; stroke-width: 2; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 32px 32px; filter: drop-shadow(0 0 5px rgba(227,194,126,.8)); }
.rb-holdDot { fill: #F3DDA8; filter: drop-shadow(0 0 8px rgba(255,214,150,.9)); animation: rb-dot 2.4s ease-in-out infinite; transform-origin: 32px 32px; }
.rb-hold.is-holding .rb-holdDot { animation: none; }
@keyframes rb-dot { 50% { opacity: .55; } }
.rb-meaning { display: grid; justify-items: center; gap: 8px; max-width: 26em; animation: rb-rise 1.3s cubic-bezier(.22,1,.36,1) backwards; }
.rb-meaningLine { margin: 0; font: italic 400 21px/1.3 var(--rb-serif), Georgia, serif; color: #FBF4EA; text-wrap: balance; }
.rb-meaningSub { margin: 0; font: 400 15px/1.3 var(--rb-serif), Georgia, serif; color: rgba(246,240,230,.62); }
.rb-ctaRow { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; }

/* III: pressed pages */
.rb-count { margin: 0; font: italic 400 22px/1 var(--rb-serif), serif; color: #FBF4EA; }
.rb-count span { opacity: .45; }
.rb-pages { justify-content: flex-start; }
.rb-page { display: grid; justify-items: center; gap: 22px; width: 100%; animation: rb-pageIn 1.1s cubic-bezier(.22,1,.36,1) backwards; }
.rb-page.is-reduced { animation: rb-fade .3s backwards; }
@keyframes rb-pageIn { from { opacity: 0; transform: translate(40px, 12px) rotate(4deg); } }
.rb-paper { position: relative; width: min(332px, 84vw); padding: 16px 16px 10px; border-radius: 2px; color: #3A1A1F; transform: rotate(-1.1deg);
  background: ${PAPER}; box-shadow: 0 40px 70px -30px rgba(0,0,0,.85), 0 14px 24px -14px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.35); }
.rb-mat { position: relative; border-radius: 1px; box-shadow: 0 1px 2px rgba(60,30,20,.35), 0 0 0 1px rgba(60,30,20,.08); overflow: hidden; }
.rb-pageText { min-height: 92px; padding: 14px 6px 8px; text-align: center; opacity: 0; transform: translateY(6px); transition: opacity 1s ease .55s, transform 1s cubic-bezier(.22,1,.36,1) .55s; }
.rb-pageText.is-on { opacity: 1; transform: none; }
.rb-pageCap { margin: 0; font: italic 500 23px/1.15 var(--rb-serif), serif; text-wrap: balance; }
.rb-pageNote { margin: 7px 0 0; font: 400 16.5px/1.38 var(--rb-serif), serif; color: rgba(58,26,31,.72); text-wrap: pretty; }
.rb-vellum { all: unset; box-sizing: border-box; position: absolute; inset: 6px; cursor: grab; touch-action: none; -webkit-touch-callout: none; border-radius: 1px;
  display: grid; place-items: end center; padding-bottom: 26px;
  background: ${FIBRE}, linear-gradient(180deg, rgba(251,247,240,.66), rgba(246,240,230,.54));
  -webkit-backdrop-filter: blur(7px) saturate(.8) brightness(1.04); backdrop-filter: blur(7px) saturate(.8) brightness(1.04);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 10px 22px -12px rgba(0,0,0,.35);
  transform-origin: 50% 0; transform: perspective(900px) rotateX(calc(var(--p) * -64deg)) translateY(calc(var(--p) * -6%));
  transition: transform .55s cubic-bezier(.22,1,.36,1), opacity .5s ease; }
.rb-vellum.is-drag { transition: none; }
.rb-vellum.is-lifted { transform: perspective(900px) rotateX(-90deg) translateY(-12%); opacity: 0; pointer-events: none;
  transition: transform 1.2s cubic-bezier(.22,1,.36,1), opacity .9s ease .25s; }
.rb-vellum:focus-visible { outline: 2px solid #8E1426; outline-offset: 3px; }
.rb-vellumMark { position: absolute; top: 18px; left: 0; right: 0; text-align: center; font: italic 400 16px/1 var(--rb-serif), serif; color: rgba(58,26,31,.5); }
.rb-vellumHint { display: grid; justify-items: center; gap: 8px; font: 500 10.5px/1 var(--rb-sans), sans-serif; letter-spacing: .34em; text-transform: uppercase; color: rgba(58,26,31,.62); }
.rb-vellumHint i { width: 9px; height: 9px; border-left: 1.5px solid currentColor; border-top: 1.5px solid currentColor; transform: rotate(45deg); animation: rb-nudge 1.8s ease-in-out infinite; }
@keyframes rb-nudge { 50% { transform: translateY(-5px) rotate(45deg); } }
.rb-pageNext { min-height: 64px; display: grid; place-items: center; opacity: 0; transition: opacity .8s ease 1.2s; }
.rb-pageNext.is-on { opacity: 1; }

/* IV: the letter */
.rb-letterScene { justify-content: flex-start; }
.rb-letterStage { width: 100%; display: grid; justify-items: center; perspective: 1300px; perspective-origin: 50% 0%; }
.rb-letter { position: relative; box-sizing: border-box; width: min(580px, 100%); min-height: 64svh; padding: 46px 28px 44px; border-radius: 2px; overflow: hidden;
  color: #3A1A1F; background: ${PAPER}; box-shadow: 0 50px 80px -40px rgba(0,0,0,.9), 0 18px 30px -18px rgba(0,0,0,.6);
  transform-origin: 50% 100%; transform: rotateX(56deg) translateY(10%) scale(.9); cursor: pointer; transition: transform 1.5s cubic-bezier(.22,1,.36,1); }
.rb-letter.is-open { transform: none; cursor: default; }
.rb-letter.is-reduced { transition-duration: .2s; }
.rb-letter:focus-visible { outline: 2px solid #E3C27E; outline-offset: 4px; }
.rb-letterCover { min-height: 52svh; display: grid; place-content: center; justify-items: center; gap: 4px; text-align: center; }
.rb-letterFor { margin: 0; font: 500 11px/1 var(--rb-sans), sans-serif; letter-spacing: .34em; text-transform: uppercase; color: rgba(58,26,31,.55); }
.rb-letterName { margin: 6px 0 0; font: italic 400 clamp(48px, 13vw, 72px)/1 var(--rb-serif), serif; color: #3A1A1F; }
.rb-letterTap { margin: 30px 0 0; font: 500 10.5px/1 var(--rb-sans), sans-serif; letter-spacing: .32em; text-transform: uppercase; color: #8E1426; animation: rb-dot 2.4s ease-in-out infinite; }
.rb-letterBody { position: relative; }
.rb-letterP { margin: 0 0 1.05em; font: 400 20px/1.56 var(--rb-serif), Georgia, serif; font-feature-settings: "liga", "onum"; text-wrap: pretty; color: #3A1A1F; }
.rb-letterP.is-first { font-style: italic; font-size: 23px; }
.rb-letterP p { white-space: pre-line; }
.rb-shayari { margin: 1.5em auto; max-width: 22em; font: italic 400 19px/1.5 var(--rb-serif), serif; text-align: center; white-space: pre-line; color: #8E1426; }
.rb-signOff { margin: 1.4em 0 0; font: italic 500 25px/1.2 var(--rb-serif), serif; text-align: right; color: #3A1A1F; }
.rb-pressed { position: absolute; pointer-events: none; -webkit-mask: ${PETAL_MASK} center / 100% 100% no-repeat; mask: ${PETAL_MASK} center / 100% 100% no-repeat;
  background: repeating-conic-gradient(from -40deg at 50% 100%, transparent 0 4deg, rgba(50,0,10,.28) 4.6deg 5deg, transparent 5.4deg 9deg),
    radial-gradient(90% 55% at 50% 4%, var(--light), transparent 70%), radial-gradient(60% 40% at 50% 100%, var(--deep), transparent 100%), var(--base);
  mix-blend-mode: multiply; filter: saturate(.75); }
.rb-pressedA { right: 16px; top: 18px; width: 70px; height: 86px; opacity: .34; transform: rotate(28deg); }
.rb-pressedB { right: 74px; top: 58px; width: 34px; height: 42px; opacity: .26; transform: rotate(-24deg); }
.rb-footFlow { min-height: 0; padding: 30px 0 12px; align-content: center; }

/* V: voice */
.rb-voice { justify-content: space-between; overflow: hidden; }
.rb-voiceBg { position: absolute; inset: 0; z-index: 0; }
.rb-voiceBg::after { content: ""; position: absolute; inset: 0; background: radial-gradient(90% 55% at 50% 50%, rgba(12,4,6,.62), rgba(12,4,6,.38) 100%), linear-gradient(180deg, rgba(12,4,6,.7), rgba(12,4,6,.2) 35%, rgba(12,4,6,.9)); }
.rb-voice > header, .rb-voice > footer, .rb-voiceMid { position: relative; z-index: 1; }
.rb-voiceMid { flex: 1; display: grid; place-content: center; justify-items: center; gap: 18px; width: min(440px, 100%); text-align: center; }
.rb-voiceFrom { margin: 0; font: italic 400 30px/1 var(--rb-serif), serif; color: #FBF4EA; }
.rb-voicePlayer { width: 100%; }
.rb-voiceCap { margin: 0; font: italic 400 20px/1.35 var(--rb-serif), serif; color: rgba(246,240,230,.86); text-wrap: balance; }
.rb-quote { margin: 0; display: grid; gap: 22px; justify-items: center; }
.rb-quoteText { margin: 0; font: italic 400 clamp(30px, 8.4vw, 50px)/1.12 var(--rb-serif), serif; color: #FBF4EA; text-wrap: balance; text-shadow: 0 2px 24px rgba(0,0,0,.5); }
.rb-quote figcaption { font: 500 11px/1 var(--rb-sans), sans-serif !important; letter-spacing: .34em; text-transform: uppercase; color: #E3C27E; }
.rb-quote figcaption::before { content: "— "; }

/* the end */
.rb-ending { justify-content: flex-start; }
.rb-displayEnd { font-size: clamp(34px, 9.2vw, 58px); }
.rb-cardWrap { position: relative; margin: 26px 0 24px; animation: rb-rise 1.4s cubic-bezier(.22,1,.36,1) .6s backwards; }
.rb-card { display: grid; justify-items: center; gap: 10px; padding: 16px 16px 20px; color: #3A1A1F; background: ${PAPER};
  box-shadow: inset 0 0 0 1px rgba(201,164,92,.7), inset 0 0 0 6px #F6F0E6, inset 0 0 0 7px rgba(201,164,92,.5); }
.rb-arch { position: relative; width: 100%; aspect-ratio: 4 / 4.7; border-radius: 999px 999px 3px 3px; overflow: hidden; box-shadow: 0 0 0 1px rgba(201,164,92,.7); }
.rb-archVelvet { position: absolute; inset: 0; background: radial-gradient(80% 60% at 50% 30%, #D2425A, #8E1426 60%, #3F0611); }
.rb-cardNames { margin: 6px 0 0; font: italic 500 29px/1.05 var(--rb-serif), serif; text-align: center; text-wrap: balance; }
.rb-cardNames span { font-style: normal; color: #8E1426; }
.rb-cardSince { margin: 0; font: 500 10px/1 var(--rb-sans), sans-serif; letter-spacing: .32em; text-transform: uppercase; color: #8A6A2F; }
.rb-cardSticker { position: absolute; right: -16px; top: -20px; z-index: 2; }
.rb-endActions { display: grid; place-items: center; min-height: 60px; }
.rb-endMore { width: min(440px, 100%); display: grid; gap: 26px; padding-top: 48px; }
.rb-ps { display: grid; justify-items: center; gap: 14px; text-align: center; padding: 30px 22px 26px; border-radius: 3px;
  background: linear-gradient(180deg, rgba(246,240,230,.07), rgba(246,240,230,.03)); border: 1px solid rgba(246,240,230,.12); }
.rb-seal { all: unset; position: relative; width: 78px; height: 78px; cursor: pointer; display: grid; place-items: center; border-radius: 50%; -webkit-tap-highlight-color: transparent; }
.rb-seal:focus-visible { outline: 2px solid #E3C27E; outline-offset: 4px; }
.rb-sealL, .rb-sealR { position: absolute; inset: 0; border-radius: 47% 53% 50% 50% / 52% 48% 52% 48%;
  background: radial-gradient(circle at 34% 30%, #D45566, #8E1426 52%, #4A0812 100%);
  box-shadow: inset 0 -4px 0 rgba(0,0,0,.28), inset 0 3px 2px rgba(255,255,255,.18), 0 6px 14px -4px rgba(0,0,0,.6);
  transition: transform 1s cubic-bezier(.22,1,.36,1), opacity .8s ease .3s; }
.rb-sealL { clip-path: polygon(0 0, 54% 0, 44% 38%, 56% 62%, 46% 100%, 0 100%); }
.rb-sealR { clip-path: polygon(54% 0, 100% 0, 100% 100%, 46% 100%, 56% 62%, 44% 38%); }
.rb-seal b { position: relative; font: italic 600 20px/1 var(--rb-serif), serif; color: #F3C7B0; text-shadow: 0 1px 0 rgba(255,255,255,.25), 0 -1px 0 rgba(0,0,0,.45); transition: opacity .4s ease; }
.rb-ps.is-open .rb-sealL { transform: translate(-16px, 6px) rotate(-22deg); opacity: 0; }
.rb-ps.is-open .rb-sealR { transform: translate(16px, 8px) rotate(24deg); opacity: 0; }
.rb-ps.is-open .rb-seal b { opacity: 0; }
.rb-ps.is-open .rb-seal { height: 0; transition: height .8s ease .6s; }
.rb-psFirst { margin: 0; font: italic 400 22px/1.3 var(--rb-serif), serif; color: #FBF4EA; text-wrap: balance; }
.rb-psRest { margin: 0; font: 400 18.5px/1.55 var(--rb-serif), serif; white-space: pre-line; color: rgba(246,240,230,.88); animation: rb-rise 1.2s cubic-bezier(.22,1,.36,1) .3s backwards; }
.rb-reply .pm-replyH { font: italic 500 24px/1.15 var(--rb-serif), serif !important; color: #FBF4EA; }
.rb-reply textarea { font-family: var(--rb-serif), serif !important; font-size: 18px !important; background: rgba(246,240,230,.92) !important; border-radius: 3px !important; }
.rb-reply .pm-replyBtn, .rb-reply small, .rb-reply .pm-replyDone { font-family: var(--rb-sans), sans-serif !important; font-weight: 500 !important; letter-spacing: .04em; }
.rb-endKit a, .rb-endKit button { font-family: var(--rb-sans), sans-serif !important; font-weight: 500 !important; letter-spacing: .06em; box-shadow: none !important; border-radius: 99px !important; }
.rb-endKit p { font-family: var(--rb-sans), sans-serif !important; }
.rb-credit { margin: 6px 0 0; text-align: center; font: 500 10px/1 var(--rb-sans), sans-serif; letter-spacing: .3em; text-transform: uppercase; color: rgba(246,240,230,.42); }

/* the lifted petal */
.rb-lb { position: fixed; inset: 0; z-index: 110; display: grid; place-items: center; align-content: center; gap: 14px; padding: 24px;
  background: rgba(10,3,6,.74); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); animation: rb-fade .45s ease; }
.rb-lbIn { display: grid; justify-items: center; animation: rb-lift .7s cubic-bezier(.22,1,.36,1); }
@keyframes rb-lift { from { opacity: 0; transform: scale(.82) translateY(30px); } }
.rb-lbNote { margin: 18px auto 0; max-width: 300px; font: italic 400 19px/1.4 var(--rb-serif), serif; text-align: center; color: #F6F0E6; text-wrap: balance; }
.rb-lbClose { all: unset; cursor: pointer; padding: 14px 18px; font: 500 10.5px/1 var(--rb-sans), sans-serif; letter-spacing: .32em; text-transform: uppercase; color: rgba(246,240,230,.72); }
.rb-lbClose:focus-visible { outline: 2px solid #E3C27E; outline-offset: 2px; }

/* the gate (the kit's PremiumGate, dressed) */
.rb-gate .pm-gateIn { gap: 12px; }
.rb-gate .pm-gateKick { font: 500 11px/1.2 var(--rb-sans), sans-serif !important; letter-spacing: .34em; color: #E3C27E; opacity: .95; }
.rb-gate .pm-gateName, .rb-gate .pm-gateName * { font-family: var(--rb-serif), Georgia, serif !important; font-style: italic !important; font-weight: 400 !important; }
.rb-gate .pm-gateName { font-size: clamp(56px, 16vw, 104px) !important; line-height: 1 !important; letter-spacing: -.01em; }
.rb-gate .pm-gateSub { font: italic 400 18px/1.3 var(--rb-serif), serif !important; opacity: .72; }
.rb-gate .pm-gateArt { width: min(250px, 58vw); max-height: 36vh; animation: none; }
.rb-gate .pm-gateCta { font: 500 13px/1 var(--rb-sans), sans-serif !important; letter-spacing: .2em; text-transform: uppercase; min-height: 54px; padding: 14px 34px;
  background: linear-gradient(135deg, #FFF1C9, #E3C27E 45%, #9C7834); color: #2A1806; }
.rb-gate .pm-seal { background: rgba(246,240,230,.06); font-family: var(--rb-sans), sans-serif; font-weight: 500; letter-spacing: .04em; }
.rb-gate .pm-quiet { font-family: var(--rb-sans), sans-serif; font-weight: 500; opacity: .6; }
.rb-gate .pm-bar { background: #050203; }

@media (min-width: 768px) {
  .rb-scene { padding-left: 40px; padding-right: 40px; }
  .rb-head { min-height: 150px; }
  .rb-letter { padding: 64px 64px 56px; }
  .rb-letterP { font-size: 21.5px; }
}
@media (min-width: 1100px) {
  .rb-display { font-size: clamp(54px, 4.6vw, 76px); }
  .rb-paper { width: 360px; }
}
@media (max-width: 767px) { .rb-bloom.is-bud { padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px)); } }
/* Desktop: the rose gets the whole height on the right, the words sit on the left third. */
@media (min-width: 1100px) {
  .rb-bloom { display: grid; grid-template-columns: minmax(360px, .85fr) 1.3fr; grid-template-rows: 1fr auto; column-gap: 3vw; align-items: stretch;
    padding: calc(var(--vw-top-space, 0px) + 72px) 7vw 40px; }
  .rb-bloom .rb-head { grid-column: 1; grid-row: 1; align-self: end; justify-items: start; text-align: left; min-height: 0; max-width: 520px; }
  .rb-bloom .rb-headIn { justify-items: start; }
  .rb-bloom .rb-display { text-align: left; font-size: clamp(56px, 4.8vw, 84px); }
  .rb-bloom .rb-foot { grid-column: 1; grid-row: 2; align-self: start; justify-items: start; text-align: left; align-content: start; min-height: 240px; padding-top: 34px; }
  .rb-bloom .rb-meaning { justify-items: start; }
  .rb-bloom .rb-meaningLine { font-size: 23px; }
  .rb-bloom .rb-ctaRow { justify-content: flex-start; }
  .rb-bloom .rb-hold { justify-items: start; padding-left: 0; }
  .rb-bloom .rb-roseBox { grid-column: 2; grid-row: 1 / span 2; min-height: 0; }
}
@media (max-height: 700px) {
  .rb-head { min-height: 104px; }
  .rb-display { font-size: clamp(30px, 8.6vw, 54px); }
  .rb-foot { min-height: 140px; }
}
@media (prefers-reduced-motion: reduce) {
  .rb-fadeIn, .rb-hold, .rb-meaning, .rb-cardWrap, .rb-psRest, .rb-lb, .rb-lbIn { animation: rb-fade .3s backwards !important; }
  .rb-vellumHint i, .rb-letterTap, .rb-holdDot { animation: none; }
  .rb-beat.is-on { animation: none; }
}
`;
