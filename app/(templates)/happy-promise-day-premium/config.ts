import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-promise-day/config";

// Gallery card for the ✦ Premium twin of /happy-promise-day. The cover is still the v2 poster
// (cover-poster-v2*.webp); a bright v3 cover is logged in KIT-REQUESTS.md. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-promise-day-premium",
  coverImage: templateMedia("happy-promise-day-premium", "cover-poster-v2.webp"),
  title: "Promise Day ✦ Premium — The Pinky Promise Club",
  description:
    "A club with exactly two members: they hook your pinky, pull your promises from a jar of paper stars, sign the club rules, string a bracelet and open your diary. On your song's chorus the love lock clicks shut and every promise floats up as a paper lantern.",
  previewText: "pinky promise? 🤙",
};
