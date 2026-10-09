import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-valentines-day/config";

// Gallery card for the ✦ Premium twin of /happy-valentines-day ("Be My Valentine Carnival", premium v3).
// The cover is the bright v3 poster, cover-poster-v3*.webp, with @360w/@540w/@720w variants for coverSrcSet.
// CDN covers are cached immutable, so a new cover always gets a new filename.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-valentines-day-premium",
  coverImage: templateMedia("happy-valentines-day-premium", "cover-poster-v3.webp"),
  title: `Valentine's Day ✦ Premium — Be My Valentine Carnival`,
  description:
    `A pastel funfair made just for her: she tears her ticket, pops balloons that spell your line, breaks a love meter, wins your photos from a gacha machine, rides a Ferris wheel of you two, reads your letter and hears your voice. Her YES lands on the chorus of your song with heart fireworks.`,
};
