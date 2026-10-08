import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-kiss-day-premium";
const TITLE = `Kiss Day Premium Website — A Thousand Kisses, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `Catch a thousand kisses into a jar until they lock into a mosaic of you two, read a letter in the mirror, and step into a photo booth.`;
const SOCIAL_TITLE = `💌 A Thousand Kisses ✦ made for you`;
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
