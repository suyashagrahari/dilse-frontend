import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-teddy-day-premium";
const TITLE = `Teddy Day Premium Website — Made With a Heart: Stuff a Teddy, Sew In Your Heart, With Your Song`;
const DESCRIPTION =
  `A parcel holds an unfinished teddy: they stuff it, warm your fabric heart, hear it whisper, sew it in, and it wakes up as your song drops. Then a torchlight letter, star-lamp photos, hide-and-seek and a tuck-in.`;
const SOCIAL_TITLE = `🧸 A parcel for you: 1 teddy (unfinished)`;
const SOCIAL_DESCRIPTION = `It needs a heart. Open it with the sound on ✦`;

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
