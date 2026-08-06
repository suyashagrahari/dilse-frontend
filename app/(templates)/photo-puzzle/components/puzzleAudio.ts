// STUB — owned by AGENT 5 (completion + share card + sound).
//
// Named voices for this template ONLY. Do not add these to `lib/webAudio.ts`.
// Build them on `tone`/`burst` from there.
//
// MISS / RETURN-TO-TRAY IS SILENT. There is deliberately no failure voice in
// this file and there must never be one.

/** 45ms triangle at 900Hz, quick decay. The piece meeting the board. */
export function sfxPieceClick(): void {}

/** Sine at `noteFreq(semitone)`, 400ms, soft attack, gentle release so
 *  consecutive notes overlap slightly. */
export function sfxNote(semitone: number): void {
  void semitone;
}

/** The whole melody at double speed with a short feedback delay for a warm
 *  tail. Played once, on completion. */
export function playMelody(melody: number[]): void {
  void melody;
}

/** The final piece landing after its fall. Heavier than a click. */
export function sfxFinalDrop(): void {}
