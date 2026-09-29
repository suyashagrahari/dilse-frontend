import { Gavel, Scale, HelpCircle, Stamp, Heart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "court-of-love",
  type: "love",
  category: "gf",
  title: "The Court of Love",
  description:
    "Put them on trial in the cutest way — 10 funny questions, a penguin judge, your photos as Exhibit A, B, C, a wax-sealed final judgement, and a signed stamp paper if they win.",
  emoji: "⚖️",
  color: "from-violet-500 to-pink-500",
  previewText: "You have been summoned to The Court of Love ⚖️",
  bodyText:
    "Ten questions. One penguin judge. Your memories filed as evidence, a sealed judgement read after the gavel — and a signed ₹100 stamp paper for the winner.",
  bgGradient: "from-violet-50 via-pink-50 to-white",
  coverImage: templateMedia("court-of-love", "cover-v2.webp"),
  tabs: [
    { id: "summons", icon: Scale, label: "Summons" },
    { id: "session", icon: Gavel, label: "Session" },
    { id: "hearings", icon: HelpCircle, label: "Questions" },
    { id: "verdict", icon: Heart, label: "Verdict & evidence" },
    { id: "stamp", icon: Stamp, label: "Stamp Paper" },
  ],
  navActiveColor: "text-violet-600",
  navActiveBg: "bg-violet-500/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Before this Court, all lovers are equal.",
      ctaText: "Enter the courtroom",
      floatingEmojis: ["⚖️", "💗", "🔨", "💌", "✨"],
    },
    letter: {
      headerEmoji: "💌",
      title: "The Final Judgement",
      greeting: "To the accused,",
      decorEmojis: ["⚖️", "💗", "📜"],
    },
    final: {
      headerEmoji: "📜",
      title: "Certified Best Partner",
      subtitle: "case won",
      wishes: [
        "Found guilty of being loved beyond all reasonable doubt 💗",
        "Sentenced to a lifetime of forehead kisses and stolen fries 🍟",
        "No appeal shall be entertained ⚖️",
      ],
      closingEmoji: "💗",
      closingSubtext: "duly signed, sealed & stamped",
    },
  },
};
