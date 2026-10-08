import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-valentines-day/config";

// Gallery card for the ✦ Premium twin of /happy-valentines-day. Until this template has its
// own cover (Stage 5), it shows the $2 day's poster inside the gold premium
// frame. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-valentines-day-premium",
  coverImage: templateMedia("happy-valentines-day-premium", "cover-poster.webp"),
  title: `Valentine's Day ✦ Premium — Our Film`,
  description:
    `Your love story as a film starring them: a ticket and a film-leader countdown, your photos cut to your song's chorus, a three-part letter, the question shot in black and white, and end credits with a movie poster.`,
};
