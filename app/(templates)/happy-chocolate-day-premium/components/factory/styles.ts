// "The Sweetheart Chocolate Factory" styles. Choco Latte + Strawberry Milk (research §C1), puffy pills with a darker
// lip, die-cut stickers, polaroids, washi tape and paper cups (§C3), springy motion (§C5). Transform/opacity only.

export const FACTORY_CSS = `
.sf-root { --ink:#4A2C1E; --deep:#7B4A2E; --primary:#B9744D; --soft:#EBCBAE; --pink:#FF6F9C; --pinkDeep:#D63F72; --pinkSoft:#FFD1DF; --pop:#FF9EBB; --butter:#FFD166; --mint:#9FE5C8; --choc:#5A3221; --card:#FFFCF7;
  --gummy: var(--sf-gummy), 'Fredoka', system-ui, sans-serif; --ui: var(--sf-ui), 'Fredoka', system-ui, sans-serif; --script: var(--font-vw-script), 'Dancing Script', cursive;
  position: relative; min-height: 100dvh; color: var(--ink); font-family: var(--ui); overflow-x: clip; }
.sf-root button { font-family: var(--ui); -webkit-tap-highlight-color: transparent; }
.sf-root :focus-visible { outline: 3px solid var(--pink); outline-offset: 3px; }

/* ── The factory floor around the stage ─────────────────────── */
.sf-floor { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  background: linear-gradient(160deg, #FFF8F0 0%, #FFE9EF 50%, #F6E2CF 100%); }
.sf-blob { position: absolute; border-radius: 50%; opacity: .5; }
.sf-blob.is-a { width: 70vmax; height: 70vmax; left: -30vmax; top: -24vmax; background: radial-gradient(closest-side, #FFD1DF, transparent); }
.sf-blob.is-b { width: 60vmax; height: 60vmax; right: -28vmax; bottom: -20vmax; background: radial-gradient(closest-side, #EBCBAE, transparent); }
.sf-blob.is-c { width: 40vmax; height: 40vmax; right: -8vmax; top: 18vh; background: radial-gradient(closest-side, #FFE6A8, transparent); opacity: .35; }
.sf-floaters i { position: absolute; left: var(--x); bottom: -30px; width: 5px; height: 14px; border-radius: 4px; opacity: .55;
  animation: sf-rise 16s linear infinite; animation-delay: calc(var(--d) * -1); }
@keyframes sf-rise { from { transform: translate3d(0,0,0) rotate(var(--r)); } 50% { transform: translate3d(18px,-55vh,0) rotate(calc(var(--r) + 120deg)); } to { transform: translate3d(-10px,-112vh,0) rotate(calc(var(--r) + 240deg)); } }
.sf-side { display: none; }
@media (min-width: 768px) {
  .sf-side { display: block; position: absolute; top: 50%; width: calc((100vw - 480px) / 2); height: 84vh; transform: translateY(-50%); }
  .sf-side.is-left { left: 0; } .sf-side.is-right { right: 0; }
  .sf-sideFactory { position: absolute; left: 8%; right: 8%; bottom: 4%; width: 84%; height: auto; }
  .sf-sideTruffles { position: absolute; left: 0; right: 0; top: 10%; display: flex; justify-content: center; gap: 14px; }
  .sf-sideTruffles span { animation: sf-bob 4.2s ease-in-out infinite; animation-delay: calc(var(--i) * -1.3s); }
  .sf-sideLolly { position: absolute; left: 50%; bottom: 6%; width: min(130px, 40%); transform: translateX(-50%) rotate(-8deg); }
  .sf-side.is-left .sf-sideGif { position: absolute; left: 50%; top: 14%; transform: translateX(-50%); }
  .sf-side.is-right .sf-sideGif { position: absolute; right: 14%; top: 38%; }
}
@media (min-width: 768px) and (max-width: 999px) {
  .sf-side .sf-sideGif { display: none; }
  .sf-sideTruffles { transform: scale(.6); }
}
@keyframes sf-bob { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-12px) rotate(4deg); } }
@keyframes sf-spin { to { transform: rotate(360deg); } }

/* ── The stage: a centred phone-like column ───────────────────── */
.sf-stage { position: relative; z-index: 2; max-width: 460px; margin: 0 auto; min-height: 100dvh; box-sizing: border-box;
  padding: calc(60px + env(safe-area-inset-top, 0px)) 16px calc(116px + var(--vw-dock-space, 0px)); }
@media (min-width: 768px) {
  .sf-stage { margin: 20px auto; min-height: calc(100dvh - 40px); border-radius: 40px; background: rgba(255,252,247,.62);
    border: 3px solid #fff; box-shadow: 0 30px 80px -30px rgba(123,74,46,.35); padding-top: 64px; }
}
.sf-sceneWrap { display: block; }
.sf-dots { display: flex; justify-content: center; gap: 7px; margin: 0 auto 6px; }
.sf-dot { width: 8px; height: 8px; border-radius: 99px; background: #EBCBAE; border: 0; padding: 0; transition: width .3s, background .3s; }
.sf-dot.is-past { background: #C98A5B; } .sf-dot.is-now { width: 22px; background: var(--pink); }
.sf-dots.is-map .sf-dot { width: 14px; height: 14px; cursor: pointer; } .sf-dots.is-map .sf-dot.is-now { width: 28px; }
.sf-foot { position: fixed; z-index: 60; left: 50%; transform: translateX(-50%); bottom: calc(18px + env(safe-area-inset-bottom, 0px) + var(--vw-dock-space, 0px));
  display: grid; justify-items: center; gap: 4px; pointer-events: none; width: max-content; }
.sf-foot > * { pointer-events: auto; }
.sf-next { animation: sf-popInK .5s cubic-bezier(.34,1.56,.64,1) both, sf-beat 2.4s 1s ease-in-out infinite; }
.sf-skip { all: unset; pointer-events: auto; cursor: pointer; font: 600 13px/1 var(--ui); color: var(--deep); opacity: .8; padding: 10px 14px; border-radius: 99px; background: rgba(255,255,255,.75); }
@keyframes sf-beat { 0%,100% { transform: scale(1); } 10% { transform: scale(1.08); } 20% { transform: scale(1); } 30% { transform: scale(1.05); } 40% { transform: scale(1); } }
@keyframes sf-popInK { from { opacity: 0; transform: scale(.4) rotate(-8deg); } to { opacity: 1; transform: scale(1) rotate(0); } }

/* ── Kit: buttons, heads, stickers, polaroids ─────────────────── */
.sf-puffy { position: relative; border: 0; cursor: pointer; border-radius: 999px; min-height: 52px; padding: 13px 28px;
  font: 700 17px/1.1 var(--ui); letter-spacing: .01em; transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s; white-space: nowrap; }
.sf-puffy.is-pink { background: linear-gradient(180deg, #FF8FAE, #FF6F9C); color: #fff; box-shadow: 0 5px 0 #D63F72, 0 12px 26px -8px rgba(214,63,114,.55); text-shadow: 0 1px 0 rgba(150,20,60,.25); }
.sf-puffy.is-choc { background: linear-gradient(180deg, #A0673F, #7B4A2E); color: #FFF3E6; box-shadow: 0 5px 0 #4A2C1E, 0 12px 26px -8px rgba(74,44,30,.5); }
.sf-puffy.is-butter { background: linear-gradient(180deg, #FFE08A, #FFD166); color: #5B3A00; box-shadow: 0 5px 0 #E0A92E, 0 12px 26px -8px rgba(200,140,20,.45); }
.sf-puffy.is-white { background: #fff; color: var(--pinkDeep); box-shadow: 0 4px 0 #FFD1DF, 0 10px 22px -10px rgba(214,63,114,.35); }
.sf-puffy.is-small { min-height: 44px; padding: 10px 20px; font-size: 15px; }
.sf-puffy:active:not(:disabled) { transform: translateY(3px) scale(.97); }
.sf-puffy.is-pink:active:not(:disabled) { box-shadow: 0 2px 0 #D63F72, 0 6px 14px -8px rgba(214,63,114,.5); }
.sf-puffy:disabled { cursor: default; }
.sf-link { all: unset; cursor: pointer; font: 700 14px/1.2 var(--ui); color: var(--pinkDeep); text-decoration: underline wavy #FFB3C6; text-underline-offset: 5px; padding: 10px 6px; }

.sf-scene { position: relative; display: grid; justify-items: center; text-align: center; }
.sf-head { display: grid; justify-items: center; gap: 6px; margin: 2px 0 12px; }
.sf-kick { display: inline-block; padding: 5px 12px; border-radius: 99px; background: #fff; color: var(--deep); font: 700 11.5px/1 var(--ui);
  letter-spacing: .12em; text-transform: uppercase; box-shadow: 0 3px 0 #F6E2CF; }
.sf-title { position: relative; margin: 2px 0 0; font: 800 clamp(28px, 8.4vw, 36px)/1.04 var(--gummy); color: var(--choc); letter-spacing: -.01em; padding: 0 22px;
  text-shadow: 0 3px 0 #fff, 0 5px 0 rgba(255,158,187,.55); text-wrap: balance; }
.sf-sparkL, .sf-sparkR { position: absolute; top: -4px; opacity: .7; animation: sf-twinkle 2.2s ease-in-out infinite; }
.sf-sparkL { left: -2px; } .sf-sparkR { right: -2px; top: 60%; animation-delay: -1.1s; }
@keyframes sf-twinkle { 0%,100% { transform: scale(.6) rotate(0); opacity: .4; } 50% { transform: scale(1.1) rotate(45deg); opacity: .9; } }
.sf-hint { margin: 0; font: 600 15px/1.35 var(--ui); color: var(--deep); max-width: 330px; }

.sf-gif { position: relative; display: inline-grid; place-items: center; flex: none; transform: rotate(var(--tilt, 0deg));
  filter: drop-shadow(0 0 0 #fff) drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 8px 10px rgba(123,74,46,.2)); }
.sf-gif img { width: 100%; height: 100%; object-fit: contain; user-select: none; pointer-events: none; }
.sf-gif.is-float { animation: sf-float 3.6s ease-in-out infinite; }
@keyframes sf-float { 0%,100% { transform: translateY(0) rotate(var(--tilt, 0deg)); } 50% { transform: translateY(-7px) rotate(calc(var(--tilt, 0deg) * -1)); } }
.sf-popIn { animation: sf-stickerIn .6s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes sf-stickerIn { from { opacity: 0; transform: scale(.3) rotate(-14deg); } to { opacity: 1; transform: scale(1) rotate(var(--tilt, 0deg)); } }

.sf-polaroid { position: relative; margin: 0; background: #fff; padding: 10px 10px 0; border-radius: 6px; transform: rotate(var(--tilt, 0deg));
  box-shadow: 0 2px 0 #F6E2CF, 0 18px 34px -16px rgba(74,44,30,.4); box-sizing: border-box; }
.sf-polaroidPic { position: relative; aspect-ratio: 1; border-radius: 3px; overflow: hidden; background: #FFE9EF; }
.sf-polaroidEmpty { display: grid; place-items: center; width: 100%; height: 100%; font-size: 48px; }
.sf-polaroid figcaption { font: 700 21px/1.15 var(--script); color: var(--pinkDeep); padding: 8px 4px 12px; text-align: center; overflow-wrap: anywhere; }
.sf-polaroid:not(:has(figcaption)) { padding-bottom: 10px; }
.sf-washi { position: absolute; width: 80px; height: 22px; opacity: .8; border-radius: 2px; z-index: 2;
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.4) 0 6px, transparent 6px 12px);
  -webkit-mask: radial-gradient(4px at 0 50%, transparent 98%, #000) left / 51% 8px repeat-y, radial-gradient(4px at 100% 50%, transparent 98%, #000) right / 51% 8px repeat-y;
          mask: radial-gradient(4px at 0 50%, transparent 98%, #000) left / 51% 8px repeat-y, radial-gradient(4px at 100% 50%, transparent 98%, #000) right / 51% 8px repeat-y; }

.sf-popCard { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 20px;
  background: radial-gradient(circle at 50% 40%, rgba(255,248,240,.85), rgba(246,226,207,.92)); animation: sf-fade .25s ease both; }
.sf-popCardIn { position: relative; animation: sf-cardIn .55s cubic-bezier(.34,1.56,.64,1) both; max-width: 340px; width: 100%; display: grid; justify-items: center; }
.sf-popClose { position: absolute; top: -6px; right: 4px; width: 44px; height: 44px; border-radius: 50%; border: 0; background: #fff; color: var(--pinkDeep);
  font: 700 18px/1 var(--ui); box-shadow: 0 4px 0 #FFD1DF; cursor: pointer; }
@keyframes sf-fade { from { opacity: 0; } }
@keyframes sf-cardIn { from { opacity: 0; transform: scale(.6) translateY(30px) rotate(-6deg); } }
.sf-prizeKick { font: 800 15px/1 var(--gummy); color: var(--pinkDeep); background: #fff; padding: 8px 16px; border-radius: 99px; box-shadow: 0 3px 0 #FFD1DF; }
.sf-truffle { display: block; overflow: visible; filter: drop-shadow(0 4px 4px rgba(74,44,30,.22)); }
.sf-cup { display: block; }
.sf-drips { position: absolute; left: 0; width: 100%; pointer-events: none; }
.sf-sprinkles { position: absolute; inset: 0; pointer-events: none; }
.sf-sprinkles i { position: absolute; width: 4px; height: 11px; border-radius: 3px; }
.sf-bubble { position: relative; display: inline-block; max-width: 260px; padding: 9px 14px; border-radius: 16px 16px 16px 4px; background: #FFE9EF;
  font: 700 14px/1.3 var(--ui); color: var(--ink); animation: sf-stickerIn .4s cubic-bezier(.34,1.56,.64,1) both; box-shadow: 0 3px 0 #FFD1DF; }

/* ── Gate: the golden ticket ─────────────────────────────────── */
.sf-gate { position: fixed; inset: 0; z-index: 120; display: flex; flex-direction: column; align-items: center; overflow: hidden auto; padding: 56px 16px 24px;
  background: radial-gradient(120% 70% at 50% 0%, #FFFFFF 0%, #FFE9EF 45%, #F6E2CF 100%); transition: opacity .6s .55s ease; }
.sf-gate.is-gone { opacity: 0; pointer-events: none; }
.sf-gate.is-reduced { transition-delay: 0s; transition-duration: .25s; }
.sf-gateSky { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 26vh; opacity: .55; }
@media (min-width: 640px) { .sf-gateSky { left: 50%; right: auto; width: 640px; height: 288px; transform: translateX(-50%); opacity: .5; } }
.sf-puff { animation: sf-puff 3.6s ease-in-out infinite; animation-delay: calc(var(--i) * -1.2s); transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes sf-puff { 0% { transform: translateY(8px) scale(.6); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-34px) scale(1.15); opacity: 0; } }
.sf-gateDoor { position: absolute; top: 0; bottom: 0; width: 14vw; max-width: 130px; z-index: 0;
  background: repeating-linear-gradient(180deg, #FF9EBB 0 22px, #FFF8F0 22px 44px); box-shadow: inset -10px 0 20px rgba(123,74,46,.15);
  transition: transform .9s cubic-bezier(.65,0,.35,1); }
.sf-gateDoor.is-l { left: 0; border-radius: 0 28px 28px 0; } .sf-gateDoor.is-r { right: 0; border-radius: 28px 0 0 28px; }
.sf-gate.is-gone .sf-gateDoor.is-l { transform: translateX(-105%); } .sf-gate.is-gone .sf-gateDoor.is-r { transform: translateX(105%); }
.sf-gateIn { position: relative; z-index: 2; margin: auto 0; flex: none; display: grid; justify-items: center; gap: 10px; text-align: center; width: min(400px, 100%); }
.sf-gate.is-gone .sf-gateIn { transform: scale(1.06); opacity: 0; transition: transform .7s ease, opacity .5s .3s ease; }
.sf-gateKick { margin: 0; font: 700 13px/1.2 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--deep); display: inline-flex; gap: 6px; align-items: center; }
.sf-inlineSpark { width: 13px; height: 13px; }
.sf-gateName { position: relative; margin: 0 0 4px; font: 700 clamp(52px, 16vw, 76px)/1 var(--script); color: var(--pinkDeep); overflow-wrap: anywhere;
  text-shadow: 0 3px 0 #fff, 0 6px 0 rgba(255,158,187,.65); animation: sf-stickerIn .8s .1s cubic-bezier(.34,1.56,.64,1) both; }
.sf-scribble { position: absolute; left: 6%; right: 6%; bottom: -10px; height: 14px; width: 88%; }
.sf-ticketWrap { position: relative; margin: 14px 0 0; }
.sf-gateBear { position: absolute; left: -30px; top: -62px; z-index: 3; }
.sf-gateCat { position: absolute; right: -18px; bottom: -40px; z-index: 3; }
.sf-ticket { position: relative; display: grid; justify-items: center; gap: 6px; width: min(320px, 82vw); padding: 16px 16px 14px; border-radius: 18px; transform: rotate(-2deg);
  background: linear-gradient(135deg, #FFF3C4 0%, #FFD66B 45%, #F2B544 100%); box-shadow: 0 6px 0 #D99A2B, 0 22px 30px -14px rgba(160,100,20,.5);
  outline: 2px dashed rgba(123,74,46,.35); outline-offset: -8px; animation: sf-ticketIn .9s .2s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes sf-ticketIn { from { opacity: 0; transform: translateY(40px) rotate(8deg) scale(.8); } }
.sf-tNotch { position: absolute; top: 50%; width: 22px; height: 22px; margin-top: -11px; border-radius: 50%; background: #FFE9EF; }
.sf-tNotch.is-l { left: -11px; } .sf-tNotch.is-r { right: -11px; }
.sf-tTop { font: 800 12px/1 var(--ui); letter-spacing: .2em; color: #8A5A12; }
.sf-tHouse { font: 800 22px/1.05 var(--gummy); color: var(--choc); max-width: 260px; overflow-wrap: anywhere; }
.sf-tScratch { position: relative; width: 100%; border-radius: 14px; box-shadow: inset 0 0 0 3px rgba(255,255,255,.6); }
.sf-tAdmit { display: grid; justify-items: center; gap: 2px; width: 100%; height: 100%; align-content: center; background: #FFFCF7; border-radius: 14px; }
.sf-tAdmit small { font: 800 11px/1 var(--ui); letter-spacing: .2em; color: var(--deep); }
.sf-tAdmit b { font: 700 32px/1 var(--script); color: var(--pinkDeep); }
.sf-tAdmit em { font: 600 12px/1.2 var(--ui); font-style: normal; color: var(--deep); }
.sf-tLine { font: 600 12.5px/1.3 var(--ui); color: #6B4210; max-width: 250px; }
.sf-tFoot { display: flex; justify-content: space-between; width: 88%; font: 700 10px/1 var(--ui); letter-spacing: .1em; color: #8A5A12; margin-top: 2px; }
.sf-gateHint { margin: 22px 0 0; min-height: 18px; font: 600 14px/1.3 var(--ui); color: var(--deep); }
.sf-gateCta { display: grid; gap: 3px; justify-items: center; min-width: 230px; margin-top: 4px; }
.sf-gateCta small { font: 600 11px/1 var(--ui); opacity: .85; }
.sf-gateSeal { display: inline-flex; gap: 6px; align-items: center; font: 700 13px/1.2 var(--ui); color: var(--deep); background: rgba(255,255,255,.75); padding: 4px 14px 4px 6px; border-radius: 99px; }
.sf-quiet { all: unset; cursor: pointer; min-height: 40px; padding: 0 10px; font: 600 13px/1 var(--ui); color: var(--deep); text-decoration: underline; text-underline-offset: 3px; display: inline-flex; gap: 6px; align-items: center; }

/* ── 1 · Packing line ───────────────────────────────────────── */
.sf-belt { position: relative; width: min(370px, 94vw); height: 92px; margin: 8px 0 18px; }
.sf-beltTrack { position: absolute; left: 0; right: 0; bottom: 4px; height: 30px; border-radius: 99px; background: #7B4A2E; box-shadow: 0 5px 0 #4A2C1E; overflow: hidden; }
.sf-beltStripes { position: absolute; inset: 5px 14px; border-radius: 99px; background: repeating-linear-gradient(90deg, #A0673F 0 14px, #8B5A3C 14px 28px);
  background-size: 28px 100%; animation: sf-belt 1.1s linear infinite; }
@keyframes sf-belt { to { background-position: 28px 0; } }
.sf-roller { position: absolute; top: 3px; width: 24px; height: 24px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFD1DF, #FF8FAB); animation: sf-spin 1.1s linear infinite; }
.sf-roller::after { content: ""; position: absolute; left: 50%; top: 3px; width: 3px; height: 18px; margin-left: -1.5px; background: #fff; border-radius: 2px; }
.sf-roller.is-l { left: 3px; } .sf-roller.is-r { right: 3px; }
.sf-beltItems { position: absolute; left: 10px; right: 10px; bottom: 26px; display: flex; justify-content: space-between; }
.sf-beltItem { position: relative; width: 54px; height: 58px; padding: 0; border: 0; background: none; cursor: grab; touch-action: none; display: grid; place-items: end center;
  animation: sf-ride 1.4s ease-in-out infinite; animation-delay: calc(var(--d) * -1); transition: opacity .2s, transform .2s; }
@keyframes sf-ride { 0%,100% { transform: translate(-3px, 0) rotate(-4deg); } 50% { transform: translate(3px, -5px) rotate(4deg); } }
.sf-beltItem.is-gone { opacity: 0; pointer-events: none; animation: none; }
.sf-beltItem.is-lifted { opacity: .25; }
.sf-beltCat { position: absolute; z-index: 3; right: 4px; bottom: -84px; }
.sf-flyer, .sf-dragGhost { position: fixed; z-index: 200; pointer-events: none; }
.sf-flyer { animation: sf-fly .46s cubic-bezier(.4,0,.2,1) forwards; }
@keyframes sf-fly { 40% { transform: translate(calc(var(--dx) * .5), calc(var(--dy) * .5 - 60px)) scale(1.2) rotate(-10deg); } to { transform: translate(var(--dx), var(--dy)) scale(.95); } }
.sf-dragGhost { transform: translate(-50%, -60%) rotate(-8deg) scale(1.1); }
.sf-box { position: relative; width: min(330px, 88vw); padding: 34px 16px 18px; border-radius: 28px; background: linear-gradient(180deg, #FF9EBB, #FF8FAB);
  box-shadow: 0 7px 0 #D63F72, 0 24px 34px -18px rgba(214,63,114,.6); }
.sf-box::before { content: ""; position: absolute; inset: 10px; border-radius: 20px; background: #FFF1F5; box-shadow: inset 0 4px 10px rgba(214,63,114,.18); }
.sf-boxLabel { position: absolute; z-index: 2; left: 50%; top: -18px; transform: translateX(-50%); max-width: 92%; width: max-content; padding: 8px 16px; border-radius: 99px; background: #fff;
  box-shadow: 0 4px 0 #FFD1DF; font: 700 12.5px/1.2 var(--ui); color: var(--deep); }
.sf-boxLabel b { font: 800 16px/1.15 var(--gummy); color: var(--pinkDeep); display: block; animation: sf-stickerIn .6s cubic-bezier(.34,1.56,.64,1) both; }
.sf-boxGrid { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; justify-items: center; }
.sf-slot { position: relative; display: grid; place-items: center; }
.sf-slot > * { grid-area: 1 / 1; }
.sf-slotTruffle { animation: sf-land .55s cubic-bezier(.34,1.56,.64,1) both; margin-top: -4px; }
@keyframes sf-land { from { transform: scale(1.4) translateY(-14px); } 50% { transform: scale(.85, 1.15); } }
.sf-boxCount { position: absolute; z-index: 2; right: 14px; bottom: -14px; font: 800 13px/1 var(--ui); color: #fff; background: var(--pinkDeep); padding: 6px 10px; border-radius: 99px; box-shadow: 0 3px 0 #A82B58; }
.sf-box.is-full { animation: sf-wiggle .7s ease 1; }
@keyframes sf-wiggle { 20% { transform: rotate(-3deg) scale(1.03); } 40% { transform: rotate(3deg) scale(1.03); } 60% { transform: rotate(-2deg); } 80% { transform: rotate(1deg); } }
.sf-boxGif { position: absolute; z-index: 3; left: -26px; bottom: -34px; }
.sf-flavour { position: relative; min-height: 92px; display: grid; place-items: center; margin-top: 22px; width: min(360px, 92vw); }
.sf-flavourCard { margin: 0; display: flex; gap: 12px; align-items: center; text-align: left; width: 100%; box-sizing: border-box; padding: 12px 16px; border-radius: 20px; background: #fff;
  box-shadow: 0 4px 0 #F6E2CF, 0 14px 26px -18px rgba(123,74,46,.45); animation: sf-stickerIn .45s cubic-bezier(.34,1.56,.64,1) both; }
.sf-flavourCard .sf-truffle { flex: none; }
.sf-flavourCard span { display: grid; gap: 2px; font: 700 16px/1.3 var(--ui); color: var(--ink); }
.sf-flavourCard b { font: 800 12px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--pinkDeep); }
.sf-flavourEmpty { margin: 0; font: 600 14px/1.3 var(--ui); color: var(--deep); opacity: .8; }

/* ── 2 · Wrapping room ──────────────────────────────────────── */
.sf-barStage { position: relative; margin-top: 18px; }
.sf-barGif { position: absolute; z-index: 5; left: -30px; bottom: -34px; }
.sf-bar { position: relative; width: min(300px, 80vw); aspect-ratio: 3 / 4; border-radius: 22px; }
.sf-barPhoto { position: absolute; inset: 0; border-radius: 22px; overflow: hidden; background: #5A3221; box-shadow: 0 8px 0 #3E2216, 0 26px 40px -18px rgba(74,44,30,.6);
  border: 10px solid #5A3221; box-sizing: border-box;
  filter: sepia(1) saturate(1.6) hue-rotate(-12deg) brightness(.72) contrast(1.15); transition: filter 1.8s .5s ease; }
.sf-barPhoto::after { content: ""; position: absolute; inset: 0; border-radius: 12px; box-shadow: inset 3px 3px 0 rgba(255,220,190,.35), inset -4px -4px 0 rgba(0,0,0,.3); pointer-events: none; }
.sf-barStage.is-bar .sf-barPhoto { filter: none; }
.sf-barGrid { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(90deg, transparent calc(33.3% - 3px), rgba(40,18,8,.55) calc(33.3% - 3px) calc(33.3% + 1px), rgba(255,220,190,.25) calc(33.3% + 1px) calc(33.3% + 3px), transparent calc(33.3% + 3px) calc(66.6% - 3px), rgba(40,18,8,.55) calc(66.6% - 3px) calc(66.6% + 1px), rgba(255,220,190,.25) calc(66.6% + 1px) calc(66.6% + 3px), transparent calc(66.6% + 3px)),
    linear-gradient(180deg, transparent calc(25% - 3px), rgba(40,18,8,.55) calc(25% - 3px) calc(25% + 1px), rgba(255,220,190,.25) calc(25% + 1px) calc(25% + 3px), transparent calc(25% + 3px) calc(50% - 3px), rgba(40,18,8,.55) calc(50% - 3px) calc(50% + 1px), rgba(255,220,190,.25) calc(50% + 1px) calc(50% + 3px), transparent calc(50% + 3px) calc(75% - 3px), rgba(40,18,8,.55) calc(75% - 3px) calc(75% + 1px), rgba(255,220,190,.25) calc(75% + 1px) calc(75% + 3px), transparent calc(75% + 3px));
  box-shadow: inset 0 0 0 6px rgba(40,18,8,.35), inset 0 0 30px rgba(40,18,8,.4); transition: opacity 1.6s 1s ease; }
.sf-barStage.is-bar .sf-barGrid { opacity: .35; }
.sf-barEmpty { display: grid; place-items: center; width: 100%; height: 100%; font-size: 64px; }
.sf-foil { position: absolute; inset: -4px; border: 0; padding: 0; background: none; cursor: pointer; border-radius: 22px; z-index: 2; }
.sf-foil:disabled { cursor: default; }
.sf-foilHalf { position: absolute; top: 0; bottom: 0; width: 50.5%; transition: transform .8s cubic-bezier(.6,-.2,.7,1), opacity .8s .2s;
  background: linear-gradient(115deg, #F6D98A 0%, #FFF4C8 18%, #E2B04E 34%, #FFF0B8 52%, #D9A23F 70%, #FFE9A3 86%, #E5B65A 100%);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,.5); }
.sf-foilHalf::after { content: ""; position: absolute; inset: 0; opacity: .35; background: repeating-linear-gradient(32deg, transparent 0 9px, rgba(255,255,255,.55) 9px 11px, transparent 11px 20px), repeating-linear-gradient(-28deg, transparent 0 13px, rgba(160,100,20,.3) 13px 14px, transparent 14px 26px); }
.sf-foilHalf.is-l { left: 0; border-radius: 22px 0 0 22px; transform-origin: 0 50%; }
.sf-foilHalf.is-r { right: 0; border-radius: 0 22px 22px 0; transform-origin: 100% 50%; }
.sf-barStage.is-bar .sf-foilHalf.is-l { transform: translateX(-30%) rotate(-24deg) scale(.9); opacity: 0; }
.sf-barStage.is-bar .sf-foilHalf.is-r { transform: translateX(30%) rotate(24deg) scale(.9); opacity: 0; }
.sf-barStage.is-bar .sf-foil { pointer-events: none; }
.sf-foilHint { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font: 800 22px/1 var(--gummy); color: #8A5A12; background: rgba(255,255,255,.75); padding: 10px 18px; border-radius: 99px;
  animation: sf-beat 1.8s ease-in-out infinite; }
.sf-wrapper { position: absolute; inset: -6px -6px 18% -6px; z-index: 3; border: 0; cursor: grab; touch-action: none; border-radius: 22px 22px 10px 10px; padding: 26px 16px 18px;
  display: grid; align-content: center; justify-items: center; gap: 6px; color: #fff; transition: transform .7s cubic-bezier(.5,-.2,.6,1), opacity .5s .3s;
  background: radial-gradient(circle at 20% 20%, rgba(255,255,255,.25) 0 14px, transparent 15px) 0 0 / 46px 46px, linear-gradient(160deg, #FF8FAE, #FF6F9C 55%, #E8507E);
  box-shadow: 0 6px 0 #D63F72, 0 20px 30px -14px rgba(214,63,114,.6); }
.sf-wrapper::after { content: ""; position: absolute; left: 0; right: 0; bottom: -10px; height: 12px; background: linear-gradient(-45deg, transparent 6px, #E8507E 6px) 0 0 / 12px 12px repeat-x, linear-gradient(45deg, transparent 6px, #E8507E 6px) 0 0 / 12px 12px repeat-x; }
.sf-barStage:not(.is-wrapped) .sf-wrapper { transform: translateY(120%) rotate(12deg) !important; opacity: 0; pointer-events: none; }
.sf-wrapTop { font: 700 11px/1.2 var(--ui); letter-spacing: .16em; text-transform: uppercase; opacity: .92; max-width: 220px; }
.sf-wrapName { font: 700 54px/1 var(--script); text-shadow: 0 3px 0 rgba(150,20,60,.25); overflow-wrap: anywhere; }
.sf-wrapEd { font: 800 14px/1 var(--gummy); background: #fff; color: var(--pinkDeep); padding: 6px 12px; border-radius: 99px; }
.sf-wrapNet { font: 600 11px/1.2 var(--ui); opacity: .9; }
.sf-wrapPull { margin-top: 6px; font: 800 13px/1 var(--ui); background: rgba(255,255,255,.25); padding: 7px 14px; border-radius: 99px; animation: sf-tug 1.6s ease-in-out infinite; }
@keyframes sf-tug { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
.sf-barCaption { margin: 22px 0 0; min-height: 30px; max-width: 320px; font: 700 24px/1.2 var(--script); color: var(--pinkDeep); opacity: 0; transition: opacity .6s 1.2s; }
.sf-barCaption.is-on { opacity: 1; }

/* ── 3 · Dipping station ────────────────────────────────────── */
.sf-dipStage { position: relative; display: grid; justify-items: center; width: min(360px, 94vw); padding-top: 6px; }
.sf-line { position: absolute; left: 0; right: 0; top: 0; width: 100%; height: 30px; }
.sf-dipFrame { position: relative; z-index: 2; border: 0; padding: 0; background: none; cursor: grab; touch-action: none; margin-top: 10px; transition: transform .45s cubic-bezier(.34,1.56,.64,1); }
.sf-dipFrame.is-down { transform: translateY(150px) !important; transition: transform .32s cubic-bezier(.6,0,.9,.4); }
.sf-dipFrame.is-up { transform: translateY(0); }
.sf-dipFrame.is-dipped { cursor: default; animation: sf-shake .5s .1s ease 1; }
@keyframes sf-shake { 25% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } 75% { transform: rotate(-1deg); } }
.sf-peg { position: absolute; z-index: 3; left: 50%; top: -12px; width: 14px; height: 30px; margin-left: -7px; border-radius: 4px; background: linear-gradient(90deg, #FFB3C6, #FF8FAB); box-shadow: 0 2px 0 #D63F72; }
.sf-dipCoat { z-index: 2; bottom: 0; height: 42%; transform: rotate(180deg); animation: sf-coat .5s ease-out both; }
@keyframes sf-coat { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
.sf-dipSprinkles { z-index: 3; top: auto; height: 34%; bottom: 0; }
.sf-pot { position: relative; z-index: 3; width: 250px; margin-top: 4px; pointer-events: none; }
.sf-potChoc { position: relative; display: block; height: 34px; margin: 0 14px -14px; border-radius: 50%; background: radial-gradient(ellipse at 50% 40%, #8B5A3C, #5A3221); overflow: hidden; }
.sf-bub { position: absolute; bottom: 4px; left: calc(22% + var(--i) * 26%); width: 12px; height: 12px; border-radius: 50%; background: #A0673F; animation: sf-bub 1.6s ease-in infinite; animation-delay: calc(var(--i) * -.55s); }
@keyframes sf-bub { 0% { transform: scale(.2); opacity: 0; } 40% { opacity: 1; } 100% { transform: scale(1.2) translateY(-6px); opacity: 0; } }
.sf-potBody { display: grid; place-items: center; height: 74px; border-radius: 0 0 60px 60px / 0 0 46px 46px; background: linear-gradient(180deg, #FF9EBB, #FF6F9C); box-shadow: 0 6px 0 #D63F72; }
.sf-potBody b { font: 800 13px/1 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: #fff; }
.sf-dipGif { position: absolute; z-index: 4; right: -16px; bottom: -6px; }
.sf-dipNote { min-height: 44px; display: grid; place-items: center; margin-top: 10px; width: min(340px, 90vw); }
.sf-dipNote p { margin: 0; font: 600 15px/1.4 var(--ui); color: var(--ink); background: #fff; padding: 10px 14px; border-radius: 16px; box-shadow: 0 3px 0 #F6E2CF; animation: sf-stickerIn .45s cubic-bezier(.34,1.56,.64,1) both; }
.sf-tray { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 10px 0 0; padding: 8px 12px; border-radius: 20px; background: rgba(255,255,255,.7); box-shadow: 0 3px 0 #F6E2CF; }
.sf-trayItem { position: relative; width: 44px; height: 44px; padding: 0; border: 3px solid #fff; border-radius: 12px; overflow: hidden; cursor: pointer; background: #FFE9EF; opacity: .5; filter: grayscale(.4); transition: transform .2s, opacity .2s; }
.sf-trayItem span { display: grid; place-items: center; height: 100%; }
.sf-trayItem.is-dipped { opacity: 1; filter: none; }
.sf-trayItem.is-now { transform: translateY(-4px); box-shadow: 0 0 0 3px var(--pink); }
.sf-trayCoat { z-index: 2; bottom: 0; height: 46%; transform: rotate(180deg); }

/* ── 4 · Quality control (catch game) ───────────────────────── */
.sf-hud { display: flex; align-items: center; gap: 10px; width: min(360px, 94vw); margin-bottom: 8px; }
.sf-score { flex: none; padding: 7px 12px; border-radius: 99px; background: #fff; box-shadow: 0 3px 0 #FFD1DF; font: 700 13px/1.1 var(--ui); color: var(--deep); max-width: 60%; text-align: left; }
.sf-score b { font: 800 18px/1 var(--gummy); color: var(--pinkDeep); }
.sf-timer { flex: 1; height: 12px; border-radius: 99px; background: rgba(255,255,255,.8); overflow: hidden; box-shadow: inset 0 0 0 2px #fff; }
.sf-timer i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #FF6F9C, #FFD166); transform-origin: 0 50%; transition: transform .3s linear; }
.sf-playfield { position: relative; width: min(360px, 94vw); height: min(400px, 52vh); min-height: 320px; border-radius: 26px; overflow: hidden; touch-action: none; user-select: none;
  background: radial-gradient(circle, rgba(255,158,187,.35) 2px, transparent 3px) 0 0 / 26px 26px, linear-gradient(180deg, #FFF8F0 0%, #FFE9EF 100%); box-shadow: inset 0 0 0 4px #fff, 0 6px 0 #F6E2CF, 0 20px 30px -18px rgba(123,74,46,.45); }
.sf-chute { position: absolute; left: 12%; right: 12%; top: -8px; height: 36px; border-radius: 0 0 18px 18px; background: #7B4A2E; display: grid; place-items: center; box-shadow: 0 4px 0 #4A2C1E; }
.sf-chute span { font: 800 10px/1 var(--ui); letter-spacing: .2em; color: #FFD1DF; margin-top: 6px; }
.sf-fall { position: absolute; left: 0; top: 0; width: 46px; height: 46px; will-change: transform; pointer-events: none; }
.sf-fall img { width: 100%; height: 100%; }
.sf-plus { position: absolute; z-index: 5; transform: translate(-50%, -100%); font: 800 18px/1 var(--gummy); color: var(--pinkDeep); text-shadow: 0 2px 0 #fff; animation: sf-plusUp .7s ease-out forwards; pointer-events: none; white-space: nowrap; }
@keyframes sf-plusUp { to { transform: translate(-50%, -160%); opacity: 0; } }
.sf-basket { position: absolute; left: 0; bottom: 8px; width: 96px; height: 96px; display: grid; justify-items: center; align-content: end; will-change: transform; pointer-events: none; }
.sf-basketBear { position: absolute; top: -2px; left: 50%; margin-left: -32px; }
.sf-basket svg { position: relative; z-index: 2; }
.sf-catchStart, .sf-catchOver { position: absolute; inset: 0; z-index: 6; display: grid; justify-items: center; align-content: center; gap: 10px; padding: 16px; background: rgba(255,248,240,.82); }
.sf-catchStart small { font: 600 13px/1 var(--ui); color: var(--deep); }
.sf-overScore { font: 800 56px/1 var(--gummy); color: var(--pinkDeep); text-shadow: 0 3px 0 #fff; animation: sf-yayIn 1s cubic-bezier(.34,1.56,.64,1) both; }
.sf-catchOver p { margin: 0; font: 600 16px/1.4 var(--ui); color: var(--ink); max-width: 290px; }
.sf-catchOver p b { color: var(--pinkDeep); }

/* ── 5 · Melting room ───────────────────────────────────────── */
.sf-meltStage { position: relative; display: grid; justify-items: center; min-height: 330px; width: min(360px, 94vw); }
.sf-meltGif { position: absolute; z-index: 4; left: -6px; top: -10px; }
.sf-heartLine { position: relative; z-index: 3; display: grid; gap: 6px; justify-items: center; min-height: 0; max-width: 320px; }
.sf-meltStage.is-melted .sf-heartLine { margin-top: 70px; padding: 46px 20px 16px; overflow: hidden; border-radius: 26px; background: #fff; box-shadow: 0 6px 0 #FFD1DF, 0 24px 40px -22px rgba(214,63,114,.5); animation: sf-cardIn .7s .1s cubic-bezier(.34,1.56,.64,1) both; }
.sf-heartLine b { font: 800 26px/1.15 var(--gummy); color: var(--pinkDeep); text-wrap: balance; }
.sf-heartLine small { font: 700 22px/1 var(--script); color: var(--deep); }
.sf-chocHeart { position: relative; margin-top: 30px; border: 0; padding: 0; background: none; cursor: pointer; touch-action: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
  transform: scale(calc(1 + var(--p) * .04), calc(1 - var(--p) * .12)); transform-origin: 50% 100%; transition: transform .12s linear; filter: drop-shadow(0 16px 18px rgba(74,44,30,.35)); }
.sf-meltStage.is-holding .sf-chocHeart { animation: sf-tremble .14s linear infinite; }
@keyframes sf-tremble { 50% { translate: 1px 0; } }
.sf-chocHeart svg { display: block; }
.sf-hDrip { transition: height .12s linear; }
.sf-holdRing { position: absolute; left: 50%; bottom: -26px; width: 140px; height: 10px; margin-left: -70px; border-radius: 99px; background: rgba(255,255,255,.85); overflow: hidden; box-shadow: inset 0 0 0 2px #fff; }
.sf-holdRing i { display: block; height: 100%; background: linear-gradient(90deg, #FF6F9C, #FFD166); transform-origin: 0 50%; }
.sf-heartLine .sf-drips { top: -1px; height: 48px; animation: sf-pour 1s ease-out both; }
@keyframes sf-pour { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
.sf-readBtn { position: relative; z-index: 3; margin-top: 22px; animation: sf-popInK .5s .9s cubic-bezier(.34,1.56,.64,1) both; }
.sf-puddleGif { position: absolute; z-index: 4; right: -4px; top: 30px; }
.sf-paperWrap { position: relative; width: min(370px, 92vw); animation: sf-cardIn .7s cubic-bezier(.34,1.56,.64,1) both; }
.sf-paper { position: relative; width: 100%; max-height: 56vh; overflow: auto; text-align: left; padding: 34px 22px 18px; border-radius: 18px; box-sizing: border-box;
  background: #FFFCF7 repeating-linear-gradient(180deg, transparent 0 29px, #F6E2CF 29px 30px); background-position: 0 34px; box-shadow: 0 6px 0 #F6E2CF, 0 22px 40px -20px rgba(74,44,30,.4); overscroll-behavior: contain; }
.sf-paperText { font: 600 17px/30px var(--ui); color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; }
.sf-sign { margin: 10px 0 0; font: 700 26px/1.1 var(--script); color: var(--pinkDeep); text-align: right; }
.sf-paperGif { position: absolute; left: -14px; bottom: -30px; z-index: 2; }

/* ── 6 · Music box ──────────────────────────────────────────── */
.sf-mbox { position: relative; display: grid; justify-items: center; margin-top: 46px; }
.sf-mboxLid { position: relative; z-index: 3; border: 0; padding: 0; background: none; cursor: pointer; transform-origin: 50% 100%; transition: transform .8s cubic-bezier(.34,1.56,.64,1); animation: sf-wiggle 2.6s 1s ease-in-out infinite; }
.sf-mboxLid svg { display: block; filter: drop-shadow(0 8px 10px rgba(214,63,114,.3)); }
.sf-mbox.is-open .sf-mboxLid { transform: translate(-58px, -22px) rotate(-18deg) scale(.72); animation: none; cursor: default; }
.sf-mboxDancer { position: absolute; z-index: 1; left: 50%; top: -6px; margin-left: -32px; opacity: 0; transform: translateY(20px); transition: opacity .3s .4s, transform .6s .4s cubic-bezier(.34,1.56,.64,1); }
.sf-mbox.is-open .sf-mboxDancer { opacity: 1; transform: translateY(-58px); }
.sf-mbox.is-open .sf-mboxDancer .sf-truffle { animation: sf-twirl 2.4s .9s linear infinite; }
@keyframes sf-twirl { 0% { transform: rotateY(0) translateY(0); } 25% { transform: rotateY(90deg) translateY(-6px); } 50% { transform: rotateY(180deg) translateY(0); } 75% { transform: rotateY(270deg) translateY(-6px); } 100% { transform: rotateY(360deg) translateY(0); } }
.sf-mboxBody { position: relative; z-index: 2; width: min(300px, 84vw); margin-top: -26px; padding: 22px 14px 16px; border-radius: 24px 24px 34px 34px; background: linear-gradient(180deg, #A0673F, #7B4A2E);
  box-shadow: 0 7px 0 #4A2C1E, 0 26px 34px -18px rgba(74,44,30,.6); display: grid; gap: 10px; }
.sf-mboxInside { min-height: 96px; display: grid; place-items: center; background: #FFF1F5; border-radius: 16px; padding: 10px; box-shadow: inset 0 4px 10px rgba(74,44,30,.2); }
.sf-mboxMsg { margin: 0; padding-bottom: 26px; font: 700 16px/1.45 var(--ui); color: var(--ink); }
.sf-mboxMsg.is-closed { padding-bottom: 0; }
.sf-mboxMsg.is-closed { color: #C98A5B; letter-spacing: .3em; font-size: 22px; animation: sf-beat 2s ease-in-out infinite; }
.sf-voice { width: 100%; margin: 0; color: var(--ink); }
.sf-mboxCaption { margin: 0; font: 700 19px/1.25 var(--script); color: #FFE9EF; }
.sf-nowPlaying { margin: 14px 0 0; font: 700 13px/1.3 var(--ui); color: var(--deep); background: #fff; padding: 7px 14px; border-radius: 99px; box-shadow: 0 3px 0 #F6E2CF; }
.sf-mboxGif { margin-top: 12px; }

/* ── 7 · The last piece ─────────────────────────────────────── */
.sf-plate { position: relative; display: grid; place-items: center; width: 280px; height: 200px; margin-top: 10px; }
.sf-plate::before { content: ""; position: absolute; left: 10px; right: 10px; top: 46px; height: 140px; border-radius: 50%; background: #fff; box-shadow: inset 0 -8px 0 #F6E2CF, 0 10px 22px -12px rgba(74,44,30,.4); }
.sf-plate::after { content: ""; position: absolute; left: 40px; right: 40px; top: 66px; height: 100px; border-radius: 50%; border: 3px dashed #FFD1DF; }
.sf-plateGif { position: absolute; z-index: 4; left: -20px; top: -22px; }
.sf-pieceBar { position: relative; z-index: 2; display: flex; gap: 0; margin-top: 30px; transform: rotate(-6deg); }
.sf-half { display: grid; grid-auto-flow: column; gap: 4px; padding: 6px; border-radius: 8px; background: #5A3221; box-shadow: 0 5px 0 #3E2216; transition: transform .7s cubic-bezier(.34,1.56,.64,1); }
.sf-half i { width: 44px; height: 54px; border-radius: 6px; background: linear-gradient(145deg, #A0673F, #7B4A2E); box-shadow: inset 2px 2px 0 rgba(255,255,255,.18), inset -3px -3px 0 rgba(0,0,0,.18); }
.sf-halfSmall { border-radius: 8px 0 0 8px; } .sf-halfBig { border-radius: 0 8px 8px 0; }
.sf-last.is-taken .sf-halfSmall { transform: translate(-26px, -10px) rotate(-14deg); }
.sf-last.is-taken .sf-halfBig { transform: translate(30px, 26px) rotate(10deg) scale(1.08); }
.sf-pieceSprinkles { inset: -10px; }
.sf-crumbs { position: absolute; z-index: 2; left: 46%; top: 128px; width: 30px; height: 10px; background: radial-gradient(circle, #7B4A2E 2px, transparent 3px) 0 0 / 10px 10px; opacity: 0; transition: opacity .4s .3s; }
.sf-last.is-taken .sf-crumbs { opacity: 1; }
.sf-lastLine { display: grid; justify-items: center; gap: 8px; margin-top: 16px; }
.sf-lastLine p { margin: 0; max-width: 320px; font: 800 26px/1.2 var(--gummy); color: var(--pinkDeep); text-shadow: 0 3px 0 #fff; animation: sf-cardIn .7s .3s cubic-bezier(.34,1.56,.64,1) both; text-wrap: balance; }
.sf-pick { display: grid; justify-items: center; gap: 6px; width: min(360px, 94vw); margin-top: 10px; }
.sf-pick > .sf-bubble { min-height: 18px; }
.sf-pickZone { position: relative; width: 100%; height: 170px; }
.sf-pickMe { position: absolute; left: 50%; top: 18px; margin-left: -88px; width: 176px; min-height: 60px; font-size: 21px; transition: transform .35s cubic-bezier(.34,1.56,.64,1); z-index: 2; overflow: hidden; text-overflow: ellipsis; }
.sf-pickMe2 { position: absolute; left: 50%; top: 100px; margin-left: -88px; width: 176px; animation: sf-stickerIn .6s cubic-bezier(.34,1.56,.64,1) both; z-index: 2; overflow: hidden; text-overflow: ellipsis; }
.sf-pickHim { position: absolute; left: 50%; top: 104px; transform: translate(-50%, 0); min-width: 92px; max-width: 150px; min-height: 44px; padding: 10px 20px; border-radius: 99px; border: 2px solid #EBCBAE;
  background: #fff; color: var(--deep); font: 700 16px/1 var(--ui); cursor: pointer; z-index: 1; transition: left .35s cubic-bezier(.34,1.56,.64,1), top .35s cubic-bezier(.34,1.56,.64,1), transform .35s; touch-action: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── 8 · The grand finale ───────────────────────────────────── */
.sf-fountainStage { position: relative; display: flex; align-items: flex-end; justify-content: center; gap: 4px; margin-top: 6px; }
.sf-fountain { display: block; filter: drop-shadow(0 14px 18px rgba(74,44,30,.3)); }
.sf-fountainCat { position: absolute; z-index: 3; left: -12px; top: 0; }
.sf-fFlow { stroke-dasharray: 10 8; animation: sf-flow .6s linear infinite; }
@keyframes sf-flow { to { stroke-dashoffset: -18; } }
.sf-fBub { animation: sf-bub 1.4s ease-in infinite; animation-delay: calc(var(--i) * -.35s); transform-box: fill-box; transform-origin: center; }
.sf-finale.is-riser .sf-fountain { animation: sf-rumble .09s linear infinite; filter: drop-shadow(0 0 22px rgba(255,209,102,.9)) drop-shadow(0 14px 18px rgba(74,44,30,.3)); }
@keyframes sf-rumble { 25% { transform: translate(-2px, 1px); } 75% { transform: translate(2px, -1px); } }
.sf-finale.is-riser .sf-fFlow { animation-duration: .2s; }
.sf-lever { position: relative; width: 74px; height: 190px; margin-bottom: 30px; border: 0; padding: 0; background: none; cursor: grab; touch-action: none; display: grid; justify-items: center; }
.sf-lever:disabled { cursor: default; }
.sf-leverSlot { position: absolute; left: 50%; top: 20px; width: 18px; height: 120px; margin-left: -9px; border-radius: 99px; background: #7B4A2E; box-shadow: inset 0 4px 0 rgba(0,0,0,.25), 0 4px 0 #4A2C1E; }
.sf-leverArm { position: absolute; left: 50%; top: 14px; width: 6px; margin-left: -3px; height: 40px; transition: transform .35s cubic-bezier(.34,1.56,.64,1); }
.sf-leverArm i { position: absolute; left: 50%; top: -20px; width: 46px; height: 46px; margin-left: -23px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FFF, #FF8FAB 55%, #FF6F9C); box-shadow: 0 5px 0 #D63F72; }
.sf-finale.is-wait .sf-leverArm i { animation: sf-beat 1.8s ease-in-out infinite; }
.sf-lever b { position: absolute; bottom: 14px; font: 800 14px/1 var(--ui); letter-spacing: .14em; color: #fff; background: var(--pinkDeep); padding: 7px 10px; border-radius: 99px; box-shadow: 0 3px 0 #A82B58; }
.sf-river { position: fixed; z-index: 70; left: 0; right: 0; top: 34vh; height: 230px; pointer-events: none; animation: sf-riverIn .7s cubic-bezier(.2,.8,.2,1) both, sf-riverOut .8s 3.9s ease-in forwards; }
@keyframes sf-riverIn { from { transform: translateX(-100%); } }
@keyframes sf-riverOut { to { transform: translateY(40px); opacity: 0; } }
.sf-riverWave { position: absolute; left: 0; top: 50px; width: 200%; height: 180px; animation: sf-wave 2.2s linear infinite; }
@keyframes sf-wave { to { transform: translateX(-50%); } }
.sf-rider { position: absolute; left: 0; top: 30px; animation: sf-rideRiver 3.6s linear both; animation-delay: calc(var(--i) * .42s); }
@keyframes sf-rideRiver { from { transform: translateX(-140px); } to { transform: translateX(calc(100vw + 20px)); } }
.sf-riderPic { position: relative; display: block; width: 96px; height: 96px; border: 6px solid #fff; border-radius: 50% 50% 46% 46%; overflow: hidden; background: #FFE9EF; box-shadow: 0 10px 18px -6px rgba(74,44,30,.5);
  animation: sf-bobRide 1.1s ease-in-out infinite; animation-delay: calc(var(--i) * -.3s); }
.sf-riderPic b { display: grid; place-items: center; height: 100%; font-size: 40px; }
@keyframes sf-bobRide { 0%,100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-14px) rotate(8deg); } }
.sf-riderCoat { z-index: 2; bottom: 0; height: 48%; transform: rotate(180deg); }
.sf-finalCard { position: relative; z-index: 5; display: grid; justify-items: center; gap: 8px; width: min(370px, 94vw); box-sizing: border-box; padding: 18px 10px 14px; margin-top: 8px;
  border-radius: 32px; background: rgba(255,255,255,.9); box-shadow: 0 8px 0 #FFD1DF, 0 30px 60px -26px rgba(214,63,114,.5); animation: sf-cardIn .7s cubic-bezier(.34,1.56,.64,1) both; }
.sf-yay { margin: 0; font: 800 clamp(34px, 10vw, 44px)/1.05 var(--gummy); color: var(--pinkDeep); text-shadow: 0 4px 0 #fff, 0 7px 0 rgba(255,158,187,.7); animation: sf-yayIn 1s cubic-bezier(.34,1.56,.64,1) both; text-wrap: balance; }
@keyframes sf-yayIn { from { transform: scale(.2) rotate(-12deg); opacity: 0; } 60% { transform: scale(1.15) rotate(4deg); opacity: 1; } }
.sf-yayLine { margin: 0; max-width: 300px; font: 700 17px/1.35 var(--ui); color: var(--ink); }
.sf-yayLine b { color: var(--pinkDeep); }
.sf-finalBox { position: relative; width: min(320px, 86vw); padding: 34px 12px 14px; margin-top: 14px; border-radius: 26px; background: linear-gradient(180deg, #FF9EBB, #FF8FAB); box-shadow: 0 6px 0 #D63F72; box-sizing: border-box; }
.sf-finalBox::before, .sf-keepBox::before { content: ""; position: absolute; inset: 9px; border-radius: 19px; background: #FFF1F5; box-shadow: inset 0 4px 10px rgba(214,63,114,.18); }
.sf-finalLid { position: absolute; z-index: 2; left: 50%; top: -16px; transform: translateX(-50%); width: max-content; max-width: 90%; padding: 8px 14px; border-radius: 99px; background: #fff; box-shadow: 0 4px 0 #FFD1DF;
  font: 800 14px/1.15 var(--gummy); color: var(--pinkDeep); }
.sf-photoTruffle { width: 66%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; border: 3px solid #fff; background: #FFE9EF; box-shadow: 0 4px 6px rgba(74,44,30,.25); animation: sf-land .55s cubic-bezier(.34,1.56,.64,1) both; }
.sf-photoTruffle b { display: grid; place-items: center; height: 100%; font-size: 26px; }
.sf-gifWall { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 8px; margin-top: 6px; }
.sf-wallItem { animation: sf-stickerIn .6s cubic-bezier(.34,1.56,.64,1) both; }
.sf-wallItem:nth-child(2) { animation-delay: .12s; } .sf-wallItem:nth-child(3) { animation-delay: .24s; } .sf-wallItem:nth-child(4) { animation-delay: .36s; } .sf-wallItem:nth-child(5) { animation-delay: .48s; }

/* ── 9 · Gift shop ──────────────────────────────────────────── */
.sf-keep { position: relative; display: grid; justify-items: center; margin-top: 4px; }
.sf-keepText { position: absolute; z-index: 3; left: -22px; bottom: -46px; }
.sf-keepBox { position: relative; width: min(330px, 88vw); padding: 64px 12px 16px; border-radius: 28px; background: linear-gradient(180deg, #FF9EBB, #FF8FAB); box-shadow: 0 7px 0 #D63F72, 0 26px 40px -20px rgba(214,63,114,.6); box-sizing: border-box; margin-top: 18px; }
.sf-keepLid { position: absolute; z-index: 2; left: 50%; top: -18px; transform: translateX(-50%); display: grid; justify-items: center; gap: 2px; padding: 10px 22px; border-radius: 22px; background: #fff; box-shadow: 0 4px 0 #FFD1DF; width: max-content; max-width: 86%; }
.sf-keepLid small { font: 700 10.5px/1.1 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--deep); }
.sf-keepLid b { font: 700 34px/1 var(--script); color: var(--pinkDeep); }
.sf-keepLid em { font: 700 13px/1 var(--ui); font-style: normal; color: var(--ink); }
.sf-est { position: relative; z-index: 2; display: block; margin-top: 10px; font: 700 12px/1 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--deep); }
.sf-keepGif { position: absolute; z-index: 3; right: -20px; top: -10px; }
.sf-coupon { position: relative; display: grid; justify-items: center; gap: 4px; width: min(320px, 86vw); margin-top: 28px; padding: 16px 18px; border: 0; cursor: pointer; border-radius: 18px; background: #FFFCF7;
  box-shadow: 0 0 0 2px #EBCBAE, 0 6px 0 #F6E2CF; color: var(--ink); transform: rotate(-1.5deg);
  -webkit-mask: radial-gradient(9px at 0 50%, transparent 96%, #000) left / 51% 100% no-repeat, radial-gradient(9px at 100% 50%, transparent 96%, #000) right / 51% 100% no-repeat;
          mask: radial-gradient(9px at 0 50%, transparent 96%, #000) left / 51% 100% no-repeat, radial-gradient(9px at 100% 50%, transparent 96%, #000) right / 51% 100% no-repeat; }
.sf-couponKick { font: 800 12px/1 var(--ui); letter-spacing: .18em; color: var(--primary); }
.sf-coupon b { font: 800 19px/1.25 var(--gummy); color: var(--choc); }
.sf-coupon small { font: 600 12px/1 var(--ui); color: var(--deep); }
.sf-stamp { position: absolute; right: 10px; top: 8px; transform: rotate(-14deg); font: 800 13px/1 var(--ui); font-style: normal; color: var(--pinkDeep); border: 3px solid var(--pinkDeep); border-radius: 8px;
  padding: 5px 8px; background: rgba(255,255,255,.7); letter-spacing: .06em; animation: sf-stampIn .5s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes sf-stampIn { from { opacity: 0; transform: rotate(-14deg) scale(2.4); } }
.sf-endLine { margin: 22px 0 0; font: 700 26px/1.2 var(--script); color: var(--pinkDeep); max-width: 340px; }
.sf-actions { display: flex; flex-wrap: wrap; gap: 14px 10px; justify-content: center; margin: 20px 0 6px; }
.sf-reply { width: min(380px, 94vw); margin-top: 12px; color: var(--ink); text-align: left; }
.sf-again { margin-top: 6px; }
.sf-ps { position: relative; display: grid; justify-items: start; gap: 10px; text-align: left; width: min(330px, 88vw); padding: 26px 20px 20px; border-radius: 20px; background: #FFFCF7; box-shadow: 0 6px 0 #EBCBAE; }
.sf-ps p { margin: 0; font: 600 16px/1.5 var(--ui); color: var(--ink); white-space: pre-wrap; }
.sf-ps .sf-psCond { font: 700 22px/1.2 var(--script); color: var(--pinkDeep); }
.sf-ps .sf-sign { justify-self: end; }
.sf-psPic { justify-self: end; margin-top: -6px; }

@media (min-width: 1100px) { .sf-stage { max-width: 520px; } }
@media (min-width: 1024px) and (min-height: 820px) { .sf-gateIn { zoom: 1.15; } }
@media (min-width: 768px) { .sf-title { font-size: 38px; } }
@media (max-width: 380px) { .sf-gateKick { font-size: 11.5px; letter-spacing: .06em; } }
@media (max-height: 700px) {
  .sf-playfield { height: 300px; min-height: 0; }
  .sf-bar { width: min(250px, 70vw); }
  .sf-fountain { width: 190px; height: 225px; }
}
@media (prefers-reduced-motion: reduce) {
  .sf-root *, .sf-gate * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .15s !important; }
  .sf-floaters i, .sf-beltStripes, .sf-roller { animation: none !important; }
}
`;
