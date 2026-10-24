// /wedding: the journey, the openings showcase and the world section.
// Phone first; the journey turns into a sticky scrollytelling stage at 768px
// and the openings into a five-across gallery at 1024px.

const LUX = "/wedding-v3/hub/lux";

export const SECTIONS_CSS = `
/* ── journey ─────────────────────────────────────────────────────────── */
.whJourney { background: linear-gradient(180deg, var(--page), #fcefe6 18%, #fdf5ee 82%, var(--page)); }
.whJ { position: relative; }
.whJStage { display: none; }
.whJList { list-style: none; display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: 16px; overscroll-behavior-x: contain;
  margin: 0 -16px; padding: 6px 16px 12px; scrollbar-width: none; }
.whJList::-webkit-scrollbar { display: none; }
.whJStep { --deep: #8e1a27; flex: 0 0 min(84vw, 360px); scroll-snap-align: start; display: flex; flex-direction: column; border-radius: 26px; overflow: hidden;
  background: var(--paper); box-shadow: 0 24px 40px -32px rgba(61,12,17,.55), inset 0 0 0 1px rgba(201,168,76,.3); }
.whJCardArt .whJScene { aspect-ratio: 1 / 1.02; }
.whJText { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 16px 18px 18px; flex: 1; }
.whJNum { font: 700 12px/1 var(--caps); letter-spacing: .2em; color: var(--deep); }
.whJName { margin: 0; font: 700 23px/1.2 var(--serif); color: var(--maroon); }
.whJName span { display: block; margin-top: 2px; font: 500 15px/1.4 var(--deva); color: var(--deep); }
.whJLine { margin: 4px 0 0; font-size: 15px; line-height: 1.58; color: var(--ink); }
.whJTip { margin: 2px 0 0; padding-left: 12px; font-size: 13.5px; line-height: 1.55; color: var(--muted); font-style: italic; box-shadow: inset 2px 0 0 rgba(201,168,76,.6); }
.whJGo { margin-top: auto; padding-top: 6px; display: inline-flex; align-items: center; gap: 6px; min-height: 40px; font-weight: 750; font-size: 14.5px; color: var(--deep); text-decoration: none; }
.whJGo svg { transition: transform .25s ease; }
@media (hover: hover) { .whJGo:hover svg { transform: translateX(3px); } }
.whJThread { display: none; }
.whJDots { display: flex; justify-content: center; gap: 0; margin-top: 6px; }
.whJDots button { width: 40px; height: 40px; display: grid; place-items: center; border: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.whJDots i { display: block; width: 8px; height: 8px; border-radius: 99px; background: rgba(61,12,17,.2); transition: transform .3s ease, background-color .3s ease; }
.whJDots .is-on i { background: var(--accent); transform: scaleX(2.4); }

.whJScene { --tint: #fbe0df; --deep: #8e1a27; position: relative; overflow: hidden; isolation: isolate;
  background: radial-gradient(75% 60% at 50% 78%, rgba(255,255,255,.95), rgba(255,255,255,0) 70%), radial-gradient(120% 90% at 50% 0%, var(--tint), color-mix(in srgb, var(--tint) 70%, #fff)); }
.whJRing { position: absolute; left: 50%; top: 50%; width: 92%; aspect-ratio: 1; margin: -46% 0 0 -46%; opacity: .32; z-index: 0;
  background: url(${LUX}/gold-ring-480.webp) center / contain no-repeat; animation: whSpin 90s linear infinite; }
.whJDeva { position: absolute; left: 0; right: 0; top: 8%; text-align: center; font: 600 clamp(56px, 20vw, 120px)/1 var(--deva); color: var(--deep); opacity: .1; z-index: 0; white-space: nowrap; }
.whJProp { position: absolute; height: auto; pointer-events: none; }
.whJProp.flip { scale: -1 1; }
.whJProp.sway { transform-origin: 50% 0; animation: whSway 5.5s ease-in-out infinite; }
.whJProp.march { animation: whMarch 1.1s ease-in-out infinite; }
.whJProp.fire { transform-origin: 50% 100%; animation: whFire 1.6s ease-in-out infinite; }
.whJProp.float { animation: whFloat 5s ease-in-out infinite; }
@keyframes whMarch { 0%, 100% { transform: translateY(0) rotate(-.6deg); } 50% { transform: translateY(-4%) rotate(.6deg); } }
@keyframes whFire { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.03, 1.07); } }
@keyframes whFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5%); } }
.whJCouple { position: absolute; left: 50%; bottom: 3%; height: 80%; width: auto; translate: -50% 0; z-index: 3; filter: drop-shadow(0 14px 14px rgba(61,12,17,.2)); }

@media (min-width: 768px) {
  .whJ { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 44px; align-items: start; }
  .whJStage { display: block; position: sticky; top: max(96px, calc(50svh - 0.5 * min(calc(100svh - 130px), 760px) + 30px)); width: min(100%, calc(min(calc(100svh - 130px), 760px) * .84)); margin: 0 auto; aspect-ratio: .84;
    border-radius: 28px; overflow: hidden; isolation: isolate;
    box-shadow: 0 40px 70px -48px rgba(61,12,17,.65), 0 0 0 1px rgba(201,168,76,.5), 0 0 0 8px rgba(255,250,244,.9), 0 0 0 9px rgba(201,168,76,.35); }
  .whJFrame { position: absolute; inset: 0; opacity: 0; transition: opacity .9s ease; }
  .whJFrame.is-on { opacity: 1; }
  .whJFrame .whJScene { position: absolute; inset: 0; }
  .whJFrame .whJCouple { transform: translateY(24px) scale(.97); transition: transform 1.2s cubic-bezier(.2,.9,.25,1); }
  .whJFrame.is-on .whJCouple { transform: none; }
  .whJFrame:not(.is-on) .whJProp, .whJFrame:not(.is-on) .whJRing { animation-play-state: paused; }
  .whJCount { position: absolute; z-index: 5; left: 50%; bottom: 16px; transform: translateX(-50%); padding: 8px 14px; border-radius: 999px;
    font: 600 12px/1 var(--caps); letter-spacing: .18em; color: var(--muted); background: rgba(255,250,244,.85); box-shadow: inset 0 0 0 1px rgba(201,168,76,.4); }
  .whJCount b { color: var(--maroon); }
  .whJList { display: block; overflow: visible; margin: 0; padding: 12svh 0 12svh 44px; position: relative; scroll-snap-type: none; }
  .whJStep { min-height: 62svh; display: flex; align-items: center; background: none; box-shadow: none; border-radius: 0; overflow: visible; position: relative;
    opacity: .32; transition: opacity .5s ease; }
  .whJStep.is-on { opacity: 1; }
  .whJStep::before { content: ""; position: absolute; left: -38px; top: 50%; width: 14px; height: 14px; margin-top: -7px; border-radius: 50%;
    background: var(--page); box-shadow: inset 0 0 0 2px var(--deep); transition: transform .4s ease, background-color .4s ease; }
  .whJStep.is-on::before { background: var(--deep); transform: scale(1.3); }
  .whJCardArt { display: none; }
  .whJText { padding: 0; max-width: 500px; flex: none; }
  .whJName { font-size: clamp(28px, 3.4vw, 40px); }
  .whJName span { font-size: 18px; }
  .whJLine { font-size: 17px; }
  .whJTip { font-size: 15px; }
  .whJThread { display: block; position: absolute; left: 13px; top: 12svh; bottom: 12svh; width: 2px; background: rgba(155,28,42,.14); }
  .whJThread i { position: absolute; inset: 0; background: linear-gradient(180deg, #c9a84c, #9b1c2a); transform-origin: 50% 0; transform: scaleY(var(--p)); transition: transform .6s ease; }
  .whJDots { display: none; }
}
@media (min-width: 1280px) { .whJ { grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: 72px; } }

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
  .whJRing, .whJProp, .whOpToran, .whPulse { animation: none !important; }
  .whJFrame, .whJFrame .whJCouple, .whOpLeaf, .whPet, .whEnvCard, .whEnvFlap, .whEnvSeal, .whGardenLeaf, .whOpCard, .whArc { transition: none !important; }
}
`;
