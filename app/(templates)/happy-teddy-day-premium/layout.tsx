import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-teddy-day-premium";
const TITLE = `Teddy Day Premium Website — Made With a Heart, a Cinematic Page With Your Song`;
const DESCRIPTION =
  `A teddy made by hand for them: open the parcel, give it a heart, watch it wake up, play hide-and-seek and tuck it in with your voice note.`;
const SOCIAL_TITLE = `🧸 Made With a Heart ✦ made for you`;
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
