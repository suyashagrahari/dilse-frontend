// ─── The loader's timeline, in one place ─────────────────────────────────────
//
// This table is the ONLY definition of how long the brand loader takes. The
// component reads it into CSS custom properties, so every delay and duration in
// the stylesheet comes from here, and the hold that keeps the loader on screen
// is computed from the same numbers. The animation and the wait cannot drift
// apart, because there is only one set of numbers.
//
// ── WHY IT HAD TO BECOME A TABLE ────────────────────────────────────────────
//
// The first version had the delays written into the CSS and the floor written
// as a constant beside them, kept in agreement by a comment doing arithmetic.
// It was wrong within a day: the floor was 2000ms while the sheen sweeping
// across the wordmark started at 900ms and took 2.6s, so the page appeared with
// the highlight stopped halfway across the name — the exact "half animation"
// this is supposed to prevent. A comment cannot hold two numbers together; a
// shared table can.
//
// ── AND WHY THE SEQUENCE ENDS AT ALL ────────────────────────────────────────
//
// Every stage now has a finish. The sheen makes ONE pass instead of looping,
// and the bar FILLS rather than sliding back and forth, so there is a real
// moment when the loader is done rather than a set of loops interrupted
// whenever the network happened to answer. That moment is when the page
// arrives, which is what makes the two read as one motion: the bar reaching the
// end IS the page opening.
//
// No imports: this module is read by `node --test` with type stripping.

/** One animated stage: when it starts, how long it runs. */
export interface Stage {
  start: number;
  duration: number;
  /** Per-letter offset, for the wordmark only. */
  stagger?: number;
  /** How many things are staggered, so the last one's end can be computed. */
  count?: number;
}

/**
 * The sequence, in the order it plays.
 *
 * Paced deliberately rather than quickly. This is the one moment the product
 * has a recipient's whole attention, and a reveal that has to be caught is not
 * a reveal — the whole point of holding the page back is that somebody actually
 * sees the name of the thing that made it.
 */
export const LOADER_SEQUENCE = {
  /** The mark drops onto its plate. */
  plate: { start: 100, duration: 620 },
  /** "SubhSandesh", one letter at a time. 11 letters. */
  letters: { start: 320, duration: 620, stagger: 58, count: 11 },
  /** "DIGITAL CELEBRATIONS". */
  subline: { start: 1280, duration: 540 },
  /** शुभ संदेश. */
  devanagari: { start: 1720, duration: 580 },
  /** The bar filling left to right — the whole sequence long, by definition. */
  bar: { start: 260, duration: 2740 },
  /** One highlight sweeping across the finished wordmark. The finale. */
  sheen: { start: 2140, duration: 860 },
} as const satisfies Record<string, Stage>;

/** When a stage finishes, staggered items included. */
export function stageEnd(stage: Stage): number {
  const lastStart = stage.stagger && stage.count ? stage.stagger * (stage.count - 1) : 0;
  return stage.start + lastStart + stage.duration;
}

/** When the last stage finishes. */
export const SEQUENCE_ENDS_MS = Math.max(
  ...Object.values(LOADER_SEQUENCE).map((s) => stageEnd(s))
);

/**
 * A breath on the finished lockup before it goes.
 *
 * Without it the page replaces the loader on the exact frame the last
 * animation ends, which reads as an interruption rather than as a finish.
 */
export const SETTLE_MS = 220;

/** The floor: the whole sequence, then the breath. */
export const LOADER_MIN_MS = SEQUENCE_ENDS_MS + SETTLE_MS;

/**
 * A dead link does not get the brand moment.
 *
 * Making somebody wait three seconds to be told the page does not exist is the
 * one case where the hold is pure cost. Answering instantly looks like the link
 * was never tried, so it is shortened rather than removed.
 */
export const LOADER_MIN_MS_ERROR = 900;

/** How much longer the loader must stay, given how long it has been up. */
export function holdRemainingMs(elapsedMs: number, ok: boolean): number {
  const floor = ok ? LOADER_MIN_MS : LOADER_MIN_MS_ERROR;
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  return Math.max(0, floor - elapsed);
}

/**
 * The timings as CSS custom properties, for the component to spread onto the
 * host element. This is the bridge that stops the stylesheet holding its own
 * copy of any of these numbers.
 */
export function loaderCssVars(): Record<string, string> {
  const s = LOADER_SEQUENCE;
  return {
    "--ssbl-plate-in": `${s.plate.start}ms`,
    "--ssbl-plate-dur": `${s.plate.duration}ms`,
    "--ssbl-letter-dur": `${s.letters.duration}ms`,
    "--ssbl-sub-in": `${s.subline.start}ms`,
    "--ssbl-sub-dur": `${s.subline.duration}ms`,
    "--ssbl-deva-in": `${s.devanagari.start}ms`,
    "--ssbl-deva-dur": `${s.devanagari.duration}ms`,
    "--ssbl-bar-in": `${s.bar.start}ms`,
    "--ssbl-bar-dur": `${s.bar.duration}ms`,
    "--ssbl-sheen-in": `${s.sheen.start}ms`,
    "--ssbl-sheen-dur": `${s.sheen.duration}ms`,
    /** When everything is over: the bar hands off to a waiting state here. */
    "--ssbl-seq-end": `${SEQUENCE_ENDS_MS}ms`,
  };
}

/** The delay for one letter of the wordmark. */
export function letterDelayMs(index: number): number {
  const { start, stagger } = LOADER_SEQUENCE.letters;
  return start + index * (stagger ?? 0);
}
