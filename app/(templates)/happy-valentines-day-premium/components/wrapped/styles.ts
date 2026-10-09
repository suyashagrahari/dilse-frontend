// "Us, Wrapped" — one stylesheet for the whole story. Transforms + opacity only for motion; every keyframe sits on
// inner elements (never on a wrapper of something `position: fixed`). Reduced motion: no slams, no drift.

export const WRAPPED_CSS = `
.uw-root { position: relative; min-height: 100svh; color: var(--uw-ink); font-family: var(--uw-sans), 'Helvetica Neue', Arial, sans-serif;
  --uw-ease: cubic-bezier(.22,1,.36,1); --uw-top: calc(max(var(--vw-top-space, 0px), 60px) + env(safe-area-inset-top, 0px) + 26px);
  --uw-bottom: calc(env(safe-area-inset-bottom, 0px) + 22px); -webkit-tap-highlight-color: transparent; }
.uw-root * { box-sizing: border-box; }
:where(.uw-root) button { font: inherit; color: inherit; }
.uw-root button:focus-visible { outline: 3px solid currentColor; outline-offset: 3px; }

/* ── The stage: full-bleed on phones, a 9:16 story card with cinematic side space from 768 ── */
.uw-stage { position: fixed; inset: 0; z-index: 2; overflow: hidden; overflow: clip; color: var(--uw-ink); transition: color .5s var(--uw-ease); }
@media (min-width: 768px) {
  .uw-root { --uw-top: 26px; --uw-bottom: 22px; }
  .uw-stage { inset: auto; left: 0; right: 0; margin-inline: auto; top: calc(var(--vw-top-space, 0px) + 28px); bottom: 28px;
    width: min(calc((100svh - var(--vw-top-space, 0px) - 56px) * .5625), 540px); border-radius: 30px;
    box-shadow: 0 0 0 100vmax rgba(10,6,14,.46), 0 50px 120px -30px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.14); }
}

/* ── Story progress bars (top-centre, below the top chrome) ── */
.uw-bars { position: absolute; z-index: 20; left: 18px; right: 18px; top: calc(var(--uw-top) - 20px); display: flex; gap: 4px; pointer-events: none; }
.uw-bar { flex: 1; height: 3px; border-radius: 3px; background: color-mix(in srgb, var(--uw-ink) 22%, transparent); overflow: hidden; }
.uw-bar > i { display: block; height: 100%; width: 100%; background: var(--uw-ink); transform-origin: left; transform: scaleX(0); transition: transform .7s var(--uw-ease); }
.uw-bar.is-done > i { transform: scaleX(1); }
.uw-bars.is-nav { pointer-events: auto; }
.uw-bars.is-nav .uw-bar { border: 0; padding: 0; cursor: pointer; background-clip: content-box; padding-block: 10px; margin-block: -10px; height: 23px; background: none; position: relative; }
.uw-bars.is-nav .uw-bar::before { content: ""; position: absolute; left: 0; right: 0; top: 10px; height: 3px; border-radius: 3px; background: color-mix(in srgb, var(--uw-ink) 22%, transparent); }
.uw-bars.is-nav .uw-bar > i { position: absolute; left: 0; right: 0; top: 10px; height: 3px; border-radius: 3px; }
.uw-bar.is-now > i { transform: scaleX(.18); }
.uw-bar.is-now.is-ready > i { transform: scaleX(1); transition-duration: 1.4s; }
@media (min-width: 768px) { .uw-bars { top: 14px; } }

/* ── A slide ── */
.uw-slide { position: absolute; inset: 0; overflow: clip; display: flex; flex-direction: column; padding: calc(var(--uw-top) + 18px) 24px calc(var(--uw-bottom) + 84px); }
.uw-eyebrow { margin: 0; font: 700 12px/1.2 var(--uw-sans), sans-serif; letter-spacing: .24em; text-transform: uppercase; }
.uw-serif { font-family: var(--uw-serif), Georgia, serif; font-style: italic; font-weight: 400; letter-spacing: -.005em; }
.uw-display { font-family: var(--uw-sans), sans-serif; font-weight: 800; font-variation-settings: "opsz" 96, "wdth" 85; letter-spacing: -.035em; line-height: .86; margin: 0; }
.uw-num { font-variant-numeric: tabular-nums; }
.uw-up { display: block; overflow: hidden; padding-bottom: .06em; }
.uw-up > span { display: block; animation: uw-up .9s var(--uw-ease) both; animation-delay: var(--d, 0s); }
@keyframes uw-up { from { transform: translateY(105%); } to { transform: none; } }
.uw-fade { animation: uw-fade .9s var(--uw-ease) both; animation-delay: var(--d, 0s); }
@keyframes uw-fade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* ── Bottom navigation ── */
.uw-foot { position: absolute; z-index: 25; left: 0; right: 0; bottom: var(--uw-bottom); display: flex; justify-content: center; align-items: center; pointer-events: none; }
.uw-foot > * { pointer-events: auto; }
.uw-next { display: inline-flex; align-items: center; gap: 10px; min-height: 54px; padding: 0 26px 0 30px; border: 0; border-radius: 99px; cursor: pointer;
  background: var(--uw-ink); color: var(--uw-bg); font: 750 16px/1 var(--uw-sans), sans-serif; letter-spacing: -.01em;
  box-shadow: 0 14px 30px -14px rgba(0,0,0,.55); transition: transform .25s var(--uw-ease), opacity .4s var(--uw-ease); animation: uw-pop .6s var(--uw-ease) both; }
.uw-next:active { transform: scale(.96); }
.uw-next svg { width: 18px; height: 18px; }
@keyframes uw-pop { from { opacity: 0; transform: translateY(12px) scale(.94); } to { opacity: 1; transform: none; } }
.uw-back { position: absolute; left: 16px; bottom: calc(var(--uw-bottom) + 5px); z-index: 25; width: 44px; height: 44px; border-radius: 50%; border: 0; cursor: pointer;
  display: grid; place-items: center; background: color-mix(in srgb, var(--uw-ink) 12%, transparent); color: var(--uw-ink); }
.uw-back svg { width: 18px; height: 18px; }

/* ── Gate: a Wrapped cover ── */
.uw-gate { background: radial-gradient(120% 80% at 50% 38%, rgba(21,16,24,.55), rgba(21,16,24,.92) 70%) !important; }
.uw-gate .pm-gateName { font-family: var(--uw-sans), sans-serif !important; font-weight: 800; letter-spacing: -.04em; font-variation-settings: "opsz" 96, "wdth" 85; }
.uw-gate .pm-gateKick { color: #FFE7A3; }
.uw-gate .pm-gateCta { background: #FF4B3E; color: #fff; font-family: var(--uw-sans), sans-serif; box-shadow: 0 16px 34px -14px rgba(255,75,62,.8); }
.uw-gate .pm-gateArt { width: min(270px, 62vw); }
.uw-gate .pm-sealWax { background: radial-gradient(circle at 35% 30%, #ff8a7f, #FF4B3E 55%, #b8231a); }
.uw-gate .pm-gateSub { font-family: var(--uw-serif), serif; font-style: italic; font-size: 19px; opacity: .9; }
.uw-cover { position: relative; width: 100%; aspect-ratio: 1; border-radius: 22px; overflow: hidden; background: #FF4B3E; color: #151018;
  box-shadow: 0 30px 60px -24px rgba(255,75,62,.55), 0 0 0 1px rgba(255,255,255,.08); transform: rotate(-3deg); }
.uw-cover i { position: absolute; display: block; }
.uw-cover .c1 { width: 78%; aspect-ratio: 1; border-radius: 50%; background: #FF7AB6; right: -26%; top: -22%; animation: uw-orbit 9s ease-in-out infinite; }
.uw-cover .c2 { width: 64%; height: 30%; border-radius: 99px; background: #B9A7FF; left: -14%; bottom: 14%; transform: rotate(-24deg); animation: uw-sway 7s ease-in-out infinite; }
.uw-cover .c3 { width: 34%; aspect-ratio: 1; background: #FFE7A3; border-radius: 0 100% 0 0; left: 0; bottom: 0; }
.uw-cover b { position: absolute; left: 9%; top: 10%; font: 800 clamp(54px, 17vw, 76px)/.82 var(--uw-sans), sans-serif; letter-spacing: -.05em; font-variation-settings: "opsz" 96, "wdth" 78; text-align: left; }
.uw-cover em { position: absolute; left: 9%; top: 47%; font: italic 400 clamp(30px, 9vw, 40px)/1 var(--uw-serif), serif; color: #151018; }
.uw-cover small { position: absolute; right: 9%; bottom: 9%; font: 800 15px/1 var(--uw-sans), sans-serif; letter-spacing: .14em; }
@keyframes uw-orbit { 50% { transform: translate(-8%, 6%) scale(1.06); } }
@keyframes uw-sway { 50% { transform: rotate(-16deg) translateX(6%); } }

/* ── 1 Intro ── */
.uw-intro { justify-content: center; }
.uw-introStack { margin: 18px 0 0; font-size: clamp(76px, 25vw, 150px); }
.uw-introStack .uw-serif { font-size: .62em; letter-spacing: -.02em; line-height: 1; color: var(--uw-accent); }
.uw-introSub { margin: 26px 0 0; font-size: 24px; line-height: 1.2; max-width: 16em; }
.uw-intro > :not(.uw-blob) { position: relative; z-index: 1; }
.uw-blob { position: absolute; z-index: 0; pointer-events: none; display: block; }
.uw-intro .b1 { width: 62vw; max-width: 330px; aspect-ratio: 1; border-radius: 50%; background: #FF7AB6; right: -18%; top: 16%; animation: uw-blobIn 1.2s var(--uw-ease) both .1s, uw-orbit 10s ease-in-out infinite 1.3s; }
.uw-intro .b2 { width: 54%; height: 64px; border-radius: 99px; background: #151018; left: -12%; bottom: 7%; transform: rotate(-12deg); animation: uw-slideIn 1.1s var(--uw-ease) both .35s; }
.uw-intro .b3 { width: 120px; aspect-ratio: 1; background: #FFE7A3; border-radius: 100% 0 0 0; right: 0; bottom: 0; animation: uw-blobIn 1s var(--uw-ease) both .55s; }
@keyframes uw-blobIn { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes uw-slideIn { from { transform: translateX(-110%) rotate(-12deg); } to { transform: rotate(-12deg); } }

/* ── 2 Top song ── */
.uw-song { align-items: center; text-align: center; }
.uw-song .uw-eyebrow { align-self: flex-start; }
.uw-songCover { margin: auto 0 0; width: min(66vw, 300px, 36svh); }
.uw-songTitle { margin: 26px 0 0; font-size: clamp(34px, 10vw, 48px); line-height: .95; max-width: 11em; }
.uw-songArtist { margin: 8px 0 0; font-size: 21px; opacity: .85; }
.uw-scrub { width: min(100%, 320px); margin: 20px 0 0; display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; font: 600 12px/1 var(--uw-sans), sans-serif; font-variant-numeric: tabular-nums; }
.uw-scrub > i { display: block; height: 4px; border-radius: 4px; background: color-mix(in srgb, var(--uw-ink) 20%, transparent); overflow: hidden; }
.uw-scrub > i > i { display: block; height: 100%; background: var(--uw-ink); transform-origin: left; transition: transform .6s linear; }
.uw-like { position: relative; margin: 16px 0 0; width: 64px; height: 64px; border-radius: 50%; border: 2px solid var(--uw-ink); background: transparent; cursor: pointer; display: grid; place-items: center; transition: background .3s, transform .3s var(--uw-ease); }
.uw-like svg { width: 28px; height: 28px; }
.uw-like.is-on { background: var(--uw-ink); color: #FF4B3E; animation: uw-likePop .5s var(--uw-ease); }
@keyframes uw-likePop { 40% { transform: scale(1.22); } }
.uw-spark { position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; margin: -5px; border-radius: 50%; background: #FF4B3E; pointer-events: none;
  animation: uw-spark .8s var(--uw-ease) forwards; }
@keyframes uw-spark { from { transform: rotate(var(--a)) translateY(0) scale(1); opacity: 1; } to { transform: rotate(var(--a)) translateY(-58px) scale(.2); opacity: 0; } }
.uw-songNote { margin: 14px 0 auto; min-height: 1.3em; font-size: 22px; line-height: 1.2; max-width: 15em; }

/* ── 3 Top memories ── */
.uw-mem { align-items: center; }
.uw-mem .uw-eyebrow { align-self: flex-start; }
.uw-memHead { align-self: flex-start; margin: 10px 0 0; font-size: clamp(54px, 17vw, 84px); color: var(--uw-accent); }
.uw-memStack { position: relative; margin: auto 0; width: min(72vw, 300px, 40svh); aspect-ratio: 4 / 5; }
.uw-memCard { position: absolute; inset: 0; border-radius: 18px; overflow: hidden; cursor: grab; touch-action: pan-y; background: #241a2c;
  box-shadow: 0 30px 60px -26px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.08); }
.uw-memCard:active { cursor: grabbing; }
.uw-memRank { position: absolute; z-index: 3; left: -14px; bottom: -26px; font-size: clamp(96px, 30vw, 132px); color: #FFE7A3; text-shadow: 0 10px 30px rgba(0,0,0,.45); pointer-events: none; }
.uw-memCap { min-height: 2.5em; margin: 4px 0 0; text-align: center; font-size: 22px; line-height: 1.15; max-width: 15em; }
.uw-memHint { margin: 6px 0 0; font: 600 12px/1 var(--uw-sans), sans-serif; letter-spacing: .14em; text-transform: uppercase; opacity: .6; }

/* ── 4 Stats ── */
.uw-statsHead { margin: 12px 0 22px; font-size: clamp(40px, 12.5vw, 64px); max-width: 7.2em; }
.uw-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: auto; margin-bottom: auto; }
.uw-tile { position: relative; min-height: 128px; border: 0; padding: 0; background: none; cursor: pointer; perspective: 900px; text-align: left; }
.uw-tile.is-wide { grid-column: 1 / -1; min-height: 116px; }
.uw-tileIn { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform .8s var(--uw-ease); }
.uw-tile.is-on .uw-tileIn { transform: rotateY(180deg); }
.uw-face { position: absolute; inset: 0; border-radius: 18px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.uw-face.front { background: #151018; color: #FFE7A3; }
.uw-face.back { transform: rotateY(180deg); color: #151018; }
.uw-face small { font: 700 11px/1.25 var(--uw-sans), sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.uw-face.front b { align-self: flex-end; font: 800 46px/.8 var(--uw-sans), sans-serif; color: #FF4B3E; }
.uw-face.back b { font: 800 clamp(24px, 7.4vw, 34px)/.95 var(--uw-sans), sans-serif; letter-spacing: -.035em; font-variation-settings: "opsz" 96, "wdth" 85; overflow-wrap: anywhere; }

/* ── 5 Trait (scratch) ── */
.uw-trait { justify-content: center; }
.uw-traitLead { margin: 14px 0 0; font-size: clamp(28px, 8.4vw, 38px); line-height: 1.04; max-width: 11em; }
.uw-scratch { position: relative; margin: 30px 0 0; width: 100%; max-width: 360px; height: 170px; border-radius: 22px; overflow: hidden; background: #FFE7A3; color: #151018;
  display: grid; place-items: center; text-align: center; padding: 18px; box-shadow: 0 24px 50px -24px rgba(0,0,0,.5); touch-action: none; }
.uw-scratch b { font-size: clamp(34px, 10.5vw, 50px); }
.uw-scratch canvas { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; transition: opacity .7s var(--uw-ease); }
.uw-scratch.is-done canvas { opacity: 0; pointer-events: none; }
.uw-scratch.is-done b { animation: uw-likePop .7s var(--uw-ease); }
.uw-textBtn { margin: 14px 0 0; align-self: flex-start; min-height: 44px; padding: 0 2px; border: 0; background: none; cursor: pointer; font: 600 13px/1 var(--uw-sans), sans-serif; letter-spacing: .14em; text-transform: uppercase; text-decoration: underline; text-underline-offset: 4px; opacity: .75; }

/* ── 6 Reasons (fast cuts) ── */
.uw-reasons { padding: 0; cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; touch-action: manipulation; }
.uw-cut { position: absolute; inset: 0; overflow: hidden; animation: uw-cut .55s var(--uw-ease) both; }
@keyframes uw-cut { from { transform: scale(1.12); opacity: .2; } to { transform: none; opacity: 1; } }
.uw-cutTint { position: absolute; inset: 0; mix-blend-mode: multiply; opacity: .62; }
.uw-cutScrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.25) 0%, transparent 30%, transparent 45%, rgba(0,0,0,.55) 100%); }
.uw-cutText { position: absolute; left: 22px; right: 22px; bottom: calc(var(--uw-bottom) + 96px); }
.uw-cutText p.uw-eyebrow { color: #fff; margin-bottom: 14px; font: 700 12px/1.2 var(--uw-sans), sans-serif; letter-spacing: .24em; }
.uw-cutText p { margin: 0; font: 800 clamp(32px, 9.6vw, 50px)/1.08 var(--uw-sans), sans-serif; letter-spacing: -.035em; font-variation-settings: "opsz" 96, "wdth" 88; }
.uw-cutText p span { background: var(--c); color: #151018; padding: .02em .16em; -webkit-box-decoration-break: clone; box-decoration-break: clone; border-radius: 6px; }
.uw-cutText p span { animation: uw-fade .5s var(--uw-ease) both .08s; display: inline; }
.uw-dots { position: absolute; z-index: 4; left: 22px; top: calc(var(--uw-top) + 6px); display: flex; gap: 6px; }
.uw-dots i { width: 22px; height: 6px; border-radius: 6px; background: rgba(255,255,255,.35); transition: background .3s; }
.uw-dots i.is-on { background: #fff; }
.uw-cutHint { position: absolute; z-index: 4; right: 22px; top: calc(var(--uw-top) + 2px); color: #fff; font: 600 11px/1 var(--uw-sans), sans-serif; letter-spacing: .16em; text-transform: uppercase; opacity: .8; }
.uw-cutFlash { position: absolute; inset: 0; background: #fff; pointer-events: none; animation: uw-flash .35s ease-out forwards; }
@keyframes uw-flash { from { opacity: .55; } to { opacity: 0; } }

/* ── 7 Voice ── */
.uw-voice { justify-content: center; }
.uw-voiceHead { margin: 12px 0 28px; font-size: clamp(46px, 14vw, 72px); }
.uw-quote { margin: 0; font-size: clamp(30px, 8.6vw, 40px); line-height: 1.08; }
.uw-quote + p { margin: 18px 0 0; font: 700 13px/1 var(--uw-sans), sans-serif; letter-spacing: .2em; text-transform: uppercase; }

/* ── 8 Letter ── */
.uw-letter { padding-bottom: calc(var(--uw-bottom) + 76px); }
.uw-fold { margin: auto 0; align-self: center; width: min(100%, 330px); aspect-ratio: 4 / 3.2; border: 0; cursor: pointer; border-radius: 6px; position: relative;
  background: #FFF8E6; color: #151018; box-shadow: 0 30px 60px -28px rgba(80,40,0,.55), 0 2px 0 rgba(255,255,255,.6) inset; transform: rotate(-2.5deg);
  display: grid; place-items: center; text-align: center; padding: 20px; animation: uw-fade 1s var(--uw-ease) both .2s; }
.uw-fold::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(21,16,24,.12); box-shadow: 0 1px 0 rgba(255,255,255,.8); }
.uw-fold::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(80,40,0,.06) 50%, rgba(0,0,0,0) 62%); pointer-events: none; }
.uw-fold b { font-size: clamp(40px, 12vw, 56px); display: block; }
.uw-fold small { display: block; margin-top: 8px; font: 700 11px/1 var(--uw-sans), sans-serif; letter-spacing: .22em; text-transform: uppercase; opacity: .55; }
.uw-paper { position: relative; margin: 14px -6px 0; flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 4px 6px 40px;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 18px, #000 calc(100% - 46px), transparent); mask-image: linear-gradient(180deg, transparent 0, #000 18px, #000 calc(100% - 46px), transparent); }
.uw-paper p { margin: 0 0 .9em; font: 400 21px/1.42 var(--uw-serif), Georgia, serif; font-feature-settings: "liga", "onum"; white-space: pre-line; }
.uw-paper p:first-child { font-style: italic; font-size: 30px; line-height: 1.1; }
.uw-paper .uw-sign { margin-top: 1.2em; font-style: italic; font-size: 34px; }
.uw-paperIn { animation: uw-fade 1s var(--uw-ease) both; }

/* ── 9 The number (money moment) ── */
.uw-number { justify-content: center; align-items: center; text-align: center; }
.uw-numLead { margin: 0; font-size: clamp(28px, 8vw, 36px); line-height: 1.1; max-width: 11em; }
.uw-big { margin: 18px 0 4px; font-size: clamp(96px, 32vw, 176px); color: #FFE7A3; line-height: .84; white-space: nowrap; }
.uw-big.is-ghost { opacity: .18; }
.uw-big.is-slam { animation: uw-slam .7s cubic-bezier(.2,1.6,.4,1) both; color: #FF7AB6; }
@keyframes uw-slam { 0% { transform: scale(1.5); filter: blur(4px); } 60% { transform: scale(.96); filter: none; } 100% { transform: none; } }
.uw-unit { margin: 0; font: 800 15px/1 var(--uw-sans), sans-serif; letter-spacing: .3em; text-transform: uppercase; }
.uw-holdBtn { position: relative; margin: 34px 0 0; width: 116px; height: 116px; border-radius: 50%; border: 0; cursor: pointer; background: #FF7AB6; color: #151018; touch-action: none;
  -webkit-touch-callout: none; user-select: none; -webkit-user-select: none; display: grid; place-items: center; font: 800 13px/1.15 var(--uw-sans), sans-serif; letter-spacing: .08em; text-transform: uppercase;
  box-shadow: 0 0 0 calc(var(--p, 0) * 26px) rgba(255,122,182,.22), 0 20px 40px -18px rgba(255,122,182,.7); transition: box-shadow .12s linear; }
.uw-holdBtn svg { position: absolute; inset: -9px; width: calc(100% + 18px); height: calc(100% + 18px); transform: rotate(-90deg); pointer-events: none; }
.uw-shake { animation: uw-shake .5s linear; }
@keyframes uw-shake { 20% { transform: translate(-6px, 3px); } 40% { transform: translate(5px, -4px); } 60% { transform: translate(-3px, 2px); } 80% { transform: translate(2px, -1px); } }
.uw-whiteout { position: absolute; inset: 0; z-index: 30; background: #fff; pointer-events: none; animation: uw-flash .9s ease-out forwards; }
.uw-hero { position: absolute; inset: 0; }
.uw-heroScrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,6,14,.5) 0%, rgba(10,6,14,0) 26%, rgba(10,6,14,0) 42%, rgba(10,6,14,.82) 78%, rgba(10,6,14,.92) 100%); }
.uw-heroTop { position: absolute; left: 22px; right: 22px; top: calc(var(--uw-top) + 4px); color: #fff; text-align: left; }
.uw-heroTop .uw-display { margin: 0; font-size: clamp(76px, 24vw, 128px); color: #FFE7A3; text-shadow: 0 6px 30px rgba(0,0,0,.35); }
.uw-heroTop p:not(.uw-display) { margin: 6px 0 0; font: 700 13px/1.3 var(--uw-sans), sans-serif; letter-spacing: .2em; text-transform: uppercase; }
.uw-heroTop .uw-tick { font-variant-numeric: tabular-nums; opacity: .8; letter-spacing: .08em; }
.uw-ask { position: absolute; left: 22px; right: 22px; bottom: calc(var(--uw-bottom) + 4px); color: #fff; text-align: left; }
.uw-ask h2 { text-wrap: balance; margin: 0 0 18px; font: 800 clamp(32px, 9.4vw, 46px)/1 var(--uw-sans), sans-serif; letter-spacing: -.035em; font-variation-settings: "opsz" 96, "wdth" 88; }
.uw-ask h2 em { font: italic 400 1.04em/1 var(--uw-serif), serif; letter-spacing: -.01em; color: #FF7AB6; }
.uw-askRow { position: relative; display: flex; gap: 10px; align-items: center; min-height: 58px; }
.uw-yes { min-height: 58px; padding: 0 34px; border-radius: 99px; border: 0; cursor: pointer; background: #FF4B3E; color: #fff; font: 800 19px/1 var(--uw-sans), sans-serif; box-shadow: 0 16px 34px -14px rgba(255,75,62,.85); }
.uw-no { min-height: 50px; padding: 0 22px; border-radius: 99px; border: 1.5px solid rgba(255,255,255,.55); background: rgba(21,16,24,.35); color: #fff; cursor: pointer; font: 700 15px/1 var(--uw-sans), sans-serif;
  transition: transform .35s var(--uw-ease); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); white-space: nowrap; }
.uw-noLine { min-height: 1.3em; margin: 12px 0 0; font-size: 19px; color: #FFE7A3; }
.uw-please { position: absolute; right: -4px; bottom: calc(100% + 4px); pointer-events: none; }
.uw-yesBig { margin: 0; font-size: clamp(84px, 27vw, 140px); color: #FFE7A3; animation: uw-slam .8s cubic-bezier(.2,1.6,.4,1) both; }

/* ── 10 The Wrapped card ── */
.uw-card { align-items: center; padding-bottom: calc(var(--uw-bottom) + 70px); }
.uw-card .uw-eyebrow { align-self: flex-start; }
.uw-sheet { position: relative; margin: 14px 0 0; width: min(100%, 340px); border-radius: 22px; overflow: hidden; background: #151018; color: #FFF6E8;
  box-shadow: 0 34px 70px -30px rgba(80,10,5,.75); animation: uw-fade 1s var(--uw-ease) both .1s; flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column; }
.uw-sheetPhoto { position: relative; flex: 0 1 auto; aspect-ratio: 16 / 10; min-height: 90px; overflow: hidden; }
.uw-sheetPhoto .uw-cutTint { background: #FF4B3E; opacity: .35; }
.uw-sheetBody { padding: 14px 18px 16px; }
.uw-sheetBody h3 { margin: 0; font: 800 30px/.9 var(--uw-sans), sans-serif; letter-spacing: -.04em; font-variation-settings: "opsz" 96, "wdth" 82; }
.uw-sheetBody h3 em { font: italic 400 1.02em/1 var(--uw-serif), serif; color: #FF7AB6; letter-spacing: 0; }
.uw-sheetGrid { margin: 12px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.uw-sheetGrid small { display: block; font: 700 10px/1.2 var(--uw-sans), sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #B9A7FF; }
.uw-sheetGrid b { display: block; margin-top: 3px; font: 750 16px/1.12 var(--uw-sans), sans-serif; letter-spacing: -.01em; overflow-wrap: anywhere; }
.uw-sheetGrid .big b { font: 800 30px/.9 var(--uw-sans), sans-serif; letter-spacing: -.04em; color: #FFE7A3; }
.uw-sheetFoot { margin: 12px 0 0; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.12); display: flex; justify-content: space-between; gap: 10px; font: 700 10px/1.2 var(--uw-sans), sans-serif; letter-spacing: .16em; text-transform: uppercase; opacity: .75; }
.uw-endLine { text-wrap: balance; margin: 14px 0 0; text-align: center; font-size: 22px; line-height: 1.15; max-width: 15em; }
.uw-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.uw-chipBtn { min-height: 44px; padding: 0 16px; border-radius: 99px; border: 1.5px solid var(--uw-ink); background: transparent; cursor: pointer; font: 700 14px/1 var(--uw-sans), sans-serif; }
.uw-drawer { position: absolute; z-index: 40; left: 0; right: 0; bottom: 0; max-height: 82%; overflow-y: auto; border-radius: 26px 26px 0 0; background: #151018; color: #FFF6E8;
  padding: 26px 22px calc(var(--uw-bottom) + 14px); box-shadow: 0 -30px 60px -20px rgba(0,0,0,.6); animation: uw-drawer .6s var(--uw-ease) both; }
@keyframes uw-drawer { from { transform: translateY(100%); } to { transform: none; } }
.uw-drawer h4 { margin: 0 0 12px; font: 800 26px/1 var(--uw-sans), sans-serif; letter-spacing: -.03em; }
.uw-drawer p { margin: 0 0 .8em; font: 400 21px/1.4 var(--uw-serif), Georgia, serif; white-space: pre-line; }
.uw-drawer p:first-of-type { font-style: italic; color: #FF7AB6; }
.uw-drawerX { position: absolute; right: 14px; top: 14px; width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(255,255,255,.1); cursor: pointer; font-size: 18px; }
.uw-scrimTap { position: absolute; inset: 0; z-index: 39; background: rgba(10,6,14,.45); border: 0; animation: uw-fadeOnly .4s both; }
@keyframes uw-fadeOnly { from { opacity: 0; } }

@media (max-height: 700px) {
  .uw-introStack { font-size: clamp(64px, 21vw, 120px); }
  .uw-statsHead { font-size: 40px; margin-bottom: 14px; }
  .uw-tile { min-height: 104px; } .uw-tile.is-wide { min-height: 96px; }
  .uw-sheetGrid { gap: 6px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .uw-root *, .uw-root *::before, .uw-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  .uw-tileIn { transition: none; }
}
`;
