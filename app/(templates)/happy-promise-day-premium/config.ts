import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-promise-day/config";

// Gallery card for the ✦ Premium twin of /happy-promise-day. The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable). OWNED BY THIS DAY'S BUILDER.
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-promise-day-premium",
  coverImage: templateMedia("happy-promise-day-premium", "cover-poster-v2.webp"),
  title: "Promise Day ✦ Premium — Signed, Sealed, Promised",
  description:
    "Your promises, drawn up as a deed on ivory paper: a typewriter types each one beside your photos, you both sign, and on your song's drop the wax seal presses in your initials.",
  previewText: "a sealed promise for you ✍️",
};
