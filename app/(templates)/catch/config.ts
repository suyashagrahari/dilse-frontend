import { Gamepad2, Heart, Mail, Trophy, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "catch",
  type: "love",
  category: "gf",
  title: "Catch",
  description:
    "A letter that falls out of the sky one line at a time. They catch it with their own face. Nothing is ever locked — every catch just adds another line.",
  coverImage: templateMedia("catch", "cover.jpg"),
  emoji: "🎮",
  color: "from-sky-500 to-amber-600",
  previewText: "it's in pieces. catch it 🎮",
  bodyText:
    "Twelve objects, twelve lines, forty-five seconds. Miss one and it comes back around.",
  bgGradient: "from-sky-50 via-amber-50 to-white",
  tabs: [
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "items", icon: Heart, label: "Items" },
    { id: "flags", icon: Gamepad2, label: "Dodge" },
    { id: "result", icon: Trophy, label: "Result" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-sky-700",
  navActiveBg: "bg-sky-700/10",
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
