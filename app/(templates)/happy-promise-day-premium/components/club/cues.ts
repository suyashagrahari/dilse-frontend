// "The Pinky Promise Club": the template's own cute procedural cues (registered once, on import). Zero audio bytes,
// routed through the kit's SFX bus, so the 🔊 chip and "open quietly" silence them too. Each is short (< 0.7 s) and
// sits under the song. Every cue has a visual twin:
//
//   pk-hook    a little "click" + a bright up-chirp (the pinkies hook)    ↔ the hands lock, a heart pops between them
//   pk-rattle  paper stars rattling in a glass jar (tap / shake)          ↔ the jar wobbles
//   pk-star    a soft pop that rises (a paper star unfolds)               ↔ the star flies out and opens into a note
//   pk-stamp   a rubber stamp thump (APPROVED)                            ↔ the stamp lands with a wobble
//   pk-bead    a wooden bead clack (a letter bead slides on the string)   ↔ the bead hops onto the string
//   pk-boop    a squeaky "nope" (wrong bead)                              ↔ the bead wiggles back
//   pk-snap    a padlock snapping shut (diary lock / love lock)            ↔ the shackle drops in
//   pk-reel    a cassette deck clunk (the tape starts)                    ↔ the reels begin to turn
//   pk-tada    a tiny 4-note tada (a scene's reveal)                      ↔ the heart burst

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
  "pk-hook": (x) => {
    noise(x, x.t, 0.025, 0.3, "bandpass", 3800, 3);
    tone(x, "triangle", 880, x.t + 0.03, 0.12, 0.004, 0.12, 1320);
    tone(x, "sine", 1760, x.t + 0.1, 0.09, 0.004, 0.35);
    return 0.5;
  },
  "pk-rattle": (x) => {
    for (let i = 0; i < 7; i++) {
      const t = x.t + i * 0.045 + Math.random() * 0.02;
      noise(x, t, 0.02, 0.16 + Math.random() * 0.08, "bandpass", 2600 + Math.random() * 2200, 4);
      if (i % 2 === 0) tone(x, "sine", 2400 + Math.random() * 900, t, 0.03, 0.002, 0.05);
    }
    return 0.4;
  },
  "pk-star": (x) => {
    tone(x, "sine", 420, x.t, 0.22, 0.004, 0.09, 860);
    noise(x, x.t + 0.04, 0.12, 0.08, "highpass", 3000);
    tone(x, "sine", 1568, x.t + 0.1, 0.07, 0.004, 0.3);
    return 0.45;
  },
  "pk-stamp": (x) => {
    tone(x, "sine", 150, x.t, 0.4, 0.002, 0.16, 70);
    noise(x, x.t, 0.06, 0.35, "lowpass", 1200);
    noise(x, x.t + 0.01, 0.03, 0.15, "bandpass", 3000, 2);
  },
  "pk-bead": (x) => {
    noise(x, x.t, 0.03, 0.28, "bandpass", 1800, 6);
    tone(x, "sine", 1100, x.t, 0.1, 0.002, 0.06, 900);
    noise(x, x.t + 0.05, 0.02, 0.1, "bandpass", 2400, 6);
  },
  "pk-boop": (x) => {
    tone(x, "square", 520, x.t, 0.05, 0.004, 0.09, 380);
    tone(x, "sine", 390, x.t + 0.08, 0.08, 0.004, 0.12, 300);
  },
  "pk-snap": (x) => {
    noise(x, x.t, 0.018, 0.4, "highpass", 2500);
    tone(x, "square", 2200, x.t, 0.05, 0.001, 0.03);
    noise(x, x.t + 0.06, 0.03, 0.3, "bandpass", 1600, 3);
    tone(x, "sine", 260, x.t + 0.06, 0.18, 0.002, 0.1, 160);
    return 0.3;
  },
  "pk-reel": (x) => {
    noise(x, x.t, 0.05, 0.25, "lowpass", 900);
    tone(x, "sine", 180, x.t, 0.15, 0.002, 0.08, 110);
    noise(x, x.t + 0.08, 0.35, 0.04, "bandpass", 700, 1.5);
    return 0.5;
  },
  "pk-tada": (x) => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => tone(x, "triangle", f, x.t + i * 0.07, i === 3 ? 0.14 : 0.1, 0.004, i === 3 ? 0.6 : 0.18));
    return 0.9;
  },
};

let done = false;
export function registerClubCues() {
  if (done) return;
  done = true;
  for (const [id, fn] of Object.entries(CUES)) registerCue(id, fn);
}
