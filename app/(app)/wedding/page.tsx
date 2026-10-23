// ─── /wedding — the wedding hub ──────────────────────────────────────────────
//
// The bottom nav's Wedding tab (it replaced Manifesto, which moved to the More
// drawer and the desktop Company menu). Every wedding-related template in one
// place — Hindu/Indian, Christian, reception, court marriage, kundli — on the
// same cards the gallery uses, with the gallery's visibility and order rules.
//
// Like /templates, this server shell resolves which templates are hidden
// BEFORE the HTML goes out, so a held-back design is never in the first paint
// or the crawled markup. The FAQ is written into FAQPage JSON-LD from the same
// list the page prints.

import type { Metadata } from "next";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { TemplateVisibilityProvider } from "@/components/TemplateVisibilityProvider";
import { getHiddenTemplatesServer } from "@/lib/templateVisibility.server";
import { getSeasonServer } from "@/lib/season.server";
import { SeasonProvider } from "@/hooks/useSeason";
import WeddingHubClient from "./WeddingHubClient";
import { WEDDING_FAQS } from "./content";

const TITLE = "Wedding Invitations Online — Digital Shaadi Cards with RSVP | SubhSandesh";
const DESCRIPTION =
  "Digital wedding invitations that open like a celebration: palace doors, lotus temples, Mughal gardens and Christian chapels. Every function on one link, RSVP per function, music, photos, Hindi & English. Personalise with AI and share on WhatsApp.";
const OG_IMAGE = `${SITE_URL}/wedding-v3/hub/og-wedding.jpg`;

export const metadata: Metadata = buildMeta({
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/wedding` },
  keywords: [
    "wedding invitation online",
    "digital wedding invitation",
    "e-invite for wedding",
    "shaadi card online",
    "whatsapp wedding invitation",
    "wedding invitation with rsvp",
    "christian wedding invitation",
    "reception invitation",
    "court marriage invitation",
    "hindi wedding card",
  ],
  openGraph: {
    title: "Wedding Invitations that open like a celebration",
    description: DESCRIPTION,
    url: `${SITE_URL}/wedding`,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "SubhSandesh digital wedding invitations" }],
  },
  twitter: { images: [OG_IMAGE] },
});

export default async function WeddingHubPage() {
  const [hidden, season] = await Promise.all([getHiddenTemplatesServer(), getSeasonServer()]);
  return (
    <TemplateVisibilityProvider hidden={hidden}>
      <SeasonProvider season={season}>
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: SITE_URL },
            { name: "Wedding Invitations", url: `${SITE_URL}/wedding` },
          ]}
        />
        <FAQJsonLd faqs={WEDDING_FAQS.map((f) => ({ question: f.q, answer: f.a }))} />
        <WeddingHubClient />
      </SeasonProvider>
    </TemplateVisibilityProvider>
  );
}
