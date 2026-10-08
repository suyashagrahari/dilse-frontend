import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-chocolate-day/config";

// Gallery card for the ✦ Premium twin of /happy-chocolate-day. Until this template has its
// own cover (Stage 5), it shows the $2 day's poster inside the gold premium
// frame. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-chocolate-day-premium",
  coverImage: templateMedia("happy-chocolate-day-premium", "cover-poster.webp"),
  title: "Chocolate Day ✦ Premium — The Midnight Chocolatier",
  description:
    "A chocolate shop opens at midnight for them: they pour a heart, smash it as your song drops, taste truffles of reasons, find a golden ticket and tie the box.",
};
