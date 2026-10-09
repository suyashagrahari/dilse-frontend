import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-halloween/config";

// Gallery card for the ✦ Premium twin of /happy-halloween ("A Night at the Manor").
// The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable).
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-halloween-premium",
  coverImage: templateMedia("happy-halloween-premium", "cover-poster-v2.webp"),
  title: "Halloween ✦ Premium — A Night at the Manor",
  description:
    "Cute-spooky, never scary: they drag a torch through a dark hall to find your photos as gilt portraits, a spirit board spells their name, three tarot cards tell your story, and the last portrait in the dark winks on the drop of your song.",
  previewText: "trick or treat? the manor is waiting 🎃",
  bodyText: "Treat, obviously.",
};
