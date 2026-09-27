import { ScrollText, Stamp, PenLine, Users, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "court-marriage",
  type: "wedding",
  category: "gf",
  title: "Court Marriage Certificate",
  description:
    "A cute, funny court marriage at the Office of the Registrar of Hearts — objections read out and overruled, witnesses' ink drawing in, a REGISTERED stamp, your photos (each with a little letter), GIFs, a sealed love letter and a certificate you can save. 4 colour themes. Not legally binding. Emotionally, very binding.",
  emoji: "📜",
  color: "from-amber-500 to-yellow-700",
  previewText: "By the power vested in absolutely nobody 📜",
  bodyText:
    "Registered at the Office of the Registrar of Hearts. Get your witnesses to sign and it's official.",
  bgGradient: "from-amber-50 via-stone-50 to-white",
  coverImage: templateMedia("court-marriage", "cover-v2.webp"),
  tabs: [
    { id: "certificate", icon: ScrollText, label: "Certificate" },
    { id: "seal", icon: Stamp, label: "Seal" },
    { id: "sign", icon: PenLine, label: "Sign" },
    { id: "witnesses", icon: Users, label: "Witnesses" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-amber-700",
  navActiveBg: "bg-amber-700/10",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "You have been summoned to the Registrar of Hearts.",
      ctaText: "Open the certificate",
      floatingEmojis: ["📜","💍","🖋️","✨","🕊️"],
    },
    letter: {
      headerEmoji: "🖋️",
      title: "Certificate of Marriage",
      greeting: "Be it known,",
      decorEmojis: ["📜","💍","🕊️"],
    },
    final: {
      headerEmoji: "💍",
      title: "Duly registered.",
      subtitle: "Witnessed and sealed",
      wishes: ["Not valid for legal, tax, or visa purposes 📜","Valid for everything that matters 💍","Objections received: 4. Objections upheld: 0 🕊️"],
      closingEmoji: "✨",
      closingSubtext: "Office of the Registrar of Hearts",
    },
  },
};
