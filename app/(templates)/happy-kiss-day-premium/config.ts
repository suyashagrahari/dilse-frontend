import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-kiss-day/config";

// Gallery card for the ✦ Premium twin of /happy-kiss-day ("A Thousand Kisses").
// Until this template has its own cover (Stage 5), it shows the $2 day's poster
// inside the gold premium frame.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-kiss-day-premium",
  coverImage: templateMedia("happy-kiss-day-premium", "cover-poster.webp"),
  title: "Kiss Day ✦ Premium — A Thousand Kisses",
  description:
    "A perfumed envelope, a wax seal you warm, kisses you catch — then two thousand tiny kisses fly together into your photo on your song, a lipstick letter on a misty mirror, and a kiss-booth strip they stamp with their own kiss.",
  previewText: "a little something for you 💌",
};
