import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { DEMO_PHOTO_CDN } from "../_love/types";

// Gallery card. The cover is a placeholder (a demo couple photo) until the
// day's own cover art is uploaded to templates/happy-promise-day/cover.webp.
export const config: TemplatePageConfig = {
  slug: "happy-promise-day",
  type: "love",
  category: "gf",
  title: "Promise Day — Vaada Pakka",
  description:
    'Pinky swear, a jar of promises, and a love letter they sign as a stamp-paper contract.',
  coverImage: `${DEMO_PHOTO_CDN}/couple1.webp`,
  emoji: "🤞",
  color: "from-pink-500 to-amber-400",
  previewText: 'pinky promise? 🤞',
  bodyText: 'A contract nobody wants to break.',
  bgGradient: "from-pink-50 via-rose-50 to-amber-50",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "love", icon: Heart, label: "Love" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-pink-700",
  navActiveBg: "bg-pink-700/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: 'pinky promise? 🤞', ctaText: "Open", floatingEmojis: ["🤞", "💗", "✨"] },
    letter: { headerEmoji: "🤞", title: "A letter for you", greeting: "Hey you,", decorEmojis: ["🤞", "💌", "✨"] },
    final: {
      headerEmoji: "🤞",
      title: "Happy Promise Day",
      subtitle: "Made with love",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Send one back 💌"],
      closingEmoji: "🤞",
      closingSubtext: "SubhSandesh",
    },
  },
};
