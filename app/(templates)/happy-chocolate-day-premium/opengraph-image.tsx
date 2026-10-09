// 1200×630 link preview for /happy-chocolate-day-premium — see _valentine/kit/premium/ogImage.tsx.
import { premiumOgImage, PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = "Happy Chocolate Day, La Boîte: a chocolatier's box that opens on your song, every bonbon one of your photos.";
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return premiumOgImage({
    day: 'Chocolate Day',
    concept: 'La Boîte',
    line: 'A chocolatier\'s box that opens on your song. Every bonbon is one of your photos.',
    bg: ['#0E0705', '#4A2A1F'],
    date: '9 February',
  });
}
