// ─── LoveFlix — named voices ─────────────────────────────────────────────────
//
// Every sound in this template is SYNTHESISED at play time from the primitives
// in `@/lib/webAudio`. Nothing is sampled, no audio file is fetched, and the
// payload cost of the entire soundtrack is zero bytes.
//
// IMPORTANT — these are all no-ops until the user opts in, by design:
//   `@/lib/webAudio` starts MUTED and its AudioContext starts SUSPENDED. Every
//   voice below routes through `tone`/`burst`, which bail out early unless
//   there is a live, running, unmuted bus. So a call here before
//   `unlockAudio()` (fired from a real gesture handler) and `setMuted(false)`
//   (fired from the mute control) does nothing at all — silently and safely.
//   That is the intended behaviour, not a bug: nobody gets sound they did not
//   ask for, and the browser's autoplay policy is never fought.
//
// Loudness discipline: the master bus is unity gain, so the per-voice gains
// here are the mix. The intro sting is the loudest thing in the template by a
// wide margin — everything else is deliberately quiet enough to sit under
// narration being read.

import { arpeggio, burst, tone } from "@/lib/webAudio";

// ─── The intro sting ─────────────────────────────────────────────────────────

/**
 * Note 1 — a low D. The strike.
 * Note 2 — the A a perfect FIFTH above it. The landing.
 *
 * A fifth is an open, unresolved interval: it states something rather than
 * finishing it, which is exactly right for a title card that is followed by a
 * whole episode. Both notes are triangle waves — a triangle has odd harmonics
 * that roll off fast, so it stays warm on a laptop and does not turn into a
 * buzz on a phone.
 */
const NOTE_ONE_HZ = 146.83; // D
const NOTE_TWO_HZ = 220; // A — a perfect fifth above NOTE_ONE_HZ
/** A sine an octave below note one. This is what makes it feel expensive. */
const SUB_HZ = 73.415;

const NOTE_ONE_MS = 180;
const NOTE_TWO_MS = 400;

/**
 * How long after note one begins that note two begins.
 *
 * Note two is scheduled with `tone({ delay })` rather than a `setTimeout`, so
 * both notes are placed on the SAME AudioContext clock and are sample-accurate
 * against each other. A timer would drift by a frame or two under load, and a
 * two-note sting with a wobbly gap sounds cheap immediately.
 *
 * `IntroScreen` mirrors this number to work out when to fire the sting so that
 * note two lands on the beat the wordmark resolves. If it ever changes here,
 * change it there.
 */
const NOTE_TWO_OFFSET_MS = 180;

/**
 * THE sound of this template — the two-note title sting.
 *
 * Structure:
 *   t+0ms    note one (D, 180ms triangle) + a sine sub an octave below it,
 *            plus a very short low-passed thump so the strike has a body a
 *            phone speaker can actually reproduce. The sub outlasts the note
 *            so the gap between the two notes is not silent.
 *   t+180ms  note two (A, 400ms triangle) arrives in three staggered layers.
 *
 * Why the layers: the `tone()` envelope has a fixed ~6ms attack, which on a
 * 400ms resolving note reads as a click rather than an arrival. Stacking the
 * fifth and the octave in behind the fundamental 45ms and 85ms late means the
 * note gains energy and brightness across its first ~90ms — it BLOOMS. The
 * layers are at different frequencies on purpose; doubling the same frequency
 * at an offset would phase-cancel instead of thickening.
 */
export const sfxIntroSting = (): void => {
  const gap = NOTE_TWO_OFFSET_MS / 1000;

  // ── Note one: the strike ──
  tone({ freq: NOTE_ONE_HZ, ms: NOTE_ONE_MS, type: "triangle", gain: 0.22 });
  // The sub. Rings on past the note itself so the gap has weight under it.
  tone({ freq: SUB_HZ, ms: 300, type: "sine", gain: 0.26 });
  // A dull transient. Gives the strike a physical edge on a small speaker.
  burst({ ms: 90, cutoff: 260, gain: 0.1, attack: 0.002 });

  // ── Note two: the landing, blooming over ~90ms ──
  tone({ freq: NOTE_TWO_HZ, ms: NOTE_TWO_MS, type: "triangle", gain: 0.2, delay: gap });
  // Sub an octave below note two, sustaining past it so it decays into black.
  tone({ freq: NOTE_TWO_HZ / 2, ms: 520, type: "sine", gain: 0.16, delay: gap });
  // The fifth above, arriving late — the first stage of the bloom.
  tone({ freq: NOTE_TWO_HZ * 1.5, ms: 340, type: "sine", gain: 0.055, delay: gap + 0.045 });
  // The octave above, last in. Brightness that grows rather than starts.
  tone({ freq: NOTE_TWO_HZ * 2, ms: 300, type: "sine", gain: 0.04, delay: gap + 0.085 });
};

// ─── Interface voices ────────────────────────────────────────────────────────

/**
 * Choice hover — 30ms, barely there. Fires on pointer-over of a choice button,
 * which can happen many times a second on a laptop, so it has to be quiet
 * enough to be felt rather than heard.
 */
export const sfxChoiceHover = (): void => {
  burst({ ms: 30, cutoff: 1800, toCutoff: 900, gain: 0.05, attack: 0.004 });
};

/**
 * Choice commit — 90ms rising blip. Rising because the story moves forward:
 * this is the one interaction in the episode that is irreversible, and it
 * should feel like a small yes.
 */
export const sfxChoiceCommit = (): void => {
  tone({ freq: 440, toFreq: 660, ms: 90, type: "triangle", gain: 0.17 });
  // A quiet octave on top so the rise reads clearly over narration.
  tone({ freq: 880, toFreq: 1320, ms: 70, type: "sine", gain: 0.05 });
};

/**
 * Countdown tick — one per second across the final three seconds of a choice
 * timer. Genuinely unobtrusive is the entire brief: it is a nudge that time is
 * short, not an alarm, and timing out is a joke rather than a failure. Very
 * short, very quiet, and the cutoff sweeps down so it lands soft instead of
 * sounding like a click track.
 */
export const sfxTick = (): void => {
  burst({ ms: 22, cutoff: 1400, toCutoff: 700, gain: 0.035, attack: 0.003 });
};

/**
 * Finale — a warm ascending four-note arpeggio. Root A, then the fifth, the
 * octave, and the third above that: an open major shape that resolves upward.
 * A long sine underneath holds the whole thing together so it reads as warm
 * rather than as four separate beeps.
 */
export const sfxFinale = (): void => {
  tone({ freq: 110, ms: 900, type: "sine", gain: 0.1 });
  arpeggio([0, 7, 12, 16], 220, 140);
};

/**
 * Generic light UI tap — profile select, buttons, sheet opens. A percussive
 * top with a faint pitched body, so it feels like a physical surface rather
 * than a synthesiser.
 */
export const sfxUiTap = (): void => {
  burst({ ms: 40, cutoff: 2200, toCutoff: 900, gain: 0.09, attack: 0.002 });
  tone({ freq: 520, ms: 45, type: "sine", gain: 0.06 });
};

/** A like — two quick rising sine blips, a small "aww". */
export const sfxLike = (): void => {
  tone({ freq: 660, toFreq: 880, ms: 80, type: "sine", gain: 0.08 });
  tone({ freq: 990, toFreq: 1320, ms: 90, type: "sine", gain: 0.05, delay: 0.07 });
};
