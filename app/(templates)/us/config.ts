import { UserRound, Grid3x3, Bookmark, MessageCircle, Share2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "us",
  type: "love",
  category: "gf",
  title: "Us",
  description:
    "Your relationship gets its own account. Bio, stats, story highlights, a photo grid, and posts with captions and comments from friends who are enjoying this far too much.",
  coverImage: templateMedia("us", "cover-poster.webp"),
  emoji: "📱",
  color: "from-neutral-700 to-neutral-900",
  previewText: "@us_since_2023 · 847 followers 📱",
  bodyText:
    "The grid, the highlights, the double-tap heart. Tap Following and it will not let you unfollow.",
  bgGradient: "from-neutral-50 via-white to-white",
  tabs: [
    { id: "profile", icon: UserRound, label: "Profile" },
    { id: "grid", icon: Grid3x3, label: "The Grid" },
    { id: "highlights", icon: Bookmark, label: "Highlights" },
    { id: "comments", icon: MessageCircle, label: "Comments" },
    { id: "share", icon: Share2, label: "Share" },
  ],
  navActiveColor: "text-neutral-900",
  navActiveBg: "bg-neutral-900/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "It got its own account.",
      ctaText: "Open the profile",
      floatingEmojis: ["📱", "❤️", "·", "✧", "💬"],
    },
    letter: {
      headerEmoji: "💬",
      title: "The Captions",
      greeting: "Everything we posted,",
      decorEmojis: ["📱", "❤️", "💬"],
    },
    final: {
      headerEmoji: "📱",
      title: "That's the profile",
      subtitle: "847 followers, one that matters",
      wishes: [
        "Double-tap the photos. All of them ❤️",
        "The comments are from people we know 💬",
        "You cannot unfollow. We checked 📱",
      ],
      closingEmoji: "❤️",
      closingSubtext: "SubhSandesh",
    },
  },
};
