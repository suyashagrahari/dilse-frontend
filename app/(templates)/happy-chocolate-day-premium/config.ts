import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-chocolate-day/config";

// Gallery card for the ✦ Premium twin of /happy-chocolate-day ("The Sweetheart Chocolate Factory", v3). The cover is
// still the v2 poster (cover-poster-v2*.webp; CDN covers are cached immutable, so a v3 cover needs a new name and the
// integration pass makes it). OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-chocolate-day-premium",
  coverImage: templateMedia("happy-chocolate-day-premium", "cover-poster-v2.webp"),
  title: "Chocolate Day ✦ Premium: The Sweetheart Chocolate Factory",
  description:
    "A candy-pastel chocolate factory made just for her: a golden ticket to scratch, a box she fills with six reasons, her photo inside a giant chocolate bar, your photos dipped like strawberries, a catch game, a heart that melts into your letter, your voice, and a chocolate fountain that lands on the chorus of your song.",
};
