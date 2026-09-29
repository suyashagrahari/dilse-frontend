import { Puzzle, Mail, Camera, Palette, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "photo-puzzle",
  type: "love",
  category: "gf",
  title: "The Last Piece",
  description:
    "Your photo, cut into a sliding-tile puzzle (3×3, 4×4 or 5×5). When they solve it, the last piece flies in, confetti pops, and your memories and love letter unlock.",
  coverImage:
    templateMedia("photo-puzzle", "cover-v2.webp"),
  emoji: "🧩",
  color: "from-orange-400 to-rose-500",
  previewText: "I cut us into pieces. put us back together 🧩",
  bodyText:
    "Slide the tiles back into place. The last piece is kept until the picture is whole — then it flies in and the memories and your letter open.",
  bgGradient: "from-orange-50 via-rose-50 to-white",
  tabs: [
    { id: "puzzle", icon: Puzzle, label: "Puzzle" },
    { id: "vibe", icon: Palette, label: "Vibe" },
    { id: "memories", icon: Camera, label: "Memories" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "reveal", icon: Sparkles, label: "Reveal" },
  ],
  navActiveColor: "text-rose-600",
  navActiveBg: "bg-rose-600/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Every piece but one. The last one's mine to give.",
      ctaText: "Start the puzzle",
      floatingEmojis: ["🧩", "💌", "📸", "✨", "💗"],
    },
    letter: {
      headerEmoji: "💌",
      title: "The last piece",
      greeting: "Now that you've put us together,",
      decorEmojis: ["🧩", "📸", "💗"],
    },
    final: {
      headerEmoji: "🧩",
      title: "Complete",
      subtitle: "you got the last piece",
      wishes: [
        "Every tile back where it belongs 🧩",
        "The last piece flew in 💌",
        "Turns out it was you all along 💗",
      ],
      closingEmoji: "🧩",
      closingSubtext: "SubhSandesh",
    },
  },
};
