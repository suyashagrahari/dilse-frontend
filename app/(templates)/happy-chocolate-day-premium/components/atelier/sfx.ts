// ─── The atelier's own cues (registered once into the shared SFX bank) ───────
//
// Procedural, zero bytes. Each one has a visual twin in a scene:
//   choc-rain (bed)    rain streaks on the shop window          (gate, lights)
//   choc-bell          the door bell swinging as the sign flips  (gate)
//   choc-lamp          a pendant lamp flickering on              (lights)
//   choc-slosh         the pot tipping                           (pour)
//   choc-pour (bed)    the stream, level follows the pour rate   (pour)
//   choc-bubble        an air bubble popping in the mould        (set)
//   choc-temper        the thermometer tink at 31 °C             (set)
//   choc-demould       the heart popping out of the mould        (set)
//   choc-thud          hammer hits 1–2                           (crack)
//   choc-crack         crack lines racing across the shell       (crack)
//   choc-shatter       the shell bursting into shards            (crack)
//   choc-tinkle        one shard landing (panned by x)           (crack)
//   choc-bite          a truffle bite                            (truffles)
//   choc-crinkle       the wrapper peeling, rate ∝ drag speed    (ticket)
//   choc-shimmer       the golden ticket glinting                (ticket)
//   choc-pipe          the piping bag squeezing                  (letter, drizzle)
//   choc-zip / choc-bow  the ribbon pulled round, the bow popping (box)
//   choc-room (bed)    the fridge hum of the atelier             (lights → end)

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
export function registerAtelierCues() {
  if (done) return;
  done = true;
  registerCue("choc-rain", (x: X) => {
    loop(x, "pink", "highpass", 1000, 0.7, 0.32);
    // drips: a sparse tick track baked into a looping buffer
    const len = Math.floor(x.c.sampleRate * 3);
    const buf = x.c.createBuffer(1, len, x.c.sampleRate);
    const d = buf.getChannelData(0);
    for (let n = 0; n < 12; n++) {
      const at = Math.floor(Math.random() * (len - 2000));
      const f = 1500 + Math.random() * 1500;
      for (let i = 0; i < 700; i++) d[at + i] += Math.sin((i / x.c.sampleRate) * f * 6.283) * Math.exp(-i / 160) * 0.5;
    }
    const s = x.c.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    const g = x.c.createGain();
    g.gain.value = 0.25;
    s.connect(g).connect(x.out);
    s.start(x.t);
    x.keep(s);
  }, { bed: true });
  registerCue("choc-room", (x: X) => {
    loop(x, "brown", "lowpass", 180, 0.7, 0.22);
  }, { bed: true });
  registerCue("choc-bell", (x: X) => {
    noise(x, "white", x.t, 0.25, 0.004, 0.06, "bandpass", 800, 1.5);
    for (const [k, at] of [[0, 0.06], [1, 0.32]] as const) {
      osc(x, "sine", 2400 - k * 120, x.t + at, 0.16, 0.003, 0.9);
      osc(x, "sine", 6100 - k * 300, x.t + at, 0.06, 0.003, 0.5);
    }
  });
  registerCue("choc-lamp", (x: X) => {
    noise(x, "white", x.t, 0.4, 0.001, 0.004, "highpass", 2000);
    const o = x.c.createOscillator();
    o.type = "square";
    o.frequency.value = 100;
    const lp = x.c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 400;
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    [0.02, 0.07, 0.1, 0.16, 0.2].forEach((at, i) => g.gain.setValueAtTime(i % 2 ? 0.0001 : 0.07, x.t + at));
    g.gain.setValueAtTime(0.05, x.t + 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + 0.4);
    o.connect(lp).connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + 0.45);
  });
  registerCue("choc-slosh", (x: X) => {
    const b = noise(x, "pink", x.t, 0.35, 0.08, 0.45, "bandpass", 400, 3);
    b.frequency.setValueAtTime(300, x.t);
    b.frequency.linearRampToValueAtTime(600, x.t + 0.25);
    b.frequency.linearRampToValueAtTime(320, x.t + 0.5);
  });
  registerCue("choc-pour", (x: X) => {
    loop(x, "brown", "lowpass", 700, 0.8, 0.5);
    const { g } = loop(x, "pink", "bandpass", 220, 6, 0.6);
    // the glug: a slow wobble on the resonant band
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 3.2;
    lg.gain.value = 0.25;
    l.connect(lg).connect(g.gain);
    l.start(x.t);
    x.keep(l);
  }, { bed: true });
  registerCue("choc-bubble", (x: X) => {
    noise(x, "white", x.t, 0.25, 0.001, 0.003, "highpass", 3000);
    osc(x, "sine", 800, x.t, 0.3, 0.002, 0.045, 200);
  });
  registerCue("choc-temper", (x: X) => {
    for (let i = 0; i < 3; i++) noise(x, "white", x.t + i * 0.12, 0.2, 0.001, 0.01, "highpass", 4000);
    osc(x, "sine", 1600, x.t + 0.4, 0.22, 0.003, 0.4);
    osc(x, "sine", 4400, x.t + 0.4, 0.08, 0.003, 0.3);
  });
  registerCue("choc-demould", (x: X) => {
    osc(x, "sine", 150, x.t, 0.5, 0.004, 0.12, 60);
    noise(x, "white", x.t, 0.18, 0.001, 0.02, "bandpass", 2500);
  });
  registerCue("choc-thud", (x: X) => {
    osc(x, "sine", 90, x.t, 0.8, 0.003, 0.12, 30);
    noise(x, "pink", x.t, 0.5, 0.001, 0.05, "lowpass", 2000);
  });
  registerCue("choc-crack", (x: X) => {
    for (let i = 0; i < 3; i++) noise(x, "white", x.t + i * 0.02 + Math.random() * 0.006, 0.45, 0.001, 0.008, "highpass", 2500);
  });
  registerCue("choc-shatter", (x: X) => {
    noise(x, "white", x.t, 0.7, 0.002, 0.22, "bandpass", 1800, 0.8);
    noise(x, "pink", x.t, 0.5, 0.002, 0.35, "lowpass", 900);
    for (let i = 0; i < 6; i++) osc(x, "sine", 2000 + Math.random() * 2500, x.t + 0.03 + Math.random() * 0.2, 0.05, 0.001, 0.08);
  });
  registerCue("choc-tinkle", (x: X) => {
    osc(x, "sine", 2000 + Math.random() * 2000, x.t, 0.09, 0.001, 0.06);
  });
  registerCue("choc-bite", (x: X) => {
    for (let i = 0; i < 4; i++) noise(x, "white", x.t + i * 0.03 + Math.random() * 0.01, 0.35, 0.002, 0.025, "bandpass", 1200, 1.4);
    osc(x, "sine", 180, x.t + 0.12, 0.05, 0.03, 0.15);
  });
  registerCue("choc-crinkle", (x: X) => {
    const n = 3 + Math.round(Math.random() * 3);
    for (let i = 0; i < n; i++) noise(x, "white", x.t + Math.random() * 0.12, 0.18, 0.002, 0.01 + Math.random() * 0.02, "bandpass", 3000 + Math.random() * 3000, 1.2);
  });
  registerCue("choc-shimmer", (x: X) => {
    [1046.5, 1318.5, 1568, 1975.5].forEach((f, i) => osc(x, "sine", f, x.t + i * 0.05, 0.07, 0.08, 1.3));
    for (let i = 0; i < 5; i++) osc(x, "sine", 3000 + Math.random() * 2500, x.t + 0.2 + Math.random() * 0.9, 0.04, 0.002, 0.15);
  });
  registerCue("choc-pipe", (x: X) => {
    const d = x.o.dur ?? 0.25;
    noise(x, "pink", x.t, 0.25, 0.03, d, "lowpass", 500);
    osc(x, "sine", 140, x.t, 0.06, 0.03, d);
  });
  registerCue("choc-zip", (x: X) => {
    const b = noise(x, "white", x.t, 0.3, 0.02, 0.24, "bandpass", 1000, 2);
    b.frequency.exponentialRampToValueAtTime(3000, x.t + 0.25);
  });
  registerCue("choc-bow", (x: X) => {
    osc(x, "sine", 400, x.t, 0.3, 0.003, 0.07, 900);
    osc(x, "triangle", 1318.5, x.t + 0.08, 0.08, 0.005, 0.5);
  });
}
