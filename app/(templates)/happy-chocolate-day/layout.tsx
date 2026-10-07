import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-chocolate-day";
const TITLE = 'Chocolate Day Gift Website — A Box of Chocolates, Each Hiding a Reason You Love Them';
const DESCRIPTION =
  'A Chocolate Day surprise: they untie the ribbon and peel each foil-wrapped piece to find one sweet reason you love them, then the last truffle melts into your letter. Add your photos as The Assortment.';
const SOCIAL_TITLE = '🍫 A box of chocolates, just for you';
const SOCIAL_DESCRIPTION = '9 pieces. 9 reasons. 0 calories 🍫';

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
