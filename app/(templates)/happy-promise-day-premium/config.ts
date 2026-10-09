import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-promise-day/config";

// Gallery card for the ✦ Premium twin of /happy-promise-day ("The Pinky Promise Club", premium v3).
// The cover is the bright v3 poster, cover-poster-v3*.webp, with @360w/@540w/@720w variants for coverSrcSet.
// CDN covers are cached immutable, so a new cover always gets a new filename.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-promise-day-premium",
  coverImage: templateMedia("happy-promise-day-premium", "cover-poster-v3.webp"),
  title: "Promise Day ✦ Premium — The Pinky Promise Club",
  description:
    "A club with exactly two members: they hook your pinky, pull your promises from a jar of paper stars, sign the club rules, string a bracelet and open your diary. On your song's chorus the love lock clicks shut and every promise floats up as a paper lantern.",
  previewText: "pinky promise? 🤙",
};
