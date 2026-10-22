import { DoorOpen, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

// Gallery card. The cover is the owner's card art, served from the repo
// (public/wedding-v3, never the CDN).
export const config: TemplatePageConfig = {
  slug: "palace-door-wedding-invitation",
  type: "palace-door-wedding-invitation",
  category: "wedding",
  title: "Palace Door Wedding Invitation ✦ — Doors That Open to Your Shaadi",
  description:
    "Carved Rajasthani palace doors swing open to your wedding: your names in a golden frame, a floral mandap with lanterns, jhumka hangings and a havan kund, an illustrated couple for every function from Haldi and Mehendi to the Reception, RSVP per function, 40 photos and a blessings wall. Ivory and gold; the AI writes it.",
  coverImage: "/wedding-v3/template13/card.webp",
  emoji: "🚪",
  color: "from-amber-200 to-orange-300",
  previewText: "the palace doors open for you 🚪",
  bodyText: "Carved doors, a floral mandap and every function, one link.",
  bgGradient: "from-amber-50 via-orange-50 to-rose-100",
  tabs: [
    { id: "gates", icon: DoorOpen, label: "Doors" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-amber-700",
  navActiveBg: "bg-amber-600/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "the palace doors are opening 🚪", ctaText: "Open", floatingEmojis: ["🚪","🪔","✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["🪔", "✨", "🌼"] },
    final: {
      headerEmoji: "🚪",
      title: "Shubh Vivah",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🪔",
      closingSubtext: "SubhSandesh",
    },
  },
};
