// "The Premiere" — the template's own procedural cues (registered once, on import). Zero audio bytes; routed
// through the kit's SFX bus, so the 🔊 chip and "open quietly" silence them too. Every cue has a visual twin:
//
//   pr-start    gate: shutter clack + the projector motor spinning up      ↔ the house lights dip, bars close
//   pr-beep     leader: the 1 kHz "pop" on 3, 2, 1                         ↔ the number flashes
//   pr-type     typewriter keys (count = keys)                             ↔ letters appearing
//   pr-clap     the slate clap on "Roll film" / scene cuts                 ↔ the white cut flash
//   pr-detent   focus-ring detent while dragging                           ↔ the ring's tick marks passing
//   pr-braam    trailer hit (low brass-ish swell + sub)                    ↔ the trailer card slamming in
//   pr-applause the audience on YES                                       ↔ sparkles rising, bars opening
//   pr-ding     a soft "lock" when the focus snaps sharp                   ↔ the focus brackets turning gold

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
  return { o, g };
}
function noise(x: X, color: "white" | "pink" | "brown", t: number, dur: number, peak: number, a: number, ftype: BiquadFilterType, f: number, q = 1) {
  const buf = noiseBuffer(color);
  if (!buf) return null;
  const s = x.c.createBufferSource();
  s.buffer = buf;
  const b = x.c.createBiquadFilter();
  b.type = ftype;
  b.frequency.value = f;
  b.Q.value = q;
  const g = x.c.createGain();
  env(g, t, peak, a, Math.max(0.004, dur - a));
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random() * 1.2);
  s.stop(t + dur + 0.05);
  return { s, b, g };
}

const CUES: Record<string, CueFn> = {
  "pr-start": (x) => {
    // two shutter clacks, then the motor winds up under a soft warm tone
    noise(x, "white", x.t, 0.03, 0.5, 0.001, "bandpass", 2600, 2);
    noise(x, "white", x.t + 0.11, 0.03, 0.35, 0.001, "bandpass", 2100, 2);
    const m = x.c.createOscillator();
    const mf = x.c.createBiquadFilter();
    const mg = x.c.createGain();
    m.type = "sawtooth";
    m.frequency.setValueAtTime(18, x.t + 0.1);
    m.frequency.exponentialRampToValueAtTime(48, x.t + 0.9);
    mf.type = "lowpass";
    mf.frequency.value = 520;
    mg.gain.setValueAtTime(0.0001, x.t + 0.1);
    mg.gain.linearRampToValueAtTime(0.16, x.t + 0.45);
    mg.gain.exponentialRampToValueAtTime(0.0001, x.t + 1.3);
    m.connect(mf).connect(mg).connect(x.out);
    m.start(x.t + 0.1);
    m.stop(x.t + 1.35);
    tone(x, "sine", 392, x.t + 0.25, 0.08, 0.3, 1.2);
    tone(x, "sine", 587.3, x.t + 0.32, 0.05, 0.3, 1.1);
    return 1.4;
  },
  "pr-beep": (x) => {
    tone(x, "sine", 1000, x.t, 0.22, 0.003, 0.09);
  },
  "pr-type": (x) => {
    const n = Math.max(1, Math.min(24, x.o.count ?? 1));
    for (let i = 0; i < n; i++) {
      const t = x.t + i * (0.055 + Math.random() * 0.05);
      noise(x, "white", t, 0.018, 0.22 + Math.random() * 0.08, 0.001, "highpass", 2400 + Math.random() * 1400, 0.7);
      tone(x, "triangle", 180 + Math.random() * 40, t, 0.08, 0.001, 0.035);
    }
    return n * 0.08;
  },
  "pr-clap": (x) => {
    noise(x, "white", x.t, 0.06, 0.6, 0.001, "bandpass", 1900, 1.4);
    noise(x, "pink", x.t, 0.12, 0.25, 0.001, "lowpass", 900);
    tone(x, "sine", 140, x.t, 0.3, 0.002, 0.12, 70);
  },
  "pr-detent": (x) => {
    tone(x, "square", 2600, x.t, 0.035, 0.001, 0.012);
    noise(x, "white", x.t, 0.01, 0.06, 0.001, "highpass", 5000);
  },
  "pr-ding": (x) => {
    tone(x, "sine", 1568, x.t, 0.12, 0.004, 0.9);
    tone(x, "sine", 2349, x.t + 0.03, 0.06, 0.004, 0.7);
  },
  "pr-braam": (x) => {
    const dur = x.o.dur ?? 1.8;
    const lp = x.c.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 6;
    lp.frequency.setValueAtTime(120, x.t);
    lp.frequency.exponentialRampToValueAtTime(1400, x.t + 0.18);
    lp.frequency.exponentialRampToValueAtTime(160, x.t + dur);
    const g = x.c.createGain();
    env(g, x.t, 0.32, 0.03, dur);
    lp.connect(g).connect(x.out);
    for (const f of [55, 82.4, 110, 164.8]) {
      const o = x.c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f * x.k;
      o.detune.value = (Math.random() - 0.5) * 14;
      o.connect(lp);
      o.start(x.t);
      o.stop(x.t + dur + 0.1);
    }
    tone(x, "sine", 62, x.t, 0.5, 0.005, 0.7, 38);
    noise(x, "brown", x.t, 0.4, 0.3, 0.004, "lowpass", 260);
    return dur;
  },
  "pr-applause": (x) => {
    const dur = x.o.dur ?? 3.2;
    const claps = Math.round(dur * 46);
    for (let i = 0; i < claps; i++) {
      // swell in, hold, thin out
      const u = i / claps;
      const t = x.t + u * dur + Math.random() * 0.05;
      const lvl = (u < 0.2 ? u / 0.2 : u > 0.7 ? (1 - u) / 0.3 : 1) * (0.05 + Math.random() * 0.07);
      noise(x, "white", t, 0.035, lvl, 0.002, "bandpass", 900 + Math.random() * 2200, 1.1);
    }
    return dur;
  },
};

let done = false;
export function registerPremiereCues() {
  if (done) return;
  done = true;
  for (const [id, fn] of Object.entries(CUES)) registerCue(id, fn);
}
