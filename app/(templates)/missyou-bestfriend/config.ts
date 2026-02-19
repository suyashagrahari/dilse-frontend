import { Heart, Mail, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "missyou-bestfriend",
  type: "missyou",
  category: "bestfriend",
  title: "Miss My Bestie",
  description: "Tell your best friend you miss them",
  emoji: "🫂",
  color: "from-gold to-secondary",
  previewText: "Missing My Bestie! 🫂",
  bodyText:
    "Life's just not the same without your crazy energy. Miss our midnight talks, random adventures, and uncontrollable laughter. Come back soon!",
  bgGradient: "from-yellow-50 via-amber-50 to-orange-50",
  tabs: [
    { id: "cover", icon: Heart, label: "Missing" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "final", icon: Gift, label: "More" },
  ],
  navActiveColor: "text-amber-500",
  navActiveBg: "bg-amber-500/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "Life isn't the same without you",
      ctaText: "Read More",
      floatingEmojis: ["🌟", "💛", "✨", "🫂", "⭐"],
    },
    letter: {
      headerEmoji: "💌",
      title: "Dear Bestie",
      greeting: "Hey Bestie,",
      decorEmojis: ["💛", "✨", "💛"],
    },
    final: {
      headerEmoji: "🌟",
      title: "Things I Miss",
      subtitle: "Too many to count",
      wishes: [
        "Our midnight snack runs 🍕",
        "Your ridiculous jokes that always make me laugh 😂",
        "Random video calls about nothing ✨",
        "Being absolute chaos together 💛",
      ],
      closingEmoji: "💛",
      closingSubtext: "Come back soon!",
    },
  },
};
