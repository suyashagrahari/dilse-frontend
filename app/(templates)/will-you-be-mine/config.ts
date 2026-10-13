import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the "Will you be mine?" ring-box poster
// (source: media-src/templates/will-you-be-mine/cover-poster.webp, with
// @360w/@540w/@720w variants on the CDN next to it).
export const config: TemplatePageConfig = {
  slug: "will-you-be-mine",
  type: "love",
  category: "gf",
  title: "Will You Be Mine? — a cute proposal page",
  description:
    "Ask them the cute way: a velvet ring box, your story on a heart path, reasons you fell as a star constellation, a love quiz, your letter, a hold-to-propose ring and “Will you be mine?” with a No that runs away. Four romantic looks.",
  coverImage: templateMedia("will-you-be-mine", "cover-poster.webp"),
  emoji: "💍",
  color: "from-rose-300 to-pink-500",
  previewText: "someone has a question for you 💍",
  bodyText: "Open it when you're smiling.",
  bgGradient: "from-rose-50 via-pink-100 to-rose-200",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "ask", icon: Heart, label: "Ask" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "someone has a question for you 💍", ctaText: "Open", floatingEmojis: ["💍", "💗", "✨"] },
    letter: { headerEmoji: "💌", title: "I wrote you a love letter", greeting: "Hey you,", decorEmojis: ["💗", "🌹", "✨"] },
    final: {
      headerEmoji: "💍",
      title: "Officially Mine",
      subtitle: "Made with love (and very sweaty palms)",
      wishes: ["Made just for you 💗", "Open it again anytime 💍", "Make one for your own person ✨"],
      closingEmoji: "💍",
      closingSubtext: "SubhSandesh",
    },
  },
};
