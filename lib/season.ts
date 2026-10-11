// ─── Which seasonal campaign the site is wearing ─────────────────────────────
//
// A super admin flips the site between the Valentine wishlist, the Halloween
// drop and nothing at all from /admin/season. Everything seasonal — the running
// bar under the navbar, the blog cards, the gallery teaser, the critters on the
// home hero — reads the answer from here.
//
// One fetch of GET /season per page view (re-asked after a minute), held in a
// module store, the same pattern as hooks/usePromo.ts. The SSR pages hand the
// server's answer down through `SeasonProvider` so the first paint is already
// right; this store then corrects it if the admin flipped it since.
//
// ── WHY A FAILED FETCH MEANS "valentine" ────────────────────────────────────
//
// The server never errors on this route (it answers with its defaults on a DB
// failure), so a failure here means an API that predates it, or no network. In
// both cases the safe answer is the behaviour the site had before this existed:
// the Valentine promo, which still only shows while its own countdown runs.

import { API_URL, IS_NGROK } from "@/lib/config";

export type SeasonMode = "valentine" | "halloween" | "off";

export type Season = {
  mode: SeasonMode;
  sale: { enabled: boolean; percent: number; slugs: string[] };
};

export const HALLOWEEN_PATH = "/halloween-offer";
export const HALLOWEEN_SLUGS = ["happy-halloween", "happy-halloween-premium"] as const;
/** The drop ends at the last minute of 31 October, India time. */
export const HALLOWEEN_ENDS_AT = Date.parse("2026-10-31T23:59:59+05:30");
/** The template GIFs, served from the CDN. */
export const HALLOWEEN_GIF = (file: string) => `https://cdn.subhsandesh.in/gifts-media/templates/_halloween/${file}`;

/** What the client assumes when it cannot ask: the pre-season behaviour. */
export const SEASON_FALLBACK: Season = { mode: "valentine", sale: { enabled: false, percent: 0, slugs: [] } };

const MODES: readonly SeasonMode[] = ["valentine", "halloween", "off"];

/** Accepts both `{ success, data: {...} }` and a bare body. Null when it is not a season. */
export function parseSeason(json: unknown): Season | null {
  const root = json as { data?: unknown } | null;
  const d = (root && typeof root === "object" && root.data && typeof root.data === "object" ? root.data : root) as
    | { mode?: unknown; sale?: { enabled?: unknown; percent?: unknown; slugs?: unknown } }
    | null;
  if (!d || typeof d !== "object") return null;
  const mode = MODES.includes(d.mode as SeasonMode) ? (d.mode as SeasonMode) : null;
  if (!mode) return null;
  const pct = Math.round(Number(d.sale?.percent));
  const slugs = Array.isArray(d.sale?.slugs) ? d.sale!.slugs.filter((s): s is string => typeof s === "string") : [];
  return {
    mode,
    sale: {
      enabled: Boolean(d.sale?.enabled) && pct > 0,
      percent: Number.isFinite(pct) ? Math.min(Math.max(pct, 0), 90) : 0,
      slugs,
    },
  };
}

// ── The client store ────────────────────────────────────────────────────────
let season: Season | null = null;
let fetchedAt = 0;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeSeason(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const getSeasonSnapshot = (): Season | null => season;
export const getSeasonServerSnapshot = (): Season | null => null;

export function loadSeason(fresh = false): Promise<void> {
  if (inflight) return inflight;
  if (!fresh && fetchedAt && Date.now() - fetchedAt < 60_000) return Promise.resolve();
  inflight = (async () => {
    try {
      const res = await fetch(`${API_URL}/season`, {
        cache: fresh ? "no-store" : "default",
        headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : undefined,
      });
      const parsed = res.ok ? parseSeason(await res.json().catch(() => null)) : null;
      season = parsed ?? SEASON_FALLBACK;
    } catch {
      // Keep whatever we knew; with nothing known, fall back to pre-season.
      season = season ?? SEASON_FALLBACK;
    } finally {
      fetchedAt = Date.now();
      inflight = null;
      emit();
    }
  })();
  return inflight;
}

/** For the admin panel after it saves: adopt the server's answer at once. */
export function setSeason(next: Season) {
  season = next;
  fetchedAt = Date.now();
  emit();
}

// ── The running bar's per-session dismissal ─────────────────────────────────
//
// The root layout runs a one-line script before first paint that copies this
// key onto <html data-hw-bar-off>, so a bar dismissed earlier in the session is
// hidden by CSS before it can paint and then collapse (which would shift the
// page). The hook below is the React-side reading of the same key.
export const HW_BAR_DISMISS_KEY = "ss:hw-bar-off";

export function isHalloweenBarDismissed(): boolean {
  try {
    return sessionStorage.getItem(HW_BAR_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissHalloweenBar() {
  try {
    sessionStorage.setItem(HW_BAR_DISMISS_KEY, "1");
  } catch {
    /* storage blocked: it still hides for this page view */
  }
  document.documentElement.setAttribute("data-hw-bar-off", "");
  emit();
}
