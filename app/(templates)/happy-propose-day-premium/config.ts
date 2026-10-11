import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-propose-day/config";

// Gallery card for the ✦ Premium twin of /happy-propose-day ("The Little Proposal", premium v3).
// The cover is the bright v3 poster, cover-poster-v3*.webp, with @360w/@540w/@720w variants for coverSrcSet.
// CDN covers are cached immutable, so a new cover always gets a new filename.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-propose-day-premium",
  coverImage: templateMedia("happy-propose-day-premium", "cover-poster-v3.webp"),
  title: "Propose Day ✦ Premium — The Little Proposal",
  description:
    "A tiny, cute love story with a ring at the end: they knock on a little door, swipe your story cards, laugh at your rehearsal comic, find the ring in a gift box, hear your voice, and say yes as your song's chorus lands. Then they sign an \"Officially Taken\" certificate.",
};
