// ─── Bouquet — shared type contract ──────────────────────────────────────────
// Single source of truth for the data shape shared by the editor, the published
// viewer, and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep in sync with the Stage-4 model.

import { MIN_BLOOMS, MAX_BLOOMS, FLOWERS, type BouquetMode } from "./assets";

export type EditMode = null | "choose" | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

/** A chosen bloom + how many of it are in the bouquet. */
export interface StemCount {
  id: number;
  count: number;
}

export interface BouquetData {
  /** Full-colour or black-and-white asset set. */
  mode: BouquetMode;
  /** The blooms in the bouquet (id + quantity). Total must be MIN..MAX to publish. */
  flowers: StemCount[];
  /** Deterministic seed → the procedural fan layout (reshuffled by "new arrangement"). */
  arrangementSeed: number;
  /** Greenery / wrap index (0…GREENERY_COUNT-1). */
  greenery: number;
  /** Who it's for (shown as "Dear ___"). */
  recipientName: string;
  /** Who it's from (the signature). */
  senderName: string;
  /** The card message. */
  message: string;
  /** Whether to attach the playful "Deed of Devotion" certificate. */
  deedEnabled: boolean;
  /** The pledge lines on the certificate. */
  deedClauses: string[];
}

export const DEFAULT_CLAUSES = [
  "1× unlimited forehead kisses, on demand ✿",
  "First and last text of every single day ✉",
  "Shared fries, always — no negotiation 🍟",
];

export const DEMO_DATA: BouquetData = {
  mode: "color",
  flowers: [
    { id: 12, count: 2 }, // rose
    { id: 11, count: 2 }, // peony
    { id: 7, count: 2 }, // ranunculus
    { id: 2, count: 1 }, // tulip
    { id: 10, count: 1 }, // daisy
  ],
  arrangementSeed: 7,
  greenery: 0,
  recipientName: "",
  senderName: "Aarav",
  message:
    "I saw these and thought of you — every single one. No occasion, no reason, just that you're my favourite person and the world is a little softer with you in it. Keep these somewhere you'll see them and remember: you are so, so loved. 💐",
  deedEnabled: true,
  deedClauses: DEFAULT_CLAUSES,
};

/** Whitelisted keys that make up the flat wire payload (also the model content fields). */
export const BOUQUET_CONTENT_KEYS: (keyof BouquetData)[] = [
  "mode",
  "flowers",
  "arrangementSeed",
  "greenery",
  "recipientName",
  "senderName",
  "message",
  "deedEnabled",
  "deedClauses",
];

// ─── helpers ────────────────────────────────────────────────────────────────

export const totalBlooms = (flowers: StemCount[]): number =>
  flowers.reduce((n, f) => n + Math.max(0, f.count | 0), 0);

export const isBouquetValid = (flowers: StemCount[]): boolean => {
  const n = totalBlooms(flowers);
  return n >= MIN_BLOOMS && n <= MAX_BLOOMS;
};

/** Expand {id,count}[] into a flat list of bloom ids (only known flowers). */
export const expandStems = (flowers: StemCount[]): number[] => {
  const known = new Set(FLOWERS.map((f) => f.id));
  const out: number[] = [];
  for (const f of flowers) {
    if (!known.has(f.id)) continue;
    for (let i = 0; i < Math.max(0, Math.min(MAX_BLOOMS, f.count | 0)); i++) out.push(f.id);
  }
  return out.slice(0, MAX_BLOOMS);
};

/** Tiny deterministic PRNG so a seed always yields the same fan (SSR-safe). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function bouquetDataToBody(data: BouquetData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of BOUQUET_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

/** DB/share response → UI state (fills any missing field from DEMO_DATA). */
export function dbToBouquetData(db: Record<string, unknown> | null | undefined): BouquetData {
  const src = db ?? {};
  const str = (k: keyof BouquetData): string =>
    typeof src[k as string] === "string" ? (src[k as string] as string) : (DEMO_DATA[k] as string);

  const rawFlowers = Array.isArray(src.flowers) ? (src.flowers as unknown[]) : DEMO_DATA.flowers;
  const flowers: StemCount[] = rawFlowers
    .map((f) => {
      const o = (f && typeof f === "object" ? f : {}) as Record<string, unknown>;
      return { id: Number(o.id) || 0, count: Math.max(0, Math.min(MAX_BLOOMS, Number(o.count) || 0)) };
    })
    .filter((f) => f.id > 0 && f.count > 0);

  const clauses = Array.isArray(src.deedClauses)
    ? (src.deedClauses as unknown[]).map((c) => String(c)).filter(Boolean).slice(0, 6)
    : DEMO_DATA.deedClauses;

  return {
    mode: src.mode === "mono" ? "mono" : "color",
    flowers: flowers.length ? flowers : DEMO_DATA.flowers,
    arrangementSeed: Number(src.arrangementSeed) || DEMO_DATA.arrangementSeed,
    greenery: Math.max(0, Number(src.greenery) || 0),
    recipientName: str("recipientName"),
    senderName: str("senderName"),
    message: str("message"),
    deedEnabled: src.deedEnabled === undefined ? DEMO_DATA.deedEnabled : !!src.deedEnabled,
    deedClauses: clauses.length ? clauses : DEMO_DATA.deedClauses,
  };
}
