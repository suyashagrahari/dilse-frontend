// ─── Turning a held photo into an S3 URL ─────────────────────────────────────
//
// One uploader for every template, because adoption has to work for shapes it
// has never seen. `POST /media/upload` re-encodes to WebP and answers with a CDN
// URL; this module's whole job is getting bytes to it from the two forms a
// pending photo can take.
//
// ── WHY DATA URLS ARE DECODED BY HAND ───────────────────────────────────────
//
// `fetch(dataUrl).then(r => r.blob())` is the one-liner, and it is a trap here:
// a Content Security Policy that does not list `data:` in `connect-src` blocks
// it, and the failure arrives as a generic TypeError indistinguishable from the
// user being offline. Decoding with `atob` touches no network and cannot be
// blocked by policy.

import { API_URL, IS_NGROK } from "@/lib/config";
import { classifyMediaRef, LOCAL_REF_PREFIX } from "./mediaRefs";

/** The server's own multer ceiling is 20 MB. Refuse earlier, before the bytes fly. */
const MAX_BYTES = 12 * 1024 * 1024;

export interface UploadedRef {
  ok: boolean;
  url?: string;
  /** Safe to show a user directly. */
  error?: string;
}

/**
 * Fetches the Blob behind an `idb:<id>` ref.
 *
 * Supplied by the editor rather than looked up here: the two rakhi templates
 * keep their blobs in their own IndexedDB store, and reaching into another
 * module's database from here would make this file depend on every template that
 * has one. An editor with no local blob store passes nothing, and its `idb:`
 * refs — which it cannot produce anyway — are left untouched.
 */
export type LocalRefResolver = (ref: string) => Promise<Blob | null>;

/**
 * Convert one pending ref into an uploaded CDN URL.
 *
 * A `remote` ref is returned as-is without a request. That is not an
 * optimisation; re-uploading a URL that came back from a previous upload is how
 * you silently multiply S3 objects across repeated saves.
 */
export async function uploadPendingRef(
  ref: string,
  opts: {
    templateType: string;
    accessToken: string | null | undefined;
    resolveLocalRef?: LocalRefResolver;
  }
): Promise<UploadedRef> {
  const kind = classifyMediaRef(ref);
  if (kind === "remote") return { ok: true, url: ref };
  if (kind === "none") return { ok: false, error: "Not an image" };
  if (!opts.accessToken) return { ok: false, error: "Sign in to save photos" };

  let blob: Blob | null = null;

  if (kind === "data-url") {
    blob = dataUrlToBlob(ref);
    if (!blob) return { ok: false, error: "That photo could not be read" };
  } else {
    if (!opts.resolveLocalRef) {
      // The editor holds blobs somewhere this module cannot see. Say so plainly
      // rather than reporting a fake upload failure — the caller leaves the ref
      // alone and the at-publish path still handles it.
      return { ok: false, error: "unresolvable-local-ref" };
    }
    blob = await opts.resolveLocalRef(ref);
    if (!blob) return { ok: false, error: "One of your photos went missing — add it again" };
  }

  if (blob.size > MAX_BYTES) return { ok: false, error: "Too big — keep it under 12MB" };

  const body = new FormData();
  body.append("file", new File([blob], fileNameFor(ref, blob.type), { type: blob.type }));
  body.append("template", opts.templateType);
  body.append("kind", "image");

  try {
    const res = await fetch(`${API_URL}/media/upload`, {
      method: "POST",
      // No Content-Type: the browser must set the multipart boundary itself, and
      // setting it by hand produces a request multer cannot parse.
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
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

/** `data:image/png;base64,AAAA` → Blob, without touching the network. */
function dataUrlToBlob(dataUrl: string): Blob | null {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;

  const header = dataUrl.slice(5, comma); // past "data:"
  const isBase64 = header.endsWith(";base64");
  const mime = (isBase64 ? header.slice(0, -";base64".length) : header) || "image/png";
  const payload = dataUrl.slice(comma + 1);

  try {
    if (!isBase64) {
      return new Blob([decodeURIComponent(payload)], { type: mime });
    }
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    // Truncated base64 — a scratch record half-written when the tab was killed.
    return null;
  }
}

function fileNameFor(ref: string, mime: string): string {
  const ext = (mime.split("/")[1] || "png").split("+")[0];
  const id = ref.startsWith(LOCAL_REF_PREFIX) ? ref.slice(LOCAL_REF_PREFIX.length) : "inline";
  return `${id.slice(0, 24) || "photo"}.${ext}`;
}
