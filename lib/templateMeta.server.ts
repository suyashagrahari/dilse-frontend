// ─── Server half of lib/templateMeta.ts: the gallery exclusions ──────────────
//
// The main gallery drops the super admin's "Templates page" exclusions
// (/admin/places). Resolved in the page's server shell and handed to the
// client, so a just-excluded template is not painted and then pulled away
// while the client's own /template-meta fetch is in flight.
//
// `null` = could not find out; the client then waits for its own fetch.
// Same caching as getHiddenTemplatesServer: 60s, purged by the admin save.

import { cache } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { SITE_CONFIG_TAG } from "@/lib/siteCache";

export const getGalleryExcludeServer = cache(async (): Promise<string[] | null> => {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/template-meta`, {
      next: { revalidate: 60, tags: [SITE_CONFIG_TAG] },
      headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : undefined,
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json.data) return null;
    // Parsed here, not with templateMeta's parseCollection: that module is
    // "use client", and its exports are client references on the server.
    const items = json.data.collections?.["gallery-exclude"]?.items;
    if (!Array.isArray(items)) return [];
    return items
      .map((i: unknown) => (i && typeof i === "object" ? (i as { slug?: unknown }).slug : undefined))
      .filter((s: unknown): s is string => typeof s === "string" && s.length > 0)
      .map((s: string) => s.toLowerCase());
  } catch {
    return null;
  }
});
