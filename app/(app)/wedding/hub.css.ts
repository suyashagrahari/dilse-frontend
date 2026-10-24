// The wedding hub's base stylesheet: tokens, the full-bleed bands, buttons,
// the design grid, how-it-works, features, FAQ and the finale. The hero lives
// in hero.css.ts and the journey / openings / world in sections.css.ts. Every
// class is prefixed `wh` so nothing leaks into the gallery cards it hosts.
//
// Palette: the site's cream / maroon / gold (lib/brand.ts) with blush and
// marigold. Fonts are the self-hosted ones from app/layout.tsx. Phone first
// (360–430), then 768 / 1024 / 1280 / 1920. Motion is transform/opacity only
// (the headline foil aside) and prefers-reduced-motion stills it.

export const HUB_CSS = `
.whPage { --ink: #2a0a0e; --muted: #6a4a48; --maroon: #3d0c11; --accent: #8b5a2b; --gold: #c9a84c; --gold2: #e6c873;
  --blush: #f8e4df; --paper: #fffaf4; --page: #faf2e8; --line: rgba(61,12,17,.10);
  --serif: var(--font-playfair), 'Playfair Display', Georgia, serif;
  --sans: var(--font-inter), 'Inter', system-ui, sans-serif;
  --caps: var(--font-cinzel), 'Cinzel', var(--font-playfair), Georgia, serif;
  --deva: var(--font-tiro-devanagari), 'Tiro Devanagari Hindi', 'Noto Serif Devanagari', 'Kohinoor Devanagari', serif;
  min-height: 100dvh; overflow-x: clip; color: var(--ink); font-family: var(--sans); background: var(--page); }
.whPage *, .whPage *::before, .whPage *::after { box-sizing: border-box; }

/* ── bands: full-bleed sections with a centred measure ─────────────────── */
.whBand { position: relative; padding: 56px 0; scroll-margin-top: 64px; }
.whIn { position: relative; width: 100%; max-width: 1240px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 768px) { .whBand { padding: 80px 0; scroll-margin-top: 84px; } .whIn { padding: 0 32px; } }
@media (min-width: 1280px) { .whBand { padding: 104px 0; } .whIn { padding: 0 40px; } }
@media (min-width: 1680px) { .whIn { max-width: 1440px; } }
.whBand::before { content: ""; position: absolute; left: 50%; top: 0; width: min(220px, 50vw); height: 18px; transform: translateX(-50%); opacity: .8;
  background: radial-gradient(circle at 50% 50%, var(--gold) 0 3px, transparent 3.5px) center / 18px 18px no-repeat,
    linear-gradient(90deg, transparent, rgba(201,168,76,.7) 30%, rgba(201,168,76,.7) 44%, transparent 46%, transparent 54%, rgba(201,168,76,.7) 56%, rgba(201,168,76,.7) 70%, transparent) center / 100% 1px no-repeat; }
.whJourney::before { display: none; }

/* ── reveal ─────────────────────────────────────────────────────────────── */
.whR { opacity: 0; transform: translateY(18px); transition: opacity .75s cubic-bezier(.22,1,.36,1), transform .75s cubic-bezier(.22,1,.36,1); }
.whR.is-in { opacity: 1; transform: none; }

/* ── type ───────────────────────────────────────────────────────────────── */
.whEyebrow { margin: 0 0 10px; font: 700 11.5px/1.3 var(--caps); letter-spacing: .2em; text-transform: uppercase; color: var(--accent); }
.whEyebrow.light { color: var(--gold2); }
.whEyebrow [lang="hi"] { font-family: var(--deva); letter-spacing: 0; font-size: 14px; }
.whH2 { margin: 0; font: 700 clamp(28px, 7.4vw, 52px)/1.1 var(--serif); letter-spacing: -.012em; color: var(--maroon); text-wrap: balance; }
.whH2 em { font-style: italic; font-weight: 600; color: var(--accent); }
.whSub { margin: 12px 0 0; max-width: 640px; font-size: 15px; line-height: 1.62; color: var(--muted); text-wrap: pretty; }
.whHead { margin-bottom: 24px; text-align: center; }
.whHead .whSub { margin-inline: auto; }
@media (min-width: 768px) { .whHead { margin-bottom: 40px; } .whSub { font-size: 16.5px; } }

/* ── buttons ────────────────────────────────────────────────────────────── */
.whCtas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.whCtas.center { justify-content: center; }
.whBtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 22px; border-radius: 999px;
  font: 700 15px/1 var(--sans); text-decoration: none; white-space: nowrap; cursor: pointer; border: 0;
  color: #fff7e8; background: linear-gradient(135deg, #6a1520, #3d0c11 60%, #2a070c);
  box-shadow: 0 14px 30px -16px rgba(61,12,17,.75), inset 0 1px 0 rgba(255,228,160,.25);
  transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease; -webkit-tap-highlight-color: transparent; }
.whBtn.ghost { color: var(--maroon); background: rgba(255,255,255,.78); box-shadow: inset 0 0 0 1px rgba(61,12,17,.2), 0 10px 24px -18px rgba(61,12,17,.6); }
.whBtn.gold { color: #2a0a0e; background: linear-gradient(135deg, #f6dc8f, #d6ae54 60%, #c39a3e); box-shadow: 0 14px 30px -14px rgba(214,174,84,.8), inset 0 1px 0 rgba(255,255,255,.55); }
.whBtn.ghostLight { color: #fbe8c0; background: rgba(255,255,255,.06); box-shadow: inset 0 0 0 1px rgba(242,207,116,.42); }
.whBtn:active { transform: scale(.97); }
.whBtn:focus-visible, .whChip:focus-visible, .whQ summary:focus-visible, .whOpReplay:focus-visible, .whJDots button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
@media (hover: hover) { .whBtn:hover { transform: translateY(-2px); } }
@media (max-width: 520px) { .whCopy .whCtas { gap: 8px; flex-wrap: nowrap; } .whCopy .whCtas .whBtn { padding: 0 15px; font-size: 14.5px; gap: 6px; } }
@media (max-width: 380px) { .whCopy .whCtas .whBtn { padding: 0 12px; font-size: 13.5px; } }

/* ── designs: sticky chips + the gallery cards ──────────────────────────── */
.whDesigns { background: linear-gradient(180deg, var(--page), #fff7ef 30%, var(--page)); }
.whChips { display: flex; gap: 8px; overflow-x: auto; margin: 0 -16px 18px; padding: 10px 16px; scrollbar-width: none;
  position: sticky; top: 60px; z-index: 30; background: rgba(250,242,232,.9); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(201,168,76,.28); }
.whChips::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .whChips { position: static; flex-wrap: wrap; justify-content: center; overflow: visible; margin: 0 0 30px; padding: 0; background: none; box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; } }
.whChip { flex: none; display: inline-flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 14px; border-radius: 999px; cursor: pointer; white-space: nowrap;
  font: 650 14px/1 var(--sans); color: var(--maroon); background: rgba(255,255,255,.86); border: 1px solid rgba(201,168,76,.38);
  transition: background-color .2s ease, color .2s ease, border-color .2s ease; -webkit-tap-highlight-color: transparent; }
.whChip.is-on { color: #fff7e8; background: linear-gradient(135deg, #6a1520, #3d0c11); border-color: transparent; box-shadow: 0 10px 22px -14px rgba(61,12,17,.8); }
.whChipN { min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; display: inline-grid; place-items: center; font-size: 11.5px; font-weight: 800;
  background: rgba(61,12,17,.07); color: var(--accent); }
.whChip.is-on .whChipN { background: rgba(255,255,255,.16); color: #f6dc8f; }
.whGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 768px) { .whGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
@media (min-width: 1024px) { .whGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; } }
@media (min-width: 1680px) { .whGrid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
/* A dozen cards, not fifty: draw them all (the gallery skips off-screen ones). */
.whGrid .tplCard { content-visibility: visible; }
/* The shared favourite heart is 28–36px; give it a 44px tap area here without changing how it looks. */
.whGrid button.w-9::after { content: ""; position: absolute; inset: -8px; border-radius: 50%; }
.whEmpty { text-align: center; color: var(--muted); }
.whEmpty a { color: var(--accent); font-weight: 700; }

/* ── how it works ───────────────────────────────────────────────────────── */
.whHow { background: radial-gradient(70% 50% at 50% 0%, rgba(246,220,180,.4), transparent 70%), var(--page); }
.whSteps { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
@media (min-width: 640px) { .whSteps { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } }
@media (min-width: 1024px) { .whSteps { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; } }
.whStep { position: relative; padding: 16px 16px 20px; border-radius: 22px; background: var(--paper); box-shadow: 0 18px 34px -30px rgba(61,12,17,.5), inset 0 0 0 1px rgba(201,168,76,.28); }
.whStepN { position: absolute; top: 14px; right: 16px; font: italic 700 30px/1 var(--serif); color: rgba(201,168,76,.5); }
.whStepT { margin: 14px 0 4px; font: 700 19px/1.25 var(--serif); color: var(--maroon); }
.whStepX { margin: 0; font-size: 14px; line-height: 1.58; color: var(--muted); }
.whHow > .whIn > .whCtas { margin: 26px 0 52px; }
@media (min-width: 768px) { .whHow > .whIn > .whCtas { margin: 34px 0 72px; } }

.whSA { position: relative; display: block; height: 92px; border-radius: 16px; overflow: hidden;
  background: radial-gradient(80% 90% at 50% 100%, #fbe7c0, #fdf3e2 70%); box-shadow: inset 0 0 0 1px rgba(201,168,76,.22); }
.whSA.pick i { position: absolute; left: 50%; bottom: 12px; width: 44px; height: 62px; margin-left: -22px; border-radius: 22px 22px 6px 6px; transform-origin: 50% 120%;
  background: linear-gradient(180deg, #fff, #f6e3d2); box-shadow: 0 8px 14px -8px rgba(61,12,17,.45), inset 0 0 0 2px #e2c27a; transition: transform .9s cubic-bezier(.2,.9,.25,1) .2s; }
.whSA.pick i:nth-child(1) { background: linear-gradient(180deg, #fbe1e0, #e9a9a9); }
.whSA.pick i:nth-child(3) { background: linear-gradient(180deg, #fdf0c6, #e7c36a); }
.whStep.is-in .whSA.pick i:nth-child(1) { transform: rotate(-24deg); }
.whStep.is-in .whSA.pick i:nth-child(3) { transform: rotate(24deg); }
.whStep.is-in .whSA.pick i:nth-child(2) { transform: translateY(-6px); animation: whLift 3s ease-in-out 1.2s infinite; }
@keyframes whLift { 0%, 100% { transform: translateY(-6px); } 50% { transform: translateY(-12px); } }
.whSA.ai .wand { position: absolute; left: 18px; top: 30px; color: var(--maroon); transform-origin: 20% 80%; animation: whWave 2.4s ease-in-out infinite; }
@keyframes whWave { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(12deg); } }
.whSA.ai b { position: absolute; color: var(--gold); font-size: 13px; animation: whTw 1.8s ease-in-out infinite; }
.whSA.ai .s1 { left: 44px; top: 18px; } .whSA.ai .s2 { left: 54px; top: 46px; animation-delay: .6s; } .whSA.ai .s3 { left: 36px; top: 62px; animation-delay: 1.2s; font-size: 10px; }
@keyframes whTw { 0%, 100% { opacity: .2; transform: scale(.6); } 50% { opacity: 1; transform: scale(1.15); } }
.whSA.ai .lines { position: absolute; left: 76px; right: 18px; top: 26px; display: grid; gap: 8px; }
.whSA.ai .lines i { display: block; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #c9a84c, #e9cf8a); transform-origin: 0 50%; transform: scaleX(0); }
.whSA.ai .lines i:nth-child(2) { width: 80%; } .whSA.ai .lines i:nth-child(3) { width: 60%; }
.whStep.is-in .whSA.ai .lines i { animation: whType 4s ease-in-out infinite; }
.whStep.is-in .whSA.ai .lines i:nth-child(2) { animation-delay: .4s; } .whStep.is-in .whSA.ai .lines i:nth-child(3) { animation-delay: .8s; }
@keyframes whType { 0% { transform: scaleX(0); } 30%, 80% { transform: scaleX(1); } 100% { transform: scaleX(0); } }
.whSA.share .bubble { position: absolute; left: 16px; top: 24px; padding: 10px 14px; border-radius: 16px 16px 16px 4px; font: 700 13px/1 var(--sans); color: #0b3d2a;
  background: #dcf8c6; box-shadow: 0 8px 16px -10px rgba(0,0,0,.35); transform-origin: 0 100%; transform: scale(0); }
.whStep.is-in .whSA.share .bubble { animation: whPop 3.6s cubic-bezier(.2,.9,.25,1.3) infinite; }
@keyframes whPop { 0% { transform: scale(0); } 12%, 80% { transform: scale(1); } 92%, 100% { transform: scale(0); } }
.whSA.share .plane { position: absolute; right: 22px; top: 34px; color: var(--accent); }
.whStep.is-in .whSA.share .plane { animation: whFly 3.6s ease-in-out infinite; }
@keyframes whFly { 0% { transform: translate(-60px, 20px) rotate(10deg); opacity: 0; } 20% { opacity: 1; } 60% { transform: translate(0, -6px) rotate(-6deg); opacity: 1; } 100% { transform: translate(40px, -30px); opacity: 0; } }
.whSA.rsvp { display: grid; align-content: center; gap: 6px; padding: 0 18px; }
.whSA.rsvp .row { display: flex; align-items: center; justify-content: space-between; height: 20px; padding: 0 10px; border-radius: 8px; background: rgba(255,255,255,.8); font: 700 11.5px/1 var(--sans); color: var(--maroon); }
.whSA.rsvp .row svg { color: #1f8a4c; opacity: 0; transform: scale(.3); }
.whStep.is-in .whSA.rsvp .row svg { animation: whTick 4s ease infinite; }
.whStep.is-in .whSA.rsvp .row:nth-child(2) svg { animation-delay: .5s; } .whStep.is-in .whSA.rsvp .row:nth-child(3) svg { animation-delay: 1s; }
@keyframes whTick { 0%, 8% { opacity: 0; transform: scale(.3); } 18%, 85% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(.3); } }

/* ── features ───────────────────────────────────────────────────────────── */
.whFeatures { display: grid; gap: 12px; }
@media (min-width: 640px) { .whFeatures { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } }
@media (min-width: 1024px) { .whFeatures { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; } }
.whFeature { display: grid; grid-template-columns: 46px minmax(0, 1fr); column-gap: 14px; padding: 16px; border-radius: 20px; background: rgba(255,255,255,.66);
  box-shadow: inset 0 0 0 1px rgba(201,168,76,.24); transition: transform .3s ease, box-shadow .3s ease; }
@media (hover: hover) { .whFeature:hover { transform: translateY(-3px); box-shadow: inset 0 0 0 1px rgba(201,168,76,.5), 0 18px 30px -24px rgba(61,12,17,.5); } }
.whFeatureIc { grid-row: span 2; width: 46px; height: 46px; border-radius: 15px; display: grid; place-items: center; color: #fbe6b0; background: linear-gradient(140deg, #6a1520, #3d0c11); box-shadow: inset 0 0 0 1px rgba(242,207,116,.35); }
.whFeatureT { margin: 2px 0 3px; font: 700 17px/1.3 var(--serif); color: var(--maroon); }
.whFeatureX { margin: 0; font-size: 14px; line-height: 1.55; color: var(--muted); }

/* ── FAQ ────────────────────────────────────────────────────────────────── */
.whFaqBand { background: linear-gradient(180deg, var(--page), #f8e9e1); }
.whFaq { display: grid; gap: 10px; max-width: 860px; margin: 0 auto; }
.whQ { border-radius: 18px; background: rgba(255,255,255,.8); box-shadow: inset 0 0 0 1px rgba(201,168,76,.24); }
.whQ summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 56px; padding: 14px 16px; cursor: pointer;
  font: 650 15.5px/1.4 var(--sans); color: var(--maroon); -webkit-tap-highlight-color: transparent; }
.whQ summary::-webkit-details-marker { display: none; }
.whQIc { flex: none; color: var(--accent); transition: transform .25s ease; }
.whQ[open] .whQIc { transform: rotate(90deg); }
.whQ p { margin: 0; padding: 0 16px 16px; font-size: 14.5px; line-height: 1.68; color: var(--muted); }

/* ── finale ─────────────────────────────────────────────────────────────── */
.whFinale { position: relative; overflow: hidden; isolation: isolate; text-align: center; color: #f7e8d0; padding: 120px 16px 190px;
  background:
    radial-gradient(70% 45% at 50% 100%, rgba(255,170,80,.32), transparent 70%),
    radial-gradient(90% 60% at 50% 0%, rgba(120,30,60,.6), transparent 70%),
    linear-gradient(180deg, #2a0710, #3d0c11 45%, #250609); }
@media (min-width: 768px) { .whFinale { padding: 150px 32px 200px; } }
.whFinLights { position: absolute; top: -10px; left: 0; right: 0; height: 160px; background: top center / auto 100% repeat-x; opacity: .9; pointer-events: none; }
.whFinLantern { position: absolute; top: 0; width: 110px; aspect-ratio: 1; background: top center / contain no-repeat; transform-origin: 50% 0; pointer-events: none; animation: whFinSway 6s ease-in-out infinite; filter: drop-shadow(0 0 18px rgba(255,200,110,.5)); }
.whFinLantern.l { left: 2%; } .whFinLantern.r { right: 2%; animation-delay: -3s; }
@media (min-width: 768px) { .whFinLantern { width: 170px; } }
@keyframes whFinSway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.whFinIn { position: relative; z-index: 2; max-width: 760px; margin: 0 auto; }
.whFinT { margin: 0 auto; font: 700 clamp(30px, 7.6vw, 56px)/1.1 var(--serif); color: #fff3dc; text-wrap: balance; text-shadow: 0 4px 30px rgba(0,0,0,.4); }
.whFinT em { font-style: italic; font-weight: 600; color: #f2cf74; }
.whFinX { margin: 14px auto 0; max-width: 540px; font-size: 16px; line-height: 1.62; color: rgba(247,232,208,.8); }
.whFireworks { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.whBurst { position: absolute; width: 0; height: 0; }
.whBurst i { position: absolute; left: -1.5px; top: 0; width: 3px; height: 16px; border-radius: 3px; background: linear-gradient(0deg, transparent, var(--c));
  opacity: 0; transform: rotate(var(--r)) translateY(0) scaleY(.3); animation: whSpark 4s cubic-bezier(.15,.7,.3,1) var(--bd) infinite; box-shadow: 0 0 6px var(--c); }
@keyframes whSpark {
  0% { opacity: 0; transform: rotate(var(--r)) translateY(0) scaleY(.3); }
  6% { opacity: 1; }
  40% { opacity: 1; transform: rotate(var(--r)) translateY(-64px) scaleY(1); }
  60%, 100% { opacity: 0; transform: rotate(var(--r)) translateY(-86px) scaleY(.4); }
}
@media (min-width: 768px) { @keyframes whSpark {
  0% { opacity: 0; transform: rotate(var(--r)) translateY(0) scaleY(.3); }
  6% { opacity: 1; }
  40% { opacity: 1; transform: rotate(var(--r)) translateY(-110px) scaleY(1.2); }
  60%, 100% { opacity: 0; transform: rotate(var(--r)) translateY(-140px) scaleY(.4); }
} }
.whBurst .flash { position: absolute; left: -40px; top: -40px; width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(closest-side, var(--c), transparent);
  opacity: 0; animation: whFlash 4s ease-out var(--bd) infinite; }
@keyframes whFlash { 0% { opacity: 0; transform: scale(.2); } 5% { opacity: .9; transform: scale(1); } 30%, 100% { opacity: 0; transform: scale(1.6); } }
.whTwinkle { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: #fff3c4; box-shadow: 0 0 8px 2px rgba(255,220,140,.7); animation: whTw 2.6s ease-in-out infinite; }
.whDiyas { position: absolute; z-index: 2; left: 0; right: 0; bottom: 104px; display: flex; justify-content: center; gap: clamp(14px, 4vw, 48px); pointer-events: none; }
@media (min-width: 768px) { .whDiyas { bottom: 56px; } }
.whDiya { position: relative; width: 42px; height: 50px; }
.whDiya .bowl { position: absolute; left: 0; right: 0; bottom: 0; height: 20px; border-radius: 4px 4px 40px 40px; background: linear-gradient(180deg, #d1773a, #8a3a16); box-shadow: inset 0 3px 0 rgba(255,210,150,.5); }
.whDiya .flame { position: absolute; left: 50%; bottom: 17px; width: 12px; height: 24px; margin-left: -6px; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(60% 50% at 50% 70%, #fff7d0, #ffcf4a 55%, #ff7a1a); transform-origin: 50% 100%; animation: whFlick 1.4s ease-in-out infinite; }
.whDiya .glow { position: absolute; left: 50%; bottom: 10px; width: 110px; height: 110px; margin-left: -55px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,190,90,.5), transparent); animation: whGlow 2.2s ease-in-out infinite; }
@keyframes whFlick { 0%, 100% { transform: scale(1, 1) rotate(-2deg); } 30% { transform: scale(.92, 1.1) rotate(3deg); } 60% { transform: scale(1.05, .94) rotate(-1deg); } }
@keyframes whGlow { 0%, 100% { opacity: .65; transform: scale(.95); } 50% { opacity: 1; transform: scale(1.08); } }
.whFinale:not(.is-live) *, .whFinale:not(.is-live) { animation-play-state: paused !important; }

@media (prefers-reduced-motion: reduce) {
  .whR { opacity: 1; transform: none; transition: none; }
  .whSA *, .whFinLantern, .whTwinkle, .whDiya i { animation: none !important; }
  .whSA.share .bubble, .whSA.rsvp .row svg { transform: none; opacity: 1; }
  .whSA.ai .lines i { transform: none; }
  .whBurst i, .whBurst .flash { animation: none; opacity: 0; }
}
`;
