// "The Hug Passport" stylesheet (Peach Sorbet + mint, research §C1): every class is hp-prefixed. Transform and opacity
// only for anything that loops; no blur filters; reduced motion stills the loops and keeps every beat.
//   bg #FFF8F1 → #FFE4D2 · card #FFFDF9 · soft #FFD3B8 · primary #FF8A6B · deep #E0603F · ink #5E3226 · pop #9FE5C8
//   pink #FF7AA2 · hand = Caveat (--hp-hand) · letter = Patrick Hand (--hp-letter) · display/UI = Fredoka

export const PASSPORT_CSS = `
.hp-root, .hp-wall { --hp-ink: #5E3226; --hp-soft-ink: #8A5A48; --hp-coral: #FF8A6B; --hp-deep: #E0603F; --hp-soft: #FFD3B8; --hp-mint: #9FE5C8; --hp-pink: #FF7AA2; --hp-cream: #FFFDF9;
  --hp-hand-f: var(--hp-hand), 'Caveat', cursive; --hp-letter-f: var(--hp-letter), 'Patrick Hand', 'Caveat', cursive; --hp-ui: var(--font-fredoka), 'Fredoka', system-ui, sans-serif;
  font-family: var(--hp-ui); color: var(--hp-ink); }
.hp-root { position: relative; }
.hp-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  background: radial-gradient(42% 28% at 0% 8%, rgba(159,229,200,.32), transparent 70%), radial-gradient(40% 30% at 100% 30%, rgba(255,211,184,.8), transparent 70%), radial-gradient(50% 30% at 10% 100%, rgba(255,122,162,.14), transparent 70%); }
@media (min-width: 768px) { .hp-bg { z-index: -1; } }
.hp-blob { position: absolute; border-radius: 50%; background: rgba(255,211,184,.45); }
.hp-blob--a { width: 260px; height: 260px; left: -90px; top: 34%; }
.hp-blob--b { width: 200px; height: 200px; right: -70px; top: 66%; background: rgba(159,229,200,.28); }
.hp-blob--c { width: 160px; height: 160px; right: 18%; top: -60px; background: rgba(255,122,162,.12); }
.hp-bubbles i { position: absolute; bottom: -40px; width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,.9);
  background: radial-gradient(circle at 32% 30%, rgba(255,255,255,.95) 0 3px, rgba(255,255,255,.12) 4px); animation: hp-bubble 13s linear infinite; }
.hp-bubbles i:nth-child(3n) { width: 14px; height: 14px; }
.hp-bubbles i:nth-child(4n+1) { width: 30px; height: 30px; }
@keyframes hp-bubble { 0% { transform: translate(0, 0); opacity: 0; } 10% { opacity: .9; } 50% { transform: translate(14px, -55vh); } 90% { opacity: .7; } 100% { transform: translate(-6px, -110vh); opacity: 0; } }
.hp-sceneWrap { position: relative; z-index: 2; transform-origin: 50% 30%; }

/* ── scene shell ─────────────────────────────────────────────── */
.hp-scene { position: relative; box-sizing: border-box; width: 100%; max-width: 520px; margin: 0 auto; min-height: calc(100dvh - var(--vw-dock-space, 0px));
  display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
  padding: calc(var(--vw-top-space, 0px) + 60px) 18px 26px; }
.hp-head { display: grid; gap: 6px; justify-items: center; max-width: 360px; }
.hp-kicker { margin: 0; display: inline-flex; align-items: center; gap: 6px; font: 600 12px/1.2 var(--hp-ui); letter-spacing: .2em; text-transform: uppercase; color: var(--hp-deep); }
.hp-title { margin: 0; font: 700 clamp(24px, 6.6vw, 30px)/1.12 var(--hp-ui); color: var(--hp-ink); text-wrap: balance; overflow-wrap: anywhere; }
.hp-sub { margin: 0; font: 500 15px/1.4 var(--hp-ui); color: var(--hp-soft-ink); min-height: 1.4em; }
.hp-foot { display: flex; justify-content: center; gap: 10px; padding-top: 4px; min-height: 56px; scroll-margin-bottom: 90px; }
.hp-foot--stack { flex-direction: column; align-items: center; margin-top: 4px; min-height: 0; }
.hp-under { display: grid; justify-items: center; gap: 4px; min-height: 56px; }
.hp-forMe { all: unset; cursor: pointer; min-height: 44px; padding: 0 14px; display: inline-flex; align-items: center; font: 600 15px/1 var(--hp-ui); color: var(--hp-deep);
  text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 5px; }
.hp-forMe:focus-visible { outline: 3px solid var(--hp-deep); outline-offset: 2px; border-radius: 8px; }

/* the stamp bar */
.hp-bar { display: flex; align-items: center; gap: 6px; padding: 5px 10px 5px 6px; border-radius: 99px; background: rgba(255,255,255,.82); box-shadow: 0 3px 0 rgba(255,211,184,.95), 0 8px 18px rgba(224,96,63,.10); }
.hp-barBook { position: relative; width: 22px; height: 28px; border-radius: 4px 6px 6px 4px; background: linear-gradient(135deg, #FF9C7E, #E9674A); box-shadow: inset 3px 0 0 rgba(122,40,20,.2); margin-right: 2px; }
.hp-barBook i { position: absolute; left: 6px; top: 7px; width: 11px; height: 11px; border-radius: 50%; background: #FFF4E6; }
.hp-barDot { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; border: 2px dashed #FFD3B8; font-size: 12px; line-height: 1; box-sizing: border-box; transition: transform .35s cubic-bezier(.34,1.56,.64,1); }
.hp-barDot.is-got { border: 2px solid var(--ink); background: color-mix(in srgb, var(--ink) 14%, #fff); animation: hp-dot .5s cubic-bezier(.34,1.56,.64,1); }
.hp-barDot.is-now:not(.is-got) { border-color: var(--hp-coral); transform: scale(1.12); animation: hp-now 1.6s ease-in-out infinite; }
@keyframes hp-dot { 0% { transform: scale(.3) rotate(-30deg); } 100% { transform: scale(1) rotate(0); } }
@keyframes hp-now { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,138,107,.45); } 50% { box-shadow: 0 0 0 5px rgba(255,138,107,0); } }

/* ── puffy buttons (C3) ──────────────────────────────────────── */
.hp-btn { -webkit-appearance: none; appearance: none; border: 0; cursor: pointer; min-height: 52px; padding: 14px 26px; border-radius: 999px;
  font: 700 17px/1 var(--hp-ui); letter-spacing: .01em; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s, opacity .2s; -webkit-tap-highlight-color: transparent; }
.hp-btn--primary { color: #fff; background: linear-gradient(180deg, #FFA083 0%, #FF7F5E 100%); box-shadow: 0 5px 0 #D9542F, 0 12px 26px rgba(224,96,63,.3); text-shadow: 0 1px 0 rgba(180,60,30,.45); }
.hp-btn--ghost { color: var(--hp-deep); background: #fff; box-shadow: 0 4px 0 var(--hp-soft), 0 10px 20px rgba(224,96,63,.12); border: 2px solid var(--hp-soft); padding: 12px 22px; font-size: 16px; }
.hp-btn--soft { color: var(--hp-deep); background: var(--hp-soft); box-shadow: 0 4px 0 #F7B796; }
.hp-btn:active:not(:disabled) { transform: translateY(3px) scale(.97); box-shadow: 0 2px 0 #D9542F, 0 6px 14px rgba(224,96,63,.2); }
.hp-btn--ghost:active:not(:disabled) { box-shadow: 0 1px 0 var(--hp-soft); }
.hp-btn:disabled { opacity: .45; cursor: default; }
.hp-btn:focus-visible, .hp-stage:focus-visible, .hp-far:focus-visible, .hp-env:focus-visible, .hp-plush:focus-visible, .hp-seal:focus-visible, .hp-hugChip:focus-visible, .hp-couponBtn:focus-visible { outline: 3px solid var(--hp-deep); outline-offset: 3px; }
.hp-heartbeat { animation: hp-heartbeat 2.4s ease-in-out infinite; }
@keyframes hp-heartbeat { 0%, 50%, 100% { transform: scale(1); } 10% { transform: scale(1.08); } 20% { transform: scale(1); } 30% { transform: scale(1.05); } }
.hp-jelly { animation: hp-jelly .55s ease-out; }
@keyframes hp-jelly { 0% { scale: 1 1; } 25% { scale: 1.14 .86; } 50% { scale: .93 1.08; } 75% { scale: 1.03 .98; } 100% { scale: 1 1; } }

/* ── stickers (C3 die-cut) ───────────────────────────────────── */
.hp-sticker { display: inline-grid; place-items: center; position: relative; flex: none; transform: rotate(var(--tilt, 0deg));
  filter: drop-shadow(0 0 1.5px #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 5px 8px rgba(224,96,63,.22)); pointer-events: none; }
.hp-sticker img { width: 100%; height: 100%; object-fit: contain; display: block; }
.hp-pop { animation: hp-pop .55s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes hp-pop { 0% { opacity: 0; transform: scale(.4) rotate(-12deg); } 100% { opacity: 1; transform: scale(1) rotate(var(--tilt, 0deg)); } }
.hp-float { animation: hp-float 3.6s ease-in-out infinite; }
@keyframes hp-float { 0%, 100% { transform: translateY(0) rotate(var(--tilt, 0deg)); } 50% { transform: translateY(-6px) rotate(calc(var(--tilt, 0deg) + 3deg)); } }
.hp-washi { position: absolute; display: block; width: 70px; height: 20px; background: var(--washi); opacity: .9;
  -webkit-mask: linear-gradient(90deg, transparent 0 3px, #000 3px calc(100% - 3px), transparent calc(100% - 3px)); mask: linear-gradient(90deg, transparent 0 3px, #000 3px calc(100% - 3px), transparent calc(100% - 3px));
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.4) 0 6px, transparent 6px 12px); background-color: var(--washi); }
.hp-ink { display: inline-block; flex: none; }
.hp-ink svg { display: block; overflow: visible; }

/* ── gate: the passport + a bear with open arms ──────────────── */
.hp-gate .pm-gateKick { color: var(--hp-deep); opacity: 1; letter-spacing: .22em; }
.hp-gate .pm-gateName, .hp-gate .pm-gateName * { background: none !important; -webkit-text-fill-color: currentColor !important; color: var(--hp-deep) !important;
  font-family: var(--hp-hand-f) !important; font-weight: 700 !important; font-style: normal !important; text-shadow: 0 3px 0 rgba(255,211,184,.95); }
.hp-gate .pm-gateName { font-size: clamp(54px, 15vw, 84px) !important; line-height: .95 !important; margin: 0; }
.hp-gateSub { font: 500 14px/1.3 var(--hp-ui); color: var(--hp-soft-ink); }
.hp-gate .pm-gateArt { width: min(300px, 76vw); max-height: 40vh; aspect-ratio: 1; animation: none; overflow: visible; }
.hp-gate .pm-gateCta { background: linear-gradient(180deg, #FFA083 0%, #FF7F5E 100%) !important; color: #fff !important; border: 0 !important; border-radius: 999px !important;
  box-shadow: 0 5px 0 #D9542F, 0 12px 26px rgba(224,96,63,.3) !important; font: 700 18px/1 var(--hp-ui) !important; min-height: 56px; text-shadow: 0 1px 0 rgba(180,60,30,.4); }
.hp-gate .pm-gateCta small { color: rgba(255,255,255,.88); }
.hp-gate .pm-quiet { color: var(--hp-soft-ink) !important; }
.hp-gate .pm-seal { color: var(--hp-soft-ink); background: rgba(255,255,255,.6); }
.hp-gate .pm-sealWax { background: radial-gradient(circle at 35% 30%, #FFB59A, #E0603F) !important; color: #fff !important; }
.hp-gate .pm-bar { background: #FFE4D2 !important; }
.hp-cover { position: relative; display: block; width: 100%; height: 100%; }
.hp-coverBook { position: absolute; left: 0; bottom: 0; width: 50%; aspect-ratio: 200 / 270; transform: rotate(-7deg); z-index: 2; filter: drop-shadow(0 12px 16px rgba(224,96,63,.25));
  animation: hp-bookBob 3.8s ease-in-out infinite; }
@keyframes hp-bookBob { 0%, 100% { translate: 0 0; rotate: 0deg; } 50% { translate: 0 -6px; rotate: 2deg; } }
.hp-coverBear { position: absolute; right: -6%; bottom: 2%; width: 62%; aspect-ratio: 240 / 250; z-index: 1; transform-origin: 50% 100%; transition: transform 1s cubic-bezier(.5,-0.4,.3,1.2); }
.hp-coverBear .hp-armL, .hp-coverBear .hp-armR { transform-box: fill-box; animation: hp-wave 1.6s ease-in-out infinite; }
.hp-coverBear .hp-armL { transform-origin: 100% 100%; }
.hp-coverBear .hp-armR { transform-origin: 0% 100%; animation-delay: .8s; }
@keyframes hp-wave { 0%, 100% { rotate: 0deg; } 50% { rotate: -9deg; } }
.hp-coverBear .hp-armR { animation-name: hp-waveR; }
@keyframes hp-waveR { 0%, 100% { rotate: 0deg; } 50% { rotate: 9deg; } }
.hp-coverBubble { position: absolute; right: 0; top: 0; z-index: 3; max-width: 58%; padding: 8px 12px; border-radius: 16px 16px 16px 4px; background: #fff; color: var(--hp-deep);
  font: 700 22px/1.05 var(--hp-hand-f); box-shadow: 0 4px 0 var(--hp-soft); text-wrap: balance; animation: hp-pop .6s cubic-bezier(.34,1.56,.64,1) .4s both; }
.hp-coverPeek { position: absolute; left: -6%; top: -4%; z-index: 3; }
.hp-gate.is-opening .hp-coverBear { transform: translate(-30%, 8%) scale(2.6); z-index: 4; }
.hp-gate.is-opening .hp-coverBook { transform: rotate(-16deg) translate(-30px, 20px) scale(.9); transition: transform .8s; }

/* ── 1–4 · the hug stage ─────────────────────────────────────── */
.hp-stageWrap { position: relative; width: min(360px, 100%); flex: none; }
.hp-stage { position: relative; width: 100%; height: clamp(280px, 44vh, 400px); border-radius: 28px; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; cursor: grab;
  border: 4px solid #fff; box-sizing: border-box; box-shadow: 0 14px 30px rgba(224,96,63,.16), 0 0 0 2px #FFE4D2; -webkit-tap-highlight-color: transparent; }
.hp-stage.is-done { cursor: default; }
.hp-stage--bear { background: linear-gradient(180deg, #FFF1E6 0%, #FFE4D2 100%); }
.hp-stage--back { background: linear-gradient(180deg, #FFF8EE 0%, #F2FBF6 100%); }
.hp-stage--twirl { background: linear-gradient(180deg, #F8F4FF 0%, #FFEFF5 100%); }
.hp-stage--pat { background: linear-gradient(180deg, #EEF3FB 0%, #FFF1E6 100%); transition: background .8s; }
.hp-stage--pat.is-done { background: linear-gradient(180deg, #FFF7DD 0%, #FFE9DC 100%); }
.hp-stage--pat { cursor: pointer; }
.hp-pair { transform-box: fill-box; transform-origin: 50% 100%; transition: transform .28s cubic-bezier(.34,1.56,.64,1); }
.hp-pair.is-hugged { animation: hp-jelly .6s ease-out; }
.hp-tags { pointer-events: none; }
.hp-stageHint { position: absolute; left: 50%; top: 10px; transform: translateX(-50%); white-space: nowrap; padding: 4px 12px; border-radius: 99px; background: rgba(255,255,255,.88);
  color: var(--hp-deep); font: 700 19px/1 var(--hp-hand-f); pointer-events: none; animation: hp-bob 1.4s ease-in-out infinite; }
@keyframes hp-bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 -4px; } }
.hp-patDots { position: absolute; left: 0; right: 0; bottom: 10px; display: flex; justify-content: center; gap: 8px; pointer-events: none; }
.hp-patDots i { width: 12px; height: 12px; border-radius: 9px; background: rgba(94,50,38,.16); transition: background .2s, transform .3s cubic-bezier(.34,1.56,.64,1); }
.hp-patDots i.is-on { background: var(--hp-pink); transform: scale(1.25); }
.hp-patMark { animation: hp-patUp .9s ease-out forwards; }
@keyframes hp-patUp { from { opacity: 1; transform: translateY(0) scale(.7); } to { opacity: 0; transform: translateY(-30px) scale(1.2); } }
.hp-cloud { transition: transform .45s cubic-bezier(.34,1.56,.64,1), opacity .5s; transform-box: view-box; }
.hp-cloud.is-gone { opacity: 0; }
.hp-rain { animation: hp-rain .9s linear infinite; }
@keyframes hp-rain { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(26px); opacity: 0; } }
.hp-tear { animation: hp-tear 1.6s ease-in infinite; }
@keyframes hp-tear { 0%, 30% { transform: translateY(0); opacity: 0; } 40% { opacity: 1; } 100% { transform: translateY(18px); opacity: 0; } }
.hp-sun { opacity: 0; transform: scale(.4); transform-box: fill-box; transform-origin: 50% 50%; transition: opacity .6s .2s, transform .8s cubic-bezier(.34,1.56,.64,1) .2s; }
.hp-sun.is-on { opacity: 1; transform: scale(1); }
.hp-steam { animation: hp-steam 2.4s ease-in-out infinite; }
@keyframes hp-steam { 0% { transform: translateY(2px); opacity: 0; } 40% { opacity: .9; } 100% { transform: translateY(-6px); opacity: 0; } }
.hp-bulb { animation: hp-bulb 1.6s ease-in-out infinite; }
@keyframes hp-bulb { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
.hp-twirlGuide { pointer-events: none; }
.hp-puffs path { animation: hp-puff 1.7s ease-out infinite; opacity: 0; }
@keyframes hp-puff { 0% { transform: translate(var(--hx), 120px) scale(.4); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(calc(var(--hx) + var(--dx)), 36px) scale(1.4); opacity: 0; } }
.hp-reactor { position: absolute; z-index: 3; pointer-events: none; }
.hp-reactor--bear, .hp-reactor--twirl { right: -10px; bottom: -40px; }
.hp-reactor--back, .hp-reactor--pat { left: -12px; bottom: -40px; }

/* the passport page that slides in after a hug */
.hp-page { position: relative; width: min(360px, 100%); box-sizing: border-box; display: grid; grid-template-columns: 124px 1fr; align-items: center; gap: 4px 12px; padding: 14px 14px 12px;
  border-radius: 22px; background-color: var(--hp-cream); background-image: radial-gradient(circle at 50% 50%, transparent 0 9px, rgba(255,211,184,.35) 9px 10px, transparent 10px), linear-gradient(#FFFDF9, #FFF6EE);
  background-size: 22px 22px, 100% 100%; box-shadow: 0 12px 26px rgba(224,96,63,.14), 0 0 0 3px #FFE4D2; animation: hp-pageIn .5s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes hp-pageIn { from { opacity: 0; transform: translateY(20px) scale(.92); } to { opacity: 1; transform: none; } }
.hp-page::before { content: "HUG PASSPORT"; position: absolute; top: -10px; left: 16px; padding: 3px 10px; border-radius: 99px; background: var(--hp-coral); color: #fff; font: 700 10px/1.2 var(--hp-ui); letter-spacing: .18em; }
.hp-pageStamp { display: grid; place-items: center; min-height: 118px; }
.hp-pageEmpty { width: 104px; height: 104px; border-radius: 50%; border: 3px dashed #FFD3B8; }
.hp-landing { animation: hp-land .42s cubic-bezier(.2,1.5,.4,1) both; transform: rotate(-8deg); }
@keyframes hp-land { 0% { opacity: 0; transform: translateY(-40px) scale(2.3) rotate(-30deg); } 70% { opacity: 1; } 100% { opacity: 1; transform: scale(1) rotate(-8deg); } }
.hp-landing--big { animation-duration: .5s; }
.hp-pageSide { display: grid; place-items: center; min-height: 118px; }
.hp-souvenir { opacity: 0; transform: translateY(18px) rotate(calc(var(--rot, 0deg) - 10deg)); transition: opacity .45s, transform .55s cubic-bezier(.34,1.56,.64,1); }
.hp-souvenir.is-in { opacity: 1; transform: rotate(var(--rot, 0deg)); }
.hp-pageLine { grid-column: 1 / -1; margin: 6px 0 0; font: 600 22px/1.12 var(--hp-hand-f); color: var(--hp-ink); text-wrap: balance; opacity: 0; transform: translateY(6px); transition: opacity .5s .25s, transform .5s .25s; }
.hp-pageLine b { color: var(--hp-deep); font-weight: 700; }
.hp-pageLine.is-in { opacity: 1; transform: none; }
.hp-pol { position: relative; margin: 0; width: 116px; padding: 7px 7px 26px; background: #fff; box-shadow: 0 8px 16px rgba(94,50,38,.18); transform: rotate(var(--rot, 0deg)); box-sizing: border-box; }
.hp-polImg { display: block; aspect-ratio: 1; overflow: hidden; border-radius: 2px; }
.hp-pol figcaption { position: absolute; left: 4px; right: 4px; bottom: 3px; font: 600 15px/1 var(--hp-hand-f); color: var(--hp-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hp-polTape { top: -9px; left: 50%; margin-left: -32px; width: 64px; height: 18px; transform: rotate(-4deg); z-index: 1; }

/* ── 5 · long distance ───────────────────────────────────────── */
.hp-far { position: relative; width: min(360px, 100%); height: clamp(300px, 42vh, 340px); flex: none; touch-action: none; user-select: none; -webkit-user-select: none; border-radius: 28px;
  background: linear-gradient(180deg, #EAF4FF 0%, #FFF1E6 100%); border: 4px solid #fff; box-sizing: border-box; box-shadow: 0 14px 30px rgba(53,119,196,.12), 0 0 0 2px #E0EEFF; }
.hp-farPath { position: absolute; left: 10%; top: 22px; width: 80%; height: 50px; }
.hp-farPlane { position: absolute; top: 12px; font-size: 22px; transform: translateX(-50%) rotate(8deg); transition: left .15s linear; }
.hp-far.is-met .hp-farPath, .hp-far.is-met .hp-farPlane { opacity: 0; transition: opacity .4s; }
.hp-farKm { position: absolute; left: 0; right: 0; top: 34%; display: grid; justify-items: center; gap: 2px; pointer-events: none; transition: opacity .4s; }
.hp-farKm b { font: 700 clamp(30px, 9vw, 40px)/1 var(--hp-ui); color: #3577C4; font-variant-numeric: tabular-nums; }
.hp-farKm small { font: 600 13px/1 var(--hp-ui); color: var(--hp-soft-ink); }
.hp-far.is-met .hp-farKm { opacity: 0; }
.hp-farPhone { position: absolute; bottom: 14px; width: 104px; cursor: grab; touch-action: none; z-index: 2; transition: transform .1s linear; }
.hp-farKm { top: 26% !important; }
.hp-farPhone--l { left: 6px; } .hp-farPhone--r { right: 6px; }
.hp-far.is-met .hp-farPhone { transition: transform .45s cubic-bezier(.34,1.56,.64,1); }
.hp-phone { display: grid; justify-items: center; gap: 6px; }
.hp-phoneScreen { position: relative; display: block; width: 104px; height: 168px; box-sizing: border-box; border-radius: 22px; border: 6px solid #fff; overflow: hidden;
  background: linear-gradient(180deg, #D9F5EA, #FFF4E6); box-shadow: 0 0 0 2px #FFD3B8, 0 10px 18px rgba(94,50,38,.16); }
.hp-farPhone--r .hp-phoneScreen { background: linear-gradient(180deg, #FFE3EC, #FFF4E6); }
.hp-phoneScreen::before { content: ""; position: absolute; top: 5px; left: 50%; width: 30px; height: 6px; margin-left: -15px; border-radius: 9px; background: #FFE4D2; z-index: 1; }
.hp-phoneScreen svg { position: absolute; left: 6px; right: 6px; bottom: 6px; height: 120px; width: auto; }
.hp-phoneName { max-width: 110px; padding: 3px 10px; border-radius: 99px; background: #fff; font: 700 13px/1.2 var(--hp-ui); color: var(--hp-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 2px 0 #FFD3B8; }
.hp-farMeet { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.hp-farHeart { position: absolute; left: 50%; top: 4px; width: 148px; height: 136px; margin-left: -74px; animation: hp-heartIn .7s cubic-bezier(.34,1.56,.64,1) .1s both;
  filter: drop-shadow(0 0 0 #fff) drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 10px 14px rgba(224,96,63,.3)); display: grid; place-items: center; }
.hp-farHeartPhoto, .hp-wallPhoto { display: block; width: 100%; height: 100%;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 92'%3E%3Cpath d='M50 90 C10 64 0 40 6 24 C12 6 36 0 50 20 C64 0 88 6 94 24 C100 40 90 64 50 90 Z'/%3E%3C/svg%3E") center / 100% 100% no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 92'%3E%3Cpath d='M50 90 C10 64 0 40 6 24 C12 6 36 0 50 20 C64 0 88 6 94 24 C100 40 90 64 50 90 Z'/%3E%3C/svg%3E") center / 100% 100% no-repeat; }
@keyframes hp-heartIn { from { opacity: 0; transform: scale(.3) translateY(40px); } to { opacity: 1; transform: none; } }
.hp-farHug { position: absolute; left: 50%; bottom: 46px; margin-left: -75px; animation: hp-pop .6s cubic-bezier(.34,1.56,.64,1) .35s both; }
.hp-far.is-met .hp-phoneScreen svg { opacity: 0; transition: opacity .3s; }
.hp-reactor--far { left: 50%; margin-left: -43px; bottom: 30px; z-index: 1; }
.hp-far.is-met .hp-reactor--far { left: auto; right: -12px; margin: 0; top: auto; bottom: -40px; z-index: 4; }
.hp-page--far { grid-template-columns: 124px 1fr; }
.hp-page--far .hp-pageLine { grid-column: 2; margin: 0; text-align: left; }

/* ── letter ──────────────────────────────────────────────────── */
.hp-envWrap { position: relative; width: min(340px, 100%); margin-top: 18px; }
.hp-env { all: unset; box-sizing: border-box; position: relative; display: block; width: 100%; aspect-ratio: 1.45; cursor: pointer; border-radius: 16px; padding: 10px;
  background: repeating-linear-gradient(-45deg, #E0603F 0 12px, #fff 12px 22px, #3577C4 22px 34px, #fff 34px 44px); box-shadow: 0 16px 30px rgba(94,50,38,.18);
  animation: hp-envIn .7s cubic-bezier(.34,1.56,.64,1) both, hp-envWob 3.6s ease-in-out 1s infinite; }
.hp-env::before { content: ""; position: absolute; inset: 10px; border-radius: 8px; background: #FFF8EF; }
@keyframes hp-envIn { from { opacity: 0; transform: translateY(-60px) rotate(-12deg) scale(.8); } to { opacity: 1; transform: rotate(-2deg); } }
@keyframes hp-envWob { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(1.5deg) translateY(-4px); } }
.hp-envFlap { position: absolute; left: 10px; right: 10px; top: 10px; height: 44%; clip-path: polygon(0 0, 100% 0, 50% 100%); background: #FFE9D8; z-index: 1; }
.hp-envPost { position: absolute; z-index: 2; top: 20px; right: 20px; width: 70px; height: 82px; box-sizing: border-box; padding: 6px 4px 4px; display: grid; justify-items: center; align-content: start; gap: 2px;
  background: #FFF4E6; border: 2px solid #FFD3B8; transform: rotate(5deg);
  -webkit-mask: radial-gradient(circle 4px at 4px 4px, transparent 98%, #000) -4px -4px / 10px 10px; mask: radial-gradient(circle 4px at 4px 4px, transparent 98%, #000) -4px -4px / 10px 10px; }
.hp-envPostArt { font-size: 34px; line-height: 1.3; }
.hp-envPost small { font: 700 9px/1 var(--hp-ui); letter-spacing: .12em; color: var(--hp-deep); }
.hp-envMark { position: absolute; z-index: 2; top: 34px; right: 76px; width: 64px; height: 64px; border-radius: 50%; border: 2.5px solid rgba(53,119,196,.55); display: grid; place-items: center; text-align: center;
  font: 700 9px/1.1 var(--hp-ui); letter-spacing: .08em; color: rgba(53,119,196,.7); transform: rotate(-14deg); }
.hp-envTo { position: absolute; z-index: 2; left: 0; right: 0; top: 52%; display: flex; gap: 8px; align-items: baseline; justify-content: center; flex-wrap: wrap; font: 700 40px/1 var(--hp-hand-f); color: var(--hp-ink); }
.hp-envTo small { font: 600 14px/1 var(--hp-ui); color: var(--hp-soft-ink); }
.hp-envTo em { font: 600 22px/1 var(--hp-hand-f); color: var(--hp-deep); font-style: normal; }
.hp-envFrom { position: absolute; z-index: 2; left: 0; right: 0; bottom: 30px; font: 500 13px/1 var(--hp-ui); color: var(--hp-soft-ink); }
.hp-envTap { position: absolute; z-index: 2; left: 50%; bottom: -34px; transform: translateX(-50%); white-space: nowrap; font: 700 20px/1 var(--hp-hand-f); color: var(--hp-deep); animation: hp-bob 1.4s ease-in-out infinite; }
.hp-envPeek { position: absolute; left: -18px; bottom: -48px; z-index: 3; }
.hp-letter { position: relative; width: min(380px, 100%); box-sizing: border-box; padding: 26px 20px 22px; border-radius: 20px; text-align: left;
  background-color: #FFFDF8; background-image: repeating-linear-gradient(180deg, transparent 0 27px, rgba(255,138,107,.2) 27px 28.5px); background-position: 0 14px;
  box-shadow: 0 16px 32px rgba(94,50,38,.14), 0 0 0 3px #FFE4D2; animation: hp-letterIn .7s cubic-bezier(.22,1,.36,1) both; }
@keyframes hp-letterIn { from { opacity: 0; transform: translateY(60px) scale(.9); } to { opacity: 1; transform: none; } }
.hp-letterTape { top: -10px; left: 24px; transform: rotate(-6deg); }
.hp-letterPhoto { float: right; width: 92px; height: 92px; margin: -4px -4px 8px 12px; padding: 5px; background: #fff; box-shadow: 0 6px 12px rgba(94,50,38,.16); transform: rotate(5deg); }
.hp-letterPhoto > span { border-radius: 2px; }
.hp-letterText { font: 400 19px/1.48 var(--hp-letter-f); color: var(--hp-ink); white-space: pre-wrap; overflow-wrap: anywhere; }
.hp-letterSign { margin: 14px 0 0; text-align: right; font: 700 30px/1 var(--hp-hand-f); color: var(--hp-deep); opacity: 0; transition: opacity .6s; }
.hp-letterSign span { display: block; font: 600 20px/1.2 var(--hp-hand-f); color: var(--hp-soft-ink); }
.hp-letterSign.is-on { opacity: 1; }
.hp-letterPeek { position: absolute; left: -14px; bottom: -30px; }

/* ── voice ───────────────────────────────────────────────────── */
.hp-voiceStage { position: relative; width: min(340px, 100%); height: clamp(300px, 42vh, 350px); flex: none; display: grid; place-items: end center; }
.hp-cushion { position: absolute; left: 50%; bottom: 6px; width: 230px; height: 64px; margin-left: -115px; border-radius: 50%; background: radial-gradient(closest-side, #FFD3B8, #FFC3A3); box-shadow: inset 0 -6px 0 rgba(224,96,63,.18); }
.hp-plush { all: unset; position: relative; z-index: 1; width: 200px; height: 206px; margin-bottom: 24px; cursor: pointer; transform-origin: 50% 100%; -webkit-tap-highlight-color: transparent; }
.hp-plush.is-purring { animation: hp-purr .14s linear infinite; }
@keyframes hp-purr { 0% { translate: 0 0; } 25% { translate: -1px .5px; } 50% { translate: 1px 0; } 75% { translate: 0 -.5px; } 100% { translate: 0 0; } }
.hp-purrs { position: absolute; inset: 0; pointer-events: none; }
.hp-purrs i { position: absolute; bottom: 52%; font: 700 20px/1 var(--hp-hand-f); color: var(--hp-deep); font-style: normal; animation: hp-note 2.2s ease-out infinite; }
.hp-purrs i:nth-child(1) { left: 16%; } .hp-purrs i:nth-child(2) { left: 48%; animation-delay: .7s; } .hp-purrs i:nth-child(3) { right: 14%; animation-delay: 1.4s; }
@keyframes hp-note { 0% { transform: translateY(0) scale(.6); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-110px) scale(1.15); opacity: 0; } }
.hp-voicePeek { position: absolute; right: -6px; bottom: 10px; z-index: 2; }
.hp-bubble { position: absolute; left: 4%; right: 4%; top: 0; box-sizing: border-box; padding: 12px 16px; border-radius: 20px; background: #fff;
  font: 700 22px/1.12 var(--hp-hand-f); color: var(--hp-ink); box-shadow: 0 6px 0 var(--hp-soft); z-index: 2; animation: hp-pop .6s cubic-bezier(.34,1.56,.64,1) both; }
.hp-bubble::after { content: ""; position: absolute; left: 50%; bottom: -12px; margin-left: -10px; border: 10px solid transparent; border-top-color: #fff; border-bottom: 0; }
.hp-voiceCard { width: min(360px, 100%); box-sizing: border-box; padding: 14px; border-radius: 22px; background: #fff; box-shadow: 0 10px 22px rgba(224,96,63,.12), 0 0 0 3px #FFE4D2; display: grid; gap: 8px; }
.hp-voiceLabel { font: 700 22px/1 var(--hp-hand-f); color: var(--hp-deep); }
.hp-voiceCap { margin: 0; font: 600 20px/1.15 var(--hp-hand-f); color: var(--hp-ink); }

/* ── coupons ─────────────────────────────────────────────────── */
.hp-book { position: relative; width: min(400px, calc(100% + 36px)); margin: 18px -18px 0; }
.hp-bookPeek { position: absolute; right: 14px; bottom: -34px; z-index: 3; }
.hp-bookRings { position: absolute; left: 12%; right: 12%; top: -6px; display: flex; justify-content: space-between; z-index: 2; pointer-events: none; }
.hp-bookRings i { width: 10px; height: 22px; border-radius: 6px; background: linear-gradient(90deg, #D9C2B0, #fff 50%, #D9C2B0); box-shadow: 0 2px 3px rgba(94,50,38,.25); }
.hp-coupons { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 18px 9% 18px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.hp-coupons::-webkit-scrollbar { display: none; }
.hp-coupon { position: relative; flex: 0 0 82%; scroll-snap-align: center; display: grid; grid-template-columns: 1fr 74px; min-height: 176px; border-radius: 20px; background: var(--cb); text-align: left;
  box-shadow: 0 10px 20px rgba(94,50,38,.12), inset 0 0 0 3px rgba(255,255,255,.75); overflow: hidden; }
.hp-couponMain { padding: 16px 12px 14px 18px; display: grid; align-content: start; gap: 4px; }
.hp-couponMain small { font: 700 10.5px/1 var(--hp-ui); letter-spacing: .18em; color: var(--ci); opacity: .8; }
.hp-couponMain h3 { margin: 2px 0 0; font: 700 31px/1 var(--hp-hand-f); color: var(--ci); overflow-wrap: anywhere; }
.hp-couponMain p { margin: 0; font: 500 14px/1.35 var(--hp-ui); color: var(--hp-ink); }
.hp-couponFine { margin-top: auto; padding-top: 6px; font: 500 10.5px/1.2 var(--hp-ui); color: var(--hp-soft-ink); }
.hp-couponStub { position: relative; display: grid; place-items: center; border-left: 3px dashed color-mix(in srgb, var(--ci) 45%, transparent); background: rgba(255,255,255,.4); }
.hp-couponStub::before, .hp-couponStub::after { content: ""; position: absolute; left: -12px; width: 20px; height: 20px; border-radius: 50%; background: #FFF4EA; }
.hp-couponStub::before { top: -10px; } .hp-couponStub::after { bottom: -10px; }
.hp-couponBtn { all: unset; cursor: pointer; writing-mode: vertical-rl; transform: rotate(180deg); padding: 16px 10px; border-radius: 14px; background: var(--ci); color: #fff; font: 700 14px/1 var(--hp-ui); letter-spacing: .24em;
  box-shadow: 0 -4px 0 color-mix(in srgb, var(--ci) 70%, #000); }
.hp-couponBtn:active { transform: rotate(180deg) translateY(-2px); }
.hp-couponTell { writing-mode: vertical-rl; transform: rotate(180deg); font: 700 13px/1 var(--hp-ui); color: var(--ci); text-decoration: underline; text-underline-offset: 3px; padding: 8px; min-height: 44px; }
.hp-couponStamp { position: absolute; left: 44%; top: 50%; padding: 6px 12px; border: 4px double var(--ci); border-radius: 10px; color: var(--ci); font: 700 22px/1 var(--hp-ui); letter-spacing: .08em;
  background: rgba(255,255,255,.35); pointer-events: none; animation: hp-slamC .42s cubic-bezier(.2,1.5,.4,1) .2s both; }
@keyframes hp-slamC { 0% { opacity: 0; transform: translate(-50%, -50%) scale(2.4) rotate(-30deg); } 100% { opacity: .92; transform: translate(-50%, -50%) scale(1) rotate(-14deg); } }
.hp-coupon.is-used .hp-couponMain { opacity: .75; }
.hp-couponDots { display: flex; justify-content: center; gap: 4px; }
.hp-couponDots button { all: unset; cursor: pointer; width: 28px; height: 28px; display: grid; place-items: center; }
.hp-couponDots button::before { content: ""; width: 9px; height: 9px; border-radius: 9px; background: #FFD3B8; transition: width .3s, background .3s; }
.hp-couponDots button.is-on::before { width: 22px; background: var(--hp-coral); }

/* ── the last stamp + the wall ───────────────────────────────── */
.hp-last { position: relative; width: min(340px, 100%); display: grid; grid-template-columns: 1fr 1fr; margin-top: 30px; border-radius: 18px; box-shadow: 0 16px 30px rgba(94,50,38,.16), 0 0 0 3px #FFE4D2; background: #FFFDF9; }
.hp-last::after { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 18px; margin-left: -9px; background: linear-gradient(90deg, transparent, rgba(94,50,38,.08), transparent); pointer-events: none; }
.hp-lastPage { position: relative; display: grid; justify-items: center; align-content: center; gap: 4px; padding: 16px 10px; min-height: 200px;
  background-image: radial-gradient(circle at 50% 50%, transparent 0 9px, rgba(255,211,184,.3) 9px 10px, transparent 10px); background-size: 22px 22px; }
.hp-lastPage--l { border-radius: 18px 0 0 18px; }
.hp-lastPage--r { border-radius: 0 18px 18px 0; }
.hp-lastPhoto { display: grid; place-items: center; width: 100px; height: 122px; border-radius: 12px; overflow: hidden; background: #FFE4D2; box-shadow: 0 0 0 4px #fff, 0 6px 12px rgba(94,50,38,.18); }
.hp-lastPage b { margin-top: 6px; font: 700 26px/1 var(--hp-hand-f); color: var(--hp-ink); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hp-lastPage small { font: 700 10.5px/1.2 var(--hp-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--hp-deep); }
.hp-lastSpot { display: grid; place-items: center; width: 128px; height: 128px; }
.hp-lastEmpty { display: grid; place-items: center; align-content: center; width: 116px; height: 116px; border-radius: 50%; border: 3px dashed #FFB59A; gap: 2px; }
.hp-lastEmpty small:last-child { font: 600 18px/1 var(--hp-hand-f); letter-spacing: 0; text-transform: none; color: var(--hp-soft-ink); }
.hp-rubber { position: absolute; left: 50%; top: -44px; width: 76px; height: 92px; margin-left: -38px; z-index: 4; pointer-events: none; animation: hp-hover 2.4s ease-in-out infinite;
  filter: drop-shadow(0 10px 8px rgba(94,50,38,.22)); }
@keyframes hp-hover { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-8px) rotate(4deg); } }
.hp-last.is-yes .hp-rubber { animation: hp-lift 2.2s ease-in both; }
@keyframes hp-lift { 0% { transform: translateY(0); } 70% { transform: translateY(-34px) rotate(-3deg); } 76% { transform: translateY(-34px) rotate(4deg); } 82% { transform: translateY(-34px) rotate(-4deg); } 88% { transform: translateY(-34px) rotate(4deg); } 100% { transform: translateY(-36px) rotate(0); } }
.hp-last.is-slam .hp-rubber { animation: hp-slam .7s cubic-bezier(.6,0,.4,1) both; }
@keyframes hp-slam { 0% { transform: translateY(-36px); } 22% { transform: translateY(58px) scaleY(.86); } 40% { transform: translateY(54px); } 100% { transform: translateY(-140px) rotate(20deg); opacity: 0; } }
.hp-last.is-slam { animation: hp-thump .4s ease-out .12s; }
@keyframes hp-thump { 0% { transform: none; } 30% { transform: translateY(4px) scale(1.02, .97); } 100% { transform: none; } }
.hp-reactor--final { left: -16px; top: -58px; }
.hp-yesno { width: min(360px, 100%); }
.hp-lastWait { margin: 8px 0 0; min-height: 60px; font: 700 28px/1.1 var(--hp-hand-f); color: var(--hp-deep); }
.hp-wall { position: fixed; inset: 0; z-index: 300; overflow-x: hidden; overflow-y: auto; background: radial-gradient(60% 50% at 50% 46%, #FFFFFF, #FFF1E6 60%, #FFE0CF);
  animation: hp-fade .45s ease both; font-family: var(--hp-ui); color: var(--hp-ink); text-align: center; }
@keyframes hp-fade { from { opacity: 0; } to { opacity: 1; } }
.hp-wallTiles { position: fixed; inset: 0; pointer-events: none; z-index: 1; }
.hp-wallTile { position: absolute; --ts: clamp(66px, 19vw, 124px); width: var(--ts); height: var(--ts); margin: calc(var(--ts) / -2) 0 0 calc(var(--ts) / -2); opacity: 0; transform: scale(0) rotate(var(--r));
  animation: hp-tile .6s cubic-bezier(.34,1.56,.64,1) forwards; }
.hp-wallTile .hp-sticker { width: 100% !important; height: 100% !important; }
@keyframes hp-tile { from { opacity: 0; transform: scale(0) rotate(calc(var(--r) - 40deg)); } to { opacity: 1; transform: scale(1) rotate(var(--r)); } }
.hp-wallMid { position: relative; z-index: 3; min-height: 100%; box-sizing: border-box; display: grid; justify-items: center; align-content: center; gap: 8px; padding: 80px 16px 40px; }
.hp-wallHeart { position: relative; width: clamp(170px, 50vw, 250px); aspect-ratio: 100 / 92; animation: hp-heartIn .8s cubic-bezier(.34,1.56,.64,1) both;
  filter: drop-shadow(0 0 0 #fff) drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff) drop-shadow(0 14px 20px rgba(224,96,63,.32)); }
.hp-wallPhoto { display: grid; place-items: center; background: #FFE4D2; }
.hp-wallStamp { position: absolute; right: -30px; bottom: -22px; transform: rotate(-12deg); animation: hp-land .5s cubic-bezier(.2,1.5,.4,1) .55s both; }
.hp-wallSay { display: grid; justify-items: center; gap: 2px; padding: 10px 18px 12px; border-radius: 28px; background: radial-gradient(closest-side, rgba(255,255,255,.96), rgba(255,255,255,.8) 70%, rgba(255,255,255,0));
  animation: hp-pop .7s cubic-bezier(.34,1.56,.64,1) 1.2s both; }
.hp-wallGif { margin-bottom: -6px; }
.hp-wallLine { margin: 0; max-width: 330px; font: 700 clamp(34px, 9.5vw, 46px)/1 var(--hp-hand-f); color: var(--hp-deep); text-shadow: 0 3px 0 #fff; text-wrap: balance; }
.hp-wallNames { margin: 4px 0 0; font: 600 15px/1 var(--hp-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--hp-soft-ink); }
.hp-wallNames span { color: var(--hp-pink); }
.hp-wallCta { opacity: 0; transform: translateY(10px); transition: opacity .5s, transform .5s; padding-top: 8px; }
.hp-wallCta.is-on { opacity: 1; transform: none; }

/* ── the passport (keepsake) + ending ────────────────────────── */
.hp-spread { position: relative; width: min(360px, 100%); display: grid; gap: 16px; justify-items: center; }
.hp-id, .hp-stampsPage { position: relative; width: 100%; box-sizing: border-box; border-radius: 22px; background-color: #FFFDF9; overflow: hidden;
  background-image: radial-gradient(circle at 50% 50%, transparent 0 9px, rgba(255,211,184,.3) 9px 10px, transparent 10px); background-size: 22px 22px;
  box-shadow: 0 14px 28px rgba(94,50,38,.14), 0 0 0 3px #FFE4D2; }
.hp-id { transform: rotate(-1deg); padding: 0 0 12px; }
.hp-idHead { margin: 0; padding: 8px 12px; background: var(--hp-coral); color: #fff; font: 700 11px/1.2 var(--hp-ui); letter-spacing: .18em; }
.hp-idRow { display: grid; grid-template-columns: 112px 1fr; gap: 14px; padding: 14px 14px 6px; text-align: left; }
.hp-idPhoto { display: grid; place-items: center; width: 112px; height: 138px; border-radius: 12px; overflow: hidden; background: #FFE4D2; box-shadow: 0 0 0 3px #fff, 0 6px 12px rgba(94,50,38,.16); }
.hp-idFields { margin: 0; display: grid; gap: 1px; align-content: start; min-width: 0; }
.hp-idFields dt { font: 700 9.5px/1.2 var(--hp-ui); letter-spacing: .16em; text-transform: uppercase; color: #B5715B; margin-top: 4px; }
.hp-idFields dd { margin: 0; font: 600 16px/1.15 var(--hp-ui); color: var(--hp-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hp-idFields dd.is-name { font: 700 30px/1 var(--hp-hand-f); color: var(--hp-deep); }
.hp-mrz { margin: 6px 14px 0; font: 600 11px/1.2 ui-monospace, 'SF Mono', Menlo, monospace; letter-spacing: .12em; color: rgba(94,50,38,.5); white-space: nowrap; overflow: hidden; text-align: left; }
.hp-stampsPage { transform: rotate(1deg); height: 300px; }
.hp-stampsGrid { position: absolute; inset: 34px 6px 6px; }
.hp-stampSpot { position: absolute; transform: rotate(var(--rot)); animation: hp-land .45s cubic-bezier(.2,1.5,.4,1) both; }
.hp-stampSpot:nth-child(2) { animation-delay: .1s; } .hp-stampSpot:nth-child(3) { animation-delay: .2s; } .hp-stampSpot:nth-child(4) { animation-delay: .3s; }
.hp-stampSpot:nth-child(5) { animation-delay: .4s; } .hp-stampSpot:nth-child(6) { animation-delay: .5s; }
.hp-spreadPeek { position: absolute; right: -16px; bottom: -22px; }
.hp-spreadEnd { margin: 8px 0 0; font: 700 32px/1.02 var(--hp-hand-f); color: var(--hp-ink); text-wrap: balance; }
.hp-spreadNames { margin: -6px 0 0; font: 700 28px/1 var(--hp-hand-f); color: var(--hp-deep); }
.hp-spreadNames span { color: var(--hp-pink); }
.hp-endMore { display: flex; flex-direction: column; align-items: center; gap: 22px; width: min(400px, 100%); padding: 14px 0 20px; }
.hp-ps { position: relative; width: 100%; box-sizing: border-box; padding: 46px 18px 18px; margin-top: 30px; border-radius: 22px; background: #fff; box-shadow: 0 10px 24px rgba(224,96,63,.12), 0 0 0 3px #FFE4D2; display: grid; gap: 8px; justify-items: center; }
.hp-seal { position: absolute; top: -34px; left: 50%; width: 72px; height: 72px; margin-left: -36px; border: 0; padding: 0; background: transparent; cursor: pointer; }
.hp-sealL, .hp-sealR { position: absolute; top: 0; width: 50%; height: 100%; overflow: hidden; transition: transform .6s cubic-bezier(.22,1,.36,1), opacity .6s; }
.hp-sealL { left: 0; } .hp-sealR { right: 0; }
.hp-sealL::before, .hp-sealR::before { content: ""; position: absolute; top: 0; width: 72px; height: 72px; border-radius: 46% 54% 50% 50%;
  background: radial-gradient(circle at 35% 30%, #FFB59A, #FF8A6B 45%, #E0603F); box-shadow: inset 0 -4px 0 rgba(150,50,20,.25); }
.hp-sealL::before { left: 0; } .hp-sealR::before { right: 0; }
.hp-seal b { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font: 700 17px/1 var(--hp-ui); letter-spacing: .04em; transition: opacity .3s; }
.hp-ps:not(.is-open) .hp-seal { animation: hp-heartbeat 2.4s ease-in-out infinite; }
.hp-ps.is-open .hp-sealL { transform: translate(-16px, 6px) rotate(-24deg); opacity: 0; }
.hp-ps.is-open .hp-sealR { transform: translate(16px, 6px) rotate(24deg); opacity: 0; }
.hp-ps.is-open .hp-seal b { opacity: 0; }
.hp-psFirst { margin: 0; font: 700 24px/1.08 var(--hp-hand-f); color: var(--hp-deep); }
.hp-psRest { margin: 0; white-space: pre-line; font: 400 15.5px/1.5 var(--hp-ui); color: var(--hp-ink); animation: hp-pop .5s ease both; }
.hp-psHint { font: 500 12px/1 var(--hp-ui); color: var(--hp-soft-ink); }
.hp-hugBack { position: relative; width: 100%; box-sizing: border-box; padding: 22px 12px 12px; border-radius: 24px; border: 4px solid #fff; display: grid; gap: 8px; justify-items: center;
  background: repeating-linear-gradient(135deg, #DDF6EC 0 14px, #CDEFE1 14px 28px); box-shadow: 0 12px 26px rgba(31,154,115,.16); }
.hp-hugBack h3 { margin: 0; font: 700 30px/1 var(--hp-hand-f); color: #1F7A5C; }
.hp-hugBack > p { margin: 0; font: 500 14px/1.3 var(--hp-ui); color: var(--hp-soft-ink); }
.hp-hugBackPeek { position: absolute; right: -10px; top: -54px; }
.hp-hugChips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 4px 0 6px; }
.hp-hugChip { all: unset; cursor: pointer; min-height: 40px; padding: 0 14px; border-radius: 999px; background: #fff; color: var(--hp-ink); font: 600 14px/1 var(--hp-ui);
  display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 3px 0 rgba(31,154,115,.25); transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .2s, color .2s; }
.hp-hugChip.is-on { background: var(--ink); color: #fff; transform: scale(1.06); box-shadow: 0 3px 0 rgba(0,0,0,.2); }
.hp-hugBack .pm-reply { width: 100%; background: #fff !important; border-radius: 18px; box-shadow: none; border: 0; color: var(--hp-ink); }
.hp-hugBack .pm-replyH { font: 700 24px/1 var(--hp-hand-f) !important; color: var(--hp-deep); }
.hp-hugBack .pm-replyIn { font: 500 15px/1.4 var(--hp-ui); border: 2px solid var(--hp-soft); background: #FFF8F3; color: var(--hp-ink); }
.hp-hugBack .pm-replyBtn { box-shadow: 0 4px 0 #D9542F; font-family: var(--hp-ui); }
.hp-endKit { width: 100%; }
.hp-credit { margin: 0; font: 500 12px/1 var(--hp-ui); color: var(--hp-soft-ink); opacity: .8; }

/* ── desktop: the stage column grows a little ────────────────── */
@media (min-width: 768px) {
  .hp-scene { padding-top: calc(var(--vw-top-space, 0px) + 72px); gap: 14px; }
  .hp-title { font-size: 32px; }
}
@media (max-height: 700px) {
  .hp-scene { gap: 8px; padding-top: calc(var(--vw-top-space, 0px) + 54px); }
}

@media (prefers-reduced-motion: reduce) {
  .hp-heartbeat, .hp-float, .hp-coverBook, .hp-coverBear .hp-armL, .hp-coverBear .hp-armR, .hp-stageHint, .hp-rain, .hp-tear, .hp-steam, .hp-bulb, .hp-puffs path,
  .hp-env, .hp-envTap, .hp-plush.is-purring, .hp-purrs i, .hp-rubber, .hp-ps .hp-seal, .hp-barDot.is-now { animation: none !important; }
  .hp-wallTile { transform: scale(1) rotate(var(--r)); opacity: 1; animation: none !important; }
  .hp-gate.is-opening .hp-coverBear { transform: none; }
}
`;
