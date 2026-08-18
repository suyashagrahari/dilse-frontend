import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const SLUG = "loveflix";
const TITLE = "LoveFlix — A Streaming Service With Exactly One Show On It";
// Intriguing, never spoiling: the copy must never quote a line of the episode.
const DESCRIPTION =
  "Pick your profile, browse a catalogue of your own relationship, and press play on a branching episode where every choice changes the path and none of them are wrong. Top 10 reasons included.";
const SOCIAL_TITLE = "🎬 New episode. One profile. It's yours.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: SOCIAL_TITLE,
    description: "Every route lands in the same place. That's the whole point.",
    url: `${SITE_URL}/${SLUG}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: "Every route lands in the same place. That's the whole point.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
