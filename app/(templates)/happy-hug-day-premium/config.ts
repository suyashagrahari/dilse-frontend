import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-hug-day/config";

// Gallery card for the ✦ Premium twin of /happy-hug-day ("The Twenty-Second Hug").
// Until this template has its own cover (Stage 5), it shows the $2 day's poster
// inside the gold premium frame.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-hug-day-premium",
  coverImage: templateMedia("happy-hug-day-premium", "cover-poster.webp"),
  title: "Hug Day ✦ Premium — The Twenty-Second Hug",
  description:
    "They hold their thumb on your photo for twenty seconds while it blooms from black-and-white into colour, a heartbeat slows to yours and your song swells into the chorus. Then what your hugs feel like, your letter, your voice, and a hug coupon to tear off.",
  previewText: "come here. twenty seconds, that\u2019s all 🤍",
};
