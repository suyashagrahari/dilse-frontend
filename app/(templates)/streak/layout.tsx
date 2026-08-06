import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "streak";
// The product is called Streak. It is a shared check-in, and its copy must
// never borrow the loss framing that made other streak products punishing.
const TITLE = "Streak — A Daily Check-In For Two (Free)";
const DESCRIPTION =
  "Two people, one tap a day. The streak grows, every check-in keeps a word and an optional photo, and the grid becomes a diary neither of you meant to write. Miss a day and it pauses at its high water mark — it never resets to zero.";
const SOCIAL_TITLE = "day 84. both of us.";
const SOCIAL_DESCRIPTION = "Hold to check in. Leave one word. Whoever's first can seal a line for the other.";

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
