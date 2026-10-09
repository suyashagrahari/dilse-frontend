import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-hug-day/config";

// Gallery card for the ✦ Premium twin of /happy-hug-day ("The Twenty-Second Hug").
// The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable).
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-hug-day-premium",
  coverImage: templateMedia("happy-hug-day-premium", "cover-poster-v2.webp"),
  title: "Hug Day ✦ Premium — The Twenty-Second Hug",
  description:
    "They hold their thumb on your photo for twenty seconds while it blooms from black-and-white into colour, a heartbeat slows to yours and your song swells into the chorus. Then what your hugs feel like, your letter, your voice, and a hug coupon to tear off.",
  previewText: "come here. twenty seconds, that\u2019s all 🤍",
};
