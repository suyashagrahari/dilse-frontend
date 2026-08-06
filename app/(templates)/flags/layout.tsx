import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "flags";
const TITLE = "Red Flag, Green Flag — 1 Profile Near You";

// Intriguing, never spoiling. The whole template turns on the recipient not
// knowing that the direction they swipe picks which answer they get, so the
// share preview says what it is and stops.
const DESCRIPTION =
  "One profile. Eleven statements about them. Swipe left, right, or straight up — every card answers back, and the last screen has a verdict about you.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: "🚩 1 profile near you.",
    description: DESCRIPTION,
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "🚩 1 profile near you.",
    description: DESCRIPTION,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
