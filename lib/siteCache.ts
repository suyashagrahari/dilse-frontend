// ─── Making an admin's change show on the very next visit ───────────────────
//
// The home page, the gallery, the offer pages and every template route are
// prerendered and served from Next's cache, with the season and the hidden
// template list baked into the HTML. That cache refreshes under
// stale-while-revalidate: once its minute is up, the FIRST visitor still gets
// the old page and only triggers the rebuild. So after a season switch the
// gallery showed last season's teaser and cards once, and the right ones only
// on a reload.
//
// Both server fetches carry SITE_CONFIG_TAG. After a save, the admin screens
// call `purgeSiteCache`, which asks /api/revalidate/site to expire the tag, so
// every page built from it is rebuilt on its next request instead of served
// stale. The 60s revalidate stays as the backstop for anything else.

import { API_URL } from "@/lib/config";

export const SITE_CONFIG_TAG = "site-config";

/** Expire the cached pages after an admin save. Never throws; a failure only means the old 60s wait. */
export async function purgeSiteCache(): Promise<boolean> {
  if (typeof window === "undefined" || !API_URL) return false;
  let token: string | null = null;
  try {
    token = localStorage.getItem("gifts_access_token");
  } catch {
    /* storage blocked */
  }
  if (!token) return false;
  try {
    const res = await fetch("/api/revalidate/site", {
      method: "POST",
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
