import { Crown, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

// Gallery card. The cover is the light sandstone gateway (a still of the
// opening), served from the repo (public/wedding-v3, never the CDN).
export const config: TemplatePageConfig = {
  slug: "royal-wedding-invitation",
  type: "royal-wedding-invitation",
  category: "wedding",
  title: "Royal Wedding Invitation ✦ — The Palace Experience",
  description:
    "A cinematic royal wedding invitation: palace gates open to shehnai, sandstone jaali screens slide apart as elephants bow and the brass toran sways, a gold-foil monogram, your story, up to eight functions with dress-code colours and per-function RSVP, 40 photos, an English and Hindi invitation, a blessings wall and a diya-lantern finale. Ivory sandstone, antique gold and soft maroon; the AI asks a few questions and writes it.",
  coverImage: "/wedding-v3/royal/cover-gate.webp",
  emoji: "👑",
  color: "from-amber-200 to-rose-300",
  previewText: "the palace gates open for you 👑",
  bodyText: "Gates, gold, shehnai and every function, one royal link.",
  bgGradient: "from-amber-50 via-orange-50 to-rose-100",
  tabs: [
    { id: "gates", icon: Crown, label: "Gates" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-amber-700",
  navActiveBg: "bg-amber-600/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "the palace gates are open 👑", ctaText: "Open", floatingEmojis: ["👑", "🪔", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["🪔", "✨", "🌼"] },
    final: {
      headerEmoji: "👑",
      title: "Shubh Vivah",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Directions to every venue", "Leave your blessings"],
      closingEmoji: "🪔",
      closingSubtext: "SubhSandesh",
    },
  },
};
