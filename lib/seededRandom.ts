// ─── Deterministic randomness ────────────────────────────────────────────────
//
// Several templates must produce the SAME output for the same input, forever:
// a kundli report that rescored on every refresh would be worthless, and a
// swipe deck that reshuffled on reload would lose the recipient's place.
//
// `Math.random()` is banned in that code. Use these instead. Every function
// here is pure and stable across reloads, machines and Node/browser.
//
// Also used for "organic" imperfection — ink rotation, paper grain, item
// tumble — where the jitter must look random but never move between the
// on-screen render and the exported PNG.

/** FNV-1a, 32-bit. Fast, well-distributed, and stable across engines. */
export function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // h *= 16777619, done in 32-bit-safe pieces
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/**
 * mulberry32 — a small, fast, statistically decent PRNG.
 * Returns a generator producing floats in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convenience: a generator seeded directly from a string. */
export const rngFrom = (seed: string): (() => number) => mulberry32(hash32(seed));

/** A stable float in [0,1) for a (seed, key) pair — no generator to thread around. */
export const seededUnit = (seed: string, key: string): number =>
  hash32(`${seed}::${key}`) / 4294967296;

/** A stable integer in [min, max] inclusive. */
export const seededInt = (seed: string, key: string, min: number, max: number): number =>
  min + Math.floor(seededUnit(seed, key) * (max - min + 1));

/** A stable value in [-range, +range] — for ink rotation, tumble, jitter. */
export const seededSpread = (seed: string, key: string, range: number): number =>
  (seededUnit(seed, key) * 2 - 1) * range;

/** A stable pick from a list. Never returns undefined for a non-empty list. */
export function seededPick<T>(seed: string, key: string, list: readonly T[]): T {
  return list[seededInt(seed, key, 0, list.length - 1)];
}

/**
 * A stable pick that is guaranteed NOT to equal `exclude`.
 * Used where two derived attributes must differ (the kundli yoni animals, for
 * one — "Monkey / Monkey" kills the joke and reads as a bug).
 */
export function seededPickExcluding<T>(
  seed: string,
  key: string,
  list: readonly T[],
  exclude: T,
): T {
  const pool = list.filter((x) => x !== exclude);
  if (pool.length === 0) return list[0];
  return pool[seededInt(seed, key, 0, pool.length - 1)];
}

/** Fisher-Yates with a seeded generator. Returns a new array; input untouched. */
export function seededShuffle<T>(seed: string, list: readonly T[]): T[] {
  const out = list.slice();
  const rand = rngFrom(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffle, then retry until `ok` accepts the ordering (or we run out of tries).
 * Falls back to the last attempt rather than looping forever — a slightly
 * imperfect order is always better than a hang.
 */
export function seededShuffleWhere<T>(
  seed: string,
  list: readonly T[],
  ok: (candidate: T[]) => boolean,
  maxTries = 20,
): T[] {
  let last = list.slice();
  for (let i = 0; i < maxTries; i++) {
    last = seededShuffle(`${seed}#${i}`, list);
    if (ok(last)) return last;
  }
  return last;
}
