import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-hug-day/config";

// Gallery card for the ✦ Premium twin of /happy-hug-day, v3 "The Hug Passport". The cover is still the v2 poster
// (cover-poster-v2*.webp, cached immutable on the CDN) until a v3 cover is uploaded. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-hug-day-premium",
  coverImage: templateMedia("happy-hug-day-premium", "cover-poster-v2.webp"),
  title: "Hug Day ✦ Premium: The Hug Passport",
  description:
    "Their own Hug Passport: they collect every kind of hug (bear, back, twirl, pat-pat, long-distance), each stamped with one of your photos, then read your letter, hear your voice, redeem hug coupons and say yes as the last stamp lands on your song.",
  previewText: "come here, you. your hug passport is ready 🛂",
};
