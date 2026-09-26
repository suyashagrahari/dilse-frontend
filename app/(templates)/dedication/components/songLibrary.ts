// ─── Dedication — the request library ────────────────────────────────────────
//
// A short, hand-picked shelf of love songs a sender can drop into the show with
// one tap instead of hunting for a link at 1am. Every entry is the label's or
// artist's OWN upload (T-Series, Sony Music India, YRF, VEVO, the artist's
// channel), played through the official embedded player — nothing is hosted or
// re-streamed here.
//
// Each id was checked against YouTube's oEmbed endpoint (which refuses videos
// whose owner disabled embedding) on 2026-09-26. If one is later pulled, the
// player's error path shows the warm "didn't make it" card and the show moves
// on — a dead link never stalls the radio.

export interface LibrarySong {
  youtubeId: string;
  title: string;
  artist: string;
  /** A one-line mood for the picker. */
  vibe: string;
  lang: "hindi" | "english";
  /** Seconds into the video where the song itself starts, skipping intros. */
  startSeconds?: number;
}

export const SONG_LIBRARY: LibrarySong[] = [
  { youtubeId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", vibe: "dancing in the dark", lang: "english" },
  { youtubeId: "450p7goxZqg", title: "All of Me", artist: "John Legend", vibe: "all your curves and edges", lang: "english" },
  { youtubeId: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri", vibe: "I have loved you for a thousand years", lang: "english" },
  { youtubeId: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran", vibe: "when we're seventy", lang: "english" },
  { youtubeId: "LjhCEhWiKXk", title: "Just the Way You Are", artist: "Bruno Mars", vibe: "amazing, just the way you are", lang: "english" },
  { youtubeId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", vibe: "the one everyone dedicates", lang: "hindi" },
  { youtubeId: "IJq0yyWug1k", title: "Tum Hi Ho", artist: "Arijit Singh", vibe: "you are all I have", lang: "hindi" },
  { youtubeId: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur", vibe: "long nights, thinking of you", lang: "hindi" },
  { youtubeId: "mQiiw7uRngk", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva, Tulsi Kumar", vibe: "a promise", lang: "hindi" },
  { youtubeId: "HrnrqYxYrbk", title: "Satranga", artist: "Arijit Singh", vibe: "all seven colours of you", lang: "hindi" },
  { youtubeId: "KUpwupYj_tY", title: "Tere Hawaale", artist: "Arijit Singh, Shilpa Rao", vibe: "I'm yours, all of me", lang: "hindi" },
  { youtubeId: "MJyKN-8UncM", title: "Shayad", artist: "Arijit Singh", vibe: "maybe this is love", lang: "hindi" },
  { youtubeId: "mt9xg0mmt28", title: "Tum Se Hi", artist: "Mohit Chauhan", vibe: "everything starts with you", lang: "hindi" },
  { youtubeId: "eWd4cSUsDHg", title: "Tujh Mein Rab Dikhta Hai", artist: "Shreya Ghoshal", vibe: "I see god in you", lang: "hindi" },
];

/** YouTube's own thumbnail for an id — used by the picker and the reel. */
export const ytThumb = (id: string): string => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
