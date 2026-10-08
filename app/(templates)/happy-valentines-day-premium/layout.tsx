import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-valentines-day-premium";
const TITLE = `Valentine's Day Premium Website — Our Film, Your Love Story as a Movie`;
const DESCRIPTION =
  `Turn your relationship into a film starring your Valentine: opening titles, a constellation of the night you met, your photos as a montage cut to your song's chorus, a three-part letter, the big question in black-and-white takes, and end credits with a movie poster.`;
const SOCIAL_TITLE = `🎬 You're starring in something tonight`;
const SOCIAL_DESCRIPTION = `Someone directed a film about the two of you. Tonight's screening starts when you tap ✦ sound on`;

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
