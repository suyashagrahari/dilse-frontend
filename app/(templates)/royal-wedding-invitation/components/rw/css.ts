// ─── Royal Wedding: the guest page's stylesheet (rw- prefix) ─────────────────
// Light only: ivory sandstone, antique gold, soft maroon accents (rani pink on
// the Blush palette, lake blue on Powder). The kit's --wk-* tokens colour the
// paper, ink and foil; the gateway and courtyard are the art's own sandstone.
// Every animation is transform/opacity. Phones first (360px), then tablets
// (≥700), laptops (≥1024) and wide desktops (≥1440). Photos and cards are
// rounded rectangles with four equal corners — never arch-topped.

export const RW_CSS = `
.rw-root { --rw-maroon: #8E2A3C; --rw-maroon-deep: #641C2A; --rw-ink: #3E1F1A; --rw-gold-a: #B88A35; --rw-gold-b: #E6C677; --rw-gold-c: #F6E2A6; --rw-sand: #F1E2C4; --rw-sand-deep: #E4CCA0; --rw-ease: cubic-bezier(.22,.7,.2,1); overflow-x: clip; scroll-padding-top: 72px; }
.rw-root.rw-t-blush { --rw-maroon: #A23A5E; --rw-maroon-deep: #7A2444; }
.rw-root.rw-t-powder { --rw-maroon: #3F5F8F; --rw-maroon-deep: #2C4670; }
.rw-root .wk-section { position: relative; }
.rw-root img { -webkit-user-drag: none; }

/* ── shared buttons ─────────────────────────────────────────────────────── */
.rw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 18px; border-radius: 999px; font: 600 14px/1.1 var(--wk-font-sans); letter-spacing: .01em; cursor: pointer; text-decoration: none; border: 0; transition: transform .18s var(--rw-ease), box-shadow .25s ease, background-color .25s ease; -webkit-tap-highlight-color: transparent; }
.rw-btn:active { transform: scale(.97); }
.rw-btn:disabled { opacity: .5; cursor: default; }
.rw-btn:focus-visible, .rw-round:focus-visible, .rw-gate-cta:focus-visible, .rw-replay:focus-visible, .rw-court-cue:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 3px; }
.rw-btn-gold { color: #FFF7EA; background: linear-gradient(110deg, var(--rw-maroon-deep), var(--rw-maroon) 55%, color-mix(in srgb, var(--rw-maroon) 80%, #D9905A)); box-shadow: 0 10px 24px -14px rgba(100,28,42,.85), inset 0 1px 0 rgba(255,255,255,.25); }
.rw-btn-ghost { color: var(--wk-ink); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 55%, transparent); }
.rw-btn-ghost:hover { box-shadow: inset 0 0 0 1.5px var(--wk-gold); }
.rw-btn-icon { width: 44px; padding: 0; }
.rw-round { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: var(--wk-ink); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 60%, transparent); transition: transform .18s ease; }
.rw-round:active { transform: scale(.94); }
.rw-round.is-wa { color: #fff; background: #1FA855; box-shadow: none; }

/* ── language toggle + music nudge ─────────────────────────────────────── */
.rw-lang { position: fixed; top: max(12px, env(safe-area-inset-top)); left: 12px; z-index: 61; display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border-radius: 999px; background: rgba(255,250,240,.92); box-shadow: 0 8px 22px -12px rgba(110,40,50,.5), inset 0 0 0 1px rgba(184,140,70,.5); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.rw-lang-pill { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: linear-gradient(115deg, #6E1E2E, var(--rw-maroon) 55%, #A8475A); box-shadow: 0 6px 14px -8px rgba(110,30,46,.8), inset 0 1px 0 rgba(255,255,255,.25); transition: transform .45s cubic-bezier(.34,1.4,.64,1); }
.rw-lang.is-hi .rw-lang-pill { transform: translateX(100%); }
.rw-lang button { position: relative; z-index: 1; min-width: 52px; min-height: 40px; padding: 0 10px; border: 0; border-radius: 999px; background: none; font: 700 13px/1 var(--wk-font-sans); letter-spacing: .04em; color: #7A5550; cursor: pointer; transition: color .3s ease; -webkit-tap-highlight-color: transparent; }
.rw-lang button[lang=hi] { font: 600 14.5px/1 var(--wk-font-deva); letter-spacing: 0; }
.rw-lang button[aria-pressed=true] { color: #FFF7EA; }
.rw-hear { position: fixed; left: 50%; bottom: max(18px, env(safe-area-inset-bottom)); z-index: 59; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border: 0; border-radius: 999px; font: 600 14px/1 var(--wk-font-sans); color: #FFF7EA; background: var(--rw-maroon); box-shadow: 0 12px 26px -12px rgba(80,20,30,.7); animation: rw-up .6s var(--rw-ease) both; cursor: pointer; }

/* ══ THE GATEWAY (opening) ════════════════════════════════════════════════ */
/* The words sit ABOVE the gateway (--head), the button on the floor BELOW it (--foot). */
.rw-gate { --head: clamp(170px, 24svh, 230px); --foot: clamp(86px, 11svh, 110px); --copy: calc(var(--head) + var(--foot)); --sh: min(calc(100svh - var(--copy) - 10px), calc(100vw * 1.56)); --sw: calc(var(--sh) * 0.69222); position: fixed; inset: 0; z-index: 60; overflow: hidden; transition: opacity .8s ease; }
.rw-gate-sky { position: absolute; inset: 0; background: radial-gradient(60% 34% at 50% 14%, rgba(255,250,236,.95), rgba(255,250,236,0) 72%), linear-gradient(180deg, #FBF2E2 0, #F6E9D2 30%, #F1E1C4 70%, #EAD7B2 calc(100% - var(--foot))); transition: opacity 1s ease .3s; }
.rw-gate-sun { display: none; }
.rw-gate-cloud { position: absolute; height: auto; opacity: .85; pointer-events: none; }
.rw-gate-cloud.is-a { top: 4%; left: -12%; width: clamp(200px, 56vw, 520px); animation: rw-drift 46s ease-in-out infinite alternate; }
.rw-gate-cloud.is-b { top: 12%; right: -14%; width: clamp(220px, 62vw, 600px); opacity: .7; animation: rw-drift 58s ease-in-out -20s infinite alternate-reverse; }
@keyframes rw-drift { from { transform: translate3d(-4%,0,0); } to { transform: translate3d(8%,0,0); } }
.rw-gate-floor { position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--foot) + 6px); background: linear-gradient(180deg, #EBD6B0 0%, #F3E4C8 18%, #F7ECD8 100%);  transition: opacity .9s ease .2s; }
.rw-gate-cam { position: absolute; left: 0; right: 0; top: var(--head); bottom: var(--foot); display: flex; align-items: flex-end; justify-content: center; transform-origin: 50% calc(100% - var(--sh) * .366); transition: transform 1.25s cubic-bezier(.6,0,.25,1), opacity .9s ease .3s; }
.rw-stage { position: relative; flex: none; width: var(--sw); height: var(--sh); container-type: size; cursor: pointer; transition: opacity .8s ease, transform 1s var(--rw-ease); -webkit-tap-highlight-color: transparent; }
.rw-gate.is-loading .rw-stage { opacity: 0; transform: translateY(14px); }

/* the doorway + screens (shared with the finale) */
.rw-ap { position: absolute; overflow: hidden; z-index: 1; background: linear-gradient(180deg, #FFF3D8 0%, #FFE2AE 60%, #F8CF8C 100%); }
.rw-ap-glow { position: absolute; left: 50%; top: 60%; width: 170%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%,-50%) scale(.7); opacity: .55; background: radial-gradient(closest-side, #FFFFFF 0%, #FFF4D6 32%, rgba(255,214,150,.5) 62%, rgba(255,205,130,0) 100%); transition: transform 2s var(--rw-ease), opacity 1.4s ease; }
.rw-ap-rays { position: absolute; left: 50%; top: 52%; width: 190%; height: auto; max-width: none; transform: translate(-50%,-50%) scale(.9); opacity: 0; mix-blend-mode: screen; transition: opacity 1s ease .12s, transform 1.8s var(--rw-ease) .12s; }
.rw-ap-couple { position: absolute; left: 50%; bottom: 1%; height: 78%; width: auto; max-width: none; transform: translate(-50%, 6%) scale(.94); opacity: 0; transition: opacity 1s ease .5s, transform 1.6s var(--rw-ease) .4s; filter: drop-shadow(0 10px 10px rgba(110,50,10,.25)); }
.rw-ap-motes i { position: absolute; bottom: -8px; border-radius: 50%; background: #FFF6D6; box-shadow: 0 0 8px 2px rgba(255,236,170,.9); opacity: 0; animation: rw-mote linear infinite; }
@keyframes rw-mote { 0% { transform: translate3d(0,0,0); opacity: 0; } 15% { opacity: .9; } 85% { opacity: .6; } 100% { transform: translate3d(var(--dx), -60cqh, 0); opacity: 0; } }
.rw-screen { position: absolute; top: 0; height: 100%; z-index: 2; transition: transform 1.4s cubic-bezier(.7,0,.2,1), opacity .35s ease 1.1s; }
.rw-screen img, .rw-door { display: block; width: 100%; height: 100%; }
.rw-door { filter: drop-shadow(0 6px 10px rgba(110,70,20,.18)); }
.rw-gateway { position: absolute; inset: 0; z-index: 3; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.rw-invoke { margin: 0 0 4px; font: 600 clamp(13px, 3.6vw, 16px)/1.2 var(--wk-font-deva); color: var(--rw-maroon); white-space: nowrap; letter-spacing: .02em; }
.rw-medal { position: absolute; z-index: 4; left: 50%; top: 32.6%; width: 15.5%; aspect-ratio: 1; transform: translate(-50%,-50%); border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle at 50% 38%, #FFFDF6 0%, #FBEFD6 62%, #F0DBAE 100%); box-shadow: 0 0 0 .5cqw #FFF9EC, 0 0 0 1cqw #C9A24A, 0 0 0 1.25cqw #FFF4D8, 0 6px 14px -4px rgba(110,60,20,.45); container-type: inline-size; }
.rw-medal-ini { display: flex; align-items: center; gap: 2cqw; font-family: var(--wk-font-script); color: var(--rw-maroon); }
.rw-medal-ini b { font-weight: 400; font-size: 34cqw; line-height: 1; }
.rw-medal-ini i { font-style: normal; font-family: var(--wk-font-caps); font-size: 11cqw; color: #B88A35; }
.rw-toran { position: absolute; z-index: 5; transform-origin: 50% 0; pointer-events: none; }
.rw-toran img { display: block; width: 100%; height: auto; filter: drop-shadow(0 4px 4px rgba(110,70,20,.25)); }
.rw-ele { position: absolute; z-index: 6; top: 71%; width: 41%; pointer-events: none; }
.rw-ele.is-l { left: -15%; }
.rw-ele.is-r { right: -15%; }
.rw-ele img { display: block; width: 100%; height: auto; filter: drop-shadow(0 12px 10px rgba(90,60,30,.25)); }
.rw-ele.is-l img { transform-origin: 75% 95%; }
.rw-ele.is-r img { transform-origin: 25% 95%; }

/* the quiet court: a halo behind the gateway, the balustrade on the ground line, lanterns at the top corners */
.rw-gate-side { display: block; position: absolute; inset: 0; pointer-events: none; }
.rw-gate-halo { position: absolute; left: 50%; bottom: 0; width: calc(var(--sw) * 2.1); height: calc(var(--sh) * 1.15); transform: translateX(-50%); border-radius: 50% 50% 0 0; background: radial-gradient(closest-side at 50% 62%, rgba(255,246,222,.95), rgba(255,236,196,.55) 45%, rgba(255,236,196,0) 100%); }
.rw-gate-rail { position: absolute; z-index: 4; left: 0; right: 0; bottom: 0; height: clamp(64px, 10svh, 112px); background: url("/wedding-v3/template15/07-white-stone-railing-balustrade.webp") 50% 100% / auto 100% repeat-x; filter: sepia(.3) saturate(1.1) brightness(1.03); pointer-events: none; }
.rw-gate.is-loading .rw-gate-rail { opacity: 0; }
.rw-gate:not(.is-loading) .rw-gate-rail { animation: rw-up .9s var(--rw-ease) .2s both; }
.rw-gate.is-push .rw-gate-rail { opacity: 0; transition: opacity .4s ease; }
.rw-gate-lamp { position: absolute; z-index: 1; top: 0; width: clamp(96px, 16vw, 230px); pointer-events: none; }
.rw-gate-lamp img { display: block; width: 100%; height: auto; filter: drop-shadow(0 12px 16px rgba(110,60,20,.22)); }
.rw-gate-lamp .is-long { display: none; }
.rw-gate-lamp.is-l { left: clamp(4px, 4vw, 120px); }
.rw-gate-lamp.is-r { right: clamp(4px, 4vw, 120px); transform: scaleX(-1); }
.rw-gate.is-loading .rw-gate-lamp, .rw-gate.is-loading .rw-gate-side { opacity: 0; }
.rw-gate:not(.is-loading) .rw-gate-lamp, .rw-gate:not(.is-loading) .rw-gate-side { animation: rw-up .9s var(--rw-ease) .2s both; }
.rw-gate.is-push .rw-gate-lamp { opacity: 0; transition: opacity .4s ease; }
/* portrait screens (phones, tablets): the lanterns hang lower, at the very edges beside the dome, clear of the names and the top buttons */
@media (max-aspect-ratio: 6/5) {
  /* the long-string trio, hung from above the top edge: its lanterns (2W below its top) sit just beside the dome */
  .rw-gate-lamp { --lw: clamp(150px, 38vw, 290px); z-index: 7; top: calc(var(--head) - 30px - var(--lw) * 2); width: var(--lw); }
  /* a warm glow behind each trio so the gold reads against the ivory */
  .rw-gate-lamp::after { content: ""; position: absolute; left: 22%; right: 22%; bottom: -4%; height: 26%; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,214,140,.55), rgba(255,214,140,0)); pointer-events: none; }
  .rw-gate-lamp .is-short { display: none; }
  .rw-gate-lamp .is-long { display: block; }
  /* the art has wide transparent margins: pull it out so the lanterns sit right at the edge */
  .rw-gate-lamp.is-l { left: calc(var(--lw) * -.27); }
  .rw-gate-lamp.is-r { right: calc(var(--lw) * -.27); }
}
@media (min-width: 760px) and (min-aspect-ratio: 6/5) {
  /* laptops and desktops: the gateway as large as the screen allows — a tighter title block above, and the gateway stands right on the floor line with the button on the balustrade below */
  .rw-gate { --head: clamp(184px, 19svh, 204px); --foot: 74px; --sh: min(calc(100svh - var(--copy) - 4px), calc(100vw * 1.56)); }
  .rw-gate-copy { padding-top: max(40px, calc(env(safe-area-inset-top) + 34px)); padding-bottom: 6px; }
  .rw-gate-names { font-size: clamp(40px, min(4.6vw, 7svh), 72px); margin-top: 4px; }
}

/* the proclamation above the gateway */
.rw-gate-copy { position: absolute; left: 0; right: 0; top: 0; height: var(--head); z-index: 6; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 2px; padding: max(58px, calc(env(safe-area-inset-top) + 50px)) 16px 10px; text-align: center; transition: opacity .5s ease, transform .6s var(--rw-ease); }
.rw-gate-dear { margin: 0 0 2px; font: italic 500 clamp(15px, 4.2vw, 19px)/1.25 var(--wk-font-display); color: #6A4038; text-wrap: balance; max-width: 36rem; }
.rw-gate-dear b { font-style: normal; font-weight: 600; color: var(--rw-maroon); }
.rw-gate-k { margin: 0; font: 600 clamp(10.5px, 2.8vw, 12.5px)/1 var(--wk-font-caps); letter-spacing: .34em; text-transform: uppercase; color: #9A6B2A; }
.rw-gate-names { margin: 8px 0 0; font: 400 clamp(36px, 10vw, 66px)/1.12 var(--wk-font-script); text-wrap: balance; }
.rw-gate-names span { white-space: nowrap; padding: .08em .35em .12em; margin: 0 -.25em -.12em; background: linear-gradient(100deg, #7A1F33 0%, #A83A52 30%, #C9974F 52%, #8E2A3C 78%, #6E1E2E 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.rw-gate-names i { font: normal 400 .52em/1 var(--wk-font-display); color: #B88A35; }
.rw-gate-date { margin: 4px 0 0; display: flex; align-items: center; gap: 12px; font: 600 clamp(11px, 3vw, 13.5px)/1 var(--wk-font-caps); letter-spacing: .26em; color: #6A4038; }
.rw-gate-date i { display: block; width: clamp(28px, 8vw, 70px); height: 1px; background: linear-gradient(90deg, transparent, #B88A35); }
.rw-gate-date i:last-child { transform: scaleX(-1); }
.rw-gate-k { position: relative; }
/* the floor and the button below the gateway */
.rw-gate-foot { position: absolute; left: 0; right: 0; bottom: 0; height: var(--foot); z-index: 6; display: flex; align-items: center; justify-content: center; padding: 6px 16px max(10px, env(safe-area-inset-bottom)); transition: opacity .5s ease, transform .6s var(--rw-ease); }
.rw-gate-foot .rw-gate-cta { margin-top: 0; box-shadow: 0 16px 30px -12px rgba(80,20,30,.6), 0 0 0 6px rgba(255,250,240,.75); }
.rw-gate:not(.is-loading) .rw-gate-foot { animation: rw-up .8s var(--rw-ease) .6s both; }
.rw-gate.is-open .rw-gate-foot, .rw-gate.is-push .rw-gate-foot { opacity: 0; transform: translateY(12px); pointer-events: none; }
.rw-gate-cta { position: relative; margin-top: 10px; display: inline-flex; align-items: center; gap: 10px; min-height: 50px; padding: 0 26px; border: 0; border-radius: 999px; font: 700 15px/1 var(--wk-font-sans); color: #FFF7EA; cursor: pointer; background: linear-gradient(110deg, var(--rw-maroon-deep), var(--rw-maroon) 55%, color-mix(in srgb, var(--rw-maroon) 78%, #D9905A)); box-shadow: 0 14px 28px -12px rgba(100,28,42,.75), inset 0 1px 0 rgba(255,255,255,.25); -webkit-tap-highlight-color: transparent; transition: transform .2s ease, opacity .3s ease; }
.rw-gate-cta:disabled { cursor: progress; opacity: .8; }
.rw-gate-cta:active { transform: scale(.97); }
.rw-gate-cta-ring { position: absolute; inset: -5px; border-radius: inherit; border: 1.5px solid color-mix(in srgb, var(--rw-maroon) 55%, transparent); animation: rw-ring 2.2s ease-out infinite; pointer-events: none; }
@keyframes rw-ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(1.18, 1.5); opacity: 0; } }
.rw-gate-petals { position: absolute; inset: 0; z-index: 7; pointer-events: none; }

/* the entrance (after every piece has decoded) */
.rw-gate:not(.is-loading) .rw-ele.is-l { animation: rw-walk-l 1.3s var(--rw-ease) .25s both; }
.rw-gate:not(.is-loading) .rw-ele.is-r { animation: rw-walk-r 1.3s var(--rw-ease) .35s both; }
.rw-gate:not(.is-loading) .rw-toran { animation: rw-sway 5.2s ease-in-out 1s infinite; }
.rw-gate:not(.is-loading) .rw-medal { animation: rw-pop .9s cubic-bezier(.34,1.5,.64,1) .5s both; }
.rw-gate:not(.is-loading) .rw-gate-copy > * { animation: rw-up .8s var(--rw-ease) both; }
.rw-gate:not(.is-loading) .rw-gate-copy > :nth-child(2) { animation-delay: .1s; }
.rw-gate:not(.is-loading) .rw-gate-copy > :nth-child(3) { animation-delay: .2s; }
.rw-gate:not(.is-loading) .rw-gate-copy > :nth-child(4) { animation-delay: .3s; }
.rw-gate:not(.is-loading) .rw-gate-copy > :nth-child(5) { animation-delay: .4s; }
.rw-gate:not(.is-loading) .rw-gate-copy > :nth-child(6) { animation-delay: .5s; }
@keyframes rw-walk-l { from { transform: translate3d(-42%, 0, 0); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes rw-walk-r { from { transform: translate3d(42%, 0, 0); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes rw-sway { 0%, 100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
@keyframes rw-ring-sway { 0% { transform: rotate(0); } 12% { transform: rotate(-2.6deg); } 30% { transform: rotate(2.2deg); } 48% { transform: rotate(-1.5deg); } 66% { transform: rotate(1deg); } 84% { transform: rotate(-.4deg); } 100% { transform: rotate(0); } }
@keyframes rw-pop { from { transform: translate(-50%,-50%) scale(.4); opacity: 0; } to { transform: translate(-50%,-50%); opacity: 1; } }
@keyframes rw-press { 0% { transform: translate(-50%,-50%) scale(1); } 35% { transform: translate(-50%,-50%) scale(.9); } 100% { transform: translate(-50%,-50%) scale(1.04); opacity: 0; } }
@keyframes rw-up { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes rw-rise { from { transform: translateY(16%); opacity: 0; } to { opacity: 1; } }
@keyframes rw-bow-l { 0% { transform: none; } 40%, 60% { transform: rotate(5deg) translateY(1%); } 100% { transform: none; } }
@keyframes rw-bow-r { 0% { transform: none; } 40%, 60% { transform: rotate(-5deg) translateY(1%); } 100% { transform: none; } }

/* the tap: toran rings, screens slide into the piers, light, the bow */
.rw-gate.is-open .rw-toran, .rw-gate.is-push .rw-toran { animation: rw-ring-sway 2.2s ease-out both; }
.rw-gate.is-open .rw-medal, .rw-gate.is-push .rw-medal { animation: rw-press .9s ease both; }
.rw-gate.is-open .rw-gate-copy > *, .rw-gate.is-push .rw-gate-copy > * { animation: none; }
.rw-gate.is-open .rw-screen.is-l, .rw-gate.is-push .rw-screen.is-l { transform: translateX(-105%); opacity: 0; }
.rw-gate.is-open .rw-screen.is-r, .rw-gate.is-push .rw-screen.is-r { transform: translateX(105%); opacity: 0; }
.rw-gate.is-open .rw-ap-glow, .rw-gate.is-push .rw-ap-glow { transform: translate(-50%,-50%) scale(1.2); opacity: 1; }
.rw-gate.is-open .rw-ap-rays, .rw-gate.is-push .rw-ap-rays { opacity: .9; transform: translate(-50%,-50%) scale(1.06); }
.rw-gate.is-open .rw-ap-couple, .rw-gate.is-push .rw-ap-couple { opacity: 1; transform: translate(-50%, 0); }
.rw-gate.is-open .rw-ap-motes i, .rw-gate.is-push .rw-ap-motes i { opacity: 1; }
.rw-gate.is-open .rw-ele.is-l img { animation: rw-bow-l 1.3s ease-in-out .2s both; }
.rw-gate.is-open .rw-ele.is-r img { animation: rw-bow-r 1.3s ease-in-out .28s both; }
.rw-gate.is-open .rw-gate-cta, .rw-gate.is-push .rw-gate-cta { opacity: 0; transform: translateY(10px); pointer-events: none; }
.rw-gate.is-push { pointer-events: none; }
.rw-gate.is-push .rw-gate-cam { transform: scale(2.7); opacity: 0; }
.rw-gate.is-push .rw-gate-copy { opacity: 0; transform: translateY(-20px); }
.rw-gate.is-push .rw-gate-sky, .rw-gate.is-push .rw-gate-floor { opacity: 0; }
.rw-gate.is-reduced, .rw-gate.is-reduced * { animation: none !important; transition: none !important; }
.rw-gate.is-reduced { transition: opacity .4s ease !important; }
.rw-gate.is-reduced.is-push { opacity: 0; }
.rw-gate.is-reduced.is-push .rw-gate-cam, .rw-gate.is-reduced.is-push .rw-gate-copy, .rw-gate.is-reduced.is-push .rw-gate-sky, .rw-gate.is-reduced.is-push .rw-gate-floor { transform: none; opacity: 1; }
/* short phones (≤ 680px tall): a tighter copy band */
@media (max-height: 680px) { .rw-gate { --head: 150px; --foot: 80px; } .rw-invoke { display: none; } .rw-gate-cta { min-height: 46px; margin-top: 6px; } .rw-gate-names { font-size: clamp(28px, 8.6vw, 44px); } }

/* ══ THE COURTYARD (hero) ═════════════════════════════════════════════════ */
.rw-court { position: relative; min-height: 100svh; display: flex; flex-direction: column; justify-content: center; padding: clamp(84px, 22vw, 130px) 16px clamp(96px, 24vw, 170px); isolation: isolate; overflow: clip; }
.rw-court-sky { position: absolute; inset: 0; z-index: -2; background: radial-gradient(70% 45% at 50% 26%, rgba(255,250,236,.95) 0%, rgba(255,246,228,0) 70%), linear-gradient(180deg, #F7E2D6 0%, #FBEDE2 26%, color-mix(in srgb, var(--wk-bg) 80%, #FFF6EA) 60%, var(--wk-bg2) 100%); }
.rw-t-powder .rw-court-sky { background: radial-gradient(70% 45% at 50% 26%, rgba(250,252,255,.95) 0%, rgba(240,246,252,0) 70%), linear-gradient(180deg, #DCE8F4 0%, #EAF1F8 30%, var(--wk-bg) 65%, var(--wk-bg2) 100%); }
.rw-court-cloud { position: absolute; height: auto; opacity: 0; transition: opacity 1.6s ease .3s; pointer-events: none; }
.rw-court-cloud.is-a { top: 3%; left: -14%; width: clamp(200px, 58vw, 560px); }
.rw-court-cloud.is-b { top: 14%; right: -16%; width: clamp(220px, 60vw, 620px); }
.rw-court.is-open .rw-court-cloud { opacity: .8; animation: rw-drift 50s ease-in-out infinite alternate; }
.rw-court.is-open .rw-court-cloud.is-b { opacity: .6; animation-duration: 64s; animation-direction: alternate-reverse; }
.rw-court-lamp { position: absolute; top: -2px; z-index: 2; width: clamp(150px, 42vw, 300px); transform-origin: 50% 0; pointer-events: none; }
.rw-court-lamp.is-l { left: -13%; }
.rw-court-lamp.is-r { right: -13%; }
.rw-court-lamp img { display: block; width: 100%; height: auto; transform-origin: 50% 0; transform: translateY(-55%); opacity: 0; transition: transform 1.5s var(--rw-ease) .35s, opacity 1s ease .35s; filter: drop-shadow(0 10px 12px rgba(120,80,10,.25)); }
.rw-court-lamp.is-r img { transform: translateY(-55%) scaleX(-1); }
.rw-court.is-open .rw-court-lamp img { transform: none; opacity: 1; animation: rw-sway 5.4s ease-in-out 1.9s infinite; }
.rw-court.is-open .rw-court-lamp.is-r img { transform: scaleX(-1); animation-name: rw-sway-flip; }
@keyframes rw-sway-flip { 0%, 100% { transform: scaleX(-1) rotate(-1deg); } 50% { transform: scaleX(-1) rotate(1deg); } }
.rw-court-grid { position: relative; z-index: 3; width: 100%; max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; text-align: center; gap: 10px; }
.rw-court-scene { position: relative; width: min(100%, 430px); aspect-ratio: 1 / .9; }
.rw-court-sunburst { position: absolute; left: 50%; top: 44%; width: 96%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%,-50%) scale(.7); opacity: 0; background: radial-gradient(closest-side, rgba(255,248,226,.95) 0%, rgba(255,236,190,.6) 40%, rgba(255,228,180,0) 72%), repeating-conic-gradient(from 0deg, rgba(214,170,80,.22) 0deg 5deg, rgba(214,170,80,0) 5deg 15deg); -webkit-mask: radial-gradient(closest-side, #000 35%, transparent 100%); mask: radial-gradient(closest-side, #000 35%, transparent 100%); transition: transform 1.6s var(--rw-ease) .2s, opacity 1.2s ease .2s; }
.rw-court.is-open .rw-court-sunburst { transform: translate(-50%,-50%); opacity: 1; animation: rw-turn 80s linear 1.8s infinite; }
@keyframes rw-turn { from { rotate: 0deg; } to { rotate: 360deg; } }
.rw-court-chhatri { position: absolute; bottom: 6%; height: 72%; width: auto; opacity: 0; transition: transform 1.3s var(--rw-ease) .25s, opacity .8s ease .25s; filter: drop-shadow(6px 12px 12px rgba(120,40,60,.16)); }
.rw-court-chhatri.is-l { left: -3%; transform: translate3d(-24%, 10%, 0) rotate(-4deg); transform-origin: 50% 100%; }
.rw-court-chhatri.is-r { right: -3%; transform: translate3d(24%, 10%, 0) scaleX(-1) rotate(-4deg); transform-origin: 50% 100%; }
.rw-court.is-open .rw-court-chhatri.is-l { opacity: 1; transform: rotate(-4deg); }
.rw-court.is-open .rw-court-chhatri.is-r { opacity: 1; transform: scaleX(-1) rotate(-4deg); }
.rw-court-couple { position: absolute; left: 50%; bottom: 3%; height: 90%; aspect-ratio: 446 / 800; transform: translateX(-50%); }
.rw-court-carpet { position: absolute; left: -48%; width: 196%; bottom: -3%; height: auto; max-width: none; opacity: 0; transform: scaleX(.5); transition: transform 1s var(--rw-ease) .2s, opacity .6s ease .2s; }
.rw-court-pair { position: absolute; left: 0; bottom: 2%; width: 100%; height: auto; opacity: 0; transform: translateY(6%); transition: transform 1.1s var(--rw-ease) .08s, opacity .45s ease .08s; filter: drop-shadow(0 14px 14px rgba(90,40,10,.28)); }
.rw-court.is-open .rw-court-carpet { opacity: 1; transform: none; }
.rw-court.is-open .rw-court-pair { opacity: 1; transform: none; }
.rw-portrait { position: absolute; left: 50%; top: 6%; width: 50%; aspect-ratio: 4 / 5; transform: translateX(-50%) scale(.86); opacity: 0; border-radius: clamp(14px, 2vw, 20px); overflow: hidden; background: #F2DCAC; box-shadow: 0 0 0 1px color-mix(in srgb, var(--wk-gold) 70%, transparent), 0 0 0 6px var(--wk-surface-solid), 0 0 0 7px color-mix(in srgb, var(--wk-gold) 50%, transparent), 0 24px 40px -22px rgba(90,40,20,.6); transition: transform 1.2s cubic-bezier(.34,1.4,.64,1) .55s, opacity .8s ease .55s; }
.rw-portrait-photo { position: absolute !important; inset: 0; }
.rw-court.is-open .rw-portrait { transform: translateX(-50%); opacity: 1; }
.rw-court-peacock { position: absolute; right: 9%; bottom: -1%; height: 42%; width: auto; opacity: 0; transform: translateY(14%) scaleX(-1); transition: transform 1.2s var(--rw-ease) 1s, opacity .9s ease 1s; filter: drop-shadow(0 8px 8px rgba(30,60,40,.2)); }
.rw-court.is-open .rw-court-peacock { opacity: 1; transform: scaleX(-1); }
.rw-court-scene:has(.rw-portrait) .rw-court-peacock { right: 0; }
.rw-court-text { display: grid; justify-items: center; gap: 4px; max-width: 34rem; min-width: 0; }
.rw-court-text > * { opacity: 0; transform: translateY(16px); transition: opacity .9s ease, transform 1s var(--rw-ease); }
.rw-court.is-open .rw-court-text > * { opacity: 1; transform: none; }
.rw-court.is-open .rw-court-text > :nth-child(1) { transition-delay: .6s; }
.rw-court.is-open .rw-court-text > :nth-child(2) { transition-delay: .75s; }
.rw-court.is-open .rw-court-text > :nth-child(3) { transition-delay: .9s; }
.rw-court.is-open .rw-court-text > :nth-child(4) { transition-delay: 1.05s; }
.rw-court.is-open .rw-court-text > :nth-child(5) { transition-delay: 1.2s; }
.rw-court.is-open .rw-court-text > :nth-child(6) { transition-delay: 1.35s; }
.rw-court-dear { margin: 0 0 4px; font: italic 500 clamp(17px, 4.6vw, 22px)/1.3 var(--wk-font-display); color: var(--rw-maroon); text-wrap: balance; }
.rw-court-k { margin: 0; text-wrap: balance; }
@media (max-width: 420px) { .rw-court-k { letter-spacing: .2em; font-size: 11px; } }
.rw-court-names { margin: 16px 0 0; display: flex; flex-direction: column; align-items: center; font-weight: 400; line-height: .98; }
.rw-court-n { font: 400 clamp(50px, 14.5vw, 104px)/1.14 var(--wk-font-script); padding: 0 .14em; white-space: nowrap; max-width: 100%; }
.rw-court-amp { font: 400 clamp(26px, 7vw, 40px)/1 var(--wk-font-script); color: var(--rw-maroon); margin: -.08em 0 -.1em; }
.rw-court-getting { margin: 14px 0 0; font: italic 400 clamp(18px, 4.8vw, 24px)/1.3 var(--wk-font-display); color: var(--wk-muted); }
.rw-cartouche { position: relative; margin-top: 16px; padding: 16px 24px 15px; display: grid; gap: 5px; border-radius: 18px; background: linear-gradient(180deg, #FFFBF2, color-mix(in srgb, var(--wk-surface-solid) 70%, var(--rw-sand))); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), inset 0 0 0 5px color-mix(in srgb, var(--wk-surface-solid) 90%, transparent), inset 0 0 0 6px color-mix(in srgb, var(--rw-maroon) 22%, transparent), 0 16px 32px -24px rgba(90,40,20,.6); }
.rw-cartouche p { margin: 0; }
.rw-cartouche-date { font: 600 clamp(14px, 3.7vw, 17px)/1.3 var(--wk-font-caps); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-ink); }
.rw-cartouche-time { font: 500 15px/1.35 var(--wk-font-sans); color: var(--rw-maroon); }
.rw-cartouche-venue { font: italic 500 clamp(16px, 4vw, 19px)/1.3 var(--wk-font-display); color: var(--wk-ink); text-wrap: balance; }
.rw-court-cue { margin-top: 14px; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px; border-radius: 999px; font: 600 13px/1 var(--wk-font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--wk-gold-ink); text-decoration: none; }
.rw-court-cue svg { animation: rw-bob 2s ease-in-out infinite; }
@keyframes rw-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
.rw-court-rail { position: absolute; left: 50%; bottom: 0; width: min(112%, 980px); transform: translate(-50%, 38%); opacity: 0; transition: transform 1.4s var(--rw-ease) .8s, opacity 1s ease .8s; pointer-events: none; }
.rw-court-rail img { display: block; width: 100%; height: auto; filter: sepia(.28) saturate(1.1); }
.rw-court-rail-2 { display: none !important; }
.rw-court.is-open .rw-court-rail { transform: translate(-50%, 18%); opacity: 1; }
.rw-court.is-idle .rw-court-cloud, .rw-court.is-idle .rw-court-lamp img, .rw-court.is-idle .rw-court-sunburst { animation-play-state: paused; }
@media (min-width: 700px) { .rw-court-scene { width: min(100%, 520px); } }
@media (min-width: 1024px) {
  .rw-court { padding: 150px 40px 170px; }
  .rw-court-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); align-items: center; gap: clamp(24px, 4vw, 72px); text-align: left; justify-items: start; padding: 0 clamp(40px, 6vw, 120px); }
  .rw-court-text { order: -1; justify-items: start; }
  .rw-court-names { align-items: flex-start; }
  .rw-court-n { font-size: clamp(80px, 7.4vw, 128px); }
  .rw-court-names { margin-top: 26px; }
  .rw-court-getting { margin-top: 22px; }
  .rw-court-amp { margin: -.1em 0 -.2em 1.1em; font-size: clamp(40px, 3.6vw, 56px); }
  .rw-court-scene { width: 100%; max-width: 640px; justify-self: end; }
  .rw-court-lamp { width: clamp(220px, 19vw, 340px); }
  .rw-court-lamp.is-l { left: 40%; }
  .rw-court-lamp.is-r { right: 1%; }
  /* the balustrade runs the full width under the whole courtyard (it stopped halfway before) */
  .rw-court-rail { width: 100vw; left: 50%; display: flex; }
  .rw-court-rail img { flex: 0 0 auto; width: 50%; }
  .rw-court-rail .rw-court-rail-2 { display: block !important; }
}
@media (min-width: 1440px) {
  .rw-court-grid { max-width: 1480px; }
  .rw-court-scene { max-width: 760px; }
  .rw-court-n { font-size: clamp(110px, 8vw, 156px); }
  .rw-cartouche { padding: 18px 28px; }
  .rw-cartouche-date { font-size: 19px; }
  .rw-cartouche-venue { font-size: 21px; }
}

/* ══ SECTIONS ═════════════════════════════════════════════════════════════ */
.rw-root .wk-section.rw-sec { padding-top: clamp(48px, 7vw, 96px); padding-bottom: clamp(48px, 7vw, 96px); }
.rw-root .wk-section.rw-sec .wk-section-head { margin-bottom: clamp(24px, 4vw, 40px); }
.rw-hang { position: absolute; top: -10px; width: clamp(46px, 11vw, 80px); z-index: 2; transform-origin: 50% 0; pointer-events: none; animation: rw-sway 5s ease-in-out infinite; }
.rw-hang.is-l { left: 3%; }
.rw-hang.is-r { right: 3%; animation-delay: -2.4s; }
.rw-hang img { display: block; width: 100%; height: auto; filter: drop-shadow(0 6px 8px rgba(110,40,50,.22)); }
.rw-hang.is-r img { transform: scaleX(-1); }
/* full-screen sections: exactly one screen, content centred, the scene spans the whole width */
.rw-root .wk-section.rw-full { position: relative; isolation: isolate; min-height: 100svh; display: flex; flex-direction: column; justify-content: center; }
.rw-scene { position: absolute; top: 0; bottom: 0; left: calc(50% - 50vw); width: 100vw; z-index: -1; overflow: hidden; pointer-events: none; background: radial-gradient(70% 50% at 50% 42%, #FFF9EC 0%, rgba(255,249,236,0) 70%), linear-gradient(180deg, #F7EBDD 0%, #FBF3E6 45%, #F3E4CC 100%); -webkit-mask-image: linear-gradient(180deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(180deg, transparent, #000 8%, #000 92%, transparent); }
.rw-scene-cloud { position: absolute; height: auto; opacity: .55; }
.rw-scene-cloud.is-a { left: -6%; top: 6%; width: clamp(260px, 34vw, 560px); }
.rw-scene-cloud.is-b { right: -8%; top: 18%; width: clamp(240px, 30vw, 520px); }
.rw-scene-hedge { position: absolute; left: 0; bottom: -2%; width: 100%; height: clamp(120px, 22svh, 240px); object-fit: cover; object-position: 50% 0; opacity: .5; -webkit-mask-image: linear-gradient(180deg, transparent, #000 45%); mask-image: linear-gradient(180deg, transparent, #000 45%); }
.rw-invite-wrap { position: relative; padding-top: 30px; }
.rw-invite { position: relative; max-width: 720px; margin: 0 auto; padding: clamp(46px, 9vw, 72px) clamp(18px, 5vw, 56px) clamp(30px, 6vw, 48px); border-radius: clamp(16px, 2.4vw, 22px); background: radial-gradient(100% 70% at 50% 0%, #FFFCF5 0%, var(--wk-surface-solid) 60%), var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), inset 0 0 0 7px var(--wk-surface-solid), inset 0 0 0 8px color-mix(in srgb, var(--rw-maroon) 25%, transparent), 0 30px 60px -40px rgba(90,40,20,.55); }
@media (min-width: 1024px) {
  .rw-hang { width: 92px; } .rw-hang.is-l { left: calc(50% - 520px - 120px); } .rw-hang.is-r { right: calc(50% - 520px - 120px); }
  /* compact and wide: the two columns sit side by side so the card is about half as tall */
  .rw-sec-invite .rw-invite { max-width: 1040px; padding: 44px 56px 36px; }
  .rw-sec-invite .wk-msg-text p { font-size: 19px; line-height: 1.6; margin-bottom: .8em; }
}
/* phones: tightened so the whole card fits one screen */
@media (max-width: 699px) {
  .rw-root .wk-section.rw-sec-invite { padding-top: 64px; padding-bottom: 24px; }
  .rw-sec-invite .wk-section-head { margin-bottom: 8px !important; }
  .rw-sec-invite .rw-invite-wrap { padding-top: 14px; }
  .rw-sec-invite .rw-invite { padding: 26px 16px 20px; }
  .rw-sec-invite .wk-msg-orn { width: 44px !important; margin-bottom: 2px; }
  .rw-sec-invite .wk-msg-heading { font-size: 34px; margin-bottom: 8px; }
  .rw-sec-invite .wk-msg-text p { font-size: 15px; line-height: 1.5; margin-bottom: .55em; }
  .rw-sec-invite .wk-msg-text.is-deva p { font-size: 14.5px; line-height: 1.7; }
  .rw-sec-invite .wk-msg-cols { gap: 10px; }
  .rw-sec-invite .rw-hang { width: 40px; top: -2px; }
  .rw-scene-hedge { display: none; }
}

/* families in a pietra-dura border */
.rw-inlay { position: relative; padding: 12px; border-radius: 26px; background: radial-gradient(circle, color-mix(in srgb, var(--rw-maroon) 60%, transparent) 2px, transparent 2.6px) 0 0 / 16px 16px, linear-gradient(135deg, #F3E3C3, #EAD3A6); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 70%, transparent), 0 26px 50px -36px rgba(90,40,20,.55); }
.rw-inlay-in { display: grid; gap: 22px; padding: clamp(22px, 5vw, 40px) clamp(14px, 4vw, 36px); border-radius: 18px; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent); }
.rw-blessings-of { text-align: center; }
.rw-blessings-names { margin: 6px 0 0; font: italic 500 clamp(18px, 4.4vw, 22px)/1.4 var(--wk-font-display); color: var(--wk-ink); }
.rw-root .wk-family-photo { width: clamp(112px, 26vw, 140px); height: auto; aspect-ratio: 4 / 5; border-radius: 16px; box-shadow: 0 0 0 4px var(--wk-surface-solid), 0 0 0 5px color-mix(in srgb, var(--wk-gold) 60%, transparent), 0 18px 34px -24px rgba(80,40,10,.55); }

/* the farmaan + countdown */
.rw-day { display: grid; justify-items: center; gap: 34px; }
.rw-farmaan { position: relative; width: min(calc(100% - 30px), 520px); display: grid; justify-items: center; }
.rw-rod { position: relative; z-index: 2; display: block; width: calc(100% + 26px); height: 20px; border-radius: 999px; background: linear-gradient(180deg, #F6E2A6 0%, #C99A45 45%, #8A5A1C 100%); box-shadow: 0 6px 12px -6px rgba(90,50,10,.6); }
.rw-rod::before, .rw-rod::after { content: ""; position: absolute; top: 50%; width: 24px; height: 24px; border-radius: 50%; transform: translateY(-50%); background: radial-gradient(circle at 40% 35%, #FFF3C4, #C99A45 55%, #7A4E14); }
.rw-rod::before { left: -10px; }
.rw-rod::after { right: -10px; }
.rw-paper { position: relative; width: 100%; margin: -6px 0; padding: 34px clamp(18px, 6vw, 40px) 62px; display: grid; justify-items: center; gap: 4px; text-align: center; background: linear-gradient(rgba(255,249,236,.62), rgba(255,246,228,.5)), url("/wedding-v3/template1/07-parchment-2.webp") center / cover, #F6E6C4; color: #4A2A1C; box-shadow: inset 0 0 40px rgba(150,100,40,.25); transform-origin: 50% 0; transition: transform 1.2s cubic-bezier(.65,0,.25,1), opacity .4s ease; }
.rw-paper > * { margin: 0; }
.rw-rod.is-bottom { transition: transform 1.2s cubic-bezier(.65,0,.25,1); }
.rw-farmaan.is-rolled .rw-paper { transform: scaleY(.04); opacity: .4; }
.rw-farmaan.is-rolled .rw-rod.is-bottom { transform: translateY(calc(-1 * var(--rw-ph, 300px) + 12px)); }
.rw-f-k { font: italic 500 clamp(15px, 4vw, 18px)/1.4 var(--wk-font-display); color: #7A4A32; max-width: 22rem; text-wrap: balance; }
.rw-f-weekday { margin-top: 8px !important; font: 600 clamp(12px, 3.2vw, 14px)/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--rw-maroon); }
.rw-f-day { margin: 6px 0 2px !important; font: 500 clamp(82px, 24vw, 120px)/1.2 var(--wk-font-display); background: none !important; -webkit-text-fill-color: currentColor !important; color: var(--rw-maroon); text-shadow: 0 2px 0 rgba(201,162,74,.55); }
.rw-f-month { font: 600 clamp(20px, 5.6vw, 28px)/1.2 var(--wk-font-display); color: #3E1F1A; }
.rw-f-month span { color: #9A6B2A; }
.rw-f-time { margin-top: 6px !important; font: 600 clamp(12px, 3.2vw, 14px)/1.3 var(--wk-font-caps); letter-spacing: .16em; text-transform: uppercase; color: #5A3A28; }
.rw-f-muhurat { font: 500 15px/1.35 var(--wk-font-sans); color: var(--rw-maroon); }
.rw-f-venue { margin-top: 4px !important; font: italic 500 clamp(16px, 4.2vw, 19px)/1.35 var(--wk-font-display); color: #4A2A1C; text-wrap: balance; max-width: 24rem; }
.rw-mohar { position: absolute; right: -4px; bottom: -22px; width: 74px; height: 74px; display: grid; place-items: center; border-radius: 47% 53% 50% 50% / 52% 48% 52% 48%; background: radial-gradient(circle at 38% 32%, color-mix(in srgb, var(--rw-maroon) 70%, #fff), var(--rw-maroon) 55%, var(--rw-maroon-deep)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--rw-maroon) 50%, transparent), 0 8px 14px -6px rgba(80,10,20,.6), inset 0 -4px 8px rgba(0,0,0,.25); transform: scale(1.7) rotate(-14deg); opacity: 0; transition: transform .45s cubic-bezier(.5,1.6,.5,1), opacity .25s ease; z-index: 3; }
.rw-mohar b { font: 400 26px/1 var(--wk-font-script); color: #FBE9C8; display: flex; align-items: center; gap: 2px; text-shadow: 0 1px 0 rgba(0,0,0,.3); }
.rw-mohar i { font: normal 11px/1 var(--wk-font-caps); color: #F1D79C; }
.rw-farmaan.is-sealed .rw-mohar { transform: rotate(-8deg); opacity: 1; }
.rw-count { position: relative; width: min(100%, 560px); display: grid; justify-items: center; gap: 12px; padding: 24px clamp(10px, 4vw, 30px) 26px; border-radius: 26px; background: color-mix(in srgb, var(--wk-surface-solid) 88%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent), inset 0 0 0 6px color-mix(in srgb, var(--wk-surface-solid) 90%, transparent), inset 0 0 0 7px color-mix(in srgb, var(--rw-maroon) 18%, transparent), 0 24px 50px -36px rgba(90,40,20,.6); }
.rw-count-k { margin: 0; }
.rw-count-jhumka { display: none; }
@media (min-width: 760px) {
  .rw-count-jhumka { display: block; position: absolute; top: 0; width: 70px; transform-origin: 50% 0; animation: rw-sway 4.8s ease-in-out infinite; pointer-events: none; }
  .rw-count-jhumka.is-l { left: -100px; }
  .rw-count-jhumka.is-r { right: -100px; animation-delay: -2.4s; }
  .rw-count-jhumka img { display: block; width: 100%; height: auto; }
}

/* story */
.rw-story { --rw-p: 0; position: relative; padding: 6px 0 10px; }
.rw-story-rail { position: absolute; top: 0; bottom: 0; left: 17px; width: 3px; border-radius: 3px; background: color-mix(in srgb, var(--wk-gold) 22%, transparent); overflow: hidden; }
.rw-story-rail i { position: absolute; inset: 0; transform-origin: 50% 0; transform: scaleY(var(--rw-p)); background: linear-gradient(180deg, var(--rw-gold-a), var(--rw-maroon) 50%, var(--rw-gold-a)); }
.rw-chapters { list-style: none; margin: 0; padding: 0; display: grid; gap: 26px; }
.rw-ch { position: relative; padding-left: 44px; }
.rw-ch-dot { position: absolute; left: 7px; top: 22px; width: 23px; height: 23px; transform: rotate(45deg); border-radius: 5px; background: radial-gradient(circle, var(--rw-maroon) 30%, transparent 34%), var(--wk-surface-solid); box-shadow: inset 0 0 0 2px var(--wk-gold), 0 4px 10px -4px rgba(120,60,20,.5); }
.rw-ch-card { display: grid; gap: 0; border-radius: 20px; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 50%, transparent), 0 22px 44px -34px rgba(80,40,10,.6); overflow: hidden; }
.rw-ch-photo { position: relative; display: block; margin: 10px 10px 0; aspect-ratio: 4 / 3; border-radius: 14px; overflow: hidden; background: var(--wk-placeholder); }
.rw-ch-img { position: absolute !important; inset: 0; }
.rw-ch-text { padding: 16px 18px 20px; }
.rw-ch-when { display: inline-block; margin: 0 0 8px; padding: 6px 12px; border-radius: 999px; font: 600 12px/1 var(--wk-font-caps); letter-spacing: .2em; color: #FFF7EA; background: var(--rw-maroon); }
.rw-ch-title { margin: 0 0 6px; font: 500 clamp(23px, 6vw, 30px)/1.15 var(--wk-font-display); color: var(--wk-ink); }
.rw-ch-line { margin: 0; font: 400 16px/1.6 var(--wk-font-sans); color: var(--wk-muted); }
@media (min-width: 860px) {
  .rw-story-rail { left: 50%; transform: translateX(-50%); }
  .rw-chapters { gap: 10px; }
  .rw-ch { padding-left: 0; width: calc(50% - 46px); }
  .rw-ch.is-alt { margin-left: auto; }
  .rw-ch-dot { left: auto; right: -58px; top: 36px; }
  .rw-ch.is-alt .rw-ch-dot { right: auto; left: -58px; }
  .rw-ch:not(:first-child) { margin-top: -40px; }
}

/* functions */
.rw-ev-grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 700px) { .rw-ev-grid { display: flex; flex-wrap: wrap; justify-content: center; } .rw-ev-grid > .rw-ev { flex: 0 1 calc((100% - 22px) / 2); } }
@media (min-width: 1100px) { .rw-ev-grid.n-3 > .rw-ev { flex-basis: calc((100% - 44px) / 3); } }
.rw-ev { display: flex; }
.rw-ev-card { position: relative; flex: 1; display: flex; flex-direction: column; border-radius: clamp(18px, 2vw, 22px); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent), 0 26px 50px -38px rgba(80,40,10,.6); overflow: hidden; transition: transform .35s var(--rw-ease); }
@media (hover: hover) { .rw-ev-card:hover { transform: translateY(-4px); } }
.rw-ev-alcove { --rw-tint: #F2C94C; position: relative; margin: 8px 8px 0; height: clamp(250px, 64vw, 300px); border-radius: 15px; overflow: hidden; display: flex; align-items: flex-end; justify-content: center; background: radial-gradient(70% 60% at 50% 74%, rgba(255,240,205,.95) 0%, rgba(255,240,210,0) 75%), linear-gradient(180deg, color-mix(in srgb, var(--rw-tint) 14%, #FFF9EE), color-mix(in srgb, var(--rw-tint) 26%, #F6E6C8)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 40%, transparent); }
.rw-ev-glow { position: absolute; left: 50%; top: 36%; width: 76%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%,-50%); background: radial-gradient(closest-side, rgba(255,255,255,.9), rgba(255,255,255,0)); }
.rw-ev-toran { position: absolute; top: -4px; left: 2%; width: 96%; height: auto; z-index: 2; transform-origin: 50% 0; animation: rw-sway 5.6s ease-in-out infinite; filter: drop-shadow(0 3px 3px rgba(110,70,20,.25)); }
.rw-ev:nth-child(2n) .rw-ev-toran { animation-delay: -2.8s; }
.rw-ev-carpet { position: absolute; left: 8%; bottom: 10px; width: 84%; height: auto; opacity: .95; }
.rw-ev-couple { position: relative; height: 78%; width: auto; max-width: 92%; object-fit: contain; object-position: bottom; margin-bottom: 20px; transform-origin: 50% 100%; animation: rw-breathe 6s ease-in-out infinite; filter: drop-shadow(0 12px 12px rgba(80,40,10,.25)); }
@keyframes rw-breathe { 0%, 100% { transform: rotate(-.8deg); } 50% { transform: rotate(.8deg) translateY(-2px); } }
.rw-ev-no { position: absolute; top: 40%; left: 7%; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--rw-maroon); }
.rw-ev-body { display: grid; gap: 8px; padding: 16px 20px 22px; }
.rw-ev-date { margin: 0; }
.rw-root.is-hi .rw-ev-date, .rw-root.is-hi .wk-cd-label, .rw-root.is-hi .wk-eyebrow { letter-spacing: .02em; }
.rw-ev-title { margin: 0; font: 600 clamp(26px, 6.6vw, 32px)/1.1 var(--wk-font-display); color: var(--wk-ink); }
.rw-ev-line { margin: 0; display: flex; gap: 9px; align-items: flex-start; font: 400 15px/1.45 var(--wk-font-sans); color: var(--wk-ink); }
.rw-ev-line svg { flex: none; margin-top: 2px; color: var(--rw-maroon); }
.rw-ev-line b { display: block; font-weight: 600; }
.rw-ev-addr { display: block; color: var(--wk-muted); font-size: 14px; }
.rw-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; box-shadow: 0 0 0 2px var(--wk-surface-solid), 0 0 0 3px color-mix(in srgb, var(--wk-gold) 70%, transparent); }
.rw-ev-k { font-weight: 600; color: var(--rw-maroon); }
.rw-ev-note { margin: 2px 0 0; font: italic 400 16px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.rw-ev-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.rw-ev-actions .rw-btn { padding: 0 13px; gap: 6px; font-size: 13px; }
.rw-ev-cal { display: inline-flex; border-radius: 999px; box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 55%, transparent); background: var(--wk-surface-solid); }
.rw-ev-cal > .rw-btn { box-shadow: none; background: none; }
.rw-ev-cal > .rw-btn + .rw-btn { position: relative; padding-left: 12px; }
.rw-ev-cal > .rw-btn + .rw-btn::before { content: ""; position: absolute; left: 0; top: 11px; bottom: 11px; width: 1.5px; background: color-mix(in srgb, var(--wk-gold) 45%, transparent); }
.rw-ev-all { display: flex; justify-content: center; margin-top: 26px; }

/* venue */
.rw-venue { position: relative; display: grid; justify-items: center; }
.rw-venue-gazebo { position: relative; z-index: 0; width: min(88%, 440px); height: auto; margin-bottom: -26px; filter: drop-shadow(0 16px 18px rgba(120,60,60,.14)); }
.rw-venue-card { position: relative; z-index: 1; width: 100%; max-width: 640px; }
/* the map placeholder stays a slim strip until the guest asks for it */
.rw-venue .wk-venue-map:has(.wk-venue-mapBtn) { aspect-ratio: auto; height: 64px; min-height: 0; }

/* film */
.rw-film { position: relative; aspect-ratio: 16 / 9; border-radius: 22px; overflow: hidden; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent), 0 26px 50px -34px rgba(60,30,10,.6); background: #000; }
.rw-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.rw-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: #000; }
.rw-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .85; }
.rw-film-play { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; transform: translate(-50%,-50%); border-radius: 50%; display: grid; place-items: center; color: #FFF7EA; background: var(--rw-maroon); box-shadow: 0 0 0 8px rgba(255,240,220,.3); }
.rw-film-label { position: absolute; left: 0; right: 0; bottom: 16px; text-align: center; font: 600 14px/1 var(--wk-font-sans); color: #FFF6E3; letter-spacing: .06em; }

/* gallery */
.rw-gallery { width: 100%; max-width: 1180px; margin: 0 auto; }

/* for our guests */
.rw-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 700px) { .rw-know { grid-template-columns: repeat(2, minmax(0, 1fr)); } .rw-know-wide { grid-column: 1 / -1; } }
.rw-know-i { padding: 18px 20px; border-radius: 18px; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent); }
.rw-know-h { margin: 0 0 6px; font: 600 12px/1.2 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--rw-maroon); }
.rw-know-t { margin: 0; font: 400 15.5px/1.55 var(--wk-font-sans); color: var(--wk-ink); }
.rw-info-block { margin-top: 30px; }
.rw-info-h { margin: 0 0 12px; text-align: center; font: 500 clamp(24px, 6vw, 30px)/1.2 var(--wk-font-display); color: var(--wk-ink); }
.rw-contacts { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 700px) { .rw-contacts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.rw-contact { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent); }
.rw-contact-ini { flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; font: 400 26px/1 var(--wk-font-script); color: #FFF7EA; background: radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--rw-maroon) 70%, #fff), var(--rw-maroon)); }
.rw-contact-who { flex: 1; min-width: 0; display: grid; gap: 2px; }
.rw-contact-who b { font: 600 16px/1.2 var(--wk-font-sans); color: var(--wk-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rw-contact-who small { font: 400 13.5px/1.2 var(--wk-font-sans); color: var(--wk-muted); }
.rw-contact-acts { display: flex; gap: 8px; }
.rw-shagun { max-width: 520px; margin: 0 auto; padding: 20px; border-radius: 22px; text-align: center; display: grid; gap: 12px; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 50%, transparent); }
.rw-shagun-line { margin: 0; font: italic 400 17px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.rw-shagun-id { margin: 0; display: grid; gap: 2px; }
.rw-shagun-id span { font: 600 19px/1.3 var(--wk-font-sans); color: var(--wk-ink); word-break: break-all; }
.rw-shagun-id small { color: var(--wk-muted); font-size: 13.5px; }
.rw-shagun-acts { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
@media (pointer: fine) { .rw-only-touch { display: none !important; } }
.rw-live { display: flex; justify-content: center; margin-top: 26px; }
.rw-live-dot { width: 9px; height: 9px; border-radius: 50%; background: #D7263D; animation: rw-live 1.6s ease-out infinite; }
@keyframes rw-live { 0% { box-shadow: 0 0 0 0 rgba(215,38,61,.6); } 100% { box-shadow: 0 0 0 10px rgba(215,38,61,0); } }
.rw-live-soon { margin: 0; display: inline-flex; gap: 8px; align-items: center; padding: 10px 16px; border-radius: 999px; font: 500 14px/1.3 var(--wk-font-sans); color: var(--wk-muted); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 40%, transparent); }

/* rsvp */
.rw-rsvp { position: relative; display: grid; gap: 20px; max-width: 680px; margin: 0 auto; }
.rw-rsvp-art { position: relative; display: grid; justify-items: center; text-align: center; gap: 4px; }
.rw-rsvp-arch { position: relative; display: block; width: min(84%, 330px); aspect-ratio: 4 / 4.4; border-radius: 999px 999px 24px 24px; overflow: hidden; background: radial-gradient(70% 60% at 50% 38%, #FFF8E8, #F6E2C2 70%, #EFD3A8); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 75%, transparent), inset 0 0 0 8px rgba(255,250,240,.6), inset 0 0 0 9px color-mix(in srgb, var(--wk-gold) 40%, transparent), 0 30px 60px -36px rgba(110,40,50,.55); }
.rw-rsvp-chhatri { position: absolute; top: 10%; width: 46%; height: auto; }
.rw-rsvp-chhatri.is-l { left: -8%; }
.rw-rsvp-chhatri.is-r { right: -8%; transform: scaleX(-1); }
.rw-rsvp-carpet { position: absolute; left: 6%; right: 6%; bottom: 3%; width: 88%; height: auto; }
.rw-rsvp-pair { position: absolute; left: 50%; bottom: 5%; height: 84%; width: auto; transform: translateX(-50%); filter: drop-shadow(0 12px 14px rgba(110,40,50,.25)); }
.rw-rsvp-peacock { position: absolute; z-index: 2; right: calc(50% - min(42%, 165px) - 34px); bottom: 70px; width: clamp(64px, 16vw, 96px); height: auto; pointer-events: none; }
.rw-upasthiti { margin: 14px 0 0; text-align: center; font: 400 clamp(28px, 7vw, 38px)/1.25 var(--wk-font-script); color: var(--rw-maroon); }
.rw-rsvp-names { margin: 0; font: 600 12.5px/1.4 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
.rw-rsvp-form { min-width: 0; }
@media (min-width: 1024px) {
  .rw-rsvp { max-width: 1160px; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: center; gap: clamp(36px, 5vw, 72px); }
  .rw-rsvp-art { position: sticky; top: 90px; }
  .rw-rsvp-arch { width: min(100%, 420px); }
  .rw-rsvp-peacock { right: 6px; width: 110px; bottom: 90px; }
  .rw-root .rw-rsvp-form .wk-rsvp { padding: clamp(30px, 3vw, 44px) clamp(28px, 3.4vw, 52px); }
  .rw-root .rw-sec-bless .wk-bless { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); align-items: start; gap: clamp(30px, 4vw, 60px); }
  .rw-root .rw-sec-bless .wk-bless-form { max-width: none; position: sticky; top: 90px; }
}
.rw-root.is-hi .wk-rsvp .wk-field-l, .rw-root.is-hi .wk-bless .wk-field-l, .rw-root.is-hi .wk-rsvp-by { letter-spacing: .01em; text-transform: none; font-family: var(--wk-font-deva), var(--wk-font-sans); }
.rw-ev-title[lang=hi] { font-family: var(--wk-font-deva); }

/* finale */
/* the closing fills exactly one screen, the words centred in it */
.rw-finale { position: relative; min-height: 100svh; display: flex; flex-direction: column; justify-content: center; padding: 70px 16px 56px; text-align: center; overflow: clip; }
.rw-finale-in { display: grid; justify-items: center; gap: 6px; }
.rw-close { position: relative; width: clamp(200px, 52vw, 290px); margin-bottom: 26px; }
@media (min-width: 1024px) { .rw-close { width: clamp(270px, 21vw, 330px); } }
.rw-close-stage { position: relative; aspect-ratio: 1246 / 1800; container-type: inline-size; }
.rw-close .rw-ap-glow { opacity: 1; transform: translate(-50%,-50%) scale(1.15); }
.rw-close .rw-screen { transition: transform 1.4s cubic-bezier(.6,0,.2,1), opacity .3s ease; }
.rw-close .rw-screen.is-l { transform: translateX(-105%); opacity: 0; }
.rw-close .rw-screen.is-r { transform: translateX(105%); opacity: 0; }
.rw-close.is-closed .rw-screen { transform: none; opacity: 1; }
.rw-close-seal { position: absolute; z-index: 3; left: 50%; top: 50%; margin: 0; padding: 8px 10px 7px; display: grid; gap: 3px; min-width: 66%; border-radius: 12px; transform: translate(-50%,-50%) scale(.7); opacity: 0; background: rgba(255,250,240,.94); box-shadow: inset 0 0 0 1px #C9A24A, 0 8px 16px -8px rgba(90,40,20,.5); transition: transform .8s cubic-bezier(.34,1.5,.64,1) 1.3s, opacity .5s ease 1.3s; }
.rw-close-seal b { font: 600 clamp(16px, 7.4cqw, 26px)/1.15 var(--wk-font-deva); color: var(--rw-maroon); white-space: nowrap; }
.rw-close-seal small { font: 400 clamp(14px, 6cqw, 22px)/1 var(--wk-font-script); color: #9A6B2A; }
.rw-close.is-closed .rw-close-seal { transform: translate(-50%,-50%); opacity: 1; }
.rw-close .rw-toran { animation: rw-sway 5.6s ease-in-out infinite; }
.rw-close-petals { position: absolute; inset: -40px -30vw 0; pointer-events: none; }
.rw-finale-k { margin: 6px 0 0; }
.rw-finale-names { margin: 6px 0 0; font: 400 clamp(46px, 12vw, 80px)/1.1 var(--wk-font-script); padding: 0 .1em; }
.rw-finale-names span { font-family: var(--wk-font-display); font-size: .5em; }
.rw-finale-line { margin: 0; max-width: 32rem; font: italic 400 clamp(17px, 4.4vw, 21px)/1.45 var(--wk-font-display); color: var(--wk-muted); }
.rw-hashtag { margin: 4px 0 0; font: 600 15px/1 var(--wk-font-sans); letter-spacing: .04em; color: var(--rw-maroon); }
.rw-share { display: grid; gap: 16px; justify-items: center; margin-top: 18px; width: 100%; max-width: 640px; }
.rw-share-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.rw-personal { width: 100%; display: grid; gap: 8px; padding: 16px; border-radius: 20px; background: color-mix(in srgb, var(--wk-surface-solid) 85%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent); text-align: left; }
.rw-personal-l { font: 600 12px/1 var(--wk-font-caps); letter-spacing: .18em; text-transform: uppercase; color: var(--rw-maroon); }
.rw-personal-row { display: flex; flex-wrap: wrap; gap: 8px; }
.rw-personal-row .wk-input { flex: 1 1 160px; min-width: 0; min-height: 44px; }
.rw-share-note { min-height: 18px; margin: 0; font: 500 13.5px/1.3 var(--wk-font-sans); color: var(--rw-maroon); word-break: break-all; }
.rw-replay { margin-top: 18px; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border: 0; border-radius: 999px; background: none; font: 600 13.5px/1 var(--wk-font-sans); color: var(--wk-gold-ink); cursor: pointer; }

/* ── low-end phones: no ambient loops ─────────────────────────────────── */
.rw-root.is-lite .rw-ev-couple, .rw-root.is-lite .rw-ev-toran, .rw-root.is-lite .rw-hang, .rw-root.is-lite .rw-ap-motes, .rw-root.is-lite .rw-court-lamp img, .rw-root.is-lite .rw-court-cloud, .rw-root.is-lite .rw-gate-cloud, .rw-root.is-lite .rw-court-sunburst { animation: none !important; }

@media (prefers-reduced-motion: reduce) {
  .rw-root *, .rw-root *::before, .rw-root *::after { animation-duration: .001s !important; animation-iteration-count: 1 !important; transition-duration: .001s !important; transition-delay: 0s !important; }
  .rw-court-text > *, .rw-court-lamp img, .rw-court-rail, .rw-court-chhatri, .rw-court-pair, .rw-court-carpet, .rw-portrait, .rw-court-sunburst, .rw-court-peacock, .rw-court-cloud { opacity: 1 !important; }
}
`;
