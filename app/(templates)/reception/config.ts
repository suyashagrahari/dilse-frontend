import { Home, Heart, Image, MapPin, Flower2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "reception",
  type: "wedding",
  category: "wedding",
  title: "Luxury Reception Night",
  description:
    "A cinematic, ultra-modern reception invitation with gallery, location & blessings wall",
  emoji: "🥂",
  color: "from-rose-300 to-amber-200",
  previewText: "You're Invited to Our Reception! 🥂",
  bodyText:
    "Join us for a night of celebration, love & unforgettable memories.",
  bgGradient: "from-slate-950 via-slate-900 to-slate-950",
  coverImage: "/assets/Reception/reception.webp",
  tabs: [
    { id: "home", icon: Home, label: "Home" },
    { id: "couple", icon: Heart, label: "Us" },
    { id: "gallery", icon: Image, label: "Gallery" },
    { id: "location", icon: MapPin, label: "Location" },
    { id: "blessings", icon: Flower2, label: "Blessings" },
  ],
  navActiveColor: "text-rose-300",
  navActiveBg: "bg-rose-300/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "A celebration of love & togetherness",
      ctaText: "View Reception Details",
      floatingEmojis: ["✨", "🥂", "🌟", "💫", "🪷"],
    },
    letter: {
      headerEmoji: "💌",
      title: "Our Invitation",
      greeting: "Dear Guest,",
      decorEmojis: ["✨", "🥂", "✨"],
    },
    final: {
      headerEmoji: "🥂",
      title: "See You There",
      subtitle: "Two souls, one celebration",
      wishes: [
        "May our celebration be as magical as our love 💕",
        "Every love story is beautiful, but ours is our favorite ✨",
        "Two hearts, one beautiful beginning 💗",
        "Written in the stars, sealed with a prayer 🌟",
      ],
      closingEmoji: "🥂",
      closingSubtext: "Reception Evening",
    },
  },
};
