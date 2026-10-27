import { Mail, CalendarHeart, MapPin, Image as ImageIcon, Heart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

// Gallery card. The cover is three phones showing the real page (the jharokha
// opening, the names under the palace arch, the haldi card with its couple)
// under template15's floral canopy: rendered from headless captures, master at
// media-src/templates/wedding/covers/wedding-invitation/cover-phones.webp
// (1080 × 1350, with @360w/@540w/@720w). It is served from the repo like the
// rest of this template's art (the 720px variant, 82 KB); to move it to the
// CDN, upload the four files next to cover-classic.webp and point this at
// templateMedia("wedding", "covers/wedding-invitation/cover-phones.webp").
export const config: TemplatePageConfig = {
  slug: "wedding-invitation",
  type: "wedding-invitation",
  category: "wedding",
  title: "Wedding Invitation — Elegant Invite with RSVP",
  description:
    "An elegant wedding invitation website: a wax-seal envelope opens to your names, date and live countdown, the wedding and reception with maps, your photos in a magazine gallery, your song and one-tap RSVP, in English or Hindi. One hand-painted blush and rose-gold look; the AI writes it from a few lines.",
  coverImage: "/wedding-v3/classic/cover-phones.webp",
  emoji: "💌",
  color: "from-amber-100 to-yellow-200",
  previewText: "an invitation, sealed with love 💌",
  bodyText: "Open the seal, count down to the day, RSVP in one tap.",
  bgGradient: "from-amber-50 via-yellow-50 to-rose-50",
  tabs: [
    { id: "open", icon: Mail, label: "Open" },
    { id: "date", icon: CalendarHeart, label: "Date" },
    { id: "venue", icon: MapPin, label: "Venue" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Heart, label: "RSVP" },
  ],
  navActiveColor: "text-amber-800",
  navActiveBg: "bg-amber-700/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "you're invited 💌", ctaText: "Open", floatingEmojis: ["💌", "✨", "💍"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "💍", "🌸"] },
    final: {
      headerEmoji: "💍",
      title: "With love",
      subtitle: "We can't wait to celebrate with you",
      wishes: ["Count down to the day ⏳", "RSVP in one tap 💌", "See you there ✨"],
      closingEmoji: "💌",
      closingSubtext: "SubhSandesh",
    },
  },
};
