// "Be My Valentine Carnival" styles. Cherry Soda + lavender + butter (research §C1), puffy pills with a darker lip,
// die-cut stickers, polaroids and washi tape (§C3), springy motion (§C5). Transform/opacity animations only.

export const CARNIVAL_CSS = `
.vc-root { --ink:#590D22; --deep:#C9184A; --primary:#FF4D6D; --soft:#FFB3C6; --pop:#FFD166; --lav:#B9A7FF; --lavSoft:#EDE3FF; --card:#fff;
  --gummy: var(--vc-gummy), 'Fredoka', system-ui, sans-serif; --ui: var(--vc-ui), 'Fredoka', system-ui, sans-serif; --script: var(--font-vw-script), 'Dancing Script', cursive;
  position: relative; min-height: 100dvh; color: var(--ink); font-family: var(--ui); overflow-x: clip; }
.vc-root button { font-family: var(--ui); -webkit-tap-highlight-color: transparent; }
.vc-root :focus-visible { outline: 3px solid var(--primary); outline-offset: 3px; }

/* ── The fair around the stage ───────────────────────────────── */
.vc-fair { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  background: linear-gradient(160deg, #FFF0F3 0%, #FFE3EC 52%, #EDE3FF 100%); }
.vc-blob { position: absolute; border-radius: 50%; opacity: .45; }
.vc-blob.is-a { width: 70vmax; height: 70vmax; left: -30vmax; top: -24vmax; background: radial-gradient(closest-side, #FFB3C6, transparent); }
.vc-blob.is-b { width: 60vmax; height: 60vmax; right: -28vmax; bottom: -20vmax; background: radial-gradient(closest-side, #DCCBFF, transparent); }
.vc-blob.is-c { width: 40vmax; height: 40vmax; right: -8vmax; top: 18vh; background: radial-gradient(closest-side, #FFE6A8, transparent); opacity: .35; }
.vc-bunting { display: block; width: 100%; height: 48px; }
.vc-fairBunting { position: absolute; left: 0; right: 0; top: 0; opacity: .75; }
.vc-floaters i { position: absolute; left: var(--x); bottom: -30px; font-style: normal; font-size: var(--s); color: #FF8FAB; opacity: .55;
  animation: vc-rise 14s linear infinite; animation-delay: calc(var(--d) * -1); }
.vc-floaters i:nth-child(3n+2) { color: #B9A7FF; } .vc-floaters i:nth-child(3n) { color: #FFC24D; }
@keyframes vc-rise { from { transform: translate3d(0,0,0) rotate(0); } 50% { transform: translate3d(18px,-55vh,0) rotate(20deg); } to { transform: translate3d(-10px,-112vh,0) rotate(-10deg); } }
.vc-side { display: none; }
@media (min-width: 768px) {
  .vc-side { display: block; position: absolute; top: 50%; width: calc((100vw - 480px) / 2); height: 80vh; transform: translateY(-50%); }
  .vc-side.is-left { left: 0; } .vc-side.is-right { right: 0; }
  .vc-sideWheel { position: absolute; left: 50%; top: 8%; width: min(320px, 70%); transform: translateX(-56%); opacity: .9; }
  .vc-sideSpin { transform-origin: 100px 100px; animation: vc-spin 40s linear infinite; }
  .vc-tent { position: absolute; left: 50%; bottom: 8%; width: min(300px, 64%); transform: translateX(-46%); }
  .vc-sideBalloons { position: absolute; left: 22%; top: 6%; display: flex; gap: 6px; }
  .vc-sideBalloons svg { width: 54px; animation: vc-bob 4.5s ease-in-out infinite; animation-delay: calc(var(--i) * -1.3s); }
  .vc-side.is-left .vc-sideGif { position: absolute; left: 50%; bottom: 10%; transform: translateX(-50%); }
  .vc-side.is-right .vc-sideGif { position: absolute; right: 18%; top: 34%; }
}
@media (min-width: 768px) and (max-width: 999px) {
  .vc-side .vc-sideGif { display: none; }
  .vc-sideBalloons svg { width: 34px; }
}
@keyframes vc-spin { to { transform: rotate(360deg); } }
@keyframes vc-bob { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }

/* ── The stage: a centred phone-like column ───────────────────── */
.vc-stage { position: relative; z-index: 2; max-width: 460px; margin: 0 auto; min-height: 100dvh; box-sizing: border-box;
  padding: calc(60px + env(safe-area-inset-top, 0px)) 16px calc(116px + var(--vw-dock-space, 0px)); }
@media (min-width: 768px) {
  .vc-stage { margin: 20px auto; min-height: calc(100dvh - 40px); border-radius: 40px; background: rgba(255,255,255,.55);
    border: 3px solid #fff; box-shadow: 0 30px 80px -30px rgba(201,24,74,.35); padding-top: 64px; }
}
.vc-sceneWrap { display: block; }
.vc-dots { display: flex; justify-content: center; gap: 7px; margin: 0 auto 6px; }
.vc-dot { width: 8px; height: 8px; border-radius: 99px; background: #FFC7D4; border: 0; padding: 0; transition: width .3s, background .3s; }
.vc-dot.is-past { background: #FF8FAB; } .vc-dot.is-now { width: 22px; background: var(--primary); }
.vc-dots.is-map .vc-dot { width: 14px; height: 14px; cursor: pointer; } .vc-dots.is-map .vc-dot.is-now { width: 28px; }
.vc-foot { position: fixed; z-index: 60; left: 50%; transform: translateX(-50%); bottom: calc(18px + env(safe-area-inset-bottom, 0px) + var(--vw-dock-space, 0px));
  display: grid; justify-items: center; gap: 4px; pointer-events: none; width: max-content; }
.vc-foot > * { pointer-events: auto; }
.vc-next { animation: vc-popIn .5s cubic-bezier(.34,1.56,.64,1) both, vc-beat 2.4s 1s ease-in-out infinite; }
.vc-skip { all: unset; pointer-events: auto; cursor: pointer; font: 600 13px/1 var(--ui); color: var(--deep); opacity: .75; padding: 10px 14px; border-radius: 99px; background: rgba(255,255,255,.7); }
@keyframes vc-beat { 0%,100% { transform: scale(1); } 10% { transform: scale(1.08); } 20% { transform: scale(1); } 30% { transform: scale(1.05); } 40% { transform: scale(1); } }
@keyframes vc-popIn { from { opacity: 0; transform: scale(.4) rotate(-8deg); } to { opacity: 1; transform: scale(1) rotate(0); } }

/* ── Kit: buttons, heads, stickers, polaroids ─────────────────── */
.vc-puffy { position: relative; border: 0; cursor: pointer; border-radius: 999px; min-height: 52px; padding: 13px 28px;
  font: 700 17px/1.1 var(--ui); letter-spacing: .01em; transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s; white-space: nowrap; }
.vc-puffy.is-cherry { background: linear-gradient(180deg, #FF6F8A, #FF4D6D); color: #fff; box-shadow: 0 5px 0 #C9184A, 0 12px 26px -8px rgba(201,24,74,.55); text-shadow: 0 1px 0 rgba(150,10,40,.25); }
.vc-puffy.is-butter { background: linear-gradient(180deg, #FFE08A, #FFD166); color: #5B3A00; box-shadow: 0 5px 0 #E0A92E, 0 12px 26px -8px rgba(200,140,20,.45); }
.vc-puffy.is-lav { background: linear-gradient(180deg, #C9B9FF, #A88BFF); color: #fff; box-shadow: 0 5px 0 #7A52E0, 0 12px 26px -8px rgba(122,82,224,.5); }
.vc-puffy.is-white { background: #fff; color: var(--deep); box-shadow: 0 4px 0 #FFB3C6, 0 10px 22px -10px rgba(201,24,74,.35); }
.vc-puffy.is-small { min-height: 44px; padding: 10px 20px; font-size: 15px; }
.vc-puffy:active:not(:disabled) { transform: translateY(3px) scale(.97); }
.vc-puffy.is-cherry:active:not(:disabled) { box-shadow: 0 2px 0 #C9184A, 0 6px 14px -8px rgba(201,24,74,.5); }
.vc-puffy:disabled { cursor: default; }
.vc-link { all: unset; cursor: pointer; font: 700 14px/1.2 var(--ui); color: var(--deep); text-decoration: underline wavy #FFB3C6; text-underline-offset: 5px; padding: 10px 6px; }

.vc-scene { position: relative; display: grid; justify-items: center; text-align: center; }
.vc-head { display: grid; justify-items: center; gap: 6px; margin: 2px 0 12px; }
.vc-kick { display: inline-block; padding: 5px 12px; border-radius: 99px; background: #fff; color: var(--deep); font: 700 11.5px/1 var(--ui);
  letter-spacing: .12em; text-transform: uppercase; box-shadow: 0 3px 0 #FFD6E0; }
.vc-title { position: relative; margin: 2px 0 0; font: 800 clamp(28px, 8.4vw, 36px)/1.04 var(--gummy); color: var(--deep); letter-spacing: -.01em; padding: 0 22px;
  text-shadow: 0 3px 0 #fff, 0 5px 0 rgba(255,179,198,.6); }
.vc-sparkL, .vc-sparkR { position: absolute; top: -4px; opacity: .7; animation: vc-twinkle 2.2s ease-in-out infinite; }
.vc-sparkL { left: -2px; } .vc-sparkR { right: -2px; top: 60%; animation-delay: -1.1s; }
@keyframes vc-twinkle { 0%,100% { transform: scale(.6) rotate(0); opacity: .4; } 50% { transform: scale(1.1) rotate(45deg); opacity: .9; } }
.vc-hint { margin: 0; font: 600 15px/1.35 var(--ui); color: #8A3A55; max-width: 330px; }

.vc-gif { position: relative; display: inline-grid; place-items: center; flex: none; transform: rotate(var(--tilt, 0deg));
  filter: drop-shadow(0 0 0 #fff) drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 8px 10px rgba(201,24,74,.18)); }
.vc-gif img { width: 100%; height: 100%; object-fit: contain; user-select: none; pointer-events: none; }
.vc-gif.is-float { animation: vc-float 3.6s ease-in-out infinite; }
@keyframes vc-float { 0%,100% { transform: translateY(0) rotate(var(--tilt, 0deg)); } 50% { transform: translateY(-7px) rotate(calc(var(--tilt, 0deg) * -1)); } }
.vc-popIn { animation: vc-stickerIn .6s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes vc-stickerIn { from { opacity: 0; transform: scale(.3) rotate(-14deg); } to { opacity: 1; transform: scale(1) rotate(var(--tilt, 0deg)); } }

.vc-polaroid { position: relative; margin: 0; background: #fff; padding: 10px 10px 0; border-radius: 6px; transform: rotate(var(--tilt, 0deg));
  box-shadow: 0 2px 0 #FFE3EC, 0 18px 34px -16px rgba(89,13,34,.4); box-sizing: border-box; }
.vc-polaroidPic { aspect-ratio: 1; border-radius: 3px; overflow: hidden; background: #FFE3EC; }
.vc-polaroidEmpty { display: grid; place-items: center; width: 100%; height: 100%; font-size: 48px; }
.vc-polaroid figcaption { font: 700 21px/1.15 var(--script); color: var(--deep); padding: 8px 4px 12px; text-align: center; overflow-wrap: anywhere; }
.vc-polaroid:not(:has(figcaption)) { padding-bottom: 10px; }
.vc-washi { position: absolute; width: 80px; height: 22px; opacity: .78; border-radius: 2px; z-index: 2;
  -webkit-mask: radial-gradient(4px at 0 50%, transparent 98%, #000) left / 51% 8px repeat-y, radial-gradient(4px at 100% 50%, transparent 98%, #000) right / 51% 8px repeat-y;
          mask: radial-gradient(4px at 0 50%, transparent 98%, #000) left / 51% 8px repeat-y, radial-gradient(4px at 100% 50%, transparent 98%, #000) right / 51% 8px repeat-y;
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.35) 0 6px, transparent 6px 12px) !important; }
.vc-washi { background-color: var(--lav); }

.vc-popCard { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 20px;
  background: radial-gradient(circle at 50% 40%, rgba(255,240,243,.82), rgba(255,214,224,.9)); animation: vc-fade .25s ease both; }
.vc-popCardIn { position: relative; animation: vc-cardIn .55s cubic-bezier(.34,1.56,.64,1) both; max-width: 340px; width: 100%; display: grid; justify-items: center; }
.vc-popClose { position: absolute; top: -6px; right: 4px; width: 44px; height: 44px; border-radius: 50%; border: 0; background: #fff; color: var(--deep);
  font: 700 18px/1 var(--ui); box-shadow: 0 4px 0 #FFB3C6; cursor: pointer; }
@keyframes vc-fade { from { opacity: 0; } }
@keyframes vc-cardIn { from { opacity: 0; transform: scale(.6) translateY(30px) rotate(-6deg); } }
.vc-prize { display: grid; justify-items: center; gap: 12px; }
.vc-prizeKick { font: 800 15px/1 var(--gummy); color: var(--deep); background: #fff; padding: 8px 16px; border-radius: 99px; box-shadow: 0 3px 0 #FFD6E0; }
.vc-prizeNote { margin: 0; max-width: 280px; font: 600 15px/1.4 var(--ui); color: var(--ink); background: #fff; padding: 10px 14px; border-radius: 16px; box-shadow: 0 3px 0 #FFD6E0; }

/* ── Gate: the ticket ────────────────────────────────────────── */
.vc-gate { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; overflow: hidden auto; padding: 56px 16px 24px;
  background: radial-gradient(120% 70% at 50% 0%, #FFFFFF 0%, #FFE3EC 45%, #EDE3FF 100%); transition: opacity .6s .55s ease; }
.vc-gate.is-torn { opacity: 0; pointer-events: none; }
.vc-gate.is-reduced { transition-delay: 0s; transition-duration: .25s; }
.vc-gate .vc-bunting { position: absolute; top: 0; left: 0; right: 0; height: 54px; }
.vc-curtain { position: absolute; top: 0; bottom: 0; width: 15vw; max-width: 140px; z-index: 0;
  background: repeating-linear-gradient(90deg, #FF8FAB 0 18px, #FFF0F3 18px 36px); box-shadow: inset -10px 0 20px rgba(201,24,74,.18);
  transition: transform .9s cubic-bezier(.65,0,.35,1); }
.vc-curtain.is-l { left: 0; border-radius: 0 0 60% 0 / 0 0 12% 0; } .vc-curtain.is-r { right: 0; transform: scaleX(-1); border-radius: 0 0 60% 0 / 0 0 12% 0; }
.vc-gate.is-torn .vc-curtain.is-l { transform: translateX(-105%); } .vc-gate.is-torn .vc-curtain.is-r { transform: scaleX(-1) translateX(-105%); }
.vc-gateIn { position: relative; z-index: 2; display: grid; justify-items: center; gap: 10px; text-align: center; width: min(400px, 100%); }
.vc-gate.is-torn .vc-gateIn { transform: scale(1.06); opacity: 0; transition: transform .7s ease, opacity .5s .3s ease; }
.vc-gateKick { margin: 0; font: 700 13px/1.2 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--deep); display: inline-flex; gap: 6px; align-items: center; }
.vc-inlineSpark { width: 13px; height: 13px; }
.vc-gateName { position: relative; margin: 0 0 4px; font: 700 clamp(52px, 16vw, 76px)/1 var(--script); color: var(--primary); overflow-wrap: anywhere;
  text-shadow: 0 3px 0 #fff, 0 6px 0 rgba(255,179,198,.7); animation: vc-stickerIn .8s .1s cubic-bezier(.34,1.56,.64,1) both; }
.vc-scribble { position: absolute; left: 6%; right: 6%; bottom: -10px; height: 14px; width: 88%; }
.vc-ticketWrap { position: relative; margin: 14px 0 0; }
.vc-gatePug { position: absolute; left: -26px; top: -58px; z-index: 3; }
.vc-gateBunny { position: absolute; right: -14px; bottom: -44px; z-index: 3; }
.vc-ticket { position: relative; display: flex; width: min(330px, 84vw); transform: rotate(-3deg); filter: drop-shadow(0 16px 22px rgba(201,24,74,.25));
  animation: vc-ticketIn .9s .2s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes vc-ticketIn { from { opacity: 0; transform: translateY(40px) rotate(8deg) scale(.8); } }
.vc-tBody { flex: 1; display: grid; gap: 4px; justify-items: center; padding: 16px 10px 12px; border-radius: 16px 0 0 16px;
  background: linear-gradient(135deg, #FFF6D6, #FFE08A); color: var(--ink); outline: 2px dashed rgba(201,24,74,.35); outline-offset: -8px;
  -webkit-mask: radial-gradient(10px at 0 50%, transparent 98%, #000); mask: radial-gradient(10px at 0 50%, transparent 98%, #000); }
.vc-tTop { font: 700 10.5px/1 var(--ui); letter-spacing: .18em; text-transform: uppercase; color: var(--deep); }
.vc-tAdmit { font: 800 36px/1 var(--gummy); color: var(--primary); letter-spacing: .02em; text-shadow: 0 2px 0 #fff; }
.vc-tName { font: 700 28px/1 var(--script); color: var(--deep); }
.vc-tLine { font: 600 12px/1.3 var(--ui); color: #8A3A55; max-width: 220px; }
.vc-tFoot { display: flex; justify-content: space-between; width: 88%; font: 700 10px/1 var(--ui); letter-spacing: .1em; color: var(--deep); margin-top: 4px; }
.vc-tStub { position: relative; width: 84px; display: grid; place-items: center; align-content: center; gap: 6px; border-radius: 0 16px 16px 0; cursor: grab; touch-action: none;
  background: linear-gradient(160deg, #FF8FAB, #FF4D6D); color: #fff; transition: transform .45s cubic-bezier(.34,1.56,.64,1);
  -webkit-mask: radial-gradient(4px at 0 8px, transparent 96%, #000) 0 0 / 100% 16px; mask: radial-gradient(4px at 0 8px, transparent 96%, #000) 0 0 / 100% 16px; }
.vc-tStub.is-ready { filter: brightness(1.08); }
.vc-gate.is-torn .vc-tStub { transform: translate(90px, 260px) rotate(70deg) !important; opacity: 0; transition: transform .9s cubic-bezier(.4,0,.6,1), opacity .9s; }
.vc-stubKeep { font: 800 11px/1 var(--ui); letter-spacing: .16em; writing-mode: vertical-rl; transform: rotate(180deg); }
.vc-stubHeart { font-size: 26px; line-height: 1; animation: vc-beat 2.4s ease-in-out infinite; }
.vc-stubCut { font: 700 11px/1 var(--ui); opacity: .9; }
.vc-gateHint { margin: 26px 0 0; font: 600 14px/1.3 var(--ui); color: #8A3A55; }
.vc-gateCta { display: grid; gap: 3px; justify-items: center; min-width: 230px; margin-top: 4px; }
.vc-gateCta small { font: 600 11px/1 var(--ui); opacity: .85; }
.vc-gateCta.is-tuning { overflow: hidden; }
.vc-gateSeal { display: inline-flex; gap: 8px; align-items: center; font: 700 13px/1.2 var(--ui); color: var(--deep); background: rgba(255,255,255,.75); padding: 6px 14px 6px 6px; border-radius: 99px; }
.vc-gateSeal i { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; font-style: normal; color: #fff; background: radial-gradient(circle at 35% 30%, #FF8FAB, #C9184A); }
.vc-quiet { all: unset; cursor: pointer; min-height: 40px; padding: 0 10px; font: 600 13px/1 var(--ui); color: #8A3A55; text-decoration: underline; text-underline-offset: 3px; display: inline-flex; gap: 6px; align-items: center; }

/* ── 1 · Balloons ───────────────────────────────────────────── */
.vc-sky { position: relative; width: 100%; max-width: 380px; height: min(330px, 40vh); min-height: 270px; }
.vc-balloon { position: absolute; width: 64px; height: 96px; margin: 0 0 0 -32px; padding: 0; border: 0; background: none; cursor: pointer;
  animation: vc-balloonBob 3.4s ease-in-out infinite; animation-delay: calc(var(--d) * -1); filter: drop-shadow(0 8px 10px rgba(201,24,74,.18)); touch-action: manipulation; }
.vc-balloon svg { display: block; width: 64px; height: 96px; transition: transform .18s ease, opacity .18s ease; }
.vc-balloon:active svg { transform: scale(1.08); }
.vc-balloon.is-popped { animation: none; cursor: default; }
.vc-balloon.is-popped svg { transform: scale(1.35); opacity: 0; }
.vc-popWord { position: absolute; left: 50%; top: 22px; transform: translateX(-50%); font: 800 18px/1 var(--gummy); color: var(--col); animation: vc-popWord .7s ease-out both; pointer-events: none; }
@keyframes vc-popWord { from { opacity: 0; transform: translate(-50%, 6px) scale(.5); } 30% { opacity: 1; transform: translate(-50%, -6px) scale(1.2); } to { opacity: 0; transform: translate(-50%, -24px) scale(1); } }
@keyframes vc-balloonBob { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-12px) rotate(4deg); } }
.vc-sky { transition: height .6s cubic-bezier(.5,0,.3,1), min-height .6s; }
.vc-sky.is-clear { height: 110px; min-height: 0; }
.vc-skyBunny { position: absolute; left: -6px; bottom: -14px; }
.vc-line { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 7px; margin: 14px 0 6px; padding: 14px 16px; max-width: 360px; min-height: 56px;
  background: #fff; border-radius: 22px; box-shadow: 0 4px 0 #FFD6E0, 0 16px 30px -18px rgba(201,24,74,.4); }
.vc-word { font: 700 20px/1.25 var(--ui); color: #E5B8C5; letter-spacing: .06em; }
.vc-word.is-on { font: 800 24px/1.15 var(--gummy); color: var(--col); letter-spacing: 0; animation: vc-stickerIn .45s cubic-bezier(.34,1.56,.64,1) both; text-shadow: 0 2px 0 rgba(89,13,34,.08); }
.vc-line.is-all { animation: vc-glow 1.6s ease-in-out 2; }
@keyframes vc-glow { 50% { box-shadow: 0 4px 0 #FFD6E0, 0 0 0 8px rgba(255,209,102,.5), 0 16px 30px -18px rgba(201,24,74,.4); } }
.vc-react { min-height: 132px; display: grid; place-items: center; }

/* ── 2 · Love tester ────────────────────────────────────────── */
.vc-machine { position: relative; margin-top: 18px; width: min(320px, 86vw); padding: 0 16px 18px; border-radius: 34px 34px 26px 26px;
  background: linear-gradient(180deg, #C9B9FF, #A88BFF); box-shadow: 0 8px 0 #7A52E0, 0 26px 40px -20px rgba(122,82,224,.6); display: grid; justify-items: center; gap: 12px; }
.vc-machine.is-broken { animation: vc-shake .5s ease 2; }
@keyframes vc-shake { 20% { transform: translateX(-6px) rotate(-1deg); } 40% { transform: translateX(6px) rotate(1deg); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
.vc-marquee { margin-top: -16px; background: var(--primary); color: #fff; border-radius: 18px; padding: 8px 18px 6px; box-shadow: 0 5px 0 #C9184A; display: grid; gap: 4px; }
.vc-marquee b { font: 800 20px/1 var(--gummy); letter-spacing: .08em; }
.vc-bulbs { display: flex; gap: 7px; justify-content: center; }
.vc-bulbs i { width: 7px; height: 7px; border-radius: 50%; background: #FFD166; animation: vc-blink 1.2s steps(2) infinite; animation-delay: calc(var(--i) * .1s); }
@keyframes vc-blink { 50% { background: #fff; box-shadow: 0 0 6px #FFD166; } }
.vc-lcd { width: 88%; min-height: 54px; display: grid; place-items: center; align-content: center; border-radius: 14px; background: #E8FFF4; color: #1D6B52;
  box-shadow: inset 0 3px 0 rgba(0,0,0,.08); font-family: var(--ui); }
.vc-lcd b { font: 800 30px/1 var(--gummy); font-variant-numeric: tabular-nums; }
.vc-lcd small { font: 700 12px/1.2 var(--ui); letter-spacing: .12em; text-transform: uppercase; }
.vc-lcdErr { font: 800 18px/1.15 var(--gummy); color: #D6204E; animation: vc-flicker .9s steps(2) 3; padding: 6px 10px; }
@keyframes vc-flicker { 50% { opacity: .3; } }
.vc-meterBody { display: grid; grid-template-columns: 30px 56px 1fr; align-items: center; gap: 8px; width: 100%; }
.vc-scale { display: grid; height: 200px; align-content: space-between; font: 700 11px/1 var(--ui); color: #fff; opacity: .9; text-align: right; }
.vc-tube { position: relative; width: 44px; height: 200px; margin: 0 auto; border-radius: 22px; background: rgba(255,255,255,.85); border: 4px solid #fff; overflow: hidden;
  box-shadow: inset 0 0 0 2px rgba(122,82,224,.2); }
.vc-tubeFill { position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--fill) * 100%); background: linear-gradient(0deg, #FF4D6D, #FF8FAB);
  transition: height .08s linear; border-radius: 18px 18px 0 0; }
.vc-tubeGlow { position: absolute; inset: 0; background: linear-gradient(0deg, transparent, #FFD166); opacity: var(--over); mix-blend-mode: screen; }
.vc-machine.is-holding .vc-tube { animation: vc-jitter .12s linear infinite; }
@keyframes vc-jitter { 50% { transform: translateX(calc(var(--over, 0) * 2px)); } }
.vc-crack { position: absolute; inset: 0; width: 100%; height: 100%; }
.vc-meterSide { display: grid; place-items: center; min-height: 120px; }
.vc-thumb { position: relative; display: grid; place-items: center; width: 140px; height: 120px; border: 0; border-radius: 30px; cursor: pointer; touch-action: none;
  background: radial-gradient(circle at 50% 40%, #FF8FAB, #FF4D6D); box-shadow: 0 6px 0 #C9184A, 0 16px 26px -10px rgba(201,24,74,.6); color: #fff; font: 800 15px/1 var(--ui);
  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; transition: transform .12s ease, box-shadow .12s ease; }
.vc-thumb svg { margin-bottom: -26px; filter: drop-shadow(0 2px 0 rgba(201,24,74,.3)); animation: vc-beat 1.6s ease-in-out infinite; }
.vc-thumb span { position: relative; margin-top: 8px; color: var(--deep); background: #fff; padding: 5px 10px; border-radius: 99px; }
.vc-thumb.is-down { transform: translateY(4px) scale(.97); box-shadow: 0 2px 0 #C9184A, 0 8px 16px -10px rgba(201,24,74,.6); }
.vc-thumb.is-down svg { animation-duration: .5s; }
.vc-thumb:disabled { cursor: default; filter: saturate(.8); }
.vc-under { margin: 14px 0 0; font: 700 16px/1.3 var(--ui); color: var(--deep); }

/* ── 3 · Gacha ──────────────────────────────────────────────── */
.vc-gacha { position: relative; display: grid; justify-items: center; }
.vc-dome { position: relative; width: 230px; height: 210px; border-radius: 50% 50% 18px 18px / 56% 56% 18px 18px; background: rgba(255,255,255,.55); border: 6px solid #fff;
  box-shadow: inset 0 -10px 22px rgba(201,24,74,.12), 0 6px 0 #FFD6E0; overflow: hidden; }
.vc-ball { position: absolute; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(180deg, var(--col) 50%, #fff 50%); box-shadow: inset 0 -4px 0 rgba(0,0,0,.07), 0 2px 0 rgba(0,0,0,.05);
  transition: opacity .3s; }
.vc-domeShine { position: absolute; left: 22px; top: 18px; width: 40px; height: 70px; border-radius: 50%; background: rgba(255,255,255,.75); transform: rotate(20deg); }
.vc-gBase { position: relative; width: 250px; height: 150px; margin-top: -6px; border-radius: 22px 22px 30px 30px; background: linear-gradient(180deg, #FF6F8A, #FF4D6D);
  box-shadow: 0 7px 0 #C9184A, 0 22px 30px -18px rgba(201,24,74,.6); }
.vc-gLabel { position: absolute; top: 12px; left: 0; right: 0; font: 800 11px/1 var(--ui); letter-spacing: .14em; color: #fff; opacity: .95; }
.vc-knob { position: absolute; left: 30px; top: 38px; width: 92px; height: 92px; border-radius: 50%; border: 0; cursor: grab; touch-action: none;
  background: radial-gradient(circle at 40% 35%, #FFF, #FFE08A 60%, #FFD166); box-shadow: 0 5px 0 #E0A92E, inset 0 -4px 0 rgba(0,0,0,.06); }
.vc-knob i { position: absolute; left: 50%; top: 50%; width: 76px; height: 20px; margin: -10px 0 0 -38px; border-radius: 10px; background: #FF8FAB; box-shadow: 0 3px 0 #C9184A; }
.vc-knob:disabled { cursor: default; opacity: .9; }
.vc-chute { position: absolute; right: 30px; top: 58px; width: 74px; height: 62px; border-radius: 16px; background: #8A0E33; box-shadow: inset 0 6px 0 rgba(0,0,0,.25); }
.vc-gachaGif { position: absolute; right: -20px; top: -20px; }
.vc-tray { display: flex; gap: 12px; justify-content: center; margin: 18px 0 4px; min-height: 76px; }
.vc-capSlot { width: 64px; height: 64px; border-radius: 50%; border: 3px dashed #FFC7D4; box-sizing: border-box; }
.vc-capsule { position: relative; width: 64px; height: 64px; border: 0; padding: 0; border-radius: 50%; background: none; cursor: pointer; animation: vc-roll .8s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes vc-roll { from { opacity: 0; transform: translate(70px, -60px) rotate(220deg) scale(.6); } 70% { opacity: 1; } }
.vc-capTop, .vc-capBot { position: absolute; left: 0; right: 0; height: 50%; }
.vc-capTop { top: 0; border-radius: 32px 32px 0 0; background: var(--col); box-shadow: inset 0 4px 0 rgba(255,255,255,.4); }
.vc-capBot { bottom: 0; border-radius: 0 0 32px 32px; background: #fff; box-shadow: inset 0 -4px 0 rgba(0,0,0,.06), 0 4px 0 #FFD6E0; }
.vc-capsule:not(.is-open) { animation: vc-roll .8s cubic-bezier(.34,1.56,.64,1) both, vc-wiggle 2.6s 1.5s ease-in-out infinite; }
@keyframes vc-wiggle { 0%,80%,100% { transform: rotate(0); } 85% { transform: rotate(-10deg); } 90% { transform: rotate(9deg); } 95% { transform: rotate(-5deg); } }
.vc-capMini { display: grid; place-items: center; animation: vc-stickerIn .5s cubic-bezier(.34,1.56,.64,1) both; }
.vc-capMini .vc-polaroid { padding: 4px; }
.vc-capMini b { font-size: 34px; }

/* ── 4 · Ferris wheel ───────────────────────────────────────── */
.vc-ferrisStage { position: relative; display: grid; justify-items: center; padding-bottom: 8px; }
.vc-wheel { position: relative; width: var(--size); aspect-ratio: 1 / 1.12; }
.vc-wheelLegs { position: absolute; left: 0; top: 0; width: 100%; aspect-ratio: 1; overflow: visible; }
.vc-wheelLegs { height: calc(var(--size) * 1.12); }
.vc-wheelSpin { position: absolute; left: 0; top: 0; width: 100%; aspect-ratio: 1; animation: vc-spin 48s linear infinite; }
.vc-wheelRim { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.vc-cabin { position: absolute; width: 22%; aspect-ratio: 1 / 1.15; margin-left: -11%; padding: 0; border: 0; background: none; cursor: pointer; }
.vc-cabinIn { position: absolute; inset: 0; transform-origin: 50% 0; animation: vc-spin 48s linear infinite reverse; display: grid; justify-items: center; }
.vc-cabinHook { width: 3px; height: 14%; background: #C9184A; border-radius: 2px; }
.vc-cabinPod { width: 100%; aspect-ratio: 1.06; border-radius: 14px 14px 46% 46%; background: var(--col); display: grid; place-items: center;
  box-shadow: 0 4px 0 rgba(89,13,34,.18); animation: vc-swing 3s ease-in-out infinite; transform-origin: 50% -14%; }
@keyframes vc-swing { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
.vc-cabinWin { width: 74%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; border: 3px solid #fff; background: #FFE3EC; display: grid; place-items: center; color: #fff; }
.vc-cabinSeen { position: absolute; right: -2px; top: 6%; font-style: normal; font-size: 14px; color: #fff; background: var(--primary); border-radius: 50%; width: 22px; height: 22px; display: grid; place-items: center; box-shadow: 0 2px 0 #C9184A; }
.vc-bulb { animation: vc-bulb 1.6s steps(2) infinite; animation-delay: calc(var(--i) * -.13s); }
@keyframes vc-bulb { 50% { fill: #fff; } }
.vc-wheel.is-lit .vc-wheelSpin, .vc-wheel.is-lit .vc-cabinIn { animation-duration: 9s; }
.vc-wheel.is-lit .vc-bulb { animation: vc-bulbLit .5s steps(3) infinite; animation-delay: calc(var(--i) * -.07s); filter: drop-shadow(0 0 4px #FFD166); }
@keyframes vc-bulbLit { 33% { fill: #FF4D6D; } 66% { fill: #B9A7FF; } }
.vc-ferrisGif { position: absolute; left: -10px; bottom: 0; }

/* ── 5 · Cans ──────────────────────────────────────────────── */
.vc-stall { position: relative; width: min(340px, 90vw); padding: 34px 12px 14px; border-radius: 24px; background: #FFF6E8; box-shadow: 0 6px 0 #F2C58A, 0 20px 30px -18px rgba(150,90,20,.5); }
.vc-awning { position: absolute; left: -8px; right: -8px; top: -14px; height: 40px; border-radius: 14px 14px 0 0;
  background: repeating-linear-gradient(90deg, #FF4D6D 0 28px, #fff 28px 56px);
  -webkit-mask: radial-gradient(14px at 14px 100%, transparent 96%, #000) -0px 0 / 28px 100%; mask: radial-gradient(14px at 14px 100%, transparent 96%, #000) 0 0 / 28px 100%; }
.vc-awning { -webkit-mask: none; mask: none; clip-path: polygon(0 0,100% 0,100% 70%,96% 100%,92% 70%,88% 100%,84% 70%,80% 100%,76% 70%,72% 100%,68% 70%,64% 100%,60% 70%,56% 100%,52% 70%,48% 100%,44% 70%,40% 100%,36% 70%,32% 100%,28% 70%,24% 100%,20% 70%,16% 100%,12% 70%,8% 100%,4% 70%,0 100%); }
.vc-stallWin { position: absolute; left: 50%; top: 50%; margin: -64px 0 0 -75px; z-index: 2; }
.vc-stallPrize { position: absolute; right: -16px; bottom: -34px; z-index: 2; }
.vc-shelves { display: grid; gap: 4px; }
.vc-shelfRow { position: relative; display: flex; justify-content: center; gap: 8px; padding-bottom: 8px; }
.vc-plank { position: absolute; left: 6px; right: 6px; bottom: 0; height: 9px; border-radius: 5px; background: #D9A066; box-shadow: 0 3px 0 #B97F45; }
.vc-can { position: relative; width: 62px; height: 74px; border: 0; padding: 6px 0 0; cursor: pointer; border-radius: 10px 10px 8px 8px;
  background: linear-gradient(90deg, rgba(255,255,255,.5), rgba(255,255,255,0) 30%, rgba(255,255,255,.25) 70%, rgba(255,255,255,0)), var(--col);
  box-shadow: inset 0 6px 0 rgba(255,255,255,.55), inset 0 -6px 0 rgba(0,0,0,.08); display: grid; justify-items: center; align-content: start; gap: 2px;
  transition: transform .5s cubic-bezier(.5,-.3,.8,.6), opacity .5s .2s; }
.vc-can img { width: 30px; height: 30px; filter: drop-shadow(0 2px 0 rgba(255,255,255,.8)); }
.vc-can b { font: 800 11px/1 var(--ui); color: #fff; text-shadow: 0 1px 0 rgba(0,0,0,.2); }
.vc-can.is-down { transform: translate(calc(var(--dir) * 30px), 160px) rotate(calc(var(--dir) * 120deg)); opacity: 0; cursor: default; }
.vc-throw { position: absolute; left: 50%; bottom: -40px; width: 26px; height: 26px; margin-left: -13px; border-radius: 50%; z-index: 3;
  background: radial-gradient(circle at 35% 30%, #fff, #FFB3C6); box-shadow: 0 4px 8px rgba(201,24,74,.35); animation: vc-throw .3s cubic-bezier(.3,.2,.6,1) forwards; }
@keyframes vc-throw { to { left: var(--tx); bottom: auto; top: var(--ty); transform: translate(0, -50%) scale(.7); opacity: .2; } }
.vc-weekCard { width: min(360px, 92vw); min-height: 84px; margin: 14px 0 8px; display: grid; place-items: center; }
.vc-weekCard .is-empty { margin: 0; font: 600 15px/1.3 var(--ui); color: #A35A72; }
.vc-weekLine { display: flex; gap: 12px; align-items: center; text-align: left; width: 100%; box-sizing: border-box; padding: 12px 16px; border-radius: 20px; background: #fff;
  box-shadow: 0 4px 0 #FFD6E0, 0 14px 26px -18px rgba(201,24,74,.4); animation: vc-stickerIn .45s cubic-bezier(.34,1.56,.64,1) both; }
.vc-weekLine img { flex: none; width: 40px; height: 40px; }
.vc-weekLine span { display: grid; gap: 3px; font: 700 16px/1.3 var(--ui); color: var(--ink); }
.vc-weekLine small { font: 800 11px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--deep); }
.vc-weekTrack { display: flex; gap: 6px; justify-content: center; }
.vc-weekTrack button { width: 40px; height: 40px; border-radius: 50%; border: 0; padding: 0; display: grid; place-items: center; background: rgba(255,255,255,.5); cursor: pointer; }
.vc-weekTrack button img { width: 26px; height: 26px; opacity: .35; filter: grayscale(.7); transition: opacity .3s, filter .3s, transform .3s; }
.vc-weekTrack button.is-on { background: #fff; box-shadow: 0 3px 0 #FFD6E0; }
.vc-weekTrack button.is-on img { opacity: 1; filter: none; }
.vc-weekTrack button.is-now img { transform: scale(1.15); }
.vc-weekTrack button:disabled { cursor: default; }
.vc-today { margin: 8px 0 0; font: 800 26px/1.15 var(--gummy); color: var(--primary); text-shadow: 0 2px 0 #fff; animation: vc-stickerIn .7s cubic-bezier(.34,1.56,.64,1) both; }

/* ── 6 · Letter ────────────────────────────────────────────── */
.vc-booth { position: relative; display: grid; justify-items: center; gap: 4px; padding-top: 34px; }
.vc-boothSign { position: relative; display: grid; gap: 4px; padding: 14px 22px 12px; border-radius: 24px; background: #fff; box-shadow: 0 5px 0 #FFB3C6; }
.vc-boothSign b { font: 800 24px/1 var(--gummy); color: var(--primary); letter-spacing: .04em; }
.vc-boothSign small { font: 600 12.5px/1.2 var(--ui); color: #8A3A55; }
.vc-boothGif { position: absolute; left: -6px; top: 170px; z-index: 2; }
.vc-mailbox { position: relative; border: 0; background: none; padding: 0; cursor: pointer; margin-top: 8px; animation: vc-wiggleBox 3s 1.5s ease-in-out infinite; }
.vc-mailbox svg { display: block; filter: drop-shadow(0 12px 14px rgba(201,24,74,.3)); }
@keyframes vc-wiggleBox { 0%,84%,100% { transform: rotate(0); } 88% { transform: rotate(-4deg); } 92% { transform: rotate(4deg); } 96% { transform: rotate(-2deg); } }
.vc-flag { transform-origin: 142px 84px; transform: rotate(80deg); transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
.vc-mailbox.is-open { animation: none; }
.vc-mailbox.is-open .vc-flag { transform: rotate(0); }
.vc-envelope { position: absolute; left: 50%; top: 58px; width: 74px; height: 50px; margin-left: -37px; border-radius: 6px; background: #fff; opacity: 0;
  box-shadow: 0 6px 12px rgba(89,13,34,.2); transition: transform .7s .25s cubic-bezier(.34,1.56,.64,1), opacity .3s .25s; }
.vc-envelope i { position: absolute; left: 50%; top: 14px; width: 18px; height: 18px; margin-left: -9px; border-radius: 50%; background: #C9184A; }
.vc-mailbox.is-open .vc-envelope { opacity: 1; transform: translateY(-34px) rotate(-8deg) scale(1.2); }
.vc-letterGif { position: absolute; right: -6px; bottom: 30px; }
.vc-paperWrap { position: relative; width: min(370px, 92vw); animation: vc-cardIn .7s cubic-bezier(.34,1.56,.64,1) both; }
.vc-paper { position: relative; width: 100%; max-height: 56vh; overflow: auto; text-align: left; padding: 34px 22px 18px; border-radius: 18px; box-sizing: border-box;
  background: #fff repeating-linear-gradient(180deg, transparent 0 29px, #FFE0E8 29px 30px); background-position: 0 34px; box-shadow: 0 6px 0 #FFD6E0, 0 22px 40px -20px rgba(89,13,34,.4); overscroll-behavior: contain; }
.vc-paperText { font: 600 17px/30px var(--ui); color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; }
.vc-sign { margin: 10px 0 0; font: 700 26px/1.1 var(--script); color: var(--primary); text-align: right; }
.vc-paperGif { position: absolute; left: -14px; bottom: -30px; z-index: 2; }

/* ── 7 · Radio ─────────────────────────────────────────────── */
.vc-radio { position: relative; width: min(330px, 88vw); margin-top: 26px; padding: 18px 16px 16px; border-radius: 28px; background: linear-gradient(180deg, #7FD8BE, #5CC4A6);
  box-shadow: 0 7px 0 #3E9C80, 0 24px 34px -20px rgba(30,110,85,.6); display: grid; gap: 12px; }
.vc-antenna { position: absolute; right: 44px; top: -46px; width: 4px; height: 52px; background: #3E9C80; border-radius: 2px; transform: rotate(18deg); transform-origin: bottom; }
.vc-antenna b { position: absolute; left: -9px; top: -16px; color: var(--primary); font-size: 20px; animation: vc-beat 1.8s ease-in-out infinite; }
.vc-radioTop { display: grid; gap: 4px; background: #FFF6E8; border-radius: 14px; padding: 8px 12px; }
.vc-radioBrand { font: 800 12px/1 var(--ui); letter-spacing: .18em; color: #3E9C80; }
.vc-radioSong { font: 700 14px/1.25 var(--ui); color: var(--ink); }
.vc-radioBody { display: grid; grid-template-columns: 70px 1fr 54px; align-items: center; gap: 10px; }
.vc-grille { display: grid; gap: 6px; padding: 10px 8px; border-radius: 14px; background: rgba(255,255,255,.35); }
.vc-grille i { height: 5px; border-radius: 3px; background: rgba(30,110,85,.45); }
.vc-radio.is-on .vc-grille i { animation: vc-eq .5s ease-in-out infinite alternate; }
.vc-radio.is-on .vc-grille i:nth-child(2n) { animation-delay: -.25s; }
@keyframes vc-eq { to { transform: scaleX(.6); } }
.vc-radioScreen { min-height: 90px; display: grid; place-items: center; background: #fff; border-radius: 16px; padding: 10px; box-shadow: inset 0 3px 0 rgba(0,0,0,.05); }
.vc-radioMsg { margin: 0; font: 700 15px/1.4 var(--ui); color: var(--ink); }
.vc-radioMsg.is-static { color: #9CCFC0; letter-spacing: .1em; animation: vc-flicker 1s steps(2) infinite; }
.vc-voice { width: 100%; margin: 0; color: var(--ink); }
.vc-dial { width: 54px; height: 54px; border-radius: 50%; border: 0; cursor: pointer; background: radial-gradient(circle at 40% 35%, #fff, #FFD166); box-shadow: 0 4px 0 #E0A92E; position: relative; transition: transform .6s cubic-bezier(.34,1.56,.64,1); }
.vc-dial i { position: absolute; left: 50%; top: 6px; width: 4px; height: 16px; margin-left: -2px; border-radius: 2px; background: var(--primary); }
.vc-dial:not(:disabled) { animation: vc-wiggle 2.4s 1s ease-in-out infinite; }
.vc-dial.is-tuned { transform: rotate(140deg); }
.vc-dial:disabled { cursor: default; }
.vc-songNote { margin: 0; font: 700 20px/1.2 var(--script); color: #fff; text-shadow: 0 1px 0 rgba(30,110,85,.5); }
.vc-radioGif { margin-top: 14px; }

/* ── 8 · The question (money moment) ───────────────────────── */
.vc-ask { min-height: calc(100dvh - 190px); align-content: center; }
.vc-askWheel { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -48%); opacity: .22; transition: opacity 1s ease, transform 1.2s cubic-bezier(.34,1.56,.64,1); pointer-events: none; z-index: 0; }
.vc-ask.is-riser .vc-askWheel { opacity: .5; }
.vc-ask.is-yes { align-content: start; }
.vc-ask.is-yes .vc-askWheel { opacity: 1; top: 0; transform: translate(-50%, -14%) scale(.92); }
.vc-fireworks { position: fixed; inset: 0; width: 100vw; height: 100dvh; pointer-events: none; z-index: 4; }
.vc-askCard { position: relative; z-index: 2; width: min(360px, 92vw); padding: 24px 18px 22px; border-radius: 32px; background: rgba(255,255,255,.94);
  box-shadow: 0 8px 0 #FFD6E0, 0 30px 60px -26px rgba(201,24,74,.5); display: grid; justify-items: center; gap: 6px; transition: transform 1.1s cubic-bezier(.5,0,.3,1); }
.vc-ask.is-riser .vc-askCard { transform: scale(1.06); animation: vc-jitter2 .12s linear infinite; }
@keyframes vc-jitter2 { 50% { translate: 1px -1px; } }
.vc-askHey { margin: 0; font: 700 30px/1 var(--script); color: var(--primary); }
.vc-askQ { margin: 0; font: 800 clamp(30px, 9vw, 38px)/1.06 var(--gummy); color: var(--deep); text-wrap: balance; }
.vc-askFace { position: relative; height: 112px; display: grid; place-items: center; margin: 4px 0; }
.vc-bubble { position: absolute; left: calc(50% + 46px); top: 4px; width: max-content; max-width: min(150px, calc(50vw - 70px)); padding: 8px 12px; border-radius: 16px 16px 16px 4px; background: var(--lavSoft);
  font: 700 13px/1.25 var(--ui); color: #3B2A63; text-align: left; animation: vc-stickerIn .4s cubic-bezier(.34,1.56,.64,1) both; box-shadow: 0 3px 0 #DCCBFF; }
.vc-btnZone { position: relative; width: 100%; height: 150px; }
.vc-yes { position: absolute; left: 50%; top: 22px; margin-left: -78px; width: 156px; min-height: 60px; font-size: 22px; transform-origin: center; transition: transform .35s cubic-bezier(.34,1.56,.64,1); z-index: 2; }
.vc-yes2 { position: absolute; left: 50%; top: 100px; margin-left: -70px; width: 140px; animation: vc-stickerIn .6s cubic-bezier(.34,1.56,.64,1) both; z-index: 2; }
.vc-no { position: absolute; left: 50%; top: 100px; transform: translate(-50%, 0); min-width: 92px; min-height: 44px; padding: 10px 22px; border-radius: 99px; border: 2px solid #FFC7D4;
  background: #fff; color: #A35A72; font: 700 16px/1 var(--ui); cursor: pointer; z-index: 1; transition: left .35s cubic-bezier(.34,1.56,.64,1), top .35s cubic-bezier(.34,1.56,.64,1), transform .35s; touch-action: none; }
.vc-hideSticker { position: absolute; width: 64px; height: 64px; transform: translate(-50%, -50%) rotate(-8deg); z-index: 3; pointer-events: none; filter: drop-shadow(0 0 0 #fff) drop-shadow(0 6px 8px rgba(201,24,74,.2)); animation: vc-stickerIn .5s cubic-bezier(.34,1.56,.64,1) both; }
.vc-hideSticker:nth-child(2n) { transform: translate(-50%, -50%) rotate(9deg); }
.vc-yesCard { position: relative; z-index: 5; display: grid; justify-items: center; gap: 8px; width: min(370px, 92vw); box-sizing: border-box; padding: 18px 12px 14px; margin-top: 34vh;
  border-radius: 32px; background: rgba(255,255,255,.9); box-shadow: 0 8px 0 #FFD6E0, 0 30px 60px -26px rgba(201,24,74,.5); animation: vc-cardIn .7s cubic-bezier(.34,1.56,.64,1) both; }
.vc-yesBig { margin: -64px 0 0; font: 800 clamp(54px, 17vw, 76px)/1 var(--gummy); color: var(--primary); text-shadow: 0 4px 0 #fff, 0 8px 0 rgba(255,179,198,.8); animation: vc-yay 1s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes vc-yay { from { transform: scale(.2) rotate(-12deg); opacity: 0; } 60% { transform: scale(1.15) rotate(4deg); opacity: 1; } }
.vc-yesLine { margin: 0; max-width: 300px; font: 700 18px/1.35 var(--ui); color: var(--ink); }
.vc-yesLine b { color: var(--primary); }
.vc-gifWall { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 8px; margin-top: 4px; }
.vc-wallItem { animation: vc-stickerIn .6s cubic-bezier(.34,1.56,.64,1) both; }
.vc-wallItem:nth-child(2) { animation-delay: .12s; } .vc-wallItem:nth-child(3) { animation-delay: .24s; } .vc-wallItem:nth-child(4) { animation-delay: .36s; } .vc-wallItem:nth-child(5) { animation-delay: .48s; } .vc-wallItem:nth-child(6) { animation-delay: .6s; }

/* ── 9 · Exit: ticket stub + photobooth strip ──────────────── */
.vc-keep { position: relative; display: flex; gap: 12px; align-items: flex-start; justify-content: center; margin-top: 4px; }
.vc-stub { position: relative; width: 210px; display: grid; justify-items: center; gap: 4px; padding: 14px 12px 16px; border-radius: 18px; transform: rotate(-2deg);
  background: linear-gradient(160deg, #FFF6D6, #FFE08A); box-shadow: 0 6px 0 #E0A92E, 0 22px 30px -18px rgba(150,90,20,.5);
  -webkit-mask: radial-gradient(8px at 50% 0, transparent 96%, #000) 0 0 / 22px 100% repeat-x; mask: radial-gradient(8px at 50% 0, transparent 96%, #000) 0 0 / 22px 100% repeat-x; }
.vc-stubTop { font: 800 9.5px/1 var(--ui); letter-spacing: .16em; color: var(--deep); margin-top: 6px; }
.vc-stubAdmit { font: 800 24px/1 var(--gummy); color: var(--primary); }
.vc-stubName { font: 700 28px/1 var(--script); color: var(--deep); }
.vc-stubPic { width: 150px; aspect-ratio: 1; border-radius: 10px; overflow: hidden; border: 4px solid #fff; background: #FFE3EC; display: grid; place-items: center; font-size: 40px; }
.vc-stubLine { font: 600 11.5px/1.3 var(--ui); color: #8A3A55; }
.vc-stubRow { font: 600 12px/1.3 var(--ui); color: var(--ink); }
.vc-stamp { position: absolute; right: -6px; top: 112px; transform: rotate(-16deg); font: 800 13px/1 var(--ui); font-style: normal; color: #D6204E; border: 3px solid #D6204E; border-radius: 8px;
  padding: 5px 8px; background: rgba(255,255,255,.6); text-transform: uppercase; letter-spacing: .06em; animation: vc-stamp .6s .6s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes vc-stamp { from { opacity: 0; transform: rotate(-16deg) scale(2.4); } }
.vc-strip { width: 92px; display: grid; gap: 6px; padding: 8px 8px 10px; background: #fff; border-radius: 6px; transform: rotate(3deg); box-shadow: 0 16px 28px -16px rgba(89,13,34,.45); }
.vc-stripFrame { position: relative; aspect-ratio: 1; border-radius: 3px; overflow: hidden; background: #FFE3EC; display: grid; place-items: center; }
.vc-stripSticker { position: absolute; right: 2px; bottom: 2px; width: 26px; height: 26px; filter: drop-shadow(0 0 0 #fff) drop-shadow(0 2px 2px rgba(0,0,0,.15)); }
.vc-stripFoot { font: 700 14px/1 var(--script); color: var(--deep); text-align: center; overflow-wrap: anywhere; }
.vc-exitGif { position: absolute; right: -24px; bottom: -44px; z-index: 2; }
.vc-endLine { margin: 22px 0 0; font: 700 26px/1.2 var(--script); color: var(--primary); max-width: 340px; }
.vc-recap { display: flex; align-items: center; gap: 4px; margin: 12px 0 0; padding: 8px 12px; border-radius: 99px; background: #fff; box-shadow: 0 3px 0 #FFD6E0; }
.vc-recap img { width: 28px; height: 28px; }
.vc-recapArrow { font: 800 16px/1 var(--ui); color: var(--deep); margin: 0 2px; }
.vc-recapYou { font: 800 20px/1 var(--gummy); color: var(--primary); }
.vc-actions { display: flex; flex-wrap: wrap; gap: 14px 10px; justify-content: center; margin: 20px 0 6px; }
.vc-reply { width: min(380px, 94vw); margin-top: 12px; color: var(--ink); text-align: left; }
.vc-again { margin-top: 6px; }
.vc-ps { position: relative; display: grid; justify-items: start; gap: 10px; text-align: left; width: min(330px, 88vw); padding: 26px 20px 20px; border-radius: 20px; background: #FFF6E8; box-shadow: 0 6px 0 #F2C58A; }
.vc-ps p { margin: 0; font: 600 16px/1.5 var(--ui); color: var(--ink); white-space: pre-wrap; }
.vc-ps .vc-psCond { font: 700 22px/1.2 var(--script); color: var(--deep); }
.vc-ps .vc-sign { justify-self: end; }
.vc-psPic { justify-self: end; margin-top: -6px; }

@media (min-width: 1100px) {
  .vc-stage { max-width: 520px; }
}
@media (min-width: 1024px) and (min-height: 820px) {
  .vc-gateIn { zoom: 1.18; }
}
@media (min-width: 768px) {
  .vc-title { font-size: 38px; }
  .vc-fireworks { width: 100vw; }
}
@media (max-height: 700px) {
  .vc-sky { height: 250px; min-height: 0; }
  .vc-tube { height: 160px; } .vc-scale { height: 160px; }
  .vc-dome { width: 200px; height: 180px; }
}
@media (prefers-reduced-motion: reduce) {
  .vc-root *, .vc-gate * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .15s !important; }
  .vc-wheelSpin, .vc-cabinIn, .vc-sideSpin, .vc-floaters i { animation: none !important; }
}
`;
