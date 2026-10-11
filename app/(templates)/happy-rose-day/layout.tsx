import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-rose-day";
const TITLE = 'Rose Day Surprise Website — Grow Them a Rose That Blooms Into Your Letter';
const DESCRIPTION =
  'Make a Rose Day page for your partner: they press and hold to grow a rose in the colour you chose, pluck “loves me, loves me not” (it always ends on loves me), then open a wax-sealed letter and a bouquet of your photos.';
const SOCIAL_TITLE = '🌹 A rose is waiting for you';
const SOCIAL_DESCRIPTION = 'Hold it, and it blooms 🌹';

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
