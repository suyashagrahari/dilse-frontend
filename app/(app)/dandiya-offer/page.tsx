// ─── /dandiya-offer — the Navratri Dandiya drop ──────────────────────────────
//
// Where the Dandiya strip, blog card and gallery teaser lead while the site is
// in "dandiya" mode: a kumkum-red garba night (mandap, garba circle, dhol,
// bandhanwar torans, the dancing couple, mirror sparkle), the drop's templates
// as gallery cards with their real (sale) prices, and a countdown to Dussehra —
// Tuesday 20 October 2026, 11:59 pm IST. A server shell for metadata and the
// season; the client page (../_festival-offer) for everything that moves.
//
// Outside dandiya mode the page still renders — the invitation is still worth
// showing — just without the sale and countdown.

import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { SeasonProvider } from "@/hooks/useSeason";
import { getSeasonServer } from "@/lib/season.server";
import { DANDIYA_PATH, offerPercentOf } from "@/lib/season";
import FestivalOfferClient from "../_festival-offer/FestivalOfferClient";
import { festivalFaqs } from "../_festival-offer/content";

// Server-written, so the same for every visitor: the percent the drop is offered
// at to whichever side wears it (`offerPercentOf`); the page shows this visitor's own.
export async function generateMetadata(): Promise<Metadata> {
  const pct = offerPercentOf(await getSeasonServer(), "dandiya");
  return buildMeta({
    title: pct
      ? `Navratri Dandiya Drop — ${pct}% Off the Be My Dandiya Partner Invitation | SubhSandesh`
      : "Navratri Dandiya Drop — Be My Dandiya Partner Invitation Online | SubhSandesh",
    description: `Ask “Will you be my Dandiya partner?” with a twirling, dancing Navratri invitation — your photos, your song, your words, answered with a tap.${pct ? ` ${pct}% off till Dussehra, 20 October.` : ""}`,
    alternates: { canonical: `${SITE_URL}${DANDIYA_PATH}` },
    keywords: [
      "dandiya partner invitation",
      "be my dandiya partner",
      "navratri invitation online",
      "garba night invitation",
      "dandiya invitation card",
      "navratri offer",
    ],
  });
}

export default async function DandiyaOfferPage() {
  const season = await getSeasonServer();
  const pct = offerPercentOf(season, "dandiya");
  return (
    <SeasonProvider season={season}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Navratri Dandiya Drop", url: `${SITE_URL}${DANDIYA_PATH}` },
        ]}
      />
      <FAQJsonLd faqs={festivalFaqs("dandiya", pct).map((f) => ({ question: f.q, answer: f.a }))} />
      <FestivalOfferClient kind="dandiya" />
    </SeasonProvider>
  );
}
