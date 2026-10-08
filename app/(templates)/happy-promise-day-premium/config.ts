import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-promise-day/config";

// Gallery card for the ✦ Premium twin of /happy-promise-day. Until this template has its
// own cover (Stage 5), it shows the $2 day"s poster inside the gold premium
// frame. OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-promise-day-premium",
  title: "Promise Day ✦ Premium — The Red Thread",
  description:
    "A red thread that ties two people together: pull it across the distance, knot each promise, and float a sealed vial down the river.",
};
