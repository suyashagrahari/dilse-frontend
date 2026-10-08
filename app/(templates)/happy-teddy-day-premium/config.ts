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
  title: "Teddy Day ✦ Premium — Made With a Heart",
  description:
    "An unfinished teddy arrives by parcel: they stuff it, sew your heart inside and it wakes up as your song drops. Then a torchlight letter, star-lamp photos and a tuck-in.",
};
