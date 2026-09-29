import { Home, Heart, CalendarDays, Camera, HandHeart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "christian-wedding",
  type: "wedding",
  category: "wedding",
  title: "Christian Wedding Invitation",
  description:
    "Elegant sage & watercolor wedding invitation with couple story, RSVP-style events, gallery & blessings — same powerful editor as our animated cards.",
  emoji: "⛪",
  color: "from-emerald-700 to-rose-900/80",
  previewText: "Join Us — We’re Getting Married! ✝️",
  bodyText: "Two hearts, one covenant. Join us as we celebrate before God, family, and friends.",
  bgGradient: "from-emerald-50 via-stone-50 to-white",
  coverImage: templateMedia("christian-wedding", "cover-poster.webp"),
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
      ctaText: "View Wedding Invitation",
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
