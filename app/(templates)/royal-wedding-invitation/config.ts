import { Crown, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the Royal Edition poster (source:
// media-src/templates/wedding/covers/royal-wedding-invitation/, on the CDN with
// its @360w/@540w/@720w sizes).
export const config: TemplatePageConfig = {
  slug: "royal-wedding-invitation",
  type: "royal-wedding-invitation",
  category: "wedding",
  title: "Royal Wedding Invitation ✦ — The Palace Experience",
  description:
    "A cinematic royal wedding invitation: palace gates open to shehnai, a gold-foil monogram, your story, up to eight functions with dress-code colours and per-function RSVP, 40 photos, an English and Hindi invitation, a blessings wall and a diya-lantern finale. Six foil-gold themes; the AI writes it.",
  coverImage: templateMedia("wedding", "covers/royal-wedding-invitation/cover-poster.webp"),
  emoji: "👑",
  color: "from-rose-900 to-amber-700",
  previewText: "the palace gates open for you 👑",
  bodyText: "Gates, gold, shehnai and every function, one royal link.",
  bgGradient: "from-rose-950 via-red-900 to-amber-900",
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
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🪔",
      closingSubtext: "SubhSandesh",
    },
  },
};
