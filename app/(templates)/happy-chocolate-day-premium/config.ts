import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-chocolate-day/config";

// Gallery card for the ✦ Premium twin of /happy-chocolate-day. The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable). OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-chocolate-day-premium",
  coverImage: templateMedia("happy-chocolate-day-premium", "cover-poster-v2.webp"),
  title: "Chocolate Day ✦ Premium: La Boîte",
  description:
    "A chocolatier's box made for them. They pull the ribbon, lift the lid on your song's chorus, and every bonbon inside is one of your photos; tap one to taste the memory. Then a cocoa-dusted heart, your letter on the menu card, your voice, and the lid to keep.",
};
