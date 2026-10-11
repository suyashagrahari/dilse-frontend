// "The Little Proposal": the template's own cute procedural cues (registered once, on import). Zero audio bytes,
// routed through the kit's SFX bus, so the 🔊 chip and "open quietly" silence them too. Each is short (< 0.6 s) and
// sits under the song. Every cue has a visual twin:
//
//   lp-boing   a cartoon spring (comic panel / gift box hops)        ↔ the panel or box squash-and-stretches
//   lp-ding    "ding-ding!" win bell (the ring box is found)          ↔ the box glows and the ring rises
//   lp-stamp   a rubber stamp thump (the certificate is signed)      ↔ the ring stamp lands with a wobble
//   lp-boop    a squeaky little "boop" (No runs away)                ↔ the No button hops and shrinks
//   lp-swipe   a soft paper flick (a story card is swiped away)      ↔ the card flies off with a tilt
//   lp-tada    a tiny 4-note tada (a scene's reveal)                 ↔ the heart burst

import { noiseBuffer, registerCue } from "../../../_valentine/kit/premium";

type CueFn = Parameters<typeof registerCue>[1];
type X = Parameters<CueFn>[0];

function env(g: GainNode, t: number, peak: number, a: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function tone(x: X, type: OscillatorType, f: number, t: number, peak: number, a: number, d: number, to?: number) {
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
function noise(x: X, t: number, dur: number, peak: number, ftype: BiquadFilterType, f: number, q = 1) {
  const buf = noiseBuffer("white");
  if (!buf) return;
  const s = x.c.createBufferSource();
  s.buffer = buf;
  const b = x.c.createBiquadFilter();
  b.type = ftype;
  b.frequency.value = f;
  b.Q.value = q;
  const g = x.c.createGain();
  env(g, t, peak, 0.002, Math.max(0.01, dur));
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random());
  s.stop(t + dur + 0.05);
}

const CUES: Record<string, CueFn> = {
  "lp-boing": (x) => {
    // a sine that wobbles down: the classic cartoon spring
    const o = x.c.createOscillator();
    const lfo = x.c.createOscillator();
    const lg = x.c.createGain();
    const g = x.c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(320 * x.k, x.t);
    o.frequency.exponentialRampToValueAtTime(150 * x.k, x.t + 0.45);
    lfo.frequency.value = 22;
    lg.gain.value = 38;
    lfo.connect(lg).connect(o.frequency);
    env(g, x.t, 0.22, 0.005, 0.45);
    o.connect(g).connect(x.out);
    o.start(x.t);
    lfo.start(x.t);
    o.stop(x.t + 0.5);
    lfo.stop(x.t + 0.5);
    return 0.5;
  },
  "lp-ding": (x) => {
    tone(x, "sine", 1318.5, x.t, 0.16, 0.003, 0.5);
    tone(x, "sine", 2637, x.t, 0.04, 0.003, 0.3);
    tone(x, "sine", 1760, x.t + 0.16, 0.16, 0.003, 0.7);
    tone(x, "sine", 3520, x.t + 0.16, 0.04, 0.003, 0.35);
    return 0.9;
  },
  "lp-stamp": (x) => {
    tone(x, "sine", 150, x.t, 0.4, 0.002, 0.16, 70);
    noise(x, x.t, 0.06, 0.35, "lowpass", 1200);
    noise(x, x.t + 0.01, 0.03, 0.15, "bandpass", 3000, 2);
  },
  "lp-boop": (x) => {
    tone(x, "square", 660, x.t, 0.05, 0.004, 0.09, 990);
    tone(x, "sine", 880, x.t + 0.07, 0.09, 0.004, 0.12, 1320);
  },
  "lp-swipe": (x) => {
    noise(x, x.t, 0.16, 0.18, "bandpass", 2400, 0.8);
    tone(x, "sine", 500, x.t, 0.03, 0.01, 0.12, 900);
  },
  "lp-tada": (x) => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => tone(x, "triangle", f, x.t + i * 0.07, i === 3 ? 0.14 : 0.1, 0.004, i === 3 ? 0.6 : 0.18));
    return 0.9;
  },
};

let done = false;
export function registerProposalCues() {
  if (done) return;
  done = true;
  for (const [id, fn] of Object.entries(CUES)) registerCue(id, fn);
}
