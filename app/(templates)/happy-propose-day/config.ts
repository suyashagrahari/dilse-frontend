import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the day's own scene, captured from the live page
// (source: media-src/templates/happy-propose-day/cover-v2.webp).
export const config: TemplatePageConfig = {
  slug: "happy-propose-day",
  type: "valentine",
  category: "gf",
  title: "Propose Day — The Little Velvet Box",
  description:
    'A velvet ring box, your speech, a scratch-to-reveal question and a No that runs away — you hear the YES.',
  coverImage: templateMedia("happy-propose-day", "cover-v2.webp"),
  emoji: "💍",
  color: "from-purple-900 to-amber-500",
  previewText: 'i have something to ask you 💍',
  bodyText: 'The proposal set-up, without the ₹15,000.',
  bgGradient: "from-purple-50 via-rose-50 to-amber-50",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "love", icon: Heart, label: "Love" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-amber-600",
  navActiveBg: "bg-amber-600/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: 'i have something to ask you 💍', ctaText: "Open", floatingEmojis: ["💍", "💗", "✨"] },
    letter: { headerEmoji: "💍", title: "A letter for you", greeting: "Hey you,", decorEmojis: ["💍", "💌", "✨"] },
    final: {
      headerEmoji: "💍",
      title: "Happy Propose Day",
      subtitle: "Made with love",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Send one back 💌"],
      closingEmoji: "💍",
      closingSubtext: "SubhSandesh",
    },
  },
};
