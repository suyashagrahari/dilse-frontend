// 1200×630 link preview for /happy-propose-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Propose Day — Look Up: A drone show writes your initials, a ring box and the question across the night sky.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Propose Day',
    concept: 'Look Up',
    line: 'A drone show writes your initials, a ring box and the question across the night sky.',
    bg: ['#060A1C', '#24306E'],
    date: '8 February',
  });
}
