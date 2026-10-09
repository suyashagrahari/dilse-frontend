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
  title: `Valentine's Day ✦ Premium — Us, Wrapped`,
  description:
    `Your year in love as a Wrapped-style story: your song, your top 3 memories, the stats only you kept, reasons over your photos, a letter, and your days together slamming onto the screen on the chorus. Ends on a card they can save.`,
};
