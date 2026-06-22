import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { REVALIDATE_SECRET, SITE_URL } from "@/lib/config";
import { submitToIndexNow } from "@/lib/indexnow";

/**
 * On-demand ISR endpoint hit by the Strapi webhook whenever a blog entry is
 * published / updated / unpublished. Revalidates the cached blog pages so the
 * change appears on the live site within seconds — without a redeploy.
 *
 * Strapi webhook URL: {SITE_URL}/api/revalidate?secret={REVALIDATE_SECRET}
 */
async function handle(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  // Pull the affected slug from the Strapi webhook payload when available so we
  // can target the exact post page in addition to the tagged list pages.
  let slug: string | undefined;
  try {
    const body = await req.json();
    slug = body?.entry?.slug || body?.model?.slug;
  } catch {
    /* GET / empty body — fall back to tag-wide revalidation */
  }

  // `articles` tag covers every Strapi fetch (list, detail, category, sitemap).
  // Next 16 requires a cache profile as the 2nd arg — "max" fully expires the tag.
  revalidateTag("articles", "max");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`, "page");

  // Instant indexing: ping IndexNow with the affected URLs so Bing/Yandex/etc.
  // crawl them within minutes (no-op on localhost / when no key is configured).
  const indexUrls = [`${SITE_URL}/blog`, ...(slug ? [`${SITE_URL}/blog/${slug}`] : [])];
  const indexNow = await submitToIndexNow(indexUrls);

  return NextResponse.json({ revalidated: true, slug: slug ?? null, indexNow, now: Date.now() });
}

export async function POST(req: NextRequest) {
  return handle(req);
}

// Allow a manual GET trigger for testing in the browser.
export async function GET(req: NextRequest) {
  return handle(req);
}
