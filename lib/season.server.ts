// ─── Resolving the season during the server render ───────────────────────────
//
// Same idea as lib/templateVisibility.server.ts: learn the answer before the
// HTML is written, so the running bar and the seasonal cards are in the first
// paint instead of popping in (and pushing the page down) after a client fetch.
//
// ── WHY THE CALLER PICKS `revalidate` ───────────────────────────────────────
//
// A route takes the lowest revalidate of anything it fetches. The home page and
// the gallery already regenerate every minute, so 60s costs nothing there. The
// blog regenerates hourly (~870 pages); a 60s fetch would quietly drag all of it
// down to every minute. Blog pages pass 3600 instead and let the client store
// correct a stale answer — which only differs within an hour of a mode switch.
//
// `null` means "could not find out", and the client store then asks for itself.

import { cache } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { parseSeason, type Season } from "@/lib/season";

async function fetchSeason(revalidate: number): Promise<Season | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/season`, {
      next: { revalidate },
      headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : undefined,
    });
    if (!res.ok) return null;
    return parseSeason(await res.json());
  } catch {
    return null;
  }
}

export const getSeasonServer = cache((revalidate: number = 60) => fetchSeason(revalidate));
