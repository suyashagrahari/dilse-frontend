import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-hug-day-premium";
const TITLE = `Hug Day Premium — Hold Me for 20 Seconds: A Hug You Feel Through the Phone`;
const DESCRIPTION =
  `A long-distance Hug Day surprise: they hold the screen with both thumbs for twenty seconds while warmth spreads, a heartbeat slows and your words fade in — then mittens for bad days, a hoodie letter, a blanket fort of your photos and a hug back.`;
const SOCIAL_TITLE = `🤍 Someone needs 20 seconds of you`;
const SOCIAL_DESCRIPTION = `A hug, sent through the phone. Open it with the sound on 🎧`;

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
