// 1200×630 link preview for /happy-valentines-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = "Happy Valentine's Day — Us, Wrapped: your year in love as a story, with your song, top memories and days together.";
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: "Valentine's Day",
    concept: 'Us, Wrapped',
    line: 'Your year in love, wrapped: your song, your top memories, and the days together.',
    bg: ['#151018', '#FF4B3E'],
    date: '14 February',
  });
}
