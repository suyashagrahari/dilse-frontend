// ─── The workshop's own cues (registered once into the shared SFX bank) ──────
//
// Procedural, zero bytes; each has a visual twin:
//   td-crickets (bed)  porch at night (gate)        td-twine / td-flap   twine slips, flaps open
//   td-clock (bed)     workshop clock (workshop)    td-ratchet           crank teeth (every 30°)
//   td-fluff           fluff puff cloud             td-rub               heart rub (each swipe turn)
//   td-blush           cheek blush                  td-shh (bed)         the whisper at the ear
//   td-thump           heart drops in / heartbeat   td-needle + td-thread  each stitch
//   td-glint           eyes catch the light         td-squeak            the wake-up stretch
//   td-torch           torch click                  td-swish             blanket / drapes
//   td-starlamp (bed)  music-box star lamp          td-whump             pillow shuffle
//   td-giggle          teddy found                  td-yawn              bedtime
//   td-squish          squish wobble

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
function noise(x: X, color: "white" | "pink" | "brown", t: number, peak: number, a: number, d: number, type: BiquadFilterType, f: number, q = 1) {
  const s = x.c.createBufferSource();
  s.buffer = noiseBuffer(color);
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  const g = envG(x, t, peak, a, d);
  s.connect(b).connect(g).connect(x.out);
  s.start(t, Math.random());
  s.stop(t + a + d + 0.05);
  return b;
}
function loop(x: X, color: "white" | "pink" | "brown", type: BiquadFilterType, f: number, q: number, level: number) {
  const s = x.c.createBufferSource();
  s.buffer = noiseBuffer(color);
  s.loop = true;
  const b = x.c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  const g = x.c.createGain();
  g.gain.setValueAtTime(0.0001, x.t);
  g.gain.linearRampToValueAtTime(level, x.t + 1);
  s.connect(b).connect(g).connect(x.out);
  s.start(x.t, Math.random());
  x.keep(s);
  return { b, g };
}

let done = false;
export function registerWorkshopCues() {
  if (done) return;
  done = true;
  registerCue("td-crickets", (x: X) => {
    loop(x, "brown", "lowpass", 300, 0.7, 0.12);
    const len = Math.floor(x.c.sampleRate * 4);
    const buf = x.c.createBuffer(1, len, x.c.sampleRate);
    const d = buf.getChannelData(0);
    for (let n = 0; n < 3; n++) {
      const at = Math.floor(Math.random() * (len - x.c.sampleRate * 0.2));
      for (let p = 0; p < 3; p++)
        for (let i = 0; i < 440; i++) d[at + p * 1100 + i] += Math.sin((i / x.c.sampleRate) * 4400 * 6.283) * Math.sin((i / 440) * Math.PI) * 0.18;
    }
    const s = x.c.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.connect(x.out);
    s.start(x.t);
    x.keep(s);
  }, { bed: true });
  registerCue("td-twine", (x: X) => {
    noise(x, "white", x.t, 0.3, 0.03, 0.18, "bandpass", 1200, 2);
    noise(x, "white", x.t + 0.22, 0.35, 0.002, 0.03, "highpass", 2500);
    noise(x, "white", x.t + 0.28, 0.3, 0.002, 0.03, "highpass", 2500);
  });
  registerCue("td-flap", (x: X) => {
    noise(x, "pink", x.t, 0.4, 0.01, 0.09, "lowpass", 900);
    osc(x, "sine", 110, x.t, 0.3, 0.005, 0.1, 70);
  });
  registerCue("td-clock", (x: X) => {
    const len = Math.floor(x.c.sampleRate * 2);
    const buf = x.c.createBuffer(1, len, x.c.sampleRate);
    const d = buf.getChannelData(0);
    for (const [at, f] of [[0, 3000], [x.c.sampleRate, 2400]]) for (let i = 0; i < 260; i++) d[at + i] = Math.sin((i / x.c.sampleRate) * f * 6.283) * Math.exp(-i / 50) * 0.35;
    const s = x.c.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    const g = x.c.createGain();
    g.gain.value = 0.5;
    s.connect(g).connect(x.out);
    s.start(x.t);
    x.keep(s);
  }, { bed: true });
  registerCue("td-ratchet", (x: X) => {
    noise(x, "white", x.t, 0.35, 0.001, 0.004, "bandpass", 2000, 2);
    osc(x, "sine", 3300, x.t, 0.05, 0.001, 0.04);
  });
  registerCue("td-fluff", (x: X) => {
    noise(x, "pink", x.t, 0.3, 0.06, 0.16, "lowpass", 500);
  });
  registerCue("td-rub", (x: X) => {
    noise(x, "pink", x.t, 0.3, 0.02, 0.08, "bandpass", 700, 1.4);
  });
  registerCue("td-blush", (x: X) => {
    osc(x, "sine", 1318.5, x.t, 0.12, 0.01, 0.25);
    osc(x, "sine", 1661.2, x.t + 0.12, 0.12, 0.01, 0.3);
  });
  registerCue("td-shh", (x: X) => {
    const { g } = loop(x, "white", "highpass", 3000, 0.7, 0.18);
    const l = x.c.createOscillator();
    const lg = x.c.createGain();
    l.frequency.value = 4;
    lg.gain.value = 0.08;
    l.connect(lg).connect(g.gain);
    l.start(x.t);
    x.keep(l);
  }, { bed: true });
  registerCue("td-thump", (x: X) => {
    osc(x, "sine", 65, x.t, 0.8, 0.004, 0.1, 45);
    osc(x, "sine", 60, x.t + 0.22, 0.5, 0.004, 0.1, 42);
  });
  registerCue("td-needle", (x: X) => {
    noise(x, "white", x.t, 0.3, 0.001, 0.003, "highpass", 3000);
    osc(x, "sine", 1400, x.t, 0.12, 0.002, 0.03);
  });
  registerCue("td-thread", (x: X) => {
    const b = noise(x, "white", x.t, 0.2, 0.02, 0.16, "bandpass", 2000, 3);
    b.frequency.exponentialRampToValueAtTime(4000, x.t + 0.18);
  });
  registerCue("td-glint", (x: X) => {
    osc(x, "sine", 2600, x.t, 0.1, 0.005, 0.25);
    osc(x, "sine", 5200, x.t + 0.02, 0.05, 0.005, 0.2);
  });
  registerCue("td-squeak", (x: X) => {
    const o = x.c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(600 * x.k, x.t);
    o.frequency.linearRampToValueAtTime(1100 * x.k, x.t + 0.15);
    o.frequency.linearRampToValueAtTime(800 * x.k, x.t + 0.3);
    const v = x.c.createOscillator();
    const vg = x.c.createGain();
    v.frequency.value = 28;
    vg.gain.value = 40;
    v.connect(vg).connect(o.frequency);
    const g = envG(x, x.t, 0.18, 0.02, 0.3);
    o.connect(g).connect(x.out);
    o.start(x.t);
    v.start(x.t);
    o.stop(x.t + 0.36);
    v.stop(x.t + 0.36);
  });
  registerCue("td-torch", (x: X) => {
    noise(x, "white", x.t, 0.4, 0.001, 0.005, "highpass", 2000);
    osc(x, "sine", 3000, x.t, 0.08, 0.001, 0.015);
  });
  registerCue("td-swish", (x: X) => {
    const b = noise(x, "pink", x.t, 0.35, 0.08, 0.35, "lowpass", 1500);
    b.frequency.exponentialRampToValueAtTime(400, x.t + 0.4);
  });
  registerCue("td-starlamp", (x: X) => {
    const notes = [1046.5, 1174.7, 1318.5, 1568, 1760];
    const len = Math.floor(x.c.sampleRate * 3.2);
    const buf = x.c.createBuffer(1, len, x.c.sampleRate);
    const d = buf.getChannelData(0);
    for (let n = 0; n < 8; n++) {
      const at = Math.floor(n * 0.4 * x.c.sampleRate);
      const f = notes[(n * 3) % 5];
      for (let i = 0; i < x.c.sampleRate * 0.5 && at + i < len; i++) {
        const t = i / x.c.sampleRate;
        d[at + i] += (2 * Math.abs(2 * ((t * f) % 1) - 1) - 1) * Math.exp(-t * 7) * 0.12;
      }
    }
    const s = x.c.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    const g = x.c.createGain();
    g.gain.value = 0.5;
    s.connect(g).connect(x.out);
    s.start(x.t);
    x.keep(s);
  }, { bed: true });
  registerCue("td-whump", (x: X) => {
    noise(x, "pink", x.t, 0.45, 0.01, 0.12, "lowpass", 300);
  });
  registerCue("td-giggle", (x: X) => {
    for (let i = 0; i < 3; i++) osc(x, "sine", 900 + i * 80, x.t + i * 0.09, 0.14, 0.005, 0.07, 1300 + i * 80);
  });
  registerCue("td-yawn", (x: X) => {
    osc(x, "sine", 400, x.t, 0.12, 0.15, 0.75, 250);
    noise(x, "pink", x.t, 0.08, 0.2, 0.7, "bandpass", 900, 0.8);
  });
  registerCue("td-squish", (x: X) => {
    osc(x, "sine", 700 + Math.random() * 160 - 80, x.t, 0.16, 0.01, 0.15, 1000);
  });
}
