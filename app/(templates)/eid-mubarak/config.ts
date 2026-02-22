import { Home, Heart, Music, BookOpen, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "eid-mubarak",
  type: "festival",
  category: "festival",
  title: "Eid Mubarak",
  description:
    "A beautiful Eid al-Fitr digital greeting with duas, playlist & blessings",
  emoji: "🌙",
  color: "from-amber-300 to-teal-400",
  previewText: "Eid Mubarak! 🌙",
  bodyText:
    "Wishing you joy, peace, and countless blessings this Eid.",
  bgGradient: "from-slate-950 via-slate-900 to-slate-950",
  coverImage: "/assets/Eid/hero_eid.jpeg",
  tabs: [
    { id: "home", icon: Home, label: "Home" },
    { id: "wish", icon: Gift, label: "Wish" },
    { id: "greetings", icon: Heart, label: "Greetings" },
    { id: "playlist", icon: Music, label: "Playlist" },
    { id: "dua", icon: BookOpen, label: "Dua" },
  ],
  navActiveColor: "text-amber-400",
  navActiveBg: "bg-amber-400/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "A blessed celebration of faith & joy",
      ctaText: "View Eid Greetings",
      floatingEmojis: ["🌙", "⭐", "🕌", "✨", "🤲"],
    },
    letter: {
      headerEmoji: "🌙",
      title: "Eid Greetings",
      greeting: "Dear Friend,",
      decorEmojis: ["✦", "🌙", "✦"],
    },
    final: {
      headerEmoji: "🌙",
      title: "Eid Mubarak",
      subtitle: "May your prayers be accepted",
      wishes: [
        "May this Eid bring endless blessings 🌙",
        "Wishing you peace and prosperity ✨",
        "May Allah accept your fasting & prayers 🤲",
        "Celebrating faith, love & togetherness 🕌",
      ],
      closingEmoji: "🌙",
      closingSubtext: "Eid al-Fitr",
    },
  },
};
