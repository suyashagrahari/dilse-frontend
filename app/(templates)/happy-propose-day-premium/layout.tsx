import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-propose-day-premium";
const TITLE = `Propose Day Premium Website — Look Up, a Drone-Show Proposal With Your Song`;
const DESCRIPTION =
  `Propose on a rooftop at night: your nervous texts arrive first, they light a candle for every reason and switch on a city of memories, then hundreds of drone lights write your question in the sky as your song drops. They say yes by sliding the ring on.`;
const SOCIAL_TITLE = `💍 Go somewhere you can see the sky`;
const SOCIAL_DESCRIPTION = `Someone planned a rooftop and borrowed the sky. Sound on, then look up ✦`;

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
