// ─── Chocolate Day — tiny synthesised sound effects ──────────────────────────
//
// Zero bytes: a crinkle (foil), a crunch (bite), a pop (ribbon). Only played
// when the page's music is on (the sender's toggle + the visitor's own), so a
// muted page stays silent. Every call is best-effort and never throws.

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

function noise(a: AudioContext, dur: number): AudioBufferSourceNode {
  const buf = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * dur)), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  return src;
}

function burstNoise(freq: number, q: number, dur: number, vol: number, delay = 0) {
  const a = ctx();
  if (!a) return;
  try {
    const t = a.currentTime + delay;
    const src = noise(a, dur);
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
    src.stop(t + dur + 0.02);
  } catch {
    /* audio is a bonus */
  }
}

export const sfx = {
  crinkle(on: boolean) {
    if (!on) return;
    burstNoise(5200, 0.9, 0.05, 0.05);
    burstNoise(3600, 1.2, 0.04, 0.04, 0.045);
  },
  crunch(on: boolean) {
    if (!on) return;
    burstNoise(1400, 0.8, 0.11, 0.16);
    burstNoise(900, 1.1, 0.09, 0.12, 0.07);
    burstNoise(2200, 1.4, 0.06, 0.07, 0.12);
  },
  pop(on: boolean) {
    if (!on) return;
    const a = ctx();
    if (!a) return;
    try {
      const t = a.currentTime;
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(520, t);
      o.frequency.exponentialRampToValueAtTime(1040, t + 0.09);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(a.destination);
      o.start(t);
      o.stop(t + 0.2);
    } catch {
      /* bonus */
    }
  },
};
