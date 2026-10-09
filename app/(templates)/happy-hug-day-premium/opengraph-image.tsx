// 1200×630 link preview for /happy-hug-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Hug Day — The Twenty-Second Hug: hold your thumb on their photo while it blooms into colour, on your song.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Hug Day',
    concept: 'The Twenty-Second Hug',
    line: 'Hold on for twenty seconds. Your photo blooms into colour as the song lands.',
    bg: ['#120C09', '#4B3426'],
    date: '12 February',
  });
}
