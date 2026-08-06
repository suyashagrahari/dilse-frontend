// ─── Named voices for this template only ─────────────────────────────────────
//
// Built on `tone` from `@/lib/webAudio`. Deliberately NOT added to that shared
// module: a jigsaw note is not a general-purpose sound.
//
// MISS / RETURN-TO-TRAY IS SILENT. There is no failure voice in this file and
// there must never be one. If a future change wants "a little sound so she
// knows it did not land", the answer is no — the piece visibly gliding back is
// the feedback, and sonifying it turns a non-event into a mistake.
//
// `tone` shapes its own envelope (a 6ms ramp up, then an exponential decay
// across `ms`), so length is what makes a note soft rather than a click: 45ms
// reads as a tap, 400ms as a tone. `delay` is in SECONDS and is scheduled on
// the audio clock, which is why the melody below is sample-accurate instead of
// being paced by `setTimeout`.

import { tone } from "@/lib/webAudio";
import { noteFreq } from "./types";

/** 45ms triangle at 900Hz, quick decay. The piece meeting the board. */
export function sfxPieceClick(): void {
  tone({ freq: 900, ms: 45, type: "triangle", gain: 0.09 });
}

/** One note of the letter's melody. Long enough to ring rather than tick. */
export function sfxNote(semitone: number): void {
  tone({ freq: noteFreq(semitone), ms: 400, type: "sine", gain: 0.13 });
}

/** The final piece landing after its fall. Heavier than a click. */
export function sfxFinalDrop(): void {
  tone({ freq: 220, ms: 130, type: "triangle", gain: 0.2 });
  tone({ freq: 660, ms: 280, type: "sine", gain: 0.11, delay: 0.045 });
}

const MELODY_STEP_MS = 130;

/**
 * The whole melody at double speed with a short tail. Played once, on
 * completion — the phrase she has been assembling one note at a time, finally
 * heard as a phrase.
 *
 * The "warm tail" is a single quiet echo an octave up, one step behind. It
 * stands in for reverb without a convolver or an impulse response.
 */
export function playMelody(melody: number[]): void {
  melody.forEach((semi, i) => {
    const at = (i * MELODY_STEP_MS) / 1000;
    tone({ freq: noteFreq(semi), ms: 320, type: "sine", gain: 0.12, delay: at });
    tone({ freq: noteFreq(semi + 12), ms: 260, type: "sine", gain: 0.035, delay: at + 0.09 });
  });
}

/** How long `playMelody` will run, so callers can stage what follows it. */
export const melodyDurationMs = (melody: number[]): number =>
  melody.length === 0 ? 0 : melody.length * MELODY_STEP_MS + 320;
