import { Home, Heart, CalendarDays, Camera, HandHeart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "shaadi-card",
  type: "wedding",
  category: "wedding",
  title: "Animated Shaadi Card",
  description:
    "A beautiful animated Indian wedding invitation card with couple photos, events, gallery & blessings wall",
  emoji: "💐",
  color: "from-rose-500 to-pink-600",
  previewText: "You're Invited to Our Shaadi! 💐",
  bodyText:
    "Two hearts, one beautiful beginning. Join us as we celebrate our union.",
  bgGradient: "from-rose-50 via-pink-50 to-white",
  coverImage: templateMedia("shaadi-card", "cover-poster.webp"),
  tabs: [
    { id: "home",      icon: Home,        label: "Card"      },
    { id: "couple",    icon: Heart,       label: "Us"        },
    { id: "events",    icon: CalendarDays,label: "Events"    },
    { id: "gallery",   icon: Camera,      label: "Gallery"   },
    { id: "blessings", icon: HandHeart,   label: "Blessings" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "A celebration of love, tradition & new beginnings",
      ctaText: "View Wedding Invitation",
      floatingEmojis: ["💐", "🌸", "💍", "✨", "🪷"],
    },
    letter: {
      headerEmoji: "💌",
      title: "Wedding Invitation",
      greeting: "Dear Guest,",
      decorEmojis: ["🌸", "💍", "🌸"],
    },
    final: {
      headerEmoji: "💐",
      title: "Shaadi Mubarak",
      subtitle: "शुभ विवाह",
      wishes: [
        "May your love story be timeless and beautiful 💕",
        "Two souls united in love and tradition ✨",
        "Wishing you a lifetime of joy and togetherness 💗",
        "May every day be as beautiful as your wedding day 🌸",
      ],
      closingEmoji: "🕉️",
      closingSubtext: "शुभ विवाह",
    },
  },
};
