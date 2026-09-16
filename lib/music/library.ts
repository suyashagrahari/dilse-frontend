// ─── The shelf of songs every template can offer ────────────────────────────
//
// Lifted out of `proposal/components/music.ts` when the apology dashboard
// needed the same list. It was never proposal-specific: these are the tracks
// already sitting in the bucket and already playing on love-gf, missyou-gf,
// shaadi-card, birthday, holi and eid pages in production. Nothing here was
// uploaded for a picker — the picker just stopped pretending each template had
// its own shelf.
//
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
