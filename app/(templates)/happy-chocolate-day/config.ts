import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the day's own scene, captured from the live page
// (source: media-src/templates/happy-chocolate-day/cover-v2.webp).
export const config: TemplatePageConfig = {
  slug: "happy-chocolate-day",
  type: "valentine",
  category: "gf",
  title: "Chocolate Day — Ek Dabba Pyaar",
  description:
    'Unwrap a box of chocolates — every piece hides a sweet reason, the last one melts into your letter.',
  coverImage: templateMedia("happy-chocolate-day", "cover-v2.webp"),
  emoji: "🍫",
  color: "from-amber-900 to-pink-500",
  previewText: 'kuch meetha ho jaaye? 🍫',
  bodyText: 'Nine reasons, zero calories.',
  bgGradient: "from-amber-50 via-pink-50 to-rose-50",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "love", icon: Heart, label: "Love" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-pink-600",
  navActiveBg: "bg-pink-600/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: 'kuch meetha ho jaaye? 🍫', ctaText: "Open", floatingEmojis: ["🍫", "💗", "✨"] },
    letter: { headerEmoji: "🍫", title: "A letter for you", greeting: "Hey you,", decorEmojis: ["🍫", "💌", "✨"] },
    final: {
      headerEmoji: "🍫",
      title: "Happy Chocolate Day",
      subtitle: "Made with love",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Send one back 💌"],
      closingEmoji: "🍫",
      closingSubtext: "SubhSandesh",
    },
  },
};
