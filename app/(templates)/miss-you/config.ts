import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the night-sky "I miss you" poster
// (source: media-src/templates/miss-you/cover-poster.webp, with @360w/@540w/@720w
// variants; uploaded to s3://subhsandesh-prod/gifts-media/templates/miss-you/).
export const config: TemplatePageConfig = {
  slug: "miss-you",
  type: "missyou",
  category: "gf",
  title: "I Miss You — a cute long-distance love page",
  description:
    "Tell them you miss them, the cute way: an incoming love call, your two cities on a map, a countdown to the day you meet, a jar of little things, open-when letters, a hug across the map and a “See you soon” boarding pass. Four dreamy looks.",
  coverImage: templateMedia("miss-you", "cover-poster.webp"),
  emoji: "🥹",
  color: "from-indigo-400 to-pink-400",
  previewText: "someone misses you a lot 🥹",
  bodyText: "Pick up, it's a love call.",
  bgGradient: "from-indigo-50 via-violet-100 to-pink-100",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "ask", icon: Heart, label: "Call?" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-pink-500",
  navActiveBg: "bg-pink-500/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "someone misses you a lot 🥹", ctaText: "Pick up", floatingEmojis: ["🥹", "💗", "✈️"] },
    letter: { headerEmoji: "💌", title: "A paper plane for you", greeting: "Hey you,", decorEmojis: ["💗", "🌙", "✨"] },
    final: {
      headerEmoji: "🎫",
      title: "See you soon",
      subtitle: "Made with love (from a few hundred km away)",
      wishes: ["Made just for you 💗", "Open it again anytime 🌙", "Make one for your own person ✨"],
      closingEmoji: "🥹",
      closingSubtext: "SubhSandesh",
    },
  },
};
