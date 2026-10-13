// ─── Is a drop free, for the server render of the offer pages ───────────────
//
// The offer pages write their title and FAQ JSON-LD on the server, the same
// for every visitor. When the super admin has made the drop free, those must
// not keep promising "49% off". Tagged like the season fetch, so an admin
// pricing save expires it at once (lib/siteCache.ts). `false` when unknown:
// the percent copy is the safe default.

import { cache } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { SITE_CONFIG_TAG } from "@/lib/siteCache";
import { dropSlugsFor, isDropFree, type DropId, type Season } from "@/lib/season";

const getPricesServer = cache(async (): Promise<Record<string, { isFree: boolean }> | null> => {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/payment/pricing`, {
      next: { revalidate: 60, tags: [SITE_CONFIG_TAG] },
      headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : undefined,
    });
    if (!res.ok) return null;
    const data = (await res.json())?.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const out: Record<string, { isFree: boolean }> = {};
    for (const [slug, row] of Object.entries(data as Record<string, { isFree?: unknown }>)) {
      if (row && typeof row === "object") out[slug] = { isFree: Boolean(row.isFree) };
    }
    return out;
  } catch {
    return null;
  }
});

export async function getDropFreeServer(season: Season | null, id: DropId): Promise<boolean> {
  const prices = await getPricesServer();
  return !!prices && isDropFree(prices, dropSlugsFor(season, id));
}
