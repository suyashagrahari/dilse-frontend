"use client";

// ─── Capsule — the object ────────────────────────────────────────────────────
//
// The thing on the waiting screen has to be worth revisiting for a year, so it
// is drawn as an OBJECT and not a card: aged paper folded and tied, a wax seal
// pressed slightly off-square, a soft shadow, and grain.
//
// `wearFor` drives what it looks like as the date approaches. That progression
// is the only reason to come back before the day, so it has to be visible:
//   30 days → a fine crack in the wax
//    7 days → a faint glow
//    1 day  → it trembles once on load (one-shot, never a loop)

import { PALETTE, SERIF, type CapsuleWear } from "./types";
import { PaperTexture, WaxSeal, paperFill, wornEdgeStyle, type SealState } from "./paper";
import { seededSpread } from "@/lib/seededRandom";

const SEAL_STATE: Record<CapsuleWear, SealState> = {
  fresh: "whole",
  cracking: "cracked",
  glowing: "glowing",
  trembling: "glowing",
  ready: "glowing",
};

export default function CapsuleObject({
  seed,
  wear,
  initials,
  width = 232,
  splitPx = 0,
  pressing = false,
  reduced = false,
}: {
  seed: string;
  wear: CapsuleWear;
  /** Two letters pressed into the wax. */
  initials: string;
  width?: number;
  /** Drives the halves apart during the crack ceremony. */
  splitPx?: number;
  /** Replays the seal press. One-shot. */
  pressing?: boolean;
  reduced?: boolean;
}) {
  const tilt = -2.2 + seededSpread(seed, "tilt", 1.6);
  const height = Math.round(width * 1.34);
  // A one-shot tremble, keyed off the wear stage. Re-mounting the node is what
  // replays it, so it fires on load and never again.
  const trembling = wear === "trembling" && !reduced;

  return (
    <div
      className={trembling ? "capsule-tremble" : undefined}
      style={{ transform: trembling ? undefined : `rotate(${tilt.toFixed(2)}deg)`, width, height }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          ...paperFill(seed),
          ...wornEdgeStyle(seed),
          border: `1px solid ${PALETTE.edge}`,
        }}
      >
        <PaperTexture seed={`${seed}-grain`} opacity={0.07} />

        {/* The wrap: two bands of slightly darker paper crossing the front. */}
        <div
          aria-hidden
          className="absolute inset-y-0"
          style={{ left: "50%", width: 26, marginLeft: -13, background: "rgba(160,146,120,.16)" }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0"
          style={{ top: "50%", height: 26, marginTop: -13, background: "rgba(160,146,120,.13)" }}
        />

        {/* Fold creases — the paper was folded before it was tied. */}
        {[0.24, 0.76].map((t) => (
          <div
            key={t}
            aria-hidden
            className="absolute inset-x-0"
            style={{ top: `${t * 100}%`, height: 1, background: "rgba(120,106,84,.14)" }}
          />
        ))}

        {/* Handled corners. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: `inset 0 0 26px -8px rgba(96,84,64,.45)`,
            borderRadius: "inherit",
          }}
        />

        <div className="absolute inset-0 grid place-items-center">
          <div className={pressing && !reduced ? "capsule-press" : undefined}>
            <WaxSeal seed={`${seed}-wax`} size={Math.round(width * 0.42)} state={splitPx > 0 ? "split" : SEAL_STATE[wear]} initials={initials} splitPx={splitPx} />
          </div>
        </div>

        <p
          className="absolute inset-x-0 bottom-4 text-center"
          style={{ fontFamily: SERIF, color: PALETTE.inkSoft, fontSize: 13, fontStyle: "italic", letterSpacing: 0.2 }}
        >
          do not open
        </p>
      </div>
    </div>
  );
}
