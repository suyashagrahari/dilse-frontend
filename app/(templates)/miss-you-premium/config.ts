import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the pastel "two dots on a map" poster
// (source: media-src/templates/miss-you-premium/cover-poster.webp, uploaded to
// the CDN under templates/miss-you-premium/ with its @360w/@540w/@720w sizes).
export const config: TemplatePageConfig = {
  slug: "miss-you-premium",
  type: "miss-you-premium",
  category: "gf",
  title: "Miss You ✦ Premium — a long-distance day, morning to sunrise",
  description:
    "The premium long-distance surprise: open the curtains, tune a radio to their voice notes, a photo-booth strip, a picnic date, a tear-off countdown, a message in a bottle, synced heartbeats, your initials in the stars and an airmail postcard. Four pastel looks.",
  coverImage: templateMedia("miss-you-premium", "cover-poster.webp"),
  emoji: "🩵",
  color: "from-sky-300 to-pink-400",
  previewText: "two dots on a map… one of them is you 🩵",
  bodyText: "Good morning from far away.",
  bgGradient: "from-sky-50 via-pink-50 to-violet-100",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "ask", icon: Heart, label: "Call?" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-pink-500",
  navActiveBg: "bg-pink-500/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "two dots on a map… one of them is you 🩵", ctaText: "Open", floatingEmojis: ["🩵", "💗", "☁️"] },
    letter: { headerEmoji: "💌", title: "A message in a bottle", greeting: "Hey you,", decorEmojis: ["🩵", "🐚", "✨"] },
    final: {
      headerEmoji: "🩵",
      title: "Distance means nothing",
      subtitle: "Made with love, from far away",
      wishes: ["Made just for you 🩵", "Open it again anytime ☀️", "Make one for your own person ✨"],
      closingEmoji: "💌",
      closingSubtext: "SubhSandesh",
    },
  },
};
