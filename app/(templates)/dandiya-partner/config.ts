import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the Dandiya night poster
// (source: media-src/templates/dandiya-partner/cover-poster-v2.webp, the red
// kumkum-and-gold poster — a new name because the old URL is cached immutable; upload it
// with `cd server && npm run upload:template-media -- --only=dandiya-partner`).
export const config: TemplatePageConfig = {
  slug: "dandiya-partner",
  type: "festival",
  category: "festival",
  title: "Be My Dandiya Partner — a Navratri invitation",
  description:
    "Invite them to a Dandiya night: light nine diyas, clash the sticks on the dhol beat, twirl in your colour, and ask “Will you be my Dandiya partner?”",
  coverImage: templateMedia("dandiya-partner", "cover-poster-v2.webp"),
  emoji: "🪔",
  color: "from-amber-400 to-rose-700",
  previewText: "you've been invited to a Dandiya night 🪔",
  bodyText: "The dhol is calling.",
  bgGradient: "from-indigo-950 via-blue-950 to-rose-950",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Note" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "ask", icon: Heart, label: "Ask" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-amber-500",
  navActiveBg: "bg-amber-500/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "you've been invited to a Dandiya night 🪔", ctaText: "Open", floatingEmojis: ["🪔", "🌼", "✨"] },
    letter: { headerEmoji: "🪔", title: "A note in the dupatta", greeting: "Hey you,", decorEmojis: ["🌼", "✨", "💛"] },
    final: {
      headerEmoji: "🪔",
      title: "Happy Navratri",
      subtitle: "Made with love (and a lot of dhol)",
      wishes: ["Made just for you 💛", "Open it again any night 🌙", "Invite your own partner ✨"],
      closingEmoji: "🪔",
      closingSubtext: "SubhSandesh",
    },
  },
};
