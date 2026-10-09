"use client";

// The gate: "Trick or treat, {name}?" over a glowing 3D jack-o'-lantern at the
// manor door. BOTH buttons are a treat (the joke): "Trick" answers "Nice try.
// Treat." and opens anyway. Like the kit's PremiumGate, everything audible
// happens synchronously inside the tap: p.open() (audio session, AudioContext,
// voice prime, YouTube unMute+play), then the sting (a door creak + a chime),
// then the opening plays and onOpen() follows. "Open quietly" opens muted.

import { useEffect, useState } from "react";
import { Fluent3D, KineticName, PremiumCTA, requestTiltPermission, usePremium } from "../../../_valentine/kit/premium";
import { useReducedMotion } from "../../../_valentine/kit";
import type { Night } from "./model";
import { BODY, DISPLAY } from "./fonts";

export default function Gate({ n, justUnsealed, onOpen }: { n: Night; justUnsealed: boolean; onOpen: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "trick" | "opening">("idle");
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 4000);
    return () => window.clearTimeout(t);
  }, []);
  const tuning = !!p.music && p.music.mode === "youtube" && !p.music.ready && !waited;

  const go = (how: "treat" | "trick" | "quiet") => {
    if (phase !== "idle") return;
    const quiet = how === "quiet";
    p.open({ quiet });
    void requestTiltPermission();
    if (!quiet) {
      p.sfx("creak", { gain: 0.7 });
      p.sfx(how === "trick" ? "pop" : "chime", { gain: 0.5, at: 0.05 });
    }
    setPhase(how === "trick" ? "trick" : "opening");
    const hold = reduce ? 250 : how === "trick" ? 1700 : 1100;
    if (how === "trick") window.setTimeout(() => setPhase("opening"), reduce ? 0 : 900);
    window.setTimeout(onOpen, hold);
  };

  return (
    <div className={`nm-scene nm-gate is-${phase}`} role="dialog" aria-modal="true" aria-label={`Trick or treat, ${n.recipient}?`}>
      <div className="nm-gateDoor" aria-hidden />
      <div className="nm-gateIn">
        <p className="nm-eyebrow">{justUnsealed ? "Unsealed at midnight" : `${n.manor} · 31 October`}</p>

        <div className="nm-gateArt">
          <span className="nm-gateGlow" aria-hidden />
          <button type="button" className="nm-gatePumpkin" onClick={() => go("treat")} tabIndex={-1} aria-hidden>
            <Fluent3D name="jack-o-lantern" size={176} glow="#E0782F" eager period={5.6} />
          </button>
        </div>

        <div className="nm-gateWords">
          <p className="nm-gateAsk">Trick or treat,</p>
          <KineticName text={`${n.recipient}?`} gilt as="h1" size="clamp(54px, 17vw, 104px)" font={DISPLAY} className="nm-gateName" />
        </div>

        <div className="nm-gateBtns">
          <button type="button" className="nm-trick" onClick={() => go("trick")} disabled={phase !== "idle"}>
            {phase === "trick" || (phase === "opening" && !reduce) ? "Nice try. Treat." : "Trick"}
          </button>
          <PremiumCTA tone="ember" cue={null} onClick={() => go("treat")} className="nm-treat" disabled={phase !== "idle"}>
            Treat
          </PremiumCTA>
        </div>
        <p className={`nm-tuning${tuning ? " is-on" : ""}`} aria-live="polite">{tuning ? "tuning the music…" : "sound on"}</p>

        <div className="nm-gateSeal">
          <span className="nm-gateWax" aria-hidden>✦</span>
          <span>Hand-made for {n.recipient}</span>
        </div>
        <button type="button" className="nm-quiet" onClick={() => go("quiet")} style={{ fontSize: 13 }}>
          Open quietly
        </button>
      </div>
      <style>{GATE_CSS}</style>
    </div>
  );
}

const GATE_CSS = `
.nm-gate { z-index: 20; justify-content: center; transition: opacity .9s ease, transform 1.1s cubic-bezier(.6,0,.2,1); }
.nm-gate.is-opening { opacity: 0; transform: scale(1.12); pointer-events: none; }
.nm-gateDoor { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(42% 30% at 50% 44%, rgba(224,120,47,.22), transparent 70%),
    linear-gradient(90deg, rgba(0,0,0,.65), transparent 22%, transparent 78%, rgba(0,0,0,.65)); }
.nm-gateIn { position: relative; display: grid; justify-items: center; gap: 10px; text-align: center; width: min(560px, 100%); }
.nm-gateArt { position: relative; display: grid; place-items: center; height: clamp(170px, 26svh, 230px); margin: 6px 0 2px; }
.nm-gateGlow { position: absolute; width: 300px; height: 300px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(242,179,91,.35), rgba(224,120,47,.12) 40%, transparent 70%); animation: nm-flicker 3.2s ease-in-out infinite; }
@keyframes nm-flicker { 0%,100% { opacity: .8; transform: scale(1); } 20% { opacity: .95; } 35% { opacity: .7; transform: scale(.97); } 60% { opacity: 1; transform: scale(1.03); } }
.nm-gatePumpkin { all: unset; cursor: pointer; position: relative; -webkit-tap-highlight-color: transparent; }
.nm-gate.is-opening .nm-gateGlow { animation: none; transform: scale(3); opacity: 1; transition: transform 1s ease, opacity 1s ease; }
.nm-gateWords { display: grid; justify-items: center; gap: 2px; }
.nm-gateAsk { margin: 0; font: italic 300 clamp(22px, 6vw, 30px)/1 ${BODY}; color: rgba(241,233,216,.85); }
.nm-gateName { margin: 0; line-height: .95; max-width: 100%; overflow-wrap: anywhere; }
.nm-gateBtns { display: flex; gap: 12px; align-items: center; justify-content: center; margin-top: 18px; }
.nm-trick { all: unset; box-sizing: border-box; cursor: pointer; min-height: 52px; min-width: 128px; padding: 0 22px; border-radius: 99px; text-align: center;
  font: 400 17px/1 ${BODY}; color: #F1E9D8; border: 1px solid rgba(232,223,204,.35); background: rgba(232,223,204,.06);
  transition: background .3s ease, transform .3s cubic-bezier(.22,1,.36,1); -webkit-tap-highlight-color: transparent; }
.nm-trick:hover { background: rgba(232,223,204,.12); }
.nm-trick:focus-visible { outline: 2px solid #F2B35B; outline-offset: 3px; }
.nm-gate.is-trick .nm-trick { animation: nm-wobble .5s ease; border-color: rgba(242,179,91,.8); color: #F2B35B; }
@keyframes nm-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-5deg); } 60% { transform: rotate(4deg); } }
.nm-treat { min-width: 128px; }
.nm-tuning { margin: 2px 0 0; font: italic 400 13px/1 ${BODY}; color: rgba(232,223,204,.55); min-height: 14px; letter-spacing: .04em; }
.nm-tuning.is-on { animation: nm-breath 1.4s ease-in-out infinite; }
.nm-gateSeal { display: inline-flex; align-items: center; gap: 10px; margin-top: 18px; padding: 5px 14px 5px 5px; border-radius: 99px;
  background: rgba(0,0,0,.25); border: 1px solid rgba(232,207,138,.18); font: 400 12px/1 ${DISPLAY}; letter-spacing: .14em; text-transform: uppercase; color: #E8CF8A; }
.nm-gateWax { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; font-size: 12px; color: #f6e2a6;
  background: radial-gradient(circle at 38% 32%, #b0423b, #7a2422 50%, #4a1213); box-shadow: inset 0 -2px 3px rgba(0,0,0,.35); }
@keyframes nm-breath { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
@media (max-height: 640px) { .nm-gateArt { height: 140px; } .nm-gateSeal { margin-top: 8px; } }
@media (prefers-reduced-motion: reduce) { .nm-gateGlow, .nm-tuning.is-on { animation: none; } .nm-gate.is-opening { transform: none; } }
`;
