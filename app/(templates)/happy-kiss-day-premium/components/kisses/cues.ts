// "A Thousand Kisses" SFX — procedural, zero files, each with a visual twin.
//
//   kd-hum        velvet room tone under the envelope (bed)
//   kd-perfume    a perfume spritz + shimmer (the gate's sting)
//   kd-wax        warm crackle while the seal is held (bed)
//   kd-drip       a wax drip plip
//   kd-mwah       the kiss: lip-smack transient + a 900→300 Hz pop (detune walks a pentatonic)
//   kd-swirl      the heart cloud of kisses, panning (bed)
//   kd-assemble   the swipe: a rising whoosh + a cascade of sparkle blips
//   kd-lock       the photo resolves: a soft cymbal swell + an 880 Hz bell
//   kd-lipstick   a waxy squeak as lipstick writes
//   kd-curtain    the booth curtain swish
//   kd-beep       the booth's 3-2-1
//   kd-flash      the booth flash + the strip's motor whir
//   kd-stamp      a lipstick stamp: soft thud + smack
//   kd-screenkiss a big mwah with a short synthetic reverb tail
//   kd-ripple     the shockwave under a screen kiss
//   kd-sealed     a wax press + a three-note major chime

import { getAudioContext, noiseBuffer, registerCue } from "../../../_valentine/kit/premium";

type Cue = Parameters<typeof registerCue>[1];
type X = Parameters<Cue>[0];

function env(g: GainNode, t: number, peak: number, a: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function noise(x: X, color: "white" | "pink" | "brown", t: number, dur: number, type: BiquadFilterType, f: number, q: number, peak: number, a: number, loop = false) {
  const s = x.c.createBufferSource();
  s.buffer = noiseBuffer(color);
  s.loop = true;
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  const g = x.c.createGain();
  if (loop) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    x.keep(s);
  } else env(g, t, peak, a, dur);
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random());
  if (!loop) s.stop(t + a + dur + 0.05);
  return { b, g, s };
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
  return o;
}
const mwah = (x: X, t: number, k = 1) => {
  noise(x, "white", t, 0.02, "bandpass", 1700, 2.2, 0.32 * k, 0.003);
  osc(x, "sine", 900, t + 0.02, 0.32 * k, 0.004, 0.07, 300);
  osc(x, "triangle", 1400, t + 0.012, 0.06 * k, 0.002, 0.03, 700);
};

let reverb: AudioBuffer | null = null;
function impulse(c: AudioContext) {
  if (reverb) return reverb;
  const len = Math.floor(c.sampleRate * 1.2);
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  reverb = b;
  return b;
}

let done = false;
export function registerKissCues() {
  if (done) return;
  done = true;

  registerCue("kd-hum", (x) => {
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.14, x.t + 1.5);
    const lp = x.c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    g.connect(lp).connect(x.out);
    for (const f of [196, 294, 392]) {
      const o = x.c.createOscillator();
      o.type = "sine";
      o.frequency.value = f * x.k;
      o.detune.value = (Math.random() - 0.5) * 8;
      o.connect(g);
      o.start(x.t);
      x.keep(o);
    }
  }, { bed: true });

  registerCue("kd-perfume", (x) => {
    noise(x, "white", x.t, 0.5, "highpass", 5000, 0.7, 0.35, 0.03);
    noise(x, "white", x.t + 0.25, 0.4, "highpass", 6500, 0.7, 0.18, 0.03);
    [2637, 3136, 3520, 4186].forEach((f, i) => osc(x, "sine", f, x.t + 0.35 + i * 0.07, 0.05, 0.004, 0.6));
    return 0.1;
  });

  registerCue("kd-wax", (x) => {
    const { b } = noise(x, "brown", x.t, 0, "lowpass", 500, 0.8, 0.5, 0.4, true);
    b.frequency.linearRampToValueAtTime(1300, x.t + 1.4);
    for (let i = 0; i < 14; i++) noise(x, "white", x.t + 0.1 + Math.random() * 1.6, 0.012, "highpass", 3000, 0.7, 0.12, 0.001);
  }, { bed: true });

  registerCue("kd-drip", (x) => {
    [700, 560, 470].forEach((f, i) => osc(x, "sine", f, x.t + i * 0.09, 0.14, 0.003, 0.08, f * 0.8));
  });

  registerCue("kd-mwah", (x) => mwah(x, x.t));

  registerCue("kd-swirl", (x) => {
    const s = x.c.createBufferSource();
    s.buffer = noiseBuffer("pink");
    s.loop = true;
    const b = x.c.createBiquadFilter();
    b.type = "bandpass";
    b.frequency.value = 1400;
    b.Q.value = 0.8;
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.22, x.t + 1.2);
    let node: AudioNode = g;
    if (typeof x.c.createStereoPanner === "function") {
      const p = x.c.createStereoPanner();
      const l = x.c.createOscillator();
      const lg = x.c.createGain();
      l.frequency.value = 0.25;
      lg.gain.value = 0.6;
      l.connect(lg).connect(p.pan);
      l.start(x.t);
      x.keep(l);
      g.connect(p);
      node = p;
    }
    node.connect(x.out);
    s.connect(b).connect(g);
    s.start(x.t);
    x.keep(s);
  }, { bed: true });

  registerCue("kd-assemble", (x) => {
    const dur = x.o.dur ?? 2.4;
    const { b } = noise(x, "pink", x.t, 0.2, "lowpass", 200, 0.9, 0.35, dur);
    b.frequency.setValueAtTime(200, x.t);
    b.frequency.exponentialRampToValueAtTime(6000, x.t + dur);
    for (let i = 0; i < 30; i++) osc(x, "sine", 2000 + Math.random() * 3000, x.t + (i / 30) * dur + Math.random() * 0.05, 0.035, 0.002, 0.08);
    return dur;
  });

  registerCue("kd-lock", (x) => {
    noise(x, "white", x.t, 1.5, "highpass", 6000, 0.7, 0.22, 0.25);
    osc(x, "sine", 880, x.t, 0.18, 0.005, 1.8);
    osc(x, "sine", 1320, x.t + 0.06, 0.06, 0.005, 1.2);
  });

  registerCue("kd-lipstick", (x) => {
    const dur = x.o.dur ?? 0.45;
    const { g } = noise(x, "white", x.t, dur, "bandpass", 1800, 6, 0.22, 0.03);
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 9;
    lg.gain.value = 0.1;
    l.connect(lg).connect(g.gain);
    l.start(x.t);
    l.stop(x.t + dur + 0.1);
  });

  registerCue("kd-curtain", (x) => {
    const { b } = noise(x, "pink", x.t, 0.45, "lowpass", 3500, 0.7, 0.45, 0.06);
    b.frequency.exponentialRampToValueAtTime(400, x.t + 0.5);
  });

  registerCue("kd-beep", (x) => {
    osc(x, "sine", 1000, x.t, 0.22, 0.004, 0.08);
  });

  registerCue("kd-flash", (x) => {
    noise(x, "white", x.t, 0.06, "highpass", 4000, 0.7, 0.4, 0.001);
    osc(x, "sine", 4000, x.t, 0.08, 0.002, 0.12, 2400);
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    const lp = x.c.createBiquadFilter();
    o.type = "sawtooth";
    o.frequency.value = 40;
    lp.type = "lowpass";
    lp.frequency.value = 300;
    g.gain.setValueAtTime(0.0001, x.t + 0.3);
    g.gain.linearRampToValueAtTime(0.18, x.t + 0.4);
    g.gain.setValueAtTime(0.18, x.t + 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + 0.95);
    o.connect(lp).connect(g).connect(x.out);
    o.start(x.t + 0.3);
    o.stop(x.t + 1);
  });

  registerCue("kd-stamp", (x) => {
    osc(x, "sine", 120, x.t, 0.6, 0.004, 0.09, 80);
    mwah(x, x.t + 0.03, 0.7);
  });

  registerCue("kd-screenkiss", (x) => {
    const c = getAudioContext();
    let out: AudioNode = x.out;
    if (c) {
      const conv = c.createConvolver();
      conv.buffer = impulse(c);
      const wet = c.createGain();
      wet.gain.value = 0.35;
      const mix = c.createGain();
      mix.connect(x.out);
      mix.connect(conv);
      conv.connect(wet).connect(x.out);
      out = mix;
    }
    const xx = { ...x, out } as X;
    mwah(xx, x.t, 1.6);
  });

  registerCue("kd-ripple", (x) => {
    const o = osc(x, "sine", 300, x.t, 0.2, 0.004, 0.45, 220);
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 18;
    lg.gain.value = 22;
    l.connect(lg).connect(o.frequency);
    l.start(x.t);
    l.stop(x.t + 0.5);
  });

  registerCue("kd-sealed", (x) => {
    osc(x, "sine", 110, x.t, 0.6, 0.004, 0.16, 70);
    noise(x, "brown", x.t, 0.15, "lowpass", 300, 0.7, 0.5, 0.004);
    [523.25, 659.25, 783.99].forEach((f, i) => osc(x, "sine", f * 2, x.t + 0.18 + i * 0.12, 0.16, 0.005, 1.2));
    return 0.18;
  });
}
