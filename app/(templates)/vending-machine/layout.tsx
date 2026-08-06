import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

// Oswald (machine stencil), Courier Prime (typed values) and Tinos (coupon
// serif) are already loaded globally in app/layout.tsx — this layout only owns
// the metadata.

const SLUG = "vending-machine";
const TITLE = "Affection Dispenser — Model RH-4402";
// Deliberately vague. The eighteen slots are the whole surprise; a preview card
// that lists them ruins the only thing this template has.
const DESCRIPTION =
  "A worn machine on a corner somewhere. Eighteen slots behind the glass, one keypad, no change given. It doesn't take coins — it takes something you'd rather not say out loud. Punch a code and watch it drop.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: "🎰 Affection Dispenser",
    description: "Eighteen slots. Zero credit. A1 is not for sale.",
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "🎰 Affection Dispenser",
    description: "Eighteen slots. Zero credit. A1 is not for sale.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
