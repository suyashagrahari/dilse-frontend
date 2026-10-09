// 1200×630 link preview for /happy-halloween-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Halloween — Boo-tiful Night: a ghost with a letter, candy with sweet dares, ghosts hiding your photos and a love potion.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Halloween',
    concept: 'Boo-tiful Night',
    line: 'A ghost with a letter, candy with sweet dares, a love potion, and will you be my boo?',
    bg: ['#3B2D6E', '#FF9EC4'],
    date: '31 October',
  });
}
