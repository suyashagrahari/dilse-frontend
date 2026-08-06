import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "rewind";
// The product is called Rewind. It is not named after, and must never be
// described in terms of, anyone else's year-in-review mark.
const TITLE = "Rewind — Your Year, One Huge Number At A Time";
const DESCRIPTION =
  "A full-screen story you tap through. Every number is worked out from a single date — days, hours, winters, Diwalis — and it ends on the verdict: which couple you two actually are.";
const SOCIAL_TITLE = "We ran the numbers on this year.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: SOCIAL_TITLE,
    description: "Tap through it. Hold to pause. The last slide is the one you'll screenshot.",
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: "Tap through it. Hold to pause. The last slide is the one you'll screenshot.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
