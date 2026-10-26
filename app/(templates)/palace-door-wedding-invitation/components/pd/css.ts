// ─── Palace Door: the guest page's stylesheet (pd- prefix) ───────────────────
// Light themes only (blush / champagne / powder): the kit's --wk-* tokens
// colour the paper, ink and foil; the door, the wood and the courtyard light
// are the art's own warm sandstone. Every animation is transform/opacity.
// Phones first (360px), then tablets (≥700), laptops (≥1024) and wide
// desktops (≥1440), where the hero and the functions spread into columns.

export const PD_CSS = `
.pd-root { --pd-ink: #3A2414; --pd-ink-soft: #6A4A30; --pd-wood-gold: #F3D88F; --pd-gold-a: #B88A35; --pd-gold-b: #E6C677; --pd-gold-c: #F6E2A6; --pd-sand: #EFE2BF; --pd-ease: cubic-bezier(.22,.7,.2,1); overflow-x: clip; }
.pd-root .wk-section { position: relative; }
.pd-root img { -webkit-user-drag: none; }

/* ── shared buttons ─────────────────────────────────────────────────────── */
.pd-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 18px; border-radius: 999px; font: 600 14px/1.1 var(--wk-font-sans); letter-spacing: .01em; cursor: pointer; text-decoration: none; border: 0; transition: transform .18s var(--pd-ease), box-shadow .25s ease, background-color .25s ease; -webkit-tap-highlight-color: transparent; }
.pd-btn:active { transform: scale(.97); }
.pd-btn:disabled { opacity: .5; cursor: default; }
.pd-btn:focus-visible, .pd-round:focus-visible, .pd-medal:focus-visible, .pd-door-cta:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 3px; }
.pd-btn-gold { color: #3A2414; background: linear-gradient(110deg, var(--pd-gold-a), var(--pd-gold-b) 45%, var(--pd-gold-c) 55%, #C99A45); box-shadow: 0 10px 24px -14px rgba(120,80,20,.8), inset 0 1px 0 rgba(255,255,255,.5); }
.pd-btn-ghost { color: var(--wk-ink); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 55%, transparent); }
.pd-btn-ghost:hover { box-shadow: inset 0 0 0 1.5px var(--wk-gold); }
.pd-btn-icon { width: 44px; padding: 0; }
.pd-round { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: var(--wk-ink); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 60%, transparent); transition: transform .18s ease; }
.pd-round:active { transform: scale(.94); }
.pd-round.is-wa { color: #fff; background: #1FA855; box-shadow: none; }

/* ── language toggle ───────────────────────────────────────────────────── */
.pd-lang { position: fixed; top: max(12px, env(safe-area-inset-top)); left: 12px; z-index: 61; display: flex; padding: 3px; border-radius: 999px; background: rgba(255,250,238,.86); box-shadow: 0 6px 18px -10px rgba(60,30,10,.5), inset 0 0 0 1px rgba(184,138,53,.45); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.pd-lang button { min-width: 44px; min-height: 40px; border: 0; border-radius: 999px; background: none; font: 700 13px/1 var(--wk-font-sans); color: #6A4A30; cursor: pointer; }
.pd-lang button[aria-pressed=true] { background: #6E3213; color: #FFF6E3; }

.pd-hear { position: fixed; left: 50%; bottom: max(18px, env(safe-area-inset-bottom)); z-index: 59; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border: 0; border-radius: 999px; font: 600 14px/1 var(--wk-font-sans); color: #3A2414; background: linear-gradient(110deg, var(--pd-gold-a), var(--pd-gold-b) 45%, var(--pd-gold-c) 55%, #C99A45); box-shadow: 0 12px 26px -12px rgba(80,50,10,.7); animation: pd-up .6s var(--pd-ease) both; cursor: pointer; }

/* ══ THE DOOR (opening) ═══════════════════════════════════════════════════ */
/* A haveli at dusk: a maroon wall inlaid with a gold bidri lattice, warm light
   behind the door, gold string lights, lanterns and pillars on wide screens.
   The scene starts dark around one lit diya; its light opens out (an iris on
   a registered custom property) to reveal the door, then the decor arrives:
   pillars rise, lanterns and garlands drop, the toran bounces onto the lintel,
   the medallion pops, the names shine, the threshold diyas light centre-out.
   While closed, light breathes through the crack between the two leaves. */
@property --pd-iris { syntax: "<length>"; inherits: false; initial-value: 0px; }
.pd-gate { position: fixed; inset: 0; z-index: 60; overflow: hidden; background: #2A0A10; transition: opacity .9s ease; }
.pd-gate-wall { position: absolute; inset: 0; background:
  radial-gradient(42% 58% at 50% 50%, rgba(255,200,120,.42) 0%, rgba(255,190,110,.12) 55%, rgba(255,190,110,0) 75%),
  radial-gradient(130% 100% at 50% 38%, #82283A 0%, #5E1727 50%, #3A0C17 100%); transition: opacity 1s ease .2s; }
.pd-gate-lattice { position: absolute; inset: 0; background-size: clamp(130px, 13vw, 200px); opacity: .2; -webkit-mask-image: radial-gradient(120% 95% at 50% 45%, #000 25%, rgba(0,0,0,.35) 100%); mask-image: radial-gradient(120% 95% at 50% 45%, #000 25%, rgba(0,0,0,.35) 100%); }
.pd-gate-wall::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 16%; background: linear-gradient(0deg, rgba(20,4,8,.6), rgba(20,4,8,0)); }
.pd-gate-lights { display: none; }
.pd-gate-cam { position: absolute; inset: 0; z-index: 2; transform-origin: 50% 56%; transition: transform 1.75s cubic-bezier(.45,0,.15,1), opacity 1s ease .45s; }
.pd-door { position: absolute; top: 0; left: 50%; height: 100dvh; aspect-ratio: 1013 / 1800; transform: translateX(-50%); transition: opacity 1s ease, transform 1.3s var(--pd-ease); }
.pd-door::before { content: ""; position: absolute; inset: 4% -10% -2%; border-radius: 50% 50% 0 0; background: radial-gradient(closest-side, rgba(255,196,110,.5), rgba(255,196,110,0)); pointer-events: none; }
.pd-door-3d { position: absolute; inset: 0; perspective: 1500px; perspective-origin: 50% 56%; }
.pd-door-wall { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.pd-door-light { position: absolute; left: 8.6%; right: 9%; top: 7.5%; bottom: 3.2%; overflow: hidden; background: linear-gradient(180deg, #FFF4D2 0%, #FFE2A2 55%, #F6C979 100%); }
.pd-door-glow { position: absolute; left: 50%; top: 58%; width: 160%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%,-50%) scale(.6); opacity: .4; background: radial-gradient(closest-side, #FFFFFF 0%, #FFF5D6 30%, rgba(255,214,140,.55) 60%, rgba(255,200,120,0) 100%); transition: transform 2.2s var(--pd-ease), opacity 1.6s ease; }
.pd-door-rays { position: absolute; left: 50%; top: 62%; width: 240%; aspect-ratio: 1; transform: translate(-50%,-50%); opacity: 0; background: repeating-conic-gradient(from 0deg, rgba(255,255,255,.55) 0deg 4deg, rgba(255,255,255,0) 4deg 16deg); -webkit-mask: radial-gradient(closest-side, #000 20%, transparent 75%); mask: radial-gradient(closest-side, #000 20%, transparent 75%); transition: opacity 1.4s ease .3s; }
.pd-door-peek { position: absolute; left: -12%; width: 124%; top: -2%; height: auto; opacity: 0; transform: translateY(-8%) scale(1.08); transition: opacity 1.4s ease .4s, transform 2.4s var(--pd-ease) .2s; }
.pd-door-motes i { position: absolute; bottom: -10px; border-radius: 50%; background: #FFF6D6; box-shadow: 0 0 8px 2px rgba(255,236,170,.9); opacity: 0; animation: pd-mote linear infinite; }
@keyframes pd-mote { 0% { transform: translate3d(0,0,0); opacity: 0; } 15% { opacity: .9; } 85% { opacity: .7; } 100% { transform: translate3d(var(--dx), -110vh, 0); opacity: 0; } }
.pd-leaf { position: absolute; will-change: transform; backface-visibility: hidden; -webkit-backface-visibility: hidden; transition: transform 2.1s cubic-bezier(.62,.02,.22,1); }
.pd-leaf.is-l { transform-origin: 1% 50%; }
.pd-leaf.is-r { transform-origin: 99% 50%; }
.pd-leaf img { display: block; width: 100%; height: 100%; }
.pd-leaf-shade { position: absolute; inset: 0; opacity: 0; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; transition: opacity 2.1s ease; }
.pd-leaf.is-l .pd-leaf-shade { background: linear-gradient(90deg, rgba(25,10,2,.15), rgba(25,10,2,.7)); }
.pd-leaf.is-r .pd-leaf-shade { background: linear-gradient(270deg, rgba(25,10,2,.15), rgba(25,10,2,.7)); }
/* the crack of light where the two leaves meet */
.pd-door-seam { position: absolute; left: calc(49.75% - 1.5px); width: 3px; top: 9%; bottom: 3.6%; border-radius: 3px; opacity: 0; background: linear-gradient(180deg, rgba(255,230,166,0), #FFE6A6 10%, #FFF8E4 50%, #FFE6A6 90%, rgba(255,230,166,0)); box-shadow: 0 0 10px 2px rgba(255,210,130,.85), 0 0 34px 8px rgba(255,180,90,.4); transition: opacity .5s ease, transform .35s ease; }

/* the toran on the lintel and the marigold strings down the frame */
.pd-toran { position: absolute; left: 7%; right: 7%; top: 5%; z-index: 3; transform-origin: 50% 0; pointer-events: none; }
.pd-toran img { display: block; width: 100%; height: auto; filter: drop-shadow(0 8px 10px rgba(50,15,0,.45)); }
.pd-garland { position: absolute; top: 8.5%; width: 3.4%; height: 50%; z-index: 2; background-repeat: repeat-y; background-size: 100% auto; transform-origin: 50% 0; filter: drop-shadow(0 6px 6px rgba(40,10,0,.35)); pointer-events: none; }
.pd-garland.is-l { left: max(9.5%, calc(50% - 50vw + 8px)); }
.pd-garland.is-r { right: max(9.5%, calc(50% - 50vw + 8px)); }

.pd-door-invoke { position: absolute; top: 15.6%; left: 0; right: 0; margin: 0; text-align: center; font: 600 clamp(12px, 1.75dvh, 16px)/1 var(--wk-font-deva); letter-spacing: .04em; color: #F7E2A8; text-shadow: 0 1px 6px rgba(0,0,0,.75); z-index: 3; }
.pd-jhumka { position: absolute; top: 6.5%; width: 15%; transform-origin: 50% 0; z-index: 2; }
.pd-jhumka.is-l { left: max(4%, calc(50% - 50vw + 6px)); }
.pd-jhumka.is-r { right: max(4%, calc(50% - 50vw + 6px)); }
.pd-jhumka img { display: block; width: 100%; height: auto; filter: drop-shadow(0 8px 10px rgba(60,30,0,.35)); }
.pd-jhumka.is-r img { transform: scaleX(-1); }
.pd-door-copy { position: absolute; left: max(11%, calc(50% - 50vw + 14px)); right: max(11%, calc(50% - 50vw + 14px)); top: 19.5%; bottom: clamp(78px, 15dvh, 150px); display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 3; transition: opacity .5s ease, transform .6s var(--pd-ease); }
.pd-door-dear { margin: 0 0 1.4dvh; padding: 6px 14px; border-radius: 14px; font: italic 500 clamp(15px, 2.3dvh, 21px)/1.25 var(--wk-font-display); color: #FFF3D6; background: radial-gradient(closest-side, rgba(28,10,3,.62), rgba(28,10,3,0)); text-shadow: 0 1px 8px rgba(0,0,0,.6); }
.pd-door-dear span:first-child { font-style: normal; font-weight: 600; color: var(--pd-wood-gold); }
.pd-medal { position: relative; display: block; width: 56%; max-width: 250px; aspect-ratio: 777 / 800; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 50%; container-type: inline-size; -webkit-tap-highlight-color: transparent; }
.pd-medal-halo { position: absolute; inset: -26%; border-radius: 50%; pointer-events: none; background: radial-gradient(closest-side, rgba(255,222,150,.55), rgba(255,210,130,.18) 55%, rgba(255,210,130,0) 72%), repeating-conic-gradient(rgba(255,230,170,0) 0deg 7deg, rgba(255,230,170,.38) 7deg 9deg); -webkit-mask-image: radial-gradient(closest-side, #000 38%, transparent 100%); mask-image: radial-gradient(closest-side, #000 38%, transparent 100%); }
.pd-medal-ring { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 6px 14px rgba(0,0,0,.45)); }
.pd-medal-disc { position: absolute; left: 15%; top: 15%; width: 70%; height: 68%; border-radius: 50%; background: radial-gradient(circle at 50% 40%, #FFFBF0 0%, #FBEFD2 62%, #EBD39E 100%); box-shadow: inset 0 0 0 1px rgba(184,138,53,.6), inset 0 -10px 20px rgba(184,138,53,.25), 0 0 30px 6px rgba(255,226,150,.3); }
.pd-medal-ini { position: absolute; inset: 15% 15% 17%; display: flex; align-items: center; justify-content: center; gap: 2cqw; padding-bottom: 2cqw; font-family: var(--wk-font-script); color: #8A5A1C; }
.pd-medal-ini b { font-weight: 400; font-size: 21cqw; line-height: 1; }
.pd-medal-ini i { font-style: normal; font-family: var(--wk-font-caps); font-size: 7cqw; color: #B88A35; transform: translateY(-.2em); }
.pd-door-names { margin: 1.4dvh 0 0; display: flex; flex-direction: column; align-items: center; gap: .7dvh; padding: 12px 22px 14px; background: radial-gradient(closest-side, rgba(28,10,3,.7), rgba(28,10,3,0)); }
.pd-door-eyebrow { display: inline-flex; align-items: center; gap: 10px; font: 600 clamp(10px, 1.45dvh, 13px)/1 var(--wk-font-caps); letter-spacing: .32em; text-transform: uppercase; color: #F7E6B8; text-shadow: 0 1px 6px rgba(0,0,0,.7); }
.pd-door-eyebrow::before, .pd-door-eyebrow::after { content: ""; width: clamp(18px, 3dvh, 34px); height: 1px; background: linear-gradient(90deg, rgba(243,216,143,0), #F3D88F); }
.pd-door-eyebrow::after { transform: scaleX(-1); }
.pd-door-couple { font: 400 clamp(34px, 5.6dvh, 58px)/1.1 var(--wk-font-script); white-space: nowrap; padding: 0 .12em; color: #F3D88F; background: linear-gradient(100deg, #D9A94E 0%, #F6DE9A 22%, #FFF7D6 32%, #F3D88F 42%, #C9974F 60%, #F3D88F 80%, #D9A94E 100%); background-size: 260% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 6px rgba(0,0,0,.7)); }
.pd-door-couple i { font-style: normal; font-family: var(--wk-font-display); font-size: .55em; }
.pd-door-date { font: 600 clamp(11px, 1.6dvh, 14px)/1 var(--wk-font-caps); letter-spacing: .22em; color: #FFF3D6; text-shadow: 0 1px 6px rgba(0,0,0,.7); }
.pd-door-cta { position: relative; margin-top: auto; display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 26px; border: 0; border-radius: 999px; font: 700 15px/1 var(--wk-font-sans); color: #3A2414; cursor: pointer; background: linear-gradient(110deg, #E9C46A, #FFF4D2 40%, #F3D88F 60%, #D9A94E); background-size: 220% 100%; box-shadow: 0 14px 30px -12px rgba(0,0,0,.8), 0 0 0 1px rgba(255,240,200,.6), 0 0 26px rgba(255,200,110,.35), inset 0 1px 0 rgba(255,255,255,.7); -webkit-tap-highlight-color: transparent; }
.pd-door-cta:active { transform: scale(.97); }
.pd-door-cta-ring { position: absolute; inset: -5px; border-radius: inherit; border: 1.5px solid rgba(255,236,180,.9); animation: pd-ring 2.2s ease-out infinite; pointer-events: none; }
@keyframes pd-ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(1.22, 1.5); opacity: 0; } }

/* the threshold diyas */
.pd-diyas { position: absolute; left: 24%; right: 24%; bottom: .4%; z-index: 4; display: flex; justify-content: space-between; align-items: flex-end; pointer-events: none; }
.pd-diya { display: block; width: clamp(34px, 5.2dvh, 56px); height: auto; aspect-ratio: 1; overflow: visible; }
.pd-diya-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: pd-flame 1.1s ease-in-out infinite alternate; }
.pd-diya-halo { transform-box: fill-box; transform-origin: 50% 50%; animation: pd-halo 2.2s ease-in-out infinite alternate; }
.pd-diya.is-1 .pd-diya-flame, .pd-diya.is-3 .pd-diya-flame { animation-delay: -.4s; animation-duration: .95s; }
.pd-diya.is-0 .pd-diya-flame, .pd-diya.is-4 .pd-diya-flame { animation-delay: -.7s; animation-duration: 1.25s; }
@keyframes pd-flame { 0% { transform: scale(.9, .86) skewX(-4deg); } 50% { transform: scale(1.04, 1.06) skewX(2deg); } 100% { transform: scale(.96, 1.1) skewX(4deg); } }
@keyframes pd-halo { from { transform: scale(.85); opacity: .65; } to { transform: scale(1.12); opacity: 1; } }

.pd-banana { position: absolute; bottom: -3%; width: clamp(128px, 33vw, 360px); z-index: 4; pointer-events: none; transition: transform 1.2s var(--pd-ease), opacity 1s ease; }
.pd-banana.is-l { left: -7%; transform-origin: 0 100%; }
.pd-banana.is-r { right: -7%; transform-origin: 100% 100%; }
.pd-banana img { display: block; width: 100%; height: auto; filter: drop-shadow(0 10px 18px rgba(10,20,5,.5)); }
.pd-banana.is-r img { transform: scaleX(-1); }
.pd-front { display: none; }

/* gold dust drifting through the scene */
.pd-gate-dust { position: absolute; inset: 0; z-index: 5; pointer-events: none; transition: opacity .8s ease; }
.pd-gate-dust i { position: absolute; border-radius: 50%; background: #FFE9B0; box-shadow: 0 0 6px 2px rgba(255,214,140,.8); opacity: 0; animation-name: pd-dust, pd-twinkle; animation-timing-function: linear, ease-in-out; animation-iteration-count: infinite; animation-direction: normal, alternate; }
@keyframes pd-dust { 0% { translate: 0 0; opacity: 0; } 15% { opacity: .95; } 80% { opacity: .6; } 100% { translate: var(--dx) -38vh; opacity: 0; } }
@keyframes pd-twinkle { from { scale: .5; } to { scale: 1.25; } }
.pd-gate-petals { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
/* the step through (as the royal gateway): a circle of warm light grows out of the doorway */
.pd-gate-bloom { position: absolute; z-index: 6; left: 50%; top: 56%; width: 170vmax; height: 170vmax; margin: -85vmax 0 0 -85vmax; border-radius: 50%; pointer-events: none; opacity: 0; transform: scale(.04); background: radial-gradient(closest-side, #FFFDF6 0%, #FFF6E2 30%, #FBEBCB 62%, #F6E2BC 100%); }
.pd-gate.is-push .pd-gate-bloom { animation: pd-bloom-out 1.85s cubic-bezier(.4,0,.2,1) both; }
@keyframes pd-bloom-out { 0% { opacity: 0; transform: scale(.04); } 18% { opacity: 1; } 55% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.05); } }
.pd-gate.is-reduced .pd-gate-bloom { display: none; }

/* the entrance: darkness around one diya, then its light opens out */
.pd-gate-iris { position: absolute; inset: 0; z-index: 7; pointer-events: none; --pd-iris: 4vmax; background: radial-gradient(circle at 50% 54%, rgba(22,6,3,0) var(--pd-iris), rgba(22,6,3,.88) calc(var(--pd-iris) + 9vmax), #160603 calc(var(--pd-iris) + 22vmax)); }
.pd-gate-spark { position: absolute; left: 50%; top: 54%; z-index: 8; width: 64px; margin: -40px 0 0 -32px; pointer-events: none; }
.pd-gate-spark .pd-diya { width: 64px; filter: drop-shadow(0 0 18px rgba(255,190,90,.9)); }
.pd-gate:not(.is-loading) .pd-gate-iris { animation: pd-iris 1.5s cubic-bezier(.55,0,.2,1) .1s forwards; }
.pd-gate:not(.is-loading) .pd-gate-spark { animation: pd-spark .9s ease .15s forwards; }
@keyframes pd-iris { 0% { --pd-iris: 4vmax; opacity: 1; } 75% { opacity: 1; } 100% { --pd-iris: 110vmax; opacity: 0; } }
@keyframes pd-spark { 0% { transform: none; opacity: 1; } 100% { transform: translateY(-30px) scale(2.4); opacity: 0; } }
.pd-gate.is-loading .pd-gate-spark { animation: pd-spark-in .6s ease both; }
@keyframes pd-spark-in { from { transform: scale(.4); opacity: 0; } to { transform: none; opacity: 1; } }

/* the decor arrives (after the door art has decoded) */
.pd-gate.is-loading .pd-door, .pd-gate.is-loading .pd-banana, .pd-gate.is-loading .pd-front, .pd-gate.is-loading .pd-gate-lights { opacity: 0; }
.pd-gate.is-loading .pd-door { transform: translateX(-50%) scale(1.05); }
.pd-gate:not(.is-loading) .pd-toran { animation: pd-toran 1.1s cubic-bezier(.34,1.45,.6,1) .5s both, pd-sway-soft 6s ease-in-out 1.6s infinite; }
.pd-gate:not(.is-loading) .pd-garland { animation: pd-unroll 1.1s var(--pd-ease) .75s both, pd-sway 5.2s ease-in-out 1.85s infinite; }
.pd-gate:not(.is-loading) .pd-garland.is-r { animation-delay: .85s, 2.2s; }
.pd-gate:not(.is-loading) .pd-jhumka { animation: pd-drop 1.1s var(--pd-ease) .6s both, pd-sway 4.6s ease-in-out 1.7s infinite; }
.pd-gate:not(.is-loading) .pd-jhumka.is-r { animation-delay: .7s, 1.95s; }
.pd-gate:not(.is-loading) .pd-medal { animation: pd-pop 1s cubic-bezier(.34,1.5,.64,1) .75s both; }
.pd-gate:not(.is-loading) .pd-medal-halo { animation: pd-halo-spin 40s linear infinite, pd-fade-in 1.2s ease 1.1s both; }
.pd-gate:not(.is-loading) .pd-door-names, .pd-gate:not(.is-loading) .pd-door-dear, .pd-gate:not(.is-loading) .pd-door-invoke { animation: pd-up .9s var(--pd-ease) 1.05s both; }
.pd-gate:not(.is-loading) .pd-door-couple { animation: pd-sheen 6s linear 1.6s infinite; }
.pd-gate:not(.is-loading) .pd-door-cta { animation: pd-up .9s var(--pd-ease) 1.35s both, pd-sheen 4s linear 2.3s infinite; }
.pd-gate:not(.is-loading) .pd-door-seam { animation: pd-seam 3.2s ease-in-out 1.4s infinite; }
.pd-gate:not(.is-loading) .pd-diya { animation: pd-light .7s cubic-bezier(.34,1.5,.64,1) calc(1.1s + var(--i, 0) * .18s) both; }
.pd-gate:not(.is-loading) .pd-banana.is-l { animation: pd-in-l 1.6s var(--pd-ease) .45s both; }
.pd-gate:not(.is-loading) .pd-banana.is-r { animation: pd-in-r 1.6s var(--pd-ease) .55s both; }
.pd-gate:not(.is-loading) .pd-gate-dust { animation: pd-fade-in 1.5s ease 1s both; }
@keyframes pd-drop { from { transform: translateY(-70%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-toran { from { transform: translateY(-140%) scaleY(.7); opacity: 0; } 60% { opacity: 1; } to { transform: none; opacity: 1; } }
@keyframes pd-unroll { from { transform: scaleY(0); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-sway { 0%, 100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
@keyframes pd-sway-soft { 0%, 100% { transform: rotate(-.5deg); } 50% { transform: rotate(.5deg); } }
@keyframes pd-pop { from { transform: scale(.5); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-up { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pd-halo-spin { to { transform: rotate(360deg); } }
@keyframes pd-sheen { from { background-position: 100% 0; } to { background-position: -160% 0; } }
@keyframes pd-seam { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
@keyframes pd-light { from { transform: translateY(8px) scale(.6); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-in-l { from { transform: translate3d(-55%, 12%, 0) rotate(-8deg); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-in-r { from { transform: translate3d(55%, 12%, 0) rotate(8deg); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-knock { 0% { transform: scale(1); } 30% { transform: scale(.93); } 55% { transform: scale(1.05); } 100% { transform: scale(1); } }

/* the knock, the swing, the push */
.pd-gate.is-knock .pd-medal { animation: pd-knock .42s ease both; }
.pd-gate.is-knock .pd-door-seam { animation: none; opacity: 1; transform: scaleX(3.5); }
.pd-gate.is-open .pd-door-seam, .pd-gate.is-push .pd-door-seam { animation: none; opacity: 0; transform: scaleX(12); transition: opacity .9s ease, transform .9s ease; }
.pd-gate.is-knock .pd-door-cta, .pd-gate.is-open .pd-door-cta, .pd-gate.is-push .pd-door-cta { opacity: 0; transform: translateY(10px); transition: opacity .3s, transform .3s; animation: none; }
.pd-gate.is-open .pd-door-copy, .pd-gate.is-push .pd-door-copy { opacity: 0; transform: scale(1.1); }
.pd-gate.is-open .pd-leaf.is-l, .pd-gate.is-push .pd-leaf.is-l { transform: rotateY(84deg); }
.pd-gate.is-open .pd-leaf.is-r, .pd-gate.is-push .pd-leaf.is-r { transform: rotateY(-84deg); }
.pd-gate.is-open .pd-leaf-shade, .pd-gate.is-push .pd-leaf-shade { opacity: 1; }
.pd-gate.is-open .pd-door-glow, .pd-gate.is-push .pd-door-glow { transform: translate(-50%,-50%) scale(1.25); opacity: 1; }
.pd-gate.is-open .pd-door-rays, .pd-gate.is-push .pd-door-rays { opacity: .85; animation: pd-spin 24s linear infinite; }
.pd-gate.is-open .pd-door-peek, .pd-gate.is-push .pd-door-peek { opacity: .9; transform: none; }
.pd-gate.is-open .pd-door-motes i, .pd-gate.is-push .pd-door-motes i { opacity: 1; }
.pd-gate.is-open .pd-jhumka, .pd-gate.is-push .pd-jhumka, .pd-gate.is-open .pd-garland, .pd-gate.is-push .pd-garland { animation: pd-sway-hard 1.6s ease-in-out infinite; }
.pd-gate.is-open .pd-jhumka.is-r, .pd-gate.is-push .pd-jhumka.is-r, .pd-gate.is-open .pd-garland.is-r, .pd-gate.is-push .pd-garland.is-r { animation-delay: -.5s; }
.pd-gate.is-open .pd-toran, .pd-gate.is-push .pd-toran { animation: pd-sway-soft 1.4s ease-in-out infinite; }
@keyframes pd-sway-hard { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
@keyframes pd-spin { from { transform: translate(-50%,-50%) rotate(0); } to { transform: translate(-50%,-50%) rotate(360deg); } }
.pd-gate.is-push { pointer-events: none; background: transparent; transition: opacity .9s ease, background-color 1s ease .5s; }
.pd-gate.is-push .pd-gate-cam { transform: scale(1.9); opacity: 0; }
.pd-gate.is-push .pd-gate-wall, .pd-gate.is-push .pd-gate-lights, .pd-gate.is-push .pd-gate-dust { opacity: 0; transition: opacity .9s ease .5s; }
.pd-gate.is-push .pd-banana.is-l { transform: translate3d(-70%, 20%, 0); opacity: 0; animation: none; }
.pd-gate.is-push .pd-banana.is-r { transform: translate3d(70%, 20%, 0); opacity: 0; animation: none; }
.pd-gate.is-reduced, .pd-gate.is-reduced * { animation: none !important; transition: none !important; }
.pd-gate.is-reduced { transition: opacity .4s ease !important; }
.pd-gate.is-reduced .pd-gate-iris, .pd-gate.is-reduced .pd-gate-spark, .pd-gate.is-reduced .pd-gate-dust { display: none; }
.pd-gate.is-reduced .pd-door-seam { opacity: .8; }
.pd-gate.is-reduced.is-push { opacity: 0; }
.pd-gate.is-reduced.is-push .pd-gate-cam { transform: none; opacity: 1; }

/* desktop: the haveli front around the door */
@media (min-width: 760px) and (min-aspect-ratio: 4/5) {
  .pd-root { --pd-dh: 28.15dvh; --pd-pw: 23.9dvh; }
  .pd-gate-lights { display: block; position: absolute; inset: 0 0 auto; height: 50dvh; z-index: 1; pointer-events: none; transition: opacity 1s ease; }
  .pd-gate-lights img { position: absolute; top: -3dvh; height: 46dvh; width: auto; max-width: none; animation: pd-twinkle-img 3.4s ease-in-out infinite alternate; }
  .pd-gate-lights img.is-l { right: calc(50% + var(--pd-dh) - 4dvh); }
  .pd-gate-lights img.is-r { left: calc(50% + var(--pd-dh) - 4dvh); transform: scaleX(-1); animation-delay: -1.7s; }
  .pd-gate:not(.is-loading) .pd-gate-lights { animation: pd-fade-in 1.4s ease .9s both; }
  .pd-front { display: block; position: absolute; inset: 0; transition: opacity 1s ease; }
  .pd-front-side { position: absolute; inset: 0; }
  .pd-front-side.is-r { transform: scaleX(-1); }
  .pd-front-pillar { position: absolute; top: 0; bottom: 0; right: calc(50% + var(--pd-dh) - 1.6dvh); height: 100dvh; width: auto; max-width: none; filter: sepia(.22) saturate(1.1) brightness(.98) drop-shadow(14px 18px 22px rgba(20,4,8,.55)); }
  .pd-front-lantern { position: absolute; top: 0; right: calc(50% + var(--pd-dh) + var(--pd-pw) + 1dvh); height: 60dvh; aspect-ratio: 300 / 885; transform-origin: 50% 0; }
  .pd-front-lantern img { display: block; width: 100%; height: 100%; }
  .pd-front-pots { position: absolute; bottom: 0; right: calc(50% + var(--pd-dh) + var(--pd-pw) - 3dvh); height: 36dvh; width: auto; filter: drop-shadow(10px 14px 16px rgba(20,4,8,.55)); }
  .pd-door-wall { -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 3.5%, #000 96.5%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 3.5%, #000 96.5%, transparent 100%); }
  .pd-gate:not(.is-loading) .pd-front-pillar { animation: pd-rise 1.2s var(--pd-ease) .3s both; }
  .pd-gate:not(.is-loading) .pd-front-lantern { animation: pd-drop 1.3s var(--pd-ease) .55s both, pd-sway 5.6s ease-in-out 1.85s infinite; }
  .pd-gate:not(.is-loading) .pd-front-pots { animation: pd-rise 1.2s var(--pd-ease) .7s both; }
  .pd-gate.is-open .pd-front-lantern, .pd-gate.is-push .pd-front-lantern { animation: pd-sway-hard 1.8s ease-in-out infinite; }
  .pd-garland.is-l { left: 3.4%; }
  .pd-garland.is-r { right: 3.4%; }
  .pd-diyas { left: 14%; right: 14%; }
  .pd-banana { width: clamp(170px, 15vw, 290px); }
  .pd-door-copy { bottom: 9%; }
  .pd-banana.is-l { left: -2%; }
  .pd-banana.is-r { right: -2%; }
}
/* portrait tablets: no room for the full haveli front, so slender full-height
   pillars fill the wall either side of the door (tucked under its stone frame) */
@media (min-width: 700px) and (max-aspect-ratio: 4/5) {
  .pd-front { display: block; position: absolute; inset: 0; transition: opacity 1s ease; }
  .pd-front-side { position: absolute; inset: 0; }
  .pd-front-side.is-r { transform: scaleX(-1); }
  .pd-front-lantern, .pd-front-pots { display: none; }
  .pd-front-pillar { position: absolute; top: 0; right: calc(50% + 28.15dvh - 3dvh); height: 100dvh; width: calc(50vw - 28.15dvh + 3dvh); max-width: none; object-fit: fill; filter: sepia(.22) saturate(1.1) brightness(.98) drop-shadow(10px 0 18px rgba(20,4,8,.5)); }
  .pd-gate:not(.is-loading) .pd-front-pillar { animation: pd-rise 1.2s var(--pd-ease) .3s both; }
}
@keyframes pd-rise { from { transform: translateY(18%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-twinkle-img { from { opacity: .7; } to { opacity: 1; } }

/* ══ THE COURTYARD (hero) ═════════════════════════════════════════════════ */
.pd-court { position: relative; min-height: 100svh; display: flex; flex-direction: column; justify-content: center; padding: clamp(118px, 22vw, 150px) 16px clamp(112px, 26vw, 200px); isolation: isolate; overflow: clip; }
.pd-court-sky { position: absolute; inset: 0; z-index: -2; background: radial-gradient(80% 55% at 50% 22%, rgba(255,250,232,.95) 0%, rgba(255,246,222,.5) 45%, rgba(255,246,222,0) 75%), linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 70%, #FFF6E0) 0%, var(--wk-bg) 55%, color-mix(in srgb, var(--wk-bg2) 70%, #EAD7B0) 100%); }
.pd-court-far { position: absolute; inset: 0; z-index: -1; display: none; }
.pd-court-pillar { position: absolute; bottom: 4%; height: 92%; width: auto; opacity: .9; filter: drop-shadow(12px 14px 20px rgba(90,60,20,.18)); }
.pd-court-pillar.is-l { left: 1.5%; }
.pd-court-pillar.is-r { right: 1.5%; }
.pd-court-ivy { position: absolute; top: 0; left: -4%; right: -4%; z-index: 1; pointer-events: none; }
.pd-court-ivy-fringe { display: none; }
.pd-court-ivy img { display: block; width: 100%; height: auto; transform: translateY(-62%); opacity: 0; transition: transform 1.6s var(--pd-ease) .15s, opacity 1s ease .15s; }
.pd-court-lan { position: absolute; top: 0; z-index: 2; width: clamp(130px, 36vw, 270px); transform-origin: 50% 0; pointer-events: none; }
.pd-court-lan.is-l { left: -9%; }
.pd-court-lan.is-r { right: -9%; }
.pd-court-lan img { display: block; width: 100%; height: auto; transform-origin: 40% 0; transform: translateY(-60%); opacity: 0; transition: transform 1.5s var(--pd-ease) .35s, opacity 1s ease .35s; filter: drop-shadow(0 10px 12px rgba(120,80,10,.25)); }
.pd-court-lan.is-r img { transform: translateY(-60%) scaleX(-1); }
.pd-court-stage { position: relative; z-index: 3; width: 100%; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; text-align: center; gap: 6px; }
.pd-court-arch { position: relative; width: min(100%, 470px); aspect-ratio: 1600 / 1188; }
.pd-court-arch.has-art { margin-bottom: 16%; }
.pd-court-flowers { position: absolute; inset: 0; width: 100%; height: 100%; -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%), linear-gradient(180deg, transparent 0, rgba(0,0,0,.55) 6%, #000 17%, #000 80%, transparent 100%); -webkit-mask-composite: source-in; mask-image: linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%), linear-gradient(180deg, transparent 0, rgba(0,0,0,.55) 6%, #000 17%, #000 80%, transparent 100%); mask-composite: intersect; opacity: 0; transform: scale(.9); transition: transform 1.6s var(--pd-ease) .25s, opacity 1.2s ease .25s; }
.pd-portrait { position: absolute; left: 50%; top: 58%; width: 54%; aspect-ratio: 777 / 800; transform: translate(-50%, -50%); }
.pd-portrait-photo { position: absolute !important; inset: 0; }
.pd-portrait.is-art { top: 52%; width: 50%; }
.pd-portrait.is-art .pd-portrait-ring { filter: saturate(1.6) contrast(1.2) brightness(.9) drop-shadow(0 0 18px rgba(255,214,120,.55)); }
.pd-portrait-carpet { position: absolute; left: -12%; width: 124%; bottom: -36%; height: auto; opacity: 0; transform: scaleX(.6); transition: transform 1s var(--pd-ease) .8s, opacity .8s ease .8s; }
.pd-portrait-art { position: absolute; left: 50%; bottom: -30%; height: 132%; width: auto; transform: translate(-50%, 12%); opacity: 0; transition: transform 1.3s var(--pd-ease) .7s, opacity 1s ease .7s; filter: drop-shadow(0 14px 14px rgba(90,40,10,.28)); }
.pd-court.is-on .pd-portrait-art { transform: translate(-50%, 0); opacity: 1; }
.pd-court.is-on .pd-portrait-carpet { transform: none; opacity: 1; }
.pd-portrait-ring { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; transform: rotate(-30deg) scale(.6); transition: transform 1.5s cubic-bezier(.3,1.25,.5,1) .4s, opacity .9s ease .4s; filter: saturate(1.6) contrast(1.2) brightness(.86) drop-shadow(0 4px 8px rgba(140,90,20,.35)); }
.pd-court-text { display: grid; justify-items: center; gap: 4px; max-width: 34rem; min-width: 0; }
.pd-court-text > * { opacity: 0; transform: translateY(16px); transition: opacity .9s ease, transform 1s var(--pd-ease); }
.pd-court-dear { margin: 0 0 4px; font: italic 500 clamp(17px, 4.6vw, 22px)/1.3 var(--wk-font-display); color: var(--wk-accent); }
.pd-court-eyebrow { margin: 0; white-space: normal; text-wrap: balance; }
@media (max-width: 420px) { .pd-court-eyebrow { letter-spacing: .2em; font-size: 11px; } }
.pd-court-names { margin: 8px 0 0; display: flex; flex-direction: column; align-items: center; font-weight: 400; line-height: .98; }
.pd-court-n { font: 400 clamp(52px, 15vw, 104px)/1.02 var(--wk-font-script); padding: 0 .12em; }
.pd-court-amp { font: 500 clamp(18px, 5vw, 26px)/1 var(--wk-font-caps); letter-spacing: .3em; color: var(--wk-gold-ink); margin: 2px 0 0; }
.pd-court-getting { margin: 6px 0 0; font: italic 400 clamp(18px, 4.8vw, 24px)/1.3 var(--wk-font-display); color: var(--wk-muted); }
.pd-court-when { margin-top: 14px; padding: 14px 22px; display: grid; gap: 4px; border-radius: 18px; background: color-mix(in srgb, var(--wk-surface-solid) 78%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent), 0 14px 30px -24px rgba(90,60,20,.6); }
.pd-court-when p { margin: 0; }
.pd-court-date { font: 600 clamp(14px, 3.6vw, 17px)/1.3 var(--wk-font-caps); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-ink); }
.pd-court-time { font: 500 15px/1.3 var(--wk-font-sans); color: var(--wk-muted); }
.pd-court-venue { font: italic 500 clamp(16px, 4vw, 19px)/1.3 var(--wk-font-display); color: var(--wk-ink); text-wrap: balance; padding: 0 2px; }
.pd-court-down { margin-top: 16px; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px; border-radius: 999px; font: 600 13px/1 var(--wk-font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--wk-gold-ink); text-decoration: none; }
.pd-court-down svg { animation: pd-bob 2s ease-in-out infinite; }
@keyframes pd-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
.pd-court-front { position: absolute; left: 0; right: 0; bottom: 0; z-index: 4; pointer-events: none; height: 0; }
.pd-court-carpet { display: none; }
.pd-court-rail { position: absolute; bottom: 0; left: 50%; width: min(108%, 940px); max-width: none; height: auto; transform: translate(-50%, 40%); opacity: 0; transition: transform 1.4s var(--pd-ease) .7s, opacity 1s ease .7s; filter: drop-shadow(0 -2px 10px rgba(90,60,20,.12)); }
.pd-court-urn { display: none; }
.pd-court.is-on .pd-court-ivy img { transform: translateY(-40%); opacity: 1; }
.pd-court.is-on .pd-court-lan img { transform: none; opacity: 1; animation: pd-sway 5s ease-in-out 1.9s infinite; }
.pd-court.is-on .pd-court-lan.is-r img { transform: scaleX(-1); animation-name: pd-sway-flip; }
@keyframes pd-sway-flip { 0%, 100% { transform: scaleX(-1) rotate(-2.2deg); } 50% { transform: scaleX(-1) rotate(2.2deg); } }
.pd-court.is-on .pd-court-flowers { opacity: 1; transform: none; }
.pd-court.is-on .pd-portrait-ring { opacity: 1; transform: none; }
.pd-court.is-on .pd-portrait-photo img { animation: pd-kb 16s ease-out .6s both; }
@keyframes pd-kb { from { scale: 1.12; } to { scale: 1; } }
.pd-court.is-on .pd-court-text > * { opacity: 1; transform: none; }
.pd-court.is-on .pd-court-text > :nth-child(1) { transition-delay: .55s; }
.pd-court.is-on .pd-court-text > :nth-child(2) { transition-delay: .7s; }
.pd-court.is-on .pd-court-text > :nth-child(3) { transition-delay: .85s; }
.pd-court.is-on .pd-court-text > :nth-child(4) { transition-delay: 1s; }
.pd-court.is-on .pd-court-text > :nth-child(5) { transition-delay: 1.15s; }
.pd-court.is-on .pd-court-text > :nth-child(6) { transition-delay: 1.3s; }
.pd-court.is-on .pd-court-rail { transform: translate(-50%, 14%); opacity: 1; }
@media (min-width: 700px) {
  .pd-court-arch { width: min(100%, 560px); }
  .pd-court-urn { display: block; position: absolute; bottom: 0; height: clamp(150px, 20vw, 250px); width: auto; opacity: 0; transform: translateY(30%); transition: transform 1.3s var(--pd-ease) .85s, opacity 1s ease .85s; filter: drop-shadow(0 10px 14px rgba(70,50,10,.22)); }
  .pd-court-urn.is-l { left: max(1%, calc(50% - 470px - 11vw)); }
  .pd-court-urn.is-r { right: max(1%, calc(50% - 470px - 11vw)); }
  .pd-court.is-on .pd-court-urn { opacity: 1; transform: none; }
  .pd-court.is-on .pd-court-urn.is-r { transform: scaleX(-1); }
  .pd-court-urn.is-r { transform: translateY(30%) scaleX(-1); }
}
@media (min-width: 1024px) {
  .pd-court { padding: 190px 40px 190px; }
  .pd-court-far { display: block; }
  .pd-court-stage { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: center; gap: clamp(24px, 4vw, 72px); text-align: left; justify-items: start; padding: 0 clamp(60px, 7vw, 140px); }
  .pd-court-arch { width: 100%; max-width: 640px; justify-self: end; }
  .pd-court-text { justify-items: start; }
  .pd-court-names { align-items: flex-start; }
  .pd-court-n { font-size: clamp(84px, 7.6vw, 128px); }
  .pd-court-amp { margin-left: .4em; }
  .pd-court-lan { width: clamp(200px, 17vw, 300px); }
  .pd-court-lan.is-l { left: 7%; }
  .pd-court-lan.is-r { right: 7%; }
  .pd-court-ivy img { transform: translateY(-80%); }
  .pd-court.is-on .pd-court-ivy img { transform: translateY(-57%); }
  .pd-court-rail { width: min(62vw, 900px); }
  .pd-court.is-on .pd-court-rail { transform: translate(-50%, 30%); }
  .pd-court-amp { margin: -.1em 0 -.2em 1.2em; font: 400 clamp(40px, 3.6vw, 56px)/1 var(--wk-font-script); letter-spacing: 0; }
}
@media (min-width: 1440px) {
  .pd-court-stage { max-width: 1480px; }
  .pd-court-arch { max-width: 780px; }
  .pd-court-n { font-size: clamp(110px, 8vw, 160px); }
  .pd-court-when { padding: 18px 26px; }
  .pd-court-date { font-size: 19px; }
  .pd-court-venue { font-size: 21px; }
}

/* ══ SECTIONS ═════════════════════════════════════════════════════════════ */

.pd-invite-wrap { position: relative; padding-top: 28px; }
.pd-invite { position: relative; max-width: 720px; margin: 0 auto; padding: clamp(44px, 9vw, 72px) clamp(18px, 5vw, 56px) clamp(30px, 6vw, 48px); border-radius: clamp(16px, 2.4vw, 22px); background: radial-gradient(100% 70% at 50% 0%, #FFFCF4 0%, var(--wk-surface-solid) 60%), var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), inset 0 0 0 7px var(--wk-surface-solid), inset 0 0 0 8px color-mix(in srgb, var(--wk-gold) 35%, transparent), 0 30px 60px -40px rgba(90,60,20,.55); }

.pd-fam { display: grid; gap: 22px; }
.pd-blessings-of { text-align: center; }
.pd-blessings-names { margin: 6px 0 0; font: italic 500 clamp(18px, 4.4vw, 22px)/1.4 var(--wk-font-display); color: var(--wk-ink); }

/* the auspicious day */
.pd-day { display: grid; justify-items: center; }
.pd-scroll { position: relative; width: min(100%, 880px); min-height: clamp(310px, 44vw, 420px); display: grid; place-items: center; padding: 11% 15% 12%; }
.pd-scroll-paper { position: absolute; inset: 0; transform: scaleX(.06); opacity: 0; transition: transform 1.35s cubic-bezier(.65,0,.25,1), opacity .35s ease; filter: drop-shadow(0 18px 24px rgba(110,70,20,.22)); }
.pd-scroll-paper img { display: block; width: 100%; height: 100%; object-fit: fill; }
.pd-scroll-text { position: relative; display: grid; justify-items: center; gap: 4px; text-align: center; color: #4A2E14; }
.pd-scroll-l { margin: 0; opacity: 0; transform: translateY(10px); transition: opacity .8s ease calc(1.05s + var(--i) * .16s), transform .9s var(--pd-ease) calc(1.05s + var(--i) * .16s); }
.pd-scroll-eyebrow { font: 600 clamp(11px, 2.8vw, 13px)/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: #8A5A1C; }
.pd-scroll-wd { font: 400 clamp(34px, 9vw, 54px)/1.1 var(--wk-font-script); color: #7A3A12; }
.pd-scroll-date { font: 600 clamp(24px, 6.4vw, 44px)/1.12 var(--wk-font-display); color: #3A2414; }
.pd-scroll-time { margin-top: 4px; font: 600 clamp(12px, 3vw, 15px)/1.4 var(--wk-font-caps); letter-spacing: .14em; text-transform: uppercase; color: #6A4A30; }
.pd-scroll-venue { font: italic 500 clamp(16px, 4vw, 20px)/1.35 var(--wk-font-display); color: #4A2E14; text-wrap: balance; }
.pd-day.is-on .pd-scroll-paper { transform: none; opacity: 1; }
.pd-day.is-on .pd-scroll-l { opacity: 1; transform: none; }
.pd-havan { position: relative; width: clamp(110px, 26vw, 170px); margin-top: -18px; z-index: 1; opacity: 0; transform: translateY(20px) scale(.9); transition: opacity .9s ease 1.6s, transform 1.1s var(--pd-ease) 1.6s; }
.pd-havan img { position: relative; display: block; width: 100%; height: auto; }
.pd-havan-glow { position: absolute; left: 50%; top: 22%; width: 150%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%,-50%); background: radial-gradient(closest-side, rgba(255,190,80,.75), rgba(255,150,40,.25) 55%, rgba(255,140,40,0) 100%); animation: pd-fire 2.2s ease-in-out infinite alternate; }
@keyframes pd-fire { from { opacity: .55; transform: translate(-50%,-50%) scale(.92); } to { opacity: 1; transform: translate(-50%,-50%) scale(1.08); } }
.pd-day.is-on .pd-havan { opacity: 1; transform: none; }
.pd-count { position: relative; margin-top: 30px; width: 100%; display: grid; justify-items: center; }
.pd-count-in { position: relative; z-index: 1; display: grid; justify-items: center; gap: 10px; padding: 22px clamp(12px, 4vw, 34px) 26px; border-radius: 26px; background: color-mix(in srgb, var(--wk-surface-solid) 86%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent), 0 24px 50px -36px rgba(90,60,20,.6); max-width: 100%; }
.pd-count-in .wk-eyebrow { margin: 0; }
.pd-count-lan { display: none; }
@media (min-width: 900px) {
  .pd-count { grid-template-columns: 1fr auto 1fr; align-items: start; }
  .pd-count-lan { display: block; width: clamp(150px, 15vw, 230px); margin-top: -40px; transform-origin: 50% 0; animation: pd-sway 5.4s ease-in-out infinite; }
  .pd-count-lan.is-l { justify-self: end; }
  .pd-count-lan.is-r { justify-self: start; animation-delay: -2.7s; }
  .pd-count-lan img { display: block; width: 100%; height: auto; }
  .pd-count-lan.is-r img { transform: scaleX(-1); }
}

/* story */
.pd-story { --pd-p: 0; position: relative; padding: 6px 0 10px; }
.pd-story-rail { position: absolute; top: 0; bottom: 0; left: 22px; width: 3px; border-radius: 3px; background: color-mix(in srgb, var(--wk-gold) 22%, transparent); overflow: hidden; }
.pd-story-rail i { position: absolute; inset: 0; transform-origin: 50% 0; transform: scaleY(var(--pd-p)); background: repeating-linear-gradient(180deg, #B3261E 0 7px, #E9C46A 7px 11px, #B3261E 11px 15px, #FFF3D0 15px 18px); }
.pd-chapters { list-style: none; margin: 0; padding: 0; display: grid; gap: 34px; }
.pd-ch { position: relative; display: grid; gap: 14px; padding-left: 56px; }
.pd-ch-dot { position: absolute; left: 11px; top: 4px; width: 25px; height: 25px; border-radius: 50%; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1.5px var(--wk-gold), 0 4px 10px -4px rgba(120,80,20,.5); display: grid; place-items: center; }
.pd-ch-dot i { width: 9px; height: 12px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: radial-gradient(circle at 50% 70%, #FFE6A0, #F29A2E 70%); box-shadow: 0 0 10px 3px rgba(255,180,60,.55); animation: pd-flicker 1.8s ease-in-out infinite alternate; }
@keyframes pd-flicker { from { transform: scale(.9) rotate(-3deg); opacity: .85; } to { transform: scale(1.08) rotate(3deg); opacity: 1; } }
.pd-ch-photo { width: min(100%, 360px); }
.pd-ch-win { position: relative; display: block; aspect-ratio: 4 / 5; border-radius: clamp(14px, 2vw, 18px); overflow: hidden; box-shadow: 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), 0 0 0 6px var(--wk-surface-solid), 0 0 0 7px color-mix(in srgb, var(--wk-gold) 35%, transparent), 0 24px 44px -28px rgba(80,50,10,.55); }
.pd-ch-when { margin: 0; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .24em; color: var(--wk-gold-ink); }
.pd-ch-title { margin: 6px 0 6px; font: 500 clamp(24px, 6vw, 32px)/1.15 var(--wk-font-display); color: var(--wk-ink); }
.pd-ch-line { margin: 0; font: 400 16.5px/1.6 var(--wk-font-sans); color: var(--wk-muted); max-width: 34rem; }
@media (min-width: 860px) {
  .pd-story-rail { left: 50%; transform: translateX(-50%); }
  .pd-ch { grid-template-columns: 1fr 1fr; align-items: center; gap: 70px; padding-left: 0; }
  .pd-ch-dot { left: 50%; top: 50%; transform: translate(-50%, -50%); }
  .pd-ch-photo { justify-self: end; }
  .pd-ch.is-alt .pd-ch-photo { order: 2; justify-self: start; }
  .pd-ch.is-alt .pd-ch-text { text-align: right; justify-self: end; }
  .pd-ch.no-photo .pd-ch-text { grid-column: 2; }
  .pd-ch.no-photo.is-alt .pd-ch-text { grid-column: 1; }
}

/* functions */
/* the rail: one card snaps to the centre on every screen; arrows on wider screens, dots underneath */
.pd-ev-wrap { position: relative; }
.pd-ev-grid { --cw: min(78vw, 320px); --gap: 14px; list-style: none; margin: 0 calc(50% - 50vw); padding: 12px calc((100vw - var(--cw)) / 2) 18px; display: flex; gap: var(--gap); overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scroll-behavior: smooth; scrollbar-width: none; overscroll-behavior-x: contain; }
.pd-ev-grid::-webkit-scrollbar { display: none; }
.pd-ev { flex: 0 0 var(--cw); display: flex; scroll-snap-align: center; scroll-snap-stop: always; transition: transform .45s var(--pd-ease), opacity .45s ease; }
.pd-ev:not(.is-at) { transform: scale(.94); opacity: .72; }
.pd-evs.is-one .pd-ev { transform: none; opacity: 1; }
@media (min-width: 700px) { .pd-ev-grid { --cw: 340px; --gap: 22px; } }
@media (min-width: 1100px) { .pd-ev-grid { --cw: 360px; --gap: 28px; } }
.pd-ev-arrow { display: none; }
@media (min-width: 700px) {
  .pd-ev-arrow { position: absolute; z-index: 3; top: 36%; display: grid; place-items: center; width: 48px; height: 48px; border: 0; border-radius: 50%; cursor: pointer; color: #F6E2A6; background: linear-gradient(115deg, #8A2B3E, #5E1727); box-shadow: 0 12px 24px -12px rgba(94,23,39,.8), inset 0 0 0 1.5px rgba(243,216,143,.55); transition: transform .2s ease, opacity .3s ease; }
  .pd-ev-arrow:active { transform: scale(.94); }
  .pd-ev-arrow:disabled { opacity: 0; pointer-events: none; }
  .pd-ev-arrow.is-prev { left: calc(50% - var(--cw-a, 340px) / 2 - 74px); }
  .pd-ev-arrow.is-next { right: calc(50% - var(--cw-a, 340px) / 2 - 74px); }
}
@media (min-width: 1100px) { .pd-ev-wrap { --cw-a: 360px; } }
/* tablets and up (as the royal invitation): a centred grid, two across then three; the rail and dots are phone-only */
@media (min-width: 700px) {
  .pd-ev-grid { margin: 0; padding: 10px 0 16px; flex-wrap: wrap; justify-content: center; gap: 26px; overflow: visible; scroll-snap-type: none; scroll-behavior: auto; }
  .pd-ev-grid > .pd-ev { flex: 0 0 calc((100% - 26px) / 2); max-width: 400px; }
  .pd-ev:not(.is-at) { transform: none; opacity: 1; }
  .pd-ev-arrow, .pd-ev-dots { display: none !important; }
}
@media (min-width: 1100px) { .pd-ev-grid { gap: 30px; } .pd-ev-grid > .pd-ev { flex-basis: calc((100% - 60px) / 3); max-width: 380px; } }
.pd-ev-dots { display: flex; justify-content: center; margin-top: 6px; }
.pd-ev-dots button { display: grid; place-items: center; min-width: 24px; height: 28px; padding: 0 2px; border: 0; background: none; cursor: pointer; }
.pd-ev-dots button::after { content: ""; width: 8px; height: 8px; border-radius: 999px; background: color-mix(in srgb, #8A2B3E 28%, transparent); transition: width .3s var(--pd-ease), background-color .3s ease; }
.pd-ev-dots button.is-on::after { width: 24px; background: #8A2B3E; }
.pd-ev-card { position: relative; flex: 1; display: flex; flex-direction: column; border-radius: clamp(16px, 2vw, 22px); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent); overflow: hidden; transition: transform .35s var(--pd-ease); }
@media (hover: hover) { .pd-ev-card:hover { transform: translateY(-4px); } }
.pd-ev-alcove { position: relative; height: 210px; display: flex; align-items: flex-end; justify-content: center; background: radial-gradient(70% 60% at 50% 78%, rgba(255,226,160,.9) 0%, rgba(255,236,200,.35) 55%, rgba(255,236,200,0) 80%), linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 60%, #FFF6E2), color-mix(in srgb, var(--wk-bg2) 70%, #F2DFBA)); }
.pd-ev-glow { position: absolute; left: 50%; top: 30%; width: 70%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%,-50%); background: radial-gradient(closest-side, rgba(255,255,255,.85), rgba(255,255,255,0)); }
.pd-ev-carpet { position: absolute; left: 8%; bottom: 10px; width: 84%; height: auto; opacity: .95; }
.pd-ev-couple { position: relative; height: 84%; width: auto; max-width: 92%; object-fit: contain; object-position: bottom; margin-bottom: 22px; transform-origin: 50% 100%; animation: pd-breathe 6s ease-in-out infinite; }
@keyframes pd-breathe { 0%, 100% { transform: rotate(-.8deg); } 50% { transform: rotate(.8deg) translateY(-2px); } }
.pd-ev-no { position: absolute; top: 38%; left: 7%; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.pd-ev-body { display: grid; gap: 6px; padding: 14px 18px 18px; }
.pd-ev-date { margin: 0; }
/* Hindi dates: letter-spacing tears Devanagari conjuncts and the shirorekha apart. */
.pd-root.is-hi .pd-ev-date, .pd-root.is-hi .wk-cd-label { letter-spacing: .02em; }
.pd-ev-title { margin: 0; font: 600 26px/1.1 var(--wk-font-display); color: var(--wk-ink); }
.pd-ev-line { margin: 0; display: flex; gap: 9px; align-items: flex-start; font: 400 14px/1.4 var(--wk-font-sans); color: var(--wk-ink); }
.pd-ev-line svg { flex: none; margin-top: 2px; color: var(--wk-gold-ink); }
.pd-ev-line b { display: block; font-weight: 600; }
.pd-ev-addr { display: block; color: var(--wk-muted); font-size: 13px; }
.pd-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; box-shadow: 0 0 0 2px var(--wk-surface-solid), 0 0 0 3px color-mix(in srgb, var(--wk-gold) 70%, transparent); }
.pd-ev-k { font-weight: 600; color: var(--wk-gold-ink); }
.pd-ev-note { margin: 2px 0 0; font: italic 400 15px/1.45 var(--wk-font-display); color: var(--wk-muted); }
.pd-ev-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 6px; }
.pd-ev-actions .pd-btn { padding: 0 13px; gap: 6px; font-size: 13px; }

/* venue */
.pd-venue { display: grid; grid-template-columns: minmax(0, 1fr); align-items: stretch; }
.pd-venue-pillar { display: none; }
@media (min-width: 900px) {
  .pd-venue { grid-template-columns: 120px minmax(0, 620px) 120px; justify-content: center; gap: 0; align-items: end; }
  .pd-venue-pillar { display: block; width: 100%; height: 100%; max-height: 640px; object-fit: contain; object-position: bottom; opacity: .92; filter: sepia(.15) drop-shadow(8px 12px 14px rgba(90,60,20,.18)); }
  .pd-venue-card { position: relative; z-index: 1; margin: 0 -14px; }
}

/* film */
.pd-film { position: relative; aspect-ratio: 16 / 9; border-radius: 22px; overflow: hidden; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent), 0 26px 50px -34px rgba(60,30,10,.6); background: #000; }
.pd-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.pd-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: #000; }
.pd-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .85; }
.pd-film-play { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; transform: translate(-50%,-50%); border-radius: 50%; display: grid; place-items: center; color: #3A2414; background: linear-gradient(110deg, var(--pd-gold-a), var(--pd-gold-c)); box-shadow: 0 0 0 8px rgba(255,240,200,.25); }
.pd-film-label { position: absolute; left: 0; right: 0; bottom: 16px; text-align: center; font: 600 14px/1 var(--wk-font-sans); color: #FFF6E3; letter-spacing: .06em; }

/* for our guests */
.pd-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 700px) { .pd-know { grid-template-columns: repeat(2, minmax(0, 1fr)); } .pd-know-wide { grid-column: 1 / -1; } }
.pd-know-i { padding: 18px 20px; border-radius: 18px; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent); }
.pd-know-h { margin: 0 0 6px; font: 600 12px/1 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); }
.pd-know-t { margin: 0; font: 400 15.5px/1.55 var(--wk-font-sans); color: var(--wk-ink); }
.pd-info-block { margin-top: 30px; }
.pd-info-h { margin: 0 0 12px; text-align: center; font: 500 clamp(24px, 6vw, 30px)/1.2 var(--wk-font-display); color: var(--wk-ink); }
.pd-contacts { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 700px) { .pd-contacts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.pd-contact { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent); }
.pd-contact-ini { flex: none; display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; font: 400 26px/1 var(--wk-font-script); color: #8A5A1C; background: radial-gradient(circle at 50% 35%, #FFF8E6, #F1DBA8); box-shadow: inset 0 0 0 1px rgba(184,138,53,.55); }
.pd-contact-who { flex: 1; min-width: 0; display: grid; gap: 2px; }
.pd-contact-who b { font: 600 16px/1.2 var(--wk-font-sans); color: var(--wk-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pd-contact-who small { font: 400 13.5px/1.2 var(--wk-font-sans); color: var(--wk-muted); }
.pd-contact-acts { display: flex; gap: 8px; }
.pd-shagun { max-width: 520px; margin: 0 auto; padding: 20px; border-radius: 22px; text-align: center; display: grid; gap: 12px; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 50%, transparent); }
.pd-shagun-line { margin: 0; font: italic 400 17px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.pd-shagun-id { margin: 0; display: grid; gap: 2px; }
.pd-shagun-id span { font: 600 19px/1.3 var(--wk-font-sans); color: var(--wk-ink); word-break: break-all; }
.pd-shagun-id small { color: var(--wk-muted); font-size: 13.5px; }
.pd-shagun-acts { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
@media (pointer: fine) { .pd-only-touch { display: none !important; } }
.pd-live { display: flex; justify-content: center; margin-top: 26px; }
.pd-live-btn { position: relative; }
.pd-live-dot { width: 9px; height: 9px; border-radius: 50%; background: #D7263D; box-shadow: 0 0 0 0 rgba(215,38,61,.6); animation: pd-live 1.6s ease-out infinite; }
@keyframes pd-live { 0% { box-shadow: 0 0 0 0 rgba(215,38,61,.6); } 100% { box-shadow: 0 0 0 10px rgba(215,38,61,0); } }
.pd-live-soon { margin: 0; display: inline-flex; gap: 8px; align-items: center; padding: 10px 16px; border-radius: 999px; font: 500 14px/1.3 var(--wk-font-sans); color: var(--wk-muted); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 40%, transparent); }

/* rsvp */
.pd-upasthiti { margin: -6px 0 18px; text-align: center; font: 400 clamp(26px, 7vw, 36px)/1.2 var(--wk-font-script); color: var(--wk-gold-ink); }

/* finale */
.pd-finale { position: relative; padding: 70px 16px 0; text-align: center; overflow: clip; display: grid; justify-items: center; gap: 6px; }
.pd-finale-seal { margin: 6px 0 0; display: grid; gap: 2px; }
.pd-finale-seal b { font: 600 clamp(30px, 8vw, 42px)/1.15 var(--wk-font-deva); color: #8A2A12; }
.pd-finale-seal small { font: 600 12px/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
.pd-finale-names { margin: 6px 0 0; font: 400 clamp(46px, 12vw, 80px)/1.1 var(--wk-font-script); padding: 0 .1em; }
.pd-finale-names span { font-family: var(--wk-font-display); font-size: .5em; }
.pd-finale-line { margin: 0; max-width: 32rem; font: italic 400 clamp(17px, 4.4vw, 21px)/1.45 var(--wk-font-display); color: var(--wk-muted); }
.pd-hashtag { margin: 4px 0 0; font: 600 15px/1 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-gold-ink); }
.pd-share { display: grid; gap: 16px; justify-items: center; margin-top: 18px; width: 100%; max-width: 640px; }
.pd-share-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.pd-personal { width: 100%; display: grid; gap: 8px; padding: 16px; border-radius: 20px; background: color-mix(in srgb, var(--wk-surface-solid) 85%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent); text-align: left; }
.pd-personal-l { font: 600 12px/1 var(--wk-font-caps); letter-spacing: .18em; text-transform: uppercase; color: var(--wk-gold-ink); }
.pd-personal-row { display: flex; flex-wrap: wrap; gap: 8px; }
.pd-personal-row .wk-input { flex: 1 1 160px; min-width: 0; min-height: 44px; }
.pd-finale-share { width: 100%; max-width: 640px; display: grid; justify-items: center; }
.pd-share-note { min-height: 18px; margin: 0; font: 500 13.5px/1.3 var(--wk-font-sans); color: var(--wk-gold-ink); word-break: break-all; }

/* ══ RHYTHM + FRAMES (all photos and panels: rounded rectangles) ══════════ */
/* One vertical rhythm that scales with the screen: ~48px on a phone, ~96px on a desktop. */
.pd-root .wk-section.pd-sec { padding-top: clamp(48px, 7vw, 96px); padding-bottom: clamp(48px, 7vw, 96px); }
.pd-root .wk-section.pd-sec .wk-section-head { margin-bottom: clamp(24px, 4vw, 40px); }
/* gallery: a designed block, not an edge-to-edge wall */
.pd-gallery { width: 100%; max-width: 1080px; margin: 0 auto; }
/* family photos: portrait cards, not circles */
.pd-root .wk-family-photo { width: clamp(112px, 26vw, 140px); height: auto; aspect-ratio: 4 / 5; border-radius: 16px; box-shadow: 0 0 0 4px var(--wk-surface-solid), 0 0 0 5px color-mix(in srgb, var(--wk-gold) 60%, transparent), 0 18px 34px -24px rgba(80,50,10,.55); }
/* the couple's own portrait under the floral arch: a rounded 4:5 frame */
.pd-portrait.is-photo { top: 55%; width: 46%; aspect-ratio: 4 / 5; }
.pd-portrait-frame { position: absolute; inset: 0; border-radius: clamp(14px, 2vw, 18px); overflow: hidden; background: #F2DCAC; box-shadow: 0 0 0 1px color-mix(in srgb, var(--wk-gold) 70%, transparent), 0 0 0 5px var(--wk-surface-solid), 0 0 0 6px color-mix(in srgb, var(--wk-gold) 45%, transparent), 0 22px 40px -22px rgba(90,50,10,.6); transform: scale(.85); opacity: 0; transition: transform 1.2s cubic-bezier(.34,1.4,.64,1) .55s, opacity .8s ease .55s; }
.pd-court.is-on .pd-portrait-frame { transform: none; opacity: 1; }
.pd-court-arch.has-photo { margin-bottom: 8%; }
@media (min-width: 1024px) { .pd-court-names { margin-top: 10px; } .pd-court-getting { margin-top: 12px; } }
.pd-scroll-wd { margin-top: 2px; line-height: 1.2; }
.pd-day .pd-havan-glow { width: 110%; top: 30%; }
.pd-court-getting { margin-top: 12px; }
@media (min-width: 1440px) { .pd-court-names { margin-top: 22px; } }
/* small laptops: no room for the far pillars beside the words and the date card */
@media (min-width: 1024px) and (max-width: 1279px) { .pd-court-far { display: none; } }
/* wide desktops: the lanterns hang outside the words */
@media (min-width: 1600px) { .pd-court { padding-top: clamp(190px, 13vw, 260px); } .pd-court-lan { width: clamp(200px, 13vw, 260px); } .pd-court-lan.is-l { left: 3%; } .pd-court-lan.is-r { right: 3%; } }

/* ══ THE COURTYARD, dressed (pillars, balustrade, the arch's decor) ══════ */
/* the names: room for the script's swashes, so the foil never clips a glyph */
.pd-court-n { display: block; padding: .24em .26em .16em; margin: -.2em -.26em -.1em; }
/* breathing room between the names and the ampersand */
.pd-court-amp { margin: .22em 0 .26em; }
/* the floral arch, split into two clusters blooming from the top corners */
.pd-court-corner { position: absolute; top: 0; z-index: 2; width: clamp(130px, 36vw, 200px); pointer-events: none; opacity: 0; transition: transform 1.6s var(--pd-ease) .2s, opacity 1.1s ease .2s; }
.pd-court-corner.is-l { left: -2%; transform-origin: 0 0; transform: translate(-12%, -14%) scale(.92); }
.pd-court-corner.is-r { right: -2%; transform-origin: 100% 0; transform: translate(12%, -14%) scale(.92); }
.pd-court-corner img { display: block; width: 100%; height: auto; }
.pd-court-corner.is-l img { -webkit-mask-image: linear-gradient(90deg, #000 62%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); -webkit-mask-composite: source-in; mask-image: linear-gradient(90deg, #000 62%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); mask-composite: intersect; }
.pd-court-corner.is-r img { -webkit-mask-image: linear-gradient(270deg, #000 62%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); -webkit-mask-composite: source-in; mask-image: linear-gradient(270deg, #000 62%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); mask-composite: intersect; }
.pd-court.is-on .pd-court-corner { opacity: 1; transform: none; animation: pd-bloom 7s ease-in-out 2s infinite; }
.pd-court.is-on .pd-court-corner.is-r { animation-delay: 3.4s; }
/* pillars: the full height of the hero, flush to the screen edges; on narrower
   screens they tuck partly off-screen (--pd-cpv is how much of each shows) */
.pd-court-pillar { top: 0; bottom: 0; height: 100%; opacity: 1; transform: none; filter: sepia(.08) drop-shadow(14px 0 22px rgba(90,60,20,.16)); }
.pd-court-pillar.is-l { left: auto; right: calc(100% - var(--pd-cpv, 120px)); }
.pd-court-pillar.is-r { right: auto; left: calc(100% - var(--pd-cpv, 120px)); filter: sepia(.08) drop-shadow(-14px 0 22px rgba(90,60,20,.16)); }
/* the balustrade, edge to edge, in warm ivory stone */
.pd-court-rail { position: absolute; left: 0; right: 0; bottom: 0; width: auto; height: clamp(92px, 12vw, 200px); background-repeat: repeat-x; background-size: auto 100%; background-position: 50% 100%; transform: translateY(45%); opacity: 0; filter: sepia(.38) saturate(1.35) brightness(1.05) drop-shadow(0 -4px 12px rgba(90,60,20,.14)); transition: transform 1.4s var(--pd-ease) .7s, opacity 1s ease .7s; }
.pd-court.is-on .pd-court-rail { transform: translateY(16%); opacity: 1; }
/* behind the couple: warm light and a slowly turning gold mandala */
.pd-arch-glow { position: absolute; left: 50%; top: 52%; width: 74%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%); background: radial-gradient(closest-side, rgba(255,224,150,.8), rgba(255,226,160,.32) 55%, rgba(255,226,160,0)); opacity: 0; transition: opacity 1.4s ease .5s; pointer-events: none; }
.pd-arch-mandala { position: absolute; left: 50%; top: 52%; width: 78%; height: auto; translate: -50% -50%; opacity: 0; transition: opacity 1.6s ease .6s; pointer-events: none; }
.pd-court-arch.has-photo .pd-arch-glow, .pd-court-arch.has-photo .pd-arch-mandala { top: 55%; }
.pd-court.is-on .pd-arch-glow { opacity: 1; }
.pd-court.is-on .pd-arch-mandala { opacity: .42; animation: pd-mandala 70s linear infinite; }
@keyframes pd-mandala { to { rotate: 360deg; } }
/* lotuses and diyas at the couple's feet */
.pd-arch-foot { position: absolute; left: 2%; right: 2%; top: 100%; height: 15%; z-index: 3; display: flex; align-items: flex-end; justify-content: space-between; pointer-events: none; }
.pd-court-arch.has-photo .pd-arch-foot { top: 88%; }
.pd-arch-lotus { width: 19%; height: auto; filter: drop-shadow(0 6px 8px rgba(120,80,10,.25)); opacity: 0; transform: translateY(20px) scale(.8); transition: transform 1.1s cubic-bezier(.34,1.4,.64,1) 1.1s, opacity .8s ease 1.1s; }
.pd-arch-lotus.is-r { scale: -1 1; }
.pd-arch-diya { display: block; width: 7.5%; min-width: 30px; height: auto; aspect-ratio: 1; overflow: visible; opacity: 0; transform: translateY(10px) scale(.6); transition: transform .8s cubic-bezier(.34,1.5,.64,1), opacity .6s ease; }
.pd-arch-diya.is-0 { transition-delay: 1.5s; margin-left: -8%; }
.pd-arch-diya.is-1 { transition-delay: 1.35s; }
.pd-arch-diya.is-2 { transition-delay: 1.65s; margin-right: -8%; }
.pd-court.is-on .pd-arch-lotus, .pd-court.is-on .pd-arch-diya { opacity: 1; transform: none; }
/* phones: the hero fits one screen, the balustrade in view at its foot */
@media (max-width: 699px) {
  .pd-court-far { display: none; }
  .pd-court { min-height: 100svh; padding: clamp(66px, 8.5svh, 110px) 16px clamp(70px, 9.5svh, 112px); }
  .pd-court-arch { width: min(100%, 470px, max(196px, calc((100svh - 570px) * 1.15))); }
  .pd-court-n { font-size: clamp(42px, min(15vw, 6.4svh), 104px); }
  .pd-court-getting { margin-top: 6px; }
  .pd-court-when { margin-top: 10px; padding: 10px 18px; }
  .pd-court-down { margin-top: 4px; }
  .pd-court-rail { height: clamp(84px, 24vw, 120px); }
  .pd-court.is-on .pd-court-rail { transform: translateY(12%); }
  /* lanterns a little in from the corners, under the flowers */
  .pd-court-lan { width: clamp(110px, 30vw, 170px); }
  .pd-court-lan.is-l { left: 4%; }
  .pd-court-lan.is-r { right: 4%; }
  /* urns in the bottom corners, greenery trailing toward the centre */
  .pd-court-urn { display: block; position: absolute; bottom: 0; height: clamp(96px, 26vw, 130px); width: auto; opacity: 0; transform: translateY(30%); transition: transform 1.3s var(--pd-ease) .85s, opacity 1s ease .85s; filter: drop-shadow(0 8px 10px rgba(70,50,10,.22)); }
  .pd-court-urn.is-l { left: -2%; transform: translateY(30%) scaleX(-1); }
  .pd-court-urn.is-r { right: -2%; }
  .pd-court.is-on .pd-court-urn { opacity: 1; transform: none; }
  .pd-court.is-on .pd-court-urn.is-l { transform: scaleX(-1); }
}
@media (min-width: 700px) {
  /* only a short fringe of the ivy along the top, between the corner flowers */
  /* a short, dense fringe: the strand repeated small, centred, showing only its tips */
  .pd-court-ivy { left: 0; right: 0; }
  .pd-court-ivy img { display: none; }
  .pd-court-ivy-fringe { display: block; height: clamp(96px, 13svh, 150px); background-repeat: repeat-x; background-size: auto calc(clamp(96px, 13svh, 150px) / .42); background-position: 50% 100%; transform: translateY(-100%); opacity: 0; transition: transform 1.6s var(--pd-ease) .15s, opacity 1s ease .15s; }
  .pd-court.is-on .pd-court-ivy-fringe { transform: none; opacity: 1; }
  .pd-court-corner { width: clamp(170px, 18vw, 320px); }
  .pd-court-corner.is-l { left: -1%; transform-origin: 0 0; transform: translate(-12%, -14%) scale(.92); }
  .pd-court-corner.is-r { right: -1%; transform-origin: 100% 0; transform: translate(12%, -14%) scale(.92); }
  .pd-court-corner img { display: block; width: 100%; height: auto; filter: drop-shadow(0 10px 14px rgba(120,80,40,.12)); }
  .pd-court-corner.is-l img { -webkit-mask-image: linear-gradient(90deg, #000 62%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); -webkit-mask-composite: source-in; mask-image: linear-gradient(90deg, #000 62%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); mask-composite: intersect; }
  .pd-court-corner.is-r img { -webkit-mask-image: linear-gradient(270deg, #000 62%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); -webkit-mask-composite: source-in; mask-image: linear-gradient(270deg, #000 62%, transparent 100%), linear-gradient(180deg, #000 70%, transparent 100%); mask-composite: intersect; }
  .pd-court.is-on .pd-court-corner { opacity: 1; transform: none; animation: pd-bloom 7s ease-in-out 2s infinite; }
  .pd-court.is-on .pd-court-corner.is-r { animation-delay: 3.4s; }
}
@keyframes pd-bloom { 0%, 100% { rotate: 0deg; } 50% { rotate: .8deg; } }
@media (min-width: 700px) {
  .pd-court { --pd-cpv: clamp(64px, 10vw, 104px); }
  .pd-court-far { display: block; }
  /* the urns stand in the extreme corners, at the pillars' feet, their greenery trailing toward the centre */
  .pd-court-urn.is-l { left: 0; transform: translateY(30%) scaleX(-1); }
  .pd-court-urn.is-r { right: 0; transform: translateY(30%); }
  .pd-court.is-on .pd-court-urn.is-l { transform: scaleX(-1); }
  .pd-court.is-on .pd-court-urn.is-r { transform: none; }
  .pd-court-lan.is-l { left: calc(var(--pd-cpv) - 3vw); }
  .pd-court-lan.is-r { right: calc(var(--pd-cpv) - 3vw); }
}
@media (min-width: 1024px) {
  .pd-court { --pd-cpv: clamp(110px, 10.5vw, 150px); }
  /* one screen: the hero fits the viewport, so the pillars and the balustrade frame it whole */
  .pd-court { min-height: 100svh; padding: clamp(92px, 13svh, 170px) 0 clamp(104px, 15svh, 190px); }
  .pd-court-stage { max-width: min(1480px, calc(100vw - 2 * var(--pd-cpv) - 4vw)); padding: 0; }
  .pd-court-arch { max-width: min(780px, calc((100svh - 250px) * 1.12)); }
  .pd-court-n { font-size: clamp(70px, min(7.6vw, 11.5svh), 160px); }
  .pd-court-amp { font-size: clamp(34px, min(3.6vw, 5.6svh), 56px); }
  .pd-court-names { margin-top: clamp(4px, 1.4svh, 22px); }
  .pd-court-when { margin-top: clamp(8px, 1.6svh, 14px); }
  .pd-court-down { margin-top: clamp(4px, 1.4svh, 16px); }
  .pd-court-rail { height: clamp(140px, 11vw, 200px); }
  .pd-court.is-on .pd-court-rail { transform: translateY(24%); }
  .pd-court-lan { width: clamp(200px, 18vw, 340px); }
  .pd-court-lan.is-l { left: calc(var(--pd-cpv) - 9vw); }
  .pd-court-lan.is-r { right: calc(var(--pd-cpv) - 9vw); }
  .pd-court-urn { height: clamp(120px, min(20vw, 22svh), 250px); }
  .pd-court-amp { margin: .1em 0 .12em 1.2em; }
}
@media (min-width: 1024px) and (max-width: 1279px) { .pd-court-far { display: block; } }
/* big portrait tablets (iPad Pro): stacked like the smaller tablets, not side by side */
@media (min-width: 1024px) and (max-aspect-ratio: 4/5) {
  .pd-court { --pd-cpv: clamp(110px, 12vw, 150px); padding: clamp(84px, 7.5svh, 130px) 0 clamp(100px, 10svh, 170px); }
  .pd-court-stage { grid-template-columns: minmax(0, 1fr); justify-items: center; text-align: center; gap: 6px; }
  .pd-court-arch { width: min(100%, 680px, calc((100svh - 830px) * 1.12)); justify-self: center; }
  .pd-court-text { justify-items: center; }
  .pd-court-names { align-items: center; }
  .pd-court-amp { margin: .1em 0 .12em; }
  .pd-court-n { font-size: clamp(70px, min(10vw, 7svh), 130px); }
}
/* tablets (stacked): the arch over the words, all within one screen */
@media (min-width: 700px) and (max-width: 1023px) {
  .pd-court { --pd-cpv: clamp(84px, 13vw, 124px); min-height: 100svh; padding: clamp(76px, 7svh, 120px) 16px clamp(90px, 9svh, 150px); }
  .pd-court-arch { width: min(100%, 560px, calc((100svh - 720px) * 1.12)); min-width: 320px; }
  .pd-court-n { font-size: clamp(54px, min(12vw, 7svh), 100px); }
  .pd-court-when { margin-top: 8px; }
  .pd-court-down { margin-top: 6px; }
  .pd-court-rail { height: clamp(100px, 13vw, 140px); }
  .pd-court-lan { width: clamp(120px, 16vw, 170px); }
  .pd-court-lan.is-l { left: 7vw; }
  .pd-court-lan.is-r { right: 7vw; }
}
@media (min-width: 1440px) { .pd-court { --pd-cpv: clamp(160px, 13vw, 250px); } .pd-court-n { font-size: clamp(100px, min(8vw, 12.5svh), 160px); } }
@media (min-width: 1024px) and (max-width: 1279px) { .pd-court-date { white-space: nowrap; letter-spacing: .1em; } }
@media (min-width: 1600px) { .pd-court-lan.is-l { left: calc(var(--pd-cpv) - 5.5vw); } .pd-court-lan.is-r { right: calc(var(--pd-cpv) - 5.5vw); } }

/* ══ SECTIONS, DRESSED: one palace ambience across the whole page ═══════ */
/* Every section paints a full-screen-wide background (not just its column):
   a gold bidri lattice texture. Gold dust rises behind everything. The auspicious day is a maroon
   band, the same wall as the palace door. */
.pd-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0; transition: opacity 1.4s ease 1s; }
.pd-root.is-open .pd-ambient { opacity: 1; }
.pd-ambient i { position: absolute; bottom: -12px; border-radius: 50%; background: #F3D88F; box-shadow: 0 0 6px 2px rgba(233,196,106,.55); opacity: 0; animation: pd-rise-dust linear infinite; }
@keyframes pd-rise-dust { 0% { translate: 0 0; opacity: 0; } 12% { opacity: .7; } 85% { opacity: .45; } 100% { translate: var(--dx) -105vh; opacity: 0; } }
.pd-root .wk-section.pd-sec { isolation: isolate; }
.pd-root .wk-section.pd-sec::before { content: ""; position: absolute; top: 0; bottom: 0; left: 50%; width: 100vw; translate: -50% 0; z-index: -2; pointer-events: none; background: url(/wedding-v3/palace-door/lattice-tile.webp) 50% 0 / clamp(150px, 14vw, 220px) repeat; opacity: .2; }
.pd-root .wk-section.pd-sec::after { content: ""; position: absolute; top: clamp(6px, 2vw, 30px); left: 50%; width: min(560px, 92vw); aspect-ratio: 1; translate: -50% 0; z-index: -1; pointer-events: none; }
@keyframes pd-turn { to { rotate: 360deg; } }
/* no mandala watermark behind the section headings: the lattice carries the texture */
.pd-root .wk-section.pd-sec:not(.pd-sec-day)::after { display: none; }
.pd-root .wk-section.pd-sec .wk-section-head { position: relative; }

/* the invitation */
.pd-invite-wrap { isolation: isolate; }
.pd-invite { margin-top: clamp(10px, 2vw, 20px); }
.pd-invite::before { content: ""; position: absolute; inset: 14px; border-radius: clamp(10px, 1.6vw, 14px); pointer-events: none; border: 1px solid color-mix(in srgb, var(--wk-gold) 40%, transparent); background: radial-gradient(circle at 0 0, color-mix(in srgb, var(--wk-gold) 55%, transparent) 0 5px, transparent 6px) 0 0 / 50% 50% no-repeat, radial-gradient(circle at 100% 0, color-mix(in srgb, var(--wk-gold) 55%, transparent) 0 5px, transparent 6px) 100% 0 / 50% 50% no-repeat, radial-gradient(circle at 0 100%, color-mix(in srgb, var(--wk-gold) 55%, transparent) 0 5px, transparent 6px) 0 100% / 50% 50% no-repeat, radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--wk-gold) 55%, transparent) 0 5px, transparent 6px) 100% 100% / 50% 50% no-repeat; }

/* wide and arched (as the royal invitation): the two languages side by side, the card about half as tall */
.pd-invite-lotus { position: absolute; bottom: -18px; width: clamp(74px, 12vw, 130px); height: auto; z-index: 2; pointer-events: none; filter: drop-shadow(0 8px 10px rgba(120,80,10,.22)); }
.pd-invite-lotus.is-l { left: -22px; }
.pd-invite-lotus.is-r { right: -22px; scale: -1 1; }
@media (min-width: 860px) {
  .pd-sec-invite.wk-w-normal { max-width: 1240px; }
  .pd-invite { max-width: 1080px; padding: clamp(56px, 6vw, 72px) clamp(40px, 5vw, 72px) 40px; border-radius: 50% 50% 24px 24px / 120px 120px 24px 24px; }
  .pd-invite::before { border-radius: 50% 50% 14px 14px / 108px 108px 14px 14px; }
  .pd-invite .wk-msg { max-width: none; }
  .pd-invite .wk-msg-orn { width: 52px !important; margin-bottom: 4px; }
  .pd-invite .wk-msg-heading { font-size: clamp(44px, 4.4vw, 58px); margin-bottom: 14px; }
  .pd-invite .wk-msg-cols { gap: clamp(28px, 4vw, 56px); }
  .pd-invite .wk-msg-text p { font-size: 19px; line-height: 1.6; margin-bottom: .8em; }
  .pd-invite .wk-msg-text.is-deva p { font-size: 18px; line-height: 1.85; }
}
/* laptops between 860 and 1400: the card keeps a margin from the screen edges */
@media (min-width: 860px) and (max-width: 1399px) {
  .pd-invite { max-width: calc(100vw - 120px); }
}
/* phones: tightened, a gentler arch */
@media (max-width: 699px) {
  .pd-invite { padding: 46px 16px 26px; border-radius: 50% 50% 18px 18px / 64px 64px 18px 18px; }
  .pd-invite::before { inset: 10px; border-radius: 50% 50% 10px 10px / 56px 56px 10px 10px; }
  .pd-invite .wk-msg-orn { width: 44px !important; margin-bottom: 2px; }
  .pd-invite .wk-msg-heading { font-size: 36px; margin-bottom: 8px; }
  .pd-invite .wk-msg-text p { font-size: 16px; line-height: 1.55; margin-bottom: .6em; }
  .pd-invite .wk-msg-text.is-deva p { font-size: 15px; line-height: 1.75; }
  .pd-invite-lotus { width: 70px; bottom: -14px; }
  .pd-invite-lotus.is-l { left: -10px; }
  .pd-invite-lotus.is-r { right: -10px; }
}

/* families: two arched windows */
.pd-fam .wk-families-grid { position: relative; }
.pd-fam .wk-family { position: relative; overflow: hidden; padding-top: clamp(46px, 6vw, 60px) !important; border-radius: 999px 999px 22px 22px / 150px 150px 22px 22px !important; background: radial-gradient(90% 60% at 50% 0%, rgba(255,232,180,.55), rgba(255,232,180,0) 70%), var(--wk-surface-solid) !important; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 65%, transparent), inset 0 0 0 7px var(--wk-surface-solid), inset 0 0 0 8px color-mix(in srgb, var(--wk-gold) 30%, transparent), 0 28px 50px -34px rgba(90,60,20,.55) !important; transition: transform .45s var(--pd-ease), box-shadow .45s ease; }
.pd-fam .wk-family::after { content: ""; position: absolute; left: 12%; right: 12%; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: linear-gradient(90deg, transparent, #C9974F, #F3D88F, #C9974F, transparent); }
@media (hover: hover) { .pd-fam .wk-family:hover { transform: translateY(-6px); } }
.pd-blessings-of { position: relative; padding: 14px 18px 18px; }
.pd-blessings-of::after { content: ""; display: block; width: min(260px, 70%); height: 1px; margin: 14px auto 0; background: linear-gradient(90deg, transparent, var(--wk-gold), transparent); }

/* the auspicious day: a maroon band across the whole screen, like the palace wall */
.pd-root .wk-section.pd-sec.pd-sec-day::after { display: block; top: 0; bottom: 0; left: 50%; width: 100vw; aspect-ratio: auto; translate: -50% 0; z-index: -1; background: url(/wedding-v3/palace-door/lattice-tile.webp) 50% 0 / clamp(150px, 13vw, 200px) repeat; opacity: .16; }
.pd-root .wk-section.pd-sec.pd-sec-day::before { opacity: 1; background: radial-gradient(70% 55% at 50% 42%, #8A2B3E 0%, #6A1C2C 45%, #3E0E19 100%); box-shadow: inset 0 4px 0 #C9974F, inset 0 7px 0 #6A1C2C, inset 0 8px 0 rgba(243,216,143,.6), inset 0 -4px 0 #C9974F, inset 0 -7px 0 #6A1C2C, inset 0 -8px 0 rgba(243,216,143,.6); }
.pd-sec-day .pd-scroll-paper { filter: drop-shadow(0 22px 30px rgba(20,0,5,.55)); }
.pd-sec-day .pd-havan-glow { background: radial-gradient(closest-side, rgba(255,200,90,.9), rgba(255,150,40,.35) 55%, rgba(255,140,40,0) 100%); }
.pd-sec-day .pd-count-in { background: none; box-shadow: none; padding: 10px 0 0; }
.pd-sec-day .pd-count-in .wk-eyebrow { color: #F3D88F; letter-spacing: .34em; }
.pd-sec-day .wk-flip-half { background: linear-gradient(180deg, #7A2235, #4E1220); border-color: rgba(233,196,106,.55); color: #F6E2A6; }
.pd-sec-day .wk-flip-down { box-shadow: 0 14px 26px -12px rgba(0,0,0,.6); }
.pd-sec-day .wk-flip, .pd-sec-day .wk-roll { color: #F6E2A6; text-shadow: 0 0 18px rgba(243,216,143,.35); }
.pd-sec-day .wk-cd-label { color: #F3E3C0; }
.pd-sec-day .wk-cd-sep { color: #E9C46A; }
.pd-sec-day .wk-countdown-done { color: #F6E2A6; }
.pd-sec-day .pd-count-lan img { filter: drop-shadow(0 0 14px rgba(255,200,110,.55)); }
.pd-sec-day .pd-havan { margin-bottom: 10px; }

/* our story: chapters on cards of warm paper, the year on a maroon ribbon */
.pd-ch-text { position: relative; padding: clamp(18px, 3vw, 26px) clamp(18px, 3vw, 28px); border-radius: 20px; background: radial-gradient(120% 80% at 0% 0%, #FFFDF6, var(--wk-surface-solid) 70%); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 50%, transparent), 0 24px 44px -32px rgba(90,60,20,.55); transition: transform .45s var(--pd-ease); }
@media (hover: hover) { .pd-ch-text:hover { transform: translateY(-4px); } }
.pd-ch-when { display: inline-block; padding: 7px 14px 6px; border-radius: 999px; color: #F6E2A6; background: linear-gradient(110deg, #8A2B3E, #5E1727); box-shadow: 0 6px 14px -8px rgba(94,23,39,.8); letter-spacing: .2em; }
.pd-ch-title { margin-top: 12px; }
.pd-ch-win { border: 8px solid #FFFDF6; box-shadow: 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), 0 26px 46px -26px rgba(80,50,10,.6); rotate: -2deg; transition: rotate .6s var(--pd-ease), transform .6s var(--pd-ease); }
.pd-ch.is-alt .pd-ch-win { rotate: 2deg; }
@media (hover: hover) { .pd-ch-win:hover { rotate: 0deg; transform: scale(1.02); } }
.pd-story-rail { width: 4px; }
.pd-ch-dot { width: 30px; height: 30px; box-shadow: inset 0 0 0 2px var(--wk-gold), 0 0 0 4px color-mix(in srgb, var(--wk-surface-solid) 85%, transparent), 0 6px 14px -4px rgba(180,110,20,.6); }
@media (max-width: 859px) { .pd-ch-dot { left: 9px; } }

/* the venue: an arched card between the pillars, lanterns glowing above */
.pd-venue { position: relative; }
.pd-venue-card .wk-card { border-radius: 999px 999px 24px 24px / 170px 170px 24px 24px; padding-top: clamp(56px, 9vw, 80px); background: radial-gradient(80% 50% at 50% 0%, rgba(255,232,180,.55), rgba(255,232,180,0) 70%), var(--wk-surface-solid); }
.pd-venue-card .wk-venue-map { position: relative; background: url(/wedding-v3/palace-door/lattice-tile.webp) center / 140px repeat, linear-gradient(135deg, #F7E9CB, #EEDAB0); border-color: color-mix(in srgb, var(--wk-gold) 55%, transparent); }
.pd-venue-card .wk-venue-mapBtn { display: grid; place-items: center; align-content: center; gap: 14px; background: radial-gradient(closest-side, rgba(255,250,236,.92), rgba(255,250,236,.55) 60%, rgba(255,250,236,0)); color: #5E1727; font-size: 15px; }
.pd-venue-card .wk-venue-mapBtn::before { content: ""; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; rotate: -45deg; background: radial-gradient(circle at 50% 50%, #FFF6E0 0 28%, #8A2B3E 30%); box-shadow: 0 10px 14px -6px rgba(94,23,39,.6); animation: pd-pin 1.8s ease-in-out infinite; }
@keyframes pd-pin { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
.pd-venue-card .wk-btn { background: linear-gradient(110deg, #8A2B3E, #5E1727); color: #F6E2A6; box-shadow: 0 14px 26px -14px rgba(94,23,39,.8); }
.pd-venue-lan { position: absolute; top: -40px; width: clamp(70px, 14vw, 120px); transform-origin: 50% 0; pointer-events: none; animation: pd-sway 5.4s ease-in-out infinite; z-index: 2; }
.pd-venue-lan img { display: block; width: 100%; height: auto; }
.pd-venue-lan.is-l { left: 0; }
.pd-venue-lan.is-r { right: 0; animation-delay: -2.7s; }
.pd-venue-lan.is-r img { transform: scaleX(-1); }
@media (max-width: 899px) { .pd-venue-lan { top: -70px; width: 64px; } .pd-venue-lan.is-l { left: -6px; } .pd-venue-lan.is-r { right: -6px; } }

/* gallery: a compact block, not a wall of giant photos */
.pd-gallery { max-width: 820px; }
@media (min-width: 1024px) { .pd-gallery { max-width: 860px; } }
@media (max-width: 699px) { .pd-gallery { max-width: 420px; } }
@media (min-width: 700px) and (max-width: 1023px) { .pd-gallery { max-width: 600px; } }

/* for our guests: cards with a gold-to-maroon edge that lights on hover */
.pd-know-i { position: relative; overflow: hidden; padding: 20px 20px 20px 26px; background: radial-gradient(120% 90% at 0% 0%, #FFFDF6, var(--wk-surface-solid) 70%); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 45%, transparent), 0 20px 36px -30px rgba(90,60,20,.5); transition: transform .4s var(--pd-ease), box-shadow .4s ease; }
.pd-know-i::after { content: ""; position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 0 3px 3px 0; background: linear-gradient(180deg, #E9C46A, #8A2B3E); }
@media (hover: hover) { .pd-know-i:hover { transform: translateY(-4px); box-shadow: inset 0 0 0 1px var(--wk-gold), 0 26px 40px -26px rgba(90,60,20,.55); } }
.pd-know-h { color: #7A2235; }
.pd-contact { background: radial-gradient(120% 90% at 0% 0%, #FFFDF6, var(--wk-surface-solid) 70%); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent), 0 18px 32px -28px rgba(90,60,20,.5); }
.pd-info-h { font-family: var(--wk-font-script); font-size: clamp(30px, 7vw, 40px); color: var(--wk-gold-ink); }

/* rsvp: a palace card with a maroon-and-gold reply */
.pd-sec-rsvp .wk-rsvp { position: relative; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), inset 0 0 0 7px var(--wk-surface-solid), inset 0 0 0 8px color-mix(in srgb, var(--wk-gold) 30%, transparent), 0 34px 60px -40px rgba(90,60,20,.6); }
.pd-sec-rsvp .wk-chip { background: #FFFDF6; border-color: color-mix(in srgb, var(--wk-gold) 55%, transparent); }
.pd-sec-rsvp .wk-chip.is-on { background: linear-gradient(110deg, #8A2B3E, #5E1727); color: #F6E2A6; border-color: #5E1727; }
.pd-sec-rsvp .wk-seg-o.is-on { box-shadow: 0 0 0 1px var(--wk-gold), 0 12px 24px -14px rgba(94,23,39,.45); }
.pd-sec-rsvp .wk-btn-lg { background: linear-gradient(110deg, #8A2B3E, #6A1C2C 50%, #8A2B3E); background-size: 200% 100%; color: #F6E2A6; letter-spacing: .04em; box-shadow: 0 16px 30px -16px rgba(94,23,39,.85), inset 0 1px 0 rgba(255,220,180,.35); animation: pd-sheen 5s linear infinite; }
.pd-sec-rsvp .wk-input { background: #FFFBF0; }

/* the finale: the door closes in front of warm light */
.pd-finale { isolation: isolate; }
.pd-finale::before { content: ""; position: absolute; inset: 0; z-index: -2; background: url(/wedding-v3/palace-door/lattice-tile.webp) 50% 0 / clamp(150px, 14vw, 220px) repeat; opacity: .2; pointer-events: none; }

/* off screen (.pd-off, set by an IntersectionObserver): every loop pauses */
.pd-off, .pd-off *, .pd-off::before, .pd-off::after, .pd-off *::before, .pd-off *::after { animation-play-state: paused !important; }
/* the turning mandala behind the couple gets its own compositor layer, so turning never repaints */
.pd-arch-mandala { will-change: transform; }
/* low-end phones and reduced motion: the ambience stands still */
.pd-root.is-lite .pd-ambient { display: none; }
@media (prefers-reduced-motion: reduce) { .pd-ambient { display: none; } }

/* ══ VENUE, GALLERY, RSVP, BLESSINGS, FINALE: wide and dressed ══════════ */
/* the venue: one wide arched card, the details and the map side by side at the same height,
   full-height pillars at its sides with a lantern hanging over each */
@media (min-width: 900px) {
  .pd-sec-venue.wk-w-normal { max-width: 1440px; }
  .pd-venue { grid-template-columns: clamp(86px, 8vw, 124px) minmax(0, 1080px) clamp(86px, 8vw, 124px); align-items: stretch; }
  .pd-venue-pillar { height: 100%; max-height: none; object-fit: fill; align-self: stretch; }
  .pd-venue-card .wk-card { border-radius: 50% 50% 24px 24px / 110px 110px 24px 24px; padding: clamp(64px, 6vw, 84px) clamp(32px, 4vw, 56px) clamp(32px, 3.4vw, 44px); }
  .pd-venue-card .wk-venue { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); column-gap: clamp(28px, 4vw, 56px); align-content: center; max-width: none; }
  .pd-venue-card .wk-venue > * { grid-column: 1; }
  .pd-venue-card .wk-venue-map { grid-column: 2; grid-row: 1 / span 6; align-self: stretch; aspect-ratio: auto; min-height: 300px; margin: 0; }
  .pd-venue-card .wk-venue-name { font-size: clamp(30px, 3vw, 40px); }
  .pd-venue-card .wk-venue .wk-btn { justify-self: center; }
  .pd-venue-lan { top: -30px; width: clamp(86px, 8vw, 124px); }
}

/* gallery: wider again on bigger screens */
@media (min-width: 1024px) { .pd-gallery { max-width: 1120px; } }
@media (min-width: 700px) and (max-width: 1023px) { .pd-gallery { max-width: 760px; } }

/* rsvp: the sacred fire beside the form (as the royal invitation's arch beside its form) */
.pd-rsvp { display: grid; gap: 22px; max-width: 640px; margin: 0 auto; }
.pd-rsvp-art { display: grid; justify-items: center; gap: 10px; text-align: center; }
.pd-agni { position: relative; display: block; width: min(76%, 280px); aspect-ratio: 4 / 4.7; border-radius: 999px 999px 26px 26px; overflow: hidden; isolation: isolate; }
.pd-agni-glow { position: absolute; left: 50%; top: 52%; width: 62%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,214,120,.7), rgba(255,180,80,.25) 45%, rgba(255,160,60,0) 75%); animation: pd-fire 1.6s ease-in-out infinite alternate; }
.pd-agni-havan { position: absolute; left: 50%; bottom: 13%; width: 64%; height: auto; translate: -50% 0; }
.pd-agni-sparks { position: absolute; left: 22%; right: 22%; top: 8%; bottom: 44%; }
.pd-agni-sparks i { position: absolute; bottom: 0; width: 4px; height: 4px; border-radius: 50%; background: #F6A92E; box-shadow: 0 0 8px 2px rgba(255,170,50,.75); opacity: 0; animation: pd-spark-up 4.4s linear infinite; }
@keyframes pd-spark-up { 0% { translate: 0 0; opacity: 0; } 15% { opacity: 1; } 100% { translate: var(--dx) -260%; opacity: 0; } }
.pd-agni-sill { position: absolute; left: 12%; right: 12%; bottom: 2.5%; display: flex; justify-content: space-between; align-items: flex-end; }
.pd-agni-diya { width: clamp(28px, 4vw, 40px); height: auto; aspect-ratio: 1; overflow: visible; }
.pd-rsvp-names { margin: 6px 0 0; font: 600 12.5px/1.4 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
.pd-rsvp-form { min-width: 0; }
.pd-sec-rsvp .pd-upasthiti { margin-bottom: 22px; }
@media (min-width: 960px) {
  .pd-rsvp { max-width: 1160px; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); align-items: center; gap: clamp(36px, 5vw, 72px); }
  .pd-rsvp-art { position: sticky; top: 90px; }
  .pd-agni { width: min(100%, 400px); }
  .pd-sec-rsvp .wk-rsvp { max-width: none; padding: clamp(30px, 3vw, 44px) clamp(28px, 3.4vw, 52px); }
}

/* blessings: the form as a framed palace card, the notes in gold and maroon */
.pd-sec-bless .wk-bless-form, .pd-sec-bless .wk-bless > .wk-card { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), inset 0 0 0 7px var(--wk-surface-solid), inset 0 0 0 8px color-mix(in srgb, var(--wk-gold) 30%, transparent), 0 30px 56px -40px rgba(90,60,20,.6); }
.pd-sec-bless .wk-btn { background: linear-gradient(110deg, #8A2B3E, #5E1727); color: #F6E2A6; box-shadow: 0 14px 26px -14px rgba(94,23,39,.8); }
.pd-sec-bless .wk-input { background: #FFFBF0; }
.pd-sec-bless .wk-note { background: radial-gradient(120% 90% at 0% 0%, #FFFDF6, var(--wk-surface-solid) 70%); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent), 0 22px 36px -28px rgba(90,60,20,.55); border-top: 3px solid #C9974F; }
.pd-sec-bless .wk-note-q { color: #8A2B3E; }
.pd-sec-bless .wk-note-by { color: #7A2235; }

@media (min-width: 1024px) {
  .pd-sec-bless .wk-bless { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); align-items: start; gap: clamp(32px, 4vw, 56px); }
  .pd-sec-bless .wk-bless-form { max-width: none; position: sticky; top: 90px; }
  .pd-sec-bless .wk-notes { columns: 2 220px; }
}

/* the finale: the hands tied with the mauli thread, in a gold palace arch */
.pd-finale { padding-top: clamp(56px, 7vw, 90px); }
.pd-knot { position: relative; width: min(92vw, 640px); margin: 0 auto 26px; padding-top: 40px; }
.pd-knot-glow { position: absolute; left: -16%; right: -16%; top: 4%; bottom: -10%; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,214,140,.6), rgba(255,214,140,0)); opacity: 0; transition: opacity 1.6s ease .3s; pointer-events: none; }
.pd-knot-arch { position: relative; padding: 9px; border-radius: 50% 50% 26px 26px / 34% 34% 26px 26px; background: linear-gradient(135deg, #F3DDA8, #C9974F 35%, #F6E2A6 60%, #A9743F); box-shadow: 0 0 0 5px #FFFBF0, 0 0 0 6px color-mix(in srgb, var(--wk-gold) 45%, transparent), 0 40px 70px -40px rgba(90,50,10,.65); }
.pd-knot-win { position: relative; display: block; aspect-ratio: 1600 / 1248; border-radius: 50% 50% 18px 18px / 34% 34% 18px 18px; overflow: hidden; background: radial-gradient(80% 70% at 50% 45%, #FFF8E8, #F4E3BF); clip-path: circle(0% at 50% 50%); transition: clip-path 1.6s cubic-bezier(.65,0,.25,1); }
.pd-knot-win img { display: block; width: 100%; height: 100%; object-fit: cover; transform: scale(1.14); transition: transform 2.4s var(--pd-ease) .2s; }
.pd-knot-medal { position: absolute; left: 50%; top: -6px; width: clamp(96px, 15vw, 128px); aspect-ratio: 777 / 800; translate: -50% 0; z-index: 2; container-type: inline-size; opacity: 0; transform: scale(.5); transition: transform .9s cubic-bezier(.34,1.5,.64,1) 1.2s, opacity .5s ease 1.2s; }
.pd-knot-medal img { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 4px 8px rgba(90,50,10,.4)); }
.pd-knot-medal::before { content: ""; position: absolute; left: 14%; top: 14%; width: 72%; height: 70%; border-radius: 50%; background: radial-gradient(circle at 50% 38%, #FFFDF6 0%, #FBEFD2 60%, #EBD39E 100%); box-shadow: inset 0 0 0 1.5px rgba(184,138,53,.65), inset 0 -8px 16px rgba(184,138,53,.22), 0 0 0 4px rgba(255,251,240,.9), 0 10px 22px -8px rgba(110,70,10,.5); }
.pd-knot-medal::after { content: ""; position: absolute; inset: -18%; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,222,150,.6), rgba(255,222,150,0)); }
.pd-close-ini { position: absolute; inset: 14% 14% 16%; display: flex; align-items: center; justify-content: center; gap: 3.5cqw; padding-bottom: 2cqw; font: 400 21cqw/1 var(--wk-font-script); color: #7A4A14; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
.pd-close-ini i { font: normal 600 7.5cqw/1 var(--wk-font-caps); color: #B88A35; translate: 0 -.15em; }
.pd-knot-sill { position: absolute; left: 10%; right: 10%; bottom: -16px; z-index: 2; display: flex; justify-content: space-between; align-items: flex-end; pointer-events: none; }
.pd-knot-diya { width: clamp(30px, 5vw, 44px); height: auto; aspect-ratio: 1; overflow: visible; opacity: 0; transform: translateY(8px) scale(.6); transition: transform .7s cubic-bezier(.34,1.5,.64,1), opacity .5s ease; transition-delay: calc(1.3s + var(--i, 0) * .16s); }
.pd-close-petals { position: absolute; inset: -40px -30vw 0; pointer-events: none; }
.pd-knot.is-on .pd-knot-glow { opacity: 1; }
.pd-knot.is-on .pd-knot-win { clip-path: circle(80% at 50% 50%); }
.pd-knot.is-on .pd-knot-win img { transform: none; }
.pd-knot.is-on .pd-knot-medal { opacity: 1; transform: none; }
.pd-knot.is-on .pd-knot-diya { opacity: 1; transform: none; }
@media (max-width: 699px) {
  .pd-agni { width: min(70%, 240px); }
  .pd-knot { padding-top: 34px; }
}

/* ── low-end phones: no ambient loops ─────────────────────────────────── */
.pd-root.is-lite .pd-ev-couple, .pd-root.is-lite .pd-door-motes, .pd-root.is-lite .pd-court-lan img, .pd-root.is-lite .pd-arch-mandala, .pd-root.is-lite .pd-agni-glow, .pd-root.is-lite .pd-agni-sparks i { animation: none !important; }

@media (prefers-reduced-motion: reduce) {
  .pd-root *, .pd-root *::before, .pd-root *::after { animation-duration: .001s !important; animation-iteration-count: 1 !important; transition-duration: .001s !important; transition-delay: 0s !important; }
  .pd-arch-mandala { opacity: .42 !important; }
  .pd-court-text > *, .pd-court-flowers, .pd-portrait-ring, .pd-portrait-frame, .pd-court-ivy img, .pd-court-lan img, .pd-court-rail, .pd-arch-glow, .pd-arch-lotus, .pd-arch-diya, .pd-scroll-paper, .pd-scroll-l, .pd-havan { opacity: 1 !important; }
}
`;
