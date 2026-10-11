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
//
// ── INDIA AND ABROAD: WHY A SPLIT SEASON COMES BACK `pending` ───────────────
//
// GET /season answers for the side of the split the REQUEST comes from, and
// this request comes from the Next server, not the visitor — and the page it
// renders is cached and served to every country anyway. So when the answer
// depends on the country (`split`), this render must not paint either side:
// it returns the season marked `pending` (lib/season.ts), which `useSeason`
// reads as "not known yet" until the browser's own fetch lands. The parts that
// are the same for everybody — both sides' modes, every drop, the union of
// reachable drop templates — are still used, to reserve space and to let the
// builder gate decide on its first render.
//
// Forwarding the visitor's address to the API instead was rejected: the API
// trusts only nginx's X-Forwarded-For (see server/src/services/geo.service.ts),
// and these pages are statically regenerated, so there is no per-visitor
// render to forward it from.
//
// A pending season also preloads /season, so the browser's request starts
// with the HTML instead of after hydration.

import { cache } from "react";
import { preload } from "react-dom";
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
    const s = parseSeason(await res.json());
    if (!s || !s.split) return s;
    return { ...s, pending: true };
  } catch {
    return null;
  }
}

const fetchSeasonOnce = cache((revalidate: number) => fetchSeason(revalidate));

export async function getSeasonServer(revalidate: number = 60): Promise<Season | null> {
  const s = await fetchSeasonOnce(revalidate);
  // Start the browser's own /season request with the HTML. Matches the store's
  // fetch (CORS, no credentials), so the browser reuses the preloaded response.
  if (s?.pending && API_URL && !IS_NGROK) preload(`${API_URL}/season`, { as: "fetch", crossOrigin: "anonymous" });
  return s;
}
