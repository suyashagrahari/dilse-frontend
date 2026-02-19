import { PartyPopper, Mail, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "birthday-friend",
  type: "birthday",
  category: "friend",
  title: "Birthday Bash",
  description: "Fun birthday wishes for your awesome friend",
  emoji: "🎉",
  color: "from-secondary to-gold",
  previewText: "Happy Birthday, Buddy! 🎉",
  bodyText:
    "Another year older, another year wiser (debatable 😄). Wishing you the most epic birthday ever! Let's celebrate YOU today!",
  bgGradient: "from-amber-50 via-orange-50 to-yellow-50",
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
