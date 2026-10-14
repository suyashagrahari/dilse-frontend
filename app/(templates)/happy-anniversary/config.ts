import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the pastel "Our Little Love Museum" poster
// (source: media-src/templates/happy-anniversary/cover-poster.webp; upload it
// with `cd server && npm run upload:template-media -- --only=happy-anniversary`).
export const config: TemplatePageConfig = {
  slug: "happy-anniversary",
  // The gallery's "Anniversary 💍" chip filters on `type` (templateTypes);
  // `category` is the "who" filter, where couple pages live under "gf".
  type: "anniversary",
  category: "gf",
  title: "Happy Anniversary — Our Little Love Museum",
  description:
    "A tiny museum about the two of you: tear the admission ticket, pull the lever on your time-together clock, swipe your framed photos, listen to the audio guide of your story, shake a snow globe for reasons, and unveil their Masterpiece of the Year award. Four pastel looks.",
  coverImage: templateMedia("happy-anniversary", "cover-poster.webp"),
  emoji: "🖼️",
  color: "from-rose-300 to-amber-300",
  previewText: "you're invited to a tiny museum about us 🖼️",
  bodyText: "Tear your ticket and walk in.",
  bgGradient: "from-rose-50 via-amber-50 to-rose-100",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "ask", icon: Heart, label: "Yes" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "you're invited to a tiny museum about us 🖼️", ctaText: "Open", floatingEmojis: ["🖼️", "💗", "🎟️"] },
    letter: { headerEmoji: "🖋️", title: "A note in the guestbook", greeting: "Hey you,", decorEmojis: ["💗", "🖼️", "✨"] },
    final: {
      headerEmoji: "🏆",
      title: "Masterpiece of the Year",
      subtitle: "Made with love, for another year of us",
      wishes: ["Made just for you 💗", "Open it again next anniversary 🖼️", "Make one for your own person ✨"],
      closingEmoji: "💗",
      closingSubtext: "SubhSandesh",
    },
  },
};
