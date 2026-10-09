import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-kiss-day/config";

// Gallery card for the ✦ Premium twin of /happy-kiss-day ("Mwah Booth", premium v3).
// The cover is the bright v3 poster, cover-poster-v3*.webp, with @360w/@540w/@720w variants for coverSrcSet.
// CDN covers are cached immutable, so a new cover always gets a new filename.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-kiss-day-premium",
  coverImage: templateMedia("happy-kiss-day-premium", "cover-poster-v3.webp"),
  title: "Kiss Day ✦ Premium — Mwah Booth",
  description:
    "A cute kissing booth: they kiss your photo, flip a kiss menu, decorate a photo strip of you two, catch flying kisses and say yes on your song's chorus, when a heart of lipstick prints fills the screen.",
  previewText: "a little something for you 💌",
};
