import { Flag, Layers, Scale, BarChart3, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "flags",
  type: "love",
  category: "gf",
  title: "Red Flag, Green Flag",
  description:
    "One profile near you. They swipe on your worst habits — left, right, or 'it's complicated' — and each direction reveals a different answer you wrote. Ends with a verdict about them.",
  coverImage: "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/flags/cover.jpg",
  emoji: "🚩",
  color: "from-rose-600 to-emerald-700",
  previewText: "1 profile near you. swipe up to begin 🚩",
  bodyText:
    "Eleven statements. Three authored answers each. The swipe actually decides which one they get.",
  bgGradient: "from-rose-50 via-stone-50 to-white",
  tabs: [
    { id: "profile", icon: Layers, label: "Profile" },
    { id: "cards", icon: Flag, label: "Cards" },
    { id: "truth", icon: Scale, label: "Verdicts" },
    { id: "score", icon: BarChart3, label: "Scorecard" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-rose-700",
  navActiveBg: "bg-rose-700/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "1 profile near you.",
      ctaText: "Swipe up to begin",
      floatingEmojis: ["🚩","💚","🤔","✨","💬"],
    },
    letter: {
      headerEmoji: "🚩",
      title: "Red flag, green flag",
      greeting: "Your call,",
      decorEmojis: ["💚","🤔","💬"],
    },
    final: {
      headerEmoji: "💚",
      title: "Verdict delivered.",
      subtitle: "Computed entirely from your swipes",
      wishes: ["You were generous 💚","Suspiciously generous 🚩","Still here though ✨"],
      closingEmoji: "✨",
      closingSubtext: "SubhSandesh",
    },
  },
};
