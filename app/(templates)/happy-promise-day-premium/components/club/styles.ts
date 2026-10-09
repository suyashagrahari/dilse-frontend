// "The Pinky Promise Club" — all of the template's CSS (one string, injected once by the Experience).
// Palette: Peach Sorbet with Lavender Mochi + mint accents (research v3 §C1). Shapes: puffy pills with a darker lip,
// white cards with tinted shadows, die-cut stickers, washi tape, polaroids, paper stars. Motion is transform/opacity.

export const CLUB_CSS = `
.pk-root { --pk-bg: #FFF8F1; --pk-bg2: #FFE4D2; --pk-soft: #FFD3B8; --pk-primary: #FF8A6B; --pk-deep: #E0603F; --pk-deeper: #C94A2C;
  --pk-ink: #5E3226; --pk-ink2: #8A5A4A; --pk-lilac: #A07BFF; --pk-lilac2: #7A52E0; --pk-mint: #9FE5C8; --pk-pink: #FFB3D6; --pk-sun: #FFD27A;
  position: relative; min-height: calc(100dvh - var(--vw-dock-space, 0px)); width: 100%; overflow: hidden; color: var(--pk-ink);
  background: linear-gradient(160deg, #FFF8F1 0%, #FFE4D2 55%, #FFE3EC 100%);
  font-family: var(--pk-round), system-ui, sans-serif; }
.pk-root *, .pk-root *::before, .pk-root *::after { box-sizing: border-box; }

/* ── ambient: blobs, rising hearts, the golden-hour sky, wide-screen wings ── */
.pk-blob { position: fixed; border-radius: 50%; filter: blur(40px); opacity: .55; pointer-events: none; z-index: 0; }
.pk-blob.a { width: 340px; height: 340px; left: -120px; top: -80px; background: #FFD3B8; }
.pk-blob.b { width: 300px; height: 300px; right: -110px; bottom: 6vh; background: #DCCBFF; opacity: .5; }
.pk-blob.c { width: 220px; height: 220px; right: 18%; top: 30%; background: #C8F2DF; opacity: .45; }
.pk-dusk { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0; transition: opacity 1.6s ease;
  background: linear-gradient(180deg, #FFB8A3 0%, #FFC9B5 30%, #E9B8E8 70%, #C9A7FF 100%); }
.pk-root.is-sky .pk-dusk { opacity: .78; }
.pk-floaty { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.pk-floaty i { position: absolute; bottom: -30px; font-style: normal; color: var(--c); opacity: .55; font-size: var(--s);
  animation: pk-rise var(--d) linear infinite; animation-delay: var(--dl); will-change: transform; }
@keyframes pk-rise { 0% { transform: translate3d(0,0,0) rotate(-8deg); opacity: 0; } 10% { opacity: .6; }
  50% { transform: translate3d(14px,-55vh,0) rotate(8deg); } 90% { opacity: .5; } 100% { transform: translate3d(-10px,-110vh,0) rotate(-6deg); opacity: 0; } }

.pk-wing, .pk-gif.pk-corner { display: none; }
@media (min-width: 768px) and (max-width: 1099px) {
  .pk-gif.pk-corner { display: inline-grid; position: fixed; z-index: 1; pointer-events: none; }
  .pk-corner.a { left: calc((100vw - 460px) / 4 - 50px); top: 22vh; transform: rotate(-8deg); }
  .pk-corner.b { right: calc((100vw - 460px) / 4 - 45px); bottom: 18vh; transform: rotate(8deg); }
}
@media (min-width: 1100px) {
  .pk-wing { display: grid; position: fixed; top: 50%; transform: translateY(-50%); z-index: 1; width: calc((100vw - 480px) / 2 - 40px); max-width: 420px;
    justify-items: center; gap: 18px; pointer-events: none; }
  .pk-wing.l { left: 20px; } .pk-wing.r { right: 20px; }
  .pk-wing .pk-pol { width: min(190px, 62%); }
  .pk-wing .pk-pol:first-child { margin-right: 22%; }
  .pk-wing .pk-pol + .pk-pol { margin-top: -26px; margin-left: 30%; }
  .pk-wing-name { margin: 0; font: 700 clamp(30px, 2.6vw, 46px)/1.1 var(--pk-hand), cursive; color: var(--pk-deep); text-align: center; }
  .pk-wing-line { margin: 0; font: 600 16px/1.4 var(--pk-round), sans-serif; color: var(--pk-ink2); text-align: center; max-width: 26ch; }
}
@media (min-width: 1600px) {
  .pk-wing .pk-pol { width: min(240px, 62%); }
  .pk-wing-name { font-size: 52px; }
  .pk-wing-line { font-size: 19px; }
}

/* ── the stage: a phone-like column, centred ──────────────────────────── */
.pk-stage { position: relative; z-index: 2; width: 100%; max-width: 480px; margin: 0 auto; min-height: calc(100dvh - var(--vw-dock-space, 0px));
  padding: 84px 16px 22px; display: flex; flex-direction: column; }
@media (min-width: 768px) {
  .pk-stage { max-width: 460px; margin: 22px auto; min-height: calc(100dvh - 44px - var(--vw-dock-space, 0px)); border-radius: 40px; padding-top: 78px;
    background: rgba(255,255,255,.45); border: 2px solid rgba(255,255,255,.85); box-shadow: 0 30px 70px -30px rgba(224,96,63,.35); transition: background 1.2s; }
  .pk-root.is-sky .pk-stage { background: rgba(255,255,255,.12); }
}
.pk-dots { position: absolute; top: 60px; left: 0; right: 0; display: flex; justify-content: center; gap: 4px; z-index: 3; pointer-events: none; }
@media (min-width: 768px) { .pk-dots { top: 28px; } }
.pk-dots i { width: 16px; height: 16px; display: block; transition: transform .4s; }
.pk-dots i.cur { transform: scale(1.35) rotate(12deg); }
.pk-dots svg { display: block; }

.pk-scene { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; width: 100%; position: relative; }
.pk-head { display: grid; justify-items: center; gap: 4px; margin-top: 6px; position: relative; z-index: 3; }
.pk-kicker { margin: 0; font: 800 13px/1.2 var(--pk-round), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--pk-deeper); }
.pk-title { margin: 0; display: inline-flex; align-items: center; gap: 8px; font: 800 clamp(28px, 8vw, 36px)/1.08 var(--pk-round), sans-serif; color: var(--pk-ink); letter-spacing: -.01em; }
.pk-title > span { max-width: 15ch; }
.pk-nw { white-space: nowrap; }
.pk-sub { margin: 0; font: 600 16px/1.4 var(--pk-round), sans-serif; color: var(--pk-ink2); max-width: 30ch; }
.pk-spark { color: var(--pk-primary); flex: none; animation: pk-twinkle 2.4s ease-in-out infinite; }
.pk-spark.r { color: var(--pk-lilac); animation-delay: 1.2s; }
@keyframes pk-twinkle { 0%, 100% { transform: scale(.7) rotate(0); opacity: .7; } 50% { transform: scale(1.1) rotate(20deg); opacity: 1; } }
.pk-hand { font-family: var(--pk-hand), cursive; }
.pk-actions { margin-top: auto; display: grid; justify-items: center; align-content: end; gap: 8px; padding-top: 8px; min-height: 64px; }
.pk-linkRow { display: flex; gap: 6px; justify-content: center; }
.pk-hint { font: 700 14px/1 var(--pk-round), sans-serif; color: var(--pk-lilac2); }
.pk-count { font: 800 13px/1 var(--pk-round), sans-serif; color: var(--pk-deeper); background: #fff; padding: 7px 12px; border-radius: 999px; box-shadow: 0 3px 0 var(--pk-soft); }

/* ── buttons ──────────────────────────────────────────────────────────── */
.pk-btn { appearance: none; border: 0; cursor: pointer; border-radius: 999px; min-height: 54px; padding: 14px 30px; font: 800 19px/1 var(--pk-round), sans-serif;
  color: #fff; background: linear-gradient(180deg, #FF9C80, #FF7A57); box-shadow: 0 5px 0 var(--pk-deeper), 0 12px 26px rgba(201,74,44,.28);
  transition: transform .12s, box-shadow .12s, opacity .2s; -webkit-tap-highlight-color: transparent; }
.pk-btn:active { transform: translateY(3px) scale(.97); box-shadow: 0 2px 0 var(--pk-deeper), 0 6px 14px rgba(201,74,44,.25); }
.pk-btn-lilac { background: linear-gradient(180deg, #AF8DFF, #9068F5); box-shadow: 0 5px 0 #5B36C4, 0 12px 26px rgba(91,54,196,.28); }
.pk-btn-lilac:active { box-shadow: 0 2px 0 #5B36C4, 0 6px 14px rgba(91,54,196,.25); }
.pk-btn-soft { color: var(--pk-deeper); background: #fff; border: 2px solid var(--pk-soft); box-shadow: 0 4px 0 var(--pk-soft), 0 10px 20px rgba(224,96,63,.14); }
.pk-btn:disabled { opacity: .55; cursor: default; transform: none; }
.pk-btn:focus-visible, .pk-link:focus-visible, .pk-jar:focus-visible, .pk-hookGrab:focus-visible, .pk-bead.tray:focus-visible, .pk-flip:focus-visible,
.pk-chip:focus-visible, .pk-card:focus-visible, .pk-diaryLock:focus-visible, .pk-starChip:focus-visible, .pk-psEnv:focus-visible { outline: 3px solid var(--pk-lilac2); outline-offset: 4px; }
.pk-link { appearance: none; border: 0; background: none; cursor: pointer; min-height: 44px; padding: 8px 14px; font: 700 15px/1.2 var(--pk-round), sans-serif;
  color: var(--pk-ink2); text-decoration: underline; text-decoration-color: var(--pk-soft); text-underline-offset: 4px; }

/* ── stickers, polaroids, washi, bubbles ──────────────────────────────── */
.pk-gif { position: relative; display: inline-grid; place-items: center; flex: none;
  filter: drop-shadow(0 0 0 #fff) drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 6px 10px rgba(201,74,44,.18)); }
.pk-gif img { width: 100%; height: 100%; object-fit: contain; user-select: none; pointer-events: none; }
.pk-pol { position: relative; margin: 0; background: #fff; padding: 10px 10px 0; border-radius: 6px; box-shadow: 0 16px 34px -12px rgba(201,74,44,.35), 0 2px 0 rgba(201,74,44,.06); }
.pk-pol-ph { position: relative; aspect-ratio: 4 / 5; border-radius: 3px; overflow: hidden; background: #FFEDE2; }
.pk-pol-empty { position: absolute; inset: 0; display: grid; place-items: center; font-size: 48px; }
.pk-pol figcaption { display: grid; gap: 4px; padding: 8px 6px 12px; min-height: 44px; }
.pk-cap { font: 700 18px/1.2 var(--pk-hand), cursive; color: var(--pk-ink); }
.pk-tape { position: absolute; top: -12px; left: 50%; width: 92px; height: 26px; transform: translateX(-50%) rotate(-4deg); z-index: 2; opacity: .9;
  clip-path: polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 4% 96%, 0 50%); }
.pk-tape-peach { background: repeating-linear-gradient(45deg, #FFB59E 0 8px, #FFD3B8 8px 16px); }
.pk-tape-lilac { background: repeating-linear-gradient(45deg, #C9B6FF 0 8px, #DCCBFF 8px 16px); }
.pk-tape-mint { background: repeating-linear-gradient(45deg, #9FE5C8 0 8px, #C8F2DF 8px 16px); }
.pk-bubble { position: relative; margin: 0; max-width: 310px; background: #fff; color: var(--pk-ink); border-radius: 22px; padding: 14px 18px;
  font: 700 21px/1.3 var(--pk-hand), cursive; box-shadow: 0 10px 24px -8px rgba(201,74,44,.3); border: 2px solid var(--pk-soft); }
.pk-bubble::before { content: ""; position: absolute; top: -11px; left: 50%; width: 20px; height: 20px; background: #fff; border-left: 2px solid var(--pk-soft); border-top: 2px solid var(--pk-soft);
  transform: translateX(-50%) rotate(45deg); border-radius: 4px 0 0 0; }
.pk-bubble.small { font-size: 18px; padding: 10px 14px; }
.pk-sticky { margin: 0; max-width: 300px; background: #FFF3B0; color: #5A4520; padding: 14px 18px; border-radius: 4px 18px 4px 18px; font: 700 20px/1.3 var(--pk-hand), cursive;
  box-shadow: 0 12px 22px -10px rgba(120,90,20,.35); }
.pk-pop { animation: pk-pop .5s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes pk-pop { from { opacity: 0; transform: scale(.5) rotate(-6deg); } to { opacity: 1; transform: none; } }
.pk-tapHint { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); background: var(--pk-lilac2); color: #fff; font: 800 13px/1 var(--pk-round), sans-serif;
  padding: 7px 12px; border-radius: 999px; letter-spacing: .04em; box-shadow: 0 3px 0 #5B36C4; animation: pk-bob 1.6s ease-in-out infinite; pointer-events: none; white-space: nowrap; z-index: 5; }
@keyframes pk-bob { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -6px); } }
@keyframes pk-float { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-7px) rotate(3deg); } }
@keyframes pk-glow { 0%, 100% { transform: scale(.92); opacity: .85; } 50% { transform: scale(1.08); opacity: 1; } }
@keyframes pk-shake { 0% { transform: translate(0,0) rotate(0); } 25% { transform: translate(-2px,1px) rotate(-3deg); } 75% { transform: translate(2px,-1px) rotate(3deg); } }

/* ── the gate (PremiumGate around the two pinkies) ────────────────────── */
.pk-gate { color: var(--pk-ink, #5E3226); }
.pk-gate .pm-bar { display: none; }
.pk-gate .pm-gateKick { color: #C94A2C; opacity: 1; letter-spacing: .18em; font-weight: 800; }
.pk-gate .pm-gateName { font: 700 clamp(52px, 15vw, 84px)/1 var(--pk-hand), cursive !important; color: #5E3226; }
.pk-gate .pm-gateName * { background: none !important; -webkit-text-fill-color: currentColor !important; color: inherit !important; }
.pk-gate .pm-gateSub { color: #8A5A4A; opacity: 1; font-family: var(--pk-round), sans-serif; }
.pk-gateSub { display: grid; gap: 2px; font: 700 17px/1.35 var(--pk-round), sans-serif; }
.pk-gateSub small { font: 700 20px/1.2 var(--pk-hand), cursive; color: #E0603F; }
.pk-gate .pm-gateArt { width: min(230px, 58vw); max-height: 34vh; aspect-ratio: 230 / 290; filter: none; }
.pk-gate .pm-gateCta { border-radius: 999px; font: 800 19px/1 var(--pk-round), sans-serif; color: #fff; background: linear-gradient(180deg, #FF9C80, #FF7A57);
  box-shadow: 0 5px 0 #C94A2C, 0 12px 26px rgba(201,74,44,.28); border: 0; }
.pk-gate .pm-seal, .pk-gate .pm-quiet { color: #8A5A4A; }
@media (max-height: 700px) { .pk-gate .pm-gateArt { max-height: 28vh; } }
.pk-gateArt { position: relative; width: 100%; height: 100%; }
.pk-gateHand { position: absolute; width: 40%; height: auto; }
.pk-gateHand.him { left: 18%; top: -2%; transform: rotate(180deg); animation: pk-gateHim 2.6s ease-in-out infinite; }
.pk-gateHand.her { left: 34%; bottom: -2%; animation: pk-gateHer 2.6s ease-in-out infinite; }
@keyframes pk-gateHim { 0%, 100% { transform: rotate(180deg) translateY(0); } 50% { transform: rotate(180deg) translateY(-8px); } }
@keyframes pk-gateHer { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.pk-gateHeart { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: #FF4D6D; font-size: 30px; animation: pk-beat 1.6s ease-in-out infinite; text-shadow: 0 0 0 #fff, 0 3px 10px rgba(255,77,109,.35); }
@keyframes pk-beat { 0%, 40%, 100% { transform: translate(-50%, -50%) scale(1); } 10% { transform: translate(-50%, -50%) scale(1.22); } 20% { transform: translate(-50%, -50%) scale(1); } 30% { transform: translate(-50%, -50%) scale(1.12); } }
.pk-gateSticker { position: absolute !important; right: -24px; top: 4%; z-index: 3; transform: rotate(10deg); animation: pk-float 3.2s ease-in-out infinite; }

/* ── the pinky hook ───────────────────────────────────────────────────── */
.pk-hookStage { position: relative; width: 100%; max-width: 330px; height: 380px; border-radius: 34px; overflow: hidden; margin-top: 4px;
  background: radial-gradient(120% 70% at 50% 45%, #FFFFFF 0%, #FFF1E6 60%, #FFE4D2 100%); border: 3px dashed #FFD3B8; }
.pk-hookHand { position: absolute; width: 120px; height: 200px; }
.pk-hookHand.him { left: calc(50% - 83.5px); top: -30px; transform-origin: 60px 100px; transition: transform .45s cubic-bezier(.34,1.56,.64,1); }
.pk-hookGrab { position: absolute; left: calc(50% - 36.5px); top: 232px; width: 120px; height: 200px; touch-action: none; cursor: grab; z-index: 2; -webkit-tap-highlight-color: transparent; }
.pk-hookGrab.is-drag { cursor: grabbing; }
.pk-hookGrab .pk-hookHand { position: static; display: block; }
.pk-hookTrail { position: absolute; left: 50%; top: 146px; width: 4px; height: 112px; margin-left: -2px; border-radius: 4px;
  background: repeating-linear-gradient(180deg, #E0603F 0 6px, transparent 6px 12px); opacity: .55; transition: opacity .3s; }
.pk-joint { position: absolute; left: 50%; top: 124px; margin-left: -19px; z-index: 4; transform: scale(0); transition: transform .5s cubic-bezier(.34,1.8,.64,1) .1s; }
.pk-joint.on { transform: scale(1); animation: pk-jointBeat 1.6s ease-in-out .6s infinite; }
@keyframes pk-jointBeat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.25); } 30% { transform: scale(1); } }
.pk-hookName { position: absolute; font: 700 18px/1 var(--pk-hand), cursive; color: var(--pk-ink2); background: rgba(255,255,255,.85); padding: 4px 10px; border-radius: 999px; z-index: 3; }
.pk-hookName.him { right: 14px; top: 16px; }
.pk-hookName.her { left: 14px; bottom: 16px; }
.pk-hookGif { position: absolute !important; left: 10px; top: 128px; z-index: 5; transform: rotate(-8deg); }
.pk-say { display: grid; justify-items: center; align-content: start; gap: 12px; margin-top: 6px; min-height: 130px; }
.pk-sayGif { margin-bottom: -6px; }

/* ── the promise jar ──────────────────────────────────────────────────── */
.pk-noteZone { position: relative; width: 100%; max-width: 330px; min-height: 150px; display: grid; place-items: center; }
.pk-note { position: relative; width: 100%; background: #fff; border-radius: 20px; padding: 26px 18px 16px; display: grid; justify-items: center; gap: 6px;
  box-shadow: 0 14px 30px -14px rgba(201,74,44,.45); border: 2px solid #FFE4D2;
  background-image: radial-gradient(circle at 12px 12px, #FFE4D2 2px, transparent 2.5px); background-size: 22px 22px; }
.pk-note.is-big { border-color: #FFD27A; box-shadow: 0 0 0 6px rgba(255,210,122,.35), 0 18px 34px -14px rgba(217,147,43,.55); }
.pk-noteStar { position: absolute; top: -18px; left: 50%; margin-left: -18px; }
.pk-noteNo { font: 800 11px/1 var(--pk-round), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--pk-deeper); }
.pk-note.is-big .pk-noteNo { color: #B5761A; }
.pk-noteText { margin: 0; font: 700 22px/1.3 var(--pk-hand), cursive; color: var(--pk-ink); }
.pk-noteEmpty { margin: 0; font: 700 20px/1 var(--pk-hand), cursive; color: var(--pk-ink2); animation: pk-bobY 1.6s ease-in-out infinite; }
@keyframes pk-bobY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
.pk-jarRow { position: relative; display: flex; align-items: flex-end; justify-content: center; width: 100%; }
.pk-jarGif { position: absolute; left: max(0px, calc(50% - 168px)); bottom: 6px; z-index: 3; }
.pk-jar { all: unset; position: relative; width: 168px; height: 200px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.pk-jar:disabled { cursor: default; }
.pk-jarWob { position: absolute; inset: 0; animation: pk-jarWob .45s ease-out; transform-origin: 50% 90%; }
@keyframes pk-jarWob { 0% { transform: rotate(0); } 20% { transform: rotate(-8deg) translateY(-4px); } 45% { transform: rotate(7deg); } 70% { transform: rotate(-4deg); } 100% { transform: rotate(0); } }
.pk-jarGlass { position: absolute; left: 10px; right: 10px; top: 40px; bottom: 0; border-radius: 34px 34px 40px 40px;
  background: linear-gradient(100deg, rgba(255,255,255,.75) 0%, rgba(255,255,255,.35) 22%, rgba(255,241,230,.45) 60%, rgba(255,255,255,.7) 100%);
  border: 3px solid rgba(224,96,63,.35); box-shadow: inset 0 -10px 0 rgba(255,211,184,.45), 0 16px 30px -14px rgba(201,74,44,.45); overflow: hidden; }
.pk-jarGlass::after { content: ""; position: absolute; left: 14px; top: 16px; width: 12px; height: 60%; border-radius: 10px; background: rgba(255,255,255,.75); }
.pk-jarStar { position: absolute; }
.pk-jarLid { position: absolute; left: 4px; right: 4px; top: 18px; height: 34px; z-index: 2; border-radius: 16px 16px 10px 10px;
  background: repeating-linear-gradient(90deg, #FF8A6B 0 12px, #FFB59E 12px 24px), #FF8A6B;
  background-blend-mode: normal; box-shadow: inset 0 -5px 0 rgba(0,0,0,.08), 0 4px 0 #E0603F; }
.pk-jarLid::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: repeating-linear-gradient(0deg, rgba(255,255,255,.35) 0 6px, transparent 6px 12px); }
.pk-jarBow { position: absolute; left: 50%; top: 4px; width: 46px; height: 28px; margin-left: -23px; z-index: 3;
  background: radial-gradient(circle at 50% 55%, #A07BFF 0 6px, transparent 7px),
    radial-gradient(ellipse 13px 10px at 25% 50%, #C9B6FF 0 98%, transparent 100%),
    radial-gradient(ellipse 13px 10px at 75% 50%, #C9B6FF 0 98%, transparent 100%); }
.pk-jarTag { position: absolute; right: -26px; top: 60px; z-index: 3; transform: rotate(12deg); background: #FFF3B0; color: #5A4520; font: 700 15px/1 var(--pk-hand), cursive;
  padding: 7px 10px 7px 16px; border-radius: 4px 10px 10px 4px; box-shadow: 0 4px 10px rgba(120,90,20,.25); }
.pk-jarTag::before { content: ""; position: absolute; left: 5px; top: 50%; width: 6px; height: 6px; margin-top: -3px; border-radius: 50%; background: #fff; box-shadow: inset 0 0 0 1.5px #C9A44A; }
.pk-starRow { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px; }
.pk-starChip { appearance: none; border: 0; background: none; padding: 6px; min-width: 36px; min-height: 36px; cursor: pointer; transition: transform .3s; }
.pk-starChip:disabled { cursor: default; }
.pk-starChip.cur { transform: scale(1.25) rotate(12deg); }

/* ── the club rules (membership form + signature) ─────────────────────── */
.pk-form { position: relative; width: 100%; max-width: 350px; background: #fff; border-radius: 26px; padding: 24px 20px 18px; margin-top: 10px; text-align: left;
  box-shadow: 0 22px 44px -20px rgba(201,74,44,.5); border: 3px solid #fff; outline: 2px dashed var(--pk-soft); outline-offset: -11px; }
.pk-formGif { position: absolute !important; right: -16px; top: -40px; transform: rotate(8deg); z-index: 3; }
.pk-formKick { margin: 0 0 6px; font: 800 11px/1.2 var(--pk-round), sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--pk-deeper); max-width: 70%; }
.pk-formFor { margin: 0 0 8px; font: 600 16px/1.3 var(--pk-round), sans-serif; color: var(--pk-ink2); }
.pk-formFor b { font: 700 24px/1 var(--pk-hand), cursive; color: var(--pk-ink); }
.pk-rules { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.pk-rules li { display: grid; grid-template-columns: 26px 1fr; gap: 8px; align-items: start; font: 700 18px/1.3 var(--pk-hand), cursive; color: var(--pk-ink); }
.pk-ruleNo { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--pk-mint); color: #1F5C45; font: 800 13px/1 var(--pk-round), sans-serif; margin-top: 1px; }
.pk-padWrap { position: relative; margin-top: 14px; border-radius: 16px; background: #FFF8F1; border: 2px dashed #FFB59E; }
.pk-padWrap.is-signed { border-color: transparent; background: transparent; }
.pk-sigPad { width: 100%; touch-action: none; cursor: crosshair; border-radius: 14px; }
.pk-sigName { margin: 0; padding: 18px 0 22px; text-align: center; font: 700 40px/1 var(--pk-hand), cursive; color: #5B36C4; }
.pk-padHint { position: absolute; inset: 0; display: grid; place-items: center; font: 700 15px/1 var(--pk-round), sans-serif; color: #C98270; pointer-events: none; }
.pk-padLine { position: absolute; left: 14px; right: 14px; bottom: 26px; height: 2px; background: #FFD3B8; pointer-events: none; }
.pk-padWho { position: absolute; right: 14px; bottom: 6px; font: 600 11px/1 var(--pk-round), sans-serif; color: var(--pk-ink2); pointer-events: none; }
.pk-approved { position: absolute; left: 50%; bottom: 38px; margin-left: -96px; width: 192px; text-align: center; padding: 8px 10px; border: 4px solid #FF4D6D; border-radius: 14px;
  color: #FF4D6D; font: 800 26px/1 var(--pk-round), sans-serif; letter-spacing: .06em; background: rgba(255,255,255,.4); mix-blend-mode: multiply; pointer-events: none; }
.pk-afterStamp { display: grid; justify-items: center; gap: 2px; }

/* ── the bracelet ─────────────────────────────────────────────────────── */
.pk-cordCard { position: relative; width: 100%; max-width: 340px; height: 170px; margin-top: 12px; border-radius: 26px; background: #fff;
  box-shadow: 0 18px 36px -18px rgba(201,74,44,.45); overflow: hidden; }
.pk-cord { position: absolute; left: 10px; right: 10px; top: 30px; width: calc(100% - 20px); height: 90px; }
.pk-endBead { position: absolute; top: 37px; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #FFB3D6; color: #D63F72;
  font-size: 16px; box-shadow: inset 0 -3px 0 rgba(0,0,0,.08); z-index: 2; }
.pk-endBead.l { left: 6px; } .pk-endBead.r { right: 6px; }
.pk-slots { position: absolute; inset: 0; z-index: 2; }
.pk-slotSpot { position: absolute; width: 40px; height: 40px; margin: -20px 0 0 -20px; display: grid; place-items: center; }
.pk-bead { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font: 800 19px/1 var(--pk-round), sans-serif; color: var(--pk-ink);
  box-shadow: inset 0 -4px 0 rgba(0,0,0,.1), inset 0 3px 0 rgba(255,255,255,.55), 0 4px 8px -3px rgba(94,50,38,.35); }
.pk-bead.ghost { background: transparent; border: 2px dashed #FFC9AE; color: #F0B49E; box-shadow: none; font-size: 16px; }
.pk-bead.gone { visibility: hidden; }
.pk-bead.tray { appearance: none; border: 0; cursor: pointer; width: 50px; height: 50px; font-size: 22px; -webkit-tap-highlight-color: transparent; }
.pk-bead.tray:disabled { cursor: default; }
.pk-bead.is-nope { animation: pk-nope .5s ease; }
@keyframes pk-nope { 0%, 100% { transform: none; } 20% { transform: translateX(-7px) rotate(-8deg); } 45% { transform: translateX(7px) rotate(8deg); } 70% { transform: translateX(-4px); } }
.pk-tray { transition: opacity .4s; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; max-width: 330px; margin-top: 4px; }
.pk-bow { position: absolute; left: 50%; bottom: 6px; margin-left: -32px; z-index: 3; }
.pk-shine { position: absolute; inset: 0; z-index: 4; pointer-events: none; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.85) 48%, transparent 66%);
  transform: translateX(-120%); animation: pk-shine 1.4s .3s ease-out forwards; }
@keyframes pk-shine { to { transform: translateX(120%); } }
.pk-brSay { min-height: 104px; display: grid; place-items: center; }

/* ── the diary ────────────────────────────────────────────────────────── */
.pk-diary { position: relative; width: 236px; height: 300px; margin-top: 22px; }
.pk-diaryPages { position: absolute; left: 14px; right: -8px; top: 8px; bottom: -6px; border-radius: 8px 18px 18px 8px; background: repeating-linear-gradient(180deg, #fff 0 3px, #F4E6DC 3px 4px);
  box-shadow: 0 18px 34px -16px rgba(91,54,196,.45); }
.pk-diaryCover { position: absolute; inset: 0; border-radius: 10px 22px 22px 10px; background: linear-gradient(160deg, #C9B6FF, #A07BFF); padding: 40px 24px; display: grid; align-content: start; gap: 14px;
  box-shadow: inset 10px 0 0 rgba(91,54,196,.25), inset 0 -6px 0 rgba(91,54,196,.15); }
.pk-diaryLabel { background: #fff; border-radius: 14px; padding: 12px 10px; font: 600 15px/1.3 var(--pk-round), sans-serif; color: var(--pk-ink2); text-align: center; box-shadow: 0 4px 0 rgba(91,54,196,.2); }
.pk-diaryLabel b { font: 700 24px/1.1 var(--pk-hand), cursive; color: #5B36C4; }
.pk-diaryLabel small { font: 700 15px/1.2 var(--pk-hand), cursive; color: var(--pk-deep); }
.pk-diaryHearts { color: #fff; letter-spacing: .4em; font-size: 18px; text-align: center; opacity: .85; }
.pk-strap { position: absolute; right: -10px; top: 150px; width: 70px; height: 34px; border-radius: 10px; background: #FF8A6B; box-shadow: inset 0 -4px 0 rgba(0,0,0,.1); }
.pk-diaryLock { all: unset; position: absolute; right: -14px; top: 136px; z-index: 3; cursor: pointer; filter: drop-shadow(0 6px 8px rgba(201,74,44,.35)); animation: pk-lockBeat 2.4s ease-in-out infinite; }
@keyframes pk-lockBeat { 0%, 40%, 100% { transform: scale(1); } 10% { transform: scale(1.12) rotate(-4deg); } 20% { transform: scale(1); } 30% { transform: scale(1.06) rotate(3deg); } }
.pk-diaryLock .pk-dShackle { transition: transform .35s cubic-bezier(.34,1.56,.64,1) .65s; }
.pk-diaryLock.is-turning { animation: none; }
.pk-diaryLock.is-turning .pk-dShackle { transform: translateY(-6px); }
.pk-diaryKey { position: absolute; right: -66px; top: 148px; z-index: 4; }
.pk-diaryKey > span { display: block; transform: scaleX(-1); }
.pk-diaryGif { position: absolute !important; left: -30px; top: -34px; transform: rotate(-10deg); z-index: 4; }
.pk-page { position: relative; width: 100%; max-width: 370px; background: #fff; border-radius: 6px 22px 22px 6px; padding: 22px 18px 18px 34px; text-align: left; transform-origin: left center;
  box-shadow: 0 20px 40px -18px rgba(91,54,196,.4), inset 8px 0 0 #EDE3FF;
  background-image: linear-gradient(90deg, transparent 26px, #FFC2B0 26px, #FFC2B0 28px, transparent 28px), repeating-linear-gradient(180deg, transparent 0 31px, #FFE4D2 31px 32px);
  background-position: 0 0, 0 14px; }
.pk-pageIn { max-height: min(46vh, 430px); overflow-y: auto; overscroll-behavior: contain; padding-right: 4px; }
.pk-letterText { font: 400 19px/32px var(--pk-hand), cursive !important; color: var(--pk-ink); }
.pk-sign { margin: 10px 0 0; text-align: right; font: 700 22px/1.2 var(--pk-hand), cursive; color: var(--pk-deep); }
.pk-pageGif { position: absolute !important; right: -14px; top: -28px; transform: rotate(8deg); z-index: 2; }
.pk-pageClip { position: absolute; left: 50%; top: -10px; width: 90px; height: 24px; margin-left: -45px; transform: rotate(-3deg);
  background: repeating-linear-gradient(45deg, #9FE5C8 0 8px, #C8F2DF 8px 16px); opacity: .9; clip-path: polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 4% 96%, 0 50%); }

/* ── the cassette (voice) ─────────────────────────────────────────────── */
.pk-cassette { position: relative; width: min(300px, 82vw); aspect-ratio: 1.6; margin-top: 18px; border-radius: 20px; background: linear-gradient(180deg, #FFB59E, #FF8A6B);
  padding: 14px 16px; display: grid; align-content: space-between; box-shadow: inset 0 -6px 0 rgba(0,0,0,.08), 0 22px 40px -18px rgba(201,74,44,.6); }
.pk-casLabel { background: #FFF8F1; border-radius: 8px; padding: 6px 8px; font: 700 15px/1.2 var(--pk-hand), cursive; color: var(--pk-ink); }
.pk-casLabel b { font: 800 11px/1 var(--pk-round), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: var(--pk-deeper); }
.pk-casWin { justify-self: center; display: flex; align-items: center; gap: 10px; background: #5E3226; border-radius: 999px; padding: 8px 14px; }
.pk-reel { width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle, #5E3226 0 5px, #FFF8F1 6px 9px, transparent 10px),
  conic-gradient(#FFF8F1 0 30deg, #FFE4D2 30deg 60deg, #FFF8F1 60deg 90deg, #FFE4D2 90deg 120deg, #FFF8F1 120deg 150deg, #FFE4D2 150deg 180deg, #FFF8F1 180deg 210deg, #FFE4D2 210deg 240deg, #FFF8F1 240deg 270deg, #FFE4D2 270deg 300deg, #FFF8F1 300deg 330deg, #FFE4D2 330deg 360deg); }
.pk-cassette.is-playing .pk-reel { animation: pk-spin 1.6s linear infinite; }
@keyframes pk-spin { to { transform: rotate(360deg); } }
.pk-casBand { width: 60px; height: 14px; border-radius: 4px; background: #8A5A4A; }
.pk-casFrom { font: 700 14px/1 var(--pk-round), sans-serif; color: #fff; text-align: center; }
.pk-casGif { position: absolute !important; right: -24px; top: -70px; transform: rotate(10deg); }
.pk-vnCard { width: min(320px, 86vw); background: #fff; border-radius: 22px; padding: 12px; box-shadow: 0 14px 30px -16px rgba(201,74,44,.45); }
.pk-vn { width: 100%; --vw-glass: #FFF8F1; --vw-edge: #FFE4D2; --vw-ink: #5E3226; }
.pk-vn .pk-hand { font-size: 18px; }
.pk-vn .pm-vnLabel { text-transform: none; letter-spacing: 0; font: 700 18px/1.25 var(--pk-hand), cursive; color: var(--pk-deep); }
.pk-vn .pm-vnTx, .pk-vn .pm-vnCap { font: 400 18px/1.4 var(--pk-hand), cursive !important; font-style: normal !important; color: var(--pk-ink); }

/* ── promises in photos ───────────────────────────────────────────────── */
.pk-track { display: flex; gap: 18px; width: calc(100% + 32px); margin: 0 -16px; padding: 22px 15% 26px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
  overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; }
.pk-track::-webkit-scrollbar { display: none; }
.pk-laneCard { flex: none; width: 70%; max-width: 260px; scroll-snap-align: center; }
.pk-flip { position: absolute; right: -14px; bottom: 34px; width: 62%; min-height: 96px; padding: 0; border: 0; cursor: pointer; background: none; box-shadow: none; perspective: 700px; z-index: 3;
  transform: rotate(var(--tilt)); -webkit-tap-highlight-color: transparent; }
.pk-flipFace { position: absolute; inset: 0; display: grid; place-content: center; gap: 4px; padding: 10px; border-radius: 3px 3px 14px 3px; backface-visibility: hidden;
  -webkit-backface-visibility: hidden; transition: transform .6s cubic-bezier(.34,1.3,.5,1); box-shadow: 0 10px 18px -8px rgba(120,90,20,.45); text-align: center; }
.pk-flipFace.front { background: #FFF3B0; color: #5A4520; font: 700 18px/1.2 var(--pk-hand), cursive; }
.pk-flipFace.front small { font: 800 11px/1 var(--pk-round), sans-serif; letter-spacing: .08em; color: #B08A2E; text-transform: uppercase; }
.pk-flipFace.back { background: #C8F2DF; color: #1F4A3A; font: 700 15px/1.25 var(--pk-hand), cursive; transform: rotateY(180deg); }
.pk-flip.is-flipped .pk-flipFace.front { transform: rotateY(-180deg); }
.pk-flip.is-flipped .pk-flipFace.back { transform: rotateY(0); }
.pk-flip:not(.is-flipped) .pk-flipFace.front { animation: pk-peel 2.8s ease-in-out infinite; }
@keyframes pk-peel { 0%, 70%, 100% { transform: rotate(0); } 78% { transform: rotate(-5deg); } 86% { transform: rotate(4deg); } }
.pk-laneGif { min-height: 96px; display: grid; place-items: center; margin-top: -6px; }

/* ── the love lock + the lantern sky (the money moment) ───────────────── */
.pk-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 360px; }
.pk-chip { appearance: none; cursor: pointer; border: 2px solid var(--pk-soft); background: #fff; color: var(--pk-ink); border-radius: 999px; padding: 10px 14px; min-height: 44px;
  font: 700 15px/1.2 var(--pk-round), sans-serif; box-shadow: 0 3px 0 var(--pk-soft); transition: transform .15s, background .2s, border-color .2s; -webkit-tap-highlight-color: transparent; }
.pk-chip:active { transform: scale(.96); }
.pk-chip.on { background: #E8FFF5; border-color: #5CCB9F; color: #1F4A3A; box-shadow: 0 3px 0 #5CCB9F; }
.pk-chip span { font-weight: 800; }
.pk-pickArea { width: 100%; display: grid; gap: 12px; justify-items: center; margin-top: auto; transition: opacity .4s; }
.pk-lockStage { position: relative; z-index: 2; width: 100%; display: grid; place-items: center; min-height: 210px; margin-top: 4px; }
.pk-lockWrap { position: relative; display: grid; place-items: center; }
.pk-lockWrap.is-rolling { animation: pk-shake .12s linear infinite; }
.pk-lockWrap.is-locked { transform: scale(1.08); transition: transform .6s cubic-bezier(.34,1.56,.64,1); }
.pk-lockWrap.is-locked::before { content: ""; position: absolute; inset: -30px; border-radius: 50%; background: radial-gradient(circle, rgba(255,241,201,.95), rgba(255,210,122,.45) 45%, transparent 70%);
  animation: pk-glow 1.8s ease-in-out infinite; z-index: -1; }
.pk-lockArt .pk-shackle { transition: transform .35s cubic-bezier(.5,1.8,.6,1); transform-origin: 86px 66px; }
.pk-lockArt.is-open .pk-shackle { transform: translateY(-12px) rotate(-14deg); }
.pk-lockGif { position: absolute; right: max(0px, calc(50% - 176px)); bottom: 0; transition: opacity .3s; }
.pk-flyKey { position: absolute; left: 50%; top: 58%; margin-left: -22px; z-index: 4; }
.pk-keyTrail { position: absolute; right: 30px; top: 20px; width: 90px; height: 5px; border-radius: 5px; background: linear-gradient(90deg, transparent, #FFE27A); transform: rotate(35deg); transform-origin: right center; }
.pk-wall { position: absolute; z-index: 2; }
.pk-lockedTitle { color: var(--pk-deeper); text-shadow: 0 2px 0 #fff, 0 0 16px rgba(255,255,255,.95), 0 0 30px rgba(255,255,255,.8); }
.pk-lockScene.is-locked .pk-kicker { text-shadow: 0 0 10px #fff, 0 0 18px #fff; }
.pk-lockedTitle > span { font: 700 clamp(34px, 9.6vw, 46px)/1.05 var(--pk-hand), cursive; }
.pk-lockedSay { display: grid; justify-items: center; align-content: start; gap: 16px; margin-top: 70px; min-height: 140px; position: relative; z-index: 3; }
.pk-lockedSay .pk-bubble { max-width: 290px; font-size: 20px; }
.pk-sky { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
.pk-lantern { position: absolute; bottom: -150px; width: calc(92px * var(--s)); min-height: calc(112px * var(--s)); display: grid; place-items: center; padding: 22px 8px 16px;
  border-radius: 40% 40% 34% 34% / 30% 30% 24% 24%; background: radial-gradient(70% 60% at 50% 55%, #FFF6D8 0%, #FFD27A 55%, #FF9E6B 100%);
  box-shadow: 0 0 26px 6px rgba(255,200,110,.75), 0 0 60px 10px rgba(255,170,110,.35); animation: pk-lanternUp var(--d) linear var(--dl) infinite; opacity: 0; will-change: transform; }
.pk-lantern i { position: absolute; left: 22%; right: 22%; top: 6px; height: 8px; border-radius: 4px; background: #C94A2C; opacity: .7; }
.pk-lantern::after { content: ""; position: absolute; left: 30%; right: 30%; bottom: 6px; height: 7px; border-radius: 4px; background: #C94A2C; opacity: .6; }
.pk-lantern > span { font: 700 calc(12.5px * var(--s))/1.2 var(--pk-hand), cursive; color: #6B2E14; text-align: center; overflow-wrap: anywhere; }
.pk-lantern.her { background: radial-gradient(70% 60% at 50% 55%, #F2FFF9 0%, #C8F2DF 55%, #8FD9B8 100%); box-shadow: 0 0 26px 6px rgba(160,240,200,.7), 0 0 60px 10px rgba(160,123,255,.3); }
.pk-lantern.her > span { color: #1F4A3A; }
.pk-lantern.big { background: radial-gradient(70% 60% at 50% 55%, #FFFDF0 0%, #FFE27A 55%, #FFB347 100%); }
@keyframes pk-lanternUp { 0% { transform: translate3d(0, 0, 0) rotate(-3deg); opacity: 0; } 8% { opacity: .95; }
  50% { transform: translate3d(16px, -60vh, 0) rotate(3deg); } 92% { opacity: .9; } 100% { transform: translate3d(-8px, calc(-100vh - 260px), 0) rotate(-2deg); opacity: 0; } }

/* ── the membership card ──────────────────────────────────────────────── */
.pk-cardScene { gap: 10px; }
.pk-lanyard { position: relative; width: 100%; height: 40px; margin: 2px 0 -18px; z-index: 3; pointer-events: none; }
.pk-strapL { position: absolute; left: 50%; top: 0; width: 26px; height: 30px; margin-left: -13px; background: repeating-linear-gradient(180deg, #A07BFF 0 10px, #C9B6FF 10px 20px); border-radius: 4px; }
.pk-clip { position: absolute; left: 50%; top: 24px; width: 36px; height: 20px; margin-left: -18px; border-radius: 6px; background: linear-gradient(180deg, #FFF0B8, #D9A441); box-shadow: 0 3px 6px rgba(0,0,0,.2); }
.pk-cardWrap { position: relative; width: 100%; max-width: 350px; transform-origin: 50% 0; }
.pk-cardGif { position: absolute !important; z-index: 4; pointer-events: none; }
.pk-cardGif.tr { right: -18px; top: 30px; transform: rotate(10deg); }
.pk-cardGif.bl { left: -20px; bottom: -40px; transform: rotate(-8deg); }
.pk-card { appearance: none; border: 0; background: none; padding: 0; cursor: pointer; display: block; width: 100%; position: relative; perspective: 1200px; min-height: 450px; color: inherit; font: inherit; text-align: left;
  -webkit-tap-highlight-color: transparent; }
.pk-cardFace { position: absolute; inset: 0; border-radius: 26px; background: #fff; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  transition: transform .7s cubic-bezier(.34,1.2,.5,1); box-shadow: 0 26px 50px -24px rgba(201,74,44,.55); border: 3px solid #fff; display: flex; flex-direction: column; }
.pk-cardFace.back { transform: rotateY(180deg); padding: 22px 20px; gap: 6px; background: #FFF8F1; background-image: radial-gradient(circle at 12px 12px, #FFE4D2 2px, transparent 2.5px); background-size: 22px 22px; }
.pk-card.is-flipped .pk-cardFace.front { transform: rotateY(-180deg); }
.pk-card.is-flipped .pk-cardFace.back { transform: rotateY(0); }
.pk-cardBand { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: linear-gradient(135deg, #FF9C80, #FF7A57); color: #fff; }
.pk-cardBand b { display: block; font: 800 19px/1.1 var(--pk-round), sans-serif; letter-spacing: .02em; }
.pk-cardBand small { display: block; font: 700 12px/1.2 var(--pk-round), sans-serif; opacity: .92; }
.pk-cardLogo { width: 40px; height: 40px; border-radius: 50%; background: #fff; display: grid; place-items: center; overflow: hidden; flex: none; }
.pk-cardLogo svg { display: block; }
.pk-cardBody { display: grid; grid-template-columns: 112px 1fr; gap: 14px; padding: 16px 16px 8px; align-items: center; }
.pk-cardPhoto { position: relative; width: 112px; aspect-ratio: 4 / 5; border-radius: 16px; overflow: hidden; background: #FFEDE2; border: 4px solid #FFE4D2; transform: rotate(-3deg); }
.pk-cardNoPh { position: absolute; inset: 0; display: grid; place-items: center; font-size: 40px; }
.pk-cardWho { display: grid; gap: 3px; min-width: 0; }
.pk-cardName { font: 700 32px/1.05 var(--pk-hand), cursive; color: var(--pk-ink); overflow-wrap: anywhere; }
.pk-cardMeta { font: 700 13px/1.25 var(--pk-round), sans-serif; color: var(--pk-ink2); }
.pk-cardMeta:first-of-type { color: var(--pk-deeper); }
.pk-cardPromised { margin: 4px 16px 0; padding: 10px 12px; border-radius: 16px; background: #FFF4EC; display: grid; gap: 3px; }
.pk-cardPromised small { font: 800 10.5px/1 var(--pk-round), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--pk-deeper); }
.pk-cardPromised span { font: 700 15.5px/1.25 var(--pk-hand), cursive; color: var(--pk-ink); }
.pk-cardStats { margin: 10px 16px 0; display: flex; flex-wrap: wrap; gap: 6px; }
.pk-cardStats span { font: 700 12.5px/1 var(--pk-round), sans-serif; color: var(--pk-ink2); background: #F4EEFF; border-radius: 999px; padding: 6px 9px; }
.pk-cardFoot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 16px 30px; margin-top: auto; }
.pk-cardBeads { display: flex; gap: 3px; }
.pk-cardBeads i { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font: 800 12px/1 var(--pk-round), sans-serif; font-style: normal; color: var(--pk-ink);
  box-shadow: inset 0 -2px 0 rgba(0,0,0,.1); background: #FFB59E; }
.pk-cardBeads i:nth-child(6n+2) { background: #C9B6FF; } .pk-cardBeads i:nth-child(6n+3) { background: #9FE5C8; } .pk-cardBeads i:nth-child(6n+4) { background: #FFB3D6; }
.pk-cardBeads i:nth-child(6n+5) { background: #FFD27A; } .pk-cardBeads i:nth-child(6n) { background: #A8D8FF; }
.pk-cardSig { width: 130px; height: 54px; display: grid; place-items: center; border-bottom: 2px solid var(--pk-soft); }
.pk-cardSig img { width: 100%; height: 100%; object-fit: contain; }
.pk-cardSig .pk-hand { font-size: 28px; font-weight: 700; color: #5B36C4; }
.pk-flipHint { position: absolute; left: 0; right: 0; bottom: 8px; text-align: center; font: 700 12px/1 var(--pk-round), sans-serif; color: var(--pk-ink2); opacity: .75; }
.pk-backTitle { font: 800 12px/1 var(--pk-round), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--pk-deeper); margin-top: 6px; }
.pk-backRules, .pk-backStars { display: grid; gap: 4px; }
.pk-backRules span, .pk-backStars span { font: 700 15.5px/1.25 var(--pk-hand), cursive; color: var(--pk-ink); }
.pk-backStars span { display: flex; gap: 6px; align-items: flex-start; }
.pk-backStars svg { flex: none; margin-top: 2px; }
.pk-backLock { margin-top: auto; font: 700 14px/1.2 var(--pk-round), sans-serif; color: var(--pk-ink2); }
.pk-backEnd { font: 700 17px/1.2 var(--pk-hand), cursive; color: var(--pk-deep); }
.pk-cardActions { display: grid; justify-items: center; gap: 8px; margin-top: 20px; }
.pk-back { width: 100%; max-width: 360px; background: rgba(255,255,255,.88); border: 2px solid #FFE4D2; border-radius: 24px; padding: 14px 14px 12px; text-align: left; margin-top: 6px; }
.pk-back h3 { margin: 0 0 8px; font: 800 17px/1.2 var(--pk-round), sans-serif; color: var(--pk-ink); }
.pk-backIn { width: 100%; resize: none; border: 2px dashed #FFC9AE; border-radius: 16px; background: #FFFDF9; padding: 10px 12px; font: 400 18px/1.4 var(--pk-hand), cursive; color: var(--pk-ink); }
.pk-backIn:focus { outline: 3px solid rgba(160,123,255,.45); border-color: transparent; }
.pk-backIn:disabled { opacity: .85; }
.pk-backRow { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 8px; }
.pk-backRow small { font: 600 12px/1.3 var(--pk-round), sans-serif; color: var(--pk-ink2); }
.pk-backBtn { min-height: 44px; padding: 10px 20px; font-size: 16px; flex: none; }
.pk-backDone { margin: 0; font: 700 18px/1.3 var(--pk-hand), cursive; color: #1F4A3A; background: #E8FFF5; border-radius: 14px; padding: 10px 12px; }
.pk-ps { width: 100%; max-width: 360px; display: grid; justify-items: center; }
.pk-psEnv { appearance: none; cursor: pointer; border: 2px dashed #FFB59E; background: #FFF8F1; color: var(--pk-deeper); border-radius: 18px; padding: 14px 18px; min-height: 52px;
  font: 700 16px/1.2 var(--pk-round), sans-serif; }
.pk-psIn { display: grid; gap: 8px; text-align: left; max-width: 340px; white-space: pre-wrap; }
.pk-psIn b { font-size: 21px; }
.pk-psIn span { font-size: 19px; font-weight: 400; }
.pk-foot { display: grid; justify-items: center; padding-bottom: 8px; }

/* ── wider screens and short phones ───────────────────────────────────── */
@media (min-width: 768px) {
  .pk-title { font-size: 38px; }
}
@media (max-height: 760px) and (max-width: 767px) {
  .pk-stage { padding-top: 76px; }
  .pk-hookStage { height: 330px; }
  .pk-hookGrab { top: 200px; }
  .pk-hookHand.him { top: -50px; }
  .pk-joint { top: 100px; }
  .pk-hookTrail { top: 126px; height: 100px; }
  .pk-hookGif { top: 100px; }
  .pk-jar { width: 150px; height: 178px; }
  .pk-noteZone { min-height: 130px; }
  .pk-diary { width: 210px; height: 266px; }
  .pk-card { min-height: 450px; }
}

@media (prefers-reduced-motion: reduce) {
  .pk-root *, .pk-root *::before, .pk-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  .pk-floaty { display: none; }
  .pk-lantern { animation: none !important; opacity: .9; bottom: auto; }
  .pk-flipFace, .pk-cardFace { transition-duration: .2s; }
}
`;
