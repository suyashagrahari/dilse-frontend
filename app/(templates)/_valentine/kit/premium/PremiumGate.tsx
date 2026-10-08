"use client";

// ─── <PremiumGate> — the first frame of every premium page ───────────────────
//
//   <PremiumGate
//     art={<GlassDome />}                    // the template's sealed object (SVG/CSS, no images needed)
//     kicker="A glasshouse, grown for"
//     sting="chime-cascade"
//     openLabel="Open the glasshouse"
//     onOpen={({ quiet, repeatVisit }) => setScene("threshold")}
//   />
//
// The tap is the ONLY way browsers let sound start, so it is the product's
// first beat, not a cookie banner. One synchronous click handler, in order:
//   audio session "playback" → AudioContext resume → prime the voice note →
//   YouTube unMute()+playVideo() (the player was created at page load) →
//   the sting SFX → the opening animation → onOpen() after `openMs`.
// Until the player is ready (≤ 4 s) the button shows a "tuning…" shimmer; it
// is never disabled. "Open quietly 🔇" opens with music and SFX off.
// Reduced motion: a 250 ms crossfade, no bars, no scale.
// Renders nothing once opened (PremiumRoot remembers it for the visit).

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../useReducedMotion";
import KineticName from "./KineticName";
import { usePremium } from "./PremiumRoot";
import type { CueId } from "./sfx";

export interface PremiumGateProps {
  /** The template's sealed object (envelope, dome, door…). Part of the tap target. */
  art: ReactNode;
  /** Small line above the name ("A sealed invitation for"). */
  kicker?: string;
  /** Optional line under the name (the film title, the date…). */
  subtitle?: ReactNode;
  /** The SFX played in the tap (default "chime-cascade"). */
  sting?: CueId | (string & {});
  /** Button text (default "Break the seal"). */
  openLabel?: string;
  /** Wax-seal line (default "Hand-made for {recipientName}"). */
  sealText?: string;
  /** How long the opening plays before onOpen (default 900 ms; 250 with reduced motion). */
  openMs?: number;
  onOpen: (o: { quiet: boolean; repeatVisit: boolean }) => void;
  /** Paint: background (default var(--vw-bg)), ink, accent. */
  bg?: string;
  ink?: string;
  accent?: string;
  /** Extra class on the root, for template CSS. */
  className?: string;
  style?: CSSProperties;
}

export default function PremiumGate({
  art,
  kicker = "Made for",
  subtitle,
  sting = "chime-cascade",
  openLabel = "Break the seal",
  sealText,
  openMs,
  onOpen,
  bg,
  ink,
  accent,
  className,
  style,
}: PremiumGateProps) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "opening" | "gone">(p.opened ? "gone" : "idle");
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 4000);
    return () => window.clearTimeout(t);
  }, []);
  const music = p.music;
  const tuning = !!music && music.mode === "youtube" && !music.ready && !waited;
  const name = p.recipientName || "you";
  const dur = openMs ?? (reduce ? 250 : 900);

  const go = (quiet: boolean) => {
    if (phase !== "idle") return;
    // Everything audible happens synchronously, right here, inside the tap.
    p.open({ quiet });
    if (!quiet) p.sfx(sting);
    setPhase("opening");
    window.setTimeout(() => {
      setPhase("gone");
      onOpen({ quiet, repeatVisit: p.repeatVisit });
    }, dur);
  };

  if (phase === "gone") return null;

  return (
    <div
      className={`pm-gate${phase === "opening" ? " is-opening" : ""}${reduce ? " is-reduced" : ""}${className ? ` ${className}` : ""}`}
      style={{ background: bg ?? "var(--vw-bg, #1a1020)", color: ink ?? "var(--vw-ink, #fff)", ["--pm-accent" as string]: accent ?? "var(--vw-accent, #d0245f)", ["--pm-open-ms" as string]: `${dur}ms`, ...style }}
      role="dialog"
      aria-modal="true"
      aria-label={`${kicker} ${name}`}
    >
      <span className="pm-bar pm-barTop" aria-hidden />
      <span className="pm-bar pm-barBot" aria-hidden />
      <div className="pm-gateIn">
        <p className="pm-gateKick">{kicker}</p>
        <KineticName text={name} gilt as="h1" className="pm-gateName" />
        {subtitle && <div className="pm-gateSub">{subtitle}</div>}
        <button type="button" className="pm-gateArt" onClick={() => go(false)} aria-label={`${openLabel} — starts the music`} tabIndex={-1}>
          {art}
        </button>
        <button type="button" className={`pm-gateCta${tuning ? " is-tuning" : ""}`} onClick={() => go(false)}>
          <span>{openLabel}</span>
          {tuning && <small aria-live="polite">tuning the music…</small>}
        </button>
        <div className="pm-seal" aria-label={sealText ?? `Hand-made for ${name}`}>
          <span className="pm-sealWax" aria-hidden>✦</span>
          <span className="pm-sealTx">{sealText ?? `Hand-made for ${name}`}</span>
        </div>
        <button type="button" className="pm-quiet" onClick={() => go(true)}>
          <span aria-hidden>🔇</span> Open quietly
        </button>
      </div>
      <style>{GATE_CSS}</style>
    </div>
  );
}

const GATE_CSS = `
.pm-gate { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; overflow: hidden;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  transition: opacity var(--pm-open-ms) ease, transform var(--pm-open-ms) cubic-bezier(.6,0,.2,1); }
.pm-gate.is-opening { opacity: 0; transform: scale(1.08); pointer-events: none; }
.pm-gate.is-reduced.is-opening { transform: none; }
.pm-bar { position: absolute; left: 0; right: 0; height: 7vh; background: #000; z-index: 2; transition: transform var(--pm-open-ms) cubic-bezier(.6,0,.2,1); }
.pm-barTop { top: 0; } .pm-barBot { bottom: 0; }
.pm-gate.is-opening .pm-barTop { transform: translateY(-100%); }
.pm-gate.is-opening .pm-barBot { transform: translateY(100%); }
.pm-gate.is-reduced .pm-bar { display: none; }
.pm-gateIn { position: relative; z-index: 3; display: grid; justify-items: center; gap: 14px; text-align: center; width: min(560px, 100%); }
.pm-gateKick { margin: 0; font: 600 12px/1.2 var(--vw-font-ui, system-ui), sans-serif; letter-spacing: .28em; text-transform: uppercase; opacity: .8; }
.pm-gateName { max-width: 100%; overflow-wrap: anywhere; }
.pm-gateSub { font: 500 15px/1.4 var(--vw-font-ui, system-ui), sans-serif; opacity: .85; }
.pm-gateArt { all: unset; cursor: pointer; display: grid; place-items: center; width: min(320px, 70vw); max-height: 38vh; aspect-ratio: 1;
  animation: pm-breathe 3.6s ease-in-out infinite; -webkit-tap-highlight-color: transparent; }
.pm-gateArt > * { max-width: 100%; max-height: 100%; }
.pm-gateCta { position: relative; overflow: hidden; display: grid; gap: 2px; justify-items: center; min-height: 52px; min-width: 220px; padding: 12px 28px;
  border: 0; border-radius: 99px; cursor: pointer; color: #2b1a03; font: 800 16px/1.1 var(--vw-font-ui, system-ui), sans-serif; letter-spacing: .02em;
  background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); box-shadow: 0 14px 34px -12px rgba(90,55,5,.75), inset 0 1px 0 rgba(255,255,255,.7); }
.pm-gateCta small { font: 600 11px/1 var(--vw-font-ui, system-ui), sans-serif; opacity: .7; letter-spacing: .06em; }
.pm-gateCta.is-tuning::after { content: ""; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%);
  transform: translateX(-100%); animation: pm-tune 1.4s ease-in-out infinite; }
.pm-gateCta:focus-visible, .pm-quiet:focus-visible { outline: 3px solid var(--pm-accent); outline-offset: 3px; }
.pm-seal { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; border-radius: 99px; background: rgba(0,0,0,.18);
  font: 600 13px/1.2 var(--vw-font-ui, system-ui), sans-serif; }
.pm-sealWax { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; color: #fff1bf; font-size: 15px;
  background: radial-gradient(circle at 35% 30%, #d96a5a, #9b2222 55%, #6d1414); box-shadow: inset 0 -3px 0 rgba(0,0,0,.25), 0 3px 8px -2px rgba(0,0,0,.5); }
.pm-quiet { all: unset; cursor: pointer; min-height: 44px; padding: 0 12px; display: inline-flex; align-items: center; gap: 6px;
  font: 600 13px/1 var(--vw-font-ui, system-ui), sans-serif; opacity: .75; text-decoration: underline; text-underline-offset: 3px; }
@keyframes pm-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.025); } }
@keyframes pm-tune { to { transform: translateX(100%); } }
@media (min-width: 1024px) { .pm-gateIn { gap: 18px; } .pm-bar { height: 9vh; } }
@media (max-height: 560px) { .pm-gateArt { max-height: 28vh; } .pm-gateIn { gap: 8px; } }
@media (prefers-reduced-motion: reduce) { .pm-gateArt, .pm-gateCta.is-tuning::after { animation: none; } }
`;
