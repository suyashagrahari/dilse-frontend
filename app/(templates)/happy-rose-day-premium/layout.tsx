import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "happy-rose-day-premium";
const TITLE = `Rose Day Premium Website — The Glasshouse Rose, a Garden That Blooms on Your Song`;
const DESCRIPTION =
  `Grow them a glasshouse rose: they wipe their name off the fogged door, pluck the thorns you got through together, and a garden of up to 99 roses blooms in a heart as your song's chorus drops. Ends with a pressed-book letter, dew-drop photos and an engraved eternal rose.`;
const SOCIAL_TITLE = `🌹 Someone has been growing something for you`;
const SOCIAL_DESCRIPTION = `A glasshouse, at dusk. Go somewhere quiet, sound on ✦`;

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
