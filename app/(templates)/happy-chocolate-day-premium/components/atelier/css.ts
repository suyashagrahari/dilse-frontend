// All the atelier's CSS (one <style>, "mc-" prefix). Transforms + opacity for
// motion; every loop stops under prefers-reduced-motion.

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.6'/></svg>\")";

const MARBLE =
  "linear-gradient(115deg, transparent 0 30%, rgba(150,140,130,.22) 31%, transparent 33% 60%, rgba(150,140,130,.16) 61.5%, transparent 63%), linear-gradient(160deg, transparent 0 45%, rgba(120,110,100,.18) 46%, transparent 48%), linear-gradient(180deg, #F7F1EA, #E6DCD0)";

export const ATELIER_CSS = `
/* ── backdrop ── */
.mc-bd { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; background: #140A06; }
.mc-wall { position: absolute; inset: 0; transition: filter 1.1s ease;
  background:
    radial-gradient(60% 50% at 50% 30%, rgba(255,190,120,.14), transparent 70%),
    repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 2px, transparent 2px 64px),
    linear-gradient(180deg, #3A2016 0%, #2A1710 55%, #1C0F09 100%); }
.mc-wall::after { content: ""; position: absolute; left: 0; right: 0; bottom: 14vh; height: 22vh; border-top: 3px solid rgba(230,184,92,.25);
  background: repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 3px, transparent 3px 90px), linear-gradient(180deg, #4A2A1C, #2E190F); }
.mc-bd[data-lit="0"] .mc-wall { filter: brightness(.28) saturate(.7); }
.mc-bd[data-lit="1"] .mc-wall { filter: brightness(.5); }
.mc-bd[data-lit="2"] .mc-wall { filter: brightness(.75); }
.mc-window { position: absolute; top: 12vh; left: 4vw; width: clamp(96px, 20vw, 300px); height: clamp(150px, 30vh, 380px); border: 8px solid #2A160D;
  border-radius: 999px 999px 6px 6px; overflow: hidden; box-shadow: 0 0 0 2px rgba(230,184,92,.25), 0 20px 40px -20px #000; }
.mc-windowGlass { position: absolute; inset: 0; background: radial-gradient(80% 60% at 70% 20%, #2c3a66, #10162e 70%); }
.mc-windowBars { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 48%, #2A160D 48% 52%, transparent 52%), linear-gradient(180deg, transparent 55%, #2A160D 55% 58%, transparent 58%); }
.mc-rain { position: absolute; inset: -40px 0 0; opacity: .55;
  background-image: repeating-linear-gradient(100deg, transparent 0 9px, rgba(190,210,255,.35) 9px 10px, transparent 10px 23px),
    repeating-linear-gradient(97deg, transparent 0 15px, rgba(190,210,255,.22) 15px 16px, transparent 16px 37px);
  background-size: 100% 120px, 100% 170px; animation: mc-rain .7s linear infinite; }
@keyframes mc-rain { to { background-position: -14px 120px, -20px 170px; } }
.mc-shelf { position: absolute; right: 3vw; display: flex; align-items: flex-end; gap: 10px; padding: 0 10px; border-bottom: 6px solid #4A2A1C;
  box-shadow: 0 6px 10px -6px #000; filter: blur(1.2px); opacity: .85; }
.mc-shelfA { top: 18vh; } .mc-shelfB { top: 34vh; right: 6vw; }
.mc-jar { display: block; width: 30px; height: var(--h); border-radius: 8px 8px 5px 5px; background: linear-gradient(90deg, rgba(255,255,255,.22), rgba(255,255,255,.06) 40%, rgba(255,255,255,.18)), var(--c);
  box-shadow: inset 0 -12px 0 rgba(0,0,0,.25); }
.mc-jar::before { content: ""; display: block; height: 7px; margin: -5px 3px 0; border-radius: 3px; background: #6b4632; }
.mc-lamp { position: absolute; top: 0; width: 120px; margin-left: -60px; display: grid; justify-items: center; }
.mc-lamp0 { left: 18%; } .mc-lamp1 { left: 50%; } .mc-lamp2 { left: 82%; }
.mc-cord { width: 2px; height: 7vh; background: #120804; }
.mc-shade { width: 64px; height: 30px; border-radius: 64px 64px 6px 6px; background: linear-gradient(90deg, #7a3f1f, #e09a63 40%, #f6c08f 55%, #8a4724); box-shadow: 0 6px 12px -6px #000; }
.mc-bulb { width: 22px; height: 11px; margin-top: -3px; border-radius: 0 0 22px 22px; background: #5a4030; transition: background .2s, box-shadow .2s; }
.mc-cone { position: absolute; top: calc(7vh + 34px); width: 70vw; max-width: 760px; height: 80vh; clip-path: polygon(46% 0, 54% 0, 100% 100%, 0 100%);
  background: linear-gradient(180deg, rgba(255,214,150,.30), rgba(255,200,130,.06) 70%, transparent); opacity: 0; transition: opacity .3s; mix-blend-mode: screen; }
.mc-lamp.is-on .mc-bulb { background: #fff4d6; box-shadow: 0 0 18px 6px rgba(255,214,150,.8), 0 0 60px 20px rgba(255,190,120,.35); }
.mc-lamp.is-on .mc-cone { opacity: 1; animation: mc-flicker .6s steps(1) 1; }
@keyframes mc-flicker { 0% { opacity: .2 } 20% { opacity: 1 } 35% { opacity: .3 } 50% { opacity: 1 } 62% { opacity: .55 } 75%, 100% { opacity: 1 } }
.mc-counter { position: absolute; left: -2vw; right: -2vw; bottom: 0; height: 14vh; background: ${MARBLE}; border-top: 2px solid #fff;
  box-shadow: 0 -8px 30px rgba(0,0,0,.45); filter: brightness(.82); }
.mc-bd[data-lit="0"] .mc-counter { filter: brightness(.3); }
.mc-vignette { position: absolute; inset: 0; background: radial-gradient(110% 80% at 50% 40%, transparent 45%, rgba(10,4,2,.75) 100%); }
.mc-grain { position: absolute; inset: 0; background-image: ${GRAIN}; opacity: .05; mix-blend-mode: overlay; }

/* ── page chrome ── */
.mc-scene { position: relative; z-index: 2; }
.mc-progress { position: fixed; top: 22px; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; gap: 5px; padding: 6px 9px; border-radius: 99px;
  background: rgba(30,15,8,.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mc-progress span { height: 7px; border-radius: 3px; background: rgba(255,246,234,.22); transition: width .35s, background .35s; }
.mc-progress span.is-on { background: #E6B85C; }
.mc-sec { min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 72px 16px 32px; text-align: center; color: #FFF6EA; }
.mc-head { display: grid; gap: 6px; justify-items: center; max-width: 520px; }
.mc-kick { margin: 0; font: 700 11.5px/1.2 var(--vw-font-ui), sans-serif; letter-spacing: .24em; text-transform: uppercase; color: #E6B85C; }
.mc-h { margin: 0; font: 700 clamp(25px, 7vw, 36px)/1.12 var(--vw-font-serif), serif; color: #FFF6EA; text-wrap: balance; text-shadow: 0 2px 18px rgba(0,0,0,.6); }
.mc-sub { margin: 0; min-height: 1.4em; font: 500 15px/1.45 var(--vw-font-ui), sans-serif; color: #EBD3BD; text-shadow: 0 1px 8px rgba(0,0,0,.7); }
.mc-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center; min-height: 52px; }
.mc-btn { min-height: 50px; padding: 0 24px; border-radius: 99px; border: 0; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui), sans-serif; color: #2B1A03;
  background: linear-gradient(135deg, #FFF1BF, #E2B44A 50%, #B07D22); box-shadow: 0 14px 30px -14px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.7);
  transition: transform .2s cubic-bezier(.22,1,.36,1), opacity .2s; }
.mc-btn:active { transform: scale(.96); }
.mc-btn:disabled { opacity: .55; cursor: default; }
.mc-btn.is-ghost { color: #FFF6EA; background: rgba(42,23,16,.62); border: 1px solid rgba(230,184,92,.45); box-shadow: none; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mc-btn:focus-visible, .mc-trufBtn:focus-visible, .mc-bonbon:focus-visible, .mc-heartBtn:focus-visible, .mc-ps:focus-visible { outline: 3px solid #E6B85C; outline-offset: 3px; }
.mc-stick { display: inline-flex; min-height: 0; }
.mc-stickTop { display: inline-flex; margin-bottom: 2px; }

/* ── gate ── */
.mc-gate .pm-gateArt { width: min(300px, 66vw); max-height: 40vh; aspect-ratio: .78; }
.mc-gateSub { font: 700 22px/1.2 var(--vw-font-script), cursive; color: #FFD9A0; }
.mc-door { position: relative; width: 100%; height: 100%; box-sizing: border-box; border: 10px solid #3B2418; border-bottom-width: 14px; border-radius: 999px 999px 10px 10px;
  background: #2A160D; box-shadow: 0 0 0 2px rgba(230,184,92,.35), 0 30px 60px -20px #000, inset 0 0 0 3px #1c0e07; overflow: hidden; }
.mc-doorGlass { position: absolute; inset: 6px; border-radius: 999px 999px 4px 4px; overflow: hidden; background: radial-gradient(90% 70% at 50% 30%, #2b3560, #0e1226 75%); }
.mc-doorWarm { position: absolute; inset: 0; opacity: .15; background: radial-gradient(70% 60% at 50% 60%, rgba(255,200,130,.95), rgba(200,110,50,.4) 60%, transparent); transition: opacity 1s ease; }
.pm-gate.is-opening .mc-doorWarm { opacity: 1; }
.mc-doorWord { position: absolute; top: 9%; left: 8%; width: 84%; }
.mc-doorWord text { font: 700 11.5px var(--vw-font-serif), serif; letter-spacing: 2px; fill: #E6B85C; }
.mc-signWrap { position: absolute; left: 50%; top: 30%; width: 70%; transform: translateX(-50%); display: grid; justify-items: center; perspective: 700px; }
.mc-string { width: 46%; height: 26px; border: 2px solid #c9a46a; border-bottom: 0; border-radius: 40px 40px 0 0; }
.mc-sign { position: relative; width: 100%; aspect-ratio: 1.45; transform-style: preserve-3d; transition: transform 1s cubic-bezier(.5,-0.3,.3,1.3); transform-origin: 50% 0;
  animation: mc-swing 3.4s ease-in-out infinite; }
.mc-signFace { position: absolute; inset: 0; display: grid; place-content: center; gap: 2px; border-radius: 10px; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  box-shadow: 0 10px 24px -8px rgba(0,0,0,.7), inset 0 0 0 3px rgba(255,255,255,.2); }
.mc-signFront { background: linear-gradient(160deg, #F6EEDF, #E2D2B6); color: #3B2418; }
.mc-signFront b { font: 800 clamp(22px, 7vw, 30px)/1 var(--vw-font-serif), serif; letter-spacing: .14em; color: #8E1B3F; }
.mc-signFront small { font: 600 11px/1 var(--vw-font-ui), sans-serif; letter-spacing: .2em; text-transform: uppercase; opacity: .7; margin-top: 4px; }
.mc-signFront i { font: 700 clamp(20px, 6vw, 26px)/1.1 var(--vw-font-script), cursive; font-style: normal; max-width: 90%; margin: 0 auto; overflow-wrap: anywhere; }
.mc-signBack { transform: rotateY(180deg); background: linear-gradient(160deg, #C2185B, #7E1236); color: #FFF1BF; }
.mc-signBack b { font: 800 clamp(26px, 8vw, 36px)/1 var(--vw-font-serif), serif; letter-spacing: .2em; text-shadow: 0 0 12px rgba(255,214,150,.9); }
.mc-signBack small { font: 600 12px/1 var(--vw-font-ui), sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.pm-gate.is-opening .mc-sign { animation: none; transform: rotateY(180deg); }
@keyframes mc-swing { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
.mc-handle { position: absolute; right: 9%; top: 62%; width: 10px; height: 34px; border-radius: 6px; background: linear-gradient(90deg, #8f6118, #ffe6a6, #b07d22); }

/* ── lights ── */
.mc-lightsSec { gap: 18px; }
.mc-plate { display: grid; gap: 2px; padding: 14px 30px; border-radius: 10px; color: #3B2418; opacity: 0; transform: translateY(10px); transition: opacity .8s .2s, transform .8s .2s;
  background: linear-gradient(135deg, #FFF1BF, #E2B44A 45%, #A6751C); box-shadow: 0 16px 40px -14px #000, inset 0 0 0 2px rgba(255,255,255,.35), inset 0 0 0 6px rgba(120,80,20,.35); }
.mc-plate.is-on { opacity: 1; transform: none; }
.mc-plate small { font: 700 11px/1 var(--vw-font-ui), sans-serif; letter-spacing: .3em; text-transform: uppercase; opacity: .7; }
.mc-plate b { font: 700 clamp(28px, 8vw, 40px)/1.05 var(--vw-font-serif), serif; text-shadow: 0 1px 0 rgba(255,255,255,.5); overflow-wrap: anywhere; }
.mc-plate i { font: 600 12px/1 var(--vw-font-ui), sans-serif; letter-spacing: .08em; opacity: .75; }
.mc-note { position: relative; width: min(100%, 330px); padding: 22px 22px 16px; background: #FFF6EA; color: #3B2418; border-radius: 3px; transform: rotate(-2deg) translateY(14px);
  opacity: 0; transition: opacity .8s .5s, transform .8s .5s; box-shadow: 0 18px 30px -16px #000; }
.mc-note.is-on { opacity: 1; transform: rotate(-2deg); }
.mc-note p { margin: 0; font: 700 23px/1.25 var(--vw-font-script), cursive; }
.mc-note i { display: block; margin-top: 8px; font: 500 14px/1 var(--vw-font-serif), serif; opacity: .7; }
.mc-notePin { position: absolute; top: -8px; left: 50%; width: 16px; height: 16px; margin-left: -8px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ff9ab5, #C2185B 60%, #6e0d2c); box-shadow: 0 3px 4px rgba(0,0,0,.4); }
.mc-counterSet { display: flex; gap: 14px; align-items: flex-end; opacity: 0; transition: opacity .8s .8s; }
.mc-counterSet.is-on { opacity: 1; }

/* ── make ── */
.mc-make { position: relative; width: min(100%, 320px, 31vh); }
.mc-makeSvg { display: block; width: 100%; height: auto; cursor: grab; overflow: visible; filter: drop-shadow(0 18px 24px rgba(0,0,0,.45)); }
.mc-make.is-bubbles .mc-makeSvg, .mc-make.is-ready .mc-makeSvg { cursor: pointer; }
.mc-pot { transition: opacity .6s; }
.mc-pot.is-away { opacity: 0; }
.mc-steam circle { animation: mc-steam 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.mc-steam circle:nth-child(2) { animation-delay: 1.1s; }
@keyframes mc-steam { 0% { opacity: 0; transform: translateY(4px) scale(.6); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateY(-8px) scale(1.4); } }
.mc-bub { transform-box: fill-box; transform-origin: center; animation: mc-bub 1.4s ease-in-out infinite alternate; }
@keyframes mc-bub { from { transform: translateY(1.5px); } to { transform: translateY(-1.5px) scale(1.08); } }
.mc-ring { transform-box: fill-box; transform-origin: center; animation: mc-ring .45s ease-out forwards; }
@keyframes mc-ring { from { transform: scale(.5); opacity: 1; } to { transform: scale(3.2); opacity: 0; } }
.mc-sheenSweep { animation: mc-sheen 1.6s ease-in-out .2s 2; }
@keyframes mc-sheen { from { transform: translateX(0); } to { transform: translateX(180px); } }
.mc-meter { width: 60%; height: 5px; margin: 6px auto 0; border-radius: 3px; background: rgba(255,246,234,.18); overflow: hidden; }
.mc-meter span { display: block; height: 100%; background: linear-gradient(90deg, #7B4A2E, #E6B85C); transform-origin: 0 50%; }
.mc-dial { position: absolute; top: 2%; left: 0; display: grid; justify-items: center; gap: 2px; padding: 10px 12px; border-radius: 14px; background: rgba(30,15,8,.7);
  border: 1px solid rgba(230,184,92,.4); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.mc-dialFace { position: relative; width: 54px; height: 30px; border-radius: 54px 54px 0 0; border: 3px solid #E6B85C; border-bottom: 0; box-sizing: border-box;
  background: conic-gradient(from -90deg at 50% 100%, #4aa3ff 0 60deg, #6fdc8c 60deg 120deg, #ff8a5c 120deg 180deg, transparent 180deg); }
.mc-needle { position: absolute; left: 50%; bottom: 0; width: 2px; height: 24px; margin-left: -1px; background: #FFF6EA; transform-origin: 50% 100%; transition: transform .1s linear; }
.mc-dial b { font: 700 16px/1 var(--vw-font-ui), sans-serif; color: #FFF6EA; }
.mc-dial small { font: 700 10.5px/1 var(--vw-font-ui), sans-serif; color: #6fdc8c; letter-spacing: .04em; }
.mc-outHeart { position: absolute; left: 50%; top: 38%; width: 58%; margin-left: -29%; animation: mc-demould 1.1s cubic-bezier(.3,1.6,.5,1) both; filter: drop-shadow(0 22px 26px rgba(0,0,0,.6)); }
@keyframes mc-demould { 0% { transform: translateY(0) scale(1, 1); } 25% { transform: translateY(-40%) scale(.92, 1.1); } 55% { transform: translateY(-34%) scale(1.06, .95); } 100% { transform: translateY(-36%) scale(1); } }
.mc-emboss { font: 700 13px Georgia, serif; fill: rgba(255,214,170,.5); stroke: rgba(0,0,0,.25); stroke-width: .4; letter-spacing: .5px; }

/* ── crack ── */
.mc-crack { position: relative; width: min(100%, 420px); height: calc(var(--hs) * 1.3); transition: height .6s cubic-bezier(.22,1,.36,1); }
.mc-crack.is-open { height: calc(var(--hs) * 1.42); }
.mc-velvet { position: absolute; left: 4%; right: 4%; bottom: 0; height: 46%; border-radius: 50% / 40%; background: radial-gradient(70% 60% at 50% 40%, #7E1236, #3e0717 80%);
  box-shadow: inset 0 10px 30px rgba(0,0,0,.5), 0 20px 40px -20px #000; }
.mc-heartBtn { all: unset; position: absolute; left: 50%; top: 6%; width: var(--hs); height: var(--hs); margin-left: calc(var(--hs) / -2); cursor: pointer; z-index: 3;
  filter: drop-shadow(0 22px 26px rgba(0,0,0,.6)); -webkit-tap-highlight-color: transparent; }
.mc-heartSvg { width: 100%; height: 100%; display: block; }
.mc-crack.h1 .mc-heartBtn { animation: mc-shake1 .32s ease-out; }
.mc-crack.h2 .mc-heartBtn { animation: mc-shake2 .36s ease-out; }
.mc-crack.h3 .mc-heartBtn { animation: mc-tremble .09s linear infinite; }
@keyframes mc-shake1 { 30% { transform: translate(-4px, 3px) rotate(-1.5deg); } 60% { transform: translate(3px, -1px) rotate(1deg); } }
@keyframes mc-shake2 { 25% { transform: translate(6px, 4px) rotate(2deg) scale(.98); } 55% { transform: translate(-5px, -2px) rotate(-2deg); } }
@keyframes mc-tremble { 0% { transform: translate(1px, 0); } 50% { transform: translate(-1px, 1px); } 100% { transform: translate(1px, -1px); } }
.mc-cr path { fill: none; stroke: #0d0503; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .35s ease-out; }
.mc-cr.is-on path { stroke-dashoffset: 0; }
.mc-crack.h3 .mc-cr path { stroke: #FFD27A; stroke-width: 1.6; filter: drop-shadow(0 0 2px #ffb347); }
.mc-blow { position: absolute; z-index: 4; width: 0; height: 0; pointer-events: none; }
.mc-blowHammer { position: absolute; left: -8px; top: -96px; width: 104px; transform-origin: 90% 95%; animation: mc-swingHit .34s cubic-bezier(.5,0,.6,1.4) both; }
@keyframes mc-swingHit { 0% { transform: rotate(-55deg) translate(30px, -20px); opacity: 0; } 30% { opacity: 1; } 70% { transform: rotate(8deg); } 100% { transform: rotate(-6deg); opacity: 1; } }
.mc-blowFlash { position: absolute; left: -40px; top: -40px; width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle, rgba(255,240,210,.9), transparent 65%);
  animation: mc-flash .4s ease-out .2s both; }
@keyframes mc-flash { from { transform: scale(.2); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }
.mc-restHammer { position: absolute; right: 0; bottom: 6%; width: 96px; z-index: 4; transform: rotate(14deg); filter: drop-shadow(0 10px 10px rgba(0,0,0,.5)); animation: mc-nudge 2.2s ease-in-out infinite; }
@keyframes mc-nudge { 0%, 100% { transform: rotate(14deg); } 50% { transform: rotate(4deg) translateY(-6px); } }
.mc-chip { position: absolute; left: 58%; top: 30%; width: 14px; height: 10px; background: #4a2617; clip-path: polygon(0 20%, 70% 0, 100% 60%, 30% 100%); z-index: 4; animation: mc-chipFly .8s ease-out forwards; }
@keyframes mc-chipFly { to { transform: translate(80px, 160px) rotate(300deg); opacity: 0; } }
.mc-nest { position: absolute; left: 50%; top: 4%; width: calc(var(--hs) * 1.1); height: calc(var(--hs) * 1.15); margin-left: calc(var(--hs) * -.55); z-index: 2;
  display: grid; align-content: start; justify-items: center; gap: 8px; opacity: 0; transform: scale(.92); transition: opacity .6s .15s, transform .8s .15s cubic-bezier(.22,1,.36,1); }
.mc-crack.is-open .mc-nest { opacity: 1; transform: none; }
.mc-tissue { position: absolute; left: 0; right: 0; top: 4%; height: 62%; border-radius: 50%; z-index: -1;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.4), transparent 40%), repeating-conic-gradient(from 10deg, #f3d48a 0 12deg, #d9ac4e 12deg 22deg, #f6dd9b 22deg 30deg);
  box-shadow: inset 0 -10px 30px rgba(120,80,20,.5), 0 18px 30px -16px #000; }
.mc-nestTruf { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; max-width: 78%; margin-top: 10%; }
.mc-crack.is-open .mc-nestTruf .mc-truf { animation: mc-popIn .6s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes mc-popIn { from { transform: scale(.2) translateY(20px); opacity: 0; } }
.mc-folded { margin: -4px 0 0; width: 44%; padding: 8px 8px 10px; background: #FFF6EA; color: #3B2418; transform: rotate(3deg); box-shadow: 0 14px 26px -10px #000; }
.mc-crack.is-open .mc-folded { animation: mc-unfold .8s .5s cubic-bezier(.22,1,.36,1) both; }
@keyframes mc-unfold { from { transform: rotate(3deg) scaleY(.1); opacity: 0; } }
.mc-foldedPh { display: block; aspect-ratio: 1; }
.mc-folded figcaption { margin-top: 5px; font: 700 13px/1.2 var(--vw-font-script), cursive; }

/* ── truffles ── */
.mc-truf { position: relative; display: inline-block; flex: none; border-radius: 50%; overflow: hidden; vertical-align: middle; }
.mc-trufShell { position: absolute; inset: 0; border-radius: 50%; background: var(--shell); box-shadow: inset -4px -6px 10px rgba(0,0,0,.45), inset 3px 3px 6px rgba(255,255,255,.12); }
.mc-trufGloss { position: absolute; left: 20%; top: 14%; width: 34%; height: 22%; border-radius: 50%; background: rgba(255,255,255,.42); filter: blur(1.5px); transform: rotate(-25deg); }
.mc-trufTop { position: absolute; inset: 0; border-radius: 50%; }
.mc-top-hazel { background: radial-gradient(circle at 40% 30%, #d9a066 0 5%, transparent 6%), radial-gradient(circle at 60% 26%, #c48b52 0 4%, transparent 5%), radial-gradient(circle at 52% 40%, #e6b47e 0 4%, transparent 5%); }
.mc-top-salt { background: radial-gradient(circle at 42% 28%, #fff 0 3%, transparent 4%), radial-gradient(circle at 58% 34%, #f2f2f2 0 2.5%, transparent 3.5%), radial-gradient(circle at 50% 22%, #fff 0 2%, transparent 3%), radial-gradient(circle at 64% 24%, #fff 0 2%, transparent 3%); }
.mc-top-rasp { background: repeating-linear-gradient(-30deg, transparent 0 10%, rgba(255,200,215,.8) 10% 13%); -webkit-mask: radial-gradient(circle at 50% 30%, #000 30%, transparent 46%); mask: radial-gradient(circle at 50% 30%, #000 30%, transparent 46%); }
.mc-top-gold { background: linear-gradient(135deg, #fff1bf, #e2b44a 60%, #a6751c); clip-path: polygon(40% 18%, 62% 14%, 66% 34%, 52% 40%, 36% 34%); }
.mc-top-pista { background: radial-gradient(circle at 44% 26%, #6a8a2a 0 4%, transparent 5%), radial-gradient(circle at 58% 32%, #8fb04a 0 4%, transparent 5%), radial-gradient(circle at 50% 18%, #5f7a24 0 3%, transparent 4%); }
.mc-top-rose { background: radial-gradient(ellipse at 50% 26%, #fff0f4 0 8%, transparent 9%), radial-gradient(ellipse at 42% 30%, #ffc6d4 0 6%, transparent 7%); }
.mc-top-heart { background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 90 C 22 72, 4 54, 7 31 C 10 11, 38 6, 50 26 C 62 6, 90 11, 93 31 C 96 54, 78 72, 50 90 Z' fill='%23FFE6A6'/></svg>") 50% 40% / 36% no-repeat; }
.mc-truf.is-bitten { -webkit-mask: radial-gradient(34% 34% at 84% 16%, transparent 97%, #000 100%); mask: radial-gradient(34% 34% at 84% 16%, transparent 97%, #000 100%); }
.mc-trufBite { position: absolute; left: 45%; top: -23%; width: 78%; height: 78%; border-radius: 50%; background: var(--fill); opacity: 0; box-shadow: inset 0 0 0 3px rgba(0,0,0,.18); }
.mc-truf.is-bitten .mc-trufBite { opacity: 1; }
.mc-slate { display: grid; grid-template-columns: repeat(3, minmax(0, 96px)); gap: 14px 18px; justify-content: center; padding: 22px 18px; border-radius: 22px; width: min(100%, 380px); box-sizing: border-box;
  background: linear-gradient(160deg, #2b2b2e, #141416); box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), 0 24px 40px -24px #000; }
.mc-trufBtn { all: unset; cursor: pointer; display: grid; justify-items: center; gap: 6px; padding: 4px; border-radius: 16px; transition: transform .3s cubic-bezier(.22,1,.36,1); -webkit-tap-highlight-color: transparent; }
.mc-trufBtn > .mc-truf { width: 64px !important; height: 64px !important; filter: drop-shadow(0 8px 8px rgba(0,0,0,.6)); }
.mc-trufBtn:hover { transform: translateY(-3px); }
.mc-trufBtn.is-open { transform: translateY(-8px) scale(1.06); }
.mc-trufBtn.is-eaten { opacity: .75; }
.mc-trufLabel { font: 600 11.5px/1 var(--vw-font-ui), sans-serif; color: #EBD3BD; letter-spacing: .03em; }
.mc-reasonSlot { width: min(100%, 420px); min-height: 124px; display: grid; }
.mc-reason { display: flex; gap: 16px; align-items: center; text-align: left; padding: 16px 18px; border-radius: 18px; background: #FFF6EA; color: #3B2418;
  box-shadow: 0 20px 40px -20px #000; animation: mc-rise .5s cubic-bezier(.22,1,.36,1) both; }
@keyframes mc-rise { from { opacity: 0; transform: translateY(16px); } }
.mc-reasonTruf { animation: mc-lift .65s cubic-bezier(.3,1.5,.5,1) both; filter: drop-shadow(0 10px 10px rgba(0,0,0,.35)); }
@keyframes mc-lift { from { transform: translateY(18px) scale(.7); } }
.mc-flav { margin: 0 0 4px; font: 700 12px/1.3 var(--vw-font-ui), sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #A82B58; }
.mc-flav i { text-transform: none; letter-spacing: 0; font-weight: 500; color: #7B4A2E; }
.mc-reasonTx { margin: 0; font: 600 19px/1.35 var(--vw-font-serif), serif; animation: mc-rise .45s both; }

/* ── ticket ── */
.mc-barStage { position: relative; width: min(100%, 380px); height: 330px; display: grid; place-items: center; }
.mc-bar { position: relative; width: 196px; height: 290px; border-radius: 10px; overflow: hidden; cursor: grab; box-shadow: 0 30px 40px -20px #000; transition: transform .8s cubic-bezier(.22,1,.36,1), opacity .8s; }
.mc-barStage.is-done .mc-bar { transform: translateY(70px) scale(.72) rotate(-6deg); opacity: .4; }
.mc-barChoc { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 7px; background: #2a1208; }
.mc-barChoc span { border-radius: 4px; background: linear-gradient(145deg, #8d5434, #4a2617 70%); box-shadow: inset 2px 2px 3px rgba(255,220,190,.25), inset -3px -3px 4px rgba(0,0,0,.4); }
.mc-foil { position: absolute; inset: 0; background: linear-gradient(115deg, #f7f7f7, #b9b9b9 30%, #f2f2f2 50%, #9c9c9c 70%, #e6e6e6); transition: transform .9s cubic-bezier(.5,0,.3,1); }
.mc-wrap { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: 6px; color: #FFE9EF; transform-origin: 50% 0;
  background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.16), transparent 40%), repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0 8px, transparent 8px 16px), linear-gradient(160deg, #C2285A, #7E1236); }
.mc-wrapCurl { position: absolute; left: 0; right: 0; top: 0; height: 26px; background: linear-gradient(180deg, rgba(0,0,0,.45), transparent); }
.mc-wrapBrand { font: 700 30px/1 var(--vw-font-serif), serif; letter-spacing: .1em; color: #FFE6A6; }
.mc-wrapName { font: 700 26px/1 var(--vw-font-script), cursive; max-width: 88%; overflow-wrap: anywhere; }
.mc-wrapNo { font: 600 10.5px/1 var(--vw-font-ui), sans-serif; letter-spacing: .16em; text-transform: uppercase; opacity: .8; }
.mc-wrapPull { position: absolute; bottom: 14px; font: 700 11px/1 var(--vw-font-ui), sans-serif; letter-spacing: .2em; color: #FFE6A6; animation: mc-pull 1.4s ease-in-out infinite; }
@keyframes mc-pull { 50% { transform: translateY(6px); } }
.mc-ticketRise { position: absolute; left: 50%; top: 4%; transform: translateX(-50%); z-index: 2; animation: mc-ticketUp 1s cubic-bezier(.22,1,.36,1) both; }
@keyframes mc-ticketUp { from { transform: translate(-50%, 140px) scale(.6) rotate(-8deg); opacity: 0; } 60% { opacity: 1; } }
.mc-ticket { position: relative; display: flex; width: min(86vw, 340px); min-height: 150px; border-radius: 12px; overflow: hidden; color: #2B1A03; text-align: left;
  background: linear-gradient(135deg, #FFF1BF, #E2B44A 45%, #C99A35 70%, #FFE6A6); box-shadow: 0 24px 40px -18px #000, inset 0 0 0 2px rgba(255,255,255,.5); }
.mc-ticket.is-small { width: min(88vw, 360px); }
.mc-ticketMain { flex: 1; display: grid; align-content: center; gap: 6px; padding: 16px 14px 16px 18px; border-right: 2px dashed rgba(90,58,6,.55); }
.mc-ticketKick { font: 800 11px/1 var(--vw-font-ui), sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #6b4410; }
.mc-ticketPromise { font: 700 19px/1.2 var(--vw-font-serif), serif; overflow-wrap: anywhere; }
.mc-ticketFine { font: 600 11px/1.2 var(--vw-font-ui), sans-serif; color: #6b4410; }
.mc-ticketStub { width: 86px; display: grid; align-content: center; justify-items: center; gap: 2px; padding: 8px; text-align: center; }
.mc-ticketStub span, .mc-ticketStub small { font: 600 10px/1.1 var(--vw-font-ui), sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #6b4410; }
.mc-ticketStub b { font: 700 18px/1.1 var(--vw-font-script), cursive; overflow-wrap: anywhere; }
.mc-ticketSheen { position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.7) 50%, transparent 65%); transform: translateX(-100%); animation: mc-sheenX 2.8s ease-in-out .6s infinite; pointer-events: none; }
@keyframes mc-sheenX { 0% { transform: translateX(-100%); } 45%, 100% { transform: translateX(100%); } }

/* ── letter ── */
.mc-letterSec { justify-content: flex-start; padding-top: 96px; }
.mc-slab { position: relative; width: min(100%, 470px); aspect-ratio: 320 / 96; border-radius: 14px; background: ${MARBLE}; box-shadow: 0 24px 40px -20px #000, inset 0 0 0 1px rgba(255,255,255,.7); overflow: hidden; }
.mc-slabSvg { width: 100%; height: 100%; display: block; }
.mc-pipeTx { font-family: var(--vw-font-script), cursive; font-weight: 700; font-size: 46px; fill: transparent; stroke: #3a1d10; stroke-width: 1.4; stroke-linejoin: round;
  stroke-dasharray: 700; stroke-dashoffset: 700; animation: mc-pipe var(--pipe) linear .3s forwards; transition: fill .6s; }
.mc-slab.is-piped .mc-pipeTx { fill: #4a2617; stroke: #2a1208; }
@keyframes mc-pipe { to { stroke-dashoffset: 0; } }
.mc-bag { position: absolute; top: 4%; left: 6%; width: 34px; height: 54px; background: linear-gradient(90deg, #f5efe6, #d8cfc2); clip-path: polygon(0 0, 100% 0, 58% 100%, 42% 100%);
  transform-origin: 50% 100%; animation: mc-bag var(--pipe) linear .3s forwards; filter: drop-shadow(0 6px 6px rgba(0,0,0,.3)); }
@keyframes mc-bag { 0% { transform: translateX(0) rotate(-20deg); } 100% { transform: translateX(min(380px, 72vw)) rotate(-20deg); opacity: 0; } }
.mc-voice { width: min(100%, 470px); padding: 14px; border-radius: 18px; background: rgba(30,15,8,.66); border: 1px solid rgba(230,184,92,.35); box-sizing: border-box;
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); color: #FFF6EA; }
.mc-voiceLbl { font: 700 12px/1.2 var(--vw-font-ui), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #E6B85C; }
.mc-voiceNote { display: grid; gap: 8px; text-align: center; }
.mc-voiceNote i { font: 600 21px/1.3 var(--vw-font-script), cursive; font-style: normal; color: #FFF6EA; }
.mc-recipe { width: min(100%, 470px); box-sizing: border-box; padding: 26px 24px 22px; text-align: left; border-radius: 6px; color: #3B2418;
  background: radial-gradient(circle at 90% 0%, rgba(230,184,92,.18), transparent 40%), #FFF6EA; box-shadow: 0 30px 50px -26px #000; user-select: text; -webkit-user-select: text;
  border-top: 6px double #C2185B; }
.mc-recipeKick { margin: 0 0 10px; font: 700 12px/1 var(--vw-font-ui), sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #A82B58; text-align: center; }
.mc-ingr { margin: 0 0 14px; padding: 0 0 12px; list-style: none; border-bottom: 1px dashed rgba(59,36,24,.3); display: grid; gap: 4px; }
.mc-ingr li { font: italic 500 15.5px/1.4 var(--vw-font-serif), serif; }
.mc-ingr li::before { content: "✦"; margin-right: 8px; color: #C99A35; font-style: normal; }
.mc-method { margin: 0 0 8px; font: 700 12px/1 var(--vw-font-ui), sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #7B4A2E; }
.mc-letterTx { white-space: pre-wrap; font: 400 17px/1.65 var(--vw-font-serif), serif; overflow-wrap: anywhere; }
.mc-sign { margin: 16px 0 0; text-align: right; font: 700 26px/1.1 var(--vw-font-script), cursive; color: #7E1236; }

/* ── display case ── */
.mc-case { position: relative; width: min(100%, 440px); padding: 14px; box-sizing: border-box; border-radius: 18px 18px 8px 8px; perspective: 900px;
  background: linear-gradient(180deg, #4A2A1C, #2A160D); box-shadow: 0 30px 50px -24px #000, inset 0 0 0 2px rgba(230,184,92,.35); }
.mc-caseIn { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 8px; padding: 18px 10px 14px; border-radius: 10px;
  background: linear-gradient(180deg, rgba(255,240,215,.06), rgba(255,240,215,.02)), repeating-linear-gradient(180deg, transparent 0 92px, rgba(255,255,255,.28) 92px 95px, transparent 95px 104px), #1a0e08;
  box-shadow: inset 0 10px 30px rgba(0,0,0,.6); transition: background .8s; }
.mc-case.is-lit .mc-caseIn { background: radial-gradient(90% 30% at 50% 0%, rgba(255,226,170,.38), transparent 70%), repeating-linear-gradient(180deg, transparent 0 92px, rgba(255,255,255,.4) 92px 95px, transparent 95px 104px), #2a170d; }
.mc-caseDoor { position: absolute; top: 14px; bottom: 14px; width: calc(50% - 14px); z-index: 3; pointer-events: none; transition: transform 1.1s cubic-bezier(.22,1,.36,1), opacity 1.1s;
  background: linear-gradient(115deg, rgba(255,255,255,.22), rgba(255,255,255,.04) 40%, rgba(255,255,255,.14)); border: 1px solid rgba(255,255,255,.3); }
.mc-caseDoor.is-l { left: 14px; transform-origin: 0 50%; } .mc-caseDoor.is-r { right: 14px; transform-origin: 100% 50%; }
.mc-case.is-lit .mc-caseDoor.is-l { transform: rotateY(-75deg); opacity: .5; }
.mc-case.is-lit .mc-caseDoor.is-r { transform: rotateY(75deg); opacity: .5; }
.mc-bonbon { all: unset; cursor: pointer; display: grid; justify-items: center; gap: 5px; min-height: 80px; opacity: .25; transform: translateY(6px); transition: opacity .6s, transform .5s cubic-bezier(.3,1.5,.5,1); -webkit-tap-highlight-color: transparent; }
.mc-case.is-lit .mc-bonbon { opacity: 1; transform: none; }
.mc-bonbon.is-up { transform: translateY(-10px) scale(1.08) !important; }
.mc-bbBall { width: 50px; height: 50px; border-radius: 50%; background: var(--bb); box-shadow: inset -4px -6px 10px rgba(0,0,0,.45), 0 8px 10px -4px rgba(0,0,0,.7); position: relative; }
.mc-bbBall::after { content: ""; position: absolute; left: 22%; top: 14%; width: 30%; height: 20%; border-radius: 50%; background: rgba(255,255,255,.45); filter: blur(1.5px); }
.mc-bbLabel { max-width: 100%; padding: 3px 5px; border-radius: 3px; background: #FFF6EA; color: #3B2418; font: 600 9.5px/1.15 var(--vw-font-ui), sans-serif;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mc-photoCard { position: fixed; inset: 0; z-index: 130; display: grid; place-items: center; padding: 16px; background: rgba(12,6,3,.84); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); animation: mc-fade .3s both; }
@keyframes mc-fade { from { opacity: 0; } }
.mc-photoFig { position: relative; margin: 0; width: min(92vw, 440px); padding: 12px 12px 10px; border-radius: 14px; background: #FFF6EA; color: #3B2418;
  box-shadow: 0 0 0 3px #E6B85C, 0 0 0 7px #3B2418, 0 0 0 9px #E6B85C, 0 40px 70px -20px #000; animation: mc-lift .5s cubic-bezier(.3,1.4,.5,1) both; }
.mc-photoImg { display: block; aspect-ratio: 1; border-radius: 8px; overflow: hidden; }
.mc-photoImg.is-kb > span { animation: mc-kb 3s ease-out both; }
@keyframes mc-kb { from { transform: scale(1.12); } to { transform: scale(1); } }
.mc-photoFig figcaption { display: grid; gap: 4px; padding: 10px 4px 2px; text-align: center; }
.mc-photoFig figcaption b { font: 700 22px/1.15 var(--vw-font-script), cursive; }
.mc-photoFig figcaption span { font: 500 14.5px/1.4 var(--vw-font-serif), serif; }
.mc-photoNav { display: flex; align-items: center; justify-content: center; gap: 18px; font: 600 13px/1 var(--vw-font-ui), sans-serif; }
.mc-photoNav button, .mc-photoX { all: unset; cursor: pointer; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; font-size: 26px; color: #3B2418; }
.mc-photoX { position: absolute; top: -18px; right: -12px; width: 40px; height: 40px; font-size: 24px; background: #E6B85C; box-shadow: 0 6px 12px rgba(0,0,0,.4); }

/* ── box ── */
.mc-drizzle { position: relative; width: min(78vw, 310px); aspect-ratio: 1; cursor: crosshair; filter: drop-shadow(0 24px 26px rgba(0,0,0,.55)); }
.mc-drizzle svg { width: 100%; height: 100%; display: block; }
.mc-dzGuide { font-family: var(--vw-font-script), cursive; font-weight: 700; fill: none; stroke: rgba(255,246,234,.55); stroke-width: 1.1; stroke-dasharray: 2 4; }
.mc-dzInk { font-family: var(--vw-font-script), cursive; font-weight: 700; fill: #F3E2C7; stroke: #fff8ee; stroke-width: .6; filter: drop-shadow(0 2px 1px rgba(0,0,0,.5)); }
.mc-dzBag { position: absolute; width: 30px; height: 50px; margin: -50px 0 0 -6px; background: linear-gradient(90deg, #f5efe6, #d8cfc2); clip-path: polygon(0 0, 100% 0, 58% 100%, 42% 100%);
  transform: rotate(-24deg); transform-origin: 50% 100%; pointer-events: none; filter: drop-shadow(0 6px 6px rgba(0,0,0,.3)); }
.mc-box { position: relative; width: min(80vw, 320px); aspect-ratio: 1.05; }
.mc-boxBase { position: absolute; inset: 8% 0 0; border-radius: 12px; background: linear-gradient(160deg, var(--ba), var(--bb2)); box-shadow: 0 30px 40px -20px #000, inset 0 0 0 3px rgba(255,255,255,.18); overflow: hidden; }
.mc-boxItems { position: absolute; inset: 9%; display: flex; flex-wrap: wrap; align-content: center; justify-content: center; gap: 6%; border-radius: 8px; background: #2a1208;
  box-shadow: inset 0 6px 16px rgba(0,0,0,.6); padding: 6%; }
.mc-packed { transition: transform .7s cubic-bezier(.3,1.3,.5,1), opacity .5s; }
.mc-box.is-pack .mc-packed { animation: mc-packIn .7s cubic-bezier(.3,1.3,.5,1) both; }
.mc-box.is-pack .mc-packed:nth-child(2) { animation-delay: .1s; } .mc-box.is-pack .mc-packed:nth-child(3) { animation-delay: .2s; }
.mc-box.is-pack .mc-packed:nth-child(4) { animation-delay: .3s; } .mc-box.is-pack .mc-packed:nth-child(5) { animation-delay: .4s; } .mc-box.is-pack .mc-packed:nth-child(6) { animation-delay: .5s; }
@keyframes mc-packIn { from { transform: translateY(-220%) scale(.8); opacity: 0; } }
.mc-packBonbon { display: grid; place-items: center; width: 30%; aspect-ratio: 1; border-radius: 10px; background: linear-gradient(145deg, #6e3d24, #1d0d06); }
.mc-packBonbon b { font: 700 13px/1 var(--vw-font-script), cursive; color: #F3E2C7; }
.mc-packTicket { width: 40%; height: 18%; border-radius: 4px; background: linear-gradient(135deg, #FFF1BF, #E2B44A); }
.mc-boxLid { position: absolute; inset: 0 -3% 6%; border-radius: 14px; background: linear-gradient(160deg, var(--ba), var(--bb2)); box-shadow: 0 30px 40px -20px #000, inset 0 0 0 3px rgba(255,255,255,.22);
  display: grid; place-items: center; overflow: hidden; }
.mc-box.is-pack .mc-boxLid { animation: mc-lid 1.7s cubic-bezier(.6,0,.3,1.2) both; }
@keyframes mc-lid { 0%, 55% { transform: translateY(-130%) rotate(-6deg); opacity: 0; } 70% { opacity: 1; } 100% { transform: none; } }
.mc-lidWord { position: absolute; bottom: 7%; left: 8%; font: 700 15px/1 var(--vw-font-serif), serif; letter-spacing: .3em; text-transform: uppercase; color: var(--bi); opacity: .8; }
.mc-strapV, .mc-strapH { position: absolute; background: linear-gradient(90deg, rgba(0,0,0,.15), transparent 30%, rgba(255,255,255,.3) 50%, transparent 70%, rgba(0,0,0,.15)), var(--rb); }
.mc-strapV { top: 0; bottom: 0; left: 50%; width: 30px; margin-left: -15px; }
.mc-strapH { left: 0; right: 0; top: 50%; height: 30px; margin-top: -15px; background: linear-gradient(180deg, rgba(0,0,0,.15), transparent 30%, rgba(255,255,255,.3) 50%, transparent 70%, rgba(0,0,0,.15)), var(--rb); }
.mc-knotZone { position: absolute; left: 50%; top: 47%; width: 76%; aspect-ratio: 1; transform: translate(-50%, -50%); z-index: 4; cursor: grab; }
.mc-loop { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 3px 3px rgba(0,0,0,.4)); }
.mc-loopHandle { position: absolute; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FFF1BF, #E2B44A 55%, #8f6118);
  box-shadow: 0 0 0 6px rgba(255,230,166,.25), 0 8px 14px rgba(0,0,0,.5); animation: mc-pulse 1.4s ease-in-out infinite; pointer-events: none; }
@keyframes mc-pulse { 50% { box-shadow: 0 0 0 12px rgba(255,230,166,.08), 0 8px 14px rgba(0,0,0,.5); } }
.mc-bow { position: absolute; left: 50%; top: 50%; width: 46%; height: 26%; transform: translate(-50%, -50%) scale(.45); transition: transform .2s; pointer-events: none; }
.mc-bow i { position: absolute; top: 0; width: 50%; height: 100%; background: var(--rb); border-radius: 50% 10% 50% 50%; box-shadow: inset 0 -6px 10px rgba(0,0,0,.25), inset 0 4px 6px rgba(255,255,255,.3); }
.mc-bow i.l { left: 0; transform: rotate(-12deg); } .mc-bow i.r { right: 0; transform: scaleX(-1) rotate(-12deg); }
.mc-bow b { position: absolute; left: 50%; top: 50%; width: 22%; height: 62%; transform: translate(-50%, -50%); border-radius: 8px; background: var(--rb); box-shadow: inset 0 -4px 6px rgba(0,0,0,.3); }
.mc-bow.is-tied { animation: mc-bowPop .7s cubic-bezier(.3,1.7,.5,1) both; }
@keyframes mc-bowPop { 0% { transform: translate(-50%, -50%) scale(.45); } 40% { transform: translate(-50%, -50%) scale(1.25, .85); } 70% { transform: translate(-50%, -50%) scale(.92, 1.1); } 100% { transform: translate(-50%, -50%) scale(1); } }

/* ── ending ── */
.mc-endSec { gap: 16px; }
.mc-endLine { margin: 0; max-width: 30ch; font: 600 clamp(20px, 5.4vw, 26px)/1.35 var(--vw-font-serif), serif; font-style: italic; color: #FFF6EA; text-wrap: balance; }
.mc-endTicket { transform: rotate(-2deg); }
.mc-ps { all: unset; box-sizing: border-box; cursor: pointer; display: flex; gap: 12px; align-items: center; justify-content: center; width: min(100%, 420px); min-height: 56px; padding: 14px 18px;
  border-radius: 6px; background: #F4E7D4; color: #3B2418; font: 600 15px/1.4 var(--vw-font-ui), sans-serif; box-shadow: 0 16px 30px -16px #000; text-align: left; }
.mc-ps.is-open { display: block; background: #FFF6EA; }
.mc-psTx { display: block; white-space: pre-wrap; font: 500 16px/1.55 var(--vw-font-serif), serif; user-select: text; -webkit-user-select: text; }
.mc-psSeal { display: grid; place-items: center; flex: none; width: 36px; height: 36px; border-radius: 50%; color: #FFF1BF; background: radial-gradient(circle at 35% 30%, #d96a5a, #9b2222 55%, #6d1414); }
.mc-endSec .pm-reply, .mc-endSec > div { max-width: 100%; }
.mc-credit { margin: 4px 0 0; font: 600 11.5px/1 var(--vw-font-ui), sans-serif; letter-spacing: .1em; color: rgba(255,246,234,.55); }

@media (min-width: 768px) {
  .mc-sec { padding-top: 84px; }
  .mc-crack { width: min(100%, 460px); }
}
@media (max-height: 700px) {
  .mc-sec { gap: 10px; padding-top: 64px; }
  .mc-barStage { height: 300px; }
}
@media (prefers-reduced-motion: reduce) {
  .mc-rain, .mc-sign, .mc-bub, .mc-steam circle, .mc-restHammer, .mc-wrapPull, .mc-ticketSheen, .mc-loopHandle, .mc-crack.h3 .mc-heartBtn,
  .mc-crack.h1 .mc-heartBtn, .mc-crack.h2 .mc-heartBtn, .mc-lamp.is-on .mc-cone { animation: none !important; }
  .mc-pipeTx { animation: none; stroke-dashoffset: 0; fill: #4a2617; }
  .mc-photoImg.is-kb > span, .mc-outHeart, .mc-ticketRise, .mc-box.is-pack .mc-packed, .mc-box.is-pack .mc-boxLid, .mc-bow.is-tied { animation-duration: .01s !important; }
  .mc-caseDoor, .mc-sign { transition: none; }
}
`;
