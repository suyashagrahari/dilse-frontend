import { Mail, Flower2, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the "Digital Bouquet" poster
// (source: media-src/templates/digital-bouquet/cover-poster.webp, on the CDN
// with its @360w/@540w/@720w sizes).
export const config: TemplatePageConfig = {
  slug: "digital-bouquet",
  type: "digital-bouquet",
  category: "gf",
  title: "Digital Bouquet ✦ — Flowers That Never Wilt",
  description:
    "Arrange a bouquet by hand, flower by flower: roses, peonies, tulips, sunflowers, lotus and more, each with its meaning. Wrap it, tie the ribbon, write the card and add your photos. They get it delivered, watch it bloom stem by stem, water it and keep it.",
  coverImage: templateMedia("digital-bouquet", "cover-poster.webp"),
  emoji: "💐",
  color: "from-rose-200 to-pink-300",
  previewText: "a bouquet, hand-picked for you 💐",
  bodyText: "Unwrap it, tap every flower, keep it forever.",
  bgGradient: "from-rose-50 via-pink-50 to-amber-50",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "bloom", icon: Flower2, label: "Bloom" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "letter", icon: Mail, label: "Card" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-rose-700",
  navActiveBg: "bg-rose-600/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "someone sent you flowers 💐", ctaText: "Open", floatingEmojis: ["💐", "🌸", "🌷"] },
    letter: { headerEmoji: "💌", title: "The card", greeting: "Dear you,", decorEmojis: ["🌸", "💗", "🌷"] },
    final: {
      headerEmoji: "💐",
      title: "Your bouquet",
      subtitle: "Arranged by hand, one flower at a time",
      wishes: ["Made just for you 💗", "Open it again anytime 🌷", "Send one back 💐"],
      closingEmoji: "💐",
      closingSubtext: "SubhSandesh",
    },
  },
};
