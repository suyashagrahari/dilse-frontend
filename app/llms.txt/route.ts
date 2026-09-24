import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, TEMPLATE_SEO } from "@/lib/seo";
import { getArticles, getCategories } from "@/lib/strapi";
import { guideList } from "@/data/guide-registry";
import { stepCount } from "@/lib/guides";

// /llms.txt — a clean, markdown "map" of the site written for LLMs / answer
// engines (ChatGPT, Claude, Perplexity, Gemini). It gives them a fast, ad-free
// route to our most important content so we're easier to summarise and cite (AEO/GEO).
// Regenerated hourly (and on the Strapi publish webhook via the shared cache).
export const revalidate = 3600;

const clean = (s?: string | null) => (s || "").replace(/\s+/g, " ").trim();

export async function GET() {
  // Degrade gracefully — if the CMS is unreachable we still emit the static parts.
  const [articlesRes, categories] = await Promise.all([
    getArticles({ pageSize: 100 }).catch(() => ({ articles: [], pageCount: 0, total: 0 })),
    getCategories().catch(() => []),
  ]);
  const articles = articlesRes.articles;

  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push(
    `${SITE_NAME} (${SITE_URL}) is a free tool to create and share beautiful, ` +
      `personalized digital celebration pages — for birthdays, anniversaries, weddings, ` +
      `Valentine's Day, and Indian festivals like Holi, Eid and Diwali. Every creation ` +
      `becomes a shareable link with photos, music and a heartfelt message. Made in India; ` +
      `founded by Suyash Agrahari; operating as a registered sole proprietorship in Bengaluru since 4 March 2026.`
  );
  lines.push("");

  lines.push("## Main pages");
  lines.push(`- [Home](${SITE_URL}): Create a personalized celebration page in minutes — free.`);
  lines.push(`- [Templates](${SITE_URL}/templates): Browse every gift & celebration template.`);
  lines.push(`- [Blog](${SITE_URL}/blog): Guides and ideas for celebrations, gifts and Indian festivals.`);
  lines.push(`- [Product guides](${SITE_URL}/guides): Step-by-step walkthroughs for building each template.`);
  lines.push(`- [About](${SITE_URL}/about-us): The story and founder behind ${SITE_NAME}.`);
  lines.push(`- [Contact](${SITE_URL}/contact-us): Support, partnerships and product feedback.`);
  lines.push("");

  // Guides go above templates deliberately. A template page is a tool — an
  // answer engine has almost nothing to quote from it. A guide is the opposite:
  // named, ordered steps written in the product's own vocabulary, which is
  // exactly the shape a model can lift an answer from and attribute. These were
  // missing from this file entirely while being the most citable pages on the
  // site, so a question like "how do I add music to a wedding invite" had
  // nothing here to reach for.
  lines.push("## Product guides");
  for (const g of guideList) {
    const kind = g.video ? "video + written" : "written";
    lines.push(
      `- [${clean(g.title)}](${SITE_URL}/guides/${g.slug}): ${clean(g.summary)} (${stepCount(g)} steps, ${kind}, about ${clean(g.buildTime)} to build)`,
    );
  }
  lines.push("");

  lines.push("## Templates");
  for (const [slug, t] of Object.entries(TEMPLATE_SEO)) {
    lines.push(`- [${clean(t.title)}](${SITE_URL}/${slug}): ${clean(t.description)}`);
  }
  lines.push("");

  if (categories.length) {
    lines.push("## Blog categories");
    for (const c of categories) {
      lines.push(`- [${clean(c.name)}](${SITE_URL}/blog/category/${c.slug})`);
    }
    lines.push("");
  }

  if (articles.length) {
    lines.push("## Recent articles");
    for (const a of articles) {
      const desc = clean(a.excerpt);
      lines.push(`- [${clean(a.title)}](${SITE_URL}/blog/${a.slug})${desc ? `: ${desc}` : ""}`);
    }
    lines.push("");
    lines.push(`The complete, always-current list of all pages is in the sitemap: ${SITE_URL}/sitemap.xml`);
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
