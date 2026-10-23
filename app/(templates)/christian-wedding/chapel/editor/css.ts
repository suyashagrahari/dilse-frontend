// ─── The editor's stylesheet (phone first; left rail + live preview ≥ 1024) ─
// Big inputs (≥ 48px, 16px text: no iOS zoom), labels above, help below,
// a sticky save bar that never covers the focused field.

export const EDITOR_CSS = `
.cwe { position: fixed; inset: 0; z-index: 150; display: grid; grid-template-rows: auto auto 1fr; background: var(--wk-bg, #fbf7ef); color: var(--wk-ink, #3b342c); font-family: var(--wk-font-sans), system-ui, sans-serif; --bar: calc(68px + env(safe-area-inset-bottom, 0px)); }
.cwe * { box-sizing: border-box; }
.cwe :where(button, a, input, select, textarea):focus-visible { outline: 2px solid var(--wk-gold, #c2a165); outline-offset: 2px; }
.cwe-top { display: flex; align-items: center; gap: 10px; padding: calc(8px + env(safe-area-inset-top, 0px)) 12px 8px; background: rgba(255,253,248,.96); border-bottom: 1px solid var(--wk-border); }
.cwe-title { flex: 1; min-width: 0; display: flex; flex-direction: column; text-align: center; }
.cwe-title b { font: 600 17px/1.2 var(--wk-font-display), Georgia, serif; }
.cwe-title small { font-size: 12px; color: var(--wk-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.cwe-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 48px; padding: 0 18px; border-radius: 14px; border: 1px solid transparent; background: var(--wk-accent, #6f8a6c); color: var(--wk-accent-ink, #fff); font: 700 15px/1 inherit; font-family: inherit; text-decoration: none; cursor: pointer; white-space: nowrap; }
.cwe-btn:active { transform: scale(.98); }
.cwe-btn.is-ghost { background: var(--wk-surface-solid, #fffdf8); color: var(--wk-ink); border-color: var(--wk-border); }
.cwe-btn.is-sm { min-height: 44px; padding: 0 14px; font-size: 14px; border-radius: 12px; }
.cwe-btn.is-danger { color: #a3342b; }
.cwe-btn.is-wide { width: 100%; margin-top: 4px; }
.cwe-btn:disabled { opacity: .5; cursor: default; }

/* steps rail: chips on phones */
.cwe-rail { display: flex; gap: 8px; overflow-x: auto; padding: 10px 12px; background: var(--wk-bg); border-bottom: 1px solid var(--wk-border); scrollbar-width: none; }
.cwe-rail::-webkit-scrollbar { display: none; }
.cwe-step { flex: none; display: inline-flex; align-items: center; gap: 7px; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); color: var(--wk-ink); font: 600 14px/1 inherit; font-family: inherit; cursor: pointer; }
.cwe-step-ic { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--cw-sage-soft, #e6ede2); color: var(--cw-sage, #6f8a6c); }
.cwe-step.is-done .cwe-step-ic { background: var(--cw-sage, #6f8a6c); color: #fff; }
.cwe-step.is-on { background: var(--wk-ink); color: #fffdf8; border-color: var(--wk-ink); }
.cwe-step.is-on .cwe-step-ic { background: rgba(255,255,255,.18); color: #fffdf8; }

.cwe-form { overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; scroll-padding-bottom: calc(var(--bar) + 24px); }
.cwe-form-in { max-width: 640px; margin: 0 auto; padding: 18px 16px calc(var(--bar) + 28px); }
.cwe-head { display: flex; gap: 12px; align-items: flex-start; margin: 4px 0 18px; }
.cwe-head-n { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: var(--cw-rose-soft, #f3e2e0); color: var(--cw-rose, #b97a80); font: 600 20px/1 Georgia, serif; }
.cwe-h { margin: 0; font: 600 26px/1.15 var(--wk-font-display), Georgia, serif; }
.cwe-sub { margin: 4px 0 0; font-size: 14.5px; line-height: 1.45; color: var(--wk-muted); }
.cwe-sub2 { margin: 16px 0 8px; font: 600 13px/1.2 inherit; font-family: inherit; color: var(--wk-muted); text-transform: uppercase; letter-spacing: .08em; }
.cwe-h3 { margin: 28px 0 10px; font: 600 20px/1.2 var(--wk-font-display), Georgia, serif; }

.cwe-field { position: relative; display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; min-width: 0; }
.cwe-label { font: 600 14.5px/1.3 inherit; font-family: inherit; color: var(--wk-ink); }
.cwe-label small { font-weight: 400; color: var(--wk-muted); }
.cwe-input { width: 100%; min-height: 50px; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid, #fffdf8); color: var(--wk-ink); font: 400 16px/1.4 inherit; font-family: inherit; scroll-margin-top: 120px; scroll-margin-bottom: calc(var(--bar) + 30px); -webkit-appearance: none; appearance: none; }
select.cwe-input { background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%); background-position: calc(100% - 20px) 50%, calc(100% - 15px) 50%; background-size: 5px 5px; background-repeat: no-repeat; padding-right: 36px; }
.cwe-input:focus { outline: 2px solid var(--wk-gold, #c2a165); outline-offset: 0; }
.cwe-input.is-bad { border-color: #c2483f; }
.cwe-area { min-height: 96px; resize: vertical; line-height: 1.55; }
.cwe-count { position: absolute; right: 8px; bottom: -18px; font-size: 11.5px; color: var(--wk-muted); }
.cwe-field:has(.cwe-count) { margin-bottom: 26px; }
.cwe-hint { margin: 0; font-size: 13.5px; line-height: 1.45; color: var(--wk-muted); }
.cwe-err { margin: 0; font-size: 13.5px; line-height: 1.4; color: #b3261e; }
.cwe-grid2 { display: grid; gap: 0 12px; grid-template-columns: 1fr; }
@media (min-width: 520px) { .cwe-grid2 { grid-template-columns: 1fr 1fr; } }
.cwe-phone { display: flex; align-items: stretch; gap: 8px; }
.cwe-phone b { display: grid; place-items: center; min-width: 54px; border-radius: 14px; background: var(--wk-surface-2); border: 1px solid var(--wk-border); font-weight: 600; }

.cwe-ai { display: flex; align-items: center; gap: 12px; width: 100%; margin: 0 0 20px; padding: 14px 16px; border-radius: 18px; border: 0; text-align: left; cursor: pointer; color: #fffdf8; background: linear-gradient(120deg, #5b7659, #7d9a7a 55%, #b98a7f); box-shadow: 0 16px 30px -18px rgba(50,60,40,.8); font-family: inherit; }
.cwe-ai > span:nth-child(2) { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.cwe-ai b { font-size: 16.5px; }
.cwe-ai small { font-size: 13px; line-height: 1.4; opacity: .9; }
.cwe-ai-ic { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 14px; background: rgba(255,255,255,.18); flex: none; }

.cwe-photo-row { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 12px; }
.cwe-thumb { position: relative; flex: none; width: 120px; aspect-ratio: 4 / 3; border-radius: 16px; overflow: hidden; background: var(--wk-surface-2); border: 1px solid var(--wk-border); display: grid; place-items: center; color: var(--wk-muted); }
.cwe-thumb.is-portrait { width: 104px; aspect-ratio: 3 / 4; }
.cwe-thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.cwe-photo-btns { display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.cwe-photo-btns .cwe-btn { min-height: 44px; padding: 0 12px; font-size: 14px; }

.cwe-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.cwe-card { border-radius: 18px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); overflow: hidden; }
.cwe-card.is-off { opacity: .7; }
.cwe-card-sum { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 64px; padding: 10px 14px; border: 0; background: transparent; text-align: left; cursor: pointer; font-family: inherit; color: inherit; }
.cwe-card-ic { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: var(--cw-rose-soft); font-size: 19px; }
.cwe-card-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.cwe-card-t b { font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cwe-card-t small { font-size: 13px; color: var(--wk-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cwe-sw { flex: none; width: 18px; height: 18px; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
.cwe-chev { flex: none; color: var(--wk-muted); transition: transform .2s; }
.cwe-card.is-open .cwe-chev { transform: rotate(90deg); }
.cwe-card-body { padding: 4px 14px 14px; border-top: 1px solid var(--wk-border); }
.cwe-card-body > .cwe-field:first-child { margin-top: 12px; }
.cwe-card-foot { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; margin-top: 6px; }
.cwe-row { padding: 14px; border-radius: 18px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); }
.cwe-row-grid { display: grid; grid-template-columns: minmax(0, 120px) minmax(0, 1fr); gap: 0 10px; }
.cwe-tools { display: flex; gap: 6px; justify-content: flex-end; }
.cwe-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--wk-border); background: var(--wk-surface-2); color: var(--wk-ink); cursor: pointer; }
.cwe-icon:disabled { opacity: .35; cursor: default; }
.cwe-icon.is-danger { color: #a3342b; }

.cwe-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.cwe-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); color: var(--wk-ink); font: 500 14px/1 inherit; font-family: inherit; cursor: pointer; }
.cwe-chip.is-on { background: var(--cw-sage, #6f8a6c); color: #fff; border-color: transparent; }
.cwe-swatches { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 16px; }
.cwe-swatch { position: relative; width: 44px; height: 44px; border-radius: 14px; border: 2px solid #fff; box-shadow: 0 0 0 1px var(--wk-border); cursor: pointer; display: grid; place-items: center; color: var(--wk-muted); background: var(--wk-surface-2); }
.cwe-swatch.is-on { box-shadow: 0 0 0 3px var(--wk-ink); }
.cwe-swatch.is-custom input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }

.cwe-toggle { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 60px; margin: 6px 0 14px; padding: 10px 14px; border-radius: 16px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); text-align: left; cursor: pointer; font-family: inherit; color: inherit; }
.cwe-card-foot .cwe-toggle { width: auto; margin: 0; min-height: 48px; flex: 1 1 200px; }
.cwe-toggle-copy { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.cwe-toggle-copy b { font-size: 15px; }
.cwe-toggle-copy small { font-size: 13px; color: var(--wk-muted); line-height: 1.35; }
.cwe-switch { flex: none; position: relative; width: 48px; height: 28px; border-radius: 999px; background: #d9d1c4; transition: background .2s; }
.cwe-switch i { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,.2); transition: transform .2s; }
.cwe-toggle.is-on .cwe-switch { background: var(--cw-sage, #6f8a6c); }
.cwe-toggle.is-on .cwe-switch i { transform: translateX(20px); }

.cwe-verses { display: grid; gap: 10px; margin-bottom: 14px; }
.cwe-verse { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 16px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); text-align: left; cursor: pointer; font-family: inherit; color: inherit; min-height: 48px; }
.cwe-verse b { font-size: 14.5px; }
.cwe-verse small { font-size: 13.5px; line-height: 1.45; color: var(--wk-muted); font-style: italic; }
.cwe-verse.is-on { border-color: var(--cw-sage, #6f8a6c); box-shadow: 0 0 0 2px var(--cw-sage, #6f8a6c) inset; background: var(--cw-sage-soft, #e6ede2); }
@media (min-width: 640px) { .cwe-verses { grid-template-columns: 1fr 1fr; } }

.cwe-themes { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.cwe-theme { position: relative; display: flex; flex-direction: column; gap: 4px; min-height: 132px; padding: 14px; border-radius: 18px; border: 1px solid var(--wk-border); text-align: left; cursor: pointer; font-family: inherit; overflow: hidden; }
.cwe-theme.is-on { box-shadow: 0 0 0 3px var(--wk-ink); }
.cwe-theme-sw { display: flex; gap: 4px; margin-bottom: 6px; }
.cwe-theme-sw i { width: 20px; height: 20px; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.1); }
.cwe-theme b { font-size: 15.5px; }
.cwe-theme small { font-size: 12.5px; }
.cwe-theme-names { position: absolute; right: 12px; bottom: 6px; font: 400 34px/1 var(--wk-font-script, "Great Vibes"), cursive; }
.cwe-theme-names i { font-style: normal; font-size: .6em; }

/* MusicPicker (shared) wears this editor's colours */
.cwe-music { --vw-accent: var(--wk-accent); --vw-accent-deep: var(--wk-ink); --vw-accent-ink: #fff; --vw-edge: var(--wk-border); --vw-soft: var(--cw-sage-soft, #e6ede2); --vw-paper-ink: var(--wk-ink); --vw-font-ui: inherit; }
.cwe-music .vs-hint { font-size: 13.5px; color: var(--wk-muted); line-height: 1.45; }
.cwe-music .vs-label { display: block; margin: 10px 0 6px; font-weight: 600; font-size: 14.5px; }
.cwe-music .vs-input { width: 100%; min-height: 50px; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); font: 400 16px/1.4 inherit; font-family: inherit; color: var(--wk-ink); }
.cwe-music .vs-input.is-bad { border-color: #c2483f; }
.cwe-music button { min-height: 44px; }

.cwe-plink { display: flex; flex-direction: column; gap: 10px; }
.cwe-plink-out { padding: 12px; border-radius: 14px; background: var(--wk-surface-2); display: flex; flex-direction: column; gap: 10px; }
.cwe-plink-out code { font-size: 13px; overflow-wrap: anywhere; }
.cwe-plink-btns { display: flex; gap: 8px; }
.cwe-plink-btns .cwe-btn { flex: 1; }

.cwe-nav-row { display: flex; gap: 10px; justify-content: space-between; margin-top: 28px; }
.cwe-nav-row .cwe-btn:last-child { flex: 1; }

/* sticky save bar (phones) */
.cwe-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 8px; padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px)); background: rgba(255,253,248,.97); border-top: 1px solid var(--wk-border); box-shadow: 0 -10px 24px -18px rgba(70,55,30,.6); transition: transform .2s ease; }
.cwe-bar .cwe-btn { min-height: 50px; padding: 0 10px; }
.cwe.is-kb .cwe-bar { transform: translateY(110%); }
.cwe-undo { position: fixed; z-index: 6; left: 50%; bottom: calc(var(--bar) + 12px); transform: translateX(-50%); display: flex; align-items: center; gap: 12px; padding: 6px 6px 6px 16px; border-radius: 14px; background: #2f2a24; color: #fffdf8; font-size: 14.5px; box-shadow: 0 16px 30px -12px rgba(0,0,0,.5); max-width: calc(100vw - 24px); }
.cwe-undo button { min-height: 44px; padding: 0 14px; border: 0; border-radius: 10px; background: rgba(255,255,255,.14); color: #fff; font: 700 14px/1 inherit; font-family: inherit; cursor: pointer; }

.cwe-full { position: fixed; inset: 0; z-index: 220; overflow-y: auto; background: var(--wk-bg); }
.cwe-full-bar { position: fixed; z-index: 230; left: 50%; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); display: flex; gap: 8px; padding: 6px; border-radius: 18px; background: rgba(255,253,248,.96); box-shadow: 0 16px 34px -14px rgba(0,0,0,.45); border: 1px solid var(--wk-border); }
.cwe-full:has(.cw-gate) .cwe-full-bar { display: none; }

.cwe-pane { display: none; }
body:has(.cwe) .vm-icon { left: auto !important; right: 12px !important; top: auto !important; bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important; z-index: 160 !important; transform: scale(1.1) !important; box-shadow: 0 10px 22px -12px rgba(80,60,30,.55), 0 0 0 1px rgba(194,161,101,.6) !important; }
body:has(.cwe) .vm-icon-btn { color: #87683a !important; background: radial-gradient(circle at 50% 38%, #fffdf8, #f3ead9 72%) !important; }
body:has(.cwe) .vm-icon-eq i { background: #87683a !important; }
@media (min-width: 1024px) { body:has(.cwe) .vm-icon { bottom: 20px !important; right: 20px !important; } }
.cwe-top-save { display: none; }

@media (max-width: 370px) { .cwe-hide-xs { display: none; } }

/* ≥ 1024: rail | form | live preview */
@media (min-width: 1024px) {
  .cwe { grid-template-columns: 220px minmax(0, 1fr) minmax(380px, 440px); grid-template-rows: auto 1fr; }
  .cwe-top { grid-column: 1 / -1; }
  .cwe-top-save { display: inline-flex; }
  .cwe-rail { grid-row: 2; flex-direction: column; overflow: auto; padding: 18px 14px; border-bottom: 0; border-right: 1px solid var(--wk-border); }
  .cwe-step { width: 100%; justify-content: flex-start; border-radius: 14px; }
  .cwe-form { grid-row: 2; }
  .cwe-form-in { padding: 26px 28px 48px; }
  .cwe-bar { display: none; }
  .cwe-undo { bottom: 24px; }
  .cwe-pane { grid-row: 2; display: grid; grid-template-rows: auto 1fr; border-left: 1px solid var(--wk-border); background: #efe8db; min-height: 0; }
  .cwe-pane-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 14px; font: 600 13px/1 inherit; font-family: inherit; color: var(--wk-muted); text-transform: uppercase; letter-spacing: .08em; }
  .cwe-pane-scroll { position: relative; overflow-y: auto; overflow-x: hidden; margin: 0 14px 14px; border-radius: 22px; background: var(--wk-bg); box-shadow: 0 24px 50px -30px rgba(60,45,25,.6); }
}
@media (min-width: 1440px) { .cwe { grid-template-columns: 240px minmax(0, 1fr) 480px; } }
`;

// ─── The AI sheet (guided questions → review) ───────────────────────────────
export const AI_CSS = `
.cwa-scrim { position: fixed; inset: 0; z-index: 240; display: flex; align-items: flex-end; justify-content: center; background: rgba(43,38,32,.4); font-family: var(--wk-font-sans), system-ui, sans-serif; color: var(--wk-ink, #3b342c); }
.cwa { position: relative; display: grid; grid-template-rows: auto auto 1fr auto; width: 100%; height: 100dvh; background: linear-gradient(180deg, #fffdf8, #f8f1e4); box-shadow: 0 -20px 50px -20px rgba(0,0,0,.35); animation: cwa-up .38s cubic-bezier(.22,1,.36,1) both; }
@keyframes cwa-up { from { transform: translateY(40px); opacity: 0; } to { transform: none; opacity: 1; } }
.cwa * { box-sizing: border-box; }
.cwa :where(button, input, textarea):focus-visible { outline: 2px solid var(--wk-gold, #c2a165); outline-offset: 2px; }
.cwa-top { display: flex; align-items: center; gap: 8px; padding: calc(8px + env(safe-area-inset-top, 0px)) 10px 4px 18px; }
.cwa-eyebrow { flex: 1; margin: 0; font: 600 12px/1.3 var(--wk-font-caps), Georgia, serif; letter-spacing: .18em; text-transform: uppercase; color: var(--cw-sage, #6f8a6c); }
.cwa-x { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; border: 0; background: transparent; color: var(--wk-muted); cursor: pointer; }
.cwa-progress { display: flex; gap: 5px; padding: 6px 18px 0; }
.cwa-progress i { flex: 1; height: 4px; border-radius: 4px; background: rgba(135,104,58,.15); transition: background .3s; }
.cwa-progress i.is-on { background: var(--cw-sage, #6f8a6c); }
.cwa-body { overflow-y: auto; padding: 18px 18px 24px; }
.cwa-q { margin: 6px 0 6px; font: 600 clamp(26px, 7vw, 32px)/1.15 var(--wk-font-display), Georgia, serif; }
.cwa-hint { margin: 0 0 18px; font-size: 15px; line-height: 1.5; color: var(--wk-muted); }
.cwa-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; min-width: 0; }
.cwa-field > span:first-child { font-weight: 600; font-size: 14.5px; }
.cwa-input { width: 100%; min-height: 54px; padding: 12px 14px; border-radius: 14px; border: 1px solid rgba(135,104,58,.25); background: #fffdf8; color: var(--wk-ink); font: 400 17px/1.4 inherit; font-family: inherit; -webkit-appearance: none; appearance: none; }
.cwa-input:focus { outline: 2px solid var(--wk-gold, #c2a165); outline-offset: 0; }
.cwa-area { min-height: 140px; resize: vertical; line-height: 1.55; }
.cwa-grid2 { display: grid; gap: 0 12px; }
@media (min-width: 480px) { .cwa-grid2 { grid-template-columns: 1fr 1fr; } }
.cwa-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.cwa-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 46px; padding: 0 15px; border-radius: 999px; border: 1px solid rgba(135,104,58,.25); background: #fffdf8; color: var(--wk-ink); font: 600 14.5px/1 inherit; font-family: inherit; cursor: pointer; }
.cwa-chip.is-on { background: var(--cw-sage, #6f8a6c); border-color: transparent; color: #fff; }
.cwa-native { font-weight: 400; opacity: .85; }
.cwa-fn-dates { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.cwa-fn-dates li { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 170px); align-items: center; gap: 10px; }
.cwa-fn-dates span { font-weight: 600; font-size: 15px; }
.cwa-tones { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px; }
.cwa-tone { display: flex; flex-direction: column; gap: 3px; min-height: 72px; padding: 12px; border-radius: 16px; border: 1px solid rgba(135,104,58,.25); background: #fffdf8; text-align: left; cursor: pointer; color: inherit; font-family: inherit; }
.cwa-tone b { font-size: 15.5px; }
.cwa-tone small { font-size: 12.5px; color: var(--wk-muted); line-height: 1.35; }
.cwa-tone.is-on { background: var(--cw-sage-soft, #e6ede2); box-shadow: inset 0 0 0 2px var(--cw-sage, #6f8a6c); }
.cwa-sub { margin: 0 0 8px; font-weight: 600; font-size: 14.5px; }
.cwa-phone { display: flex; gap: 8px; }
.cwa-phone b { display: grid; place-items: center; min-width: 56px; border-radius: 14px; background: #f5efe3; border: 1px solid rgba(135,104,58,.25); }
.cwa-link { display: inline-block; margin-top: 8px; min-height: 44px; padding: 0; border: 0; background: none; color: var(--cw-rose, #a9646d); font: 600 15px/1 inherit; font-family: inherit; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; }
.cwa-err { margin: 8px 0 0; color: #b3261e; font-size: 14px; line-height: 1.45; }
.cwa-foot { display: flex; gap: 10px; padding: 10px 18px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid rgba(135,104,58,.15); background: rgba(255,253,248,.96); }
.cwa-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 54px; padding: 0 16px; border-radius: 16px; border: 0; background: linear-gradient(110deg, #7d9a7a, #5b7659); color: #fffdf8; font: 700 16px/1 inherit; font-family: inherit; cursor: pointer; }
.cwa-btn.is-ghost { flex: 0 1 auto; background: #fffdf8; color: var(--wk-ink); border: 1px solid rgba(135,104,58,.25); }
.cwa-btn:disabled { opacity: .45; cursor: default; }
.cwa-busy { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 60%; gap: 6px; padding-top: 12vh; }
.cwa-busy-dove { font-size: 54px; animation: cwa-fly 2.4s ease-in-out infinite; }
@keyframes cwa-fly { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-14px) rotate(4deg); } }
.cwa-review { font-size: 15px; }
@media (min-width: 640px) {
  .cwa-scrim { align-items: center; }
  .cwa { width: min(600px, 94vw); height: min(820px, 92dvh); border-radius: 26px; overflow: hidden; }
  .cwa-top { padding-top: 12px; }
}
@media (prefers-reduced-motion: reduce) { .cwa, .cwa-busy-dove { animation: none; } }
`;
