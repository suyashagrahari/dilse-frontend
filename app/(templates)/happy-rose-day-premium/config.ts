import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-rose-day/config";

// Gallery card for the ✦ Premium twin of /happy-rose-day. Until this template has its
// own cover (Stage 5), it shows the $2 day's poster inside the gold premium
// frame. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-rose-day-premium",
  coverImage: templateMedia("happy-rose-day-premium", "cover-poster.webp"),
  title: "Rose Day ✦ Premium: The Bloom of Us",
  description:
    "Your photos become the petals of one rose. They hold a velvet bud to warm it, and on your song's chorus it opens, every petal a photo of you two. Then photos pressed under vellum, your letter, your voice, and a keepsake card.",
};
