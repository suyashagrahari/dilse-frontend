import { API_URL } from "@/lib/config";
import type { WallData, WallSort } from "./types";

/**
 * The Wall's server-side read.
 *
 * ── WHY revalidate: 60 ──────────────────────────────────────────────────────
 *
 * A creator can take their entry down at any moment, and that has to actually
 * take effect. Sixty seconds is the ceiling the consent promise is written
 * against, so it is the cache window here and there is no longer-lived layer
 * above it.
 *
 * ── WHY THIS NEVER THROWS ───────────────────────────────────────────────────
 *
 * The Wall is a marketing page. An API blip should render the empty state — a
 * browsable catalogue of templates — rather than a 500. The empty state is a
 * genuinely good page, which is what makes this a safe default rather than a
 * way of hiding a broken backend.
 */
export async function fetchWall(opts: {
  slug?: string;
  sort?: WallSort;
  limit?: number;
} = {}): Promise<WallData> {
  const params = new URLSearchParams();
  if (opts.slug) params.set("slug", opts.slug);
  if (opts.sort) params.set("sort", opts.sort);
  if (opts.limit) params.set("limit", String(opts.limit));

  const qs = params.toString();
  const url = `${API_URL}/wall${qs ? `?${qs}` : ""}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return empty();
    const json = (await res.json()) as { success?: boolean; data?: WallData };
    if (!json?.success || !json.data) return empty();

    return {
      entries: Array.isArray(json.data.entries) ? json.data.entries : [],
      facets: Array.isArray(json.data.facets) ? json.data.facets : [],
      // Anything that is not a real number becomes null, and null hides the
      // headline entirely. There is no branch here that invents a figure.
      totalCreations:
        typeof json.data.totalCreations === "number" ? json.data.totalCreations : null,
      sharedCount: typeof json.data.sharedCount === "number" ? json.data.sharedCount : 0,
      hasMore: Boolean(json.data.hasMore),
      renderedAt: Date.now(),
    };
  } catch {
    return empty();
  }
}

/**
 * A fresh empty result. A function rather than a shared constant because
 * `renderedAt` has to be read per call — a module-level object would freeze the
 * clock at import time and bucket every date against whenever the process
 * started.
 */
function empty(): WallData {
  return {
    entries: [],
    facets: [],
    totalCreations: null,
    sharedCount: 0,
    hasMore: false,
    renderedAt: Date.now(),
  };
}
