import { Flower2, Palette, ScrollText, Heart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { media } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/theme.ts + components/bouquet.css.
export const config: TemplatePageConfig = {
  slug: "bouquet-gf",
  type: "bouquet-gf",
  category: "gf",
  title: "Build a Bouquet",
  description:
    "Hand-tie a digital flower bouquet for your girlfriend — pick your blooms, style the arrangement, write a card, seal it with a playful Deed of Devotion, and send the link.",
  emoji: "💐",
  color: "from-pink-400 to-violet-500",
  previewText: "You've got flowers 💐",
  bodyText:
    "A gen-z digital florist: choose from 12 blooms in colour or black-&-white, reshuffle the arrangement, add a note and a Deed of Devotion, then send a link that blooms open when she taps it.",
  bgGradient: "from-pink-100 via-amber-50 to-violet-100",
  coverImage: media("bouquet-gf/cover.webp"),
  tabs: [
    { id: "bouquet", icon: Flower2, label: "Bouquet" },
    { id: "style", icon: Palette, label: "Style" },
    { id: "card", icon: Heart, label: "Card" },
    { id: "deed", icon: ScrollText, label: "Deed" },
  ],
  navActiveColor: "text-pink-500",
  navActiveBg: "bg-pink-500/15",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "A bouquet, hand-tied just for you.",
      ctaText: "Tap to open",
      floatingEmojis: ["💐", "🌸", "🌷", "✿", "💖"],
    },
    letter: {
      headerEmoji: "💐",
      title: "For you",
      greeting: "Dear you,",
      decorEmojis: ["🌸", "🌿", "✿"],
    },
    final: {
      headerEmoji: "💖",
      title: "Sent with love",
      subtitle: "just because",
      wishes: [
        "Every bloom in here is a little reason I adore you 💐",
        "No occasion — you're the occasion 🌸",
        "Keep these somewhere you'll see them and smile ✿",
      ],
      closingEmoji: "💖",
      closingSubtext: "made for you, with love",
    },
  },
};
