import { Flame, Grid3x3, BookOpen, Mail, Share2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "streak",
  type: "love",
  category: "gf",
  title: "Streak",
  description:
    "Two people, one tap a day. The streak grows, every check-in keeps a word, and after a hundred days you have a diary neither of you meant to write. Miss a day and it pauses — it never breaks.",
  coverImage:
    "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/streak/cover.jpg",
  emoji: "🕯️",
  color: "from-amber-500 to-orange-700",
  previewText: "day 84. both of us 🕯️",
  bodyText:
    "Hold to check in. One word, one light. Whoever's first can leave a sealed line — it opens when the other one checks in.",
  bgGradient: "from-amber-50 via-orange-50 to-white",
  tabs: [
    { id: "pair", icon: Flame, label: "The Two of You" },
    { id: "archive", icon: Grid3x3, label: "Archive" },
    { id: "poem", icon: BookOpen, label: "The Poem" },
    { id: "letters", icon: Mail, label: "Letters" },
    { id: "share", icon: Share2, label: "Share" },
  ],
  navActiveColor: "text-amber-700",
  navActiveBg: "bg-amber-700/10",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "One tap each. That's the whole thing.",
      ctaText: "Start the streak",
      floatingEmojis: ["🕯️", "✧", "·", "🕯️", "✧"],
    },
    letter: {
      headerEmoji: "✉️",
      title: "The Letters",
      greeting: "For the days that come,",
      decorEmojis: ["✉️", "✧", "🕯️"],
    },
    final: {
      headerEmoji: "🕯️",
      title: "One light a day",
      subtitle: "and it keeps going",
      wishes: [
        "Miss a day and it pauses. It never breaks 🕯️",
        "Every word you both wrote is kept ✧",
        "Whoever's first can leave a line ✉️",
      ],
      closingEmoji: "🕯️",
      closingSubtext: "SubhSandesh",
    },
  },
};
