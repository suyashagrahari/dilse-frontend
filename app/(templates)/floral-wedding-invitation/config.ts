import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card. The cover is three phones from the current design (the sealed
// envelope, the hero on the swing, a celebration card) on the template's paper,
// 1080×1350. Like the rest of the template's art, it is served from the media CDN, with its @360w/@540w/@720w variants next to it (the
// gallery card asks for those). public/wedding-v3 keeps the original.
export const config: TemplatePageConfig = {
  slug: "floral-wedding-invitation",
  type: "floral-wedding-invitation",
  category: "wedding",
  title: "Pampas & Peony Wedding Invitation ✦ — Boho Floral, Every Function",
  description:
    "A boho floral wedding invitation on handmade paper: guests break a wax seal on an envelope addressed to them, the card unfolds, pampas grass sways and the couple swings under a floral drape while gold line-art draws itself. Then every function with maps and dress codes, 40 photos you can resize, RSVP per function, who to call, a blessings wall and a downloadable card. Champagne, blush or powder; the AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/template3/fw-cover-floral.webp`,
  emoji: "🌸",
  color: "from-stone-200 to-rose-200",
  previewText: "a floral invitation, just for you 🌸",
  bodyText: "Pampas, peonies, a swing and every function, one link.",
  bgGradient: "from-stone-50 via-amber-50 to-rose-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-rose-800",
  navActiveBg: "bg-rose-700/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "pampas, peonies and a promise 🌸", ctaText: "Open", floatingEmojis: ["🌸","🤍","✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["🪔", "✨", "🌼"] },
    final: {
      headerEmoji: "🌸",
      title: "Shubh Vivah",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🪔",
      closingSubtext: "SubhSandesh",
    },
  },
};
