import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card: three phones from the design (the sealed envelope, the hero arch, a celebration card), 1080×1350,
// served from the media CDN with its @360w/@540w/@720w variants (the gallery card asks for those).
export const config: TemplatePageConfig = {
  slug: "marathi-wedding-invitation",
  type: "marathi-wedding-invitation",
  category: "wedding",
  title: "Shubh Vivah Marathi Wedding Invitation 🦚 — Marathi Wedding, Every Function",
  description:
    "A Marathi wedding invitation in Paithani magenta and gold: guests break a wax seal and the card opens onto Raja Ravi Varma, with Shri Ganesha in gold and a Paithani border. Every function from the Sakhar Puda and Halad to the Seemant Pujan, the Mangalashtak and the Shubh Vivah, with maps and dress codes, English and Marathi side by side, 40 photos, RSVP per function and a blessings wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/faith-south/mr-cover1.webp`,
  emoji: "🦚",
  color: "from-fuchsia-100 to-rose-200",
  previewText: "a Marathi wedding invitation, just for you 🦚",
  bodyText: "Shri Ganeshaya Namah, the Mangalashtak, one link.",
  bgGradient: "from-fuchsia-50 via-rose-50 to-amber-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-fuchsia-900",
  navActiveBg: "bg-fuchsia-800/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "Paithani, pearls and gold 🦚", ctaText: "Open", floatingEmojis: ["🦚", "🤍", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "🤍", "🦚"] },
    final: {
      headerEmoji: "🦚",
      title: "Shubh Vivah",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🦚",
      closingSubtext: "SubhSandesh",
    },
  },
};
