// ─── The editor's CSS: champagne paper, big inputs, sticky rail + bar ────────

export const ED_CSS = `
.rc-ed-root { position: relative; z-index: 100; }
.rc-ed-root.rc-ai-root { z-index: 140; }
.rc-ed-root { --e-paper: #FFFDF8; --e-bg: #FAF4E9; --e-bg2: #F3E7D2; --e-ink: #2E2216; --e-soft: #6F5F4B; --e-faint: #9C8D78; --e-line: #E6D7BC; --e-gold: #B8892E; --e-gold-d: #84601C; --e-danger: #A4432C;
  --e-foil: linear-gradient(135deg, #8A6420 0%, #D9B45E 30%, #F6E2A6 50%, #C9993F 70%, #8A6420 100%);
  --e-bar: 64px; font-family: var(--wk-font-sans); color: var(--e-ink); }
.rc-ed { position: fixed; z-index: 100; inset: 0; display: grid; grid-template-rows: auto auto 1fr auto; background: var(--e-bg); }
@media (min-width: 1024px) {
  .rc-ed { inset: var(--rc-top, 0px) auto 0 0; width: var(--rc-panel, min(680px, 50vw)); grid-template-columns: 172px 1fr; grid-template-rows: auto 1fr auto; border-right: 1px solid var(--e-line); box-shadow: 18px 0 40px -30px rgba(60,40,10,.35); }
  .rc-ed-top { grid-column: 1 / -1; }
  .rc-ed-steps { grid-row: 2 / 4; }
  .rc-ed-body { grid-column: 2; grid-row: 2; }
  .rc-ed-bar { grid-column: 2; grid-row: 3; }
  .rc-ed-only-phone { display: none !important; }
}

/* Header */
.rc-ed-top { display: flex; align-items: center; gap: 10px; padding: max(8px, env(safe-area-inset-top)) 12px 8px; background: var(--e-paper); border-bottom: 1px solid var(--e-line); }
.rc-ed-title { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.rc-ed-title b { font: 600 16px/1.25 var(--wk-font-sans); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-ed-title small { font: 500 12.5px/1.3 var(--wk-font-sans); color: var(--e-faint); }

/* Steps: a scrolling chip rail on phones, a vertical rail on laptops */
.rc-ed-steps { display: flex; gap: 6px; overflow-x: auto; padding: 8px 12px; background: var(--e-paper); border-bottom: 1px solid var(--e-line); scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.rc-ed-steps::-webkit-scrollbar { display: none; }
.rc-ed-steps button { flex: none; display: inline-flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 14px 0 6px; border-radius: 999px; border: 1px solid var(--e-line); background: var(--e-bg); font: 600 14px/1 var(--wk-font-sans); color: var(--e-soft); cursor: pointer; white-space: nowrap; }
.rc-ed-step-n { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--e-paper); border: 1px solid var(--e-line); font: 700 12.5px/1 var(--wk-font-sans); color: var(--e-soft); }
.rc-ed-steps button.is-done .rc-ed-step-n { background: #EAF3E6; border-color: #B8D2AE; color: #3E6B35; }
.rc-ed-steps button[aria-current=step] { background: var(--e-ink); border-color: var(--e-ink); color: #FFF8EA; }
.rc-ed-steps button[aria-current=step] .rc-ed-step-n { background: var(--e-foil); border-color: transparent; color: #3A2608; }
@media (min-width: 1024px) {
  .rc-ed-steps { flex-direction: column; overflow: auto; padding: 14px 10px; border-bottom: 0; border-right: 1px solid var(--e-line); gap: 4px; }
  .rc-ed-steps button { width: 100%; border-radius: 14px; border-color: transparent; background: none; padding: 0 10px 0 6px; min-height: 46px; }
  .rc-ed-steps button[aria-current=step] { background: var(--e-ink); }
}

/* Body */
.rc-ed-body { overflow-y: auto; overscroll-behavior: contain; padding: 18px 16px calc(var(--e-bar) + 28px + env(safe-area-inset-bottom)); scroll-padding-bottom: calc(var(--e-bar) + 40px); }
.rc-ed-body.is-kbd { padding-bottom: 40vh; }
@media (min-width: 1024px) { .rc-ed-body { padding: 22px 26px 36px; } }
.rc-ed-pane { max-width: 620px; margin: 0 auto; animation: rc-ed-in .35s cubic-bezier(.22,1,.36,1); }
@keyframes rc-ed-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.rc-ed-k { margin: 0 0 6px; font: 600 12px/1.4 var(--wk-font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--e-gold-d); }
.rc-ed-h { margin: 22px 0 10px; font: 500 26px/1.2 var(--wk-font-display); color: var(--e-ink); }
.rc-ed-pane > .rc-ed-h:first-of-type { margin-top: 6px; }
.rc-ed-lead { margin: -4px 0 14px; font: 400 15px/1.5 var(--wk-font-sans); color: var(--e-soft); }
.rc-ed-note { margin: 0 0 14px; padding: 12px 14px; border-radius: 14px; background: #FFF4DA; border: 1px solid #F0D9A0; font: 500 14.5px/1.5 var(--wk-font-sans); color: #6B4E12; }
.rc-ed-grid2 { display: grid; gap: 0 12px; }
@media (min-width: 520px) { .rc-ed-grid2 { grid-template-columns: 1fr 1fr; } }
.rc-ed-grid2.is-people { gap: 14px; }
@media (min-width: 560px) and (max-width: 1023px) { .rc-ed-grid2.is-people { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .rc-ed-grid2.is-people { grid-template-columns: 1fr; } }
.rc-ed-grid3 { display: grid; gap: 0 10px; grid-template-columns: 1fr 1fr; }
.rc-ed-grid3 > :first-child { grid-column: 1 / -1; }
@media (min-width: 560px) { .rc-ed-grid3 { grid-template-columns: 1.3fr 1fr 1fr; } .rc-ed-grid3 > :first-child { grid-column: auto; } }

/* Inputs */
.rc-ed-field { display: flex; flex-direction: column; gap: 6px; margin: 0 0 14px; min-width: 0; }
.rc-ed-field > label, .rc-ed-label { font: 600 14px/1.3 var(--wk-font-sans); color: var(--e-ink); }
.rc-ed-field > label b { color: var(--e-danger); }
.rc-ed-input { position: relative; display: flex; align-items: stretch; }
.rc-ed-input.is-short { max-width: 160px; }
.rc-ed-field input, .rc-ed-field textarea { width: 100%; min-width: 0; min-height: 50px; box-sizing: border-box; padding: 12px 14px; border-radius: 14px; border: 1.5px solid var(--e-line); background: var(--e-paper); font: 400 16px/1.45 var(--wk-font-sans); color: var(--e-ink); outline: none; scroll-margin-bottom: calc(var(--e-bar) + 40px); }
.rc-ed-field textarea { resize: vertical; min-height: 96px; }
.rc-ed-field input[type=date], .rc-ed-field input[type=time] { padding-top: 0; padding-bottom: 0; -webkit-appearance: none; appearance: none; }
.rc-ed-field input:focus, .rc-ed-field textarea:focus { border-color: var(--e-gold); box-shadow: 0 0 0 4px rgba(230,200,120,.35); }
.rc-ed-field.has-error input { border-color: var(--e-danger); }
.rc-ed-input.has-prefix input { border-top-left-radius: 0; border-bottom-left-radius: 0; }
.rc-ed-prefix { display: grid; place-items: center; padding: 0 12px; border: 1.5px solid var(--e-line); border-right: 0; border-radius: 14px 0 0 14px; background: var(--e-bg2); font: 600 15px var(--wk-font-sans); color: var(--e-soft); }
.rc-ed-input.has-suffix input { padding-right: 76px; }
.rc-ed-suffix { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); min-height: 42px; padding: 0 12px; border: 0; border-radius: 10px; background: none; font: 600 14px var(--wk-font-sans); color: var(--e-gold-d); cursor: pointer; }
.rc-ed-help, .rc-ed-err { margin: 0; font: 400 13.5px/1.45 var(--wk-font-sans); color: var(--e-faint); }
.rc-ed-err { color: var(--e-danger); font-weight: 500; }
.rc-ed-help-row { display: flex; justify-content: space-between; gap: 10px; }
.rc-ed-count { flex: none; font-variant-numeric: tabular-nums; }

/* Buttons */
.rc-ed-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; padding: 0 18px; border-radius: 14px; border: 0; cursor: pointer; text-decoration: none; white-space: nowrap;
  font: 700 15px/1 var(--wk-font-sans); color: #FFF8EA; background: var(--e-ink); -webkit-tap-highlight-color: transparent; transition: transform .2s; }
.rc-ed-btn:active { transform: scale(.97); }
.rc-ed-btn:disabled { opacity: .5; cursor: default; }
.rc-ed-btn.is-gold { background: var(--e-foil); color: #3A2608; box-shadow: 0 10px 20px -12px rgba(110,70,10,.7); }
.rc-ed-btn.is-ghost { background: var(--e-paper); color: var(--e-ink); border: 1.5px solid var(--e-line); }
.rc-ed-btn.is-danger { background: var(--e-paper); color: var(--e-danger); border: 1.5px solid #E7C3B8; }
.rc-ed-btn.is-wa { background: #1FAE57; }
.rc-ed-btn.is-on { background: var(--e-gold-d); }
.rc-ed-btn.is-sm { min-height: 42px; padding: 0 14px; font-size: 14px; border-radius: 12px; }
.rc-ed-btn.is-lg { min-height: 54px; font-size: 16px; }
.rc-ed-btn.is-wide { width: 100%; }
.rc-ed-btn:focus-visible, .rc-ed-icon:focus-visible, .rc-ed-chip:focus-visible, .rc-ed-steps button:focus-visible { outline: 3px solid var(--e-gold); outline-offset: 2px; }
.rc-ed-icon { display: inline-grid; place-items: center; min-width: 44px; min-height: 44px; border-radius: 12px; border: 1.5px solid var(--e-line); background: var(--e-paper); font: 600 18px/1 var(--wk-font-sans); color: var(--e-ink); cursor: pointer; }
.rc-ed-icon:disabled { opacity: .4; cursor: default; }
.rc-ed-icon.is-x { border-color: transparent; background: none; }
.rc-ed-btnrow { display: flex; flex-wrap: wrap; gap: 10px; }

/* Chips, segmented, toggles, swatches */
.rc-ed-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: -6px 0 14px; }
.rc-ed-chip { min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--e-line); background: var(--e-paper); font: 600 14px var(--wk-font-sans); color: var(--e-soft); cursor: pointer; }
.rc-ed-chip[aria-pressed=true] { background: #FFF1D2; border-color: var(--e-gold); color: var(--e-gold-d); }
.rc-ed-seg { display: inline-flex; padding: 4px; border-radius: 14px; background: var(--e-bg2); gap: 4px; }
.rc-ed-seg button { min-height: 44px; min-width: 96px; padding: 0 16px; border: 0; border-radius: 11px; background: none; font: 600 15px var(--wk-font-sans); color: var(--e-soft); cursor: pointer; }
.rc-ed-seg button[aria-checked=true] { background: var(--e-paper); color: var(--e-ink); box-shadow: 0 4px 10px -6px rgba(60,40,10,.4); }
.rc-ed-toggle { position: relative; display: flex; align-items: center; gap: 14px; justify-content: space-between; min-height: 56px; margin: 0 0 14px; padding: 10px 14px; border-radius: 16px; background: var(--e-paper); border: 1.5px solid var(--e-line); cursor: pointer; }
.rc-ed-toggle span { display: flex; flex-direction: column; gap: 2px; }
.rc-ed-toggle b { font: 600 15px/1.3 var(--wk-font-sans); }
.rc-ed-toggle small { font: 400 13px/1.4 var(--wk-font-sans); color: var(--e-faint); }
.rc-ed-toggle input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.rc-ed-toggle i { flex: none; position: relative; width: 50px; height: 30px; border-radius: 999px; background: #DCCFB8; transition: background .2s; }
.rc-ed-toggle i::after { content: ""; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,.2); transition: transform .25s cubic-bezier(.34,1.56,.64,1); }
.rc-ed-toggle input:checked + i { background: var(--e-gold); }
.rc-ed-toggle input:checked + i::after { transform: translateX(20px); }
.rc-ed-toggle input:focus-visible + i { outline: 3px solid var(--e-gold); outline-offset: 2px; }
.rc-ed-swatches { display: flex; flex-wrap: wrap; gap: 8px; }
.rc-ed-sw { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--e-paper); box-shadow: 0 0 0 1.5px var(--e-line); cursor: pointer; padding: 0; overflow: hidden; }
.rc-ed-sw[aria-checked=true] { box-shadow: 0 0 0 3px var(--e-gold); }
.rc-ed-sw.is-auto { width: auto; padding: 0 12px; border-radius: 999px; background: var(--e-paper); font: 600 13px var(--wk-font-sans); color: var(--e-soft); }
.rc-ed-sw.is-custom { background: conic-gradient(#E86A92, #E9CF8E, #4F9B6A, #2E5AAC, #7B3FA0, #E86A92); font: 700 18px var(--wk-font-sans); color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.4); }
.rc-ed-sw.is-custom input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.rc-ed-stepper { display: inline-flex; align-items: center; gap: 14px; }
.rc-ed-stepper b { min-width: 28px; text-align: center; font: 700 20px var(--wk-font-sans); }

/* Photos */
.rc-ed-photo { display: flex; align-items: center; gap: 14px; margin: 0 0 14px; }
.rc-ed-photo-thumb { flex: none; position: relative; width: 96px; border-radius: 16px; overflow: hidden; border: 1.5px dashed var(--e-line); background: var(--e-bg2); padding: 0; cursor: pointer; }
.rc-ed-photo-thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.rc-ed-photo-add { position: absolute; inset: 0; display: grid; place-items: center; font: 300 34px var(--wk-font-sans); color: var(--e-gold-d); }
.rc-ed-photo-a { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.rc-ed-photo-a > b { font: 600 15px var(--wk-font-sans); }
.rc-ed-photo-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.rc-ed-person { padding: 14px; border-radius: 20px; background: var(--e-paper); border: 1px solid var(--e-line); }

/* Rows + collapsible cards */
.rc-ed-list { display: flex; flex-direction: column; gap: 10px; margin: 0 0 12px; }
.rc-ed-card { border-radius: 18px; background: var(--e-paper); border: 1px solid var(--e-line); overflow: hidden; }
.rc-ed-card.is-open { border-color: var(--e-gold); box-shadow: 0 12px 26px -20px rgba(110,70,10,.6); }
.rc-ed-card-h { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 60px; padding: 10px 16px; border: 0; background: none; text-align: left; cursor: pointer; }
.rc-ed-card-h span { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.rc-ed-card-h b { font: 600 16px/1.3 var(--wk-font-sans); color: var(--e-ink); }
.rc-ed-card-h small { font: 400 13.5px/1.35 var(--wk-font-sans); color: var(--e-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-ed-card-h i { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--e-bg2); font: 600 18px var(--wk-font-sans); font-style: normal; color: var(--e-gold-d); }
.rc-ed-card-b { padding: 4px 16px 16px; border-top: 1px solid var(--e-line); padding-top: 14px; }
.rc-ed-row { padding: 14px 14px 4px; border-radius: 18px; background: var(--e-paper); border: 1px solid var(--e-line); }
.rc-ed-rowa { display: flex; flex-wrap: wrap; gap: 8px; margin: 2px 0 10px; }

/* AI card at the top of step 1 */
.rc-ed-ai { margin: 0 0 18px; padding: 18px; border-radius: 22px; background: radial-gradient(120% 120% at 0% 0%, #FFF6DD, #F6E6C4 60%, #F1D9B4); border: 1px solid #E8CD92; box-shadow: 0 16px 30px -24px rgba(110,70,10,.6); }
.rc-ed-ai-k { margin: 0 0 4px; font: 700 12px/1.4 var(--wk-font-sans); letter-spacing: .1em; text-transform: uppercase; color: var(--e-gold-d); }
.rc-ed-ai h3 { margin: 0 0 6px; font: 500 25px/1.2 var(--wk-font-display); }
.rc-ed-ai p { margin: 0 0 14px; font: 400 15px/1.5 var(--wk-font-sans); color: #5C4A30; }
.rc-ed-ai .rc-ed-btn { width: 100%; }
.rc-ed-ai-card { display: flex; justify-content: center; align-items: center; min-height: 44px; margin-top: 6px; font: 600 14px var(--wk-font-sans); color: var(--e-gold-d); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }

/* Look: themes + songs */
.rc-ed-themes { display: grid; gap: 10px; margin: 0 0 8px; }
@media (min-width: 520px) { .rc-ed-themes { grid-template-columns: repeat(3, 1fr); } }
.rc-ed-theme { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 12px; border-radius: 18px; border: 1.5px solid var(--e-line); background: var(--e-paper); text-align: left; cursor: pointer; }
.rc-ed-theme[aria-checked=true] { border-color: var(--e-gold); box-shadow: 0 0 0 3px rgba(230,200,120,.45); }
.rc-ed-theme-sw { width: 100%; height: 54px; border-radius: 12px; margin-bottom: 6px; border: 1px solid rgba(0,0,0,.06); }
.rc-ed-theme b { font: 600 15px var(--wk-font-sans); }
.rc-ed-theme small { font: 400 13px/1.35 var(--wk-font-sans); color: var(--e-soft); }
.rc-ed-modes { display: grid; gap: 8px; margin: 0 0 12px; }
@media (min-width: 520px) { .rc-ed-modes { grid-template-columns: repeat(3, 1fr); } }
.rc-ed-mode { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 10px; align-items: center; min-height: 60px; padding: 10px 12px; border-radius: 16px; border: 1.5px solid var(--e-line); background: var(--e-paper); text-align: left; cursor: pointer; }
.rc-ed-mode span { grid-row: 1 / 3; font-size: 22px; }
.rc-ed-mode b { font: 600 15px var(--wk-font-sans); }
.rc-ed-mode small { font: 400 12.5px/1.3 var(--wk-font-sans); color: var(--e-soft); }
.rc-ed-mode[aria-checked=true] { border-color: var(--e-gold); background: #FFF6E2; }
.rc-ed-panel { padding: 14px; border-radius: 18px; background: var(--e-paper); border: 1px solid var(--e-line); display: flex; flex-direction: column; gap: 12px; }
.rc-ed-now { display: flex; align-items: center; gap: 12px; }
.rc-ed-now img { width: 72px; height: 54px; object-fit: cover; border-radius: 10px; flex: none; }
.rc-ed-now span { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.rc-ed-now b { font: 600 15px/1.3 var(--wk-font-sans); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-ed-now small { font: 400 13px var(--wk-font-sans); color: var(--e-soft); }
.rc-ed-songs { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; max-height: 330px; overflow: auto; }
.rc-ed-songs button { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 52px; padding: 6px 10px 6px 6px; border-radius: 14px; border: 1.5px solid transparent; background: var(--e-bg); text-align: left; cursor: pointer; }
.rc-ed-songs button[aria-pressed=true] { border-color: var(--e-gold); background: #FFF6E2; }
.rc-ed-songs img { width: 56px; height: 40px; object-fit: cover; border-radius: 8px; flex: none; }
.rc-ed-songs span { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.rc-ed-songs b { font: 600 14.5px/1.3 var(--wk-font-sans); }
.rc-ed-songs small { font: 400 12.5px var(--wk-font-sans); color: var(--e-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-ed-songs i { font-style: normal; color: var(--e-gold-d); font-weight: 700; width: 18px; }
.rc-ed-link { margin: -4px 0 10px; padding: 10px 12px; border-radius: 12px; background: var(--e-bg2); font: 500 13.5px/1.4 var(--wk-font-sans); color: var(--e-soft); overflow-wrap: anywhere; }

/* The sticky bar */
.rc-ed-bar { display: flex; gap: 8px; align-items: center; padding: 8px 12px calc(8px + env(safe-area-inset-bottom)); min-height: var(--e-bar); background: rgba(255,253,248,.97); border-top: 1px solid var(--e-line); box-shadow: 0 -10px 24px -20px rgba(60,40,10,.4); }
.rc-ed-bar .rc-ed-btn { flex: 1; min-width: 0; padding: 0 12px; }
.rc-ed-bar.is-hidden { display: none; }
@media (min-width: 1024px) { .rc-ed-bar { padding: 12px 26px; } .rc-ed-bar .rc-ed-btn { flex: 0 1 auto; min-width: 120px; } .rc-ed-bar .rc-ed-btn:last-child { margin-left: auto; } }
.rc-ed-undo { position: fixed; z-index: 120; left: 50%; bottom: calc(var(--e-bar) + 16px + env(safe-area-inset-bottom)); transform: translateX(-50%); display: flex; align-items: center; gap: 12px; padding: 6px 6px 6px 16px; border-radius: 999px; background: var(--e-ink); color: #FFF8EA; font: 500 14px var(--wk-font-sans); box-shadow: 0 16px 30px -12px rgba(0,0,0,.5); max-width: calc(100vw - 24px); animation: rc-ed-in .3s; }
.rc-ed-undo span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-ed-undo button { flex: none; min-height: 40px; padding: 0 16px; border-radius: 999px; border: 0; background: var(--e-foil); color: #3A2608; font: 700 14px var(--wk-font-sans); cursor: pointer; }
@media (min-width: 1024px) { .rc-ed-undo { left: calc(var(--rc-panel, min(680px, 50vw)) / 2); } }

/* ══ The AI questions overlay ════════════════════════════ */
.rc-ai { position: fixed; z-index: 140; inset: 0; display: flex; align-items: flex-end; justify-content: center; background: rgba(46,34,22,.38); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
@media (min-width: 720px) { .rc-ai { align-items: center; padding: 24px; } }
.rc-ai-sheet { width: 100%; max-width: 560px; max-height: 100dvh; overflow-y: auto; overscroll-behavior: contain; background: var(--e-bg); border-radius: 26px 26px 0 0; padding: 14px 18px calc(22px + env(safe-area-inset-bottom)); box-shadow: 0 -20px 50px -20px rgba(0,0,0,.4); animation: rc-ai-up .4s cubic-bezier(.22,1,.36,1); }
@media (max-width: 719px) { .rc-ai-sheet { height: 100dvh; border-radius: 0; padding-top: max(12px, env(safe-area-inset-top)); } }
@media (min-width: 720px) { .rc-ai-sheet { border-radius: 26px; max-height: min(860px, 94dvh); padding: 18px 26px 26px; } }
@keyframes rc-ai-up { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
.rc-ai-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.rc-ai-k { margin: 0; font: 700 12px/1.4 var(--wk-font-sans); letter-spacing: .12em; text-transform: uppercase; color: var(--e-gold-d); }
.rc-ai-x { min-width: 44px; min-height: 44px; border: 0; background: none; font: 500 18px var(--wk-font-sans); color: var(--e-soft); cursor: pointer; }
.rc-ai-h { margin: 6px 0 10px; font: 500 clamp(26px, 6.4vw, 32px)/1.2 var(--wk-font-display); color: var(--e-ink); text-wrap: balance; }
.rc-ai-p { margin: 0 0 14px; font: 400 15.5px/1.5 var(--wk-font-sans); color: var(--e-soft); }
.rc-ai-intro { display: flex; flex-direction: column; gap: 10px; padding-top: 10px; }
.rc-ai-intro .rc-ai-p { margin-bottom: 8px; }
.rc-ai-card { display: flex; justify-content: center; align-items: center; min-height: 44px; font: 600 14px var(--wk-font-sans); color: var(--e-gold-d); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.rc-ai-q { display: flex; flex-direction: column; gap: 4px; }
.rc-ai-prog { display: flex; gap: 6px; margin: 4px 0 10px; }
.rc-ai-prog i { flex: 1; height: 5px; border-radius: 999px; background: var(--e-line); transition: background .3s; }
.rc-ai-prog i.is-on { background: var(--e-gold); }
.rc-ai-field { display: flex; flex-direction: column; gap: 6px; margin: 0 0 14px; min-width: 0; }
.rc-ai-field span { font: 600 14px var(--wk-font-sans); color: var(--e-ink); }
.rc-ai-field span b { color: var(--e-danger); }
.rc-ai-field input, .rc-ai-field textarea { width: 100%; min-width: 0; min-height: 52px; box-sizing: border-box; padding: 12px 14px; border-radius: 14px; border: 1.5px solid var(--e-line); background: var(--e-paper); font: 400 16px/1.45 var(--wk-font-sans); color: var(--e-ink); outline: none; }
.rc-ai-field input:focus, .rc-ai-field textarea:focus { border-color: var(--e-gold); box-shadow: 0 0 0 4px rgba(230,200,120,.35); }
.rc-ai-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px; }
.rc-ai-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.rc-ai-chips button { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid var(--e-line); background: var(--e-paper); font: 600 14.5px var(--wk-font-sans); color: var(--e-soft); cursor: pointer; }
.rc-ai-chips button[aria-pressed=true] { background: #FFF1D2; border-color: var(--e-gold); color: var(--e-gold-d); }
.rc-ai-nav { display: flex; align-items: center; gap: 10px; margin-top: 10px; position: sticky; bottom: calc(-22px - env(safe-area-inset-bottom)); padding: 12px 0 calc(4px + env(safe-area-inset-bottom)); background: linear-gradient(transparent, var(--e-bg) 30%); }
.rc-ai-nav .rc-ed-btn:last-child { margin-left: auto; min-width: 120px; }
.rc-ai-skip { min-height: 44px; padding: 0 8px; border: 0; background: none; font: 600 14px var(--wk-font-sans); color: var(--e-gold-d); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.rc-ai-busy { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 18vh 10px 10vh; }
.rc-ai-spark { display: flex; gap: 10px; margin-bottom: 18px; }
.rc-ai-spark i { width: 14px; height: 14px; border-radius: 50%; background: var(--e-foil); animation: rc-ai-dot 1.2s ease-in-out infinite; }
.rc-ai-spark i:nth-child(2) { animation-delay: .15s; }
.rc-ai-spark i:nth-child(3) { animation-delay: .3s; }
@keyframes rc-ai-dot { 0%, 100% { transform: translateY(0) scale(.8); opacity: .5; } 50% { transform: translateY(-10px) scale(1.1); opacity: 1; } }
.rc-ai-review { padding-top: 4px; }
@media (prefers-reduced-motion: reduce) { .rc-ed-pane, .rc-ai-sheet, .rc-ed-undo { animation: none; } .rc-ai-spark i { animation: none; } }
`;
