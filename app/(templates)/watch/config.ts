import { PlayCircle, ListVideo, AlignLeft, MessageCircle, Share2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/. Nothing here may name the video platform,
// its abbreviation, or its parent — see the brand note in components/types.ts.
export const config: TemplatePageConfig = {
  slug: "watch",
  type: "watch",
  category: "gf",
  title: "Watch",
  description:
    "Give the video you made her a watch page of its own: a player that really plays, a title, a channel row, a description with clickable chapters, a pinned comment, and a comment section her friends can write in.",
  emoji: "▶️",
  color: "from-sky-500 to-indigo-600",
  previewText: "3 Years With Meera Sharma ▶️",
  bodyText:
    "Paste one video link. You get the full watch page around it — chapters that actually seek, a pinned comment, and a comment thread that stays hidden until you approve it.",
  bgGradient: "from-slate-50 via-white to-sky-50",
  coverImage: templateMedia("watch", "cover-poster.webp"),
  tabs: [
    { id: "video", icon: PlayCircle, label: "Video" },
    { id: "chapters", icon: ListVideo, label: "Chapters" },
    { id: "description", icon: AlignLeft, label: "Description" },
    { id: "comments", icon: MessageCircle, label: "Comments" },
    { id: "share", icon: Share2, label: "Share" },
  ],
  navActiveColor: "text-sky-600",
  navActiveBg: "bg-sky-600/15",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Eleven minutes. No skips.",
      ctaText: "Press play",
      floatingEmojis: ["▶️", "♥", "💬", "🎬", "✧"],
    },
    letter: {
      headerEmoji: "🎬",
      title: "Description",
      greeting: "Show more,",
      decorEmojis: ["▶️", "♥", "💬"],
    },
    final: {
      headerEmoji: "♥",
      title: "Thanks for watching",
      subtitle: "the timestamps are load-bearing",
      wishes: [
        "Every chapter is a real day ▶️",
        "The comments are from people who were there 💬",
        "Watch to the end. I ask you something ♥",
      ],
      closingEmoji: "♥",
      closingSubtext: "SubhSandesh",
    },
  },
};
