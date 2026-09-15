// ─── The public feedback wall, client side ───────────────────────────────────
//
// Types and the one fetcher for `GET /api/feedback/public`. The endpoint is
// unauthenticated by design: this page has to work for somebody who has never
// signed in, which is most of the people it is for.
//
// ── WHAT THE SERVER DOES NOT SEND ───────────────────────────────────────────
//
// No email, no page URL, no IP, no admin notes, no user id — the projection
// there is a whitelist, and `pageUrl` above all is withheld because it links to
// somebody's private card. Nothing on this side should ever try to reconstruct
// any of it, and there is nothing here to reconstruct it from.

import { API_URL } from "@/lib/config";

export interface PublicFeedbackItem {
  id: string;
  /** First name only, or "" when what we held was not a usable name. */
  name: string;
  rating: number;
  /** "" when the writer included contact details, which the server strips. */
  comment: string;
  /** The template they made, e.g. "Raksha Bandhan". May be "". */
  template: string;
  createdAt: string;
}

export interface PublicFeedbackStats {
  total: number;
  /** One decimal place, already rounded by the server. */
  average: number;
  counts: Record<string, number>;
}

export interface PublicFeedbackPage {
  items: PublicFeedbackItem[];
  hasMore: boolean;
  /** How many rows match the current filter, for the "showing N" line. */
  matched: number;
  /** Always over ALL feedback, never the filtered slice. */
  stats: PublicFeedbackStats;
}

export type FeedbackSort = "recent" | "rating";

export interface FeedbackQuery {
  sort?: FeedbackSort;
  /** "all", or a single star as a string. */
  rating?: string;
  /** Only rows that actually say something. */
  words?: boolean;
  limit?: number;
  skip?: number;
}

export const EMPTY_PAGE: PublicFeedbackPage = {
  items: [],
  hasMore: false,
  matched: 0,
  stats: { total: 0, average: 0, counts: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
};

export function feedbackQueryString(q: FeedbackQuery): string {
  const p = new URLSearchParams();
  if (q.sort) p.set("sort", q.sort);
  if (q.rating && q.rating !== "all") p.set("rating", q.rating);
  if (q.words) p.set("words", "1");
  if (q.limit) p.set("limit", String(q.limit));
  if (q.skip) p.set("skip", String(q.skip));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * One page of feedback.
 *
 * Returns `EMPTY_PAGE` rather than throwing when the API is unreachable. This
 * page is a nicety — a wall of kind words — and an error screen in its place
 * is worse than an empty one. The caller renders the same empty state either
 * way, and the summary simply reads zero.
 */
export async function fetchPublicFeedback(
  q: FeedbackQuery = {},
  init?: RequestInit
): Promise<PublicFeedbackPage> {
  try {
    const res = await fetch(`${API_URL}/feedback/public${feedbackQueryString(q)}`, init);
    if (!res.ok) return EMPTY_PAGE;
    const json = (await res.json()) as { success?: boolean; data?: PublicFeedbackPage };
    if (!json?.success || !json.data) return EMPTY_PAGE;
    return json.data;
  } catch {
    return EMPTY_PAGE;
  }
}
