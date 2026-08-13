import { API_URL, IS_NGROK } from "@/lib/config";

// ─── Image upload ────────────────────────────────────────────────────────────
//
// Uploads through `/media/upload`, which re-encodes to WebP and returns an S3
// URL. Several older templates instead read the file with FileReader and store
// the base64 data URL directly on the document — that works for one small avatar
// and breaks here.
//
// This template holds a hero photo plus up to twelve memories. At the 3 MB per
// image those editors allow, base64 (≈1.37× the raw bytes) would put a single
// document past Mongo's hard 16 MB BSON ceiling well before the twelfth photo,
// and the failure arrives as an opaque write error at publish time — after she
// has done all the work. It would also re-send every photo on every autosave.
//
// So: upload once, store a URL. `photoUrl` and `memories[].imageUrl` are capped
// at 600 characters server-side, which fits a URL and firmly does not fit a data
// URL — the cap is the backstop for this decision.

export interface UploadResult {
  ok: boolean;
  url?: string;
  /** Safe to show the user directly. */
  error?: string;
}

/** 12 MB is the server's own ceiling — reject here so the bytes are never sent. */
const MAX_BYTES = 12 * 1024 * 1024;

export async function uploadImage(
  file: File,
  accessToken: string | null | undefined
): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "That's not an image" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Too big — keep it under 12MB" };
  }
  if (!accessToken) {
    return { ok: false, error: "Sign in to add photos" };
  }

  const body = new FormData();
  body.append("file", file);
  body.append("template", "raksha-bandhan");
  body.append("kind", "image");

  try {
    const res = await fetch(`${API_URL}/media/upload`, {
      method: "POST",
      // No Content-Type header: the browser must set the multipart boundary
      // itself, and setting it by hand produces a request multer cannot parse.
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
      },
      body,
    });
    const json = await res.json();
    if (!res.ok || !json?.success || !json.data?.url) {
      return { ok: false, error: typeof json?.error === "string" ? json.error : "Upload failed" };
    }
    return { ok: true, url: String(json.data.url) };
  } catch {
    return { ok: false, error: "Upload failed — check your connection" };
  }
}
