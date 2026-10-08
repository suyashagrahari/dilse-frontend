import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-kiss-day/config";

// Gallery card for the ✦ Premium twin of /happy-kiss-day. Until this template has its
// own cover (Stage 5), it shows the $2 day"s poster inside the gold premium
// frame. OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-kiss-day-premium",
  title: "Kiss Day ✦ Premium — A Thousand Kisses",
  description:
    "Catch a thousand kisses into a jar until they lock into a mosaic of you two, read a letter in the mirror, and step into a photo booth.",
};
