import { Heart, Gamepad2, Images, Music } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "love-gf",
  type: "love",
  category: "gf",
  title: "Love You Forever",
  description: "A romantic love page with games, gallery & music to share anytime",
  emoji: "💕",
  color: "from-pink-500 to-rose-500",
  previewText: "I Love You, My Everything! 💕",
  bodyText:
    "You are the reason my heart beats a little faster. Every moment with you is a gift I treasure, today and always.",
  bgGradient: "from-pink-50 via-rose-50 to-white",
  coverImage: "/love/lovegf.webp",
  tabs: [
    { id: "cover", icon: Heart, label: "Love" },
    { id: "games", icon: Gamepad2, label: "Games" },
    { id: "gallery", icon: Images, label: "Gallery" },
    { id: "music", icon: Music, label: "Music" },
  ],
  navActiveColor: "text-pink-500",
  navActiveBg: "bg-pink-500/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "A love letter from my heart to yours",
      ctaText: "Explore Our Love Story",
      floatingEmojis: ["💕", "💗", "✨", "🦋", "💖"],
    },
    letter: {
      headerEmoji: "💌",
      title: "My Love Letter",
      greeting: "My Dearest Love,",
      decorEmojis: ["💕", "💗", "💕"],
    },
    final: {
      headerEmoji: "💖",
      title: "Forever & Always",
      subtitle: "You are my everything",
      wishes: [
        "You make my heart skip a beat every single day 💓",
        "I fall in love with you all over again each morning ✨",
        "You are the best thing that ever happened to me 💕",
        "My love for you is infinite and eternal 💗",
      ],
      closingEmoji: "💝",
      closingSubtext: "I love you more than words can say",
    },
  },
};
