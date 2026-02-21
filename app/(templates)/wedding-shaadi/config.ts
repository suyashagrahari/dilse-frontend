import { Home, Heart, CalendarDays, Image, Flower2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "wedding-shaadi",
  type: "wedding",
  category: "wedding",
  title: "Royal Indian Wedding",
  description:
    "A luxury Indian wedding invitation with events, gallery & blessings wall",
  emoji: "💍",
  color: "from-amber-500 to-yellow-600",
  previewText: "You're Invited to Our Wedding! 💍",
  bodyText:
    "Two souls, one beautiful journey. Join us as we begin our forever together.",
  bgGradient: "from-amber-50 via-yellow-50 to-white",
  tabs: [
    { id: "home", icon: Home, label: "Home" },
    { id: "couple", icon: Heart, label: "Us" },
    { id: "events", icon: CalendarDays, label: "Events" },
    { id: "gallery", icon: Image, label: "Gallery" },
    { id: "blessings", icon: Flower2, label: "Blessings" },
  ],
  navActiveColor: "text-amber-500",
  navActiveBg: "bg-amber-500/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "A celebration of love & togetherness",
      ctaText: "View Wedding Details",
      floatingEmojis: ["✨", "💫", "🌟", "💍", "🪷"],
    },
    letter: {
      headerEmoji: "💌",
      title: "Our Invitation",
      greeting: "Dear Guest,",
      decorEmojis: ["✨", "💍", "✨"],
    },
    final: {
      headerEmoji: "💍",
      title: "Together Forever",
      subtitle: "Two souls, one story",
      wishes: [
        "May our journey together be filled with love and laughter 💕",
        "Every love story is beautiful, but ours is our favorite ✨",
        "Two hearts, one beautiful beginning 💗",
        "Written in the stars, sealed with a prayer 🌟",
      ],
      closingEmoji: "🕉️",
      closingSubtext: "शुभ विवाह",
    },
  },
};
