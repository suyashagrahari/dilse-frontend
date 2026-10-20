"use client";

// ─── The opening: a wax-sealed envelope ──────────────────────────────────────
//
// sealed (the envelope settles onto the plate, the seal pulses, "Tap the seal
// to open") → tap → press (the seal gives under the thumb) → crack (it splits
// into two halves that fall away) → flap (the flap folds back on its hinge and
// shows its gold-damask liner) → slide (the card rises out of the pocket) →
// settle (the envelope sinks away while the page's arch card takes its place)
// → gone. Transform/opacity only; one floral sprig (the theme's own pose) is
// tucked behind the envelope. With reduced motion it is a 300 ms crossfade.
//
// The backdrop plate is NOT here: the page paints it once, under both.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WEDDING_THEMES, type WeddingThemeId } from "../../_wedding/themes";
import { initialOf } from "../../_wedding/sections/Typography";
import { CLASSIC_ART } from "./art";
import Floral from "./Floral";

/** Envelope paper per theme: the outside, the shade inside, the liner, the wax and the foil line. */
const PAPER: Record<WeddingThemeId, { paper: string; shade: string; inside: string; wax: [string, string]; line: string }> = {
  blush: { paper: "#fdf3f0", shade: "#f4dfd9", inside: "#ebcac3", wax: ["#c75a6e", "#7a2236"], line: "#b98a4e" },
  champagne: { paper: "#fffaeb", shade: "#f3e6c4", inside: "#e8d6a4", wax: ["#b8343e", "#68101a"], line: "#b8913f" },
  powder: { paper: "#f5f8fc", shade: "#e1e9f3", inside: "#c9d7e6", wax: ["#4a6c95", "#1d3150"], line: "#a9895a" },
  maroon: { paper: "#6e1626", shade: "#5a111f", inside: "#3d0811", wax: ["#ecd07e", "#93701e"], line: "#d4af37" },
  noir: { paper: "#211d17", shade: "#18150f", inside: "#0d0b08", wax: ["#b3333c", "#5e0d14"], line: "#d9b45a" },
  emerald: { paper: "#104634", shade: "#0b3426", inside: "#062019", wax: ["#ecd07e", "#8e6c1e"], line: "#d6b252" },
};

export interface EnvelopeProps {
  theme: WeddingThemeId;
  names: [string, string];
  /** "12 · 12 · 2026" */
  date: string;
  /** "For the Sharma family" (from ?to=), or "". */
  guest: string;
  reduced: boolean;
  /** Resolves once the card's art is decoded (the scene waits for it, briefly). */
  ready?: () => Promise<unknown>;
  /** The seal was tapped (start music, analytics…). */
  onOpen?: () => void;
  /** The envelope is sinking away: show the page's card now. */
  onReveal: () => void;
  /** The scene is finished: unmount it (frees its layers). */
  onDone: () => void;
}

/** Beat offsets from the tap (ms): spec §4.3. */
const BEATS = { crack: 250, flap: 450, flapped: 900, slide: 1200, settle: 2100, gone: 3000 } as const;
type Beat = keyof typeof BEATS | "press";

export default function Envelope({ theme, names, date, guest, reduced, ready, onOpen, onReveal, onDone }: EnvelopeProps) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const p = PAPER[theme];
  const dark = WEDDING_THEMES[theme].dark;
  const floral = CLASSIC_ART[theme].floral;

  useEffect(() => {
    // The page under the envelope must not scroll while it is sealed.
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const t = timers.current;
    return () => {
      html.style.overflow = prev;
      t.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const open = async () => {
    if (started.current) return;
    started.current = true;
    onOpen?.();
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const hit = (b: Beat) => setBeats((s) => (s.includes(b) ? s : [...s, b]));
    if (reduced) {
      hit("settle");
      onReveal();
      at(320, () => {
        document.documentElement.style.overflow = "";
        onDone();
      });
      return;
    }
    try {
      navigator.vibrate?.(12);
    } catch {
      /* not supported */
    }
    hit("press");
    // Decode the card's art before the scene runs (never wait more than a beat).
    const t0 = performance.now();
    await Promise.race([ready?.() ?? Promise.resolve(), new Promise((r) => window.setTimeout(r, 650))]);
    const lag = Math.max(0, BEATS.crack - (performance.now() - t0));
    const base = lag - BEATS.crack;
    at(base + BEATS.crack, () => hit("crack"));
    at(base + BEATS.flap, () => hit("flap"));
    at(base + BEATS.flapped, () => hit("flapped"));
    at(base + BEATS.slide, () => hit("slide"));
    at(base + BEATS.settle, () => {
      hit("settle");
      document.documentElement.style.overflow = "";
      onReveal();
    });
    at(base + BEATS.gone, onDone);
  };

  const style = {
    "--env-paper": p.paper,
    "--env-shade": p.shade,
    "--env-inside": p.inside,
    "--env-line": p.line,
    "--env-wax-a": p.wax[0],
    "--env-wax-b": p.wax[1],
  } as CSSProperties;

  const [a, b] = names;
  const cls = beats.map((x) => ` is-${x}`).join("");
  const seal = (
    <>
      <span className="wi-env-wax" />
      <span className="wi-env-sealTx">
        {initialOf(a)}
        <i>&amp;</i>
        {initialOf(b)}
      </span>
    </>
  );

  return (
    <div className={`wi-env-scene${cls}`} data-dark={dark || undefined} data-gold-wax={(dark && theme !== "noir") || undefined} style={style}>
      <div className="wi-env-top">
        <p className="wk-eyebrow">You&apos;re invited</p>
        <p className="wi-env-names wk-script wk-foil-text">
          {a} <span>&amp;</span> {b}
        </p>
      </div>

      <div className="wi-env-wrap">
        <div className="wi-env" onClick={open}>
          {/* A sprig of the card's florals tucked behind the envelope. */}
          <Floral spec={floral} className="wi-env-sprig wi-env-sprig-a" priority sizes="40vw" />
          <Floral spec={floral} className="wi-env-sprig wi-env-sprig-b" priority sizes="30vw" />

          <div className="wi-env-back" />
          <div className="wi-env-card">
            <span className="wi-env-cardIn">
              <span className="wk-eyebrow">Wedding invitation</span>
              <span className="wi-env-cardNames wk-script wk-foil-text">
                {a} &amp; {b}
              </span>
              {date && <span className="wi-env-cardDate">{date}</span>}
            </span>
          </div>
          <svg className="wi-env-pocket" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="wi-env-side" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--env-shade)" />
                <stop offset="1" stopColor="var(--env-paper)" />
              </linearGradient>
              <linearGradient id="wi-env-sideR" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0" stopColor="var(--env-shade)" />
                <stop offset="1" stopColor="var(--env-paper)" />
              </linearGradient>
              <linearGradient id="wi-env-bottom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--env-paper)" />
                <stop offset="1" stopColor="var(--env-shade)" />
              </linearGradient>
            </defs>
            <path d="M0 0L302 226L0 400Z" fill="url(#wi-env-side)" />
            <path d="M600 0L298 226L600 400Z" fill="url(#wi-env-sideR)" />
            <path d="M0 400L284 196C294 189 306 189 316 196L600 400Z" fill="url(#wi-env-bottom)" />
            <path d="M10 400L284 204C294 197 306 197 316 204L590 400" fill="none" stroke="var(--env-line)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M34 400L290 216C296 212 304 212 310 216L566 400" fill="none" stroke="var(--env-line)" strokeWidth="0.8" />
            <path d="M3 3H597V397H3Z" fill="none" stroke="var(--env-line)" strokeWidth="2" />
            <path d="M11 11H589V389H11Z" fill="none" stroke="var(--env-line)" strokeWidth="0.7" opacity=".7" />
          </svg>
          {guest && <span className="wi-env-guest">{guest}</span>}
          <div className="wi-env-flap">
            <svg className="wi-env-flapFace" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden>
              <defs>
                <filter id="wi-env-blur" x="-10%" y="-10%" width="120%" height="130%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
                <linearGradient id="wi-env-flapG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--env-paper)" />
                  <stop offset="1" stopColor="var(--env-shade)" />
                </linearGradient>
              </defs>
              <path d="M0 4H600L322 248C310 258 290 258 278 248Z" fill="#000" opacity=".22" filter="url(#wi-env-blur)" />
              <path d="M0 0H600L322 238C310 248 290 248 278 238Z" fill="url(#wi-env-flapG)" />
              <path d="M24 12H576L318 228C308 236 292 236 282 228Z" fill="none" stroke="var(--env-line)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M44 22H556L314 222" fill="none" stroke="var(--env-line)" strokeWidth="0.8" />
              <path d="M44 22L286 222" fill="none" stroke="var(--env-line)" strokeWidth="0.8" />
            </svg>
            {/* The flap's inside: the liner, seen once it folds back. */}
            <div className="wi-env-liner" />
          </div>
          <button
            type="button"
            className="wi-env-seal"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            aria-label={`Open the wedding invitation of ${a} and ${b}`}
            disabled={beats.length > 0}
          >
            <span className="wi-env-sealWhole" aria-hidden>
              {seal}
            </span>
            <span className="wi-env-sealHalf wi-env-sealL" aria-hidden>
              {seal}
            </span>
            <span className="wi-env-sealHalf wi-env-sealR" aria-hidden>
              {seal}
            </span>
          </button>
        </div>
      </div>

      <p className="wi-env-hint" aria-hidden={beats.length > 0}>
        <span>Tap the seal to open</span>
        <span lang="hi">खोलने के लिए छुएँ</span>
      </p>
    </div>
  );
}

const CRACK_L = "polygon(0 0, 50% 0, 45% 17%, 55% 33%, 46% 51%, 56% 68%, 47% 85%, 52% 100%, 0 100%)";
const CRACK_R = "polygon(50% 0, 100% 0, 100% 100%, 52% 100%, 47% 85%, 56% 68%, 46% 51%, 55% 33%, 45% 17%)";

export const ENVELOPE_CSS = /* css */ `
.wi-env-scene { position: fixed; inset: 0; z-index: 70; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(18px, 4vh, 34px);
  padding: max(64px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)); overflow: hidden; color: var(--wk-ink); }
.wi-env-top { text-align: center; animation: wi-fadeUp .8s var(--wi-soft) .1s both; }
.wi-env-top .wk-eyebrow { margin: 0; }
.wi-env-names { margin: 4px 0 0; font-size: clamp(40px, 11vw, 74px); line-height: 1.15; padding: 0 .1em; text-shadow: 0 1px 0 rgba(255,255,255,.12); }
.wi-env-names span { font-size: .6em; vertical-align: .18em; }
.wi-env-scene.is-press .wi-env-top { animation: wi-fadeAway .45s var(--wi-soft) forwards; pointer-events: none; }
@keyframes wi-fadeAway { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-16px); } }

.wi-env-wrap { width: min(86vw, 460px, calc((100dvh - 260px) * 1.333)); min-width: 240px; animation: wi-arrive .9s var(--wi-soft) .2s both; }
.wi-env { position: relative; width: 100%; aspect-ratio: 4 / 3; perspective: 900px; cursor: pointer; -webkit-tap-highlight-color: transparent; container-type: inline-size;
  animation: wi-envBreathe 4s ease-in-out 1.1s infinite alternate; }
.wi-env-scene.is-press .wi-env { animation: none; }
.wi-env-scene.is-settle .wi-env { transform: translateY(40vh); opacity: 0; transition: transform .9s var(--wi-silk), opacity .7s var(--wi-soft); }
@keyframes wi-arrive { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@keyframes wi-envBreathe { from { transform: scale(1); } to { transform: scale(1.012); } }
@keyframes wi-fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

.wi-env-sprig { position: absolute; z-index: 0; pointer-events: none; }
.wi-env-sprig-a { width: 52%; left: -16%; top: -17%; transform: rotate(-150deg) scaleY(-1); }
.wi-env-sprig-b { width: 38%; right: -11%; bottom: -13%; transform: rotate(32deg) scaleY(-1); }
[data-wk-theme=noir] .wi-env-sprig-a { width: 30%; left: -8%; top: -12%; }
[data-wk-theme=noir] .wi-env-sprig-b { width: 22%; right: -6%; bottom: -9%; }
.wi-env-back { position: absolute; inset: 0; z-index: 1; border-radius: 6px; background: var(--env-inside); overflow: hidden;
  box-shadow: 0 34px 60px -30px rgba(30, 14, 8, .6), 0 10px 20px -12px rgba(30, 14, 8, .35); }
.wi-env-back::after, .wi-env-liner::after { content: ""; position: absolute; inset: 0; background: var(--env-line); opacity: .32;
  -webkit-mask: url(/wedding/ornaments/damask-tile.svg) 0 0 / 46px 64px repeat; mask: url(/wedding/ornaments/damask-tile.svg) 0 0 / 46px 64px repeat; }
.wi-env-scene[data-dark] .wi-env-back { box-shadow: 0 34px 70px -26px rgba(0, 0, 0, .85), 0 0 0 1px rgba(255, 220, 150, .1); }
.wi-env-card { position: absolute; left: 6%; right: 6%; top: 6%; height: 90%; z-index: 2; border-radius: 4px; display: grid; place-items: center; text-align: center;
  background: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px var(--wk-border), inset 0 0 0 6px var(--wk-surface-solid), inset 0 0 0 7px var(--wk-gold), 0 2px 6px rgba(0,0,0,.12);
  overflow: hidden; }
.wi-env-scene.is-slide .wi-env-card { transform: translateY(-62%); transition: transform 1.1s var(--wi-expo); }
.wi-env-scene.is-settle .wi-env-card { opacity: 0; transition: transform 1.1s var(--wi-expo), opacity .4s var(--wi-soft); }
.wi-env-cardIn { display: grid; gap: 4px; padding: 0 10%; transform: translateY(-16%); }
.wi-env-cardIn .wk-eyebrow { margin: 0; font-size: max(7px, 2.5cqw); }
.wi-env-cardNames { font-size: 9cqw; line-height: 1.2; }
.wi-env-cardDate { font: 600 max(7px, 2.6cqw)/1 var(--wk-font-caps); letter-spacing: .24em; color: var(--wk-gold-ink); }
.wi-env-pocket { position: absolute; inset: 0; z-index: 3; width: 100%; height: 100%; border-radius: 6px; overflow: hidden; filter: drop-shadow(0 -2px 3px rgba(40, 20, 8, .14)); }
.wi-env-guest { position: absolute; left: 0; right: 0; bottom: 9%; z-index: 3; text-align: center; font: italic 500 max(13px, 4.2cqw)/1.2 var(--wk-font-display); color: var(--wk-gold-ink);
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding: 0 18%; }
.wi-env-scene[data-dark] .wi-env-guest { color: var(--env-line); }
.wi-env-flap { position: absolute; left: 0; right: 0; top: 0; height: 70%; z-index: 4; transform-origin: 50% 0; transform: rotateX(0deg); transform-style: preserve-3d; }
.wi-env-flapFace { position: absolute; inset: 0; display: block; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.wi-env-liner { position: absolute; left: 0; right: 0; top: 0; height: calc(100% * 248 / 280); background: linear-gradient(var(--env-inside), var(--env-shade)); overflow: hidden;
  clip-path: polygon(0 100%, 100% 100%, 53.7% 4%, 50% 0, 46.3% 4%); transform: rotateX(180deg); -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.wi-env-scene.is-flap .wi-env-flap { transform: rotateX(180deg); transition: transform .9s var(--wi-silk); }
.wi-env-scene.is-flapped .wi-env-flap { z-index: 1; }

.wi-env-seal { position: absolute; left: 50%; top: 60%; z-index: 5; width: 26%; aspect-ratio: 1; min-width: 64px; margin: 0; transform: translate(-50%, -50%);
  border: 0; padding: 0; background: none; cursor: pointer; border-radius: 50%; -webkit-tap-highlight-color: transparent; }
.wi-env-seal:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 6px; }
.wi-env-sealWhole, .wi-env-sealHalf { position: absolute; inset: 0; display: grid; place-items: center; }
.wi-env-sealWhole { animation: wi-sealIn .6s var(--wi-press) .8s both, wi-pulse 2.5s ease-in-out 1.6s infinite; }
.wi-env-sealHalf { visibility: hidden; }
.wi-env-sealL { clip-path: ${CRACK_L}; }
.wi-env-sealR { clip-path: ${CRACK_R}; }
.wi-env-wax { position: absolute; inset: 0; background: radial-gradient(circle at 36% 30%, var(--env-wax-a), var(--env-wax-b) 74%);
  -webkit-mask: url(/wedding/ornaments/wax-seal.svg) center / contain no-repeat; mask: url(/wedding/ornaments/wax-seal.svg) center / contain no-repeat; }
.wi-env-sealWhole::before { content: ""; position: absolute; inset: 4%; border-radius: 50%; box-shadow: 0 5px 9px -3px rgba(0,0,0,.45); }
.wi-env-sealTx { position: relative; font: 600 clamp(17px, 5vw, 26px)/1 var(--wk-font-caps); letter-spacing: .02em; color: rgba(255, 245, 225, .9);
  text-shadow: 0 -1px 0 rgba(0, 0, 0, .35), 0 1px 0 rgba(255, 255, 255, .25); }
.wi-env-scene[data-gold-wax] .wi-env-sealTx { color: rgba(70, 45, 8, .85); text-shadow: 0 1px 0 rgba(255, 240, 200, .5); }
.wi-env-sealTx i { font: italic 500 .7em var(--wk-font-display); margin: 0 .08em; }
@keyframes wi-sealIn { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: none; } }
@keyframes wi-pulse { 0%, 70%, 100% { transform: scale(1); } 82% { transform: scale(1.04); } }
.wi-env-scene.is-press .wi-env-sealWhole { animation: wi-press .26s var(--wi-press) both; }
@keyframes wi-press { 0% { transform: scale(1); } 45% { transform: scale(.92); } 100% { transform: scale(1.02); } }
.wi-env-scene.is-crack .wi-env-sealWhole { visibility: hidden; }
.wi-env-scene.is-crack .wi-env-sealHalf { visibility: visible; }
.wi-env-scene.is-crack .wi-env-sealL { animation: wi-halfL .7s var(--wi-soft) forwards; }
.wi-env-scene.is-crack .wi-env-sealR { animation: wi-halfR .7s var(--wi-soft) forwards; }
@keyframes wi-halfL { from { transform: scale(1.02); opacity: 1; } to { transform: translate(-14px, 30px) rotate(-18deg); opacity: 0; } }
@keyframes wi-halfR { from { transform: scale(1.02); opacity: 1; } to { transform: translate(14px, 30px) rotate(18deg); opacity: 0; } }
.wi-env-scene.is-crack .wi-env-seal { pointer-events: none; }
.wi-env-scene.is-flapped .wi-env-seal { display: none; }

.wi-env-hint { margin: 0; display: grid; gap: 2px; text-align: center; font: 500 13px/1.35 var(--wk-font-sans); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-muted);
  animation: wi-fadeUp .6s var(--wi-soft) 1.2s both; }
.wi-env-hint span[lang=hi] { font: 500 14px/1.4 var(--wk-font-deva); letter-spacing: 0; text-transform: none; }
.wi-env-scene.is-press .wi-env-hint { animation: wi-fadeAway .3s var(--wi-soft) forwards; }
.wi-env-scene.is-gone { display: none; }

@media (max-height: 480px) and (orientation: landscape) {
  .wi-env-scene { gap: 8px; padding-top: 12px; padding-bottom: 10px; }
  .wi-env-names { font-size: 34px; }
  .wi-env-wrap { width: min(50vw, calc((100dvh - 132px) * 1.333)); }
  .wi-env-hint { font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .wi-env-scene * { animation: none !important; transition: none !important; }
  .wi-env-scene { transition: opacity .3s linear; }
  .wi-env-scene.is-settle { opacity: 0; }
  .wi-env-scene.is-settle .wi-env { transform: none; opacity: 1; }
}
`;
