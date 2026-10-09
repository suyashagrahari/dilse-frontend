"use client";

// Chapters I + II, one continuous shot (the same box closes chapter I and opens chapter II):
//
//   I   La boîte: "{openingLine}" over the closed box. Drag the lid up (or tap it, or the button): it follows the
//       finger, golden light leaks out of the gap, a felt "thwoop" (lb-lid) as it lets go of the tray.
//   ↓   drop(): the riser plays while the lid hovers and trembles under letterbox bars; at its peak the song lands on
//       the chorus, the lid flies off, the tissue folds open (paper-rustle) and a foil sheen runs across every
//       bonbon, each one topped with one of their photos (THE money moment). The sheen then follows the tilt.
//   II  The tasting: "{boxLine}". Tap a piece: it lifts out of its cup (the lightbox lives in the root) and turns
//       over to its tasting note. After a first taste: "The last piece".

import { useEffect, useRef, useState, type PointerEvent as RPE, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { Box, type BoxPhase } from "./Box";
import type { Boite } from "./util";

export function BoxScene({
  b,
  tasted,
  out,
  onRising,
  onOpen,
  onPick,
  onNext,
  sticker,
}: {
  b: Boite;
  tasted: ReadonlySet<number>;
  out: number | null;
  onRising: () => void;
  onOpen: () => void;
  onPick: (i: number) => void;
  onNext: () => void;
  sticker: ReactNode;
}) {
  const { sfx } = usePremium();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<BoxPhase>("closed");
  const [lift, setLift] = useState(0);
  const [beat, setBeat] = useState(0); // 0 closed · 1 the line over the open box · 2 hint/CTA
  const cb = useRef({ onRising, onOpen });
  useEffect(() => {
    cb.current = { onRising, onOpen };
  });
  const drag = useRef<{ y: number; id: number; moved: boolean; last: number } | null>(null);

  const commit = () => {
    if (phase !== "closed") return;
    setLift(1);
    setPhase("rising");
    cb.current.onRising();
    sfx("lb-lid", { gain: 0.9 });
    haptic([10, 40, 18]);
    drop(() => {
      setPhase("open");
      cb.current.onOpen();
      sfx("paper-rustle", { gain: 0.8, at: 0.12 });
      sfx("sparkle", { at: 0.9, gain: 0.5 });
      haptic([14, 30, 14]);
    });
  };

  // Drag the lid up: it follows the finger; let go past ~55 % (or a plain tap) and it comes off.
  const bind =
    phase === "closed"
      ? {
          onPointerDown: (e: RPE) => {
            drag.current = { y: e.clientY, id: e.pointerId, moved: false, last: 0 };
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          },
          onPointerMove: (e: RPE) => {
            const d = drag.current;
            if (!d || d.id !== e.pointerId) return;
            const p = Math.max(0, Math.min(1, (d.y - e.clientY) / 150));
            if (Math.abs(d.y - e.clientY) > 6) d.moved = true;
            if (p - d.last > 0.18) {
              sfx("paper-rustle", { gain: 0.25 });
              d.last = p;
            }
            setLift(p);
            if (p >= 1) {
              drag.current = null;
              commit();
            }
          },
          onPointerUp: (e: RPE) => {
            const d = drag.current;
            drag.current = null;
            if (!d || d.id !== e.pointerId) return;
            if (!d.moved || lift > 0.55) commit();
            else setLift(0);
          },
          onPointerCancel: () => {
            drag.current = null;
            setLift(0);
          },
        }
      : undefined;

  useEffect(() => {
    if (phase !== "open") return;
    const a = window.setTimeout(() => setBeat(1), reduce ? 300 : 2200);
    const c = window.setTimeout(() => setBeat(2), reduce ? 600 : 4200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(c);
    };
  }, [phase, reduce]);

  const n = b.pieces.length;
  return (
    <section className={`lb-scene lb-boxScene is-${phase}`} aria-label={phase === "open" ? "The tasting" : "The box"}>
      <header className="lb-head">
        {phase !== "open" ? (
          <div key="closed" className="lb-headIn">
            <p className="lb-eyebrow">I · La boîte</p>
            <RevealText as="h2" text={b.opening} className="lb-display" delay={0.5} />
          </div>
        ) : (
          beat >= 1 && (
            <div key="open" className="lb-headIn">
              <p className="lb-eyebrow lb-fadeIn">II · The tasting</p>
              <RevealText as="h2" text={b.boxLine} className="lb-display" delay={0.15} />
            </div>
          )
        )}
      </header>

      <div className="lb-stageBox">
        {phase === "open" && <i className="lb-burst" aria-hidden />}
        <Box b={b} phase={phase} lift={lift} tasted={tasted} out={out} onPick={onPick} bind={bind} />
      </div>

      <footer className="lb-foot">
        {phase === "closed" && (
          <button type="button" className="lb-liftBtn" onClick={commit} aria-label="Lift the lid">
            <i aria-hidden />
            <span>Lift the lid</span>
          </button>
        )}
        {phase === "open" && beat >= 2 && (
          <div className="lb-tasteFoot lb-rise">
            {tasted.size === 0 ? (
              <p className="lb-hint">Tap a piece to taste it</p>
            ) : (
              <>
                <p className="lb-count">
                  {tasted.size} <span>of {n} tasted</span>
                </p>
                <div className="lb-ctaRow">
                  <PremiumCTA tone="gold" cue="page-turn" onClick={onNext}>
                    The last piece
                  </PremiumCTA>
                  {sticker}
                </div>
              </>
            )}
          </div>
        )}
      </footer>
    </section>
  );
}
