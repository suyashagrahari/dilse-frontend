// ─── /diwali-offer — the Diwali drop ─────────────────────────────────────────
//
// Where the Diwali strip, blog card and gallery teaser lead while the site is
// in "diwali" mode: a red-gold Diwali night (a lit haveli with diyas on every
// parapet, fireworks, rangoli, the Diwali GIFs), the drop's templates as
// gallery cards with their real (sale) prices, and a countdown to Diwali night
// — Sunday 8 November 2026, 11:59 pm IST. A server shell for metadata and the
// season; the client page (../_festival-offer) for everything that moves.
//
// Outside diwali mode the page still renders — the card is still worth
// showing — just without the sale and countdown.

import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { SeasonProvider } from "@/hooks/useSeason";
import { getSeasonServer } from "@/lib/season.server";
import { DIWALI_PATH, offerPercentOf } from "@/lib/season";
import FestivalOfferClient from "../_festival-offer/FestivalOfferClient";
import { festivalFaqs } from "../_festival-offer/content";

// Server-written, so the same for every visitor: the percent the drop is offered
// at to whichever side wears it (`offerPercentOf`); the page shows this visitor's own.
export async function generateMetadata(): Promise<Metadata> {
  const pct = offerPercentOf(await getSeasonServer(), "diwali");
  return buildMeta({
    title: pct
      ? `Diwali Drop — ${pct}% Off Happy Diwali Wishes Online | SubhSandesh`
      : "Diwali Drop — Happy Diwali Wishes Card Online | SubhSandesh",
    description: `Send a Diwali wish they light up themselves — diyas, rangoli, crackers they can burst, with your photos, music and words.${pct ? ` ${pct}% off till Diwali night, 8 November.` : ""}`,
    alternates: { canonical: `${SITE_URL}${DIWALI_PATH}` },
    keywords: [
      "happy diwali wishes online",
      "diwali greeting card online",
      "diwali wishes for girlfriend",
      "diwali card with photo",
      "deepavali wishes",
      "diwali offer",
    ],
  });
}

export default async function DiwaliOfferPage() {
  const season = await getSeasonServer();
  const pct = offerPercentOf(season, "diwali");
  return (
    <SeasonProvider season={season}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Diwali Drop", url: `${SITE_URL}${DIWALI_PATH}` },
        ]}
      />
      <FAQJsonLd faqs={festivalFaqs("diwali", pct).map((f) => ({ question: f.q, answer: f.a }))} />
      <FestivalOfferClient kind="diwali" />
    </SeasonProvider>
  );
}
