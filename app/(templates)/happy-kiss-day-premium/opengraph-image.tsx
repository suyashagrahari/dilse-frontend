// 1200×630 link preview for /happy-kiss-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Kiss Day — A Thousand Kisses: Two thousand tiny kisses fly together into your photo, then a letter in lipstick.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Kiss Day',
    concept: 'A Thousand Kisses',
    line: 'Two thousand tiny kisses fly together into your photo, then a letter in lipstick.',
    bg: ['#16050C', '#6E1530'],
    date: '13 February',
  });
}
