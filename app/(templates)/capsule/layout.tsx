import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "capsule";
// A capsule sealed today has to still open in 2027. The stored payload is
// versioned, and nothing written is readable — by anyone — before that date.
const TITLE = "Capsule — Sealed Predictions You Open In A Year (Free)";
const DESCRIPTION =
  "Both of you write predictions about the next year, blind to each other. It seals with a wax stamp. A year later you crack it open together, judge each one, and disagreeing counts as its own result.";
const SOCIAL_TITLE = "sealed until 14 March 2027.";
const SOCIAL_DESCRIPTION = "Nobody can read it early. Not your partner, not you.";

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
