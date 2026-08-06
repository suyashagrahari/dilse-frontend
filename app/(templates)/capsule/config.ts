import { PenLine, Lock, Hourglass, Stamp, Share2 } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "capsule",
  type: "love",
  category: "gf",
  title: "Capsule",
  description:
    "You both write predictions about the next year, blind to each other. It seals. A year later you crack it open together, judge every one, and find out who owes who.",
  coverImage:
    "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/capsule/cover.jpg",
  emoji: "🕰️",
  color: "from-red-800 to-amber-900",
  previewText: "sealed until 14 March 2027 🕰️",
  bodyText:
    "Neither of you can read the other's. Neither of you can read your own. When it opens, disagreeing is its own result — and it's the funniest one.",
  bgGradient: "from-amber-50 via-red-50 to-white",
  tabs: [
    { id: "write", icon: PenLine, label: "Write" },
    { id: "seal", icon: Lock, label: "The Seal" },
    { id: "wait", icon: Hourglass, label: "The Wait" },
    { id: "verdict", icon: Stamp, label: "Verdicts" },
    { id: "share", icon: Share2, label: "Share" },
  ],
  navActiveColor: "text-red-800",
  navActiveBg: "bg-red-800/10",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Write it down. Don't look again until it's time.",
      ctaText: "Start writing",
      floatingEmojis: ["🕰️", "✒️", "·", "🔒", "✧"],
    },
    letter: {
      headerEmoji: "✒️",
      title: "What We Thought Would Happen",
      greeting: "A year ago, we wrote,",
      decorEmojis: ["🕰️", "✒️", "🔒"],
    },
    final: {
      headerEmoji: "🕰️",
      title: "Sealed",
      subtitle: "see you in a year",
      wishes: [
        "Nobody can read it early. Not even you 🔒",
        "Disagreeing counts as its own answer ✒️",
        "The loser owes what you both agreed 🕰️",
      ],
      closingEmoji: "🕰️",
      closingSubtext: "SubhSandesh",
    },
  },
};
