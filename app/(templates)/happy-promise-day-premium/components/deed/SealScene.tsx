"use client";

// Chapter VII · Sealed: the money moment.
//   1. the deed's last page, both signatures side by side;
//   2. it folds in three and slides into its envelope (paper, paper);
//   3. they press and hold the brass seal: warm wax pours onto the flap;
//   4. on release of the hold → drop(): the riser lifts the brass stamp over
//      the wax; at the song's drop it presses down, the wax blooms and the
//      monogram is debossed into it (impact + deboss), the lamp flares;
//   5. the notary's red stamp lands: SIGNED · SEALED · PROMISED · today.

import { useEffect, useRef, useState } from "react";
import { haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, sfx, useSongDrop, type CueHandle } from "../../../_valentine/kit/premium";
import { InkSignature, NotaryStamp, WaxSeal } from "./art";
import { Envelope } from "./Gate";
import { stampDate, today, type Deed } from "./model";
import type { SignResult } from "./SignScene";
import { CTA_STYLE, Eyebrow, Letterhead, Scene } from "./ui";

type Phase = "doc" | "fold" | "ready" | "press" | "sealed" | "stamped";

export default function SealScene({ d, sig, onPeak, onNext }: { d: Deed; sig: SignResult | null; onPeak: () => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { drop } = useSongDrop();
  const [phase, setPhase] = useState<Phase>("doc");
  const pour = useRef<CueHandle | null>(null);
  const timers = useRef<number[]>([]);
  const later = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, reduce ? Math.min(ms, 250) : ms));
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  // 1 → 2 → 3: show both signatures, then fold the deed into its envelope.
  useEffect(() => {
    later(2100, () => {
      setPhase("fold");
      sfx("paper-rustle", { gain: 0.8 });
      later(420, () => sfx("sp-unfold", { gain: 0.7, detune: -300 }));
      later(1500, () => {
        setPhase("ready");
        sfx("swoosh-soft", { gain: 0.5 });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hold = useHoldProgress({
    duration: 1700,
    disabled: phase !== "ready",
    onComplete: () => {
      pour.current?.stop(200);
      setPhase("press");
      haptic(20);
      drop(() => {
        // THE moment: on the song's drop.
        setPhase("sealed");
        sfx("sp-deboss", { gain: 1 });
        haptic([30, 50, 20]);
        onPeak();
        later(1100, () => {
          setPhase("stamped");
          sfx("sp-stamp", { gain: 1 });
          haptic(18);
        });
      });
    },
  });

  // The pour plays while they hold; letting go stops it.
  useEffect(() => {
    if (phase !== "ready") return;
    if (hold.holding) pour.current = sfx("sp-pour", { gain: 0.9 });
    else pour.current?.stop(180);
  }, [hold.holding, phase]);

  const showDoc = phase === "doc" || phase === "fold";
  const sealedish = phase === "sealed" || phase === "stamped";
  const wax = phase === "ready" ? hold.progress : 1;

  return (
    <Scene label="Seal the deed" className={`sp-se is-${phase}`}>
      <Eyebrow>{showDoc ? "Both parties have signed" : sealedish ? `Sealed · ${today()}` : "Seal it"}</Eyebrow>
      <div className="sp-seStage">
        {showDoc && (
          <div className={`sp-seDoc${phase === "fold" ? " is-folding" : ""}`}>
            <div className="sp-seT sp-paper">
              <Letterhead sender={d.sender} recipient={d.recipient} compact />
            </div>
            <div className="sp-seM sp-paper">
              <div className="sp-seSigs">
                <div>
                  <InkSignature text={d.sender} play={false} />
                  <span>{d.sender}</span>
                </div>
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL drawn on this page */}
                  {sig?.png ? <img src={sig.png} alt={`${d.recipient}'s signature`} /> : <InkSignature text={d.recipient} play={false} />}
                  <span>{d.recipient}</span>
                </div>
              </div>
            </div>
            <div className="sp-seB sp-paper">
              <p className="sp-seBtx sp-typed">
                {d.promises.length} clauses · in force from {today()}
              </p>
            </div>
          </div>
        )}
        {!showDoc && (
          <div className="sp-seEnv">
            <Envelope d={d} sealed={false} />
            <div className="sp-seWax" style={{ ["--wax" as string]: wax.toFixed(3) }}>
              {sealedish ? <WaxSeal W={d.W} mono={d.monogram} size="100%" className="sp-seWaxSeal" /> : <WaxSeal W={d.W} mono={d.monogram} size="100%" pressed={false} />}
            </div>
            {(phase === "press" || phase === "sealed") && (
              <div className={`sp-seBrass${phase === "sealed" ? " is-lift" : ""}`} aria-hidden>
                <span className="sp-brassHandle" />
                <span className="sp-brassFace" />
              </div>
            )}
            {phase === "stamped" && <NotaryStamp date={stampDate()} size="42%" className="sp-seNotary" />}
            {sealedish && <span className="sp-seFlare" aria-hidden />}
          </div>
        )}
      </div>

      <div className="sp-seCopy">
        {phase === "doc" && <h2 className="sp-h sp-seH sp-rise">Two signatures. <em>One promise.</em></h2>}
        {phase === "stamped" && <h2 className="sp-h sp-seH sp-rise">Signed, sealed, <em>promised.</em></h2>}
      </div>

      <div className="sp-foot">
        {phase === "ready" && (
          <>
            <button type="button" className="sp-seal" {...hold.bind} aria-label="Press and hold to seal the envelope with wax">
              <svg viewBox="0 0 120 120" className="sp-sealRing" aria-hidden>
                <circle cx="60" cy="60" r="56" className="sp-sealTrack" />
                <circle cx="60" cy="60" r="56" className="sp-sealFill" style={{ strokeDashoffset: 352 * (1 - hold.progress) }} />
              </svg>
              <span className="sp-sealFace">
                <span className="sp-sealMono">{d.monogram}</span>
              </span>
            </button>
            <p className="sp-seHint">{hold.holding ? "Pouring the wax…" : "Press and hold the seal"}</p>
          </>
        )}
        {phase === "stamped" && (
          <PremiumCTA style={CTA_STYLE} tone="pearl" cue="chime" onClick={onNext}>
            Keep the deed
          </PremiumCTA>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.sp-se .sp-in { gap: 14px; justify-content: center; }
.sp-se .sp-foot { margin-top: 6px; padding-top: 0; min-height: 150px; align-content: start; }
.sp-se .sp-eyebrow { margin-bottom: 4px; }
.sp-seStage { position: relative; width: min(360px, calc(100vw - 48px)); aspect-ratio: 3 / 2.25; display: grid; place-items: center; margin-top: 14px; }
@media (min-width: 1024px) { .sp-seStage { width: 480px; } }
/* 1–2: the last page, both signatures; then it folds in three */
.sp-seDoc { position: relative; width: 100%; aspect-ratio: 3 / 2; perspective: 1400px; transform-style: preserve-3d; transition: transform 1s cubic-bezier(.65,0,.35,1) .9s, opacity .4s ease 1.25s; }
.sp-seDoc > div { position: absolute; left: 0; right: 0; height: 33.4%; backface-visibility: hidden; }
.sp-seT, .sp-seB { display: grid; place-items: center; }
.sp-seT .sp-lhNo { font-size: 7.5px; }
.sp-seT .sp-lhTitle { font-size: 17px; }
.sp-seT .sp-rule { width: 50%; }
.sp-seBtx { margin: 0; font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; opacity: .65; }
.sp-seT { top: 0; transform-origin: 50% 100%; transition: transform .6s cubic-bezier(.65,0,.35,1) .35s; }
.sp-seM { top: 33.3%; display: grid; place-items: center; z-index: 1; }
.sp-seB { bottom: 0; transform-origin: 50% 0; transition: transform .6s cubic-bezier(.65,0,.35,1); }
.sp-seDoc.is-folding .sp-seB { transform: rotateX(178deg); }
.sp-seDoc.is-folding .sp-seT { transform: translateZ(2px) rotateX(-178deg); }
.sp-seDoc.is-folding { transform: translateY(18%) scale(.8); opacity: 0; }
.sp-seSigs { width: 92%; display: grid; grid-template-columns: 1fr 1fr; gap: 6%; align-items: end; }
.sp-seSigs > div { display: grid; border-bottom: 1px solid rgba(28,37,65,.45); }
.sp-seSigs img, .sp-seSigs .sp-sig { width: 100%; height: auto; aspect-ratio: 2.4; object-fit: contain; display: block; }
.sp-seSigs span { position: absolute; transform: translateY(calc(100% + 4px)); font: 700 8px/1 var(--sp-type); letter-spacing: .2em; text-transform: uppercase; color: rgba(28,37,65,.55); }
.sp-seSigs > div { position: relative; }
.sp-seDoc .sp-seT, .sp-seDoc .sp-seB { box-shadow: none; }
.sp-seDoc .sp-seM { box-shadow: 0 40px 70px -30px rgba(0,0,0,.95); }
.sp-seDoc:not(.is-folding) { animation: sp-docIn .9s var(--sp-ease) both; }
@keyframes sp-docIn { from { opacity: 0; transform: translateY(20px) scale(.97); } to { opacity: 1; transform: none; } }
/* 3–5: the envelope, the wax, the brass, the notary */
.sp-seEnv { position: relative; width: 100%; animation: sp-envIn .8s var(--sp-ease) both; }
.sp-seEnv .sp-env { transform: rotate(-2deg); }
@keyframes sp-envIn { from { opacity: 0; transform: translateY(24px) scale(.94); } to { opacity: 1; transform: none; } }
.sp-seWax { position: absolute; left: 50%; top: 62.5%; width: 36%; aspect-ratio: 1; transform: translate(-50%, -50%) scale(calc(.2 + var(--wax) * .72)); opacity: calc(var(--wax) * 4);
  filter: drop-shadow(0 8px 10px rgba(30,5,5,.5)); transition: transform .12s linear; }
.sp-seWax > svg { width: 100%; height: 100%; display: block; }
.sp-se.is-press .sp-seWax { transform: translate(-50%, -50%) scale(.92); transition: transform .3s ease; }
.sp-se.is-sealed .sp-seWax, .sp-se.is-stamped .sp-seWax { transform: translate(-50%, -50%) scale(1); animation: sp-bloom .9s cubic-bezier(.2,1.5,.4,1) both; }
@keyframes sp-bloom { 0% { transform: translate(-50%, -50%) scale(.82); } 45% { transform: translate(-50%, -50%) scale(1.12); } 100% { transform: translate(-50%, -50%) scale(1); } }
.sp-seWaxSeal text { animation: sp-deboss .7s ease .05s both; }
@keyframes sp-deboss { from { opacity: 0; } to { opacity: 1; } }
.sp-seBrass { position: absolute; left: 50%; top: 62.5%; width: 30%; aspect-ratio: 1; transform: translate(-50%, -50%); pointer-events: none; animation: sp-brassDown 1.1s cubic-bezier(.6,0,.4,1) both; z-index: 3; }
.sp-seBrass.is-lift { animation: sp-brassUp .7s cubic-bezier(.4,0,.2,1) .12s both; }
@keyframes sp-brassUp { from { transform: translate(-50%, -62%); opacity: 1; } to { transform: translate(-50%, -200%) scale(1.2); opacity: 0; } }
@keyframes sp-brassDown { 0% { transform: translate(-50%, -190%) scale(1.25); opacity: 0; } 25% { opacity: 1; } 80% { transform: translate(-50%, -105%) scale(1.08); } 100% { transform: translate(-50%, -62%) scale(1); } }
.sp-brassHandle { position: absolute; left: 34%; right: 34%; bottom: 60%; height: 120%; border-radius: 40% 40% 12px 12px;
  background: linear-gradient(90deg, #2a170d, #6b3f22 35%, #8a5631 50%, #4a2a16 75%, #1d0f08); box-shadow: 0 10px 20px -8px rgba(0,0,0,.8); }
.sp-brassFace { position: absolute; left: 10%; right: 10%; bottom: 0; height: 64%; border-radius: 50%;
  background: radial-gradient(circle at 38% 30%, #fff3c8, #d8b25a 34%, #9a7020 70%, #5a3f0e); box-shadow: 0 18px 24px -10px rgba(0,0,0,.85), inset 0 -4px 8px rgba(0,0,0,.35); }
.sp-seNotary { position: absolute; right: -2%; top: -12%; transform: rotate(-14deg); mix-blend-mode: multiply; animation: sp-notary .35s cubic-bezier(.2,1.6,.4,1) both; }
@keyframes sp-notary { from { transform: rotate(-24deg) scale(1.7); opacity: 0; } to { transform: rotate(-14deg) scale(1); opacity: .92; } }
.sp-seFlare { position: absolute; left: 50%; top: 62.5%; width: 220%; aspect-ratio: 1; transform: translate(-50%, -50%); pointer-events: none; z-index: -1;
  background: radial-gradient(closest-side, rgba(255,214,150,.5), rgba(255,180,90,.12) 50%, transparent 72%); animation: sp-flare 2.4s ease-out both; }
@keyframes sp-flare { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.4); } 18% { opacity: 1; } 100% { opacity: .35; transform: translate(-50%, -50%) scale(1); } }
.sp-seCopy { min-height: clamp(84px, 20vw, 140px); display: grid; place-items: center; }
.sp-seH { font-size: clamp(34px, 9.6vw, 64px); max-width: 13ch; }
/* the brass seal they hold */
.sp-seal { all: unset; cursor: pointer; position: relative; width: 112px; height: 112px; display: grid; place-items: center; touch-action: none; -webkit-touch-callout: none; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
.sp-seal:focus-visible { outline: 3px solid var(--sp-gold); outline-offset: 6px; border-radius: 50%; }
.sp-sealRing { position: absolute; inset: 0; transform: rotate(-90deg); }
.sp-sealTrack { fill: none; stroke: rgba(245,239,226,.14); stroke-width: 3; }
.sp-sealFill { fill: none; stroke: #E9C77A; stroke-width: 3.5; stroke-linecap: round; stroke-dasharray: 352; filter: drop-shadow(0 0 6px rgba(233,199,122,.7)); }
.sp-sealFace { width: 84px; height: 84px; border-radius: 50%; display: grid; place-items: center; transition: transform .15s ease;
  background: radial-gradient(circle at 36% 28%, #fff3c8 0%, #e2bd66 30%, #a87b26 66%, #5a3f0e 100%);
  box-shadow: 0 16px 26px -10px rgba(0,0,0,.9), inset 0 2px 1px rgba(255,255,255,.5), inset 0 -5px 10px rgba(60,35,5,.55); }
.sp-seal:active .sp-sealFace { transform: scale(.95); }
.sp-sealMono { transform: scaleX(-1); font: italic 500 26px/1 var(--sp-serif); color: #6b4a12; text-shadow: 0 1px 0 rgba(255,240,200,.6), 0 -1px 0 rgba(60,35,5,.5); }
.sp-seHint { margin: 2px 0 0; font: 700 11px/1 var(--sp-type); letter-spacing: .26em; text-transform: uppercase; color: rgba(245,239,226,.72); }
@media (prefers-reduced-motion: reduce) {
  .sp-seDoc, .sp-seT, .sp-seB { transition: opacity .25s ease; }
  .sp-seBrass, .sp-seWax, .sp-seNotary, .sp-seFlare, .sp-seEnv { animation: sp-fade .3s ease both !important; }
  .sp-seBrass.is-lift { display: none; }
}
`;
