import { Sparkles, Heart, CalendarDays, Camera, Mail } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card. The cover is three phones showing the real page (the gold
// doors under the floral corners in the centre, the terrace hero, the sangeet
// card with its couple) on the opening's own background — watercolour sky,
// misty hills, the lake and template15's floral corners: rendered from
// headless captures, master at
// media-src/templates/wedding/covers/wedding-invitation-premium/cover-doors.webp
// (1080 × 1350). Like the rest of the template's
// art, it is served from the media CDN, with its @360w/@540w/@720w variants next to it (the
// gallery card asks for those). public/wedding-v3 keeps the original.
export const config: TemplatePageConfig = {
  slug: "wedding-invitation-premium",
  type: "wedding-invitation-premium",
  category: "wedding",
  title: "Wedding Invitation ✦ Premium — Every Function, One Link",
  description:
    "Your Indian wedding on one link: your love story, Haldi, Mehendi, Sangeet, Wedding and Reception with maps, timings and dress codes, both families, up to 20 photos in a Pinterest-style gallery, your song, and an RSVP for each function. In English or Hindi, in one hand-painted Lake Terrace look; the AI drafts it all.",
  coverImage: `${WEDDING_ART_CDN}/premium/cover-doors.webp`,
  emoji: "💍",
  color: "from-rose-200 to-amber-200",
  previewText: "every function, one beautiful link 💍",
  bodyText: "Our story, every function, every photo, one RSVP.",
  bgGradient: "from-rose-50 via-amber-50 to-white",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "story", icon: Heart, label: "Story" },
    { id: "events", icon: CalendarDays, label: "Functions" },
    { id: "gallery", icon: Camera, label: "Gallery" },
    { id: "rsvp", icon: Mail, label: "RSVP" },
  ],
  navActiveColor: "text-rose-700",
  navActiveBg: "bg-rose-600/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "you're invited 💍", ctaText: "Open", floatingEmojis: ["🌸", "✨", "💍"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["🌸", "✨", "🌸"] },
    final: {
      headerEmoji: "💍",
      title: "With love",
      subtitle: "We can't wait to celebrate with you",
      wishes: ["See you there 🌸", "RSVP inside 💌", "Shubh Vivah ✨"],
      closingEmoji: "💍",
      closingSubtext: "SubhSandesh",
    },
  },
};
