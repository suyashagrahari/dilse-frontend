// ─── Searched — every style, one sheet, scoped under `.sr` ───────────────────
//
// Measurements are taken from the real results page: 14px Arial body, 20px
// titles, 22px snippet line-height, a 652px results column 180px from the left
// on desktop, a 369px panel column, 46px pill box (44px on the results page),
// 26px favicons. Light and dark palettes are CSS variables.

import { GS, UI } from "./types";

export const CSS = `
.sr { --bg:#fff; --ink:#1f1f1f; --ink2:#4d5156; --ink3:#70757a; --line:#dadce0; --line2:#ebebeb; --link:#1f15ab; --visited:#681da8;
  --box:#fff; --boxLine:#dfe1e5; --chip:#f1f3f4; --chipLine:#dadce0; --btn:#f8f9fa; --btnInk:#3c4043; --hover:rgba(60,64,67,.06); --card:#fff;
  --accent:#0b57d0; --foot:#f2f2f2; --aio1:#eef3fd; --aio2:#fdf0f4; --shadow:0 1px 6px rgba(32,33,36,.28); --pop:#fff; --green:#188038; --rose:#E8445E;
  position: relative; min-height: 100vh; min-height: 100dvh; background: var(--bg); color: var(--ink); font-family: ${UI}; font-size: 14px; line-height: 1.58;
  overflow-x: clip; -webkit-tap-highlight-color: transparent; transition: background-color .25s ease, color .25s ease; }
.sr.is-dark { --bg:#1f1f1f; --ink:#e8eaed; --ink2:#bdc1c6; --ink3:#9aa0a6; --line:#3c4043; --line2:#303134; --link:#99c3ff; --visited:#c58af9;
  --box:#303134; --boxLine:#5f6368; --chip:#303134; --chipLine:#5f6368; --btn:#303134; --btnInk:#e8eaed; --hover:rgba(232,234,237,.08); --card:#28292a;
  --accent:#8ab4f8; --foot:#171717; --aio1:#1d2433; --aio2:#2a1e25; --shadow:0 1px 6px rgba(0,0,0,.6); --pop:#2d2e30; --green:#81c995; }
.sr *, .sr *::before, .sr *::after { box-sizing: border-box; }
:where(.sr) button { font: inherit; color: inherit; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; text-align: inherit; }
:where(.sr) :where(p, h1, h2, h3, dl, dd, figure, blockquote, ul) { margin: 0; }
.sr button:focus-visible, .sr input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.srIn { animation: srIn .5s cubic-bezier(.2,.9,.3,1) both; }
@keyframes srIn { from { opacity: 0; transform: translateY(10px); } }

/* ── atoms ── */
.srWord { display: inline-flex; font-weight: 500; letter-spacing: -.02em; line-height: 1; white-space: nowrap; }
.srIconBtn { width: 40px; height: 40px; border-radius: 50%; display: inline-grid; place-items: center; color: var(--ink2); flex: none; transition: background .15s; }
.srIconBtn:hover { background: var(--hover); }
.srPic { position: relative; display: block; overflow: hidden; background: var(--chip); }
.srPic img { display: block; }
.srFav { flex: none; display: inline-grid; place-items: center; border-radius: 50%; background: #f1f3f4; border: 1px solid var(--line2); }
.sr.is-dark .srFav { background: #fff; border-color: #fff; }
.srFav > span { width: 62%; height: 62%; border-radius: 4px; display: grid; place-items: center; color: #fff; font: 700 10px/1 ${GS}; }
.srStars { display: inline-flex; color: #f5a623; vertical-align: -2px; }
.srAvatarBtn { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; }
.srAvatarBtn:hover { background: var(--hover); }
.srAvatar { display: inline-grid; place-items: center; border-radius: 50%; padding: 2px;
  background: conic-gradient(#3F76EE 0 25%, #E8445E 0 50%, #F4B42B 0 75%, #26A160 0); flex: none; }
.srAvatarIn { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: grid; place-items: center; color: #fff; font: 600 14px/1 ${GS}; border: 2px solid var(--bg); }
.srAvatarIn img { display: block; }
.srPopWrap { position: relative; display: inline-flex; }
.srPop { position: absolute; top: 46px; right: 0; z-index: 60; background: var(--pop); color: var(--ink); border-radius: 26px; box-shadow: 0 4px 8px 3px rgba(60,64,67,.15), 0 1px 3px rgba(60,64,67,.3);
  animation: srPopIn .18s cubic-bezier(.2,.9,.3,1) both; transform-origin: top right; }
@keyframes srPopIn { from { opacity: 0; transform: scale(.94) translateY(-4px); } }
.srApps { width: 320px; max-width: calc(100vw - 24px); padding: 14px; }
.srAppsGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 10px; border-radius: 20px; background: var(--bg); }
.srApp { display: grid; justify-items: center; gap: 6px; padding: 12px 4px; border-radius: 14px; }
.srApp:hover { background: var(--hover); }
.srAppIc { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; }
.srAppTx { font: 400 13px/1.2 ${GS}; color: var(--ink); }
.srAppsFoot { text-align: center; font-size: 12px; color: var(--ink3); padding: 10px 0 2px; }
.srAcct { width: 330px; max-width: calc(100vw - 24px); padding: 16px 18px 20px; display: grid; justify-items: center; gap: 8px; text-align: center; }
.srAcctMail { font: 500 14px/1.3 ${GS}; color: var(--ink2); }
.srAcctHi { font: 400 22px/1.2 ${GS}; margin-top: 4px !important; }
.srAcctBtn { border: 1px solid var(--line) !important; border-radius: 99px !important; padding: 8px 20px !important; color: var(--accent) !important; font: 500 14px/1.3 ${GS} !important; }
.srAcctNote { font-size: 12.5px; color: var(--ink2); margin-top: 6px !important; }
.srAcctBar { width: 100%; height: 6px; border-radius: 9px; background: var(--chip); overflow: hidden; }
.srAcctBar i { display: block; height: 100%; width: 100%; background: linear-gradient(90deg, #3F76EE, #E8445E); animation: srFill 1.4s ease both; }
@keyframes srFill { from { width: 0; } }

/* ── home ── */
.srHome { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; }
.srTop { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px 6px 14px; min-height: 60px; }
.srTopL, .srTopR { display: flex; align-items: center; gap: 4px; }
.srTopLink { padding: 6px 8px; font-size: 13px; color: var(--ink); border-radius: 6px; }
.srTopLink:hover { text-decoration: underline; }
.srTopLink.is-on { font-weight: 700; border-bottom: 3px solid var(--accent); border-radius: 0; padding-bottom: 5px; }
.srHomeMain { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 6vh 16px 30px; }
@media (min-width: 760px) { .srHomeMain { padding-top: 9vh; } .srDoodle { width: 430px; } .srTop { padding: 6px 14px 6px 20px; } }
.srDoodle { display: block; width: min(340px, 92vw); margin-bottom: 22px; border-radius: 16px; transition: transform .2s; }
.srDoodle:hover { transform: scale(1.02); }
.srDoodleSvg { display: block; width: 100%; height: auto; overflow: visible; }
.srDBalloon { animation: srBob 3.2s ease-in-out infinite; transform-origin: 170px 60px; }
@keyframes srBob { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-5px) rotate(2deg); } }
.srDString { animation: srSway 3.2s ease-in-out infinite; }
@keyframes srSway { 50% { transform: translateY(-2px); } }
.srDLeft { animation: srHop 2.6s ease-in-out infinite; transform-origin: 38px 122px; }
.srDRight { animation: srHop 2.6s 1.3s ease-in-out infinite; transform-origin: 302px 122px; }
@keyframes srHop { 0%, 70%, 100% { transform: translateY(0); } 80% { transform: translateY(-4px); } 90% { transform: translateY(0); } }
.srDRise { transform: translate(var(--x), 70px); animation: srRise 4.4s var(--d) ease-in infinite; opacity: 0; }
@keyframes srRise { 0% { transform: translate(var(--x), 70px) scale(.6); opacity: 0; } 15% { opacity: .9; } 100% { transform: translate(calc(var(--x) + 8px), 0px) scale(1.3); opacity: 0; } }
.srDTwinkle { animation: srTw 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes srTw { 0%, 100% { opacity: .15; } 50% { opacity: 1; } }
.srDGlow { animation: srGlowP 3.2s ease-in-out infinite; }
@keyframes srGlowP { 50% { opacity: .55; } }

.srBoxWrap { position: relative; width: min(584px, 100%); z-index: 20; }
.srBox { display: flex; align-items: center; height: 48px; padding: 0 6px 0 14px; border: 1px solid var(--boxLine); border-radius: 24px; background: var(--box); cursor: text;
  transition: box-shadow .2s, border-radius .1s; }
.srBox:hover, .srBox:focus-within { box-shadow: var(--shadow); border-color: transparent; }
.srBox.is-open { border-radius: 24px 24px 0 0; box-shadow: var(--shadow); border-color: transparent; border-bottom-color: transparent; }
.srBoxIc { color: var(--ink3); display: grid; place-items: center; margin-right: 12px; }
.srBoxIn { flex: 1; min-width: 0; height: 100%; border: 0; outline: none !important; background: transparent; color: var(--ink); font: 16px ${UI}; }
.srBoxIn::placeholder { color: var(--ink3); }
.srBoxBtn { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; flex: none; color: var(--ink2); }
.srBoxBtn:hover { background: var(--hover); }
.srBoxSep { width: 1px; height: 26px; background: var(--line); margin: 0 4px; flex: none; }
.srDrop { position: absolute; left: 0; right: 0; top: 47px; background: var(--box); border-radius: 0 0 24px 24px; box-shadow: 0 4px 6px rgba(32,33,36,.28); padding: 0 0 14px; overflow: hidden; }
.sr.is-dark .srDrop { box-shadow: 0 4px 6px rgba(0,0,0,.6); }
.srDropLine { height: 1px; background: var(--line2); margin: 0 20px 6px 14px; }
.srSug { width: 100%; display: flex; align-items: center; gap: 14px; min-height: 40px; padding: 4px 20px 4px 16px; color: var(--ink); animation: srSugIn .28s cubic-bezier(.2,.9,.3,1) both; }
.srSug:hover { background: var(--hover); }
@keyframes srSugIn { from { opacity: 0; transform: translateY(-6px); } }
.srSugIc { color: var(--ink3); display: grid; place-items: center; flex: none; }
.srSugTx { flex: 1; min-width: 0; font-size: 16px; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ink); }
.srSugTx b { font-weight: 700; }
.srSug:first-of-type .srSugTx, .srOvRow:first-child .srSugTx { color: #681da8; }
.sr.is-dark .srSug:first-of-type .srSugTx, .sr.is-dark .srOvRow:first-child .srSugTx { color: #c58af9; }
.srSugRm { font-size: 13px; color: var(--ink3); flex: none; }
.srSugRm:hover { text-decoration: underline; }
.srSug.is-nudge { animation: srSugIn .28s both, srNudge 1.1s .3s ease-in-out 2; }
@keyframes srNudge { 50% { background: rgba(232,68,94,.10); } }
.srDropFoot { text-align: right; font-size: 12px; font-style: italic; color: var(--ink3); padding: 6px 20px 0; }
.srDropFoot span { font-style: normal; opacity: .75; }
.srBtns { display: flex; justify-content: center; gap: 12px; padding-top: 28px; flex-wrap: wrap; }
.srBtns--drop { padding: 16px 0 6px; }
.srBtn { min-width: 132px; height: 36px; padding: 0 16px; border-radius: 8px; background: var(--btn); border: 1px solid var(--btn); color: var(--btnInk); font-size: 14px; text-align: center; transition: box-shadow .1s, border-color .1s; }
.srBtn:hover { border-color: var(--line); box-shadow: 0 1px 1px rgba(0,0,0,.1); }
.srLucky { position: relative; overflow: hidden; min-width: 150px; }
.srLuckyRoll { display: inline-block; animation: srRoll .16s ease both; }
@keyframes srRoll { from { transform: translateY(80%); opacity: 0; } }
.srAiChip { margin-top: 18px; display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 18px 0 14px; border-radius: 99px; font: 500 14px/1 ${GS}; color: var(--ink);
  background: linear-gradient(var(--bg), var(--bg)) padding-box, linear-gradient(120deg, #3F76EE, #9B6BF2, #E8445E, #F4B42B) border-box; border: 1.5px solid transparent !important; }
.srAiChip:hover { background: linear-gradient(var(--hover), var(--hover)) padding-box, linear-gradient(120deg, #3F76EE, #9B6BF2, #E8445E, #F4B42B) border-box; }
.srOffered { margin-top: 26px !important; font-size: 13px; color: var(--ink2); text-align: center; line-height: 2; max-width: 560px; }
.srOffered button { color: var(--accent); margin: 0 5px; }
.srOffered button:hover { text-decoration: underline; }
.srFoot { background: var(--foot); color: var(--ink3); font-size: 14px; }
.srFootRow { padding: 13px 24px; }
.srFootLoc { border-bottom: 1px solid var(--line); }
.srFootLinks { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 20px; }
.srFootLinks span { display: flex; flex-wrap: wrap; gap: 4px 26px; }
.srFootLinks button:hover { text-decoration: underline; }
@media (max-width: 759px) { .srFootLinks, .srFootLinks span { justify-content: center; } .srFootLoc { text-align: center; } }

.srOverlay { position: fixed; inset: 0; z-index: 70; background: var(--bg); display: flex; flex-direction: column; animation: srFadeUp .2s ease both; }
@keyframes srFadeUp { from { opacity: 0; transform: translateY(12px); } }
.srOvTop { display: flex; align-items: center; gap: 4px; padding: 8px 8px; border-bottom: 1px solid var(--line2); box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.srOvIn { flex: 1; min-width: 0; height: 44px; border: 0; outline: none !important; background: transparent; color: var(--ink); font: 18px ${UI}; }
.srOvList { flex: 1; overflow-y: auto; padding: 6px 0; }
.srOvRow { display: flex; align-items: center; animation: srSugIn .28s both; }
.srOvRowMain { flex: 1; min-width: 0; display: flex; align-items: center; gap: 16px; min-height: 52px; padding: 0 4px 0 18px; }
.srOvFill { width: 52px; height: 52px; display: grid; place-items: center; color: var(--ink3); }
.srOvHint { padding: 22px 18px; color: var(--ink3); font-size: 13px; text-align: center; }

/* ── results header ── */
.srHead { background: var(--bg); padding-top: 8px; }
.srHeadRow { display: flex; align-items: center; gap: 6px; padding: 0 8px 0 10px; min-height: 56px; }
.srHeadWord { flex: 1; display: flex; justify-content: center; min-width: 0; padding: 4px 0; }
.srHeadR { display: flex; align-items: center; gap: 2px; }
.srLabs { color: var(--ink2); }
.srHBox { display: flex; align-items: center; height: 46px; margin: 4px 12px 6px; padding: 0 4px 0 18px; border-radius: 24px; background: var(--box); border: 1px solid var(--boxLine); box-shadow: 0 2px 5px 1px rgba(64,60,67,.08); }
.srHBox:focus-within { box-shadow: var(--shadow); }
.srHBoxIn { flex: 1; min-width: 0; height: 100%; border: 0; outline: none !important; background: transparent; color: var(--ink); font: 16px ${UI}; }
.srBoxGo { color: var(--accent); }
@media (min-width: 760px) {
  .srHead { padding-top: 18px; }
  .srHeadRow { padding: 0 20px 0 28px; gap: 0; }
  .srHeadWord { flex: 0 0 auto; width: 152px; justify-content: flex-start; overflow: hidden; }
  .srHBox { flex: 1; max-width: 692px; height: 46px; margin: 0; }
  .srHeadR { margin-left: auto; padding-left: 16px; }
}
.srTabsWrap { border-bottom: 1px solid var(--line2); }
.srTabs { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; padding: 0 12px; scroll-snap-type: x proximity; }
.srTabs::-webkit-scrollbar { display: none; }
.srTab { flex: none; display: inline-flex; align-items: center; gap: 6px; height: 44px; padding: 0 12px; font: 400 14px/1 ${GS}; color: var(--ink2); position: relative; white-space: nowrap; }
.srTab:hover { color: var(--ink); }
.srTab.is-on { color: var(--ink); font-weight: 600; }
.srTab.is-on::after { content: ""; position: absolute; left: 12px; right: 12px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: var(--ink); animation: srTabIn .25s ease both; }
@keyframes srTabIn { from { transform: scaleX(.4); opacity: 0; } }
.srTab.is-ai { margin-right: 4px; }
.srTools { margin-left: auto; }
@media (min-width: 760px) { .srTabs { padding-left: 168px; } }

/* ── results body ── */
.srBody { padding: 0 16px 24px; animation: srFade .3s ease both; }
@keyframes srFade { from { opacity: 0; } }
.srCols { display: flex; gap: 76px; }
.srMain { flex: 1; min-width: 0; max-width: 652px; }
.srSide { flex: 0 0 369px; min-width: 0; padding-top: 20px; }
@media (min-width: 760px) { .srBody { padding: 0 24px 40px 180px; } }
@media (min-width: 760px) and (max-width: 1099px) { .srBody { padding-left: 44px; padding-right: 44px; } .srMain { max-width: 720px; margin: 0 auto; } .srTabs { padding-left: 32px; } .srHeadWord { width: 140px; } }
@media (min-width: 1100px) and (max-width: 1299px) { .srBody { padding-left: 120px; } .srTabs { padding-left: 108px; } .srCols { gap: 48px; } }
.srCount { color: var(--ink3); font-size: 14px; padding: 14px 0 6px; }
.srNote { margin: 6px 0 10px; padding: 12px 16px; border-radius: 16px; background: var(--aio2); color: var(--ink); }
.srDym { font-size: 18px; color: var(--ink); padding: 6px 0 14px; line-height: 1.4; }
.srDym button { color: var(--link); }
.srDym button:hover { text-decoration: underline; }
.srDym small { font-size: 14px; color: var(--ink2); }
.srSecH { display: flex; align-items: center; gap: 8px; font: 400 20px/1.3 ${GS}; color: var(--ink); padding: 0 0 12px; }
.srSecH small { font-size: 14px; color: var(--ink3); }
.srSecIc { display: grid; place-items: center; color: var(--ink2); }
.srDotsSm { margin-left: auto; color: var(--ink3); display: grid; }
.srScroller { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x mandatory; margin: 0 -16px; padding: 2px 16px 6px; }
.srScroller::-webkit-scrollbar { display: none; }
@media (min-width: 760px) { .srScroller { margin: 0; padding: 2px 0 6px; } }
.srMoreBar { display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%; height: 40px; margin-top: 12px; border-radius: 99px; background: var(--chip); color: var(--ink); font: 500 14px/1 ${GS}; }
.srMoreBar:hover { filter: brightness(.97); }
.srEmpty { padding: 40px 0; text-align: center; color: var(--ink3); font-size: 16px; }

/* ── a result ── */
.srR { padding: 14px 0 18px; border-bottom: 1px solid var(--line2); }
@media (min-width: 760px) { .srR { border-bottom: 0; padding: 12px 0 18px; } }
.srRAd { font: 700 14px/1.2 ${UI}; color: var(--ink); padding-bottom: 8px; }
.srRBody { display: flex; gap: 16px; align-items: flex-start; }
.srRMain { position: relative; flex: 1; min-width: 0; }
.srRLink { display: block; width: 100%; }
.srRSite { display: flex; align-items: center; gap: 12px; padding-right: 26px; margin-bottom: 6px; }
.srRSiteTx { display: grid; min-width: 0; }
.srRName { font-size: 14px; line-height: 20px; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.srRUrl { font-size: 12px; line-height: 18px; color: var(--ink2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.srRDots { position: absolute; top: 4px; right: -4px; color: var(--ink3); }
.srRTitle { font: 400 20px/1.3 ${UI}; color: var(--link); margin: 0 0 4px !important; overflow-wrap: anywhere; }
@media (max-width: 759px) { .srRTitle { font-size: 19px; } }
.srRLink:hover .srRTitle { text-decoration: underline; }
.srRLink:visited .srRTitle { color: var(--visited); }
.srRSnip { font-size: 14px; line-height: 22px; color: var(--ink2); overflow-wrap: anywhere; }
.srRSnip b { color: var(--ink); font-weight: 700; }
.sr.is-dark .srRSnip b { color: #e8eaed; }
.srRDate { color: var(--ink3); }
.srRThumb { flex: none; width: 92px; height: 92px; border-radius: 12px; overflow: hidden; margin-top: 30px; }
.srRThumb .srPic { width: 100%; height: 100%; }
@media (max-width: 420px) { .srRThumb { width: 80px; height: 80px; } }

/* ── AI overview ── */
.srAio { position: relative; margin: 6px 0 18px; padding: 16px 16px 12px; border-radius: 20px; background: linear-gradient(135deg, var(--aio1), var(--aio2)); overflow: hidden; max-height: 420px; transition: max-height .5s ease; }
.srAio.is-open { max-height: 3000px; }
.srAio::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(120deg, rgba(63,118,238,.35), rgba(155,107,242,.25), rgba(232,68,94,.3)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
.srAioHead { display: flex; align-items: center; gap: 8px; font: 500 16px/1 ${GS}; color: var(--ink); margin-bottom: 12px; }
.srSpin { animation: srSpin 1.6s linear infinite; }
@keyframes srSpin { to { transform: rotate(360deg); } }
.srAioSkel { display: grid; gap: 10px; padding: 4px 0 16px; }
.srAioSkel i { display: block; height: 14px; border-radius: 8px; background: linear-gradient(90deg, rgba(63,118,238,.18), rgba(232,68,94,.22), rgba(63,118,238,.18)); background-size: 200% 100%; animation: srShim 1.2s linear infinite; }
@keyframes srShim { to { background-position: -200% 0; } }
.srAioGrid { display: grid; gap: 14px; }
@media (min-width: 900px) { .srAio.is-full .srAioGrid, .srAioGrid { grid-template-columns: minmax(0, 1fr) 210px; } }
.srAioBody { min-width: 0; }
.srAioP { font-size: 16px; line-height: 26px; color: var(--ink); margin-bottom: 12px !important; }
.srAioP b { background: rgba(244,180,43,.22); border-radius: 3px; padding: 0 1px; font-weight: 700; }
.srCaret { display: inline-block; width: 9px; height: 17px; margin-left: 3px; vertical-align: -3px; border-radius: 2px; background: linear-gradient(#3F76EE, #E8445E); animation: srBlink .8s steps(2) infinite; }
@keyframes srBlink { 50% { opacity: 0; } }
.srAioPts { padding-left: 20px; display: grid; gap: 8px; font-size: 16px; line-height: 24px; color: var(--ink); }
.srAioPts b { font-weight: 700; }
.srAioSrc { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
@media (min-width: 900px) { .srAioSrc { flex-direction: column; overflow: visible; } }
.srAioCard { flex: none; width: 210px; display: flex; gap: 8px; padding: 10px; border-radius: 14px; background: var(--card); text-align: left; animation: srIn .5s both; }
.srAioCard:hover { filter: brightness(.98); }
.srAioCardTx { flex: 1; min-width: 0; display: grid; gap: 3px; font-size: 12px; line-height: 16px; color: var(--ink2); }
.srAioCardTx b { font: 500 13px/17px ${UI}; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.srAioCardTx > span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.srAioCardTx small { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--ink3); }
.srAioCardPic { width: 56px; height: 56px; border-radius: 10px; flex: none; }
.srAioFoot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 10px; font-size: 12px; color: var(--ink3); }
.srAioVote { display: flex; gap: 2px; }
.srAioVote button { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; color: var(--ink2); }
.srAioVote button:hover { background: var(--hover); }
.srAioVote button.is-on { color: var(--accent); background: rgba(11,87,208,.1); }
.srAioThanks { font-size: 13px; color: var(--ink2); padding: 6px 0 2px; animation: srIn .4s both; }
.srAioMoreWrap { position: absolute; left: 0; right: 0; bottom: 0; padding: 60px 16px 12px; background: linear-gradient(to bottom, transparent, var(--aio2) 70%); display: flex; justify-content: center; }
.srAioMore { display: inline-flex; align-items: center; gap: 4px; height: 40px; padding: 0 22px; border-radius: 99px; background: var(--card); color: var(--ink); font: 500 14px/1 ${GS}; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.srAio.is-full { max-height: none; }

/* ── knowledge panel ── */
.srKp { color: var(--ink); }
.srKp--side { border: 1px solid var(--line); border-radius: 20px; overflow: hidden; }
.srKp--side > *:not(.srKpPics) { margin-left: 16px !important; margin-right: 16px !important; }
.srKp--top { margin: 4px 0 14px; }
.srKp--about { padding: 16px 0 10px; border-top: 8px solid var(--line2); border-bottom: 8px solid var(--line2); margin: 8px -16px 10px; padding-left: 16px; padding-right: 16px; }
@media (min-width: 760px) { .srKp--about { margin-left: 0; margin-right: 0; border: 1px solid var(--line); border-radius: 20px; } }
.srKpAboutH { font: 400 22px/1.3 ${GS} !important; margin-bottom: 8px !important; }
.srKpPics { display: grid; gap: 3px; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 94px 94px; border-radius: 18px; overflow: hidden; }
.srKp--side .srKpPics { border-radius: 0; grid-template-rows: 112px 112px; }
.srKpPics.n1 { grid-template-columns: 1fr; grid-template-rows: 190px; }
.srKpPics.n2 { grid-template-columns: 1fr 1fr; grid-template-rows: 190px; }
.srKpPics.n3 { grid-template-columns: 2fr 1fr; }
.srKpPic { position: relative; overflow: hidden; }
.srKpPic .srPic { width: 100%; height: 100%; transition: transform .4s ease; }
.srKpPic:hover .srPic { transform: scale(1.04); }
.srKpPics .srKpPic:first-child { grid-row: span 2; }
.srKpPics.n2 .srKpPic:first-child, .srKpPics.n1 .srKpPic:first-child { grid-row: auto; }
.srKpPics.n3 .srKpPic:nth-child(2), .srKpPics.n3 .srKpPic:nth-child(3) { grid-column: 2; }
.srKpPics.n4 .srKpPic:nth-child(4) { grid-column: span 2; }
.srKpMore { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.45); color: #fff; font: 500 18px/1 ${GS}; }
.srKpHead { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 14px 0 6px; }
.srKpTitle { font: 400 28px/1.2 ${GS}; color: var(--ink); overflow-wrap: anywhere; }
.srKp--side .srKpTitle { font-size: 30px; }
.srKpSub { font-size: 14px; color: var(--ink3); margin-top: 3px !important; }
.srKpShare { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line) !important; display: grid; place-items: center; color: var(--accent); flex: none; }
.srKpDesc { font-size: 14px; line-height: 22px; color: var(--ink2); padding: 10px 0 12px; border-top: 1px solid var(--line2); }
.srKp--side .srKpDesc { margin-top: 6px !important; }
.srKpSrc { color: var(--link); text-decoration: underline; text-underline-offset: 2px; }
.srKpFacts { display: grid; gap: 8px; padding: 2px 0 14px; font-size: 14px; line-height: 20px; }
.srKpFacts div { display: block; }
.srKpFacts dt { display: inline; font-weight: 700; color: var(--ink); }
.srKpFacts dd { display: inline; color: var(--ink2); }
.srKpQuote { border-left: 3px solid var(--rose); padding: 4px 0 4px 12px; font-style: italic; color: var(--ink2); margin-bottom: 14px !important; }
.srKpH { font: 400 18px/1.3 ${GS}; color: var(--ink); padding: 12px 0 10px; border-top: 1px solid var(--line2); }
.srKpRevSum { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.srKpRevBig { font: 400 32px/1 ${GS}; }
.srKpRevN { font-size: 13px; color: var(--link); }
.srRev { display: flex; gap: 10px; padding: 8px 0; }
.srRevAv { flex: none; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: #fff; font: 600 14px/1 ${GS}; }
.srRevTop { font-size: 14px; }
.srRevMeta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink3); }
.srRevTx { font-size: 14px; line-height: 20px; color: var(--ink2); margin-top: 2px !important; }
.srKpAlso { padding-bottom: 6px; }
.srKpAlsoRow { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; padding-bottom: 8px; }
.srKpAlsoRow::-webkit-scrollbar { display: none; }
.srKpAlsoItem { flex: none; width: 84px; display: grid; justify-items: center; gap: 4px; text-align: center; }
.srKpAlsoPic { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; color: #fff; font: 500 28px/1 ${GS}; transition: transform .2s; }
.srKpAlsoItem:hover .srKpAlsoPic { transform: scale(1.05); }
.srKpAlsoItem b { font-size: 13px; font-weight: 400; color: var(--link); line-height: 1.25; }
.srKpAlsoItem small { font-size: 11.5px; color: var(--ink3); line-height: 1.25; }
.srKpFeedback { text-align: right; font-size: 12px; font-style: italic; color: var(--ink3); padding: 6px 0 14px; }

/* ── people also ask ── */
.srPaa { padding: 16px 0 8px; }
.srPaaRow { border-top: 1px solid var(--line); }
.srPaaRow:last-of-type { border-bottom: 1px solid var(--line); }
.srPaaQ { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 52px; padding: 12px 0; font-size: 16px; line-height: 24px; color: var(--ink); text-align: left; }
.srPaaQ svg { flex: none; color: var(--ink2); transition: transform .3s ease; }
.srPaaRow.is-open .srPaaQ svg { transform: rotate(180deg); }
.srPaaA { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
.srPaaRow.is-open .srPaaA { grid-template-rows: 1fr; }
.srPaaA > div { overflow: hidden; }
.srPaaA p { font-size: 16px; line-height: 26px; color: var(--ink); padding: 2px 0 12px; }
.srPaaSrc { display: flex; align-items: center; gap: 10px; padding: 0 0 16px; text-align: left; }
.srPaaSrc span { display: grid; }
.srPaaSrc b { font-weight: 400; font-size: 14px; color: var(--ink); }
.srPaaSrc small { font-size: 12px; color: var(--ink2); }
.srPaaFeedback { text-align: right; font-size: 12px; font-style: italic; color: var(--ink3); padding-top: 6px; }

/* ── top stories ── */
.srStories { padding: 18px 0 10px; }
.srStory { flex: none; width: 238px; scroll-snap-align: start; border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: var(--card); text-align: left; display: flex; flex-direction: column; transition: box-shadow .2s; }
.srStory:hover { box-shadow: var(--shadow); }
.srStoryPic { width: 100%; height: 124px; }
.srStoryBody { display: grid; gap: 6px; padding: 10px 12px 12px; }
.srStorySrc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink); }
.srStoryTitle { font: 400 16px/22px ${UI}; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.srStory:hover .srStoryTitle { text-decoration: underline; }
.srStoryBody small, .srNewsTx small { font-size: 12px; color: var(--ink3); }
.srNewsList { display: grid; }
.srNewsRow { display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line2); text-align: left; }
.srNewsTx { flex: 1; min-width: 0; display: grid; gap: 6px; }
.srNewsTx b { font: 400 18px/24px ${UI}; color: var(--link); }
.srNewsRow:hover .srNewsTx b { text-decoration: underline; }
.srNewsPic { width: 104px; height: 104px; border-radius: 12px; flex: none; }

/* ── images ── */
.srImgs { padding: 18px 0 10px; }
.srImgChips { margin-bottom: 10px; }
.srChip { flex: none; display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px 0 4px; border-radius: 10px; border: 1px solid var(--chipLine) !important; background: var(--bg); font-size: 14px; color: var(--ink); white-space: nowrap; scroll-snap-align: start; }
.srChip:hover { background: var(--hover); }
.srChipPic { width: 28px; height: 28px; border-radius: 7px; }
.srImgRow { display: grid; grid-template-columns: 1.4fr 1fr 1fr; grid-template-rows: 110px 110px; gap: 4px; border-radius: 16px; overflow: hidden; }
@media (min-width: 760px) { .srImgRow { grid-template-columns: 1.3fr 1fr 1fr 1fr; grid-template-rows: 130px 130px; } }
.srImgTile { position: relative; overflow: hidden; }
.srImgTile .srPic { width: 100%; height: 100%; transition: transform .4s ease; }
.srImgTile:hover .srPic { transform: scale(1.05); }
.srImgTile.t0 { grid-row: span 2; }
@media (max-width: 759px) { .srImgTile.t5, .srImgTile.t4 { display: none; } }
@media (min-width: 760px) { .srImgTile.t5 { display: none; } }

/* ── videos ── */
.srVids { padding: 18px 0 10px; display: grid; gap: 4px; }
.srVid { display: flex; gap: 14px; padding: 8px 0; text-align: left; }
.srVidThumb { position: relative; flex: none; width: 140px; height: 80px; border-radius: 12px; overflow: hidden; }
.srVidThumb .srPic { width: 100%; height: 100%; }
.srVids.is-big .srVidThumb { width: min(240px, 42vw); height: min(136px, 24vw); }
.srVidPlay { position: absolute; left: 50%; top: 50%; width: 38px; height: 38px; margin: -19px 0 0 -19px; border-radius: 50%; display: grid; place-items: center; background: rgba(0,0,0,.55); color: #fff; transition: transform .2s; }
.srVid:hover .srVidPlay { transform: scale(1.12); }
.srVidDur { position: absolute; right: 6px; bottom: 6px; padding: 1px 5px; border-radius: 4px; background: rgba(0,0,0,.75); color: #fff; font-size: 12px; font-weight: 700; }
.srVidTx { display: grid; align-content: start; gap: 4px; min-width: 0; }
.srVidTx b { font: 400 16px/22px ${UI}; color: var(--link); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.srVid:hover .srVidTx b { text-decoration: underline; }
.srVidTx small { font-size: 13px; color: var(--ink2); }

/* ── local pack ── */
.srLocal { padding: 18px 0 10px; }
.srMap { position: relative; height: 170px; border-radius: 16px; overflow: hidden; margin-bottom: 6px; }
.srMap.is-tall { height: min(380px, 52vh); }
.srMapSvg { position: absolute; inset: 0; width: 100%; height: 100%; }
.srMapLand { fill: #f1efe9; }
.srMapWater { fill: #aadaff; }
.srMapPark { fill: #c8e6c9; }
.srMapRoad { fill: none; stroke: #fff; stroke-width: 1.1; vector-effect: non-scaling-stroke; stroke-width: 3px; }
.srMapRoad.big { stroke: #fde293; stroke-width: 6px; }
.srMapTrail { fill: none; stroke: #E8445E; stroke-width: 2.5px; vector-effect: non-scaling-stroke; stroke-dasharray: 6 6; animation: srDash 1.4s linear infinite; }
@keyframes srDash { to { stroke-dashoffset: -24; } }
.sr.is-dark .srMapLand { fill: #2c2f33; } .sr.is-dark .srMapWater { fill: #17263c; } .sr.is-dark .srMapPark { fill: #263c2f; }
.sr.is-dark .srMapRoad { stroke: #44484d; } .sr.is-dark .srMapRoad.big { stroke: #6b5f3a; }
.srPin { position: absolute; transform: translate(-50%, -100%); display: grid; justify-items: center; filter: drop-shadow(0 2px 2px rgba(0,0,0,.25)); transition: transform .2s; z-index: 1; }
.srPin.is-on { transform: translate(-50%, -100%) scale(1.25); z-index: 2; animation: srPinB .6s ease; }
@keyframes srPinB { 30% { transform: translate(-50%, -120%) scale(1.25); } }
.srPinLbl { position: absolute; top: 100%; white-space: nowrap; font: 700 11px/1.2 ${UI}; color: #3c4043; text-shadow: 0 0 3px #fff, 0 0 3px #fff; }
.sr.is-dark .srPinLbl { color: #e8eaed; text-shadow: 0 0 3px #000, 0 0 3px #000; }
.srPlaces { display: grid; }
.srPlace { border-bottom: 1px solid var(--line2); padding: 12px 0; }
.srPlace.is-on .srPlaceTx b { color: var(--rose); }
.srPlaceMain { width: 100%; display: flex; gap: 14px; text-align: left; }
.srPlaceTx { flex: 1; min-width: 0; display: grid; gap: 2px; font-size: 14px; color: var(--ink2); }
.srPlaceTx b { font: 400 16px/22px ${UI}; color: var(--link); }
.srPlaceRate { display: flex; align-items: center; gap: 4px; color: var(--ink2); }
.srPlaceRate small { color: var(--ink3); }
.srOpen { color: var(--green); }
.srOpen span { color: var(--ink2); }
.srPlaceNote { margin-top: 6px; padding: 8px 12px; border-radius: 12px; background: var(--aio2); color: var(--ink); font-style: italic; }
.srPlacePic { width: 86px; height: 86px; border-radius: 12px; flex: none; }
.srPlaceActs { display: flex; gap: 8px; padding-top: 10px; }
.srPlaceActs button { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 99px; border: 1px solid var(--line) !important; color: var(--accent); font: 500 13px/1 ${GS}; }
.srPlaceActs button:hover { background: var(--hover); }
.srMapsTab { max-width: 1100px; }
@media (min-width: 900px) { .srLocal.is-full { display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start; } .srLocal.is-full .srMap { order: 2; position: sticky; top: 12px; height: 70vh; } }

/* ── related + pager ── */
.srRel { padding: 22px 0 6px; }
.srRelGrid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 560px) { .srRelGrid { grid-template-columns: 1fr 1fr; } }
.srRelChip { display: flex; align-items: center; gap: 14px; min-height: 48px; padding: 0 18px; border-radius: 99px; background: var(--chip); color: var(--ink); font-size: 14px; text-align: left; }
.srRelChip svg { color: var(--ink3); flex: none; }
.srRelChip span { font-weight: 700; overflow-wrap: anywhere; }
.srRelChip:hover { filter: brightness(.96); }
.srPager { padding: 36px 0 10px; display: flex; justify-content: center; overflow-x: auto; scrollbar-width: none; }
.srPagerRow { display: flex; align-items: flex-start; font-family: ${GS}; }
.srPagerCell, .srPagerPrev, .srPagerNext { display: grid; justify-items: center; }
.srPagerL { display: inline-flex; font-size: 34px; line-height: 1.1; font-weight: 500; letter-spacing: -.03em; }
@media (max-width: 480px) { .srPagerL { font-size: 26px; } }
.srPagerV { color: #F4B42B; transition: transform .2s; }
.srPagerCell:hover .srPagerV { transform: translateY(-3px); }
.srPagerCell.is-on .srPagerV { color: #E8445E; }
.srPagerN { font: 400 13px/1.6 ${UI}; color: var(--link); min-width: 16px; text-align: center; }
.srPagerCell.is-on .srPagerN { color: var(--ink); font-weight: 700; }
.srPagerPrev, .srPagerNext { padding: 0 6px; }
.srPagerPrev .srPagerN, .srPagerNext .srPagerN { font-weight: 700; }

/* ── results footer ── */
.srResFoot { background: var(--foot); color: var(--ink3); font-size: 14px; padding: 16px 16px 90px; }
@media (min-width: 760px) { .srResFoot { padding-left: 180px; } }
@media (min-width: 760px) and (max-width: 1099px) { .srResFoot { padding-left: 44px; } }
.srResFootLoc { padding-bottom: 12px; border-bottom: 1px solid var(--line); line-height: 1.8; }
.srResFootLoc b { color: var(--ink); font-weight: 700; }
.srResFootLoc button { color: var(--accent); }
.srDot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--rose); vertical-align: 0; box-shadow: 0 0 0 3px rgba(232,68,94,.2); animation: srPulse 1.8s ease-in-out infinite; }
@keyframes srPulse { 50% { box-shadow: 0 0 0 7px rgba(232,68,94,0); } }
.srResFootLinks { display: flex; flex-wrap: wrap; gap: 6px 24px; padding-top: 12px; }
.srResFootLinks button:hover { text-decoration: underline; }
.srResFootStar { display: flex; align-items: center; gap: 6px; padding-top: 12px; font-size: 12px; color: var(--rose); }

/* ── quick settings ── */
.srGear { width: 290px; padding: 12px 8px; border-radius: 22px; }
.srGearH { font: 500 16px/1 ${GS}; padding: 8px 14px 12px; }
.srGearRow { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; border-radius: 12px; font-size: 14px; }
.srGearRow:hover { background: var(--hover); }
.srGearRow small { color: var(--ink3); }
.srSwitch { width: 36px; height: 20px; border-radius: 99px; background: var(--line); position: relative; transition: background .2s; }
.srSwitch i { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .2s; }
.srSwitch.is-on { background: var(--accent); }
.srSwitch.is-on i { transform: translateX(16px); }

/* ── AI mode tab ── */
.srAiMode { padding-top: 20px; }
.srAiQ { margin: 0 0 16px auto; width: fit-content; max-width: 80%; padding: 12px 18px; border-radius: 22px 22px 4px 22px; background: var(--chip); font-size: 16px; }
.srAiFollow { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 16px; }
.srAiChipQ { padding: 8px 14px; border-radius: 99px; border: 1px solid var(--line) !important; font-size: 14px; color: var(--ink); }
.srAiChipQ:hover { background: var(--hover); }
.srAiAsk { width: 100%; display: flex; align-items: center; gap: 10px; height: 54px; padding: 0 20px; border-radius: 28px; border: 1px solid var(--line) !important; color: var(--ink3); font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }

/* ── images tab ── */
.srGallery { padding-top: 12px; }
@media (min-width: 760px) { .srGallery { margin-left: -152px; } }
@media (min-width: 760px) and (max-width: 1099px) { .srGallery { margin-left: 0; } }
.srGalChips { margin-bottom: 14px; }
.srMasonry { columns: 2 150px; column-gap: 12px; }
@media (min-width: 760px) { .srMasonry { columns: 4 200px; column-gap: 16px; } }
.srMasItem { display: block; width: 100%; break-inside: avoid; margin-bottom: 16px; text-align: left; }
.srMasPic { width: 100%; border-radius: 14px; }
.srMasPic.h0 { aspect-ratio: 4/5; } .srMasPic.h1 { aspect-ratio: 1/1; } .srMasPic.h2 { aspect-ratio: 3/4; }
.srMasItem:hover .srMasCap { text-decoration: underline; }
.srMasSite { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink2); margin-top: 6px; }
.srMasCap { display: block; font-size: 14px; color: var(--ink); line-height: 1.3; margin-top: 2px; }

/* ── shopping ── */
.srShopGrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 760px) { .srShopGrid { grid-template-columns: repeat(3, 1fr); max-width: 760px; } }
.srShopCard { border: 1px solid var(--line2) !important; border-radius: 16px; overflow: hidden; text-align: left; background: var(--card); transition: box-shadow .2s; }
.srShopCard:hover { box-shadow: var(--shadow); }
.srShopPic { width: 100%; aspect-ratio: 1; }
.srShopTx { display: grid; gap: 3px; padding: 10px 12px 12px; font-size: 13px; color: var(--ink2); }
.srShopTx b { font-weight: 400; font-size: 14px; color: var(--ink); line-height: 1.3; }
.srShopPrice { font: 700 16px/1.3 ${UI}; color: var(--ink); }
.srShopRate { display: flex; align-items: center; gap: 4px; }
.srShopOos { color: var(--rose); }

/* ── viewers ── */
.srViewerScrim { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.5); animation: srFade .2s both; }
.srViewerScrim.is-dark { background: rgba(0,0,0,.88); display: grid; place-items: center; padding: 16px; }
.srViewer { position: absolute; inset: 0; background: var(--bg); color: var(--ink); overflow-y: auto; animation: srSlideUp .3s cubic-bezier(.2,.9,.3,1) both; }
@media (min-width: 900px) { .srViewer { left: auto; width: min(46vw, 620px); border-radius: 20px 0 0 20px; animation-name: srSlideL; box-shadow: -8px 0 30px rgba(0,0,0,.2); } }
@keyframes srSlideUp { from { transform: translateY(24px); opacity: 0; } }
@keyframes srSlideL { from { transform: translateX(40px); opacity: 0; } }
.srViewerTop { display: flex; align-items: center; justify-content: space-between; padding: 8px 8px 8px 16px; position: sticky; top: 0; background: var(--bg); z-index: 2; }
.srViewerSite { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.srViewerActs { display: flex; }
.srViewerStage { position: relative; margin: 0 16px; border-radius: 16px; overflow: hidden; background: #000; }
.srViewerPic { width: 100%; aspect-ratio: 4/5; max-height: 64vh; animation: srZoomIn .4s ease both; }
@media (min-width: 900px) { .srViewerPic { aspect-ratio: 1/1; } }
@keyframes srZoomIn { from { opacity: .3; transform: scale(1.03); } }
.srViewerLike { position: absolute; right: 12px; bottom: 12px; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.92) !important; color: #9aa0a6 !important; box-shadow: 0 2px 8px rgba(0,0,0,.2); transition: transform .2s; }
.srViewerLike.is-on { color: #E8445E !important; animation: srLike .5s ease; }
@keyframes srLike { 40% { transform: scale(1.35); } }
.srViewerNav { position: absolute; top: 50%; width: 40px; height: 40px; margin-top: -20px; border-radius: 50%; display: grid; place-items: center; background: rgba(0,0,0,.45) !important; color: #fff !important; }
.srViewerNav.is-l { left: 10px; } .srViewerNav.is-r { right: 10px; }
.srViewerInfo { padding: 16px; display: grid; gap: 8px; }
.srViewerInfo h3 { font: 400 22px/1.3 ${GS}; }
.srViewerNote { font-size: 16px; line-height: 26px; color: var(--ink); padding: 12px 14px; border-radius: 14px; background: var(--aio2); font-style: italic; }
.srViewerMeta { font-size: 12px; color: var(--ink3); }
.srViewerVisit { justify-self: start; display: inline-flex; align-items: center; gap: 2px; height: 38px; padding: 0 18px; border-radius: 99px; background: var(--accent) !important; color: #fff !important; font: 500 14px/1 ${GS}; }
.sr.is-dark .srViewerVisit { color: #062e6f !important; }
.srViewerRel { padding: 6px 16px 28px; }
.srViewerRel p { font: 400 16px/1 ${GS}; margin-bottom: 10px !important; }
.srViewerRelRow { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 6px; }
.srViewerRelRow button { aspect-ratio: 1; border-radius: 10px; overflow: hidden; opacity: .75; transition: opacity .2s; }
.srViewerRelRow button.is-on { opacity: 1; outline: 3px solid var(--accent); outline-offset: -3px; }
.srViewerRelRow .srPic { width: 100%; height: 100%; }
.srPlayer { position: relative; width: min(900px, 100%); color: #fff; animation: srSlideUp .3s both; }
.srPlayerFrame { position: relative; aspect-ratio: 16/9; border-radius: 16px; overflow: hidden; background: #000; cursor: pointer; }
.srPlayerPic { position: absolute !important; inset: 0; }
.srPlayerFrame.is-playing .srPlayerPic img { animation: srKen 7s linear both; }
@keyframes srKen { from { transform: scale(1); } to { transform: scale(1.18) translate(-2%, -2%); } }
.srPlayerSub { position: absolute; left: 50%; bottom: 56px; transform: translateX(-50%); width: max-content; max-width: 86%; padding: 4px 10px; background: rgba(8,8,8,.75); color: #fff; font-size: clamp(14px, 2.2vw, 20px); line-height: 1.4; text-align: center; border-radius: 4px; }
.srPlayerBig { position: absolute; left: 50%; top: 50%; width: 68px; height: 68px; margin: -34px 0 0 -34px; border-radius: 50%; display: grid; place-items: center; background: rgba(0,0,0,.6); }
.srPlayerBar { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 10px; padding: 26px 12px 10px; background: linear-gradient(transparent, rgba(0,0,0,.7)); }
.srPlayerBar button { color: #fff; display: grid; }
.srPlayerTime { font-size: 12px; font-variant-numeric: tabular-nums; flex: none; }
.srPlayerTrack { flex: 1; height: 4px; border-radius: 4px; background: rgba(255,255,255,.3); overflow: hidden; }
.srPlayerTrack i { display: block; height: 100%; background: #E8445E; }
.srPlayerInfo { padding: 12px 2px; }
.srPlayerInfo h3 { font: 400 18px/1.35 ${GS}; }
.srPlayerInfo p { font-size: 13px; color: #bdc1c6; margin-top: 4px !important; }
.srPlayerX { position: absolute; top: -48px; right: 0; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: #fff !important; background: rgba(255,255,255,.14) !important; }
.srSite { position: fixed; inset: 0; z-index: 80; background: #fffdf7; color: #222; overflow-y: auto; animation: srSlideL .3s cubic-bezier(.2,.9,.3,1) both; font-family: var(--font-tinos), Georgia, "Times New Roman", serif; }
.sr.is-dark .srSite { background: #1b1a17; color: #e9e4d8; }
.srSiteBar { position: sticky; top: 0; display: flex; align-items: center; gap: 6px; padding: 6px 12px 6px 6px; background: #f1f3f4; color: #3c4043; font-family: ${UI}; z-index: 2; }
.sr.is-dark .srSiteBar { background: #2d2e30; color: #e8eaed; }
.srSiteUrl { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border-radius: 99px; background: #fff; font-size: 13px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.sr.is-dark .srSiteUrl { background: #1f1f1f; }
.srSiteDoc { max-width: 640px; margin: 0 auto; padding: 28px 20px 80px; font-size: 18px; line-height: 1.7; }
.srSiteDoc h1 { font-size: clamp(26px, 5vw, 34px); line-height: 1.2; margin: 6px 0 8px; }
.srSiteDoc p { margin: 0 0 16px; }
.srSiteKicker { font: 700 12px/1 ${UI}; letter-spacing: .08em; text-transform: uppercase; color: #b3261e; }
.srSiteBy { font: 13px/1.4 ${UI}; color: #777; }
.srSiteFig { margin: 18px 0 20px; }
.srSiteFig .srPic { width: 100%; aspect-ratio: 16/10; border-radius: 6px; }
.srSiteFig figcaption { font: italic 14px/1.4 ${UI}; color: #777; padding-top: 6px; }
.srSiteEnd { font-style: italic; color: #888; font-size: 15px; }
.srSiteBack { font: 14px ${UI}; color: #1f15ab !important; text-decoration: underline; }
.sr.is-dark .srSiteBack { color: #99c3ff !important; }
.srToast { position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%); z-index: 90; max-width: min(92vw, 460px); padding: 12px 18px; border-radius: 8px; background: #303134; color: #e8eaed; font-size: 14px; line-height: 1.4; box-shadow: 0 4px 12px rgba(0,0,0,.3); animation: srToast .3s cubic-bezier(.2,.9,.3,1) both; text-align: center; }
.sr.is-dark .srToast { background: #e8eaed; color: #202124; }
@keyframes srToast { from { opacity: 0; transform: translate(-50%, 16px); } }

.sr.is-reduced *, .sr.is-reduced *::before, .sr.is-reduced *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
@media (prefers-reduced-motion: reduce) { .sr *, .sr *::before, .sr *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; } }
`;
