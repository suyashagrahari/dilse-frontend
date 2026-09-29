// All of the parody app's CSS, prefixed `sn`. One string, injected once.

import { C, FONT } from "./tokens";

const NAV = "58px";
const SAFE_B = "env(safe-area-inset-bottom, 0px)";
const SAFE_T = "env(safe-area-inset-top, 0px)";

export const SNAP_CSS = `
.snApp { position: relative; width: 100%; height: 100vh; height: 100dvh; overflow: hidden; font-family: ${FONT}; color: ${C.ink};
  background: #000; -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent; }
.snApp *, .snApp *::before, .snApp *::after { box-sizing: border-box; }
.snApp button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.snApp button:focus-visible, .snApp input:focus-visible { outline: 2px solid ${C.chat}; outline-offset: 2px; }
.snApp img { user-select: none; -webkit-user-drag: none; }
.snFlex { flex: 1; }

/* ── phone shell ── */
.snPhone { position: absolute; inset: 0; }
.snTab { position: absolute; left: 0; right: 0; top: 0; bottom: calc(${NAV} + ${SAFE_B}); overflow: hidden; background: #fff; }
.snTab.is-full { bottom: 0; background: #000; }
.snNav { position: absolute; left: 0; right: 0; bottom: 0; height: calc(${NAV} + ${SAFE_B}); padding-bottom: ${SAFE_B}; display: flex; align-items: stretch; z-index: 40; }
.snNav.is-dark { background: linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.35)); }
.snNav.is-solid-dark { background: #0B0B0C; }
.snNav.is-light { background: #fff; border-top: 1px solid ${C.line}; }
.snNav button { flex: 1; border: 0; background: none; display: grid; place-items: center; position: relative; min-height: 48px; transition: transform .15s; }
.snNav button:active { transform: scale(.88); }
.snNavBadge { position: absolute; top: 9px; left: calc(50% + 6px); min-width: 17px; height: 17px; padding: 0 5px; border-radius: 99px; background: ${C.snapRed}; color: #fff; font-size: 10.5px; font-weight: 800; display: grid; place-items: center; border: 2px solid #fff; animation: snPop .4s cubic-bezier(.2,1.6,.4,1) both; }
.snNav.is-dark .snNavBadge, .snNav.is-solid-dark .snNavBadge { border-color: #000; }
.snSlide { position: absolute; inset: 0; z-index: 60; background: #fff; animation: snSlideIn .32s cubic-bezier(.2,.9,.3,1) both; }

/* ── wide shell (tablet + desktop, like the web app) ── */
.snWide { position: absolute; inset: 0; display: grid; grid-template-columns: 76px 360px minmax(0,1fr); background: #fff; }
@media (max-width: 1100px) { .snWide { grid-template-columns: 64px 300px minmax(0,1fr); } }
.snRailNav { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 0; border-right: 1px solid ${C.line}; background: #fff; }
.snRailNav .snMark { margin-bottom: 14px; }
.snRailNav button { width: 50px; height: 50px; border-radius: 16px; border: 0; background: none; display: grid; place-items: center; position: relative; color: ${C.ink2}; transition: background .15s; }
.snRailNav button:hover { background: ${C.soft}; }
.snRailNav button.is-on { background: #EFEFF1; }
.snRailNav .snNavBadge { top: 6px; left: 30px; }
.snListCol { position: relative; border-right: 1px solid ${C.line}; overflow: hidden; background: #fff; }
.snPane { position: relative; overflow: hidden; background: radial-gradient(120% 90% at 50% 0%, #FFFDE0 0%, #F5F5F6 60%); }
.snPane > .snConvo, .snPane > .snProfile, .snPane > .snStories, .snPane > .snMap { position: absolute; inset: 0; }
.snPaneFrame { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); height: min(calc(100% - 40px), 880px); aspect-ratio: 9 / 16; max-width: calc(100% - 32px);
  border-radius: 22px; overflow: hidden; box-shadow: 0 30px 70px -30px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.06); background: #000; }
.snPaneFrame > * { position: absolute; inset: 0; }
.snPaneHint { position: absolute; left: 0; right: 0; bottom: 14px; text-align: center; font-size: 12.5px; color: ${C.mute}; font-weight: 600; pointer-events: none; }

/* ── camera ── */
.snCam { position: absolute; inset: 0; background: #000; overflow: hidden; color: #fff; }
.snCamFeed { position: absolute; inset: -2%; overflow: hidden; animation: snKen 22s ease-in-out infinite alternate; transition: filter .35s ease; }
.snCamImg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: snFadeIn .45s ease both; }
.snCamImg.is-still { animation: none; }
.snCamEmpty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(160deg,#FFD1E3,#C8B6FF 55%,#9FD8FF); }
.snCamShade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to bottom, rgba(0,0,0,.35), transparent 18%, transparent 62%, rgba(0,0,0,.45)); }
.snShutter { position: absolute; inset: 0; background: #fff; pointer-events: none; animation: snShut .32s ease-out forwards; z-index: 30; }
.snFlashTint { position: absolute; inset: 0; background: rgba(255,247,200,.16); pointer-events: none; }
.snCamTop { position: absolute; top: calc(10px + ${SAFE_T}); left: 12px; right: 12px; display: flex; align-items: center; gap: 10px; z-index: 5; }
.snCamAv { width: 42px; height: 42px; border-radius: 50%; border: 0; padding: 2px; background: rgba(255,255,255,.2); display: grid; place-items: center; }
.snCamAv.is-light { background: #fff; box-shadow: 0 4px 14px -4px rgba(0,0,0,.3); }
.snGlass { width: 42px; height: 42px; border-radius: 50%; border: 0; background: rgba(0,0,0,.28); display: grid; place-items: center; }
.snCamRail { position: absolute; right: 10px; top: calc(62px + ${SAFE_T}); display: flex; flex-direction: column; gap: 4px; z-index: 5; padding: 6px 0; border-radius: 99px; background: rgba(0,0,0,.18); }
.snRailBtn { width: 42px; height: 42px; border: 0; background: none; display: grid; place-items: center; filter: drop-shadow(0 1px 2px rgba(0,0,0,.45)); transition: transform .15s; }
.snRailBtn:active { transform: scale(.85); }
.snPrompt { position: absolute; top: calc(66px + ${SAFE_T}); left: 50%; transform: translateX(-50%); max-width: calc(100% - 140px); z-index: 5; border: 0;
  padding: 9px 14px; border-radius: 99px; background: rgba(0,0,0,.5); color: #fff; font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  box-shadow: 0 6px 18px -8px rgba(0,0,0,.5); animation: snDrop .5s cubic-bezier(.2,1.4,.4,1) .3s both; }
.snPrompt.is-done { background: ${C.yellow}; color: #111; }
.snCamBottom { position: absolute; left: 0; right: 0; bottom: calc(${NAV} + ${SAFE_B} + 8px); z-index: 5; }
.snCam.is-framed .snCamBottom { bottom: 18px; }
.snLensName { margin: 0 0 6px; text-align: center; font-size: 13px; font-weight: 800; text-shadow: 0 1px 4px rgba(0,0,0,.6); animation: snFadeIn .3s ease both; }
.snLensRow { position: relative; height: 88px; }
.snLensClip { position: absolute; inset: 0; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 72px, #000 calc(100% - 72px), transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 72px, #000 calc(100% - 72px), transparent 100%); }
.snLensStrip { position: absolute; left: calc(50% - 27px); top: 17px; display: flex; gap: 10px; transition: transform .38s cubic-bezier(.2,.9,.3,1); }
.snLens { position: relative; width: 54px; height: 54px; flex: none; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,.9); padding: 0; background: #333; box-shadow: 0 4px 12px -4px rgba(0,0,0,.6); transition: transform .2s, opacity .2s; }
.snLens img { position: absolute; inset: 0; }
.snLens:active { transform: scale(.9); }
.snLens.is-on { opacity: 0; }
.snLensEmoji { position: absolute; inset: 0; display: grid; place-items: center; font-size: 22px; background: rgba(0,0,0,.18); }
.snCapture { position: absolute; left: 50%; top: 4px; width: 80px; height: 80px; margin-left: -40px; border: 0; background: none; border-radius: 50%; display: grid; place-items: center; transition: transform .15s; z-index: 2; }
.snCapture:active { transform: scale(.9); }
.snCaptureRing { position: absolute; inset: 0; border-radius: 50%; border: 6px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.08), 0 6px 18px -6px rgba(0,0,0,.6); }
.snCaptureLens { font-size: 34px; animation: snPop .35s cubic-bezier(.2,1.6,.4,1) both; }
.snCamSide { position: absolute; top: 26px; width: 40px; height: 40px; border-radius: 50%; border: 0; background: rgba(0,0,0,.35); display: grid; place-items: center; z-index: 3; }
.snCamSide.is-left { left: 14px; }
.snCamSide.is-right { right: 14px; }

/* lens fx */
.snFxRain { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
.snFxRain i { position: absolute; bottom: -40px; font-style: normal; color: #FF4F8B; text-shadow: 0 2px 8px rgba(255,79,139,.5); animation: snFloatUp linear infinite; opacity: 0; }
.snFxRain--sparkle i { color: #FFF6A8; text-shadow: 0 0 10px rgba(255,255,255,.9); }
.snFxGolden { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(60% 45% at 80% 12%, rgba(255,200,90,.55), transparent 70%), linear-gradient(to top, rgba(255,120,60,.18), transparent 50%); mix-blend-mode: screen; z-index: 1; }
.snFxVintage { position: absolute; inset: 0; pointer-events: none; z-index: 1; background: repeating-linear-gradient(0deg, rgba(0,0,0,.04) 0 2px, transparent 2px 4px), radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.45)); }
.snFxDate { position: absolute; right: 16px; bottom: calc(${NAV} + 150px); font: 700 18px/1 ui-monospace, Menlo, monospace; color: #FF9A3C; text-shadow: 0 0 6px rgba(255,120,40,.8); letter-spacing: .08em; }
.snCam.is-framed .snFxDate, .snComposeFrame .snFxDate { bottom: 140px; }
.snFxBlush { position: absolute; inset: 0; pointer-events: none; z-index: 1; background: radial-gradient(40% 30% at 50% 45%, rgba(255,150,190,.18), transparent 70%); }
.snFxBlush i { position: absolute; font-style: normal; font-size: 30px; animation: snBob 2.4s ease-in-out infinite; }

/* ── compose ── */
.snCompose { position: fixed; inset: 0; z-index: 150; background: #000; animation: snFadeIn .2s ease both; }
.snComposeFrame { position: absolute; inset: 0; overflow: hidden; color: #fff; }
.snComposeFrame .snCamFeed { animation: none; inset: 0; }
.snStickerOn { position: absolute; font-size: 54px; z-index: 3; animation: snPop .45s cubic-bezier(.2,1.6,.4,1) both; filter: drop-shadow(0 4px 8px rgba(0,0,0,.35)); pointer-events: none; }
.snCaptionBand { position: absolute; left: 0; right: 0; top: 57%; z-index: 4; background: rgba(0,0,0,.55); }
.snCaptionBand input { width: 100%; border: 0; background: transparent; color: #fff; text-align: center; font: 600 17px/1.3 ${FONT}; padding: 10px 16px; outline: none; }

.snApp .snCaptionBand input:focus-visible, .snCompose .snCaptionBand input:focus-visible { outline: none; }
.snCaptionBand input::placeholder { color: rgba(255,255,255,.72); }
.snComposeX { position: absolute; top: calc(12px + ${SAFE_T}); left: 10px; z-index: 5; width: 44px; height: 44px; border: 0; background: none; display: grid; place-items: center; filter: drop-shadow(0 1px 3px rgba(0,0,0,.5)); }
.snEditRail { position: absolute; right: 8px; top: calc(12px + ${SAFE_T}); z-index: 5; display: flex; flex-direction: column; gap: 6px; }
.snEditRail button { width: 44px; height: 42px; border: 0; background: none; display: grid; place-items: center; filter: drop-shadow(0 1px 3px rgba(0,0,0,.55)); position: relative; }
.snTimerTool small { position: absolute; right: 4px; bottom: 4px; font-size: 10px; font-weight: 800; background: #fff; color: #000; border-radius: 99px; padding: 0 4px; line-height: 14px; }
.snComposeBar { position: absolute; left: 12px; right: 12px; bottom: calc(16px + ${SAFE_B}); z-index: 5; display: flex; align-items: center; gap: 10px; }
.snComposeSave { width: 46px; height: 46px; border-radius: 50%; border: 0; background: rgba(0,0,0,.4); display: grid; place-items: center; }
.snComposeStory { height: 46px; padding: 0 16px 0 8px; border-radius: 99px; border: 0; background: rgba(0,0,0,.4); display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14.5px; }
.snSendTo { margin-left: auto; height: 50px; padding: 0 22px; border-radius: 99px; border: 0; background: ${C.chat}; color: #fff !important; font-size: 16.5px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 8px 22px -8px rgba(14,173,255,.8); animation: snPop .4s cubic-bezier(.2,1.5,.4,1) .15s both; }
.snSendSheetWrap { position: absolute; inset: 0; z-index: 10; background: rgba(0,0,0,.35); animation: snFadeIn .2s ease both; }
.snSendSheet { position: absolute; left: 0; right: 0; bottom: 0; background: #fff; color: ${C.ink}; border-radius: 22px 22px 0 0; padding: 8px 16px calc(16px + ${SAFE_B}); animation: snSlideUp .32s cubic-bezier(.2,.9,.3,1) both; }
.snSheetGrab { width: 38px; height: 5px; border-radius: 9px; background: #D9DADC; margin: 2px auto 10px; }
.snSendSearch { height: 40px; border-radius: 99px; background: ${C.soft}; color: ${C.mute}; display: flex; align-items: center; padding: 0 16px; font-weight: 600; font-size: 14.5px; }
.snSendHead { margin: 14px 2px 6px; font-size: 13px; font-weight: 800; color: ${C.ink2}; }
.snSendRow { display: flex; align-items: center; gap: 12px; padding: 8px 6px; border-radius: 14px; }
.snSendRow.is-on { background: #F0FAFF; }
.snSendWho { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.snSendWho b { font-size: 16px; }
.snSendWho span { font-size: 12.5px; color: ${C.mute}; font-weight: 600; }
.snCheck { width: 26px; height: 26px; border-radius: 50%; background: ${C.chat}; color: #fff; display: grid; place-items: center; font-size: 14px; font-weight: 900; animation: snPop .35s cubic-bezier(.2,1.6,.4,1) both; }
.snSecret { display: block; margin-top: 12px; padding: 10px 12px; border-radius: 14px; background: #F6F1FF; }
.snSecretHead { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 800; color: ${C.purple}; }
.snSecretHead em { font-style: normal; font-weight: 600; color: ${C.mute}; }
.snSecret input { width: 100%; margin-top: 6px; border: 0; background: #fff; border-radius: 10px; padding: 10px 12px; font: 500 16px ${FONT}; color: ${C.ink}; outline: none; box-shadow: inset 0 0 0 1px #E6DCFA; }
.snSendNote { margin: 12px 4px 0; font-size: 13px; color: ${C.ink2}; }
.snSendBar { width: 100%; margin-top: 14px; height: 54px; border: 0; border-radius: 99px; background: ${C.chat}; color: #fff !important; display: flex; align-items: center; padding: 0 6px 0 20px; font-weight: 800; font-size: 16px; }
.snSendNames { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.snSendGo { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.2); display: grid; place-items: center; }

/* ── viewer ── */
.snViewer { position: fixed; inset: 0; z-index: 170; background: #000; animation: snZoomIn .28s cubic-bezier(.2,.9,.3,1) both; }
.snViewerCard { position: absolute; inset: 0; overflow: hidden; color: #fff; }
.snViewerMedia { position: absolute; inset: 0; cursor: pointer; }
.snViewerImg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: snFadeIn .3s ease both; }
.snViewerBg { position: absolute; inset: 0; animation: snFadeIn .3s ease both; }
.snViewerCap { position: absolute; left: 0; right: 0; top: 58%; background: rgba(0,0,0,.55); text-align: center; font-size: 17px; line-height: 1.35; font-weight: 600; padding: 10px 18px; overflow-wrap: anywhere; animation: snFadeIn .4s ease .1s both; }
.snViewerCap.is-big { top: 38%; background: none; font-size: clamp(26px, 7vw, 38px); font-weight: 800; line-height: 1.15; text-shadow: 0 3px 16px rgba(0,0,0,.35); padding: 0 28px; }
.snViewerSub { position: absolute; left: 14px; right: 14px; bottom: calc(80px + ${SAFE_B}); margin: 0; font-size: 14.5px; line-height: 1.45; padding: 11px 14px; border-radius: 14px; background: rgba(0,0,0,.42); overflow-wrap: anywhere; animation: snRise .45s ease .2s both; }
.snBars { position: absolute; top: calc(8px + ${SAFE_T}); left: 8px; right: 8px; display: flex; gap: 4px; z-index: 5; pointer-events: none; }
.snBar { flex: 1; height: 3px; border-radius: 3px; background: rgba(255,255,255,.35); overflow: hidden; }
.snBar i { display: block; height: 100%; width: 0; background: #fff; }
.snBar i.is-full { width: 100%; }
.snBar i.is-run { animation: snGrow linear forwards; }
.snBar i.is-still { animation: none !important; width: 0; }
.snViewerTop { position: absolute; top: calc(20px + ${SAFE_T}); left: 12px; right: 8px; display: flex; align-items: center; gap: 10px; z-index: 5; }
.snViewerWho { display: flex; flex-direction: column; text-shadow: 0 1px 4px rgba(0,0,0,.5); min-width: 0; }
.snViewerWho b { font-size: 15px; }
.snViewerWho span { font-size: 12px; opacity: .85; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.snRing { transform: rotate(-90deg); filter: drop-shadow(0 1px 3px rgba(0,0,0,.4)); }
.snRing text { transform: rotate(90deg); transform-origin: 18px 18px; }
.snRingRun { stroke-dasharray: 100; stroke-dashoffset: 0; animation: snDeplete linear forwards; }
.snRingRun.is-still { animation: none !important; }
.snViewerX { width: 40px; height: 40px; border: 0; background: none; display: grid; place-items: center; filter: drop-shadow(0 1px 3px rgba(0,0,0,.5)); }
.snViewerReply { position: absolute; left: 12px; right: 12px; bottom: calc(14px + ${SAFE_B}); display: flex; align-items: center; gap: 10px; z-index: 5; }
.snReplyCam { width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(0,0,0,.35); display: grid; place-items: center; }
.snReplyInput { flex: 1; height: 44px; border-radius: 99px; border: 1.5px solid rgba(255,255,255,.6); background: rgba(0,0,0,.2); color: #fff; text-align: left; padding: 0 16px; font-weight: 600; font-size: 14.5px; }
.snReplyHeart { font-size: 26px; animation: snBob 2s ease-in-out infinite; }
.snLockedSnap { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 10px; text-align: center; padding: 30px; background: rgba(30,14,56,.55); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
.snLockedSnap b { font-size: 20px; }
.snLockedSnap span { font-size: 14px; opacity: .85; }
.snLockedIc { width: 72px; height: 72px; border-radius: 50%; background: ${C.purple}; display: grid !important; place-items: center; box-shadow: 0 0 0 10px rgba(160,93,205,.25); animation: snThrob 1.8s ease-in-out infinite; opacity: 1 !important; }
.snLockedGo { margin-top: 8px; height: 46px; padding: 0 22px; border-radius: 99px; border: 0; background: ${C.yellow}; color: #111 !important; font-weight: 800; font-size: 15.5px; }

/* ── shared chrome on white surfaces ── */
.snHead { display: flex; align-items: center; gap: 8px; padding: calc(10px + ${SAFE_T}) 12px 8px; background: #fff; }
.snChat.is-embedded .snHead { padding-top: 14px; }
.snHeadAv { width: 40px; height: 40px; border: 0; padding: 0; background: none; border-radius: 50%; display: grid; place-items: center; }
.snHeadTitle { flex: 1; margin: 0; text-align: center; font-size: 20px; font-weight: 800; letter-spacing: -.01em; }
.snRound { width: 38px; height: 38px; flex: none; border-radius: 50%; border: 0; background: #F0F0F2; color: ${C.ink}; display: grid; place-items: center; transition: transform .15s, background .15s; }
.snRound:active { transform: scale(.9); }
.snRound.is-white { background: #fff; box-shadow: 0 4px 14px -6px rgba(0,0,0,.35); }
.snRoundGhost { width: 38px; flex: none; }
.snIconBtn { width: 40px; height: 40px; border: 0; background: none; display: grid; place-items: center; color: ${C.ink}; }
.snPill { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px; padding: 0 20px; border-radius: 99px; border: 0; background: #F0F0F2; color: ${C.ink}; font-size: 15px; font-weight: 800; transition: transform .15s; }
.snPill:active { transform: scale(.95); }
.snPill.is-blue { background: ${C.chat}; color: #fff !important; }
.snPill.is-yellow { background: ${C.yellow}; color: #111 !important; box-shadow: 0 10px 26px -10px rgba(255,220,0,.8); }
.snPill.is-ghost { background: rgba(255,255,255,.14); color: #fff !important; }
.snListFoot { text-align: center; font-size: 12px; color: ${C.mute}; margin: 18px 16px 26px; }

/* ── chat list ── */
.snChat { position: absolute; inset: 0; display: flex; flex-direction: column; background: #fff; }
.snChatScroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
.snBanner { display: flex; align-items: center; gap: 12px; width: calc(100% - 24px); margin: 4px 12px 8px; padding: 12px 14px; border-radius: 16px; border: 1px solid #F1E47E; background: #FFFBD1; text-align: left; animation: snDrop .45s cubic-bezier(.2,1.3,.4,1) both; }
.snBanner b { display: block; font-size: 14.5px; font-weight: 800; }
.snBanner small { display: block; font-size: 12.5px; color: ${C.ink2}; margin-top: 2px; font-weight: 600; }
.snBanner.is-restore { background: #FFEEF1; border-color: #FFC7D2; }
.snBanner.is-paused { background: ${C.soft}; border-color: ${C.line}; }
.snBannerEmoji { font-size: 26px; animation: snBob 2.2s ease-in-out infinite; }
.snRows { list-style: none; margin: 0; padding: 0; }
.snRow { display: flex; align-items: center; gap: 12px; padding: 9px 12px 9px 14px; border-bottom: 1px solid #F3F3F4; transition: background .15s; }
.snRow:hover { background: #FAFAFB; }
.snRow.is-them { animation: snRise .4s ease both; }
.snRowAv { border: 0; background: none; padding: 0; display: grid; place-items: center; flex: none; }
.snRowMain { flex: 1; min-width: 0; border: 0; background: none; padding: 4px 0; display: flex; flex-direction: column; gap: 3px; text-align: left; }
.snRowName { font-size: 16.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.snRow.is-new .snRowName { font-weight: 800; }
.snPin { font-size: 11px; opacity: .6; }
.snRowSub { display: flex; align-items: center; gap: 5px; font-size: 13px; color: ${C.mute}; font-weight: 600; white-space: nowrap; overflow: hidden; }
.snRowSub .is-strong { font-weight: 800; }
.snDot { color: ${C.mute}; font-weight: 600; }
.snStreakTag { display: inline-flex; align-items: center; gap: 2px; margin-left: 4px; color: ${C.ink}; font-weight: 800; font-size: 13px; }
.snStreakTag b { font-weight: 800; }
.snStreakTag.is-paused { opacity: .45; filter: grayscale(1); }
.snRowCam { width: 42px; height: 42px; border: 0; background: none; display: grid; place-items: center; flex: none; }

/* ── conversation ── */
.snConvo { position: absolute; inset: 0; display: flex; flex-direction: column; background: #fff; }
.snConvoHead { display: flex; align-items: center; gap: 6px; padding: calc(8px + ${SAFE_T}) 10px 8px 6px; border-bottom: 1px solid ${C.line}; background: #fff; }
.snConvo.is-embedded .snConvoHead { padding: 12px 14px 10px; }
.snConvoWho { display: flex; align-items: center; gap: 10px; border: 0; background: none; text-align: left; padding: 2px 4px; min-width: 0; }
.snConvoWho span { display: flex; flex-direction: column; min-width: 0; }
.snConvoWho b { font-size: 16px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.snConvoWho small { font-size: 12px; color: ${C.mute}; font-weight: 700; white-space: nowrap; }
.snConvoScroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 4px 0 14px; }
.snConvoIntro { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 22px 16px 10px; text-align: center; }
.snConvoIntro b { font-size: 18px; margin-top: 6px; }
.snConvoIntro span { font-size: 12.5px; color: ${C.mute}; font-weight: 600; }
.snSep { margin: 16px 0 6px; text-align: center; font-size: 11px; font-weight: 800; letter-spacing: .07em; color: ${C.mute}; }
.snOlder { display: block; margin: 12px auto 0; border: 0; background: ${C.soft}; border-radius: 99px; padding: 8px 14px; font-size: 12.5px; font-weight: 800; color: ${C.ink2}; }
.snGroup { margin: 2px 0 8px; animation: snRise .35s ease both; }
.snGroupName { margin: 0 14px 2px; font-size: 11.5px; font-weight: 900; letter-spacing: .03em; }
.snMsg { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; margin: 0; padding: 4px 14px 4px 12px; border-left: 2.5px solid var(--bar); margin-left: 14px; font-size: 16px; line-height: 1.38; overflow-wrap: anywhere; }
.snMsg.is-saved { background: ${C.saved}; }
.snMsgText { min-width: 0; }
.snMsg.is-word .snMsgText { font-weight: 600; }
.snMsg.is-snap .snMsgText { font-weight: 800; color: ${C.snapRed}; font-size: 14.5px; }
.snMsg.is-lock .snMsgText { color: ${C.mute}; font-style: italic; font-size: 14.5px; }
.snMsg.is-note .snMsgText { font-style: italic; color: #5B3F8C; }
.snMsg.is-letter .snMsgText, .snMsg.is-tap .snMsgText { font-weight: 800; }
.snMsg.is-letter .snMsgText { color: ${C.purple}; }
.snMsg.is-tap { cursor: pointer; }
.snMsg.is-tap:hover { background: #F6F6F7; }
.snMsg.is-saved.is-tap:hover { background: #E8E8EB; }
.snMsgSub { flex-basis: 100%; font-size: 11px; color: ${C.mute}; font-weight: 700; margin-top: -2px; }
.snMsg.is-local { animation: snRise .3s ease both; }
.snReact { font-size: 15px; animation: snPop .5s cubic-bezier(.2,1.8,.4,1) both; }
.snTyping { display: flex; align-items: flex-end; gap: 6px; margin: 6px 14px 0; animation: snPeek .5s cubic-bezier(.2,1.4,.4,1) both; }
.snTypingDots { display: inline-flex; gap: 4px; padding: 10px 12px; border-radius: 16px 16px 16px 4px; background: ${C.saved}; }
.snTypingDots i { width: 7px; height: 7px; border-radius: 50%; background: #A3A5A9; animation: snDots 1.1s ease-in-out infinite; }
.snTypingDots i:nth-child(2) { animation-delay: .15s; }
.snTypingDots i:nth-child(3) { animation-delay: .3s; }
.snInputBar { display: flex; align-items: center; gap: 8px; padding: 8px 10px calc(8px + ${SAFE_B}); border-top: 1px solid ${C.line}; background: #fff; }
.snInCam { width: 42px; height: 42px; flex: none; border-radius: 50%; border: 0; background: #F0F0F2; display: grid; place-items: center; color: ${C.ink}; }
.snInput { flex: 1; min-width: 0; height: 42px; display: flex; align-items: center; border-radius: 99px; background: #F0F0F2; padding: 0 5px 0 16px; transition: box-shadow .2s, background .2s; }
.snInput.is-checkin { background: #FFFCD6; box-shadow: inset 0 0 0 1.5px #F0DF55; }
.snInput input { flex: 1; min-width: 0; border: 0; background: transparent; font: 500 16px ${FONT}; color: ${C.ink}; outline: none; }
.snInput input::placeholder { color: ${C.mute}; font-weight: 600; }
.snInSend { width: 34px; height: 34px; border-radius: 50%; border: 0; background: ${C.chat}; display: grid; place-items: center; animation: snPop .25s ease both; }
.snInIcons { display: flex; gap: 0; }
.snInIcons button { width: 34px; height: 34px; border: 0; background: none; display: grid; place-items: center; color: ${C.ink2}; }

/* ── profile ── */
.snProfile { position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; background: #fff; }
.snProfHero { padding: calc(8px + ${SAFE_T}) 14px 18px; text-align: center; }
.snProfile.is-embedded .snProfHero { padding-top: 14px; }
.snProfBar { display: flex; align-items: center; }
.snProfAv { position: relative; display: inline-block; margin-top: -8px; animation: snPop .5s cubic-bezier(.2,1.4,.4,1) both; }
.snProfMeAv { position: absolute; right: -16px; bottom: -2px; border-radius: 50%; border: 3px solid #fff; display: grid; box-shadow: 0 6px 14px -6px rgba(0,0,0,.35); }
.snProfName { margin: 12px 0 2px; font-size: 25px; font-weight: 800; letter-spacing: -.01em; overflow-wrap: anywhere; }
.snProfHandle { margin: 0; font-size: 13.5px; color: ${C.ink2}; font-weight: 600; }
.snProfActs { display: flex; gap: 10px; justify-content: center; margin-top: 16px; }
.snProfBody { padding: 0 14px 20px; max-width: 720px; margin: 0 auto; }
.snCard { display: block; width: 100%; background: #fff; border-radius: 18px; border: 1px solid ${C.line}; box-shadow: 0 8px 24px -16px rgba(0,0,0,.25); padding: 14px; text-align: left; }
.snStreakCard { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg,#FFF8E6,#FFF); }
.snStreakCard b { display: block; font-size: 16px; font-weight: 800; }
.snStreakCard span { display: block; font-size: 13px; color: ${C.ink2}; font-weight: 600; margin-top: 2px; }
.snStreakFire { font-size: 36px; animation: snFlick 1.6s ease-in-out infinite; }
.snSecTitle { display: flex; align-items: center; justify-content: space-between; margin: 22px 2px 10px; font-size: 17px; font-weight: 800; }
.snSecTitle.is-pad { margin: 12px 16px 10px; }
.snSecTitle button { border: 0; background: none; color: ${C.chat}; font-size: 13.5px; font-weight: 800; }
.snCharms { display: flex; gap: 10px; overflow-x: auto; margin: 0 -14px; padding: 2px 14px 6px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.snCharms::-webkit-scrollbar { display: none; }
.snCharm { flex: none; width: 140px; min-height: 152px; border-radius: 18px; background: var(--bg); padding: 14px 12px 12px; display: flex; flex-direction: column; gap: 3px; scroll-snap-align: start; animation: snRise .45s ease both; }
.snCharm:nth-child(2) { animation-delay: .05s; } .snCharm:nth-child(3) { animation-delay: .1s; } .snCharm:nth-child(4) { animation-delay: .15s; } .snCharm:nth-child(5) { animation-delay: .2s; }
.snCharmEmoji { font-size: 34px; line-height: 1; margin-bottom: auto; padding-bottom: 12px; }
.snCharm b { font-size: 14.5px; font-weight: 800; }
.snCharm small { font-size: 11.5px; color: rgba(0,0,0,.62); line-height: 1.3; font-weight: 600; }
.snProfGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; border-radius: 14px; overflow: hidden; }
.snProfTile { position: relative; aspect-ratio: 3 / 4; border: 0; padding: 0; overflow: hidden; background: #eee; }
.snProfTile img { position: absolute; inset: 0; transition: transform .4s; }
.snProfTile:hover img { transform: scale(1.04); }
.snProfTile span, .snMemTile span { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 7px 6px; font-size: 11px; font-weight: 800; color: #fff; text-align: left; background: linear-gradient(to top, rgba(0,0,0,.6), transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.snWords { padding: 12px 14px; }
.snWordsHead { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11.5px; font-weight: 900; letter-spacing: .04em; text-transform: uppercase; padding-bottom: 6px; }
.snWordsRow { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 7px 0; border-top: 1px solid #F3F3F4; font-size: 15px; font-weight: 600; overflow-wrap: anywhere; }
.snLetters { padding: 4px 14px; }
.snLetterRow { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 0; border: 0; border-bottom: 1px solid #F3F3F4; background: none; text-align: left; }
.snLetterRow:last-child { border-bottom: 0; }
.snLetterIc { width: 38px; height: 38px; border-radius: 12px; background: ${C.soft}; display: grid; place-items: center; font-size: 20px; flex: none; }
.snLetterRow.is-open .snLetterIc { background: #F3EAFE; animation: snBob 2.2s ease-in-out infinite; }
.snLetterTx { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.snLetterTx b { font-size: 14.5px; }
.snLetterBar { height: 6px; border-radius: 9px; background: #F0F0F2; overflow: hidden; }
.snLetterBar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#FF7A1A,#FFC21A); }
.snLetterRow small { font-size: 12px; font-weight: 800; color: ${C.mute}; }
.snLetterRow.is-open small { color: ${C.purple}; }
.snMiniMapCard { padding: 0; overflow: hidden; }
.snMini { position: relative; height: 160px; overflow: hidden; }
.snMini .snMapSvg { position: absolute; inset: 0; width: 100%; height: 100%; }
.snMiniPins { position: absolute; left: 50%; top: 44%; transform: translate(-50%,-50%); display: flex; align-items: center; gap: 2px; }
.snMiniPins > span:not(.snMiniHeart) { border: 3px solid #fff; border-radius: 50%; box-shadow: 0 6px 14px -6px rgba(0,0,0,.45); }
.snMiniHeart { font-size: 18px; animation: snThrob 1.4s ease-in-out infinite; }
.snMiniLabel { position: absolute; left: 12px; bottom: 10px; background: #fff; border-radius: 99px; padding: 6px 11px; font-size: 12.5px; font-weight: 800; box-shadow: 0 4px 12px -6px rgba(0,0,0,.35); }
.snMyEyes { display: flex; align-items: center; gap: 8px; margin-top: 16px; background: linear-gradient(135deg,#2B2140,#6B46D9); color: #fff; border: 0; }
.snMyEyes b { font-size: 15px; }
.snMyEyes span { font-size: 13px; opacity: .85; margin-left: auto; font-weight: 600; }

/* ── map ── */
.snMap { position: absolute; inset: 0; overflow: hidden; background: #F2EFE6; }
.snMap > .snMapSvg { position: absolute; inset: 0; width: 100%; height: 100%; }
.snHeat { position: absolute; left: 50%; top: 44%; width: 0; height: 0; pointer-events: none; }
.snHeat i { position: absolute; left: -130px; top: -130px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(255,90,140,.38), rgba(255,160,90,.18) 45%, transparent 70%); animation: snHeat 3.4s ease-in-out infinite; }
.snHeat i:nth-child(2) { left: -60px; top: -170px; width: 170px; height: 170px; animation-delay: -1.1s; }
.snHeat i:nth-child(3) { left: -140px; top: -40px; width: 190px; height: 190px; animation-delay: -2.2s; }
.snPins { position: absolute; left: 50%; top: 44%; transform: translate(-50%,-60%); display: flex; align-items: flex-end; gap: 4px; }
.snPin2 { display: flex; flex-direction: column; align-items: center; gap: 6px; animation: snBob 2.6s ease-in-out infinite; }
.snPin2.is-me { animation-delay: -1.3s; }
.snPin2 > span:first-child { border: 4px solid #fff; border-radius: 50%; box-shadow: 0 10px 22px -8px rgba(0,0,0,.45); }
.snPinName { background: #fff; border-radius: 99px; padding: 3px 9px; font-size: 12px; font-weight: 800; box-shadow: 0 4px 10px -6px rgba(0,0,0,.4); }
.snPinHeart { font-size: 26px; margin-bottom: 44px; animation: snThrob 1.3s ease-in-out infinite; }
.snPlace { position: absolute; left: 50%; top: calc(44% + 46px); transform: translateX(-50%); background: #fff; border-radius: 99px; padding: 8px 14px; font-size: 13.5px; font-weight: 800; white-space: nowrap; box-shadow: 0 8px 20px -10px rgba(0,0,0,.45); max-width: calc(100% - 40px); overflow: hidden; text-overflow: ellipsis; }
.snMapTop { position: absolute; top: calc(10px + ${SAFE_T}); left: 12px; right: 12px; display: flex; align-items: center; gap: 8px; }
.snWeather { background: #fff; border-radius: 99px; padding: 8px 12px; font-size: 13px; font-weight: 800; box-shadow: 0 4px 14px -6px rgba(0,0,0,.35); }
.snMapBottom { position: absolute; left: 12px; right: 12px; bottom: 14px; max-width: 520px; margin: 0 auto; }
.snMapCard { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 18px; padding: 12px 14px; box-shadow: 0 12px 30px -14px rgba(0,0,0,.4); animation: snRise .45s ease both; }
.snMapCard b { display: block; font-size: 15.5px; }
.snMapCard span { display: block; font-size: 12.5px; color: ${C.ink2}; font-weight: 600; }
.snMapBtns { display: flex; justify-content: space-around; margin-top: 12px; }
.snMapBtns button { display: flex; flex-direction: column; align-items: center; gap: 5px; border: 0; background: none; font-size: 12px; font-weight: 800; color: ${C.ink}; text-shadow: 0 1px 0 #fff; }
.snMapBtns button > span { width: 52px; height: 52px; border-radius: 50%; background: #fff; display: grid; place-items: center; box-shadow: 0 6px 16px -8px rgba(0,0,0,.4); }

/* ── stories ── */
.snStories { position: absolute; inset: 0; display: flex; flex-direction: column; background: #fff; }
.snStoriesScroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; }
.snRings { display: flex; gap: 14px; padding: 2px 14px 10px; overflow-x: auto; scrollbar-width: none; }
.snRingItem { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 78px; flex: none; border: 0; background: none; font-size: 12.5px; font-weight: 700; text-align: center; }
.snRingItem > span:last-child { max-width: 78px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.snRingAdd { position: relative; display: grid; place-items: center; width: 68px; height: 68px; }
.snRingAdd i { position: absolute; right: 0; bottom: 0; width: 22px; height: 22px; border-radius: 50%; background: ${C.chat}; color: #fff; font-style: normal; font-weight: 900; display: grid; place-items: center; border: 2px solid #fff; font-size: 15px; }
.snDiscover { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 0 12px 24px; }
@media (min-width: 1200px) { .snPane .snDiscover { grid-template-columns: repeat(3, 1fr); } }
.snDisc { position: relative; aspect-ratio: 9 / 15; border-radius: 14px; overflow: hidden; border: 0; padding: 0; background: #ddd; animation: snRise .45s ease both; }
.snDisc img { position: absolute; inset: 0; transition: transform .5s; }
.snDisc:hover img { transform: scale(1.05); }
.snDiscShade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.72), transparent 55%); }
.snDiscTx { position: absolute; left: 10px; right: 10px; bottom: 10px; color: #fff; text-align: left; display: flex; flex-direction: column; gap: 4px; }
.snDiscTx b { font-size: 14.5px; font-weight: 800; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.snDiscTx small { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; opacity: .92; }

/* ── spotlight ── */
.snSpot { position: absolute; inset: 0; background: #000; color: #fff; }
.snSpotTop { position: absolute; top: calc(14px + ${SAFE_T}); left: 0; right: 0; display: flex; justify-content: center; gap: 20px; z-index: 3; font-size: 16px; font-weight: 800; text-shadow: 0 1px 4px rgba(0,0,0,.5); pointer-events: none; }
.snSpotTop .is-dim { opacity: .6; }
.snSpotTop .is-on { border-bottom: 2px solid #fff; padding-bottom: 3px; }
.snSpotFeed { position: absolute; inset: 0; overflow-y: auto; scroll-snap-type: y mandatory; overscroll-behavior: contain; scrollbar-width: none; }
.snSpotFeed::-webkit-scrollbar { display: none; }
.snSpotItem { position: relative; height: 100%; scroll-snap-align: start; overflow: hidden; }
.snSpotItem img { position: absolute; inset: 0; }
.snSpotShade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.7), transparent 45%, transparent 80%, rgba(0,0,0,.35)); pointer-events: none; }
.snSpotRail { position: absolute; right: 8px; bottom: 96px; display: flex; flex-direction: column; gap: 18px; }
.snSpotRail button { display: flex; flex-direction: column; align-items: center; gap: 3px; border: 0; background: none; color: #fff; font-size: 12px; font-weight: 800; filter: drop-shadow(0 1px 3px rgba(0,0,0,.5)); }
.snSpotRail button.is-on svg { animation: snPop .4s cubic-bezier(.2,1.8,.4,1); }
.snSpotMeta { position: absolute; left: 14px; right: 72px; bottom: 22px; }
.snSpotWho { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; }
.snSpotMeta b { display: block; margin-top: 8px; font-size: 15.5px; }
.snSpotMeta p { margin: 4px 0 0; font-size: 13.5px; line-height: 1.4; opacity: .92; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.snSpotEmpty { position: absolute; inset: 0; display: grid; place-items: center; padding: 30px; text-align: center; font-weight: 700; opacity: .8; }

/* ── memories ── */
.snSheetWrap { position: fixed; inset: 0; z-index: 150; background: rgba(0,0,0,.42); animation: snFadeIn .2s ease both; }
.snSheetWrap.is-center { display: grid; place-items: center; padding: 16px; }
.snMem { position: absolute; left: 0; right: 0; bottom: 0; top: calc(26px + ${SAFE_T}); background: #fff; border-radius: 22px 22px 0 0; display: flex; flex-direction: column; animation: snSlideUp .36s cubic-bezier(.2,.9,.3,1) both; }
@media (min-width: 768px) { .snMem { left: 50%; right: auto; width: min(620px, 92vw); transform: translateX(-50%); top: 5vh; bottom: 5vh; border-radius: 22px; animation: snZoomIn .3s ease both; } }
.snMemHead { display: flex; align-items: center; padding: 10px 12px 6px; }
.snMemHead h2 { flex: 1; margin: 0; text-align: center; font-size: 18px; font-weight: 800; }
.snMemTabs { display: flex; gap: 8px; padding: 4px 12px 12px; overflow-x: auto; scrollbar-width: none; }
.snMemTabs button { flex: none; border: 0; border-radius: 99px; padding: 9px 14px; background: #F0F0F2; font-size: 13.5px; font-weight: 800; white-space: nowrap; }
.snMemTabs button.is-on { background: #111; color: #fff; }
.snMemScroll { flex: 1; overflow-y: auto; padding: 0 12px 24px; }
.snFlash { position: relative; display: block; width: 100%; height: 210px; border-radius: 18px; overflow: hidden; border: 0; padding: 0; background: #ddd; }
.snFlash img { position: absolute; inset: 0; animation: snKen 18s ease-in-out infinite alternate; }
.snFlashShade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.62), transparent 60%); }
.snFlashTx { position: absolute; left: 14px; bottom: 12px; color: #fff; text-align: left; display: flex; flex-direction: column; }
.snFlashTx small { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; opacity: .9; }
.snFlashTx b { font-size: 19px; font-weight: 800; }
.snMemMonth { margin: 18px 2px 8px; font-size: 13.5px; font-weight: 800; color: ${C.ink2}; }
.snMemGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.snMemTile { position: relative; aspect-ratio: 9 / 16; border: 0; padding: 0; border-radius: 6px; overflow: hidden; background: #eee; animation: snFadeIn .4s ease both; }
.snMemTile img { position: absolute; inset: 0; }
.snEyes { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 30px 24px 60px; text-align: center; }
.snEyes b { font-size: 20px; font-weight: 800; }
.snEyes p { margin: 0 0 8px; color: ${C.ink2}; font-size: 14.5px; max-width: 300px; }
.snEyesLock { width: 76px; height: 76px; border-radius: 50%; background: #111; display: grid; place-items: center; animation: snThrob 2s ease-in-out infinite; }

/* ── celebration ── */
.snCele { position: fixed; inset: 0; z-index: 180; display: grid; place-items: center; overflow: hidden; color: #fff; cursor: pointer;
  background: radial-gradient(circle at 50% 42%, rgba(255,128,20,.62), rgba(40,10,0,.9) 62%, rgba(0,0,0,.95)); animation: snFadeIn .3s ease both; }
.snCele.is-milestone { background: radial-gradient(circle at 50% 40%, rgba(255,214,0,.7), rgba(255,90,0,.55) 35%, rgba(30,6,0,.95) 75%); }
.snCeleRain { position: absolute; inset: 0; pointer-events: none; }
.snCeleRain i { position: absolute; top: -50px; font-style: normal; animation: snFall linear infinite; }
.snCeleBody { position: relative; z-index: 2; text-align: center; padding: 24px; max-width: 420px; cursor: default; }
.snCeleAvs { display: flex; align-items: center; justify-content: center; gap: 10px; animation: snPop .5s cubic-bezier(.2,1.5,.4,1) both; }
.snCeleAvs > span:not(.snCeleFire) { border: 3px solid #fff; border-radius: 50%; }
.snCeleFire { font-size: 58px; animation: snThrob 1s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(255,160,0,.9)); }
.snCeleNum { position: relative; height: 118px; overflow: hidden; margin-top: 8px; font-size: 104px; font-weight: 900; line-height: 118px; letter-spacing: -.03em; text-shadow: 0 6px 30px rgba(255,120,0,.8); }
.snCeleFrom, .snCeleTo { position: absolute; left: 0; right: 0; }
.snCeleFrom { animation: snNumOut .6s cubic-bezier(.6,0,.3,1) .7s both; opacity: .9; }
.snCeleTo { animation: snNumIn .7s cubic-bezier(.2,1.4,.4,1) .75s both; background: linear-gradient(180deg,#FFF6A0,#FFB020); -webkit-background-clip: text; background-clip: text; color: transparent; }
.snCeleTitle { display: block; font-size: 23px; font-weight: 800; animation: snRise .5s ease 1.2s both; overflow-wrap: anywhere; }
.snCeleLine { margin: 6px 0 20px; font-size: 15.5px; opacity: .92; animation: snRise .5s ease 1.35s both; }
.snCeleActs { display: flex; flex-direction: column; align-items: center; gap: 10px; animation: snRise .5s ease 1.5s both; }

/* ── milestone letter ── */
.snMilestone { width: 100%; max-width: 540px; max-height: 86vh; overflow-y: auto; background: #fff; border-radius: 24px; padding: 14px 16px 20px; animation: snZoomIn .32s cubic-bezier(.2,1.2,.4,1) both; box-shadow: 0 30px 80px -30px rgba(0,0,0,.6); }
.snMilestoneTop { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.snMilestoneFire { background: #FFF1E0; color: ${C.fire}; font-weight: 900; padding: 7px 13px; border-radius: 99px; font-size: 14px; }
.snMilestone .snGroupName { margin: 0 0 4px; }
.snMilestoneText { border-left: 2.5px solid ${C.them}; background: ${C.saved}; padding: 12px 14px; }
.snMilestoneText p { margin: 0 0 10px; font-size: 16px; line-height: 1.55; overflow-wrap: anywhere; }
.snMilestoneText p:last-child { margin-bottom: 0; }
.snMilestoneFoot { margin: 12px 0 0; text-align: center; font-size: 12px; color: ${C.mute}; font-weight: 700; }

/* ── toast ── */
.snToast { position: fixed; top: calc(14px + ${SAFE_T}); left: 50%; transform: translateX(-50%); z-index: 210; max-width: min(92vw, 420px); padding: 11px 16px; border-radius: 16px;
  background: rgba(22,22,24,.94); color: #fff; font-size: 13.5px; font-weight: 700; box-shadow: 0 14px 30px -12px rgba(0,0,0,.6); animation: snToast .35s cubic-bezier(.2,1.4,.4,1) both; text-align: center; pointer-events: none; }
.snSentBanner { position: fixed; top: calc(14px + ${SAFE_T}); left: 50%; transform: translateX(-50%); z-index: 210; display: flex; align-items: center; gap: 10px; padding: 8px 16px 8px 8px; border-radius: 99px; background: #fff; color: ${C.ink};
  font-weight: 800; font-size: 14px; box-shadow: 0 14px 30px -12px rgba(0,0,0,.5); animation: snToast .4s cubic-bezier(.2,1.4,.4,1) both; pointer-events: none; white-space: nowrap; }

/* ── wide overrides for overlays ── */
@media (min-width: 768px) {
  .snViewer { background: rgba(8,8,10,.94); }
  .snViewerCard { left: 50%; top: 50%; right: auto; bottom: auto; transform: translate(-50%,-50%); height: min(92vh, 900px); aspect-ratio: 9 / 16; max-width: 94vw; border-radius: 18px; }
  .snCompose { background: rgba(8,8,10,.94); }
  .snComposeFrame { left: 50%; top: 50%; right: auto; bottom: auto; transform: translate(-50%,-50%); height: min(92vh, 900px); aspect-ratio: 9 / 16; max-width: 94vw; border-radius: 18px; }
  .snViewerSub { bottom: 76px; }
  .snBars { top: 8px; } .snViewerTop { top: 20px; } .snComposeX, .snEditRail { top: 12px; } .snComposeBar, .snViewerReply { bottom: 16px; }
}

/* ── motion ── */
@keyframes snFadeIn { from { opacity: 0; } }
@keyframes snKen { from { transform: scale(1.02) translate(0,0); } to { transform: scale(1.1) translate(-1.5%, -1%); } }
@keyframes snShut { from { opacity: .95; } to { opacity: 0; } }
@keyframes snDrop { from { opacity: 0; transform: translate(-50%, -14px) scale(.96); } }
.snBanner { animation-name: snDropB; }
@keyframes snDropB { from { opacity: 0; transform: translateY(-10px); } }
@keyframes snPop { 0% { opacity: 0; transform: scale(.3); } 100% { opacity: 1; transform: scale(1); } }
@keyframes snRise { from { opacity: 0; transform: translateY(12px); } }
@keyframes snSlideIn { from { transform: translateX(100%); } }
@keyframes snSlideUp { from { transform: translateY(100%); } }
@keyframes snZoomIn { from { opacity: 0; transform: scale(.94); } }
.snViewerCard, .snComposeFrame { animation: none; }
@keyframes snFloatUp { 0% { opacity: 0; transform: translate(0, 0) scale(.6); } 12% { opacity: 1; } 85% { opacity: .9; } 100% { opacity: 0; transform: translate(var(--dx), -110vh) scale(1.1); } }
@keyframes snFall { 0% { transform: translate(0, 0) rotate(0); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate(var(--dx), 115vh) rotate(260deg); opacity: .8; } }
@keyframes snBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes snThrob { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.14); } }
@keyframes snFlick { 0%, 100% { transform: scale(1) rotate(-3deg); } 30% { transform: scale(1.08) rotate(3deg); } 60% { transform: scale(.96) rotate(-1deg); } }
@keyframes snDots { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-5px); opacity: 1; } }
@keyframes snPeek { from { opacity: 0; transform: translateY(26px); } }
@keyframes snHeat { 0%, 100% { transform: scale(.92); opacity: .75; } 50% { transform: scale(1.08); opacity: 1; } }
@keyframes snGrow { from { width: 0; } to { width: 100%; } }
@keyframes snDeplete { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 100; } }
@keyframes snNumOut { to { transform: translateY(-110%); opacity: 0; } }
@keyframes snNumIn { from { transform: translateY(110%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes snToast { from { opacity: 0; transform: translate(-50%, -18px) scale(.94); } }

@media (prefers-reduced-motion: reduce) {
  .snApp *, .snApp *::before, .snApp *::after, .snCompose *, .snViewer *, .snCele * {
    animation-duration: .001ms !important; animation-iteration-count: 1 !important; animation-delay: 0s !important; transition-duration: .001ms !important; }
  .snFxRain, .snCeleRain { display: none; }
}
`;
