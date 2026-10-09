// The manor's own SFX cues (registered once, on import). Procedural like the
// kit's bank: noise + oscillators + envelopes on the page's single
// AudioContext, zero audio files. Each one has a visual twin in its scene.
//
//   nm-glide   the planchette sliding over lacquered wood (a soft brown-noise sweep)
//   nm-lamp    a picture light coming on over a found portrait (filament tick + warm hum)
//   nm-wink    the portrait's wink: two glassy notes, up a fifth
//   nm-flip    a tarot card turning over (a short paper flick + air)

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

function osc(x: X, type: OscillatorType, f: number, t: number, peak: number, a: number, d: number) {
  const o = x.c.createOscillator();
  const g = x.c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f * x.k, t);
  env(g, t, peak, a, d);
  o.connect(g).connect(x.out);
  o.start(t);
  o.stop(t + a + d + 0.05);
}

let done = false;
export function registerNightCues() {
  if (done) return;
  done = true;
  registerCue("nm-glide", (x) => {
    const d = x.o.dur ?? 0.5;
    noise(x, "brown", x.t, d, "bandpass", 380, 0.9, 0.5, d * 0.35, 620);
    noise(x, "pink", x.t, d * 0.8, "highpass", 2400, 0.6, 0.05, d * 0.4);
    return d;
  });
  registerCue("nm-lamp", (x) => {
    noise(x, "white", x.t, 0.03, "highpass", 3200, 0.7, 0.35, 0.001);
    osc(x, "sine", 110, x.t + 0.02, 0.07, 0.18, 0.9);
    osc(x, "triangle", 220, x.t + 0.02, 0.03, 0.2, 0.7);
    osc(x, "sine", 1320, x.t + 0.05, 0.05, 0.01, 0.6);
    return 0.3;
  });
  registerCue("nm-wink", (x) => {
    osc(x, "sine", 1046.5, x.t, 0.18, 0.005, 0.35);
    osc(x, "triangle", 1568, x.t + 0.11, 0.14, 0.005, 0.6);
    osc(x, "sine", 3136, x.t + 0.11, 0.04, 0.005, 0.3);
    return 0.15;
  });
  registerCue("nm-flip", (x) => {
    noise(x, "white", x.t, 0.07, "bandpass", 2600, 1.4, 0.4, 0.004, 1400);
    noise(x, "pink", x.t + 0.02, 0.22, "lowpass", 900, 0.7, 0.18, 0.04);
    return 0.05;
  });
}
