import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card: three phones from the design (the sealed envelope, the hero arch, a celebration card), 1080×1350,
// served from the media CDN with its @360w/@540w/@720w variants (the gallery card asks for those).
export const config: TemplatePageConfig = {
  slug: "kannada-wedding-invitation",
  type: "kannada-wedding-invitation",
  category: "wedding",
  title: "Kannada Maduve Wedding Invitation 🌸 — Kannada Wedding, Every Function",
  description:
    "A Kannada wedding invitation in Mysore-silk magenta and gold: guests break a wax seal and the card opens onto Srirangapatna across the Kaveri, with Shri Ganesha in gold and a Mysore silk border. Every function from the Nishchitartha and Arishina Shastra to the Kashi Yatre and the Dhare Muhurtha, with maps and dress codes, English and Kannada side by side, 40 photos, RSVP per function and a blessings wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/faith-south/kn-cover1.webp`,
  emoji: "🌸",
  color: "from-pink-100 to-fuchsia-200",
  previewText: "a Kannada wedding invitation, just for you 🌸",
  bodyText: "Shubhamastu, every function, one link.",
  bgGradient: "from-pink-50 via-rose-50 to-amber-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-fuchsia-900",
  navActiveBg: "bg-fuchsia-800/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "Mysore silk, gold and jasmine 🌸", ctaText: "Open", floatingEmojis: ["🌸", "🤍", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "🤍", "🌸"] },
    final: {
      headerEmoji: "🌸",
      title: "Maduve",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🌸",
      closingSubtext: "SubhSandesh",
    },
  },
};
