import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-rose-day/config";

// Gallery card for the ✦ Premium twin of /happy-rose-day. Until this template has its
// own cover (Stage 5), it shows the $2 day"s poster inside the gold premium
// frame. OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-rose-day-premium",
  title: "Rose Day ✦ Premium — The Glasshouse Rose",
  description:
    "A private glasshouse at dusk: wipe their name off the fogged door, pluck the thorns you got through together, and watch a garden bloom in a heart on your song's chorus — then a pressed-book letter and a rose sealed forever under glass.",
};
