import { PartyPopper, Mail, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "birthday-bestfriend",
  type: "birthday",
  category: "bestfriend",
  title: "BFF Birthday",
  description: "Epic birthday wishes for your best friend",
  emoji: "🎊",
  color: "from-lavender to-sky",
  previewText: "Happy Birthday, BFF! 🎊",
  bodyText:
    "To my partner in crime — happy birthday! Thanks for being the kind of friend who makes life a whole lot more fun. Let's make this year legendary!",
  bgGradient: "from-violet-50 via-blue-50 to-cyan-50",
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
