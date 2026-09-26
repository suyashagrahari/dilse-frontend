// ─── Dedication — untrusted-payload coercion ─────────────────────────────────
//
// The published page hands this whatever Mongo returns. That document may be
// older than the current schema, partially filled, or edited by hand. Every
// field is clamped or replaced; nothing here can throw and nothing here can
// hand the player a value it will choke on at runtime.
//
// `types.ts` is frozen, so this lives in its own module. It is the ONLY thing
// the share viewer needs to import besides the template itself.
//
// The one destructive rule: a song segment whose `youtubeId` no longer passes
// `parseYouTubeId` is DROPPED, not repaired. A bad id reaches the IFrame API as
// a load error eight seconds later, mid-show, with the listener staring at a
// dead panel. Failing at coercion time costs one segment; failing at playback
// time costs the show its pacing.

import { num, obj, str, strOr } from "@/lib/wire";
import {
  parseYouTubeId,
  type ClipSegment,
  type Photo,
  type RadioShow,
  type Segment,
  type SongSegment,
  type VoiceSegment,
} from "./types";

/** Matches `MAX_SEGMENTS` in showData; duplicated so the viewer needs one import. */
const MAX_SEGMENTS = 8;
const MIN_VOICE_MS = 1000;
const MAX_VOICE_MS = 180_000;

const DEFAULT_STATION = "RADIO DEDICATION";
const DEFAULT_FREQUENCY = "98.3";
const DEFAULT_SIGNOFF = "that's the show. same frequency, whenever you want.";

/**
 * A voice segment always survives coercion. With no `audioUrl` it becomes the
 * documented text-to-card fallback rather than a hole in the running order —
 * see the note at the top of `showData.ts`.
 */
function coerceVoice(raw: Record<string, unknown>): VoiceSegment {
  return {
    kind: "voice",
    audioUrl: strOr(raw.audioUrl, "").trim(),
    durationMs: Math.min(MAX_VOICE_MS, Math.max(MIN_VOICE_MS, Math.round(num(raw.durationMs, 8000)))),
    caption: strOr(raw.caption, "").slice(0, 400),
  };
}

/**
 * Returns null when the id cannot be recovered. `parseYouTubeId` is re-run even
 * on values that look like bare ids, because a document written before it
 * existed can hold a whole URL, and the IFrame API will accept that string and
 * then fail silently.
 */
function coerceSong(raw: Record<string, unknown>): SongSegment | null {
  const id = parseYouTubeId(strOr(raw.youtubeId, ""));
  if (!id) return null;

  const seg: SongSegment = {
    kind: "song",
    youtubeId: id,
    title: strOr(raw.title, "").slice(0, 120),
    artist: strOr(raw.artist, "").slice(0, 120),
    dedication: strOr(raw.dedication, "").slice(0, 400),
  };

  // Negative, non-finite and NaN all collapse to "unset" rather than being
  // passed to seekTo, which treats a bad argument as 0 without complaining.
  const start = Math.floor(num(raw.startSeconds, -1));
  if (start > 0) seg.startSeconds = start;
  const end = Math.floor(num(raw.endSeconds, -1));
  // An end at or before the start would end the segment the instant it began.
  if (end > 0 && end > (seg.startSeconds ?? 0)) seg.endSeconds = end;

  return seg;
}

const MAX_CLIPS = 3;
const MAX_PHOTOS = 12;
const isHttps = (u: string): boolean => /^https:\/\//.test(u);

/** An uploaded video. Only an https URL can play for a recipient. */
function coerceClip(raw: Record<string, unknown>): ClipSegment | null {
  const videoUrl = strOr(raw.videoUrl, "").trim();
  if (!isHttps(videoUrl)) return null;
  const clip: ClipSegment = {
    kind: "clip",
    videoUrl,
    title: strOr(raw.title, "").slice(0, 120),
    dedication: strOr(raw.dedication, "").slice(0, 400),
  };
  const poster = strOr(raw.posterUrl, "").trim();
  if (isHttps(poster)) clip.posterUrl = poster;
  return clip;
}

/** Coerce one raw segment. Unknown `kind` values and dead songs return null. */
export function coerceSegment(raw: unknown): Segment | null {
  const r = obj(raw);
  if (r.kind === "voice") return coerceVoice(r);
  if (r.kind === "song") return coerceSong(r);
  if (r.kind === "clip") return coerceClip(r);
  return null;
}

function coercePhotos(raw: unknown): Photo[] {
  if (!Array.isArray(raw)) return [];
  const out: Photo[] = [];
  for (const item of raw) {
    const r = obj(item);
    const url = strOr(r.url, "").trim();
    if (!isHttps(url)) continue;
    const caption = strOr(r.caption, "").trim().slice(0, 80);
    out.push(caption ? { url, caption } : { url });
    if (out.length >= MAX_PHOTOS) break;
  }
  return out;
}

/**
 * The share viewer's entry point. Never throws, never returns a show the player
 * cannot run.
 *
 * A show that coerces down to zero segments is given a single voice card
 * carrying the sign-off, because a radio with an empty running order tunes in
 * and then sits in silence, which reads as broken rather than as empty.
 */
export function dbToRadioShow(raw: Record<string, unknown>): RadioShow {
  const d = obj(raw);
  const station = obj(d.station);
  const sender = obj(d.sender);
  const recipient = obj(d.recipient);

  // Both shapes are accepted: the flat form body the editor posts, and the
  // nested `RadioShow` a future writer might store.
  const stationName = str(d.stationName, str(station.name, DEFAULT_STATION));
  const stationFrequency = str(d.stationFrequency, str(station.frequency, DEFAULT_FREQUENCY));
  const senderName = strOr(d.senderName, strOr(sender.name, "")).slice(0, 60);
  const senderCity = strOr(d.senderCity, strOr(sender.city, "")).slice(0, 60);
  const recipientName = strOr(d.recipientName, strOr(recipient.name, "")).slice(0, 60);
  const recipientCity = strOr(d.recipientCity, strOr(recipient.city, "")).slice(0, 60);

  const rawSegments = Array.isArray(d.segments) ? d.segments : [];
  let clips = 0;
  const segments = rawSegments
    .map(coerceSegment)
    .filter((s): s is Segment => s !== null)
    .filter((s) => s.kind !== "clip" || ++clips <= MAX_CLIPS)
    .slice(0, MAX_SEGMENTS);

  const signOff = strOr(d.signOff, DEFAULT_SIGNOFF).slice(0, 400) || DEFAULT_SIGNOFF;

  if (segments.length === 0) {
    segments.push({ kind: "voice", audioUrl: "", durationMs: 6000, caption: signOff });
  }

  return {
    station: { name: stationName.slice(0, 60), frequency: stationFrequency.slice(0, 12) },
    sender: { name: senderName, city: senderCity },
    recipient: { name: recipientName, city: recipientCity },
    segments,
    signOff,
    photos: coercePhotos(d.photos),
    letter: strOr(d.letter, "").slice(0, 2000),
  };
}
