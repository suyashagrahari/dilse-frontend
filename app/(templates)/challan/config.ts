import { FileSearch, Camera, Scale, Wallet, Gavel } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/theme.ts. The issuing authority is invented
// end to end — see the legal note in components/types.ts. This is a NOTICE, not
// an identity document, and nothing in the template resembles one.
export const config: TemplatePageConfig = {
  slug: "challan",
  type: "challan",
  category: "gf",
  title: "Challan",
  description:
    "A traffic notice for the things they actually did. Overspeeding into your life. Illegal parking in your head since 2023. Pay it, or contest it and win.",
  emoji: "🚦",
  color: "from-amber-500 to-red-700",
  previewText: "1 challan found. 🚦",
  bodyText:
    "A grainy camera photo, a cropped number plate, an offence table with a total that reads 'one date'. Pay it and you get a receipt. Contest it and the objection is always upheld.",
  bgGradient: "from-amber-50 via-white to-red-50",
  coverImage: "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/challan/cover.webp",
  tabs: [
    { id: "lookup", icon: FileSearch, label: "Lookup" },
    { id: "evidence", icon: Camera, label: "Evidence" },
    { id: "offences", icon: Scale, label: "Offences" },
    { id: "pay", icon: Wallet, label: "Pay" },
    { id: "contest", icon: Gavel, label: "Contest" },
  ],
  navActiveColor: "text-red-700",
  navActiveBg: "bg-red-700/15",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "1 challan found against this vehicle.",
      ctaText: "View challan",
      floatingEmojis: ["🚦", "📸", "🧾", "⚖️", "💗"],
    },
    letter: {
      headerEmoji: "🧾",
      title: "E-Challan",
      greeting: "To the registered owner,",
      decorEmojis: ["🚦", "📸", "⚖️"],
    },
    final: {
      headerEmoji: "⚖️",
      title: "Matter settled",
      subtitle: "amount paid: one date",
      wishes: [
        "Overspeeding — into my life, without warning 🚦",
        "Illegal parking — in my head, since 2023 📸",
        "Objection upheld. It was always going to be ⚖️",
      ],
      closingEmoji: "💗",
      closingSubtext: "SubhSandesh",
    },
  },
};
