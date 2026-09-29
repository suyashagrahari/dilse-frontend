import { PhoneIncoming, BadgeCheck, Tags, History, MessageSquare } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/. The caller-ID app this borrows its shape
// from is never named — see the brand note in components/types.ts.
export const config: TemplatePageConfig = {
  slug: "call",
  type: "call",
  category: "gf",
  title: "Caller ID",
  description:
    "An incoming call from the one number they already know by heart. Full-screen photo, identification card, crowd-sourced tags, 0% spam, verified — and a call log where every entry is a real night.",
  emoji: "📞",
  color: "from-emerald-500 to-teal-600",
  previewText: "Incoming call · Meera Sharma 📞",
  bodyText:
    "Swipe to answer and the message plays out line by line. Underneath: the identification card with its tags and spam meter, and a call log that reads like a relationship.",
  bgGradient: "from-emerald-50 via-white to-teal-50",
  coverImage: templateMedia("call", "cover-poster.webp"),
  tabs: [
    { id: "call", icon: PhoneIncoming, label: "The Call" },
    { id: "caller", icon: BadgeCheck, label: "Caller" },
    { id: "tags", icon: Tags, label: "Tags" },
    { id: "message", icon: MessageSquare, label: "Message" },
    { id: "log", icon: History, label: "Call Log" },
  ],
  navActiveColor: "text-emerald-600",
  navActiveBg: "bg-emerald-600/15",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "One missed call you will not want to miss.",
      ctaText: "Answer",
      floatingEmojis: ["📞", "✓", "💚", "☎️", "✧"],
    },
    letter: {
      headerEmoji: "☎️",
      title: "What she called to say",
      greeting: "Pick up,",
      decorEmojis: ["📞", "✓", "💚"],
    },
    final: {
      headerEmoji: "💚",
      title: "Call ended",
      subtitle: "4 hrs 12 mins",
      wishes: [
        "0% spam. Verified. Always was ✓",
        "Every entry in the log actually happened 📞",
        "Answer on the first ring next time 💚",
      ],
      closingEmoji: "💚",
      closingSubtext: "SubhSandesh",
    },
  },
};
