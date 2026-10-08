import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-promise-day-premium";
const TITLE = `Promise Day Premium Website — The Red Thread, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `A red thread that ties two people together: pull it across the distance, knot each promise, and float a sealed vial down the river.`;
const SOCIAL_TITLE = `🤞 The Red Thread ✦ made for you`;
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
