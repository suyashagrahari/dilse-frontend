// 1200×630 link preview for /happy-valentines-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = "Happy Valentine's Day — Our Film: Your love story as a film: titles, a montage cut to your song, and the question.";
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: "Valentine's Day",
    concept: 'Our Film',
    line: 'Your love story as a film: titles, a montage cut to your song, and the question.',
    bg: ['#0A0507', '#5E0F22'],
    date: '14 February',
  });
}
