import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "loveflix";
const TITLE = "LoveFlix — A Streaming Service With Exactly One Show On It";
// Intriguing, never spoiling: the copy must never quote a line of the episode.
const DESCRIPTION =
  "Pick your profile, browse a catalogue of your own relationship, and press play on a season of your moments — with a Top 10 of reasons, a finale, and a letter waiting in the corner.";
const SOCIAL_TITLE = "🎬 New episode. One profile. It's yours.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: SOCIAL_TITLE,
    description: "A whole streaming service with exactly one show on it.",
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: "A whole streaming service with exactly one show on it.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
