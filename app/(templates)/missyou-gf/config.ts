import { Heart, Mail, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "missyou-gf",
  type: "missyou",
  category: "gf",
  title: "Missing You",
  description: "Let them know you're thinking of them",
  emoji: "💫",
  color: "from-primary to-accent",
  previewText: "I Miss You So Much 💫",
  bodyText:
    "Distance means nothing when someone means everything. Every second without you feels like an eternity. Can't wait to hold you close again.",
  bgGradient: "from-rose-50 via-purple-50 to-indigo-50",
  tabs: [
    { id: "cover", icon: Heart, label: "Missing" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "final", icon: Gift, label: "More" },
  ],
  navActiveColor: "text-purple-500",
  navActiveBg: "bg-purple-500/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "Counting the moments until we meet again",
      ctaText: "Read More",
      floatingEmojis: ["💫", "✨", "🌙", "⭐", "💜"],
    },
    letter: {
      headerEmoji: "💌",
      title: "Words From My Heart",
      greeting: "My Darling,",
      decorEmojis: ["💫", "💜", "💫"],
    },
    final: {
      headerEmoji: "🌙",
      title: "Until We Meet Again",
      subtitle: "Distance is just a test",
      wishes: [
        "Every sunset reminds me of you 🌅",
        "You're always in my thoughts 💭",
        "Can't wait to see your smile again ✨",
        "My arms are empty without you 💫",
      ],
      closingEmoji: "💜",
      closingSubtext: "Missing you always",
    },
  },
};
