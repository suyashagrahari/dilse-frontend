// 1200×630 link preview for /happy-rose-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = "Happy Rose Day, The Bloom of Us: a rose whose every petal is one of your photos, opening on the chorus of your song.";
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Rose Day',
    concept: "The Bloom of Us",
    line: "Your photos are the petals. It opens on the chorus of your song.",
    bg: ["#0C0406", "#7A1E2C"],
    date: '7 February',
  });
}
