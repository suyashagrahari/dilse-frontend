import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-propose-day/config";

// Gallery card for the ✦ Premium twin of /happy-propose-day. The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable). OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-propose-day-premium",
  coverImage: templateMedia("happy-propose-day-premium", "cover-poster-v2.webp"),
  title: "Propose Day ✦ Premium — The Little Proposal",
  description:
    "A tiny, cute love story with a ring at the end: they knock on a little door, swipe your story cards, laugh at your rehearsal comic, find the ring in a gift box, hear your voice, and say yes as your song's chorus lands. Then they sign an \"Officially Taken\" certificate.",
};
