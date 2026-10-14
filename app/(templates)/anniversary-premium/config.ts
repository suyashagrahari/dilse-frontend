import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the champagne "Book of Us" poster
// (source: media-src/templates/anniversary-premium/cover-poster.webp; upload it
// with `cd server && npm run upload:template-media -- --only=anniversary-premium`).
export const config: TemplatePageConfig = {
  slug: "anniversary-premium",
  type: "anniversary-premium",
  category: "anniversary",
  title: "Anniversary ✦ Premium — The Book of Us",
  description:
    "A cinematic anniversary storybook: film-style titles, two paths that meet, a time machine through every year, your firsts on vinyl, a memory quilt, the letter as a book, your year in numbers, promise lanterns and a Certificate of Forever.",
  coverImage: templateMedia("anniversary-premium", "cover-poster.webp"),
  emoji: "💞",
  color: "from-amber-200 to-rose-300",
  previewText: "happy anniversary — I wrote you a book 📖",
  bodyText: "Every year of us, in one little storybook.",
  bgGradient: "from-amber-50 via-rose-50 to-orange-100",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Book" },
    { id: "photos", icon: ImageIcon, label: "Quilt" },
    { id: "ask", icon: Heart, label: "Forever" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-amber-700",
  navActiveBg: "bg-amber-600/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "happy anniversary — I wrote you a book 📖", ctaText: "Open", floatingEmojis: ["💞", "✨", "🥂"] },
    letter: { headerEmoji: "📖", title: "The Book of Us", greeting: "My love,", decorEmojis: ["💗", "✨", "🌸"] },
    final: {
      headerEmoji: "💞",
      title: "Certificate of Forever",
      subtitle: "Made with love, one year at a time",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Make one for your own person 📖"],
      closingEmoji: "💞",
      closingSubtext: "SubhSandesh",
    },
  },
};
