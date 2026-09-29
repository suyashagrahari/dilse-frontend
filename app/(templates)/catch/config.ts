import { Gamepad2, Heart, Mail, Trophy, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "catch",
  type: "love",
  category: "gf",
  title: "Catch",
  description:
    "A cute arcade game made of your love letter. Their face is the player: catch the falling letter pieces, memory polaroids and hearts, dodge the ick, level up — then the letter stacks itself together.",
  coverImage: templateMedia("catch", "cover-poster.webp"),
  emoji: "🎮",
  color: "from-pink-500 to-violet-600",
  previewText: "i made you a game. catch it 🎮",
  bodyText:
    "Combos, power-ups, three levels and a high score — and every piece they miss comes back around.",
  bgGradient: "from-sky-50 via-pink-50 to-violet-50",
  tabs: [
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "items", icon: Heart, label: "Memories" },
    { id: "flags", icon: Gamepad2, label: "Dodge" },
    { id: "result", icon: Trophy, label: "Result" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-pink-600",
  navActiveBg: "bg-pink-600/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Someone wrote you something. It's in pieces.",
      ctaText: "Catch it",
      floatingEmojis: ["🎮","💛","☕","✨","🧥"],
    },
    letter: {
      headerEmoji: "💛",
      title: "The letter, assembled",
      greeting: "Here's all of it,",
      decorEmojis: ["☕","🧥","🎧"],
    },
    final: {
      headerEmoji: "🏆",
      title: "You caught it.",
      subtitle: "Every line, in your hands",
      wishes: ["Nothing was ever locked 💛","A miss just meant 'not yet' ✨","One line may still be out there 🎮"],
      closingEmoji: "💛",
      closingSubtext: "SubhSandesh",
    },
  },
};
