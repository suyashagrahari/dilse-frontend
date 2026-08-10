import { Package, CreditCard, Hand, Ticket, Download } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

export const config: TemplatePageConfig = {
  slug: "vending-machine",
  type: "love",
  category: "gf",
  title: "Affection Dispenser",
  description:
    "A vending machine loaded with eighteen things you'd never say out loud. They pay with a confession, punch a code, and watch it drop. One slot jams on purpose.",
  coverImage: templateMedia("vending-machine", "cover.jpg"),
  emoji: "🎰",
  color: "from-teal-600 to-emerald-800",
  previewText: "CREDIT ₹0.00 · INSERT ONE THING YOU LOVE 🎰",
  bodyText:
    "Model RH-4402. Eighteen slots. Eighteen chances. A1 is not for sale.",
  bgGradient: "from-teal-50 via-emerald-50 to-white",
  tabs: [
    { id: "machine", icon: Package, label: "Machine" },
    { id: "slots", icon: Ticket, label: "Slots" },
    { id: "credit", icon: CreditCard, label: "Credit" },
    { id: "stuck", icon: Hand, label: "Stuck" },
    { id: "save", icon: Download, label: "Save" },
  ],
  navActiveColor: "text-teal-700",
  navActiveBg: "bg-teal-700/10",
  floatStyle: "hearts",
  pages: {
    cover: {
      subtitle: "Eighteen slots. You have zero credit.",
      ctaText: "Approach the machine",
      floatingEmojis: ["🎰","🪙","💌","✨","🧃"],
    },
    letter: {
      headerEmoji: "🎰",
      title: "Affection Dispenser",
      greeting: "Select item,",
      decorEmojis: ["🪙","💌","🧃"],
    },
    final: {
      headerEmoji: "🪙",
      title: "Please collect item.",
      subtitle: "Thank you · Have a nice day · I mean it",
      wishes: ["Non-transferable 🎫","Expiry: none 🪙","A1 is still mine 🎰"],
      closingEmoji: "✨",
      closingSubtext: "Model RH-4402 · Serial 0447",
    },
  },
};
