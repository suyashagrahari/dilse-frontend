// 1200×630 link preview for /happy-promise-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Promise Day — The Red Thread: Pull a red thread through your photos until the knot turns gold and writes I promise.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Promise Day',
    concept: 'The Red Thread',
    line: 'Pull a red thread through your photos until the knot turns gold and writes I promise.',
    bg: ['#0B0A1A', '#4A1525'],
    date: '11 February',
  });
}
