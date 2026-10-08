// 1200×630 link preview for /happy-chocolate-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Chocolate Day — The Midnight Chocolatier: Pour a chocolate heart, then smash it open on the chorus to find the truffles inside.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Chocolate Day',
    concept: 'The Midnight Chocolatier',
    line: 'Pour a chocolate heart, then smash it open on the chorus to find the truffles inside.',
    bg: ['#140A06', '#5A3215'],
    date: '9 February',
  });
}
