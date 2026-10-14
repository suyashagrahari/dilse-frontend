import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card (✦ premium). The cover is the "After the Rain" poster
// (source: media-src/templates/sorry-premium/cover-poster.webp + @360w/@540w/@720w).
export const config: TemplatePageConfig = {
  slug: "sorry-premium",
  type: "sorry-premium",
  category: "gf",
  title: "I'm Sorry ✦ Premium — After the Rain",
  description:
    "The premium apology: a little umbrella bear knocks at their door, they water a wilted flower until it blooms, mend a cracked heart, crack fortune cookies, shake a jar of paper stars, sail your letter across a puddle and sign a peace contract, while the rain clears into a rainbow. Four pastel skies.",
  coverImage: templateMedia("sorry-premium", "cover-poster.webp"),
  emoji: "🌦️",
  color: "from-pink-300 to-rose-400",
  previewText: "someone is sorry, and it's raining a little 🌧️",
  bodyText: "Open the door. Let the rain clear.",
  bgGradient: "from-pink-50 via-rose-100 to-pink-200",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "ask", icon: Heart, label: "Forgive" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "someone is sorry, and it's raining a little 🌧️", ctaText: "Open the door", floatingEmojis: ["☔", "🌷", "🌈"] },
    letter: { headerEmoji: "💌", title: "I wrote you a letter", greeting: "Hey you,", decorEmojis: ["☂️", "🌷", "✨"] },
    final: {
      headerEmoji: "💗",
      title: "The Peace Treaty",
      subtitle: "Signed after the rain",
      wishes: ["Made just for you 💗", "Open it again anytime 🌈", "Make one for your own person ✨"],
      closingEmoji: "🌈",
      closingSubtext: "SubhSandesh",
    },
  },
};
