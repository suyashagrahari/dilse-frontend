// ─── Faith weddings (Anand Karaj · Nikah · Holy Matrimony): the art ─────────
//
// The owner's art (Desktop/wedding-assets template23-nikah, template24-anand-karaj,
// template25-christian, plus template16/20 gold pieces), converted to webp in
// client/public/wedding-v3/faith-*/ and mirrored on the media CDN. The table keeps
// the same-origin path; art.ts draws it through `cdn()`. Sizes are the intrinsic
// webp sizes (width/height on every <img>, so nothing shifts).
//
// Shared with Pampas & Peony: the handmade paper (template3) and the gold
// line-art swirl (template8), which every faith wears the same way.

export interface WeddingAsset { src: string; w: number; h: number }

export const FAITH_ASSETS = {
  "faith-nikah": {
    "mn-arch": { src: "/wedding-v3/faith-nikah/mn-arch.webp", w: 928, h: 1152 },
    /** Derived: the same arch with its pillar columns lengthened (a feathered repeat of the plain column band), for phones' full height. */
    "mn-arch-tall": { src: "/wedding-v3/faith-nikah/mn-arch-tall.webp", w: 928, h: 2143 },
    "mn-rose-corner": { src: "/wedding-v3/faith-nikah/mn-rose-corner.webp", w: 380, h: 520 },
    "mn-rose-side": { src: "/wedding-v3/faith-nikah/mn-rose-side.webp", w: 200, h: 520 },
    "mn-couple-seated": { src: "/wedding-v3/faith-nikah/mn-couple-seated.webp", w: 1200, h: 918 },
    "mn-couple-seated-600": { src: "/wedding-v3/faith-nikah/mn-couple-seated-600.webp", w: 600, h: 459 },
    "mn-urn": { src: "/wedding-v3/faith-nikah/mn-urn.webp", w: 640, h: 960 },
    "mn-bismillah": { src: "/wedding-v3/faith-nikah/mn-bismillah.webp", w: 700, h: 648 },
    "mn-jharokha": { src: "/wedding-v3/faith-nikah/mn-jharokha.webp", w: 1061, h: 1482 },
    "mn-blush-corner-r": { src: "/wedding-v3/faith-nikah/mn-blush-corner-r.webp", w: 700, h: 771 },
    "mn-blush-corner-l": { src: "/wedding-v3/faith-nikah/mn-blush-corner-l.webp", w: 700, h: 771 },
    "mn-lanterns": { src: "/wedding-v3/faith-nikah/mn-lanterns.webp", w: 1600, h: 657 },
    "mn-couple-standing": { src: "/wedding-v3/faith-nikah/mn-couple-standing.webp", w: 700, h: 1132 },
    "mn-gold-medallion": { src: "/wedding-v3/faith-nikah/mn-gold-medallion.webp", w: 640, h: 640 },
  },
  "faith-sikh": {
    /** Derived: the arch with its sides lengthened (a feathered repeat of the plain band below the lanterns), for phones' full height. */
    "sk-panel": { src: "/wedding-v3/faith-sikh/sk-panel.webp", w: 1000, h: 1400 },
    "sk-panel-600": { src: "/wedding-v3/faith-sikh/sk-panel-600.webp", w: 600, h: 840 },
    "sk-amritsar": { src: "/wedding-v3/faith-sikh/sk-amritsar.webp", w: 2000, h: 1315 },
    "sk-amritsar-tall": { src: "/wedding-v3/faith-sikh/sk-amritsar-tall.webp", w: 900, h: 1005 },
    "sk-temple-saffron": { src: "/wedding-v3/faith-sikh/sk-temple-saffron.webp", w: 1200, h: 810 },
    "sk-temple-gold": { src: "/wedding-v3/faith-sikh/sk-temple-gold.webp", w: 1041, h: 553 },
    "sk-peony-l": { src: "/wedding-v3/faith-sikh/sk-peony-l.webp", w: 880, h: 1070 },
    "sk-peony-r": { src: "/wedding-v3/faith-sikh/sk-peony-r.webp", w: 880, h: 879 },
    "sk-peony-garland": { src: "/wedding-v3/faith-sikh/sk-peony-garland.webp", w: 1400, h: 358 },
    "sk-wash": { src: "/wedding-v3/faith-sikh/sk-wash.webp", w: 900, h: 1260 },
    "sk-bouquet": { src: "/wedding-v3/faith-sikh/sk-bouquet.webp", w: 560, h: 615 },
    "sk-sprigs": { src: "/wedding-v3/faith-sikh/sk-sprigs.webp", w: 900, h: 676 },
  },
  "faith-christian": {
    "ch-lily-arc": { src: "/wedding-v3/faith-christian/ch-lily-arc.webp", w: 1400, h: 885 },
    "ch-lily-spray": { src: "/wedding-v3/faith-christian/ch-lily-spray.webp", w: 1200, h: 510 },
    "ch-doves": { src: "/wedding-v3/faith-christian/ch-doves.webp", w: 800, h: 502 },
    "ch-rose-a": { src: "/wedding-v3/faith-christian/ch-rose-a.webp", w: 408, h: 381 },
    "ch-rose-b": { src: "/wedding-v3/faith-christian/ch-rose-b.webp", w: 339, h: 336 },
    "ch-rose-c": { src: "/wedding-v3/faith-christian/ch-rose-c.webp", w: 293, h: 277 },
    "ch-sprigs": { src: "/wedding-v3/faith-christian/ch-sprigs.webp", w: 900, h: 676 },
    "ch-wash": { src: "/wedding-v3/faith-christian/ch-wash.webp", w: 900, h: 1260 },
    "ch-couple-vows": { src: "/wedding-v3/faith-christian/ch-couple-vows.webp", w: 491, h: 760 },
    "ch-couple-ring": { src: "/wedding-v3/faith-christian/ch-couple-ring.webp", w: 457, h: 760 },
    "ch-couple-rehearsal": { src: "/wedding-v3/faith-christian/ch-couple-rehearsal.webp", w: 433, h: 760 },
    "ch-couple-reception": { src: "/wedding-v3/faith-christian/ch-couple-reception.webp", w: 525, h: 760 },
    "ch-panel": { src: "/wedding-v3/faith-christian/ch-panel.webp", w: 1000, h: 1400 },
    "ch-panel-600": { src: "/wedding-v3/faith-christian/ch-panel-600.webp", w: 600, h: 840 },
    "ch-varengeville": { src: "/wedding-v3/faith-christian/ch-varengeville.webp", w: 2000, h: 1599 },
    "ch-varengeville-tall": { src: "/wedding-v3/faith-christian/ch-varengeville-tall.webp", w: 900, h: 1005 },
    "ch-corner": { src: "/wedding-v3/faith-christian/ch-corner.webp", w: 640, h: 546 },
    "ch-bloom": { src: "/wedding-v3/faith-christian/ch-bloom.webp", w: 520, h: 391 },
    "ch-flourish": { src: "/wedding-v3/faith-christian/ch-flourish.webp", w: 800, h: 214 },
  },
  /** Celebration art (Desktop/wedding-assets/template26-mehndi-celebrations): the Nikah's and the Anand Karaj's function cards. */
  "faith-shared": {
    "fs-bride-pink": { src: "/wedding-v3/faith-shared/fs-bride-pink.webp", w: 417, h: 760 },
    "fs-bride-orange": { src: "/wedding-v3/faith-shared/fs-bride-orange.webp", w: 493, h: 760 },
    "fs-bride-green": { src: "/wedding-v3/faith-shared/fs-bride-green.webp", w: 469, h: 760 },
    "fs-mehndi-stage": { src: "/wedding-v3/faith-shared/fs-mehndi-stage.webp", w: 900, h: 387 },
    "fs-dholak": { src: "/wedding-v3/faith-shared/fs-dholak.webp", w: 640, h: 483 },
    "fs-basket": { src: "/wedding-v3/faith-shared/fs-basket.webp", w: 640, h: 420 },
    "fs-sofa": { src: "/wedding-v3/faith-shared/fs-sofa.webp", w: 760, h: 489 },
    "fs-chair-stage": { src: "/wedding-v3/faith-shared/fs-chair-stage.webp", w: 760, h: 443 },
    "fs-curtain": { src: "/wedding-v3/faith-shared/fs-curtain.webp", w: 501, h: 760 },
  },
  "shared": {
    "paper": { src: "/wedding-v3/template3/02-paper-background-2.webp", w: 1800, h: 1013 },
    "paperSoft": { src: "/wedding-v3/template3/04-paper-background-3.webp", w: 1600, h: 900 },
    "swirl": { src: "/wedding-v3/template8/01-gold-line-art-floral-swirl.webp", w: 1600, h: 1454 },
    "swirlSm": { src: "/wedding-v3/template8/01-gold-line-art-floral-swirl-720.webp", w: 720, h: 654 },
  },
} as const satisfies Record<string, Record<string, WeddingAsset>>;
