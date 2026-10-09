// 1200×630 link preview for /happy-halloween-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Halloween — A Night at the Manor: your photos found by torchlight, a spirit board that spells their name, and three tarot cards.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Halloween',
    concept: 'A Night at the Manor',
    line: 'Your photos found by torchlight, a spirit board that spells their name, and three tarot cards.',
    bg: ['#120A14', '#5C1A1B'],
    date: '31 October',
  });
}
