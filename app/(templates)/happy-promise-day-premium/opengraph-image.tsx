// 1200×630 link preview for /happy-promise-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Promise Day — The Pinky Promise Club: a jar of promises, a pinky to hook and a love lock that clicks shut.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Promise Day',
    concept: 'The Pinky Promise Club',
    line: 'Hook the pinky. Open the jar. Lock it forever.',
    bg: ['#C94A2C', '#5B36C4'],
    date: '11 February',
  });
}
