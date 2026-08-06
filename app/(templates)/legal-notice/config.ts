import { Scale, FileText, Stamp, CircleCheck, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

export const config: TemplatePageConfig = {
  slug: "legal-notice",
  type: "sorry",
  category: "gf",
  title: "Legal Notice",
  description:
    "File a formal legal notice against your person. They must respond to every demand — accept or contest. Seven days to comply, or it escalates to their mother.",
  emoji: "⚖️",
  color: "from-blue-600 to-indigo-800",
  previewText: "You have been served ⚖️",
  bodyText:
    "That the addressee has, on 27 (twenty-seven) occasions, responded to a direct question with the words \"whatever you want\".",
  bgGradient: "from-blue-50 via-slate-50 to-white",
  coverImage: "/templates/legal-notice/cover.jpg",
  tabs: [
    { id: "notice", icon: Scale, label: "Notice" },
    { id: "recitals", icon: FileText, label: "Recitals" },
    { id: "demands", icon: Stamp, label: "Demands" },
    { id: "comply", icon: CircleCheck, label: "Comply" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-indigo-700",
  navActiveBg: "bg-indigo-700/10",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "A legal notice has been served upon you.",
      ctaText: "Open the notice",
      floatingEmojis: ["⚖️","📄","🖋️","📌","✨"],
    },
    letter: {
      headerEmoji: "📄",
      title: "Legal Notice",
      greeting: "Madam/Sir,",
      decorEmojis: ["⚖️","🖋️","📌"],
    },
    final: {
      headerEmoji: "⚖️",
      title: "Notice duly served.",
      subtitle: "Seven (7) days to comply",
      wishes: ["That you are hereby called upon to comply within seven (7) days ⚖️","That failing which, this matter shall be escalated to your mother 📄","This notice has no legal effect and is not a substitute for a conversation 🖋️"],
      closingEmoji: "📌",
      closingSubtext: "Copy kept in office for record.",
    },
  },
};
