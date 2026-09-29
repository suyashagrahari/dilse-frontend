// ─── Catch — styles ──────────────────────────────────────────────────────────
//
// One stylesheet for the whole template, injected once by CatchTemplate. Every
// animation is transform/opacity only; everything decorative switches off under
// prefers-reduced-motion. Only the pause card and photo pop use backdrop blur,
// and never at the same time.

import { BODY, C, DISPLAY, HAND } from "./theme";

export const CATCH_CSS = `
.ct-root { position: relative; min-height: 100dvh; font-family: ${BODY}; color: ${C.ink}; overflow: hidden;
  background: radial-gradient(120% 70% at 20% 0%, #FFE1F0 0%, transparent 60%), radial-gradient(90% 60% at 100% 100%, #E3DAFF 0%, transparent 60%), linear-gradient(160deg, #FFF3F9, #F1EBFF 55%, #FFF6E8);
  -webkit-tap-highlight-color: transparent; }
.ct-root *, .ct-root *::before, .ct-root *::after { box-sizing: border-box; }
.ct-root button { font-family: inherit; }
.ct-root.is-playing .lpDock { display: none !important; }

/* decorative blobs behind the cabinet (wide screens) */
.ct-bgDeco { position: absolute; inset: 0; pointer-events: none; display: none; }
.ct-bgDeco i { position: absolute; border-radius: 50%; filter: blur(40px); opacity: .55; }
.ct-bgDeco i:nth-child(1) { width: 420px; height: 420px; left: -80px; top: 10%; background: #FFB3D4; }
.ct-bgDeco i:nth-child(2) { width: 380px; height: 380px; right: -60px; bottom: 5%; background: #C8B8FF; }
.ct-bgDeco i:nth-child(3) { width: 260px; height: 260px; left: 45%; top: -80px; background: #FFE9A8; }

/* the playfield */
.ct-field { position: relative; width: 100%; height: 100dvh; overflow: hidden; isolation: isolate;
  background: linear-gradient(180deg, #9FD3FF 0%, #C8B8FF 55%, #FFD0E8 100%); }
@media (min-width: 700px) {
  .ct-root { display: flex; align-items: center; justify-content: center; gap: 28px; padding: 18px; height: 100dvh; }
  .ct-bgDeco { display: block; }
  .ct-field { width: min(540px, calc((100dvh - 36px) * .6)); height: calc(100dvh - 36px); min-height: 560px; border-radius: 34px; flex: none;
    border: 6px solid rgba(255,255,255,.85); box-shadow: 0 40px 80px -30px rgba(90,30,110,.55), 0 0 0 1px rgba(124,92,255,.15); }
}

@media (min-width: 900px) {
  .ct-root.is-shift { padding-right: 558px; }
  .ct-root.is-shift .ct-side, .ct-root.is-shift .ct-bgDeco { display: none; }
}

/* side panels */
.ct-side { display: none; }
@media (min-width: 1120px) {
  .ct-side { display: flex; flex-direction: column; gap: 16px; flex: 0 1 280px; min-width: 0; max-height: calc(100dvh - 36px); position: relative; z-index: 1; }
}
.ct-sideCard { background: rgba(255,255,255,.72); border: 1px solid rgba(255,255,255,.9); border-radius: 24px; padding: 18px; box-shadow: 0 20px 40px -26px rgba(90,30,110,.45); }
.ct-sideKick { margin: 0 0 8px; font: 700 12px ${DISPLAY}; letter-spacing: .14em; text-transform: uppercase; color: ${C.pink}; }
.ct-sideBig { margin: 0; font: 700 40px/1 ${DISPLAY}; color: ${C.ink}; }
.ct-sideBig small { font-size: 15px; color: ${C.inkSoft}; margin-left: 4px; }
.ct-sideBar { height: 10px; border-radius: 99px; background: rgba(124,92,255,.14); margin: 12px 0 14px; overflow: hidden; }
.ct-sideBar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, ${C.pink}, ${C.grape}); transition: width .5s cubic-bezier(.2,1,.3,1); }
.ct-sideLines { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; max-height: 38vh; overflow-y: auto; }
.ct-sideLines li { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; line-height: 1.4; color: #A99BBB; }
.ct-sideLines li span { flex: none; width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; background: #F3EEFA; filter: grayscale(1); opacity: .6; }
.ct-sideLines li p { margin: 3px 0 0; font-style: italic; }
.ct-sideLines li.is-on { color: ${C.ink}; animation: ctSlideIn .5s cubic-bezier(.2,1.3,.4,1) both; }
.ct-sideLines li.is-on span { background: #FFE3F0; filter: none; opacity: 1; }
.ct-sideLines li.is-on p { font-style: normal; }
.ct-how ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; font-size: 13px; color: ${C.inkSoft}; }
.ct-how b { display: inline-block; min-width: 56px; color: ${C.ink}; }
.ct-sideGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ct-sideSlot { aspect-ratio: 1; border-radius: 14px; overflow: hidden; display: grid; place-items: center; background: repeating-linear-gradient(45deg, #F3EEFA 0 8px, #EAE2F7 8px 16px); border: 2px dashed #D9CCF0; }
.ct-sideSlot b { font: 700 22px ${DISPLAY}; color: #C3B2E0; }
.ct-sideSlot.is-on { border: 3px solid #fff; box-shadow: 0 8px 18px -10px rgba(90,30,110,.6); animation: ctPop .5s cubic-bezier(.2,1.5,.4,1) both; }
.ct-sideNote { margin: 10px 0 0; font-size: 12.5px; color: ${C.inkSoft}; line-height: 1.4; }
.ct-sideStats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ct-sideStats span { background: #FFF4FA; border-radius: 16px; padding: 12px; font-size: 12px; color: ${C.inkSoft}; display: grid; gap: 2px; }
.ct-sideStats b { font: 700 22px ${DISPLAY}; color: ${C.ink}; }

/* buttons: chunky 3D candy */
.ct-btn { --bg: ${C.pink}; --sh: ${C.pinkDeep}; --tx: #fff; position: relative; border: 0; cursor: pointer; border-radius: 20px; padding: 14px 22px; min-height: 52px;
  background: var(--bg); color: var(--tx); font: 700 17px ${DISPLAY}; letter-spacing: .02em;
  box-shadow: 0 6px 0 var(--sh), 0 16px 24px -12px rgba(60,10,70,.5), inset 0 2px 0 rgba(255,255,255,.35);
  transition: transform .12s ease, box-shadow .12s ease; -webkit-user-select: none; user-select: none; }
.ct-btn:hover { transform: translateY(-1px); }
.ct-btn:active { transform: translateY(5px); box-shadow: 0 1px 0 var(--sh), 0 6px 12px -8px rgba(60,10,70,.5), inset 0 2px 0 rgba(255,255,255,.35); }
.ct-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.ct-btn--grape { --bg: ${C.grape}; --sh: ${C.grapeDeep}; }
.ct-btn--ghost { --bg: #fff; --sh: #E0D6F0; --tx: ${C.ink}; }

/* ── splash ── */
.ct-splash { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: calc(14px + env(safe-area-inset-top, 0px)) 18px calc(84px + env(safe-area-inset-bottom, 0px)); overflow: hidden; text-align: center; }
@media (max-height: 700px) { .ct-splash { padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)); } .ct-logo { font-size: 62px; } .ct-hero { transform: scale(.85); margin: 0; } }
.ct-splash::before { content: ""; position: absolute; inset: 0; z-index: -1;
  background: radial-gradient(60% 30% at 50% 58%, rgba(255,255,255,.6), transparent 70%),
    radial-gradient(40px 22px at 12% 22%, #fff 60%, transparent 62%), radial-gradient(60px 26px at 18% 24%, #fff 60%, transparent 62%),
    radial-gradient(50px 24px at 84% 40%, #fff 60%, transparent 62%), radial-gradient(70px 28px at 90% 42%, #fff 60%, transparent 62%); opacity: .9; }
.ct-drift { position: absolute; inset: 0; pointer-events: none; z-index: -1; }
.ct-drift span { position: absolute; top: -40px; font-size: 22px; opacity: .55; animation: ctDrift calc(9s + var(--i) * 0.9s) linear calc(var(--i) * -1.3s) infinite; }
.ct-splashTop { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ct-fromPill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 99px; background: rgba(255,255,255,.78); font: 600 13px ${DISPLAY}; color: ${C.ink}; box-shadow: 0 6px 14px -8px rgba(60,10,70,.35); max-width: 76%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ct-soundBtn { width: 40px; height: 40px; border-radius: 50%; border: 0; background: rgba(255,255,255,.78); font-size: 17px; cursor: pointer; box-shadow: 0 6px 14px -8px rgba(60,10,70,.35); }
.ct-logoWrap { margin-top: 2vh; }
.ct-logo { margin: 0; font: 700 clamp(64px, 21vw, 98px)/.9 ${DISPLAY}; letter-spacing: -.01em; display: flex; justify-content: center; }
.ct-logo span { display: inline-block; color: var(--c); -webkit-text-stroke: 0; paint-order: stroke fill;
  text-shadow: 0 0 0 #fff, 3px 3px 0 #fff, -3px 3px 0 #fff, 3px -3px 0 #fff, -3px -3px 0 #fff, 0 4px 0 #fff, 0 9px 0 ${C.ink}, 0 16px 22px rgba(60,10,70,.35);
  animation: ctLetter 2.4s cubic-bezier(.3,1.6,.5,1) calc(var(--i) * .09s) infinite; transform-origin: 50% 100%; }
.ct-logo span:nth-child(1) { --c: ${C.pink}; } .ct-logo span:nth-child(2) { --c: ${C.sunDeep}; } .ct-logo span:nth-child(3) { --c: ${C.mint}; }
.ct-logo span:nth-child(4) { --c: #4EA8FF; } .ct-logo span:nth-child(5) { --c: ${C.grape}; } .ct-logo span:nth-child(6) { --c: ${C.pink}; }
.ct-ribbon { margin: 14px auto 0; display: inline-block; position: relative; max-width: 92%; }
.ct-ribbon span { display: block; padding: 8px 20px; background: ${C.ink}; color: #fff; font: 600 15px ${DISPLAY}; border-radius: 12px; transform: rotate(-2deg);
  box-shadow: 0 8px 0 rgba(42,22,64,.2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ct-hero { position: relative; display: grid; place-items: center; margin: 1vh 0; }
.ct-heroBob { animation: ctBob 1.6s ease-in-out infinite; position: relative; z-index: 2; }
.ct-heroFace { box-shadow: 0 0 0 6px #fff, 0 0 0 11px ${C.pink}, 0 24px 30px -10px rgba(60,10,70,.45); }
.ct-heroName { position: relative; z-index: 3; margin-top: 14px; padding: 5px 14px; border-radius: 99px; background: rgba(42,22,64,.82); color: #fff; font: 700 14px ${DISPLAY}; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ct-heroCloud { position: absolute; bottom: 4px; width: 210px; height: 56px; border-radius: 40px; background: #fff; opacity: .8; z-index: 1;
  box-shadow: -60px 8px 0 -8px #fff, 62px 10px 0 -10px #fff; }
.ct-heroSpark { position: absolute; z-index: 3; color: #fff; font-size: 22px; text-shadow: 0 2px 6px rgba(60,10,70,.3); animation: ctTwinkle 1.8s ease-in-out infinite; }
.ct-heroSpark--a { left: -34px; top: 8px; } .ct-heroSpark--b { right: -30px; top: 30px; color: ${C.pink}; animation-delay: .5s; } .ct-heroSpark--c { left: -12px; bottom: 44px; font-size: 14px; animation-delay: 1s; }
.ct-splashCta { width: 100%; max-width: 360px; display: grid; gap: 12px; justify-items: center; }
.ct-play { width: 100%; font-size: 24px; min-height: 66px; border-radius: 24px; letter-spacing: .06em; animation: ctPulse 1.3s ease-in-out infinite; }
.ct-stats { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.ct-stats span { padding: 7px 12px; border-radius: 99px; background: rgba(255,255,255,.8); font: 500 13px ${DISPLAY}; color: ${C.inkSoft}; }
.ct-stats b { color: ${C.ink}; }
.ct-splashHint { margin: 0; font-size: 13px; color: rgba(42,22,64,.72); }
.ct-linkBtn { border: 0; background: none; color: ${C.ink}; font: 600 13px ${BODY}; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; opacity: .75; padding: 4px; }

/* face */
.ct-face { position: relative; display: inline-grid; place-items: center; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #FFB3D4, #B9A4FF); flex: none; }
.ct-face img { display: block; }
.ct-faceKawaii { position: absolute; inset: 0; }
.ct-faceKawaii b { display: none; }
.ct-eye { position: absolute; top: 40%; width: 11%; height: 15%; border-radius: 50%; background: ${C.ink}; }
.ct-eye:nth-child(1) { left: 30%; } .ct-eye:nth-child(2) { right: 30%; }
.ct-eye::after { content: ""; position: absolute; width: 35%; height: 30%; border-radius: 50%; background: #fff; top: 15%; right: 15%; }
.ct-mouth { position: absolute; left: 42%; top: 56%; width: 16%; height: 9%; border: 3px solid ${C.ink}; border-top: 0; border-radius: 0 0 99px 99px; }
.ct-cheek { position: absolute; top: 58%; width: 16%; height: 8%; border-radius: 50%; background: rgba(255,79,154,.45); }
.ct-cheek:nth-of-type(4) { left: 14%; } .ct-cheek:nth-of-type(5) { right: 14%; }

/* ── stage ── */
.ct-stage { position: absolute; inset: 0; }
.ct-canvasWrap { position: absolute; inset: 0; touch-action: none; cursor: grab; }
.ct-canvasWrap:active { cursor: grabbing; }
.ct-canvas { display: block; width: 100%; height: 100%; }
.ct-hud { position: absolute; left: 0; right: 0; top: 0; padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 0; pointer-events: none; z-index: 5; }
.ct-hudRow { display: flex; align-items: center; gap: 8px; }
.ct-score { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px 5px 6px; border-radius: 99px; background: rgba(42,22,64,.72); color: #fff; }
.ct-scoreIc { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: ${C.pink}; font-size: 14px; box-shadow: inset 0 -2px 0 ${C.pinkDeep}; }
.ct-scoreN { font: 700 20px/1 ${DISPLAY}; font-variant-numeric: tabular-nums; min-width: 2ch; display: inline-block; }
.ct-scoreN.is-bump { animation: ctBump .25s ease-out; }
.ct-hudMid { flex: 1; display: flex; gap: 6px; justify-content: center; min-width: 0; }
.ct-chip { display: inline-flex; align-items: center; gap: 4px; padding: 5px 9px; border-radius: 99px; background: rgba(255,255,255,.78); font: 700 13px ${DISPLAY}; color: ${C.ink}; white-space: nowrap; }
.ct-chip i { font-style: normal; font-size: 13px; }
.ct-lives { display: inline-flex; gap: 1px; font-size: 22px; line-height: 1; }
.ct-lives i { font-style: normal; color: ${C.red}; text-shadow: 0 2px 0 #fff, 0 3px 6px rgba(60,10,70,.3); transition: transform .3s, opacity .3s, filter .3s; }
.ct-lives i.is-lost { color: #fff; opacity: .55; transform: scale(.8); animation: ctLose .45s ease; }
.ct-pauseBtn { pointer-events: auto; width: 38px; height: 38px; border-radius: 50%; border: 0; background: rgba(255,255,255,.85); color: ${C.ink}; display: grid; place-items: center; cursor: pointer; box-shadow: 0 4px 0 rgba(42,22,64,.15); }
.ct-timer { margin: 9px 2px 0; height: 10px; border-radius: 99px; background: rgba(42,22,64,.25); overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,.15); }
.ct-timerFill { display: block; height: 100%; width: 100%; border-radius: inherit; transform-origin: left center; background: linear-gradient(90deg, ${C.sun}, ${C.pink}, ${C.grape}); }
.ct-hudRow2 { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 8px; min-height: 30px; }
.ct-combo { opacity: 0; transform: translateX(-10px); padding: 4px 11px; border-radius: 12px; background: ${C.sun}; color: ${C.ink}; font: 600 13px ${DISPLAY}; box-shadow: 0 4px 0 ${C.sunDeep}; transition: opacity .2s, transform .2s; }
.ct-combo b { font-size: 17px; }
.ct-combo em { font-style: normal; margin-left: 6px; padding: 1px 6px; border-radius: 8px; background: ${C.ink}; color: #fff; font-size: 12px; }
.ct-combo.is-on { opacity: 1; transform: none; }
.ct-combo.is-on.is-pop { animation: ctBump .25s ease-out; }
.ct-powers { display: flex; gap: 6px; }
.ct-pw { --p: 1; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font: 800 13px ${DISPLAY}; color: ${C.ink};
  background: radial-gradient(closest-side, #fff 76%, transparent 78% 100%), conic-gradient(var(--c) calc(var(--p) * 360deg), rgba(255,255,255,.4) 0); }
.ct-pw--m { --c: ${C.grape}; } .ct-pw--d { --c: ${C.sunDeep}; } .ct-pw--s { --c: ${C.mint}; --p: 1; }

.ct-lineToast { position: absolute; left: 12px; right: 12px; top: calc(118px + env(safe-area-inset-top, 0px)); z-index: 6; pointer-events: none; display: flex; gap: 10px; align-items: flex-start;
  padding: 11px 14px; border-radius: 18px; background: rgba(255,255,255,.94); box-shadow: 0 14px 30px -14px rgba(60,10,70,.5); border: 2px solid #FFD1E6;
  animation: ctToast 3.2s cubic-bezier(.2,1,.3,1) both; }
.ct-ltEmoji { flex: none; width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; font-size: 22px; background: #FFE9F3; }
.ct-ltBody { min-width: 0; }
.ct-ltKick { margin: 0; font: 700 11px ${DISPLAY}; letter-spacing: .08em; text-transform: uppercase; color: ${C.pink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ct-ltLine { margin: 3px 0 0; font-size: 14.5px; line-height: 1.38; color: ${C.ink}; overflow-wrap: anywhere; }

.ct-level { position: absolute; left: 0; right: 0; top: 34%; z-index: 7; text-align: center; pointer-events: none; animation: ctBanner 1.9s cubic-bezier(.2,1,.3,1) both; }
.ct-levelN { display: inline-block; margin: 0; padding: 6px 18px; border-radius: 14px; background: ${C.ink}; color: ${C.sun}; font: 700 18px ${DISPLAY}; letter-spacing: .18em; transform: rotate(-3deg); }
.ct-levelName { margin: 8px 0 0; font: 700 44px/1 ${DISPLAY}; color: #fff; text-shadow: 0 4px 0 ${C.pink}, 0 10px 20px rgba(60,10,70,.35); }
.ct-levelSub { margin: 8px 0 0; font: 600 15px ${DISPLAY}; color: #fff; text-shadow: 0 2px 6px rgba(60,10,70,.4); }

.ct-count { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; background: rgba(42,22,64,.18); }
.ct-countN { font: 700 120px/1 ${DISPLAY}; color: #fff; text-shadow: 0 6px 0 ${C.pink}, 0 12px 0 ${C.ink}, 0 24px 40px rgba(60,10,70,.4); animation: ctCount .62s cubic-bezier(.2,1.6,.4,1) both; }
.ct-tut { width: min(88%, 330px); padding: 22px 18px; border-radius: 26px; background: rgba(255,255,255,.95); text-align: center; box-shadow: 0 24px 50px -20px rgba(60,10,70,.55); animation: ctPop .4s cubic-bezier(.2,1.5,.4,1) both; }
.ct-tutHand { position: relative; height: 56px; }
.ct-tutHand span { position: absolute; left: 50%; top: 4px; font-size: 38px; animation: ctSwipe 1.4s ease-in-out infinite; }
.ct-tutHand i { position: absolute; left: 20%; right: 20%; bottom: 4px; height: 4px; border-radius: 4px; background: repeating-linear-gradient(90deg, ${C.pink} 0 8px, transparent 8px 14px); }
.ct-tutT { margin: 6px 0 12px; font: 700 24px ${DISPLAY}; color: ${C.ink}; }
.ct-tutLegend { display: grid; gap: 6px; text-align: left; }
.ct-tutLegend span { display: flex; gap: 10px; align-items: center; padding: 7px 10px; border-radius: 12px; background: #FFF4FA; font-size: 14px; color: ${C.ink}; }
.ct-tutLegend b { min-width: 30px; font-size: 18px; text-align: center; }
.ct-tutKeys { margin: 10px 0 0; font-size: 12px; color: ${C.inkSoft}; }

.ct-photoPop { position: absolute; inset: 0; z-index: 20; display: grid; place-items: center; padding: 20px; background: rgba(42,22,64,.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: ctFade .25s ease both; }
.ct-ppCard { position: relative; width: min(100%, 330px); max-height: 100%; overflow-y: auto; padding: 14px 14px 18px; border-radius: 10px; background: #fff; transform: rotate(-2deg); box-shadow: 0 30px 60px -20px rgba(0,0,0,.55); animation: ctPolaroid .55s cubic-bezier(.2,1.4,.4,1) both; }
.ct-ppSticker { position: absolute; z-index: 2; top: 22px; right: 20px; padding: 6px 12px; border-radius: 10px; background: ${C.sun}; color: ${C.ink}; font: 700 12px ${DISPLAY}; letter-spacing: .08em; transform: rotate(6deg); box-shadow: 0 4px 0 ${C.sunDeep}; }
.ct-ppPic { aspect-ratio: 4 / 5; border-radius: 4px; overflow: hidden; background: #F3EEFA; }
.ct-ppPic img { display: block; }
.ct-ppCap { margin: 12px 4px 2px; font: 700 26px/1.15 ${HAND}; color: ${C.ink}; text-align: center; overflow-wrap: anywhere; }
.ct-ppNote { margin: 6px 4px 0; font-size: 15px; line-height: 1.5; color: ${C.inkSoft}; text-align: center; overflow-wrap: anywhere; }
.ct-ppGo { width: 100%; margin-top: 14px; }

.ct-pause { position: absolute; inset: 0; z-index: 21; display: grid; place-items: center; background: rgba(42,22,64,.5); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); animation: ctFade .2s ease both; }
.ct-pauseCard { width: min(86%, 320px); padding: 24px 20px 20px; border-radius: 28px; background: #fff; text-align: center; display: grid; gap: 12px; animation: ctPop .35s cubic-bezier(.2,1.5,.4,1) both; }
.ct-pauseT { margin: 0; font: 700 40px/1 ${DISPLAY}; color: ${C.ink}; }
.ct-pauseSub { margin: 0 0 4px; font-size: 14px; color: ${C.inkSoft}; }
.ct-pauseRow { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ct-pauseRow .ct-btn { font-size: 15px; padding: 12px 10px; }

/* ── results ── */
.ct-results { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
  padding: calc(18px + env(safe-area-inset-top, 0px)) 16px 0; background: linear-gradient(180deg, #7A5CFF 0%, #D66BFF 30%, #FF9CC8 60%, #FFE3EF 100%); }
.ct-resHead { text-align: center; color: #fff; padding-top: 8px; }
.ct-stars { display: flex; justify-content: center; gap: 4px; align-items: flex-end; }
.ct-star { font-size: 46px; line-height: 1; color: rgba(255,255,255,.3); text-shadow: 0 4px 0 rgba(42,22,64,.25); }
.ct-star:nth-child(2) { font-size: 62px; transform: translateY(-8px); }
.ct-star.is-on { color: ${C.sun}; text-shadow: 0 4px 0 ${C.sunDeep}, 0 10px 20px rgba(255,180,0,.5); animation: ctStar .6s cubic-bezier(.2,1.8,.4,1) calc(.35s + var(--i) * .22s) both; }
.ct-star.is-on:nth-child(2) { animation-name: ctStar2; }
.ct-resTitle { margin: 8px 0 0; font: 700 clamp(34px, 10vw, 46px)/1 ${DISPLAY}; text-shadow: 0 4px 0 ${C.ink}, 0 12px 24px rgba(42,22,64,.35); animation: ctPop .5s cubic-bezier(.2,1.5,.4,1) .15s both; }
.ct-resSub { margin: 10px auto 0; max-width: 320px; font: 500 15px/1.4 ${DISPLAY}; opacity: .95; }
.ct-resScore { position: relative; display: inline-grid; margin-top: 14px; padding: 10px 28px; border-radius: 22px; background: rgba(42,22,64,.35); }
.ct-resScoreN { font: 700 48px/1 ${DISPLAY}; font-variant-numeric: tabular-nums; }
.ct-resScoreL { font: 600 12px ${DISPLAY}; letter-spacing: .2em; text-transform: uppercase; opacity: .8; }
.ct-newBest { position: absolute; top: -14px; right: -34px; padding: 6px 10px; border-radius: 10px; background: ${C.sun}; color: ${C.ink}; font: 700 13px ${DISPLAY}; transform: rotate(12deg); box-shadow: 0 4px 0 ${C.sunDeep}; animation: ctStamp .5s cubic-bezier(.2,1.8,.4,1) 1.5s both; }
.ct-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin: 18px 0 0; }
.ct-tile { background: rgba(255,255,255,.9); border-radius: 18px; padding: 10px 12px; display: grid; gap: 1px; box-shadow: 0 5px 0 rgba(42,22,64,.12); animation: ctRise .5s cubic-bezier(.2,1,.3,1) both; }
.ct-tile b { font: 700 20px ${DISPLAY}; color: ${C.ink}; }
.ct-tile span { font-size: 12px; color: ${C.inkSoft}; }
.ct-resActs { display: grid; gap: 14px; margin: 18px 0 6px; }
.ct-resLetter { font-size: 19px; min-height: 58px; }
.ct-card { margin-top: 16px; padding: 16px; border-radius: 24px; background: rgba(255,255,255,.88); box-shadow: 0 16px 30px -22px rgba(60,10,70,.5); }
.ct-cardT { margin: 0 0 12px; font: 700 18px ${DISPLAY}; color: ${C.ink}; }
.ct-gallery { display: flex; gap: 12px; overflow-x: auto; padding: 6px 2px 10px; scroll-snap-type: x mandatory; }
.ct-gPol { flex: none; width: 116px; padding: 7px 7px 8px; border: 0; background: #fff; border-radius: 4px; box-shadow: 0 10px 18px -10px rgba(60,10,70,.55); transform: rotate(var(--r)); cursor: pointer; scroll-snap-align: start; transition: transform .2s; }
.ct-gPol:hover { transform: rotate(0) translateY(-3px); }
.ct-gPic { display: block; aspect-ratio: 1; overflow: hidden; border-radius: 2px; background: #F3EEFA; }
.ct-gPic img { display: block; }
.ct-gCap { display: block; margin-top: 6px; font: 700 15px/1.1 ${HAND}; color: ${C.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ct-gPol.is-missed .ct-gPic img { filter: blur(6px) grayscale(.6); transform: scale(1.15); }
.ct-gPol.is-missed .ct-gCap { font: 600 11px ${BODY}; color: ${C.inkSoft}; }

.ct-paper { position: relative; margin-top: 16px; padding: 22px 18px 20px; border-radius: 6px; background: ${C.cream};
  background-image: repeating-linear-gradient(transparent 0 31px, rgba(124,92,255,.12) 31px 32px); box-shadow: 0 24px 40px -24px rgba(60,10,70,.55); }
.ct-paper::before { content: ""; position: absolute; left: 50%; top: -10px; width: 90px; height: 22px; margin-left: -45px; background: rgba(255,216,77,.85); transform: rotate(-2deg); }
.ct-paperKick { margin: 0; font: 700 12px ${DISPLAY}; letter-spacing: .16em; text-transform: uppercase; color: ${C.pink}; text-align: center; }
.ct-paperTo { margin: 12px 0 8px; font: 700 30px/1.1 ${HAND}; color: ${C.ink}; }
.ct-lines { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.ct-lineRow { display: flex; gap: 10px; align-items: flex-start; animation: ctDrop .6s cubic-bezier(.3,1.5,.5,1) calc(.3s + var(--i) * .14s) both; }
.ct-lineEmoji { flex: none; width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; background: #FFE9F3; font-size: 17px; }
.ct-lineTx { font-size: 15.5px; line-height: 1.5; color: ${C.ink}; overflow-wrap: anywhere; padding-top: 4px; }
.ct-late { display: inline-block; margin-left: 6px; padding: 1px 7px; border-radius: 8px; background: #EDE7F5; color: ${C.inkSoft}; font: 600 11px ${BODY}; font-style: normal; }
.ct-lineHidden { position: relative; display: block; width: 100%; text-align: left; border: 0; background: none; padding: 4px 0 0; cursor: pointer; font: inherit; color: inherit; }
.ct-blur { display: block; font-size: 15.5px; line-height: 1.5; filter: blur(5px); opacity: .55; -webkit-user-select: none; user-select: none; }
.ct-tapRev { position: absolute; left: 0; top: 50%; transform: translateY(-50%); padding: 5px 10px; border-radius: 99px; background: ${C.ink}; color: #fff; font: 600 12px ${DISPLAY}; box-shadow: 0 4px 10px -4px rgba(0,0,0,.4); }
.ct-closing { margin: 18px 0 0; font-size: 16px; line-height: 1.55; color: ${C.ink}; font-weight: 600; overflow-wrap: anywhere; }
.ct-signed { margin: 12px 0 0; text-align: right; font: 700 26px ${HAND}; color: ${C.pink}; overflow-wrap: anywhere; }
.ct-board { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.ct-board li { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 14px; background: #F7F3FC; font-size: 14px; }
.ct-board li.is-you { background: #FFE3F0; outline: 2px solid ${C.pink}; }
.ct-board li.is-dev { background: #FFF6D6; }
.ct-rank { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: ${C.ink}; color: #fff; font: 700 12px ${DISPLAY}; flex: none; }
.ct-bName { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${C.ink}; }
.ct-bScore { font: 700 16px ${DISPLAY}; color: ${C.ink}; font-variant-numeric: tabular-nums; }
.ct-boardNote { margin: 10px 0 0; font-size: 12px; color: ${C.inkSoft}; }

/* keyframes */
@keyframes ctFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes ctPop { 0% { opacity: 0; transform: scale(.6) } 100% { opacity: 1; transform: none } }
@keyframes ctRise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes ctSlideIn { from { opacity: 0; transform: translateX(-16px) } to { opacity: 1; transform: none } }
@keyframes ctDrop { 0% { opacity: 0; transform: translateY(-40px) rotate(-3deg) } 70% { opacity: 1; transform: translateY(3px) rotate(.5deg) } 100% { opacity: 1; transform: none } }
@keyframes ctLetter { 0%, 70%, 100% { transform: translateY(0) scale(1) } 78% { transform: translateY(-14px) scale(1.05, .95) } 88% { transform: translateY(0) scale(1.08, .9) } }
@keyframes ctBob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
@keyframes ctTwinkle { 0%, 100% { opacity: .3; transform: scale(.7) } 50% { opacity: 1; transform: scale(1.15) } }
@keyframes ctPulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.05) } }
@keyframes ctDrift { from { transform: translateY(0) rotate(0) } to { transform: translateY(115vh) rotate(200deg) } }
@keyframes ctBump { 0% { transform: scale(1) } 40% { transform: scale(1.25) } 100% { transform: scale(1) } }
@keyframes ctLose { 0% { transform: scale(1.4) } 100% { transform: scale(.8) } }
@keyframes ctToast { 0% { opacity: 0; transform: translateY(-16px) scale(.96) } 8% { opacity: 1; transform: none } 88% { opacity: 1; transform: none } 100% { opacity: 0; transform: translateY(-10px) } }
@keyframes ctBanner { 0% { opacity: 0; transform: scale(.4) } 14% { opacity: 1; transform: scale(1.08) } 22% { transform: scale(1) } 82% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(1.2) } }
@keyframes ctCount { 0% { opacity: 0; transform: scale(2.2) } 60% { opacity: 1; transform: scale(.92) } 100% { opacity: 1; transform: scale(1) } }
@keyframes ctSwipe { 0%, 100% { transform: translateX(-70px) rotate(-8deg) } 50% { transform: translateX(40px) rotate(8deg) } }
@keyframes ctPolaroid { 0% { opacity: 0; transform: scale(.3) rotate(-24deg) translateY(120px) } 100% { opacity: 1; transform: rotate(-2deg) } }
@keyframes ctStar { 0% { opacity: 0; transform: scale(0) rotate(-90deg) } 100% { opacity: 1; transform: scale(1) rotate(0) } }
@keyframes ctStar2 { 0% { opacity: 0; transform: translateY(-8px) scale(0) rotate(-90deg) } 100% { opacity: 1; transform: translateY(-8px) scale(1) rotate(0) } }
@keyframes ctStamp { 0% { opacity: 0; transform: scale(2.4) rotate(12deg) } 100% { opacity: 1; transform: scale(1) rotate(12deg) } }

@media (prefers-reduced-motion: reduce) {
  .ct-root *, .ct-root *::before, .ct-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; animation-delay: 0s !important; transition-duration: .01ms !important; }
  .ct-drift { display: none; }
  .ct-lineToast, .ct-level { animation: none !important; }
}
`;
