import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-valentines-day/config";

// Gallery card for the ✦ Premium twin of /happy-valentines-day. Until this template has its
// own cover (Stage 5), it shows the $2 day's poster inside the gold premium
// frame. OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-valentines-day-premium",
  title: `Valentine's Day ✦ Premium — Our Film`,
  description:
    `Your relationship as a film: a ticket at the door, a "previously on" week recap, a constellation of your stats, the big question in takes, and end credits with a poster.`,
};
