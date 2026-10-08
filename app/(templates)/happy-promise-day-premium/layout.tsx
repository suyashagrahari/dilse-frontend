import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-promise-day-premium";
const TITLE = `Promise Day Premium Website — The Red Thread: Pull It to Their Hand, Tie the Knot, With Your Song`;
const DESCRIPTION =
  `The red thread of fate: they pull it through your photos to your hand, the knot tightens as your song drops and writes “I promise” in gold. Promises on rings, a stitched vow, a promise for later and “Do you promise too?”.`;
const SOCIAL_TITLE = `🧵 Someone tied a red thread to your finger`;
const SOCIAL_DESCRIPTION = `Follow it. Sound on ✦`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: { title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION, url: `${SITE_URL}/${SLUG}` },
  twitter: { card: "summary_large_image", title: SOCIAL_TITLE, description: SOCIAL_DESCRIPTION },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
