// The Midnight Manor's own SFX cues (registered once, on import). Procedural
// like the kit's bank: noise + oscillators + envelopes on the page's single
// AudioContext, zero audio files. Each one has a visual twin in its scene.
//
//   mm-seal        wax crack + a thunder roll (the gate's sting)
//   mm-seal-soft   wax crack + a far, low rumble (family/kids: no crack of thunder)
//   mm-bats        a flock leaving the tower: 16 panned wing grains
//   mm-title       a low "invitation" boom with a soft reverse swell
//   mm-zap         a portrait wakes: a short crackle + a small rumble
//   mm-whisper     a breathy "shh-aah" behind a caption
//   mm-glow        a candle bloom (the gentle twin of mm-zap)
//   mm-dawn        a warm major-9th pad that swells after YES
//   mm-flap        an envelope flap / a page lifting

import { noiseBuffer, registerCue } from "../../../_valentine/kit/premium";

type Cue = Parameters<typeof registerCue>[1];
type X = Parameters<Cue>[0];

function env(g: GainNode, t: number, peak: number, a: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function noise(x: X, color: "white" | "pink" | "brown", t: number, dur: number, type: BiquadFilterType, f: number, q: number, peak: number, a: number) {
  const s = x.c.createBufferSource();
  s.buffer = noiseBuffer(color);
  s.loop = true;
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  const g = x.c.createGain();
  env(g, t, peak, a, dur);
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random());
  s.stop(t + a + dur + 0.05);
  return { b, g };
}

function osc(x: X, type: OscillatorType, f: number, t: number, peak: number, a: number, d: number, to?: number) {
  const o = x.c.createOscillator();
  const g = x.c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f * x.k, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to * x.k, t + a + d);
  env(g, t, peak, a, d);
  o.connect(g).connect(x.out);
  o.start(t);
  o.stop(t + a + d + 0.05);
}

const crack = (x: X, t: number, k = 1) => {
  noise(x, "white", t, 0.008 * 6, "highpass", 2000, 0.8, 0.6 * k, 0.001);
  noise(x, "white", t + 0.03, 0.012 * 5, "highpass", 2400, 0.8, 0.45 * k, 0.001);
  noise(x, "white", t + 0.07, 0.02 * 4, "bandpass", 1800, 1.2, 0.35 * k, 0.001);
  osc(x, "sine", 90, t + 0.01, 0.5 * k, 0.004, 0.06, 60);
};

const rumble = (x: X, t: number, peak: number, dur: number) => {
  const { b } = noise(x, "brown", t, dur, "lowpass", 180, 0.7, peak, 0.35);
  b.frequency.setValueAtTime(220, t);
  b.frequency.exponentialRampToValueAtTime(90, t + dur);
};

let done = false;
export function registerManorCues() {
  if (done) return;
  done = true;

  registerCue("mm-seal", (x) => {
    crack(x, x.t);
    noise(x, "white", x.t + 0.18, 0.22, "highpass", 1200, 0.7, 0.7, 0.002);
    rumble(x, x.t + 0.4, 0.9, 3.4);
    return 0.05;
  });

  registerCue("mm-seal-soft", (x) => {
    crack(x, x.t, 0.8);
    rumble(x, x.t + 0.5, 0.45, 2.6);
    return 0.05;
  });

  registerCue("mm-bats", (x) => {
    for (let i = 0; i < 16; i++) {
      const t = x.t + i * 0.045 + Math.random() * 0.05;
      const s = x.c.createBufferSource();
      s.buffer = noiseBuffer("white");
      const b = x.c.createBiquadFilter();
      b.type = "bandpass";
      b.frequency.value = 2600 + Math.random() * 1200;
      b.Q.value = 2.5;
      const g = x.c.createGain();
      env(g, t, 0.16 + Math.random() * 0.1, 0.004, 0.035);
      const p = typeof x.c.createStereoPanner === "function" ? x.c.createStereoPanner() : null;
      if (p) p.pan.value = Math.random() * 1.6 - 0.8;
      s.connect(b).connect(g);
      if (p) g.connect(p).connect(x.out);
      else g.connect(x.out);
      s.start(t, Math.random());
      s.stop(t + 0.06);
    }
  });

  registerCue("mm-title", (x) => {
    const { b } = noise(x, "pink", x.t, 0.15, "lowpass", 300, 0.7, 0.35, 0.75);
    b.frequency.exponentialRampToValueAtTime(2400, x.t + 0.75);
    osc(x, "sine", 58, x.t + 0.72, 0.8, 0.01, 1.6, 44);
    osc(x, "triangle", 116, x.t + 0.72, 0.12, 0.01, 1.2, 88);
    return 0.72;
  });

  registerCue("mm-zap", (x) => {
    noise(x, "white", x.t, 0.04, "highpass", 2500, 0.7, 0.55, 0.001);
    noise(x, "white", x.t + 0.05, 0.03, "highpass", 3200, 0.7, 0.35, 0.001);
    rumble(x, x.t + 0.08, 0.28, 0.6);
  });

  registerCue("mm-glow", (x) => {
    const { b } = noise(x, "brown", x.t, 0.5, "lowpass", 200, 0.8, 0.5, 0.12);
    b.frequency.exponentialRampToValueAtTime(1100, x.t + 0.4);
    osc(x, "sine", 880, x.t + 0.05, 0.06, 0.2, 0.9);
  });

  registerCue("mm-whisper", (x) => {
    const pan = typeof x.c.createStereoPanner === "function" ? x.c.createStereoPanner() : null;
    const out = x.out;
    if (pan) {
      pan.pan.value = (Math.random() - 0.5) * 1.2;
      pan.connect(out);
    }
    const s = x.c.createBufferSource();
    s.buffer = noiseBuffer("pink");
    const b = x.c.createBiquadFilter();
    b.type = "bandpass";
    b.Q.value = 3;
    b.frequency.setValueAtTime(3800, x.t);
    b.frequency.linearRampToValueAtTime(2200, x.t + 0.5);
    b.frequency.linearRampToValueAtTime(1500, x.t + 1.1);
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.32, x.t + 0.18);
    g.gain.linearRampToValueAtTime(0.12, x.t + 0.45);
    g.gain.linearRampToValueAtTime(0.26, x.t + 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + 1.25);
    s.connect(b).connect(g).connect(pan ?? out);
    s.start(x.t, Math.random());
    s.stop(x.t + 1.3);
  });

  registerCue("mm-dawn", (x) => {
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.14, x.t + 3);
    g.gain.setValueAtTime(0.14, x.t + 4.5);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + 7.5);
    const lp = x.c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1600;
    g.connect(lp).connect(x.out);
    // D major 9: D F# A C# E
    [62, 66, 69, 73, 76].forEach((n) => {
      const o = x.c.createOscillator();
      o.type = "triangle";
      o.frequency.value = 440 * Math.pow(2, (n - 69) / 12) * x.k;
      o.detune.value = (Math.random() - 0.5) * 10;
      o.connect(g);
      o.start(x.t);
      o.stop(x.t + 7.6);
    });
    return 3;
  });

  registerCue("mm-flap", (x) => {
    const { b } = noise(x, "white", x.t, 0.3, "bandpass", 400, 1.1, 0.4, 0.05);
    b.frequency.exponentialRampToValueAtTime(2500, x.t + 0.35);
  });
}
