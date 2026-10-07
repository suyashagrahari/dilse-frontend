import { Mail, Ghost, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the haunted house's poster
// (source: media-src/templates/happy-halloween/cover-poster.webp — upload it
// with `cd server && npm run upload:template-media -- --only=happy-halloween`).
export const config: TemplatePageConfig = {
  slug: "happy-halloween",
  type: "festival",
  category: "festival",
  title: "Happy Halloween — The Little Haunted House",
  description:
    "Knock on a tiny haunted house built just for them: carve a glowing pumpkin, read your letter by flashlight, brew a love potion, and ask “Will you be my boo?”",
  coverImage: templateMedia("happy-halloween", "cover-poster.webp"),
  emoji: "🎃",
  color: "from-orange-400 to-purple-700",
  previewText: "a little haunted house was built for you 🎃",
  bodyText: "Knock three times.",
  bgGradient: "from-purple-950 via-indigo-950 to-orange-950",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "boo", icon: Ghost, label: "Boo" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-orange-500",
  navActiveBg: "bg-orange-500/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "a little haunted house was built for you 🎃", ctaText: "Knock", floatingEmojis: ["🎃", "👻", "🦇"] },
    letter: { headerEmoji: "🕯️", title: "A letter in the dark", greeting: "Hey you,", decorEmojis: ["🎃", "👻", "✨"] },
    final: {
      headerEmoji: "🎃",
      title: "Happy Halloween",
      subtitle: "Made with love (and a little spookiness)",
      wishes: ["Made just for you 💜", "Open it again any night 🌙", "Boo someone back 👻"],
      closingEmoji: "👻",
      closingSubtext: "SubhSandesh",
    },
  },
};
