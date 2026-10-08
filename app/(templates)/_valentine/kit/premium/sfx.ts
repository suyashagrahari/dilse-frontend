// ─── The SFX bank: procedural cues, zero audio bytes, no licences ────────────
//
//   import { sfx } from "../../_valentine/kit/premium";
//   sfx("chime");                                  // one-shot
//   sfx("whoosh", { gain: 0.7, pan: -0.4 });       // quieter, from the left
//   const rain = sfx("rain-bed");  …  rain.stop(1200);   // beds loop until stopped
//
// Every cue is noise + oscillators + envelopes on the page's one AudioContext
// (./audio.ts), routed through the SFX bus (or the beds bus for loops) so the
// global mute silences everything at once. Nothing plays before the gate's
// tap or while muted (sfx() returns a no-op handle). Templates may add local
// cues with registerCue(id, fn) — keep each one ≤ 40 lines.
//
// Every cue needs a VISUAL twin in the scene: no information is sound-only.

import { getAudioContext, getBedBus, getSfxBus, noiseBuffer, soundOn, audioSnapshot, type NoiseColor } from "./audio";

export type CueId =
  | "whoosh" | "swoosh-soft" | "chime" | "chime-cascade" | "sparkle" | "paper-rustle" | "page-turn"
  | "heartbeat" | "knock" | "creak" | "thunder" | "rain-bed" | "wind-bed" | "ambient-pad" | "bubble" | "pop"
  | "snap" | "organ-chord" | "bell-toll" | "riser" | "impact-boom" | "tick" | "match-strike"
  | "flame-whoosh" | "static" | "projector-loop" | "glass-ping" | "nib-scratch" | "plush-squeak"
  | "ribbon" | "firework" | "wax-crack" | "kiss" | "key";

export interface CueOptions {
  /** 0–2, multiplies the cue's own level (default 1). */
  gain?: number;
  /** -1 (left) … 1 (right). */
  pan?: number;
  /** Cents (±1200 = an octave). Use small random values so repeats don't sound robotic. */
  detune?: number;
  /** Seconds from now. */
  at?: number;
  /** Cue-specific length in seconds (riser, static, organ-chord…). */
  dur?: number;
  /** organ-chord: "minor" (default) or "major". */
  chord?: "minor" | "major";
  /** One-shots that can repeat (knock, bubble, heartbeat): how many. */
  count?: number;
}

export interface CueHandle {
  /** Fade out and stop (beds loop until this is called). */
  stop: (fadeMs?: number) => void;
  /** Seconds from the call until the cue's peak (riser: when to cut to the drop). */
  peakIn: number;
}

interface CueCtx {
  c: AudioContext;
  out: AudioNode;
  t: number;
  o: CueOptions;
  /** Detune multiplier from o.detune. */
  k: number;
  /** Register a node to stop on handle.stop(). */
  keep: (n: AudioScheduledSourceNode) => void;
}

type CueFn = (x: CueCtx) => number | void;

// ─── Building blocks ─────────────────────────────────────────────────────────

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(x: CueCtx, type: OscillatorType, f: number, t: number, peak: number, attack: number, decay: number, glideTo?: number, glideT?: number) {
  const o = x.c.createOscillator();
  const g = x.c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f * x.k, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo * x.k, t + (glideT ?? attack + decay));
  env(g, t, peak, attack, decay);
  o.connect(g).connect(x.out);
  o.start(t);
  o.stop(t + attack + decay + 0.05);
  return o;
}

function noiseSrc(x: CueCtx, color: NoiseColor, t: number, dur: number, loop = false) {
  const s = x.c.createBufferSource();
  s.buffer = noiseBuffer(color);
  s.loop = loop || dur > 1.9;
  s.start(t, Math.random() * 1.5);
  if (!loop) s.stop(t + dur + 0.05);
  else x.keep(s);
  return s;
}

function filter(x: CueCtx, type: BiquadFilterType, f: number, q = 1) {
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  return b;
}

/** A filtered noise burst with an envelope. */
function burst(x: CueCtx, color: NoiseColor, t: number, peak: number, attack: number, decay: number, ftype: BiquadFilterType, f: number, q = 1) {
  const s = noiseSrc(x, color, t, attack + decay);
  const b = filter(x, ftype, f, q);
  const g = x.c.createGain();
  env(g, t, peak, attack, decay);
  s.connect(b).connect(g).connect(x.out);
  return b;
}

/** A looping bed: noise → filter → gain (fades in). */
function bed(x: CueCtx, color: NoiseColor, ftype: BiquadFilterType, f: number, q: number, level: number) {
  const s = noiseSrc(x, color, x.t, 0, true);
  const b = filter(x, ftype, f, q);
  const g = x.c.createGain();
  g.gain.setValueAtTime(0.0001, x.t);
  g.gain.linearRampToValueAtTime(level, x.t + 1.2);
  s.connect(b).connect(g).connect(x.out);
  return { s, b, g };
}

function lfo(x: CueCtx, rate: number, depth: number, target: AudioParam, type: OscillatorType = "sine") {
  const l = x.c.createOscillator();
  const g = x.c.createGain();
  l.type = type;
  l.frequency.value = rate;
  g.gain.value = depth;
  l.connect(g).connect(target);
  l.start(x.t);
  x.keep(l);
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

// ─── The cues ────────────────────────────────────────────────────────────────

const CUES: Record<string, CueFn> = {
  whoosh: (x) => {
    const b = burst(x, "white", x.t, 0.7, 0.18, 0.45, "bandpass", 300, 1.2);
    b.frequency.setValueAtTime(300, x.t);
    b.frequency.exponentialRampToValueAtTime(3200, x.t + 0.25);
    b.frequency.exponentialRampToValueAtTime(600, x.t + 0.6);
    return 0.2;
  },
  "swoosh-soft": (x) => {
    const b = burst(x, "pink", x.t, 0.45, 0.2, 0.4, "lowpass", 400, 0.7);
    b.frequency.exponentialRampToValueAtTime(1600, x.t + 0.5);
    return 0.2;
  },
  chime: (x) => {
    const f = midi(88);
    tone(x, "sine", f, x.t, 0.32, 0.005, 1.6);
    tone(x, "sine", f * 2.76, x.t, 0.08, 0.005, 0.9);
    tone(x, "sine", f * 5.4, x.t, 0.03, 0.005, 0.5);
  },
  "chime-cascade": (x) => {
    [76, 79, 81, 83, 86, 88].forEach((n, i) => {
      const t = x.t + i * 0.085;
      tone(x, "sine", midi(n), t, 0.2, 0.005, 1.4);
      tone(x, "sine", midi(n) * 2.76, t, 0.05, 0.005, 0.6);
    });
    return 0.45;
  },
  sparkle: (x) => {
    for (let i = 0; i < 7; i++) tone(x, "sine", 2200 + Math.random() * 3000, x.t + i * 0.05 + Math.random() * 0.03, 0.09, 0.003, 0.18);
  },
  "paper-rustle": (x) => {
    for (let i = 0; i < 6; i++) burst(x, "white", x.t + i * 0.05 + Math.random() * 0.03, 0.25 + Math.random() * 0.2, 0.005, 0.05, "highpass", 2500 + Math.random() * 2000, 0.8);
  },
  "page-turn": (x) => {
    const b = burst(x, "white", x.t, 0.35, 0.04, 0.25, "bandpass", 1200, 0.9);
    b.frequency.exponentialRampToValueAtTime(4200, x.t + 0.25);
    burst(x, "brown", x.t + 0.22, 0.4, 0.005, 0.12, "lowpass", 300);
  },
  heartbeat: (x) => {
    const n = x.o.count ?? 1;
    for (let i = 0; i < n; i++) {
      const t = x.t + i * 0.85;
      tone(x, "sine", 62, t, 0.9, 0.01, 0.16, 40, 0.16);
      tone(x, "sine", 55, t + 0.2, 0.6, 0.01, 0.18, 36, 0.18);
    }
  },
  knock: (x) => {
    const n = x.o.count ?? 3;
    for (let i = 0; i < n; i++) {
      const t = x.t + i * 0.19;
      burst(x, "brown", t, 0.9, 0.002, 0.09, "bandpass", 320, 2.2);
      tone(x, "sine", 130, t, 0.4, 0.002, 0.08, 90);
    }
  },
  creak: (x) => {
    const dur = x.o.dur ?? 1.3;
    const o = x.c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(70 * x.k, x.t);
    o.frequency.linearRampToValueAtTime(120 * x.k, x.t + dur);
    const b = filter(x, "bandpass", 900, 9);
    const g = x.c.createGain();
    env(g, x.t, 0.35, 0.15, dur);
    lfo(x, 11, 18, o.frequency, "square");
    o.connect(b).connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + dur + 0.3);
  },
  thunder: (x) => {
    burst(x, "white", x.t, 0.9, 0.002, 0.25, "highpass", 1200);
    const r = noiseSrc(x, "brown", x.t + 0.25, 3.4);
    const b = filter(x, "lowpass", 140, 0.8);
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t + 0.25);
    g.gain.linearRampToValueAtTime(0.9, x.t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + 3.6);
    r.connect(b).connect(g).connect(x.out);
    return 0;
  },
  "rain-bed": (x) => {
    bed(x, "pink", "highpass", 900, 0.5, 0.35);
    bed(x, "white", "bandpass", 5000, 0.6, 0.06);
  },
  "wind-bed": (x) => {
    const { b } = bed(x, "brown", "bandpass", 420, 1.4, 0.5);
    lfo(x, 0.09, 220, b.frequency);
  },
  "ambient-pad": (x) => {
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.12, x.t + 2.5);
    const lp = filter(x, "lowpass", 1100, 0.5);
    g.connect(lp).connect(x.out);
    [57, 64, 69, 73].forEach((n) => {
      const o = x.c.createOscillator();
      o.type = "triangle";
      o.frequency.value = midi(n) * x.k;
      o.detune.value = (Math.random() - 0.5) * 12;
      o.connect(g);
      o.start(x.t);
      x.keep(o);
    });
  },
  bubble: (x) => {
    const n = x.o.count ?? 1;
    for (let i = 0; i < n; i++) tone(x, "sine", 280 + Math.random() * 120, x.t + i * 0.09, 0.3, 0.004, 0.09, 900 + Math.random() * 300, 0.08);
  },
  pop: (x) => {
    tone(x, "sine", 620, x.t, 0.5, 0.002, 0.07, 180, 0.06);
    burst(x, "white", x.t, 0.2, 0.001, 0.02, "highpass", 2000);
  },
  snap: (x) => {
    burst(x, "white", x.t, 0.8, 0.001, 0.035, "highpass", 3000);
  },
  "organ-chord": (x) => {
    const dur = x.o.dur ?? 2.2;
    const notes = x.o.chord === "major" ? [48, 55, 60, 64, 67] : [45, 52, 57, 60, 64];
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.16, x.t + 0.25);
    g.gain.setValueAtTime(0.16, x.t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + dur + 1.2);
    g.connect(x.out);
    for (const n of notes) {
      for (const h of [1, 2, 3]) {
        const o = x.c.createOscillator();
        o.type = "sine";
        o.frequency.value = midi(n) * h * x.k;
        const hg = x.c.createGain();
        hg.gain.value = 1 / (h * 1.6);
        o.connect(hg).connect(g);
        o.start(x.t);
        o.stop(x.t + dur + 1.3);
      }
    }
    return 0.25;
  },
  "bell-toll": (x) => {
    const f = 196;
    [0.56, 0.92, 1.19, 1.71, 2, 2.74, 3, 3.76].forEach((r, i) => tone(x, "sine", f * r, x.t, 0.22 / (i + 1), 0.004, 4 - i * 0.35));
  },
  riser: (x) => {
    const dur = x.o.dur ?? 1.2;
    const b = burst(x, "white", x.t, 0.5, dur, 0.15, "bandpass", 200, 1.5);
    b.frequency.exponentialRampToValueAtTime(6000, x.t + dur);
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(180 * x.k, x.t);
    o.frequency.exponentialRampToValueAtTime(1200 * x.k, x.t + dur);
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.exponentialRampToValueAtTime(0.08, x.t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + dur + 0.12);
    o.connect(filter(x, "lowpass", 2400)).connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + dur + 0.2);
    return dur;
  },
  "impact-boom": (x) => {
    tone(x, "sine", 85, x.t, 1, 0.005, 0.8, 32, 0.7);
    burst(x, "brown", x.t, 0.8, 0.003, 0.5, "lowpass", 400);
  },
  tick: (x) => {
    tone(x, "square", 2400, x.t, 0.12, 0.001, 0.015);
    burst(x, "white", x.t, 0.15, 0.001, 0.01, "highpass", 4000);
  },
  "match-strike": (x) => {
    for (let i = 0; i < 4; i++) burst(x, "white", x.t + i * 0.03, 0.4, 0.002, 0.04, "highpass", 3000 + i * 300);
    const b = burst(x, "brown", x.t + 0.12, 0.6, 0.08, 0.6, "lowpass", 300);
    b.frequency.exponentialRampToValueAtTime(1400, x.t + 0.5);
    return 0.15;
  },
  "flame-whoosh": (x) => {
    const b = burst(x, "brown", x.t, 0.8, 0.15, 0.7, "lowpass", 200, 0.8);
    b.frequency.exponentialRampToValueAtTime(1300, x.t + 0.45);
    return 0.15;
  },
  static: (x) => {
    const dur = x.o.dur ?? 0.7;
    const s = noiseSrc(x, "white", x.t, dur);
    const b = filter(x, "bandpass", 2600, 0.7);
    const g = x.c.createGain();
    env(g, x.t, 0.3, 0.02, dur);
    lfo(x, 37, 0.25, g.gain, "square");
    s.connect(b).connect(g).connect(x.out);
  },
  "projector-loop": (x) => {
    const { g } = bed(x, "white", "bandpass", 1800, 1.2, 0.18);
    lfo(x, 18, 0.12, g.gain, "square");
    bed(x, "brown", "lowpass", 160, 0.7, 0.25);
  },
  "glass-ping": (x) => {
    const o = tone(x, "sine", 2093, x.t, 0.25, 0.002, 1.3);
    lfo(x, 6, 6, o.frequency);
    tone(x, "sine", 2093 * 2.32, x.t, 0.05, 0.002, 0.6);
  },
  "nib-scratch": (x) => {
    const dur = x.o.dur ?? 0.55;
    const s = noiseSrc(x, "white", x.t, dur);
    const b = filter(x, "bandpass", 3600, 3);
    const g = x.c.createGain();
    env(g, x.t, 0.22, 0.03, dur);
    lfo(x, 23, 0.12, g.gain, "sawtooth");
    s.connect(b).connect(g).connect(x.out);
  },
  "plush-squeak": (x) => {
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(820 * x.k, x.t);
    o.frequency.exponentialRampToValueAtTime(1350 * x.k, x.t + 0.1);
    o.frequency.exponentialRampToValueAtTime(980 * x.k, x.t + 0.26);
    env(g, x.t, 0.22, 0.02, 0.26);
    lfo(x, 28, 30, o.frequency);
    o.connect(filter(x, "lowpass", 2600)).connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + 0.35);
  },
  ribbon: (x) => {
    const b = burst(x, "white", x.t, 0.35, 0.03, 0.32, "bandpass", 2400, 2);
    b.frequency.exponentialRampToValueAtTime(700, x.t + 0.33);
  },
  firework: (x) => {
    tone(x, "sine", 700, x.t, 0.07, 0.05, 0.6, 2200, 0.6);
    const pop = x.t + 0.7;
    burst(x, "brown", pop, 0.9, 0.003, 0.6, "lowpass", 500);
    for (let i = 0; i < 18; i++) burst(x, "white", pop + 0.05 + Math.random() * 0.9, 0.12 + Math.random() * 0.15, 0.001, 0.025, "highpass", 3000 + Math.random() * 3000);
    return 0.7;
  },
  "wax-crack": (x) => {
    burst(x, "white", x.t, 0.7, 0.001, 0.05, "bandpass", 2400, 1.5);
    burst(x, "white", x.t + 0.06, 0.4, 0.001, 0.04, "bandpass", 1800, 1.5);
    tone(x, "sine", 110, x.t + 0.02, 0.45, 0.004, 0.2, 70);
  },
  kiss: (x) => {
    burst(x, "white", x.t, 0.3, 0.004, 0.05, "bandpass", 1600, 2);
    tone(x, "sine", 900, x.t + 0.03, 0.25, 0.003, 0.06, 1500, 0.05);
  },
  key: (x) => {
    burst(x, "white", x.t, 0.35, 0.001, 0.03, "bandpass", 2800, 1.2);
    tone(x, "square", 180, x.t, 0.06, 0.001, 0.03);
  },
};

/** Beds loop until stopped and go through the beds bus. */
const BEDS = new Set<string>(["rain-bed", "wind-bed", "projector-loop", "ambient-pad"]);

export const CUE_IDS = Object.keys(CUES) as CueId[];

/** Add a template-local cue (or override one) — keep the template's own cues in its folder. */
export function registerCue(id: string, fn: CueFn, opts: { bed?: boolean } = {}) {
  CUES[id] = fn;
  if (opts.bed) BEDS.add(id);
}

const NOOP: CueHandle = { stop: () => {}, peakIn: 0 };

/** Play a cue. Silent (no-op handle) before the gate tap, while muted, or on a "no music" page. */
export function sfx(id: CueId | (string & {}), o: CueOptions = {}): CueHandle {
  if (!audioSnapshot().unlocked || !soundOn()) return NOOP;
  const c = getAudioContext();
  const fn = CUES[id];
  if (!c || !fn || c.state === "closed") return NOOP;
  const isBed = BEDS.has(id);
  const bus = isBed ? getBedBus() : getSfxBus();
  if (!bus) return NOOP;
  const out = c.createGain();
  out.gain.value = Math.max(0, Math.min(2, o.gain ?? 1));
  let node: AudioNode = out;
  if (o.pan && typeof c.createStereoPanner === "function") {
    const p = c.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, o.pan));
    out.connect(p);
    node = p;
  }
  node.connect(bus);
  const kept: AudioScheduledSourceNode[] = [];
  const t = c.currentTime + Math.max(0, o.at ?? 0) + 0.005;
  let peak = 0;
  try {
    const r = fn({ c, out, t, o, k: Math.pow(2, (o.detune ?? 0) / 1200), keep: (n) => kept.push(n) });
    peak = (typeof r === "number" ? r : 0) + (o.at ?? 0);
  } catch {
    return NOOP;
  }
  let stopped = false;
  const stop = (fadeMs = 400) => {
    if (stopped) return;
    stopped = true;
    const now = c.currentTime;
    out.gain.cancelScheduledValues(now);
    out.gain.setValueAtTime(out.gain.value, now);
    out.gain.linearRampToValueAtTime(0.0001, now + fadeMs / 1000);
    window.setTimeout(() => {
      kept.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        node.disconnect();
      } catch {
        /* ignore */
      }
    }, fadeMs + 60);
  };
  if (!isBed) window.setTimeout(() => stop(50), 8000);
  return { stop, peakIn: peak };
}
