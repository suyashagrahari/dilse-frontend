import { Gift, Mail, Image as ImageIcon, Cake, Crown } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Gallery card. The cover is the strawberry-cake "Happy Birthday" poster
// (source: media-src/templates/happy-birthday/cover-poster.webp + @360w/@540w/@720w;
// uploaded to cdn.subhsandesh.in/gifts-media/templates/happy-birthday/).
export const config: TemplatePageConfig = {
  slug: "happy-birthday",
  type: "birthday",
  category: "gf",
  title: "Happy Birthday — a cute birthday surprise page",
  description:
    "A birthday surprise they play: untie the gift ribbon, light and blow out the candles (even with the mic), cut the cake, pop balloons full of reasons you love them, unwrap coupons and wear a Birthday Queen crown. Four cake colours.",
  coverImage: templateMedia("happy-birthday", "cover-poster.webp"),
  emoji: "🎂",
  color: "from-pink-300 to-rose-400",
  previewText: "someone made you a birthday surprise 🎂",
  bodyText: "Untie the ribbon, make a wish, blow the candles.",
  bgGradient: "from-pink-50 via-rose-100 to-amber-100",
  tabs: [
    { id: "open", icon: Gift, label: "Open" },
    { id: "cake", icon: Cake, label: "Cake" },
    { id: "photos", icon: ImageIcon, label: "Photos" },
    { id: "letter", icon: Mail, label: "Letter" },
    { id: "crown", icon: Crown, label: "Crown" },
  ],
  navActiveColor: "text-rose-500",
  navActiveBg: "bg-rose-500/10",
  floatStyle: "hearts",
  pages: {
    cover: { subtitle: "someone made you a birthday surprise 🎂", ctaText: "Open", floatingEmojis: ["🎂", "🎈", "🎉"] },
    letter: { headerEmoji: "💌", title: "A birthday card for you", greeting: "Happy birthday,", decorEmojis: ["🎈", "🎉", "✨"] },
    final: {
      headerEmoji: "👑",
      title: "Officially the Birthday Queen",
      subtitle: "Made with love (and a lot of frosting)",
      wishes: ["Made just for you 🎂", "Open it again anytime 🎈", "Make one for your own person ✨"],
      closingEmoji: "🎂",
      closingSubtext: "SubhSandesh",
    },
  },
};
