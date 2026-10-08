import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-propose-day-premium";
const TITLE = `Propose Day Premium Website — Look Up, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `A cinematic proposal: a cold-open chat, candles to light, then a drone show that writes the question across the night sky right as your song drops.`;
const SOCIAL_TITLE = `💍 Look Up ✦ made for you`;
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
