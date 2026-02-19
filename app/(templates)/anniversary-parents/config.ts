import { Heart, Mail, Infinity } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "anniversary-parents",
  type: "anniversary",
  category: "parents",
  title: "Parents' Anniversary",
  description: "Celebrate your parents' love",
  emoji: "💞",
  color: "from-mint to-gold",
  previewText: "Happy Anniversary, Mom & Dad! 💞",
  bodyText:
    "Your love story is my favorite. Thank you for showing me what true love looks like. Wishing you many more years of happiness together.",
  bgGradient: "from-emerald-50 via-yellow-50 to-amber-50",
  tabs: [
    { id: "cover", icon: Heart, label: "Love" },
    { id: "letter", icon: Mail, label: "Memories" },
    { id: "final", icon: Infinity, label: "Forever" },
  ],
  navActiveColor: "text-emerald-500",
  navActiveBg: "bg-emerald-500/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "A love story that inspires",
      ctaText: "Read More",
      floatingEmojis: ["💞", "✨", "🌸", "💕", "🌿"],
    },
    letter: {
      headerEmoji: "💌",
      title: "To My Dear Parents",
      greeting: "Dear Mom & Dad,",
      decorEmojis: ["💞", "✨", "💞"],
    },
    final: {
      headerEmoji: "🏡",
      title: "Thank You For",
      subtitle: "Being the perfect example of love",
      wishes: [
        "Teaching me what real love looks like 💞",
        "Always being there for each other 🤝",
        "Creating the most beautiful family 🏡",
        "Showing that love only grows stronger ✨",
      ],
      closingEmoji: "💞",
      closingSubtext: "Happy Anniversary!",
    },
  },
};
