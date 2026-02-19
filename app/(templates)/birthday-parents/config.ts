import { PartyPopper, Mail, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "birthday-parents",
  type: "birthday",
  category: "parents",
  title: "Dear Mom/Dad",
  description: "Heartfelt birthday wishes for your parents",
  emoji: "💐",
  color: "from-mint to-sky",
  previewText: "Happy Birthday, Dear Parent! 💐",
  bodyText:
    "Thank you for being the guiding light in my life. Your love and sacrifice have made me who I am. Wishing you all the happiness in the world on your special day.",
  bgGradient: "from-teal-50 via-cyan-50 to-blue-50",
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
