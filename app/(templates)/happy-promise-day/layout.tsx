import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-promise-day";
const TITLE = 'Promise Day Website — Pinky Promise, a Jar of Vaade and a Signed Stamp Paper';
const DESCRIPTION =
  'A Promise Day page: hook pinkies, pull promise chits from a jar, sign your letter as a ₹∞ Pyaar Stamp Paper with a thumbprint, then lock a love-lock on the bridge.';
const SOCIAL_TITLE = '🤞 Pinky promise?';
const SOCIAL_DESCRIPTION = 'Vaada pakka 🤞';

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
