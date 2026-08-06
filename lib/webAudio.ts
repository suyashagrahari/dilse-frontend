// ─── Synthesised UI sound ────────────────────────────────────────────────────
//
// Three of the templates need mechanical/physical sound, and none of them ship
// an audio file — every voice here is generated with the Web Audio API. That
// keeps the payload at zero bytes and lets a sound be parameterised (the catch
// blip rises in pitch across a streak, which a fixed sample cannot do).
//
// Two rules the browser enforces, both handled here:
//
//   1. An AudioContext created before a user gesture starts `suspended` and
//      autoplay policy keeps it there. `unlockAudio()` must be called from
//      inside a real gesture handler (the intro tap), not on mount.
//   2. Nothing should play before the user has opted in. The bus starts MUTED;
//      call `setMuted(false)` from the unmute control.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = true;

type Ctor = typeof AudioContext;
const getCtor = (): Ctor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
};

/**
 * Create (or resume) the context. MUST be called from a user gesture handler.
 * Safe to call repeatedly.
 */
export function unlockAudio(): void {
  const Ctor = getCtor();
  if (!Ctor) return;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (master && ctx) master.gain.setTargetAtTime(next ? 0 : 1, ctx.currentTime, 0.01);
}

export const isMuted = (): boolean => muted;
export const isAudioReady = (): boolean => ctx !== null;

/** Internal: only proceed when there is a live, unmuted bus to play into. */
function bus(): { ac: AudioContext; out: GainNode } | null {
  if (!ctx || !master || muted || ctx.state !== "running") return null;
  return { ac: ctx, out: master };
}

/** A short reusable white-noise buffer — the basis of every impact sound. */
let noiseBuf: AudioBuffer | null = null;
function noise(ac: AudioContext): AudioBuffer {
  if (noiseBuf && noiseBuf.sampleRate === ac.sampleRate) return noiseBuf;
  const len = Math.floor(ac.sampleRate * 0.5);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuf = buf;
  return buf;
}

/** A pitched blip. The general-purpose voice. */
export function tone(opts: {
  freq: number;
  /** Slide to this frequency across the note. Omit for a flat tone. */
  toFreq?: number;
  ms: number;
  type?: OscillatorType;
  gain?: number;
  /** Seconds to wait before it sounds. */
  delay?: number;
}): void {
  const b = bus();
  if (!b) return;
  const { ac, out } = b;
  const t0 = ac.currentTime + (opts.delay ?? 0);
  const dur = opts.ms / 1000;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = opts.type ?? "triangle";
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.toFreq !== undefined) osc.frequency.linearRampToValueAtTime(opts.toFreq, t0 + dur);
  const peak = opts.gain ?? 0.2;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** A filtered noise burst. Impacts, thunks, slides, rattles. */
export function burst(opts: {
  ms: number;
  /** Lowpass cutoff. Low = heavy and dull; high = papery. */
  cutoff: number;
  /** Sweep the cutoff to here across the burst. */
  toCutoff?: number;
  gain?: number;
  /** Seconds of attack. 0 = hard, percussive. */
  attack?: number;
  delay?: number;
}): void {
  const b = bus();
  if (!b) return;
  const { ac, out } = b;
  const t0 = ac.currentTime + (opts.delay ?? 0);
  const dur = opts.ms / 1000;
  const src = ac.createBufferSource();
  src.buffer = noise(ac);
  const filt = ac.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.setValueAtTime(opts.cutoff, t0);
  if (opts.toCutoff !== undefined) filt.frequency.linearRampToValueAtTime(opts.toCutoff, t0 + dur);
  const g = ac.createGain();
  const peak = opts.gain ?? 0.3;
  const atk = opts.attack ?? 0;
  g.gain.setValueAtTime(0.0001, t0);
  if (atk > 0) g.gain.linearRampToValueAtTime(peak, t0 + atk);
  else g.gain.setValueAtTime(peak, t0 + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt).connect(g).connect(out);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/**
 * A sustained motor. Returns a stop function.
 *
 * The LFO on the pitch is the point: a perfectly steady tone reads as a
 * synthesiser, a wavering one reads as a machine with a worn bearing.
 */
export function motor(opts?: { freq?: number; gain?: number }): () => void {
  const b = bus();
  if (!b) return () => {};
  const { ac, out } = b;
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  const filt = ac.createBiquadFilter();
  const g = ac.createGain();

  osc.type = "sawtooth";
  osc.frequency.value = opts?.freq ?? 80;
  lfo.type = "sine";
  lfo.frequency.value = 7;
  lfoGain.gain.value = 5; // ± 5 Hz wobble
  lfo.connect(lfoGain).connect(osc.frequency);

  filt.type = "lowpass";
  filt.frequency.value = 340;

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts?.gain ?? 0.14, t0 + 0.05);

  osc.connect(filt).connect(g).connect(out);
  osc.start(t0);
  lfo.start(t0);

  return () => {
    const t = ac.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.stop(t + 0.12);
    lfo.stop(t + 0.12);
  };
}

/** An ascending arpeggio — the "you finished it" voice. */
export function arpeggio(semitones: number[] = [0, 4, 7, 12], root = 440, stepMs = 90): void {
  semitones.forEach((s, i) => {
    tone({
      freq: root * Math.pow(2, s / 12),
      ms: 180,
      type: "triangle",
      gain: 0.16,
      delay: (i * stepMs) / 1000,
    });
  });
}

// ─── Named voices ────────────────────────────────────────────────────────────
// Templates should call these rather than hand-tuning `tone`/`burst` inline, so
// the same physical event sounds the same everywhere.

/** A physical keypad press. */
export const sfxKeyClick = () => tone({ freq: 1200, ms: 40, type: "square", gain: 0.1 });

/** Two metallic clinks — a coin going in. */
export const sfxCoin = () => {
  tone({ freq: 800, ms: 90, type: "triangle", gain: 0.18 });
  tone({ freq: 1100, ms: 90, type: "triangle", gain: 0.18, delay: 0.18 });
};

/** The impact. Heavy, dull, hard attack — the single most important sound. */
export const sfxThunk = () => burst({ ms: 120, cutoff: 200, gain: 0.5, attack: 0 });

/** Loose metal shaking. */
export const sfxRattle = () => {
  for (let i = 0; i < 3; i++) burst({ ms: 60, cutoff: 900, gain: 0.22, delay: i * 0.06 });
};

/** Rejection. */
export const sfxBuzzer = () => tone({ freq: 180, ms: 250, type: "square", gain: 0.16 });

/** Card/paper sliding across a surface. */
export const sfxPaperSlide = () => burst({ ms: 100, cutoff: 1500, gain: 0.16, attack: 0.02 });

/** A card turning over. */
export const sfxFlip = () => burst({ ms: 140, cutoff: 400, toCutoff: 2000, gain: 0.18, attack: 0.01 });

/** A rubber stamp landing. */
export const sfxStamp = () => burst({ ms: 70, cutoff: 300, gain: 0.4, attack: 0 });

/**
 * A catch. `streak` raises the pitch up to +4 semitones so a run of catches
 * sounds like a melody rather than a repeated beep.
 */
export const sfxCatch = (streak = 0) => {
  const semis = Math.min(streak, 4);
  const mul = Math.pow(2, semis / 12);
  tone({ freq: 660 * mul, toFreq: 990 * mul, ms: 60, type: "triangle", gain: 0.18 });
};

/** Taking a hit. */
export const sfxHit = () => burst({ ms: 90, cutoff: 250, gain: 0.34, attack: 0 });
