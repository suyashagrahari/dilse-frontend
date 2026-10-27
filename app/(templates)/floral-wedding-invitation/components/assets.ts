// ─── Pampas & Peony Wedding Invitation: the owner's art, from the media CDN ───
//
// Generated from public/wedding-v3/manifest.json. These files live IN THE REPO
// (client/public/wedding-v3/<folder>/) and on the media CDN; the table keeps the
// same-origin path and fw/art.ts `pic()` draws it through `cdn()`. Sizes are the intrinsic webp sizes
// (use them for width/height so images never shift the layout).

export interface WeddingAsset { src: string; w: number; h: number }

export const FW_ASSETS = {
  "template3": {
    "01-paper-background-1": { src: "/wedding-v3/template3/01-paper-background-1.webp", w: 800, h: 450 },
    "02-paper-background-2": { src: "/wedding-v3/template3/02-paper-background-2.webp", w: 1800, h: 1013 },
    "03-pampas-grass-clouds-1": { src: "/wedding-v3/template3/03-pampas-grass-clouds-1.webp", w: 1600, h: 721 },
    "04-paper-background-3": { src: "/wedding-v3/template3/04-paper-background-3.webp", w: 1600, h: 900 },
    "05-couple-on-swing": { src: "/wedding-v3/template3/05-couple-on-swing.webp", w: 800, h: 789 },
    "06-floral-drape-arch-1": { src: "/wedding-v3/template3/06-floral-drape-arch-1.webp", w: 686, h: 800 },
    "07-pampas-grass-clouds-2": { src: "/wedding-v3/template3/07-pampas-grass-clouds-2.webp", w: 800, h: 361 },
    "08-garden-rocks": { src: "/wedding-v3/template3/08-garden-rocks.webp", w: 800, h: 315 },
    "09-pampas-grass-corner": { src: "/wedding-v3/template3/09-pampas-grass-corner.webp", w: 595, h: 800 },
    "10-beige-peony": { src: "/wedding-v3/template3/10-beige-peony.webp", w: 800, h: 800 },
    "11-pink-peony-bouquet": { src: "/wedding-v3/template3/11-pink-peony-bouquet.webp", w: 728, h: 800 },
    "12-floral-drape-arch-2": { src: "/wedding-v3/template3/12-floral-drape-arch-2.webp", w: 1372, h: 1600 },
    "13-pampas-grass-border": { src: "/wedding-v3/template3/13-pampas-grass-border.webp", w: 800, h: 553 },
    "card": { src: "/wedding-v3/template3/card.webp", w: 600, h: 840 },
    /** Derived (this template): the 1200×630 art plate under the link preview (opengraph-image.tsx; JPEG, satori reads no WebP). */
    "og-floral-base": { src: "/wedding-v3/template3/og-floral-base.jpg", w: 1200, h: 630 },
  },
  "template8": {
    "00-background-colour": { src: "/wedding-v3/template8/00-background-colour.webp", w: 1013, h: 1800 },
    "01-gold-line-art-floral-swirl": { src: "/wedding-v3/template8/01-gold-line-art-floral-swirl.webp", w: 1600, h: 1454 },
    /** Derived (this template): the swirl at 720 px for phone-sized flourishes. */
    "01-gold-line-art-floral-swirl-720": { src: "/wedding-v3/template8/01-gold-line-art-floral-swirl-720.webp", w: 720, h: 654 },
    "02-pink-white-rose-bouquet": { src: "/wedding-v3/template8/02-pink-white-rose-bouquet.webp", w: 800, h: 686 },
    "03-gold-ganesha": { src: "/wedding-v3/template8/03-gold-ganesha.webp", w: 415, h: 535 },
    "04-cream-mandala-diamond-pattern-tile": { src: "/wedding-v3/template8/04-cream-mandala-diamond-pattern-tile.webp", w: 320, h: 560 },
    "card": { src: "/wedding-v3/template8/card.webp", w: 600, h: 846 },
  },
  "template2": {
    "01-garland-strand": { src: "/wedding-v3/template2/01-garland-strand.webp", w: 134, h: 800 },
    "02-marigold-pots": { src: "/wedding-v3/template2/02-marigold-pots.webp", w: 444, h: 800 },
    "03-umbrella-guard-1": { src: "/wedding-v3/template2/03-umbrella-guard-1.webp", w: 342, h: 800 },
    "04-cloud-texture-1": { src: "/wedding-v3/template2/04-cloud-texture-1.webp", w: 1600, h: 1600 },
    "05-gazebo": { src: "/wedding-v3/template2/05-gazebo.webp", w: 503, h: 800 },
    "06-gold-leaf-branch": { src: "/wedding-v3/template2/06-gold-leaf-branch.webp", w: 620, h: 800 },
    "07-fountain": { src: "/wedding-v3/template2/07-fountain.webp", w: 800, h: 601 },
    "08-green-branch": { src: "/wedding-v3/template2/08-green-branch.webp", w: 714, h: 800 },
    "09-cloud-texture-2": { src: "/wedding-v3/template2/09-cloud-texture-2.webp", w: 800, h: 800 },
    "10-umbrella-guard-2": { src: "/wedding-v3/template2/10-umbrella-guard-2.webp", w: 685, h: 1600 },
    "11-banana-leaves": { src: "/wedding-v3/template2/11-banana-leaves.webp", w: 570, h: 800 },
    "12-peacock": { src: "/wedding-v3/template2/12-peacock.webp", w: 702, h: 800 },
    "13-hanging-vine": { src: "/wedding-v3/template2/13-hanging-vine.webp", w: 427, h: 800 },
    "14-couple": { src: "/wedding-v3/template2/14-couple.webp", w: 465, h: 800 },
    "card": { src: "/wedding-v3/template2/card.webp", w: 600, h: 847 },
  },
} as const satisfies Record<string, Record<string, WeddingAsset>>;

/** The gallery card (also the template's coverImage). */
export const FW_CARD = "/wedding-v3/template3/card.webp";
