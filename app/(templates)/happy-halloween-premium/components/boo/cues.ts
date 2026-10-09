// Boo-tiful Night's own cute SFX (registered once, on import). Procedural like
// the kit's bank: noise + oscillators + envelopes on the page's single
// AudioContext, zero audio files, all short and high (cute, never scary).
// Each one has a visual twin in its scene.
//
//   bn-woo      a little ghost's "woo-oo" (high sine glide with vibrato)
//   bn-boing    a springy boing (candy pops out, a pumpkin bounces)
//   bn-giggle   a tiny ghost giggle (four quick chirps, falling)
//   bn-flap     bat wings (two soft air puffs)
//   bn-crinkle  a candy wrapper opening (bright noise ticks)
//   bn-stamp    a rubber stamp landing (thump + paper slap)
//   bn-tune     a radio dial tick with a whistle of static

import { noiseBuffer, registerCue } from "../../../_valentine/kit/premium";

type Cue = Parameters<typeof registerCue>[1];
type X = Parameters<Cue>[0];

function env(g: GainNode, t: number, peak: number, a: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function noise(x: X, color: "white" | "pink" | "brown", t: number, dur: number, type: BiquadFilterType, f: number, q: number, peak: number, a: number, fTo?: number) {
  const src = x.c.createBufferSource();
  src.buffer = noiseBuffer(color);
  src.loop = true;
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.setValueAtTime(f, t);
  if (fTo) b.frequency.exponentialRampToValueAtTime(fTo, t + a + dur);
  b.Q.value = q;
  const g = x.c.createGain();
  env(g, t, peak, a, dur);
  src.connect(b).connect(g).connect(x.out);
  src.start(t, Math.random());
  src.stop(t + a + dur + 0.05);
}

function glide(x: X, type: OscillatorType, f0: number, f1: number, t: number, peak: number, a: number, d: number, vib = 0) {
  const o = x.c.createOscillator();
  const g = x.c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0 * x.k, t);
  o.frequency.exponentialRampToValueAtTime(f1 * x.k, t + a + d * 0.7);
  if (vib) {
    const lfo = x.c.createOscillator();
    const lg = x.c.createGain();
    lfo.frequency.value = 7;
    lg.gain.value = vib;
    lfo.connect(lg).connect(o.frequency);
    lfo.start(t);
    lfo.stop(t + a + d + 0.05);
  }
  env(g, t, peak, a, d);
  o.connect(g).connect(x.out);
  o.start(t);
  o.stop(t + a + d + 0.05);
}

let done = false;
export function registerBooCues() {
  if (done) return;
  done = true;
  registerCue("bn-woo", (x) => {
    glide(x, "sine", 620, 980, x.t, 0.16, 0.08, 0.35, 18);
    glide(x, "sine", 980, 720, x.t + 0.36, 0.14, 0.04, 0.45, 22);
    glide(x, "triangle", 1240, 1960, x.t, 0.03, 0.08, 0.35);
    return 0.1;
  });
  registerCue("bn-boing", (x) => {
    glide(x, "sine", 180, 620, x.t, 0.22, 0.005, 0.09);
    glide(x, "sine", 620, 330, x.t + 0.09, 0.16, 0.005, 0.28, 30);
    return 0.05;
  });
  registerCue("bn-giggle", (x) => {
    [0, 0.09, 0.17, 0.25].forEach((dt, i) => glide(x, "triangle", 1500 - i * 120, 1250 - i * 120, x.t + dt, 0.1, 0.004, 0.07));
    return 0.05;
  });
  registerCue("bn-flap", (x) => {
    noise(x, "pink", x.t, 0.07, "lowpass", 900, 0.8, 0.45, 0.01, 400);
    noise(x, "pink", x.t + 0.13, 0.07, "lowpass", 900, 0.8, 0.35, 0.01, 400);
    return 0.02;
  });
  registerCue("bn-crinkle", (x) => {
    for (let i = 0; i < 6; i++) noise(x, "white", x.t + i * 0.028 + Math.random() * 0.01, 0.025, "highpass", 3800 + Math.random() * 2400, 1.2, 0.22, 0.002);
    return 0.03;
  });
  registerCue("bn-stamp", (x) => {
    glide(x, "sine", 140, 60, x.t, 0.5, 0.004, 0.16);
    noise(x, "white", x.t, 0.05, "bandpass", 1800, 0.9, 0.3, 0.002, 900);
    return 0.01;
  });
  registerCue("bn-tune", (x) => {
    noise(x, "white", x.t, 0.06, "bandpass", 2600, 3, 0.12, 0.004, 1800);
    glide(x, "sine", 2200, 1700 + Math.random() * 900, x.t, 0.03, 0.01, 0.08);
    return 0.02;
  });
}
