// "The Glasshouse Rose" — one stylesheet (prefix gh-). Transforms + opacity for motion; filters only on static
// layers. Fixed layers: world (z0) · particles (z1) · garden canvas (z2) · scene (z4) · fog (z6).

export const SKIP_TOP = { top: "calc(var(--gh-bar, 0px) + 64px)" } as const;

export const GLASS_CSS = `
.gh-root { --gh-amber: #F4C27A; --gh-rose: #E8A0A8; --gh-teal: #2F4A45; --gh-iron: #1E2422; --gh-cream: #FBF3E6; position: relative; color: var(--gh-cream); }
.gh-serif { font-family: var(--gh-serif), 'Cormorant Garamond', Georgia, serif; }
.gh-world { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.gh-sky { position: absolute; inset: 0; background: linear-gradient(180deg, #E9B27A 0%, #D99A86 22%, #8E6E72 46%, #3E4D49 72%, #1E2A27 100%); }
.gh-sun { position: absolute; left: 50%; top: 18%; width: 90vmax; height: 90vmax; transform: translate(-50%, -50%); border-radius: 50%;
  background: radial-gradient(circle, rgba(255,226,170,.75) 0%, rgba(255,196,120,.35) 22%, rgba(255,170,120,0) 55%); }
.gh-inner { position: absolute; inset: 0; transform: scale(calc(1 + var(--dolly, 0) * .45)); transform-origin: 50% 55%; transition: transform 2.6s cubic-bezier(.45,0,.15,1); }
.gh-iron { position: absolute; inset: 0; width: 100%; height: 100%; }
.gh-ray { position: absolute; top: -20%; width: 30vw; height: 140%; transform-origin: top; mix-blend-mode: screen; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,230,180,.32), rgba(255,220,170,0) 75%); filter: blur(2px); animation: gh-ray 9s ease-in-out infinite; }
.gh-ray.is-a { left: 18%; transform: rotate(-24deg); }
.gh-ray.is-b { left: 42%; width: 16vw; transform: rotate(-20deg); animation-delay: -3s; opacity: .7; }
.gh-ray.is-c { left: 64%; width: 22vw; transform: rotate(-26deg); animation-delay: -6s; opacity: .55; }
@keyframes gh-ray { 0%, 100% { opacity: .45; } 50% { opacity: .9; } }
.gh-fern { position: absolute; top: -2%; width: 26vw; max-width: 220px; height: auto; opacity: .95; transform-origin: top center; animation: gh-sway 8s ease-in-out infinite; }
.gh-fern.is-l { left: -2%; } .gh-fern.is-r { right: -2%; transform: scaleX(-1); animation-name: gh-swayR; }
@keyframes gh-sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
@keyframes gh-swayR { 0%, 100% { transform: scaleX(-1) rotate(-2deg); } 50% { transform: scaleX(-1) rotate(2deg); } }
.gh-palm { position: absolute; bottom: 0; width: 34vw; max-width: 300px; height: 34vh; opacity: .92;
  background: radial-gradient(60% 40% at 50% 100%, #142019 0 60%, transparent 61%), radial-gradient(40% 60% at 30% 60%, #1C2E22 0 50%, transparent 51%), radial-gradient(40% 60% at 70% 55%, #1A2B20 0 50%, transparent 51%), radial-gradient(30% 50% at 50% 35%, #213628 0 50%, transparent 51%); }
.gh-palm.is-l { left: -6vw; } .gh-palm.is-r { right: -6vw; }
.gh-dusk { position: absolute; inset: 0; background: radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(10,14,12,.55) 100%), rgba(14,18,16,calc(var(--night, 0) * .55)); transition: background 2s; }

.gh-scene { position: relative; z-index: 4; min-height: calc(100dvh - var(--vw-dock-space, 0px)); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;
  padding: calc(var(--gh-bar, 0px) + 112px) 16px calc(var(--gh-bar, 0px) + 28px); text-align: center; }
.gh-kick { margin: 0; font: 700 11px/1.3 var(--vw-font-ui, system-ui), sans-serif; letter-spacing: .32em; text-transform: uppercase; color: var(--gh-amber); text-shadow: 0 1px 8px rgba(0,0,0,.5); }
.gh-h { margin: 0; font: 500 italic clamp(32px, 9vw, 58px)/1.05 var(--gh-serif), Georgia, serif; color: #FFF6EA; text-wrap: balance; text-shadow: 0 2px 24px rgba(30,20,10,.55); }
.gh-sub { margin: 0; font: 500 italic clamp(18px, 4.8vw, 22px)/1.4 var(--gh-serif), Georgia, serif; color: rgba(251,243,230,.9); max-width: 30ch; text-shadow: 0 1px 12px rgba(0,0,0,.5); }
.gh-hint { margin: 0; font: 600 13px/1.4 var(--vw-font-ui, system-ui), sans-serif; color: rgba(251,243,230,.75); text-shadow: 0 1px 6px rgba(0,0,0,.5); }
.gh-btn { min-height: 50px; padding: 0 26px; border: 0; border-radius: 99px; cursor: pointer; color: #2A1A10; font: 700 15px/1 var(--vw-font-ui, system-ui), sans-serif; letter-spacing: .02em;
  background: linear-gradient(135deg, #FFF0CF, #F4C27A 50%, #C98E44); box-shadow: 0 14px 30px -14px rgba(244,194,122,.9), inset 0 1px 0 rgba(255,255,255,.7); }
.gh-ghost { min-height: 44px; padding: 0 18px; border-radius: 99px; cursor: pointer; color: var(--gh-cream); background: rgba(251,243,230,.1); border: 1px solid rgba(251,243,230,.3);
  font: 600 13.5px/1 var(--vw-font-ui, system-ui), sans-serif; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.gh-root button:focus-visible { outline: 3px solid var(--gh-amber); outline-offset: 3px; }
.gh-in { animation: gh-in .9s cubic-bezier(.16,1,.3,1) both; }
@keyframes gh-in { from { opacity: 0; transform: translateY(12px); } }
.gh-fade { animation: gh-fade 1s ease both; }
@keyframes gh-fade { from { opacity: 0; } }
.gh-layer { position: relative; z-index: 4; }
.gh-sr { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
.gh-grain { position: fixed; inset: -50%; z-index: 5; pointer-events: none; opacity: .04; mix-blend-mode: overlay; animation: gh-grain .5s steps(5) infinite;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
@keyframes gh-grain { 0% { transform: translate(0,0); } 25% { transform: translate(-3%,2%); } 50% { transform: translate(2%,-3%); } 75% { transform: translate(-2%,-1%); } }

/* Gate + fog */
.gh-gateArt { position: relative; width: min(230px, 56vw); aspect-ratio: .78; border-radius: 120px 120px 10px 10px; overflow: hidden; border: 6px solid #1A201E;
  background: radial-gradient(80% 60% at 50% 30%, rgba(255,226,170,.9), rgba(217,154,134,.85) 45%, rgba(62,77,73,.95)); box-shadow: 0 30px 60px -20px #000, inset 0 0 0 2px rgba(244,194,122,.35); }
.gh-gateArt::before { content: ""; position: absolute; inset: 0; background: rgba(232,236,232,.78); -webkit-mask: radial-gradient(circle at 30% 30%, transparent 0 0, #000 1px); }
.gh-gateArt::after { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 5px; margin-left: -2px; background: #1A201E; box-shadow: 0 -60px 0 0 #1A201E; }
.gh-gateName { position: absolute; left: 0; right: 0; top: 34%; text-align: center; font: 400 clamp(30px, 9vw, 42px)/1 var(--vw-font-script), cursive; color: rgba(255,214,160,.95);
  text-shadow: 0 0 10px rgba(255,200,140,.8); transform: rotate(-6deg); z-index: 1; }
.gh-gateHandle { position: absolute; right: 16%; top: 54%; width: 10px; height: 34px; border-radius: 6px; background: linear-gradient(90deg, #8a6a3a, #E6C27A, #8a6a3a); z-index: 2; }
.gh-gateStk { position: absolute; left: -8px; bottom: -6px; z-index: 3; }
.gh-gate .pm-gateArt { aspect-ratio: auto !important; height: auto !important; max-height: none !important; width: auto !important; }
.gh-gate .pm-gateName { font-family: var(--gh-serif), Georgia, serif !important; font-style: italic; font-weight: 500 !important; }
.gh-fog { position: fixed; inset: 0; z-index: 6; width: 100%; height: 100%; touch-action: none; cursor: grab; transition: opacity 1.4s ease; }
.gh-fog.is-clear { opacity: 0; pointer-events: none; }
.gh-fogUi { position: fixed; left: 0; right: 0; bottom: calc(var(--vw-dock-space, 0px) + 9vh + 18px); z-index: 7; display: grid; justify-items: center; gap: 10px; pointer-events: none; transition: opacity .6s; }
.gh-fogUi > * { pointer-events: auto; }
.gh-fogUi.is-clear { opacity: 0; }
.gh-fogUi .gh-hint { color: #3A2A22; text-shadow: none; font-size: 14px; }

/* Bench + bud + thorns */
.gh-plant { position: relative; height: clamp(280px, calc(100dvh - var(--vw-dock-space, 0px) - 300px), 600px); aspect-ratio: 200 / 560; margin-top: 8px; }
.gh-plant.is-big { height: clamp(300px, calc(100dvh - var(--vw-dock-space, 0px) - 250px), 640px); }
.gh-pot { position: absolute; left: 50%; bottom: -6%; width: 64%; transform: translateX(-50%); }
.gh-thorn { cursor: grab; touch-action: none; }
.gh-thorn path { fill: #5B3A22; stroke: #3A2414; stroke-width: 1; }
.gh-thorn.is-gone { animation: gh-fall 1.1s cubic-bezier(.4,0,.8,.4) forwards; pointer-events: none; }
@keyframes gh-fall { to { transform: translate(var(--fx, 30px), 260px) rotate(var(--fr, 220deg)); opacity: 0; } }
.gh-thornHit { fill: transparent; stroke: none; }
.gh-thorn:focus-visible path { stroke: #F4C27A; stroke-width: 3; }
.gh-tag { position: absolute; width: 150%; font: 500 italic clamp(15px, 4vw, 18px)/1.25 var(--gh-serif), Georgia, serif; color: #FFF1DE; text-shadow: 0 1px 10px rgba(0,0,0,.7); transform: translateY(-60%); pointer-events: none; }
.gh-tag.is-l { right: 64%; text-align: right; max-width: 42vw; } .gh-tag.is-r { left: 64%; text-align: left; max-width: 42vw; }
.gh-tag b { display: block; font: 700 10px/1 var(--vw-font-ui), sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--gh-amber); margin-bottom: 3px; font-style: normal; }
.gh-tag.is-done span { color: #FFD98F; }
.gh-card { width: min(100%, 420px); box-sizing: border-box; padding: 14px 18px; border-radius: 16px; background: rgba(30,36,34,.55); border: 1px solid rgba(244,194,122,.3);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.gh-card p { margin: 0; }

/* Bloom + garden */
.gh-hero { position: relative; width: min(74vw, 340px, 46vh); aspect-ratio: 1; margin-top: 8px; touch-action: none; transition: transform 1.4s cubic-bezier(.45,0,.15,1), opacity .8s; }
.gh-hero.is-back { transform: scale(.3); }
.gh-hero .gh-ring { transition: transform 1.1s cubic-bezier(.3,1.25,.4,1); transform-origin: 0 0; }
.gh-heroGlow { pointer-events: none; position: absolute; inset: -18%; border-radius: 50%; background: radial-gradient(circle, rgba(var(--gl),.55), rgba(var(--gl),0) 62%); opacity: 0; transition: opacity 1.2s; }
.gh-hero.is-open .gh-heroGlow { opacity: 1; }
.gh-halo { pointer-events: none; position: absolute; inset: -12%; border-radius: 50%; border: 2px solid rgba(255,226,170,.55); box-shadow: 0 0 30px 6px rgba(255,226,170,.35), inset 0 0 30px 6px rgba(255,226,170,.25); animation: gh-halo 3s ease-in-out infinite; }
@keyframes gh-halo { 0%, 100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.05); opacity: .55; } }
.gh-holdRing { position: absolute; inset: 27%; pointer-events: none; }
.gh-holdRing circle { fill: none; stroke: rgba(255,226,170,.9); stroke-width: 2.4; stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset .1s linear; }
.gh-garden { position: fixed; inset: 0; z-index: 2; width: 100%; height: 100%; pointer-events: none; }

/* Petals */
.gh-petalStage { position: fixed; inset: 0; z-index: 5; overflow: hidden; touch-action: none; }
.gh-petal { position: absolute; left: 0; top: 0; width: 44px; height: 38px; will-change: transform; pointer-events: none; }
.gh-petal i { position: absolute; inset: 0; border-radius: 70% 70% 70% 70% / 90% 90% 40% 40%; background: radial-gradient(circle at 40% 30%, var(--pl), var(--pb) 70%); box-shadow: inset -3px -4px 8px rgba(0,0,0,.18); }
.gh-petal.is-word { width: auto; min-width: 70px; height: 48px; }
.gh-petal.is-word i { border-radius: 60% 60% 55% 55% / 80% 80% 45% 45%; }
.gh-petal span { position: relative; display: grid; place-items: center; height: 100%; padding: 0 16px; font: 600 italic 18px/1 var(--gh-serif), Georgia, serif; color: #FFF8EE; text-shadow: 0 1px 4px rgba(60,10,20,.8); white-space: nowrap; }
.gh-hands { position: absolute; left: 0; top: 0; width: 150px; height: 80px; will-change: transform; pointer-events: none; }
.gh-sentence { position: relative; z-index: 6; display: flex; flex-wrap: wrap; gap: 6px 10px; justify-content: center; max-width: 520px; min-height: 48px; }
.gh-sentence span { font: 500 italic clamp(22px, 6vw, 30px)/1.2 var(--gh-serif), Georgia, serif; color: rgba(251,243,230,.35); }
.gh-sentence span.is-on { color: #FFF3DE; text-shadow: 0 0 14px rgba(255,200,150,.7); animation: gh-in .5s both; }
.gh-sentence.is-done span { color: #FFE0A8; }

/* Book */
.gh-book { position: relative; width: min(100%, 860px); perspective: 2000px; }
.gh-spread { position: relative; display: grid; grid-template-columns: 1fr; border-radius: 6px; box-shadow: 0 40px 70px -30px #000; background: #6B2A2E; padding: 10px; }
@media (min-width: 900px) { .gh-spread { grid-template-columns: 1fr 1.25fr; } }
.gh-page { position: relative; padding: 26px 22px 30px; text-align: left; color: #3B2420; background: radial-gradient(120% 80% at 30% 20%, #FFF9EE, #F3E6CF 70%, #E6D2B2); min-height: 200px; }
.gh-page.is-l { display: grid; align-content: center; justify-items: center; gap: 10px; text-align: center; border-right: 1px solid rgba(0,0,0,.08); }
.gh-page.is-l .gh-pressed { width: min(150px, 40vw); opacity: .82; filter: saturate(.55) sepia(.25); transform: rotate(-18deg); }
.gh-page.is-l small { font: 600 italic 15px/1.3 var(--gh-serif), Georgia, serif; color: #7A5A48; }
@media (max-width: 899px) { .gh-page.is-l { min-height: 0; padding: 18px 16px 6px; grid-auto-flow: column; justify-content: start; text-align: left; border-right: 0; border-bottom: 1px dashed rgba(0,0,0,.12); }
  .gh-page.is-l .gh-pressed { width: 70px; } }
.gh-cover { position: absolute; inset: 0; z-index: 3; transform-origin: 0 50%; border-radius: 6px; background: linear-gradient(135deg, #7A2E33, #4E1A1E); box-shadow: inset 0 0 0 6px rgba(244,194,122,.35);
  display: grid; place-items: center; font: 500 italic 26px/1.2 var(--gh-serif), Georgia, serif; color: #F4C27A; backface-visibility: hidden; transition: transform 1.3s cubic-bezier(.5,0,.2,1); }
.gh-cover.is-open { transform: rotateY(-170deg); pointer-events: none; }
.gh-letter p { margin: 0 0 14px; font: 500 clamp(18px, 4.6vw, 20px)/1.6 var(--gh-serif), Georgia, serif; white-space: pre-wrap; user-select: text; -webkit-user-select: text; animation: gh-ink 1.4s ease both; }
@keyframes gh-ink { from { opacity: 0; transform: translateY(4px); } }
.gh-letter p:first-child::first-letter { float: left; font: 600 3.1em/.85 var(--gh-serif), Georgia, serif; color: #9C2B3A; margin: 4px 8px 0 0; }
.gh-letter .gh-sher { font: 400 21px/1.45 var(--vw-font-script), cursive; color: #8A2E44; }
.gh-letter .gh-sign { text-align: right; font: 400 30px/1.1 var(--vw-font-script), cursive; color: #3B2420; }

/* Dew drops */
.gh-macro { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
.gh-macro i { position: absolute; border-radius: 60% 60% 55% 55% / 75% 75% 40% 40%; background: radial-gradient(circle at 40% 30%, var(--pl), var(--pb) 75%); opacity: .34; filter: blur(7px); }
.gh-drops { position: relative; z-index: 4; width: min(100%, 760px); display: flex; flex-wrap: wrap; justify-content: center; gap: 18px 22px; margin-top: 18px; }
.gh-drop { all: unset; position: relative; width: var(--d, 120px); aspect-ratio: 1; border-radius: 50%; cursor: pointer; overflow: hidden; transform: translateY(var(--dy, 0px));
  box-shadow: 0 14px 30px -10px rgba(0,0,0,.55), inset 0 0 0 2px rgba(255,255,255,.35); animation: gh-bob 5s ease-in-out infinite; }
.gh-drop > span:first-child { position: absolute !important; inset: -8%; width: 116% !important; height: 116% !important; }
.gh-drop::before { content: ""; position: absolute; inset: 0; z-index: 2; border-radius: 50%; background: radial-gradient(circle at 32% 26%, rgba(255,255,255,.85) 0 7%, rgba(255,255,255,.18) 13%, transparent 30%), radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,.35) 100%); }
.gh-drop::after { content: ""; position: absolute; left: 22%; right: 22%; bottom: 8%; height: 10%; z-index: 2; border-radius: 50%; background: rgba(255,255,255,.35); filter: blur(2px); }
.gh-drop:focus-visible { outline: 3px solid var(--gh-amber); outline-offset: 4px; }
@keyframes gh-bob { 0%, 100% { transform: translateY(var(--dy, 0px)); } 50% { transform: translateY(calc(var(--dy, 0px) - 6px)); } }
.gh-lens { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 16px; background: rgba(12,16,14,.82); animation: gh-fade .35s both; }
.gh-lensIn { display: grid; justify-items: center; gap: 12px; width: min(100%, 420px); }
.gh-lensPhoto { position: relative; width: min(84vw, 380px, 56vh); aspect-ratio: 4/5; border-radius: 48% 48% 24px 24px / 38% 38% 24px 24px; overflow: hidden; box-shadow: 0 30px 60px -20px #000, inset 0 0 0 3px rgba(255,255,255,.4);
  animation: gh-lensZoom .7s cubic-bezier(.2,.9,.25,1.05) both; }
@keyframes gh-lensZoom { from { transform: scale(.25); border-radius: 50%; opacity: .6; } }
.gh-lensIn b { font: 500 italic 24px/1.2 var(--gh-serif), Georgia, serif; color: #FFF3DE; }
.gh-lensIn p { margin: 0; font: 500 16px/1.5 var(--vw-font-ui), sans-serif; color: rgba(251,243,230,.85); max-width: 34ch; }
.gh-secret { all: unset; position: fixed; right: max(16px, calc(50% - 360px)); bottom: calc(var(--vw-dock-space, 0px) + 18vh); z-index: 5; width: 44px; height: 70px; cursor: pointer; display: grid; place-items: end center; }
.gh-secret::before { content: ""; position: absolute; left: 50%; bottom: 0; width: 3px; height: 60px; margin-left: -1px; background: linear-gradient(#4F8248, #2C4F2A); border-radius: 2px; }
.gh-secret i { position: absolute; left: 50%; top: 14px; width: 11px; height: 13px; margin-left: -1px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: radial-gradient(circle at 35% 30%, #fff, rgba(200,230,255,.6) 50%, rgba(160,200,230,.3)); animation: gh-shimmer 6s ease-in-out infinite; }
@keyframes gh-shimmer { 0%, 88%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } 92% { box-shadow: 0 0 14px 6px rgba(255,255,255,.9); } }
.gh-secretTip { position: fixed; right: max(16px, calc(50% - 360px)); bottom: calc(var(--vw-dock-space, 0px) + 18vh + 80px); z-index: 6; max-width: 260px; padding: 12px 14px; border-radius: 16px 16px 4px 16px;
  background: rgba(255,250,242,.95); color: #3B2420; font: 500 italic 17px/1.4 var(--gh-serif), Georgia, serif; text-align: left; box-shadow: 0 16px 30px -12px #000; animation: gh-in .5s both; }

/* Eternal */
.gh-domeWrap { position: relative; width: min(78vw, 320px, 48vh); margin-top: 4px; cursor: pointer; }
.gh-cloche { transition: transform 1.2s cubic-bezier(.5,0,.25,1); }
.gh-glowOrb { animation: gh-pulse 0.833s ease-in-out infinite; transform-origin: 150px 190px; transform-box: view-box; transition: opacity .6s; opacity: .8; }
.gh-glowOrb.is-boost { opacity: 1; }
@keyframes gh-pulse { 0%, 100% { transform: scale(.94); } 50% { transform: scale(1.04); } }
.gh-engr { font: 600 15px/1 var(--gh-serif), Georgia, serif; fill: #F4D9A8; letter-spacing: .04em; }
.gh-engr.is-small { font-size: 11.5px; font-style: italic; fill: #E3C08A; }
.gh-floatPetal { position: absolute; left: 50%; top: 34%; width: 20px; height: 17px; border-radius: 70% 70% 70% 70% / 90% 90% 40% 40%; background: radial-gradient(circle at 40% 30%, var(--pl), var(--pb) 70%); pointer-events: none; animation: gh-floatUp 6s ease-in-out forwards; }
@keyframes gh-floatUp { 0% { transform: translate(0,0) rotate(0); opacity: 0; } 15% { opacity: 1; } 55% { transform: translate(40px, 70px) rotate(160deg); } 100% { transform: translate(-10px, -40px) rotate(360deg); opacity: 0; } }
.gh-endWrap { width: min(100%, 460px); display: grid; gap: 14px; justify-items: center; margin-top: 10px; }
.gh-endWrap .pm-vn, .gh-endWrap .pm-reply { background: rgba(30,36,34,.6) !important; border-color: rgba(244,194,122,.3) !important; color: var(--gh-cream) !important; }
.gh-endWrap .pm-replyH { font-family: var(--gh-serif), Georgia, serif !important; font-style: italic; font-weight: 500 !important; font-size: 22px !important; }
.gh-ps { width: min(100%, 440px); box-sizing: border-box; cursor: pointer; text-align: left; padding: 14px 16px 14px 46px; border-radius: 6px; border: 0; position: relative; color: #3B2420; white-space: pre-wrap;
  background: linear-gradient(160deg, #FFF6E6, #EEDCBE); font: 500 17px/1.5 var(--gh-serif), Georgia, serif; box-shadow: 0 16px 30px -18px #000; }
.gh-ps::before { content: ""; position: absolute; left: 16px; top: 0; bottom: 0; width: 12px; background: linear-gradient(90deg, #A8303E, #D4505E, #A8303E); }
.gh-ps b { display: block; margin-bottom: 4px; font: 700 10.5px/1.2 var(--vw-font-ui), sans-serif; letter-spacing: .24em; text-transform: uppercase; color: #9C2B3A; }

@media (min-width: 1024px) {
  .gh-scene { padding-top: calc(var(--gh-bar, 0px) + 80px); }
}
@media (prefers-reduced-motion: reduce) {
  .gh-ray, .gh-fern, .gh-grain, .gh-halo, .gh-drop, .gh-secret i, .gh-glowOrb { animation: none !important; }
  .gh-inner, .gh-hero, .gh-cloche, .gh-cover { transition-duration: .01s !important; }
  .gh-hero .gh-ring { transition: none !important; }
  .gh-thorn.is-gone { animation: gh-fade .3s reverse forwards; }
  .gh-letter p { animation: gh-fade .4s both; }
  .gh-lensPhoto { animation: gh-fade .3s both; }
}
`;
