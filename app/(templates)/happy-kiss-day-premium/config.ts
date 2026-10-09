import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-kiss-day/config";

// Gallery card for the ✦ Premium twin of /happy-kiss-day ("Mwah Booth").
// The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable).
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-kiss-day-premium",
  coverImage: templateMedia("happy-kiss-day-premium", "cover-poster-v2.webp"),
  title: "Kiss Day ✦ Premium — Mwah Booth",
  description:
    "A cute kissing booth: they kiss your photo, flip a kiss menu, decorate a photo strip of you two, catch flying kisses and say yes on your song's chorus, when a heart of lipstick prints fills the screen.",
  previewText: "a little something for you 💌",
};
