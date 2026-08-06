// ─── The two rings, and the moment they meet ─────────────────────────────────
//
// The rings ARE the status display. Hollow means that person has not checked in
// today; filled means they have. There is deliberately no text — "waiting for
// Rohan" would turn a neutral fact into a prod, and a prod is the failure mode
// for this whole template.
//
// THE SIMULTANEOUS MOMENT lives here. It is slow on purpose: 900ms of drift is
// long enough to read as two people arriving in the same place, where 200ms
// would read as a notification landing.

"use client";

import { useEffect, useMemo } from "react";
import { PALETTE, SERIF, TIMING, type Side, type StreakData } from "./types";
import type { MomentPhase, MomentState } from "./streakStore";

const AVATAR = 74;
const GAP = 30;
/** Enough inward travel that the two rings genuinely overlap, not just touch. */
const DRIFT = GAP / 2 + 15;

export interface AvatarRingsProps {
  pair: StreakData["pair"];
  me: Side;
  mineIn: boolean;
  theirsIn: boolean;
  moment: MomentState | null;
  reduced: boolean;
  onAdvance: (phase: MomentPhase) => void;
}

function initialOf(name: string): string {
  const ch = [...name.trim()][0];
  return ch ? ch.toUpperCase() : "·";
}

function Avatar({ person, filled }: { person: { name: string; photoUrl: string }; filled: boolean }) {
  return (
    <span
      className="grid place-items-center rounded-full overflow-hidden"
      aria-label={`${person.name} — ${filled ? "checked in today" : "not checked in yet today"}`}
      role="img"
      style={{
        width: AVATAR,
        height: AVATAR,
        // Hollow: a hairline. Filled: the one warm accent, at weight.
        border: filled ? `2.5px solid ${PALETTE.accent}` : `1.5px solid ${PALETTE.edge}`,
        background: filled ? PALETTE.accentWash : PALETTE.paper,
        transition: "border-color 500ms ease, background-color 500ms ease",
      }}
    >
      {person.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.photoUrl}
          alt=""
          width={AVATAR}
          height={AVATAR}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ fontFamily: SERIF, fontSize: 28, color: filled ? PALETTE.accent : PALETTE.inkFaint }}>
          {initialOf(person.name)}
        </span>
      )}
    </span>
  );
}

export default function AvatarRings({
  pair,
  me,
  mineIn,
  theirsIn,
  moment,
  reduced,
  onAdvance,
}: AvatarRingsProps) {
  const phase: MomentPhase | null = moment?.phase ?? null;
  // Overlapped through the drift and the bloom, then released back to rest so
  // the resting state after a reload looks the same as the resting state now.
  const overlapped = !reduced && (phase === "drift" || phase === "bloom");

  /**
   * The phase clock.
   *
   * `onAdvance` writes to the external session store, NOT to React state, which
   * is what keeps this out of `react-hooks/set-state-in-effect` without a
   * suppression. Under reduced motion every stage collapses to `settled`
   * immediately — the copy and the count still arrive, only the movement does
   * not.
   */
  useEffect(() => {
    if (!moment) return;
    if (reduced) {
      if (moment.phase !== "settled") onAdvance("settled");
      return;
    }
    if (moment.phase === "drift") {
      const t = setTimeout(() => onAdvance("bloom"), TIMING.mergeDriftMs);
      return () => clearTimeout(t);
    }
    if (moment.phase === "bloom") {
      const t = setTimeout(
        () => onAdvance("settled"),
        TIMING.mergeBloomHoldMs + TIMING.mergeBloomFadeMs,
      );
      return () => clearTimeout(t);
    }
    return;
  }, [moment, reduced, onAdvance]);

  const left = me === "a" ? pair.a : pair.b;
  const right = me === "a" ? pair.b : pair.a;
  const leftIn = mineIn;
  const rightIn = theirsIn;

  const drift = useMemo(
    () => ({
      transition: `transform ${TIMING.mergeDriftMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    }),
    [],
  );

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ gap: GAP, height: AVATAR + 18 }}
    >
      <span style={{ ...drift, transform: overlapped ? `translateX(${DRIFT}px)` : "translateX(0)" }}>
        <Avatar person={left} filled={leftIn} />
      </span>
      <span style={{ ...drift, transform: overlapped ? `translateX(-${DRIFT}px)` : "translateX(0)" }}>
        <Avatar person={right} filled={rightIn} />
      </span>

      {/* The bloom at the overlap. Rises, holds 600ms, fades 400ms. */}
      {phase === "bloom" && !reduced && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: "50%",
            top: "50%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,130,47,0.42) 0%, rgba(201,130,47,0.16) 42%, rgba(201,130,47,0) 72%)",
            animation: `streak-bloom ${TIMING.mergeBloomHoldMs + TIMING.mergeBloomFadeMs}ms ease-out both`,
          }}
        />
      )}
    </div>
  );
}
