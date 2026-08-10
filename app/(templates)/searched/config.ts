import { Search, ListTree, IdCard, FileText, Share2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "searched",
  type: "love",
  category: "gf",
  title: "Searched",
  description:
    "They type their own name into a search box and the internet has opinions. Joke autocomplete, a full results page about them, expandable answers, and a knowledge panel that is entirely too accurate.",
  coverImage:
    templateMedia("searched", "cover.jpg"),
  emoji: "🔍",
  color: "from-violet-600 to-indigo-700",
  previewText: "About 8,47,000 results (0.42 seconds) 🔍",
  bodyText:
    "The autocomplete lands the joke before they've even hit search. Every result opens. The last one is the real letter.",
  bgGradient: "from-violet-50 via-indigo-50 to-white",
  tabs: [
    { id: "suggestions", icon: Search, label: "Autocomplete" },
    { id: "results", icon: ListTree, label: "Results" },
    { id: "panel", icon: IdCard, label: "Knowledge Panel" },
    { id: "letter", icon: FileText, label: "The Letter" },
    { id: "share", icon: Share2, label: "Share" },
  ],
  navActiveColor: "text-violet-700",
  navActiveBg: "bg-violet-700/10",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Go on. Type your name.",
      ctaText: "Open the search",
      floatingEmojis: ["🔍", "✦", "·", "🔎", "✧"],
    },
    letter: {
      headerEmoji: "📄",
      title: "The Last Result",
      greeting: "Nobody clicks the last one,",
      decorEmojis: ["🔍", "📄", "✦"],
    },
    final: {
      headerEmoji: "🔍",
      title: "That's everything",
      subtitle: "about you, apparently",
      wishes: [
        "The autocomplete was the joke 🔍",
        "The last result was the point 📄",
        "No, I didn't mean anyone else ✦",
      ],
      closingEmoji: "🔎",
      closingSubtext: "SubhSandesh",
    },
  },
};
