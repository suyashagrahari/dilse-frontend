// ─── Caller ID — the stylesheet ──────────────────────────────────────────────
//
// One string, injected once by CallTemplate. Night-mode caller-ID palette:
// graphite surfaces, the answer-button green, and GOLD — the premium caller ID
// — for everything that says "this one is special". Pink only for hearts.
//
// The phone screen is a size container, so the call screens compact
// themselves by the height of the screen they are in — a short phone and the
// device frame on a laptop both get the tighter layout without a single
// viewport breakpoint.

const G = "#1DA362";
const GOLD = "#F4C95D";

export const CALL_CSS = `
.cx { position: relative; min-height: 100dvh; color: #fff; background: #07090C; overflow-x: clip;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent; }
.cx *, .cx *::before, .cx *::after { box-sizing: border-box; }
.cx button { font: inherit; color: inherit; cursor: pointer; }
.cx button:focus-visible, .cx a:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
.cxFlex { flex: 1; }
.cxPic { position: relative; display: block; overflow: hidden; }
.cxPic img { display: block; user-select: none; -webkit-user-drag: none; }
.cxFace { border-radius: 50%; overflow: hidden; flex: none; display: inline-grid; place-items: center; color: #fff; font-weight: 700; }

/* ── the screen ── */
.cxScreen { position: relative; overflow: hidden; background: #0B0E12; container-type: size; container-name: scr; isolation: isolate; }
.cxScreen--full { height: 100vh; height: 100dvh; min-height: 560px; }
.cxStatus { position: absolute; top: 0; left: 0; right: 0; height: 48px; padding: 16px 26px 0 32px; display: flex; justify-content: space-between; align-items: center;
  z-index: 8; font-weight: 600; font-size: 15px; letter-spacing: -.01em; pointer-events: none; }
.cxStatusIcons { display: flex; gap: 6px; align-items: center; }
.cxStatus5g { font-size: 12px; font-weight: 700; }
.cxTimerPill { display: inline-flex; align-items: center; gap: 6px; background: ${G}; color: #fff; border-radius: 99px; padding: 3px 10px 3px 8px; font-size: 13px; font-variant-numeric: tabular-nums; }
.cxTimerPill i { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: cxBlink 1.2s ease-in-out infinite; }
.cxBrand { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px 6px 7px; border-radius: 99px; text-decoration: none;
  background: rgba(20,25,32,.88); border: 1px solid rgba(255,255,255,.12); color: #fff; font-size: 12px; font-weight: 600; white-space: nowrap; }
.cxBrandSlot { position: absolute; top: 54px; left: 14px; z-index: 9; }
.cxPageBrand { display: flex; justify-content: center; margin: 18px 0 0; }

/* ── incoming ── */
.cxIn { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 66px 18px 0; }
.cxInBg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.cxInPhoto { position: absolute; inset: 0; animation: cxKen 22s ease-in-out infinite alternate; }
.cxInPhoto--none { background: radial-gradient(80% 60% at 50% 30%, #2B5A44, #0B0E12); }
.cxInShade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,10,.78) 0%, rgba(5,7,10,.2) 28%, rgba(5,7,10,.12) 42%, rgba(5,7,10,.82) 66%, #05070A 100%); }
.cxIn > header, .cxIn > section, .cxIn > .cxInFoot { position: relative; z-index: 1; }
.cxRinger { position: absolute; top: 56px; right: 16px; z-index: 9; width: 38px; height: 38px; border-radius: 50%; border: 0; display: grid; place-items: center;
  background: rgba(255,255,255,.14); color: #fff; }
.cxRinger.is-hint::after { content: "tap for sound"; position: absolute; right: 0; top: 44px; white-space: nowrap; font-size: 11px; font-weight: 600;
  padding: 5px 9px; border-radius: 99px; background: rgba(0,0,0,.5); color: rgba(255,255,255,.85); animation: cxBreath 2s ease-in-out infinite; pointer-events: none; }
.cxInHead { text-align: center; }
.cxGoldPill { display: inline-flex; align-items: center; gap: 6px; margin: 0; padding: 5px 12px; border-radius: 99px; font-size: 11.5px; font-weight: 800; letter-spacing: .02em;
  color: #2A1D05; background: linear-gradient(135deg, #FCE7A8, ${GOLD} 50%, #D9A13B); box-shadow: 0 8px 22px -8px rgba(244,201,93,.75); animation: cxDrop .6s cubic-bezier(.2,1.3,.4,1) both; }
.cxInLabel { margin: 14px 0 2px; font-size: 15px; color: rgba(255,255,255,.8); animation: cxBreath 1.6s ease-in-out infinite; }
.cxInName { margin: 0; font-size: clamp(30px, 9.4cqw, 40px); line-height: 1.08; font-weight: 700; letter-spacing: -.02em; text-shadow: 0 2px 18px rgba(0,0,0,.4); overflow-wrap: anywhere; }
.cxInNum { display: flex; justify-content: center; align-items: center; gap: 6px; margin: 8px 0 0; font-size: 15px; color: rgba(255,255,255,.88); flex-wrap: wrap; font-variant-numeric: tabular-nums; }
.cxInNum i { opacity: .5; font-style: normal; }
.cxInLoc { margin: 4px 0 0; display: flex; justify-content: center; gap: 5px; align-items: center; font-size: 13.5px; color: rgba(255,255,255,.72); }

.cxIdCard { margin-top: auto; margin-bottom: 14px; padding: 14px; border-radius: 22px; background: rgba(12,16,21,.74); border: 1px solid rgba(244,201,93,.3);
  box-shadow: 0 24px 50px -22px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.06); -webkit-backdrop-filter: blur(14px) saturate(1.3); backdrop-filter: blur(14px) saturate(1.3);
  animation: cxCardIn .7s .2s cubic-bezier(.2,1,.3,1) both; }
.cxIdTop { display: flex; gap: 11px; align-items: center; }
.cxIdFace { box-shadow: 0 0 0 2px ${GOLD}; }
.cxIdWho { min-width: 0; flex: 1; display: grid; gap: 1px; }
.cxIdWho b { font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cxIdWho span { font-size: 12px; color: #9AA4AE; }
.cxSpamBadge { flex: none; display: grid; place-items: center; align-content: center; width: 54px; height: 54px; border-radius: 16px; background: rgba(29,163,98,.16); color: #4ADE95; font-weight: 800; font-size: 18px; line-height: 1; }
.cxSpamBadge small { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; opacity: .85; margin-top: 3px; }
.cxIdTag { margin: 12px 0 0; padding: 10px 12px; border-radius: 14px; background: rgba(255,255,255,.055); display: grid; gap: 2px; }
.cxIdTagHead { font-size: 12px; color: #9AA4AE; }
.cxIdTagHead b { color: #fff; font-variant-numeric: tabular-nums; }
.cxIdTagLabel { font-size: 17px; font-weight: 700; color: ${GOLD}; overflow-wrap: anywhere; }
.cxMeter { margin-top: 10px; display: grid; gap: 6px; }
.cxMeterTrack { position: relative; display: block; height: 6px; border-radius: 99px; background: linear-gradient(90deg, rgba(29,163,98,.35), rgba(244,201,93,.22) 50%, rgba(229,72,77,.25)); }
.cxMeterFill { display: block; height: 100%; min-width: 16px; border-radius: 99px; background: #4ADE95; box-shadow: 0 0 12px #4ADE95; animation: cxGrowX 1s .5s cubic-bezier(.2,1,.3,1) both; transform-origin: left; }
.cxMeterTx { font-size: 12px; color: #CFE9DA; display: inline-flex; gap: 5px; align-items: center; }
.cxReason { margin: 10px 0 0; display: grid; gap: 2px; padding: 10px 12px; border-radius: 14px; background: linear-gradient(135deg, rgba(255,77,141,.18), rgba(244,201,93,.12)); border: 1px solid rgba(255,92,147,.28); }
.cxReasonK { font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #FF9FBF; }
.cxReasonV { font-size: 15px; font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }

.cxInFoot { padding-bottom: calc(22px + env(safe-area-inset-bottom, 0px)); }
.cx--phone.has-dock .cxInFoot, .cx--phone.has-dock .cxCtl { padding-bottom: calc(74px + env(safe-area-inset-bottom, 0px)); }
.cxQuick { display: flex; justify-content: space-around; margin-bottom: 16px; }
.cxQuick button { border: 0; background: none; display: grid; justify-items: center; gap: 6px; font-size: 12.5px; color: rgba(255,255,255,.9); min-width: 76px; padding: 0; }
.cxQuick button span { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.15); transition: transform .15s ease, background .2s; }
.cxQuick button:active span { transform: scale(.9); }
.cxQuick .is-decline span { background: #E5484D; box-shadow: 0 10px 24px -10px rgba(229,72,77,.9); }
.cxSlide { position: relative; height: 72px; border-radius: 99px; background: rgba(255,255,255,.13); border: 1px solid rgba(255,255,255,.1); }
.cxSlideFill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 99px; background: linear-gradient(90deg, rgba(29,163,98,.6), rgba(29,163,98,.22)); transition: width .4s cubic-bezier(.2,1,.3,1); }
.cxSlideTx { position: absolute; inset: 0; display: grid; place-items: center; padding-left: 64px; font-size: 17px; font-weight: 500; letter-spacing: .01em; white-space: nowrap;
  color: transparent; background: linear-gradient(90deg, rgba(255,255,255,.38) 0%, rgba(255,255,255,.38) 35%, #fff 50%, rgba(255,255,255,.38) 65%, rgba(255,255,255,.38) 100%);
  background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; animation: cxShimmer 2.6s linear infinite; pointer-events: none; }
.cxSlideHearts { position: absolute; left: 30px; top: 0; bottom: 0; width: 20px; pointer-events: none; }
.cxSlideHearts i { position: absolute; left: 0; bottom: 30px; font-style: normal; color: #FF5C93; font-size: 15px; opacity: 0; animation: cxHeartUp 2.7s ease-out infinite; }
.cxSlideKnob { position: absolute; left: 4px; top: 4px; width: 62px; height: 62px; border-radius: 50%; border: 0; display: grid; place-items: center; touch-action: none; z-index: 2;
  background: linear-gradient(145deg, #2BC47A, #148A4B); box-shadow: 0 10px 24px -6px rgba(29,163,98,.85); transition: transform .4s cubic-bezier(.2,1.2,.3,1); }
.cxSlideKnob::after { content: ""; position: absolute; inset: -5px; border-radius: 50%; border: 2px solid rgba(74,222,149,.7); animation: cxRing 1.7s ease-out infinite; pointer-events: none; }
.cxSlideKnob svg { animation: cxJiggle 1.7s ease-in-out infinite; }

.cxSheetWrap { position: absolute; inset: 0; z-index: 20; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; animation: cxFade .2s both; }
.cxSheet { width: 100%; background: #1A1F26; border-radius: 22px 22px 0 0; padding: 10px 14px calc(18px + env(safe-area-inset-bottom, 0px)); animation: cxUp .34s cubic-bezier(.2,1,.3,1) both; }
.cxSheetGrab { display: block; width: 40px; height: 5px; border-radius: 99px; background: rgba(255,255,255,.2); margin: 0 auto 12px; }
.cxSheetH { margin: 0 4px 10px; font-size: 13px; color: #9AA4AE; font-weight: 600; }
.cxSheetRow { display: block; width: 100%; text-align: left; padding: 15px 14px; border: 0; border-radius: 14px; background: rgba(255,255,255,.055); margin-bottom: 6px; font-size: 16px; }
.cxSheetRow:active { background: rgba(255,255,255,.12); }
.cxSheetRow.is-cancel { text-align: center; color: #FF6369; font-weight: 600; background: transparent; margin: 4px 0 0; }
.cxDark { position: absolute; inset: 0; background: #030405; display: grid; place-items: center; text-align: center; color: #9AA4AE; font-size: 17px; line-height: 1.6; padding: 30px; animation: cxFade .3s both; }
.cxDark p { margin: 0; animation: cxCardIn .6s both; }

/* ── in call ── */
.cxCall { position: absolute; inset: 0; display: flex; flex-direction: column; padding: 58px 16px 0; }
.cxCallBg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.cxCallBlur { position: absolute; inset: -50px; filter: blur(36px) saturate(1.35) brightness(.72); }
.cxCallVid { position: absolute; inset: 0; animation: cxFade .7s both, cxKen 9s ease-out both; }
.cxCallShade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,10,14,.5), rgba(8,10,14,.3) 40%, rgba(8,10,14,.92)); }
.cxCall.is-video .cxCallShade { background: linear-gradient(180deg, rgba(0,0,0,.55), transparent 28%, transparent 52%, rgba(0,0,0,.9)); }
.cxCall > header, .cxCall > .cxTx, .cxCall > .cxCtl, .cxCall > .cxCaption { position: relative; z-index: 1; }
.cxCallHead { text-align: center; display: grid; justify-items: center; gap: 3px; }
.cxCallFace { box-shadow: 0 0 0 3px rgba(255,255,255,.14); }
.cxCallFace.is-talking { animation: cxTalk 1.5s ease-in-out infinite; }
.cxCallName { margin: 10px 0 0; font-size: 24px; font-weight: 700; letter-spacing: -.01em; overflow-wrap: anywhere; }
.cxCallMeta { margin: 0; font-size: 14px; color: rgba(255,255,255,.74); font-variant-numeric: tabular-nums; display: inline-flex; align-items: center; gap: 6px; }
.cxCallMeta i { font-style: normal; opacity: .5; }
.cxWave { display: flex; align-items: center; gap: 3px; height: 28px; margin-top: 8px; width: 190px; }
.cxWave i { flex: 1; border-radius: 99px; background: linear-gradient(180deg, #4ADE95, ${GOLD}); transform: scaleY(.12); transition: transform .3s ease; }
.cxWave.is-on i { animation: cxBar .85s ease-in-out infinite alternate; }
.cxTx { flex: 1; min-height: 0; margin: 14px 0 12px; display: flex; flex-direction: column; border-radius: 20px; background: rgba(10,13,17,.58); border: 1px solid rgba(255,255,255,.08); overflow: hidden; }
.cxTxHead { margin: 0; padding: 10px 14px; font-size: 11.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #CFE9DA; display: flex; align-items: center; gap: 7px; border-bottom: 1px solid rgba(255,255,255,.06); }
.cxTxHead small { font-weight: 500; text-transform: none; letter-spacing: 0; color: #9AA4AE; margin-left: auto; font-size: 11.5px; }
.cxLiveDot { width: 7px; height: 7px; border-radius: 50%; background: #FF4D5E; animation: cxPing 1.4s infinite; }
.cxTxList { list-style: none; margin: 0; padding: 12px 12px 14px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 9px; scrollbar-width: none; overscroll-behavior: contain; }
.cxTxList::-webkit-scrollbar { display: none; }
.cxTxLine { display: grid; gap: 2px; max-width: 92%; padding: 9px 12px; border-radius: 4px 16px 16px 16px; background: rgba(255,255,255,.08); animation: cxMsg .45s cubic-bezier(.2,1,.3,1) both; opacity: .7; transition: opacity .4s, background .4s; }
.cxTxLine.is-now { opacity: 1; background: rgba(29,163,98,.22); box-shadow: inset 0 0 0 1px rgba(74,222,149,.28); }
.cxTxLine b { font-size: 11px; color: #4ADE95; font-weight: 700; }
.cxTxLine span { font-size: 15.5px; line-height: 1.42; overflow-wrap: anywhere; }
.cxTxPhoto button { display: flex; gap: 10px; align-items: center; width: 100%; max-width: 92%; padding: 6px 12px 6px 6px; border: 0; border-radius: 16px; background: rgba(255,255,255,.08); text-align: left; animation: cxPop .55s cubic-bezier(.2,1.3,.4,1) both; }
.cxTxPhoto .cxPic { width: 62px; height: 76px; border-radius: 11px; flex: none; }
.cxTxPhoto span { display: grid; gap: 2px; min-width: 0; }
.cxTxPhoto small { font-size: 11.5px; color: #9AA4AE; }
.cxTxPhoto b { font-size: 14.5px; font-weight: 600; overflow-wrap: anywhere; }
.cxTxTyping { display: flex; gap: 4px; padding: 11px 12px; width: max-content; border-radius: 4px 16px 16px 16px; background: rgba(255,255,255,.06); }
.cxTxTyping i { width: 6px; height: 6px; border-radius: 50%; background: #9AA4AE; animation: cxDot 1s infinite; }
.cxTxTyping i:nth-child(2) { animation-delay: .15s; } .cxTxTyping i:nth-child(3) { animation-delay: .3s; }
.cxTxEnd { align-self: center; text-align: center; font-size: 12.5px; color: ${GOLD}; padding: 6px 10px; animation: cxFade .6s both; }
.cxCaption { margin: auto 0 14px; align-self: center; max-width: 94%; text-align: center; padding: 10px 14px; border-radius: 12px; background: rgba(0,0,0,.6); font-size: 16px; line-height: 1.4; animation: cxFade .4s both; }
.cxPip { position: absolute; top: 60px; right: 14px; z-index: 3; width: 84px; height: 118px; border-radius: 16px; background: linear-gradient(160deg, #3A4450, #1B2129);
  display: grid; place-items: center; align-content: center; gap: 4px; box-shadow: 0 12px 30px -10px #000; border: 1px solid rgba(255,255,255,.15); font-size: 11px; color: #9AA4AE; animation: cxPop .4s both; }
.cxPip small { font-size: 28px; }
.cxCtl { display: grid; justify-items: center; gap: 16px; padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px)); }
.cxCtlGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 22px; width: 100%; max-width: 320px; }
.cxCtlBtn { border: 0; background: none; display: grid; justify-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,.9); padding: 0; }
.cxCtlBtn span { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.15); transition: background .2s, color .2s, transform .15s; }
.cxCtlBtn.is-on span { background: #fff; color: #0B0E12; }
.cxCtlBtn:active span { transform: scale(.9); }
.cxEnd { width: 70px; height: 70px; border-radius: 50%; border: 0; background: #E5484D; display: grid; place-items: center; box-shadow: 0 12px 28px -10px rgba(229,72,77,.95); transition: transform .15s; }
.cxEnd:active { transform: scale(.92); }
.cxPad { position: absolute; inset: 0; z-index: 12; background: rgba(8,10,14,.95); display: flex; flex-direction: column; align-items: center; padding: 72px 20px calc(22px + env(safe-area-inset-bottom, 0px)); animation: cxFade .2s both; }
.cx--phone.has-dock .cxPad { padding-bottom: calc(74px + env(safe-area-inset-bottom, 0px)); }
.cxPadDigits { min-height: 44px; margin: 0 0 14px; font-size: 34px; font-weight: 300; letter-spacing: .1em; font-variant-numeric: tabular-nums; max-width: 100%; overflow: hidden; }
.cxPadDigits span { font-size: 15px; letter-spacing: 0; color: #9AA4AE; }
.cxPadGrid { display: grid; grid-template-columns: repeat(3, 74px); gap: 14px 26px; }
.cxPadGrid button { width: 74px; height: 74px; border-radius: 50%; border: 0; background: rgba(255,255,255,.15); display: grid; place-content: center; justify-items: center; line-height: 1; transition: background .1s; }
.cxPadGrid button:active { background: rgba(255,255,255,.4); }
.cxPadGrid b { font-size: 30px; font-weight: 400; }
.cxPadGrid small { font-size: 9.5px; font-weight: 700; letter-spacing: .18em; margin-top: 3px; opacity: .8; }
.cxPadFoot { margin-top: auto; display: grid; grid-template-columns: 74px 74px 74px; gap: 26px; align-items: center; justify-items: center; }
.cxPadHide { border: 0; background: none; font-size: 16px; font-weight: 500; }
.cxPadHearts { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.cxPadHearts span { position: absolute; bottom: -40px; animation: cxFloat 2s cubic-bezier(.2,.8,.3,1) forwards; }

@container scr (max-height: 780px) {
  .cxIn { padding-top: 56px; }
  .cxInLabel { margin-top: 10px; }
  .cxIdCard { padding: 12px; margin-bottom: 12px; }
  .cxIdTag { margin-top: 9px; padding: 8px 11px; }
  .cxIdTagLabel { font-size: 15.5px; }
  .cxReason { margin-top: 8px; padding: 8px 11px; }
  .cxReasonV { font-size: 14px; }
  .cxQuick { margin-bottom: 12px; }
  .cxQuick button span { width: 46px; height: 46px; }
  .cxSlide { height: 64px; }
  .cxSlideKnob { width: 54px; height: 54px; }
  .cxCall { padding-top: 52px; }
  .cxCallHead .cxFace { width: 64px !important; height: 64px !important; }
  .cxCallName { font-size: 21px; margin-top: 6px; }
  .cxCtlBtn span { width: 56px; height: 56px; }
  .cxCtlGrid { gap: 9px 18px; }
  .cxCtl { gap: 12px; }
  .cxEnd { width: 62px; height: 62px; }
  .cxPadGrid { grid-template-columns: repeat(3, 64px); gap: 10px 22px; }
  .cxPadGrid button { width: 64px; height: 64px; }
  .cxPadFoot { grid-template-columns: 64px 64px 64px; }
}
@container scr (max-width: 369px) { .cxRinger.is-hint::after { display: none; } }
@container scr (max-height: 690px) {
  .cxInName { font-size: 28px; }
  .cxMeter { display: none; }
  .cxIdWho span { display: none; }
  .cxCtlBtn small { display: none; }
  .cxWave { height: 20px; margin-top: 4px; }
  .cxCallHead .cxFace { display: none; }
}

/* ── profile ── */
.cxPage { min-height: 100dvh; background: #0B0E12; padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)); animation: cxFade .35s both; }
.cxAppBar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 2px; min-height: 56px; padding: env(safe-area-inset-top, 0px) 6px 0;
  background: rgba(11,14,18,.94); border-bottom: 1px solid rgba(255,255,255,.06); }
.cxAppBar button { width: 44px; height: 44px; border: 0; background: none; border-radius: 50%; display: grid; place-items: center; }
.cxAppBarBrand { display: inline-flex; align-items: center; gap: 6px; font-size: 19px; font-weight: 800; letter-spacing: -.02em; }
.cxAppBarBrand i { font-style: normal; width: 22px; height: 22px; border-radius: 7px; background: ${G}; display: grid; place-items: center; font-size: 12px; }
.cxAfter { margin: 12px 14px 0; padding: 14px; border-radius: 18px; display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, rgba(29,163,98,.24), rgba(244,201,93,.14)); border: 1px solid rgba(74,222,149,.26); animation: cxCardIn .6s both; }
.cxAfter > div { flex: 1; min-width: 0; }
.cxAfterK { margin: 0; font-size: 12.5px; color: #9AA4AE; font-variant-numeric: tabular-nums; }
.cxAfterV { margin: 2px 0 0; font-size: 19px; font-weight: 800; letter-spacing: -.01em; }
.cxAfterV span { color: ${GOLD}; }
.cxAfterBtn { flex: none; border: 0; border-radius: 99px; padding: 10px 15px; background: ${G}; font-weight: 700; font-size: 14px; display: inline-flex; gap: 6px; align-items: center; box-shadow: 0 10px 22px -10px rgba(29,163,98,.9); }
.cxHero { position: relative; margin: 12px 14px 0; border-radius: 24px; overflow: hidden; background: #141920; border: 1px solid rgba(255,255,255,.07); animation: cxCardIn .6s .05s both; }
.cxHeroCover { position: relative; height: 128px; }
.cxHeroCover .cxPic { position: absolute; inset: 0; }
.cxHeroCover > span { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,25,32,.05), #141920 97%), linear-gradient(135deg, rgba(244,201,93,.35), transparent 55%); }
.cxHeroMain { position: relative; margin-top: -64px; display: grid; justify-items: center; text-align: center; padding: 0 16px 4px; }
.cxHeroFaceWrap { position: relative; }
.cxHeroFace { box-shadow: 0 0 0 4px #141920, 0 0 0 7px ${GOLD}, 0 18px 40px -12px rgba(244,201,93,.6); }
.cxHeroCrown { position: absolute; right: -2px; top: -2px; width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #FCE7A8, #D9A13B); color: #3A2708; display: grid; place-items: center; box-shadow: 0 0 0 3px #141920; animation: cxDrop .6s .4s cubic-bezier(.2,1.4,.4,1) both; }
.cxHeroName { margin: 14px 0 0; font-size: 25px; font-weight: 800; letter-spacing: -.02em; overflow-wrap: anywhere; }
.cxGoldChip { margin: 7px 0 0; display: inline-flex; gap: 5px; align-items: center; padding: 4px 10px; border-radius: 99px; font-size: 11.5px; font-weight: 700; color: ${GOLD}; background: rgba(244,201,93,.12); border: 1px solid rgba(244,201,93,.32); }
.cxSavedAs { margin: 10px 0 0; font-size: 13.5px; color: #9AA4AE; overflow-wrap: anywhere; }
.cxSavedAs b { color: #fff; }
.cxHeroNum { margin: 6px 0 0; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 5px; font-size: 14px; color: #D5DBE1; font-variant-numeric: tabular-nums; }
.cxHeroNum i { font-style: normal; opacity: .4; }
.cxHeroLoc { margin: 4px 0 0; display: flex; align-items: center; gap: 4px; font-size: 13px; color: #9AA4AE; justify-content: center; }
.cxActions { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; padding: 16px 6px; }
.cxAct { border: 0; background: none; display: grid; justify-items: center; gap: 6px; font-size: 11.5px; color: #D5DBE1; padding: 0; min-width: 0; }
.cxAct span { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.075); transition: transform .15s, background .2s; }
.cxAct:active span { transform: scale(.88); }
.cxAct.is-green span { background: ${G}; color: #fff; }
@media (hover: hover) { .cxAct:hover span { background: rgba(255,255,255,.13); } .cxAct.is-green:hover span { background: #22B56E; } }
.cxCard { margin: 12px 14px 0; padding: 16px; border-radius: 20px; background: #141920; border: 1px solid rgba(255,255,255,.07); animation: cxCardIn .6s .1s both; }
.cxSecHead { margin-bottom: 12px; }
.cxSecHead h3 { margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 7px; }
.cxSecHead p { margin: 2px 0 0; font-size: 12.5px; color: #9AA4AE; }
.cxDot { width: 8px; height: 8px; border-radius: 50%; background: #FF4D5E; animation: cxPing 1.4s infinite; }
.cxSpam { display: flex; align-items: center; gap: 14px; }
.cxGauge { width: 112px; flex: none; }
.cxGaugeArc { animation: cxArc 1.3s .25s cubic-bezier(.2,1,.3,1) both; }
.cxGaugeNeedle { transform-origin: 60px 62px; animation: cxNeedle 1.5s .25s cubic-bezier(.3,1.5,.4,1) both; }
.cxSpamTx { min-width: 0; }
.cxSpamH { margin: 0; font-size: 17px; font-weight: 800; color: #4ADE95; }
.cxSpamS { margin: 4px 0 0; font-size: 12.5px; line-height: 1.45; color: #9AA4AE; }
.cxTags { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.cxTag { display: inline-flex; align-items: center; gap: 8px; padding: 7px 7px 7px 12px; border-radius: 12px; background: rgba(255,255,255,.06); font-size: 13.5px; font-weight: 600; max-width: 100%; animation: cxPop .45s cubic-bezier(.2,1.3,.4,1) both; }
.cxTag span { overflow-wrap: anywhere; }
.cxTag b { flex: none; font-size: 11.5px; padding: 2px 7px; border-radius: 99px; background: rgba(255,255,255,.08); color: #9AA4AE; font-variant-numeric: tabular-nums; }
.cxTag.is-top { background: linear-gradient(135deg, rgba(244,201,93,.22), rgba(255,92,147,.14)); box-shadow: inset 0 0 0 1px rgba(244,201,93,.38); }
.cxTag.is-top b { background: ${GOLD}; color: #2A1D05; }
.cxGhostBtn { margin-top: 12px; width: 100%; min-height: 44px; border-radius: 14px; border: 1px dashed rgba(244,201,93,.5); background: rgba(244,201,93,.06); color: ${GOLD}; font-weight: 700; font-size: 14px; }
.cxMedia { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.cxMedia--1 { grid-template-columns: 1fr; }
.cxMedia--2, .cxMedia--4 { grid-template-columns: repeat(2, 1fr); }
.cxMediaTile { position: relative; aspect-ratio: 4 / 5; border: 0; padding: 0; border-radius: 12px; overflow: hidden; background: #222; animation: cxPop .5s cubic-bezier(.2,1.2,.4,1) both; }
.cxMedia--6 .cxMediaTile:first-child { grid-column: span 2; grid-row: span 2; aspect-ratio: auto; }
.cxMediaTile .cxPic { position: absolute; inset: 0; transition: transform .6s cubic-bezier(.2,1,.3,1); }
@media (hover: hover) { .cxMediaTile:hover .cxPic { transform: scale(1.06); } }
.cxMediaCap { position: absolute; left: 0; right: 0; bottom: 0; padding: 20px 8px 6px; font-size: 11px; font-weight: 600; text-align: left; background: linear-gradient(transparent, rgba(0,0,0,.78)); line-height: 1.2; overflow-wrap: anywhere; }
.cxMedia--6 .cxMediaTile:first-child .cxMediaCap { font-size: 13px; padding: 26px 10px 8px; }
.cxMediaNote { position: absolute; top: 6px; right: 6px; font-size: 11px; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,.5); display: grid; place-items: center; }
.cxVmRow { display: flex; align-items: center; gap: 12px; width: 100%; border: 0; padding: 10px 14px 10px 10px; border-radius: 16px; background: rgba(255,255,255,.055); text-align: left; }
.cxVmPlay { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #FCE7A8, ${GOLD}); display: grid; place-items: center; flex: none; animation: cxPulseGold 2.2s infinite; }
.cxVmMid { flex: 1; min-width: 0; display: grid; gap: 5px; }
.cxVmMid .cxWave { width: 100%; height: 24px; margin: 0; }
.cxVmMid small { font-size: 12px; color: #9AA4AE; display: inline-flex; gap: 4px; align-items: center; }
.cxViewedRow { display: flex; gap: 11px; align-items: center; }
.cxViewedRow p { margin: 0; font-size: 14px; line-height: 1.45; min-width: 0; overflow-wrap: anywhere; }
.cxBars { margin-top: 14px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; height: 76px; }
.cxBars span { display: grid; justify-items: center; gap: 4px; height: 100%; grid-template-rows: 1fr auto; }
.cxBars i { width: 100%; border-radius: 6px 6px 3px 3px; background: linear-gradient(180deg, ${GOLD}, rgba(244,201,93,.2)); align-self: end; transform-origin: bottom; animation: cxGrow .8s cubic-bezier(.2,1,.3,1) both; }
.cxBars span:last-child i { background: linear-gradient(180deg, #FF5C93, rgba(255,92,147,.25)); }
.cxBars small { font-size: 10px; color: #9AA4AE; }
.cxChips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin-bottom: 8px; }
.cxChips::-webkit-scrollbar { display: none; }
.cxChips button { flex: none; border: 1px solid rgba(255,255,255,.12); background: transparent; border-radius: 99px; padding: 7px 13px; font-size: 13px; font-weight: 600; color: #D5DBE1; transition: background .2s, color .2s; }
.cxChips .is-on { background: #fff; color: #0B0E12; border-color: #fff; }
.cxLogList { list-style: none; margin: 0; padding: 0; }
.cxLogRow { border-top: 1px solid rgba(255,255,255,.06); }
.cxLogRow:first-child { border-top: 0; }
.cxLogRow > button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 2px; border: 0; background: none; text-align: left; }
.cxLogIc { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.06); display: grid; place-items: center; flex: none; }
.cxLogIc.is-red { background: rgba(229,72,77,.15); }
.cxLogMid { flex: 1; min-width: 0; display: grid; gap: 1px; }
.cxLogMid b { font-size: 14.5px; font-weight: 600; }
.cxLogMid b.is-red { color: #FF6369; }
.cxLogMid b small { font-weight: 500; color: #9AA4AE; }
.cxLogMid > small { font-size: 12.5px; color: #9AA4AE; }
.cxLogInfo { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.3); display: grid; place-items: center; font-size: 11px; font-weight: 700; font-style: italic; color: #9AA4AE; flex: none; font-family: Georgia, serif; transition: transform .2s, border-color .2s; }
.cxLogRow.is-open .cxLogInfo { border-color: ${GOLD}; color: ${GOLD}; transform: rotate(-12deg); }
.cxLogNote { display: none; margin: -2px 0 12px 48px; padding: 9px 12px; border-radius: 4px 14px 14px 14px; background: rgba(255,255,255,.055); font-size: 13.5px; line-height: 1.45; color: #D5DBE1; overflow-wrap: anywhere; }
.cxLogRow.is-open .cxLogNote { display: block; animation: cxMsg .35s both; }
.cxLogEmpty { padding: 14px 2px; color: #9AA4AE; font-size: 13px; }
.cxProfFoot { margin: 18px 14px 0; text-align: center; }
.cxProfFoot p { margin: 14px 0 0; font-size: 12px; color: #6B7480; display: inline-flex; gap: 5px; align-items: center; flex-wrap: wrap; justify-content: center; }
.cxProfFoot b { color: #9AA4AE; }

/* ── web app (tablet / desktop) ── */
.cx--tablet, .cx--desktop { background: radial-gradient(1100px 600px at 50% -10%, rgba(29,163,98,.14), transparent 60%), radial-gradient(900px 520px at 100% 100%, rgba(244,201,93,.09), transparent 60%), #07090C; }
.cxWeb { min-height: 100dvh; display: flex; flex-direction: column; }
.cxWebBar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 14px; height: 60px; padding: 0 20px; background: rgba(7,9,12,.88); border-bottom: 1px solid rgba(255,255,255,.06); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.cxWebLogo { display: inline-flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 800; letter-spacing: -.02em; flex: none; }
.cxWebLogo i { font-style: normal; width: 28px; height: 28px; border-radius: 9px; background: ${G}; display: grid; place-items: center; font-size: 15px; }
.cxWebLogo small { font-size: 10.5px; font-weight: 800; color: #9AA4AE; text-transform: uppercase; letter-spacing: .12em; }
.cxWebSearch { display: flex; align-items: center; gap: 8px; flex: 1; max-width: 440px; min-width: 0; height: 40px; padding: 0 14px; border-radius: 99px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05); color: #9AA4AE; font-size: 14px; text-align: left; }
.cxWebSearch span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.cxWebGold { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 99px; background: linear-gradient(135deg, #FCE7A8, ${GOLD} 50%, #D9A13B); color: #2A1D05; font-size: 12.5px; font-weight: 800; flex: none; }
.cxWebGrid { flex: 1; display: grid; gap: 28px; padding: 24px 24px 40px; margin: 0 auto; width: 100%; align-items: start; }
.cx--tablet .cxWebGrid { grid-template-columns: auto minmax(0, 1fr); max-width: 1100px; gap: 22px; padding: 20px 18px 96px; }
.cx--desktop .cxWebGrid { grid-template-columns: minmax(250px, 320px) auto minmax(340px, 430px); max-width: 1480px; justify-content: center; }
.cxDeviceCol { position: sticky; top: 84px; display: grid; justify-items: center; gap: 12px; }
.cxDevice { --h: min(820px, calc(100dvh - 130px)); position: relative; height: var(--h); aspect-ratio: 390 / 844; border-radius: calc(var(--h) * .07); padding: calc(var(--h) * .0145);
  background: linear-gradient(145deg, #2C3139, #0D1014); box-shadow: 0 0 0 1.5px #3A4048, 0 40px 90px -30px rgba(0,0,0,.95), 0 0 140px -40px rgba(29,163,98,.4); }
.cx--tablet .cxDevice { --h: min(820px, calc(100dvh - 120px), calc((100vw - 400px) * 2.16)); }
.cxDevice::before { content: ""; position: absolute; left: -3px; top: 18%; width: 3px; height: 7%; border-radius: 3px 0 0 3px; background: #2C3139; box-shadow: 0 calc(var(--h) * .09) 0 #2C3139; }
.cxDevice::after { content: ""; position: absolute; right: -3px; top: 25%; width: 3px; height: 11%; border-radius: 0 3px 3px 0; background: #2C3139; }
.cxDevice .cxScreen { width: 100%; height: 100%; border-radius: calc(var(--h) * .057); }
.cxIsland { position: absolute; top: calc(var(--h) * .028); left: 50%; transform: translateX(-50%); width: 30%; height: calc(var(--h) * .037); border-radius: 99px; background: #000; z-index: 30; }
.cxDeviceHint { margin: 0; font-size: 12.5px; color: #6B7480; }
.cxPanel { min-width: 0; }
.cxProf--panel .cxHero, .cxProf--panel .cxCard, .cxProf--panel .cxProfFoot { margin-left: 0; margin-right: 0; }
.cxProf--panel .cxHero { margin-top: 0; }
.cxRail { position: sticky; top: 84px; max-height: calc(100dvh - 108px); overflow-y: auto; padding: 16px; border-radius: 22px; background: #10141A; border: 1px solid rgba(255,255,255,.07); scrollbar-width: thin; }
.cxRailH { margin: 2px 0 12px; font-size: 20px; font-weight: 800; letter-spacing: -.01em; }
.cxRailNow { display: flex; align-items: center; gap: 11px; width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 16px; border: 1px solid rgba(74,222,149,.22); background: rgba(29,163,98,.1); text-align: left; }
.cxRailTx { flex: 1; min-width: 0; display: grid; }
.cxRailNow b { font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cxRailNow small { font-size: 12px; color: #9AA4AE; }
.cxRailNow > i { width: 34px; height: 34px; border-radius: 50%; background: ${G}; display: grid; place-items: center; flex: none; }
.cxRailNow.is-ringing { animation: cxGlow 1.6s ease-in-out infinite; }
.cxRailNow.is-ringing > i { animation: cxJiggle 1s ease-in-out infinite; }
.cxAfterScr { position: absolute; inset: 0; display: flex; flex-direction: column; animation: cxFade .4s both; }
.cxAfterIn { position: relative; z-index: 1; margin: auto 0; display: grid; justify-items: center; text-align: center; gap: 8px; padding: 0 20px; }
.cxAfterIn h2 { margin: 8px 0 0; font-size: 24px; font-weight: 700; }
.cxAfterForever { margin: 0; font-size: 21px; font-weight: 800; background: linear-gradient(135deg, #FCE7A8, ${GOLD}); -webkit-background-clip: text; background-clip: text; color: transparent; }
.cxAfterBtns { display: flex; gap: 18px; margin-top: 22px; }
.cxAfterBtns button { border: 0; background: none; display: grid; justify-items: center; gap: 6px; font-size: 12px; padding: 0; }
.cxAfterBtns span { width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.15); }
.cxAfterBtns span.is-green { background: ${G}; }

/* ── photo viewer ── */
.cxView { position: fixed; inset: 0; z-index: 300; background: #000; display: flex; flex-direction: column; animation: cxFade .22s both; }
.cxViewHead { display: flex; align-items: center; gap: 10px; padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 10px; }
.cxViewHead > button { width: 42px; height: 42px; border: 0; border-radius: 50%; background: rgba(255,255,255,.1); display: grid; place-items: center; flex: none; }
.cxViewWho { display: grid; min-width: 0; }
.cxViewWho b { font-size: 15px; }
.cxViewWho small { font-size: 12px; color: #9AA4AE; }
.cxViewStage { position: relative; flex: 1; min-height: 0; display: grid; place-items: center; padding: 6px 14px; touch-action: pan-y; }
.cxViewFrame { width: min(100%, calc((100dvh - 290px) * .8), 560px); aspect-ratio: 4 / 5; border-radius: 18px; overflow: hidden; animation: cxZoomIn .38s cubic-bezier(.2,1,.3,1) both; box-shadow: 0 30px 80px -30px rgba(0,0,0,.9); }
.cxViewFrame .cxPic { width: 100%; height: 100%; }
.cxViewBurst { position: absolute; left: 50%; top: 50%; animation: cxBig .95s cubic-bezier(.2,1.4,.4,1) both; pointer-events: none; filter: drop-shadow(0 10px 30px rgba(255,77,141,.6)); }
.cxViewNav { position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(255,255,255,.14); font-size: 28px; line-height: 1; display: grid; place-items: center; padding-bottom: 3px; }
.cxViewNav.is-l { left: 10px; } .cxViewNav.is-r { right: 10px; }
.cxViewFoot { padding: 10px 16px calc(16px + env(safe-area-inset-bottom, 0px)); width: 100%; max-width: 600px; margin: 0 auto; }
.cxViewCap { margin: 0 0 8px; font-size: 18px; font-weight: 700; overflow-wrap: anywhere; }
.cxViewBubble { padding: 10px 12px 6px; border-radius: 4px 18px 18px 18px; background: #1F2630; max-width: 94%; animation: cxMsg .4s both; }
.cxViewBubble p { margin: 0; font-size: 15px; line-height: 1.45; overflow-wrap: anywhere; }
.cxViewBubble small { display: block; text-align: right; font-size: 11px; color: #4ADE95; margin-top: 3px; }
.cxViewBar { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; gap: 12px; }
.cxViewDots { display: flex; gap: 5px; flex-wrap: wrap; }
.cxViewDots i { width: 6px; height: 6px; border-radius: 99px; background: rgba(255,255,255,.25); transition: width .3s, background .3s; }
.cxViewDots i.is-on { width: 18px; background: #fff; }
.cxViewLike { display: inline-flex; gap: 6px; align-items: center; border: 1px solid rgba(255,255,255,.16); background: transparent; border-radius: 99px; padding: 8px 14px; font-weight: 600; font-size: 14px; flex: none; }
.cxViewLike.is-on { border-color: #FF4D8D; color: #FF4D8D; }

/* ── the letter's corner envelope, dressed as a missed-call / voicemail alert ── */
.cx .lpDock--call .lpFab { border-radius: 50%; background: linear-gradient(145deg, #2BC47A, #148A4B); box-shadow: 0 14px 30px -8px rgba(29,163,98,.75), 0 0 0 3px #0B0E12, 0 0 0 5px rgba(244,201,93,.85); }
.cx .lpDock--call .lpFab.is-read { box-shadow: 0 10px 22px -8px rgba(0,0,0,.6), 0 0 0 2px rgba(255,255,255,.2); }
.cx .lpDock--call .lpBadge { background: #FF4D5E; border-color: #0B0E12; }
.cx .lpDock--call .lpBanner { background: rgba(24,29,36,.97); color: #fff; border: 1px solid rgba(255,255,255,.1); border-radius: 18px; box-shadow: 0 18px 40px -14px rgba(0,0,0,.85);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif; }
.cx .lpDock--call .lpBanIc { border-radius: 50%; box-shadow: 0 0 0 2px #F4C95D; font-size: 0; }
.cx .lpDock--call .lpBanTop b { color: #FF7A80; }
.cx .lpDock--call .lpBanTop small { color: #9AA4AE; opacity: 1; }
.cx .lpDock--call .lpRead { background: #1A1F26; color: #9AA4AE; }

/* ── toast ── */
.cxToast { position: fixed; left: 50%; top: calc(env(safe-area-inset-top, 0px) + 14px); transform: translateX(-50%); z-index: 320; display: flex; gap: 8px; align-items: flex-start;
  width: max-content; max-width: min(380px, calc(100vw - 28px)); padding: 11px 15px; border-radius: 18px; background: rgba(24,29,36,.97); border: 1px solid rgba(255,255,255,.1);
  box-shadow: 0 18px 40px -14px rgba(0,0,0,.85); font-size: 13.5px; line-height: 1.4; animation: cxToast .4s cubic-bezier(.2,1.3,.4,1) both; }
.cxToast svg { margin-top: 3px; }

@keyframes cxKen { from { transform: scale(1.02); } to { transform: scale(1.12) translate(-1.5%, -1%); } }
@keyframes cxBlink { 50% { opacity: .25; } }
@keyframes cxShimmer { from { background-position: 125% 0; } to { background-position: -125% 0; } }
@keyframes cxRing { from { transform: scale(.92); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
@keyframes cxJiggle { 0%, 55%, 100% { transform: rotate(0); } 60% { transform: rotate(-14deg); } 70% { transform: rotate(12deg); } 80% { transform: rotate(-9deg); } 90% { transform: rotate(6deg); } }
@keyframes cxHeartUp { 0% { opacity: 0; transform: translate(0, 0) scale(.6); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(10px, -90px) scale(1.15) rotate(12deg); } }
@keyframes cxFade { from { opacity: 0; } }
@keyframes cxUp { from { transform: translateY(100%); } }
@keyframes cxDrop { from { opacity: 0; transform: translateY(-10px) scale(.85); } }
@keyframes cxBreath { 50% { opacity: .55; } }
@keyframes cxCardIn { from { opacity: 0; transform: translateY(18px); } }
@keyframes cxTalk { 0%, 100% { box-shadow: 0 0 0 3px rgba(74,222,149,.35), 0 0 0 0 rgba(74,222,149,.3); } 50% { box-shadow: 0 0 0 3px rgba(74,222,149,.6), 0 0 0 14px rgba(74,222,149,0); } }
@keyframes cxBar { from { transform: scaleY(.15); } to { transform: scaleY(1); } }
@keyframes cxPing { 0% { box-shadow: 0 0 0 0 rgba(255,77,94,.7); } 100% { box-shadow: 0 0 0 8px rgba(255,77,94,0); } }
@keyframes cxMsg { from { opacity: 0; transform: translateY(10px) scale(.97); } }
@keyframes cxPop { from { opacity: 0; transform: scale(.85); } }
@keyframes cxDot { 0%, 100% { opacity: .3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
@keyframes cxFloat { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translateY(-620px) rotate(20deg); opacity: 0; } }
@keyframes cxArc { from { stroke-dashoffset: 151; } }
@keyframes cxNeedle { from { transform: rotate(150deg); } }
@keyframes cxGrow { from { transform: scaleY(0); } }
@keyframes cxGrowX { from { transform: scaleX(0); } }
@keyframes cxPulseGold { 0%, 100% { box-shadow: 0 0 0 0 rgba(244,201,93,.55); } 60% { box-shadow: 0 0 0 10px rgba(244,201,93,0); } }
@keyframes cxGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,149,.0); } 50% { box-shadow: 0 0 0 4px rgba(74,222,149,.18); } }
@keyframes cxZoomIn { from { opacity: 0; transform: scale(.94); } }
@keyframes cxBig { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.2); } 30% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); } 70% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); } }
@keyframes cxToast { from { opacity: 0; transform: translate(-50%, -14px) scale(.96); } }

.cx.is-reduced *, .cx.is-reduced *::before, .cx.is-reduced *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
@media (prefers-reduced-motion: reduce) {
  .cx *, .cx *::before, .cx *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;
