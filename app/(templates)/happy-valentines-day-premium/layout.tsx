import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-valentines-day-premium";
const TITLE = `Valentine's Day Premium Website — Our Film, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `Your relationship as a film: a ticket at the door, a "previously on" week recap, a constellation of your stats, the big question in takes, and end credits with a poster.`;
const SOCIAL_TITLE = `💘 Our Film ✦ made for you`;
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
