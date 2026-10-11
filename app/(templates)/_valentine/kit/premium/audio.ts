// ─── The premium page's ONE AudioContext (SFX bus) ───────────────────────────
//
// A module singleton: one page = one context, created INSIDE the opening tap
// (unlockAudioInGesture) — a context made before a gesture starts suspended,
// and on iOS the ring/silent switch mutes Web Audio unless the page asks for
// the "playback" audio session first (iOS 17+: navigator.audioSession; older
// iOS: a silent <audio> element started in the same tap does the same job).
//
//   master (mute) ─┬─ sfx bus (SFX_LEVEL, ~6–10 dB under the song)
//                  └─ beds bus (loops: rain, wind, projector…)
//
// It is paused while the tab is hidden. Nothing here ever plays before the
// first tap, and nothing plays while muted (global mute = the 🔊 chip and the
// gate's "open quietly").

export const SFX_LEVEL = 0.5;
export const BED_LEVEL = 0.35;

type Listener = () => void;

interface EngineState {
  /** The visitor silenced the page (🔇 chip or "open quietly"). */
  muted: boolean;
  /** The sender picked no music at all: SFX stay off too ("sound off is respected"). */
  silentPage: boolean;
  /** The context exists and has been resumed inside a gesture. */
  unlocked: boolean;
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let bedBus: GainNode | null = null;
let silentEl: HTMLAudioElement | null = null;
let state: EngineState = { muted: false, silentPage: false, unlocked: false };
const listeners = new Set<Listener>();
let visBound = false;

const emit = () => listeners.forEach((l) => l());
const setState = (p: Partial<EngineState>) => {
  state = { ...state, ...p };
  applyMute();
  emit();
};

export function subscribeAudio(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
export const audioSnapshot = (): EngineState => state;
const SERVER_STATE: EngineState = { muted: false, silentPage: false, unlocked: false };
export const audioServerSnapshot = (): EngineState => SERVER_STATE;

/** Is sound allowed right now? */
export const soundOn = () => !state.muted && !state.silentPage;

function applyMute() {
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(soundOn() ? 1 : 0, ctx.currentTime, 0.05);
}

/** The context (created lazily; may be suspended until unlockAudioInGesture runs). */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext | undefined;
  if (!Ctor) return null;
  try {
    ctx = new Ctor({ latencyHint: "interactive" });
  } catch {
    return null;
  }
  master = ctx.createGain();
  master.gain.value = soundOn() ? 1 : 0;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = SFX_LEVEL;
  sfxBus.connect(master);
  bedBus = ctx.createGain();
  bedBus.gain.value = BED_LEVEL;
  bedBus.connect(master);
  if (!visBound) {
    visBound = true;
    document.addEventListener("visibilitychange", () => {
      if (!ctx) return;
      if (document.hidden) void ctx.suspend().catch(() => {});
      else if (state.unlocked) void ctx.resume().catch(() => {});
    });
  }
  return ctx;
}

export const getSfxBus = () => sfxBus;
export const getBedBus = () => bedBus;

/** 44-byte WAV header + 8 silent samples, for the pre-iOS-17 session trick. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQgAAAAAAAAAAAAAAA==";

/**
 * CALL SYNCHRONOUSLY INSIDE THE TAP HANDLER, before anything else that makes
 * sound (the gate does this for you). Order matters on iOS:
 *   1. audioSession.type = "playback"  (before the context exists)
 *   2. create / resume the context, start a 1-sample silent buffer (old WebKit unlock)
 *   3. a silent looping <audio> for iOS < 17 (moves the page to the playback channel)
 */
export function unlockAudioInGesture(): void {
  if (typeof window === "undefined") return;
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";
    else if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      void silentEl.play().catch(() => {});
    }
  } catch {
    /* not available */
  }
  const c = getAudioContext();
  if (!c) return;
  try {
    const buf = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start(0);
  } catch {
    /* ignore */
  }
  void c.resume().catch(() => {});
  if (!state.unlocked) setState({ unlocked: true });
}

export function setAudioMuted(muted: boolean) {
  if (state.muted !== muted) setState({ muted });
}
export function setSilentPage(silentPage: boolean) {
  if (state.silentPage !== silentPage) setState({ silentPage });
}

// ─── Shared noise buffers (generated once per context) ────────────────────────

export type NoiseColor = "white" | "pink" | "brown";
const noise: Partial<Record<NoiseColor, AudioBuffer>> = {};

export function noiseBuffer(color: NoiseColor): AudioBuffer | null {
  const c = getAudioContext();
  if (!c) return null;
  const hit = noise[color];
  if (hit) return hit;
  const len = Math.floor(c.sampleRate * 2);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (color === "white") d[i] = w;
    else if (color === "pink") {
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    } else {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  noise[color] = buf;
  return buf;
}
