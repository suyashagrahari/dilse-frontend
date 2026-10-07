import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { DEMO_PHOTO_CDN } from "../_love/types";

// Gallery card. The cover is a placeholder (a demo couple photo) until the
// day's own cover art is uploaded to templates/happy-kiss-day/cover.webp.
export const config: TemplatePageConfig = {
  slug: "happy-kiss-day",
  type: "love",
  category: "gf",
  title: "Kiss Day — Sealed With a Kiss",
  description:
    'Fill a kiss jar until it overflows, open a lipstick-sealed letter, scratch kiss coupons — cute and family-safe.',
  coverImage: `${DEMO_PHOTO_CDN}/couple3.webp`,
  emoji: "💋",
  color: "from-rose-500 to-pink-600",
  previewText: 'a little something for you 💌',
  bodyText: 'Sealed with a kiss — safe on any phone.',
  bgGradient: "from-rose-50 via-pink-50 to-amber-50",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "love", icon: Heart, label: "Love" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-rose-700",
  navActiveBg: "bg-rose-700/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: 'a little something for you 💌', ctaText: "Open", floatingEmojis: ["💋", "💗", "✨"] },
    letter: { headerEmoji: "💋", title: "A letter for you", greeting: "Hey you,", decorEmojis: ["💋", "💌", "✨"] },
    final: {
      headerEmoji: "💋",
      title: "Happy Kiss Day",
      subtitle: "Made with love",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Send one back 💌"],
      closingEmoji: "💋",
      closingSubtext: "SubhSandesh",
    },
  },
};
