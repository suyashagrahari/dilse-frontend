import { BookOpen, Wind, Gamepad2, Mail, Stamp } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the buttercream "Birthday Storybook" poster
// (source: media-src/templates/birthday-premium/cover-poster.webp + @360w/@540w/@720w;
// uploaded to cdn.subhsandesh.in/gifts-media/templates/birthday-premium/).
export const config: TemplatePageConfig = {
  slug: "birthday-premium",
  type: "birthday",
  category: "gf",
  title: "Birthday Surprise ✦ Premium — a pop-up birthday storybook",
  description:
    "A premium birthday storybook they play: peel the cover open, blow a dandelion of wishes, ride a hot-air balloon over your story, win reasons from a claw machine, develop a photo-booth strip, bake a cake, scratch a golden ticket and get a stamped birthday passport. Four pastel looks.",
  coverImage: templateMedia("birthday-premium", "cover-poster.webp"),
  emoji: "📖",
  color: "from-amber-200 to-rose-400",
  previewText: "someone made you a birthday storybook 📖",
  bodyText: "Peel it open, make a wish, blow the dandelion.",
  bgGradient: "from-amber-50 via-rose-50 to-pink-100",
  tabs: [
    { id: "open", icon: BookOpen, label: "Open" },
    { id: "wish", icon: Wind, label: "Wish" },
    { id: "play", icon: Gamepad2, label: "Play" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "passport", icon: Stamp, label: "Passport" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "someone made you a birthday storybook 📖", ctaText: "Open", floatingEmojis: ["📖", "🎈", "🌼"] },
    letter: { headerEmoji: "💌", title: "The last chapter", greeting: "Happy birthday,", decorEmojis: ["🎈", "🌼", "✨"] },
    final: {
      headerEmoji: "🛂",
      title: "Your birthday passport",
      subtitle: "Stamped, approved, loved",
      wishes: ["Made just for you 📖", "Open it again anytime 🎈", "Make one for your own person ✨"],
      closingEmoji: "📖",
      closingSubtext: "SubhSandesh",
    },
  },
};
