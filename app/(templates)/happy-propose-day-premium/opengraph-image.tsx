// 1200×630 link preview for /happy-propose-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Propose Day — The Little Proposal: a cute love story with a ring hidden in a gift box.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Propose Day',
    concept: 'The Little Proposal',
    line: 'Knock on the little door. Find the ring. Say yes.',
    bg: ['#A07BFF', '#FF4D6D'],
    date: '8 February',
  });
}
