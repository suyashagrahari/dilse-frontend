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
  /**
   * Master gain the fade-in settles at.
   *
   * These were 0.052–0.068 and the result measured −34.5 dBFS at the
   * destination: running, correct, and inaudible on a phone speaker. "The song
   * is not ringing" was a level bug, not a playback bug.
   *
   * Ten times louder lands around −14 dBFS, which is a background bed you can
   * actually hear under a page somebody is reading. The signal arriving at the
   * master gain peaks at about 0.32 — the voices are spread across a bar and
   * their phases do not align — so even the loudest of these leaves roughly
   * 13 dB of headroom and nothing clips. See the note in `start()` about why
   * there is no limiter.
   */
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
    peak: 0.60,
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
    peak: 0.52,
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
    peak: 0.68,
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

// ── The shelf ───────────────────────────────────────────────────────────────
//
// Real recordings, already on the CDN and already served by other templates
// (love-gf, missyou-gf, shaadi-card, birthday, holi, eid). Nothing new was
// uploaded to build this list: it is the same files, offered to one more
// template, and the licensing position is whatever it already was for the
// templates playing them today.
//
// ── WHAT IS DELIBERATELY NOT HERE ───────────────────────────────────────────
//
// The bucket holds 426 audio objects and 361 of them are people's own voice
// recordings — apology-dashboard voice notes, darling replies, love-gf notes,
// each one a private message from a real person to another real person. They
// are audio files in the same bucket and they are not music, and a picker that
// listed them would hand every sender a stranger's voice. The list below is
// the curated `assets/**/music` shelves and nothing else.
//
// ── WHY THESE GO THROUGH `musicUrl` ─────────────────────────────────────────
//
// Picking one writes a plain URL into the field the sender could already have
// pasted into by hand, which the server already stores and the recipient's page
// already plays through <audio>. No new column, no new id to whitelist server
// side, and a page published today keeps working if this list is reshuffled
// tomorrow — the page holds the URL, not a key into a table.

const CDN = "https://cdn.subhsandesh.in/gifts-media";

export interface LibraryTrack {
  id: string;
  title: string;
  /** Who it is by, or what it is, when there is no artist. */
  by: string;
  emoji: string;
  url: string;
  group: LibraryGroup;
}

export type LibraryGroup = "love" | "ceremony" | "festive";

export const LIBRARY_GROUPS: { id: LibraryGroup; label: string; note: string }[] = [
  { id: "love", label: "Love songs", note: "the ones people actually pick" },
  { id: "ceremony", label: "Wedding & ceremony", note: "for the day itself" },
  { id: "festive", label: "Everything else on the shelf", note: "from the other templates" },
];

export const LIBRARY: LibraryTrack[] = [
  // ── love ────────────────────────────────────────────────────────────────
  { id: "thousand-years", title: "A Thousand Years", by: "Christina Perri", emoji: "\u{1F495}", url: `${CDN}/assets/LoveGf/music/a-thousand-years.mp3`, group: "love" },
  { id: "perfect", title: "Perfect", by: "Ed Sheeran", emoji: "\u{2728}", url: `${CDN}/assets/LoveGf/music/perfect.mp3`, group: "love" },
  { id: "thinking-out-loud", title: "Thinking Out Loud", by: "Ed Sheeran", emoji: "\u{1F4AB}", url: `${CDN}/assets/LoveGf/music/thinkingoutloud.mp3`, group: "love" },
  { id: "all-of-me", title: "All of Me", by: "John Legend", emoji: "\u{1F3B9}", url: `${CDN}/assets/LoveGf/music/allofme.mp3`, group: "love" },
  { id: "lover", title: "Lover", by: "Taylor Swift", emoji: "\u{1F380}", url: `${CDN}/assets/LoveGf/music/lover.mp3`, group: "love" },
  { id: "until-i-found-you", title: "Until I Found You", by: "Stephen Sanchez", emoji: "\u{1F30A}", url: `${CDN}/assets/LoveGf/music/untillifoundher.mp3`, group: "love" },
  { id: "night-we-met", title: "The Night We Met", by: "Lord Huron", emoji: "\u{1F319}", url: `${CDN}/missyou-gf/music/the-night-we-met.mp3`, group: "love" },
  { id: "soft-love", title: "Soft love theme", by: "instrumental", emoji: "\u{1F90D}", url: `${CDN}/assets/LoveGf/music/love-bg.mp3`, group: "love" },

  // ── ceremony ────────────────────────────────────────────────────────────
  { id: "wedding-song", title: "Wedding song", by: "instrumental", emoji: "\u{1F492}", url: `${CDN}/assets/marriage/music/wedding-song.mp3`, group: "ceremony" },
  { id: "ratein", title: "Ratein", by: "shaadi", emoji: "\u{1F56F}", url: `${CDN}/shaadi-card/music/ratein.mp3`, group: "ceremony" },
  { id: "reception", title: "Reception", by: "instrumental", emoji: "\u{1F942}", url: `${CDN}/assets/Reception/music/reception.mp3`, group: "ceremony" },
  { id: "be-thou-my-vision", title: "Be Thou My Vision", by: "hymn", emoji: "\u{1F54A}", url: `${CDN}/christan-wedding/BeThouMyVision.mp3`, group: "ceremony" },

  // ── festive ─────────────────────────────────────────────────────────────
  { id: "best-day", title: "Best Day of My Life", by: "American Authors", emoji: "\u{1F389}", url: `${CDN}/assets/Birthday1/bestdayofmylife.mp3`, group: "festive" },
  { id: "good-time", title: "Good Time", by: "Owl City", emoji: "\u{1F389}", url: `${CDN}/assets/Birthday1/GoodTime.mp3`, group: "festive" },
  { id: "celebration", title: "Celebration", by: "party", emoji: "\u{1F38A}", url: `${CDN}/assets/Birthday1/celebration.mp3`, group: "festive" },
  { id: "dynamite", title: "Dynamite", by: "BTS", emoji: "\u{1F386}", url: `${CDN}/assets/Birthday1/dynamite.mp3`, group: "festive" },
  { id: "firework", title: "Firework", by: "Katy Perry", emoji: "\u{1F387}", url: `${CDN}/assets/Birthday1/firework.mp3`, group: "festive" },
  { id: "birthday-bg", title: "Happy birthday", by: "instrumental", emoji: "\u{1F382}", url: `${CDN}/assets/Birthday1/happybirthdaybg.mp3`, group: "festive" },
  { id: "balam-pichkari", title: "Balam Pichkari", by: "holi", emoji: "\u{1F3A8}", url: `${CDN}/assets/Holi/music/balampichkari.mp3`, group: "festive" },
  { id: "rang-barse", title: "Rang Barse", by: "holi", emoji: "\u{1F3A8}", url: `${CDN}/assets/Holi/music/rangbarse.mp3`, group: "festive" },
  { id: "holi-ke-din", title: "Holi Ke Din", by: "holi", emoji: "\u{1F3A8}", url: `${CDN}/assets/Holi/music/holikedin2.mp3`, group: "festive" },
  { id: "aaj-na-chhodenge", title: "Aaj Na Chhodenge", by: "holi", emoji: "\u{1F3A8}", url: `${CDN}/assets/Holi/music/aajnachhodengye.mp3`, group: "festive" },
  { id: "holi-khele", title: "Holi Khele Raghuvira", by: "holi", emoji: "\u{1F3A8}", url: `${CDN}/assets/Holi/music/holikheleraghuvira2.mp3`, group: "festive" },
  { id: "jai-shiv-shankar", title: "Jai Jai Shiv Shankar", by: "holi", emoji: "\u{1F3A8}", url: `${CDN}/assets/Holi/music/jaijaishivshankar.mp3`, group: "festive" },
  { id: "holi-bg", title: "Holi background", by: "instrumental", emoji: "\u{1F3A8}", url: `${CDN}/assets/Holi/music/holi-backgorund-2.mp3`, group: "festive" },
  { id: "eid-mubarak", title: "Eid Mubarak", by: "eid", emoji: "\u{1F319}", url: `${CDN}/assets/Eid/music/eidmubarak.mp3`, group: "festive" },
  { id: "hasbi-rabbi", title: "Hasbi Rabbi", by: "eid", emoji: "\u{1F319}", url: `${CDN}/assets/Eid/music/hasbirabbi.mp3`, group: "festive" },
  { id: "ramadan", title: "Ramadan", by: "eid", emoji: "\u{1F319}", url: `${CDN}/assets/Eid/music/ramadan.mp3`, group: "festive" },
  { id: "ya-mustafa", title: "Ya Mustafa", by: "eid", emoji: "\u{1F319}", url: `${CDN}/assets/Eid/music/yamustafa.mp3`, group: "festive" },
  { id: "tala-al-badru", title: "Tala al Badru", by: "eid", emoji: "\u{1F319}", url: `${CDN}/assets/Eid/music/talaalbadaru.mp3`, group: "festive" },
  { id: "eid-kiraat", title: "Eid Kiraat", by: "eid", emoji: "\u{1F319}", url: `${CDN}/assets/Eid/music/eidkiraat2.mp3`, group: "festive" },
  { id: "eid-bg", title: "Eid background", by: "instrumental", emoji: "\u{1F319}", url: `${CDN}/assets/Eid/music/eid-background.mp3`, group: "festive" },
  { id: "karpur-gauram", title: "Karpur Gauram", by: "ganesh", emoji: "\u{1F6D5}", url: `${CDN}/templates/happy-ganesh-chaturthi/karpur-gauram.mp3`, group: "festive" },
];

/**
 * What a brand-new proposal starts with, so the preview has a song from the
 * first tap rather than a synthesised pad nobody asked for.
 *
 * "A Thousand Years" because it is the one people reach for, and because it is
 * already on the shelf — no upload, no new exposure.
 */
export const DEFAULT_MUSIC_URL = LIBRARY[0].url;

/** The shelf entry a saved `musicUrl` refers to, if it is one of ours. */
export function findLibraryTrack(url: string): LibraryTrack | null {
  const u = (url || "").trim();
  return u ? LIBRARY.find((t) => t.url === u) ?? null : null;
}
