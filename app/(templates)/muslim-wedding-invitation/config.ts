import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card: three phones from the design (the sealed envelope, the hero arch, a celebration card), 1080×1350,
// served from the media CDN with its @360w/@540w/@720w variants (the gallery card asks for those).
export const config: TemplatePageConfig = {
  slug: "muslim-wedding-invitation",
  type: "muslim-wedding-invitation",
  category: "wedding",
  title: "Nikah Wedding Invitation ☪ — Muslim Wedding, Every Function",
  description:
    "A Muslim wedding invitation under a sage-and-gold Mughal arch: guests break a wax seal on an envelope addressed to them, gold lanterns glow and the Bismillah opens the card, the couple seated at its foot. Then every function from the Mangni and Manjha to the Mehndi, the Nikah, the Rukhsati and the Walima, with maps and dress codes, English and Urdu side by side, 40 photos, RSVP per function and a duas wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/faith-nikah/cover3.webp`,
  emoji: "🌙",
  color: "from-emerald-100 to-stone-200",
  previewText: "a Nikah invitation, just for you 🌙",
  bodyText: "The Bismillah, the Nikah and the Walima, one link.",
  bgGradient: "from-stone-50 via-emerald-50 to-amber-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-emerald-900",
  navActiveBg: "bg-emerald-800/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "a Mughal arch, lanterns and duas 🌙", ctaText: "Open", floatingEmojis: ["🌙", "🤍", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "🤍", "🌙"] },
    final: {
      headerEmoji: "🌙",
      title: "Nikah Mubarak",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🌙",
      closingSubtext: "SubhSandesh",
    },
  },
};
