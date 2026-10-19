"use client";
// ─── The opening: a sealed envelope → the seal lifts → the flap opens → the
//     invitation card rises with a foil monogram → the page beneath. ────────
//
// One tap (also the gesture that starts the music). Transform/opacity only;
// reduced motion = a short crossfade. The envelope is drawn inline (the kit's
// two-tone envelope pieces read --w-paper / --w-paper-shade), so it re-themes.

import { useEffect, useRef, useState } from "react";
import { Monogram, Ornament, PetalBurst, initialOf, useWeddingReducedMotion } from "../../_wedding";
import { dotDate, type WpModel } from "./model";

type Phase = "sealed" | "opening" | "rising" | "leaving" | "gone";

export default function Envelope({ m, onOpen, onGone }: { m: WpModel; onOpen: () => void; onGone: () => void }) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("sealed");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  // Keep the page under the envelope still until it has gone.
  useEffect(() => {
    if (phase === "gone") return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [phase]);

  const open = () => {
    if (phase !== "sealed") return;
    onOpen();
    const at = (ms: number, p: Phase) => timers.current.push(window.setTimeout(() => setPhase(p), ms));
    if (reduce) {
      setPhase("leaving");
      at(450, "gone");
      timers.current.push(window.setTimeout(onGone, 450));
      return;
    }
    setPhase("opening");
    at(820, "rising");
    at(2250, "leaving");
    at(3150, "gone");
    timers.current.push(window.setTimeout(onGone, 3150));
  };

  if (phase === "gone") return null;
  const date = dotDate(m.date);

  return (
    <div className={`wp-open is-${phase}${reduce ? " is-rm" : ""}`} role="dialog" aria-modal="true" aria-label={`Wedding invitation from ${m.couple}`}>
      <div className="wp-open-glow" aria-hidden />
      <Ornament id="mandala-ornate" width={720} className="wp-open-mandala" tone="foil" />
      <div className="wp-open-stage">
        <p className="wk-eyebrow wp-open-k">You&apos;re invited</p>
        {m.hindi && (
          <p className="wp-open-hi" lang="hi">
            आप सादर आमंत्रित हैं
          </p>
        )}
        <button type="button" className="wp-env" onClick={open} aria-label={`Open the invitation from ${m.couple}`} disabled={phase !== "sealed"}>
          <span className="wp-env-back" aria-hidden />
          <span className="wp-env-card" aria-hidden>
            <span className="wp-env-cardIn">
              <Monogram a={m.a} b={m.b} variant="foil" size={92} animate={false} />
              <span className="wp-env-save">Save the date</span>
              {date && <span className="wp-env-date wk-foil-text">{date}</span>}
            </span>
          </span>
          <svg className="wp-env-pocket" viewBox="0 0 600 400" aria-hidden preserveAspectRatio="none">
            <path className="s" d="M0 0L270 222C286 234 314 234 330 222L600 0V400H0Z" />
            <path className="p" d="M0 400L284 196C294 189 306 189 316 196L600 400Z" />
            <path className="l" d="M0 0L270 222C286 234 314 234 330 222L600 0" />
            <path className="l" d="M10 400L284 204C294 197 306 197 316 204L590 400" />
          </svg>
          <svg className="wp-env-flap" viewBox="0 0 600 260" aria-hidden preserveAspectRatio="none">
            <path className="f" d="M0 0H600L322 238C310 248 290 248 278 238Z" />
            <path className="l" d="M24 12H576L318 228C308 236 292 236 282 228Z" />
          </svg>
          <span className="wp-env-seal" aria-hidden>
            <span className="wp-env-sealIn">
              {initialOf(m.a)}
              <i>&amp;</i>
              {initialOf(m.b)}
            </span>
          </span>
        </button>
        <p className="wp-open-names wk-script wk-foil-text wk-shimmer">{m.couple}</p>
        <p className="wp-open-tap">
          <span className="wp-open-dot" aria-hidden />
          Tap to open
          {m.hindi && (
            <span lang="hi" className="wp-open-tapHi">
              {" "}· खोलने के लिए छुएँ
            </span>
          )}
        </p>
      </div>
      {(phase === "rising" || phase === "leaving") && <PetalBurst kind={["rose-petal-blush", "rose-petal", "gold-confetti", "gold-sparkle"]} count={26} seed={11} />}
    </div>
  );
}

export const ENVELOPE_CSS = `
.wp-open { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; overflow: hidden;
  background: radial-gradient(120% 80% at 50% 35%, var(--wk-bg) 0%, var(--wk-bg2) 100%); color: var(--wk-ink);
  transition: opacity .9s cubic-bezier(.22,1,.36,1); }
.wp-open::before { content: ""; position: absolute; inset: 0; background: var(--wk-texture); background-size: 512px; opacity: var(--wk-texture-opacity); pointer-events: none; }
.wp-open-glow { position: absolute; width: 120vmin; height: 120vmin; border-radius: 50%; background: radial-gradient(circle, var(--wk-glow) 0%, transparent 62%); opacity: .75; animation: wp-breathe 6s ease-in-out infinite; }
.wp-open-mandala { position: absolute; opacity: .13; width: min(150vmin, 980px) !important; height: auto; animation: wp-spin 120s linear infinite; }
.wp-open-stage { position: relative; display: grid; justify-items: center; gap: 10px; padding: 24px 16px; width: 100%; transition: transform .9s cubic-bezier(.22,1,.36,1), opacity .9s; }
.wp-open-k { margin: 0; }
.wp-open-hi { margin: -4px 0 6px; font-family: var(--wk-font-deva); font-size: 14px; color: var(--wk-muted); }
.wp-open-names { margin: 18px 0 0; font-size: clamp(38px, 10vw, 64px); line-height: 1.1; text-align: center; padding: 0 .2em; transition: opacity .5s, transform .6s; }
.wp-open-tap { margin: 6px 0 0; font: 600 12px/1 var(--wk-font-sans); letter-spacing: .22em; text-transform: uppercase; color: var(--wk-gold-ink); display: flex; align-items: center; gap: 10px; transition: opacity .4s; }
.wp-open-tapHi { letter-spacing: 0; text-transform: none; font-family: var(--wk-font-deva); font-weight: 500; font-size: 13px; }
.wp-open-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--wk-gold); box-shadow: 0 0 0 0 var(--wk-gold); animation: wp-ping 1.8s ease-out infinite; }

.wp-env { --w: min(84vw, 460px, calc((100svh - 260px) * 1.5)); position: relative; width: var(--w); aspect-ratio: 3 / 2; margin-top: 18px; padding: 0; border: 0; background: none; cursor: pointer; perspective: 1400px;
  color: var(--wk-gold); filter: drop-shadow(0 26px 40px rgba(40, 14, 20, .28)); -webkit-tap-highlight-color: transparent; transition: transform .5s cubic-bezier(.22,1,.36,1); }
.wp-env:not(:disabled):hover { transform: translateY(-3px) rotate(-.6deg); }
.wp-env:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 10px; border-radius: 8px; }
.wp-env-back { position: absolute; inset: 0; border-radius: 6px; background: var(--wk-surface-2); box-shadow: inset 0 0 0 1px var(--wk-border); }
.wp-env-card { position: absolute; left: 6%; right: 6%; top: 6%; height: 88%; z-index: 2; border-radius: 6px; background: var(--wk-surface-solid);
  box-shadow: 0 0 0 1px var(--wk-border), 0 10px 30px -14px rgba(0,0,0,.35); transform: translateY(0); transition: transform 1.25s cubic-bezier(.2,.9,.25,1); display: grid; place-items: center; overflow: hidden; }
.wp-env-card::before { content: ""; position: absolute; inset: 7px; border-radius: 4px; border: 1px solid transparent; background: var(--wk-foil) border-box; -webkit-mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: .8; }
.wp-env-cardIn { display: grid; justify-items: center; gap: 4px; transform: scale(.82); }
.wp-env-cardIn .wk-mono { margin: 0 auto; }
.wp-env-save { font: 600 10px/1 var(--wk-font-caps); letter-spacing: .3em; text-transform: uppercase; color: var(--wk-muted); margin-top: 4px; }
.wp-env-date { font: 500 18px/1.2 var(--wk-font-display); letter-spacing: .14em; }
.wp-env-pocket { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 3; overflow: visible; }
.wp-env-pocket .s { fill: var(--wk-surface-2); filter: brightness(.97); }
.wp-env-pocket .p { fill: var(--wk-surface-solid); }
.wp-env-pocket .l, .wp-env-flap .l { fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linejoin: round; opacity: .85; }
.wp-env-flap { position: absolute; left: 0; top: 0; width: 100%; height: 65%; z-index: 4; transform-origin: 50% 0; transform: rotateX(0deg); backface-visibility: visible;
  transition: transform .8s cubic-bezier(.45,.05,.3,1), z-index 0s .38s; overflow: visible; }
.wp-env-flap .f { fill: var(--wk-surface-solid); }
.wp-env-seal { position: absolute; left: 50%; top: 65%; z-index: 5; width: 22%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(circle at 36% 30%, color-mix(in srgb, var(--wk-accent) 70%, #fff) 0%, var(--wk-accent) 42%, color-mix(in srgb, var(--wk-accent) 62%, #000) 100%);
  box-shadow: 0 6px 14px -4px rgba(0,0,0,.45), inset 0 -3px 6px rgba(0,0,0,.25), inset 0 2px 3px rgba(255,255,255,.35);
  display: grid; place-items: center; transition: transform .45s cubic-bezier(.3,1.4,.5,1), opacity .4s .1s; }
.wp-env-seal::before { content: ""; position: absolute; inset: 9%; border-radius: 50%; border: 1.5px dashed color-mix(in srgb, var(--wk-accent-ink) 55%, transparent); }
.wp-env-sealIn { font: 400 clamp(16px, 4.6vw, 26px)/1 var(--wk-font-script); color: var(--wk-accent-ink); text-shadow: 0 1px 1px rgba(0,0,0,.3); display: flex; align-items: baseline; gap: 1px; }
.wp-env-sealIn i { font-style: normal; font-size: .6em; opacity: .85; }

.wp-open.is-opening .wp-env-seal, .wp-open.is-rising .wp-env-seal, .wp-open.is-leaving .wp-env-seal { transform: scale(1.25) rotate(-12deg); opacity: 0; }
.wp-open.is-opening .wp-env-flap, .wp-open.is-rising .wp-env-flap, .wp-open.is-leaving .wp-env-flap { transform: rotateX(180deg); z-index: 1; transition-delay: .18s, .56s; }
.wp-open.is-rising .wp-env-card, .wp-open.is-leaving .wp-env-card { transform: translateY(-58%); }
.wp-open.is-opening .wp-open-tap, .wp-open.is-rising .wp-open-tap, .wp-open.is-leaving .wp-open-tap { opacity: 0; }
.wp-open.is-rising .wp-open-names { opacity: .0; transform: translateY(10px); }
.wp-open.is-leaving { opacity: 0; pointer-events: none; }
.wp-open.is-leaving .wp-open-stage { transform: scale(1.12) translateY(-4%); }
.wp-open.is-rm, .wp-open.is-rm * { transition-duration: .4s !important; transition-delay: 0s !important; animation: none !important; }
.wp-open.is-rm.is-leaving .wp-open-stage { transform: none; }
@media (max-height: 520px) {
  .wp-env { --w: min(60vw, calc((100svh - 150px) * 1.5)); margin-top: 6px; }
  .wp-open-names { margin-top: 6px; font-size: 34px; }
  .wp-open-hi { display: none; }
}
@keyframes wp-breathe { 50% { transform: scale(1.06); opacity: .95; } }
@keyframes wp-spin { to { transform: rotate(360deg); } }
@keyframes wp-ping { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--wk-gold) 60%, transparent); } 100% { box-shadow: 0 0 0 12px transparent; } }
`;
