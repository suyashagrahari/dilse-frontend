import { Radio, Mic, Disc3, ScrollText, Share2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "dedication",
  type: "love",
  category: "gf",
  title: "Dedication",
  description:
    "A radio show made for one person. They tune the dial through static to your station — your photos drift across the reel, your songs and videos play on its screen, your voice introduces them, and a sealed love letter opens at the end.",
  coverImage: templateMedia("dedication", "cover-poster.webp"),
  emoji: "📻",
  color: "from-orange-700 to-red-900",
  previewText: "98.3 — this one goes out to you 📻",
  bodyText:
    "Tune the dial through real static. Photos with little letters, love songs and your own videos on the screen, your voice between them — and a love letter that only opens once they find the station.",
  bgGradient: "from-orange-50 via-amber-50 to-white",
  tabs: [
    { id: "station", icon: Radio, label: "The Station" },
    { id: "booth", icon: Mic, label: "Recording Booth" },
    { id: "songs", icon: Disc3, label: "The Songs" },
    { id: "signoff", icon: ScrollText, label: "Sign-Off" },
    { id: "share", icon: Share2, label: "Share" },
  ],
  navActiveColor: "text-orange-800",
  navActiveBg: "bg-orange-800/10",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Find the station. It's playing for you.",
      ctaText: "Tune in",
      floatingEmojis: ["📻", "🎶", "✧", "📡", "🎙️"],
    },
    letter: {
      headerEmoji: "🎙️",
      title: "On Air",
      greeting: "Coming up next,",
      decorEmojis: ["📻", "🎶", "📡"],
    },
    final: {
      headerEmoji: "📻",
      title: "That's the show",
      subtitle: "signing off",
      wishes: [
        "The static is generated live, not a recording 📡",
        "That was actually my voice 🎙️",
        "Same frequency, whenever you want 📻",
      ],
      closingEmoji: "📻",
      closingSubtext: "SubhSandesh",
    },
  },
};
