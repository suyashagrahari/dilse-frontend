import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-halloween/config";

// Gallery card for the ✦ Premium twin of /happy-halloween ("The Midnight Manor").
// Until this template has its own cover (Stage 5), it shows the $2 day's poster
// inside the gold premium frame.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-halloween-premium",
  title: "Halloween ✦ Premium — The Midnight Manor",
  description:
    "A sealed invitation to a moonlit haunted manor: memory candles, portraits that wake up, a spirit board that spells their name, your voice on the spirit radio, and a midnight question on the twelfth bell of your song.",
  previewText: "a sealed invitation to the Midnight Manor 🕯️",
  bodyText: "Break the seal.",
};
