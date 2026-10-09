// Template cues for "The Rose Garden" (procedural, 0 bytes): a water drip, a boing, a sprout pop and the
// three-note "aww" chime (C6-E6-G6). Registered once; played through the kit's sfx() (ducked, mute-aware).
import { registerCue } from "../../../_valentine/kit/premium";

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

let done = false;
export function registerGardenCues() {
  if (done) return;
  done = true;
  registerCue("rg-drip", (x: X) => {
    osc(x, "sine", 520 + Math.random() * 160, x.t, 0.22, 0.004, 0.09, 1500);
  });
  registerCue("rg-boing", (x: X) => {
    osc(x, "sine", 180, x.t, 0.32, 0.01, 0.32, 520);
    osc(x, "triangle", 360, x.t + 0.02, 0.08, 0.01, 0.25, 980);
  });
  registerCue("rg-sprout", (x: X) => {
    osc(x, "sine", 440, x.t, 0.3, 0.004, 0.12, 1320);
    osc(x, "triangle", 1760, x.t + 0.09, 0.08, 0.004, 0.2);
  });
  registerCue("rg-aww", (x: X) => {
    [1046.5, 1318.5, 1568].forEach((f, i) => osc(x, "sine", f, x.t + i * 0.09, 0.16, 0.006, 0.42));
    osc(x, "triangle", 2093, x.t + 0.27, 0.05, 0.006, 0.5);
  });
}
