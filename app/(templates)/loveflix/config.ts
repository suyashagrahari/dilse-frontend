import { Tv, Users, LayoutGrid, Play, Clapperboard } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "loveflix",
  type: "love",
  category: "gf",
  title: "LoveFlix",
  description:
    "A streaming service with exactly one show on it, and they're the lead. Browse the catalogue of your relationship, then press play on a season of your moments.",
  coverImage: templateMedia("loveflix", "cover-red.webp"),
  emoji: "🎬",
  color: "from-amber-500 to-neutral-800",
  previewText: "new episode. one profile. it's yours 🎬",
  bodyText:
    "Who's watching, a Top 10 of reasons, a season of your moments, and a letter waiting in the corner.",
  bgGradient: "from-neutral-900 via-neutral-800 to-neutral-900",
  tabs: [
    { id: "show", icon: Tv, label: "The Show" },
    { id: "profiles", icon: Users, label: "Profiles" },
    { id: "rows", icon: LayoutGrid, label: "Catalogue" },
    { id: "episode", icon: Play, label: "Episode" },
    { id: "credits", icon: Clapperboard, label: "Credits" },
  ],
  navActiveColor: "text-amber-500",
  navActiveBg: "bg-amber-500/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "One show. One profile. Yours.",
      ctaText: "Press play",
      floatingEmojis: ["🎬", "🍿", "✨", "📺", "💛"],
    },
    letter: {
      headerEmoji: "🎬",
      title: "The Finale",
      greeting: "However you got here,",
      decorEmojis: ["🍿", "📺", "✨"],
    },
    final: {
      headerEmoji: "🏆",
      title: "Renewed for another season",
      subtitle: "your path, your ending",
      wishes: [
        "Every route landed in the same place 🎬",
        "There was never a wrong choice 💛",
        "Next episode in 5… ✨",
      ],
      closingEmoji: "🎬",
      closingSubtext: "SubhSandesh",
    },
  },
};
