import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-hug-day";
const TITLE = 'Hug Day Website — The Jhappi Café With a Hug Menu and Hug Coupons';
const DESCRIPTION =
  'A cosy Hug Day page: squish two chubby characters into a hug, order from your Hug Menu, collect stamps in a Jhappi Passport and tear off hug coupons to redeem later.';
const SOCIAL_TITLE = '🤗 A warm hug, delivered';
const SOCIAL_DESCRIPTION = 'One jhappi, coming right up 🤗';

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
