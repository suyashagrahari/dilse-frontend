import { Flower, CalendarHeart, Image as ImageIcon, Mail, Sparkles } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { WEDDING_ART_CDN } from "../_wedding/media";

// Gallery card: three phones from the design (the sealed envelope, the hero arch, a celebration card), 1080×1350,
// served from the media CDN with its @360w/@540w/@720w variants (the gallery card asks for those).
export const config: TemplatePageConfig = {
  slug: "tamil-wedding-invitation",
  type: "tamil-wedding-invitation",
  category: "wedding",
  title: "Tamil Kalyanam Wedding Invitation 🪔 — Tamil Wedding, Every Function",
  description:
    "A Tamil wedding invitation in temple maroon and gold: guests break a wax seal and the card opens onto the Great Pagoda at Tanjore, with Shri Ganesha in gold and a Kanjeevaram temple border. Every function from the Nichayathartham and Panda Kaal Muhurtham to the Kashi Yatra, the Oonjal and the Muhurtham, with maps and dress codes, English and Tamil side by side, 40 photos, RSVP per function, who to call and a blessings wall. The AI writes it.",
  coverImage: `${WEDDING_ART_CDN}/faith-south/ta-cover1.webp`,
  emoji: "🪔",
  color: "from-rose-100 to-amber-200",
  previewText: "a Tamil wedding invitation, just for you 🪔",
  bodyText: "Ganesha in gold, the Muhurtham and every function, one link.",
  bgGradient: "from-rose-50 via-amber-50 to-orange-50",
  tabs: [
    { id: "envelope", icon: Flower, label: "Envelope" },
    { id: "invite", icon: Mail, label: "Invite" },
    { id: "functions", icon: CalendarHeart, label: "Functions" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "rsvp", icon: Sparkles, label: "RSVP" },
  ],
  navActiveColor: "text-rose-900",
  navActiveBg: "bg-rose-800/10",
  floatStyle: "stars",
  pages: {
    cover: { subtitle: "temple maroon, gold and jasmine 🪔", ctaText: "Open", floatingEmojis: ["🪔", "🤍", "✨"] },
    letter: { headerEmoji: "💌", title: "The invitation", greeting: "Dear guest,", decorEmojis: ["✨", "🤍", "🪔"] },
    final: {
      headerEmoji: "🪔",
      title: "Kalyanam",
      subtitle: "With love, the families",
      wishes: ["RSVP for every function", "Every date on your calendar", "Leave your blessings"],
      closingEmoji: "🪔",
      closingSubtext: "SubhSandesh",
    },
  },
};
