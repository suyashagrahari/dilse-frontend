// ─── Dedication — editor model, demo show, wire coercion ─────────────────────
//
// `types.ts` is the frozen contract and owns the STORED shape. Everything the
// editor needs on top of it lives here: the flat form model the sheet binds to,
// the demo show the gallery preview plays, and the two wire directions.
//
// Why the demo ships with no media at all
// ---------------------------------------
// The brief forbids bundling, hosting or suggesting music, and forbids shipping
// an audio file. So the demo show carries song segments with an EMPTY
// `youtubeId` and voice segments with an EMPTY `audioUrl`. Both degrade into
// legitimate product states rather than into breakage:
//
//   • voice with no audioUrl  → the documented text-to-card fallback
//     (BOOTH.denied). The caption plays as an on-screen card for `durationMs`.
//   • song with no youtubeId  → the panel shows NO SIGNAL, the dedication card
//     still slides up, and the segment still advances.
//
// A voice segment whose `audioUrl` is SET but fails to load is a different
// thing entirely — that one is skipped, per the brief. The distinction is
// `audioUrl === ""` (intentional) vs. an error event (broken).

import { list, num, obj, str, strOr } from "@/lib/wire";
import {
  DIAL,
  parseYouTubeId,
  type RadioShow,
  type Segment,
  type SongSegment,
  type VoiceSegment,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Editor-side types (deliberately NOT in the frozen contract)
// ═══════════════════════════════════════════════════════════════════════════

export type EditMode = "manual" | "preview" | null;

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/**
 * The flat form model. Flat because the edit sheet binds one input per key and
 * the API body is a flat document; `toShow` folds it back into the nested
 * `RadioShow` the player consumes.
 */
export interface DedicationData {
  stationName: string;
  stationFrequency: string;
  senderName: string;
  senderCity: string;
  recipientName: string;
  recipientCity: string;
  segments: Segment[];
  signOff: string;
}

/** The allow-list copied into the POST/PUT body. */
export const BODY_KEYS = [
  "stationName",
  "stationFrequency",
  "senderName",
  "senderCity",
  "recipientName",
  "recipientCity",
  "segments",
  "signOff",
] as const satisfies readonly (keyof DedicationData)[];

/** A show longer than this stops being radio and starts being a podcast. */
export const MAX_SEGMENTS = 8;
export const MAX_CAPTION_LEN = 160;
export const MAX_DEDICATION_LEN = 140;
export const MAX_NAME_LEN = 24;
export const MAX_SIGNOFF_LEN = 180;

// ═══════════════════════════════════════════════════════════════════════════
// Demo
// ═══════════════════════════════════════════════════════════════════════════

export const DEMO_DATA: DedicationData = {
  stationName: "RADIO MEERA",
  stationFrequency: "98.3",
  senderName: "Arjun",
  senderCity: "Pune",
  recipientName: "Meera",
  recipientCity: "Bengaluru",
  signOff: "same frequency, same time, whenever you want. goodnight, Bengaluru.",
  segments: [
    {
      kind: "voice",
      audioUrl: "",
      durationMs: 9000,
      caption:
        "Good evening. You're on 98.3, and for the next few minutes this station only plays for one person.",
    },
    {
      kind: "song",
      youtubeId: "",
      title: "your song goes here",
      artist: "paste a YouTube link in the booth",
      dedication: "This one goes out to Meera in Bengaluru, from Arjun.",
    },
    {
      kind: "voice",
      audioUrl: "",
      durationMs: 8000,
      caption:
        "That was the one you hummed the whole way back from the airport. I never told you I noticed.",
    },
    {
      kind: "song",
      youtubeId: "",
      title: "and another one",
      artist: "your pick",
      dedication: "Still going out to Meera. Still from Arjun.",
    },
  ],
};

/** A brand-new show — one voice slot, one song slot, nothing filled in. */
export const BLANK_DATA: DedicationData = {
  stationName: "",
  stationFrequency: "98.3",
  senderName: "",
  senderCity: "",
  recipientName: "",
  recipientCity: "",
  signOff: "",
  segments: [
    { kind: "voice", audioUrl: "", durationMs: 8000, caption: "" },
    { kind: "song", youtubeId: "", title: "", artist: "", dedication: "" },
  ],
};

export const blankVoice = (): VoiceSegment => ({
  kind: "voice",
  audioUrl: "",
  durationMs: 8000,
  caption: "",
});

export const blankSong = (): SongSegment => ({
  kind: "song",
  youtubeId: "",
  title: "",
  artist: "",
  dedication: "",
});

// ═══════════════════════════════════════════════════════════════════════════
// Derived
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The dial number the needle has to find. A sender is allowed to type "14.3"
 * because that is the date they met — it gets clamped onto the band rather than
 * rejected, since an unreachable target is a radio that can never be tuned.
 */
export function targetFrequency(freq: string): number {
  const raw = Number(String(freq).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(raw)) return 98.3;
  if (raw >= DIAL.min && raw <= DIAL.max) return Number(raw.toFixed(1));
  // Fold an out-of-band number onto the band, keeping its decimal so "14.3"
  // still lands on a .3 and still feels chosen rather than assigned.
  const span = DIAL.max - DIAL.min;
  const folded = DIAL.min + (((raw % span) + span) % span);
  return Number(Math.min(DIAL.max - 0.5, Math.max(DIAL.min + 0.5, folded)).toFixed(1));
}

/** The number printed in the amber display — the sender's, verbatim. */
export const displayFrequency = (freq: string): string => (freq || "").trim() || "98.3";

export const toShow = (d: DedicationData): RadioShow => ({
  station: { name: d.stationName || "RADIO DEDICATION", frequency: displayFrequency(d.stationFrequency) },
  sender: { name: d.senderName, city: d.senderCity },
  recipient: { name: d.recipientName, city: d.recipientCity },
  segments: d.segments,
  signOff: d.signOff,
});

/** True when at least one segment carries a playable YouTube id. */
export const hasAnySong = (segs: Segment[]): boolean =>
  segs.some((s) => s.kind === "song" && Boolean(s.youtubeId));

/** The first playable video id, used to construct the player inside the gesture. */
export const firstSongId = (segs: Segment[]): string | null => {
  for (const s of segs) if (s.kind === "song" && s.youtubeId) return s.youtubeId;
  return null;
};

/** The line the request slip prints under SONG. */
export const headlineSong = (segs: Segment[]): SongSegment | null => {
  for (const s of segs) if (s.kind === "song" && (s.title || s.youtubeId)) return s;
  return null;
};

/** The line the request slip prints under MESSAGE. */
export const headlineDedication = (segs: Segment[]): string => {
  for (const s of segs) if (s.kind === "song" && s.dedication.trim()) return s.dedication.trim();
  for (const s of segs) if (s.kind === "voice" && (s.caption ?? "").trim()) return (s.caption ?? "").trim();
  return "";
};

// ═══════════════════════════════════════════════════════════════════════════
// Wire
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The EDITOR's coercer, deliberately more forgiving than `dbToRadioShow` in
 * `coerce.ts`. That one drops a song whose id no longer validates, which is
 * right for the recipient — but wrong here, where silently deleting the row the
 * sender is halfway through fixing is the worst possible response. The row is
 * kept with a blank id and the sheet flags it.
 */
const coerceEditorSegment = (raw: Record<string, unknown>): Segment | null => {
  if (raw.kind === "song") {
    // Stored ids are re-validated on the way out of the database: a document
    // written before `parseYouTubeId` existed may hold a whole URL.
    const id = parseYouTubeId(str(raw.youtubeId, ""));
    const seg: SongSegment = {
      kind: "song",
      youtubeId: id ?? "",
      title: strOr(raw.title, ""),
      artist: strOr(raw.artist, ""),
      dedication: strOr(raw.dedication, ""),
    };
    const start = num(raw.startSeconds, -1);
    if (start >= 0) seg.startSeconds = Math.floor(start);
    const end = num(raw.endSeconds, -1);
    if (end > 0) seg.endSeconds = Math.floor(end);
    return seg;
  }
  if (raw.kind === "voice") {
    return {
      kind: "voice",
      audioUrl: strOr(raw.audioUrl, ""),
      // Clamped: a zero-length voice segment would advance instantly and read
      // as a skip; an hour-long one would strand the listener.
      durationMs: Math.min(180_000, Math.max(1000, num(raw.durationMs, 8000))),
      caption: strOr(raw.caption, ""),
    };
  }
  return null;
};

export function dbToDedicationData(raw: unknown): DedicationData {
  const d = obj(raw);
  return {
    stationName: str(d.stationName, DEMO_DATA.stationName),
    stationFrequency: str(d.stationFrequency, DEMO_DATA.stationFrequency),
    senderName: strOr(d.senderName, ""),
    senderCity: strOr(d.senderCity, ""),
    recipientName: strOr(d.recipientName, ""),
    recipientCity: strOr(d.recipientCity, ""),
    segments: list<Segment>(d.segments, coerceEditorSegment, DEMO_DATA.segments).slice(0, MAX_SEGMENTS),
    signOff: strOr(d.signOff, DEMO_DATA.signOff),
  };
}

export function dedicationDataToBody(d: DedicationData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of BODY_KEYS) body[k] = d[k];
  if (password !== undefined) body.password = password;
  return body;
}
