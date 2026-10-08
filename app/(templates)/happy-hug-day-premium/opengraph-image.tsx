// 1200×630 link preview for /happy-hug-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Hug Day — Hold Me for 20 Seconds: A twenty-second hug on the screen, warm hands, a hoodie letter and a blanket fort.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Hug Day',
    concept: 'Hold Me for 20 Seconds',
    line: 'A twenty-second hug on the screen, warm hands, a hoodie letter and a blanket fort.',
    bg: ['#0E0B1E', '#4A2A5A'],
    date: '12 February',
  });
}
