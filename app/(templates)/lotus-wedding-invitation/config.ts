import { Sun, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card. The cover is the template's own opening (a lotus blooming in the pond, the owner's art). Like the rest of the template's
// art, it is served from the media CDN, with its @360w/@540w/@720w variants next to it (the
// gallery card asks for those). public/wedding-v3 keeps the original.
export const config: TemplatePageConfig = {
  slug: "lotus-wedding-invitation",
  type: "lotus-wedding-invitation",
  category: "wedding",
  title: "Lotus Temple Wedding Invitation ✦ — Lotus Pond, Gopuram & Brass Lamps",
  description:
    "A South Indian temple wedding invitation in white, gold and lotus pink: brass lamps glow, lotuses bloom from a temple pond, gold string lights frame a Shri Ganeshay Namah opening and the gopuram rises over your muhurtham, then every function with maps, 40 photos, RSVP per function and a blessings wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/lotus/cover-bloom.webp`,
  emoji: "🪷",
  color: "from-amber-100 to-pink-200",
  previewText: "the temple lamps are lit for you 🪷",
  bodyText: "Lotuses, brass lamps and every function, one link.",
  bgGradient: "from-amber-50 via-rose-50 to-teal-50",
  tabs: [
    { id: "gates", icon: Sun, label: "Temple" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-pink-800",
  navActiveBg: "bg-pink-700/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "the lamps are lit 🪷", ctaText: "Open", floatingEmojis: ["🪷","🪔","✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["🪔", "✨", "🌼"] },
    final: {
      headerEmoji: "🪷",
      title: "Shubh Vivah",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "A card for every function", "Leave your blessings"],
      closingEmoji: "🪔",
      closingSubtext: "SubhSandesh",
    },
  },
};
