"use client";

// ─── SCREEN 2 — the sealing ──────────────────────────────────────────────────
//
// One shot, and it only ever happens once per capsule. Three beats:
//
//   1. the written slips fold down into a capsule            (TIMING.foldMs)
//   2. the wax presses onto it — THUNK, and the page jolts   (TIMING.sealPressMs)
//   3. `COPY.sealedUntil(...)` appears
//
// Under `prefers-reduced-motion` the same three beats still run; the keyframes
// collapse to nothing and the timings shorten, but nobody gets a jump-cut from
// "writing" to "sealed" with no ceremony at all.

import { useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { COPY, MONO, PALETTE, SERIF, TIMING } from "./types";
import { PaperTexture, paperFill, wornEdgeStyle } from "./paper";
import CapsuleObject from "./CapsuleObject";
import { useStepTimer } from "./useTick";
import { seededSpread } from "@/lib/seededRandom";
import { sfxThunk, sfxPaperSlide, unlockAudio } from "@/lib/webAudio";

type Beat = "fold" | "press" | "settled";

export default function SealCeremony({
  seed,
  slipCount,
  initials,
  sealDateLabel,
  onDone,
}: {
  seed: string;
  /** How many slips fold in. Capped so the animation stays legible. */
  slipCount: number;
  initials: string;
  sealDateLabel: string;
  onDone: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const [beat, setBeat] = useState<Beat>("fold");
  const [jolt, setJolt] = useState(false);

  const foldMs = reduce ? 120 : TIMING.foldMs;
  const pressMs = reduce ? 120 : TIMING.sealPressMs;

  const toPress = useCallback(() => {
    unlockAudio();
    // The impact. Heavy, dull, hard attack — and the 3px page jolt lands with
    // it, because a sound with no movement reads as a glitch.
    sfxThunk();
    setJolt(true);
    setBeat("press");
  }, []);

  const toSettled = useCallback(() => {
    setJolt(false);
    setBeat("settled");
  }, []);

  useStepTimer(beat === "fold" ? "fold" : null, foldMs, toPress);
  useStepTimer(beat === "press" ? "press" : null, pressMs, toSettled);
  // Hold the sealed line for a beat before handing back, so the sentence is
  // read rather than glimpsed.
  useStepTimer(beat === "settled" ? "settled" : null, reduce ? 700 : 1600, onDone);

  const slips = Math.min(Math.max(slipCount, 1), 10);

  return (
    <div
      className={`fixed inset-0 z-[260] grid place-items-center ${jolt && !reduce ? "capsule-jolt" : ""}`}
      style={{ ...paperFill(`${seed}-seal`) }}
      role="status"
      aria-live="polite"
    >
      <PaperTexture seed={`${seed}-ceremony`} opacity={0.06} />

      <div className="relative flex flex-col items-center" style={{ width: 300 }}>
        {beat === "fold" ? (
          <div className="relative grid place-items-center" style={{ height: 312 }}>
            {Array.from({ length: slips }, (_, i) => {
              const dx = seededSpread(`${seed}-slip`, `x-${i}`, 26);
              const rot = seededSpread(`${seed}-slip`, `r-${i}`, 7);
              return (
                <div
                  key={i}
                  className={reduce ? undefined : "capsule-fold"}
                  style={{
                    position: "absolute",
                    top: 24 + i * 22,
                    width: 208,
                    height: 30,
                    transform: `translateX(${dx.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`,
                    animationDelay: reduce ? undefined : `${i * 42}ms`,
                    background: PALETTE.paper,
                    border: `1px solid ${PALETTE.edge}`,
                    ...wornEdgeStyle(`${seed}-slip-${i}`),
                    opacity: reduce ? 0 : 1,
                  }}
                  onAnimationStart={i === 0 ? () => { unlockAudio(); sfxPaperSlide(); } : undefined}
                />
              );
            })}
          </div>
        ) : (
          <CapsuleObject
            seed={`obj-${seed}`}
            wear="fresh"
            initials={initials}
            pressing={beat === "press"}
            reduced={reduce}
          />
        )}

        <div className="mt-8 h-14 text-center">
          {beat === "settled" && (
            <p className="capsule-card-in">
              <span style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink }}>{COPY.sealedUntil(sealDateLabel)}</span>
              <br />
              <span style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft, letterSpacing: 1 }}>
                {COPY.amendOpen}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
