// "Look Up" — the template's own procedural cues (registered once, on import). Zero audio bytes; routed through
// the kit's SFX/beds buses, so the 🔊 chip and "open quietly" silence them too. Each has a visual twin.

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
function noise(x: X, color: "white" | "pink" | "brown", t: number, dur: number, peak: number, a: number, ftype: BiquadFilterType, f: number, q = 1, loop = false) {
  const buf = noiseBuffer(color);
  if (!buf) return null;
  const s = x.c.createBufferSource();
  s.buffer = buf;
  s.loop = loop || dur > 1.9;
  const b = x.c.createBiquadFilter();
  b.type = ftype;
  b.frequency.value = f;
  b.Q.value = q;
  const g = x.c.createGain();
  if (loop) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    x.keep(s);
  } else env(g, t, peak, a, Math.max(0.004, dur - a));
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random() * 1.2);
  if (!loop) s.stop(t + dur + 0.05);
  return { b, g };
}

const CUES: Record<string, CueFn> = {
  /** An incoming message: a quick rising blip with a click. */
  "sky-pop": (x) => {
    tone(x, "sine", 660, x.t, 0.32, 0.004, 0.09, 990);
    noise(x, "white", x.t, 0.01, 0.15, 0.001, "highpass", 3000);
  },
  /** Typing: three soft taps. */
  "sky-typing": (x) => {
    for (let i = 0; i < 3; i++) tone(x, "sine", 900, x.t + i * 0.18, 0.05, 0.003, 0.03);
  },
  /** The candle catches: a soft "fwoomp". */
  "sky-candle": (x) => {
    noise(x, "brown", x.t, 0.28, 0.5, 0.05, "lowpass", 300);
    tone(x, "sine", 220, x.t, 0.18, 0.02, 0.22, 160);
  },
  /** A window switches on. */
  "sky-click": (x) => {
    noise(x, "white", x.t, 0.004, 0.4, 0.0005, "highpass", 2000);
    tone(x, "sine", 1800, x.t, 0.12, 0.002, 0.02);
  },
  /** The push-in to a lit window: a low warm swell. */
  "sky-hum": (x) => {
    tone(x, "sine", 120, x.t, 0.12, 0.15, 0.3);
    tone(x, "sine", 240, x.t, 0.06, 0.15, 0.3);
  },
  /** The city at night (bed): distant traffic, and once in a while a far horn. */
  "sky-city": (x) => {
    noise(x, "brown", x.t, 0, 0.5, 1.5, "lowpass", 250, 0.7, true);
    for (let k = 0; k < 4; k++) {
      const at = x.t + 6 + k * (15 + Math.random() * 10);
      [400, 404].forEach((f) => {
        const o = x.c.createOscillator();
        const lp = x.c.createBiquadFilter();
        const g = x.c.createGain();
        o.type = "sawtooth";
        o.frequency.value = f;
        lp.type = "lowpass";
        lp.frequency.value = 700;
        env(g, at, 0.035, 0.05, 0.4);
        o.connect(lp).connect(g).connect(x.out);
        o.start(at);
        o.stop(at + 0.5);
        x.keep(o);
      });
    }
  },
  /** The swarm (bed): six detuned saws, lowpassed. */
  "sky-swarm": (x) => {
    const lp = x.c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.09, x.t + 2);
    lp.connect(g).connect(x.out);
    for (let i = 0; i < 6; i++) {
      const o = x.c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = 180 + i * 1.9 + Math.random();
      o.connect(lp);
      o.start(x.t);
      x.keep(o);
    }
  },
  /** A new formation: a three-note bell rising a fifth (detune moves the whole thing up). */
  "sky-chime": (x) => {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      tone(x, "sine", f, x.t + i * 0.09, 0.16, 0.004, 1.2);
      tone(x, "sine", f * 2.76, x.t + i * 0.09, 0.04, 0.004, 0.5);
    });
  },
  /** The ring box lid: a low creak with a wobble. */
  "sky-creak": (x) => {
    const o = tone(x, "sawtooth", 90, x.t, 0.07, 0.05, 0.4, 70);
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 18;
    lg.gain.value = 12;
    l.connect(lg).connect(o.frequency);
    l.start(x.t);
    l.stop(x.t + 0.5);
  },
  /** The ring sliding along the finger. */
  "sky-slide": (x) => {
    noise(x, "white", x.t, 0.22, 0.14, 0.05, "bandpass", 5000, 2);
  },
  /** The ring clicks home: a small metal ring tone. */
  "sky-ring": (x) => {
    tone(x, "sine", 2600, x.t, 0.18, 0.002, 1.1);
    tone(x, "sine", 6900, x.t, 0.06, 0.002, 0.5);
    tone(x, "sine", 4100, x.t + 0.01, 0.05, 0.002, 0.7);
  },
  /** "Let me think" runs away. */
  "sky-boing": (x) => {
    tone(x, "sine", 300, x.t, 0.25, 0.005, 0.12, 700);
  },
  /** The whole city lights up: an abstract crowd-less swell. */
  "sky-cheer": (x) => {
    const n = noise(x, "pink", x.t, 1.6, 0.3, 0.8, "bandpass", 1000, 0.8);
    n?.b.frequency.exponentialRampToValueAtTime(1800, x.t + 1.2);
    [392, 493.88, 587.33].forEach((f) => tone(x, "triangle", f, x.t + 0.3, 0.05, 0.5, 1.4));
  },
  /** Paper tearing along the perforation (count = grains). */
  "sky-tear": (x) => {
    const n = x.o.count ?? 14;
    for (let i = 0; i < n; i++) noise(x, "white", x.t + i * 0.022 + Math.random() * 0.01, 0.02, 0.22 + Math.random() * 0.2, 0.001, "bandpass", 2600 + Math.random() * 1200, 1.5);
  },
};

const BEDS = new Set(["sky-city", "sky-swarm"]);
let done = false;
export function registerSkyCues() {
  if (done) return;
  done = true;
  for (const [id, fn] of Object.entries(CUES)) registerCue(id, fn, { bed: BEDS.has(id) });
}
