import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card: three phones from the design (the sealed envelope, the hero arch, a celebration card), 1080×1350,
// served from the media CDN with its @360w/@540w/@720w variants (the gallery card asks for those).
export const config: TemplatePageConfig = {
  slug: "malayalam-wedding-invitation",
  type: "malayalam-wedding-invitation",
  category: "wedding",
  title: "Kerala Kalyanam Wedding Invitation 🪷 — Malayalam Wedding, Every Function",
  description:
    "A Kerala Hindu wedding invitation in kasavu ivory and gold: guests break a wax seal and the card opens onto the Malabar coast, palms and sails, with the nilavilakku and a kasavu border. Every function from the Nischayam and Ayaniyoonu to the Thalikettu and the Sadya, with maps and dress codes, English and Malayalam side by side, 40 photos, RSVP per function and a blessings wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/faith-south/ml-cover1.webp`,
  emoji: "🪷",
  color: "from-amber-50 to-emerald-100",
  previewText: "a Kerala wedding invitation, just for you 🪷",
  bodyText: "Kasavu, the Thalikettu and the Sadya, one link.",
  bgGradient: "from-amber-50 via-lime-50 to-emerald-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-emerald-900",
  navActiveBg: "bg-emerald-800/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "kasavu, gold and jasmine 🪷", ctaText: "Open", floatingEmojis: ["🪷", "🤍", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "🤍", "🪷"] },
    final: {
      headerEmoji: "🪷",
      title: "Thalikettu",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🪷",
      closingSubtext: "SubhSandesh",
    },
  },
};
