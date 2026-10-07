// ─── YouTube songs for the Valentine's-week pages ────────────────────────────
//
// We only ever STORE an 11-char video id (the server rejects anything else);
// links are parsed here, in the form, so a bad paste is corrected while the
// sender is still looking at it. Playback is the official IFrame Player API,
// loaded lazily — only on pages whose sender picked a YouTube song.

import { YOUTUBE_ID_RE } from "../types";

const take11 = (s: string): string | null => {
  const id = s.slice(0, 11);
  return YOUTUBE_ID_RE.test(id) ? id : null;
};

/**
 * youtube.com/watch?v= · m.youtube.com · music.youtube.com/watch?v= · youtu.be/<id> ·
 * /shorts/<id> · /embed/<id> · /live/<id> · a bare 11-char id. Anything else → null.
 */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (YOUTUBE_ID_RE.test(s)) return s;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, "");
  if (host === "youtu.be") return take11(url.pathname.slice(1));
  if (host !== "youtube.com" && host !== "music.youtube.com" && host !== "youtube-nocookie.com") return null;
  const v = url.searchParams.get("v");
  if (v) return take11(v);
  const m = url.pathname.match(/^\/(shorts|embed|v|live)\/([A-Za-z0-9_-]{11})/);
  return m ? m[2] : null;
}

/** A `t=`/`start=` in the pasted link ("90", "1m30s", "90s") → seconds, else null. */
export function parseStartFromLink(input: string): number | null {
  try {
    const url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
    const t = url.searchParams.get("t") ?? url.searchParams.get("start");
    if (!t) return null;
    const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
    if (!m) return null;
    const secs = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
    return Number.isFinite(secs) ? secs : null;
  } catch {
    return null;
  }
}

/** "1:05" ⇄ 65. Accepts "65", "1:05", "01:05". */
export function parseClock(s: string): number | null {
  const t = s.trim();
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(\d{1,2}):([0-5]?\d)$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
export const formatClock = (secs: number) => `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;

export const youTubeThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export interface SongSuggestion {
  id: string;
  title: string;
  artist: string;
}

/**
 * One-tap suggestions — official uploads by the artist or label (checked
 * against YouTube's oEmbed, 2026-10-07). Only the id is stored with a page.
 */
export const SONG_SUGGESTIONS: readonly SongSuggestion[] = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh · Aashiqui 2" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "Cb6wuzOurPc", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
];

export const suggestionFor = (id: string) => SONG_SUGGESTIONS.find((s) => s.id === id) ?? null;

// ─── The IFrame Player API, loaded once, only when needed ────────────────────

/** The slice of the YT namespace we use. */
export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(s: number, allowSeekAhead: boolean): void;
  setVolume(v: number): void;
  mute(): void;
  unMute(): void;
  getPlayerState(): number;
  cueVideoById(o: { videoId: string; startSeconds?: number }): void;
  loadVideoById(o: { videoId: string; startSeconds?: number }): void;
  getVideoData?(): { title?: string; author?: string };
  destroy(): void;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      width?: number | string;
      height?: number | string;
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
}

// Not a `declare global`: other templates declare `window.YT` with their own
// (incompatible) slice of the namespace, so we read it through a local view.
type YTWindow = { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(timeoutMs = 12000): Promise<YTNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as YTWindow;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const prev = w.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(() => {
      apiPromise = null;
      reject(new Error("YouTube took too long to load"));
    }, timeoutMs);
    w.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      prev?.();
      if (w.YT?.Player) resolve(w.YT);
      else reject(new Error("YouTube API missing"));
    };
    // Another template on this page may already have injected the script.
    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.onerror = () => {
      window.clearTimeout(timer);
      apiPromise = null;
      reject(new Error("YouTube blocked"));
    };
    document.head.appendChild(s);
  });
  return apiPromise;
}
