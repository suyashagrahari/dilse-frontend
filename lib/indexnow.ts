/**
 * IndexNow — instant search-engine indexing.
 *
 * When a blog post is published/updated, we ping IndexNow so participating
 * engines (Bing, Yandex, Seznam, Naver, and others sharing the protocol) crawl
 * the URL within minutes instead of waiting to discover it via the sitemap.
 * api.indexnow.org fans the submission out to all participating engines.
 *
 * Setup: a key file lives at `${SITE_URL}/${INDEXNOW_KEY}.txt` (public/) and must
 * contain exactly the key — that proves we own the host.
 *
 * Google does not use IndexNow; it relies on the sitemap (auto-updated here) +
 * Search Console. See DEPLOY-STRAPI-EC2.md for the one-time GSC sitemap submit.
 */
import { SITE_URL } from "@/lib/config";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "";

function isPublicHttps(url: string): boolean {
  return /^https:\/\//.test(url) && !url.includes("localhost") && !url.includes("127.0.0.1");
}

export async function submitToIndexNow(urls: string[]): Promise<{ ok: boolean; status?: number; reason?: string }> {
  const list = urls.filter(Boolean);
  if (!list.length) return { ok: false, reason: "no-urls" };
  if (!INDEXNOW_KEY) return { ok: false, reason: "no-key" };
  // IndexNow only accepts real, verifiable public hosts — skip on localhost/dev.
  if (!isPublicHttps(SITE_URL)) return { ok: false, reason: "non-public-host" };

  const host = new URL(SITE_URL).host;
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: list,
      }),
    });
    // 200 = accepted, 202 = accepted/validation pending. Both are success.
    return { ok: res.status === 200 || res.status === 202, status: res.status };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "fetch-failed" };
  }
}
