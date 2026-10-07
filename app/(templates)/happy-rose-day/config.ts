import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the day's own scene, captured from the live page
// (source: media-src/templates/happy-rose-day/cover.webp).
export const config: TemplatePageConfig = {
  slug: "happy-rose-day",
  type: "valentine",
  category: "gf",
  title: "Rose Day — Ek Gulaab, Sirf Tumhare Liye",
  description:
    'Press and hold to grow a rose in your colour, pluck loves-me-not, open a wax-sealed letter.',
  coverImage: templateMedia("happy-rose-day", "cover.webp"),
  emoji: "🌹",
  color: "from-rose-500 to-pink-400",
  previewText: 'a rose is waiting for you 🌹',
  bodyText: 'The rose they grow themselves — your letter blooms out of it.',
  bgGradient: "from-rose-50 via-pink-50 to-amber-50",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "love", icon: Heart, label: "Love" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-rose-600",
  navActiveBg: "bg-rose-600/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: 'a rose is waiting for you 🌹', ctaText: "Open", floatingEmojis: ["🌹", "💗", "✨"] },
    letter: { headerEmoji: "🌹", title: "A letter for you", greeting: "Hey you,", decorEmojis: ["🌹", "💌", "✨"] },
    final: {
      headerEmoji: "🌹",
      title: "Happy Rose Day",
      subtitle: "Made with love",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Send one back 💌"],
      closingEmoji: "🌹",
      closingSubtext: "SubhSandesh",
    },
  },
};
