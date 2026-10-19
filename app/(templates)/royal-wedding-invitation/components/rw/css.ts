// ─── Royal Wedding Invitation — the page's own CSS (on top of the kit's) ────
// Every animated property is transform / opacity / filter-free; the door
// swing is a 3D rotateY under one perspective. Themes come from --wk-*.

export const RW_CSS = `
.rw-root { --rw-ease: cubic-bezier(.22,1,.36,1); --rw-door: #4a1020; --rw-light: #fff3d6; overflow-x: clip; }
.rw-root[data-wk-theme=noir] { --rw-door: #17130e; }
.rw-root[data-wk-theme=emerald] { --rw-door: #0d2b20; }
.rw-root[data-wk-theme=blush] { --rw-door: #6e2840; }
.rw-root[data-wk-theme=champagne] { --rw-door: #5e3f17; }
.rw-root[data-wk-theme=powder] { --rw-door: #223f66; }

/* ── Toran ─────────────────────────────────────────────── */
.rw-toran { position: absolute; left: 0; right: 0; top: 0; height: clamp(56px, 12vw, 92px); background-image: var(--wk-foil); background-size: 220% 100%;
  -webkit-mask: url(/wedding/ornaments/toran-strip.svg) repeat-x 0 0 / auto 100%; mask: url(/wedding/ornaments/toran-strip.svg) repeat-x 0 0 / auto 100%; pointer-events: none; z-index: 2; }

/* ── The gates ─────────────────────────────────────────── */
.rw-gate { position: fixed; inset: 0; z-index: 60; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(10px, 2.5vh, 26px);
  padding: calc(clamp(56px, 12vw, 92px) + 8px) 16px max(18px, env(safe-area-inset-bottom)); background: radial-gradient(120% 80% at 50% 38%, var(--wk-bg2), var(--wk-bg) 70%); overflow: hidden;
  transition: opacity .9s var(--rw-ease) 1.5s, transform 1.1s var(--rw-ease) 1.4s; }
.rw-gate-sky { position: absolute; inset: 0; background: var(--wk-texture); opacity: var(--wk-texture-opacity); pointer-events: none; }
.rw-gate.is-opening { opacity: 0; transform: scale(1.12); pointer-events: none; }
.rw-gate.is-reduced, .rw-gate.is-reduced.is-opening { transition: opacity .4s linear; transform: none; }
.rw-gate-stage { position: relative; display: flex; flex-direction: column; align-items: center; }
.rw-arch { position: relative; width: min(72vw, 330px, 40dvh); aspect-ratio: 3 / 4; perspective: 1400px; }
.rw-arch-frame { position: absolute; inset: -9% -10% -2%; width: auto !important; height: auto !important; aspect-ratio: auto !important; z-index: 3; filter: drop-shadow(0 6px 18px rgba(0,0,0,.35)); pointer-events: none; }
.rw-doors { position: absolute; inset: 7% 9% 0; display: flex; transform-style: preserve-3d; z-index: 2; }
.rw-door { position: relative; flex: 1 1 50%; height: 100%; transform-style: preserve-3d; transition: transform 1.7s cubic-bezier(.6,.04,.2,1) .25s; will-change: transform; }
.rw-door-left { transform-origin: 0% 50%; }
.rw-door-right { transform-origin: 100% 50%; }
.rw-door-face { position: absolute; inset: 0; color: var(--wk-gold); --w-door: var(--rw-door); backface-visibility: hidden; filter: drop-shadow(0 10px 22px rgba(0,0,0,.45)); }
.rw-door-face svg { display: block; width: 100%; height: 100%; }
.rw-door-fallback { position: absolute; inset: 0; background: var(--rw-door); border: 2px solid var(--wk-gold); }
.rw-door-left .rw-door-fallback { border-radius: 100% 0 0 0 / 40% 0 0 0; }
.rw-door-right .rw-door-fallback { border-radius: 0 100% 0 0 / 0 40% 0 0; }
.rw-gate.is-opening .rw-door-left { transform: rotateY(-108deg); }
.rw-gate.is-opening .rw-door-right { transform: rotateY(108deg); }
.rw-light { position: absolute; inset: 7% 9% 0; border-radius: 50% 50% 0 0 / 34% 34% 0 0; background: radial-gradient(60% 55% at 50% 60%, #fff, var(--rw-light) 35%, rgba(255,214,140,.6) 60%, rgba(255,190,110,0) 80%);
  opacity: .14; transform: scale(.9); transition: opacity 1.2s var(--rw-ease) .45s, transform 1.6s var(--rw-ease) .45s; z-index: 1; }
.rw-gate.is-opening .rw-light { opacity: 1; transform: scale(1.9); }
.rw-seal { position: absolute; left: 50%; top: 55%; width: clamp(74px, 22vw, 96px); aspect-ratio: 1; transform: translate(-50%, -50%); z-index: 4; border: 0; padding: 0; background: none; cursor: pointer; color: #8e1b2e;
  transition: transform .5s var(--rw-ease), opacity .4s; -webkit-tap-highlight-color: transparent; animation: rw-breathe 2.8s ease-in-out infinite; }
.rw-seal-wax { position: absolute; inset: 0; width: 100% !important; color: #8e1b2e; filter: drop-shadow(0 4px 8px rgba(0,0,0,.45)); }
.rw-root[data-wk-theme=noir] .rw-seal, .rw-root[data-wk-theme=noir] .rw-seal-wax { color: #7d1220; }
.rw-root[data-wk-theme=emerald] .rw-seal, .rw-root[data-wk-theme=emerald] .rw-seal-wax { color: #7d1220; }
.rw-seal-ini { position: absolute; inset: 0; display: grid; place-items: center; grid-auto-flow: column; justify-content: center; align-items: center; gap: 2px; font: 600 clamp(20px, 6vw, 26px)/1 var(--wk-font-caps); color: #f6dc9a; text-shadow: 0 1px 0 rgba(0,0,0,.35); }
.rw-seal-ini i { font: italic 400 .62em var(--wk-font-display); opacity: .9; }
.rw-seal:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 6px; border-radius: 50%; }
.rw-gate.is-opening .rw-seal { transform: translate(-50%, -50%) scale(1.25); opacity: 0; animation: none; }
@keyframes rw-breathe { 0%,100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.06); } }
.rw-diyas { position: relative; width: min(92vw, 420px); display: flex; justify-content: space-between; margin-top: -42px; z-index: 5; pointer-events: none; }
.rw-diya { position: relative; display: block; }
.rw-flame { position: absolute; left: 50%; top: -14px; width: 16px; height: 26px; margin-left: -8px; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(50% 60% at 50% 70%, #fff8dc, #ffd36b 45%, #ff8a1f 80%, rgba(255,120,20,0)); transform-origin: 50% 90%; animation: rw-flicker 1.6s ease-in-out infinite alternate; }
.rw-flame::after { content: ""; position: absolute; left: 50%; top: 40%; width: 90px; height: 90px; margin: -45px 0 0 -45px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,190,90,.38), rgba(255,170,60,0)); animation: rw-glow 2.2s ease-in-out infinite alternate; }
@keyframes rw-flicker { 0% { transform: scale(1, 1) rotate(-2deg); opacity: .92; } 40% { transform: scale(.94, 1.08) rotate(2deg); } 100% { transform: scale(1.04, .95) rotate(-1deg); opacity: 1; } }
@keyframes rw-glow { from { opacity: .7; transform: scale(.92); } to { opacity: 1; transform: scale(1.08); } }
.rw-gate-copy { position: relative; z-index: 5; text-align: center; transition: opacity .5s; }
.rw-gate.is-opening .rw-gate-copy { opacity: 0; }
.rw-gate-names { margin: 0; font: 400 clamp(38px, 11vw, 64px)/1.1 var(--wk-font-script); padding: 0 .1em; }
.rw-gate-names span { font-size: .6em; }
.rw-gate-date { margin: 4px 0 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .34em; color: var(--wk-muted); }
.rw-gate-cta { margin-top: 14px; min-height: 48px; padding: 0 22px; border-radius: 999px; border: 1px solid var(--wk-border); background: var(--wk-surface); color: var(--wk-gold-ink); font: 600 14px/1 var(--wk-font-sans); letter-spacing: .04em; cursor: pointer; animation: rw-pulse 2.4s ease-in-out infinite; }
@keyframes rw-pulse { 0%,100% { box-shadow: 0 0 0 0 var(--wk-glow); } 50% { box-shadow: 0 0 0 10px rgba(0,0,0,0); } }
.rw-gate-petals { position: absolute; inset: 0; z-index: 6; pointer-events: none; }
.rw-gate-petals .wk-burst { position: absolute; inset: 0; }
@media (max-height: 520px) {
  .rw-gate { flex-direction: row; gap: 28px; padding-top: 56px; }
  .rw-arch { width: min(36vw, 46dvh); }
  .rw-diyas { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 130%; }
  .rw-toran { height: 48px; }
}

/* Devanagari breaks under letter-spacing: Hindi mode sets it to zero on the spaced-caps lines. */
.rw-root.is-hi .wk-eyebrow, .rw-root.is-hi .rw-hero-date, .rw-root.is-hi .wk-ev-date, .rw-root.is-hi .wk-ev-k, .rw-root.is-hi .rw-count-line, .rw-root.is-hi .wk-cd-label { letter-spacing: 0 !important; }

/* ── Language toggle ───────────────────────────────────── */
.rw-lang { position: fixed; z-index: 55; top: max(10px, env(safe-area-inset-top)); left: 12px; display: flex; padding: 3px; border-radius: 999px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
.rw-lang button { min-width: 44px; min-height: 38px; padding: 0 10px; border: 0; border-radius: 999px; background: none; color: var(--wk-muted); font: 600 13px/1 var(--wk-font-sans); cursor: pointer; }
.rw-lang button[aria-pressed=true] { background: var(--wk-accent); color: var(--wk-accent-ink); }

/* ── Hero ──────────────────────────────────────────────── */
.rw-hero { position: relative; min-height: 100svh; display: grid; place-items: center; overflow: hidden; isolation: isolate; text-align: center; padding: clamp(96px, 16vh, 140px) 16px 90px; }
.rw-hero-photo { position: absolute; inset: 0; z-index: -2; }
.rw-hero-photo img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.12); transition: transform 14s cubic-bezier(.25,.1,.25,1); will-change: transform; }
.rw-hero.is-open .rw-hero-photo img { transform: scale(1); }
.rw-hero-scrim { position: absolute; inset: 0; z-index: -1; background: radial-gradient(85% 60% at 50% 48%, color-mix(in srgb, var(--wk-bg) 58%, transparent), color-mix(in srgb, var(--wk-bg) 86%, transparent) 75%), linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 55%, transparent), transparent 30%, transparent 70%, var(--wk-bg)); }
.rw-root:not([data-wk-dark]) .rw-hero-scrim { background: radial-gradient(70% 46% at 50% 52%, color-mix(in srgb, var(--wk-bg) 93%, transparent), color-mix(in srgb, var(--wk-bg) 80%, transparent) 70%, color-mix(in srgb, var(--wk-bg) 55%, transparent) 100%), linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 50%, transparent), transparent 30%, transparent 70%, var(--wk-bg)); }
.rw-root:not([data-wk-dark]) .rw-hero-date, .rw-root:not([data-wk-dark]) .rw-hero-muhurat, .rw-root:not([data-wk-dark]) .rw-hero-venue { color: var(--wk-ink); }
.rw-hero-mandala { position: absolute; inset: 0; display: grid; place-items: center; z-index: -2; opacity: .14; animation: rw-spin 120s linear infinite; }
@keyframes rw-spin { to { transform: rotate(360deg); } }
.rw-hero-in { position: relative; max-width: 760px; display: flex; flex-direction: column; align-items: center; }
.rw-hero-crest { min-height: 140px; margin-bottom: 6px; }
.rw-hero-names { margin: 6px 0 0; display: flex; flex-direction: column; align-items: center; font: 400 clamp(40px, min(16vw, 15vh), 128px)/1.02 var(--wk-font-script); }
@media (max-height: 520px) { .rw-hero { padding-top: 64px; } .rw-hero-crest { min-height: 0; transform: scale(.7); margin: -22px 0 -8px; } .rw-hero-names { flex-direction: row; gap: .2em; align-items: baseline; } }
.rw-hero-names .wk-foil-text { padding: 0 .12em; }
.rw-amp { font: italic 400 clamp(22px, 5vw, 34px)/1.4 var(--wk-font-display); color: var(--wk-gold-ink); }
.rw-hero-inv { margin: 18px 0 0; font: italic 400 clamp(19px, 4.4vw, 26px)/1.4 var(--wk-font-display); color: var(--wk-ink); }
.rw-hero-date { margin: 14px 0 0; font: 500 clamp(12px, 3.1vw, 14px)/1.6 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-gold-ink); }
.rw-hero-muhurat, .rw-hero-venue { margin: 6px 0 0; font: 400 15px/1.5 var(--wk-font-sans); color: var(--wk-muted); }
.rw-hero-in > * { opacity: 0; transform: translateY(18px); transition: opacity .9s var(--rw-ease), transform .9s var(--rw-ease); }
.rw-hero.is-open .rw-hero-in > * { opacity: 1; transform: none; }
.rw-hero.is-open .rw-hero-in > :nth-child(2) { transition-delay: .25s; } .rw-hero.is-open .rw-hero-in > :nth-child(3) { transition-delay: .4s; }
.rw-hero.is-open .rw-hero-in > :nth-child(4) { transition-delay: .6s; } .rw-hero.is-open .rw-hero-in > :nth-child(n+5) { transition-delay: .75s; }
.rw-scroll-cue { position: absolute; bottom: 22px; left: 50%; width: 1px; height: 46px; background: linear-gradient(var(--wk-gold), transparent); transform-origin: top; animation: rw-cue 2.4s var(--rw-ease) infinite; }
@keyframes rw-cue { 0% { transform: scaleY(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: scaleY(1); opacity: 0; } }

/* ── Invitation / families / countdown ──────────────────── */
.rw-invite { padding: clamp(28px, 6vw, 56px) clamp(18px, 5vw, 56px); }
.rw-blessings-of { text-align: center; margin: 0 auto 26px; max-width: 560px; }
.rw-blessings-names { margin: 0; font: italic 400 clamp(19px, 4.4vw, 24px)/1.45 var(--wk-font-display); }
.rw-count { text-align: center; overflow: hidden; }
.rw-count-ring { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); opacity: .08; pointer-events: none; animation: rw-spin 160s linear infinite; }
.rw-count-line { margin: 22px 0 0; font: italic 400 20px/1.4 var(--wk-font-display); color: var(--wk-gold-ink); }

/* ── Story ─────────────────────────────────────────────── */
.rw-story { --rw-p: 0; position: relative; padding: 8px 0; }
.rw-story-rail { position: absolute; top: 0; bottom: 0; left: 22px; width: 2px; background: var(--wk-border); }
.rw-story-rail i { position: absolute; inset: 0; background: var(--wk-foil); transform-origin: top; transform: scaleY(var(--rw-p)); }
.rw-drift { position: absolute; pointer-events: none; opacity: .14; z-index: 0; }
.rw-drift-a { right: -30px; top: 6%; transform: translate3d(0, calc(var(--rw-p) * -160px), 0); }
.rw-drift-b { left: -20px; bottom: 8%; transform: translate3d(0, calc(var(--rw-p) * 120px), 0) rotate(-12deg); }
.rw-chapters { list-style: none; margin: 0; padding: 0; position: relative; z-index: 1; display: grid; gap: clamp(36px, 7vw, 72px); }
.rw-ch { position: relative; padding-left: 58px; display: grid; gap: 16px; }
.rw-ch-dot { position: absolute; left: 9px; top: 2px; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: var(--wk-surface-solid); box-shadow: 0 0 0 4px var(--wk-bg); }
.rw-ch-photo { width: min(100%, 360px); aspect-ratio: 4 / 5; border-radius: 999px 999px 18px 18px / 320px 320px 18px 18px; overflow: hidden; padding: 3px; background: var(--wk-foil); box-shadow: var(--wk-shadow); }
.rw-ch-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block; }
.rw-ch-when { margin: 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .3em; color: var(--wk-gold-ink); }
.rw-ch-title { margin: 6px 0 0; font: 500 clamp(26px, 5.6vw, 36px)/1.15 var(--wk-font-display); }
.rw-ch-line { margin: 10px 0 0; font: 400 clamp(18px, 4vw, 21px)/1.6 var(--wk-font-display); color: var(--wk-muted); max-width: 46ch; }
@media (min-width: 860px) {
  .rw-story-rail { left: 50%; margin-left: -1px; }
  .rw-ch { padding-left: 0; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .rw-ch-dot { left: 50%; margin-left: -14px; top: 50%; margin-top: -14px; }
  .rw-ch-photo { justify-self: end; }
  .rw-ch.is-alt .rw-ch-photo { order: 2; justify-self: start; }
  .rw-ch.is-alt .rw-ch-text { text-align: right; justify-self: end; }
  .rw-ch.is-alt .rw-ch-line { margin-left: auto; }
  .rw-ch.no-photo .rw-ch-text { grid-column: 2; }
  .rw-ch.no-photo.is-alt .rw-ch-text { grid-column: 1; }
}

/* ── Film ──────────────────────────────────────────────── */
.rw-film { position: relative; aspect-ratio: 16 / 9; border-radius: 18px; overflow: hidden; background: #000; box-shadow: var(--wk-shadow); }
.rw-film iframe, .rw-film-poster { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.rw-film-poster { padding: 0; cursor: pointer; background: #000; }
.rw-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .82; }
.rw-film-play { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; margin: -36px 0 0 -36px; display: grid; place-items: center; border-radius: 50%; background: var(--wk-foil); color: #3a0913; box-shadow: 0 10px 30px rgba(0,0,0,.5); transition: transform .3s var(--rw-ease); }
.rw-film-poster:hover .rw-film-play { transform: scale(1.08); }
.rw-film-label { position: absolute; left: 0; right: 0; bottom: 14px; color: #fff; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .28em; text-transform: uppercase; text-shadow: 0 1px 6px rgba(0,0,0,.6); }

/* ── Good to know ─────────────────────────────────────── */
.rw-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: 1fr; }
@media (min-width: 640px) { .rw-know { grid-template-columns: 1fr 1fr; } .rw-know-wide { grid-column: 1 / -1; } }
.rw-know-i { padding: 20px 22px; }
.rw-know-h { margin: 0 0 6px; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--wk-gold-ink); }
.rw-know-t { margin: 0; font: 400 17px/1.6 var(--wk-font-sans); color: var(--wk-ink); }

/* ── RSVP ─────────────────────────────────────────────── */
.rw-reply-by { text-align: center; margin: -10px 0 18px; font: 500 12px/1.5 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.rw-rsvp { padding: clamp(22px, 5vw, 40px); }

/* ── Finale ───────────────────────────────────────────── */
.rw-finale { position: relative; overflow: hidden; isolation: isolate; text-align: center; padding: clamp(80px, 14vw, 140px) 16px 0; background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--wk-bg) 40%, #000) 100%); }
.rw-root:not([data-wk-dark]) .rw-finale { background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--wk-bg2) 85%, var(--wk-accent)) 100%); }
.rw-finale-in { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 4px; padding-bottom: 20px; }
.rw-seal-big { position: relative; width: 170px; height: 170px; margin-bottom: 18px; }
.rw-seal-big-wax { position: absolute; inset: 0; width: 100% !important; }
.rw-seal-big-tx { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--wk-accent-ink); }
.rw-root[data-wk-dark] .rw-seal-big-tx { color: #3a0913; }
.rw-seal-big-tx b { font: 600 22px/1.2 var(--wk-font-deva); }
.rw-seal-big-tx small { font: 600 9px/1.4 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; }
.rw-finale-names { margin: 0; font: 400 clamp(46px, 12vw, 88px)/1.1 var(--wk-font-script); padding: 0 .1em; }
.rw-finale-names span { font-size: .55em; }
.rw-finale-line { margin: 10px auto 0; max-width: 520px; font: italic 400 clamp(18px, 4vw, 22px)/1.5 var(--wk-font-display); color: var(--wk-ink); }
.rw-hashtag { margin: 8px 0 0; font: 600 14px/1.4 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-gold-ink); }
.rw-wa { margin-top: 22px; }
.rw-palace { position: relative; z-index: 1; display: flex; justify-content: center; margin-top: 26px; opacity: .9; padding-bottom: max(14px, env(safe-area-inset-bottom)); }
.rw-lanterns { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.rw-lantern { position: absolute; bottom: -60px; display: block; border-radius: 40% 40% 22% 22% / 50% 50% 18% 18%;
  background: radial-gradient(60% 55% at 50% 62%, #fff4cc, #ffc861 45%, #f08a2a 85%); box-shadow: 0 0 18px 6px rgba(255,170,70,.45); opacity: 0;
  animation-name: rw-rise, rw-sway; animation-timing-function: linear, ease-in-out; animation-iteration-count: infinite, infinite; animation-direction: normal, alternate; animation-play-state: paused, paused; }
.rw-finale.is-on .rw-lantern { animation-play-state: running, running; }
@keyframes rw-rise { 0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; } 8% { opacity: .95; } 80% { opacity: .85; } 100% { transform: translate3d(0, -115vh, 0) scale(.55); opacity: 0; } }
@keyframes rw-sway { from { margin-left: calc(var(--sway) * -1); } to { margin-left: var(--sway); } }

@media (prefers-reduced-motion: reduce) {
  .rw-seal, .rw-gate-cta, .rw-flame, .rw-flame::after, .rw-hero-mandala, .rw-count-ring, .rw-scroll-cue { animation: none !important; }
  .rw-door, .rw-light, .rw-hero-photo img, .rw-hero-in > * { transition: none !important; }
  .rw-hero-photo img { transform: none; }
  .rw-lantern { animation: none !important; opacity: .85; }
  .rw-lantern:nth-child(odd) { bottom: 40%; } .rw-lantern:nth-child(3n) { bottom: 62%; } .rw-lantern:nth-child(even) { bottom: 22%; }
  .rw-drift { transform: none !important; }
}
`;
