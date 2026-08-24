import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Wildcard DNS means EVERY hostname under the root domain serves the whole
  // site — randomjunk123.subhsandesh.in answers 200 for every path, with a
  // full copy of sitemap.xml and this robots.txt. Bing had already discovered
  // four such hosts and was holding 3.7K URLs for a 934-URL site.
  //
  // middleware.ts sets X-Robots-Tag: noindex on subdomain pages, but robots.txt
  // and sitemap.xml are excluded from its matcher, so they shipped the
  // permissive rules below on every hostname.
  //
  // Nothing is lost by locking subdomains down: every page they serve also
  // lives on the apex (a profile at {user}.subhsandesh.in/ is the same page as
  // subhsandesh.in/u/{user}), so this consolidates ranking signals rather than
  // removing them. Scoped to hosts that are provably subdomains of the
  // canonical host — an unexpected internal Host header must never be able to
  // turn production's robots.txt into Disallow: /.
  const hostHeader = await headers();
  const hostname = (hostHeader.get("x-forwarded-host") || hostHeader.get("host") || "")
    .split(":")[0]
    .toLowerCase();
  const canonicalHost = new URL(SITE_URL).host.split(":")[0].toLowerCase();

  if (hostname && canonicalHost && hostname.endsWith(`.${canonicalHost}`)) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  // Private/utility paths kept out of the index. `/api/og` is explicitly allowed
  // (more specific than `/api/`) because social + Google crawlers fetch OG images.
  // `/admin` is guarded only by a client-side role check (see the note in
  // middleware.ts), so the shell renders before it redirects — crawlable
  // unless we say otherwise. `/saves` answers 307 and `/auth/` is OAuth
  // plumbing; neither is a page anyone should land on from a search result.
  const disallow = ["/api/", "/profile", "/favorites", "/admin", "/saves", "/auth/"];
  const allow = ["/", "/api/og"];

  // AI / answer-engine crawlers — explicitly allowed so blog content is eligible
  // for citation in ChatGPT, Claude, Perplexity, Google AI Overviews, etc. (GEO/AEO).
  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-Web",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
    "Amazonbot",
    "CCBot",
  ];

  return {
    rules: [
      { userAgent: "*", allow, disallow },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
