import { Sparkles, Images, HelpCircle, PartyPopper, Heart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "proposal",
  type: "love",
  category: "gf",
  // Matches the SEO title in lib/seo-data.ts and the words in the artwork itself,
  // so the gallery card, the search result and the page all say the same thing.
  title: "Will You Marry Me?",
  description:
    "A proposal they can't say no to — a scrapbook of your story, then a YES button that grows every time they dodge.",
  emoji: "💍",
  color: "from-pink-500 to-violet-500",
  previewText: "I have something to ask you 💍",
  bodyText:
    "Your memories as polaroids, one big question, and a “No” button that keeps running away. Ends with a secret note only they can read.",
  bgGradient: "from-pink-50 via-rose-50 to-white",
  coverImage: "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/proposal/cover.jpg",
  tabs: [
    { id: "gate", icon: Sparkles, label: "Surprise" },
    { id: "memories", icon: Images, label: "Memories" },
    { id: "ask", icon: HelpCircle, label: "The Ask" },
    { id: "celebration", icon: PartyPopper, label: "Yes!" },
    { id: "note", icon: Heart, label: "Secret Note" },
  ],
  navActiveColor: "text-pink-600",
  navActiveBg: "bg-pink-500/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "There's something I've been meaning to ask you.",
      ctaText: "Open your surprise",
      floatingEmojis: ["💍", "💗", "🌹", "✨", "💐"],
    },
    letter: {
      headerEmoji: "💌",
      title: "The Secret Note",
      greeting: "To my favourite person,",
      decorEmojis: ["💍", "💗", "🌹"],
    },
    final: {
      headerEmoji: "💖",
      title: "Officially Mine Forever",
      subtitle: "they said yes",
      wishes: [
        "Every ordinary morning, I'd still choose you 💗",
        "You're my calmest place and my loudest laugh 🌹",
        "Here's to all the days we haven't had yet ✨",
      ],
      closingEmoji: "💍",
      closingSubtext: "asked, answered & sealed",
    },
  },
};
