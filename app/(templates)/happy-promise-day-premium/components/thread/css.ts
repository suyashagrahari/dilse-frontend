// All of the red thread's CSS (one <style>, "tp-" prefix). Transforms +
// opacity for motion; loops stop under prefers-reduced-motion.

const STARS =
  "radial-gradient(1.5px 1.5px at 10% 20%, #fff, transparent), radial-gradient(1px 1px at 30% 70%, #cfe0ff, transparent), radial-gradient(2px 2px at 55% 35%, #fff, transparent), radial-gradient(1px 1px at 75% 15%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 60%, #bfd7ff, transparent), radial-gradient(1px 1px at 20% 85%, #fff, transparent), radial-gradient(1.5px 1.5px at 45% 90%, #e4ecff, transparent), radial-gradient(1px 1px at 65% 55%, #fff, transparent)";

export const THREAD_CSS = `
/* ── backdrop ── */
.tp-bd { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; background: #070818; }
.tp-sky { position: absolute; inset: 0; background: radial-gradient(90% 60% at 50% 0%, #2A2F6E 0%, #12153A 55%, #070818 100%); }
.tp-stars { position: absolute; inset: -10%; background-image: ${STARS}; background-size: 260px 260px; opacity: .7; animation: tp-drift 120s linear infinite; }
@keyframes tp-drift { to { transform: translate(-260px, 60px); } }
.tp-beam { position: absolute; left: 50%; top: -10vh; width: 60vw; max-width: 700px; height: 120vh; transform: translateX(-50%); clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%);
  background: linear-gradient(180deg, rgba(255,236,210,.14), rgba(255,236,210,.02) 70%, transparent); transition: opacity 1s; }
.tp-bd.is-rings .tp-beam, .tp-bd.is-later .tp-beam, .tp-bd.is-bound .tp-beam { opacity: 0; }
.tp-river { position: absolute; left: 0; right: 0; bottom: 0; height: 26vh; opacity: 0; transition: opacity 1.2s;
  background: repeating-linear-gradient(180deg, rgba(157,180,255,.08) 0 2px, transparent 2px 14px), linear-gradient(180deg, #121848, #0a0d2a); }
.tp-bd.is-later .tp-river { opacity: 1; }
.tp-vignette { position: absolute; inset: 0; background: radial-gradient(110% 80% at 50% 40%, transparent 45%, rgba(2,2,10,.75) 100%); }

/* ── chrome ── */
.tp-scene { position: relative; z-index: 2; }
.tp-progress { position: fixed; top: 22px; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; gap: 5px; padding: 6px 9px; border-radius: 99px; background: rgba(7,8,24,.6); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.tp-progress span { height: 7px; border-radius: 4px; background: rgba(247,241,232,.2); transition: width .35s, background .35s; }
.tp-progress span.is-on { background: var(--tc); }
.tp-sec { min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 72px 16px 32px; text-align: center; color: #F7F1E8; }
.tp-head { display: grid; gap: 6px; justify-items: center; max-width: 520px; }
.tp-kick { margin: 0; font: 700 11.5px/1.2 var(--vw-font-ui), sans-serif; letter-spacing: .24em; text-transform: uppercase; color: #F2C14E; }
.tp-h { margin: 0; min-height: .1em; font: 600 clamp(26px, 7.4vw, 38px)/1.12 var(--vw-font-serif), serif; font-style: italic; color: #F7F1E8; text-wrap: balance; text-shadow: 0 2px 18px rgba(0,0,0,.6); }
.tp-sub { margin: 0; font: 500 15px/1.45 var(--vw-font-ui), sans-serif; color: #C9CDEB; }
.tp-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center; min-height: 52px; }
.tp-btn { min-height: 50px; padding: 0 24px; border-radius: 99px; border: 0; cursor: pointer; font: 700 15.5px/1 var(--vw-font-ui), sans-serif; color: #2B1A03;
  background: linear-gradient(135deg, #FFF1BF, #F2C14E 50%, #B07D22); box-shadow: 0 14px 30px -14px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.7); transition: transform .2s; }
.tp-btn:active { transform: scale(.96); }
.tp-btn.is-ghost { color: #F7F1E8; background: rgba(14,16,48,.6); border: 1px solid rgba(242,193,78,.5); box-shadow: none; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.tp-link { all: unset; cursor: pointer; min-height: 44px; padding: 0 14px; display: inline-flex; align-items: center; font: 700 14px/1 var(--vw-font-ui), sans-serif; color: #F2C14E; text-decoration: underline; text-underline-offset: 4px; }
.tp-btn:focus-visible, .tp-link:focus-visible, .tp-ring:focus-visible, .tp-vial:focus-visible, .tp-thumbBtn:focus-visible, .tp-pendStage:focus-visible, .tp-ps:focus-visible, .tp-knotTap:focus-visible { outline: 3px solid #F2C14E; outline-offset: 3px; }
.tp-stick { display: inline-flex; }

/* ── gate ── */
.tp-gate .pm-gateArt { width: min(260px, 64vw); max-height: 38vh; aspect-ratio: .82; }
.tp-gateSub { font: italic 500 18px/1.35 var(--vw-font-serif), serif; color: #E7E2F7; max-width: 30ch; display: inline-block; }
.tp-gateArt { position: relative; width: 100%; height: 100%; }
.tp-gateSvg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.tp-sway { transform-origin: 60% 0; animation: tp-sway 4.2s ease-in-out infinite; }
@keyframes tp-sway { 0%, 100% { transform: rotate(-2.5deg); } 50% { transform: rotate(2.5deg); } }
.tp-glintPath { stroke-dasharray: .08 .92; stroke-dashoffset: 1; animation: tp-glint 3s ease-in-out infinite; filter: drop-shadow(0 0 4px #fff); }
@keyframes tp-glint { to { stroke-dashoffset: 0; } }
.tp-gateHand { position: absolute; left: 22%; bottom: -6%; width: 44%; filter: drop-shadow(0 12px 18px rgba(0,0,0,.6)); }
.pm-gate.is-opening .tp-sway { animation: none; transform: translateY(12px) scaleY(1.06); transition: transform .9s cubic-bezier(.6,0,.2,1); }

/* ── pull ── */
.tp-pull { position: relative; width: min(100%, 420px); height: min(58vh, 520px); overflow: hidden; cursor: grab;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 18%); mask-image: linear-gradient(180deg, transparent 0, #000 18%); }
.tp-pullThread { position: absolute; inset: 0; width: 100%; height: 100%; }
.tp-peg { position: absolute; top: 0; margin: 0; width: 118px; padding: 7px 7px 9px; background: #F7F1E8; color: #2A1A1F; border-radius: 3px; box-shadow: 0 14px 22px -10px #000; transform-origin: 50% 0; will-change: transform; }
.tp-peg.is-l { left: calc(50% - 132px); } .tp-peg.is-r { left: calc(50% + 14px); }
.tp-pegClip { position: absolute; top: -12px; width: 12px; height: 26px; border-radius: 3px; background: linear-gradient(90deg, #8a5a3c, #c99a62 50%, #8a5a3c); }
.tp-peg.is-l .tp-pegClip { right: -10px; } .tp-peg.is-r .tp-pegClip { left: -10px; }
.tp-pegPh { display: block; aspect-ratio: 4 / 5; overflow: hidden; }
.tp-peg figcaption { margin-top: 5px; font: 700 14px/1.15 var(--vw-font-script), cursive; }
.tp-myHand { position: absolute; bottom: -40px; left: calc(50% - 20px); width: 110px; transition: transform .25s cubic-bezier(.3,1.5,.5,1); filter: drop-shadow(0 12px 18px rgba(0,0,0,.6)); }
.tp-myHand.is-dip { transform: translateY(10px); }
.tp-pullStick { position: absolute; left: 6px; bottom: 10px; }
.tp-meter { position: absolute; right: 8px; top: 18%; bottom: 10%; width: 4px; border-radius: 2px; background: rgba(247,241,232,.15); overflow: hidden; }
.tp-meter span { position: absolute; inset: 0; background: linear-gradient(180deg, #F2C14E, #D7263D); transform-origin: 50% 0; }

/* ── knot ── */
.tp-knot { position: relative; width: min(100%, 280px, 30vh); aspect-ratio: 300 / 340; margin: 24% 0 14%; }
.tp-knotSvg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.tp-knotHand { position: absolute; width: 34%; filter: drop-shadow(0 12px 18px rgba(0,0,0,.6)); transition: transform 1s cubic-bezier(.22,1,.36,1); }
.tp-knotHand.is-mine { left: 13.8%; top: 76%; }
.tp-knotHand.is-theirs { left: 52.2%; top: -18.7%; }
.tp-knot.is-arrive .tp-knotHand.is-theirs { animation: tp-arrive 1.1s cubic-bezier(.22,1,.36,1) both; }
@keyframes tp-arrive { from { translate: 60% -80%; opacity: 0; } }
.tp-th { stroke-dasharray: 1 0; }
.tp-knotG { transform-box: fill-box; transform-origin: center; cursor: pointer; }
.tp-knot.is-arrive .tp-knotG { transform: scale(2.1) rotate(-20deg); opacity: .8; }
.tp-knot.is-cinch .tp-knotG { animation: tp-cinch 1.1s cubic-bezier(.6,0,.3,1) both; }
.tp-knot.is-gold .tp-knotG { animation: tp-cinch2 .6s cubic-bezier(.3,1.6,.5,1) both; filter: drop-shadow(0 0 6px #F2C14E); }
@keyframes tp-cinch { from { transform: scale(2.1) rotate(-20deg); } 70% { transform: scale(.85); } to { transform: scale(1); } }
@keyframes tp-cinch2 { 0% { transform: scale(1.3); } 50% { transform: scale(.85); } 100% { transform: scale(1); } }
.tp-goldRun { stroke-dasharray: 1; stroke-dashoffset: 1; animation: tp-run 1.3s cubic-bezier(.4,0,.2,1) .15s forwards; filter: drop-shadow(0 0 4px rgba(242,193,78,.8)); }
@keyframes tp-run { to { stroke-dashoffset: 0; } }
.tp-flash { position: fixed; inset: 0; z-index: 80; pointer-events: none; background: #fff; animation: tp-flash .7s ease-out forwards; }
@keyframes tp-flash { 0% { opacity: .9; } 100% { opacity: 0; } }
.tp-knotTap { all: unset; position: absolute; left: 50%; top: 50%; width: 80px; height: 80px; margin: -40px 0 0 -40px; border-radius: 50%; cursor: pointer; }
.tp-knotTap:disabled { cursor: default; }
.tp-promiseWrap { position: relative; width: min(100%, 440px); min-height: 150px; display: grid; justify-items: center; align-content: start; }
.tp-iPromise { width: 100%; height: auto; overflow: visible; }
.tp-iPromise text { font-family: var(--vw-font-script), cursive; font-weight: 700; font-size: 66px; fill: transparent; stroke: #F2C14E; stroke-width: 1.4; stroke-dasharray: 900; stroke-dashoffset: 900;
  animation: tp-write 2.4s cubic-bezier(.45,0,.4,1) .9s forwards, tp-fillGold .8s ease 3.2s forwards; filter: drop-shadow(0 0 8px rgba(242,193,78,.6)); }
@keyframes tp-write { to { stroke-dashoffset: 0; } }
@keyframes tp-fillGold { to { fill: #F2C14E; } }
.tp-pen { position: absolute; left: 14%; top: 30px; width: 10px; height: 10px; border-radius: 50%; background: #FFF1BF; box-shadow: 0 0 12px 6px rgba(242,193,78,.8); opacity: 0;
  animation: tp-penMove 2.4s cubic-bezier(.45,0,.4,1) .9s forwards; }
@keyframes tp-penMove { 0% { opacity: 1; transform: translate(0, 10px); } 25% { transform: translate(60px, -14px); } 50% { transform: translate(140px, 12px); } 75% { transform: translate(210px, -8px); } 99% { opacity: 1; } 100% { opacity: 0; transform: translate(270px, 8px); } }
.tp-big { margin: 4px 0 0; max-width: 32ch; font: italic 500 clamp(18px, 4.8vw, 22px)/1.4 var(--vw-font-serif), serif; color: #F7F1E8; opacity: 0; animation: tp-fadeIn 1s ease 3.4s forwards; }
@keyframes tp-fadeIn { to { opacity: 1; } }

/* ── rings ── */
.tp-field { position: relative; width: min(100%, 400px); height: min(44vh, 380px); border-radius: 22px; cursor: crosshair; background: radial-gradient(80% 70% at 50% 50%, rgba(157,180,255,.10), transparent 70%); box-shadow: inset 0 0 0 1px rgba(247,241,232,.08); }
.tp-trail { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 0 4px rgba(242,193,78,.8)); pointer-events: none; }
.tp-ring { all: unset; position: absolute; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%; cursor: pointer; transform: scale(var(--d)); animation: tp-bob 3.2s ease-in-out infinite; }
.tp-ring span { position: absolute; inset: 0; border-radius: 50%; border: 7px solid #F2C14E; box-sizing: border-box; box-shadow: 0 0 14px rgba(242,193,78,.55), inset 0 0 8px rgba(0,0,0,.4); background: radial-gradient(circle, transparent 55%, rgba(255,241,191,.25) 60%, transparent 66%); }
.tp-ring:nth-child(odd) { animation-delay: -1.4s; }
.tp-ring.is-on span { animation: tp-spin .9s cubic-bezier(.3,1.4,.5,1); border-color: #FFE08A; box-shadow: 0 0 26px 6px rgba(242,193,78,.85); }
.tp-ring.is-on::after { content: ""; position: absolute; left: -40%; right: -40%; top: 50%; height: 3px; margin-top: -1.5px; background: var(--tc); box-shadow: 0 0 6px var(--tc); }
@keyframes tp-bob { 50% { translate: 0 -6px; } }
@keyframes tp-spin { from { transform: rotateY(0) scale(1.3); } to { transform: rotateY(360deg) scale(1); } }
.tp-ribbons { list-style: none; margin: 0; padding: 0; width: min(100%, 420px); display: grid; gap: 6px; min-height: 40px; }
.tp-ribbon { padding: 9px 22px; color: #fff; background: linear-gradient(90deg, #9E1B2C, #D7263D 20%, #D7263D 80%, #9E1B2C); clip-path: polygon(0 0, 100% 0, 96% 50%, 100% 100%, 0 100%, 4% 50%);
  font: 600 15px/1.35 var(--vw-font-serif), serif; animation: tp-unfurl .5s cubic-bezier(.22,1,.36,1) both; transform-origin: 50% 50%; }
@keyframes tp-unfurl { from { transform: scaleX(.1); opacity: 0; } }

/* ── vow ── */
.tp-vowSec { justify-content: flex-start; padding-top: 80px; }
.tp-voice { width: min(100%, 460px); padding: 12px; box-sizing: border-box; border-radius: 18px; background: rgba(14,16,48,.66); border: 1px solid rgba(242,193,78,.3); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); color: #F7F1E8; }
.tp-voiceLbl { font: 700 12px/1.3 var(--vw-font-ui), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #F2C14E; }
.tp-voiceNote { display: grid; gap: 8px; }
.tp-voiceNote i { font: italic 500 19px/1.35 var(--vw-font-serif), serif; }
.tp-paper { width: min(100%, 460px); box-sizing: border-box; padding: 26px 24px 20px; text-align: left; color: #2A1A1F; border-radius: 4px; user-select: text; -webkit-user-select: text;
  background: radial-gradient(circle at 10% 0%, rgba(215,38,61,.06), transparent 40%), #F7F1E8; box-shadow: 0 30px 50px -26px #000, 0 0 0 1px rgba(0,0,0,.04), inset 0 0 30px rgba(160,130,90,.15); }
.tp-para { position: relative; padding-left: 20px; margin-bottom: 14px; }
.tp-stitchLine { position: absolute; left: 4px; top: 4px; bottom: 4px; width: 3px; background: repeating-linear-gradient(180deg, var(--tc) 0 7px, transparent 7px 12px); transform: scaleY(0); transform-origin: 50% 0; transition: transform .7s cubic-bezier(.4,0,.2,1); }
.tp-para.is-sewn .tp-stitchLine { transform: scaleY(1); }
.tp-para p { margin: 0; white-space: pre-wrap; font: 400 17px/1.62 var(--vw-font-serif), serif; overflow-wrap: anywhere; opacity: .16; filter: blur(2.5px); transition: opacity .6s .45s, filter .6s .45s; }
.tp-para.is-sewn p { opacity: 1; filter: none; }
.tp-sigs { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; padding-top: 12px; border-top: 1px dashed rgba(42,26,31,.3); opacity: .35; transition: opacity .6s; }
.tp-sigs.is-on { opacity: 1; }
.tp-sig { position: relative; display: grid; justify-items: center; align-content: end; gap: 4px; min-height: 92px; }
.tp-sig b { font: 700 30px/1 var(--vw-font-script), cursive; color: #9E1B2C; }
.tp-sig small { font: 600 10.5px/1 var(--vw-font-ui), sans-serif; letter-spacing: .16em; text-transform: uppercase; opacity: .6; border-top: 1px solid rgba(42,26,31,.4); padding-top: 4px; width: 90%; text-align: center; }
.tp-thumb { position: absolute; left: 50%; bottom: 18px; width: 64px; margin-left: -32px; pointer-events: none; }
.tp-thumbBtn { position: relative; z-index: 1; min-height: 52px; min-width: 120px; padding: 6px 10px; border-radius: 12px; border: 1.5px dashed rgba(158,27,44,.6); background: rgba(215,38,61,.05); color: #9E1B2C; cursor: pointer; font: 700 12.5px/1.2 var(--vw-font-ui), sans-serif; }
.tp-thumbBtn.is-done { border-color: transparent; background: transparent; }
.tp-thumbBtn:disabled:not(.is-done) { opacity: .5; cursor: default; }

/* ── later ── */
.tp-riverStage { position: relative; width: min(100%, 400px); height: min(40vh, 320px); border-radius: 22px; overflow: hidden; background: radial-gradient(40% 30% at 70% 18%, rgba(255,251,232,.35), transparent 70%), linear-gradient(180deg, #1A2060 0%, #0E1238 55%, #0A0D2A 100%); box-shadow: inset 0 0 0 1px rgba(157,180,255,.15); }
.tp-waves { position: absolute; left: -20%; right: -20%; bottom: 0; height: 42%; background: repeating-linear-gradient(170deg, rgba(157,180,255,.18) 0 2px, transparent 2px 16px), linear-gradient(180deg, #13195A, #0a0d2a); animation: tp-waves 5s linear infinite; }
@keyframes tp-waves { to { transform: translateX(14%); } }
.tp-vial { all: unset; position: absolute; left: 50%; top: 22%; width: 66px; height: 150px; margin-left: -33px; cursor: pointer; animation: tp-bob 3.6s ease-in-out infinite; }
.tp-vialGlass { position: absolute; left: 6px; right: 6px; top: 24px; bottom: 0; border-radius: 22px 22px 26px 26px; background: linear-gradient(90deg, rgba(255,255,255,.35), rgba(255,255,255,.08) 35%, rgba(255,255,255,.25)); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.45), 0 0 24px rgba(157,180,255,.35); overflow: hidden; }
.tp-scroll { position: absolute; left: 30%; right: 30%; top: 16%; bottom: 10%; border-radius: 6px; background: repeating-linear-gradient(180deg, #F7F1E8 0 6px, #E8DCC6 6px 7px); transition: transform .8s cubic-bezier(.22,1,.36,1); }
.tp-cork { position: absolute; left: 18px; right: 18px; top: 8px; height: 22px; border-radius: 5px; background: linear-gradient(90deg, #9a6b40, #c9955f 50%, #8a5a34); transition: transform .6s cubic-bezier(.3,1.5,.5,1); }
.tp-waxCap { position: absolute; left: 13px; right: 13px; top: 2px; height: 34px; border-radius: 9px 9px 16px 16px; background: radial-gradient(circle at 35% 30%, #ff7a8a, var(--tc) 55%, #6a0f1c); transform: scaleY(var(--wax)); transform-origin: 50% 0; opacity: calc(var(--wax) * 1.4); }
.tp-waxCap::after { content: ""; position: absolute; left: 10px; bottom: -8px; width: 8px; height: 12px; border-radius: 0 0 6px 6px; background: var(--tc); }
.tp-riverStage.is-adrift .tp-vial { animation: tp-adrift 6s cubic-bezier(.4,0,.6,1) forwards, tp-bob 3.6s ease-in-out infinite; }
@keyframes tp-adrift { to { translate: 140px 40px; scale: .55; } }
.tp-riverStage.is-back .tp-vial { animation: tp-back 2.4s cubic-bezier(.22,1,.36,1) both, tp-bob 3.6s ease-in-out 2.4s infinite; }
@keyframes tp-back { from { translate: 160px 40px; scale: .5; } }
.tp-vial.is-open .tp-waxCap, .tp-vial.is-open .tp-cork { transform: translate(14px, -46px) rotate(30deg); }
.tp-vial.is-open .tp-scroll { transform: translateY(-120px); }
.tp-chip { position: absolute; left: 12px; top: 12px; padding: 6px 12px; border-radius: 99px; background: rgba(7,8,24,.7); border: 1px solid rgba(242,193,78,.5); color: #F2C14E; font: 700 12px/1 var(--vw-font-ui), sans-serif; }
.tp-vialStick { position: absolute; right: 10px; bottom: 10px; }
.tp-note { width: min(100%, 400px); box-sizing: border-box; padding: 14px 18px; border-radius: 6px; background: #F7F1E8; color: #2A1A1F; font: italic 500 17px/1.5 var(--vw-font-serif), serif; animation: tp-fadeIn2 .6s both; }
.tp-note p { margin: 0; }
.tp-noteSealed { opacity: .6; }
@keyframes tp-fadeIn2 { from { opacity: 0; transform: translateY(10px); } }

/* ── bound ── */
.tp-boundSec { gap: 12px; }
.tp-map { width: min(100%, 420px); }
.tp-mapSvg { width: 100%; height: auto; overflow: visible; }
.tp-mapLbl { font: 700 11px var(--vw-font-ui), sans-serif; fill: #C9CDEB; }
.tp-dist { margin: 0; font: 700 13px/1 var(--vw-font-ui), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #F2C14E; }
.tp-endLine { margin: 0; max-width: 30ch; font: italic 500 clamp(19px, 5vw, 24px)/1.35 var(--vw-font-serif), serif; color: #F7F1E8; text-wrap: balance; }
.tp-askBtn { min-height: 56px; font-size: 17px; padding: 0 30px; }
.tp-pend { display: grid; justify-items: center; gap: 6px; }
.tp-pendStage { all: unset; position: relative; display: block; width: 280px; height: 210px; cursor: pointer; }
.tp-pendArm { position: absolute; top: 0; width: 140px; height: 210px; transition: none; }
.tp-pendArm.is-l { left: 0; transform-origin: 0 0; } .tp-pendArm.is-r { right: 0; transform-origin: 100% 0; }
.tp-pendHand { position: absolute; bottom: 0; width: 90px; }
.tp-pendArm.is-l .tp-pendHand { right: 6px; } .tp-pendArm.is-r .tp-pendHand { left: 6px; }
.tp-pendGuide { position: absolute; left: 50%; top: 30%; bottom: 0; width: 2px; margin-left: -1px; background: linear-gradient(180deg, transparent, rgba(242,193,78,.5)); transition: box-shadow .1s, background .1s; }
.tp-pendGuide.is-hot { background: #F2C14E; box-shadow: 0 0 14px 4px rgba(242,193,78,.7); }
.tp-pendMsg { margin: 0; min-height: 1.4em; font: 600 14px/1.3 var(--vw-font-ui), sans-serif; color: #C9CDEB; }
.tp-promised { display: grid; justify-items: center; gap: 6px; animation: tp-fadeIn2 .6s both; }
.tp-promised b { font: italic 600 22px/1.3 var(--vw-font-serif), serif; color: #F2C14E; }
.tp-ps { all: unset; box-sizing: border-box; cursor: pointer; display: flex; gap: 12px; align-items: center; justify-content: center; width: min(100%, 420px); min-height: 56px; padding: 14px 18px; border-radius: 6px; background: #EFE8F7; color: #2A1A1F; font: 600 15px/1.4 var(--vw-font-ui), sans-serif; box-shadow: 0 16px 30px -16px #000; text-align: left; }
.tp-ps.is-open { display: block; background: #F7F1E8; }
.tp-psTx { display: block; white-space: pre-wrap; font: 500 16px/1.55 var(--vw-font-serif), serif; user-select: text; -webkit-user-select: text; }
.tp-psSeal { display: grid; place-items: center; flex: none; width: 36px; height: 36px; border-radius: 50%; color: #FFF1BF; background: radial-gradient(circle at 35% 30%, #ff7a8a, #D7263D 55%, #6a0f1c); }
.tp-credit { margin: 4px 0 0; font: 600 11.5px/1 var(--vw-font-ui), sans-serif; letter-spacing: .1em; color: rgba(247,241,232,.55); }

@media (max-height: 700px) { .tp-sec { gap: 10px; padding-top: 64px; } }
@media (prefers-reduced-motion: reduce) {
  .tp-stars, .tp-sway, .tp-glintPath, .tp-ring, .tp-vial, .tp-waves { animation: none !important; }
  .tp-iPromise text { animation: none; stroke-dashoffset: 0; fill: #F2C14E; }
  .tp-big { animation: none; opacity: 1; }
  .tp-goldRun { animation: none; stroke-dashoffset: 0; }
  .tp-knot .tp-knotG, .tp-knot.is-arrive .tp-knotHand.is-theirs, .tp-ribbon, .tp-flash, .tp-riverStage.is-adrift .tp-vial, .tp-riverStage.is-back .tp-vial { animation-duration: .01s !important; }
  .tp-stitchLine, .tp-para p { transition-duration: .01s; }
}
`;
