import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-teddy-day/config";

// Gallery card for the ✦ Premium twin of /happy-teddy-day. Until this template has its
// own cover (Stage 5), it shows the $2 day"s poster inside the gold premium
// frame. OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-teddy-day-premium",
  title: "Teddy Day ✦ Premium — Made With a Heart",
  description:
    "A teddy made by hand for them: open the parcel, give it a heart, watch it wake up, play hide-and-seek and tuck it in with your voice note.",
};
