import { Heart, Flame, Images, Gift } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { GANESH_ASSETS } from "./assets";

// Consumed by `data/template-registry.ts` (the gallery card, and — because both
// admin screens read the same list — the show/hide toggle in /admin/templates
// and the price row in /admin/pricing). The recipient-facing visual tokens live
// in components/theme.ts + components/ganesh.css.
export const config: TemplatePageConfig = {
  slug: "happy-ganesh-chaturthi",
  type: "ganesh-chaturthi",
  // Groups with Holi, Eid and the two rakhi pages — the axis people browse by
  // for a dated festival, rather than an audience, which this template does not
  // have one of.
  category: "festival",
  title: "Happy Ganesh Chaturthi",
  description:
    "One long page they scroll: your greeting, the aarti with the lamp going round, what the five offerings are for, your photo, what you are both hoping for this year, and a box where they write one line back to you. All in English, with a card for your Instagram story.",
  emoji: "🪔",
  color: "from-amber-400 to-red-600",
  previewText: "One page, top to bottom, and the lamp goes round",
  bodyText:
    "A Ganesh Chaturthi page for everyone who cannot be in the same room this year. Nothing to tap through — they open the link and scroll: your lines, the aarti, the five offerings and what each one is for, your photograph, and what the two of you are hoping for. At the end they write one line back to you. Download the card for your story.",
  bgGradient: "from-amber-100 via-orange-50 to-red-100",
  // The gallery cover. Set from the asset so the real dimensions travel with it
  // and no frame has to guess — see the note at the top of assets.ts. NOT the
  // GIF: an animation looping inside a grid of fifty still cards.
  coverImage: GANESH_ASSETS.cover.src,
  // The gallery card's quick-look chips. They mirror the page's own sections
  // rather than the builder's, which is one scroll with no tabs at all now.
  tabs: [
    { id: "greeting", icon: Heart, label: "Greeting" },
    { id: "aarti", icon: Flame, label: "Aarti" },
    { id: "photo", icon: Images, label: "Photo" },
    { id: "wishes", icon: Gift, label: "Wishes" },
  ],
  navActiveColor: "text-red-700",
  navActiveBg: "bg-red-700/15",
  floatStyle: "circles",
  // ── `pages` IS GALLERY COPY, NOT THIS TEMPLATE'S CONTENT ─────────────────
  //
  // `TemplatePageConfig` carries a cover/letter/final trio for the generic
  // registry-driven templates, which really do render from it. This template
  // renders from `GaneshData` and never reads any of it — it is here because the
  // type requires it, and the gallery uses a line or two of it for previews.
  //
  // Kept in the same plain English as the page itself, so a preview built from
  // it cannot contradict the thing it is previewing.
  pages: {
    cover: {
      subtitle: "One page, and the lamp goes round.",
      ctaText: "Open it",
      floatingEmojis: ["🪔", "🌼", "🐘", "✨"],
    },
    letter: {
      headerEmoji: "🪔",
      title: "Ganesh Chaturthi",
      greeting: "For you,",
      decorEmojis: ["🌼", "🪔", "✦"],
    },
    final: {
      headerEmoji: "🐘",
      title: "Take one",
      subtitle: "the sweet at the end",
      wishes: [
        "May the obstacles be somebody else's this year 🪔",
        "Sweets first, problems later 🍬",
        "Same house, same people, one more year 🌼",
      ],
      closingEmoji: "🪔",
      closingSubtext: "happy ganesh chaturthi",
    },
  },
};
