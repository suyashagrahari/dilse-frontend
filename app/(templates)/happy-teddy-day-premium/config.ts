import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-teddy-day/config";

// Gallery card for the ✦ Premium twin of /happy-teddy-day. Until this template has its
// own cover (Stage 5), it shows the $2 day's poster inside the gold premium
// frame. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-teddy-day-premium",
  coverImage: templateMedia("happy-teddy-day-premium", "cover-poster.webp"),
  title: "Teddy Day ✦ Premium: Adoption Papers",
  description:
    "A teddy arrives with his adoption file: your photos as his new family, care labels that are secretly love notes, your letter and your voice. They sign the certificate, and on your song's chorus the gold seal presses and ADOPTED is stamped on it.",
};
