// ─── The wedding kit stylesheet (injected once by WeddingRoot / WeddingKitStyles) ─
//
// Everything reads the theme's --wk-* tokens (themes.ts) and the --font-wk-*
// faces (fonts.ts). Motion is transform/opacity only and switched off under
// prefers-reduced-motion. Class prefix: wk-.

export const WEDDING_KIT_CSS = /* css */ `
.wk-root, .wk-tp-card, .wk-dash, .wk-ed {
  --wk-font-display: var(--font-wk-display), var(--font-wk-deva), var(--font-wk-guru), var(--font-wk-urdu), var(--font-wk-tamil), var(--font-wk-telugu), var(--font-wk-kannada), var(--font-wk-malayalam), "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --wk-font-caps: var(--font-wk-caps), var(--font-wk-deva), var(--font-wk-guru), var(--font-wk-urdu), var(--font-wk-tamil), var(--font-wk-telugu), var(--font-wk-kannada), var(--font-wk-malayalam), "Cinzel", Georgia, serif;
  --wk-font-script: var(--font-wk-script), var(--font-wk-deva), var(--font-wk-guru), var(--font-wk-urdu), var(--font-wk-tamil), var(--font-wk-telugu), var(--font-wk-kannada), var(--font-wk-malayalam), "Great Vibes", cursive;
  --wk-font-sans: var(--font-wk-sans), var(--font-wk-deva), var(--font-wk-guru), var(--font-wk-urdu), var(--font-wk-tamil), var(--font-wk-telugu), var(--font-wk-kannada), var(--font-wk-malayalam), system-ui, -apple-system, "Segoe UI", sans-serif;
  --wk-font-deva: var(--font-wk-deva), var(--font-wk-guru), var(--font-wk-urdu), var(--font-wk-tamil), var(--font-wk-telugu), var(--font-wk-kannada), var(--font-wk-malayalam), "Noto Serif Devanagari", serif;
  --wk-ease: cubic-bezier(.22, .8, .24, 1);
  --wk-ease-soft: cubic-bezier(.4, 0, .2, 1);
  --wk-radius: 20px;
}
.wk-root { position: relative; isolation: isolate; color: var(--wk-ink); font-family: var(--wk-font-display); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.wk-root *, .wk-root *::before, .wk-root *::after { box-sizing: border-box; }
.wk-bg { min-height: 100%; background-color: var(--wk-bg); background-image: radial-gradient(120% 70% at 50% -10%, var(--wk-bg2) 0%, transparent 62%), radial-gradient(90% 60% at 50% 115%, var(--wk-bg2) 0%, transparent 70%); }
.wk-bg::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: var(--wk-texture); background-size: 256px 256px; opacity: var(--wk-texture-opacity); mix-blend-mode: multiply; }
[data-wk-dark].wk-bg::before { mix-blend-mode: screen; }
.wk-sr, .wk-root .wk-sr { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.wk-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

/* ── Foil ─────────────────────────────────────────────────────────────── */
.wk-foil-text { background-image: var(--wk-foil); background-size: 220% 100%; background-position: 0% 50%; -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }
.wk-foil-border { border: 1px solid transparent; background: linear-gradient(var(--wk-surface-solid), var(--wk-surface-solid)) padding-box, var(--wk-foil) border-box; background-size: 100% 100%, 220% 100%; }
.wk-foil-rule { display: block; height: 1px; border: 0; background: var(--wk-foil); background-size: 220% 100%; opacity: .9; }
.wk-orn { display: block; flex: none; }
.wk-orn-foil, .wk-orn-ink { -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; }
.wk-orn-foil { background-image: var(--wk-foil); background-size: 220% 100%; background-position: 0% 50%; }
.wk-orn-ink { background: currentColor; }
.wk-shimmer, .wk-foil-border.wk-shimmer { animation: wk-sheen 7.5s var(--wk-ease-soft) infinite alternate; }
@keyframes wk-sheen { from { background-position: 0% 50%, 0% 50%; } to { background-position: 0% 50%, 100% 50%; } }
.wk-foil-text.wk-shimmer, .wk-orn-foil.wk-shimmer { animation-name: wk-sheen1; }
@keyframes wk-sheen1 { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
.wk-divider { display: flex; justify-content: center; }
.wk-corner { pointer-events: none; opacity: .95; }

/* ── Type ─────────────────────────────────────────────────────────────── */
.wk-eyebrow { margin: 0 0 10px; font-family: var(--wk-font-caps); font-size: 12px; font-weight: 500; letter-spacing: .32em; text-transform: uppercase; color: var(--wk-gold-ink); }
.wk-h2 { margin: 0; font-family: var(--wk-font-display); font-weight: 500; font-size: clamp(32px, 6.4vw, 54px); line-height: 1.08; letter-spacing: .005em; }
.wk-script { font-family: var(--wk-font-script); font-weight: 400; line-height: 1.15; }
.wk-root p { text-wrap: pretty; }
.wk-root [lang="hi"], .wk-root .is-deva { font-family: var(--wk-font-deva); line-height: 1.85; letter-spacing: 0; }

/* ── Layout ───────────────────────────────────────────────────────────── */
.wk-section { position: relative; padding: clamp(56px, 11vw, 120px) 16px; margin: 0 auto; }
.wk-w-narrow { max-width: 680px; } .wk-w-normal { max-width: 1000px; } .wk-w-wide { max-width: 1240px; } .wk-w-full { max-width: none; }
.wk-section-head { text-align: center; margin-bottom: clamp(26px, 5vw, 44px); }
.wk-card { position: relative; border-radius: var(--wk-radius); background: var(--wk-surface); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); padding: clamp(20px, 4.5vw, 34px); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.wk-card.wk-foil-border { border-color: transparent; background: linear-gradient(var(--wk-surface-solid), var(--wk-surface-solid)) padding-box, var(--wk-foil) border-box; background-size: 100% 100%, 220% 100%; }
.wk-card.wk-foil-border.wk-paper { background: var(--wk-paper) padding-box, linear-gradient(var(--wk-surface-solid), var(--wk-surface-solid)) padding-box, var(--wk-foil) border-box; background-size: 512px 512px, 100% 100%, 220% 100%; background-blend-mode: multiply, normal, normal; }
[data-wk-dark] .wk-card.wk-foil-border.wk-paper { background-blend-mode: soft-light, normal, normal; }
.wk-paper { background-color: var(--wk-surface-solid); background-image: var(--wk-paper); background-size: 512px 512px; background-blend-mode: multiply; }
[data-wk-dark] .wk-paper { background-blend-mode: soft-light; }

/* ── Buttons & fields ─────────────────────────────────────────────────── */
.wk-btn { -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 24px; border-radius: 999px; border: 0; cursor: pointer; text-decoration: none; font: 600 15px/1 var(--wk-font-sans); letter-spacing: .02em; color: var(--wk-accent-ink); background: var(--wk-accent); box-shadow: 0 10px 24px -12px var(--wk-accent), inset 0 1px 0 rgba(255,255,255,.22); transition: transform .25s var(--wk-ease), box-shadow .25s var(--wk-ease), filter .2s; }
.wk-btn:hover { transform: translateY(-1px); filter: brightness(1.04); }
.wk-btn:active { transform: translateY(1px) scale(.99); }
.wk-btn:disabled { opacity: .55; cursor: default; transform: none; }
.wk-btn:focus-visible, .wk-root button:focus-visible, .wk-root a:focus-visible, .wk-input:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 3px; }
.wk-btn-ghost { color: var(--wk-ink); background: linear-gradient(var(--wk-surface-solid), var(--wk-surface-solid)) padding-box, var(--wk-foil) border-box; border: 1px solid transparent; box-shadow: none; }
.wk-btn-sm { min-height: 44px; padding: 0 16px; font-size: 13.5px; }
.wk-btn-lg { min-height: 54px; width: 100%; font-size: 16px; }
.wk-field { display: grid; gap: 7px; margin: 0 0 16px; padding: 0; border: 0; min-width: 0; }
.wk-field-l { font: 600 13px/1.3 var(--wk-font-sans); color: var(--wk-ink); letter-spacing: .01em; padding: 0; }
.wk-field-l small { font-weight: 400; color: var(--wk-muted); }
.wk-input { width: 100%; min-height: 48px; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--wk-border); background: var(--wk-surface-2); color: var(--wk-ink); font: 400 16px/1.4 var(--wk-font-sans); transition: border-color .2s, background .2s; }
.wk-input::placeholder { color: var(--wk-muted); opacity: .75; }
.wk-input:focus { border-color: var(--wk-gold); outline: none; }
.wk-area { resize: vertical; min-height: 92px; }
.wk-err { margin: 4px 0 14px; color: #c0392b; font: 500 14px/1.4 var(--wk-font-sans); }
[data-wk-dark] .wk-err { color: #ff9b8f; }
.wk-ok { margin: 12px 0 0; color: var(--wk-gold-ink); font: 500 14px/1.4 var(--wk-font-sans); }

/* ── Reveal ───────────────────────────────────────────────────────────── */
.wk-reveal { opacity: 0; transition: opacity .9s var(--wk-ease) var(--wk-delay, 0ms), transform 1.1s var(--wk-ease) var(--wk-delay, 0ms), filter 1s var(--wk-ease) var(--wk-delay, 0ms); will-change: opacity, transform; }
.wk-reveal-rise { transform: translate3d(0, 28px, 0); }
.wk-reveal-zoom { transform: scale(.9); }
.wk-reveal-blur { filter: blur(10px); transform: scale(1.02); }
.wk-reveal.is-in { opacity: 1; transform: none; filter: none; }

/* ── Masonry ──────────────────────────────────────────────────────────── */
.wk-masonry { position: relative; width: 100%; contain: layout; }
.wk-m-tile { position: absolute; top: 0; left: 0; will-change: transform; }
.wk-masonry.is-fluid .wk-m-tile { transition: transform .45s var(--wk-ease), width .35s var(--wk-ease), height .35s var(--wk-ease); }
.wk-masonry.is-fluid .wk-m-tile.is-dragging { transition: width .2s, height .2s; z-index: 5; }
.wk-m-inner { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--wk-placeholder); box-shadow: 0 14px 32px -20px rgba(0,0,0,.55); opacity: 0; transform: translate3d(0, 22px, 0) scale(.97); transition: opacity .8s var(--wk-ease) var(--wk-delay, 0ms), transform 1s var(--wk-ease) var(--wk-delay, 0ms), box-shadow .3s; }
.wk-m-tile.is-in .wk-m-inner { opacity: 1; transform: none; }
.wk-m-inner::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
.wk-m-frame-foil .wk-m-inner { padding: 1.5px; background: var(--wk-foil); background-size: 220% 100%; }
.wk-m-frame-foil .wk-m-hit { border-radius: inherit; }
.wk-m-frame-mat .wk-m-inner { padding: clamp(5px, 1.2vw, 9px); background: var(--wk-surface-solid); }
.wk-m-hit { display: block; position: relative; width: 100%; height: 100%; padding: 0; margin: 0; border: 0; background: var(--wk-placeholder); overflow: hidden; cursor: zoom-in; -webkit-tap-highlight-color: transparent; }
.wk-m-hit:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 2px; }
.wk-m-img { display: block; width: 100%; height: 100%; object-fit: cover; opacity: 0; filter: blur(16px) saturate(1.1); transform: scale(1.06); transition: opacity .7s var(--wk-ease-soft), filter .9s var(--wk-ease-soft), transform 1.2s var(--wk-ease); }
.wk-m-img.is-loaded { opacity: 1; filter: none; transform: none; }
@media (hover: hover) { .wk-m-hit:hover .wk-m-img.is-loaded { filter: brightness(1.04); } .wk-m-tile:hover .wk-m-inner { box-shadow: 0 22px 40px -20px rgba(0,0,0,.6); } }
.wk-m-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 28px 12px 10px; color: #fff; text-align: left; font: italic 500 15px/1.3 var(--wk-font-display); background: linear-gradient(transparent, rgba(0,0,0,.55)); pointer-events: none; }

/* ── Lightbox ─────────────────────────────────────────────────────────── */
.wk-lb { position: fixed; inset: 0; z-index: 2147483000; display: grid; grid-template-rows: auto 1fr auto; color: #fff; font-family: var(--wk-font-sans, system-ui), sans-serif; opacity: 0; transition: opacity .35s var(--wk-ease-soft); }
.wk-lb.is-open { opacity: 1; }
.wk-lb-scrim { position: absolute; inset: 0; background: var(--wk-scrim, rgba(10,6,8,.95)); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.wk-lb-top { position: relative; display: flex; align-items: center; justify-content: space-between; padding: max(10px, env(safe-area-inset-top)) 12px 6px 18px; z-index: 2; }
.wk-lb-count { font: 500 12px/1 var(--wk-font-caps, serif); letter-spacing: .28em; opacity: .85; }
.wk-lb-stage { position: relative; z-index: 1; overflow: hidden; display: grid; place-items: center; touch-action: none; user-select: none; -webkit-user-select: none; }
.wk-lb-img { max-width: min(94vw, 1400px); max-height: 100%; object-fit: contain; border-radius: 6px; box-shadow: 0 30px 80px -30px rgba(0,0,0,.8); transform-origin: center; transition: transform .35s var(--wk-ease); will-change: transform; animation: wk-lb-in .5s var(--wk-ease); }
@keyframes wk-lb-in { from { opacity: 0; transform: scale(.96); } }
.wk-lb-btn { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; border: 1px solid rgba(255,255,255,.22); background: rgba(255,255,255,.08); color: #fff; cursor: pointer; z-index: 3; transition: background .2s, transform .2s; }
.wk-lb-btn:hover { background: rgba(255,255,255,.16); }
.wk-lb-btn:focus-visible { outline: 2px solid var(--wk-gold, #d4af37); outline-offset: 2px; }
.wk-lb-prev, .wk-lb-next { position: absolute; top: 50%; margin-top: -23px; }
.wk-lb-prev { left: 14px; } .wk-lb-next { right: 14px; }
@media (max-width: 599px) { .wk-lb-prev, .wk-lb-next { top: auto; bottom: max(14px, env(safe-area-inset-bottom)); margin: 0; } }
.wk-lb-cap { position: relative; z-index: 2; text-align: center; padding: 12px 72px max(18px, env(safe-area-inset-bottom)); }
.wk-lb-capT { margin: 0; font: italic 500 19px/1.35 var(--wk-font-display, serif); }
.wk-lb-capN { margin: 6px auto 0; max-width: 560px; font-size: 14px; line-height: 1.55; opacity: .8; }

/* ── Countdown ────────────────────────────────────────────────────────── */
.wk-countdown { display: flex; justify-content: center; align-items: flex-start; gap: clamp(6px, 2vw, 14px); font-family: var(--wk-font-display); }
.wk-countdown.is-idle { min-height: 108px; }
.wk-countdown-done { text-align: center; font: 500 clamp(26px, 5vw, 38px)/1.2 var(--wk-font-display); margin: 0; }
.wk-cd-unit { display: grid; justify-items: center; gap: 10px; }
.wk-cd-label { font: 500 10.5px/1 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--wk-muted); }
.wk-cd-sep { padding-top: clamp(14px, 3.4vw, 22px); font-size: clamp(22px, 5vw, 34px); color: var(--wk-gold); opacity: .7; }
.wk-roll, .wk-flip { position: relative; min-width: clamp(58px, 15vw, 88px); height: clamp(68px, 17vw, 100px); padding: 0 6px; border-radius: 14px; font-size: clamp(36px, 9vw, 58px); font-weight: 500; font-variant-numeric: lining-nums tabular-nums; color: var(--wk-ink); }
.wk-roll { display: grid; place-items: center; overflow: hidden; background: var(--wk-surface); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
.wk-roll-v { display: block; animation: wk-roll .55s var(--wk-ease); }
@keyframes wk-roll { from { transform: translateY(60%); opacity: 0; } }
.wk-flip { perspective: 420px; }
.wk-flip-half { position: absolute; left: 0; right: 0; height: 50%; overflow: hidden; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.wk-flip-half i { position: absolute; left: 0; right: 0; height: 200%; display: grid; place-items: center; font-style: normal; }
.wk-flip-up { top: 0; border-radius: 14px 14px 0 0; border-bottom: 0; transform-origin: 50% 100%; box-shadow: inset 0 -1px 0 rgba(0,0,0,.18); }
.wk-flip-up i { top: 0; }
.wk-flip-down { bottom: 0; border-radius: 0 0 14px 14px; border-top: 0; transform-origin: 50% 0; box-shadow: var(--wk-shadow); }
.wk-flip-down i { bottom: 0; }
.wk-flip::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--wk-foil); opacity: .55; z-index: 4; }
.wk-flip-a { z-index: 3; animation: wk-flip-a .32s ease-in forwards; }
.wk-flip-b { z-index: 2; transform: rotateX(90deg); animation: wk-flip-b .32s ease-out .3s forwards; }
@keyframes wk-flip-a { to { transform: rotateX(-90deg); } }
@keyframes wk-flip-b { to { transform: rotateX(0deg); } }
[data-wk-dark] .wk-flip-half { background: color-mix(in srgb, var(--wk-surface-solid) 94%, #fff 6%); }

/* ── Events ───────────────────────────────────────────────────────────── */
.wk-events { position: relative; }
.wk-ev-list { list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(18px, 3vw, 28px); position: relative; }
.wk-events-timeline .wk-ev-list::before { content: ""; position: absolute; top: 8px; bottom: 8px; left: 11px; width: 1px; background: var(--wk-foil); opacity: .7; }
.wk-events-timeline .wk-ev { position: relative; padding-left: 40px; }
.wk-ev-dot { position: absolute; left: 5px; top: 30px; width: 13px; height: 13px; border-radius: 50%; background: var(--wk-foil); background-size: 220% 100%; box-shadow: 0 0 0 5px var(--wk-bg), 0 0 18px var(--wk-glow); }
.wk-events-cards .wk-ev-list { grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); }
.wk-events-cards .wk-ev-dot { display: none; }
@media (min-width: 860px) {
  .wk-events-timeline .wk-ev-list::before { left: 50%; }
  .wk-events-timeline .wk-ev { padding-left: 0; width: calc(50% - 36px); }
  .wk-events-timeline .wk-ev.is-right { margin-left: calc(50% + 36px); }
  .wk-events-timeline .wk-ev.is-left .wk-ev-dot { left: auto; right: -42.5px; }
  .wk-events-timeline .wk-ev.is-right .wk-ev-dot { left: -42.5px; }
  .wk-events-timeline .wk-ev.is-left .wk-ev-card { text-align: right; }
  .wk-events-timeline .wk-ev.is-left .wk-ev-time, .wk-events-timeline .wk-ev.is-left .wk-ev-venue, .wk-events-timeline .wk-ev.is-left .wk-ev-dress, .wk-events-timeline .wk-ev.is-left .wk-ev-actions { justify-content: flex-end; }
  .wk-events-timeline .wk-ev-list { gap: 8px; }
}
.wk-ev-card { padding: clamp(20px, 4vw, 28px); }
.wk-ev-date { margin-bottom: 6px; font-size: 11.5px; }
.wk-ev-title { margin: 0 0 10px; font: 500 clamp(26px, 5vw, 34px)/1.1 var(--wk-font-display); color: var(--wk-ink); }
.wk-ev-time, .wk-ev-venue, .wk-ev-dress { display: flex; align-items: flex-start; gap: 9px; margin: 0 0 8px; font: 400 15px/1.5 var(--wk-font-sans); color: var(--wk-ink); }
.wk-ev-time svg, .wk-ev-venue svg { flex: none; margin-top: 3px; color: var(--wk-gold); }
.wk-ev-venue b { display: block; font-weight: 600; }
.wk-ev-addr { display: block; color: var(--wk-muted); font-size: 14px; }
.wk-ev-k { font-family: var(--wk-font-caps); font-size: 10.5px; letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); margin-right: 4px; }
.wk-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 2px; border-radius: 50%; box-shadow: 0 0 0 2px var(--wk-surface-solid), 0 0 0 3px var(--wk-gold); }
.wk-ev-note { margin: 4px 0 8px; font: italic 400 16px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.wk-ev-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.wk-ev-all { display: flex; justify-content: center; margin-top: 28px; }

/* ── Venue ────────────────────────────────────────────────────────────── */
.wk-venue { text-align: center; display: grid; justify-items: center; gap: 4px; max-width: 560px; margin: 0 auto; }
.wk-venue-orn { margin: -2px auto 10px; }
.wk-venue-name { margin: 0; font: 500 clamp(28px, 6vw, 40px)/1.1 var(--wk-font-display); }
.wk-venue-addr { margin: 6px 0 0; font: 400 15px/1.55 var(--wk-font-sans); color: var(--wk-muted); }
.wk-venue-note { margin: 10px 0 0; font: italic 400 16px/1.5 var(--wk-font-display); }
.wk-venue-map { width: 100%; margin: 18px 0 6px; aspect-ratio: 16 / 10; border-radius: 14px; overflow: hidden; border: 1px solid var(--wk-border); background: var(--wk-placeholder); }
.wk-venue-map iframe { width: 100%; height: 100%; border: 0; }
.wk-venue-mapBtn { width: 100%; height: 100%; border: 0; background: transparent; color: var(--wk-ink); font: 600 14px var(--wk-font-sans); letter-spacing: .04em; cursor: pointer; }
.wk-venue .wk-btn { margin-top: 18px; }

/* ── RSVP ─────────────────────────────────────────────────────────────── */
.wk-rsvp { max-width: 580px; margin: 0 auto; overflow: hidden; }
.wk-rsvp-title { margin: 0 0 6px; text-align: center; font: 500 clamp(28px, 6vw, 38px)/1.12 var(--wk-font-display); }
.wk-rsvp-intro { margin: 0 0 22px; text-align: center; font: 400 15px/1.55 var(--wk-font-sans); color: var(--wk-muted); }
.wk-rsvp-by { display: block; margin-top: 4px; font-family: var(--wk-font-caps); font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--wk-gold-ink); }
.wk-seg { display: grid; gap: 8px; }
.wk-seg-3 { grid-template-columns: repeat(3, 1fr); } .wk-seg-2 { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 420px) { .wk-seg-3 { grid-template-columns: 1fr; } }
.wk-seg-o { position: relative; display: grid; gap: 2px; align-content: center; min-height: 64px; padding: 10px 12px; border-radius: 14px; border: 1px solid var(--wk-border); background: var(--wk-surface-2); cursor: pointer; text-align: center; transition: border-color .2s, background .2s, transform .2s var(--wk-ease); }
.wk-seg-o input { position: absolute; opacity: 0; pointer-events: none; }
.wk-seg-o b { font: 600 14.5px/1.25 var(--wk-font-sans); }
.wk-seg-o small { font: 400 12.5px/1.3 var(--wk-font-sans); color: var(--wk-muted); }
.wk-seg-o.is-on { border-color: transparent; background: linear-gradient(var(--wk-surface-solid), var(--wk-surface-solid)) padding-box, var(--wk-foil) border-box; box-shadow: 0 0 0 1px var(--wk-gold), 0 10px 24px -16px var(--wk-gold); }
.wk-seg-o:has(input:focus-visible) { outline: 2px solid var(--wk-gold); outline-offset: 2px; }
.wk-stepper { display: inline-flex; align-items: center; gap: 4px; padding: 4px; border-radius: 999px; border: 1px solid var(--wk-border); background: var(--wk-surface-2); justify-self: start; }
.wk-stepper button { width: 44px; height: 44px; border-radius: 50%; border: 0; background: var(--wk-surface-solid); color: var(--wk-ink); font: 500 22px/1 var(--wk-font-sans); cursor: pointer; }
.wk-stepper button:disabled { opacity: .35; cursor: default; }
.wk-stepper output { min-width: 44px; text-align: center; font: 600 20px/1 var(--wk-font-sans); }
.wk-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.wk-chip { position: relative; display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--wk-border); background: var(--wk-surface-2); cursor: pointer; font: 500 14px/1 var(--wk-font-sans); transition: background .2s, border-color .2s, color .2s; }
.wk-chip input { position: absolute; opacity: 0; pointer-events: none; }
.wk-chip.is-on { background: var(--wk-accent); color: var(--wk-accent-ink); border-color: var(--wk-accent); }
.wk-chip:has(input:focus-visible) { outline: 2px solid var(--wk-gold); outline-offset: 2px; }
.wk-rsvp.is-done { text-align: center; display: grid; justify-items: center; gap: 6px; padding-block: clamp(30px, 6vw, 46px); }
.wk-rsvp-thanks { margin: 0; font: 400 clamp(40px, 9vw, 58px)/1.15 var(--wk-font-script); padding: 0 .1em; }
.wk-rsvp-summary { margin: 4px 0 6px; max-width: 420px; font: 400 16px/1.55 var(--wk-font-sans); color: var(--wk-ink); }
.wk-rsvp-events { margin: 0 0 14px; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); }
.wk-rsvp.is-done .wk-btn { margin-top: 10px; }
.wk-rsvp-preview { margin: 12px 0 0; text-align: center; font: 400 12.5px/1.4 var(--wk-font-sans); color: var(--wk-muted); }
.wk-burst { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 3; }
.wk-burst-bit { position: absolute; top: -30px; opacity: 0; animation-name: wk-fall; animation-timing-function: cubic-bezier(.3,.6,.4,1); animation-fill-mode: forwards; will-change: transform, opacity; }
.wk-burst-burst .wk-burst-bit { top: 45%; animation-name: wk-pop; }
@keyframes wk-fall { 0% { opacity: 0; transform: translate3d(0,0,0) rotate(0); } 12% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translate3d(var(--dx), calc(var(--dy) + 220px), 0) rotate(var(--rot)); } }
@keyframes wk-pop { 0% { opacity: 0; transform: translate3d(-50%,0,0) scale(.4); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate3d(calc(-50% + var(--dx) * 1.6), calc(var(--dy) * -.6), 0) rotate(var(--rot)) scale(1); } }

/* ── Blessings ────────────────────────────────────────────────────────── */
.wk-bless { display: grid; gap: clamp(22px, 4vw, 34px); }
.wk-bless-form { max-width: 580px; width: 100%; margin: 0 auto; }
.wk-notes { list-style: none; margin: 0; padding: 0; columns: 2 220px; column-gap: 14px; }
@media (min-width: 1024px) { .wk-notes { columns: 3 260px; } }
.wk-note { break-inside: avoid; margin: 0 0 14px; padding: 18px 18px 14px; border-radius: 16px; background: var(--wk-surface); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); transform: rotate(var(--wk-tilt, 0deg)); transition: transform .4s var(--wk-ease); }
.wk-note:hover { transform: rotate(0) translateY(-2px); }
.wk-note.is-fresh { animation: wk-note-in .8s var(--wk-ease); box-shadow: 0 0 0 1px var(--wk-gold), var(--wk-shadow); }
@keyframes wk-note-in { from { opacity: 0; transform: translateY(-14px) scale(.96); } }
.wk-note-q { display: block; height: 26px; margin: -4px 0 2px; font: 500 48px/1 var(--wk-font-display); }
.wk-note-msg { margin: 0; font: italic 400 18px/1.5 var(--wk-font-display); color: var(--wk-ink); white-space: pre-line; overflow-wrap: anywhere; }
.wk-note-msg[lang="hi"] { font-style: normal; font-size: 17px; }
.wk-note-by { margin: 10px 0 0; font: 500 12px/1.3 var(--wk-font-caps); letter-spacing: .16em; text-transform: uppercase; color: var(--wk-gold-ink); }

/* ── Families / message / monogram ────────────────────────────────────── */
.wk-families { display: grid; gap: 18px; }
.wk-families-head { margin: 0; text-align: center; font: italic 400 clamp(20px, 4vw, 26px)/1.3 var(--wk-font-display); color: var(--wk-muted); }
.wk-families-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); }
.wk-family { text-align: center; }
.wk-family-photo { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; margin: 0 auto 14px; display: block; box-shadow: 0 0 0 2px var(--wk-surface-solid), 0 0 0 3px var(--wk-gold); }
.wk-family-names { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font: 500 clamp(20px, 4vw, 24px)/1.35 var(--wk-font-display); }
.wk-family-note { margin: 10px 0 0; font: 400 14px/1.5 var(--wk-font-sans); color: var(--wk-muted); }
.wk-msg { text-align: center; max-width: 720px; margin: 0 auto; }
.wk-msg-left { text-align: left; }
.wk-msg.is-two { max-width: 1040px; }
.wk-msg-orn { margin: 0 auto 18px; }
.wk-msg-heading { margin: 0 0 18px; font: 400 clamp(38px, 8vw, 60px)/1.15 var(--wk-font-script); color: var(--wk-gold-ink); }
.wk-msg-cols { display: grid; gap: 26px; }
@media (min-width: 860px) { .wk-msg.is-two .wk-msg-cols { grid-template-columns: 1fr 1px 1fr; } .wk-msg.is-two .wk-msg-cols::before { content: ""; grid-column: 2; grid-row: 1; background: var(--wk-foil); opacity: .6; } .wk-msg.is-two .wk-msg-text:last-child { grid-column: 3; grid-row: 1; } }
.wk-msg-text p { margin: 0 0 1em; font: 400 clamp(19px, 3.6vw, 23px)/1.65 var(--wk-font-display); color: var(--wk-ink); }
.wk-msg-text.is-deva p { font-family: var(--wk-font-deva); font-size: clamp(17px, 3.2vw, 20px); line-height: 1.95; }
.wk-dropcap::first-letter { float: left; margin: .06em .1em 0 0; font-size: 3.4em; line-height: .82; background: var(--wk-foil); background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }
.wk-msg-sign { margin: 6px 0 0; font: italic 500 18px/1.4 var(--wk-font-display); color: var(--wk-muted); }
.wk-mono { display: grid; justify-items: center; margin: 0 auto; }
.wk-mono-box { position: relative; display: grid; place-items: center; }
.wk-mono-crest { position: absolute; inset: 0; }
.wk-mono--text .wk-mono-box::before { content: ""; position: absolute; inset: 6%; border-radius: 50%; border: 1px solid var(--wk-gold); opacity: .6; }
.wk-mono-letters { position: relative; display: inline-flex; align-items: baseline; gap: .04em; font-family: var(--wk-font-display); font-weight: 500; line-height: 1; letter-spacing: .02em; background: var(--wk-foil); background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; padding: .1em; }
.wk-mono-crest + .wk-mono-letters, .wk-mono-crest ~ .wk-mono-letters { transform: translateY(4%); }
.wk-mono-amp { font-family: var(--wk-font-script); font-size: .62em; margin: 0 .04em; }
.wk-mono-letters.is-deva { font-family: var(--wk-font-deva); }
.wk-mono-cap { margin: 10px 0 0; font: 500 12px/1 var(--wk-font-caps); letter-spacing: .34em; color: var(--wk-gold-ink); }

/* ── Theme picker ─────────────────────────────────────────────────────── */
.wk-tp { display: grid; gap: 8px; color: #2b1d21; }
.wk-tp-group { margin: 6px 0 0; font: 600 11px/1 system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; opacity: .6; }
.wk-tp-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.wk-tp-chip { position: relative; display: grid; align-content: start; gap: 8px; padding: 6px 6px 10px; border-radius: 16px; border: 1.5px solid rgba(0,0,0,.1); background: #fff; color: #2b1d21; cursor: pointer; text-align: left; transition: border-color .2s, box-shadow .2s, transform .2s; -webkit-tap-highlight-color: transparent; }
.wk-tp-chip:hover { transform: translateY(-1px); }
.wk-tp-chip.is-on { border-color: #b08a3e; box-shadow: 0 0 0 3px rgba(176,138,62,.22); }
.wk-tp-chip:focus-visible { outline: 2px solid #b08a3e; outline-offset: 2px; }
.wk-tp-card { position: relative; display: grid; justify-items: center; align-content: center; gap: 4px; aspect-ratio: 4 / 3; border-radius: 11px; overflow: hidden; background: radial-gradient(120% 80% at 50% 0%, var(--wk-bg2), var(--wk-bg) 70%); color: var(--wk-ink); }
.wk-tp-frame { position: absolute; inset: 6px; border-radius: 7px; border: 1px solid transparent; background: var(--wk-foil) border-box; -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: .9; }
.wk-tp-eyebrow { font: 500 6.5px/1 var(--wk-font-caps); letter-spacing: .18em; white-space: nowrap; text-transform: uppercase; color: var(--wk-gold-ink); }
.wk-tp-names { font: 400 clamp(17px, 4.6vw, 22px)/1.1 var(--wk-font-script); padding: 0 4px; }
.wk-tp-rule { width: 38%; height: 1px; background: var(--wk-foil); }
.wk-tp-dot { position: absolute; right: 9px; bottom: 9px; width: 9px; height: 9px; border-radius: 50%; background: var(--wk-accent); box-shadow: 0 0 0 2px var(--wk-bg); }
.wk-tp-meta { display: grid; gap: 1px; padding: 0 4px; }
.wk-tp-meta b { font: 600 13px/1.25 system-ui, sans-serif; }
.wk-tp-meta small { font: 400 11.5px/1.3 system-ui, sans-serif; opacity: .65; }
.wk-tp-check { position: absolute; top: 0; right: 0; transform: translate(30%, -30%); width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; background: #b08a3e; color: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.2); }
@media (max-width: 380px) { .wk-tp-meta small { display: none; } }

/* ── Masonry editor (neutral chrome; works inside any editor) ─────────── */
.wk-ed { --ed-ink: #2b1d21; --ed-muted: #7a6a6e; --ed-line: rgba(43,29,33,.12); --ed-bg: #fff; --ed-soft: #f7f1ee; --ed-accent: var(--vw-accent, #9b2335); --wk-placeholder: linear-gradient(135deg,#efe6e1,#f8f3f0); --wk-gold: #b08a3e; --wk-foil: linear-gradient(105deg,#7a4f12,#c99a45,#f0d58e,#a87428); position: relative; display: grid; gap: 12px; color: var(--ed-ink); font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
.wk-ed.is-dropping::after { content: "Drop photos to add"; position: absolute; inset: -6px; z-index: 20; display: grid; place-items: center; border-radius: 18px; border: 2px dashed var(--ed-accent); background: rgba(255,255,255,.86); font-weight: 700; color: var(--ed-accent); }
.wk-ed-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.wk-ed-title { margin: 0; font-weight: 700; font-size: 15px; }
.wk-ed-hint { margin: 2px 0 0; font-size: 12.5px; color: var(--ed-muted); }
.wk-ed-count { flex: none; font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 99px; background: var(--ed-soft); }
.wk-ed-empty { display: grid; justify-items: center; gap: 6px; padding: 30px 16px; border-radius: 18px; border: 2px dashed color-mix(in srgb, var(--ed-accent) 55%, transparent); background: var(--ed-soft); color: var(--ed-ink); cursor: pointer; font: inherit; }
.wk-ed-empty svg { color: var(--ed-accent); }
.wk-ed-empty b { font-size: 15px; } .wk-ed-empty small { font-size: 12.5px; color: var(--ed-muted); }
.wk-ed-grid { position: relative; padding: 10px; border-radius: 18px; background: var(--ed-soft); user-select: none; -webkit-user-select: none; }
.wk-ed-grid.is-dragging { cursor: grabbing; }
.wk-ed-grid .wk-m-hit { cursor: pointer; }
.wk-ed-grid .wk-m-inner { opacity: 1; transform: none; }
.wk-ed-grid .wk-m-tile.is-selected .wk-m-inner { box-shadow: 0 0 0 3px var(--ed-accent), 0 14px 30px -18px rgba(0,0,0,.5); }
.wk-ed-grid .wk-m-tile.is-dragging .wk-m-inner { box-shadow: 0 26px 50px -20px rgba(0,0,0,.6); transform: scale(1.04) rotate(-1.2deg); }
.wk-ed-num { position: absolute; top: 7px; right: 7px; min-width: 22px; height: 22px; padding: 0 6px; display: grid; place-items: center; border-radius: 99px; background: rgba(255,255,255,.92); color: #2a1a22; font-size: 11.5px; font-weight: 800; pointer-events: none; }
.wk-ed-badge { position: absolute; bottom: 8px; left: 8px; padding: 3px 8px; border-radius: 99px; background: rgba(20,10,14,.62); color: #fff; font-size: 10.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; pointer-events: none; }
.wk-ed-handle { position: absolute; top: 2px; left: 2px; width: 44px; height: 44px; display: grid; place-items: center; padding: 0; border: 0; background: transparent; color: #2a1a22; cursor: grab; touch-action: none; -webkit-tap-highlight-color: transparent; }
.wk-ed-handle svg { width: 30px; height: 30px; padding: 7px; border-radius: 50%; background: rgba(255,255,255,.92); box-shadow: 0 2px 8px rgba(0,0,0,.18); }
.wk-ed-handle:focus-visible { outline: none; } .wk-ed-handle:focus-visible svg { box-shadow: 0 0 0 3px var(--ed-accent); }
.wk-ed-handle:active { cursor: grabbing; }
.wk-ed-progress { display: grid; gap: 6px; padding: 12px 14px; border-radius: 14px; background: var(--ed-soft); font-size: 13px; font-weight: 600; }
.wk-ed-bar { height: 6px; border-radius: 6px; background: #fff; overflow: hidden; }
.wk-ed-bar i { display: block; height: 100%; background: var(--ed-accent); border-radius: 6px; transition: width .3s; }
.wk-ed-undo { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 12px; background: #2b1d21; color: #fff; font-size: 13.5px; animation: wk-note-in .3s ease; }
.wk-ed-undo button { min-height: 36px; padding: 0 12px; border: 0; border-radius: 8px; background: rgba(255,255,255,.14); color: #fff; font-weight: 700; cursor: pointer; }
.wk-ed-panel { display: grid; gap: 14px; padding: 14px; border-radius: 18px; border: 1px solid var(--ed-line); background: var(--ed-bg); box-shadow: 0 16px 40px -28px rgba(0,0,0,.45); animation: wk-note-in .35s ease; scroll-margin: 16px; }
.wk-ed-panelHead { display: flex; justify-content: space-between; align-items: center; }
.wk-ed-x { width: 40px; height: 40px; border-radius: 50%; border: 0; background: var(--ed-soft); cursor: pointer; font-size: 14px; color: var(--ed-ink); }
.wk-ed-sizes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding: 4px; border-radius: 14px; background: var(--ed-soft); }
.wk-ed-sizes button { display: grid; justify-items: center; gap: 3px; min-height: 52px; padding: 6px 2px; border: 0; border-radius: 10px; background: transparent; color: var(--ed-muted); font: 600 12px/1 inherit; cursor: pointer; transition: background .2s, color .2s; }
.wk-ed-sizes button.is-on { background: #fff; color: var(--ed-ink); box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.wk-ed-sizes button.is-on svg { color: var(--ed-accent); }
.wk-ed-focus { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
.wk-ed-focusCol { display: grid; gap: 6px; min-width: 0; }
.wk-ed-lab { margin: 0; font-size: 12px; font-weight: 700; color: var(--ed-ink); }
.wk-ed-lab small { font-weight: 500; color: var(--ed-muted); }
.wk-ed-focal { position: relative; width: 100%; max-height: 260px; border-radius: 12px; overflow: hidden; background: var(--ed-soft); cursor: crosshair; touch-action: none; }
.wk-ed-focal img { display: block; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
.wk-ed-dot { position: absolute; width: 30px; height: 30px; margin: -15px 0 0 -15px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 2px var(--ed-accent), 0 0 0 9999px rgba(0,0,0,.18); pointer-events: none; transition: left .08s, top .08s; }
.wk-ed-dot::after { content: ""; position: absolute; inset: 11px; border-radius: 50%; background: #fff; }
.wk-ed-preview { width: 100%; max-height: 260px; border-radius: 12px; overflow: hidden; background: var(--wk-placeholder); box-shadow: 0 8px 20px -14px rgba(0,0,0,.5); }
.wk-ed-preview img { display: block; width: 100%; height: 100%; object-fit: cover; }
.wk-ed-zoom { display: grid; gap: 4px; margin-top: 4px; }
.wk-ed-zoom input { width: 100%; accent-color: var(--ed-accent); min-height: 32px; }
.wk-ed-field { display: grid; gap: 6px; }
.wk-ed-field .wk-ed-lab { display: flex; justify-content: space-between; }
.wk-ed-input { width: 100%; min-height: 46px; padding: 10px 12px; border-radius: 12px; border: 1.5px solid var(--ed-line); background: #fff; color: var(--ed-ink); font: 400 16px/1.3 inherit; }
.wk-ed-input:focus { outline: none; border-color: var(--ed-accent); }
.wk-ed-acts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.wk-ed-acts button { min-height: 44px; padding: 0 6px; border-radius: 11px; border: 1.5px solid var(--ed-line); background: #fff; color: var(--ed-ink); font: 600 13px/1.1 inherit; cursor: pointer; }
.wk-ed-acts button:disabled { opacity: .35; cursor: default; }
.wk-ed-acts .is-danger { color: #b3261e; }
@media (max-width: 420px) { .wk-ed-acts { grid-template-columns: 1fr 1fr; } }
.wk-ed-add { min-height: 48px; border-radius: 14px; border: 1.5px dashed color-mix(in srgb, var(--ed-accent) 55%, transparent); background: transparent; color: var(--ed-accent); font: 700 14px inherit; cursor: pointer; }
.wk-ed-add small { font-weight: 500; opacity: .7; }
.wk-ed .wk-err { color: #b3261e; font-size: 13px; margin: 0; }

/* ── Owner dashboard (neutral chrome; picks up --wk-* when themed) ────── */
.wk-dash { --d-ink: var(--wk-ink, #2b1d21); --d-muted: var(--wk-muted, #7a6a6e); --d-line: var(--wk-border, rgba(43,29,33,.12)); --d-bg: var(--wk-surface-solid, #fff); --d-soft: var(--wk-surface-2, #f7f1ee); --d-accent: var(--wk-accent, #9b2335); --d-accent-ink: var(--wk-accent-ink, #fff); display: grid; gap: 14px; color: var(--d-ink); font-family: var(--wk-font-sans, system-ui), system-ui, sans-serif; }
.wk-dash-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.wk-dash-head h3 { margin: 0; font-size: 17px; }
.wk-dash-acts { display: flex; gap: 8px; }
.wk-dash-btn { min-height: 40px; padding: 0 14px; border-radius: 99px; border: 1px solid var(--d-line); background: var(--d-bg); color: var(--d-ink); font: 600 13px/1 inherit; cursor: pointer; }
.wk-dash-btn.is-primary { background: var(--d-accent); color: var(--d-accent-ink); border-color: var(--d-accent); }
.wk-dash-btn:disabled { opacity: .5; cursor: default; }
.wk-dash-skel { height: 120px; border-radius: 16px; background: linear-gradient(90deg, var(--d-soft), var(--d-bg), var(--d-soft)); background-size: 200% 100%; animation: wk-sheen1 1.4s linear infinite; }
.wk-dash-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
@media (max-width: 480px) { .wk-dash-tiles { grid-template-columns: repeat(3, 1fr); } .wk-dash-tile.is-hero { grid-column: 1 / -1; } }
.wk-dash-tile { display: grid; gap: 2px; padding: 12px; border-radius: 14px; background: var(--d-soft); }
.wk-dash-tile b { font-size: 22px; font-variant-numeric: tabular-nums; }
.wk-dash-tile span { font-size: 12px; color: var(--d-muted); }
.wk-dash-tile.is-hero { background: var(--d-accent); color: var(--d-accent-ink); }
.wk-dash-tile.is-hero span { color: inherit; opacity: .85; }
.wk-dash-events { display: grid; gap: 8px; }
.wk-dash-ev { display: grid; grid-template-columns: minmax(80px, 30%) 1fr auto; gap: 10px; align-items: center; font-size: 13.5px; }
.wk-dash-evName { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wk-dash-bar { height: 8px; border-radius: 8px; background: var(--d-soft); overflow: hidden; }
.wk-dash-bar i { display: block; height: 100%; border-radius: 8px; background: var(--wk-foil, var(--d-accent)); transition: width .6s ease; }
.wk-dash-meals { margin: 0; font-size: 13px; color: var(--d-muted); }
.wk-dash-tabs { display: flex; gap: 4px; padding: 4px; border-radius: 12px; background: var(--d-soft); }
.wk-dash-tabs button { flex: 1; min-height: 40px; border: 0; border-radius: 9px; background: transparent; color: var(--d-muted); font: 600 13px inherit; cursor: pointer; }
.wk-dash-tabs button.is-on { background: var(--d-bg); color: var(--d-ink); box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.wk-dash-filters { display: grid; gap: 8px; }
.wk-dash-search { min-height: 44px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--d-line); background: var(--d-bg); color: var(--d-ink); font: 400 15px inherit; }
.wk-dash-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.wk-dash-chips button { min-height: 36px; padding: 0 12px; border-radius: 99px; border: 1px solid var(--d-line); background: var(--d-bg); color: var(--d-ink); font: 600 12.5px inherit; cursor: pointer; }
.wk-dash-chips button.is-on { background: var(--d-ink); color: var(--d-bg); border-color: var(--d-ink); }
.wk-dash-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.wk-dash-row { display: grid; gap: 4px; padding: 12px 14px; border-radius: 14px; border: 1px solid var(--d-line); background: var(--d-bg); }
.wk-dash-row.is-hidden { opacity: .55; }
.wk-dash-who { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.wk-dash-pill { flex: none; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; background: var(--d-soft); }
.wk-dash-pill.is-yes { background: #e3f3e6; color: #1f6b33; } .wk-dash-pill.is-maybe { background: #fbf0d6; color: #7a5a10; } .wk-dash-pill.is-no { background: #f6e1e1; color: #8a2a2a; }
.wk-dash-meta, .wk-dash-when { margin: 0; font-size: 12.5px; color: var(--d-muted); }
.wk-dash-msg { margin: 2px 0 0; font-size: 14px; line-height: 1.5; font-style: italic; overflow-wrap: anywhere; }
.wk-dash-empty { margin: 0; padding: 16px; text-align: center; border-radius: 14px; background: var(--d-soft); color: var(--d-muted); font-size: 14px; }

/* ── Reduced motion ───────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .wk-shimmer, .wk-foil-text.wk-shimmer, .wk-orn-foil.wk-shimmer, .wk-flip-a, .wk-flip-b, .wk-roll-v, .wk-lb-img, .wk-note.is-fresh, .wk-dash-skel { animation: none !important; }
  .wk-flip-a { display: none; } .wk-flip-b { transform: none; }
  .wk-reveal, .wk-m-inner { transition: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
  .wk-m-img { transition: opacity .3s linear !important; filter: none !important; }
  .wk-masonry.is-fluid .wk-m-tile, .wk-lb { transition: none !important; }
}
`;
