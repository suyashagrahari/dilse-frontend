// The Premium collection — the real-app clones — on a page of its own, reached
// from the "Explore premium" card on /templates. Same server shell as the
// gallery so hidden templates never reach the markup.

import type { Metadata } from "next";
import { TemplateVisibilityProvider } from "@/components/TemplateVisibilityProvider";
import { getHiddenTemplatesServer } from "@/lib/templateVisibility.server";
import { getSeasonServer } from "@/lib/season.server";
import { getGalleryExcludeServer } from "@/lib/templateMeta.server";
import { SeasonProvider } from "@/hooks/useSeason";
import TemplatesPageClient from "../TemplatesPageClient";

export const metadata: Metadata = {
  title: "Premium Templates — Real-App Clones for Someone You Love | SubhSandesh",
  description:
    "The SubhSandesh Premium collection: Netflix, Instagram, App Store, YouTube, Amazon, recharge, caller-ID and arcade clones — made to fall in love. AI writes every word, full-screen themed letters, photos with notes.",
  alternates: { canonical: "/templates/premium" },
};

export default async function PremiumTemplatesPage() {
  const [hidden, season, galleryExclude] = await Promise.all([getHiddenTemplatesServer(), getSeasonServer(), getGalleryExcludeServer()]);
  return (
    <TemplateVisibilityProvider hidden={hidden}>
      <SeasonProvider season={season}>
        <TemplatesPageClient room="premium" galleryExclude={galleryExclude} />
      </SeasonProvider>
    </TemplateVisibilityProvider>
  );
}
