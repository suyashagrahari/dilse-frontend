import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-teddy-day/config";

// Gallery card for the ✦ Premium twin of /happy-teddy-day ("The Teddy House", premium v3).
// The cover is the bright v3 poster, cover-poster-v3*.webp, with @360w/@540w/@720w variants for coverSrcSet.
// CDN covers are cached immutable, so a new cover always gets a new filename.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-teddy-day-premium",
  coverImage: templateMedia("happy-teddy-day-premium", "cover-poster-v3.webp"),
  title: "Teddy Day ✦ Premium — The Teddy House",
  description:
    "A cuddly teddy arrives in a box and moves into a little pastel house: they give him a heart to wake him up, name him, dress him up, squeeze him to hear your letter, feed him, tuck him in, and on your song's chorus teddies rain into a heart around your photo.",
  previewText: "special delivery: a cuddly teddy is waiting for you 🧸",
  bodyText: "Will you keep him forever?",
};
