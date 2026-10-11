// ─── Teddy Day — tiny synthesised arcade sounds ──────────────────────────────
// Coin clink, claw whirr, win jingle, plush squeak. Zero bytes; only played
// while the page's music is on; best-effort, never throws.

let ac: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ac) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === "suspended") void ac.resume();
    return ac;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, slideTo?: number) {
  const a = ctx();
  if (!a) return;
  try {
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch {
    /* bonus */
  }
}

export const tsfx = {
  coin(on: boolean) {
    if (!on) return;
    tone(1568, 0.09, "square", 0.05);
    tone(2093, 0.22, "square", 0.05, 0.08);
  },
  whirr(on: boolean, dur = 0.8) {
    if (!on) return;
    tone(110, dur, "sawtooth", 0.025, 0, 150);
  },
  clack(on: boolean) {
    if (!on) return;
    tone(320, 0.06, "square", 0.05);
  },
  aww(on: boolean) {
    if (!on) return;
    tone(440, 0.35, "triangle", 0.06, 0, 260);
  },
  win(on: boolean) {
    if (!on) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "square", 0.045, i * 0.09));
  },
  squeak(on: boolean) {
    if (!on) return;
    tone(900, 0.12, "sine", 0.08, 0, 1500);
  },
};
