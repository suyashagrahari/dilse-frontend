import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-propose-day/config";

// Gallery card for the ✦ Premium twin of /happy-propose-day. Until this template has its
// own cover (Stage 5), it shows the $2 day"s poster inside the gold premium
// frame. OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-propose-day-premium",
  title: "Propose Day ✦ Premium — Look Up",
  description:
    "A rooftop proposal at night: your nervous texts, a candle for every reason, a city of memory windows, then a drone show writes the question in the sky on your song's chorus — and they slide the ring on to say yes.",
};
