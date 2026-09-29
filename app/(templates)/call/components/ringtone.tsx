// ─── Caller ID — the ring, generated ─────────────────────────────────────────
//
// No audio file ships with this template. The ring is two sine tones, 440Hz and
// 480Hz, alternating in half-second steps through a lowpass — 2 seconds on, 4
// seconds off, forever, which is the cadence every phone in India rings with.
// A recorded loop would be recognisable as somebody's ringtone; arithmetic is
// nobody's.
//
// The house idiom is `app/(templates)/dedication/components/radioAudio.ts` and
// the three rules it learned are the three rules here:
//
//   1. The AudioContext is only ever CONSTRUCTED INSIDE A USER GESTURE. Built
//      anywhere else it starts `suspended` and stays there, silently.
//   2. `pump()` re-resumes on every later gesture and on a visibility return,
//      because iOS suspends the context on an interruption and never says so.
//   3. Nothing is left running. `stop()` cancels the scheduler and the ramps;
//      `destroy()` closes the context.
//
// ── THE ONE RULE THAT IS THIS TEMPLATE'S OWN ─────────────────────────────────
//
// A phone ringing out of a tab nobody is looking at is genuinely bad — worse
// than silence, and worse than most autoplay. `visibilitychange` stops the tone
// AND the vibration on the same tick as the tab going away. That is an
// acceptance criterion, not a nicety, and it is why `stop()` is idempotent and
// cheap enough to call from an event handler.

"use client";

type Ctor = new () => AudioContext;

const getCtor = (): Ctor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
};

/** 2s of tone, then 4s of nothing. One cycle is 6s. */
const ON_SECONDS = 2;
const CYCLE_SECONDS = 6;
/** The two tones swap this often inside the on-window. */
const STEP_SECONDS = 0.5;
const TONE_A = 440;
const TONE_B = 480;
/** Quiet enough to be answered rather than dismissed. */
const PEAK = 0.13;

export class Ringtone {
  private ac: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  /** The next cycle's start, on the context clock. Never behind `currentTime`. */
  private nextAt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private ringing = false;

  /**
   * Build the graph. MUST be called from inside a real gesture handler.
   * Idempotent: a second call just re-resumes.
   */
  ensureContext(): boolean {
    if (this.ac) {
      this.pump();
      return true;
    }
    const Ctor = getCtor();
    if (!Ctor) return false;

    try {
      this.ac = new Ctor();
    } catch {
      this.ac = null;
      return false;
    }

    const osc = this.ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = TONE_A;

    const filter = this.ac.createBiquadFilter();
    filter.type = "lowpass";
    // High enough to leave the two tones intact, low enough to take the edge
    // off the square-ish corners that abrupt gain steps put on a sine.
    filter.frequency.value = 1400;
    filter.Q.value = 0.7;

    const gain = this.ac.createGain();
    gain.gain.value = 0;

    osc.connect(filter).connect(gain).connect(this.ac.destination);
    try {
      osc.start();
    } catch {
      /* an oscillator that will not start leaves a silent, harmless graph */
    }

    this.osc = osc;
    this.filter = filter;
    this.gain = gain;
    this.pump();
    return true;
  }

  /** True once there is a context AND it is actually running. */
  get running(): boolean {
    return this.ac?.state === "running";
  }

  /** True once a context exists at all — i.e. a gesture has happened. */
  get ready(): boolean {
    return this.ac !== null;
  }

  /** Re-resume after an iOS interruption or a tab return. Safe to spam. */
  pump(): void {
    if (!this.ac || this.ac.state === "running") return;
    void this.ac.resume().catch(() => {});
  }

  /**
   * Schedule one 2s ring and arm the next.
   *
   * Times are computed on the AUDIO clock, not from `Date.now()`, so a
   * throttled `setTimeout` cannot make the cadence drift: the timer only has to
   * fire somewhere inside the four seconds of silence, and the ramps it writes
   * are placed exactly.
   */
  private scheduleCycle(): void {
    const ac = this.ac;
    const gain = this.gain;
    const osc = this.osc;
    if (!ac || !gain || !osc || !this.ringing) return;

    const start = Math.max(ac.currentTime + 0.02, this.nextAt);

    // Alternate the two tones across the on-window.
    const steps = Math.round(ON_SECONDS / STEP_SECONDS);
    for (let i = 0; i < steps; i++) {
      osc.frequency.setValueAtTime(i % 2 === 0 ? TONE_A : TONE_B, start + i * STEP_SECONDS);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(PEAK, start + 0.04);
    gain.gain.setValueAtTime(PEAK, start + ON_SECONDS - 0.06);
    gain.gain.linearRampToValueAtTime(0.0001, start + ON_SECONDS);

    this.nextAt = start + CYCLE_SECONDS;

    // Wake up a little before the next cycle is due, so a late timer still has
    // room to schedule ahead of the audio clock.
    const waitMs = Math.max(50, (this.nextAt - ac.currentTime - 0.3) * 1000);
    this.timer = setTimeout(() => this.scheduleCycle(), waitMs);
  }

  /** Start ringing. No-op without a context — call `ensureContext` first. */
  start(): void {
    if (!this.ac || this.ringing) return;
    this.ringing = true;
    this.pump();
    this.nextAt = 0;
    this.scheduleCycle();
  }

  /** Silence now. Idempotent, and cheap enough for a visibilitychange handler. */
  stop(): void {
    this.ringing = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.ac || !this.gain) return;
    const t = this.ac.currentTime;
    this.gain.gain.cancelScheduledValues(t);
    this.gain.gain.setValueAtTime(Math.max(0.0001, this.gain.gain.value), t);
    this.gain.gain.linearRampToValueAtTime(0.0001, t + 0.04);
  }

  destroy(): void {
    this.stop();
    try {
      this.osc?.stop();
    } catch {
      /* already stopped */
    }
    void this.ac?.close().catch(() => {});
    this.ac = null;
    this.osc = null;
    this.gain = null;
    this.filter = null;
  }
}

/* ── Haptics ───────────────────────────────────────────────────────────────── */

/** The pattern, in ms: buzz, gap, buzz, long gap. One repeat is 3 seconds. */
const VIBRATE_PATTERN = [400, 200, 400, 2000];
const VIBRATE_PERIOD = VIBRATE_PATTERN.reduce((a, b) => a + b, 0);

/**
 * Android only, and deliberately not polyfilled.
 *
 * iOS has no Vibration API and there is no honest way to fake one — the
 * workarounds are all "play a sound that feels like a buzz", which on a screen
 * that is already ringing is just noise. So on iOS this returns a no-op
 * controller and the template says nothing about it.
 */
export function makeHaptics(): { start: () => void; stop: () => void } {
  const supported =
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function" &&
    !/iP(hone|ad|od)/.test(navigator.userAgent);

  if (!supported) return { start: () => {}, stop: () => {} };

  let timer: ReturnType<typeof setInterval> | null = null;

  const buzz = () => {
    // Chrome logs an intervention for every vibrate before a real tap.
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ua && !ua.hasBeenActive) return;
    try {
      navigator.vibrate(VIBRATE_PATTERN);
    } catch {
      /* a browser that advertises vibrate and then throws is not worth chasing */
    }
  };

  return {
    start: () => {
      if (timer !== null) return;
      buzz();
      timer = setInterval(buzz, VIBRATE_PERIOD);
    },
    stop: () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
      try {
        navigator.vibrate(0);
      } catch {
        /* nothing to cancel */
      }
    },
  };
}
