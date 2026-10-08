import type { TemplatePageConfig } from "@/types/template-config";
import { config as base } from "../happy-halloween/config";

// Gallery card for the ✦ Premium twin of /happy-halloween. Until this template has its
// own cover (Stage 5), it shows the $2 day"s poster inside the gold premium
// frame. OWNED BY THIS DAY"S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-halloween-premium",
  title: "Halloween ✦ Premium — The Midnight Manor",
  description:
    "A haunted manor at midnight: light candles of memories, ask the spirit board, brew a spell, hear the spirit radio and answer the midnight question.",
};
