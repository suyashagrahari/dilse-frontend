import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-kiss-day-premium";
const TITLE = `Kiss Day Premium — A Thousand Kisses: Your Photo Made of Kisses, With Your Song`;
const DESCRIPTION =
  `Send a Kiss Day surprise they'll replay: warm a wax seal, catch falling kisses, watch two thousand kisses fly into your photo as your song drops, read a lipstick letter on a mirror, and stamp a kiss-booth strip.`;
const SOCIAL_TITLE = `💌 A little something for you`;
const SOCIAL_DESCRIPTION = `Sealed and made just for you. Open it with the sound on 🎧`;

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
