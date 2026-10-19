import { Mail, CalendarHeart, MapPin, Image as ImageIcon, Heart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the wedding asset pack's Classic poster
// (media-src/templates/wedding/covers/wedding-invitation/cover-classic.webp,
// on the CDN with its @360w/@540w/@720w sizes). The first render
// (cover-poster.webp) carried a "PREMIUM" badge; CDN files are immutable, so
// the "CLASSIC" re-render has its own name.
export const config: TemplatePageConfig = {
  slug: "wedding-invitation",
  type: "wedding-invitation",
  category: "wedding",
  title: "Wedding Invitation — Elegant Invite with RSVP",
  description:
    "An elegant wedding invitation website: a wax-seal envelope opens to your names, date and live countdown, the wedding and reception with maps and calendar, your photos in a magazine gallery, your song and one-tap RSVP. Six light and dark gold themes; the AI writes it from a few lines.",
  coverImage: templateMedia("wedding", "covers/wedding-invitation/cover-classic.webp"),
  emoji: "💌",
  color: "from-amber-100 to-yellow-200",
  previewText: "an invitation, sealed with love 💌",
  bodyText: "Open the seal, save the date, RSVP in one tap.",
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
      wishes: ["Save the date 📅", "RSVP in one tap 💌", "See you there ✨"],
      closingEmoji: "💌",
      closingSubtext: "SubhSandesh",
    },
  },
};
