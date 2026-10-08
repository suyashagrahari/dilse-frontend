// 1200×630 link preview for /happy-halloween-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Halloween — The Midnight Manor: A moonlit manor, a spirit board that spells their name, and twelve bells at midnight.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Halloween',
    concept: 'The Midnight Manor',
    line: 'A moonlit manor, a spirit board that spells their name, and twelve bells at midnight.',
    bg: ['#0E0A1A', '#7A2E12'],
    date: '31 October',
  });
}
