import { Heart, Mail, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "sorry-friend",
  type: "sorry",
  category: "friend",
  title: "My Apologies",
  description: "Say sorry to your friend with sincerity",
  emoji: "😔",
  color: "from-mint to-lavender",
  previewText: "I Owe You An Apology 😔",
  bodyText:
    "Our friendship means the world to me, and I hate that I let you down. I'm truly sorry. Can we get past this? I miss our good times together.",
  bgGradient: "from-green-50 via-teal-50 to-cyan-50",
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
      subtitle: "I need to tell you something...",
      ctaText: "Read More",
      floatingEmojis: ["🌿", "💚", "✨", "🌙", "💫"],
    },
    letter: {
      headerEmoji: "💌",
      title: "To My Friend",
      greeting: "Hey Friend,",
      decorEmojis: ["🌿", "💫", "🌿"],
    },
    final: {
      headerEmoji: "🤝",
      title: "Let's Fix This",
      subtitle: "Our friendship matters",
      wishes: [
        "I miss our crazy conversations 💚",
        "You're irreplaceable in my life 🌟",
        "I'll make it up to you ✨",
        "Let's create new memories together 🤝",
      ],
      closingEmoji: "💚",
      closingSubtext: "Friends forever?",
    },
  },
};
