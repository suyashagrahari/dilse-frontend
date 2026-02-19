import { Heart, Mail, Infinity } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "valentine-bestfriend",
  type: "valentine",
  category: "bestfriend",
  title: "Galentine's Day",
  description: "Celebrate love with your bestie",
  emoji: "💗",
  color: "from-lavender to-primary",
  previewText: "Happy Galentine's Day! 💗",
  bodyText:
    "Who needs a valentine when I have the best friend in the world? You make every day brighter. Love you to the moon and back!",
  bgGradient: "from-purple-50 via-pink-50 to-fuchsia-50",
  tabs: [
    { id: "cover", icon: Heart, label: "Love" },
    { id: "letter", icon: Mail, label: "Feelings" },
    { id: "final", icon: Infinity, label: "Forever" },
  ],
  navActiveColor: "text-red-500",
  navActiveBg: "bg-red-500/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "A love story written for you",
      ctaText: "Open My Heart",
      floatingEmojis: ["💕", "💗", "💖", "✨", "💘"],
    },
    letter: {
      headerEmoji: "🌹",
      title: "A Love Letter",
      greeting: "My Dearest,",
      decorEmojis: ["🌹", "💕", "🌹"],
    },
    final: {
      headerEmoji: "💍",
      title: "Promises of Love",
      subtitle: "From my heart to yours",
      wishes: [
        "I promise to love you endlessly 💕",
        "You are my today and all of my tomorrows 🌅",
        "With you, every moment is magic ✨",
        "My heart beats only for you 💓",
      ],
      closingEmoji: "💝",
      closingSubtext: "Forever & Always",
    },
  },
};
