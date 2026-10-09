// 1200×630 link preview for /happy-propose-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = 'Happy Propose Day — The Premiere: your love story as a film, with the question as the final title card.';
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Propose Day',
    concept: 'The Premiere',
    line: 'Your love story as a film. The question is the final title card.',
    bg: ['#0B0B0D', '#5A1018'],
    date: '8 February',
  });
}
