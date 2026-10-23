import { Home, Heart, CalendarDays, Camera, HandHeart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "christian-wedding-2",
  type: "wedding",
  category: "wedding",
  title: "Christian Wedding — Scroll Edition",
  description:
    "Stained-glass garden windows swing open onto a cherry-blossom garden: a light, single-scroll Christian wedding invitation in sage, ivory and blush, with a Bible verse, every celebration with map and calendar, RSVP per event, gallery, voice blessings and an AI that writes it from a few answers.",
  emoji: "⛪",
  color: "from-emerald-700 to-rose-900/80",
  previewText: "Open the garden windows 💐",
  bodyText: "One long page, many beautiful moments. Scroll to meet the couple, RSVP, and leave a blessing.",
  bgGradient: "from-emerald-50 via-stone-50 to-white",
  coverImage: templateMedia("christian-wedding-2", "cover-poster.webp"),
  tabs: [
    { id: "home", icon: Home, label: "Card" },
    { id: "couple", icon: Heart, label: "Us" },
    { id: "events", icon: CalendarDays, label: "Events" },
    { id: "gallery", icon: Camera, label: "Gallery" },
    { id: "blessings", icon: HandHeart, label: "Blessings" },
  ],
  navActiveColor: "text-emerald-800",
  navActiveBg: "bg-emerald-800/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Faith, love, and a joyful new beginning",
      ctaText: "Scroll the Invitation",
      floatingEmojis: ["⛪", "💐", "💍", "✨", "🕊️"],
    },
    letter: {
      headerEmoji: "💌",
      title: "Wedding Invitation",
      greeting: "Dear friend,",
      decorEmojis: ["🌿", "💍", "🌿"],
    },
    final: {
      headerEmoji: "💐",
      title: "Blessings",
      subtitle: "With love",
      wishes: [
        "May your marriage be blessed with love and joy.",
        "Two hearts united in faith and grace.",
        "Wishing you a lifetime of kindness and devotion.",
        "May God bless your journey together.",
      ],
      closingEmoji: "✝️",
      closingSubtext: "Love never fails",
    },
  },
};
