// ─── /halloween-offer — the Halloween drop ───────────────────────────────────
//
// Where the running Halloween strip, the blog card and the gallery teaser all
// lead. A full-bleed haunted night, the drop's templates (the season's
// sale.slugs) as gallery cards with their real (sale) prices, and a countdown
// to 31 October. Built like /valentine-wishlist: a server shell for metadata and the
// season, a client page for everything that moves.
//
// When the site is not in Halloween mode the page still renders — the
// templates are still worth showing — just without the sale and countdown.
// That is friendlier than bouncing a visitor who followed an old link.

import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { SeasonProvider } from "@/hooks/useSeason";
import { getSeasonServer } from "@/lib/season.server";
import { offerPercentOf } from "@/lib/season";
import HalloweenOfferClient from "./HalloweenOfferClient";
import { halloweenFaqs } from "./content";

// What the server writes is the same for every visitor (title, FAQ JSON-LD), so
// it names the percent the drop is offered at to whichever side wears it — see
// `offerPercentOf`. The page itself shows this visitor's own (useSeason).
const salePct = (s: Awaited<ReturnType<typeof getSeasonServer>>) => offerPercentOf(s, "halloween");

export async function generateMetadata(): Promise<Metadata> {
  const pct = salePct(await getSeasonServer());
  return buildMeta({
    title: pct
      ? `Halloween Drop — ${pct}% Off Spooky Love Letter Templates | SubhSandesh`
      : "Halloween Drop — Spooky Love Letter Templates | SubhSandesh",
    description: `Ask “Will you be my boo?” with a tiny haunted house or a boo-tiful night: cute-spooky Halloween love letter pages with your photos, music and letter.${pct ? ` ${pct}% off till 31 October.` : ""}`,
    alternates: { canonical: `${SITE_URL}/halloween-offer` },
    keywords: ["halloween love letter", "will you be my boo", "halloween gift for girlfriend", "halloween card online", "spooky love message", "halloween offer"],
  });
}

export default async function HalloweenOfferPage() {
  const season = await getSeasonServer();
  const pct = salePct(season);
  return (
    <SeasonProvider season={season}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Halloween Drop", url: `${SITE_URL}/halloween-offer` },
        ]}
      />
      <FAQJsonLd faqs={halloweenFaqs(pct).map((f) => ({ question: f.q, answer: f.a }))} />
      <HalloweenOfferClient />
    </SeasonProvider>
  );
}
