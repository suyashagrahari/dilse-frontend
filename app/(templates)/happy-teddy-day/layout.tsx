import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-teddy-day";
const TITLE = 'Teddy Day Website — A Claw Machine That Always Wins Them Your Teddy';
const DESCRIPTION =
  'A cute Teddy Day page: a pastel claw machine rigged to win the teddy you named and dressed, which carries your letter in its paws. Squeeze it for little messages, pin your photos to a cork board.';
const SOCIAL_TITLE = '🧸 Someone left you a teddy';
const SOCIAL_DESCRIPTION = 'Insert coin. Win a teddy 🧸';

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
