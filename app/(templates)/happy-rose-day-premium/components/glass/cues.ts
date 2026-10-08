// "The Glasshouse Rose" — the template's own procedural cues (registered once, on import). Zero audio bytes; kit
// SFX/beds buses, so the 🔊 chip and "open quietly" silence them. Each has a visual twin in its scene.

import { noiseBuffer, registerCue } from "../../../_valentine/kit/premium";

type CueFn = Parameters<typeof registerCue>[1];
type X = Parameters<CueFn>[0];

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
function noise(x: X, color: "white" | "pink" | "brown", t: number, dur: number, peak: number, a: number, ftype: BiquadFilterType, f: number, q = 1) {
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
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];

const CUES: Record<string, CueFn> = {
  /** Wiping fogged glass: a short bandpassed squeak grain (pitch via detune). */
  "gh-squeak": (x) => {
    const o = x.c.createOscillator();
    const b = x.c.createBiquadFilter();
    const g = x.c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(900 * x.k, x.t);
    o.frequency.linearRampToValueAtTime(1300 * x.k, x.t + 0.04);
    b.type = "bandpass";
    b.frequency.value = 1100 * x.k;
    b.Q.value = 8;
    env(g, x.t, 0.06, 0.006, 0.04);
    o.connect(b).connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + 0.06);
  },
  /** The glasshouse door opens: a low creak with a slow wobble. */
  "gh-door": (x) => {
    const o = tone(x, "sawtooth", 110, x.t, 0.06, 0.1, 0.8, 92);
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 6;
    lg.gain.value = 12;
    l.connect(lg).connect(o.frequency);
    l.start(x.t);
    l.stop(x.t + 1);
    const lp = noise(x, "pink", x.t, 0.9, 0.08, 0.2, "lowpass", 800);
    lp?.frequency.setValueAtTime(800, x.t);
  },
  /** The glasshouse at dusk (bed): a low hush and the odd cricket. */
  "gh-amb": (x) => {
    const s = x.c.createBufferSource();
    s.buffer = noiseBuffer("pink");
    s.loop = true;
    const lp = x.c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 400;
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.18, x.t + 2);
    s.connect(lp).connect(g).connect(x.out);
    s.start(x.t);
    x.keep(s);
    for (let k = 0; k < 16; k++) {
      const at = x.t + 3 + k * (3 + Math.random() * 4);
      for (let p = 0; p < 3; p++) {
        const o = x.c.createOscillator();
        const og = x.c.createGain();
        o.frequency.value = 4200;
        env(og, at + p * 0.05, 0.03, 0.003, 0.012);
        o.connect(og).connect(x.out);
        o.start(at + p * 0.05);
        o.stop(at + p * 0.05 + 0.03);
        x.keep(o);
      }
    }
  },
  /** A thorn snaps off. */
  "gh-snap": (x) => {
    noise(x, "white", x.t, 0.006, 0.6, 0.0005, "highpass", 3000);
    tone(x, "sine", 2200, x.t, 0.12, 0.002, 0.04);
  },
  /** …and lands: a small bright ping (detune for variety). */
  "gh-ping": (x) => {
    tone(x, "sine", 3100, x.t, 0.14, 0.002, 0.35);
    tone(x, "sine", 3100 * 2.76, x.t, 0.03, 0.002, 0.2);
  },
  /** The line rewrites in gold: C6-E6-G6. */
  "gh-gold": (x) => {
    [1046.5, 1318.5, 1568].forEach((f, i) => tone(x, "sine", f, x.t + i * 0.09, 0.12, 0.004, 0.6));
  },
  /** The bud swells while they hold (dur = the hold). */
  "gh-swell": (x) => {
    const d = x.o.dur ?? 1.2;
    const b = noise(x, "pink", x.t, d + 0.2, 0.25, d * 0.8, "lowpass", 300);
    b?.frequency.exponentialRampToValueAtTime(2400, x.t + d);
  },
  /** One rose of the garden blooms: a pentatonic bell (count = step up the scale). */
  "gh-bloom": (x) => {
    const st = PENTA[Math.min(PENTA.length - 1, x.o.count ?? 0)] + (Math.random() - 0.5) * 0.06;
    const f = 523.25 * Math.pow(2, st / 12);
    tone(x, "sine", f, x.t, 0.13, 0.004, 1.1);
    tone(x, "triangle", f * 2, x.t, 0.03, 0.004, 0.5);
  },
  /** A burst of petals. */
  "gh-burst": (x) => {
    noise(x, "white", x.t, 0.25, 0.35, 0.01, "bandpass", 1500, 0.9);
  },
  /** A petal drifts in. */
  "gh-whoosh": (x) => {
    const b = noise(x, "pink", x.t, 0.4, 0.12, 0.15, "bandpass", 600, 1.4);
    b?.frequency.exponentialRampToValueAtTime(200, x.t + 0.4);
  },
  /** A petal caught (count = the word's index → a melody note). */
  "gh-catch": (x) => {
    const st = PENTA[Math.min(PENTA.length - 1, x.o.count ?? 0)];
    tone(x, "sine", 520 * Math.pow(2, st / 12), x.t, 0.2, 0.004, 0.09, 1040 * Math.pow(2, st / 12));
  },
  /** The book lands, its pages riffle. */
  "gh-book": (x) => {
    tone(x, "sine", 70, x.t, 0.7, 0.004, 0.13, 50);
    noise(x, "white", x.t, 0.01, 0.3, 0.001, "highpass", 2000);
    for (let i = 0; i < 6; i++) noise(x, "white", x.t + 0.2 + i * 0.045, 0.03, 0.14, 0.003, "highpass", 2000 + Math.random() * 1500);
  },
  /** Tapping a dew drop: a falling "bloop". */
  "gh-drip": (x) => {
    tone(x, "sine", 1200, x.t, 0.22, 0.003, 0.12, 400);
  },
  /** The secret drop: five quick high sparkles. */
  "gh-secret": (x) => {
    for (let i = 0; i < 5; i++) tone(x, "sine", 3000 + Math.random() * 3000, x.t + i * 0.06, 0.07, 0.002, 0.05);
  },
  /** The cloche settles on the base: a glass clink (inharmonic partials). */
  "gh-clink": (x) => {
    noise(x, "pink", x.t, 0.9, 0.08, 0.7, "bandpass", 900, 0.8);
    [2100, 5800, 8300].forEach((f, i) => tone(x, "sine", f, x.t + 0.9, 0.12 / (i + 1), 0.002, 1.2));
    return 0.9;
  },
  /** One engraved character. */
  "gh-engrave": (x) => {
    noise(x, "white", x.t, 0.008, 0.18, 0.001, "highpass", 5000);
  },
};

const BEDS = new Set(["gh-amb"]);
let done = false;
export function registerGlassCues() {
  if (done) return;
  done = true;
  for (const [id, fn] of Object.entries(CUES)) registerCue(id, fn, { bed: BEDS.has(id) });
}
