import { Mail, Heart, Image as ImageIcon, Sparkles, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { DEMO_PHOTO_CDN } from "../_love/types";

// Gallery card. The cover is a placeholder (a demo couple photo) until the
// day's own cover art is uploaded to templates/happy-valentines-day/cover.webp.
export const config: TemplatePageConfig = {
  slug: "happy-valentines-day",
  type: "love",
  category: "gf",
  title: "Valentine's Day — Our Valentine Night",
  description:
    'A ticket, seven lanterns for the week, your Love Wrapped stats, a gift-box letter and the forever question.',
  coverImage: `${DEMO_PHOTO_CDN}/couple4.webp`,
  emoji: "💘",
  color: "from-indigo-900 to-amber-400",
  previewText: 'admit two. tonight 💘',
  bodyText: 'The whole week, in one night.',
  bgGradient: "from-indigo-50 via-rose-50 to-amber-50",
  tabs: [
    { id: "open", icon: Sparkles, label: "Open" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "love", icon: Heart, label: "Love" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-amber-600",
  navActiveBg: "bg-amber-600/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: 'admit two. tonight 💘', ctaText: "Open", floatingEmojis: ["💘", "💗", "✨"] },
    letter: { headerEmoji: "💘", title: "A letter for you", greeting: "Hey you,", decorEmojis: ["💘", "💌", "✨"] },
    final: {
      headerEmoji: "💘",
      title: "Happy Valentine's Day",
      subtitle: "Made with love",
      wishes: ["Made just for you 💗", "Open it again anytime ✨", "Send one back 💌"],
      closingEmoji: "💘",
      closingSubtext: "SubhSandesh",
    },
  },
};
