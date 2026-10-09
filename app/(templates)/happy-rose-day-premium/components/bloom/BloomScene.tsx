"use client";

// Chapters I + II: the bud, then the bloom (the money moment). One continuous shot: the same rose that sits closed
// in chapter I is the one that opens, so there is no cut between them.
//
//   I   The bud: "{openingLine}". Hold it to warm it: it loosens and glows, a heartbeat quickens (sfx heartbeat,
//       visual twin: the glow pulses with each beat). 2.6 s of holding, or five taps, or Space/Enter.
//   ↓   drop(): the riser plays while the bud trembles under letterbox bars; at its peak the song lands on the
//       chorus and the rose opens ring by ring (a swoosh per ring), the camera tilts down over it and slowly pulls
//       back, petals start to fall. Every petal is one of their photos.
//   II  The bloom: "{bloomLine}". Tap a petal: its photo lifts out (the lightbox lives in the root). Then the
//       colour's meaning + their reason, and "Turn the pages".

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useHoldProgress, useReducedMotion, haptic } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { PhotoRose, type RosePhase } from "./PhotoRose";
import { COLOR_MEANING, SHADES, type Bloom } from "./util";

export function BloomScene({
  b,
  onRising,
  onOpen,
  onPick,
  onNext,
  sticker,
}: {
  b: Bloom;
  onRising: () => void;
  onOpen: () => void;
  onPick: (photoIndex: number) => void;
  onNext: () => void;
  sticker: ReactNode;
}) {
  const { sfx } = usePremium();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<RosePhase>("bud");
  const [beat, setBeat] = useState(0); // 0 bud · 1 open (line) · 2 meaning + CTA
  const [pulse, setPulse] = useState(0);
  const cb = useRef({ onRising, onOpen });
  useEffect(() => {
    cb.current = { onRising, onOpen };
  });

  const hold = useHoldProgress({
    duration: 2600,
    onComplete: () => {
      setPhase("rising");
      cb.current.onRising();
      haptic([10, 40, 18]);
      drop(() => {
        setPhase("open");
        cb.current.onOpen();
        [0, 0.32, 0.62].forEach((at, i) => sfx("swoosh-soft", { at: at + 0.05, gain: 0.55 - i * 0.1, pan: i === 1 ? -0.3 : i === 2 ? 0.3 : 0 }));
        sfx("sparkle", { at: 1.4, gain: 0.5 });
      });
    },
  });

  // The heartbeat while they hold: faster as it warms. Each beat pulses the glow.
  const holding = hold.holding && phase === "bud";
  const prog = useRef(0);
  useEffect(() => {
    prog.current = hold.progress;
  });
  useEffect(() => {
    if (!holding) return;
    let t = 0;
    const beatOnce = () => {
      sfx("heartbeat", { gain: 0.5 + prog.current * 0.4 });
      setPulse((n) => n + 1);
      t = window.setTimeout(beatOnce, 760 - prog.current * 330);
    };
    beatOnce();
    return () => window.clearTimeout(t);
  }, [holding, sfx]);

  useEffect(() => {
    if (phase !== "open") return;
    const a = window.setTimeout(() => setBeat(1), reduce ? 300 : 2600);
    const c = window.setTimeout(() => setBeat(2), reduce ? 600 : 6200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(c);
    };
  }, [phase, reduce]);

  const meaning = COLOR_MEANING[b.color];
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <section className={`rb-scene rb-bloom is-${phase}`} aria-label={phase === "open" ? "The bloom" : "The bud"}>
      <header className="rb-head">
        {phase !== "open" ? (
          <div key="bud" className="rb-headIn">
            <p className="rb-eyebrow">I · The bud</p>
            <RevealText as="h2" text={b.opening} className="rb-display" delay={0.5} />
          </div>
        ) : (
          beat >= 1 && (
            <div key="open" className="rb-headIn">
              <p className="rb-eyebrow rb-fadeIn">II · The bloom</p>
              <RevealText as="h2" text={b.bloomLine} className="rb-display" delay={0.2} />
            </div>
          )
        )}
      </header>

      <div className="rb-roseBox" {...(phase === "bud" ? hold.bind : {})} aria-hidden={phase === "bud" ? undefined : true}>
        <PhotoRose
          photos={b.photos}
          color={b.color}
          phase={phase}
          warm={phase === "bud" ? hold.progress : 1}
          onPick={(i) => {
            sfx("glass-ping", { gain: 0.6 });
            onPick(i);
          }}
          still={reduce}
        />
        <span key={pulse} className={`rb-beat${pulse ? " is-on" : ""}`} style={{ ["--glow" as string]: SHADES[b.color].glow }} aria-hidden />
      </div>

      <footer className="rb-foot">
        {phase === "bud" && (
          <button type="button" className={`rb-hold${hold.holding ? " is-holding" : ""}`} {...hold.bind} aria-label="Press and hold to warm the bud open">
            <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden>
              <circle cx="32" cy="32" r={R} className="rb-holdTrack" />
              <circle cx="32" cy="32" r={R} className="rb-holdFill" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - hold.progress) }} />
              <circle cx="32" cy="32" r={6 + hold.progress * 6} className="rb-holdDot" />
            </svg>
            <span>Hold to warm it</span>
          </button>
        )}
        {phase === "open" && beat >= 2 && (
          <div className="rb-meaning">
            <p className="rb-eyebrow">{SHADES[b.color].name}</p>
            <p className="rb-meaningLine">{b.colorReason || meaning}</p>
            {b.colorReason && <p className="rb-meaningSub">{meaning}</p>}
            <div className="rb-ctaRow">
              <PremiumCTA tone="gold" cue="page-turn" onClick={onNext}>Turn the pages</PremiumCTA>
              {sticker}
            </div>
          </div>
        )}
        {phase === "open" && beat === 1 && <p className="rb-hint rb-fadeIn">Tap a petal</p>}
      </footer>
    </section>
  );
}
