// 1200×630 link preview for /happy-promise-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Promise Day — Signed, Sealed, Promised: your promises typed on a deed, signed by you both and sealed with wax.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Promise Day',
    concept: 'Signed, Sealed, Promised',
    line: 'Your promises, typed on a deed, signed by you both and sealed with wax.',
    bg: ['#140c08', '#6E1423'],
    date: '11 February',
  });
}
