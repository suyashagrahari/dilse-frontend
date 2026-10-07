import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { DEMO_PHOTO_CDN } from "../_love/types";

// Gallery card. The cover is a placeholder (a demo couple photo) until the
// day's own cover art is uploaded to templates/happy-chocolate-day/cover.webp.
export const config: TemplatePageConfig = {
  slug: "happy-chocolate-day",
  type: "love",
  category: "gf",
  title: "Chocolate Day — Ek Dabba Pyaar",
  description:
    'Unwrap a box of chocolates — every piece hides a sweet reason, the last one melts into your letter.',
  coverImage: `${DEMO_PHOTO_CDN}/couple3.webp`,
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
