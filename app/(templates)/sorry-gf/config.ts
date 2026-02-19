import { Heart, Mail, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "sorry-gf",
  type: "sorry",
  category: "gf",
  title: "I'm Sorry",
  description: "A sincere apology to make things right",
  emoji: "🥺",
  color: "from-sky to-lavender",
  previewText: "I'm Truly Sorry 🥺",
  bodyText:
    "I know I messed up, and I'm so sorry for hurting you. You deserve the world, and I promise to do better. Please forgive me — my heart aches without your smile.",
  bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
  tabs: [
    { id: "cover", icon: Heart, label: "Message" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "final", icon: Gift, label: "More" },
  ],
  navActiveColor: "text-primary",
  navActiveBg: "bg-primary/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "I have something to say...",
      ctaText: "Read More",
      floatingEmojis: ["💙", "🥺", "💫", "✨", "🌙"],
    },
    letter: {
      headerEmoji: "💌",
      title: "From My Heart",
      greeting: "My Love,",
      decorEmojis: ["💙", "💫", "💙"],
    },
    final: {
      headerEmoji: "🤝",
      title: "My Promises",
      subtitle: "I mean every word",
      wishes: [
        "I promise to listen more carefully 💙",
        "I'll always be honest with you 🤞",
        "Your happiness means everything to me ✨",
        "I'll work harder to be better 💪",
      ],
      closingEmoji: "💙",
      closingSubtext: "Please forgive me",
    },
  },
};
