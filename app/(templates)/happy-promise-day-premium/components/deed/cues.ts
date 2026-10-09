// "Signed, Sealed, Promised" SFX: procedural, zero files, each with a visual twin.
//
//   sp-open      gate sting: wax cracks, the flap lifts, the paper slides   (envelope scale-out)
//   sp-unfold    one fold of heavy paper opening                            (a panel turns open)
//   sp-clip      a paperclip snapping onto the deed                         (Exhibit A lands)
//   sp-key       one typewriter key: type-bar slap + platen thunk           (a letter appears)
//   sp-space     the space bar: a softer, duller clack                      (cursor jumps)
//   sp-ding      the carriage bell at the end of a line                     (clause number inks in)
//   sp-return    the carriage return: ratchet + slide                       (paper feeds up)
//   sp-flick     an exhibit flicked off the pile                            (polaroid flies)
//   sp-initial   a quick pen initial                                        (initials draw)
//   sp-pour      warm wax poured from the stick (one-shot, ~1.4 s)          (wax pool grows)
//   sp-deboss    the brass seal pressed into soft wax                       (monogram sinks in)
//   sp-stamp     the notary's rubber stamp: thud + paper slap               (red stamp lands)
// Kit cues used too: nib-scratch (signing), paper-rustle (folding), page-turn, chime.

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
/** A bell partial set (carriage bell, chime). */
function bell(x: X, f: number, t: number, peak: number, d: number) {
  osc(x, "sine", f, t, peak, 0.002, d);
  osc(x, "sine", f * 2.76, t, peak * 0.35, 0.002, d * 0.5);
  osc(x, "sine", f * 5.4, t, peak * 0.12, 0.001, d * 0.25);
}

let done = false;
export function registerDeedCues() {
  if (done) return;
  done = true;

  registerCue("sp-open", (x) => {
    // the wax snaps, the flap lifts with a paper sigh, a low warm bell under it.
    noise(x, "white", x.t, 0.03, "bandpass", 2600, 1.2, 0.5, 0.001);
    osc(x, "triangle", 420, x.t, 0.2, 0.001, 0.06, 160);
    noise(x, "brown", x.t + 0.02, 0.12, "lowpass", 900, 0.7, 0.35, 0.002);
    const { b } = noise(x, "pink", x.t + 0.18, 0.7, "bandpass", 1800, 0.6, 0.28, 0.12);
    b.frequency.exponentialRampToValueAtTime(5200, x.t + 0.9);
    bell(x, 523.25, x.t + 0.32, 0.12, 2.2);
    bell(x, 783.99, x.t + 0.44, 0.08, 2.0);
    return 0.32;
  });

  registerCue("sp-unfold", (x) => {
    const { b } = noise(x, "pink", x.t, 0.32, "bandpass", 1400, 0.8, 0.4, 0.05);
    b.frequency.exponentialRampToValueAtTime(4200, x.t + 0.32);
    noise(x, "white", x.t + 0.3, 0.05, "highpass", 3000, 0.7, 0.18, 0.004);
    osc(x, "sine", 110, x.t + 0.3, 0.12, 0.004, 0.08, 70);
    return 0.3;
  });

  registerCue("sp-clip", (x) => {
    osc(x, "triangle", 3400, x.t, 0.16, 0.001, 0.04);
    noise(x, "white", x.t, 0.025, "bandpass", 5200, 2, 0.3, 0.001);
    osc(x, "triangle", 2200, x.t + 0.05, 0.1, 0.001, 0.06);
    return 0;
  });

  registerCue("sp-key", (x) => {
    // type bar hits the ribbon (bright slap) then the platen (woody thunk).
    noise(x, "white", x.t, 0.018, "bandpass", 3200 * x.k, 1.6, 0.5, 0.0008);
    osc(x, "square", 2100, x.t, 0.035, 0.0008, 0.02, 900);
    noise(x, "brown", x.t + 0.012, 0.05, "lowpass", 700, 0.8, 0.45, 0.001);
    osc(x, "sine", 150, x.t + 0.012, 0.22, 0.002, 0.05, 90);
    return 0;
  });

  registerCue("sp-space", (x) => {
    noise(x, "brown", x.t, 0.06, "lowpass", 520, 0.7, 0.4, 0.002);
    osc(x, "sine", 110, x.t, 0.16, 0.002, 0.06, 80);
    return 0;
  });

  registerCue("sp-ding", (x) => {
    bell(x, 2093, x.t, 0.16, 1.4);
    return 0;
  });

  registerCue("sp-return", (x) => {
    // ratchet clicks speeding up, then the carriage slides home with a knock.
    let t = x.t;
    for (let i = 0; i < 9; i++) {
      noise(x, "white", t, 0.012, "bandpass", 2800 + i * 90, 2, 0.22, 0.0008);
      t += 0.045 - i * 0.003;
    }
    const { b } = noise(x, "pink", x.t + 0.05, 0.36, "bandpass", 900, 0.8, 0.22, 0.04);
    b.frequency.exponentialRampToValueAtTime(2400, x.t + 0.4);
    noise(x, "brown", x.t + 0.44, 0.08, "lowpass", 600, 0.8, 0.5, 0.002);
    osc(x, "sine", 95, x.t + 0.44, 0.3, 0.002, 0.12, 60);
    return 0.44;
  });

  registerCue("sp-flick", (x) => {
    const { b } = noise(x, "pink", x.t, 0.2, "bandpass", 2200, 0.9, 0.35, 0.01);
    b.frequency.exponentialRampToValueAtTime(600, x.t + 0.2);
    return 0;
  });

  registerCue("sp-initial", (x) => {
    noise(x, "white", x.t, 0.12, "bandpass", 3600, 3, 0.18, 0.02);
    noise(x, "white", x.t + 0.16, 0.1, "bandpass", 4200, 3, 0.15, 0.02);
    noise(x, "white", x.t + 0.3, 0.05, "bandpass", 3000, 3, 0.12, 0.01);
    return 0;
  });

  registerCue("sp-pour", (x) => {
    // a thick, slow pour: low bandpassed noise rising, with soft wax "blips".
    const { b } = noise(x, "brown", x.t, 1.3, "lowpass", 240, 0.8, 0.42, 0.25);
    b.frequency.exponentialRampToValueAtTime(620, x.t + 1.3);
    for (let i = 0; i < 6; i++) osc(x, "sine", 260 + Math.random() * 200, x.t + 0.2 + i * 0.19 + Math.random() * 0.05, 0.06, 0.004, 0.08, 140);
    return 0;
  });

  registerCue("sp-deboss", (x) => {
    // brass into soft wax: a muffled squash, a tiny creak, a warm low body.
    noise(x, "brown", x.t, 0.22, "lowpass", 420, 0.8, 0.55, 0.004);
    osc(x, "sine", 72, x.t, 0.5, 0.003, 0.32, 48);
    const { b } = noise(x, "pink", x.t + 0.08, 0.18, "bandpass", 900, 4, 0.08, 0.02);
    b.frequency.exponentialRampToValueAtTime(500, x.t + 0.26);
    bell(x, 392, x.t + 0.18, 0.1, 2.4);
    bell(x, 587.33, x.t + 0.3, 0.07, 2.2);
    bell(x, 783.99, x.t + 0.42, 0.06, 2.2);
    return 0;
  });

  registerCue("sp-stamp", (x) => {
    noise(x, "brown", x.t, 0.07, "lowpass", 800, 0.8, 0.6, 0.002);
    osc(x, "sine", 120, x.t, 0.4, 0.002, 0.1, 70);
    noise(x, "white", x.t + 0.005, 0.04, "bandpass", 1800, 0.9, 0.3, 0.001);
    return 0;
  });
}
