import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-rose-day/config";

// Gallery card for the ✦ Premium twin of /happy-rose-day, v3 "The Rose Garden". The cover is still the v2 poster
// (cover-poster-v2*.webp, cached immutable on the CDN) until a v3 cover is uploaded. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-rose-day-premium",
  coverImage: templateMedia("happy-rose-day-premium", "cover-poster-v2.webp"),
  title: "Rose Day ✦ Premium: The Rose Garden",
  description:
    "A little rose garden that grows for them: they tear open a seed packet with their name, water the sprout, pick its colour, play loves-me-loves-me-not, untie your letter, hear your voice, arrange your photos into a bouquet, and say yes as roses bloom on your song.",
};
