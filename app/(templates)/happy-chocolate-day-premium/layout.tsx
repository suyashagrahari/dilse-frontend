import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-chocolate-day-premium";
const TITLE = `Chocolate Day Premium Website — The Midnight Chocolatier: Pour, Smash & Taste a Heart, With Your Song`;
const DESCRIPTION =
  `A chocolate shop that opens at midnight for one person: they pour a chocolate heart, smash it with a gold hammer as your song drops, taste truffles of reasons, find a golden ticket and tie the box. With your voice note and photos.`;
const SOCIAL_TITLE = `🍫 The shop is closed. Except for you.`;
const SOCIAL_DESCRIPTION = `Someone made you a chocolate heart, by hand, at midnight. Open it with the sound on ✦`;

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
