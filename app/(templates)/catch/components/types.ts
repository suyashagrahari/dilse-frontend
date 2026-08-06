// ─── Catch — shared type contract ────────────────────────────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync.
//
// CORE DESIGN PRINCIPLE, enforced by these types: the game is not a gate.
// Nothing is ever locked, withheld or taken away. Catching an item ADDS a line;
// a miss only means that line has not arrived yet. There is deliberately no
// `score`, no `lives`, and no `failed` field anywhere in this file — if you
// find yourself wanting to add one, the design has gone wrong.

import { bodyFromKeys, clampNum, list, str, strOr, type Raw } from "@/lib/wire";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/** A falling object that carries one line of the letter. */
export interface GoodItem {
  id: string;
  /** An emoji is preferable to custom art — culturally legible, zero bytes. */
  emoji: string;
  /** "the grey hoodie" — what makes the object specific to them. */
  label: string;
  /** The letter line this object carries. */
  line: string;
}

/** Something to dodge. Petty, never cruel. */
export interface BadItem {
  id: string;
  emoji: string;
  label: string;
}

export interface CatchData {
  recipientName: string;
  senderName: string;
  /** Their photo, becomes the paddle sprite. Falls back to an initial. */
  faceUrl: string;
  /** 8-14 items. Each spawns at most once per run. */
  goodItems: GoodItem[];
  /** 3-6 items. */
  badItems: BadItem[];
  /** Always shown at the end, caught or not. */
  closingLine: string;
  durationMs: number;
}

// ─── Tuning ──────────────────────────────────────────────────────────────────
// Exported as named data so the values are reviewable and testable rather than
// buried in the loop. These numbers ARE the feel of the game.

export const FIELD = {
  /** Fixed logical resolution. Physics is tuned against this, never CSS px. */
  w: 400,
  h: 600,
} as const;

export const PLAYER = {
  radius: 32,
  /** Distance above the bottom edge. */
  bottomOffset: 90,
  /** Per-frame LERP toward the pointer, normalised by delta time. The lag is
   *  deliberate — instant tracking feels floaty and weightless. */
  lerp: 0.18,
  edgeMargin: 8,
  /** Squash-and-stretch on a catch. */
  catchScaleX: 1.18,
  catchScaleY: 0.86,
  catchRecoverMs: 140,
  /** Flinch on a hit. */
  hitRotateDeg: 14,
  hitSaturate: 0.4,
  hitShakePx: 3,
  stunMs: 400,
} as const;

/**
 * The single most important tuning decision in the build: good items are easier
 * to catch than they look, bad items easier to dodge than they look. Nobody
 * notices, and it is the difference between generous and rigged.
 *
 * Do NOT "fix" these to be symmetrical.
 */
export const HITBOX = {
  goodMultiplier: 1.30,
  badMultiplier: 0.75,
} as const;

export const SPAWN = {
  startIntervalMs: 900,
  endIntervalMs: 600,
  maxConcurrent: 7,
  poolSize: 16,
  goodToBadRatio: 3,
  fallSpeed: 130,       // logical px per second
  swayAmplitude: 18,
  swayPeriodMs: 1400,
  itemSize: 40,
} as const;

/**
 * Silent dynamic difficulty. Never surfaced in the UI — no difficulty setting,
 * no on-screen message. The game bends toward letting them win and never says
 * that it did.
 */
export const DIFFICULTY = {
  missStreakTrigger: 3,
  missSpeedMultiplier: 0.85,
  missGoodToBadRatio: 5,
  catchStreakTrigger: 6,
  catchSpeedMultiplier: 1.08,
  maxSpeedMultiplier: 1.3,
} as const;

/** Result of one run. No score, by design. */
export interface RunStats {
  caught: number;
  totalGood: number;
  dodged: number;
  /** Ids of good items whose line never arrived — the replay hook. */
  missedIds: string[];
}

// ─── Component contract ──────────────────────────────────────────────────────

export interface CatchTemplateProps {
  data: CatchData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

export const DEMO_DATA: CatchData = {
  recipientName: "Ananya",
  senderName: "Rohan",
  faceUrl: "",
  goodItems: [
    { id: "g1",  emoji: "☕", label: "the chai you never finish", line: "You make chai and abandon it half-drunk on every surface in the house." },
    { id: "g2",  emoji: "🧥", label: "the grey hoodie", line: "I have stopped asking for the hoodie back. Consider it a transfer of ownership." },
    { id: "g3",  emoji: "🎧", label: "one earbud, always", line: "You always hand me the left one. Every time. Without looking." },
    { id: "g4",  emoji: "🐕", label: "the dog you fed once", line: "You fed that street dog one biscuit in 2023 and now he is technically our responsibility." },
    { id: "g5",  emoji: "📚", label: "page 40 of everything", line: "You start every book and stop at page forty. I find them everywhere, all bookmarked at forty." },
    { id: "g6",  emoji: "🌧️", label: "that monsoon", line: "You refused the umbrella on principle and then complained about it for an hour." },
    { id: "g7",  emoji: "💍", label: "your grandmother's ring", line: "You wear it on the wrong finger so nobody asks. I noticed on day one." },
    { id: "g8",  emoji: "🍜", label: "2 AM maggi", line: "Half-cooked, on the kitchen floor, during a power cut. Best meal of my life too." },
    { id: "g9",  emoji: "✈️", label: "the airport", line: "You ran through a crowded terminal. I have never been more embarrassed or more certain." },
    { id: "g10", emoji: "📷", label: "the blurry photo", line: "The only photo of us from that year is blurry and you refuse to delete it." },
    { id: "g11", emoji: "🎵", label: "the song you ruined", line: "I cannot hear that song without hearing your terrible harmony over it." },
    { id: "g12", emoji: "🕯️", label: "the power cut", line: "Four hours, no phones, and you talked about your father for the first time." },
  ],
  badItems: [
    { id: "b1", emoji: "💬", label: '"k"' },
    { id: "b2", emoji: "👀", label: "seen 9:41 PM" },
    { id: "b3", emoji: "🚩", label: "a red flag" },
    { id: "b4", emoji: "📱", label: "his ex's story" },
    { id: "b5", emoji: "🥱", label: '"we should hang out sometime"' },
  ],
  closingLine: "That's all of it. Even the parts you didn't catch — they were always going to be yours.",
  durationMs: 45000,
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const CATCH_CONTENT_KEYS: (keyof CatchData)[] = [
  "recipientName", "senderName", "faceUrl", "goodItems", "badItems", "closingLine", "durationMs",
];

export function catchDataToBody(data: CatchData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, CATCH_CONTENT_KEYS, password);
}

export function dbToCatchData(db: Raw | null | undefined): CatchData {
  const src = db ?? {};
  return {
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    senderName: str(src.senderName, DEMO_DATA.senderName),
    faceUrl: strOr(src.faceUrl, ""),
    goodItems: list<GoodItem>(
      src.goodItems,
      (o, i) => {
        const line = str(o.line, "");
        if (!line) return null;
        return {
          id: str(o.id, `g${i + 1}`),
          emoji: str(o.emoji, "💛"),
          label: str(o.label, ""),
          line,
        };
      },
      DEMO_DATA.goodItems,
    ).slice(0, 14),
    badItems: list<BadItem>(
      src.badItems,
      (o, i) => ({
        id: str(o.id, `b${i + 1}`),
        emoji: str(o.emoji, "🚩"),
        label: str(o.label, "a red flag"),
      }),
      DEMO_DATA.badItems,
    ).slice(0, 6),
    closingLine: str(src.closingLine, DEMO_DATA.closingLine),
    durationMs: clampNum(src.durationMs, DEMO_DATA.durationMs, 20000, 120000),
  };
}
