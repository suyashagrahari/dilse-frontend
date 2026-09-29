import { Heart, ScrollText, Images, Wallet } from "lucide-react";
import type { TemplatePageConfig } from "@/types/template-config";
import { templateMedia } from "@/lib/templateMedia";

// Consumed by data/template-registry.ts (gallery card). The recipient-facing
// visual tokens live in components/theme.ts + components/sister.css.
//
// Note the spelling split, inherited from the brother template for the same
// reason: the SLUG is "rakshabandhan" (one word, chosen deliberately and now
// load-bearing for the sibling pair's URLs), but every piece of human-readable
// copy below — title, description, headings, previewText — uses the correct
// two-word "Raksha Bandhan". Search engines weight the title and description far
// above the URL, so the correctly spelled form is the one that actually gets
// indexed, and the one-word URL costs nothing. This is not a typo waiting to be
// "fixed" into agreement with the slug.
//
// ── WHY THIS CARD MUST NOT READ LIKE THE BROTHER CARD ───────────────────────
//
// Both pages carry the same festival and sit in the same gallery row, so the
// only thing that tells a browsing visitor which one they want is this card's
// copy. So the card leads on the inversion rather than on the festival: the
// brother's card promises "he performs the ritual", this one promises "she ties
// it". Anyone who reads only the previewText should already know which of the
// two they are looking at.
export const config: TemplatePageConfig = {
  slug: "happy-rakshabandhan-to-sister",
  type: "raksha-bandhan-sister",
  // Groups with Holi and Eid — the axis people browse by for a dated festival,
  // rather than "family", which describes the audience and not the occasion.
  category: "festival",
  title: "Happy Raksha Bandhan",
  description:
    "A Raksha Bandhan page from a brother to his sister. She picks a rakhi and ties it herself on your wrist, reads the vow you signed, turns over the two-sided statement of account, and opens her lifafa. Add your photos and the shagun you are giving her.",
  emoji: "🧿",
  color: "from-pink-500 to-rose-700",
  previewText: "Your brother sent you a rakhi to tie 🧿",
  bodyText:
    "The other half of Raksha Bandhan. You write the vow and put the shagun in the lifafa; she chooses the rakhi and ties it on your wrist, right there on her phone. The statement of account is included — hoodies never returned and chargers taken hostage in her column, and everything she actually did for you in yours. It does not balance. She writes back once.",
  bgGradient: "from-rose-100 via-amber-50 to-pink-100",
  coverImage: templateMedia("happy-rakshabandhan-to-sister", "cover-poster.webp"),
  // These mirror the four sections of the builder form, in form order — so a
  // visitor scanning the tabs is reading the list of things they will be asked
  // for. "Vachan" rather than "Vow" because the certificate screen is titled in
  // the same register, and "Lifafa" rather than "Shagun" because the envelope is
  // the object she interacts with.
  //
  // "Behna" is fixed here even though the template itself resolves Didi/Behna
  // from `sisterIsElder` at runtime: this label names a FORM SECTION for the
  // brother filling it in, not an address to her, and the gallery has no data to
  // resolve against.
  tabs: [
    { id: "behna", icon: Heart, label: "Behna" },
    { id: "vachan", icon: ScrollText, label: "Vachan" },
    { id: "photos", icon: Images, label: "Photos" },
    { id: "lifafa", icon: Wallet, label: "Lifafa" },
  ],
  navActiveColor: "text-pink-800",
  navActiveBg: "bg-pink-800/15",
  floatStyle: "circles",
  pages: {
    cover: {
      subtitle: "Your brother sent you a rakhi to tie.",
      ctaText: "Open it",
      floatingEmojis: ["🧿", "🌼", "✨", "🪔", "💗"],
    },
    letter: {
      headerEmoji: "🧿",
      title: "Raksha Bandhan",
      greeting: "Behna,",
      decorEmojis: ["🌼", "🪔", "✦"],
    },
    final: {
      headerEmoji: "💗",
      title: "Rakhi tied",
      subtitle: "and the vow signed",
      wishes: [
        "Nobody gets to make you cry. That job is mine 🧿",
        "Call me first. Any hour 🪔",
        "Ghar aaunga. Har baar 🌼",
      ],
      closingEmoji: "💗",
      closingSubtext: "happy raksha bandhan",
    },
  },
};
