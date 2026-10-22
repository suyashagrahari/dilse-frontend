// ─── Palace Door Wedding Invitation: the owner's art, served from /public/wedding-v3 ───
//
// Generated from public/wedding-v3/manifest.json. These files live IN THE REPO
// (client/public/wedding-v3/<folder>/) and are served by Next from the site's own
// origin. Never upload them to S3 or the CDN. Sizes are the intrinsic webp sizes
// (use them for width/height so images never shift the layout).

export interface WeddingAsset { src: string; w: number; h: number }

export const PD_ASSETS = {
  "template13": {
    "01-door-full-rajasthani-arch": { src: "/wedding-v3/template13/01-door-full-rajasthani-arch.webp", w: 1013, h: 1800 },
    "02-door-left-half": { src: "/wedding-v3/template13/02-door-left-half.webp", w: 506, h: 1800 },
    "03-door-right-half": { src: "/wedding-v3/template13/03-door-right-half.webp", w: 506, h: 1800 },
    "05-golden-border-frame": { src: "/wedding-v3/template13/05-golden-border-frame.webp", w: 777, h: 800 },
    "06-banana-leaves": { src: "/wedding-v3/template13/06-banana-leaves.webp", w: 800, h: 739 },
    "card": { src: "/wedding-v3/template13/card.webp", w: 506, h: 900 },
  },
  "template15": {
    "01-bride-groom-hands-mehndi-mauli-thread": { src: "/wedding-v3/template15/01-bride-groom-hands-mehndi-mauli-thread.webp", w: 1600, h: 1248 },
    "02-pink-white-floral-arch": { src: "/wedding-v3/template15/02-pink-white-floral-arch.webp", w: 1600, h: 1188 },
    "03-hanging-gold-lanterns-trio": { src: "/wedding-v3/template15/03-hanging-gold-lanterns-trio.webp", w: 800, h: 800 },
    "04-urn-planter-with-greenery": { src: "/wedding-v3/template15/04-urn-planter-with-greenery.webp", w: 566, h: 800 },
    "05-gold-pearl-jhumka-hangings": { src: "/wedding-v3/template15/05-gold-pearl-jhumka-hangings.webp", w: 399, h: 800 },
    "06-havan-kund-fire-aag": { src: "/wedding-v3/template15/06-havan-kund-fire-aag.webp", w: 791, h: 800 },
    "07-white-stone-railing-balustrade": { src: "/wedding-v3/template15/07-white-stone-railing-balustrade.webp", w: 1600, h: 375 },
    "08-terracotta-carpet": { src: "/wedding-v3/template15/08-terracotta-carpet.webp", w: 800, h: 114 },
    "09-white-classic-column-pillar": { src: "/wedding-v3/template15/09-white-classic-column-pillar.webp", w: 431, h: 1800 },
    "10-ivy-curtain-hanging-greenery": { src: "/wedding-v3/template15/10-ivy-curtain-hanging-greenery.webp", w: 1600, h: 622 },
    "11-blue-gradient-background": { src: "/wedding-v3/template15/11-blue-gradient-background.webp", w: 1013, h: 1800 },
    "card": { src: "/wedding-v3/template15/card.webp", w: 600, h: 468 },
  },
  "template14-couple-haldi-mehndi": {
    "02-parchment-scroll-banner": { src: "/wedding-v3/template14-couple-haldi-mehndi/02-parchment-scroll-banner.webp", w: 1600, h: 668 },
    "03-couple-sangeet-dancing": { src: "/wedding-v3/template14-couple-haldi-mehndi/03-couple-sangeet-dancing.webp", w: 748, h: 800 },
    "04-couple-reception-tux-gown": { src: "/wedding-v3/template14-couple-haldi-mehndi/04-couple-reception-tux-gown.webp", w: 604, h: 800 },
    "05-couple-mehndi-orange-saree": { src: "/wedding-v3/template14-couple-haldi-mehndi/05-couple-mehndi-orange-saree.webp", w: 581, h: 800 },
    "06-couple-engagement-ivory-lehenga": { src: "/wedding-v3/template14-couple-haldi-mehndi/06-couple-engagement-ivory-lehenga.webp", w: 502, h: 800 },
    "07-couple-haldi-yellow": { src: "/wedding-v3/template14-couple-haldi-mehndi/07-couple-haldi-yellow.webp", w: 466, h: 800 },
    "08-couple-wedding-red-lehenga": { src: "/wedding-v3/template14-couple-haldi-mehndi/08-couple-wedding-red-lehenga.webp", w: 446, h: 800 },
    "card": { src: "/wedding-v3/template14-couple-haldi-mehndi/card.webp", w: 600, h: 240 },
  },
} as const satisfies Record<string, Record<string, WeddingAsset>>;

/** The gallery card (also the template's coverImage). */
export const PD_CARD = "/wedding-v3/template13/card.webp";
