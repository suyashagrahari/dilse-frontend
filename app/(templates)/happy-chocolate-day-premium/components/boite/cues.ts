// "La Boîte"'s own cues, registered once into the shared SFX bank. Procedural, zero bytes; each has a visual twin:
//   lb-lid     the lid's felt "thwoop" as it leaves the box          (the lid rising off the tray)
//   lb-lift    a bonbon lifted out of its glassine cup (crackle+pop)  (the piece rising and scaling up)
//   lb-flip    the piece turned over in the fingers                   (the 3D flip)
//   lb-set     the piece set back into its cup                        (it sinks back, a gold ring marks it tasted)
//   lb-dust    a soft brush through cocoa powder                      (the dust clearing under the finger)
//   lb-glint   a foil glint                                           (the gold sheen sweeping the heart)

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
function noise(x: X, color: "white" | "pink" | "brown", t: number, peak: number, a: number, d: number, type: BiquadFilterType, f: number, q = 1, to?: number) {
  const s = x.c.createBufferSource();
  s.buffer = noiseBuffer(color);
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.setValueAtTime(f, t);
  if (to) b.frequency.exponentialRampToValueAtTime(to, t + a + d);
  b.Q.value = q;
  const g = envG(x, t, peak, a, d);
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random());
  s.stop(t + a + d + 0.05);
}

let done = false;
export function registerBoiteCues() {
  if (done) return;
  done = true;
  registerCue("lb-lid", (x: X) => {
    osc(x, "sine", 70, x.t, 0.5, 0.18, 0.5, 150);
    noise(x, "pink", x.t, 0.32, 0.25, 0.55, "lowpass", 300, 0.8, 1400);
  });
  registerCue("lb-lift", (x: X) => {
    for (let i = 0; i < 5; i++) noise(x, "white", x.t + Math.random() * 0.09, 0.12, 0.002, 0.012 + Math.random() * 0.02, "bandpass", 3500 + Math.random() * 3000, 1.4);
    osc(x, "sine", 520, x.t + 0.1, 0.16, 0.004, 0.09, 880);
  });
  registerCue("lb-flip", (x: X) => {
    noise(x, "pink", x.t, 0.22, 0.05, 0.22, "bandpass", 700, 0.9, 2400);
    osc(x, "triangle", 1568, x.t + 0.24, 0.05, 0.004, 0.35);
  });
  registerCue("lb-set", (x: X) => {
    osc(x, "sine", 220, x.t, 0.32, 0.003, 0.12, 140);
    noise(x, "white", x.t, 0.08, 0.001, 0.03, "bandpass", 2600, 1.2);
  });
  registerCue("lb-dust", (x: X) => {
    noise(x, "pink", x.t, 0.16, 0.03, 0.16, "bandpass", 900 + Math.random() * 500, 0.7);
  });
  registerCue("lb-glint", (x: X) => {
    [1318.5, 1760, 2349.3].forEach((f, i) => osc(x, "sine", f, x.t + i * 0.06, 0.06, 0.01, 1.1));
    for (let i = 0; i < 4; i++) osc(x, "sine", 3200 + Math.random() * 2400, x.t + 0.15 + Math.random() * 0.6, 0.03, 0.002, 0.12);
  });
}
