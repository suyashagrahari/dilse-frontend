// 1200×630 link preview for /happy-rose-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Rose Day — The Glasshouse Rose: Pluck the thorns, then watch up to 99 roses bloom into a heart on the chorus of your song.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Rose Day',
    concept: 'The Glasshouse Rose',
    line: 'Pluck the thorns, then watch up to 99 roses bloom into a heart on the chorus of your song.',
    bg: ['#08140E', '#1F5A3A'],
    date: '7 February',
  });
}
