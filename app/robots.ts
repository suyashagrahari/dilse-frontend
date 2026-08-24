import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
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
