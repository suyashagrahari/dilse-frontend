import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-propose-day/config";

// Gallery card for the ✦ Premium twin of /happy-propose-day. The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable). OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-propose-day-premium",
  coverImage: templateMedia("happy-propose-day-premium", "cover-poster-v2.webp"),
  title: "Propose Day ✦ Premium — The Premiere",
  description:
    "Your love story, screened as a film: a ticket, a projector countdown, three acts cut from your photos with subtitles, a director's commentary, and the question as the final title card. On yes the screen opens up on your song's chorus and the credits roll.",
};
