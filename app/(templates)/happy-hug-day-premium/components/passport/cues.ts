// Template cues for "The Hug Passport" (procedural, 0 bytes): the rubber-stamp thunk, a squishy hug, a jelly boing,
// a soft pat, a purr for the voice plush and the three-note "aww" chime (C6-E6-G6). Registered once; played through
// the kit's sfx() (ducked under the song, mute-aware).
import { registerCue, noiseBuffer } from "../../../_valentine/kit/premium";

interface X {
  c: AudioContext;
  out: AudioNode;
  t: number;
  k: number;
}

function osc(x: X, type: OscillatorType, f: number, t: number, peak: number, a: number, d: number, glide?: number) {
  const o = x.c.createOscillator();
  const g = x.c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f * x.k, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(glide * x.k, t + a + d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  o.connect(g).connect(x.out);
  o.start(t);
  o.stop(t + a + d + 0.05);
}

function thud(x: X, t: number, peak: number, cutoff: number, dur: number) {
  const buf = noiseBuffer("pink");
  if (!buf) return;
  const src = x.c.createBufferSource();
  src.buffer = buf;
  const f = x.c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(cutoff, t);
  const g = x.c.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(x.out);
  src.start(t);
  src.stop(t + dur + 0.05);
}

let done = false;
export function registerPassportCues() {
  if (done) return;
  done = true;
  // A rubber stamp: a felt thud, a woody knock, a tiny paper slap.
  registerCue("hp-thunk", (x: X) => {
    thud(x, x.t, 0.5, 520, 0.16);
    osc(x, "sine", 150, x.t, 0.45, 0.004, 0.16, 70);
    osc(x, "triangle", 420, x.t + 0.005, 0.07, 0.002, 0.05);
  });
  // Two plushies squashing together.
  registerCue("hp-squish", (x: X) => {
    osc(x, "sine", 260, x.t, 0.26, 0.02, 0.22, 140);
    osc(x, "triangle", 760, x.t + 0.03, 0.06, 0.02, 0.16, 520);
  });
  registerCue("hp-boing", (x: X) => {
    osc(x, "sine", 180, x.t, 0.3, 0.01, 0.3, 520);
    osc(x, "triangle", 360, x.t + 0.02, 0.07, 0.01, 0.24, 980);
  });
  registerCue("hp-pat", (x: X) => {
    thud(x, x.t, 0.32, 900, 0.07);
    osc(x, "sine", 520, x.t, 0.12, 0.003, 0.07, 380);
  });
  // A cat-like purr: a low buzz with a slow tremolo (about a second).
  registerCue("hp-purr", (x: X) => {
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    const lfo = x.c.createOscillator();
    const lg = x.c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(52 * x.k, x.t);
    const f = x.c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(380, x.t);
    lfo.frequency.setValueAtTime(23, x.t);
    lg.gain.setValueAtTime(0.06, x.t);
    lfo.connect(lg).connect(g.gain);
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.09, x.t + 0.15);
    g.gain.linearRampToValueAtTime(0.0001, x.t + 1.1);
    o.connect(f).connect(g).connect(x.out);
    o.start(x.t);
    lfo.start(x.t);
    o.stop(x.t + 1.2);
    lfo.stop(x.t + 1.2);
  });
  registerCue("hp-aww", (x: X) => {
    [1046.5, 1318.5, 1568].forEach((f, i) => osc(x, "sine", f, x.t + i * 0.09, 0.16, 0.006, 0.42));
    osc(x, "triangle", 2093, x.t + 0.27, 0.05, 0.006, 0.5);
  });
}
