import { Hand, Timer, Sparkles, Mail, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "hold-my-hand",
  type: "love",
  category: "gf",
  title: "Hold My Hand",
  description:
    "Hold the screen for 60 seconds without letting go. Let go and it drains. Make it to the end and the letter unlocks.",
  emoji: "🫀",
  color: "from-violet-500 to-fuchsia-600",
  previewText: "don't let go 🫀",
  bodyText:
    "Sixty seconds. One finger. Their face comes into focus the longer you hold.",
  bgGradient: "from-violet-50 via-fuchsia-50 to-white",
  coverImage: "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/hold-my-hand/cover.jpg",
  tabs: [
    { id: "hold", icon: Hand, label: "Hold" },
    { id: "timer", icon: Timer, label: "Timer" },
    { id: "ghosts", icon: Sparkles, label: "Ghosts" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-violet-600",
  navActiveBg: "bg-violet-600/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Press and hold. Don't let go.",
      ctaText: "Start holding",
      floatingEmojis: ["🫀","💗","✨","🤍","💫"],
    },
    letter: {
      headerEmoji: "💌",
      title: "You held on",
      greeting: "Hey,",
      decorEmojis: ["🫀","💗","✨"],
    },
    final: {
      headerEmoji: "🫀",
      title: "You didn't let go.",
      subtitle: "60 seconds",
      wishes: ["most people let go by now 💗","you didn't believe me. good ✨","top 12% of everyone who tried 🫀"],
      closingEmoji: "💗",
      closingSubtext: "still holding",
    },
  },
};
