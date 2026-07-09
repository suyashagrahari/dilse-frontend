import { PartyPopper, Mail, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "birthday-gf",
  type: "birthday",
  category: "gf",
  title: "Happy Birthday My Love",
  description: "A romantic birthday wish for your special someone",
  emoji: "🎂",
  color: "from-rose to-primary",
  previewText: "Happy Birthday, My Love! 🎂",
  bodyText:
    "Every moment with you is a gift. On your special day, I want you to know how much you mean to me. Here's to another year of love, laughter, and beautiful memories together.",
  bgGradient: "from-pink-100 via-rose-50 to-red-100",
  coverImage: "/assets/Birthday1/birthdaytemplate1.webp",
  tabs: [
    { id: "cover", icon: PartyPopper, label: "Wish" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "final", icon: Gift, label: "Surprise" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "circles",

  pages: {
    cover: {
      subtitle: "A special message awaits you",
      ctaText: "Read More",
      floatingEmojis: ["🎈", "🎉", "✨", "🎊", "⭐"],
    },
    letter: {
      headerEmoji: "💌",
      title: "A Letter For You",
      greeting: "Dear Special One,",
      decorEmojis: ["✨", "💕", "✨"],
    },
    final: {
      headerEmoji: "🎁",
      title: "Special Wishes",
      subtitle: "Just for you",
      wishes: [
        "May all your dreams come true! ✨",
        "Wishing you endless happiness 🌟",
        "Here's to amazing adventures ahead 🎈",
        "You deserve all the love in the world 💝",
      ],
      closingEmoji: "❤️",
      closingSubtext: "Made with love, just for you",
    },
  },
};
