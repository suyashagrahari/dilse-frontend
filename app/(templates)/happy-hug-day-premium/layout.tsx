import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-hug-day-premium";
const TITLE = `Hug Day Premium Website — Hold Me for 20 Seconds, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `A snowy-window Hug Day film: two figures walk to each other, you hold the screen for a twenty-second hug, and a blanket fort keeps your voice note warm.`;
const SOCIAL_TITLE = `🤗 Hold Me for 20 Seconds ✦ made for you`;
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
