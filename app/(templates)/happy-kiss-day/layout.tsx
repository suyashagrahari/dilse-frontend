import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-kiss-day";
const TITLE = 'Kiss Day Website — Fill a Jar With Kisses and Seal Your Letter (Cute & Family-Safe)';
const DESCRIPTION =
  'A cute, family-safe Kiss Day page: they tap to fill a jar with kisses until it overflows, open your lipstick-sealed letter, see your photos on the Kiss-Cam, scratch kiss coupons and blow one back.';
const SOCIAL_TITLE = '💌 A little something for you';
const SOCIAL_DESCRIPTION = 'A little something for you 💌';

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
