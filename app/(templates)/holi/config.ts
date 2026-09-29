import { Home, Heart, Music, Info, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "holi",
  type: "festival",
  category: "festival",
  title: "Happy Holi",
  description:
    "A vibrant Holi digital greeting with colors, playlist & blessings",
  emoji: "🎨",
  color: "from-pink-500 to-orange-400",
  previewText: "Happy Holi! 🎨",
  bodyText:
    "Wishing you joy, colors, and countless blessings this Holi.",
  bgGradient: "from-pink-50 via-orange-50 to-yellow-50",
  coverImage: templateMedia("holi", "cover-poster.webp"),
  tabs: [
    { id: "home", icon: Home, label: "Home" },
    { id: "wish", icon: Gift, label: "Wish" },
    { id: "greetings", icon: Heart, label: "Greetings" },
    { id: "playlist", icon: Music, label: "Playlist" },
    { id: "more", icon: Info, label: "More" },
  ],
  navActiveColor: "text-pink-500",
  navActiveBg: "bg-pink-500/10",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "A vibrant celebration of colors & joy",
      ctaText: "View Holi Greetings",
      floatingEmojis: ["🎨", "💜", "🧡", "💛", "💙"],
    },
    letter: {
      headerEmoji: "🎨",
      title: "Holi Greetings",
      greeting: "Dear Friend,",
      decorEmojis: ["✦", "🎨", "✦"],
    },
    final: {
      headerEmoji: "🎨",
      title: "Happy Holi",
      subtitle: "May colors fill your life",
      wishes: [
        "May every color bring you joy 🎨",
        "Wishing you love and laughter 💜",
        "May your Holi be full of fun 💦",
        "Celebrating colors, love & togetherness 🌈",
      ],
      closingEmoji: "🎨",
      closingSubtext: "Festival of Colors",
    },
  },
};
