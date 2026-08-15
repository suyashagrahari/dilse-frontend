import { Heart, HandHeart, Gamepad2, PenLine, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "apology-dashboard",
  type: "sorry",
  category: "gf",
  title: "Apology Dashboard",
  description:
    "A cute interactive apology — an anger-o-meter, a whack game, a scratch-card secret, sweet bribery & a will-you-forgive-me finale.",
  emoji: "🥺",
  color: "from-pink-400 to-rose-600",
  previewText: "I'm really, really sorry 🥺",
  bodyText:
    "I built this whole little world just to say it. Play, scratch, whack, forgive — take your time.",
  bgGradient: "from-rose-50 via-pink-50 to-white",
  coverImage: "https://cdn.subhsandesh.in/gifts-media/assets/hero-bg.webp",
  tabs: [
    { id: "home", icon: Heart, label: "Sorry" },
    { id: "meter", icon: Sparkles, label: "Meter" },
    { id: "game", icon: Gamepad2, label: "Game" },
    { id: "bribes", icon: HandHeart, label: "Bribes" },
    { id: "forgive", icon: PenLine, label: "Forgive" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "A little interactive apology, just for you.",
      ctaText: "Open my apology",
      floatingEmojis: ["💖", "💕", "🌸", "✨", "💗"],
    },
    letter: {
      headerEmoji: "💌",
      title: "I'm Sorry",
      greeting: "Hey you,",
      decorEmojis: ["🌸", "💗", "🥺"],
    },
    final: {
      headerEmoji: "💝",
      title: "Will you forgive me?",
      subtitle: "100% love",
      wishes: [
        "I'll do better, every single day 💗",
        "You mean more to me than being right ever could 🥺",
        "Thank you for giving us another chance 💕",
      ],
      closingEmoji: "💖",
      closingSubtext: "made with love",
    },
  },
};
