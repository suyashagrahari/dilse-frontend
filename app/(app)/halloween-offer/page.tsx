// ─── /halloween-offer — the Halloween drop ───────────────────────────────────
//
// Where the running Halloween strip, the blog card and the gallery teaser all
// lead. The two Halloween templates as big showcase cards with their real
// (sale) prices, a countdown to 31 October and a little haunted night around
// them. Built like /valentine-wishlist: a server shell for metadata and the
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
import HalloweenOfferClient from "./HalloweenOfferClient";
import { halloweenFaqs } from "./content";

const salePct = (s: Awaited<ReturnType<typeof getSeasonServer>>) =>
  s?.mode === "halloween" && s.sale.enabled ? s.sale.percent : 0;

export async function generateMetadata(): Promise<Metadata> {
  const pct = salePct(await getSeasonServer());
  return buildMeta({
    title: pct
      ? `Halloween Drop — ${pct}% Off Spooky Love Letter Templates | SubhSandesh`
      : "Halloween Drop — Spooky Love Letter Templates | SubhSandesh",
    description: `Ask “Will you be my boo?” with a tiny haunted house or a boo-tiful night: two cute-spooky Halloween love letter pages with your photos, music and letter.${pct ? ` ${pct}% off till 31 October.` : ""}`,
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
