// ─── AI form-fill — the four network calls ───────────────────────────────────
//
// Thin, typed, and total: every function returns a discriminated result and
// none of them ever throws. The callers of this file are React event handlers
// inside editors that a sender has half-filled in; an exception escaping into
// one of those is a blank screen over work they cannot get back, so the failure
// modes are values here rather than control flow.
//
// `status` is the HTTP status when there was one and `0` when the request never
// reached a server (offline, DNS, CORS, abort). The hook keys its human-facing
// messages off that number, which is why it is kept rather than folded into the
// error string.

import { API_URL, IS_NGROK } from "@/lib/config";
import type { FillResponse, StoryEntry, StoryPeople, StoryProfile, WireSchema } from "./types";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

/** Same shape the editors and authSlice use — the ngrok tunnel needs the bypass header. */
function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  if (IS_NGROK) headers["ngrok-skip-browser-warning"] = "true";
  return headers;
}

function authHeaders(token?: string | null, extra: Record<string, string> = {}) {
  return apiHeaders(token ? { Authorization: `Bearer ${token}`, ...extra } : extra);
}

const NETWORK_ERROR = "Couldn't reach the server.";

/**
 * Read `{ success, data }` off a response without trusting any part of it.
 *
 * A 500 from a proxy is frequently an HTML error page, so `res.json()` is
 * itself a throw site and is guarded. An unparseable body on a failed request
 * is not interesting — the status already told us what happened.
 */
async function envelope<T>(res: Response, fallback: string): Promise<ApiResult<T>> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  const obj = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  if (!res.ok) {
    const message =
      (typeof obj.error === "string" && obj.error) ||
      (typeof obj.message === "string" && obj.message) ||
      fallback;
    return { ok: false, status: res.status, error: message };
  }

  if (obj.success === false || obj.data === undefined || obj.data === null) {
    const message = typeof obj.error === "string" ? obj.error : fallback;
    return { ok: false, status: res.status, error: message };
  }

  return { ok: true, data: obj.data as T };
}

/** Public. A 404 here means "this template has no AI schema", which is normal. */
export async function fetchStorySchema(
  slug: string,
  signal?: AbortSignal
): Promise<ApiResult<WireSchema>> {
  try {
    const res = await fetch(`${API_URL}/story/schema/${encodeURIComponent(slug)}`, {
      headers: apiHeaders(),
      signal,
    });
    return await envelope<WireSchema>(res, "Couldn't load this template's fields.");
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

export interface FillRequest {
  slug: string;
  story?: string;
  useContext?: boolean;
  people?: Partial<StoryPeople>;
}

/**
 * The fill itself. Auth is OPTIONAL by design — a logged-out sender who found a
 * template through a shared link must be able to press Generate, and only gets
 * asked to sign in when they publish.
 */
export async function postStoryFill(
  body: FillRequest,
  token?: string | null,
  signal?: AbortSignal
): Promise<ApiResult<FillResponse>> {
  try {
    const res = await fetch(`${API_URL}/story/fill`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
      signal,
    });
    return await envelope<FillResponse>(res, "Couldn't write that just now.");
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/** Requires auth. Callers should not bother when there is no token. */
export async function fetchStoryProfile(
  token: string,
  signal?: AbortSignal
): Promise<ApiResult<StoryProfile>> {
  try {
    const res = await fetch(`${API_URL}/story/profile`, {
      headers: authHeaders(token),
      signal,
    });
    return await envelope<StoryProfile>(res, "Couldn't load your saved story.");
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}

/** Requires auth. Saves the paragraph the sender just wrote so the next template reuses it. */
export async function saveStoryToProfile(
  body: { title: string; text: string; sourceSlug: string },
  token: string,
  signal?: AbortSignal
): Promise<ApiResult<StoryEntry>> {
  try {
    const res = await fetch(`${API_URL}/story/profile/stories`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
      signal,
    });
    return await envelope<StoryEntry>(res, "Couldn't save that story.");
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }
}
