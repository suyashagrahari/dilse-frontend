// ─── Rewind — generated UI voices ────────────────────────────────────────────
//
// Every sound in this template is synthesised at call time from the shared
// Web Audio primitives. Zero bytes of payload, and nothing here belongs in
// `lib/webAudio.ts` — these are Rewind's voices, not everyone's.
//
// Three things this file deliberately does NOT do:
//
// 1. It never creates an AudioContext. There is no module-level state at all.
//    `unlockAudio()` is called by the story shell from the first pointerdown,
//    which is the only place the autoplay policy will accept it.
// 2. It does not re-check `isMuted()`. Verified rather than assumed: every
//    primitive routes through `bus()` in lib/webAudio.ts, which returns null —
//    and therefore schedules nothing — when `muted` is true, when the context
//    was never created, or when it is not in the `running` state. A second
//    guard here would be a second place to get the mute logic wrong.
// 3. It does not gate on prefers-reduced-motion. Sound is not motion, and the
//    shell already owns the mute control the user actually reaches for.
//
// The gains are low on purpose. `sfxAdvance` fires up to twelve times in under
// a minute; anything you would notice once is unbearable by the fourth slide.

import { burst, tone } from "@/lib/webAudio";

/**
 * Soft tick on every slide advance.
 *
 * A very short sine pip with a papery noise edge. Tuned to sit under the
 * thumb-tap rather than announce itself: at ~0.045 gain it reads as feedback,
 * not as a notification, which is what lets it survive twelve repetitions.
 */
export function sfxAdvance(): void {
  tone({ freq: 1480, ms: 26, type: "sine", gain: 0.045 });
  burst({ ms: 22, cutoff: 3200, gain: 0.028, attack: 0 });
}

/** Going backwards. The same tick, pitched down, so direction is audible. */
export function sfxBack(): void {
  tone({ freq: 880, ms: 30, type: "sine", gain: 0.04 });
  burst({ ms: 22, cutoff: 2200, gain: 0.024, attack: 0 });
}

/**
 * The archetype reveal. A verdict landing.
 *
 * Two rising voices — a body tone and a thinner octave above it — under a
 * filter sweep that opens as they climb, then a short major triad on top. The
 * rise creates the expectation; the triad is the answer to it. A flat blip
 * here reads as "next slide", which is precisely the wrong meaning.
 */
export function sfxReveal(): void {
  tone({ freq: 196, toFreq: 587, ms: 300, type: "triangle", gain: 0.13 });
  tone({ freq: 392, toFreq: 1175, ms: 300, type: "sine", gain: 0.06, delay: 0.02 });
  burst({ ms: 240, cutoff: 500, toCutoff: 5200, gain: 0.09, attack: 0.09 });

  // The chord. Root, major third, fifth — arrives just as the sweep peaks.
  const root = 523.25;
  [0, 4, 7].forEach((semi, i) => {
    tone({
      freq: root * Math.pow(2, semi / 12),
      ms: 420,
      type: "triangle",
      gain: 0.1,
      delay: 0.28 + i * 0.045,
    });
  });
}

/**
 * The story reaching the share card. A quiet thud — the deck being set down.
 *
 * Low, dull, hard attack, with a sub tone falling underneath it so it has
 * weight without volume.
 */
export function sfxLand(): void {
  burst({ ms: 180, cutoff: 170, gain: 0.28, attack: 0 });
  tone({ freq: 110, toFreq: 62, ms: 240, type: "sine", gain: 0.1 });
}

/** Press-and-hold engaged: the timer has stopped. Barely there by design. */
export function sfxHold(): void {
  tone({ freq: 320, ms: 70, type: "sine", gain: 0.035 });
}

/** Released: the timer is running again. */
export function sfxRelease(): void {
  tone({ freq: 420, ms: 60, type: "sine", gain: 0.035 });
}

/** The PNG has hit the downloads folder. Two clean pips, definitively done. */
export function sfxSaved(): void {
  tone({ freq: 784, ms: 90, type: "triangle", gain: 0.1 });
  tone({ freq: 1175, ms: 150, type: "triangle", gain: 0.09, delay: 0.09 });
}

/** Something did not work. Soft and low — an apology, not an alarm. */
export function sfxFailed(): void {
  tone({ freq: 260, toFreq: 180, ms: 220, type: "triangle", gain: 0.09 });
}

/** Starting the deck over. A quick downward sweep — the tape rewinding. */
export function sfxReplay(): void {
  tone({ freq: 1320, toFreq: 330, ms: 260, type: "sawtooth", gain: 0.06 });
  burst({ ms: 200, cutoff: 3000, toCutoff: 700, gain: 0.05, attack: 0.02 });
}
