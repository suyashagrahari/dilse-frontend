import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the day's own scene, captured from the live page
// (source: media-src/templates/happy-hug-day/cover.webp).
export const config: TemplatePageConfig = {
  slug: "happy-hug-day",
  type: "valentine",
  category: "gf",
  title: "Hug Day — Jaadu Ki Jhappi Café",
  description:
    'A cosy café with a Hug Menu, a squishy first hug and tear-off hug coupons.',
  coverImage: templateMedia("happy-hug-day", "cover.webp"),
  emoji: "🤗",
  color: "from-orange-300 to-pink-500",
  previewText: 'a warm hug, delivered 🤗',
  bodyText: 'Hugs on the menu. All free.',
  bgGradient: "from-orange-50 via-pink-50 to-rose-50",
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
    cover: { subtitle: 'a warm hug, delivered 🤗', ctaText: "Open", floatingEmojis: ["🤗", "💗", "✨"] },
    letter: { headerEmoji: "🤗", title: "A letter for you", greeting: "Hey you,", decorEmojis: ["🤗", "💌", "✨"] },
    final: {
      headerEmoji: "🤗",
      title: "Happy Hug Day",
      subtitle: "Made with love",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Send one back 💌"],
      closingEmoji: "🤗",
      closingSubtext: "SubhSandesh",
    },
  },
};
