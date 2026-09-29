import { UserRound, Briefcase, Award, ThumbsUp, MessageSquareQuote } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/theme.ts. No real professional network is
// named, coloured, or imitated anywhere in this template.
export const config: TemplatePageConfig = {
  slug: "profile-pro",
  type: "profile-pro",
  category: "gf",
  title: "Endorsements",
  description:
    "A relationship as a career profile. Experience, skills, and endorsements their friends add with one tap — no signup, no form, just a thumb.",
  emoji: "💼",
  color: "from-teal-600 to-emerald-700",
  previewText: "Being Right · 47 endorsements 💼",
  bodyText:
    "Corporate-bland on purpose: hairline borders, no shadows, a headline that reads like a job title. The joke is that Punctuality (2) sits in exactly the same row as Being Right (47).",
  bgGradient: "from-teal-50 via-white to-emerald-50",
  coverImage: templateMedia("profile-pro", "cover-poster.webp"),
  tabs: [
    { id: "profile", icon: UserRound, label: "Profile" },
    { id: "experience", icon: Briefcase, label: "Experience" },
    { id: "skills", icon: ThumbsUp, label: "Skills" },
    { id: "certs", icon: Award, label: "Certificates" },
    { id: "references", icon: MessageSquareQuote, label: "References" },
  ],
  navActiveColor: "text-teal-700",
  navActiveBg: "bg-teal-700/15",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Open to: being right.",
      ctaText: "View profile",
      floatingEmojis: ["💼", "👍", "🏆", "📄", "💗"],
    },
    letter: {
      headerEmoji: "👍",
      title: "Endorsed",
      greeting: "To whom it may concern,",
      decorEmojis: ["💼", "🏆", "📄"],
    },
    final: {
      headerEmoji: "🏆",
      title: "Skills · endorsed by everyone who knows you",
      subtitle: "1 connection",
      wishes: [
        "Being Right — endorsed by 47 people 👍",
        "Punctuality — endorsed by 2 people 💼",
        "Certified in Reading My Mind, issued by herself 🏆",
      ],
      closingEmoji: "💗",
      closingSubtext: "SubhSandesh",
    },
  },
};
