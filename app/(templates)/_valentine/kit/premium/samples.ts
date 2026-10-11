// ─── Sample SFX: real recorded sounds (MP3) on the page's one AudioContext ────
//
//   import { loadSample, playSample } from "../../_valentine/kit/premium";
//   loadSample("boo", BOO_SCARE_URL);            // any time — fetches now, decodes after the gate tap
//   playSample("boo", { gain: 1.4 });            // inside/after a tap: plays in ~0 ms once decoded
//
// The bytes are fetched as soon as loadSample() runs (no AudioContext needed);
// decoding waits for the context, which only exists after the gate's
// unlockAudioInGesture() — creating it earlier would start it suspended and,
// on iOS, before the "playback" audio session is set. Once unlocked, every
// loaded sample decodes straight away, so a later playSample() is instant.
//
// Routed through the SFX bus (./audio.ts), so the 🔊/🔇 chip, "open quietly"
// and a hidden tab silence samples exactly like the procedural sfx() cues.
// Like sfx(), playSample() is a no-op before the gate tap or while muted.

import { audioSnapshot, getAudioContext, getSfxBus, soundOn, subscribeAudio } from "./audio";
import type { CueHandle } from "./sfx";

export interface SampleOptions {
  /** 0–2, multiplies the SFX bus level (default 1). */
  gain?: number;
  /** -1 (left) … 1 (right). */
  pan?: number;
  /** Playback rate (default 1; 0.9–1.1 adds variety). */
  rate?: number;
  /**
   * If the sample is still decoding when called, play it anyway when ready —
   * unless that is more than this many ms late (default 350). A scare that
   * lands a second after the picture is worse than none.
   */
  maxLateMs?: number;
}

interface Entry {
  url: string;
  bytes: Promise<ArrayBuffer | null>;
  buffer: AudioBuffer | null;
  decoding: Promise<AudioBuffer | null> | null;
}

const bank = new Map<string, Entry>();
const NOOP: CueHandle = { stop: () => {}, peakIn: 0 };
let unlockBound = false;

function decode(e: Entry): Promise<AudioBuffer | null> {
  if (e.buffer) return Promise.resolve(e.buffer);
  if (e.decoding) return e.decoding;
  const c = getAudioContext();
  if (!c) return Promise.resolve(null);
  e.decoding = e.bytes.then(
    (bytes) =>
      bytes
        ? new Promise<AudioBuffer | null>((resolve) => {
            try {
              // Callback form too: older WebKit has no promise-returning decodeAudioData.
              const p = c.decodeAudioData(
                bytes.slice(0),
                (b) => resolve(b),
                () => resolve(null),
              );
              if (p && typeof p.then === "function") p.then(resolve, () => resolve(null));
            } catch {
              resolve(null);
            }
          }).then((b) => {
            e.buffer = b;
            if (!b) e.decoding = null;
            return b;
          })
        : null,
  );
  return e.decoding;
}

/** Decode everything already loaded the moment the gate unlocks the context. */
function bindUnlock() {
  if (unlockBound) return;
  unlockBound = true;
  subscribeAudio(() => {
    if (!audioSnapshot().unlocked) return;
    bank.forEach((e) => void decode(e));
  });
}

/**
 * Register + fetch a sample. Safe to call before the gate (only fetches then)
 * and more than once (same id + url is a no-op). Resolves true once it is
 * decoded and playable, false if the fetch/decode failed. Before the gate tap
 * it resolves only after the tap — don't await it to render anything.
 */
export function loadSample(id: string, url: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  bindUnlock();
  let e = bank.get(id);
  if (!e || e.url !== url) {
    const bytes = fetch(url, { mode: "cors", credentials: "omit" })
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
    e = { url, bytes, buffer: null, decoding: null };
    bank.set(id, e);
  }
  const entry = e;
  if (audioSnapshot().unlocked) return decode(entry).then((b) => !!b);
  return new Promise<boolean>((resolve) => {
    const off = subscribeAudio(() => {
      if (!audioSnapshot().unlocked) return;
      off();
      void decode(entry).then((b) => resolve(!!b));
    });
  });
}

/** Is it decoded and ready to play with no delay? */
export const sampleReady = (id: string): boolean => !!bank.get(id)?.buffer;

function start(c: AudioContext, buf: AudioBuffer, o: SampleOptions): CueHandle {
  const bus = getSfxBus();
  if (!bus) return NOOP;
  const src = c.createBufferSource();
  src.buffer = buf;
  if (o.rate) src.playbackRate.value = Math.max(0.5, Math.min(2, o.rate));
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(2, o.gain ?? 1));
  let tail: AudioNode = g;
  if (o.pan && typeof c.createStereoPanner === "function") {
    const p = c.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, o.pan));
    g.connect(p);
    tail = p;
  }
  src.connect(g);
  tail.connect(bus);
  src.onended = () => {
    try {
      tail.disconnect();
    } catch {
      /* ignore */
    }
  };
  src.start();
  let stopped = false;
  return {
    peakIn: 0,
    stop: (fadeMs = 200) => {
      if (stopped) return;
      stopped = true;
      const now = c.currentTime;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0.0001, now + fadeMs / 1000);
      try {
        src.stop(now + fadeMs / 1000 + 0.02);
      } catch {
        /* already stopped */
      }
    },
  };
}

/** Play a loaded sample through the SFX bus. No-op before the gate tap, while muted, or for an unknown id. */
export function playSample(id: string, o: SampleOptions = {}): CueHandle {
  if (!audioSnapshot().unlocked || !soundOn()) return NOOP;
  const e = bank.get(id);
  const c = getAudioContext();
  if (!e || !c || c.state === "closed") return NOOP;
  if (c.state === "suspended") void c.resume().catch(() => {});
  if (e.buffer) return start(c, e.buffer, o);
  // Still decoding: play when ready, unless it would be too late to matter.
  const asked = performance.now();
  const maxLate = o.maxLateMs ?? 350;
  let cancelled = false;
  let live: CueHandle = NOOP;
  void decode(e).then((b) => {
    if (!b || cancelled || !soundOn() || performance.now() - asked > maxLate) return;
    live = start(c, b, o);
  });
  return {
    peakIn: 0,
    stop: (fadeMs) => {
      cancelled = true;
      live.stop(fadeMs);
    },
  };
}
