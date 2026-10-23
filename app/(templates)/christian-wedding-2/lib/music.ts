// ─── Christian Wedding — Scroll Edition: music ──────────────────────────────
// Verified YouTube uploads (oEmbed 200, 2026-10-23). Canon in D plays by
// default; the sender can pick another or paste any YouTube link. If a song
// refuses to embed, the kit's DayMusicProvider falls back to the soft melody.

import type { SongSuggestion } from "../../_valentine/music/youtube";
import type { Cw2Data } from "./model";

export const CW2_SONGS: readonly SongSuggestion[] = [
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "LRP8d7hhpoQ", title: "Hallelujah", artist: "Pentatonix" },
  { id: "dElRVQFqj-k", title: "Marry You", artist: "Bruno Mars" },
];

/** The form's music → DayMusicProvider settings (off · melody · YouTube). */
export function musicSettings(d: Pick<Cw2Data, "music">) {
  return {
    musicMode: d.music.enabled ? (d.music.youtubeId ? ("youtube" as const) : ("melody" as const)) : ("off" as const),
    musicYoutubeId: d.music.youtubeId,
    musicStart: d.music.start,
  };
}
