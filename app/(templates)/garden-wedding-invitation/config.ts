import { Flower2, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card. The cover is the owner's card art (public/wedding-v3/template1),
// from the media CDN, where its @360w/@540w/@720w variants also live, so the
// gallery's coverSrcSet() takes them straight from CloudFront.
export const config: TemplatePageConfig = {
  slug: "garden-wedding-invitation",
  type: "garden-wedding-invitation",
  category: "wedding",
  title: "Mughal Garden Wedding Invitation ✦ — Gazebos, Peacocks & Every Function",
  description:
    "A watercolour Mughal garden wedding invitation: clouds part over pink gazebos and chhatris, a peacock walks the hedge wall, lanterns sway and lotus fountains play while guests read your story, up to eight functions with maps and dress codes, 40 photos, RSVP per function and a blessings wall. Soft pastels; the AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/template1/card.webp`,
  emoji: "🦚",
  color: "from-pink-200 to-emerald-200",
  previewText: "the garden is ready for you 🦚",
  bodyText: "Gazebos, peacocks, lanterns and every function, one link.",
  bgGradient: "from-rose-50 via-pink-50 to-emerald-50",
  tabs: [
    { id: "gates", icon: Flower2, label: "Garden" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-rose-700",
  navActiveBg: "bg-rose-600/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "the garden gates are open 🦚", ctaText: "Open", floatingEmojis: ["🦚","🌸","✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["🪔", "✨", "🌼"] },
    final: {
      headerEmoji: "🦚",
      title: "Shubh Vivah",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🪔",
      closingSubtext: "SubhSandesh",
    },
  },
};
