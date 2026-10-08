// "Hold Me for 20 Seconds" SFX — procedural, zero files, each with a visual twin.
//
//   hg-wind      cold wind behind the frosted window (bed)
//   hg-squeak    a finger on cold glass (frost wipe)
//   hg-reveal    glass harmonics as the window clears
//   hg-step      a footstep in snow
//   hg-warm      a warm swell as the two of you meet
//   hg-lubdub    one heartbeat (lub-dub)
//   hg-breath    a slow breath guide: in 4, out 4
//   hg-delivered a major-9 bloom + sparkle ("Hug delivered")
//   hg-cool      a thumb lifted: a soft falling tone
//   hg-rub       wool rubbed warm
//   hg-pop       a mitten pocket opening
//   hg-steam     a curl of steam from the note
//   hg-zip       one zipper tooth (detune walks it up)
//   hg-fabric    the hoodie falling open
//   hg-drape     the quilt draping over the fort
//   hg-tap       a soft woodblock tap (in time: + a 523 Hz bell)
//   hg-synced    two heartbeats landing together + a warm chord
//   hg-tear      a pass torn off
//   hg-sent      G5–B5–D6 ("Hug sent back")

import { noiseBuffer, registerCue } from "../../../_valentine/kit/premium";

type Cue = Parameters<typeof registerCue>[1];
type X = Parameters<Cue>[0];
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

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
  return o;
}
function pad(x: X, notes: number[], t: number, peak: number, a: number, hold: number, rel: number) {
  const g = x.c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setValueAtTime(peak, t + a + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel);
  const lp = x.c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1800;
  g.connect(lp).connect(x.out);
  for (const n of notes)
    for (const type of ["triangle", "sine"] as OscillatorType[]) {
      const o = x.c.createOscillator();
      o.type = type;
      o.frequency.value = midi(n) * x.k;
      o.detune.value = type === "sine" ? 6 : -6;
      o.connect(g);
      o.start(t);
      o.stop(t + a + hold + rel + 0.1);
    }
}

let done = false;
export function registerHugCues() {
  if (done) return;
  done = true;
  registerCue("hg-wind", (x) => {
    const { b } = noise(x, "pink", x.t, 0, "bandpass", 500, 0.7, 0.5, 1.2, true);
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 0.15;
    lg.gain.value = 260;
    l.connect(lg).connect(b.frequency);
    l.start(x.t);
    x.keep(l);
  }, { bed: true });
  registerCue("hg-squeak", (x) => {
    const { b } = noise(x, "white", x.t, 0.12, "bandpass", 2500, 7, 0.25, 0.02);
    b.frequency.exponentialRampToValueAtTime(3400, x.t + 0.14);
  });
  registerCue("hg-reveal", (x) => {
    [1046, 1568, 2093].forEach((f, i) => osc(x, "sine", f, x.t + i * 0.06, 0.12, 0.004, 1.5));
  });
  registerCue("hg-step", (x) => {
    noise(x, "brown", x.t, 0.06, "lowpass", 1200 + Math.random() * 400, 0.8, 0.5, 0.004);
    noise(x, "white", x.t + 0.01, 0.04, "highpass", 3000, 0.7, 0.08, 0.002);
  });
  registerCue("hg-warm", (x) => {
    pad(x, [57, 64, 69], x.t, 0.12, 1, 0.8, 2);
    return 1;
  });
  registerCue("hg-lubdub", (x) => {
    osc(x, "sine", 70, x.t, 0.9, 0.008, 0.12, 55);
    osc(x, "sine", 60, x.t + 0.25, 0.63, 0.008, 0.16, 48);
  });
  registerCue("hg-breath", (x) => {
    const { g } = noise(x, "pink", x.t, 0, "lowpass", 700, 0.7, 0.0001, 0.01);
    g.gain.cancelScheduledValues(x.t);
    g.gain.setValueAtTime(0.0001, x.t);
    g.gain.linearRampToValueAtTime(0.18, x.t + 4);
    g.gain.linearRampToValueAtTime(0.0001, x.t + 8);
  });
  registerCue("hg-delivered", (x) => {
    pad(x, [60, 64, 67, 71, 74], x.t, 0.16, 2, 1, 4);
    for (let i = 0; i < 8; i++) osc(x, "sine", 2400 + Math.random() * 2600, x.t + 0.4 + i * 0.07, 0.06, 0.003, 0.25);
    return 0.4;
  });
  registerCue("hg-cool", (x) => {
    osc(x, "sine", 400, x.t, 0.12, 0.05, 0.6, 200);
  });
  registerCue("hg-rub", (x) => {
    for (let i = 0; i < 4; i++) noise(x, "brown", x.t + i * 0.05, 0.05, "bandpass", 700 + Math.random() * 400, 1.2, 0.35, 0.005);
  });
  registerCue("hg-pop", (x) => {
    osc(x, "sine", 400, x.t, 0.4, 0.002, 0.05, 150);
  });
  registerCue("hg-steam", (x) => {
    noise(x, "white", x.t, 0.6, "highpass", 4000, 0.7, 0.12, 0.05);
  });
  registerCue("hg-zip", (x) => {
    noise(x, "white", x.t, 0.008, "bandpass", 3500 * x.k, 4, 0.4, 0.001);
  });
  registerCue("hg-fabric", (x) => {
    noise(x, "pink", x.t, 0.4, "bandpass", 1500, 1, 0.4, 0.05);
  });
  registerCue("hg-drape", (x) => {
    const { b } = noise(x, "pink", x.t, 0.7, "lowpass", 3000, 0.7, 0.4, 0.1);
    b.frequency.exponentialRampToValueAtTime(300, x.t + 0.8);
  });
  registerCue("hg-tap", (x) => {
    osc(x, "triangle", 800, x.t, 0.3, 0.002, 0.06, 500);
    noise(x, "white", x.t, 0.01, "bandpass", 2000, 2, 0.15, 0.001);
    if (x.o.chord === "major") osc(x, "sine", 523.25, x.t, 0.14, 0.004, 0.6);
  });
  registerCue("hg-synced", (x) => {
    osc(x, "sine", 70, x.t, 1, 0.008, 0.14, 50);
    pad(x, [55, 62, 67, 71], x.t + 0.1, 0.12, 0.8, 0.6, 2.4);
  });
  registerCue("hg-tear", (x) => {
    for (let i = 0; i < 14; i++) noise(x, "white", x.t + i * (0.022 - i * 0.0008), 0.012, "highpass", 2500, 0.7, 0.15 + i * 0.01, 0.001);
  });
  registerCue("hg-sent", (x) => {
    [79, 83, 86].forEach((n, i) => {
      osc(x, "sine", midi(n), x.t + i * 0.13, 0.16, 0.004, 1.2);
      osc(x, "sine", midi(n) * 2.76, x.t + i * 0.13, 0.03, 0.004, 0.5);
    });
  });
}
