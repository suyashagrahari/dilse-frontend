import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-hug-day/config";

// Gallery card for the ✦ Premium twin of /happy-hug-day ("Hold Me for 20 Seconds").
// Until this template has its own cover (Stage 5), it shows the $2 day's poster
// inside the gold premium frame.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-hug-day-premium",
  title: "Hug Day ✦ Premium — Hold Me for 20 Seconds",
  description:
    "A twenty-second hug through the phone: wipe a frosted window, close the distance, then hold with both thumbs while two heat shapes melt into one and a heartbeat slows to theirs. Mittens for bad days, a hoodie letter, a blanket fort, a hug back.",
  previewText: "someone needs 20 seconds of you 🤍",
};
