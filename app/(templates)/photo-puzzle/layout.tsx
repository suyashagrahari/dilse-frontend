import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "photo-puzzle";
const TITLE = "The Last Piece — A Sliding Photo Puzzle Gift For Your Partner";
// Intriguing, never spoiling: the copy must never quote a line of the letter.
const DESCRIPTION =
  "Turn your photo into a sliding-tile puzzle for someone you love — easy 3×3, medium 4×4 or hard 5×5. When they solve it, the last piece flies into place, confetti pops, and your memory photos and love letter unlock.";
const SOCIAL_TITLE = "🧩 The last piece isn't in the box.";
const SOCIAL_DESCRIPTION = "Slide the tiles back. When the picture is whole, the last piece flies in — and the letter opens.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
