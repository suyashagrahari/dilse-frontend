import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-hug-day/config";

// Gallery card for the ✦ Premium twin of /happy-hug-day. Until this template has its
// own cover (Stage 5), it shows the $2 day"s poster inside the gold premium
// frame. OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-hug-day-premium",
  title: "Hug Day ✦ Premium — Hold Me for 20 Seconds",
  description:
    "A snowy-window Hug Day film: two figures walk to each other, you hold the screen for a twenty-second hug, and a blanket fort keeps your voice note warm.",
};
