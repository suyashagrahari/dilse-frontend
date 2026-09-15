// ─── Proposal — the music library ────────────────────────────────────────────
//
// Three ways a proposal gets a soundtrack, in one resolver:
//
//   1. A built-in melody, synthesised in WebAudio. Three of them, each with its
//      own character. Zero bytes downloaded, and nothing that can be taken down.
//   2. A YouTube link the sender pasted. Played through the official IFrame
//      player — see the compliance note below, it constrains the UI.
//   3. A direct URL to an audio file the sender hosts or has licensed.
//
// ── WHY THE BUILT-IN TRACKS ARE SYNTHESISED AND NOT MP3s ────────────────────
//
// The obvious build is three romantic pop songs on the CDN. We cannot ship
// that: a commercial recording served from cdn.subhsandesh.in without a licence
// is infringement, and the exposure lands on the domain — a takedown against
// the CDN takes every other template's art down with it. The songs people
// actually want are also the most aggressively policed catalogue there is.
//
// So the built-ins are original compositions. They are chord progressions, not
// recordings, which is why they weigh nothing and why swapping in a licensed
// file later is a two-line change: give a track a `src` and the resolver plays
// it instead of synthesising it. `src` exists for exactly that.
//
// And the sender who wants one specific song is not stuck — that is what the
// YouTube path is for, and it is the correct path, because YouTube serves that
// audio under its own licences rather than us re-hosting it.
//
// ── YOUTUBE COMPLIANCE ──────────────────────────────────────────────────────
//
// The IFrame Player API's terms require the player to stay visible and not be
// covered or shrunk to nothing. "Play the audio with the video hidden" is the
// obvious reading of "only sing music not video" and it is exactly what the
// terms forbid — this repo already worked that out once, at length, in
// app/(templates)/dedication/components/ytPlayer.ts.
//
// What we do instead: the player is small, deliberately styled, parked out of
// the way beside the music control, and never the focus of a screen. The video
// is not the point and does not behave like it is, but it is visible and it is
// the real player. See MusicDock.tsx.

/** Every built-in melody's id. Mirrored by `MUSIC_TRACKS` on the server. */
export type MusicTrackId = "slow-dance" | "first-light" | "forever";

/** What the sender chose. "auto" means a different one each time the page opens. */
export type MusicChoice = "auto" | MusicTrackId;

export interface BuiltInTrack {
  id: MusicTrackId;
  label: string;
  /** One line, shown under the label in the picker. */
  blurb: string;
  emoji: string;
  /**
   * Chords as raw frequencies. Each inner array is one bar, voiced low to high.
   * Written out rather than computed from note names: the voicings are chosen
   * by ear, and a note-name helper would invite "fixing" them into something
   * theoretically tidier and blander.
   */
  chords: number[][];
  /** How long one bar lasts. The single biggest lever on how a track feels. */
  barMs: number;
  /** Gap between arpeggio notes, in seconds. */
  arpGap: number;
  /** Which octave the arpeggio sings in, relative to the chord. */
  arpOctave: number;
  arpWave: OscillatorType;
  padWave: OscillatorType;
  /** Low-pass cutoff. Lower is warmer and further away; higher is brighter. */
  cutoff: number;
  /** Master gain. This sits UNDER a proposal, it does not perform one. */
  peak: number;
}

/**
 * Three progressions, deliberately different from one another — not three
 * presets of the same patch. If they were only distinguishable by tempo the
 * picker would be decoration.
 */
export const BUILTIN_TRACKS: Record<MusicTrackId, BuiltInTrack> = {
  // I – V – vi – IV in C. The most reliably tear-jerking four bars in pop music,
  // played slowly with a warm pad well under the arpeggio.
  "slow-dance": {
    id: "slow-dance",
    label: "Slow dance",
    blurb: "Warm and unhurried. The safe one.",
    emoji: "💫",
    chords: [
      [261.63, 329.63, 392.0, 523.25], // C  major
      [196.0, 246.94, 293.66, 392.0], // G  major
      [220.0, 261.63, 329.63, 440.0], // A  minor
      [174.61, 220.0, 261.63, 349.23], // F  major
    ],
    barMs: 3400,
    arpGap: 0.3,
    arpOctave: 2,
    arpWave: "triangle",
    padWave: "sine",
    cutoff: 2200,
    peak: 0.06,
  },

  // vi – IV – I – V, up an octave and quicker, with a bell-like arpeggio. Reads
  // as morning rather than midnight.
  "first-light": {
    id: "first-light",
    label: "First light",
    blurb: "Bright and hopeful. Sparkles a little.",
    emoji: "🌅",
    chords: [
      [293.66, 349.63, 440.0, 587.33], // D  minor
      [349.23, 440.0, 523.25, 698.46], // F  major
      [261.63, 329.63, 392.0, 523.25], // C  major
      [392.0, 493.88, 587.33, 783.99], // G  major
    ],
    barMs: 2600,
    arpGap: 0.2,
    arpOctave: 2,
    arpWave: "sine",
    padWave: "triangle",
    cutoff: 3200,
    peak: 0.052,
  },

  // I – iii – IV – V, voiced low and played slowly. The cinematic one: long
  // swells, almost no sparkle, sits a long way under everything.
  forever: {
    id: "forever",
    label: "Forever",
    blurb: "Low, slow and cinematic. For the big one.",
    emoji: "🕯️",
    chords: [
      [130.81, 196.0, 261.63, 329.63], // C  major, low
      [164.81, 246.94, 329.63, 392.0], // E  minor
      [174.61, 261.63, 349.23, 440.0], // F  major
      [196.0, 293.66, 392.0, 493.88], // G  major
    ],
    barMs: 4400,
    arpGap: 0.42,
    arpOctave: 1,
    arpWave: "triangle",
    padWave: "sine",
    cutoff: 1500,
    peak: 0.068,
  },
};

export const TRACK_IDS: MusicTrackId[] = ["slow-dance", "first-light", "forever"];

export function isTrackId(v: string): v is MusicTrackId {
  return (TRACK_IDS as string[]).includes(v);
}

/** Random built-in. Used for "auto", and for the unconfigured preview. */
export function randomTrackId(): MusicTrackId {
  return TRACK_IDS[Math.floor(Math.random() * TRACK_IDS.length)];
}

// ── YouTube ─────────────────────────────────────────────────────────────────

/**
 * The 11-character video id out of any shape of YouTube URL, or null.
 *
 * Deliberately strict about the id itself (`[A-Za-z0-9_-]{11}`) and permissive
 * about what surrounds it: people paste `youtu.be` links, `music.youtube.com`
 * links, links with a playlist and a timestamp welded on, and sometimes just
 * the bare id.
 */
export function parseYouTubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // A bare id, pasted on its own.
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const ok = (id: string | null | undefined) =>
    id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;

  if (host === "youtu.be") return ok(url.pathname.slice(1).split("/")[0]);
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const v = ok(url.searchParams.get("v"));
    if (v) return v;
    // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
    const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

// ── The resolver ────────────────────────────────────────────────────────────

export type ResolvedMusic =
  | { kind: "youtube"; videoId: string }
  | { kind: "file"; src: string }
  | { kind: "builtin"; track: BuiltInTrack };

/**
 * What should actually play.
 *
 * `musicUrl` wins when it is set, because a sender who pasted a link meant it.
 * Everything else falls through to a built-in, and "auto" resolves to a random
 * one — which is what makes an unconfigured preview sound different each time
 * somebody opens the template from the gallery.
 *
 * Resolved once, at the top of the audio hook, so the rest of the template
 * never has to re-derive which of the three worlds it is in.
 */
export function resolveMusic(musicUrl: string, musicTrack: string): ResolvedMusic {
  const url = (musicUrl || "").trim();
  if (url) {
    const videoId = parseYouTubeId(url);
    if (videoId) return { kind: "youtube", videoId };
    // Anything else is treated as a direct media URL. An unplayable one simply
    // never fires `canplay` and the page stays silent, which is a far better
    // failure than refusing to render the proposal.
    if (/^https?:\/\//i.test(url)) return { kind: "file", src: url };
  }
  const id = isTrackId(musicTrack) ? musicTrack : randomTrackId();
  return { kind: "builtin", track: BUILTIN_TRACKS[id] };
}
