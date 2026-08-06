// ─── The Invitation — named voices ───────────────────────────────────────────
//
// Named voices for THIS template, built on the primitives in `@/lib/webAudio`.
// New voices live here, never in the shared lib (three other templates are
// being built against it right now).
//
// Everything must be short, soft and paper-like. This is an invitation, not a
// game: no arcade blips, no melodies, nothing that loops. Every voice below is
// a one-shot fired by a user gesture, and none of them is longer than 200ms.
//
// Audio is muted-by-default in the shared lib until `unlockAudio()` runs on a
// gesture — call it from the first RSVP tap, not on mount.
//
// A note on why these are all `burst` and barely any `tone`: an oscillator has
// a pitch, and a pitch reads as a *notification*. Paper, wax and card stock are
// broadband noise with the top end filtered off. The only pitched voice here is
// `sfxTap`, and it is deliberately almost inaudible.

import { burst, tone } from "@/lib/webAudio";

/**
 * The wax seal pressing down. Short, dull, low — a thud with no ring.
 *
 * Two overlapping bursts with zero attack: a tight upper "press" that gives the
 * transient its edge, and a longer, much darker body underneath that carries
 * the weight. No oscillator anywhere near it — the moment this has a pitch it
 * stops being wax and starts being a doorbell.
 */
export const sfxSeal = (): void => {
  burst({ ms: 85, cutoff: 260, toCutoff: 120, gain: 0.42, attack: 0 });
  burst({ ms: 170, cutoff: 90, gain: 0.3, attack: 0, delay: 0.012 });
};

/**
 * A stop unlocking. A soft paper-and-latch sound: a papery lift with a gentle
 * attack, then a small dry catch a beat later.
 */
export const sfxUnlock = (): void => {
  burst({ ms: 90, cutoff: 2400, toCutoff: 800, gain: 0.13, attack: 0.012 });
  burst({ ms: 45, cutoff: 520, gain: 0.17, attack: 0, delay: 0.07 });
};

/** The invitation card settling / a sheet sliding open. Quiet, wide, no attack edge. */
export const sfxPaper = (): void => {
  burst({ ms: 160, cutoff: 1900, toCutoff: 650, gain: 0.11, attack: 0.035 });
};

/** Confirmation of a tap on a primary control. Barely there, and meant to be. */
export const sfxTap = (): void => {
  tone({ freq: 520, ms: 28, type: "sine", gain: 0.05 });
};
