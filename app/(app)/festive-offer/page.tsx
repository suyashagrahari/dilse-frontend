// ─── /festive-offer — the Navratri & Diwali drop ─────────────────────────────
//
// Where the running festive strip, the blog card and the gallery teaser all
// lead. A full-bleed festival night, the drop's templates (the festive drop's
// slugs) as gallery cards with their real (sale) prices, and a countdown to
// Diwali night — Sunday 8 November 2026, 11:59 pm IST. Built like
// /halloween-offer: a server shell for metadata and the season, a client page
// for everything that moves.
//
// When the site is not in festive mode the page still renders — the templates
// are still worth showing — just without the sale and countdown.

import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { SeasonProvider } from "@/hooks/useSeason";
import { getSeasonServer } from "@/lib/season.server";
import { livePercentOf } from "@/lib/season";
import FestiveOfferClient from "./FestiveOfferClient";
import { festiveFaqs } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  const pct = livePercentOf(await getSeasonServer(), "festive");
  return buildMeta({
    title: pct
      ? `Navratri & Diwali Drop — ${pct}% Off Dandiya Invitation & Diwali Wishes | SubhSandesh`
      : "Navratri & Diwali Drop — Dandiya Partner Invitation & Diwali Wishes | SubhSandesh",
    description: `Ask “Will you be my Dandiya partner?” or send a Diwali wish they light up themselves — festive pages with your photos, music and words.${pct ? ` ${pct}% off till Diwali night, 8 November.` : ""}`,
    alternates: { canonical: `${SITE_URL}/festive-offer` },
    keywords: [
      "dandiya partner invitation",
      "be my dandiya partner",
      "navratri invitation online",
      "happy diwali wishes online",
      "diwali greeting card for girlfriend",
      "diwali offer",
      "navratri offer",
    ],
  });
}

export default async function FestiveOfferPage() {
  const season = await getSeasonServer();
  const pct = livePercentOf(season, "festive");
  return (
    <SeasonProvider season={season}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Navratri & Diwali Drop", url: `${SITE_URL}/festive-offer` },
        ]}
      />
      <FAQJsonLd faqs={festiveFaqs(pct).map((f) => ({ question: f.q, answer: f.a }))} />
      <FestiveOfferClient />
    </SeasonProvider>
  );
}
