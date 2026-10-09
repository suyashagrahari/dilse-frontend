// "Mwah Booth" SFX: procedural, zero files, short and cute (research §C7),
// ducked under the song by the kit's SFX bus. Each has a visual twin.
//
//   kmw-twist    lipstick base turning: tiny ratchet clicks           (lipstick rises)
//   kmw-open     gate sting: a cap pop, a mwah, a sparkle arpeggio     (gate pops away)
//   kmw-mwah     a cute "m-wah" (detune for variety)                   (a lip print lands)
//   kmw-shutter  booth flash: whine → click → pop                      (white flash)
//   kmw-print    the strip feeding out of the booth                    (frame slides out)
//   kmw-stick    a sticker pressed onto the strip                      (sticker squishes)
//   kmw-flip     a menu card turned over                               (3D flip)
//   kmw-boop     a squeaky nose boop                                   (nose card wobbles)
//   kmw-catch    a bright blip, pitched up by the combo                (kiss pops + score)
//   kmw-oops     a sad little wah-wah                                  (bear cries)
//   kmw-ding     ding-ding: the game is won                            (score card)
//   kmw-seal     the kiss seal popping off the envelope                (flap opens)
//   kmw-whisper  a breathy "shh" swell                                 (come closer…)
//   kmw-stamp    thud + three-note chime                               (kiss on his photo)

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
/** "m-wah": a lip smack, then a rising-falling "wah" vowel. */
const mwah = (x: X, t: number, k = 1) => {
  noise(x, "white", t, 0.018, "bandpass", 2100, 2.4, 0.3 * k, 0.002);
  osc(x, "sine", 1100, t + 0.015, 0.22 * k, 0.003, 0.06, 420);
  const o = osc(x, "triangle", 520, t + 0.08, 0.13 * k, 0.03, 0.18, 360);
  o.frequency.linearRampToValueAtTime(760 * x.k, t + 0.14);
};
const chime = (x: X, t: number, notes: number[], step = 0.09, peak = 0.12, d = 0.7) =>
  notes.forEach((f, i) => {
    osc(x, "sine", f, t + i * step, peak, 0.004, d);
    osc(x, "sine", f * 2, t + i * step, peak * 0.25, 0.004, d * 0.6);
  });

let done = false;
export function registerMwahCues() {
  if (done) return;
  done = true;

  registerCue("kmw-twist", (x) => {
    for (let i = 0; i < 5; i++) noise(x, "white", x.t + i * 0.045, 0.012, "bandpass", 3200 + i * 260, 4, 0.16, 0.001);
    osc(x, "sine", 600, x.t, 0.04, 0.01, 0.2, 900);
  });

  registerCue("kmw-open", (x) => {
    osc(x, "sine", 420, x.t, 0.3, 0.003, 0.08, 900);
    noise(x, "white", x.t, 0.03, "highpass", 2400, 0.7, 0.2, 0.001);
    mwah(x, x.t + 0.16, 1.1);
    chime(x, x.t + 0.4, [1046.5, 1318.5, 1568, 2093]);
    return 0.16;
  });

  registerCue("kmw-mwah", (x) => mwah(x, x.t, 1.2));

  registerCue("kmw-shutter", (x) => {
    osc(x, "sine", 2400, x.t, 0.04, 0.1, 0.04, 6400);
    noise(x, "white", x.t + 0.14, 0.012, "highpass", 2500, 0.7, 0.45, 0.001);
    osc(x, "square", 120, x.t + 0.14, 0.1, 0.001, 0.035, 80);
    noise(x, "white", x.t + 0.2, 0.018, "bandpass", 1800, 1.2, 0.3, 0.001);
    return 0.14;
  });

  registerCue("kmw-print", (x) => {
    const dur = x.o.dur ?? 0.5;
    const o = x.c.createOscillator();
    const g = x.c.createGain();
    const lp = x.c.createBiquadFilter();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(70 * x.k, x.t);
    o.frequency.linearRampToValueAtTime(86 * x.k, x.t + dur);
    lp.type = "lowpass";
    lp.frequency.value = 520;
    env(g, x.t, 0.12, 0.05, dur);
    o.connect(lp).connect(g).connect(x.out);
    o.start(x.t);
    o.stop(x.t + dur + 0.1);
  });

  registerCue("kmw-stick", (x) => {
    osc(x, "sine", 300, x.t, 0.26, 0.003, 0.09, 700);
    noise(x, "pink", x.t + 0.02, 0.06, "bandpass", 1500, 1, 0.1, 0.005);
  });

  registerCue("kmw-flip", (x) => {
    const { b } = noise(x, "white", x.t, 0.08, "bandpass", 1200, 1.1, 0.28, 0.01);
    b.frequency.exponentialRampToValueAtTime(4200, x.t + 0.09);
    osc(x, "sine", 880, x.t + 0.1, 0.06, 0.004, 0.2, 1320);
  });

  registerCue("kmw-boop", (x) => {
    osc(x, "sine", 700, x.t, 0.22, 0.004, 0.12, 1500);
    osc(x, "triangle", 1400, x.t + 0.03, 0.06, 0.004, 0.08, 2100);
  });

  registerCue("kmw-catch", (x) => {
    osc(x, "sine", 880, x.t, 0.18, 0.003, 0.09, 1760);
    osc(x, "triangle", 1760, x.t + 0.05, 0.06, 0.003, 0.12);
  });

  registerCue("kmw-oops", (x) => {
    osc(x, "triangle", 440, x.t, 0.14, 0.01, 0.18, 380);
    osc(x, "triangle", 370, x.t + 0.2, 0.14, 0.01, 0.3, 260);
  });

  registerCue("kmw-ding", (x) => {
    chime(x, x.t, [1568, 2093], 0.14, 0.16, 0.9);
    chime(x, x.t + 0.3, [1318.5, 1568, 2093, 2637], 0.07, 0.08, 0.8);
  });

  registerCue("kmw-seal", (x) => {
    osc(x, "sine", 260, x.t, 0.3, 0.003, 0.1, 620);
    const { b } = noise(x, "pink", x.t + 0.06, 0.3, "bandpass", 900, 0.8, 0.16, 0.03);
    b.frequency.exponentialRampToValueAtTime(3200, x.t + 0.36);
    chime(x, x.t + 0.18, [1318.5, 1568, 2093], 0.08, 0.08, 0.6);
  });

  registerCue("kmw-whisper", (x) => {
    const { b } = noise(x, "pink", x.t, 0.9, "bandpass", 2400, 1.4, 0.16, 0.45);
    b.frequency.linearRampToValueAtTime(5200, x.t + 1.2);
  });

  registerCue("kmw-stamp", (x) => {
    osc(x, "sine", 140, x.t, 0.4, 0.004, 0.14, 80);
    noise(x, "brown", x.t, 0.1, "lowpass", 360, 0.7, 0.3, 0.004);
    mwah(x, x.t + 0.05, 0.8);
    chime(x, x.t + 0.2, [1046.5, 1318.5, 1568], 0.11, 0.12, 1);
    return 0.05;
  });
}
