// ─── Pampas & Peony — the page's own CSS (on top of the wedding kit's) ──────
// Light themes only. Colours come from the kit tokens (--wk-*) plus a few of
// our own (--fw-script for the names, --fw-wax* for the seals, --fw-env* for
// the envelope), set per theme below. Every animation is transform/opacity;
// loops pause off screen (.is-idle) and stop under reduced motion.

import { cdn } from "../../../_wedding/media";
import { ART } from "./art";

const u = (role: keyof typeof ART) => `url("${cdn(ART[role].src)}")`;

export const FW_CSS = `
.fw-root { --fw-r: clamp(14px, 1.5vw, 18px); --fw-r-in: clamp(9px, 1vw, 12px); --fw-script: #8c4a52; --fw-wax1: #b0646b; --fw-wax2: #84404a; --fw-env: #ecdccb; --fw-env-2: #e2cdb7; --fw-liner: #f6e6df; --fw-ease: cubic-bezier(.22,.8,.24,1); position: relative; overflow-x: clip; color: var(--wk-ink); }
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
/* Flat on purpose (no preserve-3d): each hinge brings its own perspective(), so z-index keeps the paper in order. */
.fw-envelope { --seal: clamp(70px, 18vw, 98px); --env-w: min(84vw, 460px); --env-h: calc(var(--env-w) / 1.42); position: relative; width: var(--env-w); aspect-ratio: 1.42; transition: transform 1.15s cubic-bezier(.45,.05,.25,1); }
@media (min-width: 768px) { .fw-envelope { --env-w: min(60vw, 540px); } }
.fw-env-back { position: absolute; inset: 0; border-radius: 6px; background: linear-gradient(180deg, var(--fw-env-2), var(--fw-env)); box-shadow: 0 34px 60px -32px rgba(80,50,30,.5), 0 4px 14px -6px rgba(80,50,30,.25); }
.fw-card { position: absolute; left: 5%; right: 5%; bottom: 5%; height: 88%; z-index: 2; transition: transform 1.1s cubic-bezier(.45,.05,.25,1), opacity 1s ease; }
.fw-card-face { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 6% 6%; text-align: center; border-radius: 3px; background: linear-gradient(180deg, rgba(255,250,242,.9), rgba(250,240,228,.9)), ${u("paperSoft")} center / cover, #fffaf2; box-shadow: 0 10px 24px -14px rgba(60,40,20,.4); }
.fw-card-face::before { content: ""; position: absolute; inset: 7px; border: 1px solid rgba(184,146,74,.6); border-radius: 2px; pointer-events: none; box-shadow: inset 0 0 0 3px rgba(255,250,242,.9), inset 0 0 0 4px rgba(184,146,74,.32); }
.fw-card-bloom { position: absolute; z-index: 0; bottom: -6%; height: 44%; width: auto; pointer-events: none; }
.fw-card-bloom.is-l { left: -5%; rotate: 8deg; } .fw-card-bloom.is-r { right: -5%; rotate: -8deg; scale: -1 1; }
.fw-card-face > span { position: relative; z-index: 1; }
/* The showcase: once the card rests in the middle, a slow band of gold light sweeps across it. */
.fw-card-face::after { content: ""; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none; background: linear-gradient(105deg, transparent 30%, rgba(255,236,190,.0) 38%, rgba(255,232,180,.55) 48%, rgba(255,255,255,.75) 50%, rgba(255,232,180,.55) 52%, transparent 62%) -160% 0 / 250% 100% no-repeat; mix-blend-mode: soft-light; }
.fw-env:is(.is-unfold, .is-leave) .fw-card-face::after { animation: fw-sheen 1.5s cubic-bezier(.4,0,.2,1) forwards; }
@keyframes fw-sheen { to { background-position: 160% 0; } }
.fw-card-k { margin-bottom: .5em; font: 500 clamp(9px, 2.4vw, 11px)/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
/* Script names keep their swashes: no clipping, a roomy line box, and long names wrap instead of being cut. */
.fw-card-n { font: 400 clamp(28px, 8vw, 48px)/1.3 var(--wk-font-script); color: var(--fw-script); max-width: 100%; padding: 0 .12em; overflow: visible; overflow-wrap: anywhere; }
.fw-card-amp { margin: -.15em 0; font: italic 500 clamp(14px, 3.6vw, 18px)/1 var(--wk-font-display); color: var(--wk-gold-ink); }
.fw-card-d { margin-top: .7em; font: 500 clamp(9px, 2.4vw, 11px)/1 var(--wk-font-caps); letter-spacing: .22em; color: var(--wk-muted); }
.fw-env-pocket { position: absolute; inset: 0; z-index: 4; border-radius: 6px; overflow: hidden; }
.fw-env-pocket-art { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.fw-env-to { position: absolute; left: 8%; right: 8%; bottom: 7%; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
.fw-env-rule { display: block; width: 46%; height: 9px; margin: 0 auto 4px; background: radial-gradient(circle, #c49a52 0 2.2px, transparent 2.6px) center / 9px 9px no-repeat, linear-gradient(90deg, transparent, rgba(196,154,82,.8) 30%, rgba(196,154,82,.8) 42%, transparent 46%, transparent 54%, rgba(196,154,82,.8) 58%, rgba(196,154,82,.8) 70%, transparent) center / 100% 1px no-repeat; }
.fw-env-to b { font: 400 clamp(22px, 6vw, 32px)/1.1 var(--wk-font-script); color: var(--fw-script); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* The flap: one piece of paper hinged on the envelope's top edge (its clip is in its own coordinates, so the
   tip ends up above the hinge once it has turned). The symmetric ease puts it edge-on at exactly half the time;
   there fw-flap-face swaps the outside for the lining and drops it behind the card. */
.fw-env-flap { position: absolute; left: 0; right: 0; top: 0; height: 58%; z-index: 5; pointer-events: none; transform-origin: 50% 0; transform: perspective(1100px) rotateX(0deg); filter: drop-shadow(0 3px 3px rgba(90,60,40,.16)); transition: transform 1s cubic-bezier(.45,.05,.55,.95), opacity .8s ease; }
@keyframes fw-flap-face { 0%, 49.9% { z-index: 5; } 50%, 100% { z-index: 1; } }
@keyframes fw-face-out { 0%, 49.9% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes fw-face-in { 0%, 49.9% { opacity: 0; } 50%, 100% { opacity: 1; } }
.fw-env-flap svg { display: block; width: 100%; height: 100%; overflow: visible; }
.fw-flap-in { opacity: 0; }
.fw-env:is(.is-flap, .is-rise, .is-out, .is-unfold, .is-leave) .fw-flap-out { animation: fw-face-out 1s linear forwards; }
.fw-env:is(.is-flap, .is-rise, .is-out, .is-unfold, .is-leave) .fw-flap-in { animation: fw-face-in 1s linear forwards; }
.fw-gold-line { stroke: #c49a52; stroke-width: 1.1; opacity: .85; }
.fw-gold-line.is-soft { stroke-width: .9; opacity: .5; }
/* A dried peony sprig tucked under the seal, on the pocket. */
.fw-env-sprig { position: absolute; z-index: 6; left: 50%; top: 58%; width: auto; height: calc(var(--seal) * 1.1); margin: calc(var(--seal) * -.62) 0 0 calc(var(--seal) * -1.12); rotate: -62deg; pointer-events: none; filter: drop-shadow(0 4px 6px rgba(80,50,30,.18)); transition: opacity .9s ease .15s; }
.fw-seal { position: absolute; left: 50%; top: 58%; width: var(--seal); height: var(--seal); margin: calc(var(--seal) / -2) 0 0 calc(var(--seal) / -2); z-index: 7; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.fw-env.is-ready.is-closed .fw-seal { animation: fw-pulse 2.4s ease-in-out 1.2s infinite; }
.fw-seal:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 6px; }
/* The seal: two SVG halves cut on one jagged line. The top half is stuck to the flap: it turns on the same hinge
   (its origin is the envelope's top edge, measured from the seal's own box) and hides once it faces away. */
.fw-seal-half { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 6px 8px rgba(80,20,30,.4)); }
.fw-seal-half.is-t { transform-origin: 50% calc(var(--seal) / 2 - var(--env-h) * .58); transform: perspective(1100px) rotateX(0deg); -webkit-backface-visibility: hidden; backface-visibility: hidden; transition: transform 1s cubic-bezier(.45,.05,.55,.95); }
.fw-seal-half.is-b { transition: transform .5s ease, opacity .9s ease .15s; }
.fw-seal-ini { font: 400 30px/1 var(--wk-font-script); fill: rgba(255,240,236,.95); paint-order: stroke; stroke: rgba(60,10,20,.25); stroke-width: .6px; }
.fw-seal-amp { font: italic 500 14px/1 var(--wk-font-display); }
.fw-seal-crack { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.fw-seal-crack polyline { stroke: rgba(70,12,24,.75); stroke-width: 2; stroke-linejoin: round; stroke-dasharray: 130; stroke-dashoffset: 130; }
.fw-crumbs { position: absolute; left: 0; right: 0; top: 50%; height: 0; pointer-events: none; }
.fw-crumbs i { position: absolute; top: 0; width: 5px; height: 4px; border-radius: 40% 60% 50% 50%; background: var(--fw-wax2); opacity: 0; }
.fw-crumbs i:nth-child(1) { left: 14%; --cx: -14px; } .fw-crumbs i:nth-child(2) { left: 30%; --cx: -6px; width: 4px; } .fw-crumbs i:nth-child(3) { left: 46%; --cx: 2px; }
.fw-crumbs i:nth-child(4) { left: 58%; --cx: 5px; width: 3px; } .fw-crumbs i:nth-child(5) { left: 72%; --cx: 10px; } .fw-crumbs i:nth-child(6) { left: 86%; --cx: 16px; width: 4px; }
@keyframes fw-seal-shake { 0%, 100% { rotate: 0deg; } 20% { rotate: -4deg; } 40% { rotate: 3.5deg; } 60% { rotate: -2deg; } 80% { rotate: 1deg; } }
@keyframes fw-crack { to { stroke-dashoffset: 0; } }
@keyframes fw-crumb { 0% { opacity: 0; transform: translate3d(0, 0, 0); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate3d(var(--cx), 46px, 0) rotate(160deg); } }
.fw-env-foot { text-align: center; }
.fw-env-cta { min-height: 50px; padding: 0 28px; border-radius: 999px; border: 1px solid transparent; cursor: pointer; font: 600 15px/1 var(--wk-font-sans); letter-spacing: .04em; color: var(--wk-ink); background: linear-gradient(var(--wk-surface-solid), var(--wk-surface-solid)) padding-box, var(--wk-foil) border-box; box-shadow: 0 10px 24px -16px rgba(80,50,30,.55); transition: transform .2s; }
.fw-env-cta:active { transform: scale(.97); }
.fw-env-hint { margin: 10px 0 0; font: italic 500 15px/1.4 var(--wk-font-display); color: var(--wk-muted); }
/* the sequence */
.fw-env:not(.is-closed) .fw-seal { pointer-events: none; }
.fw-env.is-crack .fw-seal { animation: fw-seal-shake .38s ease-in-out; }
.fw-env:not(.is-closed) .fw-seal-crack polyline { animation: fw-crack .3s ease-out .08s forwards; }
.fw-env:not(.is-closed) .fw-crumbs i { animation: fw-crumb .9s cubic-bezier(.4,0,.8,.6) .28s forwards; }
.fw-env:not(.is-closed) .fw-crumbs i:nth-child(even) { animation-delay: .36s; }
.fw-env:is(.is-flap, .is-rise, .is-out, .is-unfold, .is-leave) .fw-seal-half.is-t { transform: perspective(1100px) rotateX(-180deg); }
.fw-env:is(.is-flap, .is-rise, .is-out, .is-unfold, .is-leave) .fw-seal-crack { opacity: 0; transition: opacity .2s; }
.fw-env:is(.is-flap, .is-rise) .fw-seal-half.is-b { transform: translate3d(0, 2px, 0); }
.fw-env:not(.is-closed) .fw-env-foot, .fw-env:not(.is-closed) .fw-env-head { opacity: 0; transform: translate3d(0, 10px, 0); transition-delay: 0s; transition-duration: .5s; }
.fw-env.is-flap .fw-env-flap, .fw-env.is-rise .fw-env-flap, .fw-env.is-out .fw-env-flap, .fw-env.is-unfold .fw-env-flap, .fw-env.is-leave .fw-env-flap { transform: perspective(1100px) rotateX(-180deg); animation: fw-flap-face 1s linear forwards; }
/* rise: the card slides right out of the pocket while the envelope settles lower */
.fw-env.is-rise .fw-envelope { transform: translate3d(0, 12vh, 0); }
.fw-env.is-rise .fw-card { transform: translate3d(0, -100%, 0); }
/* out: clear of the pocket, the card comes in front and to the middle; the envelope slips away below */
.fw-env.is-out .fw-card, .fw-env.is-unfold .fw-card, .fw-env.is-leave .fw-card { z-index: 9; }
.fw-env.is-out .fw-envelope, .fw-env.is-unfold .fw-envelope, .fw-env.is-leave .fw-envelope { transform: translate3d(0, 34vh, 0); }
.fw-env.is-out .fw-card, .fw-env.is-unfold .fw-card { transform: translate3d(0, -34vh, 0) scale(1.16); }
.fw-env-back, .fw-env-pocket { transition: opacity .9s ease .15s; }
.fw-env:is(.is-out, .is-unfold, .is-leave) :is(.fw-env-back, .fw-env-pocket, .fw-env-flap, .fw-env-sprig, .fw-seal-half.is-b) { opacity: 0; }
/* unfold: the folded top opens on the names */
.fw-env.is-leave { opacity: 0; pointer-events: none; transition: opacity 1.2s cubic-bezier(.4,0,.2,1) .1s; }
/* A soft light blooms from the seal as it breaks and carries the eye into the card. */
.fw-env::after { content: ""; position: absolute; z-index: 1; left: 50%; top: 50%; width: 150vmax; height: 150vmax; margin: -75vmax 0 0 -75vmax; border-radius: 50%; pointer-events: none; opacity: 0; transform: scale(.1); background: radial-gradient(closest-side, rgba(255,250,244,.95), rgba(252,238,228,.6) 40%, rgba(252,238,228,0) 72%); }
.fw-env:not(.is-closed)::after { animation: fw-bloom 2.4s cubic-bezier(.22,1,.36,1) .1s forwards; }
@keyframes fw-bloom { 0% { opacity: 0; transform: scale(.1); } 30% { opacity: .7; } 100% { opacity: 0; transform: scale(1.1); } }
.fw-env.is-reduced::after { display: none; }
.fw-env.is-leave .fw-card { transform: translate3d(0, -40vh, 0) scale(1.34); opacity: 0; }
.fw-env.is-leave .fw-env-clouds { transform: translate3d(-50%, 12%, 0); }
.fw-env.is-reduced, .fw-env.is-reduced * { transition-duration: .01ms !important; transition-delay: 0s !important; animation: none !important; }
.fw-env.is-reduced.is-leave { transition: opacity .4s ease !important; }
.fw-petals { position: absolute; inset: 0; z-index: 7; pointer-events: none; overflow: hidden; }
.fw-petals i, .fw-breeze i { position: absolute; top: -4%; border-radius: 60% 0 60% 40%; background: radial-gradient(circle at 30% 30%, #fff8f4, var(--tone, #efcfc9) 70%); box-shadow: 0 1px 2px rgba(120,60,60,.12); }
.fw-petals i { animation: fw-fall linear forwards; }

/* ── language toggle ───────────────────────────────────────────────────── */
.fw-lang { position: fixed; top: calc(12px + var(--vw-top-space, 0px)); left: 12px; z-index: 90; display: flex; padding: 3px; border-radius: 999px; background: rgba(255,252,246,.88); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border: 1px solid var(--wk-border); box-shadow: 0 8px 20px -14px rgba(80,50,30,.5); }
.fw-lang { transition: transform .4s var(--fw-ease), opacity .3s; }
/* Music + language sit in the top-left corner, in the same row as the Back/Create pill. */
.fw-lang { top: 8px; left: 60px; right: auto; }
.fw-lang.is-tucked { transform: translateY(calc(-100% - 16px)); opacity: 0; pointer-events: none; }
.fw-lang:focus-within { transform: none; opacity: 1; pointer-events: auto; }
.fw-lang button { min-width: 44px; min-height: 42px; padding: 0 10px; border: 0; border-radius: 999px; background: none; font: 600 13px/1 var(--wk-font-sans); color: var(--wk-ink); cursor: pointer; transition: background-color .25s, color .25s; }
.fw-lang button[aria-pressed="true"] { background: var(--fw-script); color: #fff8f4; }

/* ── the luxury finish: a double gold hairline frame and gold-foil type ── */
.fw-frame { position: absolute; z-index: 6; inset: clamp(10px, 1.4vw, 20px); border: 1px solid rgba(184,140,72,.6); border-radius: clamp(14px, 1.6vw, 22px); pointer-events: none; }
.fw-frame::before { content: ""; position: absolute; inset: 5px; border: 1px solid rgba(184,140,72,.3); border-radius: inherit; }
.fw-frame::after { content: ""; position: absolute; left: 50%; bottom: -5px; width: 9px; height: 9px; translate: -50% 0; rotate: 45deg; background: linear-gradient(135deg, #f3dca4, #b98a3e); box-shadow: 0 0 0 3px rgba(255,250,243,.9); }
.fw-env .fw-frame { z-index: 3; }
.fw-hero-amp, .fw-fin-names span, .fw-sheet-names span { background: linear-gradient(100deg, #8a5a1e 0%, #d9b064 30%, #a5752f 52%, #e8c77e 74%, #8a5a1e 100%); -webkit-background-clip: text; background-clip: text; color: transparent !important; }

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
.fw-hero-art { position: relative; width: min(92vw, 52svh, 600px); aspect-ratio: 800 / 789; }
.fw-hero-par { position: absolute; inset: 0; transform: translate3d(0, calc(var(--fw-hy, 0px) * .1), 0); }
.fw-hero-swing, .fw-fin-swing { position: absolute; left: 0; right: 0; bottom: 0; -webkit-mask-image: linear-gradient(180deg, #000 82%, transparent); mask-image: linear-gradient(180deg, #000 82%, transparent); }
/* No wooden frame: the swing stands in a fine double gold arch with a soft blush glow inside. */
.fw-hero-arch { position: absolute; z-index: -1; left: 7%; right: 7%; top: -6%; bottom: 4%; border-radius: 999px 999px 0 0; border: 1px solid rgba(184,140,72,.55); border-bottom: 0; background: radial-gradient(70% 60% at 50% 62%, rgba(250,226,220,.75), rgba(250,232,226,.25) 60%, transparent 80%); -webkit-mask-image: linear-gradient(180deg, #000 70%, transparent); mask-image: linear-gradient(180deg, #000 70%, transparent); opacity: 0; transition: opacity 1.4s ease .2s; }
.fw-hero-arch::before { content: ""; position: absolute; inset: 9px 9px 0; border-radius: inherit; border: 1px solid rgba(184,140,72,.3); border-bottom: 0; }
.fw-hero.is-open .fw-hero-arch, .fw-finale.is-pressed .fw-hero-arch { opacity: 1; }
.fw-hero-swing { opacity: 0; transform: translate3d(0, -26px, 0); transition: opacity 1.2s ease .45s, transform 1.6s var(--fw-ease) .45s; }
/* The swing stays still (no sway). */
.fw-hero-swing-in { display: block; }
.fw-hero-swing-in img { display: block; width: 100%; height: auto; }
.fw-hero.is-open .fw-hero-swing { opacity: 1; transform: none; }
/* The swing rests on a soft shadow of ground, not on air. */
.fw-hero-par::after { content: ""; position: absolute; z-index: -1; left: 6%; right: 6%; bottom: -2%; height: 9%; border-radius: 50%; background: radial-gradient(closest-side, rgba(150,110,80,.22), rgba(150,110,80,0)); }
/* Beige peonies in the top corners, as on the card. */
.fw-hero-peony { position: absolute; top: -4%; z-index: 2; width: clamp(130px, 36vw, 300px); opacity: 0; transform: translate3d(0, -20px, 0); transition: opacity 1.4s ease .3s, transform 1.8s var(--fw-ease) .3s; }
.fw-hero-peony img { display: block; width: 100%; height: auto; }
.fw-hero-peony.is-l { left: -9%; rotate: 150deg; }
.fw-hero-peony.is-r { right: -9%; rotate: -150deg; scale: -1 1; }
.fw-hero.is-open .fw-hero-peony { opacity: .95; transform: none; }
/* Phones and tablets (as on the card): the names on top under a faint line-art arch, the couple on their swing below. */
@media (max-width: 1023px) {
  .fw-hero { align-items: stretch; padding: 76px 16px 0; }
  .fw-hero-grid { min-height: calc(100svh - 76px); grid-template-rows: auto 1fr; gap: 0; }
  .fw-hero-copy { order: 1; padding-top: clamp(18px, 4svh, 40px); }
  .fw-hero-copy::after { content: ""; position: absolute; z-index: -1; left: 50%; top: 0; width: min(86vw, 420px); height: calc(100% + 30px); translate: -50% 0; border: 1px solid rgba(184,146,74,.4); border-bottom: 0; border-radius: 999px 999px 0 0; -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent); mask-image: linear-gradient(180deg, #000 60%, transparent); pointer-events: none; }
  .fw-hero-art { order: 2; align-self: end; margin-bottom: -2px; }
  .fw-hero-swirl { display: none; }
  .fw-hero-names { font-size: clamp(54px, 16vw, 88px); }
  .fw-hero-par::after { bottom: 2%; }
  .fw-cue { display: none; }
}
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
  /* The swing and the names as one centred group. */
  .fw-hero-grid { grid-template-columns: auto fit-content(560px); justify-content: center; align-items: center; justify-items: stretch; text-align: left; gap: clamp(40px, 5vw, 96px); }
  .fw-hero-art { justify-self: center; width: min(38vw, 66svh, 600px); }
  .fw-hero-names { align-items: flex-start; margin-top: 18px; }
  .fw-hero-amp { padding-left: .6em; }
  .fw-hero-actions { justify-content: flex-start; }
  .fw-hero-date { justify-content: flex-start; padding-left: 0; padding-right: 0; }
  .fw-hero-swirl { top: -70px; right: -6%; }
}

/* ── section chrome ────────────────────────────────────────────────────── */
.fw-sec .wk-section-head::after { content: ""; display: block; width: 150px; height: 9px; margin: 16px auto 0; background: radial-gradient(circle, var(--wk-gold) 0 2.2px, transparent 2.8px) center / 9px 9px no-repeat, linear-gradient(90deg, transparent, rgba(184,146,74,.75) 22%, rgba(184,146,74,.75) 42%, transparent 46%, transparent 54%, rgba(184,146,74,.75) 58%, rgba(184,146,74,.75) 78%, transparent) center / 100% 1px no-repeat; }
.fw-sec .wk-h2 { font-weight: 500; }
/* One rhythm for every section (the kit's 120px block padding reads as dead space on a laptop), and
   anchor jumps land below the fixed top bar / language pill. */
.fw-root > .fw-sec { padding-top: clamp(56px, 7.5vw, 104px); padding-bottom: clamp(56px, 7.5vw, 104px); scroll-margin-top: calc(64px + var(--vw-top-space, 0px)); }
.fw-root > .fw-sec .wk-section-head { margin-bottom: clamp(26px, 4vw, 44px); }

/* ── the invitation card ───────────────────────────────────────────────── */
/* a little more side room than the kit's 16px, so the corner roses never touch the screen edge */
.fw-root > .fw-sec-invite { padding-left: clamp(18px, 3vw, 40px); padding-right: clamp(18px, 3vw, 40px); }
.fw-invite { position: relative; display: grid; gap: clamp(26px, 6vw, 40px); justify-items: center; }
.fw-mandala { position: absolute; inset: 10% -16px; z-index: 0; background: ${u("mandala")} center / 120px auto repeat; opacity: .5; -webkit-mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 45%, transparent 100%); mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 45%, transparent 100%); }
/* The couple's photo in an arched window: a fine double gold rim on ivory, beige peonies over the top-left
   shoulder and a pink peony bunch at the bottom-right foot (the same art as the card and the RSVP). */
.fw-portrait { position: relative; z-index: 1; width: min(76vw, 380px); aspect-ratio: 4 / 5.2; }
.fw-portrait-pic { position: absolute; inset: 0; overflow: hidden; border-radius: 999px 999px 22px 22px; background: var(--wk-placeholder); box-shadow: 0 0 0 1px rgba(184,140,72,.6), 0 0 0 8px #fffaf3, 0 0 0 9px rgba(184,140,72,.4), 0 34px 60px -30px rgba(80,50,30,.45); }
.fw-portrait-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fw-portrait-bloom { position: absolute; z-index: 2; height: auto; pointer-events: none; filter: drop-shadow(0 8px 10px rgba(80,50,30,.18)); }
.fw-portrait-bloom.is-t { top: -9%; left: -16%; width: 52%; rotate: -14deg; }
.fw-portrait-bloom.is-b { bottom: -10%; right: -14%; width: 44%; rotate: -8deg; scale: -1 1; }
.fw-sheet { position: relative; z-index: 1; width: 100%; max-width: 660px; padding: clamp(40px, 8vw, 66px) clamp(22px, 6vw, 58px) clamp(36px, 7vw, 56px); text-align: center; border-radius: var(--fw-r); background: #fffaf3; box-shadow: 0 34px 64px -40px rgba(80,50,30,.55), 0 2px 8px -4px rgba(80,50,30,.18); }
.fw-root[data-wk-theme="powder"] .fw-sheet { background: #fdfcfa; }
.fw-sheet::before, .fw-sheet::after { content: ""; position: absolute; pointer-events: none; border-radius: calc(var(--fw-r) - 8px); }
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
@media (min-width: 1100px) {
  .fw-invite.has-portrait { grid-template-columns: minmax(0, .78fr) minmax(0, 1.22fr); align-items: center; gap: clamp(40px, 5vw, 72px); }
  .fw-invite.has-portrait .fw-portrait { width: min(100%, 420px); }
}

/* ── families ──────────────────────────────────────────────────────────── */
.fw-blessed { text-align: center; margin: -6px auto 30px; max-width: 560px; }
.fw-blessed-names { margin: 0; font: italic 500 clamp(18px, 4.6vw, 22px)/1.45 var(--wk-font-display); color: var(--wk-ink); }
.fw-fams { display: grid; gap: 46px; padding-top: 30px; }
@media (min-width: 720px) { .fw-fams { grid-template-columns: 1fr 1fr; gap: 30px; } }
.fw-fam { --fw-posy: clamp(84px, 13vw, 116px); position: relative; padding: calc(var(--fw-posy) * .45 + 16px) 24px 32px; text-align: center; border-radius: var(--fw-r); background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
.fw-fam::before { content: ""; position: absolute; inset: 8px; border-radius: calc(var(--fw-r) - 6px); border: 1px solid rgba(184,146,74,.35); pointer-events: none; }
/* The posy sits on the card's top corner, clear of the eyebrow: the card's top padding grows with it. */
.fw-fam-flower { position: absolute; top: calc(var(--fw-posy) * -.55); width: var(--fw-posy); }
.fw-fam-flower img { display: block; width: 100%; height: auto; }
.fw-fam-flower.is-l { left: calc(var(--fw-posy) * -.2); transform: rotate(-10deg); }
.fw-fam-flower.is-r { right: calc(var(--fw-posy) * -.2); transform: rotate(10deg); }
.fw-fam-photo { display: block; width: 112px; height: 136px; margin: 0 auto 16px; border-radius: 14px; overflow: hidden; box-shadow: 0 0 0 3px #fff, 0 0 0 4px rgba(184,146,74,.6); }
.fw-fam-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fw-fam-names { margin: 4px 0 0; font: 600 clamp(20px, 5vw, 24px)/1.35 var(--wk-font-display); color: var(--wk-ink); }
.fw-fam-note { margin: 10px 0 0; font: 500 12px/1.3 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-muted); }

/* ── save the date ─────────────────────────────────────────────────────── */
.fw-datecard { position: relative; max-width: 540px; margin: 0 auto; padding: clamp(34px, 7vw, 48px) 22px clamp(28px, 6vw, 40px); text-align: center; overflow: hidden; border-radius: var(--fw-r); background: #fffaf3; border: 1px solid var(--wk-border); box-shadow: 0 30px 60px -40px rgba(80,50,30,.55); }
.fw-root[data-wk-theme="powder"] .fw-datecard { background: #fdfcfa; }
.fw-datecard::after { content: ""; position: absolute; inset: 9px; border: 1px solid rgba(184,146,74,.45); border-radius: calc(var(--fw-r) - 7px); pointer-events: none; }
.fw-datecard-tile { position: absolute; inset: 0; background: ${u("mandala")} center / 110px auto repeat; opacity: .32; }
.fw-datecard > *:not(.fw-datecard-tile) { position: relative; }
.fw-datecard-wd { margin: 0; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .32em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-datecard-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: clamp(10px, 3vw, 22px); margin: 12px 0 10px; }
.fw-datecard-m, .fw-datecard-y { padding: 9px 0; border-top: 1px solid rgba(184,146,74,.6); border-bottom: 1px solid rgba(184,146,74,.6); font: 500 clamp(12px, 3.4vw, 15px)/1 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-ink); }
.fw-datecard-d { font: 500 clamp(76px, 22vw, 116px)/.9 var(--wk-font-display); color: var(--fw-script); }
.fw-datecard-t { margin: 8px 0 0; font: italic 500 clamp(17px, 4.4vw, 20px)/1.4 var(--wk-font-display); color: var(--wk-ink); }
.fw-datecard-v { margin: 8px 0 0; font: 500 12px/1.4 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-muted); }
.fw-count { margin-top: clamp(30px, 6vw, 44px); text-align: center; }
/* The days card can hold three digits ("120"): the kit's flip is sized for two. */
.fw-count .wk-cd-unit:first-child .wk-flip, .fw-count .wk-cd-unit:first-child .wk-roll { min-width: clamp(74px, 20vw, 118px); }
@media (min-width: 1024px) {
  /* Desktop: the date card and the countdown side by side, not a phone column. */
  .fw-sec-date { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); grid-template-areas: "head head" "card count" "card cta"; column-gap: clamp(28px, 4vw, 72px); align-items: center; }
  .fw-sec-date > .wk-section-head { grid-area: head; }
  .fw-sec-date > .fw-datecard { grid-area: card; width: 100%; max-width: none; margin: 0; }
  .fw-sec-date > .fw-count { grid-area: count; align-self: end; margin-top: 0; }
  .fw-sec-date > .fw-center { grid-area: cta; align-self: start; }
  /* a small laptop: the 3-digit days card shrinks so all four units fit their column */
  .fw-count .wk-cd-unit:first-child .wk-flip, .fw-count .wk-cd-unit:first-child .wk-roll { min-width: clamp(84px, 7.6vw, 118px); }
}

/* ── story ─────────────────────────────────────────────────────────────── */
.fw-story { position: relative; padding-top: 10px; }
.fw-thread { position: absolute; top: 0; bottom: 0; left: 21px; width: 2px; z-index: 0; }
.fw-thread i { display: block; height: 100%; border-radius: 2px; background: linear-gradient(180deg, rgba(184,146,74,.2), var(--wk-gold) 12%, var(--wk-gold) 88%, rgba(184,146,74,.2)); transform-origin: 50% 0; transform: scaleY(var(--fw-p, 0)); }
.fw-chapters { position: relative; z-index: 1; list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(40px, 8vw, 80px); }
.fw-ch { position: relative; display: grid; gap: 18px; padding-left: 50px; }
.fw-ch-knot { position: absolute; left: 13px; top: 6px; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fbe6e1, #e6b9b3); box-shadow: 0 0 0 2px var(--wk-gold), 0 0 0 6px rgba(255,250,243,.9); }
.fw-ch-print { position: relative; display: block; max-width: 400px; padding: 10px 10px 40px; border-radius: var(--fw-r); background: #fffdf8; box-shadow: 0 22px 40px -26px rgba(60,40,20,.55), 0 2px 6px -3px rgba(60,40,20,.2); transform: rotate(var(--tilt, -2deg)); }
.fw-ch-pic { position: relative; display: block; aspect-ratio: 4 / 3.2; overflow: hidden; border-radius: var(--fw-r-in); background: var(--wk-placeholder); }
.fw-ch-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fw-ch-stamp { position: absolute; left: 0; right: 0; bottom: 8px; text-align: center; font: 400 24px/1 var(--wk-font-script); color: var(--fw-script); }
.fw-ch-deco { display: none; }
@media (min-width: 860px) { .fw-ch-deco { display: block; justify-self: end; width: min(220px, 60%); opacity: .9; } .fw-ch.is-alt .fw-ch-deco { order: 2; justify-self: start; } .fw-ch-deco img { display: block; width: 100%; height: auto; } }
.fw-ch-text { padding: 22px 22px 24px; border-radius: var(--fw-r); background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 18px 36px -30px rgba(60,40,20,.5); }
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
/* Flex, not grid: a last row that isn't full (5 functions on 3 columns) sits centred. */
.fw-ev-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 26px; }
.fw-ev { display: flex; flex: 0 0 100%; min-width: 0; }
@media (min-width: 720px) { .fw-ev-list { gap: 30px 26px; } .fw-ev { flex-basis: calc((100% - 26px) / 2); } }
@media (min-width: 1240px) { .fw-ev { flex-basis: calc((100% - 52px) / 3); } }
/* Phones: a swipe row, every card centred (side padding = half the free width), dots under it. */
@media (max-width: 719px) {
  .fw-ev-list { flex-wrap: nowrap; justify-content: flex-start; margin: 0 -16px; padding: 6px 8vw 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .fw-ev-list::-webkit-scrollbar { display: none; }
  .fw-ev { flex: 0 0 84vw; scroll-snap-align: center; }
}
.fw-ev-dots { display: flex; justify-content: center; gap: 8px; margin-top: 16px; }
.fw-ev-dots button { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 999px; background: color-mix(in srgb, var(--fw-script) 28%, transparent); cursor: pointer; transition: width .3s var(--fw-ease), background-color .3s; }
.fw-ev-dots button.is-on { width: 24px; background: var(--fw-script); }
@media (min-width: 720px) { .fw-ev-dots { display: none; } }
.fw-ev-actions .fw-ev-dir { flex: 1 1 100%; }
.fw-ev-card { position: relative; width: 100%; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--fw-r); background: #fffaf3; border: 1px solid var(--wk-border); box-shadow: none; transition: transform .4s var(--fw-ease); }
.fw-root[data-wk-theme="powder"] .fw-ev-card { background: #fdfcfa; }
.fw-ev-card::after { content: ""; position: absolute; inset: 8px; border: 1px solid rgba(184,146,74,.32); border-radius: calc(var(--fw-r) - 6px); pointer-events: none; }
@media (hover: hover) { .fw-ev-card:hover { transform: translate3d(0, -4px, 0); } }
.fw-ev-art { position: relative; display: flex; justify-content: center; padding: 22px 22px 0; }
.fw-ev-win { position: relative; display: block; width: min(240px, 74%); aspect-ratio: 4 / 4.4; overflow: hidden; border-radius: var(--fw-r); background: #f6eee2; box-shadow: inset 0 0 0 1px rgba(184,146,74,.5); }
.fw-ev-wash { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .95; }
.fw-ev-img { position: absolute; left: 7%; bottom: 3%; width: 86%; height: 84%; object-fit: contain; object-position: 50% 100%; transform: scale(.88) translate3d(0, 12px, 0); opacity: 0; transform-origin: 50% 100%; transition: transform 1.4s var(--fw-ease) .25s, opacity 1s ease .2s; }
.fw-ev.is-in .fw-ev-img { transform: none; opacity: 1; }
.fw-ev-art.is-garland .fw-ev-img { height: 92%; bottom: 4%; }
.fw-ev-art.is-coupleStanding .fw-ev-img, .fw-ev-art.is-umbrella .fw-ev-img { height: 90%; }
.fw-ev-art.is-drapeSm .fw-ev-img { height: 92%; bottom: 0; }
.fw-ev-no { position: absolute; top: 18px; left: 22px; font: 500 12px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.fw-ev-body { flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 16px 18px 24px; text-align: center; }
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
.fw-ev-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: auto; padding-top: 16px; }
/* tighter chips so Directions · Add to calendar · WhatsApp share one row on a phone and in the 2-up tablet grid */
.fw-ev-actions .fw-chip { padding: 0 11px; gap: 6px; }
.fw-ev-actions .fw-chip-icon { padding: 0; }

/* ── venue ─────────────────────────────────────────────────────────────── */
/* Royal-style: the blush gazebo stands on the card's top edge; ivory card, double gold hairline, peony corners. */
.fw-venue { position: relative; display: grid; justify-items: center; }
.fw-venue-gazebo { position: relative; z-index: 0; width: auto; height: clamp(220px, 50vw, 320px); margin-bottom: -26px; filter: drop-shadow(0 16px 18px rgba(120,60,60,.14)); }
.fw-venue-card { position: relative; z-index: 1; width: 100%; max-width: 680px; padding: clamp(34px, 6vw, 52px) clamp(22px, 5vw, 52px) clamp(30px, 5vw, 44px); text-align: center; border-radius: var(--fw-r); background: #fffaf3; box-shadow: 0 0 0 1px rgba(184,140,72,.5), 0 34px 70px -40px rgba(80,50,30,.4); }
.fw-venue-card::before { content: ""; position: absolute; inset: 8px; border: 1px solid rgba(184,140,72,.35); border-radius: calc(var(--fw-r) - 6px); pointer-events: none; }
.fw-venue-corner { position: absolute; z-index: 2; bottom: clamp(-40px, -4vw, -20px); height: clamp(100px, 20vw, 170px); pointer-events: none; }
.fw-venue-corner img { display: block; height: 100%; width: auto; }
.fw-venue-corner.is-l { left: clamp(-48px, -5vw, -18px); rotate: -12deg; }
.fw-venue-corner.is-r { right: clamp(-48px, -5vw, -18px); rotate: 12deg; scale: -1 1; }
.fw-venue-name { margin: 0; font: 400 clamp(40px, 10vw, 56px)/1.1 var(--wk-font-script); color: var(--fw-script); }
.fw-venue-addr { margin: 8px 0 0; font: 500 clamp(17px, 4.3vw, 19px)/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-venue-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 20px; }
.fw-venue-map { margin-top: 18px; aspect-ratio: 16 / 10; overflow: hidden; border-radius: var(--fw-r); border: 1px solid var(--wk-border); animation: fw-fade .5s ease; }
.fw-venue-map iframe { display: block; width: 100%; height: 100%; border: 0; }
.fw-venue-go { max-width: 46ch; margin: 24px auto 0; padding-top: 18px; border-top: 1px solid rgba(184,146,74,.4); text-align: center; }
.fw-venue-go-h { margin: 0 0 6px; font: 500 12px/1 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-venue-go-t { margin: 0; font: 500 17px/1.6 var(--wk-font-display); color: var(--wk-ink); }

/* ── film ──────────────────────────────────────────────────────────────── */
.fw-film { position: relative; aspect-ratio: 16 / 9; overflow: hidden; border-radius: var(--fw-r); background: #1b1512; box-shadow: 0 30px 60px -36px rgba(60,40,20,.6); }
.fw-film iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.fw-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: none; }
.fw-film-poster img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: .88; }
.fw-film-play { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; margin: -36px 0 0 -36px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: rgba(140,74,82,.86); box-shadow: 0 0 0 8px rgba(255,255,255,.18); transition: transform .3s var(--fw-ease); }
.fw-film-poster:hover .fw-film-play { transform: scale(1.06); }
.fw-film-label { position: absolute; left: 0; right: 0; bottom: 14px; text-align: center; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .24em; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.5); }

/* ── album ───────────────────────────────────────────────────────────── */
/* A designed wall, not an edge-to-edge strip: capped at 1120px and centred. */
.fw-album { max-width: 1120px; margin-left: auto; margin-right: auto; }

/* ── for our guests ────────────────────────────────────────────────────── */
.fw-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
@media (min-width: 720px) { .fw-know { grid-template-columns: 1fr 1fr; } }
.fw-tag { position: relative; padding: 20px 22px 20px 44px; border-radius: var(--fw-r); background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 18px 36px -30px rgba(60,40,20,.5); }
.fw-tag-hole { position: absolute; left: 16px; top: 50%; width: 11px; height: 11px; margin-top: -5.5px; border-radius: 50%; border: 1.5px solid var(--wk-gold); background: var(--wk-bg); }
.fw-tag-h { margin: 0 0 4px; font: 500 12px/1.2 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-gold-ink); }
.fw-tag-t { margin: 0; font: 500 17px/1.55 var(--wk-font-display); color: var(--wk-ink); }
.fw-sub-h { margin: 0; font: 400 clamp(32px, 8vw, 40px)/1.15 var(--wk-font-script); color: var(--fw-script); }
.fw-sub-p { margin: 4px 0 16px; font: italic 500 17px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-contacts { margin-top: clamp(36px, 7vw, 54px); text-align: center; }
.fw-contact-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
@media (min-width: 720px) { .fw-contact-list { grid-template-columns: 1fr 1fr; } }
.fw-contact { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 12px; text-align: left; border-radius: var(--fw-r); background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 14px 30px -26px rgba(60,40,20,.5); }
.fw-contact-ini { flex: none; width: 46px; height: 46px; display: grid; place-items: center; border-radius: 12px; background: linear-gradient(135deg, #f6e1db, #ecdcc4); font: 600 20px/1 var(--wk-font-display); color: var(--fw-script); }
.fw-contact-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fw-contact-t b { font: 600 18px/1.2 var(--wk-font-display); color: var(--wk-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-contact-t small { font: 500 13px/1.2 var(--wk-font-sans); color: var(--wk-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fw-extras { display: grid; gap: 16px; margin-top: clamp(30px, 6vw, 44px); }
@media (min-width: 720px) { .fw-extras { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); } }
.fw-extra { padding: 26px 22px; text-align: center; border-radius: var(--fw-r); background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: 0 18px 36px -30px rgba(60,40,20,.5); }
.fw-extra-note { margin: 0; font: italic 500 16px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-extra-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.fw-upi { margin: 0 0 16px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.fw-upi code { padding: 8px 14px; border-radius: 10px; background: var(--wk-surface-2); font: 600 15px/1.2 var(--wk-font-sans); color: var(--wk-ink); word-break: break-all; }
.fw-upi small { font: 500 13px/1.2 var(--wk-font-sans); color: var(--wk-muted); }
.fw-live-dot { display: inline-block; width: 10px; height: 10px; margin-right: 4px; border-radius: 50%; background: #cf4a5c; vertical-align: middle; animation: fw-dot 1.6s ease-in-out infinite; }

/* ── RSVP + blessings ──────────────────────────────────────────────────── */
.fw-sec-rsvp { overflow: visible; }
/* Royal-style: an arched garden window with the couple beside the reply card (stacked on phones). */
.fw-rsvp-wrap { position: relative; display: grid; gap: 24px; max-width: 680px; margin: 0 auto; }
.fw-rsvp-art { position: relative; display: grid; justify-items: center; gap: 10px; text-align: center; }
.fw-rsvp-window { position: relative; display: block; width: min(80%, 320px); aspect-ratio: 4 / 4.6; border-radius: 999px 999px 26px 26px; overflow: hidden; isolation: isolate; background: #f6eee2; box-shadow: 0 0 0 1px rgba(184,140,72,.55), 0 0 0 7px rgba(255,250,243,.95), 0 0 0 8px rgba(184,140,72,.4), 0 34px 60px -30px rgba(80,50,30,.4); }
.fw-rw-wash { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .9; }
.fw-rw-drape { position: absolute; left: 50%; top: 2%; height: 100%; width: auto; translate: -50% 0; opacity: .95; }
.fw-rw-pair { position: absolute; z-index: 1; left: 50%; bottom: 6%; height: 74%; width: auto; translate: -50% 0; filter: drop-shadow(0 12px 14px rgba(110,40,50,.25)); }
.fw-rw-peony { position: absolute; z-index: 2; bottom: -10%; height: 44%; width: auto; }
.fw-rw-peony.is-l { left: -16%; rotate: 10deg; } .fw-rw-peony.is-r { right: -16%; rotate: -10deg; scale: -1 1; }
.fw-rsvp-names { margin: 0; font: 500 12.5px/1.4 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-gold-ink); }
@media (min-width: 900px) {
  .fw-rsvp-wrap { max-width: 1160px; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: center; gap: clamp(36px, 5vw, 72px); }
  .fw-rsvp-art { position: sticky; top: 90px; }
  .fw-rsvp-window { width: min(100%, 420px); }
}
.fw-rsvp { position: relative; z-index: 1; min-width: 0; }
.fw-rsvp-dear { margin: 0 0 6px; text-align: center; font: 400 30px/1.2 var(--wk-font-script); color: var(--fw-script); }

/* ── finale ────────────────────────────────────────────────────────────── */
.fw-finale { position: relative; z-index: 1; overflow: hidden; min-height: 100svh; display: flex; flex-direction: column; justify-content: center; padding: clamp(56px, 8svh, 90px) 16px clamp(70px, 12svh, 130px); text-align: center; }
.fw-fin-clouds { transform: translate3d(-50%, 0, 0); }
.fw-fin-in { position: relative; z-index: 3; max-width: 640px; margin: 0 auto; }
.fw-fin-stage { position: relative; width: min(88vw, 46svh, 480px); aspect-ratio: 800 / 789; margin: 0 auto 70px; }
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
.fw-fin-names { margin: 6px 0 4px; font: 400 clamp(44px, min(12vw, 8svh), 82px)/1.05 var(--wk-font-script); color: var(--fw-script); }
.fw-fin-names span { font: italic 500 .45em/1 var(--wk-font-display); color: var(--wk-gold-ink); }
.fw-fin-line { margin: 4px 0 0; font: italic 500 clamp(17px, 4.4vw, 20px)/1.5 var(--wk-font-display); color: var(--wk-muted); }
.fw-hashtag { margin: 12px 0 0; font: 500 13px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); }
.fw-share { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.fw-share-main { min-width: min(100%, 280px); }
.fw-share-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.fw-qr-scrim { position: fixed; inset: 0; z-index: 140; display: grid; place-items: center; padding: 16px; background: rgba(40,28,22,.55); animation: fw-fade .25s ease; }
.fw-qr { display: flex; flex-direction: column; align-items: center; gap: 12px; max-width: 100%; padding: 26px 24px 22px; border-radius: 18px; background: #fffaf3; box-shadow: 0 30px 70px -30px rgba(0,0,0,.5); animation: fw-pop .35s var(--fw-ease); }
.fw-qr svg { width: min(240px, 70vw); height: auto; }
.fw-qr-h { margin: 0; font: italic 500 17px/1.4 var(--wk-font-display); color: var(--wk-ink); }

/* ── the engine's music button (rendered outside .fw-root): stationery palette, top-left ── */
body .vm-icon { top: 13px !important; left: 12px !important; right: auto !important; bottom: auto !important; box-shadow: 0 8px 20px -12px rgba(80,50,30,.55), 0 0 0 1px rgba(184,146,74,.55); }
body .vm-icon-btn { color: #8c4a52; background: radial-gradient(circle at 50% 38%, #fffaf3, #f1e2d0 78%); }
body .vm-icon-btn:focus-visible { outline-color: #b8924a; }
body .vm-icon-ring { background: conic-gradient(from 0deg, #b8924a, transparent 30%, #d9a3a6 52%, transparent 78%, #b8924a); }
body .vm-icon-eq i { background: #8c4a52; }
body:has(.fw-root[data-wk-theme="powder"]) .vm-icon-btn { color: #49597d; }
body:has(.fw-root[data-wk-theme="powder"]) .vm-icon-eq i { background: #49597d; }

/* ── lite + reduced motion ─────────────────────────────────────────────── */
.fw-root.is-lite .fw-breeze, .fw-root.is-lite .fw-petals { display: none; }
.fw-root.is-lite .fw-hero-par, .fw-root.is-lite .fw-hero-clouds { transform: none; }
@media (prefers-reduced-motion: reduce) {
  .fw-root *, .fw-root *::before, .fw-root *::after { animation: none !important; }
  .fw-wipe-clip, .fw-wipe-clip img, .fw-hero [class*="fw-hi-"], .fw-hero-swing, .fw-hero-glow, .fw-ev-img, .fw-wax { transition: none !important; transform: none !important; opacity: 1 !important; }
  .fw-wax-ring, .fw-breeze, .fw-petals { display: none; }
  .fw-lang { transition: none; }
  .fw-hero-par, .fw-hero-clouds { transform: none !important; }
  .fw-hero-clouds { transform: translate3d(-50%, 0, 0) !important; }
}
`;
