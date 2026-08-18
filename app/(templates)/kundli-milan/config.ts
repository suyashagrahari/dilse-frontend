import { Sparkles, ScrollText, Users, Stars, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "kundli-milan",
  type: "wedding",
  category: "gf",
  title: "Kundli Milan Report",
  description:
    "A full 36-guna Ashtakoota compatibility report for the two of you. Eight kootas, real nakshatras, actual yoni animals. Astrologically meaningless. Statistically hilarious.",
  coverImage: templateMedia("kundli-milan", "cover.jpg"),
  emoji: "🔮",
  color: "from-orange-500 to-amber-700",
  previewText: "36 gunas matched. The stars have signed off 🔮",
  bodyText:
    "Issued by the Office of the Registrar of Hearts. Ayanamsa: Lahiri. Validity: none whatsoever.",
  bgGradient: "from-orange-50 via-amber-50 to-white",
  tabs: [
    { id: "birth", icon: Stars, label: "Birth" },
    { id: "report", icon: ScrollText, label: "Report" },
    { id: "readings", icon: Sparkles, label: "Readings" },
    { id: "remedies", icon: Users, label: "Remedies" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-amber-700",
  navActiveBg: "bg-amber-700/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "Your kundlis have been submitted for matching.",
      ctaText: "Begin the milan",
      floatingEmojis: ["🔮","⭐","🕉️","✨","🪔"],
    },
    letter: {
      headerEmoji: "🔮",
      title: "Ashtakoota Milan",
      greeting: "Be it computed,",
      decorEmojis: ["⭐","🕉️","🪔"],
    },
    final: {
      headerEmoji: "⭐",
      title: "Uttam. Excellent match.",
      subtitle: "Mangal Dosha mutually cancelled",
      wishes: ["Not valid for any actual matrimonial decision 🔮","Valid for the group chat ⭐","Yoni mismatch noted and disregarded 🐒"],
      closingEmoji: "✨",
      closingSubtext: "Office of the Registrar of Hearts",
    },
  },
};
