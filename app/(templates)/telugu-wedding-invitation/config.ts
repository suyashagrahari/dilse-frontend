import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card: three phones from the design (the sealed envelope, the hero arch, a celebration card), 1080×1350,
// served from the media CDN with its @360w/@540w/@720w variants (the gallery card asks for those).
export const config: TemplatePageConfig = {
  slug: "telugu-wedding-invitation",
  type: "telugu-wedding-invitation",
  category: "wedding",
  title: "Telugu Pelli Wedding Invitation 🌺 — Telugu Wedding, Every Function",
  description:
    "A Telugu wedding invitation in kumkum red and turmeric gold: guests break a wax seal and the card opens onto a Golconda Kalamkari, with Shri Ganesha in gold. Every function from the Nischitartham and Pellikuthuru to the Kasi Yatra, the Jeelakarra Bellam muhurtham and the Talambralu, with maps and dress codes, English and Telugu side by side, 40 photos, RSVP per function and a blessings wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/faith-south/te-cover1.webp`,
  emoji: "🌺",
  color: "from-amber-100 to-red-200",
  previewText: "a Telugu wedding invitation, just for you 🌺",
  bodyText: "Srirastu Subhamastu, every function, one link.",
  bgGradient: "from-amber-50 via-orange-50 to-red-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-red-900",
  navActiveBg: "bg-red-800/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "kumkum, pasupu and gold 🌺", ctaText: "Open", floatingEmojis: ["🌺", "🤍", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "🤍", "🌺"] },
    final: {
      headerEmoji: "🌺",
      title: "Pelli",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🌺",
      closingSubtext: "SubhSandesh",
    },
  },
};
