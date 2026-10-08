// "Our Film" — the template's own procedural cues (registered once, on import). Zero audio bytes: oscillators +
// noise + envelopes on the kit's one AudioContext, routed through the kit's SFX bus so the 🔊 chip and "open
// quietly" silence them too. Every cue has a visual twin in its scene (see 03-happy-valentines-day-premium.md).

import { noiseBuffer, registerCue } from "../../../_valentine/kit/premium";

type CueFn = Parameters<typeof registerCue>[1];
type X = Parameters<CueFn>[0];
type Color = "white" | "pink" | "brown";

function env(g: GainNode, t: number, peak: number, a: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function tone(x: X, type: OscillatorType, f: number, t: number, peak: number, a: number, d: number, to?: number) {
  const o = x.c.createOscillator();
  const g = x.c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f * x.k, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to * x.k, t + a + d);
  env(g, t, peak, a, d);
  o.connect(g).connect(x.out);
  o.start(t);
  o.stop(t + a + d + 0.05);
  return o;
}
function noise(x: X, color: Color, t: number, dur: number, peak: number, a: number, ftype: BiquadFilterType, f: number, q = 1) {
  const buf = noiseBuffer(color);
  if (!buf) return null;
  const s = x.c.createBufferSource();
  s.buffer = buf;
  s.loop = dur > 1.9;
  const b = x.c.createBiquadFilter();
  b.type = ftype;
  b.frequency.value = f;
  b.Q.value = q;
  const g = x.c.createGain();
  env(g, t, peak, a, Math.max(0.004, dur - a));
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random() * 1.2);
  s.stop(t + dur + 0.05);
  return b;
}

const CUES: Record<string, CueFn> = {
  /** Film-leader count: 1 kHz, 60 ms (dur stretches the "2"). */
  "film-beep": (x) => {
    tone(x, "sine", 1000, x.t, 0.32, 0.004, x.o.dur ?? 0.07);
  },
  /** Relay clunk + a short whir: the projector lamp comes on. */
  "film-lamp": (x) => {
    tone(x, "sine", 90, x.t, 0.9, 0.004, 0.09, 50);
    noise(x, "white", x.t, 0.05, 0.4, 0.002, "highpass", 2500);
    const b = noise(x, "pink", x.t + 0.06, 0.9, 0.25, 0.25, "bandpass", 400, 2);
    b?.frequency.exponentialRampToValueAtTime(900, x.t + 0.9);
    return 0.06;
  },
  /** Title card: a reversed-cymbal pre-swell into a low boom. The boom lands at peakIn. */
  "film-title": (x) => {
    const b = noise(x, "white", x.t, 0.62, 0.22, 0.6, "highpass", 1500, 0.7);
    b?.frequency.exponentialRampToValueAtTime(9000, x.t + 0.6);
    tone(x, "sine", 55, x.t + 0.6, 0.85, 0.03, 0.9, 42);
    tone(x, "triangle", 110, x.t + 0.6, 0.12, 0.02, 0.5);
    return 0.6;
  },
  /** A shutter click for each "Previously on…" frame. */
  "film-flick": (x) => {
    noise(x, "white", x.t, 0.012, 0.5, 0.001, "bandpass", 5000, 1.4);
    noise(x, "white", x.t + 0.035, 0.01, 0.3, 0.001, "bandpass", 3800, 1.4);
  },
  /** A small FM bell; pass detune in cents to walk up the scale. */
  "film-star": (x) => {
    const f = 523.25 * x.k;
    const car = x.c.createOscillator();
    const mod = x.c.createOscillator();
    const mg = x.c.createGain();
    const g = x.c.createGain();
    car.frequency.value = f;
    mod.frequency.value = f * 3.5;
    mg.gain.setValueAtTime(f * 1.6, x.t);
    mg.gain.exponentialRampToValueAtTime(1, x.t + 0.9);
    mod.connect(mg).connect(car.frequency);
    env(g, x.t, 0.28, 0.004, 1.5);
    car.connect(g).connect(x.out);
    [car, mod].forEach((o) => { o.start(x.t); o.stop(x.t + 1.6); });
  },
  /** The constellation becomes their initials: 20 sparkle blips over a soft pad. */
  "film-morph": (x) => {
    for (let i = 0; i < 20; i++) tone(x, "sine", 1800 + Math.random() * 3600, x.t + i * 0.06 + Math.random() * 0.04, 0.07, 0.003, 0.22);
    [523.25, 659.25, 783.99].forEach((f) => tone(x, "sine", f, x.t, 0.07, 0.5, 1.8));
  },
  /** The one film-burn cut: random crackle impulses under an envelope. */
  "film-burn": (x) => {
    for (let i = 0; i < 26; i++) noise(x, "white", x.t + Math.random() * 0.7, 0.008 + Math.random() * 0.01, 0.2 + Math.random() * 0.35, 0.001, "highpass", 1200 + Math.random() * 3000);
    noise(x, "brown", x.t, 0.8, 0.3, 0.05, "lowpass", 600);
  },
  /** Hold to freeze: the projector whir sags to half speed. */
  "film-stop": (x) => {
    tone(x, "sawtooth", 48, x.t, 0.06, 0.01, 0.26, 24);
    const b = noise(x, "pink", x.t, 0.28, 0.18, 0.01, "bandpass", 420, 2);
    b?.frequency.exponentialRampToValueAtTime(200, x.t + 0.26);
  },
  /** A slot-reel digit step (4 kHz click). */
  "film-tick": (x) => {
    noise(x, "white", x.t, 0.008, 0.28, 0.001, "bandpass", 4000, 2);
  },
  /** The last digit lands. */
  "film-clack": (x) => {
    tone(x, "sine", 300, x.t, 0.5, 0.002, 0.03, 220);
    noise(x, "white", x.t, 0.01, 0.3, 0.001, "bandpass", 2500, 1.5);
  },
  /** A stat card settles: triangle ding. */
  "film-ding": (x) => {
    tone(x, "triangle", 1318.5, x.t, 0.2, 0.003, 0.8);
    tone(x, "sine", 2637, x.t, 0.04, 0.003, 0.4);
  },
  /** The spotlight: a big-lamp thunk and a mains hum. */
  "film-spot": (x) => {
    tone(x, "sine", 70, x.t, 0.8, 0.004, 0.35, 45);
    tone(x, "sine", 50, x.t + 0.05, 0.08, 0.2, 1.0);
    tone(x, "sine", 100, x.t + 0.05, 0.05, 0.2, 1.0);
  },
  /** CUT! A clapperboard (two sharp claps) and a falling "womp". */
  "film-clap": (x) => {
    noise(x, "white", x.t, 0.016, 0.9, 0.001, "highpass", 1500);
    noise(x, "white", x.t + 0.028, 0.016, 0.7, 0.001, "highpass", 1500);
    tone(x, "sine", 300, x.t + 0.12, 0.3, 0.02, 0.5, 150);
  },
  /** A firework launch whistle (bandpass rising). */
  "film-launch": (x) => {
    const b = noise(x, "white", x.t, 0.8, 0.22, 0.08, "bandpass", 400, 8);
    b?.frequency.exponentialRampToValueAtTime(2500, x.t + 0.8);
    return 0.8;
  },
  /** A firework burst: a thump plus a crackle tail. */
  "film-burst": (x) => {
    noise(x, "white", x.t, 0.65, 0.7, 0.005, "lowpass", 2000);
    tone(x, "sine", 80, x.t, 0.5, 0.004, 0.4, 40);
    for (let i = 0; i < 40; i++) noise(x, "white", x.t + 0.25 + Math.random() * 1.4, 0.006, 0.12 + Math.random() * 0.15, 0.001, "highpass", 3000 + Math.random() * 3000);
  },
  /** The colour comes back: a big major chord swell. */
  "film-swell": (x) => {
    [261.63, 329.63, 392, 523.25, 659.25].forEach((f, i) => {
      tone(x, "sawtooth", f, x.t, 0.035, 0.6, 2.4);
      tone(x, "sine", f, x.t, 0.06 - i * 0.006, 0.4, 2.8);
    });
  },
  /** The colour wipe itself: a lowpass whoosh, 300 Hz → 8 kHz. */
  "film-wipe": (x) => {
    const b = noise(x, "white", x.t, 0.9, 0.45, 0.3, "lowpass", 300, 0.8);
    b?.frequency.exponentialRampToValueAtTime(8000, x.t + 0.8);
  },
  /** Post-credits sting after the silence: C5 + G5. */
  "film-post": (x) => {
    tone(x, "sine", 523.25, x.t, 0.25, 0.01, 1.8);
    tone(x, "sine", 783.99, x.t, 0.18, 0.01, 1.8);
  },
  /** A pen signing: bandpassed noise at 3 kHz, three strokes. */
  "film-pen": (x) => {
    const n = x.o.count ?? 3;
    for (let i = 0; i < n; i++) noise(x, "white", x.t + i * 0.28, 0.18 + Math.random() * 0.1, 0.18, 0.03, "bandpass", 2600 + Math.random() * 900, 3);
  },
};

let done = false;
/** Register once (idempotent) — call from the Experience's module scope. */
export function registerFilmCues() {
  if (done) return;
  done = true;
  for (const [id, fn] of Object.entries(CUES)) registerCue(id, fn);
}

export type FilmCue = keyof typeof CUES;
