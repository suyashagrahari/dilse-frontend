// ─── Resolving template visibility during the server render ──────────────────
//
// The client store (`lib/templateVisibility.ts`) can only learn the real list
// after its fetch resolves, which is one render too late: whatever it guesses is
// what the visitor sees first, and a wrong guess is either a live template
// reading "Not available yet" or a held-back one on screen. This module gets the
// answer before the HTML is written, so there is nothing to guess.
//
// The result is handed to `TemplateVisibilityProvider`, which is what consumers
// read. See the note at the top of the client store for the full picture.

import { cache } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";

/**
 * The hidden slugs, or `null` if we could not find out.
 *
 * ── WHY `null` AND NOT AN EMPTY LIST ────────────────────────────────────────
 *
 * They are different facts and the caller treats them differently. An empty list
 * means "the server says nothing is hidden" and is worth seeding. `null` means
 * "we do not know", and the right response is to leave the client store alone so
 * it fetches for itself, rather than to assert a wrong answer with the authority
 * of a server render. A build running where the API is unreachable therefore
 * degrades to the old client-fetch behaviour instead of prerendering fifty pages
 * that claim every template is live.
 *
 * ── WHY IT IS CACHED TWICE ──────────────────────────────────────────────────
 *
 * `cache()` dedupes within one render — the `(app)` layout and a nested
 * `(templates)` layout both ask, and that should not be two requests. The
 * `revalidate` below dedupes across renders, and 60s matches the `max-age` the
 * endpoint sets for everyone else, so this adds no staleness that visitors were
 * not already getting. Admin toggles do not wait for it: the admin screen calls
 * `refreshTemplateVisibility()`, which bypasses this path entirely.
 */
export const getHiddenTemplatesServer = cache(async (): Promise<string[] | null> => {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/template-visibility`, {
      next: { revalidate: 60 },
      headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : undefined,
    });
    if (!res.ok) return null;
    const json = await res.json();
    const list = json?.data?.hidden;
    if (!Array.isArray(list)) return null;
    return list.filter((s: unknown): s is string => typeof s === "string");
  } catch {
    // Unreachable API, or a build with no network. Not knowing is a valid
    // outcome here — see above.
    return null;
  }
});
