// The /wedding hero: a full-bleed terrace at golden hour (see HubHero.tsx).
// Phone first: the words on top, the scene below, the terrace running under
// the bottom nav. From 1024px the words sit left and the scene fills the right.
// Parallax layers (.px0–.px4) read --sy (scroll px) and --mx/--my (pointer,
// -1…1) and use `translate` so a layer's own transform/animation is untouched.

const ART = "/wedding-v3";
const LUX = `${ART}/hub/lux`;

export const HERO_CSS = `
.whHero { --sy: 0; --mx: 0; --my: 0; position: relative; isolation: isolate; overflow: hidden; display: flex; flex-direction: column;
  min-height: 100svh; margin-top: -84px; color: var(--ink);
  background:
    radial-gradient(90% 55% at 50% 62%, rgba(255,240,214,.95), rgba(255,240,214,0) 70%),
    linear-gradient(180deg, #fff8f0 0%, #fdeee4 34%, #fbe2d2 64%, #f6d6bd 100%); }
@media (min-width: 768px) { .whHero { margin-top: 0; min-height: max(100svh, 720px); } }

.px0 { translate: 0 calc(var(--sy) * .32px); }
.px1 { translate: calc(var(--mx) * -8px) calc(var(--sy) * .22px); }
.px2 { translate: calc(var(--mx) * -12px) calc(var(--sy) * .14px + var(--my) * -6px); }
.px3 { translate: calc(var(--mx) * -18px) calc(var(--sy) * .07px); }
.px4 { translate: calc(var(--mx) * -26px) calc(var(--sy) * .02px); }

/* ── sky ─────────────────────────────────────────────────────────────── */
.whSky { position: absolute; inset: 0; z-index: -2; pointer-events: none; }
.whSun { position: absolute; left: 50%; top: 62%; width: 130vmin; aspect-ratio: 1; margin: -65vmin 0 0 -65vmin; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,250,235,1), rgba(255,226,170,.55) 42%, rgba(255,214,160,0) 72%); }
.whRays { position: absolute; left: 50%; top: 62%; width: 190vmax; aspect-ratio: 1; margin: -95vmax 0 0 -95vmax; opacity: .55;
  background: repeating-conic-gradient(from 0deg, rgba(255,255,255,.75) 0deg 3deg, rgba(255,255,255,0) 3deg 14deg);
  -webkit-mask: radial-gradient(closest-side, #000 8%, transparent 62%); mask: radial-gradient(closest-side, #000 8%, transparent 62%);
  animation: whSpin 160s linear infinite; }
@keyframes whSpin { to { transform: rotate(360deg); } }
.whCloud { position: absolute; height: 60px; border-radius: 999px; background: radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,255,255,0)); filter: blur(2px);
  animation: whCloud 60s linear infinite; }
.whCloud.a { top: 22%; left: -10%; width: 260px; }
.whCloud.b { top: 34%; left: 40%; width: 340px; height: 80px; animation-duration: 90s; animation-delay: -30s; opacity: .8; }
.whCloud.c { top: 14%; left: 70%; width: 220px; animation-duration: 75s; animation-delay: -50s; opacity: .7; }
@keyframes whCloud { from { transform: translateX(-30vw); } to { transform: translateX(60vw); } }
@media (min-width: 1024px) { .whSun { left: 68%; top: 56%; } .whRays { left: 68%; top: 56%; } }

.whFar { position: absolute; inset: 0; z-index: -1; pointer-events: none; display: none; }
.whGazebo { position: absolute; bottom: 9%; height: 62%; width: auto; opacity: .42; filter: saturate(.8); }
.whGazebo.l { left: 44%; height: 50%; bottom: 14%; opacity: .32; } .whGazebo.r { right: -4%; height: 70%; }
@media (min-width: 1024px) { .whFar { display: block; } }

/* ── toran, strands, jhumkas, lanterns ───────────────────────────────── */
.whDecor { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
.whToran { position: absolute; top: 0; left: 0; right: 0; height: 30px; background: url(${ART}/hub/toran.webp) top left / auto 30px repeat-x; filter: drop-shadow(0 3px 3px rgba(120,60,0,.18)); }
.whStrand { position: absolute; top: 8px; height: var(--hm); width: 16px; margin-left: -8px; background: url(${ART}/template2/01-garland-strand.webp) top center / 100% auto repeat-y;
  transform-origin: 50% 0; animation: whSway 6s ease-in-out infinite; filter: drop-shadow(0 4px 4px rgba(120,60,0,.18)); }
.whStrand.inner { display: none; }
@keyframes whSway { 0%, 100% { transform: rotate(-2.4deg); } 50% { transform: rotate(2.4deg); } }
.whJhumka { position: absolute; top: 22px; width: 34px; aspect-ratio: 180 / 361; background: url(${LUX}/jhumka-180.webp) top center / contain no-repeat;
  transform-origin: 50% 0; animation: whSway 4.6s ease-in-out infinite; display: none; }
.whLantern { position: absolute; top: 0; width: 48px; aspect-ratio: 143 / 300; background: url(${LUX}/pink-lantern-300.webp) top center / contain no-repeat;
  transform-origin: 50% 0; animation: whSway 7s ease-in-out infinite; display: none; filter: drop-shadow(0 10px 14px rgba(255,170,120,.45)); }
@media (min-width: 768px) {
  .whToran { height: 34px; background-size: auto 34px; }
  .whStrand { width: 20px; margin-left: -10px; height: var(--hd); }
  .whStrand.inner { display: block; }
  .whJhumka { display: block; width: 44px; }
  .whJhumka.a { left: 18%; } .whJhumka.b { left: 52%; animation-delay: -1.8s; top: 26px; } .whJhumka.c { left: 84%; animation-delay: -3.1s; }
}
@media (min-width: 1024px) {
  .whJhumka { width: 52px; }
  .whJhumka.a { left: 6%; } .whJhumka.b { left: 50%; } .whJhumka.c { left: 94%; }
  .whLantern { display: block; }
  .whLantern.a { left: 60%; height: auto; width: 54px; top: 0; animation-delay: -2s; }
  .whLantern.b { left: 80%; width: 44px; top: 0; animation-delay: -4.5s; }
}

/* ── layout ──────────────────────────────────────────────────────────── */
.whHeroGrid { position: relative; z-index: 3; flex: 1; display: flex; flex-direction: column; width: 100%; padding: 86px 16px 104px; }
@media (min-width: 768px) { .whHeroGrid { padding: 116px 32px 40px; } }
@media (min-width: 1024px) { .whHeroGrid { flex-direction: row; align-items: stretch; max-width: 1680px; margin: 0 auto; padding: 0 clamp(28px, 4.5vw, 96px); } }

.whCopy { position: relative; text-align: center; max-width: 640px; margin: 0 auto; }
@media (min-width: 1024px) {
  .whCopy { flex: 0 0 min(46%, 640px); align-self: center; text-align: left; margin: 0; padding: 124px 0 120px; }
  .whCopy::before { content: ""; position: absolute; inset: 8% -18% 8% -30%; z-index: -1; pointer-events: none;
    background: radial-gradient(closest-side, rgba(255,250,244,.92), rgba(255,250,244,.6) 55%, rgba(255,250,244,0)); }
}
.whKicker { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 14px; padding: 8px 14px; border-radius: 999px;
  font: 700 11px/1 var(--sans); letter-spacing: .16em; text-transform: uppercase; color: var(--accent);
  background: rgba(255,255,255,.72); box-shadow: inset 0 0 0 1px rgba(201,168,76,.45), 0 8px 20px -14px rgba(139,90,43,.5); }
.whKicker [lang="hi"] { font-family: var(--deva); font-size: 14px; letter-spacing: 0; text-transform: none; color: var(--maroon); }
.whKickerDot { color: var(--gold); font-size: 10px; }
.whH1 { margin: 0; font: 700 clamp(31px, 9vw, 44px)/1.05 var(--serif); letter-spacing: -.018em; color: var(--maroon); text-wrap: balance; }
@media (min-width: 600px) { .whH1 { font-size: clamp(40px, 7.2vw, 62px); } }
@media (min-width: 1024px) { .whH1 { font-size: clamp(42px, 4.7vw, 84px); } }
.whFoil { display: inline; font-style: italic; font-weight: 600;
  background: linear-gradient(100deg, #8b5a2b 0%, #b8862f 22%, #f3d98a 38%, #c9a84c 50%, #8b5a2b 70%, #c9a84c 100%); background-size: 240% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-box-decoration-break: clone; box-decoration-break: clone;
  animation: whFoil 6s ease-in-out infinite; }
@keyframes whFoil { 0%, 100% { background-position: 100% 0; } 50% { background-position: 0% 0; } }
.whLead { margin: 14px auto 0; max-width: 560px; font-size: 15px; line-height: 1.6; color: var(--muted); text-wrap: pretty; }
.whLeadMore { display: none; }
@media (min-width: 600px) { .whLeadMore { display: inline; } .whLead { font-size: 16.5px; } }
@media (min-width: 1024px) { .whLead { margin-left: 0; font-size: 18px; max-width: 540px; } }
.whCopy .whCtas { justify-content: center; margin-top: 20px; }
@media (min-width: 1024px) { .whCopy .whCtas { justify-content: flex-start; margin-top: 28px; } }
.whTrust { list-style: none; display: none; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 20px 0 0; padding: 0; }
@media (min-width: 768px) { .whTrust { display: flex; } }
@media (min-width: 1024px) { .whTrust { justify-content: flex-start; } }
.whTrust li { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 650; color: var(--maroon);
  background: rgba(255,255,255,.66); box-shadow: inset 0 0 0 1px rgba(201,168,76,.32); }
.whTrust svg { color: var(--accent); }

/* ── the scene ───────────────────────────────────────────────────────── */
.whScene { position: relative; flex: 1; min-height: 340px; margin: 6px -16px 0; }
@media (min-width: 768px) { .whScene { min-height: 380px; margin: 12px -32px 0; } }
@media (min-width: 1024px) { .whScene { margin: 0; min-height: 0; } }
.whFanWrap { position: absolute; left: 50%; bottom: 14%; height: 66%; aspect-ratio: 1000 / 520; transform: translateX(-50%); }
.whFan { display: block; width: 100%; height: 100%; overflow: visible; transform-origin: 50% 96%; animation: whFanSway 8s ease-in-out infinite; }
@keyframes whFanSway { 0%, 100% { transform: rotate(-1.4deg); } 50% { transform: rotate(1.4deg); } }
.whFea { transform-origin: 500px 500px; transform: rotate(0deg) scale(.25); opacity: 0;
  transition: transform 1.6s cubic-bezier(.2,.9,.25,1) var(--d), opacity .7s ease var(--d); }
.whFea.short { filter: saturate(1.15); }
.is-entered .whFea { transform: rotate(var(--a)) scale(1); opacity: 1; }
.is-entered .whFea.short { transform: rotate(var(--a)) scale(.7); }
.whEyeGlint { animation: whGlint 3.2s ease-in-out infinite; }
@keyframes whGlint { 0%, 100% { opacity: .2; } 50% { opacity: 1; } }
.whHalo { position: absolute; left: 50%; bottom: 10%; width: 70%; aspect-ratio: 1; transform: translateX(-50%); border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,250,232,.95), rgba(255,236,190,.5) 45%, rgba(255,236,190,0)); }

.whCoupleBox { position: absolute; left: 50%; bottom: 0; height: 86%; aspect-ratio: 446 / 800; transform: translateX(-50%); z-index: 2; }
.whHeroCouple { display: block; width: 100%; height: 100%; object-fit: contain; object-position: 50% 100%;
  filter: drop-shadow(0 18px 18px rgba(90,30,20,.22)); transform: translateY(14px); transition: transform 1.4s cubic-bezier(.2,.9,.25,1) .5s; }
.is-entered .whHeroCouple { transform: none; }

.whPeaStand, .whPeaFlowers, .whPeaPerch { position: absolute; z-index: 1; }
.whPeaStand img, .whPeaFlowers img, .whPeaPerch img { display: block; width: 100%; height: 100%; object-fit: contain; }
.whPeaStand { left: -7%; bottom: -2%; height: 44%; aspect-ratio: 520 / 593; z-index: 3; }
.whPeaStand img { transform: scaleX(-1) translateX(14%); opacity: 0; transition: transform 1.3s cubic-bezier(.2,.9,.25,1) .7s, opacity .8s ease .7s; transform-origin: 50% 100%; }
.is-entered .whPeaStand img { transform: scaleX(-1); opacity: 1; animation: whPeck 9s ease-in-out 2.6s infinite; }
@keyframes whPeck { 0%, 70%, 100% { transform: scaleX(-1) rotate(0); } 76% { transform: scaleX(-1) rotate(-3deg); } 82% { transform: scaleX(-1) rotate(1deg); } }
.whPeaFlowers { right: -4%; top: 0; height: 60%; aspect-ratio: 304 / 560; }
.whPeaFlowers img { transform: scaleX(-1) translateY(-10%); opacity: 0; transition: transform 1.4s cubic-bezier(.2,.9,.25,1) .9s, opacity .9s ease .9s; transform-origin: 50% 0; }
.is-entered .whPeaFlowers img { transform: scaleX(-1); opacity: 1; animation: whSwayFlip 7s ease-in-out 2.6s infinite; }
@keyframes whSwayFlip { 0%, 100% { transform: scaleX(-1) rotate(-1.6deg); } 50% { transform: scaleX(-1) rotate(1.6deg); } }
.whPeaPerch { display: none; }

@media (min-width: 768px) {
  .whFanWrap { height: 70%; }
  .whCoupleBox { height: 84%; }
  .whPeaStand { left: 2%; height: 46%; }
  .whPeaFlowers { right: 2%; height: 64%; }
}
@media (min-width: 1024px) {
  .whScene { margin-top: 70px; }
  .whFanWrap { left: 52%; bottom: 22%; height: 62%; }
  .whHalo { left: 52%; bottom: 18%; width: 64%; }
  .whCoupleBox { left: 52%; bottom: 13%; height: 70%; }
  .whPeaStand { left: -4%; bottom: 10%; height: 40%; }
  .whPeaFlowers { right: 6%; top: 4%; height: 48%; }
  .whPeaPerch { display: block; right: -3%; bottom: 13%; height: 42%; aspect-ratio: 274 / 560; z-index: 3; }
  .whPeaPerch img { transform: scaleX(-1); }
}

/* ── terrace, peonies, petals ────────────────────────────────────────── */
.whTerrace { position: absolute; left: -40px; right: -40px; bottom: 70px; height: 116px; z-index: 2; pointer-events: none;
  background: url(${LUX}/balustrade-800.webp) center bottom / auto 100% repeat-x; filter: sepia(.35) saturate(.9) brightness(1.06); }
.whTerrace::after { content: ""; position: absolute; left: 0; right: 0; top: 99%; height: 120px; background: linear-gradient(180deg, #e9dccb, #f1e5d6); }
@media (min-width: 768px) { .whTerrace { bottom: 0; height: 150px; } }
@media (min-width: 1024px) { .whTerrace { height: clamp(140px, 19svh, 210px); background-image: url(${LUX}/balustrade-1600.webp); } }
.whScene .whCoupleBox, .whScene .whPeaStand, .whScene .whPeaPerch { z-index: 4; }
.whHeroGrid { z-index: auto; }
.whCopy { z-index: 6; }
.whScene { z-index: 3; }

.whPeony { position: absolute; z-index: 5; bottom: 40px; width: 34vw; max-width: 240px; aspect-ratio: 360 / 396; background: url(${LUX}/peony-360.webp) center / contain no-repeat; pointer-events: none; }
.whPeony.l { left: -9vw; transform: rotate(16deg); } .whPeony.r { right: -9vw; transform: scaleX(-1) rotate(16deg); }
@media (min-width: 768px) { .whPeony { bottom: -30px; width: 26vw; } }

.whDrift { position: absolute; inset: 0; z-index: 5; pointer-events: none; overflow: hidden; }
.whDrift i { position: absolute; top: -8%; opacity: 0; background: center / contain no-repeat; animation: whFall linear infinite; will-change: transform; }
.whDrift i.marigold { background-image: url(${ART}/openings/_shared/petal-marigold.webp); }
.whDrift i.rose { background-image: url(${ART}/openings/_shared/petal-rose.webp); }
.whDrift i.feather { background-image: url(${LUX}/feather-108.webp); }
.whDrift i.wide { display: none; }
@media (min-width: 768px) { .whDrift i.wide { display: block; } }
@keyframes whFall {
  0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg); }
  8% { opacity: .95; }
  85% { opacity: .9; }
  100% { opacity: 0; transform: translate3d(var(--dx), 110svh, 0) rotate(var(--spin)); }
}

.whCue { display: none; }
@media (min-width: 1024px) {
  .whCue { position: absolute; z-index: 8; left: 50%; bottom: 20px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 16px;
    border-radius: 999px; font: 700 12px/1 var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--maroon); text-decoration: none;
    background: rgba(255,250,244,.82); box-shadow: inset 0 0 0 1px rgba(201,168,76,.45); }
  .whCue svg { animation: whBob 2s ease-in-out infinite; }
}
@keyframes whBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
.whHeroFade { position: absolute; left: 0; right: 0; bottom: 0; height: 40px; z-index: 6; pointer-events: none; background: linear-gradient(180deg, rgba(250,242,232,0), var(--page)); }

.whHero picture { display: contents; }

/* off-screen: stop the loops */
.whHero.is-off .whRays, .whHero.is-off .whCloud, .whHero.is-off .whStrand, .whHero.is-off .whJhumka, .whHero.is-off .whLantern,
.whHero.is-off .whFan, .whHero.is-off .whDrift i, .whHero.is-off .whFoil, .whHero.is-off .whEyeGlint, .whHero.is-off img { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .whRays, .whCloud, .whStrand, .whJhumka, .whLantern, .whFan, .whFoil, .whEyeGlint, .whCue svg { animation: none; }
  .whDrift { display: none; }
  .whFea, .whHeroCouple, .whPeaStand img, .whPeaFlowers img { transition: none; }
  .whFea { transform: rotate(var(--a)) scale(1); opacity: 1; }
  .whFea.short { transform: rotate(var(--a)) scale(.7); }
  .whHeroCouple { transform: none; }
  .whPeaStand img, .whPeaFlowers img { transform: scaleX(-1); opacity: 1; animation: none !important; }
  .px0, .px1, .px2, .px3, .px4 { translate: none; }
}
`;
