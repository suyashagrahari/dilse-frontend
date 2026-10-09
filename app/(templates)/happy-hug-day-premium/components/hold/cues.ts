// "The Twenty-Second Hug" SFX: procedural, zero files, each with a visual twin. Kit cues used alongside:
// heartbeat (ring pulse), swoosh-soft (card drag / swipe), riser + impact-boom (the drop), chime-cascade (hug
// delivered), paper-rustle (letter unfolds), page-turn (P.S. opens), chime (coupon saved), tick (CTAs).
//
//   hh-breath    gate sting: a breath in, then a warm low chord           (gate scale-out)
//   hh-word      one word lands: a felt thump with an airy tail            (the word slams in)
//   hh-meet      the two photos touch: a soft fabric "fwump" + two notes   (cards squeeze together)
//   hh-release   they let go mid-hug: a short falling sigh                 (ring dims, "don't let go yet")
//   hh-press     a thumb lands on the ring: a soft low touch               (ring sinks, glow blooms)
//   hh-tear      the coupon stub torn along the perforation                (stub rips away)

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

let done = false;
export function registerHugCues() {
  if (done) return;
  done = true;

  registerCue("hh-breath", (x) => {
    // a breath in (rising filtered noise), then a warm open fifth that blooms.
    const { b } = noise(x, "pink", x.t, 0.7, "bandpass", 500, 0.8, 0.22, 0.55);
    b.frequency.exponentialRampToValueAtTime(1800, x.t + 0.7);
    [130.81, 196.0, 261.63, 329.63].forEach((f, i) => osc(x, "sine", f, x.t + 0.55 + i * 0.05, 0.14 - i * 0.02, 0.25, 2.2));
    return 0.55;
  });

  registerCue("hh-word", (x) => {
    osc(x, "sine", 92, x.t, 0.42, 0.004, 0.32, 58);
    noise(x, "brown", x.t, 0.1, "lowpass", 420, 0.7, 0.28, 0.003);
    noise(x, "pink", x.t + 0.02, 0.5, "highpass", 5200, 0.7, 0.04, 0.05);
  });

  registerCue("hh-meet", (x) => {
    const { b } = noise(x, "pink", x.t, 0.22, "lowpass", 1400, 0.8, 0.3, 0.02);
    b.frequency.exponentialRampToValueAtTime(300, x.t + 0.25);
    osc(x, "sine", 110, x.t + 0.02, 0.36, 0.006, 0.3, 80);
    osc(x, "sine", 659.25, x.t + 0.12, 0.09, 0.01, 1.2);
    osc(x, "sine", 987.77, x.t + 0.24, 0.07, 0.01, 1.4);
    return 0.02;
  });

  registerCue("hh-release", (x) => {
    const { b } = noise(x, "pink", x.t, 0.45, "bandpass", 1600, 0.9, 0.12, 0.04);
    b.frequency.exponentialRampToValueAtTime(380, x.t + 0.5);
    osc(x, "sine", 392, x.t, 0.06, 0.02, 0.5, 300);
  });

  registerCue("hh-press", (x) => {
    osc(x, "sine", 160, x.t, 0.22, 0.01, 0.22, 110);
    noise(x, "brown", x.t, 0.06, "lowpass", 600, 0.7, 0.12, 0.004);
  });

  registerCue("hh-tear", (x) => {
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
    // paper fibres: jagged random steps instead of a smooth envelope.
    for (let i = 0; i < 26; i++) g.gain.setValueAtTime(0.08 + Math.random() * 0.3, x.t + (i / 26) * dur);
    g.gain.exponentialRampToValueAtTime(0.0001, x.t + dur + 0.05);
    s.connect(b).connect(g).connect(x.out);
    s.start(x.t, Math.random());
    s.stop(x.t + dur + 0.1);
  });
}
