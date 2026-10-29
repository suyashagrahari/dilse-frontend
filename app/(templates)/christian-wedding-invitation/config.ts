import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card: three phones from the design (the sealed envelope, the hero arch, a celebration card), 1080×1350,
// served from the media CDN with its @360w/@540w/@720w variants (the gallery card asks for those).
export const config: TemplatePageConfig = {
  slug: "christian-wedding-invitation",
  type: "christian-wedding-invitation",
  category: "wedding",
  title: "Holy Matrimony Wedding Invitation ✝ — Christian Church Wedding",
  description:
    "A Christian wedding invitation in ivory, sage and gold: guests break a wax seal on an envelope addressed to them, and the card opens onto a carved chapel arch crowned with white lilies, the cross in gold and a Bible verse. Then the engagement, the bridal shower, the Holy Matrimony and the reception, with maps and dress codes, 40 photos, RSVP per event, who to call and a blessings wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/faith-christian/cover2.webp`,
  emoji: "🕊️",
  color: "from-stone-100 to-emerald-100",
  previewText: "a church wedding invitation, just for you 🕊️",
  bodyText: "White lilies, the chapel and every event, one link.",
  bgGradient: "from-stone-50 via-white to-emerald-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-stone-800",
  navActiveBg: "bg-stone-700/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "white lilies, doves and a chapel arch 🕊️", ctaText: "Open", floatingEmojis: ["🕊️", "🤍", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "🤍", "🕊️"] },
    final: {
      headerEmoji: "🕊️",
      title: "Holy Matrimony",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🕊️",
      closingSubtext: "SubhSandesh",
    },
  },
};
