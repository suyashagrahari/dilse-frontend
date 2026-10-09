import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-kiss-day/config";

// Gallery card for the ✦ Premium twin of /happy-kiss-day ("Photo Booth").
// Until this template has its own cover (Stage 5), it shows the $2 day's poster
// inside the gold premium frame.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-kiss-day-premium",
  coverImage: templateMedia("happy-kiss-day-premium", "cover-poster.webp"),
  title: "Kiss Day ✦ Premium — Photo Booth",
  description:
    "A vintage photo booth behind a red curtain: four flashes, and a strip of your photos drops out on your song's chorus. Your letter prints on a booth receipt, and they kiss the screen to put their kiss on the strip.",
  previewText: "a little something for you 💌",
};
