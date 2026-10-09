// "The Premiere" — one stylesheet for every scene. Palette (research §D.2): projector black #0B0B0D, silver
// screen #E9E6DF, marquee gold #D8B25A, velvet red #8E1B22. Type: Bodoni Moda (--pr-display) + Courier Prime
// (--pr-mono). Motion: transforms/opacity/clip-path only; the house curve cubic-bezier(.22,1,.36,1).
//
// The letterbox: the root carries --pr-bt / --pr-bb (top/bottom bar heights) by class:
//   pr-bars-film  phones: a slim top bar (clear of the editor/top chrome) + a deeper bottom bar that holds the
//                 controls; landscape: true 2.39:1 scope bars.
//   pr-bars-scope the question: a thin scope band across the middle of the phone.
//   pr-bars-off   leader, the yes reveal, the credits.
// Bars are plain black under the scenes; every scene clips its picture to the frame between them, so "the bars
// sweep open" is just the frame's clip-path animating to inset(0).

export const PREMIERE_CSS = `
.pr-root { --pr-black: #0B0B0D; --pr-screen: #E9E6DF; --pr-gold: #D8B25A; --pr-gold2: #F3D58C; --pr-velvet: #8E1B22;
  --pr-ease: cubic-bezier(.22,1,.36,1); --pr-ease-io: cubic-bezier(.65,0,.35,1);
  --pr-top: max(56px, 7svh, calc(var(--vw-top-space, 0px) + 6px));
  --pr-bt: var(--pr-top); --pr-bb: calc(max(108px, 13svh) + env(safe-area-inset-bottom, 0px));
  position: fixed; inset: 0; z-index: 2; overflow: hidden; color: var(--pr-screen); background: #000;
  font-family: var(--pr-mono), "Courier New", monospace; -webkit-tap-highlight-color: transparent; }
.pr-root.pr-bars-scope { --pr-bt: max(calc(var(--pr-top) + 9svh), 22svh); --pr-bb: max(calc(108px + env(safe-area-inset-bottom, 0px)), 27svh); }
.pr-root.pr-bars-off { --pr-bt: 0px; --pr-bb: 0px; }
/* tablets in portrait: the shared music chip sits bottom-right, so the controls ride high in a deeper bar */
@media (min-width: 700px) and (max-aspect-ratio: 1/1) {
  .pr-root:not(.pr-bars-off):not(.pr-bars-scope) { --pr-bb: calc(max(180px, 17svh) + env(safe-area-inset-bottom, 0px)); }
  .pr-dock { align-content: start; padding-top: 20px; }
}
@media (min-aspect-ratio: 1/1) {
  .pr-root { --pr-bt: max(64px, calc(var(--vw-top-space, 0px) + 8px), calc((100svh - 100vw / 2.39) / 2));
    --pr-bb: max(104px, calc((100svh - 100vw / 2.39) / 2)); }
  .pr-root.pr-bars-scope { --pr-bt: max(64px, calc(var(--vw-top-space, 0px) + 8px), calc((100svh - 100vw / 2.9) / 2)); --pr-bb: max(120px, calc((100svh - 100vw / 2.9) / 2)); }
  .pr-root.pr-bars-off { --pr-bt: 0px; --pr-bb: 0px; }
  .pr-root.pr-bars-page { --pr-bt: max(64px, calc(var(--vw-top-space, 0px) + 8px)); --pr-bb: 108px; }
}
.pr-back { position: absolute; inset: 0; z-index: 0; }
.pr-bar { position: absolute; left: 0; right: 0; height: 50svh; z-index: 1; background: #000; pointer-events: none;
  transition: transform 1.25s var(--pr-ease); }
.pr-bar.top { top: 0; transform: translateY(calc(var(--pr-bt) - 50svh)); box-shadow: 0 1px 0 rgba(233,230,223,.05); }
.pr-bar.bot { bottom: 0; transform: translateY(calc(50svh - var(--pr-bb))); box-shadow: 0 -1px 0 rgba(233,230,223,.05); }
.pr-stage { position: absolute; inset: 0; z-index: 2; }
.pr-scene { position: absolute; inset: 0; }
.pr-frame { position: absolute; inset: 0; clip-path: inset(var(--pr-bt) 0 var(--pr-bb) 0); transition: clip-path 1.25s var(--pr-ease); }
.pr-in { position: absolute; left: 0; right: 0; top: var(--pr-bt); bottom: var(--pr-bb); transition: top 1.25s var(--pr-ease), bottom 1.25s var(--pr-ease); }
.pr-dock { position: absolute; left: 0; right: 0; bottom: 0; height: var(--pr-bb); min-height: calc(104px + env(safe-area-inset-bottom, 0px));
  display: grid; place-items: center; align-content: center; gap: 10px; padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px)); z-index: 5; }
.pr-slate { position: absolute; z-index: 6; top: max(12px, env(safe-area-inset-top, 0px)); left: 66px; height: 44px; display: flex; align-items: center; gap: 10px;
  font: 700 10.5px/1 var(--pr-mono), monospace; letter-spacing: .26em; text-transform: uppercase; color: rgba(233,230,223,.62); pointer-events: none; }
.pr-slate i { width: 6px; height: 6px; border-radius: 50%; background: var(--pr-velvet); box-shadow: 0 0 10px rgba(220,60,60,.8); animation: pr-rec 1.6s steps(2) infinite; }
@keyframes pr-rec { 50% { opacity: .25; } }

/* ── type ── */
.pr-eyebrow { font: 700 11px/1.2 var(--pr-mono), monospace; letter-spacing: .32em; text-transform: uppercase; color: rgba(233,230,223,.7); }
.pr-display { font-family: var(--pr-display), "Bodoni 72", Didot, Georgia, serif; font-weight: 400; letter-spacing: -.02em; line-height: .95; text-wrap: balance; }
.pr-it { font-style: italic; }
.pr-foilw [data-w] > span { padding: 0 .04em; background: linear-gradient(105deg, #9a7634 0%, #e8cf8a 32%, #fff4cf 48%, #d8b25a 62%, #8a6a2f 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.pr-foil { background: linear-gradient(105deg, #8a6a2f 0%, #e8cf8a 30%, #fff4cf 46%, #d8b25a 58%, #7a5a22 100%); background-size: 220% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent; animation: pr-foil 7s ease-in-out infinite; }
@keyframes pr-foil { 0%, 100% { background-position: 100% 0; } 50% { background-position: 0 0; } }
.pr-sub { font: 400 clamp(16px, 4.3vw, 22px)/1.42 var(--pr-mono), monospace; color: #FFF8E7; text-align: center; text-wrap: balance;
  text-shadow: 0 1px 2px rgba(0,0,0,.9), 0 0 18px rgba(0,0,0,.65); max-width: 30ch; margin: 0 auto; }
.pr-sub b { color: var(--pr-gold2); font-weight: 700; }
.pr-hint { font: 400 11px/1 var(--pr-mono), monospace; letter-spacing: .22em; text-transform: uppercase; color: rgba(233,230,223,.55); }

/* ── buttons ── */
.pr-root .pr-cta { min-height: 54px !important; padding: 0 30px !important; border-radius: 3px !important; font: 700 13.5px/1 var(--pr-mono), "Courier New", monospace !important;
  letter-spacing: .2em !important; text-transform: uppercase; }
.pr-root .pr-cta > span:first-child { border-radius: 2px !important; }
.pr-ghost { all: unset; cursor: pointer; min-height: 48px; padding: 0 22px; display: inline-grid; place-items: center; box-sizing: border-box;
  font: 700 13px/1.1 var(--pr-mono), monospace; letter-spacing: .16em; text-transform: uppercase; color: rgba(233,230,223,.82);
  border: 1px solid rgba(233,230,223,.28); border-radius: 2px; transition: transform .25s var(--pr-ease), border-color .25s, background .25s; }
.pr-ghost:active { transform: translateY(1px) scale(.98); }
.pr-ghost:focus-visible, .pr-link:focus-visible { outline: 2px solid var(--pr-gold); outline-offset: 3px; }
.pr-link { all: unset; cursor: pointer; min-height: 44px; padding: 0 10px; display: inline-flex; align-items: center; font: 700 11px/1 var(--pr-mono), monospace;
  letter-spacing: .22em; text-transform: uppercase; color: rgba(233,230,223,.62); }

/* ── stills ── */
.pr-still { position: absolute; inset: 0; overflow: hidden; background: #070707; }
.pr-still-fill { position: absolute; inset: -8%; display: none; filter: blur(34px) brightness(.42) saturate(.9); transform: scale(1.1); }
.pr-still-main { position: absolute; inset: 0; will-change: transform; }
.pr-still-layer { position: absolute; inset: 0; }
.pr-still-tint { position: absolute; inset: 0; pointer-events: none; }
.pr-still-vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,.5) 100%); }
@media (min-aspect-ratio: 1/1) {
  .pr-still-fill { display: block; }
  .pr-still-main { --w: min(100%, calc((100svh - var(--pr-bt) - var(--pr-bb)) * .86)); left: 50%; right: auto; width: var(--w); margin-left: calc(var(--w) / -2);
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 16%, #000 84%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0, #000 16%, #000 84%, transparent 100%); }
}
@keyframes pr-kb-in { from { transform: scale(1.03); } to { transform: scale(1.13) translate3d(-1.2%, -1%, 0); } }
@keyframes pr-kb-out { from { transform: scale(1.16) translate3d(1.2%, 1%, 0); } to { transform: scale(1.03); } }

/* ── gate: the ticket ── */
.pr-gate .pm-gateName { font-family: var(--pr-display), Didot, Georgia, serif !important; font-style: italic; font-weight: 400 !important; letter-spacing: -.02em; }
.pr-gate .pm-gateKick { font-family: var(--pr-mono), monospace !important; letter-spacing: .3em; }
.pr-gate .pm-gateName { font-size: clamp(68px, 21vw, 132px) !important; line-height: .95 !important; }
.pr-gate .pm-gateCta { align-content: center; border-radius: 3px !important; font: 700 14px/1 var(--pr-mono), monospace !important; letter-spacing: .2em !important; text-transform: uppercase; background: linear-gradient(105deg, #8a6a2f, #e8cf8a 40%, #fff4cf 50%, #c9a45c 60%, #7a5a22) !important; color: #1a1206 !important; }
.pr-gate .pm-gateArt { aspect-ratio: auto !important; max-height: none !important; width: min(330px, 80vw) !important; }
.pr-gate .pm-seal, .pr-gate .pm-quiet { font-family: var(--pr-mono), monospace !important; }
.pr-gate .pm-sealWax { background: radial-gradient(circle at 35% 30%, #c2433d, #8E1B22 55%, #5a0d12) !important; }
@media (min-width: 1024px) { .pr-gate .pm-gateArt { width: 420px !important; } }
.pr-ticket { position: relative; display: grid; grid-template-columns: 1fr 64px; width: 100%; aspect-ratio: 2.25; color: #2a1a12; text-align: left;
  background:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
    linear-gradient(160deg, #F6EEDC 0%, #EDE1C6 60%, #E3D3B1 100%);
  -webkit-mask: radial-gradient(circle 9px at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 9px at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat;
          mask: radial-gradient(circle 9px at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 9px at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat; }
.pr-tkMain { display: grid; align-content: space-between; padding: 14px 10px 12px 22px; min-width: 0; border-right: 2px dotted rgba(80,50,30,.35); }
.pr-tkAdmit { font: 700 10px/1 var(--pr-mono), monospace; letter-spacing: .38em; text-transform: uppercase; color: var(--pr-velvet); }
.pr-tkTitle { font-family: var(--pr-display), Didot, Georgia, serif; font-style: italic; font-size: clamp(22px, 6.6vw, 29px); line-height: 1; letter-spacing: -.01em; overflow-wrap: anywhere;
  background: linear-gradient(105deg, #6d4f19, #b48a3a 35%, #e9cf86 50%, #9d7428 65%, #5b400f); -webkit-background-clip: text; background-clip: text; color: transparent; }
.pr-tkMeta { font: 700 9.5px/1.3 var(--pr-mono), monospace; letter-spacing: .2em; color: rgba(42,26,18,.72); text-transform: uppercase; }
.pr-tkStub { display: grid; place-items: center; }
.pr-tkStub span { writing-mode: vertical-rl; font: 700 10px/1 var(--pr-mono), monospace; letter-spacing: .3em; color: var(--pr-velvet); }

/* ── leader ── */
.pr-leader { position: absolute; inset: 0; display: grid; place-items: center; background: radial-gradient(70% 60% at 50% 50%, #3a3731 0%, #1d1b18 70%, #0d0c0b 100%); overflow: hidden; }
.pr-leader.is-black { background: #000; }
.pr-flicker { position: absolute; inset: 0; pointer-events: none; background: rgba(255,248,230,.05); animation: pr-flick .24s steps(3) infinite; }
@keyframes pr-flick { 0% { opacity: .2; } 33% { opacity: .9; } 66% { opacity: .45; } }
.pr-scratch { position: absolute; top: -5%; bottom: -5%; width: 1px; background: rgba(255,250,235,.35); animation: pr-scr 1.3s steps(5) infinite; }
.pr-scratch.b { animation-duration: .9s; animation-delay: -.4s; opacity: .5; }
@keyframes pr-scr { 0% { left: 18%; } 20% { left: 62%; } 40% { left: 31%; } 60% { left: 77%; } 80% { left: 44%; } 100% { left: 12%; } }
@property --pr-sweep { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.pr-dial { position: relative; width: min(78vw, 62svh); aspect-ratio: 1; display: grid; place-items: center; }
.pr-dial::before, .pr-dial::after { content: ""; position: absolute; border-radius: 50%; border: 2px solid rgba(233,230,223,.62); }
.pr-dial::before { inset: 0; } .pr-dial::after { inset: 9%; border-width: 1.5px; opacity: .7; }
.pr-sweep { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(rgba(233,230,223,.2) var(--pr-sweep), transparent 0); animation: pr-sweep .9s linear; }
@keyframes pr-sweep { from { --pr-sweep: 0deg; } to { --pr-sweep: 360deg; } }
.pr-cross { position: absolute; background: rgba(233,230,223,.5); }
.pr-cross.h { left: -30vw; right: -30vw; top: 50%; height: 1.5px; } .pr-cross.v { top: -30svh; bottom: -30svh; left: 50%; width: 1.5px; }
.pr-num { position: relative; font-family: var(--pr-display), Didot, serif; font-size: min(52vw, 42svh); line-height: 1; color: #F2EEE4; text-shadow: 0 0 40px rgba(255,240,200,.25);
  animation: pr-num .9s var(--pr-ease) both; }
@keyframes pr-num { 0% { opacity: 0; transform: scale(1.12); } 12% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }
.pr-true { position: relative; font: 400 clamp(17px, 4.6vw, 24px)/1.3 var(--pr-mono), monospace; letter-spacing: .04em; color: #EDE8DC; }
.pr-caret { display: inline-block; width: .55em; height: 1.05em; margin-left: 2px; vertical-align: -.15em; background: currentColor; animation: pr-rec .9s steps(2) infinite; }

/* ── titles ── */
.pr-center { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 18px; padding: 24px; text-align: center; }
.pr-title { font-size: clamp(48px, 15vw, 132px); max-width: 11ch; margin: 0; padding-bottom: .08em; }
.pr-rule { width: 64px; height: 1px; background: linear-gradient(90deg, transparent, var(--pr-gold), transparent); }
.pr-tagline { font-family: var(--pr-display), Didot, serif; font-style: italic; font-size: clamp(17px, 4.6vw, 24px); line-height: 1.3; color: rgba(233,230,223,.82); max-width: 26ch; text-wrap: balance; margin: 0; }
.pr-fade { animation: pr-fade 1.2s var(--pr-ease) both; }
@keyframes pr-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.pr-blurin { animation: pr-blurin 1.6s var(--pr-ease) both; }
@keyframes pr-blurin { from { opacity: 0; filter: blur(10px); letter-spacing: .6em; } to { opacity: 1; filter: blur(0); } }

/* ── acts ── */
.pr-actcard { position: absolute; left: 20px; top: 18px; display: grid; gap: 6px; text-align: left; z-index: 3; text-shadow: 0 1px 14px rgba(0,0,0,.6); }
.pr-actname { font-family: var(--pr-display), Didot, serif; font-style: italic; font-size: clamp(30px, 8.4vw, 54px); line-height: 1; letter-spacing: -.02em; }
.pr-subwrap { position: absolute; left: 0; right: 0; bottom: 22px; padding: 0 18px; z-index: 3; }
.pr-scrim { position: absolute; inset: auto 0 0 0; height: 46%; background: linear-gradient(transparent, rgba(0,0,0,.62)); pointer-events: none; z-index: 2; }
.pr-scrim.top { inset: 0 0 auto 0; height: 30%; background: linear-gradient(rgba(0,0,0,.5), transparent); }
.pr-af { position: absolute; inset: 22% 16%; z-index: 3; pointer-events: none; transition: inset .7s var(--pr-ease); }
.pr-af i { position: absolute; width: 26px; height: 26px; border: 0 solid rgba(255,255,255,.75); transition: border-color .4s, width .4s, height .4s; }
.pr-af i:nth-child(1) { left: 0; top: 0; border-left-width: 2px; border-top-width: 2px; }
.pr-af i:nth-child(2) { right: 0; top: 0; border-right-width: 2px; border-top-width: 2px; }
.pr-af i:nth-child(3) { left: 0; bottom: 0; border-left-width: 2px; border-bottom-width: 2px; }
.pr-af i:nth-child(4) { right: 0; bottom: 0; border-right-width: 2px; border-bottom-width: 2px; }
.pr-af.is-lock { inset: 27% 22%; } .pr-af.is-lock i { border-color: var(--pr-gold2); width: 34px; height: 34px; }
.pr-af.is-gone { opacity: 0; transition: opacity .8s .9s, inset .7s var(--pr-ease); }
.pr-ring { position: relative; width: min(330px, calc(100vw - 48px)); height: 46px; overflow: hidden; touch-action: none; cursor: ew-resize; border-radius: 3px;
  background: linear-gradient(180deg, #1c1b19, #0c0c0b 50%, #1c1b19); box-shadow: inset 0 1px 0 rgba(255,255,255,.1), inset 0 -1px 0 rgba(0,0,0,.6), 0 10px 26px -12px rgba(0,0,0,.9);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent); mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent); }
.pr-ringTrack { position: absolute; top: 0; bottom: 0; left: -600px; right: -600px; will-change: transform;
  background: repeating-linear-gradient(90deg, rgba(233,230,223,.55) 0 1px, transparent 1px 12px) 0 6px / 100% 9px no-repeat,
              repeating-linear-gradient(90deg, rgba(233,230,223,.9) 0 1.5px, transparent 1.5px 60px) 0 4px / 100% 14px no-repeat; }
.pr-ringNums { position: absolute; left: 0; right: 0; bottom: 6px; display: flex; font: 700 10px/1 var(--pr-mono), monospace; color: rgba(233,230,223,.75); }
.pr-ringNums span { flex: 0 0 60px; text-indent: -4px; }
.pr-ringIdx { position: absolute; left: 50%; top: 0; width: 0; height: 0; margin-left: -6px; border: 6px solid transparent; border-top: 8px solid var(--pr-gold); z-index: 2; }
.pr-ringBtn { all: unset; position: absolute; inset: 0; cursor: ew-resize; }
.pr-ringBtn:focus-visible { outline: 2px solid var(--pr-gold); outline-offset: -2px; }
.pr-hold { all: unset; position: relative; width: 78px; height: 78px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; touch-action: none;
  -webkit-touch-callout: none; user-select: none; background: radial-gradient(circle at 50% 40%, #2a2724, #0e0d0c 70%); box-shadow: 0 0 0 1px rgba(233,230,223,.18), 0 16px 34px -14px rgba(0,0,0,.9); }
.pr-hold svg { position: absolute; inset: -6px; width: calc(100% + 12px); height: calc(100% + 12px); transform: rotate(-90deg); }
.pr-hold .pr-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--pr-velvet); box-shadow: 0 0 0 4px rgba(142,27,34,.25), 0 0 18px rgba(220,60,60,.6); transition: transform .3s var(--pr-ease); }
.pr-hold.is-on .pr-dot { transform: scale(1.35); }
.pr-hold:focus-visible { outline: 2px solid var(--pr-gold); outline-offset: 6px; }
.pr-fps { position: absolute; right: 18px; top: 18px; z-index: 3; font: 700 11px/1 var(--pr-mono), monospace; letter-spacing: .2em; color: var(--pr-gold2); opacity: 0; transition: opacity .3s; }
.pr-fps.is-on { opacity: 1; }
.pr-word { display: inline-block; opacity: 0; transform: translateY(6px); filter: blur(4px); transition: opacity .6s var(--pr-ease), transform .6s var(--pr-ease), filter .6s var(--pr-ease); }
.pr-word.is-on { opacity: 1; transform: none; filter: none; }
.pr-flash { position: absolute; inset: 0; z-index: 8; background: #FFF7E8; pointer-events: none; opacity: 0; }
.pr-flash.is-on { animation: pr-flash .5s ease-out; }
@keyframes pr-flash { 0% { opacity: .9; } 100% { opacity: 0; } }

/* ── trailer ── */
.pr-trailer { position: absolute; inset: 0; touch-action: pan-y; cursor: grab; }
.pr-tcard { position: absolute; inset: 0; display: grid; place-items: center; padding: 24px; text-align: center; background: radial-gradient(70% 45% at 50% 50%, rgba(0,0,0,.45), transparent 75%); }
.pr-tkick { position: absolute; top: 22px; left: 0; right: 0; text-align: center; }
.pr-ttext { font-family: var(--pr-display), Didot, serif; text-transform: uppercase; letter-spacing: .06em; font-size: clamp(30px, 9.6vw, 84px); line-height: 1.02; max-width: 12ch; text-wrap: balance;
  text-shadow: 0 2px 30px rgba(0,0,0,.6); animation: pr-slam .9s var(--pr-ease) both; }
@keyframes pr-slam { from { opacity: 0; transform: scale(1.14); letter-spacing: .3em; } to { opacity: 1; transform: none; } }
.pr-ticks { display: flex; gap: 6px; }
.pr-ticks i { width: 22px; height: 2px; background: rgba(233,230,223,.22); transition: background .4s; }
.pr-ticks i.is-on { background: var(--pr-gold); }

/* ── commentary ── */
.pr-comm { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 22px; padding: 24px 20px; text-align: center; }
.pr-comm h2 { margin: 0; font-size: clamp(34px, 10vw, 64px); }
.pr-voice { width: min(420px, 100%); }
.pr-quote { font: 400 clamp(17px, 4.6vw, 22px)/1.5 var(--pr-mono), monospace; color: #FFF8E7; max-width: 26ch; margin: 0 auto; text-wrap: balance; }
.pr-quote cite { display: block; margin-top: 14px; font-style: normal; font-size: 11px; letter-spacing: .3em; color: var(--pr-gold); text-transform: uppercase; }

/* ── the script (letter) ── */
.pr-scriptWrap { position: absolute; inset: 10px 0 0; display: flex; justify-content: center; }
.pr-sheet { position: relative; width: min(560px, calc(100% - 28px)); height: 100%; }
.pr-paper { position: relative; width: 100%; height: 100%; overflow-y: auto; overscroll-behavior: contain; color: #1E1A17;
  padding: 26px 22px 40px 46px; box-sizing: border-box; border-radius: 2px 2px 0 0; scrollbar-width: none;
  background:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .14 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
    linear-gradient(180deg, #F7F1E4, #F1E8D6);
  box-shadow: 0 30px 60px -20px rgba(0,0,0,.85), inset 0 0 60px rgba(120,90,40,.12); }
.pr-paper::-webkit-scrollbar { display: none; }
.pr-holes { position: absolute; left: 14px; top: 0; bottom: 0; z-index: 2; display: grid; align-content: space-around; pointer-events: none; }
.pr-holes i { width: 13px; height: 13px; border-radius: 50%; background: radial-gradient(circle at 50% 40%, #0b0b0d 55%, #3a332a 70%, transparent 72%); }
.pr-holes i:nth-child(odd) { width: 12px; height: 12px; box-shadow: 0 0 0 2px #c9a24f, 0 1px 3px 2px rgba(0,0,0,.35); background: radial-gradient(circle at 40% 35%, #f3dc98, #b38a36 60%, #6d5016); }
.pr-pg { position: absolute; right: 22px; top: 22px; font: 400 14px/1 var(--pr-mono), monospace; }
.pr-sl { font: 700 14px/1.5 var(--pr-mono), monospace; text-transform: uppercase; margin: 22px 0 18px; letter-spacing: .02em; }
.pr-cue { font: 400 15px/1.4 var(--pr-mono), monospace; text-transform: uppercase; text-align: center; margin: 14px 0 2px; padding-left: 8%; }
.pr-paren { font: 400 14px/1.4 var(--pr-mono), monospace; text-align: center; margin: 0 0 8px; padding-left: 8%; }
.pr-dlg { font: 400 14.5px/1.58 var(--pr-mono), monospace; max-width: 36ch; margin: 0 auto 14px; padding-left: 4%; white-space: pre-line; transition: opacity .7s var(--pr-ease), transform .7s var(--pr-ease); }
.pr-dlg.is-wait { opacity: 0; transform: translateY(8px); max-height: 0; margin: 0 auto; overflow: hidden; }
.pr-act { font: 400 15px/1.55 var(--pr-mono), monospace; margin: 22px 0 6px; transition: opacity .7s; }
.pr-more { all: unset; cursor: pointer; display: block; width: 100%; text-align: center; padding: 14px 0 4px; font: 700 11px/1 var(--pr-mono), monospace; letter-spacing: .24em; text-transform: uppercase; color: rgba(30,26,23,.55); }

/* ── the question ── */
.pr-q { position: absolute; inset: 0; display: grid; place-items: center; padding: 6px 18px; text-align: center; transition: transform 1.1s var(--pr-ease), opacity .6s; }
.pr-q h2 { margin: 0; font-size: clamp(40px, 11.5vw, 124px); max-width: 13ch; line-height: .98; }
.pr-q.is-rolling { transform: scale(1.06); }
.pr-q.is-rolling h2 { text-shadow: 0 0 40px rgba(243,213,140,.55); }
.pr-q.is-gone { opacity: 0; }
.pr-choices { position: relative; display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; min-height: 56px; }
.pr-no { max-width: 168px; min-height: 54px; padding: 6px 16px; font-size: 11.5px; letter-spacing: .12em; line-height: 1.25; text-align: center; transition: transform .45s cubic-bezier(.3,1.4,.5,1), opacity .3s; }
.pr-choices { flex-direction: column; gap: 12px; }
.pr-cut { display: grid; gap: 6px; justify-items: center; }
.pr-cut small { font: italic 400 12px/1.3 var(--pr-mono), monospace; color: rgba(233,230,223,.7); }
.pr-please { position: absolute; z-index: 4; right: 14px; bottom: 10px; }
.pr-yes { position: absolute; inset: 0; z-index: 3; opacity: 0; transition: opacity .5s; pointer-events: none; }
.pr-yes.is-on { opacity: 1; pointer-events: auto; }
.pr-yesFrame { position: absolute; inset: 0; clip-path: inset(var(--pr-q-t, 30%) 0 var(--pr-q-b, 30%) 0); transition: clip-path 1.4s var(--pr-ease); }
.pr-yes.is-open .pr-yesFrame { clip-path: inset(0 0 0 0); }
.pr-yesText { position: absolute; left: 0; right: 0; bottom: calc(118px + env(safe-area-inset-bottom, 0px)); display: grid; gap: 14px; justify-items: center; padding: 0 20px; text-align: center; z-index: 3; }
.pr-yesText h2 { margin: 0; font-size: clamp(54px, 15.5vw, 150px); text-shadow: 0 4px 40px rgba(0,0,0,.55); }
.pr-yesScrim { position: absolute; inset: 0; z-index: 2; background: linear-gradient(180deg, rgba(0,0,0,.35) 0%, transparent 28%, transparent 40%, rgba(0,0,0,.78) 100%); pointer-events: none; }

/* ── credits ── */
.pr-credits { position: absolute; inset: 0; overflow: hidden; touch-action: none; cursor: pointer; }
.pr-roll { position: absolute; left: 0; right: 0; top: 0; display: grid; justify-items: center; text-align: center; padding: 0 24px; will-change: transform;
  animation: pr-roll var(--pr-roll-s, 40s) linear both; }
.pr-credits.is-held .pr-roll { animation-play-state: paused; }
@keyframes pr-roll { from { transform: translateY(100svh); } to { transform: translateY(-100%); } }
.pr-cr-block { display: grid; gap: 6px; justify-items: center; margin: 0 0 56px; }
.pr-cr-role { font: 700 10.5px/1.3 var(--pr-mono), monospace; letter-spacing: .3em; text-transform: uppercase; color: rgba(233,230,223,.6); }
.pr-cr-name { font-family: var(--pr-display), Didot, serif; font-size: clamp(28px, 8vw, 46px); line-height: 1.05; letter-spacing: -.01em; }
.pr-cr-as { font: italic 400 13px/1.3 var(--pr-mono), monospace; color: rgba(233,230,223,.66); }
.pr-cr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: min(560px, 100%); text-align: left; margin-bottom: 18px; align-items: baseline; }
.pr-cr-row .pr-cr-role { text-align: right; }
.pr-cr-row span:last-child { font-family: var(--pr-display), Didot, serif; font-size: 19px; line-height: 1.25; }
.pr-cr-still { width: min(250px, 62vw); margin: 10px 0 64px; }
.pr-cr-still figure { margin: 0; background: #f4eee3; padding: 8px 8px 0; box-shadow: 0 24px 50px -20px rgba(0,0,0,.9); }
.pr-cr-still .ph { aspect-ratio: 4 / 5; position: relative; overflow: hidden; }
.pr-cr-still figcaption { font: 400 12px/1.3 var(--pr-mono), monospace; color: #3a2f26; padding: 9px 2px 11px; text-align: left; }
.pr-skip { position: absolute; left: 50%; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); z-index: 6; translate: -50% 0; padding: 0 16px; border-radius: 99px; background: rgba(10,9,8,.72);
  border: 1px solid rgba(233,230,223,.14); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.pr-credits::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 22svh; pointer-events: none; background: linear-gradient(transparent, #000); }
.pr-credits::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 16svh; z-index: 2; pointer-events: none; background: linear-gradient(#000, transparent); }
.pr-end { position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
  -webkit-mask-image: linear-gradient(transparent 0, transparent calc(var(--pr-top) - 4px), #000 calc(var(--pr-top) + 40px)); mask-image: linear-gradient(transparent 0, transparent calc(var(--pr-top) - 4px), #000 calc(var(--pr-top) + 40px)); }
.pr-review .pm-reply { background: rgba(14,12,10,.7); border: 1px solid rgba(216,178,90,.22); border-radius: 4px; }
.pr-review .pm-replyH { font: 400 italic 22px/1.2 var(--pr-display), Didot, serif !important; }
.pr-review .pm-replyIn { background: rgba(233,230,223,.06); color: #F1ECE2; border: 1px solid rgba(233,230,223,.18); border-radius: 3px; font: 400 15px/1.5 var(--pr-mono), monospace; }
.pr-review .pm-replyRow small { font: 400 12px/1 var(--pr-mono), monospace; letter-spacing: .06em; }
.pr-review .pm-replyIn::placeholder { color: rgba(233,230,223,.42); }
.pr-review .pm-replyBtn { border-radius: 3px; color: #1a1206; font: 700 12px/1 var(--pr-mono), monospace; letter-spacing: .18em; text-transform: uppercase;
  background: linear-gradient(105deg, #8a6a2f, #e8cf8a 40%, #fff4cf 50%, #c9a45c 60%, #7a5a22); }
.pr-end::-webkit-scrollbar { display: none; }
.pr-endIn { min-height: 100%; display: grid; justify-items: center; align-content: start; gap: 28px; padding: calc(var(--pr-top) + 28px) 20px calc(48px + env(safe-area-inset-bottom, 0px)); text-align: center; box-sizing: border-box; }
.pr-poster { width: min(260px, 66vw); }
.pr-posterIn { position: relative; aspect-ratio: 2 / 3; overflow: hidden; background: #111; }
.pr-posterIn .t { position: absolute; left: 0; right: 0; bottom: 0; padding: 60px 14px 16px; background: linear-gradient(transparent, rgba(5,4,4,.92) 55%); display: grid; gap: 6px; justify-items: center; }
.pr-posterIn .t b { font-family: var(--pr-display), Didot, serif; font-style: italic; font-weight: 400; font-size: 27px; line-height: 1; color: #fff8e7; }
.pr-posterIn .t small { font: 700 8.5px/1.2 var(--pr-mono), monospace; letter-spacing: .26em; color: var(--pr-gold); text-transform: uppercase; }
.pr-posterIn .k { position: absolute; top: 12px; left: 0; right: 0; font: 700 8.5px/1 var(--pr-mono), monospace; letter-spacing: .3em; color: rgba(255,248,231,.85); text-transform: uppercase; text-shadow: 0 1px 6px rgba(0,0,0,.6); }
.pr-laurel { font: 700 9px/1.25 var(--pr-mono), monospace; letter-spacing: .22em; text-transform: uppercase; color: var(--pr-gold); }
.pr-review { width: min(460px, 100%); text-align: left; }
.pr-ps { width: min(460px, 100%); display: grid; gap: 14px; justify-items: center; padding: 26px 20px; border: 1px solid rgba(216,178,90,.32); background: rgba(10,9,8,.6); }
.pr-ps p { margin: 0; font: 400 15.5px/1.6 var(--pr-mono), monospace; color: #F1EBDD; white-space: pre-line; }
.pr-ps h3 { margin: 0; font-family: var(--pr-display), Didot, serif; font-style: italic; font-weight: 400; font-size: 26px; line-height: 1.1; }

@media (min-aspect-ratio: 1/1) {
  .pr-actcard { left: max(28px, 6vw); top: 26px; }
  .pr-subwrap { bottom: 30px; }
  .pr-af { inset: 18% 34%; } .pr-af.is-lock { inset: 24% 38%; }
  .pr-yesText { bottom: 140px; }
  .pr-endIn { padding-top: 96px; grid-template-columns: minmax(0, 340px) minmax(0, 460px); justify-content: center; align-items: start; column-gap: 64px; text-align: left; }
  .pr-endIn > .pr-endHead { grid-column: 1 / -1; text-align: center; justify-self: center; }
  .pr-endIn > .pr-endPoster { grid-row: span 3; justify-self: end; }
  .pr-endIn > .pr-endFoot { grid-column: 1 / -1; justify-self: center; }
}
@media (min-width: 1024px) and (min-aspect-ratio: 1/1) {
  .pr-sub { font-size: 24px; max-width: 40ch; }
  .pr-title { font-size: clamp(64px, 9vw, 150px); }
  .pr-q h2 { font-size: clamp(56px, 7.4vw, 130px); max-width: 16ch; }
  .pr-ttext { font-size: clamp(44px, 6.4vw, 100px); max-width: 16ch; }
}
@media (prefers-reduced-motion: reduce) {
  .pr-flicker, .pr-scratch, .pr-foil, .pr-slate i, .pr-caret { animation: none !important; }
  .pr-ttext, .pr-num, .pr-fade, .pr-blurin { animation-duration: .01s !important; }
  .pr-still-main { animation: none !important; }
  .pr-roll { animation-duration: 1ms !important; }
}
`;
