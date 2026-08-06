import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "hold-my-hand";
const TITLE = "Hold My Hand — Don't Let Go For 60 Seconds";
const DESCRIPTION =
  "Send someone a letter they can only read by holding the screen for sixty seconds. Let go and it drains three times faster than it filled. Their face comes into focus the longer you hold.";

/**
 * The share preview is deliberately understated. This page is at its best when
 * the recipient does not know what is being asked of them until they open it —
 * so the card sets a mood and states the rule, and gives away nothing about the
 * letter, the ghost fragments, or the ending.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: "🫀 don't let go",
    description: "Sixty seconds. One finger. Something happens if you make it.",
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "🫀 don't let go",
    description: "Sixty seconds. One finger. Something happens if you make it.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
