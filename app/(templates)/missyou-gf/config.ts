import { Mail, Clock, Heart, Sparkles, MoreHorizontal } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

// Consumed by data/template-registry.ts (gallery card) and the BottomNav.
// The night-layer visual tokens live in components/theme.ts.
export const config: TemplatePageConfig = {
  slug: "missyou-gf",
  type: "missyou-gf",
  category: "gf",
  title: "Miss You",
  description:
    "A cozy, starry 'I miss you' web-gift for your partner when you're apart — a sealed letter, a reunion countdown, memories, a scratch-off secret and 'Open When…' notes.",
  emoji: "🤍",
  color: "from-rose-400 to-rose-700",
  previewText: "A letter for you 💌",
  bodyText:
    "A handmade little corner — break the wax seal on my letter, count down to when I hold you again, scratch a secret, and open the notes I left for your hard days.",
  bgGradient: "from-rose-100 via-orange-50 to-rose-50",
  coverImage: "/assets/TemplateComingSoon/missyou1.webp",
  // Mobile BottomNav — 5 slots (Cover · Letter · Distance · Memories · More).
  tabs: [
    { id: "cover", icon: Mail, label: "Cover" },
    { id: "letter", icon: Heart, label: "Letter" },
    { id: "distance", icon: Clock, label: "Distance" },
    { id: "memories", icon: Sparkles, label: "Memories" },
    { id: "more", icon: MoreHorizontal, label: "More" },
  ],
  navActiveColor: "text-indigo-300",
  navActiveBg: "bg-indigo-500/20",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "A little letter for the one I miss tonight.",
      ctaText: "Tap to open",
      floatingEmojis: ["✨", "🤍", "💫", "🌙", "💗"],
    },
    letter: {
      headerEmoji: "💌",
      title: "I Miss You",
      greeting: "Hey you,",
      decorEmojis: ["🌙", "✨", "🤍"],
    },
    final: {
      headerEmoji: "🤍",
      title: "Send it back",
      subtitle: "one day closer",
      wishes: [
        "Every day is one day closer to holding you again 🤍",
        "Distance is just a number — you're always with me ✨",
        "Reply and tell me you felt this 💗",
      ],
      closingEmoji: "💫",
      closingSubtext: "made for you, from a quiet night",
    },
  },
};
