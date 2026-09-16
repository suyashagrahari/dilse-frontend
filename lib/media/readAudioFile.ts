// ─── Reading a song or a recording the user just handed us ──────────────────
//
// Nine editors had their own copy of this, and all nine were the same four
// lines: a bare `FileReader`, no size check, no `onerror`. So a 40MB WAV became
// 54MB of base64 sitting in React state, the save was refused by nginx as a
// plain 413 with no CORS headers, and the browser reported that to the editor
// as a network failure — meaning the user was told to check their connection
// about a file that was simply too large to describe.
//
// One reader, one ceiling, one sentence when it does not fit.

import { pushToast } from "@/lib/toast/toastBus";

// ── WHY 8MB AND NOT THE SERVER'S 20 ─────────────────────────────────────────
//
// A page is saved as one JSON document with its media inline as base64, which
// costs a third more than the bytes themselves, and nginx caps the whole
// request (`client_max_body_size` in `nginx/backend.conf`, currently 15m on the
// box). 8MB of audio is ~11MB encoded, which leaves room for the photos in the
// same payload.
//
// `mediaProcessor.service.ts` will happily take 20MB. To actually allow it,
// raise `client_max_body_size` to 40m on the server — `app.ts` is already
// there — and then this number. Both, or neither: raising this one alone just
// moves the failure from a sentence to a 413.
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

const mb = (bytes: number) => Math.round((bytes / (1024 * 1024)) * 10) / 10;

export type AudioReadResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: string };

/**
 * Turn a picked file or a finished recording into the data URL the editors hold
 * until the page is saved, refusing — out loud — anything that cannot survive
 * the trip.
 *
 * The returned data URL keeps whatever type the browser gave the blob, codec
 * parameters and all, and does not invent one when the browser gave nothing.
 * The server reads the container's magic bytes (`services/mediaSniff.ts`) and
 * no longer believes this field, which is what lets a recording from a phone
 * that could not name it reach S3 instead of being stored as itself.
 */
export function readAudioFile(file: File | Blob): Promise<AudioReadResult> {
  return new Promise((resolve) => {
    if (!file || !file.size) {
      resolve({ ok: false, error: "That file looks empty — try another one." });
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      resolve({
        ok: false,
        error: `That clip is ${mb(file.size)}MB — keep it under ${mb(MAX_AUDIO_BYTES)}MB.`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.startsWith("data:")) {
        resolve({ ok: false, error: "That file could not be read — try another one." });
        return;
      }
      resolve({ ok: true, dataUrl: result });
    };
    // The half of FileReader nine copies of this forgot. A file that vanished
    // from disk mid-read, or one the OS will not hand over, lands here — and
    // used to land nowhere, leaving the picker looking like it had worked.
    reader.onerror = () => resolve({ ok: false, error: "That file could not be read — try another one." });
    reader.readAsDataURL(file);
  });
}

/**
 * Is this file worth trying to read as audio?
 *
 * Not `file.type.startsWith("audio/")`, which is the check three guest forms
 * used and the reason a picked song sometimes did nothing at all: a file the OS
 * could not type arrives with `type === ""` or `"application/octet-stream"`,
 * failed that test, and was dropped silently with the input reset. The user saw
 * their tap do nothing and tried again.
 *
 * Anything undecided is waved through. The server reads the magic bytes
 * (`services/mediaSniff.ts`) and refuses it there, with a reason, if it really
 * is not audio.
 */
export function looksPickableAsAudio(file: File | Blob): boolean {
  const type = (file.type || "").toLowerCase().split(";")[0].trim();
  if (!type || type === "application/octet-stream" || type === "binary/octet-stream") return true;
  return type.startsWith("audio/") || type.startsWith("video/"); // an .mp4 voice memo is video/mp4
}

/**
 * The same thing, for the call sites that have no error state of their own and
 * no obvious place to put one. Shows the reason as a toast and answers with the
 * data URL, or `null`.
 */
export async function readAudioFileOrToast(file: File | Blob): Promise<string | null> {
  const read = await readAudioFile(file);
  if (read.ok) return read.dataUrl;
  pushToast({ type: "error", title: "Couldn't add that audio", message: read.error });
  return null;
}
