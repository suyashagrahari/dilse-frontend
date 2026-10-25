// ─── /wedding-offer — the wedding season drop ───────────────────────────────
//
// Where the wedding strip, blog card, gallery teaser, home hero button and the
// /wedding hub's ribbon lead while the site is in "wedding" mode: the drop's
// invitations as gallery cards with their real (sale) prices, under a daylight
// wedding scene, with a countdown to 31 December 2026, 11:59 pm IST. A server
// shell for metadata, JSON-LD and the season; the client page for the rest.
//
// Outside wedding mode the page still renders — the designs are still worth
// showing — just without the sale and the countdown. Same pattern as
// /dandiya-offer and /diwali-offer.

import type { Metadata } from "next";
import { preconnect, preload } from "react-dom";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { SeasonProvider } from "@/hooks/useSeason";
import { getSeasonServer } from "@/lib/season.server";
import { getDropFreeServer } from "@/lib/pricing.server";
import { MEDIA_ORIGIN } from "@/lib/templateMedia";
import { offerPercentOf, WEDDING_PATH } from "@/lib/season";
import { WEDDING_ART, WEDDING_LUX } from "@/components/promo/weddingTheme";
import WeddingOfferClient from "./WeddingOfferClient";
import { weddingFaqs } from "./content";

// Server-written, so the same for every visitor: the percent the drop is offered
// at to whichever side wears it (`offerPercentOf`); the page shows this visitor's own.
export async function generateMetadata(): Promise<Metadata> {
  const season = await getSeasonServer();
  const free = await getDropFreeServer(season, "wedding");
  const pct = free ? 0 : offerPercentOf(season, "wedding");
  const title = free
    ? "Wedding Season Drop — Free Digital Wedding Invitations | SubhSandesh"
    : pct
    ? `Wedding Season Drop — ${pct}% Off Digital Wedding Invitations | SubhSandesh`
    : "Wedding Season Drop — Digital Wedding Invitations with RSVP | SubhSandesh";
  const description = `Digital Indian wedding invitations that open like a celebration — palace doors, peacock gardens, lotus temples and chapels, Haldi to reception on one link with RSVP per function.${free ? " Free till 31 December." : pct ? ` ${pct}% off till 31 December.` : ""}`;
  const og = WEDDING_ART("hub/og-wedding.jpg");
  return buildMeta({
    title,
    description,
    alternates: { canonical: `${SITE_URL}${WEDDING_PATH}` },
    keywords: [
      "wedding invitation offer",
      "digital wedding invitation sale",
      "indian wedding e-invite",
      "wedding invitation with rsvp",
      "whatsapp wedding invitation",
      "shaadi card online",
      "wedding season offer",
    ],
    openGraph: {
      title: pct ? `The wedding season drop — ${pct}% off` : "The wedding season drop",
      description,
      url: `${SITE_URL}${WEDDING_PATH}`,
      images: [{ url: og, width: 1200, height: 630, alt: "SubhSandesh digital wedding invitations" }],
    },
    twitter: { images: [og] },
  });
}

export default async function WeddingOfferPage() {
  const season = await getSeasonServer();
  const free = await getDropFreeServer(season, "wedding");
  const pct = free ? 0 : offerPercentOf(season, "wedding");
  // The couple is the hero's one first-paint image; each device preloads only the file it shows.
  preconnect(MEDIA_ORIGIN);
  preload(WEDDING_LUX("c-wedding-600.webp"), { as: "image", fetchPriority: "high", media: "(max-width: 767px)" });
  preload(WEDDING_LUX("c-wedding-800.webp"), { as: "image", fetchPriority: "high", media: "(min-width: 768px)" });
  return (
    <SeasonProvider season={season}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Wedding Invitations", url: `${SITE_URL}/wedding` },
          { name: "Wedding Season Drop", url: `${SITE_URL}${WEDDING_PATH}` },
        ]}
      />
      <FAQJsonLd faqs={weddingFaqs(pct, false, free).map((f) => ({ question: f.q, answer: f.a }))} />
      <WeddingOfferClient />
    </SeasonProvider>
  );
}
