// ─── The red thread's own cues (registered once into the shared SFX bank) ────
//
// Procedural, zero bytes; each one has a visual twin:
//   tp-hum      warm hum under the opening        tp-glint    the thread shines
//   tp-reel     each pull (pitch rises)           tp-twang    a fast yank → wobble
//   tp-peg      a photo peg passes the hand       tp-cinch    the knot tightens (creaks + thump)
//   tp-flash    the white flash                   tp-ignite   red → molten gold
//   tp-pen      "I promise" writing itself        tp-ring     a ring threaded (rising pentatonic)
//   tp-ribbon   the promise ribbon unfurls        tp-stitch   a paragraph stitched in
//   tp-ink      the thumbprint blooms             tp-wax      wax drips on the vial
//   tp-water    (bed) the river                   tp-tick     pendulum apex
//   tp-chord    "Promised" (maj7 arpeggio)

import { noiseBuffer, registerCue } from "../../../_valentine/kit/premium";

type X = { c: AudioContext; out: AudioNode; t: number; o: { dur?: number; gain?: number }; k: number; keep: (n: AudioScheduledSourceNode) => void };

function envG(x: X, t: number, peak: number, a: number, d: number) {
  const g = x.c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  return g;
}
function osc(x: X, type: OscillatorType, f: number, t: number, peak: number, a: number, d: number, to?: number) {
  const o = x.c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f * x.k, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to * x.k, t + a + d);
  const g = envG(x, t, peak, a, d);
  o.connect(g).connect(x.out);
  o.start(t);
  o.stop(t + a + d + 0.05);
}
function noise(x: X, color: "white" | "pink" | "brown", t: number, peak: number, a: number, d: number, type: BiquadFilterType, f: number, q = 1) {
  const s = x.c.createBufferSource();
  s.buffer = noiseBuffer(color);
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  const g = envG(x, t, peak, a, d);
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random());
  s.stop(t + a + d + 0.05);
  return b;
}
function loop(x: X, color: "white" | "pink" | "brown", type: BiquadFilterType, f: number, q: number, level: number) {
  const s = x.c.createBufferSource();
  s.buffer = noiseBuffer(color);
  s.loop = true;
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  const g = x.c.createGain();
  g.gain.setValueAtTime(0.0001, x.t);
  g.gain.linearRampToValueAtTime(level, x.t + 1);
  s.connect(b).connect(g).connect(x.out);
  s.start(x.t, Math.random());
  x.keep(s);
  return { b, g };
}

let done = false;
export function registerThreadCues() {
  if (done) return;
  done = true;
  registerCue("tp-hum", (x: X) => {
    for (const f of [110, 165]) {
      const o = x.c.createOscillator();
      o.frequency.value = f;
      const lp = x.c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 600;
      const g = x.c.createGain();
      g.gain.setValueAtTime(0.0001, x.t);
      g.gain.linearRampToValueAtTime(0.09, x.t + 1.2);
      g.gain.setValueAtTime(0.09, x.t + 3.2);
      g.gain.exponentialRampToValueAtTime(0.0001, x.t + 5.2);
      o.connect(lp).connect(g).connect(x.out);
      o.start(x.t);
      o.stop(x.t + 5.3);
    }
    return 0;
  });
  registerCue("tp-glint", (x: X) => {
    osc(x, "triangle", 2200, x.t, 0.14, 0.004, 0.3);
    noise(x, "white", x.t, 0.15, 0.001, 0.01, "highpass", 5000);
  });
  registerCue("tp-reel", (x: X) => {
    noise(x, "white", x.t, 0.3, 0.01, 0.11, "bandpass", 1200 * x.k, 4);
  });
  registerCue("tp-twang", (x: X) => {
    const o = x.c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(180, x.t);
    o.frequency.exponentialRampToValueAtTime(140, x.t + 0.4);
    const lp = x.c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const g = envG(x, x.t, 0.18, 0.003, 0.4);
    o.connect(lp).connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + 0.45);
  });
  registerCue("tp-peg", (x: X) => {
    noise(x, "white", x.t, 0.35, 0.001, 0.008, "bandpass", 4500, 2);
  });
  registerCue("tp-cinch", (x: X) => {
    for (let i = 0; i < 3; i++) {
      const b = noise(x, "pink", x.t + i * 0.13, 0.3, 0.01, 0.09, "bandpass", 800, 3);
      b.frequency.exponentialRampToValueAtTime(300, x.t + i * 0.13 + 0.1);
    }
    osc(x, "sine", 70, x.t + 0.42, 0.7, 0.004, 0.25, 45);
  });
  registerCue("tp-flash", (x: X) => {
    noise(x, "white", x.t, 0.25, 0.25, 0.05, "highpass", 1500);
  });
  registerCue("tp-ignite", (x: X) => {
    osc(x, "sine", 300, x.t, 0.12, 0.2, 1.3, 1200);
    osc(x, "sine", 303, x.t, 0.08, 0.2, 1.3, 1212);
    for (let i = 0; i < 6; i++) osc(x, "sine", 2400 + Math.random() * 2400, x.t + 0.4 + i * 0.15, 0.05, 0.002, 0.12);
  });
  registerCue("tp-pen", (x: X) => {
    const d = x.o.dur ?? 2;
    const b = noise(x, "white", x.t, 0.07, 0.1, d, "bandpass", 3000, 2);
    void b;
  });
  registerCue("tp-ring", (x: X) => {
    // a soft FM bell
    const car = x.c.createOscillator();
    const mod = x.c.createOscillator();
    const mg = x.c.createGain();
    car.frequency.value = 1046.5 * x.k;
    mod.frequency.value = 1046.5 * x.k * 3.5;
    mg.gain.setValueAtTime(600, x.t);
    mg.gain.exponentialRampToValueAtTime(1, x.t + 1.5);
    mod.connect(mg).connect(car.frequency);
    const g = envG(x, x.t, 0.16, 0.003, 2.4);
    car.connect(g).connect(x.out);
    car.start(x.t);
    mod.start(x.t);
    car.stop(x.t + 2.5);
    mod.stop(x.t + 2.5);
  });
  registerCue("tp-ribbon", (x: X) => {
    const b = noise(x, "pink", x.t, 0.25, 0.05, 0.3, "lowpass", 400);
    b.frequency.exponentialRampToValueAtTime(3000, x.t + 0.35);
  });
  registerCue("tp-stitch", (x: X) => {
    const n = x.o.dur ? Math.round(x.o.dur * 6) : 6;
    for (let i = 0; i < n; i++) noise(x, "white", x.t + i / 6, 0.22, 0.001, 0.012, "bandpass", 3500 + (i % 2) * 800, 2);
    const b = noise(x, "white", x.t + n / 6, 0.18, 0.02, 0.18, "bandpass", 2000, 3);
    b.frequency.exponentialRampToValueAtTime(4000, x.t + n / 6 + 0.2);
  });
  registerCue("tp-ink", (x: X) => {
    osc(x, "sine", 90, x.t, 0.4, 0.05, 0.35, 70);
    noise(x, "brown", x.t, 0.25, 0.08, 0.4, "lowpass", 400);
  });
  registerCue("tp-wax", (x: X) => {
    [600, 500, 420].forEach((f, i) => osc(x, "sine", f, x.t + i * 0.18, 0.18, 0.003, 0.06, f * 0.8));
  });
  registerCue("tp-water", (x: X) => {
    const { g } = loop(x, "brown", "lowpass", 500, 0.7, 0.3);
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 0.3;
    lg.gain.value = 0.12;
    l.connect(lg).connect(g.gain);
    l.start(x.t);
    x.keep(l);
  }, { bed: true });
  registerCue("tp-tick", (x: X) => {
    osc(x, "sine", 900, x.t, 0.12, 0.001, 0.03);
  });
  registerCue("tp-chord", (x: X) => {
    [523.25, 659.25, 783.99, 987.77].forEach((f, i) => osc(x, "triangle", f, x.t + i * 0.09, 0.1, 0.01, 1.2));
    for (let i = 0; i < 5; i++) osc(x, "sine", 3000 + Math.random() * 2000, x.t + 0.5 + Math.random() * 0.6, 0.04, 0.002, 0.12);
  });
}
