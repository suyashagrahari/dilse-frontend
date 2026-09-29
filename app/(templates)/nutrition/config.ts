import { Package, ListOrdered, Percent, FlaskConical, Heart } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/. No real food brand and no regulator is
// named anywhere in this template — the panel is a format, not a trademark.
export const config: TemplatePageConfig = {
  slug: "nutrition",
  type: "nutrition",
  category: "bestfriend",
  title: "Nutrition Facts",
  description:
    "A nutrition label where the product is a person. Serving size: 1. Calories: ∞. Tap any row and the sender tells you why that one is on the label.",
  emoji: "🥫",
  color: "from-stone-500 to-neutral-700",
  previewText: "Serving size: 1 Meera 🥫",
  bodyText:
    "8px regulatory type, hard black rules, an ingredients paragraph nobody can read. Then, underneath the package, the same person says the sincere thing in a completely different voice.",
  bgGradient: "from-stone-50 via-white to-neutral-50",
  coverImage: templateMedia("nutrition", "cover-v2.webp"),
  tabs: [
    { id: "product", icon: Package, label: "Product" },
    { id: "serving", icon: ListOrdered, label: "Serving" },
    { id: "nutrients", icon: Percent, label: "Nutrients" },
    { id: "ingredients", icon: FlaskConical, label: "Ingredients" },
    { id: "message", icon: Heart, label: "Message" },
  ],
  navActiveColor: "text-stone-700",
  navActiveBg: "bg-stone-700/15",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Please read the label before use.",
      ctaText: "Read the label",
      floatingEmojis: ["🥫", "∞", "🧾", "🏷️", "💗"],
    },
    letter: {
      headerEmoji: "🏷️",
      title: "Nutrition Facts",
      greeting: "Amount per serving,",
      decorEmojis: ["🥫", "∞", "🧾"],
    },
    final: {
      headerEmoji: "∞",
      title: "Servings per container: 1",
      subtitle: "there is only one",
      wishes: [
        "Calories: ∞ — worth every one 💗",
        "Not a significant source of patience 🥫",
        "Contains: sarcasm, strong opinions 🏷️",
      ],
      closingEmoji: "💗",
      closingSubtext: "SubhSandesh",
    },
  },
};
