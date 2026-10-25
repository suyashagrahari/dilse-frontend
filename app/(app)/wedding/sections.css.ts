// /wedding: the journey, the openings showcase and the world section.
// Phone first; the journey turns into a sticky scrollytelling stage at 768px
// and the openings into a five-across gallery at 1024px.


export const SECTIONS_CSS = `
/* ── journey ─────────────────────────────────────────────────────────── */
.whJourney { background: radial-gradient(55% 32% at 50% 38%, rgba(255,255,255,.7), transparent 70%), linear-gradient(180deg, var(--page), #fcefe6 18%, #fdf5ee 82%, var(--page)); }
.whJ { position: relative; }
.whJStageWrap { display: none; }
.whJList { list-style: none; display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: 16px; overscroll-behavior-x: contain;
  margin: 0 -16px; padding: 10px 16px 20px; scrollbar-width: none; }
.whJList::-webkit-scrollbar { display: none; }
.whJStep { --deep: #8e1a27; --tint: #fbe0df; --glow: #c9a84c; flex: 0 0 min(82vw, 360px); scroll-snap-align: start; scroll-snap-stop: always;
  display: flex; flex-direction: column; padding: 8px; border-radius: 30px; position: relative;
  background: linear-gradient(180deg, #fff 0%, var(--paper) 55%, color-mix(in srgb, var(--tint) 45%, var(--paper)) 100%);
  box-shadow: 0 34px 50px -38px color-mix(in srgb, var(--deep) 80%, transparent), 0 0 0 1px rgba(201,168,76,.34);
  transform: scale(.94); opacity: .7; transform-origin: 50% 55%; transition: transform .7s cubic-bezier(.2,.8,.2,1), opacity .6s ease; }
.whJStep.is-on { transform: none; opacity: 1; }
.whJCardArt { position: relative; border-radius: 23px; overflow: hidden; isolation: isolate; -webkit-mask-image: -webkit-radial-gradient(white, black); }
.whJCardArt::after { content: ""; position: absolute; inset: 9px; border-radius: 16px; z-index: 9; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,.8); }
.whJCardArt .whJScene { aspect-ratio: 1 / 1.04; }
.whJText { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 16px 10px 8px; flex: 1; }
.whJKick { display: flex; align-items: center; gap: 10px; margin: 0; font: 700 11px/1.25 var(--caps); letter-spacing: .18em; text-transform: uppercase; color: var(--deep); }
.whJNum { flex: none; display: inline-grid; place-items: center; min-width: 32px; height: 32px; padding: 0 6px; border-radius: 999px;
  font: 700 12px/1 var(--caps); letter-spacing: .04em; color: #fff; background: linear-gradient(135deg, var(--glow), var(--deep)); box-shadow: 0 8px 16px -10px var(--deep); }
.whJName { margin: 0; font: 700 26px/1.15 var(--serif); letter-spacing: -.01em; color: var(--maroon); text-wrap: balance; }
.whJLine { margin: 0; font-size: 15px; line-height: 1.58; color: var(--ink); text-wrap: pretty; }
.whJTip { margin: 2px 0 0; padding: 10px 12px; border-radius: 14px; font-size: 13.5px; line-height: 1.52; color: var(--muted);
  background: color-mix(in srgb, var(--tint) 55%, #fff); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--deep) 12%, transparent); }
.whJTip b { display: block; margin-bottom: 3px; font: 700 10.5px/1.3 var(--caps); letter-spacing: .18em; text-transform: uppercase; color: var(--deep); }
.whJGo { margin-top: auto; align-self: flex-start; display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 5px 5px 5px 16px; border-radius: 999px;
  font-weight: 750; font-size: 14.5px; line-height: 1.2; color: var(--deep); text-decoration: none; background: #fff;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--deep) 26%, transparent), 0 10px 20px -16px var(--deep); }
.whJGo i { flex: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, var(--glow), var(--deep)); transition: transform .3s ease; }
@media (hover: hover) { .whJGo:hover i { transform: translateX(3px); } }
.whJGo:focus-visible, .whJSegs button:focus-visible { outline: 2px solid var(--deep); outline-offset: 3px; }
.whJThread { display: none; }
.whJNav { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 2px; }
.whJNow { margin: 0; display: flex; align-items: baseline; gap: 6px; font: 600 14px/1.2 var(--serif); font-style: italic; color: var(--maroon); }
.whJNow b { font: 700 20px/1 var(--serif); font-style: normal; color: var(--deep); transition: color .4s ease; }
.whJNow span { font: 600 12px/1 var(--caps); font-style: normal; letter-spacing: .12em; color: var(--muted); margin-right: 4px; }
.whJSegs { display: flex; width: 100%; max-width: 400px; }
.whJSegs button { flex: 1 1 0; min-width: 40px; height: 40px; padding: 0 3px; border: 0; background: none; cursor: pointer; display: grid; align-items: center; -webkit-tap-highlight-color: transparent; }
.whJSegs i { position: relative; display: block; height: 4px; border-radius: 99px; overflow: hidden; background: rgba(61,12,17,.12); }
.whJSegs i::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(90deg, var(--glow), var(--deep));
  transform: scaleX(0); transform-origin: 0 50%; transition: transform .55s cubic-bezier(.2,.8,.2,1), opacity .4s ease; }
.whJSegs .is-past i::after { transform: scaleX(1); opacity: .4; }
.whJSegs .is-on i::after { transform: scaleX(1); }

/* the scene: a colour world, a motion layer, props and the couple */
.whJScene { --tint: #fbe0df; --deep: #8e1a27; --glow: #c9a84c; position: relative; overflow: hidden; isolation: isolate;
  background: radial-gradient(70% 50% at 50% 84%, rgba(255,255,255,.95), rgba(255,255,255,0) 70%), radial-gradient(130% 100% at 50% 0%, var(--tint), color-mix(in srgb, var(--tint) 50%, #fff)); }
.whJHalo { position: absolute; left: 50%; top: 44%; width: 100%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; z-index: 0;
  background: radial-gradient(circle, color-mix(in srgb, var(--glow) 34%, transparent) 0, transparent 64%); animation: whHalo 6s ease-in-out infinite; }
@keyframes whHalo { 0%, 100% { transform: scale(.94); opacity: .8; } 50% { transform: scale(1.06); opacity: 1; } }
.whFx { position: absolute; inset: 0; pointer-events: none; translate: calc(var(--mx, 0) * 6px) calc(var(--my, 0) * 4px); transition: translate .5s ease-out, opacity 1s ease .3s; }
.whFx.back { z-index: 1; }
.whFx.front { z-index: 6; }
.whJProp { position: absolute; height: auto; pointer-events: none; translate: calc(var(--mx, 0) * -12px) calc(var(--my, 0) * -7px); transition: translate .5s ease-out; }
.whJProp.flip { scale: -1 1; }
.whJProp.sway { transform-origin: 50% 0; animation: whSway 5.5s ease-in-out infinite; }
.whJProp.march { animation: whMarch 1.1s ease-in-out infinite; }
.whJProp.fire { transform-origin: 50% 100%; animation: whFire 1.6s ease-in-out infinite; }
.whJProp.float { animation: whFloat 5s ease-in-out infinite; }
@keyframes whMarch { 0%, 100% { transform: translateY(0) rotate(-.8deg); } 50% { transform: translateY(-4%) rotate(.8deg); } }
@keyframes whFire { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.03, 1.07); } }
@keyframes whFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5%); } }
.whJScene::after { content: ""; position: absolute; left: 14%; right: 14%; bottom: 0; height: 12%; z-index: 2; pointer-events: none; border-radius: 50%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--deep) 22%, transparent), transparent); }
.whJCoupleBox { position: absolute; bottom: 3%; width: 0; z-index: 3; translate: calc(var(--mx, 0) * 10px) calc(var(--my, 0) * 5px);
  transition: translate .5s ease-out, transform 1.1s cubic-bezier(.2,.9,.25,1) .12s, opacity .8s ease .12s; }
.whJCouple { position: absolute; left: 0; bottom: 0; height: 100%; width: auto; max-width: none; translate: -50% 0; transform-origin: 50% 100%;
  filter: drop-shadow(0 14px 14px rgba(61,12,17,.22)); animation: whBreathe 5.5s ease-in-out infinite; }
@keyframes whBreathe { 0%, 100% { scale: 1; } 50% { scale: 1.012 1.022; } }
.sc-baraat .whJCouple { animation: whStroll 2.2s ease-in-out infinite; }
@keyframes whStroll { 0%, 100% { rotate: -1.4deg; scale: 1; } 50% { rotate: 1.4deg; scale: 1.01 1.02; } }
.sc-sangeet .whJCouple { animation: whGroove 3s ease-in-out infinite; }
@keyframes whGroove { 0%, 100% { rotate: -1.6deg; } 25% { scale: 1.015 1.03; } 50% { rotate: 1.6deg; } 75% { scale: 1; } }
.whJStep:not(.is-on) .whJCoupleBox { transform: translateY(5%) scale(.96); }

/* particles: a full-height column travels the scene; the bit inside flutters */
.whFall, .whRise { position: absolute; left: var(--x); height: 100%; width: var(--s); }
.whFall { top: -100%; animation: whFall var(--t) linear var(--d) infinite; }
.whRise { top: 100%; animation: whRise var(--t) linear var(--d) infinite; }
@keyframes whFall { from { transform: translateY(0); } to { transform: translateY(112%); } }
@keyframes whRise { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: 1; } 78% { opacity: 1; } 100% { transform: translateY(-112%); opacity: 0; } }
.whBit { position: absolute; left: 0; display: block; width: calc(var(--s) * var(--u, 1)); height: calc(var(--s) * var(--u, 1)); font-style: normal; }
.whFall .whBit { bottom: 0; }
.whRise .whBit { top: 0; }
.whBit.petal, .whBit.rose { border-radius: 72% 0 72% 0; animation: whFlutter 2.4s ease-in-out var(--d) infinite alternate; }
.whBit.petal { background: linear-gradient(135deg, #ffd23f, #f08c00); }
.whBit.petal.k1 { background: linear-gradient(135deg, #ffb703, #f25c05); }
.whBit.petal.k2 { background: linear-gradient(135deg, #ffe680, #f4a300); }
.whBit.rose { background: linear-gradient(135deg, #fbc4d4, #e0628c); opacity: .9; }
.whBit.rose.k1 { background: linear-gradient(135deg, #fff1f4, #f59ab5); }
.whBit.rose.k2 { background: linear-gradient(135deg, #f7d9a8, #d9a04c); }
@keyframes whFlutter { from { transform: translateX(-12px) rotate(var(--r)); } to { transform: translateX(12px) rotate(calc(var(--r) + 170deg)); } }
.whBit.bloom { border-radius: 50%; background: radial-gradient(circle, #b45309 0 14%, rgba(180,83,9,0) 15%), repeating-conic-gradient(from 0deg, #f59e0b 0 12deg, #fbbf24 12deg 24deg);
  box-shadow: inset 0 0 0 2px rgba(234,88,12,.35); animation: whTurn 7s linear infinite; }
@keyframes whTurn { to { transform: rotate(360deg); } }
.whBit.dot { border-radius: 50%; background: #c9a84c; opacity: .7; }
.whBit.dot.k1 { background: var(--glow); }
.whBit.note { width: auto; height: auto; font: 700 calc(var(--s) * var(--u, 1))/1 Georgia, serif; color: var(--deep); opacity: .7; animation: whWobble 1.8s ease-in-out var(--d) infinite alternate; }
.whBit.note.k1 { color: #c0569a; }
.whBit.note.k2 { color: #b48a2c; }
@keyframes whWobble { from { transform: translateX(-8px) rotate(-12deg); } to { transform: translateX(8px) rotate(12deg); } }
.whBit.confetti { height: calc(var(--s) * var(--u, 1) * .45); border-radius: 2px; background: #e0662a; animation: whTumble 1.6s linear var(--d) infinite; }
.whBit.confetti.k1 { background: #d4af37; }
.whBit.confetti.k2 { background: #c2185b; }
@keyframes whTumble { from { transform: translateX(-6px) rotate3d(1, .4, .2, 0deg); } to { transform: translateX(6px) rotate3d(1, .4, .2, 360deg); } }
.whBit.ember { border-radius: 50%; background: radial-gradient(circle, #fff6c2 0 30%, #ff9a1a 60%, rgba(255,120,0,0) 72%); animation: whFlick 1.2s ease-in-out var(--d) infinite alternate; }
@keyframes whFlick { from { transform: translateX(-7px) scale(.7); } to { transform: translateX(7px) scale(1.15); } }
.whBit.bokeh { border-radius: 50%; background: radial-gradient(circle, rgba(255,240,190,.85), rgba(212,175,55,.3) 55%, rgba(212,175,55,0) 70%); }
.whBit.bokeh.k1 { background: radial-gradient(circle, rgba(226,218,255,.9), rgba(140,120,220,.28) 55%, rgba(140,120,220,0) 70%); }
.whBit.bokeh.k2 { background: radial-gradient(circle, rgba(255,255,255,.9), rgba(255,255,255,.25) 55%, rgba(255,255,255,0) 70%); }
.whStar { position: absolute; fill: #fff; animation: whTwinkle 2.8s ease-in-out var(--d) infinite; }
.fx-reception .whStar { fill: #e6c873; }
.fx-roka .whStar { fill: #fff; }
@keyframes whTwinkle { 0%, 100% { transform: scale(.2) rotate(0deg); opacity: 0; } 50% { transform: scale(1) rotate(45deg); opacity: 1; } }

/* drawn lines: rings, the henna mandala */
.whDraw { fill: none; stroke-dasharray: 1; stroke-dashoffset: 1; stroke-linecap: round; animation: whDraw 9s ease-in-out var(--d, 0s) infinite; }
@keyframes whDraw { 0% { stroke-dashoffset: 1; opacity: 1; } 26% { stroke-dashoffset: 0; opacity: 1; } 86% { stroke-dashoffset: 0; opacity: 1; } 96%, 100% { stroke-dashoffset: 0; opacity: 0; } }
.whRings { position: absolute; left: 50%; top: 36%; width: 94%; translate: -50% -50%; stroke: #c9a84c; stroke-width: 2.4; opacity: .8; }
.whRings .gem { stroke: #e48aa6; stroke-width: 2; }
.whMandala { position: absolute; left: 50%; top: 36%; width: 112%; translate: -50% -50%; stroke: var(--glow); stroke-width: 1.5; opacity: .62; animation: whTurn 140s linear infinite; }
.whMandala .thin { stroke-width: .8; }
.whMandala .whDraw { animation-name: whDrawSlow; animation-duration: 12s; }
@keyframes whDrawSlow { 0% { stroke-dashoffset: 1; opacity: 1; } 16% { stroke-dashoffset: 0; opacity: 1; } 90% { stroke-dashoffset: 0; opacity: 1; } 97%, 100% { stroke-dashoffset: 0; opacity: 0; } }
.whDot { fill: var(--glow); opacity: 0; animation: whDotIn 12s ease var(--d) infinite; }
@keyframes whDotIn { 0%, 6% { opacity: 0; } 14%, 90% { opacity: 1; } 97%, 100% { opacity: 0; } }
.whRays { position: absolute; left: 50%; top: 42%; width: 150%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%;
  background: repeating-conic-gradient(from 0deg, rgba(255,190,20,.5) 0 6deg, rgba(255,190,20,0) 6deg 16deg);
  -webkit-mask-image: radial-gradient(circle, #000 0 16%, transparent 62%); mask-image: radial-gradient(circle, #000 0 16%, transparent 62%); animation: whTurn 60s linear infinite; }
.whBeam { position: absolute; top: -8%; width: 34%; height: 122%; transform-origin: 50% 0; clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%); opacity: .6;
  animation: whBeam 5s ease-in-out infinite alternate; }
.whBeam.b0 { left: -6%; background: linear-gradient(180deg, rgba(255,160,215,.85), rgba(255,160,215,0) 82%); }
.whBeam.b1 { left: 20%; background: linear-gradient(180deg, rgba(150,180,255,.9), rgba(150,180,255,0) 82%); animation-duration: 6.5s; animation-delay: -2s; }
.whBeam.b2 { left: 46%; background: linear-gradient(180deg, rgba(255,214,120,.9), rgba(255,214,120,0) 82%); animation-duration: 5.6s; animation-direction: alternate-reverse; }
.whBeam.b3 { left: 72%; background: linear-gradient(180deg, rgba(200,170,255,.9), rgba(200,170,255,0) 82%); animation-duration: 7s; animation-delay: -3s; animation-direction: alternate-reverse; }
@keyframes whBeam { from { transform: rotate(-24deg); } to { transform: rotate(24deg); } }
.whBurst { position: absolute; aspect-ratio: 1; opacity: 0; animation: whBurst 3.6s ease-out var(--d) infinite; }
.whBurst svg { display: block; width: 100%; height: 100%; stroke: #e0662a; stroke-width: 1.6; stroke-linecap: round; fill: #d4af37; }
.whBurst:nth-child(2) svg { stroke: #d4af37; fill: #c2185b; }
.whBurst:nth-child(3) svg { stroke: #c2185b; fill: #e0662a; }
@keyframes whBurst { 0% { transform: scale(.2); opacity: 0; } 10% { opacity: 1; } 45% { transform: scale(1); opacity: .9; } 70%, 100% { transform: scale(1.12); opacity: 0; } }
.whFire { position: absolute; left: 50%; top: 82%; width: 76%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,170,60,.7), rgba(255,110,40,.26) 40%, rgba(255,110,40,0) 68%); animation: whGlow 1.8s ease-in-out infinite alternate; }
@keyframes whGlow { from { transform: scale(.9); opacity: .7; } to { transform: scale(1.08); opacity: 1; } }
.whOrbit { position: absolute; left: 3%; right: 3%; bottom: 1%; height: 24%; }
.whOrbit.back { clip-path: inset(0 0 50% 0); }
.whOrbit.front { clip-path: inset(50% 0 0 0); }
.whOrbitSpin { position: absolute; left: 0; top: 50%; width: 100%; aspect-ratio: 1; margin-top: -50%; transform: scaleY(.26); animation: whOrbit 28s linear infinite; }
.whOrbitSpin svg { display: block; width: 100%; height: 100%; }
@keyframes whOrbit { from { transform: scaleY(.26) rotate(0deg); } to { transform: scaleY(.26) rotate(360deg); } }
.whThread { fill: none; stroke: #b91c1c; stroke-width: 1.4; }
.whMarigold { fill: #f59e0b; stroke: #ea580c; stroke-width: 1.6; }
.whJasmine { fill: #fffaf0; stroke: rgba(201,168,76,.6); stroke-width: .8; }
.whFairy { position: absolute; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%;
  background: radial-gradient(circle, #fff 0 22%, #ffe08a 42%, rgba(255,210,110,0) 72%); animation: whFairy 2.2s ease-in-out var(--d) infinite alternate; }
@keyframes whFairy { from { transform: scale(.6); opacity: .3; } to { transform: scale(1.6); opacity: 1; } }

.whJCorner { position: absolute; z-index: 10; width: 30px; height: 30px; pointer-events: none; fill: none; stroke: #c9a84c; stroke-width: 1.6; stroke-linecap: round; opacity: .9; }
.whJCorner circle { fill: #c9a84c; stroke: none; }
.whJCorner.tl { left: 13px; top: 13px; }
.whJCorner.tr { right: 13px; top: 13px; transform: scaleX(-1); }
.whJCorner.br { right: 13px; bottom: 13px; transform: scale(-1, -1); }
.whJCorner.bl { left: 13px; bottom: 13px; transform: scaleY(-1); }

/* nothing animates off-screen or on a card that is not in front */
.whJourney:not(.is-live) .whJ *, .whJStep:not(.is-on) .whJScene *, .whJFrame:not(.is-on) * { animation-play-state: paused !important; }

@media (min-width: 768px) {
  .whJ { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 44px; align-items: start; }
  .whJStageWrap { display: block; position: sticky; top: max(96px, calc(50svh - 0.5 * min(calc(100svh - 190px), 760px) + 4px)); perspective: 1400px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .whJStage { --mx: 0; --my: 0; position: relative; width: min(100%, calc(min(calc(100svh - 190px), 760px) * .84)); margin: 0 auto; aspect-ratio: .84;
    border-radius: 28px; overflow: hidden; isolation: isolate; transform: rotateY(calc(var(--mx) * 6deg)) rotateX(calc(var(--my) * -5deg));
    transition: transform .6s cubic-bezier(.2,.8,.2,1), box-shadow .8s ease;
    box-shadow: 0 44px 80px -48px color-mix(in srgb, var(--deep) 80%, transparent), 0 0 0 1px rgba(201,168,76,.5), 0 0 0 8px rgba(255,250,244,.92), 0 0 0 9px rgba(201,168,76,.35); }
  .whJStage::after { content: ""; position: absolute; inset: 12px; border-radius: 18px; z-index: 9; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,.8); }
  .whJFrame { position: absolute; inset: 0; opacity: 0; transform: scale(1.07); transition: opacity .9s ease, transform 1.4s cubic-bezier(.2,.8,.2,1); }
  .whJFrame.is-on { opacity: 1; transform: none; }
  .whJFrame .whJScene { --u: 1.5; position: absolute; inset: 0; }
  .whJStage .whJCorner { width: 44px; height: 44px; }
  .whJStage .whJCorner.tl { left: 18px; top: 18px; } .whJStage .whJCorner.tr { right: 18px; top: 18px; }
  .whJStage .whJCorner.br { right: 18px; bottom: 18px; } .whJStage .whJCorner.bl { left: 18px; bottom: 18px; }
  .whJFrame:not(.is-on) .whJCoupleBox { transform: translateY(10%) scale(.92); opacity: 0; }
  .whJFrame:not(.is-on) .whFx { opacity: 0; }
  .whJWash { position: absolute; left: 50%; top: 52%; width: 150%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%; z-index: 7; pointer-events: none; opacity: 0;
    background: radial-gradient(circle, color-mix(in srgb, var(--glow) 50%, transparent), transparent 58%); animation: whWash 1.3s ease-out; }
  .whJWash::after { content: ""; position: absolute; inset: 32%; border-radius: 50%; box-shadow: 0 0 0 2px rgba(201,168,76,.85); }
  @keyframes whWash { 0% { transform: scale(.08); opacity: .95; } 100% { transform: scale(1.3); opacity: 0; } }
  .whJGlare { position: absolute; inset: -40%; z-index: 8; pointer-events: none; opacity: 0; translate: calc(var(--mx) * 22%) calc(var(--my) * 22%);
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.5), rgba(255,255,255,0) 34%); transition: opacity .5s ease, translate .3s ease-out; }
  .whJStage.is-tilt .whJGlare { opacity: .7; }
  .whJCount { position: relative; display: flex; align-items: baseline; gap: 6px; padding: 9px 16px; border-radius: 999px; white-space: nowrap;
    font: 600 12px/1 var(--caps); letter-spacing: .16em; color: var(--muted); background: rgba(255,250,244,.9); box-shadow: inset 0 0 0 1px rgba(201,168,76,.45), 0 10px 24px -16px rgba(61,12,17,.5); }
  .whJCount b { color: var(--deep); transition: color .5s ease; }
  .whJCount em { margin-left: 4px; font: italic 600 15px/1 var(--serif); letter-spacing: 0; color: var(--maroon); }
  .whJList { display: block; overflow: visible; margin: 0; padding: 12svh 0 12svh 44px; position: relative; scroll-snap-type: none; }
  .whJStep { min-height: 62svh; display: flex; align-items: center; padding: 0; background: none; box-shadow: none; border-radius: 0; overflow: visible; position: relative;
    transform: none; opacity: .34; transition: opacity .5s ease; }
  .whJStep.is-on { opacity: 1; }
  .whJStep::before { content: ""; position: absolute; left: -38px; top: 50%; width: 14px; height: 14px; margin-top: -7px; border-radius: 50%;
    background: var(--page); box-shadow: inset 0 0 0 2px var(--deep); transition: transform .4s ease, background-color .4s ease; }
  .whJStep.is-on::before { background: var(--deep); transform: scale(1.3); }
  .whJCardArt { display: none; }
  .whJText { padding: 26px 26px 22px; max-width: 520px; flex: none; gap: 10px; border-radius: 26px; isolation: isolate; }
  .whJText::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; opacity: 0; transform: translateX(-14px) scale(.98);
    background: linear-gradient(160deg, #fff, color-mix(in srgb, var(--tint) 50%, #fff));
    box-shadow: 0 34px 56px -44px color-mix(in srgb, var(--deep) 80%, transparent), inset 0 0 0 1px rgba(201,168,76,.32);
    transition: opacity .6s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
  .whJStep.is-on .whJText::before { opacity: 1; transform: none; }
  .whJName { font-size: clamp(28px, 3.4vw, 40px); }
  .whJLine { font-size: 17px; }
  .whJTip { font-size: 15px; }
  .whJGo { margin-top: 6px; }
  .whJThread { display: block; position: absolute; left: 13px; top: 12svh; bottom: 12svh; width: 2px; background: rgba(155,28,42,.14); }
  .whJThread i { position: absolute; inset: 0; background: linear-gradient(180deg, #c9a84c, #9b1c2a); transform-origin: 50% 0; transform: scaleY(var(--p)); transition: transform .6s ease; }
  .whJNav { display: none; }
}
@media (min-width: 1280px) { .whJ { grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: 72px; } }
@media (prefers-reduced-motion: reduce) {
  .whJourney .whJ *, .whJourney .whJ *::before, .whJourney .whJ *::after { animation: none !important; transition: none !important; }
  .whDraw { stroke-dashoffset: 0; }
  .whDot { opacity: 1; }
  .whFall, .whRise, .whBurst, .whJWash, .whJGlare { display: none; }
  .whJStage { transform: none !important; }
}

/* ── world ───────────────────────────────────────────────────────────── */
.whWorld { background: radial-gradient(70% 50% at 50% 40%, rgba(255,255,255,.8), transparent 70%), linear-gradient(180deg, var(--page), #f8ebe2 50%, var(--page)); }
.whMap { position: relative; margin: 0 -8px; }
@media (min-width: 768px) { .whMap { margin: 0; } }
.whMapSvg { display: block; width: 100%; height: auto; overflow: visible; }
.whArc { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1); }
.whWorld.is-seen .whArc { stroke-dashoffset: 0; }
.whPulse { transform-box: fill-box; transform-origin: center; animation: whPulse 2.6s ease-out infinite; }
.whPulse.big { animation-duration: 3.2s; }
@keyframes whPulse { 0% { transform: scale(.5); opacity: .9; } 100% { transform: scale(2.4); opacity: 0; } }
.whWorld:not(.is-live) .whPulse { animation-play-state: paused; }
.whPin { position: absolute; display: none; flex-direction: column; align-items: center; gap: 2px; padding: 6px 10px; border-radius: 12px; white-space: nowrap; pointer-events: none;
  background: rgba(255,250,244,.9); box-shadow: inset 0 0 0 1px rgba(201,168,76,.4), 0 8px 18px -12px rgba(61,12,17,.45); }
.whPin b { font: 700 12.5px/1.1 var(--sans); color: var(--maroon); }
.whPin small { font: 600 11.5px/1.1 var(--sans); color: var(--muted); min-height: 1.1em; }
.whPin.t { transform: translate(-50%, calc(-100% - 14px)); }
.whPin.b { transform: translate(-50%, 14px); }
.whPin.origin { background: linear-gradient(135deg, #6a1520, #3d0c11); box-shadow: 0 10px 22px -12px rgba(61,12,17,.8); transform: translate(-50%, 22px); }
.whPin.origin b { color: #f6dc8f; } .whPin.origin small { color: #f7e8d0; }
@media (min-width: 768px) { .whPin { display: flex; } }
.whClocks { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 14px 0 0; padding: 0; }
.whClocks li { display: inline-flex; align-items: baseline; gap: 6px; padding: 8px 12px; border-radius: 999px; font-size: 12.5px; color: var(--muted);
  background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 1px rgba(201,168,76,.3); }
.whClocks b { color: var(--maroon); font-weight: 700; }
.whClocks li:first-child { background: linear-gradient(135deg, #6a1520, #3d0c11); color: #f7e8d0; }
.whClocks li:first-child b { color: #f6dc8f; }
@media (min-width: 768px) { .whClocks { display: none; } }
.whWorldPts { list-style: none; display: grid; gap: 12px; margin: 34px 0 0; padding: 0; }
@media (min-width: 640px) { .whWorldPts { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } }
@media (min-width: 900px) { .whWorldPts { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1200px) { .whWorldPts { grid-template-columns: repeat(5, minmax(0, 1fr)); margin-top: 48px; } }
.whWPt { padding: 18px 16px; border-radius: 20px; background: rgba(255,255,255,.7); box-shadow: inset 0 0 0 1px rgba(201,168,76,.26); }
.whWPtIc { width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center; color: var(--maroon); background: linear-gradient(140deg, #fbe7c0, #f0cd8c); }
.whWPt h3 { margin: 12px 0 4px; font: 700 16.5px/1.3 var(--serif); color: var(--maroon); }
.whWPt p { margin: 0; font-size: 14px; line-height: 1.55; color: var(--muted); }

@media (prefers-reduced-motion: reduce) {
  .whOpToran, .whPulse { animation: none !important; }
  .whOpLeaf, .whPet, .whEnvCard, .whEnvFlap, .whEnvSeal, .whGardenLeaf, .whOpCard, .whArc { transition: none !important; }
}
`;
