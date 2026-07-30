/**
 * Path normalisation for analytics.
 *
 * Two problems this solves:
 *
 * 1. CARDINALITY. Share pages are `/{username}/{shareId}` where shareId is a
 *    `randomUUID()` (see server/src/models/*Page.ts). Sent raw, GA4 gets one
 *    row per share link ever created — unbounded. Once GA4's row limit is hit
 *    it buckets excess into "(other)", which silently destroys every other
 *    dimension in the same report. So unbounded segments are collapsed to
 *    placeholders BEFORE anything is sent.
 *
 * 2. REWRITES. middleware.ts rewrites `alice.subhsandesh.in/{shareId}` to the
 *    internal route `/alice/{shareId}`. `usePathname()` returns the rewritten
 *    path, so the username leaks into the reported path even though the user
 *    never saw it. We normalise from `window.location` (the browser's truth)
 *    and drop the username entirely — it is per-user, and therefore also
 *    unbounded.
 *
 * Design note: this deliberately does NOT consult a list of known template
 * slugs. `middleware.ts:20` keeps such a list and it has already gone stale
 * (see docs/analytics/FINDINGS.md). Instead we collapse only what is *known* to
 * be unbounded and pass everything else through verbatim. A new template
 * therefore appears correctly in reports the day it ships, with no edit here.
 */

/** `randomUUID()` output — the exact shape of every shareId in the system. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SHARE_ID = ":shareId";

export function isShareId(segment: string): boolean {
  return UUID_RE.test(segment);
}

/**
 * True when this path is a recipient-facing published page rather than a
 * creator-facing app route. Drives the `visitor_type` user property, which
 * every funnel report depends on — recipients would otherwise be counted as
 * customers who never converted (docs/analytics/RISKS.md B1).
 */
export function isSharePath(pathname: string): boolean {
  return pathname.split("/").filter(Boolean).some(isShareId);
}

/**
 * Collapse a browser pathname into a bounded, reportable path.
 *
 *   /                                         → /
 *   /holi                                     → /holi          (bounded set)
 *   /550e8400-e29b-41d4-a716-446655440000     → /share/:shareId
 *   /alice/550e8400-...                       → /share/:shareId (username dropped)
 *   /blog/how-to-say-sorry                    → /blog/:slug
 *   /blog/category/festivals                  → /blog/category/:category
 *   /u/alice                                  → /u/:username
 */
export function normalizePath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return "/";

  // Any path containing a shareId is a share page. Report them all as one row:
  // the username is unbounded and the shareId is the thing we're collapsing.
  if (segments.some(isShareId)) return `/share/${SHARE_ID}`;

  // Blog: `/blog/category/{category}` is bounded, `/blog/{slug}` is not.
  if (segments[0] === "blog") {
    if (segments.length === 1) return "/blog";
    if (segments[1] === "category") {
      return segments.length > 2 ? "/blog/category/:category" : "/blog/category";
    }
    return "/blog/:slug";
  }

  // Public profile pages — one per user, so unbounded.
  if (segments[0] === "u") {
    return segments.length > 1 ? "/u/:username" : "/u";
  }

  // Everything else is a bounded app route or template slug. Pass through so
  // new templates need no change here.
  return `/${segments.join("/")}`;
}

/**
 * Placeholder title used instead of a share page's real <title>.
 *
 * getSharePageMeta (lib/seo.ts:130) builds share titles as
 *   `${emoji} ${label} for ${recipientName} from ${senderName}`
 * so document.title on every published page contains TWO people's real names.
 * Sending that as `page_title` would ship personal names of users *and* of
 * recipients who never signed up to anything, into a third-party analytics
 * property — and it would show up in plain sight in the Pages report. The path is
 * already normalised to /share/:shareId, so a per-page title adds nothing for
 * reporting anyway.
 */
const SHARE_PAGE_TITLE = "Shared celebration page";

/**
 * The values GA4 should receive for a page view.
 *
 * `page_location` keeps the full untouched URL so the subdomain host survives
 * (it identifies which creator's page a recipient landed on), while `page_path`
 * is the normalised low-cardinality version used for reporting.
 */
export function describeLocation(): {
  page_path: string;
  page_location: string;
  page_title: string;
} {
  const pathname = window.location.pathname;
  const share = isSharePath(pathname);

  return {
    page_path: normalizePath(pathname),
    page_location: window.location.href,
    page_title: share ? SHARE_PAGE_TITLE : document.title,
  };
}
