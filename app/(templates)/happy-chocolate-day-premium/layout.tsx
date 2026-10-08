import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-chocolate-day-premium";
const TITLE = `Chocolate Day Premium Website — The Midnight Chocolatier, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `A midnight chocolate kitchen: pour, set and crack a chocolate heart, taste truffles of reasons, find a golden ticket and tie up the box.`;
const SOCIAL_TITLE = `🍫 The Midnight Chocolatier ✦ made for you`;
const SOCIAL_DESCRIPTION = `Someone made you something cinematic. Open it with the sound on ✦`;

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
