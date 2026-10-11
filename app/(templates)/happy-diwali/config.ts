import { Mail, Flame, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the Diwali night poster
// (source: media-src/templates/happy-diwali/cover-poster.webp, uploaded to the CDN).
export const config: TemplatePageConfig = {
  slug: "happy-diwali",
  type: "festival",
  category: "festival",
  title: "Happy Diwali — A Diya at Your Door",
  description:
    "Leave a diya at their door: they light it, light a row of wish diyas, colour a rangoli, write their name with a sparkler, light a whole tray of crackers, open your letter from a red-and-gold liffafa and a box of mithai.",
  coverImage: templateMedia("happy-diwali", "cover-poster.webp"),
  emoji: "🪔",
  color: "from-amber-400 to-red-900",
  previewText: "someone left a diya at your door 🪔",
  bodyText: "Light it.",
  bgGradient: "from-red-950 via-red-900 to-amber-800",
  tabs: [
    { id: "open", icon: Flame, label: "Diya" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "wishes", icon: Sparkles, label: "Wishes" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-amber-500",
  navActiveBg: "bg-amber-500/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "someone left a diya at your door 🪔", ctaText: "Light it", floatingEmojis: ["🪔", "✨", "🎆"] },
    letter: { headerEmoji: "🪔", title: "A letter in a liffafa", greeting: "Dear you,", decorEmojis: ["🪔", "🌼", "✨"] },
    final: {
      headerEmoji: "🪔",
      title: "Shubh Deepavali",
      subtitle: "Made with love and a little light",
      wishes: ["Made just for you 💛", "Open it again any evening 🌙", "Light a diya for someone 🪔"],
      closingEmoji: "✨",
      closingSubtext: "SubhSandesh",
    },
  },
};
