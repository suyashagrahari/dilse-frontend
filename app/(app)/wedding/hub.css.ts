// The wedding hub's stylesheet. One string, injected once by the page, every
// class prefixed `wh` so nothing leaks into the gallery cards it hosts.
//
// Palette: the site's cream / maroon / gold (lib/brand.ts) with a blush and a
// marigold accent for the wedding. Phone first (360–430), then 640 / 768 /
// 1024 / 1280. Motion is transform/opacity only; reduced motion stills it.

const ART = "/wedding-v3";

export const HUB_CSS = `
.whPage { --ink: #2a0a0e; --muted: #6f4f4f; --maroon: #3d0c11; --accent: #8b5a2b; --gold: #c9a84c; --gold2: #e6c873;
  --blush: #f6e3df; --paper: #fffaf4; --line: rgba(61,12,17,.10);
  --serif: var(--font-playfair), 'Playfair Display', Georgia, serif;
  --script: 'Cormorant Garamond', var(--font-playfair), 'Playfair Display', Georgia, serif;
  --deva: var(--font-tiro-devanagari), 'Tiro Devanagari Hindi', 'Noto Serif Devanagari', serif;
  min-height: 100dvh; overflow-x: clip; color: var(--ink); font-family: var(--font-inter), 'Inter', system-ui, sans-serif;
  background:
    radial-gradient(760px 420px at 100% 0%, rgba(201,168,76,.16), transparent 62%),
    radial-gradient(640px 420px at 0% 18%, rgba(232,160,170,.16), transparent 64%),
    #f7efe7; }
.whWrap { position: relative; width: 100%; max-width: 1200px; margin: 0 auto; padding: 4px 16px 40px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 44px; }
@media (min-width: 768px) { .whWrap { padding: 98px 28px 72px; gap: 64px; } }
@media (min-width: 1280px) { .whWrap { padding: 104px 32px 88px; gap: 80px; } }

/* ── reveal ─────────────────────────────────────────────────────────────── */
.whR { opacity: 0; transform: translateY(18px); transition: opacity .75s cubic-bezier(.22,1,.36,1), transform .75s cubic-bezier(.22,1,.36,1); }
.whR.is-in { opacity: 1; transform: none; }

/* ── type ───────────────────────────────────────────────────────────────── */
.whEyebrow { margin: 0 0 8px; font: 800 11px/1.2 var(--font-inter), 'Inter', sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); }
.whEyebrow.light { color: var(--gold2); }
.whH2 { margin: 0; font: 700 clamp(26px, 6.6vw, 42px)/1.12 var(--serif); letter-spacing: -.01em; color: var(--maroon); text-wrap: balance; }
.whH2 em { font-style: italic; color: var(--accent); }
.whSub { margin: 10px 0 0; max-width: 620px; font-size: 15px; line-height: 1.6; color: var(--muted); text-wrap: pretty; }
.whHead { margin-bottom: 20px; }
@media (min-width: 768px) { .whHead { margin-bottom: 28px; text-align: center; } .whHead .whSub { margin-inline: auto; } .whSub { font-size: 16px; } }
.whHeadRow { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
@media (min-width: 768px) { .whHeadRow { text-align: left; } .whHeadRow .whSub { margin-inline: 0; } }
.whSection { position: relative; scroll-margin-top: 96px; }

/* ── buttons ────────────────────────────────────────────────────────────── */
.whCtas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.whCtas.center { justify-content: center; }
.whBtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 22px; border-radius: 999px;
  font: 700 15px/1 var(--font-inter), 'Inter', sans-serif; text-decoration: none; white-space: nowrap; cursor: pointer;
  color: #fff7e8; background: linear-gradient(135deg, #5a0f17, #3d0c11 60%, #2a070c);
  box-shadow: 0 14px 30px -16px rgba(61,12,17,.75), inset 0 1px 0 rgba(255,228,160,.25);
  transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease; -webkit-tap-highlight-color: transparent; }
.whBtn.ghost { color: var(--maroon); background: rgba(255,255,255,.7); box-shadow: inset 0 0 0 1px rgba(61,12,17,.18); }
.whBtn.gold { color: #2a0a0e; background: linear-gradient(135deg, #f6dc8f, #d6ae54 60%, #c39a3e); box-shadow: 0 14px 30px -14px rgba(214,174,84,.8), inset 0 1px 0 rgba(255,255,255,.55); }
.whBtn.ghostLight { color: #fbe8c0; background: rgba(255,255,255,.06); box-shadow: inset 0 0 0 1px rgba(242,207,116,.42); }
.whBtn:active { transform: scale(.97); }
@media (hover: hover) { .whBtn:hover { transform: translateY(-2px); } }
@media (max-width: 400px) { .whHero .whCtas .whBtn { flex: 1 1 100%; } }

/* ── hero ───────────────────────────────────────────────────────────────── */
.whHero { position: relative; display: grid; gap: 26px; padding: 70px 18px 20px; border-radius: 30px; isolation: isolate; overflow: hidden;
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(255,255,255,.95), rgba(255,250,244,.6) 60%, transparent),
    linear-gradient(180deg, #fffaf4, #fbefe8);
  box-shadow: 0 30px 60px -40px rgba(61,12,17,.45), inset 0 0 0 1px rgba(201,168,76,.28); }
.whHero::after { content: ""; position: absolute; inset: 8px; border-radius: 24px; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(201,168,76,.22); z-index: -1; }
@media (min-width: 640px) { .whHero { padding: 84px 32px 28px; } }
@media (min-width: 960px) { .whHero { grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); align-items: center; gap: 40px; padding: 96px 48px 48px; border-radius: 36px; }
  .whHero::after { border-radius: 28px; } }
@media (min-width: 1280px) { .whHero { padding: 104px 64px 56px; gap: 56px; } }

.whGarlands { position: absolute; inset: 0 0 auto 0; height: 170px; pointer-events: none; z-index: 2; }
.whToran { position: absolute; top: 0; left: 0; right: 0; height: 26px; background: url(${ART}/hub/toran.webp) top left / auto 26px repeat-x; filter: drop-shadow(0 3px 3px rgba(120,60,0,.18)); }
.whStrand { position: absolute; top: 6px; height: var(--hm); width: 18px; margin-left: -9px; background: url(${ART}/template2/01-garland-strand.webp) top center / 100% auto repeat-y;
  transform-origin: 50% 0; animation: whSway 6s ease-in-out infinite; filter: drop-shadow(0 4px 4px rgba(120,60,0,.18)); }
@keyframes whSway { 0%, 100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
@media (min-width: 960px) { .whGarlands { height: 200px; } .whToran { height: 32px; background-size: auto 32px; } .whStrand { height: var(--hd); width: 22px; margin-left: -11px; } }

.whHeroText { position: relative; z-index: 3; text-align: center; }
@media (min-width: 960px) { .whHeroText { text-align: left; } }
.whKicker { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 12px; padding: 7px 14px; border-radius: 999px;
  font: 700 11.5px/1 var(--font-inter), 'Inter', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--accent);
  background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 1px rgba(201,168,76,.4); }
.whKicker [lang="hi"] { font-family: var(--deva); font-size: 13.5px; letter-spacing: 0; text-transform: none; color: var(--maroon); }
.whKickerDot { color: var(--gold); font-size: 10px; }
.whH1 { margin: 0; font: 700 clamp(36px, 10.4vw, 64px)/1.04 var(--serif); letter-spacing: -.015em; color: var(--maroon); text-wrap: balance; }
.whH1Script { display: block; margin-top: 6px; font: italic 500 clamp(22px, 6.2vw, 34px)/1.15 var(--script);
  background: linear-gradient(100deg, #8b5a2b, #c9a84c 45%, #8b5a2b 90%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: whFoil 7s ease-in-out infinite; }
@keyframes whFoil { 0%, 100% { background-position: 0% 0; } 50% { background-position: 100% 0; } }
.whLead { margin: 16px auto 0; max-width: 560px; font-size: 15.5px; line-height: 1.65; color: var(--muted); text-wrap: pretty; }
@media (min-width: 960px) { .whLead { margin-left: 0; font-size: 17px; } }
.whHeroText .whCtas { justify-content: center; }
@media (min-width: 960px) { .whHeroText .whCtas { justify-content: flex-start; } }
.whTrust { list-style: none; display: none; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 20px 0 0; padding: 0; }
@media (min-width: 640px) { .whTrust { display: flex; } }
@media (min-width: 960px) { .whTrust { justify-content: flex-start; } }
.whTrust li { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 650; color: var(--maroon);
  background: rgba(255,255,255,.7); box-shadow: inset 0 0 0 1px var(--line); }
.whTrust svg { color: var(--accent); }

/* the couple stage — rounded rectangle, all four corners alike */
.whStage { --tint: #fbe1e0; position: relative; z-index: 1; width: 100%; max-width: 460px; justify-self: center; aspect-ratio: 5 / 6; border-radius: 28px; overflow: hidden; isolation: isolate;
  background-color: var(--tint); transition: background-color .9s ease;
  box-shadow: 0 26px 50px -30px rgba(61,12,17,.55), inset 0 0 0 1px rgba(201,168,76,.45); }
.whStage::before { content: ""; position: absolute; inset: 0; z-index: -1; background:
  radial-gradient(70% 50% at 50% 40%, rgba(255,255,255,.85), transparent 70%),
  url(${ART}/gw-kit/linen-overlay.webp) center / 380px auto; opacity: .9; }
.whStage::after { content: ""; position: absolute; inset: 10px; border-radius: 20px; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(201,168,76,.55); }
.whStageGlow { position: absolute; left: 50%; bottom: 14%; width: 70%; height: 16%; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(closest-side, rgba(61,12,17,.18), transparent); }
.whCouple { position: absolute; left: 0; right: 0; top: 9%; bottom: 13%; }
.whCouple img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: 50% 100%;
  opacity: 0; transform: translateY(10px) scale(.97); transition: opacity .45s ease, transform .6s ease; will-change: opacity, transform; }
/* The outgoing couple leaves first, the next one rises in just after it — a dip
   through the tint rather than a double exposure. */
.whCouple img.is-on { opacity: 1; transform: none; transition: opacity .8s ease .38s, transform 1s cubic-bezier(.22,1,.36,1) .38s; }
.whJhumka { position: absolute; top: -6px; width: 15%; aspect-ratio: 399 / 800; background: url(${ART}/template15/05-gold-pearl-jhumka-hangings.webp) top center / contain no-repeat;
  transform-origin: 50% 0; animation: whSway 5s ease-in-out infinite; z-index: 2; }
.whJhumka.l { left: 5%; } .whJhumka.r { right: 5%; animation-delay: -2.4s; }
.whPeony { position: absolute; bottom: -4%; width: 38%; aspect-ratio: 728 / 800; background: url(${ART}/template3/11-pink-peony-bouquet.webp) center / contain no-repeat; z-index: 2; pointer-events: none; }
.whPeony.l { left: -8%; transform: rotate(14deg); } .whPeony.r { right: -8%; transform: scaleX(-1) rotate(14deg); }
.whNow { position: absolute; z-index: 3; left: 50%; bottom: 14px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 14px 0 16px;
  border: 0; border-radius: 999px; cursor: pointer; white-space: nowrap;
  font: 700 13px/1 var(--font-inter), 'Inter', sans-serif; color: var(--maroon); background: rgba(255,255,255,.9); box-shadow: 0 10px 24px -12px rgba(61,12,17,.5), inset 0 0 0 1px rgba(201,168,76,.5);
  -webkit-tap-highlight-color: transparent; }
.whNowDeva { font-family: var(--deva); font-size: 15px; font-weight: 600; }
.whNowSep { color: var(--gold); }
.whDots { display: inline-flex; gap: 4px; margin-left: 4px; }
.whDots i { width: 5px; height: 5px; border-radius: 50%; background: rgba(61,12,17,.2); transition: transform .3s ease, background-color .3s ease; }
.whDots i.is-on { background: var(--accent); transform: scale(1.35); }
@media (min-width: 960px) { .whStage { max-width: 520px; aspect-ratio: 4 / 5; border-radius: 32px; } .whStage::after { border-radius: 24px; } .whNow { bottom: 18px; font-size: 14px; } }

/* ── featured ───────────────────────────────────────────────────────────── */
.whArrows { display: none; gap: 8px; flex: none; }
@media (min-width: 768px) { .whArrows { display: flex; } }
.whArrows button { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; color: var(--maroon);
  background: #fff; border: 1px solid var(--line); box-shadow: 0 8px 20px -14px rgba(61,12,17,.5); transition: opacity .2s ease, transform .2s ease; }
.whArrows button:disabled { opacity: .35; cursor: default; }
.whFeatRow { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: 16px; overscroll-behavior-x: contain;
  margin: 0 -16px; padding: 6px 16px 18px; scrollbar-width: none; touch-action: pan-x pan-y; }
.whFeatRow::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .whFeatRow { margin: 0 -28px; padding: 6px 28px 20px; scroll-padding-inline: 28px; gap: 18px; } }
@media (min-width: 1280px) { .whFeatRow { margin: 0; padding: 6px 2px 20px; scroll-padding-inline: 2px; gap: 22px; } }
.whFeat { flex: 0 0 min(72vw, 290px); scroll-snap-align: start; display: flex; flex-direction: column; border-radius: 24px; overflow: hidden; text-decoration: none; color: inherit;
  background: var(--paper); box-shadow: 0 22px 40px -28px rgba(61,12,17,.55), inset 0 0 0 1px rgba(201,168,76,.32); }
@media (min-width: 768px) { .whFeat { flex-basis: 268px; } }
@media (min-width: 1280px) { .whFeat { flex-basis: calc((100% - 3 * 22px) / 4); } }
.whFeatImg { position: relative; display: block; aspect-ratio: 3 / 4; overflow: hidden; margin: 8px 8px 0; border-radius: 18px; background: #efe2d6; }
.whFeatImg img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .7s cubic-bezier(.22,1,.36,1); }
.whFeatTag { position: absolute; left: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 999px;
  font: 800 10.5px/1 var(--font-inter), 'Inter', sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #2a0a0e;
  background: linear-gradient(135deg, #f8e3a6, #e2bf62); box-shadow: 0 8px 18px -8px rgba(0,0,0,.45); }
.whFeatBody { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px 16px; flex: 1; }
.whFeatName { font: 700 18px/1.2 var(--serif); color: var(--maroon); }
.whFeatLine { font-size: 13.5px; line-height: 1.5; color: var(--muted); }
.whFeatGo { margin-top: auto; padding-top: 6px; display: inline-flex; align-items: center; gap: 6px; font-weight: 750; font-size: 14px; color: var(--accent); min-height: 28px; }
@media (hover: hover) { .whFeat:hover .whFeatImg img { transform: scale(1.05); } .whFeat:hover .whFeatGo svg { transform: translateX(3px); } }
.whFeatGo svg { transition: transform .25s ease; }

/* ── chips + grid ───────────────────────────────────────────────────────── */
.whChips { display: flex; gap: 8px; overflow-x: auto; margin: 0 -16px 18px; padding: 2px 16px 6px; scrollbar-width: none; }
.whChips::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .whChips { flex-wrap: wrap; justify-content: center; overflow: visible; margin: 0 0 26px; padding: 0; } }
.whChip { flex: none; display: inline-flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 14px; border-radius: 999px; cursor: pointer; white-space: nowrap;
  font: 650 14px/1 var(--font-inter), 'Inter', sans-serif; color: var(--maroon); background: rgba(255,255,255,.8); border: 1px solid var(--line);
  transition: background-color .2s ease, color .2s ease, border-color .2s ease; -webkit-tap-highlight-color: transparent; }
.whChip.is-on { color: #fff7e8; background: linear-gradient(135deg, #5a0f17, #3d0c11); border-color: transparent; box-shadow: 0 10px 22px -14px rgba(61,12,17,.8); }
.whChipN { min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; display: inline-grid; place-items: center; font-size: 11.5px; font-weight: 800;
  background: rgba(61,12,17,.07); color: var(--accent); }
.whChip.is-on .whChipN { background: rgba(255,255,255,.16); color: #f6dc8f; }
.whGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 768px) { .whGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }
@media (min-width: 1024px) { .whGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; } }
/* Eleven cards, not fifty: draw them all (the gallery skips off-screen ones). */
.whGrid .tplCard { content-visibility: visible; }
.whEmpty { text-align: center; color: var(--muted); }
.whEmpty a { color: var(--accent); font-weight: 700; }

/* ── steps ──────────────────────────────────────────────────────────────── */
.whSteps { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; counter-reset: step; }
@media (min-width: 640px) { .whSteps { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } }
@media (min-width: 1024px) { .whSteps { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; } }
.whStep { position: relative; display: grid; grid-template-columns: 48px minmax(0, 1fr); column-gap: 14px; align-items: start; padding: 18px 16px; border-radius: 22px;
  background: var(--paper); box-shadow: 0 18px 34px -28px rgba(61,12,17,.5), inset 0 0 0 1px rgba(201,168,76,.26); }
@media (min-width: 1024px) { .whStep { grid-template-columns: 1fr; padding: 22px 20px 24px; } }
.whStepIc { grid-row: span 2; width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; color: var(--maroon);
  background: linear-gradient(140deg, #fbe7c0, #f3d39a); box-shadow: inset 0 1px 0 rgba(255,255,255,.6); }
@media (min-width: 1024px) { .whStepIc { grid-row: auto; margin-bottom: 14px; } }
.whStepN { position: absolute; top: 12px; right: 16px; font: italic 700 30px/1 var(--serif); color: rgba(201,168,76,.42); }
.whStepT { margin: 2px 0 4px; font: 700 18px/1.25 var(--serif); color: var(--maroon); padding-right: 26px; }
.whStepX { margin: 0; font-size: 14px; line-height: 1.55; color: var(--muted); }

/* ── functions ──────────────────────────────────────────────────────────── */
.whFnRow { list-style: none; display: flex; gap: 12px; overflow-x: auto; margin: 0 -16px; padding: 4px 16px 10px; scroll-snap-type: x proximity; scrollbar-width: none; }
.whFnRow::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .whFnRow { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; overflow: visible; margin: 0; padding: 0; } }
.whFn { --tint: #fbe1e0; flex: 0 0 132px; scroll-snap-align: start; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 12px 10px 14px; border-radius: 22px;
  background: linear-gradient(180deg, var(--tint), #fffaf4); box-shadow: inset 0 0 0 1px rgba(201,168,76,.28); text-align: center; }
.whFnArt { display: block; width: 100%; height: 150px; }
.whFnArt img { width: 100%; height: 100%; object-fit: contain; object-position: 50% 100%; transition: transform .5s cubic-bezier(.22,1,.36,1); }
@media (min-width: 1024px) { .whFnArt { height: 190px; } }
@media (hover: hover) { .whFn:hover .whFnArt img { transform: translateY(-4px) scale(1.03); } }
.whFnName { margin-top: 8px; font: 700 16px/1.2 var(--serif); color: var(--maroon); }
.whFnDeva { font: 500 14px/1.4 var(--deva); color: var(--accent); }

/* ── features ───────────────────────────────────────────────────────────── */
.whFeatures { display: grid; gap: 12px; }
@media (min-width: 640px) { .whFeatures { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } }
@media (min-width: 1024px) { .whFeatures { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
.whFeature { display: grid; grid-template-columns: 44px minmax(0, 1fr); column-gap: 14px; padding: 16px; border-radius: 20px; background: rgba(255,255,255,.72); box-shadow: inset 0 0 0 1px var(--line); }
.whFeatureIc { grid-row: span 2; width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: #fff7e8; background: linear-gradient(140deg, #6a1520, #3d0c11); }
.whFeatureT { margin: 2px 0 3px; font: 700 16.5px/1.3 var(--serif); color: var(--maroon); }
.whFeatureX { margin: 0; font-size: 14px; line-height: 1.55; color: var(--muted); }

/* ── FAQ ────────────────────────────────────────────────────────────────── */
.whFaq { display: grid; gap: 10px; max-width: 840px; margin: 0 auto; }
.whQ { border-radius: 18px; background: rgba(255,255,255,.78); box-shadow: inset 0 0 0 1px var(--line); }
.whQ summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 56px; padding: 14px 16px; cursor: pointer;
  font: 650 15.5px/1.4 var(--font-inter), 'Inter', sans-serif; color: var(--maroon); -webkit-tap-highlight-color: transparent; }
.whQ summary::-webkit-details-marker { display: none; }
.whQIc { flex: none; color: var(--accent); transition: transform .25s ease; }
.whQ[open] .whQIc { transform: rotate(90deg); }
.whQ p { margin: 0; padding: 0 16px 16px; font-size: 14.5px; line-height: 1.65; color: var(--muted); }

/* ── CTA ────────────────────────────────────────────────────────────────── */
.whCta { position: relative; overflow: hidden; text-align: center; padding: 58px 20px 32px; border-radius: 30px; color: #f7e8d0;
  background: radial-gradient(120% 80% at 50% 0%, rgba(214,174,84,.28), transparent 60%), linear-gradient(160deg, #5a0f17, #3d0c11 55%, #250609);
  box-shadow: 0 30px 60px -36px rgba(61,12,17,.8), inset 0 0 0 1px rgba(242,207,116,.3); }
.whCtaGarland { position: absolute; top: 0; left: 0; right: 0; height: 24px; background: url(${ART}/hub/toran.webp) top left / auto 24px repeat-x; }
.whCtaT { margin: 0 auto; max-width: 720px; font: 700 clamp(26px, 6.4vw, 44px)/1.15 var(--serif); color: #fff3dc; text-wrap: balance; }
.whCtaX { margin: 12px auto 0; max-width: 520px; font-size: 15.5px; line-height: 1.6; color: rgba(247,232,208,.78); }
@media (min-width: 768px) { .whCta { padding: 76px 40px 48px; border-radius: 36px; } }

@media (prefers-reduced-motion: reduce) {
  .whR { opacity: 1; transform: none; transition: none; }
  .whStrand, .whJhumka, .whH1Script { animation: none; }
  .whCouple img { transition: none; transform: none; }
  .whStage { transition: none; }
}
`;
