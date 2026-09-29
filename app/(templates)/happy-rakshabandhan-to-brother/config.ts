import { Heart, Gift, Sparkles, Images } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/theme.ts + components/rakhi.css.
//
// Note the spelling split: the SLUG is "rakshabandhan" (one word, chosen
// deliberately), but every piece of human-readable copy below — title,
// description, headings — uses the correct "Raksha Bandhan". Search engines
// weight the title and description far above the URL, so the correctly spelled
// form is the one that actually gets indexed.
export const config: TemplatePageConfig = {
  slug: "happy-rakshabandhan-to-brother",
  type: "raksha-bandhan",
  // Groups with Holi and Eid — the axis people browse by for a dated festival,
  // rather than "family", which describes the audience and not the occasion.
  category: "festival",
  title: "Happy Raksha Bandhan",
  description:
    "Tie a rakhi to your brother from anywhere. He performs the whole ritual on his phone — tilak, mithai, aarti, the thread — then writes his promise back to you. Add your photo, your memories, and your UPI for shagun.",
  emoji: "🪢",
  color: "from-amber-400 to-red-600",
  previewText: "Your sister tied you a rakhi 🪢",
  bodyText:
    "A Raksha Bandhan page for the years you can't be in the same room. He taps through the full puja — tilak, sweet, aarti, and the rakhi itself — asks for his gift, and sends you back a promise. Download the card for your story.",
  bgGradient: "from-amber-100 via-orange-50 to-red-100",
  coverImage: templateMedia("happy-rakshabandhan-to-brother", "cover-poster.webp"),
  tabs: [
    { id: "bhai", icon: Heart, label: "Bhai" },
    { id: "rakhi", icon: Sparkles, label: "Rakhi" },
    { id: "memories", icon: Images, label: "Memories" },
    { id: "shagun", icon: Gift, label: "Shagun" },
  ],
  navActiveColor: "text-red-700",
  navActiveBg: "bg-red-700/15",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Your sister tied you a rakhi.",
      ctaText: "Open it",
      floatingEmojis: ["🪢", "🌼", "✨", "🪔", "❤️"],
    },
    letter: {
      headerEmoji: "🪢",
      title: "Raksha Bandhan",
      greeting: "Bhai,",
      decorEmojis: ["🌼", "🪔", "✦"],
    },
    final: {
      headerEmoji: "❤️",
      title: "Rakhi tied",
      subtitle: "same as every year",
      wishes: [
        "Distance never untied anything 🪢",
        "You're still the one I'd call first 🪔",
        "Same thread, same promise 🌼",
      ],
      closingEmoji: "❤️",
      closingSubtext: "happy raksha bandhan",
    },
  },
};
