// Copy for /halloween-offer, shared by the server page (metadata, FAQ JSON-LD)
// and the client page. Plain data, so a server component can read it.

import { config as house } from "@/app/(templates)/happy-halloween/config";
import { config as premium } from "@/app/(templates)/happy-halloween-premium/config";

export type HalloweenShowcase = {
  slug: string;
  href: string;
  name: string;
  tier: "Everyday" | "✦ Premium";
  cover: string;
  tagline: string;
  /** What she experiences, in order. */
  moments: string[];
  /** A template GIF that lives on this card. */
  gif: { file: string; w: number; h: number };
};

export const HALLOWEEN_SHOWCASE: HalloweenShowcase[] = [
  {
    slug: house.slug,
    href: `/${house.slug}`,
    name: "The Little Haunted House",
    tier: "Everyday",
    cover: house.coverImage ?? "",
    tagline: "A tiny haunted house, built just for them.",
    moments: [
      "Knocks three times on a tiny haunted house",
      "Carves a glowing pumpkin",
      "Reads your letter by flashlight",
      "Brews a love potion",
      "Gets asked: “Will you be my boo?”",
    ],
    gif: { file: "pumpkin-ghost-boo.webp", w: 360, h: 360 },
  },
  {
    slug: premium.slug,
    href: `/${premium.slug}`,
    name: "Boo-tiful Night",
    tier: "✦ Premium",
    cover: premium.coverImage ?? "",
    tagline: "Cute-spooky and very romantic.",
    moments: [
      "A ghost pops out of a mailbox with your letter",
      "Candies hide sweet dares",
      "Little ghosts hide your photos",
      "A witch flies by, cackling",
      "Bats make a heart around your photo, on your song",
    ],
    gif: { file: "floating-ghosts.webp", w: 300, h: 300 },
  },
];

export function halloweenFaqs(pct: number): { q: string; a: string }[] {
  return [
    {
      q: pct ? `Is it really ${pct}% off?` : "Is there a Halloween discount?",
      a: pct
        ? `Yes. Both Halloween templates are ${pct}% off until 31 October, 11:59 pm India time. The sale price is what you pay when you publish — nothing to apply, no code.`
        : "The Halloween templates are available at their regular price. Watch this page — when a Halloween sale is running, the discount is applied automatically when you publish.",
    },
    {
      q: "Can I try it before I pay?",
      a: "Yes. Open either template, write your letter, add photos and music, and preview the whole thing for free. You only pay when you publish the link you want to send.",
    },
    {
      q: "How scary is it?",
      a: "Cute-spooky, not horror: smiling ghosts, a pumpkin you carve, bats that make a heart. There are a couple of playful “boo!” moments, and sound stays off until they tap.",
    },
    {
      q: "Will it work on their phone?",
      a: "Yes — it is a link that opens in any browser on a phone, tablet or laptop. Nothing to install. You can also share it as a QR code.",
    },
    {
      q: "When does the Halloween drop end?",
      a: "31 October at 11:59 pm India time. Pages you publish before then stay live afterwards.",
    },
  ];
}
