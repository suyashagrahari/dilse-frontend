import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card: three phones from the design (the sealed envelope, the hero arch, a celebration card), 1080×1350,
// served from the media CDN with its @360w/@540w/@720w variants (the gallery card asks for those).
export const config: TemplatePageConfig = {
  slug: "sikh-wedding-invitation",
  type: "sikh-wedding-invitation",
  category: "wedding",
  title: "Anand Karaj Wedding Invitation ☬ — Sikh Wedding, Every Function",
  description:
    "A Sikh wedding invitation in ivory and gold: guests break a wax seal on an envelope addressed to them, and the card opens onto the arch over Sri Guru Granth Sahib Ji with Ik Onkar in gold foil. Then every function from the Roka and Akhand Path to the Jaggo, the four Laavan and the Doli, with maps and dress codes, English and Punjabi (Gurmukhi) side by side, 40 photos, RSVP per function, who to call, a blessings wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/faith-sikh/cover.webp`,
  emoji: "🌼",
  color: "from-amber-100 to-yellow-200",
  previewText: "an Anand Karaj invitation, just for you 🌼",
  bodyText: "Ik Onkar, the Laavan and every function, one link.",
  bgGradient: "from-amber-50 via-yellow-50 to-orange-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-amber-800",
  navActiveBg: "bg-amber-700/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "ivory, gold and the four Laavan 🌼", ctaText: "Open", floatingEmojis: ["🌼", "🤍", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "🤍", "🌼"] },
    final: {
      headerEmoji: "🌼",
      title: "Anand Karaj",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🌼",
      closingSubtext: "SubhSandesh",
    },
  },
};
