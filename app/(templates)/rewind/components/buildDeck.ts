// ─── Rewind — deck assembly ──────────────────────────────────────────────────
//
// The order IS the product, so it lives in exactly one place. Slides whose data
// is absent are removed here (not hidden inside a component returning null), so
// the progress segments and the auto-advance timings renumber automatically.
//
// Backgrounds: assignBackgrounds() guarantees no two adjacent slides share a hue
// family. Two slots are then pinned — the cold open is always near-black and the
// archetype reveal is always archetype.bg — and a repair pass restores the
// no-adjacent-repeat property that pinning could have broken.

import {
  NEAR_BLACK,
  PALETTE,
  SLIDE,
  assignBackgrounds,
  textOn,
  type Archetype,
  type DerivedStats,
  type RewindData,
} from "./types";
import { hash32 } from "@/lib/seededRandom";
import type { SlideDef, SlideKind } from "./slideTypes";

/** The canonical order. Membership is decided below; order never changes. */
const ORDER: { kind: SlideKind; durationMs: number }[] = [
  { kind: "cold", durationMs: SLIDE.defaultMs },
  { kind: "date", durationMs: SLIDE.defaultMs },
  { kind: "bigNumber", durationMs: SLIDE.defaultMs },
  { kind: "breakdown", durationMs: SLIDE.textHeavyMs },
  { kind: "top5", durationMs: SLIDE.listMs },
  { kind: "joke", durationMs: SLIDE.textHeavyMs },
  { kind: "photos", durationMs: SLIDE.defaultMs },
  { kind: "song", durationMs: SLIDE.defaultMs },
  { kind: "buildup", durationMs: SLIDE.beatMs },
  { kind: "archetype", durationMs: SLIDE.textHeavyMs },
  { kind: "closing", durationMs: SLIDE.textHeavyMs },
];

/** Stable across renders for the same couple; changes when the story changes. */
export function deckSeed(data: RewindData): string {
  return `rewind:${data.senderName}|${data.recipientName}|${data.startDate}`;
}

/** A photo slide with zero photos is a gap, not a slide. Same for the rest. */
function isPresent(kind: SlideKind, data: RewindData): boolean {
  switch (kind) {
    case "photos":
      return data.photos.filter((p) => p.trim()).length > 0;
    case "song":
      return data.audioUrl.trim().length > 0;
    case "joke":
      return data.stats.some((s) => s.value.trim() || s.label.trim());
    case "top5":
      return data.topReasons.some((r) => r.trim());
    default:
      return true;
  }
}

/**
 * Restores "no two adjacent backgrounds are equal" after the pinned slots have
 * been written in. Deterministic: the replacement is chosen by hashing the slide
 * key, never by Math.random().
 */
function repairAdjacent(bgs: string[], pinned: Set<number>, keys: string[]): string[] {
  const out = [...bgs];
  for (let i = 1; i < out.length; i++) {
    if (out[i] !== out[i - 1]) continue;
    if (pinned.has(i)) {
      // Can't move the pinned one — move its predecessor instead.
      const j = i - 1;
      if (pinned.has(j)) continue; // two pinned neighbours: impossible in ORDER
      out[j] = pickDifferent(keys[j], out[j - 1], out[i]);
    } else {
      out[i] = pickDifferent(keys[i], out[i - 1], out[i + 1]);
    }
  }
  return out;
}

function pickDifferent(key: string, a: string | undefined, b: string | undefined): string {
  const start = hash32(`repair:${key}`) % PALETTE.length;
  for (let n = 0; n < PALETTE.length; n++) {
    const cand = PALETTE[(start + n) % PALETTE.length].bg;
    if (cand !== a && cand !== b) return cand;
  }
  return PALETTE[start].bg;
}

/**
 * The whole deck, ready to render. `stats` is passed in rather than derived here
 * so the caller controls the clock (and the tests can freeze it).
 */
export function buildDeck(
  data: RewindData,
  stats: DerivedStats,
  archetype: Archetype,
): SlideDef[] {
  void stats; // reserved: no slide is currently gated on a derived value
  const kinds = ORDER.filter((o) => isPresent(o.kind, data));
  const seed = deckSeed(data);
  const keys = kinds.map((o) => `${o.kind}`);

  let bgs = assignBackgrounds(kinds.length, seed);

  const pinned = new Set<number>();
  const coldIdx = kinds.findIndex((o) => o.kind === "cold");
  if (coldIdx >= 0) {
    bgs[coldIdx] = NEAR_BLACK;
    pinned.add(coldIdx);
  }
  const archIdx = kinds.findIndex((o) => o.kind === "archetype");
  if (archIdx >= 0) {
    bgs[archIdx] = archetype.bg;
    pinned.add(archIdx);
  }

  bgs = repairAdjacent(bgs, pinned, keys);

  return kinds.map((o, i) => ({
    kind: o.kind,
    key: keys[i],
    durationMs: o.durationMs,
    bg: bgs[i],
    fg: textOn(bgs[i]),
  }));
}
