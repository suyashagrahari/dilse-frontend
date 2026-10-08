// 1200×630 link preview for /happy-teddy-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Teddy Day — Made With a Heart: Stuff and stitch a teddy by hand until he wakes up and says his first words.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Teddy Day',
    concept: 'Made With a Heart',
    line: 'Stuff and stitch a teddy by hand until he wakes up and says his first words.',
    bg: ['#120A1C', '#4A2F5E'],
    date: '10 February',
  });
}
