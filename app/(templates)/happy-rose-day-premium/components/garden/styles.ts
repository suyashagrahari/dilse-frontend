// "The Rose Garden" stylesheet (Strawberry Milk palette, research §C1): every class is rg-prefixed. Transform and
// opacity only for anything that loops; no blur filters; reduced motion stills the loops and keeps every beat.
//   bg #FFF5F8 → #FFE3EC · card #FFFFFF · soft #FFD1DF · primary #FF6F9C · deep #D63F72 · ink #5B2333 · pop #FFE27A
//   leaf #7BC47F · hand = Caveat (--rg-hand) · display/UI = Fredoka (--font-fredoka)

export const GARDEN_CSS = `
.rg-root, .rg-shower, .rg-lb { --rg-ink: #5B2333; --rg-soft-ink: #8A4A5C; --rg-pink: #FF6F9C; --rg-deep: #D63F72; --rg-soft: #FFD1DF; --rg-pop: #FFE27A;
  --rg-hand-f: var(--rg-hand), 'Caveat', cursive; --rg-ui: var(--font-fredoka), 'Fredoka', system-ui, sans-serif;
  font-family: var(--rg-ui); color: var(--rg-ink); }
.rg-root { position: relative; }
.rg-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  background: radial-gradient(42% 28% at 0% 6%, rgba(123,196,127,.20), transparent 70%), radial-gradient(40% 30% at 100% 30%, rgba(255,209,223,.75), transparent 70%), radial-gradient(50% 30% at 10% 100%, rgba(255,226,122,.18), transparent 70%); }
@media (min-width: 768px) { .rg-bg { z-index: -1; } }
.rg-blob { position: absolute; border-radius: 50%; background: rgba(255,209,223,.45); }
.rg-blob--a { width: 260px; height: 260px; left: -90px; top: 32%; }
.rg-blob--b { width: 200px; height: 200px; right: -70px; top: 64%; background: rgba(255,226,122,.22); }
.rg-blob--c { width: 160px; height: 160px; right: 18%; top: -60px; background: rgba(123,196,127,.14); }
.rg-sceneWrap { position: relative; z-index: 2; }

/* ── scene shell ─────────────────────────────────────────────── */
.rg-scene { position: relative; box-sizing: border-box; width: 100%; max-width: 520px; margin: 0 auto; min-height: calc(100dvh - var(--vw-dock-space, 0px));
  display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
  padding: calc(var(--vw-top-space, 0px) + 60px) 18px 26px; }
.rg-path { display: flex; gap: 6px; justify-content: center; padding: 6px 10px; border-radius: 99px; background: rgba(255,255,255,.7); box-shadow: 0 2px 0 rgba(255,209,223,.9); }
.rg-path i { width: 8px; height: 8px; border-radius: 99px; background: var(--rg-soft); transition: width .35s cubic-bezier(.34,1.56,.64,1), background .3s; }
.rg-path i.is-done { background: var(--rg-pink); }
.rg-path i.is-now { width: 24px; background: var(--rg-deep); }
.rg-head { display: grid; gap: 6px; justify-items: center; max-width: 360px; }
.rg-kicker { margin: 0; display: inline-flex; align-items: center; gap: 6px; font: 600 12px/1.2 var(--rg-ui); letter-spacing: .2em; text-transform: uppercase; color: var(--rg-deep); }
.rg-title { margin: 0; font: 700 clamp(24px, 6.6vw, 30px)/1.12 var(--rg-ui); color: var(--rg-ink); text-wrap: balance; }
.rg-title em { font: 700 1.3em/1 var(--rg-hand-f); color: var(--rg-pink); font-style: normal; }
.rg-sub { margin: 0; font: 500 15px/1.4 var(--rg-ui); color: var(--rg-soft-ink); min-height: 1.4em; }
.rg-foot { display: flex; justify-content: center; gap: 10px; padding-top: 4px; margin-top: auto; }
.rg-foot--stack { flex-direction: column; align-items: center; margin-top: 4px; }

/* ── puffy buttons (C3) ──────────────────────────────────────── */
.rg-btn { -webkit-appearance: none; appearance: none; border: 0; cursor: pointer; min-height: 52px; padding: 14px 26px; border-radius: 999px;
  font: 700 17px/1 var(--rg-ui); letter-spacing: .01em; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s, opacity .2s; -webkit-tap-highlight-color: transparent; }
.rg-btn--primary { color: #fff; background: linear-gradient(180deg, #FF8FB5 0%, #FF6F9C 100%); box-shadow: 0 5px 0 #D63F72, 0 12px 26px rgba(214,63,114,.28); text-shadow: 0 1px 0 rgba(214,63,114,.35); }
.rg-btn--ghost { color: var(--rg-deep); background: #fff; box-shadow: 0 4px 0 var(--rg-soft), 0 10px 20px rgba(214,63,114,.12); border: 2px solid var(--rg-soft); padding: 12px 22px; font-size: 16px; }
.rg-btn--soft { color: var(--rg-deep); background: var(--rg-soft); box-shadow: 0 4px 0 #FFB3CC; }
.rg-btn:active:not(:disabled) { transform: translateY(3px) scale(.97); box-shadow: 0 2px 0 #D63F72, 0 6px 14px rgba(214,63,114,.2); }
.rg-btn--ghost:active:not(:disabled) { box-shadow: 0 1px 0 var(--rg-soft); }
.rg-btn:disabled { opacity: .45; cursor: default; }
.rg-btn:focus-visible, .rg-chip:focus-visible, .rg-tail:focus-visible, .rg-bqFlower:focus-visible, .rg-seal:focus-visible, .rg-singerBtn:focus-visible { outline: 3px solid var(--rg-deep); outline-offset: 3px; }
.rg-petal:focus-visible { outline: none; }
.rg-petal:focus-visible path:first-child { stroke: var(--rg-deep); stroke-width: 5; }
.rg-heartbeat { animation: rg-heartbeat 2.4s ease-in-out infinite; }
@keyframes rg-heartbeat { 0%, 50%, 100% { transform: scale(1); } 10% { transform: scale(1.08); } 20% { transform: scale(1); } 30% { transform: scale(1.05); } }

/* ── stickers (C3 die-cut) ───────────────────────────────────── */
.rg-sticker { display: inline-grid; place-items: center; position: relative; flex: none; transform: rotate(var(--tilt, 0deg));
  filter: drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 5px 8px rgba(214,63,114,.22)); pointer-events: none; }
.rg-sticker img { width: 100%; height: 100%; object-fit: contain; display: block; }
.rg-pop { animation: rg-pop .55s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes rg-pop { 0% { opacity: 0; transform: scale(.4) rotate(-12deg); } 100% { opacity: 1; transform: scale(1) rotate(var(--tilt, 0deg)); } }
.rg-float { animation: rg-float 3.6s ease-in-out infinite; }
@keyframes rg-float { 0%, 100% { transform: translateY(0) rotate(var(--tilt, 0deg)); } 50% { transform: translateY(-6px) rotate(calc(var(--tilt, 0deg) + 3deg)); } }
.rg-washi { position: absolute; display: block; width: 74px; height: 22px; background: var(--washi); opacity: .9;
  -webkit-mask: linear-gradient(90deg, transparent 0 3px, #000 3px calc(100% - 3px), transparent calc(100% - 3px)); mask: linear-gradient(90deg, transparent 0 3px, #000 3px calc(100% - 3px), transparent calc(100% - 3px));
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.35) 0 6px, transparent 6px 12px); background-color: var(--washi); }

/* ── gate: the seed packet ───────────────────────────────────── */
.rg-gate .pm-gateKick { color: var(--rg-deep); opacity: 1; letter-spacing: .22em; }
.rg-gate .pm-gateName, .rg-gate .pm-gateName * { background: none !important; -webkit-text-fill-color: currentColor !important; color: var(--rg-deep) !important;
  font-family: var(--rg-hand-f) !important; font-weight: 700 !important; font-style: normal !important; text-shadow: 0 3px 0 rgba(255,209,223,.9); }
.rg-gate .pm-gateName { font-size: clamp(54px, 15vw, 84px) !important; line-height: .95 !important; margin: 0; }
.rg-gateSub { font: 500 14px/1.3 var(--rg-ui); color: var(--rg-soft-ink); }
.rg-gate .pm-gateArt { width: min(250px, 62vw); max-height: 40vh; aspect-ratio: 220 / 290; animation: rg-packFloat 3.8s ease-in-out infinite; }
@keyframes rg-packFloat { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
.rg-gate .pm-gateCta { background: linear-gradient(180deg, #FF8FB5 0%, #FF6F9C 100%) !important; color: #fff !important; border: 0 !important; border-radius: 999px !important;
  box-shadow: 0 5px 0 #D63F72, 0 12px 26px rgba(214,63,114,.3) !important; font: 700 18px/1 var(--rg-ui) !important; min-height: 56px; }
.rg-gate .pm-gateCta small { color: rgba(255,255,255,.85); }
.rg-gate .pm-quiet { color: var(--rg-soft-ink) !important; }
.rg-gate .pm-seal { color: var(--rg-soft-ink); }
.rg-gate .pm-sealWax { background: radial-gradient(circle at 35% 30%, #FF8FB5, #D63F72) !important; color: #fff !important; }
.rg-gate .pm-bar { background: #FFD1DF !important; }
.rg-packet { position: relative; display: block; width: 100%; height: 100%; }
.rg-packet > svg { position: relative; z-index: 1; }
.rg-packetPeek { position: absolute; z-index: 0; right: -30%; top: 12%; animation: rg-peek 4.2s ease-in-out infinite; }
@keyframes rg-peek { 0%, 100% { transform: translateX(-6px); } 50% { transform: translateX(6px) rotate(4deg); } }
.rg-packTop, .rg-packTear { transform-box: fill-box; transform-origin: 0% 100%; transition: transform .7s cubic-bezier(.22,1,.36,1), opacity .6s; }
.rg-gate.is-opening .rg-packTop { transform: translate(40px, -70px) rotate(24deg); opacity: 0; }
.rg-gate.is-opening .rg-packTear { opacity: 0; }

/* ── 1 · water ───────────────────────────────────────────────── */
.rg-waterStage { position: relative; width: min(360px, 100%); height: clamp(330px, 48vh, 420px); flex: none; }
.rg-pot { position: absolute; left: 50%; bottom: 0; height: 100%; aspect-ratio: 240 / 360; max-width: 100%; transform: translateX(-50%); }
.rg-seed { position: absolute; left: 50%; top: 78%; width: 12px; height: 16px; margin-left: -6px; border-radius: 50%; background: #8A5A3A; box-shadow: inset -2px -2px 0 rgba(0,0,0,.2);
  animation: rg-seed 1s cubic-bezier(.55,0,1,.45) .25s both; z-index: 2; }
@keyframes rg-seed { 0% { transform: translateY(-260px) rotate(0); opacity: 1; } 80% { transform: translateY(0) rotate(200deg); opacity: 1; } 100% { transform: translateY(4px) scale(.6); opacity: 0; } }
.rg-stageLabel { position: absolute; left: 50%; top: 6%; transform: translateX(-50%); white-space: nowrap; display: inline-flex; gap: 4px; align-items: center;
  padding: 6px 14px; border-radius: 99px; background: #fff; color: var(--rg-deep); font: 700 24px/1 var(--rg-hand-f); box-shadow: 0 4px 0 var(--rg-soft); animation: rg-label .5s cubic-bezier(.34,1.56,.64,1) both; z-index: 6; }
@keyframes rg-label { from { opacity: 0; transform: translateX(-50%) scale(.5) translateY(10px); } to { opacity: 1; transform: translateX(-50%) scale(1); } }
.rg-drop { position: absolute; width: 7px; height: 10px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: #8ED1FC; box-shadow: inset -1px -2px 0 rgba(60,140,200,.35);
  pointer-events: none; z-index: 4; animation: rg-drop .7s cubic-bezier(.55,0,1,.45) forwards; }
@keyframes rg-drop { from { transform: translateY(0); opacity: 1; } 85% { opacity: 1; } to { transform: translateY(var(--fall)) scale(.7); opacity: 0; } }
.rg-can { position: absolute; left: 0; top: 0; width: 112px; z-index: 5; cursor: grab; touch-action: none; transition: transform .5s cubic-bezier(.34,1.56,.64,1); }
.rg-can.is-dragging { transition: none; cursor: grabbing; }
.rg-canTilt { display: block; transform-origin: 40% 50%; transition: transform .35s cubic-bezier(.34,1.56,.64,1); filter: drop-shadow(0 6px 8px rgba(214,63,114,.2)); }
.rg-can.is-pouring .rg-canTilt { transform: rotate(-34deg); }
.rg-can:not(.is-dragging):not(.is-pouring):not(.is-done) .rg-canTilt { animation: rg-wiggle 2.6s ease-in-out 2s infinite; }
@keyframes rg-wiggle { 0%, 70%, 100% { transform: rotate(0); } 76% { transform: rotate(-8deg); } 82% { transform: rotate(7deg); } 88% { transform: rotate(-4deg); } 94% { transform: rotate(3deg); } }
.rg-dragHint { position: absolute; left: 50%; top: 100%; transform: translateX(-50%); white-space: nowrap; font: 700 20px/1 var(--rg-hand-f); color: var(--rg-deep); animation: rg-bob 1.4s ease-in-out infinite; }
@keyframes rg-bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 -5px; } }
.rg-reactor { position: absolute; z-index: 3; }
.rg-reactor--water { left: -4px; bottom: 4%; }
.rg-meter { position: absolute; right: 2px; bottom: 6%; display: grid; gap: 6px; z-index: 3; }
.rg-meter i { width: 18px; height: 24px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: #fff; border: 2px solid #BFE3F7; transition: background .3s; }
.rg-meter i.is-full { background: #8ED1FC; border-color: #fff; animation: rg-pop .45s cubic-bezier(.34,1.56,.64,1); }

/* ── 2 · colour ──────────────────────────────────────────────── */
.rg-colourStage { position: relative; width: min(360px, 100%); display: grid; justify-items: center; }
.rg-colourRose { position: relative; height: clamp(240px, 35vh, 310px); aspect-ratio: 240 / 360; }
.rg-colourPeek { position: absolute; right: -86px; top: 34%; }
.rg-jelly { animation: rg-jelly .55s ease-out; transform-origin: 50% 85%; }
@keyframes rg-jelly { 0% { transform: scale(1, 1); } 25% { transform: scale(1.12, .9); } 50% { transform: scale(.94, 1.08); } 75% { transform: scale(1.03, .98); } 100% { transform: scale(1, 1); } }
.rg-sticky { position: relative; margin-top: -8px; max-width: 290px; padding: 16px 18px 14px; background: #FFF3B0; color: var(--rg-ink); transform: rotate(-2.5deg);
  box-shadow: 0 10px 20px rgba(214,63,114,.14), inset 0 -8px 12px rgba(255,200,80,.18); border-radius: 4px 4px 18px 4px; animation: rg-sticky .45s cubic-bezier(.34,1.56,.64,1) both; z-index: 2; }
.rg-sticky p { margin: 0; font: 600 24px/1.08 var(--rg-hand-f); }
.rg-stickyTag { position: absolute; top: -12px; left: 50%; transform: translateX(-50%) rotate(2deg); white-space: nowrap; padding: 4px 10px; border-radius: 99px; background: var(--rg-pink); color: #fff; font: 600 12px/1.2 var(--rg-ui); }
@keyframes rg-sticky { from { opacity: 0; transform: rotate(-12deg) scale(.7); } to { opacity: 1; transform: rotate(-2.5deg) scale(1); } }
.rg-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; opacity: .3; transition: opacity .4s; max-width: 340px; }
.rg-chips.is-on { opacity: 1; }
.rg-chip { position: relative; width: 46px; height: 46px; border-radius: 50%; border: 4px solid #fff; padding: 0; cursor: pointer; background: var(--sw);
  box-shadow: 0 4px 0 rgba(214,63,114,.22), 0 8px 14px rgba(214,63,114,.14); transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .2s; }
.rg-chip i { position: absolute; inset: 7px 14px auto auto; width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.6); }
.rg-chip.is-on { transform: scale(1.16) translateY(-3px); box-shadow: 0 0 0 3px var(--rg-pink), 0 8px 16px rgba(214,63,114,.28); }
.rg-chip b { position: absolute; top: -9px; right: -9px; font-size: 15px; line-height: 1; }

/* ── 3 · pluck ───────────────────────────────────────────────── */
.rg-pluckStage { position: relative; width: min(360px, 100%); display: grid; justify-items: center; }
.rg-flower { width: min(290px, 76vw); aspect-ratio: 1; touch-action: manipulation; }
.rg-flower.is-done { animation: rg-jelly .7s ease-out; }
.rg-flowerHeart { transition: scale .6s cubic-bezier(.34,1.56,.64,1); }
.rg-flower.is-done .rg-flowerHeart { scale: 2.3; }
.rg-petal { outline: none; cursor: pointer; transform-box: fill-box; transform-origin: 50% 100%; transition: transform .2s; -webkit-tap-highlight-color: transparent; }
@media (hover: hover) { .rg-petal:hover { transform: translateY(-4px); } }
.rg-petal.is-gone { pointer-events: none; animation: rg-fly .75s cubic-bezier(.22,1,.36,1) forwards; }
@keyframes rg-fly { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translateY(-150px) rotate(calc(var(--dir) * 70deg)) scale(.5); opacity: 0; } }
.rg-flowerHeart { transform-box: fill-box; transform-origin: center; animation: rg-heartbeat 2.4s ease-in-out infinite; }
.rg-reactor--pluck { right: -2px; top: -6px; }
.rg-nervous { animation: rg-nerv .5s ease-in-out infinite; }
@keyframes rg-nerv { 0%, 100% { transform: rotate(calc(var(--nerv, 0) * -7deg)) translateX(calc(var(--nerv, 0) * -2px)); } 50% { transform: rotate(calc(var(--nerv, 0) * 7deg)) translateX(calc(var(--nerv, 0) * 2px)); } }
.rg-pluckWord { display: grid; gap: 4px; justify-items: center; min-height: 78px; }
.rg-pluckWord strong { font: 700 40px/1 var(--rg-hand-f); color: var(--rg-deep); }
.rg-pluckWord span { font: 500 14px/1.4 var(--rg-ui); color: var(--rg-soft-ink); max-width: 300px; }
.rg-word { animation: rg-pop .4s cubic-bezier(.34,1.56,.64,1) both; }
.rg-lovesMe { font: 700 42px/1 var(--rg-ui) !important; letter-spacing: .02em; color: var(--rg-deep); text-shadow: 0 4px 0 var(--rg-soft); animation: rg-pop .6s cubic-bezier(.34,1.56,.64,1) both; }

/* ── 4 · note at the door ────────────────────────────────────── */
.rg-door { position: relative; width: min(360px, 100%); height: 380px; flex: none; }
.rg-mat { position: absolute; left: 50%; bottom: 8px; width: 300px; height: 124px; transform: translateX(-50%) rotate(-2deg); border-radius: 26px; background: #F6C7A6;
  box-shadow: inset 0 0 0 7px #F6C7A6, inset 0 0 0 9px rgba(255,255,255,.7), 0 10px 20px rgba(150,80,50,.16);
  background-image: repeating-linear-gradient(90deg, rgba(160,90,50,.08) 0 3px, transparent 3px 8px); display: flex; align-items: flex-end; justify-content: center; padding-bottom: 12px; box-sizing: border-box; }
.rg-mat span { font: 700 26px/1 var(--rg-hand-f); color: #A45E3A; }
.rg-doorRose { position: absolute; left: 50%; bottom: 44px; width: 300px; height: 140px; transform: translateX(-50%); overflow: visible; }
.rg-tag { position: absolute; left: 50%; top: 18px; transform: translateX(-50%); display: grid; justify-items: center; z-index: 3; }
.rg-tagCard { display: grid; justify-items: center; gap: 0; padding: 18px 26px 16px; min-width: 150px; background: #fff; border: 3px solid var(--rg-soft); border-radius: 18px 18px 22px 22px;
  box-shadow: 0 10px 22px rgba(214,63,114,.18); transform: rotate(-4deg); transition: transform .5s cubic-bezier(.34,1.56,.64,1); position: relative; }
.rg-tagCard::before { content: ""; position: absolute; top: 7px; left: 50%; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: var(--rg-soft); }
.rg-tagCard b { font: 600 12px/1.4 var(--rg-ui); letter-spacing: .2em; text-transform: uppercase; color: var(--rg-deep); margin-top: 4px; }
.rg-tagCard span { font: 700 38px/1 var(--rg-hand-f); color: var(--rg-ink); }
.rg-bowKnot { width: 64px; height: 30px; margin-top: -6px; position: relative; transform: scale(calc(1 - var(--pull) * .4)); opacity: calc(1 - var(--pull) * .7); transition: transform .2s; }
.rg-bowKnot::before, .rg-bowKnot::after { content: ""; position: absolute; top: 2px; width: 30px; height: 24px; border-radius: 50% 50% 50% 50%; background: var(--rg-pink); border: 3px solid #fff; box-sizing: border-box; }
.rg-bowKnot::before { left: 0; transform: rotate(-18deg); } .rg-bowKnot::after { right: 0; transform: rotate(18deg); }
.rg-tail { -webkit-appearance: none; appearance: none; border: 0; background: transparent; padding: 0 22px; margin-top: -6px; cursor: grab; touch-action: none; position: relative;
  transform: translateY(calc(var(--pull) * 110px)); transition: transform .3s cubic-bezier(.34,1.56,.64,1); }
.rg-tail i { display: block; width: 16px; height: 118px; background: linear-gradient(90deg, #FF6F9C, #FF8FB5 50%, #FF6F9C); border-left: 2px solid #fff; border-right: 2px solid #fff;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%); }
.rg-tailHint { position: absolute; left: calc(100% - 8px); top: 40%; white-space: nowrap; font: 700 22px/1 var(--rg-hand-f); color: var(--rg-deep); animation: rg-bob 1.3s ease-in-out infinite; }
.rg-doorPeek { position: absolute; right: -4px; top: 30px; }
.rg-letterWrap { position: relative; width: min(380px, 100%); }
.rg-letterPeek { position: absolute; left: -16px; bottom: -34px; z-index: 3; }
.rg-letter { position: relative; text-align: left; padding: 22px 20px 20px; border-radius: 20px; background-color: #FFFDF8; color: var(--rg-ink);
  background-image: repeating-linear-gradient(180deg, transparent 0 29px, rgba(255,143,181,.28) 29px 30px); background-position: 0 18px;
  box-shadow: 0 14px 30px rgba(214,63,114,.16), 0 0 0 3px #FFE3EC; animation: rg-unfold .6s cubic-bezier(.22,1,.36,1) both; transform-origin: 50% 0; }
@keyframes rg-unfold { from { opacity: 0; transform: scaleY(.3) translateY(-30px); } to { opacity: 1; transform: none; } }
.rg-letterPhoto { float: right; width: 104px; margin: -34px -24px 8px 12px; padding: 6px 6px 18px; background: #fff; transform: rotate(5deg); box-shadow: 0 8px 16px rgba(91,35,51,.18); position: relative; }
.rg-letterPhotoIn { display: block; aspect-ratio: 4 / 5; overflow: hidden; }
.rg-letterTape { top: -10px; left: 50%; margin-left: -37px; transform: rotate(-6deg); }
.rg-letterText { font: 400 16.5px/30px var(--rg-ui); }
.rg-letterEnd { clear: both; opacity: 0; transform: translateY(8px); transition: opacity .6s, transform .6s; }
.rg-letterEnd.is-on { opacity: 1; transform: none; }
.rg-shayari { margin: 14px 0 0; white-space: pre-line; font: 600 22px/1.15 var(--rg-hand-f); color: var(--rg-deep); text-align: center; }
.rg-signoff { margin: 12px 0 0; font: 700 30px/1 var(--rg-hand-f); color: var(--rg-deep); text-align: right; }

/* ── 5 · voice ───────────────────────────────────────────────── */
.rg-voiceStage { position: relative; width: min(360px, 100%); display: grid; justify-items: center; gap: 10px; }
.rg-singerBtn { -webkit-appearance: none; appearance: none; border: 0; background: transparent; padding: 0; cursor: pointer; position: relative; }
.rg-singer { animation: rg-sway 3.4s ease-in-out infinite; transform-origin: 50% 100%; }
@keyframes rg-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.rg-singMouth { transform-box: fill-box; transform-origin: center; transform: scaleY(.45); }
.rg-singer.is-singing .rg-singMouth { animation: rg-sing .32s ease-in-out infinite alternate; }
@keyframes rg-sing { from { transform: scaleY(.3); } to { transform: scaleY(1.15); } }
.rg-notes { position: absolute; left: 50%; top: 4%; width: 0; height: 0; }
.rg-notes i { position: absolute; font: 700 24px/1 var(--rg-ui); color: var(--rg-pink); font-style: normal; animation: rg-note 1.8s ease-out infinite; opacity: 0; }
.rg-notes i:nth-child(2) { animation-delay: .6s; left: 30px; color: var(--rg-deep); } .rg-notes i:nth-child(3) { animation-delay: 1.2s; left: -36px; }
@keyframes rg-note { 0% { transform: translate(0, 10px) scale(.6); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(18px, -70px) scale(1.1) rotate(16deg); opacity: 0; } }
.rg-voicePeek { position: absolute; right: -4px; top: 6px; }
.rg-bubble { position: relative; max-width: 300px; padding: 14px 18px; border-radius: 24px; background: #fff; color: var(--rg-ink); font: 600 25px/1.1 var(--rg-hand-f);
  box-shadow: 0 8px 18px rgba(214,63,114,.14), 0 0 0 3px #FFE3EC; animation: rg-pop .5s cubic-bezier(.34,1.56,.64,1) .3s both; }
.rg-bubble::before { content: ""; position: absolute; top: -12px; left: 50%; margin-left: -10px; border: 10px solid transparent; border-bottom-color: #fff; border-top: 0; }
.rg-voiceCard { width: min(360px, 100%); box-sizing: border-box; padding: 16px; border-radius: 24px; background: #fff; box-shadow: 0 10px 24px rgba(214,63,114,.14), 0 0 0 3px #FFE3EC; display: grid; gap: 8px; }
.rg-voiceLabel { font: 700 24px/1 var(--rg-hand-f); color: var(--rg-deep); }
.rg-voiceCap { margin: 0; font: 500 15px/1.4 var(--rg-ui); color: var(--rg-soft-ink); }

/* ── 6 · bouquet ─────────────────────────────────────────────── */
.rg-bqStage { position: relative; width: min(380px, 100%); flex: none; }
.rg-cone { position: absolute; top: 150px; width: 184px; height: 176px; z-index: 12; pointer-events: none; }
.rg-bow { transform-box: fill-box; transform-origin: 50% 20%; transform: scale(0); transition: transform .6s cubic-bezier(.34,1.56,.64,1); }
.rg-bow.is-tied { transform: scale(1); }
.rg-coneTag { position: absolute; right: -36px; bottom: 34px; padding: 6px 12px; background: #FFFDF8; border: 2px solid #E8D3B5; border-radius: 8px 14px 14px 8px; transform: rotate(10deg);
  font: 700 20px/1 var(--rg-hand-f); color: var(--rg-ink); box-shadow: 0 4px 8px rgba(150,100,60,.15); }
.rg-coneTape { top: -12px; left: 8px; width: 40px; height: 16px; transform: rotate(-12deg); }
.rg-bqPeek { position: absolute; left: -6px; top: 168px; z-index: 13; }
.rg-bqFlower { -webkit-appearance: none; appearance: none; border: 0; background: transparent; padding: 0; position: absolute; width: 78px; height: 78px; cursor: grab; touch-action: none;
  transition: left .5s cubic-bezier(.34,1.56,.64,1), top .5s cubic-bezier(.34,1.56,.64,1), transform .25s; filter: drop-shadow(0 6px 8px rgba(214,63,114,.2)); }
.rg-bqFlower.is-drag { transition: none; cursor: grabbing; }
.rg-bqFlower.is-placed { cursor: default; animation: rg-land .5s cubic-bezier(.34,1.56,.64,1); }
.rg-bqFlower.is-placed.is-tied { cursor: pointer; }
.rg-bqFlower.is-placed.is-tied:not(.is-seen) .rg-pflower { animation: rg-heartbeat 2.4s ease-in-out infinite; }
.rg-bqFlower.is-seen .rg-pflower::after { content: "💗"; position: absolute; right: -2px; top: -4px; font-size: 16px; }
@keyframes rg-land { 0% { transform: scale(1.25); } 60% { transform: scale(.92); } 100% { transform: scale(1); } }
.rg-pflower { position: relative; display: block; }
.rg-pflowerPhoto { position: absolute; inset: 21%; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 3px #fff; }
.rg-bqCount { position: absolute; left: 0; right: 0; margin: 0; font: 600 13px/1 var(--rg-ui); color: var(--rg-soft-ink); }
.rg-lb { position: fixed; inset: 0; z-index: 500; display: grid; place-items: center; align-content: center; gap: 16px; padding: 24px 16px; box-sizing: border-box;
  background: rgba(255,236,243,.9); animation: rg-fade .25s ease both; font-family: var(--font-fredoka), 'Fredoka', system-ui, sans-serif; }
@keyframes rg-fade { from { opacity: 0; } to { opacity: 1; } }
.rg-lbCard { position: relative; margin: 0; width: min(320px, 84vw); padding: 12px 12px 18px; background: #fff; border-radius: 6px; transform: rotate(-2deg);
  box-shadow: 0 20px 40px rgba(214,63,114,.24); animation: rg-pop .45s cubic-bezier(.34,1.56,.64,1) both; --tilt: -2deg; }
.rg-lbTape { top: -11px; left: 50%; margin-left: -37px; transform: rotate(4deg); --washi: rgba(255,143,181,.65); }
.rg-lbPhoto { display: block; aspect-ratio: 4 / 5; overflow: hidden; border-radius: 2px; }
.rg-lbCard figcaption { display: grid; gap: 4px; padding-top: 10px; text-align: center; }
.rg-lbCard figcaption b { font: 700 28px/1 var(--rg-hand), 'Caveat', cursive; color: #D63F72; }
.rg-lbCard figcaption span { font: 500 15px/1.4 var(--font-fredoka), 'Fredoka', sans-serif; color: #5B2333; }
.rg-lbNav { display: flex; gap: 10px; align-items: center; }
.rg-lbNav button { min-width: 48px; min-height: 48px; border-radius: 999px; border: 2px solid #FFD1DF; background: #fff; color: #D63F72; font: 700 22px/1 var(--font-fredoka), 'Fredoka', sans-serif; cursor: pointer; box-shadow: 0 4px 0 #FFD1DF; }
.rg-lbNav .rg-lbClose { font-size: 15px; padding: 0 18px; }

/* ── 7 · question + the rose shower ──────────────────────────── */
.rg-askStage { position: relative; width: min(340px, 100%); height: clamp(220px, 32vh, 290px); flex: none; }
.rg-askRose { position: absolute; left: 50%; bottom: 0; height: 100%; aspect-ratio: 240 / 360; transform: translateX(-50%); transition: transform .6s cubic-bezier(.34,1.56,.64,1); }
.rg-askRose.is-yes { transform: translateX(-50%) scale(1.12); }
.rg-reactor--ask { left: -2px; bottom: 8px; }
.rg-yesno { width: min(360px, 100%); }
.rg-shower { position: fixed; inset: 0; z-index: 300; overflow-x: hidden; overflow-y: auto; background: radial-gradient(60% 50% at 50% 50%, rgba(255,255,255,.97), rgba(255,236,243,.96) 70%, rgba(255,222,234,.96));
  animation: rg-fade .5s ease both; font-family: var(--font-fredoka), 'Fredoka', system-ui, sans-serif; color: #5B2333; }
.rg-showerRoses { position: fixed; inset: 0; pointer-events: none; z-index: 1; }
.rg-showerRose { position: absolute; width: calc(84px * var(--s)); height: calc(92px * var(--s)); margin: calc(-46px * var(--s)) 0 0 calc(-42px * var(--s)); transform: scale(0) rotate(var(--r)); opacity: 0; }
.rg-shower.is-bloom .rg-showerRose { animation: rg-bloom .9s cubic-bezier(.34,1.56,.64,1) forwards; }
@keyframes rg-bloom { 0% { transform: scale(0) rotate(calc(var(--r) - 90deg)); opacity: 0; } 100% { transform: scale(1) rotate(var(--r)); opacity: 1; } }
.rg-showerMid { position: relative; z-index: 3; min-height: 100%; box-sizing: border-box; display: grid; justify-items: center; align-content: center; gap: 6px; padding: 70px 16px 40px; }
.rg-showerBouquet { position: relative; width: 240px; height: 300px; transform: translateY(80vh); }
.rg-shower.is-bloom .rg-showerBouquet { animation: rg-rise 1.6s cubic-bezier(.22,1,.36,1) .25s forwards; }
@keyframes rg-rise { from { transform: translateY(80vh) scale(.8); } to { transform: translateY(0) scale(1); } }
.rg-showerFlowers { position: absolute; inset: 0; }
.rg-showerFlower { position: absolute; width: 74px; height: 74px; z-index: 1; filter: drop-shadow(0 6px 10px rgba(214,63,114,.22)); }
.rg-showerCone { position: absolute; left: 50%; top: 132px; width: 186px; height: 172px; transform: translateX(-50%); z-index: 2; }
.rg-showerSay { display: grid; justify-items: center; gap: 2px; opacity: 0; padding: 8px 18px 12px; border-radius: 28px; background: radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,255,255,.75) 70%, rgba(255,255,255,0)); }
.rg-shower.is-bloom .rg-showerSay { animation: rg-pop .7s cubic-bezier(.34,1.56,.64,1) 1.5s both; }
.rg-showerLine { margin: 0; max-width: 340px; font: 700 clamp(34px, 9.5vw, 46px)/1 var(--rg-hand), 'Caveat', cursive; color: #D63F72; text-shadow: 0 3px 0 #fff; text-wrap: balance; }
.rg-showerNames { margin: 4px 0 0; font: 600 15px/1 var(--font-fredoka), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8A4A5C; }
.rg-showerNames span { color: #FF6F9C; }
.rg-showerCta { opacity: 0; transform: translateY(10px); transition: opacity .5s, transform .5s; padding-top: 10px; }
.rg-showerCta.is-on { opacity: 1; transform: none; }

/* ── 8 · diary + ending ──────────────────────────────────────── */
.rg-diary { position: relative; width: min(340px, 100%); box-sizing: border-box; padding: 26px 18px 22px; border-radius: 22px; background-color: #FFFDF8;
  background-image: radial-gradient(rgba(255,143,181,.35) 1.2px, transparent 1.4px); background-size: 18px 18px; transform: rotate(-1deg);
  box-shadow: 0 16px 36px rgba(214,63,114,.18), 0 0 0 3px #FFE3EC; display: grid; justify-items: center; gap: 4px; }
.rg-diaryTape { top: -10px; } .rg-diaryTape--l { left: 16px; transform: rotate(-8deg); } .rg-diaryTape--r { right: 16px; transform: rotate(7deg); }
.rg-diaryRose { width: 130px; height: 214px; display: block; opacity: .95; }
.rg-diaryPhotos { display: flex; justify-content: center; margin-top: -54px; }
.rg-diaryPol { margin: 0 -6px; width: 92px; padding: 6px 6px 18px; background: #fff; transform: rotate(var(--rot)); box-shadow: 0 8px 14px rgba(91,35,51,.16); }
.rg-diaryPol span { display: block; aspect-ratio: 1; overflow: hidden; }
.rg-diaryEnd { margin: 12px 0 0; font: 700 32px/1.02 var(--rg-hand-f); color: var(--rg-ink); text-wrap: balance; }
.rg-diaryNames { margin: 2px 0 0; font: 700 28px/1 var(--rg-hand-f); color: var(--rg-deep); }
.rg-diaryNames span { color: var(--rg-pink); }
.rg-diarySince { margin: 0; font: 500 13px/1.3 var(--rg-ui); color: var(--rg-soft-ink); }
.rg-diaryPeek { position: absolute; right: -22px; bottom: -26px; }
.rg-endMore { display: flex; flex-direction: column; align-items: center; gap: 22px; width: min(400px, 100%); padding: 14px 0 20px; }
.rg-ps { position: relative; width: 100%; box-sizing: border-box; padding: 46px 18px 18px; margin-top: 30px; border-radius: 22px; background: #fff; box-shadow: 0 10px 24px rgba(214,63,114,.12), 0 0 0 3px #FFE3EC; display: grid; gap: 8px; justify-items: center; }
.rg-seal { position: absolute; top: -34px; left: 50%; width: 72px; height: 72px; margin-left: -36px; border: 0; padding: 0; background: transparent; cursor: pointer; }
.rg-sealL, .rg-sealR { position: absolute; top: 0; width: 50%; height: 100%; overflow: hidden; transition: transform .6s cubic-bezier(.22,1,.36,1), opacity .6s; }
.rg-sealL { left: 0; } .rg-sealR { right: 0; }
.rg-sealL::before, .rg-sealR::before { content: ""; position: absolute; top: 0; width: 72px; height: 72px; border-radius: 46% 54% 50% 50%;
  background: radial-gradient(circle at 35% 30%, #FFA3C2, #FF6F9C 45%, #D63F72); box-shadow: inset 0 -4px 0 rgba(150,20,60,.25); }
.rg-sealL::before { left: 0; } .rg-sealR::before { right: 0; }
.rg-seal b { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font: 700 17px/1 var(--rg-ui); letter-spacing: .04em; transition: opacity .3s; }
.rg-ps:not(.is-open) .rg-seal { animation: rg-heartbeat 2.4s ease-in-out infinite; }
.rg-ps.is-open .rg-sealL { transform: translate(-16px, 6px) rotate(-24deg); opacity: .0; }
.rg-ps.is-open .rg-sealR { transform: translate(16px, 6px) rotate(24deg); opacity: .0; }
.rg-ps.is-open .rg-seal b { opacity: 0; }
.rg-psFirst { margin: 0; font: 700 24px/1.08 var(--rg-hand-f); color: var(--rg-deep); }
.rg-psRest { margin: 0; white-space: pre-line; font: 400 15.5px/1.5 var(--rg-ui); color: var(--rg-ink); animation: rg-pop .5s ease both; }
.rg-psHint { font: 500 12px/1 var(--rg-ui); color: var(--rg-soft-ink); }
.rg-replyPacket { position: relative; width: 100%; box-sizing: border-box; padding: 26px 12px 12px; border-radius: 24px; border: 4px solid #fff;
  background: repeating-linear-gradient(135deg, #FFD9E6 0 14px, #FFC9DB 14px 28px); box-shadow: 0 12px 26px rgba(214,63,114,.18); }
.rg-replyPacket::before { content: ""; position: absolute; left: 10px; right: 10px; top: 8px; border-top: 2.5px dashed rgba(255,255,255,.9); }
.rg-replyPeek { position: absolute; right: -12px; top: -54px; }
.rg-reply.pm-reply, .rg-replyPacket .pm-reply { width: 100%; background: #fff !important; border-radius: 18px; box-shadow: none; color: var(--rg-ink); }
.rg-replyPacket .pm-replyH { font: 700 28px/1 var(--rg-hand-f) !important; color: var(--rg-deep); }
.rg-replyPacket .pm-replyIn { font: 500 15px/1.4 var(--rg-ui); border: 2px solid var(--rg-soft); background: #FFF8FA; color: var(--rg-ink); }
.rg-replyPacket .pm-replyBtn { box-shadow: 0 4px 0 #D63F72; font-family: var(--rg-ui); }
.rg-endKit { width: 100%; }
.rg-credit { margin: 0; font: 500 12px/1 var(--rg-ui); color: var(--rg-soft-ink); opacity: .8; }

/* ── desktop: the stage column grows a little ────────────────── */
@media (min-width: 768px) {
  .rg-scene { padding-top: calc(var(--vw-top-space, 0px) + 72px); gap: 14px; }
  .rg-title { font-size: 32px; }
  .rg-waterStage { height: clamp(360px, 50vh, 460px); }
  .rg-colourRose { height: clamp(260px, 36vh, 340px); }
  .rg-flower { width: min(320px, 76vw); }
}
@media (max-height: 700px) {
  .rg-scene { gap: 8px; padding-top: calc(var(--vw-top-space, 0px) + 54px); }
  .rg-waterStage { height: 300px; }
  .rg-colourRose { height: 230px; }
}

@media (prefers-reduced-motion: reduce) {
  .rg-heartbeat, .rg-flowerHeart, .rg-nervous, .rg-singer, .rg-notes i, .rg-packetPeek, .rg-gate .pm-gateArt, .rg-dragHint, .rg-tailHint,
  .rg-can .rg-canTilt, .rg-ps .rg-seal, .rg-bqFlower .rg-pflower { animation: none !important; }
  .rg-showerRose { transform: scale(1) rotate(var(--r)); opacity: 1; animation: none !important; }
  .rg-showerBouquet { transform: none; animation: none !important; }
  .rg-showerSay { opacity: 1; animation: none !important; }
}
`;
