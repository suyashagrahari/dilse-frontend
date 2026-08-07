import { Smartphone, Zap, Wallet, Receipt, Signal } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/. No real network operator and no real
// payment app is named — see the brand note in components/types.ts.
export const config: TemplatePageConfig = {
  slug: "recharge",
  type: "recharge",
  category: "gf",
  title: "Recharge",
  description:
    "A prepaid recharge for a relationship. Pick a plan from the grid, pay on a sheet that looks exactly like the real thing, and get a receipt that says the part you actually wanted to say.",
  emoji: "📶",
  color: "from-fuchsia-500 to-rose-600",
  previewText: "Plan expiring in 3 days 📶",
  bodyText:
    "Unlimited calls, unlimited data, no expiry, ₹∞. The plan cards read like plan cards right up to the benefits list, and the receipt is where it stops pretending.",
  bgGradient: "from-fuchsia-50 via-white to-rose-50",
  coverImage: "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates/recharge/cover.webp",
  tabs: [
    { id: "number", icon: Smartphone, label: "Number" },
    { id: "plans", icon: Signal, label: "Plans" },
    { id: "benefits", icon: Zap, label: "Benefits" },
    { id: "payment", icon: Wallet, label: "Payment" },
    { id: "receipt", icon: Receipt, label: "Receipt" },
  ],
  navActiveColor: "text-fuchsia-600",
  navActiveBg: "bg-fuchsia-600/15",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Your plan is about to expire. This one does not.",
      ctaText: "See plans",
      floatingEmojis: ["📶", "💳", "∞", "🧾", "💗"],
    },
    letter: {
      headerEmoji: "🧾",
      title: "Recharge successful",
      greeting: "Transaction receipt,",
      decorEmojis: ["📶", "💳", "∞"],
    },
    final: {
      headerEmoji: "∞",
      title: "Plan activated",
      subtitle: "validity: no expiry",
      wishes: [
        "Unlimited calls, including the 2 AM ones 📶",
        "Priority answering — first ring, every ring 💗",
        "Amount debited: everything, cheerfully ∞",
      ],
      closingEmoji: "💗",
      closingSubtext: "SubhSandesh",
    },
  },
};
