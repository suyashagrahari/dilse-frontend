import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the golden-hour invitation poster (source:
// media-src/templates/proposal-premium/cover-poster.webp, with
// @360w/@540w/@720w variants on the CDN next to it).
export const config: TemplatePageConfig = {
  slug: "proposal-premium",
  type: "love",
  category: "gf",
  title: "The Proposal ✦ Premium — a fairytale proposal page",
  description:
    "Propose in a pastel garden at golden hour: a wax-sealed invitation, string lights that spell your line, a carousel of your story, a love lock with your days together, a flower of reasons, a ring box and “Will you be mine?”. Ends with an Officially Ours certificate and a save-the-date.",
  coverImage: templateMedia("proposal-premium", "cover-poster.webp"),
  emoji: "💍",
  color: "from-rose-200 to-amber-300",
  previewText: "you're invited 💌",
  bodyText: "Someone has a question for you.",
  bgGradient: "from-rose-50 via-amber-50 to-rose-100",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "ask", icon: Heart, label: "Ask" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "you're invited 💌", ctaText: "Open", floatingEmojis: ["💍", "🌷", "✨"] },
    letter: { headerEmoji: "💌", title: "A letter, tied with a ribbon", greeting: "Dear you,", decorEmojis: ["🌷", "💗", "✨"] },
    final: {
      headerEmoji: "💍",
      title: "Officially Ours",
      subtitle: "A garden, a carousel, and one very big question",
      wishes: ["Made just for you 💗", "Open it again anytime 💍", "Make one for your own person ✨"],
      closingEmoji: "💍",
      closingSubtext: "SubhSandesh",
    },
  },
};
