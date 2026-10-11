// 1200×630 link preview for /happy-teddy-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = "Happy Teddy Day — The Teddy House: a cuddly teddy moves into a little pastel house, wakes up with a heart, gets a name, and asks you to keep him forever.";
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: "Teddy Day",
    concept: "The Teddy House",
    line: "Wake him with a heart, name him, dress him, squeeze him, keep him forever.",
    bg: ["#C98A4B", "#FF8FAB"],
    date: "10 February",
  });
}
