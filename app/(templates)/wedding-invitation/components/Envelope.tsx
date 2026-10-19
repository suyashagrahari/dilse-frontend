"use client";

// ─── The opening: a wax-sealed envelope ──────────────────────────────────────
//
// sealed (the seal breathes; "Tap the seal to open") → tap → the seal cracks
// and lifts → the flap folds back → the card rises out of the pocket → the
// whole scene dissolves into the invitation. Transform/opacity only; with
// reduced motion it is a plain crossfade. The two-tone envelope art is the
// asset pack's envelope-flap / envelope-back, inlined so it takes the theme's
// paper and foil (a CSS mask would make it a silhouette).

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WEDDING_THEMES, type WeddingThemeId } from "../../_wedding/themes";
import { initialOf } from "../../_wedding/sections/Typography";

type Phase = "sealed" | "breaking" | "opening" | "rising" | "leaving" | "gone";

/** Envelope paper per theme: the outside, the shade inside, and the wax. */
const PAPER: Record<WeddingThemeId, { paper: string; shade: string; inside: string; wax: [string, string]; line: string }> = {
  blush: { paper: "#fbefeb", shade: "#f2dcd6", inside: "#e9c9c2", wax: ["#c4677c", "#7d2338"], line: "#c08a5c" },
  champagne: { paper: "#fcf5e2", shade: "#f1e3bd", inside: "#e6d29c", wax: ["#b3333c", "#6b1119"], line: "#b28a37" },
  powder: { paper: "#f1f5fa", shade: "#dee7f1", inside: "#c9d6e6", wax: ["#3f5f86", "#1d3150"], line: "#b29a5e" },
  maroon: { paper: "#701628", shade: "#5c1120", inside: "#430b16", wax: ["#e5c46f", "#94701f"], line: "#d9b25a" },
  noir: { paper: "#24201b", shade: "#1a1714", inside: "#100e0c", wax: ["#e2c06a", "#8f6b1d"], line: "#cfa94e" },
  emerald: { paper: "#11402f", shade: "#0c3124", inside: "#072118", wax: ["#e3c26c", "#8e6c1e"], line: "#cfab52" },
};

export interface EnvelopeProps {
  theme: WeddingThemeId;
  names: [string, string];
  /** "12 · 12 · 2026" */
  date: string;
  reduced: boolean;
  /** The seal was tapped (start music, analytics…). */
  onOpen?: () => void;
  /** The scene has dissolved: unmount it. */
  onDone: () => void;
}

const T = { breaking: 380, opening: 820, rising: 1050, leaving: 750 };

export default function Envelope({ theme, names, date, reduced, onOpen, onDone }: EnvelopeProps) {
  const [phase, setPhase] = useState<Phase>("sealed");
  const timers = useRef<number[]>([]);
  const p = PAPER[theme];
  const dark = WEDDING_THEMES[theme].dark;

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

  useEffect(() => {
    if (phase === "gone") {
      document.documentElement.style.overflow = "";
      onDone();
    }
  }, [phase, onDone]);

  const open = () => {
    if (phase !== "sealed") return;
    onOpen?.();
    const at = (ms: number, ph: Phase) => timers.current.push(window.setTimeout(() => setPhase(ph), ms));
    if (reduced) {
      setPhase("leaving");
      at(450, "gone");
      return;
    }
    setPhase("breaking");
    let t = T.breaking;
    at(t, "opening");
    t += T.opening;
    at(t - 120, "rising");
    t += T.rising;
    at(t, "leaving");
    t += T.leaving;
    at(t, "gone");
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
  return (
    <div className="wi-env-scene wk-bg" data-phase={phase} data-dark={dark || undefined} style={style}>
      <div className="wi-env-top">
        <p className="wk-eyebrow">You&apos;re invited</p>
        <p className="wi-env-names wk-script wk-foil-text wk-shimmer">
          {a} <span>&amp;</span> {b}
        </p>
      </div>

      <div className="wi-env-wrap">
        <div className="wi-env" onClick={open}>
          <div className="wi-env-back" />
          <div className="wi-env-card wk-paper">
            <span className="wi-env-cardIn">
              <span className="wk-eyebrow">Wedding invitation</span>
              <span className="wi-env-cardNames wk-script wk-foil-text">
                {a} &amp; {b}
              </span>
              {date && <span className="wi-env-cardDate">{date}</span>}
            </span>
          </div>
          <svg className="wi-env-pocket" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden>
            <path d="M0 0L302 226L0 400Z" fill="var(--env-shade)" />
            <path d="M600 0L298 226L600 400Z" fill="var(--env-shade)" />
            <path d="M0 400L284 196C294 189 306 189 316 196L600 400Z" fill="var(--env-paper)" />
            <path d="M10 400L284 204C294 197 306 197 316 204L590 400" fill="none" stroke="var(--env-line)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M34 400L290 216C296 212 304 212 310 216L566 400" fill="none" stroke="var(--env-line)" strokeWidth="0.8" />
            <path d="M3 3H597V397H3Z" fill="none" stroke="var(--env-line)" strokeWidth="2" />
          </svg>
          <div className="wi-env-flap">
            <svg viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden>
              <path d="M0 0H600L322 238C310 248 290 248 278 238Z" fill="var(--env-paper)" />
              <path d="M24 12H576L318 228C308 236 292 236 282 228Z" fill="none" stroke="var(--env-line)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M44 22H556L314 222" fill="none" stroke="var(--env-line)" strokeWidth="0.8" />
              <path d="M44 22L286 222" fill="none" stroke="var(--env-line)" strokeWidth="0.8" />
            </svg>
          </div>
          <button
            type="button"
            className="wi-env-seal"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            aria-label={`Open the wedding invitation of ${a} and ${b}`}
            disabled={phase !== "sealed"}
          >
            <span className="wi-env-wax" aria-hidden />
            <span className="wi-env-sealTx" aria-hidden>
              {initialOf(a)}
              <i>&amp;</i>
              {initialOf(b)}
            </span>
          </button>
        </div>
      </div>

      <p className="wi-env-hint" aria-hidden={phase !== "sealed"}>
        <span>Tap the seal to open</span>
        <span lang="hi">खोलने के लिए छुएँ</span>
      </p>
    </div>
  );
}

export const ENVELOPE_CSS = /* css */ `
.wi-env-scene { position: fixed; inset: 0; z-index: 70; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(14px, 3.4vh, 30px);
  padding: max(64px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)); overflow: hidden; transition: opacity .75s var(--wk-ease-soft), visibility 0s linear .75s; }
.wi-env-scene[data-phase=leaving], .wi-env-scene[data-phase=gone] { opacity: 0; visibility: hidden; pointer-events: none; }
.wi-env-top { text-align: center; transition: opacity .5s, transform .6s var(--wk-ease); }
.wi-env-top .wk-eyebrow { margin: 0; }
.wi-env-names { margin: 4px 0 0; font-size: clamp(40px, 11vw, 74px); line-height: 1.15; padding: 0 .1em; }
.wi-env-names span { font-size: .6em; vertical-align: .18em; }
.wi-env-scene:not([data-phase=sealed]) .wi-env-top { opacity: 0; transform: translateY(-16px); }

.wi-env-wrap { width: min(86vw, 460px, calc((100dvh - 250px) * 1.5)); min-width: 240px; }
.wi-env { position: relative; width: 100%; aspect-ratio: 3 / 2; perspective: 1400px; cursor: pointer; -webkit-tap-highlight-color: transparent; container-type: inline-size;
  transition: transform 1s var(--wk-ease); }
.wi-env-back { position: absolute; inset: 0; border-radius: 6px; background: var(--env-inside);
  box-shadow: 0 30px 60px -28px rgba(30, 14, 8, .55), 0 8px 18px -10px rgba(30, 14, 8, .3); }
.wi-env-scene[data-dark] .wi-env-back { box-shadow: 0 30px 70px -24px rgba(0, 0, 0, .8), 0 0 0 1px rgba(255, 220, 150, .08); }
.wi-env-card { position: absolute; left: 5.5%; right: 5.5%; top: 5%; height: 92%; z-index: 2; border-radius: 4px; display: grid; place-items: center; text-align: center;
  background-color: var(--wk-surface-solid); box-shadow: inset 0 0 0 1px var(--wk-border), inset 0 0 0 6px var(--wk-surface-solid), inset 0 0 0 7px var(--wk-gold);
  transform: translateY(0); transition: transform 1.05s cubic-bezier(.2, .9, .25, 1); will-change: transform; overflow: hidden; }
.wi-env-cardIn { display: grid; gap: 4px; padding: 0 10%; transform: translateY(-14%); }
.wi-env-cardIn .wk-eyebrow { margin: 0; font-size: max(7px, 2.5cqw); }
.wi-env-cardNames { font-size: 9cqw; line-height: 1.2; }
.wi-env-cardDate { font: 600 max(7px, 2.6cqw)/1 var(--wk-font-caps); letter-spacing: .24em; color: var(--wk-gold-ink); }
.wi-env-pocket { position: absolute; inset: 0; z-index: 3; width: 100%; height: 100%; border-radius: 6px; overflow: hidden;
  filter: drop-shadow(0 -2px 3px rgba(40, 20, 8, .12)); }
.wi-env-flap { position: absolute; left: 0; right: 0; top: 0; height: 65%; z-index: 4; transform-origin: 50% 0; transform: rotateX(0deg);
  transition: transform .82s cubic-bezier(.55, .05, .3, 1); filter: drop-shadow(0 4px 5px rgba(40, 20, 8, .2)); will-change: transform; }
.wi-env-flap svg { display: block; width: 100%; height: 100%; }
.wi-env-seal { position: absolute; left: 50%; top: 60.5%; z-index: 5; width: 25%; aspect-ratio: 1; min-width: 64px; transform: translate(-50%, -50%);
  border: 0; padding: 0; background: none; cursor: pointer; border-radius: 50%; display: grid; place-items: center;
  animation: wi-breathe 3.2s ease-in-out infinite; -webkit-tap-highlight-color: transparent; }
.wi-env-seal:focus-visible { outline: 2px solid var(--wk-gold); outline-offset: 6px; }
.wi-env-wax { position: absolute; inset: 0; background: radial-gradient(circle at 38% 32%, var(--env-wax-a), var(--env-wax-b) 72%);
  -webkit-mask: url(/wedding/ornaments/wax-seal.svg) center / contain no-repeat; mask: url(/wedding/ornaments/wax-seal.svg) center / contain no-repeat;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, .35)); }
.wi-env-sealTx { position: relative; font: 600 clamp(17px, 5vw, 26px)/1 var(--wk-font-caps); letter-spacing: .02em; color: rgba(255, 245, 225, .9);
  text-shadow: 0 -1px 0 rgba(0, 0, 0, .35), 0 1px 0 rgba(255, 255, 255, .25); }
.wi-env-scene[data-dark] .wi-env-sealTx { color: rgba(70, 45, 8, .85); text-shadow: 0 1px 0 rgba(255, 240, 200, .5); }
.wi-env-sealTx i { font: italic 500 .7em var(--wk-font-display); margin: 0 .08em; }
@keyframes wi-breathe { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.045); } }

.wi-env-hint { margin: 0; display: grid; gap: 2px; text-align: center; font: 500 13px/1.35 var(--wk-font-sans); letter-spacing: .14em; text-transform: uppercase; color: var(--wk-muted);
  animation: wi-hint 2.6s ease-in-out infinite; transition: opacity .4s; }
.wi-env-hint span[lang=hi] { font: 500 14px/1.4 var(--wk-font-deva); letter-spacing: 0; text-transform: none; }
.wi-env-scene:not([data-phase=sealed]) .wi-env-hint { opacity: 0; animation: none; }
@keyframes wi-hint { 0%, 100% { opacity: .65; } 50% { opacity: 1; } }

/* breaking → opening → rising */
.wi-env-scene:not([data-phase=sealed]) .wi-env-seal { animation: wi-crack .42s cubic-bezier(.3, .7, .4, 1) forwards; pointer-events: none; }
@keyframes wi-crack { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 35% { transform: translate(-50%, -50%) scale(1.14) rotate(-6deg); opacity: 1; }
  100% { transform: translate(-50%, -78%) scale(.7) rotate(14deg); opacity: 0; } }
.wi-env-scene[data-phase=opening] .wi-env-flap, .wi-env-scene[data-phase=rising] .wi-env-flap, .wi-env-scene[data-phase=leaving] .wi-env-flap { transform: rotateX(180deg); }
.wi-env-scene[data-phase=rising] .wi-env-flap, .wi-env-scene[data-phase=leaving] .wi-env-flap { z-index: 1; }
.wi-env-scene[data-phase=rising] .wi-env-card, .wi-env-scene[data-phase=leaving] .wi-env-card { transform: translateY(-62%); }
.wi-env-scene[data-phase=rising] .wi-env, .wi-env-scene[data-phase=leaving] .wi-env { transform: translateY(18%); }
.wi-env-scene[data-phase=leaving] .wi-env-card { transform: translateY(-62%) scale(1.08); }

@media (max-height: 480px) and (orientation: landscape) {
  .wi-env-scene { gap: 8px; padding-top: 12px; padding-bottom: 10px; }
  .wi-env-names { font-size: 34px; }
  .wi-env-wrap { width: min(56vw, calc((100dvh - 132px) * 1.5)); }
  .wi-env-hint { font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .wi-env-seal, .wi-env-hint { animation: none !important; }
  .wi-env, .wi-env-card, .wi-env-flap, .wi-env-top { transition: none !important; }
}
`;
