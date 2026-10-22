// ─── Pampas & Peony — the page's own CSS (on top of the wedding kit's) ──────
// Light themes only. Colours come from the kit tokens (--wk-*) plus a few of
// our own (--fw-script for the names, --fw-wax* for the seals, --fw-env* for
// the envelope), set per theme below. Every animation is transform/opacity;
// loops pause off screen (.is-idle) and stop under reduced motion.

import { ART } from "./art";

const u = (role: keyof typeof ART) => `url("${ART[role].src}")`;

export const FW_CSS = `
.fw-root { --fw-script: #8c4a52; --fw-wax1: #b0646b; --fw-wax2: #84404a; --fw-env: #ecdccb; --fw-env-2: #e2cdb7; --fw-liner: #f6e6df; --fw-ease: cubic-bezier(.22,.8,.24,1); position: relative; overflow-x: clip; color: var(--wk-ink); }
.fw-root[data-wk-theme="blush"] { --fw-script: #8e4252; --fw-env: #f2dcd6; --fw-env-2: #e8c8c0; --fw-liner: #fbefe9; }
.fw-root[data-wk-theme="powder"] { --fw-script: #49597d; --fw-wax1: #7a8bb0; --fw-wax2: #536489; --fw-env: #e2e7ef; --fw-env-2: #d2d9e5; --fw-liner: #f1f3f8; }
.fw-paper { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: ${u("paper")} center / cover no-repeat; opacity: var(--fw-paper-o, .7); }
.fw-root > header, .fw-root > section, .fw-root > .wk-section { position: relative; z-index: 1; }
.fw-root img { -webkit-user-drag: none; user-select: none; }
.fw-root [lang="hi"] { font-family: var(--wk-font-deva), var(--wk-font-display), serif; letter-spacing: 0; }

/* ── buttons + chips ──────────────────────────────────────────────────── */
.fw-btn { white-space: nowrap; }
.fw-btn-icon { width: 48px; padding: 0; }
.fw-chip { -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px; padding: 0 15px; border-radius: 999px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); color: var(--wk-ink); font: 600 13px/1 var(--wk-font-sans); text-decoration: none; cursor: pointer; transition: transform .2s var(--fw-ease), border-color .2s, box-shadow .2s; }
.fw-chip svg { color: var(--wk-gold-ink); flex: none; }
.fw-chip:hover { border-color: var(--wk-gold); box-shadow: 0 8px 18px -12px rgba(80,50,30,.4); }
.fw-chip:active { transform: scale(.97); }
.fw-chip:disabled { opacity: .6; cursor: progress; }
.fw-chip-icon { width: 44px; padding: 0; }
.fw-center { text-align: center; margin-top: 24px; }

/* ── the paper unfold reveal (kit Reveal + .fw-fold) ──────────────────── */
.wk-reveal.fw-fold { transform: perspective(1100px) rotateX(-22deg) translate3d(0, 22px, 0); transform-origin: 50% 0; }
.wk-reveal.fw-fold.is-in { transform: none; }

/* ── line-art wipe ─────────────────────────────────────────────────────── */
.fw-wipe { display: block; overflow: hidden; pointer-events: none; }
.fw-wipe-clip { display: block; overflow: hidden; transform: translate3d(-101%, 0, 0); transition: transform 2.6s cubic-bezier(.55,.06,.2,1) var(--fw-wd, 0ms); }
.fw-wipe-clip img { display: block; width: 100%; height: auto; transform: translate3d(101%, 0, 0); transition: transform 2.6s cubic-bezier(.55,.06,.2,1) var(--fw-wd, 0ms); }
.fw-wipe.is-rtl .fw-wipe-clip { transform: translate3d(101%, 0, 0); }
.fw-wipe.is-rtl .fw-wipe-clip img { transform: translate3d(-101%, 0, 0); }
.fw-wipe.is-ttb .fw-wipe-clip { transform: translate3d(0, -101%, 0); }
.fw-wipe.is-ttb .fw-wipe-clip img { transform: translate3d(0, 101%, 0); }
.fw-wipe.is-btt .fw-wipe-clip { transform: translate3d(0, 101%, 0); }
.fw-wipe.is-btt .fw-wipe-clip img { transform: translate3d(0, -101%, 0); }
.fw-wipe.is-in .fw-wipe-clip, .fw-wipe.is-in .fw-wipe-clip img { transform: none; }

/* ── ambient loops ─────────────────────────────────────────────────────── */
@keyframes fw-sway { from { transform: rotate(-2.2deg); } to { transform: rotate(2.4deg); } }
@keyframes fw-sway-s { from { transform: rotate(-1deg); } to { transform: rotate(1.1deg); } }
@keyframes fw-swing { 0%, 100% { transform: rotate(-1.1deg); } 50% { transform: rotate(1.1deg); } }
@keyframes fw-drift { 0% { transform: translate3d(0, -6vh, 0) rotate(0deg); opacity: 0; } 8% { opacity: .95; } 88% { opacity: .9; } 100% { transform: translate3d(var(--dx, 40px), 108vh, 0) rotate(420deg); opacity: 0; } }
@keyframes fw-fall { 0% { transform: translate3d(0, -8vh, 0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate3d(var(--dx, 0px), 112vh, 0) rotate(var(--rot, 300deg)); opacity: .2; } }
@keyframes fw-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes fw-glint { 0%, 100% { opacity: .55; transform: scale(.98); } 50% { opacity: 1; transform: scale(1.02); } }
@keyframes fw-dot { 0%, 100% { opacity: .35; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.1); } }
@keyframes fw-cue { 0% { transform: translate3d(0, -6px, 0); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate3d(0, 14px, 0); opacity: 0; } }
@keyframes fw-ring { 0% { opacity: .9; transform: scale(.7); } 100% { opacity: 0; transform: scale(1.55); } }
@keyframes fw-pop { from { opacity: 0; transform: scale(.94) translate3d(0, 10px, 0); } to { opacity: 1; transform: none; } }
@keyframes fw-fade { from { opacity: 0; } to { opacity: 1; } }

/* ── the envelope (opening) ────────────────────────────────────────────── */
.fw-env { position: fixed; inset: 0; z-index: 80; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(14px, 3.2vh, 30px); padding: 24px 16px; overflow: hidden; background: var(--wk-bg); transition: opacity .9s var(--fw-ease) .25s; }
.fw-env::before { content: ""; position: absolute; inset: 0; background: ${u("paper")} center / cover no-repeat; opacity: .95; }
.fw-env-bg { position: absolute; inset: 0; pointer-events: none; }
.fw-env-clouds { position: absolute; left: 50%; bottom: -2px; width: max(100%, 760px); height: auto; transform: translate3d(-50%, 0, 0); opacity: 0; transition: opacity 1.2s ease, transform 1.4s var(--fw-ease); }
.fw-env.is-ready .fw-env-clouds { opacity: 1; }
.fw-env-corner { position: absolute; bottom: -2px; width: clamp(120px, 27vw, 300px); }
.fw-env-corner.is-r { right: 0; }
.fw-env-corner.is-l { left: 0; transform: scaleX(-1); }
.fw-env-corner img, .fw-hero-corner img { display: block; width: 100%; height: auto; transform-origin: 100% 100%; animation: fw-sway 6.5s ease-in-out infinite alternate; }
.fw-env-corner.is-l img, .fw-hero-corner.is-l img { animation-duration: 7.4s; animation-delay: -2s; }
.fw-env-swirl { position: absolute; top: -3%; left: -8%; width: clamp(190px, 50vw, 430px); opacity: .85; }
.fw-env-swirl.is-r { left: auto; right: -8%; transform: scaleX(-1); }
.fw-env-head, .fw-env-stage, .fw-env-foot { position: relative; z-index: 2; opacity: 0; transform: translate3d(0, 14px, 0); transition: opacity .9s var(--fw-ease), transform 1s var(--fw-ease); }
.fw-env.is-ready .fw-env-head { opacity: 1; transform: none; }
.fw-env.is-ready .fw-env-stage { opacity: 1; transform: none; transition-delay: .15s; }
.fw-env.is-ready .fw-env-foot { opacity: 1; transform: none; transition-delay: .35s; }
.fw-env-head { text-align: center; }
.fw-env-head .wk-eyebrow { margin: 6px 0 0; }
.fw-env-dear { margin: 0; font: 400 clamp(30px, 8.4vw, 46px)/1.1 var(--wk-font-script); color: var(--fw-script); }
.fw-env-dear b { font-weight: 400; }
.fw-env-stage { perspective: 1400px; }
.fw-envelope { --seal: clamp(66px, 17vw, 92px); position: relative; width: min(84vw, 460px); aspect-ratio: 1.42; transform-style: preserve-3d; transition: transform 1.1s cubic-bezier(.5,0,.3,1); }
@media (min-width: 768px) { .fw-envelope { width: min(60vw, 540px); } }
.fw-env-back { position: absolute; inset: 0; border-radius: 6px; background: linear-gradient(180deg, var(--fw-env-2), var(--fw-env)); box-shadow: 0 34px 60px -32px rgba(80,50,30,.5), 0 4px 14px -6px rgba(80,50,30,.25); }
.fw-card { position: absolute; left: 5%; right: 5%; bottom: 5%; height: 88%; z-index: 2; transform-style: preserve-3d; transition: transform 1s cubic-bezier(.3,.7,.2,1), opacity .8s ease; }
.fw-card-face { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6% 6%; text-align: center; border-radius: 3px; background: #fffaf2; box-shadow: 0 10px 24px -14px rgba(60,40,20,.4); }
.fw-card-face::before { content: ""; position: absolute; inset: 7px; border: 1px solid rgba(184,146,74,.5); border-radius: 2px; pointer-events: none; }
.fw-card-k { font: 500 clamp(9px, 2.4vw, 11px)/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-card-n { font: 400 clamp(30px, 8.6vw, 50px)/1.05 var(--wk-font-script); color: var(--fw-script); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-card-amp { font: italic 500 clamp(14px, 3.6vw, 18px)/1 var(--wk-font-display); color: var(--wk-gold-ink); }
.fw-card-d { margin-top: 6px; font: 500 clamp(9px, 2.4vw, 11px)/1 var(--wk-font-caps); letter-spacing: .22em; color: var(--wk-muted); }
.fw-card-fold { position: absolute; left: 0; right: 0; top: 0; height: 52%; z-index: 3; transform-origin: 50% 0; transform-style: preserve-3d; transition: transform 1s cubic-bezier(.45,.05,.2,1); }
.fw-card-fold > span { position: absolute; inset: 0; border-radius: 3px 3px 0 0; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.fw-card-fold-front { display: grid; place-items: center; background: linear-gradient(180deg, #fbf4ea, #f5eadb); box-shadow: 0 6px 12px -8px rgba(60,40,20,.35); }
.fw-card-fold-front img { width: 30%; height: auto; }
.fw-card-fold-back { transform: rotateX(180deg); background: var(--fw-liner) ${u("mandala")} center / 64px auto repeat; box-shadow: inset 0 0 0 7px #fffaf2, inset 0 0 0 8px rgba(184,146,74,.45); }
.fw-env-pocket { position: absolute; inset: 0; z-index: 4; border-radius: 6px; clip-path: polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%); background: linear-gradient(180deg, var(--fw-env), var(--fw-env-2)); }
.fw-env-pocket::before { content: ""; position: absolute; inset: 0; clip-path: polygon(0 100%, 50% 52%, 100% 100%); background: linear-gradient(0deg, rgba(255,255,255,.22), rgba(120,80,50,.08)); }
.fw-env-pocket::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(120,80,50,.07), transparent 28%, transparent 72%, rgba(120,80,50,.07)); }
.fw-env-to { position: absolute; left: 8%; right: 8%; bottom: 7%; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
.fw-env-to small { font: 500 clamp(9px, 2.3vw, 11px)/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-env-to b { font: 400 clamp(22px, 6vw, 32px)/1.1 var(--wk-font-script); color: var(--fw-script); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-env-flap { position: absolute; left: 0; right: 0; top: 0; height: 58%; z-index: 5; transform-origin: 50% 0; transform-style: preserve-3d; transition: transform .85s cubic-bezier(.5,0,.25,1); }
.fw-env-flap i { position: absolute; inset: 0; clip-path: polygon(0 0, 100% 0, 50% 100%); -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.fw-env-flap-out { background: linear-gradient(180deg, var(--fw-env), var(--fw-env-2) 92%); }
.fw-env-flap-out::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 70%, rgba(120,80,50,.1)); }
.fw-env-flap-in { transform: rotateX(180deg); background: var(--fw-liner) ${u("mandala")} center top / 58px auto repeat; }
.fw-seal { position: absolute; left: 50%; top: 58%; width: var(--seal); height: var(--seal); margin: calc(var(--seal) / -2) 0 0 calc(var(--seal) / -2); z-index: 6; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.fw-env.is-ready.is-closed .fw-seal { animation: fw-pulse 2.4s ease-in-out 1.2s infinite; }
.fw-seal:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 6px; }
.fw-seal-half { position: absolute; inset: 0; transition: transform .75s cubic-bezier(.4,.1,.3,1), opacity .6s ease .1s; }
.fw-seal-half.is-l { clip-path: inset(-30% 50% -30% -30%); }
.fw-seal-half.is-r { clip-path: inset(-30% -30% -30% 50%); }
.fw-seal-half i { position: absolute; inset: 0; border-radius: 47% 53% 49% 51% / 53% 47% 53% 47%; background: radial-gradient(circle at 34% 28%, #dc9aa0 0%, var(--fw-wax1) 42%, var(--fw-wax2) 100%); box-shadow: inset 0 -5px 10px rgba(60,10,20,.28), inset 0 4px 7px rgba(255,255,255,.32), 0 8px 16px -6px rgba(80,20,30,.55); }
.fw-seal-half i::after { content: ""; position: absolute; inset: 13%; border-radius: 50%; border: 2px solid rgba(255,235,230,.28); box-shadow: inset 0 2px 3px rgba(60,10,20,.25); }
.fw-seal-ini { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 1px; font: 400 calc(var(--seal) * .36)/1 var(--wk-font-script); color: rgba(255,240,236,.94); text-shadow: 0 -1px 0 rgba(60,10,20,.3), 0 1px 1px rgba(255,255,255,.25); pointer-events: none; transition: opacity .25s; }
.fw-seal-ini em { font: italic 500 calc(var(--seal) * .17)/1 var(--wk-font-display); margin: 0 1px; opacity: .85; }
.fw-env-foot { text-align: center; }
.fw-env-cta { min-height: 50px; padding: 0 28px; border-radius: 999px; border: 1px solid transparent; cursor: pointer; font: 600 15px/1 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-ink); background: linear-gradient(var(--wk-surface-solid), var(--wk-surface-solid)) padding-box, var(--wk-foil) border-box; box-shadow: 0 10px 24px -16px rgba(80,50,30,.55); transition: transform .2s; }
.fw-env-cta:active { transform: scale(.97); }
.fw-env-hint { margin: 10px 0 0; font: italic 500 15px/1.4 var(--wk-font-display); color: var(--wk-muted); }
/* the sequence */
.fw-env:not(.is-closed) .fw-seal { pointer-events: none; }
.fw-env:not(.is-closed) .fw-seal-ini { opacity: 0; }
.fw-env:not(.is-closed) .fw-seal-half.is-l { transform: translate3d(-34%, 60%, 0) rotate(-34deg); opacity: 0; }
.fw-env:not(.is-closed) .fw-seal-half.is-r { transform: translate3d(34%, 64%, 0) rotate(30deg); opacity: 0; }
.fw-env:not(.is-closed) .fw-env-foot, .fw-env:not(.is-closed) .fw-env-head { opacity: 0; transform: translate3d(0, 10px, 0); transition-delay: 0s; transition-duration: .5s; }
.fw-env.is-flap .fw-env-flap, .fw-env.is-rise .fw-env-flap, .fw-env.is-unfold .fw-env-flap, .fw-env.is-leave .fw-env-flap { transform: rotateX(-180deg); }
.fw-env.is-rise .fw-env-flap, .fw-env.is-unfold .fw-env-flap, .fw-env.is-leave .fw-env-flap { z-index: 1; }
.fw-env.is-rise .fw-card, .fw-env.is-unfold .fw-card { transform: translate3d(0, -62%, 0); }
.fw-env.is-unfold .fw-card-fold, .fw-env.is-leave .fw-card-fold { transform: rotateX(-180deg); }
.fw-env.is-leave { opacity: 0; pointer-events: none; }
.fw-env.is-leave .fw-envelope { transform: translate3d(0, 22vh, 0); }
.fw-env.is-leave .fw-card { transform: translate3d(0, calc(-62% - 30vh), 0) scale(1.2); opacity: 0; }
.fw-env.is-leave .fw-env-clouds { transform: translate3d(-50%, 12%, 0); }
.fw-env.is-reduced, .fw-env.is-reduced * { transition-duration: .01ms !important; transition-delay: 0s !important; animation: none !important; }
.fw-env.is-reduced.is-leave { transition: opacity .4s ease !important; }
.fw-petals { position: absolute; inset: 0; z-index: 7; pointer-events: none; overflow: hidden; }
.fw-petals i, .fw-breeze i { position: absolute; top: -4%; border-radius: 60% 0 60% 40%; background: radial-gradient(circle at 30% 30%, #fff8f4, var(--tone, #efcfc9) 70%); box-shadow: 0 1px 2px rgba(120,60,60,.12); }
.fw-petals i { animation: fw-fall linear forwards; }

/* ── language toggle ───────────────────────────────────────────────────── */
.fw-lang { position: fixed; top: calc(12px + var(--vw-top-space, 0px)); left: 12px; z-index: 90; display: flex; padding: 3px; border-radius: 999px; background: rgba(255,252,246,.88); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border: 1px solid var(--wk-border); box-shadow: 0 8px 20px -14px rgba(80,50,30,.5); }
.fw-lang button { min-width: 44px; min-height: 40px; padding: 0 10px; border: 0; border-radius: 999px; background: none; font: 600 13px/1 var(--wk-font-sans); color: var(--wk-ink); cursor: pointer; transition: background-color .25s, color .25s; }
.fw-lang button[aria-pressed="true"] { background: var(--fw-script); color: #fff8f4; }

/* ── hero ──────────────────────────────────────────────────────────────── */
.fw-hero { position: relative; min-height: 100svh; display: flex; align-items: center; padding: clamp(70px, 10vh, 100px) 16px clamp(96px, 16vh, 170px); overflow: hidden; }
.fw-hero-bank, .fw-fin-bank { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.fw-hero-corner { position: absolute; bottom: -2px; width: clamp(110px, 24vw, 300px); z-index: 2; }
.fw-hero-corner.is-r { right: 0; }
.fw-hero-corner.is-l { left: 0; transform: scaleX(-1); }
.fw-hero-clouds, .fw-fin-clouds { position: absolute; left: 50%; bottom: -2px; width: max(100%, 760px); z-index: 1; transform: translate3d(-50%, calc(var(--fw-hy, 0px) * -.08), 0); }
.fw-hero-clouds img, .fw-fin-clouds img { display: block; width: 100%; height: auto; }
.fw-hero-clouds img, .fw-fin-clouds img, .fw-env-clouds { -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 22%); mask-image: linear-gradient(180deg, transparent 0%, #000 22%); }
@media (min-width: 900px) { .fw-hero-clouds img, .fw-fin-clouds img { margin-bottom: -22%; } .fw-env-clouds { bottom: -18vw; } .fw-hero-corner { width: clamp(150px, 15vw, 230px); } }
.fw-hero-copy::before { content: ""; position: absolute; z-index: -1; inset: -40px -60px; background: radial-gradient(ellipse at 50% 50%, rgba(255,250,243,.9) 0%, rgba(255,250,243,.6) 45%, transparent 72%); pointer-events: none; }
.fw-hero-grid { position: relative; z-index: 3; width: 100%; max-width: 1240px; margin: 0 auto; display: grid; gap: clamp(10px, 2.6vh, 28px); justify-items: center; text-align: center; }
.fw-hero-art { position: relative; width: min(80vw, 42svh, 440px); aspect-ratio: 1372 / 1600; }
.fw-hero-par { position: absolute; inset: 0; transform: translate3d(0, calc(var(--fw-hy, 0px) * .1), 0); }
.fw-hero-glow { position: absolute; inset: 14% 4% 2%; border-radius: 50% 50% 18% 18%; background: radial-gradient(ellipse at 50% 58%, rgba(255,246,240,.98), rgba(246,214,206,.5) 46%, transparent 72%); opacity: 0; transition: opacity 1.6s ease .1s; }
.fw-hero-drape, .fw-fin-drape { position: absolute; inset: 0; }
.fw-hero-drape img, .fw-fin-drape img { display: block; width: 100%; height: 100%; }
.fw-hero-drape img { opacity: 0; transform: scale(.94) translate3d(0, 14px, 0); transform-origin: 50% 100%; transition: opacity 1.3s ease, transform 1.6s var(--fw-ease); }
.fw-hero-swing, .fw-fin-swing { position: absolute; left: 13%; right: 13%; bottom: 3%; }
.fw-hero-swing { opacity: 0; transform: translate3d(0, -26px, 0); transition: opacity 1.2s ease .45s, transform 1.6s var(--fw-ease) .45s; }
.fw-hero-swing-in { display: block; transform-origin: 50% 6%; animation: fw-swing 5.2s ease-in-out infinite; }
.fw-hero-swing-in img { display: block; width: 100%; height: auto; }
.fw-hero-rocks { position: absolute; right: -16%; bottom: -3%; width: 46%; opacity: 0; transform: translate3d(24px, 0, 0); transition: opacity 1.1s ease .8s, transform 1.4s var(--fw-ease) .8s; }
.fw-hero-rocks img { display: block; width: 100%; height: auto; }
.fw-hero.is-open .fw-hero-glow { opacity: 1; }
.fw-hero.is-open .fw-hero-drape img, .fw-hero.is-open .fw-hero-swing, .fw-hero.is-open .fw-hero-rocks { opacity: 1; transform: none; }
.fw-hero-copy { position: relative; width: 100%; max-width: 560px; }
.fw-hero-swirl { position: absolute; z-index: -1; top: -30px; right: -10%; width: clamp(150px, 44vw, 330px); opacity: .55; }
.fw-hero-dear { margin: 0 0 4px; font: 400 clamp(26px, 7vw, 36px)/1.1 var(--wk-font-script); color: var(--fw-script); }
.fw-hero-copy .wk-eyebrow { margin-bottom: 4px; }
.fw-hero-names { margin: 12px 0 0; display: flex; flex-direction: column; align-items: center; font: 400 clamp(54px, 15vw, 118px)/.98 var(--wk-font-script); color: var(--fw-script); }
.fw-hero-n { display: block; max-width: 100%; overflow-wrap: anywhere; padding: 0 .08em; }
.fw-hero-amp { display: block; margin: -.04em 0 -.02em; font: italic 500 clamp(26px, 6vw, 42px)/1.1 var(--wk-font-display); color: var(--wk-gold-ink); }
.fw-hero-sub { margin: 8px 0 0; font: italic 500 clamp(18px, 4.6vw, 24px)/1.3 var(--wk-font-display); color: var(--wk-muted); }
.fw-hero-date { display: inline-flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 4px 12px; margin: 18px 0 0; padding: 11px 6px; border-top: 1px solid rgba(184,146,74,.55); border-bottom: 1px solid rgba(184,146,74,.55); font: 500 clamp(12px, 3.3vw, 14.5px)/1.3 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-ink); }
.fw-hero-date small { font: inherit; color: var(--wk-gold-ink); }
@media (max-width: 599px) { .fw-hero-date { flex-direction: column; align-items: center; gap: 4px; letter-spacing: .14em; font-size: 12.5px; padding: 10px 4px; } }
.fw-hero-venue { margin: 12px 0 0; font: 500 clamp(16px, 4.2vw, 19px)/1.4 var(--wk-font-display); color: var(--wk-muted); }
.fw-hero-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 22px; }
.fw-hero [class*="fw-hi-"] { opacity: 0; transform: translate3d(0, 16px, 0); transition: opacity 1s ease, transform 1.2s var(--fw-ease); }
.fw-hero.is-open [class*="fw-hi-"] { opacity: 1; transform: none; }
.fw-hero.is-open .fw-hi-1 { transition-delay: .25s; } .fw-hero.is-open .fw-hi-2 { transition-delay: .35s; }
.fw-hero.is-open .fw-hi-3 { transition-delay: .5s; } .fw-hero.is-open .fw-hi-4 { transition-delay: .68s; }
.fw-hero.is-open .fw-hi-5 { transition-delay: .82s; } .fw-hero.is-open .fw-hi-6 { transition-delay: 1s; }
.fw-hero.is-open .fw-hi-7 { transition-delay: 1.12s; } .fw-hero.is-open .fw-hi-8 { transition-delay: 1.22s; }
.fw-hero.is-open .fw-hi-9 { transition-delay: 1.36s; }
.fw-breeze { position: absolute; inset: 0; z-index: 4; pointer-events: none; overflow: hidden; }
.fw-breeze i { animation: fw-drift linear infinite; opacity: 0; }
.fw-cue { position: absolute; left: 50%; bottom: 14px; z-index: 5; width: 44px; height: 44px; margin-left: -22px; display: grid; place-items: center; border-radius: 50%; }
.fw-cue i { width: 2px; height: 22px; border-radius: 2px; background: linear-gradient(180deg, transparent, var(--wk-gold)); animation: fw-cue 2.2s ease-in-out infinite; }
.fw-hero.is-idle *, .fw-finale:not(.is-on) *, .fw-story.is-idle * { animation-play-state: paused !important; }
@media (min-width: 1024px) {
  .fw-hero { padding-top: 80px; }
  .fw-hero-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; justify-items: stretch; text-align: left; gap: clamp(32px, 4vw, 72px); }
  .fw-hero-art { justify-self: center; width: min(40vw, 74svh * .86, 560px); }
  .fw-hero-names { align-items: flex-start; margin-top: 18px; }
  .fw-hero-amp { padding-left: .6em; }
  .fw-hero-actions { justify-content: flex-start; }
  .fw-hero-date { justify-content: flex-start; padding-left: 0; padding-right: 0; }
  .fw-hero-swirl { top: -70px; right: -6%; }
}

/* ── section chrome ────────────────────────────────────────────────────── */
.fw-sec .wk-section-head::after { content: ""; display: block; width: 150px; height: 9px; margin: 16px auto 0; background: radial-gradient(circle, var(--wk-gold) 0 2.2px, transparent 2.8px) center / 9px 9px no-repeat, linear-gradient(90deg, transparent, rgba(184,146,74,.75) 22%, rgba(184,146,74,.75) 42%, transparent 46%, transparent 54%, rgba(184,146,74,.75) 58%, rgba(184,146,74,.75) 78%, transparent) center / 100% 1px no-repeat; }
.fw-sec .wk-h2 { font-weight: 500; }

/* ── the invitation card ───────────────────────────────────────────────── */
.fw-invite { position: relative; display: grid; gap: clamp(26px, 6vw, 40px); justify-items: center; }
.fw-mandala { position: absolute; inset: 10% -16px; z-index: 0; background: ${u("mandala")} center / 120px auto repeat; opacity: .5; -webkit-mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent); mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent); }
.fw-portrait { position: relative; z-index: 1; width: min(76vw, 400px); aspect-ratio: 1372 / 1600; }
.fw-portrait-pic { position: absolute; left: 15%; right: 13%; top: 13%; bottom: 2.5%; overflow: hidden; border-radius: 999px 999px 6px 6px; background: var(--wk-placeholder); box-shadow: 0 20px 40px -26px rgba(80,50,30,.55); }
.fw-portrait-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fw-portrait-drape { position: absolute; inset: 0; pointer-events: none; }
.fw-portrait-drape img { display: block; width: 100%; height: 100%; }
.fw-sheet { position: relative; z-index: 1; width: 100%; max-width: 660px; padding: clamp(40px, 8vw, 66px) clamp(22px, 6vw, 58px) clamp(36px, 7vw, 56px); text-align: center; border-radius: 3px; background: #fffaf3; box-shadow: 0 34px 64px -40px rgba(80,50,30,.55), 0 2px 8px -4px rgba(80,50,30,.18); }
.fw-root[data-wk-theme="powder"] .fw-sheet { background: #fdfcfa; }
.fw-sheet::before, .fw-sheet::after { content: ""; position: absolute; pointer-events: none; border-radius: 2px; }
.fw-sheet::before { inset: 10px; border: 1px solid rgba(184,146,74,.55); }
.fw-sheet::after { inset: 15px; border: 1px solid rgba(184,146,74,.25); }
.fw-sheet > * { position: relative; z-index: 1; }
.fw-sheet .fw-sheet-roses, .fw-sheet .fw-sheet-swirl { position: absolute; z-index: 2; pointer-events: none; }
.fw-sheet-roses { width: clamp(104px, 27vw, 186px); }
.fw-sheet-roses img { display: block; width: 100%; height: auto; }
.fw-sheet-roses.is-tl { top: clamp(-40px, -6vw, -26px); left: clamp(-34px, -5vw, -18px); }
.fw-sheet-roses.is-br { bottom: clamp(-36px, -5vw, -22px); right: clamp(-30px, -5vw, -16px); transform: rotate(180deg); }
.fw-sheet .fw-sheet-swirl { z-index: 0; left: -2%; bottom: 4%; width: 42%; opacity: .35; }
.fw-ganesha { margin: 0 auto 14px; }
.fw-ganesha img { display: block; width: clamp(46px, 11vw, 60px); height: auto; margin: 0 auto 6px; }
.fw-ganesha p { margin: 0; font-size: 15px; color: var(--wk-gold-ink); }
.fw-sheet-k { margin: 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-sheet-names { margin: 6px 0 18px; font: 400 clamp(40px, 11vw, 66px)/1.08 var(--wk-font-script); color: var(--fw-script); }
.fw-sheet-names span { font: italic 500 .42em/1 var(--wk-font-display); color: var(--wk-gold-ink); }
.fw-sheet-text { display: grid; gap: 18px; text-align: center; }
.fw-sheet-col p { margin: 0 0 .8em; font: 500 clamp(17px, 4.3vw, 19.5px)/1.66 var(--wk-font-display); color: var(--wk-ink); }
.fw-sheet-col p:last-child { margin-bottom: 0; }
.fw-sheet-col.is-deva p { font-family: var(--wk-font-deva), serif; font-size: clamp(16px, 4vw, 18px); line-height: 1.85; }
.fw-sheet-sign { margin: 22px 0 0; font: italic 500 18px/1.4 var(--wk-font-display); color: var(--wk-gold-ink); }
@media (min-width: 760px) {
  .fw-sheet-text.is-two { grid-template-columns: 1fr 1px 1fr; gap: 26px; text-align: left; }
  .fw-sheet-text.is-two::before { content: ""; grid-column: 2; grid-row: 1; background: linear-gradient(180deg, transparent, rgba(184,146,74,.6) 20%, rgba(184,146,74,.6) 80%, transparent); }
  .fw-sheet-text.is-two > .fw-sheet-col:first-child { grid-column: 1; grid-row: 1; }
  .fw-sheet-text.is-two > .fw-sheet-col.is-deva { grid-column: 3; grid-row: 1; }
}
@media (min-width: 1000px) {
  .fw-invite.has-portrait { grid-template-columns: minmax(0, .78fr) minmax(0, 1.22fr); align-items: center; gap: clamp(40px, 5vw, 72px); }
  .fw-invite.has-portrait .fw-portrait { width: min(100%, 420px); }
}

/* ── families ──────────────────────────────────────────────────────────── */
.fw-blessed { text-align: center; margin: -6px auto 30px; max-width: 560px; }
.fw-blessed-names { margin: 0; font: italic 500 clamp(18px, 4.6vw, 22px)/1.45 var(--wk-font-display); color: var(--wk-ink); }
.fw-fams { display: grid; gap: clamp(46px, 8vw, 30px); padding-top: 26px; }
@media (min-width: 720px) { .fw-fams { grid-template-columns: 1fr 1fr; gap: 30px; } }
.fw-fam { position: relative; padding: clamp(44px, 9vw, 56px) 24px 32px; text-align: center; border-radius: 50% 50% 12px 12px / 80px 80px 12px 12px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
.fw-fam::before { content: ""; position: absolute; inset: 8px; border-radius: 50% 50% 8px 8px / 74px 74px 8px 8px; border: 1px solid rgba(184,146,74,.35); pointer-events: none; }
.fw-fam-flower { position: absolute; top: -52px; width: clamp(96px, 24vw, 130px); }
.fw-fam-flower img { display: block; width: 100%; height: auto; }
.fw-fam-flower.is-l { left: -14px; transform: rotate(-10deg); }
.fw-fam-flower.is-r { right: -14px; transform: rotate(10deg); }
.fw-fam-photo { display: block; width: 104px; height: 104px; margin: 0 auto 16px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 3px #fff, 0 0 0 4px rgba(184,146,74,.6); }
.fw-fam-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fw-fam-names { margin: 4px 0 0; font: 600 clamp(20px, 5vw, 24px)/1.35 var(--wk-font-display); color: var(--wk-ink); }
.fw-fam-note { margin: 10px 0 0; font: 500 12px/1.3 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-muted); }

/* ── save the date ─────────────────────────────────────────────────────── */
.fw-datecard { position: relative; max-width: 540px; margin: 0 auto; padding: clamp(34px, 7vw, 48px) 22px clamp(28px, 6vw, 40px); text-align: center; overflow: hidden; border-radius: 4px; background: #fffaf3; border: 1px solid var(--wk-border); box-shadow: 0 30px 60px -40px rgba(80,50,30,.55); }
.fw-root[data-wk-theme="powder"] .fw-datecard { background: #fdfcfa; }
.fw-datecard::after { content: ""; position: absolute; inset: 9px; border: 1px solid rgba(184,146,74,.45); pointer-events: none; }
.fw-datecard-tile { position: absolute; inset: 0; background: ${u("mandala")} center / 110px auto repeat; opacity: .32; }
.fw-datecard > *:not(.fw-datecard-tile) { position: relative; }
.fw-datecard-wd { margin: 0; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .32em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-datecard-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: clamp(10px, 3vw, 22px); margin: 12px 0 10px; }
.fw-datecard-m, .fw-datecard-y { padding: 9px 0; border-top: 1px solid rgba(184,146,74,.6); border-bottom: 1px solid rgba(184,146,74,.6); font: 500 clamp(12px, 3.4vw, 15px)/1 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-ink); }
.fw-datecard-d { font: 500 clamp(76px, 22vw, 116px)/.9 var(--wk-font-display); color: var(--fw-script); }
.fw-datecard-t { margin: 8px 0 0; font: italic 500 clamp(17px, 4.4vw, 20px)/1.4 var(--wk-font-display); color: var(--wk-ink); }
.fw-datecard-v { margin: 8px 0 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-muted); }
.fw-count { margin-top: clamp(30px, 6vw, 44px); text-align: center; }

/* ── story ─────────────────────────────────────────────────────────────── */
.fw-story { position: relative; padding-top: 10px; }
.fw-vine { position: absolute; top: clamp(-150px, -16vw, -90px); width: clamp(64px, 13vw, 120px); z-index: 0; pointer-events: none; }
.fw-vine.is-l { left: -10px; }
.fw-vine.is-r { right: -10px; transform: scaleX(-1); }
.fw-vine img { display: block; width: 100%; height: auto; transform-origin: 50% 0; animation: fw-sway-s 7s ease-in-out infinite alternate; }
.fw-thread { position: absolute; top: 0; bottom: 0; left: 21px; width: 2px; z-index: 0; }
.fw-thread i { display: block; height: 100%; border-radius: 2px; background: linear-gradient(180deg, rgba(184,146,74,.2), var(--wk-gold) 12%, var(--wk-gold) 88%, rgba(184,146,74,.2)); transform-origin: 50% 0; transform: scaleY(var(--fw-p, 0)); }
.fw-chapters { position: relative; z-index: 1; list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(40px, 8vw, 80px); }
.fw-ch { position: relative; display: grid; gap: 18px; padding-left: 50px; }
.fw-ch-knot { position: absolute; left: 13px; top: 6px; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fbe6e1, #e6b9b3); box-shadow: 0 0 0 2px var(--wk-gold), 0 0 0 6px rgba(255,250,243,.9); }
.fw-ch-print { position: relative; display: block; max-width: 400px; padding: 10px 10px 40px; background: #fffdf8; box-shadow: 0 22px 40px -26px rgba(60,40,20,.55), 0 2px 6px -3px rgba(60,40,20,.2); transform: rotate(var(--tilt, -2deg)); }
.fw-ch-pic { position: relative; display: block; aspect-ratio: 4 / 3.2; overflow: hidden; background: var(--wk-placeholder); }
.fw-ch-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fw-ch-stamp { position: absolute; left: 0; right: 0; bottom: 8px; text-align: center; font: 400 24px/1 var(--wk-font-script); color: var(--fw-script); }
.fw-ch-deco { display: none; }
@media (min-width: 860px) { .fw-ch-deco { display: block; justify-self: end; width: min(220px, 60%); opacity: .9; } .fw-ch.is-alt .fw-ch-deco { order: 2; justify-self: start; } .fw-ch-deco img { display: block; width: 100%; height: auto; } }
.fw-ch-text { padding: 22px 22px 24px; border-radius: 3px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 18px 36px -30px rgba(60,40,20,.5); }
.fw-ch-when { margin: 0; font: 500 12px/1 var(--wk-font-caps); letter-spacing: .28em; color: var(--wk-gold-ink); }
.fw-ch-title { margin: 8px 0 6px; font: 400 clamp(32px, 8vw, 42px)/1.1 var(--wk-font-script); color: var(--fw-script); }
.fw-ch-line { margin: 0; font: 500 clamp(17px, 4.2vw, 19px)/1.6 var(--wk-font-display); color: var(--wk-ink); }
@media (min-width: 860px) {
  .fw-thread { left: 50%; margin-left: -1px; }
  .fw-ch { grid-template-columns: 1fr 1fr; gap: 72px; padding-left: 0; align-items: center; }
  .fw-ch-knot { left: 50%; top: 50%; margin: -9px 0 0 -9px; }
  .fw-ch-photo { justify-self: end; width: 100%; max-width: 400px; }
  .fw-ch.is-alt .fw-ch-photo { order: 2; justify-self: start; }
  .fw-ch.is-alt .fw-ch-text { order: 1; text-align: right; }
  .fw-ch.is-alt .fw-ch-deco { order: 2; }
}

/* ── functions ─────────────────────────────────────────────────────────── */
.fw-ev-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 26px; }
@media (min-width: 720px) { .fw-ev-list { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px 26px; } }
@media (min-width: 1240px) { .fw-ev-list { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.fw-ev { display: flex; }
.fw-ev-card { position: relative; width: 100%; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px; background: #fffaf3; border: 1px solid var(--wk-border); box-shadow: 0 26px 50px -38px rgba(60,40,20,.55), 0 2px 6px -4px rgba(60,40,20,.15); transition: transform .4s var(--fw-ease), box-shadow .4s; }
.fw-root[data-wk-theme="powder"] .fw-ev-card { background: #fdfcfa; }
.fw-ev-card::after { content: ""; position: absolute; inset: 8px; border: 1px solid rgba(184,146,74,.32); border-radius: 4px; pointer-events: none; }
@media (hover: hover) { .fw-ev-card:hover { transform: translate3d(0, -4px, 0); box-shadow: 0 34px 60px -38px rgba(60,40,20,.6), 0 2px 6px -4px rgba(60,40,20,.15); } }
.fw-ev-art { position: relative; display: flex; justify-content: center; padding: 22px 22px 0; }
.fw-ev-win { position: relative; display: block; width: min(210px, 64%); aspect-ratio: 4 / 4.7; overflow: hidden; border-radius: 999px 999px 10px 10px; background: #f6eee2; box-shadow: inset 0 0 0 1px rgba(184,146,74,.5); }
.fw-ev-wash { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .95; }
.fw-ev-img { position: absolute; left: 7%; bottom: 3%; width: 86%; height: 84%; object-fit: contain; object-position: 50% 100%; transform: scale(.88) translate3d(0, 12px, 0); opacity: 0; transform-origin: 50% 100%; transition: transform 1.4s var(--fw-ease) .25s, opacity 1s ease .2s; }
.fw-ev.is-in .fw-ev-img { transform: none; opacity: 1; }
.fw-ev-art.is-garland .fw-ev-img { height: 92%; bottom: 4%; }
.fw-ev-art.is-coupleStanding .fw-ev-img, .fw-ev-art.is-umbrella .fw-ev-img { height: 90%; }
.fw-ev-art.is-drapeSm .fw-ev-img { height: 92%; bottom: 0; }
.fw-ev-no { position: absolute; top: 18px; left: 22px; font: 500 12px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.fw-ev-body { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 16px 22px 24px; text-align: center; }
.fw-ev-date { margin: 0; font: 500 12px/1.3 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-ev-title { margin: 0 0 4px; font: 400 clamp(36px, 9vw, 44px)/1.1 var(--wk-font-script); color: var(--fw-script); }
.fw-ev-line { display: flex; justify-content: center; align-items: flex-start; gap: 8px; margin: 0; font: 500 16.5px/1.45 var(--wk-font-display); color: var(--wk-ink); }
.fw-ev-line svg { flex: none; margin-top: 3px; color: var(--wk-gold-ink); }
.fw-ev-line b { font-weight: 600; }
.fw-ev-addr { display: block; font-size: 15px; color: var(--wk-muted); }
.fw-ev-dress { align-items: center; }
.fw-ev-swatch { flex: none; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px rgba(184,146,74,.8); }
.fw-ev-swatch.is-none { background: conic-gradient(#f2c94c, #e7a3ae, #9db89a, #f2c94c); }
.fw-ev-k { font: 500 11px/1 var(--wk-font-caps); letter-spacing: .16em; text-transform: uppercase; color: var(--wk-gold-ink); margin-right: 4px; }
.fw-ev-note { margin: 4px 0 0; font: italic 500 16px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-ev-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: auto; padding-top: 16px; }
.fw-ev-all { text-align: center; margin-top: 34px; }

/* ── venue ─────────────────────────────────────────────────────────────── */
.fw-venue { display: grid; gap: 28px; align-items: center; }
@media (min-width: 900px) { .fw-venue { grid-template-columns: 1.05fr 1fr; gap: 56px; } }
.fw-venue-art { position: relative; width: min(100%, 520px); aspect-ratio: 1.12; margin: 0 auto; }
.fw-venue-wash { position: absolute; inset: 8% 6% 4%; overflow: hidden; border-radius: 48% 52% 44% 56% / 55% 45% 55% 45%; opacity: .9; }
.fw-venue-wash img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fw-venue-gazebo { position: absolute; left: 31%; bottom: 7%; width: 38%; }
.fw-venue-fountain { position: absolute; right: 3%; bottom: 3%; width: 36%; }
.fw-venue-leaf { position: absolute; top: 0; width: 30%; }
.fw-venue-leaf.is-gold { left: -2%; }
.fw-venue-leaf.is-green { right: -3%; top: 6%; width: 30%; transform: scaleX(-1); }
.fw-venue-art img { display: block; width: 100%; height: auto; }
.fw-venue-leaf img { transform-origin: 50% 100%; animation: fw-sway-s 6s ease-in-out infinite alternate; }
.fw-venue-text { text-align: center; }
.fw-venue-name { margin: 0; font: 400 clamp(40px, 10vw, 56px)/1.1 var(--wk-font-script); color: var(--fw-script); }
.fw-venue-addr { margin: 8px 0 0; font: 500 clamp(17px, 4.3vw, 19px)/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-venue-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 20px; }
.fw-venue-map { margin-top: 18px; aspect-ratio: 16 / 10; overflow: hidden; border-radius: 10px; border: 1px solid var(--wk-border); animation: fw-fade .5s ease; }
.fw-venue-map iframe { display: block; width: 100%; height: 100%; border: 0; }
.fw-venue-go { margin-top: 24px; padding-top: 16px; border-top: 1px dashed rgba(184,146,74,.6); text-align: left; }
.fw-venue-go-h { margin: 0 0 6px; font: 500 12px/1 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-venue-go-t { margin: 0; font: 500 17px/1.6 var(--wk-font-display); color: var(--wk-ink); }
@media (min-width: 900px) { .fw-venue-text { text-align: left; } .fw-venue-actions { justify-content: flex-start; } }

/* ── film ──────────────────────────────────────────────────────────────── */
.fw-film { position: relative; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 10px; background: #1b1512; box-shadow: 0 30px 60px -36px rgba(60,40,20,.6); }
.fw-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.fw-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: none; }
.fw-film-poster img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: .88; }
.fw-film-play { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; margin: -36px 0 0 -36px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: rgba(140,74,82,.86); box-shadow: 0 0 0 8px rgba(255,255,255,.18); transition: transform .3s var(--fw-ease); }
.fw-film-poster:hover .fw-film-play { transform: scale(1.06); }
.fw-film-label { position: absolute; left: 0; right: 0; bottom: 14px; text-align: center; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .24em; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.5); }

/* ── for our guests ────────────────────────────────────────────────────── */
.fw-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
@media (min-width: 720px) { .fw-know { grid-template-columns: 1fr 1fr; } }
.fw-tag { position: relative; padding: 20px 22px 20px 44px; border-radius: 4px 22px 22px 4px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 18px 36px -30px rgba(60,40,20,.5); }
.fw-tag-hole { position: absolute; left: 16px; top: 50%; width: 11px; height: 11px; margin-top: -5.5px; border-radius: 50%; border: 1.5px solid var(--wk-gold); background: var(--wk-bg); }
.fw-tag-h { margin: 0 0 4px; font: 500 12px/1.2 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-tag-t { margin: 0; font: 500 17px/1.55 var(--wk-font-display); color: var(--wk-ink); }
.fw-sub-h { margin: 0; font: 400 clamp(32px, 8vw, 40px)/1.15 var(--wk-font-script); color: var(--fw-script); }
.fw-sub-p { margin: 4px 0 16px; font: italic 500 17px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-contacts { margin-top: clamp(36px, 7vw, 54px); text-align: center; }
.fw-contact-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
@media (min-width: 720px) { .fw-contact-list { grid-template-columns: 1fr 1fr; } }
.fw-contact { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 12px; text-align: left; border-radius: 999px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 14px 30px -26px rgba(60,40,20,.5); }
.fw-contact-ini { flex: none; width: 46px; height: 46px; display: grid; place-items: center; border-radius: 50%; background: linear-gradient(135deg, #f6e1db, #ecdcc4); font: 600 20px/1 var(--wk-font-display); color: var(--fw-script); }
.fw-contact-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fw-contact-t b { font: 600 18px/1.2 var(--wk-font-display); color: var(--wk-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-contact-t small { font: 500 13px/1.2 var(--wk-font-sans); color: var(--wk-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-extras { display: grid; gap: 16px; margin-top: clamp(30px, 6vw, 44px); }
@media (min-width: 720px) { .fw-extras { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); } }
.fw-extra { padding: 26px 22px; text-align: center; border-radius: 8px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 18px 36px -30px rgba(60,40,20,.5); }
.fw-extra-note { margin: 0; font: italic 500 16px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-extra-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.fw-upi { margin: 0 0 16px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.fw-upi code { padding: 8px 14px; border-radius: 10px; background: var(--wk-surface-2); font: 600 15px/1.2 var(--wk-font-sans); color: var(--wk-ink); word-break: break-all; }
.fw-upi small { font: 500 13px/1.2 var(--wk-font-sans); color: var(--wk-muted); }
.fw-live-dot { display: inline-block; width: 10px; height: 10px; margin-right: 4px; border-radius: 50%; background: #cf4a5c; vertical-align: middle; animation: fw-dot 1.6s ease-in-out infinite; }

/* ── RSVP + blessings ──────────────────────────────────────────────────── */
.fw-sec-rsvp { overflow: visible; }
.fw-rsvp-peony { position: absolute; z-index: 0; top: clamp(120px, 20vw, 150px); right: clamp(-30px, -2vw, 0px); width: clamp(110px, 24vw, 180px); transform: rotate(10deg); pointer-events: none; }
.fw-rsvp-peony img { display: block; width: 100%; height: auto; }
.fw-rsvp { position: relative; z-index: 1; }
.fw-rsvp-dear { margin: 0 0 6px; text-align: center; font: 400 30px/1.2 var(--wk-font-script); color: var(--fw-script); }

/* ── finale ────────────────────────────────────────────────────────────── */
.fw-finale { position: relative; z-index: 1; overflow: hidden; padding: clamp(60px, 10vw, 110px) 16px clamp(150px, 24vw, 260px); text-align: center; }
.fw-fin-clouds { transform: translate3d(-50%, 0, 0); }
.fw-fin-in { position: relative; z-index: 3; max-width: 640px; margin: 0 auto; }
.fw-fin-stage { position: relative; width: min(66vw, 330px); aspect-ratio: 1372 / 1600; margin: 0 auto 84px; }
.fw-fin-swing .fw-hero-swing-in { animation-duration: 6s; }
.fw-fin-swing img { display: block; width: 100%; height: auto; }
.fw-wax { position: absolute; left: 50%; bottom: -58px; z-index: 3; width: 104px; height: 104px; margin: 0 0 0 -52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; opacity: 0; transform: scale(1.7) rotate(-8deg); transition: transform .6s cubic-bezier(.3,1.5,.5,1), opacity .3s ease; }
.fw-finale.is-pressed .fw-wax { opacity: 1; transform: none; }
.fw-wax-disc { position: absolute; inset: 0; border-radius: 47% 53% 50% 50% / 52% 48% 52% 48%; background: radial-gradient(circle at 36% 30%, #dc9aa0, var(--fw-wax1) 44%, var(--fw-wax2)); box-shadow: inset 0 -6px 10px rgba(60,10,20,.28), inset 0 4px 8px rgba(255,255,255,.3), 0 12px 22px -8px rgba(80,20,30,.55); }
.fw-wax-disc::after { content: ""; position: absolute; inset: 12%; border-radius: 50%; border: 2px solid rgba(255,235,230,.28); }
.fw-wax b, .fw-wax small { position: relative; color: rgba(255,244,240,.96); text-shadow: 0 -1px 0 rgba(60,10,20,.3); }
.fw-wax b { font-size: 16px; font-weight: 400; line-height: 1.2; }
.fw-wax small { font: 500 7px/1 var(--wk-font-caps); letter-spacing: .12em; text-transform: uppercase; }
.fw-wax-ring { position: absolute; inset: -14px; border-radius: 50%; border: 2px solid rgba(201,160,90,.7); opacity: 0; }
.fw-finale.is-pressed .fw-wax-ring { animation: fw-ring 1.3s ease-out .45s forwards; }
.fw-fin-names { margin: 6px 0 4px; font: 400 clamp(46px, 12vw, 82px)/1.05 var(--wk-font-script); color: var(--fw-script); }
.fw-fin-names span { font: italic 500 .45em/1 var(--wk-font-display); color: var(--wk-gold-ink); }
.fw-fin-line { margin: 4px 0 0; font: italic 500 clamp(17px, 4.4vw, 20px)/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-hashtag { margin: 12px 0 0; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.fw-fin-share { margin-top: 28px; }
.fw-share { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.fw-share-main { min-width: min(100%, 280px); }
.fw-share-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.fw-qr-scrim { position: fixed; inset: 0; z-index: 140; display: grid; place-items: center; padding: 16px; background: rgba(40,28,22,.55); animation: fw-fade .25s ease; }
.fw-qr { display: flex; flex-direction: column; align-items: center; gap: 12px; max-width: 100%; padding: 26px 24px 22px; border-radius: 18px; background: #fffaf3; box-shadow: 0 30px 70px -30px rgba(0,0,0,.5); animation: fw-pop .35s var(--fw-ease); }
.fw-qr svg { width: min(240px, 70vw); height: auto; }
.fw-qr-h { margin: 0; font: italic 500 17px/1.4 var(--wk-font-display); color: var(--wk-ink); }

/* ── lite + reduced motion ─────────────────────────────────────────────── */
.fw-root.is-lite .fw-breeze, .fw-root.is-lite .fw-petals { display: none; }
.fw-root.is-lite .fw-hero-par, .fw-root.is-lite .fw-hero-clouds { transform: none; }
@media (prefers-reduced-motion: reduce) {
  .fw-root *, .fw-root *::before, .fw-root *::after { animation: none !important; }
  .fw-wipe-clip, .fw-wipe-clip img, .fw-hero [class*="fw-hi-"], .fw-hero-drape img, .fw-hero-swing, .fw-hero-rocks, .fw-hero-glow, .fw-ev-img, .fw-wax { transition: none !important; transform: none !important; opacity: 1 !important; }
  .fw-wax-ring, .fw-breeze, .fw-petals { display: none; }
  .fw-hero-par, .fw-hero-clouds { transform: none !important; }
  .fw-hero-clouds { transform: translate3d(-50%, 0, 0) !important; }
}
`;
