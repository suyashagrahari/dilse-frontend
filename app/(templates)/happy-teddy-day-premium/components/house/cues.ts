// The Teddy House's own cute SFX (registered once, on import). Procedural like the kit's bank: noise +
// oscillators + envelopes on the page's single AudioContext, zero audio files, all short and soft. Each one has a
// visual twin in its room. (The kit's plush-squeak, pop, chime, sparkle, kiss and paper-rustle do the rest.)
//
//   th-boing   a springy boing (an accessory snaps on, a teddy lands)
//   th-stitch  three quick needle ticks (the name tag stitches on)
//   th-munch   a cookie crunch (a catch in the kitchen)
//   th-ring    a toy phone's trill (two bright alternating tones)
//   th-yawn    a tiny teddy yawn (a sine glide down with a wobble)
//   th-rub     a soft fabric swish (rubbing the heart warm)
//   th-stamp   a rubber stamp landing (the certificate)

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
    lfo.frequency.value = 9;
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
export function registerHouseCues() {
  if (done) return;
  done = true;
  registerCue("th-boing", (x) => {
    glide(x, "sine", 200, 680, x.t, 0.22, 0.005, 0.09);
    glide(x, "sine", 680, 360, x.t + 0.09, 0.16, 0.005, 0.26, 26);
    return 0.05;
  });
  registerCue("th-stitch", (x) => {
    [0, 0.11, 0.22].forEach((dt, i) => {
      noise(x, "white", x.t + dt, 0.02, "highpass", 5200 - i * 300, 1.4, 0.2, 0.002);
      glide(x, "triangle", 2400 + i * 200, 2100 + i * 200, x.t + dt, 0.04, 0.002, 0.04);
    });
    return 0.04;
  });
  registerCue("th-munch", (x) => {
    for (let i = 0; i < 4; i++) noise(x, "white", x.t + i * 0.035 + Math.random() * 0.012, 0.03, "bandpass", 2600 + Math.random() * 1800, 1.1, 0.26, 0.002);
    glide(x, "sine", 300, 180, x.t, 0.1, 0.004, 0.08);
    return 0.03;
  });
  registerCue("th-ring", (x) => {
    for (let i = 0; i < 8; i++) glide(x, "triangle", i % 2 ? 1320 : 1660, i % 2 ? 1320 : 1660, x.t + i * 0.055, 0.07, 0.004, 0.05);
    return 0.05;
  });
  registerCue("th-yawn", (x) => {
    glide(x, "sine", 520, 300, x.t, 0.12, 0.12, 0.55, 10);
    glide(x, "triangle", 1040, 600, x.t, 0.025, 0.12, 0.55);
    return 0.1;
  });
  registerCue("th-rub", (x) => {
    noise(x, "pink", x.t, 0.12, "bandpass", 1400, 0.9, 0.16, 0.03, 2400);
    return 0.03;
  });
  registerCue("th-stamp", (x) => {
    glide(x, "sine", 140, 60, x.t, 0.5, 0.004, 0.16);
    noise(x, "white", x.t, 0.05, "bandpass", 1800, 0.9, 0.3, 0.002, 900);
    return 0.01;
  });
}
