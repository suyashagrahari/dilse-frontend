"use client";

// Chapter VI · The adoption, and THE money moment.
//
//   sign   The certificate, typeset with their names. They sign the line with a finger (fountain-pen ink, a soft
//          nib-scratch per stroke; visual twin: the ink). "Use my name instead" signs it in the serif for them.
//   seal   Hold the seal: the empty seal spot glows as a ring fills (heartbeat ticks from useHoldProgress haptics,
//          sfx heartbeat on each quarter; visual twin: the glow).
//   ↓      drop(): riser under letterbox bars while the page lifts toward them; at the peak the song lands on the
//          chorus, the gold seal embosses with a thump (impact-boom + knock), then the red ADOPTED ♥ stamp slams down
//          (knock + snap), hearts drift up (sparkle). "Officially yours."

import { useEffect, useRef, useState } from "react";
import { haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { Certificate } from "./Certificate";
import { SignaturePad, type SignatureHandle } from "./SignaturePad";
import type { Papers } from "./util";

type Phase = "sign" | "seal" | "rising" | "sealed" | "stamped";

export function AdoptScene({
  p,
  n,
  onSigned,
  onRising,
  onAdopted,
  onNext,
}: {
  p: Papers;
  n: string;
  onSigned: (ink: { png: string; aspect: number } | null) => void;
  onRising: () => void;
  onAdopted: () => void;
  onNext: () => void;
}) {
  const { sfx } = usePremium();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const pad = useRef<SignatureHandle>(null);
  const [inked, setInked] = useState(false);
  const [phase, setPhase] = useState<Phase>("sign");
  const lastScratch = useRef(0);
  const cb = useRef({ onRising, onAdopted });
  useEffect(() => {
    cb.current = { onRising, onAdopted };
  });

  const hold = useHoldProgress({
    duration: 2200,
    disabled: phase !== "seal",
    onComplete: () => {
      setPhase("rising");
      cb.current.onRising();
      haptic([10, 40, 18]);
      drop(() => {
        setPhase("sealed");
        sfx("knock", { gain: 0.9, detune: -500 });
        haptic([30, 30, 20]);
        window.setTimeout(
          () => {
            setPhase("stamped");
            sfx("knock", { gain: 1, detune: -200 });
            sfx("snap", { at: 0.02, gain: 0.5 });
            sfx("sparkle", { at: 0.5, gain: 0.5 });
            haptic([40]);
            cb.current.onAdopted();
          },
          reduce ? 200 : 900,
        );
      });
    },
  });

  // A heartbeat on each quarter of the hold (the seal spot's glow pulses with it).
  const q = Math.floor(hold.progress * 4);
  const lastQ = useRef(0);
  useEffect(() => {
    if (phase !== "seal" || !hold.holding || q === lastQ.current || q >= 4) {
      lastQ.current = q;
      return;
    }
    lastQ.current = q;
    sfx("heartbeat", { gain: 0.45 + q * 0.12 });
  }, [q, hold.holding, phase, sfx]);

  const doneSigning = () => {
    const png = pad.current?.toDataURL() ?? null;
    onSigned(png ? { png, aspect: pad.current?.aspect() ?? 3.4 } : null);
    setPhase("seal");
    sfx("chime", { gain: 0.45 });
  };
  const signWithName = () => {
    pad.current?.signName(p.to);
    sfx("nib-scratch", { gain: 0.5 });
  };

  const sealState = phase === "sealed" || phase === "stamped" ? "sealed" : phase === "seal" && hold.progress > 0 ? "pressing" : "empty";
  const title = phase === "sign" ? `Sign here, ${p.to}.` : phase === "stamped" ? "Officially yours." : "Now make it official.";

  return (
    <section className={`ap-scene ap-adopt is-${phase}`} aria-label="The adoption papers">
      <header className="ap-head ap-headTight">
        <p className="ap-eyebrow">{n} · The adoption</p>
        <RevealText key={title} as="h2" text={title} className="ap-display ap-displaySm" delay={0.15} />
      </header>

      <div className={`ap-certStage${phase === "rising" && !reduce ? " is-rising" : ""}`}>
        <Certificate
          p={p}
          seal={sealState}
          stamped={phase === "stamped"}
          holdProgress={hold.progress}
          signature={
            <SignaturePad
              ref={pad}
              label={`Signature line for ${p.to}`}
              disabled={phase !== "sign"}
              onInk={setInked}
              onStroke={() => {
                const now = performance.now();
                if (now - lastScratch.current > 500) {
                  lastScratch.current = now;
                  sfx("nib-scratch", { gain: 0.32 });
                }
              }}
            />
          }
          className={phase === "sign" ? "is-signing" : undefined}
        />
      </div>

      <footer className="ap-foot ap-footAdopt">
        {phase === "sign" && (
          <>
            <PremiumCTA tone="gold" cue="tick" onClick={doneSigning} disabled={!inked}>
              {inked ? "Signed" : "Sign on the line"}
            </PremiumCTA>
            <div className="ap-sigTools">
              {inked ? (
                <button type="button" className="ap-textBtn" onClick={() => pad.current?.clear()}>
                  Start again
                </button>
              ) : (
                <button type="button" className="ap-textBtn" onClick={signWithName}>
                  Sign it with my name instead
                </button>
              )}
            </div>
          </>
        )}
        {phase === "seal" && (
          <button type="button" className={`ap-press${hold.holding ? " is-holding" : ""}`} {...hold.bind} aria-label="Press and hold to emboss the seal">
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
              <circle cx="32" cy="32" r="28" className="ap-pressTrack" />
              <circle cx="32" cy="32" r="28" className="ap-pressFill" strokeDasharray={`${hold.progress * 176} 176`} />
              <circle cx="32" cy="32" r="9" className="ap-pressDot" />
            </svg>
            <span>Hold to press the seal</span>
          </button>
        )}
        {phase === "stamped" && (
          <div className="ap-adopted">
            <p className="ap-sub">{p.teddy} has a home.</p>
            <PremiumCTA tone="gold" cue="chime" onClick={onNext}>
              Take him home
            </PremiumCTA>
          </div>
        )}
      </footer>
    </section>
  );
}
