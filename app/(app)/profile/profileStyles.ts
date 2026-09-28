import { BRAND } from "@/lib/brand";

/**
 * The profile page's look, in one string so the page file stays about
 * behaviour. Same family as the feedback wall: one maroon hero, warm paper
 * cards, a sliding pill switcher, rise-in stagger. Every class is `pf`-prefixed
 * so nothing leaks into the shared components rendered inside it.
 */
export const PROFILE_CSS = `
.pfWrap {
  max-width: 1120px; margin: 0 auto; padding: 10px 12px 120px;
  display: flex; flex-direction: column; gap: 14px; min-width: 0;
}
@media (min-width: 768px) { .pfWrap { padding: 92px 24px 56px; gap: 18px } }
.pfWrapGate { max-width: 640px; padding-top: 24px }
@media (min-width: 768px) { .pfWrapGate { padding-top: 120px } }

/* ── The maroon hero ───────────────────────────────────────────── */
.pfHero {
  position: relative; overflow: hidden; isolation: isolate;
  padding: 18px 16px 16px; border-radius: 24px;
  color: #f5ede6;
  background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
  box-shadow: ${BRAND.shadowElevated};
  animation: pfRise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@media (min-width: 600px) { .pfHero { padding: 24px 24px 20px } }
@media (min-width: 960px) {
  .pfHero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: center; gap: 28px; padding: 28px 30px }
}
.pfShine {
  position: absolute; top: -60px; bottom: -60px; left: 0; width: 80px; pointer-events: none; z-index: 0;
  background: linear-gradient(90deg, transparent, rgba(255,236,190,0.14), transparent);
  animation: pfShineMove 6.5s ease-in-out infinite;
}
@keyframes pfShineMove { from { transform: translateX(-160%) rotate(12deg) } to { transform: translateX(1600%) rotate(12deg) } }
.pfOrb {
  position: absolute; right: -90px; top: -110px; width: 320px; height: 320px; border-radius: 50%; pointer-events: none; z-index: 0;
  background: radial-gradient(circle, rgba(201,168,76,0.26), transparent 65%);
}
.pfSpark { position: absolute; color: #ffe3a3; opacity: 0.5; pointer-events: none; z-index: 0; animation: pfFloat 5s ease-in-out infinite }
.pfSpark.s1 { top: 14px; right: 18px; font-size: 14px }
.pfSpark.s2 { bottom: 14px; left: 48%; font-size: 12px; color: #ffb3c4; animation-delay: 1.2s }
.pfSpark.s3 { top: 52%; left: 8px; font-size: 10px; animation-delay: 2.4s }
@keyframes pfFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }

.pfHeroMain {
  position: relative; z-index: 1; min-width: 0;
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px 13px;
}
.pfAvatarWrap { position: relative; flex: none; animation: pfPop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) 120ms both }
.pfAvatar {
  width: 58px; height: 58px; border-radius: 50%; object-fit: cover; display: block;
  box-shadow: 0 0 0 3px #3d0c11, 0 0 0 5px ${BRAND.gold}, 0 10px 30px -6px rgba(255,210,120,0.45);
}
@media (min-width: 600px) { .pfAvatar { width: 70px; height: 70px } }
.pfAvatarInit {
  display: grid; place-items: center;
  background: linear-gradient(135deg, #ffe3a3, ${BRAND.gold} 55%, ${BRAND.goldDeep});
  color: #3d0c11; font-family: 'Playfair Display', Georgia, serif; font-weight: 800; font-size: 24px;
}
@media (min-width: 600px) { .pfAvatarInit { font-size: 30px } }
.pfAvatarBadge {
  position: absolute; right: -2px; bottom: -2px; width: 24px; height: 24px; border-radius: 50%;
  display: grid; place-items: center; background: #fff; color: #3d0c11;
  box-shadow: 0 0 0 2px #3d0c11, 0 4px 10px rgba(0,0,0,0.3);
}
@keyframes pfPop { from { opacity: 0; transform: scale(0.6) rotate(-10deg) } to { opacity: 1; transform: none } }

.pfWho { min-width: 0 }
.pfKicker {
  margin: 0 0 3px; font-size: 9.5px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; color: #ffe3a3; opacity: 0.85;
}
.pfNameRow { display: flex; align-items: center; gap: 8px; min-width: 0 }
.pfName {
  margin: 0; min-width: 0; overflow-wrap: anywhere;
  font-family: 'Playfair Display', Georgia, serif; font-weight: 800; letter-spacing: -0.01em;
  font-size: clamp(21px, 5.4vw, 30px); line-height: 1.1; color: #fff6e6;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pfNameEdit { display: flex; align-items: center; gap: 6px; min-width: 0 }
.pfNameInput {
  flex: 1; min-width: 0; height: 38px; padding: 0 12px; border-radius: 12px;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,227,163,0.45); color: #fff6e6;
  font: inherit; font-size: 16px; font-weight: 700; outline: none;
}
.pfNameInput:focus { border-color: #ffe3a3; box-shadow: 0 0 0 3px rgba(255,227,163,0.18) }
.pfRound {
  flex: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; border: none; cursor: pointer;
  transition: transform 160ms ease, background 160ms ease;
}
.pfRound.sm { width: 28px; height: 28px }
.pfRound.gold { background: linear-gradient(135deg, #ffe3a3, ${BRAND.gold}); color: #3d0c11 }
.pfRound.glass { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,236,190,0.2); color: #ffe3a3 }
.pfRound:hover { transform: scale(1.08) }
.pfRound:disabled { opacity: 0.6 }

/* The meta row spans the whole hero under avatar + name, so the chips line
   up with the avatar's left edge instead of hanging in a narrow column. */
.pfMeta { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px; min-width: 0 }
.pfMetaItem.wide { flex: 1 1 100% }
@media (min-width: 520px) { .pfMetaItem.wide { flex: 0 1 auto } }
.pfMetaItem b { color: #ffe3a3; font-weight: 800 }
.pfMetaItem {
  display: inline-flex; align-items: center; gap: 5px; min-width: 0; max-width: 100%;
  padding: 4px 10px 4px 8px; border-radius: 999px; font-size: 11.5px; font-weight: 600;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,236,190,0.16); color: #f5e6d6;
}
.pfMetaItem svg { flex: none; color: #ffe3a3 }
.pfMetaItem.gold { color: #ffe3a3; border-color: rgba(255,227,163,0.35); background: rgba(255,227,163,0.1); font-weight: 800 }
.pfMetaTx { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }

.pfLogout {
  display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 10px; border-radius: 999px; cursor: pointer;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,236,190,0.18); color: #f5e6d6;
  font-size: 12px; font-weight: 700; white-space: nowrap; transition: background 160ms ease, color 160ms ease;
}
.pfLogout { width: 36px; padding: 0; justify-content: center; align-self: start }
.pfLogout:hover { background: rgba(255,120,120,0.16); color: #fff }
.pfLogout:disabled { opacity: 0.6 }


/* Stats: glass tiles on maroon. */
.pfStats {
  position: relative; z-index: 1; margin-top: 16px;
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;
}
@media (min-width: 600px) { .pfStats { grid-template-columns: repeat(4, minmax(0, 1fr)) } }
@media (min-width: 960px) { .pfStats { margin-top: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px } }
.pfStat {
  position: relative; min-width: 0; padding: 11px 12px 10px; border-radius: 16px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,236,190,0.16);
  backdrop-filter: blur(6px);
  animation: pfRise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: transform 200ms ease, background 200ms ease, border-color 200ms ease;
}
.pfStat:hover { transform: translateY(-2px); background: rgba(255,255,255,0.09); border-color: rgba(255,227,163,0.34) }
.pfStatIc {
  position: absolute; top: 10px; right: 10px; width: 26px; height: 26px; border-radius: 9px;
  display: grid; place-items: center; color: #ffe3a3; background: rgba(255,227,163,0.12);
}
.pfStatNum {
  margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; line-height: 1; font-weight: 800;
  color: #ffe3a3; text-shadow: 0 6px 24px rgba(255,210,120,0.3); font-variant-numeric: tabular-nums;
}
@media (min-width: 600px) { .pfStatNum { font-size: 30px } }
.pfStatLabel { margin: 5px 0 0; font-size: 10.5px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #fff6e6 }
.pfStatSub { margin: 2px 0 0; font-size: 11px; color: rgba(255,236,210,0.66); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }

/* ── Signed-out gate ────────────────────────────────────────────── */
.pfGate { text-align: center; padding: 34px 20px 28px; display: block }
@media (min-width: 600px) { .pfGate { padding: 46px 40px 38px } }
.pfGate > *:not(.pfShine):not(.pfOrb):not(.pfSpark) { position: relative; z-index: 1 }
.pfGateIc {
  width: 64px; height: 64px; margin: 0 auto 14px; border-radius: 20px; display: grid; place-items: center;
  color: #3d0c11; background: linear-gradient(135deg, #ffe3a3, ${BRAND.gold});
  box-shadow: 0 12px 30px -8px rgba(255,210,120,0.55);
  animation: pfPop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms both;
}
.pfGateTitle {
  margin: 0; font-family: 'Playfair Display', Georgia, serif; font-weight: 800; letter-spacing: -0.02em;
  font-size: clamp(32px, 8vw, 52px); line-height: 1.02; color: #fff6e6;
}
.pfGateTitle em { font-style: italic; color: #ffe3a3 }
.pfLead { margin: 12px auto 0; max-width: 44ch; font-size: 14.5px; line-height: 1.6; color: rgba(255,236,210,0.82) }
.pfGateList { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 18px 0 22px; padding: 0 }
.pfGateList li {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px 5px 9px; border-radius: 999px;
  font-size: 12px; font-weight: 700; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,236,190,0.16); color: #f5e6d6;
}
.pfGateList li svg { color: #ffe3a3 }
.pfBtnGold {
  display: inline-flex; align-items: center; gap: 8px; padding: 13px 30px; border-radius: 999px; border: none; cursor: pointer;
  font-size: 14.5px; font-weight: 800; color: #3d0c11;
  background: linear-gradient(135deg, #fff1c9, #ffe3a3 30%, ${BRAND.gold});
  box-shadow: 0 14px 30px -12px rgba(255,210,120,0.7);
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.pfBtnGold:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 18px 36px -12px rgba(255,210,120,0.85) }

/* ── Sliding-pill section switcher ─────────────────────────────── */
.pfTabs {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 5px;
  border-radius: 18px; background: linear-gradient(180deg, #fffdfb, #fff6ee);
  border: 1px solid ${BRAND.border}; box-shadow: 0 8px 22px -16px rgba(61,12,17,0.45);
  animation: pfRise 600ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
  scroll-margin-top: 100px;
}
@media (min-width: 720px) { .pfTabs { grid-template-columns: repeat(6, minmax(0, 1fr)); border-radius: 999px } }
.pfTabs button {
  position: relative; min-width: 0; height: 40px; padding: 0 6px; border: none; background: none; cursor: pointer;
  border-radius: 13px; color: ${BRAND.muted}; font: inherit; font-size: 12.5px; font-weight: 700;
  transition: color 180ms ease;
}
@media (min-width: 720px) { .pfTabs button { border-radius: 999px; font-size: 13px } }
.pfTabs button:hover:not(.is-on) { color: ${BRAND.text} }
.pfTabs button.is-on { color: #fff6e6 }
.pfTabs button:focus-visible { outline: 2px solid ${BRAND.gold}; outline-offset: 2px }
.pfTabPill {
  position: absolute; inset: 0; border-radius: inherit; z-index: 0;
  background: ${BRAND.gradient}; box-shadow: 0 8px 18px -8px rgba(61,12,17,0.75);
}
.pfTabIn { position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; max-width: 100%; min-width: 0 }
.pfTabIn svg { flex: none }
.pfTabs button.is-on .pfTabIn svg { color: #ffe3a3 }
.pfTabLabel { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.pfTabIn b {
  flex: none; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 99px; display: inline-grid; place-items: center;
  font-size: 10.5px; font-weight: 800; background: rgba(61,12,17,0.08); color: ${BRAND.accentStrong};
}
.pfTabs button.is-on .pfTabIn b { background: rgba(255,227,163,0.2); color: #ffe3a3 }
/* On a phone the 3-across tabs are too narrow for "My Pages" plus a count;
   the count is in the hero already, so it goes first. */
@media (max-width: 479px) { .pfTabIn b { display: none } }
@media (max-width: 380px) { .pfTabIn b { display: none } }

.pfPanel { min-width: 0 }

/* ── Paper cards ───────────────────────────────────────────────── */
.pfCard {
  position: relative; min-width: 0; overflow: hidden; border-radius: 20px;
  background: linear-gradient(180deg, #fffdfb, #fff6ee);
  border: 1px solid ${BRAND.border}; box-shadow: 0 14px 30px -24px rgba(61,12,17,0.55);
  animation: pfRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.pfNarrow { max-width: 720px; width: 100%; margin: 0 auto }
.pfNarrow.wide { max-width: 860px }

.pfHead { display: flex; align-items: center; gap: 11px; padding: 14px 16px; min-width: 0 }
.pfCard > .pfHead { border-bottom: 1px dashed ${BRAND.border} }
.pfCard > .pfHeadBtn[aria-expanded="false"] { border-bottom-color: transparent }
.pfHeadBtn { width: 100%; border: none; background: none; cursor: pointer; text-align: left; font: inherit; color: inherit }
.pfHeadBtn:hover .pfHeadIc { transform: rotate(-6deg) scale(1.06) }
.pfHeadIc {
  flex: none; width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center;
  color: #ffe3a3; background: ${BRAND.gradient}; box-shadow: 0 6px 14px -6px rgba(61,12,17,0.6);
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pfHeadTx { flex: 1; min-width: 0; display: block }
.pfHeadTx h2, .pfHeadTx .h { display: block; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 800; color: ${BRAND.text}; line-height: 1.2 }
.pfHeadTx p, .pfHeadTx .s { display: block; margin: 2px 0 0; font-size: 12.5px; color: ${BRAND.muted}; line-height: 1.4 }
.pfGoldTx { color: ${BRAND.accent} }
.pfChev { flex: none; color: ${BRAND.faint}; transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1) }
.pfChev.is-open { transform: rotate(180deg) }

.pfBody { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 11px; min-width: 0 }
.pfTinyLabel { display: block; font-size: 10px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: ${BRAND.faint} }
.pfTinyLabel.gold { color: ${BRAND.accent} }
.pfTinyLabel.onDark { color: rgba(255,227,163,0.75) }
.pfNote { margin: 0; font-size: 11.5px; color: ${BRAND.faint}; text-align: center }
.pfNote.left { text-align: left }
.pfFormTitle { margin: 0; font-size: 14px; font-weight: 800; color: ${BRAND.text} }

/* Handle */
.pfHandleRow { display: flex; align-items: center; gap: 10px; min-width: 0 }
.pfHandle { flex: 1; min-width: 0 }
.pfHandleName {
  display: block; overflow-wrap: anywhere; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 800;
  background: linear-gradient(90deg, #3d0c11, ${BRAND.goldDeep}); -webkit-background-clip: text; background-clip: text; color: transparent;
}
.pfUrlBox { padding: 10px 12px; border-radius: 14px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.24); min-width: 0 }
.pfUrlBox.soft { background: #fff; border-color: ${BRAND.border} }
.pfUrlRow { display: flex; align-items: center; gap: 8px; min-width: 0; margin-top: 4px; color: ${BRAND.accent} }
.pfUrlRow.boxed { margin: 0; padding: 8px 8px 8px 12px; border-radius: 14px; background: #fff; border: 1px solid ${BRAND.border} }
.pfUrlRow.boxed.gold { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.24) }
.pfMono {
  flex: 1; min-width: 0; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px;
  color: ${BRAND.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pfMono b { color: ${BRAND.accent}; font-weight: 800 }
.pfMono i { font-style: normal; color: ${BRAND.faint} }
.pfMono.strong { color: ${BRAND.text}; font-weight: 700; font-size: 12.5px }
.pfIconBtn {
  flex: none; width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; cursor: pointer;
  background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2); color: ${BRAND.accent};
  transition: transform 160ms ease, background 160ms ease, color 160ms ease;
}
.pfIconBtn:hover { transform: translateY(-1px); background: rgba(201,168,76,0.18) }
.pfIconBtn.is-done { background: rgba(58,167,109,0.12); border-color: rgba(58,167,109,0.3); color: ${BRAND.ok} }

.pfClaim {
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 16px; border: none; background: none; cursor: pointer; text-align: left; font: inherit;
  transition: background 180ms ease;
}
.pfClaim:hover { background: rgba(201,168,76,0.06) }
.pfClaimIc { flex: none; width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; color: ${BRAND.accent}; background: rgba(201,168,76,0.14) }
.pfClaimTx { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px }
.pfClaimTx b { font-size: 14px; color: ${BRAND.text} }
.pfClaimTx span { font-size: 12px; color: ${BRAND.faint} }
.pfClaimTx em { font-style: normal; color: ${BRAND.accent}; font-weight: 700 }
.pfClaimPill { flex: none; padding: 6px 13px; border-radius: 999px; font-size: 12px; font-weight: 800; color: #fff6e6; background: ${BRAND.gradient} }

/* Inputs */
.pfField { position: relative; min-width: 0 }
.pfInput {
  width: 100%; height: 46px; padding: 0 14px; border-radius: 14px; outline: none;
  background: #fff; border: 1px solid ${BRAND.borderStrong}; color: ${BRAND.text};
  font: inherit; font-size: 15px;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.pfInput::placeholder { color: ${BRAND.faint} }
.pfInput:focus { border-color: ${BRAND.gold}; box-shadow: 0 0 0 4px rgba(201,168,76,0.18) }
.pfInputPre { padding-left: 32px }
.pfInputPost { padding-right: 44px }
.pfMonoInput { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14.5px }
.pfFieldPre { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-weight: 800; color: ${BRAND.accent}; pointer-events: none }
.pfFieldPost {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center; border: none; background: none; cursor: pointer; color: ${BRAND.faint};
}
.pfFieldPost:hover { color: ${BRAND.text}; background: rgba(61,12,17,0.05) }
.pfStatusMsg {
  display: flex; align-items: center; gap: 7px; margin: 0; padding: 8px 11px; border-radius: 11px; font-size: 12px; font-weight: 600;
  overflow-wrap: anywhere;
}
.pfStatusMsg.ok { background: rgba(58,167,109,0.1); color: #237a4c }
.pfStatusMsg.bad { background: rgba(161,53,64,0.08); color: ${BRAND.danger} }
.pfStatusMsg.wait { background: rgba(61,12,17,0.04); color: ${BRAND.muted} }
.pfStatusMsg.warn { background: rgba(168,130,58,0.1); color: #8a6420 }

/* Buttons */
.pfBtnRow { display: flex; gap: 8px; min-width: 0 }
.pfBtn, .pfBtnGhost, .pfBtnDanger {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 44px; padding: 0 18px;
  border-radius: 14px; cursor: pointer; font: inherit; font-size: 13.5px; font-weight: 800; white-space: nowrap;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease, background 160ms ease;
}
.pfBtn { border: none; color: #fff6e6; background: ${BRAND.gradient}; box-shadow: 0 12px 24px -14px rgba(61,12,17,0.8) }
.pfBtn svg { color: #ffe3a3 }
.pfBtn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 28px -14px rgba(61,12,17,0.9) }
.pfBtn.sm { height: 36px; padding: 0 13px; border-radius: 999px; font-size: 12.5px; flex: none }
@media (max-width: 420px) { .pfBtn.sm span { display: none } .pfBtn.sm { width: 36px; padding: 0 } }
.pfBtn.full { width: 100% }
.pfBtnGhost { background: #fff; color: ${BRAND.muted}; border: 1px solid ${BRAND.borderStrong} }
.pfBtnGhost:hover:not(:disabled) { color: ${BRAND.text}; border-color: rgba(201,168,76,0.6) }
.pfBtnGhost.sm { height: 34px; padding: 0 12px; border-radius: 999px; font-size: 12px; flex: none }
.pfBtnDanger { border: none; color: #fff; background: linear-gradient(135deg, #b3303c, #7f1d27); box-shadow: 0 10px 20px -12px rgba(127,29,39,0.8) }
.pfBtnDanger:hover:not(:disabled) { transform: translateY(-1px) }
.pfBtn:disabled, .pfBtnGhost:disabled, .pfBtnDanger:disabled { opacity: 0.45; cursor: not-allowed }
.grow { flex: 1; min-width: 0 }

/* Rows */
.pfRows { display: flex; flex-direction: column }
.pfRow { display: flex; align-items: center; gap: 11px; padding: 11px 16px; min-width: 0 }
.pfRow + .pfRow { border-top: 1px solid rgba(61,12,17,0.06) }
.pfRowIc { flex: none; width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; color: ${BRAND.accent}; background: rgba(201,168,76,0.12) }
.pfRowIc.up { color: ${BRAND.ok}; background: rgba(58,167,109,0.12) }
.pfRowIc.down { color: ${BRAND.danger}; background: rgba(161,53,64,0.1) }
.pfRowTx { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px }
.pfRowTx b { font-size: 13px; color: ${BRAND.text}; font-weight: 700 }
.pfRowTx span { font-size: 12px; color: ${BRAND.muted}; overflow-wrap: anywhere }
.pfRowTx .cap { text-transform: capitalize }
.pfDelta { flex: none; margin: 0; font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums }
.pfDelta.up { color: ${BRAND.ok} }
.pfDelta.down { color: ${BRAND.danger} }

.pfAccountGrid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start }
@media (min-width: 860px) { .pfAccountGrid { grid-template-columns: repeat(2, minmax(0, 1fr)) } }

/* ── Page cards ────────────────────────────────────────────────── */
.pfPanelBar { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px }
.pfPanelBar .pfHead, .pfPanel > div > .pfHead { padding: 2px 2px }
.pfPanel > div > .pfHead { margin-bottom: 12px }
.pfSeg {
  align-self: flex-start; display: inline-flex; gap: 2px; padding: 4px; border-radius: 999px;
  background: rgba(61,12,17,0.05); border: 1px solid ${BRAND.border};
}
.pfSeg button {
  position: relative; height: 32px; padding: 0 14px; border: none; background: none; cursor: pointer; border-radius: 999px;
  font: inherit; font-size: 12.5px; font-weight: 700; color: ${BRAND.muted};
}
.pfSeg button.is-on { color: #fff6e6 }
.pfSegPill { position: absolute; inset: 0; border-radius: 999px; background: ${BRAND.gradient}; box-shadow: 0 6px 14px -6px rgba(61,12,17,0.7) }
.pfSegLabel { position: relative; z-index: 1 }
.pfSegLabel b { font-weight: 800; opacity: 0.7; margin-left: 2px }

.pfGrid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; align-items: start }
@media (min-width: 820px) { .pfGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px } }

.pfPage {
  position: relative; min-width: 0; overflow: hidden; border-radius: 20px;
  background: linear-gradient(180deg, #fffdfb, #fff6ee);
  border: 1px solid ${BRAND.border}; box-shadow: 0 14px 28px -24px rgba(61,12,17,0.6);
  animation: pfRise 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease, border-color 260ms ease;
}
/* Maroon→gold hairline that draws in on hover. */
.pfPage::before {
  content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; z-index: 2;
  background: linear-gradient(90deg, #3d0c11, ${BRAND.gold}, #ffe3a3);
  transform: scaleX(0); transform-origin: left; transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
/* Sheen sweep. */
.pfPage::after {
  content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; pointer-events: none; z-index: 0;
  background: linear-gradient(100deg, transparent, rgba(255,236,190,0.45), transparent); transform: skewX(-14deg); opacity: 0;
}
.pfPage.is-open { border-color: rgba(201,168,76,0.5) }
.pfPage.is-open::before { transform: scaleX(1) }
@media (hover: hover) {
  .pfPage:hover { transform: translateY(-3px); border-color: rgba(201,168,76,0.55); box-shadow: 0 22px 38px -22px rgba(61,12,17,0.55) }
  .pfPage:hover::before { transform: scaleX(1) }
  .pfPage:hover::after { opacity: 1; left: 130%; transition: left 800ms ease, opacity 200ms ease }
  .pfPage:hover .pfEmoji { transform: scale(1.08) rotate(-6deg) }
}
.pfPage > * { position: relative; z-index: 1 }

.pfPageTop { display: flex; align-items: center; gap: 12px; padding: 14px 14px 8px; cursor: pointer; min-width: 0; outline: none }
.pfPageTop:focus-visible { box-shadow: inset 0 0 0 2px ${BRAND.gold}; border-radius: 20px }
.pfPageTopBtn { width: 100%; border: none; background: none; text-align: left; font: inherit; color: inherit; padding-bottom: 14px }
.pfEmoji {
  flex: none; width: 46px; height: 46px; border-radius: 15px; display: grid; place-items: center; font-size: 22px;
  background: linear-gradient(135deg, #fff3d6, #f7e2c4); border: 1px solid rgba(201,168,76,0.3);
  box-shadow: inset 0 1px 0 #fff, 0 6px 14px -8px rgba(168,130,58,0.6);
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pfPageTx { flex: 1; min-width: 0; display: block }
.pfPageTx h3, .pfPageTx .h { display: block;
  margin: 0; font-size: 15px; font-weight: 800; color: ${BRAND.text}; line-height: 1.25;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pfPageTx p, .pfPageTx .s { display: block; margin: 3px 0 0; font-size: 12px; color: ${BRAND.faint}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.pfStatus {
  flex: none; display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.02em;
}
.pfStatus.is-live { color: #1f7a48; background: rgba(58,167,109,0.12); border: 1px solid rgba(58,167,109,0.28) }
.pfStatus.is-live i { width: 7px; height: 7px; border-radius: 50%; background: #3aa76d; animation: pfPulse 2200ms ease-out infinite }
.pfStatus.is-draft { color: #8a6420; background: rgba(201,168,76,0.14); border: 1px dashed rgba(168,130,58,0.45) }
@keyframes pfPulse {
  0% { box-shadow: 0 0 0 0 rgba(58,167,109,0.55) }
  70% { box-shadow: 0 0 0 6px rgba(58,167,109,0) }
  100% { box-shadow: 0 0 0 0 rgba(58,167,109,0) }
}
.pfPageStats { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 10px 72px }
.pfPageStats span {
  display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 700; color: ${BRAND.muted}; background: rgba(61,12,17,0.04);
}
.pfPageStats svg { color: ${BRAND.accent} }
.pfActions {
  display: flex; align-items: center; gap: 6px; padding: 10px 12px 12px; border-top: 1px dashed ${BRAND.border}; min-width: 0;
}
.pfActGap { flex: 1 }
.pfAct {
  flex: none; height: 34px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;
  border-radius: 11px; font: inherit; font-size: 12.5px; font-weight: 800;
  background: #fff; border: 1px solid ${BRAND.border}; color: ${BRAND.muted};
  transition: transform 160ms ease, background 160ms ease, color 160ms ease, border-color 160ms ease;
}
.pfAct:hover { transform: translateY(-1px); color: ${BRAND.text}; border-color: rgba(201,168,76,0.55) }
.pfAct.ic { width: 34px }
.pfAct.main { padding: 0 13px; border: none; color: #fff6e6; background: ${BRAND.gradient}; box-shadow: 0 8px 16px -10px rgba(61,12,17,0.8) }
.pfAct.main svg { color: #ffe3a3 }
.pfAct.main:hover { color: #fff }
.pfAct.main.is-locked { background: linear-gradient(135deg, #ffe3a3, ${BRAND.gold}); color: #3d0c11 }
.pfAct.main.is-locked svg { color: #3d0c11 }
.pfAct.is-on { background: rgba(201,168,76,0.14); border-color: rgba(201,168,76,0.5); color: ${BRAND.accent} }
.pfAct.is-done { color: ${BRAND.ok}; border-color: rgba(58,167,109,0.4); background: rgba(58,167,109,0.08) }
.pfAct.danger { color: ${BRAND.danger} }
.pfAct.danger:hover { background: rgba(161,53,64,0.07); border-color: rgba(161,53,64,0.35); color: ${BRAND.danger} }
@media (max-width: 360px) { .pfActions { gap: 4px } .pfAct.ic { width: 31px } }

.pfPageMore { padding: 12px 12px 14px; display: flex; flex-direction: column; gap: 10px; border-top: 1px dashed ${BRAND.border}; background: rgba(255,255,255,0.5) }
.pfDanger { padding: 12px; border-radius: 14px; background: rgba(161,53,64,0.06); border: 1px solid rgba(161,53,64,0.22); display: flex; flex-direction: column; gap: 10px }
.pfDangerHead { display: flex; gap: 9px; align-items: flex-start; color: ${BRAND.danger} }
.pfDangerTitle { margin: 0; font-size: 13.5px; font-weight: 800; color: ${BRAND.danger} }
.pfDangerTx { margin: 3px 0 0; font-size: 12px; line-height: 1.55; color: ${BRAND.muted} }
.pfDangerTx b { color: ${BRAND.danger} }
.pfDanger .pfBtnGhost, .pfDanger .pfBtnDanger { height: 40px; font-size: 13px }

.pfSender { flex: none; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 2px #fffdfb, 0 0 0 3.5px rgba(201,168,76,0.55) }
.pfSenderInit { display: grid; place-items: center; font-size: 13px; font-weight: 800; color: #ffe3a3; background: ${BRAND.gradient} }
.pfLockBadge { flex: none; width: 26px; height: 26px; border-radius: 9px; display: grid; place-items: center; color: #8a6420; background: rgba(201,168,76,0.16) }
.pfLockBadge.is-ok { color: ${BRAND.ok}; background: rgba(58,167,109,0.12) }

/* ── Points & referrals ────────────────────────────────────────── */
.pfReferGrid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start }
@media (min-width: 900px) { .pfReferGrid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr) } }
.pfReferMain { display: flex; flex-direction: column; gap: 14px; min-width: 0 }
.pfPoints {
  position: relative; overflow: hidden; padding: 18px; border-radius: 20px; color: #f5ede6;
  background: radial-gradient(120% 140% at 100% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
  border: 1px solid rgba(255,227,163,0.22); box-shadow: 0 18px 36px -22px rgba(26,5,7,0.7);
  animation: pfRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.pfPoints > *:not(.pfShine) { position: relative; z-index: 1 }
.pfPointsTop { display: flex; align-items: center; justify-content: space-between; gap: 12px }
.pfPointsNum {
  margin: 4px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: 46px; line-height: 1; font-weight: 800;
  color: #ffe3a3; text-shadow: 0 6px 24px rgba(255,210,120,0.35); font-variant-numeric: tabular-nums;
}
.pfPointsNum small { font-family: Inter, sans-serif; font-size: 14px; font-weight: 700; margin-left: 6px; color: rgba(255,227,163,0.65) }
.pfPointsIc {
  flex: none; width: 54px; height: 54px; border-radius: 18px; display: grid; place-items: center; color: #3d0c11;
  background: linear-gradient(135deg, #ffe3a3, ${BRAND.gold}); box-shadow: 0 10px 24px -8px rgba(255,210,120,0.6);
  animation: pfFloat 4.5s ease-in-out infinite;
}
.pfPointsFoot {
  display: flex; align-items: center; gap: 6px; margin: 14px 0 0; padding-top: 11px;
  border-top: 1px solid rgba(255,236,190,0.16); font-size: 12px; color: rgba(255,236,210,0.72);
}
.pfPointsFoot svg { color: #ffe3a3 }
.pfPointsFoot b { color: #ffe3a3 }
.pfCode {
  display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 14px;
  background: repeating-linear-gradient(135deg, rgba(201,168,76,0.08) 0 8px, rgba(201,168,76,0.03) 8px 16px);
  border: 1px dashed rgba(168,130,58,0.5);
}
.pfCodeVal { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 16px; font-weight: 800; letter-spacing: 0.24em; color: ${BRAND.accentStrong}; overflow-wrap: anywhere; text-align: right }
.pfMiniStats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px dashed ${BRAND.border} }
.pfMiniStats > div { padding: 12px; text-align: center }
.pfMiniStats > div + div { border-left: 1px dashed ${BRAND.border} }
.pfMiniNum { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 800; color: ${BRAND.text}; line-height: 1 }
.pfMiniNum.gold { color: ${BRAND.accent} }
.pfMiniLabel { margin: 4px 0 0; font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: ${BRAND.faint} }

/* ── Empty ─────────────────────────────────────────────────────── */
.pfEmpty {
  text-align: center; padding: 38px 20px; border-radius: 20px; min-width: 0;
  background: linear-gradient(180deg, #fffdfb, #fff6ee); border: 1px dashed ${BRAND.borderStrong};
  animation: pfRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.pfEmptyIc { width: 50px; height: 50px; margin: 0 auto 10px; border-radius: 16px; display: grid; place-items: center; color: #ffe3a3; background: ${BRAND.gradient}; animation: pfFloat 4.5s ease-in-out infinite }
.pfEmptyTitle { margin: 0; font-size: 16px; font-weight: 800; color: ${BRAND.text} }
.pfEmptySub { margin: 6px 0 0; font-size: 13.5px; color: ${BRAND.muted} }

@keyframes pfRise { from { opacity: 0; transform: translateY(14px) scale(0.985) } to { opacity: 1; transform: none } }

@media (prefers-reduced-motion: reduce) {
  .pfHero, .pfStat, .pfCard, .pfPage, .pfEmpty, .pfTabs, .pfPoints, .pfAvatarWrap, .pfGateIc { animation: none }
  .pfShine, .pfSpark, .pfStatus.is-live i, .pfPointsIc, .pfEmptyIc { animation: none }
  .pfPage, .pfPage::before, .pfEmoji, .pfStat, .pfChev, .pfHeadIc { transition: none }
  .pfPage:hover { transform: none }
}
`;
