// ─── Christian Wedding (chapel doors): the stylesheet ───────────────────────
// Phone first (360–430), then tablet (≥ 700) and desktop (≥ 1024) layouts that
// are designed, not stretched. Light theme only; colours come from the kit's
// --wk-* tokens plus --cw-rose / --cw-sage (see model.ts CW_THEMES). Every
// photo and card is a rectangle with four equal rounded corners. Motion is
// transform/opacity only and stops under prefers-reduced-motion.

export const CW_CSS = `
.cw-root { --cw-ease: cubic-bezier(.22,1,.36,1); --cw-r: 20px; color: var(--wk-ink); font-family: var(--wk-font-sans); overflow-x: clip; scroll-padding-top: 72px; }
.cw-root * { box-sizing: border-box; }
.cw-root img { max-width: none; }
.cw-root :where(button, a) { -webkit-tap-highlight-color: transparent; }
.cw-root :where(button, a, input, textarea):focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 3px; }

/* ── The music icon: top right, 44px, ivory ─────────────────────────────── */
body:has(.cw-root) .vm-icon { top: calc(max(12px, env(safe-area-inset-top)) + 0px) !important; right: 12px !important; left: auto !important; bottom: auto !important; z-index: 96 !important; transform: scale(1.1) !important; transform-origin: 100% 0 !important; box-shadow: 0 10px 22px -12px rgba(80,60,30,.55), 0 0 0 1px rgba(194,161,101,.6) !important; }
body:has(.cw-root) .vm-icon-btn { color: var(--wk-gold-ink, #87683a) !important; background: radial-gradient(circle at 50% 38%, #fffdf8, #f3ead9 72%) !important; }
body:has(.cw-root) .vm-icon-eq i { background: #87683a !important; }
body:has(.cw-root) .vm-icon-ring { background: conic-gradient(from 0deg, #c2a165, transparent 30%, #b97a80 52%, transparent 78%, #c2a165) !important; }

/* ══ The opening ═══════════════════════════════════════════════════════════ */
.cw-gate { position: fixed; inset: 0; z-index: 90; overflow: hidden; background: #f7f1e6; transition: opacity .95s ease; }
.cw-gate-bg { position: absolute; inset: 0; background:
  radial-gradient(120% 70% at 50% 18%, #fffdf7 0%, rgba(255,253,247,0) 60%),
  linear-gradient(180deg, #f8f2e7 0%, #f2e8d8 62%, #eadcc6 100%); }
.cw-gate-glow { position: absolute; left: 50%; top: 70%; width: 120vmax; aspect-ratio: 1; transform: translate(-50%,-50%) scale(.5); border-radius: 50%; opacity: 0; background: radial-gradient(closest-side, rgba(255,250,235,1), rgba(255,240,205,.6) 45%, rgba(255,240,205,0)); transition: opacity 1.2s ease, transform 1.8s var(--cw-ease); }
.cw-gate-ivy { display: none; }
.cw-gate-side { position: absolute; top: 0; bottom: 0; display: none; }
.cw-gate-side.is-l { left: 0; }
.cw-gate-side.is-r { right: 0; }
.cw-gate-side-ivy { position: absolute; top: -3svh; width: max(100%, 56svh); height: auto; opacity: .9; pointer-events: none;
  -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent); mask-image: linear-gradient(to bottom, #000 55%, transparent); }
.cw-gate-side.is-l .cw-gate-side-ivy { right: -6svh; }
.cw-gate-side.is-r .cw-gate-side-ivy { left: -6svh; transform: scaleX(-1); }
.cw-gate-col { position: absolute; bottom: 4svh; height: 86svh; width: auto; }
.cw-gate-urn { position: absolute; bottom: 0; height: 30svh; width: auto; }
.cw-gate-side.is-l { right: calc(50% + 33svh); }
.cw-gate-side.is-r { left: calc(50% + 33svh); }
.cw-gate-side.is-l .cw-gate-col { right: 2svh; }
.cw-gate-side.is-r .cw-gate-col { left: 2svh; }
.cw-gate-side.is-l .cw-gate-urn { right: 9svh; }
.cw-gate-side.is-r .cw-gate-urn { left: 9svh; transform: scaleX(-1); }

.cw-gate-cam { position: absolute; inset: 0; transform-origin: 50% 77%; transition: transform 1.15s cubic-bezier(.55,0,.3,1), opacity .9s ease .25s; }
.cw-stage { position: absolute; left: 50%; bottom: 0; height: 100vh; height: 100svh; aspect-ratio: 1296 / 1800; transform: translateX(-50%); transition: opacity .9s ease, transform 1.2s var(--cw-ease); }
.cw-portal { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 4; pointer-events: none; }
.cw-doorway { position: absolute; z-index: 1; overflow: hidden; background: linear-gradient(180deg, #fffaf0, #f6e9d3); }
.cw-aisle { position: absolute; left: -15%; top: -18%; width: 130%; height: 130%; object-fit: cover; object-position: 50% 52%; transform: scale(1.08); transition: transform 2.4s var(--cw-ease); }
.cw-doorway-bloom { position: absolute; inset: -20%; opacity: 0; background: radial-gradient(closest-side at 50% 45%, #ffffff, rgba(255,248,230,.85) 40%, rgba(255,240,210,0) 75%); transition: opacity .9s ease .15s; }
.cw-doorway-rays { position: absolute; inset: -30% -40% 0; background-size: cover; background-position: 50% 0; mix-blend-mode: screen; opacity: 0; transform: scale(.9); transition: opacity 1s ease .2s, transform 1.6s var(--cw-ease) .2s; }
.cw-motes i { position: absolute; bottom: -6px; border-radius: 50%; background: #fff7dc; box-shadow: 0 0 6px 2px rgba(255,236,180,.9); opacity: 0; animation: cw-mote linear infinite; }
@keyframes cw-mote { 0% { transform: translate3d(0,0,0); opacity: 0; } 15% { opacity: .9; } 85% { opacity: .7; } 100% { transform: translate3d(var(--dx), -60vh, 0); opacity: 0; } }

.cw-leaves { position: absolute; inset: 0; z-index: 2; perspective: 1500px; perspective-origin: 50.3% 77%; }
.cw-leaf { position: absolute; transform-style: preserve-3d; transition: transform 1.55s cubic-bezier(.65,0,.25,1); }
.cw-leaf.is-l { transform-origin: 0% 50%; }
.cw-leaf.is-r { transform-origin: 100% 50%; }
.cw-leaf img { display: block; width: 100%; height: 100%; }
.cw-leaf-shade { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease; }
.cw-leaf.is-l .cw-leaf-shade { background: linear-gradient(to right, rgba(30,15,5,.0), rgba(30,15,5,.55)); }
.cw-leaf.is-r .cw-leaf-shade { background: linear-gradient(to left, rgba(30,15,5,.0), rgba(30,15,5,.55)); }

.cw-seam { position: absolute; z-index: 3; left: 50.6%; top: 57.6%; width: .9%; height: 40%; pointer-events: none; border-radius: 4px; background: linear-gradient(180deg, rgba(255,246,214,0), rgba(255,246,214,.95) 18%, rgba(255,250,232,1) 50%, rgba(255,246,214,.9) 82%, rgba(255,246,214,0)); box-shadow: 0 0 14px 4px rgba(255,236,190,.65); opacity: .55; animation: cw-glass 3.2s ease-in-out infinite; }
.cw-gate.is-open .cw-seam, .cw-gate.is-enter .cw-seam { opacity: 0; animation: none; transition: opacity .3s; }
.cw-fan-glow { position: absolute; z-index: 5; pointer-events: none; mix-blend-mode: screen; border-radius: 50% 50% 0 0; background: radial-gradient(60% 80% at 50% 100%, rgba(255,246,220,.9), rgba(255,236,200,0) 75%); opacity: .12; animation: cw-glass 4.5s ease-in-out infinite; }
.cw-rose-glow { position: absolute; z-index: 5; left: 45.4%; top: 22.9%; width: 9.5%; aspect-ratio: 1; border-radius: 50%; pointer-events: none; mix-blend-mode: screen; background: radial-gradient(closest-side, rgba(255,250,230,.95), rgba(255,236,200,0)); opacity: .15; animation: cw-glass 4.5s ease-in-out 1.2s infinite; }
@keyframes cw-glass { 0%, 100% { opacity: .1; } 50% { opacity: .42; } }

.cw-stage-arch { position: absolute; z-index: 6; left: 13.5%; width: 73%; height: auto; top: 30.5%; pointer-events: none; transform-origin: 50% 0; }
.cw-stage-bq { position: absolute; z-index: 7; bottom: 0.5%; width: 27%; pointer-events: none; }
.cw-stage-bq img { width: 100%; height: auto; display: block; }
.cw-stage-bq.is-l { left: 5%; }
.cw-stage-bq.is-r { right: 4%; }
.cw-stage-bq.is-r img { transform: scaleX(-1); }
.cw-gate-doves { position: absolute; z-index: 9; left: 50.3%; top: 72%; width: 0; height: 0; pointer-events: none; }
.cw-dove { position: absolute; left: 0; top: 0; width: 120px; height: 90px; will-change: transform, opacity; }
.cw-dove img { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 6px 8px rgba(80,60,40,.18)); }
.cw-dove img:last-child { animation: cw-flap var(--flap, .2s) steps(1) infinite; }
.cw-dove img:first-child { animation: cw-flap var(--flap, .2s) steps(1) infinite reverse; }
@keyframes cw-flap { 0% { opacity: 1; } 50% { opacity: 0; } }
.cw-gate-petals { position: absolute; inset: 0; z-index: 12; pointer-events: none; overflow: hidden; }
.cw-petal { position: absolute; top: 0; will-change: transform, opacity; }

.cw-gate-pampas { position: absolute; bottom: -2svh; z-index: 8; width: min(36vw, 30svh); height: auto; pointer-events: none; }
.cw-gate-pampas.is-l { left: -6vw; }
.cw-gate-pampas.is-r { right: -6vw; transform: scaleX(-1); }

.cw-gate-copy { position: absolute; z-index: 10; left: 50%; top: calc(env(safe-area-inset-top, 0px) + 1.6svh); width: min(94vw, 560px); transform: translateX(-50%); text-align: center; padding: 1.4svh 18px 3svh; display: flex; flex-direction: column; align-items: center; gap: .55svh; pointer-events: none;
  background: radial-gradient(closest-side, rgba(251,247,239,.97) 0%, rgba(251,247,239,.9) 52%, rgba(251,247,239,.55) 78%, rgba(251,247,239,0) 100%); transition: opacity .5s ease, transform .7s var(--cw-ease); }
.cw-gate-dear { margin: 0; font: italic 500 clamp(15px, 2.3svh, 19px)/1.25 var(--wk-font-display); color: #6f655a; }
.cw-gate-dear b { font-style: normal; font-weight: 600; color: #a9646d; }
.cw-gate-eyebrow { margin: 0; font: 600 clamp(10.5px, 1.5svh, 13px)/1.2 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: #6f8a6c; }
.cw-gate-names { margin: 0; font: 400 clamp(38px, 6.4svh, 66px)/1.02 var(--wk-font-script); color: #3b342c; text-wrap: balance; text-shadow: 0 1px 0 rgba(255,255,255,.8), 0 0 18px rgba(255,250,238,.95); }
.cw-gate-names span { white-space: nowrap; }
.cw-gate-names i { font: italic 400 .52em/1 var(--wk-font-display); color: #b8975a; padding: 0 .1em; }
.cw-gate-date { margin: 0; font: 600 clamp(11px, 1.6svh, 14px)/1.2 var(--wk-font-caps); letter-spacing: .22em; color: #87683a; }
.cw-gate-hit { position: absolute; z-index: 11; left: 50%; top: 52svh; width: min(64vw, 30svh); height: 44svh; transform: translateX(-50%); background: transparent; border: 0; cursor: pointer; }
.cw-gate-cta-wrap { position: absolute; z-index: 14; left: 0; right: 0; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; align-items: center; gap: 8px; transition: opacity .35s ease, transform .4s ease; }
.cw-gate-cta { position: relative; display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 26px; border: 0; border-radius: 999px; font: 700 15.5px/1 var(--wk-font-sans); color: #fffdf8; cursor: pointer;
  background: linear-gradient(110deg, #7d9a7a, #6a8667 45%, #5b7659); box-shadow: 0 14px 30px -12px rgba(40,50,30,.7), inset 0 1px 0 rgba(255,255,255,.35); }
.cw-gate-cta:disabled { opacity: .85; cursor: progress; }
.cw-gate-cta:active { transform: scale(.97); }
.cw-gate-cta-ring { position: absolute; inset: -5px; border-radius: inherit; border: 1.5px solid rgba(255,253,240,.95); animation: cw-ring 2.2s ease-out infinite; pointer-events: none; }
@keyframes cw-ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(1.18, 1.45); opacity: 0; } }
.cw-gate-hint { margin: 0; padding: 4px 12px; border-radius: 999px; font: 600 12px/1.2 var(--wk-font-sans); color: #fffdf8; background: rgba(59,52,44,.42); }

/* entrance (after decode) */
.cw-gate.is-loading .cw-stage { opacity: 0; transform: translateX(-50%) scale(1.03); }
.cw-gate.is-loading .cw-gate-copy, .cw-gate.is-loading .cw-gate-pampas { opacity: 0; }
.cw-gate:not(.is-loading) .cw-gate-copy > * { animation: cw-up .9s var(--cw-ease) both; }
.cw-gate:not(.is-loading) .cw-gate-copy > *:nth-child(2) { animation-delay: .12s; }
.cw-gate:not(.is-loading) .cw-gate-copy > *:nth-child(3) { animation-delay: .24s; }
.cw-gate:not(.is-loading) .cw-gate-copy > *:nth-child(4) { animation-delay: .36s; }
.cw-gate:not(.is-loading) .cw-stage-arch { animation: cw-arch 1.3s var(--cw-ease) .15s both; }
.cw-gate:not(.is-loading) .cw-gate-pampas.is-l { animation: cw-in-l 1.4s var(--cw-ease) .2s both; }
.cw-gate:not(.is-loading) .cw-gate-pampas.is-r { animation: cw-in-r 1.4s var(--cw-ease) .3s both; }
.cw-gate:not(.is-loading) .cw-gate-cta-wrap { animation: cw-up .9s var(--cw-ease) .6s both; }
@keyframes cw-up { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cw-arch { from { transform: translateY(-6%) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cw-in-l { from { transform: translate3d(-30%, 10%, 0); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cw-in-r { from { transform: translate3d(30%, 10%, 0) scaleX(-1); opacity: 0; } to { transform: scaleX(-1); opacity: 1; } }

/* the tap */
.cw-gate.is-unlatch .cw-leaf.is-l { transform: rotateY(3deg); transition-duration: .08s; }
.cw-gate.is-unlatch .cw-leaf.is-r { transform: rotateY(-3deg); transition-duration: .08s; }
.cw-gate.is-open .cw-leaf.is-l, .cw-gate.is-enter .cw-leaf.is-l { transform: rotateY(100deg); }
.cw-gate.is-open .cw-leaf.is-r, .cw-gate.is-enter .cw-leaf.is-r { transform: rotateY(-100deg); transition-delay: .06s; }
.cw-gate.is-open .cw-leaf-shade, .cw-gate.is-enter .cw-leaf-shade { opacity: .75; }
.cw-gate.is-open .cw-doorway-bloom, .cw-gate.is-enter .cw-doorway-bloom { opacity: 1; }
.cw-gate.is-open .cw-doorway-rays, .cw-gate.is-enter .cw-doorway-rays { opacity: .85; transform: scale(1.08); }
.cw-gate.is-open .cw-aisle, .cw-gate.is-enter .cw-aisle { transform: scale(1.18); }
.cw-gate.is-open .cw-gate-glow, .cw-gate.is-enter .cw-gate-glow { opacity: .75; transform: translate(-50%,-50%) scale(1); }
.cw-gate.is-open .cw-fan-glow, .cw-gate.is-enter .cw-fan-glow, .cw-gate.is-open .cw-rose-glow, .cw-gate.is-enter .cw-rose-glow { animation: none; opacity: .7; transition: opacity .6s ease; }
.cw-gate.is-unlatch .cw-gate-cta-wrap, .cw-gate.is-open .cw-gate-cta-wrap, .cw-gate.is-enter .cw-gate-cta-wrap { opacity: 0; transform: translateY(10px); animation: none; pointer-events: none; }
.cw-gate.is-open .cw-gate-copy, .cw-gate.is-enter .cw-gate-copy { opacity: 0; transform: translateX(-50%) translateY(-12px); }
.cw-gate.is-open .cw-gate-copy > *, .cw-gate.is-enter .cw-gate-copy > * { animation: none; }
.cw-gate.is-enter .cw-gate-cam { transform: scale(2.6); opacity: 0; }
.cw-gate.is-enter { opacity: 0; transition-delay: .35s; pointer-events: none; }
.cw-gate.is-enter .cw-gate-pampas { opacity: 0; transition: opacity .5s; animation: none; }
.cw-gate.is-reduced, .cw-gate.is-reduced * { transition-duration: .4s !important; animation: none !important; }
.cw-gate.is-reduced.is-enter .cw-gate-cam { transform: none; }

/* wide screens: the chapel garden around the portal */
@media (min-aspect-ratio: 13/16) {
  .cw-stage { -webkit-mask-image: linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%); mask-image: linear-gradient(to right, transparent 0, #000 9%, #000 91%, transparent 100%); }
  .cw-gate-side { display: block; }
  .cw-gate-copy { top: calc(env(safe-area-inset-top, 0px) + 4svh); }
}
@media (min-aspect-ratio: 13/16) and (max-height: 520px) { .cw-gate-side-ivy { display: none; } }

/* ══ The page ═══════════════════════════════════════════════════════════════ */
.cw-page { position: relative; padding-bottom: 24px; container: cwpage / inline-size; }
.cw-sec { position: relative; padding: 64px 18px; max-width: 1140px; margin: 0 auto; }
.cw-head { text-align: center; margin: 0 auto 28px; max-width: 34rem; }
.cw-eyebrow { margin: 0 0 8px; font: 600 12px/1.3 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--cw-sage); }
.cw-h2 { margin: 0; font: 400 clamp(36px, 9vw, 54px)/1.08 var(--wk-font-script); color: var(--wk-ink); text-wrap: balance; }
.cw-h3 { margin: 0 0 12px; font: 600 22px/1.2 var(--wk-font-display); color: var(--wk-ink); text-align: center; }
.cw-rule { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 12px; color: var(--wk-gold); }
.cw-rule i { display: block; width: 56px; height: 1px; background: linear-gradient(90deg, transparent, var(--wk-gold)); }
.cw-rule i:last-child { transform: scaleX(-1); }

.cw-photo { position: relative; display: block; overflow: hidden; border-radius: var(--cw-r); background: var(--wk-placeholder, #efe6d6); box-shadow: 0 18px 40px -24px rgba(70,55,30,.55); }
.cw-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }

.cw-pill { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); color: var(--wk-ink); font: 600 14px/1 var(--wk-font-sans); text-decoration: none; cursor: pointer; box-shadow: 0 6px 16px -12px rgba(70,55,30,.55); transition: transform .2s ease, background .2s ease; white-space: nowrap; }
.cw-pill:active { transform: scale(.97); }
.cw-pill:hover { background: var(--wk-surface-2); }
.cw-pill.is-wa { color: #1f7a4a; }
.cw-pill.is-rec { color: #b3261e; border-color: rgba(179,38,30,.4); }
.cw-pill:disabled { opacity: .7; }
.cw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 52px; padding: 0 26px; border: 0; border-radius: 999px; font: 700 15.5px/1 var(--wk-font-sans); color: var(--wk-accent-ink); background: var(--wk-accent); text-decoration: none; cursor: pointer; box-shadow: 0 14px 28px -16px rgba(50,60,40,.75); }
.cw-btn:active { transform: scale(.98); }
.cw-btn-sm { min-height: 44px; padding: 0 18px; font-size: 14px; }
.cw-btn-ghost { background: var(--wk-surface-solid); color: var(--wk-ink); border: 1px solid var(--wk-border); }
.cw-btn.is-off { background: var(--wk-surface-2); color: var(--wk-muted); box-shadow: none; cursor: default; }
.cw-btn-wa { background: #1f8f55; color: #fff; }

/* floating section nav (after the doors) */
.cw-nav { position: fixed; z-index: 95; left: max(12px, env(safe-area-inset-left)); top: max(12px, env(safe-area-inset-top)); }
.cw-nav-btn { display: inline-flex; align-items: center; gap: 7px; min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(194,161,101,.55); background: rgba(255,253,248,.92); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); color: var(--wk-ink); font: 600 13.5px/1 var(--wk-font-sans); cursor: pointer; box-shadow: 0 10px 22px -14px rgba(80,60,30,.6); }
.cw-nav-list { list-style: none; margin: 8px 0 0; padding: 6px; width: 220px; max-height: 70svh; overflow: auto; border-radius: 18px; background: rgba(255,253,248,.97); border: 1px solid var(--wk-border); box-shadow: 0 24px 50px -24px rgba(70,55,30,.6); animation: cw-up .3s var(--cw-ease); }
.cw-nav-list button { width: 100%; min-height: 44px; padding: 0 14px; text-align: left; border: 0; border-radius: 12px; background: transparent; font: 500 15px/1.2 var(--wk-font-sans); color: var(--wk-ink); cursor: pointer; }
.cw-nav-list button:hover, .cw-nav-list button:focus-visible { background: var(--cw-sage-soft); }

/* ── Hero ──────────────────────────────────────────────────────────────── */
.cw-hero { position: relative; padding: calc(70px + env(safe-area-inset-top, 0px)) 18px 128px; overflow: hidden; background:
  radial-gradient(90% 60% at 50% 0%, rgba(255,253,247,.95), rgba(255,253,247,0) 70%),
  linear-gradient(180deg, var(--cw-wash), var(--wk-bg) 70%); }
.cw-hero-lanterns { position: absolute; top: -8px; right: -18px; width: 150px; pointer-events: none; opacity: .95; animation: cw-sway 6s ease-in-out infinite; transform-origin: 60% 0; }
.cw-hero-lanterns img { width: 100%; height: auto; display: block; }
@keyframes cw-sway { 0%, 100% { transform: rotate(-1.6deg); } 50% { transform: rotate(1.6deg); } }
.cw-hero-grid { position: relative; z-index: 2; display: grid; gap: 30px; max-width: 1120px; margin: 0 auto; align-items: center; }
.cw-hero-art { position: relative; width: min(84vw, 380px); margin: 0 auto; aspect-ratio: 1372 / 1600; }
.cw-hero-frame { position: absolute; left: 19%; right: 19%; top: 15%; bottom: 7%; display: block; }
.cw-hero-photo { position: absolute !important; inset: 0; aspect-ratio: auto !important; border: 5px solid #fffdf8; box-shadow: 0 26px 50px -26px rgba(70,55,30,.7) !important; }
.cw-hero-mono { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: var(--cw-r); background: linear-gradient(160deg, #fffdf8, var(--cw-rose-soft)); border: 1px solid var(--wk-border); font-family: var(--wk-font-script); color: var(--wk-ink); }
.cw-hero-mono b { font-weight: 400; font-size: 64px; line-height: 1; }
.cw-hero-mono i { font: italic 400 26px/1 var(--wk-font-display); color: var(--wk-gold); }
.cw-hero-drape { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; filter: drop-shadow(0 10px 18px rgba(80,60,40,.12)); }
.cw-hero-copy { text-align: center; display: flex; flex-direction: column; align-items: center; }
.cw-hero-dear { margin: 0 0 6px; font: italic 500 18px/1.3 var(--wk-font-display); color: var(--wk-muted); }
.cw-hero-dear b { font-style: normal; color: var(--cw-rose); }
.cw-hero-names { margin: 2px 0 4px; display: flex; flex-direction: column; align-items: center; gap: 0; font: 400 clamp(48px, 15vw, 92px)/1.32 var(--wk-font-script); color: var(--wk-ink); }
.cw-hero-names span { white-space: nowrap; max-width: 100%; }
.cw-hero-names i { font: italic 400 .42em/1.5 var(--wk-font-display); color: var(--wk-gold); }
.cw-hero-req { margin: 6px 0 14px; font: italic 500 19px/1.35 var(--wk-font-display); color: var(--wk-muted); }
.cw-hero-when { display: flex; flex-direction: column; align-items: center; gap: 4px; margin-bottom: 18px; }
.cw-hero-date { margin: 0; font: 600 14px/1.35 var(--wk-font-caps); letter-spacing: .14em; text-transform: uppercase; color: var(--cw-rose); }
.cw-hero-where { margin: 0; font: 600 19px/1.35 var(--wk-font-display); color: var(--wk-ink); text-wrap: balance; }
.cw-hero-addr { margin: 0; font: 400 15px/1.4 var(--wk-font-sans); color: var(--wk-muted); }
.cw-hero-count { margin-bottom: 18px; max-width: 100%; }
.cw-share { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.cw-hero-pampas { position: absolute; bottom: -24px; width: min(30vw, 230px); height: auto; z-index: 1; pointer-events: none; opacity: .85; }
.cw-hero-pampas.is-l { left: -34px; }
.cw-hero-pampas.is-r { right: -34px; transform: scaleX(-1); }

/* ── Scripture ─────────────────────────────────────────────────────────── */
.cw-verse { text-align: center; max-width: 760px; overflow: hidden; }
.cw-verse-swirl { position: absolute; top: 10px; width: 260px; height: auto; opacity: .22; pointer-events: none; }
.cw-verse-swirl.is-l { left: -120px; transform: scaleX(-1); }
.cw-verse-swirl.is-r { right: -120px; }
.cw-verse-rose { width: 92px; height: 92px; margin: 0 auto 20px; border-radius: 50%; padding: 6px; background: linear-gradient(145deg, #f3e9d6, #fffdf8); box-shadow: 0 0 0 1px rgba(194,161,101,.6), 0 18px 34px -18px rgba(80,50,30,.55), 0 0 40px rgba(255,214,160,.55); }
.cw-verse-rose img { width: 100%; height: 100%; border-radius: 50%; display: block; animation: cw-turn 60s linear infinite; }
@keyframes cw-turn { to { transform: rotate(360deg); } }
.cw-verse-q { margin: 0; }
.cw-verse-q p { margin: 0 auto; max-width: 30rem; font: italic 500 clamp(21px, 5.6vw, 28px)/1.45 var(--wk-font-display); color: var(--wk-ink); text-wrap: pretty; }
.cw-verse-q cite { display: block; margin-top: 14px; font: 600 12.5px/1.3 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; font-style: normal; color: var(--wk-gold-ink); }
.cw-verse-alt { margin: 16px auto 0; max-width: 30rem; font: 500 17px/1.7 var(--wk-font-display), "Noto Serif Malayalam", "Noto Sans Malayalam", "Noto Serif Tamil", "Noto Sans Tamil", serif; color: var(--wk-muted); }

/* ── Invitation + families ─────────────────────────────────────────────── */
.cw-invite { max-width: 980px; }
.cw-invite-card { position: relative; max-width: 640px; margin: 0 auto; padding: 38px 24px 64px; border-radius: 26px; text-align: center; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 30px 60px -36px rgba(70,55,30,.55); overflow: hidden; isolation: isolate; }
.cw-invite-card::before { content: ""; position: absolute; inset: 10px; border-radius: 18px; border: 1px solid rgba(194,161,101,.45); pointer-events: none; }
.cw-invite-card::after { content: ""; position: absolute; inset: 0; z-index: -1; background-image: var(--wk-paper); background-size: 600px; opacity: .45; mix-blend-mode: multiply; }
.cw-invite-peony { position: absolute; pointer-events: none; z-index: -1; height: auto; }
.cw-invite-peony.is-tl { top: -46px; left: -50px; width: 150px; opacity: .55; }
.cw-invite-peony.is-br { bottom: -58px; right: -50px; width: 128px; opacity: .85; }
.cw-invite-text p { margin: 0 auto 14px; max-width: 32rem; font: 500 19px/1.6 var(--wk-font-display); color: var(--wk-ink); }
.cw-invite-text p:first-child::first-letter { font: 400 2.4em/1 var(--wk-font-script); color: var(--cw-rose); padding-right: 2px; }
.cw-invite-alt { margin: 18px auto 0; padding-top: 16px; border-top: 1px dashed rgba(194,161,101,.55); max-width: 30rem; }
.cw-invite-alt-k { margin: 0 0 6px; font: 600 11px/1.3 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--cw-sage); }
.cw-invite-alt p:not(.cw-invite-alt-k) { margin: 0 0 8px; font: 500 17px/1.75 var(--wk-font-display), "Noto Serif Malayalam", "Noto Sans Malayalam", "Noto Serif Tamil", "Noto Sans Tamil", var(--wk-font-deva), serif; color: var(--wk-ink); }
.cw-invite-bless { margin: 18px 0 0; font: italic 500 16px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.cw-invite-bless span { display: block; font: 600 11px/1.4 var(--wk-font-caps); font-style: normal; letter-spacing: .2em; text-transform: uppercase; color: var(--cw-sage); margin-bottom: 4px; }
.cw-fams { display: grid; gap: 14px; max-width: 760px; margin: 22px auto 0; }
.cw-fam { padding: 20px 18px; text-align: center; border-radius: var(--cw-r); background: var(--cw-sage-soft); border: 1px solid rgba(127,154,124,.25); }
.cw-fam-names { margin: 0; font: 600 20px/1.35 var(--wk-font-display); color: var(--wk-ink); }
.cw-fam-grand { margin: 6px 0 0; font: 400 15px/1.5 var(--wk-font-sans); color: var(--wk-muted); }

/* ── Couple ────────────────────────────────────────────────────────────── */
.cw-couple-grid { display: grid; gap: 22px; max-width: 820px; margin: 0 auto; }
.cw-person { text-align: center; padding: 22px 18px 24px; border-radius: 24px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 22px 44px -32px rgba(70,55,30,.6); }
.cw-person-photo { width: min(62vw, 240px); margin: 0 auto 14px; }
.cw-person-mono { display: grid; place-items: center; width: 96px; height: 96px; margin: 0 auto 14px; border-radius: 28px; background: linear-gradient(150deg, var(--cw-rose-soft), #fffdf8); border: 1px solid var(--wk-border); font: 400 54px/1 var(--wk-font-script); color: var(--cw-rose); }
.cw-person-name { margin: 0; font: 400 40px/1.1 var(--wk-font-script); color: var(--wk-ink); }
.cw-person-line { margin: 8px auto 0; max-width: 26rem; font: 400 16px/1.6 var(--wk-font-sans); color: var(--wk-muted); }

/* ── Order of service ──────────────────────────────────────────────────── */
.cw-service { max-width: 760px; padding-top: calc(min(700px, 112vw) * .3 + 34px); }
.cw-service-ivy { position: absolute; top: 0; left: 50%; width: min(700px, 112vw); height: auto; transform: translateX(-50%); pointer-events: none; opacity: .9;
  -webkit-mask-image: linear-gradient(to bottom, #000 30%, transparent 78%), linear-gradient(to right, transparent, #000 14%, #000 86%, transparent); -webkit-mask-composite: source-in; mask-image: linear-gradient(to bottom, #000 30%, transparent 78%), linear-gradient(to right, transparent, #000 14%, #000 86%, transparent); mask-composite: intersect; }
.cw-service-list { list-style: none; margin: 0 auto; padding: 22px 18px; max-width: 560px; border-radius: 24px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 22px 44px -32px rgba(70,55,30,.6); position: relative; }
.cw-service-row { position: relative; display: grid; grid-template-columns: 74px 36px 1fr; align-items: start; gap: 10px; padding: 10px 0; }
.cw-service-row + .cw-service-row::before { content: ""; position: absolute; left: 101px; top: -14px; height: 26px; width: 1px; background: linear-gradient(var(--wk-gold), transparent); opacity: .6; }
.cw-service-time { padding-top: 8px; text-align: right; font: 600 14px/1.2 var(--wk-font-sans); color: var(--wk-gold-ink); white-space: nowrap; }
.cw-service-dot { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: var(--cw-sage-soft); color: var(--cw-sage); border: 1px solid rgba(127,154,124,.35); }
.cw-service-what { padding-top: 6px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cw-service-what b { font: 600 18px/1.3 var(--wk-font-display); color: var(--wk-ink); }
.cw-service-what small { font: 400 14.5px/1.45 var(--wk-font-sans); color: var(--wk-muted); }

/* ── Story ─────────────────────────────────────────────────────────────── */
.cw-story-list { list-style: none; margin: 0 auto; padding: 0; max-width: 960px; display: grid; gap: 34px; position: relative; }
.cw-chapter { display: grid; gap: 16px; align-items: center; }
.cw-chapter-art .cw-photo { border: 5px solid #fffdf8; }
.cw-chapter-copy { text-align: center; }
.cw-chapter-when { margin: 0 0 6px; display: inline-block; padding: 5px 12px; border-radius: 999px; background: var(--cw-rose-soft); font: 600 12px/1.2 var(--wk-font-caps); letter-spacing: .18em; color: var(--cw-rose); }
.cw-chapter-title { margin: 0 0 8px; font: 600 25px/1.25 var(--wk-font-display); color: var(--wk-ink); }
.cw-chapter-line { margin: 0 auto; max-width: 30rem; font: 400 16.5px/1.65 var(--wk-font-sans); color: var(--wk-muted); }

/* ── Events ────────────────────────────────────────────────────────────── */
.cw-ev-grid { list-style: none; margin: 0 auto; padding: 0; display: grid; gap: 18px; max-width: 1120px; }
.cw-ev { position: relative; padding: 20px 18px 18px; border-radius: 24px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 22px 44px -32px rgba(70,55,30,.6); display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
.cw-ev::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 5px; background: linear-gradient(90deg, var(--cw-sage), var(--wk-gold), var(--cw-rose)); opacity: .75; }
.cw-ev-top { display: flex; gap: 14px; align-items: center; }
.cw-ev-leaf { flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 66px; height: 74px; border-radius: 16px; background: linear-gradient(180deg, var(--cw-rose-soft), #fffdf8); border: 1px solid rgba(169,100,109,.25); color: var(--wk-ink); }
.cw-ev-leaf { gap: 1px; height: 78px; }
.cw-ev-leaf small { font: 600 10.5px/1.3 var(--wk-font-caps); letter-spacing: .12em; text-transform: uppercase; color: var(--cw-rose); }
.cw-ev-leaf b { font: 600 27px/1.2 var(--wk-font-display); }
.cw-ev-leaf.is-tba b { font-size: 26px; }
.cw-ev-head { min-width: 0; }
.cw-ev-title { margin: 0 0 4px; font: 600 23px/1.2 var(--wk-font-display); color: var(--wk-ink); overflow-wrap: anywhere; }
.cw-ev-time { margin: 0; display: flex; align-items: center; gap: 6px; font: 600 15px/1.3 var(--wk-font-sans); color: var(--wk-gold-ink); }
.cw-ev-venue, .cw-ev-dress { margin: 0; display: flex; gap: 9px; align-items: flex-start; font: 400 15.5px/1.45 var(--wk-font-sans); color: var(--wk-ink); }
.cw-ev-venue > svg, .cw-ev-dress > svg { flex: none; margin-top: 2px; color: var(--cw-sage); }
.cw-ev-venue span { display: flex; flex-direction: column; min-width: 0; }
.cw-ev-venue b { font-weight: 600; }
.cw-ev-venue small { font-size: 14px; color: var(--wk-muted); }
.cw-ev-dress small { display: inline; font: 600 11px/1 var(--wk-font-caps); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-muted); margin-right: 4px; }
.cw-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), 0 2px 6px -2px rgba(0,0,0,.25); }
.cw-ev-note { margin: 0; padding: 10px 12px; border-radius: 14px; background: var(--wk-surface-2); font: 400 14.5px/1.5 var(--wk-font-sans); color: var(--wk-muted); }
.cw-ev-btns { display: grid; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)); gap: 8px; margin-top: auto; padding-top: 4px; }
.cw-ev-btns .cw-pill { padding: 0 10px; font-size: 13.5px; min-width: 0; }
.cw-ev-all { display: flex; justify-content: center; margin-top: 22px; }

/* ── Church ────────────────────────────────────────────────────────────── */
.cw-church { max-width: 1000px; overflow: hidden; }
.cw-church-wrap { position: relative; display: flex; justify-content: center; align-items: flex-end; gap: 0; }
.cw-church-card { position: relative; z-index: 2; width: 100%; max-width: 560px; }
.cw-church-card .wk-card { border-radius: 24px; }
.cw-church-col { display: none; width: auto; height: 420px; flex: none; opacity: .95; }
.cw-church-col.is-r { transform: scaleX(-1); }
.cw-church-rail { display: block; width: min(820px, 120%); height: auto; margin: -10px auto 0; position: relative; left: 50%; transform: translateX(-50%); opacity: .55; -webkit-mask-image: linear-gradient(to right, transparent, #000 15%, #000 85%, transparent); mask-image: linear-gradient(to right, transparent, #000 15%, #000 85%, transparent); }

/* ── Film ──────────────────────────────────────────────────────────────── */
.cw-film { position: relative; max-width: 760px; margin: 0 auto; aspect-ratio: 16 / 9; border-radius: 22px; overflow: hidden; background: #2d2a26; box-shadow: 0 30px 60px -34px rgba(40,30,20,.75); border: 5px solid #fffdf8; }
.cw-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.cw-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: none; }
.cw-film-poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cw-film-play { position: absolute; left: 50%; top: 50%; display: grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; transform: translate(-50%,-50%); color: var(--wk-accent); background: rgba(255,253,248,.94); box-shadow: 0 14px 30px -12px rgba(0,0,0,.6); }

/* ── Gallery ───────────────────────────────────────────────────────────── */
.cw-gallery-wrap { max-width: 1100px; margin: 0 auto; }

/* ── Guest info ────────────────────────────────────────────────────────── */
.cw-info { max-width: 980px; }
.cw-know { list-style: none; margin: 0 auto 22px; padding: 0; display: grid; gap: 14px; max-width: 900px; }
.cw-know-i { padding: 18px 18px; border-radius: 20px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); }
.cw-know-i.is-travel { background: var(--cw-sage-soft); }
.cw-know-h { margin: 0 0 4px; font: 600 12px/1.3 var(--wk-font-caps); letter-spacing: .18em; text-transform: uppercase; color: var(--cw-sage); }
.cw-know-t { margin: 0; font: 400 16px/1.6 var(--wk-font-sans); color: var(--wk-ink); }
.cw-live { display: flex; align-items: center; gap: 12px; max-width: 640px; margin: 0 auto 22px; padding: 14px 16px; border-radius: 20px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); flex-wrap: wrap; }
.cw-live-dot { width: 12px; height: 12px; border-radius: 50%; background: #c9bfae; flex: none; }
.cw-live-dot.is-on { background: #d6453d; box-shadow: 0 0 0 0 rgba(214,69,61,.6); animation: cw-pulse 1.6s ease-out infinite; }
@keyframes cw-pulse { to { box-shadow: 0 0 0 12px rgba(214,69,61,0); } }
.cw-live-copy { flex: 1 1 180px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cw-live-copy b { font: 600 17px/1.3 var(--wk-font-display); }
.cw-live-copy small { font: 400 14px/1.4 var(--wk-font-sans); color: var(--wk-muted); }
.cw-contacts { max-width: 640px; margin: 0 auto 22px; padding: 20px 16px; border-radius: 24px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); }
.cw-contact-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.cw-contact { display: grid; grid-template-columns: 46px 1fr; gap: 12px; align-items: center; padding: 10px; border-radius: 18px; background: var(--wk-surface-2); }
.cw-contact-ini { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; background: var(--cw-rose-soft); color: var(--cw-rose); font: 600 20px/1 var(--wk-font-display); }
.cw-contact-who { display: flex; flex-direction: column; min-width: 0; }
.cw-contact-who b { font: 600 17px/1.25 var(--wk-font-display); }
.cw-contact-who small { font: 400 14px/1.3 var(--wk-font-sans); color: var(--wk-muted); }
.cw-contact-btns { grid-column: 1 / -1; display: flex; gap: 8px; }
.cw-contact-btns .cw-pill { flex: 1; }
.cw-gift { max-width: 560px; margin: 0 auto; padding: 22px 18px; text-align: center; border-radius: 24px; background: linear-gradient(160deg, #fffdf8, var(--cw-rose-soft)); border: 1px solid var(--wk-border); }
.cw-gift-p { margin: 0 auto 12px; max-width: 26rem; font: 400 15.5px/1.6 var(--wk-font-sans); color: var(--wk-muted); }
.cw-gift-id { margin: 0 0 14px; display: flex; flex-direction: column; gap: 2px; }
.cw-gift-id b { font: 600 19px/1.3 var(--wk-font-sans); overflow-wrap: anywhere; }
.cw-gift-id small { color: var(--wk-muted); font-size: 14px; }
.cw-gift-btns { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
@media (pointer: fine) { .cw-gift-pay { display: none; } }
.cw-root.is-embedded .cw-hero { padding-top: 40px; }

/* ── RSVP ──────────────────────────────────────────────────────────────── */
.cw-rsvp { max-width: 720px; }
.cw-rsvp-card { position: relative; }
.cw-rsvp-card .wk-rsvp, .cw-rsvp-card > div:not(.cw-rsvp-bq) { position: relative; z-index: 1; }
.cw-rsvp-bq { position: absolute; z-index: 2; top: -58px; right: -22px; width: 150px; height: auto; pointer-events: none; transform: scaleX(-1) rotate(-6deg); }

/* ── Blessings ─────────────────────────────────────────────────────────── */
.cw-bless { max-width: 1060px; }
.cw-bless-form { max-width: 560px; margin: 0 auto 26px; padding: 22px 18px; border-radius: 24px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 22px 44px -32px rgba(70,55,30,.6); display: flex; flex-direction: column; gap: 8px; }
.cw-label { font: 600 14px/1.3 var(--wk-font-sans); color: var(--wk-ink); margin-top: 6px; }
.cw-input { width: 100%; min-height: 50px; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--wk-border); background: var(--wk-surface-2); color: var(--wk-ink); font: 400 16px/1.4 var(--wk-font-sans); scroll-margin-bottom: 120px; }
.cw-input:focus { outline: 2px solid var(--wk-gold); outline-offset: 1px; background: #fffdf8; }
.cw-textarea { min-height: 96px; resize: vertical; }
.cw-bless-voice { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 6px; }
.cw-bless-vl { display: inline-flex; align-items: center; gap: 6px; font: 500 13.5px/1.3 var(--wk-font-sans); color: var(--wk-muted); }
.cw-x { min-width: 32px; min-height: 32px; border-radius: 50%; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); cursor: pointer; font-size: 18px; line-height: 1; }
.cw-err { margin: 4px 0 0; color: #b3261e; font: 500 14px/1.4 var(--wk-font-sans); }
.cw-bless-send { margin-top: 10px; align-self: stretch; }
.cw-bless-done { display: flex; gap: 14px; align-items: center; justify-content: center; text-align: left; padding: 6px 0; }
.cw-bless-done span { font-size: 36px; }
.cw-bless-done p { margin: 0; font: 400 16px/1.5 var(--wk-font-sans); color: var(--wk-muted); }
.cw-bless-done b { font: 600 19px/1.3 var(--wk-font-display); color: var(--wk-ink); }
.cw-wall { list-style: none; margin: 0 auto; padding: 0; columns: 1; column-gap: 16px; max-width: 1060px; }
.cw-wish { break-inside: avoid; position: relative; margin: 0 0 16px; padding: 22px 18px 16px; border-radius: 20px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); }
.cw-wish:nth-child(3n+2) { background: var(--cw-sage-soft); }
.cw-wish:nth-child(3n+3) { background: var(--cw-rose-soft); }
.cw-wish-q { position: absolute; top: 2px; left: 14px; font: 400 54px/1 var(--wk-font-display); color: var(--wk-gold); opacity: .55; }
.cw-wish-m { margin: 8px 0 10px; font: italic 500 17.5px/1.55 var(--wk-font-display); color: var(--wk-ink); overflow-wrap: anywhere; }
.cw-wish-audio { width: 100%; height: 40px; margin: 2px 0 10px; }
.cw-wish-n { margin: 0; text-align: right; font: 600 14px/1.3 var(--wk-font-sans); color: var(--wk-muted); }

/* ── Finale ────────────────────────────────────────────────────────────── */
.cw-finale { position: relative; padding: 150px 18px 70px; text-align: center; overflow: hidden; background: linear-gradient(180deg, var(--wk-bg), var(--cw-wash)); }
.cw-finale-arch { position: absolute; top: 0; left: 50%; width: min(760px, 150vw); height: auto; transform: translateX(-50%); pointer-events: none; opacity: .95; }
.cw-finale-seal { position: relative; width: 120px; height: 120px; margin: 0 auto 22px; padding: 7px; border-radius: 50%; background: linear-gradient(145deg, #f3e9d6, #fffdf8); box-shadow: 0 0 0 1px rgba(194,161,101,.6), 0 22px 40px -20px rgba(80,50,30,.6), 0 0 60px rgba(255,214,160,.6); }
.cw-finale-seal img { width: 100%; height: 100%; border-radius: 50%; display: block; animation: cw-turn 60s linear infinite; }
.cw-finale-quote { margin: 0 auto 10px; max-width: 26rem; font: italic 500 21px/1.45 var(--wk-font-display); color: var(--wk-muted); }
.cw-finale-names { margin: 0; font: 400 clamp(46px, 12vw, 76px)/1.1 var(--wk-font-script); color: var(--wk-ink); }
.cw-finale-names i { font: italic 400 .5em/1 var(--wk-font-display); color: var(--wk-gold); }
.cw-finale-close { margin: 10px auto 0; max-width: 28rem; font: 500 17px/1.5 var(--wk-font-display); color: var(--wk-ink); }
.cw-finale-tag { margin: 8px 0 22px; font: 600 15px/1.3 var(--wk-font-sans); letter-spacing: .04em; color: var(--cw-rose); }
.cw-share-finale { flex-direction: column; align-items: center; gap: 14px; max-width: 560px; margin: 8px auto 0; }
.cw-share-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.cw-create { display: inline-flex; align-items: center; min-height: 44px; margin-top: 28px; padding: 0 18px; border-radius: 999px; font: 600 14px/1 var(--wk-font-sans); color: var(--wk-accent); text-decoration: none; border: 1px dashed rgba(111,138,108,.6); position: relative; z-index: 2; }
.cw-finale-pampas { position: absolute; left: 50%; bottom: -60px; width: min(900px, 160vw); height: auto; transform: translateX(-50%); opacity: .3; pointer-events: none; }
.cw-finale > *:not(.cw-finale-arch):not(.cw-finale-pampas) { position: relative; z-index: 1; }

.cw-qr-scrim { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 20px; background: rgba(40,34,28,.55); }
.cw-qr { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 22px; border-radius: 24px; background: #fffdf8; box-shadow: 0 30px 60px -20px rgba(0,0,0,.5); font: 500 15px/1.4 var(--wk-font-sans); color: #3b342c; }
.cw-qr p { margin: 0; }

/* ══ Tablet ════════════════════════════════════════════════════════════════ */
@container cwpage (min-width: 700px) {
  .cw-sec { padding: 84px 32px; }
  .cw-fams { grid-template-columns: 1fr 1fr; }
  .cw-fams.is-one { grid-template-columns: minmax(0, 420px); justify-content: center; }
  .cw-couple-grid { grid-template-columns: 1fr 1fr; }
  .cw-ev-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cw-know { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cw-wall { columns: 2; }
  .cw-chapter { grid-template-columns: 1fr 1fr; gap: 36px; }
  .cw-chapter.is-alt .cw-chapter-art { order: 2; }
  .cw-chapter.no-photo { grid-template-columns: 1fr; }
  .cw-chapter-copy { text-align: left; }
  .cw-chapter.no-photo .cw-chapter-copy { text-align: center; }
  .cw-contact { grid-template-columns: 46px 1fr auto; }
  .cw-contact-btns { grid-column: auto; }
  .cw-contact-btns .cw-pill { flex: none; }
  .cw-invite-card { padding: 50px 54px 44px; }
  .cw-hero-lanterns { width: 200px; }
  .cw-church-col { display: block; height: 380px; margin: 0 -20px; }
}

/* ══ Desktop ═══════════════════════════════════════════════════════════════ */
@container cwpage (min-width: 1024px) {
  .cw-hero { padding: 96px 40px 110px; min-height: 100svh; display: flex; align-items: center; }
  .cw-hero-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 56px; width: 100%; }
  .cw-hero-art { width: min(42vw, 520px); }
  .cw-hero-names { font-size: clamp(72px, 7vw, 110px); }
  .cw-hero-pampas { width: 300px; }
  .cw-ev-grid.n3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cw-wall { columns: 3; }
  .cw-know { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cw-church-col { height: 440px; }
  .cw-verse-swirl { width: 360px; }
  .cw-verse-swirl.is-l { left: -60px; }
  .cw-verse-swirl.is-r { right: -60px; }
}
@media (min-width: 1024px) { .cw-nav { top: 18px; left: 18px; } }

@container cwpage (max-width: 380px) {
  .cw-sec { padding-left: 14px; padding-right: 14px; }
  .cw-service-row { grid-template-columns: 62px 32px 1fr; gap: 8px; }
  .cw-service-row + .cw-service-row::before { left: 85px; }
  .cw-service-dot { width: 32px; height: 32px; }
  .cw-ev-btns .cw-pill { font-size: 13px; padding: 0 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .cw-root *, .cw-root *::before, .cw-root *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
}
`;
