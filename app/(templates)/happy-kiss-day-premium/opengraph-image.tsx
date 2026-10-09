// 1200×630 link preview for /happy-kiss-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Kiss Day — Photo Booth: Four flashes, and a strip of your photos drops out on your song.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Kiss Day',
    concept: 'Photo Booth',
    line: 'Four flashes, and a strip of your photos drops out on your song.',
    bg: ['#0b0607', '#C1121F'],
    date: '13 February',
  });
}
