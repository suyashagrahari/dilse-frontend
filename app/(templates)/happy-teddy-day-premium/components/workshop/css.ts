// All of the workshop's CSS (one <style>, "td-" prefix). Transforms + opacity
// for motion; loops stop under prefers-reduced-motion.

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.6'/></svg>\")";

const STARS =
  "radial-gradient(1.5px 1.5px at 10% 20%, #fff, transparent), radial-gradient(1px 1px at 30% 70%, #cfe0ff, transparent), radial-gradient(2px 2px at 55% 35%, #fff, transparent), radial-gradient(1px 1px at 75% 15%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 60%, #bfd7ff, transparent), radial-gradient(1px 1px at 20% 85%, #fff, transparent), radial-gradient(2px 2px at 45% 90%, #e4ecff, transparent), radial-gradient(1px 1px at 65% 55%, #fff, transparent), radial-gradient(1.5px 1.5px at 92% 88%, #fff, transparent), radial-gradient(1px 1px at 5% 50%, #fff, transparent)";

export const TEDDY_CSS = `
/* ── backdrop ── */
.td-bd { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; background: #141729; }
.td-wall { position: absolute; inset: 0; transition: background 1s; }
.td-bd.is-workshop .td-wall { background: radial-gradient(70% 55% at 62% 30%, rgba(255,217,160,.22), transparent 70%), repeating-linear-gradient(90deg, rgba(0,0,0,.1) 0 2px, transparent 2px 80px), linear-gradient(180deg, #6B4630 0%, #5B3A29 55%, #3E271B 100%); }
.td-bd.is-bedroom .td-wall, .td-bd.is-porch .td-wall { background: radial-gradient(80% 60% at 50% 20%, rgba(120,140,255,.14), transparent 70%), linear-gradient(180deg, #2C3566 0%, #1B2240 60%, #121732 100%); }
.td-window { position: absolute; top: 11vh; left: 5vw; width: clamp(96px, 19vw, 280px); height: clamp(140px, 28vh, 360px); border: 8px solid #3E271B; border-radius: 8px; overflow: hidden;
  background: radial-gradient(90% 70% at 70% 20%, #2a3a72, #0e1430 75%); box-shadow: 0 0 0 2px rgba(255,217,160,.2), 0 20px 40px -20px #000; }
.td-bd.is-bedroom .td-window { border-color: #2a2f55; }
.td-bars { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 48%, #3E271B 48% 52%, transparent 52%), linear-gradient(180deg, transparent 48%, #3E271B 48% 52%, transparent 52%); }
.td-bd.is-bedroom .td-bars { background: linear-gradient(90deg, transparent 48%, #2a2f55 48% 52%, transparent 52%), linear-gradient(180deg, transparent 48%, #2a2f55 48% 52%, transparent 52%); }
.td-wmoon { position: absolute; top: 14%; right: 16%; width: 26%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fffbe8, #f3e3a8); box-shadow: 0 0 24px rgba(255,240,190,.6); }
.td-weather { position: absolute; inset: -40px 0 0; }
.td-weather.is-rain { opacity: .55; background-image: repeating-linear-gradient(100deg, transparent 0 9px, rgba(190,210,255,.4) 9px 10px, transparent 10px 23px); background-size: 100% 120px; animation: td-rain .7s linear infinite; }
.td-weather.is-snow { background-image: radial-gradient(2px 2px at 20% 30%, #fff, transparent), radial-gradient(2.5px 2.5px at 60% 10%, #fff, transparent), radial-gradient(2px 2px at 80% 50%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 70%, #fff, transparent), radial-gradient(2px 2px at 10% 85%, #fff, transparent);
  background-size: 100% 160px; animation: td-snow 6s linear infinite; }
.td-weather.is-stars { background-image: ${STARS}; animation: td-twinkle 3s ease-in-out infinite alternate; }
@keyframes td-rain { to { background-position: -14px 120px; } }
@keyframes td-snow { to { background-position: 10px 160px, -8px 160px, 12px 160px, -6px 160px, 8px 160px; } }
@keyframes td-twinkle { to { opacity: .6; } }
.td-shelf { position: absolute; right: 3vw; display: flex; align-items: flex-end; gap: 8px; padding: 0 10px; border-bottom: 7px solid #3E271B; filter: blur(1px); opacity: .9; box-shadow: 0 6px 10px -6px #000; }
.td-shelfA { top: 17vh; } .td-shelfB { top: 32vh; right: 7vw; }
.td-spool { display: block; width: 22px; height: 30px; border-radius: 3px; background: linear-gradient(180deg, #c9a46a 0 14%, var(--c) 14% 86%, #c9a46a 86%); box-shadow: inset -4px 0 0 rgba(0,0,0,.18); }
.td-jarBtn { display: block; width: 30px; height: 40px; border-radius: 6px; background: radial-gradient(circle at 30% 40%, #f6d98b 0 3px, transparent 4px), radial-gradient(circle at 60% 60%, #e8a0b4 0 3px, transparent 4px), radial-gradient(circle at 50% 30%, #a8c3a0 0 3px, transparent 4px), rgba(255,255,255,.18); }
.td-lamp { position: absolute; top: 0; left: 84%; width: 10px; height: 10px; }
.td-lampArm { position: absolute; left: 0; top: 0; width: 4px; height: 12vh; background: #2b1b12; }
.td-lampHead { position: absolute; left: -26px; top: 12vh; width: 56px; height: 28px; border-radius: 56px 56px 6px 6px; background: linear-gradient(90deg, #6b8a5a, #a8c3a0 50%, #5d7a4e); }
.td-lampCone { position: absolute; left: -38vw; top: calc(12vh + 26px); width: 76vw; max-width: 900px; height: 80vh; clip-path: polygon(46% 0, 54% 0, 100% 100%, 0 100%); background: linear-gradient(180deg, rgba(255,217,160,.32), rgba(255,217,160,.04) 70%, transparent); mix-blend-mode: screen; }
.td-bench { position: absolute; left: -2vw; right: -2vw; bottom: 0; height: 15vh; background: repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 2px, transparent 2px 120px), linear-gradient(180deg, #8a5a3c, #5b3a29); border-top: 3px solid #b98563; box-shadow: 0 -10px 30px rgba(0,0,0,.4); }
.td-drape { position: absolute; top: 0; height: 100%; width: 30vw; background: repeating-linear-gradient(90deg, rgba(0,0,0,.14) 0 10px, transparent 10px 34px), linear-gradient(180deg, #4b3f7a, #2c2552); opacity: .85; animation: td-drapeIn 1.2s cubic-bezier(.22,1,.36,1) both; }
.td-drapeL { left: 0; clip-path: polygon(0 0, 100% 0, 30% 100%, 0 100%); transform-origin: 0 0; }
.td-drapeR { right: 0; clip-path: polygon(0 0, 100% 0, 100% 100%, 70% 100%); transform-origin: 100% 0; }
@keyframes td-drapeIn { from { transform: translateY(-100%); } }
.td-fairy { position: absolute; top: 4vh; left: 6vw; right: 6vw; height: 40px; border-top: 1px solid rgba(255,255,255,.15); border-radius: 0 0 50% 50%; display: flex; justify-content: space-between; }
.td-fairy i { width: 7px; height: 7px; margin-top: 10px; border-radius: 50%; background: #FFE08A; box-shadow: 0 0 10px 3px rgba(255,224,138,.6); animation: td-bulb 2s ease-in-out infinite alternate; }
.td-fairy i:nth-child(3n) { background: #FF8FB8; box-shadow: 0 0 10px 3px rgba(255,143,184,.55); } .td-fairy i:nth-child(3n+1) { margin-top: 18px; }
@keyframes td-bulb { to { opacity: .45; } }
.td-bed { position: absolute; left: -2vw; right: -2vw; bottom: 0; height: 14vh; background: repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0 12px, transparent 12px 24px), linear-gradient(180deg, #E8A0B4, #b86d86); border-top: 4px solid #f6c7d5; box-shadow: 0 -10px 30px rgba(0,0,0,.4); }
.td-vignette { position: absolute; inset: 0; background: radial-gradient(110% 80% at 50% 40%, transparent 45%, rgba(5,6,18,.7) 100%); }
.td-dim { position: absolute; inset: 0; background: #05060f; opacity: var(--dim); transition: opacity 1.4s ease; }
.td-bd::after { content: ""; position: absolute; inset: 0; background-image: ${GRAIN}; opacity: .05; mix-blend-mode: overlay; }

/* ── chrome ── */
.td-scene { position: relative; z-index: 2; }
.td-progress { position: fixed; top: 22px; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; gap: 5px; padding: 6px 9px; border-radius: 99px; background: rgba(20,23,41,.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.td-progress span { height: 7px; border-radius: 4px; background: rgba(255,248,240,.22); transition: width .35s, background .35s; }
.td-progress span.is-on { background: #FF8FB8; }
.td-sec { min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 72px 16px 32px; text-align: center; color: #FFF8F0; }
.td-head { display: grid; gap: 6px; justify-items: center; max-width: 520px; }
.td-kick { margin: 0; font: 700 11.5px/1.2 var(--vw-font-ui), sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #FFB8D0; }
.td-h { margin: 0; font: 700 clamp(25px, 7vw, 36px)/1.12 var(--vw-font-ui), sans-serif; color: #FFF8F0; text-wrap: balance; text-shadow: 0 2px 18px rgba(0,0,0,.55); }
.td-sub { margin: 0; font: 500 15px/1.45 var(--vw-font-ui), sans-serif; color: #EADCF0; text-shadow: 0 1px 8px rgba(0,0,0,.6); }
.td-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center; min-height: 52px; }
.td-btn { min-height: 50px; padding: 0 24px; border-radius: 99px; border: 0; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui), sans-serif; color: #3A1F33;
  background: linear-gradient(135deg, #FFE3EE, #FF8FB8 55%, #E0688F); box-shadow: 0 14px 30px -14px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.7); transition: transform .2s; }
.td-btn:active { transform: scale(.96); }
.td-btn.is-ghost { color: #FFF8F0; background: rgba(27,34,64,.6); border: 1px solid rgba(255,184,208,.5); box-shadow: none; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.td-link { all: unset; cursor: pointer; min-height: 44px; padding: 0 14px; display: inline-flex; align-items: center; font: 700 14px/1 var(--vw-font-ui), sans-serif; color: #FFD3E2; text-decoration: underline; text-underline-offset: 4px; }
.td-btn:focus-visible, .td-link:focus-visible, .td-pillow:focus-visible, .td-moon:focus-visible, .td-heartGrab:focus-visible, .td-ps:focus-visible, .td-needleBtn:focus-visible, .td-sleepy:focus-visible { outline: 3px solid #FFB8D0; outline-offset: 3px; }
.td-stick { display: inline-flex; }

/* ── gate: the parcel ── */
.td-gate .pm-gateArt { width: min(300px, 70vw); max-height: 38vh; aspect-ratio: 1.05; }
.td-gateSub { font: 700 20px/1.2 var(--vw-font-script), cursive; color: #FFD3E2; }
.td-parcel { position: relative; width: 100%; height: 100%; perspective: 800px; }
.td-box { position: absolute; left: 6%; right: 6%; top: 24%; bottom: 4%; border-radius: 8px; background: repeating-linear-gradient(0deg, rgba(0,0,0,.03) 0 2px, transparent 2px 7px), linear-gradient(160deg, #D9B07A, #B78650); box-shadow: 0 26px 40px -18px #000, inset 0 0 0 2px rgba(0,0,0,.08); }
.td-flap { position: absolute; top: 14%; width: 44%; height: 14%; background: linear-gradient(180deg, #C99A62, #B78650); z-index: 1; transition: transform 1s cubic-bezier(.5,-0.2,.3,1.3) .25s; }
.td-flapL { left: 6%; transform-origin: 0 100%; clip-path: polygon(0 100%, 8% 0, 100% 0, 100% 100%); }
.td-flapR { right: 6%; transform-origin: 100% 100%; clip-path: polygon(0 0, 92% 0, 100% 100%, 0 100%); }
.pm-gate.is-opening .td-flapL { transform: rotate(-120deg); }
.pm-gate.is-opening .td-flapR { transform: rotate(120deg); }
.td-twineV, .td-twineH { position: absolute; background: repeating-linear-gradient(45deg, #efe2c4 0 3px, #cdb88f 3px 6px); transition: opacity .5s .2s; }
.td-twineV { top: 0; bottom: 0; left: 50%; width: 6px; margin-left: -3px; }
.td-twineH { left: 0; right: 0; top: 42%; height: 6px; }
.td-knot { position: absolute; left: 50%; top: 42%; width: 0; height: 0; z-index: 2; transition: opacity .4s .2s, transform .5s; }
.td-knot i { position: absolute; top: -18px; width: 30px; height: 22px; border: 5px solid #e3d3ad; border-radius: 50%; box-sizing: border-box; }
.td-knot i.l { left: -32px; transform: rotate(-18deg); } .td-knot i.r { left: 2px; transform: rotate(18deg); }
.td-knot b { position: absolute; left: -7px; top: -7px; width: 14px; height: 14px; border-radius: 50%; background: #d8c599; }
.td-tail { position: absolute; left: -2px; top: 4px; width: 6px; height: 40px; background: repeating-linear-gradient(45deg, #efe2c4 0 3px, #cdb88f 3px 6px); transform-origin: 50% 0; transform: rotate(14deg); animation: td-tail 2.4s ease-in-out infinite; }
@keyframes td-tail { 50% { transform: rotate(-6deg); } }
.pm-gate.is-opening .td-knot { transform: translateY(40px); opacity: 0; }
.pm-gate.is-opening .td-twineV, .pm-gate.is-opening .td-twineH { opacity: 0; }
.td-label { position: absolute; left: 8%; bottom: 10%; width: 50%; padding: 8px 10px; background: #FFF8F0; color: #4A3326; border-radius: 4px; transform: rotate(-3deg); text-align: left; display: grid; gap: 1px; box-shadow: 0 4px 8px rgba(0,0,0,.2); }
.td-label small { font: 600 9px/1 var(--vw-font-ui), sans-serif; letter-spacing: .2em; text-transform: uppercase; opacity: .6; }
.td-label b { font: 700 clamp(16px, 5vw, 20px)/1.1 var(--vw-font-script), cursive; overflow-wrap: anywhere; }
.td-label span { font: 600 9.5px/1.2 var(--vw-font-ui), sans-serif; }
.td-label .td-contents { color: #C2185B; }
.td-stamp { position: absolute; right: 8%; bottom: 12%; width: 40px; height: 40px; display: grid; place-items: center; border: 2px dashed #C2185B; border-radius: 6px; color: #C2185B; font-size: 18px; transform: rotate(8deg); opacity: .8; }
.td-peek { position: absolute; left: 50%; top: 30%; font-size: 60px; transform: translate(-50%, 30%); opacity: 0; transition: transform .9s cubic-bezier(.3,1.6,.5,1) .5s, opacity .3s .5s; z-index: 0; }
.pm-gate.is-opening .td-peek { opacity: 1; transform: translate(-50%, -60%); }

/* ── the teddy ── */
.td-teddy { display: block; overflow: visible; }
.td-eye, .td-head, .td-body, .td-armR { transform-box: fill-box; }
.td-glint { opacity: 0; }
.td-wake .td-glint { animation: td-glint 1.2s ease-out .1s both; }
@keyframes td-glint { 0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 0; } }
.td-wake .td-eyes { transform-box: fill-box; transform-origin: center; animation: td-blink 3.6s ease-in-out 1.2s infinite; }
@keyframes td-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
.td-wake .td-body { transform-origin: 50% 100%; animation: td-stretch .8s cubic-bezier(.3,1.6,.5,1) .4s both; }
@keyframes td-stretch { 0% { transform: scale(1, 1); } 35% { transform: scale(.92, 1.1); } 65% { transform: scale(1.05, .95); } 100% { transform: none; } }
.td-wake .td-head { transform-origin: 50% 100%; animation: td-headUp .8s cubic-bezier(.3,1.6,.5,1) .3s both; }
@keyframes td-headUp { from { transform: translateY(8px) rotate(-8deg); } }
.td-wake .td-armR { transform-origin: 10% 10%; animation: td-wave .6s ease-in-out 1.2s 4 alternate; }
@keyframes td-wave { from { transform: rotate(0); } to { transform: rotate(-38deg); } }
.td-pawInit { font: 700 11px Georgia, serif; }
.td-chestGlow { animation: td-beat 1.1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes td-beat { 0%, 100% { opacity: .65; transform: scale(.94); } 15% { opacity: 1; transform: scale(1.06); } 30% { opacity: .75; } 45% { opacity: .95; transform: scale(1.02); } }
.td-stitch { opacity: .12; transition: opacity .2s; } .td-stitch.is-on { opacity: 1; }

/* ── workshop ── */
.td-dolly { animation: td-dolly 1.6s cubic-bezier(.22,1,.36,1) both; }
@keyframes td-dolly { from { transform: scale(1.12); filter: blur(3px); } }
.td-benchStage { position: relative; display: flex; align-items: center; justify-content: center; gap: 4px; width: min(100%, 420px); }
.td-flat { width: min(52vw, 210px); filter: drop-shadow(0 16px 18px rgba(0,0,0,.4)); }
.td-tag { position: relative; width: 42%; max-width: 180px; padding: 16px 12px 12px; background: #FFF8F0; color: #4A3326; border-radius: 4px 14px 14px 4px; transform: rotate(4deg); text-align: left; box-shadow: 0 12px 20px -10px #000; }
.td-tag p { margin: 0; font: 700 17px/1.25 var(--vw-font-script), cursive; }
.td-tag i { display: block; margin-top: 6px; font: 500 12px/1 var(--vw-font-ui), sans-serif; opacity: .7; }
.td-tagHole { position: absolute; left: 8px; top: 8px; width: 9px; height: 9px; border-radius: 50%; background: #5B3A29; }

/* ── stuffing ── */
.td-stuffStage { position: relative; width: min(100%, 380px, 70vh); height: min(46vh, 400px); }
.td-machine { position: absolute; left: 0; top: 0; width: 38%; height: 60%; border-radius: 16px 16px 8px 8px; background: linear-gradient(90deg, #8a6418, #e6c46a 45%, #a07520); box-shadow: 0 18px 30px -16px #000, inset 0 0 0 3px rgba(255,255,255,.2); }
.td-gauge { position: absolute; left: 12%; right: 12%; top: 8%; aspect-ratio: 1.6; border-radius: 99px 99px 10px 10px; background: #FFF8F0; border: 3px solid #5B3A29; overflow: hidden; }
.td-gauge small { position: absolute; left: 0; right: 0; bottom: 4px; font: 700 10px/1 var(--vw-font-ui), sans-serif; color: #C2185B; }
.td-gaugeNeedle { position: absolute; left: 50%; bottom: 14px; width: 3px; height: 62%; margin-left: -1.5px; background: #3A1F33; transform-origin: 50% 100%; transition: transform .2s; border-radius: 2px; }
.td-hopper { position: absolute; left: 14%; right: 14%; bottom: 10%; height: 40%; border-radius: 10px; background: rgba(255,255,255,.35); overflow: visible; }
.td-puff { position: absolute; width: 34px; height: 26px; border-radius: 50%; background: #fff; box-shadow: 10px -6px 0 -2px #fff, -10px -4px 0 -4px #fff; animation: td-puff .9s ease-out forwards; }
@keyframes td-puff { from { transform: scale(.4); opacity: 1; } to { transform: translate(60px, 60px) scale(1.4); opacity: 0; } }
.td-tube { position: absolute; right: -24%; top: 54%; width: 34%; height: 14px; border-radius: 7px; background: linear-gradient(180deg, #e6c46a, #8a6418); transform: rotate(28deg); }
.td-stuffTeddy { position: absolute; left: 30%; right: 8%; bottom: 0; width: 60%; filter: drop-shadow(0 16px 18px rgba(0,0,0,.4)); }
.td-wheel { position: absolute; left: 0; bottom: 0; width: 42%; aspect-ratio: 1; border-radius: 50%; cursor: grab; background: radial-gradient(circle, #5B3A29 0 12%, transparent 13%), radial-gradient(circle, transparent 60%, #8a6418 61% 72%, transparent 73%), radial-gradient(circle, rgba(255,230,160,.18), transparent 70%); }
.td-wheelIn { position: absolute; inset: 0; }
.td-spoke { position: absolute; left: 50%; top: 14%; bottom: 14%; width: 8px; margin-left: -4px; border-radius: 4px; background: linear-gradient(90deg, #8a6418, #e6c46a, #8a6418); }
.td-spoke.is-b { transform: rotate(90deg); }
.td-handle { position: absolute; left: 50%; top: 2%; width: 34px; height: 34px; margin-left: -17px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff1bf, #c2185b 55%, #7e1236); box-shadow: 0 0 0 6px rgba(255,184,208,.25), 0 6px 10px rgba(0,0,0,.4); animation: td-pulse 1.5s ease-in-out infinite; }
@keyframes td-pulse { 50% { box-shadow: 0 0 0 12px rgba(255,184,208,.08), 0 6px 10px rgba(0,0,0,.4); } }

/* ── ceremony ── */
.td-cereStage { position: relative; width: min(100%, 380px); height: min(44vh, 360px); display: grid; place-items: center; }
.td-heartGrab { position: relative; z-index: 3; width: 150px; height: 150px; cursor: grab; filter: drop-shadow(0 18px 20px rgba(0,0,0,.45)) drop-shadow(0 0 calc(var(--warm, 0) * 34px) rgba(255,143,184,.9)); }
.td-heartGrab.is-warm { animation: td-throb 1.4s ease-in-out infinite; }
@keyframes td-throb { 50% { scale: 1.04; } }
.td-fheart { width: 100%; height: 100%; display: block; }
.td-fheart.is-kissed { animation: td-kiss .6s cubic-bezier(.3,1.6,.5,1); }
@keyframes td-kiss { 40% { transform: scale(1.18); } }
.td-fhInit { font: 700 22px Georgia, serif; fill: #FFE6A6; }
.td-kissMark { font-size: 22px; }
.td-hand { position: absolute; top: 50%; width: 92px; height: 120px; margin-top: -60px; border-radius: 46px 46px 40px 40px; background: linear-gradient(180deg, #f5cfb4, #e2ab8c); box-shadow: inset 0 -10px 16px rgba(0,0,0,.12); opacity: .9; }
.td-hand.is-l { left: 0; transform: rotate(14deg); } .td-hand.is-r { right: 0; transform: rotate(-14deg); }
.td-target { position: absolute; display: grid; justify-items: center; gap: 2px; width: 92px; height: 92px; place-content: center; border-radius: 50%; border: 2px dashed rgba(255,184,208,.8); background: radial-gradient(circle, rgba(255,143,184,.35), transparent 70%); animation: td-pulse2 1.4s ease-in-out infinite; }
.td-target span { font-size: 34px; line-height: 1; } .td-target small { font: 700 11px/1 var(--vw-font-ui), sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #FFD3E2; }
.td-target.is-cheek { right: 0; top: 6%; } .td-target.is-ear { left: 0; top: 6%; }
@keyframes td-pulse2 { 50% { transform: scale(1.08); } }
.td-whisper { position: absolute; left: 0; right: 0; bottom: -4px; padding: 0 8px; font: italic 600 20px/1.35 var(--vw-font-serif), serif; color: #FFE3EE; text-shadow: 0 0 18px rgba(255,143,184,.6); }
.td-cere.is-hush .td-head, .td-cere.is-hush .td-actions { opacity: .35; filter: blur(1px); transition: opacity .6s, filter .6s; }
.td-blush { position: fixed; inset: 0; z-index: 50; pointer-events: none; background: radial-gradient(60% 50% at 50% 50%, rgba(255,143,184,.45), rgba(255,143,184,.15)); animation: td-blushIn 1.1s ease-out forwards; }
@keyframes td-blushIn { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
.td-stickC { position: absolute; right: 2%; bottom: 0; }

/* ── stitch + wake ── */
.td-stitchStage { position: relative; display: grid; justify-items: center; gap: 10px; }
.td-stitchTeddy { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; width: min(62vw, 250px, 34vh); cursor: crosshair; filter: drop-shadow(0 18px 20px rgba(0,0,0,.45)); }
.td-stitchTeddy.is-alive { cursor: default; }
.td-dropHeart { position: absolute; left: 50%; top: 0; width: 64px; height: 64px; margin-left: -32px; animation: td-dropIn .9s cubic-bezier(.6,0,.8,.4) forwards; }
@keyframes td-dropIn { 0% { transform: translateY(-80px) scale(1.2); } 80% { opacity: 1; } 100% { transform: translateY(150px) scale(.5); opacity: 0; } }
.td-needleBtn { min-height: 46px; padding: 0 18px; border-radius: 99px; border: 1px solid rgba(255,184,208,.6); background: rgba(27,34,64,.65); color: #FFF8F0; cursor: pointer; font: 700 14px/1 var(--vw-font-ui), sans-serif; }
.td-bubble { position: relative; order: -1; width: max-content; max-width: min(82vw, 300px); padding: 12px 16px; border-radius: 20px; background: #FFF8F0; color: #3A1F33;
  font: 700 17px/1.3 var(--vw-font-ui), sans-serif; box-shadow: 0 14px 28px -12px #000; animation: td-pop .6s cubic-bezier(.3,1.6,.5,1) both; }
.td-bubble::after { content: ""; position: absolute; left: 50%; bottom: -9px; margin-left: -9px; border: 9px solid transparent; border-top-color: #FFF8F0; border-bottom: 0; }
@keyframes td-pop { from { transform: translateY(20px) scale(.4); opacity: 0; } }
.td-voice { width: min(100%, 440px); padding: 12px; box-sizing: border-box; border-radius: 18px; background: rgba(27,34,64,.66); border: 1px solid rgba(255,184,208,.35); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); color: #FFF8F0; }
.td-voiceLbl { font: 700 12px/1.3 var(--vw-font-ui), sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #FFB8D0; }
.td-pawNote { display: grid; gap: 6px; }
.td-pawNote i { font: 700 21px/1.3 var(--vw-font-script), cursive; font-style: normal; }

/* ── torch letter ── */
.td-lightsOut { animation: td-cut .9s ease-out both; }
@keyframes td-cut { 0%, 40% { filter: brightness(0); } 100% { filter: none; } }
.td-page { position: relative; width: min(100%, 440px); border-radius: 6px; overflow: hidden; box-shadow: 0 30px 50px -24px #000; }
.td-letter { position: relative; padding: 26px 24px 22px; background: repeating-linear-gradient(180deg, transparent 0 27px, rgba(120,140,200,.25) 27px 28px), #FFFBF2; color: #2b2540; text-align: left; user-select: text; -webkit-user-select: text; min-height: 260px; }
.td-letterTx { white-space: pre-wrap; font: 600 19px/28px var(--vw-font-script), cursive; overflow-wrap: anywhere; }
.td-letterSign { margin: 14px 0 0; text-align: right; font: 700 24px/1 var(--vw-font-script), cursive; color: #C2185B; }
.td-doodle { position: absolute; font-size: 22px; color: #8fd3ff; text-shadow: 0 0 8px #8fd3ff; opacity: .7; }
.td-doodle.is-a { right: 12px; top: 10px; } .td-doodle.is-b { left: 8px; bottom: 40%; color: #ff9ec4; text-shadow: 0 0 8px #ff9ec4; } .td-doodle.is-c { right: 18px; bottom: 16px; }
.td-dark { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; }
.td-page.is-clear .td-letter { animation: td-fadeUp .5s both; }
@keyframes td-fadeUp { from { opacity: .4; } }
.td-beam { position: absolute; width: 170px; height: 170px; margin: -85px 0 0 -85px; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(255,243,196,.32), rgba(255,243,196,0) 70%); mix-blend-mode: screen; }
.td-torchTeddy { position: relative; width: 92px; margin-top: -40px; z-index: 3; align-self: flex-start; margin-left: max(0px, calc(50% - 250px)); }
.td-mini { width: 100%; height: auto; filter: drop-shadow(0 8px 10px rgba(0,0,0,.45)); }

/* ── star lamp ── */
.td-ceiling { position: relative; width: min(100%, 440px); aspect-ratio: 1; border-radius: 50%; overflow: hidden; background: radial-gradient(circle at 50% 55%, rgba(120,150,255,.25), rgba(10,14,40,.4) 70%); }
.td-sky { position: absolute; inset: -20%; background-image: ${STARS}, ${STARS}; background-size: 50% 50%, 33% 33%; opacity: .9; }
.td-ring { position: absolute; inset: 0; }
.td-moon { all: unset; position: absolute; width: 23%; aspect-ratio: 1; margin: -11.5% 0 0 -11.5%; cursor: pointer; transform: rotate(var(--counter, 0deg)); display: grid; justify-items: center; }
.td-moonIn { display: block; width: 100%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 3px rgba(191,215,255,.5), 0 0 26px 6px rgba(191,215,255,.45); }
.td-moonIn img { filter: saturate(.8) brightness(1.05); }
.td-moonCap { margin-top: 5px; max-width: 150%; padding: 3px 8px; border-radius: 99px; background: rgba(12,16,40,.78); font: 600 10.5px/1.15 var(--vw-font-ui), sans-serif; color: #EAF1FF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-lampDome { position: absolute; left: 50%; top: 50%; width: 16%; aspect-ratio: 1; margin: -8% 0 0 -8%; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #fff, #bfd7ff 60%, #6f8fd6); box-shadow: 0 0 40px 14px rgba(191,215,255,.5); }

/* ── hide and seek ── */
.td-fort { position: relative; width: min(100%, 420px); height: 190px; }
.td-pillow { all: unset; position: absolute; left: 0; bottom: 0; width: 33.33%; height: 120px; cursor: pointer; transform: translateX(calc(var(--slot) * 100%)); transition: transform .45s cubic-bezier(.5,0,.3,1); display: grid; place-items: end center; }
.td-pillow:disabled { cursor: default; }
.td-pillowCase { position: relative; z-index: 2; width: 92%; height: 70px; border-radius: 40px 40px 26px 26px; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.5), transparent 50%), linear-gradient(180deg, #F6D98B, #E5B85A); box-shadow: 0 12px 16px -8px rgba(0,0,0,.5), inset 0 -6px 0 rgba(0,0,0,.08); transition: transform .4s cubic-bezier(.3,1.6,.5,1); }
.td-pillow:nth-child(odd) .td-pillowCase { background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.5), transparent 50%), linear-gradient(180deg, #FFC8DD, #E8A0B4); }
.td-pillow.is-lift .td-pillowCase { transform: translateY(-56px) rotate(-10deg); }
.td-pillow.is-wrong .td-pillowCase { animation: td-wiggle .5s ease-in-out; }
@keyframes td-wiggle { 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
.td-peekTeddy { position: absolute; z-index: 1; bottom: 6px; width: 70%; animation: td-pop2 .5s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes td-pop2 { from { transform: translateY(40px) scale(.6); } }
.td-seekTeddy { position: absolute; left: 0; bottom: 30px; width: 33.33%; display: grid; justify-items: center; transform: translateX(calc(var(--slot) * 100%)); transition: transform .4s; z-index: 1; }
.td-seekTeddy .td-mini { width: 62%; }
.td-seekTeddy.is-diving { animation: td-dive .6s cubic-bezier(.6,0,.8,.4) forwards; }
@keyframes td-dive { to { translate: 0 60px; opacity: 0; } }
.td-seekLine { min-height: 64px; display: grid; place-items: center; width: min(100%, 420px); }
.td-said { margin: 0; padding: 12px 18px; border-radius: 18px; background: #FFF8F0; color: #3A1F33; font: 700 17px/1.35 var(--vw-font-ui), sans-serif; animation: td-pop3 .5s cubic-bezier(.3,1.6,.5,1) both; }
.td-said.is-whisper { background: transparent; color: #FFE3EE; font: italic 600 20px/1.35 var(--vw-font-serif), serif; text-shadow: 0 0 16px rgba(255,143,184,.5); }
@keyframes td-pop3 { from { transform: scale(.7); opacity: 0; } }

/* ── tuck-in ── */
.td-bedStage { position: relative; width: min(100%, 360px); height: min(48vh, 380px); overflow: hidden; border-radius: 26px 26px 10px 10px; }
.td-pillowBig { position: absolute; left: 10%; right: 10%; top: 8%; height: 34%; border-radius: 60px; background: radial-gradient(circle at 30% 30%, #fff, #e9e4f5 70%); box-shadow: inset 0 -10px 20px rgba(0,0,0,.1); }
.td-sleepy { all: unset; position: absolute; left: 50%; top: 10%; width: 52%; margin-left: -26%; cursor: pointer; filter: drop-shadow(0 12px 14px rgba(0,0,0,.35)); }
.td-sleepy.is-jelly { animation: td-jelly .7s cubic-bezier(.3,1.6,.5,1); }
@keyframes td-jelly { 0% { transform: scale(1, 1); } 25% { transform: scale(1.14, .84); } 50% { transform: scale(.9, 1.1); } 75% { transform: scale(1.04, .97); } 100% { transform: none; } }
.td-quilt { position: absolute; left: 0; right: 0; bottom: 0; height: 66%; border-radius: 24px 24px 0 0; cursor: grab;
  background: radial-gradient(circle at 20% 30%, rgba(255,255,255,.18) 0 6px, transparent 7px) 0 0 / 46px 46px, linear-gradient(45deg, #8FB8E8 25%, #A9C9EE 25% 50%, #8FB8E8 50% 75%, #A9C9EE 75%) 0 0 / 46px 46px;
  box-shadow: 0 -8px 20px rgba(0,0,0,.3), inset 0 4px 0 #cfe2f7; display: grid; justify-items: center; align-content: start; padding-top: 10px; }
.td-quiltPull { font: 700 11px/1 var(--vw-font-ui), sans-serif; letter-spacing: .2em; color: #2C3566; padding: 5px 10px; border-radius: 99px; background: rgba(255,255,255,.7); animation: td-pull 1.4s ease-in-out infinite; }
@keyframes td-pull { 50% { transform: translateY(-5px); } }

/* ── ending ── */
.td-endSec { gap: 14px; }
.td-endTeddy { position: relative; width: 120px; }
.td-zzz { position: absolute; right: -24px; top: 0; font: 700 18px/1 var(--vw-font-ui), sans-serif; color: #BFD7FF; animation: td-zzz 2.4s ease-in-out infinite; }
@keyframes td-zzz { 0% { opacity: 0; transform: translateY(6px); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateY(-14px); } }
.td-endLine { margin: 0; max-width: 30ch; font: italic 600 clamp(19px, 5.2vw, 25px)/1.35 var(--vw-font-serif), serif; color: #FFF8F0; text-wrap: balance; }
.td-certCard { display: grid; gap: 4px; width: min(100%, 420px); box-sizing: border-box; padding: 14px 16px; border-radius: 14px; background: #FFFBF4; color: #3A2A4A; border: 3px double #E8A0B4; }
.td-certCard b { font: 700 13px/1 var(--vw-font-ui), sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #C2185B; }
.td-certCard span { font: 500 14.5px/1.4 var(--vw-font-serif), serif; }
.td-ps { all: unset; box-sizing: border-box; cursor: pointer; display: flex; gap: 12px; align-items: center; justify-content: center; width: min(100%, 420px); min-height: 56px; padding: 14px 18px; border-radius: 6px; background: #F4ECF8; color: #3A2A4A; font: 600 15px/1.4 var(--vw-font-ui), sans-serif; box-shadow: 0 16px 30px -16px #000; text-align: left; }
.td-ps.is-open { display: block; background: #FFFBF4; }
.td-psTx { display: block; white-space: pre-wrap; font: 500 16px/1.55 var(--vw-font-serif), serif; user-select: text; -webkit-user-select: text; }
.td-psSeal { display: grid; place-items: center; flex: none; width: 36px; height: 36px; border-radius: 50%; color: #FFF1BF; background: radial-gradient(circle at 35% 30%, #ff8fb8, #c2185b 55%, #7e1236); }
.td-credit { margin: 4px 0 0; font: 600 11.5px/1 var(--vw-font-ui), sans-serif; letter-spacing: .1em; color: rgba(255,248,240,.55); }

@media (max-height: 700px) { .td-sec { gap: 10px; padding-top: 64px; } .td-fort { height: 160px; } }
@media (prefers-reduced-motion: reduce) {
  .td-weather, .td-tail, .td-fairy i, .td-handle, .td-target, .td-heartGrab.is-warm, .td-chestGlow, .td-wake .td-eyes, .td-wake .td-armR, .td-quiltPull, .td-zzz, .td-drape { animation: none !important; }
  .td-dolly, .td-lightsOut, .td-wake .td-body, .td-wake .td-head, .td-dropHeart, .td-bubble, .td-said, .td-peekTeddy, .td-seekTeddy.is-diving, .td-sleepy.is-jelly, .td-blush { animation-duration: .01s !important; }
  .td-pillow, .td-pillowCase, .td-flap { transition-duration: .01s; }
}
`;
