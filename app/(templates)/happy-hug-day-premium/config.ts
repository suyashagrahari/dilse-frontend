import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-hug-day/config";

// Gallery card for the ✦ Premium twin of /happy-hug-day ("The Hug Passport", premium v3).
// The cover is the bright v3 poster, cover-poster-v3*.webp, with @360w/@540w/@720w variants for coverSrcSet.
// CDN covers are cached immutable, so a new cover always gets a new filename.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-hug-day-premium",
  coverImage: templateMedia("happy-hug-day-premium", "cover-poster-v3.webp"),
  title: "Hug Day ✦ Premium: The Hug Passport",
  description:
    "Their own Hug Passport: they collect every kind of hug (bear, back, twirl, pat-pat, long-distance), each stamped with one of your photos, then read your letter, hear your voice, redeem hug coupons and say yes as the last stamp lands on your song.",
  previewText: "come here, you. your hug passport is ready 🛂",
};
