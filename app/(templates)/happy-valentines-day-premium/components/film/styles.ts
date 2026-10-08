// "Our Film" — the shared stylesheet (one <style> for the whole Experience). Prefix fm-. Transforms + opacity
// for every animation; filters only on static layers (the black-and-white grade is a static filter).

export const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Skip chips sit just under the letterbox bar (the bars are above the scene layer). */
export const SKIP_UNDER_BARS = { top: "calc(var(--fm-bar, 9vh) + 10px)" } as const;

export const FILM_CSS = `
.fm-root { --fm-black: #0B0A0C; --fm-red: #7A0E1C; --fm-warm: #FFE7B3; --fm-gold: #D4AF37; --fm-silver: #C9CDD3; --fm-rose: #FF5C8A; --fm-fgold: #FFD36E;
  --fm-bar: 9vh; position: relative; color: var(--fm-warm); }
.fm-scene { position: relative; z-index: 2; min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box; display: grid; place-items: center;
  padding: calc(var(--fm-bar) + 28px) 16px calc(var(--fm-bar) + 28px); text-align: center; }
.fm-col { width: min(100%, 560px); display: grid; justify-items: center; gap: 16px; }
.fm-kick { margin: 0; font: 700 11px/1.3 var(--fm-type); letter-spacing: .32em; text-transform: uppercase; color: var(--fm-gold); }
.fm-h { margin: 0; font: 400 clamp(32px, 9vw, 64px)/1.02 var(--fm-display); letter-spacing: -.01em; color: #FFF6E4; text-wrap: balance; }
.fm-h em { font-style: italic; color: var(--fm-fgold); }
.fm-sub { margin: 0; font: 400 italic clamp(16px, 4.4vw, 20px)/1.45 var(--fm-book); color: rgba(255,231,179,.82); max-width: 34ch; text-wrap: pretty; }
.fm-hint { margin: 0; font: 600 13px/1.4 var(--fm-type); letter-spacing: .04em; color: rgba(255,231,179,.7); }
.fm-btn { position: relative; min-height: 50px; padding: 0 26px; border: 0; border-radius: 99px; cursor: pointer; color: #1A1206;
  font: 700 15px/1 var(--fm-type); letter-spacing: .06em; text-transform: uppercase;
  background: linear-gradient(135deg, #FFF1BF, #E2B44A 45%, #A6751C); box-shadow: 0 14px 30px -14px rgba(226,180,74,.8), inset 0 1px 0 rgba(255,255,255,.6);
  transition: transform .25s cubic-bezier(.22,1,.36,1); }
.fm-btn:active { transform: scale(.97); }
.fm-ghost { min-height: 46px; padding: 0 20px; border-radius: 99px; cursor: pointer; background: rgba(255,231,179,.06); color: var(--fm-warm);
  border: 1px solid rgba(255,231,179,.3); font: 700 13px/1 var(--fm-type); letter-spacing: .08em; text-transform: uppercase; }
.fm-btn:focus-visible, .fm-ghost:focus-visible, .fm-root button:focus-visible { outline: 3px solid var(--fm-fgold); outline-offset: 3px; }
.fm-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.fm-sr { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }

/* Atmosphere: grain, vignette, curtains (wide screens), the projector beam. */
.fm-grain { position: fixed; inset: -50%; z-index: 55; pointer-events: none; opacity: var(--fm-grain, .07); mix-blend-mode: overlay;
  background-image: ${GRAIN_URL}; background-size: 180px 180px; animation: fm-grain .42s steps(5) infinite; transition: opacity .8s; }
@keyframes fm-grain { 0% { transform: translate(0,0); } 20% { transform: translate(-3%,2%); } 40% { transform: translate(2%,-3%); } 60% { transform: translate(-2%,-1%); } 80% { transform: translate(3%,3%); } 100% { transform: translate(0,0); } }
.fm-vig { position: fixed; inset: 0; z-index: 54; pointer-events: none; background: radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%); }
.fm-curtains { display: none; }
.fm-root.is-bw .fm-curtains { filter: grayscale(1) brightness(.7); }
@media (min-width: 1024px) {
  .fm-curtains { display: block; position: fixed; inset: 0; z-index: 1; pointer-events: none; }
  .fm-curtain { position: absolute; top: 0; bottom: 0; width: calc((100vw - min(1180px, 74vw)) / 2 + 30px);
    background: repeating-linear-gradient(90deg, #4a0711 0 14px, #7A0E1C 30px, #9b1a2b 40px, #6a0b18 54px, #3c050d 64px);
    box-shadow: inset 0 -120px 120px -40px rgba(0,0,0,.7); }
  .fm-curtain::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.45), transparent 22%, transparent 70%, rgba(0,0,0,.6)); }
  .fm-curtain.is-l { left: 0; border-right: 3px solid rgba(212,175,55,.35); transform-origin: left; }
  .fm-curtain.is-r { right: 0; border-left: 3px solid rgba(212,175,55,.35); }
  .fm-valance { position: absolute; left: 0; right: 0; top: 0; height: 46px; background: repeating-radial-gradient(circle at 50% -10px, #8d1324 0 30px, #5a0914 31px 44px);
    box-shadow: 0 8px 24px rgba(0,0,0,.6); border-bottom: 2px solid rgba(212,175,55,.45); }
}
.fm-weave { animation: fm-weave .25s steps(6) infinite; }
@keyframes fm-weave { 0% { transform: translate(0,0); } 33% { transform: translate(.5px,-.6px); } 66% { transform: translate(-.4px,.4px); } 100% { transform: translate(0,0); } }

/* Gate ticket */
.fm-ticketWrap { position: relative; display: grid; place-items: center; width: 100%; height: 100%; }
.fm-ticket { position: relative; width: min(300px, 74vw); aspect-ratio: 1.9; display: grid; grid-template-columns: 1fr 26%; transform: rotate(-4deg);
  filter: drop-shadow(0 22px 30px rgba(0,0,0,.6)); }
.fm-tMain, .fm-tStub { position: relative; background: linear-gradient(150deg, #FFE9B8, #F2C76B 55%, #D9A443); color: #3B1408; }
.fm-tMain { border-radius: 10px 0 0 10px; padding: 10px 12px; display: grid; align-content: center; justify-items: start; gap: 2px; text-align: left;
  -webkit-mask: radial-gradient(circle at 0 50%, transparent 9px, #000 10px); mask: radial-gradient(circle at 0 50%, transparent 9px, #000 10px); }
.fm-tStub { border-radius: 0 10px 10px 0; border-left: 2px dashed rgba(59,20,8,.45); display: grid; place-items: center;
  -webkit-mask: radial-gradient(circle at 100% 50%, transparent 9px, #000 10px); mask: radial-gradient(circle at 100% 50%, transparent 9px, #000 10px); }
.fm-tStub b { writing-mode: vertical-rl; transform: rotate(180deg); font: 700 11px/1 var(--fm-type); letter-spacing: .3em; }
.fm-tAdmit { font: 700 clamp(17px, 5vw, 22px)/1 var(--fm-display); letter-spacing: .12em; }
.fm-tName { font: 600 italic clamp(15px, 4.4vw, 19px)/1.1 var(--fm-display); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fm-tFine { font: 700 9px/1.3 var(--fm-type); letter-spacing: .14em; text-transform: uppercase; opacity: .78; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fm-tSticker { position: absolute; right: -6px; top: -34px; transform: rotate(8deg); }
.fm-gateBg { background: radial-gradient(60% 50% at 50% 38%, rgba(255,231,179,.16), transparent 70%), radial-gradient(130% 80% at 50% 120%, #3a0a12 0%, #12090C 55%, #0B0A0C 100%) !important; }
.fm-gateBg .pm-gateName { font-family: var(--fm-display) !important; font-weight: 400 !important; }
.fm-gateSub { display: grid; gap: 4px; }
.fm-gateSub i { font: 400 italic 17px/1.3 var(--fm-display); color: var(--fm-fgold); }
.fm-gateSub small { font: 700 11px/1.3 var(--fm-type); letter-spacing: .18em; text-transform: uppercase; opacity: .75; }

/* Film leader */
.fm-leader { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; background: #15130f; overflow: hidden; }
.fm-beam { position: absolute; left: 50%; top: -10%; width: 160vmax; height: 130vh; transform: translateX(-50%); pointer-events: none;
  background: conic-gradient(from 165deg at 50% 0%, transparent 0deg, rgba(255,231,179,.16) 10deg, rgba(255,231,179,.26) 15deg, rgba(255,231,179,.16) 20deg, transparent 30deg);
  animation: fm-beamFlick 2.2s steps(11) infinite; }
@keyframes fm-beamFlick { 0%, 100% { opacity: .9; } 18% { opacity: .6; } 40% { opacity: 1; } 63% { opacity: .75; } 80% { opacity: .95; } }
.fm-ldr { position: relative; width: min(78vmin, 520px); aspect-ratio: 1; display: grid; place-items: center; }
.fm-ldr svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.fm-ldrNum { position: relative; font: 400 min(46vmin, 300px)/1 var(--fm-display); color: #f4ead6; text-shadow: 0 0 30px rgba(255,231,179,.35); }
.fm-ldrSweep { transform-origin: 50% 50%; animation: fm-sweep 1s linear infinite; }
@keyframes fm-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.fm-ldrFlash { position: absolute; inset: 0; background: #fff6e0; opacity: 0; pointer-events: none; }
.fm-ldrFlash.is-on { animation: fm-flash .32s ease-out; }
@keyframes fm-flash { 0% { opacity: .7; } 100% { opacity: 0; } }

/* Titles */
.fm-card { display: grid; justify-items: center; gap: 14px; cursor: pointer; width: min(100%, 760px); }
.fm-card .fm-presents { font: 400 clamp(15px, 4.2vw, 20px)/1.2 var(--fm-display); letter-spacing: .42em; text-transform: uppercase; color: var(--fm-warm); }
.fm-card .fm-presents b { display: block; margin-bottom: 10px; font: 400 clamp(30px, 9vw, 92px)/1 var(--fm-display); letter-spacing: .06em; text-transform: none; color: #fff6e4; }
.fm-in { animation: fm-in 1.1s cubic-bezier(.16,1,.3,1) both; }
@keyframes fm-in { from { opacity: 0; letter-spacing: .6em; transform: scale(1.06); } to { opacity: 1; } }
.fm-rise { animation: fm-rise .9s cubic-bezier(.16,1,.3,1) both; }
@keyframes fm-rise { from { opacity: 0; transform: translateY(14px); } }
.fm-starring { font: 700 12px/1 var(--fm-type); letter-spacing: .5em; text-transform: uppercase; color: var(--fm-gold); }
.fm-bigName { margin: 0; font: 400 clamp(54px, 17vw, 140px)/.95 var(--fm-display); color: var(--fm-fgold); text-shadow: 0 0 40px rgba(212,175,55,.35); overflow-wrap: anywhere; }
.fm-titleCard { margin: 0; font: 400 italic clamp(40px, 11.5vw, 96px)/1 var(--fm-display); color: #fff6e4; text-wrap: balance; }
.fm-rule { width: 64px; height: 1px; background: linear-gradient(90deg, transparent, var(--fm-gold), transparent); }
.fm-prev { display: grid; gap: 14px; justify-items: center; width: min(100%, 520px); }
.fm-frameStrip { position: relative; width: 100%; padding: 0 26px; background: #0d0b09; border-radius: 6px; box-shadow: 0 20px 50px -20px #000; }
.fm-frameStrip::before, .fm-frameStrip::after { content: ""; position: absolute; top: 0; bottom: 0; width: 14px;
  background: repeating-linear-gradient(180deg, transparent 0 7px, rgba(255,240,210,.8) 7px 16px, transparent 16px 23px); }
.fm-frameStrip::before { left: 6px; } .fm-frameStrip::after { right: 6px; }
.fm-frame { aspect-ratio: 4/3; display: grid; align-content: center; justify-items: center; gap: 12px; padding: 18px; box-sizing: border-box;
  background: radial-gradient(120% 90% at 50% 40%, #3b2b1e, #17110c 75%); color: #f6e9cf; border-block: 6px solid #0d0b09; }
.fm-frame .fm-day { font: 700 11px/1 var(--fm-type); letter-spacing: .3em; text-transform: uppercase; color: var(--fm-gold); }
.fm-frame p { margin: 0; font: 400 italic clamp(20px, 5.6vw, 28px)/1.3 var(--fm-display); text-wrap: balance; }
.fm-dots { display: flex; gap: 6px; }
.fm-dots i { width: 6px; height: 6px; border-radius: 3px; background: rgba(255,231,179,.25); transition: width .3s, background .3s; }
.fm-dots i.is-on { width: 18px; background: var(--fm-gold); }

/* Stars */
.fm-skySticker { position: absolute; right: 2%; bottom: 2%; pointer-events: none; }
.fm-sky { position: relative; width: min(88vw, 560px, 52vh); aspect-ratio: 1; touch-action: none; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(40,40,90,.55), rgba(11,10,12,0) 100%); }
.fm-sky svg { width: 100%; height: 100%; overflow: visible; display: block; }
.fm-bgStars circle { fill: #fff; }
.fm-twA { animation: fm-tw 3.2s ease-in-out infinite; } .fm-twB { animation: fm-tw 4.1s ease-in-out -1.7s infinite; }
@keyframes fm-tw { 0%, 100% { opacity: .9; } 50% { opacity: .25; } }
.fm-star { transition: transform 1.6s cubic-bezier(.65,0,.35,1); }
.fm-star .fm-core { fill: #fff8e6; }
.fm-star .fm-halo { fill: rgba(255,231,179,.22); transform-box: fill-box; transform-origin: center; }
.fm-star.is-next .fm-halo { animation: fm-pulse 1.1s ease-in-out infinite; fill: rgba(255,211,110,.45); }
.fm-star.is-lit .fm-core { fill: var(--fm-fgold); }
@keyframes fm-pulse { 0%, 100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.9); opacity: .25; } }
.fm-link { stroke: rgba(255,231,179,.85); stroke-width: .5; stroke-linecap: round; filter: drop-shadow(0 0 1.5px rgba(255,211,110,.9)); }
.fm-links { transition: opacity .8s; }
.fm-heartPath { fill: none; stroke: rgba(255,211,110,.55); stroke-width: .4; stroke-dasharray: 200; stroke-dashoffset: 200; animation: fm-draw 2.2s 1.2s ease-in-out forwards; filter: drop-shadow(0 0 1px rgba(255,211,110,.8)); }
.fm-initials { font-family: var(--fm-display); font-size: 15px; fill: none; stroke: var(--fm-fgold); stroke-width: .35; stroke-dasharray: 140; stroke-dashoffset: 140; }
.fm-initials.is-on { animation: fm-draw 2.4s .9s cubic-bezier(.45,0,.2,1) forwards, fm-fill .9s 3s forwards; }
@keyframes fm-draw { to { stroke-dashoffset: 0; } }
@keyframes fm-fill { to { fill: rgba(255,211,110,.92); } }
.fm-caption { margin: 0; font: 400 italic clamp(17px, 4.6vw, 21px)/1.45 var(--fm-book); color: rgba(255,231,179,.9); max-width: 32ch; }

/* Montage */
.fm-mont { position: relative; width: min(100%, 520px); display: grid; gap: 12px; justify-items: center; }
.fm-screen { position: relative; width: 100%; aspect-ratio: 4/5; max-height: 60vh; overflow: hidden; background: #000; border-radius: 4px; touch-action: none;
  box-shadow: 0 30px 80px -30px #000, 0 0 0 1px rgba(255,231,179,.08); cursor: pointer; -webkit-touch-callout: none; }
@media (min-width: 768px) { .fm-mont { width: min(100%, 900px, 112vh); } .fm-screen { aspect-ratio: 16/9; max-height: 64vh; } }
.fm-shot { position: absolute; inset: 0; opacity: 0; }
.fm-shot.is-on { opacity: 1; z-index: 1; }
.fm-shot.is-fade { transition: opacity .7s ease; }
.fm-kb { position: absolute; inset: 0; will-change: transform; animation: fm-kb var(--fm-shot, 3200ms) linear both; }
.fm-shot:not(.is-on) .fm-kb { animation: none; }
.fm-screen.is-held .fm-kb, .fm-screen.is-freeze .fm-kb { animation-play-state: paused; }
@keyframes fm-kb { from { transform: scale(var(--s0)) translate(var(--x0), var(--y0)); } to { transform: scale(var(--s1)) translate(var(--x1), var(--y1)); } }
.fm-back { position: absolute !important; inset: -6%; width: 112% !important; height: 112% !important; filter: blur(26px) brightness(.55); display: none !important; }
.fm-fore { position: absolute !important; inset: 0; }
@media (min-width: 768px) { .fm-back { display: block !important; } .fm-fore { inset: 0 auto 0 50%; width: auto !important; aspect-ratio: 4/5; transform: translateX(-50%); box-shadow: 0 0 60px 20px rgba(0,0,0,.6); } }
.fm-lower { position: absolute; z-index: 4; left: 14px; right: 14px; bottom: 16px; text-align: left; display: grid; gap: 4px; pointer-events: none; }
.fm-lower span { font: 700 10px/1 var(--fm-type); letter-spacing: .32em; text-transform: uppercase; color: var(--fm-fgold); text-shadow: 0 1px 6px #000; }
.fm-lower b { font: 400 italic clamp(19px, 5vw, 28px)/1.15 var(--fm-display); color: #fff; text-shadow: 0 2px 14px rgba(0,0,0,.9); font-variant: small-caps; }
.fm-lower.fm-rise { animation-delay: .35s; }
.fm-shade { position: absolute; inset: auto 0 0 0; height: 45%; z-index: 3; background: linear-gradient(transparent, rgba(0,0,0,.72)); pointer-events: none; }
.fm-leak { position: absolute; inset: -20% -60%; z-index: 5; pointer-events: none; mix-blend-mode: screen; opacity: 0;
  background: radial-gradient(40% 60% at 50% 50%, rgba(255,140,60,.95), rgba(255,92,138,.6) 45%, transparent 70%); }
.fm-leak.is-go { animation: fm-leak .9s ease-in-out both; }
@keyframes fm-leak { 0% { opacity: 0; transform: translateX(-60%); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateX(60%); } }
.fm-burn { position: absolute; inset: 0; z-index: 5; pointer-events: none; opacity: 0;
  background: radial-gradient(circle at 62% 40%, #fff7d6 0 8%, #ffcf6b 16%, #ff7a1a 26%, rgba(120,20,0,.9) 36%, transparent 48%); }
.fm-burn.is-go { animation: fm-burn 1.1s ease-in both; }
@keyframes fm-burn { 0% { opacity: 0; transform: scale(.2); } 30% { opacity: 1; } 70% { opacity: 1; transform: scale(3.2); } 100% { opacity: 0; transform: scale(3.6); } }
.fm-flutter { position: absolute; inset: 0; z-index: 6; pointer-events: none; background: rgba(255,240,210,.12); opacity: 0; }
.fm-screen.is-held .fm-flutter { animation: fm-flut .5s steps(5) 1; }
@keyframes fm-flut { 0%, 40%, 80% { opacity: 1; } 20%, 60%, 100% { opacity: 0; } }
.fm-badge { position: absolute; z-index: 6; top: 12px; left: 12px; padding: 6px 10px; border-radius: 6px; background: rgba(0,0,0,.55); color: #fff;
  font: 700 10px/1 var(--fm-type); letter-spacing: .2em; text-transform: uppercase; }
.fm-tbc { position: absolute; inset: 0; z-index: 7; display: grid; place-items: center; background: rgba(0,0,0,.35); pointer-events: none; }
.fm-tbc b { font: 400 italic clamp(28px, 8vw, 56px)/1 var(--fm-display); color: #fff6e4; text-shadow: 0 4px 30px #000; }
.fm-bar { width: 100%; height: 3px; border-radius: 3px; background: rgba(255,231,179,.15); overflow: hidden; }
.fm-bar i { display: block; height: 100%; width: 0; background: var(--fm-gold); }
.fm-strip { position: relative; width: 100%; display: flex; gap: 4px; padding: 8px 18px; box-sizing: border-box; background: #0d0b09; border-radius: 4px; touch-action: none; cursor: ew-resize; }
.fm-strip::before, .fm-strip::after { content: ""; position: absolute; left: 0; right: 0; height: 4px; background: repeating-linear-gradient(90deg, transparent 0 5px, rgba(255,240,210,.55) 5px 10px); }
.fm-strip::before { top: 2px; } .fm-strip::after { bottom: 2px; }
.fm-cell > span { pointer-events: none; }
.fm-cell { flex: 1; min-width: 0; height: 40px; border: 0; padding: 0; border-radius: 2px; overflow: hidden; opacity: .45; cursor: pointer; background: #222; transition: opacity .2s, transform .2s; }
.fm-cell.is-on { opacity: 1; transform: scaleY(1.12); box-shadow: 0 0 0 2px var(--fm-gold); }
.fm-ctrl { display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; }

/* Commentary */
.fm-script { width: min(100%, 520px); box-sizing: border-box; padding: 26px 22px; border-radius: 4px; text-align: left; color: #1d1712; background: #f4efe4;
  background-image: repeating-linear-gradient(180deg, transparent 0 27px, rgba(0,0,0,.035) 27px 28px); box-shadow: 0 30px 60px -30px #000; font: 400 15px/1.75 var(--fm-type); }
.fm-script .fm-slug { font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.fm-script .fm-who { display: block; margin: 18px 0 0; text-align: center; text-transform: uppercase; font-weight: 700; }
.fm-script .fm-par { display: block; text-align: center; font-style: italic; opacity: .7; }
.fm-script .fm-line { display: block; margin: 2px auto 0; max-width: 30ch; text-align: left; }
.fm-reels { display: flex; gap: 22px; align-items: center; justify-content: center; }
.fm-reel { width: 64px; height: 64px; border-radius: 50%; border: 3px solid rgba(255,231,179,.7); position: relative;
  background: radial-gradient(circle, #e8d8b8 0 9%, transparent 10%), repeating-conic-gradient(from 0deg, rgba(255,231,179,.65) 0 14deg, transparent 14deg 60deg); }
.fm-reel.is-spin { animation: fm-sweep 2.4s linear infinite; }
.fm-vnWrap .pm-vn { background: rgba(255,231,179,.07) !important; border-color: rgba(255,231,179,.22) !important; color: var(--fm-warm) !important; }
.fm-vnWrap .pm-vnLabel { font-family: var(--fm-type) !important; color: var(--fm-gold); }
.fm-vnWrap .pm-vnCap { font-family: var(--fm-book) !important; font-style: italic; font-size: 17px !important; }

/* Book */
.fm-desk { position: relative; width: min(100%, 560px); padding: 18px 10px 26px; box-sizing: border-box; }
.fm-lamp { position: absolute; left: 50%; top: -40px; width: 140%; height: 120%; transform: translateX(-50%); pointer-events: none;
  background: radial-gradient(50% 45% at 50% 30%, rgba(255,214,140,.22), transparent 70%); }
.fm-book { position: relative; perspective: 2600px; border-radius: 4px 10px 10px 4px; background: #5b1220; padding: 10px 10px 10px 16px;
  box-shadow: 0 30px 60px -24px #000, inset 6px 0 10px -4px rgba(0,0,0,.6); }
.fm-pages { position: relative; transform-style: preserve-3d; }
.fm-page { position: relative; min-height: 380px; padding: 30px 26px 54px; box-sizing: border-box; text-align: left; border-radius: 2px 6px 6px 2px; color: #2A1712;
  background: linear-gradient(90deg, rgba(0,0,0,.08), transparent 7%), #F6EBD6; box-shadow: inset -10px 0 18px -14px rgba(80,40,10,.4); }
.fm-page .fm-ch { margin: 0 0 4px; font: 700 10px/1 var(--fm-type); letter-spacing: .32em; text-transform: uppercase; color: #8E6A14; }
.fm-page h3 { margin: 0 0 16px; font: 400 italic clamp(30px, 8vw, 40px)/1 var(--fm-display); color: #3a1810; }
.fm-page .fm-text { margin: 0; font: 400 clamp(17px, 4.5vw, 19px)/1.62 var(--fm-book); white-space: pre-wrap; user-select: text; -webkit-user-select: text; }
.fm-page .fm-text::first-letter { float: left; font: 400 3.2em/.82 var(--fm-display); color: #7A0E1C; margin: 6px 8px 0 0; }
.fm-greet { margin: 0 0 10px; font: 400 italic clamp(19px, 5vw, 22px)/1.3 var(--fm-book); color: #5a2a1a; }
.fm-folio { position: absolute; left: 0; right: 0; bottom: 18px; text-align: center; font: 400 italic 13px/1 var(--fm-book); color: rgba(42,23,18,.55); }
.fm-leaf { position: absolute; inset: 0; transform-origin: 0 50%; transform-style: preserve-3d; pointer-events: none; z-index: 3; }
.fm-leaf > div { position: absolute; inset: 0; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.fm-leaf .fm-leafBack { transform: rotateY(180deg); background: linear-gradient(270deg, rgba(0,0,0,.1), transparent 10%), #EFE2C8; border-radius: 6px 2px 2px 6px; }
.fm-leaf .fm-curl { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, transparent 40%, rgba(0,0,0,var(--fm-curl, 0))); }
.fm-corner { position: absolute; right: 0; bottom: 0; z-index: 4; width: 64px; height: 64px; border: 0; padding: 0; cursor: grab; touch-action: none; background: transparent; }
.fm-corner::before { content: ""; position: absolute; right: 0; bottom: 0; width: 40px; height: 40px; border-radius: 0 0 6px 0;
  background: linear-gradient(135deg, transparent 50%, #e2d0ab 50%, #f8eedb 75%); box-shadow: -4px -4px 8px -4px rgba(0,0,0,.35); animation: fm-peel 2.4s ease-in-out infinite; transform-origin: 100% 100%; }
@keyframes fm-peel { 0%, 70%, 100% { transform: scale(1); } 80% { transform: scale(1.35); } }
.fm-sign { display: block; width: min(100%, 260px); height: 70px; margin: 14px 0 0 auto; }
.fm-sign text { font-family: var(--vw-font-script, cursive); font-size: 40px; fill: transparent; stroke: #3a1810; stroke-width: .9; stroke-dasharray: 600; stroke-dashoffset: 600; }
.fm-sign.is-on text { animation: fm-sign 2.6s .3s ease-in-out forwards, fm-signFill .8s 2.6s forwards; }
@keyframes fm-sign { to { stroke-dashoffset: 0; } }
@keyframes fm-signFill { to { fill: #3a1810; } }

/* Numbers */
.fm-cards { width: 100%; display: grid; grid-auto-flow: column; grid-auto-columns: min(78vw, 300px); gap: 14px; overflow-x: auto; padding: 6px 16px 14px; box-sizing: border-box;
  scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
.fm-cards::-webkit-scrollbar { display: none; }
@media (min-width: 900px) { .fm-swipeHint { display: none; } .fm-cards { grid-auto-flow: row; grid-template-columns: repeat(3, 1fr); grid-auto-columns: auto; overflow: visible; width: min(100%, 1040px); } }
.fm-stat { scroll-snap-align: center; min-height: 210px; display: grid; align-content: center; justify-items: center; gap: 10px; padding: 22px 16px; border-radius: 16px; text-align: center;
  background: linear-gradient(160deg, #1c1513, #0e0b0c); border: 1px solid rgba(212,175,55,.25); box-shadow: inset 0 1px 0 rgba(255,231,179,.08), 0 20px 40px -26px #000; }
.fm-stat small { font: 700 10px/1.3 var(--fm-type); letter-spacing: .28em; text-transform: uppercase; color: var(--fm-gold); }
.fm-stat .fm-val { font: 400 clamp(38px, 11vw, 56px)/1 var(--fm-display); color: #fff6e4; font-variant-numeric: tabular-nums; }
.fm-stat .fm-val.is-text { font-size: clamp(24px, 7vw, 32px); font-style: italic; line-height: 1.15; }
.fm-stat p { margin: 0; font: 400 italic 15px/1.4 var(--fm-book); color: rgba(255,231,179,.75); }
.fm-stat.is-final { background: linear-gradient(160deg, #3a0a12, #160709); border-color: rgba(255,211,110,.5); }
.fm-reelNum { display: inline-flex; overflow: hidden; height: 1em; line-height: 1; }
.fm-digit { display: inline-block; height: 1em; overflow: hidden; }
.fm-digit > span { display: flex; flex-direction: column; transition: transform 1.4s cubic-bezier(.2,.9,.25,1.04); }
.fm-digit > span > i { font-style: normal; height: 1em; display: block; }
.fm-live { font: 700 13px/1 var(--fm-type); letter-spacing: .06em; color: var(--fm-fgold); font-variant-numeric: tabular-nums; }

/* Question (black and white) */
.fm-bw { filter: grayscale(1) contrast(1.12); }
.fm-spot { position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(38% 30% at 50% 58%, rgba(255,255,255,.28), transparent 70%), conic-gradient(from 168deg at 50% -8%, transparent 0deg, rgba(255,255,255,.14) 9deg, rgba(255,255,255,.2) 12deg, rgba(255,255,255,.14) 15deg, transparent 24deg); }
.fm-spot.is-on { animation: fm-spotOn .9s steps(4) both; }
@keyframes fm-spotOn { 0% { opacity: 0; } 25% { opacity: .8; } 50% { opacity: .2; } 100% { opacity: 1; } }
.fm-q { position: relative; z-index: 1; display: grid; gap: 18px; justify-items: center; width: min(100%, 600px); }
.fm-q h2 { margin: 0; font: 400 clamp(30px, 8.6vw, 58px)/1.08 var(--fm-display); color: #fff; text-wrap: balance; }
.fm-q h2 em { display: block; font-size: .6em; color: #ddd; margin-bottom: 8px; }
.fm-answers { display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap; min-height: 120px; }
.fm-yes { min-width: 160px; min-height: 76px; padding: 0 34px; border-radius: 99px; border: 0; cursor: pointer; font: 400 clamp(30px, 8vw, 40px)/1 var(--fm-display); letter-spacing: .1em;
  color: #111; background: radial-gradient(circle at 40% 30%, #fff, #e8e8e8 60%, #bcbcbc); box-shadow: 0 0 0 6px rgba(255,255,255,.12), 0 0 60px 10px rgba(255,255,255,.35);
  animation: fm-glow 2.2s ease-in-out infinite; }
@keyframes fm-glow { 0%, 100% { box-shadow: 0 0 0 6px rgba(255,255,255,.12), 0 0 40px 6px rgba(255,255,255,.28); } 50% { box-shadow: 0 0 0 10px rgba(255,255,255,.06), 0 0 80px 16px rgba(255,255,255,.45); } }
.fm-yes.is-rising { animation: fm-rise2 1.1s cubic-bezier(.5,0,.2,1) forwards; }
@keyframes fm-rise2 { to { transform: scale(1.35); box-shadow: 0 0 0 30px rgba(255,255,255,0), 0 0 160px 60px rgba(255,255,255,.7); } }
.fm-no { min-height: 44px; min-width: 64px; padding: 0 16px; border-radius: 99px; cursor: pointer; background: transparent; color: #ddd; border: 1px solid rgba(255,255,255,.4);
  font: 700 14px/1 var(--fm-type); letter-spacing: .1em; transition: transform .4s cubic-bezier(.22,1,.36,1); }
.fm-takeLine { min-height: 1.5em; margin: 0; font: 400 italic clamp(17px, 4.6vw, 20px)/1.4 var(--fm-book); color: #eee; }
.fm-clap { position: fixed; left: 50%; top: 33%; z-index: 80; width: min(64vw, 270px); transform: translate(-50%, -50%); pointer-events: none; }
.fm-clap.is-go { animation: fm-clapIn 1.3s cubic-bezier(.2,.9,.2,1) both; }
@keyframes fm-clapIn { 0% { opacity: 0; transform: translate(-50%, -30%) rotate(-8deg) scale(.8); } 15% { opacity: 1; transform: translate(-50%, -50%) rotate(-3deg) scale(1); } 75% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -60%) rotate(-3deg) scale(.96); } }
.fm-clapTop { transform-origin: 6% 100%; }
.fm-clap.is-go .fm-clapTop { animation: fm-clapSnap .3s .12s ease-in both; }
@keyframes fm-clapSnap { from { transform: rotate(-24deg); } to { transform: rotate(0deg); } }
.fm-rising { position: fixed; inset: 0; z-index: 66; pointer-events: none; background: radial-gradient(circle at var(--ox) var(--oy), rgba(255,255,255,.9), transparent 60%); opacity: 0; animation: fm-whiten 1.1s ease-in forwards; }
@keyframes fm-whiten { to { opacity: .85; } }
.fm-heart { display: inline-block; font-size: 18px; animation: fm-beat .75s ease-in-out infinite; }
@keyframes fm-beat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.25); } 30% { transform: scale(1); } 45% { transform: scale(1.18); } }

/* YES: colour flood, fireworks, credits, post-credits */
.fm-flood { position: fixed; inset: 0; z-index: 68; overflow: hidden; clip-path: circle(0% at var(--ox) var(--oy)); animation: fm-flood 1.3s cubic-bezier(.6,0,.2,1) forwards;
  background: radial-gradient(70% 45% at 50% 0%, rgba(255,140,90,.28), transparent 70%), radial-gradient(130% 85% at 50% 105%, #d21f45 0%, #8a1030 28%, #3d0818 58%, #14060b 85%, #0b0508 100%); }
@keyframes fm-flood { to { clip-path: circle(150% at var(--ox) var(--oy)); } }
.fm-flood.is-fade { clip-path: none; animation: fm-fadeIn .6s ease both; }
@keyframes fm-fadeIn { from { opacity: 0; } }
.fm-world { position: relative; min-height: calc(100dvh - var(--vw-dock-space, 0px)); z-index: 2;
  background: radial-gradient(70% 45% at 50% 0%, rgba(255,140,90,.28), transparent 70%), radial-gradient(130% 85% at 50% 105%, #d21f45 0%, #8a1030 28%, #3d0818 58%, #14060b 85%, #0b0508 100%); }
.fm-fw { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.fm-yesTitle { position: relative; z-index: 3; display: grid; gap: 10px; justify-items: center; padding: 33vh 16px 0; text-align: center; }
.fm-yesTitle h2 { margin: 0; font: 400 clamp(46px, 13vw, 110px)/.95 var(--fm-display); color: #fff6e4; text-shadow: 0 0 40px rgba(255,92,138,.55); }
.fm-yesTitle h2 em { color: var(--fm-fgold); }
.fm-initCard { position: relative; z-index: 3; margin: 24px auto 0; font: 400 clamp(54px, 16vw, 120px)/1 var(--fm-display); color: var(--fm-fgold); text-shadow: 0 0 30px rgba(255,211,110,.8), 0 0 80px rgba(255,92,138,.6); }
.fm-credits { position: relative; height: calc(100dvh - var(--vw-dock-space, 0px)); overflow: hidden; background: #000; touch-action: none; cursor: ns-resize; z-index: 2; }
.fm-roll { position: absolute; left: 0; right: 0; top: 0; display: grid; justify-items: center; gap: 30px; padding: 0 16px; will-change: transform; text-align: center; }
.fm-cr { display: grid; gap: 6px; }
.fm-cr small { font: 700 11px/1.3 var(--fm-type); letter-spacing: .3em; text-transform: uppercase; color: rgba(255,231,179,.6); }
.fm-cr b { font: 400 clamp(24px, 6.6vw, 36px)/1.15 var(--fm-display); color: #fff6e4; font-weight: 400; }
.fm-cr.is-title b { font-style: italic; font-size: clamp(36px, 10vw, 64px); color: var(--fm-fgold); }
.fm-cr.is-fine b { font: 400 italic 17px/1.5 var(--fm-book); color: rgba(255,231,179,.8); max-width: 30ch; }
.fm-blooper { width: min(100%, 420px); display: grid; gap: 8px; font: 400 14px/1.5 var(--fm-type); color: rgba(255,231,179,.75); text-align: left; }
.fm-crSticker { position: absolute; right: 14px; bottom: 14px; z-index: 3; }
.fm-post { position: relative; z-index: 2; display: grid; justify-items: center; gap: 22px; padding: calc(60px + env(safe-area-inset-top, 0px)) 16px 40px; text-align: center;
  background: radial-gradient(80% 50% at 50% 0%, #2a0d14, #0B0A0C 70%); min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box; }
.fm-plan { position: relative; width: min(100%, 440px); display: grid; grid-template-columns: 1fr 70px; filter: drop-shadow(0 20px 30px rgba(0,0,0,.6)); }
.fm-plan > div { background: linear-gradient(150deg, #FFE9B8, #F2C76B 55%, #D9A443); color: #3B1408; }
.fm-plan .fm-pMain { border-radius: 12px 0 0 12px; padding: 18px 18px; text-align: left; display: grid; gap: 6px; }
.fm-plan .fm-pStub { border-radius: 0 12px 12px 0; border-left: 2px dashed rgba(59,20,8,.4); display: grid; place-items: center; font: 700 11px/1 var(--fm-type); letter-spacing: .3em; writing-mode: vertical-rl; }
.fm-pMain small { font: 700 10px/1 var(--fm-type); letter-spacing: .3em; text-transform: uppercase; }
.fm-pMain b { font: 400 italic clamp(20px, 5.4vw, 24px)/1.25 var(--fm-display); }
.fm-ps { width: min(100%, 440px); border: 1px dashed rgba(255,231,179,.45); border-radius: 14px; padding: 16px; background: rgba(255,231,179,.05); color: var(--fm-warm); cursor: pointer;
  font: 400 16px/1.55 var(--fm-book); text-align: left; white-space: pre-wrap; }
.fm-ps b { display: block; font: 700 11px/1.3 var(--fm-type); letter-spacing: .26em; text-transform: uppercase; color: var(--fm-gold); margin-bottom: 6px; }
.fm-poster { position: relative; width: min(74vw, 300px); aspect-ratio: 9/16; overflow: hidden; border-radius: 6px; background: #120a10; box-shadow: 0 40px 80px -30px #000, 0 0 0 1px rgba(212,175,55,.3); text-align: center; }
.fm-poster .fm-pPhoto { position: absolute; left: 0; right: 0; top: 0; height: 72%; }
.fm-poster .fm-pFade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,6,12,0) 30%, rgba(10,6,12,.85) 62%, #0a060c 75%); }
.fm-poster .fm-pTxt { position: absolute; left: 8%; right: 8%; bottom: 7%; display: grid; gap: 6px; justify-items: center; }
.fm-pTxt small { font: 700 8px/1.2 var(--fm-type); letter-spacing: .3em; text-transform: uppercase; color: var(--fm-gold); }
.fm-pTxt b { font: 400 clamp(22px, 7vw, 30px)/1 var(--fm-display); color: #fff6e4; }
.fm-pTxt i { font: 400 italic 11px/1.3 var(--fm-book); color: rgba(255,231,179,.85); }
.fm-pTxt em { font: 700 9px/1 var(--fm-type); letter-spacing: .26em; color: #fff6e4; font-style: normal; }
.fm-laurel { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); padding: 4px 10px; border-radius: 4px; background: rgba(0,0,0,.55); color: var(--fm-fgold); font: 700 8px/1 var(--fm-type); letter-spacing: .2em; white-space: nowrap; }
.fm-endWrap { width: min(100%, 460px); display: grid; gap: 16px; justify-items: center; }
.fm-endWrap .pm-reply { background: rgba(255,231,179,.06) !important; border-color: rgba(255,231,179,.25) !important; color: var(--fm-warm) !important; }
.fm-endWrap .pm-replyH { font-family: var(--fm-display) !important; font-weight: 400 !important; font-size: 22px !important; }
.fm-made { margin: 0; font: 700 11px/1.4 var(--fm-type); letter-spacing: .22em; text-transform: uppercase; color: rgba(255,231,179,.55); }

@media (min-width: 1024px) {
  .fm-root { --fm-bar: 8vh; }
  .fm-clap { left: 75%; top: 46%; }
  .fm-col { width: min(100%, 680px); }
}
@media (prefers-reduced-motion: reduce) {
  .fm-grain, .fm-weave, .fm-beam, .fm-ldrSweep, .fm-twA, .fm-twB, .fm-kb, .fm-reel.is-spin, .fm-yes, .fm-corner::before, .fm-heart, .fm-star.is-next .fm-halo { animation: none !important; }
  .fm-grain { display: none; }
  .fm-in, .fm-rise { animation: fm-fadeIn .4s ease both !important; }
  .fm-star { transition: none; }
  .fm-heartPath, .fm-initials.is-on { animation: none !important; stroke-dashoffset: 0; }
  .fm-initials.is-on { fill: rgba(255,211,110,.92); }
  .fm-sign.is-on text { animation: none !important; stroke-dashoffset: 0; fill: #3a1810; }
  .fm-digit > span { transition: none; }
  .fm-flood { clip-path: none !important; animation: fm-fadeIn .5s ease both !important; }
  .fm-leak, .fm-burn { display: none; }
  .fm-clap.is-go { animation: fm-fadeIn .2s ease both; }
  .fm-clap.is-go .fm-clapTop { animation: none; }
}
`;
