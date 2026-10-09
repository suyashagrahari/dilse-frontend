import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-rose-day/config";

// Gallery card for the ✦ Premium twin of /happy-rose-day ("The Rose Garden", premium v3).
// The cover is the bright v3 poster, cover-poster-v3*.webp, with @360w/@540w/@720w variants for coverSrcSet.
// CDN covers are cached immutable, so a new cover always gets a new filename.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-rose-day-premium",
  coverImage: templateMedia("happy-rose-day-premium", "cover-poster-v3.webp"),
  title: "Rose Day ✦ Premium: The Rose Garden",
  description:
    "A little rose garden that grows for them: they tear open a seed packet with their name, water the sprout, pick its colour, play loves-me-loves-me-not, untie your letter, hear your voice, arrange your photos into a bouquet, and say yes as roses bloom on your song.",
};
