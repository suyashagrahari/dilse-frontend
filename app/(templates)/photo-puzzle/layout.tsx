import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "photo-puzzle";
const TITLE = "The Last Piece — A Photo Jigsaw Where One Piece Isn't In The Box";
// Intriguing, never spoiling: the copy must never quote a line of the letter.
const DESCRIPTION =
  "A photo puzzle for someone you like. Every piece they place hands over another line of a letter and plays the next note of a melody. Nothing can be placed wrong and nothing is timed — and the last piece isn't in the box, because you're holding it.";
const SOCIAL_TITLE = "🧩 The last piece isn't in the box.";
const SOCIAL_DESCRIPTION = "They assemble it. You hand over the last piece yourself, while they watch.";

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
