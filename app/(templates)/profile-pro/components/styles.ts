// ─── Endorsements — the stylesheet ───────────────────────────────────────────
//
// Phone (< 768): the app — edge-to-edge cards with 8px seams, sticky top bar,
// five-tab bar. Tablet (768–991): the web nav over one 720px column, rail
// content flowing under it. Desktop (≥ 992): the web's 1128px container with a
// main column and a 300px right rail. Motion is transform/opacity only and is
// dropped under prefers-reduced-motion.

import { LI, PP } from "./theme";

export const PROFILE_CSS = `
.pf-root { min-height: 100dvh; background: ${PP.page}; color: ${PP.ink}; font-family: ${PP.font}; font-size: 14px; line-height: 1.42857; -webkit-font-smoothing: antialiased; overflow-x: clip; }
.pf-root *, .pf-root *::before, .pf-root *::after { box-sizing: border-box; }
:where(.pf-root) button { font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.pf-root h1, .pf-root h2, .pf-root h3, .pf-root h4, .pf-root p { margin: 0; }
.pf-root button:focus-visible, .pf-root input:focus-visible { outline: 2px solid ${LI.blue}; outline-offset: 2px; }
.pf-pic { position: relative; display: block; overflow: hidden; background: #E9E5DF; }
.pf-pic img { display: block; position: absolute; inset: 0; }
.pf-face { border-radius: 50%; flex: none; }
.pf-link { border: 0; background: none; padding: 0; color: ${LI.blue}; font-weight: 600; }
.pf-link:hover { text-decoration: underline; }
.pf-strong { font-size: 14px; }
.pf-dim { color: ${LI.mute}; font-weight: 400; }
.pf-clip { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pf-badge { position: absolute; top: -4px; right: -8px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 99px; background: #CB112D; color: #fff; font: 600 11px/18px ${PP.font}; text-align: center; box-shadow: 0 0 0 2px #fff; animation: pfBadge .5s cubic-bezier(.2,1.6,.4,1) both; }
.pf-iconBtn { width: 32px; height: 32px; border-radius: 50%; border: 0; background: transparent; display: grid; place-items: center; color: ${LI.mute}; transition: background .15s; }
.pf-iconBtn:hover:not(:disabled) { background: ${LI.hover}; color: ${PP.ink}; }
.pf-iconBtn:disabled { opacity: .3; cursor: default; }

/* ── web nav ── */
.pf-nav { position: sticky; top: 0; z-index: 60; height: 52px; background: #fff; border-bottom: 1px solid ${LI.line}; display: none; }
.pf-navIn { max-width: 1128px; height: 100%; margin: 0 auto; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.pf-navLeft { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.pf-mark { border: 0; background: none; padding: 0; display: grid; flex: none; }
.pf-navRight { display: flex; align-items: stretch; height: 100%; }
.pf-navI { position: relative; border: 0; background: none; min-width: 64px; padding: 0 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${LI.mute}; transition: color .15s; }
.pf-navI:hover { color: ${PP.ink}; }
.pf-navI.is-on { color: ${PP.ink}; }
.pf-navI.is-on::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: 0; height: 2px; background: ${PP.ink}; }
.pf-navIc { position: relative; display: grid; place-items: center; height: 24px; }
.pf-navL { display: flex; align-items: center; font-size: 12px; line-height: 1.33; white-space: nowrap; }
.pf-navDiv { width: 1px; margin: 4px 8px; background: ${LI.line}; }
.pf-navPrem { border: 0; background: none; color: ${LI.premium}; font-size: 12px; text-decoration: underline; max-width: 96px; text-align: center; line-height: 1.3; }
@media (max-width: 1099px) { .pf-navL { display: none; } .pf-navI { min-width: 52px; } .pf-navI.is-on::after { left: 10px; right: 10px; } }
@media (max-width: 1023px) { .pf-navDiv, .pf-navPrem, .pf-navRight > .pf-navI:nth-of-type(7) { display: none; } }

/* ── search ── */
.pf-search { position: relative; display: flex; align-items: center; width: 280px; max-width: 100%; height: 34px; border-radius: 4px; background: #EDF3F8; transition: width .2s ease; }
.pf-search.is-focus { width: 380px; box-shadow: inset 0 0 0 2px ${PP.ink}; background: #fff; }
.pf-searchIc { position: absolute; left: 12px; color: ${LI.mute}; }
.pf-search input { width: 100%; height: 100%; border: 0; background: transparent; padding: 0 12px 0 40px; font: 400 14px ${PP.font}; color: ${PP.ink}; outline: none; }
.pf-search input::placeholder { color: ${LI.mute}; }
.pf-searchDrop { position: absolute; top: calc(100% + 6px); left: 0; right: 0; min-width: 260px; padding: 8px 0; background: #fff; border-radius: 8px; box-shadow: 0 0 0 1px ${LI.line}, 0 8px 24px rgba(0,0,0,.18); z-index: 5; animation: pfDrop .18s ease both; }
.pf-searchH { padding: 4px 16px 6px; font-size: 14px; font-weight: 600; }
.pf-searchDrop button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px 16px; border: 0; background: none; text-align: left; font-size: 14px; color: ${PP.ink}; }
.pf-searchDrop button svg { color: ${LI.mute}; flex: none; }
.pf-searchDrop button:hover { background: ${LI.hover}; }

/* ── mobile top + tab bar ── */
.pf-mtop { position: sticky; top: 0; z-index: 60; height: 52px; padding: 0 12px; display: flex; align-items: center; gap: 10px; background: #fff; border-bottom: 1px solid ${LI.line}; }
.pf-mtopMe { border: 0; background: none; padding: 0; display: grid; flex: none; }
.pf-search--m { flex: 1; width: auto; height: 34px; }
.pf-search--m.is-focus { width: auto; }
.pf-mtopIc { position: relative; flex: none; width: 36px; height: 36px; border: 0; background: none; display: grid; place-items: center; color: ${LI.mute}; }
.pf-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; display: flex; background: #fff; border-top: 1px solid ${LI.line}; padding-bottom: env(safe-area-inset-bottom, 0px); }
.pf-tab { flex: 1; height: 56px; border: 0; background: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: ${LI.mute}; font-size: 10.5px; white-space: nowrap; }
.pf-tab:active .pf-navIc { transform: scale(.9); }
.pf-tab .pf-navIc { transition: transform .12s; }
@media (min-width: 768px) { .pf-nav { display: block; } .pf-mtop, .pf-tabbar { display: none; } }

/* ── layout ── */
.pf-shell { padding: 0 0 calc(76px + env(safe-area-inset-bottom, 0px)); }
.pf-main, .pf-aside { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.pf-aside { margin-top: 8px; }
@media (min-width: 768px) {
  .pf-shell { max-width: 752px; margin: 0 auto; padding: 24px 16px 96px; }
  .pf-aside { margin-top: 8px; }
}
@media (min-width: 992px) {
  .pf-shell { max-width: 1160px; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 24px; align-items: start; }
  .pf-aside { margin-top: 0; }
}

/* ── cards ── */
.pf-card { position: relative; background: #fff; padding: 16px 16px 0; overflow: hidden; animation: pfRise .5s cubic-bezier(.2,1,.3,1) both; }
.pf-card:last-child { padding-bottom: 0; }
.pf-card > :last-child:not(.pf-showAll) { margin-bottom: 16px; }
@media (min-width: 768px) { .pf-card { border-radius: 8px; box-shadow: 0 0 0 1px rgba(140,140,140,.2); padding: 20px 24px 0; } .pf-card > :last-child:not(.pf-showAll) { margin-bottom: 20px; } }
.pf-cardH { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.pf-cardHT { min-width: 0; }
.pf-h2 { font-size: 20px; line-height: 1.4; font-weight: 600; color: ${PP.ink}; }
.pf-cardSub { margin-top: 2px; font-size: 14px; color: ${LI.mute}; }
.pf-cardAct { flex: none; display: flex; gap: 4px; }
.pf-private { display: inline-flex; align-items: center; gap: 4px; }
.pf-showAll { display: flex; align-items: center; justify-content: center; gap: 6px; width: calc(100% + 32px); margin: 8px -16px 0; padding: 12px 16px; border: 0; border-top: 1px solid ${LI.line}; background: none; font-size: 16px; font-weight: 600; color: ${LI.mute}; transition: background .15s; }
@media (min-width: 768px) { .pf-showAll { width: calc(100% + 48px); margin: 12px -24px 0; } }
.pf-showAll:hover { background: ${LI.hover}; color: ${PP.ink}; }
.pf-h3 { font-size: 16px; line-height: 1.5; font-weight: 600; color: ${PP.ink}; overflow-wrap: anywhere; }
.pf-sub { font-size: 14px; color: ${PP.ink}; overflow-wrap: anywhere; }
.pf-meta { font-size: 14px; color: ${LI.mute}; overflow-wrap: anywhere; }
.pf-list { list-style: none; margin: 0; padding: 0; }

/* see more */
.pf-more { position: relative; }
.pf-moreTx { display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-line; font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; }
.pf-moreTx[data-open] { display: block; }
.pf-moreBtn { border: 0; background: none; padding: 0; color: ${LI.mute}; font-size: 14px; font-weight: 600; }
.pf-moreBtn:hover { color: ${LI.blue}; text-decoration: underline; }

/* buttons */
.pf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 32px; padding: 6px 16px; border-radius: 99px; border: 0; font-size: 16px; font-weight: 600; line-height: 1.25; white-space: nowrap; transition: background .15s, box-shadow .15s, transform .12s, color .15s; }
.pf-btn:active { transform: scale(.97); }
.pf-btn--primary { background: ${LI.blue}; color: #fff !important; }
.pf-btn--primary:hover { background: ${LI.blueDeep}; }
.pf-btn--outline { background: #fff; color: ${LI.blue} !important; box-shadow: inset 0 0 0 1px ${LI.blue}; }
.pf-btn--outline:hover { background: ${LI.blueTint}; box-shadow: inset 0 0 0 2px ${LI.blue}; }
.pf-btn--ghost { background: #fff; color: rgba(0,0,0,.75) !important; box-shadow: inset 0 0 0 1px rgba(0,0,0,.6); }
.pf-btn--ghost:hover { background: ${LI.hover}; box-shadow: inset 0 0 0 2px rgba(0,0,0,.6); }
.pf-btn--sm { min-height: 32px; padding: 5px 14px; font-size: 14px; }
.pf-btn.is-on { background: ${PP.ink}; color: #fff !important; box-shadow: none; }
.pf-btn.is-pending { color: ${LI.mute} !important; box-shadow: inset 0 0 0 1px ${LI.line2}; }

/* ── top card ── */
.pf-top { padding: 0 !important; overflow: visible; z-index: 2; }
.pf-cover { position: relative; overflow: hidden; aspect-ratio: 3 / 1; background: linear-gradient(120deg, #A0B4B7, #C8D6DA); }
@media (min-width: 768px) { .pf-cover { aspect-ratio: 4 / 1; border-radius: 8px 8px 0 0; } }
.pf-coverPic { position: absolute !important; inset: 0; }
.pf-coverArt { position: absolute; inset: 0; background: radial-gradient(120% 140% at 10% 0%, #F8D7E3, transparent 55%), radial-gradient(120% 140% at 100% 100%, #CFE3F7, transparent 55%), linear-gradient(120deg, #EEE6F6, #F9EFE6); }
.pf-topBody { position: relative; padding: 0 16px 16px; }
@media (min-width: 768px) { .pf-topBody { padding: 0 24px 24px; } }
.pf-photoWrap { margin-top: -64px; height: 112px; }
@media (min-width: 768px) { .pf-photoWrap { margin-top: -112px; height: 160px; } }
.pf-photo { position: relative; display: block; width: 112px; height: 112px; padding: 0; border: 4px solid #fff; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.08); animation: pfPop .6s .1s cubic-bezier(.2,1.3,.4,1) both; }
@media (min-width: 768px) { .pf-photo { width: 160px; height: 160px; } }
.pf-photo > span:first-child { width: 100% !important; height: 100% !important; border-radius: 50% !important; font-size: 36px !important; }
.pf-frame { position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px); pointer-events: none; }
.pf-frameTx { font: 700 15px ${PP.font}; letter-spacing: 1.4px; fill: #fff; }
.pf-idRow { margin-top: 10px; }
.pf-name { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-size: 22px; line-height: 1.3; font-weight: 600; overflow-wrap: anywhere; }
@media (min-width: 768px) { .pf-name { font-size: 24px; } }
.pf-verified { display: inline-grid; color: ${LI.mute}; }
.pf-degree { font-size: 16px; font-weight: 400; color: ${LI.mute}; }
.pf-headline { margin-top: 2px; font-size: 16px; line-height: 1.5; overflow-wrap: anywhere; }
@media (max-width: 767px) { .pf-headline { font-size: 14px; } }
.pf-loc { margin-top: 6px; font-size: 14px; color: ${LI.mute}; }
.pf-conn { display: block; margin-top: 6px; padding: 0; border: 0; background: none; color: ${LI.blue}; font-size: 14px; font-weight: 600; text-align: left; }
.pf-conn:hover { text-decoration: underline; }
.pf-mutual { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 12px; color: ${LI.mute}; }
.pf-mutual b { font-weight: 600; color: ${LI.mute}; }
.pf-stack { display: inline-flex; flex: none; }
.pf-stackI { display: inline-grid; margin-left: -6px; border-radius: 50%; box-shadow: 0 0 0 2px #fff; }
.pf-stackI:first-child { margin-left: 0; }
.pf-stackYou { place-items: center; background: ${LI.blue}; color: #fff; font-weight: 700; animation: pfPop .45s cubic-bezier(.2,1.5,.4,1) both; }
.pf-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
@media (max-width: 767px) { .pf-actions { flex-wrap: nowrap; } .pf-actions > .pf-menuWrap:first-child, .pf-actions > .pf-btn { flex: 1; } .pf-actions > .pf-menuWrap:first-child .pf-btn { width: 100%; } .pf-moreL { display: none; } .pf-btn--more { width: 34px; padding: 0; } }
.pf-menuWrap { position: relative; }
.pf-menu { position: absolute; top: calc(100% + 6px); left: 0; z-index: 30; min-width: 260px; padding: 8px 0; background: #fff; border-radius: 8px; box-shadow: 0 0 0 1px ${LI.line}, 0 12px 28px rgba(0,0,0,.2); animation: pfDrop .18s ease both; }
.pf-menu--r { left: auto; right: 0; }
.pf-menu button { display: grid; gap: 2px; width: 100%; padding: 10px 16px; border: 0; background: none; text-align: left; font-size: 14px; font-weight: 600; color: rgba(0,0,0,.75); }
.pf-menu button span { font-weight: 400; color: ${LI.mute}; font-size: 13px; }
.pf-menu button:hover { background: ${LI.hover}; }
.pf-menuScrim { position: fixed; inset: 0; z-index: 20; }
.pf-openBox { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; width: 100%; max-width: 360px; margin-top: 16px; padding: 12px 16px; border: 0; border-radius: 8px; background: #DDE7F1; text-align: left; font-size: 14px; transition: background .15s; }
.pf-openBox:hover { background: #D0DEEC; }
.pf-openBoxT { display: grid; gap: 2px; min-width: 0; }
.pf-openBoxT b { font-weight: 600; }
.pf-openBoxT > span:not(.pf-link) { overflow-wrap: anywhere; }
.pf-openPen { color: ${LI.mute}; flex: none; }

/* ── analytics ── */
.pf-anRows { display: grid; gap: 4px; }
@media (min-width: 768px) { .pf-anRows { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
.pf-anRow { display: flex; align-items: flex-start; gap: 8px; padding: 6px 4px; border: 0; background: none; text-align: left; border-radius: 6px; transition: background .15s; }
.pf-anRow:hover { background: ${LI.hover}; }
.pf-anIc { flex: none; color: rgba(0,0,0,.75); }
.pf-anTx { display: grid; gap: 2px; min-width: 0; }
.pf-anTx b { font-size: 16px; font-weight: 600; }
.pf-anRow:hover .pf-anTx b { color: ${LI.blue}; text-decoration: underline; }
.pf-anTx span { font-size: 14px; color: ${LI.mute}; }

/* ── about ── */
.pf-topSkills { display: flex; align-items: center; gap: 12px; width: 100%; margin-top: 16px; padding: 12px 16px; border: 1px solid ${LI.line}; border-radius: 8px; background: #fff; text-align: left; transition: background .15s; }
.pf-topSkills:hover { background: ${LI.hover}; }
.pf-topSkills > span { display: grid; gap: 2px; flex: 1; min-width: 0; font-size: 14px; }
.pf-topSkills b { font-weight: 600; }
.pf-topSkillsIc { color: ${PP.ink}; flex: none; }

/* ── rails ── */
.pf-arrows { display: none; gap: 4px; }
@media (hover: hover) and (min-width: 768px) { .pf-arrows { display: flex; } }
.pf-rail { display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; margin: 0 -16px; padding: 4px 16px 4px; scroll-padding: 0 16px; }
.pf-rail::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .pf-rail { margin: 0 -24px; padding: 4px 24px; scroll-padding: 0 24px; } }
.pf-feat { flex: none; width: 232px; scroll-snap-align: start; display: flex; flex-direction: column; padding: 0; border: 1px solid ${LI.line2}; border-radius: 8px; background: #fff; overflow: hidden; text-align: left; transition: box-shadow .2s, transform .2s; animation: pfRise .5s calc(var(--i) * 60ms) cubic-bezier(.2,1,.3,1) both; }
.pf-feat:hover { box-shadow: 0 6px 18px rgba(0,0,0,.12); transform: translateY(-2px); }
.pf-featKind { padding: 10px 12px 6px; font-size: 12px; color: ${LI.mute}; }
.pf-featPic { width: 100%; aspect-ratio: 4 / 3; }
.pf-featTx { display: grid; gap: 4px; padding: 10px 12px 14px; }
.pf-featTx b { font-size: 14px; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pf-featTx span { font-size: 12px; color: ${LI.mute}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* pills + tabs */
.pf-pills { display: flex; gap: 8px; flex-wrap: wrap; margin: 4px 0 12px; }
.pf-pills button { padding: 5px 14px; border-radius: 99px; border: 0; background: #fff; box-shadow: inset 0 0 0 1px rgba(0,0,0,.6); color: rgba(0,0,0,.75); font-size: 14px; font-weight: 600; transition: background .15s; }
.pf-pills button:hover { background: ${LI.hover}; }
.pf-pills button.is-on { background: ${LI.green}; color: #fff; box-shadow: none; }
.pf-tabs { display: flex; gap: 4px; margin: 0 -16px 8px; padding: 0 16px; border-bottom: 1px solid ${LI.line}; overflow-x: auto; scrollbar-width: none; }
@media (min-width: 768px) { .pf-tabs { margin: 0 -24px 8px; padding: 0 24px; } }
.pf-tabs button { position: relative; flex: none; padding: 12px 8px; border: 0; background: none; font-size: 14px; font-weight: 600; color: ${LI.mute}; }
.pf-tabs button:hover { color: ${PP.ink}; }
.pf-tabs button.is-on { color: ${LI.green}; }
.pf-tabs button.is-on::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: ${LI.green}; animation: pfGrow .25s ease both; }

/* ── posts ── */
.pf-railWrap { position: relative; }
.pf-rail--posts { align-items: flex-start; }
.pf-post { flex: none; width: min(340px, calc(100vw - 56px)); scroll-snap-align: start; border: 1px solid ${LI.line2}; border-radius: 8px; background: #fff; }
.pf-postHead { display: flex; gap: 8px; align-items: flex-start; padding: 12px 12px 0; }
.pf-postWho { display: grid; gap: 0; min-width: 0; font-size: 12px; color: ${LI.mute}; line-height: 1.35; }
.pf-postWho svg { display: inline-block; }
.pf-postWho b { font-size: 14px; color: ${PP.ink}; font-weight: 600; }
.pf-postTx { padding: 8px 12px; }
.pf-postPic { width: 100%; aspect-ratio: 1 / 1; }
.pf-social { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; font-size: 12px; color: ${LI.mute}; }
.pf-reacts { display: flex; align-items: center; gap: 4px; min-width: 0; }
.pf-reacts > span:last-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pf-discs { display: inline-flex; }
.pf-discs > span { margin-left: -4px; border-radius: 50%; box-shadow: 0 0 0 1.5px #fff; }
.pf-discs > span:first-child { margin-left: 0; }
.pf-dimBtn { border: 0; background: none; padding: 0; color: ${LI.mute}; font-size: 12px; white-space: nowrap; }
.pf-dimBtn:hover { color: ${LI.blue}; text-decoration: underline; }
.pf-actsBar { display: flex; margin: 0 8px; padding: 2px 0; border-top: 1px solid ${LI.line}; }
.pf-actsBar > * { flex: 1; }
.pf-likeWrap { position: relative; display: flex; }
.pf-act { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; min-height: 44px; padding: 8px 2px; border: 0; background: none; border-radius: 4px; color: ${LI.mute}; font-size: 13px; font-weight: 600; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; touch-action: manipulation; transition: background .15s; }
.pf-act:hover { background: ${LI.hover}; }
.pf-act.is-love { color: #B24020; }
.pf-popIc { display: inline-grid; animation: pfPopIc .5s cubic-bezier(.2,1.8,.4,1) both; }
.pf-picker { position: absolute; bottom: calc(100% + 4px); left: 0; z-index: 10; display: flex; gap: 2px; padding: 6px; border-radius: 99px; background: #fff; box-shadow: 0 0 0 1px ${LI.line}, 0 10px 28px rgba(0,0,0,.22); animation: pfPicker .22s cubic-bezier(.2,1.3,.4,1) both; }
.pf-pickI { position: relative; border: 0; background: none; padding: 2px; border-radius: 50%; transition: transform .15s cubic-bezier(.2,1.6,.4,1); animation: pfPickI .35s cubic-bezier(.2,1.6,.4,1) both; }
.pf-pickI:hover { transform: translateY(-6px) scale(1.25); }
.pf-pickL { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); padding: 2px 8px; border-radius: 99px; background: rgba(0,0,0,.85); color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .12s; }
.pf-pickI:hover .pf-pickL, .pf-pickI:focus-visible .pf-pickL { opacity: 1; }
.pf-comments { padding: 4px 12px 12px; display: grid; gap: 10px; animation: pfRise .3s ease both; }
.pf-cBox { display: flex; align-items: center; gap: 8px; }
.pf-cBox input { flex: 1; min-width: 0; height: 40px; padding: 0 14px; border-radius: 99px; border: 1px solid ${LI.line2}; font: 400 16px ${PP.font}; outline: none; }
.pf-cBox input:focus { box-shadow: inset 0 0 0 1px ${PP.ink}; }
.pf-cPost { padding: 6px 14px; border-radius: 99px; border: 0; background: ${LI.blue}; color: #fff !important; font-weight: 600; font-size: 14px; }
.pf-c { display: flex; gap: 8px; align-items: flex-start; animation: pfRise .3s ease both; }
.pf-cBubble { flex: 1; min-width: 0; padding: 8px 12px; border-radius: 0 8px 8px 8px; background: #F2F2F2; font-size: 13px; }
.pf-cBubble b { font-weight: 600; font-size: 13px; }
.pf-cBubble p { margin-top: 2px; overflow-wrap: anywhere; }
.pf-railBtn { position: absolute; top: 50%; z-index: 3; width: 32px; height: 32px; margin-top: -16px; border-radius: 50%; border: 0; background: #fff; box-shadow: 0 0 0 1px ${LI.line}, 0 4px 12px rgba(0,0,0,.2); display: none; place-items: center; }
.pf-railBtn.is-l { left: -8px; } .pf-railBtn.is-r { right: -8px; }
@media (hover: hover) and (min-width: 768px) { .pf-railBtn { display: grid; } }
.pf-imgGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.pf-imgCell { aspect-ratio: 1; border-radius: 4px; }
.pf-empty { display: grid; justify-items: center; gap: 4px; padding: 20px 12px 8px; text-align: center; }
.pf-empty > span { font-size: 34px; }
.pf-empty b { font-size: 16px; }
.pf-empty p { color: ${LI.mute}; max-width: 340px; }

/* ── experience + lists ── */
.pf-exp, .pf-rec, .pf-person { display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid ${LI.line}; }
.pf-list > li:first-child { border-top: 0; padding-top: 4px; }
.pf-expBody { flex: 1; min-width: 0; display: grid; gap: 1px; justify-items: start; }
.pf-expBody > .pf-btn { margin-top: 8px; }
.pf-tile { flex: none; display: grid; place-items: center; border-radius: 4px; }
.pf-roles { list-style: none; margin: 8px 0 0; padding: 0; position: relative; width: 100%; }
.pf-role { position: relative; padding: 0 0 14px 20px; display: grid; gap: 1px; }
.pf-role::before { content: ""; position: absolute; left: 3px; top: 16px; bottom: -2px; width: 2px; background: #CFCFCF; }
.pf-role:last-child::before { display: none; }
.pf-dot { position: absolute; left: 0; top: 8px; width: 8px; height: 8px; border-radius: 50%; background: #CFCFCF; }
.pf-bul { margin-top: 6px; width: 100%; }
.pf-skillLine { display: flex; gap: 6px; align-items: flex-start; margin-top: 8px; font-size: 14px; }
.pf-skillLine svg { flex: none; margin-top: 2px; }
.pf-skillLine b { font-weight: 600; }
.pf-cred { gap: 4px; }

/* ── skills ── */
.pf-skill { position: relative; display: grid; gap: 4px; justify-items: start; padding: 12px 0; border-top: 1px solid ${LI.line}; }
.pf-skill .pf-btn { margin-top: 4px; }
.pf-skillMeta { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.pf-endorse.is-on { background: #fff; color: ${LI.green} !important; box-shadow: inset 0 0 0 1px ${LI.green}; }
.pf-flash { position: absolute; inset: 0 -16px; background: ${LI.blueTint}; pointer-events: none; animation: pfFlash .9s ease both; z-index: -1; }
.pf-skills { position: relative; z-index: 0; }

/* ── recommendations ── */
.pf-recLock .pf-lockBox { position: relative; margin-top: 8px; width: 100%; padding: 12px; border-radius: 8px; background: linear-gradient(135deg, #F3F8FD, #FDF1F5); display: grid; gap: 10px; justify-items: start; }
.pf-lockBlur { filter: blur(4px); user-select: none; font-size: 14px; color: ${LI.mute}; }
.pf-langs li { padding: 10px 0; border-top: 1px solid ${LI.line}; }
.pf-langs li:first-child { border-top: 0; }

/* ── right rail ── */
.pf-railSm { padding-bottom: 8px !important; }
.pf-railRow { padding: 4px 0 12px; }
.pf-railRow + .pf-railRow { border-top: 1px solid ${LI.line}; padding-top: 12px; }
.pf-railRow span { display: grid; gap: 2px; font-size: 14px; color: ${LI.mute}; }
.pf-railRow b { font-size: 16px; font-weight: 600; color: ${PP.ink}; }
.pf-ad { text-align: center; display: grid; justify-items: center; gap: 6px; padding-bottom: 20px !important; }
.pf-adTop { width: 100%; display: flex; justify-content: flex-end; gap: 8px; font-size: 12px; color: ${LI.mute}; }
.pf-adLine { font-size: 12px; color: ${LI.mute}; }
.pf-adFaces { display: flex; align-items: center; gap: 10px; margin: 6px 0; }
.pf-adFaces > span:not(.pf-adHeart) { width: 64px !important; height: 64px !important; border-radius: 50% !important; }
.pf-adHeart { font-size: 20px; animation: pfBeat 1.4s ease-in-out infinite; }
.pf-adBig { font-size: 16px; }
.pf-adBig b { font-weight: 600; }
.pf-ad .pf-btn { margin-top: 8px; }
.pf-prem { display: flex !important; align-items: center; gap: 12px; width: 100%; border: 0; text-align: left; padding: 14px 16px !important; }
@media (min-width: 768px) { .pf-prem { padding: 16px 24px !important; } }
.pf-prem > span:last-child { display: grid; gap: 2px; font-size: 14px; color: ${LI.mute}; }
.pf-prem b { color: ${PP.ink}; font-weight: 600; }
.pf-premBadge { width: 24px; height: 24px; border-radius: 4px; background: linear-gradient(135deg, #F8C77E, #E7A33E); color: transparent; flex: none; }
.pf-people .pf-person:first-child { border-top: 0; }
.pf-foot { padding: 16px 12px; text-align: center; font-size: 12px; color: ${LI.mute}; line-height: 1.8; }
.pf-foot span { margin: 0 6px; }
.pf-foot b { display: inline-flex; align-items: center; gap: 4px; color: ${PP.ink}; font-weight: 600; }

/* ── toast ── */
.pf-toast { position: fixed; z-index: 150; left: 8px; right: 8px; bottom: calc(66px + env(safe-area-inset-bottom, 0px)); display: flex; align-items: center; gap: 10px; padding: 12px 12px 12px 16px; border-radius: 8px; background: #fff; box-shadow: 0 0 0 1px ${LI.line}, 0 10px 30px rgba(0,0,0,.22); font-size: 14px; animation: pfToast .32s cubic-bezier(.2,1.2,.4,1) both; }
@media (min-width: 768px) { .pf-toast { left: 24px; right: auto; bottom: 24px; max-width: 400px; } }
.pf-toastIc { flex: none; width: 24px; height: 24px; border-radius: 50%; background: ${LI.green}; color: #fff; display: grid; place-items: center; }
.pf-toast p { flex: 1; min-width: 0; overflow-wrap: anywhere; }

/* ── notifications ── */
.pf-scrim { position: fixed; inset: 0; z-index: 140; background: rgba(0,0,0,.35); animation: pfFade .2s ease both; }
.pf-notifs { position: fixed; z-index: 141; left: 0; right: 0; bottom: 0; max-height: 86dvh; overflow-y: auto; background: #fff; border-radius: 16px 16px 0 0; padding: 12px 0 calc(16px + env(safe-area-inset-bottom, 0px)); animation: pfSheet .32s cubic-bezier(.2,1,.3,1) both; }
.pf-notifs.is-desk { left: auto; bottom: auto; top: 60px; right: max(16px, calc((100vw - 1128px) / 2)); width: 400px; border-radius: 8px; max-height: 76vh; box-shadow: 0 0 0 1px ${LI.line}, 0 14px 40px rgba(0,0,0,.25); animation: pfDrop .2s ease both; }
.pf-notifsH { display: flex; align-items: center; justify-content: space-between; padding: 0 12px 8px 16px; }
.pf-notifsH h2 { font-size: 18px; font-weight: 600; }
.pf-notifs .pf-pills { padding: 0 16px; }
.pf-notifList { list-style: none; margin: 0; padding: 0; }
.pf-notif { position: relative; display: flex; gap: 12px; align-items: flex-start; padding: 12px 16px 12px 22px; border-top: 1px solid ${LI.line}; animation: pfRise .35s ease both; }
.pf-notif.is-new { background: #EAF4FE; }
.pf-notifDot { position: absolute; left: 8px; top: 26px; width: 8px; height: 8px; border-radius: 50%; background: ${LI.blue}; }
.pf-notifIc { flex: none; width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; background: #fff; box-shadow: 0 0 0 1px ${LI.line}; }
.pf-notif p { flex: 1; min-width: 0; font-size: 14px; overflow-wrap: anywhere; }
.pf-notif p b { font-weight: 600; }
.pf-notifAgo { flex: none; font-size: 12px; color: ${LI.mute}; }

/* ── photo viewer ── */
.pf-viewer { position: fixed; inset: 0; z-index: 145; display: grid; place-items: center; padding: 0; animation: pfFade .2s ease both; }
.pf-viewerBg { position: absolute; inset: 0; background: rgba(0,0,0,.9); }
.pf-viewerBox { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; background: #fff; overflow-y: auto; animation: pfZoom .3s cubic-bezier(.2,1,.3,1) both; }
@media (min-width: 900px) { .pf-viewerBox { width: min(1100px, 92vw); height: min(680px, 88vh); flex-direction: row; border-radius: 8px; overflow: hidden; } }
.pf-viewerPicW { position: relative; flex: none; background: #000; aspect-ratio: 1; }
@media (min-width: 900px) { .pf-viewerPicW { flex: 1; aspect-ratio: auto; } }
.pf-viewerPic { position: absolute !important; inset: 0; background: #000; }
.pf-viewerNav { position: absolute; top: 50%; margin-top: -20px; width: 40px; height: 40px; border-radius: 50%; border: 0; background: rgba(0,0,0,.55); color: #fff !important; display: grid; place-items: center; }
.pf-viewerNav.is-l { left: 12px; } .pf-viewerNav.is-r { right: 12px; }
.pf-viewerCount { position: absolute; left: 12px; bottom: 12px; padding: 2px 8px; border-radius: 99px; background: rgba(0,0,0,.6); color: #fff; font-size: 12px; }
.pf-viewerSide { padding: 12px 16px 24px; display: grid; gap: 10px; align-content: start; }
@media (min-width: 900px) { .pf-viewerSide { width: 360px; flex: none; overflow-y: auto; padding: 16px 20px; } }
.pf-viewerSide .pf-postHead { padding: 0; }
.pf-viewerCap { font-size: 20px; font-weight: 600; }
.pf-viewerNote { font-size: 16px; line-height: 1.55; white-space: pre-line; overflow-wrap: anywhere; }
.pf-viewerActs { display: flex; border-top: 1px solid ${LI.line}; padding-top: 4px; }
.pf-viewerX { position: absolute; top: 10px; right: 10px; z-index: 3; width: 40px; height: 40px; border-radius: 50%; border: 0; background: rgba(0,0,0,.6); color: #fff !important; display: grid; place-items: center; }

/* ── skeleton ── */
.pf-skel { background: #fff; padding: 16px; display: grid; gap: 12px; }
@media (min-width: 768px) { .pf-skel { border-radius: 8px; box-shadow: 0 0 0 1px rgba(140,140,140,.2); padding: 24px; } }
.pf-skel i { display: block; height: 14px; border-radius: 6px; background: linear-gradient(90deg, #EEE 0%, #F6F6F6 40%, #EEE 80%); background-size: 200% 100%; animation: pfShim 1.1s linear infinite; }
.pf-skelCover { height: 110px !important; border-radius: 0 !important; margin: -16px -16px 0; }
@media (min-width: 768px) { .pf-skelCover { height: 180px !important; margin: -24px -24px 0; } }
.pf-skelDot { width: 104px; height: 104px !important; border-radius: 50% !important; margin-top: -60px; box-shadow: 0 0 0 4px #fff; }

/* ── the letter, dressed as a message notification ── */
.lpDock--profile .lpFab { border-radius: 50%; width: 56px; height: 56px; background: ${LI.blue}; box-shadow: 0 10px 24px -8px rgba(10,102,194,.7), 0 0 0 3px #fff; }
.lpDock--profile .lpBadge { background: #CB112D; }
.lpDock--profile .lpBanner { font-family: ${PP.font}; border-radius: 8px; box-shadow: 0 0 0 1px ${LI.line}, 0 12px 30px -8px rgba(0,0,0,.3); }
.lpDock--profile .lpBanIc { border-radius: 50%; font-size: 0 !important; background: linear-gradient(135deg, ${LI.blue}, ${LI.pink}) !important; position: relative; }
.lpDock--profile .lpBanIc::after { content: "♥"; position: absolute; inset: 0; display: grid; place-items: center; font-size: 15px; color: #fff; }
.lpDock--profile .lpBanTop b { color: ${PP.ink}; }

@keyframes pfRise { from { opacity: 0; transform: translateY(10px); } }
@keyframes pfPop { from { opacity: 0; transform: scale(.7); } }
@keyframes pfDrop { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
@keyframes pfFade { from { opacity: 0; } }
@keyframes pfSheet { from { transform: translateY(100%); } }
@keyframes pfZoom { from { opacity: 0; transform: scale(.96); } }
@keyframes pfToast { from { opacity: 0; transform: translateY(16px) scale(.96); } }
@keyframes pfBadge { from { transform: scale(0); } }
@keyframes pfGrow { from { transform: scaleX(0); } }
@keyframes pfPicker { from { opacity: 0; transform: translateY(8px) scale(.9); } }
@keyframes pfPickI { from { opacity: 0; transform: translateY(12px) scale(.5); } }
@keyframes pfPopIc { 0% { transform: scale(.4) rotate(-20deg); } 60% { transform: scale(1.35) rotate(8deg); } 100% { transform: none; } }
@keyframes pfFlash { from { opacity: 1; } to { opacity: 0; } }
@keyframes pfBeat { 0%,100% { transform: scale(1); } 20% { transform: scale(1.25); } 40% { transform: scale(1); } }
@keyframes pfShim { to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) {
  .pf-root *, .pf-root *::before, .pf-root *::after { animation: none !important; transition: none !important; }
}
`;
