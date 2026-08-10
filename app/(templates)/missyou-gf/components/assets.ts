import { media } from "@/lib/templateMedia";

// ─── Miss You — central media registry ───────────────────────────────────────
// Every gif + song the template loads is addressed through MU_MEDIA_BASE, so the
// whole set can be moved to an S3/CDN origin by editing a single line (after the
// files are uploaded with the same relative layout under a `missyou-gf/` folder).
// The default is the local /public/assets/missyou-gf folder, which always works
// in dev and doubles as a fallback.

// Served from S3 (bucket gifts-media-prod-123, ap-south-1) — uploaded via
// `npm run upload:missyou-media` in /server. The matching files also live in
// /public/assets/missyou-gf as a source-of-truth / local fallback: re-run the
// uploader after changing any of them, then keep this base in sync.
export const MU_MEDIA_BASE = media("missyou-gf");

/** Resolve a media file (gif/mp3) that lives under the missyou-gf media folder. */
export const muMedia = (file: string): string =>
  `${MU_MEDIA_BASE.replace(/\/+$/, "")}/${file.replace(/^\/+/, "")}`;

export interface Song {
  id: string;
  title: string;
  artist: string;
  /** Playable URL — relative to the app, or an absolute CDN URL. */
  src: string;
}

/** Curated long-distance / love songs the sender can pick from + preview. */
export const MU_SONGS: Song[] = [
  { id: "the-night-we-met", title: "The Night We Met", artist: "Lord Huron", src: muMedia("music/the-night-we-met.mp3") },
  { id: "perfect", title: "Perfect", artist: "Ed Sheeran", src: muMedia("music/perfect.mp3") },
  { id: "a-thousand-years", title: "A Thousand Years", artist: "Christina Perri", src: muMedia("music/a-thousand-years.mp3") },
  { id: "all-of-me", title: "All of Me", artist: "John Legend", src: muMedia("music/allofme.mp3") },
  { id: "thinking-out-loud", title: "Thinking Out Loud", artist: "Ed Sheeran", src: muMedia("music/thinkingoutloud.mp3") },
  { id: "lover", title: "Lover", artist: "Taylor Swift", src: muMedia("music/lover.mp3") },
  { id: "until-i-found-her", title: "Until I Found Her", artist: "Stephen Sanchez", src: muMedia("music/untillifoundher.mp3") },
];

/**
 * Find the preset that matches a stored src, so the picker can highlight the
 * current selection. Tolerates the catalog being absolute (CDN) while the stored
 * value is same-origin relative, or vice-versa.
 */
export const findSong = (src: string): Song | undefined => {
  if (!src) return undefined;
  const tail = (u: string) => u.replace(/^https?:\/\/[^/]+/, "");
  return MU_SONGS.find((s) => s.src === src || tail(s.src) === tail(src));
};
