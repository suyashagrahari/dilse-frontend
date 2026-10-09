import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-teddy-day/config";

// Gallery card for the ✦ Premium twin of /happy-teddy-day. The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable). OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-teddy-day-premium",
  coverImage: templateMedia("happy-teddy-day-premium", "cover-poster-v2.webp"),
  title: "Teddy Day ✦ Premium: Adoption Papers",
  description:
    "A teddy arrives with his adoption file: your photos as his new family, care labels that are secretly love notes, your letter and your voice. They sign the certificate, and on your song's chorus the gold seal presses and ADOPTED is stamped on it.",
};
