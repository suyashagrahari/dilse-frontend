import { Download, Images, Star, History, Info } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/theme.ts. Nothing here may name a software
// storefront, a phone platform, or a vendor — see the brand note at the top of
// components/types.ts. The chrome is the sender's own store and the accent is a
// deep indigo that belongs to nobody.
export const config: TemplatePageConfig = {
  slug: "app",
  type: "app",
  category: "gf",
  title: "The Listing",
  description:
    "Publish the person you love as a piece of software. Icon, developer line, a GET button, screenshots with captions, a stats strip, a description that expands, a changelog that gets steadily more unhinged, and reviews her friends actually write.",
  emoji: "📲",
  color: "from-indigo-500 to-violet-600",
  previewText: "Version 4.0.2 · 1 human · Free 📲",
  bodyText:
    "A full software listing for a person: the header block, the ratings histogram, five screenshots, the version history — and a review section that opens for her friends and stays closed until you approve what they wrote.",
  bgGradient: "from-indigo-50 via-white to-violet-50",
  coverImage:
    templateMedia("app", "cover.webp"),
  tabs: [
    { id: "listing", icon: Download, label: "Listing" },
    { id: "shots", icon: Images, label: "Screens" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "history", icon: History, label: "Versions" },
    { id: "info", icon: Info, label: "Info" },
  ],
  navActiveColor: "text-indigo-600",
  navActiveBg: "bg-indigo-600/15",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "One install. No uninstall option.",
      ctaText: "Open the listing",
      floatingEmojis: ["📲", "⭐", "🔔", "💾", "💜"],
    },
    letter: {
      headerEmoji: "📲",
      title: "About this listing",
      greeting: "Description,",
      decorEmojis: ["📲", "⭐", "💜"],
    },
    final: {
      headerEmoji: "⭐",
      title: "Thanks for installing",
      subtitle: "updates are automatic and non-negotiable",
      wishes: [
        "Read the changelog. Every line of it is true ⭐",
        "The reviews are from people who know her 💬",
        "Size: 1 human. Price: free, emotionally expensive 💜",
      ],
      closingEmoji: "💜",
      closingSubtext: "SubhSandesh",
    },
  },
};
