import { Heart, Gamepad2, Images, Music } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "anniversary-gf",
  type: "anniversary",
  category: "gf",
  title: "Our Anniversary",
  description: "Celebrate your love story with games, gallery & music",
  emoji: "💍",
  color: "from-gold to-primary",
  previewText: "Happy Anniversary, My Love! 💍",
  bodyText:
    "Another year of us, another year of beautiful memories. You make my world complete. Here's to forever and beyond with you by my side.",
  bgGradient: "from-rose-50 via-pink-50 to-white",
  tabs: [
    { id: "cover", icon: Heart, label: "Love" },
    { id: "games", icon: Gamepad2, label: "Games" },
    { id: "gallery", icon: Images, label: "Gallery" },
    { id: "music", icon: Music, label: "Music" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  coverImage: "https://cdn.subhsandesh.in/gifts-media/assets/Aniversary/aniversary.webp",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Celebrating our love story",
      ctaText: "Explore Our Journey",
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
