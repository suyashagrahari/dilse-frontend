import { Rewind, Hash, ListOrdered, Sparkles, Share2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "rewind",
  type: "love",
  category: "gf",
  title: "Rewind",
  description:
    "Your year, as a story you tap through. Every number is worked out from one date — and it ends on the verdict: which couple you actually are.",
  coverImage: templateMedia("rewind", "cover-poster.webp"),
  emoji: "⏮️",
  color: "from-fuchsia-500 to-indigo-600",
  previewText: "847 days. we ran the numbers ⏮️",
  bodyText:
    "Twelve full-screen slides, hard colour cuts, one huge stat at a time. Hold to pause and screenshot the archetype.",
  bgGradient: "from-fuchsia-50 via-indigo-50 to-white",
  tabs: [
    { id: "date", icon: Rewind, label: "The Date" },
    { id: "numbers", icon: Hash, label: "Numbers" },
    { id: "top", icon: ListOrdered, label: "Top 5" },
    { id: "archetype", icon: Sparkles, label: "Archetype" },
    { id: "share", icon: Share2, label: "Share" },
  ],
  navActiveColor: "text-fuchsia-600",
  navActiveBg: "bg-fuchsia-600/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "It was a year. Let's talk about it.",
      ctaText: "Start the rewind",
      floatingEmojis: ["⏮️", "✨", "💥", "💗", "🎞️"],
    },
    letter: {
      headerEmoji: "🎞️",
      title: "The Year, In Full",
      greeting: "Everything we counted,",
      decorEmojis: ["⏮️", "✨", "💥"],
    },
    final: {
      headerEmoji: "✨",
      title: "That's the year",
      subtitle: "verdict delivered",
      wishes: [
        "Not one of these numbers was typed in ⏮️",
        "We worked all of it out from one date 💥",
        "Same time next year ✨",
      ],
      closingEmoji: "⏮️",
      closingSubtext: "SubhSandesh",
    },
  },
};
