import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the pastel "I'm sorry" poster
// (source: media-src/templates/sorry/cover-poster.webp; upload it with
// `cd server && npm run upload:template-media -- --only=sorry`).
export const config: TemplatePageConfig = {
  slug: "sorry",
  type: "sorry",
  category: "sorry",
  title: "I'm Sorry — a cute forgive-me page",
  description:
    "Say sorry the cute way: a sealed envelope, a “how upset are you?” bear, guilt bubbles they pop, a pinky promise, make-it-up coupons and “Forgive me?” with a No that runs away. Six pastel looks.",
  coverImage: templateMedia("sorry", "cover-poster.webp"),
  emoji: "🥺",
  color: "from-pink-300 to-rose-400",
  previewText: "someone is very, very sorry 🥺",
  bodyText: "Please open this before you stay mad.",
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
    cover: { subtitle: "someone is very, very sorry 🥺", ctaText: "Open", floatingEmojis: ["🥺", "💗", "🫧"] },
    letter: { headerEmoji: "💌", title: "I wrote you a letter", greeting: "Hey you,", decorEmojis: ["💗", "🫧", "✨"] },
    final: {
      headerEmoji: "💗",
      title: "Officially Forgiven",
      subtitle: "Made with love (and a lot of puppy eyes)",
      wishes: ["Made just for you 💗", "Open it again anytime 🫧", "Make one for your own person ✨"],
      closingEmoji: "🥺",
      closingSubtext: "SubhSandesh",
    },
  },
};
