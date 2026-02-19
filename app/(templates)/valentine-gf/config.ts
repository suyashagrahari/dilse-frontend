import { Heart, Mail, Infinity } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "valentine-gf",
  type: "valentine",
  category: "gf",
  title: "Be My Valentine",
  description: "Express your love this Valentine's Day",
  emoji: "💝",
  color: "from-primary to-rose",
  previewText: "Will You Be My Valentine? 💝",
  bodyText:
    "In a world full of ordinary, you are my extraordinary. My heart beats for you, today and always. Happy Valentine's Day, my love.",
  bgGradient: "from-red-100 via-pink-100 to-rose-100",

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
