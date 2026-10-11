// ─── Which seasonal campaign the site is wearing ─────────────────────────────
//
// A super admin flips the site between the Valentine wishlist, a seasonal
// DROP (Halloween, Navratri Dandiya or Diwali) and nothing at all from
// /admin/season. Each drop season has its own templates, sale and end date
// (`DROPS` below); only the active mode's drop is ever shown. Everything seasonal — the running
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

/** The seasons that have a drop: their own templates, sale, strip and offer page. */
export type DropId = "halloween" | "dandiya" | "diwali";
export const DROP_IDS: readonly DropId[] = ["halloween", "dandiya", "diwali"];
export type SeasonMode = "valentine" | DropId | "off";
/** The two Hindu-festival drops, each with its own red theme (components/promo/festivalTheme.ts). */
export type FestivalId = "dandiya" | "diwali";
export const FESTIVAL_IDS: readonly FestivalId[] = ["dandiya", "diwali"];
export const isFestivalMode = (m: unknown): m is FestivalId => m === "dandiya" || m === "diwali";

export type DropSale = { enabled: boolean; percent: number; slugs: string[] };

export type Season = {
  mode: SeasonMode;
  /** The ACTIVE mode's drop sale (for "valentine"/"off" the server still sends Halloween's). */
  sale: DropSale;
  /** Every drop's settings — servers from before per-season drops leave this out. */
  drops?: Partial<Record<DropId, DropSale>>;
};

export const HALLOWEEN_PATH = "/halloween-offer";
export const HALLOWEEN_SLUGS = ["happy-halloween", "happy-halloween-premium"] as const;
/** The drop ends at the last minute of 31 October, India time. */
export const HALLOWEEN_ENDS_AT = Date.parse("2026-10-31T23:59:59+05:30");
/** The template GIFs, served from the CDN. */
export const HALLOWEEN_GIF = (file: string) => `https://cdn.subhsandesh.in/gifts-media/templates/_halloween/${file}`;

/** The Navratri & Diwali GIFs, served from the CDN (see .template-factory/festive/MEDIA.md). */
export const FESTIVE_GIF = (file: string) => `https://cdn.subhsandesh.in/gifts-media/templates/_festive/${file}`;

export const DANDIYA_PATH = "/dandiya-offer";
export const DANDIYA_SLUGS = ["dandiya-partner"] as const;
/** Navratri 2026 ends on Dussehra, Tuesday 20 October: the drop ends at its last minute, India time. */
export const DANDIYA_ENDS_AT = Date.parse("2026-10-20T23:59:59+05:30");

export const DIWALI_PATH = "/diwali-offer";
export const DIWALI_SLUGS = ["happy-diwali"] as const;
/** Diwali night — Sunday 8 November 2026 — at the last minute, India time. */
export const DIWALI_ENDS_AT = Date.parse("2026-11-08T23:59:59+05:30");

export const FESTIVAL_PERCENT_DEFAULT = 30;

/** Per-drop facts the client owns (the server owns slugs and sale). */
export const DROPS: Record<DropId, { label: string; path: string; slugs: readonly string[]; endsAt: number; endsLabel: string }> = {
  halloween: { label: "Halloween drop", path: HALLOWEEN_PATH, slugs: HALLOWEEN_SLUGS, endsAt: HALLOWEEN_ENDS_AT, endsLabel: "31 Oct" },
  dandiya: { label: "Navratri Dandiya drop", path: DANDIYA_PATH, slugs: DANDIYA_SLUGS, endsAt: DANDIYA_ENDS_AT, endsLabel: "Dussehra, 20 Oct" },
  diwali: { label: "Diwali drop", path: DIWALI_PATH, slugs: DIWALI_SLUGS, endsAt: DIWALI_ENDS_AT, endsLabel: "Diwali night, 8 Nov" },
};

/**
 * Names and art for drop templates that may not be in the registry yet (the
 * festival templates ship on their own branches). Anything that shows a drop
 * card uses the registry entry when present and this otherwise.
 */
export const DROP_TEMPLATE_FALLBACK: Record<string, { title: string; emoji: string; blurb: string; cover: string }> = {
  "dandiya-partner": {
    title: "Be My Dandiya Partner",
    emoji: "🥢",
    blurb: "Invite them to Garba nights — a dancing, twirling Navratri invitation they answer with a yes.",
    cover: FESTIVE_GIF("dandiyapartyner.webp"),
  },
  "happy-diwali": {
    title: "Happy Diwali",
    emoji: "🪔",
    blurb: "Light up their Diwali — diyas, rangoli and fireworks around your wishes and photos.",
    cover: FESTIVE_GIF("happy-diwali-diya.webp"),
  },
};

export function isDropMode(m: unknown): m is DropId {
  return typeof m === "string" && (DROP_IDS as readonly string[]).includes(m);
}

/**
 * One drop's sale as the server last described it: `drops[id]` when sent, else
 * `sale` while that drop is the active mode, else null (unknown).
 */
export function dropSaleOf(s: Season | null | undefined, id: DropId): DropSale | null {
  if (!s) return null;
  return s.drops?.[id] ?? (s.mode === id ? s.sale : null);
}

/** The percent off a drop is selling at right now — 0 unless it is the active mode with its sale on. */
export function livePercentOf(s: Season | null | undefined, id: DropId): number {
  return s?.mode === id && s.sale.enabled ? s.sale.percent : 0;
}

/** What the client assumes when it cannot ask: the pre-season behaviour. */
export const SEASON_FALLBACK: Season = { mode: "valentine", sale: { enabled: false, percent: 0, slugs: [] } };

const MODES: readonly SeasonMode[] = ["valentine", ...DROP_IDS, "off"];

/**
 * The slugs in the ACTIVE drop: `sale.slugs` while the mode is a drop season
 * (halloween, dandiya, diwali), nothing otherwise. A drop template is reachable (its
 * builder opens, it publishes) even when /admin/templates hides it from the
 * gallery; it still stays out of every gallery listing. Mirrors `dropSlugs` in
 * server/src/config/seasonSale.ts, which enforces the same rule on publish.
 */
export function dropSlugsOf(s: Season | null | undefined): string[] {
  if (!s || !isDropMode(s.mode)) return [];
  return s.sale.slugs.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
}

function parseSale(raw: { enabled?: unknown; percent?: unknown; slugs?: unknown } | undefined): DropSale {
  const pct = Math.round(Number(raw?.percent));
  const slugs = Array.isArray(raw?.slugs) ? raw!.slugs.filter((s): s is string => typeof s === "string") : [];
  return {
    enabled: Boolean(raw?.enabled) && pct > 0,
    percent: Number.isFinite(pct) ? Math.min(Math.max(pct, 0), 90) : 0,
    slugs,
  };
}

/** Accepts both `{ success, data: {...} }` and a bare body. Null when it is not a season. */
export function parseSeason(json: unknown): Season | null {
  const root = json as { data?: unknown } | null;
  const d = (root && typeof root === "object" && root.data && typeof root.data === "object" ? root.data : root) as
    | { mode?: unknown; sale?: { enabled?: unknown; percent?: unknown; slugs?: unknown } }
    | null;
  if (!d || typeof d !== "object") return null;
  // Round 1's merged "festive" season (never on prod) is the Diwali season now — the server migrates it the same way.
  const raw = d.mode === "festive" ? "diwali" : d.mode;
  const mode = MODES.includes(raw as SeasonMode) ? (raw as SeasonMode) : null;
  if (!mode) return null;
  const out: Season = { mode, sale: parseSale(d.sale) };
  const rawDrops = (d as { drops?: unknown }).drops;
  if (rawDrops && typeof rawDrops === "object") {
    const drops: Partial<Record<DropId, DropSale>> = {};
    for (const id of DROP_IDS) {
      const all = rawDrops as Record<string, unknown>;
      const r = all[id] ?? (id === "diwali" ? all.festive : undefined);
      if (r && typeof r === "object") drops[id] = parseSale(r as Parameters<typeof parseSale>[0]);
    }
    out.drops = drops;
  }
  return out;
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
