// 1200×630 link preview for /happy-teddy-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = "Happy Teddy Day, Adoption Papers: a teddy with his own adoption certificate that they sign, sealed in gold on the chorus of your song.";
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Teddy Day',
    concept: "Adoption Papers",
    line: "A teddy with papers. They sign; the seal presses on your song.",
    bg: ["#140B07", "#5A3B2E"],
    date: '10 February',
  });
}
