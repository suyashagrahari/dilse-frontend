// "The Little Proposal" — all of the template's CSS (one string, injected once by the Experience).
// Palette: Lavender Mochi + Cherry Soda accents (research v3 §C1). Shapes: puffy pills with a darker lip, white
// cards with tinted shadows, die-cut stickers, washi tape, polaroids. Motion is transform/opacity only.
// No quotes-sensitive content: React escapes <style> text on the server.

export const PROPOSAL_CSS = `
.lp-root { --lp-bg: #F8F4FF; --lp-bg2: #EDE3FF; --lp-soft: #DCCBFF; --lp-primary: #A07BFF; --lp-deep: #7A52E0; --lp-deeper: #5B36C4;
  --lp-ink: #3B2A63; --lp-ink2: #6E5C96; --lp-pop: #FFB3D6; --lp-cherry: #FF4D6D; --lp-cherry2: #C9184A; --lp-sun: #FFD166; --lp-mint: #A8E6CF;
  position: relative; min-height: calc(100dvh - var(--vw-dock-space, 0px)); width: 100%; overflow: hidden; color: var(--lp-ink);
  background: linear-gradient(160deg, #F8F4FF 0%, #EDE3FF 52%, #FFE3EC 100%);
  font-family: var(--lp-round), system-ui, sans-serif; }
.lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; }

/* ── ambient: blobs, rising hearts, wide-screen wings ─────────────────── */
.lp-blob { position: fixed; border-radius: 50%; filter: blur(40px); opacity: .55; pointer-events: none; z-index: 0; }
.lp-blob.a { width: 340px; height: 340px; left: -120px; top: -80px; background: #DCCBFF; }
.lp-blob.b { width: 300px; height: 300px; right: -110px; bottom: 6vh; background: #FFC7DA; }
.lp-blob.c { width: 220px; height: 220px; right: 18%; top: 30%; background: #FFF1C9; opacity: .4; }
.lp-floaty { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.lp-floaty i { position: absolute; bottom: -30px; font-style: normal; color: var(--c); opacity: .55; font-size: var(--s);
  animation: lp-rise var(--d) linear infinite; animation-delay: var(--dl); will-change: transform; }
@keyframes lp-rise { 0% { transform: translate3d(0,0,0) rotate(-8deg); opacity: 0; } 10% { opacity: .6; }
  50% { transform: translate3d(14px,-55vh,0) rotate(8deg); } 90% { opacity: .5; } 100% { transform: translate3d(-10px,-110vh,0) rotate(-6deg); opacity: 0; } }

.lp-wing, .lp-gif.lp-corner { display: none; }
@media (min-width: 768px) and (max-width: 1099px) {
  .lp-gif.lp-corner { display: inline-grid; position: fixed; z-index: 1; pointer-events: none; }
  .lp-corner.a { left: calc((100vw - 460px) / 4 - 50px); top: 22vh; transform: rotate(-8deg); }
  .lp-corner.b { right: calc((100vw - 460px) / 4 - 50px); bottom: 18vh; transform: rotate(8deg); }
}
@media (min-width: 1600px) {
  .lp-wing .lp-pol { width: min(240px, 62%); }
  .lp-wing-name { font-size: 52px; }
  .lp-wing-line { font-size: 19px; }
}
@media (min-width: 1100px) {
  .lp-wing { display: grid; position: fixed; top: 50%; transform: translateY(-50%); z-index: 1; width: calc((100vw - 480px) / 2 - 40px); max-width: 420px;
    justify-items: center; gap: 18px; pointer-events: none; }
  .lp-wing.l { left: 20px; } .lp-wing.r { right: 20px; }
  .lp-wing .lp-pol { width: min(190px, 62%); }
  .lp-wing .lp-pol:first-child { margin-right: 22%; }
  .lp-wing .lp-pol + .lp-pol { margin-top: -26px; margin-left: 30%; }
  .lp-wing-name { font: 700 clamp(30px, 2.6vw, 46px)/1.1 var(--lp-hand), cursive; color: var(--lp-deep); text-align: center; }
  .lp-wing-line { font: 600 16px/1.4 var(--lp-round), sans-serif; color: var(--lp-ink2); text-align: center; max-width: 26ch; }
}

/* ── the stage: a phone-like column, centred ──────────────────────────── */
.lp-stage { position: relative; z-index: 2; width: 100%; max-width: 480px; margin: 0 auto; min-height: calc(100dvh - var(--vw-dock-space, 0px));
  padding: 84px 16px 22px; display: flex; flex-direction: column; }
@media (min-width: 768px) {
  .lp-stage { max-width: 460px; margin: 22px auto; min-height: calc(100dvh - 44px - var(--vw-dock-space, 0px)); border-radius: 40px; padding-top: 78px;
    background: rgba(255,255,255,.42); border: 2px solid rgba(255,255,255,.8); box-shadow: 0 30px 70px -30px rgba(122,82,224,.35); }
}
.lp-dots { position: absolute; top: 60px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; z-index: 3; pointer-events: none; }
@media (min-width: 768px) { .lp-dots { top: 30px; } }
.lp-dots i { width: 14px; height: 14px; display: block; color: #E3D7FF; transition: color .4s, transform .4s; }
.lp-dots i.on { color: var(--lp-cherry); }
.lp-dots i.cur { transform: scale(1.3); }
.lp-dots svg { width: 100%; height: 100%; display: block; }

.lp-scene { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; width: 100%; }
.lp-head { display: grid; justify-items: center; gap: 4px; margin-top: 6px; }
.lp-kicker { margin: 0; font: 700 13px/1.2 var(--lp-round), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--lp-deep); }
.lp-title { margin: 0; display: inline-flex; align-items: center; gap: 8px; font: 800 clamp(28px, 8vw, 36px)/1.08 var(--lp-round), sans-serif; color: var(--lp-ink); letter-spacing: -.01em; }
.lp-title > span { max-width: 15ch; }
.lp-sub { margin: 0; font: 500 16px/1.4 var(--lp-round), sans-serif; color: var(--lp-ink2); max-width: 30ch; }
.lp-spark { color: var(--lp-cherry); flex: none; animation: lp-twinkle 2.4s ease-in-out infinite; }
.lp-spark.r { color: var(--lp-sun); animation-delay: 1.2s; }
@keyframes lp-twinkle { 0%, 100% { transform: scale(.7) rotate(0); opacity: .7; } 50% { transform: scale(1.1) rotate(20deg); opacity: 1; } }
.lp-hand { font-family: var(--lp-hand), cursive; }
.lp-big { font-size: 28px; line-height: 1.2; color: var(--lp-deep); margin: 6px 0 0; font-weight: 700; }
.lp-mid { font-size: 22px; line-height: 1.25; color: var(--lp-deep); margin: 0; font-weight: 700; }
.lp-actions { margin-top: auto; display: grid; justify-items: center; align-content: end; gap: 10px; padding-top: 8px; min-height: 64px; }

/* ── buttons ──────────────────────────────────────────────────────────── */
.lp-btn { appearance: none; border: 0; cursor: pointer; border-radius: 999px; min-height: 54px; padding: 14px 30px; font: 800 19px/1 var(--lp-round), sans-serif;
  color: #fff; background: linear-gradient(180deg, #9C78FF, #8158F2); box-shadow: 0 5px 0 var(--lp-deeper), 0 12px 26px rgba(91,54,196,.28);
  transition: transform .12s, box-shadow .12s; -webkit-tap-highlight-color: transparent; }
.lp-btn:active { transform: translateY(3px) scale(.97); box-shadow: 0 2px 0 var(--lp-deeper), 0 6px 14px rgba(91,54,196,.25); }
.lp-btn-cherry { background: linear-gradient(180deg, #FF6F8E, #FF4D6D); box-shadow: 0 5px 0 var(--lp-cherry2), 0 12px 26px rgba(201,24,74,.28); }
.lp-btn-cherry:active { box-shadow: 0 2px 0 var(--lp-cherry2), 0 6px 14px rgba(201,24,74,.25); }
.lp-btn-soft { color: var(--lp-deeper); background: #fff; border: 2px solid var(--lp-soft); box-shadow: 0 4px 0 var(--lp-soft), 0 10px 20px rgba(122,82,224,.14); }
.lp-btn-soft:active { box-shadow: 0 1px 0 var(--lp-soft); }
.lp-btn:disabled { opacity: .6; cursor: default; }
.lp-btn:focus-visible, .lp-link:focus-visible, .lp-panel:focus-visible, .lp-box:focus-visible, .lp-pad:focus-visible, .lp-seal:focus-visible, .lp-doorBtn:focus-visible, .lp-psEnv:focus-visible {
  outline: 3px solid var(--lp-cherry); outline-offset: 4px; }
.lp-link { appearance: none; border: 0; background: none; cursor: pointer; min-height: 44px; padding: 8px 14px; font: 700 15px/1.2 var(--lp-round), sans-serif;
  color: var(--lp-ink2); text-decoration: underline; text-decoration-color: var(--lp-soft); text-underline-offset: 4px; }

/* ── stickers, polaroids, washi, bubbles ──────────────────────────────── */
.lp-gif { position: relative; display: inline-grid; place-items: center; flex: none;
  filter: drop-shadow(0 0 0 #fff) drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 6px 10px rgba(91,54,196,.18)); }
.lp-gif img { width: 100%; height: 100%; object-fit: contain; user-select: none; pointer-events: none; }
.lp-pol { position: relative; margin: 0; background: #fff; padding: 10px 10px 0; border-radius: 6px; box-shadow: 0 16px 34px -12px rgba(91,54,196,.35), 0 2px 0 rgba(91,54,196,.06); }
.lp-pol-ph { position: relative; aspect-ratio: 4 / 5; border-radius: 3px; overflow: hidden; background: #F1EAFF; }
.lp-pol-empty { position: absolute; inset: 0; display: grid; place-items: center; font-size: 48px; }
.lp-pol figcaption { display: grid; gap: 4px; padding: 10px 6px 14px; min-height: 52px; }
.lp-tape { position: absolute; top: -12px; left: 50%; width: 92px; height: 26px; transform: translateX(-50%) rotate(-4deg); z-index: 2; opacity: .88;
  clip-path: polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 4% 96%, 0 50%); }
.lp-tape-pink { background: repeating-linear-gradient(45deg, #FFB3D6 0 8px, #FFD1E3 8px 16px); }
.lp-tape-lilac { background: repeating-linear-gradient(45deg, #C9B6FF 0 8px, #DCCBFF 8px 16px); }
.lp-tape-mint { background: repeating-linear-gradient(45deg, #A8E6CF 0 8px, #CFF3E3 8px 16px); }
.lp-bubble { position: relative; margin: 0; max-width: 300px; background: #fff; color: var(--lp-ink); border-radius: 22px; padding: 14px 18px;
  font: 700 21px/1.3 var(--lp-hand), cursive; box-shadow: 0 10px 24px -8px rgba(91,54,196,.3); border: 2px solid var(--lp-soft); }
.lp-bubble::before { content: ""; position: absolute; top: -11px; left: 50%; width: 20px; height: 20px; background: #fff; border-left: 2px solid var(--lp-soft); border-top: 2px solid var(--lp-soft);
  transform: translateX(-50%) rotate(45deg); border-radius: 4px 0 0 0; }
.lp-bubble-cherry { border-color: #FFC2D1; }
.lp-bubble-cherry::before { border-color: #FFC2D1; }
.lp-sticky { margin: 0; max-width: 290px; background: #FFF6C9; color: #5A4520; padding: 14px 18px; border-radius: 4px 18px 4px 18px; font: 700 20px/1.3 var(--lp-hand), cursive;
  box-shadow: 0 12px 22px -10px rgba(120,90,20,.35); }
.lp-pop { animation: lp-pop .5s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes lp-pop { from { opacity: 0; transform: scale(.5) rotate(-6deg); } to { opacity: 1; transform: none; } }
.lp-tapHint { position: absolute; left: 50%; bottom: 46px; transform: translateX(-50%); background: var(--lp-cherry); color: #fff; font: 800 13px/1 var(--lp-round), sans-serif;
  padding: 7px 12px; border-radius: 999px; letter-spacing: .04em; box-shadow: 0 3px 0 var(--lp-cherry2); animation: lp-bob 1.6s ease-in-out infinite; pointer-events: none; white-space: nowrap; }
@keyframes lp-bob { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -6px); } }

/* ── the door (gate art + hello) ──────────────────────────────────────── */
.lp-door { position: relative; width: 210px; height: 300px; margin: 0 auto; }
.lp-door-frame { position: absolute; left: 25px; right: 25px; top: 0; bottom: 30px; border-radius: 80px 80px 8px 8px; background: #fff; padding: 8px 8px 0;
  box-shadow: 0 20px 40px -16px rgba(91,54,196,.45), inset 0 -4px 0 #EDE3FF; perspective: 700px; }
.lp-door-inside { position: absolute; inset: 8px 8px 0; border-radius: 72px 72px 2px 2px; overflow: hidden;
  background: radial-gradient(90% 70% at 50% 60%, #FFF6D8 0%, #FFE2A8 60%, #FFC98A 100%); display: grid; place-items: end center; }
.lp-door-leaf { position: absolute; inset: 8px 8px 0; transform-origin: left center; transition: transform .9s cubic-bezier(.34,1.3,.5,1); z-index: 2;
  filter: drop-shadow(4px 0 6px rgba(91,54,196,.2)); animation: lp-knock .36s ease-out; }
.lp-door-leaf svg { width: 100%; height: 100%; display: block; }
.lp-door[data-knock] .lp-door-leaf { animation: lp-knock .36s ease-out; }
@keyframes lp-knock { 0% { transform: none; } 25% { transform: translateX(-3px) rotate(-.6deg); } 55% { transform: translateX(3px) rotate(.6deg); } 100% { transform: none; } }
.lp-door.is-open .lp-door-leaf { transform: rotateY(-78deg); animation: none; }
.lp-door-sticker { position: absolute !important; right: -34px; top: -18px; z-index: 4; animation: lp-float 3.2s ease-in-out infinite; }
.lp-door-mat { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 150px; height: 30px; border-radius: 10px; background: #FFB3D6;
  color: #fff; font: 700 15px/30px var(--lp-hand), cursive; text-align: center; box-shadow: 0 4px 0 #FF8FB8; }
.lp-door-plant { position: absolute; bottom: 30px; width: 34px; height: 54px; z-index: 3; }
.lp-door-plant.l { left: -6px; } .lp-door-plant.r { right: -6px; }
.lp-door-plant i { position: absolute; bottom: 0; left: 3px; width: 28px; height: 24px; border-radius: 4px 4px 10px 10px; background: #FF9F7A; box-shadow: inset 0 4px 0 #FFB79A; }
.lp-door-plant b { position: absolute; bottom: 22px; left: 9px; width: 16px; height: 28px; border-radius: 50% 50% 40% 40%; background: radial-gradient(circle at 50% 30%, #FF6F8E 0 45%, transparent 46%), linear-gradient(#7FD3B2, #7FD3B2) 50% 100% / 3px 14px no-repeat; }
.lp-doorBtn { all: unset; position: relative; cursor: pointer; display: block; padding: 10px 30px 0; -webkit-tap-highlight-color: transparent; }
.lp-doorBtn:disabled { cursor: default; }
.lp-peek-in { margin-bottom: 4px; animation: lp-peek .7s .45s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes lp-peek { from { transform: translateY(40px) scale(.6); opacity: 0; } to { transform: none; opacity: 1; } }
.lp-hello-say { display: grid; justify-items: center; align-content: start; gap: 16px; margin-top: 18px; min-height: 140px; }

/* the gate (PremiumGate around the door) */
.lp-gate { color: var(--lp-ink); }
.lp-gate .pm-bar { display: none; }
.lp-gate .pm-gateKick { color: #7A52E0; opacity: 1; letter-spacing: .2em; }
.lp-gate .pm-gateName { font: 700 clamp(52px, 15vw, 84px)/1 var(--lp-hand), cursive !important; color: #3B2A63; }
.lp-gate .pm-gateName * { background: none !important; -webkit-text-fill-color: currentColor !important; color: inherit !important; }
.lp-gate .pm-gateSub { color: #6E5C96; opacity: 1; font-family: var(--lp-round), sans-serif; }
.lp-gate .pm-gateArt { width: min(250px, 62vw); max-height: 36vh; aspect-ratio: 210 / 300; filter: none; }
.lp-gate .pm-gateArt .lp-door { transform: scale(var(--lp-gs, 1)); transform-origin: center; }
.lp-gate .pm-gateCta { border-radius: 999px; font: 800 19px/1 var(--lp-round), sans-serif; color: #fff; background: linear-gradient(180deg, #FF6F8E, #FF4D6D);
  box-shadow: 0 5px 0 #C9184A, 0 12px 26px rgba(201,24,74,.28); border: 0; }
.lp-gate .pm-seal { color: #6E5C96; }
.lp-gate .pm-quiet { color: #6E5C96; }
@media (max-height: 700px) { .lp-gate .pm-gateArt { max-height: 30vh; } }

/* ── story cards ──────────────────────────────────────────────────────── */
.lp-stack { position: relative; width: min(280px, 74vw); height: calc(min(280px, 74vw) * 1.25 + 120px); margin-top: 18px; }
.lp-card { position: absolute; inset: 0 0 auto 0; touch-action: pan-y; cursor: grab; }
.lp-card .lp-pol { padding-bottom: 0; }
.lp-when { justify-self: center; font: 800 12px/1 var(--lp-round), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #fff; background: var(--lp-deep);
  padding: 6px 10px; border-radius: 999px; }
.lp-what { font: 700 19px/1.25 var(--lp-hand), cursive; color: var(--lp-ink); }
.lp-count { position: absolute; top: -30px; right: 2px; font: 800 13px/1 var(--lp-round), sans-serif; color: var(--lp-deep); background: #fff; padding: 6px 10px; border-radius: 999px;
  box-shadow: 0 3px 0 var(--lp-soft); z-index: 20; }
.lp-reactor { position: absolute !important; left: -46px; bottom: -6px; z-index: 30; transform: rotate(-8deg); animation: lp-float 3.4s ease-in-out infinite; }
@keyframes lp-float { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-7px) rotate(3deg); } }
.lp-story-done { position: absolute; inset: 10px -10px auto; display: grid; justify-items: center; gap: 6px; }
.lp-fan { position: relative; width: 100%; height: 230px; display: grid; place-items: center; }
.lp-fan-card { position: absolute; width: 132px; }
.lp-fan-card .lp-pol { padding-bottom: 22px; }
.lp-fan-gif { position: absolute !important; bottom: -34px; left: 50%; margin-left: -60px; z-index: 5; }

/* ── rehearsal comic ──────────────────────────────────────────────────── */
.lp-comic { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; max-width: 360px; margin-top: 10px; }
.lp-panel { appearance: none; position: relative; cursor: pointer; border: 3px solid var(--lp-ink); border-radius: 18px; min-height: 170px; padding: 26px 8px 10px;
  display: grid; justify-items: center; align-content: center; gap: 6px; box-shadow: 4px 5px 0 var(--lp-ink); color: var(--lp-ink); -webkit-tap-highlight-color: transparent; }
.lp-panel.is-next:not(.is-open) { animation: lp-wiggle 2.6s ease-in-out infinite; }
@keyframes lp-wiggle { 0%, 70%, 100% { transform: rotate(0); } 76% { transform: rotate(-4deg); } 82% { transform: rotate(4deg); } 88% { transform: rotate(-2deg); } 94% { transform: rotate(2deg); } }
.lp-take { position: absolute; top: 7px; left: 9px; font: 800 11px/1 var(--lp-round), sans-serif; letter-spacing: .1em; text-transform: uppercase; background: var(--lp-ink); color: #fff;
  padding: 4px 7px; border-radius: 6px; }
.lp-panel-q { font: 800 56px/1 var(--lp-round), sans-serif; color: var(--lp-deep); opacity: .55; }
.lp-panel-cap { font: 700 16px/1.2 var(--lp-hand), cursive; }

/* ── find the ring ────────────────────────────────────────────────────── */
.lp-boxes { display: flex; justify-content: center; align-items: flex-end; gap: 16px; margin-top: 76px; width: 100%; }
.lp-box { all: unset; position: relative; width: 92px; height: 92px; cursor: pointer; animation: lp-boxIdle 3s ease-in-out infinite; -webkit-tap-highlight-color: transparent; }
.lp-box:disabled { cursor: default; }
.lp-box.is-open { animation: none; }
@keyframes lp-boxIdle { 0%, 80%, 100% { transform: none; } 85% { transform: rotate(-5deg) translateY(-3px); } 90% { transform: rotate(5deg) translateY(-3px); } 95% { transform: rotate(-2deg); } }
.lp-box-body { position: absolute; left: 4px; right: 4px; bottom: 0; height: 64px; border-radius: 8px 8px 14px 14px; background: var(--b);
  box-shadow: inset 0 -6px 0 rgba(0,0,0,.08), 0 10px 18px -8px rgba(91,54,196,.4);
  background-image: linear-gradient(90deg, transparent calc(50% - 7px), var(--r) calc(50% - 7px), var(--r) calc(50% + 7px), transparent calc(50% + 7px)); }
.lp-box-lid { position: absolute; left: 0; right: 0; bottom: 60px; height: 24px; border-radius: 8px; background: var(--l); z-index: 2;
  background-image: linear-gradient(90deg, transparent calc(50% - 7px), var(--r) calc(50% - 7px), var(--r) calc(50% + 7px), transparent calc(50% + 7px));
  transition: transform .55s cubic-bezier(.34,1.56,.64,1), opacity .5s; }
.lp-box-lid::before, .lp-box-lid::after { content: ""; position: absolute; top: -16px; width: 22px; height: 18px; border: 5px solid var(--r); border-radius: 50% 50% 4px 50%; }
.lp-box-lid::before { left: calc(50% - 24px); transform: rotate(-20deg); }
.lp-box-lid::after { right: calc(50% - 24px); transform: rotate(20deg) scaleX(-1); }
.lp-box.is-open .lp-box-lid { transform: translate(-30px, -50px) rotate(-38deg); opacity: .0; }
.lp-box.is-ring .lp-box-lid { transform: translate(34px, -70px) rotate(42deg); }
.lp-box-prize { position: absolute; left: 50%; bottom: 40px; margin-left: -43px; width: 86px; display: grid; place-items: center; z-index: 1; }
.lp-ringPrize { position: relative; display: grid; place-items: center; }
.lp-ringMini { position: absolute; right: -14px; bottom: -6px; filter: drop-shadow(0 3px 4px rgba(0,0,0,.2)); }
.lp-box-glow { position: absolute; left: 50%; bottom: 30px; width: 160px; height: 160px; margin-left: -80px; border-radius: 50%; opacity: 0; pointer-events: none;
  background: radial-gradient(circle, rgba(255,241,201,.95) 0%, rgba(255,209,102,.5) 40%, transparent 70%); transition: opacity .5s; }
.lp-box.is-ring .lp-box-glow { opacity: 1; animation: lp-glow 1.6s ease-in-out infinite; }
@keyframes lp-glow { 0%, 100% { transform: scale(.9); } 50% { transform: scale(1.08); } }
.lp-box-tag { position: absolute; left: 50%; bottom: -30px; transform: translateX(-50%) rotate(-3deg); white-space: nowrap; font: 800 12px/1 var(--lp-round), sans-serif;
  color: var(--lp-cherry2); background: #fff; padding: 5px 8px; border-radius: 999px; box-shadow: 0 2px 0 #FFC2D1; }
.lp-find-note { min-height: 92px; display: grid; place-items: center; margin-top: 30px; }
.lp-find-peek { min-height: 104px; display: grid; place-items: center; }

/* ── the letter ───────────────────────────────────────────────────────── */
.lp-env { position: relative; width: min(310px, 82vw); aspect-ratio: 1.45; margin-top: 30px; }
.lp-env-back { position: absolute; inset: 0; border-radius: 16px; background: linear-gradient(180deg, #FFD1E3, #FFB3D6); box-shadow: 0 22px 40px -16px rgba(201,24,74,.4); }
.lp-env-back::after { content: ""; position: absolute; inset: 0; border-radius: 16px; background: linear-gradient(to top right, transparent 49.5%, rgba(255,255,255,.35) 50%, transparent 51%),
  linear-gradient(to top left, transparent 49.5%, rgba(255,255,255,.35) 50%, transparent 51%); }
.lp-env-flap { position: absolute; left: 0; right: 0; top: 0; height: 58%; background: #FF9EC4; clip-path: polygon(0 0, 100% 0, 50% 100%); border-radius: 16px 16px 0 0; }
.lp-env-to { position: absolute; left: 0; right: 0; bottom: 18px; font: 400 22px/1 var(--lp-hand), cursive; color: #8E2350; }
.lp-env-to b { font-weight: 700; }
.lp-seal { all: unset; position: absolute; left: 50%; top: 58%; width: 64px; height: 64px; margin: -32px 0 0 -32px; cursor: pointer; border-radius: 50%;
  filter: drop-shadow(0 6px 8px rgba(201,24,74,.4)); animation: lp-beat 2.4s ease-in-out infinite; }
@keyframes lp-beat { 0%, 40%, 100% { transform: scale(1); } 10% { transform: scale(1.12); } 20% { transform: scale(1); } 30% { transform: scale(1.08); } }
.lp-env-gif { position: absolute !important; right: -22px; top: -42px; transform: rotate(10deg); }
.lp-paper { position: relative; width: 100%; max-width: 380px; background: #fff; border-radius: 18px; padding: 22px 18px 18px 30px; transform-origin: bottom center;
  box-shadow: 0 20px 40px -18px rgba(91,54,196,.4); text-align: left;
  background-image: linear-gradient(90deg, transparent 22px, #FFC2D1 22px, #FFC2D1 24px, transparent 24px), repeating-linear-gradient(180deg, transparent 0 31px, #EDE3FF 31px 32px);
  background-position: 0 0, 0 14px; }
.lp-paper-in { max-height: min(46vh, 430px); overflow-y: auto; overscroll-behavior: contain; padding-right: 4px; }
.lp-letter-text { font: 400 19px/32px var(--lp-hand), cursive !important; color: var(--lp-ink); }
.lp-sign { margin: 10px 0 0; text-align: right; font: 700 22px/1.2 var(--lp-hand), cursive; color: var(--lp-deep); }
.lp-paper-gif { position: absolute !important; right: -12px; top: -46px; transform: rotate(8deg); z-index: 2; }

/* ── the voice ────────────────────────────────────────────────────────── */
.lp-phone { position: relative; width: min(320px, 86vw); margin-top: 16px; border-radius: 36px; background: #fff; padding: 30px 18px 20px; display: grid; justify-items: center; gap: 8px;
  border: 6px solid #EDE3FF; box-shadow: 0 24px 46px -20px rgba(91,54,196,.5); }
.lp-phone-notch { position: absolute; top: 10px; left: 50%; width: 70px; height: 8px; margin-left: -35px; border-radius: 999px; background: #EDE3FF; }
.lp-phone-from { margin: 0; font: 600 14px/1.2 var(--lp-round), sans-serif; color: var(--lp-ink2); }
.lp-phone-from b { color: var(--lp-deep); }
.lp-vn { width: 100%; --vw-glass: #F8F4FF; --vw-edge: #EDE3FF; --vw-ink: #3B2A63; }
.lp-vn .lp-hand { font-size: 18px; }
.lp-vn .pm-vnLabel { text-transform: none; letter-spacing: 0; font: 700 18px/1.25 var(--lp-hand), cursive; color: var(--lp-deep); }
.lp-vn .pm-vnTx, .lp-vn .pm-vnCap { font: 400 18px/1.4 var(--lp-hand), cursive !important; font-style: normal !important; color: var(--lp-ink); }
.lp-reply h2, .lp-reply h3, .lp-reply p, .lp-reply button, .lp-reply textarea, .lp-reply span, .lp-reply label { font-family: var(--lp-round), system-ui, sans-serif !important; }

/* ── the question + the money moment ──────────────────────────────────── */
.lp-qTitle { display: block; max-width: 15ch; font-size: clamp(30px, 8.6vw, 40px); color: var(--lp-deeper); }
.lp-yesTitle { color: var(--lp-cherry); font: 700 clamp(36px, 10vw, 48px)/1.05 var(--lp-hand), cursive; }
.lp-q-stage { position: relative; width: 100%; display: grid; justify-items: center; gap: 4px; margin-top: 6px; }
.lp-heartWrap { position: relative; width: 196px; height: 180px; transition: transform .6s cubic-bezier(.34,1.56,.64,1); }
.lp-heartWrap.is-yes { transform: scale(1.12); margin: 22px 0 26px; }
.lp-heartPh { position: absolute; inset: 0; -webkit-mask: var(--lp-heart) center / 100% 100% no-repeat; mask: var(--lp-heart) center / 100% 100% no-repeat; background: #F1EAFF;
  filter: saturate(.75) brightness(1.04); transition: filter .8s; }
.lp-heartWrap.is-yes .lp-heartPh { filter: none; }
.lp-heartEmpty { position: absolute; inset: 0; background: linear-gradient(160deg, #FFB3D6, #A07BFF); }
.lp-heartLine { position: absolute; inset: -2px; width: calc(100% + 4px); height: calc(100% + 4px); pointer-events: none; filter: drop-shadow(0 8px 14px rgba(201,24,74,.3)); }
.lp-heartQ { position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%); font: 800 64px/1 var(--lp-round), sans-serif; color: #fff; text-shadow: 0 4px 14px rgba(91,54,196,.5);
  animation: lp-beat 2.4s ease-in-out infinite; }
.lp-ringLand { position: absolute; left: 50%; top: -34px; margin-left: -39px; filter: drop-shadow(0 6px 10px rgba(91,54,196,.35)); z-index: 3; }
.lp-ringLand::after { content: ""; position: absolute; inset: -10px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.9), transparent 65%); z-index: -1; animation: lp-glow 1.6s ease-in-out infinite; }
.lp-wall { position: absolute; z-index: 2; }
.lp-boxRow { display: flex; align-items: flex-end; justify-content: center; gap: 6px; width: 100%; min-height: 100px; }
.lp-ringBox { position: relative; width: 84px; height: 76px; flex: none; margin-bottom: 6px; }
.lp-ringBox-base { position: absolute; left: 0; right: 0; bottom: 0; height: 46px; border-radius: 10px 10px 16px 16px; background: linear-gradient(180deg, #FF6F8E, #E0325A);
  box-shadow: inset 0 -6px 0 rgba(0,0,0,.12), 0 10px 18px -8px rgba(201,24,74,.6); }
.lp-ringBox-slot { position: absolute; left: 22px; right: 22px; top: 8px; height: 8px; border-radius: 999px; background: #8E1235; opacity: .6; }
.lp-ringBox-lid { position: absolute; left: -2px; right: -2px; bottom: 40px; height: 32px; border-radius: 20px 20px 6px 6px; background: linear-gradient(180deg, #FF8FA8, #FF4D6D); z-index: 2;
  box-shadow: inset 0 -4px 0 rgba(0,0,0,.1); transform-origin: 50% 100%; }
.lp-ringBox-lid::after { content: ""; position: absolute; left: 50%; top: 7px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: #FFD166; box-shadow: 0 0 8px #FFD166; }
.lp-ringBox.is-rolling { animation: lp-shake .12s linear infinite; }
.lp-ringBox-lid { transition: transform .45s cubic-bezier(.34,1.56,.64,1); }
.lp-ringBox.is-open .lp-ringBox-lid { transform: translate(-10px, -16px) rotate(-58deg); transform-origin: 0 100%; }
.lp-ringBox-glow { position: absolute; left: 50%; bottom: 20px; width: 150px; height: 150px; margin-left: -75px; border-radius: 50%; opacity: 0; pointer-events: none;
  background: radial-gradient(circle, rgba(255,241,201,.95) 0%, rgba(255,209,102,.45) 40%, transparent 70%); transition: opacity .3s; }
.lp-ringBox.is-open .lp-ringBox-glow { opacity: 1; animation: lp-glow 1.2s ease-in-out infinite; }
.lp-boxRow { transition: opacity .4s; }
.lp-yesText .lp-bubble { max-width: 230px; font-size: 19px; }
@keyframes lp-shake { 0% { transform: translate(0,0) rotate(0); } 25% { transform: translate(-2px,1px) rotate(-3deg); } 75% { transform: translate(2px,-1px) rotate(3deg); } }
.lp-please { display: inline-grid; width: 84px; transition: opacity .3s; }
.lp-arena { width: 100%; max-width: 360px; transition: opacity .4s; margin-top: auto; }
.lp-yesText { display: grid; justify-items: center; align-content: start; gap: 16px; margin-top: 4px; min-height: 140px; }

/* ── the certificate ──────────────────────────────────────────────────── */
.lp-cert-scene { gap: 18px; }
.lp-cert { position: relative; width: 100%; max-width: 380px; background: #fff; border-radius: 28px; padding: 26px 20px 36px; margin-top: 8px;
  border: 3px solid #fff; outline: 2px dashed var(--lp-soft); outline-offset: -12px; box-shadow: 0 24px 50px -24px rgba(91,54,196,.5); }
.lp-cert-gif { position: absolute !important; z-index: 2; }
.lp-cert-gif.tr { right: -14px; top: -26px; transform: rotate(10deg); }
.lp-cert-gif.bl { left: -18px; bottom: -52px; transform: rotate(-8deg); }
.lp-cert-kick { margin: 0; font: 700 12px/1 var(--lp-round), sans-serif; letter-spacing: .24em; text-transform: uppercase; color: var(--lp-deep); }
.lp-cert-title { margin: 6px 0 10px; font: 800 30px/1.05 var(--lp-round), sans-serif; color: var(--lp-cherry); }
.lp-cert-small { margin: 0; font: 500 14px/1.4 var(--lp-round), sans-serif; color: var(--lp-ink2); }
.lp-cert-names { margin: 2px 0 6px; font: 700 34px/1.15 var(--lp-hand), cursive; color: var(--lp-ink); overflow-wrap: anywhere; }
.lp-cert-names span { color: var(--lp-cherry); }
.lp-cert-terms { margin: 14px 0 6px; background: #F8F4FF; border-radius: 16px; padding: 10px 14px; text-align: left; }
.lp-cert-terms > span { font: 800 11px/1 var(--lp-round), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--lp-deep); }
.lp-cert-terms ul { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 4px; }
.lp-cert-terms li { font: 700 17px/1.3 var(--lp-hand), cursive; color: var(--lp-ink); padding-left: 22px; position: relative; }
.lp-cert-terms li::before { content: "♥"; position: absolute; left: 2px; color: var(--lp-cherry); }
.lp-cert-signs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; align-items: end; }
.lp-cert-sig { display: grid; justify-items: center; gap: 4px; }
.lp-cert-sig > .lp-hand { font-size: 28px; font-weight: 700; color: var(--lp-deep); border-bottom: 2px solid var(--lp-soft); padding: 0 10px 2px; min-height: 64px; display: grid; align-items: end; }
.lp-cert-sig small { font: 600 12px/1.2 var(--lp-round), sans-serif; color: var(--lp-ink2); }
.lp-pad { all: unset; cursor: pointer; width: 112px; height: 64px; border-radius: 18px; border: 2px dashed var(--lp-cherry); display: grid; place-items: center;
  background: #FFF0F3; animation: lp-beat 2.4s ease-in-out infinite; -webkit-tap-highlight-color: transparent; }
.lp-pad.is-signed { border-color: transparent; background: none; animation: none; cursor: default; }
.lp-padHint { font: 700 13px/1.15 var(--lp-round), sans-serif; color: var(--lp-cherry2); padding: 0 8px; text-align: center; }
.lp-stampMark { display: inline-flex; align-items: center; gap: 2px; color: var(--lp-cherry); font: 700 22px/1 var(--lp-hand), cursive; }
.lp-cert-end { margin: 14px 0 0; font: 700 18px/1.3 var(--lp-hand), cursive; color: var(--lp-deep); }
.lp-cert-actions { display: grid; justify-items: center; gap: 8px; margin-top: 26px; }
.lp-reply { width: 100%; max-width: 380px; --vw-glass: rgba(255,255,255,.85); --vw-edge: #DCCBFF; --vw-ink: #3B2A63; }
.lp-ps { width: 100%; max-width: 380px; display: grid; justify-items: center; }
.lp-psEnv { appearance: none; cursor: pointer; border: 2px dashed #FFB3D6; background: #FFF6FA; color: var(--lp-cherry2); border-radius: 18px; padding: 14px 18px; min-height: 52px;
  font: 700 16px/1.2 var(--lp-round), sans-serif; }
.lp-ps-in { display: grid; gap: 8px; text-align: left; max-width: 340px; white-space: pre-wrap; }
.lp-ps-in b { font-size: 21px; }
.lp-ps-in span { font-size: 19px; font-weight: 400; }
.lp-foot { display: grid; justify-items: center; padding-bottom: 8px; }

/* ── wider screens: more air, bigger hero objects ─────────────────────── */
@media (min-width: 768px) {
  .lp-title { font-size: 38px; }
  .lp-heartWrap { width: 210px; height: 194px; }
}
@media (max-height: 760px) and (max-width: 767px) {
  .lp-stage { padding-top: 76px; }
  .lp-stack { width: min(240px, 66vw); height: calc(min(240px, 66vw) * 1.25 + 112px); }
  .lp-heartWrap { width: 170px; height: 156px; }
  .lp-panel { min-height: 150px; }
}

@media (prefers-reduced-motion: reduce) {
  .lp-root *, .lp-root *::before, .lp-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  .lp-floaty { display: none; }
  .lp-door-leaf { transition: transform .25s; }
}
`;
