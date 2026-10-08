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
    "A rose grown under glass for one person: fog the door open, clear the thorns, catch a hidden sentence in falling petals, and watch a whole garden bloom on the chorus of your song.",
};
