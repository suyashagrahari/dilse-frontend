import { Heart, Mail, Infinity } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "anniversary-gf",
  type: "anniversary",
  category: "gf",
  title: "Our Anniversary",
  description: "Celebrate your love story",
  emoji: "💍",
  color: "from-gold to-primary",
  previewText: "Happy Anniversary, My Love! 💍",
  bodyText:
    "Another year of us, another year of beautiful memories. You make my world complete. Here's to forever and beyond with you by my side.",
  bgGradient: "from-yellow-50 via-rose-50 to-pink-50",
  tabs: [
    { id: "cover", icon: Heart, label: "Love" },
    { id: "letter", icon: Mail, label: "Memories" },
    { id: "final", icon: Infinity, label: "Forever" },
  ],
  navActiveColor: "text-amber-500",
  navActiveBg: "bg-amber-500/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Celebrating our love story",
      ctaText: "Relive Our Moments",
      floatingEmojis: ["💍", "💕", "✨", "🥂", "💖"],
    },
    letter: {
      headerEmoji: "💌",
      title: "Our Story",
      greeting: "My Forever Love,",
      decorEmojis: ["💍", "💕", "💍"],
    },
    final: {
      headerEmoji: "🥂",
      title: "Here's To Us",
      subtitle: "Today, tomorrow, and always",
      wishes: [
        "Every day with you is a celebration 🥂",
        "You make ordinary moments extraordinary ✨",
        "My love for you grows stronger each day 💕",
        "Here's to a lifetime of us 💍",
      ],
      closingEmoji: "💖",
      closingSubtext: "Happy Anniversary, my love",
    },
  },
};
