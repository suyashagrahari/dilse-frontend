// "Look Up" — one stylesheet for the whole Experience (prefix sk-). Transforms + opacity for motion; the only
// filters are on static layers. Fixed layers: night (z0) · city (z1) · drones (z2) · rooftop (z3) · scene (z4).

export const SKIP_TOP = { top: "calc(var(--sk-bar, 0px) + 64px)" } as const;

export const SKY_CSS = `
.sk-root { --sk-gold: #FFD27A; --sk-amber: #FFB45C; --sk-white: #F4F8FF; --sk-rose: #FF5C8A; --sk-navy: #0B1026; --sk-indigo: #1C1F4A;
  --sk-display: 'Oswald'; position: relative; color: var(--sk-white); font-family: var(--vw-font-ui, system-ui), sans-serif; }
.sk-root .sk-D { font-family: var(--sk-display), 'Arial Narrow', sans-serif; }
.sk-night { position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(120% 50% at 50% 100%, rgba(255,150,90,.18), transparent 60%), linear-gradient(180deg, #060918 0%, #0B1026 38%, #182058 78%, #2A2459 100%); }
.sk-night.is-show .sk-moon { opacity: 0; }
.sk-moon { transition: opacity 1.2s; position: absolute; right: 9%; top: 31%; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle at 38% 38%, #FFFBEA, #F1E6C2 60%, #D9C998);
  box-shadow: 0 0 40px 12px rgba(255,246,214,.18), 0 0 120px 40px rgba(160,180,255,.08); }
.sk-starsA i, .sk-starsB i { position: absolute; border-radius: 50%; background: #fff; }
.sk-starsA { position: absolute; inset: 0; animation: sk-tw 3.4s ease-in-out infinite; }
.sk-starsB { position: absolute; inset: 0; animation: sk-tw 4.6s ease-in-out -2s infinite; }
@keyframes sk-tw { 0%, 100% { opacity: .85; } 50% { opacity: .25; } }

.sk-city { position: fixed; left: 0; right: 0; bottom: 0; height: 46vh; z-index: 1; transition: transform 1.8s cubic-bezier(.6,0,.2,1); }
.sk-row { position: absolute; left: -2%; right: -2%; bottom: calc(7vh + var(--vw-dock-space, 0px)); display: flex; align-items: flex-end; }
.sk-row.is-far { height: 72%; opacity: .7; --bld: #1A2163; --win: rgba(255,214,140,.55); }
.sk-row.is-mid { height: 88%; --bld: #10164A; --win: rgba(255,210,122,.75); }
.sk-row.is-near { height: 100%; --bld: #080B26; --win: rgba(255,200,110,.85); }
.sk-b { position: relative; flex: none; background: var(--bld); border-radius: 2px 2px 0 0; box-shadow: inset 1px 0 0 rgba(255,255,255,.04); }
.sk-b::before { content: ""; position: absolute; inset: 10px 7px 0; opacity: var(--wa); transition: opacity .9s ease var(--wd), filter .9s ease var(--wd);
  background: repeating-linear-gradient(90deg, var(--win) 0 4px, transparent 4px 10px);
  -webkit-mask: repeating-linear-gradient(180deg, #000 0 5px, transparent 5px 13px); mask: repeating-linear-gradient(180deg, #000 0 5px, transparent 5px 13px); }
.sk-b::after { content: ""; position: absolute; inset: 22px 12px 30%; opacity: calc(var(--wa) * .9); transition: opacity .9s ease var(--wd);
  background: repeating-linear-gradient(90deg, transparent 0 10px, rgba(255,240,200,.95) 10px 14px, transparent 14px 26px);
  -webkit-mask: repeating-linear-gradient(180deg, transparent 0 18px, #000 18px 23px, transparent 23px 39px); mask: repeating-linear-gradient(180deg, transparent 0 18px, #000 18px 23px, transparent 23px 39px); }
.sk-city.is-wave .sk-b::before, .sk-city.is-wave .sk-b::after { opacity: 1; filter: brightness(1.35); }
.sk-ant { position: absolute; left: 50%; bottom: 100%; width: 2px; height: 26px; background: #0d1236; }
.sk-ant::after { content: ""; position: absolute; top: -3px; left: -2px; width: 6px; height: 6px; border-radius: 50%; background: #ff4d5e; box-shadow: 0 0 8px 2px rgba(255,77,94,.7); animation: sk-blink 1.6s steps(2) infinite; }
@keyframes sk-blink { 50% { opacity: .15; } }
.sk-mem { all: unset; position: absolute; left: 50%; top: 16%; width: 44px; height: 52px; transform: translateX(-50%); cursor: pointer; display: grid; place-items: center; z-index: 2; pointer-events: auto; }
.sk-mem i { width: 26px; height: 34px; border-radius: 3px; background: #151a44; border: 2px solid #2b3270; box-shadow: inset 0 0 0 1px rgba(0,0,0,.4); transition: background .4s, box-shadow .6s, border-color .4s;
  background-image: linear-gradient(90deg, transparent 46%, rgba(0,0,0,.45) 46% 54%, transparent 54%), linear-gradient(180deg, transparent 46%, rgba(0,0,0,.45) 46% 54%, transparent 54%); }
.sk-mem.is-hint i { animation: sk-hint 1.6s ease-in-out infinite; border-color: rgba(255,210,122,.6); }
@keyframes sk-hint { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,210,122,0); } 50% { box-shadow: 0 0 18px 4px rgba(255,210,122,.45); } }
.sk-mem.is-lit i { background-color: #FFD27A; border-color: #FFE7B0; box-shadow: 0 0 22px 6px rgba(255,190,90,.65), 0 0 60px 18px rgba(255,170,80,.25); }
.sk-mem:focus-visible i { outline: 3px solid var(--sk-gold); outline-offset: 3px; }

.sk-drones { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; transition: opacity .6s; }

.sk-roof { position: fixed; left: 0; right: 0; bottom: 0; height: calc(30vh + var(--vw-dock-space, 0px)); z-index: 3; pointer-events: none; transition: transform 1.8s cubic-bezier(.6,0,.2,1); }
.sk-ledge { position: absolute; left: 0; right: 0; bottom: 0; height: calc(8vh + var(--vw-dock-space, 0px));
  background: linear-gradient(180deg, rgba(255,180,92,calc(.18 + var(--warm, 0) * .35)) 0, #2A2440 3px, #1A1630 40%, #0E0C1E 100%); box-shadow: 0 -10px 30px -10px rgba(0,0,0,.6); }
.sk-lights { position: absolute; left: 0; right: 0; top: 0; width: 100%; height: 12vh; }
.sk-bulbs { position: absolute; left: 0; right: 0; top: 0; height: 12vh; }
.sk-bulbs i { position: absolute; width: 7px; height: 9px; margin: -2px 0 0 -3px; border-radius: 50% 50% 45% 45%; background: #FFE1A0; box-shadow: 0 0 10px 3px rgba(255,200,110,.7); animation: sk-bulb 2.6s ease-in-out infinite; }
@keyframes sk-bulb { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
.sk-drape { position: absolute; bottom: calc(8vh + var(--vw-dock-space, 0px)); height: 92vh; width: 15vw; max-width: 180px; opacity: .4; -webkit-mask: linear-gradient(180deg, #000 40%, transparent); mask: linear-gradient(180deg, #000 40%, transparent); transform-origin: top; animation: sk-sway 7s ease-in-out infinite;
  background: linear-gradient(90deg, rgba(255,240,230,.0), rgba(255,236,222,.22) 30%, rgba(255,240,230,.05) 60%, rgba(255,236,222,.18)); }
.sk-roof.is-away .sk-drape, .sk-roof.is-away .sk-bulbs, .sk-roof.is-away .sk-lights { opacity: 0; }
.sk-drape, .sk-bulbs, .sk-lights { transition: opacity 1s; }
.sk-drape.is-l { left: -2vw; border-radius: 0 0 60% 0; }
.sk-drape.is-r { right: -2vw; border-radius: 0 0 0 60%; animation-delay: -3s; }
@keyframes sk-sway { 0%, 100% { transform: skewX(0deg); } 50% { transform: skewX(2.5deg) scaleX(1.04); } }

.sk-scene { position: relative; z-index: 4; min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;
  padding: calc(var(--sk-bar, 0px) + 116px) 16px calc(var(--sk-bar, 0px) + 24px); text-align: center; pointer-events: none; }
.sk-scene > * { pointer-events: auto; }
.sk-kick { margin: 0; font: 600 12px/1.3 var(--sk-display), sans-serif; letter-spacing: .34em; text-transform: uppercase; color: var(--sk-gold); }
.sk-h { margin: 0; font: 500 italic clamp(34px, 9.5vw, 60px)/1.04 var(--sk-serif), Georgia, serif; color: #FFF7EA; text-wrap: balance; text-shadow: 0 2px 30px rgba(0,0,0,.6); }
.sk-sub { margin: 0; font: 500 italic clamp(18px, 4.8vw, 22px)/1.4 var(--sk-serif), Georgia, serif; color: rgba(244,248,255,.85); max-width: 30ch; text-wrap: pretty; }
.sk-hint { margin: 0; font: 600 13px/1.4 var(--vw-font-ui), sans-serif; color: rgba(244,248,255,.7); }
.sk-btn { min-height: 50px; padding: 0 26px; border: 0; border-radius: 99px; cursor: pointer; color: #1B1306; font: 600 15px/1 var(--sk-display), sans-serif; letter-spacing: .14em; text-transform: uppercase;
  background: linear-gradient(135deg, #FFF0C2, #FFD27A 45%, #E0A23F); box-shadow: 0 14px 30px -14px rgba(255,190,90,.8), inset 0 1px 0 rgba(255,255,255,.7); transition: transform .2s; }
.sk-btn:active { transform: scale(.97); }
.sk-ghost { min-height: 44px; padding: 0 18px; border-radius: 99px; cursor: pointer; color: var(--sk-white); background: rgba(244,248,255,.08); border: 1px solid rgba(244,248,255,.28);
  font: 600 13px/1 var(--sk-display), sans-serif; letter-spacing: .12em; text-transform: uppercase; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.sk-root button:focus-visible { outline: 3px solid var(--sk-gold); outline-offset: 3px; }
.sk-in { animation: sk-in .9s cubic-bezier(.16,1,.3,1) both; }
@keyframes sk-in { from { opacity: 0; transform: translateY(14px); } }
.sk-fade { animation: sk-fade 1.2s ease both; }
.sk-layer { position: relative; z-index: 4; pointer-events: none; }
@keyframes sk-fade { from { opacity: 0; } }
.sk-sr { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
.sk-grain { position: fixed; inset: -50%; z-index: 5; pointer-events: none; opacity: .035; mix-blend-mode: overlay; animation: sk-grain .5s steps(5) infinite;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
@keyframes sk-grain { 0% { transform: translate(0,0); } 25% { transform: translate(-3%,2%); } 50% { transform: translate(2%,-3%); } 75% { transform: translate(-2%,-1%); } }
.sk-hush { position: fixed; inset: 0; z-index: 1; pointer-events: none; background: rgba(2,4,14,.55); opacity: 0; transition: opacity 1.2s; }
.sk-hush.is-on { opacity: 1; }

/* Phone chat */
.sk-phone { width: min(300px, 74vw); box-sizing: border-box; border-radius: 26px; padding: 10px 10px 14px; background: linear-gradient(180deg, #121637, #0C0F2A);
  border: 1px solid rgba(244,248,255,.14); box-shadow: 0 30px 60px -20px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.06); text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, var(--vw-font-ui), sans-serif; }
.sk-phHead { display: grid; grid-template-columns: 30px 1fr auto; align-items: center; gap: 8px; padding: 4px 6px 10px; border-bottom: 1px solid rgba(244,248,255,.08); }
.sk-ava { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: 14px; color: #1B1306; background: linear-gradient(135deg, #FFE7B0, #FFB45C); }
.sk-phName { font-weight: 600; font-size: 14px; color: #fff; } .sk-phName b { color: var(--sk-rose); }
.sk-phOn { font-size: 11px; color: #7BE3A9; }
.sk-msgs { display: flex; flex-direction: column; gap: 7px; padding: 10px 4px 2px; }
.sk-slot { position: relative; align-self: flex-start; max-width: 86%; }
.sk-bub { display: inline-block; padding: 8px 12px; border-radius: 18px 18px 18px 6px; background: #2A2F66; color: #fff; font-size: 14.5px; line-height: 1.32; }
.sk-slot .sk-bub { animation: sk-pop .32s cubic-bezier(.3,1.4,.5,1) var(--bd, 0s) both; }
@keyframes sk-pop { from { opacity: 0; transform: scale(.6) translateY(6px); transform-origin: 0 100%; } }
.sk-typing { position: absolute; left: 0; bottom: 0; display: inline-flex; gap: 4px; padding: 10px 12px; border-radius: 18px 18px 18px 6px; background: #2A2F66; opacity: 0; animation: sk-typ .9s var(--td, 0s) both; }
.sk-typing i { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.75); animation: sk-dot 1s ease-in-out infinite; }
.sk-typing i:nth-child(2) { animation-delay: .15s; } .sk-typing i:nth-child(3) { animation-delay: .3s; }
.sk-typing.is-live { position: static; opacity: 1; animation: none; }
@keyframes sk-typ { 0% { opacity: 0; } 12%, 88% { opacity: 1; } 100% { opacity: 0; } }
@keyframes sk-dot { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(-3px); opacity: 1; } }
.sk-out { align-self: flex-end; padding: 8px 12px; border-radius: 18px 18px 6px 18px; background: linear-gradient(135deg, #FFD27A, #FFB45C); color: #1B1306; font-size: 14.5px; line-height: 1.32; max-width: 86%; }
.sk-meta { align-self: flex-start; font-size: 11px; color: rgba(244,248,255,.55); margin: -3px 0 0 6px; }
.sk-meta.is-out { align-self: flex-end; margin: -3px 6px 0 0; }
.sk-stk { align-self: flex-start; animation: sk-pop .32s cubic-bezier(.3,1.4,.5,1) var(--bd, 0s) both; }
.sk-gate::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 24vh; z-index: 1; pointer-events: none; opacity: .9;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200' viewBox='0 0 600 200'><g fill='%23080B26'><rect x='0' y='90' width='70' height='110'/><rect x='66' y='60' width='54' height='140'/><rect x='118' y='110' width='60' height='90'/><rect x='176' y='40' width='46' height='160'/><rect x='220' y='96' width='80' height='104'/><rect x='298' y='70' width='50' height='130'/><rect x='346' y='120' width='70' height='80'/><rect x='414' y='50' width='60' height='150'/><rect x='472' y='100' width='64' height='100'/><rect x='534' y='80' width='66' height='120'/></g><g fill='%23FFD27A' opacity='.7'><rect x='80' y='76' width='5' height='7'/><rect x='96' y='96' width='5' height='7'/><rect x='186' y='60' width='5' height='7'/><rect x='200' y='88' width='5' height='7'/><rect x='232' y='112' width='5' height='7'/><rect x='262' y='132' width='5' height='7'/><rect x='310' y='92' width='5' height='7'/><rect x='428' y='70' width='5' height='7'/><rect x='446' y='104' width='5' height='7'/><rect x='490' y='120' width='5' height='7'/><rect x='548' y='100' width='5' height='7'/><rect x='20' y='110' width='5' height='7'/></g></svg>") bottom left / auto 100% repeat-x; }
.sk-gate::before { content: ""; position: absolute; right: 6%; top: calc(7vh + 10px); width: 36px; height: 36px; border-radius: 50%; z-index: 1; pointer-events: none;
  background: radial-gradient(circle at 38% 38%, #FFFBEA, #F1E6C2 60%, #D9C998); box-shadow: 0 0 40px 12px rgba(255,246,214,.16); }
.sk-gateWrap { display: grid; place-items: center; width: 100%; height: 100%; }
.sk-gate .pm-gateArt { aspect-ratio: auto !important; height: auto !important; max-height: none !important; width: auto !important; animation: none !important; }
.sk-gate .pm-gateName { font-family: var(--sk-serif), Georgia, serif !important; font-style: italic; font-weight: 500 !important; }
.sk-gate .pm-gateIn { gap: 10px !important; }
@media (max-height: 760px) { .sk-gate .sk-phone { transform: scale(.88); transform-origin: top center; margin-bottom: -30px; } }

/* Candles */
.sk-candles { position: fixed; left: 0; right: 0; bottom: calc(5vh + var(--vw-dock-space, 0px)); z-index: 5; display: flex; justify-content: center; align-items: flex-end; gap: clamp(6px, 2.6vw, 36px); pointer-events: none; }
.sk-cbtn { all: unset; position: relative; cursor: pointer; pointer-events: auto; width: 46px; height: 120px; display: grid; place-items: end center; }
.sk-cbtn:focus-visible { outline: 3px solid var(--sk-gold); outline-offset: 2px; border-radius: 10px; }
.sk-candle { position: relative; display: block; width: 30px; height: calc(70px * var(--ch, 1)); pointer-events: none; }
.sk-wax { position: absolute; left: 3px; right: 3px; bottom: 10px; top: 22px; border-radius: 6px 6px 3px 3px; background: linear-gradient(90deg, #E9DCC6, #FFF8EA 40%, #D8C7AA); box-shadow: inset 0 3px 0 rgba(255,255,255,.6); }
.sk-holder { position: absolute; left: -4px; right: -4px; bottom: 0; height: 12px; border-radius: 50%; background: linear-gradient(180deg, #E6C27A, #8F6A2A); }
.sk-wick { position: absolute; left: 50%; top: 14px; width: 2px; height: 9px; margin-left: -1px; background: #2a2018; border-radius: 1px; }
.sk-flame { position: absolute; left: 50%; top: -6px; width: 14px; height: 24px; margin-left: -7px; opacity: 0; transform: scale(.2); transform-origin: 50% 100%; transition: opacity .3s, transform .5s cubic-bezier(.3,1.6,.5,1); }
.sk-flame i { position: absolute; inset: 0; border-radius: 50% 50% 45% 45% / 62% 62% 38% 38%; background: radial-gradient(ellipse at 50% 72%, #fff 0 18%, #FFE38A 30%, #FFB45C 58%, rgba(255,110,40,.0) 75%); animation: sk-flick .13s steps(2) infinite alternate; }
.sk-glow { position: absolute; left: 50%; top: -40px; width: 120px; height: 120px; margin-left: -60px; border-radius: 50%; background: radial-gradient(circle, rgba(255,190,90,.45), transparent 65%); opacity: 0; transition: opacity .8s; }
.sk-candle.is-lit .sk-flame { opacity: 1; transform: scale(1); }
.sk-candle.is-lit .sk-glow { opacity: 1; animation: sk-glowB 2.2s ease-in-out infinite; }
@keyframes sk-flick { from { transform: scaleY(1) skewX(-2deg); } to { transform: scaleY(1.08) skewX(2deg); } }
@keyframes sk-glowB { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
.sk-cbtn:not(.is-lit)::after { content: "tap"; position: absolute; bottom: -18px; left: 0; right: 0; font: 600 10px/1 var(--sk-display); letter-spacing: .2em; text-transform: uppercase; color: rgba(255,210,122,.6); }
.sk-match { position: relative; flex: none; align-self: flex-end; margin-bottom: 4px; z-index: 5; width: 74px; height: 46px; pointer-events: auto; border-radius: 8px; cursor: grab; touch-action: none;
  background: linear-gradient(180deg, #C8102E, #8D0A20); box-shadow: 0 10px 20px -8px #000; display: grid; place-items: center; color: #FFE7B0; font: 600 10px/1.1 var(--sk-display); letter-spacing: .14em; text-transform: uppercase; }
.sk-match::before { content: ""; position: absolute; left: 6px; right: 6px; bottom: 5px; height: 10px; border-radius: 3px; background: repeating-linear-gradient(90deg, #5b3a24 0 2px, #3a2516 2px 4px); }
.sk-match.is-lit { cursor: default; }
.sk-match .sk-spark { position: absolute; left: 50%; bottom: 10px; width: 6px; height: 6px; border-radius: 50%; background: #FFE38A; box-shadow: 0 0 16px 8px rgba(255,190,90,.8); opacity: 0; }
.sk-match.is-lit .sk-spark { animation: sk-spark .5s ease-out both; }
@keyframes sk-spark { 0% { opacity: 1; transform: scale(.5); } 100% { opacity: 0; transform: scale(3) translateY(-20px); } }
.sk-reason { min-height: 96px; display: grid; place-items: center; }
.sk-reason p { margin: 0; max-width: 24ch; font: 400 clamp(26px, 7vw, 38px)/1.2 var(--vw-font-script), cursive; color: #FFE7B0; text-shadow: 0 0 20px rgba(255,180,92,.6); }
.sk-count { font: 600 12px/1 var(--sk-display); letter-spacing: .3em; color: rgba(255,210,122,.7); }
.sk-warm { position: fixed; inset: 0; z-index: 3; pointer-events: none; background: radial-gradient(70% 40% at 50% 100%, rgba(255,170,80,.35), transparent 70%); opacity: var(--warm, 0); transition: opacity 1s; }

/* City of memories */
.sk-push { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 16px; background: radial-gradient(60% 50% at 50% 50%, rgba(40,30,60,.5), rgba(4,6,18,.9)); }
.sk-push.is-in { animation: sk-fade .45s ease both; }
.sk-frame { position: relative; width: min(78vw, 360px, 52vh); aspect-ratio: 4/5; border: 10px solid #2B2340; border-radius: 6px; overflow: hidden; background: #FFD27A;
  box-shadow: 0 0 0 2px #4A3D66, 0 0 80px 20px rgba(255,180,90,.4); animation: sk-pushIn .8s cubic-bezier(.16,1,.3,1) both; }
@keyframes sk-pushIn { from { transform: scale(.18); opacity: .4; } }
.sk-frame::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(90deg, transparent calc(50% - 3px), #2B2340 calc(50% - 3px) calc(50% + 3px), transparent calc(50% + 3px)), linear-gradient(180deg, transparent calc(45% - 3px), #2B2340 calc(45% - 3px) calc(45% + 3px), transparent calc(45% + 3px)), linear-gradient(180deg, rgba(255,200,120,.18), transparent 40%); opacity: .75; }
.sk-neon { margin: 18px 0 0; text-align: center; display: grid; gap: 4px; }
.sk-neon small { font: 600 12px/1 var(--sk-display); letter-spacing: .3em; text-transform: uppercase; color: #9FD8FF; text-shadow: 0 0 8px rgba(120,200,255,.9); }
.sk-neon b { font: 500 clamp(22px, 6vw, 30px)/1.15 var(--sk-display); color: #FFE4F0; text-shadow: 0 0 6px #FF5C8A, 0 0 18px #FF5C8A, 0 0 36px rgba(255,92,138,.6); max-width: 18ch; }
.sk-push .sk-row2 { display: flex; gap: 10px; margin-top: 16px; justify-content: center; }

/* Ring */
.sk-ringStage { position: relative; width: min(100%, 420px); height: max(280px, calc(100dvh - var(--vw-dock-space, 0px) - 23vh - 170px)); margin-top: 8px; }
.sk-box { position: absolute; left: 50%; top: 0; width: min(48vw, 210px, 30vh); transform: translateX(-50%); }
.sk-box.is-land { animation: sk-land 1s cubic-bezier(.2,.9,.25,1.15) both; }
@keyframes sk-land { from { opacity: 0; transform: translate(-50%, -120px) scale(.6); } }
.sk-ringRow { display: flex; gap: 10px; justify-content: center; min-height: 50px; margin-top: 10px; }
.sk-handWrap { position: absolute; left: 50%; bottom: 0; height: 64%; aspect-ratio: 240 / 300; transform: translateX(-50%); }
.sk-handWrap svg { height: 100% !important; width: auto !important; }
.sk-ring { position: absolute; left: 0; top: 0; width: 54px; touch-action: none; cursor: grab; z-index: 6; filter: drop-shadow(0 6px 10px rgba(0,0,0,.5)); }
.sk-ring:active { cursor: grabbing; }
.sk-ring::before { content: ""; position: absolute; inset: -16px; }
.sk-target { animation: sk-tgt 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes sk-tgt { 0%, 100% { opacity: .9; } 50% { opacity: .3; } }
.sk-onGem { animation: sk-gem 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes sk-gem { 0%, 100% { filter: drop-shadow(0 0 2px #fff); } 50% { filter: drop-shadow(0 0 8px #fff); } }
.sk-glint { animation: sk-glint 2.6s ease-in-out infinite; transform-box: fill-box; }
@keyframes sk-glint { 0% { transform: translateX(-30px); } 60%, 100% { transform: translateX(70px); } }
.sk-flee { position: absolute; z-index: 7; min-height: 40px; padding: 0 14px; border-radius: 99px; border: 1px solid rgba(244,248,255,.35); background: rgba(20,24,60,.75); color: #fff; cursor: pointer;
  font: 600 13px/1 var(--vw-font-ui), sans-serif; white-space: nowrap; transition: left .35s cubic-bezier(.3,1.4,.5,1), top .35s cubic-bezier(.3,1.4,.5,1); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.sk-flee.is-yes { background: linear-gradient(135deg, #FFF0C2, #FFD27A); color: #1B1306; border: 0; }
.sk-fleeLine { position: absolute; z-index: 7; font: 500 italic 16px/1.2 var(--sk-serif), serif; color: #FFE7B0; white-space: nowrap; pointer-events: none; animation: sk-in .5s both; }

/* YES */
.sk-yesChat { margin-top: auto; display: grid; justify-items: center; gap: 12px; width: 100%; }
.sk-heartBtn { all: unset; pointer-events: auto; position: fixed; z-index: 6; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; cursor: pointer; }
.sk-heartBtn:focus-visible { outline: 3px solid #FF3D8B; }
.sk-bubbleTip { position: fixed; z-index: 7; transform: translate(-50%, calc(-100% - 22px)); max-width: 220px; padding: 8px 12px; border-radius: 14px; background: #fff; color: #2A2140; font: 600 13px/1.3 var(--vw-font-ui), sans-serif; box-shadow: 0 10px 30px -10px #000; animation: sk-in .4s both; }
.sk-heartFly { position: fixed; z-index: 8; font-size: 26px; pointer-events: none; animation: sk-fly 1.4s ease-out forwards; }
@keyframes sk-fly { to { transform: translate(var(--fx, 0px), -60vh) scale(1.6); opacity: 0; } }
.sk-vn .pm-vn { background: #1A1F4A !important; border-color: rgba(244,248,255,.14) !important; color: #fff !important; width: 100% !important; border-radius: 18px !important; padding: 10px !important; }
.sk-vn .pm-vnLabel { font-size: 11px !important; letter-spacing: .08em !important; }
.sk-reply .pm-reply { background: #121637 !important; border-color: rgba(244,248,255,.14) !important; color: #fff !important; border-radius: 22px !important; }
.sk-reply .pm-replyH { font-family: var(--sk-display), sans-serif !important; font-weight: 500 !important; letter-spacing: .04em; }

/* Letter + ticket */
.sk-letter { position: relative; width: min(100%, 520px); box-sizing: border-box; padding: 30px 26px 34px; text-align: left; color: #2A2140; border-radius: 4px;
  background: radial-gradient(120% 70% at 50% 0%, #FFF9EE, #F6EAD4 70%, #EAD9BC); box-shadow: 0 40px 80px -30px #000, 0 0 60px -10px rgba(255,180,92,.35); }
.sk-letter p { margin: 0 0 14px; font: 500 clamp(18px, 4.7vw, 20px)/1.55 var(--sk-serif), Georgia, serif; white-space: pre-wrap; user-select: text; -webkit-user-select: text; animation: sk-ink 1.2s ease both; }
@keyframes sk-ink { from { opacity: 0; transform: translateY(6px); } }
.sk-letter .sk-sher { font: 400 22px/1.4 var(--vw-font-script), cursive; color: #7A2948; white-space: pre-wrap; }
.sk-letter .sk-sign { text-align: right; font: 400 30px/1 var(--vw-font-script), cursive; color: #2A2140; }
.sk-ticket { position: relative; width: min(100%, 460px); display: grid; grid-template-columns: 1fr 96px; filter: drop-shadow(0 26px 40px rgba(0,0,0,.6)); text-align: left; }
.sk-tMain { position: relative; border-radius: 14px 0 0 14px; padding: 16px; background: linear-gradient(160deg, #1A1F4A, #0B1026); color: #fff; overflow: hidden; display: grid; gap: 6px; }
.sk-tMain canvas { position: relative; display: block; width: 100%; height: 104px; margin-bottom: 4px; }
.sk-tMain > *:not(canvas) { position: relative; }
.sk-tMain small { font: 600 10px/1.2 var(--sk-display); letter-spacing: .3em; text-transform: uppercase; color: var(--sk-gold); }
.sk-tMain b { font: 500 22px/1.1 var(--sk-display); letter-spacing: .06em; }
.sk-tMain span { font: 500 13px/1.35 var(--vw-font-ui), sans-serif; color: rgba(244,248,255,.8); }
.sk-tStub { position: relative; border-radius: 0 14px 14px 0; background: linear-gradient(160deg, #FFE7B0, #FFB45C); color: #1B1306; display: grid; place-items: center; border-left: 2px dashed rgba(0,0,0,.35);
  touch-action: none; cursor: grab; transition: transform .6s cubic-bezier(.3,1.2,.4,1); }
.sk-tStub b { writing-mode: vertical-rl; font: 600 13px/1 var(--sk-display); letter-spacing: .26em; }
.sk-tStub.is-torn { transform: translate(30px, 40px) rotate(14deg); }
.sk-tStub::after { content: "pull →"; position: absolute; bottom: 8px; left: 0; right: 0; text-align: center; font: 600 9px/1 var(--sk-display); letter-spacing: .2em; opacity: .7; }
.sk-tStub.is-torn::after { content: "kept ✓"; }
.sk-ps { width: min(100%, 460px); box-sizing: border-box; text-align: left; cursor: pointer; padding: 16px 18px; border-radius: 6px; color: #2A2140; white-space: pre-wrap;
  background: linear-gradient(160deg, #FFF3DD, #F1DDB8); border: 0; box-shadow: 0 16px 30px -18px #000; font: 500 17px/1.5 var(--sk-serif), Georgia, serif; }
.sk-ps b { display: block; margin-bottom: 4px; font: 600 11px/1.2 var(--sk-display), sans-serif; letter-spacing: .26em; text-transform: uppercase; color: #9C2C4C; }
.sk-endWrap { width: min(100%, 460px); display: grid; gap: 14px; justify-items: center; }

@media (min-width: 1024px) {
  .sk-city { height: 50vh; }
  .sk-moon { width: 64px; height: 64px; right: 14%; top: 12%; }
  .sk-ringStage { width: min(100%, 520px); }
}
@media (prefers-reduced-motion: reduce) {
  .sk-starsA, .sk-starsB, .sk-drape, .sk-bulbs i, .sk-ant::after, .sk-flame i, .sk-glow, .sk-mem.is-hint i, .sk-target, .sk-onGem, .sk-glint, .sk-grain { animation: none !important; }
  .sk-city, .sk-roof { transition: none; }
  .sk-frame { animation: sk-fade .3s both; }
  .sk-slot .sk-bub, .sk-stk { animation-duration: .01s; }
  .sk-letter p { animation: sk-fade .4s both; }
}
`;
