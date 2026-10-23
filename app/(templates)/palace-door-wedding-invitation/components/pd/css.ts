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
.pd-gate { position: fixed; inset: 0; z-index: 60; overflow: hidden; transition: opacity .9s ease; }
.pd-gate-wall { position: absolute; inset: 0; background:
  radial-gradient(70% 55% at 50% 42%, rgba(255,247,222,.9) 0%, rgba(255,247,222,0) 70%),
  radial-gradient(130% 90% at 50% 50%, #F2E6C4 0%, #E7D7AC 60%, #D6C08E 100%); transition: opacity 1s ease .2s; }
.pd-gate-wall::after { content: ""; position: absolute; inset: 0; opacity: .35; background-image: radial-gradient(rgba(120,90,40,.18) 1px, transparent 1.2px), radial-gradient(rgba(255,255,255,.4) 1px, transparent 1.3px); background-size: 7px 7px, 11px 11px; background-position: 0 0, 3px 5px; }
.pd-gate-cam { position: absolute; inset: 0; transform-origin: 50% 56%; transition: transform 1.25s cubic-bezier(.6,0,.25,1), opacity 1s ease .2s; }
.pd-door { position: absolute; top: 0; left: 50%; height: 100dvh; aspect-ratio: 1013 / 1800; transform: translateX(-50%); transition: opacity 1s ease, transform 1.3s var(--pd-ease); }
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
.pd-door-invoke { position: absolute; top: 11.4%; left: 0; right: 0; margin: 0; text-align: center; font: 600 clamp(12px, 1.75dvh, 16px)/1 var(--wk-font-deva); letter-spacing: .04em; color: #F7E2A8; text-shadow: 0 1px 6px rgba(0,0,0,.75); z-index: 3; }
.pd-jhumka { position: absolute; top: -1.2%; width: 17%; transform-origin: 50% 0; z-index: 2; }
.pd-jhumka.is-l { left: max(3%, calc(50% - 50vw + 6px)); }
.pd-jhumka.is-r { right: max(3%, calc(50% - 50vw + 6px)); }
.pd-jhumka img { display: block; width: 100%; height: auto; filter: drop-shadow(0 8px 10px rgba(60,30,0,.35)); }
.pd-jhumka.is-r img { transform: scaleX(-1); }
.pd-door-copy { position: absolute; left: max(11%, calc(50% - 50vw + 14px)); right: max(11%, calc(50% - 50vw + 14px)); top: 17%; bottom: clamp(70px, 15dvh, 150px); display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 3; transition: opacity .5s ease, transform .6s var(--pd-ease); }
.pd-door-dear { margin: 0 0 1.4dvh; padding: 6px 14px; border-radius: 14px; font: italic 500 clamp(15px, 2.3dvh, 21px)/1.25 var(--wk-font-display); color: #FFF3D6; background: radial-gradient(closest-side, rgba(28,10,3,.62), rgba(28,10,3,0)); text-shadow: 0 1px 8px rgba(0,0,0,.6); }
.pd-door-dear span:first-child { font-style: normal; font-weight: 600; color: var(--pd-wood-gold); }
.pd-medal { position: relative; display: block; width: 58%; max-width: 260px; aspect-ratio: 777 / 800; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 50%; container-type: inline-size; -webkit-tap-highlight-color: transparent; }
.pd-medal-ring { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 6px 14px rgba(0,0,0,.45)); }
.pd-medal-disc { position: absolute; left: 15%; top: 15%; width: 70%; height: 68%; border-radius: 50%; background: radial-gradient(circle at 50% 40%, #FFFBF0 0%, #FBEFD2 62%, #EBD39E 100%); box-shadow: inset 0 0 0 1px rgba(184,138,53,.6), inset 0 -10px 20px rgba(184,138,53,.25), 0 0 30px 6px rgba(255,226,150,.25); }
.pd-medal-ini { position: absolute; inset: 15% 15% 17%; display: flex; align-items: center; justify-content: center; gap: 1cqw; font-family: var(--wk-font-script); color: #8A5A1C; }
.pd-medal-ini b { font-weight: 400; font-size: 30cqw; line-height: 1; }
.pd-medal-ini i { font-style: normal; font-family: var(--wk-font-caps); font-size: 8cqw; color: #B88A35; transform: translateY(-.2em); }
.pd-door-names { margin: 1.6dvh 0 0; display: flex; flex-direction: column; align-items: center; gap: .6dvh; padding: 10px 18px 12px; background: radial-gradient(closest-side, rgba(28,10,3,.66), rgba(28,10,3,.0)); }
.pd-door-eyebrow { font: 600 clamp(10px, 1.45dvh, 13px)/1 var(--wk-font-caps); letter-spacing: .32em; text-transform: uppercase; color: #F7E6B8; text-shadow: 0 1px 6px rgba(0,0,0,.7); }
.pd-door-couple { font: 400 clamp(32px, 5.4dvh, 54px)/1.05 var(--wk-font-script); color: var(--pd-wood-gold); text-shadow: 0 2px 12px rgba(0,0,0,.65), 0 0 22px rgba(255,210,120,.25); white-space: nowrap; }
.pd-door-couple i { font-style: normal; font-family: var(--wk-font-display); font-size: .55em; color: #F7E6B8; }
.pd-door-date { font: 600 clamp(11px, 1.6dvh, 14px)/1 var(--wk-font-caps); letter-spacing: .22em; color: #FFF3D6; text-shadow: 0 1px 6px rgba(0,0,0,.7); }
.pd-door-cta { position: relative; margin-top: auto; display: inline-flex; align-items: center; gap: 10px; min-height: 50px; padding: 0 24px; border: 0; border-radius: 999px; font: 700 15px/1 var(--wk-font-sans); color: #3A2414; cursor: pointer; background: linear-gradient(110deg, #F4DFA2, #FFF4D2 45%, #F0D48A 70%, #E2BC64); box-shadow: 0 14px 30px -12px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.7); -webkit-tap-highlight-color: transparent; }
.pd-door-cta:active { transform: scale(.97); }
.pd-door-cta-ring { position: absolute; inset: -5px; border-radius: inherit; border: 1.5px solid rgba(255,236,180,.9); animation: pd-ring 2.2s ease-out infinite; pointer-events: none; }
@keyframes pd-ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(1.22, 1.5); opacity: 0; } }
.pd-banana { position: absolute; bottom: -3%; width: clamp(128px, 33vw, 360px); z-index: 4; pointer-events: none; transition: transform 1.2s var(--pd-ease), opacity 1s ease; }
.pd-banana.is-l { left: -7%; transform-origin: 0 100%; }
.pd-banana.is-r { right: -7%; transform-origin: 100% 100%; }
.pd-banana img { display: block; width: 100%; height: auto; filter: drop-shadow(0 10px 18px rgba(30,40,10,.35)); }
.pd-banana.is-r img { transform: scaleX(-1); }
.pd-front { display: none; }
.pd-gate-petals { position: absolute; inset: 0; z-index: 5; pointer-events: none; }

/* entrance (after the door art has decoded) */
.pd-gate.is-loading .pd-door, .pd-gate.is-loading .pd-banana, .pd-gate.is-loading .pd-front { opacity: 0; }
.pd-gate.is-loading .pd-door { transform: translateX(-50%) scale(1.04); }
.pd-gate:not(.is-loading) .pd-jhumka { animation: pd-drop 1.1s var(--pd-ease) .25s both, pd-sway 4.6s ease-in-out 1.35s infinite; }
.pd-gate:not(.is-loading) .pd-jhumka.is-r { animation-delay: .4s, 1.6s; }
.pd-gate:not(.is-loading) .pd-medal { animation: pd-pop 1s cubic-bezier(.34,1.5,.64,1) .45s both; }
.pd-gate:not(.is-loading) .pd-door-names, .pd-gate:not(.is-loading) .pd-door-dear, .pd-gate:not(.is-loading) .pd-door-invoke { animation: pd-up .9s var(--pd-ease) .85s both; }
.pd-gate:not(.is-loading) .pd-door-cta { animation: pd-up .9s var(--pd-ease) 1.15s both; }
.pd-gate:not(.is-loading) .pd-banana.is-l { animation: pd-in-l 1.6s var(--pd-ease) .2s both; }
.pd-gate:not(.is-loading) .pd-banana.is-r { animation: pd-in-r 1.6s var(--pd-ease) .3s both; }
@keyframes pd-drop { from { transform: translateY(-70%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-sway { 0%, 100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
@keyframes pd-pop { from { transform: scale(.5); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-up { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-in-l { from { transform: translate3d(-55%, 12%, 0) rotate(-8deg); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-in-r { from { transform: translate3d(55%, 12%, 0) rotate(8deg); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pd-knock { 0% { transform: scale(1); } 30% { transform: scale(.93); } 55% { transform: scale(1.05); } 100% { transform: scale(1); } }

/* the knock, the swing, the push */
.pd-gate.is-knock .pd-medal { animation: pd-knock .42s ease both; }
.pd-gate.is-knock .pd-door-cta, .pd-gate.is-open .pd-door-cta, .pd-gate.is-push .pd-door-cta { opacity: 0; transform: translateY(10px); transition: opacity .3s, transform .3s; animation: none; }
.pd-gate.is-open .pd-door-copy, .pd-gate.is-push .pd-door-copy { opacity: 0; transform: scale(1.1); }
.pd-gate.is-open .pd-leaf.is-l, .pd-gate.is-push .pd-leaf.is-l { transform: rotateY(84deg); }
.pd-gate.is-open .pd-leaf.is-r, .pd-gate.is-push .pd-leaf.is-r { transform: rotateY(-84deg); }
.pd-gate.is-open .pd-leaf-shade, .pd-gate.is-push .pd-leaf-shade { opacity: 1; }
.pd-gate.is-open .pd-door-glow, .pd-gate.is-push .pd-door-glow { transform: translate(-50%,-50%) scale(1.25); opacity: 1; }
.pd-gate.is-open .pd-door-rays, .pd-gate.is-push .pd-door-rays { opacity: .85; animation: pd-spin 24s linear infinite; }
.pd-gate.is-open .pd-door-peek, .pd-gate.is-push .pd-door-peek { opacity: .9; transform: none; }
.pd-gate.is-open .pd-door-motes i, .pd-gate.is-push .pd-door-motes i { opacity: 1; }
.pd-gate.is-open .pd-jhumka, .pd-gate.is-push .pd-jhumka { animation: pd-sway-hard 1.6s ease-in-out infinite; }
.pd-gate.is-open .pd-jhumka.is-r, .pd-gate.is-push .pd-jhumka.is-r { animation-delay: -.5s; }
@keyframes pd-sway-hard { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
@keyframes pd-spin { from { transform: translate(-50%,-50%) rotate(0); } to { transform: translate(-50%,-50%) rotate(360deg); } }
.pd-gate.is-push { pointer-events: none; }
.pd-gate.is-push .pd-gate-cam { transform: scale(3); opacity: 0; }
.pd-gate.is-push .pd-gate-wall { opacity: 0; }
.pd-gate.is-push .pd-banana.is-l { transform: translate3d(-70%, 20%, 0); opacity: 0; animation: none; }
.pd-gate.is-push .pd-banana.is-r { transform: translate3d(70%, 20%, 0); opacity: 0; animation: none; }
.pd-gate.is-reduced, .pd-gate.is-reduced * { animation: none !important; transition: none !important; }
.pd-gate.is-reduced { transition: opacity .4s ease !important; }
.pd-gate.is-reduced.is-push { opacity: 0; }
.pd-gate.is-reduced.is-push .pd-gate-cam { transform: none; opacity: 1; }

/* desktop: the haveli front around the door */
@media (min-width: 760px) and (min-aspect-ratio: 4/5) {
  .pd-front { display: block; position: absolute; inset: 0; transition: opacity 1s ease; }
  .pd-front-pillar { position: absolute; bottom: 0; height: 88dvh; width: auto; opacity: .92; filter: sepia(.18) drop-shadow(12px 16px 20px rgba(90,60,20,.25)); }
  .pd-front-pillar.is-l { left: calc(50% - 28.15dvh - 5dvh - 21.1dvh); }
  .pd-front-pillar.is-r { left: calc(50% + 28.15dvh + 5dvh); }
  .pd-front-urn { display: none; }
  .pd-door-wall { -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 3.5%, #000 96.5%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 3.5%, #000 96.5%, transparent 100%); }
  .pd-gate:not(.is-loading) .pd-front-pillar { animation: pd-rise 1.2s var(--pd-ease) .1s both; }
  .pd-banana { width: clamp(220px, 22vw, 380px); }
  .pd-door-copy { bottom: 7%; }
  .pd-banana.is-l { left: -3%; }
  .pd-banana.is-r { right: -3%; }
}
@keyframes pd-rise { from { transform: translateY(18%); opacity: 0; } to { transform: none; opacity: 1; } }

/* ══ THE COURTYARD (hero) ═════════════════════════════════════════════════ */
.pd-court { --pd-sy: 0; position: relative; min-height: 100svh; display: flex; flex-direction: column; justify-content: center; padding: clamp(118px, 22vw, 150px) 16px clamp(112px, 26vw, 200px); isolation: isolate; overflow: clip; }
.pd-court-sky { position: absolute; inset: 0; z-index: -2; background: radial-gradient(80% 55% at 50% 22%, rgba(255,250,232,.95) 0%, rgba(255,246,222,.5) 45%, rgba(255,246,222,0) 75%), linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 70%, #FFF6E0) 0%, var(--wk-bg) 55%, color-mix(in srgb, var(--wk-bg2) 70%, #EAD7B0) 100%); }
.pd-court-far { position: absolute; inset: 0; z-index: -1; display: none; }
.pd-court-pillar { position: absolute; bottom: 4%; height: 92%; width: auto; opacity: .9; filter: drop-shadow(12px 14px 20px rgba(90,60,20,.18)); transform: translate3d(0, calc(var(--pd-sy) * -.06px), 0); }
.pd-court-pillar.is-l { left: 1.5%; }
.pd-court-pillar.is-r { right: 1.5%; }
.pd-court-ivy { position: absolute; top: 0; left: -4%; right: -4%; z-index: 1; pointer-events: none; transform: translate3d(0, calc(var(--pd-sy) * .22px), 0); }
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
.pd-hang { position: absolute; top: -6px; width: clamp(54px, 13vw, 92px); z-index: 2; transform-origin: 50% 0; pointer-events: none; animation: pd-sway 5s ease-in-out infinite; }
.pd-hang.is-l { left: 2%; }
.pd-hang.is-r { right: 2%; animation-delay: -2.4s; }
.pd-hang img { display: block; width: 100%; height: auto; filter: drop-shadow(0 6px 8px rgba(110,70,0,.25)); }
.pd-hang.is-r img { transform: scaleX(-1); }

.pd-invite-wrap { position: relative; padding-top: 28px; }
.pd-invite { position: relative; max-width: 720px; margin: 0 auto; padding: clamp(44px, 9vw, 72px) clamp(18px, 5vw, 56px) clamp(30px, 6vw, 48px); border-radius: clamp(16px, 2.4vw, 22px); background: radial-gradient(100% 70% at 50% 0%, #FFFCF4 0%, var(--wk-surface-solid) 60%), var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 60%, transparent), inset 0 0 0 7px var(--wk-surface-solid), inset 0 0 0 8px color-mix(in srgb, var(--wk-gold) 35%, transparent), 0 30px 60px -40px rgba(90,60,20,.55); }
.pd-invite-urn { display: none; }
@media (min-width: 1024px) {
  .pd-invite-urn { display: block; position: absolute; bottom: -6px; width: 150px; pointer-events: none; }
  .pd-invite-urn img { display: block; width: 100%; height: auto; filter: drop-shadow(0 12px 14px rgba(70,50,10,.22)); }
  .pd-invite-urn.is-l { left: calc(50% - 360px - 170px); }
  .pd-invite-urn.is-r { right: calc(50% - 360px - 170px); }
  .pd-invite-urn.is-r img { transform: scaleX(-1); }
  .pd-hang.is-l { left: calc(50% - 360px - 120px); }
  .pd-hang.is-r { right: calc(50% - 360px - 120px); }
  .pd-hang { width: 96px; }
}

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
.pd-ev-grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); }
/* Tablets two across, desktops three; a short last row sits centred, not flush left. */
@media (min-width: 700px) { .pd-ev-grid { display: flex; flex-wrap: wrap; justify-content: center; } .pd-ev-grid > .pd-ev { flex: 0 1 calc((100% - 22px) / 2); } }
@media (min-width: 1100px) { .pd-ev-grid.n-3 > .pd-ev { flex-basis: calc((100% - 44px) / 3); } }
.pd-ev { display: flex; }
.pd-ev-card { position: relative; flex: 1; display: flex; flex-direction: column; border-radius: clamp(16px, 2vw, 22px); background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wk-gold) 55%, transparent), 0 26px 50px -38px rgba(80,50,10,.6); overflow: hidden; transition: transform .35s var(--pd-ease); }
.pd-ev-card::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; box-shadow: 0 34px 60px -30px rgba(80,50,10,.5); opacity: 0; transition: opacity .35s ease; }
@media (hover: hover) { .pd-ev-card:hover { transform: translateY(-4px); } .pd-ev-card:hover::after { opacity: 1; } }
.pd-ev-alcove { position: relative; height: clamp(250px, 64vw, 300px); display: flex; align-items: flex-end; justify-content: center; background: radial-gradient(70% 60% at 50% 78%, rgba(255,226,160,.9) 0%, rgba(255,236,200,.35) 55%, rgba(255,236,200,0) 80%), linear-gradient(180deg, color-mix(in srgb, var(--wk-bg) 60%, #FFF6E2), color-mix(in srgb, var(--wk-bg2) 70%, #F2DFBA)); }
.pd-ev-glow { position: absolute; left: 50%; top: 30%; width: 70%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%,-50%); background: radial-gradient(closest-side, rgba(255,255,255,.85), rgba(255,255,255,0)); }
.pd-ev-carpet { position: absolute; left: 8%; bottom: 10px; width: 84%; height: auto; opacity: .95; }
.pd-ev-couple { position: relative; height: 84%; width: auto; max-width: 92%; object-fit: contain; object-position: bottom; margin-bottom: 22px; transform-origin: 50% 100%; animation: pd-breathe 6s ease-in-out infinite; filter: drop-shadow(0 12px 12px rgba(80,40,10,.25)); }
@keyframes pd-breathe { 0%, 100% { transform: rotate(-.8deg); } 50% { transform: rotate(.8deg) translateY(-2px); } }
.pd-ev-no { position: absolute; top: 38%; left: 7%; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.pd-ev-body { display: grid; gap: 8px; padding: 18px 20px 22px; }
.pd-ev-date { margin: 0; }
/* Hindi dates: letter-spacing tears Devanagari conjuncts and the shirorekha apart. */
.pd-root.is-hi .pd-ev-date, .pd-root.is-hi .wk-cd-label { letter-spacing: .02em; }
.pd-ev-title { margin: 0; font: 600 clamp(26px, 6.6vw, 32px)/1.1 var(--wk-font-display); color: var(--wk-ink); }
.pd-ev-line { margin: 0; display: flex; gap: 9px; align-items: flex-start; font: 400 15px/1.45 var(--wk-font-sans); color: var(--wk-ink); }
.pd-ev-line svg { flex: none; margin-top: 2px; color: var(--wk-gold-ink); }
.pd-ev-line b { display: block; font-weight: 600; }
.pd-ev-addr { display: block; color: var(--wk-muted); font-size: 14px; }
.pd-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; box-shadow: 0 0 0 2px var(--wk-surface-solid), 0 0 0 3px color-mix(in srgb, var(--wk-gold) 70%, transparent); }
.pd-ev-k { font-weight: 600; color: var(--wk-gold-ink); }
.pd-ev-note { margin: 2px 0 0; font: italic 400 16px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.pd-ev-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
/* Directions + one calendar pill (.ics | Google): one row in a desktop card, two tidy rows on a phone. */
.pd-ev-actions .pd-btn { padding: 0 13px; gap: 6px; font-size: 13px; }
.pd-ev-cal { display: inline-flex; border-radius: 999px; box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--wk-gold) 55%, transparent); background: var(--wk-surface-solid); }
.pd-ev-cal > .pd-btn { box-shadow: none; background: none; }
.pd-ev-cal > .pd-btn + .pd-btn { position: relative; padding-left: 12px; }
.pd-ev-cal > .pd-btn + .pd-btn::before { content: ""; position: absolute; left: 0; top: 11px; bottom: 11px; width: 1.5px; background: color-mix(in srgb, var(--wk-gold) 45%, transparent); }
.pd-ev-cal > .pd-btn:hover { color: var(--wk-gold-ink); }
.pd-ev-all { display: flex; justify-content: center; margin-top: 26px; }

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
.pd-close { position: relative; width: clamp(170px, 44vw, 250px); margin-bottom: 10px; }
@media (min-width: 1024px) { .pd-close { width: clamp(250px, 21vw, 320px); } }
.pd-close-door { position: relative; aspect-ratio: 1013 / 1800; border-radius: 6px; overflow: hidden; box-shadow: 0 30px 50px -30px rgba(70,40,10,.6); }
.pd-close .pd-door-glow { opacity: 1; transform: translate(-50%,-50%) scale(1.2); }
.pd-close .pd-leaf { transition-duration: 1.7s; transition-timing-function: cubic-bezier(.5,0,.2,1); }
.pd-close .pd-leaf.is-l { transform: rotateY(78deg); }
.pd-close .pd-leaf.is-r { transform: rotateY(-78deg); }
.pd-close.is-closed .pd-leaf { transform: none; }
.pd-close-medal { position: absolute; left: 50%; top: 47%; width: 54%; aspect-ratio: 777 / 800; transform: translate(-50%,-50%) scale(.6); opacity: 0; transition: transform 1s cubic-bezier(.34,1.5,.64,1) 1.5s, opacity .6s ease 1.5s; container-type: inline-size; }
.pd-close-medal img { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 4px 8px rgba(0,0,0,.45)); }
.pd-close-medal::before { content: ""; position: absolute; left: 15%; top: 15%; width: 70%; height: 68%; border-radius: 50%; background: radial-gradient(circle at 50% 40%, #FFFBF0, #F3DEAE); }
.pd-close-ini { position: absolute; inset: 15% 15% 17%; display: flex; align-items: center; justify-content: center; gap: 2cqw; font: 400 26cqw/1 var(--wk-font-script); color: #8A5A1C; }
.pd-close-ini i { font: normal 8cqw/1 var(--wk-font-caps); color: #B88A35; }
.pd-close.is-closed .pd-close-medal { transform: translate(-50%,-50%); opacity: 1; }
.pd-close-petals { position: absolute; inset: -40px -30vw 0; pointer-events: none; }
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
.pd-hands { width: calc(100% + 32px); max-width: 860px; margin: 36px -16px 0; line-height: 0; -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 9%, #000 91%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 9%, #000 91%, transparent 100%); }
@media (min-width: 700px) { .pd-hands { width: 100%; max-width: 680px; margin: 44px 0 0; } }
.pd-hands img { display: block; width: 100%; height: auto; }
@supports (animation-timeline: view()) {
  .pd-hands img { animation: pd-hands linear both; animation-timeline: view(); animation-range: entry 0% cover 45%; }
  @keyframes pd-hands { from { transform: translateY(16%); opacity: .3; } to { transform: none; opacity: 1; } }
}

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

/* ── low-end phones: no ambient loops ─────────────────────────────────── */
.pd-root.is-lite .pd-ev-couple, .pd-root.is-lite .pd-hang, .pd-root.is-lite .pd-door-motes, .pd-root.is-lite .pd-court-lan img { animation: none !important; }

@media (prefers-reduced-motion: reduce) {
  .pd-root *, .pd-root *::before, .pd-root *::after { animation-duration: .001s !important; animation-iteration-count: 1 !important; transition-duration: .001s !important; transition-delay: 0s !important; }
  .pd-court-text > *, .pd-court-flowers, .pd-portrait-ring, .pd-portrait-frame, .pd-court-ivy img, .pd-court-lan img, .pd-court-rail, .pd-scroll-paper, .pd-scroll-l, .pd-havan { opacity: 1 !important; }
}
`;
