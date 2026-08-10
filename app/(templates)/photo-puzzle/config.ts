import { Puzzle, Mail, Music, Hand, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "photo-puzzle",
  type: "love",
  category: "gf",
  title: "The Last Piece",
  description:
    "A photo jigsaw where every piece you place reveals a line of a letter and plays a note — and the final piece isn't in the box. You have it.",
  coverImage:
    templateMedia("photo-puzzle", "cover.jpg"),
  emoji: "🧩",
  color: "from-indigo-500 to-rose-400",
  previewText: "I have the last piece. ask me for it 🧩",
  bodyText:
    "Twelve pieces, twelve lines, twelve notes. Nothing can be placed wrong. The twelfth piece is released by you, live, while they watch.",
  bgGradient: "from-indigo-50 via-rose-50 to-white",
  tabs: [
    { id: "photo", icon: Puzzle, label: "Photo" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "melody", icon: Music, label: "Melody" },
    { id: "final", icon: Hand, label: "Last Piece" },
    { id: "reveal", icon: Sparkles, label: "Reveal" },
  ],
  navActiveColor: "text-indigo-600",
  navActiveBg: "bg-indigo-600/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Twelve pieces. Eleven of them are yours.",
      ctaText: "Start the puzzle",
      floatingEmojis: ["🧩", "💌", "🎵", "✨", "💗"],
    },
    letter: {
      headerEmoji: "💌",
      title: "The letter, in pieces",
      greeting: "One line at a time,",
      decorEmojis: ["🧩", "🎵", "💗"],
    },
    final: {
      headerEmoji: "🧩",
      title: "Complete",
      subtitle: "you got the last piece",
      wishes: [
        "Nothing was ever placed wrong 🧩",
        "Every piece paid you a line 💌",
        "The last one was always going to be mine to give 💗",
      ],
      closingEmoji: "🧩",
      closingSubtext: "SubhSandesh",
    },
  },
};
