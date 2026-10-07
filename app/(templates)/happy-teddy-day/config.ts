import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { DEMO_PHOTO_CDN } from "../_love/types";

// Gallery card. The cover is a placeholder (a demo couple photo) until the
// day's own cover art is uploaded to templates/happy-teddy-day/cover.webp.
export const config: TemplatePageConfig = {
  slug: "happy-teddy-day",
  type: "love",
  category: "gf",
  title: "Teddy Day — Teddy Catcher",
  description:
    'A claw machine rigged to win the teddy you named and dressed — it brings your letter.',
  coverImage: `${DEMO_PHOTO_CDN}/couple4.webp`,
  emoji: "🧸",
  color: "from-violet-700 to-pink-400",
  previewText: '1 free play for you 🧸',
  bodyText: "The arcade they can't lose.",
  bgGradient: "from-violet-50 via-pink-50 to-amber-50",
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
    cover: { subtitle: '1 free play for you 🧸', ctaText: "Open", floatingEmojis: ["🧸", "💗", "✨"] },
    letter: { headerEmoji: "🧸", title: "A letter for you", greeting: "Hey you,", decorEmojis: ["🧸", "💌", "✨"] },
    final: {
      headerEmoji: "🧸",
      title: "Happy Teddy Day",
      subtitle: "Made with love",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Send one back 💌"],
      closingEmoji: "🧸",
      closingSubtext: "SubhSandesh",
    },
  },
};
