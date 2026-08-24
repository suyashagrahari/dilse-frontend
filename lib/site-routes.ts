/**
 * The single source of truth for which routes search engines should see.
 *
 * This file exists because the two facts below were previously encoded in
 * places that could not see each other:
 *
 *   1. `next.config.ts` knew which template routes are still "Coming Soon" and
 *      redirect elsewhere — but `app/sitemap.ts` did not, so the sitemap was
 *      advertising 10 URLs that answer 307. Google and Bing both file those
 *      under "Page with redirect — not indexed" and spend crawl budget
 *      rediscovering the same dead ends.
 *
 *   2. `TEMPLATE_SEO` (derived from `lib/seo-data.ts`) was the sitemap's only
 *      source of template URLs — but ~20 shipped, publicly reachable template
 *      pages were never added to it. They each have hand-written titles and
 *      descriptions, they return 200, and they were invisible to both engines
 *      because nothing linked them from the sitemap.
 *
 * Both lists live here now, and `npm run seo:check` diffs them against the
 * routes that actually exist on disk so the next template to ship shows up as
 * a failure instead of quietly never being indexed.
 */

/**
 * Template routes that exist on disk but are still gated as "Coming Soon", and
 * the live template each one redirects to. Consumed by `next.config.ts` to
 * build the redirects, and by `app/sitemap.ts` to exclude the sources.
 *
 * When a template goes live, delete its entry here — the redirect disappears
 * and the sitemap picks the URL up automatically.
 */
export const COMING_SOON_REDIRECTS: Record<string, string> = {
  // sorry → apology-dashboard
  "sorry-gf": "apology-dashboard",
  "sorry-friend": "apology-dashboard",
  // birthday → birthday-gf
  "birthday-bestfriend": "birthday-gf",
  "birthday-friend": "birthday-gf",
  "birthday-parents": "birthday-gf",
  // miss you → missyou-gf
  "missyou-bestfriend": "missyou-gf",
  // valentine (no live valentine yet) → love-gf
  "valentine-gf": "love-gf",
  "valentine-bestfriend": "love-gf",
  // anniversary (no live anniversary yet) → love-gf
  "anniversary-parents": "love-gf",
  "anniversary-gf": "love-gf",
};

export interface IndexablePage {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}

/**
 * Live, indexable pages that `TEMPLATE_SEO` does not cover.
 *
 * Every entry was confirmed to answer 200 with its own hand-written <title>.
 * Templates rank for intent queries ("court marriage certificate for
 * girlfriend"), so they carry template priority; the informational pages sit
 * lower because they exist to be found, not to compete.
 */
export const STANDALONE_INDEXABLE_PAGES: IndexablePage[] = [
  // ── Templates ────────────────────────────────────────────────────────────
  { path: "/apology-dashboard", priority: 0.8, changeFrequency: "monthly" },
  { path: "/court-marriage", priority: 0.8, changeFrequency: "monthly" },
  { path: "/challan", priority: 0.8, changeFrequency: "monthly" },
  { path: "/kundli-milan", priority: 0.8, changeFrequency: "monthly" },
  { path: "/nutrition", priority: 0.8, changeFrequency: "monthly" },
  { path: "/train-ticket", priority: 0.8, changeFrequency: "monthly" },
  { path: "/vending-machine", priority: 0.8, changeFrequency: "monthly" },
  { path: "/watch", priority: 0.8, changeFrequency: "monthly" },
  { path: "/recharge", priority: 0.8, changeFrequency: "monthly" },
  { path: "/product", priority: 0.8, changeFrequency: "monthly" },
  { path: "/profile-pro", priority: 0.8, changeFrequency: "monthly" },
  { path: "/hold-my-hand", priority: 0.8, changeFrequency: "monthly" },
  { path: "/call", priority: 0.8, changeFrequency: "monthly" },
  { path: "/catch", priority: 0.8, changeFrequency: "monthly" },
  { path: "/flags", priority: 0.8, changeFrequency: "monthly" },
  { path: "/app", priority: 0.8, changeFrequency: "monthly" },
  { path: "/legal-notice", priority: 0.8, changeFrequency: "monthly" },
  // ── Informational ────────────────────────────────────────────────────────
  { path: "/help", priority: 0.5, changeFrequency: "monthly" },
  { path: "/manifesto", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
];

/**
 * Routes that must stay out of the sitemap, with the reason. `seo:check` reads
 * this so an unclassified route is a failure rather than a silent omission —
 * the point is that every route on disk is a deliberate decision.
 */
export const NON_INDEXABLE_ROUTES: Record<string, string> = {
  "/profile": "private — per-user account area (also robots.txt Disallow)",
  "/favorites": "private — per-user saved templates (also robots.txt Disallow)",
  "/saves": "redirects (307)",
  "/auth/google-bridge": "OAuth plumbing, not a page",
  "/admin": "staff only — robots.txt Disallow (covers /admin/* children)",
  "/love": "generic fallback metadata, duplicates /love-gf",
};
