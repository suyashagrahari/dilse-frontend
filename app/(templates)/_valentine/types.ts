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
import { getDay } from "./days";

export type { DaySlug } from "./days/slugs";
export type { LovePhoto } from "../_love/types";

export type EditMode = null | "manual" | "preview";

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
  /** Soft synthesised melody on/off (still muted until the first gesture). */
  music: boolean;
  /** ≤90, the final screen line. */
  endLine: string;
  extras: E;
}

/** Server-written by the recipient's beacon. The owner sees them; recipients never get them. */
export interface ValentineReactions {
  openedAt: string | null;
  completedAt: string | null;
  answer: "yes" | null;
  answeredAt: string | null;
  noDodges: number | null;
  count: number | null;
}

export type ReactionEvent = "opened" | "completed" | "answered";
export type ReactFn = (event: ReactionEvent, extra?: { noDodges?: number; count?: number }) => void;

/** What every day's Experience receives. */
export interface ExperienceProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: ValentineDayData<any>;
  /** "preview" = inside the editor (react is a no-op); "live" = the recipient. */
  mode: "preview" | "live";
  /** Fire-and-forget beacon. Safe to call repeatedly — first one wins server-side. */
  react: ReactFn;
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
}

export interface DayConfig<E extends Extras = Extras> {
  slug: DaySlug;
  /** "Rose Day" */
  name: string;
  /** "🌹" */
  emoji: string;
  /** 7 (February) */
  date: number;
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
  melody: "garden" | "velvet" | "cocoa" | "arcade" | "paper" | "cafe" | "blush" | "lantern";
}

export const VW_LIMITS = { name: 30, petName: 24, endLine: 90, gifUrl: 600 } as const;

// ─── Wire format ─────────────────────────────────────────────────────────────

const CONTENT_KEYS: (keyof ValentineDayData)[] = [
  "recipientName", "senderName", "petName", "letter", "photos", "gifs", "music", "endLine", "extras",
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
    photos: parseLovePhotos(src.photos, fromServer ? [] : demo.photos).slice(0, day.maxPhotos),
    gifs: coerceGifs(slug, src.gifs),
    music: typeof src.music === "boolean" ? src.music : true,
    endLine: s(src.endLine, VW_LIMITS.endLine, demo.endLine),
    extras: coerceExtras(day.extras, src.extras, fromServer ? null : demo.extras),
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
    answer: r.answer === "yes" ? "yes" : null,
    answeredAt: d(r.answeredAt),
    noDodges: n(r.noDodges),
    count: n(r.count),
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
    extras: tidyExtras(day.extras, d.extras ?? {}),
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
  return out;
}
