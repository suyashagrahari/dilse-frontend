// "Photo Booth" SFX: procedural, zero files, each with a visual twin.
//
//   kpb-insert    gate sting: a coin-slot clunk, a kiss, the curtain swish   (gate scale-out)
//   kpb-press     the big arcade button: a plastic clack                      (button sinks)
//   kpb-beep      the 3-2-1 (detune lifts the "1")                           (numeral slam)
//   kpb-shutter   flash: capacitor whine → shutter clack → pop                (white flash)
//   kpb-motor     the strip feeding out of the slot                          (strip slides)
//   kpb-develop   a frame developing: a soft glassy swell                    (milk clears)
//   kpb-flip      a print turned over: a paper flick                         (3D flip)
//   kpb-toss      a print slid off the pile                                  (card flies)
//   kpb-thermal   the receipt printer's chatter (bed — stop it on exit)      (receipt feeds)
//   kpb-tear      the receipt torn along the perforation                     (paper rips)
//   kpb-kiss      a big kiss on glass with a short room tail                 (lip print)
//   kpb-ripple    the glass ringing under the kiss                           (ripple ring)
//   kpb-stamp     the kiss landing on the strip: thud + three-note chime     (print lands)

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
  osc(x, "sine", 900, t + 0.02, 0.3 * k, 0.004, 0.07, 300);
  osc(x, "triangle", 1400, t + 0.012, 0.06 * k, 0.002, 0.03, 700);
};

let done = false;
export function registerBoothCues() {
  if (done) return;
  done = true;

  registerCue("kpb-insert", (x) => {
    // coin into the slot: two metal ticks, a low clunk, then a kiss and the curtain.
    osc(x, "triangle", 3100, x.t, 0.12, 0.001, 0.05);
    osc(x, "triangle", 2600, x.t + 0.07, 0.1, 0.001, 0.05);
    osc(x, "sine", 140, x.t + 0.16, 0.45, 0.003, 0.12, 70);
    noise(x, "brown", x.t + 0.16, 0.08, "lowpass", 600, 0.7, 0.4, 0.002);
    mwah(x, x.t + 0.42, 0.8);
    const { b } = noise(x, "pink", x.t + 0.55, 0.6, "lowpass", 3800, 0.7, 0.35, 0.08);
    b.frequency.exponentialRampToValueAtTime(380, x.t + 1.2);
    return 0.42;
  });

  registerCue("kpb-press", (x) => {
    noise(x, "white", x.t, 0.03, "bandpass", 2400, 1.4, 0.4, 0.001);
    osc(x, "square", 180, x.t, 0.12, 0.001, 0.05, 120);
    noise(x, "white", x.t + 0.09, 0.02, "bandpass", 3000, 1.4, 0.22, 0.001);
  });

  registerCue("kpb-beep", (x) => {
    osc(x, "sine", 1046, x.t, 0.2, 0.004, 0.12);
    osc(x, "sine", 2092, x.t, 0.04, 0.004, 0.08);
  });

  registerCue("kpb-shutter", (x) => {
    // the flash charging, then the mechanism and the pop of light.
    osc(x, "sine", 2200, x.t, 0.05, 0.12, 0.05, 7000);
    noise(x, "white", x.t + 0.16, 0.012, "highpass", 2500, 0.7, 0.55, 0.001);
    osc(x, "square", 90, x.t + 0.16, 0.18, 0.001, 0.04, 60);
    noise(x, "white", x.t + 0.23, 0.02, "bandpass", 1800, 1.2, 0.4, 0.001);
    noise(x, "pink", x.t + 0.17, 0.35, "highpass", 6000, 0.7, 0.18, 0.004);
    return 0.17;
  });

  registerCue("kpb-motor", (x) => {
    const dur = x.o.dur ?? 1.3;
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    const lp = x.c.createBiquadFilter();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(52 * x.k, x.t);
    o.frequency.linearRampToValueAtTime(64 * x.k, x.t + dur);
    lp.type = "lowpass";
    lp.frequency.value = 420;
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.2, x.t + 0.08);
    g.gain.setValueAtTime(0.2, x.t + dur - 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + dur);
    o.connect(lp).connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + dur + 0.05);
    for (let i = 0; i < Math.floor(dur / 0.11); i++) noise(x, "white", x.t + i * 0.11, 0.01, "bandpass", 2600, 3, 0.05, 0.001);
  });

  registerCue("kpb-develop", (x) => {
    noise(x, "pink", x.t, 0.7, "bandpass", 3200, 2, 0.08, 0.35);
    osc(x, "sine", 1568, x.t + 0.1, 0.07, 0.25, 0.9);
    osc(x, "sine", 2349, x.t + 0.18, 0.035, 0.25, 0.8);
  });

  registerCue("kpb-flip", (x) => {
    const { b } = noise(x, "white", x.t, 0.09, "bandpass", 1400, 1.1, 0.35, 0.01);
    b.frequency.exponentialRampToValueAtTime(4200, x.t + 0.1);
    noise(x, "white", x.t + 0.12, 0.02, "highpass", 3000, 0.7, 0.12, 0.001);
  });

  registerCue("kpb-toss", (x) => {
    const { b } = noise(x, "pink", x.t, 0.28, "bandpass", 900, 0.9, 0.28, 0.04);
    b.frequency.exponentialRampToValueAtTime(3600, x.t + 0.3);
  });

  registerCue("kpb-thermal", (x) => {
    // rows of tiny needle hits at ~38/s, gated in bursts like a line printing.
    const s = x.c.createBufferSource();
    s.buffer = noiseBuffer("white");
    s.loop = true;
    const b = x.c.createBiquadFilter();
    b.type = "bandpass";
    b.frequency.value = 3400;
    b.Q.value = 1.6;
    const g = x.c.createGain();
    g.gain.value = 0;
    const lfo = x.c.createOscillator();
    const lg = x.c.createGain();
    lfo.type = "square";
    lfo.frequency.value = 38;
    lg.gain.value = 0.09;
    lfo.connect(lg).connect(g.gain);
    const gate = x.c.createGain();
    gate.gain.setValueAtTime(0.0001, x.t);
    gate.gain.linearRampToValueAtTime(1, x.t + 0.05);
    const l2 = x.c.createOscillator();
    const l2g = x.c.createGain();
    l2.type = "square";
    l2.frequency.value = 2.2;
    l2g.gain.value = 0.5;
    l2.connect(l2g).connect(gate.gain);
    s.connect(b).connect(g).connect(gate).connect(x.out);
    s.start(x.t);
    lfo.start(x.t);
    l2.start(x.t);
    x.keep(s);
    x.keep(lfo);
    x.keep(l2);
  }, { bed: true });

  registerCue("kpb-tear", (x) => {
    const dur = 0.42;
    const s = x.c.createBufferSource();
    s.buffer = noiseBuffer("white");
    const b = x.c.createBiquadFilter();
    b.type = "bandpass";
    b.frequency.setValueAtTime(1200, x.t);
    b.frequency.linearRampToValueAtTime(3800, x.t + dur);
    b.Q.value = 0.9;
    const g = x.c.createGain();
    g.gain.setValueAtTime(0.0001, x.t);
    // jagged fibres: random steps instead of a smooth envelope.
    for (let i = 0; i < 26; i++) g.gain.setValueAtTime(0.08 + Math.random() * 0.32, x.t + (i / 26) * dur);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + dur + 0.05);
    s.connect(b).connect(g).connect(x.out);
    s.start(x.t, Math.random());
    s.stop(x.t + dur + 0.1);
  });

  registerCue("kpb-kiss", (x) => {
    const c = x.c;
    const len = Math.floor(c.sampleRate * 0.9);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const conv = c.createConvolver();
    conv.buffer = ir;
    const wet = c.createGain();
    wet.gain.value = 0.3;
    const mix = c.createGain();
    mix.connect(x.out);
    mix.connect(conv);
    conv.connect(wet).connect(x.out);
    mwah({ ...x, out: mix } as X, x.t, 1.5);
  });

  registerCue("kpb-ripple", (x) => {
    const o = osc(x, "sine", 420, x.t, 0.12, 0.004, 0.6, 300);
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 14;
    lg.gain.value = 18;
    l.connect(lg).connect(o.frequency);
    l.start(x.t);
    l.stop(x.t + 0.7);
    osc(x, "sine", 1760, x.t + 0.02, 0.03, 0.01, 1.1);
  });

  registerCue("kpb-stamp", (x) => {
    osc(x, "sine", 110, x.t, 0.55, 0.004, 0.16, 70);
    noise(x, "brown", x.t, 0.12, "lowpass", 320, 0.7, 0.45, 0.004);
    [523.25, 659.25, 783.99].forEach((f, i) => osc(x, "sine", f * 2, x.t + 0.16 + i * 0.12, 0.13, 0.005, 1.2));
    return 0.16;
  });
}
