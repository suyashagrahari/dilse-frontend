import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";
import { config as base } from "../happy-halloween/config";

// Gallery card for the ✦ Premium twin of /happy-halloween ("Boo-tiful Night", premium v3).
// The cover is the v2 poster
// (cover-poster-v2*.webp: a new name, since CDN covers are cached immutable).
export const config: TemplatePageConfig = {
  ...base,
  slug: "happy-halloween-premium",
  coverImage: templateMedia("happy-halloween-premium", "cover-poster-v2.webp"),
  title: "Halloween ✦ Premium — Boo-tiful Night",
  description:
    "Cute-spooky and very romantic: a ghost pops out of a mailbox with your letter, candies hide sweet dares, ghosts hide your photos, you brew a love potion, and “will you be my boo?” lands on your song as bats make a heart around your photo.",
  previewText: "boo! a little ghost has a letter for you 👻",
  bodyText: "Will you be my boo?",
};
