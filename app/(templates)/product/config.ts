import { ShoppingBag, Images, Star, MessageSquare, Package } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/. Nothing here may name the marketplace this
// borrows its layout from — see the brand note at the top of components/types.ts.
export const config: TemplatePageConfig = {
  slug: "product",
  type: "product",
  category: "gf",
  title: "Product",
  description:
    "List the person you love as a product. Gallery, buy box, bullet points, a spec table, customer questions and a review section her friends can actually write in. The price is ∞ and it is not negotiable.",
  emoji: "🛒",
  color: "from-amber-400 to-orange-500",
  previewText: "Original, 1 Count. In stock. 🛒",
  bodyText:
    "A full listing page for a person: five photos, a delivery promise, 'frequently bought together', and a review block that opens for contributions and stays closed until you approve them.",
  bgGradient: "from-amber-50 via-white to-orange-50",
  coverImage: templateMedia("product", "cover-poster.webp"),
  tabs: [
    { id: "listing", icon: ShoppingBag, label: "Listing" },
    { id: "gallery", icon: Images, label: "Photos" },
    { id: "details", icon: Package, label: "Details" },
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "questions", icon: MessageSquare, label: "Q&A" },
  ],
  navActiveColor: "text-orange-500",
  navActiveBg: "bg-orange-500/15",
  floatStyle: "stars",
  pages: {
    cover: {
      subtitle: "One listing. One unit. Never restocked.",
      ctaText: "View the listing",
      floatingEmojis: ["🛒", "⭐", "📦", "🏷️", "💛"],
    },
    letter: {
      headerEmoji: "📦",
      title: "About this item",
      greeting: "Product description,",
      decorEmojis: ["🛒", "⭐", "📦"],
    },
    final: {
      headerEmoji: "⭐",
      title: "Thanks for your order",
      subtitle: "no returns, no exchanges",
      wishes: [
        "Read the bullet points. All of them are true ⭐",
        "The reviews are from people who know her 📦",
        "The price is ∞. That is the correct price 🏷️",
      ],
      closingEmoji: "💛",
      closingSubtext: "SubhSandesh",
    },
  },
};
