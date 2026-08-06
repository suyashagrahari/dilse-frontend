// ─── Rewind — the slide contract ─────────────────────────────────────────────
//
// Written by the lead BEFORE the slides were built so every agent could compile
// against the same signature. Treat this the way you treat types.ts: it is the
// seam between the story shell, the kinetic-type primitives and the slides.

import type { Archetype, DerivedStats, RewindData } from "./types";

/** One entry per slide the deck can contain. Absent data removes the entry. */
export type SlideKind =
  | "cold"
  | "date"
  | "bigNumber"
  | "breakdown"
  | "top5"
  | "joke"
  | "photos"
  | "song"
  | "buildup"
  | "archetype"
  | "closing";

export interface SlideDef {
  kind: SlideKind;
  /** Stable React key and seeded-random key. Never the array index. */
  key: string;
  /** How long the auto-advance timer holds on this slide. */
  durationMs: number;
  /** Flat, saturated, hard-cut background. From assignBackgrounds()/archetype.bg. */
  bg: string;
  /** textOn(bg). Never hardcode a text colour — read this. */
  fg: string;
}

export interface SlideProps {
  data: RewindData;
  /** deriveStats(data.startDate). EVERY time-shaped number comes from here. */
  stats: DerivedStats;
  /** computeArchetype(data.answers, data.startDate). */
  archetype: Archetype;
  def: SlideDef;
  /** prefers-reduced-motion. true → render the final state immediately. */
  reduced: boolean;
  /** Press-and-hold is active: the timer is paused and chrome is hidden. */
  held: boolean;
  /** Deterministic seed for any seededRandom call. Math.random() is banned. */
  seed: string;
}
