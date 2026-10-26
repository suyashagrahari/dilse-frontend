import { Sparkles, Heart, CalendarDays, Camera, Mail } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

// Gallery card. The cover is three phones showing the real page (the French
// doors, the names on the terrace, the sangeet card with its couple) under the
// flamingo border: rendered from headless captures, master at
// media-src/templates/wedding/covers/wedding-invitation-premium/cover-phones.webp
// (1080 × 1350, with @360w/@540w/@720w). Served from the repo like the rest of
// this template's art (the 720px variant); to move it to the CDN, upload the
// four files next to cover-poster.webp and point this at templateMedia(…).
export const config: TemplatePageConfig = {
  slug: "wedding-invitation-premium",
  type: "wedding-invitation-premium",
  category: "wedding",
  title: "Wedding Invitation ✦ Premium — Every Function, One Link",
  description:
    "Your Indian wedding on one link: your love story, Haldi, Mehendi, Sangeet, Wedding and Reception with maps, timings and dress codes, both families, up to 20 photos in a Pinterest-style gallery, your song, and an RSVP for each function. In English or Hindi, in one hand-painted Lake Terrace look; the AI drafts it all.",
  coverImage: "/wedding-v3/premium/cover-phones.webp",
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
