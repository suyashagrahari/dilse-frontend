import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-rose-day-premium";
const TITLE = `Rose Day Premium Website — The Glasshouse Rose, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `A rose grown under glass for one person: fog the door open, clear the thorns, catch a hidden sentence in falling petals, and watch a whole garden bloom on the chorus of your song.`;
const SOCIAL_TITLE = `🌹 The Glasshouse Rose ✦ made for you`;
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
