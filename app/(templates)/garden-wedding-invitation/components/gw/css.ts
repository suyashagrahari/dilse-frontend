// ─── Mughal Garden: the guest page's stylesheet ─────────────────────────────
// Light only (blush / champagne / powder wear the kit's tokens; the garden adds
// sky, sage and ivory). Every animation is transform/opacity; loops pause when
// their element is off screen (.is-idle / missing .is-on); everything is still
// under prefers-reduced-motion. Mobile first: 360 → 390 → 768 → 1024 → 1440+.

import { GW } from "../assets";

export const GW_CSS = `
.gw-root { --gw-sky: #d9e9f5; --gw-sky2: #eef5fa; --gw-sage: #8eac89; --gw-sage-d: #5f7f5b; --gw-ivory: #fffaf6; --gw-blush: #f4c9d4;
  --gw-ease: cubic-bezier(.22,.7,.2,1); --gw-swing: cubic-bezier(.7,0,.2,1);
  overflow-x: clip; color: var(--wk-ink); }
.gw-root[data-wk-theme="powder"] { --gw-blush: #dbe6f3; }
.gw-root[data-wk-theme="champagne"] { --gw-blush: #f4e3c4; }
.gw-root img { -webkit-user-drag: none; user-select: none; }
.gw-a > img, .gw-hang > img, .gw-blossom > img, .gw-cloud > img { display: block; width: 100%; height: auto; }

/* ── Shared bits ──────────────────────────────────────────────────────── */
.gw-mantra { margin: 0; font-family: var(--wk-font-deva); font-size: clamp(14px, 3.6vw, 17px); line-height: 1.6; color: var(--wk-gold-ink); letter-spacing: .02em; }
.gw-pill { -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 44px; padding: 0 15px; border-radius: 999px; border: 1px solid var(--wk-border); background: var(--wk-surface-solid); color: var(--wk-ink); font: 600 13.5px/1 var(--wk-font-sans); letter-spacing: .01em; text-decoration: none; cursor: pointer; transition: transform .2s var(--gw-ease), background-color .2s, border-color .2s; }
.gw-pill:hover { background: var(--wk-surface-2); border-color: var(--wk-gold); }
.gw-pill:active { transform: scale(.97); }
.gw-pill:disabled { opacity: .6; cursor: progress; }
.gw-pill svg { flex: none; color: var(--wk-accent); }
.gw-pill-icon { width: 44px; padding: 0; }
.gw-pill-icon svg, .gw-pill-wa svg { color: #128c4b; }
.gw-sec { position: relative; }
.gw-sec::before { content: ""; position: absolute; z-index: -1; inset: 0 auto; left: 50%; width: 100vw; translate: -50% 0; pointer-events: none; }

/* ── Language toggle (always reachable, above the gate) ───────────────── */
.gw-lang { position: fixed; z-index: 95; top: max(12px, env(safe-area-inset-top)); left: 12px; display: flex; padding: 3px; border-radius: 999px; background: rgba(255,253,251,.86); border: 1px solid var(--wk-border); box-shadow: 0 10px 26px -16px rgba(80,30,45,.45); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
.gw-lang button { min-width: 44px; min-height: 40px; padding: 0 10px; border: 0; border-radius: 999px; background: none; color: var(--wk-muted); font: 600 13px/1 var(--wk-font-sans); cursor: pointer; }
.gw-lang button[aria-pressed=true] { background: var(--wk-accent); color: var(--wk-accent-ink); }

/* The engine's music icon: a 44px control, top right under the brand mark, on the live page (research P0 #3). */
body:has(.gw-root.is-live) .vm-icon { top: calc(max(12px, env(safe-area-inset-top)) + 56px) !important; right: 12px !important; left: auto !important; bottom: auto !important; z-index: 96 !important; transform: scale(1.1) !important; transform-origin: 100% 0 !important; }

/* ── The gate ─────────────────────────────────────────────────────────── */
.gw-gate { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; overflow: hidden; padding: 70px 16px 40px; }
.gw-gate-veil { position: absolute; inset: 0; background: linear-gradient(180deg, #dcebf6 0%, #f7f1f2 52%, #f7e3e8 100%); transition: opacity .9s var(--gw-ease) .5s; }
.gw-gate-sky { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .75; }
.gw-gate > span, .gw-gcard { opacity: 0; }
.gw-gate.is-ready > span, .gw-gate.is-ready .gw-gcard { opacity: 1; transition: opacity .9s var(--gw-ease), transform 1.35s var(--gw-swing); }
.gw-gate.is-ready .gw-gcard { transition: opacity .8s var(--gw-ease) .15s, transform .9s var(--gw-ease); }
.gw-gc { position: absolute; z-index: 1; }
.gw-gc img { display: block; width: 100%; height: auto; }
.gw-gc-l { top: 2%; left: -22%; width: min(84vw, 640px); }
.gw-gc-r { top: 9%; right: -26%; width: min(92vw, 720px); }
.gw-gate.is-ready .gw-gc img { animation: gw-float 14s ease-in-out infinite alternate; }
.gw-gleaf { position: absolute; z-index: 2; bottom: -1svh; height: max(96svh, 560px); -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14%); mask-image: linear-gradient(to bottom, transparent 0, #000 14%); }
.gw-gleaf-tree { display: block; height: 100%; width: auto; }
.gw-gleaf-l { left: -64px; -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14%), linear-gradient(to right, transparent 0, #000 22%); mask-image: linear-gradient(to bottom, transparent 0, #000 14%), linear-gradient(to right, transparent 0, #000 22%); -webkit-mask-composite: source-in; mask-composite: intersect; }
.gw-gleaf-r { right: -64px; -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14%), linear-gradient(to left, transparent 0, #000 22%); mask-image: linear-gradient(to bottom, transparent 0, #000 14%), linear-gradient(to left, transparent 0, #000 22%); -webkit-mask-composite: source-in; mask-composite: intersect; }
.gw-gleaf-flower { position: absolute; bottom: -2%; width: auto; }
.gw-gleaf-l .gw-gleaf-flower { left: 34%; height: 30%; }
.gw-gleaf-r .gw-gleaf-flower { right: 42%; height: 36%; }
.gw-gate.is-ready .gw-gleaf-tree { animation: gw-grow-in 1.4s var(--gw-ease) both; transform-origin: 50% 100%; }
.gw-ghang { position: absolute; z-index: 3; top: -6px; }
.gw-ghang img { display: block; height: 100%; width: auto; transform-origin: 50% 0; }
.gw-ghang-l { left: 5%; height: min(19svh, 170px); }
.gw-ghang-r { right: 3%; height: min(30svh, 280px); }
.gw-gate.is-ready .gw-ghang img { animation: gw-swing 5.5s ease-in-out infinite alternate; }
.gw-gate.is-ready .gw-ghang-r img { animation-duration: 6.8s; animation-delay: -2s; }
.gw-gfoot { position: absolute; z-index: 2; bottom: -3%; left: 50%; translate: -50% 0; width: min(64vw, 340px); }
.gw-gfoot img { display: block; width: 100%; height: auto; }
.gw-gcard { position: relative; z-index: 4; width: min(100%, 410px); padding: 0 clamp(18px, 6vw, 34px) 24px; text-align: center; border-radius: 26px; background: rgba(255,251,248,.94); border: 1px solid rgba(192,138,92,.38); box-shadow: 0 30px 70px -34px rgba(110,40,58,.55), 0 2px 10px -6px rgba(110,40,58,.2); transform: translateY(14px); }
.gw-gate.is-ready .gw-gcard { transform: none; }
.gw-gcard-crown { display: block; width: calc(100% + 2 * clamp(18px, 6vw, 34px)); max-width: none; height: auto; margin: 0 calc(-1 * clamp(18px, 6vw, 34px)); border-radius: 26px 26px 0 0; }
.gw-gcard-in { margin-top: -14px; }
.gw-gcard-k { margin: 6px 0 0; }
.gw-dear { margin: 8px 0 0; font: italic 400 clamp(18px, 4.8vw, 21px)/1.35 var(--wk-font-display); color: var(--wk-muted); }
.gw-dear b { font-style: normal; font-weight: 600; color: var(--wk-accent); }
.gw-gnames { margin: 8px 0 2px; display: grid; justify-items: center; font: 400 clamp(44px, 12.5vw, 64px)/1.05 var(--wk-font-script); color: var(--wk-ink); }
.gw-gnames span { max-width: 100%; overflow-wrap: anywhere; }
.gw-gnames i { font-style: normal; font-size: .6em; line-height: 1; color: var(--wk-gold-ink); }
.gw-gdate { margin: 8px 0 0; font: 500 12.5px/1.4 var(--wk-font-caps); letter-spacing: .26em; text-transform: uppercase; color: var(--wk-accent); }
.gw-gseal { position: relative; display: grid; place-items: center; width: 84px; height: 84px; margin: 16px auto 0; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: transform .25s var(--gw-ease); filter: drop-shadow(0 10px 18px rgba(169,78,99,.35)); }
.gw-gseal:hover { transform: scale(1.05); }
.gw-gseal:active, .gw-gate.is-opening .gw-gseal { transform: scale(.9); }
.gw-gseal-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid var(--wk-accent); opacity: 0; }
.gw-gate.is-ready.is-closed .gw-gseal-ring { animation: gw-ring 2.4s ease-out infinite; }
.gw-gcta { display: block; margin: 8px auto 0; min-height: 40px; padding: 0 16px; border: 0; background: none; cursor: pointer; font: 600 12px/1 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-accent); }
.gw-gate .gw-petals { z-index: 5; }
.gw-gate-burst { position: absolute; inset: 0; z-index: 6; pointer-events: none; }
/* opening */
.gw-gate.is-opening { pointer-events: none; }
.gw-gate.is-opening .gw-gate-veil { opacity: 0; }
.gw-gate.is-opening .gw-gcard { opacity: 0; transform: translateY(-34px) scale(1.06); transition: opacity .7s var(--gw-ease) .1s, transform .9s var(--gw-ease) .1s; }
.gw-gate.is-opening .gw-gleaf-l { transform: translateX(-75vw) rotate(-7deg); }
.gw-gate.is-opening .gw-gleaf-r { transform: translateX(75vw) rotate(7deg); }
.gw-gate.is-opening .gw-gc-l { transform: translateX(-62vw) scale(1.6); opacity: 0; transition-delay: .2s; transition-duration: 1.4s, 1.4s; }
.gw-gate.is-opening .gw-gc-r { transform: translateX(62vw) scale(1.6); opacity: 0; transition-delay: .2s; transition-duration: 1.4s, 1.4s; }
.gw-gate.is-opening .gw-ghang { transform: translateY(-60svh); transition-delay: .15s; }
.gw-gate.is-opening .gw-gfoot { transform: translateY(40svh); opacity: 0; }
.gw-gate.is-reduced.is-opening > *, .gw-gate.is-reduced.is-opening .gw-gcard { transition: opacity .4s linear !important; transform: none !important; opacity: 0 !important; }

/* ── The garden (hero) ────────────────────────────────────────────────── */
.gw-hero { --gw-sy: 0px; position: relative; height: max(100svh, 620px); max-height: 1180px; overflow: hidden; isolation: isolate; background: linear-gradient(180deg, #d4e6f3 0%, #eaf2f8 38%, #f9eef0 78%, var(--wk-bg) 100%); }
.gw-hero::after { content: ""; position: absolute; inset: auto 0 0; height: 16%; z-index: 6; background: linear-gradient(to bottom, transparent, var(--wk-bg)); pointer-events: none; }
.gw-l { position: absolute; inset: 0; pointer-events: none; will-change: transform; }
.gw-hero.is-idle .gw-l { will-change: auto; }
.gw-l-sky { transform: translate3d(0, calc(var(--gw-sy) * .45), 0); }
.gw-l-sky img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .82; }
.gw-l-clouds { transform: translate3d(0, calc(var(--gw-sy) * .35), 0); z-index: 1; }
.gw-l-far { transform: translate3d(0, calc(var(--gw-sy) * .18), 0); z-index: 2; }
.gw-l-mid { transform: translate3d(0, calc(var(--gw-sy) * .07), 0); z-index: 3; }
.gw-l-front { transform: translate3d(0, calc(var(--gw-sy) * -.05), 0); z-index: 5; }
.gw-l-hang { transform: translate3d(0, calc(var(--gw-sy) * -.12), 0); z-index: 7; }
.gw-hero-petals { position: absolute; inset: 0; z-index: 8; pointer-events: none; }
.gw-hero-text { position: absolute; z-index: 9; top: max(64px, 8svh); left: 0; right: 0; padding: 0 16px; text-align: center; transform: translate3d(0, calc(var(--gw-sy) * .3), 0); }
.gw-a, .gw-cloud, .gw-hang, .gw-blossom, .gw-gazebo, .gw-peacock { position: absolute; }
/* clouds part when the gate opens, then drift */
.gw-cloud { transition: transform 2.2s var(--gw-ease), opacity 1.6s var(--gw-ease); }
.gw-cloud-a { top: 3%; left: -16%; width: min(66vw, 560px); transform: translateX(26vw) scale(1.25); }
.gw-cloud-b { top: 10%; right: -22%; width: min(78vw, 660px); transform: translateX(-26vw) scale(1.25); }
.gw-cloud-c { top: 33%; left: 34%; width: min(40vw, 340px); opacity: 0; transform: scale(1.4); }
.gw-hero.is-open .gw-cloud-a, .gw-hero.is-open .gw-cloud-b { transform: none; }
.gw-hero.is-open .gw-cloud-c { opacity: .55; transform: none; }
.gw-cloud img { animation: gw-float 16s ease-in-out infinite alternate; }
.gw-cloud-b img { animation-duration: 21s; animation-delay: -6s; }
.gw-cloud-c img { animation-duration: 26s; animation-delay: -3s; }
/* far: banana plants + chhatri umbrellas */
.gw-a { opacity: 0; transition: opacity 1.2s var(--gw-ease), transform 1.6s var(--gw-ease); }
.gw-hero.is-open .gw-a { opacity: 1; transform: none; }
.gw-banana { bottom: 12%; height: min(48svh, 600px); width: auto; transform: translateY(40px); }
.gw-banana img { height: 100%; width: auto; transform-origin: 50% 100%; }
.gw-banana-l { left: -30%; }
.gw-banana-r { right: -32%; transition-delay: .1s; }
.gw-hero.is-open .gw-banana img { animation: gw-sway 7s ease-in-out infinite alternate; }
.gw-hero.is-open .gw-banana-r img { animation-duration: 8.5s; animation-delay: -3s; }
.gw-chhatri { bottom: 16%; height: min(19svh, 300px); transform: translateY(60px); transition-delay: .35s; }
.gw-chhatri img { height: 100%; width: auto; }
.gw-chhatri-l { left: -2%; }
.gw-chhatri-r { right: 3%; display: none; }
/* mid: hedges, the gazebo with the couple, the peacock */
.gw-hedge { bottom: 6%; width: min(44vw, 400px); transform: translateY(40px); transition-delay: .2s; }
.gw-hedge-l { left: -12%; }
.gw-hedge-r { right: -14%; }
.gw-hedge-r img { transform: scaleX(-1); }
.gw-gazebo { left: 50%; bottom: 2.5%; height: min(44svh, 88vw, 600px); aspect-ratio: 800 / 618; translate: -50% 0; opacity: 0; transform: translateY(46px) scale(.97); transition: opacity 1.3s var(--gw-ease) .25s, transform 1.8s var(--gw-ease) .25s; }
.gw-hero.is-open .gw-gazebo { opacity: 1; transform: none; }
.gw-gazebo-img { display: block; width: 100%; height: 100%; }
.gw-couple { position: absolute; left: 50%; bottom: 13.5%; height: 44%; translate: -50% 0; opacity: 0; transform: translateY(10px) scale(.94); transform-origin: 50% 100%; transition: opacity 1.2s var(--gw-ease) 1.15s, transform 1.4s var(--gw-ease) 1.15s; }
.gw-couple img { display: block; height: 100%; width: auto; filter: drop-shadow(0 8px 10px rgba(80,40,50,.18)); }
.gw-hero.is-open .gw-couple { opacity: 1; transform: none; }
.gw-peacock { right: -4%; bottom: 6%; height: min(22svh, 300px); aspect-ratio: 392 / 800; opacity: 0; transform: translateX(44vw); transition: transform 3.2s cubic-bezier(.3,.1,.3,1) 1.4s, opacity .8s linear 1.4s; }
.gw-hero.is-open .gw-peacock { opacity: 1; transform: none; }
.gw-peacock-walk { display: block; height: 100%; }
.gw-peacock-walk img { display: block; height: 100%; width: auto; transform-origin: 50% 100%; }
.gw-hero.is-open .gw-peacock-walk { animation: gw-strut .4s ease-in-out 1.4s 8 alternate; }
.gw-hero.is-open .gw-peacock-walk img { animation: gw-preen 6s ease-in-out 4.8s infinite alternate; }
/* front: lotus + rocks */
.gw-lotus-f { left: -9%; bottom: -3%; width: min(40vw, 330px); transform: translateY(50px); transition-delay: .5s; }
.gw-rocks-f { right: -10%; bottom: -1%; width: min(46vw, 380px); transform: translateY(50px); transition-delay: .6s; }
/* hanging: cherry branch, lanterns */
.gw-blossom { top: -3%; left: -14%; width: min(62vw, 520px); opacity: 0; transform: translate(-30px, -30px); transition: opacity 1.2s var(--gw-ease) .4s, transform 1.6s var(--gw-ease) .4s; }
.gw-blossom img { transform-origin: 0 0; }
.gw-hang { top: -8px; opacity: 0; transform: translateY(-60px); transition: opacity 1s var(--gw-ease) .5s, transform 1.4s var(--gw-ease) .5s; }
.gw-hang img { display: block; height: 100%; width: auto; transform-origin: 50% 0; }
.gw-hang-l { left: 4%; height: min(17svh, 190px); display: none; }
.gw-hang-r { right: -2%; height: min(19svh, 300px); }
.gw-hero.is-open .gw-blossom, .gw-hero.is-open .gw-hang { opacity: 1; transform: none; }
.gw-hero.is-open .gw-blossom img { animation: gw-sway-s 9s ease-in-out infinite alternate; }
.gw-hero.is-open .gw-hang img { animation: gw-swing 5.5s ease-in-out infinite alternate; }
.gw-hero.is-open .gw-hang-r img { animation-duration: 6.6s; animation-delay: -2.4s; }
.gw-hero.is-idle *, .gw-hero.is-idle .gw-petals i { animation-play-state: paused !important; }
/* the words in the sky */
.gw-ht { opacity: 0; transform: translateY(16px); transition: opacity 1s var(--gw-ease), transform 1.2s var(--gw-ease); }
.gw-hero.is-open .gw-ht { opacity: 1; transform: none; }
.gw-hero.is-open .gw-ht-1 { transition-delay: .55s; } .gw-hero.is-open .gw-ht-2 { transition-delay: .7s; } .gw-hero.is-open .gw-ht-3 { transition-delay: .85s; }
.gw-hero.is-open .gw-ht-4 { transition-delay: 1.05s; } .gw-hero.is-open .gw-ht-5 { transition-delay: 1.15s; } .gw-hero.is-open .gw-ht-6 { transition-delay: 1.3s; }
.gw-hero-text .wk-eyebrow { margin: 4px auto 8px; max-width: 30ch; letter-spacing: .2em; line-height: 1.6; color: var(--wk-accent); }
.gw-names { margin: 2px 0 0; display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; column-gap: .22em; font: 400 clamp(50px, 14.5vw, 112px)/1.02 var(--wk-font-script); color: #4a2230; text-shadow: 0 2px 18px rgba(255,255,255,.9), 0 0 2px rgba(255,255,255,.9); }
.gw-root[data-wk-theme="powder"] .gw-names { color: #23324d; }
.gw-root[data-wk-theme="champagne"] .gw-names { color: #4a3416; }
.gw-name { overflow-wrap: anywhere; }
.gw-amp { font-size: .62em; color: var(--wk-gold-ink); }
.gw-hdate { margin: 10px 0 0; display: grid; gap: 3px; font: 600 clamp(12px, 3.3vw, 15px)/1.4 var(--wk-font-caps); letter-spacing: .2em; text-transform: uppercase; color: var(--wk-ink); }
.gw-hdate small { font: 500 clamp(13px, 3.4vw, 15px)/1.4 var(--wk-font-sans); letter-spacing: .04em; text-transform: none; color: var(--wk-muted); }
.gw-hvenue { margin: 4px 0 0; font: italic 400 clamp(16px, 4.2vw, 20px)/1.35 var(--wk-font-display); color: var(--wk-muted); }
.gw-share-hero { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 12px; }
.gw-share-hero .gw-pill { background: rgba(255,253,251,.8); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.gw-cue { position: absolute; z-index: 9; left: 50%; bottom: max(12px, 1.6svh); translate: -50% 0; display: grid; justify-items: center; gap: 6px; opacity: 0; transition: opacity 1s 2.4s; }
.gw-hero.is-open .gw-cue { opacity: 1; }
.gw-cue b { white-space: nowrap; padding: 6px 12px; border-radius: 999px; background: rgba(255,253,251,.82); font: 600 10.5px/1 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: var(--wk-accent); }
.gw-cue i { width: 2px; height: 18px; border-radius: 2px; background: var(--wk-accent); opacity: .6; animation: gw-cue 1.8s ease-in-out infinite; }

/* ── The invitation ───────────────────────────────────────────────────── */
.gw-sec-invite::before { background: radial-gradient(60% 50% at 50% 40%, color-mix(in srgb, var(--gw-blush) 40%, transparent), transparent 70%); }
.gw-invite { --pad: clamp(20px, 5.5vw, 60px); position: relative; max-width: 900px; margin: 0 auto; padding: 0 var(--pad) clamp(30px, 5vw, 52px); border-radius: 28px; background: var(--wk-surface-solid); border: 1px solid color-mix(in srgb, var(--wk-gold) 45%, transparent); box-shadow: var(--wk-shadow); }
.gw-invite-crown { display: block; width: calc(100% + 2 * var(--pad)); max-width: none; height: auto; margin: 0 calc(-1 * var(--pad)); border-radius: 27px 27px 0 0; }
.gw-invite-in { position: relative; z-index: 1; margin-top: clamp(-30px, -3vw, -14px); }
.gw-invite .wk-msg-heading { color: var(--wk-accent); margin-bottom: 12px; }
.gw-invite .wk-msg-text { font-size: clamp(17px, 4.4vw, 20px); line-height: 1.75; }
.gw-invite-rose, .gw-invite-bunch { position: absolute; z-index: 2; pointer-events: none; opacity: 0; transition: opacity 1s var(--gw-ease) .3s, transform 1.4s var(--gw-ease) .3s; }
.gw-invite-rose { left: clamp(-34px, -3vw, -14px); bottom: -34px; height: clamp(120px, 24vw, 250px); transform: translateY(30px) rotate(-14deg); }
.gw-invite-bunch { right: clamp(-70px, -5vw, -22px); top: clamp(-70px, -5vw, -30px); width: clamp(84px, 14vw, 170px); transform: translateX(30px); }
.gw-invite-rose img, .gw-invite-bunch img { display: block; width: auto; height: 100%; }
.gw-invite-bunch img { width: 100%; height: auto; }
.gw-invite.is-in .gw-invite-rose { opacity: 1; transform: rotate(-8deg); }
.gw-invite.is-in .gw-invite-bunch { opacity: 1; transform: none; }

/* ── Families ─────────────────────────────────────────────────────────── */
.gw-sec-fam::before { background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--gw-sky) 45%, transparent) 50%, transparent); }
.gw-fam-tree { position: absolute; z-index: 0; bottom: 0; height: 78%; -webkit-mask-image: linear-gradient(to bottom, transparent, #000 18%); mask-image: linear-gradient(to bottom, transparent, #000 18%); display: none; opacity: 0; transition: opacity 1.2s var(--gw-ease), transform 1.6s var(--gw-ease); }
.gw-fam-tree img { display: block; height: 100%; width: auto; }
.gw-fam-tree-l { left: -40px; transform: translateX(-40px); }
.gw-fam-tree-r { right: -40px; transform: translateX(40px); }
.gw-sec.is-seen .gw-fam-tree { opacity: 1; transform: none; }
.gw-blessings-of { text-align: center; margin: 0 auto 26px; max-width: 560px; }
.gw-blessings-names { margin: 0; font: italic 500 clamp(19px, 4.6vw, 24px)/1.45 var(--wk-font-display); }
.gw-fam { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }
.gw-fam .wk-family { padding: 26px 18px 24px; border-radius: 160px 160px 22px 22px / 110px 110px 22px 22px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
.gw-fam .wk-family-names { font-size: clamp(19px, 4.6vw, 23px); }

/* ── The day: date card, countdown, fountain ─────────────────────────── */
.gw-sec-day::before { background: radial-gradient(70% 60% at 50% 70%, color-mix(in srgb, var(--gw-sky) 70%, transparent), transparent 75%); }
.gw-day { display: grid; gap: clamp(22px, 4vw, 34px); justify-items: center; }
.gw-day-card { width: min(100%, 380px); padding: 46px 22px 28px; text-align: center; border-radius: 190px 190px 26px 26px / 150px 150px 26px 26px; background: var(--wk-surface-solid); border: 1px solid color-mix(in srgb, var(--wk-gold) 50%, transparent); box-shadow: var(--wk-shadow); }
.gw-day-week { margin: 0; font: 600 13px/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-accent); }
.gw-day-num { margin: 6px 0 0; font: 500 clamp(96px, 26vw, 140px)/.95 var(--wk-font-display); }
.gw-day-month { margin: 4px 0 0; font: 500 clamp(22px, 5.4vw, 28px)/1.2 var(--wk-font-display); }
.gw-day-month span { color: var(--wk-muted); }
.gw-day-rule { display: block; width: 120px; height: 1px; margin: 16px auto; background: linear-gradient(90deg, transparent, var(--wk-gold), transparent); }
.gw-day-time { margin: 0; font: 600 16px/1.4 var(--wk-font-sans); }
.gw-day-muhurat { margin: 2px 0 0; font: italic 400 18px/1.4 var(--wk-font-display); color: var(--wk-accent); }
.gw-day-venue { margin: 6px 0 0; font: 500 14px/1.45 var(--wk-font-sans); color: var(--wk-muted); }
.gw-day-count { width: min(100%, 560px); padding: 22px 14px 18px; text-align: center; border-radius: 24px; background: color-mix(in srgb, var(--wk-surface-solid) 82%, transparent); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
@media (max-width: 520px) {
  .gw-day-count { padding: 18px 6px 14px; }
  .gw-day-count .wk-countdown { gap: 3px; }
  .gw-day-count .wk-flip, .gw-day-count .wk-roll { min-width: clamp(46px, 13.5vw, 58px); padding: 0 4px; font-size: clamp(28px, 8.4vw, 40px); height: clamp(56px, 15vw, 72px); }
  .gw-day-count .wk-cd-label { letter-spacing: .08em; font-size: 10px; }
  .gw-day-count .wk-cd-unit:first-child .wk-flip, .gw-day-count .wk-cd-unit:first-child .wk-roll { min-width: clamp(62px, 18vw, 80px); }
}
.gw-fountain { position: relative; display: flex; align-items: flex-end; justify-content: center; width: min(100%, 600px); margin-top: 6px; }
.gw-stems { position: relative; z-index: 0; width: min(28vw, 190px); flex: none; }
.gw-stems img { display: block; width: 100%; height: auto; transform-origin: 50% 100%; }
.gw-stems-l { margin-right: -9%; }
.gw-stems-l img { transform: scaleX(-1); }
.gw-stems-r { margin-left: -9%; }
.gw-fountain.is-on .gw-stems-l img { animation: gw-sway-flip 7s ease-in-out infinite alternate; }
.gw-fountain.is-on .gw-stems-r img { animation: gw-sway 8s ease-in-out infinite alternate; }
.gw-fountain-core { position: relative; z-index: 1; width: min(62vw, 380px); flex: none; container-type: inline-size; }
.gw-fountain-img { display: block; width: 100%; height: auto; }
.gw-jet { position: absolute; left: 50%; top: -9cqw; width: 2.2cqw; height: 10cqw; translate: -50% 0; border-radius: 50% 50% 40% 40%; background: linear-gradient(to top, rgba(160,205,232,.95), rgba(255,255,255,.2)); transform-origin: 50% 100%; opacity: .9; }
.gw-fountain.is-on .gw-jet { animation: gw-jet 1.4s ease-in-out infinite; }
.gw-drops { position: absolute; inset: 0; pointer-events: none; }
.gw-drops i { position: absolute; width: max(3px, 1cqw); height: max(7px, 2.4cqw); border-radius: 50%; background: linear-gradient(rgba(255,255,255,.95), rgba(150,198,228,.9)); opacity: 0; }
.gw-fountain.is-on .gw-drops i { animation: gw-drop 1.15s cubic-bezier(.55,0,1,.7) infinite; }
.gw-ripples { position: absolute; left: 16%; right: 16%; top: 54%; height: 11cqw; }
.gw-ripples::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(closest-side, rgba(176,214,236,.55), rgba(176,214,236,0)); }
.gw-ripples i { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.9); opacity: 0; }
.gw-fountain.is-on .gw-ripples i { animation: gw-ripple 3s ease-out infinite; }
.gw-fountain.is-on .gw-ripples i:nth-child(2) { animation-delay: 1s; }
.gw-fountain.is-on .gw-ripples i:nth-child(3) { animation-delay: 2s; }

/* ── Story ────────────────────────────────────────────────────────────── */
.gw-story { position: relative; }
.gw-story-rail { position: absolute; top: 4px; bottom: 4px; left: 18px; width: 3px; }
.gw-story-rail i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(var(--gw-sage), color-mix(in srgb, var(--gw-sage) 40%, #fff)); transform-origin: 50% 0; transform: scaleY(var(--gw-p, 0)); }
.gw-drift { position: absolute; z-index: 0; pointer-events: none; opacity: .55; }
.gw-drift img { display: block; width: 100%; height: auto; }
.gw-drift-a { right: -70px; top: -50px; width: clamp(170px, 30vw, 360px); transform: translate3d(0, calc(var(--gw-p, 0) * -70px), 0) rotate(8deg); }
.gw-drift-b { left: -60px; bottom: -10px; width: clamp(80px, 13vw, 150px); transform: translate3d(0, calc(var(--gw-p, 0) * 50px), 0) rotate(-10deg); }
.gw-chapters { position: relative; z-index: 1; list-style: none; margin: 0; padding: 0; display: grid; gap: clamp(36px, 6vw, 64px); }
.gw-ch { position: relative; display: grid; gap: 14px; padding-left: 50px; }
.gw-ch-dot { position: absolute; left: 6px; top: 4px; color: var(--wk-gold); line-height: 0; }
.gw-ch-photo { position: relative; width: min(100%, 340px); aspect-ratio: 4 / 5; overflow: hidden; border-radius: 999px 999px 18px 18px / 220px 220px 18px 18px; border: 5px solid var(--wk-surface-solid); box-shadow: var(--wk-shadow); background: var(--wk-placeholder); }
.gw-ch-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.gw-ch-when { margin: 0; font: 600 12px/1 var(--wk-font-caps); letter-spacing: .3em; color: var(--wk-accent); }
.gw-ch-title { margin: 8px 0 6px; font: 500 clamp(26px, 6vw, 34px)/1.15 var(--wk-font-display); }
.gw-ch-line { margin: 0; font: 400 clamp(16px, 4.2vw, 18px)/1.65 var(--wk-font-display); color: var(--wk-muted); max-width: 42ch; }

/* ── Functions ────────────────────────────────────────────────────────── */
.gw-sec-events::before { background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--gw-sage) 12%, transparent) 30%, color-mix(in srgb, var(--gw-blush) 22%, transparent) 75%, transparent); }
.gw-ev-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 20px; grid-template-columns: 1fr; }
.gw-ev { display: flex; }
.gw-ev-card { position: relative; display: flex; flex-direction: column; width: 100%; border-radius: 26px; overflow: hidden; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); transition: transform .35s var(--gw-ease); }
.gw-ev.is-main .gw-ev-card { border-color: color-mix(in srgb, var(--wk-gold) 70%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--wk-gold) 18%, transparent), var(--wk-shadow); }
@media (hover: hover) { .gw-ev-card:hover { transform: translateY(-4px); } .gw-ev-card:hover .gw-ev-img { transform: scale(1.05); } }
.gw-ev-art { position: relative; height: 190px; margin: 12px 12px 0; overflow: hidden; border-radius: 999px 999px 16px 16px / 150px 150px 16px 16px; isolation: isolate; }
.gw-ev-wash { position: absolute; inset: 0; z-index: -1; background: radial-gradient(120% 95% at 50% 105%, color-mix(in srgb, var(--gw-sw, var(--gw-blush)) 42%, #fff) 0%, color-mix(in srgb, var(--gw-sky) 55%, #fff) 72%); }
.gw-ev-img { position: absolute; left: 50%; translate: -50% 0; width: auto; transition: transform .7s var(--gw-ease); transform-origin: 50% 100%; }
.is-stand .gw-ev-img { bottom: 0; height: 88%; }
.is-hang .gw-ev-img { top: -4%; height: 104%; transform-origin: 50% 0; }
.gw-ev-no { position: absolute; top: 34px; right: 18px; font: 600 12px/1 var(--wk-font-caps); letter-spacing: .2em; color: var(--wk-gold-ink); background: rgba(255,253,251,.8); padding: 6px 8px; border-radius: 999px; }
.gw-ev-body { display: flex; flex-direction: column; flex: 1; padding: 16px 20px 20px; }
.gw-ev-date { margin: 0; }
.gw-ev-title { margin: 6px 0 10px; font: 500 clamp(26px, 6vw, 30px)/1.12 var(--wk-font-display); }
.gw-ev-line { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 8px; font: 400 14.5px/1.45 var(--wk-font-sans); color: var(--wk-muted); }
.gw-ev-line svg { flex: none; margin-top: 2px; color: var(--wk-accent); }
.gw-ev-line b { display: block; font-weight: 600; color: var(--wk-ink); }
.gw-ev-addr { display: block; }
.gw-ev-k { font-weight: 600; color: var(--wk-ink); }
.gw-ev-swatch { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px var(--wk-gold); }
.gw-ev-note { margin: 4px 0 0; padding-left: 12px; border-left: 2px solid var(--gw-sage); font: italic 400 16.5px/1.5 var(--wk-font-display); color: var(--wk-muted); }
.gw-ev-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 16px; }
.gw-ev-live { margin-top: 12px; }
.gw-live-btn { gap: 10px; }
.gw-live-dot { width: 9px; height: 9px; border-radius: 50%; background: #ff5a6e; box-shadow: 0 0 0 0 rgba(255,90,110,.6); animation: gw-live 1.6s ease-out infinite; }
.gw-ev-livesoon { display: flex; gap: 8px; align-items: center; margin: 0; font: 500 13px/1.4 var(--wk-font-sans); color: var(--wk-muted); }
.gw-ev-all { display: flex; justify-content: center; margin-top: 28px; }

/* ── Venue ────────────────────────────────────────────────────────────── */
.gw-venue-arch { position: relative; overflow: hidden; aspect-ratio: 4 / 3; border-radius: 50% 50% 22px 22px / 30% 30% 22px 22px; border: 6px solid var(--wk-surface-solid); box-shadow: var(--wk-shadow); background: var(--gw-sky2); }
.gw-venue-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
.gw-balustrade { position: absolute; left: 0; right: 0; bottom: 0; height: 21%; background: url("${GW.balustrade.src}") repeat-x 0 100% / auto 100%; filter: drop-shadow(0 -4px 8px rgba(80,60,60,.12)); }
.gw-glints { position: absolute; inset: 52% 18% 24% 18%; }
.gw-glints i { position: absolute; width: 18px; height: 3px; border-radius: 3px; background: rgba(255,255,255,.95); opacity: 0; }
.gw-glints i:nth-child(1) { left: 6%; top: 20%; } .gw-glints i:nth-child(2) { left: 30%; top: 55%; } .gw-glints i:nth-child(3) { left: 52%; top: 30%; } .gw-glints i:nth-child(4) { left: 72%; top: 62%; } .gw-glints i:nth-child(5) { left: 88%; top: 18%; }
.gw-venue.is-on .gw-glints i { animation: gw-glint 3.2s ease-in-out infinite; }
.gw-venue.is-on .gw-glints i:nth-child(2) { animation-delay: .7s; } .gw-venue.is-on .gw-glints i:nth-child(3) { animation-delay: 1.4s; } .gw-venue.is-on .gw-glints i:nth-child(4) { animation-delay: 2.1s; } .gw-venue.is-on .gw-glints i:nth-child(5) { animation-delay: 2.7s; }
.gw-venue-cols { display: grid; gap: 18px; margin-top: 24px; }
.gw-venue-text { text-align: center; }
.gw-venue-name { margin: 0; font: 500 clamp(30px, 7vw, 46px)/1.1 var(--wk-font-display); }
.gw-venue-addr { margin: 8px 0 0; font: 400 16px/1.5 var(--wk-font-sans); color: var(--wk-muted); }
.gw-venue-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 18px; }
.gw-venue-map { margin-top: 16px; aspect-ratio: 16 / 10; border-radius: 18px; overflow: hidden; border: 1px solid var(--wk-border); }
.gw-venue-map iframe { width: 100%; height: 100%; border: 0; }
.gw-know-h { margin: 0 0 6px; font: 600 11.5px/1.3 var(--wk-font-caps); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-gold-ink); }
.gw-know-t { margin: 0; font: 400 15.5px/1.6 var(--wk-font-sans); }
.gw-venue-travel { text-align: left; border-left: 3px solid var(--gw-sage); }

/* ── Film ─────────────────────────────────────────────────────────────── */
.gw-film { position: relative; aspect-ratio: 16 / 9; border-radius: 22px; overflow: hidden; border: 5px solid var(--wk-surface-solid); box-shadow: var(--wk-shadow); background: #000; }
.gw-film iframe { width: 100%; height: 100%; border: 0; }
.gw-film-poster { position: absolute; inset: 0; padding: 0; border: 0; cursor: pointer; background: #000; }
.gw-film-poster img { width: 100%; height: 100%; object-fit: cover; opacity: .85; transition: transform .6s var(--gw-ease), opacity .3s; }
.gw-film-poster:hover img { transform: scale(1.03); opacity: 1; }
.gw-film-play { position: absolute; left: 50%; top: 50%; translate: -50% -50%; display: grid; place-items: center; width: 74px; height: 74px; border-radius: 50%; background: rgba(255,253,251,.92); color: var(--wk-accent); box-shadow: 0 10px 30px -10px rgba(0,0,0,.5); }
.gw-film-label { position: absolute; left: 0; right: 0; bottom: 14px; text-align: center; font: 600 12px/1 var(--wk-font-caps); letter-spacing: .24em; text-transform: uppercase; color: #fff; text-shadow: 0 1px 8px rgba(0,0,0,.6); }

/* ── Gallery ──────────────────────────────────────────────────────────── */
.gw-gal-leaf { position: absolute; z-index: 0; top: 140px; display: none; pointer-events: none; opacity: 0; transition: opacity 1.2s var(--gw-ease), transform 1.6s var(--gw-ease); }
.gw-gal-leaf img { display: block; height: 100%; width: auto; }
.gw-gal-leaf-l { left: -150px; height: 520px; transform: translateX(-40px) rotate(-6deg); }
.gw-gal-leaf-r { right: -130px; height: 480px; transform: translateX(40px); }
.gw-gal-leaf-r img { transform: scaleX(-1); }
.gw-sec.is-seen .gw-gal-leaf-l { opacity: .9; transform: rotate(-6deg); }
.gw-sec.is-seen .gw-gal-leaf-r { opacity: .9; transform: none; }
.gw-sec-gallery .wk-masonry { position: relative; z-index: 1; }

/* ── Notes, contacts, shagun ──────────────────────────────────────────── */
.gw-notes { display: grid; gap: 18px; }
.gw-know { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: 1fr; }
.gw-know-i { border-left: 3px solid var(--gw-sage); }
.gw-contacts { position: relative; overflow: hidden; padding: 24px 18px 18px; border-radius: 26px; background: linear-gradient(160deg, var(--wk-surface-solid), color-mix(in srgb, var(--gw-blush) 30%, var(--wk-surface-solid))); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
.gw-contacts-art { position: absolute; right: -26px; top: -30px; width: 130px; opacity: .9; pointer-events: none; }
.gw-contacts-art img { display: block; width: 100%; height: auto; }
.gw-contacts-h { position: relative; margin: 0; font: 500 clamp(26px, 6vw, 32px)/1.15 var(--wk-font-display); padding-right: 80px; }
.gw-contacts-p { position: relative; margin: 6px 0 16px; font: 400 15px/1.5 var(--wk-font-sans); color: var(--wk-muted); padding-right: 70px; }
.gw-contact-list { position: relative; list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.gw-contact { display: grid; grid-template-columns: auto 1fr; gap: 10px 12px; align-items: center; padding: 12px; border-radius: 18px; background: rgba(255,255,255,.7); border: 1px solid var(--wk-border); }
.gw-contact-ini { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--gw-blush); color: var(--wk-accent); font: 600 20px/1 var(--wk-font-display); }
.gw-contact-who { display: grid; gap: 2px; min-width: 0; }
.gw-contact-who b { font: 600 16px/1.3 var(--wk-font-sans); overflow-wrap: anywhere; }
.gw-contact-who small { font: 400 13.5px/1.3 var(--wk-font-sans); color: var(--wk-muted); }
.gw-contact-btns { grid-column: 1 / -1; display: flex; gap: 8px; }
.gw-contact-btns .gw-pill { flex: 1; }
.gw-shagun { text-align: center; padding: 26px 20px; border-radius: 26px; border: 1.5px dashed color-mix(in srgb, var(--wk-gold) 70%, transparent); background: var(--wk-surface-solid); }
.gw-shagun-k { margin: 0; font: 400 clamp(34px, 8vw, 44px)/1.1 var(--wk-font-script); color: var(--wk-accent); }
.gw-shagun-p { margin: 6px auto 12px; max-width: 44ch; font: 400 15px/1.55 var(--wk-font-sans); color: var(--wk-muted); }
.gw-shagun-id { display: grid; gap: 2px; margin: 0 0 14px; }
.gw-shagun-id b { font: 600 17px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
.gw-shagun-id small { font: 400 13.5px/1.3 var(--wk-font-sans); color: var(--wk-muted); }
.gw-shagun-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }

/* ── RSVP ─────────────────────────────────────────────────────────────── */
.gw-sec-rsvp::before { background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--gw-blush) 26%, transparent) 40%, transparent); }
.gw-upasthiti { margin: -6px 0 6px; text-align: center; font: 400 clamp(26px, 6.6vw, 34px)/1.3 var(--wk-font-script); color: var(--wk-accent); }
.gw-rsvp { position: relative; }
.gw-rsvp-band { position: relative; z-index: 2; display: block; width: calc(100% + 24px); max-width: none; height: auto; margin: 0 -12px -9%; pointer-events: none; }
.gw-rsvp-in { position: relative; z-index: 1; }
.gw-rsvp-in .wk-rsvp { padding-top: clamp(44px, 9vw, 64px); }
.gw-rsvp-peacock { position: absolute; z-index: 0; right: -330px; bottom: 60px; height: 560px; display: none; opacity: 0; transform: translateX(60px); transition: opacity 1.2s var(--gw-ease), transform 1.8s var(--gw-ease); }
.gw-rsvp-peacock img { display: block; height: 100%; width: auto; }
.gw-sec.is-seen .gw-rsvp-peacock { opacity: 1; transform: none; }

/* ── Blessings ────────────────────────────────────────────────────────── */
.gw-bless-hang { position: absolute; top: 0; right: -60px; height: 300px; display: none; }
.gw-bless-hang img { display: block; height: 100%; width: auto; transform-origin: 50% 0; }
.gw-sec.is-seen .gw-bless-hang img { animation: gw-swing 6s ease-in-out infinite alternate; }

/* ── Finale ───────────────────────────────────────────────────────────── */
.gw-finale { position: relative; overflow: hidden; isolation: isolate; padding: clamp(40px, 8vw, 80px) 16px clamp(90px, 14vw, 140px); text-align: center; background: linear-gradient(180deg, var(--wk-bg) 0%, color-mix(in srgb, #fbe2dc 70%, var(--wk-bg)) 30%, color-mix(in srgb, #f1d3dd 80%, var(--wk-bg)) 66%, color-mix(in srgb, #e3d4ea 70%, var(--wk-bg)) 100%); }
.gw-sky-lanterns { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.gw-sky-lanterns i { position: absolute; bottom: -50px; border-radius: 42% 42% 30% 30%; background: radial-gradient(circle at 50% 72%, #fff6d2, #ffc978 46%, #ef9566 86%); box-shadow: 0 0 22px 4px rgba(255,190,120,.55); opacity: 0; }
.gw-finale.is-on .gw-sky-lanterns i { animation-name: gw-rise, gw-lsway; animation-timing-function: linear, ease-in-out; animation-iteration-count: infinite, infinite; animation-direction: normal, alternate; }
.gw-finale-stage { position: relative; height: clamp(280px, 62vw, 520px); max-width: 1000px; margin: 0 auto; }
.gw-fin-pav { position: absolute; left: 50%; bottom: 0; width: min(92vw, 600px); aspect-ratio: 800 / 617; translate: -50% 0; opacity: 0; transform: translateY(40px) scale(.96); transition: opacity 1.2s var(--gw-ease), transform 1.6s var(--gw-ease); }
.gw-fin-pav-img { display: block; width: 100%; height: 100%; }
.gw-fin-couple { position: absolute; left: 50%; bottom: 15%; height: 56%; translate: -50% 0; opacity: 0; transform: translateY(10px); transition: opacity 1.2s var(--gw-ease) .7s, transform 1.4s var(--gw-ease) .7s; }
.gw-fin-couple img { display: block; height: 100%; width: auto; }
.gw-fin-tree { position: absolute; bottom: 0; height: 92%; -webkit-mask-image: linear-gradient(to bottom, transparent, #000 18%); mask-image: linear-gradient(to bottom, transparent, #000 18%); opacity: 0; transition: opacity 1.2s var(--gw-ease) .2s, transform 1.6s var(--gw-ease) .2s; }
.gw-fin-tree img { display: block; height: 100%; width: auto; }
.gw-fin-tree-l { left: -60px; transform: translateX(-50px); -webkit-mask-image: linear-gradient(to bottom, transparent, #000 22%), linear-gradient(to right, transparent, #000 30%); mask-image: linear-gradient(to bottom, transparent, #000 22%), linear-gradient(to right, transparent, #000 30%); -webkit-mask-composite: source-in; mask-composite: intersect; }
.gw-fin-tree-r { right: -60px; transform: translateX(50px); -webkit-mask-image: linear-gradient(to bottom, transparent, #000 22%), linear-gradient(to left, transparent, #000 30%); mask-image: linear-gradient(to bottom, transparent, #000 22%), linear-gradient(to left, transparent, #000 30%); -webkit-mask-composite: source-in; mask-composite: intersect; }
.gw-finale.is-bloom .gw-fin-pav, .gw-finale.is-bloom .gw-fin-couple, .gw-finale.is-bloom .gw-fin-tree { opacity: 1; transform: none; }
.gw-fin-petals { position: absolute; inset: -20% 0 0; pointer-events: none; }
.gw-finale-in { position: relative; max-width: 640px; margin: 18px auto 0; }
.gw-seal-line { display: grid; gap: 2px; margin: 0 0 14px; }
.gw-seal-line b { font: 400 clamp(40px, 10vw, 58px)/1.25 var(--wk-font-deva); background: var(--wk-foil); background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }
.gw-seal-line small { font: 600 12px/1 var(--wk-font-caps); letter-spacing: .4em; text-transform: uppercase; color: var(--wk-gold-ink); }
.gw-finale-names { margin: 4px 0 0; font: 400 clamp(44px, 11vw, 74px)/1.1 var(--wk-font-script); color: var(--wk-ink); }
.gw-finale-names span { color: var(--wk-gold-ink); font-size: .7em; }
.gw-finale-line { margin: 10px auto 0; max-width: 44ch; font: italic 400 clamp(17px, 4.4vw, 20px)/1.5 var(--wk-font-display); color: var(--wk-muted); }
.gw-hashtag { display: inline-block; margin: 14px 0 0; padding: 8px 16px; border-radius: 999px; background: rgba(255,253,251,.7); font: 600 14px/1 var(--wk-font-sans); color: var(--wk-accent); }
.gw-share-finale { display: grid; gap: 12px; max-width: 520px; margin: 24px auto 0; }
.gw-wa { background: #128c4b; color: #fff; box-shadow: 0 12px 26px -14px #128c4b; }
.gw-share-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.gw-share-row .gw-pill { background: rgba(255,253,251,.86); }

/* ── QR dialog (portalled to <body>, so plain colours) ────────────────── */
.gw-qr-scrim { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(40,16,24,.55); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); animation: gw-fade .25s ease both; }
.gw-qr { width: min(100%, 320px); padding: 26px 22px 20px; border-radius: 24px; background: #fffdfb; color: #3e1f27; text-align: center; box-shadow: 0 30px 60px -20px rgba(40,16,24,.6); animation: gw-pop .35s cubic-bezier(.22,.7,.2,1) both; }
.gw-qr svg { display: block; width: 240px; max-width: 100%; height: auto; margin: 0 auto; }
.gw-qr p { margin: 12px 0 14px; font: 500 15px/1.4 system-ui, sans-serif; }
.gw-qr-close { min-height: 44px; padding: 0 24px; border: 0; border-radius: 999px; background: #a94e63; color: #fff; font: 600 15px/1 system-ui, sans-serif; cursor: pointer; }

/* ── Petals ───────────────────────────────────────────────────────────── */
.gw-petals { pointer-events: none; }
.gw-petals i { position: absolute; top: -20px; border-radius: 150% 0 150% 0; opacity: 0; }
.gw-petals.is-drift { position: absolute; inset: 0; overflow: hidden; }
.gw-petals.is-drift i { animation-name: gw-petal-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
.gw-petals.is-burst i { top: 50%; animation-name: gw-petal-burst; animation-timing-function: cubic-bezier(.2,.7,.3,1); animation-fill-mode: both; }

/* ── Keyframes ────────────────────────────────────────────────────────── */
@keyframes gw-float { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(5vw, 6px, 0); } }
@keyframes gw-swing { from { transform: rotate(-3.5deg); } to { transform: rotate(3.5deg); } }
@keyframes gw-sway { from { transform: rotate(-1.6deg); } to { transform: rotate(1.8deg); } }
@keyframes gw-sway-flip { from { transform: scaleX(-1) rotate(-1.6deg); } to { transform: scaleX(-1) rotate(1.8deg); } }
@keyframes gw-sway-s { from { transform: rotate(-1deg); } to { transform: rotate(2.2deg); } }
@keyframes gw-grow-in { from { opacity: 0; transform: translateY(30px) scale(.94); } to { opacity: 1; transform: none; } }
@keyframes gw-ring { 0% { opacity: .9; transform: scale(.95); } 100% { opacity: 0; transform: scale(1.5); } }
@keyframes gw-strut { from { transform: translateY(0); } to { transform: translateY(-5px); } }
@keyframes gw-preen { 0%, 70% { transform: rotate(0); } 85% { transform: rotate(-2.5deg); } 100% { transform: rotate(1deg); } }
@keyframes gw-cue { 0%, 100% { transform: scaleY(.5); transform-origin: 50% 0; opacity: .3; } 50% { transform: scaleY(1); opacity: .8; } }
@keyframes gw-jet { 0%, 100% { transform: scaleY(.72); } 50% { transform: scaleY(1.06); } }
@keyframes gw-drop { 0% { opacity: 0; transform: translateY(0) scaleY(.6); } 18% { opacity: 1; } 85% { opacity: .9; } 100% { opacity: 0; transform: translateY(var(--fall)) scaleY(1.25); } }
@keyframes gw-ripple { 0% { opacity: .9; transform: scale(.25); } 100% { opacity: 0; transform: scale(1); } }
@keyframes gw-glint { 0%, 100% { opacity: 0; transform: scaleX(.4); } 50% { opacity: .95; transform: scaleX(1); } }
@keyframes gw-live { 0% { box-shadow: 0 0 0 0 rgba(255,90,110,.6); } 100% { box-shadow: 0 0 0 10px rgba(255,90,110,0); } }
@keyframes gw-rise { 0% { transform: translate3d(0, 0, 0); opacity: 0; } 10% { opacity: .95; } 85% { opacity: .85; } 100% { transform: translate3d(0, -115vh, 0); opacity: 0; } }
@keyframes gw-lsway { from { translate: calc(var(--sway) * -1) 0; } to { translate: var(--sway) 0; } }
@keyframes gw-petal-fall { 0% { opacity: 0; transform: translate3d(0, -20px, 0) rotate(0); } 8% { opacity: .95; } 50% { transform: translate3d(var(--sway), 50vh, 0) rotate(calc(var(--spin) / 2)); } 92% { opacity: .9; } 100% { opacity: 0; transform: translate3d(calc(var(--sway) * -.4), 104vh, 0) rotate(var(--spin)); } }
@keyframes gw-petal-burst { 0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0) scale(.4); } 12% { opacity: 1; } 100% { opacity: 0; transform: translate3d(var(--tx), var(--ty), 0) rotate(var(--spin)) scale(1); } }
@keyframes gw-fade { from { opacity: 0; } }
@keyframes gw-pop { from { opacity: 0; transform: translateY(14px) scale(.96); } }

/* ── Wider screens ────────────────────────────────────────────────────── */
@media (min-width: 600px) {
  .gw-know { grid-template-columns: 1fr 1fr; }
  .gw-contact { grid-template-columns: auto 1fr auto; }
  .gw-contact-btns { grid-column: auto; }
  .gw-contact-btns .gw-pill { flex: none; }
  .gw-hang-l { display: block; }
}
@media (min-width: 720px) {
  .gw-ev-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gw-venue-arch { aspect-ratio: 1091 / 380; border-radius: 50% 50% 24px 24px / 44% 44% 24px 24px; }
  .gw-venue-img { object-position: 50% 50%; }
  .gw-chhatri-r { display: block; }
  .gw-fam-tree { display: block; }
  .gw-fam-tree-l { left: -150px; } .gw-fam-tree-r { right: -150px; }
}
@media (min-width: 900px) {
  .gw-hero { height: max(100svh, 680px); }
  .gw-gazebo { height: min(56svh, 640px); bottom: 1%; }
  .gw-hero-text { top: max(48px, 5.5svh); }
  .gw-hero-text .wk-eyebrow { max-width: none; }
  .gw-names { font-size: clamp(64px, 11svh, 100px); }
  .gw-peacock { right: 14%; bottom: 9%; height: min(30svh, 330px); }
  .gw-banana-l { left: -5%; } .gw-banana-r { right: -6%; }
  .gw-banana { height: min(66svh, 720px); }
  .gw-chhatri-l { left: 15%; bottom: 15%; height: min(34svh, 380px); }
  .gw-chhatri-r { right: 3%; bottom: 20%; height: min(30svh, 340px); }
  .gw-hedge { width: min(25vw, 380px); bottom: 4%; }
  .gw-hedge-l { left: 6%; } .gw-hedge-r { right: 8%; }
  .gw-lotus-f { left: 2%; width: min(24vw, 360px); }
  .gw-rocks-f { right: 1%; width: min(26vw, 400px); }
  .gw-blossom { left: -5%; width: min(40vw, 600px); }
  .gw-hang-l { left: 22%; height: min(21svh, 220px); }
  .gw-hang-r { right: 7%; height: min(32svh, 360px); }
  .gw-cloud-a { left: 2%; width: min(40vw, 640px); } .gw-cloud-b { right: -4%; width: min(46vw, 760px); } .gw-cloud-c { left: 40%; top: 26%; width: min(22vw, 360px); }
  .gw-gleaf-l { left: calc(50% - 260px - min(26vw, 320px)); }
  .gw-gleaf-r { right: calc(50% - 260px - min(26vw, 320px)); }
  .gw-gcard { width: 440px; }
  .gw-day { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); grid-template-areas: "fountain card" "fountain count"; align-items: center; column-gap: 40px; }
  .gw-day-card { grid-area: card; }
  .gw-day-count { grid-area: count; align-self: start; }
  .gw-fountain { grid-area: fountain; align-self: end; }
  .gw-fountain-core { width: min(30vw, 400px); }
  .gw-story-rail { left: 50%; translate: -50% 0; }
  .gw-ch { grid-template-columns: 1fr 1fr; column-gap: 96px; padding-left: 0; align-items: center; }
  .gw-ch-dot { left: 50%; top: 50%; translate: -50% -50%; }
  .gw-ch-photo { justify-self: end; grid-column: 1; grid-row: 1; }
  .gw-ch-text { grid-column: 2; grid-row: 1; }
  .gw-ch.is-alt .gw-ch-photo { grid-column: 2; justify-self: start; }
  .gw-ch.is-alt .gw-ch-text { grid-column: 1; text-align: right; justify-self: end; }
  .gw-ch.is-alt .gw-ch-line { margin-left: auto; }
  .gw-ch.no-photo .gw-ch-text { grid-column: 1 / -1; text-align: center; justify-self: center; max-width: 520px; padding: 18px 26px; border-radius: 22px; background: var(--wk-surface-solid); border: 1px solid var(--wk-border); box-shadow: var(--wk-shadow); }
  .gw-ch.no-photo .gw-ch-line { margin: 0 auto; }
  .gw-ch.no-photo .gw-ch-dot { top: -18px; translate: -50% 0; }
  .gw-drift { opacity: .95; }
  .gw-venue-cols { grid-template-columns: 1.15fr 1fr; align-items: start; }
  .gw-venue-text { text-align: left; }
  .gw-venue-btns { justify-content: flex-start; }
  .gw-know { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .gw-know-i:first-child:nth-last-child(4), .gw-know-i:first-child:nth-last-child(4) ~ .gw-know-i { grid-column: span 1; }
  .gw-gal-leaf { display: block; }
  .gw-rsvp-peacock, .gw-bless-hang { display: block; }
  .gw-fin-tree-l { left: 0; } .gw-fin-tree-r { right: 0; }
}
@media (min-width: 1120px) {
  .gw-ev-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .gw-know { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gw-fam-tree-l { left: -200px; } .gw-fam-tree-r { right: -200px; }
}
@media (min-width: 1500px) {
  .gw-hang-l { left: 26%; }
  .gw-peacock { right: 18%; }
  .gw-chhatri-l { left: 19%; }
}
/* Short, wide windows (laptops at 1366×650): keep the names clear of the dome. */
@media (min-width: 900px) and (max-height: 760px) {
  .gw-gazebo { height: min(50svh, 560px); }
  .gw-names { font-size: clamp(48px, 10svh, 96px); }
}

/* ── Reduced motion: everything in place, nothing loops ───────────────── */
@media (prefers-reduced-motion: reduce) {
  .gw-root *, .gw-root *::before, .gw-root *::after { animation: none !important; }
  .gw-hero .gw-a, .gw-hero .gw-cloud, .gw-hero .gw-gazebo, .gw-hero .gw-couple, .gw-hero .gw-peacock, .gw-hero .gw-blossom, .gw-hero .gw-hang, .gw-hero .gw-ht, .gw-hero .gw-cue,
  .gw-fin-pav, .gw-fin-couple, .gw-fin-tree, .gw-fam-tree, .gw-gal-leaf, .gw-rsvp-peacock, .gw-invite-rose, .gw-invite-bunch { transition: opacity .4s linear !important; transform: none !important; }
  .gw-l, .gw-hero-text, .gw-drift { transform: none !important; }
  .gw-petals { display: none; }
}
`;
