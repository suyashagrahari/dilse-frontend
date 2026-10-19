// ─── Valentine's week — the shared data contract ─────────────────────────────
//
// ONE shape for all eight days. Field names here === server model fields
// (server/src/models/ValentineDayPage.ts) === wire keys. Day-specific fields
// live in `extras`, described per day by a FieldSpec list (./spec.ts,
// ./days/<slug>.ts) that mirrors server/src/config/valentineDays.ts.

import { bodyFromKeys, type Raw } from "@/lib/wire";
import { MAX_CAPTION_LEN, MAX_NOTE_LEN, parseLovePhotos, type LovePhoto } from "../_love/types";
import { coerceExtras, extrasMissing, tidyExtras, type Extras, type FieldSpec } from "./spec";
import type { DayTheme } from "./theme";
import type { DaySlug } from "./days/slugs";
import type { SongSuggestion } from "./music/youtube";
import { getDay } from "./days";
import { coercePremium, tidyPremium, PREMIUM_DEFAULTS, type PremiumFields } from "./premiumData";

export type { DaySlug } from "./days/slugs";
export type { LovePhoto } from "../_love/types";
export type { PremiumFields } from "./premiumData";

export type EditMode = null | "manual" | "preview";

/** "track" = the template's own looping MP3 (DayConfig.music.track); only valid on a day that ships one. */
export type MusicMode = "off" | "melody" | "youtube" | "track";
export const MUSIC_MODES: readonly MusicMode[] = ["off", "melody", "youtube", "track"];
export const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;
export const MUSIC_START_MAX = 600;

/**
 * The four stored music fields, made consistent — the client twin of the
 * server's sanitizeMusic: an unknown mode or a "youtube" choice without a valid
 * id falls back to the melody; an old page with only `music: false` is "off".
 * "track" is kept only when the day ships its own track (`opts.track`, i.e.
 * DayConfig.music.track); such a day also defaults to it when no mode is given.
 */
export function coerceMusic(src: Record<string, unknown>, opts: { track?: boolean } = {}): Pick<ValentineDayData, "music" | "musicMode" | "musicYoutubeId" | "musicStart"> {
  const id = typeof src.musicYoutubeId === "string" && YOUTUBE_ID_RE.test(src.musicYoutubeId.trim()) ? src.musicYoutubeId.trim() : "";
  const fallback: MusicMode = opts.track ? "track" : "melody";
  let mode: MusicMode =
    typeof src.musicMode === "string" && (MUSIC_MODES as readonly string[]).includes(src.musicMode)
      ? (src.musicMode as MusicMode)
      : src.music === false
        ? "off"
        : fallback;
  if (mode === "youtube" && !id) mode = fallback;
  if (mode === "track" && !opts.track) mode = "melody";
  const n = typeof src.musicStart === "number" && Number.isFinite(src.musicStart) ? Math.round(src.musicStart) : 0;
  return { music: mode !== "off", musicMode: mode, musicYoutubeId: id, musicStart: Math.min(MUSIC_START_MAX, Math.max(0, n)) };
}

export interface ValentineDayData<E = Extras> {
  /** ≤30 */
  recipientName: string;
  /** ≤30 */
  senderName: string;
  /** ≤24, optional — the name they're saved as in your phone. */
  petName: string;
  /** Required. ≤ day.letterMax (1500; Valentine's 2000). */
  letter: string;
  /** Per-day max (6–9). */
  photos: LovePhoto[];
  /** slotId → "" (default sticker) | "none" (hidden) | https GIF/WebP url. */
  gifs: Record<string, string>;
  /** Kept for older pages/clients: always `musicMode !== "off"`. */
  music: boolean;
  /** off · the day's built-in synth melody · a YouTube song · the template's own track. Silent until the first gesture. */
  musicMode: MusicMode;
  /** An 11-char YouTube video id — never a URL. "" unless musicMode is "youtube". */
  musicYoutubeId: string;
  /** Seconds into the song to start from (0–600). */
  musicStart: number;
  /** ≤90, the final screen line. */
  endLine: string;
  extras: E;
  /**
   * Premium slugs only (always present there, absent on the $2 days): voice
   * note, song drop, scheduled unlock, sealed P.S., reply switch. See premiumData.ts.
   */
  premium?: PremiumFields;
}

/** Server-written by the recipient's beacon. The owner sees them; recipients never get them. */
export interface ValentineReactions {
  openedAt: string | null;
  completedAt: string | null;
  /** "no" only on pages whose sender allowed it (extras.answerMode "noAfterTries"). */
  answer: "yes" | "no" | null;
  answeredAt: string | null;
  noDodges: number | null;
  count: number | null;
  /** Premium: the recipient's written reply (first one wins), owner-only. */
  reply: { text: string; at: string } | null;
}

export type ReactionEvent = "opened" | "completed" | "answered";
export type ReactFn = (event: ReactionEvent, extra?: { noDodges?: number; count?: number; answer?: "yes" | "no" }) => void;

/** What every day's Experience receives. */
export interface ExperienceProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: ValentineDayData<any>;
  /** "preview" = inside the editor (react is a no-op); "live" = the recipient. */
  mode: "preview" | "live";
  /** Fire-and-forget beacon. Safe to call repeatedly — first one wins server-side. */
  react: ReactFn;
}

/** A premium day's own art for the unlock teaser (only the names are known before unlockAt). */
export interface TeaserArtProps {
  recipientName: string;
  senderName: string;
}

export interface GifSlot {
  /** "r1-arrival" — the key in `data.gifs`. */
  id: string;
  /** Short editor label: "Arrival". */
  label: string;
  /** When it shows: "Beside the empty pot". */
  moment: string;
  /** CDN file under templates/<slug>/ — "r1-arrival.gif". */
  file: string;
  /** Animated emoji shown until the CDN file exists (or if a link breaks). */
  emoji: string;
  /** How the emoji fallback moves. */
  anim?: "bounce" | "float" | "wiggle" | "pulse" | "spin";
}

export interface DayCopy {
  recipientPlaceholder: string;
  senderPlaceholder: string;
  petNamePlaceholder: string;
  letterPlaceholder: string;
  letterHint: string;
  photosHint: string;
  captionHint: string;
  noteHint: string;
  endLinePlaceholder: string;
  endLineHint: string;
  /** Edit sheet heading: "Grow their rose 🌹". */
  sheetTitle: string;
  sheetSub: string;
  /** The section heading for this day's extras: "Your rose". */
  extrasTitle: string;
  extrasSub: string;
  /** Overlay while publishing. */
  publishing: string;
  /** StoryStarter heading. */
  storyTitle: string;
  /** Prefilled WhatsApp reply the recipient sends back from the ending. */
  replyText: string;
  /** The owner's "they answered" chip (default "Said YES 💍"). */
  yesChip?: string;
}

export interface DayConfig<E extends Extras = Extras> {
  slug: DaySlug;
  /** "Rose Day" */
  name: string;
  /** "🌹" */
  emoji: string;
  /** 7 (February) / 31 (October) */
  date: number;
  /** "February" / "October" */
  month: string;
  /** "Ek Gulaab, Sirf Tumhare Liye" */
  title: string;
  maxPhotos: number;
  letterMax: number;
  /** Below this the letter does not count as written. */
  letterMin: number;
  asksQuestion: boolean;
  extras: readonly FieldSpec[];
  gifSlots: readonly GifSlot[];
  theme: DayTheme;
  demo: ValentineDayData<E>;
  copy: DayCopy;
  share: { title: string; accent: string };
  /** Which synthesised melody useSynthMusic plays. */
  melody: "garden" | "velvet" | "cocoa" | "arcade" | "paper" | "cafe" | "blush" | "lantern" | "spooky" | "garba" | "diya";
  /** The frame (width / height) this day shows photos in — the crop editor uses the same shape. */
  photoAspect: number;
  /**
   * Optional per-day music settings. Absent = the Valentine defaults: the
   * romantic suggestion list and a visible YouTube mini-player.
   */
  music?: DayMusicConfig;
  /** Present on the `-premium` slugs: the $2 twin, the premium limits are on the config itself. */
  premium?: { base: DaySlug };
  /**
   * Editor chrome: put the editor controls in the top-right PremiumTopBar
   * (Back · Edit · Create → Publish → Share) instead of the bottom EditorDock,
   * leaving the bottom of the screen to the scene. Premium days always do;
   * this opts a $2 day in. Scenes keep the top-right ≈200×56 clear.
   */
  topBar?: boolean;
  /**
   * The recipient page's SubhSandesh mark (viewer only): "pill" (default, logo +
   * word side by side) or "stacked" (logo with the word under it, top-right).
   */
  brandMark?: "pill" | "stacked";
  /**
   * A hands-on editor of the day's own (see editor/studios.tsx), opened from
   * the top of the form — e.g. the Digital Bouquet's arranging studio. It edits
   * the extras marked `hidden` (and may touch the letter / photos).
   */
  studio?: "bouquet" | "weddingPremium";
  /**
   * When the studio IS the form (the wedding tiers): the plain form's own
   * sections to keep under it (e.g. ["music", "finish"]); the rest — names,
   * extras, letter, photos, stickers — are the studio's. Absent = all.
   */
  formSections?: readonly ("names" | "details" | "letter" | "photos" | "stickers" | "music" | "premium" | "finish")[];
  /**
   * The studio has its own inline AI box: Create opens the form straight away
   * (no guided StoryStarter first) and the form's generic AI card is hidden.
   */
  studioAi?: boolean;
  /** With `formSections`: how many numbered steps the studio shows, so the kept sections number on from there. */
  formStart?: number;
  /** An owner-only panel over the editor preview once the page is published (editor/studios.tsx OWNER_PANELS), e.g. the wedding RSVP list. */
  ownerPanel?: "weddingGuests";
}

export interface DayMusicConfig {
  /**
   * Play a pasted YouTube song as AUDIO ONLY: the official player stays mounted
   * at its normal size (so iOS/Chrome keep it playing) but is fully covered by
   * an opaque now-playing card, so the video is never seen. See
   * music/DayMusic.tsx for the trade-off and how to switch it off.
   */
  audioOnly?: boolean;
  /**
   * Phones and desktop: draw the music as ONE 40px round play/stop icon (a
   * tiny equaliser while it plays) instead of the radio card / chip / melody
   * button, with no bottom reserve. Implies audio-only for a YouTube song.
   * It sits bottom-left by default; the day can move it with CSS on `.vm-icon`.
   */
  compact?: boolean;
  /** One-tap song chips in the form (default: the romantic list in music/youtube.ts). */
  suggestions?: readonly SongSuggestion[];
  /** Small line next to "Suggestions" ("romantic favourites · tap to use"). */
  suggestionsNote?: string;
  /** ✦ Premium: the second the preview's demo song (the first suggestion) starts at. */
  demoStart?: number;
  /**
   * The template's own looping background MP3 (music mode "track"). When set,
   * the editor offers it first in the music picker, and a demo whose
   * musicMode is "track" keeps it (withDemoSong never swaps it for YouTube).
   */
  track?: DayTrack;
  /**
   * How loud the song plays, 0–1 of the usual level (default 1). For a page
   * whose own sounds have to carry over it — Dandiya's stick clacks sit on a
   * quiet garba bed. iOS ignores media volume, so there it is full level.
   */
  volume?: number;
}

export interface DayTrack {
  /** Absolute https URL of a seamlessly looping MP3 (use templateMedia helpers). */
  url: string;
  /** Shown in the now-playing chip / radio card and the picker. */
  title: string;
  artist?: string;
  /** The picker card's second line (default "Made for this template") — for a track that is a known song. */
  hint?: string;
}

export const VW_LIMITS = { name: 30, petName: 24, endLine: 90, gifUrl: 600 } as const;

// ─── Wire format ─────────────────────────────────────────────────────────────

const CONTENT_KEYS: (keyof ValentineDayData)[] = [
  "recipientName", "senderName", "petName", "letter", "photos", "gifs", "music", "musicMode", "musicYoutubeId", "musicStart", "endLine", "extras", "premium",
];

/** POST/PUT body. An explicit allow-list: UI-only state never reaches the server. */
export function toBody(data: ValentineDayData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, CONTENT_KEYS, password);
}

const isHttps = (s: string) => /^https:\/\/\S+$/i.test(s) && s.length <= VW_LIMITS.gifUrl;

export function coerceGifs(slug: DaySlug, raw: unknown): Record<string, string> {
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: Record<string, string> = {};
  for (const slot of getDay(slug).gifSlots) {
    const v = typeof src[slot.id] === "string" ? (src[slot.id] as string).trim() : "";
    out[slot.id] = v === "none" ? "none" : isHttps(v) ? v : "";
  }
  return out;
}

/** The demo the editor opens with (a fresh deep copy each call). */
export function demoData(slug: DaySlug): ValentineDayData {
  return JSON.parse(JSON.stringify(getDay(slug).demo)) as ValentineDayData;
}

/**
 * Wire → data. Untrusted (a published page, an old draft): every field is
 * coerced. A page from the server keeps its blanks; anything else falls back
 * to the demo so the preview is never empty.
 */
export function fromDb(slug: DaySlug, db: Raw | null | undefined, fromServer = db != null): ValentineDayData {
  const day = getDay(slug);
  const src = db ?? {};
  const demo = day.demo;
  const s = (v: unknown, max: number, fb: string) => (typeof v === "string" ? v.slice(0, max) : fromServer ? "" : fb);
  return {
    recipientName: s(src.recipientName, VW_LIMITS.name, demo.recipientName),
    senderName: s(src.senderName, VW_LIMITS.name, demo.senderName),
    petName: s(src.petName, VW_LIMITS.petName, demo.petName),
    letter: s(src.letter, day.letterMax, demo.letter),
    photos: parseLovePhotos(src.photos, fromServer ? [] : demo.photos, day.maxPhotos).slice(0, day.maxPhotos),
    gifs: coerceGifs(slug, src.gifs),
    ...coerceMusic(src, { track: !!day.music?.track }),
    endLine: s(src.endLine, VW_LIMITS.endLine, demo.endLine),
    extras: coerceExtras(day.extras, src.extras, fromServer ? null : demo.extras),
    ...(day.premium ? { premium: coercePremium(src.premium, fromServer ? PREMIUM_DEFAULTS : demo.premium ?? PREMIUM_DEFAULTS) } : {}),
  };
}

/** Reactions off the owner's GET. Missing → all null. */
export function parseReactions(raw: unknown): ValentineReactions {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const d = (v: unknown) => (typeof v === "string" && v ? v : null);
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  return {
    openedAt: d(r.openedAt),
    completedAt: d(r.completedAt),
    answer: r.answer === "yes" || r.answer === "no" ? r.answer : null,
    answeredAt: d(r.answeredAt),
    noDodges: n(r.noDodges),
    count: n(r.count),
    reply:
      r.reply && typeof r.reply === "object" && typeof (r.reply as Record<string, unknown>).text === "string"
        ? { text: String((r.reply as Record<string, unknown>).text).slice(0, 280), at: d((r.reply as Record<string, unknown>).at) ?? "" }
        : null,
  };
}

/** Save-time clean-up: trims, drops photo stubs the AI captioned without a picture, tidies extras. */
export function tidy(slug: DaySlug, d: ValentineDayData): ValentineDayData {
  const day = getDay(slug);
  return {
    ...d,
    recipientName: d.recipientName.trim(),
    senderName: d.senderName.trim(),
    petName: (d.petName ?? "").trim(),
    endLine: (d.endLine ?? "").trim(),
    photos: (d.photos ?? [])
      .filter((p) => p && typeof p.url === "string" && p.url)
      .map((p) => ({ ...p, caption: p.caption?.slice(0, MAX_CAPTION_LEN), note: p.note?.slice(0, MAX_NOTE_LEN) }))
      .slice(0, day.maxPhotos),
    gifs: coerceGifs(slug, d.gifs),
    ...coerceMusic(d as unknown as Record<string, unknown>, { track: !!day.music?.track }),
    extras: tidyExtras(day.extras, d.extras ?? {}),
    ...(day.premium ? { premium: tidyPremium(coercePremium(d.premium)) } : {}),
  };
}

/** Exactly what still stops Save, in the words the form uses. */
export function missingForSave(slug: DaySlug, d: ValentineDayData): string[] {
  const day = getDay(slug);
  const out: string[] = [];
  if (!d.recipientName.trim()) out.push("their name");
  if (!d.senderName.trim()) out.push("your name");
  if (d.letter.trim().length < day.letterMin) out.push(day.letterMin > 1 ? `a letter (at least ${day.letterMin} characters)` : "your letter");
  out.push(...extrasMissing(day.extras, d.extras ?? {}));
  if (d.musicMode === "youtube" && !YOUTUBE_ID_RE.test(d.musicYoutubeId ?? "")) out.push("a YouTube song (or pick another music option)");
  return out;
}
