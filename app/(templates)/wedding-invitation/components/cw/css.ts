// ─── Classic (Gulabi Jharokha): the guest page's stylesheet (cw- prefix) ─────
// Light themes only (blush by default, champagne, powder): the kit's --wk-*
// tokens colour the paper, ink and foil; the jharokha and the dawn keep their
// own blush and ivory. Every animation is transform/opacity. Phones first
// (360px), then tablets (≥ 700), laptops (≥ 1024) and wide desktops (≥ 1440).
// Every photo frame and card is a rectangle with four equal rounded corners.

export const CW_CSS = `
.cw-root { --cw-ease: cubic-bezier(.22,.7,.2,1); --cw-rose: var(--wk-accent); --cw-rg: color-mix(in srgb, var(--wk-gold) 70%, var(--wk-accent)); --cw-line: color-mix(in srgb, var(--wk-gold) 55%, transparent); overflow-x: clip; scroll-padding-bottom: 96px; }
.cw-root .wk-section { position: relative; }
.cw-root img { -webkit-user-drag: none; }
.cw-root.is-hi .wk-eyebrow, .cw-root.is-hi .wk-cd-label { letter-spacing: .02em; }

/* ── buttons ───────────────────────────────────────────────────────────── */
.cw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 0 20px; border-radius: 999px; font: 600 14.5px/1.1 var(--wk-font-sans); letter-spacing: .01em; cursor: pointer; text-decoration: none; border: 0; transition: transform .18s var(--cw-ease), box-shadow .25s ease, background-color .25s ease; -webkit-tap-highlight-color: transparent; white-space: nowrap; }
.cw-btn:active { transform: scale(.97); }
.cw-btn:disabled { opacity: .5; cursor: default; }
.cw-btn:focus-visible, .cw-round:focus-visible, .cw-gate-cta:focus-visible, .cw-replay:focus-visible { outline: 2px solid var(--wk-accent); outline-offset: 3px; }
.cw-btn-rose { color: var(--wk-accent-ink); background: linear-gradient(115deg, color-mix(in srgb, var(--wk-accent) 82%, #3a0a18), var(--wk-accent) 48%, color-mix(in srgb, var(--wk-accent) 72%, #f4b8a6)); box-shadow: 0 12px 26px -14px color-mix(in srgb, var(--wk-accent) 80%, #000), inset 0 1px 0 rgba(255,255,255,.35); }
.cw-btn-ghost { color: var(--wk-ink); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1.5px var(--cw-line); }
.cw-btn-ghost:hover { box-shadow: inset 0 0 0 1.5px var(--wk-gold); }
.cw-btn-wa { color: #fff; background: #1FA855; box-shadow: 0 10px 22px -14px rgba(20,120,60,.8); }
.cw-btn-sm { min-height: 42px; padding: 0 14px; font-size: 13.5px; gap: 6px; }
.cw-btn-icon { width: 46px; padding: 0; }
.cw-round { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: var(--wk-ink); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1.5px var(--cw-line); transition: transform .18s ease; }
.cw-round:active { transform: scale(.94); }
.cw-round.is-wa { color: #fff; background: #1FA855; box-shadow: none; }

/* ── language toggle + the music chip ──────────────────────────────────── */
.cw-lang { position: fixed; top: max(12px, env(safe-area-inset-top)); left: 12px; z-index: 61; display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border-radius: 999px; background: rgba(255,248,246,.9); box-shadow: 0 8px 22px -12px rgba(110,40,58,.55), inset 0 0 0 1px rgba(201,160,99,.55); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.cw-lang-pill { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: linear-gradient(115deg, #8E3B52, #B4566E 55%, #CF8987); box-shadow: 0 6px 14px -8px rgba(110,40,58,.8), inset 0 1px 0 rgba(255,255,255,.3); transition: transform .45s cubic-bezier(.34,1.4,.64,1); }
.cw-lang.is-hi .cw-lang-pill { transform: translateX(100%); }
.cw-lang button { position: relative; z-index: 1; min-width: 52px; min-height: 40px; padding: 0 10px; border: 0; border-radius: 999px; background: none; font: 700 13px/1 var(--wk-font-sans); letter-spacing: .04em; color: #86606A; cursor: pointer; transition: color .3s ease; -webkit-tap-highlight-color: transparent; }
.cw-lang button[lang=hi] { font: 600 14.5px/1 var(--wk-font-deva); letter-spacing: 0; }
.cw-lang button[aria-pressed=true] { color: #FFF7F5; }
.cw-lang button:focus-visible { outline: 2px solid #9E4560; outline-offset: 2px; }
.cw-hear { position: fixed; left: 50%; bottom: max(18px, env(safe-area-inset-bottom)); z-index: 59; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 20px; border: 0; border-radius: 999px; font: 600 14px/1 var(--wk-font-sans); color: #fff; background: linear-gradient(115deg, #8E3B52, #B4566E 50%, #D08A8A); box-shadow: 0 12px 26px -12px rgba(110,40,58,.7); animation: cw-up .6s var(--cw-ease) both; cursor: pointer; }

/* ══ THE JHAROKHA (opening) ═══════════════════════════════════════════════ */
.cw-gate { position: fixed; inset: 0; z-index: 60; overflow: hidden; background: linear-gradient(180deg, #FCE7E6 0%, #F8D9D9 48%, #F3CACA 100%); transition: opacity .7s ease; color: #5A2A36; }
.cw-gate-sky { position: absolute; inset: 0; }
.cw-gate-sky-img { position: absolute; inset: -6%; width: 112%; height: 112%; object-fit: cover; object-position: 50% 62%; filter: blur(16px) saturate(1.08); opacity: .8; }
.cw-gate-sky::after { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 45% at 50% 42%, rgba(255,246,240,.75), rgba(255,246,240,0) 70%); }
.cw-gate-motes { position: absolute; inset: 0; pointer-events: none; }
.cw-gate-motes img { position: absolute; top: -40px; opacity: 0; animation: cw-mote linear infinite; }
@keyframes cw-mote { 0% { transform: translate3d(0,0,0) rotate(0); opacity: 0; } 10% { opacity: .75; } 85% { opacity: .6; } 100% { transform: translate3d(var(--dx), 110vh, 0) rotate(var(--rot)); opacity: 0; } }
.cw-gate-tree { position: absolute; bottom: -2%; z-index: 1; height: min(56svh, 520px); pointer-events: none; transition: transform 1s var(--cw-ease), opacity .8s ease; }
.cw-gate-tree img { display: block; height: 100%; width: auto; filter: drop-shadow(0 10px 18px rgba(90,40,40,.18)); }
.cw-gate-tree.is-l { left: -16vw; transform-origin: 0 100%; }
.cw-gate-tree.is-r { right: -16vw; transform-origin: 100% 100%; }
.cw-pampas { position: absolute; bottom: -2%; z-index: 1; width: clamp(120px, 34vw, 300px); pointer-events: none; }
.cw-pampas img { display: block; width: 100%; height: auto; }
.cw-pampas.is-l { left: -6%; }
.cw-pampas.is-r { right: -6%; }
.cw-pampas.is-r img { transform: scaleX(-1); }
.cw-gate.is-loading .cw-pampas { opacity: 0; }
.cw-gate:not(.is-loading) .cw-pampas.is-l { animation: cw-grow-l 1.6s var(--cw-ease) .3s both; }
.cw-gate:not(.is-loading) .cw-pampas.is-r { animation: cw-grow-r 1.6s var(--cw-ease) .4s both; }
.cw-gate.is-push .cw-pampas { opacity: 0; transition: opacity .6s ease; }
.cw-gate-col { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(8px, 1.8svh, 18px); padding: max(58px, calc(env(safe-area-inset-top) + 50px)) 16px max(18px, calc(env(safe-area-inset-bottom) + 14px)); }
.cw-gate-top { margin: 0; min-height: 22px; max-width: min(320px, 82vw); text-align: center; font: italic 500 clamp(15px, 2.2svh, 19px)/1.3 var(--wk-font-display); color: #8E3B52; text-wrap: balance; transition: opacity .4s ease; }
.cw-gate-top [lang=hi] { font-style: normal; font-family: var(--wk-font-deva); letter-spacing: .04em; color: #A0566A; }
.cw-gate-dear { font-style: normal; font-weight: 600; color: #7A2E44; }
.cw-cam { flex: 0 1 auto; height: clamp(280px, calc(100svh - 318px), 760px); aspect-ratio: 908 / 1800; transform-origin: 50% 50%; transition: transform 1.1s cubic-bezier(.6,0,.3,1), opacity .9s ease; }
.cw-stage { position: relative; width: 100%; height: 100%; perspective: 1400px; perspective-origin: 50% 48%; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.cw-aperture { position: absolute; z-index: 0; overflow: hidden; background: #F9D6D8; }
.cw-ap-dawn { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 58%; transform: scale(1.35); opacity: .62; transition: opacity .45s ease, transform 2.2s var(--cw-ease); }
.cw-ap-bloom { position: absolute; left: 50%; top: 46%; width: 190%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%,-50%) scale(.55); opacity: .35; background: radial-gradient(closest-side, #FFFFFF 0%, #FFE9EC 28%, rgba(255,217,223,.7) 55%, rgba(255,217,223,0) 100%); transition: transform 1.8s var(--cw-ease), opacity 1s ease; }
.cw-ap-rays { position: absolute; left: -30%; top: -10%; width: 160%; height: auto; opacity: 0; transform: scale(.9); mix-blend-mode: screen; transition: opacity 1.1s ease .12s, transform 2s var(--cw-ease) .12s; }
.cw-ap-names { position: absolute; left: 4%; right: 4%; top: 30%; display: flex; flex-direction: column; align-items: center; text-align: center; color: #7A2E44; opacity: 0; transform: translateY(24px); transition: opacity .7s ease .8s, transform 1s var(--cw-ease) .8s; container-type: inline-size; }
.cw-ap-names b { font: 400 17cqw/1.05 var(--wk-font-script); white-space: nowrap; text-shadow: 0 2px 14px rgba(255,255,255,.9); }
.cw-ap-names b:last-child { transition-delay: .09s; }
.cw-ap-names i { font: 500 7cqw/1.2 var(--wk-font-caps); font-style: normal; color: #A0566A; }
.cw-frame { position: absolute; inset: 0; z-index: 4; width: 100%; height: 100%; pointer-events: none; filter: drop-shadow(0 22px 26px rgba(120,40,60,.22)); }
.cw-shutter { position: absolute; z-index: 5; transition: transform 1.5s cubic-bezier(.5,0,.2,1); backface-visibility: visible; }
.cw-shutter.is-l { transform-origin: 0% 50%; }
.cw-shutter.is-r { z-index: 6; transform-origin: 100% 50%; transition-delay: .08s; }
.cw-shutter img { display: block; width: 100%; height: 100%; }
.cw-shutter-glow, .cw-shutter-shade { position: absolute; inset: 0; opacity: 0; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; pointer-events: none; }
.cw-shutter-glow { background: linear-gradient(180deg, #FFE4E8, #FFD1D9); mix-blend-mode: multiply; opacity: .28; transition: opacity .5s ease; }
.cw-shutter.is-l .cw-shutter-shade { background: linear-gradient(90deg, rgba(60,20,30,.05), rgba(60,20,30,.55)); transition: opacity 1.5s ease; }
.cw-shutter.is-r .cw-shutter-shade { background: linear-gradient(270deg, rgba(60,20,30,.05), rgba(60,20,30,.55)); transition: opacity 1.5s ease .08s; }
.cw-sill-roses { position: absolute; z-index: 7; bottom: 10.5%; width: 36%; pointer-events: none; }
.cw-sill-roses.is-l { left: -9%; }
.cw-sill-roses.is-r { right: -9%; }
.cw-sill-roses img { display: block; width: 100%; height: auto; filter: drop-shadow(0 8px 10px rgba(90,30,40,.22)); }
.cw-sill-roses.is-r img { transform: scaleX(-1); }
.cw-gate-foot { display: flex; flex-direction: column; align-items: center; gap: clamp(8px, 1.6svh, 14px); transition: opacity .4s ease, transform .5s var(--cw-ease); }
.cw-gate-names { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
.cw-gate-eyebrow { font: 600 clamp(10.5px, 1.5svh, 12.5px)/1.2 var(--wk-font-caps); letter-spacing: .32em; text-transform: uppercase; color: #A0566A; }
.cw-root.is-hi .cw-gate-eyebrow { letter-spacing: .04em; font-family: var(--wk-font-deva); font-size: 15px; }
.cw-gate-couple { font: 400 clamp(32px, min(9vw, 5.6svh), 54px)/1.12 var(--wk-font-script); color: #8E3B52; white-space: nowrap; max-width: 92vw; overflow: hidden; text-overflow: ellipsis; padding: 0 .12em; }
.cw-gate-couple i { font-style: normal; font-family: var(--wk-font-display); font-size: .6em; color: #B07A64; }
.cw-gate-date { font: 600 clamp(11px, 1.6svh, 13.5px)/1.3 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: #6A3A46; }
.cw-gate-cta { position: relative; display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 26px; border: 0; border-radius: 999px; font: 700 15px/1 var(--wk-font-sans); color: #FFF7F5; cursor: pointer; background: linear-gradient(115deg, #8E3B52, #B4566E 50%, #D38E8B); box-shadow: 0 16px 30px -14px rgba(110,40,58,.75), inset 0 1px 0 rgba(255,255,255,.35); -webkit-tap-highlight-color: transparent; }
.cw-gate-cta:disabled { opacity: .78; cursor: progress; }
.cw-gate-cta:active { transform: scale(.97); }
.cw-gate-cta-ring { position: absolute; inset: -5px; border-radius: inherit; border: 1.5px solid rgba(180,86,110,.55); animation: cw-ring 2.2s ease-out infinite; pointer-events: none; }
.cw-gate-cta:disabled .cw-gate-cta-ring { display: none; }
@keyframes cw-ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(1.16, 1.45); opacity: 0; } }
.cw-petal-layer { position: fixed; inset: 0; z-index: 70; pointer-events: none; overflow: hidden; }
.cw-petal { position: absolute; will-change: transform, opacity; pointer-events: none; }

/* entrance (after the art has decoded) */
.cw-gate.is-loading .cw-cam, .cw-gate.is-loading .cw-gate-tree, .cw-gate.is-loading .cw-gate-names { opacity: 0; }
.cw-gate.is-loading .cw-cam { transform: translateY(14px) scale(.97); }
.cw-gate:not(.is-loading) .cw-cam { animation: cw-rise 1.1s var(--cw-ease) .05s both; }
.cw-gate:not(.is-loading) .cw-gate-tree.is-l { animation: cw-grow-l 1.6s var(--cw-ease) .15s both; }
.cw-gate:not(.is-loading) .cw-gate-tree.is-r { animation: cw-grow-r 1.6s var(--cw-ease) .25s both; }
.cw-gate:not(.is-loading) .cw-sill-roses { animation: cw-pop .9s cubic-bezier(.34,1.5,.64,1) .7s both; }
.cw-gate:not(.is-loading) .cw-gate-names { animation: cw-up .9s var(--cw-ease) .6s both; }
.cw-gate:not(.is-loading) .cw-gate-cta { animation: cw-up .9s var(--cw-ease) .9s both; }
.cw-gate.is-closed .cw-shutter-glow { animation: cw-glow 3.4s ease-in-out 1.4s infinite; }
@keyframes cw-glow { 0%, 100% { opacity: .28; } 50% { opacity: .5; } }
@keyframes cw-rise { from { transform: translateY(18px) scale(.97); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cw-grow-l { from { transform: translate3d(-30%, 8%, 0) rotate(-6deg); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cw-grow-r { from { transform: translate3d(30%, 8%, 0) rotate(6deg); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cw-pop { from { transform: scale(.5) translateY(20%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes cw-up { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }

/* the light, the swing, the step through */
.cw-gate.is-open .cw-gate-foot, .cw-gate.is-push .cw-gate-foot { opacity: 0; transform: translateY(12px); pointer-events: none; }
.cw-gate.is-open .cw-gate-top, .cw-gate.is-push .cw-gate-top { opacity: 0; }
.cw-gate.is-open .cw-gate-cta, .cw-gate.is-push .cw-gate-cta { animation: none; }
.cw-gate.is-open .cw-ap-dawn, .cw-gate.is-push .cw-ap-dawn { opacity: 1; transform: scale(1.2); }
.cw-gate.is-open .cw-ap-bloom, .cw-gate.is-push .cw-ap-bloom { opacity: 1; transform: translate(-50%,-50%) scale(1.15); }
.cw-gate.is-open .cw-ap-rays, .cw-gate.is-push .cw-ap-rays { opacity: .85; transform: scale(1.08); }
.cw-gate.is-open .cw-ap-names, .cw-gate.is-push .cw-ap-names { opacity: 1; transform: none; }
.cw-gate.is-open .cw-shutter.is-l, .cw-gate.is-push .cw-shutter.is-l { transform: rotateY(-105deg); }
.cw-gate.is-open .cw-shutter.is-r, .cw-gate.is-push .cw-shutter.is-r { transform: rotateY(105deg); }
.cw-gate.is-open .cw-shutter-shade, .cw-gate.is-push .cw-shutter-shade { opacity: .6; }
.cw-gate.is-open .cw-shutter-glow, .cw-gate.is-push .cw-shutter-glow { opacity: 0; }
.cw-gate.is-push { opacity: 0; pointer-events: none; }
.cw-gate.is-push .cw-cam { transform: scale(1.12); }
.cw-gate.is-push .cw-gate-tree.is-l { transform: translate3d(-40%, 10%, 0); }
.cw-gate.is-push .cw-gate-tree.is-r { transform: translate3d(40%, 10%, 0); }
.cw-gate.is-reduced, .cw-gate.is-reduced * { animation: none !important; transition: none !important; }
.cw-gate.is-reduced { transition: opacity .4s ease !important; }
.cw-gate.is-reduced.is-push .cw-cam { transform: none; }

/* wide screens: the peony trees stand beside the window, the dawn fills the sides */
@media (min-width: 760px) {
  .cw-gate-tree { height: min(84svh, 860px); }
  .cw-gate-tree.is-l { left: max(-4vw, calc(50% - 46svh - 300px)); }
  .cw-gate-tree.is-r { right: max(-4vw, calc(50% - 46svh - 300px)); }
}
@media (min-width: 760px) and (max-aspect-ratio: 4/5) {
  .cw-gate-tree { height: min(62svh, 760px); }
  .cw-gate-tree.is-l { left: -6vw; }
  .cw-gate-tree.is-r { right: -6vw; }
}
@media (max-height: 640px) { .cw-gate-col { gap: 6px; padding-top: 52px; } .cw-cam { height: calc(100svh - 268px); } }

/* ══ THE ROSE GARDEN (hero) ═══════════════════════════════════════════════ */
.cw-hero { position: relative; min-height: 100svh; display: flex; flex-direction: column; align-items: center; padding: 0 16px clamp(30px, 6vw, 60px); isolation: isolate; overflow: clip; }
.cw-hero-wash { position: absolute; inset: 0; z-index: -1; background: radial-gradient(70% 46% at 50% 30%, color-mix(in srgb, var(--wk-surface-solid) 94%, transparent) 0%, transparent 72%), radial-gradient(50% 40% at 85% 85%, color-mix(in srgb, var(--wk-accent) 10%, transparent), transparent 70%), radial-gradient(45% 40% at 10% 90%, color-mix(in srgb, var(--wk-gold) 12%, transparent), transparent 70%), linear-gradient(180deg, var(--wk-bg) 0%, color-mix(in srgb, var(--wk-bg2) 70%, var(--wk-bg)) 100%); }
.cw-hero-wash::after { content: ""; position: absolute; inset: 0; opacity: .3; background: url("/wedding-v3/template8/04-cream-mandala-diamond-pattern-tile.webp") 0 0 / 150px auto repeat; -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%); mask-image: linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%); }
.cw-hero-petals { position: absolute; inset: 0; z-index: 3; pointer-events: none; overflow: hidden; }
.cw-hero-petals img { position: absolute; top: -40px; opacity: 0; }
.cw-hero.is-on .cw-hero-petals img { animation: cw-mote linear infinite; }
.cw-hero-crown { position: relative; z-index: 1; display: block; width: calc(100% + 32px); max-width: 960px; margin: 0 -16px; pointer-events: none; opacity: 0; transform: translateY(-24%); transition: transform 1.3s var(--cw-ease) .1s, opacity 1s ease .1s; }
.cw-hero-crown img { display: block; width: 100%; height: auto; opacity: .92; }
/* The peony trees' art is cut on its outer side: they always grow in from the screen's very edge. */
.cw-hero-tree { position: absolute; bottom: 0; z-index: 0; height: min(52svh, 470px); pointer-events: none; opacity: 0; transition: transform 1.6s var(--cw-ease) .35s, opacity 1.1s ease .35s; }
.cw-hero-tree img { display: block; height: 100%; width: auto; }
.cw-hero-tree.is-l { left: -56px; transform: translate3d(-20%, 6%, 0); transform-origin: 0 100%; }
.cw-hero-tree.is-r { right: -56px; transform: translate3d(20%, 6%, 0); transform-origin: 100% 100%; }
.cw-hero-tree.is-l img { -webkit-mask-image: linear-gradient(90deg, #000 72%, transparent 98%); mask-image: linear-gradient(90deg, #000 72%, transparent 98%); transform-origin: 0 100%; }
.cw-hero-tree.is-r img { -webkit-mask-image: linear-gradient(270deg, #000 72%, transparent 98%); mask-image: linear-gradient(270deg, #000 72%, transparent 98%); transform-origin: 100% 100%; }
.cw-hero.is-on .cw-hero-tree.is-l img { animation: cw-sway-l 9s ease-in-out 2s infinite; }
.cw-hero.is-on .cw-hero-tree.is-r img { animation: cw-sway-r 10s ease-in-out 2.4s infinite; }
@keyframes cw-sway-l { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(1.2deg); } }
@keyframes cw-sway-r { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-1.2deg); } }
.cw-hero .cw-pampas { z-index: 1; bottom: -1%; width: clamp(110px, 30vw, 320px); opacity: 0; transition: opacity 1.2s ease .6s; }
.cw-hero.is-on .cw-pampas { opacity: 1; }
.cw-hero-mono { display: none; }
.cw-hero-grid { position: relative; z-index: 2; width: 100%; max-width: 1240px; display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; text-align: center; margin-top: calc(-1 * min(17vw, 150px)); }
.cw-hero-words { display: grid; justify-items: center; gap: 6px; min-width: 0; max-width: 36rem; }
.cw-hero-words > * { opacity: 0; transform: translateY(16px); transition: opacity .9s ease, transform 1s var(--cw-ease); }
.cw-hero-dear { margin: 0; font: italic 500 clamp(16px, 4.4vw, 21px)/1.3 var(--wk-font-display); color: var(--wk-accent); text-wrap: balance; }
.cw-root.is-hi .cw-hero-dear { font-style: normal; font-family: var(--wk-font-deva); }
.cw-hero-eyebrow { margin: 0; font: 600 clamp(11px, 3vw, 13px)/1.4 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--wk-gold-ink); text-wrap: balance; }
.cw-root.is-hi .cw-hero-eyebrow { letter-spacing: .04em; font: 600 16px/1.4 var(--wk-font-deva); }
.cw-hero-names { margin: 4px 0 0; display: flex; flex-direction: column; align-items: center; font-weight: 400; line-height: 1; }
.cw-hero-n { font: 400 clamp(56px, 16vw, 104px)/1.08 var(--wk-font-script); padding: 0 .14em; text-wrap: balance; word-break: keep-all; max-width: 100%; }
.cw-hero-names.is-long .cw-hero-n { font-size: clamp(46px, 12.5vw, 92px); }
.cw-hero-names.is-xlong .cw-hero-n { font-size: clamp(38px, 10vw, 80px); }
.cw-hero-amp { position: relative; font: 500 clamp(18px, 5vw, 26px)/1 var(--wk-font-caps); letter-spacing: .3em; color: var(--wk-gold-ink); margin: .5em 0 .55em .3em; }
.cw-hero-amp::before, .cw-hero-amp::after { content: ""; position: absolute; top: 50%; width: 46px; height: 1px; background: linear-gradient(90deg, transparent, var(--cw-line)); }
.cw-hero-amp::before { right: calc(100% + 6px); }
.cw-hero-amp::after { left: calc(100% - 2px); transform: scaleX(-1); }
.cw-hero-getting { margin: 4px 0 0; font: italic 400 clamp(18px, 4.8vw, 24px)/1.3 var(--wk-font-display); color: var(--wk-muted); }
.cw-root.is-hi .cw-hero-getting { font-style: normal; font-family: var(--wk-font-deva); font-size: clamp(16px, 4.2vw, 20px); }
.cw-hero-date { margin-top: 14px; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 14px; width: min(100%, 410px); }
.cw-hero-date-side { padding: 9px 0; border-top: 1px solid var(--cw-line); border-bottom: 1px solid var(--cw-line); font: 600 clamp(11px, 3vw, 13px)/1.25 var(--wk-font-caps); letter-spacing: .16em; text-transform: uppercase; color: var(--wk-ink); }
.cw-root.is-hi .cw-hero-date-side { letter-spacing: .02em; font-family: var(--wk-font-deva); font-size: 14px; }
.cw-hero-date-day { display: grid; place-items: center; width: clamp(64px, 17vw, 78px); aspect-ratio: 1; border-radius: 50%; font: 500 clamp(34px, 9.4vw, 44px)/1 var(--wk-font-display); color: var(--wk-accent); background: radial-gradient(circle at 50% 35%, var(--wk-surface-solid), color-mix(in srgb, var(--wk-accent) 8%, var(--wk-surface-solid))); box-shadow: inset 0 0 0 1px var(--cw-line), inset 0 0 0 5px var(--wk-surface-solid), inset 0 0 0 6px color-mix(in srgb, var(--wk-gold) 40%, transparent), 0 14px 26px -18px rgba(110,40,58,.6); }
.cw-hero-where { margin: 8px 0 0; display: grid; gap: 2px; }
.cw-hero-time { font: 600 13.5px/1.4 var(--wk-font-caps); letter-spacing: .16em; text-transform: uppercase; color: var(--wk-muted); }
.cw-hero-venue { font: italic 500 clamp(17px, 4.4vw, 20px)/1.35 var(--wk-font-display); color: var(--wk-ink); text-wrap: balance; }
.cw-hero-acts { margin-top: 14px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.cw-hero-acts .cw-btn-rose { position: relative; overflow: hidden; }
.cw-hero-acts .cw-btn-rose::after { content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent); transform: skewX(-18deg); animation: cw-sheen 4.5s ease-in-out 3s infinite; }
@keyframes cw-sheen { 0%, 70% { left: -60%; } 100% { left: 130%; } }

/* the arch window, the halo, the gazebo and the couple */
.cw-hero-scene { position: relative; width: min(100%, 400px); aspect-ratio: 400 / 448; margin-top: 22px; opacity: 0; transform: translateY(24px) scale(.96); transition: transform 1.4s var(--cw-ease) .5s, opacity 1.1s ease .5s; }
.cw-hero-halo { position: absolute; left: 50%; top: -6%; width: 98%; aspect-ratio: 1; margin-left: -49%; opacity: .36; pointer-events: none; }
.cw-hero-halo img { display: block; width: 100%; height: 100%; }
.cw-hero.is-on .cw-hero-halo img { animation: cw-spin 90s linear infinite; }
@keyframes cw-spin { to { transform: rotate(360deg); } }
.cw-hero-arch { position: absolute; left: 14%; top: 3%; width: 72%; height: auto; aspect-ratio: 400 / 520; overflow: visible; filter: drop-shadow(0 18px 30px rgba(120,40,60,.18)); }
.cw-hero-arch-line { stroke-dasharray: 1500; stroke-dashoffset: 1500; }
.cw-hero.is-on .cw-hero-arch-line { animation: cw-draw 2.6s var(--cw-ease) .7s forwards; }
@keyframes cw-draw { to { stroke-dashoffset: 0; } }
.cw-hero.is-on .cw-hero-arch-sun { animation: cw-sunpulse 6s ease-in-out 2s infinite; }
@keyframes cw-sunpulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
.cw-hero-twinkle { position: absolute; z-index: 3; opacity: 0; pointer-events: none; }
.cw-hero.is-on .cw-hero-twinkle { animation: cw-twinkle 3.6s ease-in-out infinite; }
@keyframes cw-twinkle { 0%, 100% { opacity: 0; transform: scale(.4) rotate(0); } 45% { opacity: .95; transform: scale(1) rotate(45deg); } 60% { opacity: .2; } }
.cw-hero-gazebo { position: absolute; left: 0; bottom: 0; width: 100%; height: auto; }
.cw-hero-couple { position: absolute; left: 50%; bottom: 5%; height: 56%; width: auto; transform: translateX(-50%); transform-origin: 50% 100%; filter: drop-shadow(0 12px 14px rgba(110,40,50,.22)); }
.cw-hero.is-on .cw-hero-couple { animation: cw-breathe 6.5s ease-in-out 2s infinite; }
@keyframes cw-breathe { 0%, 100% { transform: translateX(-50%) rotate(-.6deg); } 50% { transform: translateX(-50%) rotate(.6deg) translateY(-2px); } }
.cw-hero-portrait { position: absolute; left: 50%; bottom: 8%; width: 40%; aspect-ratio: 4 / 5; transform: translateX(-50%); border-radius: 20px; overflow: hidden; box-shadow: 0 0 0 1px color-mix(in srgb, var(--wk-gold) 70%, transparent), 0 0 0 6px var(--wk-surface-solid), 0 0 0 7px color-mix(in srgb, var(--wk-gold) 45%, transparent), 0 26px 40px -22px rgba(90,30,40,.6); }
.cw-hero-ground { position: absolute; left: 12%; right: 12%; bottom: -4%; height: 12%; border-radius: 50%; background: radial-gradient(closest-side, rgba(150,70,80,.18), rgba(150,70,80,0)); z-index: -1; }
.cw-hero-down { position: relative; z-index: 4; margin-top: 18px; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px; border-radius: 999px; font: 600 12.5px/1 var(--wk-font-sans); letter-spacing: .12em; text-transform: uppercase; color: var(--wk-gold-ink); text-decoration: none; opacity: 0; transition: opacity 1s ease 1.6s; }
.cw-root.is-hi .cw-hero-down { letter-spacing: .02em; font-family: var(--wk-font-deva); font-size: 14px; }
.cw-hero-down svg { animation: cw-bob 2s ease-in-out infinite; }
@keyframes cw-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
.cw-hero.is-on .cw-hero-crown, .cw-hero.is-on .cw-hero-words > *, .cw-hero.is-on .cw-hero-scene { opacity: 1; transform: none; }
.cw-hero.is-on .cw-hero-tree { opacity: 1; transform: none; }
.cw-hero.is-on .cw-hero-down { opacity: 1; }
.cw-hero.is-on .cw-hero-words > :nth-child(2) { transition-delay: .45s; }
.cw-hero.is-on .cw-hero-words > :nth-child(3) { transition-delay: .6s; }
.cw-hero.is-on .cw-hero-words > :nth-child(4) { transition-delay: .75s; }
.cw-hero.is-on .cw-hero-words > :nth-child(5) { transition-delay: .9s; }
.cw-hero.is-on .cw-hero-words > :nth-child(6) { transition-delay: 1.05s; }
.cw-hero.is-on .cw-hero-words > :nth-child(7) { transition-delay: 1.2s; }
.cw-hero.is-on .cw-hero-words > :nth-child(8) { transition-delay: 1.35s; }
/* Phones and tablets: the scroll cue rests on the gazebo's lawn between the pampas, on a blush ground (no bare band under the scene). */
@media (max-width: 1023px) {
  .cw-hero { padding-bottom: 10px; }
  .cw-hero::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 120px; z-index: 0; pointer-events: none; background: radial-gradient(60% 90% at 50% 100%, color-mix(in srgb, var(--wk-accent) 16%, transparent) 0%, color-mix(in srgb, var(--wk-accent) 6%, transparent) 55%, transparent 80%); }
  .cw-hero-down { margin-top: 2px; background: color-mix(in srgb, var(--wk-surface-solid) 78%, transparent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--wk-gold) 30%, transparent), 0 10px 22px -14px rgba(110,40,58,.45); }
}
@media (min-width: 560px) {
  .cw-hero-tree { height: min(62svh, 620px); }
  .cw-hero-tree.is-l { left: -40px; }
  .cw-hero-tree.is-r { right: -40px; }
  .cw-hero-scene { width: min(100%, 440px); }
}
/* Laptops and desktops: one screen — the words on the left, the arch on the right, the trees full height at the edges. */
@media (min-width: 1024px) {
  .cw-hero { min-height: max(100svh, 640px); padding: 74px 40px 58px; justify-content: center; }
  .cw-hero-crown { display: none; }
  .cw-hero-tree { top: 0; height: auto; }
  .cw-hero-tree img { height: 100%; }
  .cw-hero-tree.is-l { left: calc(-1 * min(4vw, 60px)); }
  .cw-hero-tree.is-r { right: calc(-1 * min(4vw, 60px)); }
  .cw-hero .cw-pampas { width: clamp(200px, 18vw, 300px); }
  .cw-hero-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: clamp(16px, 3vw, 56px); margin-top: 0; padding: 0 clamp(150px, 14vw, 250px); }
  .cw-hero-words { gap: 4px; }
  .cw-hero-mono { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: .06em; width: clamp(70px, 10svh, 92px); aspect-ratio: 1; margin-bottom: 6px; border-radius: 50%; font: 400 clamp(30px, 4.4svh, 40px)/1 var(--wk-font-script); color: var(--wk-accent); background: radial-gradient(circle at 50% 35%, var(--wk-surface-solid), color-mix(in srgb, var(--wk-accent) 10%, var(--wk-surface-solid))); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 70%, transparent), inset 0 0 0 6px var(--wk-surface-solid), inset 0 0 0 7px color-mix(in srgb, var(--wk-gold) 40%, transparent), 0 16px 28px -18px rgba(110,40,58,.6); }
  .cw-hero-mono i { font: 500 .36em/1 var(--wk-font-caps); font-style: normal; color: var(--wk-gold-ink); margin-top: .5em; }
  .cw-hero-n { font-size: clamp(64px, min(5.8vw, 10.4svh), 108px); }
  .cw-hero-names.is-long .cw-hero-n { font-size: clamp(56px, min(5vw, 9svh), 92px); }
  .cw-hero-names.is-xlong .cw-hero-n { font-size: clamp(48px, min(4.2vw, 7.6svh), 78px); }
  .cw-hero-amp { margin: .35em 0 .4em .3em; }
  .cw-hero-date { margin-top: clamp(8px, 1.6svh, 16px); }
  .cw-hero-scene { justify-self: center; width: min(100%, 560px, calc((100svh - 150px) * 400 / 448)); margin-top: 0; }
  .cw-hero-down { position: absolute; left: 0; right: 0; bottom: 12px; width: max-content; margin: 0 auto; }
}
@media (min-width: 1024px) and (max-height: 760px) {
  .cw-hero-getting { font-size: 19px; }
  .cw-hero-where { margin-top: 4px; }
  .cw-hero-acts { margin-top: 8px; }
}
@media (min-width: 1440px) {
  .cw-hero-grid { max-width: 1320px; }
}

/* ══ SECTIONS ═════════════════════════════════════════════════════════════ */
.cw-root .wk-section.cw-sec { padding-top: clamp(52px, 7vw, 100px); padding-bottom: clamp(52px, 7vw, 100px); }
.cw-root .wk-section.cw-sec .wk-section-head { margin-bottom: clamp(24px, 4vw, 40px); }
.cw-root .wk-section.cw-sec { isolation: isolate; }
/* wide screens: gold line-art swirls (template8) bloom faintly beside the reading column */
@media (min-width: 1180px) {
  .cw-root .cw-sec-invite::before, .cw-root .cw-sec-invite::after, .cw-root .cw-sec-story::before, .cw-root .cw-sec-rsvp::before, .cw-root .cw-sec-rsvp::after, .cw-root .cw-sec-fam::after { content: ""; position: absolute; z-index: -1; width: clamp(260px, 22vw, 380px); aspect-ratio: 720 / 654; background: url("/wedding-v3/template8/01-gold-line-art-floral-swirl-720.webp") center / contain no-repeat; opacity: .32; pointer-events: none; }
  .cw-root .cw-sec-invite::before { left: calc(50% - 400px - clamp(260px, 22vw, 380px)); top: 18%; transform: scaleX(-1); }
  .cw-root .cw-sec-invite::after { right: calc(50% - 400px - clamp(260px, 22vw, 380px)); bottom: 12%; transform: rotate(180deg) scaleX(-1); }
  .cw-root .cw-sec-fam::after { right: calc(50% - 520px - clamp(260px, 22vw, 380px)); top: 6%; }
  .cw-root .cw-sec-story::before { left: calc(50% - 560px - clamp(260px, 22vw, 380px)); top: 40%; transform: scaleX(-1); }
  .cw-root .cw-sec-rsvp::before { left: calc(50% - 360px - clamp(260px, 22vw, 380px)); top: 22%; transform: scaleX(-1); }
  .cw-root .cw-sec-rsvp::after { right: calc(50% - 360px - clamp(260px, 22vw, 380px)); top: 46%; transform: rotate(180deg) scaleX(-1); }
}

/* the invitation: ivory stationery */
.cw-letter { position: relative; max-width: 720px; margin: 0 auto; padding: clamp(56px, 11vw, 82px) clamp(20px, 6vw, 60px) clamp(58px, 12vw, 100px); border-radius: clamp(20px, 3vw, 28px); background: radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--wk-surface-solid) 70%, #fff) 0%, var(--wk-surface-solid) 60%); box-shadow: inset 0 0 0 1px var(--cw-line), inset 0 0 0 8px var(--wk-surface-solid), inset 0 0 0 9px color-mix(in srgb, var(--wk-gold) 32%, transparent), 0 34px 70px -44px rgba(110,40,58,.55); }
.cw-letter-in { position: relative; z-index: 2; }
.cw-letter-swirl { position: absolute; z-index: 1; width: min(46%, 300px); height: auto; opacity: .3; pointer-events: none; }
.cw-letter-swirl.is-tl { top: 12px; left: 12px; transform: rotate(180deg) scaleX(-1); }
.cw-letter-swirl.is-br { bottom: 12px; right: 12px; transform: scaleX(-1); }
.cw-letter-roses { position: absolute; z-index: 3; width: clamp(120px, 32vw, 220px); height: auto; pointer-events: none; filter: drop-shadow(0 12px 14px rgba(110,40,58,.18)); }
.cw-letter-roses.is-tr { top: clamp(-56px, -9vw, -34px); right: clamp(-40px, -5vw, -14px); transform: rotate(8deg); }
.cw-letter-roses.is-bl { bottom: clamp(-50px, -8vw, -30px); left: clamp(-40px, -5vw, -14px); transform: scaleX(-1) rotate(10deg); width: clamp(100px, 26vw, 180px); }
.cw-invoke { margin: 0 0 14px; display: grid; justify-items: center; gap: 6px; }
.cw-invoke img { width: clamp(46px, 12vw, 62px); height: auto; }
.cw-invoke span { font: 600 15px/1.2 var(--wk-font-deva); color: var(--wk-gold-ink); letter-spacing: .04em; }
.cw-root .cw-letter .wk-msg-heading { font-family: var(--wk-font-script); }
/* Two columns (English | Hindi): the shorter one sits mid-height beside the longer, not stranded at the top. */
@media (min-width: 860px) { .cw-root .cw-letter .wk-msg.is-two .wk-msg-text { align-self: center; } .cw-root .cw-letter .wk-msg.is-two .wk-msg-text p:last-child { margin-bottom: 0; } }

/* families */
.cw-fam { display: grid; gap: 22px; }
.cw-blessings-of { text-align: center; }
.cw-blessings-names { margin: 6px 0 0; font: italic 500 clamp(18px, 4.4vw, 22px)/1.4 var(--wk-font-display); color: var(--wk-ink); text-wrap: balance; }
.cw-root .wk-family { border-radius: 22px; }

/* save the date */
.cw-day { position: relative; padding: clamp(60px, 9vw, 110px) 16px; isolation: isolate; }
.cw-day-band { position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--wk-bg2) 60%, transparent) 20%, color-mix(in srgb, var(--wk-bg2) 60%, transparent) 80%, transparent); }
.cw-day-band::after { content: ""; position: absolute; inset: 0; opacity: .55; background: url("/wedding-v3/template8/04-cream-mandala-diamond-pattern-tile.webp") 0 0 / 132px auto repeat; -webkit-mask-image: linear-gradient(180deg, transparent, #000 22%, #000 78%, transparent); mask-image: linear-gradient(180deg, transparent, #000 22%, #000 78%, transparent); mix-blend-mode: multiply; }
.cw-day-card { position: relative; max-width: 660px; margin: 0 auto; padding: clamp(30px, 6vw, 46px) clamp(14px, 4vw, 36px); border-radius: 28px; text-align: center; display: grid; justify-items: center; gap: 10px; background: color-mix(in srgb, var(--wk-surface-solid) 92%, transparent); box-shadow: inset 0 0 0 1px var(--cw-line), inset 0 0 0 7px var(--wk-surface-solid), inset 0 0 0 8px color-mix(in srgb, var(--wk-gold) 28%, transparent), 0 30px 60px -40px rgba(110,40,58,.55); }
.cw-day-card .wk-eyebrow { margin: 0; }
.cw-day-date { margin: 0; font: 500 clamp(26px, 7vw, 40px)/1.15 var(--wk-font-display); color: var(--wk-ink); text-wrap: balance; }
.cw-day-time { margin: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 14px; font: 600 13.5px/1.4 var(--wk-font-caps); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-muted); }
.cw-day-muhurat { color: var(--wk-accent); }
.cw-day-count { margin: 10px 0 0; font: 400 clamp(28px, 7.6vw, 40px)/1.15 var(--wk-font-script); color: var(--wk-gold-ink); }
.cw-root.is-hi .cw-day-count { font: 500 22px/1.3 var(--wk-font-deva); }
.cw-count { margin: 4px 0 14px; max-width: 100%; }

/* story */
.cw-story { position: relative; list-style: none; margin: 0; padding: 4px 0 4px; display: grid; gap: 38px; }
.cw-story::before { content: ""; position: absolute; top: 6px; bottom: 6px; left: 17px; width: 2px; border-radius: 2px; background: linear-gradient(180deg, transparent, var(--cw-line) 8%, var(--cw-line) 92%, transparent); }
.cw-ch { position: relative; display: grid; gap: 14px; padding-left: 50px; }
.cw-ch-dot { position: absolute; left: 4px; top: 2px; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1.5px var(--cw-line), 0 6px 12px -6px rgba(110,40,58,.45); }
.cw-ch-dot img { width: 18px; height: 18px; transform: rotate(-25deg); }
.cw-ch-photo { position: relative; width: min(100%, 360px); aspect-ratio: 4 / 5; border-radius: 20px; overflow: hidden; box-shadow: 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), 0 0 0 6px var(--wk-surface-solid), 0 0 0 7px color-mix(in srgb, var(--wk-gold) 35%, transparent), 0 24px 44px -28px rgba(110,40,58,.55); }
.cw-ch-when { margin: 0; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .24em; color: var(--wk-gold-ink); }
.cw-ch-title { margin: 8px 0 6px; font: 400 clamp(32px, 8.4vw, 42px)/1.12 var(--wk-font-script); color: var(--wk-accent); }
.cw-ch-line { margin: 0; font: 400 16.5px/1.6 var(--wk-font-sans); color: var(--wk-muted); max-width: 34rem; }
@media (min-width: 860px) {
  .cw-story::before { left: 50%; transform: translateX(-50%); }
  .cw-ch { grid-template-columns: 1fr 1fr; align-items: center; gap: 80px; padding-left: 0; }
  .cw-ch-dot { left: 50%; top: 50%; transform: translate(-50%, -50%); }
  .cw-ch-photo { justify-self: end; }
  .cw-ch.is-alt .cw-ch-photo { order: 2; justify-self: start; }
  .cw-ch.is-alt .cw-ch-text { text-align: right; justify-self: end; }
  .cw-ch:not(.has-photo) .cw-ch-text { grid-column: 2; }
  .cw-ch.is-alt:not(.has-photo) .cw-ch-text { grid-column: 1; }
}

/* functions: a stage per celebration, each with its own couple */
.cw-ev-grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); }
/* phones: a swipe rail, the next card peeking in */
@media (max-width: 699px) {
  .cw-ev-grid.is-rail { display: flex; gap: 14px; margin-inline: calc(50% - 50vw); padding: 6px 9vw 14px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: 9vw; overscroll-behavior-x: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .cw-ev-grid.is-rail::-webkit-scrollbar { display: none; }
  .cw-ev-grid.is-rail > .cw-ev { flex: 0 0 82vw; scroll-snap-align: center; }
}
@media (min-width: 700px) { .cw-ev-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 26px; } .cw-ev-grid > .cw-ev { flex: 0 1 calc((100% - 26px) / 2); } .cw-ev-dots { display: none !important; } }
@media (min-width: 1100px) { .cw-ev-grid.n-3 > .cw-ev { flex-basis: calc((100% - 52px) / 3); } }
.cw-ev { display: flex; }
.cw-ev-card { position: relative; flex: 1; display: flex; flex-direction: column; border-radius: 28px; overflow: hidden; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px var(--cw-line), inset 0 0 0 6px var(--wk-surface-solid), inset 0 0 0 7px color-mix(in srgb, var(--wk-gold) 24%, transparent), 0 30px 54px -38px rgba(110,40,58,.65); transition: transform .45s var(--cw-ease), box-shadow .45s ease; }
@media (hover: hover) { .cw-ev-card:hover { transform: translateY(-6px); box-shadow: inset 0 0 0 1px var(--wk-gold), inset 0 0 0 6px var(--wk-surface-solid), inset 0 0 0 7px color-mix(in srgb, var(--wk-gold) 40%, transparent), 0 40px 64px -40px rgba(110,40,58,.75); } }
.cw-ev-stage { position: relative; height: clamp(250px, 64vw, 290px); margin: 7px 7px 0; border-radius: 22px 22px 0 0; overflow: hidden; isolation: isolate; background: radial-gradient(70% 70% at 50% 70%, color-mix(in srgb, var(--fn) 34%, transparent), transparent 75%), linear-gradient(180deg, color-mix(in srgb, var(--fn) 14%, var(--wk-surface-solid)), var(--wk-surface-solid)); }
.cw-ev-stage::before { content: ""; position: absolute; inset: 0; z-index: -1; opacity: .35; background: url("/wedding-v3/template8/04-cream-mandala-diamond-pattern-tile.webp") 0 0 / 110px auto repeat; mix-blend-mode: multiply; -webkit-mask-image: linear-gradient(180deg, #000, transparent 85%); mask-image: linear-gradient(180deg, #000, transparent 85%); }
.cw-ev-window { position: absolute; left: 50%; bottom: 0; width: min(62%, 220px); height: 86%; transform: translateX(-50%); border-radius: 999px 999px 0 0; background: radial-gradient(80% 55% at 50% 38%, #fff 0%, color-mix(in srgb, var(--fn) 22%, #fff) 55%, color-mix(in srgb, var(--fn) 40%, #fff) 100%); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 75%, transparent), inset 0 0 0 7px rgba(255,255,255,.55), inset 0 0 0 8px color-mix(in srgb, var(--wk-gold) 40%, transparent), 0 0 40px 6px color-mix(in srgb, var(--fn) 30%, transparent); }
.cw-ev-swirl { position: absolute; top: 8px; width: 46%; height: auto; opacity: .22; pointer-events: none; }
.cw-ev-swirl.is-l { left: -8%; transform: rotate(180deg) scaleX(-1); }
.cw-ev-swirl.is-r { right: -8%; transform: rotate(180deg); }
.cw-ev-couple { position: absolute; left: 50%; bottom: 6px; height: 90%; width: auto; max-width: 92%; object-fit: contain; object-position: 50% 100%; transform: translateX(-50%) translateY(18px) scale(.94); transform-origin: 50% 100%; opacity: 0; filter: drop-shadow(0 12px 12px rgba(80,30,40,.22)); transition: transform 1.1s cubic-bezier(.34,1.4,.64,1) .25s, opacity .8s ease .25s; }
.cw-ev.is-in .cw-ev-couple { opacity: 1; transform: translateX(-50%); }
@media (hover: hover) { .cw-ev.is-in .cw-ev-card:hover .cw-ev-couple { transform: translateX(-50%) translateY(-6px) scale(1.04); transition-delay: 0s; transition-duration: .5s; } }
.cw-ev-couple.is-sangeet { height: 86%; }
.cw-ev.is-in .cw-ev-couple.is-sangeet { animation: cw-dance 2.8s ease-in-out 1.4s infinite; }
@keyframes cw-dance { 0%, 100% { transform: translateX(-50%) rotate(-1.5deg); } 50% { transform: translateX(-50%) rotate(1.5deg) translateY(-3px); } }
.cw-ev-floor { position: absolute; left: 22%; right: 22%; bottom: 0; height: 22px; border-radius: 50%; background: radial-gradient(closest-side, rgba(110,40,58,.22), transparent); z-index: -1; }
.cw-ev-roses { position: absolute; right: -14px; top: -14px; z-index: 2; width: 128px; height: auto; pointer-events: none; transform: rotate(10deg); filter: drop-shadow(0 8px 10px rgba(110,40,58,.15)); }
.cw-ev-leaf { position: absolute; left: 14px; top: 14px; z-index: 2; width: 58px; height: 66px; border-radius: 16px; display: grid; place-content: center; text-align: center; background: linear-gradient(180deg, #fff, color-mix(in srgb, var(--fn) 14%, #fff)); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 60%, transparent), 0 10px 18px -10px rgba(110,40,58,.55); }
.cw-ev-leaf b { font: 500 28px/1 var(--wk-font-display); color: var(--wk-accent); }
.cw-ev-leaf small { margin-top: 3px; font: 700 10.5px/1 var(--wk-font-caps); letter-spacing: .16em; text-transform: uppercase; color: var(--wk-gold-ink); }
.cw-root.is-hi .cw-ev-leaf small { letter-spacing: 0; font-family: var(--wk-font-deva); font-size: 12px; }
.cw-ev-leaf.is-empty b { font-size: 22px; }
.cw-ev-info { position: relative; flex: 1; display: flex; flex-direction: column; gap: 12px; padding: 16px 22px 22px; border-top: 1px solid var(--cw-line); margin: 0 7px; }
.cw-ev-info::before { content: ""; position: absolute; left: 50%; top: -5px; width: 9px; height: 9px; transform: translateX(-50%) rotate(45deg); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px var(--wk-gold); }
.cw-ev-titles { min-width: 0; text-align: center; }
.cw-ev-wd { margin: 0 0 4px; font: 600 11.5px/1.2 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-muted); }
.cw-root.is-hi .cw-ev-wd { letter-spacing: .02em; font-family: var(--wk-font-deva); font-size: 13.5px; }
.cw-ev-title { margin: 0; font: 400 clamp(32px, 8.6vw, 40px)/1.15 var(--wk-font-script); color: var(--wk-accent); overflow-wrap: break-word; }
.cw-ev-title[lang=hi] { font: 600 clamp(24px, 6.4vw, 28px)/1.35 var(--wk-font-deva); }
.cw-ev-body { position: relative; display: grid; gap: 9px; }
.cw-ev-line { margin: 0; display: flex; gap: 10px; align-items: flex-start; font: 400 15px/1.45 var(--wk-font-sans); color: var(--wk-ink); }
.cw-ev-line svg { flex: none; margin-top: 2px; color: var(--wk-accent); }
.cw-ev-line b { display: block; font-weight: 600; }
.cw-ev-addr { display: block; color: var(--wk-muted); font-size: 14px; }
.cw-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; box-shadow: 0 0 0 2px var(--wk-surface-solid), 0 0 0 3px color-mix(in srgb, var(--wk-gold) 70%, transparent); }
.cw-ev-k { font-weight: 600; color: var(--wk-gold-ink); }
.cw-ev-note { margin: 2px 0 0; padding: 10px 14px; border-radius: 14px; font: italic 400 16px/1.5 var(--wk-font-display); color: var(--wk-muted); background: color-mix(in srgb, var(--fn) 9%, transparent); }
.cw-ev-actions { position: relative; margin-top: auto; padding-top: 4px; display: flex; flex-wrap: wrap; gap: 8px; }
.cw-ev-actions .cw-btn { flex: 1 1 auto; padding: 0 12px; }
.cw-ev-gcal { align-self: center; margin-top: -4px; padding: 6px 10px; font: 600 12.5px/1.2 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-gold-ink); text-decoration: underline; text-decoration-color: var(--cw-line); text-underline-offset: 4px; }
.cw-ev-gcal:hover { color: var(--wk-accent); }
.cw-ev-dots { display: flex; justify-content: center; gap: 8px; margin-top: 4px; }
.cw-ev-dots { gap: 0; }
.cw-ev-dots button { display: grid; place-items: center; min-width: 24px; height: 28px; padding: 0 2px; border: 0; background: none; cursor: pointer; }
.cw-ev-dots button::after { content: ""; width: 8px; height: 8px; border-radius: 999px; background: color-mix(in srgb, var(--wk-accent) 28%, transparent); transition: width .3s var(--cw-ease), background-color .3s ease; }
.cw-ev-dots button.is-on::after { width: 24px; background: var(--wk-accent); }
.cw-ev-all { display: flex; justify-content: center; margin-top: 28px; }

/* venue */
.cw-venue { position: relative; max-width: 680px; margin: 0 auto; }
.cw-venue-peony { position: absolute; z-index: 2; right: clamp(-46px, -6vw, -12px); top: clamp(-70px, -12vw, -40px); width: clamp(110px, 28vw, 190px); height: auto; pointer-events: none; filter: drop-shadow(0 12px 14px rgba(110,40,58,.18)); }
.cw-root .cw-venue .wk-venue { border-radius: 24px; }

/* film */
.cw-film { position: relative; aspect-ratio: 16 / 9; border-radius: 22px; overflow: hidden; box-shadow: inset 0 0 0 1px var(--cw-line), 0 26px 50px -34px rgba(60,20,30,.6); background: #000; }
.cw-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.cw-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: #000; }
.cw-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .85; }
.cw-film-play { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; transform: translate(-50%,-50%); border-radius: 50%; display: grid; place-items: center; color: #fff; background: linear-gradient(115deg, #8E3B52, #C47C82); box-shadow: 0 0 0 8px rgba(255,220,226,.3); }
.cw-film-label { position: absolute; left: 0; right: 0; bottom: 16px; text-align: center; font: 600 14px/1 var(--wk-font-sans); color: #FFF4F4; letter-spacing: .06em; }

/* gallery */
.cw-gallery { width: 100%; max-width: 1080px; margin: 0 auto; }

/* for our guests */
.cw-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 700px) { .cw-know { grid-template-columns: repeat(2, minmax(0, 1fr)); } .cw-know-wide { grid-column: 1 / -1; } }
.cw-know-i { padding: 18px 20px; border-radius: 20px; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px var(--cw-line); }
.cw-know-h { margin: 0 0 6px; font: 600 12px/1.2 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); }
.cw-know-t { margin: 0; font: 400 15.5px/1.55 var(--wk-font-sans); color: var(--wk-ink); }
.cw-info-block { margin-top: 30px; }
.cw-info-h { margin: 0 0 12px; text-align: center; font: 500 clamp(24px, 6vw, 30px)/1.2 var(--wk-font-display); color: var(--wk-ink); }
.cw-contacts { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 700px) { .cw-contacts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.cw-contact { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 20px; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px var(--cw-line); }
.cw-contact-ini { flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; font: 400 26px/1 var(--wk-font-script); color: var(--wk-accent); background: radial-gradient(circle at 50% 35%, #FFF7F5, color-mix(in srgb, var(--wk-accent) 18%, #fff)); box-shadow: inset 0 0 0 1px var(--cw-line); }
.cw-contact-who { flex: 1; min-width: 0; display: grid; gap: 2px; }
.cw-contact-who b { font: 600 16px/1.2 var(--wk-font-sans); color: var(--wk-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cw-contact-who small { font: 400 13.5px/1.25 var(--wk-font-sans); color: var(--wk-muted); }
.cw-contact-acts { display: flex; gap: 8px; }
.cw-shagun { max-width: 520px; margin: 0 auto; padding: 20px; border-radius: 22px; text-align: center; display: grid; gap: 12px; box-shadow: inset 0 0 0 1px var(--cw-line); }
.cw-shagun-line { margin: 0; font: italic 400 17px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.cw-shagun-id { margin: 0; display: grid; gap: 2px; }
.cw-shagun-id span { font: 600 19px/1.3 var(--wk-font-sans); color: var(--wk-ink); word-break: break-all; }
.cw-shagun-id small { color: var(--wk-muted); font-size: 13.5px; }
.cw-shagun-acts { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
@media (pointer: fine) { .cw-only-touch { display: none !important; } }
.cw-live { display: flex; justify-content: center; margin-top: 26px; }
.cw-live-dot { width: 9px; height: 9px; border-radius: 50%; background: #fff; animation: cw-live 1.6s ease-out infinite; }
@keyframes cw-live { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,.7); } 100% { box-shadow: 0 0 0 10px rgba(255,255,255,0); } }
.cw-live-soon { margin: 0; display: inline-flex; gap: 8px; align-items: center; padding: 10px 16px; border-radius: 999px; font: 500 14px/1.3 var(--wk-font-sans); color: var(--wk-muted); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px var(--cw-line); }

/* rsvp */
.cw-rsvp { position: relative; }
.cw-rsvp-peony { position: absolute; z-index: 2; left: clamp(-40px, -6vw, -10px); top: clamp(-80px, -14vw, -54px); width: clamp(96px, 24vw, 150px); height: auto; pointer-events: none; transform: scaleX(-1) rotate(-6deg); filter: drop-shadow(0 10px 12px rgba(110,40,58,.16)); }
.cw-upasthiti { margin: -4px 0 18px; text-align: center; font: 400 clamp(28px, 7.4vw, 38px)/1.2 var(--wk-font-script); color: var(--wk-accent); }
.cw-root.is-hi .cw-upasthiti { font: 500 22px/1.4 var(--wk-font-deva); }
.cw-root .wk-rsvp { border-radius: 24px; }
/* Devanagari never takes the caps letter-spacing (it breaks the shirorekha). */
.cw-root.is-hi .wk-rsvp-by, .cw-root.is-hi .wk-eyebrow, .cw-root.is-hi .wk-rsvp .wk-field-l, .cw-root.is-hi .wk-bless .wk-field-l, .cw-root.is-hi .cw-hero-time, .cw-root.is-hi .cw-day-time { letter-spacing: .01em; text-transform: none; font-family: var(--wk-font-deva), var(--wk-font-sans); }

/* finale */
.cw-finale { position: relative; padding: 70px 16px 0; text-align: center; overflow: clip; display: grid; justify-items: center; gap: 6px; background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--wk-bg2) 70%, transparent) 60%, var(--wk-bg2)); }
.cw-close { position: relative; width: clamp(130px, 34vw, 190px); margin-bottom: 10px; }
.cw-close-stage { position: relative; aspect-ratio: 908 / 1800; perspective: 900px; }
.cw-close .cw-ap-dawn { opacity: 1; transform: scale(1.2); }
.cw-close .cw-shutter { transition: transform 1.6s cubic-bezier(.5,0,.2,1); }
.cw-close .cw-shutter.is-l { transform: rotateY(-72deg); }
.cw-close .cw-shutter.is-r { transform: rotateY(72deg); transition-delay: .12s; }
.cw-close.is-closed .cw-shutter { transform: none; }
@media (min-width: 1024px) { .cw-close { width: clamp(180px, 15vw, 230px); } }
.cw-finale-seal { margin: 6px 0 0; display: grid; gap: 2px; }
.cw-finale-seal b { font: 600 clamp(30px, 8vw, 42px)/1.2 var(--wk-font-deva); color: #8E3B52; }
.cw-finale-seal small { font: 600 12px/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
.cw-finale-names { margin: 6px 0 0; font: 400 clamp(46px, 12vw, 80px)/1.12 var(--wk-font-script); padding: 0 .12em; max-width: 100%; text-wrap: balance; }
.cw-finale-names span { font-family: var(--wk-font-display); font-size: .5em; }
.cw-finale-line { margin: 0; max-width: 32rem; font: italic 400 clamp(17px, 4.4vw, 21px)/1.45 var(--wk-font-display); color: var(--wk-muted); text-wrap: balance; }
.cw-hashtag { margin: 4px 0 0; font: 600 15px/1 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-accent); }
.cw-finale-share { width: 100%; max-width: 660px; display: grid; justify-items: center; }
.cw-share { display: grid; gap: 16px; justify-items: center; margin-top: 18px; width: 100%; }
.cw-share-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.cw-personal { width: 100%; display: grid; gap: 8px; padding: 16px; border-radius: 22px; background: color-mix(in srgb, var(--wk-surface-solid) 88%, transparent); box-shadow: inset 0 0 0 1px var(--cw-line); text-align: left; }
.cw-personal-l { font: 600 12px/1.2 var(--wk-font-caps); letter-spacing: .18em; text-transform: uppercase; color: var(--wk-gold-ink); }
.cw-root.is-hi .cw-personal-l { letter-spacing: .02em; font-family: var(--wk-font-deva); font-size: 14px; }
.cw-personal-row { display: flex; flex-wrap: wrap; gap: 8px; }
.cw-personal-row .wk-input { flex: 1 1 170px; min-width: 0; min-height: 46px; font-size: 16px; }
.cw-share-note { min-height: 18px; margin: 0; font: 500 13.5px/1.3 var(--wk-font-sans); color: var(--wk-accent); word-break: break-all; }
.cw-replay { margin-top: 18px; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--wk-font-sans); color: var(--wk-gold-ink); cursor: pointer; }
.cw-finale-floor { position: relative; width: calc(100% + 32px); max-width: 1100px; height: clamp(150px, 34vw, 260px); margin: 22px -16px 0; pointer-events: none; }
.cw-finale-floor img { position: absolute; bottom: -6px; height: 100%; width: auto; }
.cw-finale-pampas.is-l { left: -4%; }
.cw-finale-pampas.is-r { right: -4%; transform: scaleX(-1); }
.cw-finale-peony { left: 50%; height: 80% !important; transform: translateX(-50%); bottom: -10px !important; filter: drop-shadow(0 -4px 12px rgba(110,40,58,.12)); }

/* the QR dialog (portalled to <body>, so no theme tokens here) */
.cw-qr-scrim { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(44,16,24,.55); animation: cw-fade .25s ease both; }
.cw-qr { width: min(320px, 100%); padding: 22px 20px 16px; border-radius: 24px; background: #FFFBF9; text-align: center; box-shadow: 0 30px 60px -20px rgba(40,10,20,.5); display: grid; justify-items: center; gap: 10px; font-family: system-ui, sans-serif; }
.cw-qr svg { width: 232px; height: 232px; max-width: 100%; border-radius: 12px; }
.cw-qr p { margin: 0; font-size: 15px; color: #4A2630; }
.cw-qr-close { min-height: 44px; min-width: 120px; border: 0; border-radius: 999px; background: #8E3B52; color: #fff; font: 600 14px/1 system-ui, sans-serif; cursor: pointer; }
@keyframes cw-fade { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .cw-root *, .cw-root *::before, .cw-root *::after { animation-duration: .001s !important; animation-iteration-count: 1 !important; transition-duration: .001s !important; transition-delay: 0s !important; }
  .cw-hero-crown, .cw-hero-words > *, .cw-hero-scene, .cw-hero-tree, .cw-hero-down { opacity: 1 !important; transform: none !important; }
  .cw-hero-petals, .cw-hero-twinkle { display: none !important; }
  .cw-hero-arch-line { stroke-dashoffset: 0 !important; }
}
`;
