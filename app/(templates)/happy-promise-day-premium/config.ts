import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-promise-day/config";

// Gallery card for the ✦ Premium twin of /happy-promise-day. Until this template has its
// own cover (Stage 5), it shows the $2 day's poster inside the gold premium
// frame. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-promise-day-premium",
  coverImage: templateMedia("happy-promise-day-premium", "cover-poster.webp"),
  title: "Promise Day ✦ Premium — The Red Thread",
  description:
    "The red thread of fate: they pull it through your photos to your hand, the knot tightens on your song’s drop and writes “I promise” in gold.",
};
