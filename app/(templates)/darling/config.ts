import { Heart, Gamepad2, Images, Music, StickyNote } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "darling",
  type: "love",
  category: "gf",
  title: "My Darling",
  description: "An intimate love space with games, gallery, music & shared memories",
  emoji: "🌹",
  color: "from-rose-600 to-pink-800",
  previewText: "You Are My Everything, My Darling 🌹",
  bodyText:
    "Every night I think of you, every morning I wake up grateful. You are the melody of my life, my darling.",
  bgGradient: "from-rose-950 via-pink-950 to-slate-950",
  coverImage: "/assets/hero-bg.jpeg",
  tabs: [
    { id: "home", icon: Heart, label: "Home" },
    { id: "games", icon: Gamepad2, label: "Games" },
    { id: "gallery", icon: Images, label: "Gallery" },
    { id: "music", icon: Music, label: "Music" },
    { id: "notes", icon: StickyNote, label: "Notes" },
  ],
  navActiveColor: "text-rose-400",
  navActiveBg: "bg-rose-400/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "A velvet letter from my heart to yours",
      ctaText: "Open My Heart",
      floatingEmojis: ["🌹", "💫", "✨", "🦋", "💕"],
    },
    letter: {
      headerEmoji: "💌",
      title: "My Love Letter",
      greeting: "My Darling,",
      decorEmojis: ["🌹", "💕", "🌹"],
    },
    final: {
      headerEmoji: "🌹",
      title: "Forever Yours",
      subtitle: "You are my everything",
      wishes: [
        "You make my world brighter just by being in it 🌹",
        "I fall deeper in love with you every single day 💫",
        "You are the most beautiful thing that happened to me 💕",
        "My love for you is eternal and infinite ✨",
      ],
      closingEmoji: "💝",
      closingSubtext: "Yours, always and forever",
    },
  },
};
