// ─── Dedication — the frozen contract ────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// This is audio-first. The screen is a radio, not a web page — the recipient
// should be able to put the phone down and listen. Every design decision below
// serves that, and the two hardest constraints are platform ones:
//
//   1. AUTOPLAY. The "tune in" lock is the ONLY user gesture we get. Both the
//      RJ voice AND the video player must be started from inside that one
//      handler, the video at volume 0. Playback then began from a gesture, so
//      iOS Safari's policy is satisfied and every later `loadVideoById` works
//      on the already-unlocked player. Sequencing it any other way — start the
//      voice, then play the song when it ends — fails SILENTLY on iOS. See
//      UNLOCK_ORDER.
//
//   2. THE PLAYER STAYS VISIBLE. Using the embed as an audio-only source, or
//      hiding/covering/0x0-ing it, breaks YouTube's terms. It is rendered as a
//      screen panel set into the radio's face, with a bezel. That is compliant
//      and it looks better than a hidden iframe. PLAYER_PANEL fixes its size.
//
// A third, quieter constraint: you cannot read audio data from a YouTube iframe
// (cross-origin). VU meters are GENUINE during voice segments, from a real
// AnalyserNode on our own audio element, and SIMULATED during songs. Both paths
// are labelled as such in the code. Nothing pretends the simulated one is real.

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

export interface Station {
  name: string;
  /** "98.3", or "14.3" if that's the date they met. Parsed as a number. */
  frequency: string;
}

export interface VoiceSegment {
  kind: "voice";
  audioUrl: string;
  durationMs: number;
  /** Shown as subtitle text, for someone who can't use sound right now. */
  caption?: string;
}

export interface SongSegment {
  kind: "song";
  youtubeId: string;
  title: string;
  artist: string;
  startSeconds?: number;
  endSeconds?: number;
  /** "This one goes out to Meera in Bengaluru, from Arjun." */
  dedication: string;
}

/**
 * A video the sender uploaded themselves (max 3, 10MB each before the server
 * transcodes it to a small mp4). Played on the radio's screen with its sound.
 */
export interface ClipSegment {
  kind: "clip";
  /** https URL after upload; a `blob:` URL only while held in the editor. */
  videoUrl: string;
  posterUrl?: string;
  title: string;
  dedication: string;
}

export type Segment = VoiceSegment | SongSegment | ClipSegment;
export type SegmentKind = Segment["kind"];

/** One card in the photo reel. */
export interface Photo {
  url: string;
  caption?: string;
}

export interface RadioShow {
  station: Station;
  sender: { name: string; city: string };
  recipient: { name: string; city: string };
  segments: Segment[];
  /** The final text card, over a dimming radio face. */
  signOff: string;
  /** The reel of little photo cards that drifts across the radio face. */
  photos: Photo[];
  /** The love letter printed under the radio. */
  letter: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// YouTube — validated at INPUT time, never at playback time
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Accepts youtu.be/, /watch?v=, /shorts/, /embed/, and a bare 11-char id.
 * Returns null for anything else so the sender is corrected while they are
 * still looking at the form — a bad link discovered mid-show is a dead radio.
 */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  let url: URL;
  try {
    url = new URL(s.startsWith("http") ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return take11(url.pathname.slice(1));
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "music.youtube.com") return null;
  const v = url.searchParams.get("v");
  if (v) return take11(v);
  const m = url.pathname.match(/^\/(shorts|embed|v|live)\/([\w-]{11})/);
  return m ? m[2] : null;
}

const take11 = (s: string): string | null => (/^[\w-]{11}$/.test(s.slice(0, 11)) ? s.slice(0, 11) : null);

/**
 * The order the tune-in handler MUST run in. Deviating from this is the single
 * most likely way to ship a radio that plays nothing on iOS.
 *
 * Kept as data rather than prose so the player module can assert against it in
 * development and shout if a step is skipped.
 */
export const UNLOCK_ORDER = [
  "create-audio-context",
  "create-yt-player",
  "yt-play-video",
  "yt-set-volume-0",
  "start-voice-element",
] as const;

/** The player never reaching READY within this is treated as a dead segment. */
export const YT_READY_TIMEOUT_MS = 8000;

/**
 * Every YouTube error maps to the same warm card. Private, deleted, embedding-
 * disabled, geo-blocked and age-restricted are all the same thing to the
 * listener: that one didn't make it. Never surface a raw error code.
 */
export const YT_ERROR_COPY = "that one didn't make it past the censors";

// ═══════════════════════════════════════════════════════════════════════════
// The tuner — the hook, and the thing to protect if time runs short
// ═══════════════════════════════════════════════════════════════════════════

export const DIAL = {
  min: 88,
  max: 108,
  /** Within this of the target, the needle snaps and the station locks. */
  lockTolerance: 0.3,
  /** Arrow-key step for desktop. */
  keyStep: 0.2,
} as const;

/**
 * Decoys planted along the scale. Passing near one bleeds in a faint generated
 * tone before falling back to static — a clean dial feels fake, and this is
 * what sells the illusion more than the target station does.
 *
 * Positions are fractions of the dial so they land sensibly wherever the real
 * station sits; `resolveDecoys` pushes any that collide with the target away.
 */
export const DECOY_FRACTIONS = [0.18, 0.37, 0.62, 0.84] as const;

export interface Decoy {
  freq: number;
  /** A muffled voice-ish burst vs a music-ish tone. Purely cosmetic variety. */
  flavour: "voice" | "music";
  /** Carrier pitch for the bleed-through. */
  hz: number;
}

export function resolveDecoys(targetFreq: number): Decoy[] {
  const span = DIAL.max - DIAL.min;
  return DECOY_FRACTIONS.map((f, i) => {
    let freq = DIAL.min + f * span;
    // Keep decoys clear of the real station or the lock feels arbitrary.
    if (Math.abs(freq - targetFreq) < 1.5) freq += freq < targetFreq ? -1.8 : 1.8;
    return {
      freq: Math.min(DIAL.max - 0.4, Math.max(DIAL.min + 0.4, Number(freq.toFixed(1)))),
      flavour: i % 2 === 0 ? "music" : "voice",
      hz: 180 + i * 90,
    };
  });
}

/** How strongly a station bleeds through at the current needle position: 0..1. */
export function proximity(needle: number, station: number, width = 1.2): number {
  const d = Math.abs(needle - station);
  return d >= width ? 0 : 1 - d / width;
}

/**
 * The static is GENERATED — a looping noise buffer through a bandpass filter,
 * its cutoff and gain modulated by proximity. No audio file ships with this
 * template. A recorded static loop is audibly a loop within about four seconds.
 */
export const STATIC = {
  bufferSeconds: 2,
  /** Bandpass centre at full static, and where it moves as a station nears. */
  cutoffFar: 1400,
  cutoffNear: 320,
  gainFar: 0.16,
  gainNear: 0.02,
  /** Between segments. */
  voiceToSongMs: 600,
  songToVoiceMs: 400,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Segment sequencing
// ═══════════════════════════════════════════════════════════════════════════

export const TIMING = {
  /** Song fading up after the RJ finishes. */
  fadeUpMs: 800,
  /** Song fading down before a voice segment. */
  fadeDownMs: 800,
  /** The dedication card holds, then slides away. The screenshot moment. */
  dedicationHoldMs: 4000,
  dedicationSlideMs: 400,
  /** VU needle simulation rate during songs, 4–8Hz. */
  vuSimHzMin: 4,
  vuSimHzMax: 8,
  /** Marquee scroll period. */
  marqueeMs: 12000,
} as const;

/** Every control. Played with the phone at arm's length. */
export const TAP_TARGET_PX = 48;

/** The YouTube panel set into the radio face. Never smaller, never hidden. */
export const PLAYER_PANEL = { width: 140, height: 80 } as const;

export type ShowPhase = "tuning" | "locked" | "playing" | "signoff";

/** A song segment whose video died. Skipped, with a card, never a stall. */
export interface SegmentFailure {
  index: number;
  reason: "yt-error" | "yt-timeout" | "audio-load";
}

// ═══════════════════════════════════════════════════════════════════════════
// The recording booth
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Chrome/Android wants webm/opus; Safari only does mp4. Feature-detect and
 * take the first supported — assuming webm gives Safari senders a booth that
 * appears to work and produces a zero-byte file.
 */
export const RECORDER_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
] as const;

export function pickRecorderMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  for (const m of RECORDER_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return null;
}

export const BOOTH = {
  maxSeconds: 90,
  /** After this many, stop offering. The stumbles are the emotional content. */
  maxRetakes: 3,
  enough: "it's good. imperfect is the point.",
  /** On screen while they record, to defuse the freeze. */
  script: "This next one goes out to ___, from ___ in ___. Because ___.",
  denied:
    "no mic — we'll show your dedication as a card instead. it works, but your voice is better.",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Palette — a 1980s Indian transistor radio
// ═══════════════════════════════════════════════════════════════════════════

export const PALETTE = {
  /** Oxide-red plastic body. */
  body: "#8c3b2a",
  bodyDeep: "#6d2c1f",
  bodyLight: "#a8503b",
  /** Cream inlay around the dial. */
  cream: "#e8dcc0",
  creamDeep: "#d4c4a2",
  /** Brushed metal grille — rendered as a CSS dot pattern, never an image. */
  metal: "#8d8781",
  chrome: "#c9c4bb",
  chromeDark: "#6f6b64",
  /** Amber illuminated display on near-black. */
  displayBg: "#150e06",
  amber: "#f0a63c",
  amberDim: "#8a5c1e",
  /** The TUNED lamp. */
  green: "#4fd07a",
  /** ON AIR, lit during voice segments only. */
  red: "#e2452e",
  ink: "#1d1610",
} as const;

/** Condensed caps on the body. */
export const BODY_FACE = "var(--font-outfit), system-ui, sans-serif";
/** The frequency readout. Seven-segment-ish. */
export const DISPLAY_FACE = "var(--font-courier-prime), ui-monospace, Menlo, monospace";

/** Faint irregular wear shapes on the body. Seeded, never random per render. */
export const WEAR_COUNT = 4;
/** The invented brand plate. Not a real manufacturer. */
export const BRAND_PLATE = "SUNAINA · 2-BAND";
