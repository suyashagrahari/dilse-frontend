import { Home, Heart, CalendarDays, Camera, HandHeart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "christian-wedding",
  type: "wedding",
  category: "wedding",
  title: "Christian Wedding Invitation ✦ — Church Doors That Open",
  description:
    "Tall oak church doors under a stained-glass rose window swing open with a bell, doves fly out over a flower-strewn aisle: your names, a Bible verse, the order of service, every function with map and dress code, RSVP per function, a gallery and a blessings wall with voice notes. Ivory, dusty rose and sage; the AI writes it from a few questions.",
  emoji: "⛪",
  color: "from-stone-200 to-rose-200",
  previewText: "Join Us — We’re Getting Married! ✝️",
  bodyText: "Two hearts, one covenant. Join us as we celebrate before God, family, and friends.",
  bgGradient: "from-stone-50 via-rose-50 to-emerald-50",
  // The owner's card art, served from the repo (public/wedding-v3, never the CDN).
  coverImage: "/wedding-v3/christian-wedding/card.webp",
  tabs: [
    { id: "home", icon: Home, label: "Card" },
    { id: "couple", icon: Heart, label: "Us" },
    { id: "events", icon: CalendarDays, label: "Events" },
    { id: "gallery", icon: Camera, label: "Gallery" },
    { id: "blessings", icon: HandHeart, label: "Blessings" },
  ],
  navActiveColor: "text-emerald-700",
  navActiveBg: "bg-emerald-700/10",
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
