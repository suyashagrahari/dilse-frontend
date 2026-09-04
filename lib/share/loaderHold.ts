// ─── How long the brand loader stays on screen ───────────────────────────────
//
// The share fetch often answers in a few hundred milliseconds, which used to
// flash the loader and tear it away mid-reveal: the letters had not finished
// resolving before the screen was replaced. A loading screen that half-plays
// reads as a glitch rather than as a brand.
//
// So there is a floor, and it is derived from the animation instead of picked
// from the air. The numbers below are the delays in `components/brand/
// BrandLoader` — kept here as constants precisely so a test can assert the
// floor still outlasts the reveal if either side changes.
//
// No imports: this module is read by `node --test` with type stripping.

/** Last letter: 10 × 45ms stagger, then a 620ms resolve. */
const LETTERS_END_MS = 10 * 45 + 620;
/** "DIGITAL CELEBRATIONS": 760ms delay, 500ms fade. */
const SUBLINE_END_MS = 760 + 500;
/** "शुभ संदेश": 1000ms delay, 600ms fade. */
const DEVANAGARI_END_MS = 1000 + 600;

/**
 * When the reveal is finished.
 *
 * The sheen sweeping across the wordmark is deliberately NOT counted: it is an
 * infinite loop, not part of the arrival, and waiting for a full pass of it
 * would add most of a second for nothing.
 */
export const REVEAL_ENDS_MS = Math.max(LETTERS_END_MS, SUBLINE_END_MS, DEVANAGARI_END_MS);

/** The reveal, plus a beat of the finished lockup. */
export const LOADER_MIN_MS = 2000;

/**
 * A dead link gets a shorter floor.
 *
 * Making somebody wait the full brand moment to be told the page does not exist
 * is the one case where the hold is pure cost. Answering instantly looks like
 * the link was never tried at all, so it is shortened rather than removed.
 */
export const LOADER_MIN_MS_ERROR = 900;

/** How much longer the loader must stay, given how long it has been up. */
export function holdRemainingMs(elapsedMs: number, ok: boolean): number {
  const floor = ok ? LOADER_MIN_MS : LOADER_MIN_MS_ERROR;
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  return Math.max(0, floor - elapsed);
}
